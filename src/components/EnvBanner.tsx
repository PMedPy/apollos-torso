import { useTranslation } from 'react-i18next'
import { APP_BRANCH, IS_LOCAL, IS_PREVIEW } from '../lib/env'

/** Sichtbarer Hinweis in Test- und lokalen Builds (Lastenheft 11.1). */
export function EnvBanner() {
  const { t } = useTranslation()
  if (!IS_PREVIEW && !IS_LOCAL) return null
  return (
    <div className={`env-banner${IS_LOCAL ? ' is-local' : ''}`} role="status">
      {IS_LOCAL ? t('banner.local') : `${t('banner.preview')} · ${APP_BRANCH}`}
    </div>
  )
}
