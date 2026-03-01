import { canonicalizePathToContentId, getModuleIdFromLessonId, isLessonId } from './lessonIds'
import {
  $progress,
  isLessonCompleted,
  markLessonComplete,
  markLessonIncomplete,
} from '../stores/progressStore'

const CHECKMARK = '✓'
const MODULE_RING_CIRCUMFERENCE = 97.39
let stopProgressListener: (() => void) | null = null

const contentIdFromHref = (href: string): string => {
  try {
    const url = new URL(href, window.location.origin)
    return canonicalizePathToContentId(url.pathname)
  } catch {
    return ''
  }
}

const decorateSidebarLessons = (completedLessonIds: Set<string>): void => {
  const lessonLinks = document.querySelectorAll<HTMLAnchorElement>(
    'nav[aria-label="Main"] a[href^="/curriculum/"]',
  )

  for (const link of lessonLinks) {
    const contentId = contentIdFromHref(link.getAttribute('href') ?? '')
    if (!isLessonId(contentId)) {
      continue
    }

    let indicator = link.querySelector<HTMLElement>('[data-progress-indicator]')
    if (!indicator) {
      indicator = document.createElement('span')
      indicator.dataset.progressIndicator = 'true'
      indicator.className = 'lesson-progress-indicator'
      indicator.setAttribute('aria-hidden', 'true')
      link.append(indicator)
    }

    const isComplete = completedLessonIds.has(contentId)
    indicator.textContent = isComplete ? `${CHECKMARK}` : ''
    link.dataset.lessonComplete = isComplete ? 'true' : 'false'
  }
}

const decorateSidebarModuleCounts = (completedLessonIds: Set<string>): void => {
  const moduleSummaries = document.querySelectorAll<HTMLElement>(
    'nav[aria-label="Main"] details > summary',
  )

  for (const summary of moduleSummaries) {
    const label = summary.querySelector('.group-label .large')
    if (!label) {
      continue
    }

    const labelText = label.textContent?.trim() ?? ''
    if (!labelText.startsWith('Module ') && !labelText.startsWith('Final Module')) {
      continue
    }

    const detail = summary.parentElement
    if (!detail) {
      continue
    }

    const lessonLinks = detail.querySelectorAll<HTMLAnchorElement>('a[href*="/lesson-"]')
    const lessonIds = Array.from(lessonLinks)
      .map((link) => contentIdFromHref(link.getAttribute('href') ?? ''))
      .filter(isLessonId)

    const total = lessonIds.length
    const completed = lessonIds.filter((lessonId) => completedLessonIds.has(lessonId)).length

    let count = summary.querySelector<HTMLElement>('[data-progress-count]')
    if (!count) {
      count = document.createElement('span')
      count.dataset.progressCount = 'true'
      count.className = 'module-progress-count'
      label.append(count)
    }

    const isModuleComplete = total > 0 && completed === total
    count.textContent = isModuleComplete ? ` ${CHECKMARK}` : ''
    summary.dataset.moduleComplete = isModuleComplete ? 'true' : 'false'
  }
}

const renderSidebarProgress = (): void => {
  const completedLessonIds = new Set($progress.get().completedLessons)
  decorateSidebarLessons(completedLessonIds)
  decorateSidebarModuleCounts(completedLessonIds)
}

const getModuleProgress = (
  lessonId: string,
  completedLessonIds: Set<string>,
): { completed: number; total: number } => {
  const moduleId = getModuleIdFromLessonId(lessonId)
  if (!moduleId) {
    return { completed: 0, total: 0 }
  }

  const moduleLessonLinks = document.querySelectorAll<HTMLAnchorElement>(
    `nav[aria-label="Main"] a[href^="/${moduleId}/lesson-"]`,
  )

  const moduleLessonIds = Array.from(moduleLessonLinks)
    .map((link) => contentIdFromHref(link.getAttribute('href') ?? ''))
    .filter(isLessonId)

  const uniqueLessonIds = Array.from(new Set(moduleLessonIds))
  const total = uniqueLessonIds.length
  const completed = uniqueLessonIds.filter((id) => completedLessonIds.has(id)).length

  return { completed, total }
}

const renderModuleProgress = (
  card: HTMLElement,
  lessonId: string,
  completedLessonIds: Set<string>,
): void => {
  const fill = card.querySelector<SVGCircleElement>('[data-module-progress-fill]')
  const text = card.querySelector<HTMLElement>('[data-module-progress-text]')
  if (!fill || !text) {
    return
  }

  const { completed, total } = getModuleProgress(lessonId, completedLessonIds)
  const ratio = total > 0 ? completed / total : 0
  const dashOffset = MODULE_RING_CIRCUMFERENCE * (1 - ratio)

  fill.style.strokeDashoffset = dashOffset.toFixed(2)
  text.textContent = `${completed}/${total}`
}

const renderLessonCard = (
  card: HTMLElement,
  lessonId: string,
  statusElement: HTMLElement | null,
  actionButton: HTMLButtonElement,
): void => {
  const complete = isLessonCompleted(lessonId)
  if (statusElement) {
    statusElement.textContent = complete ? 'Completed' : 'Not completed'
  }
  actionButton.textContent = complete ? 'Lesson Completed' : 'Mark Complete'
  actionButton.setAttribute('aria-pressed', complete ? 'true' : 'false')
  card.dataset.complete = complete ? 'true' : 'false'
  renderModuleProgress(card, lessonId, new Set($progress.get().completedLessons))
}

export const initProgressUi = (lessonId: string | null): void => {
  if (stopProgressListener) {
    stopProgressListener()
    stopProgressListener = null
  }

  const card = document.querySelector<HTMLElement>('[data-lesson-progress-card]')
  const statusElement = card?.querySelector<HTMLElement>('[data-lesson-progress-status]') ?? null
  const actionButton = document.querySelector<HTMLButtonElement>('[data-lesson-progress-action]')

  const isLessonPage = !!lessonId && isLessonId(lessonId)

  if (isLessonPage && card && actionButton) {
    if (!actionButton.dataset.progressBound) {
      actionButton.addEventListener('click', () => {
        if (!lessonId) return
        if (isLessonCompleted(lessonId)) {
          markLessonIncomplete(lessonId)
        } else {
          markLessonComplete(lessonId)
        }
      })
      actionButton.dataset.progressBound = 'true'
    }

    renderLessonCard(card, lessonId, statusElement, actionButton)
  }

  renderSidebarProgress()

  stopProgressListener = $progress.listen((progressState) => {
    if (isLessonPage && card && actionButton && lessonId) {
      renderLessonCard(card, lessonId, statusElement, actionButton)
    }

    renderSidebarProgress()
  })
}
