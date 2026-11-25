/** 75 → "1:15", 3725 → "1:02:05" */
export function formatClock(totalSec: number): string {
  const s = Math.max(0, Math.floor(totalSec))
  const h = Math.floor(s / 3600)
  const m = Math.floor((s % 3600) / 60)
  const sec = String(s % 60).padStart(2, '0')
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${sec}` : `${m}:${sec}`
}

/** 56 → "56", 22.5 → "22,5" (de) bzw. "22.5" (en) */
export function formatKg(kg: number, lang: string): string {
  const r = Math.round(kg * 100) / 100
  return r.toLocaleString(lang === 'de' ? 'de-DE' : 'en-US', { maximumFractionDigits: 2 })
}

/** Eingabe mit Komma oder Punkt in Zahl umwandeln; ungültig → null */
export function parseNumber(input: string): number | null {
  const n = Number(input.trim().replace(',', '.'))
  return Number.isFinite(n) ? n : null
}

export function formatDate(ts: number, lang: string): string {
  return new Date(ts).toLocaleDateString(lang === 'de' ? 'de-DE' : 'en-US', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
  })
}

export function formatTime(ts: number, lang: string): string {
  return new Date(ts).toLocaleTimeString(lang === 'de' ? 'de-DE' : 'en-US', {
    hour: '2-digit',
    minute: '2-digit',
  })
}
