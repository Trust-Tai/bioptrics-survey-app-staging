import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

// Define types for the component props and question data
interface Question {
  _id: string;
  text: string;
  type: string;
  sectionName?: string;
  options?: string[];
  scale?: number;
  labels?: string[];
  required?: boolean;
}

interface SurveyQuestionProps {
  question: Question;
  progress: string;
  onNext: (answer: any) => void;
  onBack?: () => void;
  onSkip?: () => void;
}

// Add debugging function
const logDebug = (message: string, data?: any) => {
  console.log(`[SurveyQuestion] ${message}`, data || '');
};

// Styled components for the question screen
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f9f6f2;
  background-image: linear-gradient(to bottom right, #f9f6f2, #f4ebf1);
`;

const Card = styled.div`
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 2px 24px rgba(229, 214, 224, 0.2);
  padding: 36px 24px 28px 24px;
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;

  @media (min-width: 600px) {
    padding: 48px 44px 36px 44px;
    max-width: 440px;
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #f0f0f0;
  border-radius: 3px;
  margin-bottom: 12px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: string }>`
  height: 100%;
  background-color: #b69d57;
  width: ${props => props.width};
  transition: width 0.3s ease;
`;

const ProgressText = styled.div`
  font-size: 14px;
  color: #888;
  margin-bottom: 24px;
  align-self: flex-start;
`;

const QuestionText = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin-bottom: 24px;
  text-align: center;
  line-height: 1.4;
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-top: 32px;
`;

const Button = styled.button`
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  border: none;
  font-size: 16px;
`;

const NextButton = styled(Button)`
  background-color: #b69d57;
  color: white;
  flex-grow: 1;
  max-width: 120px;
  
  &:disabled {
    background-color: #d9d9d9;
    cursor: not-allowed;
  }
  
  &:hover:not(:disabled) {
    background-color: #a38d47;
  }
`;

const BackButton = styled(Button)`
  background-color: transparent;
  color: #666;
  margin-right: 12px;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const SkipButton = styled(Button)`
  background-color: transparent;
  color: #666;
  margin-left: 12px;
  
  &:hover {
    background-color: #f5f5f5;
  }
`;

const LikertRow = styled.div`
  display: flex;
  flex-direction: row;
  justify-content: space-between;
  width: 100%;
  gap: 8px;
  margin-bottom: 20px;
`;

const ResponseOption = styled.div<{ selected?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  background-color: ${props => props.selected ? '#f4ebf1' : 'white'};
  border: 1px solid ${props => props.selected ? '#b69d57' : '#e0e0e0'};
  box-shadow: ${props => props.selected ? '0 2px 8px rgba(182, 157, 87, 0.15)' : '0 1px 3px rgba(0,0,0,0.05)'};
  
  &:hover {
    border-color: #b69d57;
    box-shadow: 0 2px 8px rgba(182, 157, 87, 0.15);
  }
`;

const EmojiContainer = styled.div`
  font-size: 24px;
  margin-bottom: 8px;
`;

const ResponseText = styled.div`
  text-align: center;
`;

const ResponseTitle = styled.div`
  font-weight: 600;
  font-size: 12px;
  color: #333;
`;

const TextInput = styled.textarea`
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  font-size: 16px;
  min-height: 120px;
  margin-bottom: 20px;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #b69d57;
    box-shadow: 0 0 0 2px rgba(182, 157, 87, 0.2);
  }
`;

const ChoiceList = styled.div`
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 10px;
  margin-bottom: 20px;
`;

const ChoiceButton = styled.button<{ selected?: boolean }>`
  display: flex;
  align-items: center;
  padding: 14px 16px;
  border-radius: 8px;
  background-color: ${props => props.selected ? '#f4ebf1' : 'white'};
  border: 1px solid ${props => props.selected ? '#b69d57' : '#e0e0e0'};
  text-align: left;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  width: 100%;
  
  &:hover {
    border-color: #b69d57;
    background-color: ${props => props.selected ? '#f4ebf1' : '#f9f6f2'};
  }
`;

// Main component implementation
const SurveyQuestion: React.FC<SurveyQuestionProps> = ({ question, progress, onNext, onBack, onSkip }) => {
  logDebug('Rendering SurveyQuestion component', { question, progress });
  
  // Parse progress string to get current and total questions
  const progressParts = progress.split(' of ');
  const currentIndex = parseInt(progressParts[0], 10);
  const totalQuestions = parseInt(progressParts[1], 10);
  
  // State for selected option and text answer
  const [selectedOption, setSelectedOption] = useState<string>('');
  const [textAnswer, setTextAnswer] = useState<string>('');
  const [isNextEnabled, setIsNextEnabled] = useState<boolean>(false);
  
  // Reset state when question changes
  useEffect(() => {
    logDebug('Question changed, resetting state', { questionId: question._id });
    setSelectedOption('');
    setTextAnswer('');
    setIsNextEnabled(!question.required);
  }, [question._id, question.required]);
  
  // Handle option selection
  const handleOptionSelect = (optionId: string) => {
    logDebug('Option selected', { optionId });
    setSelectedOption(optionId);
    setIsNextEnabled(true);
  };
  
  // Handle text input change
  const handleTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    setTextAnswer(value);
    setIsNextEnabled(value.trim().length > 0 || !question.required);
  };
  
  // Handle next button click
  const handleNext = () => {
    logDebug('Next button clicked', { questionType: question.type });
    
    if (question.type === 'text' || question.type === 'open_text' || question.type === 'free_text') {
      logDebug('Submitting text answer', { answer: textAnswer });
      onNext(textAnswer);
    } else if (question.type === 'multiple_select') {
      const selectedOptions = selectedOption ? selectedOption.split(',') : [];
      logDebug('Submitting multiple select answer', { answer: selectedOptions });
      onNext(selectedOptions);
    } else {
      logDebug('Submitting single choice answer', { answer: selectedOption });
      onNext(selectedOption);
    }
  };
  
  // Handle back button click
  const handleBack = () => {
    logDebug('Back button clicked');
    if (onBack) onBack();
  };
  
  // Handle skip button click
  const handleSkip = () => {
    logDebug('Skip button clicked');
    if (onSkip) onSkip();
  };
  
  // Calculate progress percentage
  const progressPercentage = `${Math.round((currentIndex / totalQuestions) * 100)}%`;
  
  // Simplified rendering of question content based on type
  const renderQuestionContent = () => {
    logDebug('Rendering question content', { type: question.type });
    
    switch (question.type) {
      case 'likert':
      case 'likert_scale':
        return renderLikertScale();
        
      case 'text':
      case 'open_text':
      case 'free_text':
        return renderTextInput();
        
      case 'choice':
      case 'multiple_choice':
      case 'single_choice':
        return renderChoiceOptions();
      
      case 'multiple_select':
        return renderMultipleSelectOptions();
        
      default:
        logDebug('Unknown question type, falling back to text input', { type: question.type });
        return renderTextInput();
    }
  };
  
  // Render likert scale with emojis
  const renderLikertScale = () => {
    const scale = question.scale || 5;
    const labels = question.labels || [];
    const emojis = ['😡', '😔', '😐', '🙂', '😄'];
    
    return (
      <LikertRow>
        {Array.from({ length: scale }, (_, i) => (
          <ResponseOption 
            key={i}
            selected={selectedOption === i.toString()}
            onClick={() => handleOptionSelect(i.toString())}
            className={`survey-option ${selectedOption === i.toString() ? 'selected' : ''}`}
          >
            <EmojiContainer>{emojis[i] || '⭐'}</EmojiContainer>
            <ResponseText>
              <ResponseTitle>{labels[i] || `Option ${i + 1}`}</ResponseTitle>
            </ResponseText>
          </ResponseOption>
        ))}
      </LikertRow>
    );
  };
  
  // Render text input
  const renderTextInput = () => {
    return (
      <TextInput
        placeholder="Type your answer here..."
        value={textAnswer}
        onChange={handleTextChange}
        className="survey-text-input"
      />
    );
  };
  
  // Render choice options
  const renderChoiceOptions = () => {
    if (!question.options || question.options.length === 0) {
      return <div>No options available</div>;
    }
    
    return (
      <ChoiceList className="survey-options-list">
        {question.options.map((option, index) => (
          <ChoiceButton
            key={index}
            selected={selectedOption === index.toString()}
            onClick={() => handleOptionSelect(index.toString())}
            className={`survey-option ${selectedOption === index.toString() ? 'selected' : ''}`}
          >
            {option}
          </ChoiceButton>
        ))}
      </ChoiceList>
    );
  };
  
  // Render multiple select options
  const renderMultipleSelectOptions = () => {
    if (!question.options || question.options.length === 0) {
      return <div>No options available</div>;
    }
    
    const selectedOptions = selectedOption ? selectedOption.split(',') : [];
    
    return (
      <ChoiceList className="survey-options-list">
        {question.options.map((option, index) => {
          const optionId = index.toString();
          return (
            <ChoiceButton
              key={index}
              selected={selectedOptions.includes(optionId)}
              className={`survey-option ${selectedOptions.includes(optionId) ? 'selected' : ''}`}
              onClick={() => {
                let newSelected;
                if (selectedOptions.includes(optionId)) {
                  newSelected = selectedOptions.filter(id => id !== optionId);
                } else {
                  newSelected = [...selectedOptions, optionId];
                }
                setSelectedOption(newSelected.join(','));
                setIsNextEnabled(newSelected.length > 0 || !question.required);
              }}
            >
              {option}
            </ChoiceButton>
          );
        })}
      </ChoiceList>
    );
  };
  
  return (
    <Wrapper className="survey-wrapper">
      <Card className="survey-card">
        <ProgressBar className="survey-progress">
          <ProgressFill width={progressPercentage} className="survey-progress-bar" />
        </ProgressBar>
        <ProgressText>{progress}</ProgressText>
        
        <QuestionText className="survey-question">{question.text}</QuestionText>
        
        {renderQuestionContent()}
        
        <ButtonGroup>
          {onBack && (
            <BackButton onClick={handleBack} className="survey-button survey-button-secondary">
              Back
            </BackButton>
          )}
          
          <NextButton 
            onClick={handleNext}
            disabled={!isNextEnabled}
            className="survey-button"
          >
            Next
          </NextButton>
          
          {onSkip && (
            <SkipButton onClick={handleSkip} className="survey-button survey-button-text">
              Skip
            </SkipButton>
          )}
        </ButtonGroup>
      </Card>
    </Wrapper>
  );
};

export default SurveyQuestion;
