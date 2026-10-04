export function generateOGURL(currentPath: string): string {
  // Strip leading/trailing slashes
  let slug = currentPath.replace(/^\/|\/$/g, '')

  // Map root path to 'index'
  if (!slug) slug = 'index'
  if (slug === 'fr/404') return '/og/fr/index.png'
  if (slug === '404') return '/og/index.png'
  if (slug === 'fr' || slug === 'fr/index') return '/og/fr/index.png'

  // Remove trailing '/index' from directory paths just in case
  if (slug.endsWith('/index')) slug = slug.replace(/\/index$/, '')

  return `/og/${slug}.png`
}

export function getOGTypeFromPath(path: string): 'default' | 'quiz' | 'curriculum' {
  if (path.includes('/quiz') || path.includes('quiz-')) return 'quiz'
  if (path.includes('/curriculum/')) return 'curriculum'
  return 'default'
}
