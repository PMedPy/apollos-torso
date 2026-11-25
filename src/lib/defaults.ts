import type { Language, ThemePreference } from '../db/model'

/**
 * Standardwerte. Gespeichert werden in den Einstellungen nur Abweichungen.
 * Werte mit PLATZHALTER sind noch nicht festgelegt (Lastenheft, offener Punkt O-5).
 */
export const DEFAULTS = {
  language: 'de' as Language,
  theme: 'system' as ThemePreference,
  /** A.10 – PLATZHALTER */
  deloadFactor: 0.85,
  /** A.4 – PLATZHALTER, in Tagen */
  decayTauDays: 60,
  /** PZ-01 – vorgegebene Pausenlängen in Sekunden */
  restPresetsSec: [45, 60, 90, 120] as const,
  /** PZ-04 – Standard-Wechselpause; null = offene Stoppuhr */
  transitionRestSec: null as number | null,
  /** TR-04d – Schrittweite der Gewichts-Regler */
  weightStepKg: 2.5,
  /** TR-04c – Startwerte ohne Historie */
  firstReps: 8,
  firstWeightKg: 50,
} as const
