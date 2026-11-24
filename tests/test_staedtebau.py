"""Tests des Städtebau-Generators ohne Netz: synthetisches Gelände."""
import copy
import json

import numpy as np
import pytest

from staedtebau import config as C, entwurf, gelaende, simulation

ORT = {"id": "test", "name": "Teststadt", "ziel_ew": 12000, "regen_mm": 400}


def _huegel(n=480, hoehe=60.0):
    """Sanfte Kuppe in der Mitte, ein Tal im Süden, Wald im Nordosten."""
    y, x = np.mgrid[0:n, 0:n]
    d = np.hypot(y - n / 2, x - n / 2) * 10
    dem = 300 + hoehe * np.exp(-(d / 900) ** 2) - 25 * np.exp(-((y - 0.88 * n) * 10 / 250) ** 2)
    wc = np.full((n, n), 30, np.uint8)
    wc[: n // 5, 4 * n // 5:] = 10
    return gelaende.Ausschnitt(C.EPSG, 686000.0, 3510000.0, n, n), dem.astype(np.float32), wc


@pytest.fixture(scope="module")
def plan():
    a, dem, wc = _huegel()
    denkmal = {"name": "Tel Test", "art": "hauptdenkmal", "haupt": True, "zeile": 240, "spalte": 150,
               "radius": 200, "puffer": C.DENKMAL_PUFFER_M}
    p, relief, analyse = entwurf.entwerfen(a, dem, wc, ORT, (240, 240), [denkmal])
    assert relief.shape == analyse.shape == (480, 480, 3)
    return p, a, denkmal


def test_plan_ist_vollstaendig_und_json_faehig(plan):
    p, _, _ = plan
    json.dumps(p, allow_nan=False)
    k = p["kennzahlen"]
    assert 0.6 * ORT["ziel_ew"] <= k["einwohner"] <= 1.6 * ORT["ziel_ew"]
    assert k["ringe"] >= 4 and len(p["ringe"]) == k["ringe"] + 1
    assert len(p["schnitte"]) == 2 and p["spirale"] and p["zufahrt"]
    assert {s["typ"] for s in p["sonder"]} >= {"hochbehaelter", "zentral", "quartier"}
    assert sorted(b["rang"] for b in p["bloecke"]) == list(range(len(p["bloecke"])))
    assert {b["phase"] for b in p["bloecke"]} <= {1, 2, 3, 4, 5}


def test_synagoge_und_beit_midrasch_sind_immer_im_plan(plan):
    p, _, _ = plan
    haupt = {q["name"]: q for q in p["sonder"] if q.get("haupt")}
    assert {"Hauptsynagoge", "Beit Midrasch", "Mikwe"} <= set(haupt)
    assert haupt["Hauptsynagoge"]["rang"] == -1 and haupt["Beit Midrasch"]["rang"] == -1   # erster Bauabschnitt
    k = p["kennzahlen"]
    assert k["synagogen_plan"] >= k["synagogen_bedarf"] - 1 >= 3 and k["batei_midrasch_plan"] >= 2
    arten = [g[7] for g in p["gebaeude"] if len(g) > 7]
    assert arten.count("s") >= k["synagogen_plan"] - 1 and "m" in arten
    syn = [(q["x"], q["y"]) for q in p["sonder"] if q["typ"] == "synagoge"]
    weit = max(min(np.hypot(g[0] - x, g[1] - y) for x, y in syn) for g in p["gebaeude"])
    assert weit < 700, f"Gebäude {weit:.0f} m von der nächsten Synagoge"


def test_synagoge_auch_wenn_der_platzrand_blockiert_ist():
    a, dem, wc = _huegel()
    y, x = np.mgrid[0:480, 0:480]
    d = np.hypot(y - 240, x - 240) * 10
    sperre = (d > 40) & (d < 230)                 # z. B. eine OSM-Sperrfläche rund um den Platz
    p, _, _ = entwurf.entwerfen(a, dem, wc, ORT, (240, 240), [], sperre)
    namen = [q["name"] for q in p["sonder"] if q.get("haupt")]
    assert namen[:2] == ["Hauptsynagoge", "Beit Midrasch"]


def test_kennzahlen_sind_aus_dem_plan_berechnet(plan):
    p, _, _ = plan
    k, bl = p["kennzahlen"], p["bloecke"]
    assert k["einwohner"] == sum(b["ew"] for b in bl)
    assert k["wohneinheiten"] == sum(b["we"] for b in bl)
    assert k["gebaeude"] == len(p["gebaeude"])
    assert abs(k["wasserbedarf_m3"] - k["einwohner"] * C.ANNAHMEN["wasser_m3_je_ew_jahr"]) <= 1
    assert 0 < k["wasser_eigenanteil"] < 1.5 and 0 < k["strom_eigenanteil"] < 3


def test_denkmal_und_tabuflaechen_bleiben_frei(plan):
    p, a, d = plan
    dx, dy = a.lokal(d["zeile"], d["spalte"])
    for g in p["gebaeude"]:
        assert np.hypot(g[0] - dx, g[1] - dy) > d["radius"] + d["puffer"] - 15, "Gebäude in der Denkmalzone"
    assert p["denkmale"][0]["art"] == "hauptdenkmal" and p["denkmale"][0]["r"] == d["radius"]


def test_ringe_folgen_dem_hang():
    """Am Hang rücken die Ringe im Grundriss zusammen (Terrassen), in der Ebene nicht."""
    a, dem, wc = _huegel(hoehe=120.0)
    steil = entwurf.Polar(a, dem, 240, 240)
    flach = entwurf.Polar(a, np.full_like(dem, 300.0), 240, 240)
    assert np.allclose(np.diff(flach.rb[:8], axis=0), C.RING_ABSTAND, atol=6)
    assert np.diff(steil.rb[2:8], axis=0).mean() < 0.8 * C.RING_ABSTAND
    assert (np.diff(steil.rb, axis=0) >= 29.9).all()


def test_steilhang_und_wadi_werden_tabu():
    a, dem, wc = _huegel()
    dem = dem + np.where(np.arange(480)[None, :] > 400, (np.arange(480)[None, :] - 400) * 6.0, 0)
    R = entwurf.restriktionen(a, dem, wc)
    assert R["steil"][:, 420:].mean() > 0.9 and not R["baubar"][:, 430:].any()
    assert R["wald"][:90, 400:].all() and not R["baubar"][:90, 400:].any()
    maske, linien = gelaende.wadis(gelaende.glaetten(dem), 10)
    assert linien and maske[400:445].mean() > maske[100:300].mean()


def test_zentrum_meidet_die_ruine():
    a, dem, wc = _huegel()
    d = {"zeile": 240, "spalte": 240, "radius": 250, "puffer": C.DENKMAL_PUFFER_M}
    R = entwurf.restriktionen(a, dem, wc, [d])
    zr, zs, _ = entwurf.zentrum_finden(a, R, (240, 240), 250)
    abstand = np.hypot(zr - 240, zs - 240) * 10
    assert 250 + C.DENKMAL_PUFFER_M + 350 <= abstand <= 1500 and R["baubar"][zr, zs]


def test_simulation_waechst_monoton_und_gruendet_der_reihe_nach(plan):
    p, _, _ = plan
    plaene = {oid: dict(copy.deepcopy(p), id=oid, name=oid, antik=None) for oid in C.GRUENDUNGSFOLGE}
    welt = {"jahr": 0}
    vorher = (0, 0)
    for _ in range(60):
        simulation.runde(welt, plaene)
        s = welt["summe"]
        assert s["wohneinheiten"] >= vorher[1] and s["einwohner"] >= vorher[0]
        vorher = (s["einwohner"], s["wohneinheiten"])
    gegr = [o for o in C.GRUENDUNGSFOLGE if welt["staedte"][o]["status"] == "gegruendet"]
    assert gegr == C.GRUENDUNGSFOLGE[:len(gegr)] and len(gegr) >= 4
    jahre = [welt["staedte"][o]["gruendung"] for o in gegr]
    assert all(b - a >= simulation.GRUENDUNG_ABSTAND for a, b in zip(jahre, jahre[1:]))
    erste = welt["staedte"][gegr[0]]
    assert erste["we"] <= p["kennzahlen"]["wohneinheiten"] and erste["ew"] <= p["kennzahlen"]["einwohner"]
    assert 0 <= erste["bilanz"]["lebensqualitaet"] <= 100 and "platz" in erste["meilensteine"]
    for st in (welt["staedte"][o] for o in gegr):                    # Synagoge und Beit Midrasch im Gründungsjahr
        assert {"synagoge", "beitmidrasch"} <= set(st["meilensteine"])
        assert st["synagogen"] >= 1 and st["batei_midrasch"] >= 1
    gruendung = [e for e in welt["chronik"] if e["stadt"] == gegr[-1] and e["jahr"] == welt["staedte"][gegr[-1]]["gruendung"]]
    assert any("Hauptsynagoge" in e["text"] for e in gruendung) and any("Beit Midrasch" in e["text"] for e in gruendung)
    assert erste["synagogen"] > 3
    # die Versorgung läuft dem Zuzug voraus: nie mehr als eine Synagoge im Rückstand
    for st in (welt["staedte"][o] for o in gegr):
        assert st["synagogen"] >= st["bilanz"]["synagogen_soll"] - 1
    json.dumps(welt, allow_nan=False)
    assert simulation.regenfaktor(7) == simulation.regenfaktor(7)


def test_tagesrunden_nachholen_und_doppelte_starts():
    import datetime as dt
    from staedtebau.__main__ import tagesrunden

    jetzt = dt.datetime(2026, 11, 24, 3, 41, tzinfo=dt.timezone.utc)
    alt = {"stand": "2026-11-23T13:47:32+00:00"}
    heute = jetzt.date()
    assert tagesrunden(alt, jetzt - dt.timedelta(minutes=1)) == (0, heute - dt.timedelta(days=1))
    assert tagesrunden(alt, jetzt) == (1, heute)
    assert tagesrunden({**alt, "letzte_tagesrunde": "2026-11-24"}, jetzt) == (0, heute)
    assert tagesrunden({**alt, "letzte_tagesrunde": "2026-11-21"}, jetzt) == (3, heute)
