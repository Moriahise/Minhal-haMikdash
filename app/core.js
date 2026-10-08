/* =====================================================================
   core.js – Kalender, Berechnungen, Datenhaltung
   ===================================================================== */
"use strict";

/* ---------------- Hilfsfunktionen ---------------- */
const DAY = 86400000;
const pad = n => String(n).padStart(2, "0");
const isoOf = d => `${d.getUTCFullYear()}-${pad(d.getUTCMonth() + 1)}-${pad(d.getUTCDate())}`;
const dateOf = iso => { const [y, m, d] = iso.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)); };
const todayISO = () => { const n = new Date(); return `${n.getFullYear()}-${pad(n.getMonth() + 1)}-${pad(n.getDate())}`; };
const addDays = (iso, n) => isoOf(new Date(dateOf(iso).getTime() + n * DAY));
const dayNum = iso => Math.round(dateOf(iso).getTime() / DAY);
const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
const esc = s => String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
const fmtNum = (n, d = 2) => (Math.round(n * 10 ** d) / 10 ** d).toLocaleString("de-AT", { maximumFractionDigits: d });
const fmtEUR = n => (Number(n) || 0).toLocaleString("de-AT", { style: "currency", currency: "EUR" });
const WOCHENTAGE = ["Sonntag", "Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Schabbat"];
const WT_HE = ["יום ראשון", "יום שני", "יום שלישי", "יום רביעי", "יום חמישי", "יום שישי", "שבת"];
const WT_KURZ = ["So", "Mo", "Di", "Mi", "Do", "Fr", "Sa"];
const fmtDate = iso => { const d = dateOf(iso); return `${WT_KURZ[d.getUTCDay()]}, ${pad(d.getUTCDate())}.${pad(d.getUTCMonth() + 1)}.${d.getUTCFullYear()}`; };

/* ---------------- Hebräischer Kalender (Intl, ca-hebrew) ---------------- */
const HEB_FMT = new Intl.DateTimeFormat("en-u-ca-hebrew", { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
const MONTH_HE = { Tishri: "תִּשְׁרֵי", Heshvan: "חֶשְׁוָן", Kislev: "כִּסְלֵו", Tevet: "טֵבֵת", Shevat: "שְׁבָט", "Adar I": "אֲדָר א׳", "Adar II": "אֲדָר ב׳", Adar: "אֲדָר", Nisan: "נִיסָן", Iyar: "אִיָּר", Sivan: "סִיוָן", Tamuz: "תַּמּוּז", Av: "אָב", Elul: "אֱלוּל" };
const MONTH_DE = { Tishri: "Tishrei", Heshvan: "Cheshvan", Kislev: "Kislev", Tevet: "Tevet", Shevat: "Shevat", "Adar I": "Adar I", "Adar II": "Adar II", Adar: "Adar", Nisan: "Nisan", Iyar: "Iyar", Sivan: "Sivan", Tamuz: "Tammuz", Av: "Av", Elul: "Elul" };
const _hebCache = new Map();

function heb(iso) {
  if (_hebCache.has(iso)) return _hebCache.get(iso);
  const parts = HEB_FMT.formatToParts(dateOf(iso));
  const o = {};
  for (const p of parts) o[p.type] = p.value;
  const r = { day: Number(o.day), month: o.month, year: Number(o.year || o.relatedYear) };
  r.isAdar = r.month === "Adar" || r.month === "Adar II";
  _hebCache.set(iso, r);
  return r;
}

function gematria(n) {
  const ones = ["", "א", "ב", "ג", "ד", "ה", "ו", "ז", "ח", "ט"];
  const tens = ["", "י", "כ", "ל", "מ", "נ", "ס", "ע", "פ", "צ"];
  const hund = ["", "ק", "ר", "ש", "ת", "תק", "תר", "תש", "תת", "תתק"];
  let s = hund[Math.floor(n / 100) % 10] + tens[Math.floor(n / 10) % 10] + ones[n % 10];
  s = s.replace("יה", "טו").replace("יו", "טז");
  return s.length > 1 ? s.slice(0, -1) + "״" + s.slice(-1) : s + "׳";
}
function hebDateString(iso) {
  const h = heb(iso);
  const y = h.year % 1000;
  return `${gematria(h.day)} ${MONTH_HE[h.month] || h.month} ${"ה׳" + gematria(y)}`;
}
function hebDateDe(iso) { const h = heb(iso); return `${h.day}. ${MONTH_DE[h.month] || h.month} ${h.year}`; }

/* Feiertagslogik für den Tempelbetrieb */
function festInfo(iso) {
  const h = heb(iso);
  const wd = dateOf(iso).getUTCDay();
  const f = { shabbat: wd === 6, roshChodesh: false, yomTov: false, regel: false, labels: [], code: [] };
  const L = (t, c) => { f.labels.push(t); if (c) f.code.push(c); };

  if (h.day === 30 || (h.day === 1 && h.month !== "Tishri")) { f.roshChodesh = true; L("Rosh Chodesh", "rc"); }
  if (h.month === "Tishri") {
    if (h.day === 1) { f.roshChodesh = true; f.yomTov = true; L("Rosh HaShana (Tag 1) + Rosh Chodesh", "rh"); }
    if (h.day === 2) { L("Rosh HaShana Tag 2 – Status nach Kiddush HaChodesh des Beit Din (Psak)", "rh2"); }
    if (h.day === 10) { f.yomTov = true; L("Yom HaKippurim", "yk"); }
    if (h.day >= 15 && h.day <= 21) { f.regel = true; f.yomTov = h.day === 15; L(`Sukkot Tag ${h.day - 14}${h.day === 21 ? " (Hoshana Rabba)" : ""}`, "sukkot"); }
    if (h.day === 22) { f.regel = true; f.yomTov = true; L("Shemini Atzeret", "sa"); }
  }
  if (h.month === "Nisan") {
    if (h.day === 14) L("Erev Pesach – Korban Pesach", "erevpesach");
    if (h.day >= 15 && h.day <= 21) { f.regel = true; f.yomTov = h.day === 15 || h.day === 21; L(`Pesach Tag ${h.day - 14}`, "pesach"); }
    if (h.day === 16) L("Korban HaOmer", "omer");
    if (h.day === 1) L("Neue Shekalim für Korbanot Tzibur; Pros HaPesach – Terumat HaLishka", "trumah");
  }
  if (h.month === "Iyar" && h.day === 14) L("Pesach Sheni", "pesachsheni");
  if (h.month === "Iyar" && h.day === 21) L("Pros Atzeret – Terumat HaLishka (ca.)", "trumah");
  if (h.month === "Sivan" && h.day === 6) { f.regel = true; f.yomTov = true; L("Shavuot (Atzeret) – Shtei HaLechem", "shavuot"); }
  if (h.month === "Elul" && h.day === 29) L("Pros HaChag – Terumat HaLishka (ca.)", "trumah");
  if (h.isAdar && h.day === 1) L("Ankündigung der Shekalim", "shekalim");
  if (h.isAdar && h.day === 15) L("Shulchanot in der Provinz (Shekalim)", "shekalim");
  if (h.isAdar && h.day === 25) L("Shulchanot im Mikdash (Shekalim)", "shekalim");
  for (let i = 0; i < 8; i++) { const x = heb(addDays(iso, -i)); if (x.month === "Kislev" && x.day === 25) { L(`Chanukka Tag ${i + 1} (Hallel; keine eigenen Korbanot)`, "chanukka"); break; } }
  if (h.isAdar && h.day === 14) L("Purim", "purim");
  if (h.isAdar && h.day === 15) L("Shushan Purim (Yerushalayim)", "purim");
  if (typeof festExtra === "function") festExtra(h, iso, L);

  // Omer-Zählung
  const om = omerTag(iso);
  if (om) L(`Sefirat HaOmer Tag ${om}`, "sefira");
  if (f.shabbat) L("Schabbat", "shabbat");
  return f;
}

function omerTag(iso) {
  // finde 16 Nisan rückwärts (max 50 Tage)
  for (let i = 0; i < 49; i++) {
    const d = addDays(iso, -i), h = heb(d);
    if (h.month === "Nisan" && h.day === 16) return i + 1;
  }
  return 0;
}

/* Shemita / Hakhel nach gängiger Zählung */
function shemitaInfo(hebYear) {
  const m = hebYear % 7;
  return { shemita: m === 0, hakhel: m === 1, jahrImZyklus: m === 0 ? 7 : m };
}

/* ---------------- Mishmarot ---------------- */
function mishmarFor(iso) {
  const s = STATE.settings;
  const ref = s.refShabbat, refIdx = Number(s.refMishmar) || 0;
  const diff = dayNum(iso) - dayNum(ref);
  const week = Math.floor(diff / 7);
  const idx = ((refIdx + week) % 24 + 24) % 24;
  const prev = (idx + 23) % 24;
  const wd = dateOf(iso).getUTCDay();
  const fi = festInfo(iso);
  const bateiAv = Number(s.bateiAv) || 6;
  return {
    idx, prev, wd,
    name: DATA.mishmarot[idx], tr: DATA.mishmarotTranslit[idx],
    prevName: DATA.mishmarot[prev], prevTr: DATA.mishmarotTranslit[prev],
    beitAv: wd === 6 ? null : (wd % bateiAv) + 1,
    regel: fi.regel,
    shabbatWechsel: wd === 6
  };
}

function haazinuTeil(iso) {
  const diff = dayNum(iso) - dayNum(STATE.settings.refShabbat);
  const w = Math.floor(diff / 7);
  return DATA.shirMusafShabbat.teile[((w % 6) + 6) % 6];
}

/* ---------------- Yom-Tov-Erkennung für Lechem HaPanim ---------------- */
function isYomTovOrYK(iso) {
  const f = festInfo(iso);
  return f.yomTov || f.code.includes("rh2");
}
function lechemBackTag(shabbatISO) {
  let d = addDays(shabbatISO, -1);
  while (isYomTovOrYK(d)) d = addDays(d, -1);
  return d;
}

/* ---------------- Tagesplan: Korbanot Tzibur ---------------- */
function emptyTotals() {
  return { keves: 0, ayil: 0, par: 0, seir: 0, solet: 0, shemen: 0, yayin: 0, ketoret: 0, levona: 0, wasser: 0, shemen_katit: 0, etzim: 0 };
}

// gruppe: {par,ayil,keves (olot), seir (chatat), shelamimKeves}
function addGroup(items, titel, g, mekor, opt = {}) {
  items.push({ titel, par: g.par || 0, ayil: g.ayil || 0, keves: g.keves || 0, seir: g.seir || 0, shelamimKeves: g.shelamimKeves || 0, mekor, ...opt });
}

function tagesplan(iso) {
  const f = festInfo(iso), h = heb(iso), items = [];
  const M = DATA.musaf;

  addGroup(items, "Tamid shel Shachar (עולה)", { keves: 1 }, DATA.daily.tamid.mekor);
  items.push({ titel: "Minchat Chavitin des Kohen Gadol", solet: 1, shemen: 3, mekor: DATA.daily.chavitin.mekor });
  items.push({ titel: "Ketoret (morgens ½ + abends ½)", ketoret: 1, mekor: DATA.daily.ketoret.mekor });
  items.push({ titel: "Hadlakat HaMenorah (7 × ½ Log)", shemen_katit: 3.5, mekor: DATA.daily.menorah.mekor });

  if (f.shabbat) addGroup(items, "Musaf Schabbat", M.shabbat, M.shabbat.mekor);
  if (f.roshChodesh) addGroup(items, "Musaf Rosh Chodesh", M.roshChodesh, M.roshChodesh.mekor);
  const c = f.code;
  if (c.includes("rh")) addGroup(items, "Musaf Rosh HaShana", M.roshHashana, M.roshHashana.mekor);
  if (c.includes("yk")) {
    addGroup(items, "Musaf Yom HaKippurim", M.yomKippur, M.yomKippur.mekor);
    addGroup(items, "Avodat HaYom: Par & Ayil des Kohen Gadol", { par: 0, ayil: 1, seir: 0 }, DATA.yomKippurAvoda.mekor, { parChatat: 1 });
    addGroup(items, "Avodat HaYom: Se'ir laShem + Ayil HaAm", { ayil: 1, seir: 1 }, DATA.yomKippurAvoda.mekor);
    items.push({ titel: "Se'ir laAzazel (nicht auf dem Altar)", seirAzazel: 1, mekor: "Vayikra 16:8–22; Yoma 6" });
    items.push({ titel: "Ketoret lifnai veLifnim (Melo Chofnav)", ketoret: 1, mekor: "Keritot 6a – aus den 3 Zusatz-Maneh (≈ 1 Maneh angesetzt)" });
  }
  if (c.includes("sukkot")) {
    const day = h.day - 15;
    addGroup(items, `Musaf Sukkot Tag ${day + 1} (${M.sukkot.par[day]} Parim)`, { par: M.sukkot.par[day], ayil: 2, keves: 14, seir: 1 }, M.sukkot.mekor);
    items.push({ titel: "Nisuch HaMayim (3 Log Wasser aus dem Shiloach)", wasser: 3, mekor: "Sukka 4:9; Sukka 48b" });
  }
  if (c.includes("sa")) addGroup(items, "Musaf Shemini Atzeret", M.sheminiAtzeret, M.sheminiAtzeret.mekor);
  if (c.includes("pesach")) addGroup(items, "Musaf Pesach", M.pesach, M.pesach.mekor);
  if (c.includes("omer")) {
    items.push({ titel: "Minchat HaOmer (1 Isaron Gerste, 1 Log Öl, Levona)", solet: 1, shemen: 1, levona: 1, mekor: "Vayikra 23:10–14; Menachot 10" });
    items.push({ titel: "Keves Olah des Omer – מנחתו כפולה", keves: 1, olahSpecial: { solet: 2, shemen: 3, yayin: 3 }, mekor: "Vayikra 23:12–13; Menachot 89b (Mincha doppelt, Nesachim nicht)" });
  }
  if (c.includes("shavuot")) {
    addGroup(items, "Musaf Shavuot", M.shavuot, M.shavuot.mekor);
    addGroup(items, "Korbanot der Shtei HaLechem", M.shteiHalechem, M.shteiHalechem.mekor);
    items.push({ titel: "Shtei HaLechem (2 × 1 Isaron Chametz)", solet: 2, mekor: "Vayikra 23:17; Menachot 11:1" });
  }
  // Lechem HaPanim
  if (f.shabbat) items.push({ titel: "Lechem HaPanim: Wechsel + Haktarat 2 Bezichei Levona", levona: 2, mekor: "Vayikra 24:5–9; Menachot 11:7" });
  const nextShabbat = addDays(iso, (6 - dateOf(iso).getUTCDay() + 7) % 7);
  if (lechemBackTag(nextShabbat) === iso) items.push({ titel: "Beit Garmo: Backen Lechem HaPanim (12 × 2 Isaron)", solet: 24, mekor: "Menachot 11:9; Vayikra 24:5" });

  if (c.includes("erevpesach")) items.push({ titel: "Korban Pesach – Shechita in 3 Kitot (Anzahl laut Chaburot-Register)", info: true, mekor: "Pesachim 5:5–7" });

  addGroup(items, "Tamid shel Bein HaArbayim (עולה)", { keves: 1 }, DATA.daily.tamid.mekor);
  items.push({ titel: "Etzei Ma'aracha (2 Gezirin je Tamid + Ma'arachot – Richtwert lt. Einstellungen)", etzim: Number(STATE.settings.holzProTag) || 3, mekor: "Yoma 26b; Yoma 4:6; Tamid 2:3" });

  // Summen
  const T = emptyTotals();
  const N = DATA.nesachim;
  for (const it of items) {
    if (it.olahSpecial) {
      T.keves += it.keves; T.solet += it.olahSpecial.solet; T.shemen += it.olahSpecial.shemen; T.yayin += it.olahSpecial.yayin;
    } else {
      const olKeves = (it.keves || 0) + (it.shelamimKeves || 0);
      T.keves += olKeves; T.ayil += it.ayil || 0; T.par += (it.par || 0) + (it.parChatat || 0); T.seir += (it.seir || 0) + (it.seirAzazel || 0);
      T.solet += olKeves * N.keves.solet_isaron + (it.ayil || 0) * N.ayil.solet_isaron + (it.par || 0) * N.par.solet_isaron;
      T.shemen += olKeves * N.keves.shemen_log + (it.ayil || 0) * N.ayil.shemen_log + (it.par || 0) * N.par.shemen_log;
      T.yayin += olKeves * N.keves.yayin_log + (it.ayil || 0) * N.ayil.yayin_log + (it.par || 0) * N.par.yayin_log;
    }
    T.solet += it.solet || 0; T.shemen += it.shemen || 0; T.ketoret += it.ketoret || 0;
    T.levona += it.levona || 0; T.wasser += it.wasser || 0; T.shemen_katit += it.shemen_katit || 0; T.etzim += it.etzim || 0;
  }
  const wd = dateOf(iso).getUTCDay();
  return {
    iso, heb: h, fest: f, items, totals: T,
    mishmar: mishmarFor(iso), shir: DATA.shirShelYom[wd],
    haazinu: f.shabbat ? haazinuTeil(iso) : null,
    chalil: c.some(x => ["erevpesach", "pesachsheni", "shavuot", "sukkot", "sa"].includes(x)) || (c.includes("pesach") && h.day === 15)
  };
}

function bereichsplan(fromISO, toISO) {
  const tage = [], T = emptyTotals();
  for (let d = fromISO; dayNum(d) <= dayNum(toISO); d = addDays(d, 1)) {
    const p = tagesplan(d); tage.push(p);
    for (const k in T) T[k] += p.totals[k];
    if (tage.length > 800) break;
  }
  return { tage, totals: T };
}

/* Mengen in Liter umrechnen (nach Shita) */
function liter(log) { const s = DATA.units.shitot[STATE.settings.shita] || DATA.units.shitot.naeh; return log * DATA.units.beitza_per_log * s.ml_beitza / 1000; }
function isaronLiter(is) { const s = DATA.units.shitot[STATE.settings.shita] || DATA.units.shitot.naeh; return is * DATA.units.beitza_per_isaron * s.ml_beitza / 1000; }

/* ---------------- Regalim / Bal Te'acher ---------------- */
function regalimAb(fromISO, anzahl = 6) {
  const out = [];
  for (let i = 1, d = addDays(fromISO, 1); i < 1200 && out.length < anzahl; i++, d = addDays(d, 1)) {
    const h = heb(d);
    if (h.month === "Nisan" && h.day === 15) out.push({ typ: "Pesach", start: d, ende: addDays(d, 6) });
    if (h.month === "Sivan" && h.day === 6) out.push({ typ: "Shavuot", start: d, ende: d });
    if (h.month === "Tishri" && h.day === 15) out.push({ typ: "Sukkot", start: d, ende: addDays(d, 7) });
  }
  return out;
}
function balTeacher(gelobtISO) {
  const r = regalimAb(gelobtISO, 8);
  const rabbanan = r[2] ? r[2].ende : null;
  // R. Shimon: drei Regalim in Reihenfolge Pesach → Shavuot → Sukkot
  let stufe = 0, rShimon = null; const ord = ["Pesach", "Shavuot", "Sukkot"];
  for (const x of r) { if (x.typ === ord[stufe]) { stufe++; if (stufe === 3) { rShimon = x.ende; break; } } }
  return { erster: r[0] || null, rabbanan, rShimon };
}

/* ---------------- Datenhaltung ---------------- */
const STORE_KEY = "bhm3_betrieb_v1";
let STATE = null;
let STORAGE_OK = true;

function defaultState() {
  const today = todayISO();
  const wd = dateOf(today).getUTCDay();
  const nextShabbat = addDays(today, (6 - wd + 7) % 7);
  const lager = {};
  for (const a of DATA.lagerVorlage) lager[a.id] = { bestand: 0, min: a.min, preis: 0 };
  return {
    version: 1,
    settings: {
      modus: "hachana", shita: "naeh", refShabbat: nextShabbat, refMishmar: 0, bateiAv: 6,
      silberPreisG: 0.9, kalbonProzent: 4.17, chotamPreis: { egel: 0, zachar: 0, gedi: 0, choteh: 0 },
      institution: "בֵּית הַמִּקְדָּשׁ הַשְּׁלִישִׁי", jahr: heb(today).year, holzProTag: 3
    },
    personal: [], tiere: [], lager, lagerJournal: [], buchungen: [], shekalim: [],
    chotamot: [], chotamAbschluss: [], privat: [], chaburot: [], ketoretChargen: [],
    payisLog: [], checklisten: {}, notizen: "",
    entsorgung: [], holz: [], textil: [], achila: [], bikkurim: [], wareneingang: [], hekdeshLog: [], taharaLog: [], wartung: [], matanot: [],
    maaser: [], wachRunde: [], oelPressung: [], leviDienst: {}, wachPlan: {}, leviInfo: {},
    haarschnitt: [], seife: [], reinigung: [], fahrten: [], unterkunft: [], reisen: [], yuchsin: [], archiv: [], klafCharge: [], dyoCharge: [],
    gerichte: [], dayanim: [], faelle: [], gesetze: [], sofrimReg: [], buecher: [], kiddushChodesh: [], sanhedrinSitz: {},
    kelimReg: [], kelimAusgabe: [], produktion: [], bauprojekte: [],
    werkzeugReg: [], schmiede: [], metallbuch: [], farbProd: [], malerei: []
  };
}

function demoState() {
  const s = defaultState();
  s.demo = true;
  { const t = todayISO(); s.settings.refShabbat = addDays(t, -((dateOf(t).getUTCDay() + 1) % 7)); } // Demo: aktuelle Woche = Referenz-Mishmar
  const vornamen = ["אהרן", "אלעזר", "פינחס", "צדוק", "אביתר", "יהוידע", "עזריה", "חלקיה", "שמעון", "יוחנן", "מתתיהו", "יהושע", "ישמעאל", "חנניה", "אליעזר", "זכריה", "שמואל", "יוסף"];
  const vaeter = ["יעקב", "יצחק", "משה", "דוד", "שלמה", "בנימין"];
  let k = 0;
  for (let m = 0; m < 3; m++) for (let b = 1; b <= 6; b++) for (let j = 0; j < 4; j++) {
    const n = `${vornamen[k % vornamen.length]} בן ${vaeter[(k * 7) % vaeter.length]} הכהן`;
    s.personal.push({
      id: uid(), name: n, rolle: "kohen", mishmar: (Number(s.settings.refMishmar) + m) % 24, beitAv: b,
      tuma: k % 17 === 5 ? "met" : "tahor", tumaSeit: todayISO(), mum: k % 23 === 11, mumText: k % 23 === 11 ? "Demo: Mum am Finger (Bechorot 7)" : "",
      ketoret: k % 3 === 0, quali: ["shechita", "zerika"].slice(0, (k % 3)), levRolle: "", notiz: "Demo-Eintrag"
    });
    k++;
  }
  const lev = ["meshorer", "kinor", "nevel", "chalil", "tziltzal", "shoer"];
  for (let i = 0; i < 16; i++) s.personal.push({ id: uid(), name: `לוי ${i + 1} (Demo)`, rolle: "levi", mishmar: Number(s.settings.refMishmar), beitAv: (i % 6) + 1, tuma: "tahor", tumaSeit: "", mum: false, mumText: "", ketoret: false, quali: [], levRolle: lev[i % lev.length], notiz: "" });
  s.personal.push({ id: uid(), name: "כהן גדול (Demo)", rolle: "kohen_gadol", mishmar: 0, beitAv: 1, tuma: "tahor", mum: false, ketoret: true, quali: [], levRolle: "", notiz: "" });
  const B = { keves: 14, ayil: 4, par: 6, seir: 3, kinim: 20, solet: 120, shemen: 150, shemen_katit: 60, yayin: 140, melach: 12, etzim: 80, levona: 20, ketoret: 180, pekia: 120, efer: 30, begged_ketonet: 60, begged_michnasayim: 60, begged_migbaat: 60, begged_avnet: 60, mayim: 400 };
  const P = { keves: 180, ayil: 320, par: 1400, seir: 160, kinim: 40, solet: 9, shemen: 12, shemen_katit: 25, yayin: 6, melach: 3, etzim: 15, levona: 30, ketoret: 0, pekia: 0.5, efer: 0, begged_ketonet: 220, begged_michnasayim: 90, begged_migbaat: 70, begged_avnet: 380, mayim: 2.5 };
  for (const id in s.lager) { s.lager[id].bestand = B[id] ?? 0; s.lager[id].preis = P[id] ?? 0; }
  for (let i = 0; i < 8; i++) s.tiere.push({ id: uid(), nr: `T-${100 + i}`, art: "keves", alter: "8 Monate", geprueft: addDays(todayISO(), -i), bestimmung: "tamid", status: "geprueft", pruefer: "Demo", notiz: "" });
  const t = todayISO();
  s.buchungen.push({ id: uid(), datum: t, fonds: "sh1", art: "ein", betrag: 25000, text: "Demo: Machatzit HaShekel Sammlung", beleg: "D-1" });
  s.buchungen.push({ id: uid(), datum: t, fonds: "terumat_halishka", art: "ein", betrag: 20000, text: "Demo: Terumat HaLishka", beleg: "D-2" });
  s.buchungen.push({ id: uid(), datum: t, fonds: "sh1", art: "aus", betrag: 20000, text: "Demo: Umbuchung → Terumat HaLishka", beleg: "D-2" });
  s.buchungen.push({ id: uid(), datum: t, fonds: "terumat_halishka", art: "aus", betrag: 4200, text: "Demo: Kauf Kevasim für Tamid", beleg: "D-3" });
  s.buchungen.push({ id: uid(), datum: t, fonds: "bedek", art: "ein", betrag: 7800, text: "Demo: Hekdesh Bedek HaBayit", beleg: "D-4" });
  s.privat.push({ id: uid(), bringer: "ראובן בן שמעון (Demo)", art: "shelamim", tier: "keves", anlass: "neder", gelobt: addDays(t, -30), status: "gelobt", chotam: "", notiz: "" });
  return s;
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    STATE = raw ? JSON.parse(raw) : null;
  } catch (e) { STORAGE_OK = false; STATE = null; }
  if (!STATE) STATE = defaultState();
  // Migration: fehlende Felder ergänzen
  const d = defaultState();
  for (const k in d) if (STATE[k] === undefined) STATE[k] = d[k];
  for (const k in d.settings) if (STATE.settings[k] === undefined) STATE.settings[k] = d.settings[k];
  for (const a of DATA.lagerVorlage) if (!STATE.lager[a.id]) STATE.lager[a.id] = { bestand: 0, min: a.min, preis: 0 };
}
function saveState() {
  STATE.gespeichert = new Date().toISOString();
  try { localStorage.setItem(STORE_KEY, JSON.stringify(STATE)); STORAGE_OK = true; }
  catch (e) { STORAGE_OK = false; }
  if (typeof onSaved === "function") onSaved();
}

/* ---------------- Fonds-Saldo ---------------- */
function fondsSaldo(id) {
  let s = 0;
  for (const b of STATE.buchungen) if (b.fonds === id) s += b.art === "ein" ? Number(b.betrag) : -Number(b.betrag);
  return s;
}

/* ---------------- Personal-Dienstfähigkeit ---------------- */
function tumaEnde(p) {
  const t = DATA.tumaTypen.find(x => x.id === p.tuma);
  if (!t || t.id === "tahor" || !p.tumaSeit) return null;
  return addDays(p.tumaSeit, t.tage);
}
function dienstfaehig(p, iso = todayISO()) {
  const gruende = [];
  if (p.mum) gruende.push("Ba'al Mum");
  if (p.tuma && p.tuma !== "tahor") {
    const e = tumaEnde(p);
    if (!e || dayNum(iso) < dayNum(e)) gruende.push("Tamei" + (e ? ` (bis ${fmtDate(e)}, nach Tevila & Ha'arev Shemesh)` : ""));
  }
  if (p.gesperrt) gruende.push(p.gesperrt);
  return { ok: gruende.length === 0, gruende };
}

if (typeof module !== "undefined") module.exports = { heb, festInfo, tagesplan, bereichsplan, balTeacher, gematria, hebDateString, addDays, setState: s => STATE = s, defaultState, mishmarFor };
