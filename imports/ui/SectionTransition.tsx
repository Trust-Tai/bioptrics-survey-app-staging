import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f9f6f2;
  position: relative;
`;

const Card = styled.div`
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 2px 24px rgba(229, 214, 224, 0.2);
  padding: 36px 24px 28px 24px;
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;

  @media (min-width: 600px) {
    padding: 48px 44px 36px 44px;
  }
`;

const Logo = styled.img`
  max-width: 140px;
  height: auto;
  margin-bottom: 20px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #f0e6d2;
  border-radius: 3px;
  margin-bottom: 5px;
  position: relative;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: string }>`
  position: absolute;
  height: 100%;
  background-color: #b69d57;
  width: ${props => props.width};
  transition: width 0.3s ease;
`;

const NextUpText = styled.div`
  font-size: 0.9rem;
  color: #b69d57;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 15px;
  margin-bottom: 5px;
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  color: #28211e;
  margin: 0 0 15px 0;
  font-weight: bold;
`;

const SectionDescription = styled.p`
  font-size: 1rem;
  color: #555;
  margin-bottom: 20px;
  line-height: 1.5;
  max-width: 320px;
`;

const IllustrationContainer = styled.div`
  width: 100%;
  max-width: 220px;
  margin: 0 auto 30px auto;
`;

const Illustration = styled.img`
  width: 100%;
  height: auto;
  border-radius: 50%;
  object-fit: cover;
`;

const ContinueButton = styled.button`
  background: #b69d57;
  color: #fff;
  border: none;
  border-radius: 22px;
  padding: 14px 0;
  width: 100%;
  max-width: 280px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;

  &:hover {
    opacity: 0.9;
  }
`;

const BackButton = styled.button`
  position: absolute;
  left: 16px;
  top: 24px;
  background: none;
  border: none;
  color: #b69d57;
  font-size: 1.2rem;
  font-weight: bold;
  z-index: 10;
  cursor: pointer;
  padding: 0;
  line-height: 1;
  display: flex;
  align-items: center;
  @media (min-width: 600px) {
    left: 32px;
    top: 38px;
  }
`;

const SkipButton = styled.button`
  position: absolute;
  right: 16px;
  top: 24px;
  background: none;
  border: none;
  color: #b69d57;
  font-size: 0.9rem;
  z-index: 10;
  cursor: pointer;
  padding: 0;
  @media (min-width: 600px) {
    right: 32px;
    top: 38px;
  }
`;

const ProgressText = styled.div`
  width: 100%;
  text-align: right;
  color: #999;
  font-size: 0.8rem;
  margin-bottom: 20px;
`;



interface SectionTransitionProps {
  logo?: string;
  color?: string;
  sectionTitle: string;
  sectionDescription: string;
  illustration?: string;
  progress: { current: number; total: number };
  onContinue: () => void;
  onBack?: () => void;
}

const SectionTransition: React.FC<SectionTransitionProps> = ({
  logo,
  color = '#b69d57',
  sectionTitle,
  sectionDescription,
  illustration,
  progress,
  onContinue,
  onBack
}) => {
  const progressPercentage = `${Math.round((progress.current / progress.total) * 100)}%`;
  
  return (
    <Wrapper>
      {onBack && <BackButton onClick={onBack}>&larr;</BackButton>}
      <SkipButton onClick={onContinue}>Skip</SkipButton>
      <Card>
        {logo && <Logo src={logo} alt="Logo" />}
        
        <ProgressBar>
          <ProgressFill width={progressPercentage} />
        </ProgressBar>
        <ProgressText>
          {progressPercentage} complete and paused
        </ProgressText>
        
        <NextUpText>NEXT UP:</NextUpText>
        <SectionTitle>{sectionTitle}</SectionTitle>
        <SectionDescription>{sectionDescription}</SectionDescription>
        
        {illustration && (
          <IllustrationContainer>
            <Illustration src={illustration} alt={sectionTitle} />
          </IllustrationContainer>
        )}
        
        <ContinueButton 
          onClick={onContinue}
        >
          CONTINUE
        </ContinueButton>
      </Card>
    </Wrapper>
  );
};

export default SectionTransition;
