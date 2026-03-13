export type QuestionChoice = {
  value: string
  label: string
}

export type QuestionCardQuestion = {
  id: string
  prompt: string
  multiline?: boolean
  choices: QuestionChoice[]
  correctAnswer: string
  explanation?: string
  badgeLabel?: string
}
