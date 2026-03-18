export function generateOGURL(currentPath: string): string {
  // Strip leading/trailing slashes
  let slug = currentPath.replace(/^\/|\/$/g, '')

  // Map root path to 'index'
  if (!slug) slug = 'index'

  // Remove trailing '/index' from directory paths just in case
  if (slug.endsWith('/index')) slug = slug.replace(/\/index$/, '')

  return `/og/${slug}.png`
}

export function getOGTypeFromPath(path: string): 'default' | 'quiz' | 'curriculum' {
  if (path.includes('/quiz') || path.includes('quiz-')) return 'quiz'
  if (path.includes('/curriculum/')) return 'curriculum'
  return 'default'
}
