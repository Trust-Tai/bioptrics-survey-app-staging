import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiMonitor, FiSmartphone, FiTablet, FiEye, FiChevronLeft, FiChevronRight } from 'react-icons/fi';
import { SurveySectionItem } from './SurveySections';

// Styled components for the preview UI
const Container = styled.div`
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin: 0;
`;

const DeviceSelector = styled.div`
  display: flex;
  gap: 8px;
`;

const DeviceButton = styled.button<{ active: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: ${props => props.active ? '#f9f4f8' : '#fff'};
  border: 1px solid ${props => props.active ? '#552a47' : '#ddd'};
  color: ${props => props.active ? '#552a47' : '#666'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #552a47;
    color: #552a47;
  }
`;

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
`;

const DeviceFrame = styled.div<{ device: 'desktop' | 'tablet' | 'mobile' }>`
  width: ${props => {
    switch (props.device) {
      case 'desktop': return '100%';
      case 'tablet': return '768px';
      case 'mobile': return '375px';
    }
  }};
  height: ${props => {
    switch (props.device) {
      case 'desktop': return '600px';
      case 'tablet': return '1024px';
      case 'mobile': return '667px';
    }
  }};
  border: 1px solid #ddd;
  border-radius: ${props => props.device === 'desktop' ? '6px' : '16px'};
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  position: relative;
  
  ${props => props.device === 'mobile' && `
    &:before {
      content: '';
      position: absolute;
      top: 12px;
      left: 50%;
      transform: translateX(-50%);
      width: 60px;
      height: 6px;
      background: #eee;
      border-radius: 3px;
      z-index: 1;
    }
  `}
  
  ${props => props.device === 'tablet' && `
    &:before {
      content: '';
      position: absolute;
      top: 50%;
      right: 12px;
      transform: translateY(-50%);
      width: 6px;
      height: 60px;
      background: #eee;
      border-radius: 3px;
      z-index: 1;
    }
  `}
`;

const PreviewFrame = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  background: #fff;
`;

const NavigationBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px;
  background: #f9f4f8;
  border-bottom: 1px solid #e5d6c7;
`;

const NavigationButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: #fff;
  border: 1px solid #ddd;
  border-radius: 6px;
  color: #552a47;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #552a47;
    background: #f9f4f8;
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ProgressBar = styled.div<{ progress: number }>`
  width: 100%;
  height: 8px;
  background: #f0f0f0;
  border-radius: 4px;
  overflow: hidden;
  position: relative;
  margin-bottom: 16px;
  
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background: #552a47;
    transition: width 0.3s ease;
  }
`;

const SurveyContent = styled.div`
  padding: 24px;
`;

const SurveyHeader = styled.div<{ color?: string; hasImage?: boolean }>`
  text-align: center;
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5d6c7;
  
  ${props => props.hasImage && `
    padding-top: 180px;
    background-image: url(${props.hasImage ? '/images/survey-header.jpg' : ''});
    background-size: cover;
    background-position: center;
    border-radius: 8px;
    margin-bottom: 32px;
  `}
`;

const SurveyLogo = styled.div`
  width: 80px;
  height: 80px;
  border-radius: 40px;
  background: #f9f4f8;
  margin: 0 auto 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #552a47;
  font-weight: 700;
  font-size: 24px;
`;

const SurveyTitle = styled.h1<{ color?: string }>`
  font-size: 24px;
  font-weight: 700;
  color: ${props => props.color || '#28211e'};
  margin: 0 0 8px 0;
`;

const SurveyDescription = styled.p`
  font-size: 16px;
  color: #666;
  margin: 0;
`;

const SectionContainer = styled.div`
  margin-bottom: 24px;
  padding: 20px;
  background: #fff;
  border: 1px solid #e5d6c7;
  border-radius: 8px;
`;

const SectionHeader = styled.div<{ color?: string }>`
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #e5d6c7;
  
  h2 {
    font-size: 20px;
    font-weight: 600;
    color: ${props => props.color || '#552a47'};
    margin: 0 0 8px 0;
  }
  
  p {
    font-size: 15px;
    color: #666;
    margin: 0;
  }
`;

const SectionInstructions = styled.div`
  margin-bottom: 16px;
  padding: 12px;
  background: #f9f4f8;
  border-radius: 6px;
  font-size: 14px;
  color: #552a47;
`;

const QuestionContainer = styled.div`
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e5d6c7;
  
  &:last-child {
    margin-bottom: 0;
    padding-bottom: 0;
    border-bottom: none;
  }
`;

const QuestionText = styled.div`
  font-size: 16px;
  font-weight: 500;
  color: #333;
  margin-bottom: 12px;
`;

const AnswerOptions = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const AnswerOption = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 12px;
  background: #f9f4f8;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f0e8ed;
  }
  
  input {
    cursor: pointer;
  }
`;

const TextInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  min-height: 100px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const RatingContainer = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 8px;
`;

const RatingOption = styled.button<{ selected?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 6px;
  background: ${props => props.selected ? '#552a47' : '#f9f4f8'};
  color: ${props => props.selected ? '#fff' : '#333'};
  border: 1px solid ${props => props.selected ? '#552a47' : '#ddd'};
  font-weight: ${props => props.selected ? '600' : '400'};
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #552a47;
    background: ${props => props.selected ? '#552a47' : '#f0e8ed'};
  }
`;

// Types for survey preview
export interface SurveyQuestion {
  id: string;
  text: string;
  type: 'multiple_choice' | 'single_choice' | 'text' | 'textarea' | 'rating' | 'scale';
  options?: string[];
  required?: boolean;
  sectionId?: string;
}

export interface SurveyPreviewData {
  title: string;
  description: string;
  logo?: string;
  image?: string;
  color?: string;
  sections: SurveySectionItem[];
  questions: SurveyQuestion[];
  showProgressBar?: boolean;
}

interface SurveyPreviewProps {
  surveyId: string;
  previewData?: SurveyPreviewData;
}

const SurveyPreview: React.FC<SurveyPreviewProps> = ({
  surveyId,
  previewData
}) => {
  const [device, setDevice] = useState<'desktop' | 'tablet' | 'mobile'>('desktop');
  const [currentSection, setCurrentSection] = useState(0);
  const [data, setData] = useState<SurveyPreviewData | null>(null);
  
  useEffect(() => {
    if (previewData) {
      setData(previewData);
    } else {
      // Generate mock data for demonstration
      const mockSections: SurveySectionItem[] = [
        {
          id: 'section-1',
          name: 'Welcome',
          description: 'Introduction to the survey',
          isActive: true,
          priority: 0,
          color: '#552a47',
          instructions: 'Please read the introduction carefully before proceeding.'
        },
        {
          id: 'section-2',
          name: 'Work Environment',
          description: 'Questions about your workplace',
          isActive: true,
          priority: 1,
          color: '#2e7d32',
          instructions: 'Think about your current workplace when answering these questions.'
        },
        {
          id: 'section-3',
          name: 'Management',
          description: 'Questions about management and leadership',
          isActive: true,
          priority: 2,
          color: '#1976d2',
          instructions: 'Consider your direct manager and leadership team when answering.'
        }
      ];
      
      const mockQuestions: SurveyQuestion[] = [
        {
          id: 'q1',
          text: 'How satisfied are you with your current work environment?',
          type: 'rating',
          required: true,
          sectionId: 'section-2'
        },
        {
          id: 'q2',
          text: 'Which aspects of your workplace do you value the most?',
          type: 'multiple_choice',
          options: ['Flexibility', 'Compensation', 'Team culture', 'Growth opportunities', 'Work-life balance'],
          required: true,
          sectionId: 'section-2'
        },
        {
          id: 'q3',
          text: 'Please describe any improvements you would like to see in your workplace.',
          type: 'textarea',
          required: false,
          sectionId: 'section-2'
        },
        {
          id: 'q4',
          text: 'How would you rate your manager\'s leadership skills?',
          type: 'scale',
          required: true,
          sectionId: 'section-3'
        },
        {
          id: 'q5',
          text: 'How often do you receive feedback from your manager?',
          type: 'single_choice',
          options: ['Weekly', 'Monthly', 'Quarterly', 'Annually', 'Never'],
          required: true,
          sectionId: 'section-3'
        }
      ];
      
      setData({
        title: 'Employee Satisfaction Survey',
        description: 'Help us improve your workplace experience by sharing your feedback.',
        color: '#552a47',
        image: '/images/survey-header.jpg',
        sections: mockSections,
        questions: mockQuestions,
        showProgressBar: true
      });
    }
  }, [previewData]);
  
  const handlePrevSection = () => {
    setCurrentSection(prev => Math.max(0, prev - 1));
  };
  
  const handleNextSection = () => {
    setCurrentSection(prev => Math.min(data?.sections.length ? data.sections.length - 1 : 0, prev + 1));
  };
  
  if (!data) {
    return (
      <Container>
        <Header>
          <Title>Survey Preview</Title>
        </Header>
        <div style={{ textAlign: 'center', padding: '40px 0', color: '#666' }}>
          Loading preview data...
        </div>
      </Container>
    );
  }
  
  const currentSectionData = data.sections[currentSection];
  const sectionQuestions = data.questions.filter(q => q.sectionId === currentSectionData.id);
  const progress = ((currentSection + 1) / data.sections.length) * 100;
  
  return (
    <Container>
      <Header>
        <Title>Survey Preview</Title>
        <DeviceSelector>
          <DeviceButton 
            active={device === 'desktop'} 
            onClick={() => setDevice('desktop')}
            title="Desktop view"
          >
            <FiMonitor size={20} />
          </DeviceButton>
          <DeviceButton 
            active={device === 'tablet'} 
            onClick={() => setDevice('tablet')}
            title="Tablet view"
          >
            <FiTablet size={20} />
          </DeviceButton>
          <DeviceButton 
            active={device === 'mobile'} 
            onClick={() => setDevice('mobile')}
            title="Mobile view"
          >
            <FiSmartphone size={20} />
          </DeviceButton>
        </DeviceSelector>
      </Header>
      
      <PreviewContainer>
        <DeviceFrame device={device}>
          <PreviewFrame>
            {data.showProgressBar && <ProgressBar progress={progress} />}
            
            <NavigationBar>
              <NavigationButton 
                onClick={handlePrevSection}
                disabled={currentSection === 0}
              >
                <FiChevronLeft size={16} />
                Previous
              </NavigationButton>
              
              <div style={{ fontSize: 14, fontWeight: 500 }}>
                Section {currentSection + 1} of {data.sections.length}
              </div>
              
              <NavigationButton 
                onClick={handleNextSection}
                disabled={currentSection === data.sections.length - 1}
              >
                Next
                <FiChevronRight size={16} />
              </NavigationButton>
            </NavigationBar>
            
            <SurveyContent>
              {currentSection === 0 && (
                <SurveyHeader color={data.color} hasImage={!!data.image}>
                  {data.logo ? (
                    <img src={data.logo} alt="Survey Logo" style={{ width: 80, height: 80, borderRadius: '50%', marginBottom: 16 }} />
                  ) : (
                    <SurveyLogo>
                      {data.title.substring(0, 2).toUpperCase()}
                    </SurveyLogo>
                  )}
                  <SurveyTitle color={data.color}>{data.title}</SurveyTitle>
                  <SurveyDescription>{data.description}</SurveyDescription>
                </SurveyHeader>
              )}
              
              <SectionContainer>
                <SectionHeader color={currentSectionData.color}>
                  <h2>{currentSectionData.name}</h2>
                  <p>{currentSectionData.description}</p>
                </SectionHeader>
                
                {currentSectionData.instructions && (
                  <SectionInstructions>
                    <FiEye size={16} style={{ marginRight: 8, verticalAlign: 'middle' }} />
                    {currentSectionData.instructions}
                  </SectionInstructions>
                )}
                
                {sectionQuestions.map(question => (
                  <QuestionContainer key={question.id}>
                    <QuestionText>
                      {question.text}
                      {question.required && <span style={{ color: '#e74c3c', marginLeft: 4 }}>*</span>}
                    </QuestionText>
                    
                    {question.type === 'single_choice' && question.options && (
                      <AnswerOptions>
                        {question.options.map((option, index) => (
                          <AnswerOption key={index}>
                            <input type="radio" name={question.id} />
                            {option}
                          </AnswerOption>
                        ))}
                      </AnswerOptions>
                    )}
                    
                    {question.type === 'multiple_choice' && question.options && (
                      <AnswerOptions>
                        {question.options.map((option, index) => (
                          <AnswerOption key={index}>
                            <input type="checkbox" name={question.id} />
                            {option}
                          </AnswerOption>
                        ))}
                      </AnswerOptions>
                    )}
                    
                    {question.type === 'text' && (
                      <TextInput type="text" placeholder="Your answer" />
                    )}
                    
                    {question.type === 'textarea' && (
                      <TextArea placeholder="Your answer" />
                    )}
                    
                    {question.type === 'rating' && (
                      <RatingContainer>
                        {[1, 2, 3, 4, 5].map(num => (
                          <RatingOption key={num}>
                            {num}
                          </RatingOption>
                        ))}
                      </RatingContainer>
                    )}
                    
                    {question.type === 'scale' && (
                      <div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                          <span style={{ fontSize: 13 }}>Poor</span>
                          <span style={{ fontSize: 13 }}>Excellent</span>
                        </div>
                        <RatingContainer>
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(num => (
                            <RatingOption key={num} style={{ width: '10%' }}>
                              {num}
                            </RatingOption>
                          ))}
                        </RatingContainer>
                      </div>
                    )}
                  </QuestionContainer>
                ))}
              </SectionContainer>
            </SurveyContent>
          </PreviewFrame>
        </DeviceFrame>
      </PreviewContainer>
    </Container>
  );
};

export default SurveyPreview;
