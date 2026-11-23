import { useTranslation } from 'react-i18next'

export function HomePage() {
  const { t } = useTranslation()
  return (
    <section className="page">
      <header className="page-header">
        <h1 className="wordmark">{t('app.name')}</h1>
        <p className="motto">{t('app.motto')}</p>
      </header>
      <div className="card">
        <h2>{t('home.placeholderTitle')}</h2>
        <p className="muted">{t('home.placeholderText')}</p>
      </div>
    </section>
  )
}
