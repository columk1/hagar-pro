import type { ExamQuestion } from './examTypes'

const GENERAL_TARGET = 33
const MAP_TARGET = 7
const TOTAL_TARGET = GENERAL_TARGET + MAP_TARGET
const MAP_QUESTION_IDS = ['A1', 'A2', 'A3', 'A4', 'A5', 'A6', 'A7'] as const

const shuffle = <T>(items: T[]): T[] => {
  const copy = [...items]
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1))
    ;[copy[index], copy[randomIndex]] = [copy[randomIndex], copy[index]]
  }
  return copy
}

const groupBySection = (questions: ExamQuestion[]): Record<string, ExamQuestion[]> => {
  return questions.reduce<Record<string, ExamQuestion[]>>((accumulator, question) => {
    accumulator[question.section] ??= []
    accumulator[question.section].push(question)
    return accumulator
  }, {})
}

const pickBalanced = (
  poolBySection: Record<string, ExamQuestion[]>,
  targetCount: number,
): ExamQuestion[] => {
  const sections = Object.entries(poolBySection).map(([section, questions]) => ({
    section,
    questions: shuffle(questions),
  }))
  const picked: ExamQuestion[] = []

  while (picked.length < targetCount) {
    let selectedInRound = false
    for (const section of shuffle(sections)) {
      if (picked.length >= targetCount) {
        break
      }
      const nextQuestion = section.questions.pop()
      if (!nextQuestion) {
        continue
      }
      picked.push(nextQuestion)
      selectedInRound = true
    }

    if (!selectedInRound) {
      break
    }
  }

  if (picked.length < targetCount) {
    const remaining = sections.flatMap((section) => section.questions)
    picked.push(...shuffle(remaining).slice(0, targetCount - picked.length))
  }

  return picked.slice(0, targetCount)
}

export const generateExamQuestions = (pool: ExamQuestion[]): ExamQuestion[] => {
  const eligiblePool = pool.filter((question) => question.mapRegion !== 'montreal')
  const mapQuestions = MAP_QUESTION_IDS.map((id) =>
    eligiblePool.find((question) => question.id === id),
  ).filter((question): question is ExamQuestion => Boolean(question))
  const generalQuestions = eligiblePool.filter((question) => question.mapRegion !== 'vancouver')

  let effectiveMapTarget = Math.min(MAP_TARGET, mapQuestions.length)
  let effectiveGeneralTarget = Math.min(GENERAL_TARGET, generalQuestions.length)

  let remainingTarget = TOTAL_TARGET - (effectiveMapTarget + effectiveGeneralTarget)
  if (remainingTarget > 0) {
    const extraGeneralCapacity = Math.max(0, generalQuestions.length - effectiveGeneralTarget)
    const extraGeneral = Math.min(remainingTarget, extraGeneralCapacity)
    effectiveGeneralTarget += extraGeneral
    remainingTarget -= extraGeneral

    if (remainingTarget > 0) {
      const extraMapCapacity = Math.max(0, mapQuestions.length - effectiveMapTarget)
      const extraMap = Math.min(remainingTarget, extraMapCapacity)
      effectiveMapTarget += extraMap
    }
  }

  const selectedMap = mapQuestions.slice(0, effectiveMapTarget)
  const selectedGeneral = pickBalanced(groupBySection(generalQuestions), effectiveGeneralTarget)
  const selected = shuffle([...selectedGeneral, ...selectedMap])

  if (selected.length === 0) {
    throw new Error('No exam questions available to build this exam.')
  }

  if (selected.length < TOTAL_TARGET) {
    console.warn(
      `Exam generated with ${selected.length}/${TOTAL_TARGET} questions due to limited valid question data.`,
    )
  }

  return selected
}
