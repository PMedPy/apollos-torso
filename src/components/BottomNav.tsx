import { useTranslation } from 'react-i18next'
import { BelvedereIcon, HomeIcon, PlusIcon, SettingsIcon } from './Icons'

export type Page = 'home' | 'belvedere' | 'settings'

interface Props {
  page: Page
  /** Training läuft: „+“ öffnet es statt ein neues zu starten */
  running: boolean
  onNavigate: (page: Page) => void
  onNewTraining: () => void
}

/**
 * Untere Menüleiste aus Kreisen (DS-04).
 * Phase 1: statisch. Das Verschmelzen benachbarter Kreise kommt in Phase 4.
 */
export function BottomNav({ page, running, onNavigate, onNewTraining }: Props) {
  const { t } = useTranslation()
  const items: { id: Page; label: string; icon: React.ReactNode }[] = [
    { id: 'home', label: t('nav.home'), icon: <HomeIcon /> },
    { id: 'belvedere', label: t('nav.belvedere'), icon: <BelvedereIcon /> },
    { id: 'settings', label: t('nav.settings'), icon: <SettingsIcon /> },
  ]

  return (
    <nav className="bottom-nav" aria-label="Navigation">
      {items.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`nav-bubble${page === item.id ? ' is-active' : ''}`}
          aria-label={item.label}
          aria-current={page === item.id ? 'page' : undefined}
          onClick={() => onNavigate(item.id)}
        >
          {item.icon}
        </button>
      ))}
      <button
        type="button"
        className={`nav-bubble nav-plus${running ? ' is-running' : ''}`}
        aria-label={running ? t('nav.openTraining') : t('nav.newTraining')}
        onClick={onNewTraining}
      >
        <PlusIcon />
      </button>
    </nav>
  )
}
