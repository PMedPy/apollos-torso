# ApollosTorso — Lastenheft

| | |
|---|---|
| **Projekt** | ApollosTorso — übungszentrierte Fitness-Tracking-App |
| **Repo / URL** | `apollos-torso` |
| **Version** | 1.5 (Baseline) |
| **Stand** | 23.11.2026 |
| **Auftraggeber, Orchestrierung, User-Tests** | Paul Medebach |
| **Implementierung** | Claude |
| **Git (alle Befehle: Branch, Commit, Push, PR, Merge, Tags)** | Paul |
| **Status** | Verbindliche Baseline zwischen den Chats. Änderungen werden unten im Änderungsprotokoll versioniert. |

Dieses Dokument liegt im Repo unter `docs/LASTENHEFT.md` und ist dort verbindlich. Die ursprünglichen Trainingsnotizen liegen außerhalb des Repos unter `Konzept/archiv/Fitnessapp_Notizen_original.md`.

**Lesehilfe:** Jede Anforderung hat eine ID (z.B. `TR-04`), damit wir in Chats, Commits und Pull Requests eindeutig darauf verweisen können. In eckigen Klammern steht die Phase, in der sie umgesetzt wird (z.B. `[P1]`, siehe Kapitel 10).

---

## 1. Vision & Leitidee

### 1.1 Übungszentriert statt trainingszentriert

Die App stellt die **Übung** ins Zentrum, nicht das Training. Während eines Trainings zeigt sie nicht die Werte des letzten gleichen Trainings, sondern den allgemeinen Bestwert jeder Übung. Ziel: Bestwerte pro Übung schaffen, ohne steif an die Konventionen eines bestimmten Trainingsplans gebunden zu sein. Wer feste Abläufe möchte, nutzt Templates.

### 1.2 Name & Idee

Der Name verweist auf Rilkes Gedicht *Archaïscher Torso Apollos* (Neue Gedichte. Anderer Teil, 1908). Rilke zeigt die Dinglichkeit der Kunst: ein Gegenstand, der den Betrachter in den Bann zieht, durchdringt und zurückschaut. In ApollosTorso wird der eigene Körper zum Kunstwerk und zum Objekt der Betrachtung, nicht nur optisch, sondern mit allem, was Training ausmacht. Die Schlusszeile „Du mußt dein Leben ändern.“ ist das Motto der App.

> Hinweis: Rilkes Gedicht bezieht sich vermutlich auf einen archaischen Torso im Louvre (Torso von Milet), nicht auf den Torso vom Belvedere im Vatikan. Der Name „Belvedere“ (ital. *bel vedere* = schöne Aussicht) wird für die Statistikseite verwendet.

### 1.3 Zielgruppe

Jede Person nutzt die App für sich allein auf dem eigenen Handy. Erste Nutzer: Paul (Android) und seine Freundin (iOS). Das Repo wird öffentlich, damit andere die App ebenfalls nutzen können.

---

## 2. Rahmenbedingungen

| ID | Anforderung |
|---|---|
| RB-01 | Die App ist eine **PWA** (Progressive Web App), installierbar auf Android (Chrome) und iOS (Safari, über „Teilen → Zum Home-Bildschirm“). |
| RB-02 | **Local-first:** Alle Daten liegen ausschließlich auf dem Gerät (IndexedDB). Kein Server, keine Accounts, kein Sync, kein Tracking, keine Analytics. |
| RB-03 | Die App funktioniert vollständig **offline**, sobald sie einmal geladen ist. |
| RB-04 | **iOS-Hinweis:** Nur als Home-Bildschirm-App sind die Daten dauerhaft. Im Safari-Tab löscht iOS Websitedaten nach 7 Tagen ohne Nutzung. Das Onboarding weist auf iOS darauf hin. |
| RB-05 | Sprachen **Deutsch und Englisch**, umschaltbar. |
| RB-06 | **Open Source**, öffentliches GitHub-Repo `apollos-torso`. Lizenz wird in Phase 6 festgelegt. |
| RB-07 | **Hosting:** Cloudflare Workers mit Static Assets (Cloudflare empfiehlt das für neue Projekte statt Pages), Build über Git-Integration, Preview-URL pro Branch. Kostenlos. |
| RB-08 | **Tech-Stack:** React + TypeScript + Vite, Dexie (IndexedDB), Motion (Animationen), vite-plugin-pwa (Service Worker, Manifest), i18n-Bibliothek für DE/EN, Vitest (Tests). |
| RB-09 | **Mobile-first:** Bedienung mit einer Hand und verschwitzten Fingern, große Touch-Flächen. |

---

## 3. Glossar

| Begriff | Bedeutung |
|---|---|
| **Übung** | Eine Bewegung, z.B. Liegestütze. Kern des Trackings. |
| **Satz** | Eine Ausführung einer Übung mit Wiederholungen (dynamisch) oder Haltezeit (isometrisch). Kleinste gespeicherte Einheit. |
| **Training** | Eine Session mit Start, Ende, Sätzen und Bewertung. Container für Sätze. |
| **Template** | Gespeicherte Reihenfolge von Übungen mit Zielsätzen. |
| **Laden / Abfeuern** | Schrotflinten-Prinzip: In der Pause die nächste Übung wählen (laden), dann ihren ersten Satz starten (abfeuern). |
| **Satzpause** | Pause zwischen zwei Sätzen derselben Übung. |
| **Wechselzeit** | Zeit vom letzten Satz einer Übung bis zum ersten Satz der nächsten. |
| **Satzzeit** | Effektive Arbeitszeit von Start bis Fertig eines Satzes. |
| **e1RM** | Geschätztes One-Rep-Maximum: das Gewicht, das man genau einmal schaffen würde. |
| **Effektive Last** | Tatsächlich bewegtes Gewicht inklusive Körpergewichtsanteil. |
| **Deload** | Bewusst reduziertes Ziel, z.B. 85 % des Bestwerts. |
| **Haupt-/Neben-Tag** | Primär bzw. sekundär trainierte Muskelgruppe einer Übung. |
| **Fokus-Modus** | Modus, der Empfehlungen zugunsten gewählter Muskelgruppen und Übungsarten verschiebt. |
| **Belvedere** | Name der Statistikseite. |
| **Ermüdungsfaktor F** | Faktor, der eine Leistung auf „ausgeruht“ hochrechnet. |

---

### 3.1 Begriffe im Code

Der Code ist englisch, damit das Repo auch für andere lesbar ist. Zuordnung:

| Lastenheft | Code |
|---|---|
| Übung | `Exercise` |
| Training | `Session` |
| Satz | `SetEntry` |
| Template | `Template` |
| Körpergewicht | `BodyWeightEntry` |
| Einstellungen | `Settings` |
| Muskelgruppe / Region | `MuscleGroup` / `Region` |
| Haupt-/Neben-Tag | `primaryMuscles` / `secondaryMuscles` |
| dynamisch / isometrisch | `'dynamic'` / `'isometric'` |
| Körpergewichtsübung, Faktor f | `bodyweight`, `bodyweightFactor` |
| Zusatzgewicht | `addedWeightKg` |
| Aufwärmsatz | `warmup` |
| Drücken / Ziehen / Rumpf / Beine | `push` / `pull` / `core` / `legs` |

Die verbindliche Typdefinition steht in `src/db/model.ts`.

---

## 4. Datenmodell

**Grundprinzip:** Gespeichert werden nur Rohdaten. Alles andere (Bestwerte, Metriken, Statistiken) wird berechnet. Rohdaten werden nie durch berechnete Werte überschrieben. Das Modell ist ab Phase 0 vollständig, auch wenn manche Felder erst später genutzt werden, denn Daten, die anfangs nicht gespeichert werden, sind für immer verloren.

```
Übung {
  id, katalogId?,              // gesetzt, wenn aus dem Katalog übernommen
  name,                        // nur bei eigenen Übungen; Katalogname kommt aus der Übersetzung
  typ: "dynamisch" | "isometrisch",
  körpergewicht: boolean,      // Körpergewichtsübung ja/nein (unabhängig von Zusatzgewicht)
  faktor_f: number,            // Anteil des Körpergewichts (nur bei körpergewicht = true)
  hauptTags: Muskelgruppe[],
  nebenTags: Muskelgruppe[],
  standardSatzpause_s?: number,// zuletzt gewählte Satzpause
  erstellt, archiviert?: boolean
}

Training {
  id, start, ende?,
  bewertung?: 1..10,
  templateId?,
  fokusMuskelgruppen: Muskelgruppe[],
  fokusÜbungsart?: "gewicht" | "körpergewicht"
}

Satz {
  id, trainingId, übungId,
  übungsPosition: number,      // die wievielte Übung im Training
  satzNummer: number,          // der wievielte Satz dieser Übung
  start, ende,                 // Zeitstempel
  wdh?: number,                // dynamisch
  sekunden?: number,           // isometrisch
  zusatzgewicht_kg: number,    // bei Hantelübungen das Gewicht, bei Körpergewicht der Zusatz
  deload: boolean,
  aufwärmsatz: boolean,        // Feld vorhanden, Behandlung offen (O-3)
  geplantePause_s?: number     // gewählter Timer danach (null = offene Stoppuhr)
}

Template { id, name, übungen: [{ übungId, zielSätze }] }

Körpergewicht { datum, kg }    // Verlauf, nicht Einzelwert

Einstellungen { sprache, theme, deloadFaktor, tau, fokusStärken, standardWechselpause_s, ... }
```

---

## 5. Muskelgruppen

12 Muskelgruppen für Tags und Statistik, gruppiert in 4 Regionen für die schnelle Fokus-Auswahl. Die Regionen entsprechen dem klassischen Push/Pull/Legs-Split.

| Region | Muskelgruppen |
|---|---|
| **Drücken** | Brust, Schultern, Trizeps |
| **Ziehen** | Rücken, Bizeps, Unterarme |
| **Rumpf** | Bauch, unterer Rücken |
| **Beine** | Quadrizeps, Beinbeuger, Gesäß, Waden |

- Jede Übung hat mindestens einen Haupt-Tag und beliebig viele Neben-Tags.
- Für Statistiken zählt ein Haupt-Tag mit Gewicht 1, ein Neben-Tag mit 0,5 (verbreitete Konvention, kein Studienergebnis).
- Bewusst nicht aufgeteilt: Schultern (vorne/seitlich/hinten) und Rücken (Latissimus/oberer Rücken). Kann später nachgerüstet werden.

---

## 6. Funktionale Anforderungen

### 6.1 Onboarding & Körpergewicht (KG)

| ID | Anforderung | Phase |
|---|---|---|
| KG-01 | Beim ersten Start fragt die App Sprache und **Körpergewicht** ab. Das Körpergewicht ist **Pflicht**. | P1 |
| KG-02 | Das Körpergewicht wird als **Verlauf mit Datum** gespeichert und ist jederzeit aktualisierbar. | P1 |
| KG-03 | Jede Berechnung nutzt das Körpergewicht, das am Tag des jeweiligen Trainings galt (letzter Eintrag vor oder an diesem Datum). | P2 |
| KG-04 | Auf iOS weist das Onboarding auf die Installation als Home-Bildschirm-App hin (RB-04). | P1 |

### 6.2 Übungen & Katalog (UE)

| ID | Anforderung | Phase |
|---|---|---|
| UE-01 | Übungen können **innerhalb und außerhalb eines Trainings** angelegt werden. | P1 |
| UE-02 | Jede Übung ist **dynamisch** (Wiederholungen) oder **isometrisch** (Haltezeit). | P1 |
| UE-03 | Jede Übung ist als **Gewichtsübung** oder **Körpergewichtsübung** markiert. Die Art hängt an der Übung, nicht am einzelnen Satz: Dips mit Gürtel bleiben eine Körpergewichtsübung. | P1 |
| UE-04 | Jede Übung hat Haupt- und Neben-Tags aus den 12 Muskelgruppen (Kapitel 5). | P1 |
| UE-05 | **Übungskatalog** mit ca. 50 häufigen Übungen. Pro Übung: deutscher und englischer Name, **Aliase** (z.B. „Pushups“, „Push-ups“ → Liegestütze), Typ, Gewicht/Körpergewicht, Faktor f, Haupt- und Neben-Tags. | P1 |
| UE-06 | Die Werte für f werden mit Quellen recherchiert und im Repo dokumentiert. Bis dahin stehen vorläufige Werte im Katalog (`src/data/catalog.ts`); sie werden erst ab P2 für Berechnungen genutzt. | P1 / P2 |
| UE-07 | **Vorschläge beim Anlegen:** unscharfe Suche über Namen und Aliase in beiden Sprachen. Treffer am Wortanfang werden bevorzugt, Tippfehler toleriert. Wird ein Vorschlag gewählt, sind alle Felder vorausgefüllt. | P1 |
| UE-08 | Katalog-Übungen werden über ihre `katalogId` angezeigt und wechseln mit der Sprache. Eigene Übungen behalten den eingetippten Namen. | P1 |
| UE-09 | Übungen können bearbeitet und archiviert werden. Archivierte Übungen bleiben in der Statistik erhalten. | P2 |

### 6.3 Trainingsablauf (TR)

| ID | Anforderung | Phase |
|---|---|---|
| TR-01 | Training starten per **One-Click** (freies Training) über das blaugrüne „+“. | P1 |
| TR-02 | Training starten per **Template**. | P2 |
| TR-03 | **Schrotflinten-Prinzip:** In der Pause zwischen zwei Übungen wird die nächste Übung **geladen** (ausgewählt). Mit dem Start ihres ersten Satzes wird sie **abgefeuert**. Mit Template ist die nächste Übung automatisch geladen, ohne Template schlägt der Algorithmus eine vor (ab P5). | P1 |
| TR-04 | Pro Satz: Tap auf **Start**, Tap auf **Fertig**. Danach fährt ein **Eingabeblatt** von unten hoch mit Plus/Minus-Reglern für **Gewicht** und **Wiederholungen** (bzw. Haltezeit). Ein Tap auf die Zahl öffnet die Tastatur. „Speichern“ speichert den Satz und startet direkt die Pause. | P1 |
| TR-04a | Das Feld heißt immer **„Gewicht“**, auch bei Körpergewichtsübungen (dort ist das zusätzliche Gewicht gemeint, z.B. ein Dip-Gürtel). | P1 |
| TR-04b | **Standardwerte Satz für Satz:** Satz n übernimmt Gewicht **und** Wiederholungen von Satz n derselben Übung im letzten Training, in dem sie vorkam. Beispiel: letztes Mal 10 × 60 kg, 12 × 56 kg, 8 × 56 kg → heute sind Satz 1 bis 3 genau so vorausgefüllt. Hat das heutige Training mehr Sätze als das letzte, übernimmt der zusätzliche Satz die Werte des vorherigen Satzes von heute. Aufwärmsätze werden dabei mitgezählt, damit die Reihenfolge stimmt. | P1 |
| TR-04c | **Ohne Historie** (Übung wurde noch nie ausgeführt): **8 Wiederholungen**, **50 kg** bei Gewichtsübungen, 0 kg bei Körpergewichtsübungen. Bei isometrischen Übungen ist der Standard immer die gestoppte Zeit zwischen Start und Fertig. Das Ziel (TR-06, ab P2) wird nur angezeigt und füllt das Eingabeblatt nicht vor. | P1 |
| TR-04d | Gewichtsschritte der Plus/Minus-Regler: Standard 2,5 kg, in den Einstellungen änderbar. | P1 |
| TR-04e | Die App **empfiehlt kein höheres Gewicht** zur Progression. Das Ziel ist immer eine Wiederholungszahl beim gewählten Gewicht. Eine Gewichtsempfehlung kommt höchstens später als erweiterte Option (EI-08). | P1 |
| TR-05 | Bei isometrischen Übungen läuft zwischen Start und Fertig eine sichtbare Stoppuhr. Die Haltezeit ergibt sich daraus und ist korrigierbar. | P1 |
| TR-06 | Pro Übung werden während des Trainings angezeigt: **Bestwert** und die **nötigen Wiederholungen bzw. die nötige Zeit**, um ihn zu schlagen (FORMELN.md, A.2 und A.9). | P2 |
| TR-07 | **Deload-Slider pro Übung:** normaler Bestwert oder Deload. Im Deload-Modus wird das Ziel mit dem Deload-Faktor multipliziert (A.10). Sätze werden als Deload markiert. | P2 |
| TR-08 | Am Ende des Trainings: Frage „Wie war das Training?“ mit Bewertung von **1 bis 10**. | P1 |
| TR-09 | Ein laufendes Training übersteht das Schließen der App und einen Neustart des Handys (sofortige Speicherung jedes Satzes). | P1 |
| TR-10 | Sätze können nachträglich korrigiert oder gelöscht werden, über eine aufklappbare Zeile mit den heutigen Sätzen der Übung. | P1 |
| TR-11 | **Layout der Trainingsseite:** eine Übung im **Vollbild** (Skizze A): Übungsname, Ziel groß in der Mitte, Satz-Punkte, darunter Pausen-Chip und großer Start-Button. Keine Reizüberflutung. | P1 |
| TR-11a | **Pausenansicht** (Skizze C): Pausenuhr in der Mitte. Zwischen zwei Übungen ist unten die nächste Übung **geladen** (änderbar), ein Tap auf „Abfeuern“ startet ihren ersten Satz. | P1 |
| TR-12 | **Trainingsansicht per kräftigem Ziehen** nach oben/unten: zeigt das ganze Training (bisherige Übungen, Pausen, bei Template auch kommende) zum Auswählen. Die Seite wird ab P1 als Stapel aus Ebenen aufgebaut, damit die Geste später ohne Umbau dazukommt. | später (P4/P5) |
| TR-13 | **Aufwärmsätze** werden im Eingabeblatt mit einem kleinen **Raketensymbol** markiert. Sie zählen nicht für Bestwerte und nicht für „Sätze pro Muskelgruppe“, erscheinen aber im Verlauf und in der Zeitstatistik. | P1 |
| TR-14 | **Trainings löschen:** ein abgeschlossenes Training im Verlauf (mit Sicherheitsabfrage) und ein laufendes Training beim Beenden („Training verwerfen“), z.B. für Testtrainings. | P1 |

### 6.4 Pausen & Zeit-Tracking (PZ)

| ID | Anforderung | Phase |
|---|---|---|
| PZ-01 | **Ein Pausen-Dropdown** mit sortierten Dots: 45 s, 1 min, 1,5 min, 2 min, plus eigene Werte. Im Bubble-Design (DS-05). | P1 (einfach), P4 (Bubbles) |
| PZ-02 | Die **Art der Pause ergibt sich aus dem Kontext:** innerhalb einer Übung Satzpause, zwischen zwei Übungen Wechselpause. Keine manuelle Auswahl. | P1 |
| PZ-03 | **Timer optional:** Countdown mit gewählter Länge oder offene Stoppuhr ohne Ziel. | P1 |
| PZ-04 | Die **Satzpause wird pro Übung gemerkt** und beim nächsten Mal vorausgewählt. Die **Wechselpause** hat einen allgemeinen Standard in den Einstellungen. | P2 |
| PZ-05 | **Kein Always-on-Display.** Der Timer basiert auf Zeitstempeln und zeigt nach dem Entsperren die korrekte Zeit bzw. die Überschreitung. Ton/Vibration am Timer-Ende nur bei offener App (Vibration nur Android). Wer einen Alarm bei gesperrtem Bildschirm braucht, nutzt die iOS-Uhr oder eine längere Display-Laufzeit. | P1 |
| PZ-06 | Getrackt werden drei Zeitarten: **Satzzeit** (Start → Fertig), **Satzpause** (Fertig → nächster Start derselben Übung), **Wechselzeit** (letzter Fertig einer Übung → erster Start der nächsten). | P1 |

### 6.5 Bestwerte & Metriken (ME)

| ID | Anforderung | Phase |
|---|---|---|
| ME-01 | **Bestwert dynamischer Übungen = geschätztes 1RM** nach Epley (A.1). Er ersetzt die ursprüngliche Idee „Volumen × Wdh × Sätze“, weil Volumen leichte Gewichte mit vielen Wiederholungen bevorzugt. | P2 |
| ME-02 | Bei Körpergewichtsübungen wird mit der **effektiven Last** gerechnet (A.3). | P2 |
| ME-03 | Bestwert isometrischer Übungen: längste Haltezeit bei mindestens gleicher effektiver Last (Vorschlag, siehe offene Punkte). | P2 |
| ME-04 | **Allzeit-Bestwert** pro Übung. | P2 |
| ME-05 | **Aktueller Bestwert** mit zeitlichem Zerfall (A.4). Gewichtet nach Zeit, nicht nach Anzahl Trainings, weil Muskelabbau an der Zeit ohne Reiz hängt. τ ist einstellbar. | P2 |
| ME-06 | **Volumen** als eigene Metrik (A.5), nicht als Bestwert. | P2 |
| ME-07 | **Ermüdungsfaktor:** Leistungen werden auf „ausgeruht“ hochgerechnet, abhängig von systemischer Vorbelastung (alle Sätze vorher) und lokaler Vorbelastung (Sätze vorher auf denselben Muskelgruppen) (A.6). Der Faktor wird nach oben begrenzt. | P3 (Platzhalter), P5 (geschätzt) |
| ME-08 | Die Parameter a und b des Ermüdungsfaktors werden in Phase 5 **aus den eigenen Daten geschätzt** (A.7), gemeinsam über alle Übungen. | P5 |
| ME-09 | **Live-Ziel:** Während des Trainings wird das Ziel auf den aktuellen Ermüdungszustand zurückgerechnet (A.8). Gespeichert und verglichen wird auf der „frischen“ Skala, angezeigt auf der „jetzigen“. | P5 |
| ME-10 | Die Ermüdungsbereinigung gilt für Bestwerte, Top-Übungsmetrik und Progressionskurven. **Nicht** für Volumen, Sätze pro Muskelgruppe und Zeitstatistiken. Aufwärmsätze zählen für die Vorbelastung S mit, weil sie real ermüden. | P3 |
| ME-11 | **Top-Übungsmetrik:** Leistung im heutigen Training gegenüber dem Mittel der letzten 3 Trainings mit dieser Übung, als Prozent mit Pfeil (hoch/gleich/runter) (A.11). | P3 |
| ME-12 | **Sätze pro Muskelgruppe pro Woche** (A.12), ohne Aufwärmsätze (TR-13). | P3 |

### 6.6 Belvedere — Statistik (ST)

| ID | Anforderung | Phase |
|---|---|---|
| ST-01 | Die Statistikseite heißt **Belvedere**. Ihr Icon ist ein stilisierter **Torso** (eigene Zeichnung). | P3 |
| ST-02 | **Übungsebene:** zeitliche Progression pro Übung über mehrere Parameter (Bestwert, aktueller Bestwert, Volumen), Umschalter „roh / bereinigt“. | P3 |
| ST-03 | **Trainingsebene:** Dauer, Übungen, Gesamtmetriken, Bewertung, effektive Zeit vs. Pausenzeit vs. Wechselzeit. | P3 |
| ST-04 | **Pausenstatistik pro Übung:** durchschnittliche Satzpause. | P3 |
| ST-05 | **Verlaufsebene:** Wochen- und Monatsmetriken (Details offen, siehe Kapitel 12). | P3 |
| ST-06 | **Sätze pro Muskelgruppe pro Woche** (12 Gruppen, aufsummierbar zu den 4 Regionen). | P3 |
| ST-07 | Fokus-Phasen sind in der Statistik erkennbar (Vergleich Fokus vs. Nicht-Fokus). | P5 |

### 6.7 Templates (TP)

| ID | Anforderung | Phase |
|---|---|---|
| TP-01 | Template aus einem abgeschlossenen Training erstellen. | P2 |
| TP-02 | Template von Grund auf neu erstellen. | P2 |
| TP-03 | Template aus den letzten 10 Trainings generieren (Markov-Modell, A.13). | P5 |

### 6.8 Empfehlungen (EM)

| ID | Anforderung | Phase |
|---|---|---|
| EM-01 | Beim Laden der nächsten Übung in einem freien Training wird eine Übung empfohlen. | P5 |
| EM-02 | Algorithmus: **Markov-Kette erster Ordnung** über Übungsübergänge (A.13). Logit = log(Anzahl + 1), Auswahl per Softmax mit Temperatur. Keine KI. | P5 |
| EM-03 | Ohne Daten (neue Nutzer) wird nach Häufigkeit bzw. Katalog-Standard empfohlen. | P5 |

### 6.9 Fokus-Modus (FO)

| ID | Anforderung | Phase |
|---|---|---|
| FO-01 | Auf der Startseite aktivierbar. Auswahl der Fokus-**Muskelgruppen** (per Region oder einzeln) und/oder der Fokus-**Übungsart** (Gewicht / Körpergewicht). | P5 |
| FO-02 | Im Fokus-Modus wechselt die Akzentfarbe von `#8F473D` zu **`#1400F2`**. | P5 |
| FO-03 | Empfehlungen werden zugunsten passender Übungen verschoben, an frühen Positionen im Training stärker als an späten (A.14). | P5 |
| FO-04 | Die Fokus-Auswahl wird **als Tags im Training** gespeichert. | P0 (Feld), P5 (Nutzung) |
| FO-05 | **Sportphysiologische Grundlage:** Mehr Wochensätze pro Muskelgruppe bringen mehr Muskelwachstum, mit abflachender Kurve ([Schoenfeld et al. 2017](https://www.researchgate.net/publication/305455324), [Baz-Valle et al. 2022](https://pmc.ncbi.nlm.nih.gov/articles/PMC8884877)). Übungen am Anfang des Trainings gewinnen mehr Kraft ([Nunes et al. 2021](https://pubmed.ncbi.nlm.nih.gov/32077380/)). Fokus heißt Spezialisierung, nicht „überall mehr“. | — |

### 6.10 Einstellungen & Daten (EI)

| ID | Anforderung | Phase |
|---|---|---|
| EI-01 | Sprache DE/EN. | P1 |
| EI-02 | Hell-/Dunkelmodus (automatisch nach System oder manuell). | P1 |
| EI-03 | Körpergewicht eintragen, Verlauf ansehen. | P1 |
| EI-04 | **Export** aller Daten als JSON, **Import** aus JSON. | P1 |
| EI-05 | **Erweiterte Einstellungen:** Deload-Faktor (0–1), Zerfallskonstante τ, Fokus-Stärken β_M und β_T, Standard-Wechselpause. | P2 / P5 |
| EI-06 | Einstellungen zurücksetzen. | P1 |
| EI-07 | Datenbank zurücksetzen (mit Sicherheitsabfrage und Export-Angebot vorher). | P1 |
| EI-08 | **Gewichts-Progressionsempfehlung** (erweiterte Option, standardmäßig aus): Die App schlägt vor, wann das Gewicht erhöht werden sollte. | später |

### 6.10a Profile (PF) — gestrichen

Am 25.11. gestrichen: Jede Person nutzt ein eigenes Handy, ein gemeinsames Gerät kommt nicht vor. Für gemeinsame Auswertungen werden Backups (EI-04) ausgetauscht. Die IDs PF-01 bis PF-04 werden nicht wiederverwendet.

### 6.11 Rilke & Easter Eggs (EE)

| ID | Anforderung | Phase |
|---|---|---|
| EE-01 | **Erster Start:** Rilkes *Archaïscher Torso Apollos* vollständig im Onboarding, langsam eingeblendet. Originaltext mit originaler Schreibweise („mußt“). Das Gedicht ist gemeinfrei. | P4 |
| EE-02 | **Jeder weitere Start:** kurzer Splash mit „Du mußt dein Leben ändern.“ | P4 |
| EE-03 | **Easter Egg:** Langes Drücken auf das Logo zeigt das ganze Gedicht. | P4 |
| EE-04 | Im englischen Modus: deutsches Original plus eigene englische Übersetzung (bekannte Übersetzungen sind urheberrechtlich geschützt). | P6 |
| EE-05 | Ein kleines **Easter-Egg-Spiel** (Idee offen). | P6 |

---

## 7. Design (DS)

| ID | Anforderung | Phase |
|---|---|---|
| DS-01 | Modernes Design mit flüssigen Animationen. Referenz: `beispieldesign .png`. | P4 |
| DS-02 | **Farben:** Standard-Akzent `#8F473D`, Akzent im Fokus-Modus `#1400F2`. Hintergrund weiß, im Darkmode schwarz. Flächen von weiß bis körnig-transparent. | P0 (Farbwerte), P4 |
| DS-03 | **Einziger Farbklecks** auf der Hauptseite: das blaugrüne „+“ für ein neues Training. | P1 |
| DS-04 | **Untere Menüleiste aus Kreisen:** Start, Belvedere, Einstellungen, ganz rechts das „+“. Benachbarte, nicht ausgewählte Kreise verschmelzen zu einer Pille mit abgerundeten Ecken und Symbolen. Ist ein Kreis am Rand ausgewählt, sind die drei übrigen verschmolzen; ist ein mittlerer ausgewählt, sind links oder rechts zwei verschmolzen. Umsetzung als Formanimation (Kreis ↔ Pille), nicht per SVG-Blurfilter (Performance auf iOS). | P1 (statisch), P4 (Animation) |
| DS-05 | **Dropdowns als Bubbles** im Stil der Obsidian Graph View, ohne Verbindungslinien: Optionen ploppen als Bubbles auf, lassen sich spielerisch ziehen und werden über eine Gravitationsfunktion zum Ursprungsbutton zurückgezogen. Die Beschriftung zeigt jeweils vom Bildschirmrand weg. Gilt auch für das Pausen-Dropdown. | P4 |
| DS-06 | Die Bubble-Designsprache taucht auch an anderen Stellen der App auf. | P4 |
| DS-07 | App-Icon und Belvedere-Icon: stilisierter Torso, eigene Gestaltung. | P4 |

---

## 8. Nichtfunktionale Anforderungen (NF)

| ID | Anforderung |
|---|---|
| NF-01 | **Datenintegrität:** Rohdaten werden nie durch berechnete Werte überschrieben. Jeder Satz wird sofort gespeichert. |
| NF-02 | **Schema-Migrationen:** Ab Phase 1 liegen echte Trainingsdaten vor. Jede Änderung am Datenmodell braucht eine Dexie-Migration plus Test (Kapitel 11). Echte Daten dürfen durch ein Update nie verloren gehen. |
| NF-03 | **Datenschutz:** Keine Daten verlassen das Gerät, außer durch den vom Nutzer ausgelösten Export. |
| NF-04 | **Performance:** Animationen flüssig auf aktuellen iPhones und Android-Mittelklasse. Statistik-Berechnungen über ein Jahr Daten ohne spürbare Verzögerung. |
| NF-05 | **Offline:** Alle Funktionen ohne Netz. |
| NF-06 | **Nachvollziehbarkeit:** Jede Formel steht in [`FORMELN.md`](FORMELN.md) und hat einen Unit-Test. |
| NF-07 | **Bedienbarkeit:** Touch-Flächen mindestens 44 × 44 pt, Kernfunktionen mit einer Hand erreichbar. |

---

## 9. Anhang A — Formeln

Die Formeln sind nach [`FORMELN.md`](FORMELN.md) ausgelagert, damit es nur eine Quelle gibt. Dort stehen alle Formeln A.1–A.14 mit Lesehilfe und dem Stand der Umsetzung.

---

## 10. Phasenplan

**Prinzip:** So früh wie möglich echte Trainings loggen. Die Intelligenz-Features brauchen Wochen an Daten, deshalb kommt Tracking zuerst und Intelligenz zuletzt. Jede Phase endet mit einem User-Test über die Test-URL (Kapitel 11) und einem Release auf `main`.

| Phase | Inhalt | Abnahmekriterium | Version |
|---|---|---|---|
| **P0 Fundament** | Repo, Grundgerüst (React/TS/Vite), PWA, Cloudflare-Deployment, vollständiges Datenmodell, i18n-Gerüst, Farbwerte, Darkmode, Test-Setup (Vitest, CI) | Die leere App lässt sich auf Android und iOS installieren und offline öffnen. | v0.0 |
| **P1 Loggen im Gym (MVP)** | Onboarding mit Körpergewicht, Übungskatalog + Suche, eigene Übungen, freies Training, Schrotflinte, Start/Fertig pro Satz, Pausen (einfaches Dropdown, Timer/Stoppuhr), Zeit-Tracking, Bewertung, Trainingsverlauf, Export/Import, statische Menüleiste | Paul und seine Freundin nutzen die App im Gym statt Notizen. **Ab hier werden echte Daten gesammelt.** | v0.1 |
| **P2 Bestwerte & Templates** | e1RM, effektive Last, Allzeit- und aktueller Bestwert, nötige Wiederholungen, Deload-Slider, Satzpause pro Übung merken, Templates (aus Training, neu) | Bestwerte und Ziele werden im Training korrekt angezeigt. | v0.2 |
| **P3 Belvedere** | Statistikseite mit Übungs-, Trainings- und Verlaufsebene, Zeitstatistik, Sätze pro Muskelgruppe, Top-Übungsmetrik, Ermüdungsfaktor mit Platzhaltern, Torso-Icon | Fortschritt ist über alle Ebenen nachvollziehbar. | v0.3 |
| **P4 Design & Animation** | Bubble-Menüleiste, Bubble-Dropdowns mit Gravitation, körnige Flächen, Darkmode-Feinschliff, Rilke (Onboarding, Splash, Easter Egg), Icons | Die App fühlt sich so an wie in Kapitel 7 beschrieben. | v0.4 |
| **P5 Intelligenz** | Markov-Empfehlungen, Templates aus den letzten 10 Trainings, Fokus-Modus, Live-Ziel, Schätzung des Ermüdungsfaktors aus eigenen Daten | Empfehlungen sind plausibel und der Fokus-Modus verschiebt sie spürbar. | v0.5 |
| **P6 Extras & Veröffentlichung** | Easter-Egg-Spiel, englische Gedichtübersetzung, README, finale `docs/FORMELN.md`, Lizenz, Repo öffentlich | Fremde können die App aus dem README heraus installieren und nutzen. | v1.0 |

**Vor Phase 1 zu klären:** Layout der Trainingsseite (siehe Kapitel 12).

---

## 11. Test- & Release-Konzept

### 11.1 Umgebungen

| Umgebung | Branch | URL | Zweck |
|---|---|---|---|
| **Produktion** | `main` | feste URL `apollos-torso.<subdomain>.workers.dev` | Echte Nutzung, echte Trainingsdaten |
| **Preview** | jeder Feature-Branch | eigene URL pro Branch, z.B. `phase1-training-apollos-torso.<subdomain>.workers.dev` | User-Tests vor dem Merge |

**Wichtig:** Jede URL ist für den Browser ein eigener Ursprung mit **eigenem Speicher**. Testdaten in einer Preview berühren die echten Daten in der Produktions-App nie. Umgekehrt sind die echten Daten in einer Preview nicht sichtbar. Wer in der Preview mit eigenen Daten testen will, exportiert sie aus der Produktion und importiert sie in die Preview.

Preview-Builds zeigen ein sichtbares **„TEST“-Banner** und bieten einen Button **„Testdaten laden“**, der realistische Beispiel-Trainings über mehrere Wochen erzeugt. So lassen sich Statistiken und Algorithmen testen, ohne wochenlang zu trainieren.

### 11.2 Ablauf pro Feature

Alle Git-Befehle führt **Paul** selbst aus. Claude schreibt nur Dateien in den lokalen Repo-Ordner.

1. **Paul** legt einen Feature-Branch an, z.B. `git switch -c p1-training`.
2. **Claude** implementiert direkt im lokalen Repo-Ordner und führt `npm run check` aus. Am Ende liefert Claude im Chat: einen Vorschlag für die **Commit-Nachricht**, eine **PR-Beschreibung** mit Bezug auf die Anforderungs-IDs und eine **Test-Checkliste**.
3. **Paul** prüft die Änderungen (`git diff`), committet, pusht und öffnet den **Pull Request**.
4. **CI (GitHub Actions)** prüft automatisch: TypeScript-Typprüfung, Unit-Tests, Build. Ein roter Check blockiert den Merge.
5. **Cloudflare** baut den Branch automatisch und postet die **Preview-URL als Kommentar** in den PR. Die URL bleibt pro Branch gleich und zeigt immer den neuesten Stand.
6. **Paul** öffnet die Preview-URL auf Android und, wo relevant, auf dem iPhone, und arbeitet die Test-Checkliste ab. Für die meisten Tests reicht der normale Browser-Tab. Installation als App nur, wenn PWA-Verhalten getestet wird (Offline, Vollbild, Icon).
7. **Feedback** als Kommentar im PR oder direkt im Chat. Claude bessert im Ordner nach, Paul committet und pusht erneut, die Preview aktualisiert sich automatisch.
8. **Abnahme:** Paul merged den PR nach `main`, Cloudflare deployt die Produktion. Die installierte Produktions-App lädt das Update beim nächsten Öffnen.

### 11.3 Automatisierte Tests

| Art | Werkzeug | Was | Ab |
|---|---|---|---|
| **Unit-Tests** | Vitest | Jede Formel aus Anhang A hat Tests mit Hand-gerechneten Beispielen und Randfällen (r = 0, f = 0, leere Historie). | P0 |
| **Migrations-Tests** | Vitest + fake-indexeddb | Für jede Schemaversion eine Beispieldatenbank der Vorversion, die migriert und auf Vollständigkeit geprüft wird. | P1 |
| **Export/Import-Roundtrip** | Vitest | Export → Import ergibt identische Daten. | P1 |
| **End-to-End** (optional) | Playwright | Kernablauf: Training starten, Übung laden, Sätze loggen, Training beenden. | P2 |

### 11.4 Schutz der echten Daten

- Releases mit **Schemaänderung** werden im PR ausdrücklich markiert.
- Vor einem solchen Release exportieren beide Nutzer ihre Daten als Backup.
- Die App erkennt eine Schemaänderung und bietet vor der Migration selbst einen Export an.

### 11.5 Fehlermeldungen

Fehler werden als **GitHub Issue** angelegt mit: Gerät und Browser, Schritten zum Nachstellen, erwartetem und tatsächlichem Verhalten, Screenshot. Eine Issue-Vorlage dafür kommt in Phase 0 ins Repo.

### 11.6 Einmalige Einrichtung (Paul)

1. **Node.js (LTS)** auf dem Mac installieren, falls nicht vorhanden. Prüfen mit `node -v` und `npm -v`.
2. Auf GitHub ein leeres Repo `apollos-torso` anlegen und lokal nach `FitnessApp/apollos-torso` klonen. Diesen Ordner für Claude freigeben.
3. Claude schreibt das Grundgerüst (Phase 0) in den Ordner. Paul führt einmal `npm install` aus, committet und pusht.
4. Einen kostenlosen Cloudflare-Account anlegen.
5. Im Cloudflare-Dashboard unter *Workers & Pages* eine neue Anwendung aus dem Git-Repo importieren (GitHub verbinden, `apollos-torso` wählen). Build-Befehl `npm run build`, Deploy-Befehl `npx wrangler deploy`. Die Konfiguration (Ausgabeordner, Single-Page-App-Verhalten) liegt in `wrangler.jsonc` im Repo. Preview-Builds für alle Branches außer `main` aktivieren. (Menünamen können sich bei Cloudflare ändern.)
6. Die Produktions-URL einmal auf beiden Handys als App installieren.

### 11.7 Versionierung

Semantische Versionen pro Phase (siehe Tabelle in Kapitel 10). Jedes Release auf `main` bekommt einen Git-Tag (gesetzt von Paul) und einen kurzen Eintrag im `CHANGELOG.md` (geschrieben von Claude).

### 11.8 Lokale Befehle (npm-Skripte)

Cloudflare baut und deployt automatisch bei jedem Push. Lokal braucht man die Befehle für die Entwicklung und die Prüfung vor dem Push. Alle sind als npm-Skripte in `package.json` hinterlegt und im README dokumentiert.

| Befehl | Zweck |
|---|---|
| `npm install` | Abhängigkeiten installieren (einmalig und nach Änderungen an `package.json`) |
| `npm run dev` | Entwicklungsserver mit Live-Reload auf dem Mac |
| `npm run dev:lan` | Wie `dev`, aber im WLAN erreichbar, um am Handy zu testen. Über die IP-Adresse (ohne HTTPS) funktionieren Offline-Modus und App-Installation nicht, für UI-Tests reicht es. |
| `npm run build` | Produktions-Build nach `dist/` (macht Cloudflare automatisch) |
| `npm run preview` | Den Produktions-Build lokal ausliefern |
| `npm run test` | Unit-Tests einmal ausführen |
| `npm run test:watch` | Unit-Tests bei jeder Änderung neu ausführen |
| `npm run typecheck` | TypeScript-Typprüfung |
| `npm run lint` | Code-Stil und typische Fehler prüfen |
| `npm run check` | `typecheck` + `lint` + `test` zusammen. **Vor jedem Push ausführen.** Entspricht den CI-Checks. |

---

## 12. Offene Punkte

| # | Punkt | Bis |
|---|---|---|
| ~~O-1~~ | **Entschieden 25.11.:** Vollbild-Übung plus Pausenansicht mit Laden (TR-11, TR-11a), Trainingsansicht später (TR-12). | — |
| ~~O-2~~ | **Entschieden 25.11.:** Alle Daten werden behalten. Statistiken zeigen standardmäßig das letzte Jahr. | — |
| ~~O-3~~ | **Entschieden 25.11.:** Markierbar mit Raketensymbol, zählen nicht für Bestwerte und Sätze pro Muskelgruppe (TR-13). | — |
| O-4 | **Isometrische Metriken:** Reicht „längste Haltezeit bei gleicher Last“ (A.9), oder braucht es eine kombinierte Kennzahl? | vor P2 |
| O-5 | **Startwerte** für d, τ, a, b, F_max, T, β_M, β_T, κ. | P2 / P3 / P5 |
| O-6 | **Trainingsmetrik, Wochen- und Monatsmetrik** genauer definieren. | vor P3 |
| O-7 | **Easter-Egg-Spiel:** Idee. | P6 |
| O-8 | **Lizenz** für das öffentliche Repo. | P6 |

---

## 13. Änderungsprotokoll

| Version | Datum | Änderung |
|---|---|---|
| 1.0 | 23.11.2026 | Baseline aus den ursprünglichen Notizen und der Konzeptdiskussion erstellt. |
| 1.1 | 23.11.2026 | Git-Rolle: Paul führt alle Git-Befehle aus (11.2, 11.6). Lokale npm-Skripte ergänzt (11.8). |
| 1.2 | 23.11.2026 | Ins Repo übernommen (`docs/LASTENHEFT.md`). Anhang A nach `docs/FORMELN.md` ausgelagert. Glossar Code ↔ Lastenheft (3.1). Feld „Aufwärmsatz“ im Datenmodell ergänzt (Behandlung weiter offen, O-3). |
| 1.3 | 23.11.2026 | Akzentfarben festgelegt: Standard `#8F473D`, Fokus-Modus `#1400F2` (DS-02, FO-02). |
| 1.4 | 25.11.2026 | O-1 bis O-3 entschieden. Eingabeblatt mit Standardwerten Satz für Satz aus dem letzten Training, ohne Historie 8 Wdh / 50 kg (TR-04a–e), Layout der Trainingsseite (TR-11, TR-11a), Trainingsansicht später (TR-12), Aufwärmsätze (TR-13). Keine Gewichtsempfehlung, später optional (EI-08). Vorübergehende Profile Süßbär/Ostnase (PF-01–04). |
| 1.5 | 25.11.2026 | Profile gestrichen, jede Person nutzt ihr eigenes Handy (6.10a). Trainings löschen ergänzt (TR-14). Faktoren f vorläufig bis P2 (UE-06). |
