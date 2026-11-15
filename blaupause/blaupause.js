/* Blaupause – Web-Ansicht. Liest data/welt.json und data/staedte/<id>.json und
   zeichnet daraus die Planblätter als SVG (maßhaltig in Metern, UTM 36N). */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const zahl = (x, n) => Number(x).toLocaleString("de-DE", { minimumFractionDigits: n || 0, maximumFractionDigits: n || 0 });
  const lade = (u) => fetch(u, { cache: "no-cache" }).then((r) => { if (!r.ok) throw new Error(u + ": HTTP " + r.status); return r.json(); });

  const ZF = { zentrum: "#f0d9a0", misch: "#c98a5a", wohnen_hoch: "#d9604a", wohnen_mittel: "#e8866c",
    wohnen_niedrig: "#f3b49c", gewerbe: "#9aa3ad", gemeinbedarf: "#c06fb0", park: "#7fc27a", gruen: "#b7d8a4",
    wald: "#6aa56a", archaeologie: "#b89bd6", bestand: "#c9c9cf", strasse: "#e8e4da" };
  const BEBAUT = ["misch", "wohnen_hoch", "wohnen_mittel", "wohnen_niedrig", "gewerbe", "gemeinbedarf"];
  const BLAETTER = [
    ["B-01", "Lage und Topographie"], ["B-02", "Standortanalyse"], ["B-03", "Masterplan – Nutzungen"],
    ["B-04", "Blaupause – Baustruktur"], ["B-05", "Verkehr und Erschließung"], ["B-06", "Wasser, Grün, Energie"],
    ["B-07", "Geländeschnitte"], ["B-08", "Bautypologien"], ["B-09", "Bauabschnitte"]];
  const BW = 1680, BH = 1188, KX = 44, KY = 44, KS = 1100, SX = 1176;     // Blattmaße, Kartenfeld, Spalte rechts
  const MM = 841 / BW;                                                    // mm je Einheit bei Ausdruck A1

  let WELT = null, PLAENE = {}, aktuell = null, blattNr = 2, karte = null, vb = null;

  // ============================================================ Zeichenhilfen
  function abbildung(sicht) {            // Meter (lokal) -> Blattkoordinaten
    const k = KS / sicht.s;
    return { k, X: (x) => KX + (x - sicht.x) * k, Y: (y) => KY + (sicht.y + sicht.s - y) * k };
  }
  function pfad(A, p, zu) {
    let d = "";
    for (let i = 0; i < p.length; i += 2) d += (i ? "L" : "M") + A.X(p[i]).toFixed(1) + " " + A.Y(p[i + 1]).toFixed(1);
    return d + (zu ? "Z" : "");
  }
  const text = (x, y, t, o) => "<text x='" + x.toFixed(1) + "' y='" + y.toFixed(1) + "'" + (o || "") + ">" + esc(t) + "</text>";
  const halo = " paint-order='stroke' stroke='#fffdf8' stroke-width='3' stroke-linejoin='round'";

  function stadtSicht(p) {
    const [cx, cy] = p.georef.zentrum, aussen = p.ringe[p.ringe.length - 1].p;
    let r = 0;
    for (let i = 0; i < aussen.length; i += 2) r = Math.max(r, Math.hypot(aussen[i] - cx, aussen[i + 1] - cy));
    const g = p.georef.groesse_m, s = Math.min(g, 2 * (r + 300));
    return { x: Math.min(Math.max(cx - s / 2, 0), g - s), y: Math.min(Math.max(cy - s / 2, 0), g - s), s };
  }
  const vollSicht = (p) => ({ x: 0, y: 0, s: p.georef.groesse_m });

  function gebaut(p) {                    // Anzahl fertiggestellter Blöcke beim gewählten Ausbaustand
    const sl = $("#s-jahr"), st = WELT.staedte[p.id];
    if (+sl.value >= +sl.max || !st) return Infinity;
    const v = st.verlauf.find((e) => e[0] === +sl.value);
    return v ? v[3] : 0;
  }

  // ------------------------------------------------------------ Kartenebenen
  function eRelief(A, p, deck) {
    const g = p.georef.groesse_m;
    return "<image href='data/staedte/" + p.id + "_relief.png' x='" + A.X(0) + "' y='" + A.Y(g) + "' width='" + g * A.k + "' height='" + g * A.k
      + "' preserveAspectRatio='none' opacity='" + deck + "'/>";
  }
  function eKonturen(A, p, farbe, mitZahl) {
    let fein = "", stark = "", zahlen = "";
    p.konturen.forEach((c) => {
      const d = pfad(A, c.p);
      if (c.h % 50 === 0) {
        stark += d;
        if (mitZahl && c.p.length > 24) { const i = (c.p.length >> 2) * 2; zahlen += text(A.X(c.p[i]), A.Y(c.p[i + 1]), c.h, " font-size='9' fill='" + farbe + "' text-anchor='middle'" + (farbe === "#fff" ? "" : halo)); }
      } else fein += d;
    });
    return "<path d='" + fein + "' fill='none' stroke='" + farbe + "' stroke-width='.45' opacity='.55'/><path d='" + stark
      + "' fill='none' stroke='" + farbe + "' stroke-width='1' opacity='.8'/>" + zahlen;
  }
  function eWadis(A, p, farbe) {
    return p.wadis.map((w) => "<path d='" + pfad(A, w.p) + "' fill='none' stroke='" + farbe + "' stroke-width='"
      + Math.min(4.5, 1.2 + Math.sqrt(w.einzug_km2) * 1.1).toFixed(1) + "' stroke-linecap='round' stroke-dasharray='9 3 2 3' opacity='.9'/>").join("");
  }
  function eDenkmale(A, p, blau) {
    return p.denkmale.map((d) => {
      const f = blau ? "#fff" : "#6b3fa0";
      return "<circle cx='" + A.X(d.x) + "' cy='" + A.Y(d.y) + "' r='" + (d.r + d.puffer) * A.k + "' fill='none' stroke='" + f + "' stroke-width='1' stroke-dasharray='5 4'/>"
        + "<circle cx='" + A.X(d.x) + "' cy='" + A.Y(d.y) + "' r='" + d.r * A.k + "' fill='" + (blau ? "none" : "#b89bd6") + "' fill-opacity='.45' stroke='" + f + "' stroke-width='1.6'/>"
        + (d.art === "hauptdenkmal" ? text(A.X(d.x), A.Y(d.y) + 4, d.name, " font-size='12' font-weight='700' text-anchor='middle' fill='" + (blau ? "#fff" : "#3d2466") + "'" + (blau ? "" : halo)) : "");
    }).join("") + p.verdacht.map((v) => "<path d='M" + (A.X(v.x) - 6) + " " + A.Y(v.y) + "h12M" + A.X(v.x) + " " + (A.Y(v.y) - 6) + "v12' stroke='" + (blau ? "#fff" : "#a02c2c") + "' stroke-width='1.6'/>").join("");
  }
  function eBloecke(A, p, modus, n) {
    return p.bloecke.map((b) => {
      const fertig = b.rang < n, bebaut = BEBAUT.includes(b.zone);
      let f = ZF[b.zone], deck = 0.92, rand = "#5a4a3a";
      if (modus === "phase") f = ["#1d4e89", "#3f7fbf", "#7fb2dd", "#f0c36a", "#e08a3c"][b.phase - 1];
      if (modus === "gruen") { f = bebaut ? "#e9e2d2" : ZF[b.zone]; deck = bebaut ? 0.75 : 0.95; }
      if (modus === "verkehr") { f = bebaut ? "#ded8ca" : "#cfe2c4"; deck = 0.8; }
      if (bebaut && !fertig && modus === "nutzung") deck = 0.3;
      return "<path d='" + pfad(A, b.p, true) + "' fill='" + f + "' fill-opacity='" + deck + "' stroke='" + rand + "' stroke-width='.5'"
        + (bebaut && !fertig && modus === "nutzung" ? " stroke-dasharray='3 2'" : "") + "/>";
    }).join("");
  }
  function ePlatz(A, p, blau) {
    const [cx, cy] = p.georef.zentrum, r = p.platz_radius * A.k, X = A.X(cx), Y = A.Y(cy), f = blau ? "#fff" : "#1d4e89";
    let sp = "M" + X + " " + Y;
    for (let i = 1; i <= 60; i++) { const a = i / 60 * 4 * Math.PI, rr = r * 0.62 * i / 60; sp += "L" + (X + rr * Math.cos(a)).toFixed(1) + " " + (Y - rr * Math.sin(a)).toFixed(1); }
    return "<path d='" + pfad(A, p.ringe[0].p, true) + "' fill='" + (blau ? "none" : ZF.zentrum) + "' fill-opacity='.9' stroke='" + (blau ? "#fff" : "#5a4a3a") + "' stroke-width='.8'/>"
      + "<circle cx='" + X + "' cy='" + Y + "' r='" + r + "' fill='" + (blau ? "none" : "#fbf3dc") + "' stroke='" + f + "' stroke-width='1'/>"
      + "<circle cx='" + X + "' cy='" + Y + "' r='" + r * 0.66 + "' fill='" + (blau ? "none" : "#bfe1f2") + "' stroke='" + f + "' stroke-width='.8'/>"
      + "<path d='" + sp + "' fill='none' stroke='" + f + "' stroke-width='1.1'/>";
  }
  function eStrassen(A, p, modus) {
    const b = { ring: 12, hauptring: 18, radial: 8, achse: 16 };
    const farbe = (kl) => modus === "blau" ? "#fff" : modus === "verkehr"
      ? { hauptring: "#c0392b", ring: "#8a8f98", achse: "#e08a1e", radial: "#b9b4a8" }[kl] : "#fbf8f0";
    const breite = (kl) => modus === "blau" ? (kl === "radial" ? 0.7 : 1.1) : Math.max(modus === "verkehr" ? 1.6 : 1, b[kl] * A.k * (modus === "verkehr" ? 0.7 : 1));
    let s = "";
    p.radiale.concat(p.ringe.slice(1)).forEach((l) => {
      if (modus !== "blau" && modus !== "verkehr") s += "<path d='" + pfad(A, l.p) + "' fill='none' stroke='#8d8371' stroke-width='" + (breite(l.kl) + 1) + "'/>";
      s += "<path d='" + pfad(A, l.p) + "' fill='none' stroke='" + farbe(l.kl) + "' stroke-width='" + breite(l.kl) + "' stroke-linecap='round'"
        + (modus === "blau" && l.kl === "radial" ? " stroke-dasharray='4 3'" : "") + "/>";
    });
    return s;
  }
  function eGebaeude(A, p, modus, n) {
    let voll = "", leer = "";
    p.gebaeude.forEach((g) => {
      const [x, y, l, t, w] = g, c = Math.cos(w * Math.PI / 180), s = Math.sin(w * Math.PI / 180);
      const e = [[-l / 2, -t / 2], [l / 2, -t / 2], [l / 2, t / 2], [-l / 2, t / 2]].map(([u, v]) => A.X(x + u * c - v * s).toFixed(1) + " " + A.Y(y + u * s + v * c).toFixed(1));
      const d = "M" + e.join("L") + "Z";
      if (g[6] < 0 || p.bloecke[g[6]].rang < n) voll += d; else leer += d;
    });
    const st = { nutzung: ["#4a3b30", "#fffaf0"], blau: ["#fff", "#eaf2ff"], gruen: ["#b88a1e", "#f5c542"], verkehr: ["#7d766a", "#f4efe4"], phase: ["#333", "#fff"] }[modus];
    return "<path d='" + voll + "' fill='" + st[1] + "' fill-opacity='" + (modus === "blau" ? 0.92 : 0.96) + "' stroke='" + st[0] + "' stroke-width='.5'/>"
      + "<path d='" + leer + "' fill='none' stroke='" + st[0] + "' stroke-width='.45' stroke-dasharray='2 1.6' opacity='.75'/>";
  }
  function eZufahrt(A, p, farbe, breit) {
    return "<path d='" + pfad(A, p.zufahrt) + "' fill='none' stroke='" + farbe + "' stroke-width='" + breit + "' stroke-linecap='round' stroke-linejoin='round'/>";
  }
  const eSpirale = (A, p, farbe) => "<path d='" + pfad(A, p.spirale) + "' fill='none' stroke='" + farbe + "' stroke-width='1.8' stroke-dasharray='7 3' stroke-linejoin='round'/>";
  const SYM = { hochbehaelter: ["#1d6fb8", "W"], klaeranlage: ["#6d4c2f", "K"], rueckhalt: ["#3aa0d8", "R"], zentral: ["#b8892b", "★"], quartier: ["#a04a92", "Q"] };
  function eSonder(A, p, typen, blau) {
    return p.sonder.filter((s) => typen.includes(s.typ)).map((s) => {
      const [f, z] = SYM[s.typ], X = A.X(s.x), Y = A.Y(s.y), kurz = s.typ === "rueckhalt";
      return "<circle cx='" + X + "' cy='" + Y + "' r='" + (kurz ? 6 : 8) + "' fill='" + (blau ? "#16335c" : f) + "' stroke='#fff' stroke-width='1.4'/>"
        + text(X, Y + 3.5, z, " font-size='" + (kurz ? 8 : 10) + "' font-weight='700' fill='#fff' text-anchor='middle'")
        + (kurz ? "" : text(X + 11, Y + 4, s.name, " font-size='10.5' font-weight='600' fill='" + (blau ? "#fff" : "#1f2430") + "'" + (blau ? "" : halo)));
    }).join("");
  }
  function eGitter(A, p, sicht, farbe) {
    const schritt = sicht.s > 3000 ? 1000 : 500, g = p.georef;
    let s = "";
    for (let e = Math.ceil((g.x0 + sicht.x) / schritt) * schritt; e < g.x0 + sicht.x + sicht.s; e += schritt) {
      const X = A.X(e - g.x0);
      s += "<path d='M" + X + " " + KY + "v" + KS + "' stroke='" + farbe + "' stroke-width='.4' opacity='.45'/>" + text(X + 3, KY + KS - 5, "E " + zahl(e), " font-size='8.5' fill='" + farbe + "'");
    }
    for (let n = Math.ceil((g.y0 + sicht.y) / schritt) * schritt; n < g.y0 + sicht.y + sicht.s; n += schritt) {
      const Y = A.Y(n - g.y0);
      s += "<path d='M" + KX + " " + Y + "h" + KS + "' stroke='" + farbe + "' stroke-width='.4' opacity='.45'/>" + text(KX + 4, Y - 3, "N " + zahl(n), " font-size='8.5' fill='" + farbe + "'");
    }
    return s;
  }
  function eSchnittlinien(A, p, farbe) {
    return p.schnitte.map((s) => "<path d='" + pfad(A, s.linie) + "' stroke='" + farbe + "' stroke-width='1' stroke-dasharray='14 4 2 4' fill='none'/>"
      + text(A.X(s.linie[0]), A.Y(s.linie[1]) - 5, s.name.split("–")[0], " font-size='13' font-weight='700' fill='" + farbe + "' text-anchor='middle'")
      + text(A.X(s.linie[2]), A.Y(s.linie[3]) - 5, s.name.split("–")[1], " font-size='13' font-weight='700' fill='" + farbe + "' text-anchor='middle'")).join("");
  }

  // --------------------------------------------------------------- Blattrahmen
  function rahmen(p, nr, inhalt, o) {
    o = o || {};
    const blau = !!o.blau, tinte = blau ? "#fff" : "#1f2430", papier = blau ? "#16407a" : "#fdfbf5", [kennung, titel] = BLAETTER[nr];
    const st = WELT.staedte[p.id] || {}, sl = $("#s-jahr"), end = +sl.value >= +sl.max;
    let s = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 " + BW + " " + BH + "' font-family='Segoe UI,Helvetica,Arial,sans-serif' fill='" + tinte + "'>"
      + "<defs><clipPath id='kf'><rect x='" + KX + "' y='" + KY + "' width='" + (o.breit ? BW - 2 * KX : KS) + "' height='" + KS + "'/></clipPath>"
      + "<pattern id='raster' width='22' height='22' patternUnits='userSpaceOnUse'><path d='M22 0H0V22' fill='none' stroke='#fff' stroke-width='.3' opacity='.25'/></pattern></defs>"
      + "<rect width='" + BW + "' height='" + BH + "' fill='" + papier + "'/>" + (blau ? "<rect width='" + BW + "' height='" + BH + "' fill='url(#raster)'/>" : "")
      + "<rect x='14' y='14' width='" + (BW - 28) + "' height='" + (BH - 28) + "' fill='none' stroke='" + tinte + "' stroke-width='2.4'/>"
      + "<rect x='22' y='22' width='" + (BW - 44) + "' height='" + (BH - 44) + "' fill='none' stroke='" + tinte + "' stroke-width='.6'/>";
    s += "<g clip-path='url(#kf)'>" + inhalt + "</g>";
    if (!o.breit) s += "<rect x='" + KX + "' y='" + KY + "' width='" + KS + "' height='" + KS + "' fill='none' stroke='" + tinte + "' stroke-width='1.2'/>";
    if (o.breit) return s + plankopf(p, kennung, titel, o, tinte, blau, st, end, BW - 44 - 470, BH - 44 - 150, 470, true) + "</svg>";
    // rechte Spalte: Nordpfeil, Maßstab, Legende, Hinweise, Plankopf
    let y = KY + 10;
    if (o.sicht) {
      const nx = SX + 40;
      s += "<g transform='translate(" + nx + "," + (y + 44) + ")'><circle r='30' fill='none' stroke='" + tinte + "' stroke-width='1'/><path d='M0 -38L9 12L0 5L-9 12Z' fill='" + tinte + "'/>"
        + text(0, -42, "N", " font-size='15' font-weight='700' text-anchor='middle'") + "</g>";
      const A = abbildung(o.sicht), roh = o.sicht.s / 5, basis = Math.pow(10, Math.floor(Math.log10(roh))), lang = [1, 2, 5, 10].map((m) => m * basis).filter((v) => v <= roh * 1.4).pop();
      const mst = 1000 / (A.k * MM), rund = Math.round(mst / (mst > 5000 ? 500 : 250)) * (mst > 5000 ? 500 : 250), bx = SX + 110, bw = lang * A.k;
      s += "<g transform='translate(" + bx + "," + (y + 30) + ")'>" + [0, 1, 2, 3].map((i) => "<rect x='" + i * bw / 4 + "' width='" + bw / 4 + "' height='7' fill='" + (i % 2 ? "none" : tinte) + "' stroke='" + tinte + "' stroke-width='.8'/>").join("")
        + text(0, 22, "0", " font-size='10' text-anchor='middle'") + text(bw, 22, zahl(lang) + " m", " font-size='10' text-anchor='middle'")
        + text(0, 46, "M 1 : " + zahl(rund) + "  (Ausdruck A1)", " font-size='12' font-weight='700'") + text(0, 62, "Koordinaten: UTM 36N (EPSG:32636), Gitter " + (o.sicht.s > 3000 ? "1 km" : "500 m"), " font-size='9.5' opacity='.8'") + "</g>";
      y += 104;
    }
    if (o.legende) {
      s += text(SX, y + 14, "LEGENDE", " font-size='11' font-weight='700' letter-spacing='1.5'") + "<path d='M" + SX + " " + (y + 20) + "h460' stroke='" + tinte + "' stroke-width='.8'/>";
      y += 38;
      o.legende.forEach(([art, f, t]) => {
        if (art === "titel") { y += 6; s += text(SX, y, t, " font-size='10' font-weight='700' opacity='.75'"); y += 16; return; }
        const m = art === "flaeche" ? "<rect x='" + SX + "' y='" + (y - 10) + "' width='26' height='13' fill='" + f + "' stroke='" + tinte + "' stroke-width='.5'/>"
          : art === "linie" ? "<path d='M" + SX + " " + (y - 4) + "h26' stroke='" + f + "' stroke-width='3'/>"
            : art === "strich" ? "<path d='M" + SX + " " + (y - 4) + "h26' stroke='" + f + "' stroke-width='2' stroke-dasharray='6 3'/>"
              : "<circle cx='" + (SX + 13) + "' cy='" + (y - 4) + "' r='7' fill='" + f + "' stroke='#fff' stroke-width='1.2'/>";
        s += m + text(SX + 36, y, t, " font-size='11'");
        y += 19;
      });
    }
    if (o.notiz) {
      y += 10;
      s += text(SX, y + 6, "ERLÄUTERUNG", " font-size='11' font-weight='700' letter-spacing='1.5'") + "<path d='M" + SX + " " + (y + 12) + "h460' stroke='" + tinte + "' stroke-width='.8'/>";
      y += 30;
      o.notiz.forEach((z) => umbruch(z, 82).forEach((t, i) => { s += text(SX + (i ? 10 : 0), y, (i ? "" : "• ") + t, " font-size='10.5'"); y += 15; }));
    }
    return s + plankopf(p, kennung, titel, o, tinte, blau, st, end, SX, BH - 44 - 212, 460, false) + "</svg>";
  }
  function umbruch(t, n) {
    const w = String(t).split(" "), z = [];
    let a = "";
    w.forEach((x) => { if ((a + " " + x).trim().length > n) { z.push(a); a = x; } else a = (a + " " + x).trim(); });
    if (a) z.push(a);
    return z;
  }
  function plankopf(p, kennung, titel, o, tinte, blau, st, end, x, y, b, flach) {
    const h = flach ? 150 : 212, f = blau ? "#16407a" : "#fdfbf5";
    const stand = end ? "Endausbau (Planzustand)" : "Jahr " + $("#s-jahr").value + " der Simulation";
    let s = "<g><rect x='" + x + "' y='" + y + "' width='" + b + "' height='" + h + "' fill='" + f + "' stroke='" + tinte + "' stroke-width='1.6'/>"
      + "<path d='M" + x + " " + (y + 58) + "h" + b + "M" + x + " " + (y + 108) + "h" + b + "M" + (x + b - 120) + " " + (y + 58) + "v" + (h - 58) + "' stroke='" + tinte + "' stroke-width='.8' fill='none'/>"
      + text(x + 12, y + 18, "BLAUPAUSE · STÄDTEBAULICHE KONZEPTSTUDIE", " font-size='9.5' letter-spacing='1.4' opacity='.8'")
      + text(x + 12, y + 44, p.name.replace(/\s*\(.*\)/, ""), " font-size='" + (p.name.length > 24 ? 20 : 24) + "' font-weight='700'")
      + text(x + b - 12, y + 44, p.he || "", " font-size='22' text-anchor='end' font-family='SBL Hebrew,David,Times New Roman,serif'")
      + text(x + 12, y + 76, "Planinhalt", " font-size='8.5' opacity='.7'") + text(x + 12, y + 97, titel, " font-size='17' font-weight='700'")
      + text(x + b - 108, y + 76, "Blatt", " font-size='8.5' opacity='.7'") + text(x + b - 108, y + 100, kennung, " font-size='22' font-weight='700'")
      + text(x + 12, y + 125, "Stand", " font-size='8.5' opacity='.7'") + text(x + 12, y + 141, stand + " · Daten " + String(WELT.stand || "").slice(0, 10), " font-size='10.5'")
      + text(x + b - 108, y + 125, "Planversion", " font-size='8.5' opacity='.7'") + text(x + b - 108, y + 141, "v" + p.version, " font-size='11'");
    if (!flach) s += text(x + 12, y + 164, "Grundlagen", " font-size='8.5' opacity='.7'")
      + text(x + 12, y + 179, "Copernicus DEM GLO-30 · ESA WorldCover 2021 · " + (p.osm ? "OpenStreetMap " + (p.osm_stand || "") : "ohne OSM-Abgleich"), " font-size='9.5'")
      + text(x + 12, y + 198, "VORENTWURF – KEIN RECHTSPLAN", " font-size='10.5' font-weight='700' fill='" + (blau ? "#ffd27a" : "#b03a2e") + "'")
      + text(x + b - 108, y + 164, "Phase", " font-size='8.5' opacity='.7'") + text(x + b - 108, y + 180, "LPH 2", " font-size='11'");
    return s + "</g>";
  }
  const zonenLegende = (p, nur) => Object.keys(ZF).filter((z) => z === "zentrum" || (p.zonen_bilanz[z] && (!nur || nur.includes(z))))
    .map((z) => ["flaeche", ZF[z], WELT.zonen_name[z] + (p.zonen_bilanz[z] ? " · " + zahl(p.zonen_bilanz[z].ha, 1) + " ha" : "")]);

  // =================================================================== Blätter
  const BLATT = [
    function lage(p) {
      const si = vollSicht(p), A = abbildung(si), aussen = p.ringe[p.ringe.length - 1].p;
      const inh = eRelief(A, p, 1) + eGitter(A, p, si, "#4a4438") + eKonturen(A, p, "#7a5c3a", true) + eWadis(A, p, "#2b7fc2")
        + "<path d='" + pfad(A, aussen, true) + "' fill='#d9604a' fill-opacity='.22' stroke='#b03a2e' stroke-width='2.2'/>"
        + "<path d='" + pfad(A, p.ringe[0].p, true) + "' fill='#b03a2e'/>" + eZufahrt(A, p, "#1f2430", 3) + eZufahrt(A, p, "#fff", 1.2) + eDenkmale(A, p)
        + eSonder(A, p, ["hochbehaelter", "klaeranlage"]) + text(A.X(p.georef.zentrum[0]), A.Y(p.georef.zentrum[1]) - 14, p.name, " font-size='17' font-weight='700' text-anchor='middle'" + halo);
      return rahmen(p, 0, inh, { sicht: si, legende: [["flaeche", "#e9a093", "Geplantes Stadtgebiet (Endausbau)"], ["linie", "#1f2430", "Zufahrt (Trassenkorridor)"],
        ["linie", "#7a5c3a", "Höhenlinien 10 m, Zähllinien 50 m"], ["strich", "#2b7fc2", "Wadi (Einzugsgebiet ≥ 0,3 km²)"], ["flaeche", "#b89bd6", "Bodendenkmal: Kernzone"],
        ["strich", "#6b3fa0", "Bodendenkmal: Pufferzone"], ["punkt", "#1d6fb8", "W  Trinkwasser-Hochbehälter"], ["punkt", "#6d4c2f", "K  Kläranlage"]],
      notiz: [p.bezug, "Zentrum " + zahl(p.kennzahlen.hoehe_zentrum) + " m ü. M.; Relief im Stadtgebiet " + zahl(p.kennzahlen.relief_stadt_m) + " m; mittlere Hangneigung " + zahl(p.kennzahlen.hang_mittel_pct, 1) + " %.",
        "Mittlerer Jahresniederschlag (Richtwert): " + p.regen_mm + " mm.",
        p.standortsuche ? "Standort berechnet: " + zahl(p.standortsuche.abstand_bebauung_km, 1) + " km zur nächsten Bebauung; Schutzgebiete " + (p.standortsuche.schutzgebiete_geprueft ? "über OSM geprüft." : "NICHT geprüft (OSM fehlte).") : "Die antike Stätte bleibt unbebaut und wird als archäologischer Park Teil des Freiraumsystems."] });
    },
    function analyse(p) {
      const si = vollSicht(p), A = abbildung(si), g = p.georef.groesse_m;
      const inh = "<image href='data/staedte/" + p.id + "_analyse.png' x='" + A.X(0) + "' y='" + A.Y(g) + "' width='" + g * A.k + "' height='" + g * A.k + "' preserveAspectRatio='none' style='image-rendering:pixelated'/>"
        + eGitter(A, p, si, "#4a4438") + eKonturen(A, p, "#6b5a45", false) + eWadis(A, p, "#1f6fb0")
        + p.ringe.map((r, i) => "<path d='" + pfad(A, r.p, true) + "' fill='none' stroke='#1f2430' stroke-width='" + (i === p.ringe.length - 1 ? 1.8 : 0.5) + "' opacity='" + (i === p.ringe.length - 1 ? 1 : 0.5) + "'/>").join("") + eDenkmale(A, p);
      return rahmen(p, 1, inh, { sicht: si, legende: [["flaeche", "#ecf0e2", "Gut bebaubar (Hang ≤ 15 %)"], ["flaeche", "#f0e8b0", "Bebaubar, heute Ackerland"], ["flaeche", "#f0c896", "Nur Terrassenbauweise (15–30 %)"],
        ["flaeche", "#c47860", "Tabu: Hang > 30 %"], ["flaeche", "#96c4e8", "Tabu: Wadi mit 40-m-Schutzstreifen"], ["flaeche", "#96be8c", "Tabu: Wald (Bestand)"], ["flaeche", "#aaaab0", "Bestehende Bebauung / OSM-Sperrfläche"],
        ["flaeche", "#b084c8", "Tabu: Bodendenkmal, Kernzone"], ["flaeche", "#d6bee2", "Tabu: Bodendenkmal, Pufferzone"], ["linie", "#1f2430", "Stadtringe (Entwurf)"], ["linie", "#a02c2c", "+  Seker-Verdachtsfläche (Vorerkundung)"]],
      notiz: ["Bebaubar sind " + zahl(p.kennzahlen.baubar_anteil_stadt * 100) + " % des Stadtgebiets; der Rest bleibt Freiraum.",
        "Entwässerung aus dem Höhenmodell (D8-Abflussakkumulation). Wadis bleiben als Grünzüge frei und führen Starkregen ab.",
        "Jede im Seker-Katalog geführte Fundstelle erhält eine Schutzzone; Verdachtsflächen sind vor Baubeginn zu erkunden.",
        p.osm ? "Sperrflächen und Schutzgebiete aus OpenStreetMap berücksichtigt." : "ACHTUNG: ohne OSM gerechnet – Schutzgebiete, Militär- und Sperrflächen sind in diesem Stand nicht berücksichtigt."] });
    },
    function master(p) {
      const si = stadtSicht(p), A = abbildung(si), n = gebaut(p);
      const inh = eRelief(A, p, 0.55) + eGitter(A, p, si, "#4a4438") + eKonturen(A, p, "#8a7458", false) + eWadis(A, p, "#2b7fc2") + eBloecke(A, p, "nutzung", n) + eStrassen(A, p, "plan") + ePlatz(A, p)
        + eGebaeude(A, p, "nutzung", n) + eSpirale(A, p, "#1d4e89") + eZufahrt(A, p, "#1f2430", 4) + eZufahrt(A, p, "#fbf8f0", 1.6) + eDenkmale(A, p) + eSchnittlinien(A, p, "#1f2430") + eSonder(A, p, ["zentral", "quartier", "hochbehaelter", "klaeranlage"]);
      const k = p.kennzahlen;
      return rahmen(p, 2, inh, { sicht: si, legende: zonenLegende(p).concat([["strich", "#1d4e89", "Spiralpromenade (stufenlos, " + zahl(k.spirale_km, 1) + " km)"], ["punkt", "#b8892b", "★  Zentrale Einrichtung am Platz"], ["punkt", "#a04a92", "Q  Quartierszentrum"]]),
        notiz: [zahl(k.einwohner) + " Einwohner in " + zahl(k.wohneinheiten) + " Wohnungen, " + zahl(k.arbeitsplaetze) + " Arbeitsplätze, " + k.ringe + " Ringe; Bruttodichte " + zahl(k.bruttodichte_ew_ha) + " EW/ha.",
          "Ringstraßen folgen dem Hang; Gebäude stehen traufständig an der Ringstraße, die Geschosszahl fällt nach außen von 5 auf 2.",
          "Je Quartier ein Zentrum mit Grundschule, Kindergarten, Synagoge und Mikwe in höchstens 400 m Gehweg."] });
    },
    function blau(p) {
      const si = stadtSicht(p), A = abbildung(si), n = gebaut(p);
      const inh = eGitter(A, p, si, "#fff") + eKonturen(A, p, "#fff", true) + eWadis(A, p, "#9fd0ff") + eStrassen(A, p, "blau") + ePlatz(A, p, true) + eGebaeude(A, p, "blau", n)
        + eSpirale(A, p, "#ffd27a") + eZufahrt(A, p, "#fff", 2) + eDenkmale(A, p, true) + eSchnittlinien(A, p, "#ffd27a") + eSonder(A, p, ["zentral", "hochbehaelter", "klaeranlage"], true);
      return rahmen(p, 3, inh, { blau: true, sicht: si, legende: [["flaeche", "#eaf2ff", "Gebäude (" + zahl(p.kennzahlen.gebaeude) + " Baukörper)"], ["linie", "#fff", "Ringstraßen und Achsen (Straßenachse)"], ["strich", "#fff", "Treppenwege zwischen den Ringen"],
        ["strich", "#ffd27a", "Spiralpromenade"], ["strich", "#9fd0ff", "Wadi / Grünzug"], ["linie", "#fff", "Höhenlinien 10 m"]],
      notiz: ["Baustruktur als Schwarzplan in Blaupausen-Darstellung: Baukörper, Straßenachsen und Gelände.", "Gestrichelte Baukörper sind im gewählten Ausbaustand noch nicht errichtet.",
        "Ring 1 (Arkadenring) fasst den Platz; die sechs Hauptachsen gliedern die Stadt in sechs Quartiere."] });
    },
    function verkehr(p) {
      const si = stadtSicht(p), A = abbildung(si), n = gebaut(p), k = p.kennzahlen;
      const kreise = p.sonder.filter((s) => s.typ === "quartier").map((s) => "<circle cx='" + A.X(s.x) + "' cy='" + A.Y(s.y) + "' r='" + 400 * A.k + "' fill='#a04a92' fill-opacity='.07' stroke='#a04a92' stroke-width='1' stroke-dasharray='6 4'/>").join("");
      const r1 = p.ringe[1].p, halt = [];
      for (let i = 0; i < 6; i++) { const j = Math.floor(i * (r1.length / 2) / 6) * 2; halt.push("<rect x='" + (A.X(r1[j]) - 5) + "' y='" + (A.Y(r1[j + 1]) - 5) + "' width='10' height='10' fill='#c0392b' stroke='#fff' stroke-width='1.2'/>"); }
      const inh = eRelief(A, p, 0.4) + eGitter(A, p, si, "#4a4438") + eBloecke(A, p, "verkehr", n) + kreise + eStrassen(A, p, "verkehr") + ePlatz(A, p) + eGebaeude(A, p, "verkehr", n)
        + eSpirale(A, p, "#1d4e89") + eZufahrt(A, p, "#1f2430", 5) + eZufahrt(A, p, "#f5c542", 2) + halt.join("") + eSonder(A, p, ["quartier"]);
      return rahmen(p, 4, inh, { sicht: si, legende: [["linie", "#1f2430", "Zufahrt / Anbindung (" + zahl(k.zufahrt_km, 1) + " km)"], ["linie", "#c0392b", "Hauptring mit Ringbus (18 m)"], ["linie", "#8a8f98", "Wohnringe, verkehrsberuhigt (12 m)"],
        ["linie", "#e08a1e", "Hauptachsen: Treppen, Schrägaufzug (16 m)"], ["linie", "#b9b4a8", "Treppenwege (8 m)"], ["strich", "#1d4e89", "Spiralpromenade, stufenlos"], ["flaeche", "#c0392b", "Bushaltestelle"], ["strich", "#a04a92", "400-m-Gehradius Quartierszentrum"]],
      notiz: [k.zufahrt_art + ".", "Mittlere Steigung der Spiralpromenade: " + zahl(k.spirale_steigung_pct, 1) + " % (Ziel ≤ 6 % für Barrierefreiheit; örtlich steilere Abschnitte sind im Detail nachzuweisen).",
        "Kfz-Verkehr auf Zufahrt und Hauptring gebündelt; die Wohnringe sind Mischflächen. Am Schabbat bleibt die gesamte Stadt zu Fuß erreichbar (größte Entfernung zum Platz: Stadtradius).",
        "Stellplätze in Hanggaragen unter den Terrassen der talseitigen Gebäudezeile."] });
    },
    function wasser(p) {
      const si = stadtSicht(p), A = abbildung(si), n = gebaut(p), k = p.kennzahlen, [cx, cy] = p.georef.zentrum;
      const hb = p.sonder.find((s) => s.typ === "hochbehaelter"), ka = p.sonder.find((s) => s.typ === "klaeranlage");
      const leit = (hb ? "<path d='M" + A.X(hb.x) + " " + A.Y(hb.y) + "L" + A.X(cx) + " " + A.Y(cy) + "' stroke='#1d6fb8' stroke-width='2.2' stroke-dasharray='10 4' fill='none'/>" : "")
        + (ka ? "<path d='M" + A.X(cx) + " " + A.Y(cy) + "L" + A.X(ka.x) + " " + A.Y(ka.y) + "' stroke='#6d4c2f' stroke-width='2.2' stroke-dasharray='3 4' fill='none'/>" : "");
      const aussen = p.ringe[p.ringe.length - 1].p;
      const inh = eRelief(A, p, 0.6) + eGitter(A, p, si, "#4a4438") + eKonturen(A, p, "#8a7458", false)
        + "<path d='" + pfad(A, aussen, true) + "' fill='none' stroke='#7fae5a' stroke-width='" + 180 * A.k + "' stroke-opacity='.28'/>"
        + eBloecke(A, p, "gruen", n) + eStrassen(A, p, "plan") + ePlatz(A, p) + eGebaeude(A, p, "gruen", n) + eWadis(A, p, "#1f6fb0") + leit + eDenkmale(A, p) + eSonder(A, p, ["hochbehaelter", "klaeranlage", "rueckhalt"]);
      return rahmen(p, 5, inh, { sicht: si, legende: [["strich", "#1f6fb0", "Wadi als Grünzug und Vorflut"], ["punkt", "#3aa0d8", "R  Rückhalte-/Versickerungsbecken"], ["punkt", "#1d6fb8", "W  Hochbehälter"], ["strich", "#1d6fb8", "Trinkwasser-Hauptleitung (schematisch)"],
        ["punkt", "#6d4c2f", "K  Kläranlage mit Rückgewinnung"], ["strich", "#6d4c2f", "Schmutzwasser-Sammler (schematisch)"], ["flaeche", "#f5c542", "Dachflächen mit Photovoltaik"], ["flaeche", "#7fc27a", "Parks und Grünflächen"], ["flaeche", "#c7dcae", "Terrassengürtel: Oliven, Wein, Obst"]],
      notiz: ["Wasserbedarf " + zahl(k.wasserbedarf_m3 / 1000) + " Tsd. m³/Jahr; Regenernte " + zahl(k.regenernte_m3 / 1000) + ", Brauchwasser " + zahl(k.brauchwasser_m3 / 1000) + " Tsd. m³ → Eigenanteil " + zahl(k.wasser_eigenanteil * 100) + " %, Fernwasser " + zahl(k.fernwasser_m3 / 1000) + " Tsd. m³.",
        (hb ? hb.info + ". " : "") + "Versorgung im freien Gefälle, soweit der Behälter über den Baufeldern liegt; sonst Druckerhöhung.", (ka ? ka.info + "." : ""),
        "Photovoltaik " + zahl(k.pv_mwp, 1) + " MWp ≈ " + zahl(k.pv_gwh, 1) + " GWh/Jahr = " + zahl(k.strom_eigenanteil * 100) + " % des Strombedarfs (" + zahl(k.strombedarf_gwh, 1) + " GWh).",
        "Öffentlicher Freiraum: " + zahl(k.freiraum_m2_je_ew, 1) + " m² je Einwohner (Ziel 10). Mikwen werden aus Regenwasserzisternen gespeist."] });
    },
    function schnitte(p) {
      let s = "";
      const b = BW - 2 * KX - 60, x0 = KX + 50;
      p.schnitte.forEach((sc, i) => {
        const y0 = KY + 60 + i * 470, hmax = Math.max(...sc.z), hmin = Math.min(...sc.z), L = sc.t[sc.t.length - 1] - sc.t[0];
        const kx = b / L, ky = Math.min(kx * 3, 290 / Math.max(hmax - hmin + 34, 40)), ub = ky / kx, X = (t) => x0 + (t - sc.t[0]) * kx, Y = (z) => y0 + 340 - (z - hmin + 6) * ky;
        const zBei = (t) => { const j = Math.min(sc.t.length - 2, Math.max(0, Math.floor((t - sc.t[0]) / (sc.t[1] - sc.t[0])))), f = (t - sc.t[j]) / (sc.t[j + 1] - sc.t[j]); return sc.z[j] + (sc.z[j + 1] - sc.z[j]) * f; };
        s += text(x0, y0 - 22, "SCHNITT " + sc.name, " font-size='17' font-weight='700'") + text(x0 + 150, y0 - 22, "Blickrichtung quer zur Achse " + sc.azimut + "° · Höhen " + zahl(ub, 1) + "-fach überhöht", " font-size='11' opacity='.8'");
        for (let h = Math.ceil(hmin / 20) * 20; h <= hmax + 20; h += 20) s += "<path d='M" + x0 + " " + Y(h) + "h" + b + "' stroke='#b9b2a2' stroke-width='.5'/>" + text(x0 - 6, Y(h) + 3, zahl(h) + " m", " font-size='9.5' text-anchor='end'");
        for (let t = Math.ceil(sc.t[0] / 200) * 200; t <= sc.t[sc.t.length - 1]; t += 200) s += "<path d='M" + X(t) + " " + (y0 + 340) + "v6' stroke='#1f2430'/>" + text(X(t), y0 + 358, (t > 0 ? "+" : "") + zahl(t), " font-size='9' text-anchor='middle'");
        sc.baender.forEach((bd) => {
          const a = Math.min(bd.von, bd.bis), e = Math.max(bd.von, bd.bis), m = (a + e) / 2, zp = zBei(m);
          if (!BEBAUT.includes(bd.zone)) { if (["park", "gruen", "wald", "archaeologie"].includes(bd.zone)) s += "<circle cx='" + X(m) + "' cy='" + (Y(zBei(m)) - 9) + "' r='8' fill='#7fc27a' stroke='#3f7d43' stroke-width='.6'/><path d='M" + X(m) + " " + Y(zBei(m)) + "v-4' stroke='#5a3d22' stroke-width='1.5'/>"; return; }
          const w = (e - a) * 0.5, h = bd.geschosse * 3.2;
          s += "<path d='M" + X(a + 6) + " " + Y(zp) + "H" + X(e - 6) + "' stroke='#5a4a3a' stroke-width='1.4'/>"
            + "<rect x='" + X(m - w / 2) + "' y='" + Y(zp + h) + "' width='" + w * kx + "' height='" + h * ky + "' fill='" + ZF[bd.zone] + "' stroke='#3a2e24' stroke-width='.8'/>";
          for (let g = 1; g < bd.geschosse; g++) s += "<path d='M" + X(m - w / 2) + " " + Y(zp + g * 3.2) + "h" + w * kx + "' stroke='#3a2e24' stroke-width='.35'/>";
        });
        let d = "M" + X(sc.t[0]) + " " + (y0 + 340);
        sc.t.forEach((t, j) => { d += "L" + X(t).toFixed(1) + " " + Y(sc.z[j]).toFixed(1); });
        s += "<path d='" + d + "L" + X(sc.t[sc.t.length - 1]) + " " + (y0 + 340) + "Z' fill='#d9c7a3' fill-opacity='.75' stroke='#6b5233' stroke-width='1.6'/>"
          + "<path d='M" + X(-sc.kern) + " " + (Y(zBei(0)) - 6) + "H" + X(sc.kern) + "' stroke='#1d4e89' stroke-width='4'/>" + text(X(0), Y(zBei(0)) - 62, "Stadtplatz", " font-size='12' font-weight='700' text-anchor='middle' fill='#1d4e89'")
          + "<path d='M" + X(0) + " " + (Y(zBei(0)) - 56) + "V" + (Y(zBei(0)) - 8) + "' stroke='#1d4e89' stroke-width='1' stroke-dasharray='3 3'/>"
          + text(X(sc.t[0]) + 4, y0 + 8, sc.name.split("–")[0], " font-size='20' font-weight='700'") + text(X(sc.t[sc.t.length - 1]) - 4, y0 + 8, sc.name.split("–")[1], " font-size='20' font-weight='700' text-anchor='end'")
          + text(x0 + b / 2, y0 + 378, "Abstand vom Stadtplatz in m", " font-size='10' text-anchor='middle' opacity='.8'");
      });
      s += text(KX + 50, BH - 80, "Gelände aus Copernicus DEM GLO-30 (30 m Raster, auf 10 m interpoliert). Baukörper schematisch je Ring: Breite = halbe Blocktiefe, Höhe = Geschosse × 3,20 m, jeweils auf der Terrassenebene des Rings.", " font-size='10.5' opacity='.85'");
      return rahmen(p, 6, s, { breit: true });
    },
    function typen(p) {
      const T = "#1f2430", fl = (c) => " fill='" + c + "' stroke='" + T + "' stroke-width='1.2'";
      const mass = (x1, y1, x2, y2, t, o) => { const h = Math.abs(y1 - y2) < 1; return "<path d='M" + x1 + " " + y1 + "L" + x2 + " " + y2 + (h ? "M" + x1 + " " + (y1 - 5) + "v10M" + x2 + " " + (y2 - 5) + "v10" : "M" + (x1 - 5) + " " + y1 + "h10M" + (x2 - 5) + " " + y2 + "h10") + "' stroke='" + T + "' stroke-width='.7' fill='none'/>"
        + (h ? text((x1 + x2) / 2, y1 + (o || -5), t, " font-size='10' text-anchor='middle'") : "<text x='" + (x1 + (o || -6)) + "' y='" + (y1 + y2) / 2 + "' font-size='10' text-anchor='middle' transform='rotate(-90 " + (x1 + (o || -6)) + " " + (y1 + y2) / 2 + ")'>" + esc(t) + "</text>"); };
      const kopf = (x, y, n, t, m) => text(x, y, n, " font-size='11' font-weight='700' fill='#b8892b' letter-spacing='1.2'") + text(x, y + 22, t, " font-size='17' font-weight='700'") + text(x, y + 39, m, " font-size='10.5' opacity='.8'");
      let s = "";
      // ---- T1 Terrassenhaus am Hang, Schnitt 1:200 (1 m = 9 Einheiten)
      (function () {
        const x = 80, y = 150, m = 9, neig = 0.25, tief = 13, gh = 3.2, vers = gh / neig;      // Versatz je Geschoss
        s += kopf(x, 78, "T1 · SCHNITT", "Terrassenhaus am Hang (Wohnen, 4 Geschosse)", "M 1:200 · Hangneigung 25 % · das Dach jeder Wohnung ist der Garten der nächsthöheren");
        const gx = x + 9 * m, gy = y + 2 * m, lang = 3 * vers + tief + 22;
        s += "<path d='M" + x + " " + (gy + gh * m - 9 * m * neig) + "L" + (x + lang * m) + " " + (gy + gh * m + (lang - 9) * m * neig) + "V" + (gy + 22 * m) + "H" + x + "Z' fill='#d9c7a3' fill-opacity='.7' stroke='#6b5233' stroke-width='1.4'/>";
        for (let g = 0; g < 4; g++) {
          const ux = gx + g * vers * m, uy = gy + g * gh * m;
          s += "<rect x='" + ux + "' y='" + uy + "' width='" + tief * m + "' height='" + gh * m + "'" + fl("#fbf3e4") + "/>"
            + "<rect x='" + (ux + tief * m - 3) + "' y='" + (uy + 5) + "' width='3' height='" + (gh * m - 10) + "' fill='#9fd0ff'/>"
            + "<path d='M" + (ux + 4 * m) + " " + uy + "v" + gh * m + "' stroke='" + T + "' stroke-width='.6' stroke-dasharray='3 3'/>"
            + text(ux + 2 * m, uy + gh * m / 2 + 4, "Technik", " font-size='8.5' text-anchor='middle' opacity='.7'") + text(ux + 8.5 * m, uy + gh * m / 2 + 4, "Wohnung " + (4 - g), " font-size='10' text-anchor='middle'");
          if (g < 3) s += "<rect x='" + (ux + tief * m) + "' y='" + (uy + gh * m - 3) + "' width='" + (vers - 0.2) * m + "' height='4' fill='" + T + "'/>"
            + [2.5, 6, 9.5].map((d) => "<path d='M" + (ux + (tief + d) * m - 9) + " " + (uy + gh * m - 3) + "q9 -26 18 0' fill='#7fc27a' stroke='#3f7d43' stroke-width='.7'/>").join("")
            + "<path d='M" + (ux + (tief + vers) * m - 3) + " " + (uy + gh * m - 3) + "v-" + 1.1 * m + "' stroke='" + T + "' stroke-width='1.4'/>";
        }
        s += "<path d='M" + (gx + 1 * m) + " " + (gy - 4) + "l" + 10 * m + " -" + 1.5 * m + "' stroke='#1d4e89' stroke-width='3'/>" + text(gx + 1 * m, gy - 24, "Photovoltaik", " font-size='10' fill='#1d4e89'")
          + "<path d='M" + (x + 0.5 * m) + " " + (gy + gh * m - 9 * m * neig - 2) + "h" + 7.5 * m + "' stroke='#8d8371' stroke-width='5'/>" + text(x + 0.5 * m, gy + gh * m - 9 * m * neig - 10, "obere Ringstraße", " font-size='10'")
          + "<path d='M" + (gx + (3 * vers + tief + 2) * m) + " " + (gy + 4 * gh * m + 2 * m * neig) + "h" + 9 * m + "' stroke='#8d8371' stroke-width='5'/>" + text(gx + (3 * vers + tief + 2) * m, gy + 4 * gh * m - 6, "untere Ringstraße 12 m", " font-size='10'")
          + mass(gx + 3 * vers * m, gy + 4 * gh * m + 26, gx + (3 * vers + tief) * m, gy + 4 * gh * m + 26, "13,00 Gebäudetiefe", 14)
          + mass(gx + tief * m, gy - 14, gx + (tief + vers) * m, gy - 14, "12,80 Dachgarten")
          + mass(gx - 12, gy, gx - 12, gy + gh * m, "3,20")
          + text(x, gy + 22 * m + 20, "Zisterne und Hanggarage im Sockel der untersten Zeile; Erschließung über Treppenwege und Schrägaufzug in den Hauptachsen.", " font-size='10' opacity='.85'");
      })();
      // ---- T2 Arkadenring, Schnitt 1:200
      (function () {
        const x = 880, y = 470, m = 9;
        s += kopf(x, 78, "T2 · SCHNITT", "Arkadenring und Hauptring (Mischnutzung, 5 Geschosse)", "M 1:200 · Erdgeschoss mit Arkade 4,50 m · Läden, darüber Wohnen");
        s += "<path d='M" + x + " " + y + "h" + 76 * m + "v60H" + x + "Z' fill='#d9c7a3' fill-opacity='.7' stroke='#6b5233' stroke-width='1.4'/>";
        [[x + 2 * m, 1], [x + 46 * m + 0, -1]].forEach(([bx, r]) => {
          const b = 14 * m;
          s += "<rect x='" + bx + "' y='" + (y - 17.3 * m) + "' width='" + b + "' height='" + 12.8 * m + "'" + fl("#f0dcc0") + "/><rect x='" + bx + "' y='" + (y - 4.5 * m) + "' width='" + b + "' height='" + 4.5 * m + "'" + fl("#e6c9a0") + "/>";
          for (let g = 1; g < 4; g++) s += "<path d='M" + bx + " " + (y - 4.5 * m - g * 3.2 * m) + "h" + b + "' stroke='" + T + "' stroke-width='.5'/>";
          const ax = r > 0 ? bx + b : bx - 4 * m;
          s += "<path d='M" + ax + " " + y + "v-" + 2.6 * m + "a" + 2 * m + " " + 1.9 * m + " 0 0 1 " + 4 * m + " 0v" + 2.6 * m + "' fill='none' stroke='" + T + "' stroke-width='1.6'/><rect x='" + ax + "' y='" + (y - 4.5 * m - 4) + "' width='" + 4 * m + "' height='4' fill='" + T + "'/>";
        });
        const sx = x + 20 * m;
        s += "<rect x='" + sx + "' y='" + (y - 3) + "' width='" + 22 * m + "' height='6' fill='#8d8371'/>" + "<rect x='" + (sx + 7.5 * m) + "' y='" + (y - 3) + "' width='" + 7 * m + "' height='6' fill='#c0392b'/>"
          + [sx + 3 * m, sx + 19 * m].map((t) => "<path d='M" + t + " " + y + "v-" + 4 * m + "' stroke='#5a3d22' stroke-width='3'/><circle cx='" + t + "' cy='" + (y - 5.6 * m) + "' r='" + 2.4 * m + "' fill='#7fc27a' stroke='#3f7d43'/>").join("")
          + text(sx + 11 * m, y - 12, "Busspur 7,00", " font-size='10' text-anchor='middle' fill='#c0392b'")
          + mass(x + 16 * m, y + 34, x + 46 * m, y + 34, "30,00 zwischen den Fassaden: Arkade 4 · Baumstreifen · Fahrbahn 18 · Baumstreifen · Arkade 4", 14)
          + mass(x + 1 * m, y, x + 1 * m, y - 4.5 * m, "4,50") + mass(x + 1 * m, y - 4.5 * m, x + 1 * m, y - 17.3 * m, "4 × 3,20 = 12,80");
      })();
      // ---- T3 Hofhaus, Grundriss 1:200
      (function () {
        const x = 110, y = 680, m = 20, W = 14, H = 11, w = 0.4 * m;
        s += kopf(80, 640, "T3 · GRUNDRISS ERDGESCHOSS", "Hofhaus (Wohnen, 2 Geschosse)", "M 1:100 · Baukörper 14 × 11 m · Innenhof als Klimapuffer, Zisterne unter dem Hof");
        const yy = y + 60;
        s += "<rect x='" + x + "' y='" + yy + "' width='" + W * m + "' height='" + H * m + "' fill='#fbf3e4' stroke='" + T + "' stroke-width='" + w + "'/>"
          + "<rect x='" + (x + 5 * m) + "' y='" + (yy + 3.5 * m) + "' width='" + 4.5 * m + "' height='" + 4.5 * m + "' fill='#e4f0dc' stroke='" + T + "' stroke-width='" + w * 0.6 + "'/>"
          + "<circle cx='" + (x + 7.25 * m) + "' cy='" + (yy + 5.75 * m) + "' r='" + 0.9 * m + "' fill='#bfe1f2' stroke='#1d6fb8' stroke-dasharray='4 3'/>"
          + "<path d='M" + (x + 5 * m) + " " + yy + "v" + 3.5 * m + "M" + (x + 9.5 * m) + " " + yy + "v" + 3.5 * m + "M" + (x + 5 * m) + " " + (yy + 8 * m) + "v" + 3 * m + "M" + (x + 9.5 * m) + " " + (yy + 8 * m) + "v" + 3 * m + "M" + x + " " + (yy + 6 * m) + "h" + 5 * m + "M" + (x + 9.5 * m) + " " + (yy + 5 * m) + "h" + 4.5 * m + "' stroke='" + T + "' stroke-width='" + w * 0.5 + "' fill='none'/>"
          + "<path d='M" + (x + 6.6 * m) + " " + (yy + H * m) + "h" + 1.2 * m + "' stroke='#fbf3e4' stroke-width='" + (w + 2) + "'/><path d='M" + (x + 6.6 * m) + " " + (yy + H * m) + "a" + 1.2 * m + " " + 1.2 * m + " 0 0 1 " + 1.2 * m + " -" + 1.2 * m + "' fill='none' stroke='" + T + "' stroke-width='.8'/>"
          + [["Wohnen / Essen", 2.5, 3, "30 m²"], ["Küche", 7.25, 1.8, "15 m²"], ["Zimmer", 11.75, 2.5, "22 m²"], ["Zimmer", 11.75, 8, "24 m²"], ["Eingang", 7.25, 9.6, ""], ["Bad · Treppe", 2.5, 8.5, "22 m²"], ["Innenhof", 7.25, 5.2, "20 m²"]]
            .map(([t, cx, cy, a]) => text(x + cx * m, yy + cy * m, t, " font-size='11' font-weight='600' text-anchor='middle'") + text(x + cx * m, yy + cy * m + 14, a, " font-size='9.5' text-anchor='middle' opacity='.8'")).join("")
          + text(x + 7.25 * m, yy + 6.5 * m, "Zisterne", " font-size='9' text-anchor='middle' fill='#1d6fb8'")
          + mass(x, yy + H * m + 30, x + W * m, yy + H * m + 30, "14,00", 14) + mass(x - 26, yy + H * m, x - 26, yy, "11,00")
          + text(x + W * m + 16, yy + 20, "Obergeschoss: 3 Zimmer, Bad,", " font-size='10.5'") + text(x + W * m + 16, yy + 36, "Dachterrasse mit Sukka-Öffnung.", " font-size='10.5'")
          + text(x + W * m + 16, yy + 62, "Wände: 40 cm Kalkstein-", " font-size='10.5'") + text(x + W * m + 16, yy + 78, "Verblendmauerwerk, gedämmt.", " font-size='10.5'")
          + text(x + W * m + 16, yy + 104, "Wohnfläche gesamt ≈ 180 m²", " font-size='10.5' font-weight='700'");
      })();
      // ---- T4 Stadtplatz, Grundriss
      (function () {
        const cx = 1000, cy = 915, R = p.ringe[0].p, [zx, zy] = p.georef.zentrum;
        let rmax = 0;
        for (let i = 0; i < R.length; i += 2) rmax = Math.max(rmax, Math.hypot(R[i] - zx, R[i + 1] - zy));
        const m = 160 / rmax, A = { k: m, X: (x) => cx + (x - zx) * m, Y: (y) => cy - (y - zy) * m };
        s += kopf(880, 640, "T4 · GRUNDRISS", "Stadtplatz mit Brunnen und Wassertreppe", "M 1:" + zahl(Math.round(1000 / (m * MM) / 50) * 50) + " · Platz ⌀ " + zahl(p.platz_radius * 2) + " m · sechs Hauptachsen")
          + ePlatz(A, p) + p.gebaeude.filter((g) => g[6] < 0).map((g) => { const c = Math.cos(g[4] * Math.PI / 180), q = Math.sin(g[4] * Math.PI / 180);
            return "<path d='M" + [[-17, -8], [17, -8], [17, 8], [-17, 8]].map(([u, v]) => A.X(g[0] + u * c - v * q).toFixed(1) + " " + A.Y(g[1] + u * q + v * c).toFixed(1)).join("L") + "Z'" + fl("#f0dcc0") + "/>"; }).join("")
          + p.sonder.filter((q) => q.typ === "zentral").map((q) => text(A.X(q.x), A.Y(q.y) + 3, q.name, " font-size='9.5' font-weight='600' text-anchor='middle'" + halo)).join("")
          + p.radiale.filter((r) => r.kl === "achse").map((r) => "<path d='M" + A.X(r.p[0]) + " " + A.Y(r.p[1]) + "L" + A.X(r.p[2]) + " " + A.Y(r.p[3]) + "' stroke='#b8892b' stroke-width='2.4'/>").join("")
          + text(880, 696, "Brunnen in Spiralform: Das Wasser läuft als offene Rinne die Hauptachse hinab und speist die Zisternen der Ringe.", " font-size='10.5'");
      })();
      return rahmen(p, 7, s, { breit: true });
    },
    function phasen(p) {
      const si = stadtSicht(p), bl = p.bloecke;
      let s = "", sumEw = 0, sumWe = 0;
      const pos = [[60, 70], [585, 70], [1110, 70], [60, 600], [585, 600]];
      pos.forEach(([x, y], i) => {
        const k = 480 / si.s, A = { k, X: (v) => x + (v - si.x) * k, Y: (v) => y + (si.y + si.s - v) * k }, ph = i + 1;
        const n = bl.filter((b) => b.phase <= ph).length;
        s += "<svg x='" + x + "' y='" + y + "' width='480' height='480' viewBox='" + x + " " + y + " 480 480'><rect x='" + x + "' y='" + y + "' width='480' height='480' fill='#f4efe2'/>"
          + bl.map((b) => "<path d='" + pfad(A, b.p, true) + "' fill='" + (b.phase < ph ? "#9aa7b5" : b.phase === ph ? (BEBAUT.includes(b.zone) ? "#d9604a" : ZF[b.zone]) : "none") + "' stroke='#8d8371' stroke-width='.35'" + (b.phase > ph ? " stroke-dasharray='2 2'" : "") + "/>").join("")
          + "<path d='" + pfad(A, p.ringe[0].p, true) + "' fill='#f0d9a0' stroke='#5a4a3a' stroke-width='.6'/>" + p.denkmale.filter((d) => d.art === "hauptdenkmal").map((d) => "<circle cx='" + A.X(d.x) + "' cy='" + A.Y(d.y) + "' r='" + d.r * k + "' fill='#b89bd6' fill-opacity='.6' stroke='#6b3fa0'/>").join("")
          + "</svg><rect x='" + x + "' y='" + y + "' width='480' height='480' fill='none' stroke='#1f2430' stroke-width='1'/>";
        const ew = bl.filter((b) => b.phase === ph).reduce((a, b) => a + b.ew, 0), we = bl.filter((b) => b.phase === ph).reduce((a, b) => a + b.we, 0);
        sumEw += ew; sumWe += we;
        s += text(x, y - 10, "BAUABSCHNITT " + ph, " font-size='14' font-weight='700'") + text(x + 480, y - 10, "+" + zahl(we) + " WE · gesamt " + zahl(sumEw) + " EW · " + n + " Blöcke", " font-size='11' text-anchor='end'");
      });
      const tx = 1110, ty = 600;
      s += text(tx, ty + 6, "ABFOLGE", " font-size='11' font-weight='700' letter-spacing='1.5'") + "<path d='M" + tx + " " + (ty + 14) + "h480' stroke='#1f2430' stroke-width='.8'/>"
        + ["Gebaut wird von innen nach außen und quartiersweise im Uhrzeigersinn:", "Jeder Abschnitt ist für sich funktionsfähig und schließt an fertige Straßen an.",
          "1  Platz, Arkadenring, Zufahrt, Hochbehälter.", "2  Innere Wohnringe, erstes Quartierszentrum, Kläranlage Stufe 1.", "3  Mittlere Ringe, Ringbus, weitere Quartierszentren.",
          "4  Äußere Ringe, Gewerbequartier.", "5  Abrundung, Terrassengürtel, Spiralpromenade durchgehend.",
          "", "Rot: im Abschnitt neu · Grau: bereits gebaut · gestrichelt: später."].map((t, i) => text(tx, ty + 40 + i * 19, t, " font-size='11'")).join("");
      return rahmen(p, 8, s, { breit: true });
    }];

  // ================================================================ Oberfläche
  function zeichne() {
    if (!aktuell) return;
    $("#blatt").innerHTML = BLATT[blattNr](aktuell);
    const svg = $("#blatt svg");
    vb = [0, 0, BW, BH];
    svg.setAttribute("viewBox", vb.join(" "));
    document.querySelectorAll("#s-blaetter button").forEach((b, i) => b.classList.toggle("active", i === blattNr));
  }
  function kennzahlen(p) {
    const k = p.kennzahlen, st = WELT.staedte[p.id] || {}, b = st.bilanz || {};
    const z = (t, v) => "<div class=kv><span>" + t + "</span><span>" + v + "</span></div>";
    $("#s-kenn").innerHTML = "<h3>Stand der Simulation</h3>" + (st.status === "gegruendet"
      ? z("Gegründet", "Jahr " + st.gruendung) + z("Einwohner heute", zahl(st.ew)) + z("Ausbau", zahl((b.ausbau || 0) * 100) + " %") + z("Lebensqualität", (b.lebensqualitaet || 0) + " / 100")
        + z("Wasser-Eigenanteil", zahl((b.wasser_eigenanteil || 0) * 100) + " %") + z("Schulen", (b.schulen || 0) + " von " + (b.schulen_soll || 0))
      : "<p class='small muted'>Noch nicht gegründet – Plan liegt vor.</p>")
      + "<h3>Plan (Endausbau)</h3>" + z("Einwohner", zahl(k.einwohner) + " (Ziel " + zahl(p.ziel_ew) + ")") + z("Wohneinheiten", zahl(k.wohneinheiten)) + z("Arbeitsplätze", zahl(k.arbeitsplaetze))
      + z("Stadtfläche", zahl(k.stadtflaeche_ha, 1) + " ha") + z("Bruttodichte", zahl(k.bruttodichte_ew_ha) + " EW/ha") + z("Gebäude", zahl(k.gebaeude)) + z("Freiraum", zahl(k.freiraum_m2_je_ew, 1) + " m²/EW")
      + z("Grundschulen (Bedarf)", k.grundschulen_bedarf) + z("Kita-Gruppen (Bedarf)", k.kita_gruppen_bedarf) + z("Synagogen (Bedarf)", k.synagogen_bedarf)
      + z("Wasser-Eigenanteil", zahl(k.wasser_eigenanteil * 100) + " %") + z("Strom-Eigenanteil (PV)", zahl(k.strom_eigenanteil * 100) + " %") + z("Arbeitsplätze je Erwerbsperson", zahl(k.jobs_je_erwerbsperson, 2))
      + z("Ackerland-Verbrauch", zahl(k.ackerland_verbrauch_ha, 1) + " ha")
      + (k.zielerreichung < 0.9 ? "<p class='small warn'>Das Gelände trägt nur " + zahl(k.zielerreichung * 100) + " % des Bevölkerungsziels.</p>" : "")
      + (p.osm ? "" : "<p class='small warn'>Ohne OpenStreetMap gerechnet: Schutzgebiete und Sperrflächen fehlen in diesem Stand.</p>");
  }
  function stadtWaehlen(id) {
    const fertig = (p) => {
      aktuell = p;
      const st = WELT.staedte[id] || {}, sl = $("#s-jahr"), v = st.verlauf || [];
      sl.min = v.length ? v[0][0] : 0; sl.max = v.length ? v[v.length - 1][0] + 1 : 0; sl.value = sl.max; sl.disabled = !v.length;
      jahrText(); kennzahlen(p); zeichne();
    };
    $("#s-stadt").value = id;
    if (PLAENE[id]) return fertig(PLAENE[id]);
    lade("data/staedte/" + id + ".json").then((p) => { PLAENE[id] = p; fertig(p); }).catch((e) => { $("#blatt").textContent = "Plan nicht ladbar: " + e.message; });
  }
  function jahrText() { const sl = $("#s-jahr"); $("#s-jahr-text").textContent = +sl.value >= +sl.max ? "Endausbau (Planzustand)" : "Jahr " + sl.value; }

  function welt() {
    const s = WELT.summe || {}, U = WELT.uebersicht;
    $("#jahr-anzeige").textContent = "Jahr " + WELT.jahr;
    let h = "<div class=summe><div class=kz><b>" + (s.staedte || 0) + " / " + WELT.folge.length + "</b><span>Städte gegründet</span></div><div class=kz><b>" + zahl(s.einwohner || 0) + "</b><span>Einwohner</span></div>"
      + "<div class=kz><b>" + zahl(s.wohneinheiten || 0) + "</b><span>Wohnungen</span></div><div class=kz><b>" + (s.lebensqualitaet || 0) + "</b><span>Lebensqualität (0–100)</span></div></div>";
    WELT.folge.filter((id) => U[id]).forEach((id) => {
      const u = U[id], st = WELT.staedte[id] || {}, b = st.bilanz || {}, an = st.status === "gegruendet";
      h += "<div class='stadt " + (an ? "" : "geplant") + "' data-id='" + id + "'><h4><span>" + esc(u.name) + "</span><span class=he>" + esc(u.he) + "</span></h4>"
        + "<span class='marke " + (u.art === "davidisch" ? "dav'>davidischer Ort" : "neu'>Neugründung") + "</span> <span class=marke>" + (an ? "gegründet Jahr " + st.gruendung : "geplant") + "</span>"
        + "<div class=balken><b style='width:" + Math.round((b.ausbau || 0) * 100) + "%'></b></div>"
        + "<div class=werte><div><b>" + zahl(st.ew || 0) + "</b>Einwohner</div><div><b>" + zahl(u.plan_ew) + "</b>Plan</div><div><b>" + Math.round((b.ausbau || 0) * 100) + " %</b>Ausbau</div><div><b>" + (b.lebensqualitaet || "–") + "</b>Lebensqual.</div></div>"
        + (u.antik ? "<div class='small muted'>neben " + esc(u.antik) + "</div>" : "") + "</div>";
    });
    $("#staedte").innerHTML = h;
    karte = L.map("map").setView([31.45, 35.0], 9);
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 18, attribution: "© OpenStreetMap-Mitwirkende" }).addTo(karte);
    const grenzen = [];
    WELT.folge.filter((id) => U[id]).forEach((id) => {
      const u = U[id], st = WELT.staedte[id] || {}, an = st.status === "gegruendet", ll = [u.lonlat[1], u.lonlat[0]];
      grenzen.push(ll);
      L.circleMarker(ll, { radius: 7 + Math.sqrt(u.plan_ew) / 22, color: "#fff", weight: 2, fillColor: u.art === "davidisch" ? "#7b4fbf" : "#1a9a8a", fillOpacity: an ? 0.95 : 0.45 })
        .bindTooltip("<b>" + esc(u.name) + "</b><br>" + (an ? zahl(st.ew) + " Einwohner (Jahr " + WELT.jahr + ")" : "geplant · " + zahl(u.plan_ew) + " EW"), { direction: "top" })
        .on("click", () => { tab("stadt"); stadtWaehlen(id); }).addTo(karte);
    });
    if (grenzen.length) karte.fitBounds(L.latLngBounds(grenzen).pad(0.25));
    $("#s-stadt").innerHTML = WELT.folge.filter((id) => U[id]).map((id) => "<option value='" + id + "'>" + esc(U[id].name) + "</option>").join("");
    // Chronik
    const jahre = {};
    (WELT.chronik || []).forEach((e) => { (jahre[e.jahr] = jahre[e.jahr] || []).push(e); });
    $("#chronik").innerHTML = Object.keys(jahre).sort((a, b) => b - a).map((j) => "<div class=jahrgang><h3>Jahr " + j + "</h3>" + jahre[j].map((e) =>
      "<div class='ereignis " + e.art + "'><span>" + esc((U[e.stadt] || {}).name || e.stadt) + "</span><span>" + esc(e.text) + "</span></div>").join("") + "</div>").join("") || "<p class=muted>Noch keine Runde gerechnet.</p>";
    grundlagen();
  }
  function grundlagen() {
    const A = WELT.annahmen, n = { haushalt_personen: "Personen je Haushalt", bgf_je_we_m2: "Bruttogrundfläche je Wohnung (m²)", bgf_je_arbeitsplatz_m2: "Bruttogrundfläche je Arbeitsplatz (m²)",
      wasser_m3_je_ew_jahr: "Wasserbedarf je Einwohner und Jahr (m³)", abwasser_rueckgewinnung: "Anteil rückgewonnenes Brauchwasser", abfluss_beiwert: "Abflussbeiwert versiegelter Flächen",
      strom_kwh_je_ew_jahr: "Strombedarf je Einwohner und Jahr (kWh)", pv_kwh_je_kwp: "PV-Ertrag (kWh je kWp und Jahr)", pv_m2_je_kwp: "Dachfläche je kWp (m²)", dach_nutzbar: "Nutzbarer Dachanteil",
      freiraum_ziel_m2_je_ew: "Ziel öffentlicher Freiraum (m² je Einwohner)", ew_je_grundschule: "Einwohner je Grundschule", ew_je_kita_gruppe: "Einwohner je Kita-Gruppe", ew_je_synagoge: "Einwohner je Synagoge", erwerbsquote: "Erwerbspersonen je Einwohner" };
    $("#grundlagen").innerHTML = "<h2>Grundlagen und Grenzen</h2>"
      + "<p>Blaupause entwirft Städte rechnerisch aus offenen Geodaten: Höhenmodell (Copernicus DEM GLO-30), Landbedeckung (ESA WorldCover 2021) und – sobald verfügbar – OpenStreetMap. Fundstellen und Verdachtsflächen kommen aus dem Seker-Katalog dieses Projekts.</p>"
      + "<h3>Was die Pläne sind</h3><p>Ein <b>städtebaulicher Vorentwurf</b> (etwa Leistungsphase 2): Lage, Erschließung, Nutzungsverteilung, Baumassen, Wasser- und Freiraumkonzept, Schnitte und Typologien, maßhaltig auf dem realen Gelände. Alle Zahlen sind aus dem Plan berechnet, nicht gesetzt.</p>"
      + "<h3>Was sie nicht sind</h3><ul><li><b>Kein Rechtsplan.</b> Eigentum, Flächennutzungs- und Landesplanung (TAMA), Schutzgebiete, Militärzonen, Leitungsrechte und Umweltprüfung sind nicht geprüft. OpenStreetMap ersetzt keine amtlichen Kataster.</li>"
      + "<li><b>Keine Ausführungsplanung.</b> Das Höhenmodell hat 30 m Raster; für Entwurf und Bau sind Vermessung, Baugrund- und hydrologische Gutachten nötig.</li>"
      + "<li><b>Bodendenkmale.</b> Antike Stätten bleiben mit Kern- und Pufferzone unbebaut. Bauen in ihrer Nähe erfordert in Israel eine Freigabe der Antikenbehörde (IAA) und in der Regel Vorerkundungen.</li>"
      + "<li><b>Standortwahl.</b> Geplant wird nur innerhalb des israelischen Kernlands. Die Gleichsetzung einzelner Ruinen mit biblischen Orten (z. B. Scha'arajim, Ziklag) ist teils umstritten und im Plan vermerkt.</li>"
      + "<li><b>Simulation.</b> Die Runden sind ein einfaches Wachstumsmodell (ein Jahr je Runde) ohne Kosten, Politik und Markt. Sie zeigen die Bauabfolge, keine Prognose.</li></ul>"
      + "<h3>Entwurfsregeln</h3><ul><li>Stadtzentrum: viel gut bebaubares Land im 600-m-Umkreis, bevorzugt auf Kuppe oder Sporn; bei davidischen Orten in Sichtweite der Ruine, außerhalb ihrer Schutzzone.</li>"
      + "<li>Ringe: Isolinien aus Weg plus fünffach gewichteter Höhendifferenz – im Flachen Kreise, am Hang höhenlinienparallele Terrassen.</li>"
      + "<li>Tabu: Hang über 30 %, Wadis mit 40-m-Streifen, Wald, bestehende Bebauung, Wasser, Denkmalzonen, OSM-Sperrflächen.</li>"
      + "<li>Nutzung: Platz, Arkadenring, nach außen abnehmende Geschosszahl; je Quartier Zentrum und Park; Gewerbe im flachsten Außenquartier.</li></ul>"
      + "<h3>Planungsannahmen (Richtwerte)</h3><table><tr><th>Annahme</th><th>Wert</th></tr>" + Object.keys(A).map((k) => "<tr><td>" + esc(n[k] || k) + "</td><td>" + zahl(A[k], A[k] < 10 ? 2 : 0) + "</td></tr>").join("") + "</table>"
      + "<p class='small muted'>Größenordnungen aus israelischer und internationaler Planungspraxis; sie sind in <code>staedtebau/config.py</code> an einer Stelle änderbar. Niederschlagswerte je Standort sind gerundete Richtwerte.</p>";
  }

  // ---------------------------------------------------------------- Runde starten
  const REPO = (function () { const m = /^([^.]+)\.github\.io$/.exec(location.hostname), seg = location.pathname.split("/")[1]; return m && seg ? m[1] + "/" + seg : "Moriahise/Minhal-haMikdash"; })();
  const API = "https://api.github.com/repos/" + REPO + "/actions/workflows/blaupause.yml";
  const speicher = { get: () => { try { return localStorage.getItem("seker-token") || ""; } catch (e) { return ""; } }, set: (v) => { try { v ? localStorage.setItem("seker-token", v) : localStorage.removeItem("seker-token"); } catch (e) { /* privat */ } } };
  function rundeStatus() {
    const el = $("#runde-status");
    fetch(API + "/runs?per_page=5", { headers: { Accept: "application/vnd.github+json" } }).then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); }).then((j) => {
      const rs = (j.workflow_runs || []).filter((r) => r.event !== "push" && r.event !== "pull_request");
      el.innerHTML = rs.length ? rs.slice(0, 3).map((r) => "<div><span class='punkt " + (r.status !== "completed" ? "laeuft" : r.conclusion === "success" ? "gut" : "schlecht") + "'></span>" + esc(new Date(r.created_at).toLocaleString("de-DE")) + " · "
        + (r.event === "schedule" ? "automatisch" : "von Hand") + " · " + (r.status !== "completed" ? "läuft gerade" : r.conclusion === "success" ? "abgeschlossen" : "fehlgeschlagen") + " · <a target=_blank rel=noopener href='" + esc(r.html_url) + "'>Protokoll</a></div>").join("") : "Bisher wurde noch keine Runde auf GitHub gerechnet.";
    }).catch((e) => { el.textContent = "Status nicht abrufbar (" + e.message + ")."; });
  }
  function rundeStarten() {
    const token = $("#runde-token").value.trim(), meld = $("#runde-meldung"), n = Math.min(25, Math.max(1, parseInt($("#runde-n").value, 10) || 1));
    if (!token) { meld.innerHTML = "<span class=warn>Bitte ein GitHub-Token eintragen – oder Weg 1 benutzen.</span>"; return; }
    speicher.set($("#runde-merken").checked ? token : "");
    $("#runde-start").disabled = true; meld.textContent = "Runde wird angefordert …";
    fetch(API + "/dispatches", { method: "POST", headers: { Accept: "application/vnd.github+json", Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({ ref: "main", inputs: { runden: String(n), neu: $("#runde-neu").checked ? "ja" : "nein" } }) }).then((r) => {
      if (r.status === 204) { meld.innerHTML = "<b class=ok>Gestartet.</b> " + n + " Runde(n) werden gerechnet; nach einigen Minuten die Seite neu laden."; setTimeout(rundeStatus, 6000); }
      else if (r.status === 401) throw new Error("Token ungültig oder abgelaufen.");
      else if (r.status === 403 || r.status === 404) throw new Error("Token ohne Berechtigung „Actions: Read and write“ – oder der Workflow ist noch nicht auf main.");
      else return r.json().then((j) => { throw new Error(j.message || "HTTP " + r.status); });
    }).catch((e) => { meld.innerHTML = "<span class=warn>Nicht gestartet: " + esc(e.message) + "</span>"; }).finally(() => { $("#runde-start").disabled = false; });
  }

  function tab(name) {
    document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    document.querySelectorAll(".tab").forEach((s) => s.classList.toggle("active", s.id === "tab-" + name));
    if (name === "welt" && karte) karte.invalidateSize();
    if (name === "stadt" && !aktuell && WELT) stadtWaehlen($("#s-stadt").value);
  }

  function start() {
    $("#s-blaetter").innerHTML = BLAETTER.map(([k, t]) => "<button type=button><b>" + k + "</b>" + esc(t) + "</button>").join("");
    document.querySelectorAll("#s-blaetter button").forEach((b, i) => b.addEventListener("click", () => { blattNr = i; zeichne(); }));
    document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); tab(b.dataset.tab); }));
    $("#s-stadt").addEventListener("change", (e) => stadtWaehlen(e.target.value));
    $("#s-jahr").addEventListener("input", () => { jahrText(); zeichne(); });
    $("#staedte").addEventListener("click", (e) => { const k = e.target.closest(".stadt"); if (k) { tab("stadt"); stadtWaehlen(k.dataset.id); } });
    $("#s-reset").addEventListener("click", zeichne);
    $("#s-druck").addEventListener("click", () => window.print());
    $("#s-svg").addEventListener("click", () => {
      const svg = $("#blatt svg").cloneNode(true);
      svg.setAttribute("viewBox", "0 0 " + BW + " " + BH); svg.setAttribute("width", "841mm"); svg.setAttribute("height", "594mm");
      svg.querySelectorAll("image").forEach((im) => im.setAttribute("href", new URL(im.getAttribute("href"), location.href).href));
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([new XMLSerializer().serializeToString(svg)], { type: "image/svg+xml" }));
      a.download = "blaupause-" + aktuell.id + "-" + BLAETTER[blattNr][0] + ".svg"; a.click(); URL.revokeObjectURL(a.href);
    });
    // Zoomen und Verschieben des Planblatts
    const feld = $("#blatt");
    let zug = null;
    const setze = () => $("#blatt svg") && $("#blatt svg").setAttribute("viewBox", vb.join(" "));
    feld.addEventListener("wheel", (e) => {
      if (!vb) return; e.preventDefault();
      const r = feld.getBoundingClientRect(), f = e.deltaY > 0 ? 1.2 : 1 / 1.2, nw = Math.min(BW * 1.2, Math.max(BW / 14, vb[2] * f)), k = nw / vb[2];
      const px = vb[0] + (e.clientX - r.left) / r.width * vb[2], py = vb[1] + (e.clientY - r.top) / r.height * vb[3];
      vb = [px - (px - vb[0]) * k, py - (py - vb[1]) * k, nw, vb[3] * k]; setze();
    }, { passive: false });
    feld.addEventListener("pointerdown", (e) => { zug = [e.clientX, e.clientY, vb[0], vb[1]]; feld.setPointerCapture(e.pointerId); });
    feld.addEventListener("pointermove", (e) => { if (!zug) return; const r = feld.getBoundingClientRect(), m = Math.max(vb[2] / r.width, vb[3] / r.height); vb[0] = zug[2] - (e.clientX - zug[0]) * m; vb[1] = zug[3] - (e.clientY - zug[1]) * m; setze(); });
    feld.addEventListener("pointerup", () => { zug = null; });
    $("#runde-knopf").addEventListener("click", () => {
      $("#runde-github").href = "https://github.com/" + REPO + "/actions/workflows/blaupause.yml";
      const t = speicher.get(); if (t && !$("#runde-token").value) { $("#runde-token").value = t; $("#runde-merken").checked = true; }
      $("#runde-meldung").textContent = ""; $("#runde-dialog").showModal(); rundeStatus();
    });
    $("#runde-start").addEventListener("click", rundeStarten);
    lade("data/welt.json").then((w) => { WELT = w; welt(); const h = location.hash.slice(1); if (h && w.uebersicht[h]) { tab("stadt"); stadtWaehlen(h); } })
      .catch((e) => { $("#hinweis").innerHTML = "<b>Noch keine Pläne vorhanden</b> – der erste Lauf steht aus. (" + esc(e.message) + ")"; });
  }
  start();
})();
