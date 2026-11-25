/**
 * Unscharfe Suche für Übungsnamen (UE-07).
 *
 * Bewertung pro Kandidat (Name oder Alias), höher ist besser:
 *   100  ganzer Text beginnt mit der Suche
 *    80  ein Wort beginnt mit der Suche
 *    60  Suche kommt irgendwo vor
 *  20–50 Tippfehler: Wortanfang weicht um 1 (ab 4 Zeichen) bzw. 2 (ab 7) Zeichen ab
 */

export function normalize(s: string): string {
  return s
    .toLowerCase()
    .replace(/ß/g, 'ss')
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9 ]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/** Damerau-Levenshtein (eingeschränkt): Einfügen, Löschen, Ersetzen, Vertauschen */
export function editDistance(a: string, b: string): number {
  const m = a.length
  const n = b.length
  const d: number[][] = Array.from({ length: m + 1 }, (_, i) => [i, ...Array<number>(n).fill(0)])
  for (let j = 1; j <= n; j++) d[0][j] = j
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + cost)
      if (i > 1 && j > 1 && a[i - 1] === b[j - 2] && a[i - 2] === b[j - 1]) {
        d[i][j] = Math.min(d[i][j], d[i - 2][j - 2] + 1)
      }
    }
  }
  return d[m][n]
}

function scoreText(query: string, text: string): number {
  if (!query) return 0
  const t = normalize(text)
  const tc = t.replace(/ /g, '')
  const qc = query.replace(/ /g, '')
  if (t.startsWith(query) || tc.startsWith(qc)) return 100
  const words = t.split(' ')
  if (words.some((w) => w.startsWith(query))) return 80
  if (t.includes(query) || tc.includes(qc)) return 60

  const allowed = qc.length >= 7 ? 2 : qc.length >= 4 ? 1 : 0
  if (allowed === 0) return 0
  let best = Number.POSITIVE_INFINITY
  for (const w of [tc, ...words]) {
    // Vergleich mit gleich langem Anfang (±1, damit fehlende/zusätzliche Buchstaben passen)
    for (const len of [qc.length - 1, qc.length, qc.length + 1]) {
      if (len <= 0 || len > w.length) continue
      best = Math.min(best, editDistance(qc, w.slice(0, len)))
    }
  }
  return best <= allowed ? 50 - best * 15 : 0
}

/** Bester Score eines Eintrags über alle seine Texte. 0 = kein Treffer. */
export function scoreEntry(query: string, texts: string[]): number {
  const q = normalize(query)
  if (!q) return 0
  let best = 0
  for (const text of texts) best = Math.max(best, scoreText(q, text))
  return best
}

export function searchBy<T>(
  query: string,
  items: T[],
  texts: (item: T) => string[],
  limit = 20,
): T[] {
  return items
    .map((item, index) => ({ item, index, score: scoreEntry(query, texts(item)) }))
    .filter((r) => r.score > 0)
    .sort((a, b) => b.score - a.score || a.index - b.index)
    .slice(0, limit)
    .map((r) => r.item)
}
