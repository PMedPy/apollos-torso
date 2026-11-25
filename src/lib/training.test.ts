import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { ApollosDb } from '../db/db'
import type { SetEntry } from '../db/model'
import {
  defaultsForNextSet,
  deleteSession,
  deleteSet,
  finishSession,
  nextSetMeta,
  previousSessionSets,
  saveSet,
  sessionSets,
  startSession,
  timeSplit,
} from './training'

const set = (p: Partial<SetEntry>): SetEntry => ({
  id: Math.random().toString(36),
  sessionId: 's',
  exerciseId: 'a',
  exercisePosition: 1,
  setNumber: 1,
  start: 0,
  end: 0,
  addedWeightKg: 0,
  deload: false,
  warmup: false,
  ...p,
})

describe('defaultsForNextSet (TR-04b, TR-04c)', () => {
  const previous = [
    set({ reps: 10, addedWeightKg: 60 }),
    set({ reps: 12, addedWeightKg: 56 }),
    set({ reps: 8, addedWeightKg: 56 }),
  ]

  it('spiegelt das letzte Training Satz für Satz', () => {
    expect(defaultsForNextSet({ bodyweight: false }, previous, [])).toMatchObject({ weightKg: 60, reps: 10 })
    expect(defaultsForNextSet({ bodyweight: false }, previous, [previous[0]])).toMatchObject({
      weightKg: 56,
      reps: 12,
    })
  })

  it('nutzt das letzte Training, auch wenn heute anders gelaufen ist', () => {
    const today = [set({ reps: 7, addedWeightKg: 62.5 })]
    expect(defaultsForNextSet({ bodyweight: false }, previous, today)).toMatchObject({ weightKg: 56, reps: 12 })
  })

  it('mehr Sätze als letztes Mal: übernimmt den vorherigen Satz von heute', () => {
    const today = [...previous, set({ reps: 9, addedWeightKg: 55 })].slice(0, 3)
    today[2] = set({ reps: 9, addedWeightKg: 55 })
    expect(defaultsForNextSet({ bodyweight: false }, previous, today)).toMatchObject({ weightKg: 55, reps: 9 })
  })

  it('ohne Historie: 8 Wdh, 50 kg bzw. 0 kg bei Körpergewicht', () => {
    expect(defaultsForNextSet({ bodyweight: false }, [], [])).toMatchObject({ weightKg: 50, reps: 8 })
    expect(defaultsForNextSet({ bodyweight: true }, [], [])).toMatchObject({ weightKg: 0, reps: 8 })
  })
})

describe('nextSetMeta', () => {
  it('zählt Positionen und Satznummern', () => {
    const s1 = set({ exerciseId: 'a', exercisePosition: 1, setNumber: 1 })
    expect(nextSetMeta([], 'a')).toEqual({ exercisePosition: 1, setNumber: 1 })
    expect(nextSetMeta([s1], 'a')).toEqual({ exercisePosition: 1, setNumber: 2 })
    expect(nextSetMeta([s1], 'b')).toEqual({ exercisePosition: 2, setNumber: 1 })
    const s2 = set({ exerciseId: 'b', exercisePosition: 2, setNumber: 1 })
    // Rückkehr zu a: neue Position, Satznummer läuft weiter
    expect(nextSetMeta([s1, s2], 'a')).toEqual({ exercisePosition: 3, setNumber: 2 })
  })
})

describe('timeSplit (PZ-06)', () => {
  it('trennt Satzzeit, Satzpause und Wechselzeit', () => {
    const sets = [
      set({ exerciseId: 'a', start: 0, end: 30_000 }),
      set({ exerciseId: 'a', start: 120_000, end: 150_000 }),
      set({ exerciseId: 'b', start: 300_000, end: 340_000 }),
    ]
    expect(timeSplit(sets)).toEqual({ workSec: 100, setRestSec: 90, transitionSec: 150 })
  })
})

describe('Datenbank-Ablauf', () => {
  const dbs: ApollosDb[] = []
  const fresh = () => {
    const db = new ApollosDb(`t-${Math.random()}`)
    dbs.push(db)
    return db
  }
  afterEach(async () => {
    for (const d of dbs.splice(0)) await d.delete()
  })

  it('speichert Sätze, findet das letzte Training und verwirft leere Trainings', async () => {
    const db = fresh()
    const s1 = await startSession(db)
    await saveSet(db, { sessionId: s1.id, exerciseId: 'a', start: 1, end: 2, weightKg: 60, reps: 10, warmup: false, plannedRestSec: 90 })
    await saveSet(db, { sessionId: s1.id, exerciseId: 'a', start: 3, end: 4, weightKg: 56, reps: 12, warmup: false, plannedRestSec: 90 })
    expect(await finishSession(db, s1.id, 8)).toBe(true)

    const s2 = await startSession(db)
    expect(s2.id).not.toBe(s1.id)
    const prev = await previousSessionSets(db, 'a', s2.id)
    expect(prev.map((p) => p.addedWeightKg)).toEqual([60, 56])

    expect(await finishSession(db, s2.id, undefined)).toBe(false)
    expect(await db.sessions.get(s2.id)).toBeUndefined()
  })

  it('löscht ein ganzes Training mit allen Sätzen', async () => {
    const db = fresh()
    const s = await startSession(db)
    const base = { sessionId: s.id, exerciseId: 'a', weightKg: 50, reps: 8, warmup: false, plannedRestSec: null }
    await saveSet(db, { ...base, start: 1, end: 2 })
    await saveSet(db, { ...base, start: 3, end: 4 })
    await deleteSession(db, s.id)
    expect(await db.sessions.count()).toBe(0)
    expect(await db.sets.count()).toBe(0)
  })

  it('nummeriert nach dem Löschen neu', async () => {
    const db = fresh()
    const s = await startSession(db)
    const base = { sessionId: s.id, exerciseId: 'a', weightKg: 50, reps: 8, warmup: false, plannedRestSec: null }
    const a1 = await saveSet(db, { ...base, start: 1, end: 2 })
    await saveSet(db, { ...base, start: 3, end: 4 })
    await deleteSet(db, a1)
    const rest = await sessionSets(db, s.id)
    expect(rest.map((r) => r.setNumber)).toEqual([1])
  })
})
