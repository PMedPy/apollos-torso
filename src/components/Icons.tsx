/** Schlichte Platzhalter-Icons. Die endgültigen Icons (u.a. der Torso) kommen in Phase 4. */

const common = {
  width: 24,
  height: 24,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.8,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
  'aria-hidden': true,
}

export const HomeIcon = () => (
  <svg {...common}>
    <path d="M4 11.5 12 5l8 6.5" />
    <path d="M6.5 10v9h11v-9" />
  </svg>
)

/** Platzhalter für den Torso: eine schlichte Säule */
export const BelvedereIcon = () => (
  <svg {...common}>
    <path d="M5 6h14M6 6l1-2h10l1 2M8 6v12M12 6v12M16 6v12M5 18h14M4 20h16" />
  </svg>
)

export const SettingsIcon = () => (
  <svg {...common}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </svg>
)

export const PlusIcon = () => (
  <svg {...common} strokeWidth={2.4}>
    <path d="M12 5v14M5 12h14" />
  </svg>
)
