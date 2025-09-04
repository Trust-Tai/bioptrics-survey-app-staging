import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { FiArrowRight, FiArrowLeft, FiCheck, FiInfo, FiEdit, FiList, FiBarChart2, FiCalendar, FiUpload, FiAlignLeft, FiChevronDown } from 'react-icons/fi';
import './ModernSurveyQuestion.css';
import '../components/ModernSurvey.css';

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  width: 100%;
  margin-top: 10px;
`;

const OptionButton = styled.button<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: ${props => props.isSelected ? 'rgba(44, 62, 80, 0.1)' : 'white'};
  border: 1px solid ${props => props.isSelected ? '#2c3e50' : '#d1d5db'};
  border-radius: 8px;
  cursor: pointer;
  width: 100%;
  text-align: left;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: #2c3e50;
    background-color: ${props => props.isSelected ? 'rgba(44, 62, 80, 0.1)' : 'rgba(44, 62, 80, 0.05)'};
  }
`;

const QuestionText = styled.h2`
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
  color: var(--text-color, #333);
  line-height: 1.4;
`;


const QuestionContainer = styled.div`
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: var(--background-color, #f9f9ff);
  font-family: var(--body-font, 'Inter, sans-serif');
`;

const TwoColumnLayout = styled.div`
  display: flex;
  flex: 1;
  gap: 2rem;
  padding: 2rem;
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 1rem;
    padding: 1rem;
  }
`;

const QuestionContentColumn = styled.div`
  flex: 0 0 70%;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    flex: 1;
  }
`;

const QuestionImageColumn = styled.div`
  flex: 0 0 30%;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  
  @media (max-width: 768px) {
    flex: none;
    order: -1;
  }
`;

const QuestionImageContainer = styled.div`
  width: 100%;
  max-width: 400px;
  
  img {
    width: 100%;
    height: auto;
    border-radius: 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }
`;

const ProgressIndicator = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 2rem;
  padding: 0 2rem;
  
  @media (max-width: 768px) {
    padding: 0 1rem;
    gap: 2px;
  }
`;

const ProgressSegment = styled.div<{ isActive: boolean; isCompleted: boolean; color?: string }>`
  flex: 1;
  height: 4px;
  border-radius: 2px;
  background-color: ${props => {
    if (props.isActive) return props.color || '#2c3e50';
    if (props.isCompleted) return props.color || '#2c3e50';
    return '#e0e0e0';
  }};
  opacity: ${props => {
    if (props.isActive) return 1;
    if (props.isCompleted) return 0.7;
    return 0.3;
  }};
  transition: all 0.3s ease;
  
  @media (max-width: 768px) {
    height: 3px;
  }
`;

const DropdownIcon = styled.div`
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  pointer-events: none;
  color: #666;
`;

interface Question {
  _id: string;
  id?: string;
  text: string;
  description?: string;
  responseType?: string;
  type?: string; 
  sectionId?: string;
  sectionName?: string;
  options?: string[] | { label: string; value: string }[];
  scale?: number;
  labels?: string[];
  required?: boolean;
  order?: number;
  currentVersion?: number;
  image?: string; 
  versions?: {
    responseType?: string;
    options?: string[] | { label: string; value: string }[];
    questionText?: string;
    image?: string; 
    [key: string]: any;
  }[];
}

interface Survey {
  _id: string;
  title: string;
  description?: string;
  logo?: string;
  color?: string;
  surveySections?: Array<{
    id: string;
    name: string;
    description?: string;
    isActive: boolean;
    icon?: string;
    color?: string;
    instructions?: string;
    isRequired?: boolean;
    visibilityCondition?: {
      dependsOnSectionId?: string;
      dependsOnQuestionId?: string;
      condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
      value: any;
    };
    timeLimit?: number;
    questionIds?: string[];
    templateId?: string;
    customCss?: string;
    progressIndicator?: boolean;
  }>;
  sectionQuestions?: Array<{
    id: string;
    _id?: string;
    text: string;
    type: string;
    sectionId?: string;
    order?: number;
  }>;
  selectedQuestions?: Record<string, any[]>;
}

interface ModernSurveyQuestionProps {
  question: Question;
  survey?: Survey;
  progress?: string;
  onAnswer: (answer: any, saveOnly?: boolean) => void;
  onBack: () => void;
  value?: any;
  color?: string;
  isLastQuestion?: boolean;
  onSubmit?: () => void;
  backgroundImage?: string;
  sectionName?: string;
  sectionDescription?: string;
  hideNavigation?: boolean;
  sectionDocument?: string;
  documentName?: string;
  documentType?: string;
}

const ModernSurveyQuestion: React.FC<ModernSurveyQuestionProps> = ({
  question,
  survey,
  progress,
  onAnswer,
  onBack,
  value,
  color = '#2c3e50',
  isLastQuestion = false,
  onSubmit,
  hideNavigation = false,
  sectionDocument,
  documentName,
  documentType
}) => {
  const [answer, setAnswer] = useState<any>(value || '');
  const [error, setError] = useState<string | null>(null);
  
  const createMarkup = (htmlContent: string) => {
    return { __html: htmlContent };
  };
  
  useEffect(() => {
    console.log('Question:', question);
    console.log('Question responseType:', question.responseType);
    
    console.log('DETAILED QUESTION INSPECTION:');
    console.log('- _id:', question._id);
    console.log('- text:', question.text);
    console.log('- responseType:', question.responseType);
    console.log('- type:', question.type);
    console.log('- options:', question.options);
    
    if (Array.isArray(question.versions) && question.versions.length > 0) {
      console.log('VERSIONS ARRAY FOUND:');
      question.versions.forEach((version, index) => {
        console.log(`VERSION ${index}:`, version);
        console.log(`- responseType:`, version.responseType);
        console.log(`- questionText:`, version.questionText);
        console.log(`- options:`, version.options);
      });
      
      const versionIndex = question.currentVersion !== undefined ? 
        Math.min(question.currentVersion, question.versions.length - 1) : 0;
      const versionData = question.versions[versionIndex];
      
      if (versionData && versionData.responseType === 'dropdown') {
        console.log('CRITICAL: DROPDOWN FOUND IN VERSIONS ARRAY - This should render as dropdown');
        (question as any)._forceDropdown = true;
      }
    }
    
    if (question.responseType === 'dropdown' || 
        (question.responseType && question.responseType.toLowerCase().includes('dropdown'))) {
      console.log('DROPDOWN QUESTION DETECTED - This should render as a dropdown select');
    }
    
    const actualType = getActualQuestionType();
    console.log('Actual question type:', actualType);
    console.log('Will render:', actualType === 'dropdown' ? 'dropdown select' : 'other component');
    
    if (actualType === 'multiple_choice') {
      if (value === '' || value === null || value === undefined) {
        setAnswer([]);
      } else if (!Array.isArray(value)) {
        try {
          const parsed = typeof value === 'string' ? JSON.parse(value) : [value];
          setAnswer(Array.isArray(parsed) ? parsed : [value]);
        } catch (e) {
          setAnswer([value]);
        }
      } else {
        setAnswer(value);
      }
    } else {
      setAnswer(value || '');
    }
  }, [value, question._id]);
  
  let currentQuestion = 1;
  let totalQuestions = 1;
  let remainingQuestions = 0;
  
  if (progress) {
    if (progress.includes('Question')) {
      const match = progress.match(/Question (\d+) of (\d+)/);
      if (match && match.length === 3) {
        currentQuestion = parseInt(match[1], 10);
        totalQuestions = parseInt(match[2], 10);
      }
    } 
    else if (progress.includes(' of ')) {
      const progressParts = progress.split(' of ');
      if (progressParts.length === 2) {
        const firstPartMatch = progressParts[0].match(/(\d+)$/);
        currentQuestion = firstPartMatch ? parseInt(firstPartMatch[1], 10) : 1;
        totalQuestions = parseInt(progressParts[1], 10) || 1;
      }
    }
  }
  
  remainingQuestions = totalQuestions - currentQuestion;
  
  const progressPercentage = Math.round((currentQuestion / totalQuestions) * 100);
  
  const isAnswerValid = (): boolean => {
    if (answer === null || answer === undefined) return false;
    
    const responseType = question.responseType || '';
    
    switch (responseType) {
      case 'text':
      case 'textarea':
      case 'long_text':
      case 'short_text':
        return answer.trim() !== '';
      case 'dropdown':
        return answer !== '';
      case 'date':
        return answer !== '';
      case 'file':
        return answer !== '';
      case 'rating':
        return answer !== '';
      default:
        return true;
    }
  };
  
  const handleContinue = () => {
    if (question.required && !answer) {
      setError('This question requires an answer');
      return;
    }
    
    setError('');
    
    if (isTyping && debounceTimeout.current) {
      clearTimeout(debounceTimeout.current);
      debounceTimeout.current = null;
      setIsTyping(false);
    }
    
    console.log('CRITICAL - Question button click info:', {
      isLastQuestion,
      hasSubmitHandler: !!onSubmit,
      questionText: question.text?.substring(0, 30),
      buttonText: isLastQuestion ? 'Submit' : 'Continue',
      currentAnswer: answer
    });
    
    onAnswer(answer, false);
    
    setTimeout(() => {
      if (isLastQuestion && onSubmit) {
        console.log('This is the last question - submitting survey');
        onSubmit();
      }
    }, 100); 
  };
  
  const renderNumericScale = () => {
    const scaleOptions = Array.from({ length: 5 }, (_, i) => i + 1);
    const minLabel = question.labels && question.labels.length > 0 ? question.labels[0] : 'NOT AT ALL LIKELY';
    const maxLabel = question.labels && question.labels.length > 1 ? question.labels[1] : 'EXTREMELY LIKELY';
    
    return (
      <div className="scale-container">
        <ScaleLabels>
          <ScaleLabelText>{minLabel}</ScaleLabelText>
          <ScaleLabelText>{maxLabel}</ScaleLabelText>
        </ScaleLabels>
        <ScaleButtonsContainer>
          {scaleOptions.map((value) => (
            <div
              key={value}
              className={`scale-option ${answer === value.toString() ? 'selected' : ''}`}
              onClick={() => {
                setAnswer(value.toString());
                onAnswer(value.toString(), true);
              }}
              style={answer === value.toString() ? {backgroundColor: color} : {}}
            >
              {value}
              {answer === value.toString() && (
                <div className="scale-selected-indicator" style={{backgroundColor: 'var(--secondary-color)'}}>
                  <FiCheck size={12} color="white" />
                </div>
              )}
            </div>
          ))}
        </ScaleButtonsContainer>
        {answer && (
          <div className="selected-answer-display">
            <span>Your answer: <strong>{answer}</strong></span>
          </div>
        )}
      </div>
    );
  };
  
  const renderRadioOptions = () => {
    if (!question.options || question.options.length === 0) return null;
    
    const isObjectOptions = question.options.length > 0 && 
      typeof question.options[0] === 'object' && 
      question.options[0] !== null;
    
    return (
      <OptionsContainer>
        {question.options.map((option, index) => {
          const value = isObjectOptions ? (option as any).value || (option as any).label : option as string;
          const label = isObjectOptions ? (option as any).label : option as string;
          
          return (
            <OptionButton key={index} isSelected={answer === value}>
              <div className="option-checkmark" style={answer === value ? {borderColor: color, backgroundColor: color} : {}}>
                {answer === value && <FiCheck size={14} color="white" />}
              </div>
              <div className="option-text" dangerouslySetInnerHTML={createMarkup(label)}></div>
            </OptionButton>
          );
        })}
      </OptionsContainer>
    );
  };
  
  const renderCheckboxOptions = () => {
    if (!question.options || question.options.length === 0) return null;
    
    const isObjectOptions = question.options.length > 0 && 
      typeof question.options[0] === 'object' && 
      question.options[0] !== null;
    
    const handleCheckboxChange = (value: string) => {
      let newAnswer = [...(Array.isArray(answer) ? answer : [])];
      
      if (newAnswer.includes(value)) {
        newAnswer = newAnswer.filter(item => item !== value);
      } else {
        newAnswer.push(value);
      }
      
      setAnswer(newAnswer);
      onAnswer(newAnswer, true);
    };
    
    return (
      <OptionsContainer>
        {question.options.map((option, index) => {
          const value = isObjectOptions ? (option as any).value || (option as any).label : option as string;
          const label = isObjectOptions ? (option as any).label : option as string;
          const isSelected = Array.isArray(answer) && answer.includes(value);
          
          return (
            <OptionButton 
              key={index} 
              isSelected={isSelected}
              onClick={() => handleCheckboxChange(value)}
            >
              <div 
                className={`option-checkmark checkbox ${isSelected ? 'selected' : ''}`} 
                style={isSelected ? {borderColor: color, backgroundColor: color} : {}}
              >
                {isSelected && <FiCheck size={14} color="white" />}
              </div>
              <div className="option-text" dangerouslySetInnerHTML={createMarkup(label)}></div>
            </OptionButton>
          );
        })}
      </OptionsContainer>
    );
  };
  
  const renderDateInput = () => {
    return (
      <div className="date-input-container">
        <input
          type="date"
          className="question-input"
          value={answer || ''}
          onChange={(e) => {
            setAnswer(e.target.value);
            onAnswer(e.target.value, true);
          }}
          style={{borderColor: answer ? color : '#d1d5db'}}
        />
      </div>
    );
  };

  const renderDropdown = () => {
    if (!question.options || question.options.length === 0) {
      console.log('No options available for dropdown, falling back to text input');
      return renderTextInput();
    }
    
    const isObjectOptions = question.options.length > 0 && 
      typeof question.options[0] === 'object' && 
      question.options[0] !== null;
    
    return (
      <div className="dropdown-container">
        <div className="select-wrapper">
          <DropdownSelect
            value={answer || ''}
            onChange={(e) => {
              setAnswer(e.target.value);
              onAnswer(e.target.value, true);
            }}
            style={{borderColor: answer ? color : '#d1d5db'}}
          >
            {question.options.map((option, index) => {
              const value = isObjectOptions ? (option as any).value || (option as any).label : option;
              const label = isObjectOptions ? (option as any).label : option;
              if (label === 'Select an option...') {
                return (
                  <option key={index} value="">
                    {label}
                  </option>
                );
              }
              return (
                <option key={index} value={value}>
                  {label}
                </option>
              );
            })}
          </DropdownSelect>
          <DropdownIcon>
            <FiChevronDown size={16} />
          </DropdownIcon>
        </div>
        {answer && (
          <div className="selected-answer-display">
            <span>Your answer: <strong>{answer}</strong></span>
          </div>
        )}
      </div>
    );
  };
  
  const renderFileUpload = () => {
    return (
      <div className="file-upload-container">
        <label className="file-upload-label">
          <input
            type="file"
            className="file-input"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                setAnswer(file.name);
                onAnswer(file.name, true);
              }
            }}
          />
          <div className="file-upload-button" style={{borderColor: color}}>
            <span>Choose File</span>
          </div>
          <span className="file-name">{answer || 'No file chosen'}</span>
        </label>
      </div>
    );
  };

  const renderRatingScale = () => {
    const ratingOptions = Array.from({ length: 5 }, (_, i) => i + 1);
    
    return (
      <div className="rating-container">
        <div className="rating-options">
          {ratingOptions.map((value) => (
            <div
              key={value}
              className={`rating-option ${answer === value.toString() ? 'selected' : ''}`}
              onClick={() => {
                setAnswer(value.toString());
                onAnswer(value.toString(), true);
              }}
              style={answer === value.toString() ? {backgroundColor: color} : {}}
            >
              {value}
            </div>
          ))}
        </div>
      </div>
    );
  };
  
  const [isTyping, setIsTyping] = useState(false);
  const debounceTimeout = useRef<NodeJS.Timeout | null>(null);

  const renderTextInput = () => {
    return (
      <input
        type="text"
        className="question-input"
        value={answer || ''}
        onChange={(e) => {
          setAnswer(e.target.value);
          
          setIsTyping(true);
          
          if (debounceTimeout.current) {
            clearTimeout(debounceTimeout.current);
          }
          
          debounceTimeout.current = setTimeout(() => {
            console.log('Text input changed (debounced), saving:', e.target.value);
            onAnswer(e.target.value, true);
            setIsTyping(false);
          }, 1000); 
        }}
        placeholder="Type your answer here..."
        style={{borderColor: answer ? color : '#d1d5db'}}
      />
    );
  };
  
  const getResponseType = () => {
    try {
      console.log('Full question object:', question);
      
      if (Array.isArray(question.versions) && question.versions.length > 0) {
        console.log('VERSIONS ARRAY FOUND, inspecting all versions:', question.versions);
        
        const versionIndex = question.currentVersion !== undefined ? 
          Math.min(question.currentVersion, question.versions.length - 1) : 0;
        
        const versionData = question.versions[versionIndex];
        console.log('Current version data:', versionData);
        
        if (versionData) {
          if (versionData.responseType) {
            console.log('FOUND responseType IN VERSION:', versionData.responseType);
            return versionData.responseType;
          }
          
          if (versionData.type) {
            console.log('FOUND type IN VERSION:', versionData.type);
            return versionData.type;
          }
        }
      }
      
      if (question && typeof question === 'object') {
        if (question.type) {
          console.log('Found question.type:', question.type);
          return question.type;
        }
        
        if (question.responseType) {
          console.log('Found question.responseType:', question.responseType);
          return question.responseType;
        }
      }
    } catch (error) {
      console.error('Error getting responseType:', error);
    }
    
    return 'text';
  };

  type QuestionType = 
    'rating' 
    | 'single_choice' 
    | 'multiple_choice' 
    | 'long_text' 
    | 'text' 
    | 'dropdown'
    | 'date'
    | 'file';
  
  const getActualQuestionType = (): QuestionType => {
    if ((question as any)._forceDropdown) {
      console.log('FORCE DROPDOWN FLAG DETECTED - Returning dropdown type');
      return 'dropdown';
    }
    
    if (Array.isArray(question.versions) && question.versions.length > 0) {
      console.log('VERSIONS ARRAY INSPECTION FOR DROPDOWN:');
      
      question.versions.forEach((version, idx) => {
        if (version.responseType) {
          console.log(`Version ${idx} responseType:`, version.responseType);
        }
      });
      
      const versionIndex = question.currentVersion !== undefined ? 
        Math.min(question.currentVersion, question.versions.length - 1) : 0;
      const versionData = question.versions[versionIndex];
      
      if (versionData) {
        console.log('DIRECT VERSION CHECK - Current version data:', versionData);
        
        if (versionData.responseType && 
            typeof versionData.responseType === 'string' && 
            versionData.responseType.toLowerCase() === 'dropdown') {
          console.log('DROPDOWN DETECTED in versions array, forcing dropdown rendering');
          return 'dropdown';
        }
        
        if (versionData.responseType && 
            typeof versionData.responseType === 'string' && 
            versionData.responseType.toLowerCase() === 'select') {
          console.log('SELECT TYPE DETECTED in versions array, treating as dropdown');
          return 'dropdown';
        }
      }
    }
    
    const responseType = getResponseType().toLowerCase();
    console.log('Standard type detection with responseType:', responseType);
    
    if (responseType.includes('dropdown') || responseType === 'select') {
      console.log('Standard dropdown detection - returning dropdown type');
      return 'dropdown';
    }
    
    if (responseType === 'date') {
      return 'date';
    }
    if (responseType === 'file') {
      return 'file';
    }
    if (responseType === 'rating' || responseType === 'likert' || responseType === 'likert_scale' || responseType === 'scale') {
      return 'rating';
    }
    if (responseType === 'radio' || responseType === 'choice') {
      return 'single_choice';
    }
    if (responseType === 'checkbox' || responseType.includes('multiple') || responseType === 'multiple-choice') {
      return 'multiple_choice';
    }
    if (responseType === 'textarea' || responseType === 'long_text') {
      return 'long_text';
    }
    
    if (question.options && question.options.length > 0) {
      console.log('Question has options but no specific type, defaulting to dropdown');
      return 'dropdown';
    }
    
    return 'text';
  };

  const renderQuestionInput = () => {
    if ((question as any)._forceDropdown) {
      console.log('FORCE DROPDOWN FLAG DETECTED - Rendering dropdown');
      return renderDropdown();
    }
    
    if (Array.isArray(question.versions) && question.versions.length > 0) {
      console.log('VERSIONS ARRAY INSPECTION FOR DROPDOWN:');
      
      question.versions.forEach((version, idx) => {
        if (version.responseType) {
          console.log(`Version ${idx} responseType:`, version.responseType);
        }
      });
      
      const versionIndex = question.currentVersion !== undefined ? 
        Math.min(question.currentVersion, question.versions.length - 1) : 0;
      const versionData = question.versions[versionIndex];
      
      if (versionData) {
        console.log('DIRECT VERSION CHECK - Current version data:', versionData);
        
        if (versionData.responseType && 
            typeof versionData.responseType === 'string' && 
            versionData.responseType.toLowerCase() === 'dropdown') {
          console.log('DROPDOWN DETECTED in versions array, forcing dropdown rendering');
          return renderDropdown();
        }
        
        if (versionData.responseType && 
            typeof versionData.responseType === 'string' && 
            versionData.responseType.toLowerCase() === 'select') {
          console.log('SELECT TYPE DETECTED in versions array, treating as dropdown');
          return renderDropdown();
        }
      }
    }
    
    const actualType = getActualQuestionType();
    
    console.log('Rendering input for type:', actualType);
    
    if (actualType === 'dropdown') {
      console.log('Rendering dropdown based on actualType');
      return renderDropdown();
    }
    
    if (getResponseType().toLowerCase().includes('dropdown') || getResponseType().toLowerCase() === 'select') {
      console.log('Forcing dropdown rendering based on responseType:', getResponseType());
      return renderDropdown();
    }
    
    switch (actualType as QuestionType) {
      case 'rating':
        return renderRatingScale();
      
      case 'single_choice':
        return renderRadioOptions();
        
      case 'text':
        return renderTextInput();
        
      case 'long_text':
        return renderTextInput();
      
      case 'dropdown' as QuestionType:
        console.log('Rendering dropdown from switch case');
        return renderDropdown();
      
      case 'date':
        return renderDateInput();
        
      case 'file':
        return renderFileUpload();
        
      case 'multiple_choice':
        return renderCheckboxOptions();
      
      default:
        if (question.options && question.options.length > 0) {
          console.log('Question has options, checking if it should be dropdown');
          return renderDropdown();
        }
        return renderTextInput();
    }
  };
  
  const shouldUseTextarea = () => {
    const responseType = getResponseType().toLowerCase();
    return responseType === 'textarea' || responseType === 'long_text';
  };

  const getQuestionTypeInfo = () => {
    const actualType = getActualQuestionType();
    const responseType = getResponseType().toLowerCase();
    
    console.log('Getting question type info for:', actualType, 'from responseType:', responseType);
    
    switch (actualType) {
      case 'dropdown':
        return { label: 'Dropdown', icon: <FiChevronDown size={16} /> };
      case 'multiple_choice':
        return { label: 'Multiple Choice', icon: <FiList size={16} /> };
      case 'single_choice':
        return { label: 'Single Choice', icon: <FiList size={16} /> };
      case 'rating':
        return { label: 'Rating', icon: <FiBarChart2 size={16} /> };
      case 'date':
        return { label: 'Date', icon: <FiCalendar size={16} /> };
      case 'file':
        return { label: 'File Upload', icon: <FiUpload size={16} /> };
      case 'long_text':
        return { label: 'Long Text', icon: <FiAlignLeft size={16} /> };
      case 'text':
        return { label: 'Text', icon: <FiEdit size={16} /> };
      default:
        return { label: actualType, icon: <FiInfo size={16} /> };
    }
  };
  
  const questionTypeInfo = getQuestionTypeInfo();

  const getSmartQuestionCount = () => {
    // After migration, use only sectionQuestions format
    const allQuestions = survey?.sectionQuestions || [];
    
    console.log('Question count debug:', {
      totalQuestionsFound: allQuestions.length,
      currentQuestionId: question._id || question.id,
      currentSectionId: question.sectionId
    });
    
    // If we have survey data with questions
    if (allQuestions.length > 0) {
      const currentSectionId = question.sectionId;
      
      if (currentSectionId) {
        // We're in a section - count only questions in this section and reset pagination
        const sectionQuestions = allQuestions.filter((q: any) => q.sectionId === currentSectionId);
        const currentQuestionIndex = sectionQuestions.findIndex((q: any) => q._id === question._id || q.id === question.id);
        
        console.log('Section context:', {
          sectionId: currentSectionId,
          sectionQuestions: sectionQuestions.length,
          currentIndex: currentQuestionIndex
        });
        
        return {
          current: Math.max(1, currentQuestionIndex + 1),
          total: sectionQuestions.length
        };
      } else {
        // We're outside sections - find all consecutive unsectioned questions from the start
        let unsectionedQuestions: any[] = [];
        let currentPos = 0;
        
        console.log('All questions in survey:', allQuestions.map((q, index) => ({
          index: index,
          id: q._id || q.id || `question_${index}`,
          sectionId: q.sectionId,
          text: q.text?.substring(0, 50) + '...'
        })));
        
        // Get all questions that appear before any section starts
        for (let i = 0; i < allQuestions.length; i++) {
          const q = allQuestions[i];
          
          console.log(`Question ${i + 1}:`, {
            id: q._id || q.id,
            sectionId: q.sectionId,
            hasSection: !!q.sectionId,
            text: q.text?.substring(0, 30) + '...'
          });
          
          if (!q.sectionId || q.sectionId === null) {
            // This is an unsectioned question
            unsectionedQuestions.push(q);
            console.log(`Added unsectioned question ${unsectionedQuestions.length}:`, q._id || q.id);
            
            // Match by ID if available, otherwise by text content
            const questionMatch = (q._id && question._id && q._id === question._id) ||
                                 (q.id && question.id && q.id === question.id) ||
                                 (q.text && question.text && q.text === question.text);
            
            if (questionMatch) {
              currentPos = unsectionedQuestions.length;
              console.log(`Found current question at position ${currentPos} by ${q._id || q.id ? 'ID' : 'text'} match`);
            }
          } else {
            // Hit a sectioned question - stop counting unsectioned questions
            console.log(`Hit sectioned question, stopping count at ${unsectionedQuestions.length} unsectioned questions`);
            break;
          }
        }
        
        console.log('Unsectioned context final:', {
          unsectionedCount: unsectionedQuestions.length,
          currentPos: currentPos,
          questionId: question._id || question.id,
          allUnsectionedIds: unsectionedQuestions.map(q => q._id || q.id)
        });
        
        return {
          current: Math.max(1, currentPos),
          total: unsectionedQuestions.length
        };
      }
    }
    
    // Fallback to original logic - ensure we have valid values
    console.log('Fallback context:', { currentQuestion, totalQuestions });
    return {
      current: Math.max(1, currentQuestion || 1),
      total: totalQuestions || 1
    };
  };

  const renderProgressIndicator = () => {
    const { current, total } = getSmartQuestionCount();
    
    console.log('Progress Indicator Debug:', { 
      current, 
      total, 
      questionId: question._id || question.id, 
      sectionId: question.sectionId,
      surveyData: survey ? {
        hasSurveySections: !!survey.surveySections,
        hasSectionQuestions: !!survey.sectionQuestions,
        sectionsCount: survey.surveySections?.length,
        questionsCount: survey.sectionQuestions?.length
      } : 'No survey data'
    });
    
    if (!total || total <= 1) return null;
    
    const segments = [];
    for (let i = 1; i <= total; i++) {
      const isActive = i === current;
      const isCompleted = i < current;
      
      console.log(`Segment ${i}:`, { isActive, isCompleted, current });
      
      segments.push(
        <ProgressSegment
          key={i}
          isActive={isActive}
          isCompleted={isCompleted}
          color={color}
        />
      );
    }
    
    return (
      <ProgressIndicator>
        {segments}
      </ProgressIndicator>
    );
  };

  useEffect(() => {
    const header = document.querySelector('header') as HTMLElement;
    if (header) {
      header.style.display = 'block';
    }
    
    const mainDiv = document.querySelector('div#react-target') as HTMLElement;
    if (mainDiv) {
      mainDiv.style.padding = '0';
    }
    
    return () => {
      if (header) {
        header.style.display = '';
      }
      if (mainDiv) {
        mainDiv.style.padding = '';
      }
    };
  }, []);

  const [wordViewerError, setWordViewerError] = useState(false);

  const renderDocumentViewer = () => {
    if (!sectionDocument) return null;
    
    const fileType = documentType || 
      (documentName ? documentName.split('.').pop()?.toLowerCase() : '');
    
    const documentUrl = sectionDocument;
    
    // Create a fully qualified URL for the document
    const fullDocumentUrl = documentUrl.startsWith('http') ? documentUrl : window.location.origin + documentUrl;
    
    // Check if we're on localhost
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    
    const isPdf = fileType === 'pdf' || documentType === 'application/pdf';
    const isWord = fileType === 'doc' || fileType === 'docx' || 
      documentType === 'application/msword' || 
      documentType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
    
    // Render Word document download UI
    const renderWordDownloadUI = () => (
      <div className="word-document-container" style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '40px 20px',
        backgroundColor: '#f9f9f9',
        borderRadius: '4px',
        minHeight: '300px'
      }}>
        <div style={{ marginBottom: '20px', textAlign: 'center' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#2b579a" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
            <polyline points="14 2 14 8 20 8"></polyline>
            <line x1="16" y1="13" x2="8" y2="13"></line>
            <line x1="16" y1="17" x2="8" y2="17"></line>
            <polyline points="10 9 9 9 8 9"></polyline>
          </svg>
        </div>
        <h4 style={{ margin: '0 0 10px 0', color: '#2b579a' }}>{documentName || 'Word Document'}</h4>
        <p style={{ margin: '0 0 20px 0', textAlign: 'center' }}>
          {isLocalhost ? 
            'Microsoft Office Online viewer is not supported on localhost.' : 
            'Word document preview is not available.'}<br />
          Please download the document to view it.
        </p>
        <a 
          href={documentUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          style={{
            display: 'inline-block',
            padding: '10px 20px',
            backgroundColor: '#2b579a',
            color: 'white',
            borderRadius: '4px',
            textDecoration: 'none',
            fontWeight: 'bold',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            transition: 'background-color 0.2s ease'
          }}
          onMouseOver={(e) => e.currentTarget.style.backgroundColor = '#1e3f6f'}
          onMouseOut={(e) => e.currentTarget.style.backgroundColor = '#2b579a'}
        >
          Download {documentName || 'Document'}
        </a>
      </div>
    );
    
    return (
      <div className="document-viewer">
        <div className="document-header">
          <h3 className="document-title">Section Document</h3>
        </div>
        <div className="document-content">
          {isPdf ? (
            <iframe 
              src={`${documentUrl}#toolbar=0&navpanes=0`} 
              className="document-iframe"
              title="PDF Document"
            />
          ) : isWord ? (
            isLocalhost || wordViewerError ? (
              renderWordDownloadUI()
            ) : (
              <>
                <iframe 
                  src={`https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(fullDocumentUrl)}`}
                  className="document-iframe"
                  title="Word Document"
                  onError={() => setWordViewerError(true)}
                />
                <div style={{ textAlign: 'center', marginTop: '10px', marginBottom: '10px' }}>
                  <a 
                    href={documentUrl} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    style={{
                      display: 'inline-block',
                      padding: '8px 16px',
                      backgroundColor: '#2b579a',
                      color: 'white',
                      borderRadius: '4px',
                      textDecoration: 'none',
                      fontWeight: 'bold'
                    }}
                  >
                    Download {documentName || 'Document'}
                  </a>
                </div>
              </>
            )
          ) : (
            <div className="document-fallback">
              <p>Document preview not available</p>
              <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="document-download-link">
                Download {documentName || 'Document'}
              </a>
            </div>
          )}
        </div>
      </div>
    );
  };

  return (
    <>
      {renderProgressIndicator()}
      
      <TwoColumnLayout>
        <QuestionContentColumn>
          <QuestionText>
            <span dangerouslySetInnerHTML={createMarkup(question.text)}></span>
            {question.required && <span className="question-required-indicator" aria-label="required question">*</span>}
          </QuestionText>
          
          <div className="question-card">
            {question.required && <span className="question-required-indicator" aria-label="required field">Required</span>}
            
            <div className="answer-options">
              {renderQuestionInput()}
            </div>
          </div>
          
          {error && (
            <div className="error-message" role="alert">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <line x1="12" y1="8" x2="12" y2="12"></line>
                <line x1="12" y1="16" x2="12.01" y2="16"></line>
              </svg>
              {error}
            </div>
          )}
          
          {/* Navigation buttons - conditionally rendered based on hideNavigation prop */}
          {!hideNavigation && (
            <div className="button-container">
              <button 
                className="button button-back" 
                onClick={() => {
                  // Save the answer before going back but don't trigger navigation or submission
                  console.log('Saving answer before going back:', answer);
                  // Use saveOnly=true to prevent navigation or submission logic
                  const saveOnly = true;
                  // Only call onAnswer if there's an answer to save
                  if (answer) {
                    onAnswer(answer, saveOnly);
                  }
                  // Then go back
                  onBack();
                }}
              >
                <FiArrowLeft size={18} />
                Back
              </button>
              
              <button 
                className="button button-continue"
                onClick={handleContinue}
                disabled={question.required && !isAnswerValid()}
                style={{backgroundColor: color}}
                data-testid={isLastQuestion ? 'submit-button' : 'continue-button'}
              >
                {isLastQuestion ? 'Submit' : 'Continue'}
                <FiArrowRight size={18} />
              </button>
            </div>
          )}
        </QuestionContentColumn>

        {question.image && (
          <QuestionImageColumn>
            <QuestionImageContainer>
              <img 
                src={question.image} 
                alt="Question illustration"
              />
            </QuestionImageContainer>
          </QuestionImageColumn>
        )}
      </TwoColumnLayout>
    </>
  );
};

export default ModernSurveyQuestion;
