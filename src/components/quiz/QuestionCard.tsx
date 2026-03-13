import type { QuestionCardQuestion } from './questionCardTypes'
import { parseAlphaListPrompt } from './questionUtils'

type QuestionCardProps = {
  index: number
  question: QuestionCardQuestion
  selectedAnswer: string
  showFeedback: boolean
  onSelectAnswer: (questionId: string, choiceValue: string) => void
}

const getFeedback = (
  question: QuestionCardQuestion,
  selectedAnswer: string,
): { status: '' | 'correct' | 'incorrect'; message: string } => {
  if (!selectedAnswer) {
    return {
      status: 'incorrect',
      message: `No answer selected. Correct answer: ${question.correctAnswer.toUpperCase()}.`,
    }
  }

  if (selectedAnswer === question.correctAnswer) {
    return {
      status: 'correct',
      message: question.explanation ? `Correct. ${question.explanation}` : 'Correct.',
    }
  }

  const correctChoice = question.choices.find((choice) => choice.value === question.correctAnswer)
  const correctLabel = correctChoice
    ? `${question.correctAnswer.toUpperCase()}. ${correctChoice.label}`
    : question.correctAnswer.toUpperCase()

  return {
    status: 'incorrect',
    message: question.explanation
      ? `Incorrect. Correct answer: ${correctLabel}. ${question.explanation}`
      : `Incorrect. Correct answer: ${correctLabel}.`,
  }
}

export function QuestionCard({
  index,
  question,
  selectedAnswer,
  showFeedback,
  onSelectAnswer,
}: QuestionCardProps) {
  const feedback = getFeedback(question, selectedAnswer)

  return (
    <fieldset
      className="quiz-question"
      data-question-id={question.id}
      data-multiline={question.multiline ? 'true' : 'false'}
    >
      <legend className="legend">
        <span className="quiz-question-number">Question {index + 1}</span>
        <span className="quiz-question-prompt">
          {question.multiline
            ? (() => {
                const parsed = parseAlphaListPrompt(question.prompt)
                return (
                  <>
                    {parsed.intro ? <p className="quiz-prompt-intro">{parsed.intro}</p> : null}
                    {parsed.items.length > 0 ? (
                      <ol type="A" className="quiz-prompt-alpha-list">
                        {parsed.items.map((item) => (
                          <li key={item}>{item}</li>
                        ))}
                      </ol>
                    ) : null}
                    {parsed.outro ? <p className="quiz-prompt-outro">{parsed.outro}</p> : null}
                  </>
                )
              })()
            : question.prompt}
        </span>
        {question.badgeLabel ? <span className="quiz-map-badge">{question.badgeLabel}</span> : null}
      </legend>

      <div className="quiz-choices">
        {question.choices.map((choice) => {
          const isCorrectChoice = choice.value === question.correctAnswer
          const isSelectedChoice = selectedAnswer === choice.value
          let state = ''
          if (showFeedback && isCorrectChoice) {
            state = 'correct'
          } else if (showFeedback && isSelectedChoice && !isCorrectChoice) {
            state = 'incorrect'
          }

          return (
            <label
              key={choice.value}
              className="quiz-choice"
              data-choice-value={choice.value}
              data-state={state}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                value={choice.value}
                autoComplete="off"
                checked={isSelectedChoice}
                onChange={() => onSelectAnswer(question.id, choice.value)}
              />
              <span>
                <strong>{choice.value.toUpperCase()}.</strong> {choice.label}
              </span>
            </label>
          )
        })}
      </div>

      <p className="quiz-feedback" data-status={showFeedback ? feedback.status : ''}>
        <span>{showFeedback ? feedback.message : ''}</span>
      </p>
    </fieldset>
  )
}

export default QuestionCard
