import React, { useState } from 'react';
import styled from 'styled-components';
import type { QuizBlock as QuizBlockType } from '../../types/contentBlocks';

const QuizContainer = styled.div`
  width: 100%;
`;

const QuizQuestion = styled.div`
  padding: 20px;
  background: #ffffff;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  margin-bottom: 16px;
`;

const QuestionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 16px;
`;

const QuestionNumber = styled.div`
  width: 32px;
  height: 32px;
  background: #6366f1;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  flex-shrink: 0;
`;

const QuestionText = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  flex: 1;
`;

const AnswerOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

const AnswerOption = styled.button<{ 
  isSelected: boolean; 
  isCorrect?: boolean; 
  isIncorrect?: boolean;
  showResult: boolean;
}>`
  padding: 14px 16px;
  background: ${props => {
    if (props.showResult && props.isCorrect) return '#d1fae5';
    if (props.showResult && props.isIncorrect) return '#fee2e2';
    if (props.isSelected) return '#eff6ff';
    return '#ffffff';
  }};
  border: 2px solid ${props => {
    if (props.showResult && props.isCorrect) return '#10b981';
    if (props.showResult && props.isIncorrect) return '#ef4444';
    if (props.isSelected) return '#3b82f6';
    return '#e5e7eb';
  }};
  border-radius: 6px;
  text-align: left;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 14px;
  color: ${props => {
    if (props.showResult && props.isCorrect) return '#065f46';
    if (props.showResult && props.isIncorrect) return '#991b1b';
    return '#374151';
  }};
  display: flex;
  align-items: center;
  gap: 10px;

  &:hover {
    background: ${props => props.showResult ? undefined : '#f9fafb'};
    border-color: ${props => props.showResult ? undefined : '#9ca3af'};
  }

  &:disabled {
    cursor: not-allowed;
  }
`;

const OptionIcon = styled.div<{ isCorrect?: boolean; isIncorrect?: boolean }>`
  width: 20px;
  height: 20px;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 18px;
    height: 18px;
    color: ${props => props.isCorrect ? '#10b981' : props.isIncorrect ? '#ef4444' : 'transparent'};
  }
`;

const Explanation = styled.div<{ type: 'correct' | 'incorrect' }>`
  margin-top: 12px;
  padding: 12px;
  background: ${props => props.type === 'correct' ? '#ecfdf5' : '#fef2f2'};
  border: 1px solid ${props => props.type === 'correct' ? '#a7f3d0' : '#fecaca'};
  border-radius: 6px;
  font-size: 13px;
  color: ${props => props.type === 'correct' ? '#065f46' : '#991b1b'};
  line-height: 1.5;
`;

const SubmitButton = styled.button`
  margin-top: 12px;
  padding: 10px 20px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #4f46e5;
  }

  &:disabled {
    background: #9ca3af;
    cursor: not-allowed;
  }
`;

const QuizScore = styled.div`
  padding: 20px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 8px;
  color: white;
  text-align: center;
`;

const ScoreTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
`;

const ScoreValue = styled.div`
  font-size: 36px;
  font-weight: 700;
  margin-bottom: 12px;
`;

const RetryButton = styled.button`
  padding: 10px 20px;
  background: white;
  color: #667eea;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  }
`;

const EmptyState = styled.div`
  padding: 48px 24px;
  text-align: center;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
`;

const EmptyIcon = styled.svg`
  width: 48px;
  height: 48px;
  color: #9ca3af;
  margin: 0 auto 16px;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 4px 0;
`;

const EmptySubtext = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
`;

interface QuizBlockProps {
  block: QuizBlockType;
  isEditing?: boolean;
  onUpdate?: (blockId: string, settings: any) => void;
}

export const QuizBlock: React.FC<QuizBlockProps> = ({ block }) => {
  const { settings } = block;
  const questions = settings?.questions || [];
  const showScoreImmediately = settings?.showScoreImmediately !== false;

  const [selectedAnswers, setSelectedAnswers] = useState<{ [key: string]: string }>({});
  const [submittedQuestions, setSubmittedQuestions] = useState<Set<string>>(new Set());
  const [showResults, setShowResults] = useState(false);

  const handleAnswerSelect = (questionId: string, answerId: string) => {
    if (!submittedQuestions.has(questionId)) {
      setSelectedAnswers(prev => ({
        ...prev,
        [questionId]: answerId,
      }));
    }
  };

  const handleSubmitQuestion = (questionId: string) => {
    setSubmittedQuestions(prev => new Set(prev).add(questionId));
  };

  const handleSubmitQuiz = () => {
    const allQuestions = new Set(questions.map((q: any) => q.id));
    setSubmittedQuestions(allQuestions);
    setShowResults(true);
  };

  const handleRetry = () => {
    setSelectedAnswers({});
    setSubmittedQuestions(new Set());
    setShowResults(false);
  };

  const calculateScore = () => {
    let correct = 0;
    questions.forEach((question: any) => {
      const selectedAnswer = selectedAnswers[question.id];
      if (selectedAnswer === question.correctAnswer) {
        correct++;
      }
    });
    return {
      correct,
      total: questions.length,
      percentage: questions.length > 0 ? Math.round((correct / questions.length) * 100) : 0,
    };
  };

  if (questions.length === 0) {
    return (
      <QuizContainer>
        <EmptyState>
          <EmptyIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" 
            />
          </EmptyIcon>
          <EmptyText>No quiz questions</EmptyText>
          <EmptySubtext>Click edit to add interactive questions</EmptySubtext>
        </EmptyState>
      </QuizContainer>
    );
  }

  const score = calculateScore();

  return (
    <QuizContainer>
      {questions.map((question: any, index: number) => {
        const isSubmitted = submittedQuestions.has(question.id);
        const selectedAnswer = selectedAnswers[question.id];
        const isCorrectAnswer = selectedAnswer === question.correctAnswer;

        return (
          <QuizQuestion key={question.id}>
            <QuestionHeader>
              <QuestionNumber>{index + 1}</QuestionNumber>
              <QuestionText>{question.question}</QuestionText>
            </QuestionHeader>

            <AnswerOptions>
              {question.answers?.map((answer: any) => {
                const isSelected = selectedAnswer === answer.id;
                const isCorrect = isSubmitted && answer.id === question.correctAnswer;
                const isIncorrect = isSubmitted && isSelected && answer.id !== question.correctAnswer;

                return (
                  <AnswerOption
                    key={answer.id}
                    isSelected={isSelected}
                    isCorrect={isCorrect}
                    isIncorrect={isIncorrect}
                    showResult={isSubmitted}
                    onClick={() => handleAnswerSelect(question.id, answer.id)}
                    disabled={isSubmitted}
                  >
                    {isSubmitted && (
                      <OptionIcon isCorrect={isCorrect} isIncorrect={isIncorrect}>
                        {isCorrect && (
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                        {isIncorrect && (
                          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        )}
                      </OptionIcon>
                    )}
                    {answer.text}
                  </AnswerOption>
                );
              })}
            </AnswerOptions>

            {isSubmitted && question.explanation && (
              <Explanation type={isCorrectAnswer ? 'correct' : 'incorrect'}>
                {question.explanation}
              </Explanation>
            )}

            {!isSubmitted && selectedAnswer && !showResults && (
              <SubmitButton onClick={() => handleSubmitQuestion(question.id)}>
                Check Answer
              </SubmitButton>
            )}
          </QuizQuestion>
        );
      })}

      {!showResults && questions.length > 1 && (
        <SubmitButton
          onClick={handleSubmitQuiz}
          disabled={Object.keys(selectedAnswers).length !== questions.length}
        >
          Submit Quiz ({Object.keys(selectedAnswers).length}/{questions.length})
        </SubmitButton>
      )}

      {showResults && showScoreImmediately && (
        <QuizScore>
          <ScoreTitle>Your Score</ScoreTitle>
          <ScoreValue>
            {score.correct}/{score.total}
          </ScoreValue>
          <div style={{ fontSize: '18px', marginBottom: '16px' }}>
            {score.percentage}% Correct
          </div>
          <RetryButton onClick={handleRetry}>Retry Quiz</RetryButton>
        </QuizScore>
      )}
    </QuizContainer>
  );
};
