"""Zentrale, versionierte Parameter. Jede Änderung hier ändert die Methode
und wird über `METHODEN_VERSION` in allen Ergebnissen dokumentiert."""
from __future__ import annotations

METHODEN_VERSION = "1.0.0"

# Untersuchungsräume (W, S, E, N in WGS84). Reihenfolge = Priorität.
REGIONEN = [
    {"id": "schefela", "name": "Schefela (Ela-Tal, Lachisch)", "bbox": (34.80, 31.55, 35.05, 31.80)},
    {"id": "jerusalem", "name": "Jerusalem und Umland", "bbox": (35.10, 31.70, 35.30, 31.85)},
    {"id": "benjamin", "name": "Benjamin-Plateau", "bbox": (35.15, 31.85, 35.35, 32.00)},
    {"id": "juda", "name": "Judäisches Bergland (Bethlehem–Hebron)", "bbox": (35.00, 31.40, 35.25, 31.70)},
    {"id": "beerscheba", "name": "Beerscheba–Arad-Becken", "bbox": (34.75, 31.20, 35.20, 31.35)},
    {"id": "wueste", "name": "Judäische Wüste", "bbox": (35.25, 31.30, 35.45, 31.75)},
    {"id": "negev", "name": "Negev-Hochland", "bbox": (34.60, 30.75, 34.95, 31.05)},
    {"id": "kueste", "name": "Südliche Küstenebene (Philistäa)", "bbox": (34.55, 31.60, 34.80, 31.80)},
    {"id": "samaria", "name": "Samarisches Bergland", "bbox": (35.10, 32.10, 35.35, 32.35)},
    {"id": "jesreel", "name": "Jesreel-Ebene", "bbox": (35.05, 32.50, 35.45, 32.65)},
    {"id": "galilaea", "name": "Untergaliläa", "bbox": (35.20, 32.70, 35.55, 32.90)},
    {"id": "hula", "name": "Hula-Tal (Hazor, Dan)", "bbox": (35.50, 33.00, 35.70, 33.25)},
]

KACHEL_GRAD = 0.05          # Kachelgröße (~4,7 x 5,5 km)
RAND_M = 200                # Rand für Filter-Randeffekte (wird nicht ausgewertet)
PIXEL_M = 10                # Sentinel-2-Auflösung der 10-m-Bänder

# Szenenwahl
JAHRE_ZURUECK = 4           # je Saison die jeweils beste Szene aus N Jahren
MAX_WOLKEN = 15.0           # Szenen-Wolkenbedeckung in %
SAISONS = {
    "feucht": ((2, 15), (4, 15)),   # Vegetationsmaximum -> Bewuchsmerkmale
    "trocken": ((7, 15), (9, 30)),  # offener Boden -> Bodenmerkmale
}
SCL_UNGUELTIG = (0, 1, 3, 8, 9, 10)  # NoData, defekt, Wolkenschatten, Wolken, Zirrus

# Detektion
NDVI_TROCKEN_MAX = 0.40     # darüber: bewässert/immergrün -> nicht auswertbar
HOCHPASS_SIGMA_PX = 15      # 150 m lokaler Hintergrund
RX_QUANTIL = 0.99           # adaptiver Schwellenwert (CFAR-artig)
MIN_PX, MAX_PX = 4, 800     # 400 m² … 8 ha
MAX_KANDIDATEN_JE_KACHEL = 12
MIN_SCORE = 30.0
ABGLEICH_M = 60             # Wiedererkennung eines Kandidaten über Läufe
BEKANNT_M = 300             # Kandidat gilt als "bei bekanntem Fundort"
KONTEXT_M = 3000            # Radius für Perioden-Kontext

# Validierung
VAL_RADIUS_PX = 15          # 150 m (Koordinatenunschärfe der Kataloge)
VAL_KONTROLLEN = 300

# Landbedeckung ESA WorldCover
WC_KLASSEN = {10: "Baumbestand", 20: "Strauchland", 30: "Grasland", 40: "Ackerland",
              50: "Bebaut", 60: "Vegetationsarm/kahl", 80: "Wasser", 90: "Feuchtgebiet",
              0: "unbekannt"}

STAC_URL = "https://earth-search.aws.element84.com/v1/search"
DEM_URL = "https://copernicus-dem-30m.s3.amazonaws.com/{n}/{n}.tif"
WC_URL = ("https://esa-worldcover.s3.eu-central-1.amazonaws.com/v200/2021/map/"
          "ESA_WorldCover_10m_2021_v200_{t}_Map.tif")
WIKIDATA_URL = "https://query.wikidata.org/sparql"
USER_AGENT = "seker-prospektion/1.0 (archaeological remote-sensing research; python-requests)"


def kachel_id(lon: float, lat: float) -> str:
    return f"T{round(lon * 100):04d}_{round(lat * 100):04d}"


def alle_kacheln() -> list[dict]:
    """Alle Kacheln, regionsweise verschränkt (Round-Robin), damit jeder
    Lauf mehrere Landschaften abdeckt. Deterministisch."""
    je_region = []
    for r in REGIONEN:
        w, s, e, n = r["bbox"]
        ks = []
        ny = round((n - s) / KACHEL_GRAD)
        nx = round((e - w) / KACHEL_GRAD)
        for j in range(ny):
            for i in range(nx):
                lon = round(w + i * KACHEL_GRAD, 2)
                lat = round(s + j * KACHEL_GRAD, 2)
                ks.append({"id": kachel_id(lon, lat), "region": r["id"],
                           "region_name": r["name"],
                           "bbox": (lon, lat, round(lon + KACHEL_GRAD, 2),
                                    round(lat + KACHEL_GRAD, 2))})
        # von der Regionsmitte nach außen
        cx, cy = (w + e) / 2, (s + n) / 2
        ks.sort(key=lambda k: (k["bbox"][0] + KACHEL_GRAD / 2 - cx) ** 2
                + (k["bbox"][1] + KACHEL_GRAD / 2 - cy) ** 2)
        je_region.append(ks)
    out, seen, i = [], set(), 0
    while any(je_region):
        ks = je_region[i % len(je_region)]
        if ks:
            k = ks.pop(0)
            if k["id"] not in seen:
                seen.add(k["id"])
                out.append(k)
        i += 1
    return out
