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

const ThankYouImage = styled.img`
  width: 180px;
  height: auto;
  margin-bottom: 24px;
  animation: fadeIn 1s ease-out;
`;

const Title = styled.h2`
  font-size: 1.8rem;
  font-weight: 800;
  color: #b69d57;
  text-align: center;
  margin-bottom: 16px;
  line-height: 1.3;
  animation: fadeIn 0.9s ease-out;
  font-family: 'Playfair Display', serif;
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
`;

const ViewResultsButton = styled.button<{ btncolor?: string }>`
  background: transparent;
  color: ${props => props.btncolor || '#b69d57'};
  border: 2px solid ${props => props.btncolor || '#b69d57'};
  border-radius: 28px;
  padding: 12px 24px;
  font-size: 0.9rem;
  font-weight: 600;
  letter-spacing: 0.05em;
  margin-bottom: 18px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 2px 6px rgba(182, 157, 87, 0.1);
  
  &:hover {
    background: ${props => props.btncolor || '#b69d57'};
    color: white;
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(182, 157, 87, 0.2);
  }
  
  &:active {
    transform: translateY(1px);
    box-shadow: 0 1px 4px rgba(182, 157, 87, 0.2);
  }
`;

const Footer = styled.div`
  font-size: 0.8rem;
  color: #8a7a85;
  text-align: center;
  margin-top: 24px;
  line-height: 1.4;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    margin-right: 6px;
    color: #8a7a85;
  }
`;

interface SurveyThankYouProps {
  logo?: string;
  color?: string;
  onViewResults?: () => void;
}

const SurveyThankYou: React.FC<SurveyThankYouProps> = ({ 
  logo = 'https://s28.q4cdn.com/380852864/files/design/logo.svg',
  color = '#b69d57',
  onViewResults
}) => {
  return (
    <Wrapper>
      <Card>
        <Logo src={logo} alt="Company Logo" />
        
        <ThankYouImage 
          src="/thank-you-script.svg" 
          alt="Thank You"
          onError={(e) => {
            // Fallback if SVG doesn't load
            const target = e.target as HTMLImageElement;
            target.onerror = null;
            target.style.fontFamily = "'Playfair Display', serif";
            target.style.fontSize = '42px';
            target.style.fontWeight = 'bold';
            target.style.color = color;
            target.style.textAlign = 'center';
            target.style.width = '100%';
            target.style.height = 'auto';
            target.style.marginBottom = '24px';
            target.alt = "Thank you";
          }}
        />
        
        <Description>
          Thank you for completing the survey! Your feedback is valuable in helping New Gold improve
          our workplace and safety culture. We appreciate your honesty and time.
        </Description>
        
        {onViewResults && (
          <ViewResultsButton 
            btncolor={color}
            onClick={onViewResults}
          >
            VIEW RESULTS
          </ViewResultsButton>
        )}
        
        <Footer>
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="m8.93 6.588-2.29.287-.082.38.45.083c.294.07.352.176.288.469l-.738 3.468c-.194.897.105 1.319.808 1.319.545 0 1.178-.252 1.465-.598l.088-.416c-.2.176-.492.246-.686.246-.275 0-.375-.193-.304-.533L8.93 6.588zM9 4.5a1 1 0 1 1-2 0 1 1 0 0 1 2 0z"/>
          </svg>
          All responses are anonymous and will be reviewed by our team to take action on what's working and what needs improvement.
        </Footer>
      </Card>
    </Wrapper>
  );
};

export default SurveyThankYou;
