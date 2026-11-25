import { useCallback, useEffect, useState } from 'react'

/**
 * Laufzeit-Zustand des aktiven Trainings, der nicht in die Datenbank gehört
 * (welche Übung gerade geladen ist, ob ein Satz läuft). Liegt im localStorage,
 * damit er Schließen und Neustart der App übersteht (TR-09).
 * Alle Zeiten sind Zeitstempel, damit Timer nach dem Entsperren stimmen (PZ-05).
 */
export interface LiveState {
  sessionId: string
  /** Übung im Fokus (zuletzt abgefeuert) */
  currentExerciseId: string | null
  /** in der Wechselpause geladene nächste Übung */
  nextExerciseId: string | null
  /** true = Wechsel zwischen Übungen (Pausenansicht C), false = innerhalb einer Übung (Ansicht A) */
  transition: boolean
  /** Zeitstempel „Start“ des laufenden Satzes */
  setStartedAt: number | null
  /** Zeitstempel „Fertig“, solange das Eingabeblatt offen ist */
  pendingEnd: number | null
  /** gewählter Pausen-Timer in Sekunden; null = offene Stoppuhr */
  restTargetSec: number | null
  /** Beginn der Pause; null = noch keine (vor dem ersten Satz) */
  restStartedAt: number | null
}

const KEY = 'apollos-torso:live'

function read(): LiveState | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw ? (JSON.parse(raw) as LiveState) : null
  } catch {
    return null
  }
}

function write(state: LiveState | null) {
  try {
    if (state) localStorage.setItem(KEY, JSON.stringify(state))
    else localStorage.removeItem(KEY)
  } catch {
    /* ignorieren */
  }
}

export function freshLive(sessionId: string, restTargetSec: number | null): LiveState {
  return {
    sessionId,
    currentExerciseId: null,
    nextExerciseId: null,
    transition: true,
    setStartedAt: null,
    pendingEnd: null,
    restTargetSec,
    restStartedAt: null,
  }
}

export function useLive() {
  const [live, setLiveState] = useState<LiveState | null>(() => read())

  const setLive = useCallback(
    (next: LiveState | null | ((prev: LiveState | null) => LiveState | null)) => {
      setLiveState((prev) => {
        const value = typeof next === 'function' ? next(prev) : next
        write(value)
        return value
      })
    },
    [],
  )

  const patch = useCallback(
    (p: Partial<LiveState>) => setLive((prev) => (prev ? { ...prev, ...p } : prev)),
    [setLive],
  )

  return { live, setLive, patch }
}

/** Aktuelle Zeit, die sich im Intervall aktualisiert (für Timer). */
export function useNow(intervalMs = 1000): number {
  const [now, setNow] = useState(() => Date.now())
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), intervalMs)
    const onVisible = () => setNow(Date.now())
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.clearInterval(id)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [intervalMs])
  return now
}
