import React, { useState, useRef, useCallback, useMemo } from 'react';
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
  image?: string;
  order?: number;
  isUnsectioned?: boolean;
  currentVersion?: {
    image?: string;
    // Add other currentVersion properties as needed
  };
  showEmojis?: boolean; // Add showEmojis property for Likert questions
}

interface Section {
  id: string;
  name: string;
  description: string;
  image?: string; // Add image property for section images
  document?: string; // Add document property for section documents (PDF/Word)
  documentName?: string; // Document filename
  documentType?: string; // Document MIME type (e.g., 'application/pdf')
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
  // Add state to track the active section
  const [activeSectionId, setActiveSectionId] = useState<string>(sections.length > 0 ? sections[0].id : '');
  
  // Group questions by section - memoized to prevent recreation on each render
  const questionsBySection = useMemo(() => {
    return sections.map(section => ({
      section,
      questions: questions
        .filter(q => q.sectionId === section.id && !q.isUnsectioned)
        .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)) // Sort by order, handling undefined values
    }));
  }, [sections, questions]);
  
  // Find questions that don't belong to any section - memoized to prevent recreation on each render
  const unsectionedQuestions = useMemo(() => {
    return questions
      .filter(q => q.isUnsectioned || !q.sectionId)
      .sort((a, b) => (a.order ?? Infinity) - (b.order ?? Infinity)); // Sort by order, handling undefined values
  }, [questions]);
  
  // Calculate overall progress - memoized to prevent recreation on each render
  const calculateProgress = useCallback(() => {
    const totalQuestions = questions.length || 1; // Prevent division by zero
    const answeredQuestions = Object.keys(responses).length;
    return Math.round((answeredQuestions / totalQuestions) * 100);
  }, [questions.length, responses]);
  
  // Calculate section progress - memoized to prevent recreation on each render
  const calculateSectionProgress = useCallback((sectionId: string) => {
    const sectionQuestions = questions.filter(q => q.sectionId === sectionId);
    if (sectionQuestions.length === 0) return 0;
    const answeredSectionQuestions = sectionQuestions.filter(q => responses[q._id]);
    return Math.round((answeredSectionQuestions.length / sectionQuestions.length) * 100) || 0;
  }, [questions, responses]);
  
  // Calculate progress for unsectioned questions
  const calculateUnsectionedProgress = useCallback(() => {
    if (unsectionedQuestions.length === 0) return 0;
    const answeredQuestions = unsectionedQuestions.filter(q => responses[q._id]);
    return Math.round((answeredQuestions.length / unsectionedQuestions.length) * 100) || 0;
  }, [unsectionedQuestions, responses]);
  
  // Prepare sections data for sidebar and scrollspy
  const sectionData = useMemo(() => {
    return sections.map(section => {
      const progress = calculateSectionProgress(section.id);
      
      return {
        id: section.id,
        name: section.name,
        isActive: false, // Will be updated by ScrollSpy
        isCompleted: progress === 100,
        progress: progress // Pass the progress percentage
      };
    });
  }, [sections, responses, calculateSectionProgress]);
  
  // We no longer handle the ThankYou screen here - it's moved to SurveyLayoutBridge
  // This prevents hook order issues when transitioning to the submitted state // Add dependencies that affect section progress
  
  // Check if all required questions are answered (robust across types)
  const areAllRequiredQuestionsAnswered = () => {
    const requiredQuestions = questions.filter(q => q.required);
    return requiredQuestions.every(q => {
      const answer = responses[q._id];
      // Arrays (checkbox, rank, multi-select)
      if (Array.isArray(answer)) return answer.length > 0;
      // Strings (text, textarea, date string)
      if (typeof answer === 'string') return answer.trim().length > 0;
      // Numbers/booleans or other primitives
      return answer !== undefined && answer !== null && answer !== '';
    });
  };
  
  return (
    <PageContainer>
      <HeaderBar 
        surveyTitle={survey.title}
        averageTime={survey.estimatedTime}
        logo={survey.logo}
      />
      <MainLayout>
      <SidebarNavigation 
        sections={sectionData}
        currentSectionId={activeSectionId}
        progress={calculateProgress()}
        onSectionClick={(sectionId: string) => {
          // Update the active section ID
          setActiveSectionId(sectionId);
          
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
          sections={useMemo(() => sections.map(s => ({ id: s.id, name: s.name })), [sections])}
          offset={100}
          color={survey.color}
          // Disable ScrollSpy's ability to change active section
          onActiveSectionChange={() => {}}
        />
        
        {questionsBySection.map(({ section, questions }) => {
          // Define a simple function to handle answers for this section
          const sectionOnAnswer = (questionId: string, value: any) => onAnswer(questionId, value);
          
          return (
            <SectionContainer key={section.id} id={`section-${section.id}`}>
              <SectionAccordion
                key={section.id}
                section={section}
                questions={questions}
                responses={responses}
                onAnswer={sectionOnAnswer}
                completionPercentage={calculateSectionProgress(section.id)}
                color={survey.color}
              />
            </SectionContainer>
          );
        })}
        
        {unsectionedQuestions.length > 0 && (
          <SectionContainer id="section-unsectioned">
            <SectionHeader style={{display: 'none'}} color={survey.color}>
              <Title>Additional Questions</Title>
              <Description>Please answer the following questions to complete the survey.</Description>
              <ProgressContainer>
                <ProgressBar>
                  <ProgressIndicator width={calculateUnsectionedProgress()} />
                </ProgressBar>
                <ProgressText>{calculateUnsectionedProgress()}% Completed</ProgressText>
              </ProgressContainer>
            </SectionHeader>
            
            <QuestionsContainer>
              {unsectionedQuestions.map((question, index) => (
                <QuestionItem key={question._id}>
                  <QuestionNumber>Q{index + 1}.</QuestionNumber>
                  <QuestionContent>
                    <QuestionRenderer
                      questionType={getQuestionType(question)}
                      showEmojis={question.showEmojis === false ? false : true}
                      questionText={question.text}
                      options={question.options || []}
                      value={responses[question._id]}
                      onChange={(value) => onAnswer(question._id, value)}
                      required={!!question.required}
                      image={question.image || (question.currentVersion && question.currentVersion.image)} // Get image from question or currentVersion
                    />
                  </QuestionContent>
                </QuestionItem>
              ))}
            </QuestionsContainer>
          </SectionContainer>
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
          This survey was created using Bioptrics Pulse Platform
        </Footer>
      </ContentContainer>
      </MainLayout>
    </PageContainer>
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
const PageContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  width: 100%;
`;

const MainLayout = styled.div`
  display: flex;
  flex-direction: row;
  flex-grow: 1;
  position: relative;
  width: 100%;
`;

const ContentContainer = styled.div`
  flex-grow: 1;
  padding: 100px 2rem 40px;
  margin: 0 auto;
  margin-left: 280px; /* Add margin to account for fixed sidebar */
  width: calc(100% - 280px); /* Adjust width to account for sidebar */
  display: flex;
  flex-direction: column;
  align-items: center;
  
  @media (max-width: 768px) {
    margin-left: 0;
    width: 100%;
    padding: 100px 1rem 1rem;
  }
`;

const SectionContainer = styled.div`
  margin-bottom: 3rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
`;

const SectionHeader = styled.div<{ color: string }>`
  background-color: ${props => props.color || 'var(--primary-color, #552A47)'};
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
  background-color: var(--primary-color, #552A47);
  color: white;
  border: none;
  font-size: 1rem;
  font-weight: 500;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  padding: 0.75rem 3rem;
  border-radius: 30px;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: var(--secondary-color, #3d1e32);
    transform: ${props => props.disabled ? 'none' : 'translateY(-1px)'};
  }
`;

const ProgressContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-top: 1rem;
`;

const ProgressBar = styled.div`
  height: 6px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressIndicator = styled.div<{ width: number }>`
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

const Footer = styled.div`
  text-align: center;
  color: #9ca3af;
  font-size: 0.75rem;
  margin-top: 2rem;
  padding-top: 1rem;
  border-top: 1px solid #e5e7eb;
`;

export default AllOnOnePageLayout;
