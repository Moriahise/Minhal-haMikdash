"""Laufsteuerung: Kachelauswahl, Verarbeitung, fortgeschriebener Katalog."""
from __future__ import annotations

import datetime as dt
import json
import math
import platform
import subprocess
import time
import traceback
import zlib
from pathlib import Path

import numpy as np
from scipy import ndimage as ndi

from . import __version__, analyse, bericht, daten, fundorte, osm
from . import config as C
from .png import schreibe_png


# ------------------------------------------------------------- Dateien

def _lade(p: Path, standard):
    return json.loads(p.read_text("utf-8")) if p.exists() else standard


def _json_rein(o):
    """NaN/Inf sind kein gültiges JSON (Browser lehnen sie ab) -> null."""
    if isinstance(o, float):
        return o if math.isfinite(o) else None
    if isinstance(o, dict):
        return {k: _json_rein(v) for k, v in o.items()}
    if isinstance(o, (list, tuple)):
        return [_json_rein(v) for v in o]
    return o


def _schreibe(p: Path, obj, kompakt=False) -> None:
    p.parent.mkdir(parents=True, exist_ok=True)
    p.write_text(json.dumps(_json_rein(obj), ensure_ascii=False, allow_nan=False,
                            indent=None if kompakt else 1,
                            separators=(",", ":") if kompakt else None) + "\n", "utf-8")


def _fc(features):
    return {"type": "FeatureCollection", "features": features}


def _punkt(props, lon, lat):
    return {"type": "Feature", "properties": props,
            "geometry": {"type": "Point", "coordinates": [round(lon, 6), round(lat, 6)]}}


# ------------------------------------------------------ Kachelverarbeitung

def _chip(pfad: Path, rgb: np.ndarray, labels: np.ndarray, o: dict) -> None:
    """Links Echtfarben (Spätsommer), rechts mit Objektumriss; 640 × 640 m."""
    r = 32
    z, s = int(round(o["zeile"])), int(round(o["spalte"]))
    h, w = labels.shape
    z0, s0 = min(max(z - r, 0), h - 2 * r), min(max(s - r, 0), w - 2 * r)
    a = rgb[z0:z0 + 2 * r, s0:s0 + 2 * r]
    m = labels[z0:z0 + 2 * r, s0:s0 + 2 * r] == o["label"]
    rand = ndi.binary_dilation(m, iterations=2) & ~ndi.binary_dilation(m, iterations=1)
    b = a.copy()
    b[rand] = (255, 60, 30)
    bild = np.concatenate([a, np.full((2 * r, 1, 3), 255, np.uint8), b], axis=1)
    schreibe_png(pfad, bild)


def _rgb8(k: np.ndarray, gueltig: np.ndarray) -> np.ndarray:
    rgb = np.nan_to_num(k[[2, 1, 0]])
    v = rgb[:, gueltig] if gueltig.any() else rgb.reshape(3, -1)
    lo, hi = np.quantile(v, 0.02), np.quantile(v, 0.98)
    # auf 32 Stufen je Kanal quantisiert: hält die Bildausschnitte im Repository klein
    stufen = np.round(np.clip((rgb - lo) / max(hi - lo, 1e-6), 0, 1) ** 0.8 * 31)
    return (stufen * (255 / 31)).astype(np.uint8).transpose(1, 2, 0)


def kachel_verarbeiten(k: dict, heute: dt.date, chips: Path, osm_index=None) -> dict:
    """Vollständige Analyse einer Kachel. -> Ergebnis-Dict (ohne Seiteneffekte
    außer den Bildausschnitten)."""
    bbox = k["bbox"]
    szenen = daten.szenen_suchen(bbox, heute)
    if min(len(v) for v in szenen.values()) < 2:
        raise RuntimeError("zu wenige wolkenarme Sentinel-2-Szenen: "
                           + ", ".join(f"{s}={len(v)}" for s, v in szenen.items()))
    ra = daten.raster_fuer(bbox, szenen["feucht"][0]["_epsg"])
    feucht, n_f = daten.komposit(szenen["feucht"], ra)
    trocken, n_t = daten.komposit(szenen["trocken"], ra)
    dem = daten.dem_lesen(bbox, ra)
    wc = daten.worldcover_lesen(bbox, ra)
    osm_maske, osm_orte = osm.kachel(osm_index, bbox, ra)
    wd_orte = daten.wikidata_lesen(bbox)

    aus = ndi.binary_dilation(wc == 50, iterations=3) | ndi.binary_dilation(wc == 80, iterations=2)
    aus |= (n_f < 2) | (n_t < 2)
    # Im Spätsommer grün = bewässert oder dichter immergrüner Bestand: dort sind
    # weder Boden- noch Bewuchsmerkmale beobachtbar, Anomalien fast immer modern.
    with np.errstate(divide="ignore", invalid="ignore"):
        ndvi_t = (trocken[3] - trocken[2]) / (trocken[3] + trocken[2])
    aus |= ndi.binary_dilation(ndvi_t > C.NDVI_TROCKEN_MAX, iterations=1)
    if osm_maske is not None:
        aus |= osm_maske
    rp = C.RAND_M // C.PIXEL_M
    innen = np.zeros(aus.shape, bool)
    innen[rp:-rp, rp:-rp] = True

    det = analyse.detektion(feucht, trocken, aus)
    lrm, hang = analyse.relief(dem)
    objs, schwelle, labels = analyse.objekte(det, innen, lrm, hang, wc)

    orte = fundorte.zusammenfuehren(wd_orte, osm_orte)
    orte_px = [ra.zeile_spalte(o["lon"], o["lat"]) for o in orte]
    in_kachel = [bbox[0] <= o["lon"] < bbox[2] and bbox[1] <= o["lat"] < bbox[3] for o in orte]
    val = analyse.validierung(det["rx"], det["gueltig"], innen,
                              [p for p, i in zip(orte_px, in_kachel) if i],
                              seed=zlib.crc32(k["id"].encode()))
    it = iter(val["perzentile"])
    for o, i in zip(orte, in_kachel):
        o["in_kachel"] = i
        o["perzentil"] = next(it) if i else None

    rgb = _rgb8(trocken, det["gueltig"])
    kandidaten = []
    for o in objs:
        if o["score"] < C.MIN_SCORE or len(kandidaten) >= C.MAX_KANDIDATEN_JE_KACHEL:
            break
        lon, lat = ra.lonlat(o["zeile"], o["spalte"])
        # eindeutige Kachelzugehörigkeit; keine Doppelungen innerhalb eines Laufs
        if not (bbox[0] <= lon < bbox[2] and bbox[1] <= lat < bbox[3]) or any(
                fundorte.distanz_m(lon, lat, x["lon"], x["lat"]) <= C.ABGLEICH_M
                for x in kandidaten):
            continue
        nah = sorted(((fundorte.distanz_m(lon, lat, f["lon"], f["lat"]), f) for f in orte),
                     key=lambda x: x[0])
        o.update(lon=lon, lat=lat, deutung=analyse.deutung(o))
        o["naechster_fundort"] = ({"name": nah[0][1]["name"], "distanz_m": round(nah[0][0])}
                                  if nah else None)
        o["bekannt"] = bool(nah and nah[0][0] <= C.BEKANNT_M)
        o["kontext"] = [{"name": f["name"], "distanz_m": round(d), "perioden": f["perioden"],
                         "quelle": f["perioden_quelle"]}
                        for d, f in nah if d <= C.KONTEXT_M and f["perioden"]][:5]
        o["_labels"], o["_rgb"] = labels, rgb
        kandidaten.append(o)

    g = det["gueltig"] & innen
    return {
        "kandidaten": kandidaten, "orte": orte, "chips": chips,
        "meta": {
            "id": k["id"], "region": k["region"], "region_name": k["region_name"],
            "bbox": list(bbox), "status": "ok", "datum": heute.isoformat(), "epsg": ra.epsg,
            "szenen": {s: [{"id": f["id"], "datum": f["properties"]["datetime"][:10],
                            "wolken": round(f["properties"].get("eo:cloud_cover", 0), 1)}
                           for f in fs] for s, fs in szenen.items()},
            "schwelle_rx": round(schwelle, 2),
            "anteil_auswertbar": round(float(g.sum() / max(innen.sum(), 1)), 3),
            "n_objekte_roh": len(objs), "n_kandidaten": len(kandidaten),
            "osm_maske": osm_maske is not None, "wikidata": wd_orte is not None,
            "n_fundorte": int(sum(in_kachel)), "n_kontrollen": val["n_kontrollen"],
            "perzentile": [{"name": o["name"], "p": round(o["perzentil"], 3)}
                           for o in orte if o.get("perzentil") is not None],
        },
    }


# --------------------------------------------------------------- Katalog

def _itm(lon, lat) -> list[int]:
    """Israel Transverse Mercator (EPSG:2039) – für GovMap und IAA-Unterlagen."""
    from rasterio.warp import transform
    x, y = transform("EPSG:4326", "EPSG:2039", [lon], [lat])
    return [round(x[0]), round(y[0])]


def _kandidat_id(lon, lat) -> str:
    return f"SK-{round(lat * 1e4)}-{round(lon * 1e4)}"


_FELDER = ("score", "klasse", "flaeche_m2", "laenge_m", "breite_m", "elongation",
           "rechteckigkeit", "azimut", "rx_mittel", "rx_max", "rx_relativ",
           "persistenz_feucht", "persistenz_trocken", "lrm_m", "hang_grad", "landbedeckung",
           "treiber", "teilwerte", "deutung", "naechster_fundort", "bekannt", "kontext")


def katalog_fortschreiben(aus: Path, erg: dict, neue_daten: bool = True) -> dict:
    """Führt die Ergebnisse einer Kachel in den kumulativen Katalog ein.

    `neue_daten` = die Szenenauswahl hat sich gegenüber dem letzten Lauf der
    Kachel geändert. Nur dann zählt eine Wiederbeobachtung als unabhängige
    Bestätigung; mit identischen Szenen wird der Stand lediglich ersetzt."""
    meta, datum = erg["meta"], erg["meta"]["datum"]
    p_k, p_f = aus / "data/kandidaten.geojson", aus / "data/fundorte.geojson"
    alt = _lade(p_k, _fc([]))["features"]
    eigene = [f for f in alt if f["properties"]["kachel"] == meta["id"]]
    # Ergebnisse anderer Methodenversion oder Maskenlage sind nicht vergleichbar
    veraltet = [f for f in eigene if f["properties"].get("methode") != C.METHODEN_VERSION
                or f["properties"].get("osm_maske") != meta["osm_maske"]]
    for f in veraltet:
        (erg["chips"] / f"{f['properties']['id']}.png").unlink(missing_ok=True)
    alt = [f for f in alt if f not in veraltet]
    eigene = [f for f in eigene if f not in veraltet]
    for f in eigene:
        f["properties"]["n_laeufe"] += int(neue_daten)
    neu = wieder = 0
    vergeben = []
    for o in erg["kandidaten"]:
        treffer = next((f for f in eigene if f not in vergeben and fundorte.distanz_m(
            o["lon"], o["lat"], *f["geometry"]["coordinates"]) <= C.ABGLEICH_M), None)
        if treffer:
            p = treffer["properties"]
            p["n_beob"] += int(neue_daten)
            wieder += 1
            vergeben.append(treffer)
        else:
            p = {"id": _kandidat_id(o["lon"], o["lat"]), "kachel": meta["id"],
                 "region": meta["region_name"], "zuerst": datum, "n_beob": 1, "n_laeufe": 1}
            alt.append(_punkt(p, o["lon"], o["lat"]))
            neu += 1
        p.update({k: o[k] for k in _FELDER}, zuletzt=datum, osm_maske=meta["osm_maske"],
                 methode=C.METHODEN_VERSION, chip=f"chips/{p['id']}.png")
        erg["chips"].mkdir(parents=True, exist_ok=True)
        _chip(erg["chips"] / f"{p['id']}.png", o["_rgb"], o["_labels"], o)
    # Kandidaten, die sich über mehrere Läufe nicht bestätigen, entfallen
    weg = [f for f in alt if f["properties"]["n_laeufe"] >= 3
           and f["properties"]["n_beob"] / f["properties"]["n_laeufe"] < 0.34]
    if not neue_daten:  # gleiche Daten: der neue Stand ersetzt den alten vollständig
        weg += [f for f in eigene if f not in vergeben and f not in weg]
    for f in weg:
        (erg["chips"] / f"{f['properties']['id']}.png").unlink(missing_ok=True)
    alt = [f for f in alt if f not in weg]
    for f in alt:
        if "itm" not in f["properties"]:
            f["properties"]["itm"] = _itm(*f["geometry"]["coordinates"])
    alt.sort(key=lambda f: -f["properties"]["score"])
    _schreibe(p_k, _fc(alt), kompakt=True)

    orte = {f["properties"]["refs"][0]: f for f in _lade(p_f, _fc([]))["features"]}
    for o in erg["orte"]:
        if o["in_kachel"]:
            orte[o["refs"][0]] = _punkt({
                "name": o["name"], "namen": o["namen"][:6], "typ": o["typ"], "refs": o["refs"],
                "perioden": o["perioden"], "perioden_quelle": o["perioden_quelle"],
                "perioden_roh": o["perioden_roh"][:6], "perzentil": o["perzentil"] and
                round(o["perzentil"], 3), "kachel": meta["id"]}, o["lon"], o["lat"])
    _schreibe(p_f, _fc(list(orte.values())), kompakt=True)
    meta["neu"], meta["wiedererkannt"], meta["entfallen"] = neu, wieder, len(weg)
    return meta


def warteschlange(kacheln_stand: dict, region: str | None = None) -> list[dict]:
    """Noch nie verarbeitete Kacheln zuerst, danach die am längsten nicht
    aktualisierten (Wiederholungsbeobachtung mit neuen Szenen)."""
    alle = [k for k in C.alle_kacheln() if not region or k["region"] == region]
    rang = {k["id"]: i for i, k in enumerate(alle)}
    def zuletzt(k):
        st = kacheln_stand.get(k["id"], {})
        if st.get("status") == "ok" and not st.get("osm_maske") and st.get("ohne_osm", 0) < 2:
            return ""  # einmalig bevorzugt mit OSM-Maske wiederholen
        return st.get("versuch") or st.get("datum", "")
    return sorted(alle, key=lambda k: (zuletzt(k), rang[k["id"]]))


def _git_commit() -> str:
    try:
        return subprocess.run(["git", "rev-parse", "--short", "HEAD"], capture_output=True,
                              text=True, check=True).stdout.strip()
    except Exception:  # noqa: BLE001
        return "unbekannt"


def uebersicht_schreiben(aus: Path, kacheln: dict, lauf: dict | None) -> dict:
    kand = _lade(aus / "data/kandidaten.geojson", _fc([]))["features"]
    orte = _lade(aus / "data/fundorte.geojson", _fc([]))["features"]
    alt = _lade(aus / "data/uebersicht.json", {})
    ok = [k for k in kacheln.values() if k["status"] == "ok"]
    perz = [[p["p"] for p in k["perzentile"]] for k in ok]
    je_region = {}
    for r in C.REGIONEN:
        ks = [k for k in ok if k["region"] == r["id"]]
        gesamt = sum(1 for k in C.alle_kacheln() if k["region"] == r["id"])
        je_region[r["id"]] = {
            "id": r["id"], "name": r["name"], "bbox": r["bbox"], "kacheln_gesamt": gesamt,
            "kacheln_ok": len(ks),
            "kandidaten": sum(1 for f in kand if f["properties"]["region"] == r["name"]),
            "validierung": analyse.auc_statistik([[p["p"] for p in k["perzentile"]] for k in ks])}
    laeufe = alt.get("laeufe", [])
    if lauf:
        laeufe = [l for l in laeufe if l["id"] != lauf["id"]] + [lauf]
    ueb = {
        "stand": dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
        "methoden_version": C.METHODEN_VERSION, "software_version": __version__,
        "kacheln_gesamt": len(C.alle_kacheln()), "kacheln_ok": len(ok),
        "kacheln_fehler": sum(1 for k in kacheln.values() if k["status"] != "ok"),
        "flaeche_km2": round(sum(k["anteil_auswertbar"] for k in ok) * 25.9, 0),
        "kandidaten": len(kand),
        "kandidaten_unregistriert": sum(1 for f in kand if not f["properties"]["bekannt"]),
        "kandidaten_bestaetigt": sum(1 for f in kand if f["properties"]["n_beob"] >= 2),
        "fundorte": len(orte),
        "fundorte_et": sum(1 for f in orte if "ET" in f["properties"]["perioden"]),
        "fundorte_zt": sum(1 for f in orte if "ZT" in f["properties"]["perioden"]),
        "validierung": analyse.auc_statistik(perz), "regionen": je_region,
        "validierung_urteil": bericht.urteil(analyse.auc_statistik(perz)),
        "perioden": fundorte.PERIODEN, "laeufe": laeufe[-200:],
    }
    _schreibe(aus / "data/uebersicht.json", ueb)
    return ueb


def lauf(aus: Path, n: int, region: str | None = None, ids: list[str] | None = None,
         heute: dt.date | None = None, log=print, cache: str = ".cache/osm") -> int:
    heute = heute or dt.date.today()
    kacheln = _lade(aus / "data/kacheln.json", {})
    if ids:
        idx = {k["id"]: k for k in C.alle_kacheln()}
        auswahl = [idx[i] for i in ids]
    else:
        auswahl = warteschlange(kacheln, region)[:n]
    t0, metas = time.time(), []
    osm_index = osm.index_laden(Path(cache), log) if auswahl else None
    for k in auswahl:
        t = time.time()
        try:
            erg = kachel_verarbeiten(k, heute, aus / "chips", osm_index)
            vorher = kacheln.get(k["id"], {})
            meta = katalog_fortschreiben(aus, erg, vorher.get("szenen") != erg["meta"]["szenen"])
            meta["laeufe"] = kacheln.get(k["id"], {}).get("laeufe", 0) + 1
            meta["ohne_osm"] = (0 if meta["osm_maske"] else
                                kacheln.get(k["id"], {}).get("ohne_osm", 0) + 1)
            log(f"[ok] {k['id']} {k['region']:<10} {meta['n_kandidaten']:>2} Kandidaten "
                f"({meta['neu']} neu), {meta['n_fundorte']} Fundorte, {time.time() - t:.0f}s")
        except Exception as e:  # noqa: BLE001 – eine Kachel darf den Lauf nicht stoppen
            log(f"[FEHLER] {k['id']}: {e}")
            traceback.print_exc()
            vorher = kacheln.get(k["id"])
            if vorher and vorher["status"] == "ok":
                vorher["versuch"] = heute.isoformat()  # gültiges Ergebnis behalten
                _schreibe(aus / "data/kacheln.json", kacheln)
                continue
            meta = {"id": k["id"], "region": k["region"], "region_name": k["region_name"],
                    "bbox": list(k["bbox"]), "status": "fehler", "datum": heute.isoformat(),
                    "fehler": str(e)[:300]}
        kacheln[k["id"]] = meta
        metas.append(meta)
        _schreibe(aus / "data/kacheln.json", kacheln)
    ok = [m for m in metas if m["status"] == "ok"]
    lauf_info = {
        "id": dt.datetime.now(dt.timezone.utc).strftime("%Y-%m-%dT%H%MZ"),
        "datum": heute.isoformat(), "kacheln": [m["id"] for m in metas],
        "ok": len(ok), "fehler": len(metas) - len(ok),
        "neu": sum(m["neu"] for m in ok), "wiedererkannt": sum(m["wiedererkannt"] for m in ok),
        "entfallen": sum(m["entfallen"] for m in ok), "dauer_s": round(time.time() - t0),
        "commit": _git_commit(), "methode": C.METHODEN_VERSION,
        "osm_stand": (osm_index or {}).get("stand"),
        "umgebung": f"Python {platform.python_version()}, NumPy {np.__version__}",
    }
    ueb = uebersicht_schreiben(aus, kacheln, lauf_info)
    bericht.schreiben(aus, ueb, kacheln, lauf_info, metas)
    log(f"Lauf {lauf_info['id']}: {len(ok)} Kacheln ok, {lauf_info['fehler']} Fehler, "
        f"{lauf_info['neu']} neue Kandidaten, {lauf_info['dauer_s']} s")
    return 0 if ok or not metas else 1
