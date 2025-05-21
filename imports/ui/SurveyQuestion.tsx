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
  box-shadow: 0 2px 24px #e6d6b933;
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
  color: #b7a36a;
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
  background-color: #f5ebd7;
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
  background: ${({ selected }) => (selected ? '#b7a36a' : '#f7f2f5')};
  color: ${({ selected }) => (selected ? '#fff' : '#28211e')};
  border: none;
  border-radius: 10px;
  font-size: 1rem;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.18s;

  &:hover {
    background: #b7a36a;
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
  background: #b7a36a;
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
    background: #a08e54;
  }
`;

const SkipButton = styled.button`
  background: none;
  border: none;
  color: #b3a08a;
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
  color: #b7a36a;
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
  // Defensive: get latest version
  const version = question.versions ? question.versions[question.versions.length - 1] : {};
  const responseType = version.responseType || 'likert';
  const options = version.options || [];
  const questionText = version.questionText || '';

  // State for answer
  const [selected, setSelected] = React.useState<any>(null);
  const [textValue, setTextValue] = React.useState('');

  // Render answer input based on responseType
  let answerInput: React.ReactNode = null;
  if (responseType === 'likert') {
    answerInput = (
      <>
        <LikertRow>
          {[1,2,3,4,5].map((val, idx) => (
            <LikertButton
              key={val}
              selected={selected === val}
              onClick={() => setSelected(val)}
              aria-label={likertLabels[idx]}
            >
              {val}
            </LikertButton>
          ))}
        </LikertRow>
        <div style={{ width: '100%', textAlign: 'center', color: '#b3a08a', fontSize: '0.98em', marginBottom: 8 }}>
          <span>{likertLabels[selected ? selected-1 : 2]}</span>
        </div>
      </>
    );
  } else if (responseType === 'text') {
    answerInput = (
      <textarea
        style={{ width: '100%', minHeight: 80, borderRadius: 8, border: '1px solid #b7a36a', padding: 12, fontSize: '1rem', marginBottom: 16 }}
        value={textValue}
        onChange={e => setTextValue(e.target.value)}
        placeholder="Type your answer here..."
      />
    );
  } else if (responseType === 'select' && Array.isArray(options)) {
    answerInput = (
      <div style={{ width: '100%', marginBottom: 16 }}>
        {options.map((opt: string, idx: number) => (
          <LikertButton
            key={opt}
            selected={selected === idx}
            onClick={() => setSelected(idx)}
            aria-label={opt}
            style={{ marginBottom: 8 }}
          >
            {opt}
          </LikertButton>
        ))}
      </div>
    );
  }

  // Handler for Next
  const handleNextClick = () => {
    if (responseType === 'likert') onNext(selected);
    else if (responseType === 'text') onNext(textValue);
    else if (responseType === 'select') onNext(options[selected] ?? null);
    else onNext(selected);
  };

  return (
    <Wrapper>
      {onBack && (
        <BackButton aria-label="Back" onClick={onBack}>
          &#8592;
        </BackButton>
      )}
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
