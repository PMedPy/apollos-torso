import { createContext, useContext } from 'react'
import type { ApollosDb } from './db'

export const DbContext = createContext<ApollosDb | null>(null)

/** Datenbank des aktiven Profils. */
export function useDb(): ApollosDb {
  const db = useContext(DbContext)
  if (!db) throw new Error('useDb außerhalb von DbContext')
  return db
}
