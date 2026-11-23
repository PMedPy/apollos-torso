/**
 * Datenmodell von ApollosTorso (Lastenheft, Kapitel 4).
 *
 * Grundprinzip: Gespeichert werden nur Rohdaten. Bestwerte, Metriken und
 * Statistiken werden berechnet und nie zurückgeschrieben (NF-01).
 *
 * Bezeichner im Code sind englisch; die Zuordnung zu den Begriffen im
 * Lastenheft steht in docs/LASTENHEFT.md, Kapitel 3 (Glossar).
 *
 * Zeitstempel sind Millisekunden seit 1970 (Date.now()).
 */

// ── Muskelgruppen (Lastenheft, Kapitel 5) ───────────────────────────────────

export const MUSCLE_GROUPS = [
  'chest',
  'shoulders',
  'triceps',
  'back',
  'biceps',
  'forearms',
  'abs',
  'lowerBack',
  'quads',
  'hamstrings',
  'glutes',
  'calves',
] as const

export type MuscleGroup = (typeof MUSCLE_GROUPS)[number]

export const REGIONS = {
  push: ['chest', 'shoulders', 'triceps'],
  pull: ['back', 'biceps', 'forearms'],
  core: ['abs', 'lowerBack'],
  legs: ['quads', 'hamstrings', 'glutes', 'calves'],
} as const satisfies Record<string, readonly MuscleGroup[]>

export type Region = keyof typeof REGIONS

// ── Übung ───────────────────────────────────────────────────────────────────

/** dynamisch = Wiederholungen, isometrisch = Haltezeit (UE-02) */
export type ExerciseKind = 'dynamic' | 'isometric'

export interface Exercise {
  id: string
  /** gesetzt, wenn aus dem Katalog übernommen; dann kommt der Name aus der Übersetzung (UE-08) */
  catalogId?: string
  /** nur bei eigenen Übungen */
  name?: string
  kind: ExerciseKind
  /** Körpergewichtsübung (UE-03) – hängt an der Übung, nicht am Zusatzgewicht eines Satzes */
  bodyweight: boolean
  /** Anteil des Körpergewichts, der bewegt wird (Formel A.3); 0 bei Gewichtsübungen */
  bodyweightFactor: number
  primaryMuscles: MuscleGroup[]
  secondaryMuscles: MuscleGroup[]
  /** zuletzt gewählte Satzpause in Sekunden (PZ-04); null = offene Stoppuhr */
  defaultSetRestSec?: number | null
  createdAt: number
  archived: boolean
}

// ── Training ────────────────────────────────────────────────────────────────

export type FocusKind = 'weighted' | 'bodyweight'

export interface Session {
  id: string
  start: number
  end?: number
  /** „Wie war das Training?“ 1–10 (TR-08) */
  rating?: number
  templateId?: string
  /** Fokus-Tags (FO-04) – ab Phase 0 gespeichert, genutzt ab Phase 5 */
  focusMuscles: MuscleGroup[]
  focusKind?: FocusKind
}

// ── Satz ────────────────────────────────────────────────────────────────────

export interface SetEntry {
  id: string
  sessionId: string
  exerciseId: string
  /** die wievielte Übung im Training (1-basiert) */
  exercisePosition: number
  /** der wievielte Satz dieser Übung im Training (1-basiert) */
  setNumber: number
  /** Tap auf „Start“ (TR-04) */
  start: number
  /** Tap auf „Fertig“ (TR-04) */
  end: number
  /** dynamische Übungen */
  reps?: number
  /** isometrische Übungen */
  seconds?: number
  /** Gewicht bei Gewichtsübungen, Zusatzgewicht bei Körpergewichtsübungen */
  addedWeightKg: number
  deload: boolean
  /**
   * Aufwärmsatz. Offener Punkt O-3: Ob und wie er aus Statistiken herausfällt,
   * ist noch nicht entschieden. Das Feld existiert trotzdem schon, damit
   * keine Information verloren geht.
   */
  warmup: boolean
  /** gewählter Timer nach diesem Satz in Sekunden; null = offene Stoppuhr */
  plannedRestSec?: number | null
}

// ── Template ────────────────────────────────────────────────────────────────

export interface TemplateItem {
  exerciseId: string
  targetSets: number
}

export interface Template {
  id: string
  name: string
  items: TemplateItem[]
  createdAt: number
}

// ── Körpergewicht ───────────────────────────────────────────────────────────

/** Verlauf, nicht Einzelwert (KG-02). Ein Eintrag pro Tag. */
export interface BodyWeightEntry {
  /** Kalendertag im Format YYYY-MM-DD (lokale Zeit) */
  date: string
  kg: number
}

// ── Einstellungen ───────────────────────────────────────────────────────────

export type Language = 'de' | 'en'
export type ThemePreference = 'system' | 'light' | 'dark'

/**
 * Nur Abweichungen vom Standard werden gespeichert.
 * Standardwerte stehen in src/lib/defaults.ts.
 */
export interface Settings {
  id: 'app'
  language?: Language
  theme?: ThemePreference
  onboardingDone?: boolean
  /** Deload-Faktor d (Formel A.10) */
  deloadFactor?: number
  /** Zerfallskonstante τ in Tagen (Formel A.4) */
  decayTauDays?: number
  /** Standard-Wechselpause in Sekunden (PZ-04); null = offene Stoppuhr */
  transitionRestSec?: number | null
}
