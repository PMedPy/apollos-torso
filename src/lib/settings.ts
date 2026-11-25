import { useLiveQuery } from 'dexie-react-hooks'
import type { ApollosDb } from '../db/db'
import { useDb } from '../db/DbContext'
import type { Language, Settings, ThemePreference } from '../db/model'
import { deviceLanguage } from '../i18n'
import { DEFAULTS } from './defaults'

export interface ResolvedSettings {
  loaded: boolean
  language: Language
  theme: ThemePreference
  deloadFactor: number
  decayTauDays: number
  transitionRestSec: number | null
  weightStepKg: number
  onboardingDone: boolean
}

export function resolveSettings(stored: Settings | undefined, loaded = true): ResolvedSettings {
  return {
    loaded,
    language: stored?.language ?? deviceLanguage(),
    theme: stored?.theme ?? DEFAULTS.theme,
    deloadFactor: stored?.deloadFactor ?? DEFAULTS.deloadFactor,
    decayTauDays: stored?.decayTauDays ?? DEFAULTS.decayTauDays,
    transitionRestSec:
      stored?.transitionRestSec === undefined ? DEFAULTS.transitionRestSec : stored.transitionRestSec,
    weightStepKg: stored?.weightStepKg ?? DEFAULTS.weightStepKg,
    onboardingDone: stored?.onboardingDone ?? false,
  }
}

/** Liefert die aktuellen Einstellungen und aktualisiert sich bei Änderungen. */
export function useSettings(): ResolvedSettings {
  const db = useDb()
  // null = geladen, aber leer; undefined = lädt noch
  const stored = useLiveQuery(async () => (await db.settings.get('app')) ?? null, [db])
  return resolveSettings(stored ?? undefined, stored !== undefined)
}

/** Speichert nur die übergebenen Felder; der Rest bleibt erhalten. */
export async function updateSettings(
  db: ApollosDb,
  patch: Partial<Omit<Settings, 'id'>>,
): Promise<void> {
  await db.transaction('rw', db.settings, async () => {
    const current = await db.settings.get('app')
    await db.settings.put({ ...current, ...patch, id: 'app' })
  })
}
