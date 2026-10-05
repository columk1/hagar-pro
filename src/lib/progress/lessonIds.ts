const LESSON_ID_PATTERN = /^curriculum\/[^/]+\/(?!index$)(?!quiz-)[^/]+$/

export const canonicalizePathToContentId = (pathname: string): string => {
  const withoutQuery = pathname.split('?')[0]?.split('#')[0] ?? ''
  const normalized = withoutQuery.trim().replace(/^\/+/, '').replace(/\/+$/, '')

  try {
    return decodeURIComponent(normalized).replace(/^fr(?:\/|$)/, '')
  } catch {
    return ''
  }
}

export const isLessonId = (contentId: string): boolean =>
  LESSON_ID_PATTERN.test(canonicalizePathToContentId(contentId))

export const getSectionIdFromLessonId = (lessonId: string): string | null => {
  if (!isLessonId(lessonId)) {
    return null
  }

  const parts = canonicalizePathToContentId(lessonId).split('/')
  if (parts.length < 3) {
    return null
  }

  return parts.slice(0, 2).join('/')
}
