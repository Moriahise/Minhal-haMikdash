"""Erzeugt den strukturierten wissenschaftlichen Bericht (Markdown)."""
from __future__ import annotations

import json
from pathlib import Path

from . import config as C
from .analyse import MERKMAL_TEXT

LITERATUR = """\
- Agapiou, A., Alexakis, D. D., Sarris, A. & Hadjimitsis, D. G. (2014): Evaluating the potentials of Sentinel-2 for archaeological perspective. *Remote Sensing* 6(3), 2176–2194.
- Casana, J. (2014): Regional-scale archaeological remote sensing in the age of big data. *Advances in Archaeological Practice* 2(3), 222–233.
- Hesse, R. (2010): LiDAR-derived Local Relief Models – a new tool for archaeological prospection. *Archaeological Prospection* 17(2), 67–72.
- Lasaponara, R. & Masini, N. (2007): Detection of archaeological crop marks by using satellite QuickBird multispectral imagery. *Journal of Archaeological Science* 34(2), 214–221.
- Menze, B. H. & Ur, J. A. (2012): Mapping patterns of long-term settlement in Northern Mesopotamia at a large scale. *PNAS* 109(14), E778–E787.
- Orengo, H. A. et al. (2020): Automated detection of archaeological mounds using machine-learning classification of multisensor and multitemporal satellite data. *PNAS* 117(31), 18240–18250.
- Reed, I. S. & Yu, X. (1990): Adaptive multiple-band CFAR detection of an optical pattern with unknown spectral distribution. *IEEE Trans. Acoustics, Speech, and Signal Processing* 38(10), 1760–1770.
- Stern, E. (Hg.) (1993/2008): *The New Encyclopedia of Archaeological Excavations in the Holy Land*, Bd. 1–5. Jerusalem.
- Zanaga, D. et al. (2022): ESA WorldCover 10 m 2021 v200. doi:10.5281/zenodo.7254221."""

GRENZEN = """\
1. **Auflösung.** Sentinel-2 löst 10 m auf. Einzelne Mauern (0,5–2 m) sind nicht abbildbar; erfassbar sind nur flächige oder lange Strukturen ab etwa 20 m (Einfriedungen, Ruinenhügel, Terrassen- und Wegesysteme, Siedlungsböden).
2. **Keine Datierung.** Aus Satellitendaten lässt sich kein Alter ableiten. Die Zuordnung zur Zeit des Ersten oder Zweiten Tempels ist ausschließlich räumlicher Kontext aus Katalogangaben benachbarter Fundstellen und bleibt eine Hypothese, bis Oberflächenkeramik oder Grabung sie prüft.
3. **Falsch-Positive.** Der Schwellenwert ist adaptiv: in jeder Kachel wird definitionsgemäß das auffälligste 1 % der Fläche markiert – auch wenn dort nichts Archäologisches liegt. Moderne Feldgrenzen, Fahrspuren, Bewässerung, Brandflächen, Steinbrüche und Geologie erzeugen dieselben Signale.
4. **„Nicht in offenen Katalogen“ ≠ unbekannt.** Abgeglichen wird nur gegen Wikidata und OpenStreetMap. Der Archaeological Survey of Israel der Israel Antiquities Authority (IAA) führt weit mehr Fundstellen; jeder Kandidat ist dort zu prüfen, bevor von einer Neuentdeckung gesprochen wird.
5. **Validierung misst Sichtbares.** Katalogisierte Fundstellen sind oft freigelegt, touristisch erschlossen oder ungenau verortet (±100 m und mehr). Eine AUC > 0,5 zeigt, dass die Methode solche Orte überzufällig findet – nicht, dass sie verschüttete Strukturen erkennt.
6. **Prioritätsindex ist keine Wahrscheinlichkeit.** Er ordnet Kandidaten für die Sichtprüfung; die Gewichte sind fachlich begründet, aber nicht statistisch kalibriert.
7. **Rechtlicher Rahmen.** Geländearbeit, Oberflächenfunde und Grabungen unterliegen dem israelischen Antikengesetz (1978) und bedürfen einer Lizenz der IAA bzw. der jeweils zuständigen Behörde. Dieses Programm arbeitet ausschließlich mit Fernerkundungsdaten."""


def _val(v: dict | None) -> str:
    if not v:
        return "noch nicht auswertbar (weniger als 5 Fundstellen)"
    p = v["p_einseitig"]
    k = lambda x: f"{x:.3f}".replace(".", ",")  # noqa: E731
    ps = "< 0,001" if p < 0.001 else k(p)
    return (f"AUC = {k(v['auc'])} (95-%-KI {k(v['ki95'][0])}–{k(v['ki95'][1])}; "
            f"n = {v['n']} Fundstellen in {v['n_kacheln']} Kacheln; p = {ps}, {v['verfahren']}; "
            f"{v['anteil_top10'] * 100:.0f} % der Fundstellen im obersten Dezil)")


def urteil(v: dict | None) -> str:
    """Nüchterne Einordnung der Validierung – wird automatisch fortgeschrieben."""
    if not v:
        return ("Für eine Aussage zur Trennschärfe liegen noch zu wenige Referenzfundstellen "
                "in den ausgewerteten Kacheln.")
    if v["ki95"][0] > 0.5:
        return ("**Befund:** Bekannte Fundstellen liegen überzufällig häufig in Anomalien; das "
                "Verfahren hat für katalogisierte Fundstellen nachweisbare Trennschärfe.")
    if v["ki95"][1] < 0.5:
        return ("**Befund:** Bekannte Fundstellen sind *weniger* auffällig als Zufallspunkte – "
                "die Anomalien werden von anderen Ursachen bestimmt.")
    return ("**Befund:** Derzeit ist **nicht nachweisbar**, dass das Verfahren bekannte "
            "Fundstellen besser findet als der Zufall (das Konfidenzintervall schließt 0,5 "
            "ein). Die Kandidaten sind entsprechend zurückhaltend zu bewerten.")


def _zeile(p: dict, lonlat) -> str:
    nf = p.get("naechster_fundort")
    nah = f"{nf['name']} ({nf['distanz_m']} m)" if nf else "–"
    ktx = "; ".join(f"{k['name']}: {'+'.join(k['perioden'])}" for k in p["kontext"][:2]) or "–"
    return (f"| [{p['id']}](https://www.google.com/maps/@{lonlat[1]:.5f},{lonlat[0]:.5f},300m/data=!3m1!1e3) "
            f"| {p['score']:.0f} | {p['klasse']} | {p['laenge_m']:.0f} × {p['breite_m']:.0f} "
            f"| {p['rx_relativ']:.1f} | {p['n_beob']}/{p['n_laeufe']} | {p['landbedeckung']} "
            f"| {nah} | {ktx} |")


def schreiben(aus: Path, ueb: dict, kacheln: dict, lauf: dict, metas: list[dict]) -> None:
    pk = aus / "data/kandidaten.geojson"
    kand = json.loads(pk.read_text("utf-8"))["features"] if pk.exists() else []
    aktuell = [f for f in kand if f["properties"]["kachel"] in lauf["kacheln"]
               and f["properties"]["zuletzt"] == lauf["datum"]]
    kopf = ("| ID (Luftbild) | Index | Klasse | L × B (m) | RX rel. | Beob. | Landbedeckung "
            "| nächste Fundstelle | Perioden-Kontext |\n|---|---|---|---|---|---|---|---|---|")
    z = [f"# Seker – Prospektionsbericht {lauf['datum']}", "",
         f"*Automatisch erzeugt · Lauf `{lauf['id']}` · Methode v{lauf['methode']} · "
         f"Commit `{lauf['commit']}` · {lauf['umgebung']}*", "",
         "## 1 Zusammenfassung", "",
         f"In diesem Lauf wurden **{lauf['ok']} Kacheln** (je ca. 26 km²) ausgewertet"
         + (f", {lauf['fehler']} schlugen fehl" if lauf["fehler"] else "") + ". "
         f"Dabei wurden **{lauf['neu']} neue Kandidaten** erfasst, {lauf['wiedererkannt']} "
         f"frühere wiedererkannt und {lauf['entfallen']} nicht bestätigte gestrichen.", "",
         f"Gesamtstand: {ueb['kacheln_ok']} von {ueb['kacheln_gesamt']} Kacheln "
         f"(≈ {ueb['flaeche_km2']:.0f} km² auswertbare Fläche), **{ueb['kandidaten']} Kandidaten**, "
         f"davon {ueb['kandidaten_unregistriert']} nicht in offenen Katalogen und "
         f"{ueb['kandidaten_bestaetigt']} in mindestens zwei Läufen beobachtet. "
         f"Referenzbestand: {ueb['fundorte']} katalogisierte Fundstellen "
         f"({ueb['fundorte_et']} mit Beleg Erster Tempel, {ueb['fundorte_zt']} Zweiter Tempel).", "",
         f"Validierung gegen bekannte Fundstellen (kumulativ): {_val(ueb['validierung'])}.", "",
         urteil(ueb["validierung"]), "",
         "> **Lesehinweis.** Kandidaten sind *Anomalien mit Prüfbedarf*, keine Entdeckungen. "
         "Siehe Abschnitt 6.", "",
         "## 2 Datengrundlage dieses Laufs", "",
         "| Kachel | Region | Szenen Frühjahr | Szenen Spätsommer | auswertbar | OSM-Maske | Fundstellen | Kandidaten |",
         "|---|---|---|---|---|---|---|---|"]
    for m in metas:
        if m["status"] != "ok":
            z.append(f"| {m['id']} | {m['region_name']} | – | – | – | – | – | Fehler: {m['fehler']} |")
            continue
        sz = lambda s: ", ".join(x["datum"] for x in m["szenen"][s])  # noqa: E731
        z.append(f"| {m['id']} | {m['region_name']} | {sz('feucht')} | {sz('trocken')} "
                 f"| {m['anteil_auswertbar'] * 100:.0f} % | {'ja' if m['osm_maske'] else '**nein**'} "
                 f"| {m['n_fundorte']} | {m['n_kandidaten']} |")
    z += ["", "Quellen: Sentinel-2 L2A (Copernicus, ESA; über Earth Search/AWS), Copernicus DEM "
          "GLO-30, ESA WorldCover 2021 v200, OpenStreetMap (ODbL), Wikidata (CC0). "
          "Die vollständigen Szenen-IDs stehen in `data/kacheln.json`.", "",
          "## 3 Methodik (Kurzfassung)", "",
          "1. **Saisonale Komposite.** Je Kachel der pixelweise Median aus bis zu "
          f"{C.JAHRE_ZURUECK} wolkenarmen Szenen des Frühjahrs (Bewuchsmerkmale) und des "
          "Spätsommers (Bodenmerkmale), Wolken/Schatten per Scene Classification maskiert.",
          "2. **Merkmale.** " + "; ".join(MERKMAL_TEXT.values()) + ".",
          "3. **Lokaler Kontrast.** Jedes Merkmal minus Gauß-Hintergrund "
          f"(σ = {C.HOCHPASS_SIGMA_PX * C.PIXEL_M} m), robust standardisiert (Median/MAD).",
          "4. **Multivariate Anomalie.** Reed-Xiaoli-Detektor (Mahalanobis-Distanz zur robust "
          "geschätzten Hintergrundverteilung), zusätzlich getrennt je Saison.",
          f"5. **Objektbildung.** Schwelle am {C.RX_QUANTIL * 100:.0f}-%-Quantil der Kachel, "
          f"zusammenhängende Flächen von {C.MIN_PX * 100} m² bis {C.MAX_PX / 100:.0f} ha; "
          "Form über Hauptachsenanalyse (Länge, Breite, Rechteckigkeit, Azimut).",
          "6. **Ausschluss moderner Störungen.** Bebauung und Wasser (WorldCover), Straßen, "
          "Bahnen, Leitungen, Zäune, Industrie-/Abbauflächen (OpenStreetMap), jeweils gepuffert; "
          "im Spätsommer grüne (bewässerte/immergrüne) Flächen.",
          "7. **Prioritätsindex 0–100.** 35 % Anomaliestärke, 25 % Persistenz in beiden "
          "Jahreszeiten, 20 % geometrische Regelmäßigkeit, 10 % Relieflage (Local Relief "
          "Model), 10 % Landnutzungskontext.",
          "8. **Validierung.** Anomaliestärke im 150-m-Umkreis bekannter Fundstellen als "
          "Perzentil gegenüber 300 Zufallspunkten derselben Kachel; Mittelwert = stratifizierte AUC, "
          "Unsicherheit per Cluster-Bootstrap über Kacheln.",
          "", "Vollständige Beschreibung: [`METHODIK.md`](../METHODIK.md).", "",
          "## 4 Ergebnisse dieses Laufs", ""]
    if aktuell:
        z += [f"{len(aktuell)} Kandidaten, absteigend nach Prioritätsindex "
              "(Beob. = Beobachtungen/Läufe der Kachel):", "", kopf]
        z += [_zeile(f["properties"], f["geometry"]["coordinates"])
              for f in sorted(aktuell, key=lambda f: -f["properties"]["score"])]
        z += ["", "### Arbeitshypothesen der zehn höchstgereihten Kandidaten", ""]
        for f in sorted(aktuell, key=lambda f: -f["properties"]["score"])[:10]:
            p, (lon, lat) = f["properties"], f["geometry"]["coordinates"]
            z.append(f"- **{p['id']}** ({lat:.5f}° N, {lon:.5f}° E; {p['region']}): {p['deutung']} "
                     + ("Liegt bei einer katalogisierten Fundstelle (Positivkontrolle)."
                        if p["bekannt"] else "Nicht in Wikidata/OSM verzeichnet – IAA-Survey prüfen."))
    else:
        z.append("Keine Kandidaten oberhalb des Mindestindex.")
    z += ["", "## 5 Validierung", "", urteil(ueb["validierung"]), "",
          f"- **Gesamt:** {_val(ueb['validierung'])}"]
    z += [f"- {r['name']}: {_val(r['validierung'])}" for r in ueb["regionen"].values()
          if r["kacheln_ok"]]
    z += ["", "AUC = 0,5 entspricht Zufall. Werte deutlich darüber zeigen, dass bekannte "
          "Fundstellen überzufällig häufig in Anomalien liegen.", "",
          "## 6 Einschränkungen", "", GRENZEN, "",
          "## 7 Empfohlene Prüfschritte je Kandidat", "",
          "1. Sichtprüfung im hochauflösenden Luftbild (GovMap-Orthofoto, Google Earth "
          "einschließlich historischer Aufnahmen) – moderne Ursache ausschließen.",
          "2. Abgleich mit dem Archaeological Survey of Israel (survey.antiquities.org.il) "
          "und den Karten des Survey of Western Palestine (1871–77).",
          "3. Bei fortbestehendem Verdacht: Meldung an die IAA; Begehung nur mit Genehmigung.",
          "", "## 8 Fortschritt nach Regionen", "",
          "| Region | Kacheln | Kandidaten | Validierung |", "|---|---|---|---|"]
    z += [f"| {r['name']} | {r['kacheln_ok']}/{r['kacheln_gesamt']} | {r['kandidaten']} "
          f"| {_val(r['validierung']) if r['kacheln_ok'] else '–'} |"
          for r in ueb["regionen"].values()]
    z += ["", "## 9 Literatur", "", LITERATUR, ""]
    text = "\n".join(z)
    (aus / "berichte").mkdir(parents=True, exist_ok=True)
    (aus / "berichte" / f"{lauf['datum']}.md").write_text(text, "utf-8")
    liste = sorted(p.stem for p in (aus / "berichte").glob("*.md"))
    (aus / "berichte" / "index.json").write_text(json.dumps(liste) + "\n", "utf-8")
