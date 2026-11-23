import { useLiveQuery } from 'dexie-react-hooks'
import { db } from '../db/db'
import type { Language, Settings, ThemePreference } from '../db/model'
import { deviceLanguage } from '../i18n'
import { DEFAULTS } from './defaults'

export interface ResolvedSettings {
  language: Language
  theme: ThemePreference
  deloadFactor: number
  decayTauDays: number
  transitionRestSec: number | null
  onboardingDone: boolean
}

export function resolveSettings(stored: Settings | undefined): ResolvedSettings {
  return {
    language: stored?.language ?? deviceLanguage(),
    theme: stored?.theme ?? DEFAULTS.theme,
    deloadFactor: stored?.deloadFactor ?? DEFAULTS.deloadFactor,
    decayTauDays: stored?.decayTauDays ?? DEFAULTS.decayTauDays,
    transitionRestSec:
      stored?.transitionRestSec === undefined ? DEFAULTS.transitionRestSec : stored.transitionRestSec,
    onboardingDone: stored?.onboardingDone ?? false,
  }
}

/** Liefert die aktuellen Einstellungen und aktualisiert sich bei Änderungen. */
export function useSettings(): ResolvedSettings {
  const stored = useLiveQuery(() => db.settings.get('app'), [])
  return resolveSettings(stored)
}

/** Speichert nur die übergebenen Felder; der Rest bleibt erhalten. */
export async function updateSettings(patch: Partial<Omit<Settings, 'id'>>): Promise<void> {
  await db.transaction('rw', db.settings, async () => {
    const current = await db.settings.get('app')
    await db.settings.put({ ...current, ...patch, id: 'app' })
  })
}
