const LESSON_ID_PATTERN = /^curriculum\/[^/]+\/lesson-[^/]+$/

export const canonicalizePathToContentId = (pathname: string): string => {
  const withoutQuery = pathname.split('?')[0]?.split('#')[0] ?? ''
  const normalized = withoutQuery.trim().replace(/^\/+/, '').replace(/\/+$/, '')

  return decodeURIComponent(normalized)
}

export const isLessonId = (contentId: string): boolean => LESSON_ID_PATTERN.test(contentId.trim())

export const getSectionIdFromLessonId = (lessonId: string): string | null => {
  if (!isLessonId(lessonId)) {
    return null
  }

  const parts = lessonId.split('/')
  if (parts.length < 3) {
    return null
  }

  return parts.slice(0, 2).join('/')
}
