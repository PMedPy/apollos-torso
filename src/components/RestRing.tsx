import { useTranslation } from 'react-i18next'
import { formatClock } from '../lib/format'

interface Props {
  elapsedSec: number
  targetSec: number | null
}

/** Pausenuhr (Skizze C). Mit Ziel als Ring, ohne Ziel als offene Stoppuhr. */
export function RestRing({ elapsedSec, targetSec }: Props) {
  const { t } = useTranslation()
  const r = 88
  const c = 2 * Math.PI * r
  const progress = targetSec ? Math.min(1, elapsedSec / targetSec) : 0
  const over = targetSec !== null && elapsedSec > targetSec
  const remaining = targetSec ? targetSec - elapsedSec : 0

  return (
    <div className={`rest-ring${over ? ' is-over' : ''}`}>
      <svg viewBox="0 0 200 200" aria-hidden="true">
        <circle cx="100" cy="100" r={r} className="rest-ring-track" />
        {targetSec !== null && (
          <circle
            cx="100"
            cy="100"
            r={r}
            className="rest-ring-bar"
            strokeDasharray={c}
            strokeDashoffset={c * (1 - progress)}
            transform="rotate(-90 100 100)"
          />
        )}
      </svg>
      <div className="rest-ring-text">
        <div className="rest-ring-time">
          {targetSec === null || over ? formatClock(elapsedSec) : formatClock(remaining)}
        </div>
        <div className="rest-ring-sub">
          {targetSec === null
            ? t('training.noTimer')
            : over
              ? t('training.over', { time: formatClock(elapsedSec - targetSec) })
              : t('training.of', { time: formatClock(targetSec) })}
        </div>
      </div>
    </div>
  )
}
