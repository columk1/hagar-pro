import { useEffect, useMemo, useRef, useState } from 'react';
import { canonicalizePathToContentId } from '../../lib/progress/lessonIds';
import { isLessonCompleted, markLessonComplete } from '../../lib/stores/progressStore';
import QuestionCard from './QuestionCard';
import type { QuestionCardQuestion } from './questionCardTypes';

type QuizAppProps = {
	questions: QuestionCardQuestion[];
	quizId?: string;
};

const BUTTON_TEXT_CHECK = 'Check Answers';
const BUTTON_TEXT_RESET = 'Reset';

export function QuizApp({ questions, quizId }: QuizAppProps) {
	const [answersByQuestionId, setAnswersByQuestionId] = useState<Record<string, string>>({});
	const [reviewMode, setReviewMode] = useState(false);
	const completionMarkedRef = useRef(false);
	const resolvedQuizIdRef = useRef('');

	useEffect(() => {
		const explicitQuizId = (quizId ?? '').trim();
		const inferredQuizId = typeof window !== 'undefined'
			? canonicalizePathToContentId(window.location.pathname)
			: '';
		const resolvedQuizId = explicitQuizId || inferredQuizId;
		resolvedQuizIdRef.current = resolvedQuizId;
		completionMarkedRef.current = resolvedQuizId ? isLessonCompleted(resolvedQuizId) : false;
	}, [quizId]);

	const score = useMemo(() => {
		if (!reviewMode) {
			return 0;
		}

		return questions.reduce((correctCount, question) => {
			return answersByQuestionId[question.id] === question.correctAnswer
				? correctCount + 1
				: correctCount;
		}, 0);
	}, [answersByQuestionId, questions, reviewMode]);

	const handleCheckOrReset = () => {
		setReviewMode((isReviewing) => {
			const nextReviewMode = !isReviewing;
			if (nextReviewMode && !completionMarkedRef.current && resolvedQuizIdRef.current) {
				markLessonComplete(resolvedQuizIdRef.current);
				completionMarkedRef.current = true;
			}
			return nextReviewMode;
		});
	};

	const handleSelectAnswer = (questionId: string, choiceValue: string) => {
		setAnswersByQuestionId((previousAnswers) => ({
			...previousAnswers,
			[questionId]: choiceValue,
		}));
	};

	return (
		<section className="quiz" data-feedback-visible={reviewMode ? 'true' : 'false'}>
			{questions.map((question, index) => (
				<QuestionCard
					key={question.id}
					index={index}
					question={question}
					selectedAnswer={answersByQuestionId[question.id] ?? ''}
					showFeedback={reviewMode}
					onSelectAnswer={handleSelectAnswer}
				/>
			))}

			<div className="quiz-actions">
				<p className="quiz-score" hidden={!reviewMode}>
					Score: {score}/{questions.length}
				</p>
				<button type="button" className="quiz-check-button" onClick={handleCheckOrReset}>
					{reviewMode ? BUTTON_TEXT_RESET : BUTTON_TEXT_CHECK}
				</button>
			</div>
		</section>
	);
}

export default QuizApp;
