/* =====================================================================
   module5.js – Beit Din & Sanhedrin · Gerichte an den Toren ·
                Dayanim · Fälle & Instanzenweg · Kiddush HaChodesh ·
                Gesetze & Takanot · Sofrim & Shtarot · Bibliothek
   ===================================================================== */
"use strict";

/* ---------------- Daten ---------------- */
DATA.beitdin = {
  stufen: [
    { id: "kfar", de: "Beit Din im Dorf / kleinen Ort", groesse: 3, ort: "Am Tor des Ortes", mekor: "Devarim 16:18; Rut 4:1–2; Rambam Sanhedrin 1:4" },
    { id: "ir", de: "Sanhedrin Ketana einer Stadt (ab 120 Männern)", groesse: 23, ort: "Am Stadttor", mekor: "Sanhedrin 1:6; Rambam Sanhedrin 1:3" },
    { id: "shaar_harhabayit", de: "Beit Din am Tor des Har HaBayit", groesse: 23, ort: "Yerushalayim – Petach Har HaBayit", mekor: "Sanhedrin 11:2; Tosefta Sanhedrin 7:1" },
    { id: "shaar_haazara", de: "Beit Din am Tor der Azara", groesse: 23, ort: "Yerushalayim – Petach HaAzara", mekor: "Sanhedrin 11:2; Tosefta Sanhedrin 7:1" },
    { id: "gazit", de: "Sanhedrin Gedola – Lishkat HaGazit", groesse: 71, ort: "Lishkat HaGazit (halb im Kodesh, halb im Chol)", mekor: "Sanhedrin 11:2; Middot 5:4; Yoma 25a" }
  ],
  sonder: [
    { id: "kohanim", de: "Beit Din shel Kohanim", groesse: 3, mekor: "Ketubot 1:5; Rosh HaShana 1:7" },
    { id: "beit_midrash", de: "Sanhedrin an Schabbat/Yom Tov: Beit Midrash am Chel", groesse: 71, mekor: "Sanhedrin 88b" }
  ],
  // Zuständigkeiten (Sanhedrin Kap. 1)
  sachen: [
    { id: "mamonot", de: "Dinei Mamonot (Geldsachen)", g: 3, mekor: "Sanhedrin 1:1" },
    { id: "gezelot", de: "Gezelot & Chavalot (Raub, Körperverletzung)", g: 3, mekor: "Sanhedrin 1:1" },
    { id: "kenasot", de: "Kenasot (Bußen: Kefel, Nezek Shalem, Chatzi Nezek) – nur Mumchim mit Semicha", g: 3, semicha: true, mekor: "Sanhedrin 1:1; Bava Kama 84b" },
    { id: "motzi_shem_ra", de: "Motzi Shem Ra (Machloket 3 / 23)", g: 23, mekor: "Sanhedrin 1:1" },
    { id: "malkot", de: "Malkot (R. Yishmael: 23)", g: 3, mekor: "Sanhedrin 1:2" },
    { id: "ibbur", de: "Ibbur HaShana / Kiddush HaChodesh", g: 3, semicha: true, mekor: "Sanhedrin 1:2; Rosh HaShana 25b" },
    { id: "semicha", de: "Semichat Zekenim", g: 3, semicha: true, mekor: "Sanhedrin 1:3; 13b" },
    { id: "egla", de: "Eglah Arufa (Messung: R. Yehuda 5, aus der Gedola)", g: 3, mekor: "Sanhedrin 1:3; Sota 9:1" },
    { id: "chalitza", de: "Chalitza & Mi'un", g: 3, mekor: "Sanhedrin 1:3" },
    { id: "arachin_m", de: "Arachin / Hekdesh – bewegliche Güter schätzen", g: 3, mekor: "Sanhedrin 1:3" },
    { id: "arachin_k", de: "Hekdesh – Grundstücke schätzen (9 + Kohen)", g: 10, mekor: "Sanhedrin 1:3" },
    { id: "nefashot", de: "Dinei Nefashot", g: 23, semicha: true, mekor: "Sanhedrin 1:4" },
    { id: "ir_nidachat", de: "Ir HaNidachat, Shevet, Navi Sheker, Kohen Gadol", g: 71, mekor: "Sanhedrin 1:5" },
    { id: "milchama", de: "Milchemet Reshut", g: 71, mekor: "Sanhedrin 1:5" },
    { id: "hosafa", de: "Erweiterung Yerushalayims oder der Azarot", g: 71, mekor: "Sanhedrin 1:5; Shevuot 2:2" },
    { id: "sanhedrei", de: "Einsetzung der Sanhedrei Ketanot", g: 71, mekor: "Sanhedrin 1:5" },
    { id: "sota", de: "Sota (Hashka'a im Mikdash)", g: 71, mekor: "Sota 1:4" },
    { id: "yuchsin", de: "Yuchsin der Kohanim", g: 71, mekor: "Middot 5:4" },
    { id: "zaken_mamre", de: "Zaken Mamre / Halachische Streitfrage", g: 71, mekor: "Devarim 17:8–11; Sanhedrin 11:2" }
  ],
  verfahren: [
    "Gerichtstage in den Orten: Montag und Donnerstag (Ketubot 1:1; Bava Kama 82a).",
    "Dinei Mamonot: Beginn bei Tag, Abschluss auch nachts; Freispruch und Verurteilung am selben Tag (Sanhedrin 4:1).",
    "Dinei Nefashot: Beginn bei Tag und Abschluss bei Tag; Freispruch am selben Tag, Verurteilung erst am Folgetag – daher nicht am Erev Shabbat oder Erev Yom Tov (Sanhedrin 4:1).",
    "Dinei Nefashot: zuerst Argumente zugunsten; der Jüngste spricht zuerst; Mehrheit von 1 zum Freispruch, von 2 zur Verurteilung (Sanhedrin 4:1–2).",
    "Zwei Zeugen erforderlich; Drisha veChakira (Devarim 19:15; Sanhedrin 5:1–2).",
    "Verwandte und Pesulim (Würfelspieler, Zinsnehmer, Taubenwetter, Händler mit Shevi'it-Früchten) sind als Richter und Zeugen untauglich (Sanhedrin 3:3–4).",
    "Dinei Nefashot nur von Kohanim, Levi'im und Yisraelim, deren Töchter Kohanim heiraten dürfen (Sanhedrin 4:2).",
    "Die Sanhedrin Gedola sitzt vom Tamid shel Shachar bis zum Tamid shel Bein HaArbayim; an Schabbat und Yom Tov im Beit Midrash am Chel (Sanhedrin 88b).",
    "Ein Beit Din kann den Beschluss eines anderen nur aufheben, wenn es größer an Weisheit und Zahl ist (Eduyot 1:5).",
    "Eine Gezeira nur, wenn die Mehrheit sie tragen kann (Avoda Zara 36a; Horayot 3b).",
    "Richter in Geldsachen (Dayanei Gezelot in Yerushalayim) erhalten 99 Maneh aus Terumat HaLishka (Ketubot 105a)."
  ],
  instanzen: "Wer eine halachische Frage hat, geht zum Beit Din seiner Stadt; dann zum Beit Din am Tor des Har HaBayit; dann zum Beit Din am Tor der Azara; dann zur Lishkat HaGazit, von wo die Torah für ganz Israel ausgeht (Sanhedrin 11:2).",
  sanhedrin: [
    "Sitzordnung im Halbkreis, damit alle einander sehen (Sanhedrin 4:3).",
    "Der Nasi sitzt in der Mitte, die Zekenim zu beiden Seiten (Tosefta Sanhedrin 8:1); Nasi und Av Beit Din (Chagiga 2:2); Mufla (Horayot 4b).",
    "Zwei Sofrei HaDayanim stehen vor ihnen, einer schreibt die Argumente für, einer die gegen (R. Yehuda: drei) – Sanhedrin 4:3.",
    "Drei Reihen von Talmidei Chachamim sitzen davor; Nachrücken aus der ersten Reihe bei Bedarf (Sanhedrin 4:4).",
    "Anforderungen: Weisheit, Kenntnis vieler Sprachen, nicht hochbetagt, nicht kinderlos (Sanhedrin 17a; 36b; Rambam Sanhedrin 2:1–3).",
    "40 Jahre vor der Zerstörung ging die Sanhedrin aus der Lishkat HaGazit in die Chanuyot (Sanhedrin 41a; Avoda Zara 8b; Rosh HaShana 31a)."
  ],
  middot: ["Chochma (Weisheit)", "Anava (Demut)", "Yir'at Shamayim", "Sone Mamon (hasst Bestechung/Geld)", "Ohev Emet (liebt die Wahrheit)", "Ahuv laBriyot (bei den Menschen beliebt)", "Shem Tov (guter Ruf)"],
  middotMekor: "Rambam Sanhedrin 2:7 (Devarim 1:13; Shemot 18:21)",
  semicha: [
    "Semicha durch 3, von denen einer selbst Samuch ist, nur in Eretz Yisrael (Sanhedrin 13b–14a; Rambam Sanhedrin 4:1–6).",
    "Die Kette der Semicha brach in der Zeit nach Abaye und Rava ab (vgl. Rambam Sanhedrin 4:11).",
    "Rambam Sanhedrin 4:11: Einigen sich alle Chachmei Eretz Yisrael auf einen, so ist er Samuch und kann weiter ordinieren – 'הדבר צריך הכרע'.",
    "1538: Erneuerungsversuch durch R. Yaakov Berav in Tzfat; Widerspruch des R. Levi ibn Chaviv (Kuntres HaSemicha)."
  ],
  shotrim: [
    "'שופטים ושוטרים תתן לך בכל שעריך' – Richter und Ordnungshüter in jedem Tor (Devarim 16:18).",
    "Shotrim aus den Levi'im (Divrei HaYamim II 19:11) – Verknüpfung mit Modul Levi'im.",
    "In Eretz Yisrael in jeder Stadt, in Chutz LaAretz je Bezirk (Makkot 7a; Rambam Sanhedrin 1:2)."
  ],
  kiddush: [
    "Zeugen des Neumonds kommen nach Yerushalayim; Hof Beit Ya'azek mit Bewirtung (Rosh HaShana 2:5).",
    "Befragung durch das Beit Din; das erste Zeugenpaar wird zuerst geprüft (Rosh HaShana 2:6).",
    "Rosh Beit Din spricht 'מקודש', das Volk antwortet 'מקודש מקודש' (Rosh HaShana 2:7).",
    "Kein Zeugnis am 30. Tag → Rosh Chodesh am 31. (Me'ubar) automatisch (Rosh HaShana 2:7; Sanhedrin 10b).",
    "Für Nisan und Tishrei dürfen Zeugen den Schabbat verletzen (Rosh HaShana 1:4).",
    "Shluchim gehen in 6 Monaten aus (Rosh HaShana 1:3) – Modul Logistik."
  ]
};

DATA.sofrim = {
  arten: [
    { id: "sofer_dayanim", de: "Sofer HaDayanim (Protokoll Zechut/Chova)", mekor: "Sanhedrin 4:3" },
    { id: "lavlar", de: "Lavlar / Sofer Shtarot", mekor: "Gittin 87b; Bava Batra 10:3" },
    { id: "sofer_stam", de: "Sofer Stam (Sefer Torah, Tefillin, Mezuzot)", mekor: "Menachot 29b–30a; Rambam Tefillin 1" },
    { id: "magiha", de: "Magiha Sfarim (aus Terumat HaLishka bezahlt)", mekor: "Ketubot 106a" },
    { id: "sofer_mikdash", de: "Sofer HaMikdash (Megillat Sota, Register)", mekor: "Sota 2:3–4" }
  ],
  shtarot: [
    { de: "Ma'ase Beit Din / Psak Din", mekor: "Bava Batra 10:3" },
    { de: "Prozbul (vor Ende der Shemita)", mekor: "Shevi'it 10:3–4; Gittin 36a" },
    { de: "Shtar Berurin (Wahl der Richter – Zabla)", mekor: "Sanhedrin 3:1; Bava Batra 10:3" },
    { de: "Get", mekor: "Gittin 2:3; 9:3" },
    { de: "Ketuba", mekor: "Ketubot 4:7–12" },
    { de: "Shtar Chov / Mattana / Mecher", mekor: "Bava Batra 10:1–4" },
    { de: "Ishur / Kiyum Shtarot (Bestätigung)", mekor: "Ketubot 21a" },
    { de: "Shtar Nidui / Hazmana (Vorladung)", mekor: "Bava Kama 112b" },
    { de: "Megillat Yuchsin", mekor: "Yevamot 4:13; 49b" }
  ]
};

DATA.bibliothek = {
  arten: ["Sefer Torah", "Sefer HaAzara (Maßstab-Rolle)", "Sefer Torah des Königs", "Nevi'im", "Ketuvim", "Megilla", "Pinkas / Protokolle", "Takanot-Sammlung", "Psakim-Sammlung", "Mishna / Talmud / Poskim (Studium)", "Shtarot-Archiv", "Sonstiges"],
  regeln: [
    "Sefer HaAzara ist die Referenz, nach der andere Sfarim korrigiert werden (Kelim 15:6; Mo'ed Katan 18b).",
    "Drei in der Azara gefundene Sfarim mit Abweichungen – entschieden nach der Mehrheit (Yerushalmi Ta'anit 4:2; Massechet Sofrim 6:4).",
    "Der König schreibt zwei Sifrei Torah; sie werden nach dem Sefer HaAzara durch das Beit Din der 71 korrigiert (Sanhedrin 2:4; Tosefta Sanhedrin 4:7 – prüfen).",
    "Magihei Sfarim in Yerushalayim werden aus Terumat HaLishka bezahlt (Ketubot 106a).",
    "Ein Sefer mit mehr als 3 Fehlern pro Spalte wird nicht korrigiert, sondern in die Genizah gegeben (Menachot 29b).",
    "Torah She'be'al Peh war ursprünglich nicht schriftlich (Gittin 60b); Niederschrift erlaubt wegen 'עת לעשות' (Temura 14b; Gittin 60a).",
    "Pasul gewordene Sfarim → Genizah (Megilla 26b); Verkauf eines Sefer Torah nur für Torah-Studium oder Heirat (Megilla 27a).",
    "Jeder ist verpflichtet, einen Sefer Torah zu schreiben (Sanhedrin 21b; Rambam Sefer Torah 7:1)."
  ],
  orte: ["Lishkat HaGazit", "Azara (Sefer HaAzara)", "Beit Midrash am Chel", "Beit Din am Tor des Har HaBayit", "Beit Din am Tor der Azara", "Stadt-Beit-Din", "Lishkat HaShekalim", "Genizah"]
};

/* ---------------- Navigation ---------------- */
NAV.splice(NAV.findIndex(n => n.id === "sedarim"), 0,
  { id: "beitdin", de: "Beit Din & Sanhedrin", he: "בתי דינים", ico: "⚖" },
  { id: "bibliothek", de: "Bibliothek & Sofrim", he: "ספרייה וסופרים", ico: "▥" }
);
// Symbol-Doppel vermeiden
NAV.find(n => n.id === "hekdesh").ico = "⛁";

/* ---------------- Hilfen ---------------- */
const STATE_DEFAULTS_5 = { gerichte: [], dayanim: [], faelle: [], gesetze: [], sofrimReg: [], buecher: [], kiddushChodesh: [], sanhedrinSitz: {} };
function ensure5() { for (const [k, v] of Object.entries(STATE_DEFAULTS_5)) if (STATE[k] === undefined) STATE[k] = JSON.parse(JSON.stringify(v)); }
const _render5 = render;
render = () => { ensure5(); _render5(); };
const stufeName = id => (DATA.beitdin.stufen.find(s => s.id === id) || DATA.beitdin.sonder.find(s => s.id === id) || {}).de || id;
const sacheInfo = id => DATA.beitdin.sachen.find(s => s.id === id) || {};
const gerichtName = id => (STATE.gerichte.find(g => g.id === id) || {}).name || "—";
const dayanName = id => (STATE.dayanim.find(d => d.id === id) || {}).name || "";
const INSTANZ = ["kfar_ir", "shaar_harhabayit", "shaar_haazara", "gazit"];
const INSTANZ_DE = { kfar_ir: "Beit Din der Stadt / des Ortes", shaar_harhabayit: "Beit Din am Tor des Har HaBayit", shaar_haazara: "Beit Din am Tor der Azara", gazit: "Sanhedrin Gedola – Lishkat HaGazit" };

/* ---------------- Register ---------------- */
REG.gerichte = {
  titel: "Beit Din",
  felder: [
    { n: "name", l: "Bezeichnung", req: true },
    { n: "stufe", l: "Stufe", t: "select", opts: () => [...DATA.beitdin.stufen, ...DATA.beitdin.sonder].map(s => [s.id, `${s.de} (${s.groesse})`]) },
    { n: "ort", l: "Ort / Tor" },
    { n: "einwohner", l: "Männer im Ort (für Sanhedrin Ketana ≥ 120)", t: "number" },
    { n: "tage", l: "Sitzungstage", t: "multi", opts: () => WOCHENTAGE.map((w, i) => [String(i), w]), def: ["1", "4"] },
    { n: "shotrim", l: "Shotrim (Anzahl)", t: "number" },
    { n: "notiz", l: "Notiz" }
  ],
  spalten: [["Name", x => `<b>${esc(x.name)}</b>`], ["Stufe", x => esc(stufeName(x.stufe))], ["Ort", x => esc(x.ort)], ["Soll", x => sollGroesse(x)], ["Besetzt", x => { const n = STATE.dayanim.filter(d => d.gericht === x.id).length, s = sollGroesse(x); return `<span class="${n >= s ? "ok" : "bad"}">${n} / ${s}</span>`; }], ["Tage", x => (x.tage || []).map(t => WT_KURZ[t]).join(", ")], ["Shotrim", x => esc(x.shotrim || "")]],
  onSave: x => { if (x.stufe === "ir" && x.einwohner && x.einwohner < 120 && !confirm("Unter 120 Männern: keine Sanhedrin Ketana, nur Beit Din von 3 (Sanhedrin 1:6). Trotzdem speichern?")) return false; }
};
function sollGroesse(g) { const s = DATA.beitdin.stufen.find(s => s.id === g.stufe) || DATA.beitdin.sonder.find(s => s.id === g.stufe); return s ? s.groesse : 3; }

REG.dayanim = {
  titel: "Dayan",
  felder: [
    { n: "name", l: "Name", req: true },
    { n: "gericht", l: "Beit Din", t: "select", opts: () => [["", "— nicht zugeordnet —"], ...STATE.gerichte.map(g => [g.id, g.name])] },
    { n: "funktion", l: "Funktion", t: "select", opts: [["dayan", "Dayan"], ["nasi", "Nasi"], ["av", "Av Beit Din"], ["mufla", "Mufla"], ["talmid", "Talmid (Reihe vor der Sanhedrin)"]] },
    { n: "yichus", l: "Abstammung", t: "select", opts: [["kohen", "Kohen"], ["levi", "Levi"], ["yisrael", "Yisrael meyuchas"], ["ger", "Ger (nur Dinei Mamonot)"], ["unbekannt", "nicht geklärt"]] },
    { n: "semicha", l: "Hat Semicha", t: "check" },
    { n: "somech", l: "Semicha von" },
    { n: "middot", l: "Middot (Rambam Sanhedrin 2:7)", t: "multi", opts: () => DATA.beitdin.middot.map(m => [m, m]) },
    { n: "sprachen", l: "Sprachen" },
    { n: "geburt", l: "Geburtsjahr", t: "number" },
    { n: "kinder", l: "Hat Kinder (für Sanhedrin)", t: "check" },
    { n: "pasul", l: "Pesul (Sanhedrin 3:3) / Verwandtschaftskonflikt", t: "textarea" }
  ],
  spalten: [["Name", x => `<span dir="auto"><b>${esc(x.name)}</b></span>`], ["Beit Din", x => esc(gerichtName(x.gericht))], ["Funktion", x => esc(x.funktion)], ["Semicha", x => x.semicha ? "✓" : "—"], ["Middot", x => `${(x.middot || []).length}/7`], ["Eignung", x => eignung(x).map(e => `<span class="${e.ok ? "ok" : "bad"}">${e.t}</span>`).join(" · ")]]
};
function eignung(d) {
  const r = [];
  r.push({ ok: !d.pasul, t: d.pasul ? "Pesul" : "kein Pesul" });
  r.push({ ok: ["kohen", "levi", "yisrael"].includes(d.yichus), t: ["kohen", "levi", "yisrael"].includes(d.yichus) ? "Nefashot ✓" : "nur Mamonot" });
  r.push({ ok: !!d.semicha, t: d.semicha ? "Kenasot ✓" : "keine Kenasot" });
  const alt = d.geburt ? new Date().getFullYear() - d.geburt : null;
  const g = STATE.gerichte.find(x => x.id === d.gericht);
  if (g && (g.stufe === "gazit" || g.stufe === "ir" || g.stufe.startsWith("shaar"))) r.push({ ok: !!d.kinder && (alt == null || alt < 80), t: d.kinder ? (alt != null && alt >= 80 ? "hochbetagt?" : "Sanhedrin ✓") : "kinderlos – Sanhedrin 36b" });
  return r;
}

REG.faelle = {
  titel: "Fall / Verfahren",
  felder: [
    { n: "datum", l: "Eingang", t: "date", def: todayISO },
    { n: "titel", l: "Kurzbezeichnung", req: true },
    { n: "sache", l: "Sachgebiet", t: "select", opts: () => DATA.beitdin.sachen.map(s => [s.id, `${s.de} – ${s.g}`]) },
    { n: "gericht", l: "Zuständiges Beit Din", t: "select", opts: () => [["", "—"], ...STATE.gerichte.map(g => [g.id, `${g.name} (${sollGroesse(g)})`])] },
    { n: "instanz", l: "Instanz", t: "select", opts: () => INSTANZ.map(i => [i, INSTANZ_DE[i]]) },
    { n: "parteien", l: "Parteien", t: "textarea" },
    { n: "zeugen", l: "Anzahl Zeugen", t: "number", def: 2 },
    { n: "verhandlung", l: "Verhandlungstag", t: "date" },
    { n: "urteil", l: "Urteil", t: "select", opts: [["offen", "offen"], ["zechut", "Zechut (Freispruch / zugunsten)"], ["chova", "Chova (Verurteilung / Leistung)"], ["pshara", "Pshara (Vergleich)"], ["weiter", "an höhere Instanz"]] },
    { n: "urteilsdatum", l: "Urteilsdatum", t: "date" },
    { n: "stimmen", l: "Stimmen (für / gegen)" },
    { n: "begruendung", l: "Begründung / Protokoll", t: "textarea" }
  ],
  hinweis: "Pshara nur vor dem Psak (Sanhedrin 6b). Instanzenweg: Sanhedrin 11:2.",
  spalten: [["Eingang", x => fmtDate(x.datum)], ["Fall", x => `<b>${esc(x.titel)}</b>`], ["Sache", x => `${esc(sacheInfo(x.sache).de || "")} ${mekor(sacheInfo(x.sache).mekor)}`], ["Beit Din", x => esc(gerichtName(x.gericht))], ["Instanz", x => esc(INSTANZ_DE[x.instanz] || "")], ["Urteil", x => esc(x.urteil)], ["Prüfung", x => fallPruefung(x).map(p => `<div class="bad small">${esc(p)}</div>`).join("") || `<span class="ok">✓</span>`]],
  rowClass: x => fallPruefung(x).length ? "bad" : "",
  onSave: x => {
    const w = fallPruefung(x);
    if (w.length && !confirm("Verfahrensprüfung:\n• " + w.join("\n• ") + "\n\nTrotzdem speichern?")) return false;
    x.verlauf = x.verlauf || [];
  }
};
function fallPruefung(x) {
  const s = sacheInfo(x.sache), g = STATE.gerichte.find(y => y.id === x.gericht), w = [];
  if (!g) w.push("Kein Beit Din zugeordnet");
  else {
    if (sollGroesse(g) < s.g) w.push(`Sache erfordert ${s.g} Richter – Beit Din hat ${sollGroesse(g)} (${s.mekor})`);
    if (s.g === 71 && g.stufe !== "gazit" && g.stufe !== "beit_midrash") w.push("Nur die Sanhedrin Gedola (Sanhedrin 1:5)");
    const mitglieder = STATE.dayanim.filter(d => d.gericht === g.id);
    if (s.semicha && mitglieder.length && mitglieder.some(d => !d.semicha)) w.push("Erfordert Semuchim (Bava Kama 84b) – nicht alle Dayanim haben Semicha");
    if (x.sache === "nefashot" && mitglieder.some(d => !["kohen", "levi", "yisrael"].includes(d.yichus))) w.push("Dinei Nefashot: Abstammung aller Richter klären (Sanhedrin 4:2)");
  }
  if (["nefashot", "gezelot", "malkot"].includes(x.sache) && Number(x.zeugen) < 2) w.push("Mindestens 2 Zeugen (Devarim 19:15)");
  if (x.verhandlung) {
    const f = festInfo(x.verhandlung), wd = dateOf(x.verhandlung).getUTCDay();
    if (wd === 6 || f.yomTov) w.push("Kein Gericht an Schabbat/Yom Tov (Beitza 5:2)");
    const morgen = festInfo(addDays(x.verhandlung, 1));
    if (x.sache === "nefashot" && (wd === 5 || morgen.yomTov)) w.push("Dinei Nefashot nicht am Erev Shabbat/Yom Tov (Sanhedrin 4:1)");
  }
  if (x.sache === "nefashot" && x.urteil === "chova" && x.verhandlung && x.urteilsdatum && x.verhandlung === x.urteilsdatum) w.push("Verurteilung in Dinei Nefashot erst am Folgetag (Sanhedrin 4:1)");
  return w;
}

REG.kiddushChodesh = {
  titel: "Zeugen des Neumonds",
  felder: [
    { n: "datum", l: "Tag der Aussage", t: "date", def: todayISO },
    { n: "monat", l: "Für Monat" },
    { n: "zeuge1", l: "Zeuge 1", req: true },
    { n: "zeuge2", l: "Zeuge 2", req: true },
    { n: "beobachtung", l: "Beobachtung (Richtung, Höhe, Breite der Sichel)", t: "textarea" },
    { n: "ergebnis", l: "Beschluss", t: "select", opts: [["offen", "offen"], ["mekudash", "מְקֻדָּשׁ – angenommen"], ["abgelehnt", "abgelehnt"]] },
    { n: "rosh", l: "Rosh Beit Din" }
  ],
  hinweis: "Rosh HaShana 2:5–7. Ohne Zeugnis am 30. Tag: Rosh Chodesh am 31.",
  spalten: [["Datum", x => `${fmtDate(x.datum)}<br><span dir="rtl" class="he">${hebDateString(x.datum)}</span>`], ["Monat", x => esc(x.monat)], ["Zeugen", x => `<span dir="auto">${esc(x.zeuge1)} · ${esc(x.zeuge2)}</span>`], ["Beschluss", x => x.ergebnis === "mekudash" ? `<b class="ok">מְקֻדָּשׁ</b>` : esc(x.ergebnis)], ["Hinweis", x => { const d = heb(x.datum).day; return d === 30 ? "30. Tag – Chodesh Chaser möglich" : d === 29 ? "29. Tag – zu früh, Zeugen am 30. erwartet" : ""; }]]
};

REG.gesetze = {
  titel: "Gesetz / Takana / Psak",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "art", l: "Art", t: "select", opts: [["torah", "Din Torah (Erklärung)"], ["takana", "Takana"], ["gezeira", "Gezeira"], ["minhag", "Minhag"], ["psak", "Psak Halacha"], ["horaa", "Hora'at Sha'a"]] },
    { n: "titel", l: "Titel", req: true },
    { n: "text", l: "Wortlaut", t: "textarea" },
    { n: "gericht", l: "Erlassen von", t: "select", opts: () => [["", "—"], ...STATE.gerichte.map(g => [g.id, g.name])] },
    { n: "grundlage", l: "Grundlage / Mekor" },
    { n: "geltung", l: "Geltungsbereich", t: "select", opts: [["national", "ganz Israel"], ["lokal", "lokal"], ["mikdash", "nur Mikdash"]] },
    { n: "rov", l: "Mehrheit des Volkes kann sie tragen (geprüft)", t: "check" },
    { n: "status", l: "Status", t: "select", opts: [["gueltig", "gültig"], ["aufgehoben", "aufgehoben"], ["entwurf", "Entwurf"]] },
    { n: "aufhebung", l: "Aufgehoben durch / Begründung" }
  ],
  hinweis: "Aufhebung nur durch ein Beit Din größer an Weisheit und Zahl (Eduyot 1:5). Gezeira: nur wenn tragbar (Avoda Zara 36a).",
  spalten: [["Datum", x => fmtDate(x.datum)], ["Art", x => esc(x.art)], ["Titel", x => `<b>${esc(x.titel)}</b>`], ["Erlassen von", x => esc(gerichtName(x.gericht))], ["Geltung", x => esc(x.geltung)], ["Status", x => x.status === "gueltig" ? `<span class="ok">gültig</span>` : esc(x.status)]],
  onSave: x => {
    if (x.gericht) { const g = STATE.gerichte.find(y => y.id === x.gericht); if (g && x.geltung === "national" && g.stufe !== "gazit" && !confirm("Gesetze für ganz Israel erlässt die Sanhedrin Gedola (Devarim 17:8–11; Rambam Mamrim 1:1). Trotzdem speichern?")) return false; }
    if (["gezeira", "takana"].includes(x.art) && !x.rov && !confirm("Nicht geprüft, ob die Mehrheit die Gezeira tragen kann (Avoda Zara 36a). Trotzdem speichern?")) return false;
  }
};

REG.sofrimReg = {
  titel: "Sofer",
  felder: [
    { n: "name", l: "Name", req: true },
    { n: "art", l: "Funktion", t: "select", opts: () => DATA.sofrim.arten.map(a => [a.id, a.de]) },
    { n: "gericht", l: "Zugeordnet zu", t: "select", opts: () => [["", "—"], ...STATE.gerichte.map(g => [g.id, g.name]), ["mikdash", "Mikdash"], ["bibliothek", "Bibliothek"]] },
    { n: "kasher", l: "Kasher als Sofer Stam (Yir'at Shamayim, Kenntnis der Halachot)", t: "check" },
    { n: "lohn", l: "Lohn / Monat €", t: "number" },
    { n: "fonds", l: "Bezahlt aus", t: "select", opts: fondsOpts, def: "terumat_halishka" },
    { n: "notiz", l: "Notiz" }
  ],
  spalten: [["Name", x => `<span dir="auto"><b>${esc(x.name)}</b></span>`], ["Funktion", x => esc((DATA.sofrim.arten.find(a => a.id === x.art) || {}).de)], ["Zuordnung", x => x.gericht === "mikdash" ? "Mikdash" : x.gericht === "bibliothek" ? "Bibliothek" : esc(gerichtName(x.gericht))], ["Stam", x => x.kasher ? "✓" : ""], ["Lohn", x => x.lohn ? fmtEUR(x.lohn) : ""]]
};

REG.buecher = {
  titel: "Sefer / Bestand",
  felder: [
    { n: "titel", l: "Titel", req: true },
    { n: "art", l: "Art", t: "select", opts: () => DATA.bibliothek.arten.map(a => [a, a]) },
    { n: "material", l: "Material", t: "select", opts: [["gvil", "Gvil"], ["klaf", "Klaf"], ["papier", "Papier / Buch"]] },
    { n: "ort", l: "Standort", t: "select", opts: () => DATA.bibliothek.orte.map(o => [o, o]) },
    { n: "sofer", l: "Geschrieben von" },
    { n: "geprueft", l: "Zuletzt geprüft (Hagaha)", t: "date" },
    { n: "zustand", l: "Zustand", t: "select", opts: [["kasher", "Kasher"], ["korrektur", "In Korrektur"], ["pasul", "Pasul → Genizah"]] },
    { n: "ausgeliehen", l: "Ausgeliehen an" },
    { n: "rueckgabe", l: "Rückgabe bis", t: "date" },
    { n: "notiz", l: "Notiz" }
  ],
  spalten: [["Titel", x => `<b>${esc(x.titel)}</b>`], ["Art", x => esc(x.art)], ["Material", x => esc(x.material)], ["Standort", x => esc(x.ort)], ["Hagaha", x => x.geprueft ? fmtDate(x.geprueft) : `<span class="bad">nie</span>`], ["Zustand", x => x.zustand === "kasher" ? `<span class="ok">kasher</span>` : esc(x.zustand)], ["Ausleihe", x => x.ausgeliehen ? `<span dir="auto">${esc(x.ausgeliehen)}</span>${x.rueckgabe ? " bis " + fmtDate(x.rueckgabe) : ""}` : "verfügbar"]],
  rowClass: x => x.zustand === "pasul" || (x.rueckgabe && x.ausgeliehen && dayNum(todayISO()) > dayNum(x.rueckgabe)) ? "bad" : "",
  onSave: x => { if (x.zustand === "pasul" && x.ort !== "Genizah" && confirm("Pasul – in die Genizah verlegen (Megilla 26b)?")) x.ort = "Genizah"; }
};

/* ---------------- Ansicht: Beit Din ---------------- */
VIEWS.beitdin = () => {
  ensure5();
  const sub = curSub("beitdin", "struktur");
  const head = subtabs("beitdin", [["struktur", "Aufbau & Instanzen"], ["gerichte", "Gerichte"], ["dayanim", "Dayanim"], ["faelle", "Fälle"], ["sanhedrin", "Sanhedrin Gedola – Sitzplan"], ["kiddush", "Kiddush HaChodesh"], ["gesetze", "Gesetze & Takanot"], ["verfahren", "Verfahren & Semicha"]]);
  if (sub === "gerichte") return head + card("Batei Din", `<div class="row">${regNeuBtn("gerichte", "+ Beit Din")}<button class="btn ghost" data-act="bdVorlage">Grundstruktur Yerushalayim anlegen</button>${csvBtn("gerichte")}</div>${regTable("gerichte")}`);
  if (sub === "dayanim") return head + card("Dayanim", `<p class="muted">Middot nach ${esc(DATA.beitdin.middotMekor)}: ${DATA.beitdin.middot.map(esc).join(" · ")}</p><div class="row">${regNeuBtn("dayanim", "+ Dayan")}${csvBtn("dayanim")}</div>${regTable("dayanim")}`);
  if (sub === "faelle") {
    const offen = STATE.faelle.filter(f => f.urteil === "offen" || !f.urteil);
    return head + card(`Fälle – ${offen.length} offen`, `<p class="muted">${esc(DATA.beitdin.instanzen)}</p><div class="row">${regNeuBtn("faelle", "+ Fall")}${csvBtn("faelle")}</div>
      ${regTable("faelle", null, x => x.instanz !== "gazit" ? `<button class="btn sm" data-act="fallWeiter" data-id="${x.id}">↑ nächste Instanz</button>` : "")}`);
  }
  if (sub === "sanhedrin") return head + sanhedrinPlan();
  if (sub === "kiddush") return head + `<div class="grid g2">${card("Kiddush HaChodesh al pi Re'iya", liste(DATA.beitdin.kiddush))}${card("Hinweis zum Kalender", `<p>Das Programm rechnet mit dem festen Kalender (Hillel II). Sobald ein Beit Din den Monat auf Grund von Zeugen heiligt, gilt dessen Beschluss – hier dokumentiert, im Kalender als Abweichung zu beachten.</p>`)}</div>
    ${card("Zeugenregister", `<div class="row">${regNeuBtn("kiddushChodesh", "+ Zeugenaussage")}${csvBtn("kiddushChodesh")}</div>${regTable("kiddushChodesh")}`)}`;
  if (sub === "gesetze") return head + card("Gesetze, Takanot, Gezeirot, Psakim", `<div class="row">${regNeuBtn("gesetze", "+ Eintrag")}${csvBtn("gesetze")}</div>${regTable("gesetze")}`);
  if (sub === "verfahren") return head + `<div class="grid g2">${card("Verfahrensregeln", liste(DATA.beitdin.verfahren))}${card("Semicha", liste(DATA.beitdin.semicha) + `<p class="muted small">Im Modus בזמן הזה werden Semicha-Einträge als Hachana geführt.</p>`)}</div>
    <div class="grid g2">${card("Shotrim", liste(DATA.beitdin.shotrim))}${card("Sanhedrin Gedola", liste(DATA.beitdin.sanhedrin))}</div>`;
  // Struktur
  const zahl = id => STATE.gerichte.filter(g => g.stufe === id).length;
  const tiers = DATA.beitdin.stufen.slice().reverse();
  return head + `<div class="grid g2k">
    ${card("Aufbau der Gerichtsbarkeit", `<div class="bd-tiers">${tiers.map((s, i) => `<div class="bd-tier t${i}"><div class="bd-n">${s.groesse}</div><div><b>${esc(s.de)}</b><br><span class="muted small">${esc(s.ort)} · ${zahl(s.id)} erfasst</span> ${mekor(s.mekor)}</div></div>${i < tiers.length - 1 ? `<div class="bd-pfeil">▲ Anfrage / Instanz</div>` : ""}`).join("")}</div>
      <p class="muted small">${esc(DATA.beitdin.instanzen)}</p>`, "accent")}
    <div>${card("Zuständigkeit nach Größe (Sanhedrin 1)", `<table class="tbl dense"><thead><tr><th>Sache</th><th class="r">Richter</th><th>Mekor</th></tr></thead><tbody>${DATA.beitdin.sachen.map(s => `<tr><td>${esc(s.de)}${s.semicha ? " <b>(Semicha)</b>" : ""}</td><td class="r">${s.g}</td><td>${mekor(s.mekor)}</td></tr>`).join("")}</tbody></table>`)}
      ${card("Sonderformen", `<ul class="list">${DATA.beitdin.sonder.map(s => `<li><b>${esc(s.de)}</b> (${s.groesse}) ${mekor(s.mekor)}</li>`).join("")}</ul>`)}</div>
  </div>`;
};
function sanhedrinPlan() {
  const S = STATE.sanhedrinSitz, R = 300, cx = 360, cy = 330, sitze = [];
  for (let i = 0; i < 71; i++) {
    const a = Math.PI - (i / 70) * Math.PI, r = R - (i % 2) * 34;
    const x = cx + r * Math.cos(a), y = cy - r * Math.sin(a);
    const rolle = i === 35 ? "nasi" : i === 34 ? "av" : "";
    const d = S[i] ? dayanName(S[i]) : "";
    sitze.push(`<g class="seat ${rolle} ${d ? "besetzt" : ""}" data-act="sitzWahl" data-i="${i}"><circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="13"></circle><text x="${x.toFixed(1)}" y="${(y + 4).toFixed(1)}">${i === 35 ? "נ" : i === 34 ? "אב" : i + 1}</text><title>${i === 35 ? "Nasi" : i === 34 ? "Av Beit Din" : "Sitz " + (i + 1)}${d ? ": " + d : " – frei"}</title></g>`);
  }
  const besetzt = Object.values(S).filter(Boolean).length;
  const reihen = [0, 1, 2].map(r => `<div class="reihe"><span>Reihe ${r + 1}</span>${Array.from({ length: 23 }, () => `<i></i>`).join("")}</div>`).join("");
  return `<div class="grid g2k">${card(`Lishkat HaGazit – ${besetzt}/71 besetzt`, `
    <svg viewBox="0 0 720 400" class="sanhedrin-svg" role="img" aria-label="Sitzplan der Sanhedrin">
      ${sitze.join("")}
      <g class="sofer"><rect x="230" y="355" width="90" height="28" rx="6"></rect><text x="275" y="374">Sofer Zechut</text></g>
      <g class="sofer"><rect x="400" y="355" width="90" height="28" rx="6"></rect><text x="445" y="374">Sofer Chova</text></g>
    </svg>
    <div class="reihen">${reihen}</div>
    <p class="muted small">Halbkreis (Sanhedrin 4:3); Nasi in der Mitte (Tosefta Sanhedrin 8:1); 2 Sofrim davor; 3 Reihen à 23 Talmidim (Sanhedrin 4:4). Klick auf einen Sitz zum Zuweisen.</p>
    <div class="actions"><button class="btn ghost" data-act="sitzAuto">Aus Dayanim-Register füllen</button><button class="btn ghost" data-act="druck">Drucken</button></div>`, "accent")}
    ${card("Mitglieder", besetzt ? `<ol class="compact">${Object.entries(S).filter(([, v]) => v).sort((a, b) => a[0] - b[0]).map(([i, id]) => `<li value="${Number(i) + 1}">${Number(i) === 35 ? "<b>Nasi</b>: " : Number(i) === 34 ? "<b>Av Beit Din</b>: " : ""}<span dir="auto">${esc(dayanName(id))}</span></li>`).join("")}</ol>` : `<p class="muted">Noch keine Sitze zugewiesen.</p>`)}</div>`;
}
Object.assign(ACT, {
  bdVorlage: () => {
    if (STATE.gerichte.some(g => g.stufe === "gazit") && !confirm("Es gibt bereits eine Sanhedrin Gedola. Trotzdem Grundstruktur hinzufügen?")) return;
    [["Sanhedrin Gedola", "gazit", "Lishkat HaGazit"], ["Beit Din am Tor der Azara", "shaar_haazara", "Petach HaAzara"], ["Beit Din am Tor des Har HaBayit", "shaar_harhabayit", "Petach Har HaBayit"], ["Beit Din shel Kohanim", "kohanim", "Mikdash"]]
      .forEach(([name, stufe, ort]) => STATE.gerichte.push({ id: uid(), name, stufe, ort, einwohner: "", tage: stufe === "gazit" ? ["0", "1", "2", "3", "4", "5"] : ["1", "4"], shotrim: "", notiz: "Vorlage" }));
    saveState(); render();
  },
  fallWeiter: el => {
    const x = STATE.faelle.find(y => y.id === el.dataset.id), i = INSTANZ.indexOf(x.instanz || "kfar_ir");
    const neu = INSTANZ[Math.min(i + 1, INSTANZ.length - 1)];
    const g = STATE.gerichte.find(y => y.stufe === (neu === "kfar_ir" ? "ir" : neu));
    x.verlauf = x.verlauf || []; x.verlauf.push(`${todayISO()}: ${INSTANZ_DE[x.instanz] || "—"} → ${INSTANZ_DE[neu]}`);
    x.instanz = neu; if (g) x.gericht = g.id; x.urteil = "offen";
    if (neu === "gazit") alert("Psak der Lishkat HaGazit ist bindend – wer danach dagegen lehrt, ist Zaken Mamre (Sanhedrin 11:2; Devarim 17:11).");
    saveState(); render();
  },
  sitzWahl: el => {
    const i = Number(el.dataset.i), cur = STATE.sanhedrinSitz[i] || "";
    modal(i === 35 ? "Nasi" : i === 34 ? "Av Beit Din" : `Sitz ${i + 1}`, `<form class="form" data-form="sitz"><input type="hidden" name="i" value="${i}">
      <label>Dayan <select name="d">${opt("", "— frei —", cur)}${STATE.dayanim.map(d => opt(d.id, d.name + (d.semicha ? "" : " (ohne Semicha)"), cur)).join("")}</select></label>
      <p class="muted small">Für die Sanhedrin: Semicha, Kinder, nicht hochbetagt (Sanhedrin 36b).</p>
      <div class="actions"><button class="btn">Zuweisen</button><button type="button" class="btn ghost" data-act="closeModal">Abbrechen</button></div></form>`);
  },
  sitzAuto: () => {
    const g = STATE.gerichte.find(x => x.stufe === "gazit");
    let L = STATE.dayanim.filter(d => !g || d.gericht === g.id);
    const nasi = L.find(d => d.funktion === "nasi"), av = L.find(d => d.funktion === "av");
    const S = {}; if (nasi) S[35] = nasi.id; if (av) S[34] = av.id;
    L = L.filter(d => d !== nasi && d !== av && d.funktion !== "talmid");
    const frei = [...Array(71).keys()].filter(i => !S[i]).sort((a, b) => Math.abs(a - 35) - Math.abs(b - 35));
    L.forEach((d, k) => { if (frei[k] !== undefined) S[frei[k]] = d.id; });
    STATE.sanhedrinSitz = S; saveState(); render();
  }
});
FORM.sitz = fd => { const i = fd.get("i"), d = fd.get("d"); if (d) STATE.sanhedrinSitz[i] = d; else delete STATE.sanhedrinSitz[i]; closeModal(); };

/* ---------------- Ansicht: Bibliothek & Sofrim ---------------- */
VIEWS.bibliothek = () => {
  ensure5();
  const sub = curSub("bibliothek", "bestand");
  const head = subtabs("bibliothek", [["bestand", "Bibliothek"], ["sofrim", "Sofrim"], ["shtarot", "Shtarot & Dokumentarten"], ["regeln", "Regeln"]]);
  if (sub === "sofrim") return head + `<div class="grid g2">${card("Funktionen", `<table class="tbl dense">${DATA.sofrim.arten.map(a => `<tr><td><b>${esc(a.de)}</b></td><td>${mekor(a.mekor)}</td></tr>`).join("")}</table>`)}${card("Material", `<p>Pergament, Tinte und Federn: Modul <b>Büro, Schrift & Archiv</b>.</p><div class="actions"><button class="btn ghost" data-act="go" data-v="buero">→ Büro & Schrift</button></div>`)}</div>
    ${card("Sofrim-Register", `<div class="row">${regNeuBtn("sofrimReg", "+ Sofer")}${csvBtn("sofrimReg")}</div>${regTable("sofrimReg")}`)}`;
  if (sub === "shtarot") {
    const mj = maaserJahr();
    return head + card("Dokumentarten", `<table class="tbl dense">${DATA.sofrim.shtarot.map(s => `<tr><td><b>${esc(s.de)}</b></td><td>${mekor(s.mekor)}</td></tr>`).join("")}</table>
      ${mj.j >= 6 ? `<p class="warn">Shemita-Zyklus Jahr ${mj.j}: Prozbul vor Ende der Shemita vorbereiten (Shevi'it 10:3).</p>` : ""}
      <div class="actions"><button class="btn ghost" data-act="go" data-v="buero">→ Archiv erfassen</button></div>`);
  }
  if (sub === "regeln") return head + card("Regeln für Sfarim", liste(DATA.bibliothek.regeln));
  const B = STATE.buecher, aus = B.filter(b => b.ausgeliehen).length, ohne = B.filter(b => !b.geprueft).length;
  return head + `<div class="grid g3">${card("Bestand", `<div class="stat"><b>${B.length}</b><span>Werke</span></div><div class="stat"><b>${aus}</b><span>ausgeliehen</span></div><div class="stat"><b>${ohne}</b><span>ohne Hagaha</span></div>`, "accent")}
    ${card("Sefer HaAzara", B.some(b => b.art.startsWith("Sefer HaAzara")) ? `<p class="ok">Erfasst – Referenz für alle Korrekturen.</p>` : `<p class="warn">Kein Sefer HaAzara erfasst (Kelim 15:6).</p>`)}
    ${card("Standorte", `<ul class="list compact">${DATA.bibliothek.orte.map(o => `<li>${esc(o)} (${B.filter(b => b.ort === o).length})</li>`).join("")}</ul>`)}</div>
    ${card("Katalog", `<div class="row">${regNeuBtn("buecher", "+ Werk")}${csvBtn("buecher")}</div>${regTable("buecher")}`)}`;
};

/* ---------------- Übersicht ergänzen ---------------- */
const _dash5 = VIEWS.dashboard;
VIEWS.dashboard = () => {
  ensure5();
  const offen = STATE.faelle.filter(f => !f.urteil || f.urteil === "offen").length;
  const t = todayISO(), wd = dateOf(t).getUTCDay();
  const heute = STATE.gerichte.filter(g => (g.tage || []).includes(String(wd))).length;
  const html = _dash5();
  const mini = `<div class="mini" data-act="go" data-v="beitdin"><b>${offen}</b><span>Offene Fälle</span><small>${heute} Batei Din tagen heute</small></div>`;
  return html.replace('<div class="minis">', '<div class="minis">' + mini);
};

/* ---------------- Demo ---------------- */
demoState = (orig => () => {
  const s = orig(); Object.assign(s, JSON.parse(JSON.stringify(STATE_DEFAULTS_5)));
  const g = [["Sanhedrin Gedola", "gazit", "Lishkat HaGazit"], ["Beit Din am Tor der Azara", "shaar_haazara", "Petach HaAzara"], ["Beit Din am Tor des Har HaBayit", "shaar_harhabayit", "Petach Har HaBayit"], ["Sanhedrin Ketana Chevron", "ir", "Chevron – Stadttor"], ["Beit Din Kfar (Demo)", "kfar", "Dorftor"]]
    .map(([name, stufe, ort]) => ({ id: uid(), name, stufe, ort, einwohner: stufe === "ir" ? 400 : "", tage: stufe === "gazit" ? ["0", "1", "2", "3", "4", "5"] : ["1", "4"], shotrim: 2, notiz: "Demo" }));
  s.gerichte = g;
  for (let i = 0; i < 12; i++) s.dayanim.push({ id: uid(), name: `Dayan ${i + 1} (Demo)`, gericht: g[0].id, funktion: i === 0 ? "nasi" : i === 1 ? "av" : "dayan", yichus: i % 4 === 0 ? "kohen" : "yisrael", semicha: i < 8, somech: "", middot: DATA.beitdin.middot.slice(0, 5 + (i % 3)), sprachen: "Hebräisch, Aramäisch", geburt: 1960 + i, kinder: true, pasul: "" });
  for (let i = 0; i < 3; i++) s.dayanim.push({ id: uid(), name: `Dayan Kfar ${i + 1} (Demo)`, gericht: g[4].id, funktion: "dayan", yichus: "yisrael", semicha: false, middot: DATA.beitdin.middot.slice(0, 4), geburt: 1980, kinder: true, pasul: "" });
  s.faelle.push({ id: uid(), datum: todayISO(), titel: "Demo: Streit um Grundstücksgrenze", sache: "mamonot", gericht: g[4].id, instanz: "kfar_ir", zeugen: 2, urteil: "offen", parteien: "Reuven ./. Shimon" });
  s.faelle.push({ id: uid(), datum: todayISO(), titel: "Demo: Halachische Anfrage zur Ma'aracha", sache: "zaken_mamre", gericht: g[2].id, instanz: "shaar_harhabayit", zeugen: 0, urteil: "offen" });
  s.buecher.push({ id: uid(), titel: "Sefer HaAzara", art: "Sefer HaAzara (Maßstab-Rolle)", material: "gvil", ort: "Azara (Sefer HaAzara)", sofer: "", geprueft: todayISO(), zustand: "kasher" });
  s.buecher.push({ id: uid(), titel: "Pinkas der Sanhedrin 5787", art: "Pinkas / Protokolle", material: "papier", ort: "Lishkat HaGazit", zustand: "kasher" });
  s.sofrimReg.push({ id: uid(), name: "Sofer Zechut (Demo)", art: "sofer_dayanim", gericht: g[0].id, kasher: true });
  s.sofrimReg.push({ id: uid(), name: "Sofer Chova (Demo)", art: "sofer_dayanim", gericht: g[0].id, kasher: true });
  s.gesetze.push({ id: uid(), datum: todayISO(), art: "takana", titel: "Demo: Ordnung der Payisot", text: "", gericht: g[0].id, grundlage: "Yoma 22a", geltung: "mikdash", rov: true, status: "entwurf" });
  return s;
})(demoState);

/* ---------------- CSS ---------------- */
document.head.insertAdjacentHTML("beforeend", `<style>
.bd-tiers{display:flex;flex-direction:column;gap:.2em}
.bd-tier{display:flex;gap:.8em;align-items:center;border:1px solid var(--line);border-radius:10px;padding:.6em .8em;background:var(--panel)}
.bd-tier.t0{border:2px solid var(--gold);background:var(--gold-soft)}
.bd-n{min-width:2.6em;height:2.6em;border-radius:50%;display:grid;place-items:center;font-weight:700;background:var(--techelet);color:#fff}
.bd-pfeil{text-align:center;color:var(--muted);font-size:.8em}
.sanhedrin-svg{width:100%;max-width:720px;display:block;margin:auto}
.sanhedrin-svg .seat circle{fill:var(--panel);stroke:var(--techelet);stroke-width:1.5;cursor:pointer}
.sanhedrin-svg .seat.besetzt circle{fill:var(--techelet)} .sanhedrin-svg .seat.besetzt text{fill:#fff}
.sanhedrin-svg .seat.nasi circle,.sanhedrin-svg .seat.av circle{stroke:var(--gold);stroke-width:3}
.sanhedrin-svg text{font-size:9px;text-anchor:middle;fill:var(--ink);pointer-events:none;font-family:var(--sans)}
.sanhedrin-svg .seat:hover circle{stroke:var(--gold);stroke-width:3}
.sanhedrin-svg .sofer rect{fill:var(--gold-soft);stroke:var(--gold)} .sanhedrin-svg .sofer text{font-size:11px}
.reihen{display:flex;flex-direction:column;gap:4px;margin-top:.6em}
.reihe{display:flex;gap:3px;align-items:center;justify-content:center} .reihe span{font-size:.75em;color:var(--muted);width:4.5em}
.reihe i{width:12px;height:12px;border-radius:50%;background:var(--sh);border:1px solid var(--line);display:inline-block}
</style>`);
