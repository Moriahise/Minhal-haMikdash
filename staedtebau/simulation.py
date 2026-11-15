"""Rundensimulation: jede Runde ist ein Jahr. Städte werden nacheinander
gegründet und wachsen entlang der Bauabschnitte ihres Plans. Alles ist
deterministisch (Zufall nur über den Startwert des Jahres) und rein
modellhaft – es bildet keine realen Entscheidungen oder Genehmigungen ab."""
from __future__ import annotations

import numpy as np

from . import config as C

GRUENDUNG_ABSTAND = 5        # Jahre zwischen zwei Gründungen (frühestens)
GRUENDUNG_REIFE = 0.12       # jüngste Stadt muss so weit ausgebaut sein

MEILENSTEINE = [   # (Schlüssel, Bedingung(ew, we, anteil), Text)
    ("zufahrt", lambda ew, we, a: True, "Zufahrtsstraße, Trinkwasser-Hochbehälter und Baulogistik stehen."),
    ("platz", lambda ew, we, a: we >= 120, "Der Stadtplatz mit dem Brunnen wird eingeweiht; die ersten Familien ziehen ein."),
    ("synagoge", lambda ew, we, a: ew >= 800, "Die Hauptsynagoge am Platz wird eröffnet."),
    ("schule1", lambda ew, we, a: ew >= 1500, "Die erste Grundschule nimmt den Unterricht auf."),
    ("klaer", lambda ew, we, a: ew >= 2500, "Die Kläranlage geht in Betrieb; Brauchwasser bewässert Gärten und Terrassen."),
    ("bus", lambda ew, we, a: ew >= 4000, "Der Ringbus verbindet die Quartiere mit dem Zentrum."),
    ("markt", lambda ew, we, a: ew >= 5500, "Markthalle und Arkadenring sind vollständig belegt."),
    ("spirale", lambda ew, we, a: a >= 0.5, "Die Spiralpromenade ist vom Stadtrand bis zum Platz stufenlos begehbar."),
    ("voll", lambda ew, we, a: a >= 0.999, "Endausbau erreicht – alle Bauabschnitte sind fertiggestellt."),
]


def regenfaktor(jahr: int) -> float:
    return float(np.clip(np.random.default_rng(1000 + jahr).lognormal(0, 0.28), 0.4, 1.7))


def stadt_runde(st: dict, plan: dict, jahr: int) -> list[str]:
    """Schreibt den Zustand einer gegründeten Stadt um ein Jahr fort."""
    A = C.ANNAHMEN
    bl = sorted(plan["bloecke"], key=lambda k: k["rang"])
    we_ges = sum(k["we"] for k in bl)
    ereignisse = []
    rate = round(120 + 0.06 * st["we"])
    st["we"] = min(we_ges, st["we"] + rate)
    kum, gebaut = 0, 0
    for k in bl:
        if kum + k["we"] > st["we"]:
            break
        kum += k["we"]
        gebaut += 1
    st["bloecke_gebaut"] = gebaut
    ziel = st["we"] * A["haushalt_personen"] * 0.96
    st["ew"] = int(round(st["ew"] + 0.7 * (ziel - st["ew"])))
    anteil = st["we"] / max(we_ges, 1)
    for key, bed, text in MEILENSTEINE:
        if key not in st["meilensteine"] and bed(st["ew"], st["we"], anteil):
            st["meilensteine"].append(key)
            ereignisse.append(text)
    schulen_soll = max(1, round(st["ew"] / A["ew_je_grundschule"]))
    zentren = plan["kennzahlen"]["quartierszentren"]
    offen = [k for k in bl[:gebaut] if k["zone"] == "gemeinbedarf"]
    while st["schulen"] < min(len(offen), schulen_soll) and "schule1" in st["meilensteine"]:
        st["schulen"] += 1
        if st["schulen"] > 1:
            ereignisse.append(f"Quartierszentrum {st['schulen']} mit Grundschule, Synagoge und Mikwe eröffnet.")
    if "gewerbe" not in st["meilensteine"] and any(k["zone"] == "gewerbe" for k in bl[:gebaut]):
        st["meilensteine"].append("gewerbe")
        ereignisse.append("Das Gewerbe- und Technologiequartier nimmt die ersten Betriebe auf.")
    # Bilanzen des Jahres
    k = plan["kennzahlen"]
    rf = regenfaktor(jahr)
    bedarf = st["ew"] * A["wasser_m3_je_ew_jahr"]
    regen = k["regenernte_m3"] * anteil * rf
    brauch = bedarf * A["abwasser_rueckgewinnung"] if "klaer" in st["meilensteine"] else 0.0
    ap = sum(b["ap"] for b in bl[:gebaut])
    gruen = sum(b["flaeche"] for b in bl[:gebaut] if b["zone"] in ("park", "gruen", "wald", "archaeologie"))
    wasser_eigen = (regen + brauch) / bedarf if bedarf else 0.0
    jobs = ap / max(st["ew"] * A["erwerbsquote"], 1)
    freiraum = gruen / max(st["ew"], 1)
    lq = (25 * min(1, st["schulen"] / schulen_soll) + 25 * min(1, freiraum / A["freiraum_ziel_m2_je_ew"])
          + 25 * min(1, wasser_eigen / 0.7) + 25 * min(1, jobs / 0.6)) if st["ew"] else 0
    st["bilanz"] = {"regenfaktor": round(rf, 2), "wasserbedarf_m3": round(bedarf), "regenernte_m3": round(regen),
                    "brauchwasser_m3": round(brauch), "wasser_eigenanteil": round(wasser_eigen, 2),
                    "pv_gwh": round(k["pv_gwh"] * anteil, 1),
                    "strombedarf_gwh": round(st["ew"] * A["strom_kwh_je_ew_jahr"] / 1e6, 1),
                    "arbeitsplaetze": ap, "jobs_je_erwerbsperson": round(jobs, 2),
                    "freiraum_m2_je_ew": round(freiraum, 1), "schulen": st["schulen"],
                    "schulen_soll": schulen_soll, "quartierszentren_plan": zentren,
                    "ausbau": round(anteil, 3), "lebensqualitaet": round(lq)}
    if rf < 0.65 and st["ew"] > 0:
        ereignisse.append(f"Dürrejahr: nur {rf:.0%} des mittleren Niederschlags – die Regenernte bricht ein, "
                          "der Fernwasserbezug steigt entsprechend.")
    st["verlauf"].append([jahr, st["ew"], st["we"], gebaut, round(lq)])
    return ereignisse


def neue_stadt() -> dict:
    return {"status": "geplant", "gruendung": None, "ew": 0, "we": 0, "bloecke_gebaut": 0,
            "schulen": 0, "meilensteine": [], "verlauf": [], "bilanz": {}}


def runde(welt: dict, plaene: dict) -> dict:
    """Eine Runde (ein Jahr) für die ganze Welt. `plaene` = {id: Plan}."""
    welt["jahr"] = jahr = welt.get("jahr", 0) + 1
    staedte = welt.setdefault("staedte", {})
    chronik = welt.setdefault("chronik", [])
    for oid in C.GRUENDUNGSFOLGE:
        staedte.setdefault(oid, neue_stadt())
    gegr = [o for o in C.GRUENDUNGSFOLGE if staedte[o]["status"] == "gegruendet"]
    wartend = [o for o in C.GRUENDUNGSFOLGE if staedte[o]["status"] == "geplant" and o in plaene]
    reif = not gegr or (jahr - staedte[gegr[-1]]["gruendung"] >= GRUENDUNG_ABSTAND
                        and staedte[gegr[-1]].get("bilanz", {}).get("ausbau", 0) >= GRUENDUNG_REIFE)
    if wartend and reif:
        oid = wartend[0]
        staedte[oid].update(status="gegruendet", gruendung=jahr)
        p = plaene[oid]
        chronik.append({"jahr": jahr, "stadt": oid, "art": "gruendung",
                        "text": f"{p['name']} wird gegründet"
                        + (f" – neben {p['antik']}, dessen Ruine als archäologischer Park geschützt bleibt."
                           if p.get("antik") else " – als Neugründung auf bisher unbebautem Land.")})
    for oid in C.GRUENDUNGSFOLGE:
        st = staedte[oid]
        if st["status"] == "gegruendet" and oid in plaene:
            for text in stadt_runde(st, plaene[oid], jahr):
                chronik.append({"jahr": jahr, "stadt": oid, "art": "ereignis", "text": text})
    aktiv = [staedte[o] for o in C.GRUENDUNGSFOLGE if staedte[o]["status"] == "gegruendet"]
    welt["summe"] = {"staedte": len(aktiv), "einwohner": sum(s["ew"] for s in aktiv),
                     "wohneinheiten": sum(s["we"] for s in aktiv),
                     "lebensqualitaet": round(float(np.mean([s["bilanz"]["lebensqualitaet"] for s in aktiv])) if aktiv else 0)}
    welt["chronik"] = chronik[-600:]
    return welt
