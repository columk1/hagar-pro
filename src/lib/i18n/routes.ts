import { getRelativeLocaleUrl } from 'astro:i18n'

import { canonicalizePathToContentId } from '../progress/lessonIds'
import type { Locale } from './ui'

/** Use Astro's configured locale codes and preserve the existing curriculum slugs. */
export const localeUrl = (locale: Locale, path = ''): string =>
  getRelativeLocaleUrl(locale === 'fr' ? 'fr-CA' : 'en', canonicalizePathToContentId(path))
