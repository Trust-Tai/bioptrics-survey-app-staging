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
  max-width: 400px;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
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
    max-width: 440px;
  }
`;

const Logo = styled.img`
  width: 140px;
  margin-bottom: 22px;
  height: auto;
  animation: fadeIn 0.8s ease-out;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.1));
`;
const Illustration = styled.img`
  width: 110px;
  height: 110px;
  border-radius: 50%;
  background: #fffbea;
  object-fit: cover;
  margin-bottom: 22px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  animation: pulseEffect 2s infinite ease-in-out alternate, fadeIn 0.8s ease-out;
  transform-origin: center;
  
  @keyframes pulseEffect {
    from { transform: scale(1); box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05); }
    to { transform: scale(1.05); box-shadow: 0 4px 12px rgba(182, 157, 87, 0.15); }
  }
`;

const Title = styled.h1`
  font-size: 1.4rem;
  font-weight: 800;
  color: #28211e;
  text-align: center;
  margin-bottom: 16px;
  line-height: 1.3;
  animation: fadeIn 0.9s ease-out;
  position: relative;
  display: inline-block;
  
  &::after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    width: 40px;
    height: 3px;
    background: #b69d57;
    transform: translateX(-50%);
    border-radius: 2px;
    opacity: 0.8;
  }

  @media (min-width: 600px) {
    font-size: 1.6rem;
  }
`;

const Description = styled.p`
  color: #6e5a67;
  font-size: 1rem;
  text-align: center;
  margin-bottom: 28px;
  line-height: 1.5;
  max-width: 320px;
  animation: fadeIn 1s ease-out;
  letter-spacing: 0.01em;
  
  strong {
    color: #4a3e47;
    font-weight: 600;
  }
  
  @media (min-width: 600px) {
    font-size: 1.05rem;
    margin-bottom: 32px;
  }
`;

const StartButton = styled.button<{ btncolor?: string; disabled?: boolean }>`
  background: ${props => props.btncolor || '#b69d57'};
  background-image: linear-gradient(to right, ${props => props.btncolor || '#b69d57'}, ${props => props.btncolor ? `${props.btncolor}dd` : '#c9b06a'});
  color: #fff;
  border: none;
  border-radius: 28px;
  padding: 16px 0;
  width: 100%;
  font-size: 1.1rem;
  font-weight: 700;
  letter-spacing: 0.05em;
  margin-bottom: 18px;
  cursor: ${props => props.disabled ? 'not-allowed' : 'pointer'};
  transition: all 0.3s ease;
  opacity: ${props => props.disabled ? 0.7 : 1};
  box-shadow: 0 4px 12px rgba(182, 157, 87, 0.2);
  position: relative;
  overflow: hidden;
  
  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: all 0.6s;
    opacity: ${props => props.disabled ? 0 : 1};
  }
  
  &:hover {
    opacity: ${props => props.disabled ? 0.7 : 1};
    transform: ${props => props.disabled ? 'none' : 'translateY(-2px)'};
    box-shadow: ${props => props.disabled ? '0 4px 12px rgba(182, 157, 87, 0.2)' : '0 6px 16px rgba(182, 157, 87, 0.3)'};
    
    &:before {
      left: 100%;
    }
  }
  
  &:active {
    transform: ${props => props.disabled ? 'none' : 'translateY(1px)'};
    box-shadow: 0 2px 8px rgba(182, 157, 87, 0.2);
  }
`;

const Privacy = styled.div`
  font-size: 0.82rem;
  color: #8a7a85;
  text-align: center;
  margin-top: 8px;
  line-height: 1.4;
  
  a {
    color: #b69d57;
    text-decoration: none;
    font-weight: 500;
    transition: all 0.2s ease;
    
    &:hover {
      text-decoration: underline;
      color: #9c8548;
    }
  }
`;

interface SurveyWelcomeProps {
  survey?: {
    title: string;
    description: string;
    logo: string;
    illustration?: string;
    color?: string;
  };
  previewData?: {
    title: string;
    description: string;
    logo?: string;
    image?: string;
    color?: string;
  };
  onStart: () => void;
  loading?: boolean;
  disabled?: boolean;
}

const SurveyWelcome: React.FC<SurveyWelcomeProps> = (props) => {
  const { onStart, loading = false, disabled = false } = props;
  
  // Handle both prop structures (survey or previewData)
  const survey = props.survey || { title: '', description: '', logo: '' };
  const previewData = props.previewData || { title: '', description: '', logo: '', image: '', color: '' };
  
  // Determine which data source to use
  const title = survey?.title || previewData?.title || "Welcome to the Employee Survey";
  const description = survey?.description || previewData?.description || "Your feedback is important in helping us improve our workplace. This survey is anonymous and takes about 5-7 minutes to complete.";
  const logo = survey?.logo || previewData?.logo || "https://s28.q4cdn.com/380852864/files/design/logo.svg";
  const illustration = survey?.illustration || previewData?.image || "/illustration.png";
  const color = survey?.color || previewData?.color;
  
  const handleStart = (e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (typeof onStart === 'function') {
      onStart();
    } else {
      console.error('[SurveyWelcome] onStart is not a function:', onStart);
    }
  };

  return (
    <Wrapper className="survey-wrapper">
      <Card className="survey-card">
        {logo && <Logo src={logo} alt="Company Logo" />}
        
        {illustration && (
          <Illustration src={illustration} alt="Survey Illustration" />
        )}
        
        <Title className="survey-heading">{title}</Title>
        <Description className="survey-description">
          {previewData?.description ? (
            <span dangerouslySetInnerHTML={{ __html: description }} />
          ) : (
            <>{description}</>
          )}
        </Description>
        
        <StartButton 
          onClick={handleStart} 
          btncolor={color} 
          disabled={loading || disabled}
          type="button"
          className="survey-button"
        >
          {loading ? 'Loading...' : 'START SURVEY'}
        </StartButton>
        
        <Privacy>
          <span role="img" aria-label="info">ⓘ</span> Your responses are completely anonymous and cannot be traced back to you
        </Privacy>
      </Card>
    </Wrapper>
  );
};

export default SurveyWelcome;