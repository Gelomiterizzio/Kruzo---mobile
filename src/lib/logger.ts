/**
 * Tiny logging seam. Centralizing logs here means we can later route them to a
 * crash/analytics backend (Sentry, Crashlytics) without touching call sites.
 * `debug`/`info` are silenced in production builds; `warn`/`error` always emit.
 */
const isDev = __DEV__

export const logger = {
  debug: (...args: unknown[]) => {
    if (isDev) console.log('[debug]', ...args)
  },
  info: (...args: unknown[]) => {
    if (isDev) console.info('[info]', ...args)
  },
  warn: (...args: unknown[]) => {
    console.warn('[warn]', ...args)
  },
  error: (error: unknown, context?: Record<string, unknown>) => {
    console.error('[error]', error, context ?? '')
    // TODO(observability): forward to Sentry/Crashlytics in a later phase.
  },
}
