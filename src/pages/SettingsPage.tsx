import { useTranslation } from 'react-i18next'
import { Segmented } from '../components/Segmented'
import type { Language, ThemePreference } from '../db/model'
import { APP_BRANCH, APP_COMMIT, APP_VERSION } from '../lib/env'
import { updateSettings, useSettings } from '../lib/settings'

export function SettingsPage() {
  const { t } = useTranslation()
  const settings = useSettings()

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="wordmark">{t('nav.settings')}</h1>
      </header>

      <div className="card stack">
        <h2>{t('settings.language')}</h2>
        <Segmented<Language>
          label={t('settings.language')}
          value={settings.language}
          options={[
            { value: 'de', label: 'Deutsch' },
            { value: 'en', label: 'English' },
          ]}
          onChange={(language) => void updateSettings({ language })}
        />
      </div>

      <div className="card stack">
        <h2>{t('settings.theme')}</h2>
        <Segmented<ThemePreference>
          label={t('settings.theme')}
          value={settings.theme}
          options={[
            { value: 'system', label: t('theme.system') },
            { value: 'light', label: t('theme.light') },
            { value: 'dark', label: t('theme.dark') },
          ]}
          onChange={(theme) => void updateSettings({ theme })}
        />
      </div>

      <div className="card stack">
        <h2>{t('settings.about')}</h2>
        <dl className="meta">
          <dt>{t('settings.version')}</dt>
          <dd>
            {APP_VERSION}
            {APP_COMMIT ? ` (${APP_COMMIT})` : ''}
          </dd>
          <dt>{t('settings.branch')}</dt>
          <dd>{APP_BRANCH}</dd>
        </dl>
      </div>
    </section>
  )
}
