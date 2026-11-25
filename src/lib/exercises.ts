import { CATALOG_BY_ID, type CatalogEntry } from '../data/catalog'
import type { ApollosDb } from '../db/db'
import type { Exercise, ExerciseKind, MuscleGroup } from '../db/model'
import { uid } from './ids'

/** Anzeigename: Katalogübungen folgen der Sprache, eigene behalten ihren Namen (UE-08). */
export function exerciseName(ex: Exercise | undefined, lang: string): string {
  if (!ex) return ''
  if (ex.catalogId) {
    const c = CATALOG_BY_ID.get(ex.catalogId)
    if (c) return lang === 'de' ? c.name.de : c.name.en
  }
  return ex.name ?? ''
}

/** Übernimmt eine Katalogübung. Existiert sie schon (auch archiviert), wird sie wiederverwendet. */
export async function addFromCatalog(db: ApollosDb, entry: CatalogEntry): Promise<Exercise> {
  const existing = await db.exercises.where('catalogId').equals(entry.id).first()
  if (existing) {
    if (existing.archived) await db.exercises.update(existing.id, { archived: false })
    return { ...existing, archived: false }
  }
  const ex: Exercise = {
    id: uid(),
    catalogId: entry.id,
    kind: entry.kind,
    bodyweight: entry.bodyweight,
    bodyweightFactor: entry.f,
    primaryMuscles: [...entry.primary],
    secondaryMuscles: [...entry.secondary],
    createdAt: Date.now(),
    archived: false,
  }
  await db.exercises.add(ex)
  return ex
}

export interface CustomExerciseInput {
  name: string
  kind: ExerciseKind
  bodyweight: boolean
  primaryMuscles: MuscleGroup[]
  secondaryMuscles: MuscleGroup[]
}

export async function addCustom(db: ApollosDb, input: CustomExerciseInput): Promise<Exercise> {
  const ex: Exercise = {
    id: uid(),
    name: input.name.trim(),
    kind: input.kind,
    bodyweight: input.bodyweight,
    // Eigene Körpergewichtsübungen: vorläufig ganzes Körpergewicht (A.3), ab P2 einstellbar
    bodyweightFactor: input.bodyweight ? 1 : 0,
    primaryMuscles: input.primaryMuscles,
    secondaryMuscles: input.secondaryMuscles.filter((m) => !input.primaryMuscles.includes(m)),
    createdAt: Date.now(),
    archived: false,
  }
  await db.exercises.add(ex)
  return ex
}
