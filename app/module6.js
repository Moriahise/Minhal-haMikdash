/* =====================================================================
   module6.js – Kelim & Reinigung · Instandsetzung · Baumaterial & Bauhof
   Kelei Sharet, Reinigungsplan, Zuständigkeiten, Reinigungsmittel &
   Werkzeuge (Herstellung, Lagerung), Baumaterialien, Produktion,
   Bauprojekte
   ===================================================================== */
"use strict";

/* ---------------- Lagerartikel ---------------- */
DATA.lagerVorlage.push(
  /* Reinigung */
  { id: "mapa",     name: "Mapa (Altartuch für Sid / Erev Shabbat)", einheit: "Stk", min: 10, kat: "Reinigung & Werkzeug", mekor: "Middot 3:4; Rambam Beit HaBechira 1:17 (Tuch, kein Eisen)" },
  { id: "besen",    name: "Besen & Bürsten (Palmfaser)",     einheit: "Stk", min: 30, kat: "Reinigung & Werkzeug", mekor: "Handwerk – kein Mekor" },
  { id: "deliyim",  name: "Eimer / Schöpfgefäße (Chulin)",    einheit: "Stk", min: 40, kat: "Reinigung & Werkzeug", mekor: "Handwerk – nicht Kli Sharet" },
  { id: "magrefa",  name: "Magrefa (Schaufel)",               einheit: "Stk", min: 2, kat: "Reinigung & Werkzeug", mekor: "Tamid 5:6" },
  { id: "sulamot",  name: "Leitern / Gerüstteile",            einheit: "Stk", min: 10, kat: "Reinigung & Werkzeug", mekor: "Handwerk; vor der Menorah stand ein Stein mit 3 Stufen (Tamid 3:9)" },
  { id: "teivot",   name: "Teivot (Arbeitskästen für Kodesh HaKodashim)", einheit: "Stk", min: 2, kat: "Reinigung & Werkzeug", mekor: "Middot 4:5" },
  { id: "kli_barzel", name: "Eisenwerkzeug (nicht am Mizbe'ach!)", einheit: "Stk", min: 20, kat: "Reinigung & Werkzeug", mekor: "Middot 3:4; Rambam Beit HaBechira 1:16" },
  /* Baumaterial */
  { id: "avanim_shlemot", name: "Avanim Shlemot (ganze Steine – Mizbe'ach/Kevesh)", einheit: "Stk", min: 20, kat: "Baumaterial", mekor: "Devarim 27:6; Middot 3:4; Rambam Beit HaBechira 1:14–16" },
  { id: "avanim_gazit",   name: "Avnei Gazit (behauen, außerhalb Har HaBayit)", einheit: "Stk", min: 50, kat: "Baumaterial", mekor: "Melachim I 6:7; Rambam Beit HaBechira 1:9" },
  { id: "levenim",  name: "Levenim (Ziegel – wenn keine Steine)", einheit: "Stk", min: 0, kat: "Baumaterial", mekor: "Rambam Beit HaBechira 1:9" },
  { id: "sid",      name: "Sid (Kalk)",                      einheit: "Kuppa", min: 20, kat: "Baumaterial", mekor: "Middot 3:4; Rambam Beit HaBechira 1:17" },
  { id: "shayish",  name: "Shayish (Marmor)",                einheit: "Platte", min: 4, kat: "Baumaterial", mekor: "Shekalim 6:4 (Marmortische)" },
  { id: "avanim_tovot", name: "Edelsteine / Pflaster der Azara", einheit: "Platte", min: 0, kat: "Baumaterial", mekor: "Rambam Beit HaBechira 1:10" },
  { id: "zahav_ri",  name: "Zahav (Blattgold / Beschlag)",   einheit: "g", min: 500, kat: "Baumaterial", mekor: "Rambam Beit HaBechira 1:11" },
  { id: "kesef_roh", name: "Kesef (Silber für Kelim)",       einheit: "g", min: 1000, kat: "Baumaterial", mekor: "Tamid 3:4" },
  { id: "nechoshet", name: "Nechoshet (Kupfer/Bronze)",       einheit: "kg", min: 20, kat: "Baumaterial", mekor: "Shemot 30:18; Yoma 38a (Sha'ar Nikanor)" },
  { id: "bedil",     name: "Bedil (Zinn – Notfall-Kelim)",    einheit: "kg", min: 0, kat: "Baumaterial", mekor: "Rambam Beit HaBechira 1:20" },
  { id: "etz_bau",   name: "Bauholz (Türen, Gerüst – nicht vorstehend in der Azara)", einheit: "Balken", min: 10, kat: "Baumaterial", mekor: "Rambam Beit HaBechira 1:10; Melachim I 6:15" }
);

/* ---------------- Daten ---------------- */
DATA.kelim = {
  stamm: [
    { n: "Mizrak (Sprengschale für Blut)", mat: "Gold / Silber", mekor: "Shemot 27:3" },
    { n: "Kaf & Bazich (Ketoret)", mat: "Gold", mekor: "Yoma 5:1; Tamid 6:3" },
    { n: "Machta (Kohlenpfanne)", mat: "Silber täglich, Gold am YK", mekor: "Yoma 4:4; Tamid 5:5" },
    { n: "Teni (Korb – Dishun Mizbe'ach HaPnimi)", mat: "Gold", mekor: "Tamid 3:9" },
    { n: "Kuz (Kanne – Dishun HaMenorah)", mat: "Gold", mekor: "Tamid 3:9" },
    { n: "Magrefa", mat: "Metall", mekor: "Tamid 5:6" },
    { n: "Sakinim (Schlachtmesser)", mat: "Metall", mekor: "Middot 4:7 (Beit HaChalifot)" },
    { n: "13 Shulchanot (8 Marmor im Beit HaMitbechayim, 2 am Kevesh, 2 im Ulam, 1 Gold innen)", mat: "Marmor / Silber / Gold", mekor: "Shekalim 6:4" },
    { n: "Kiyor & Mechona (12 Hähne)", mat: "Nechoshet", mekor: "Shemot 30:18; Yoma 3:10" },
    { n: "Menorah", mat: "Gold (Not: anderes Metall)", mekor: "Menachot 28b; Rambam Beit HaBechira 1:20" },
    { n: "Shulchan HaPanim", mat: "Gold", mekor: "Shemot 25:23–30" },
    { n: "Mizbe'ach HaZahav", mat: "Gold", mekor: "Shemot 30:1–5" },
    { n: "Middot: 2 trockene (Isaron, ½ Isaron), 7 flüssige (Hin … Revi'it)", mat: "Metall", mekor: "Menachot 9:2" },
    { n: "Chatzotzrot", mat: "Silber", mekor: "Bamidbar 10:2" },
    { n: "Kalpi (Goralot-Urne)", mat: "Holz – Chol, kein Kli Sharet", mekor: "Yoma 39a" },
    { n: "Goralot", mat: "Gold (Ben Gamla)", mekor: "Yoma 3:9; 4:1" }
  ],
  regeln: [
    "Täglich werden 93 Kelim aus Silber und Gold aus der Lishkat HaKelim ausgegeben (Tamid 3:4).",
    "Kelei Sharet nur aus Metall; Holz, Knochen, Stein und Glas sind pasul; bei Armut Zinn, bei Wohlstand Gold (Rambam Beit HaBechira 1:20; Menachot 28b).",
    "Kelei Sharet werden durch ihre Avoda geweiht (Menachot 50a; Shevuot 15b – prüfen).",
    "Alle Kelim des Mikdash haben einen zweiten und dritten Satz; nach dem Regel werden die Ersten getaucht und die Zweiten benutzt – außer den beiden Altären, die wie Boden gelten (Chagiga 3:8).",
    "Pilger werden gewarnt, den Shulchan nicht zu berühren (Chagiga 26b).",
    "Gespendete Kelim gehen in die Lishkat HaKelim; alle 30 Tage öffnen die Gizbarim sie – unbrauchbare werden verkauft, Erlös an Bedek HaBayit (Shekalim 5:6).",
    "Beschädigte Kelei Sharet: Reparatur nach Zevachim 88a (prüfen); Messer im Beit HaChalifot (Middot 4:7)."
  ],
  orte: ["Lishkat HaKelim", "Heichal", "Azara", "Beit HaMitbechayim", "Beit HaChalifot (Messer)", "Ulam", "Lishkat Pinchas HaMalbish", "Beit HaMoked", "Reserve (2./3. Satz)", "Werkstatt / Reparatur", "Genizah"]
};

DATA.reinigungsplan = [
  { objekt: "Mizbe'ach HaChitzon", methode: "Terumat HaDeshen, Tapuach räumen; Mapa am Erev Shabbat; Sid 2× jährlich mit Tuch, nie mit Eisen", frequenz: "täglich / wöchentlich / Pesach & Sukkot", wer: "Kohanim (Payis 1); Umanim beim Sid", mekor: "Tamid 1:4; 2:2; Middot 3:4; Rambam Beit HaBechira 1:17" },
  { objekt: "Mizbe'ach HaZahav", methode: "Dishun mit dem Teni", frequenz: "täglich morgens", wer: "Kohen aus Payis 2", mekor: "Tamid 3:9; 6:1" },
  { objekt: "Menorah", methode: "Dishun mit dem Kuz, Lampen säubern, neue Dochte und Öl (Hatava)", frequenz: "täglich", wer: "Kohen aus Payis 2", mekor: "Tamid 3:9; 6:1; Menachot 86b" },
  { objekt: "Kelim mit Chatat-Fleisch", methode: "Merika (heiß) & Shtifa (kalt); Kli Cheres zerbrechen", frequenz: "nach Gebrauch", wer: "Kohanim des Beit Av", mekor: "Vayikra 6:21; Zevachim 11:7; 97a" },
  { objekt: "Kelei Sharet allgemein", methode: "Tevila nach dem Regel, Wechsel auf den 2. Satz", frequenz: "3× jährlich", wer: "Kohanim; Amarkalim (Schlüssel)", mekor: "Chagiga 3:8" },
  { objekt: "Azara-Boden", methode: "Ama verschließen, Boden überfluten, ablassen → Nachal Kidron", frequenz: "nach Bedarf, bes. Erev Pesach", wer: "Kohanim / Levi'im", mekor: "Pesachim 65a; Yoma 5:6" },
  { objekt: "Beit HaMitbechayim & Shulchanot", methode: "Abspülen auf den 8 Marmortischen", frequenz: "täglich", wer: "Kohanim", mekor: "Shekalim 6:4; Middot 3:5" },
  { objekt: "Kiyor", methode: "Täglich füllen; nachts mit dem Mukhni absenken", frequenz: "täglich", wer: "Kohanim; Mechanik nach Ben Katin", mekor: "Yoma 3:10; 37a" },
  { objekt: "Heichal", methode: "Sid (Kalken)", frequenz: "1× jährlich vor Pesach", wer: "Umanim – Kohanim bevorzugt", mekor: "Middot 3:4" },
  { objekt: "Kodesh HaKodashim", methode: "Nur bei Bedarf; Arbeiter in Teivot von oben herabgelassen", frequenz: "bei Bedarf", wer: "Umanim – Kohanim, tahor, ohne Mum bevorzugt", mekor: "Middot 4:5; Eruvin 105a" },
  { objekt: "Lishkat HaMedichin", methode: "Waschen der Kravayim", frequenz: "täglich", wer: "Kohanim", mekor: "Middot 5:3" },
  { objekt: "Beit HaMoked / Beit HaTevila / Beit HaKisei", methode: "Fegen, Wischen, Feuer unterhalten", frequenz: "täglich", wer: "Levi'im / Bedienstete", mekor: "Tamid 1:1; Middot 1:9" },
  { objekt: "Har HaBayit", methode: "Sauberkeit; kein Ausspucken, keine Abkürzung", frequenz: "laufend", wer: "Levi'im (Shmira)", mekor: "Berachot 9:5" },
  { objekt: "Bigdei Kehuna", methode: "Nicht waschen – abgetragene zu Petilot", frequenz: "—", wer: "Pinchas al haMalbush", mekor: "Rambam Klei HaMikdash 8:5; Sukka 5:3" }
];

DATA.zustaendig = [
  { rolle: "Kohanim des Beit Av", aufgaben: "Altar, Menorah, Mizbe'ach HaZahav, Kelim mit Kodashim, Beit HaMitbechayim", mekor: "Tamid 1–6" },
  { rolle: "Amarkalim (7) & Gizbarim (3)", aufgaben: "Schlüssel, Ausgabe und Inventur der Kelim, Öffnen der Lishkat HaKelim alle 30 Tage", mekor: "Shekalim 5:2; 5:6; Tamid 3:4" },
  { rolle: "Levi'im", aufgaben: "Tore, Har HaBayit, Beit HaMoked, Ordnung und Sauberkeit der Außenbereiche", mekor: "Middot 1:1; Divrei HaYamim I 9:26–29" },
  { rolle: "Kohanim Ba'alei Mumim", aufgaben: "Holzprüfung in Lishkat HaEtzim", mekor: "Middot 2:5" },
  { rolle: "Umanim (Bau & Reparatur)", aufgaben: "Bevorzugt Kohanim, sonst Levi'im, sonst Yisraelim; Tahorim vor Teme'im; ohne Mum vor Ba'alei Mumim", mekor: "Eruvin 105a; Rambam Beit HaBechira 7:23 (prüfen)" },
  { rolle: "Ben Katin (Kiyor-Mechanik)", aufgaben: "12 Hähne, Mukhni", mekor: "Yoma 3:10" },
  { rolle: "Elazar / Pinchas", aufgaben: "Parochet / Bigdei Kehuna", mekor: "Shekalim 5:1" },
  { rolle: "Ganz Israel", aufgaben: "Bauen und unterstützen – Männer und Frauen, persönlich und mit Vermögen", mekor: "Rambam Beit HaBechira 1:12" }
];

DATA.baustoffe = {
  regeln: [
    "Gebaut wird mit großen Steinen; findet man keine, mit Ziegeln. Behauen wird außerhalb des Har HaBayit (Rambam Beit HaBechira 1:9; Melachim I 6:7).",
    "In der Azara ragt kein Holz hervor; der Boden wird mit wertvollen Steinen gepflastert; ein gelockerter Stein ist pasul (Rambam Beit HaBechira 1:10).",
    "Das Bauwerk zu stärken und zu verschönern ist Mitzvat Aseh; mit Gold überziehen, wenn möglich (Rambam Beit HaBechira 1:11).",
    "Gebaut wird nur bei Tag, nicht nachts, nicht an Yom Tov; alle sind verpflichtet (Rambam Beit HaBechira 1:12; Shevuot 15b; Yevamot 6a).",
    "Der Mizbe'ach nur aus Stein, direkt mit dem Boden verbunden (Rambam Beit HaBechira 1:13).",
    "Altarsteine: ganz (Avanim Shlemot), aus unberührtem Boden (Betulat Karka) oder dem Meer; beschädigte Steine werden nicht ausgelöst, sondern begraben (Rambam Beit HaBechira 1:14–15; Middot 3:4).",
    "Ein Stein, den Eisen berührt hat, ist für Mizbe'ach und Kevesh pasul (Rambam Beit HaBechira 1:16; Middot 3:4).",
    "Sid am Altar zweimal jährlich mit einem Tuch, nicht mit Eisen (Rambam Beit HaBechira 1:17).",
    "Kein Treppenaufgang zum Altar, sondern ein Kevesh (Rambam Beit HaBechira 1:18).",
    "Wer einen Altarstein zerstört, übertritt ein Verbot (Rambam Beit HaBechira 1:19).",
    "Man baut aus Chulin und heiligt danach – sonst Me'ila beim Bau (Me'ila 14a).",
    "Keine Bäume und keine Holzbauten neben dem Altar (Devarim 16:21; Tamid 28b).",
    "Maßstab: zwei Amot in der Kammer über dem Sha'ar Shushan (Kelim 17:9; Pesachim 86a).",
    "Kodesh HaKodashim: Arbeiter in Teivot herablassen (Middot 4:5)."
  ],
  produktionsarten: [
    { id: "steinbruch", de: "Steinbruch – ganze Steine (Altar/Kevesh)", lager: "avanim_shlemot", checks: ["barzel", "pegima", "betula", "chulin"] },
    { id: "steinmetz", de: "Steinmetz – Avnei Gazit (außerhalb Har HaBayit)", lager: "avanim_gazit", checks: ["chutz", "chulin"] },
    { id: "ziegelei", de: "Ziegelei – Levenim", lager: "levenim", checks: ["chulin"] },
    { id: "kalk", de: "Kalkbrennofen – Sid", lager: "sid", checks: ["chulin"] },
    { id: "marmor", de: "Marmorbearbeitung", lager: "shayish", checks: ["chutz", "chulin"] },
    { id: "gold", de: "Goldschmiede – Blattgold / Beschläge", lager: "zahav_ri", checks: ["chulin"] },
    { id: "guss", de: "Metallguss – Kelim (Silber, Kupfer)", lager: "kesef_roh", checks: ["metall", "chulin"] },
    { id: "holz", de: "Zimmerei – Türen, Gerüst", lager: "etz_bau", checks: ["chulin"] },
    { id: "besen", de: "Besen & Bürsten binden", lager: "besen", checks: [] },
    { id: "mapa", de: "Weberei – Mapa / Tücher", lager: "mapa", checks: [] },
    { id: "eimer", de: "Gefäße für Reinigung (Chulin)", lager: "deliyim", checks: [] }
  ],
  checks: {
    barzel: { de: "Kein Eisen hat den Stein berührt", mekor: "Rambam Beit HaBechira 1:16" },
    pegima: { de: "Keine Pegima (Scharte/Sprung)", mekor: "Middot 3:4; Rambam Beit HaBechira 1:14" },
    betula: { de: "Aus Betulat Karka oder dem Meer", mekor: "Rambam Beit HaBechira 1:14" },
    chutz: { de: "Bearbeitet außerhalb des Har HaBayit", mekor: "Rambam Beit HaBechira 1:9" },
    chulin: { de: "Aus Chulin gefertigt, Hekdesh erst danach", mekor: "Me'ila 14a" },
    metall: { de: "Metall (für Kelei Sharet)", mekor: "Rambam Beit HaBechira 1:20" }
  },
  lagerorte: [
    { ort: "Steinlager außerhalb des Har HaBayit", was: "Rohsteine, Avnei Gazit, Ziegel", mekor: "Rambam Beit HaBechira 1:9" },
    { ort: "Lishkat HaKelim", was: "Kelei Sharet, gespendete Kelim", mekor: "Tamid 3:4; Shekalim 5:6" },
    { ort: "Beit HaChalifot", was: "Schlachtmesser", mekor: "Middot 4:7" },
    { ort: "Lishka im Beit HaMoked", was: "Genizah der Altarsteine", mekor: "Middot 1:6" },
    { ort: "Bauhof / Werkstatt (außerhalb)", was: "Kalk, Holz, Werkzeug, Eisen", mekor: "Rambam Beit HaBechira 1:9 (Bearbeitung außerhalb)" },
    { ort: "Otzarot (Schatzkammern)", was: "Gold, Silber", mekor: "Shekalim 5:6; Divrei HaYamim I 26:20" }
  ]
};

/* Reinigungsprotokoll (Modul 4) um alle Objekte erweitern */
if (REG.reinigung) REG.reinigung.felder[1].opts = () => [...DATA.reinigungsplan.map(r => [r.objekt, r.objekt]), ["Sedinim/Tücher", "Sedinim / Tücher"], ["Alltagskleidung", "Alltagskleidung"], ["Küche/Lishkat HaNezirim", "Küche / Lishkat HaNezirim"]];

/* ---------------- Navigation ---------------- */
NAV.splice(NAV.findIndex(n => n.id === "bau"), 0,
  { id: "kelim", de: "Kelim & Reinigung", he: "כלים וניקיון", ico: "⚱" },
  { id: "bauhof", de: "Baumaterial & Bauhof", he: "חומרי בנין", ico: "▦" }
);

/* ---------------- Zustand ---------------- */
const STATE_DEFAULTS_6 = { kelimReg: [], kelimAusgabe: [], produktion: [], bauprojekte: [] };
function ensure6() { for (const [k, v] of Object.entries(STATE_DEFAULTS_6)) if (STATE[k] === undefined) STATE[k] = JSON.parse(JSON.stringify(v)); }
const _render6 = render;
render = () => { ensure6(); _render6(); };

/* ---------------- Register: Kelim ---------------- */
const ZUSTAND = { ok: "einsatzbereit", schmutzig: "zu reinigen", tamei: "tamei – Tevila", defekt: "beschädigt", pasul: "pasul / Genizah" };
REG.kelimReg = {
  titel: "Kli",
  felder: [
    { n: "name", l: "Bezeichnung", req: true },
    { n: "typ", l: "Typ", t: "select", opts: [["sharet", "Kli Sharet"], ["chol", "Kli Chol (Reinigung, Werkstatt)"]] },
    { n: "material", l: "Material", t: "select", opts: [["gold", "Gold"], ["silber", "Silber"], ["nechoshet", "Kupfer/Bronze"], ["bedil", "Zinn"], ["marmor", "Marmor"], ["stein", "Stein"], ["holz", "Holz"], ["glas", "Glas"], ["ton", "Ton (Cheres)"]] },
    { n: "anzahl", l: "Anzahl", t: "number", def: 1 },
    { n: "satz", l: "Satz", t: "select", opts: [["1", "1. Satz (in Gebrauch)"], ["2", "2. Satz"], ["3", "3. Satz"]] },
    { n: "ort", l: "Standort", t: "select", opts: () => DATA.kelim.orte.map(o => [o, o]) },
    { n: "zustand", l: "Zustand", t: "select", opts: () => Object.entries(ZUSTAND) },
    { n: "aktiv", l: "Dieser Satz ist in Gebrauch", t: "check", def: true },
    { n: "geweiht", l: "Durch Avoda geweiht", t: "check" },
    { n: "gereinigt", l: "Zuletzt gereinigt", t: "date" },
    { n: "verantwortlich", l: "Verantwortlich" },
    { n: "notiz", l: "Notiz" }
  ],
  hinweis: "Kelei Sharet nur aus Metall (Rambam Beit HaBechira 1:20). Doppelsätze: Chagiga 3:8.",
  spalten: [["Kli", x => `<b>${esc(x.name)}</b>`], ["Typ", x => x.typ === "sharet" ? "Sharet" : "Chol"], ["Material", x => esc(x.material)], ["Anz.", x => esc(x.anzahl)], ["Satz", x => `${esc(x.satz)}${(x.aktiv !== undefined ? x.aktiv : x.satz === "1") ? " <b>(aktiv)</b>" : ""}`], ["Standort", x => esc(x.ort)], ["Zustand", x => `<span class="${x.zustand === "ok" ? "ok" : "bad"}">${esc(ZUSTAND[x.zustand] || x.zustand)}</span>`], ["Gereinigt", x => x.gereinigt ? fmtDate(x.gereinigt) : "—"]],
  rowClass: x => x.zustand !== "ok" ? "bad" : "",
  onSave: x => {
    if (x.typ === "sharet" && ["holz", "glas", "stein", "ton"].includes(x.material) && !x.name.toLowerCase().includes("shulchan")) {
      if (!confirm("Kelei Sharet aus Holz, Stein, Glas oder Ton sind pasul (Rambam Beit HaBechira 1:20). Trotzdem speichern?")) return false;
      x.zustand = "pasul";
    }
  }
};
REG.produktion = {
  titel: "Herstellung (Bauhof / Werkstatt)",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "art", l: "Produktion", t: "select", opts: () => DATA.baustoffe.produktionsarten.map(p => [p.id, p.de]) },
    { n: "menge", l: "Menge", t: "number", req: true },
    { n: "ort", l: "Werkstatt / Herkunft" },
    { n: "checks", l: "Prüfungen", t: "multi", opts: () => Object.entries(DATA.baustoffe.checks).map(([k, c]) => [k, `${c.de} (${c.mekor})`]) },
    { n: "rohstoff", l: "Rohstoff-Verbrauch (Artikel)", t: "select", opts: () => [["", "—"], ...DATA.lagerVorlage.filter(a => ["Baumaterial", "Reinigung & Werkzeug", "Agrar", "Textil"].includes(a.kat)).map(a => [a.id, a.name])] },
    { n: "rohMenge", l: "Rohstoff-Menge", t: "number" },
    { n: "umanim", l: "Umanim" },
    { n: "kosten", l: "Kosten €", t: "number" },
    { n: "fonds", l: "Fonds", t: "select", opts: fondsOpts, def: "bedek" },
    { n: "notiz", l: "Notiz" }
  ],
  spalten: [["Datum", x => fmtDate(x.datum)], ["Produktion", x => esc((DATA.baustoffe.produktionsarten.find(p => p.id === x.art) || {}).de)], ["Menge", x => `${fmtNum(x.menge)} ${lagerEinheit((DATA.baustoffe.produktionsarten.find(p => p.id === x.art) || {}).lager)}`], ["Prüfungen", x => x.fehl && x.fehl.length ? `<span class="bad">${x.fehl.map(esc).join("; ")}</span>` : `<span class="ok">✓</span>`], ["Status", x => x.gebucht ? `<span class="ok">im Lager</span>` : `<span class="bad">gesperrt</span>`]],
  onSave: (x, neu) => {
    const P = DATA.baustoffe.produktionsarten.find(p => p.id === x.art);
    x.fehl = P.checks.filter(c => !(x.checks || []).includes(c)).map(c => DATA.baustoffe.checks[c].de);
    if (x.fehl.length) { alert("Nicht eingelagert – fehlende Prüfungen:\n• " + x.fehl.join("\n• ") + (P.id === "steinbruch" ? "\n\nBeschädigte Altarsteine werden begraben, nicht ausgelöst (Rambam Beit HaBechira 1:15)." : "")); return; }
    if (!x.gebucht) {
      lagerBuchen(P.lager, Number(x.menge) || 0, `Herstellung: ${P.de}`, x.datum);
      if (x.rohstoff && x.rohMenge) lagerBuchen(x.rohstoff, -Number(x.rohMenge), `Verbrauch für ${P.de}`, x.datum);
      if (neu && x.kosten && x.fonds) buchen(x.fonds, "aus", x.kosten, `Herstellung ${P.de}`, "PRD", x.datum);
      x.gebucht = true;
    }
  }
};
const ARBEITER = [["kohanim", "1. Kohanim (tahor, ohne Mum)"], ["leviim", "2. Levi'im"], ["yisraelim", "3. Yisraelim"], ["teme_im", "4. Teme'im (nur wenn keine Tehorim)"], ["baalei_mum", "5. Ba'alei Mumim (nur wenn keine Temimim)"]];
REG.bauprojekte = {
  titel: "Bauprojekt / Instandsetzung",
  felder: [
    { n: "datum", l: "Beginn", t: "date", def: todayISO },
    { n: "ende", l: "Geplantes Ende", t: "date" },
    { n: "objekt", l: "Objekt", t: "select", opts: () => [...new Set([...DATA.reinigungsplan.map(r => r.objekt), ...DATA.bau.lishkot.map(l => l.n), "Kevesh", "Chomot / Mauern", "Sha'arim / Tore", "Azara-Pflaster", "Ulam", "Sonstiges"])].map(o => [o, o]) },
    { n: "art", l: "Art", t: "select", opts: [["reparatur", "Instandsetzung"], ["neubau", "Neubau"], ["verschoenerung", "Verschönerung / Vergoldung (Mitzvat Aseh)"], ["austausch", "Austausch beschädigter Steine"]] },
    { n: "beschreibung", l: "Beschreibung", t: "textarea", req: true },
    { n: "arbeiter", l: "Arbeiter (Rangfolge)", t: "select", opts: ARBEITER },
    { n: "material", l: "Material", t: "select", opts: () => [["", "—"], ...DATA.lagerVorlage.filter(a => ["Baumaterial", "Reinigung & Werkzeug"].includes(a.kat)).map(a => [a.id, a.name])] },
    { n: "menge", l: "Materialmenge", t: "number" },
    { n: "eisen", l: "Eisenwerkzeug wird verwendet", t: "check" },
    { n: "status", l: "Status", t: "select", opts: [["geplant", "geplant"], ["in Arbeit", "in Arbeit"], ["erledigt", "erledigt"]] },
    { n: "kosten", l: "Kosten €", t: "number" },
    { n: "fonds", l: "Finanzierung", t: "select", opts: fondsOpts, def: "bedek" }
  ],
  hinweis: "Nur bei Tag, nicht an Schabbat/Yom Tov (Rambam Beit HaBechira 1:12). Arbeiter-Rangfolge: Eruvin 105a.",
  spalten: [["Beginn", x => fmtDate(x.datum)], ["Objekt", x => `<b>${esc(x.objekt)}</b>`], ["Art", x => esc(x.art)], ["Arbeiter", x => esc((ARBEITER.find(a => a[0] === x.arbeiter) || [])[1] || "")], ["Material", x => x.material ? `${fmtNum(x.menge || 0)} ${esc(lagerName(x.material))}` : ""], ["Status", x => esc(x.status)], ["Kosten", x => x.kosten ? fmtEUR(x.kosten) : ""]],
  rowClass: x => x.status !== "erledigt" && x.ende && dayNum(todayISO()) > dayNum(x.ende) ? "bad" : "",
  onSave: (x, neu) => {
    const w = [];
    const wd = dateOf(x.datum).getUTCDay(); if (wd === 6 || festInfo(x.datum).yomTov) w.push("Beginn an Schabbat/Yom Tov – Bau verboten (Rambam Beit HaBechira 1:12)");
    if (x.eisen && /Mizbe'ach|Kevesh/.test(x.objekt)) w.push("Eisen am Mizbe'ach / Kevesh verboten (Rambam Beit HaBechira 1:16)");
    if (x.objekt === "Kodesh HaKodashim") w.push("Kodesh HaKodashim: Arbeiter in Teivot herablassen (Middot 4:5)");
    if (/Mizbe'ach|Kevesh/.test(x.objekt) && x.material && !["avanim_shlemot", "sid", "mapa"].includes(x.material)) w.push("Mizbe'ach/Kevesh nur aus Avanim Shlemot (Rambam Beit HaBechira 1:13–14)");
    if (["teme_im", "baalei_mum"].includes(x.arbeiter)) w.push("Teme'im / Ba'alei Mumim nur, wenn keine Tehorim / Temimim verfügbar (Eruvin 105a)");
    if (w.length && !confirm("Hinweise:\n• " + w.join("\n• ") + "\n\nTrotzdem speichern?")) return false;
    if (x.status !== "geplant" && !x.matGebucht && x.material && x.menge) { lagerBuchen(x.material, -Number(x.menge), `Bauprojekt: ${x.objekt}`, x.datum); x.matGebucht = true; }
    if (x.status === "erledigt" && x.kosten && x.fonds && !x.gebucht) { buchen(x.fonds, "aus", x.kosten, `Bau: ${x.objekt}`, "BAU", x.datum); x.gebucht = true; }
  }
};

/* ---------------- Aktionen ---------------- */
Object.assign(ACT, {
  kliRein: el => { const x = STATE.kelimReg.find(y => y.id === el.dataset.id); x.gereinigt = todayISO(); if (x.zustand === "schmutzig") x.zustand = "ok"; STATE.reinigung.push({ id: uid(), datum: todayISO(), objekt: x.name, mittel: "Wasser heiß", menge: "", durch: "", notiz: "aus Kelim-Inventar" }); saveState(); render(); },
  kliTamei: el => { const x = STATE.kelimReg.find(y => y.id === el.dataset.id); x.zustand = "tamei"; STATE.taharaLog.push({ id: uid(), datum: todayISO(), art: "tevilat_kelim", betroffen: x.name, efer: 0, durch: "", ok: false, notiz: "Tevila ausstehend" }); saveState(); render(); },
  kliTahor: el => { const x = STATE.kelimReg.find(y => y.id === el.dataset.id); x.zustand = "ok"; STATE.taharaLog.push({ id: uid(), datum: todayISO(), art: "tevilat_kelim", betroffen: x.name, efer: 0, durch: "", ok: true, notiz: "Tevila erfolgt – Ha'arev Shemesh beachten" }); saveState(); render(); },
  kliDefekt: el => { const x = STATE.kelimReg.find(y => y.id === el.dataset.id); x.zustand = "defekt"; x.ort = "Werkstatt / Reparatur"; STATE.wartung.push({ id: uid(), datum: todayISO(), objekt: "Kelei Sharet", arbeit: `Reparatur/Ersatz: ${x.name}`, faellig: addDays(todayISO(), 7), status: "offen", fonds: "bedek" }); saveState(); render(); },
  kliSatzWechsel: () => {
    const aktiv = k => k.aktiv !== undefined ? k.aktiv : k.satz === "1";
    const gruppen = {};
    STATE.kelimReg.filter(k => k.typ === "sharet" && !/Mizbe'ach/.test(k.name)).forEach(k => (gruppen[k.name] = gruppen[k.name] || []).push(k));
    let n = 0; const fehlt = [];
    for (const [name, L] of Object.entries(gruppen)) {
      const cur = L.find(aktiv); if (!cur) continue;
      const naechster = L.filter(k => k !== cur && k.zustand === "ok").sort((a, b) => ((Number(a.satz) - Number(cur.satz) + 3) % 3) - ((Number(b.satz) - Number(cur.satz) + 3) % 3))[0];
      if (!naechster) { fehlt.push(name); continue; }
      cur.aktiv = false; cur.zustand = "tamei"; cur.ort = "Reserve (2./3. Satz)";
      naechster.aktiv = true; naechster.ort = "Lishkat HaKelim"; n++;
    }
    STATE.taharaLog.push({ id: uid(), datum: todayISO(), art: "tevilat_kelim", betroffen: `${n} Kelim nach dem Regel`, efer: 0, durch: "", ok: false, notiz: "Chagiga 3:8 – Satzwechsel" });
    saveState(); render();
    alert(`${n} Kelim gewechselt – der bisherige Satz ist zur Tevila markiert. Die Altäre sind ausgenommen (Chagiga 3:8).` + (fehlt.length ? `\n\nKein einsatzbereiter Ersatzsatz für:\n• ${fehlt.join("\n• ")}\n→ 2./3. Satz anlegen oder anschaffen.` : ""));
  },
  kliAusgabe: () => { STATE.kelimAusgabe.push({ datum: todayISO(), zeit: new Date().toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }), art: "Ausgabe", anzahl: 93 }); saveState(); render(); },
  kliRueckgabe: () => { const n = Number(prompt("Wie viele Kelim zurückgegeben?", "93")); if (!n) return; STATE.kelimAusgabe.push({ datum: todayISO(), zeit: new Date().toLocaleTimeString("de-AT", { hour: "2-digit", minute: "2-digit" }), art: "Rückgabe", anzahl: n }); if (n < 93) alert(`Fehlbestand: ${93 - n} Kelim – Amarkalim informieren!`); saveState(); render(); },
  kliStamm: () => {
    if (!confirm("Stammliste der Kelim (16 Einträge) als Inventar anlegen?")) return;
    DATA.kelim.stamm.forEach(s => STATE.kelimReg.push({ id: uid(), name: s.n, typ: s.n.startsWith("Kalpi") ? "chol" : "sharet", material: /Gold/.test(s.mat) ? "gold" : /Silber/.test(s.mat) ? "silber" : /Nechoshet|Kupfer/.test(s.mat) ? "nechoshet" : /Marmor/.test(s.mat) ? "marmor" : /Holz/.test(s.mat) ? "holz" : "silber", anzahl: 1, satz: "1", aktiv: true, ort: "Lishkat HaKelim", zustand: "ok", geweiht: false, gereinigt: "", verantwortlich: "", notiz: s.mekor }));
    saveState(); render();
  }
});

/* ---------------- Ansicht: Kelim & Reinigung ---------------- */
VIEWS.kelim = () => {
  ensure6();
  const sub = curSub("kelim", "inventar");
  const head = subtabs("kelim", [["inventar", "Kelim-Inventar"], ["ausgabe", "Tägliche Ausgabe (93)"], ["plan", "Reinigungsplan"], ["wer", "Wer macht was"], ["mittel", "Reinigungsmittel & Werkzeug"], ["protokoll", "Reinigungsprotokoll"], ["regeln", "Regeln & Stammliste"]]);
  if (sub === "ausgabe") {
    const heute = STATE.kelimAusgabe.filter(a => a.datum === todayISO());
    const aus = heute.filter(a => a.art === "Ausgabe").reduce((s, a) => s + a.anzahl, 0), zur = heute.filter(a => a.art === "Rückgabe").reduce((s, a) => s + a.anzahl, 0);
    return head + `<div class="grid g2">${card("Lishkat HaKelim – heute", `<div class="stat"><b>${aus}</b><span>ausgegeben</span></div><div class="stat"><b>${zur}</b><span>zurück</span></div>${aus && zur < aus ? `<p class="warn">${aus - zur} Kelim noch draußen</p>` : ""}
      <div class="actions"><button class="btn" data-act="kliAusgabe">93 Kelim ausgeben</button><button class="btn ghost" data-act="kliRueckgabe">Rückgabe erfassen</button></div>${mekor("Tamid 3:4")}`, "accent")}
      ${card("Protokoll", STATE.kelimAusgabe.length ? `<table class="tbl dense">${STATE.kelimAusgabe.slice(-30).reverse().map(a => `<tr><td>${fmtDate(a.datum)} ${a.zeit}</td><td>${a.art}</td><td class="r">${a.anzahl}</td></tr>`).join("")}</table>` : `<p class="muted">—</p>`)}</div>`;
  }
  if (sub === "plan") return head + card("Reinigungsplan", `<div class="scroll"><table class="tbl dense"><thead><tr><th>Objekt</th><th>Methode</th><th>Häufigkeit</th><th>Wer</th><th>Mekor</th></tr></thead><tbody>${DATA.reinigungsplan.map(r => `<tr><td><b>${esc(r.objekt)}</b></td><td>${esc(r.methode)}</td><td>${esc(r.frequenz)}</td><td>${esc(r.wer)}</td><td>${mekor(r.mekor)}</td></tr>`).join("")}</tbody></table></div>`);
  if (sub === "wer") return head + card("Zuständigkeiten – Reinigung, Kelim, Bau", `<table class="tbl dense"><thead><tr><th>Wer</th><th>Aufgaben</th><th>Mekor</th></tr></thead><tbody>${DATA.zustaendig.map(z => `<tr><td><b>${esc(z.rolle)}</b></td><td>${esc(z.aufgaben)}</td><td>${mekor(z.mekor)}</td></tr>`).join("")}</tbody></table>`);
  if (sub === "mittel") {
    const ids = ["mayim", "sabon", "borit", "neter", "sid", "mapa", "besen", "deliyim", "sedinim", "magrefa", "sulamot", "teivot", "kli_barzel"];
    return head + `<div class="grid g2">${card("Bestand Reinigungsmittel & Werkzeug", bestandTab(ids))}
      ${card("Herstellung & Lagerung", `<table class="tbl dense"><thead><tr><th>Mittel</th><th>Herstellung</th><th>Lagerung</th></tr></thead><tbody>
        <tr><td><b>Wasser</b></td><td>Ama von Ein Eitam; Brunnen in Lishkat HaGola ${mekor("Middot 3:2; 5:4; Yoma 31a")}</td><td>Kiyor, Zisternen (Nechunya) ${mekor("Shekalim 5:1")}</td></tr>
        <tr><td><b>Seife</b></td><td>Öl + Borit-Lauge – Modul Körperpflege</td><td>trocken, getrennt von Borit Karshina der Ketoret</td></tr>
        <tr><td><b>Sid (Kalk)</b></td><td>Kalkstein im Ofen brennen, löschen – Bauhof</td><td>trocken, außerhalb des Har HaBayit</td></tr>
        <tr><td><b>Mapa / Tücher</b></td><td>Weberei (Leinen)</td><td>Lishkat HaKelim</td></tr>
        <tr><td><b>Besen & Bürsten</b></td><td>Palmfasern binden (Handwerk)</td><td>Gerätekammer, Chulin</td></tr>
        <tr><td><b>Eisenwerkzeug</b></td><td>Schmiede außerhalb</td><td>Bauhof – nie am Altar ${mekor("Rambam Beit HaBechira 1:16")}</td></tr>
      </tbody></table><div class="actions"><button class="btn ghost" data-act="go" data-v="bauhof">→ Herstellung im Bauhof</button></div>`)}</div>`;
  }
  if (sub === "protokoll") return head + card("Reinigungs- & Wäscheprotokoll", `<div class="row">${regNeuBtn("reinigung")}${csvBtn("reinigung")}</div>${regTable("reinigung")}`);
  if (sub === "regeln") return head + `<div class="grid g2">${card("Regeln für Kelim", liste(DATA.kelim.regeln))}${card("Stammliste der Kelim", `<table class="tbl dense">${DATA.kelim.stamm.map(s => `<tr><td><b>${esc(s.n)}</b></td><td>${esc(s.mat)}</td><td>${mekor(s.mekor)}</td></tr>`).join("")}</table><div class="actions"><button class="btn ghost" data-act="kliStamm">Als Inventar anlegen</button></div>`)}</div>`;
  const K = STATE.kelimReg, prob = K.filter(k => k.zustand !== "ok").length;
  return head + `<div class="grid g3">${card("Inventar", `<div class="stat"><b>${K.reduce((s, k) => s + (Number(k.anzahl) || 1), 0)}</b><span>Kelim (${K.length} Positionen)</span></div><div class="stat"><b>${prob}</b><span>nicht einsatzbereit</span></div>`, "accent")}
    ${card("Nach dem Regel", `<p>Satzwechsel: 1. Satz zur Tevila, 2. Satz in Gebrauch ${mekor("Chagiga 3:8")}</p><div class="actions"><button class="btn" data-act="kliSatzWechsel">Satzwechsel durchführen</button></div>`)}
    ${card("Schnellstart", K.length ? `<p class="ok">Inventar angelegt.</p>` : `<p>Noch kein Inventar.</p><div class="actions"><button class="btn" data-act="kliStamm">Stammliste übernehmen</button></div>`)}</div>
    ${card("Kelim", `<div class="row">${regNeuBtn("kelimReg", "+ Kli")}${csvBtn("kelimReg")}</div>${regTable("kelimReg", null, x => `<button class="btn sm" data-act="kliRein" data-id="${x.id}" title="gereinigt">✓ rein</button>${x.zustand === "tamei" ? `<button class="btn sm" data-act="kliTahor" data-id="${x.id}">Tevila ✓</button>` : `<button class="btn sm ghost" data-act="kliTamei" data-id="${x.id}">tamei</button>`}${x.zustand !== "defekt" ? `<button class="btn sm ghost" data-act="kliDefekt" data-id="${x.id}">defekt</button>` : ""}`)}`)}`;
};

/* ---------------- Ansicht: Baumaterial & Bauhof ---------------- */
VIEWS.bauhof = () => {
  ensure6();
  const sub = curSub("bauhof", "material");
  const head = subtabs("bauhof", [["material", "Baumaterial & Lager"], ["produktion", "Herstellung"], ["projekte", "Bauprojekte & Instandsetzung"], ["wer", "Wer baut"], ["regeln", "Bauregeln"]]);
  if (sub === "produktion") return head + `<div class="grid g2">${card("Produktionsarten & Pflichtprüfungen", `<table class="tbl dense">${DATA.baustoffe.produktionsarten.map(p => `<tr><td><b>${esc(p.de)}</b></td><td>${p.checks.map(c => esc(DATA.baustoffe.checks[c].de)).join("; ") || "—"}</td></tr>`).join("")}</table>`)}
    ${card("Ablauf", `<ol><li>Rohstoff aus dem Lager wählen</li><li>Herstellung außerhalb des Har HaBayit</li><li>Pflichtprüfungen bestätigen</li><li>Einlagerung – nur bei vollständiger Prüfung</li><li>Hekdesh erst nach Fertigstellung ${mekor("Me'ila 14a")}</li></ol>`)}</div>
    ${card("Herstellungsregister", `<div class="row">${regNeuBtn("produktion", "+ Herstellung")}${csvBtn("produktion")}</div>${regTable("produktion")}`)}`;
  if (sub === "projekte") {
    const offen = STATE.bauprojekte.filter(p => p.status !== "erledigt");
    return head + `<div class="grid g2">${card(`Laufende Projekte (${offen.length})`, offen.length ? `<ul class="list">${offen.map(p => `<li><b>${esc(p.objekt)}</b>: ${esc(p.beschreibung)} – ${esc(p.status)}</li>`).join("")}</ul>` : `<p class="muted">Keine laufenden Projekte.</p>`, "accent")}
      ${card("Laufende Wartung", `<p>Wiederkehrende Arbeiten (Sid, Parochet, Kelim) im Modul Bauwerk & Lishkot.</p><div class="actions"><button class="btn ghost" data-act="go" data-v="bau">→ Instandhaltung</button></div>`)}</div>
      ${card("Projektregister", `<div class="row">${regNeuBtn("bauprojekte", "+ Projekt")}${csvBtn("bauprojekte")}</div>${regTable("bauprojekte")}`)}`;
  }
  if (sub === "wer") return head + card("Wer baut – Rangfolge", `<ol>${ARBEITER.map(a => `<li>${esc(a[1].replace(/^\d\. /, ""))}</li>`).join("")}</ol>${mekor("Eruvin 105a")}<p>Alle sind verpflichtet zu bauen und zu unterstützen, Männer und Frauen ${mekor("Rambam Beit HaBechira 1:12")}.</p>
    <table class="tbl dense">${DATA.zustaendig.map(z => `<tr><td><b>${esc(z.rolle)}</b></td><td>${esc(z.aufgaben)}</td><td>${mekor(z.mekor)}</td></tr>`).join("")}</table>`);
  if (sub === "regeln") return head + card("Bauregeln", liste(DATA.baustoffe.regeln));
  const ids = DATA.lagerVorlage.filter(a => a.kat === "Baumaterial").map(a => a.id);
  return head + `<div class="grid g2">${card("Baumaterial", bestandTab(ids))}
    ${card("Lagerorte", `<table class="tbl dense"><thead><tr><th>Ort</th><th>Was</th><th>Mekor</th></tr></thead><tbody>${DATA.baustoffe.lagerorte.map(l => `<tr><td><b>${esc(l.ort)}</b></td><td>${esc(l.was)}</td><td>${mekor(l.mekor)}</td></tr>`).join("")}</tbody></table>`)}</div>`;
};

/* ---------------- Demo ---------------- */
demoState = (orig => () => {
  const s = orig(); Object.assign(s, JSON.parse(JSON.stringify(STATE_DEFAULTS_6)));
  const B = { mapa: 12, besen: 40, deliyim: 50, magrefa: 2, sulamot: 12, teivot: 2, kli_barzel: 25, avanim_shlemot: 30, avanim_gazit: 120, levenim: 0, sid: 25, shayish: 6, avanim_tovot: 0, zahav_ri: 800, kesef_roh: 3000, nechoshet: 40, bedil: 0, etz_bau: 15 };
  for (const id in B) s.lager[id] = { bestand: B[id], min: (DATA.lagerVorlage.find(a => a.id === id) || {}).min || 0, preis: 0 };
  DATA.kelim.stamm.slice(0, 8).forEach((k, i) => ["1", "2"].forEach(satz => s.kelimReg.push({ id: uid(), name: k.n, typ: "sharet", material: /Gold/.test(k.mat) ? "gold" : "silber", anzahl: i === 0 ? 24 : 2, satz, aktiv: satz === "1", ort: satz === "1" ? "Lishkat HaKelim" : "Reserve (2./3. Satz)", zustand: i === 3 && satz === "1" ? "schmutzig" : "ok", geweiht: true, gereinigt: addDays(todayISO(), -1), verantwortlich: "Demo", notiz: k.mekor })));
  s.bauprojekte.push({ id: uid(), datum: todayISO(), ende: addDays(todayISO(), 20), objekt: "Azara-Pflaster", art: "austausch", beschreibung: "Demo: gelockerte Platte ersetzen (Rambam Beit HaBechira 1:10)", arbeiter: "kohanim", material: "avanim_tovot", menge: 0, status: "geplant", fonds: "bedek" });
  return s;
})(demoState);
