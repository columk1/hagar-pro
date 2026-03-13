import { useMemo, useRef, useState } from 'react'

import VNCViewer from '../tools/VNCViewer'
import type { ExamQuestion } from './examTypes'
import { generateExamQuestions } from './examUtils'
import QuestionCard from './QuestionCard'

type ExamAppProps = {
  questionPool: ExamQuestion[]
}

const BUTTON_TEXT_CHECK = 'Submit'
const BUTTON_TEXT_RESET = 'Reset'
const PASSING_PERCENTAGE = 60

const getMapQuestionOrder = (question: ExamQuestion): number => {
  const match = /^A(\d+)$/i.exec(question.id)
  if (!match) {
    return Number.MAX_SAFE_INTEGER
  }

  return Number.parseInt(match[1], 10)
}

export function ExamApp({ questionPool }: ExamAppProps) {
  const [hasStarted, setHasStarted] = useState(false)
  const [currentExam, setCurrentExam] = useState<ExamQuestion[]>([])
  const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, string>>({})
  const [reviewMode, setReviewMode] = useState(false)
  const runPanelRef = useRef<HTMLDivElement | null>(null)

  const score = useMemo(() => {
    if (!reviewMode) {
      return 0
    }

    return currentExam.reduce((correctCount, question) => {
      return answersByQuestionId[question.id] === question.correctAnswer
        ? correctCount + 1
        : correctCount
    }, 0)
  }, [answersByQuestionId, currentExam, reviewMode])

  const scorePercentage = useMemo(() => {
    if (!reviewMode || currentExam.length === 0) {
      return 0
    }

    return Math.round((score / currentExam.length) * 100)
  }, [currentExam.length, reviewMode, score])

  const didPass = useMemo(() => {
    if (!reviewMode || currentExam.length === 0) {
      return false
    }

    return scorePercentage >= PASSING_PERCENTAGE
  }, [currentExam.length, reviewMode, scorePercentage])

  const generalQuestions = useMemo(
    () => currentExam.filter((question) => !question.isMapQuestion),
    [currentExam],
  )

  const mapQuestions = useMemo(
    () =>
      currentExam
        .filter((question) => question.isMapQuestion)
        .sort((firstQuestion, secondQuestion) => {
          return getMapQuestionOrder(firstQuestion) - getMapQuestionOrder(secondQuestion)
        }),
    [currentExam],
  )

  const renderNewExam = () => {
    const nextExam = generateExamQuestions(questionPool)
    setCurrentExam(nextExam)
    setAnswersByQuestionId({})
    setReviewMode(false)
  }

  const handleStartExam = () => {
    renderNewExam()
    setHasStarted(true)
    window.requestAnimationFrame(() => {
      runPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleRegenerateExam = () => {
    renderNewExam()
    window.requestAnimationFrame(() => {
      runPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    })
  }

  const handleSelectAnswer = (questionId: string, choiceValue: string) => {
    setAnswersByQuestionId((previousAnswers) => ({
      ...previousAnswers,
      [questionId]: choiceValue,
    }))
  }

  const handleCheckOrReset = () => {
    setReviewMode((isReviewing) => !isReviewing)
  }

  return (
    <>
      {!hasStarted ? (
        <div className="exam-intro">
          <h2>Ready to Begin?</h2>
          <p>
            When you click <strong>Start Exam</strong>, the system will dynamically generate your
            randomized 40-question practice test with a balanced spread across all subjects.
          </p>
          <p>
            <strong>Before you start:</strong>
          </p>
          <ul>
            <li>Find a quiet space where you can focus without interruptions.</li>
            <li>Have your map and navigation tools ready.</li>
            <li>
              Set a timer for <strong>2.5 hours</strong> right when you click start to practice your
              official pacing.
            </li>
          </ul>
          <button type="button" className="btn-primary" onClick={handleStartExam}>
            Start Exam
          </button>
        </div>
      ) : null}

      {hasStarted ? (
        <div className="exam-run" ref={runPanelRef}>
          <div className="exam-toolbar">
            <p className="exam-timer-reminder">
              Exam in progress. Ensure your external timer is running for <strong>2.5 hours</strong>
              .
            </p>
            <button type="button" className="btn-primary" onClick={handleRegenerateExam}>
              Generate New Exam
            </button>
          </div>

          <section className="quiz" data-feedback-visible={reviewMode ? 'true' : 'false'}>
            {generalQuestions.map((question, index) => (
              <QuestionCard
                key={question.id}
                index={index}
                question={{
                  ...question,
                  badgeLabel: question.isMapQuestion ? 'Map reading' : undefined,
                }}
                selectedAnswer={answersByQuestionId[question.id] ?? ''}
                showFeedback={reviewMode}
                onSelectAnswer={handleSelectAnswer}
              />
            ))}

            {mapQuestions.length > 0 ? (
              <section className="quiz-map-work" aria-label="Map Work">
                <h3 className="quiz-section-title">Map Work</h3>
                <details className="exam-vnc">
                  <summary>Vancouver VNC reference map</summary>
                  <div className="exam-vnc-viewer">
                    <VNCViewer />
                  </div>
                </details>

                {mapQuestions.map((question, mapIndex) => (
                  <QuestionCard
                    key={question.id}
                    index={generalQuestions.length + mapIndex}
                    question={{
                      ...question,
                      badgeLabel: `Map plotting ${mapIndex + 1}`,
                    }}
                    selectedAnswer={answersByQuestionId[question.id] ?? ''}
                    showFeedback={reviewMode}
                    onSelectAnswer={handleSelectAnswer}
                  />
                ))}
              </section>
            ) : null}

            <div className="quiz-actions">
              <p className="quiz-score" hidden={!reviewMode}>
                Score: {score}/{currentExam.length} ({scorePercentage}%)
              </p>
              <p className="quiz-score" hidden={!reviewMode}>
                Result: {didPass ? 'Pass' : 'Fail'}
              </p>
              <button type="button" className="btn-primary" onClick={handleCheckOrReset}>
                {reviewMode ? BUTTON_TEXT_RESET : BUTTON_TEXT_CHECK}
              </button>
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}

export default ExamApp
