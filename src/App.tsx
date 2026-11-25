import { useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { BottomNav, type Page } from './components/BottomNav'
import { EnvBanner } from './components/EnvBanner'
import { ApollosDb, DB_NAME } from './db/db'
import { DbContext, useDb } from './db/DbContext'
import { freshLive, useLive } from './lib/live'
import { useSettings } from './lib/settings'
import { getActiveSession, startSession } from './lib/training'
import { BelvederePage } from './pages/BelvederePage'
import { HomePage } from './pages/HomePage'
import { OnboardingPage } from './pages/OnboardingPage'
import { SettingsPage } from './pages/SettingsPage'
import { TrainingPage } from './pages/TrainingPage'

/** Wurzel: öffnet die lokale Datenbank und stellt sie bereit. */
export default function Root() {
  const db = useMemo(() => new ApollosDb(DB_NAME), [])
  useEffect(() => () => db.close(), [db])
  return (
    <DbContext.Provider value={db}>
      <App />
    </DbContext.Provider>
  )
}

type Route = Page | 'training'

function App() {
  const { i18n } = useTranslation()
  const db = useDb()
  const settings = useSettings()
  const { live, setLive, patch } = useLive()
  const [route, setRoute] = useState<Route>(() => (live ? 'training' : 'home'))
  const [toast, setToast] = useState<string | null>(null)

  // Sprache und Darstellung aus den Einstellungen des Profils
  useEffect(() => {
    if (i18n.language !== settings.language) void i18n.changeLanguage(settings.language)
    document.documentElement.lang = settings.language
  }, [settings.language, i18n])
  useEffect(() => {
    const root = document.documentElement
    if (settings.theme === 'system') delete root.dataset.theme
    else root.dataset.theme = settings.theme
  }, [settings.theme])

  // Laufzeit-Zustand mit der Datenbank abgleichen (z.B. nach Import oder Absturz)
  useEffect(() => {
    void getActiveSession(db).then((active) => {
      setLive((prev) => {
        if (active && prev?.sessionId === active.id) return prev
        return active ? freshLive(active.id, null) : null
      })
    })
  }, [db, setLive])

  useEffect(() => {
    if (!toast) return
    const id = window.setTimeout(() => setToast(null), 2600)
    return () => window.clearTimeout(id)
  }, [toast])

  const openTraining = async () => {
    if (!live) {
      const session = await startSession(db)
      setLive(freshLive(session.id, settings.transitionRestSec))
    }
    setRoute('training')
  }

  if (!settings.loaded) return null

  if (!settings.onboardingDone) {
    return (
      <div className="app">
        <EnvBanner />
        <main className="app-main">
          <OnboardingPage />
        </main>
      </div>
    )
  }

  return (
    <div className="app">
      <EnvBanner />
      {route === 'training' && live ? (
        <TrainingPage
          live={live}
          patch={patch}
          toast={setToast}
          onMinimize={() => setRoute('home')}
          onFinished={(message) => {
            setLive(null)
            setRoute('home')
            if (message) setToast(message)
          }}
        />
      ) : (
        <>
          <main className="app-main">
            {route === 'home' && (
              <HomePage running={live !== null} onOpenTraining={() => void openTraining()} />
            )}
            {route === 'belvedere' && <BelvederePage />}
            {route === 'settings' && (
              <SettingsPage trainingRunning={live !== null} toast={setToast} />
            )}
          </main>
          <BottomNav
            page={route === 'training' ? 'home' : route}
            running={live !== null}
            onNavigate={setRoute}
            onNewTraining={() => void openTraining()}
          />
        </>
      )}
      {toast && (
        <div className="toast" role="status">
          {toast}
        </div>
      )}
    </div>
  )
}
