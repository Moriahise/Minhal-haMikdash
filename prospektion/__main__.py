"""Kommandozeile:  python -m prospektion lauf --kacheln 8"""
import argparse
import sys
from pathlib import Path

from . import config as C
from . import lauf as L


def main() -> int:
    ap = argparse.ArgumentParser(prog="prospektion", description=__doc__)
    sub = ap.add_subparsers(dest="cmd", required=True)
    a = sub.add_parser("lauf", help="nächste Kacheln der Warteschlange analysieren")
    a.add_argument("--kacheln", type=int, default=20)
    a.add_argument("--region", choices=[r["id"] for r in C.REGIONEN])
    a.add_argument("--id", action="append", help="bestimmte Kachel-ID (mehrfach möglich)")
    a.add_argument("--aus", type=Path, default=Path("seker"))
    c = sub.add_parser("uebersicht", help="Übersicht neu schreiben (ohne Analyse)")
    c.add_argument("--aus", type=Path, default=Path("seker"))
    b = sub.add_parser("plan", help="Warteschlange anzeigen")
    b.add_argument("--aus", type=Path, default=Path("seker"))
    b.add_argument("-n", type=int, default=20)
    args = ap.parse_args()
    if args.cmd == "lauf":
        return L.lauf(args.aus, args.kacheln, args.region, args.id)
    stand = L._lade(args.aus / "data/kacheln.json", {})
    if args.cmd == "uebersicht":
        L.uebersicht_schreiben(args.aus, stand, None)
        return 0
    for k in L.warteschlange(stand)[:args.n]:
        print(k["id"], k["region"], stand.get(k["id"], {}).get("datum", "–"))
    return 0


if __name__ == "__main__":
    sys.exit(main())
