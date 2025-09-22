import React, { useState, useMemo } from 'react';
import styled from 'styled-components';

type QuestionType = 'likert' | 'radio' | 'text' | 'textarea' | 'checkbox' | 'rating' | 'rank' | 'date';

interface Option {
  value: string;
  label?: string;
  text?: string;
  image?: string;
}

interface QuestionRendererProps {
  questionType: QuestionType;
  questionText: string;
  options?: Array<Option>;
  value: any;
  onChange: (value: any) => void;
  required: boolean;
  placeholder?: string;
  min?: number;
  max?: number;
  currentStep?: number;
  totalSteps?: number;
  image?: string; // Add image property
}

const QuestionRenderer: React.FC<QuestionRendererProps> = React.memo(({
  questionType,
  questionText,
  options = [],
  value,
  onChange,
  required,
  placeholder = 'Type here...',
  min = 1,
  max = 5,
  currentStep,
  totalSteps,
  image,
}) => {
    // Memoized background color function to prevent recreation on each render
  const getBackgroundColor = useMemo(() => {
    return (text: string, isSelected: boolean) => {
      if (!isSelected) return '#f9f9f9';
      
      const lowerText = text.toLowerCase();
      if (lowerText.includes('neither agree nor disagree')) return '#FFC107'; // Yellow
      if (lowerText.includes('strongly disagree')) return '#FF5252'; // Red
      if (lowerText.includes('disagree')) return '#FF9800'; // Orange
      if (lowerText.includes('neutral')) return '#FFC107'; // Yellow
      if (lowerText.includes('agree') && !lowerText.includes('strongly')) return '#8BC34A'; // Light green
      if (lowerText.includes('strongly agree')) return '#4CAF50'; // Full green
      return '#FFC107'; // Default
    };
  }, []);

  // Memoized emoji function to prevent recreation on each render
  const getEmoji = useMemo(() => {
    return (text: string) => {
      const lowerText = text.toLowerCase();
      if (lowerText.includes('neither agree nor disagree')) return '😶'; // Neutral face with open mouth
      if (lowerText.includes('strongly disagree')) return '😡'; // Angry face
      if (lowerText.includes('disagree')) return '😕'; // Confused face
      if (lowerText.includes('neutral')) return '😶'; // Neutral face with open mouth
      if (lowerText.includes('agree') && !lowerText.includes('strongly')) return '😊'; // Smiling face
      if (lowerText.includes('strongly agree')) return '🥰'; // Grinning face
      return '😶'; // Default
    };
  }, []);

  // Implementation of all render functions
  const renderLikertScale = () => {
    return (
      <LikertContainer>
        {options.map((option: Option) => {
          const text = option.text || option.label || '';
          const isSelected = value === option.value;
          const bgColor = getBackgroundColor(text, isSelected);
          
          return (
            <CustomLikertOption 
              key={option.value}
              isSelected={isSelected}
              onClick={() => onChange(option.value)}
              bgColor={bgColor}
            >
              <LikertEmoji isSelected={isSelected}>
                {getEmoji(text)}
              </LikertEmoji>
              <OptionLabel isSelected={isSelected}>
                {text}
              </OptionLabel>
            </CustomLikertOption>
          );
        })}
      </LikertContainer>
    );
  };

  // Implementation for radio buttons
  const renderRadioOptions = () => {
    return (
      <RadioOptionsContainer>
        {options.map((option: Option) => {
          const isSelected = value === option.value;
          return (
            <RadioOption 
              key={option.value}
              isSelected={isSelected}
              onClick={() => onChange(option.value)}
              style={{ flex: '0 0 calc(50% - 0.5rem)' }} // Set width to roughly 50% with gap consideration
            >
              <RadioButton isSelected={isSelected}>
                {isSelected && <RadioButtonInner />}
              </RadioButton>
              <OptionLabel style={{ fontWeight: isSelected ? '500' : 'normal' }}>
                {option.text || option.label || option.value}
              </OptionLabel>
            </RadioOption>
          );
        })}
      </RadioOptionsContainer>
    );
  };

  // Implementation for text input
  const renderTextInput = () => {
    return (
      <TextInput
        type="text"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
      />
    );
  };

  // Implementation for textarea
  const renderTextareaInput = () => {
    return (
      <TextareaInput
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        rows={5}
      />
    );
  };

  // Implementation for checkboxes
  const renderCheckboxOptions = () => {
    // Initialize value as array if not already
    const selectedValues = Array.isArray(value) ? value : value ? [value] : [];
    
    const handleCheckboxChange = (optionValue: string) => {
      const newSelectedValues = [...selectedValues];
      
      if (newSelectedValues.includes(optionValue)) {
        // Remove if already selected
        const index = newSelectedValues.indexOf(optionValue);
        newSelectedValues.splice(index, 1);
      } else {
        // Add if not selected
        newSelectedValues.push(optionValue);
      }
      
      onChange(newSelectedValues);
    };
    
    return (
      <OptionsContainer>
        {options.map((option: Option) => (
          <CheckboxOption 
            key={option.value}
            isSelected={selectedValues.includes(option.value)}
            onClick={() => handleCheckboxChange(option.value)}
          >
            <CheckboxButton isSelected={selectedValues.includes(option.value)}>
              {selectedValues.includes(option.value) && <CheckboxButtonInner>✓</CheckboxButtonInner>}
            </CheckboxButton>
            <OptionLabel>{option.text || option.label || option.value}</OptionLabel>
          </CheckboxOption>
        ))}
      </OptionsContainer>
    );
  };

  // Implementation for rating scale
  const renderRatingScale = () => {
    const ratings = Array.from({ length: max - min + 1 }, (_, i) => min + i);
    
    return (
      <RatingContainer>
        {ratings.map((rating) => (
          <RatingButton 
            key={rating}
            isSelected={value === rating.toString()}
            onClick={() => onChange(rating.toString())}
          >
            {rating}
          </RatingButton>
        ))}
      </RatingContainer>
    );
  };

  // Implementation for ranking questions
  const renderRankingOptions = () => {
    // Initialize value as array if not already
    const rankedItems = Array.isArray(value) ? value : [];
    
    // Create a list of items that can be ranked
    const [items, setItems] = useState(options.map((option: Option) => ({
      id: option.value,
      label: option.label,
      rank: rankedItems.findIndex(item => item === option.value) + 1 || 0
    })));
    
    const handleRankChange = (itemId: string, newRank: number) => {
      // Ensure rank is within bounds
      const validRank = Math.max(1, Math.min(newRank, options.length));
      
      // Update the rank of the current item and adjust others
      const updatedItems = items.map(item => {
        if (item.id === itemId) {
          return { ...item, rank: validRank };
        } else if (item.rank === validRank && item.id !== itemId) {
          // If another item has this rank, swap them
          return { ...item, rank: items.find(i => i.id === itemId)?.rank || 0 };
        }
        return item;
      });
      
      setItems(updatedItems);
      
      // Update the value with the new ranking order
      const sortedItems = [...updatedItems].sort((a, b) => a.rank - b.rank);
      const newRankedItems = sortedItems.filter(item => item.rank > 0).map(item => item.id);
      onChange(newRankedItems);
    };
    
    return (
      <RankingContainer>
        {items.map((item) => (
          <RankingItem key={item.id}>
            <RankInput
              type="number"
              min="1"
              max={options.length}
              value={item.rank || ''}
              onChange={(e) => handleRankChange(item.id, parseInt(e.target.value) || 0)}
              placeholder="#"
            />
            <RankLabel>{item.label}</RankLabel>
          </RankingItem>
        ))}
      </RankingContainer>
    );
  };

  // Implementation for date input
  const renderDateInput = () => {
    return (
      <DateInput
        type="date"
        value={value || ''}
        onChange={(e) => onChange(e.target.value)}
        required={required}
      />
    );
  };

  // Define renderQuestionInput after all render functions are defined
  const renderQuestionInput = () => {
    switch (questionType) {
      case 'likert':
        return renderLikertScale();
      case 'radio':
        return renderRadioOptions();
      case 'text':
        return renderTextInput();
      case 'textarea':
        return renderTextareaInput();
      case 'checkbox':
        return renderCheckboxOptions();
      case 'rating':
        return renderRatingScale();
      case 'rank':
        return renderRankingOptions();
      case 'date':
        return renderDateInput();
      default:
        return renderTextInput();
    }
  };

  // Memoize the question input to prevent unnecessary re-renders
  const questionInput = useMemo(() => renderQuestionInput(), [questionType, JSON.stringify(options), value, onChange]);

  return (
    <QuestionContainer>
      {/* {currentStep && totalSteps && (
        <StepIndicator>
          STEP {currentStep}/{totalSteps}
        </StepIndicator>
      )} */}
      <QuestionTextContainer>
        <QuestionText dangerouslySetInnerHTML={{ __html: questionText }} />
        {required && <RequiredAsterisk>*</RequiredAsterisk>}
      </QuestionTextContainer>
      
      {/* Display image if available */}
      {image && (
        <QuestionImageContainer>
          <QuestionImage 
            src={image.startsWith('data:') ? image : `data:image/png;base64,${image}`} 
            alt="Question visual" 
            onError={(e) => {
              // Try alternative format if initial load fails
              const imgElement = e.target as HTMLImageElement;
              if (!imgElement.src.startsWith('data:image/jpeg')) {
                imgElement.src = `data:image/jpeg;base64,${image}`;
              }
            }}
          />
        </QuestionImageContainer>
      )}
      
      {questionInput}
      {required && !value && <RequiredIndicator>Please answer this required question</RequiredIndicator>}
    </QuestionContainer>
  );
});

// Styled components
const QuestionContainer = styled.div`
  margin-bottom: 2rem;
  width: 100%;
`;

const QuestionTextContainer = styled.div`
  display: flex;
  align-items: flex-start;
  margin-bottom: 1.5rem;
`;

const QuestionText = styled.div`
  font-size: 1.25rem;
  font-weight: 500;
  color: #1a365d; /* Darker blue color from Figma */
  line-height: 1.4;
  flex: 1;
`;

const RequiredAsterisk = styled.span`
  color: #d32f2f;
  font-size: 1.25rem;
  font-weight: 700;
  margin-left: 4px;
  line-height: 1.4;
`;

const OptionsContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RadioOptionsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  width: 100%;
`;

const LikertContainer = styled.div`
  display: flex;
  justify-content: space-between;
  gap: 10px;
  width: 100%;
  margin-top: 20px;
  align-items: center;
`;

const LikertOption = styled.div<{ isSelected: boolean; backgroundColor?: string; borderColor?: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 15px;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${props => props.isSelected ? props.backgroundColor || '#4CAF50' : '#f9f9f9'};
  border: 1px solid ${props => props.isSelected ? props.borderColor || '#4CAF50' : '#e0e0e0'};
  transition: all 0.2s ease;
  flex: 1;
  text-align: center;
  
  &:hover {
    background-color: ${props => props.isSelected ? props.backgroundColor || '#4CAF50' : '#f2f2f2'};
    opacity: ${props => props.isSelected ? 1 : 0.9};
  }
`;

const OptionIcon = styled.div<{ isSelected: boolean }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 0.75rem;
  background-color: ${props => props.isSelected ? 'var(--primary-color, #552A47)' : '#f2f2f2'};
  color: ${props => props.isSelected ? 'white' : '#666'};
  font-size: 1.25rem;
`;

const LikertEmoji = styled.div<{ isSelected: boolean }>`
  font-size: 28px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
  transform: ${props => props.isSelected ? 'scale(1.1)' : 'scale(1)'};
  background-color: #f0f0f0;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 10px;
`;

const CustomLikertOption = styled.div<{ isSelected: boolean; bgColor: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 15px 10px;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${props => props.isSelected ? props.bgColor : '#f9f9f9'};
  border: 1px solid ${props => props.isSelected ? props.bgColor : '#e0e0e0'};
  transition: all 0.2s ease;
  flex: 1;
  text-align: center;
  height: 150px; /* Fixed height to ensure alignment */
  
  &:hover {
    background-color: ${props => props.isSelected ? props.bgColor : '#f2f2f2'};
    opacity: ${props => props.isSelected ? 1 : 0.9};
  }
`;

const OptionLabel = styled.span<{ isSelected?: boolean }>`
  font-size: ${props => props.isSelected ? '0.95rem' : '0.9rem'};
  font-weight: ${props => props.isSelected ? '500' : 'normal'};
  color: ${props => props.isSelected ? '#000' : '#333'};
  margin-top: 5px;
`;

const RadioOption = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.75rem 1.5rem;
  border-radius: 40px;
  cursor: pointer;
  background-color: ${props => props.isSelected ? 'rgba(var(--primary-color-rgb, 85, 42, 71), 0.1)' : '#f9f9f9'};
  border: 1px solid ${props => props.isSelected ? 'var(--primary-color, #552A47)' : '#e0e0e0'};
  transition: all 0.2s ease;
  margin-bottom: 0.75rem;
  
  &:hover {
    background-color: ${props => props.isSelected ? 'rgba(var(--primary-color-rgb, 85, 42, 71), 0.1)' : '#f2f2f2'};
  }
`;

const RadioButton = styled.div<{ isSelected: boolean }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  border: 2px solid ${props => props.isSelected ? 'var(--primary-color, #552A47)' : '#999'};
  margin-right: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.isSelected ? 'var(--primary-color, #552A47)' : 'transparent'};
`;

const RadioButtonInner = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: white;
`;

const TextInput = styled.input`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color, #552A47);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 85, 42, 71), 0.2);
  }
`;

const TextareaInput = styled.textarea`
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color, #552A47);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 85, 42, 71), 0.2);
  }
`;

const CheckboxOption = styled.div<{ isSelected: boolean }>`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  cursor: pointer;
  background-color: ${props => props.isSelected ? 'rgba(var(--primary-color-rgb, 85, 42, 71), 0.1)' : '#f9f9f9'};
  border: 1px solid ${props => props.isSelected ? 'var(--primary-color, #552A47)' : '#e0e0e0'};
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.isSelected ? 'rgba(var(--primary-color-rgb, 85, 42, 71), 0.1)' : '#f2f2f2'};
  }
`;

const CheckboxButton = styled.div<{ isSelected: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 4px;
  border: 2px solid ${props => props.isSelected ? 'var(--primary-color, #552A47)' : '#999'};
  margin-right: 0.75rem;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: ${props => props.isSelected ? 'var(--primary-color, #552A47)' : 'transparent'};
`;

const CheckboxButtonInner = styled.div`
  color: white;
  font-size: 0.75rem;
  font-weight: bold;
`;

const RatingContainer = styled.div`
  display: flex;
  gap: 0.5rem;
  flex-wrap: wrap;
`;

const RatingButton = styled.button<{ isSelected: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background-color: ${props => props.isSelected ? 'var(--primary-color, #552A47)' : '#f2f2f2'};
  color: ${props => props.isSelected ? 'white' : '#333'};
  font-size: 1rem;
  font-weight: ${props => props.isSelected ? 'bold' : 'normal'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: ${props => props.isSelected ? 'var(--button-hover, #3d1e32)' : '#e0e0e0'};
  }
`;

const RankingContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
`;

const RankingItem = styled.div`
  display: flex;
  align-items: center;
  padding: 0.75rem;
  border-radius: 8px;
  background-color: #f9f9f9;
  border: 1px solid #e0e0e0;
`;

const RankInput = styled.input`
  width: 50px;
  padding: 0.5rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  text-align: center;
  margin-right: 0.75rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color, #552A47);
  }
`;

const RankLabel = styled.span`
  font-size: 0.9rem;
  color: #333;
`;

const DateInput = styled.input`
  padding: 0.75rem;
  border: 1px solid #e0e0e0;
  border-radius: 4px;
  font-size: 1rem;
  
  &:focus {
    outline: none;
    border-color: var(--primary-color, #552A47);
    box-shadow: 0 0 0 2px rgba(var(--primary-color-rgb, 85, 42, 71), 0.2);
  }
`;

const RequiredIndicator = styled.div`
  color: #d32f2f;
  font-size: 0.85rem;
  font-style: italic;
  margin-top: 0.5rem;
`;

const StepIndicator = styled.div`
  background-color: rgba(var(--primary-color-rgb, 85, 42, 71), 0.1);
  color: var(--primary-color, #552A47);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 0.5rem 1.2rem;
  border-radius: 20px;
  display: inline-block;
  margin-bottom: 1.5rem;
  letter-spacing: 0.5px;
  text-transform: uppercase;
`;

// Question image styles
const QuestionImageContainer = styled.div`
  margin: 1rem 0 2rem;
  width: 100%;
  display: flex;
  justify-content: center;
  border-radius: 8px;
  overflow: hidden;
  max-width: 100%;
`;

const QuestionImage = styled.img`
  max-width: 100%;
  height: auto;
  object-fit: contain;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  display: block;
  margin: 0 auto;
  max-height: 600px; /* Limit maximum height */
`;

// Admin label styling
const AdminLabel = styled.div`
  background-color: #f0f8ff; /* Light blue background */
  color: #0066cc; /* Blue text */
  padding: 8px 12px;
  margin: 10px 0;
  border-left: 4px solid #0066cc;
  font-size: 0.9rem;
  font-style: italic;
  border-radius: 4px;
`;

export default QuestionRenderer;
