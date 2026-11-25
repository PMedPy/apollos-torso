import Dexie, { type EntityTable } from 'dexie'
import type {
  BodyWeightEntry,
  Exercise,
  Session,
  SetEntry,
  Settings,
  Template,
} from './model'

/**
 * Lokale Datenbank (IndexedDB über Dexie).
 *
 * WICHTIG (NF-02): Ab Phase 1 liegen echte Trainingsdaten auf den Handys.
 * Das Schema wird nie still geändert. Jede Änderung bekommt eine neue
 * `this.version(n)` mit Migration und einen Test in db.test.ts.
 */
export class ApollosDb extends Dexie {
  exercises!: EntityTable<Exercise, 'id'>
  sessions!: EntityTable<Session, 'id'>
  sets!: EntityTable<SetEntry, 'id'>
  templates!: EntityTable<Template, 'id'>
  bodyWeights!: EntityTable<BodyWeightEntry, 'date'>
  settings!: EntityTable<Settings, 'id'>

  constructor(name = 'apollos-torso') {
    super(name)

    // Version 1 – Phase 0. Nur indizierte Felder stehen hier,
    // alle anderen Felder werden trotzdem gespeichert.
    this.version(1).stores({
      exercises: 'id, catalogId, archived',
      sessions: 'id, start, templateId',
      sets: 'id, sessionId, exerciseId, start, [exerciseId+start]',
      templates: 'id, name',
      bodyWeights: 'date',
      settings: 'id',
    })
  }
}

/** Name der lokalen Datenbank. */
export const DB_NAME = 'apollos-torso'
