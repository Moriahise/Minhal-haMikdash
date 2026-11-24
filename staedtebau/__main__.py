"""Kommandozeile:
  python -m staedtebau plaene [--neu] [--id ORT]   Pläne erzeugen
  python -m staedtebau runde [-n 1]                Simulation um n Jahre fortschreiben
"""
import argparse
import datetime as dt
import json
import sys
from pathlib import Path

from . import __version__, config as C, simulation, stadt


def _welt_pfad(w: Path) -> Path:
    return w / "blaupause/data/welt.json"


def _plaene(w: Path) -> dict:
    out = {}
    for o in C.GRUENDUNGSFOLGE:
        p = w / f"blaupause/data/staedte/{o}.json"
        if p.exists():
            out[o] = json.loads(p.read_text("utf-8"))
    return out


def plaene_sichern(w: Path, neu: bool, nur=None, osm_index=None) -> dict:
    """Fehlende, veraltete oder ohne OSM erzeugte Pläne (neu) rechnen."""
    vorh = _plaene(w)
    for oid in ([nur] if nur else C.GRUENDUNGSFOLGE):
        alt = vorh.get(oid)
        noetig = neu or alt is None or alt.get("version") != C.PLAN_VERSION or (
            osm_index is not None and not alt.get("osm"))
        if not noetig:
            continue
        try:
            vorh[oid] = stadt.planen(stadt.ort_von_id(oid), w, osm_index)
        except Exception as e:  # noqa: BLE001 – ein Ort darf den Lauf nicht stoppen
            print(f"[FEHLER] Plan {oid}: {e}")
    return vorh


def welt_schreiben(w: Path, welt: dict, plaene: dict) -> None:
    welt.update(stand=dt.datetime.now(dt.timezone.utc).isoformat(timespec="seconds"),
                version=__version__, plan_version=C.PLAN_VERSION, folge=C.GRUENDUNGSFOLGE,
                annahmen=C.ANNAHMEN, zonen_name=C.ZONEN_NAME)
    welt["uebersicht"] = {o: {"name": p["name"], "he": p["he"], "art": p["art"], "antik": p.get("antik"),
                              "lonlat": p["georef"]["zentrum_lonlat"], "ziel_ew": p["ziel_ew"],
                              "plan_ew": p["kennzahlen"]["einwohner"], "osm": p["osm"], "bezug": p["bezug"],
                              "hinweis": p.get("hinweis")}
                          for o, p in plaene.items()}
    _welt_pfad(w).parent.mkdir(parents=True, exist_ok=True)
    _welt_pfad(w).write_text(json.dumps(welt, ensure_ascii=False, indent=1) + "\n", "utf-8")


def tagesrunden(welt: dict, jetzt: dt.datetime) -> tuple[int, dt.date]:
    """Fällige UTC-Tage seit der letzten gespeicherten Runde."""
    heute = jetzt.date()
    faellig_bis = heute if (jetzt.hour, jetzt.minute) >= (3, 41) else heute - dt.timedelta(days=1)
    # Ältere Weltdateien enthalten nur den UTC-Zeitstempel "stand".
    datum = welt.get("letzte_tagesrunde") or (welt.get("stand") or "")[:10]
    zuletzt = dt.date.fromisoformat(datum) if datum else faellig_bis - dt.timedelta(days=1)
    anzahl = min(50, max(0, (faellig_bis - zuletzt).days))
    return anzahl, zuletzt + dt.timedelta(days=anzahl)


def main() -> int:
    ap = argparse.ArgumentParser(prog="staedtebau", description=__doc__)
    ap.add_argument("--wurzel", type=Path, default=Path("."))
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("plaene")
    a.add_argument("--neu", action="store_true")
    a.add_argument("--id", choices=C.GRUENDUNGSFOLGE)
    b = sub.add_parser("runde")
    b.add_argument("-n", type=int, default=1)
    b.add_argument("--taeglich", action="store_true", help="Fehlende Tagesrunden bis zum fälligen UTC-Tag nachholen")
    b.add_argument("--ohne-osm", action="store_true")
    args = ap.parse_args()
    w = args.wurzel
    welt = json.loads(_welt_pfad(w).read_text("utf-8")) if _welt_pfad(w).exists() else {"jahr": 0}
    if args.cmd == "runde":
        jetzt = dt.datetime.now(dt.timezone.utc)
        if args.taeglich:
            anzahl, rundentag = tagesrunden(welt, jetzt)
            if not anzahl:
                print(f"Tagesrunde bereits aktuell: Jahr {welt['jahr']} ({rundentag})")
                return 0
        else:
            anzahl, rundentag = max(1, min(args.n, 50)), jetzt.date()
    osm_index = None
    if not getattr(args, "ohne_osm", False):
        from prospektion import osm
        osm_index = osm.index_laden(w / ".cache/osm")
    if args.cmd == "plaene":
        plaene = plaene_sichern(w, args.neu, args.id, osm_index)
    else:
        plaene = plaene_sichern(w, False, None, osm_index)
        for _ in range(anzahl):
            simulation.runde(welt, plaene)
        welt["letzte_tagesrunde"] = rundentag.isoformat()
        s = welt["summe"]
        print(f"Jahr {welt['jahr']}: {s['staedte']} Städte, {s['einwohner']} Einwohner, "
              f"Lebensqualität {s['lebensqualitaet']}")
    welt_schreiben(w, welt, plaene)
    return 0 if plaene else 1


if __name__ == "__main__":
    sys.exit(main())
