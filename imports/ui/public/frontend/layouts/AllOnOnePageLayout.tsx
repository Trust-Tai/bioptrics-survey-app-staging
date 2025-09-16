import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import SidebarNavigation from '../components/SidebarNavigation';
import ScrollSpy from '../components/ScrollSpy';
import SectionAccordion from '../components/SectionAccordion';
import ThankYouScreen from '../components/ThankYouScreen';
import QuestionRenderer from '../components/QuestionRenderer';
import HeaderBar from '../components/HeaderBar';

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

interface Section {
  id: string;
  name: string;
  description: string;
}

interface AllOnOnePageLayoutProps {
  survey: any;
  sections: Section[];
  questions: Question[];
  responses: Record<string, any>;
  onAnswer: (questionId: string, answer: any) => void;
  onSubmit: () => void;
  isSubmitted: boolean;
}

const AllOnOnePageLayout: React.FC<AllOnOnePageLayoutProps> = ({
  survey,
  sections,
  questions,
  responses,
  onAnswer,
  onSubmit,
  isSubmitted
}) => {
  const [startTime] = useState<number>(Date.now());
  
  // Calculate overall progress
  const calculateProgress = () => {
    const totalQuestions = questions.length;
    const answeredQuestions = Object.keys(responses).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  };
  
  // Calculate section progress
  const calculateSectionProgress = (sectionId: string) => {
    const sectionQuestions = questions.filter(q => q.sectionId === sectionId);
    const answeredSectionQuestions = sectionQuestions.filter(q => responses[q._id]);
    return Math.round((answeredSectionQuestions.length / sectionQuestions.length) * 100) || 0;
  };
  
  // If submitted, show thank you screen
  if (isSubmitted) {
    const completionTime = Math.round((Date.now() - startTime) / 1000); // in seconds
    const minutes = Math.floor(completionTime / 60);
    const seconds = completionTime % 60;
    const formattedTime = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}sec`;
    
    return (
      <ThankYouScreen 
        logo={survey.logo}
        totalResponses={Object.keys(responses).length}
        unansweredQuestions={questions.filter(q => !responses[q._id]).length}
        completionPercentage={calculateProgress()}
        timeTaken={formattedTime}
        onTakeAgain={() => window.location.reload()}
        color={survey.color}
      />
    );
  }
  
  // Group questions by section
  const questionsBySection = sections.map(section => ({
    section,
    questions: questions.filter(q => q.sectionId === section.id)
  }));
  
  // Find questions that don't belong to any section
  const unsectionedQuestions = questions.filter(q => !q.sectionId);
  
  // Prepare sections data for sidebar and scrollspy
  const sectionData = sections.map(section => {
    const progress = calculateSectionProgress(section.id);
    
    return {
      id: section.id,
      name: section.name,
      isActive: false, // Will be updated by ScrollSpy
      isCompleted: progress === 100
    };
  });
  
  // Check if all required questions are answered
  const areAllRequiredQuestionsAnswered = () => {
    const requiredQuestions = questions.filter(q => q.required);
    return requiredQuestions.every(q => responses[q._id]);
  };
  
  return (
    <LayoutContainer>
      <HeaderBar 
        surveyTitle={survey.title}
        averageTime={survey.estimatedTime}
        logo={survey.logo}
      />
      <SidebarNavigation 
        sections={sectionData}
        currentSectionId=""
        progress={calculateProgress()}
        onSectionClick={(sectionId) => {
          // Scroll to section
          const element = document.getElementById(`section-${sectionId}`);
          if (element) {
            window.scrollTo({
              top: element.offsetTop - 100,
              behavior: 'smooth'
            });
          }
        }}
        color={survey.color}
        logo={survey.logo}
      />
      
      <ContentContainer>
        <ScrollSpy 
          sections={sections.map(s => ({ id: s.id, name: s.name }))}
          offset={100}
          color={survey.color}
        />
        
        {questionsBySection.map(({ section, questions }) => (
          <SectionAccordion
            key={section.id}
            section={section}
            questions={questions}
            responses={responses}
            onAnswer={onAnswer}
            completionPercentage={calculateSectionProgress(section.id)}
            color={survey.color}
          />
        ))}
        
        {unsectionedQuestions.length > 0 && (
          <FinalThoughtsSection>
            <SectionHeader color={survey.color}>
              <Title>Final Thoughts</Title>
              <Description>Is there anything else you would like to share about your experience?</Description>
            </SectionHeader>
            
            <QuestionsContainer>
              {unsectionedQuestions.map((question, index) => (
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
          </FinalThoughtsSection>
        )}
        
        <SubmitButtonContainer>
          <SubmitButton 
            onClick={onSubmit} 
            disabled={!areAllRequiredQuestionsAnswered()}
            color={survey.color}
          >
            Submit
          </SubmitButton>
        </SubmitButtonContainer>
        
        <Footer>
          This survey was created using Bioptrics Survey Platform
        </Footer>
      </ContentContainer>
    </LayoutContainer>
  );
};

// Helper function to determine question type
const getQuestionType = (question: any) => {
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

// Styled components
const LayoutContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  padding: 2rem;
  margin-left: 280px;
  max-width: 100%;
  margin-top: 0px; /* Add space for the header */
  
  @media (max-width: 768px) {
    margin-left: 0;
    padding: 1rem;
  }
`;

const FinalThoughtsSection = styled.div`
  margin-bottom: 3rem;
`;

const SectionHeader = styled.div<{ color: string }>`
  background-color: ${props => `${props.color}DD`};
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
  margin: 0;
  opacity: 0.9;
  line-height: 1.5;
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

const SubmitButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 3rem 0;
`;

const SubmitButton = styled.button<{ color: string; disabled: boolean }>`
  background-color: ${props => props.disabled ? '#d1d5db' : props.color};
  color: white;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  padding: 0.75rem 3rem;
  border-radius: 30px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.disabled ? '#d1d5db' : '#3d1e32'};
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
  }
`;

const Footer = styled.div`
  text-align: center;
  color: #9ca3af;
  font-size: 0.75rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

export default AllOnOnePageLayout;
