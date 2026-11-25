import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { registerSW } from 'virtual:pwa-register'
import './i18n'
import './styles/tokens.css'
import './index.css'
import Root from './App.tsx'

// Service Worker: macht die App offline-fähig und lädt Updates beim nächsten Öffnen (RB-03).
registerSW({ immediate: true })

// Beständigen Speicher anfragen, damit der Browser die Daten nicht bei Platzmangel löscht.
void navigator.storage?.persist?.()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
