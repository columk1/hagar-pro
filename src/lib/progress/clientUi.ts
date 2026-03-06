import { canonicalizePathToContentId, getSectionIdFromLessonId, isLessonId } from './lessonIds'
import {
  $progress,
  isLessonCompleted,
  markLessonComplete,
  markLessonIncomplete,
} from '../stores/progressStore'

const CHECKMARK = '✓'
const SECTION_RING_CIRCUMFERENCE = 97.39
let stopProgressListener: (() => void) | null = null

const applyProgressCircle = (
  parent: ParentNode,
  fillSelector: string,
  textSelector: string,
  completed: number,
  total: number,
): void => {
  const fill = parent.querySelector<SVGCircleElement>(fillSelector)
  const text = parent.querySelector<HTMLElement>(textSelector)
  if (!fill || !text) {
    return
  }

  const ratio = total > 0 ? completed / total : 0
  const dashOffset = SECTION_RING_CIRCUMFERENCE * (1 - ratio)
  fill.style.strokeDashoffset = dashOffset.toFixed(2)
  text.textContent = `${completed}/${total}`
}

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
    // TODO: Causes layout shift in sidebar on navigation - re-implement or remove
    // indicator.textContent = isComplete ? `${CHECKMARK}` : ''
    link.dataset.lessonComplete = isComplete ? 'true' : 'false'
  }
}

const decorateSidebarSectionCounts = (completedLessonIds: Set<string>): void => {
  const sectionSummaries = document.querySelectorAll<HTMLElement>(
    'nav[aria-label="Main"] details > summary',
  )

  for (const summary of sectionSummaries) {
    const label = summary.querySelector('.group-label .large')
    if (!label) {
      continue
    }

    const labelText = label.textContent?.trim() ?? ''
    if (!/^\d+\./.test(labelText)) {
      continue
    }

    const detail = summary.parentElement
    if (!detail) {
      continue
    }

    const lessonLinks = detail.querySelectorAll<HTMLAnchorElement>('a[href^="/curriculum/"]')
    const lessonIds = Array.from(lessonLinks)
      .map((link) => contentIdFromHref(link.getAttribute('href') ?? ''))
      .filter(isLessonId)

    const total = lessonIds.length
    const completed = lessonIds.filter((lessonId) => completedLessonIds.has(lessonId)).length

    let count = summary.querySelector<HTMLElement>('[data-progress-count]')
    if (!count) {
      count = document.createElement('span')
      count.dataset.progressCount = 'true'
      count.className = 'section-progress-count'
      label.append(count)
    }

    const isSectionComplete = total > 0 && completed === total
    // count.textContent = isSectionComplete ? ` ${CHECKMARK}` : ''
    summary.dataset.sectionComplete = isSectionComplete ? 'true' : 'false'
  }
}

const renderSidebarProgress = (): void => {
  const completedLessonIds = new Set($progress.get().completedLessons)
  decorateSidebarLessons(completedLessonIds)
  decorateSidebarSectionCounts(completedLessonIds)
}

const getSectionLessonIds = (sectionId: string): string[] => {
  const normalizedSectionId = sectionId.trim()
  if (!normalizedSectionId) {
    return []
  }

  const sectionLessonLinks = document.querySelectorAll<HTMLAnchorElement>(
    `nav[aria-label="Main"] a[href^="/${normalizedSectionId}/"]`,
  )

  const sectionLessonIds = Array.from(sectionLessonLinks)
    .map((link) => contentIdFromHref(link.getAttribute('href') ?? ''))
    .filter(isLessonId)

  return Array.from(new Set(sectionLessonIds))
}

const getSectionProgress = (
  sectionId: string,
  completedLessonIds: Set<string>,
): { completed: number; total: number } => {
  const sectionLessonIds = getSectionLessonIds(sectionId)
  const total = sectionLessonIds.length
  const completed = sectionLessonIds.filter((id) => completedLessonIds.has(id)).length

  return { completed, total }
}

const getSectionFirstUncompletedHref = (
  sectionId: string,
  completedLessonIds: Set<string>,
): string | null => {
  const sectionLessonIds = getSectionLessonIds(sectionId)
  if (sectionLessonIds.length === 0) {
    return null
  }

  const firstUncompletedLessonId =
    sectionLessonIds.find((lessonId) => !completedLessonIds.has(lessonId)) ?? sectionLessonIds[0]

  return `/${firstUncompletedLessonId}/`
}

const renderSectionProgress = (
  card: HTMLElement,
  lessonId: string,
  completedLessonIds: Set<string>,
): void => {
  const sectionId = getSectionIdFromLessonId(lessonId)
  if (!sectionId) {
    return
  }

  const { completed, total } = getSectionProgress(sectionId, completedLessonIds)
  applyProgressCircle(
    card,
    '[data-section-progress-fill]',
    '[data-section-progress-text]',
    completed,
    total,
  )
}

const renderHomeSectionProgress = (completedLessonIds: Set<string>): void => {
  const sectionItems = document.querySelectorAll<HTMLElement>('[data-section-progress-item]')

  for (const item of sectionItems) {
    const sectionId = item.dataset.sectionId?.trim() ?? ''
    const { completed, total } = getSectionProgress(sectionId, completedLessonIds)
    const titleLink = item.querySelector<HTMLAnchorElement>('[data-section-progress-link]')
    const firstUncompletedHref = getSectionFirstUncompletedHref(sectionId, completedLessonIds)
    if (titleLink && firstUncompletedHref) {
      titleLink.href = firstUncompletedHref
    }

    applyProgressCircle(
      item,
      '[data-section-progress-fill]',
      '[data-section-progress-text]',
      completed,
      total,
    )

    item.dataset.complete = total > 0 && completed === total ? 'true' : 'false'
  }
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
  renderSectionProgress(card, lessonId, new Set($progress.get().completedLessons))
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
  renderHomeSectionProgress(new Set($progress.get().completedLessons))

  stopProgressListener = $progress.listen((progressState) => {
    if (isLessonPage && card && actionButton && lessonId) {
      renderLessonCard(card, lessonId, statusElement, actionButton)
    }

    renderSidebarProgress()
    renderHomeSectionProgress(new Set(progressState.completedLessons))
  })
}
