/* =====================================================================
   module4.js – Körperpflege & Hygiene · Seife · Waschutensilien · Schuhe
                Transport · Unterkunft · Dienstreisen
                Büros · Yuchsin · Archiv · Schreibmaterial, Tinte, Pergament
   ===================================================================== */
"use strict";

/* ---------------- Lagerartikel ---------------- */
DATA.lagerVorlage.push(
  { id: "borit",   name: "Borit (Laugenpflanze / Pottasche)", einheit: "kg", min: 10, kat: "Pflege & Reinigung", mekor: "Yirmiyahu 2:22; Malachi 3:2; Shabbat 90a" },
  { id: "neter",   name: "Neter (Natron)",               einheit: "kg", min: 5, kat: "Pflege & Reinigung", mekor: "Yirmiyahu 2:22; Nidda 9:6" },
  { id: "sabon",   name: "Seife (fertig)",               einheit: "Stk", min: 100, kat: "Pflege & Reinigung", mekor: "Eigenherstellung" },
  { id: "sedinim", name: "Sedinim / Tücher (Leinen)",    einheit: "Stk", min: 60, kat: "Pflege & Reinigung", mekor: "Yoma 3:4 (Sadin shel Butz beim KG)" },
  { id: "misparayim", name: "Scheren / Ta'ar (Rasiermesser)", einheit: "Stk", min: 6, kat: "Pflege & Reinigung", mekor: "Ta'anit 17a" },
  { id: "sandalim", name: "Sandalen (Dienstreisen / außerhalb Har HaBayit)", einheit: "Paar", min: 20, kat: "Pflege & Reinigung", mekor: "Berachot 9:5 (nicht auf den Har HaBayit)" },
  { id: "klaf",    name: "Klaf (Pergament)",             einheit: "Blatt", min: 50, kat: "Schreibmaterial", mekor: "Shabbat 79b; Rambam Tefillin 1:6–8" },
  { id: "gvil",    name: "Gvil (ungespaltene Haut)",     einheit: "Blatt", min: 10, kat: "Schreibmaterial", mekor: "Shabbat 79b; Bava Batra 14a" },
  { id: "dyo",     name: "Dyo (Tinte)",                  einheit: "Fl.", min: 10, kat: "Schreibmaterial", mekor: "Rambam Tefillin 1:4; Sota 2:4" },
  { id: "kulmus",  name: "Kulmus (Rohrfeder)",           einheit: "Stk", min: 30, kat: "Schreibmaterial", mekor: "Tradition der Sofrim" },
  { id: "afatzim", name: "Afatzim (Galläpfel)",          einheit: "kg", min: 5, kat: "Schreibmaterial", mekor: "Megilla 19a (Ibud)" },
  { id: "gidin",   name: "Gidin (Sehnenfäden)",          einheit: "Bund", min: 10, kat: "Schreibmaterial", mekor: "Megilla 19a; Gittin 45b" },
  { id: "pecham",  name: "Pecham (Ruß aus Ölrauch)",      einheit: "g", min: 200, kat: "Schreibmaterial", mekor: "Rambam Tefillin 1:4" },
  { id: "sraf",    name: "Sraf Ilanot (Baumharz / Gummi)", einheit: "g", min: 200, kat: "Schreibmaterial", mekor: "Rambam Tefillin 1:4" },
  { id: "papyrus", name: "Büro-Schreibmaterial (Tafeln, Papier)", einheit: "Pack", min: 10, kat: "Schreibmaterial", mekor: "Verwaltung – kein Kedusha-Erfordernis" },
  { id: "agalot",  name: "Agalot / Wagen",               einheit: "Stk", min: 4, kat: "Transport", mekor: "vgl. Bamidbar 7:3" },
  { id: "behemot_masa", name: "Lasttiere (Chulin)",      einheit: "Stk", min: 6, kat: "Transport", mekor: "Hekdesh-Tiere dürfen nicht arbeiten – Devarim 15:19; Me'ila" }
);

/* ---------------- Daten ---------------- */
DATA.pflege = {
  haar: [
    "Kohanim schneiden das Haar alle 30 Tage; Kohen Gadol jeden Erev Shabbat; König täglich (Ta'anit 17a; Sanhedrin 22b).",
    "Pru'a Rosh (Haar von 30 Tagen ungeschnitten) → Avoda verboten (Vayikra 10:6; Sanhedrin 22b; Rambam Bi'at HaMikdash 1:8–11).",
    "Anshei Mishmar und Anshei Ma'amad dürfen in ihrer Woche weder Haare schneiden noch waschen – am Donnerstag erlaubt wegen Kavod Shabbat (Ta'anit 2:7).",
    "Haarschnitt des KG: 'Tisporet Luliani' – Spitze jedes Haares neben der Wurzel des nächsten (Nedarim 51a; Sanhedrin 22b).",
    "Nazir: Haar wird unter dem Topf der Shelamim in Lishkat HaNezirim verbrannt (Middot 2:5; Bamidbar 6:18).",
    "Metzora rasiert den ganzen Körper (Vayikra 14:9); Levi'im bei der Einweihung (Bamidbar 8:7)."
  ],
  wein: [
    "Anshei Mishmar: Wein nachts erlaubt, tagsüber verboten; Anshei Beit Av weder Tag noch Nacht (Ta'anit 2:7).",
    "Revi'it Wein vor der Avoda → Chiyuv Mita (Vayikra 10:9; Keritot 13b)."
  ],
  koerper: [
    "Kiddush Yadayim veRaglayim aus dem Kiyor vor jeder Avoda (Shemot 30:19–21; Zevachim 19b).",
    "Tevila vor jedem Betreten der Azara zur Avoda (Yoma 3:3); Beit HaTevila unter dem Beit HaMoked mit Feuer zum Wärmen (Middot 1:9; Tamid 1:1).",
    "Beit HaKisei shel Kavod: verschließbar – verschlossen = besetzt (Tamid 1:1; Middot 1:9).",
    "Kohanim dienen barfuß – keine Chatzitza zwischen Fuß und Boden (Zevachim 24a); daher Darmleiden → Ben Achiya (Shekalim 5:1; Yerushalmi Shekalim 5:1).",
    "Kein Betreten des Har HaBayit mit Schuhen, Stock, Geldgürtel oder staubigen Füßen (Berachot 9:5).",
    "Nägel und Bart: Kohanim dürfen sich nicht kahl scheren noch den Bart rasieren (Vayikra 21:5)."
  ],
  seife: {
    rohstoffe: "Olivenöl (geringere Sorten: 3. Pressung / Ausschuss) + Lauge aus Borit-Asche (Salicornia/Salsola) oder Neter; optional Salz zum Aussalzen.",
    schritte: ["Borit-Pflanzen verbrennen, Asche sammeln", "Lauge ansetzen (Asche + Wasser, absetzen, abgießen)", "Öl erhitzen, Lauge einrühren (Verseifung)", "Aussalzen / Kochen bis zur Seifenleim-Konsistenz", "In Formen gießen, schneiden", "Reifen lassen (mehrere Wochen)", "Prüfung & Einlagerung"],
    verwendung: [
      "Persönliche Hygiene der Kohanim, Levi'im und Arbeiter außerhalb der Avoda.",
      "Wäsche von Alltagskleidung, Tüchern, Sedinim, Arbeitskleidung (nicht der Bigdei Kehuna – die werden nicht gewaschen, Rambam Klei HaMikdash 8:5).",
      "Reinigung von Werkstätten, Küchen (Lishkat HaNezirim) und Unterkünften.",
      "Borit Karshina gehört zur Ketoret – getrennt lagern (Keritot 6a)!",
      "Prüfsubstanzen für Flecken: Rok Tafel, Mei Grisin, Mei Raglayim, Neter, Borit, Kimonia, Ashlag (Nidda 9:6)."
    ],
    hinweis: "Die Herstellungsschritte sind traditionelles Handwerk ohne halachische Vorgabe; halachisch relevant sind nur Zweckbindung (Hekdesh-Öl?) und getrennte Lagerung."
  },
  waschen: [
    "Merika & Shtifa: Merika mit heißem Wasser, Shtifa mit kaltem (Zevachim 11:7; 97a).",
    "Kravayim in Lishkat HaMedichin (Middot 5:3); Reinigung des Azara-Bodens: Ama verschließen und überfluten (Pesachim 65a).",
    "Mizbe'ach: Sid 2× jährlich, Mapa (Middot 3:4); Kelim-Tevila nach dem Regel (Chagiga 3:8).",
    "Anshei Mishmar waschen ihre Kleider nicht in der Dienstwoche – außer Donnerstag (Ta'anit 2:7)."
  ]
};

DATA.logistik = {
  transport: [
    "15. Adar: Straßen und Wege werden instandgesetzt, Gräber markiert (Tziyun Kevarot – Schutz der Kohanim vor Tum'a) – Shekalim 1:1; Mo'ed Katan 5a.",
    "Hekdesh-Tiere und Bechor dürfen nicht zur Arbeit oder zum Transport benutzt werden (Devarim 15:19; Me'ila).",
    "Har HaBayit darf nicht als Abkürzung (Kapandarya) genutzt werden (Berachot 9:5).",
    "Bikkurim-Prozession: Ochse mit vergoldeten Hörnern voran (Bikkurim 3:3).",
    "Para Aduma: Kevesh über Kevesh vom Har HaBayit zum Har HaMishcha wegen Kever HaTehom (Para 3:6).",
    "Se'ir laAzazel: 10 Sukkot mit Speise und Wasser auf dem Weg (Yoma 6:4).",
    "Wasser für Nisuch HaMayim aus dem Shiloach (Sukka 4:9)."
  ],
  unterkunft: [
    "Beit HaMoked: Älteste des Beit Av schlafen dort mit den Schlüsseln, junge Kohanim jeder mit seiner Decke auf dem Boden (Tamid 1:1).",
    "Nie in Bigdei Kehuna schlafen – ausziehen, falten, unter den Kopf legen (Tamid 1:1; Yoma 69a).",
    "Kohen Gadol: 7 Tage in Lishkat Parhedrin vor Yom Kippur (Yoma 1:1).",
    "Häuser in Yerushalayim werden nicht vermietet; Gastgeber erhalten die Häute der Kodashim (Yoma 12a; Megilla 26a).",
    "'Niemand sagte: Es ist mir zu eng, in Yerushalayim zu übernachten' (Avot 5:5).",
    "Lina: Bikkurim-Bringer und Pilger übernachten in Yerushalayim (Bikkurim 2:4)."
  ],
  reisen: [
    "Ma'amad: Ein Teil reist nach Yerushalayim, der Rest liest in den Städten (Ta'anit 4:2).",
    "Shluchim des Beit Din zur Bekanntgabe des Neumonds: Nisan, Av, Elul, Tishrei, Kislev, Adar (Rosh HaShana 1:3).",
    "Kohanim auf Reisen: Tum'at Met meiden (Vayikra 21:1), markierte Gräber beachten (Shekalim 1:1).",
    "Einkaufsreisen für Solet, Öl, Wein zu Alfa-Orten (Menachot 8) – Modul Agrar."
  ],
  reiseZwecke: ["Shluchei Beit Din (Kiddush HaChodesh)", "Ma'amad nach Yerushalayim", "Einkauf Agrar (Menachot 8)", "Holztransport / Kurban Etzim", "Para Aduma / Mei Chatat", "Bikkurim-Begleitung", "Shekalim-Sammlung", "Sonstiges"]
};

DATA.buero = {
  aemter: [
    { amt: "Amarkalim (mind. 7)", f: "Verwaltung der Schlüssel und Schatzkammern", mekor: "Shekalim 5:2" },
    { amt: "Gizbarim (mind. 3)", f: "Kassenführung, Pidyon, Prüfung", mekor: "Shekalim 5:2" },
    { amt: "Memunim (15)", f: "Fachressorts", mekor: "Shekalim 5:1" },
    { amt: "Segan HaKohanim", f: "Stellvertreter des KG", mekor: "Yoma 39a; Tamid 7:3" },
    { amt: "Sanhedrin Gedola", f: "Lishkat HaGazit – Gericht, Yuchsin der Kohanim", mekor: "Middot 5:4" },
    { amt: "Magihei Sfarim", f: "Korrektoren der Sifrei Torah – aus Terumat HaLishka bezahlt", mekor: "Ketubot 106a" },
    { amt: "Sofer HaMikdash", f: "Megillat Sota, Protokolle, Register", mekor: "Sota 2:3–4" }
  ],
  yuchsin: [
    "Die Sanhedrin in Lishkat HaGazit prüft die Kehuna: wer pasul befunden wird, kleidet sich schwarz und geht; wer kasher, kleidet sich weiß und tritt ein (Middot 5:4).",
    "Kohen ohne Nachweis: Machloket über Chazaka und Aliya leYuchsin (Ketubot 24b; Kiddushin 4:5)."
  ],
  schrift: {
    klaf: [
      "Gvil (ganze Haut), Klaf (Fleischseite), Duchsustos (Haarseite) – Shabbat 79b; Rambam Tefillin 1:6–8.",
      "Nur von reinen Tieren (Shabbat 108a).",
      "Ibud mit Salz, Mehl und Afatzim – ohne Afatzim ist es Diftera (Megilla 19a).",
      "Für Stam: Ibud lishma (Gittin 54b; Rambam Tefillin 1:11).",
      "Nähen mit Gidin reiner Tiere (Megilla 19a).",
      "Sirtut (Linierung) erforderlich (Gittin 6b; Menachot 32b)."
    ],
    klafSchritte: ["Häute erhalten (rein, Herkunft geprüft)", "Einweichen in Wasser", "Kalken / Enthaaren", "Schaben & Spannen", "Ibud: Salz, Mehl, Afatzim (lishma)", "Trocknen auf Rahmen", "Glätten & Zuschneiden", "Prüfung"],
    dyo: [
      "Dyo aus Ruß von Öl (Pecham), mit Baumharz und etwas Honig, viel geknetet, zu Fladen getrocknet; zum Schreiben in Galläpfelsaft gelöst (Rambam Tefillin 1:4).",
      "Megillat Sota nur mit Dyo, nicht mit Kumos, Kankantom oder bleibender Farbe – sie muss auswaschbar sein (Sota 2:4; Bamidbar 5:23).",
      "Schwarz und haltbar (Shabbat 103b; Rambam Tefillin 1:4)."
    ],
    dyoSchritte: ["Öl verbrennen, Ruß (Pecham) auffangen", "Ruß mit Baumharz (Sraf) und etwas Honig mischen", "Lange kneten und stoßen", "Zu Fladen formen und trocknen", "Bei Bedarf in Galläpfelsaft lösen", "Probeschrift / Prüfung"],
    verwendung: [
      "Sefer HaAzara – Maßstab-Rolle im Mikdash (Kelim 15:6; Mo'ed Katan 18b).",
      "Megillat Sota (Sota 2:3–4).",
      "Kriat HaTorah des KG am YK (Yoma 7:1).",
      "Verwaltung: Shekalim-Listen, Chotamot, Quittungen, Protokolle – kein Kedusha-Erfordernis, normales Material."
    ]
  }
};

/* ---------------- Navigation ---------------- */
NAV.splice(NAV.findIndex(n => n.id === "sedarim"), 0,
  { id: "pflege",   de: "Körperpflege & Hygiene", he: "טהרת הגוף",       ico: "❖" },
  { id: "logistik", de: "Transport & Unterkunft", he: "דרכים ולינה",     ico: "⇆" },
  { id: "buero",    de: "Büro, Schrift & Archiv", he: "סופרים וגנזים",   ico: "✒" }
);

/* ---------------- Dienstfähigkeit erweitern: Pru'a Rosh ---------------- */
dienstfaehig = (orig => (p, iso = todayISO()) => {
  const r = orig(p, iso);
  const last = (STATE.haarschnitt || []).filter(h => h.person === p.id).map(h => h.datum).sort().pop();
  if (last && p.rolle && p.rolle.startsWith("kohen") && dayNum(iso) - dayNum(last) >= 30) { r.ok = false; r.gruende.push("Pru'a Rosh (≥ 30 Tage)"); }
  return r;
})(dienstfaehig);

/* ---------------- Register ---------------- */
const personOpts = (filter = () => true) => () => STATE.personal.filter(filter).map(p => [p.id, p.name]);
const personName = id => (STATE.personal.find(p => p.id === id) || {}).name || id || "";
REG.haarschnitt = {
  titel: "Haarschnitt",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "person", l: "Kohen / Levi", t: "select", opts: personOpts(p => p.rolle !== "yisrael") },
    { n: "durch", l: "Durchgeführt von" },
    { n: "notiz", l: "Notiz" }
  ],
  spalten: [["Datum", x => fmtDate(x.datum)], ["Person", x => `<span dir="auto">${esc(personName(x.person))}</span>`], ["Durch", x => esc(x.durch)]],
  onSave: x => {
    const p = STATE.personal.find(y => y.id === x.person), m = mishmarFor(x.datum), wd = dateOf(x.datum).getUTCDay();
    if (p && !m.regel && p.mishmar === m.idx && wd !== 4 && !confirm("Diese Person ist in ihrer Mishmar-Woche – Haarschneiden nur am Donnerstag erlaubt (Ta'anit 2:7). Trotzdem erfassen?")) return false;
  }
};
REG.seife = {
  titel: "Seifen-Charge",
  felder: [
    { n: "datum", l: "Ansatz", t: "date", def: todayISO },
    { n: "oel", l: "Öl eingesetzt (Log)", t: "number" },
    { n: "oelQuelle", l: "Öl-Herkunft", t: "select", opts: [["chulin", "Chulin-Öl (nicht aus Hekdesh)"], ["hekdesh", "Ausgesondertes Hekdesh-Öl (Pidyon nötig!)"]] },
    { n: "borit", l: "Borit / Neter (kg)", t: "number" },
    { n: "schritt", l: "Arbeitsschritt", t: "select", opts: () => DATA.pflege.seife.schritte.map(s => [s, s]) },
    { n: "stueck", l: "Ertrag (Stück)", t: "number" },
    { n: "notiz", l: "Notiz" }
  ],
  hinweis: "Öl aus Hekdesh darf ohne Pidyon nicht profan genutzt werden (Me'ila). Borit Karshina der Ketoret getrennt halten.",
  spalten: [["Datum", x => fmtDate(x.datum)], ["Öl", x => `${fmtNum(x.oel || 0)} Log (${x.oelQuelle === "hekdesh" ? "Hekdesh!" : "Chulin"})`], ["Borit", x => `${fmtNum(x.borit || 0)} kg`], ["Schritt", x => esc(x.schritt)], ["Ertrag", x => x.eingelagert ? `<span class="ok">${x.stueck} Stk im Lager</span>` : esc(x.stueck || "")]],
  onSave: (x, neu) => {
    if (x.oelQuelle === "hekdesh" && !confirm("Hekdesh-Öl: Ohne Pidyon ist profane Nutzung Me'ila. Pidyon erfolgt (Modul Hekdesh)?")) return false;
    if (neu && x.borit) lagerBuchen("borit", -Number(x.borit), "Seifenherstellung", x.datum);
  }
};
REG.reinigung = {
  titel: "Reinigung & Wäsche",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "objekt", l: "Objekt", t: "select", opts: [["Azara-Boden", "Azara-Boden (Ama)"], ["Kelim Merika/Shtifa", "Kelim – Merika & Shtifa"], ["Sedinim/Tücher", "Sedinim / Tücher"], ["Alltagskleidung", "Alltagskleidung"], ["Beit HaMoked", "Beit HaMoked / Unterkunft"], ["Beit HaKisei", "Beit HaKisei shel Kavod"], ["Küche/Lishkat HaNezirim", "Küche / Lishkat HaNezirim"], ["Lishkat HaMedichin", "Lishkat HaMedichin"]] },
    { n: "mittel", l: "Mittel", t: "select", opts: [["Wasser heiß", "Wasser heiß (Merika)"], ["Wasser kalt", "Wasser kalt (Shtifa)"], ["Seife", "Seife"], ["Borit/Neter", "Borit / Neter"]] },
    { n: "menge", l: "Seife verbraucht (Stk)", t: "number" },
    { n: "durch", l: "Durchgeführt von" },
    { n: "notiz", l: "Notiz" }
  ],
  hinweis: "Bigdei Kehuna werden nicht gewaschen (Rambam Klei HaMikdash 8:5). Anshei Mishmar waschen nur am Donnerstag (Ta'anit 2:7).",
  spalten: [["Datum", x => fmtDate(x.datum)], ["Objekt", x => esc(x.objekt)], ["Mittel", x => esc(x.mittel)], ["Seife", x => esc(x.menge || "")], ["Durch", x => esc(x.durch)]],
  onSave: (x, neu) => { if (neu && x.menge) lagerBuchen("sabon", -Number(x.menge), `Reinigung ${x.objekt}`, x.datum); }
};
REG.fahrten = {
  titel: "Transport / Fahrt",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "fahrzeug", l: "Fahrzeug / Tier", t: "select", opts: [["Agala", "Agala (Wagen)"], ["Lasttier", "Lasttier (Chulin)"], ["Träger", "Träger"], ["Sonstiges", "Sonstiges"]] },
    { n: "ladung", l: "Ladung" },
    { n: "von", l: "Von" }, { n: "nach", l: "Nach" },
    { n: "tahara", l: "Weg frei von Tum'at Met geprüft (für Kohanim)", t: "check" },
    { n: "kosten", l: "Kosten €", t: "number" },
    { n: "fonds", l: "Fonds", t: "select", opts: fondsOpts, def: "terumat_halishka" },
    { n: "notiz", l: "Notiz" }
  ],
  hinweis: "Keine Hekdesh-Tiere als Lasttiere (Devarim 15:19).",
  spalten: [["Datum", x => fmtDate(x.datum)], ["Fahrzeug", x => esc(x.fahrzeug)], ["Ladung", x => esc(x.ladung)], ["Route", x => `${esc(x.von)} → ${esc(x.nach)}`], ["Tahara", x => x.tahara ? "✓" : ""], ["Kosten", x => x.kosten ? fmtEUR(x.kosten) : ""]],
  onSave: (x, neu) => { if (neu && x.kosten && x.fonds) buchen(x.fonds, "aus", x.kosten, `Transport: ${x.ladung}`, "TR", x.datum); }
};
REG.unterkunft = {
  titel: "Unterkunft / Belegung",
  felder: [
    { n: "datum", l: "Von", t: "date", def: todayISO },
    { n: "bis", l: "Bis", t: "date", def: todayISO },
    { n: "ort", l: "Ort", t: "select", opts: [["Beit HaMoked", "Beit HaMoked (Kohanim des Beit Av)"], ["Lishkat Parhedrin", "Lishkat Parhedrin (KG)"], ["Gastgeber Yerushalayim", "Gastgeber in Yerushalayim"], ["Levi'im-Quartier", "Quartier der Levi'im"], ["Dienstreise", "Herberge auf Dienstreise"], ["Sukka am Weg", "Sukka am Weg (Yoma 6:4)"]] },
    { n: "person", l: "Person / Gruppe" },
    { n: "plaetze", l: "Plätze", t: "number", def: 1 },
    { n: "kosten", l: "Kosten €", t: "number" },
    { n: "fonds", l: "Fonds", t: "select", opts: fondsOpts, def: "" },
    { n: "notiz", l: "Notiz (z. B. Häute als Gastgeschenk)" }
  ],
  hinweis: "In Yerushalayim keine Miete – Gastgeber erhalten Häute der Kodashim (Yoma 12a).",
  spalten: [["Von", x => fmtDate(x.datum)], ["Bis", x => x.bis ? fmtDate(x.bis) : ""], ["Ort", x => esc(x.ort)], ["Person", x => `<span dir="auto">${esc(x.person)}</span>`], ["Plätze", x => esc(x.plaetze)], ["Kosten", x => x.kosten ? fmtEUR(x.kosten) : ""]],
  onSave: (x, neu) => {
    if (x.ort === "Gastgeber Yerushalayim" && x.kosten && !confirm("Häuser in Yerushalayim werden nicht vermietet (Yoma 12a). Kosten trotzdem buchen?")) return false;
    if (neu && x.kosten && x.fonds) buchen(x.fonds, "aus", x.kosten, `Unterkunft ${x.ort}: ${x.person}`, "UK", x.datum);
  }
};
REG.reisen = {
  titel: "Dienstreise",
  felder: [
    { n: "datum", l: "Abreise", t: "date", def: todayISO },
    { n: "rueckkehr", l: "Rückkehr", t: "date" },
    { n: "person", l: "Reisende(r)" },
    { n: "zweck", l: "Zweck", t: "select", opts: () => DATA.logistik.reiseZwecke.map(z => [z, z]) },
    { n: "ziel", l: "Ziel" },
    { n: "unterkunft", l: "Unterkunft unterwegs" },
    { n: "kohen", l: "Reisender ist Kohen (Tum'at Met beachten)", t: "check" },
    { n: "kosten", l: "Reisekosten €", t: "number" },
    { n: "fonds", l: "Fonds", t: "select", opts: fondsOpts, def: "terumat_halishka" },
    { n: "bericht", l: "Bericht", t: "textarea" }
  ],
  spalten: [["Abreise", x => fmtDate(x.datum)], ["Rückkehr", x => x.rueckkehr ? fmtDate(x.rueckkehr) : "offen"], ["Person", x => `<span dir="auto">${esc(x.person)}</span>`], ["Zweck", x => esc(x.zweck)], ["Ziel", x => esc(x.ziel)], ["Unterkunft", x => esc(x.unterkunft)], ["Kosten", x => x.kosten ? fmtEUR(x.kosten) : ""]],
  onSave: (x, neu) => { if (neu && x.kosten && x.fonds) buchen(x.fonds, "aus", x.kosten, `Dienstreise ${x.zweck}: ${x.person}`, "DR", x.datum); }
};
REG.yuchsin = {
  titel: "Bedikat Yuchsin (Lishkat HaGazit)",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "person", l: "Kohen", t: "select", opts: personOpts(p => p.rolle && p.rolle.startsWith("kohen")) },
    { n: "nachweis", l: "Nachweis (Zeugen, Chazaka, Dokumente)", t: "textarea" },
    { n: "ergebnis", l: "Ergebnis", t: "select", opts: [["offen", "offen"], ["kasher", "Kasher – Lavan (weiß)"], ["pasul", "Pasul – Shachor (schwarz)"]] },
    { n: "dayanim", l: "Dayanim" }
  ],
  spalten: [["Datum", x => fmtDate(x.datum)], ["Kohen", x => `<span dir="auto">${esc(personName(x.person))}</span>`], ["Ergebnis", x => x.ergebnis === "kasher" ? `<span class="ok">kasher</span>` : x.ergebnis === "pasul" ? `<span class="bad">pasul</span>` : "offen"], ["Dayanim", x => esc(x.dayanim)]],
  onSave: x => { const p = STATE.personal.find(y => y.id === x.person); if (p) p.gesperrt = x.ergebnis === "pasul" ? "Yuchsin pasul (Middot 5:4)" : x.ergebnis === "offen" ? (p.gesperrt || "") : (p.gesperrt === "Yuchsin pasul (Middot 5:4)" ? "" : p.gesperrt); }
};
REG.archiv = {
  titel: "Archiv / Dokument",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "art", l: "Art", t: "select", opts: [["Protokoll", "Protokoll"], ["Shtar Hekdesh", "Shtar Hekdesh"], ["Kabbala/Quittung", "Kabbala / Quittung"], ["Psak Beit Din", "Psak Beit Din"], ["Yuchsin", "Yuchsin-Urkunde"], ["Sefer", "Sefer / Megilla"], ["Brief", "Brief / Shluchim"]] },
    { n: "titel", l: "Titel", req: true },
    { n: "ort", l: "Ablage (Lishka / Regal)" },
    { n: "material", l: "Material", t: "select", opts: [["papier", "Büro-Material"], ["klaf", "Klaf"], ["gvil", "Gvil"]] },
    { n: "sofer", l: "Sofer / Verfasser" },
    { n: "notiz", l: "Notiz" }
  ],
  spalten: [["Datum", x => fmtDate(x.datum)], ["Art", x => esc(x.art)], ["Titel", x => esc(x.titel)], ["Ablage", x => esc(x.ort)], ["Material", x => esc(x.material)], ["Sofer", x => esc(x.sofer)]]
};
REG.klafCharge = {
  titel: "Pergament-Charge (Ibud)",
  felder: [
    { n: "datum", l: "Ansatz", t: "date", def: todayISO },
    { n: "haeute", l: "Häute (Stk)", t: "number", req: true },
    { n: "tier", l: "Tierart (nur rein)", t: "select", opts: [["keves", "Keves / Ez"], ["egel", "Egel"], ["ayil", "Ayil"], ["tamei", "Unreines Tier – PASUL"]] },
    { n: "art", l: "Produkt", t: "select", opts: [["klaf", "Klaf"], ["gvil", "Gvil"], ["duchsustos", "Duchsustos"]] },
    { n: "schritt", l: "Arbeitsschritt", t: "select", opts: () => DATA.buero.schrift.klafSchritte.map(s => [s, s]) },
    { n: "lishma", l: "Ibud lishma (für Stam / Sefer HaAzara)", t: "check" },
    { n: "afatzim", l: "Afatzim verbraucht (kg)", t: "number" },
    { n: "ertrag", l: "Ertrag (Blatt)", t: "number" },
    { n: "notiz", l: "Notiz" }
  ],
  hinweis: "Shabbat 79b, 108a; Megilla 19a; Gittin 54b. Häute aus Lishkat HaParva gehören den Kohanim – Ankauf erforderlich.",
  spalten: [["Datum", x => fmtDate(x.datum)], ["Häute", x => `${esc(x.haeute)} ${esc(x.tier)}`], ["Produkt", x => esc(x.art)], ["Schritt", x => esc(x.schritt)], ["Lishma", x => x.lishma ? "✓" : "—"], ["Ertrag", x => x.eingelagert ? `<span class="ok">${x.ertrag} im Lager</span>` : esc(x.ertrag || "")]],
  onSave: (x, neu) => {
    if (x.tier === "tamei") { alert("Pergament nur von reinen Tieren (Shabbat 108a)."); return false; }
    if (neu && x.afatzim) lagerBuchen("afatzim", -Number(x.afatzim), "Ibud", x.datum);
  }
};
REG.dyoCharge = {
  titel: "Tinten-Charge (Dyo)",
  felder: [
    { n: "datum", l: "Ansatz", t: "date", def: todayISO },
    { n: "pecham", l: "Pecham (g)", t: "number" },
    { n: "sraf", l: "Sraf (g)", t: "number" },
    { n: "schritt", l: "Arbeitsschritt", t: "select", opts: () => DATA.buero.schrift.dyoSchritte.map(s => [s, s]) },
    { n: "zweck", l: "Zweck", t: "select", opts: [["stam", "Stam / Sefer HaAzara"], ["sota", "Megillat Sota (auswaschbar, kein Kankantom!)"], ["buero", "Verwaltung"]] },
    { n: "ertrag", l: "Ertrag (Fl.)", t: "number" },
    { n: "notiz", l: "Notiz" }
  ],
  hinweis: "Rambam Tefillin 1:4; Sota 2:4",
  spalten: [["Datum", x => fmtDate(x.datum)], ["Pecham/Sraf", x => `${x.pecham || 0} g / ${x.sraf || 0} g`], ["Schritt", x => esc(x.schritt)], ["Zweck", x => esc(x.zweck)], ["Ertrag", x => x.eingelagert ? `<span class="ok">${x.ertrag} im Lager</span>` : esc(x.ertrag || "")]],
  onSave: (x, neu) => { if (neu) { if (x.pecham) lagerBuchen("pecham", -Number(x.pecham), "Dyo", x.datum); if (x.sraf) lagerBuchen("sraf", -Number(x.sraf), "Dyo", x.datum); } }
};
const STATE_DEFAULTS_4 = { haarschnitt: [], seife: [], reinigung: [], fahrten: [], unterkunft: [], reisen: [], yuchsin: [], archiv: [], klafCharge: [], dyoCharge: [] };
function ensure4() { for (const [k, v] of Object.entries(STATE_DEFAULTS_4)) if (STATE[k] === undefined) STATE[k] = JSON.parse(JSON.stringify(v)); }
const _render4 = render;
render = () => { ensure4(); _render4(); };

const einlagernBtn = (reg, lagerId, feld) => x => !x.eingelagert ? `<button class="btn sm" data-act="einlagern" data-reg="${reg}" data-lager="${lagerId(x)}" data-feld="${feld}" data-id="${x.id}">einlagern</button>` : "";
ACT.einlagern = el => {
  const x = STATE[el.dataset.reg].find(y => y.id === el.dataset.id), n = Number(x[el.dataset.feld]) || 0;
  if (!n) { alert("Bitte zuerst den Ertrag eintragen (✎)."); return; }
  if (el.dataset.reg === "klafCharge" && x.lishma === false && !confirm("Ohne Ibud lishma – nicht für Stam geeignet. Trotzdem einlagern?")) return;
  x.eingelagert = true; lagerBuchen(el.dataset.lager, n, `Eigenherstellung (${el.dataset.reg})`); saveState(); render();
};
const bestandTab = ids => `<table class="tbl dense">${ids.map(id => { const l = STATE.lager[id]; return `<tr class="${l.bestand < l.min ? "bad" : ""}"><td>${esc(lagerName(id))}<br>${mekor((DATA.lagerVorlage.find(a => a.id === id) || {}).mekor)}</td><td class="r">${fmtNum(l.bestand)} ${lagerEinheit(id)}</td><td class="nowrap"><button class="btn sm" data-act="lagerBuchung" data-id="${id}" data-r="zu">+</button><button class="btn sm ghost" data-act="lagerBuchung" data-id="${id}" data-r="ab">−</button></td></tr>`; }).join("")}</table>`;
const liste = arr => `<ul class="list">${arr.map(r => `<li>${esc(r)}</li>`).join("")}</ul>`;

/* ---------------- Ansicht: Körperpflege ---------------- */
VIEWS.pflege = () => {
  const sub = curSub("pflege", "haar");
  const head = subtabs("pflege", [["haar", "Haarschnitt & Pru'a Rosh"], ["koerper", "Körper, Wein & Schuhe"], ["seife", "Seife – Herstellung & Verwendung"], ["waschen", "Reinigung & Waschutensilien"]]);
  const t = todayISO(), wd = dateOf(t).getUTCDay(), m = mishmarFor(t);
  if (sub === "haar") {
    const kohanim = STATE.personal.filter(p => p.rolle && (p.rolle.startsWith("kohen") || p.rolle === "levi"));
    const rows = kohanim.map(p => {
      const last = STATE.haarschnitt.filter(h => h.person === p.id).map(h => h.datum).sort().pop();
      const kg = p.rolle === "kohen_gadol", tage = last ? dayNum(t) - dayNum(last) : null;
      const faellig = last ? (kg ? addDays(t, (5 - wd + 7) % 7) : addDays(last, 29)) : null;
      const status = tage == null ? "kein Eintrag" : p.rolle.startsWith("kohen") && tage >= 30 ? "PRU'A ROSH – gesperrt" : !kg && tage >= 25 ? "bald fällig" : "ok";
      const inWoche = !m.regel && p.mishmar === m.idx;
      return { p, last, tage, faellig, status, inWoche };
    }).sort((a, b) => (b.tage ?? -1) - (a.tage ?? -1));
    return head + `<div class="grid g2">${card("Regeln", liste(DATA.pflege.haar))}
      ${card("Heute", `<p>${wd === 4 ? `<span class="ok">Donnerstag: Anshei Mishmar dürfen Haare schneiden und waschen</span>` : `Anshei Mishmar (${m.regel ? "Regel" : m.tr}): Haarschnitt nur am Donnerstag ${mekor("Ta'anit 2:7")}`}</p>${wd === 5 ? `<p><b>Erev Shabbat:</b> Haarschnitt des Kohen Gadol ${mekor("Ta'anit 17a")}</p>` : ""}<div class="actions">${regNeuBtn("haarschnitt", "+ Haarschnitt")}</div>`, "accent")}</div>
      ${card("Übersicht", `<div class="scroll"><table class="tbl dense"><thead><tr><th>Name</th><th>Rolle</th><th>Letzter Schnitt</th><th class="r">Tage</th><th>Fällig</th><th>Status</th></tr></thead><tbody>${rows.map(r => `<tr class="${r.status.startsWith("PRU") ? "bad" : ""}"><td dir="auto">${esc(r.p.name)}</td><td>${esc(ROLLEN[r.p.rolle] || r.p.rolle)}${r.inWoche ? " · <b>Dienstwoche</b>" : ""}</td><td>${r.last ? fmtDate(r.last) : "—"}</td><td class="r">${r.tage ?? ""}</td><td>${r.faellig ? fmtDate(r.faellig) : ""}</td><td>${esc(r.status)}</td></tr>`).join("")}</tbody></table></div>`)}
      ${card("Protokoll", `${csvBtn("haarschnitt")}${regTable("haarschnitt")}`)}`;
  }
  if (sub === "koerper") return head + `<div class="grid g2">${card("Körperpflege & Tahara", liste(DATA.pflege.koerper))}${card("Wein & Nüchternheit", liste(DATA.pflege.wein))}</div>
    ${card("Schuhe & Ausrüstung", `<p>Kohanim und alle Besucher betreten den Har HaBayit ohne Schuhe ${mekor("Berachot 9:5")}; in der Azara dienen die Kohanim barfuß ${mekor("Zevachim 24a")}. Sandalen werden nur für Dienstreisen und außerhalb des Har HaBayit ausgegeben; die Ablage an den Toren ist eine organisatorische Einrichtung des Programms (kein Mekor).</p>${bestandTab(["sandalim", "sedinim", "misparayim"])}`)}`;
  if (sub === "seife") {
    const S = DATA.pflege.seife;
    return head + `<div class="grid g2">${card("Herstellung", `<p><b>Rohstoffe:</b> ${esc(S.rohstoffe)}</p><ol>${S.schritte.map(s => `<li>${esc(s)}</li>`).join("")}</ol><p class="muted small">${esc(S.hinweis)}</p>`)}
      ${card("Verwendung", liste(S.verwendung) + bestandTab(["sabon", "borit", "neter"]))}</div>
      ${card("Seifen-Chargen", `<div class="row">${regNeuBtn("seife", "+ Charge")}${csvBtn("seife")}</div>${regTable("seife", null, einlagernBtn("seife", () => "sabon", "stueck"))}`)}`;
  }
  return head + `<div class="grid g2">${card("Reinigung der Kelim und Räume", liste(DATA.pflege.waschen))}${card("Waschutensilien", bestandTab(["sabon", "borit", "neter", "sedinim", "mayim"]))}</div>
    ${card("Reinigungs- & Wäscheprotokoll", `<div class="row">${regNeuBtn("reinigung")}${csvBtn("reinigung")}</div>${regTable("reinigung")}`)}`;
};

/* ---------------- Ansicht: Logistik ---------------- */
VIEWS.logistik = () => {
  const sub = curSub("logistik", "transport");
  const head = subtabs("logistik", [["transport", "Transport"], ["unterkunft", "Unterkunft"], ["reisen", "Dienstreisen"]]);
  if (sub === "unterkunft") {
    const t = todayISO(), belegt = STATE.unterkunft.filter(u => dayNum(u.datum) <= dayNum(t) && dayNum(u.bis || u.datum) >= dayNum(t));
    const proOrt = {}; belegt.forEach(u => proOrt[u.ort] = (proOrt[u.ort] || 0) + (Number(u.plaetze) || 1));
    return head + `<div class="grid g2">${card("Regeln", liste(DATA.logistik.unterkunft))}${card("Heute belegt", Object.keys(proOrt).length ? `<table class="tbl dense">${Object.entries(proOrt).map(([o, n]) => `<tr><td>${esc(o)}</td><td class="r">${n}</td></tr>`).join("")}</table>` : `<p class="muted">Keine Belegung erfasst.</p>`, "accent")}</div>
      ${card("Belegungen", `<div class="row">${regNeuBtn("unterkunft", "+ Belegung")}${csvBtn("unterkunft")}</div>${regTable("unterkunft")}`)}`;
  }
  if (sub === "reisen") {
    const unterwegs = STATE.reisen.filter(r => !r.rueckkehr || dayNum(r.rueckkehr) >= dayNum(todayISO()));
    return head + `<div class="grid g2">${card("Regeln", liste(DATA.logistik.reisen))}${card(`Unterwegs (${unterwegs.length})`, unterwegs.length ? `<ul class="list">${unterwegs.map(r => `<li><b dir="auto">${esc(r.person)}</b> – ${esc(r.zweck)} → ${esc(r.ziel)}${r.kohen ? " · Kohen: Tum'at Met meiden" : ""}</li>`).join("")}</ul>` : `<p class="muted">Niemand unterwegs.</p>`, "accent")}</div>
      ${card("Reiseregister", `<div class="row">${regNeuBtn("reisen", "+ Dienstreise")}${csvBtn("reisen")}</div>${regTable("reisen")}`)}`;
  }
  return head + `<div class="grid g2">${card("Regeln", liste(DATA.logistik.transport))}${card("Fuhrpark", bestandTab(["agalot", "behemot_masa", "sandalim"]))}</div>
    ${card("Fahrtenbuch", `<div class="row">${regNeuBtn("fahrten", "+ Fahrt")}${csvBtn("fahrten")}</div>${regTable("fahrten")}`)}`;
};

/* ---------------- Ansicht: Büro ---------------- */
VIEWS.buero = () => {
  const sub = curSub("buero", "aemter");
  const head = subtabs("buero", [["aemter", "Ämter & Büros"], ["yuchsin", "Yuchsin"], ["archiv", "Archiv"], ["klaf", "Pergament"], ["dyo", "Tinte"], ["material", "Schreibmaterial"]]);
  const S = DATA.buero.schrift;
  if (sub === "yuchsin") return head + card("Bedikat Yuchsin", liste(DATA.buero.yuchsin) + `<div class="row">${regNeuBtn("yuchsin", "+ Prüfung")}${csvBtn("yuchsin")}</div>${regTable("yuchsin")}`);
  if (sub === "archiv") return head + card("Archiv & Dokumente", `<div class="row">${regNeuBtn("archiv", "+ Dokument")}${csvBtn("archiv")}</div>${regTable("archiv")}`);
  if (sub === "klaf") return head + `<div class="grid g2">${card("Regeln Klaf / Gvil", liste(S.klaf))}${card("Herstellungsschritte", `<ol>${S.klafSchritte.map(s => `<li>${esc(s)}</li>`).join("")}</ol>${bestandTab(["klaf", "gvil", "afatzim", "gidin"])}`)}</div>
    ${card("Pergament-Chargen", `<div class="row">${regNeuBtn("klafCharge", "+ Charge")}${csvBtn("klafCharge")}</div>${regTable("klafCharge", null, einlagernBtn("klafCharge", x => x.art === "gvil" ? "gvil" : "klaf", "ertrag"))}`)}`;
  if (sub === "dyo") return head + `<div class="grid g2">${card("Regeln Dyo", liste(S.dyo))}${card("Herstellungsschritte", `<ol>${S.dyoSchritte.map(s => `<li>${esc(s)}</li>`).join("")}</ol>${bestandTab(["dyo", "pecham", "sraf", "afatzim"])}`)}</div>
    ${card("Tinten-Chargen", `<div class="row">${regNeuBtn("dyoCharge", "+ Charge")}${csvBtn("dyoCharge")}</div>${regTable("dyoCharge", null, einlagernBtn("dyoCharge", () => "dyo", "ertrag"))}`)}`;
  if (sub === "material") return head + `<div class="grid g2">${card("Bestand Schreibmaterial", bestandTab(["klaf", "gvil", "dyo", "kulmus", "gidin", "afatzim", "pecham", "sraf", "papyrus"]))}${card("Verwendung im Mikdash", liste(S.verwendung))}</div>`;
  return head + card("Ämter & Büros", `<table class="tbl dense"><thead><tr><th>Amt</th><th>Aufgabe</th><th>Mekor</th></tr></thead><tbody>${DATA.buero.aemter.map(a => `<tr><td><b>${esc(a.amt)}</b></td><td>${esc(a.f)}</td><td>${mekor(a.mekor)}</td></tr>`).join("")}</tbody></table>`)
    + card("Büroräume (Lishkot)", `<table class="tbl dense">${DATA.bau.lishkot.filter(l => /Gazit|Shekalim|Chasha|Parhedrin|Pinchas/.test(l.n)).map(l => `<tr><td><b>${esc(l.n)}</b></td><td>${esc(l.f)}</td><td>${mekor(l.mekor)}</td></tr>`).join("")}</table>`);
};

/* ---------------- Demo ---------------- */
demoState = (orig => () => {
  const s = orig(); Object.assign(s, JSON.parse(JSON.stringify(STATE_DEFAULTS_4)));
  const B = { borit: 25, neter: 8, sabon: 240, sedinim: 80, misparayim: 8, sandalim: 30, klaf: 60, gvil: 12, dyo: 14, kulmus: 40, afatzim: 6, gidin: 12, pecham: 400, sraf: 300, papyrus: 20, agalot: 5, behemot_masa: 8 };
  for (const id in B) s.lager[id] = { bestand: B[id], min: (DATA.lagerVorlage.find(a => a.id === id) || {}).min || 0, preis: 0 };
  const t = todayISO();
  s.personal.filter(p => p.rolle === "kohen").slice(0, 30).forEach((p, i) => s.haarschnitt.push({ id: uid(), datum: addDays(t, -(i % 28)), person: p.id, durch: "Demo" }));
  s.reisen.push({ id: uid(), datum: t, rueckkehr: addDays(t, 3), person: "Shaliach Beit Din (Demo)", zweck: "Shluchei Beit Din (Kiddush HaChodesh)", ziel: "Galil", unterkunft: "Gastgeber", kohen: false, kosten: 0 });
  s.archiv.push({ id: uid(), datum: t, art: "Protokoll", titel: "Demo: Protokoll Payisot", ort: "Lishkat HaGazit", material: "papier", sofer: "Demo" });
  return s;
})(demoState);
