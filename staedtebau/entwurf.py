"""Städtebaulicher Entwurf auf realem Gelände.

Leitidee (aus den Konzeptbildern): eine terrassierte Stadt, deren Ringe sich
um einen zentralen Platz legen. Geometrisch entsteht das aus einem Feld
G = Weg + Gewicht * Höhenunterschied zum Zentrum; seine Isolinien sind auf
ebenem Gelände Kreise und schmiegen sich am Hang den Höhenlinien an. Alle
Straßen, Blöcke und Gebäude werden in Polarkoordinaten um das Zentrum
konstruiert und dann gegen die Restriktionen des Geländes geprüft.
"""
from __future__ import annotations

import math

import numpy as np
from scipy import ndimage as ndi
from scipy import signal, sparse
from scipy.sparse import csgraph

from . import config as C
from . import gelaende as G

NT = 720          # Winkelauflösung 0,5°
DR = 5.0          # radiale Abtastung in m


def _scheibe(radius_px: int) -> np.ndarray:
    y, x = np.mgrid[-radius_px:radius_px + 1, -radius_px:radius_px + 1]
    k = (x * x + y * y <= radius_px * radius_px).astype(np.float32)
    return k / k.sum()


def restriktionen(a, dem, wc, denkmale=(), sperre=None) -> dict:
    """Bewertet jede Rasterzelle: Tabu-Gründe, Bebaubarkeit, Eignung."""
    px = a.pixel
    z = G.glaetten(dem, 2)
    hang = G.hang_prozent(z, px)
    wadi_maske, wadi_linien = G.wadis(z, px)
    wadi_puffer = ndi.binary_dilation(wadi_maske, iterations=int(C.WADI_PUFFER_M / px))
    yy, xx = np.mgrid[0:dem.shape[0], 0:dem.shape[1]]
    kern = np.zeros(dem.shape, bool)
    puffer = np.zeros(dem.shape, bool)
    for d in denkmale:
        dist = np.hypot(yy - d["zeile"], xx - d["spalte"]) * px
        kern |= dist <= d["radius"]
        puffer |= dist <= d["radius"] + d["puffer"]
    bestand = ndi.binary_dilation(wc == 50, iterations=1)
    wasser = ndi.binary_dilation(wc == 80, iterations=2)
    wald = wc == 10
    steil = hang > C.HANG_TABU
    sperre = np.zeros(dem.shape, bool) if sperre is None else sperre
    tabu = steil | wadi_puffer | puffer | bestand | wasser | wald | sperre
    f_hang = np.clip(1 - (hang - 12) / (C.HANG_TABU - 12) * 0.65, 0.35, 1.0)
    f_lc = np.where(wc == 40, 0.6, 1.0)
    return {"z": z, "hang": hang, "wadi_maske": wadi_maske, "wadi_linien": wadi_linien,
            "wadi_puffer": wadi_puffer, "kern": kern, "puffer": puffer, "bestand": bestand,
            "wasser": wasser, "wald": wald, "steil": steil, "sperre": sperre, "tabu": tabu,
            "baubar": ~tabu, "eignung": (~tabu) * f_hang * f_lc, "acker": wc == 40}


def zentrum_finden(a, R: dict, antik_px=None, kern_m: float = 0, rand_m: float = 1100):
    """Sucht das Stadtzentrum: viel gut bebaubares Land im 600-m-Umkreis,
    bevorzugt auf einer Kuppe/einem Sporn; bei davidischen Orten in
    Sichtweite der Ruine, aber außerhalb ihrer Schutzzone."""
    px = a.pixel
    h, w = R["z"].shape
    land = signal.fftconvolve(R["eignung"].astype(np.float32), _scheibe(int(600 / px)), mode="same")
    tpi = R["z"] - signal.fftconvolve(R["z"], _scheibe(int(500 / px)), mode="same")
    wert = land * (1 + 0.25 * np.clip(tpi / 20, -1, 1))
    # nicht auf bestehende Orte setzen: Bebauung im Umkreis drückt die Bewertung stark
    bebaut = signal.fftconvolve(R["bestand"].astype(np.float32), _scheibe(int(600 / px)), mode="same")
    wert = wert * np.clip(1 - 2.5 * bebaut, 0.05, 1)
    yy, xx = np.mgrid[0:h, 0:w]
    r = int(rand_m / px)
    ok = R["baubar"] & (yy >= r) & (yy < h - r) & (xx >= r) & (xx < w - r)
    if antik_px is not None:
        dist = np.hypot(yy - antik_px[0], xx - antik_px[1]) * px
        ok &= (dist >= kern_m + C.DENKMAL_PUFFER_M + 350) & (dist <= 1500)
    if not ok.any():
        ok = R["baubar"] & (yy >= r // 2) & (yy < h - r // 2) & (xx >= r // 2) & (xx < w - r // 2)
    if not ok.any():
        return h // 2, w // 2, 0.0
    i = int(np.argmax(np.where(ok, wert, -1)))
    return i // w, i % w, float(land.flat[i])


# ---------------------------------------------------------------- Geometrie

class Polar:
    """Ringradien r[b, Winkel] des Stadtfelds um das Zentrum."""

    def __init__(self, a, z_roh, zr: float, zs: float):
        self.a, self.zr, self.zs, px = a, zr, zs, a.pixel
        h, w = z_roh.shape
        yy, xx = np.mgrid[0:h, 0:w]
        zg = G.glaetten(z_roh, 4)
        self.dx = (xx - zs) * px
        self.dy = (zr - yy) * px
        self.d = np.hypot(self.dx, self.dy)
        z0 = float(zg[int(round(zr)), int(round(zs))])
        # steigt das Gelände vom Zentrum weg an, dehnt sich ein Ring höchstens um ein Drittel
        feld = self.d + C.HOEHEN_GEWICHT * np.maximum(z0 - zg, -self.d / (4 * C.HOEHEN_GEWICHT))
        feld = ndi.gaussian_filter(feld, 2)
        self.rmax = (min(zr, zs, h - 1 - zr, w - 1 - zs)) * px - 30
        rs = np.arange(0, self.rmax, DR)
        self.th = np.linspace(0, 2 * math.pi, NT, endpoint=False)
        X = zs + rs[None, :] * np.cos(self.th)[:, None] / px
        Y = zr - rs[None, :] * np.sin(self.th)[:, None] / px
        gp = np.maximum.accumulate(ndi.map_coordinates(feld, [Y, X], order=1, mode="nearest"), axis=1)
        stufen = C.KERN_RADIUS + C.RING_ABSTAND * np.arange(C.MAX_RINGE + 1)
        rb = np.empty((len(stufen), NT))
        for b, s in enumerate(stufen):
            erreicht = gp >= s
            rb[b] = np.where(erreicht.any(1), rs[np.argmax(erreicht, axis=1)], self.rmax + 500)
        rb = ndi.gaussian_filter1d(rb, 5, axis=1, mode="wrap")
        m0 = float(np.median(rb[0]))            # der Platz bleibt annähernd rund
        rb[0] = ndi.gaussian_filter1d(np.clip(rb[0], max(55, 0.85 * m0), 1.2 * m0), 20, mode="wrap")
        for b in range(1, len(rb)):
            rb[b] = np.maximum(rb[b], rb[b - 1] + 30)
        self.rb = rb
        self.b_max = max([b for b in range(len(rb)) if rb[b].max() < self.rmax - 5] or [0])
        self.ti = (np.round(np.arctan2(self.dy, self.dx) / (2 * math.pi) * NT).astype(int)) % NT
        self.band = (self.d[None] > rb[:, self.ti]).sum(0)     # 0 = Kern, b = zwischen Ring b-1 und b

    def xy(self, r, ti):
        """Polar -> lokale Meter (x Ost, y Nord, Ursprung SW-Ecke)."""
        th = self.th[np.asarray(ti) % NT]
        x0, y0 = self.a.lokal(self.zr, self.zs)
        return x0 + r * np.cos(th), y0 + r * np.sin(th)

    def zelle(self, x, y):
        px = self.a.pixel
        return (int(np.clip(round(self.a.hoehe - y / px - 0.5), 0, self.a.hoehe - 1)),
                int(np.clip(round(x / px - 0.5), 0, self.a.breite - 1)))


def _sektoren(P: Polar, b: int) -> int:
    mitte = (P.rb[b - 1].mean() + P.rb[b].mean()) / 2
    ziel = 2 * math.pi * mitte / 150 / C.HAUPTACHSEN
    return C.HAUPTACHSEN * min((1, 2, 3, 4, 6, 8, 12), key=lambda m: abs(m - ziel))


def _flach(x, y):
    return [round(float(v), 1) for p in zip(np.atleast_1d(x), np.atleast_1d(y)) for v in p]


def bloecke_bilden(P: Polar, R: dict, B: int, t0: int, ziel_ew: int) -> list[dict]:
    px2 = P.a.pixel ** 2
    out = []
    rel0 = ((P.ti - t0) % NT)
    for b in range(1, B + 1):
        K = _sektoren(P, b)
        schritt = NT / K
        sek = (rel0 / schritt).astype(int) % K
        im_band = P.band == b
        for s in range(K):
            m = im_band & (sek == s)
            n = int(m.sum())
            if n < 12:
                continue
            ta, tb = t0 + int(round(s * schritt)), t0 + int(round((s + 1) * schritt))
            achse_a, achse_b = (s * C.HAUPTACHSEN) % K == 0, ((s + 1) * C.HAUPTACHSEN) % K == 0
            w_in = C.STRASSE["hauptring" if b - 1 == 1 else "ring"] / 2
            w_out = C.STRASSE["hauptring" if b == 1 else "ring"] / 2
            r_mitte = float(P.rb[b - 1:b + 1, np.arange(ta, tb) % NT].mean())
            da = int(math.ceil((C.STRASSE["achse" if achse_a else "radial"] / 2) / r_mitte / (2 * math.pi) * NT))
            db = int(math.ceil((C.STRASSE["achse" if achse_b else "radial"] / 2) / r_mitte / (2 * math.pi) * NT))
            tis = np.arange(ta + da, tb - db + 1)
            if len(tis) < 3:
                continue
            r_in = P.rb[b - 1, tis % NT] + w_in
            r_out = P.rb[b, tis % NT] - w_out
            if np.median(r_out - r_in) < 14:
                continue
            xi, yi = P.xy(r_in, tis)
            xo, yo = P.xy(r_out[::-1], tis[::-1])
            x, y = np.concatenate([xi, xo]), np.concatenate([yi, yo])
            flaeche = 0.5 * abs(float(np.dot(x, np.roll(y, -1)) - np.dot(y, np.roll(x, -1))))
            out.append({
                "band": b, "sektor": s, "quartier": int(((s + 0.5) / K) * C.HAUPTACHSEN) % C.HAUPTACHSEN,
                "t": [int(tis[0]), int(tis[-1])], "p": _flach(x, y), "flaeche": round(flaeche),
                "fb": round(float(R["baubar"][m].mean()), 2),
                "f_denkmal": float((R["kern"] | R["puffer"])[m].mean()),
                "f_bestand": float(R["bestand"][m].mean()), "f_wald": float(R["wald"][m].mean()),
                "f_acker": float(R["acker"][m].mean()),
                "hang": round(float(R["hang"][m].mean()), 1), "z": round(float(R["z"][m].mean()), 1),
                "tiefe": round(float(np.median(r_out - r_in)), 1), "zellen_m2": n * px2,
            })
    # Grundzonierung
    for k in out:
        b = k["band"]
        if k["f_denkmal"] > 0.3:
            k["zone"] = "archaeologie"
        elif k["f_bestand"] > 0.5:
            k["zone"] = "bestand"
        elif k["fb"] < 0.45:
            k["zone"] = "wald" if k["f_wald"] > 0.4 else "gruen"
        elif b == 1:
            k["zone"] = "misch"
        else:
            rel = (b - 2) / max(B - 2, 1)
            k["zone"] = "wohnen_hoch" if rel < 0.34 else "wohnen_mittel" if rel < 0.7 else "wohnen_niedrig"
            if k["hang"] > C.HANG_TERRASSE and k["zone"] == "wohnen_hoch":
                k["zone"] = "wohnen_mittel"
    # Quartierszentren und Quartiersparks
    for q in range(C.HAUPTACHSEN):
        kand = [k for k in out if k["quartier"] == q and k["zone"].startswith("wohnen")]
        if len(kand) < 4:
            continue
        b_mitte = 2 + (B - 2) * 0.45
        kand.sort(key=lambda k: abs(k["band"] - b_mitte) * 2 - k["fb"] - k["flaeche"] / 20000)
        kand[0]["zone"] = "gemeinbedarf"
        nachbarn = [k for k in kand[1:] if abs(k["band"] - kand[0]["band"]) <= 1]
        (nachbarn or kand[1:])[0]["zone"] = "park"
    # Gewerbe: flachstes Quartier am äußeren Rand
    if ziel_ew >= 8000 and B >= 5:
        aussen = [k for k in out if k["band"] >= B - 1 and k["zone"].startswith("wohnen")]
        je_q = {}
        for k in aussen:
            je_q.setdefault(k["quartier"], []).append(k)
        if je_q:
            q = min(je_q, key=lambda q: np.mean([k["hang"] for k in je_q[q]]) - 0.5 * len(je_q[q]))
            for k in sorted(je_q[q], key=lambda k: k["hang"])[:max(2, len(je_q[q]) * 2 // 3)]:
                k["zone"] = "gewerbe"
    A = C.ANNAHMEN
    for k in out:
        grz, gesch, wohn = C.ZONEN.get(k["zone"], (0, 0, 0, 0, 0))[:3]
        bgf = k["flaeche"] * k["fb"] * grz * gesch
        k["geschosse"] = gesch
        k["bgf"] = round(bgf)
        k["we"] = int(bgf * wohn / A["bgf_je_we_m2"])
        k["ew"] = int(k["we"] * A["haushalt_personen"])
        k["ap"] = int(bgf * (1 - wohn) / A["bgf_je_arbeitsplatz_m2"]) if k["zone"] != "gemeinbedarf" else int(bgf / 120)
    return out


def gebaeude_setzen(P: Polar, R: dict, bloecke: list[dict]) -> list[list]:
    """Gebäudezeilen entlang der Ringstraßen (Baulinie = Ring), tangential
    ausgerichtet; nur auf bebaubaren Zellen."""
    out = []
    for i, k in enumerate(bloecke):
        if k["zone"] not in C.ZONEN:
            continue
        _, gesch, _, laenge, tiefe = C.ZONEN[k["zone"]]
        b, (ta, tb) = k["band"], k["t"]
        w_in = C.STRASSE["hauptring" if b - 1 == 1 else "ring"] / 2
        w_out = C.STRASSE["hauptring" if b == 1 else "ring"] / 2
        reihen = [("aussen", lambda t: P.rb[b, t % NT] - w_out - 4 - tiefe / 2)]
        if k["tiefe"] >= 2 * tiefe + 22:
            reihen.append(("innen", lambda t: P.rb[b - 1, t % NT] + w_in + 4 + tiefe / 2))
        if k["zone"] == "gemeinbedarf":
            reihen = reihen[:1]
        for _, rf in reihen:
            r_m = float(np.mean([rf(t) for t in range(ta, tb + 1, 4)]))
            schritt = max(2, int(round((laenge + 7) / r_m / (2 * math.pi) * NT)))
            halb = max(1, int(round(laenge / 2 / r_m / (2 * math.pi) * NT)))
            t = ta + halb + 1
            while t + halb < tb:
                x, y = P.xy(rf(t), t)
                x1, y1 = P.xy(rf(t - 2), t - 2)
                x2, y2 = P.xy(rf(t + 2), t + 2)
                zr, zs = P.zelle(float(x), float(y))
                if R["baubar"][zr, zs]:
                    out.append([round(float(x), 1), round(float(y), 1), laenge, tiefe,
                                round(math.degrees(math.atan2(y2 - y1, x2 - x1)), 1), gesch, i])
                t += schritt
    return out


def _weg(kosten: np.ndarray, start, ziele: np.ndarray, faktor: int = 2):
    """Günstigster Weg auf vergröbertem Raster (Dijkstra, 8 Nachbarn)."""
    k = kosten[::faktor, ::faktor].astype(np.float64)
    h, w = k.shape
    idx = np.arange(h * w).reshape(h, w)
    zeilen, spalten, gew = [], [], []
    for dz, ds in ((0, 1), (1, 0), (1, 1), (1, -1)):
        a = idx[max(0, -dz):h - max(0, dz), max(0, -ds):w - max(0, ds)]
        b = idx[max(0, dz):h - max(0, -dz), max(0, ds):w - max(0, -ds)]
        zeilen.append(a.ravel()); spalten.append(b.ravel())
        gew.append((k.ravel()[a.ravel()] + k.ravel()[b.ravel()]) / 2 * math.hypot(dz, ds))
    g = sparse.coo_matrix((np.concatenate(gew), (np.concatenate(zeilen), np.concatenate(spalten))),
                          shape=(h * w, h * w)).tocsr()
    s = idx[min(start[0] // faktor, h - 1), min(start[1] // faktor, w - 1)]
    dist, vor = csgraph.dijkstra(g, directed=False, indices=s, return_predecessors=True)
    zi = idx[np.clip(ziele[:, 0] // faktor, 0, h - 1), np.clip(ziele[:, 1] // faktor, 0, w - 1)]
    ende = int(zi[np.argmin(dist[zi])])
    pfad = [ende]
    while pfad[-1] != s and vor[pfad[-1]] >= 0:
        pfad.append(int(vor[pfad[-1]]))
    return [((p // w) * faktor + faktor / 2 - 0.5, (p % w) * faktor + faktor / 2 - 0.5) for p in pfad[::-1]]


def entwerfen(a, dem, wc, ort: dict, zentrum_px, denkmale=(), sperre=None, strassen_px=None,
              verdacht=()) -> tuple[dict, np.ndarray, np.ndarray]:
    """-> (Plan als JSON-fähiges Dict, Reliefbild RGB, Analysebild RGB)"""
    px = a.pixel
    R = restriktionen(a, dem, wc, denkmale, sperre)
    zr, zs = zentrum_px
    P = Polar(a, dem, zr, zs)
    A = C.ANNAHMEN
    # Hauptachse: bei davidischen Orten Sichtachse zur Ruine, sonst talwärts
    if denkmale and denkmale[0].get("haupt"):
        d0 = denkmale[0]
        t0 = int(round(math.atan2(zr - d0["zeile"], d0["spalte"] - zs) / (2 * math.pi) * NT)) % NT
    else:
        t0 = int(np.argmax(P.rb[min(4, P.b_max)])) if P.b_max else 0
    # Stadtgröße: so viele Ringe, wie das Bevölkerungsziel braucht
    # (Zonierung hängt von der Ringzahl ab, deshalb wird je Ringzahl neu gerechnet)
    B, bloecke = P.b_max, []
    for b in range(min(3, P.b_max), P.b_max + 1):
        B, bloecke = b, bloecke_bilden(P, R, b, t0, ort["ziel_ew"])
        if sum(k["ew"] for k in bloecke) >= ort["ziel_ew"]:
            break
    # Bauabschnitte: von innen nach außen, quartiersweise im Uhrzeigersinn
    bloecke.sort(key=lambda k: (k["band"], k["quartier"], k["sektor"]))
    ew_ges = max(sum(k["ew"] for k in bloecke), 1)
    kum = 0
    for i, k in enumerate(bloecke):
        k["rang"] = i
        kum += k["ew"]
        k["phase"] = min(5, 1 + int(5 * (kum - k["ew"] / 2) / ew_ges))
    gebaeude = gebaeude_setzen(P, R, bloecke)

    # --- Straßennetz --------------------------------------------------------
    alle = np.arange(0, NT + 1, 2)
    ringe = []
    for b in range(0, B + 1):
        x, y = P.xy(P.rb[b, alle % NT], alle)
        ringe.append({"kl": "hauptring" if b == 1 else "ring", "ring": b, "p": _flach(x, y)})
    radiale = []
    for j in range(C.HAUPTACHSEN):
        t = t0 + int(round(j * NT / C.HAUPTACHSEN))
        rr = np.linspace(P.rb[0, t % NT] * 0.55, P.rb[B, t % NT], 12)
        x, y = P.xy(rr, np.full(12, t))
        radiale.append({"kl": "achse", "p": _flach(x, y)})
    for b in range(1, B + 1):
        K = _sektoren(P, b)
        for s in range(K):
            if (s * C.HAUPTACHSEN) % K == 0:
                continue
            t = t0 + int(round(s * NT / K))
            x, y = P.xy(np.array([P.rb[b - 1, t % NT], P.rb[b, t % NT]]), np.array([t, t]))
            radiale.append({"kl": "radial", "p": _flach(x, y)})
    # Spiralpromenade: stufenloser Weg vom Stadtrand zum Platz
    umlaeufe = max(2, B // 3)
    u = np.linspace(0, 1, 90 * umlaeufe)
    stufe = B * (1 - u)
    ts = (t0 + NT // (2 * C.HAUPTACHSEN) + np.round(u * umlaeufe * NT).astype(int)) % NT
    lo = np.floor(stufe).astype(int)
    r_sp = P.rb[lo, ts] + (P.rb[np.minimum(lo + 1, B), ts] - P.rb[lo, ts]) * (stufe - lo)
    sx, sy = P.xy(r_sp, ts)
    z_sp = [float(R["z"][P.zelle(float(x), float(y))]) for x, y in zip(sx, sy)]
    laenge_sp = float(np.hypot(np.diff(sx), np.diff(sy)).sum())
    steig_sp = abs(z_sp[-1] - z_sp[0]) / max(laenge_sp, 1) * 100

    # --- Zufahrt -----------------------------------------------------------
    gew = [k for k in bloecke if k["zone"] == "gewerbe"]
    t_zu = (int(np.mean([sum(k["t"]) / 2 for k in gew])) if gew else t0 + NT // 2) % NT
    x_zu, y_zu = P.xy(P.rb[B, t_zu], t_zu)
    stadt = P.band <= B
    kosten = 1 + (R["hang"] / 8) ** 2 + 25 * (R["tabu"] & ~stadt) + 400 * R["kern"] + 60 * R["wadi_maske"]
    h, w = dem.shape
    if strassen_px is not None and len(strassen_px):
        ziele = np.asarray(strassen_px, int)
        ziel_art = "Anschluss an bestehende Hauptstraße (OSM)"
    else:
        rand = np.zeros((h, w), bool)
        rand[2, :] = rand[-3, :] = rand[:, 2] = rand[:, -3] = True
        ziele = np.argwhere(rand)
        ziel_art = "Trassenkorridor zum Rand des Planausschnitts (Anschlusspunkt mit OSM-Daten zu bestimmen)"
    pfad = _weg(kosten, P.zelle(float(x_zu), float(y_zu)), ziele)
    pz = ndi.gaussian_filter1d(np.array([p[0] for p in pfad]), 2, mode="nearest")
    ps = ndi.gaussian_filter1d(np.array([p[1] for p in pfad]), 2, mode="nearest")
    zx, zy = a.lokal(pz, ps)
    zufahrt_m = float(np.hypot(np.diff(zx), np.diff(zy)).sum())

    # --- Wasser und Technik -------------------------------------------------
    sonder = []
    r_aussen = float(P.rb[B].max())
    im_umfeld = (P.d <= r_aussen + 350) & ~R["kern"] & ~R["puffer"] & ~R["wasser"]
    hr, hs = np.unravel_index(int(np.argmax(np.where(im_umfeld, R["z"], -1e9))), dem.shape)
    hx, hy = a.lokal(hr, hs)
    z_hoch = float(R["z"][hr, hs])
    z_bau = max((k["z"] for k in bloecke if k["zone"] in C.ZONEN), default=z_hoch)
    sonder.append({"typ": "hochbehaelter", "name": "Trinkwasser-Hochbehälter", "x": float(hx), "y": float(hy),
                   "info": f"{z_hoch:.0f} m ü. M., {z_hoch - z_bau:+.0f} m gegenüber dem höchsten Baufeld"})
    ring_ka = (P.d > r_aussen + 400) & (P.d < P.rmax) & ~R["kern"] & ~R["puffer"]
    kand = ring_ka & R["wadi_puffer"] if (ring_ka & R["wadi_puffer"]).any() else ring_ka
    if kand.any():
        kr, ks = np.unravel_index(int(np.argmin(np.where(kand, R["z"], 1e9))), dem.shape)
        kx, ky = a.lokal(kr, ks)
        sonder.append({"typ": "klaeranlage", "name": "Kläranlage mit Wasserrückgewinnung", "x": float(kx), "y": float(ky),
                       "info": f"Tiefpunkt {R['z'][kr, ks]:.0f} m ü. M., Freispiegelzulauf; "
                               f"{P.d[kr, ks] - r_aussen:.0f} m Abstand zur Bebauung"})
    wadi_out = []
    for wl in R["wadi_linien"]:
        pz_, ps_ = np.array([p[0] for p in wl["pixel"]]), np.array([p[1] for p in wl["pixel"]])
        if len(pz_) > 6:                        # Rasterstufen der D8-Fließwege glätten
            pz_, ps_ = (ndi.gaussian_filter1d(v, 1.6, mode="nearest") for v in (pz_, ps_))
        wx, wy = a.lokal(pz_, ps_)
        wadi_out.append({"einzug_km2": wl["einzug_km2"], "p": _flach(wx, wy)})
        dd = np.array([P.d[P.zelle(float(x), float(y))] for x, y in zip(wx, wy)])
        nah = np.nonzero((dd > r_aussen) & (dd < r_aussen + 160))[0]
        if len(nah) and len([s for s in sonder if s["typ"] == "rueckhalt"]) < 5:
            j = int(nah[0])
            sonder.append({"typ": "rueckhalt", "name": "Regenrückhalte- und Versickerungsbecken",
                           "x": float(wx[j]), "y": float(wy[j]), "info": f"Einzugsgebiet {wl['einzug_km2']} km²"})
    # --- Gemeinschaftsbauten ---------------------------------------------------
    # Hauptsynagoge und Beit Midrasch stehen am Platz und haben Vorrang vor allen
    # anderen Einrichtungen: sie werden in jedem Fall gesetzt (notfalls auf der
    # nächstgelegenen bebaubaren Stelle) und gehören zum ersten Bauabschnitt.
    def bau(x, y, t, laenge, tiefe, gesch, block, art):
        x1, y1 = P.xy(float(P.d[P.zelle(float(x), float(y))]), t - 3)
        x2, y2 = P.xy(float(P.d[P.zelle(float(x), float(y))]), t + 3)
        gebaeude.append([round(float(x), 1), round(float(y), 1), laenge, tiefe,
                         round(math.degrees(math.atan2(y2 - y1, x2 - x1)), 1), gesch, block, art])

    plaetze = []
    for j in range(C.HAUPTACHSEN):
        t = t0 + int(round((j + 0.5) * NT / C.HAUPTACHSEN))
        r0 = float(P.rb[0, t % NT])
        for r in (r0 - C.STRASSE["ring"] / 2 - 13, r0 - C.STRASSE["ring"] / 2 - 30, r0 + C.STRASSE["hauptring"] / 2 + 14):
            x, y = P.xy(r, t)
            if r > 20 and R["baubar"][P.zelle(float(x), float(y))]:
                plaetze.append((float(x), float(y), t))
                break
    if len(plaetze) < 2:        # Platzrand blockiert: nächstgelegene bebaubare Stellen suchen
        zz, ss = np.nonzero(R["baubar"] & (P.d < 450))
        for i in np.argsort(P.d[zz, ss]):
            x, y = a.lokal(zz[i], ss[i])
            if all(math.hypot(x - q[0], y - q[1]) > 55 for q in plaetze):
                plaetze.append((float(x), float(y), int(P.ti[zz[i], ss[i]])))
            if len(plaetze) >= 3:
                break
    if len(plaetze) < 2:        # letzter Ausweg: am Platz setzen, Bebaubarkeit im Detail zu klären
        for j in (0, 3):
            t = t0 + int(round((j + 0.5) * NT / C.HAUPTACHSEN))
            x, y = P.xy(float(P.rb[0, t % NT]) - 19, t)
            plaetze.append((float(x), float(y), t))
    zentral = [("Hauptsynagoge", "synagoge", "s"), ("Beit Midrasch", "beitmidrasch", "m"),
               ("Mikwe", "zentral", "z"), ("Rathaus", "zentral", "z"), ("Markthalle", "zentral", "z"),
               ("Kulturhaus & Bibliothek", "zentral", "z")]
    for (name, typ, art), (x, y, t) in zip(zentral, plaetze):
        bau(x, y, t, 34, 16, 3, -1, art)
        sonder.append({"typ": typ, "name": name, "x": x, "y": y, "rang": -1, "haupt": True,
                       "info": "am Stadtplatz, erster Bauabschnitt"})
    # Quartierszentren: je eine Synagoge und ein Beit Midrasch neben Schule und Mikwe
    je_block = {}
    for gi, g in enumerate(gebaeude):
        je_block.setdefault(g[6], []).append(gi)
    for i, k in enumerate(bloecke):
        if k["zone"] != "gemeinbedarf":
            continue
        tm = sum(k["t"]) // 2
        x, y = P.xy((P.rb[k["band"] - 1, tm % NT] + P.rb[k["band"], tm % NT]) / 2, tm)
        sonder.append({"typ": "quartier", "name": f"Quartierszentrum {k['quartier'] + 1}", "rang": i,
                       "x": float(x), "y": float(y), "info": "Grundschule, Kindergarten, Synagoge, Beit Midrasch, Mikwe"})
        gs = je_block.get(i, [])
        for gi, (typ, art, name) in zip(gs, (("synagoge", "s", "Synagoge"), ("beitmidrasch", "m", "Beit Midrasch"))):
            gebaeude[gi].append(art)
            sonder.append({"typ": typ, "name": f"{name} Quartier {k['quartier'] + 1}", "rang": i,
                           "x": gebaeude[gi][0], "y": gebaeude[gi][1], "info": "im Quartierszentrum"})
        if not gs:
            sonder.append({"typ": "synagoge", "name": f"Synagoge Quartier {k['quartier'] + 1}", "rang": i,
                           "x": float(x), "y": float(y), "info": "im Quartierszentrum"})
    # Nachbarschaftssynagogen: je 1.500 Einwohner eine. Die j-te Synagoge liegt in
    # einem Block, der gebaut wird, BEVOR die Stadt j * 1.500 Einwohner erreicht –
    # die Versorgung läuft dem Zuzug also voraus. Innerhalb dieses Zeitfensters
    # wird der Block gewählt, der am weitesten von der nächsten Synagoge liegt.
    je_syn = A["ew_je_synagoge"]
    bedarf = max(1, round(ew_ges / je_syn))
    kum, vorher = 0, []
    for k in bloecke:
        vorher.append(kum)
        kum += k["ew"]
    orte_syn = [(q["x"], q["y"]) for q in sonder if q["typ"] == "synagoge"]
    belegt = {int(vorher[q["rang"]] // je_syn) for q in sonder if q["typ"] == "synagoge" and q["rang"] >= 0}
    wohnen = ("misch", "wohnen_hoch", "wohnen_mittel", "wohnen_niedrig")
    nr = 0
    for j in range(1, bedarf):
        if j in belegt:
            continue            # in diesem Zeitfenster öffnet bereits ein Quartierszentrum
        kand = [i for i, k in enumerate(bloecke) if k["zone"] in wohnen and len(je_block.get(i, [])) >= 2
                and (j - 1) * je_syn <= vorher[i] < j * je_syn and len(gebaeude[je_block[i][len(je_block[i]) // 2]]) == 7]
        if not kand:
            continue

        def abstand(i):
            g = gebaeude[je_block[i][len(je_block[i]) // 2]]
            return min(math.hypot(g[0] - q[0], g[1] - q[1]) for q in orte_syn)
        i = max(kand, key=lambda i: (round(abstand(i) / 40), -i))
        g = gebaeude[je_block[i][len(je_block[i]) // 2]]
        g.append("s")
        nr += 1
        orte_syn.append((g[0], g[1]))
        sonder.append({"typ": "synagoge", "name": f"Nachbarschaftssynagoge {nr}", "rang": i, "x": g[0], "y": g[1],
                       "info": f"Ring {bloecke[i]['band']}, Quartier {bloecke[i]['quartier'] + 1}"})
    for s in sonder:
        s["x"], s["y"] = round(s["x"], 1), round(s["y"], 1)

    # --- Geländeschnitte ----------------------------------------------------
    zm = G.glaetten(dem, 1)
    je_band = {}
    for k in bloecke:
        je_band.setdefault(k["band"], []).append(k)
    schnitte = []
    for name, t in (("A–A", t0), ("B–B", t0 + NT // 4)):
        L = min(float(max(P.rb[B, t % NT], P.rb[B, (t + NT // 2) % NT])) + 260, P.rmax)
        tt = np.arange(-L, L + 1, 5.0)
        x0, y0 = a.lokal(zr, zs)
        th = P.th[t % NT]
        xs, ys = x0 + tt * math.cos(th), y0 + tt * math.sin(th)
        prof = ndi.map_coordinates(zm, [a.hoehe - ys / px - 0.5, xs / px - 0.5], order=1, mode="nearest")
        baender = []
        for seite, tw in ((1, t % NT), (-1, (t + NT // 2) % NT)):
            for b in range(1, B + 1):
                # die Schnittachse liegt auf einer Straße: den winkelnächsten Block des Rings nehmen
                def abst(k, tw=tw):
                    d = (sum(k["t"]) / 2 - tw) % NT
                    return min(d, NT - d)
                ks = sorted(je_band.get(b, []), key=abst)[:1]
                baender.append({"von": round(seite * float(P.rb[b - 1, tw]), 1), "bis": round(seite * float(P.rb[b, tw]), 1),
                                "zone": ks[0]["zone"] if ks else "strasse", "geschosse": ks[0]["geschosse"] if ks else 0})
        schnitte.append({"name": name, "azimut": round((90 - math.degrees(th)) % 360),
                         "linie": _flach([xs[0], xs[-1]], [ys[0], ys[-1]]), "kern": round(float(P.rb[0, t % NT]), 1),
                         "t": [round(float(v), 1) for v in tt[::2]], "z": [round(float(v), 1) for v in prof[::2]],
                         "baender": baender})

    # --- Kennzahlen ----------------------------------------------------------
    def zsum(feld, zonen=None):
        return sum(k[feld] for k in bloecke if zonen is None or k["zone"] in zonen)
    wohn = ("misch", "wohnen_hoch", "wohnen_mittel", "wohnen_niedrig")
    ew, we, ap = zsum("ew"), zsum("we"), zsum("ap")
    stadt_m2 = float(stadt.sum()) * px * px
    gruen_m2 = zsum("flaeche", ("park", "gruen", "wald", "archaeologie"))
    dach_m2 = sum(g[2] * g[3] for g in gebaeude)
    versiegelt = dach_m2 + sum(k["flaeche"] * 0.25 for k in bloecke if k["zone"] in C.ZONEN)
    regen = ort["regen_mm"] / 1000 * versiegelt * A["abfluss_beiwert"]
    bedarf = ew * A["wasser_m3_je_ew_jahr"]
    recycling = bedarf * A["abwasser_rueckgewinnung"]
    pv_kwp = dach_m2 * A["dach_nutzbar"] / A["pv_m2_je_kwp"]
    strom = ew * A["strom_kwh_je_ew_jahr"]
    acker_m2 = sum(k["flaeche"] * k["f_acker"] for k in bloecke if k["zone"] in C.ZONEN)
    kenn = {
        "einwohner": ew, "wohneinheiten": we, "arbeitsplaetze": ap, "ringe": B,
        "stadtflaeche_ha": round(stadt_m2 / 1e4, 1),
        "bruttodichte_ew_ha": round(ew / max(stadt_m2 / 1e4, 1), 1),
        "nettobauland_ha": round(zsum("flaeche", tuple(C.ZONEN)) / 1e4, 1),
        "gruen_ha": round(gruen_m2 / 1e4, 1), "freiraum_m2_je_ew": round(gruen_m2 / max(ew, 1), 1),
        "gebaeude": len(gebaeude), "dachflaeche_ha": round(dach_m2 / 1e4, 1),
        "grundschulen_bedarf": max(1, round(ew / A["ew_je_grundschule"])),
        "kita_gruppen_bedarf": round(ew / A["ew_je_kita_gruppe"]),
        "synagogen_bedarf": max(1, round(ew / A["ew_je_synagoge"])),
        "synagogen_plan": sum(1 for q in sonder if q["typ"] == "synagoge"),
        "batei_midrasch_plan": sum(1 for q in sonder if q["typ"] == "beitmidrasch"),
        "quartierszentren": sum(1 for k in bloecke if k["zone"] == "gemeinbedarf"),
        "jobs_je_erwerbsperson": round(ap / max(ew * A["erwerbsquote"], 1), 2),
        "wasserbedarf_m3": round(bedarf), "regenernte_m3": round(regen),
        "brauchwasser_m3": round(recycling),
        "wasser_eigenanteil": round((regen + recycling) / max(bedarf, 1), 2),
        "fernwasser_m3": round(max(bedarf - regen - recycling, 0)),
        "pv_mwp": round(pv_kwp / 1000, 1), "pv_gwh": round(pv_kwp * A["pv_kwh_je_kwp"] / 1e6, 1),
        "strombedarf_gwh": round(strom / 1e6, 1),
        "strom_eigenanteil": round(pv_kwp * A["pv_kwh_je_kwp"] / max(strom, 1), 2),
        "zufahrt_km": round(zufahrt_m / 1000, 2), "zufahrt_art": ziel_art,
        "spirale_km": round(laenge_sp / 1000, 2), "spirale_steigung_pct": round(steig_sp, 1),
        "ackerland_verbrauch_ha": round(acker_m2 / 1e4, 1),
        "hang_mittel_pct": round(float(R["hang"][stadt].mean()), 1),
        "hoehe_zentrum": round(float(R["z"][int(zr), int(zs)]), 1),
        "relief_stadt_m": round(float(R["z"][stadt].max() - R["z"][stadt].min()), 1),
        "baubar_anteil_stadt": round(float(R["baubar"][stadt].mean()), 2),
        "zielerreichung": round(ew / max(ort["ziel_ew"], 1), 2),
    }
    zonen_bilanz = {}
    for k in bloecke:
        zb = zonen_bilanz.setdefault(k["zone"], {"bloecke": 0, "ha": 0.0, "we": 0, "ew": 0, "ap": 0})
        zb["bloecke"] += 1; zb["ha"] += k["flaeche"] / 1e4; zb["we"] += k["we"]; zb["ew"] += k["ew"]; zb["ap"] += k["ap"]
    for zb in zonen_bilanz.values():
        zb["ha"] = round(zb["ha"], 1)

    konturen = []
    for hoehe, linie in G.hoehenlinien(R["z"], 10.0):
        x, y = a.lokal(linie[:, 1], linie[:, 0])
        konturen.append({"h": int(hoehe), "p": [round(float(v)) for p in zip(x, y) for v in p]})
    dm = []
    for d in denkmale:
        x, y = a.lokal(d["zeile"], d["spalte"])
        dm.append({"name": d["name"], "art": d.get("art", "fundstelle"), "x": round(float(x), 1),
                   "y": round(float(y), 1), "r": d["radius"], "puffer": d["puffer"]})
    vd = []
    for v in verdacht:
        x, y = a.lokal(v["zeile"], v["spalte"])
        vd.append({"id": v["id"], "score": v["score"], "x": round(float(x), 1), "y": round(float(y), 1)})
    px0, py0 = a.lokal(zr, zs)
    for k in bloecke:
        for f in ("t", "f_denkmal", "f_bestand", "f_wald", "zellen_m2"):
            k.pop(f, None)
        k["f_acker"] = round(k["f_acker"], 2)
    plan = {
        "version": C.PLAN_VERSION,
        "georef": {"epsg": a.epsg, "x0": a.x0, "y0": a.y0, "groesse_m": a.breite * px,
                   "zentrum": [round(float(px0), 1), round(float(py0), 1)],
                   "zentrum_lonlat": [round(v, 6) for v in a.lonlat(zr, zs)],
                   "hauptachse_grad": round(math.degrees(P.th[t0]), 1)},
        "hoehe": {"min": round(float(R["z"].min())), "max": round(float(R["z"].max()))},
        "konturen": konturen, "wadis": wadi_out, "ringe": ringe, "radiale": radiale,
        "spirale": _flach(sx, sy), "zufahrt": _flach(zx, zy), "bloecke": bloecke,
        "gebaeude": gebaeude, "sonder": sonder, "denkmale": dm, "verdacht": vd,
        "schnitte": schnitte, "kennzahlen": kenn, "zonen_bilanz": zonen_bilanz,
        "platz_radius": round(float(P.rb[0].mean()) * 0.5, 1),
    }
    # Analysebild: Restriktionsklassen
    bild = np.full(dem.shape + (3,), (236, 240, 226), np.uint8)       # gut bebaubar
    bild[R["acker"]] = (240, 232, 176)
    bild[(R["hang"] > C.HANG_TERRASSE)] = (240, 200, 150)
    bild[R["steil"]] = (196, 120, 96)
    bild[R["wald"]] = (150, 190, 140)
    bild[R["bestand"]] = (170, 170, 176)
    bild[R["sperre"]] = (150, 150, 160)
    bild[R["wadi_puffer"]] = (150, 196, 232)
    bild[R["wasser"]] = (110, 160, 220)
    bild[R["puffer"]] = (214, 190, 226)
    bild[R["kern"]] = (176, 132, 200)
    return plan, G.reliefbild(R["z"], px), bild
