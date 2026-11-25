import { useLiveQuery } from 'dexie-react-hooks'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Segmented } from '../components/Segmented'
import { useDb } from '../db/DbContext'
import type { Language, ThemePreference } from '../db/model'
import { BackupError, backupFileName, createBackup, offerFile, parseBackup, restoreBackup } from '../lib/backup'
import { APP_BRANCH, APP_COMMIT, APP_VERSION } from '../lib/env'
import { formatDate, parseNumber } from '../lib/format'
import { dayKey } from '../lib/ids'
import { updateSettings, useSettings } from '../lib/settings'

interface Props {
  trainingRunning: boolean
  toast: (msg: string) => void
}

export function SettingsPage({ trainingRunning, toast }: Props) {
  const { t, i18n } = useTranslation()
  const db = useDb()
  const settings = useSettings()
  const fileInput = useRef<HTMLInputElement>(null)

  const latestWeight = useLiveQuery(() => db.bodyWeights.orderBy('date').last(), [db])
  const [weightText, setWeightText] = useState<string | null>(null)
  const weightValue = weightText ?? (latestWeight ? String(latestWeight.kg) : '')

  const saveWeight = async () => {
    const kg = parseNumber(weightValue)
    if (kg === null || kg < 20 || kg > 300) return toast(t('onboarding.invalidWeight'))
    await db.bodyWeights.put({ date: dayKey(), kg })
    setWeightText(null)
    toast(t('settings.bodyWeightSaved'))
  }

  const exportData = async () => {
    const backup = await createBackup(db)
    await offerFile(backupFileName(), JSON.stringify(backup, null, 2))
  }

  const importData = async (file: File) => {
    try {
      const backup = parseBackup(await file.text())
      const date = formatDate(Date.parse(backup.exportedAt), i18n.language)
      if (!window.confirm(t('settings.importConfirm', { date }))) return
      await restoreBackup(db, backup)
      toast(t('settings.importDone'))
    } catch (e) {
      toast(e instanceof BackupError && e.message === 'tooNew' ? t('settings.importTooNew') : t('settings.importError'))
    }
  }

  const resetData = async () => {
    if (trainingRunning) return toast(t('settings.resetBlocked'))
    if (!window.confirm(t('settings.resetConfirm'))) return
    if (!window.confirm(t('settings.resetConfirm2'))) return
    await db.delete()
    window.location.reload()
  }

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="wordmark">{t('nav.settings')}</h1>
      </header>

      <div className="card stack">
        <h2>{t('settings.bodyWeight')}</h2>
        <div className="row-between">
          <div className="input-unit">
            <input
              className="text-input"
              inputMode="decimal"
              value={weightValue}
              onChange={(e) => setWeightText(e.target.value)}
            />
            <span>kg</span>
          </div>
          <button type="button" className="btn-secondary" onClick={() => void saveWeight()}>
            {t('common.save')}
          </button>
        </div>
      </div>

      <div className="card stack">
        <h2>{t('settings.weightStep')}</h2>
        <Segmented<string>
          label={t('settings.weightStep')}
          value={String(settings.weightStepKg)}
          options={['1', '2.5', '5'].map((v) => ({ value: v, label: `${v.replace('.', i18n.language === 'de' ? ',' : '.')} kg` }))}
          onChange={(v) => void updateSettings(db, { weightStepKg: Number(v) })}
        />
      </div>

      <div className="card stack">
        <h2>{t('settings.language')}</h2>
        <Segmented<Language>
          label={t('settings.language')}
          value={settings.language}
          options={[
            { value: 'de', label: 'Deutsch' },
            { value: 'en', label: 'English' },
          ]}
          onChange={(language) => void updateSettings(db, { language })}
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
          onChange={(theme) => void updateSettings(db, { theme })}
        />
      </div>

      <div className="card stack">
        <h2>{t('settings.data')}</h2>
        <button type="button" className="btn-secondary" onClick={() => void exportData()}>
          {t('settings.export')}
        </button>
        <button type="button" className="btn-secondary" onClick={() => fileInput.current?.click()}>
          {t('settings.import')}
        </button>
        <input
          ref={fileInput}
          type="file"
          accept="application/json,.json"
          hidden
          onChange={(e) => {
            const f = e.target.files?.[0]
            e.target.value = ''
            if (f) void importData(f)
          }}
        />
        <button type="button" className="link-btn danger" onClick={() => void resetData()}>
          {t('settings.reset')}
        </button>
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
