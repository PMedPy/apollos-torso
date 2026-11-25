/**
 * Trainingslogik (Lastenheft 6.3, 6.4). Reine Funktionen oben, Datenbankzugriffe unten.
 */
import Dexie from 'dexie'
import type { ApollosDb } from '../db/db'
import type { Exercise, Session, SetEntry } from '../db/model'
import { DEFAULTS } from './defaults'
import { uid } from './ids'

// ── Reine Funktionen ────────────────────────────────────────────────────────

export interface SetValues {
  weightKg: number
  reps: number
  seconds: number
}

/**
 * Standardwerte für den nächsten Satz (TR-04b, TR-04c).
 *
 * @param previous Sätze dieser Übung im letzten Training, in dem sie vorkam (nach Zeit sortiert)
 * @param today    heutige Sätze dieser Übung (nach Zeit sortiert)
 */
export function defaultsForNextSet(
  exercise: Pick<Exercise, 'bodyweight'>,
  previous: SetEntry[],
  today: SetEntry[],
): SetValues {
  const n = today.length
  const source = previous[n] ?? today[n - 1]
  if (source) {
    return {
      weightKg: source.addedWeightKg,
      reps: source.reps ?? DEFAULTS.firstReps,
      seconds: source.seconds ?? 0,
    }
  }
  return {
    weightKg: exercise.bodyweight ? 0 : DEFAULTS.firstWeightKg,
    reps: DEFAULTS.firstReps,
    seconds: 0,
  }
}

/**
 * Position und Satznummer für einen neuen Satz.
 * Eine neue Übungsposition beginnt, wenn der vorherige Satz eine andere Übung war.
 */
export function nextSetMeta(
  sessionSets: SetEntry[],
  exerciseId: string,
): { exercisePosition: number; setNumber: number } {
  const last = sessionSets[sessionSets.length - 1]
  const setNumber = sessionSets.filter((s) => s.exerciseId === exerciseId).length + 1
  if (last && last.exerciseId === exerciseId) {
    return { exercisePosition: last.exercisePosition, setNumber }
  }
  const maxPos = sessionSets.reduce((m, s) => Math.max(m, s.exercisePosition), 0)
  return { exercisePosition: maxPos + 1, setNumber }
}

export interface TimeSplit {
  workSec: number
  setRestSec: number
  transitionSec: number
}

/** Zeitarten eines Trainings (PZ-06). Sätze müssen nach Zeit sortiert sein. */
export function timeSplit(sets: SetEntry[]): TimeSplit {
  const r: TimeSplit = { workSec: 0, setRestSec: 0, transitionSec: 0 }
  sets.forEach((s, i) => {
    r.workSec += (s.end - s.start) / 1000
    const prev = sets[i - 1]
    if (!prev) return
    const gap = Math.max(0, (s.start - prev.end) / 1000)
    if (prev.exerciseId === s.exerciseId) r.setRestSec += gap
    else r.transitionSec += gap
  })
  return r
}

// ── Datenbank ───────────────────────────────────────────────────────────────

export async function getActiveSession(db: ApollosDb): Promise<Session | undefined> {
  return db.sessions
    .orderBy('start')
    .reverse()
    .filter((s) => s.end === undefined)
    .first()
}

export async function startSession(db: ApollosDb): Promise<Session> {
  const active = await getActiveSession(db)
  if (active) return active
  const session: Session = { id: uid(), start: Date.now(), focusMuscles: [] }
  await db.sessions.add(session)
  return session
}

export async function sessionSets(db: ApollosDb, sessionId: string): Promise<SetEntry[]> {
  const sets = await db.sets.where('sessionId').equals(sessionId).toArray()
  return sets.sort((a, b) => a.start - b.start)
}

/** Beendet ein Training. Ohne Sätze wird es verworfen und false zurückgegeben. */
export async function finishSession(
  db: ApollosDb,
  sessionId: string,
  rating: number | undefined,
): Promise<boolean> {
  return db.transaction('rw', db.sessions, db.sets, async () => {
    const count = await db.sets.where('sessionId').equals(sessionId).count()
    if (count === 0) {
      await db.sessions.delete(sessionId)
      return false
    }
    await db.sessions.update(sessionId, { end: Date.now(), rating })
    return true
  })
}

/** Löscht ein Training mit allen Sätzen (z.B. ein Testtraining). */
export async function deleteSession(db: ApollosDb, sessionId: string): Promise<void> {
  await db.transaction('rw', db.sessions, db.sets, async () => {
    await db.sets.where('sessionId').equals(sessionId).delete()
    await db.sessions.delete(sessionId)
  })
}

/** Sätze einer Übung aus dem letzten Training (vor dem aktuellen), in dem sie vorkam. */
export async function previousSessionSets(
  db: ApollosDb,
  exerciseId: string,
  currentSessionId: string,
): Promise<SetEntry[]> {
  const all = await db.sets
    .where('[exerciseId+start]')
    .between([exerciseId, Dexie.minKey], [exerciseId, Dexie.maxKey])
    .toArray()
  const earlier = all.filter((s) => s.sessionId !== currentSessionId)
  if (earlier.length === 0) return []
  const lastSessionId = earlier.reduce((a, b) => (b.start > a.start ? b : a)).sessionId
  return earlier.filter((s) => s.sessionId === lastSessionId).sort((a, b) => a.start - b.start)
}

export interface NewSet {
  sessionId: string
  exerciseId: string
  start: number
  end: number
  weightKg: number
  reps?: number
  seconds?: number
  warmup: boolean
  plannedRestSec: number | null
}

export async function saveSet(db: ApollosDb, input: NewSet): Promise<SetEntry> {
  return db.transaction('rw', db.sets, async () => {
    const existing = await sessionSets(db, input.sessionId)
    const meta = nextSetMeta(existing, input.exerciseId)
    const set: SetEntry = {
      id: uid(),
      sessionId: input.sessionId,
      exerciseId: input.exerciseId,
      exercisePosition: meta.exercisePosition,
      setNumber: meta.setNumber,
      start: input.start,
      end: input.end,
      reps: input.reps,
      seconds: input.seconds,
      addedWeightKg: input.weightKg,
      deload: false,
      warmup: input.warmup,
      plannedRestSec: input.plannedRestSec,
    }
    await db.sets.add(set)
    return set
  })
}

/** Löscht einen Satz und nummeriert die übrigen Sätze dieser Übung im Training neu. */
export async function deleteSet(db: ApollosDb, set: SetEntry): Promise<void> {
  await db.transaction('rw', db.sets, async () => {
    await db.sets.delete(set.id)
    const rest = (await sessionSets(db, set.sessionId)).filter((s) => s.exerciseId === set.exerciseId)
    await Promise.all(rest.map((s, i) => db.sets.update(s.id, { setNumber: i + 1 })))
  })
}

/** Körpergewicht am Tag eines Zeitstempels (KG-03): letzter Eintrag bis einschließlich dieses Tages. */
export async function bodyWeightOn(db: ApollosDb, day: string): Promise<number | undefined> {
  const entry = await db.bodyWeights.where('date').belowOrEqual(day).last()
  return entry?.kg
}
