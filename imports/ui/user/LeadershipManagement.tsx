import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const PRIMARY_COLOR = '#b8a06c';
const BG_COLOR = '#f8f6f3';
const BUTTON_COLOR = '#b8a06c';
const BUTTON_TEXT = '#fff';

const Container = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: ${BG_COLOR};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0 1rem;
`;

const Logo = styled.div`
  font-family: 'Georgia', serif;
  font-size: 2.2rem;
  color: ${PRIMARY_COLOR};
  font-weight: 600;
  letter-spacing: 1px;
  margin-bottom: 1.5rem;
  text-align: center;
  margin-top: 2.5rem;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 4px 24px rgba(184,160,108,0.06);
  padding: 2.2rem 1.5rem 2.5rem 1.5rem;
  width: 100%;
  max-width: 420px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin: 0 auto;
`;

const SectionTitle = styled.h2`
  color: #222;
  font-size: 1.15rem;
  font-weight: 700;
  margin: 0.7rem 0 0.2rem 0;
  text-align: center;
  letter-spacing: 0.02em;
`;

const SectionDesc = styled.p`
  color: #6e5a67;
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  text-align: center;
  line-height: 1.5;
`;

const ContinueButton = styled.button`
  background: ${BUTTON_COLOR};
  color: ${BUTTON_TEXT};
  border: none;
  border-radius: 24px;
  padding: 0.85rem 2.2rem;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 1px;
  margin-top: 0.5rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(184,160,108,0.08);
  transition: background 0.18s;
  &:hover {
    background: #9e8a54;
  }
`;

const Progress = styled.div`
  color: #b8a06c;
  font-size: 0.95rem;
  font-weight: 600;
  margin-bottom: 1.2rem;
  text-align: right;
  width: 100%;
`;

const QuestionText = styled.div`
  color: #222;
  font-size: 1.13rem;
  font-weight: 600;
  margin-bottom: 1.3rem;
  text-align: left;
`;

const OptionButton = styled.button<{selected: boolean}>`
  display: flex;
  align-items: center;
  width: 100%;
  min-height: 54px;
  font-size: 1.07rem;
  padding: 0.85rem 1.2rem;
  border-radius: 12px;
  border: 2px solid ${({selected}) => selected ? '#b8a06c' : '#e2d5e2'};
  background: ${({selected}) => selected ? '#b8a06c' : '#f7f4ed'};
  color: ${({selected}) => selected ? '#fff' : '#222'};
  font-weight: 600;
  margin-bottom: 0.7rem;
  transition: border 0.18s, background 0.18s;
  cursor: pointer;
  outline: none;
  box-shadow: none;
`;

const TextArea = styled.textarea`
  width: 100%;
  min-height: 100px;
  border-radius: 12px;
  border: 2px solid #e2d5e2;
  padding: 1rem;
  font-size: 1.05rem;
  background: #f7f4ed;
  color: #222;
  margin-bottom: 1.2rem;
  resize: vertical;
  outline: none;
  &:focus {
    border-color: #b8a06c;
  }
`;

const NavRow = styled.div`
  display: flex;
  width: 100%;
  justify-content: space-between;
  align-items: center;
  margin-top: 1.7rem;
`;

const NavButton = styled.button<{primary?: boolean}>`
  background: ${({primary}) => primary ? BUTTON_COLOR : 'transparent'};
  color: ${({primary}) => primary ? BUTTON_TEXT : '#b8a06c'};
  border: ${({primary}) => primary ? 'none' : '2px solid #b8a06c'};
  border-radius: 24px;
  padding: 0.7rem 1.8rem;
  font-size: 1rem;
  font-weight: 700;
  letter-spacing: 1px;
  cursor: pointer;
  box-shadow: ${({primary}) => primary ? '0 2px 8px rgba(184,160,108,0.08)' : 'none'};
  transition: background 0.18s, color 0.18s;
  &:hover {
    background: ${({primary}) => primary ? '#9e8a54' : '#f7f4ed'};
  }
`;

const questions = [
  {
    type: 'single',
    question: 'How often does your manager provide clear direction for your work?',
    options: ['Always', 'Often', 'Sometimes', 'Rarely', 'Never'],
  },
  {
    type: 'single',
    question: 'Do you feel your leadership listens to feedback from employees?',
    options: ['Yes', 'No'],
  },
  {
    type: 'text',
    question: 'What one thing could leaders at NewGold do better?',
    placeholder: 'You can leave your comments here...'
  },
  {
    type: 'text',
    question: 'How would you rate the overall effectiveness of your manager\'s leadership?',
    placeholder: ''
  }
];

const LeadershipManagement: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(-1); // -1 = intro, 0+ = questions
  const [answers, setAnswers] = useState<any>({});
  const [textValue, setTextValue] = useState('');

  const handleContinue = () => setStep(0);
  const handleOption = (option: string) => {
    setAnswers({ ...answers, [step]: option });
    setTimeout(() => setStep(step + 1), 150);
  };
  const handleTextNext = () => {
    setAnswers({ ...answers, [step]: textValue });
    setTextValue('');
    setStep(step + 1);
  };
  const handleBack = () => {
    if (step === 0) setStep(-1);
    else setStep(step - 1);
  };

  // Render
  return (
    <Container>
      <Logo>
        <span style={{fontWeight: 400}}>new</span>
        <span style={{fontWeight: 600}}>gold</span>
      </Logo>
      <Card>
        {step === -1 ? (
          <>
            <SectionTitle>LEADERSHIP & MANAGEMENT</SectionTitle>
            <SectionDesc>
              Understanding how leadership decisions, style, and support impact your work experience.
            </SectionDesc>
            <ContinueButton onClick={handleContinue}>CONTINUE</ContinueButton>
          </>
        ) : (
          <>
            {questions[step] && (() => {
              const q = questions[step];
              return (
                <>
                  <Progress>
                    LEADERSHIP & MANAGEMENT <span style={{float:'right'}}>{step+1} / {questions.length}</span>
                  </Progress>
                  <QuestionText>{q.question}</QuestionText>
                  {q.type === 'single' && (
  <>
    {q.options?.map((opt: string) => (
      <OptionButton
        key={opt}
        selected={answers[step] === opt}
        onClick={() => handleOption(opt)}
      >
        {opt}
      </OptionButton>
    ))}
  </>
)}
                  {q.type === 'text' && (
                    <>
                      <TextArea
                        value={textValue}
                        onChange={e => setTextValue(e.target.value)}
                        placeholder={q.placeholder}
                      />
                    </>
                  )}
                </>
              );
            })()}
            <NavRow>
              <NavButton onClick={handleBack} disabled={step === 0}>BACK</NavButton>
              {questions[step] && questions[step].type === 'text' ? (
                <NavButton primary onClick={handleTextNext} disabled={!textValue.trim()}>NEXT</NavButton>
              ) : null}
            </NavRow>
          </>
        )}
      </Card>
    </Container>
  );
};

export default LeadershipManagement;
