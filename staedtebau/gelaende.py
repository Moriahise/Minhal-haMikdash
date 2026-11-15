"""Geländeanalyse aus offenen Daten: Relief, Hangneigung, Entwässerung,
Landbedeckung. Der Netz-Zugriff steckt nur in `fenster_laden`; alle
übrigen Funktionen rechnen auf Arrays und sind ohne Netz testbar."""
from __future__ import annotations

import math
from dataclasses import dataclass

import numpy as np
from scipy import ndimage as ndi

from . import config as C


@dataclass
class Ausschnitt:
    """Quadratisches Planfenster in UTM, Nord oben, 10-m-Raster."""
    epsg: int
    x0: float          # Westkante
    y1: float          # Nordkante
    breite: int
    hoehe: int
    pixel: float = C.PIXEL_M

    @property
    def crs(self):
        return f"EPSG:{self.epsg}"

    @property
    def transform(self):
        from rasterio.transform import from_origin
        return from_origin(self.x0, self.y1, self.pixel, self.pixel)

    @property
    def y0(self):
        return self.y1 - self.hoehe * self.pixel

    def lokal(self, zeile, spalte):
        """Pixel -> lokale Meter (x nach Osten, y nach Norden, Ursprung SW)."""
        return (np.asarray(spalte) + 0.5) * self.pixel, (self.hoehe - np.asarray(zeile) - 0.5) * self.pixel

    def pixel_von_lonlat(self, lon, lat):
        from rasterio.warp import transform
        x, y = transform("EPSG:4326", self.crs, [lon], [lat])
        return (self.y1 - y[0]) / self.pixel - 0.5, (x[0] - self.x0) / self.pixel - 0.5

    def lonlat(self, zeile, spalte):
        from rasterio.warp import transform
        x = self.x0 + (spalte + 0.5) * self.pixel
        y = self.y1 - (zeile + 0.5) * self.pixel
        lon, lat = transform(self.crs, "EPSG:4326", [x], [y])
        return float(lon[0]), float(lat[0])

    def bbox_lonlat(self):
        from rasterio.warp import transform_bounds
        return transform_bounds(self.crs, "EPSG:4326", self.x0, self.y0,
                                self.x0 + self.breite * self.pixel, self.y1, densify_pts=11)


def ausschnitt_um(lon: float, lat: float, px: int = C.FENSTER_PX, pixel: float = C.PIXEL_M) -> Ausschnitt:
    from rasterio.warp import transform
    x, y = transform("EPSG:4326", f"EPSG:{C.EPSG}", [lon], [lat])
    halb = px * pixel / 2
    return Ausschnitt(C.EPSG, round((x[0] - halb) / pixel) * pixel,
                      round((y[0] + halb) / pixel) * pixel, px, px, pixel)


def ausschnitt_bbox(bbox, pixel: float = 30.0) -> Ausschnitt:
    from rasterio.warp import transform_bounds
    w, s, e, n = transform_bounds("EPSG:4326", f"EPSG:{C.EPSG}", *bbox, densify_pts=11)
    return Ausschnitt(C.EPSG, math.floor(w / pixel) * pixel, math.ceil(n / pixel) * pixel,
                      int((e - w) // pixel), int((n - s) // pixel), pixel)


def fenster_laden(a: Ausschnitt) -> tuple[np.ndarray, np.ndarray]:
    """-> (Höhenmodell Copernicus GLO-30, Landbedeckung ESA WorldCover)"""
    from prospektion import daten
    bbox = a.bbox_lonlat()
    dem = daten.dem_lesen(bbox, a)
    wc = daten.worldcover_lesen(bbox, a)
    if not np.isfinite(dem).any():
        raise RuntimeError("kein Höhenmodell für diesen Ausschnitt")
    dem = np.where(np.isfinite(dem), dem, np.nanmedian(dem))
    return dem.astype(np.float32), wc


# ------------------------------------------------------------------ Relief

def glaetten(dem: np.ndarray, sigma_px: float = 2.0) -> np.ndarray:
    return ndi.gaussian_filter(dem.astype(np.float32), sigma_px, mode="nearest")


def hang_prozent(z: np.ndarray, pixel: float) -> np.ndarray:
    gy, gx = np.gradient(z, pixel)
    return (np.hypot(gx, gy) * 100).astype(np.float32)


def schummerung(z: np.ndarray, pixel: float, azimut=315.0, hoehe=45.0) -> np.ndarray:
    gy, gx = np.gradient(z, pixel)
    neig = np.arctan(2.0 * np.hypot(gx, gy))          # 2-fach überhöht
    exp = np.arctan2(gy, -gx)
    az, ho = math.radians(360 - azimut + 90), math.radians(hoehe)
    s = np.sin(ho) * np.cos(neig) + np.cos(ho) * np.sin(neig) * np.cos(az - exp)
    return np.clip(s, 0, 1).astype(np.float32)


def reliefbild(z: np.ndarray, pixel: float) -> np.ndarray:
    """Höhenschichtenfarben (Kalkstein-/Wüstentöne) mal Schummerung -> RGB."""
    lo, hi = float(z.min()), float(z.max())
    t = (z - lo) / max(hi - lo, 1.0)
    stufen = np.array([[196, 205, 170], [222, 214, 180], [232, 216, 178], [224, 196, 156],
                       [206, 172, 136], [238, 232, 220]], np.float32)
    idx = t * (len(stufen) - 1)
    i0 = np.clip(idx.astype(int), 0, len(stufen) - 2)
    f = (idx - i0)[..., None]
    farbe = stufen[i0] * (1 - f) + stufen[i0 + 1] * f
    s = 0.55 + 0.6 * schummerung(z, pixel)[..., None]
    rgb = np.clip(farbe * s, 0, 255)
    return (np.round(rgb / 8) * 8).clip(0, 255).astype(np.uint8)


# ------------------------------------------------------------- Entwässerung

_NACHBARN = [(-1, -1), (-1, 0), (-1, 1), (0, -1), (0, 1), (1, -1), (1, 0), (1, 1)]


def abfluss(z: np.ndarray, faktor: int = 3) -> tuple[np.ndarray, np.ndarray, np.ndarray]:
    """D8-Abflussakkumulation auf grobem Raster.
    -> (Akkumulation in Zellen, Zielzeile, Zielspalte); Ziel = -1 für Senken/Rand."""
    g = ndi.gaussian_filter(z, faktor * 0.6)[::faktor, ::faktor].astype(np.float64)
    h, w = g.shape
    ziel_z = np.full((h, w), -1, np.int32)
    ziel_s = np.full((h, w), -1, np.int32)
    bestes = np.zeros((h, w))
    for dz, ds in _NACHBARN:
        nach = np.full((h, w), np.inf)
        zs = slice(max(0, -dz), h - max(0, dz))
        ss = slice(max(0, -ds), w - max(0, ds))
        zn = slice(max(0, dz), h - max(0, -dz))
        sn = slice(max(0, ds), w - max(0, -ds))
        nach[zs, ss] = g[zn, sn]
        gef = (g - nach) / math.hypot(dz, ds)
        besser = gef > bestes
        bestes[besser] = gef[besser]
        zz, ss_ = np.nonzero(besser)
        ziel_z[zz, ss_] = zz + dz
        ziel_s[zz, ss_] = ss_ + ds
    akk = np.ones((h, w))
    for i in np.argsort(-g, axis=None):
        r, c = divmod(int(i), w)
        if ziel_z[r, c] >= 0:
            akk[ziel_z[r, c], ziel_s[r, c]] += akk[r, c]
    return akk, ziel_z, ziel_s


def wadis(z: np.ndarray, pixel: float, faktor: int = 3) -> tuple[np.ndarray, list[dict]]:
    """-> (Wadi-Maske im feinen Raster, Linien [{pixel: [(z, s)…], einzug_km2}])"""
    akk, tz, ts = abfluss(z, faktor)
    zelle_km2 = (pixel * faktor) ** 2 / 1e6
    schwelle = C.WADI_EINZUG_KM2 / zelle_km2
    rinne = akk >= schwelle
    h, w = rinne.shape
    zufluss = np.zeros((h, w), np.int32)
    zz, ss = np.nonzero(rinne & (tz >= 0))
    np.add.at(zufluss, (tz[zz, ss], ts[zz, ss]), rinne[zz, ss].astype(np.int32))
    linien, besucht = [], np.zeros((h, w), bool)
    koepfe = sorted(zip(*np.nonzero(rinne & (zufluss == 0))), key=lambda p: -akk[p])
    for r, c in koepfe:
        pfad = []
        while r >= 0 and rinne[r, c]:
            pfad.append((r, c))
            if besucht[r, c]:
                break
            besucht[r, c] = True
            r, c = int(tz[r, c]), int(ts[r, c])
        if len(pfad) >= 4:
            linien.append({"pixel": [((p[0] + 0.5) * faktor - 0.5, (p[1] + 0.5) * faktor - 0.5)
                                     for p in pfad],
                           "einzug_km2": round(float(akk[pfad[-1]] * zelle_km2), 2)})
    fein = np.kron(rinne, np.ones((faktor, faktor), bool))[:z.shape[0], :z.shape[1]]
    maske = np.zeros(z.shape, bool)
    maske[:fein.shape[0], :fein.shape[1]] = fein
    return maske, linien


def hoehenlinien(z: np.ndarray, abstand: float) -> list[tuple[float, np.ndarray]]:
    """-> [(Höhe, Punkte (n,2) in Pixelkoordinaten (Spalte, Zeile))]"""
    import contourpy
    gen = contourpy.contour_generator(z=z.astype(np.float64))
    lo = math.ceil(float(z.min()) / abstand) * abstand
    out = []
    for hoehe in np.arange(lo, float(z.max()), abstand):
        for linie in gen.lines(float(hoehe)):
            if len(linie) >= 8:
                out.append((float(hoehe), linie[::3] if len(linie) > 30 else linie))
    return out
