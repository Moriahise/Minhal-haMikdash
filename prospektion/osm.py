"""OpenStreetMap aus den wöchentlichen Geofabrik-Extrakten für Israel/Palästina
und Jordanien (ODbL).

Liefert (a) die Maske moderner Infrastruktur und (b) in OSM kartierte
Fundstellen. Der Extrakt wird je Lauf einmal geladen und indiziert; fällt
er aus, läuft die Analyse ohne OSM-Maske weiter und kennzeichnet das.
"""
from __future__ import annotations

import pickle
import time
from pathlib import Path

import numpy as np
import requests

from . import config as C

URL = "https://download.geofabrik.de/asia/{name}-latest.osm.pbf"
EXTRAKTE = ("israel-and-palestine", "jordan")
_SCHLUESSEL = ("highway", "railway", "aeroway", "power", "man_made", "barrier", "landuse",
               "historic", "leisure", "boundary")
_BREIT = {"motorway", "trunk", "primary", "secondary", "motorway_link", "trunk_link"}
_FLAECHEN = {"quarry", "industrial", "military", "construction", "landfill",
             "greenhouse_horticulture", "residential", "commercial", "cemetery", "railway"}
_HISTORISCH = {"archaeological_site", "ruins", "fort", "city_gate", "tomb"}
SCHMAL, BREIT, FLAECHE = 0, 1, 2
SCHUTZ = 3      # Natur-/Landschaftsschutz: nur für den Städtebau (Blaupause), nicht für die Seker-Maske


def _art(tags) -> int | None:
    if "highway" in tags:
        return BREIT if tags["highway"] in _BREIT else SCHMAL
    if "railway" in tags or "aeroway" in tags:
        return BREIT
    if tags.get("landuse") in _FLAECHEN:
        return FLAECHE
    if tags.get("power") == "line" or tags.get("man_made") == "pipeline" \
            or tags.get("barrier") in ("fence", "wall"):
        return SCHMAL
    return None


def pbf_indizieren(pbf: Path) -> dict:
    import osmium
    w = min(r["bbox"][0] for r in C.REGIONEN) - 0.1
    s = min(r["bbox"][1] for r in C.REGIONEN) - 0.1
    e = max(r["bbox"][2] for r in C.REGIONEN) + 0.1
    n = max(r["bbox"][3] for r in C.REGIONEN) + 0.1
    wege, arten, boxen, orte, haupt = [], [], [], [], []

    def ort(o, lon, lat, typ):
        t = o.tags
        namen = [t[k] for k in ("name:de", "name:en", "name", "name:he") if k in t]
        orte.append({"quelle": "OSM", "ref": f"{typ}/{o.id}", "lon": lon, "lat": lat,
                     "namen": list(dict.fromkeys(namen)), "typ": t["historic"],
                     "perioden_roh": [t[k] for k in ("historic:civilization", "historic:period",
                                                     "historic:era") if k in t]})

    fp = (osmium.FileProcessor(str(pbf)).with_locations()
          .with_filter(osmium.filter.KeyFilter(*_SCHLUESSEL)))
    for o in fp:
        hist = o.tags.get("historic") in _HISTORISCH
        if o.is_node():
            if hist and o.location.valid() and w < o.location.lon < e and s < o.location.lat < n:
                ort(o, o.location.lon, o.location.lat, "node")
            continue
        if not o.is_way():
            continue
        k = np.array([(nd.location.lon, nd.location.lat) for nd in o.nodes
                      if nd.location.valid()], np.float64)
        if len(k) < 2:
            continue
        box = (k[:, 0].min(), k[:, 1].min(), k[:, 0].max(), k[:, 1].max())
        if box[2] < w or box[0] > e or box[3] < s or box[1] > n:
            continue
        if hist:
            ort(o, float(k[:, 0].mean()), float(k[:, 1].mean()), "way")
        art = _art(o.tags)
        geschlossen = len(k) >= 4 and np.array_equal(k[0], k[-1])
        if art is None and geschlossen and (
                o.tags.get("leisure") == "nature_reserve"
                or o.tags.get("boundary") in ("protected_area", "national_park")):
            art = SCHUTZ
        if art is None:
            continue
        if art == FLAECHE and not geschlossen:
            art = SCHMAL
        wege.append(k.astype(np.float32))
        arten.append(art)
        boxen.append(box)
        haupt.append(o.tags.get("highway") in _BREIT)
    return {"wege": wege, "arten": np.array(arten, np.uint8), "haupt": np.array(haupt, bool),
            "boxen": np.array(boxen, np.float64).reshape(-1, 4), "orte": orte}


def _extrakt(name: str, cache: Path, max_alter_tage: float) -> dict:
    pbf, pkl = cache / f"{name}-latest.osm.pbf", cache / f"{name}-index-v2.pkl"
    if not pbf.exists() or time.time() - pbf.stat().st_mtime > max_alter_tage * 86400:
        with requests.get(URL.format(name=name), stream=True, timeout=120,
                          headers={"User-Agent": C.USER_AGENT}) as r:
            r.raise_for_status()
            tmp = pbf.with_suffix(".teil")
            with open(tmp, "wb") as f:
                for block in r.iter_content(1 << 20):
                    f.write(block)
            tmp.replace(pbf)
        pkl.unlink(missing_ok=True)
    if pkl.exists() and pkl.stat().st_mtime >= pbf.stat().st_mtime:
        return pickle.loads(pkl.read_bytes())
    idx = pbf_indizieren(pbf)
    idx["stand"] = time.strftime("%Y-%m-%d", time.gmtime(pbf.stat().st_mtime))
    pkl.write_bytes(pickle.dumps(idx, protocol=4))
    return idx


def index_laden(cache: Path, log=print, max_alter_tage: float = 6) -> dict | None:
    """Lädt alle Extrakte (falls nötig) und gibt den vereinigten Index zurück.
    Fehlt auch nur einer, gibt es None: eine halbe Maske wäre irreführend."""
    try:
        cache.mkdir(parents=True, exist_ok=True)
        t = time.time()
        teile = [_extrakt(n, cache, max_alter_tage) for n in EXTRAKTE]
        idx = {"wege": [w for i in teile for w in i["wege"]],
               "arten": np.concatenate([i["arten"] for i in teile]),
               "haupt": np.concatenate([i["haupt"] for i in teile]),
               "boxen": np.concatenate([i["boxen"] for i in teile]),
               "orte": [o for i in teile for o in i["orte"]],
               "stand": min(i["stand"] for i in teile)}
        log(f"OSM bereit: {len(idx['wege'])} Wege, {len(idx['orte'])} Fundstellen aus "
            f"{len(teile)} Extrakten ({time.time() - t:.0f} s)")
        return idx
    except Exception as e:  # noqa: BLE001 – OSM ist optional
        log(f"[WARNUNG] OSM-Extrakt nicht verfügbar ({e}); Analyse ohne OSM-Maske.")
        return None


def kachel(idx: dict | None, bbox, ra) -> tuple[np.ndarray | None, list[dict]]:
    """-> (Maske moderner Infrastruktur im Kachelraster | None, Fundstellen)"""
    if idx is None:
        return None, []
    from rasterio.features import rasterize
    from rasterio.warp import transform_geom
    from scipy.ndimage import binary_dilation
    w, s, e, n = bbox
    m = 0.03
    b = idx["boxen"]
    treffer = np.nonzero((b[:, 2] >= w - m) & (b[:, 0] <= e + m)
                         & (b[:, 3] >= s - m) & (b[:, 1] <= n + m))[0] if len(b) else []
    maske = np.zeros((ra.hoehe, ra.breite), bool)
    for art, puffer in ((SCHMAL, 1), (BREIT, 3), (FLAECHE, 2)):
        geoms = []
        for i in treffer:
            if idx["arten"][i] != art:
                continue
            k = idx["wege"][i].astype(float).tolist()
            geoms.append({"type": "Polygon", "coordinates": [k]} if art == FLAECHE
                         else {"type": "LineString", "coordinates": k})
        if geoms:
            proj = [transform_geom("EPSG:4326", ra.crs, g) for g in geoms]
            a = rasterize(proj, out_shape=maske.shape, transform=ra.transform,
                          all_touched=True, dtype="uint8").astype(bool)
            maske |= binary_dilation(a, iterations=puffer)
    orte = [dict(o) for o in idx["orte"]
            if w - m <= o["lon"] <= e + m and s - m <= o["lat"] <= n + m]
    return maske, orte
