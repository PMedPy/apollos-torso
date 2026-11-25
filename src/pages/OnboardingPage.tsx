import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Segmented } from '../components/Segmented'
import { useDb } from '../db/DbContext'
import type { Language } from '../db/model'
import { parseNumber } from '../lib/format'
import { dayKey } from '../lib/ids'
import { updateSettings, useSettings } from '../lib/settings'

const isIos = () => /iphone|ipad|ipod/i.test(navigator.userAgent)
const isStandalone = () =>
  window.matchMedia?.('(display-mode: standalone)').matches ||
  (navigator as Navigator & { standalone?: boolean }).standalone === true

/** Onboarding beim ersten Start: Sprache und Körpergewicht (KG-01, KG-04). */
export function OnboardingPage() {
  const { t } = useTranslation()
  const db = useDb()
  const settings = useSettings()
  const [weight, setWeight] = useState('')
  const [error, setError] = useState<string | null>(null)

  const submit = async () => {
    const kg = parseNumber(weight)
    if (kg === null || kg < 20 || kg > 300) return setError(t('onboarding.invalidWeight'))
    await db.bodyWeights.put({ date: dayKey(), kg })
    await updateSettings(db, { onboardingDone: true, language: settings.language })
  }

  return (
    <section className="page onboarding">
      <header className="page-header">
        <h1 className="wordmark">{t('onboarding.hello')}</h1>
        <p className="motto">{t('onboarding.intro')}</p>
      </header>

      <div className="card stack">
        <Segmented<Language>
          label="Sprache / Language"
          value={settings.language}
          options={[
            { value: 'de', label: 'Deutsch' },
            { value: 'en', label: 'English' },
          ]}
          onChange={(language) => void updateSettings(db, { language })}
        />
      </div>

      <div className="card stack">
        <label className="field">
          <span>{t('onboarding.bodyWeight')}</span>
          <div className="input-unit">
            <input
              className="text-input"
              inputMode="decimal"
              placeholder="75"
              value={weight}
              onChange={(e) => {
                setWeight(e.target.value)
                setError(null)
              }}
            />
            <span>kg</span>
          </div>
        </label>
        <p className="muted small">{t('onboarding.bodyWeightHint')}</p>
        {error && <p className="error-text">{error}</p>}
      </div>

      {isIos() && !isStandalone() && <div className="card notice">{t('onboarding.iosHint')}</div>}

      <button type="button" className="btn-primary btn-big" onClick={() => void submit()}>
        {t('onboarding.start')}
      </button>
    </section>
  )
}
