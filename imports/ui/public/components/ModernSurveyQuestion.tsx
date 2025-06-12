import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiArrowRight, FiArrowLeft, FiCheck } from 'react-icons/fi';

interface Question {
  _id: string;
  id?: string;
  text: string;
  type: string;
  sectionId?: string;
  sectionName?: string;
  options?: string[];
  scale?: number;
  labels?: string[];
  required?: boolean;
  order?: number;
}

interface ModernSurveyQuestionProps {
  question: Question;
  progress: string;
  onAnswer: (answer: any) => void;
  onBack: () => void;
  value?: any;
  color?: string;
  isLastQuestion?: boolean;
  onSubmit?: () => void;
}

const QuestionContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  animation: fadeIn 0.5s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const QuestionCard = styled.div<{ color?: string }>`
  background: white;
  border-radius: 16px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.06);
  padding: 40px 48px;
  width: 100%;
  display: flex;
  flex-direction: column;
  position: relative;
  
  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    height: 4px;
    background: ${props => props.color || '#552a47'};
  }
  
  @media (max-width: 768px) {
    padding: 32px 24px;
  }
`;

const ProgressText = styled.div`
  font-size: 14px;
  color: #777;
  margin-bottom: 16px;
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const SectionName = styled.span`
  font-weight: 500;
`;

const QuestionText = styled.h3`
  font-size: 24px;
  font-weight: 600;
  color: #333;
  margin: 0 0 30px 0;
  line-height: 1.4;
  
  @media (max-width: 768px) {
    font-size: 20px;
    margin-bottom: 24px;
  }
`;

const RequiredIndicator = styled.span`
  color: #e74c3c;
  margin-left: 5px;
`;

const AnswerContainer = styled.div`
  margin-bottom: 40px;
  width: 100%;
  
  @media (max-width: 768px) {
    margin-bottom: 30px;
  }
`;

const TextInput = styled.input`
  width: 100%;
  padding: 16px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  outline: none;
  transition: border-color 0.3s;
  
  &:focus {
    border-color: ${props => props.color || '#552a47'};
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 16px;
  font-size: 16px;
  border: 2px solid #ddd;
  border-radius: 8px;
  min-height: 150px;
  resize: vertical;
  outline: none;
  transition: border-color 0.3s;
  
  &:focus {
    border-color: ${props => props.color || '#552a47'};
  }
`;

const OptionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
`;

const OptionItem = styled.div<{ selected?: boolean; color?: string }>`
  padding: 16px;
  border: 2px solid ${props => props.selected ? (props.color || '#552a47') : '#ddd'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  background: ${props => props.selected ? `${props.color || '#552a47'}10` : 'white'};
  
  &:hover {
    border-color: ${props => props.color || '#552a47'};
    background: ${props => props.selected ? `${props.color || '#552a47'}10` : `${props.color || '#552a47'}05`};
  }
`;

const OptionCheckmark = styled.div<{ selected?: boolean; color?: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? (props.color || '#552a47') : '#ddd'};
  margin-right: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  background: ${props => props.selected ? (props.color || '#552a47') : 'transparent'};
`;

const OptionText = styled.div`
  font-size: 16px;
  color: #333;
`;

const ScaleContainer = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
`;

const ScaleOptions = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
`;

const ScaleOption = styled.div<{ selected?: boolean; color?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid ${props => props.selected ? (props.color || '#552a47') : '#ddd'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.selected ? (props.color || '#552a47') : 'white'};
  color: ${props => props.selected ? 'white' : '#333'};
  font-weight: ${props => props.selected ? '600' : 'normal'};
  
  &:hover {
    border-color: ${props => props.color || '#552a47'};
    background: ${props => props.selected ? (props.color || '#552a47') : `${props.color || '#552a47'}10`};
  }
`;

const ScaleLabels = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 8px;
`;

const ScaleLabel = styled.div`
  font-size: 14px;
  color: #666;
  text-align: center;
  max-width: 80px;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
`;

const Button = styled.button<{ primary?: boolean; btnColor?: string }>`
  background: ${props => props.primary ? (props.btnColor || '#552a47') : 'transparent'};
  color: ${props => props.primary ? 'white' : '#333'};
  border: ${props => props.primary ? 'none' : '2px solid #ddd'};
  border-radius: 50px;
  padding: ${props => props.primary ? '14px 28px' : '12px 24px'};
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  transition: all 0.3s ease;
  
  &:hover {
    background: ${props => props.primary ? (props.btnColor ? `${props.btnColor}dd` : '#6d3a5e') : '#f5f5f5'};
    transform: ${props => props.primary ? 'translateY(-2px)' : 'none'};
    box-shadow: ${props => props.primary ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none'};
  }
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const ErrorMessage = styled.div`
  color: #e74c3c;
  font-size: 14px;
  margin-top: 8px;
`;

const ModernSurveyQuestion: React.FC<ModernSurveyQuestionProps> = ({
  question,
  progress,
  onAnswer,
  onBack,
  value,
  color,
  isLastQuestion = false,
  onSubmit
}) => {
  const [answer, setAnswer] = useState<any>(value || '');
  const [error, setError] = useState<string | null>(null);
  
  // Update local state when value prop changes
  useEffect(() => {
    setAnswer(value || '');
  }, [value]);
  
  // Handle continue/submit button click
  const handleContinue = () => {
    // Validate required questions
    if (question.required && !isAnswerValid()) {
      setError('This question requires an answer');
      return;
    }
    
    // Clear any errors
    setError(null);
    
    // Debug information
    console.log('ModernSurveyQuestion - handleContinue:', {
      isLastQuestion,
      hasSubmitHandler: !!onSubmit,
      questionId: question._id || question.id,
      questionType: question.type,
      questionText: question.text?.substring(0, 30) + '...',
    });
    
    // If this is the last question and we have a submit handler
    if (isLastQuestion && onSubmit) {
      console.log('Submitting survey - this is the last question');
      // Save the current answer first
      onAnswer(answer);
      // Then submit the whole survey
      onSubmit();
    } else {
      // Just save the answer and move to next question
      onAnswer(answer);
    }
  };
  
  // Check if the current answer is valid
  const isAnswerValid = (): boolean => {
    if (answer === null || answer === undefined) return false;
    
    switch (question.type) {
      case 'text':
      case 'textarea':
        return answer.trim() !== '';
      case 'multiple-choice':
      case 'single-choice':
        return answer !== '';
      case 'scale':
        return answer !== null && answer !== undefined;
      default:
        return true;
    }
  };
  
  // Render the appropriate input based on question type
  const renderQuestionInput = () => {
    switch (question.type) {
      case 'text':
        return (
          <TextInput
            type="text"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            color={color}
          />
        );
        
      case 'textarea':
        return (
          <TextArea
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Type your answer here..."
            color={color}
          />
        );
        
      case 'single-choice':
        return (
          <OptionsList>
            {question.options?.map((option, index) => (
              <OptionItem
                key={index}
                selected={answer === option}
                onClick={() => setAnswer(option)}
                color={color}
              >
                <OptionCheckmark selected={answer === option} color={color}>
                  {answer === option && <FiCheck size={16} />}
                </OptionCheckmark>
                <OptionText>{option}</OptionText>
              </OptionItem>
            ))}
          </OptionsList>
        );
        
      case 'multiple-choice':
        // Initialize answer as array if not already
        const selectedOptions = Array.isArray(answer) ? answer : [];
        
        const toggleOption = (option: string) => {
          if (selectedOptions.includes(option)) {
            setAnswer(selectedOptions.filter(item => item !== option));
          } else {
            setAnswer([...selectedOptions, option]);
          }
        };
        
        return (
          <OptionsList>
            {question.options?.map((option, index) => (
              <OptionItem
                key={index}
                selected={selectedOptions.includes(option)}
                onClick={() => toggleOption(option)}
                color={color}
              >
                <OptionCheckmark selected={selectedOptions.includes(option)} color={color}>
                  {selectedOptions.includes(option) && <FiCheck size={16} />}
                </OptionCheckmark>
                <OptionText>{option}</OptionText>
              </OptionItem>
            ))}
          </OptionsList>
        );
        
      case 'scale':
        const scale = question.scale || 5;
        const labels = question.labels || ['Not at all', 'Extremely'];
        
        // Create array of scale options (1 to scale)
        const scaleOptions = Array.from({ length: scale }, (_, i) => i + 1);
        
        return (
          <ScaleContainer>
            <ScaleOptions>
              {scaleOptions.map(option => (
                <ScaleOption
                  key={option}
                  selected={answer === option}
                  onClick={() => setAnswer(option)}
                  color={color}
                >
                  {option}
                </ScaleOption>
              ))}
            </ScaleOptions>
            
            <ScaleLabels>
              {labels.length >= 2 && (
                <>
                  <ScaleLabel>{labels[0]}</ScaleLabel>
                  {labels.length > 2 && <div style={{ flex: 1 }} />}
                  <ScaleLabel>{labels[labels.length - 1]}</ScaleLabel>
                </>
              )}
            </ScaleLabels>
          </ScaleContainer>
        );
        
      default:
        return <div>Unsupported question type</div>;
    }
  };

  return (
    <QuestionContainer>
      <QuestionCard color={color}>
        <ProgressText>
          <SectionName>{question.sectionName}</SectionName>
          <span>Question {progress}</span>
        </ProgressText>
        
        <QuestionText>
          {question.text}
          {question.required && <RequiredIndicator>*</RequiredIndicator>}
        </QuestionText>
        
        <AnswerContainer>
          {renderQuestionInput()}
          {error && <ErrorMessage>{error}</ErrorMessage>}
        </AnswerContainer>
        
        <ButtonContainer>
          <Button onClick={onBack}>
            <FiArrowLeft /> Back
          </Button>
          
          <Button 
            primary 
            btnColor={color}
            onClick={handleContinue}
            disabled={question.required && !isAnswerValid()}
          >
            {isLastQuestion ? 'Submit' : 'Continue'} {isLastQuestion ? <FiCheck /> : <FiArrowRight />}
          </Button>
        </ButtonContainer>
      </QuestionCard>
    </QuestionContainer>
  );
};

export default ModernSurveyQuestion;
