"""Tests ohne Netz: synthetische Szenen mit bekannter Wahrheit."""
import datetime as dt
import json

import numpy as np
import pytest

from prospektion import analyse, config as C, daten, fundorte, lauf, osm


def _szene(seed=0, n=300, struktur=True):
    """Zwei Komposite mit glattem Hintergrund, Rauschen und einer
    eingebetteten 60 x 40 m großen 'Ruine' (heller Boden, gehemmter Bewuchs)."""
    rng = np.random.default_rng(seed)
    yy, xx = np.mgrid[0:n, 0:n] / n
    def komp(nir):
        basis = np.stack([0.06 + 0.02 * xx, 0.09 + 0.02 * yy, 0.11 + 0.03 * xx,
                          nir + 0.05 * yy, 0.25 + 0.03 * xx, 0.18 + 0.02 * yy])
        return (basis + rng.normal(0, 0.004, basis.shape)).astype(np.float32)
    feucht, trocken = komp(0.40), komp(0.22)
    sl = (slice(150, 154), slice(100, 106))
    if not struktur:
        return feucht, trocken, sl
    feucht[3][sl] -= 0.12
    for b in (0, 1, 2):
        trocken[b][sl] += 0.05
    trocken[4][sl] += 0.06
    return feucht, trocken, sl


def test_eingebettete_struktur_wird_gefunden():
    feucht, trocken, sl = _szene()
    aus = np.zeros(feucht.shape[1:], bool)
    det = analyse.detektion(feucht, trocken, aus)
    innen = np.ones_like(aus)
    null = np.zeros(aus.shape, np.float32)
    objs, schwelle, labels = analyse.objekte(det, innen, null, null, np.full(aus.shape, 30, np.uint8))
    assert objs, "keine Objekte"
    bestes = objs[0]
    assert abs(bestes["zeile"] - 151.5) < 2 and abs(bestes["spalte"] - 102.5) < 2
    assert bestes["persistenz_feucht"] > 0.5 and bestes["persistenz_trocken"] > 0.5
    assert 40 <= bestes["laenge_m"] <= 100
    assert "Bewuchsmerkmal" in analyse.deutung(bestes)


def test_maskierte_flaeche_liefert_nichts():
    feucht, trocken, sl = _szene()
    aus = np.zeros(feucht.shape[1:], bool)
    aus[140:165, 90:115] = True
    det = analyse.detektion(feucht, trocken, aus)
    objs, _, _ = analyse.objekte(det, ~aus, aus * 0.0, aus * 0.0, np.full(aus.shape, 30, np.uint8))
    assert all(not (140 <= o["zeile"] < 165 and 90 <= o["spalte"] < 115) for o in objs)


def test_rauschen_allein_ergibt_niedrige_indizes():
    feucht, trocken, sl = _szene(seed=3, struktur=False)
    aus = np.zeros(feucht.shape[1:], bool)
    det = analyse.detektion(feucht, trocken, aus)
    null = np.zeros(aus.shape, np.float32)
    objs, _, _ = analyse.objekte(det, ~aus, null, null, np.full(aus.shape, 30, np.uint8))
    assert not [o for o in objs if o["score"] >= 60]


def test_form_linear():
    xs = np.arange(40)
    f = analyse._form(np.full(40, 5), xs)
    assert f["elongation"] > 10 and abs(f["azimut"] - 90) < 1
    assert analyse._klasse(f, 0) == "linear"


def test_validierung_erkennt_signal_und_zufall():
    rng = np.random.default_rng(0)
    d = rng.chisquare(3, (400, 400)).astype(np.float32) / 3
    orte = [(int(z), int(s)) for z, s in rng.integers(40, 360, (25, 2))]
    ok = np.ones(d.shape, bool)
    innen = np.zeros(d.shape, bool)
    innen[20:-20, 20:-20] = True   # wie im Betrieb: Fenster liegen stets voll im Raster
    p0 = analyse.validierung(d, ok, innen, orte, seed=1)["perzentile"]
    st0 = analyse.auc_statistik([p0])
    assert 0.35 < st0["auc"] < 0.65 and st0["p_einseitig"] > 0.01
    for z, s in orte:
        d[z, s] = 60
    st1 = analyse.auc_statistik([analyse.validierung(d, ok, innen, orte, seed=1)["perzentile"]])
    assert st1["auc"] > 0.95 and st1["p_einseitig"] < 1e-3


def test_perioden_und_dubletten():
    a = {"quelle": "Wikidata", "ref": "Q1", "lon": 34.85, "lat": 31.565,
         "namen": ["לכיש", "Tel Lachish"], "typ": "Tell", "perioden_roh": []}
    b = {"quelle": "OSM", "ref": "node/1", "lon": 34.8502, "lat": 31.5651,
         "namen": ["Lachish"], "typ": "archaeological_site", "perioden_roh": []}
    c = {"quelle": "OSM", "ref": "node/2", "lon": 34.9, "lat": 31.6, "namen": ["X"],
         "typ": "ruins", "perioden_roh": ["Herodian"]}
    orte = fundorte.zusammenfuehren([a], [b, c])
    assert len(orte) == 2
    assert orte[0]["perioden"] == ["ET", "ZT"] and orte[0]["name"] == "Tel Lachish"
    assert orte[1]["perioden"] == ["ZT"]


def test_kacheln_und_warteschlange():
    alle = C.alle_kacheln()
    assert len(alle) == len({k["id"] for k in alle}) > 250
    assert len({k["region"] for k in alle[:12]}) == 12  # Round-Robin über Regionen
    stand = {alle[0]["id"]: {"status": "ok", "datum": "2026-01-01", "osm_maske": True}}
    q = lauf.warteschlange(stand)
    assert q[0]["id"] == alle[1]["id"] and q[-1]["id"] == alle[0]["id"]
    stand[alle[0]["id"]]["osm_maske"] = False
    assert lauf.warteschlange(stand)[0]["id"] == alle[0]["id"]


def test_saisonfenster_nur_abgeschlossene():
    f = daten.saisonfenster(dt.date(2026, 3, 1))
    assert f["feucht"][0][0].year == 2025 and len(f["trocken"]) == C.JAHRE_ZURUECK


def test_osm_maske_aus_pbf(tmp_path):
    osmium = pytest.importorskip("osmium")
    pbf = tmp_path / "t.osm.pbf"
    w = osmium.SimpleWriter(str(pbf))
    for i, (lon, lat) in enumerate([(34.91, 31.66), (34.94, 31.69)], start=1):
        w.add_node(osmium.osm.mutable.Node(id=i, location=(lon, lat)))
    w.add_node(osmium.osm.mutable.Node(id=3, location=(34.92, 31.67), tags={
        "historic": "archaeological_site", "name": "Testruine", "historic:civilization": "Iron Age"}))
    w.add_way(osmium.osm.mutable.Way(id=10, nodes=[1, 2], tags={"highway": "track"}))
    w.close()
    idx = osm.pbf_indizieren(pbf)
    assert len(idx["wege"]) == 1 and idx["orte"][0]["namen"] == ["Testruine"]
    ra = daten.raster_fuer((34.90, 31.65, 34.95, 31.70), 32636)
    maske, orte = osm.kachel(idx, (34.90, 31.65, 34.95, 31.70), ra)
    z, s = ra.zeile_spalte(34.925, 31.675)
    assert maske[z, s] and 0.001 < maske.mean() < 0.05
    assert fundorte.zusammenfuehren(orte)[0]["perioden"] == ["ET"]
    assert osm.kachel(None, (0, 0, 1, 1), ra) == (None, [])


def test_katalog_fortschreibung(tmp_path):
    labels = np.zeros((120, 120), np.int32)
    labels[50:54, 50:56] = 1
    rgb = np.zeros((120, 120, 3), np.uint8)

    def erg(lon, osm_maske=True):
        o = {k: 0 for k in lauf._FELDER}
        o.update(score=70.0, klasse="linear", lon=lon, lat=31.66, zeile=52, spalte=53, label=1,
                 bekannt=False, kontext=[], treiber=[], teilwerte={}, deutung="",
                 naechster_fundort=None, _labels=labels, _rgb=rgb)
        return {"kandidaten": [o], "orte": [], "chips": tmp_path / "chips",
                "meta": {"id": "T3490_3165", "region": "schefela", "region_name": "S",
                         "datum": "2026-11-14", "osm_maske": osm_maske}}

    lauf.katalog_fortschreiben(tmp_path, erg(34.91))
    m = lauf.katalog_fortschreiben(tmp_path, erg(34.9102))   # 19 m entfernt -> derselbe
    assert (m["neu"], m["wiedererkannt"]) == (0, 1)
    m = lauf.katalog_fortschreiben(tmp_path, erg(34.93))     # neuer Ort
    fs = json.loads((tmp_path / "data/kandidaten.geojson").read_text())["features"]
    assert m["neu"] == 1 and len(fs) == 2
    alt = next(f["properties"] for f in fs if f["properties"]["n_laeufe"] == 3)
    assert alt["n_beob"] == 2 and (tmp_path / alt["chip"]).exists()
    m = lauf.katalog_fortschreiben(tmp_path, erg(34.9101), neue_daten=False)  # gleiche Szenen
    fs = json.loads((tmp_path / "data/kandidaten.geojson").read_text())["features"]
    assert len(fs) == 1 and (fs[0]["properties"]["n_beob"], fs[0]["properties"]["n_laeufe"]) == (2, 3)
    m = lauf.katalog_fortschreiben(tmp_path, erg(34.95, osm_maske=False))  # Maskenlage geändert
    fs = json.loads((tmp_path / "data/kandidaten.geojson").read_text())["features"]
    assert len(fs) == 1 and fs[0]["properties"]["n_laeufe"] == 1


def test_json_ohne_nan(tmp_path):
    lauf._schreibe(tmp_path / "x.json", {"a": float("nan"), "b": [1.5, float("inf")], "c": (2,)})
    assert json.loads((tmp_path / "x.json").read_text()) == {"a": None, "b": [1.5, None], "c": [2]}
