import { canonicalizePathToContentId, isLessonId } from './lessonIds'
import {
  $progress,
  isLessonCompleted,
  markLessonComplete,
  markLessonIncomplete,
} from '../stores/progressStore'

const CHECKMARK = '✓'

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
    indicator.textContent = isComplete ? CHECKMARK : ''
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

    count.textContent = total > 0 ? `${completed}/${total}` : ''
  }
}

const renderSidebarProgress = (): void => {
  const completedLessonIds = new Set($progress.get().completedLessons)
  decorateSidebarLessons(completedLessonIds)
  decorateSidebarModuleCounts(completedLessonIds)
}

const renderLessonCard = (
  card: HTMLElement,
  lessonId: string,
  statusElement: HTMLElement,
  actionButton: HTMLButtonElement,
): void => {
  const complete = isLessonCompleted(lessonId)
  statusElement.textContent = complete ? 'Completed' : 'Not completed'
  actionButton.textContent = complete ? 'Mark Incomplete' : 'Mark Complete'
  actionButton.setAttribute('aria-pressed', complete ? 'true' : 'false')
  card.dataset.complete = complete ? 'true' : 'false'
}

export const initProgressUi = (lessonId: string | null): void => {
  const card = document.querySelector<HTMLElement>('[data-lesson-progress-card]')
  const statusElement = card?.querySelector<HTMLElement>('[data-lesson-progress-status]')
  const actionButton = card?.querySelector<HTMLButtonElement>('[data-lesson-progress-action]')

  const isLessonPage = !!lessonId && isLessonId(lessonId)

  if (isLessonPage && card && statusElement && actionButton) {
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

  $progress.listen((progressState) => {
    if (isLessonPage && card && statusElement && actionButton && lessonId) {
      const completedSet = new Set(progressState.completedLessons)
      const complete = completedSet.has(lessonId)
      statusElement.textContent = complete ? 'Completed' : 'Not completed'
      actionButton.textContent = complete ? 'Mark Incomplete' : 'Mark Complete'
      actionButton.setAttribute('aria-pressed', complete ? 'true' : 'false')
      card.dataset.complete = complete ? 'true' : 'false'
    }

    renderSidebarProgress()
  })
}
