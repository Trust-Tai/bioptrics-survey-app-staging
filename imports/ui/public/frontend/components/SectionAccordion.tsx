import React from 'react';
import styled from 'styled-components';
import QuestionRenderer from './QuestionRenderer';

interface Question {
  _id: string;
  id?: string;
  text: string;
  type?: string;
  responseType?: string;
  required?: boolean;
  options?: Array<any>;
  sectionId?: string;
}

interface SectionAccordionProps {
  section: {
    id: string;
    name: string;
    description: string;
  };
  questions: Question[];
  responses: Record<string, any>;
  onAnswer: (questionId: string, answer: any) => void;
  completionPercentage: number;
  color?: string;
}

const SectionAccordion: React.FC<SectionAccordionProps> = ({
  section,
  questions,
  responses,
  onAnswer,
  completionPercentage,
  color = '#552A47'
}) => {
  // Get question type
  const getQuestionType = (question: Question) => {
    const type = question.responseType || question.type || '';
    
    if (type.includes('likert')) return 'likert';
    if (type.includes('radio') || type === 'single_choice') return 'radio';
    if (type.includes('checkbox') || type === 'multiple_choice') return 'checkbox';
    if (type.includes('rating') || type === 'scale') return 'rating';
    if (type.includes('rank')) return 'rank';
    if (type.includes('date')) return 'date';
    if (type.includes('long_text') || type === 'textarea') return 'textarea';
    if (type.includes('text')) return 'text';
    
    return 'text';
  };

  return (
    <SectionContainer id={`section-${section.id}`}>
      <SectionHeader color={color}>
        <Title>{section.name}</Title>
        <Description>{section.description}</Description>
        <ProgressContainer>
          <ProgressBar>
            <ProgressIndicator width={completionPercentage} color={color} />
          </ProgressBar>
          <ProgressText>{completionPercentage}% Completed</ProgressText>
        </ProgressContainer>
      </SectionHeader>
      
      <QuestionsContainer>
        {/* Filter questions to only show those belonging to this section */}
        {questions
          .filter(question => question.sectionId === section.id)
          .map((question, index) => (
          <QuestionItem key={question._id}>
            <QuestionNumber>Q{index + 1}.</QuestionNumber>
            <QuestionContent>
              <QuestionRenderer
                questionType={getQuestionType(question)}
                questionText={question.text}
                options={question.options || []}
                value={responses[question._id]}
                onChange={(value) => onAnswer(question._id, value)}
                required={!!question.required}
              />
            </QuestionContent>
          </QuestionItem>
        ))}
      </QuestionsContainer>
    </SectionContainer>
  );
};

// Styled components
const SectionContainer = styled.div`
  margin-bottom: 3rem;
  scroll-margin-top: 2rem;
`;

const SectionHeader = styled.div<{ color: string }>`
  background-color: ${props => `${props.color}`};
  color: white;
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin: 0 0 0.5rem 0;
`;

const Description = styled.p`
  font-size: 0.9rem;
  margin: 0 0 1.5rem 0;
  opacity: 0.9;
  line-height: 1.5;
`;

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
`;

const ProgressBar = styled.div`
  height: 6px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressIndicator = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${props => props.width}%;
  background-color: white;
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 0.8rem;
  font-weight: 500;
  text-align: right;
`;

const QuestionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2rem;
`;

const QuestionItem = styled.div`
  display: flex;
  gap: 1rem;
  padding: 1.5rem;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const QuestionNumber = styled.div`
  font-weight: 600;
  color: #6b7280;
  min-width: 2.5rem;
`;

const QuestionContent = styled.div`
  flex-grow: 1;
`;

export default SectionAccordion;
