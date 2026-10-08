/* =====================================================================
   module7.js – Werkzeuge & Schmiede · Metalle (Gold, Silber, Kupfer,
                Bronze, Eisen, Zinn) · Farben & Malerarbeiten
   ===================================================================== */
"use strict";

/* ---------------- Lagerartikel ---------------- */
DATA.lagerVorlage.push(
  { id: "barzel",    name: "Barzel (Roheisen)",              einheit: "kg", min: 50, kat: "Metalle", mekor: "Devarim 8:9 – nie am Mizbe'ach (Middot 3:4)" },
  { id: "pecham_etz", name: "Holzkohle (Schmiede)",          einheit: "Sack", min: 20, kat: "Metalle", mekor: "Handwerk – kein Mekor" },
  { id: "sikra",     name: "Sikra (rote Farbe / Rötel)",     einheit: "kg", min: 2, kat: "Farben", mekor: "Middot 3:1 (Chut HaSikra)" },
  { id: "mikchol",   name: "Pinsel & Kalkbürsten",           einheit: "Stk", min: 20, kat: "Farben", mekor: "Handwerk – kein Mekor" },
  { id: "moznayim",  name: "Moznayim (Waagen) & Gewichte",   einheit: "Satz", min: 3, kat: "Werkzeug", mekor: "Vayikra 19:36" },
  { id: "kav_midda", name: "Kav HaMidda & Kne HaMidda (Messschnur, Messrute)", einheit: "Satz", min: 4, kat: "Werkzeug", mekor: "Yechezkel 40:3" }
);

/* ---------------- Daten ---------------- */
DATA.werkzeuge = [
  /* Avoda & Shechita */
  { k: "avoda", n: "Sakin (Schlachtmesser)", mat: "Metall", zweck: "Shechita, Nitu'ach", wer: "Kohanim; Shechita auch durch Zarim gültig (Zevachim 3:1)", mekor: "Middot 4:7; Chulin 17b–18a" },
  { k: "avoda", n: "Ankalot (Eisenhaken an Säulen und Wänden)", mat: "Eisen", zweck: "Aufhängen zum Hafshet", wer: "Kohanim / Helfer", mekor: "Middot 3:5; Pesachim 5:9" },
  { k: "avoda", n: "Mizlagot (Fleischgabeln)", mat: "Kupfer/Bronze", zweck: "Glieder auf dem Altar wenden", wer: "Kohanim", mekor: "Shemot 27:3" },
  { k: "avoda", n: "Ya'im (Ascheschaufeln)", mat: "Kupfer/Bronze", zweck: "Deshen", wer: "Kohanim", mekor: "Shemot 27:3" },
  { k: "avoda", n: "Sirot (Aschetöpfe)", mat: "Kupfer/Bronze", zweck: "Deshen sammeln", wer: "Kohanim", mekor: "Shemot 27:3" },
  { k: "avoda", n: "Magrefa", mat: "Metall", zweck: "Schaufel; Signal zwischen Ulam und Altar", wer: "Kohanim", mekor: "Tamid 5:6" },
  /* Bau */
  { k: "bau", n: "Megera (Steinsäge)", mat: "Eisen", zweck: "Steine sägen – außerhalb", wer: "Umanim", mekor: "Melachim I 7:9" },
  { k: "bau", n: "Makevet (Hammer)", mat: "Eisen", zweck: "Steinbearbeitung – im Bau nicht zu hören", wer: "Umanim", mekor: "Melachim I 6:7" },
  { k: "bau", n: "Garzen / Kardom (Axt)", mat: "Eisen", zweck: "Holz", wer: "Umanim", mekor: "Melachim I 6:7; Devarim 19:5" },
  { k: "bau", n: "Ma'atzad (Meißel/Dechsel)", mat: "Eisen", zweck: "Holz- und Steinbearbeitung", wer: "Umanim", mekor: "Yeshayahu 44:12" },
  { k: "bau", n: "Maktzu'ot (Hobel)", mat: "Eisen", zweck: "Holz glätten", wer: "Umanim", mekor: "Yeshayahu 44:13" },
  { k: "bau", n: "Anach / Even HaBedil (Lot)", mat: "Zinn/Blei", zweck: "Senkrechte prüfen", wer: "Baumeister", mekor: "Amos 7:7–8; Zecharya 4:10" },
  { k: "bau", n: "Kav HaMidda / Kne HaMidda", mat: "Leinen / Rohr", zweck: "Messen", wer: "Baumeister", mekor: "Yechezkel 40:3" },
  { k: "bau", n: "Amah-Maßstab (Normal im Sha'ar Shushan)", mat: "Metall/Holz", zweck: "Eichung", wer: "Amarkalim", mekor: "Kelim 17:9; Pesachim 86a" },
  { k: "bau", n: "Teivot (Arbeitskästen)", mat: "Holz", zweck: "Arbeit im Kodesh HaKodashim", wer: "Umanim (Kohanim bevorzugt)", mekor: "Middot 4:5" },
  { k: "bau", n: "Shamir", mat: "—", zweck: "Steinschnitt ohne Eisen (Shlomo)", wer: "historisch – seit der Zerstörung nicht mehr vorhanden", mekor: "Sota 48b; Sota 9:12; Avot 5:6" },
  /* Instandsetzung & Malen */
  { k: "instand", n: "Mapa (Tuch für Sid am Altar)", mat: "Leinen", zweck: "Kalken ohne Eisen", wer: "Kohanim / Umanim", mekor: "Rambam Beit HaBechira 1:17" },
  { k: "instand", n: "Patish (Goldschlägerhammer)", mat: "Eisen", zweck: "Blattgold schlagen", wer: "Goldschmied", mekor: "Shemot 39:3" },
  { k: "malen", n: "Pinsel & Kalkbürsten", mat: "Tierhaar / Faser", zweck: "Sid, Sikra", wer: "Maler", mekor: "Handwerk" },
  { k: "malen", n: "Sikra-Gefäß & Schnur", mat: "Ton / Leinen", zweck: "Chut HaSikra am Altar", wer: "Kohanim / Umanim", mekor: "Middot 3:1" },
  /* Messen & Wiegen */
  { k: "messen", n: "Moznayim & Gewichte", mat: "Metall", zweck: "Shekalim, Gold, Silber, Ketoret", wer: "Gizbarim", mekor: "Vayikra 19:36; Shekalim 5:2" },
  { k: "messen", n: "Middot (2 trockene, 7 flüssige)", mat: "Metall", zweck: "Solet, Öl, Wein", wer: "Kohanim / Achiya al haNesachim", mekor: "Menachot 9:2" },
  /* Schmiede */
  { k: "schmiede", n: "Kur & Mashref (Schmelzofen, Tiegel)", mat: "Ton / Stein", zweck: "Schmelzen, Läutern", wer: "Charash", mekor: "Mishlei 17:3" },
  { k: "schmiede", n: "Mapuach (Blasebalg)", mat: "Leder / Holz", zweck: "Glut anfachen", wer: "Charash", mekor: "Yirmiyahu 6:29" },
  { k: "schmiede", n: "Patish (Schmiedehammer)", mat: "Eisen", zweck: "Schmieden", wer: "Charash", mekor: "Yeshayahu 41:7" },
  { k: "schmiede", n: "Melkachayim (Zange)", mat: "Eisen", zweck: "Glühendes Metall halten", wer: "Charash", mekor: "Yeshayahu 6:6; 44:12" },
  { k: "schmiede", n: "Sadan (Amboss)", mat: "Eisen", zweck: "Schmieden", wer: "Charash", mekor: "Handwerk" }
];
DATA.werkzeugKat = { avoda: "Avoda & Shechita", bau: "Bauen", instand: "Instandsetzung", malen: "Malen", messen: "Messen & Wiegen", schmiede: "Schmiede", reinigung: "Reinigung" };
DATA.werkzeugRegeln = [
  "Beim Bau des Hauses wurde kein Hammer, keine Axt, kein Eisenwerkzeug gehört – Steine wurden außerhalb fertig bearbeitet (Melachim I 6:7; Rambam Beit HaBechira 1:9).",
  "Eisen berührt weder Altar noch Kevesh; Sid nur mit einem Tuch (Middot 3:4; Rambam Beit HaBechira 1:16–17; Shemot 20:22).",
  "Das Schlachtmesser wird vor der Shechita auf Pegima geprüft und einem Chacham gezeigt (Chulin 17b–18a).",
  "Messer lagern in den Fächern des Beit HaChalifot (Middot 4:7).",
  "Eiserne Haken an Säulen und Wänden zum Häuten; am Erev Pesach zusätzlich Stäbe auf den Schultern (Middot 3:5; Pesachim 5:9).",
  "Werkzeuge und Material für das Mikdash werden aus Chulin gefertigt und erst danach geheiligt (Me'ila 14a).",
  "Umanim, die die Kohanim Shechita und Kemitza lehren, werden aus Terumat HaLishka bezahlt (Ketubot 106a).",
  "Der Shamir ist seit der Zerstörung nicht mehr vorhanden (Sota 9:12).",
  "Charash und Masger – Schmied und Schlosser – als eigener Berufsstand (Melachim II 24:14)."
];

DATA.metalle = [
  { id: "zahav", he: "זָהָב", de: "Gold", lager: "zahav_ri", verwendung: "Menorah, Shulchan, Mizbe'ach HaZahav, Kaporet, Tzitz, Goralot, Beschläge, Goldener Weinstock am Heichal", regeln: "7 Goldarten (Yoma 44b); Zahav Parvayim rot wie Blut des Par (Yoma 45a; Divrei HaYamim II 3:6); Spenden in Shofar 7 'Zahav laKaporet' (Shekalim 6:5); Überschuss → Riku'ei Zahav für das Kodesh HaKodashim (Shekalim 4:4); Weinstock: Blätter, Beeren, Trauben werden gespendet (Middot 3:8)", mekor: "Shemot 25; Yoma 44b–45a; Shekalim 4:4; Middot 3:8" },
  { id: "kesef", he: "כֶּסֶף", de: "Silber", lager: "kesef_roh", verwendung: "Chatzotzrot, Mizrakot, Machta (täglich), Shekalim", regeln: "Machta täglich aus Silber, am YK aus Gold (Yoma 4:4)", mekor: "Bamidbar 10:2; Yoma 4:4; Tamid 3:4" },
  { id: "nechoshet", he: "נְחֹשֶׁת", de: "Kupfer / Bronze", lager: "nechoshet", verwendung: "Kiyor & Mechona, Altargeräte (Sirot, Ya'im, Mizlagot), Sha'ar Nikanor, Tziltzal", regeln: "Sha'ar Nikanor blieb aus Kupfer wegen des Wunders, glänzte wie Gold (Yoma 38a; Middot 2:3); 'Nechoshet' umfasst Kupfer und Bronze", mekor: "Shemot 27:3; 30:18; Divrei HaYamim I 15:19" },
  { id: "barzel", he: "בַּרְזֶל", de: "Eisen", lager: "barzel", verwendung: "Werkzeug außerhalb, Haken im Beit HaMitbechayim", regeln: "Nie an Altar und Kevesh: 'Eisen verkürzt das Leben, der Altar verlängert es' (Middot 3:4); beim Bau nicht zu hören (Melachim I 6:7)", mekor: "Devarim 8:9; Middot 3:4–5" },
  { id: "bedil", he: "בְּדִיל", de: "Zinn", lager: "bedil", verwendung: "Kelei Sharet einer armen Gemeinde; Lot (Even HaBedil)", regeln: "Bei Armut Kelim aus Zinn (Rambam Beit HaBechira 1:20)", mekor: "Rambam Beit HaBechira 1:20; Zecharya 4:10" }
];
DATA.metallRegeln = [
  "Über öffentliches Geld und Gut nicht weniger als zwei Verantwortliche (Shekalim 5:2).",
  "Wer die Terumat HaLishka nimmt, trägt kein Gewand mit Säumen, keine Schuhe, keine Tefillin und kein Amulett – damit kein Verdacht entsteht (Shekalim 3:2).",
  "Gewichte und Waagen müssen ehrlich sein (Vayikra 19:36).",
  "Gold und Silber wird im Tiegel geläutert (Mishlei 17:3).",
  "Gespendete Kelim gehen in die Lishkat HaKelim; Unbrauchbares wird verkauft, der Erlös fließt an Bedek HaBayit (Shekalim 5:6)."
];

DATA.farben = [
  { id: "sid", de: "Sid (Kalk, weiß)", lager: "sid", verwendung: "Mizbe'ach 2× jährlich, Heichal 1× jährlich", mekor: "Middot 3:4" },
  { id: "sikra", de: "Sikra (Rot)", lager: "sikra", verwendung: "Chut HaSikra in der Mitte des Altars – Grenze zwischen oberem und unterem Blut", mekor: "Middot 3:1" },
  { id: "gold", de: "Vergoldung", lager: "zahav_ri", verwendung: "Heichal und Kodesh HaKodashim", mekor: "Melachim I 6:21–22; Shekalim 4:4; Rambam Beit HaBechira 1:11" },
  { id: "marmor", de: "Naturstein (Kochla & Marmara)", lager: "shayish", verwendung: "Wandflächen unverputzt – sieht aus wie Meereswellen", mekor: "Bava Batra 4a; Sukka 51b" }
];
DATA.farbRegeln = [
  "An den Wänden: Keruvim, Palmen und Blüten (Melachim I 6:29).",
  "Verboten: Darstellung von Sonne, Mond, Sternen und dem menschlichen Antlitz (Rosh HaShana 24a–b; Avoda Zara 43b; Shemot 20:20).",
  "Sid am Altar nur mit Tuch, nicht mit Eisen (Rambam Beit HaBechira 1:17).",
  "Verschönern ist Mitzvat Aseh; vergolden, wenn die Mittel reichen (Rambam Beit HaBechira 1:11).",
  "Gestaltung über das Überlieferte hinaus nur nach Psak des Beit Din."
];

/* ---------------- Navigation ---------------- */
NAV.splice(NAV.findIndex(n => n.id === "bau"), 0,
  { id: "werkzeug", de: "Werkzeug & Schmiede", he: "כלי אומנות ונפחייה", ico: "⚒" },
  { id: "metalle", de: "Metalle & Farben", he: "מתכות וצבעים", ico: "◆" }
);

/* ---------------- Zustand ---------------- */
const STATE_DEFAULTS_7 = { werkzeugReg: [], schmiede: [], metallbuch: [], farbProd: [], malerei: [] };
function ensure7() { for (const [k, v] of Object.entries(STATE_DEFAULTS_7)) if (STATE[k] === undefined) STATE[k] = JSON.parse(JSON.stringify(v)); }
const _render7 = render;
render = () => { ensure7(); _render7(); };
const metallLager = () => DATA.metalle.map(m => [m.lager, `${m.de} (${m.he})`]);

/* ---------------- Register ---------------- */
const WZ_MAT = { barzel: "Eisen", nechoshet: "Kupfer/Bronze", kesef: "Silber", zahav: "Gold", bedil: "Zinn/Blei", holz: "Holz", stein: "Stein/Ton", textil: "Leinen/Faser/Leder", "": "—" };
const WZ_ZUSTAND = { ok: "einsatzbereit", stumpf: "stumpf – schärfen", pegima: "Pegima – gesperrt", defekt: "defekt", aus: "ausgemustert" };
REG.werkzeugReg = {
  titel: "Werkzeug",
  felder: [
    { n: "name", l: "Bezeichnung", req: true },
    { n: "kat", l: "Kategorie", t: "select", opts: () => Object.entries(DATA.werkzeugKat) },
    { n: "material", l: "Material", t: "select", opts: [["barzel", "Eisen"], ["nechoshet", "Kupfer/Bronze"], ["kesef", "Silber"], ["zahav", "Gold"], ["bedil", "Zinn/Blei"], ["holz", "Holz"], ["stein", "Stein/Ton"], ["textil", "Leinen/Faser/Leder"]] },
    { n: "anzahl", l: "Anzahl", t: "number", def: 1 },
    { n: "ort", l: "Standort", t: "select", opts: [["Beit HaChalifot", "Beit HaChalifot (Messer)"], ["Beit HaMitbechayim", "Beit HaMitbechayim"], ["Lishkat HaKelim", "Lishkat HaKelim"], ["Bauhof (außerhalb)", "Bauhof (außerhalb)"], ["Schmiede (außerhalb)", "Schmiede (außerhalb)"], ["Werkstatt Goldschmied", "Werkstatt Goldschmied"], ["Lishkat HaShekalim", "Lishkat HaShekalim (Waagen)"]] },
    { n: "zustand", l: "Zustand", t: "select", opts: () => Object.entries(WZ_ZUSTAND) },
    { n: "geprueft", l: "Zuletzt geprüft", t: "date" },
    { n: "verantwortlich", l: "Verantwortlich" },
    { n: "notiz", l: "Notiz" }
  ],
  spalten: [["Werkzeug", x => `<b>${esc(x.name)}</b>`], ["Kategorie", x => esc(DATA.werkzeugKat[x.kat] || x.kat)], ["Material", x => esc(WZ_MAT[x.material] || x.material)], ["Anz.", x => esc(x.anzahl)], ["Standort", x => esc(x.ort)], ["Zustand", x => `<span class="${x.zustand === "ok" ? "ok" : "bad"}">${esc(WZ_ZUSTAND[x.zustand] || x.zustand)}</span>`], ["Geprüft", x => x.geprueft ? fmtDate(x.geprueft) : "—"]],
  rowClass: x => x.zustand !== "ok" && x.zustand !== "aus" ? "bad" : "",
  onSave: x => {
    if (x.material === "barzel" && /Mizbe|Kevesh|Altar/i.test(x.name + " " + x.notiz) && !confirm("Eisenwerkzeug am Mizbe'ach / Kevesh ist verboten (Middot 3:4). Trotzdem speichern?")) return false;
    if (x.material === "barzel" && x.kat === "bau" && !/außerhalb/.test(x.ort || "")) alert("Hinweis: Eisernes Bauwerkzeug gehört in den Bauhof außerhalb – Steine werden außerhalb bearbeitet (Rambam Beit HaBechira 1:9).");
  }
};
REG.schmiede = {
  titel: "Schmiede / Werkstatt – Fertigung",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "produkt", l: "Produkt", t: "select", opts: () => [...DATA.werkzeuge.filter(w => w.mat !== "—").map(w => [w.n, `${DATA.werkzeugKat[w.k]}: ${w.n}`]), ["Sonstiges", "Sonstiges"]] },
    { n: "stueck", l: "Stückzahl", t: "number", def: 1, req: true },
    { n: "metall", l: "Metall", t: "select", opts: () => [["", "— kein Metall —"], ...metallLager()] },
    { n: "metallMenge", l: "Metallverbrauch (Lager-Einheit)", t: "number" },
    { n: "kohle", l: "Holzkohle (Sack)", t: "number" },
    { n: "chutz", l: "Gefertigt außerhalb des Har HaBayit", t: "check", def: true },
    { n: "chulin", l: "Aus Chulin gefertigt (Hekdesh erst danach – Me'ila 14a)", t: "check", def: true },
    { n: "schmied", l: "Charash / Umanim" },
    { n: "kosten", l: "Lohn & Kosten €", t: "number" },
    { n: "fonds", l: "Fonds", t: "select", opts: fondsOpts, def: "bedek" },
    { n: "notiz", l: "Notiz" }
  ],
  hinweis: "Fertige Stücke werden automatisch ins Werkzeug-Inventar übernommen.",
  spalten: [["Datum", x => fmtDate(x.datum)], ["Produkt", x => `<b>${esc(x.produkt)}</b>`], ["Stück", x => esc(x.stueck)], ["Metall", x => x.metall ? `${fmtNum(x.metallMenge || 0)} ${esc(lagerName(x.metall))}` : "—"], ["Schmied", x => esc(x.schmied)], ["Prüfung", x => (x.chutz && x.chulin) ? `<span class="ok">✓</span>` : `<span class="bad">offen</span>`], ["Kosten", x => x.kosten ? fmtEUR(x.kosten) : ""]],
  onSave: (x, neu) => {
    const w = DATA.werkzeuge.find(w => w.n === x.produkt) || {};
    if (w.k === "avoda" && /Mizlag|Ya'im|Sirot/.test(x.produkt) && x.metall === "barzel") { alert("Altargeräte nicht aus Eisen – Kupfer/Bronze (Shemot 27:3)."); return false; }
    if (!x.chutz && !confirm("Fertigung innerhalb des Har HaBayit? Bearbeitung erfolgt außerhalb (Rambam Beit HaBechira 1:9). Trotzdem speichern?")) return false;
    if (!neu) return;
    if (x.metall && x.metallMenge) lagerBuchen(x.metall, -Number(x.metallMenge), `Schmiede: ${x.produkt}`, x.datum);
    if (x.kohle) lagerBuchen("pecham_etz", -Number(x.kohle), `Schmiede: ${x.produkt}`, x.datum);
    if (x.kosten && x.fonds) buchen(x.fonds, "aus", x.kosten, `Schmiede: ${x.produkt} × ${x.stueck}`, "SCH", x.datum);
    const matMap = { zahav_ri: "zahav", kesef_roh: "kesef", nechoshet: "nechoshet", barzel: "barzel", bedil: "bedil" };
    STATE.werkzeugReg.push({ id: uid(), name: x.produkt, kat: w.k || "instand", material: matMap[x.metall] || (w.mat && /Holz/.test(w.mat) ? "holz" : ""), anzahl: Number(x.stueck) || 1, ort: w.k === "avoda" ? (/Sakin/.test(x.produkt) ? "Beit HaChalifot" : "Lishkat HaKelim") : "Bauhof (außerhalb)", zustand: "ok", geprueft: x.datum, verantwortlich: x.schmied, notiz: `aus Schmiede ${fmtDate(x.datum)}` });
  }
};
REG.metallbuch = {
  titel: "Metallbuch – Edelmetall & Metall",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "metall", l: "Metall", t: "select", opts: metallLager },
    { n: "art", l: "Vorgang", t: "select", opts: [["spende", "Eingang: Spende (z. B. Shofar 7, Weinstock)"], ["kauf", "Eingang: Kauf"], ["laeuterung", "Läuterung (Verlust buchen)"], ["ausgabe", "Ausgabe an Werkstatt"], ["verkauf", "Verkauf unbrauchbarer Kelim (Shekalim 5:6)"]] },
    { n: "gewicht", l: "Gewicht (Lager-Einheit)", t: "number", req: true },
    { n: "reinheit", l: "Reinheit %", t: "number" },
    { n: "waage", l: "Waage geprüft (Vayikra 19:36)", t: "check" },
    { n: "zeugen", l: "Gizbarim / Zeugen (mind. 2, mit Komma getrennt)", req: true },
    { n: "betrag", l: "Betrag €", t: "number" },
    { n: "fonds", l: "Fonds", t: "select", opts: fondsOpts, def: "bedek" },
    { n: "zweck", l: "Zweck / Herkunft" }
  ],
  hinweis: "Shekalim 5:2 (mind. zwei); Shekalim 3:2 (keine Taschen beim Umgang mit Hekdesh-Gut).",
  spalten: [["Datum", x => fmtDate(x.datum)], ["Metall", x => esc(lagerName(x.metall))], ["Vorgang", x => esc(x.art)], ["Gewicht", x => `${fmtNum(x.gewicht)} ${lagerEinheit(x.metall)}`], ["Reinheit", x => x.reinheit ? x.reinheit + " %" : ""], ["Zeugen", x => esc(x.zeugen)], ["Betrag", x => x.betrag ? fmtEUR(x.betrag) : ""]],
  rowClass: x => String(x.zeugen || "").split(",").filter(s => s.trim()).length < 2 || !x.waage ? "bad" : "",
  onSave: (x, neu) => {
    if (String(x.zeugen).split(",").filter(s => s.trim()).length < 2 && !confirm("Weniger als zwei Verantwortliche (Shekalim 5:2). Trotzdem buchen?")) return false;
    if (!neu) return;
    const g = Number(x.gewicht) || 0, plus = ["spende", "kauf"].includes(x.art);
    lagerBuchen(x.metall, plus ? g : -g, `Metallbuch: ${x.art} – ${x.zweck || ""}`, x.datum);
    if (x.betrag && x.fonds) buchen(x.fonds, x.art === "kauf" ? "aus" : x.art === "verkauf" ? "ein" : x.art === "spende" ? "ein" : "aus", x.art === "spende" ? 0 : x.betrag, `Metallbuch ${x.art}: ${lagerName(x.metall)}`, "MET", x.datum);
  }
};
REG.farbProd = {
  titel: "Farbherstellung",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "farbe", l: "Farbe", t: "select", opts: () => DATA.farben.filter(f => ["sid", "sikra"].includes(f.id)).map(f => [f.id, f.de]) },
    { n: "rohstoff", l: "Rohstoff (z. B. Kalkstein, Rötel-Erde)" },
    { n: "menge", l: "Ertrag (Lager-Einheit)", t: "number", req: true },
    { n: "kohle", l: "Holzkohle (Sack, Kalkofen)", t: "number" },
    { n: "durch", l: "Hersteller" },
    { n: "notiz", l: "Notiz" }
  ],
  hinweis: "Herstellungsweise ist Handwerk ohne Mekor; die Verwendung ist in Middot 3:1 und 3:4 belegt.",
  spalten: [["Datum", x => fmtDate(x.datum)], ["Farbe", x => esc((DATA.farben.find(f => f.id === x.farbe) || {}).de)], ["Rohstoff", x => esc(x.rohstoff)], ["Ertrag", x => `${fmtNum(x.menge)} ${lagerEinheit(x.farbe)}`], ["Hersteller", x => esc(x.durch)]],
  onSave: (x, neu) => { if (!neu) return; lagerBuchen(x.farbe, Number(x.menge) || 0, `Farbherstellung ${x.farbe}`, x.datum); if (x.kohle) lagerBuchen("pecham_etz", -Number(x.kohle), "Kalkofen", x.datum); }
};
REG.malerei = {
  titel: "Malerarbeit / Vergoldung",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "objekt", l: "Objekt", t: "select", opts: () => [...new Set([...DATA.reinigungsplan.map(r => r.objekt), ...DATA.bau.lishkot.map(l => l.n), "Kevesh", "Chomot / Mauern", "Sha'arim / Tore", "Ulam", "Sonstiges"])].map(o => [o, o]) },
    { n: "farbe", l: "Farbe / Material", t: "select", opts: () => DATA.farben.map(f => [f.id, f.de]) },
    { n: "menge", l: "Verbrauch (Lager-Einheit)", t: "number" },
    { n: "motiv", l: "Motiv / Gestaltung" },
    { n: "bildverbot", l: "Keine verbotenen Darstellungen (Gestirne, menschliches Antlitz) geprüft", t: "check" },
    { n: "eisen", l: "Mit Eisenwerkzeug am Altar gearbeitet", t: "check" },
    { n: "maler", l: "Maler / Umanim" },
    { n: "kosten", l: "Kosten €", t: "number" },
    { n: "fonds", l: "Fonds", t: "select", opts: fondsOpts, def: "bedek" }
  ],
  spalten: [["Datum", x => fmtDate(x.datum)], ["Objekt", x => `<b>${esc(x.objekt)}</b>`], ["Farbe", x => esc((DATA.farben.find(f => f.id === x.farbe) || {}).de)], ["Verbrauch", x => x.menge ? `${fmtNum(x.menge)} ${lagerEinheit((DATA.farben.find(f => f.id === x.farbe) || {}).lager)}` : ""], ["Motiv", x => esc(x.motiv)], ["Bildverbot", x => x.bildverbot ? `<span class="ok">✓</span>` : `<span class="bad">offen</span>`]],
  onSave: (x, neu) => {
    const w = [];
    if (x.eisen && /Mizbe/.test(x.objekt)) w.push("Eisen am Altar verboten; Sid nur mit Tuch (Rambam Beit HaBechira 1:16–17)");
    if (!x.bildverbot) w.push("Bildverbot nicht geprüft (Rosh HaShana 24b; Avoda Zara 43b)");
    if (x.motiv && !/keruv|palm|blüt|blume|ornament|weinstock/i.test(x.motiv)) w.push("Motiv über Keruvim, Palmen und Blüten hinaus (Melachim I 6:29) – Psak des Beit Din einholen");
    if (w.length && !confirm("Hinweise:\n• " + w.join("\n• ") + "\n\nTrotzdem speichern?")) return false;
    if (!neu) return;
    const f = DATA.farben.find(f => f.id === x.farbe);
    if (f && x.menge) lagerBuchen(f.lager, -Number(x.menge), `Malerarbeit: ${x.objekt}`, x.datum);
    if (x.kosten && x.fonds) buchen(x.fonds, "aus", x.kosten, `Malerarbeit: ${x.objekt}`, "MAL", x.datum);
  }
};

/* ---------------- Aktionen ---------------- */
Object.assign(ACT, {
  sakinPruef: el => {
    const x = STATE.werkzeugReg.find(y => y.id === el.dataset.id);
    const ok = confirm(`Bedikat HaSakin: ${x.name}\n\nKlinge und beide Seiten geprüft – keine Pegima?\n(OK = einwandfrei · Abbrechen = Pegima gefunden)`);
    x.geprueft = todayISO();
    if (ok) x.zustand = "ok";
    else { x.zustand = "pegima"; STATE.wartung.push({ id: uid(), datum: todayISO(), objekt: "Kelei Sharet", arbeit: `Messer schärfen / ersetzen: ${x.name}`, faellig: todayISO(), status: "offen", fonds: "bedek" }); }
    saveState(); render();
  },
  wzStatus: el => { const x = STATE.werkzeugReg.find(y => y.id === el.dataset.id); x.zustand = el.dataset.z; if (el.dataset.z === "defekt" || el.dataset.z === "stumpf") STATE.wartung.push({ id: uid(), datum: todayISO(), objekt: "Sonstiges", arbeit: `Werkzeug instandsetzen: ${x.name}`, faellig: addDays(todayISO(), 7), status: "offen", fonds: "bedek" }); saveState(); render(); },
  wzKatalog: () => {
    if (!confirm("Werkzeugkatalog (ohne Shamir) als Inventar anlegen?")) return;
    const matMap = m => /Eisen/.test(m) ? "barzel" : /Kupfer|Bronze/.test(m) ? "nechoshet" : /Gold/.test(m) ? "zahav" : /Silber/.test(m) ? "kesef" : /Zinn|Blei/.test(m) ? "bedil" : /Holz/.test(m) ? "holz" : /Ton|Stein/.test(m) ? "stein" : /Metall/.test(m) ? "nechoshet" : "textil";
    DATA.werkzeuge.filter(w => w.mat !== "—").forEach(w => STATE.werkzeugReg.push({ id: uid(), name: w.n, kat: w.k, material: matMap(w.mat), anzahl: w.k === "avoda" && /Sakin/.test(w.n) ? 12 : 2, ort: w.k === "avoda" ? (/Sakin/.test(w.n) ? "Beit HaChalifot" : /Ankalot/.test(w.n) ? "Beit HaMitbechayim" : "Lishkat HaKelim") : w.k === "schmiede" ? "Schmiede (außerhalb)" : w.k === "messen" ? "Lishkat HaShekalim" : "Bauhof (außerhalb)", zustand: "ok", geprueft: "", verantwortlich: "", notiz: w.mekor }));
    saveState(); render();
  }
});

/* ---------------- Ansicht: Werkzeug & Schmiede ---------------- */
VIEWS.werkzeug = () => {
  ensure7();
  const sub = curSub("werkzeug", "inventar");
  const head = subtabs("werkzeug", [["inventar", "Werkzeug-Inventar"], ["katalog", "Katalog"], ["schmiede", "Schmiede & Werkstatt"], ["regeln", "Regeln"]]);
  if (sub === "katalog") return head + Object.entries(DATA.werkzeugKat).filter(([k]) => DATA.werkzeuge.some(w => w.k === k)).map(([k, l]) => card(l, `<table class="tbl dense"><thead><tr><th>Werkzeug</th><th>Material</th><th>Zweck</th><th>Wer</th><th>Mekor</th></tr></thead><tbody>${DATA.werkzeuge.filter(w => w.k === k).map(w => `<tr><td><b>${esc(w.n)}</b></td><td>${esc(w.mat)}</td><td>${esc(w.zweck)}</td><td>${esc(w.wer)}</td><td>${mekor(w.mekor)}</td></tr>`).join("")}</tbody></table>`)).join("") + `<div class="actions"><button class="btn" data-act="wzKatalog">Katalog als Inventar anlegen</button></div>`;
  if (sub === "schmiede") return head + `<div class="grid g2">${card("Rohstoffe der Schmiede", bestandTab(["barzel", "nechoshet", "kesef_roh", "zahav_ri", "bedil", "pecham_etz"]))}
    ${card("Ablauf", `<ol><li>Metall ausgeben (Metallbuch, 2 Gizbarim)</li><li>Schmelzen und Läutern im Kur & Mashref ${mekor("Mishlei 17:3")}</li><li>Schmieden / Gießen außerhalb des Har HaBayit ${mekor("Rambam Beit HaBechira 1:9")}</li><li>Aus Chulin fertigen, danach heiligen ${mekor("Me'ila 14a")}</li><li>Übernahme ins Werkzeug-Inventar (automatisch)</li></ol>`)}</div>
    ${card("Fertigungsregister", `<div class="row">${regNeuBtn("schmiede", "+ Fertigung")}${csvBtn("schmiede")}</div>${regTable("schmiede")}`)}`;
  if (sub === "regeln") return head + card("Regeln für Werkzeuge", liste(DATA.werkzeugRegeln));
  const W = STATE.werkzeugReg, gesperrt = W.filter(w => !["ok", "aus"].includes(w.zustand)).length;
  const messer = W.filter(w => /Sakin/.test(w.name));
  const ungeprueft = messer.filter(m => m.geprueft !== todayISO()).length;
  return head + `<div class="grid g3">${card("Bestand", `<div class="stat"><b>${W.reduce((s, w) => s + (Number(w.anzahl) || 1), 0)}</b><span>Werkzeuge (${W.length} Positionen)</span></div><div class="stat"><b>${gesperrt}</b><span>nicht einsatzbereit</span></div>`, "accent")}
    ${card("Bedikat HaSakin heute", messer.length ? `<p>${ungeprueft ? `<span class="warn">${ungeprueft} Messer-Positionen heute ungeprüft</span>` : `<span class="ok">Alle Messer heute geprüft</span>`}</p>${mekor("Chulin 17b–18a")}` : `<p class="muted">Keine Messer erfasst.</p>`)}
    ${card("Schnellstart", W.length ? `<p class="ok">Inventar angelegt.</p>` : `<div class="actions"><button class="btn" data-act="wzKatalog">Katalog übernehmen</button></div>`)}</div>
    ${card("Werkzeuge", `<div class="row">${regNeuBtn("werkzeugReg", "+ Werkzeug")}${csvBtn("werkzeugReg")}</div>${regTable("werkzeugReg", null, x => `${/Sakin/.test(x.name) ? `<button class="btn sm" data-act="sakinPruef" data-id="${x.id}">Bedika</button>` : ""}${x.zustand !== "stumpf" ? `<button class="btn sm ghost" data-act="wzStatus" data-z="stumpf" data-id="${x.id}">stumpf</button>` : ""}${x.zustand !== "ok" ? `<button class="btn sm ghost" data-act="wzStatus" data-z="ok" data-id="${x.id}">instand ✓</button>` : `<button class="btn sm ghost" data-act="wzStatus" data-z="defekt" data-id="${x.id}">defekt</button>`}`)}`)}`;
};

/* ---------------- Ansicht: Metalle & Farben ---------------- */
VIEWS.metalle = () => {
  ensure7();
  const sub = curSub("metalle", "metalle");
  const head = subtabs("metalle", [["metalle", "Metalle"], ["buch", "Metallbuch"], ["farben", "Farben"], ["malerei", "Malerarbeiten & Vergoldung"]]);
  if (sub === "buch") return head + `<div class="grid g2">${card("Regeln", liste(DATA.metallRegeln))}${card("Bestand", bestandTab(DATA.metalle.map(m => m.lager)))}</div>
    ${card("Metallbuch", `<div class="row">${regNeuBtn("metallbuch", "+ Vorgang")}${csvBtn("metallbuch")}</div>${regTable("metallbuch")}`)}`;
  if (sub === "farben") return head + `<div class="grid g2">${card("Farben im Mikdash", `<table class="tbl dense"><thead><tr><th>Farbe</th><th>Verwendung</th><th>Mekor</th></tr></thead><tbody>${DATA.farben.map(f => `<tr><td><b>${esc(f.de)}</b></td><td>${esc(f.verwendung)}</td><td>${mekor(f.mekor)}</td></tr>`).join("")}</tbody></table>`)}
    ${card("Bestand", bestandTab(["sid", "sikra", "zahav_ri", "shayish", "mikchol", "mapa"]))}</div>
    ${card("Farbherstellung", `<div class="row">${regNeuBtn("farbProd", "+ Herstellung")}${csvBtn("farbProd")}</div>${regTable("farbProd")}`)}`;
  if (sub === "malerei") return head + card("Gestaltungsregeln", liste(DATA.farbRegeln)) + card("Malerarbeiten & Vergoldung", `<div class="row">${regNeuBtn("malerei", "+ Arbeit")}${csvBtn("malerei")}</div>${regTable("malerei")}`);
  return head + `<div class="grid g2">${DATA.metalle.map(m => card(`<span dir="rtl" class="he">${m.he}</span> ${esc(m.de)}`, `<p><b>Bestand:</b> ${fmtNum(STATE.lager[m.lager]?.bestand || 0)} ${lagerEinheit(m.lager)}</p><p><b>Verwendung:</b> ${esc(m.verwendung)}</p><p class="small">${esc(m.regeln)}</p>${mekor(m.mekor)}`)).join("")}</div>`;
};

/* ---------------- Demo ---------------- */
demoState = (orig => () => {
  const s = orig(); Object.assign(s, JSON.parse(JSON.stringify(STATE_DEFAULTS_7)));
  const B = { barzel: 120, pecham_etz: 30, sikra: 4, mikchol: 25, moznayim: 4, kav_midda: 4 };
  for (const id in B) s.lager[id] = { bestand: B[id], min: (DATA.lagerVorlage.find(a => a.id === id) || {}).min || 0, preis: 0 };
  [["Sakin (Schlachtmesser)", "avoda", "barzel", 12, "Beit HaChalifot"], ["Ankalot (Eisenhaken an Säulen und Wänden)", "avoda", "barzel", 24, "Beit HaMitbechayim"], ["Mizlagot (Fleischgabeln)", "avoda", "nechoshet", 4, "Lishkat HaKelim"], ["Makevet (Hammer)", "bau", "barzel", 10, "Bauhof (außerhalb)"], ["Moznayim & Gewichte", "messen", "nechoshet", 3, "Lishkat HaShekalim"]]
    .forEach(([name, kat, material, anzahl, ort]) => s.werkzeugReg.push({ id: uid(), name, kat, material, anzahl, ort, zustand: "ok", geprueft: "", verantwortlich: "Demo", notiz: "" }));
  s.metallbuch.push({ id: uid(), datum: todayISO(), metall: "zahav_ri", art: "spende", gewicht: 200, reinheit: 99, waage: true, zeugen: "Gizbar 1, Gizbar 2", betrag: 0, fonds: "", zweck: "Demo: Spende für den goldenen Weinstock (Middot 3:8)" });
  return s;
})(demoState);
