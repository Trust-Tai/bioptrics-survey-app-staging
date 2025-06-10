import React from 'react';
import styled from 'styled-components';
import { useNavigate, useParams } from 'react-router-dom';

// Styled components for the section screen
const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 20px;
  background-color: #f9f6f2;
  background-image: linear-gradient(to bottom right, #f9f6f2, #f4ebf1);
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -10%;
    right: -10%;
    width: 300px;
    height: 300px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(182, 157, 87, 0.1) 0%, rgba(182, 157, 87, 0) 70%);
    z-index: 0;
  }
  
  &::after {
    content: '';
    position: absolute;
    bottom: -5%;
    left: -5%;
    width: 250px;
    height: 250px;
    border-radius: 50%;
    background: radial-gradient(circle, rgba(85, 42, 71, 0.08) 0%, rgba(85, 42, 71, 0) 70%);
    z-index: 0;
  }
`;

const Card = styled.div`
  background: #fff;
  border-radius: 28px;
  box-shadow: 0 10px 30px rgba(85, 42, 71, 0.08), 0 2px 8px rgba(0, 0, 0, 0.06);
  padding: 36px 24px 28px 24px;
  max-width: 500px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  position: relative;
  z-index: 1;
  animation: fadeIn 0.6s ease-out, slideUp 0.5s ease-out;
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
  
  @keyframes slideUp {
    from { transform: translateY(20px); }
    to { transform: translateY(0); }
  }

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
  box-shadow: inset 0 1px 2px rgba(0, 0, 0, 0.05);
`;

const ProgressFill = styled.div<{ width: string }>`
  position: absolute;
  height: 100%;
  background-color: #b69d57;
  width: ${props => props.width};
  transition: width 0.8s cubic-bezier(0.25, 0.46, 0.45, 0.94);
  background-image: linear-gradient(90deg, #b69d57, #c9b06a);
  box-shadow: 0 0 3px rgba(182, 157, 87, 0.5);
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      rgba(255, 255, 255, 0) 0%,
      rgba(255, 255, 255, 0.3) 50%,
      rgba(255, 255, 255, 0) 100%
    );
    animation: shimmer 1.5s infinite;
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const NextUpText = styled.div`
  font-size: 0.9rem;
  color: #b69d57;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-top: 15px;
  margin-bottom: 5px;
  position: relative;
  padding: 0 10px;
  display: inline-block;
  animation: fadeIn 0.8s ease-out;
  
  &::before, &::after {
    content: '';
    position: absolute;
    top: 50%;
    width: 15px;
    height: 1px;
    background-color: rgba(182, 157, 87, 0.4);
  }
  
  &::before {
    left: -10px;
  }
  
  &::after {
    right: -10px;
  }
`;

const SectionTitle = styled.h2`
  font-size: 2rem;
  color: #28211e;
  margin: 0 0 15px 0;
  font-weight: bold;
  position: relative;
  animation: fadeIn 0.9s ease-out, slideUp 0.7s ease-out;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -8px;
    left: 50%;
    width: 40px;
    height: 3px;
    background: #b69d57;
    transform: translateX(-50%);
    border-radius: 2px;
    opacity: 0.8;
  }
`;

const SectionDescription = styled.p`
  font-size: 1rem;
  color: #555;
  margin-bottom: 20px;
  line-height: 1.5;
  max-width: 380px;
  animation: fadeIn 1s ease-out;
  
  strong {
    color: #333;
    font-weight: 600;
  }
`;

const IllustrationContainer = styled.div`
  width: 100%;
  max-width: 220px;
  margin: 0 auto 30px auto;
  position: relative;
  animation: fadeIn 0.8s ease-out;
`;

const Illustration = styled.img`
  width: 100%;
  height: auto;
  border-radius: 50%;
  object-fit: cover;
  box-shadow: 0 6px 20px rgba(85, 42, 71, 0.15);
  animation: pulseEffect 3s infinite ease-in-out alternate;
  
  @keyframes pulseEffect {
    from { transform: scale(1); box-shadow: 0 6px 20px rgba(85, 42, 71, 0.15); }
    to { transform: scale(1.03); box-shadow: 0 8px 25px rgba(85, 42, 71, 0.25); }
  }
`;

const StartButton = styled.button`
  background: #b69d57;
  background-image: linear-gradient(to right, #b69d57, #c9b06a);
  color: #fff;
  border: none;
  border-radius: 28px;
  padding: 16px 0;
  width: 100%;
  max-width: 280px;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-top: 20px;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  box-shadow: 0 4px 12px rgba(182, 157, 87, 0.2);
  position: relative;
  overflow: hidden;
  animation: fadeIn 1.1s ease-out;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: all 0.6s;
  }
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(182, 157, 87, 0.3);
    
    &:before {
      left: 100%;
    }
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 2px 8px rgba(182, 157, 87, 0.2);
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
  padding: 8px;
  line-height: 1;
  display: flex;
  align-items: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  animation: fadeIn 0.7s ease-out;
  
  &:hover {
    background-color: rgba(182, 157, 87, 0.1);
    transform: translateX(-2px);
  }
  
  &:active {
    background-color: rgba(182, 157, 87, 0.2);
  }
  
  &::before {
    content: '←';
    margin-right: 4px;
    font-size: 1.1em;
    transition: transform 0.2s ease;
  }
  
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
  padding: 8px 12px;
  border-radius: 16px;
  transition: all 0.2s ease;
  animation: fadeIn 0.7s ease-out;
  
  &:hover {
    background-color: rgba(182, 157, 87, 0.1);
    text-decoration: underline;
  }
  
  &:active {
    background-color: rgba(182, 157, 87, 0.2);
  }
  
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

interface SurveySectionScreenProps {
  logo?: string;
  color?: string;
  sectionTitle: string;
  sectionDescription: string;
  illustration?: string;
  progress: { current: number; total: number };
  onStart: () => void;
  onBack?: () => void;
  onSkip?: () => void;
}

const SurveySectionScreen: React.FC<SurveySectionScreenProps> = ({
  logo,
  color = '#b69d57',
  sectionTitle,
  sectionDescription,
  illustration,
  progress,
  onStart,
  onBack,
  onSkip
}) => {
  const progressPercentage = `${Math.round((progress.current / progress.total) * 100)}%`;
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  
  // Function to handle Continue button click
  const handleContinueClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('[SurveySectionScreen] Continue button clicked');
    
    try {
      // Call the onStart function if provided - this should navigate to the question screen
      if (typeof onStart === 'function') {
        console.log('[SurveySectionScreen] Calling onStart function');
        onStart();
      } else {
        console.log('[SurveySectionScreen] No onStart function provided');
      }
    } catch (error) {
      console.error('[SurveySectionScreen] Error handling continue click:', error);
    }
  };
  
  // Function to handle Back button click
  const handleBackClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('[SurveySectionScreen] Back button clicked');
    
    try {
      // Call the onBack function if provided
      if (typeof onBack === 'function') {
        console.log('[SurveySectionScreen] Calling onBack function');
        onBack();
      } else {
        console.log('[SurveySectionScreen] No onBack function provided');
      }
    } catch (error) {
      console.error('[SurveySectionScreen] Error handling back click:', error);
    }
  };
  
  // Function to handle Skip button click
  const handleSkipClick = (e: React.MouseEvent) => {
    e.preventDefault();
    console.log('[SurveySectionScreen] Skip button clicked');
    
    try {
      // Call the onSkip function if provided
      if (typeof onSkip === 'function') {
        console.log('[SurveySectionScreen] Calling onSkip function');
        onSkip();
      } else {
        console.log('[SurveySectionScreen] No onSkip function provided');
      }
    } catch (error) {
      console.error('[SurveySectionScreen] Error handling skip click:', error);
    }
  };

  // Format section description with highlighted keywords
  const formatDescription = (text: string) => {
    // Highlight key phrases by wrapping them in <strong> tags
    const keyPhrases = ['team works', 'collaboration', 'improvement', 'help us', 'understand'];
    let formattedText = text;
    
    keyPhrases.forEach(phrase => {
      formattedText = formattedText.replace(
        new RegExp(`(${phrase})`, 'gi'),
        '<strong>$1</strong>'
      );
    });
    
    return <span dangerouslySetInnerHTML={{ __html: formattedText }} />;
  };

  return (
    <Wrapper>
      <Card>
        {onBack && (
          <BackButton onClick={handleBackClick}>
            Back
          </BackButton>
        )}
        
        {onSkip && (
          <SkipButton onClick={handleSkipClick}>
            Skip
          </SkipButton>
        )}
        
        {logo && <Logo src={logo} alt="Survey logo" />}
        
        <ProgressBar>
          <ProgressFill width={progressPercentage} />
        </ProgressBar>
        
        <ProgressText>
          {progress.current} of {progress.total} complete and passed
        </ProgressText>
        
        <NextUpText>NEXT UP:</NextUpText>
        
        <SectionTitle>{sectionTitle}</SectionTitle>
        
        <SectionDescription>
          {formatDescription(sectionDescription)}
        </SectionDescription>
        
        {illustration ? (
          <IllustrationContainer>
            <Illustration src={illustration} alt={sectionTitle} />
          </IllustrationContainer>
        ) : (
          // Default illustration if none provided
          <IllustrationContainer>
            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
              <circle cx="60" cy="60" r="60" fill="#f9f6f2" />
              <path d="M85 45C85 63.2254 70.2254 78 52 78C33.7746 78 19 63.2254 19 45C19 26.7746 33.7746 12 52 12C70.2254 12 85 26.7746 85 45Z" fill="#b69d57" fillOpacity="0.1" />
              <path d="M60 50C65.5228 50 70 45.5228 70 40C70 34.4772 65.5228 30 60 30C54.4772 30 50 34.4772 50 40C50 45.5228 54.4772 50 60 50Z" fill="#b69d57" />
              <path d="M40 85C40 74.5066 48.9543 66 60 66C71.0457 66 80 74.5066 80 85C80 85.5523 79.5523 86 79 86H41C40.4477 86 40 85.5523 40 85Z" fill="#b69d57" />
            </svg>
          </IllustrationContainer>
        )}
        
        <StartButton onClick={handleContinueClick}>
          CONTINUE
        </StartButton>
      </Card>
    </Wrapper>
  );
};

export default SurveySectionScreen;
