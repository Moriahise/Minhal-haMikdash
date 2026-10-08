/* =====================================================================
   בית המקדש השלישי – Betriebswirtschaftsprogramm
   DATENBASIS (halachische Stammdaten) – jede Angabe mit מקור
   Grundsatz: strikte Trennung בזמן הזה (Hachana / Simulation)
              ↔ לעתיד לבוא (Betrieb nach Psak des Beit Din HaGadol)
   Alle Zahlen sind Stammdaten nach Mischna/Gemara/Rambam; wo Shitot
   auseinandergehen, ist das vermerkt und in den Einstellungen wählbar.
   ===================================================================== */
"use strict";

const DATA = {};

/* ---------- Maßeinheiten ---------- */
DATA.units = {
  // Grundverhältnisse (unstrittig)
  log_per_hin: 12,                 // Menachot 89a; Rambam Ma'ase HaKorbanot 2:5
  isaron_per_ephah: 10,            // Bamidbar 28:5
  beitza_per_log: 6,               // Eruvin 83a
  beitza_per_isaron: 43.2,         // Eruvin 83b (43 1/5 Betzim)
  // Umrechnung je Shita (ml pro Beitza)
  shitot: {
    naeh:     { name: "R. Chaim Na'eh (Shiurei Torah)", ml_beitza: 57.6, g_kesef_machatzit: 9.6 },
    chazon:   { name: "Chazon Ish", ml_beitza: 99.5, g_kesef_machatzit: 9.6 },
    rambam:   { name: "Rambam-Rechnung (Dirham-basiert, Näherung)", ml_beitza: 55.0, g_kesef_machatzit: 9.6 }
  },
  mekor: "Eruvin 83a–b; Menachot 89a; Shiurim: R. Ch. Na'eh / Chazon Ish – Umrechnung ist Richtwert, kein Psak"
};

/* ---------- Nesachim pro Tier (Bamidbar 15:1–16; Menachot 9:3; Rambam Ma'ase HaKorbanot 2:5) ---------- */
DATA.nesachim = {
  keves: { solet_isaron: 1, shemen_log: 3, yayin_log: 3, label: "Keves / Kid (כבש / גדי)" },
  ayil:  { solet_isaron: 2, shemen_log: 4, yayin_log: 4, label: "Ayil (איל)" },
  par:   { solet_isaron: 3, shemen_log: 6, yayin_log: 6, label: "Par (פר)" },
  mekor: "Bamidbar 15:4–10; Menachot 9:3; Rambam Ma'ase HaKorbanot 2:5–6. Chatat und Asham ohne Nesachim (außer Metzora) – Menachot 9:6"
};

/* ---------- Tiere & Korban-Arten ---------- */
DATA.korbanTypes = [
  { id: "olah",     he: "עולה",     de: "Ganzopfer", kodshei: "Kodshei Kodashim", nesachim: true,  mekor: "Vayikra 1; Zevachim 5:4" },
  { id: "chatat",   he: "חטאת",     de: "Sündopfer", kodshei: "Kodshei Kodashim", nesachim: false, mekor: "Vayikra 4; Zevachim 5:3" },
  { id: "asham",    he: "אשם",      de: "Schuldopfer", kodshei: "Kodshei Kodashim", nesachim: false, mekor: "Vayikra 5; Zevachim 5:5" },
  { id: "shelamim", he: "שלמים",    de: "Friedensopfer", kodshei: "Kodashim Kalim", nesachim: true, mekor: "Vayikra 3; Zevachim 5:7" },
  { id: "todah",    he: "תודה",     de: "Dankopfer (mit 40 Broten)", kodshei: "Kodashim Kalim", nesachim: true, mekor: "Vayikra 7:12; Menachot 7:1" },
  { id: "bechor",   he: "בכור",     de: "Erstgeborenes", kodshei: "Kodashim Kalim", nesachim: false, mekor: "Zevachim 5:8" },
  { id: "maaser",   he: "מעשר בהמה", de: "Viehzehnt", kodshei: "Kodashim Kalim", nesachim: false, mekor: "Zevachim 5:8; Bechorot 9" },
  { id: "pesach",   he: "פסח",      de: "Pessachopfer", kodshei: "Kodashim Kalim", nesachim: false, mekor: "Zevachim 5:8; Pesachim 5" },
  { id: "mincha",   he: "מנחה",     de: "Speiseopfer (Nedava/Neder)", kodshei: "Kodshei Kodashim", nesachim: false, mekor: "Vayikra 2; Menachot 5" },
  { id: "kinim",    he: "קינים",    de: "Vogelpaar (Tor/Bnei Yona)", kodshei: "—", nesachim: false, mekor: "Vayikra 12:8; Massechet Kinim" },
  { id: "olat_reiya", he: "עולת ראייה", de: "Erscheinungsopfer (Regel)", kodshei: "Kodshei Kodashim", nesachim: true, mekor: "Chagiga 1:2" },
  { id: "chagiga",  he: "שלמי חגיגה", de: "Festopfer (Regel)", kodshei: "Kodashim Kalim", nesachim: true, mekor: "Chagiga 1:2" },
  { id: "simcha",   he: "שלמי שמחה", de: "Freudenopfer (Regel)", kodshei: "Kodashim Kalim", nesachim: true, mekor: "Pesachim 109a; Rambam Chagiga 1:1" }
];

/* ---------- Tägliche Korbanot (Tamid usw.) ---------- */
DATA.daily = {
  tamid: { keves: 2, olah: true, note: "Tamid shel Shachar + Tamid shel Bein HaArbayim", mekor: "Bamidbar 28:3–8; Tamid" },
  chavitin: { solet_isaron: 1, shemen_log: 3, note: "Minchat Chavitin des Kohen Gadol – ½ morgens, ½ abends", mekor: "Vayikra 6:13; Menachot 4:5; Rambam Ma'ase HaKorbanot 13:2–4" },
  ketoret: { maneh: 1, note: "½ Maneh morgens, ½ Maneh abends", mekor: "Keritot 6a; Rambam Klei HaMikdash 2:4" },
  menorah: { shemen_log: 3.5, note: "½ Log pro Ner × 7 (Shemen Zayit Zach Katit)", mekor: "Menachot 89a; Menachot 8:4–5" }
};

/* ---------- Musafim (Bamidbar 28–29) ---------- */
// par, ayil, keves = Olot; seir = Chatat
DATA.musaf = {
  shabbat:      { par: 0, ayil: 0, keves: 2, seir: 0, he: "מוסף שבת", mekor: "Bamidbar 28:9–10" },
  roshChodesh:  { par: 2, ayil: 1, keves: 7, seir: 1, he: "מוסף ראש חודש", mekor: "Bamidbar 28:11–15" },
  pesach:       { par: 2, ayil: 1, keves: 7, seir: 1, he: "מוסף פסח (ט״ו–כ״א ניסן)", mekor: "Bamidbar 28:19–24" },
  shavuot:      { par: 2, ayil: 1, keves: 7, seir: 1, he: "מוסף שבועות", mekor: "Bamidbar 28:26–31" },
  shteiHalechem:{ par: 1, ayil: 2, keves: 7, seir: 1, shelamimKeves: 2, he: "קרבנות שתי הלחם", mekor: "Vayikra 23:18–19; Menachot 45b (getrennt vom Musaf)" },
  roshHashana:  { par: 1, ayil: 1, keves: 7, seir: 1, he: "מוסף ראש השנה", mekor: "Bamidbar 29:1–6 (dazu Musaf Rosh Chodesh)" },
  yomKippur:    { par: 1, ayil: 1, keves: 7, seir: 1, he: "מוסף יום הכיפורים", mekor: "Bamidbar 29:7–11" },
  sukkot:       { par: [13,12,11,10,9,8,7], ayil: 2, keves: 14, seir: 1, he: "מוסף סוכות", mekor: "Bamidbar 29:12–34" },
  sheminiAtzeret:{ par: 1, ayil: 1, keves: 7, seir: 1, he: "מוסף שמיני עצרת", mekor: "Bamidbar 29:35–38" }
};

DATA.yomKippurAvoda = {
  items: [
    { tier: "par",  typ: "chatat", n: 1, who: "Kohen Gadol (eigenes Vermögen)", he: "פר כהן גדול" },
    { tier: "ayil", typ: "olah",   n: 1, who: "Kohen Gadol", he: "איל כהן גדול" },
    { tier: "seir", typ: "chatat", n: 1, who: "Tzibur – לה׳", he: "שעיר לה׳" },
    { tier: "seir", typ: "—",      n: 1, who: "Tzibur – לעזאזל (nicht auf dem Altar)", he: "שעיר המשתלח" },
    { tier: "ayil", typ: "olah",   n: 1, who: "Tzibur", he: "איל העם" }
  ],
  ketoret: "Melo Chofnav – aus den 3 Zusatz-Maneh (Keritot 6a)",
  tevilot: 5, kiddushin: 10,
  mekor: "Vayikra 16; Yoma 3:3–7:4; Rambam Avodat Yom HaKippurim"
};

/* ---------- Ketoret (Keritot 6a – Pitum HaKetoret) ---------- */
DATA.ketoret = {
  jahresmenge_maneh: 368,
  aufteilung: "365 Maneh (1 je Tag) + 3 Maneh für Melo Chofnav am Yom Kippur",
  samanim: [
    { he: "הַצֳּרִי",       de: "Tzori (Balsam)",            maneh: 70 },
    { he: "הַצִּפֹּרֶן",     de: "Tziporen (Onycha)",         maneh: 70 },
    { he: "הַחֶלְבְּנָה",    de: "Chelbena (Galbanum)",       maneh: 70 },
    { he: "הַלְּבוֹנָה",     de: "Levona (Weihrauch)",        maneh: 70 },
    { he: "מוֹר",          de: "Mor (Myrrhe)",              maneh: 16 },
    { he: "קְצִיעָה",       de: "Ketzi'a (Kassie)",          maneh: 16 },
    { he: "שִׁבֹּלֶת נֵרְדְּ", de: "Shibolet Nerd (Narde)",   maneh: 16 },
    { he: "כַּרְכֹּם",       de: "Karkom (Safran)",           maneh: 16 },
    { he: "קֹשְׁטְ",        de: "Kosht (Costus)",            maneh: 12 },
    { he: "קִלּוּפָה",      de: "Kilufa (Rinde)",            maneh: 3 },
    { he: "קִנָּמוֹן",      de: "Kinamon (Zimt)",            maneh: 9 }
  ],
  zusaetze: [
    { he: "בֹּרִית כַּרְשִׁינָה", de: "Borit Karshina", menge: "9 Kav" },
    { he: "יֵין קַפְרִיסִין",   de: "Yein Kafrisin (alt. Chamar Chivaryan atik)", menge: "3 Se'a + 3 Kav" },
    { he: "מֶלַח סְדוֹמִית",    de: "Melach Sedomit", menge: "¼ Kav" },
    { he: "מַעֲלֶה עָשָׁן",     de: "Ma'ale Ashan", menge: "כָּל שֶׁהוּא (minimale Menge – Rezeptur geheim, Beit Avtinas)" }
  ],
  hinweise: [
    "Fehlt eines der Samanim → Chiyuv Mita (Keritot 6b).",
    "Herstellung nur zum Gebrauch im Mikdash; Nachbildung zum Riechen verboten (Shemot 30:37–38; Rambam Klei HaMikdash 2:9).",
    "Zerstoßen: 'הָדֵק הֵיטֵב' – Stimme fördert die Besamim (Keritot 6b).",
    "Halbe/Drittel-Mengen: Machloket (Keritot 6b) – Programm rechnet proportional, Psak einholen."
  ],
  mekor: "Keritot 6a–b; Yerushalmi Yoma 4:5; Rambam Klei HaMikdash 2"
};

/* ---------- 24 Mishmerot Kehuna (Divrei HaYamim I 24:7–18) ---------- */
DATA.mishmarot = [
  "יְהוֹיָרִיב","יְדַעְיָה","חָרִם","שְׂעֹרִים","מַלְכִּיָּה","מִיָּמִן",
  "הַקּוֹץ","אֲבִיָּה","יֵשׁוּעַ","שְׁכַנְיָהוּ","אֶלְיָשִׁיב","יָקִים",
  "חֻפָּה","יֶשֶׁבְאָב","בִּלְגָּה","אִמֵּר","חֵזִיר","הַפִּצֵּץ",
  "פְּתַחְיָה","יְחֶזְקֵאל","יָכִין","גָּמוּל","דְּלָיָהוּ","מַעַזְיָהוּ"
];
DATA.mishmarotTranslit = [
  "Yehoyariv","Yedaya","Charim","Se'orim","Malkiya","Miyamin","HaKotz","Aviya",
  "Yeshua","Shechanyahu","Elyashiv","Yakim","Chupa","Yeshevav","Bilga","Imer",
  "Chezir","HaPitzetz","Petachya","Yechezkel","Yachin","Gamul","Delayahu","Ma'azyahu"
];
DATA.mishmarRegeln = [
  "Wechsel am Schabbat: die abgehende Mishmar bringt Tamid shel Shachar und Musafim, die ankommende Tamid shel Bein HaArbayim und die Bezichin (Sukka 56b; Tosefta Sukka 4:24–25).",
  "Jede Mishmar ist in Batei Av geteilt – ein Beit Av je Wochentag (Ta'anit 27a; Tosefta Ta'anit 2:2).",
  "An den Regalim dienen alle 24 Mishmerot gleichberechtigt; Korbanot des Regel werden unter allen verteilt (Sukka 5:7; Sukka 55b).",
  "Lechem HaPanim am Schabbat: Teilung zwischen abgehender und ankommender Mishmar (Sukka 5:8).",
  "Ma'amadot: 24 Gruppen Yisraelim stehen bei den Korbanot ihrer Mishmar (Ta'anit 4:2)."
];

/* ---------- Shir shel Yom (Tamid 7:4) ---------- */
DATA.shirShelYom = [
  { tag: "Yom Rishon",  psalm: 24, he: "לַה׳ הָאָרֶץ וּמְלוֹאָהּ" },
  { tag: "Yom Sheni",   psalm: 48, he: "גָּדוֹל ה׳ וּמְהֻלָּל מְאֹד" },
  { tag: "Yom Shlishi", psalm: 82, he: "אֱלֹקִים נִצָּב בַּעֲדַת אֵל" },
  { tag: "Yom Revi'i",  psalm: 94, he: "אֵל נְקָמוֹת ה׳" },
  { tag: "Yom Chamishi",psalm: 81, he: "הַרְנִינוּ לֵאלֹקִים עוּזֵּנוּ" },
  { tag: "Yom Shishi",  psalm: 93, he: "ה׳ מָלָךְ גֵּאוּת לָבֵשׁ" },
  { tag: "Shabbat",     psalm: 92, he: "מִזְמוֹר שִׁיר לְיוֹם הַשַּׁבָּת" }
];
DATA.shirMusafShabbat = {
  text: "Shirat Ha'azinu in 6 Abschnitten (הזי״ו ל״ך) – je Schabbat ein Abschnitt, rotierend",
  teile: ["הַ – הַאֲזִינוּ (32:1–6)", "זְ – זְכֹר (32:7–12)", "יַ – יַרְכִּבֵהוּ (32:13–18)", "וַ – וַיַּרְא (32:19–28)", "לוּ – לוּ חָכְמוּ (32:29–39)", "כִּי – כִּי אֶשָּׂא (32:40–43)"],
  mincha: "Bein HaArbayim am Schabbat: Az Yashir / Mi Chamocha / Az Yashir (Be'er)",
  mekor: "Rosh HaShana 31a"
};
DATA.chalilTage = {
  text: "12 Tage spielt der Chalil vor dem Altar: Shechitat Pesach Rishon, Shechitat Pesach Sheni, 1. Tag Pesach, Atzeret (Shavuot), 8 Tage Sukkot",
  mekor: "Arachin 2:3; Arachin 10a"
};

/* ---------- 15 Memunim (Shekalim 5:1) ---------- */
DATA.memunim = [
  { name: "יוֹחָנָן בֶּן פִּנְחָס", amt: "עַל הַחוֹתָמוֹת", de: "Ausgabe der Chotamot (Nesachim-Marken)", modul: "chotamot" },
  { name: "אֲחִיָּה",            amt: "עַל הַנְּסָכִים", de: "Ausgabe der Nesachim gegen Chotam", modul: "chotamot" },
  { name: "מַתִּתְיָה בֶּן שְׁמוּאֵל", amt: "עַל הַפְּיָסוֹת", de: "Leitung der Payisot", modul: "payis" },
  { name: "פְּתַחְיָה",           amt: "עַל הַקִּנִּין", de: "Kinim (Vogelopfer)", modul: "privat" },
  { name: "בֶּן אֲחִיָּה",         amt: "עַל חוֹלֵי מֵעַיִם", de: "Gesundheit der Kohanim (Darmleiden)", modul: "personal" },
  { name: "נְחוּנְיָא",           amt: "חוֹפֵר שִׁיחִין", de: "Wasserversorgung, Zisternen", modul: "lager" },
  { name: "גְּבִינִי",            amt: "כָּרוֹז", de: "Ausrufer (Weckruf)", modul: "dashboard" },
  { name: "בֶּן גֶּבֶר",          amt: "עַל נְעִילַת שְׁעָרִים", de: "Öffnen/Schließen der Tore", modul: "dashboard" },
  { name: "בֶּן בֵּבַי",          amt: "עַל הַפְּקִיעַ", de: "Dochte (Pekia)", modul: "lager" },
  { name: "בֶּן אַרְזָה",         amt: "עַל הַצִּלְצָל", de: "Zimbel – Signal für Levi'im", modul: "personal" },
  { name: "הֻגְרַס בֶּן לֵוִי",    amt: "עַל הַשִּׁיר", de: "Leitung des Gesangs", modul: "personal" },
  { name: "בֵּית גַּרְמוּ",        amt: "עַל מַעֲשֵׂה לֶחֶם הַפָּנִים", de: "Lechem HaPanim-Bäckerei", modul: "lager" },
  { name: "בֵּית אַבְטִינָס",      amt: "עַל מַעֲשֵׂה הַקְּטֹרֶת", de: "Ketoret-Herstellung", modul: "ketoret" },
  { name: "אֶלְעָזָר",            amt: "עַל הַפָּרֹכֶת", de: "Parochot (Vorhänge)", modul: "lager" },
  { name: "פִּנְחָס",             amt: "עַל הַמַּלְבּוּשׁ", de: "Bigdei Kehuna – Ausgabe/Pflege", modul: "lager" }
];
DATA.memunimMekor = "Shekalim 5:1–2 (Namen stehen für das Amt, nicht für Personen – Yerushalmi Shekalim 5:1); mind. 7 Amarkalim, 3 Gizbarim";

/* ---------- 13 Shofarot & Fonds (Shekalim 6:5; Rambam Shekalim 2) ---------- */
DATA.fonds = [
  { id: "terumat_halishka", he: "תְּרוּמַת הַלִּשְׁכָּה", de: "Terumat HaLishka (Machatzit HaShekel)", zweck: "Korbanot Tzibur, Ketoret, Lechem HaPanim, Omer, Shtei HaLechem, Para Aduma, Sechar der Bediensteten (Ketubot 106a)", mekor: "Shekalim 4:1; Ketubot 106a" },
  { id: "shiyarei", he: "שְׁיָרֵי הַלִּשְׁכָּה", de: "Shiyarei HaLishka (Rest)", zweck: "Kevesh, Mauern, Türme, Bedürfnisse der Stadt", mekor: "Shekalim 4:2" },
  { id: "bedek", he: "בֶּדֶק הַבַּיִת", de: "Bedek HaBayit", zweck: "Instandhaltung des Mikdash", mekor: "Shekalim 4:6; Rambam Arachin 5" },
  { id: "kelim", he: "לִשְׁכַּת הַכֵּלִים", de: "Lishkat HaKelim", zweck: "Gespendete Gefäße", mekor: "Shekalim 5:6" },
  { id: "chashaim", he: "לִשְׁכַּת חֲשָׁאִים", de: "Lishkat Chasha'im", zweck: "Verdeckte Tzedaka für verarmte Vornehme", mekor: "Shekalim 5:6" },
  { id: "sh1", he: "תִּקְלִין חַדְתִּין", de: "Shofar 1 – Shekalim neues Jahr", zweck: "Shekalim des laufenden Jahres", mekor: "Shekalim 6:5" },
  { id: "sh2", he: "תִּקְלִין עַתִּיקִין", de: "Shofar 2 – Shekalim Vorjahr", zweck: "Verspätete Shekalim", mekor: "Shekalim 6:5" },
  { id: "sh3", he: "קִנִּין", de: "Shofar 3 – Kinin", zweck: "Turteltauben (Olot)", mekor: "Shekalim 6:5" },
  { id: "sh4", he: "גּוֹזְלֵי עוֹלָה", de: "Shofar 4 – Gozlei Ola", zweck: "Junge Tauben (Olot)", mekor: "Shekalim 6:5" },
  { id: "sh5", he: "עֵצִים", de: "Shofar 5 – Etzim", zweck: "Holz für die Ma'aracha", mekor: "Shekalim 6:5" },
  { id: "sh6", he: "לְבוֹנָה", de: "Shofar 6 – Levona", zweck: "Weihrauch", mekor: "Shekalim 6:5" },
  { id: "sh7", he: "זָהָב לַכַּפֹּרֶת", de: "Shofar 7 – Zahav laKaporet", zweck: "Gold für Kelim", mekor: "Shekalim 6:5" },
  { id: "nesachim", he: "קֻפַּת הַנְּסָכִים", de: "Kupat HaNesachim (Chotamot-Erlöse)", zweck: "Erlöse aus Nesachim-Verkauf; Überschuss → Hekdesh", mekor: "Shekalim 4:3; 5:4" },
  { id: "sh8_13", he: "נְדָבָה (ו׳ שׁוֹפָרוֹת)", de: "Shofarot 8–13 – Nedava", zweck: "Kayitz HaMizbe'ach (Olot Nedava)", mekor: "Shekalim 6:5–6" }
];
DATA.shekalimRegeln = [
  "1. Adar: Ankündigung der Shekalim (Shekalim 1:1).",
  "15. Adar: Shulchanot in der Provinz; 25. Adar: Shulchanot im Mikdash, Pfändung beginnt (Shekalim 1:3).",
  "Machatzit HaShekel: Männer ab 20 (Rambam Shekalim 1:7); Frauen, Sklaven, Minderjährige dürfen geben, werden nicht gepfändet (Shekalim 1:3–5).",
  "Kalbon (Aufgeld beim Wechsel) – Shekalim 1:6–7.",
  "Terumat HaLishka 3× jährlich: vor Pesach, vor Atzeret, vor Sukkot (Shekalim 3:1).",
  "Ab 1. Nisan werden Korbanot Tzibur aus neuen Shekalim bezahlt (Shekalim 4:1; Rosh HaShana 7a)."
];

/* ---------- Chotamot (Shekalim 5:3–4) ---------- */
DATA.chotamot = [
  { id: "egel",  he: "עֵגֶל",  de: "Egel – Nesachim für Bakar (Par)",  tier: "par" },
  { id: "zachar",he: "זָכָר",  de: "Zachar – Nesachim für Ayil",       tier: "ayil" },
  { id: "gedi",  he: "גְּדִי",  de: "Gedi – Nesachim für Keves/Kid",    tier: "keves" },
  { id: "choteh",he: "חוֹטֵא", de: "Choteh – Nesachim des Metzora",    tier: "metzora" }
];
DATA.chotamNesachim = {
  egel:   { solet: 3, shemen: 6, yayin: 6 },
  zachar: { solet: 2, shemen: 4, yayin: 4 },
  gedi:   { solet: 1, shemen: 3, yayin: 3 },
  choteh: { solet: 3, shemen: 10, yayin: 9, hinweis: "Richtwert: 3 Isaron + Log Shemen des Metzora (Vayikra 14:10; Menachot 9:6) – vor Betrieb prüfen" }
};
DATA.chotamotRegeln = [
  "Käufer zahlt bei Yochanan (al haChotamot) und erhält einen Chotam; gegen den Chotam gibt Achiya (al haNesachim) die Nesachim aus (Shekalim 5:4).",
  "Tägliche Abrechnung am Abend: Überschuss → Hekdesh; Fehlbetrag zahlt der Memune aus eigener Tasche (Shekalim 5:4).",
  "Verlorener Chotam: Wartezeit bis Abend; Rückgabe nur bei Abgleich (Shekalim 5:5).",
  "Chotam ist pro Tag datiert (Shekalim 5:5: 'יוֹם' auf dem Chotam)."
];

/* ---------- Payisot (Yoma 2; Tamid 1–3) ---------- */
DATA.payisot = [
  { nr: 1, he: "תְּרוּמַת הַדֶּשֶׁן", de: "Terumat HaDeshen", plaetze: 1, mekor: "Yoma 2:1–2; Tamid 1:2" },
  { nr: 2, he: "פַּיִס שֵׁנִי – שְׁלֹשָׁה עָשָׂר כֹּהֲנִים", de: "13 Kohanim: Shechita, Zerika, Dishun Mizbe'ach HaPnimi, Dishun HaMenorah, Rosh+Regel, 2 Yadayim, Ukatz+Regel, Chaze+Gera, 2 Dfanot, Kravayim, Solet, Chavitin, Yayin", plaetze: 13,
    rollen: ["שׁוֹחֵט","זוֹרֵק","מְדַשֵּׁן מִזְבֵּחַ הַפְּנִימִי","מְדַשֵּׁן הַמְּנוֹרָה","רֹאשׁ וְרֶגֶל","שְׁתֵּי הַיָּדַיִם","עֹקֶץ וְרֶגֶל","חָזֶה וְגֵרָה","שְׁתֵּי דְּפָנוֹת","קְרָבַיִם","סֹלֶת","חֲבִתִּין","יַיִן"],
    mekor: "Yoma 2:3; Tamid 3:1" },
  { nr: 3, he: "קְטֹרֶת – חֲדָשִׁים", de: "Ketoret – nur wer noch nie geräuchert hat", plaetze: 1, nurNeue: true, mekor: "Yoma 2:4; Yoma 26a ('מעשרת')" },
  { nr: 4, he: "הַעֲלָאַת אֵבָרִים", de: "Hinauftragen der Glieder vom Kevesh zum Mizbe'ach", plaetze: 1, mekor: "Yoma 2:4" }
];
DATA.payisVerfahren = "Kohanim stehen im Kreis (Lishkat HaGazit), jeder streckt einen Finger aus; der Memune nennt eine hohe Zahl und zählt ab, nimmt die Mitze ab des ersten (Yoma 22a–b). Man zählt Finger, nicht Personen (Yoma 22b).";

/* ---------- Bigdei Kehuna ---------- */
DATA.bigdei = {
  hedyot: ["כְּתֹנֶת","מִכְנָסַיִם","מִגְבַּעַת","אַבְנֵט"],
  gadol:  ["כְּתֹנֶת","מִכְנָסַיִם","מִצְנֶפֶת","אַבְנֵט","מְעִיל","אֵפוֹד","חֹשֶׁן","צִיץ"],
  lavan:  "Bigdei Lavan am Yom Kippur: morgens Pelusin (12 Maneh), abends Hindoyin (800 Zuz) – Yoma 3:7",
  regeln: [
    "Ohne Bigdei Kehuna → Avoda pasul (Zevachim 17b).",
    "Zerrissen / verschmutzt / zu lang / zu kurz → pasul (Zevachim 18b; Rambam Klei HaMikdash 10:4–5).",
    "Getragen nur bei der Avoda; Avnet aus Sha'atnez (Rambam Klei HaMikdash 8:1)."
  ],
  mekor: "Shemot 28; Yoma 7:5; Rambam Klei HaMikdash 8–10"
};

/* ---------- Lager-Stammartikel ---------- */
DATA.lagerVorlage = [
  { id: "keves",  name: "Kevasim (כבשים) – geprüft",  einheit: "Stk", min: 6, kat: "Tiere", mekor: "Mind. 6 geprüfte Lämmer in Lishkat HaTla'im, 4 Tage vorher geprüft – Arachin 13a; Menachot 49b" },
  { id: "ayil",   name: "Eilim (אילים)",              einheit: "Stk", min: 2, kat: "Tiere", mekor: "" },
  { id: "par",    name: "Parim (פרים)",               einheit: "Stk", min: 2, kat: "Tiere", mekor: "" },
  { id: "seir",   name: "Se'irei Izim (שעירים)",      einheit: "Stk", min: 1, kat: "Tiere", mekor: "" },
  { id: "kinim",  name: "Kinim (Tor/Bnei Yona)",      einheit: "Paar", min: 10, kat: "Tiere", mekor: "Petachya al haKinin – Shekalim 5:1" },
  { id: "solet",  name: "Solet (סולת)",               einheit: "Isaron", min: 30, kat: "Menachot", mekor: "Beste Herkunft: Michmas, Zanoach – Menachot 8:1" },
  { id: "shemen", name: "Shemen Zayit (שמן)",         einheit: "Log", min: 40, kat: "Menachot", mekor: "Tekoa – Menachot 8:3" },
  { id: "shemen_katit", name: "Shemen Zayit Zach Katit (Menorah)", einheit: "Log", min: 25, kat: "Menorah", mekor: "Menachot 8:4–5; Shemot 27:20" },
  { id: "yayin",  name: "Yayin (יין) für Nesachim",   einheit: "Log", min: 40, kat: "Nesachim", mekor: "Keruchim, Atulin, Beit Rima, Beit Lavan – Menachot 8:6" },
  { id: "melach", name: "Melach (מלח)",               einheit: "Kav", min: 5, kat: "Mizbe'ach", mekor: "Kein Korban ohne Salz – Vayikra 2:13; Lishkat HaMelach (Middot 5:3)" },
  { id: "etzim",  name: "Etzei Ma'aracha (Holz)",     einheit: "Last", min: 50, kat: "Mizbe'ach", mekor: "Nicht Zayit, Gefen (Tamid 2:3); wurmgeprüft in Lishkat HaEtzim (Middot 2:5)" },
  { id: "levona", name: "Levona (לבונה)",             einheit: "Kometz", min: 10, kat: "Menachot", mekor: "2 Bezichin zum Lechem HaPanim – Menachot 11:5" },
  { id: "ketoret",name: "Ketoret fertig",             einheit: "Maneh", min: 30, kat: "Ketoret", mekor: "Beit Avtinas" },
  { id: "pekia",  name: "Pekia (Dochte, aus Bigdei Kehuna)", einheit: "Stk", min: 50, kat: "Menorah", mekor: "Aus abgetragenen Michnasayim/Avnetim – Sukka 5:3" },
  { id: "efer",   name: "Efer Para Aduma",            einheit: "Ration", min: 20, kat: "Tahara", mekor: "Para 3; Rambam Para Aduma" },
  { id: "begged_ketonet", name: "Ketonet (Hedyot)",   einheit: "Stk", min: 40, kat: "Bigdei Kehuna", mekor: "Pinchas al haMalbush" },
  { id: "begged_michnasayim", name: "Michnasayim",    einheit: "Stk", min: 40, kat: "Bigdei Kehuna", mekor: "" },
  { id: "begged_migbaat", name: "Migba'at",           einheit: "Stk", min: 40, kat: "Bigdei Kehuna", mekor: "" },
  { id: "begged_avnet", name: "Avnet",                einheit: "Stk", min: 40, kat: "Bigdei Kehuna", mekor: "" },
  { id: "mayim",  name: "Wasser (Kiyor/Mikvaot)",     einheit: "m³", min: 100, kat: "Infrastruktur", mekor: "Nechunya Chofer Shichin; Kiyor-Mechanik Ben Katin – Yoma 3:10" }
];

/* ---------- Tum'a-Typen (Personalstatus) ---------- */
DATA.tumaTypen = [
  { id: "tahor",  de: "Tahor", tage: 0 },
  { id: "keri",   de: "Tum'at Keri – Tevila, Ha'arev Shemesh", tage: 1 },
  { id: "sheretz",de: "Tum'at Sheretz/Nevela – Tevila, Ha'arev Shemesh", tage: 1 },
  { id: "met",    de: "Tum'at Met – Hazaya Tag 3 & 7 (Efer Para Aduma), Tevila", tage: 7 },
  { id: "zav",    de: "Zav – 7 Neki'im + Korban", tage: 8 },
  { id: "metzora",de: "Metzora – Tahara-Prozess + Korbanot", tage: 8 },
  { id: "onen",   de: "Onen (nur Kohen Hedyot gesperrt am Tag)", tage: 1 }
];
DATA.psulimRegeln = [
  "Ba'al Mum: Avoda pasul (Vayikra 21:17–23); darf in Lishkat HaEtzim Holz prüfen (Middot 2:5). Liste der Mumim: Bechorot 7; Rambam Bi'at HaMikdash 7–8.",
  "Shetuyei Yayin (Revi'it Wein) / Pru'ei Rosh / Kru'ei Begadim → Avoda verboten (Vayikra 10:6–9; Rambam Bi'at HaMikdash 1).",
  "Tevul Yom, Mechusar Kippurim → pasul (Zevachim 2:1).",
  "Ohne Kiddush Yadayim veRaglayim vom Kiyor → pasul (Zevachim 19b).",
  "Sitzen während der Avoda, Chatzitza zwischen Körper und Begged → pasul (Zevachim 2:1)."
];

/* ---------- Levi'im ---------- */
DATA.leviimRollen = [
  { id: "meshorer", de: "Meshorer (Sänger)", mekor: "Arachin 11a; mind. 12 Levi'im auf dem Duchan – Arachin 2:6" },
  { id: "kinor",    de: "Kinor (mind. 9)", mekor: "Arachin 2:5" },
  { id: "nevel",    de: "Nevel (2–6)", mekor: "Arachin 2:5" },
  { id: "chalil",   de: "Chalil (2–12)", mekor: "Arachin 2:3" },
  { id: "tziltzal", de: "Tziltzal (genau 1)", mekor: "Arachin 2:5" },
  { id: "shoer",    de: "Sho'er (Torwache)", mekor: "Middot 1:1 – 21 Wachposten (3 Kohanim, 21 Levi'im)" },
  { id: "kohen_chatzotzrot", de: "Kohen – Chatzotzrot (mind. 2, max. 120)", mekor: "Arachin 2:5" }
];
DATA.mishmarotShmira = "Nachtwache: Kohanim an 3 Stellen (Beit Avtinas, Beit HaNitzotz, Beit HaMoked), Levi'im an 21 Stellen; Ish Har HaBayit kontrolliert (Middot 1:1–2).";

/* ---------- Checklisten / Sedarim ---------- */
DATA.checklisten = {
  tamid: {
    titel: "Seder HaTamid (Ablauf eines Tages)",
    mekor: "Massechet Tamid; Yoma 33a (Abaye: Seder HaMa'aracha)",
    schritte: [
      "Vor Tagesanbruch: Tevila, Payis 1 – Terumat HaDeshen",
      "Kiddush Yadayim veRaglayim, Terumat HaDeshen",
      "Sidur Ma'aracha Gedola, Ma'aracha Shniya (Ketoret), Kiyum HaEsh",
      "Payis 2 (13 Kohanim) in Lishkat HaGazit",
      "Bringen des Tamid aus Lishkat HaTla'im, Prüfung auf Mumim, Hashkaya aus Goldkelim",
      "'Barkai' – Ausruf beim Tageslicht bis Chevron",
      "Dishun Mizbe'ach HaPnimi, Hatavat 5 Nerot",
      "Shechitat HaTamid, Zerika (2 die 4 sind)",
      "Hatavat 2 Nerot, Hafshet & Nitu'ach",
      "Kriat Shma, Birkot Kohanim in Lishkat HaGazit",
      "Payis 3 – Ketoret (Chadashim) & Payis 4 – Evarim",
      "Haktarat Ketoret",
      "Birkat Kohanim auf den Stufen des Ulam",
      "Ha'ala'at Evarim, Minchat Nesachim, Chavitin, Nisuch HaYayin",
      "Magrefa-Signal, Chatzotzrot, Shir shel Yom der Levi'im",
      "Musafim (falls Schabbat/Rosh Chodesh/Yom Tov)",
      "Korbanot Yachid über den Tag",
      "Tamid shel Bein HaArbayim (8½ Std.), Ketoret, Hatavat Nerot",
      "Ne'ilat She'arim (Ben Gever), Nachtwachen"
    ]
  },
  yomKippur: {
    titel: "Avodat Yom HaKippurim (Kohen Gadol)",
    mekor: "Yoma 1–7; Rambam Avodat Yom HaKippurim 4",
    schritte: [
      "7 Tage vorher: Perishut in Lishkat Parhedrin, Ersatz-KG bestimmt (Yoma 1:1)",
      "Hazaya Tag 3 & 7 (Efer Para Aduma)",
      "Nacht: Wachbleiben, Lernen mit Zekenim (Yoma 1:6–7)",
      "Tevila 1 – Bigdei Zahav: Tamid shel Shachar, Ketoret, Nerot",
      "Tevila 2 – Bigdei Lavan: Vidui 1 über Par (sich & Haus)",
      "Goral über die 2 Se'irim (Kalpi, Ostrita/Gold)",
      "Vidui 2 über Par (Kohanim), Shechitat HaPar",
      "Ketoret lifnai veLifnim (Melo Chofnav), Gebet im Heichal",
      "Haza'at Dam HaPar (1 nach oben, 7 nach unten) vor dem Aron/Even Shtiya",
      "Shechitat Se'ir laShem, Haza'at Dam lifnai veLifnim",
      "Haza'ot auf die Parochet, dann Mizbe'ach HaZahav",
      "Vidui 3 über Se'ir laAzazel – Shilu'ach ins Midbar (Ish Iti)",
      "Kriat HaTorah (Acharei Mot, Be'asor) in Ezrat Nashim",
      "Tevila 3 – Bigdei Zahav: Eilo, Eil HaAm, Musaf (Teil)",
      "Tevila 4 – Bigdei Lavan: Herausnahme Kaf & Machta",
      "Tevila 5 – Bigdei Zahav: Tamid shel Bein HaArbayim, Ketoret, Nerot",
      "Yom Tov des KG für seine Freunde – sicherer Ausgang aus dem Kodesh (Yoma 7:4)"
    ]
  },
  pesach: {
    titel: "Korban Pesach (14. Nisan)",
    mekor: "Pesachim 5; Rambam Korban Pesach 1",
    schritte: [
      "Registrierung der Chaburot (Minui) bis zur Shechita",
      "Tamid shel Bein HaArbayim um 7½ Std. (Erev Pesach) – Pesachim 5:1",
      "Shechita in 3 Kitot (Gruppen), Tore der Azara schließen jeweils",
      "Reihen von Kohanim mit Bazichin aus Gold und Silber (keine flachen Böden)",
      "Levi'im lesen Hallel (wiederholt bis zu 3×), Chalil spielt",
      "Hafshet an Haken / Stöcken, Eimurim auf den Altar",
      "Shabbat: Shechita stößt Schabbat ab; Tragen erst danach",
      "Pesach Sheni: 14. Iyar für Teme'im / Derech Rechoka"
    ]
  },
  sukkot: {
    titel: "Sukkot im Mikdash",
    mekor: "Sukka 4–5",
    schritte: [
      "Nisuch HaMayim täglich (3 Log aus dem Shiloach) – Sukka 4:9",
      "Arava um den Altar, 1× täglich, 7× am 7. Tag – Sukka 4:5",
      "Simchat Beit HaSho'eva, Ezrat Nashim mit Tikun Gadol – Sukka 5:1–4",
      "Abnehmende Parim (13 → 7), Verteilung auf Mishmerot – Sukka 55b",
      "Hakhel im Jahr nach Shemita (Motza'ei Shemita, 1. Chol HaMoed) – Sota 7:8"
    ]
  },
  lechemHapanim: {
    titel: "Lechem HaPanim (Beit Garmo)",
    mekor: "Menachot 11; Vayikra 24:5–9",
    schritte: [
      "12 Challot à 2 Isaron = 24 Isaron Solet, Matza",
      "Backen am Erev Shabbat; fällt Yom Tov auf Freitag, am Erev Yom Tov (Verzehr am 9. Tag); bei 2 Tagen Rosh HaShana Do/Fr am Mittwoch (10. Tag) – Menachot 11:9",
      "Am Schabbat: 4 Kohanim nehmen ab, 4 legen auf (tefach-genau) – Menachot 11:7",
      "2 Bezichei Levona aufgelegt & am Schabbat verbrannt",
      "Verteilung: Hälfte abgehende, Hälfte ankommende Mishmar"
    ]
  },
  omer: {
    titel: "Omer & Shtei HaLechem",
    mekor: "Menachot 10; Vayikra 23",
    schritte: [
      "Motza'ei 15. Nisan: Ernte (Katzira) mit Ausruf, 3 Se'a Gerste – Menachot 10:3",
      "Rösten, Mahlen, 13 Siebe → 1 Isaron Solet",
      "16. Nisan: Tenufa, Kemitza, Haktara + Keves Olah (2 Isaron Mincha, ¼ Hin Wein)",
      "Ab dann Chadash erlaubt",
      "Shavuot: Shtei HaLechem (2 Challot Chametz à 1 Isaron) + Korbanot (Vayikra 23:18–19)",
      "Ab Shavuot: Bikkurim aus neuem Weizen erlaubt"
    ]
  }
};

/* ---------- Jahreszyklus / Sonderzeiten ---------- */
DATA.sonder = {
  bikkurim: "Bikkurim: von Shavuot bis Sukkot mit Mikra Bikkurim; bis Chanukka ohne Kriya (Bikkurim 1:6)",
  shemita: "Shemita: Jahr ≡ 0 (mod 7) der Ära seit Schöpfung (z. B. 5782) – nach gängiger Zählung",
  hakhel: "Hakhel: Sukkot des Jahres nach der Shemita",
  biur: "Bi'ur Ma'asrot: Erev Pesach im 4. und 7. Jahr (Ma'aser Sheni 5:6)",
  balTeacher: "Bal Te'acher: Neder/Nedava muss vor Ablauf von 3 Regalim (Pesach, Shavuot, Sukkot) gebracht sein – Rosh HaShana 4a–b"
};

/* Freeze for safety */
if (typeof module !== "undefined") module.exports = DATA;
