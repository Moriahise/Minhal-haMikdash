"""Datenzugriff – ausschließlich offene, frei lizenzierte Quellen:

* Sentinel-2 L2A (Copernicus/ESA) als COG über den STAC-Katalog Earth Search
* Copernicus DEM GLO-30 (ESA)
* ESA WorldCover 10 m 2021 v200
* OpenStreetMap (Geofabrik-Extrakt, siehe osm.py) – Infrastruktur und Fundstellen
* Wikidata – Fundstellenkatalog mit Perioden
"""
from __future__ import annotations

import datetime as dt
import math
import time
from concurrent.futures import ThreadPoolExecutor
from dataclasses import dataclass

import numpy as np
import rasterio
import requests
from rasterio.enums import Resampling
from rasterio.transform import from_origin
from rasterio.vrt import WarpedVRT
from rasterio.warp import transform as warp_transform
from rasterio.warp import transform_bounds
from rasterio.windows import from_bounds

from . import config as C

GDAL_ENV = dict(
    GDAL_DISABLE_READDIR_ON_OPEN="EMPTY_DIR",
    CPL_VSIL_CURL_ALLOWED_EXTENSIONS=".tif,.TIF",
    GDAL_HTTP_MAX_RETRY="5",
    GDAL_HTTP_RETRY_DELAY="2",
    GDAL_HTTP_TIMEOUT="90",
    GDAL_HTTP_MERGE_CONSECUTIVE_RANGES="YES",
    VSI_CACHE="TRUE",
)

BAENDER = ("blue", "green", "red", "nir", "swir16", "swir22")


@dataclass
class Raster:
    """Analyseraster einer Kachel im UTM-System der Sentinel-2-Szenen."""
    epsg: int
    transform: rasterio.Affine
    breite: int
    hoehe: int

    @property
    def bounds(self):
        x0, y1 = self.transform.c, self.transform.f
        return (x0, y1 - self.hoehe * C.PIXEL_M, x0 + self.breite * C.PIXEL_M, y1)

    @property
    def crs(self):
        return f"EPSG:{self.epsg}"

    def lonlat(self, zeile: float, spalte: float) -> tuple[float, float]:
        x, y = self.transform * (spalte + 0.5, zeile + 0.5)
        lon, lat = warp_transform(self.crs, "EPSG:4326", [x], [y])
        return float(lon[0]), float(lat[0])

    def zeile_spalte(self, lon: float, lat: float) -> tuple[int, int]:
        x, y = warp_transform("EPSG:4326", self.crs, [lon], [lat])
        s, z = (~self.transform) * (float(x[0]), float(y[0]))
        return int(math.floor(z)), int(math.floor(s))


def raster_fuer(bbox, epsg: int) -> Raster:
    w, s, e, n = transform_bounds("EPSG:4326", f"EPSG:{epsg}", *bbox, densify_pts=21)
    r = C.RAND_M
    x0 = math.floor((w - r) / 20) * 20
    y1 = math.ceil((n + r) / 20) * 20
    x1 = math.ceil((e + r) / 20) * 20
    y0 = math.floor((s - r) / 20) * 20
    return Raster(epsg, from_origin(x0, y1, C.PIXEL_M, C.PIXEL_M),
                  int((x1 - x0) / C.PIXEL_M), int((y1 - y0) / C.PIXEL_M))


# ---------------------------------------------------------------- HTTP

def _http(method: str, url: str, versuche: int = 4, **kw):
    kw.setdefault("timeout", 120)
    kw.setdefault("headers", {})["User-Agent"] = C.USER_AGENT
    fehler = None
    for i in range(versuche):
        try:
            r = requests.request(method, url, **kw)
            if r.status_code in (429, 500, 502, 503, 504):
                raise requests.HTTPError(f"HTTP {r.status_code}")
            r.raise_for_status()
            return r
        except Exception as e:  # noqa: BLE001 – Netzfehler werden wiederholt
            fehler = e
            time.sleep(2 + 4 * i)
    raise RuntimeError(f"{url}: {fehler}")


# ------------------------------------------------------------ Sentinel-2

def _punkt_in_polygon(x, y, ring) -> bool:
    drin = False
    for (x1, y1), (x2, y2) in zip(ring, ring[1:]):
        if (y1 > y) != (y2 > y) and x < (x2 - x1) * (y - y1) / (y2 - y1) + x1:
            drin = not drin
    return drin


def _deckt_ab(item, bbox) -> bool:
    g = item.get("geometry") or {}
    if g.get("type") == "Polygon":
        ringe = [g["coordinates"][0]]
    elif g.get("type") == "MultiPolygon":
        ringe = [p[0] for p in g["coordinates"]]
    else:
        return False
    w, s, e, n = bbox
    ecken = [(w, s), (w, n), (e, s), (e, n)]
    return any(all(_punkt_in_polygon(x, y, [tuple(p[:2]) for p in ring])
                   for x, y in ecken) for ring in ringe)


def saisonfenster(heute: dt.date) -> dict[str, list[tuple[dt.date, dt.date]]]:
    """Je Saison die N jüngsten vollständig abgeschlossenen Zeitfenster."""
    out = {}
    for name, ((m1, d1), (m2, d2)) in C.SAISONS.items():
        fenster, jahr = [], heute.year
        while len(fenster) < C.JAHRE_ZURUECK:
            a, b = dt.date(jahr, m1, d1), dt.date(jahr, m2, d2)
            if b < heute:
                fenster.append((a, b))
            jahr -= 1
        out[name] = fenster
    return out


def szenen_suchen(bbox, heute: dt.date) -> dict[str, list[dict]]:
    """Wählt je Saison und Jahr die wolkenärmste Szene, die die Kachel
    vollständig abdeckt. Alle Szenen einer Kachel teilen ein UTM-Raster."""
    kandidaten = {}
    for saison, fenster in saisonfenster(heute).items():
        for a, b in fenster:
            body = {
                "collections": ["sentinel-2-l2a"], "bbox": list(bbox), "limit": 30,
                "datetime": f"{a}T00:00:00Z/{b}T23:59:59Z",
                "query": {"eo:cloud_cover": {"lt": C.MAX_WOLKEN}},
                "sortby": [{"field": "properties.eo:cloud_cover", "direction": "asc"}],
            }
            feats = _http("POST", C.STAC_URL, json=body).json().get("features", [])
            kandidaten[(saison, a.year)] = [f for f in feats if _deckt_ab(f, bbox) and all(
                str(f["assets"].get(x, {}).get("href", "")).startswith("https://")
                and f["assets"][x]["href"].lower().endswith(".tif") for x in ("scl",) + BAENDER)]
    epsgs = {}
    for fs in kandidaten.values():
        for f in fs:
            e = f["properties"].get("proj:epsg") or int(
                str(f["properties"].get("proj:code", "EPSG:0")).split(":")[1])
            f["_epsg"] = e
            epsgs[e] = epsgs.get(e, 0) + 1
    if not epsgs:
        return {s: [] for s in C.SAISONS}
    epsg = max(epsgs, key=epsgs.get)
    out = {s: [] for s in C.SAISONS}
    for (saison, _), fs in sorted(kandidaten.items(), key=lambda kv: -kv[0][1]):
        fs = [f for f in fs if f["_epsg"] == epsg]
        if fs:
            out[saison].append(fs[0])
    return out


def _lies_fenster(href: str, ra: Raster, resampling, versuche: int = 4) -> np.ndarray:
    for i in range(versuche):
        try:
            with rasterio.Env(**GDAL_ENV), rasterio.open(href) as ds:
                win = from_bounds(*ra.bounds, transform=ds.transform)
                return ds.read(1, window=win, out_shape=(ra.hoehe, ra.breite),
                               resampling=resampling, boundless=True, fill_value=0)
        except rasterio.errors.RasterioError:  # vorübergehende Netzfehler
            if i == versuche - 1:
                raise
            time.sleep(3 + 5 * i)


def _boa_offset(item) -> float:
    p = item["properties"]
    if p.get("earthsearch:boa_offset_applied", True):
        return 0.0
    try:
        return 1000.0 if float(p.get("s2:processing_baseline", "0")) >= 4.0 else 0.0
    except ValueError:
        return 0.0


def szene_lesen(item, ra: Raster) -> np.ndarray:
    """-> Reflektanz (6, H, W), ungültige Pixel = NaN."""
    def lade(b):
        res = Resampling.nearest if b == "scl" else Resampling.bilinear
        return _lies_fenster(item["assets"][b]["href"], ra, res)

    with ThreadPoolExecutor(7) as ex:
        scl, *dn = ex.map(lade, ("scl",) + BAENDER)
    stapel = np.stack(dn).astype(np.float32)
    gueltig = ~np.isin(scl, C.SCL_UNGUELTIG) & (stapel > 0).all(0)
    stapel = (stapel - _boa_offset(item)) / 10000.0
    stapel[:, ~gueltig] = np.nan
    return stapel


def komposit(items, ra: Raster) -> tuple[np.ndarray, np.ndarray]:
    """Pixelweiser Median über die Szenen einer Saison (robust gegen
    Restwolken, Schatten, Einzelereignisse). -> (Komposit, Anzahl gültig)."""
    with ThreadPoolExecutor(2) as ex:
        szenen = list(ex.map(lambda it: szene_lesen(it, ra), items))
    st = np.stack(szenen)
    n = np.isfinite(st[:, 0]).sum(0)
    import warnings
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", RuntimeWarning)
        med = np.nanmedian(st, axis=0)
    return med.astype(np.float32), n.astype(np.uint8)


# ------------------------------------------------------- DEM / WorldCover

def _warp(url: str, ra: Raster, resampling, dtype) -> tuple[np.ndarray, np.ndarray] | None:
    try:
        with rasterio.Env(**GDAL_ENV), rasterio.open(url) as ds:
            with WarpedVRT(ds, crs=ra.crs, transform=ra.transform, width=ra.breite,
                           height=ra.hoehe, resampling=resampling, add_alpha=True) as vrt:
                return vrt.read(1).astype(dtype), vrt.read(vrt.count) > 0
    except rasterio.errors.RasterioIOError as e:
        if "404" in str(e) or "does not exist" in str(e):
            return None      # Kachel existiert nicht (z. B. Meer)
        raise


def dem_lesen(bbox, ra: Raster) -> np.ndarray:
    w, s, e, n = bbox
    out = np.full((ra.hoehe, ra.breite), np.nan, np.float32)
    for lat in range(math.floor(s - 0.01), math.floor(n + 0.01) + 1):
        for lon in range(math.floor(w - 0.01), math.floor(e + 0.01) + 1):
            name = (f"Copernicus_DSM_COG_10_{'N' if lat >= 0 else 'S'}{abs(lat):02d}_00_"
                    f"{'E' if lon >= 0 else 'W'}{abs(lon):03d}_00_DEM")
            res = _warp(C.DEM_URL.format(n=name), ra, Resampling.bilinear, np.float32)
            if res:
                a, m = res
                out[m & np.isnan(out)] = a[m & np.isnan(out)]
    return out


def worldcover_lesen(bbox, ra: Raster) -> np.ndarray:
    w, s, e, n = bbox
    out = np.zeros((ra.hoehe, ra.breite), np.uint8)
    for lat in {math.floor((s - 0.01) / 3) * 3, math.floor((n + 0.01) / 3) * 3}:
        for lon in {math.floor((w - 0.01) / 3) * 3, math.floor((e + 0.01) / 3) * 3}:
            t = f"{'N' if lat >= 0 else 'S'}{abs(lat):02d}{'E' if lon >= 0 else 'W'}{abs(lon):03d}"
            res = _warp(C.WC_URL.format(t=t), ra, Resampling.nearest, np.uint8)
            if res:
                a, m = res
                out[m & (out == 0)] = a[m & (out == 0)]
    return out


# --------------------------------------------------------------- Wikidata

_WD_Q = """SELECT ?s (SAMPLE(?c) AS ?coord)
 (GROUP_CONCAT(DISTINCT ?l; separator="|") AS ?namen)
 (GROUP_CONCAT(DISTINCT ?tl; separator="|") AS ?typen)
 (GROUP_CONCAT(DISTINCT ?pl; separator="|") AS ?perioden) WHERE {
 SERVICE wikibase:box { ?s wdt:P625 ?c .
   bd:serviceParam wikibase:cornerSouthWest "Point(%f %f)"^^geo:wktLiteral .
   bd:serviceParam wikibase:cornerNorthEast "Point(%f %f)"^^geo:wktLiteral . }
 VALUES ?wurzel { wd:Q839954 wd:Q15661340 wd:Q109607 }
 ?s wdt:P31 ?t . ?t wdt:P279* ?wurzel .
 OPTIONAL { ?s rdfs:label ?l . FILTER(LANG(?l) IN ("de","en","he")) }
 OPTIONAL { ?t rdfs:label ?tl . FILTER(LANG(?tl)="de") }
 OPTIONAL { { ?s wdt:P2348 ?p } UNION { ?s wdt:P2596 ?p } UNION { ?s wdt:P361 ?p . ?p wdt:P31/wdt:P279* wd:Q11514315 }
            ?p rdfs:label ?pl . FILTER(LANG(?pl)="en") }
} GROUP BY ?s"""


def wikidata_lesen(bbox) -> list[dict] | None:
    w, s, e, n = bbox
    m = 0.03
    try:
        r = _http("GET", C.WIKIDATA_URL, params={
            "query": _WD_Q % (w - m, s - m, e + m, n + m), "format": "json"})
        zeilen = r.json()["results"]["bindings"]
    except Exception:  # noqa: BLE001
        return None
    orte = []
    for z in zeilen:
        try:
            lon, lat = z["coord"]["value"].replace("Point(", "").rstrip(")").split()
        except (KeyError, ValueError):
            continue
        spl = lambda k: [x for x in z.get(k, {}).get("value", "").split("|") if x]  # noqa: E731
        orte.append({"quelle": "Wikidata", "ref": z["s"]["value"].rsplit("/", 1)[-1],
                     "lon": float(lon), "lat": float(lat), "namen": spl("namen"),
                     "typ": ", ".join(spl("typen")[:3]), "perioden_roh": spl("perioden")})
    return orte
