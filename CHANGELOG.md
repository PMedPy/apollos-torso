# Changelog

Format angelehnt an [Keep a Changelog](https://keepachangelog.com/de/1.1.0/). Versionen siehe Lastenheft, Kapitel 10.

## [Unveröffentlicht]

### Phase 1 – Loggen im Gym (erster Stand)

- Onboarding beim ersten Start mit Sprache und Körpergewicht, iOS-Installationshinweis (KG-01, KG-02, KG-04)
- Übungskatalog mit 53 Übungen, unscharfe Suche über Namen und Aliase in DE/EN, eigene Übungen anlegen (UE-01–05, UE-07, UE-08)
- Training: Laden/Abfeuern, Start/Fertig pro Satz, Eingabeblatt mit Standardwerten Satz für Satz aus dem letzten Training (TR-03, TR-04a–e)
- Pausenuhr mit Timer oder offener Stoppuhr, Ton/Vibration bei offener App, Satzpause pro Übung gemerkt (PZ-01–06)
- Aufwärmsätze mit Raketensymbol (TR-13), Sätze bearbeiten und löschen (TR-10)
- Laufendes Training übersteht Schließen und Neuladen der App (TR-09)
- Bewertung 1–10 am Ende, leere Trainings werden verworfen (TR-08)
- Trainings löschen: im Verlauf und beim Beenden als „Training verwerfen“ (TR-14)
- Verlauf auf der Startseite mit Satzzeit, Satzpausen und Wechselzeit
- Einstellungen: Körpergewicht, Gewichtsschritte, Export/Import als JSON, Daten löschen (EI-03, EI-04, EI-07)

### Phase 0 – Fundament

- Grundgerüst mit React, TypeScript und Vite
- PWA: installierbar, offline-fähig, automatische Updates (RB-01, RB-03)
- Vollständiges Datenmodell, Schema-Version 1 (Lastenheft, Kapitel 4)
- Deutsch/Englisch umschaltbar (RB-05, EI-01)
- Hell-/Dunkelmodus nach System oder fest (EI-02)
- Design-Tokens: Akzent `#8F473D`, Fokus-Akzent `#1400F2`, Blaugrün für das „+“ (DS-02)
- Statische Menüleiste aus Kreisen (DS-04, Vorstufe)
- Test- und Lokal-Banner mit Branch-Namen (Lastenheft 11.1)
- Formeln A.1–A.3 mit Tests
- Cloudflare-Konfiguration (`wrangler.jsonc`), CI mit GitHub Actions
- Lastenheft und Formeln nach `docs/` übernommen
