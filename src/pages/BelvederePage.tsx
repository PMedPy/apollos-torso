import { useTranslation } from 'react-i18next'

export function BelvederePage() {
  const { t } = useTranslation()
  return (
    <section className="page">
      <header className="page-header">
        <h1 className="wordmark">{t('nav.belvedere')}</h1>
        <p className="motto">{t('belvedere.subtitle')}</p>
      </header>
      <div className="card">
        <p className="muted">{t('belvedere.placeholder')}</p>
      </div>
    </section>
  )
}
