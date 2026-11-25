import { useState } from 'react'
import { parseNumber } from '../lib/format'

interface Props {
  label: string
  value: number
  step: number
  min?: number
  max?: number
  decimals?: number
  onChange: (value: number) => void
}

/** Plus/Minus-Regler; ein Tap auf die Zahl erlaubt die Eingabe per Tastatur (TR-04). */
export function Stepper({ label, value, step, min = 0, max = 9999, decimals = 0, onChange }: Props) {
  const [text, setText] = useState('')
  const [editing, setEditing] = useState(false)

  const clamp = (n: number) => Math.min(max, Math.max(min, Math.round(n * 100) / 100))
  const commit = () => {
    setEditing(false)
    const n = parseNumber(text)
    if (n !== null) onChange(clamp(n))
  }

  return (
    <div className="stepper">
      <div className="stepper-label">{label}</div>
      <div className="stepper-row">
        <button type="button" className="stepper-btn" aria-label={`${label} −`} onClick={() => onChange(clamp(value - step))}>
          −
        </button>
        <input
          className="stepper-value"
          inputMode={decimals > 0 ? 'decimal' : 'numeric'}
          aria-label={label}
          value={editing ? text : formatValue(value, decimals)}
          onFocus={(e) => {
            setText(formatValue(value, decimals))
            setEditing(true)
            const el = e.target
            requestAnimationFrame(() => el.select())
          }}
          onChange={(e) => setText(e.target.value)}
          onBlur={commit}
          onKeyDown={(e) => e.key === 'Enter' && (e.target as HTMLInputElement).blur()}
        />
        <button type="button" className="stepper-btn" aria-label={`${label} +`} onClick={() => onChange(clamp(value + step))}>
          +
        </button>
      </div>
    </div>
  )
}

function formatValue(v: number, decimals: number): string {
  return decimals > 0 ? String(Math.round(v * 100) / 100) : String(Math.round(v))
}
