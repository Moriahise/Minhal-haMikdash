/* =====================================================================
   app.js – Oberfläche & Module
   ===================================================================== */
"use strict";

const UI = { view: "dashboard", sub: {}, kalMonat: null, kalTag: null, planVon: null, planBis: null, payisPool: "beitav", payisKreis: null, checkListe: "tamid", checkDatum: null, personalFilter: "", personalRolle: "alle" };
const $ = sel => document.querySelector(sel);
const app = () => $("#main");

/* ---------------- Navigation ---------------- */
const NAV = [
  { id: "dashboard",  de: "Übersicht",        he: "סקירה",          ico: "◈" },
  { id: "kalender",   de: "Kalender",          he: "לוח",            ico: "☾" },
  { id: "planer",     de: "Korbanot-Planer",   he: "קרבנות ציבור",   ico: "△" },
  { id: "personal",   de: "Kohanim & Levi'im", he: "משמרות",         ico: "♙" },
  { id: "payis",      de: "Payisot",           he: "פייסות",         ico: "☝" },
  { id: "lager",      de: "Lager & Tiere",     he: "לשכות ואוצרות",  ico: "▤" },
  { id: "finanzen",   de: "Finanzen",          he: "שקלים והקדש",    ico: "◎" },
  { id: "chotamot",   de: "Chotamot",          he: "חותמות ונסכים",  ico: "◉" },
  { id: "privat",     de: "Korbanot Yachid",   he: "קרבנות יחיד",    ico: "✦" },
  { id: "ketoret",    de: "Ketoret",           he: "בית אבטינס",     ico: "❋" },
  { id: "sedarim",    de: "Sedarim",           he: "סדר העבודה",     ico: "☰" },
  { id: "quellen",    de: "Nachschlagewerk",   he: "מקורות",         ico: "✎" },
  { id: "einstellungen", de: "Einstellungen",  he: "הגדרות",         ico: "⚙" }
];

function renderNav() {
  $("#nav").innerHTML = NAV.map(n => `
    <button class="nav-item ${UI.view === n.id ? "active" : ""}" data-act="go" data-v="${n.id}">
      <span class="ico">${n.ico}</span><span class="nde">${n.de}</span><span class="nhe" dir="rtl">${n.he}</span>
    </button>`).join("");
}

function renderHeader() {
  const t = todayISO(), h = heb(t);
  const sm = shemitaInfo(h.year);
  const modus = STATE.settings.modus === "betrieb"
    ? `<span class="badge betrieb" title="Betriebsmodus – nur nach Psak des Beit Din HaGadol">לֶעָתִיד לָבוֹא · Betrieb</span>`
    : `<span class="badge hachana" title="Hachana / Simulation – Lernen und Vorbereitung">בַּזְּמַן הַזֶּה · Hachana / Simulation</span>`;
  $("#hdr-title").innerHTML = `<span dir="rtl" class="he big">${esc(STATE.settings.institution)}</span><span class="sub">Betriebswirtschaftsprogramm</span>`;
  $("#hdr-info").innerHTML = `${modus}
    <span class="hdate"><b dir="rtl" class="he">${hebDateString(t)}</b><small>${fmtDate(t)} · Shemita-Zyklus Jahr ${sm.jahrImZyklus}${sm.shemita ? " (Shemita)" : ""}${sm.hakhel ? " (Hakhel zu Sukkot)" : ""}</small></span>
    <span id="savestate" class="savestate ${STORAGE_OK ? "" : "err"}">${STORAGE_OK ? "● gespeichert" : "⚠ Speicher nicht verfügbar – Sicherung exportieren!"}</span>
    ${STATE.demo ? `<span class="badge demo">DEMO-DATEN</span>` : ""}`;
}
function onSaved() { const el = $("#savestate"); if (el) { el.className = "savestate " + (STORAGE_OK ? "flash" : "err"); el.textContent = STORAGE_OK ? "● gespeichert" : "⚠ Speicher nicht verfügbar – Sicherung exportieren!"; } }

function render() {
  renderNav(); renderHeader();
  const v = VIEWS[UI.view] || VIEWS.dashboard;
  app().innerHTML = v();
  app().scrollTop = 0;
}

/* ---------------- Bausteine ---------------- */
const card = (titel, inhalt, extra = "") => `<section class="card ${extra}"><h3>${titel}</h3>${inhalt}</section>`;
const mekor = m => m ? `<span class="mekor" title="מקור">${esc(m)}</span>` : "";
const subtabs = (view, tabs) => {
  const cur = UI.sub[view] || tabs[0][0];
  return `<div class="subtabs">${tabs.map(([id, l]) => `<button class="${cur === id ? "on" : ""}" data-act="sub" data-view="${view}" data-sub="${id}">${l}</button>`).join("")}</div>`;
};
const curSub = (view, def) => UI.sub[view] || def;
const opt = (v, l, sel) => `<option value="${esc(v)}" ${String(v) === String(sel) ? "selected" : ""}>${esc(l)}</option>`;
const mishmarOptions = sel => DATA.mishmarot.map((m, i) => opt(i, `${i + 1}. ${DATA.mishmarotTranslit[i]} – ${m.replace(/[֑-ׇ]/g, "")}`, sel)).join("");
const fondsName = id => { const f = DATA.fonds.find(x => x.id === id); return f ? f.de : id; };
const lagerName = id => { const a = DATA.lagerVorlage.find(x => x.id === id); return a ? a.name : id; };

function totalsTable(T, opts = {}) {
  const rows = [
    ["Kevasim (כבשים)", T.keves, "Stk"], ["Eilim (אילים)", T.ayil, "Stk"], ["Parim (פרים)", T.par, "Stk"], ["Se'irim (שעירים)", T.seir, "Stk"],
    ["Solet (סולת)", T.solet, "Isaron", isaronLiter(T.solet)], ["Shemen (שמן)", T.shemen, "Log", liter(T.shemen)],
    ["Shemen Katit (Menorah)", T.shemen_katit, "Log", liter(T.shemen_katit)], ["Yayin (יין)", T.yayin, "Log", liter(T.yayin)],
    ["Ketoret", T.ketoret, "Maneh"], ["Levona", T.levona, "Kometz/Bazach"], ["Mayim (Nisuch)", T.wasser, "Log", liter(T.wasser)], ["Etzim (Holz)", T.etzim || 0, "Last"]
  ].filter(r => r[1] || opts.alle);
  return `<table class="tbl"><thead><tr><th>Posten</th><th class="r">Menge</th><th>Einheit</th><th class="r">≈ Liter*</th></tr></thead><tbody>
    ${rows.map(r => `<tr><td>${r[0]}</td><td class="r">${fmtNum(r[1])}</td><td>${r[2]}</td><td class="r muted">${r[3] !== undefined ? fmtNum(r[3], 1) : ""}</td></tr>`).join("")}
  </tbody></table><p class="foot">* Umrechnung nach ${esc(DATA.units.shitot[STATE.settings.shita].name)} – Richtwert, kein Psak. ${mekor(DATA.units.mekor)}</p>`;
}

function planHTML(p, opts = {}) {
  const m = p.mishmar;
  const fest = p.fest.labels.length ? p.fest.labels.map(l => `<span class="tag">${esc(l)}</span>`).join(" ") : `<span class="muted">Chol</span>`;
  const mm = m.regel
    ? `<b>Regel:</b> alle 24 Mishmerot dienen gemeinsam ${mekor("Sukka 5:7; 55b")}`
    : m.shabbatWechsel
      ? `Abgehend: <b dir="rtl">${m.prevName}</b> (${m.prevTr}) – Shachar & Musaf · Ankommend: <b dir="rtl">${m.name}</b> (${m.tr}) – Bein HaArbayim & Bezichin ${mekor("Sukka 56b")}`
      : `<b dir="rtl">${m.name}</b> (${m.tr}) · Beit Av ${m.beitAv}`;
  const verbucht = STATE.verbraucht && STATE.verbraucht[p.iso];
  return `
  <div class="plan">
    <div class="plan-head">
      <div><div class="he big" dir="rtl">${hebDateString(p.iso)}</div><div class="muted">${fmtDate(p.iso)} · ${hebDateDe(p.iso)}</div></div>
      <div class="fest">${fest}</div>
    </div>
    <div class="kv"><span>Mishmar</span><span>${mm}</span></div>
    <div class="kv"><span>Shir shel Yom</span><span><b>Tehillim ${p.shir.psalm}</b> <span dir="rtl" class="he">${p.shir.he}</span> ${mekor("Tamid 7:4")}</span></div>
    ${p.haazinu ? `<div class="kv"><span>Shir Musaf Schabbat</span><span dir="rtl" class="he">${esc(p.haazinu)}</span> ${mekor(DATA.shirMusafShabbat.mekor)}</div>` : ""}
    ${p.chalil ? `<div class="kv"><span>Chalil</span><span>Chalil spielt vor dem Altar ${mekor(DATA.chalilTage.mekor)}</span></div>` : ""}
    <table class="tbl items"><thead><tr><th>Korban / Avoda</th><th class="r">Par</th><th class="r">Ayil</th><th class="r">Keves</th><th class="r">Se'ir</th><th>Mekor</th></tr></thead><tbody>
      ${p.items.map(it => `<tr class="${it.info ? "info" : ""}"><td>${esc(it.titel)}</td>
        <td class="r">${(it.par || 0) + (it.parChatat || 0) || ""}</td><td class="r">${it.ayil || ""}</td>
        <td class="r">${(it.keves || 0) + (it.shelamimKeves || 0) || ""}</td><td class="r">${(it.seir || 0) + (it.seirAzazel || 0) || ""}</td>
        <td>${mekor(it.mekor)}</td></tr>`).join("")}
    </tbody></table>
    ${opts.summen !== false ? `<h4>Tagesbedarf (inkl. Nesachim ${mekor(DATA.nesachim.mekor)})</h4>${totalsTable(p.totals)}` : ""}
    ${opts.buchen ? `<div class="actions">${verbucht ? `<span class="ok">✓ Verbrauch für diesen Tag gebucht</span> <button class="btn ghost" data-act="verbrauchStorno" data-d="${p.iso}">Stornieren</button>` : `<button class="btn" data-act="verbrauch" data-d="${p.iso}">Tagesverbrauch aus Lager buchen</button>`}
      <button class="btn ghost" data-act="druck">Drucken</button></div>` : ""}
  </div>`;
}

/* ---------------- VIEWS ---------------- */
const VIEWS = {};

VIEWS.dashboard = () => {
  const t = todayISO(), p = tagesplan(t), m = p.mishmar;
  const inDienst = STATE.personal.filter(x => (x.rolle === "kohen" || x.rolle === "levi") && (m.regel || (x.mishmar === m.idx && (m.beitAv == null || x.beitAv === m.beitAv))));
  const fit = inDienst.filter(x => dienstfaehig(x).ok);
  const warnLager = DATA.lagerVorlage.filter(a => (STATE.lager[a.id]?.bestand || 0) < (STATE.lager[a.id]?.min || 0));
  const tamidTauglich = STATE.tiere.filter(x => x.art === "keves" && x.status === "geprueft" && dayNum(t) - dayNum(x.geprueft) >= 4).length;
  const fristen = STATE.privat.filter(x => x.status !== "dargebracht").map(x => ({ x, bt: balTeacher(x.gelobt) })).filter(o => o.bt.rabbanan && dayNum(o.bt.rabbanan) - dayNum(t) < 120);
  const next = [];
  for (let i = 1; i <= 60 && next.length < 8; i++) { const d = addDays(t, i), f = festInfo(d); const l = f.labels.filter(x => x !== "Schabbat" && !x.startsWith("Sefirat")); if (l.length) next.push({ d, l }); }
  const sumFonds = DATA.fonds.reduce((a, f) => a + fondsSaldo(f.id), 0);

  return `
  <div class="grid g3">
    ${card("Heute", `
      <div class="he huge" dir="rtl">${hebDateString(t)}</div>
      <div class="muted">${WOCHENTAGE[m.wd]} · ${fmtDate(t)}</div>
      <div class="kv"><span>Mishmar</span><span>${m.regel ? "Regel – alle Mishmerot" : `<b dir="rtl">${m.name}</b> ${m.tr}${m.beitAv ? ` · Beit Av ${m.beitAv}` : " · Wechsel"}`}</span></div>
      <div class="kv"><span>Shir</span><span>Tehillim ${p.shir.psalm}</span></div>
      <div>${p.fest.labels.map(l => `<span class="tag">${esc(l)}</span>`).join(" ")}</div>`, "accent")}
    ${card("Dienstbereitschaft", `
      <div class="stat"><b>${fit.length}</b><span>dienstfähig von ${inDienst.length} eingeteilt</span></div>
      <div class="stat"><b>${tamidTauglich}</b><span>Tamid-Kevasim (≥ 4 Tage geprüft) ${mekor("Arachin 13a; Menachot 49b")}</span></div>
      ${tamidTauglich < 6 ? `<p class="warn">Unter 6 geprüften Lämmern in Lishkat HaTla'im!</p>` : ""}
      <button class="btn ghost" data-act="go" data-v="payis">Payisot durchführen →</button>`)}
    ${card("Kassenlage", `
      <div class="stat"><b>${fmtEUR(sumFonds)}</b><span>Summe aller Fonds</span></div>
      <div class="stat"><b>${fmtEUR(fondsSaldo("terumat_halishka"))}</b><span>Terumat HaLishka</span></div>
      <div class="stat"><b>${fmtEUR(fondsSaldo("bedek"))}</b><span>Bedek HaBayit</span></div>
      <button class="btn ghost" data-act="go" data-v="finanzen">Finanzen →</button>`)}
  </div>
  <div class="grid g2">
    ${card("Tagesplan Korbanot Tzibur", planHTML(p, { buchen: true }))}
    <div>
      ${card("Lagerwarnungen", warnLager.length ? `<ul class="list">${warnLager.map(a => `<li><b>${esc(a.name)}</b>: ${fmtNum(STATE.lager[a.id].bestand)} / min. ${fmtNum(STATE.lager[a.id].min)} ${a.einheit}</li>`).join("")}</ul>` : `<p class="ok">Alle Bestände über Mindestmenge.</p>`)}
      ${card("Nächste Termine (60 Tage)", next.length ? `<ul class="list">${next.map(n => `<li><b>${fmtDate(n.d)}</b> <span class="he" dir="rtl">${hebDateString(n.d)}</span><br><span class="muted">${n.l.map(esc).join(" · ")}</span></li>`).join("")}</ul>` : "—")}
      ${card("Bal Te'acher – Fristen < 120 Tage", fristen.length ? `<ul class="list">${fristen.map(o => `<li><b>${esc(o.x.bringer)}</b> – ${esc(o.x.art)}: bis ${fmtDate(o.bt.rabbanan)}</li>`).join("")}</ul>` : `<p class="muted">Keine offenen Fristen.</p>`)}
      ${card("15 Memunim", `<ul class="list compact">${DATA.memunim.map(x => `<li><span dir="rtl" class="he">${x.name} ${x.amt}</span> – ${esc(x.de)}</li>`).join("")}</ul>${mekor(DATA.memunimMekor)}`)}
    </div>
  </div>`;
};

/* ---------- Kalender ---------- */
VIEWS.kalender = () => {
  const t = todayISO();
  if (!UI.kalMonat) UI.kalMonat = t.slice(0, 7);
  if (!UI.kalTag) UI.kalTag = t;
  const [y, mo] = UI.kalMonat.split("-").map(Number);
  const first = `${y}-${pad(mo)}-01`;
  const start = addDays(first, -dateOf(first).getUTCDay());
  const cells = [];
  for (let i = 0; i < 42; i++) {
    const d = addDays(start, i), f = festInfo(d), h = heb(d);
    const inM = d.slice(0, 7) === UI.kalMonat;
    const cls = ["cell", inM ? "" : "out", d === t ? "today" : "", d === UI.kalTag ? "sel" : "", f.yomTov || f.code.includes("yk") ? "yt" : "", f.regel ? "regel" : "", f.roshChodesh ? "rc" : "", f.shabbat ? "sh" : ""].join(" ");
    const lab = f.labels.filter(l => l !== "Schabbat" && !l.startsWith("Sefirat")).slice(0, 2);
    cells.push(`<div class="${cls}" data-act="kalTag" data-d="${d}"><div class="cd"><b>${Number(d.slice(8))}</b><span dir="rtl" class="he">${gematria(h.day)} ${h.day === 1 || i === 0 ? (MONTH_HE[h.month] || "") : ""}</span></div>${lab.map(l => `<div class="cl">${esc(l)}</div>`).join("")}</div>`);
    if (i >= 34 && dateOf(addDays(start, i + 1)).getUTCMonth() + 1 !== mo && dateOf(addDays(start, i + 1)).getUTCDay() === 0) break;
  }
  const monName = new Date(Date.UTC(y, mo - 1, 1)).toLocaleDateString("de-AT", { month: "long", year: "numeric", timeZone: "UTC" });
  return `
  <div class="grid g2k">
    ${card(`<button class="btn ghost sm" data-act="kalNav" data-n="-1">◀</button> ${monName} <span class="he" dir="rtl">${MONTH_HE[heb(first).month]} – ${MONTH_HE[heb(addDays(first, 27)).month]} ${gematria(heb(first).year % 1000)}</span> <button class="btn ghost sm" data-act="kalNav" data-n="1">▶</button> <button class="btn ghost sm" data-act="kalHeute">Heute</button>`,
      `<div class="kal">${WT_KURZ.map(w => `<div class="wh">${w}</div>`).join("")}${cells.join("")}</div>
       <div class="legend"><span class="lg yt"></span>Yom Tov <span class="lg regel"></span>Regel <span class="lg rc"></span>Rosh Chodesh <span class="lg sh"></span>Schabbat</div>`)}
    ${card("Tagesplan", planHTML(tagesplan(UI.kalTag), { buchen: true }))}
  </div>`;
};

/* ---------- Planer ---------- */
const LAGER_MAP = { keves: "keves", ayil: "ayil", par: "par", seir: "seir", solet: "solet", shemen: "shemen", yayin: "yayin", ketoret: "ketoret", levona: "levona", shemen_katit: "shemen_katit", etzim: "etzim" };
VIEWS.planer = () => {
  const t = todayISO();
  UI.planVon = UI.planVon || t; UI.planBis = UI.planBis || addDays(t, 29);
  const r = bereichsplan(UI.planVon, UI.planBis);
  let kosten = 0;
  const bedarf = Object.entries(LAGER_MAP).map(([k, lid]) => {
    const soll = r.totals[k], ist = STATE.lager[lid]?.bestand || 0, preis = STATE.lager[lid]?.preis || 0;
    const fehl = Math.max(0, soll - ist); kosten += fehl * preis;
    return { k, lid, soll, ist, fehl, preis };
  }).filter(x => x.soll);
  UI._bedarf = bedarf;
  return `
  ${card("Zeitraum", `<form class="row" data-form="planZeitraum">
      <label>Von <input type="date" name="von" value="${UI.planVon}"></label>
      <label>Bis <input type="date" name="bis" value="${UI.planBis}"></label>
      <button class="btn">Berechnen</button>
      <button type="button" class="btn ghost" data-act="planPreset" data-n="7">7 Tage</button>
      <button type="button" class="btn ghost" data-act="planPreset" data-n="30">30 Tage</button>
      <button type="button" class="btn ghost" data-act="planPreset" data-n="jahr">Hebr. Jahr</button>
    </form>`)}
  <div class="grid g2">
    ${card(`Gesamtbedarf Korbanot Tzibur (${r.tage.length} Tage)`, totalsTable(r.totals))}
    ${card("Bedarf vs. Lager → Beschaffung", `<table class="tbl"><thead><tr><th>Posten</th><th class="r">Bedarf</th><th class="r">Bestand</th><th class="r">Fehlmenge</th><th class="r">Kosten</th></tr></thead><tbody>
      ${bedarf.map(b => `<tr class="${b.fehl ? "bad" : ""}"><td>${esc(lagerName(b.lid))}</td><td class="r">${fmtNum(b.soll)}</td><td class="r">${fmtNum(b.ist)}</td><td class="r">${b.fehl ? fmtNum(b.fehl) : "✓"}</td><td class="r">${b.fehl ? fmtEUR(b.fehl * b.preis) : ""}</td></tr>`).join("")}
      <tr class="sum"><td colspan="4">Geschätzte Beschaffungskosten (aus Terumat HaLishka ${mekor("Shekalim 4:1")})</td><td class="r">${fmtEUR(kosten)}</td></tr></tbody></table>
      <div class="actions"><button class="btn" data-act="csvBedarf">Bestellliste (CSV)</button><button class="btn ghost" data-act="csvPlan">Tagesplan (CSV)</button><button class="btn ghost" data-act="druck">Drucken</button></div>`)}
  </div>
  ${card("Tagesübersicht", `<div class="scroll"><table class="tbl dense"><thead><tr><th>Datum</th><th>Hebr.</th><th>Anlass</th><th class="r">Par</th><th class="r">Ayil</th><th class="r">Keves</th><th class="r">Se'ir</th><th class="r">Solet</th><th class="r">Shemen</th><th class="r">Yayin</th><th>Mishmar</th></tr></thead><tbody>
    ${r.tage.map(p => `<tr class="${p.fest.yomTov ? "yt" : p.fest.regel ? "regel" : p.fest.shabbat ? "sh" : ""}" data-act="zuKalender" data-d="${p.iso}"><td>${fmtDate(p.iso)}</td><td dir="rtl" class="he">${hebDateString(p.iso)}</td><td>${esc(p.fest.labels.filter(l => !l.startsWith("Sefirat")).join(", "))}</td>
      <td class="r">${p.totals.par || ""}</td><td class="r">${p.totals.ayil || ""}</td><td class="r">${p.totals.keves}</td><td class="r">${p.totals.seir || ""}</td>
      <td class="r">${fmtNum(p.totals.solet)}</td><td class="r">${fmtNum(p.totals.shemen)}</td><td class="r">${fmtNum(p.totals.yayin)}</td><td>${p.mishmar.regel ? "alle" : p.mishmar.tr}</td></tr>`).join("")}
  </tbody></table></div>`)}`;
};

/* ---------- Personal ---------- */
const ROLLEN = { kohen: "Kohen", kohen_gadol: "Kohen Gadol", segan: "Segan", levi: "Levi", yisrael: "Yisrael (Ma'amad)", memune: "Memune", amarkal: "Amarkal", gizbar: "Gizbar", uman: "Handwerker/Uman", zaken: "Zaken (Beit Din)" };
const QUALI = { shechita: "Shechita", zerika: "Zerika/Kabbala", hafshet: "Hafshet & Nitu'ach", ketoret: "Ketoret", menorah: "Menorah", chatzotzrot: "Chatzotzrot", birkat: "Birkat Kohanim", bikur: "Bikur Mumim" };
VIEWS.personal = () => {
  const sub = curSub("personal", "liste");
  const head = subtabs("personal", [["liste", "Personal"], ["mishmarot", "24 Mishmerot"], ["heute", "Heute im Dienst"], ["regeln", "Psulim & Regeln"]]);
  if (sub === "mishmarot") {
    const cnt = Array(24).fill(0); STATE.personal.forEach(p => { if (p.rolle === "kohen" && p.mishmar >= 0) cnt[p.mishmar]++; });
    const w0 = mishmarFor(todayISO()).idx;
    return head + card("Mishmerot Kehuna (Divrei HaYamim I 24)", `<div class="grid g4">${DATA.mishmarot.map((m, i) => {
      const off = ((i - w0) % 24 + 24) % 24;
      return `<div class="mcard ${i === w0 ? "cur" : ""}"><div class="he big" dir="rtl">${m}</div><div>${i + 1}. ${DATA.mishmarotTranslit[i]}</div><div class="muted">${cnt[i]} Kohanim · nächster Dienst ${off === 0 ? "diese Woche" : "in " + off + " Wochen"}</div></div>`;
    }).join("")}</div><ul class="list">${DATA.mishmarRegeln.map(r => `<li>${esc(r)}</li>`).join("")}</ul>`);
  }
  if (sub === "heute") {
    const m = mishmarFor(todayISO());
    const L = STATE.personal.filter(x => m.regel || (x.mishmar === m.idx && (m.beitAv == null || x.beitAv === m.beitAv)));
    return head + card(`Heute: ${m.regel ? "Regel – alle Mishmerot" : `${m.tr} · ${m.beitAv ? "Beit Av " + m.beitAv : "Schabbat – ganze Mishmar"}`}`, personalTable(L));
  }
  if (sub === "regeln") return head + card("Psulei Avoda", `<ul class="list">${DATA.psulimRegeln.map(r => `<li>${esc(r)}</li>`).join("")}</ul>`) + card("Levi'im – Rollen & Mindestbesetzung", `<table class="tbl">${DATA.leviimRollen.map(r => `<tr><td>${esc(r.de)}</td><td>${mekor(r.mekor)}</td></tr>`).join("")}</table><p>${esc(DATA.mishmarotShmira)}</p>`);
  let L = STATE.personal;
  if (UI.personalRolle !== "alle") L = L.filter(p => p.rolle === UI.personalRolle);
  if (UI.personalFilter) { const q = UI.personalFilter.toLowerCase(); L = L.filter(p => (p.name + " " + (p.notiz || "")).toLowerCase().includes(q)); }
  return head + card("Personalverzeichnis", `
    <div class="row">
      <input type="search" placeholder="Suche…" value="${esc(UI.personalFilter)}" data-input="personalFilter">
      <select data-change="personalRolle">${opt("alle", "Alle Rollen", UI.personalRolle)}${Object.entries(ROLLEN).map(([k, v]) => opt(k, v, UI.personalRolle)).join("")}</select>
      <button class="btn" data-act="personEdit">+ Person</button>
      <button class="btn ghost" data-act="csvPersonal">CSV</button>
    </div>${personalTable(L)}`);
};
function personalTable(L) {
  if (!L.length) return `<p class="muted">Keine Einträge.</p>`;
  return `<div class="scroll"><table class="tbl dense"><thead><tr><th>Name</th><th>Rolle</th><th>Mishmar</th><th>Beit Av</th><th>Status</th><th>Ketoret</th><th>Qualifikation</th><th></th></tr></thead><tbody>
  ${L.map(p => { const d = dienstfaehig(p); return `<tr><td dir="auto">${esc(p.name)}</td><td>${ROLLEN[p.rolle] || p.rolle}${p.levRolle ? " · " + esc((DATA.leviimRollen.find(r => r.id === p.levRolle) || {}).de || p.levRolle) : ""}</td>
    <td>${p.mishmar >= 0 && p.mishmar !== "" ? DATA.mishmarotTranslit[p.mishmar] : "—"}</td><td>${p.beitAv || "—"}</td>
    <td>${d.ok ? `<span class="ok">dienstfähig</span>` : `<span class="bad">${esc(d.gruende.join("; "))}</span>`}</td>
    <td>${p.rolle.startsWith("kohen") ? (p.ketoret ? "hat geräuchert" : "<b>chadash</b>") : ""}</td>
    <td>${(p.quali || []).map(q => QUALI[q] || q).join(", ")}</td>
    <td class="nowrap"><button class="btn sm ghost" data-act="personEdit" data-id="${p.id}">✎</button><button class="btn sm ghost" data-act="personDel" data-id="${p.id}">✕</button></td></tr>`; }).join("")}
  </tbody></table></div>`;
}
function personForm(p = {}) {
  return `<form data-form="person" class="form">
    <input type="hidden" name="id" value="${esc(p.id || "")}">
    <label>Name <input name="name" dir="auto" required value="${esc(p.name || "")}"></label>
    <label>Rolle <select name="rolle">${Object.entries(ROLLEN).map(([k, v]) => opt(k, v, p.rolle || "kohen")).join("")}</select></label>
    <label>Mishmar <select name="mishmar">${opt("", "—", p.mishmar)}${mishmarOptions(p.mishmar)}</select></label>
    <label>Beit Av <input type="number" name="beitAv" min="1" max="9" value="${esc(p.beitAv || "")}"></label>
    <label>Levi-Rolle <select name="levRolle">${opt("", "—", p.levRolle)}${DATA.leviimRollen.map(r => opt(r.id, r.de, p.levRolle)).join("")}</select></label>
    <label>Tum'a-Status <select name="tuma">${DATA.tumaTypen.map(t => opt(t.id, t.de, p.tuma || "tahor")).join("")}</select></label>
    <label>Tum'a seit <input type="date" name="tumaSeit" value="${esc(p.tumaSeit || "")}"></label>
    <label class="chk"><input type="checkbox" name="mum" ${p.mum ? "checked" : ""}> Ba'al Mum</label>
    <label>Mum (Beschreibung / Mekor) <input name="mumText" value="${esc(p.mumText || "")}"></label>
    <label class="chk"><input type="checkbox" name="ketoret" ${p.ketoret ? "checked" : ""}> Hat bereits Ketoret dargebracht (für Payis 3)</label>
    <label>Sonstige Sperre (z. B. Onen, Pru'a Rosh) <input name="gesperrt" value="${esc(p.gesperrt || "")}"></label>
    <fieldset><legend>Qualifikationen</legend>${Object.entries(QUALI).map(([k, v]) => `<label class="chk"><input type="checkbox" name="quali" value="${k}" ${(p.quali || []).includes(k) ? "checked" : ""}> ${v}</label>`).join("")}</fieldset>
    <label>Notiz <textarea name="notiz">${esc(p.notiz || "")}</textarea></label>
    <div class="actions"><button class="btn">Speichern</button><button type="button" class="btn ghost" data-act="closeModal">Abbrechen</button></div>
  </form>`;
}

/* ---------- Payisot ---------- */
function payisPool() {
  const m = mishmarFor(todayISO());
  let L = STATE.personal.filter(p => (p.rolle === "kohen" || p.rolle === "kohen_gadol" || p.rolle === "segan") && dienstfaehig(p).ok);
  if (UI.payisPool === "beitav" && !m.regel) L = L.filter(p => p.mishmar === m.idx && (m.beitAv == null || p.beitAv === m.beitAv));
  else if (UI.payisPool === "mishmar" && !m.regel) L = L.filter(p => p.mishmar === m.idx);
  if (UI.payisKreis) { const ord = UI.payisKreis; L.sort((a, b) => (ord.indexOf(a.id) + 1 || 1e9) - (ord.indexOf(b.id) + 1 || 1e9)); }
  return L;
}
VIEWS.payis = () => {
  const L = payisPool(), m = mishmarFor(todayISO());
  const log = STATE.payisLog.filter(x => x.datum === todayISO());
  return `
  ${card("Kreis in Lishkat HaGazit", `
    <div class="row">
      <label>Teilnehmer <select data-change="payisPool">${opt("beitav", "Beit Av des Tages", UI.payisPool)}${opt("mishmar", "Ganze Mishmar", UI.payisPool)}${opt("alle", "Alle dienstfähigen Kohanim", UI.payisPool)}</select></label>
      <button class="btn ghost" data-act="payisMischen">Kreis neu aufstellen</button>
      <span class="muted">${m.regel ? "Regel – alle Mishmerot" : m.tr + (m.beitAv ? " · Beit Av " + m.beitAv : "")} · ${L.length} dienstfähig im Kreis</span>
    </div>
    <p class="muted">${esc(DATA.payisVerfahren)} ${mekor("Yoma 22a–b")}</p>
    <div class="kreis">${L.map((p, i) => `<span class="kp ${p.ketoret ? "" : "neu"}" title="${p.ketoret ? "hat geräuchert" : "chadash – Ketoret möglich"}">${i + 1}. <span dir="auto">${esc(p.name)}</span></span>`).join("") || `<span class="muted">Keine dienstfähigen Kohanim im Pool – Personal erfassen oder Pool erweitern.</span>`}</div>`)}
  <div class="grid g2">
    ${DATA.payisot.map(py => card(`Payis ${py.nr}: <span dir="rtl" class="he">${py.he}</span>`, `
      <p>${esc(py.de)} ${mekor(py.mekor)}</p>
      <form class="row" data-form="payis">
        <input type="hidden" name="nr" value="${py.nr}">
        <label>Beginn bei Nr. <input type="number" name="start" min="1" value="1" style="width:5em"></label>
        <label>Zahl des Memune <input type="number" name="zahl" min="1" placeholder="zufällig" style="width:7em"></label>
        <button class="btn">Auszählen</button>
      </form>
      ${(log.filter(x => x.nr === py.nr).slice(-1)[0] || null) ? `<div class="result">${log.filter(x => x.nr === py.nr).slice(-1)[0].ergebnis.map(e => `<div><b>${esc(e.rolle)}</b>: <span dir="auto">${esc(e.name)}</span></div>`).join("")}<div class="muted">Zahl ${log.filter(x => x.nr === py.nr).slice(-1)[0].zahl}</div></div>` : ""}`)).join("")}
  </div>
  ${card("Protokoll", STATE.payisLog.length ? `<div class="scroll"><table class="tbl dense"><thead><tr><th>Datum</th><th>Payis</th><th>Zahl</th><th>Ergebnis</th></tr></thead><tbody>${STATE.payisLog.slice(-60).reverse().map(x => `<tr><td>${fmtDate(x.datum)} ${x.zeit || ""}</td><td>${x.nr}</td><td>${x.zahl}</td><td>${x.ergebnis.map(e => esc(e.rolle + ": " + e.name)).join(" · ")}</td></tr>`).join("")}</tbody></table></div>` : `<p class="muted">Noch keine Payisot.</p>`)}`;
};

/* ---------- Lager ---------- */
VIEWS.lager = () => {
  const sub = curSub("lager", "bestand");
  const head = subtabs("lager", [["bestand", "Bestände"], ["tiere", "Lishkat HaTla'im (Tiere)"], ["journal", "Journal"]]);
  if (sub === "tiere") {
    const t = todayISO();
    return head + card("Tierregister – Bikur Mumim", `
      <p class="muted">Tamid: mind. 6 geprüfte Lämmer, Prüfung 4 Tage vor Darbringung ${mekor("Arachin 13a; Menachot 49b")}. Altersgrenzen: Keves bis 1 Jahr, Ayil ab 13 Monaten, Par bis 3 Jahre ${mekor("Para 1:3; Rambam Ma'ase HaKorbanot 1:14")}.</p>
      <div class="row"><button class="btn" data-act="tierEdit">+ Tier</button></div>
      <div class="scroll"><table class="tbl dense"><thead><tr><th>Nr.</th><th>Art</th><th>Alter</th><th>Geprüft</th><th>Tamid-tauglich ab</th><th>Bestimmung</th><th>Status</th><th></th></tr></thead><tbody>
      ${STATE.tiere.map(x => { const ab = x.geprueft ? addDays(x.geprueft, 4) : ""; const okT = ab && dayNum(t) >= dayNum(ab) && x.status === "geprueft"; return `<tr><td>${esc(x.nr)}</td><td>${esc(x.art)}</td><td>${esc(x.alter)}</td><td>${x.geprueft ? fmtDate(x.geprueft) : "—"}</td><td class="${okT ? "ok" : ""}">${ab ? fmtDate(ab) : "—"}</td><td>${esc(x.bestimmung)}</td><td>${esc(x.status)}</td>
      <td class="nowrap"><button class="btn sm ghost" data-act="tierEdit" data-id="${x.id}">✎</button><button class="btn sm ghost" data-act="tierDel" data-id="${x.id}">✕</button></td></tr>`; }).join("") || `<tr><td colspan="8" class="muted">Keine Tiere erfasst.</td></tr>`}
      </tbody></table></div>`);
  }
  if (sub === "journal") {
    return head + card("Lagerjournal", `<div class="row"><button class="btn ghost" data-act="csvJournal">CSV</button></div><div class="scroll"><table class="tbl dense"><thead><tr><th>Datum</th><th>Artikel</th><th class="r">Menge</th><th>Text</th></tr></thead><tbody>
      ${STATE.lagerJournal.slice().reverse().slice(0, 300).map(j => `<tr><td>${fmtDate(j.datum)}</td><td>${esc(lagerName(j.artikel))}</td><td class="r ${j.menge < 0 ? "bad" : "ok"}">${fmtNum(j.menge)}</td><td>${esc(j.text)}</td></tr>`).join("") || `<tr><td colspan="4" class="muted">Leer</td></tr>`}</tbody></table></div>`);
  }
  const kats = [...new Set(DATA.lagerVorlage.map(a => a.kat))];
  let wert = 0;
  const rows = kats.map(k => `<tr class="grp"><td colspan="8">${esc(k)}</td></tr>` + DATA.lagerVorlage.filter(a => a.kat === k).map(a => {
    const l = STATE.lager[a.id]; const w = l.bestand * l.preis; wert += w;
    return `<tr class="${l.bestand < l.min ? "bad" : ""}"><td>${esc(a.name)}<br>${mekor(a.mekor)}</td><td class="r"><b>${fmtNum(l.bestand)}</b></td><td>${a.einheit}</td>
      <td class="r"><input class="num" type="number" step="any" value="${l.min}" data-lagerfeld="min" data-id="${a.id}"></td>
      <td class="r"><input class="num" type="number" step="any" value="${l.preis}" data-lagerfeld="preis" data-id="${a.id}"></td><td class="r">${fmtEUR(w)}</td>
      <td class="nowrap"><button class="btn sm" data-act="lagerBuchung" data-id="${a.id}" data-r="zu">+ Zugang</button><button class="btn sm ghost" data-act="lagerBuchung" data-id="${a.id}" data-r="ab">− Abgang</button></td></tr>`;
  }).join("")).join("");
  return head + card("Bestände (Lishkot & Otzarot)", `<div class="scroll"><table class="tbl dense"><thead><tr><th>Artikel</th><th class="r">Bestand</th><th>Einheit</th><th class="r">Mindest</th><th class="r">Preis/Einh. €</th><th class="r">Wert</th><th></th></tr></thead><tbody>${rows}
    <tr class="sum"><td colspan="5">Lagerwert gesamt</td><td class="r">${fmtEUR(wert)}</td><td></td></tr></tbody></table></div>`);
};
function lagerBuchungForm(id, richtung) {
  const a = DATA.lagerVorlage.find(x => x.id === id);
  return `<form data-form="lagerBuchung" class="form">
    <input type="hidden" name="id" value="${id}"><input type="hidden" name="r" value="${richtung}">
    <p><b>${esc(a.name)}</b> – ${richtung === "zu" ? "Zugang" : "Abgang"}</p>
    <label>Datum <input type="date" name="datum" value="${todayISO()}"></label>
    <label>Menge (${a.einheit}) <input type="number" step="any" name="menge" required></label>
    <label>Text / Lieferant / Herkunft <input name="text"></label>
    ${richtung === "zu" ? `<label>Bezahlen aus Fonds <select name="fonds">${opt("", "— keine Buchung —", "")}${DATA.fonds.map(f => opt(f.id, f.de, "terumat_halishka")).join("")}</select></label>
      <label>Preis je Einheit € <input type="number" step="any" name="preis" value="${STATE.lager[id].preis}"></label>` : ""}
    <div class="actions"><button class="btn">Buchen</button><button type="button" class="btn ghost" data-act="closeModal">Abbrechen</button></div></form>`;
}
function tierForm(x = {}) {
  return `<form data-form="tier" class="form"><input type="hidden" name="id" value="${esc(x.id || "")}">
    <label>Nr. / Kennung <input name="nr" required value="${esc(x.nr || "")}"></label>
    <label>Art <select name="art">${["keves", "kivsa", "ayil", "par", "egel", "seir", "ez", "para_aduma"].map(a => opt(a, a, x.art || "keves")).join("")}</select></label>
    <label>Alter <input name="alter" value="${esc(x.alter || "")}"></label>
    <label>Bikur Mumim am <input type="date" name="geprueft" value="${esc(x.geprueft || todayISO())}"></label>
    <label>Prüfer (Mevaker Mumim) <input name="pruefer" value="${esc(x.pruefer || "")}"></label>
    <label>Bestimmung <select name="bestimmung">${["tamid", "musaf", "privat", "pesach", "para_aduma", "offen"].map(a => opt(a, a, x.bestimmung || "tamid")).join("")}</select></label>
    <label>Status <select name="status">${["ungeprueft", "geprueft", "ba'al mum", "dargebracht", "verkauft (Pidyon)"].map(a => opt(a, a, x.status || "geprueft")).join("")}</select></label>
    <label>Notiz <input name="notiz" value="${esc(x.notiz || "")}"></label>
    <div class="actions"><button class="btn">Speichern</button><button type="button" class="btn ghost" data-act="closeModal">Abbrechen</button></div></form>`;
}

/* ---------- Finanzen ---------- */
VIEWS.finanzen = () => {
  const sub = curSub("finanzen", "fonds");
  const head = subtabs("finanzen", [["fonds", "Fonds & Shofarot"], ["buchungen", "Kassenbuch"], ["shekalim", "Machatzit HaShekel"]]);
  if (sub === "buchungen") {
    return head + card("Kassenbuch", `<div class="row"><button class="btn" data-act="buchungNeu">+ Buchung</button><button class="btn ghost" data-act="umbuchungNeu">⇄ Umbuchung</button><button class="btn ghost" data-act="csvBuchungen">CSV</button></div>
      <div class="scroll"><table class="tbl dense"><thead><tr><th>Datum</th><th>Fonds</th><th>Text</th><th>Beleg</th><th class="r">Einnahme</th><th class="r">Ausgabe</th><th></th></tr></thead><tbody>
      ${STATE.buchungen.slice().sort((a, b) => b.datum.localeCompare(a.datum)).map(b => `<tr><td>${fmtDate(b.datum)}</td><td>${esc(fondsName(b.fonds))}</td><td>${esc(b.text)}</td><td>${esc(b.beleg || "")}</td>
        <td class="r ok">${b.art === "ein" ? fmtEUR(b.betrag) : ""}</td><td class="r bad">${b.art === "aus" ? fmtEUR(b.betrag) : ""}</td><td><button class="btn sm ghost" data-act="buchungDel" data-id="${b.id}">✕</button></td></tr>`).join("") || `<tr><td colspan="7" class="muted">Keine Buchungen.</td></tr>`}
      </tbody></table></div>`);
  }
  if (sub === "shekalim") {
    const s = STATE.settings, sp = Number(s.silberPreisG) || 0, g = Number(s.machatzitGramm || 9.6);
    const ref = g * sp;
    const jahr = heb(todayISO()).year;
    const summeJahr = STATE.shekalim.filter(x => x.jahr == jahr).reduce((a, x) => a + Number(x.betrag), 0);
    return head + `<div class="grid g2">` + card("Machatzit HaShekel erfassen", `
      <p>Referenzwert: ${fmtNum(g, 1)} g Silber × ${fmtEUR(sp)}/g = <b>${fmtEUR(ref)}</b> · Kalbon ${fmtNum(s.kalbonProzent)} % ${mekor("Shekalim 1:6–7")}</p>
      <form class="form" data-form="shekel">
        <label>Name <input name="name" dir="auto" required></label>
        <label>Ort / Shulchan <input name="ort" placeholder="Mikdash / Provinz / Diaspora"></label>
        <label>Datum <input type="date" name="datum" value="${todayISO()}"></label>
        <label>Für Jahr (hebr.) <input type="number" name="jahr" value="${jahr}"></label>
        <label>Betrag € <input type="number" step="any" name="betrag" value="${ref.toFixed(2)}"></label>
        <label class="chk"><input type="checkbox" name="kalbon" checked> Kalbon erheben</label>
        <label class="chk"><input type="checkbox" name="atik"> Für Vorjahr (Tiklin Atikin)</label>
        <div class="actions"><button class="btn">Erfassen & buchen</button></div>
      </form>
      <ul class="list">${DATA.shekalimRegeln.map(r => `<li>${esc(r)}</li>`).join("")}</ul>`) +
      card(`Register ${jahr} – ${STATE.shekalim.filter(x => x.jahr == jahr).length} Einträge · ${fmtEUR(summeJahr)}`, `<div class="row"><button class="btn ghost" data-act="csvShekalim">CSV</button></div><div class="scroll"><table class="tbl dense"><thead><tr><th>Name</th><th>Ort</th><th>Datum</th><th>Jahr</th><th class="r">Betrag</th><th class="r">Kalbon</th></tr></thead><tbody>
        ${STATE.shekalim.slice().reverse().map(x => `<tr><td dir="auto">${esc(x.name)}</td><td>${esc(x.ort)}</td><td>${fmtDate(x.datum)}</td><td>${x.jahr}</td><td class="r">${fmtEUR(x.betrag)}</td><td class="r">${fmtEUR(x.kalbon)}</td></tr>`).join("") || `<tr><td colspan="6" class="muted">Leer</td></tr>`}
      </tbody></table></div>`) + `</div>`;
  }
  return head + `<div class="grid g3">${DATA.fonds.map(f => `<div class="fcard"><div class="he" dir="rtl">${f.he}</div><div class="fname">${esc(f.de)}</div><div class="fsal ${fondsSaldo(f.id) < 0 ? "bad" : ""}">${fmtEUR(fondsSaldo(f.id))}</div><div class="muted small">${esc(f.zweck)}</div>${mekor(f.mekor)}</div>`).join("")}</div>
    ${card("Terumat HaLishka durchführen", `<p>${esc(DATA.shekalimRegeln[4])}</p><form class="row" data-form="trumah">
      <label>Betrag aus Shofar 1 € <input type="number" step="any" name="betrag" value="${Math.max(0, fondsSaldo("sh1")).toFixed(2)}"></label>
      <label class="chk"><input type="checkbox" name="rest"> Verbleibenden Rest → Shiyarei HaLishka</label>
      <button class="btn">Ausführen</button></form>`)}`;
};
function buchungForm() {
  return `<form data-form="buchung" class="form">
    <label>Datum <input type="date" name="datum" value="${todayISO()}"></label>
    <label>Fonds <select name="fonds">${DATA.fonds.map(f => opt(f.id, f.de, "terumat_halishka")).join("")}</select></label>
    <label>Art <select name="art">${opt("ein", "Einnahme", "ein")}${opt("aus", "Ausgabe", "")}</select></label>
    <label>Betrag € <input type="number" step="any" name="betrag" required></label>
    <label>Text <input name="text" required></label>
    <label>Beleg <input name="beleg"></label>
    <p class="muted small">Zweckbindung beachten: Hekdesh-Mittel nur gemäß Fonds-Zweck verwenden (Me'ila – Shekalim 4; Rambam Me'ila).</p>
    <div class="actions"><button class="btn">Buchen</button><button type="button" class="btn ghost" data-act="closeModal">Abbrechen</button></div></form>`;
}
function umbuchungForm() {
  return `<form data-form="umbuchung" class="form">
    <label>Datum <input type="date" name="datum" value="${todayISO()}"></label>
    <label>Von <select name="von">${DATA.fonds.map(f => opt(f.id, f.de, "sh1")).join("")}</select></label>
    <label>Nach <select name="nach">${DATA.fonds.map(f => opt(f.id, f.de, "terumat_halishka")).join("")}</select></label>
    <label>Betrag € <input type="number" step="any" name="betrag" required></label>
    <label>Text <input name="text" value="Umbuchung"></label>
    <div class="actions"><button class="btn">Umbuchen</button><button type="button" class="btn ghost" data-act="closeModal">Abbrechen</button></div></form>`;
}

/* ---------- Chotamot ---------- */
VIEWS.chotamot = () => {
  const t = todayISO();
  const heute = STATE.chotamot.filter(c => c.datum === t);
  const preise = STATE.settings.chotamPreis;
  return `<div class="grid g2">
    ${card("Chotam ausgeben (Yochanan ben Pinchas)", `
      <form class="form" data-form="chotamVerkauf">
        <label>Art <select name="typ">${DATA.chotamot.map(c => opt(c.id, c.de, "gedi")).join("")}</select></label>
        <label>Anzahl <input type="number" name="anzahl" min="1" value="1"></label>
        <label>Käufer <input name="kaeufer" dir="auto"></label>
        <div class="actions"><button class="btn">Ausgeben & kassieren</button></div>
      </form>
      <p class="small muted">Preise (Einstellungen): ${DATA.chotamot.map(c => `${c.he} ${fmtEUR(preise[c.id])}`).join(" · ")}</p>
      <ul class="list">${DATA.chotamotRegeln.map(r => `<li>${esc(r)}</li>`).join("")}</ul>`)}
    ${card(`Heute: ${heute.length} Chotamot · ${heute.filter(c => c.status === "eingeloest").length} eingelöst`, `
      <div class="scroll"><table class="tbl dense"><thead><tr><th>Nr.</th><th>Art</th><th>Käufer</th><th class="r">Betrag</th><th>Status</th><th></th></tr></thead><tbody>
      ${heute.map(c => `<tr><td>${esc(c.nr)}</td><td dir="rtl" class="he">${DATA.chotamot.find(x => x.id === c.typ).he}</td><td dir="auto">${esc(c.kaeufer)}</td><td class="r">${fmtEUR(c.betrag)}</td><td>${c.status === "eingeloest" ? `<span class="ok">eingelöst</span>` : "offen"}</td>
        <td>${c.status !== "eingeloest" ? `<button class="btn sm" data-act="chotamEinloesen" data-id="${c.id}">Nesachim ausgeben (Achiya)</button>` : ""}</td></tr>`).join("") || `<tr><td colspan="6" class="muted">Heute noch keine Chotamot.</td></tr>`}
      </tbody></table></div>
      <div class="actions"><button class="btn" data-act="chotamAbschluss">Tagesabschluss (Cheshbon)</button></div>
      ${STATE.chotamAbschluss.length ? `<h4>Letzte Abschlüsse</h4><table class="tbl dense">${STATE.chotamAbschluss.slice(-8).reverse().map(a => `<tr><td>${fmtDate(a.datum)}</td><td>${a.ausgegeben} ausgegeben / ${a.eingeloest} eingelöst</td><td class="r">${fmtEUR(a.summe)}</td><td>${esc(a.ergebnis)}</td></tr>`).join("")}</table>` : ""}`)}
  </div>`;
};

/* ---------- Korbanot Yachid ---------- */
const STATUS_PRIVAT = ["gelobt", "Tier gekauft", "geprüft", "Chotam gelöst", "dargebracht"];
VIEWS.privat = () => {
  const sub = curSub("privat", "register");
  const head = subtabs("privat", [["register", "Nedarim, Nedavot & Chovot"], ["pesach", "Korban Pesach – Chaburot"]]);
  if (sub === "pesach") {
    const kat = [1, 2, 3].map(k => STATE.chaburot.filter(c => Number(c.kat) === k).length);
    return head + card("Chaburot (Minui) – Korban Pesach", `
      <p class="muted">Registrierung vor der Shechita; Shechita in 3 Kitot ${mekor("Pesachim 5:5")}. Kitot: ${kat.map((n, i) => `Kat ${i + 1}: ${n}`).join(" · ")}</p>
      <form class="row" data-form="chabura">
        <input name="name" placeholder="Chabura" required dir="auto">
        <input name="rosh" placeholder="Verantwortlicher" dir="auto">
        <input name="mitglieder" type="number" min="1" placeholder="Personen" style="width:7em">
        <select name="kat">${opt(1, "Kat 1", 1)}${opt(2, "Kat 2", "")}${opt(3, "Kat 3", "")}</select>
        <input name="tier" placeholder="Tier-Nr." style="width:7em">
        <label class="chk"><input type="checkbox" name="sheni"> Pesach Sheni</label>
        <button class="btn">+ Chabura</button>
      </form>
      <div class="scroll"><table class="tbl dense"><thead><tr><th>Chabura</th><th>Rosh</th><th class="r">Personen</th><th>Kat</th><th>Tier</th><th>Termin</th><th></th></tr></thead><tbody>
      ${STATE.chaburot.map(c => `<tr><td dir="auto">${esc(c.name)}</td><td dir="auto">${esc(c.rosh)}</td><td class="r">${esc(c.mitglieder)}</td><td>${c.kat}</td><td>${esc(c.tier)}</td><td>${c.sheni ? "14. Iyar" : "14. Nisan"}</td><td><button class="btn sm ghost" data-act="chaburaDel" data-id="${c.id}">✕</button></td></tr>`).join("") || `<tr><td colspan="7" class="muted">Keine Chaburot.</td></tr>`}
      </tbody></table></div>`);
  }
  return head + card("Register Korbanot Yachid", `
    <p class="muted">${esc(DATA.sonder.balTeacher)}. Angezeigt: Frist nach Rabbanan (3 Regalim beliebig) und nach R. Shimon (in Reihenfolge, Sukkot zuletzt) – Psak einholen.</p>
    <div class="row"><button class="btn" data-act="privatEdit">+ Eintrag</button><button class="btn ghost" data-act="csvPrivat">CSV</button></div>
    <div class="scroll"><table class="tbl dense"><thead><tr><th>Bringer</th><th>Korban</th><th>Tier</th><th>Anlass</th><th>Gelobt</th><th>Erster Regel (Aseh)</th><th>Bal Te'acher (Rabbanan / R. Shimon)</th><th>Status</th><th></th></tr></thead><tbody>
    ${STATE.privat.map(x => { const bt = balTeacher(x.gelobt || todayISO()); const k = DATA.korbanTypes.find(k => k.id === x.art); const ueber = bt.rabbanan && dayNum(todayISO()) > dayNum(bt.rabbanan) && x.status !== "dargebracht";
      return `<tr class="${ueber ? "bad" : ""}"><td dir="auto">${esc(x.bringer)}</td><td>${k ? `${k.de} <span dir="rtl" class="he">${k.he}</span>` : esc(x.art)}</td><td>${esc(x.tier)}</td><td>${esc(x.anlass)}</td><td>${x.gelobt ? fmtDate(x.gelobt) : ""}</td>
      <td>${bt.erster ? `${bt.erster.typ} ${fmtDate(bt.erster.start)}` : ""}</td><td>${bt.rabbanan ? fmtDate(bt.rabbanan) : ""} / ${bt.rShimon ? fmtDate(bt.rShimon) : ""}</td>
      <td><select data-change="privatStatus" data-id="${x.id}">${STATUS_PRIVAT.map(s => opt(s, s, x.status)).join("")}</select></td>
      <td class="nowrap"><button class="btn sm ghost" data-act="privatEdit" data-id="${x.id}">✎</button><button class="btn sm ghost" data-act="privatDel" data-id="${x.id}">✕</button></td></tr>`; }).join("") || `<tr><td colspan="9" class="muted">Keine Einträge.</td></tr>`}
    </tbody></table></div>
    <h4>Korban-Arten</h4><table class="tbl dense">${DATA.korbanTypes.map(k => `<tr><td dir="rtl" class="he">${k.he}</td><td>${esc(k.de)}</td><td>${esc(k.kodshei)}</td><td>${k.nesachim ? "mit Nesachim" : "ohne Nesachim"}</td><td>${mekor(k.mekor)}</td></tr>`).join("")}</table>`);
};
function privatForm(x = {}) {
  return `<form data-form="privat" class="form"><input type="hidden" name="id" value="${esc(x.id || "")}">
    <label>Bringer <input name="bringer" dir="auto" required value="${esc(x.bringer || "")}"></label>
    <label>Korban <select name="art">${DATA.korbanTypes.map(k => opt(k.id, `${k.de} (${k.he})`, x.art || "olah")).join("")}</select></label>
    <label>Tier <select name="tier">${["keves", "ayil", "par", "seir/ez", "kinim", "—"].map(a => opt(a, a, x.tier || "keves")).join("")}</select></label>
    <label>Anlass <select name="anlass">${["neder", "nedava", "chova", "regel", "metzora", "yoledet", "zav/zava", "nazir"].map(a => opt(a, a, x.anlass || "nedava")).join("")}</select></label>
    <label>Gelobt am <input type="date" name="gelobt" value="${esc(x.gelobt || todayISO())}"></label>
    <label>Status <select name="status">${STATUS_PRIVAT.map(s => opt(s, s, x.status || "gelobt")).join("")}</select></label>
    <label>Chotam-Nr. <input name="chotam" value="${esc(x.chotam || "")}"></label>
    <label>Notiz <input name="notiz" value="${esc(x.notiz || "")}"></label>
    <div class="actions"><button class="btn">Speichern</button><button type="button" class="btn ghost" data-act="closeModal">Abbrechen</button></div></form>`;
}

/* ---------- Ketoret ---------- */
VIEWS.ketoret = () => {
  const K = DATA.ketoret, ziel = Number(UI.ketZiel || K.jahresmenge_maneh), f = ziel / K.jahresmenge_maneh;
  const g = Number(STATE.settings.manehGramm || 480);
  return `<div class="grid g2">
    ${card("Pitum HaKetoret – Rezepturrechner", `
      <form class="row" data-form="ketZiel"><label>Zielmenge (Maneh) <input type="number" step="any" name="ziel" value="${ziel}"></label><button class="btn">Rechnen</button></form>
      <p class="muted">Jahresbedarf: ${K.jahresmenge_maneh} Maneh – ${esc(K.aufteilung)} ${mekor(K.mekor)}</p>
      <table class="tbl"><thead><tr><th>Sam</th><th></th><th class="r">Maneh</th><th class="r">≈ kg*</th></tr></thead><tbody>
      ${K.samanim.map(s => `<tr><td dir="rtl" class="he">${s.he}</td><td>${esc(s.de)}</td><td class="r">${fmtNum(s.maneh * f)}</td><td class="r muted">${fmtNum(s.maneh * f * g / 1000, 2)}</td></tr>`).join("")}
      <tr class="sum"><td colspan="2">Summe Samanim</td><td class="r">${fmtNum(K.samanim.reduce((a, s) => a + s.maneh, 0) * f)}</td><td class="r muted">${fmtNum(K.samanim.reduce((a, s) => a + s.maneh, 0) * f * g / 1000, 2)}</td></tr></tbody></table>
      <h4>Zusätze (bezogen auf 368 Maneh)</h4><ul class="list">${K.zusaetze.map(z => `<li><span dir="rtl" class="he">${z.he}</span> ${esc(z.de)} – ${esc(z.menge)}${f !== 1 ? ` × ${fmtNum(f, 3)}` : ""}</li>`).join("")}</ul>
      <ul class="list warnlist">${K.hinweise.map(h => `<li>${esc(h)}</li>`).join("")}</ul>
      <p class="foot">* Maneh ≈ ${g} g (100 Dinar; Einstellung) – Richtwert.</p>`)}
    ${card("Chargen – Beit Avtinas", `
      <form class="row" data-form="ketCharge">
        <input type="date" name="datum" value="${todayISO()}">
        <input type="number" step="any" name="menge" placeholder="Maneh" required style="width:7em">
        <input name="memune" placeholder="Verantwortlich">
        <button class="btn">+ Charge</button>
      </form>
      <div class="scroll"><table class="tbl dense"><thead><tr><th>Charge</th><th>Datum</th><th class="r">Maneh</th><th>Status</th><th></th></tr></thead><tbody>
      ${STATE.ketoretChargen.slice().reverse().map(c => `<tr><td>${esc(c.nr)}</td><td>${fmtDate(c.datum)}</td><td class="r">${fmtNum(c.menge)}</td><td>${esc(c.status)}</td>
        <td>${c.status !== "eingelagert" ? `<button class="btn sm" data-act="ketWeiter" data-id="${c.id}">${c.status === "angesetzt" ? "→ zerstoßen" : "→ einlagern"}</button>` : `<span class="ok">✓</span>`}</td></tr>`).join("") || `<tr><td colspan="5" class="muted">Keine Chargen.</td></tr>`}
      </tbody></table></div>
      <p>Lagerbestand fertige Ketoret: <b>${fmtNum(STATE.lager.ketoret.bestand)} Maneh</b> · reicht ca. ${Math.floor(STATE.lager.ketoret.bestand)} Tage.</p>`)}
  </div>`;
};

/* ---------- Sedarim ---------- */
VIEWS.sedarim = () => {
  UI.checkDatum = UI.checkDatum || todayISO();
  const L = DATA.checklisten[UI.checkListe];
  const key = `${UI.checkListe}|${UI.checkDatum}`;
  const done = STATE.checklisten[key] || [];
  const pct = Math.round(done.length / L.schritte.length * 100);
  return `${card("Seder HaAvoda – Checklisten", `
    <div class="row">
      <select data-change="checkListe">${Object.entries(DATA.checklisten).map(([k, v]) => opt(k, v.titel, UI.checkListe)).join("")}</select>
      <input type="date" value="${UI.checkDatum}" data-change="checkDatum">
      <button class="btn ghost" data-act="checkReset">Zurücksetzen</button>
      <button class="btn ghost" data-act="druck">Drucken</button>
    </div>
    <div class="progress"><div style="width:${pct}%"></div><span>${pct} %</span></div>
    <p>${mekor(L.mekor)}</p>
    <ol class="check">${L.schritte.map((s, i) => `<li class="${done.includes(i) ? "done" : ""}" data-act="checkToggle" data-i="${i}"><span class="box">${done.includes(i) ? "✓" : ""}</span>${esc(s)}</li>`).join("")}</ol>`)}`;
};

/* ---------- Nachschlagewerk ---------- */
VIEWS.quellen = () => {
  const M = DATA.musaf, N = DATA.nesachim;
  return `<div class="grid g2">
    ${card("Musafim (Bamidbar 28–29)", `<table class="tbl dense"><thead><tr><th>Anlass</th><th class="r">Par</th><th class="r">Ayil</th><th class="r">Keves</th><th class="r">Se'ir</th><th>Mekor</th></tr></thead><tbody>
      ${Object.values(M).map(x => `<tr><td dir="rtl" class="he">${x.he}</td><td class="r">${Array.isArray(x.par) ? x.par.join("→") : x.par}</td><td class="r">${x.ayil}</td><td class="r">${x.keves}${x.shelamimKeves ? " + " + x.shelamimKeves + " Shl." : ""}</td><td class="r">${x.seir}</td><td>${mekor(x.mekor)}</td></tr>`).join("")}
    </tbody></table>`)}
    ${card("Nesachim pro Tier", `<table class="tbl dense"><thead><tr><th>Tier</th><th class="r">Solet (Isaron)</th><th class="r">Shemen (Log)</th><th class="r">Yayin (Log)</th></tr></thead><tbody>
      ${["keves", "ayil", "par"].map(k => `<tr><td>${N[k].label}</td><td class="r">${N[k].solet_isaron}</td><td class="r">${N[k].shemen_log}</td><td class="r">${N[k].yayin_log}</td></tr>`).join("")}</tbody></table>${mekor(N.mekor)}
      <h4>Täglich</h4><ul class="list">${Object.values(DATA.daily).map(d => `<li>${esc(d.note)} ${mekor(d.mekor)}</li>`).join("")}</ul>`)}
    ${card("Bigdei Kehuna", `<p><b>Kohen Hedyot (4):</b> <span dir="rtl" class="he">${DATA.bigdei.hedyot.join(" · ")}</span></p><p><b>Kohen Gadol (8):</b> <span dir="rtl" class="he">${DATA.bigdei.gadol.join(" · ")}</span></p><p>${esc(DATA.bigdei.lavan)}</p><ul class="list">${DATA.bigdei.regeln.map(r => `<li>${esc(r)}</li>`).join("")}</ul>${mekor(DATA.bigdei.mekor)}`)}
    ${card("Yom HaKippurim – Korbanot HaYom", `<table class="tbl dense">${DATA.yomKippurAvoda.items.map(i => `<tr><td dir="rtl" class="he">${i.he}</td><td>${i.n} ${i.tier}</td><td>${i.typ}</td><td>${esc(i.who)}</td></tr>`).join("")}</table><p>${DATA.yomKippurAvoda.tevilot} Tevilot · ${DATA.yomKippurAvoda.kiddushin} Kiddushei Yadayim veRaglayim · ${esc(DATA.yomKippurAvoda.ketoret)}</p>${mekor(DATA.yomKippurAvoda.mekor)}`)}
    ${card("Shir der Levi'im", `<table class="tbl dense">${DATA.shirShelYom.map(s => `<tr><td>${s.tag}</td><td>Tehillim ${s.psalm}</td><td dir="rtl" class="he">${s.he}</td></tr>`).join("")}</table>
      <p>${esc(DATA.shirMusafShabbat.text)} ${mekor(DATA.shirMusafShabbat.mekor)}</p><ol>${DATA.shirMusafShabbat.teile.map(t => `<li dir="rtl" class="he">${esc(t)}</li>`).join("")}</ol><p>${esc(DATA.shirMusafShabbat.mincha)}</p><p>${esc(DATA.chalilTage.text)} ${mekor(DATA.chalilTage.mekor)}</p>`)}
    ${card("Jahreszyklus & Sonderzeiten", `<ul class="list">${Object.values(DATA.sonder).map(s => `<li>${esc(s)}</li>`).join("")}</ul>`)}
    ${card("Fonds (Shekalim 6:5)", `<table class="tbl dense">${DATA.fonds.map(f => `<tr><td dir="rtl" class="he">${f.he}</td><td>${esc(f.de)}</td><td>${esc(f.zweck)}</td><td>${mekor(f.mekor)}</td></tr>`).join("")}</table>`)}
    ${card("Methodik", `<p><b>בַּזְּמַן הַזֶּה</b> – Hachana, Lernen, Simulation, Rechnung und Vorbereitung. <b>לֶעָתִיד לָבוֹא</b> – tatsächlicher Betrieb ausschließlich nach Psak eines anerkannten Beit Din HaGadol (vgl. Rambam Beit HaBechira 6:15–16; Melachim 11:1).</p>
      <p>Alle Stammdaten tragen ihren Mekor. Wo Shitot auseinandergehen (Shiurim, Bal Te'acher, Halbmengen der Ketoret, Rotation an Regalim), rechnet das Programm sichtbar nach einer Shita und markiert die Stelle – es ersetzt keinen Psak.</p>`)}
  </div>`;
};

/* ---------- Einstellungen ---------- */
VIEWS.einstellungen = () => {
  const s = STATE.settings;
  return `<div class="grid g2">
  ${card("Grundeinstellungen", `<form class="form" data-form="settings">
    <label>Institution <input name="institution" dir="rtl" value="${esc(s.institution)}"></label>
    <fieldset><legend>Modus</legend>
      <label class="chk"><input type="radio" name="modus" value="hachana" ${s.modus !== "betrieb" ? "checked" : ""}> בַּזְּמַן הַזֶּה – Hachana / Simulation / Lernen</label>
      <label class="chk"><input type="radio" name="modus" value="betrieb" ${s.modus === "betrieb" ? "checked" : ""}> לֶעָתִיד לָבוֹא – Betrieb (nur nach Psak des Beit Din HaGadol)</label></fieldset>
    <label>Shiurim-Shita <select name="shita">${Object.entries(DATA.units.shitot).map(([k, v]) => opt(k, v.name, s.shita)).join("")}</select></label>
    <label>Referenz-Schabbat (Mishmar-Wechsel) <input type="date" name="refShabbat" value="${s.refShabbat}"></label>
    <label>Ankommende Mishmar an diesem Schabbat <select name="refMishmar">${mishmarOptions(s.refMishmar)}</select></label>
    <label>Batei Av je Mishmar <input type="number" name="bateiAv" min="4" max="9" value="${s.bateiAv}"></label>
    <label>Silberpreis €/g <input type="number" step="any" name="silberPreisG" value="${s.silberPreisG}"></label>
    <label>Machatzit HaShekel – Gramm Silber <input type="number" step="any" name="machatzitGramm" value="${s.machatzitGramm || 9.6}"></label>
    <label>Kalbon % <input type="number" step="any" name="kalbonProzent" value="${s.kalbonProzent}"></label>
    <label>Maneh in Gramm (Ketoret) <input type="number" step="any" name="manehGramm" value="${s.manehGramm || 480}"></label>
    <label>Holzverbrauch je Tag (Lasten, Richtwert) <input type="number" step="any" name="holzProTag" value="${s.holzProTag || 3}"></label>
    <fieldset><legend>Chotam-Preise €</legend>${DATA.chotamot.map(c => `<label>${esc(c.de)} <input type="number" step="any" name="cp_${c.id}" value="${s.chotamPreis[c.id] || 0}"></label>`).join("")}</fieldset>
    <div class="actions"><button class="btn">Speichern</button></div></form>
    <p class="muted small">Der Referenz-Schabbat legt die Rotation der 24 Mishmerot fest. Die historische Zuordnung ist für die Zukunft nicht überliefert – Festlegung durch das Beit Din.</p>`)}
  ${card("Datensicherung", `
    <p>Daten werden lokal im Browser dieses Rechners gespeichert. Regelmäßig sichern!</p>
    <div class="actions"><button class="btn" data-act="export">Sicherung exportieren (.json)</button>
    <label class="btn ghost">Sicherung importieren <input type="file" accept=".json,application/json" data-change="import" hidden></label></div>
    <hr><div class="actions"><button class="btn ghost" data-act="demo">Demo-Daten laden</button><button class="btn danger" data-act="reset">Alle Daten löschen</button></div>
    <p class="muted small">Zuletzt gespeichert: ${STATE.gespeichert ? new Date(STATE.gespeichert).toLocaleString("de-AT") : "—"}</p>`)}
  </div>`;
};

/* ---------------- Modal ---------------- */
function modal(titel, html) { $("#modal-title").textContent = titel; $("#modal-body").innerHTML = html; $("#modal").showModal(); }
function closeModal() { $("#modal").close(); }

/* ---------------- CSV / Download ---------------- */
function download(name, text, type = "text/csv;charset=utf-8") {
  const b = new Blob(["﻿" + text], { type }); const a = document.createElement("a");
  a.href = URL.createObjectURL(b); a.download = name; document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
}
const csv = rows => rows.map(r => r.map(c => `"${String(c ?? "").replace(/"/g, '""')}"`).join(";")).join("\r\n");

/* ---------------- Aktionen ---------------- */
function lagerBuchen(id, menge, text, datum = todayISO()) {
  STATE.lager[id].bestand = Math.round((STATE.lager[id].bestand + menge) * 1000) / 1000;
  STATE.lagerJournal.push({ datum, artikel: id, menge, text });
}
const ACT = {
  go: el => { UI.view = el.dataset.v; document.body.classList.remove("navopen"); render(); },
  navToggle: () => document.body.classList.toggle("navopen"),
  sub: el => { UI.sub[el.dataset.view] = el.dataset.sub; render(); },
  closeModal,
  druck: () => window.print(),
  kalNav: el => { const [y, m] = UI.kalMonat.split("-").map(Number); const d = new Date(Date.UTC(y, m - 1 + Number(el.dataset.n), 1)); UI.kalMonat = isoOf(d).slice(0, 7); render(); },
  kalHeute: () => { UI.kalMonat = todayISO().slice(0, 7); UI.kalTag = todayISO(); render(); },
  kalTag: el => { UI.kalTag = el.dataset.d; render(); },
  zuKalender: el => { UI.kalTag = el.dataset.d; UI.kalMonat = el.dataset.d.slice(0, 7); UI.view = "kalender"; render(); },
  planPreset: el => {
    const t = todayISO(); UI.planVon = t;
    if (el.dataset.n === "jahr") { let d = addDays(t, 1); for (let i = 0; i < 400; i++, d = addDays(d, 1)) { const h = heb(d); if (h.month === "Tishri" && h.day === 1) break; } UI.planBis = addDays(d, -1); }
    else UI.planBis = addDays(t, Number(el.dataset.n) - 1);
    render();
  },
  verbrauch: el => {
    const d = el.dataset.d, p = tagesplan(d); STATE.verbraucht = STATE.verbraucht || {};
    const fehl = Object.entries(LAGER_MAP).filter(([k, lid]) => p.totals[k] > (STATE.lager[lid]?.bestand || 0)).map(([k, lid]) => `${lagerName(lid)}: Bedarf ${fmtNum(p.totals[k])}, Bestand ${fmtNum(STATE.lager[lid].bestand)}`);
    if (fehl.length && !confirm("Achtung – Bestand reicht nicht:\n\n" + fehl.join("\n") + "\n\nTrotzdem buchen (negativer Bestand)?")) return;
    for (const [k, lid] of Object.entries(LAGER_MAP)) if (p.totals[k]) lagerBuchen(lid, -p.totals[k], `Tagesverbrauch ${hebDateString(d)}`, d);
    STATE.verbraucht[d] = true; saveState(); render();
  },
  verbrauchStorno: el => {
    const d = el.dataset.d, p = tagesplan(d);
    for (const [k, lid] of Object.entries(LAGER_MAP)) if (p.totals[k]) lagerBuchen(lid, p.totals[k], `Storno Tagesverbrauch ${hebDateString(d)}`, d);
    delete STATE.verbraucht[d]; saveState(); render();
  },
  csvBedarf: () => download("Bestellliste.csv", csv([["Artikel", "Bedarf", "Bestand", "Fehlmenge", "Preis", "Kosten"], ...UI._bedarf.map(b => [lagerName(b.lid), b.soll, b.ist, b.fehl, b.preis, b.fehl * b.preis])])),
  csvPlan: () => { const r = bereichsplan(UI.planVon, UI.planBis); download("Korbanot-Plan.csv", csv([["Datum", "Hebr. Datum", "Anlass", "Par", "Ayil", "Keves", "Se'ir", "Solet Isaron", "Shemen Log", "Yayin Log", "Ketoret Maneh", "Mishmar"], ...r.tage.map(p => [p.iso, hebDateString(p.iso), p.fest.labels.join(", "), p.totals.par, p.totals.ayil, p.totals.keves, p.totals.seir, p.totals.solet, p.totals.shemen, p.totals.yayin, p.totals.ketoret, p.mishmar.regel ? "alle" : p.mishmar.tr])])); },
  csvPersonal: () => download("Personal.csv", csv([["Name", "Rolle", "Mishmar", "Beit Av", "Tum'a", "Mum", "Ketoret", "Qualifikation", "Notiz"], ...STATE.personal.map(p => [p.name, ROLLEN[p.rolle], p.mishmar !== "" && p.mishmar != null ? DATA.mishmarotTranslit[p.mishmar] : "", p.beitAv, p.tuma, p.mum ? "ja" : "", p.ketoret ? "ja" : "", (p.quali || []).join(","), p.notiz])])),
  csvJournal: () => download("Lagerjournal.csv", csv([["Datum", "Artikel", "Menge", "Text"], ...STATE.lagerJournal.map(j => [j.datum, lagerName(j.artikel), j.menge, j.text])])),
  csvBuchungen: () => download("Kassenbuch.csv", csv([["Datum", "Fonds", "Art", "Betrag", "Text", "Beleg"], ...STATE.buchungen.map(b => [b.datum, fondsName(b.fonds), b.art, b.betrag, b.text, b.beleg])])),
  csvShekalim: () => download("Shekalim.csv", csv([["Name", "Ort", "Datum", "Jahr", "Betrag", "Kalbon"], ...STATE.shekalim.map(x => [x.name, x.ort, x.datum, x.jahr, x.betrag, x.kalbon])])),
  csvPrivat: () => download("Korbanot-Yachid.csv", csv([["Bringer", "Korban", "Tier", "Anlass", "Gelobt", "Frist Rabbanan", "Frist R. Shimon", "Status"], ...STATE.privat.map(x => { const bt = balTeacher(x.gelobt); return [x.bringer, x.art, x.tier, x.anlass, x.gelobt, bt.rabbanan, bt.rShimon, x.status]; })])),
  personEdit: el => modal(el.dataset.id ? "Person bearbeiten" : "Neue Person", personForm(STATE.personal.find(p => p.id === el.dataset.id))),
  personDel: el => { if (confirm("Eintrag löschen?")) { STATE.personal = STATE.personal.filter(p => p.id !== el.dataset.id); saveState(); render(); } },
  payisMischen: () => { const L = payisPool().map(p => p.id); for (let i = L.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [L[i], L[j]] = [L[j], L[i]]; } UI.payisKreis = L; render(); },
  tierEdit: el => modal("Tier", tierForm(STATE.tiere.find(x => x.id === el.dataset.id))),
  tierDel: el => { if (confirm("Tier löschen?")) { STATE.tiere = STATE.tiere.filter(x => x.id !== el.dataset.id); saveState(); render(); } },
  lagerBuchung: el => modal("Lagerbuchung", lagerBuchungForm(el.dataset.id, el.dataset.r)),
  buchungNeu: () => modal("Neue Buchung", buchungForm()),
  umbuchungNeu: () => modal("Umbuchung", umbuchungForm()),
  buchungDel: el => { if (confirm("Buchung löschen?")) { STATE.buchungen = STATE.buchungen.filter(b => b.id !== el.dataset.id); saveState(); render(); } },
  chotamEinloesen: el => {
    const c = STATE.chotamot.find(x => x.id === el.dataset.id); if (!c) return;
    const n = DATA.chotamNesachim[c.typ];
    lagerBuchen("solet", -n.solet, `Nesachim gegen Chotam ${c.nr}`); lagerBuchen("shemen", -n.shemen, `Nesachim gegen Chotam ${c.nr}`); lagerBuchen("yayin", -n.yayin, `Nesachim gegen Chotam ${c.nr}`);
    c.status = "eingeloest"; saveState(); render();
  },
  chotamAbschluss: () => {
    const t = todayISO(), H = STATE.chotamot.filter(c => c.datum === t);
    const summe = H.reduce((a, c) => a + Number(c.betrag), 0);
    const kasse = STATE.buchungen.filter(b => b.datum === t && b.fonds === "nesachim" && b.quelle === "chotam").reduce((a, b) => a + Number(b.betrag), 0);
    const offen = H.filter(c => c.status !== "eingeloest").length;
    const diff = Math.round((kasse - summe) * 100) / 100;
    const ergebnis = (diff === 0 ? "Kasse stimmt" : diff > 0 ? `Überschuss ${fmtEUR(diff)} → Hekdesh` : `Fehlbetrag ${fmtEUR(-diff)} – Memune ersetzt (Shekalim 5:4)`) + (offen ? ` · ${offen} Chotamot offen` : "");
    STATE.chotamAbschluss.push({ datum: t, ausgegeben: H.length, eingeloest: H.length - offen, summe, ergebnis });
    saveState(); render(); alert("Tagesabschluss:\n" + ergebnis);
  },
  privatEdit: el => modal("Korban Yachid", privatForm(STATE.privat.find(x => x.id === el.dataset.id))),
  privatDel: el => { if (confirm("Eintrag löschen?")) { STATE.privat = STATE.privat.filter(x => x.id !== el.dataset.id); saveState(); render(); } },
  chaburaDel: el => { STATE.chaburot = STATE.chaburot.filter(x => x.id !== el.dataset.id); saveState(); render(); },
  ketWeiter: el => {
    const c = STATE.ketoretChargen.find(x => x.id === el.dataset.id);
    if (c.status === "angesetzt") c.status = "zerstoßen";
    else { c.status = "eingelagert"; lagerBuchen("ketoret", Number(c.menge), `Charge ${c.nr} eingelagert`); }
    saveState(); render();
  },
  checkToggle: el => {
    const key = `${UI.checkListe}|${UI.checkDatum}`, i = Number(el.dataset.i);
    const a = STATE.checklisten[key] || []; STATE.checklisten[key] = a.includes(i) ? a.filter(x => x !== i) : [...a, i];
    saveState(); render();
  },
  checkReset: () => { delete STATE.checklisten[`${UI.checkListe}|${UI.checkDatum}`]; saveState(); render(); },
  export: () => download(`BeitHaMikdash_Sicherung_${todayISO()}.json`, JSON.stringify(STATE, null, 1), "application/json"),
  demo: () => { if (confirm("Demo-Daten laden? Bestehende Daten werden ersetzt (vorher exportieren!).")) { STATE = demoState(); saveState(); render(); } },
  reset: () => { if (confirm("Wirklich ALLE Daten löschen?")) { STATE = defaultState(); saveState(); render(); } }
};

/* ---------------- Formulare ---------------- */
const FORM = {
  planZeitraum: fd => { UI.planVon = fd.get("von"); UI.planBis = fd.get("bis"); if (dayNum(UI.planBis) < dayNum(UI.planVon)) UI.planBis = UI.planVon; if (dayNum(UI.planBis) - dayNum(UI.planVon) > 800) UI.planBis = addDays(UI.planVon, 800); },
  person: fd => {
    const o = { name: fd.get("name"), rolle: fd.get("rolle"), mishmar: fd.get("mishmar") === "" ? "" : Number(fd.get("mishmar")), beitAv: Number(fd.get("beitAv")) || "", levRolle: fd.get("levRolle"), tuma: fd.get("tuma"), tumaSeit: fd.get("tumaSeit"), mum: !!fd.get("mum"), mumText: fd.get("mumText"), ketoret: !!fd.get("ketoret"), gesperrt: fd.get("gesperrt"), quali: fd.getAll("quali"), notiz: fd.get("notiz") };
    const id = fd.get("id");
    if (id) Object.assign(STATE.personal.find(p => p.id === id), o); else STATE.personal.push({ id: uid(), ...o });
    closeModal();
  },
  payis: fd => {
    const nr = Number(fd.get("nr")), py = DATA.payisot.find(p => p.nr === nr);
    let L = payisPool(); if (py.nurNeue) L = L.filter(p => !p.ketoret);
    if (!L.length) { alert("Keine geeigneten Kohanim im Kreis" + (py.nurNeue ? " (Payis 3: nur wer noch nie Ketoret dargebracht hat)." : ".")); return false; }
    const start = Math.max(1, Number(fd.get("start")) || 1) - 1;
    const zahl = Number(fd.get("zahl")) || (Math.floor(Math.random() * 900) + 60);
    const w = (start + zahl - 1) % L.length;
    const ergebnis = [];
    if (nr === 2) { for (let i = 0; i < 13; i++) ergebnis.push({ rolle: py.rollen[i], name: L[(w + i) % L.length].name }); if (L.length < 13) alert(`Nur ${L.length} Kohanim im Kreis – einzelne erhalten mehrere Aufgaben. Kreis erweitern!`); }
    else ergebnis.push({ rolle: py.de, name: L[w].name, id: L[w].id });
    if (nr === 3) { const k = STATE.personal.find(p => p.id === L[w].id); if (k) k.ketoret = true; }
    STATE.payisLog.push({ datum: todayISO(), zeit: new Date().toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }), nr, zahl, ergebnis });
  },
  lagerBuchung: fd => {
    const id = fd.get("id"), r = fd.get("r"), m = Number(fd.get("menge")); if (!m) return false;
    lagerBuchen(id, r === "zu" ? m : -m, fd.get("text") || (r === "zu" ? "Zugang" : "Abgang"), fd.get("datum"));
    if (r === "zu") {
      const p = Number(fd.get("preis")); if (p) STATE.lager[id].preis = p;
      if (fd.get("fonds") && p) STATE.buchungen.push({ id: uid(), datum: fd.get("datum"), fonds: fd.get("fonds"), art: "aus", betrag: Math.round(m * p * 100) / 100, text: `Kauf ${lagerName(id)} (${m})`, beleg: fd.get("text") });
    }
    closeModal();
  },
  tier: fd => { const o = Object.fromEntries(fd.entries()); const id = o.id; delete o.id; if (id) Object.assign(STATE.tiere.find(x => x.id === id), o); else STATE.tiere.push({ id: uid(), ...o }); closeModal(); },
  buchung: fd => { STATE.buchungen.push({ id: uid(), datum: fd.get("datum"), fonds: fd.get("fonds"), art: fd.get("art"), betrag: Number(fd.get("betrag")), text: fd.get("text"), beleg: fd.get("beleg") }); closeModal(); },
  umbuchung: fd => {
    const b = Number(fd.get("betrag")); if (!b || fd.get("von") === fd.get("nach")) return false;
    const bel = "U-" + uid().slice(-5);
    STATE.buchungen.push({ id: uid(), datum: fd.get("datum"), fonds: fd.get("von"), art: "aus", betrag: b, text: `${fd.get("text")} → ${fondsName(fd.get("nach"))}`, beleg: bel });
    STATE.buchungen.push({ id: uid(), datum: fd.get("datum"), fonds: fd.get("nach"), art: "ein", betrag: b, text: `${fd.get("text")} ← ${fondsName(fd.get("von"))}`, beleg: bel });
    closeModal();
  },
  trumah: fd => {
    const b = Number(fd.get("betrag")), saldo = fondsSaldo("sh1"); if (!b) return false;
    const d = todayISO(), bel = "TL-" + uid().slice(-5);
    STATE.buchungen.push({ id: uid(), datum: d, fonds: "sh1", art: "aus", betrag: b, text: "Terumat HaLishka", beleg: bel });
    STATE.buchungen.push({ id: uid(), datum: d, fonds: "terumat_halishka", art: "ein", betrag: b, text: "Terumat HaLishka aus Shofar 1", beleg: bel });
    const rest = saldo - b;
    if (fd.get("rest") && rest > 0) {
      STATE.buchungen.push({ id: uid(), datum: d, fonds: "sh1", art: "aus", betrag: rest, text: "Rest → Shiyarei HaLishka", beleg: bel });
      STATE.buchungen.push({ id: uid(), datum: d, fonds: "shiyarei", art: "ein", betrag: rest, text: "Shiyarei HaLishka", beleg: bel });
    }
  },
  shekel: fd => {
    const betrag = Number(fd.get("betrag")) || 0, kal = fd.get("kalbon") ? Math.round(betrag * Number(STATE.settings.kalbonProzent) / 100 * 100) / 100 : 0;
    const x = { id: uid(), name: fd.get("name"), ort: fd.get("ort"), datum: fd.get("datum"), jahr: Number(fd.get("jahr")), betrag, kalbon: kal };
    STATE.shekalim.push(x);
    const fonds = fd.get("atik") ? "sh2" : "sh1";
    STATE.buchungen.push({ id: uid(), datum: x.datum, fonds, art: "ein", betrag, text: `Machatzit HaShekel – ${x.name}`, beleg: "SH-" + x.id.slice(-5) });
    if (kal) STATE.buchungen.push({ id: uid(), datum: x.datum, fonds: "shiyarei", art: "ein", betrag: kal, text: `Kalbon – ${x.name}`, beleg: "SH-" + x.id.slice(-5) });
  },
  chotamVerkauf: fd => {
    const typ = fd.get("typ"), n = Math.max(1, Number(fd.get("anzahl")) || 1), preis = Number(STATE.settings.chotamPreis[typ]) || 0, t = todayISO();
    const seq0 = STATE.chotamot.filter(c => c.datum === t).length;
    for (let i = 0; i < n; i++) STATE.chotamot.push({ id: uid(), nr: `${t.replace(/-/g, "")}-${typ.slice(0, 2).toUpperCase()}-${seq0 + i + 1}`, datum: t, typ, kaeufer: fd.get("kaeufer"), betrag: preis, status: "offen" });
    if (preis) STATE.buchungen.push({ id: uid(), datum: t, fonds: "nesachim", art: "ein", betrag: preis * n, text: `Chotamot ${typ} × ${n} – ${fd.get("kaeufer") || ""}`, beleg: "CH", quelle: "chotam" });
    if (!preis) alert("Hinweis: Für diese Chotam-Art ist kein Preis hinterlegt (Einstellungen).");
  },
  privat: fd => { const o = Object.fromEntries(fd.entries()); const id = o.id; delete o.id; if (id) Object.assign(STATE.privat.find(x => x.id === id), o); else STATE.privat.push({ id: uid(), ...o }); closeModal(); },
  chabura: fd => { STATE.chaburot.push({ id: uid(), name: fd.get("name"), rosh: fd.get("rosh"), mitglieder: Number(fd.get("mitglieder")) || "", kat: Number(fd.get("kat")), tier: fd.get("tier"), sheni: !!fd.get("sheni") }); },
  ketZiel: fd => { UI.ketZiel = Number(fd.get("ziel")) || 368; return "nosave"; },
  ketCharge: fd => { STATE.ketoretChargen.push({ id: uid(), nr: "K-" + (STATE.ketoretChargen.length + 1), datum: fd.get("datum"), menge: Number(fd.get("menge")), memune: fd.get("memune"), status: "angesetzt" }); },
  settings: fd => {
    const s = STATE.settings;
    for (const k of ["institution", "modus", "shita", "refShabbat"]) s[k] = fd.get(k);
    for (const k of ["refMishmar", "bateiAv", "silberPreisG", "machatzitGramm", "kalbonProzent", "manehGramm", "holzProTag"]) s[k] = Number(fd.get(k));
    if (dateOf(s.refShabbat).getUTCDay() !== 6) { alert("Der Referenztag muss ein Schabbat sein – auf den nächsten Schabbat verschoben."); s.refShabbat = addDays(s.refShabbat, (6 - dateOf(s.refShabbat).getUTCDay() + 7) % 7); }
    for (const c of DATA.chotamot) s.chotamPreis[c.id] = Number(fd.get("cp_" + c.id)) || 0;
  }
};

/* ---------------- Ereignisse ---------------- */
document.addEventListener("click", e => {
  if (document.body.classList.contains("navopen") && !e.target.closest("#nav") && !e.target.closest("#navtoggle")) { document.body.classList.remove("navopen"); return; }
  const el = e.target.closest("[data-act]"); if (!el) return;
  const fn = ACT[el.dataset.act]; if (fn) { e.preventDefault(); fn(el, e); }
});
document.addEventListener("submit", e => {
  const f = e.target.closest("form[data-form]"); if (!f) return;
  e.preventDefault();
  const r = FORM[f.dataset.form](new FormData(f));
  if (r === false) return;
  if (r !== "nosave") saveState();
  render();
});
document.addEventListener("change", e => {
  const el = e.target;
  if (el.dataset.lagerfeld) { STATE.lager[el.dataset.id][el.dataset.lagerfeld] = Number(el.value) || 0; saveState(); render(); return; }
  const c = el.dataset.change; if (!c) return;
  if (c === "personalRolle") UI.personalRolle = el.value;
  else if (c === "payisPool") { UI.payisPool = el.value; UI.payisKreis = null; }
  else if (c === "checkListe") UI.checkListe = el.value;
  else if (c === "checkDatum") UI.checkDatum = el.value;
  else if (c === "privatStatus") { const x = STATE.privat.find(x => x.id === el.dataset.id); x.status = el.value; if (el.value === "dargebracht" && typeof onDargebracht === "function") onDargebracht(x); saveState(); }
  else if (c === "import") {
    const file = el.files[0]; if (!file) return;
    file.text().then(txt => { try { const o = JSON.parse(txt); if (!o.settings) throw new Error("Keine gültige Sicherung"); if (confirm("Sicherung importieren und aktuelle Daten ersetzen?")) { STATE = o; loadStateFix(); saveState(); render(); } } catch (err) { alert("Import fehlgeschlagen: " + err.message); } });
    return;
  }
  render();
});
document.addEventListener("input", e => {
  if (e.target.dataset.input === "personalFilter") {
    UI.personalFilter = e.target.value; const pos = e.target.selectionStart; render();
    const n = document.querySelector('[data-input="personalFilter"]'); if (n) { n.focus(); n.setSelectionRange(pos, pos); }
  }
});
function loadStateFix() {
  const d = defaultState();
  for (const k in d) if (STATE[k] === undefined) STATE[k] = d[k];
  for (const k in d.settings) if (STATE.settings[k] === undefined) STATE.settings[k] = d.settings[k];
  for (const a of DATA.lagerVorlage) if (!STATE.lager[a.id]) STATE.lager[a.id] = { bestand: 0, min: a.min, preis: 0 };
}

/* ---------------- Start ---------------- */
window.addEventListener("DOMContentLoaded", () => {
  loadState();
  if (!STATE.gespeichert && !STATE.personal.length) {
    if (confirm("Willkommen!\n\nSollen Demo-Daten geladen werden, um das Programm kennenzulernen?\n(OK = Demo · Abbrechen = leerer Start)")) STATE = demoState();
    saveState();
  }
  render();
  setInterval(renderHeader, 60000);
});
