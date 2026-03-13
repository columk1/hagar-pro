import { persistentAtom } from '@nanostores/persistent'
import { computed } from 'nanostores'

export const PROGRESS_STORAGE_KEY = 'hagar-prep-progress-v1'

export type ProgressState = {
  completedLessons: string[]
}

const DEFAULT_PROGRESS_STATE: ProgressState = {
  completedLessons: [],
}

export const sanitizeProgressState = (
  progressState: Partial<ProgressState> | null | undefined,
): ProgressState => {
  if (!progressState || !Array.isArray(progressState.completedLessons)) {
    return DEFAULT_PROGRESS_STATE
  }

  const completedLessons = progressState.completedLessons
    .filter((lessonId): lessonId is string => typeof lessonId === 'string')
    .map((lessonId) => lessonId.trim())
    .filter(Boolean)

  return { completedLessons: Array.from(new Set(completedLessons)) }
}

const decodeProgressState = (rawValue: string): ProgressState => {
  try {
    const parsed = JSON.parse(rawValue) as Partial<ProgressState>
    return sanitizeProgressState(parsed)
  } catch {
    return DEFAULT_PROGRESS_STATE
  }
}

export const $progress = persistentAtom<ProgressState>(
  PROGRESS_STORAGE_KEY,
  DEFAULT_PROGRESS_STATE,
  {
    encode: JSON.stringify,
    decode: decodeProgressState,
  },
)

export const $completedLessons = computed(
  $progress,
  (progressState) => progressState.completedLessons,
)

export const markLessonComplete = (lessonId: string): void => {
  const trimmedId = lessonId.trim()
  if (!trimmedId) return

  const { completedLessons } = $progress.get()
  if (completedLessons.includes(trimmedId)) {
    return
  }

  $progress.set({
    completedLessons: [...completedLessons, trimmedId],
  })
}

export const markLessonIncomplete = (lessonId: string): void => {
  const trimmedId = lessonId.trim()
  if (!trimmedId) return

  $progress.set({
    completedLessons: $progress
      .get()
      .completedLessons.filter((completedLessonId) => completedLessonId !== trimmedId),
  })
}

export const resetProgress = (): void => {
  $progress.set(DEFAULT_PROGRESS_STATE)
}

export const replaceProgress = (nextProgressState: Partial<ProgressState>): void => {
  $progress.set(sanitizeProgressState(nextProgressState))
}

export const mergeProgress = (incomingProgressState: Partial<ProgressState>): void => {
  const current = $progress.get()
  const incoming = sanitizeProgressState(incomingProgressState)

  $progress.set({
    completedLessons: Array.from(
      new Set([...current.completedLessons, ...incoming.completedLessons]),
    ),
  })
}

export const isLessonCompleted = (lessonId: string): boolean => {
  const trimmedId = lessonId.trim()
  if (!trimmedId) return false

  return $progress.get().completedLessons.includes(trimmedId)
}
