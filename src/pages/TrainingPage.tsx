import { useLiveQuery } from 'dexie-react-hooks'
import { useEffect, useMemo, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { ExercisePicker } from '../components/ExercisePicker'
import { RestChips } from '../components/RestChips'
import { RestRing } from '../components/RestRing'
import { Sheet } from '../components/Sheet'
import { Stepper } from '../components/Stepper'
import { useDb } from '../db/DbContext'
import type { Exercise, SetEntry } from '../db/model'
import { exerciseName } from '../lib/exercises'
import { formatClock, formatKg } from '../lib/format'
import type { LiveState } from '../lib/live'
import { useNow } from '../lib/live'
import { useSettings } from '../lib/settings'
import {
  defaultsForNextSet,
  deleteSession,
  deleteSet,
  finishSession,
  previousSessionSets,
  saveSet,
  sessionSets,
} from '../lib/training'

const DEFAULT_SET_REST_SEC = 90

interface Props {
  live: LiveState
  patch: (p: Partial<LiveState>) => void
  onMinimize: () => void
  /** Training ist vorbei; optional mit Hinweis für den Nutzer */
  onFinished: (message: string | null) => void
  toast: (msg: string) => void
}

type EntryMode = { kind: 'new' } | { kind: 'edit'; set: SetEntry }

/** Trainingsseite (TR-03 bis TR-13, PZ-01 bis PZ-06). */
export function TrainingPage({ live, patch, onMinimize, onFinished, toast }: Props) {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const db = useDb()
  const settings = useSettings()
  const now = useNow(500)

  const sets = useLiveQuery(() => sessionSets(db, live.sessionId), [db, live.sessionId]) ?? []
  const exercises = useLiveQuery(() => db.exercises.toArray(), [db])
  const exMap = useMemo(() => new Map((exercises ?? []).map((e) => [e.id, e])), [exercises])

  const current = live.currentExerciseId ? exMap.get(live.currentExerciseId) : undefined
  const next = live.nextExerciseId ? exMap.get(live.nextExerciseId) : undefined
  const focus = live.transition ? next : current

  const previous =
    useLiveQuery(
      () => (focus ? previousSessionSets(db, focus.id, live.sessionId) : Promise.resolve([])),
      [db, focus?.id, live.sessionId],
    ) ?? []
  const todayOf = (id: string | undefined) => sets.filter((s) => s.exerciseId === id)
  const focusToday = todayOf(focus?.id)
  const defaults = focus ? defaultsForNextSet(focus, previous, focusToday) : null

  const [pickerOpen, setPickerOpen] = useState(() => live.transition && !live.nextExerciseId && !live.currentExerciseId)
  const [entry, setEntry] = useState<EntryMode | null>(null)
  const [rating, setRating] = useState(false)
  const [showToday, setShowToday] = useState(false)

  // Eingabeblatt wiederherstellen, falls die App mit offenem Blatt geschlossen wurde
  const entryOpen = entry !== null || live.pendingEnd !== null
  const entryMode: EntryMode = entry ?? { kind: 'new' }

  // ── Pausen-Timer ──────────────────────────────────────────
  const restElapsed = live.restStartedAt ? (now - live.restStartedAt) / 1000 : 0
  useRestAlarm(live.restStartedAt, live.restTargetSec, restElapsed, live.setStartedAt === null)

  const setRestTarget = (sec: number | null) => {
    patch({ restTargetSec: sec })
    const last = sets[sets.length - 1]
    if (last) void db.sets.update(last.id, { plannedRestSec: sec })
    // Satzpause pro Übung merken (PZ-04); die Wechselpause gilt nur für diese Pause
    if (!live.transition && current) void db.exercises.update(current.id, { defaultSetRestSec: sec })
  }

  // ── Aktionen ──────────────────────────────────────────────
  const startSet = () => patch({ setStartedAt: Date.now(), pendingEnd: null })
  const finishSet = () => patch({ pendingEnd: Date.now() })
  const fire = () => {
    if (!next) return
    patch({
      currentExerciseId: next.id,
      nextExerciseId: null,
      transition: false,
      setStartedAt: Date.now(),
      pendingEnd: null,
    })
  }
  const toTransition = () =>
    patch({
      transition: true,
      nextExerciseId: null,
      restTargetSec: live.restStartedAt ? settings.transitionRestSec : live.restTargetSec,
    })
  const backToCurrent = () => patch({ transition: false, nextExerciseId: null })

  const onPick = (ex: Exercise) => {
    setPickerOpen(false)
    if (live.transition) patch({ nextExerciseId: ex.id })
    else patch({ currentExerciseId: ex.id })
  }

  const askFinish = () => {
    if (live.setStartedAt !== null) return toast(t('training.finishBlocked'))
    setRating(true)
  }
  const finish = async (value: number | undefined) => {
    setRating(false)
    const kept = await finishSession(db, live.sessionId, value)
    onFinished(kept ? null : t('training.emptyDiscarded'))
  }
  const discardTraining = async () => {
    if (!window.confirm(t('training.discardConfirm'))) return
    setRating(false)
    await deleteSession(db, live.sessionId)
    onFinished(t('training.discarded'))
  }

  // ── Ansichten ─────────────────────────────────────────────
  const header = (
    <div className="training-top">
      <button type="button" className="icon-btn" aria-label={t('training.minimize')} onClick={onMinimize}>
        ‹
      </button>
      <button type="button" className="link-btn" onClick={askFinish}>
        {t('training.finish')}
      </button>
    </div>
  )

  let body: React.ReactNode
  if (live.setStartedAt !== null && current) {
    // Satz läuft
    const elapsed = ((live.pendingEnd ?? now) - live.setStartedAt) / 1000
    body = (
      <>
        <ExerciseTitle ex={current} lang={lang} sub={t('training.setN', { n: todayOf(current.id).length + 1 })} />
        <div className="training-center">
          <div className="muted small">{t('training.running')}</div>
          <div className="big-clock">{formatClock(elapsed)}</div>
          {defaults && <NextSetLine ex={current} values={defaults} lang={lang} />}
        </div>
        <button type="button" className="btn-primary btn-big" onClick={finishSet}>
          {t('training.done')}
        </button>
      </>
    )
  } else if (live.transition) {
    // Pausenansicht mit Laden (TR-11a, Skizze C)
    body = (
      <>
        <div className="exercise-title">
          <h1 className="ex-name">{live.restStartedAt ? t('training.pause') : t('app.name')}</h1>
          <p className="muted small">
            {current ? t('training.after', { name: exerciseName(current, lang) }) : t('app.motto')}
          </p>
        </div>
        <div className="training-center">
          {live.restStartedAt && (
            <>
              <RestRing elapsedSec={restElapsed} targetSec={live.restTargetSec} />
              <RestChips value={live.restTargetSec} onChange={setRestTarget} />
            </>
          )}
        </div>
        {next ? (
          <div className="loaded-card">
            <div className="muted small">{t('training.loaded')}</div>
            <div className="loaded-row">
              <span className="loaded-name">{exerciseName(next, lang)}</span>
              <button type="button" className="link-btn" onClick={() => setPickerOpen(true)}>
                {t('training.change')}
              </button>
            </div>
            <LastTime previous={previous} lang={lang} ex={next} />
          </div>
        ) : (
          <button type="button" className="btn-secondary btn-big" onClick={() => setPickerOpen(true)}>
            {current ? t('training.loadNext') : t('training.loadFirst')}
          </button>
        )}
        {next && (
          <button type="button" className="btn-primary btn-big" onClick={fire}>
            {t('training.fire')}
          </button>
        )}
        {current && (
          <button type="button" className="link-btn center" onClick={backToCurrent}>
            {t('training.backTo', { name: exerciseName(current, lang) })}
          </button>
        )}
      </>
    )
  } else if (current) {
    // Vollbild-Übung (TR-11, Skizze A)
    const today = todayOf(current.id)
    const planned = Math.max(previous.length, today.length + 1)
    const resting = live.restStartedAt !== null && today.length > 0
    body = (
      <>
        <ExerciseTitle
          ex={current}
          lang={lang}
          sub={current.primaryMuscles.concat(current.secondaryMuscles).map((m) => t(`muscle.${m}`)).join(' · ')}
        />
        <div className="training-center">
          {resting && <RestRing elapsedSec={restElapsed} targetSec={live.restTargetSec} />}
          <div className="muted small">{t('training.setN', { n: today.length + 1 })}</div>
          {defaults && <NextSetBig ex={current} values={defaults} lang={lang} />}
          <div className="set-dots" aria-hidden="true">
            {Array.from({ length: planned }, (_, i) => (
              <span key={i} className={`dot${i < today.length ? ' is-done' : ''}`} />
            ))}
          </div>
          <LastTime previous={previous} lang={lang} ex={current} />
        </div>

        {today.length > 0 && (
          <div className="today-sets">
            <button type="button" className="link-btn" onClick={() => setShowToday((v) => !v)}>
              {t('training.todaySets', { count: today.length })} {showToday ? '▴' : '▾'}
            </button>
            {showToday &&
              today.map((s) => (
                <div key={s.id} className="today-row">
                  <span>
                    {s.warmup && <span aria-label={t('training.warmup')}>🚀 </span>}
                    {t('training.setN', { n: s.setNumber })}
                  </span>
                  <span>{formatSetValues(s, current, lang, t('common.kg'))}</span>
                  <span className="today-actions">
                    <button type="button" className="link-btn" onClick={() => setEntry({ kind: 'edit', set: s })}>
                      {t('common.edit')}
                    </button>
                    <button
                      type="button"
                      className="link-btn danger"
                      onClick={() => window.confirm(t('training.deleteConfirm')) && void deleteSet(db, s)}
                    >
                      {t('common.delete')}
                    </button>
                  </span>
                </div>
              ))}
          </div>
        )}

        <RestChips value={live.restTargetSec} onChange={setRestTarget} />
        <button type="button" className="btn-primary btn-big" onClick={startSet}>
          {t('training.start')}
        </button>
        <button type="button" className="link-btn center" onClick={toTransition}>
          {t('training.loadNext')}
        </button>
      </>
    )
  } else {
    body = null
  }

  return (
    <div className="training">
      {header}
      <div className="training-body">{body}</div>

      <ExercisePicker open={pickerOpen} onClose={() => setPickerOpen(false)} onPick={onPick} />

      {entryOpen && (current || entryMode.kind === 'edit') && (
        <EntrySheet
          key={entryMode.kind === 'edit' ? entryMode.set.id : `new-${live.pendingEnd}`}
          mode={entryMode}
          exercise={entryMode.kind === 'edit' ? exMap.get(entryMode.set.exerciseId)! : current!}
          defaults={defaults}
          setNumber={entryMode.kind === 'edit' ? entryMode.set.setNumber : todayOf(current?.id).length + 1}
          durationSec={
            entryMode.kind === 'edit'
              ? (entryMode.set.end - entryMode.set.start) / 1000
              : ((live.pendingEnd ?? now) - (live.setStartedAt ?? now)) / 1000
          }
          weightStep={settings.weightStepKg}
          onCancel={() => {
            setEntry(null)
            if (entryMode.kind === 'new') patch({ pendingEnd: null })
          }}
          onDiscard={
            entryMode.kind === 'new'
              ? () => {
                  setEntry(null)
                  patch({ setStartedAt: null, pendingEnd: null })
                }
              : undefined
          }
          onSave={async (v) => {
            if (entryMode.kind === 'edit') {
              await db.sets.update(entryMode.set.id, {
                addedWeightKg: v.weightKg,
                reps: v.reps,
                seconds: v.seconds,
                warmup: v.warmup,
              })
              setEntry(null)
              return
            }
            if (!current || live.setStartedAt === null) return
            const end = live.pendingEnd ?? Date.now()
            const restTarget =
              current.defaultSetRestSec !== undefined ? current.defaultSetRestSec : DEFAULT_SET_REST_SEC
            await saveSet(db, {
              sessionId: live.sessionId,
              exerciseId: current.id,
              start: live.setStartedAt,
              end,
              weightKg: v.weightKg,
              reps: v.reps,
              seconds: v.seconds,
              warmup: v.warmup,
              plannedRestSec: restTarget,
            })
            setEntry(null)
            patch({ setStartedAt: null, pendingEnd: null, restStartedAt: end, restTargetSec: restTarget })
          }}
        />
      )}

      <Sheet open={rating} onClose={() => setRating(false)} label={t('training.rateTitle')}>
        <div className="stack">
          <h2>{t('training.rateTitle')}</h2>
          <div className="rating-grid">
            {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => (
              <button key={n} type="button" className="rating-btn" onClick={() => void finish(n)}>
                {n}
              </button>
            ))}
          </div>
          <button type="button" className="link-btn center" onClick={() => void finish(undefined)}>
            {t('training.rateSkip')}
          </button>
          <button type="button" className="link-btn danger center" onClick={() => void discardTraining()}>
            {t('training.discardTraining')}
          </button>
        </div>
      </Sheet>
    </div>
  )
}

// ── Bausteine ───────────────────────────────────────────────────────────────

function ExerciseTitle({ ex, lang, sub }: { ex: Exercise; lang: string; sub: string }) {
  return (
    <div className="exercise-title">
      <h1 className="ex-name">{exerciseName(ex, lang)}</h1>
      <p className="muted small">{sub}</p>
    </div>
  )
}

function formatSetValues(s: Pick<SetEntry, 'addedWeightKg' | 'reps' | 'seconds'>, ex: Exercise, lang: string, kg: string) {
  const amount = ex.kind === 'isometric' ? `${s.seconds ?? 0} s` : `${s.reps ?? 0}`
  const weight = ex.bodyweight && s.addedWeightKg === 0 ? '' : ` × ${formatKg(s.addedWeightKg, lang)} ${kg}`
  return `${amount}${weight}`
}

function NextSetBig({ ex, values, lang }: { ex: Exercise; values: { weightKg: number; reps: number; seconds: number }; lang: string }) {
  const { t } = useTranslation()
  return (
    <div className="next-big">
      <span className="next-num">{ex.kind === 'isometric' ? `${values.seconds} s` : values.reps}</span>
      <span className="next-unit">
        {ex.kind === 'isometric' ? '' : t('common.reps')}
        {ex.bodyweight && values.weightKg === 0 ? '' : ` · ${formatKg(values.weightKg, lang)} ${t('common.kg')}`}
      </span>
    </div>
  )
}

function NextSetLine({ ex, values, lang }: { ex: Exercise; values: { weightKg: number; reps: number; seconds: number }; lang: string }) {
  const { t } = useTranslation()
  return (
    <div className="muted small">
      {t('training.next')}: {formatSetValues({ addedWeightKg: values.weightKg, reps: values.reps, seconds: values.seconds }, ex, lang, t('common.kg'))}
    </div>
  )
}

function LastTime({ previous, lang, ex }: { previous: SetEntry[]; lang: string; ex: Exercise }) {
  const { t } = useTranslation()
  if (previous.length === 0) return <div className="muted small">{t('training.noHistory')}</div>
  return (
    <div className="muted small last-time">
      {t('training.lastTime')}: {previous.map((s) => formatSetValues(s, ex, lang, t('common.kg'))).join(', ')}
    </div>
  )
}

interface EntryProps {
  mode: EntryMode
  exercise: Exercise
  defaults: { weightKg: number; reps: number; seconds: number } | null
  setNumber: number
  durationSec: number
  weightStep: number
  onCancel: () => void
  onDiscard?: () => void
  onSave: (v: { weightKg: number; reps?: number; seconds?: number; warmup: boolean }) => Promise<void>
}

/** Eingabeblatt nach „Fertig“ (TR-04, TR-13). */
function EntrySheet({ mode, exercise, defaults, setNumber, durationSec, weightStep, onCancel, onDiscard, onSave }: EntryProps) {
  const { t } = useTranslation()
  const iso = exercise.kind === 'isometric'
  const init =
    mode.kind === 'edit'
      ? { weightKg: mode.set.addedWeightKg, reps: mode.set.reps ?? 0, seconds: mode.set.seconds ?? 0, warmup: mode.set.warmup }
      : {
          weightKg: defaults?.weightKg ?? 0,
          reps: defaults?.reps ?? 8,
          seconds: Math.round(durationSec),
          warmup: false,
        }
  const [weight, setWeight] = useState(init.weightKg)
  const [reps, setReps] = useState(init.reps)
  const [seconds, setSeconds] = useState(init.seconds)
  const [warmup, setWarmup] = useState(init.warmup)
  const [saving, setSaving] = useState(false)

  return (
    <Sheet open onClose={onCancel} label={t('training.entryTitle', { n: setNumber })}>
      <div className="stack">
        <div className="sheet-head">
          <h2>{t(mode.kind === 'edit' ? 'training.editTitle' : 'training.entryTitle', { n: setNumber })}</h2>
          <span className="muted small">{t('training.setTime', { time: formatClock(durationSec) })}</span>
        </div>
        <Stepper label={t('training.weight')} value={weight} step={weightStep} decimals={2} max={1000} onChange={setWeight} />
        {iso ? (
          <Stepper label={t('training.secondsLabel')} value={seconds} step={5} max={3600} onChange={setSeconds} />
        ) : (
          <Stepper label={t('training.repsLabel')} value={reps} step={1} max={500} onChange={setReps} />
        )}
        <div className="entry-row">
          {onDiscard ? (
            <button type="button" className="link-btn danger" onClick={onDiscard}>
              {t('training.discard')}
            </button>
          ) : (
            <span />
          )}
          <button
            type="button"
            className={`rocket${warmup ? ' is-active' : ''}`}
            aria-pressed={warmup}
            aria-label={t('training.warmup')}
            title={t('training.warmup')}
            onClick={() => setWarmup((w) => !w)}
          >
            🚀
          </button>
        </div>
        <button
          type="button"
          className="btn-primary btn-big"
          disabled={saving}
          onClick={async () => {
            setSaving(true)
            await onSave({ weightKg: weight, reps: iso ? undefined : reps, seconds: iso ? seconds : undefined, warmup })
          }}
        >
          {mode.kind === 'edit' ? t('common.save') : t('training.saveAndRest')}
        </button>
      </div>
    </Sheet>
  )
}

/** Vibration (Android) und kurzer Ton, wenn die Pause abgelaufen ist und die App offen ist (PZ-05). */
function useRestAlarm(restStartedAt: number | null, target: number | null, elapsed: number, active: boolean) {
  const fired = useRef<string | null>(null)
  useEffect(() => {
    if (!active || !restStartedAt || !target) return
    const id = `${restStartedAt}-${target}`
    if (elapsed >= target && elapsed < target + 5 && fired.current !== id) {
      fired.current = id
      navigator.vibrate?.([200, 100, 200])
      beep()
    }
  }, [active, restStartedAt, target, elapsed])
}

function beep() {
  try {
    const Ctx = window.AudioContext ?? (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext
    const ctx = new Ctx()
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    osc.frequency.value = 880
    gain.gain.setValueAtTime(0.15, ctx.currentTime)
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4)
    osc.connect(gain).connect(ctx.destination)
    osc.start()
    osc.stop(ctx.currentTime + 0.4)
    osc.onended = () => void ctx.close()
  } catch {
    /* kein Ton möglich */
  }
}
