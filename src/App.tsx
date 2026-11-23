import { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BottomNav, type Page } from './components/BottomNav'
import { EnvBanner } from './components/EnvBanner'
import { useSettings } from './lib/settings'
import { BelvederePage } from './pages/BelvederePage'
import { HomePage } from './pages/HomePage'
import { SettingsPage } from './pages/SettingsPage'

export default function App() {
  const { t, i18n } = useTranslation()
  const settings = useSettings()
  const [page, setPage] = useState<Page>('home')
  const [toast, setToast] = useState<string | null>(null)

  // Sprache aus den Einstellungen übernehmen
  useEffect(() => {
    if (i18n.language !== settings.language) void i18n.changeLanguage(settings.language)
    document.documentElement.lang = settings.language
  }, [settings.language, i18n])

  // Darstellung: "system" folgt dem Gerät, sonst fest hell/dunkel
  useEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'system') delete root.dataset.theme
    else root.dataset.theme = settings.theme
  }, [settings.theme])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 2200)
    return () => window.clearTimeout(id)
  }, [toast])

  return (
    <div className="app">
      <EnvBanner />
      <main className="app-main">
        {page === 'home' && <HomePage />}
        {page === 'belvedere' && <BelvederePage />}
        {page === 'settings' && <SettingsPage />}
      </main>
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
      <BottomNav
        page={page}
        onNavigate={setPage}
        onNewTraining={() => setToast(t('home.comingSoon'))}
      />
    </div>
  )
}
