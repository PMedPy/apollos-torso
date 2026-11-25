import { useLiveQuery } from 'dexie-react-hooks'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDb } from '../db/DbContext'
import type { Exercise, Session, SetEntry } from '../db/model'
import { exerciseName } from '../lib/exercises'
import { formatClock, formatDate, formatKg, formatTime } from '../lib/format'
import { deleteSession, getActiveSession, timeSplit } from '../lib/training'

interface Props {
  running: boolean
  onOpenTraining: () => void
}

/** Startseite mit laufendem Training und Verlauf. */
export function HomePage({ running, onOpenTraining }: Props) {
  const { t, i18n } = useTranslation()
  const db = useDb()
  const lang = i18n.language
  const active = useLiveQuery(() => getActiveSession(db), [db])
  const runningSince = running && active ? active.start : null

  const data = useLiveQuery(async () => {
    const sessions = (await db.sessions.orderBy('start').reverse().toArray()).filter((s) => s.end !== undefined)
    const sets = await db.sets.toArray()
    const exercises = await db.exercises.toArray()
    return { sessions, sets, exercises }
  }, [db])

  const exMap = new Map((data?.exercises ?? []).map((e) => [e.id, e]))
  const setsBySession = new Map<string, SetEntry[]>()
  for (const s of data?.sets ?? []) {
    const list = setsBySession.get(s.sessionId) ?? []
    list.push(s)
    setsBySession.set(s.sessionId, list)
  }
  for (const list of setsBySession.values()) list.sort((a, b) => a.start - b.start)

  return (
    <section className="page">
      <header className="page-header">
        <h1 className="wordmark">{t('app.name')}</h1>
        <p className="motto">{t('app.motto')}</p>
      </header>

      {runningSince !== null && (
        <button type="button" className="card running-card" onClick={onOpenTraining}>
          <span className="running-dot" aria-hidden="true" />
          <span>
            <strong>{t('home.running')}</strong>
            <span className="muted small"> · {t('home.runningSince', { time: formatTime(runningSince, lang) })}</span>
          </span>
          <span aria-hidden="true">›</span>
        </button>
      )}

      {data && data.sessions.length === 0 && runningSince === null && (
        <div className="card">
          <h2>{t('home.emptyTitle')}</h2>
          <p className="muted">{t('home.emptyText')}</p>
        </div>
      )}

      {data && data.sessions.length > 0 && <h2 className="section-title">{t('home.history')}</h2>}
      {data?.sessions.map((s) => (
        <SessionCard key={s.id} session={s} sets={setsBySession.get(s.id) ?? []} exMap={exMap} lang={lang} />
      ))}
    </section>
  )
}

function SessionCard({
  session,
  sets,
  exMap,
  lang,
}: {
  session: Session
  sets: SetEntry[]
  exMap: Map<string, Exercise>
  lang: string
}) {
  const { t } = useTranslation()
  const db = useDb()
  const [open, setOpen] = useState(false)
  const duration = ((session.end ?? session.start) - session.start) / 1000
  const split = timeSplit(sets)

  // Sätze nach Übungsposition gruppieren
  const groups: { position: number; exercise?: Exercise; sets: SetEntry[] }[] = []
  for (const s of sets) {
    const g = groups.find((x) => x.position === s.exercisePosition)
    if (g) g.sets.push(s)
    else groups.push({ position: s.exercisePosition, exercise: exMap.get(s.exerciseId), sets: [s] })
  }

  return (
    <div className="card session-card">
      <button type="button" className="session-head" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>
          <strong>{formatDate(session.start, lang)}</strong>
          <span className="muted small">
            {' '}
            · {formatTime(session.start, lang)} · {formatClock(duration)}
          </span>
        </span>
        <span className="muted small">
          {t('home.exercises', { count: groups.length })} · {t('home.sets', { count: sets.length })}
          {session.rating ? ` · ${session.rating}/10` : ''}
        </span>
      </button>
      {open && (
        <div className="session-detail">
          <div className="time-split">
            <span>
              {t('home.work')} {formatClock(split.workSec)}
            </span>
            <span>
              {t('home.setRest')} {formatClock(split.setRestSec)}
            </span>
            <span>
              {t('home.transition')} {formatClock(split.transitionSec)}
            </span>
          </div>
          {groups.map((g) => (
            <div key={g.position} className="session-group">
              <div className="group-name">{exerciseName(g.exercise, lang)}</div>
              <div className="muted small">
                {g.sets
                  .map((s) => {
                    const amount = g.exercise?.kind === 'isometric' ? `${s.seconds ?? 0} s` : `${s.reps ?? 0}`
                    const w = g.exercise?.bodyweight && s.addedWeightKg === 0 ? '' : ` × ${formatKg(s.addedWeightKg, lang)} kg`
                    return `${s.warmup ? '🚀 ' : ''}${amount}${w}`
                  })
                  .join(' · ')}
              </div>
            </div>
          ))}
          <button
            type="button"
            className="link-btn danger"
            onClick={() => window.confirm(t('home.deleteConfirm')) && void deleteSession(db, session.id)}
          >
            {t('home.deleteTraining')}
          </button>
        </div>
      )}
    </div>
  )
}
