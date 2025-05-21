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
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;

  @media (min-width: 600px) {
    padding: 48px 44px 36px 44px;
  }
`;

const Logo = styled.img`
  max-width: 180px;
  margin-bottom: 20px;
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #f0e6d2;
  border-radius: 3px;
  margin-bottom: 20px;
  position: relative;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ width: string }>`
  position: absolute;
  height: 100%;
  background-color: #b7a36a;
  width: ${props => props.width};
  transition: width 0.3s ease;
`;

const NextUpText = styled.div`
  font-size: 1.1rem;
  color: #b7a36a;
  margin-bottom: 10px;
`;

const SectionTitle = styled.h2`
  font-size: 2.2rem;
  color: #28211e;
  margin: 0 0 20px 0;
  font-weight: bold;
`;

const SectionDescription = styled.p`
  font-size: 1.1rem;
  color: #555;
  margin-bottom: 30px;
  line-height: 1.5;
`;

const IllustrationContainer = styled.div`
  width: 100%;
  max-width: 300px;
  margin: 0 auto 30px auto;
`;

const Illustration = styled.img`
  width: 100%;
  height: auto;
`;

const ContinueButton = styled.button`
  background: #b7a36a;
  color: #fff;
  border: none;
  border-radius: 22px;
  padding: 14px 0;
  width: 100%;
  max-width: 280px;
  font-size: 1.1rem;
  font-weight: 700;
  cursor: pointer;
  transition: background 0.2s;
  margin-top: 20px;

  &:hover {
    background: #a08e54;
  }
`;

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
  color = '#b7a36a',
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
      <Card>
        {logo && <Logo src={logo} alt="Logo" />}
        
        <ProgressBar>
          <ProgressFill width={progressPercentage} />
        </ProgressBar>
        <div style={{ width: '100%', textAlign: 'right', color: '#999', fontSize: '0.9rem', marginBottom: '20px' }}>
          {progressPercentage} complete and paused
        </div>
        
        <NextUpText>NEXT UP:</NextUpText>
        <SectionTitle style={{ color }}>{sectionTitle}</SectionTitle>
        <SectionDescription>{sectionDescription}</SectionDescription>
        
        {illustration && (
          <IllustrationContainer>
            <Illustration src={illustration} alt={sectionTitle} />
          </IllustrationContainer>
        )}
        
        <ContinueButton 
          style={{ backgroundColor: color }} 
          onClick={onContinue}
        >
          CONTINUE
        </ContinueButton>
      </Card>
    </Wrapper>
  );
};

export default SectionTransition;
