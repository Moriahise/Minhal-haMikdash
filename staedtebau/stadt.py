"""Vom Ort zum Plan: Daten laden, Standort bestimmen, Entwurf erzeugen."""
from __future__ import annotations

import json
from pathlib import Path

import numpy as np

from . import config as C
from . import entwurf, gelaende


def _seker(wurzel: Path) -> tuple[list, list]:
    """Fundstellen und hoch gereihte Kandidaten aus dem Seker-Katalog."""
    def lade(name):
        p = wurzel / "seker/data" / name
        return json.loads(p.read_text("utf-8"))["features"] if p.exists() else []
    return lade("fundorte.geojson"), [f for f in lade("kandidaten.geojson")
                                      if f["properties"]["score"] >= 70]


def _im_fenster(a, lon, lat, rand=5):
    z, s = a.pixel_von_lonlat(lon, lat)
    return (z, s) if rand <= z < a.hoehe - rand and rand <= s < a.breite - rand else None


def _osm(a, osm_index):
    """-> (Sperrflächen-Raster | None, Pixel bestehender Hauptstraßen | None)"""
    if osm_index is None:
        return None, None
    from rasterio.features import rasterize
    from rasterio.warp import transform_geom
    from prospektion import osm
    w, s, e, n = a.bbox_lonlat()
    b = osm_index["boxen"]
    treffer = np.nonzero((b[:, 2] >= w) & (b[:, 0] <= e) & (b[:, 3] >= s) & (b[:, 1] <= n))[0]
    form = (a.hoehe, a.breite)

    def rast(art, polygon, nur_haupt=False):
        geoms = [transform_geom("EPSG:4326", a.crs, {
            "type": "Polygon" if polygon else "LineString",
            "coordinates": [osm_index["wege"][i].astype(float).tolist()] if polygon
            else osm_index["wege"][i].astype(float).tolist()}) for i in treffer
            if osm_index["arten"][i] == art and (not nur_haupt or osm_index["haupt"][i])]
        if not geoms:
            return np.zeros(form, bool)
        return rasterize(geoms, out_shape=form, transform=a.transform, all_touched=True, dtype="uint8").astype(bool)

    sperre = rast(osm.FLAECHE, True) | rast(osm.SCHUTZ, True)
    return sperre, np.argwhere(rast(osm.BREIT, False, nur_haupt=True))


def standort_suchen(such: dict, osm_index=None) -> tuple[float, float, dict]:
    """Sucht im Suchraum den besten Platz für eine völlig neue Stadt:
    viel flaches, unbewaldetes, unbebautes Land im 1-km-Umkreis, 1,5–6 km
    von bestehender Bebauung (Anschluss ja, Zersiedelung nein)."""
    from scipy import ndimage as ndi
    from scipy import signal
    a = gelaende.ausschnitt_bbox(such["bbox"], 30.0)
    dem, wc = gelaende.fenster_laden(a)
    z = gelaende.glaetten(dem, 1.5)
    hang = gelaende.hang_prozent(z, a.pixel)
    sperre, _ = _osm(a, osm_index)
    frei = (hang < 15) & ~np.isin(wc, (10, 50, 80, 90, 95))
    if sperre is not None:
        frei &= ~sperre
    eignung = frei * np.where(wc == 40, 0.5, 1.0) * np.clip(1.2 - hang / 15, 0.2, 1)
    land = signal.fftconvolve(eignung.astype(np.float32), entwurf._scheibe(int(1000 / a.pixel)), mode="same")
    d_bebaut = ndi.distance_transform_edt(wc != 50) * a.pixel if (wc == 50).any() else np.full(wc.shape, 3000.0)
    naehe = np.clip((d_bebaut - 800) / 700, 0, 1) * np.clip(1.3 - d_bebaut / 9000, 0.3, 1)
    wert = land * naehe
    r = int(2600 / a.pixel)
    wert[:r] = wert[-r:] = 0
    wert[:, :r] = wert[:, -r:] = 0
    i = int(np.argmax(wert))
    zr, zs = divmod(i, a.breite)
    lon, lat = a.lonlat(zr, zs)
    return lon, lat, {"eignung_1km": round(float(land[zr, zs]), 2),
                      "abstand_bebauung_km": round(float(d_bebaut[zr, zs]) / 1000, 1),
                      "hang_pct": round(float(hang[zr, zs]), 1),
                      "schutzgebiete_geprueft": sperre is not None}


def planen(ort: dict, wurzel: Path, osm_index=None, log=print) -> dict:
    """Erzeugt Plan und Bilder für einen Ort und schreibt sie nach blaupause/data/staedte/."""
    from prospektion.png import schreibe_png
    davidisch = "antik" in ort
    suche = None
    if davidisch:
        a0 = gelaende.ausschnitt_um(ort["lon"], ort["lat"])
        dem0, wc0 = gelaende.fenster_laden(a0)
        az, as_ = a0.pixel_von_lonlat(ort["lon"], ort["lat"])
        haupt = {"zeile": az, "spalte": as_, "radius": ort["kern_m"], "puffer": C.DENKMAL_PUFFER_M}
        sperre0, _ = _osm(a0, osm_index)
        R0 = entwurf.restriktionen(a0, dem0, wc0, [haupt], sperre0)
        zr, zs, _ = entwurf.zentrum_finden(a0, R0, (az, as_), ort["kern_m"])
        lon, lat = a0.lonlat(zr, zs)
    else:
        lon, lat, suche = standort_suchen(ort, osm_index)
    # Planfenster auf das Stadtzentrum zentrieren
    a = gelaende.ausschnitt_um(lon, lat)
    dem, wc = gelaende.fenster_laden(a)
    sperre, strassen = _osm(a, osm_index)
    denkmale = []
    if davidisch:
        p = _im_fenster(a, ort["lon"], ort["lat"])
        if p:
            denkmale.append({"name": f"{ort['antik']} ({ort['name']})", "art": "hauptdenkmal", "haupt": True,
                             "zeile": p[0], "spalte": p[1], "radius": ort["kern_m"], "puffer": C.DENKMAL_PUFFER_M})
    fundorte, kandidaten = _seker(wurzel)
    for f in fundorte:
        fl, fb = f["geometry"]["coordinates"]
        p = _im_fenster(a, fl, fb)
        if p and all(np.hypot(p[0] - d["zeile"], p[1] - d["spalte"]) * a.pixel > d["radius"] for d in denkmale):
            denkmale.append({"name": f["properties"]["name"], "art": "fundstelle", "zeile": p[0], "spalte": p[1],
                             "radius": C.FUNDSTELLE_RADIUS_M, "puffer": 40})
    verdacht = []
    for f in kandidaten:
        fl, fb = f["geometry"]["coordinates"]
        p = _im_fenster(a, fl, fb)
        if p:
            verdacht.append({"id": f["properties"]["id"], "score": f["properties"]["score"], "zeile": p[0], "spalte": p[1]})
    if not davidisch:
        R = entwurf.restriktionen(a, dem, wc, denkmale, sperre)
        zr, zs, _ = entwurf.zentrum_finden(a, R, rand_m=1700)
    else:
        zr, zs = a.hoehe / 2 - 0.5, a.breite / 2 - 0.5
    plan, relief, analyse = entwurf.entwerfen(a, dem, wc, ort, (int(round(zr)), int(round(zs))), denkmale,
                                              sperre, strassen, verdacht)
    plan.update({"id": ort["id"], "name": ort["name"], "he": ort.get("he", ""),
                 "art": "davidisch" if davidisch else "neu", "antik": ort.get("antik"),
                 "bezug": ort["bezug"], "ziel_ew": ort["ziel_ew"], "regen_mm": ort["regen_mm"],
                 "osm": osm_index is not None, "standortsuche": suche, "hinweis": ort.get("hinweis"),
                 "osm_stand": (osm_index or {}).get("stand")})
    if davidisch:
        plan["antik_lonlat"] = [ort["lon"], ort["lat"]]
    ziel = wurzel / "blaupause/data/staedte"
    ziel.mkdir(parents=True, exist_ok=True)
    (ziel / f"{ort['id']}.json").write_text(json.dumps(plan, ensure_ascii=False, separators=(",", ":")), "utf-8")
    schreibe_png(ziel / f"{ort['id']}_relief.png", relief)
    schreibe_png(ziel / f"{ort['id']}_analyse.png", analyse)
    k = plan["kennzahlen"]
    log(f"[plan] {ort['id']:<15} {k['einwohner']:>6} EW in {k['ringe']} Ringen, {k['gebaeude']} Gebäude, "
        f"{len(plan['bloecke'])} Blöcke, Zielerreichung {k['zielerreichung']:.0%}")
    return plan


def ort_von_id(oid: str) -> dict:
    return next(o for o in C.DAVIDISCH + C.SUCHRAEUME if o["id"] == oid)
