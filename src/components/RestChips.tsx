import { useTranslation } from 'react-i18next'
import { DEFAULTS } from '../lib/defaults'
import { formatClock } from '../lib/format'

interface Props {
  value: number | null
  onChange: (sec: number | null) => void
}

/**
 * Pausen-Auswahl (PZ-01). Vorerst als Chip-Reihe; die Bubble-Variante kommt in Phase 4.
 * null = offene Stoppuhr ohne Ziel (PZ-03).
 */
export function RestChips({ value, onChange }: Props) {
  const { t } = useTranslation()
  const presets: (number | null)[] = [null, ...DEFAULTS.restPresetsSec]
  const isCustom = value !== null && !DEFAULTS.restPresetsSec.includes(value as never)

  const askCustom = () => {
    const input = window.prompt(t('training.restCustomPrompt'), value ? String(value) : '150')
    if (input === null) return
    const n = Math.round(Number(input.replace(',', '.')))
    if (Number.isFinite(n) && n > 0 && n <= 3600) onChange(n)
  }

  return (
    <div className="rest-chips" role="radiogroup" aria-label={t('training.pause')}>
      {presets.map((p) => (
        <button
          key={String(p)}
          type="button"
          role="radio"
          aria-checked={value === p}
          className={`chip${value === p ? ' is-active' : ''}`}
          onClick={() => onChange(p)}
        >
          {p === null ? t('training.restOpen') : formatClock(p)}
        </button>
      ))}
      <button
        type="button"
        role="radio"
        aria-checked={isCustom}
        className={`chip${isCustom ? ' is-active' : ''}`}
        onClick={askCustom}
      >
        {isCustom ? formatClock(value) : t('training.restCustom')}
      </button>
    </div>
  )
}
