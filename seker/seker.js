/* Seker – Web-Ansicht. Reines JavaScript, liest nur die statischen
   Ergebnisdateien unter data/, berichte/ und chips/. */
(function () {
  "use strict";
  const $ = (s, r) => (r || document).querySelector(s);
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const zahl = (x, n) => Number(x).toLocaleString("de-DE",
    { minimumFractionDigits: n || 0, maximumFractionDigits: n || 0 });
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const lade = (u) => fetch(u, { cache: "no-cache" }).then((r) => {
    if (!r.ok) throw new Error(u + ": HTTP " + r.status);
    return r;
  });
  const MERKMAL = {
    ndvi_feucht: "Vegetation Frühjahr (NDVI)", ndmi_feucht: "Feuchte Frühjahr (NDMI)",
    hell_feucht: "Helligkeit Frühjahr", ndvi_trocken: "Vegetation Spätsommer (NDVI)",
    bsi_trocken: "Bare-Soil-Index Spätsommer", hell_trocken: "Bodenhelligkeit Spätsommer",
    ton_trocken: "SWIR-Verhältnis Spätsommer"
  };
  const TEIL = { anomalie: ["Anomaliestärke", 35], persistenz: ["Persistenz", 25],
    geometrie: ["Geometrie", 20], relief: ["Relieflage", 10], kontext: ["Landnutzung", 10] };
  const PERIODE = { ET: "Erster Tempel", ZT: "Zweiter Tempel" };

  let D = { kand: [], orte: [], kacheln: {}, ueb: null };
  let karte, ebKand, ebOrte, ebKacheln, marker = {}, aktiv = null;

  const farbe = (s) => css(s >= 70 ? "--k3" : s >= 50 ? "--k2" : "--k1");
  const ortFarbe = (p) => css(p.includes("ET") && p.includes("ZT") ? "--ezt"
    : p.includes("ET") ? "--et" : p.includes("ZT") ? "--zt" : "--sonst");

  // In der Übersicht kleine Punkte, damit sich Kacheln nicht zu Flecken ballen
  const radius = (s) => (karte.getZoom() < 11 ? 0.4 : karte.getZoom() < 13 ? 0.7 : 1) * (5 + Math.max(0, (s - 30) / 12));

  // ------------------------------------------------------------ Filter
  function gefiltert() {
    const min = +$("#f-score").value, reg = $("#f-region").value, kl = $("#f-klasse").value,
      per = $("#f-periode").value, neu = $("#f-neu").checked, mehr = $("#f-mehrfach").checked;
    return D.kand.filter((f) => {
      const p = f.properties;
      return p.score >= min && (!reg || p.region === reg) && (!kl || p.klasse === kl)
        && (!neu || !p.bekannt) && (!mehr || p.n_beob >= 2)
        && (!per || (p.kontext || []).some((k) => k.perioden.includes(per)));
    });
  }

  function zeichne() {
    const fs = gefiltert();
    $("#f-score-out").textContent = $("#f-score").value;
    $("#f-zahl").textContent = fs.length + " von " + D.kand.length + " Kandidaten angezeigt";
    ebKand.clearLayers();
    marker = {};
    fs.slice().reverse().forEach((f) => {
      const p = f.properties, [lon, lat] = f.geometry.coordinates;
      const m = L.circleMarker([lat, lon], {
        radius: radius(p.score), _score: p.score, fillColor: farbe(p.score), fillOpacity: 0.92,
        color: p.bekannt ? "#222" : "#fff", weight: p.bekannt ? 1 : 2.5
      });
      m.bindTooltip(esc(p.id) + " · Index " + zahl(p.score) + " · " + esc(p.klasse));
      m.on("click", () => zeige(f));
      m.addTo(ebKand);
      marker[p.id] = m;
    });
    liste(fs);
  }

  function liste(fs) {
    const kopf = "<thead><tr><th>ID</th><th class=r>Index</th><th>Klasse</th><th class=r>L × B (m)</th>"
      + "<th class=r>RX rel.</th><th class=r>Beob.</th><th>Region</th><th>Landbedeckung</th>"
      + "<th>nächste Fundstelle</th><th>Perioden-Kontext</th></tr></thead>";
    $("#liste").innerHTML = kopf + "<tbody>" + fs.map((f) => {
      const p = f.properties, nf = p.naechster_fundort;
      const per = [...new Set((p.kontext || []).flatMap((k) => k.perioden))].map((c) => PERIODE[c]).join(", ");
      return "<tr data-id='" + esc(p.id) + "'><td>" + esc(p.id) + (p.bekannt ? "" : " <span class='tag neu'>nicht katalogisiert</span>")
        + "</td><td class=r><span class=index style='background:" + farbe(p.score) + "'>" + zahl(p.score) + "</span></td><td>"
        + esc(p.klasse) + "</td><td class=r>" + zahl(p.laenge_m) + " × " + zahl(p.breite_m) + "</td><td class=r>"
        + zahl(p.rx_relativ, 1) + "</td><td class=r>" + p.n_beob + "/" + p.n_laeufe + "</td><td>" + esc(p.region)
        + "</td><td>" + esc(p.landbedeckung) + "</td><td>" + (nf ? esc(nf.name) + " (" + zahl(nf.distanz_m) + " m)" : "–")
        + "</td><td>" + (esc(per) || "–") + "</td></tr>";
    }).join("") + "</tbody>";
  }

  // ------------------------------------------------------------ Detail
  function zeige(f) {
    const p = f.properties, [lon, lat] = f.geometry.coordinates;
    aktiv = p.id;
    const nf = p.naechster_fundort;
    const teil = Object.keys(TEIL).map((k) => "<div class=balken><span>" + TEIL[k][0] + " (" + TEIL[k][1]
      + " %)</span><i><b style='width:" + Math.round((p.teilwerte[k] || 0) * 100) + "%'></b></i><span>"
      + zahl(p.teilwerte[k] || 0, 2) + "</span></div>").join("");
    const treiber = (p.treiber || []).map((t) => "<div class=kv><span>" + esc(MERKMAL[t.merkmal] || t.merkmal)
      + "</span><span>" + (t.z > 0 ? "+" : "") + zahl(t.z, 1) + " σ</span></div>").join("");
    const ktx = (p.kontext || []).map((k) => "<div class=kv><span>" + esc(k.name) + "</span><span>"
      + zahl(k.distanz_m) + " m · " + k.perioden.map((c) => PERIODE[c]).join(", ")
      + " <span class='muted small'>(" + esc(k.quelle) + ")</span></span></div>").join("");
    const ll = lat.toFixed(5) + "," + lon.toFixed(5);
    const govmap = p.itm ? "<a target=_blank rel=noopener href='https://www.govmap.gov.il/?c="
      + p.itm[0] + "," + p.itm[1] + "&z=9'>GovMap (Orthofoto)</a>" : "";
    const el = $("#detail");
    el.hidden = false;
    el.innerHTML = "<button class=zu aria-label='Schließen'>✕</button><h2>" + esc(p.id) + "</h2>"
      + "<div class='muted small'>" + esc(p.region) + " · Kachel " + esc(p.kachel) + "</div>"
      + "<p><span class=index style='background:" + farbe(p.score) + "'>" + zahl(p.score) + "</span> Prioritätsindex · "
      + "<span class=tag>" + esc(p.klasse) + "</span>"
      + (p.bekannt ? "<span class=tag>bei bekannter Fundstelle</span>" : "<span class='tag neu'>nicht in Wikidata/OSM</span>")
      + (p.osm_maske ? "" : "<br><span class=warn>Ohne OSM-Maske berechnet – moderne Wege/Zäune nicht ausgeschlossen.</span>") + "</p>"
      + "<p>" + esc(p.deutung) + "</p>"
      + "<img alt='Sentinel-2-Ausschnitt 640 × 640 m, links ohne, rechts mit Umriss' src='" + esc(p.chip) + "?v=" + esc(p.zuletzt) + "'>"
      + "<div class='muted small'>Sentinel-2-Spätsommerkomposit, 640 × 640 m, 10 m/Pixel; rechts mit Objektumriss.</div>"
      + "<h3>Prüfen im hochauflösenden Bild</h3><div class=links>"
      + "<a target=_blank rel=noopener href='https://www.google.com/maps/@" + ll + ",350m/data=!3m1!1e3'>Google-Satellit</a>"
      + govmap
      + "<a target=_blank rel=noopener href='https://www.openstreetmap.org/?mlat=" + lat.toFixed(5) + "&mlon=" + lon.toFixed(5) + "#map=17/" + lat.toFixed(5) + "/" + lon.toFixed(5) + "'>OpenStreetMap</a>"
      + "<a target=_blank rel=noopener href='https://survey.antiquities.org.il/'>IAA-Survey</a></div>"
      + "<h3>Kennwerte</h3>"
      + "<div class=kv><span>Koordinaten (WGS84)</span><span>" + lat.toFixed(5) + "° N, " + lon.toFixed(5) + "° E</span></div>"
      + (p.itm ? "<div class=kv><span>Israel TM (ITM)</span><span>" + p.itm[0] + " / " + p.itm[1] + "</span></div>" : "")
      + "<div class=kv><span>Ausdehnung</span><span>" + zahl(p.laenge_m) + " × " + zahl(p.breite_m) + " m · " + zahl(p.flaeche_m2) + " m² · Azimut " + zahl(p.azimut) + "°</span></div>"
      + "<div class=kv><span>Anomalie (RX)</span><span>" + zahl(p.rx_relativ, 1) + "-fache Schwelle (Mittel " + zahl(p.rx_mittel, 1) + ", Max " + zahl(p.rx_max, 1) + ")</span></div>"
      + "<div class=kv><span>Persistenz</span><span>Frühjahr " + zahl(p.persistenz_feucht * 100) + " % · Spätsommer " + zahl(p.persistenz_trocken * 100) + " %</span></div>"
      + "<div class=kv><span>Relief</span><span>" + (p.lrm_m > 0 ? "+" : "") + zahl(p.lrm_m, 1) + " m über lokalem Mittel · Hang " + zahl(p.hang_grad, 1) + "°</span></div>"
      + "<div class=kv><span>Landbedeckung</span><span>" + esc(p.landbedeckung) + "</span></div>"
      + "<div class=kv><span>Beobachtet</span><span>" + p.n_beob + " von " + p.n_laeufe + " Läufen · zuerst " + esc(p.zuerst) + " · zuletzt " + esc(p.zuletzt) + "</span></div>"
      + "<div class=kv><span>Nächste Fundstelle</span><span>" + (nf ? esc(nf.name) + " (" + zahl(nf.distanz_m) + " m)" : "–") + "</span></div>"
      + "<h3>Zusammensetzung des Index</h3>" + teil
      + "<h3>Stärkste Abweichungen vom Umfeld</h3>" + (treiber || "<p class=muted>–</p>")
      + "<h3>Perioden-Kontext (≤ 3 km)</h3>" + (ktx || "<p class='muted small'>Keine datierte Fundstelle in den offenen Katalogen im Umkreis.</p>")
      + "<p class='muted small'>Kontext ist keine Datierung des Kandidaten. Methode v" + esc(p.methode) + ".</p>";
    $(".zu", el).onclick = () => { el.hidden = true; aktiv = null; karte.invalidateSize(); };
    karte.invalidateSize();
    karte.setView([lat, lon], Math.max(karte.getZoom(), 15));
  }

  // ------------------------------------------------- Stand & Validierung
  function aucZeile(v) {
    if (!v) return "<span class='muted small'>noch zu wenige Fundstellen</span>";
    const pz = (x) => Math.round(x * 100) + "%";
    return "<div class=auc title='0 … 1, gestrichelt = Zufall (0,5)'><span class=mitte></span><span class=ki style='left:" + pz(v.ki95[0])
      + ";width:" + pz(v.ki95[1] - v.ki95[0]) + "'></span><span class=wert style='left:" + pz(v.auc) + "'></span></div>"
      + "<span class=small>AUC " + zahl(v.auc, 2) + " (95-%-KI " + zahl(v.ki95[0], 2) + "–" + zahl(v.ki95[1], 2) + "), n = " + v.n
      + ", p " + (v.p_einseitig < 0.001 ? "< 0,001" : "= " + zahl(v.p_einseitig, 3)) + "</span>";
  }

  function stand() {
    const u = D.ueb;
    const kz = [[u.kacheln_ok + " / " + u.kacheln_gesamt, "Kacheln ausgewertet"],
      [zahl(u.flaeche_km2) + " km²", "auswertbare Fläche"], [u.kandidaten, "Kandidaten"],
      [u.kandidaten_unregistriert, "nicht in offenen Katalogen"], [u.kandidaten_bestaetigt, "mehrfach beobachtet"],
      [u.fundorte, "bekannte Fundstellen (Referenz)"], [u.fundorte_et, "davon Erster Tempel"], [u.fundorte_zt, "davon Zweiter Tempel"]];
    $("#kennzahlen").innerHTML = [kz[0], kz[2], kz[3], kz[5]].map((k) => "<div class=kz><b>" + k[0] + "</b><span>" + k[1] + "</span></div>").join("");
    const reg = Object.values(u.regionen).map((r) => "<tr><td>" + esc(r.name) + "</td><td class=r>" + r.kacheln_ok + " / " + r.kacheln_gesamt
      + "</td><td><div class=fort><b style='width:" + Math.round(100 * r.kacheln_ok / r.kacheln_gesamt) + "%'></b></div></td><td class=r>"
      + r.kandidaten + "</td><td>" + (r.kacheln_ok ? aucZeile(r.validierung) : "–") + "</td></tr>").join("");
    const laeufe = u.laeufe.slice().reverse().slice(0, 30).map((l) => "<tr><td>" + esc(l.id) + "</td><td class=r>" + l.ok + "</td><td class=r>"
      + l.fehler + "</td><td class=r>" + l.neu + "</td><td class=r>" + l.wiedererkannt + "</td><td class=r>" + l.entfallen + "</td><td class=r>"
      + zahl(l.dauer_s) + " s</td><td>" + esc(l.osm_stand || "ohne OSM") + "</td><td><code>" + esc(l.commit) + "</code></td></tr>").join("");
    $("#stand").innerHTML = "<div class=card><h2>Gesamtstand</h2><p class='muted small'>Letzte Aktualisierung: "
      + esc(new Date(u.stand).toLocaleString("de-DE")) + " · Methode v" + esc(u.methoden_version) + "</p><div id=kz2 style='display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:.6em'>"
      + kz.map((k) => "<div class=kz><b>" + k[0] + "</b><span>" + k[1] + "</span></div>").join("") + "</div></div>"
      + "<div class=card><h2>Validierung gegen bekannte Fundstellen</h2><p>Für jede katalogisierte Fundstelle wird die stärkste Anomalie im Umkreis von 150 m mit 300 Zufallspunkten derselben Kachel verglichen. "
      + "Die AUC ist das mittlere Perzentil: <b>0,5 = Zufall</b>, 1 = jede Fundstelle auffälliger als alle Kontrollen. Unsicherheit per Cluster-Bootstrap über Kacheln.</p>"
      + "<p>" + md(u.validierung_urteil || "").replace(/^<p>|<\/p>$/g, "") + "</p>" + aucZeile(u.validierung)
      + "<p class='muted small'>Einschränkung: Katalogisierte Orte sind häufig freigelegt und erschlossen; die Kennzahl belegt Trennschärfe für <i>sichtbare</i> Fundstellen, nicht für verschüttete.</p></div>"
      + "<div class=card><h2>Fortschritt nach Regionen</h2><div class=scroll><table class=tbl><thead><tr><th>Region</th><th class=r>Kacheln</th><th></th><th class=r>Kandidaten</th><th>Validierung</th></tr></thead><tbody>"
      + reg + "</tbody></table></div></div>"
      + "<div class=card><h2>Läufe</h2><div class=scroll><table class=tbl><thead><tr><th>Lauf (UTC)</th><th class=r>Kacheln</th><th class=r>Fehler</th><th class=r>neu</th><th class=r>wiedererkannt</th><th class=r>gestrichen</th><th class=r>Dauer</th><th>OSM-Stand</th><th>Commit</th></tr></thead><tbody>"
      + laeufe + "</tbody></table></div></div>";
  }

  // ---------------------------------------------------------- Markdown
  function md(text) {
    const inl = (s) => esc(s)
      .replace(/`([^`]+)`/g, "<code>$1</code>")
      .replace(/\*\*([^*]+)\*\*/g, "<b>$1</b>")
      .replace(/(^|[^*])\*([^*]+)\*/g, "$1<i>$2</i>")
      .replace(/\[([^\]]+)\]\((https?:[^)\s]+)\)/g, "<a target=_blank rel=noopener href='$2'>$1</a>")
      .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, "$1");
    const z = text.split("\n");
    let h = "", i = 0;
    while (i < z.length) {
      const t = z[i];
      let m;
      if (/^```/.test(t)) {
        let c = ""; i++;
        while (i < z.length && !/^```/.test(z[i])) c += z[i++] + "\n";
        h += "<pre><code>" + esc(c) + "</code></pre>"; i++;
      } else if ((m = /^(#{1,4})\s+(.*)/.exec(t))) { h += "<h" + m[1].length + ">" + inl(m[2]) + "</h" + m[1].length + ">"; i++; }
      else if (/^\|/.test(t)) {
        const rows = [];
        while (i < z.length && /^\|/.test(z[i])) rows.push(z[i++]);
        const cells = (r) => r.replace(/^\||\|$/g, "").split("|").map((c) => inl(c.trim()));
        h += "<table><thead><tr>" + cells(rows[0]).map((c) => "<th>" + c + "</th>").join("") + "</tr></thead><tbody>"
          + rows.slice(2).map((r) => "<tr>" + cells(r).map((c) => "<td>" + c + "</td>").join("") + "</tr>").join("") + "</tbody></table>";
      } else if (/^\s*([-*]|\d+\.)\s+/.test(t)) {
        const ord = /^\s*\d+\./.test(t);
        h += ord ? "<ol>" : "<ul>";
        while (i < z.length && /^\s*([-*]|\d+\.)\s+/.test(z[i])) h += "<li>" + inl(z[i++].replace(/^\s*([-*]|\d+\.)\s+/, "")) + "</li>";
        h += ord ? "</ol>" : "</ul>";
      } else if (/^>\s?/.test(t)) {
        let b = "";
        while (i < z.length && /^>\s?/.test(z[i])) b += z[i++].replace(/^>\s?/, "") + " ";
        h += "<blockquote>" + inl(b) + "</blockquote>";
      } else if (!t.trim()) i++;
      else {
        let p = "";
        while (i < z.length && z[i].trim() && !/^(#|\||>|```|\s*([-*]|\d+\.)\s)/.test(z[i])) p += z[i++] + " ";
        h += "<p>" + inl(p) + "</p>";
      }
    }
    return h;
  }

  function bericht(datum) {
    lade("berichte/" + datum + ".md").then((r) => r.text()).then((t) => { $("#bericht").innerHTML = md(t); })
      .catch((e) => { $("#bericht").textContent = "Bericht nicht ladbar: " + e.message; });
  }

  function csv() {
    const sp = ["id", "lat", "lon", "score", "klasse", "laenge_m", "breite_m", "flaeche_m2", "azimut", "rx_relativ",
      "persistenz_feucht", "persistenz_trocken", "lrm_m", "landbedeckung", "bekannt", "n_beob", "n_laeufe", "zuerst", "zuletzt", "region", "kachel"];
    const q = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const zeilen = [sp.join(";")].concat(gefiltert().map((f) => sp.map((k) =>
      q(k === "lat" ? f.geometry.coordinates[1] : k === "lon" ? f.geometry.coordinates[0] : f.properties[k])).join(";")));
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob(["﻿" + zeilen.join("\r\n")], { type: "text/csv" }));
    a.download = "seker-kandidaten.csv";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  // ------------------------------------------------------- Lauf starten
  // Eine statische Seite kann selbst nichts rechnen; ein Lauf ist ein
  // GitHub-Actions-Workflow. Der Knopf löst ihn über die GitHub-API aus.
  const REPO = (function () {
    const m = /^([^.]+)\.github\.io$/.exec(location.hostname), seg = location.pathname.split("/")[1];
    return m && seg ? m[1] + "/" + seg : "Moriahise/Minhal-haMikdash";
  })();
  const API = "https://api.github.com/repos/" + REPO + "/actions/workflows/seker.yml";
  const speicher = { get: () => { try { return localStorage.getItem("seker-token") || ""; } catch (e) { return ""; } },
    set: (v) => { try { v ? localStorage.setItem("seker-token", v) : localStorage.removeItem("seker-token"); } catch (e) { /* privat */ } } };

  function laufStatus() {
    const el = $("#lauf-status");
    return fetch(API + "/runs?per_page=5", { headers: { Accept: "application/vnd.github+json" } })
      .then((r) => { if (!r.ok) throw new Error("HTTP " + r.status); return r.json(); })
      .then((j) => {
        const rs = (j.workflow_runs || []).filter((r) => r.event !== "push" && r.event !== "pull_request");
        if (!rs.length) { el.textContent = "Bisher wurde noch kein Lauf auf GitHub ausgeführt."; return false; }
        const aktiv = rs.some((r) => r.status !== "completed");
        el.innerHTML = rs.slice(0, 3).map((r) => {
          const kl = r.status !== "completed" ? "laeuft" : r.conclusion === "success" ? "gut" : "schlecht";
          const txt = r.status !== "completed" ? "läuft gerade" : r.conclusion === "success" ? "abgeschlossen" : "fehlgeschlagen";
          return "<div><span class='punkt " + kl + "'></span>" + esc(new Date(r.created_at).toLocaleString("de-DE")) + " · "
            + (r.event === "schedule" ? "automatisch" : "von Hand") + " · " + txt
            + " · <a target=_blank rel=noopener href='" + esc(r.html_url) + "'>Protokoll</a></div>";
        }).join("");
        return aktiv;
      }).catch((e) => { el.textContent = "Status nicht abrufbar (" + e.message + ")."; return false; });
  }

  function laufStarten() {
    const token = $("#lauf-token").value.trim(), meld = $("#lauf-meldung"), knopf = $("#lauf-start");
    const n = Math.min(60, Math.max(1, parseInt($("#lauf-kacheln").value, 10) || 20));
    if (!token) { meld.innerHTML = "<span class=warn>Bitte ein GitHub-Token eintragen – oder Weg 1 benutzen.</span>"; return; }
    speicher.set($("#lauf-merken").checked ? token : "");
    knopf.disabled = true;
    meld.textContent = "Lauf wird angefordert …";
    fetch(API + "/dispatches", { method: "POST",
      headers: { Accept: "application/vnd.github+json", Authorization: "Bearer " + token, "Content-Type": "application/json" },
      body: JSON.stringify({ ref: "main", inputs: { kacheln: String(n), region: $("#lauf-region").value } }) })
      .then((r) => {
        if (r.status === 204) {
          meld.innerHTML = "<b class=ok>Lauf gestartet.</b> " + n + " Kacheln werden analysiert; die Ergebnisse erscheinen nach etwa 10–20 Minuten auf dieser Seite (neu laden).";
          setTimeout(laufStatus, 6000);
        } else if (r.status === 401) throw new Error("Token ungültig oder abgelaufen.");
        else if (r.status === 403 || r.status === 404) throw new Error("Token hat für dieses Repository keine Berechtigung „Actions: Read and write“.");
        else return r.json().then((j) => { throw new Error(j.message || "HTTP " + r.status); });
      })
      .catch((e) => { meld.innerHTML = "<span class=warn>Nicht gestartet: " + esc(e.message) + "</span>"; })
      .finally(() => { knopf.disabled = false; });
  }

  function laufDialog() {
    $("#lauf-github").href = "https://github.com/" + REPO + "/actions/workflows/seker.yml";
    const t = speicher.get();
    if (t && !$("#lauf-token").value) { $("#lauf-token").value = t; $("#lauf-merken").checked = true; }
    $("#lauf-meldung").textContent = "";
    $("#lauf-dialog").showModal();
    laufStatus();
  }

  // -------------------------------------------------------------- Start
  function tab(name) {
    document.querySelectorAll("#tabs button").forEach((b) => b.classList.toggle("active", b.dataset.tab === name));
    document.querySelectorAll(".tab").forEach((s) => s.classList.toggle("active", s.id === "tab-" + name));
    if (name === "karte") karte.invalidateSize();
  }

  function start() {
    karte = L.map("map", { preferCanvas: true }).setView([31.75, 35.05], 9);
    const sat = L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}",
      { maxZoom: 19, attribution: "Bild: Esri, Maxar, Earthstar Geographics" }).addTo(karte);
    const osm = L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png",
      { maxZoom: 19, attribution: "© OpenStreetMap-Mitwirkende" });
    ebKacheln = L.layerGroup().addTo(karte);
    ebOrte = L.layerGroup().addTo(karte);
    ebKand = L.layerGroup().addTo(karte);
    L.control.layers({ "Satellit (Esri)": sat, "OpenStreetMap": osm },
      { "Kandidaten": ebKand, "Bekannte Fundstellen": ebOrte, "Kacheln": ebKacheln }).addTo(karte);
    L.control.scale({ imperial: false }).addTo(karte);
    karte.on("zoomend", () => Object.values(marker).forEach((m) => m.setRadius(radius(m.options._score))));

    document.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", (e) => { e.preventDefault(); tab(b.dataset.tab); }));
    ["f-score", "f-region", "f-klasse", "f-periode", "f-neu", "f-mehrfach"].forEach((id) => $("#" + id).addEventListener("input", zeichne));
    $("#dl-csv").addEventListener("click", (e) => { e.preventDefault(); csv(); });
    $("#liste").addEventListener("click", (e) => {
      const tr = e.target.closest("tr[data-id]");
      if (!tr) return;
      const f = D.kand.find((x) => x.properties.id === tr.dataset.id);
      tab("karte"); zeige(f);
    });
    $("#bericht-wahl").addEventListener("change", (e) => bericht(e.target.value));
    $("#lauf-knopf").addEventListener("click", laufDialog);
    $("#lauf-start").addEventListener("click", laufStarten);

    Promise.all(["data/uebersicht.json", "data/kandidaten.geojson", "data/fundorte.geojson", "data/kacheln.json"]
      .map((u) => lade(u).then((r) => r.json()))).then(([ueb, kand, orte, kacheln]) => {
      const datenstand = $("#lauf-datenstand");
      if (datenstand && ueb.stand) {
        datenstand.textContent = "Geladener Datenstand vom " + new Date(ueb.stand).toLocaleString("de-DE")
          + " · " + ueb.kacheln_ok + " von " + ueb.kacheln_gesamt + " Kacheln erfolgreich bearbeitet";
        datenstand.hidden = false;
      }
      D = { ueb, kand: kand.features, orte: orte.features, kacheln };
      Object.values(ueb.regionen).forEach((r) => {
        const o = document.createElement("option"); o.textContent = r.name; $("#f-region").appendChild(o);
        const o2 = document.createElement("option"); o2.textContent = r.name; o2.value = r.id || ""; if (r.id) $("#lauf-region").appendChild(o2);
        L.rectangle([[r.bbox[1], r.bbox[0]], [r.bbox[3], r.bbox[2]]], { color: "#f5d998", weight: 1, fill: false, dashArray: "4 4", interactive: false }).addTo(ebKacheln);
      });
      Object.values(kacheln).forEach((k) => {
        const ok = k.status === "ok";
        L.rectangle([[k.bbox[1], k.bbox[0]], [k.bbox[3], k.bbox[2]]], { color: ok ? "#7fd6a2" : "#ec7a6e", weight: 1, fillOpacity: 0.04 })
          .bindPopup("<b>Kachel " + esc(k.id) + "</b><br>" + esc(k.region_name) + "<br>" + (ok
            ? "Stand " + esc(k.datum) + " · " + k.n_kandidaten + " Kandidaten · " + k.n_fundorte + " Fundstellen<br>Szenen Frühjahr: "
              + k.szenen.feucht.map((s) => esc(s.datum)).join(", ") + "<br>Szenen Spätsommer: " + k.szenen.trocken.map((s) => esc(s.datum)).join(", ")
              + "<br>auswertbar " + Math.round(k.anteil_auswertbar * 100) + " % · OSM-Maske " + (k.osm_maske ? "ja" : "nein")
            : "Fehler: " + esc(k.fehler))).addTo(ebKacheln);
      });
      D.orte.forEach((f) => {
        const p = f.properties, [lon, lat] = f.geometry.coordinates;
        const c = ortFarbe(p.perioden);
        L.marker([lat, lon], { icon: L.divIcon({ className: "", iconSize: [12, 12],
          html: "<i class=rt style='display:block;background:" + c + "'></i>" }) })
          .bindPopup("<b>" + esc(p.name) + "</b><br>" + esc(p.typ || "") + "<br>"
            + (p.perioden.length ? p.perioden.map((x) => PERIODE[x]).join(", ") + " <span class=muted>(" + esc(p.perioden_quelle) + ")</span>" : "Periode in offenen Katalogen nicht erfasst")
            + (p.perioden_roh.length ? "<br><span class=muted>Katalog: " + esc(p.perioden_roh.join("; ")) + "</span>" : "")
            + (p.perzentil != null ? "<br>Anomalie-Perzentil: " + zahl(p.perzentil * 100) + " %" : "")
            + "<br><span class=muted>" + esc(p.refs.join(", ")) + "</span>").addTo(ebOrte);
      });
      stand();
      zeichne();
      const v = ueb.validierung;
      if (!v || v.ki95[0] <= 0.5) $("#hinweis").insertAdjacentHTML("beforeend",
        " · <b>Validierung:</b> Trennschärfe gegenüber bekannten Fundstellen derzeit nicht nachgewiesen"
        + (v ? " (AUC " + zahl(v.auc, 2) + ")" : "") + ".");
      const b = L.latLngBounds(Object.values(kacheln).map((k) => [[k.bbox[1], k.bbox[0]], [k.bbox[3], k.bbox[2]]]).flat());
      if (b.isValid()) karte.fitBounds(b.pad(0.05));
    }).catch((e) => {
      $("#hinweis").innerHTML = "<b>Noch keine Ergebnisdaten vorhanden</b> – der erste automatische Lauf steht aus. (" + esc(e.message) + ")";
    });

    lade("berichte/index.json").then((r) => r.json()).then((ls) => {
      $("#bericht-wahl").innerHTML = ls.slice().reverse().map((d) => "<option>" + esc(d) + "</option>").join("");
      if (ls.length) bericht(ls[ls.length - 1]);
    }).catch(() => { $("#bericht").textContent = "Noch kein Bericht vorhanden."; });
    lade("METHODIK.md").then((r) => r.text()).then((t) => { $("#methodik").innerHTML = md(t); }).catch(() => {});
  }

  start();
})();
