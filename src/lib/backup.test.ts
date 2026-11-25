import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { ApollosDb } from '../db/db'
import { BackupError, createBackup, parseBackup, restoreBackup } from './backup'
import { saveSet, startSession } from './training'

const dbs: ApollosDb[] = []
const fresh = () => {
  const db = new ApollosDb(`b-${Math.random()}`)
  dbs.push(db)
  return db
}
afterEach(async () => {
  for (const d of dbs.splice(0)) await d.delete()
})

describe('Backup (EI-04)', () => {
  it('Export → Import ergibt identische Daten', async () => {
    const a = fresh()
    await a.bodyWeights.put({ date: '2026-11-25', kg: 80 })
    await a.settings.put({ id: 'app', language: 'de', onboardingDone: true })
    const s = await startSession(a)
    await saveSet(a, { sessionId: s.id, exerciseId: 'x', start: 1, end: 2, weightKg: 60, reps: 10, warmup: true, plannedRestSec: 90 })

    const backup = await createBackup(a)
    const text = JSON.stringify(backup)

    const b = fresh()
    await b.bodyWeights.put({ date: '2000-01-01', kg: 1 }) // wird ersetzt
    await restoreBackup(b, parseBackup(text))

    expect(await b.bodyWeights.toArray()).toEqual(await a.bodyWeights.toArray())
    expect(await b.sets.toArray()).toEqual(await a.sets.toArray())
    expect(await b.sessions.toArray()).toEqual(await a.sessions.toArray())
    expect(await b.settings.toArray()).toEqual(await a.settings.toArray())
  })

  it('lehnt fremde Dateien ab', () => {
    expect(() => parseBackup('kein json')).toThrow(BackupError)
    expect(() => parseBackup('{"app":"andere"}')).toThrow(BackupError)
    expect(() => parseBackup(JSON.stringify({ app: 'apollos-torso', format: 99, tables: {} }))).toThrow(BackupError)
  })
})
