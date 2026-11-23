/**
 * Build-Informationen, gesetzt in vite.config.ts.
 * Auf Cloudflare kommt der Branch aus WORKERS_CI_BRANCH, lokal ist er "local".
 */
export const APP_VERSION = __APP_VERSION__
export const APP_BRANCH = __APP_BRANCH__
export const APP_COMMIT = __APP_COMMIT__

/** Produktion = Branch main. Alles andere ist Test (Preview) oder lokal. */
export const IS_PRODUCTION = APP_BRANCH === 'main'
export const IS_LOCAL = APP_BRANCH === 'local'
export const IS_PREVIEW = !IS_PRODUCTION && !IS_LOCAL
