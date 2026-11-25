import { describe, expect, it } from 'vitest'
import { CATALOG } from '../data/catalog'
import { editDistance, normalize, searchBy } from './search'

const texts = (e: (typeof CATALOG)[number]) => [e.name.de, e.name.en, ...e.aliases]
const top = (q: string) => searchBy(q, CATALOG, texts, 3).map((e) => e.id)

describe('normalize', () => {
  it('vereinheitlicht Umlaute, ß und Satzzeichen', () => {
    expect(normalize('Klimmzüge')).toBe('klimmzuge')
    expect(normalize('Farmer’s Walk')).toBe('farmer s walk')
    expect(normalize('Gesäß')).toBe('gesass')
  })
})

describe('editDistance', () => {
  it('zählt Vertauschungen als einen Fehler', () => {
    expect(editDistance('klimmzgue', 'klimmzuge')).toBe(1)
    expect(editDistance('abc', 'abc')).toBe(0)
  })
})

describe('Katalogsuche (UE-07)', () => {
  it('„Pushups“ findet Liegestütze', () => {
    expect(top('Pushups')[0]).toBe('push-up')
  })

  it('„liege“ findet Liegestütze über den Wortanfang', () => {
    expect(top('liege')).toContain('push-up')
  })

  it('englische und deutsche Namen funktionieren', () => {
    expect(top('Bench')[0]).toBe('bench-press')
    expect(top('Bankdrücken')[0]).toBe('bench-press')
  })

  it('toleriert Tippfehler', () => {
    expect(top('Klimzüge')[0]).toBe('pull-up')
    expect(top('Kreuzhben')).toContain('deadlift')
  })

  it('findet nichts bei leerer Suche', () => {
    expect(top('')).toEqual([])
  })

  it('alle Katalog-IDs sind eindeutig und haben einen Haupt-Tag', () => {
    const ids = new Set(CATALOG.map((e) => e.id))
    expect(ids.size).toBe(CATALOG.length)
    for (const e of CATALOG) expect(e.primary.length).toBeGreaterThan(0)
  })
})
