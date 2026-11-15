"""Standorte, Entwurfsparameter und Planungsannahmen (alle Richtwerte offen
gelegt; jede Änderung ändert die Pläne und wird über PLAN_VERSION sichtbar)."""
from __future__ import annotations

PLAN_VERSION = "1.0.0"
PIXEL_M = 10
FENSTER_PX = 480            # 4,8 x 4,8 km Planausschnitt
EPSG = 32636                # UTM 36N für alle Standorte

# --- Davidische Orte: Neugründung NEBEN dem Bodendenkmal -------------------
# Koordinaten der antiken Stätte aus Wikidata; die Ruine selbst bleibt als
# archäologischer Park unbebaut (Kernzone + Pufferzone).
DAVIDISCH = [
    {"id": "schaarajim", "name": "Scha'arajim", "he": "שַׁעֲרַיִם", "antik": "Khirbet Qeiyafa",
     "lon": 34.9575, "lat": 31.6963, "kern_m": 260, "ziel_ew": 24000, "regen_mm": 480,
     "bezug": "1 Sam 17,52 – befestigte Stadt über dem Ela-Tal, um 1000 v. Chr. datiert; "
              "die Gleichsetzung mit Scha'arajim und die Zuweisung an Davids Königtum "
              "(Garfinkel) sind in der Forschung umstritten."},
    {"id": "adullam", "name": "Adullam", "he": "עֲדֻלָּם", "antik": "Khirbet esh-Sheikh Madhkur",
     "lon": 35.003056, "lat": 31.654722, "kern_m": 280, "ziel_ew": 16000, "regen_mm": 500,
     "bezug": "1 Sam 22,1 – Höhle Adullam, Zuflucht Davids; 2 Sam 23,13."},
    {"id": "gat", "name": "Gat", "he": "גַּת", "antik": "Tell es-Safi / Tel Zafit",
     "lon": 34.846694, "lat": 31.699375, "kern_m": 450, "ziel_ew": 20000, "regen_mm": 430,
     "bezug": "1 Sam 21,11; 27,2–4 – David bei Achisch, König von Gat."},
    {"id": "ziklag", "name": "Ziklag", "he": "צִקְלַג", "antik": "Khirbet a-Ra'i (Kandidat)",
     "lon": 34.819278, "lat": 31.590988, "kern_m": 220, "ziel_ew": 18000, "regen_mm": 400,
     "bezug": "1 Sam 27,6; 30 – von Achisch an David gegeben. Die Lage ist ungeklärt "
              "(Vorschläge u. a. Khirbet a-Ra'i, Tel Sera', Tel Halif); hier als Arbeitsannahme."},
    {"id": "beerscheba", "name": "Be'er Scheva ha-Atika", "he": "בְּאֵר שֶׁבַע", "antik": "Tel Be'er Sheva",
     "lon": 34.840833, "lat": 31.244722, "kern_m": 300, "ziel_ew": 20000, "regen_mm": 200,
     "bezug": "2 Sam 24,2.7 – Südgrenze der Volkszählung Davids („von Dan bis Beerscheba“)."},
    {"id": "engedi", "name": "En Gedi", "he": "עֵין גֶּדִי", "antik": "Tel Goren",
     "lon": 35.388469, "lat": 31.45999, "kern_m": 200, "ziel_ew": 6000, "regen_mm": 70,
     "bezug": "1 Sam 24,1 – Bergfesten von En Gedi. Naturschutzgebiet und Steilstufe "
              "begrenzen die Bebaubarkeit stark."},
]

# --- Davidische Orte in Judäa und Samaria (Westjordanland) -------------------
# Auf Wunsch des Auftraggebers aufgenommen. Status, Eigentum und bestehende
# Nutzung sind dort nicht geprüft; jeder Plan trägt diesen Hinweis.
# Hebron (Tel Rumeida) ist bewusst nicht enthalten: Der Tell liegt mitten in der
# bestehenden Großstadt; im Umkreis gibt es kein freies Land für eine Neugründung.
HINWEIS_JS = ("Der Standort liegt in Judäa und Samaria (Westjordanland). Der völker- und "
              "planungsrechtliche Status (Gebiete A/B/C), Eigentumsverhältnisse und bestehende "
              "Nutzungen sind nicht geprüft; bestehende Ortschaften bleiben im Entwurf unangetastet.")
DAVIDISCH += [
    {"id": "keila", "name": "Keila", "he": "קְעִילָה", "antik": "Khirbet Qila",
     "lon": 35.003044, "lat": 31.616294, "kern_m": 220, "ziel_ew": 15000, "regen_mm": 480,
     "bezug": "1 Sam 23,1–13 – David befreit Keila von den Philistern.", "hinweis": HINWEIS_JS},
    {"id": "sif", "name": "Sif", "he": "זִיף", "antik": "Tel Zif",
     "lon": 35.13514, "lat": 31.47475, "kern_m": 220, "ziel_ew": 14000, "regen_mm": 350,
     "bezug": "1 Sam 23,14–24; 26,1–2 – David in der Wüste Sif.", "hinweis": HINWEIS_JS},
    {"id": "maon", "name": "Maon", "he": "מָעוֹן", "antik": "Khirbet Ma'in",
     "lon": 35.133839, "lat": 31.409448, "kern_m": 220, "ziel_ew": 12000, "regen_mm": 300,
     "bezug": "1 Sam 23,24–25; 25,2 – Wüste Maon; Nabal und Abigajil im benachbarten Karmel "
              "(Khirbet al-Karmil, 1,5 km nördlich).", "hinweis": HINWEIS_JS},
    {"id": "tekoa", "name": "Tekoa", "he": "תְּקוֹעַ", "antik": "Khirbet Tuqu'",
     "lon": 35.21129, "lat": 31.63285, "kern_m": 220, "ziel_ew": 12000, "regen_mm": 350,
     "bezug": "2 Sam 14,2 – die kluge Frau aus Tekoa; 2 Sam 23,26 – Ira aus Tekoa, einer der Helden Davids.",
     "hinweis": HINWEIS_JS},
    {"id": "baal_hazor", "name": "Baal-Hazor", "he": "בַּעַל חָצוֹר", "antik": "Tell Asur (Berg Hazor)",
     "lon": 35.28361, "lat": 31.98, "kern_m": 250, "ziel_ew": 10000, "regen_mm": 650,
     "bezug": "2 Sam 13,23 – Schafschur Absaloms bei Baal-Hazor in Samaria; höchster Berg des "
              "samarischen Berglands (1.016 m).", "hinweis": HINWEIS_JS},
]

# --- Suchräume für völlig neue Städte (Standort wird berechnet) ------------
SUCHRAEUME = [
    {"id": "neu_negev_nord", "name": "Ir David ha-Negev (Arbeitstitel)", "he": "עִיר דָּוִד הַנֶּגֶב",
     "bbox": (34.86, 31.26, 35.08, 31.40), "ziel_ew": 30000, "regen_mm": 230,
     "bezug": "Neugründung im nördlichen Negev zwischen Beerscheba und Arad."},
    {"id": "neu_lachisch", "name": "Kirjat Lachisch (Arbeitstitel)", "he": "קִרְיַת לָכִישׁ",
     "bbox": (34.72, 31.48, 34.92, 31.60), "ziel_ew": 28000, "regen_mm": 380,
     "bezug": "Neugründung im Lachisch-Hügelland der südlichen Schefela."},
    {"id": "neu_arava", "name": "Neve Arava (Arbeitstitel)", "he": "נְוֵה עֲרָבָה",
     "bbox": (35.08, 30.78, 35.26, 30.98), "ziel_ew": 12000, "regen_mm": 45,
     "bezug": "Oasenstadt in der nördlichen Arava mit vollständigem Wasserkreislauf."},
]

GRUENDUNGSFOLGE = ["schaarajim", "neu_negev_nord", "adullam", "keila", "gat",
                   "neu_lachisch", "sif", "ziklag", "maon", "beerscheba", "tekoa",
                   "neu_arava", "baal_hazor", "engedi"]

# --- Geländeregeln ----------------------------------------------------------
HANG_TABU = 30.0            # % – darüber keine Bebauung
HANG_TERRASSE = 15.0        # % – darüber nur Terrassenbauweise
WADI_EINZUG_KM2 = 0.30      # ab diesem Einzugsgebiet gilt eine Rinne als Wadi
WADI_PUFFER_M = 40
DENKMAL_PUFFER_M = 150
FUNDSTELLE_RADIUS_M = 120   # jede weitere katalogisierte Fundstelle (aus Seker)
VERDACHT_RADIUS_M = 60      # Seker-Kandidaten mit hohem Index: Vorerkundung

# --- Stadtgeometrie ---------------------------------------------------------
HOEHEN_GEWICHT = 5.0        # 1 m Höhenunterschied zählt wie 5 m Weg -> Ringe folgen dem Hang
KERN_RADIUS = 95.0
RING_ABSTAND = 72.0
MAX_RINGE = 17
HAUPTACHSEN = 6
STRASSE = {"ring": 12, "hauptring": 18, "radial": 8, "achse": 16}

# Zone -> (GRZ, Geschosse, Wohnanteil, Gebäudelänge, Gebäudetiefe)
ZONEN = {
    "misch": (0.45, 5, 0.65, 36, 14),
    "wohnen_hoch": (0.38, 4, 1.0, 30, 13),
    "wohnen_mittel": (0.34, 3, 1.0, 24, 12),
    "wohnen_niedrig": (0.30, 2, 1.0, 14, 11),
    "gewerbe": (0.40, 3, 0.0, 48, 22),
    "gemeinbedarf": (0.28, 2, 0.0, 40, 18),
}
ZONEN_NAME = {
    "zentrum": "Zentrum / Stadtplatz", "misch": "Arkadenring (Mischnutzung)",
    "wohnen_hoch": "Wohnen, Terrassenhäuser (4 G.)", "wohnen_mittel": "Wohnen, Stadthäuser (3 G.)",
    "wohnen_niedrig": "Wohnen, Hofhäuser (2 G.)", "gewerbe": "Gewerbe / Technologie",
    "gemeinbedarf": "Quartierszentrum (Schule, Synagoge, Mikwe)", "park": "Quartierspark",
    "gruen": "Landschaftsraum", "wald": "Wald (Bestand)", "archaeologie": "Archäologischer Park",
    "bestand": "Bestehende Bebauung",
}

# --- Planungsannahmen (Richtwerte, keine Normen) ----------------------------
ANNAHMEN = {
    "haushalt_personen": 3.4, "bgf_je_we_m2": 110, "bgf_je_arbeitsplatz_m2": 35,
    "wasser_m3_je_ew_jahr": 90, "abwasser_rueckgewinnung": 0.65, "abfluss_beiwert": 0.7,
    "strom_kwh_je_ew_jahr": 4500, "pv_kwh_je_kwp": 1700, "pv_m2_je_kwp": 5.5,
    "dach_nutzbar": 0.5, "freiraum_ziel_m2_je_ew": 10, "ew_je_grundschule": 4500,
    "ew_je_kita_gruppe": 700, "ew_je_synagoge": 1500, "erwerbsquote": 0.42,
}
