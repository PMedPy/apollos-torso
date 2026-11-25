/**
 * Export und Import aller Daten eines Profils als JSON (EI-04).
 */
import type { ApollosDb } from '../db/db'

export const BACKUP_FORMAT = 1

const TABLES = ['exercises', 'sessions', 'sets', 'templates', 'bodyWeights', 'settings'] as const
type TableName = (typeof TABLES)[number]

export interface Backup {
  app: 'apollos-torso'
  format: number
  schemaVersion: number
  exportedAt: string
  tables: Record<TableName, unknown[]>
}

export async function createBackup(db: ApollosDb): Promise<Backup> {
  const tables = {} as Record<TableName, unknown[]>
  await db.transaction('r', TABLES.map((t) => db.table(t)), async () => {
    for (const t of TABLES) tables[t] = await db.table(t).toArray()
  })
  return {
    app: 'apollos-torso',
    format: BACKUP_FORMAT,
    schemaVersion: db.verno,
    exportedAt: new Date().toISOString(),
    tables,
  }
}

export class BackupError extends Error {}

/** Prüft eine eingelesene Datei. Wirft BackupError mit verständlicher Meldung. */
export function parseBackup(text: string): Backup {
  let data: unknown
  try {
    data = JSON.parse(text)
  } catch {
    throw new BackupError('notJson')
  }
  const b = data as Partial<Backup>
  if (b?.app !== 'apollos-torso' || typeof b.tables !== 'object' || b.tables === null) {
    throw new BackupError('notBackup')
  }
  if (typeof b.format !== 'number' || b.format > BACKUP_FORMAT) throw new BackupError('tooNew')
  for (const t of TABLES) {
    if (!Array.isArray(b.tables[t])) throw new BackupError('notBackup')
  }
  return b as Backup
}

/** Ersetzt alle Daten des Profils durch das Backup – in einer Transaktion, also ganz oder gar nicht. */
export async function restoreBackup(db: ApollosDb, backup: Backup): Promise<void> {
  await db.transaction('rw', TABLES.map((t) => db.table(t)), async () => {
    for (const t of TABLES) {
      await db.table(t).clear()
      await db.table(t).bulkPut(backup.tables[t])
    }
  })
}

export function backupFileName(date = new Date()): string {
  const d = date.toISOString().slice(0, 10)
  return `apollos-torso-${d}.json`
}

/** Bietet die Datei zum Speichern an. Auf dem Handy über das Teilen-Menü, sonst als Download. */
export async function offerFile(name: string, text: string): Promise<void> {
  const file = new File([text], name, { type: 'application/json' })
  const nav = navigator as Navigator & { canShare?: (d: ShareData) => boolean }
  if (nav.canShare?.({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name })
      return
    } catch (e) {
      if ((e as Error).name === 'AbortError') return
    }
  }
  const url = URL.createObjectURL(file)
  const a = document.createElement('a')
  a.href = url
  a.download = name
  document.body.appendChild(a)
  a.click()
  a.remove()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}
