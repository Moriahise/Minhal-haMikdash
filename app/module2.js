/* =====================================================================
   module2.js – Erweiterte Module:
   Entsorgung & Deshen · Holz · Textil & Färberei · Achilat Kodashim &
   Matanot · Bikkurim · Agrar-Wareneingang · Hekdesh & Arachin ·
   Wasser & Tahara · Bauwerk & Instandhaltung
   ===================================================================== */
"use strict";

/* ---------------- Navigation erweitern ---------------- */
NAV.splice(NAV.findIndex(n => n.id === "sedarim"), 0,
  { id: "agrar",      de: "Agrar-Wareneingang", he: "סלת שמן ויין",   ico: "❦" },
  { id: "bikkurim",   de: "Bikkurim",           he: "בכורים",          ico: "❀" },
  { id: "achila",     de: "Achila & Matanot",   he: "אכילת קדשים",     ico: "⌘" },
  { id: "holz",       de: "Holz – Etzim",       he: "עצי המערכה",      ico: "♣" },
  { id: "textil",     de: "Textil & Färberei",  he: "בגדים וצבע",      ico: "✂" },
  { id: "entsorgung", de: "Entsorgung & Deshen",he: "דשן ושריפה",      ico: "♨" },
  { id: "tahara",     de: "Wasser & Tahara",    he: "מים וטהרה",       ico: "≋" },
  { id: "bau",        de: "Bauwerk & Lishkot",  he: "בדק הבית",        ico: "⌂" },
  { id: "hekdesh",    de: "Hekdesh & Arachin",  he: "הקדש וערכין",     ico: "⚖" }
);

/* ---------------- Hilfen ---------------- */
const lagerEinheit = id => (DATA.lagerVorlage.find(a => a.id === id) || {}).einheit || "";
const fondsOpts = () => [["", "— keine Buchung —"], ...DATA.fonds.map(f => [f.id, f.de])];
function buchen(fonds, art, betrag, text, beleg = "", datum = todayISO()) {
  if (!fonds || !betrag) return;
  STATE.buchungen.push({ id: uid(), datum, fonds, art, betrag: Math.round(betrag * 100) / 100, text, beleg });
}
function selaEUR() { return 2 * (Number(STATE.settings.machatzitGramm) || 9.6) * (Number(STATE.settings.silberPreisG) || 0); }
function maaserJahr(iso = todayISO()) {
  const j = shemitaInfo(heb(iso).year).jahrImZyklus;
  return { j, art: j === 7 ? "Shemita – keine Ma'asrot" : [3, 6].includes(j) ? "Ma'aser Ani" : "Ma'aser Sheni" };
}
function bikkurimStatus(iso = todayISO()) {
  const h = heb(iso), m = h.month, d = h.day;
  if ((m === "Sivan" && d >= 6) || ["Tamuz", "Av", "Elul"].includes(m) || (m === "Tishri" && d < 15)) return { ok: true, kriya: true, text: "Bringen und Mikra Bikkurim lesen (Shavuot–Sukkot)" };
  if ((m === "Tishri" && d >= 15) || m === "Heshvan" || (m === "Kislev" && d < 25)) return { ok: true, kriya: false, text: "Bringen ohne Mikra (Sukkot–Chanukka)" };
  return { ok: false, kriya: false, text: "Keine Bikkurim-Zeit (vor Shavuot nicht annehmen – Bikkurim 1:3)" };
}
function fristInfo(art, datum) {
  const r = DATA.achila.regeln[art];
  if (!r || r.frist === "keine") return { bis: null, text: "nicht gegessen (Kalil)" };
  if (r.frist === "tagNacht") return { bis: addDays(datum, 1), text: `Tag + Nacht bis Chatzot (Nacht nach ${fmtDate(datum)})` };
  if (r.frist === "zweiTage") return { bis: addDays(datum, 2), text: `2 Tage + 1 Nacht – bis Sonnenuntergang ${fmtDate(addDays(datum, 1))}` };
  if (r.frist === "nachtPesach") return { bis: addDays(datum, 1), text: "Nur in der Nacht bis Chatzot" };
  return { bis: null, text: "" };
}

/* ---------------- Generisches Register ---------------- */
const REG = {};
function fieldHTML(f, v) {
  const val = v === undefined ? (typeof f.def === "function" ? f.def() : f.def ?? "") : v;
  const opts = typeof f.opts === "function" ? f.opts() : f.opts || [];
  if (f.t === "select") return `<label>${f.l} <select name="${f.n}">${opts.map(([k, l]) => opt(k, l, val)).join("")}</select></label>`;
  if (f.t === "check") return `<label class="chk"><input type="checkbox" name="${f.n}" ${val ? "checked" : ""}> ${f.l}</label>`;
  if (f.t === "multi") return `<fieldset><legend>${f.l}</legend>${opts.map(([k, l]) => `<label class="chk"><input type="checkbox" name="${f.n}" value="${esc(k)}" ${(val || []).includes(k) ? "checked" : ""}> ${l}</label>`).join("")}</fieldset>`;
  if (f.t === "textarea") return `<label>${f.l} <textarea name="${f.n}">${esc(val)}</textarea></label>`;
  return `<label>${f.l} <input name="${f.n}" type="${f.t || "text"}" ${f.t === "number" ? 'step="any"' : ""} dir="auto" value="${esc(val)}" ${f.req ? "required" : ""}></label>`;
}
function regForm(key, item = {}) {
  const R = REG[key];
  return `<form data-form="reg" class="form"><input type="hidden" name="_reg" value="${key}"><input type="hidden" name="_id" value="${esc(item.id || "")}">
    ${R.felder.map(f => fieldHTML(f, item[f.n])).join("")}
    ${R.hinweis ? `<p class="muted small">${R.hinweis}</p>` : ""}
    <div class="actions"><button class="btn">Speichern</button><button type="button" class="btn ghost" data-act="closeModal">Abbrechen</button></div></form>`;
}
function regTable(key, liste, extraBtn) {
  const R = REG[key], L = liste || STATE[key] || [];
  if (!L.length) return `<p class="muted">Noch keine Einträge.</p>`;
  return `<div class="scroll"><table class="tbl dense"><thead><tr>${R.spalten.map(s => `<th>${s[0]}</th>`).join("")}<th></th></tr></thead><tbody>
    ${L.slice().sort((a, b) => String(b.datum || "").localeCompare(String(a.datum || ""))).map(x => `<tr class="${R.rowClass ? R.rowClass(x) : ""}">${R.spalten.map(s => `<td>${s[1](x)}</td>`).join("")}
      <td class="nowrap">${extraBtn ? extraBtn(x) : ""}<button class="btn sm ghost" data-act="regEdit" data-reg="${key}" data-id="${x.id}">✎</button><button class="btn sm ghost" data-act="regDel" data-reg="${key}" data-id="${x.id}">✕</button></td></tr>`).join("")}
  </tbody></table></div>`;
}
const regNeuBtn = (key, label = "+ Eintrag") => `<button class="btn" data-act="regEdit" data-reg="${key}">${label}</button>`;
const csvBtn = key => `<button class="btn ghost" data-act="regCSV" data-reg="${key}">CSV</button>`;

FORM.reg = fd => {
  const key = fd.get("_reg"), R = REG[key], id = fd.get("_id");
  const o = {};
  for (const f of R.felder) {
    if (f.t === "check") o[f.n] = !!fd.get(f.n);
    else if (f.t === "multi") o[f.n] = fd.getAll(f.n);
    else if (f.t === "number") o[f.n] = fd.get(f.n) === "" ? "" : Number(fd.get(f.n));
    else o[f.n] = fd.get(f.n);
  }
  const alt = id ? STATE[key].find(x => x.id === id) : null;
  const item = alt ? Object.assign(alt, o) : { id: uid(), ...o };
  if (R.onSave && R.onSave(item, !alt) === false) return false;
  if (!alt) STATE[key].push(item);
  closeModal();
};
Object.assign(ACT, {
  regEdit: el => { const R = REG[el.dataset.reg]; modal(R.titel, regForm(el.dataset.reg, el.dataset.id ? STATE[el.dataset.reg].find(x => x.id === el.dataset.id) : {})); },
  regDel: el => { if (confirm("Eintrag löschen? (Lager- und Kassenbuchungen werden nicht automatisch storniert)")) { STATE[el.dataset.reg] = STATE[el.dataset.reg].filter(x => x.id !== el.dataset.id); saveState(); render(); } },
  regCSV: el => { const R = REG[el.dataset.reg]; const strip = h => String(h).replace(/<[^>]+>/g, ""); download(`${el.dataset.reg}.csv`, csv([R.spalten.map(s => s[0]), ...STATE[el.dataset.reg].map(x => R.spalten.map(s => strip(s[1](x))))])); }
});

/* =====================================================================
   ENTSORGUNG & DESHEN
   ===================================================================== */
const katName = id => (DATA.entsorgung.kategorien.find(k => k.id === id) || {}).de || id;
REG.entsorgung = {
  titel: "Entsorgung / Deshen / Sereifa",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "kat", l: "Kategorie", t: "select", opts: () => DATA.entsorgung.kategorien.map(k => [k.id, k.de]) },
    { n: "menge", l: "Menge", t: "number" },
    { n: "einheit", l: "Einheit", def: "Machta / Kuppa / Stk" },
    { n: "ort", l: "Ort / Verfügung", t: "select", opts: () => DATA.entsorgung.orte.map(o => [o, o]) },
    { n: "verantwortlich", l: "Verantwortlicher Kohen / Levi" },
    { n: "begadim", l: "Kleidung", t: "select", opts: [["bigdei", "Bigdei Kehuna (Terumat HaDeshen)"], ["acherim", "Begadim Acherim (Hotza'a)"], ["", "—"]] },
    { n: "erloes", l: "Erlös € (z. B. Dam an Gärtner)", t: "number" },
    { n: "fonds", l: "Erlös buchen auf", t: "select", opts: fondsOpts, def: "bedek" },
    { n: "notiz", l: "Notiz", t: "textarea" }
  ],
  hinweis: "Notar/Pigul nur bei Tag verbrennen, nicht an Schabbat/Yom Tov (Shabbat 24b). Erlös aus Blutresten unterliegt Me'ila (Yoma 5:6).",
  spalten: [["Datum", x => fmtDate(x.datum)], ["Kategorie", x => esc(katName(x.kat))], ["Menge", x => `${esc(x.menge)} ${esc(x.einheit)}`], ["Ort", x => esc(x.ort)], ["Verantw.", x => `<span dir="auto">${esc(x.verantwortlich)}</span>`], ["Erlös", x => x.erloes ? fmtEUR(x.erloes) : ""]],
  onSave: (x, neu) => {
    const wd = dateOf(x.datum).getUTCDay(), f = festInfo(x.datum);
    if (["notar", "sereifa_pasul"].includes(x.kat) && (wd === 6 || f.yomTov) && !confirm("Sereifa an Schabbat/Yom Tov ist verboten (Shabbat 24b). Trotzdem erfassen?")) return false;
    if (neu && x.erloes && x.fonds) buchen(x.fonds, "ein", x.erloes, `Erlös: ${katName(x.kat)}`, "ENT", x.datum);
  }
};
VIEWS.entsorgung = () => {
  const sub = curSub("entsorgung", "register");
  const head = subtabs("entsorgung", [["register", "Register"], ["regeln", "Kategorien & Regeln"]]);
  if (sub === "regeln") return head + card("Kategorien – Ort & Verfahren", `<table class="tbl dense"><thead><tr><th>Kategorie</th><th>Ort / Verfahren</th><th>Mekor</th></tr></thead><tbody>${DATA.entsorgung.kategorien.map(k => `<tr><td><b>${esc(k.de)}</b></td><td>${esc(k.ort)}</td><td>${mekor(k.mekor)}</td></tr>`).join("")}</tbody></table>`) + card("Regeln", `<ul class="list">${DATA.entsorgung.regeln.map(r => `<li>${esc(r)}</li>`).join("")}</ul>`);
  const t = todayISO(), heute = STATE.entsorgung.filter(x => x.datum === t);
  const hatTD = heute.some(x => x.kat === "trumat_deshen");
  const p30 = {}; STATE.entsorgung.filter(x => dayNum(t) - dayNum(x.datum) <= 30).forEach(x => p30[x.kat] = (p30[x.kat] || 0) + (Number(x.menge) || 1));
  const notar = STATE.achila.filter(a => a.status === "offen" && a.bis && dayNum(t) >= dayNum(a.bis));
  return head + `<div class="grid g3">
    ${card("Heute", `<p>${hatTD ? `<span class="ok">✓ Terumat HaDeshen erfasst</span>` : `<span class="warn">Terumat HaDeshen noch nicht erfasst</span>`}</p>
      <div class="actions"><button class="btn" data-act="entQuick" data-k="trumat_deshen">Terumat HaDeshen ✓</button><button class="btn ghost" data-act="entQuick" data-k="deshen_pnimi">Dishun Pnimi & Menorah ✓</button><button class="btn ghost" data-act="entQuick" data-k="hotzaat_deshen">Hotza'at HaDeshen ✓</button></div>
      ${festInfo(t).regel ? `<p class="muted">Regel: Tapuach wird nicht geräumt (Noi laMizbe'ach) ${mekor("Tamid 2:2")}</p>` : ""}`)}
    ${card("Notar – zur Sereifa", notar.length ? `<ul class="list">${notar.map(a => `<li>${esc(a.bringer || "")} – ${esc(a.korban)} (Frist ${fmtDate(a.bis)}) <button class="btn sm" data-act="notarSereifa" data-id="${a.id}">→ Sereifa</button></li>`).join("")}</ul>` : `<p class="ok">Kein Notar offen.</p>`)}
    ${card("Letzte 30 Tage", Object.keys(p30).length ? `<table class="tbl dense">${Object.entries(p30).map(([k, v]) => `<tr><td>${esc(katName(k))}</td><td class="r">${fmtNum(v)}</td></tr>`).join("")}</table>` : `<p class="muted">—</p>`)}
  </div>` + card("Entsorgungsregister", `<div class="row">${regNeuBtn("entsorgung")}${csvBtn("entsorgung")}</div>${regTable("entsorgung")}`);
};
Object.assign(ACT, {
  entQuick: el => { const k = DATA.entsorgung.kategorien.find(x => x.id === el.dataset.k); STATE.entsorgung.push({ id: uid(), datum: todayISO(), kat: k.id, menge: 1, einheit: k.id === "trumat_deshen" ? "Machta" : "Vorgang", ort: k.id === "hotzaat_deshen" ? "Beit HaDeshen (außerhalb)" : k.id === "trumat_deshen" ? "Östlich des Kevesh" : "Tapuach (Mizbe'ach)", verantwortlich: "", begadim: k.id === "hotzaat_deshen" ? "acherim" : "bigdei", erloes: "", notiz: "Schnellerfassung" }); saveState(); render(); },
  notarSereifa: el => {
    const a = STATE.achila.find(x => x.id === el.dataset.id); const wd = dateOf(todayISO()).getUTCDay();
    if ((wd === 6 || festInfo(todayISO()).yomTov) && !confirm("Heute Schabbat/Yom Tov – Sereifa verboten (Shabbat 24b). Trotzdem buchen?")) return;
    a.status = "notar → Sereifa"; STATE.entsorgung.push({ id: uid(), datum: todayISO(), kat: "notar", menge: 1, einheit: "Korban", ort: "Beit HaSereifa (Azara)", verantwortlich: "", erloes: "", notiz: `Notar: ${a.korban} – ${a.bringer || ""}` });
    saveState(); render();
  }
});

/* =====================================================================
   HOLZ – ETZEI HAMA'ARACHA
   ===================================================================== */
const holzArt = id => DATA.holz.arten.find(a => a.id === id) || {};
REG.holz = {
  titel: "Holzlieferung / Kurban Etzim",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "spender", l: "Spender / Familie", t: "select", opts: () => [...DATA.holz.kurbanEtzim.map(k => [k.he, `${k.d}. ${MONTH_DE[k.m] || k.m}: ${k.he.slice(0, 40)}`]), ["kauf", "Kauf (Terumat HaLishka)"], ["nedava", "Einzelspende"]] },
    { n: "art", l: "Holzart", t: "select", opts: () => DATA.holz.arten.map(a => [a.id, a.de]) },
    { n: "menge", l: "Menge (Lasten)", t: "number", req: true },
    { n: "trocken", l: "Getrocknet (geschlagen vor 15. Av)", t: "check" },
    { n: "wurm", l: "Wurmprüfung bestanden (Lishkat HaEtzim)", t: "check" },
    { n: "pruefer", l: "Prüfer (Kohen Ba'al Mum)" },
    { n: "kosten", l: "Kosten €", t: "number" },
    { n: "fonds", l: "Bezahlt aus", t: "select", opts: fondsOpts, def: "" },
    { n: "notiz", l: "Notiz" }
  ],
  hinweis: DATA.holz.artenMekor + " · Wurmiges Holz pasul – Middot 2:5",
  spalten: [["Datum", x => fmtDate(x.datum)], ["Spender", x => `<span dir="rtl" class="he">${esc(x.spender === "kauf" ? "Kauf" : x.spender === "nedava" ? "Nedava" : x.spender.slice(0, 30))}</span>`], ["Art", x => esc(holzArt(x.art).de)], ["Menge", x => fmtNum(x.menge)], ["Status", x => x.status === "freigegeben" ? `<span class="ok">im Lager</span>` : x.status === "pasul" ? `<span class="bad">pasul</span>` : "in Prüfung"]],
  onSave: (x, neu) => {
    if (!holzArt(x.art).ok) { x.status = "pasul"; alert("Zayit und Gefen sind für die Ma'aracha pasul (Tamid 2:3) – als pasul erfasst."); return; }
    if (neu && x.kosten && x.fonds) buchen(x.fonds, "aus", x.kosten, `Holzkauf (${x.menge} Lasten)`, "ETZ", x.datum);
    if (x.status !== "freigegeben") {
      if (x.trocken && x.wurm) { x.status = "freigegeben"; lagerBuchen("etzim", Number(x.menge) || 0, `Holz freigegeben (${holzArt(x.art).de})`, x.datum); }
      else x.status = "pruefung";
    }
  }
};
VIEWS.holz = () => {
  const t = todayISO(), best = STATE.lager.etzim?.bestand || 0, proTag = Number(STATE.settings.holzProTag) || 3;
  const naechste = [];
  for (let i = 0; i < 400 && naechste.length < 9; i++) { const d = addDays(t, i), h = heb(d); const k = DATA.holz.kurbanEtzim.find(k => k.m === h.month && k.d === h.day); if (k) naechste.push({ d, k }); }
  const h = heb(t);
  const schlagEnde = (h.month === "Av" && h.day >= 15) || ["Elul", "Tishri", "Heshvan", "Kislev", "Tevet", "Shevat"].includes(h.month);
  return `<div class="grid g3">
    ${card("Bestand", `<div class="stat"><b>${fmtNum(best)}</b><span>Lasten im Lager</span></div><div class="stat"><b>${fmtNum(best / proTag, 0)}</b><span>Tage Reichweite bei ${proTag} Lasten/Tag</span></div>
      <p>${schlagEnde ? `<span class="warn">Nach 15. Av: kein frisches Holz schlagen (Ta'anit 31a)</span>` : `<span class="ok">Holzschlag-Saison</span>`}</p>`)}
    ${card("Kurban Etzim – nächste Termine", `<ul class="list compact">${naechste.map(n => `<li><b>${fmtDate(n.d)}</b> <span dir="rtl" class="he">${n.k.he}</span></li>`).join("")}</ul>${mekor(DATA.holz.kurbanEtzimMekor)}`)}
    ${card("Regeln", `<ul class="list">${DATA.holz.regeln.map(r => `<li>${esc(r)}</li>`).join("")}</ul>`)}
  </div>${card("Lieferungen & Prüfung", `<div class="row">${regNeuBtn("holz", "+ Lieferung")}${csvBtn("holz")}</div>${regTable("holz", null, x => x.status === "pruefung" ? `<button class="btn sm" data-act="holzFrei" data-id="${x.id}">Freigeben</button>` : "")}`)}`;
};
ACT.holzFrei = el => {
  const x = STATE.holz.find(y => y.id === el.dataset.id);
  if (!confirm("Bestätigen: Holz trocken und wurmfrei geprüft (Middot 2:5)?")) return;
  x.trocken = x.wurm = true; x.status = "freigegeben"; lagerBuchen("etzim", Number(x.menge) || 0, "Holz nach Prüfung freigegeben"); saveState(); render();
};

/* =====================================================================
   TEXTIL & FÄRBEREI
   ===================================================================== */
const txArt = id => DATA.textil.artikel.find(a => a.id === id) || {};
REG.textil = {
  titel: "Fertigungsauftrag Bigdei Kehuna / Parochet",
  felder: [
    { n: "datum", l: "Auftragsdatum", t: "date", def: todayISO },
    { n: "artikel", l: "Artikel", t: "select", opts: () => DATA.textil.artikel.map(a => [a.id, a.de]) },
    { n: "anzahl", l: "Anzahl", t: "number", def: 1 },
    { n: "groesse", l: "Größe / Maß (Kohen-Name)" },
    { n: "schritt", l: "Arbeitsschritt", t: "select", opts: () => DATA.textil.schritte.map(s => [s, s]) },
    { n: "fadenzahl", l: "Fadenzahl geprüft (6-fach Shesh / 24 bzw. 28 bei KG)", t: "check" },
    { n: "lishma", l: "Techelet lishma gefärbt (falls verwendet)", t: "check" },
    { n: "shaatnez", l: "Sha'atnez-Prüfung", t: "select", opts: [["offen", "offen"], ["rein", "Kein Sha'atnez – geprüft"], ["vorgeschrieben", "Sha'atnez vorgeschrieben (Avnet/Ephod/Choshen)"]] },
    { n: "verantwortlich", l: "Verantwortlich", def: "Pinchas al haMalbush" },
    { n: "kosten", l: "Kosten €", t: "number" },
    { n: "fonds", l: "Bezahlt aus", t: "select", opts: fondsOpts, def: "terumat_halishka" },
    { n: "notiz", l: "Notiz", t: "textarea" }
  ],
  hinweis: "Bigdei Kehuna aus Terumat HaLishka (Rambam Shekalim 4:1). Parochet: Elazar al haParochet.",
  spalten: [["Datum", x => fmtDate(x.datum)], ["Artikel", x => esc(txArt(x.artikel).de)], ["Anz.", x => esc(x.anzahl)], ["Schritt", x => esc(x.schritt)], ["Prüfungen", x => [x.fadenzahl ? "Faden ✓" : "Faden ?", x.shaatnez === "offen" ? "Sha'atnez ?" : "Sha'atnez ✓", x.lishma ? "Lishma ✓" : ""].filter(Boolean).join(" · ")], ["Status", x => x.eingelagert ? `<span class="ok">im Lager</span>` : "in Arbeit"]],
  onSave: (x, neu) => {
    const a = txArt(x.artikel);
    if (x.shaatnez === "vorgeschrieben" && !["avnet", "ephod", "choshen"].includes(x.artikel)) { alert("Sha'atnez ist nur bei Avnet / Ephod / Choshen vorgeschrieben – sonst Issur (Kil'ayim 9:1)."); return false; }
    if (neu && x.kosten && x.fonds) buchen(x.fonds, "aus", x.kosten, `Fertigung ${a.de} × ${x.anzahl}`, "TX", x.datum);
  }
};
VIEWS.textil = () => {
  const sub = curSub("textil", "auftraege");
  const head = subtabs("textil", [["auftraege", "Aufträge"], ["spezifikation", "Spezifikation"], ["farben", "Farben & Material"]]);
  if (sub === "spezifikation") return head + card("Bigdei Kehuna & Parochet", `<table class="tbl dense"><thead><tr><th>Artikel</th><th>Material / Ausführung</th><th>Mekor</th></tr></thead><tbody>${DATA.textil.artikel.map(a => `<tr><td><b>${esc(a.de)}</b></td><td>${esc(a.material)}</td><td>${mekor(a.mekor)}</td></tr>`).join("")}</tbody></table>`) + card("Regeln", `<ul class="list">${DATA.textil.regeln.map(r => `<li>${esc(r)}</li>`).join("")}</ul>`);
  if (sub === "farben") {
    const mat = ["tzemer", "techelet", "argaman", "shani", "pishtan", "zahav_chut", "chilazon"];
    return head + `<div class="grid g2">${card("Farben (Arba'a Minei Tzeva + Zahav)", `<table class="tbl dense">${DATA.textil.farben.map(f => `<tr><td dir="rtl" class="he">${f.he}</td><td><b>${esc(f.de)}</b></td><td>${esc(f.regel)}</td><td>${mekor(f.mekor)}</td></tr>`).join("")}</table>`)}
      ${card("Materialbestand", `<table class="tbl dense">${mat.map(id => { const l = STATE.lager[id]; return `<tr class="${l.bestand < l.min ? "bad" : ""}"><td>${esc(lagerName(id))}</td><td class="r">${fmtNum(l.bestand)} ${lagerEinheit(id)}</td><td><button class="btn sm" data-act="lagerBuchung" data-id="${id}" data-r="zu">+</button><button class="btn sm ghost" data-act="lagerBuchung" data-id="${id}" data-r="ab">−</button></td></tr>`; }).join("")}</table>`)}</div>`;
  }
  const bg = ["begged_ketonet", "begged_michnasayim", "begged_migbaat", "begged_avnet", "bigdei_kg", "bigdei_lavan", "parochet"];
  return head + `<div class="grid g2">${card("Bestand Bigdei Kehuna", `<table class="tbl dense">${bg.map(id => { const l = STATE.lager[id]; return `<tr class="${l.bestand < l.min ? "bad" : ""}"><td>${esc(lagerName(id))}</td><td class="r">${fmtNum(l.bestand)}</td><td class="r muted">min ${l.min}</td></tr>`; }).join("")}</table>`)}
    ${card("Pinchas al haMalbush", `<p>Ausgabe, Rücknahme, Prüfung auf Risse und Flecken (Zevachim 18b). Abgetragenes → Petilot, Bigdei Lavan → Genizah (Modul Entsorgung).</p>
      <div class="actions"><button class="btn ghost" data-act="go" data-v="entsorgung">→ Entsorgung</button></div>`)}</div>
    ${card("Fertigungsaufträge", `<div class="row">${regNeuBtn("textil", "+ Auftrag")}${csvBtn("textil")}</div>${regTable("textil", null, x => !x.eingelagert ? `<button class="btn sm" data-act="txFertig" data-id="${x.id}">Fertig → Lager</button>` : "")}`)}`;
};
ACT.txFertig = el => {
  const x = STATE.textil.find(y => y.id === el.dataset.id), a = txArt(x.artikel);
  const fehl = [];
  if (!x.fadenzahl) fehl.push("Fadenzahl nicht geprüft");
  if (x.shaatnez === "offen") fehl.push("Sha'atnez-Prüfung offen");
  if (fehl.length && !confirm("Offene Prüfungen: " + fehl.join(", ") + "\nTrotzdem einlagern?")) return;
  x.schritt = "Fertig"; x.eingelagert = true; lagerBuchen(a.lager, Number(x.anzahl) || 1, `Fertigung ${a.de}`); saveState(); render();
};

/* =====================================================================
   ACHILAT KODASHIM & MATANOT KEHUNA
   ===================================================================== */
const kName = id => { const k = DATA.korbanTypes.find(k => k.id === id); return k ? `${k.de} (${k.he})` : id; };
REG.achila = {
  titel: "Achila-Register (Kodashim zum Verzehr)",
  felder: [
    { n: "datum", l: "Shechita / Darbringung", t: "date", def: todayISO },
    { n: "korban", l: "Korban", t: "select", opts: () => DATA.korbanTypes.filter(k => DATA.achila.regeln[k.id]?.frist !== "keine").map(k => [k.id, `${k.de} (${k.he})`]) },
    { n: "bringer", l: "Bringer / Chabura" },
    { n: "empfaenger", l: "Essende (Kohanim des Beit Av / Familie)" },
    { n: "status", l: "Status", t: "select", opts: [["offen", "offen"], ["verzehrt", "verzehrt"], ["notar → Sereifa", "Notar → Sereifa"]] },
    { n: "notiz", l: "Notiz" }
  ],
  spalten: [["Datum", x => fmtDate(x.datum)], ["Korban", x => esc(kName(x.korban))], ["Bringer", x => `<span dir="auto">${esc(x.bringer)}</span>`], ["Wer / Wo", x => { const r = DATA.achila.regeln[x.korban] || {}; return `${esc(r.wer || "")}<br><span class="muted">${esc(r.wo || "")}</span>`; }], ["Frist", x => esc(fristInfo(x.korban, x.datum).text)], ["Status", x => esc(x.status)]],
  rowClass: x => x.status === "offen" && x.bis && dayNum(todayISO()) >= dayNum(x.bis) ? "bad" : "",
  onSave: x => { x.bis = fristInfo(x.korban, x.datum).bis; }
};
REG.matanot = {
  titel: "Matanot Kehuna – Eingang",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "gabe", l: "Gabe", t: "select", opts: () => [...DATA.matanot.mikdash.map(m => [m, "Mikdash: " + m]), ...DATA.matanot.yerushalayim.map(m => [m, "Yerushalayim: " + m]), ...DATA.matanot.gevulin.map(m => [m, "Gevulin: " + m])] },
    { n: "geber", l: "Geber" },
    { n: "menge", l: "Menge / Wert" },
    { n: "empfaenger", l: "Empfänger (Mishmar / Kohen)", def: () => mishmarFor(todayISO()).tr },
    { n: "notiz", l: "Notiz" }
  ],
  hinweis: "Matanot sind Eigentum der Kohanim – keine Hekdesh-Buchung (Chulin 133b).",
  spalten: [["Datum", x => fmtDate(x.datum)], ["Gabe", x => esc(x.gabe)], ["Geber", x => `<span dir="auto">${esc(x.geber)}</span>`], ["Menge", x => esc(x.menge)], ["Empfänger", x => esc(x.empfaenger)]]
};
VIEWS.achila = () => {
  const sub = curSub("achila", "register");
  const head = subtabs("achila", [["register", "Achila-Register"], ["regeln", "Wer · Wo · Bis wann"], ["matanot", "24 Matanot Kehuna"]]);
  if (sub === "regeln") return head + card("Achilat Kodashim (Zevachim 5)", `<table class="tbl dense"><thead><tr><th>Korban</th><th>Wer</th><th>Wo</th><th>Frist</th><th>Mekor</th></tr></thead><tbody>
    ${Object.entries(DATA.achila.regeln).map(([id, r]) => `<tr><td><b>${esc(kName(id))}</b></td><td>${esc(r.wer)}</td><td>${esc(r.wo)}</td><td>${{ keine: "—", tagNacht: "Tag + Nacht bis Chatzot", zweiTage: "2 Tage + 1 Nacht", nachtPesach: "Nacht bis Chatzot" }[r.frist]}</td><td>${mekor(r.mekor)}</td></tr>`).join("")}</tbody></table>
    <ul class="list">${DATA.achila.hinweise.map(h => `<li>${esc(h)}</li>`).join("")}</ul>`);
  if (sub === "matanot") return head + `<div class="grid g3">${card("10 im Mikdash", `<ol>${DATA.matanot.mikdash.map(m => `<li>${esc(m)}</li>`).join("")}</ol>`)}${card("4 in Yerushalayim", `<ol>${DATA.matanot.yerushalayim.map(m => `<li>${esc(m)}</li>`).join("")}</ol>`)}${card("10 in den Gevulin", `<ol>${DATA.matanot.gevulin.map(m => `<li>${esc(m)}</li>`).join("")}</ol>`)}</div>
    <p>${mekor(DATA.matanot.mekor)}</p>` + card("Eingang Matanot", `<div class="row">${regNeuBtn("matanot")}${csvBtn("matanot")}</div>${regTable("matanot")}`);
  const offen = STATE.achila.filter(a => a.status === "offen");
  const ueber = offen.filter(a => a.bis && dayNum(todayISO()) >= dayNum(a.bis));
  return head + card(`Kodashim zum Verzehr – ${offen.length} offen${ueber.length ? `, <span class="bad">${ueber.length} Notar</span>` : ""}`, `
    <p class="muted">Einträge entstehen automatisch, wenn ein Korban Yachid auf „dargebracht“ gesetzt wird, oder manuell. Abgelaufene Fristen → Notar → Sereifa.</p>
    <div class="row">${regNeuBtn("achila")}${csvBtn("achila")}</div>
    ${regTable("achila", null, x => x.status === "offen" ? (x.bis && dayNum(todayISO()) >= dayNum(x.bis) ? `<button class="btn sm danger" data-act="notarSereifa" data-id="${x.id}">Notar → Sereifa</button>` : `<button class="btn sm" data-act="achilaDone" data-id="${x.id}">verzehrt</button>`) : "")}`);
};
ACT.achilaDone = el => { STATE.achila.find(x => x.id === el.dataset.id).status = "verzehrt"; saveState(); render(); };
function onDargebracht(p) {
  const r = DATA.achila.regeln[p.art], d = todayISO();
  if (r && r.frist !== "keine") STATE.achila.push({ id: uid(), datum: d, korban: p.art, bringer: p.bringer, empfaenger: "", status: "offen", bis: fristInfo(p.art, d).bis, notiz: "aus Korbanot Yachid" });
  if (["olah", "chatat", "asham", "olat_reiya"].includes(p.art) && p.tier !== "kinim") STATE.entsorgung.push({ id: uid(), datum: d, kat: "orot", menge: 1, einheit: "Haut", ort: "Lishkat HaParva", verantwortlich: "", erloes: "", notiz: `Haut an Kohanim der Mishmar – ${p.bringer}` });
}

/* =====================================================================
   BIKKURIM
   ===================================================================== */
REG.bikkurim = {
  titel: "Bikkurim-Annahme",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "bringer", l: "Bringer", req: true },
    { n: "herkunft", l: "Herkunft (Ort in Eretz Yisrael)" },
    { n: "minim", l: "Minim", t: "multi", opts: () => DATA.bikkurim.minim.map(m => [m.id, `${m.he} – ${m.de}`]) },
    { n: "menge", l: "Menge / Gewicht" },
    { n: "korb", l: "Korb", t: "select", opts: [["weide", "Weidenkorb (geht an Kohen)"], ["gold", "Gold/Silber (zurück an Bringer)"]] },
    { n: "kriya", l: "Mikra Bikkurim gelesen", t: "check" },
    { n: "nichtLeser", l: "Kein Leser (Frau, Apotropos, Shaliach …)", t: "check" },
    { n: "shelamim", l: "Korban Shelamim gebracht", t: "check" },
    { n: "lina", l: "Lina in Yerushalayim", t: "check" },
    { n: "mishmar", l: "Empfangende Mishmar", def: () => mishmarFor(todayISO()).tr },
    { n: "notiz", l: "Notiz" }
  ],
  hinweis: "Bikkurim 1:3–6; 2:4; 3:1–12",
  spalten: [["Datum", x => fmtDate(x.datum)], ["Bringer", x => `<span dir="auto">${esc(x.bringer)}</span>`], ["Herkunft", x => esc(x.herkunft)], ["Minim", x => (x.minim || []).map(id => (DATA.bikkurim.minim.find(m => m.id === id) || {}).he).join(" · ")], ["Kriya", x => x.kriya ? "✓" : x.nichtLeser ? "ohne (Leser-Status)" : "—"], ["Pflichten", x => [x.shelamim ? "Korban ✓" : "Korban ?", x.lina ? "Lina ✓" : "Lina ?"].join(" · ")], ["Mishmar", x => esc(x.mishmar)]],
  onSave: (x, neu) => {
    const st = bikkurimStatus(x.datum);
    if (!st.ok && !confirm(st.text + "\nTrotzdem erfassen?")) return false;
    if (!(x.minim || []).length) { alert("Nur die 7 Minim (Bikkurim 1:3) – bitte mindestens eine Art wählen."); return false; }
    if (!st.kriya && x.kriya) { alert("Nach Sukkot wird nicht gelesen (Bikkurim 1:6) – Kriya entfernt."); x.kriya = false; }
    if (neu && x.shelamim) STATE.privat.push({ id: uid(), bringer: x.bringer, art: "shelamim", tier: "keves", anlass: "bikkurim", gelobt: x.datum, status: "gelobt", chotam: "", notiz: "Korban der Bikkurim (Bikkurim 2:4)" });
    if (neu) STATE.matanot.push({ id: uid(), datum: x.datum, gabe: "Bikkurim", geber: x.bringer, menge: x.menge, empfaenger: x.mishmar, notiz: x.korb === "weide" ? "inkl. Weidenkorb" : "" });
  }
};
VIEWS.bikkurim = () => {
  const st = bikkurimStatus(), jahr = STATE.bikkurim.filter(x => heb(x.datum).year === heb(todayISO()).year);
  return `<div class="grid g3">
    ${card("Status heute", `<p class="${st.ok ? "ok" : "warn"}"><b>${esc(st.text)}</b></p><div class="stat"><b>${jahr.length}</b><span>Annahmen dieses Jahr</span></div>`, "accent")}
    ${card("Shiv'at HaMinim", `<ul class="list compact">${DATA.bikkurim.minim.map(m => `<li><span dir="rtl" class="he">${m.he}</span> – ${m.de} (${jahr.filter(x => (x.minim || []).includes(m.id)).length})</li>`).join("")}</ul>${mekor("Devarim 8:8; Bikkurim 1:3")}`)}
    ${card("Mikra Bikkurim", `<p>Devarim 26:5–10 · „אֲרַמִּי אֹבֵד אָבִי…“ – Tenufa, Hanacha neben dem Altar, Hishtachava.</p><p>Levi'im singen Tehillim 30 beim Eintritt in die Azara ${mekor("Bikkurim 3:4")}</p>`)}
  </div>${card("Regeln", `<ul class="list">${DATA.bikkurim.regeln.map(r => `<li>${esc(r)}</li>`).join("")}</ul>`)}
  ${card("Annahme-Register", `<div class="row">${regNeuBtn("bikkurim", "+ Bikkurim annehmen")}${csvBtn("bikkurim")}</div>${regTable("bikkurim")}`)}`;
};

/* =====================================================================
   AGRAR-WARENEINGANG (Getreide, Öl, Wein, Früchte)
   ===================================================================== */
function agrarForm(artId = "solet") {
  const A = DATA.agrar.artikel[artId];
  return `<form data-form="agrar" class="form">
    <label>Artikel <select name="artikel" data-change="agrarArtikel">${Object.entries(DATA.agrar.artikel).map(([k, a]) => opt(k, a.de, artId)).join("")}</select></label>
    <label>Datum <input type="date" name="datum" value="${todayISO()}"></label>
    <label>Menge (${A.einheit}) <input type="number" step="any" name="menge" required></label>
    <label>Herkunft <select name="herkunft">${A.orte.map(o => opt(o.n, `${o.n} – ${o.g}`, "")).join("")}${opt("sonstig", "Sonstiger Ort in Eretz Yisrael", "")}${opt("chul", "Chutz LaAretz", "")}</select></label>
    <label>Lieferant <input name="lieferant" dir="auto"></label>
    <fieldset><legend>Prüfungen ${mekor(A.mekor)}</legend>${A.checks.map(c => `<label class="chk"><input type="checkbox" name="chk" value="${c}"> ${esc(DATA.agrar.checks[c].de)} ${mekor(DATA.agrar.checks[c].mekor)}</label>`).join("")}</fieldset>
    <label>Preis je ${A.einheit} € <input type="number" step="any" name="preis" value="${STATE.lager[A.lager]?.preis || ""}"></label>
    <label>Bezahlen aus <select name="fonds">${fondsOpts().map(([k, l]) => opt(k, l, "terumat_halishka")).join("")}</select></label>
    <div class="actions"><button class="btn">Prüfen & einbuchen</button><button type="button" class="btn ghost" data-act="closeModal">Abbrechen</button></div></form>`;
}
FORM.agrar = fd => {
  const artId = fd.get("artikel"), A = DATA.agrar.artikel[artId], chk = fd.getAll("chk");
  const fehl = A.checks.filter(c => !chk.includes(c)).map(c => DATA.agrar.checks[c].de);
  const her = fd.get("herkunft"), ort = A.orte.find(o => o.n === her);
  if (her === "chul" && ["seorim"].includes(artId)) fehl.push("Omer nur aus Eretz Yisrael (Menachot 8:1)");
  const m = Number(fd.get("menge")) || 0, preis = Number(fd.get("preis")) || 0;
  const e = { id: uid(), datum: fd.get("datum"), artikel: artId, menge: m, herkunft: her, guete: ort ? ort.g : her === "chul" ? "Chutz LaAretz" : "zulässig", lieferant: fd.get("lieferant"), checks: chk, fehl, preis, status: fehl.length ? "abgelehnt" : "angenommen" };
  STATE.wareneingang.push(e);
  if (!fehl.length) {
    lagerBuchen(A.lager, m, `Wareneingang ${A.de} – ${her} (${e.guete})`, e.datum);
    if (preis) { STATE.lager[A.lager].preis = preis; buchen(fd.get("fonds"), "aus", m * preis, `Kauf ${A.de} ${m} ${A.einheit} – ${her}`, "WE", e.datum); }
  } else alert("ABGELEHNT – fehlende Prüfungen:\n• " + fehl.join("\n• "));
  closeModal();
};
VIEWS.agrar = () => {
  const mj = maaserJahr();
  return `<div class="grid g3">
    ${card("Wareneingang", `<p>Solet, Weizen, Gerste (Omer), Öl, Shemen Katit, Wein – mit Herkunfts- und Kashrut-Prüfung nach Menachot 8.</p><div class="actions"><button class="btn" data-act="agrarNeu">+ Wareneingang prüfen</button></div>`, "accent")}
    ${card("Jahr im Zyklus", `<div class="stat"><b>${mj.j}</b><span>${esc(mj.art)}</span></div>${mekor("Rambam Ma'aser Sheni 1:1")}`)}
    ${card("Chadash", (() => { const h = heb(todayISO()); const vorOmer = h.month === "Nisan" && h.day < 16; return `<p>${vorOmer ? `<span class="warn">Vor dem Omer: Chadash verboten</span>` : "Omer dargebracht – Chadash für Chulin erlaubt; für Menachot erst nach Shtei HaLechem"} ${mekor("Menachot 10:5–6")}</p>`; })())}
  </div>
  ${card("Herkunft & Güte (Menachot 8)", `<table class="tbl dense"><thead><tr><th>Artikel</th><th>Alfa</th><th>Sheniya</th><th>Mekor</th></tr></thead><tbody>${Object.values(DATA.agrar.artikel).map(a => `<tr><td><b>${esc(a.de)}</b></td><td>${a.orte.filter(o => o.g === "Alfa").map(o => esc(o.n)).join(", ")}</td><td>${a.orte.filter(o => o.g === "Sheniya").map(o => esc(o.n)).join(", ")}</td><td>${mekor(a.mekor)}</td></tr>`).join("")}</tbody></table>
    <ul class="list">${DATA.agrar.hinweise.map(h => `<li>${esc(h)}</li>`).join("")}</ul>`)}
  ${card("Eingangsprotokoll", STATE.wareneingang.length ? `<div class="row"><button class="btn ghost" data-act="agrarCSV">CSV</button></div><div class="scroll"><table class="tbl dense"><thead><tr><th>Datum</th><th>Artikel</th><th class="r">Menge</th><th>Herkunft</th><th>Güte</th><th>Status</th><th>Mängel</th></tr></thead><tbody>
    ${STATE.wareneingang.slice().reverse().map(e => `<tr class="${e.status === "abgelehnt" ? "bad" : ""}"><td>${fmtDate(e.datum)}</td><td>${esc(DATA.agrar.artikel[e.artikel].de)}</td><td class="r">${fmtNum(e.menge)}</td><td>${esc(e.herkunft)}</td><td>${esc(e.guete)}</td><td>${e.status === "angenommen" ? `<span class="ok">angenommen</span>` : "abgelehnt"}</td><td class="small">${esc((e.fehl || []).join("; "))}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Noch keine Eingänge.</p>`)}`;
};
Object.assign(ACT, {
  agrarNeu: () => modal("Wareneingang", agrarForm()),
  agrarCSV: () => download("Wareneingang.csv", csv([["Datum", "Artikel", "Menge", "Herkunft", "Güte", "Status", "Mängel"], ...STATE.wareneingang.map(e => [e.datum, DATA.agrar.artikel[e.artikel].de, e.menge, e.herkunft, e.guete, e.status, (e.fehl || []).join("; ")])]))
});
document.addEventListener("change", e => { if (e.target.dataset.change === "agrarArtikel") { e.stopImmediatePropagation(); $("#modal-body").innerHTML = agrarForm(e.target.value); } }, true);

/* =====================================================================
   HEKDESH & ARACHIN
   ===================================================================== */
VIEWS.hekdesh = () => {
  const s = selaEUR(), r = UI.hekRes || {};
  return `<p class="muted">1 Sela (Shekel HaKodesh) = 2 × ${fmtNum(STATE.settings.machatzitGramm || 9.6, 1)} g Silber ≈ <b>${fmtEUR(s)}</b> (Silberpreis in Einstellungen).</p>
  <div class="grid g2">
    ${card("Erech (Vayikra 27)", `<form class="row" data-form="hekArachin">
        <label>Alter (Jahre) <input type="number" step="any" name="alter" value="30" style="width:6em"></label>
        <select name="g">${opt("m", "männlich", "m")}${opt("w", "weiblich", "")}</select>
        <label class="chk"><input type="checkbox" name="dal"> Dal (arm)</label>
        <label>Dal: Betrag € <input type="number" step="any" name="dalBetrag" style="width:7em"></label>
        <button class="btn">Berechnen</button></form>
      ${r.arachin ? `<div class="result">${esc(r.arachin.text)} <button class="btn sm" data-act="hekBuchen" data-k="arachin">→ Bedek HaBayit buchen</button></div>` : ""}
      <table class="tbl dense"><thead><tr><th>Alter</th><th class="r">Mann</th><th class="r">Frau</th></tr></thead><tbody>${DATA.hekdesh.arachin.map(a => `<tr><td>${a.von < 1 ? "1 Monat" : a.von} – ${a.bis > 100 ? "…" : a.bis}</td><td class="r">${a.m} Sela</td><td class="r">${a.w} Sela</td></tr>`).join("")}</tbody></table>${mekor(DATA.hekdesh.arachinMekor)}`)}
    ${card("Pidyon Hekdesh / Me'ila", `<form class="form" data-form="hekPidyon">
        <label>Wert (Keren) € <input type="number" step="any" name="wert" required></label>
        <label>Art <select name="art">${opt("pidyon", "Pidyon durch den Makdish (+ Chomesh)", "pidyon")}${opt("fremd", "Pidyon durch Fremden (ohne Chomesh)", "")}${opt("meila", "Me'ila (Keren + Chomesh + Asham)", "")}</select></label>
        <div class="actions"><button class="btn">Berechnen</button></div></form>
      ${r.pidyon ? `<div class="result">${esc(r.pidyon.text)} <button class="btn sm" data-act="hekBuchen" data-k="pidyon">→ Bedek HaBayit buchen</button></div>` : ""}`)}
    ${card("Pidyon HaBen & Petter Chamor", `<p>Pidyon HaBen: 5 Sela'im = <b>${fmtEUR(5 * s)}</b> an den Kohen ${mekor("Bamidbar 18:16; Bechorot 8:7")}</p>
      <p>Petter Chamor: Auslösung mit einem Seh an den Kohen ${mekor("Shemot 13:13; Bechorot 1:7")}</p>
      <div class="actions"><button class="btn ghost" data-act="go" data-v="achila">→ Matanot erfassen</button></div>`)}
    ${card("Regeln", `<ul class="list">${DATA.hekdesh.regeln.map(x => `<li>${esc(x)}</li>`).join("")}</ul>`)}
  </div>
  ${card("Hekdesh-Protokoll", STATE.hekdeshLog.length ? `<table class="tbl dense">${STATE.hekdeshLog.slice().reverse().map(x => `<tr><td>${fmtDate(x.datum)}</td><td>${esc(x.text)}</td><td class="r">${fmtEUR(x.betrag)}</td></tr>`).join("")}</table>` : `<p class="muted">—</p>`)}`;
};
Object.assign(FORM, {
  hekArachin: fd => {
    const a = Number(fd.get("alter")), g = fd.get("g"), s = selaEUR();
    if (a < 1 / 12) { UI.hekRes = { ...UI.hekRes, arachin: { betrag: 0, text: "Unter 1 Monat: kein Erech (Arachin 1:1)" } }; return "nosave"; }
    const z = DATA.hekdesh.arachin.find(x => a >= x.von && a < x.bis) || DATA.hekdesh.arachin[3];
    const sela = g === "m" ? z.m : z.w;
    let betrag = sela * s, text = `Erech: ${sela} Sela = ${fmtEUR(betrag)}`;
    if (fd.get("dal")) { const d = Number(fd.get("dalBetrag")) || s; betrag = Math.min(betrag, Math.max(d, s)); text = `Dal BeErech: ${fmtEUR(betrag)} (mind. 1 Sela, max. voller Erech – Arachin 4:1)`; }
    UI.hekRes = { ...UI.hekRes, arachin: { betrag, text } }; return "nosave";
  },
  hekPidyon: fd => {
    const w = Number(fd.get("wert")) || 0, art = fd.get("art"), s = selaEUR();
    let betrag = w, text = "";
    if (art === "pidyon") { betrag = w * 1.25; text = `Keren ${fmtEUR(w)} + Chomesh ${fmtEUR(w * 0.25)} = ${fmtEUR(betrag)}`; }
    else if (art === "fremd") text = `Pidyon zum Wert: ${fmtEUR(w)}`;
    else { betrag = w * 1.25; text = `Me'ila: Keren ${fmtEUR(w)} + Chomesh ${fmtEUR(w * 0.25)} = ${fmtEUR(betrag)} an Hekdesh; zusätzlich Korban Asham (Ayil im Wert von mind. 2 Sela ≈ ${fmtEUR(2 * s)})`; }
    UI.hekRes = { ...UI.hekRes, pidyon: { betrag, text } }; return "nosave";
  }
});
ACT.hekBuchen = el => {
  const r = UI.hekRes[el.dataset.k]; if (!r || !r.betrag) return;
  buchen("bedek", "ein", r.betrag, r.text, "HEK"); STATE.hekdeshLog.push({ datum: todayISO(), text: r.text, betrag: r.betrag });
  UI.hekRes[el.dataset.k] = null; saveState(); render();
};

/* =====================================================================
   WASSER & TAHARA
   ===================================================================== */
REG.taharaLog = {
  titel: "Tahara / Wasser – Protokoll",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "art", l: "Vorgang", t: "select", opts: () => DATA.tahara.arten.map(a => [a.id, a.de]) },
    { n: "betroffen", l: "Betroffene Person / Kli / Mikveh" },
    { n: "efer", l: "Verbrauch Efer (Rationen)", t: "number" },
    { n: "durch", l: "Durchgeführt von (Tahor)" },
    { n: "ok", l: "Ordnungsgemäß / geprüft", t: "check" },
    { n: "notiz", l: "Notiz" }
  ],
  spalten: [["Datum", x => fmtDate(x.datum)], ["Vorgang", x => esc((DATA.tahara.arten.find(a => a.id === x.art) || {}).de)], ["Betroffen", x => `<span dir="auto">${esc(x.betroffen)}</span>`], ["Efer", x => x.efer || ""], ["Durch", x => `<span dir="auto">${esc(x.durch)}</span>`], ["OK", x => x.ok ? "✓" : ""]],
  onSave: (x, neu) => { if (neu && x.efer) lagerBuchen("efer", -Number(x.efer), `Efer Para Aduma: ${x.art}`, x.datum); }
};
VIEWS.tahara = () => {
  const t = todayISO();
  const met = STATE.personal.filter(p => p.tuma === "met" && p.tumaSeit).map(p => ({ p, d3: addDays(p.tumaSeit, 2), d7: addDays(p.tumaSeit, 6) }));
  const heute = met.filter(m => m.d3 === t || m.d7 === t);
  const efer = STATE.lager.efer?.bestand || 0;
  return `<div class="grid g3">
    ${card("Efer Para Aduma", `<div class="stat"><b>${fmtNum(efer)}</b><span>Rationen im Bestand</span></div>${efer < (STATE.lager.efer?.min || 0) ? `<p class="warn">Unter Mindestbestand!</p>` : ""}<p class="small muted">${esc(DATA.tahara.regeln[0])}</p>`, "accent")}
    ${card(`Hazaya heute (${heute.length})`, heute.length ? `<ul class="list">${heute.map(m => `<li><span dir="auto">${esc(m.p.name)}</span> – ${m.d3 === t ? "Tag 3" : "Tag 7 (danach Tevila, Ha'arev Shemesh)"} <button class="btn sm" data-act="hazaya" data-id="${m.p.id}">erfasst</button></li>`).join("")}</ul>` : `<p class="muted">Keine Hazaya fällig.</p>`)}
    ${card("Tamei Met – Plan", met.length ? `<table class="tbl dense"><thead><tr><th>Name</th><th>Tag 3</th><th>Tag 7</th></tr></thead>${met.map(m => `<tr><td dir="auto">${esc(m.p.name)}</td><td>${fmtDate(m.d3)}</td><td>${fmtDate(m.d7)}</td></tr>`).join("")}</table>` : `<p class="muted">Niemand Tamei Met.</p>`)}
  </div>
  ${card("Regeln Wasser & Tahara", `<ul class="list">${DATA.tahara.regeln.map(r => `<li>${esc(r)}</li>`).join("")}</ul><table class="tbl dense">${DATA.tahara.arten.map(a => `<tr><td>${esc(a.de)}</td><td>${mekor(a.mekor)}</td></tr>`).join("")}</table>`)}
  ${card("Protokoll", `<div class="row">${regNeuBtn("taharaLog")}${csvBtn("taharaLog")}</div>${regTable("taharaLog")}`)}`;
};
ACT.hazaya = el => {
  const p = STATE.personal.find(x => x.id === el.dataset.id);
  STATE.taharaLog.push({ id: uid(), datum: todayISO(), art: "hazaya", betroffen: p.name, efer: 0.1, durch: "", ok: true, notiz: "" });
  lagerBuchen("efer", -0.1, `Hazaya ${p.name}`); saveState(); render();
};

/* =====================================================================
   BAUWERK, LISHKOT & INSTANDHALTUNG
   ===================================================================== */
REG.wartung = {
  titel: "Instandhaltung / Bedek HaBayit",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "objekt", l: "Objekt", t: "select", opts: () => [...new Set([...DATA.bau.wartung.map(w => w.objekt), ...DATA.bau.lishkot.map(l => l.n), "Chomot / Mauern", "Sha'arim / Tore", "Kevesh", "Sonstiges"])].map(o => [o, o]) },
    { n: "arbeit", l: "Arbeit", req: true },
    { n: "faellig", l: "Fällig bis", t: "date" },
    { n: "status", l: "Status", t: "select", opts: [["offen", "offen"], ["in Arbeit", "in Arbeit"], ["erledigt", "erledigt"]] },
    { n: "kosten", l: "Kosten €", t: "number" },
    { n: "fonds", l: "Finanzierung", t: "select", opts: fondsOpts, def: "bedek" },
    { n: "notiz", l: "Notiz" }
  ],
  hinweis: "Bedek HaBayit für Bauwerk; Kevesh, Mauern, Stadt aus Shiyarei HaLishka (Shekalim 4:2). Kein Eisen an Altarsteinen (Middot 3:4).",
  spalten: [["Datum", x => fmtDate(x.datum)], ["Objekt", x => esc(x.objekt)], ["Arbeit", x => esc(x.arbeit)], ["Fällig", x => x.faellig ? fmtDate(x.faellig) : ""], ["Status", x => esc(x.status)], ["Kosten", x => x.kosten ? fmtEUR(x.kosten) : ""]],
  rowClass: x => x.status !== "erledigt" && x.faellig && dayNum(todayISO()) > dayNum(x.faellig) ? "bad" : "",
  onSave: x => { if (x.status === "erledigt" && x.kosten && x.fonds && !x.gebucht) { buchen(x.fonds, "aus", x.kosten, `${x.objekt}: ${x.arbeit}`, "BAU", x.datum); x.gebucht = true; } }
};
VIEWS.bau = () => {
  const sub = curSub("bau", "wartung");
  const head = subtabs("bau", [["wartung", "Instandhaltung"], ["lishkot", "Lishkot-Verzeichnis"]]);
  if (sub === "lishkot") return head + card("Lishkot & Räume (Middot)", `<table class="tbl dense"><thead><tr><th>Lishka</th><th>Lage</th><th>Funktion</th><th>Mekor</th></tr></thead><tbody>${DATA.bau.lishkot.map(l => `<tr><td><b>${esc(l.n)}</b></td><td>${esc(l.ort)}</td><td>${esc(l.f)}</td><td>${mekor(l.mekor)}</td></tr>`).join("")}</tbody></table>`);
  const offen = STATE.wartung.filter(w => w.status !== "erledigt");
  return head + `<div class="grid g2">${card("Wartungsplan (Stammdaten)", `<table class="tbl dense"><thead><tr><th>Objekt</th><th>Arbeit</th><th>Intervall</th><th>Mekor</th><th></th></tr></thead><tbody>${DATA.bau.wartung.map((w, i) => `<tr><td><b>${esc(w.objekt)}</b></td><td>${esc(w.arbeit)}</td><td>${esc(w.intervall)}</td><td>${mekor(w.mekor)}</td><td><button class="btn sm ghost" data-act="wartungPlan" data-i="${i}">+ Auftrag</button></td></tr>`).join("")}</tbody></table>`)}
    ${card(`Offene Aufträge (${offen.length})`, offen.length ? `<ul class="list">${offen.map(w => `<li><b>${esc(w.objekt)}</b>: ${esc(w.arbeit)}${w.faellig ? ` – bis ${fmtDate(w.faellig)}` : ""}</li>`).join("")}</ul>` : `<p class="ok">Keine offenen Aufträge.</p>`)}</div>
  ${card("Auftragsbuch", `<div class="row">${regNeuBtn("wartung", "+ Auftrag")}${csvBtn("wartung")}</div>${regTable("wartung")}`)}`;
};
ACT.wartungPlan = el => { const w = DATA.bau.wartung[Number(el.dataset.i)]; modal("Instandhaltung", regForm("wartung", { objekt: w.objekt, arbeit: w.arbeit, status: "offen", fonds: "bedek", datum: todayISO() })); };

/* =====================================================================
   ÜBERSICHT ERWEITERN
   ===================================================================== */
const _dashBase = VIEWS.dashboard;
VIEWS.dashboard = () => {
  const t = todayISO();
  const notar = STATE.achila.filter(a => a.status === "offen" && a.bis && dayNum(t) >= dayNum(a.bis)).length;
  const offenAch = STATE.achila.filter(a => a.status === "offen").length;
  const hatTD = STATE.entsorgung.some(x => x.datum === t && x.kat === "trumat_deshen");
  const holzTage = (STATE.lager.etzim?.bestand || 0) / (Number(STATE.settings.holzProTag) || 3);
  const bk = bikkurimStatus(t);
  const tx = STATE.textil.filter(x => !x.eingelagert).length;
  const ware = STATE.wartung.filter(w => w.status !== "erledigt").length;
  const hz = STATE.personal.filter(p => p.tuma === "met" && p.tumaSeit && [addDays(p.tumaSeit, 2), addDays(p.tumaSeit, 6)].includes(t)).length;
  const k = (titel, wert, sub, v, warn) => `<div class="mini ${warn ? "warnbox" : ""}" data-act="go" data-v="${v}"><b>${wert}</b><span>${titel}</span><small>${sub}</small></div>`;
  const leiste = `<div class="minis">
    ${k("Terumat HaDeshen", hatTD ? "✓" : "offen", "heute", "entsorgung", !hatTD)}
    ${k("Kodashim offen", offenAch, notar ? `${notar} Notar!` : "Achila-Fristen", "achila", notar > 0)}
    ${k("Holz-Reichweite", fmtNum(holzTage, 0) + " T", "Etzei Ma'aracha", "holz", holzTage < 14)}
    ${k("Bikkurim", bk.ok ? (bk.kriya ? "mit Kriya" : "ohne Kriya") : "geschlossen", "Saison", "bikkurim", false)}
    ${k("Hazaya heute", hz, "Tamei Met", "tahara", hz > 0)}
    ${k("Textil-Aufträge", tx, "in Arbeit", "textil", false)}
    ${k("Bedek HaBayit", ware, "offene Aufträge", "bau", false)}
    ${k("Ma'aser-Jahr", maaserJahr().j, maaserJahr().art, "agrar", false)}
  </div>`;
  return leiste + _dashBase();
};

/* =====================================================================
   DEMO-DATEN ERWEITERN
   ===================================================================== */
demoState = (orig => () => {
  const s = orig(), t = todayISO();
  const B = { chita: 40, seorim: 3, zeitim: 10, tzemer: 35, techelet: 4, argaman: 6, shani: 6, pishtan: 50, zahav_chut: 300, chilazon: 0, bigdei_kg: 1, bigdei_lavan: 2, parochet: 1, kinor: 9, nevel: 2, chalil: 2, tziltzal: 1, chatzotzrot: 2, shofar: 2 };
  for (const id in B) s.lager[id] = { bestand: B[id], min: (DATA.lagerVorlage.find(a => a.id === id) || {}).min || 0, preis: 0 };
  s.entsorgung.push({ id: uid(), datum: addDays(t, -1), kat: "dam", menge: 1, einheit: "Tag", ort: "Ama → Nachal Kidron", verantwortlich: "Demo", erloes: 120, fonds: "bedek", notiz: "Demo: Verkauf an Gärtner" });
  s.holz.push({ id: uid(), datum: addDays(t, -10), spender: "kauf", art: "teena", menge: 40, trocken: true, wurm: true, pruefer: "Demo", status: "freigegeben" });
  s.holz.push({ id: uid(), datum: t, spender: "nedava", art: "egoz", menge: 12, trocken: true, wurm: false, pruefer: "", status: "pruefung" });
  s.textil.push({ id: uid(), datum: t, artikel: "ketonet", anzahl: 6, schritt: "Weben", fadenzahl: true, shaatnez: "rein", verantwortlich: "Pinchas al haMalbush" });
  s.achila.push({ id: uid(), datum: addDays(t, -3), korban: "shelamim", bringer: "Demo-Familie", status: "offen", bis: addDays(t, -1), notiz: "Demo: abgelaufen → Notar" });
  s.wartung.push({ id: uid(), datum: t, objekt: "Mizbe'ach", arbeit: "Sid vor Pesach", faellig: addDays(t, 30), status: "offen", fonds: "bedek" });
  return s;
})(demoState);

/* CSS für neue Elemente */
document.head.insertAdjacentHTML("beforeend", `<style>
.minis{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.6em;margin-bottom:1em}
.mini{background:var(--panel);border:1px solid var(--line);border-radius:10px;padding:.6em .8em;cursor:pointer;display:flex;flex-direction:column;box-shadow:var(--shadow)}
.mini b{font-size:1.3em;color:var(--techelet)} .mini span{font-weight:600} .mini small{color:var(--muted)}
.mini:hover{border-color:var(--gold)} .mini.warnbox{border-left:4px solid var(--bad)} .mini.warnbox b{color:var(--bad)}
</style>`);
