# Seker – Methodik

Seker (hebr. סֶקֶר, „Survey“) ist eine autonome Fernerkundungs-Prospektion: Das Programm durchsucht frei verfügbare Satellitendaten Israels nach Anomalien, die auf anthropogene Strukturen hindeuten können, gleicht sie mit bekannten Fundstellen ab, prüft seine eigene Trennschärfe statistisch und schreibt Katalog und Bericht bei jedem Lauf fort. Der inhaltliche Fokus liegt auf Landschaften mit Besiedlung in der Zeit des Ersten Tempels (Eisenzeit II, ca. 1000–586 v. Chr.) und des Zweiten Tempels (persisch bis frührömisch, 516 v. Chr.–70 n. Chr.).

## 1 Was das Verfahren leisten kann – und was nicht

> Ein Kandidat ist eine **messbare Abweichung vom Umfeld mit Prüfbedarf**. Er ist keine Entdeckung, keine Fundstelle und nicht datiert.

1. **Auflösung.** Die einzigen flächendeckend offenen, regelmäßig erneuerten Multispektraldaten sind Sentinel-2 mit 10 m Bodenauflösung. Einzelne Mauern sind damit nicht abbildbar. Erfassbar sind Strukturen ab etwa 20 m: Einfriedungen, Ruinenhügel, Terrassen- und Wegesysteme, Siedlungsböden. Höher aufgelöste Bilder (GovMap-Orthofotos, Google, Maxar, Airbus) sind einsehbar, aber nicht frei für automatische Auswertung lizenziert; sie dienen hier der **manuellen Sichtprüfung**, zu der jeder Kandidat direkt verlinkt ist.
2. **Keine Datierung.** Aus Spektral- und Höhendaten lässt sich kein Alter ableiten. Perioden stammen ausschließlich aus Katalogangaben benachbarter Fundstellen und sind räumlicher Kontext. Ob eine Struktur eisenzeitlich, herodianisch, byzantinisch, osmanisch oder modern ist, entscheidet erst Keramik oder Grabung.
3. **Falsch-Positive sind die Regel.** Der Schwellenwert ist adaptiv; in jeder Kachel wird das auffälligste 1 % der Fläche markiert, auch wenn dort nichts Archäologisches liegt. Feldgrenzen, Fahrspuren, Bewässerung, Brandflächen, Steinbrüche, Lesesteinhaufen und geologische Wechsel erzeugen dieselben Signale.
4. **„Nicht in offenen Katalogen“ heißt nicht unbekannt.** Abgeglichen wird gegen Wikidata und OpenStreetMap. Der Archaeological Survey of Israel der Israel Antiquities Authority (IAA) führt ein Vielfaches an Fundstellen und ist vor jeder weiteren Aussage zu konsultieren.
5. **Rechtlicher und ethischer Rahmen.** Begehungen, Oberflächenfunde und Grabungen bedürfen einer Genehmigung der zuständigen Antikenbehörde (in Israel: Antikengesetz 1978, IAA). Das Programm arbeitet ausschließlich mit Fernerkundungsdaten. Koordinaten von Kandidaten sind öffentlich; wer einen Kandidaten nach Sichtprüfung für eine tatsächlich unregistrierte Fundstelle hält, sollte ihn der Behörde melden und nicht selbst aufsuchen.

6. **Wasserflächen sind nicht auswertbar.** Mittelmeer, Kinneret und Totes Meer werden als Wasser maskiert: Sentinel-2 durchdringt Wasser nur wenige Meter und nur bei ruhiger, klarer See, und die verwendeten Merkmale (Bewuchs, Bodenhelligkeit) gelten nur an Land. Ausgewertet werden die **Uferzonen** – einschließlich der Flächen, die der sinkende Spiegel des Toten Meeres freigibt, und der bei Niedrigwasser trockenfallenden Ufer des Kinneret. Versunkene Hafenanlagen und Wracks erfordern Sonar oder Bathymetrie-LiDAR und liegen außerhalb dieses Verfahrens.

## 2 Datengrundlage

| Datensatz | Auflösung | Verwendung | Lizenz |
|---|---|---|---|
| Sentinel-2 L2A (Copernicus/ESA), über STAC-Katalog Earth Search (AWS) | 10 m (B2, B3, B4, B8), 20 m (B11, B12, SCL) | Spektralmerkmale, Wolkenmaske | frei (Copernicus) |
| Copernicus DEM GLO-30 | 30 m | Local Relief Model, Hangneigung | frei (ESA) |
| ESA WorldCover 2021 v200 | 10 m | Ausschluss Bebauung/Wasser, Landnutzungskontext | CC BY 4.0 |
| OpenStreetMap (Geofabrik-Extrakte Israel/Palästina und Jordanien) | Vektor | Ausschluss moderner Infrastruktur; kartierte Fundstellen | ODbL |
| Wikidata (SPARQL) | Punkt | Fundstellenkatalog mit Perioden | CC0 |
| Referenzliste publizierter Grabungsorte (`prospektion/referenz_perioden.json`) | – | Periodenzuordnung nach Standardliteratur (NEAEHL) | – |

Alle verwendeten Szenen-IDs werden je Kachel in `data/kacheln.json` protokolliert.

## 3 Verarbeitung je Kachel

Das Untersuchungsgebiet besteht aus 23 Regionen, unterteilt in 777 Kacheln von 0,05° × 0,05° (ca. 4,7 × 5,5 km): das Land westlich des Jordan vom Negev bis zum Hula-Tal, die Küstenebenen von Philistäa bis Akko, die Uferzonen von Kinneret und Totem Meer, das Jordantal und das Ostjordanland der Eisenzeit (Gilead, Ammon, Moab, Edom). Jeder Lauf bearbeitet die nächsten Kacheln einer festen, über alle Regionen verschränkten Warteschlange; ist alles einmal abgedeckt, beginnt die Wiederholungsbeobachtung mit den dann neuesten Szenen.

### 3.1 Saisonale Komposite

Archäologische Strukturen zeigen sich jahreszeitlich verschieden: als **Bewuchsmerkmale** im Vegetationsmaximum (über Mauern gehemmter, über verfüllten Gräben geförderter Wuchs) und als **Bodenmerkmale** auf trockenem, offenem Boden. Je Kachel wird daher für zwei Zeitfenster – Frühjahr (15.2.–15.4.) und Spätsommer (15.7.–30.9.) – aus den vier jüngsten abgeschlossenen Jahren je die wolkenärmste, die Kachel voll abdeckende Szene gewählt. Wolken, Wolkenschatten und Zirrus werden über die Scene Classification (SCL) maskiert; das Komposit ist der pixelweise Median. Der Median über mehrere Jahre unterdrückt Einzelereignisse (Ernte, Brand, Bewässerungsgang) und betont dauerhafte Unterschiede.

### 3.2 Merkmale

Sieben Merkmale: im Frühjahr NDVI, NDMI und Helligkeit; im Spätsommer NDVI, Bare-Soil-Index (BSI), Helligkeit und das SWIR-Verhältnis B11/B12 (empfindlich für Ton- und Karbonatanteile, wie sie anthropogene Böden und Kalksteinschutt vom Umfeld unterscheiden).

### 3.3 Lokaler Kontrast

Archäologische Signale sind Abweichungen vom *unmittelbaren* Umfeld. Von jedem Merkmal wird deshalb ein Gauß-Hintergrund (σ = 150 m, normalisierte Faltung ohne maskierte Pixel) abgezogen und das Ergebnis robust standardisiert (Median, MAD).

### 3.4 Multivariate Anomaliedetektion

Auf dem siebendimensionalen Kontraststapel arbeitet der Reed-Xiaoli-Detektor (RX): die quadrierte Mahalanobis-Distanz jedes Pixels zur Hintergrundverteilung der Kachel, deren Mittelwert und Kovarianz robust (nur aus Pixeln mit |z| < 3 in allen Merkmalen) geschätzt werden. Derselbe Detektor wird zusätzlich getrennt für Frühjahrs- und Spätsommermerkmale gerechnet.

### 3.5 Ausschluss moderner Störungen

Nicht ausgewertet werden: Bebauung (30 m Puffer) und Wasser nach WorldCover; Straßen, Wege, Bahnen, Flugplätze, Freileitungen, Pipelines, Zäune sowie Wohn-, Gewerbe-, Abbau-, Militär- und Deponieflächen nach OpenStreetMap (10–30 m Puffer); Flächen mit Spätsommer-NDVI über 0,40 (bewässerte Kulturen, Gärten, dichter immergrüner Bestand – dort sind weder Boden- noch Bewuchsmerkmale beobachtbar); Pixel mit weniger als zwei gültigen Beobachtungen je Saison. Steht der OSM-Extrakt nicht zur Verfügung, läuft die Analyse weiter, kennzeichnet die Ergebnisse („ohne OSM-Maske“) und wiederholt die Kachel bevorzugt.

### 3.6 Objektbildung und Beschreibung

Pixel oberhalb des 99-%-Quantils der RX-Werte ihrer Kachel werden zu zusammenhängenden Objekten gruppiert (400 m² bis 8 ha). Für jedes Objekt: Fläche; Länge, Breite, Rechteckigkeit und Azimut aus der Hauptachsenanalyse; mittlere und maximale RX-Stärke; Anteil der Fläche, der auch in den Einzelsaison-Detektoren auffällig ist (Persistenz); mittleres Local Relief Model (DEM minus 300-m-Tiefpass) und Hangneigung; Landbedeckung; die drei Merkmale mit der stärksten Abweichung. Formklassen: *linear* (Elongation ≥ 4), *erhöht-kompakt* (≥ 3 m über lokalem Mittel), *rechteckig-kompakt* (Rechteckigkeit ≥ 0,7), sonst *unregelmäßig*.

### 3.7 Prioritätsindex

Der Index (0–100) ordnet Kandidaten für die Sichtprüfung. Er ist **keine Wahrscheinlichkeit**.

| Anteil | Gewicht | Berechnung |
|---|---|---|
| Anomaliestärke | 35 % | log₂(RX-Mittel / Schwelle) / 3, begrenzt auf 0…1 |
| Persistenz | 25 % | kleinerer der beiden Saisonanteile |
| Geometrie | 20 % | (Rechteckigkeit − 0,4) / 0,5, begrenzt auf 0…1 |
| Relieflage | 10 % | LRM / 5 m, begrenzt auf 0…1 |
| Landnutzung | 10 % | Ackerland 0,3 · Baumbestand 0,5 · sonst 1,0 |

Je Kachel werden höchstens die zwölf höchstgereihten Objekte mit Index ≥ 30 in den Katalog übernommen. Die Gewichte sind fachlich begründet, aber nicht kalibriert; die Teilwerte werden für jeden Kandidaten offengelegt.

### 3.8 Fortschreibung über Läufe

Wird eine Kachel erneut bearbeitet, gelten Objekte im Abstand ≤ 60 m als Wiederbeobachtung desselben Kandidaten. Der Katalog führt Beobachtungen und Läufe; Kandidaten, die in drei oder mehr Läufen zu weniger als einem Drittel wiedergefunden werden, entfallen. Ändert sich die Methodenversion oder die Maskenlage, werden die Kandidaten der Kachel neu aufgebaut, weil alte und neue Ergebnisse dann nicht vergleichbar sind.

## 4 Fundstellenabgleich und Perioden

Fundstellen aus Wikidata (archäologische Stätten, antike Städte, Ruinen samt Unterklassen) und OpenStreetMap (`historic=archaeological_site|ruins|fort|city_gate|tomb`) werden vereinigt; Einträge unter 100 m Abstand gelten als derselbe Ort. Ein Kandidat gilt als „bei bekannter Fundstelle“, wenn eine solche höchstens 300 m entfernt liegt.

Perioden werden zugeordnet, wenn (a) der Ort in der Referenzliste gut publizierter Grabungsorte steht oder (b) die Katalogangabe (Wikidata „Zeitperiode“/„Kultur“, OSM `historic:civilization`) einem Schlagwort der Eisenzeit bzw. der persischen bis römischen Zeit entspricht. Die Herkunft der Angabe wird stets mitgeführt. Zu beachten: „römisch“ reicht in Katalogen über das Jahr 70 hinaus; die Zuordnung „Zweiter Tempel“ ist in diesen Fällen eine Obergrenze. Für Kandidaten wird die Periodenlage der Fundstellen im Umkreis von 3 km als **Kontext** ausgewiesen.

## 5 Validierung

Für jede Fundstelle wird die höchste RX-Stärke im Umkreis von 150 m (Lageunschärfe der Kataloge) bestimmt und als Perzentil innerhalb von 300 zufälligen Kontrollpunkten derselben Kachel ausgedrückt, die mindestens 500 m von jeder Fundstelle entfernt liegen. Der Mittelwert dieser Perzentile ist eine nach Kacheln stratifizierte AUC: 0,5 bedeutet Zufall, 1,0 perfekte Trennung. Weil Fundstellen einer Kachel Szenen und Kontrollpunkte teilen, stammen Konfidenzintervall und p-Wert aus einem Cluster-Bootstrap über Kacheln.

Diese Kennzahl wird kumulativ und je Region berichtet. Sie beantwortet eine begrenzte Frage: Findet das Verfahren *katalogisierte* – also meist sichtbare, oft freigelegte – Fundstellen häufiger als der Zufall? Über verschüttete Strukturen sagt sie nichts.

## 6 Reproduzierbarkeit

Jeder Lauf protokolliert Commit, Methodenversion, Softwareumgebung, Stand des OSM-Extrakts und sämtliche Szenen-IDs. Alle Parameter stehen in `prospektion/config.py`. Die Kontrollpunkte sind je Kachel deterministisch (Startwert aus der Kachel-ID). Die Tests (`tests/`) prüfen den Detektor an synthetischen Szenen mit bekannter Wahrheit, die Unverzerrtheit der Validierung unter der Nullhypothese sowie Katalog- und Maskenlogik.

```
pip install -r requirements.txt
python -m pytest tests
python -m prospektion lauf --kacheln 20
```

## 7 Empfohlene Prüfschritte je Kandidat

1. Sichtprüfung im hochauflösenden Luftbild einschließlich historischer Aufnahmen; moderne Ursache ausschließen.
2. Abgleich mit dem Archaeological Survey of Israel und den Karten des Survey of Western Palestine (1871–77).
3. Bei fortbestehendem Verdacht Meldung an die Antikenbehörde; Begehung nur mit Genehmigung.

## 8 Literatur

- Agapiou, A., Alexakis, D. D., Sarris, A. & Hadjimitsis, D. G. (2014): Evaluating the potentials of Sentinel-2 for archaeological perspective. *Remote Sensing* 6(3), 2176–2194.
- Casana, J. (2014): Regional-scale archaeological remote sensing in the age of big data. *Advances in Archaeological Practice* 2(3), 222–233.
- Hesse, R. (2010): LiDAR-derived Local Relief Models – a new tool for archaeological prospection. *Archaeological Prospection* 17(2), 67–72.
- Lasaponara, R. & Masini, N. (2007): Detection of archaeological crop marks by using satellite QuickBird multispectral imagery. *Journal of Archaeological Science* 34(2), 214–221.
- Menze, B. H. & Ur, J. A. (2012): Mapping patterns of long-term settlement in Northern Mesopotamia at a large scale. *PNAS* 109(14), E778–E787.
- Orengo, H. A. et al. (2020): Automated detection of archaeological mounds using machine-learning classification of multisensor and multitemporal satellite data. *PNAS* 117(31), 18240–18250.
- Reed, I. S. & Yu, X. (1990): Adaptive multiple-band CFAR detection of an optical pattern with unknown spectral distribution. *IEEE Transactions on Acoustics, Speech, and Signal Processing* 38(10), 1760–1770.
- Stern, E. (Hg.) (1993/2008): *The New Encyclopedia of Archaeological Excavations in the Holy Land*, Bd. 1–5. Jerusalem.
- Zanaga, D. et al. (2022): ESA WorldCover 10 m 2021 v200. doi:10.5281/zenodo.7254221.
