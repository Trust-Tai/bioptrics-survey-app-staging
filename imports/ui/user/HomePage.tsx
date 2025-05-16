import React from 'react';
import styled from 'styled-components';

const PRIMARY_COLOR = '#b8a06c';
const BG_COLOR = '#f8f6f3';
const CARD_COLOR = '#fff';
const BUTTON_COLOR = '#b8a06c';
const BUTTON_TEXT = '#fff';

const Container = styled.div`
  min-height: 100vh;
  width: 100vw;
  background: ${BG_COLOR};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
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
  user-select: none;
`;

const Card = styled.div`
  background: ${CARD_COLOR};
  border-radius: 18px;
  box-shadow: 0 4px 32px rgba(0,0,0,0.07);
  padding: 2.5rem 1.25rem 2rem 1.25rem;
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  margin: 0 auto;

  @media (min-width: 600px) {
    padding: 3rem 2.5rem 2.5rem 2.5rem;
    max-width: 420px;
  }
`;

const Illustration = styled.div`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: #f6ecd2;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 0.5rem;
`;

const Title = styled.h1`
  color: #222;
  font-size: 1.35rem;
  font-weight: 700;
  margin: 0.5rem 0 0.3rem 0;
  text-align: center;

  @media (min-width: 600px) {
    font-size: 1.6rem;
  }
`;

const Description = styled.p`
  color: #6e5a67;
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  text-align: center;
  line-height: 1.5;
`;

const StartButton = styled.button`
  background: ${BUTTON_COLOR};
  color: ${BUTTON_TEXT};
  border: none;
  border-radius: 24px;
  padding: 0.9rem 2.2rem;
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

const Note = styled.p`
  color: #b6b0a3;
  font-size: 0.93rem;
  margin-top: 1.1rem;
  text-align: center;
  display: flex;
  align-items: center;
  gap: 0.45rem;
`;

const HomePage: React.FC = () => {
  // Replace with navigation logic as needed
  const handleStart = () => {
    // e.g. navigate('/survey')
  };
  return (
    <Container>
      <Logo>
        <span style={{fontWeight: 400, color: '#b8a06c'}}>new</span>
        <span style={{fontWeight: 600, color: '#b8a06c', letterSpacing: '0.5px'}}>gold</span>
      </Logo>
      <Card>
        <Illustration>
          {/* Placeholder SVG illustration */}
          <svg width="74" height="74" viewBox="0 0 74 74" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="37" cy="37" r="37" fill="#f6ecd2"/>
            <ellipse cx="37" cy="53" rx="19" ry="8" fill="#e2cfa7"/>
            <rect x="27" y="28" width="20" height="20" rx="9" fill="#f4b266"/>
            <rect x="32" y="22" width="10" height="12" rx="5" fill="#f4b266"/>
            <rect x="34" y="34" width="6" height="8" rx="3" fill="#fff"/>
            <rect x="31" y="48" width="12" height="7" rx="3.5" fill="#b8a06c"/>
            <rect x="34" y="20" width="6" height="4" rx="2" fill="#222"/>
            <circle cx="37" cy="37" r="2" fill="#222"/>
          </svg>
        </Illustration>
        <Title>Welcome to the New Gold Employee Survey</Title>
        <Description>
          Your feedback is important in helping us improve our workplace. This survey is anonymous and takes about 5-7 minutes to complete. Please answer honestly &mdash; we value your input.
        </Description>
        <StartButton onClick={handleStart}>START SURVEY</StartButton>
        <Note>
          <span style={{fontSize: '1.1em'}}>ⓘ</span>
          Your responses are completely anonymous<br/>and cannot be traced back to you
        </Note>
      </Card>
    </Container>
  );
};

export default HomePage;
