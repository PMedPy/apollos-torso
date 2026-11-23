import 'fake-indexeddb/auto'
import { afterEach, describe, expect, it } from 'vitest'
import { ApollosDb } from './db'
import type { Exercise, Session, SetEntry } from './model'

let counter = 0
const openFreshDb = () => new ApollosDb(`test-${Date.now()}-${counter++}`)
const opened: ApollosDb[] = []

afterEach(async () => {
  for (const d of opened.splice(0)) await d.delete()
})

describe('Datenbank Schema v1', () => {
  it('speichert ein Training mit Übung und Satz und findet die Sätze per Übung wieder', async () => {
    const db = openFreshDb()
    opened.push(db)

    const exercise: Exercise = {
      id: 'ex-1',
      name: 'Ringdips',
      kind: 'dynamic',
      bodyweight: true,
      bodyweightFactor: 1,
      primaryMuscles: ['chest'],
      secondaryMuscles: ['triceps', 'shoulders'],
      createdAt: 1,
      archived: false,
    }
    const session: Session = { id: 's-1', start: 1000, focusMuscles: [] }
    const set: SetEntry = {
      id: 'set-1',
      sessionId: 's-1',
      exerciseId: 'ex-1',
      exercisePosition: 1,
      setNumber: 1,
      start: 1000,
      end: 1030,
      reps: 10,
      addedWeightKg: 0,
      deload: false,
      warmup: false,
      plannedRestSec: 90,
    }

    await db.exercises.add(exercise)
    await db.sessions.add(session)
    await db.sets.add(set)

    const sets = await db.sets.where('exerciseId').equals('ex-1').toArray()
    expect(sets).toHaveLength(1)
    // nicht indizierte Felder bleiben erhalten
    expect(sets[0].plannedRestSec).toBe(90)
    expect(sets[0].warmup).toBe(false)
  })

  it('führt den Körpergewicht-Verlauf mit einem Eintrag pro Tag', async () => {
    const db = openFreshDb()
    opened.push(db)

    await db.bodyWeights.put({ date: '2026-11-23', kg: 80 })
    await db.bodyWeights.put({ date: '2026-11-23', kg: 79.6 }) // gleicher Tag überschreibt
    await db.bodyWeights.put({ date: '2026-11-30', kg: 79.1 })

    const all = await db.bodyWeights.orderBy('date').toArray()
    expect(all.map((e) => e.kg)).toEqual([79.6, 79.1])
  })
})
