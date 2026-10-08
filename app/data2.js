/* =====================================================================
   data2.js – ERWEITERTE DATENBASIS
   Entsorgung/Deshen, Holz, Textil & Färberei, Achilat Kodashim,
   Matanot Kehuna, Bikkurim, Agrar (Getreide, Öl, Wein, Früchte),
   Hekdesh/Arachin, Wasser & Tahara, Bauwerk & Lishkot
   Jede Angabe mit מקור. "(prüfen)" = Quellenstelle vor Betrieb verifizieren.
   ===================================================================== */
"use strict";

/* ---------- Zusätzliche Lagerartikel ---------- */
DATA.lagerVorlage.push(
  { id: "chita",     name: "Chita (Weizen, ungemahlen)", einheit: "Se'a", min: 20, kat: "Agrar", mekor: "Alfa: Michmas & Zanoach – Menachot 8:1" },
  { id: "seorim",    name: "Se'orim (Gerste – Omer)",    einheit: "Se'a", min: 3, kat: "Agrar", mekor: "3 Se'a für das Omer – Menachot 10:3" },
  { id: "zeitim",    name: "Zeitim (Oliven)",            einheit: "Se'a", min: 0, kat: "Agrar", mekor: "Tekoa Alfa – Menachot 8:3" },
  { id: "tzemer",    name: "Tzemer (Rohwolle)",          einheit: "kg", min: 20, kat: "Textil", mekor: "Für Avnet, Me'il, Parochet" },
  { id: "techelet",  name: "Tzemer Techelet (gefärbt lishma)", einheit: "kg", min: 5, kat: "Textil", mekor: "Menachot 42b; Rambam Tzitzit 2:1–2" },
  { id: "argaman",   name: "Tzemer Argaman",             einheit: "kg", min: 5, kat: "Textil", mekor: "Rambam Klei HaMikdash 8:13" },
  { id: "shani",     name: "Tzemer Tola'at Shani",       einheit: "kg", min: 5, kat: "Textil", mekor: "Rambam Klei HaMikdash 8:13" },
  { id: "pishtan",   name: "Pishtan/Shesh (Leinengarn 6-fach)", einheit: "kg", min: 30, kat: "Textil", mekor: "'חוט כפול ששה' – Yoma 71b" },
  { id: "zahav_chut",name: "Zahav (Goldfaden)",          einheit: "g", min: 100, kat: "Textil", mekor: "Shemot 39:3; Yoma 72a" },
  { id: "chilazon",  name: "Chilazon-Farbstoff",         einheit: "g", min: 0, kat: "Textil", mekor: "Menachot 44a" },
  { id: "bigdei_kg", name: "Bigdei Zahav (Satz KG)",     einheit: "Satz", min: 1, kat: "Bigdei Kehuna", mekor: "Shemot 28" },
  { id: "bigdei_lavan", name: "Bigdei Lavan (Satz YK)",  einheit: "Satz", min: 2, kat: "Bigdei Kehuna", mekor: "Yoma 3:7 – je 1 Satz morgens/abends, danach Genizah" },
  { id: "parochet",  name: "Parochet",                   einheit: "Stk", min: 1, kat: "Textil", mekor: "2 pro Jahr – Shekalim 8:5" },
  { id: "kinor",     name: "Kinor",                      einheit: "Stk", min: 9, kat: "Kelei Shir", mekor: "Arachin 2:5" },
  { id: "nevel",     name: "Nevel",                      einheit: "Stk", min: 2, kat: "Kelei Shir", mekor: "Arachin 2:5" },
  { id: "chalil",    name: "Chalil (Schilfrohr)",        einheit: "Stk", min: 2, kat: "Kelei Shir", mekor: "Arachin 2:3; 10b" },
  { id: "tziltzal",  name: "Tziltzal",                   einheit: "Stk", min: 1, kat: "Kelei Shir", mekor: "Arachin 2:5" },
  { id: "chatzotzrot", name: "Chatzotzrot (Silber)",     einheit: "Stk", min: 2, kat: "Kelei Shir", mekor: "Bamidbar 10:2; Arachin 2:5" },
  { id: "shofar",    name: "Shofar",                     einheit: "Stk", min: 2, kat: "Kelei Shir", mekor: "Rosh HaShana 3:3–4" }
);

/* ---------- Entsorgung, Deshen & Sereifa ---------- */
DATA.entsorgung = {
  kategorien: [
    { id: "trumat_deshen", de: "Terumat HaDeshen (täglich, 1 Machta)", ort: "Östlich des Kevesh, 3 Tefachim vom Yesod – versinkt an Ort und Stelle", mekor: "Vayikra 6:3; Tamid 1:4; Me'ila 3:4 (nivla'in bimkoman)" },
    { id: "tapuach", de: "Tapuach (Aschehaufen auf dem Altar)", ort: "Mitte des Mizbe'ach; wenn voll: Hotza'a. An Regalim nicht geräumt (Noi laMizbe'ach)", mekor: "Tamid 2:2" },
    { id: "hotzaat_deshen", de: "Hotza'at HaDeshen (Abtransport)", ort: "Beit HaDeshen außerhalb der Stadt", mekor: "Vayikra 6:4; Tamid 2:2" },
    { id: "deshen_pnimi", de: "Dishun Mizbe'ach HaPnimi & Menorah", ort: "Neben dem Altar (östlich)", mekor: "Tamid 3:9; 6:1" },
    { id: "nisrafim", de: "Parim & Se'irim HaNisrafim (Kohen Mashiach, Edah, YK)", ort: "Beit HaDeshen außerhalb der drei Machanot", mekor: "Vayikra 4:12; 16:27; Zevachim 12:5–6" },
    { id: "sereifa_pasul", de: "Sereifa: Pigul, Notar, Tamei, Yotze", ort: "Beit HaSereifa in der Azara (wenn innen pasul geworden)", mekor: "Pesachim 82a; Zevachim 104b; Rambam Pesulei HaMukdashin 19" },
    { id: "notar", de: "Notar (Frist abgelaufen)", ort: "Sereifa bei Tag, nicht an Schabbat/Yom Tov", mekor: "Vayikra 7:17; Shabbat 24b; Pesachim 7:10" },
    { id: "dam", de: "Shiyarei HaDam (Blutreste)", ort: "Yesod → Ama → Nachal Kidron; an Gärtner als Dünger verkauft (Me'ila: Erlös an Hekdesh)", mekor: "Yoma 5:6; Me'ila 3:3; Middot 3:2" },
    { id: "orot", de: "Orot (Häute)", ort: "Gesalzen in Lishkat HaParva; Olah & Kodshei Kodashim an Kohanim der Mishmar, Kodashim Kalim an Besitzer", mekor: "Zevachim 12:2–3; Middot 5:3" },
    { id: "kravayim", de: "Kravayim / Pharsha (Darminhalt)", ort: "Lishkat HaMedichin – Waschen; Pharsha des Par HaNisraf mitverbrannt", mekor: "Middot 5:3; Vayikra 4:11–12" },
    { id: "kli_cheres", de: "Kli Cheres einer Chatat", ort: "Zerbrechen; Metallgefäß: Merika & Shtifa", mekor: "Vayikra 6:21; Zevachim 11:7" },
    { id: "begged_pekia", de: "Abgetragene Bigdei Kehuna (Hedyot)", ort: "Nicht waschen → Petilot (Dochte) für Simchat Beit HaSho'eva", mekor: "Sukka 5:3; Rambam Klei HaMikdash 8:5" },
    { id: "begged_genizah", de: "Bigdei Lavan / Bigdei KG", ort: "Genizah – Bigdei Lavan nur einmal getragen", mekor: "Vayikra 16:23; Yoma 60a; Rambam Klei HaMikdash 8:5" },
    { id: "avnei_mizbeach", de: "Beschädigte Altarsteine", ort: "Genizah (vgl. Lishka im Beit HaMoked – Steine der Chashmona'im)", mekor: "Middot 1:6; 3:4" },
    { id: "zevel", de: "Dung / sonstiger Abfall Har HaBayit", ort: "Aus der Stadt (Yerushalayim: keine Mistgruben)", mekor: "Bava Kama 82b (prüfen)" }
  ],
  orte: ["Tapuach (Mizbe'ach)", "Östlich des Kevesh", "Beit HaDeshen (außerhalb)", "Beit HaSereifa (Azara)", "Ama → Nachal Kidron", "Lishkat HaParva", "Lishkat HaMedichin", "Genizah", "Petilot / Pekia", "Außerhalb der Stadt"],
  regeln: [
    "Terumat HaDeshen ist Avoda (Bigdei Kehuna nötig); Hotza'at HaDeshen geschieht in 'Begadim Acherim' – geringere Kleider (Vayikra 6:4; Yoma 23b).",
    "Notar und Pigul werden bei Tag verbrannt, nicht nachts, nicht an Schabbat und Yom Tov (Shabbat 24b; Pesachim 7:10).",
    "Blutreste: Me'ila – wer sie ohne Bezahlung nutzt, begeht Me'ila; Erlös an Hekdesh (Yoma 5:6).",
    "Häute der Kodashim werden täglich unter dem Beit Av verteilt, am Schabbat unter der ganzen Mishmar (Zevachim 12; Tosefta Zevachim 11 – prüfen)."
  ]
};

/* ---------- Holz (Etzei HaMa'aracha) ---------- */
DATA.holz = {
  arten: [
    { id: "teena", de: "Te'ena (Feige) – bevorzugt", ok: true },
    { id: "egoz", de: "Egoz (Walnuss) – bevorzugt", ok: true },
    { id: "etz_shemen", de: "Etz Shemen – bevorzugt", ok: true },
    { id: "andere", de: "Anderes zulässiges Holz", ok: true },
    { id: "zayit", de: "Zayit (Olive) – PASUL", ok: false },
    { id: "gefen", de: "Gefen (Weinstock) – PASUL", ok: false }
  ],
  artenMekor: "Tamid 2:3 (außer Zayit und Gefen; üblich: Feige, Walnuss, Etz Shemen)",
  kurbanEtzim: [
    { m: "Nisan", d: 1,  he: "בְּנֵי אָרַח בֶּן יְהוּדָה" },
    { m: "Tamuz", d: 20, he: "בְּנֵי דָּוִד בֶּן יְהוּדָה" },
    { m: "Av", d: 5,  he: "בְּנֵי פַרְעֹשׁ בֶּן יְהוּדָה" },
    { m: "Av", d: 7,  he: "בְּנֵי יוֹנָדָב בֶּן רֵכָב" },
    { m: "Av", d: 10, he: "בְּנֵי סְנָאָה בֶּן בִּנְיָמִין" },
    { m: "Av", d: 15, he: "בְּנֵי זַתּוּא בֶּן יְהוּדָה – עִמָּהֶם כֹּהֲנִים, לְוִיִּם, כָּל מִי שֶׁטָּעָה בְשִׁבְטוֹ, בְּנֵי גּוֹנְבֵי עֱלִי, בְּנֵי קוֹצְעֵי קְצִיעוֹת" },
    { m: "Av", d: 20, he: "בְּנֵי פַחַת מוֹאָב בֶּן יְהוּדָה" },
    { m: "Elul", d: 20, he: "בְּנֵי עָדִין בֶּן יְהוּדָה" },
    { m: "Tevet", d: 1, he: "שָׁבוּ בְנֵי פַרְעֹשׁ שְׁנִיָּה" }
  ],
  kurbanEtzimMekor: "Ta'anit 4:5; Ta'anit 28a",
  regeln: [
    "Wurmiges Holz ist pasul; Prüfung durch Kohanim Ba'alei Mumim in Lishkat HaEtzim (Ezrat Nashim) – Middot 2:5.",
    "Ab 15. Av wird kein Holz mehr geschlagen – es trocknet nicht mehr ('יום תבר מגל') – Ta'anit 31a.",
    "Mit jedem Tamid: 2 Gezirei Etzim auf die Ma'aracha – Yoma 26b; Menachot 106b.",
    "Ma'arachot: Gedola, für Ketoret, Kiyum HaEsh; am YK eine weitere (Machloket) – Yoma 4:6; 45a.",
    "Kurban Etzim gilt als Korban – Mindestmaß 2 Gezirin (Menachot 106b)."
  ]
};

/* ---------- Textil, Wolle, Leinen, Färben ---------- */
DATA.textil = {
  artikel: [
    { id: "ketonet", de: "Ketonet (Hedyot)", material: "Shesh (Leinen 6-fach), Tashbetz-Gewebe, Ärmel separat gewebt", lager: "begged_ketonet", mekor: "Shemot 28:39; Yoma 72b; Rambam Klei HaMikdash 8:16–17" },
    { id: "michnasayim", de: "Michnasayim", material: "Shesh – von Hüfte bis Knie", lager: "begged_michnasayim", mekor: "Shemot 28:42; Rambam Klei HaMikdash 8:18" },
    { id: "migbaat", de: "Migba'at (Hedyot)", material: "Shesh – Länge 16 Amot", lager: "begged_migbaat", mekor: "Rambam Klei HaMikdash 8:19" },
    { id: "avnet", de: "Avnet", material: "Sha'atnez: Shesh + Techelet, Argaman, Tola'at Shani – Machloket für Hedyot (Yoma 6a/12b); Länge 32 Amot, Breite 3 Etzba'ot", lager: "begged_avnet", mekor: "Shemot 39:29; Rambam Klei HaMikdash 8:1–2, 19" },
    { id: "meil", de: "Me'il (KG)", material: "Kulo Techelet; Rimonim aus Techelet/Argaman/Shani, 72 goldene Pa'amonim", lager: "bigdei_kg", mekor: "Shemot 28:31–35; Zevachim 88b; Rambam Klei HaMikdash 9:3" },
    { id: "ephod", de: "Ephod (KG)", material: "Zahav, Techelet, Argaman, Tola'at Shani, Shesh – Faden 28-fach", lager: "bigdei_kg", mekor: "Shemot 28:6; Yoma 71b–72a" },
    { id: "choshen", de: "Choshen (KG)", material: "Wie Ephod; 12 Avanim", lager: "bigdei_kg", mekor: "Shemot 28:15–21; Yoma 73a" },
    { id: "mitznefet", de: "Mitznefet (KG)", material: "Shesh", lager: "bigdei_kg", mekor: "Shemot 28:39" },
    { id: "lavan", de: "Bigdei Lavan (YK)", material: "Pelusin (12 Maneh) morgens / Hindoyin (800 Zuz) abends – nur Bad (Leinen)", lager: "bigdei_lavan", mekor: "Vayikra 16:4; Yoma 3:7" },
    { id: "parochet", de: "Parochet", material: "Dicke 1 Tefach; 72 Nimin à 24 Fäden; 40 × 20 Amot; 4 Farben (Techelet, Argaman, Shani, Shesh)", lager: "parochet", mekor: "Shekalim 8:5; Shemot 26:31" }
  ],
  schritte: ["Einkauf / Schur", "Waschen", "Spinnen", "Zwirnen (Fadenzahl)", "Färben", "Weben", "Nähen / Fertigung", "Prüfung (Pasul-Kontrolle)", "Fertig"],
  farben: [
    { he: "תְּכֵלֶת", de: "Techelet", regel: "Aus dem Chilazon; Färben lishma; Prüfung echt/falsch (Kala Ilan)", mekor: "Menachot 42b–44a; Rambam Tzitzit 2:1–3" },
    { he: "אַרְגָּמָן", de: "Argaman", regel: "Wolle rot-purpur gefärbt", mekor: "Rambam Klei HaMikdash 8:13" },
    { he: "תּוֹלַעַת שָׁנִי", de: "Tola'at Shani", regel: "Wolle mit dem Wurm (Shani) gefärbt", mekor: "Rambam Klei HaMikdash 8:13; Para 3:10" },
    { he: "שֵׁשׁ", de: "Shesh", regel: "Leinen (Pishtan), Faden 6-fach gezwirnt", mekor: "Yoma 71b" },
    { he: "זָהָב", de: "Zahav", regel: "Gold zu dünnen Platten gehämmert, zu Fäden geschnitten", mekor: "Shemot 39:3" }
  ],
  regeln: [
    "Bigdei Kehuna werden aus Terumat HaLishka finanziert (Rambam Shekalim 4:1; Yerushalmi Shekalim 4:1).",
    "Sha'atnez nur dort, wo die Torah es vorschreibt (Avnet, Ephod/Choshen) – sonst Issur (Kil'ayim 9:1; Yoma 69a).",
    "Gewebt, nicht genäht (Ketonet) – Zevachim 88a; Ärmel separat gewebt und angenäht (Yoma 72b).",
    "Zerrissen, beschmutzt, zu lang/kurz → pasul (Zevachim 18b); schmutzige werden nicht gewaschen (Rambam Klei HaMikdash 8:5).",
    "Parochet: 2 pro Jahr; Tamei gewordene Parochet wird von 300 Kohanim getaucht (Shekalim 8:5).",
    "Weberinnen der Parochet werden aus Terumat HaLishka bezahlt (Ketubot 106a).",
    "Memunim: Elazar al haParochet, Pinchas al haMalbush (Shekalim 5:1)."
  ]
};

/* ---------- Achilat Kodashim (Zevachim 5) ---------- */
DATA.achila = {
  // frist: tagNacht | zweiTage | nachtPesach | keine
  regeln: {
    olah:      { frist: "keine", wer: "—", wo: "Kalil – ganz auf dem Altar; Haut an die Kohanim", mekor: "Zevachim 5:4; 12:2" },
    chatat:    { frist: "tagNacht", wer: "Zichrei Kehuna", wo: "Azara (lifnim min haKla'im)", mekor: "Zevachim 5:3" },
    asham:     { frist: "tagNacht", wer: "Zichrei Kehuna", wo: "Azara", mekor: "Zevachim 5:5" },
    todah:     { frist: "tagNacht", wer: "Jeder Tahor (4 der 40 Brote + Chaze veShok an Kohen)", wo: "Ganz Yerushalayim", mekor: "Zevachim 5:6; Menachot 7:2" },
    shelamim:  { frist: "zweiTage", wer: "Jeder Tahor; Chaze veShok an Kohanim, Frauen, Kinder, Sklaven", wo: "Ganz Yerushalayim", mekor: "Zevachim 5:7" },
    chagiga:   { frist: "zweiTage", wer: "wie Shelamim", wo: "Ganz Yerushalayim", mekor: "Zevachim 5:7" },
    simcha:    { frist: "zweiTage", wer: "wie Shelamim", wo: "Ganz Yerushalayim", mekor: "Zevachim 5:7" },
    bechor:    { frist: "zweiTage", wer: "Kohanim und ihre Familien", wo: "Ganz Yerushalayim", mekor: "Zevachim 5:8" },
    maaser:    { frist: "zweiTage", wer: "Jeder Tahor", wo: "Ganz Yerushalayim", mekor: "Zevachim 5:8" },
    pesach:    { frist: "nachtPesach", wer: "Nur Menuyim (Registrierte)", wo: "Ganz Yerushalayim, nur gebraten (Tzli)", mekor: "Zevachim 5:8; Pesachim 7" },
    mincha:    { frist: "tagNacht", wer: "Zichrei Kehuna (Shirayim)", wo: "Azara", mekor: "Vayikra 6:9; Zevachim 5:3 (Analogie) – prüfen" },
    kinim:     { frist: "tagNacht", wer: "Chatat HaOf: Zichrei Kehuna; Olat HaOf: Kalil", wo: "Azara", mekor: "Zevachim 6:4–5; Rambam Ma'ase HaKorbanot 10" },
    olat_reiya:{ frist: "keine", wer: "—", wo: "Kalil", mekor: "Chagiga 1:2" }
  },
  hinweise: [
    "Chatzot (Mitternacht) ist Seyag der Chachamim; Torah-Frist bis Alot HaShachar (Berachot 1:1; Zevachim 57b).",
    "Lechem HaPanim: Kohanim in der Azara am Schabbat (Vayikra 24:9; Menachot 11:7).",
    "Shtei HaLechem & Kivsei Atzeret: Zichrei Kehuna, Azara, Tag + Nacht (Zevachim 5:5).",
    "Kodashim werden 'למשחה' – in Gedolah-Art – gegessen: gebraten, mit Senf (Zevachim 91a; Chulin 132b – prüfen).",
    "Übermäßiges Fleischessen: Ben Achiya al Cholei Me'ayim (Shekalim 5:1; Yerushalmi Shekalim 5:1)."
  ]
};

/* ---------- 24 Matanot Kehuna (Chulin 133b; Bava Kama 110b) ---------- */
DATA.matanot = {
  mikdash: ["Chatat Behema", "Chatat HaOf", "Asham Vadai", "Asham Taluy", "Zivchei Shalmei Tzibur", "Log Shemen des Metzora", "Shtei HaLechem", "Lechem HaPanim", "Shirei Menachot", "Omer (Shirayim)"],
  yerushalayim: ["Bechor", "Bikkurim", "HaMuram min HaTodah ve'Eil Nazir", "Orot Kodashim"],
  gevulin: ["Teruma", "Terumat Ma'aser", "Challa", "Reishit HaGez", "Matanot (Zeroa, Lechayayim, Keiva)", "Pidyon HaBen", "Pidyon Petter Chamor", "Sde Achuza", "Sde Charamim", "Gezel HaGer"],
  mekor: "Chulin 133b; Bava Kama 110b; Rambam Bikkurim 1:1–6"
};

/* ---------- Bikkurim ---------- */
DATA.bikkurim = {
  minim: [
    { id: "chita", he: "חִטָּה", de: "Weizen" }, { id: "seora", he: "שְׂעוֹרָה", de: "Gerste" },
    { id: "gefen", he: "גֶּפֶן", de: "Trauben" }, { id: "teena", he: "תְּאֵנָה", de: "Feigen" },
    { id: "rimon", he: "רִמּוֹן", de: "Granatäpfel" }, { id: "zayit", he: "זֵית שֶׁמֶן", de: "Oliven" },
    { id: "tamar", he: "דְּבַשׁ (תְּמָרִים)", de: "Datteln" }
  ],
  regeln: [
    "Nur die 7 Minim, nur aus Eretz Yisrael (Ever HaYarden: Machloket) – Bikkurim 1:3, 1:10.",
    "Nicht vor Shavuot – Bikkurim 1:3; Shavuot bis Sukkot: bringen und lesen; Sukkot bis Chanukka: bringen, nicht lesen – Bikkurim 1:6.",
    "Auswahl am Feld: Schilfband, 'הרי אלו ביכורים' – Bikkurim 3:1.",
    "Prozession: Ma'amad sammelt sich, Ochse mit vergoldeten Hörnern und Olivenkranz, Chalil; ab Har HaBayit Levi'im: Tehillim 30 – Bikkurim 3:2–4.",
    "Mikra Bikkurim (Devarim 26:5–10), Tenufa, neben den Altar gelegt – Bikkurim 3:6.",
    "Gehören den Kohanim der Mishmar; Gold-/Silberkörbe zurück, Weidenkörbe an den Kohen – Bikkurim 3:8, 3:12.",
    "Pflichten: Korban (Shelamim), Shir, Tenufa, Lina in Yerushalayim – Bikkurim 2:4.",
    "Nicht lesen: Frau, Apotropos, Eved, Shaliach, Androginos – Bikkurim 1:5. Ger liest nach Yerushalmi / Rambam Bikkurim 4:3.",
    "Kein Shiur (Torah); Chachamim: 1/60 – Bikkurim 2:3; Pe'ah 1:1."
  ]
};

/* ---------- Agrar: Herkunft & Güte (Menachot 8) ---------- */
DATA.agrar = {
  artikel: {
    solet: { de: "Solet (Weizengrieß)", lager: "solet", einheit: "Isaron",
      orte: [{ n: "Michmas", g: "Alfa" }, { n: "Zanoach", g: "Alfa" }, { n: "Chafarayim (Bik'a)", g: "Sheniya" }],
      checks: ["tevel", "chadash", "orla_na", "kilayim"], mekor: "Menachot 8:1" },
    chita: { de: "Chita (Weizen)", lager: "chita", einheit: "Se'a",
      orte: [{ n: "Michmas", g: "Alfa" }, { n: "Zanoach", g: "Alfa" }, { n: "Chafarayim (Bik'a)", g: "Sheniya" }],
      checks: ["tevel", "chadash", "kilayim"], mekor: "Menachot 8:1" },
    seorim: { de: "Se'orim (Gerste für das Omer)", lager: "seorim", einheit: "Se'a",
      orte: [{ n: "Nahe Yerushalayim", g: "Alfa" }, { n: "Gagot Tzrifin", g: "Sheniya" }, { n: "Ein Socher", g: "Sheniya" }],
      checks: ["eretz", "chadash_omer", "tevel_omer"], mekor: "Menachot 10:2; 64b; 8:1 (Omer nur aus Eretz & Chadash)" },
    shemen: { de: "Shemen (Öl für Menachot)", lager: "shemen", einheit: "Log",
      orte: [{ n: "Tekoa", g: "Alfa" }, { n: "Regev (Ever HaYarden)", g: "Sheniya" }],
      checks: ["tevel", "zevalim", "shelachin", "zaruaa", "orla"], mekor: "Menachot 8:3" },
    shemen_katit: { de: "Shemen Zayit Zach Katit (Menorah)", lager: "shemen_katit", einheit: "Log",
      orte: [{ n: "Tekoa", g: "Alfa" }, { n: "Regev (Ever HaYarden)", g: "Sheniya" }],
      checks: ["tevel", "zevalim", "shelachin", "zaruaa", "orla", "katit"], mekor: "Menachot 8:3–5; Shemot 27:20" },
    yayin: { de: "Yayin (Nesachim)", lager: "yayin", einheit: "Log",
      orte: [{ n: "Keruchim", g: "Alfa" }, { n: "Atulin", g: "Alfa" }, { n: "Beit Rima (Har)", g: "Sheniya" }, { n: "Beit Lavan (Har)", g: "Sheniya" }, { n: "Kfar Signa (Bik'a)", g: "Sheniya" }],
      checks: ["tevel", "orla", "kilei_kerem", "zevalim", "shelachin", "metok", "dalit", "nesech"], mekor: "Menachot 8:6–7" }
  },
  checks: {
    tevel:        { de: "Terumot & Ma'asrot abgesondert (kein Tevel)", mekor: "'ממשקה ישראל' – Pesachim 48a; Menachot 6a" },
    tevel_omer:   { de: "Kein Tevel-Problem geklärt (Omer: Machloket Menachot 66a – prüfen)", mekor: "Menachot 66a" },
    chadash:      { de: "Kein Chadash vor Omer / Shtei HaLechem", mekor: "Menachot 10:6" },
    chadash_omer: { de: "Ernte dieses Jahres (Chadash) – Pflicht beim Omer", mekor: "Menachot 8:1" },
    eretz:        { de: "Aus Eretz Yisrael", mekor: "Menachot 8:1" },
    orla:         { de: "Keine Orla", mekor: "'ממשקה ישראל' – Pesachim 48a" },
    orla_na:      { de: "Keine verbotene Beimischung", mekor: "Pesachim 48a" },
    kilayim:      { de: "Keine Kil'ayim", mekor: "Pesachim 48a" },
    kilei_kerem:  { de: "Keine Kil'ei HaKerem", mekor: "Pesachim 48a; Menachot 8:6" },
    zevalim:      { de: "Nicht von gedüngtem Feld (Beit HaZevalim)", mekor: "Menachot 8:3, 8:6" },
    shelachin:    { de: "Nicht von bewässertem Feld (Beit HaShlachin)", mekor: "Menachot 8:3, 8:6" },
    zaruaa:       { de: "Nicht von Baum mit Saat dazwischen", mekor: "Menachot 8:3" },
    katit:        { de: "Erste Pressung, gestoßen (Katit) – für Menorah", mekor: "Menachot 8:4–5" },
    metok:        { de: "Nicht süß, nicht geräuchert, nicht gekocht", mekor: "Menachot 8:7" },
    dalit:        { de: "Nicht von Dalit (Rankenrebe), sondern von Bodenrebe aus bearbeitetem Weinberg", mekor: "Menachot 8:7; 86b" },
    nesech:       { de: "Kein Yayin Nesech / Stam Yeinam", mekor: "Avoda Zara 29b" }
  },
  hinweise: [
    "Alle Korbanot dürfen aus Eretz Yisrael und Chutz LaAretz, Chadash und Yashan kommen – außer Omer und Shtei HaLechem (nur Chadash & Eretz) – Menachot 8:1.",
    "Der Gizbar prüft den Wein mit dem Kana (Rohr) beim Fass – Menachot 8:7 (prüfen).",
    "Shevi'it-Früchte für Korbanot: Psak einholen (vgl. Shekalim 4:1 / Sukka 39a – prüfen).",
    "Ma'aser-Zyklus: Jahre 1, 2, 4, 5 → Ma'aser Sheni; 3, 6 → Ma'aser Ani; 7 → Shemita (Rambam Ma'aser Sheni 1:1)."
  ]
};

/* ---------- Hekdesh, Arachin, Pidyonot ---------- */
DATA.hekdesh = {
  arachin: [
    { von: 0.083, bis: 5,  m: 5,  w: 3 },
    { von: 5,     bis: 20, m: 20, w: 10 },
    { von: 20,    bis: 60, m: 50, w: 30 },
    { von: 60,    bis: 999, m: 15, w: 10 }
  ],
  arachinMekor: "Vayikra 27:3–7; Arachin 4:4 – Werte in Shekel HaKodesh (Sela). Unter 1 Monat: kein Erech",
  regeln: [
    "Arachin und Stam Hekdesh → Bedek HaBayit (Rambam Arachin 1:1; Shekalim 4:6 – prüfen).",
    "Pidyon von Hekdesh: Wert + Chomesh (¼ des Werts = ⅕ der Summe) für den Bringer selbst – Vayikra 27:13–19.",
    "Me'ila: Keren + Chomesh + Korban Asham Me'ilot (mind. 2 Sela'im) – Vayikra 5:15–16; Me'ila 5:1.",
    "Pidyon HaBen: 5 Sela'im an den Kohen (nicht Hekdesh) – Bamidbar 18:16; Bechorot 8:7.",
    "Petter Chamor: Auslösung mit einem Lamm (Seh) an den Kohen – Shemot 13:13; Bechorot 1:7.",
    "Dal BeErech: Armer gibt nach Vermögen (mind. 1 Sela) – Arachin 4:1."
  ]
};

/* ---------- Wasser & Tahara ---------- */
DATA.tahara = {
  arten: [
    { id: "mei_chatat", de: "Kiddush Mei Chatat (Wasser + Efer)", mekor: "Bamidbar 19:17; Para 6" },
    { id: "hazaya", de: "Hazaya mit Ezov (Tag 3 & 7)", mekor: "Bamidbar 19:18–19; Para 12" },
    { id: "para", de: "Sereifat Para Aduma", mekor: "Bamidbar 19; Para 3" },
    { id: "mikveh", de: "Mikveh-Prüfung (40 Se'a)", mekor: "Mikvaot 1:7; Eruvin 4b" },
    { id: "kiyor", de: "Kiyor füllen / Mukhni (Nacht: Wasser absenken)", mekor: "Yoma 3:10; Zevachim 20a" },
    { id: "tevilat_kelim", de: "Tevilat Kelim nach dem Regel", mekor: "Chagiga 3:8" },
    { id: "ama", de: "Ama / Wasserzufuhr (Ein Eitam)", mekor: "Middot 3:2; Yoma 31a" },
    { id: "tevila_kg", de: "Tevilot des KG am YK (Beit HaParva)", mekor: "Yoma 3:3; Middot 5:3" }
  ],
  regeln: [
    "Efer der Para Aduma wird in 3 Teile geteilt: am Chel, am Har HaMishcha, unter den Mishmerot – Para 3:11.",
    "Bisher 9 Parot Adumot; die 10. durch Melech HaMashiach – Para 3:5; Rambam Para Aduma 3:4.",
    "Jeder Eintritt in die Azara zur Avoda erfordert Tevila, auch bei Tahara – Yoma 3:3.",
    "Kiddush Yadayim veRaglayim aus dem Kiyor; 12 Hähne (Ben Katin) – Shemot 30:19–21; Yoma 37a.",
    "Wasser im Kli Sharet über Nacht wird pasul → Mukhni senkt den Kiyor in den Brunnen – Yoma 37a; Zevachim 20a.",
    "Beit HaTevila unter dem Beit HaMoked für Ba'al Keri – Tamid 1:1; Middot 1:9."
  ]
};

/* ---------- Bauwerk, Lishkot, Instandhaltung ---------- */
DATA.bau = {
  lishkot: [
    { n: "Lishkat HaMelach", ort: "Azara Nord", f: "Salz für alle Korbanot", mekor: "Middot 5:3" },
    { n: "Lishkat HaParva", ort: "Azara Nord", f: "Salzen der Häute; auf dem Dach Tevila des KG am YK", mekor: "Middot 5:3" },
    { n: "Lishkat HaMedichin", ort: "Azara Nord", f: "Waschen der Kravayim", mekor: "Middot 5:3" },
    { n: "Lishkat HaGazit", ort: "Azara Süd", f: "Sanhedrin Gedola; Payisot", mekor: "Middot 5:4; Yoma 25a" },
    { n: "Lishkat HaGola", ort: "Azara Süd", f: "Brunnen mit Galgal – Wasser für die Azara", mekor: "Middot 5:4" },
    { n: "Lishkat HaEtzim (Azara)", ort: "Azara Süd", f: "Funktion umstritten; Abba Shaul: Lishka des Kohen Gadol", mekor: "Middot 5:4 – prüfen" },
    { n: "Lishkat HaNezirim", ort: "Ezrat Nashim SO", f: "Kochen der Shelamim der Nezirim; Haar unter den Topf", mekor: "Middot 2:5" },
    { n: "Lishkat HaEtzim", ort: "Ezrat Nashim NO", f: "Holzprüfung durch Ba'alei Mumim", mekor: "Middot 2:5" },
    { n: "Lishkat HaMetzora'im", ort: "Ezrat Nashim NW", f: "Tevila der Metzora'im", mekor: "Middot 2:5" },
    { n: "Lishkat Beit Shemanya", ort: "Ezrat Nashim SW", f: "Wein und Öl (Abba Shaul)", mekor: "Middot 2:5" },
    { n: "Beit HaMoked", ort: "Nordseite", f: "Feuerraum, Nachtlager der Kohanim; 4 Lishkot", mekor: "Middot 1:6–8; Tamid 1:1" },
    { n: "Lishkat HaTla'im", ort: "Beit HaMoked", f: "Geprüfte Lämmer für den Tamid", mekor: "Middot 1:6" },
    { n: "Lishkat Osei Lechem HaPanim", ort: "Beit HaMoked", f: "Beit Garmo", mekor: "Middot 1:6" },
    { n: "Lishka der Avnei Mizbe'ach", ort: "Beit HaMoked", f: "Genizah der Steine (Chashmona'im)", mekor: "Middot 1:6" },
    { n: "Lishkat Pinchas HaMalbish", ort: "Sha'ar Nikanor", f: "Bigdei Kehuna", mekor: "Middot 1:4" },
    { n: "Lishkat Osei Chavitin", ort: "Sha'ar Nikanor", f: "Minchat Chavitin", mekor: "Middot 1:4" },
    { n: "Lishkat Parhedrin", ort: "—", f: "7 Tage Perishut des KG", mekor: "Yoma 1:1" },
    { n: "Beit Avtinas", ort: "Oberstock", f: "Ketoret-Herstellung; Wachposten", mekor: "Yoma 1:5; Middot 1:1" },
    { n: "Lishkat HaShekalim", ort: "—", f: "Kuppot der Terumat HaLishka", mekor: "Shekalim 3:2" },
    { n: "Lishkat Chasha'im / HaKelim", ort: "—", f: "Verdeckte Tzedaka; gespendete Kelim", mekor: "Shekalim 5:6" },
    { n: "Beit HaMitbechayim", ort: "Nördlich des Altars", f: "24 Taba'ot, Haken, Schlachttische", mekor: "Middot 3:5" }
  ],
  wartung: [
    { objekt: "Mizbe'ach", arbeit: "Sid (Kalken) – vor Pesach und vor Sukkot", intervall: "2× jährlich", mekor: "Middot 3:4" },
    { objekt: "Heichal", arbeit: "Sid – vor Pesach", intervall: "1× jährlich", mekor: "Middot 3:4" },
    { objekt: "Mizbe'ach", arbeit: "Mapa (nach Rebbi jeden Erev Shabbat) wegen Blut", intervall: "wöchentlich", mekor: "Middot 3:4" },
    { objekt: "Altarsteine", arbeit: "Prüfung auf Sprünge – kein Eisen", intervall: "laufend", mekor: "Middot 3:4; Shemot 20:22" },
    { objekt: "Parochet", arbeit: "Neuanfertigung", intervall: "2× jährlich", mekor: "Shekalim 8:5" },
    { objekt: "Kelim", arbeit: "Tevila nach jedem Regel; Menorah & Shulchan", intervall: "3× jährlich", mekor: "Chagiga 3:8" },
    { objekt: "Kiyor / Mukhni", arbeit: "Mechanik, 12 Hähne", intervall: "laufend", mekor: "Yoma 3:10" },
    { objekt: "Kodesh HaKodashim", arbeit: "Reparatur nur aus Teivot (Kästen) von oben", intervall: "bei Bedarf", mekor: "Middot 4:5" },
    { objekt: "Kelei Sharet", arbeit: "Inventur: 93 Kelim für den täglichen Dienst", intervall: "monatlich", mekor: "Tamid 3:4" },
    { objekt: "Har HaBayit", arbeit: "Kontrolle der Wachen (Ish Har HaBayit)", intervall: "nachts", mekor: "Middot 1:2" }
  ]
};

/* ---------- Zusätzliche Kalendertermine ---------- */
function festExtra(h, iso, L) {
  for (const k of DATA.holz.kurbanEtzim) if (h.month === k.m && h.day === k.d) L(`Kurban Etzim: ${k.he}`, "etzim");
  if (h.month === "Av" && h.day === 15) L("Ende Holzschlag (Ta'anit 31a)", "etzim");
  if (h.month === "Sivan" && h.day === 6) L("Bikkurim: ab heute bringen & lesen", "bikkurim");
  if (h.month === "Tishri" && h.day === 15) L("Bikkurim: ab heute ohne Mikra", "bikkurim");
  if (h.month === "Kislev" && h.day === 24) L("Bikkurim: letzter Tag (bis Chanukka)", "bikkurim");
  if ((h.month === "Nisan" && h.day === 14) || (h.month === "Tishri" && h.day === 14)) L("Sid HaMizbe'ach (Middot 3:4)", "bau");
  if ((h.month === "Nisan" && h.day === 22) || (h.month === "Sivan" && h.day === 7) || (h.month === "Tishri" && h.day === 23)) L("Tevilat Kelim nach dem Regel (Chagiga 3:8)", "tahara");
  if (h.month === "Elul" && h.day === 1) L("Rosh HaShana LeMa'aser Behema (R. Meir)", "maaser");
  if (h.month === "Shevat" && h.day === 15) L("Rosh HaShana LaIlan (Orla, Ma'asrot)", "maaser");
  if (h.month === "Nisan" && h.day === 1) L("Rosh HaShana LaRegalim & für Korbanot Tzibur", "trumah");
}
