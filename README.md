# ApollosTorso

> *Du mußt dein Leben ändern.* — Rainer Maria Rilke, „Archaïscher Torso Apollos“

Übungszentriertes Trainingstagebuch als Web-App (PWA) für Android und iOS.
Alle Daten bleiben auf dem eigenen Gerät: kein Server, kein Account, kein Tracking.

**Status:** Phase 0 (Fundament). Siehe [Lastenheft](docs/LASTENHEFT.md), Kapitel 10.

## Dokumentation

| Dokument | Inhalt |
|---|---|
| [docs/LASTENHEFT.md](docs/LASTENHEFT.md) | Verbindliche Anforderungen, Phasenplan, Test-Konzept |
| [docs/FORMELN.md](docs/FORMELN.md) | Alle Formeln mit Lesehilfe |
| [CHANGELOG.md](CHANGELOG.md) | Änderungen pro Version |

## Installation auf dem Handy

Produktions-URL im Browser öffnen, dann:

- **Android (Chrome):** Menü ⋮ → *App installieren*
- **iPhone (Safari):** Teilen → *Zum Home-Bildschirm*

Auf dem iPhone muss die App so installiert werden. Im normalen Safari-Tab kann iOS die Daten nach 7 Tagen ohne Nutzung löschen.

## Entwicklung

Voraussetzung: Node.js ≥ 22.

```bash
npm install        # einmalig und nach Änderungen an package.json
npm run dev        # Entwicklungsserver auf http://localhost:5173
```

| Befehl | Zweck |
|---|---|
| `npm run dev` | Entwicklungsserver mit Live-Reload |
| `npm run dev:lan` | Wie `dev`, im WLAN am Handy erreichbar (ohne HTTPS: kein Offline-Modus, keine Installation) |
| `npm run build` | Produktions-Build nach `dist/` |
| `npm run preview` | Produktions-Build lokal ausliefern |
| `npm run test` | Unit-Tests einmal ausführen |
| `npm run test:watch` | Unit-Tests bei jeder Änderung |
| `npm run typecheck` | TypeScript-Typprüfung |
| `npm run lint` | Code prüfen (oxlint) |
| `npm run check` | `typecheck` + `lint` + `test` – **vor jedem Push** |

## Deployment

Cloudflare Workers (Static Assets) baut und deployt automatisch bei jedem Push:

- Branch `main` → Produktion
- jeder andere Branch → eigene Test-URL, als Kommentar im Pull Request

Cloudflare-Einstellungen: Build-Befehl `npm run build`, Deploy-Befehl `npx wrangler deploy`. Die restliche Konfiguration steht in [`wrangler.jsonc`](wrangler.jsonc). Test-Builds zeigen oben ein „TEST“-Banner mit dem Branch-Namen.

## Projektstruktur

```
src/
  db/          Datenmodell (model.ts) und Datenbank (db.ts, Dexie/IndexedDB)
  lib/         Formeln, Einstellungen, Standardwerte, Build-Infos
  i18n/        Übersetzungen Deutsch/Englisch
  components/  Wiederverwendbare Bausteine
  pages/       Seiten (Start, Belvedere, Einstellungen)
  styles/      Design-Tokens
docs/          Lastenheft und Formeln
```

## Lizenz

[MIT](LICENSE)
