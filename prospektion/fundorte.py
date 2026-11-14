"""Bekannte Fundstellen: Zusammenführung, Dublettenbereinigung, Perioden.

Wichtig: Fernerkundung kann NICHT datieren. Perioden stammen ausschließlich
aus Katalogangaben (Wikidata/OSM) und einer kleinen Referenzliste gut
publizierter Grabungsorte; für Kandidaten sind sie nur räumlicher Kontext.
"""
from __future__ import annotations

import json
import math
import re
import unicodedata
from pathlib import Path

ET = "Erster Tempel (Eisenzeit II, ca. 1000–586 v. Chr.)"
ZT = "Zweiter Tempel (persisch–frührömisch, 516 v. Chr.–70 n. Chr.)"
PERIODEN = {"ET": ET, "ZT": ZT}

_KW = {
    "ET": ("iron age", "eisenzeit", "first temple", "erster tempel", "kingdom of judah",
           "kingdom of israel", "israelite", "philisti", "judahite", "assyria", "babylonian"),
    "ZT": ("second temple", "zweiter tempel", "helleni", "hasmon", "herod", "persian",
           "achaemenid", "early roman", "roman", "römisch", "nabat", "seleucid", "ptolem",
           "judea (roman", "bar kokhba"),
}

_REF = json.loads((Path(__file__).parent / "referenz_perioden.json").read_text("utf-8"))


def norm(s: str) -> str:
    s = unicodedata.normalize("NFKD", s.lower())
    s = "".join(c for c in s if not unicodedata.combining(c))
    s = re.sub(r"[^a-z0-9֐-׿ ]+", " ", s)
    s = re.sub(r"\b(tel|tell|khirbet|khirbat|horvat|hurvat|h|kh|ancient|biblical)\b", " ", s)
    return " ".join(s.split())


_REF_IDX = {norm(n): r["perioden"] for r in _REF["orte"] for n in r["namen"]}


def perioden_von(ort: dict) -> tuple[list[str], str]:
    """-> (Periodencodes, Herkunft der Angabe)"""
    codes, quelle = set(), ""
    for n in ort.get("namen", []):
        if norm(n) in _REF_IDX:
            codes |= set(_REF_IDX[norm(n)])
            quelle = "Referenzliste"
    roh = " | ".join(ort.get("perioden_roh", [])).lower()
    for code, kws in _KW.items():
        if any(k in roh for k in kws):
            codes.add(code)
            quelle = quelle or ort["quelle"]
    return sorted(codes), quelle


def distanz_m(lon1, lat1, lon2, lat2) -> float:
    k = math.cos(math.radians((lat1 + lat2) / 2))
    return 111_320 * math.hypot((lon1 - lon2) * k, lat1 - lat2)


def zusammenfuehren(*listen) -> list[dict]:
    """Vereinigt Kataloge; Einträge < 100 m Abstand gelten als derselbe Ort."""
    out: list[dict] = []
    for ort in (o for l in listen if l for o in l):
        for b in out:
            if distanz_m(ort["lon"], ort["lat"], b["lon"], b["lat"]) < 100:
                b["namen"] = list(dict.fromkeys(b["namen"] + ort["namen"]))
                b["perioden_roh"] = list(dict.fromkeys(b["perioden_roh"] + ort["perioden_roh"]))
                b["refs"].append(f"{ort['quelle']}:{ort['ref']}")
                break
        else:
            out.append({**ort, "refs": [f"{ort['quelle']}:{ort['ref']}"]})
    for o in out:
        o["perioden"], o["perioden_quelle"] = perioden_von(o)
        o["namen"].sort(key=lambda n: not n[:1].isascii())  # lateinische Schreibung zuerst
        o["name"] = (o["namen"] or ["(ohne Namen)"])[0]
    return out
