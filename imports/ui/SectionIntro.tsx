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
  position: relative;
  overflow: hidden;

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

const Logo = styled.img`
  width: 120px;
  margin-bottom: 22px;
`;

const Title = styled.h2`
  font-size: 1.18rem;
  font-weight: 800;
  color: #28211e;
  text-align: center;
  margin-bottom: 12px;
  letter-spacing: 0.02em;

  @media (min-width: 600px) {
    font-size: 1.28rem;
  }
`;

const Description = styled.p`
  color: #6e5a67;
  font-size: 1rem;
  text-align: center;
  margin-bottom: 28px;
  line-height: 1.5;
`;

const ContinueButton = styled.button`
  background: #b7a36a;
  color: #fff;
  border: none;
  border-radius: 22px;
  padding: 14px 0;
  width: 100%;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  margin-top: 16px;
  transition: background 0.2s;
  letter-spacing: 0.07em;

  &:hover {
    background: #a08e54;
  }
`;

const BgTriangles = styled.div`
  position: absolute;
  left: 0; right: 0; bottom: 0;
  width: 100%;
  height: 120px;
  pointer-events: none;
  z-index: 1;
`;

interface SectionIntroProps {
  logoSrc?: string;
  title: string;
  description: string;
  onContinue: () => void;
  onBack?: () => void;
}

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

const SectionIntro: React.FC<SectionIntroProps> = ({ logoSrc = "https://s28.q4cdn.com/380852864/files/design/logo.svg", title, description, onContinue, onBack }) => (
  <Wrapper>
    {onBack && (
      <BackButton aria-label="Back" onClick={onBack}>
        &#8592;
      </BackButton>
    )}
    <Card>
      <Logo src='https://s28.q4cdn.com/380852864/files/design/logo.svg' alt="newgold logo" />
      <Title>{title}</Title>
      <Description>{description}</Description>
      <ContinueButton onClick={onContinue}>CONTINUE</ContinueButton>
    </Card>
    <BgTriangles>
      {/* Simple SVG triangles for background, can be replaced with your own SVG */}
      <svg width="100%" height="100%" viewBox="0 0 400 120" fill="none">
        <polygon points="40,120 120,80 80,120" fill="#f3e7c7" />
        <polygon points="180,120 220,90 300,120" fill="#f3e7c7" />
        <polygon points="320,120 360,110 400,120" fill="#f3e7c7" />
      </svg>
    </BgTriangles>
  </Wrapper>
);

export default SectionIntro;
