"""Merkmalsberechnung, Anomaliedetektion, Objektbildung und Validierung.

Reine NumPy/SciPy-Funktionen ohne Netz-Zugriff – vollständig testbar.
"""
from __future__ import annotations

import math
import warnings

import numpy as np
from scipy import ndimage as ndi

from . import config as C

MERKMALE = ("ndvi_feucht", "ndmi_feucht", "hell_feucht",
            "ndvi_trocken", "bsi_trocken", "hell_trocken", "ton_trocken")
FEUCHT, TROCKEN = (0, 1, 2), (3, 4, 5, 6)
MERKMAL_TEXT = {
    "ndvi_feucht": "Vegetationsvitalität im Frühjahr (NDVI)",
    "ndmi_feucht": "Blattwasser/Bodenfeuchte im Frühjahr (NDMI)",
    "hell_feucht": "Helligkeit im Frühjahr",
    "ndvi_trocken": "Vegetation im Spätsommer (NDVI)",
    "bsi_trocken": "Bare-Soil-Index im Spätsommer",
    "hell_trocken": "Bodenhelligkeit im Spätsommer",
    "ton_trocken": "SWIR-Verhältnis (Ton-/Karbonatanteil) im Spätsommer",
}


def _nd(a, b):
    with np.errstate(divide="ignore", invalid="ignore"):
        return (a - b) / (a + b)


def merkmale(feucht: np.ndarray, trocken: np.ndarray) -> np.ndarray:
    """Komposite (6,H,W: blau, grün, rot, NIR, SWIR1, SWIR2) -> (7,H,W)."""
    def idx(k):
        b, g, r, n, s1, s2 = k
        with np.errstate(divide="ignore", invalid="ignore"):
            bsi = ((s1 + r) - (n + b)) / ((s1 + r) + (n + b))
            ton = s1 / s2
        return _nd(n, r), _nd(n, s1), (b + g + r + n) / 4, bsi, ton
    nf, mf, hf, _, _ = idx(feucht)
    nt, _, ht, bt, tt = idx(trocken)
    return np.stack([nf, mf, hf, nt, bt, ht, tt]).astype(np.float32)


def hochpass(a: np.ndarray, gueltig: np.ndarray, sigma: float) -> np.ndarray:
    """Abweichung vom lokalen Hintergrund (normalisierte Gauß-Faltung, die
    maskierte Pixel ignoriert)."""
    v = gueltig & np.isfinite(a)
    num = ndi.gaussian_filter(np.where(v, a, 0).astype(np.float32), sigma, mode="nearest")
    den = ndi.gaussian_filter(v.astype(np.float32), sigma, mode="nearest")
    with np.errstate(divide="ignore", invalid="ignore"):
        out = a - num / den
    out[~v | (den < 0.2)] = np.nan
    return out


def robust_z(a: np.ndarray) -> np.ndarray:
    with warnings.catch_warnings():
        warnings.simplefilter("ignore", RuntimeWarning)
        med = np.nanmedian(a)
        mad = np.nanmedian(np.abs(a - med)) * 1.4826
    return (a - med) / max(float(mad), 1e-6)


def rx(z: np.ndarray) -> np.ndarray:
    """Reed-Xiaoli-Detektor: quadrierte Mahalanobis-Distanz je Pixel zur
    robust geschätzten Hintergrundverteilung, geteilt durch die Zahl der
    Merkmale (Erwartungswert 1 unter Normalverteilung)."""
    k = z.shape[0]
    ok = np.isfinite(z).all(0)
    x = z[:, ok].T.astype(np.float64)
    out = np.full(z.shape[1:], np.nan, np.float32)
    if x.shape[0] < 50 * k:
        return out
    kern = (np.abs(x) < 3).all(1)
    if kern.sum() < 20 * k:
        kern[:] = True
    mu = x[kern].mean(0)
    cov = np.atleast_2d(np.cov(x[kern].T)) + 1e-6 * np.eye(k)
    d = x - mu
    out[ok] = (np.einsum("ij,jk,ik->i", d, np.linalg.inv(cov), d) / k).astype(np.float32)
    return out


def relief(dem: np.ndarray) -> tuple[np.ndarray, np.ndarray]:
    """Local Relief Model (DEM minus 300-m-Tiefpass) und Hangneigung in Grad."""
    d = np.where(np.isfinite(dem), dem, np.nanmean(dem) if np.isfinite(dem).any() else 0)
    lrm = d - ndi.gaussian_filter(d, 30, mode="nearest")
    gy, gx = np.gradient(ndi.gaussian_filter(d, 1.5), C.PIXEL_M)
    return lrm.astype(np.float32), np.degrees(np.arctan(np.hypot(gx, gy))).astype(np.float32)


def detektion(feucht, trocken, ausschluss: np.ndarray) -> dict:
    """Kern der Methode. `ausschluss` = moderne Störflächen (True)."""
    f = merkmale(feucht, trocken)
    gueltig = ~ausschluss & np.isfinite(f).all(0)
    z = np.stack([robust_z(hochpass(b, gueltig, C.HOCHPASS_SIGMA_PX)) for b in f])
    d_alle, d_f, d_t = rx(z), rx(z[list(FEUCHT)]), rx(z[list(TROCKEN)])
    return {"z": z, "rx": d_alle, "rx_feucht": d_f, "rx_trocken": d_t, "gueltig": gueltig}


def _form(ys: np.ndarray, xs: np.ndarray) -> dict:
    p = np.stack([xs, ys]).astype(np.float64) * C.PIXEL_M
    c = p.mean(1, keepdims=True)
    if p.shape[1] < 3:
        return {"laenge_m": 20.0, "breite_m": 10.0, "elongation": 2.0,
                "rechteckigkeit": 1.0, "azimut": 0.0}
    w, v = np.linalg.eigh(np.cov(p - c))
    haupt, neben = v[:, 1], v[:, 0]
    l = np.ptp((p - c).T @ haupt) + C.PIXEL_M
    b = np.ptp((p - c).T @ neben) + C.PIXEL_M
    az = math.degrees(math.atan2(haupt[0], -haupt[1])) % 180
    return {"laenge_m": float(l), "breite_m": float(b), "elongation": float(l / b),
            "rechteckigkeit": float(min(1.0, p.shape[1] * C.PIXEL_M ** 2 / (l * b))),
            "azimut": float(az)}


def _klasse(fo: dict, lrm_mittel: float) -> str:
    if fo["elongation"] >= 4:
        return "linear"
    if lrm_mittel >= 3 and fo["elongation"] < 2.5:
        return "erhöht-kompakt"
    if fo["rechteckigkeit"] >= 0.7 and fo["elongation"] < 3:
        return "rechteckig-kompakt"
    return "unregelmäßig"


def objekte(det: dict, innen: np.ndarray, lrm, hang, wc) -> tuple[list[dict], float, np.ndarray]:
    """Segmentiert Anomalien zu Objekten und beschreibt sie.
    -> (Objekte, Schwellenwert, Label-Raster)"""
    d, g = det["rx"], det["gueltig"]
    if not np.isfinite(d[g]).any():
        return [], float("nan"), np.zeros(d.shape, np.int32)
    glatt = ndi.gaussian_filter(np.nan_to_num(d), 0.6)
    schwelle = float(np.nanquantile(d[g], C.RX_QUANTIL))
    q_f = float(np.nanquantile(det["rx_feucht"][g], 0.95))
    q_t = float(np.nanquantile(det["rx_trocken"][g], 0.95))
    labels, n = ndi.label((glatt > schwelle) & g & np.isfinite(d), structure=np.ones((3, 3)))
    out = []
    for i, sl in enumerate(ndi.find_objects(labels), start=1):
        m = labels[sl] == i
        npx = int(m.sum())
        if not C.MIN_PX <= npx <= C.MAX_PX:
            continue
        ys, xs = np.nonzero(m)
        ys, xs = ys + sl[0].start, xs + sl[1].start
        cy, cx = ys.mean(), xs.mean()
        if not innen[int(round(cy)), int(round(cx))]:
            continue
        fo = _form(ys, xs)
        rxm = float(np.nanmean(d[ys, xs]))
        zf = np.nanmean(det["z"][:, ys, xs], axis=1)
        pf = float(np.mean(det["rx_feucht"][ys, xs] > q_f))
        pt = float(np.mean(det["rx_trocken"][ys, xs] > q_t))
        lrm_m, hang_m = float(np.nanmean(lrm[ys, xs])), float(np.nanmean(hang[ys, xs]))
        kl = np.bincount(wc[ys, xs], minlength=101)
        lc = int(kl.argmax())
        # Teilwerte des Prioritätsindex (0..1), siehe METHODIK.md
        a = float(np.clip(math.log2(max(rxm / schwelle, 1.0)) / 3, 0, 1))
        p = float(min(pf, pt))
        geo = float(np.clip((fo["rechteckigkeit"] - 0.4) / 0.5, 0, 1))
        t = float(np.clip(lrm_m / 5, 0, 1))
        k = {40: 0.3, 10: 0.5}.get(lc, 1.0)
        score = 100 * (0.35 * a + 0.25 * p + 0.20 * geo + 0.10 * t + 0.10 * k)
        treiber = sorted(range(len(MERKMALE)), key=lambda j: -abs(zf[j]))[:3]
        out.append({
            "zeile": float(cy), "spalte": float(cx), "label": i,
            "flaeche_m2": npx * C.PIXEL_M ** 2, **{k_: round(v, 2) for k_, v in fo.items()},
            "klasse": _klasse(fo, lrm_m), "rx_mittel": round(rxm, 2),
            "rx_max": round(float(np.nanmax(d[ys, xs])), 2),
            "rx_relativ": round(rxm / schwelle, 2),
            "persistenz_feucht": round(pf, 2), "persistenz_trocken": round(pt, 2),
            "lrm_m": round(lrm_m, 2), "hang_grad": round(hang_m, 1),
            "landbedeckung": C.WC_KLASSEN.get(lc, str(lc)),
            "treiber": [{"merkmal": MERKMALE[j], "z": round(float(zf[j]), 2)} for j in treiber],
            "teilwerte": {"anomalie": round(a, 2), "persistenz": round(p, 2),
                          "geometrie": round(geo, 2), "relief": round(t, 2),
                          "kontext": round(k, 2)},
            "score": round(score, 1),
        })
    out.sort(key=lambda o: -o["score"])
    return out, schwelle, labels


def deutung(o: dict) -> str:
    """Vorsichtige, regelbasierte Arbeitshypothese (keine Bestimmung!)."""
    t = {x["merkmal"]: x["z"] for x in o["treiber"]}
    teile = []
    if t.get("ndvi_feucht", 0) <= -2 or t.get("ndmi_feucht", 0) <= -2:
        teile.append("negatives Bewuchsmerkmal (gehemmter Bewuchs – vereinbar mit "
                     "flachgründigem Boden über Mauerwerk, Pflaster oder Fels)")
    if t.get("ndvi_feucht", 0) >= 2 or t.get("ndmi_feucht", 0) >= 2:
        teile.append("positives Bewuchsmerkmal (begünstigter Bewuchs – vereinbar mit "
                     "verfüllten Gräben, Zisternen, Gruben oder Bewässerung)")
    if t.get("hell_trocken", 0) >= 2 or t.get("hell_feucht", 0) >= 2:
        teile.append("helles Bodenmerkmal (vereinbar mit Kalkstein-/Mörtelschutt, "
                     "Versturz oder freiliegendem Fels)")
    if t.get("hell_trocken", 0) <= -2:
        teile.append("dunkles Bodenmerkmal (vereinbar mit aschehaltigem/organischem "
                     "Siedlungsboden, aber auch Schatten oder Brandflächen)")
    if abs(t.get("ton_trocken", 0)) >= 2:
        teile.append("abweichende SWIR-Signatur (anderes Substrat als die Umgebung)")
    form = {"linear": f"Lineare Struktur, ca. {o['laenge_m']:.0f} m lang, Azimut "
                      f"{o['azimut']:.0f}° – denkbar: Mauer-/Terrassenzug, Weg, aber "
                      "auch moderner Feldrain oder Fahrspur.",
            "rechteckig-kompakt": f"Kompakte, annähernd rechteckige Fläche "
                                  f"({o['laenge_m']:.0f} × {o['breite_m']:.0f} m) – denkbar: "
                                  "Einfriedung, Gebäudekomplex, aber auch moderne Parzelle.",
            "erhöht-kompakt": f"Kompakte Anomalie in erhöhter Lage (+{o['lrm_m']:.1f} m über "
                              "lokalem Mittel) – denkbar: Ruinenhügel (Khirbe/Tell), "
                              "natürliche Kuppe.",
            "unregelmäßig": "Unregelmäßig begrenzte Anomalie ohne eindeutige Geometrie."}
    return form[o["klasse"]] + (" Spektral: " + "; ".join(teile) + "." if teile else "")


# ----------------------------------------------------------- Validierung

def fenster_max(d: np.ndarray, zeile: int, spalte: int, r: int) -> float | None:
    h, w = d.shape
    if not (0 <= zeile < h and 0 <= spalte < w):
        return None
    a = d[max(0, zeile - r):zeile + r + 1, max(0, spalte - r):spalte + r + 1]
    if np.isfinite(a).mean() < 0.3:
        return None
    return float(np.nanmax(a))


def validierung(d: np.ndarray, gueltig: np.ndarray, innen: np.ndarray,
                orte_px: list[tuple[int, int]], seed: int) -> dict:
    """Vergleicht die Anomaliestärke an bekannten Fundstellen mit zufälligen
    Kontrollpunkten derselben Kachel. Ergebnis je Fundstelle: Perzentil
    innerhalb der Kontrollverteilung (0,5 = Zufall)."""
    r = C.VAL_RADIUS_PX
    werte = [fenster_max(d, z, s, r) if innen[z, s] else None
             for z, s in [(min(max(z, 0), d.shape[0] - 1), min(max(s, 0), d.shape[1] - 1))
                          for z, s in orte_px]]
    fern = np.ones(d.shape, bool)
    for z, s in orte_px:
        fern[max(0, z - 50):z + 51, max(0, s - 50):s + 51] = False
    ys, xs = np.nonzero(gueltig & innen & fern)
    kontrollen = []
    if len(ys) > 100:
        rng = np.random.default_rng(seed)
        for i in rng.choice(len(ys), size=min(len(ys), C.VAL_KONTROLLEN * 2), replace=False):
            v = fenster_max(d, int(ys[i]), int(xs[i]), r)
            if v is not None:
                kontrollen.append(v)
            if len(kontrollen) >= C.VAL_KONTROLLEN:
                break
    k = np.array(kontrollen)
    perz = [None if v is None or len(k) < 30 else
            float((k < v).mean() + 0.5 * (k == v).mean()) for v in werte]
    return {"perzentile": perz, "n_kontrollen": len(k)}


def auc_statistik(gruppen: list[list[float]], seed: int = 1) -> dict | None:
    """Stratifizierte AUC = mittleres Perzentil aller Fundstellen.

    `gruppen` = Perzentile je Kachel. Fundstellen einer Kachel teilen sich
    Kontrollpunkte und Szenen und sind daher nicht unabhängig; Konfidenz-
    intervall und p-Wert stammen deshalb aus einem Cluster-Bootstrap über
    Kacheln (bei < 5 Kacheln ersatzweise über Fundstellen)."""
    gruppen = [[x for x in g if x is not None] for g in gruppen]
    gruppen = [g for g in gruppen if g]
    p = np.array([x for g in gruppen for x in g], float)
    if len(p) < 5:
        return None
    rng = np.random.default_rng(seed)
    if len(gruppen) >= 5:
        summe = np.array([sum(g) for g in gruppen])
        zahl = np.array([len(g) for g in gruppen])
        i = rng.integers(0, len(gruppen), (4000, len(gruppen)))
        bs = summe[i].sum(1) / zahl[i].sum(1)
        art = "Cluster-Bootstrap über Kacheln"
    else:
        bs = rng.choice(p, size=(4000, len(p)), replace=True).mean(1)
        art = "Bootstrap über Fundstellen (zu wenige Kacheln für Cluster-Bootstrap)"
    return {"n": int(len(p)), "n_kacheln": len(gruppen), "auc": round(float(p.mean()), 3),
            "ki95": [round(float(np.quantile(bs, 0.025)), 3),
                     round(float(np.quantile(bs, 0.975)), 3)],
            "p_einseitig": float(max((bs <= 0.5).mean(), 1 / 4000)),
            "verfahren": art, "anteil_top10": round(float((p >= 0.9).mean()), 3)}
