/* =====================================================================
   module3.js – Levi'im (Shir, Shmira, Ma'aser Rishon, Ausbildung),
                Tempelwache & Ausrüstung, Öl (Shemen) & Menorah
   ===================================================================== */
"use strict";

/* ---------------- Daten ---------------- */
DATA.lagerVorlage.push(
  { id: "makel", name: "Makel des Ish Har HaBayit", einheit: "Stk", min: 1, kat: "Wache & Ausrüstung", mekor: "Middot 1:2" },
  { id: "avukot", name: "Avukot (Fackeln) für Rundgänge", einheit: "Stk", min: 20, kat: "Wache & Ausrüstung", mekor: "Middot 1:2" },
  { id: "mafteachot", name: "Mafte'chot HaAzara (Schlüsselbund)", einheit: "Satz", min: 1, kat: "Wache & Ausrüstung", mekor: "Tamid 1:1; Middot 1:8–9" },
  { id: "chanitim", name: "Chanitim & Shlatim (David HaMelech) – historisch", einheit: "Stk", min: 0, kat: "Wache & Ausrüstung", mekor: "Divrei HaYamim II 23:9; Melachim II 11:10" },
  { id: "kesatot", name: "Kesatot / Decken für Wachposten", einheit: "Stk", min: 24, kat: "Wache & Ausrüstung", mekor: "Middot 1:2 (Kesut des Schlafenden)" }
);

DATA.shmira = {
  kohanim: ["Beit Avtinas", "Beit HaNitzotz", "Beit HaMoked"],
  leviim: [
    "Sha'ar Chulda (1)", "Sha'ar Chulda (2)", "Sha'ar Kiponos (West)", "Sha'ar Tadi (Nord)", "Sha'ar HaMizrach (Shushan)",
    "Pinat Har HaBayit NO (innen)", "Pinat Har HaBayit NW (innen)", "Pinat Har HaBayit SO (innen)", "Pinat Har HaBayit SW (innen)",
    "Sha'ar HaAzara 1", "Sha'ar HaAzara 2", "Sha'ar HaAzara 3", "Sha'ar HaAzara 4", "Sha'ar HaAzara 5",
    "Pinat HaAzara NO (außen)", "Pinat HaAzara NW (außen)", "Pinat HaAzara SO (außen)", "Pinat HaAzara SW (außen)",
    "Lishkat HaKorban", "Lishkat HaParochet", "Achorei Beit HaKapporet"
  ],
  mekor: "Middot 1:1 (3 Kohanim-, 21 Levi'im-Posten = 24); Tore: Middot 1:3",
  regeln: [
    "Shmira ist Mitzvat Aseh die ganze Nacht – nicht aus Furcht vor Feinden, sondern als Kavod für das Mikdash (Rambam Beit HaBechira 8:1–2).",
    "Ish Har HaBayit geht mit brennenden Fackeln die Posten ab; wer nicht aufsteht und 'Ish Har HaBayit, Shalom Alecha' sagt, wird geschlagen, seine Kesut darf verbrannt werden (Middot 1:2).",
    "Schlüssel der Azara: Kohanim im Beit HaMoked, unter einer Marmorplatte mit Kette (Middot 1:8–9; Tamid 1:1).",
    "Kein Betreten des Har HaBayit mit Makel, Schuhen, Geldgürtel oder staubigen Füßen (Berachot 9:5).",
    "Eisen berührt den Altar nicht: 'Eisen wurde geschaffen, um das Leben zu verkürzen' (Middot 3:4; Shemot 20:22).",
    "Waffen sind nach den Chachamim kein Schmuck, sondern Gnai (Shabbat 6:4; 63a; vgl. Yeshayahu 2:4).",
    "Historisch: Yehoyada gab den Levi'im Speere und Schilde Davids aus dem Beit Hashem zum Schutz des Königs (Divrei HaYamim II 23:7–10) – Einsatz von Waffen im künftigen Mikdash: nur nach Psak des Beit Din.",
    "Ein Levi, der statt eines Sho'er singt oder umgekehrt, macht sich schuldig – Ämter nicht tauschen (Arachin 11b)."
  ]
};

DATA.leviim = {
  shirMin: [
    { id: "duchan", de: "Levi'im auf dem Duchan gesamt", min: 12, max: null, mekor: "Arachin 2:6" },
    { id: "kinor", de: "Kinorot", min: 9, max: null, mekor: "Arachin 2:5" },
    { id: "nevel", de: "Nevalim", min: 2, max: 6, mekor: "Arachin 2:5" },
    { id: "chalil", de: "Chalilim (nur an den 12 Tagen)", min: 2, max: 12, mekor: "Arachin 2:3" },
    { id: "tziltzal", de: "Tziltzal", min: 1, max: 1, mekor: "Arachin 2:5" },
    { id: "kohen_chatzotzrot", de: "Chatzotzrot (Kohanim)", min: 2, max: 120, mekor: "Arachin 2:5" }
  ],
  regeln: [
    "Shira ist Avoda der Levi'im; ein Kohen darf sie nicht ersetzen (Arachin 11a–b; Rambam Klei HaMikdash 3:2).",
    "Shir nur über Wein: gesungen beim Nisuch HaYayin der Olot Tzibur und Shalmei Tzibur (Arachin 11a; 12a).",
    "Ausbildung 5 Jahre (ab 25), Dienst ab 30 – im Mishkan bis 50; im Mikdash disqualifiziert nur der Verlust der Stimme, nicht das Alter (Bamidbar 4:3; 8:24–25; Chulin 24a; Rambam Klei HaMikdash 3:7–8).",
    "24 Mishmerot der Levi'im parallel zu den Kohanim (Divrei HaYamim I 25; Rambam Klei HaMikdash 3:9).",
    "Levitische Kinder durften zur Süße mitsingen, standen unten (Tza'irei Levi'im) – Arachin 2:6.",
    "Die 15 Stufen zwischen Ezrat Nashim und Ezrat Yisrael: 15 Shir HaMa'alot bei Simchat Beit HaSho'eva (Sukka 5:4; Middot 2:5).",
    "Levi'im öffnen und schließen die Tore (Ne'ilat She'arim) – Memune Ben Gever (Shekalim 5:1).",
    "Bei Bikkurim singen die Levi'im Tehillim 30 (Bikkurim 3:4).",
    "Einkommen: Ma'aser Rishon; davon Terumat Ma'aser (1/10) an den Kohen (Bamidbar 18:21–26).",
    "48 Arei HaLeviyim inkl. 6 Arei Miklat (Bamidbar 35:6–7)."
  ]
};

DATA.oel = {
  ernten: ["1. Ernte (reife Oliven am Wipfel)", "2. Ernte (auf Dachhöhe)", "3. Ernte (Rest, im Bottich nachgereift)"],
  pressungen: ["1. – im Mörser gestoßen, in den Korb (Katit)", "2. – unter dem Pressbalken (Kora)", "3. – erneut gemahlen und gepresst"],
  mekor: "Menachot 8:4–5 (9 Ölsorten; Rang: 'הראשון שבראשון אין למעלה ממנו')",
  menorah: [
    "7 Nerot, je ½ Log – bemessen für die längste Nacht (Menachot 89a).",
    "Hatavat HaNerot: 5 Nerot vor der Zerika des Tamid, 2 danach (Tamid 3:9; 6:1; Yoma 14b).",
    "Ner Ma'aravi brannte als Zeichen der Shechina länger (Shabbat 22b; Menachot 86b).",
    "Für die Menorah nur Shemen Katit (erste Pressung, gestoßen) – für Menachot nicht erforderlich (Menachot 86a).",
    "Dochte aus abgetragenen Bigdei Kehuna (Sukka 5:3)."
  ],
  mishcha: {
    rezept: "Mor Dror 500 · Kinamon Besem 250 · Kne Bosem 250 · Kida 500 (Shekel HaKodesh) · Shemen Zayit 1 Hin",
    regeln: [
      "Nur einmal von Moshe hergestellt; wird nicht nachgemacht (Keritot 5b; Horayot 11b).",
      "Von Yoshiyahu verborgen (Yoma 52b) – im Zweiten Mikdash nicht vorhanden; KG wurde durch die Bigdei eingesetzt (Merubeh Begadim – Horayot 3:4).",
      "Herstellung/Nachbildung und Salben eines Zar: Karet (Shemot 30:32–33; Keritot 1:1).",
      "Im Programm nur als Information – keine Produktionsfunktion."
    ],
    mekor: "Shemot 30:22–33; Keritot 5b; Horayot 11b; Rambam Klei HaMikdash 1"
  }
};

/* ---------------- Navigation ---------------- */
NAV.splice(NAV.findIndex(n => n.id === "agrar"), 0,
  { id: "leviim", de: "Levi'im & Wache", he: "לויים ומשמר", ico: "♫" },
  { id: "oel", de: "Öl – Shemen", he: "שמן ומנורה", ico: "◍" }
);

/* ---------------- Levi'im ---------------- */
const leviList = (mOnly = true) => {
  const m = mishmarFor(todayISO());
  return STATE.personal.filter(p => p.rolle === "levi" && (!mOnly || m.regel || p.mishmar === m.idx));
};
function shirKey(d) { return `shir|${d}`; }
function shirPlan(d) {
  STATE.leviDienst = STATE.leviDienst || {};
  return STATE.leviDienst[shirKey(d)] || {};
}
function shirPruefung(d, plan) {
  const counts = {}; let duchan = 0;
  for (const [pid, rolle] of Object.entries(plan)) { counts[rolle] = (counts[rolle] || 0) + 1; if (rolle !== "kohen_chatzotzrot" && rolle !== "frei") duchan++; }
  counts.duchan = duchan;
  const chalilTag = tagesplan(d).chalil;
  return DATA.leviim.shirMin.map(r => {
    const n = counts[r.id] || 0;
    if (r.id === "chalil" && !chalilTag) return { ...r, n, ok: n === 0, text: n ? "Heute kein Chalil-Tag" : "kein Chalil-Tag" };
    const ok = n >= r.min && (r.max == null || n <= r.max);
    return { ...r, n, ok, text: ok ? "✓" : `Soll ${r.min}${r.max ? "–" + r.max : "+"}` };
  });
}
REG.maaser = {
  titel: "Ma'aser Rishon – Eingang",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "geber", l: "Geber (Yisrael)" },
    { n: "produkt", l: "Produkt", t: "select", opts: [["Getreide", "Getreide (Dagan)"], ["Wein", "Wein (Tirosh)"], ["Öl", "Öl (Yitzhar)"], ["Früchte", "Früchte"]] },
    { n: "menge", l: "Menge Ma'aser Rishon", t: "number", req: true },
    { n: "einheit", l: "Einheit", def: "Se'a" },
    { n: "levi", l: "Empfangender Levi" },
    { n: "tmGegeben", l: "Terumat Ma'aser an Kohen übergeben", t: "check" },
    { n: "notiz", l: "Notiz" }
  ],
  hinweis: "Terumat Ma'aser = 1/10 des Ma'aser Rishon, an den Kohen – Bamidbar 18:26. Ma'aser Rishon gehört dem Levi (Yevamot 86b: Machloket ob auch an Kohanim).",
  spalten: [["Datum", x => fmtDate(x.datum)], ["Geber", x => `<span dir="auto">${esc(x.geber)}</span>`], ["Produkt", x => esc(x.produkt)], ["Ma'aser Rishon", x => `${fmtNum(x.menge)} ${esc(x.einheit)}`], ["Terumat Ma'aser", x => `${fmtNum(x.menge / 10, 3)} ${esc(x.einheit)} ${x.tmGegeben ? "✓" : `<span class="bad">offen</span>`}`], ["Levi", x => `<span dir="auto">${esc(x.levi)}</span>`]],
  onSave: (x, neu) => { if (x.tmGegeben && !x.tmGebucht) { STATE.matanot.push({ id: uid(), datum: x.datum, gabe: "Terumat Ma'aser", geber: x.levi || "Levi", menge: `${fmtNum(x.menge / 10, 3)} ${x.einheit} ${x.produkt}`, empfaenger: mishmarFor(x.datum).tr, notiz: "aus Ma'aser Rishon" }); x.tmGebucht = true; } }
};
REG.wachRunde = {
  titel: "Rundgang Ish Har HaBayit",
  felder: [
    { n: "datum", l: "Nacht vom", t: "date", def: todayISO },
    { n: "zeit", l: "Uhrzeit" },
    { n: "posten", l: "Posten", t: "select", opts: () => [...DATA.shmira.kohanim, ...DATA.shmira.leviim].map(p => [p, p]) },
    { n: "wach", l: "Wache wach angetroffen ('Shalom Alecha')", t: "check", def: true },
    { n: "massnahme", l: "Maßnahme", t: "select", opts: [["", "—"], ["ermahnt", "Ermahnt / geschlagen (Makel)"], ["kesut", "Kesut verbrannt (Middot 1:2)"]] },
    { n: "notiz", l: "Notiz" }
  ],
  spalten: [["Nacht", x => fmtDate(x.datum)], ["Zeit", x => esc(x.zeit)], ["Posten", x => esc(x.posten)], ["Wach", x => x.wach ? `<span class="ok">✓</span>` : `<span class="bad">schlafend</span>`], ["Maßnahme", x => esc(x.massnahme)]],
  rowClass: x => x.wach ? "" : "bad"
};
const STATE_DEFAULTS_3 = { maaser: [], wachRunde: [], oelPressung: [], leviDienst: {}, wachPlan: {}, leviInfo: {} };
function ensure3() { for (const [k, v] of Object.entries(STATE_DEFAULTS_3)) if (STATE[k] === undefined) STATE[k] = JSON.parse(JSON.stringify(v)); }

VIEWS.leviim = () => {
  ensure3();
  const sub = curSub("leviim", "shir");
  const head = subtabs("leviim", [["shir", "Shir – Dienstplan"], ["shmira", "Shmira – 24 Posten"], ["ausruestung", "Wache: Ausrüstung & Regeln"], ["maaser", "Ma'aser Rishon"], ["levi", "Levi'im & Ausbildung"], ["regeln", "Regeln"]]);
  const t = todayISO(), m = mishmarFor(t);
  if (sub === "shir") {
    const plan = shirPlan(t), P = shirPruefung(t, plan), L = leviList();
    const koh = STATE.personal.filter(p => p.rolle.startsWith("kohen") && dienstfaehig(p).ok && (m.regel || p.mishmar === m.idx));
    const pool = [...L, ...koh];
    const rollen = [["frei", "—"], ...DATA.leviimRollen.filter(r => r.id !== "shoer").map(r => [r.id, r.de])];
    const tp = tagesplan(t);
    return head + `<div class="grid g2">
      ${card(`Duchan heute – ${m.regel ? "Regel" : m.tr}`, `<p>Shir shel Yom: <b>Tehillim ${tp.shir.psalm}</b> <span dir="rtl" class="he">${tp.shir.he}</span>${tp.haazinu ? ` · Musaf: <span dir="rtl" class="he">${esc(tp.haazinu)}</span>` : ""}${tp.chalil ? " · <b>Chalil-Tag</b>" : ""}</p>
        <table class="tbl dense"><thead><tr><th>Anforderung</th><th class="r">Ist</th><th>Prüfung</th><th>Mekor</th></tr></thead><tbody>${P.map(r => `<tr class="${r.ok ? "" : "bad"}"><td>${esc(r.de)}</td><td class="r">${r.n}</td><td>${esc(r.text)}</td><td>${mekor(r.mekor)}</td></tr>`).join("")}</tbody></table>
        <div class="actions"><button class="btn" data-act="shirAuto">Automatisch nach Rolle einteilen</button><button class="btn ghost" data-act="shirLeeren">Leeren</button><button class="btn ghost" data-act="druck">Drucken</button></div>`, "accent")}
      ${card("Einteilung", pool.length ? `<div class="scroll"><table class="tbl dense"><thead><tr><th>Name</th><th>Stammrolle</th><th>Status</th><th>Heute</th></tr></thead><tbody>${pool.map(p => { const d = dienstfaehig(p); return `<tr><td dir="auto">${esc(p.name)}</td><td>${p.rolle === "levi" ? esc((DATA.leviimRollen.find(r => r.id === p.levRolle) || {}).de || "—") : "Kohen"}</td><td>${d.ok ? `<span class="ok">✓</span>` : `<span class="bad">${esc(d.gruende.join("; "))}</span>`}</td>
        <td><select data-change="shirRolle" data-id="${p.id}" ${d.ok ? "" : "disabled"}>${(p.rolle === "levi" ? rollen : [["frei", "—"], ["kohen_chatzotzrot", "Chatzotzrot"]]).map(([k, l]) => opt(k, l, plan[p.id] || "frei")).join("")}</select></td></tr>`; }).join("")}</tbody></table></div>` : `<p class="muted">Keine Levi'im dieser Mishmar erfasst (Kohanim & Levi'im → + Person, Rolle „Levi“).</p>`)}
    </div>`;
  }
  if (sub === "shmira") {
    STATE.wachPlan = STATE.wachPlan || {};
    const wp = STATE.wachPlan[t] || {};
    const levi = leviList(false).filter(p => dienstfaehig(p).ok), koh = STATE.personal.filter(p => p.rolle === "kohen" && dienstfaehig(p).ok);
    const sel = (post, pool) => `<select data-change="wachPosten" data-post="${esc(post)}">${opt("", "— unbesetzt —", wp[post] || "")}${pool.map(p => opt(p.id, p.name, wp[post] || "")).join("")}</select>`;
    const besetzt = Object.values(wp).filter(Boolean).length;
    return head + `<div class="grid g2">
      ${card(`Nachtwache ${fmtDate(t)} – ${besetzt}/24 besetzt`, `<p class="muted">${esc(DATA.shmira.mekor)}</p>
        <h4>Kohanim (3)</h4><table class="tbl dense">${DATA.shmira.kohanim.map(p => `<tr><td>${esc(p)}</td><td>${sel(p, koh)}</td></tr>`).join("")}</table>
        <h4>Levi'im (21)</h4><table class="tbl dense">${DATA.shmira.leviim.map(p => `<tr><td>${esc(p)}</td><td>${sel(p, levi)}</td></tr>`).join("")}</table>
        <div class="actions"><button class="btn" data-act="wachAuto">Automatisch besetzen</button><button class="btn ghost" data-act="druck">Wachliste drucken</button></div>`, "accent")}
      ${card("Rundgänge Ish Har HaBayit", `<div class="row">${regNeuBtn("wachRunde", "+ Rundgang")}${csvBtn("wachRunde")}</div>${regTable("wachRunde")}`)}
    </div>`;
  }
  if (sub === "ausruestung") {
    const ids = ["makel", "avukot", "mafteachot", "kesatot", "chanitim", "shofar", "chatzotzrot"];
    return head + `<div class="grid g2">${card("Ausrüstung der Wache", `<table class="tbl dense">${ids.map(id => { const l = STATE.lager[id]; return `<tr class="${l.bestand < l.min ? "bad" : ""}"><td>${esc(lagerName(id))}<br>${mekor((DATA.lagerVorlage.find(a => a.id === id) || {}).mekor)}</td><td class="r">${fmtNum(l.bestand)}</td><td><button class="btn sm" data-act="lagerBuchung" data-id="${id}" data-r="zu">+</button><button class="btn sm ghost" data-act="lagerBuchung" data-id="${id}" data-r="ab">−</button></td></tr>`; }).join("")}</table>
      <p class="muted small">Die Chanitim & Shlatim sind als historisches Inventar (Divrei HaYamim II 23:9) geführt. Ob und welche Bewaffnung im künftigen Mikdash zulässig ist, entscheidet das Beit Din – das Programm verwaltet nur den Bestand.</p>`)}
      ${card("Regeln der Shmira", `<ul class="list">${DATA.shmira.regeln.map(r => `<li>${esc(r)}</li>`).join("")}</ul>`)}</div>`;
  }
  if (sub === "maaser") {
    const offen = STATE.maaser.filter(x => !x.tmGegeben).length;
    return head + card(`Ma'aser Rishon & Terumat Ma'aser${offen ? ` – <span class="bad">${offen} Terumat Ma'aser offen</span>` : ""}`, `<div class="row">${regNeuBtn("maaser", "+ Ma'aser Rishon")}${csvBtn("maaser")}</div>${regTable("maaser")}`);
  }
  if (sub === "levi") {
    const L = leviList(false), j = new Date().getFullYear();
    return head + card(`Levi'im (${L.length})`, `<p class="muted">Ausbildung 5 Jahre ab 25, Dienst ab 30; im Mikdash entscheidet die Stimme, nicht das Alter ${mekor("Chulin 24a; Rambam Klei HaMikdash 3:7–8")}</p>
      <div class="scroll"><table class="tbl dense"><thead><tr><th>Name</th><th>Rolle</th><th>Mishmar</th><th>Geb.-Jahr</th><th>Ausbildung</th><th>Stimme</th><th>Status</th><th></th></tr></thead><tbody>
      ${L.map(p => { const i = STATE.leviInfo[p.id] || {}; const alter = i.geburt ? j - i.geburt : null; const st = !i.geburt ? "—" : alter < 25 ? "zu jung" : alter < 30 ? "in Ausbildung" : i.stimme === "verloren" ? "nicht für Shir" : "dienstbereit";
        return `<tr><td dir="auto">${esc(p.name)}</td><td>${esc((DATA.leviimRollen.find(r => r.id === p.levRolle) || {}).de || "—")}</td><td>${p.mishmar !== "" && p.mishmar != null ? DATA.mishmarotTranslit[p.mishmar] : "—"}</td><td>${i.geburt || ""}${alter != null ? ` (${alter})` : ""}</td><td>${i.ausbildung || ""}</td><td>${esc(i.stimme || "")}</td><td>${st}</td><td><button class="btn sm ghost" data-act="leviInfo" data-id="${p.id}">✎</button></td></tr>`; }).join("") || `<tr><td colspan="8" class="muted">Keine Levi'im erfasst.</td></tr>`}</tbody></table></div>
      <div class="actions"><button class="btn" data-act="personEdit">+ Levi erfassen</button></div>`);
  }
  return head + card("Avodat HaLevi'im", `<ul class="list">${DATA.leviim.regeln.map(r => `<li>${esc(r)}</li>`).join("")}</ul>`) + card("Rollen", `<table class="tbl dense">${DATA.leviimRollen.map(r => `<tr><td>${esc(r.de)}</td><td>${mekor(r.mekor)}</td></tr>`).join("")}</table>`);
};
Object.assign(ACT, {
  shirAuto: () => {
    const t = todayISO(), plan = {}, chalil = tagesplan(t).chalil, m = mishmarFor(t);
    const cnt = {};
    const max = { nevel: 6, chalil: chalil ? 12 : 0, tziltzal: 1 };
    for (const p of leviList().filter(p => dienstfaehig(p).ok)) {
      let r = p.levRolle && p.levRolle !== "shoer" ? p.levRolle : "meshorer";
      if (max[r] !== undefined && (cnt[r] || 0) >= max[r]) r = "meshorer";
      plan[p.id] = r; cnt[r] = (cnt[r] || 0) + 1;
    }
    STATE.personal.filter(p => p.rolle === "kohen" && dienstfaehig(p).ok && (m.regel || p.mishmar === m.idx)).slice(0, 2).forEach(p => plan[p.id] = "kohen_chatzotzrot");
    STATE.leviDienst[shirKey(t)] = plan; saveState(); render();
  },
  shirLeeren: () => { delete STATE.leviDienst[shirKey(todayISO())]; saveState(); render(); },
  wachAuto: () => {
    const t = todayISO(), wp = {};
    const levi = leviList(false).filter(p => dienstfaehig(p).ok);
    const leviS = [...levi.filter(p => p.levRolle === "shoer"), ...levi.filter(p => p.levRolle !== "shoer")];
    const koh = STATE.personal.filter(p => p.rolle === "kohen" && dienstfaehig(p).ok);
    DATA.shmira.kohanim.forEach((p, i) => { if (koh[i]) wp[p] = koh[i].id; });
    DATA.shmira.leviim.forEach((p, i) => { if (leviS[i]) wp[p] = leviS[i].id; });
    STATE.wachPlan[t] = wp; saveState(); render();
    const frei = 24 - Object.keys(wp).length; if (frei) alert(`${frei} Posten bleiben unbesetzt – zu wenig dienstfähige Kohanim/Levi'im erfasst.`);
  },
  leviInfo: el => {
    const i = STATE.leviInfo[el.dataset.id] || {};
    modal("Levi – Ausbildung & Stimme", `<form class="form" data-form="leviInfo"><input type="hidden" name="id" value="${el.dataset.id}">
      <label>Geburtsjahr <input type="number" name="geburt" value="${esc(i.geburt || "")}"></label>
      <label>Ausbildung (Lehrer / seit) <input name="ausbildung" value="${esc(i.ausbildung || "")}"></label>
      <label>Stimme <select name="stimme">${["", "gut", "schwach", "verloren"].map(s => opt(s, s || "—", i.stimme || "")).join("")}</select></label>
      <div class="actions"><button class="btn">Speichern</button><button type="button" class="btn ghost" data-act="closeModal">Abbrechen</button></div></form>`);
  }
});
FORM.leviInfo = fd => { STATE.leviInfo[fd.get("id")] = { geburt: Number(fd.get("geburt")) || "", ausbildung: fd.get("ausbildung"), stimme: fd.get("stimme") }; closeModal(); };
document.addEventListener("change", e => {
  const c = e.target.dataset.change;
  if (c === "shirRolle") { e.stopImmediatePropagation(); const t = todayISO(); STATE.leviDienst[shirKey(t)] = STATE.leviDienst[shirKey(t)] || {}; if (e.target.value === "frei") delete STATE.leviDienst[shirKey(t)][e.target.dataset.id]; else STATE.leviDienst[shirKey(t)][e.target.dataset.id] = e.target.value; saveState(); render(); }
  if (c === "wachPosten") { e.stopImmediatePropagation(); const t = todayISO(); STATE.wachPlan[t] = STATE.wachPlan[t] || {}; STATE.wachPlan[t][e.target.dataset.post] = e.target.value; saveState(); render(); }
}, true);

/* ---------------- Öl ---------------- */
REG.oelPressung = {
  titel: "Ölpressung (Beit HaBad)",
  felder: [
    { n: "datum", l: "Datum", t: "date", def: todayISO },
    { n: "herkunft", l: "Herkunft", t: "select", opts: [["Tekoa", "Tekoa – Alfa"], ["Regev", "Regev (Ever HaYarden) – Sheniya"], ["sonstig", "Sonstiger Ort"]] },
    { n: "ernte", l: "Ernte", t: "select", opts: () => DATA.oel.ernten.map((e, i) => [String(i + 1), e]) },
    { n: "pressung", l: "Pressung", t: "select", opts: () => DATA.oel.pressungen.map((e, i) => [String(i + 1), e]) },
    { n: "oliven", l: "Eingesetzte Oliven (Se'a)", t: "number" },
    { n: "menge", l: "Ertrag Öl (Log)", t: "number", req: true },
    { n: "geprueft", l: "Kein Beit HaZevalim / Shlachin / Zera'im dazwischen (Menachot 8:3)", t: "check" },
    { n: "tevel", l: "Terumot & Ma'asrot abgesondert", t: "check" },
    { n: "notiz", l: "Notiz" }
  ],
  hinweis: DATA.oel.mekor,
  spalten: [["Datum", x => fmtDate(x.datum)], ["Herkunft", x => esc(x.herkunft)], ["Sorte", x => `Ernte ${x.ernte} / Pressung ${x.pressung}`], ["Rang", x => `${Number(x.ernte) + Number(x.pressung) - 1} von 5`], ["Menge", x => `${fmtNum(x.menge)} Log`], ["Bestimmung", x => x.pressung === "1" ? "Menorah (Katit)" : "Menachot"], ["Status", x => x.gebucht ? `<span class="ok">im Lager</span>` : `<span class="bad">gesperrt</span>`]],
  onSave: (x, neu) => {
    if (!x.geprueft || !x.tevel) { alert("Prüfungen unvollständig – Öl wird nicht eingelagert (Menachot 8:3; Pesachim 48a)."); return; }
    if (!x.gebucht) { const ziel = x.pressung === "1" ? "shemen_katit" : "shemen"; lagerBuchen(ziel, Number(x.menge) || 0, `Pressung E${x.ernte}/P${x.pressung} – ${x.herkunft}`, x.datum); if (x.oliven) lagerBuchen("zeitim", -Number(x.oliven), "In Pressung", x.datum); x.gebucht = true; }
  }
};
VIEWS.oel = () => {
  ensure3();
  const sub = curSub("oel", "uebersicht");
  const head = subtabs("oel", [["uebersicht", "Übersicht & Bedarf"], ["pressung", "Pressungen"], ["sorten", "9 Ölsorten"], ["menorah", "Menorah"], ["mishcha", "Shemen HaMishcha"]]);
  if (sub === "sorten") {
    return head + card("Die 9 Ölsorten (Menachot 8:4–5)", `<table class="tbl"><thead><tr><th></th>${DATA.oel.pressungen.map(p => `<th>${esc(p)}</th>`).join("")}</tr></thead><tbody>${DATA.oel.ernten.map((e, i) => `<tr><td><b>${esc(e)}</b></td>${[0, 1, 2].map(j => `<td>Rang ${i + j + 1}${j === 0 ? "<br><b>→ Menorah</b>" : "<br>→ Menachot"}</td>`).join("")}</tr>`).join("")}</tbody></table>
      <p>Rang 1 = 'אין למעלה ממנו', Rang 5 = 'אין למטה ממנו'; gleiche Rangzahl = gleichwertig. ${mekor(DATA.oel.mekor)}</p><ul class="list">${DATA.agrar.hinweise.slice(0, 1).map(h => `<li>${esc(h)}</li>`).join("")}<li>Tekoa ist Alfa für Öl (Menachot 8:3).</li></ul>`);
  }
  if (sub === "menorah") return head + card("Hadlakat HaMenorah", `<ul class="list">${DATA.oel.menorah.map(r => `<li>${esc(r)}</li>`).join("")}</ul><p>Täglicher Bedarf: <b>3½ Log</b> Shemen Katit ≈ ${fmtNum(liter(3.5), 2)} Liter (${esc(DATA.units.shitot[STATE.settings.shita].name)}).</p>`);
  if (sub === "mishcha") return head + card("Shemen HaMishcha – nur Information", `<p><b>Rezeptur laut Torah:</b> ${esc(DATA.oel.mishcha.rezept)}</p><ul class="list warnlist">${DATA.oel.mishcha.regeln.map(r => `<li>${esc(r)}</li>`).join("")}</ul>${mekor(DATA.oel.mishcha.mekor)}`);
  if (sub === "pressung") return head + card("Pressungen", `<div class="row">${regNeuBtn("oelPressung", "+ Pressung")}${csvBtn("oelPressung")}<button class="btn ghost" data-act="agrarNeu">+ Ölkauf (Wareneingang)</button></div>${regTable("oelPressung")}`);
  const t = todayISO(), r = bereichsplan(t, addDays(t, 364));
  const sh = STATE.lager.shemen.bestand, kt = STATE.lager.shemen_katit.bestand;
  const row = (l, bed, best) => `<tr class="${best < bed / 12 ? "bad" : ""}"><td>${l}</td><td class="r">${fmtNum(bed)}</td><td class="r">${fmtNum(liter(bed), 0)} l</td><td class="r">${fmtNum(best)}</td><td class="r">${fmtNum(best / (bed / 365), 0)} Tage</td></tr>`;
  return head + `<div class="grid g2">${card("Jahresbedarf (nächste 365 Tage)", `<table class="tbl"><thead><tr><th>Öl</th><th class="r">Bedarf Log</th><th class="r">≈ Liter</th><th class="r">Bestand Log</th><th class="r">Reichweite</th></tr></thead><tbody>
      ${row("Shemen für Menachot, Nesachim, Chavitin", r.totals.shemen, sh)}${row("Shemen Katit (Menorah)", r.totals.shemen_katit, kt)}</tbody></table>
      <p class="foot">Aus dem Korbanot-Planer berechnet (inkl. Musafim, Omer, Chavitin 3 Log/Tag). ${mekor(DATA.nesachim.mekor)}</p>`, "accent")}
    ${card("Verbrauchsstellen", `<ul class="list"><li>Nesachim: Keves 3 Log, Ayil 4 Log, Par 6 Log ${mekor("Menachot 9:3")}</li><li>Minchat Chavitin: 3 Log täglich ${mekor("Menachot 89a; Rambam Ma'ase HaKorbanot 13:4")}</li><li>Menachot Nedava: 1 Log je Mincha ${mekor("Menachot 89a")}</li><li>Omer: 1 Log ${mekor("Menachot 89a")}</li><li>Log Shemen des Metzora ${mekor("Vayikra 14:10")}</li><li>Menorah: 3½ Log täglich ${mekor("Menachot 89a")}</li><li>Todah: ½ Log für 40 Brote ${mekor("Menachot 89a")}</li></ul>
      <div class="actions"><button class="btn ghost" data-act="go" data-v="planer">→ Korbanot-Planer</button></div>`)}</div>`;
};

/* Demo ergänzen */
demoState = (orig => () => {
  const s = orig(); Object.assign(s, JSON.parse(JSON.stringify(STATE_DEFAULTS_3)));
  const B = { makel: 1, avukot: 30, mafteachot: 1, kesatot: 24, chanitim: 0 };
  for (const id in B) s.lager[id] = { bestand: B[id], min: (DATA.lagerVorlage.find(a => a.id === id) || {}).min || 0, preis: 0 };
  const lev = s.personal.filter(p => p.rolle === "levi");
  lev.forEach((p, i) => s.leviInfo[p.id] = { geburt: 1975 + i * 2, ausbildung: i > 12 ? "bei Hugras ben Levi" : "", stimme: "gut" });
  s.maaser.push({ id: uid(), datum: todayISO(), geber: "שמעון בן יהודה (Demo)", produkt: "Getreide", menge: 10, einheit: "Se'a", levi: lev[0]?.name || "", tmGegeben: false });
  return s;
})(demoState);

window.addEventListener("DOMContentLoaded", () => { ensure3(); });
