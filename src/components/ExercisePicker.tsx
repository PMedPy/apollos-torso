import { useLiveQuery } from 'dexie-react-hooks'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { CATALOG, type CatalogEntry } from '../data/catalog'
import { useDb } from '../db/DbContext'
import type { Exercise, ExerciseKind, MuscleGroup } from '../db/model'
import { addCustom, addFromCatalog, exerciseName } from '../lib/exercises'
import { searchBy } from '../lib/search'
import { MuscleChips } from './MuscleChips'
import { Segmented } from './Segmented'
import { Sheet } from './Sheet'

interface Props {
  open: boolean
  onClose: () => void
  onPick: (exercise: Exercise) => void
}

/** Übung laden (TR-03): eigene Übungen, Katalogvorschläge (UE-05, UE-07) und eigene anlegen (UE-01). */
export function ExercisePicker({ open, onClose, onPick }: Props) {
  const { t, i18n } = useTranslation()
  const db = useDb()
  const lang = i18n.language
  const [query, setQuery] = useState('')
  const [creating, setCreating] = useState(false)

  const mine = useLiveQuery(
    async () => (await db.exercises.toArray()).filter((e) => !e.archived).sort((a, b) => b.createdAt - a.createdAt),
    [db],
  )

  const { myHits, catalogHits } = useMemo(() => {
    const own = mine ?? []
    const ownCatalogIds = new Set(own.map((e) => e.catalogId).filter(Boolean))
    const catalogRest = CATALOG.filter((c) => !ownCatalogIds.has(c.id))
    const ownTexts = (e: Exercise) => {
      const c = e.catalogId ? CATALOG.find((x) => x.id === e.catalogId) : undefined
      return c ? [c.name.de, c.name.en, ...c.aliases] : [e.name ?? '']
    }
    const catTexts = (c: CatalogEntry) => [c.name.de, c.name.en, ...c.aliases]
    if (!query.trim()) {
      return { myHits: own, catalogHits: catalogRest.slice(0, 0) }
    }
    return {
      myHits: searchBy(query, own, ownTexts, 10),
      catalogHits: searchBy(query, catalogRest, catTexts, 12),
    }
  }, [query, mine])

  const close = () => {
    setQuery('')
    setCreating(false)
    onClose()
  }
  const pick = (ex: Exercise) => {
    setQuery('')
    setCreating(false)
    onPick(ex)
  }

  return (
    <Sheet open={open} onClose={close} label={t('picker.title')} tall>
      {creating ? (
        <CustomForm
          initialName={query}
          onCancel={() => setCreating(false)}
          onCreate={async (input) => pick(await addCustom(db, input))}
        />
      ) : (
        <div className="picker">
          <div className="sheet-head">
            <h2>{t('picker.title')}</h2>
            <button type="button" className="link-btn" onClick={close}>
              {t('common.cancel')}
            </button>
          </div>
          <input
            className="text-input"
            type="search"
            autoFocus
            placeholder={t('picker.search')}
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />

          <div className="picker-list">
            {myHits.length > 0 && <div className="list-label">{t('picker.mine')}</div>}
            {myHits.map((ex) => (
              <button key={ex.id} type="button" className="list-row" onClick={() => pick(ex)}>
                <span>{exerciseName(ex, lang)}</span>
                <span className="muted small">{ex.primaryMuscles.map((m) => t(`muscle.${m}`)).join(' · ')}</span>
              </button>
            ))}

            {catalogHits.length > 0 && <div className="list-label">{t('picker.catalog')}</div>}
            {catalogHits.map((c) => (
              <button
                key={c.id}
                type="button"
                className="list-row"
                onClick={async () => pick(await addFromCatalog(db, c))}
              >
                <span>{lang === 'de' ? c.name.de : c.name.en}</span>
                <span className="muted small">{c.primary.map((m) => t(`muscle.${m}`)).join(' · ')}</span>
              </button>
            ))}

            {query.trim() && myHits.length === 0 && catalogHits.length === 0 && (
              <p className="muted small pad">{t('picker.noResults')}</p>
            )}

            <button type="button" className="list-row is-create" onClick={() => setCreating(true)}>
              {query.trim() ? t('picker.createNamed', { name: query.trim() }) : t('picker.create')}
            </button>
          </div>
        </div>
      )}
    </Sheet>
  )
}

interface FormProps {
  initialName: string
  onCancel: () => void
  onCreate: (input: {
    name: string
    kind: ExerciseKind
    bodyweight: boolean
    primaryMuscles: MuscleGroup[]
    secondaryMuscles: MuscleGroup[]
  }) => void
}

function CustomForm({ initialName, onCancel, onCreate }: FormProps) {
  const { t } = useTranslation()
  const [name, setName] = useState(initialName)
  const [kind, setKind] = useState<ExerciseKind>('dynamic')
  const [load, setLoad] = useState<'weighted' | 'bodyweight'>('weighted')
  const [primary, setPrimary] = useState<MuscleGroup[]>([])
  const [secondary, setSecondary] = useState<MuscleGroup[]>([])
  const [error, setError] = useState<string | null>(null)

  const submit = () => {
    if (!name.trim()) return setError(t('picker.needName'))
    if (primary.length === 0) return setError(t('picker.needPrimary'))
    onCreate({ name, kind, bodyweight: load === 'bodyweight', primaryMuscles: primary, secondaryMuscles: secondary })
  }

  return (
    <div className="picker stack">
      <div className="sheet-head">
        <h2>{t('picker.create')}</h2>
        <button type="button" className="link-btn" onClick={onCancel}>
          {t('common.back')}
        </button>
      </div>
      <label className="field">
        <span>{t('picker.name')}</span>
        <input
          className="text-input"
          value={name}
          placeholder={t('picker.namePlaceholder')}
          onChange={(e) => {
            setName(e.target.value)
            setError(null)
          }}
        />
      </label>
      <div className="field">
        <span>{t('picker.kind')}</span>
        <Segmented<ExerciseKind>
          label={t('picker.kind')}
          value={kind}
          options={[
            { value: 'dynamic', label: t('picker.dynamic') },
            { value: 'isometric', label: t('picker.isometric') },
          ]}
          onChange={setKind}
        />
      </div>
      <div className="field">
        <span>{t('picker.load')}</span>
        <Segmented<'weighted' | 'bodyweight'>
          label={t('picker.load')}
          value={load}
          options={[
            { value: 'weighted', label: t('picker.weighted') },
            { value: 'bodyweight', label: t('picker.bodyweight') },
          ]}
          onChange={setLoad}
        />
      </div>
      <div className="field">
        <span>{t('picker.primary')}</span>
        <MuscleChips
          label={t('picker.primary')}
          value={primary}
          onChange={(v) => {
            setPrimary(v)
            setSecondary((s) => s.filter((m) => !v.includes(m)))
            setError(null)
          }}
        />
      </div>
      <div className="field">
        <span>{t('picker.secondary')}</span>
        <MuscleChips label={t('picker.secondary')} value={secondary} disabled={primary} onChange={setSecondary} />
      </div>
      {error && <p className="error-text">{error}</p>}
      <button type="button" className="btn-primary" onClick={submit}>
        {t('picker.add')}
      </button>
    </div>
  )
}
