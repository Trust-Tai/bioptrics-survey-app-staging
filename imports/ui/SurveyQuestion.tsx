import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 2px 24px #e5d6e033;
  padding: 36px 24px 28px 24px;
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;

  @media (min-width: 600px) {
    padding: 48px 44px 36px 44px;
    max-width: 440px;
  }
`;

const Progress = styled.div`
  color: #552a47;
  font-weight: 700;
  font-size: 1.02rem;
  margin-bottom: 8px;
`;

const SectionName = styled.div`
  color: #28211e;
  font-size: 0.9rem;
  font-weight: 600;
  text-align: center;
  margin-bottom: 12px;
  background-color: #f4ebf1;
  padding: 6px 12px;
  border-radius: 12px;
  display: inline-block;
`;

const QuestionText = styled.div`
  color: #28211e;
  font-size: 1.12rem;
  font-weight: 700;
  text-align: center;
  margin-bottom: 32px;

  @media (min-width: 600px) {
    font-size: 1.18rem;
  }
`;

const LikertRow = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  margin-bottom: 28px;
  gap: 4px;
`;

const LikertButton = styled.button<{ selected: boolean }>`
  flex: 1;
  padding: 12px 0;
  margin: 0 2px;
  background: ${({ selected }) => (selected ? '#552a47' : '#f7f2f5')};
  color: ${({ selected }) => (selected ? '#fff' : '#28211e')};
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;

  &:hover {
    background: #693658;
    color: #fff;
  }
`;

const NavRow = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  margin-top: 10px;
  gap: 12px;
`;

const NavButton = styled.button`
  background: #552a47;
  color: #fff;
  border: none;
  border-radius: 22px;
  padding: 12px 0;
  min-width: 110px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;

  &:hover {
    background: #693658;
  }
`;

const SkipButton = styled.button`
  background: none;
  border: none;
  color: #8a7a85;
  font-size: 1rem;
  margin-top: 14px;
  cursor: pointer;
  text-decoration: underline;
`;

// Example question props
interface SurveyQuestionProps {
  question: any; // Accepts a full question object
  progress: string; // e.g. "1 of 7"
  onNext: (answer: any) => void;
  onBack?: () => void;
  onSkip?: () => void;
}

const likertLabels = [
  'Strongly Disagree',
  'Disagree',
  'Neutral',
  'Agree',
  'Strongly Agree',
];

const BackButton = styled.button`
  position: absolute;
  left: 16px;
  top: 24px;
  background: none;
  border: none;
  color: #552a47;
  font-size: 2rem;
  font-weight: bold;
  z-index: 10;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  @media (min-width: 600px) {
    left: 32px;
    top: 38px;
  }
`;

const SurveyQuestion: React.FC<SurveyQuestionProps> = ({ question, progress, onNext, onBack, onSkip }) => {
  // Extract question data - handle both database format and mock format
  let responseType = 'likert';
  let options: any[] = [];
  let questionText = '';
  
  if (question.versions && question.versions.length > 0) {
    // Database format - question from the database has versions
    const version = question.versions[question.versions.length - 1];
    responseType = version.responseType || 'likert';
    options = version.options || [];
    questionText = version.questionText || '';
  } else {
    // Mock format - direct properties
    responseType = question.type || 'likert';
    questionText = question.text || '';
    
    // Handle different option formats
    if (question.options) {
      options = question.options;
    } else if (question.labels) {
      options = question.labels;
    } else if (responseType === 'likert' && question.scale) {
      // Default likert labels if we have a scale but no labels
      options = ['Strongly Disagree', 'Disagree', 'Neutral', 'Agree', 'Strongly Agree'].slice(0, question.scale);
    }
  }

  // State for answer
  const [selected, setSelected] = React.useState<any>(null);
  const [textValue, setTextValue] = React.useState('');

  // Render answer input based on responseType
  let answerInput: React.ReactNode = null;
  
  // Map responseType to the correct rendering
  if (responseType === 'likert') {
    // For Likert scale questions (1-5 rating)
    const scale = question.scale || 5;
    const scaleArray = Array.from({ length: scale }, (_, i) => i + 1);
    const labels = options.length > 0 ? options : likertLabels.slice(0, scale);
    
    answerInput = (
      <>
        <LikertRow>
          {scaleArray.map((val, idx) => (
            <LikertButton
              key={val}
              selected={selected === val}
              onClick={() => setSelected(val)}
              aria-label={labels[idx] || `Rating ${val}`}
            >
              {val}
            </LikertButton>
          ))}
        </LikertRow>
        <div style={{ width: '100%', textAlign: 'center', color: '#8a7a85', fontSize: '0.98em', marginBottom: 8 }}>
          <span>{selected ? (labels[selected-1] || `Rating ${selected}`) : 'Select a rating'}</span>
        </div>
      </>
    );
  } else if (responseType === 'text') {
    // For free text questions
    answerInput = (
      <textarea
        style={{ width: '100%', minHeight: 80, borderRadius: 8, border: '1px solid #552a47', padding: 12, fontSize: '1rem', marginBottom: 16 }}
        value={textValue}
        onChange={e => setTextValue(e.target.value)}
        placeholder="Type your answer here..."
      />
    );
  } else if ((responseType === 'select' || responseType === 'single' || responseType === 'multiple') && Array.isArray(options) && options.length > 0) {
    // For single or multiple choice questions
    answerInput = (
      <div style={{ width: '100%', marginBottom: 16 }}>
        {options.map((opt: string, idx: number) => (
          <LikertButton
            key={`${opt}-${idx}`}
            selected={responseType === 'multiple' ? 
              (Array.isArray(selected) && selected.includes(idx)) : 
              (selected === idx)}
            onClick={() => {
              if (responseType === 'multiple') {
                // For multiple choice, toggle selection
                const currentSelected = Array.isArray(selected) ? [...selected] : [];
                if (currentSelected.includes(idx)) {
                  setSelected(currentSelected.filter(i => i !== idx));
                } else {
                  setSelected([...currentSelected, idx]);
                }
              } else {
                // For single choice, just select one
                setSelected(idx);
              }
            }}
            aria-label={opt}
            style={{ 
              marginBottom: 8,
              textAlign: 'left',
              justifyContent: 'flex-start',
              padding: '12px 16px'
            }}
          >
            {opt}
          </LikertButton>
        ))}
      </div>
    );
  }

  // Handler for Next
  const handleNextClick = () => {
    // Validate that an answer has been provided
    if (responseType === 'likert' && !selected) {
      alert('Please select a rating before continuing.');
      return;
    } else if (responseType === 'text' && !textValue.trim()) {
      alert('Please enter your response before continuing.');
      return;
    } else if ((responseType === 'select' || responseType === 'single') && selected === null) {
      alert('Please select an option before continuing.');
      return;
    } else if (responseType === 'multiple' && (!Array.isArray(selected) || selected.length === 0)) {
      alert('Please select at least one option before continuing.');
      return;
    }
    
    // Format the response based on question type
    let response;
    if (responseType === 'likert') {
      response = {
        value: selected,
        label: options[selected - 1] || `Rating ${selected}`
      };
    } else if (responseType === 'text') {
      response = textValue;
    } else if (responseType === 'multiple' && Array.isArray(selected)) {
      response = selected.map(idx => ({
        value: idx,
        label: options[idx]
      }));
    } else if (responseType === 'select' || responseType === 'single') {
      response = {
        value: selected,
        label: options[selected]
      };
    } else {
      response = selected;
    }
    
    // Pass the response to the parent component
    onNext({
      questionId: question._id,
      questionText: questionText,
      sectionName: question.sectionName,
      responseType: responseType,
      response: response
    });
  };

  return (
    <Wrapper>
      <Card>
        <Progress>Question {progress}</Progress>
        {question.sectionName && (
          <div style={{ textAlign: 'center', marginBottom: 12 }}>
            <SectionName>{question.sectionName}</SectionName>
          </div>
        )}
        <QuestionText>{questionText}</QuestionText>
        {answerInput}
        <NavRow>
          {onBack && <NavButton type="button" onClick={onBack}>Back</NavButton>}
          <NavButton type="button" onClick={handleNextClick}>Next</NavButton>
        </NavRow>
        {onSkip && <SkipButton type="button" onClick={onSkip}>Skip this question</SkipButton>}
      </Card>
    </Wrapper>
  );
};

export default SurveyQuestion;
