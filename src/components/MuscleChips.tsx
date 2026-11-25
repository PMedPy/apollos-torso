import { useTranslation } from 'react-i18next'
import { MUSCLE_GROUPS, type MuscleGroup } from '../db/model'

interface Props {
  value: MuscleGroup[]
  disabled?: MuscleGroup[]
  onChange: (v: MuscleGroup[]) => void
  label: string
}

export function MuscleChips({ value, disabled = [], onChange, label }: Props) {
  const { t } = useTranslation()
  return (
    <div className="chip-wrap" role="group" aria-label={label}>
      {MUSCLE_GROUPS.map((m) => {
        const on = value.includes(m)
        const off = disabled.includes(m)
        return (
          <button
            key={m}
            type="button"
            aria-pressed={on}
            disabled={off}
            className={`chip${on ? ' is-active' : ''}`}
            onClick={() => onChange(on ? value.filter((x) => x !== m) : [...value, m])}
          >
            {t(`muscle.${m}`)}
          </button>
        )
      })}
    </div>
  )
}
