import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  min-height: 100vh;
  background: #fffbea;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 32px 16px;

  @media (min-width: 600px) {
    padding: 64px 0;
  }
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
  margin-bottom: 18px;
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
  question: string;
  progress: string; // e.g. "1 of 7"
  onNext: (answer: number|null) => void;
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
  const [selected, setSelected] = React.useState<number|null>(null);

  return (
    <Wrapper>
      {onBack && (
        <BackButton aria-label="Back" onClick={onBack}>
          &#8592;
        </BackButton>
      )}
      <Card>
        <Progress>Question {progress}</Progress>
        <QuestionText>{question}</QuestionText>
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
        <NavRow>
          {onBack && <NavButton type="button" onClick={onBack}>Back</NavButton>}
          <NavButton type="button" onClick={() => onNext(selected)}>Next</NavButton>
        </NavRow>
        {onSkip && <SkipButton type="button" onClick={onSkip}>Skip this question</SkipButton>}
      </Card>
    </Wrapper>
  );
};

export default SurveyQuestion;
