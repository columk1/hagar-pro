export function generateOGURL(params: { title?: string; description?: string }): string {
  const searchParams = new URLSearchParams()

  if (params.title) searchParams.set('title', params.title)
  if (params.description) searchParams.set('description', params.description)

  const queryString = searchParams.toString()
  return `/og/image/default.png${queryString ? '?' + queryString : ''}`
}

export function getOGTypeFromPath(path: string): 'default' | 'quiz' | 'curriculum' {
  if (path.includes('/quiz') || path.includes('quiz-')) return 'quiz'
  if (path.includes('/curriculum/')) return 'curriculum'
  return 'default'
}
