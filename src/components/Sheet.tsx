import { useEffect, type ReactNode } from 'react'

interface Props {
  open: boolean
  onClose?: () => void
  children: ReactNode
  label: string
  /** volle Höhe, z.B. für die Übungssuche */
  tall?: boolean
}

/** Blatt, das von unten hochfährt (Eingabeblatt TR-04, Übungssuche). */
export function Sheet({ open, onClose, children, label, tall }: Props) {
  useEffect(() => {
    if (!open || !onClose) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="sheet-backdrop" onClick={onClose}>
      <div
        className={`sheet${tall ? ' is-tall' : ''}`}
        role="dialog"
        aria-modal="true"
        aria-label={label}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="sheet-grab" aria-hidden="true" />
        {children}
      </div>
    </div>
  )
}
