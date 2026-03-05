import type { QuestionCardQuestion } from './questionCardTypes'

export type ExamChoice = {
  value: 'a' | 'b' | 'c' | 'd'
  label: string
}

export type ExamQuestion = QuestionCardQuestion & {
  id: string
  section: string
  mapRegion: 'vancouver' | 'montreal' | null
  choices: ExamChoice[]
  isMapQuestion: boolean
  correctAnswer: 'a' | 'b' | 'c' | 'd'
}
