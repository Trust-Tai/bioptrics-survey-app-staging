import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import { FaExclamationTriangle, FaArrowLeft, FaHome } from 'react-icons/fa';
import defaultConfig, { NotFoundConfig } from './NotFoundConfig';

// Styled components for the 404 page
const NotFoundContainer = styled.div<{ config: NotFoundConfig }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 2rem;
  background-color: ${props => props.config.backgroundColor};
  text-align: center;
  ${props => props.config.enableAnimation ? 'animation: fadeIn 0.5s ease-in-out;' : ''}
  
  @keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
  }
`;

const NotFoundContent = styled.div<{ config: NotFoundConfig }>`
  max-width: 600px;
  padding: 3rem;
  background-color: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.1);
  ${props => props.config.enableAnimation ? 'animation: slideUp 0.5s ease-out;' : ''}
  
  @keyframes slideUp {
    from { transform: translateY(30px); opacity: 0; }
    to { transform: translateY(0); opacity: 1; }
  }
`;

const NotFoundIcon = styled.div<{ config: NotFoundConfig }>`
  font-size: 5rem;
  color: ${props => props.config.primaryColor};
  margin-bottom: 1.5rem;
`;

const NotFoundTitle = styled.h1<{ config: NotFoundConfig }>`
  font-size: 2.5rem;
  margin-bottom: 1rem;
  color: ${props => props.config.textColor};
`;

const NotFoundMessage = styled.p<{ config: NotFoundConfig }>`
  font-size: 1.2rem;
  margin-bottom: 2rem;
  color: ${props => props.config.textColor};
  opacity: 0.8;
  line-height: 1.6;
`;

const ButtonContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 1rem;
  margin-top: 2rem;
`;

const Button = styled(Link)<{ config: NotFoundConfig; secondary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background-color: ${props => props.secondary ? 'transparent' : props.config.primaryColor};
  color: ${props => props.secondary ? props.config.primaryColor : 'white'};
  border-radius: 6px;
  text-decoration: none;
  font-weight: 500;
  transition: all 0.2s ease;
  border: ${props => props.secondary ? `2px solid ${props.config.primaryColor}` : 'none'};
  
  &:hover {
    background-color: ${props => props.secondary ? 'rgba(84, 42, 70, 0.1)' : props.config.secondaryColor};
    transform: translateY(-2px);
  }
`;

interface NotFoundPageProps {
  // These props allow for easy customization later
  config?: Partial<NotFoundConfig>;
  customButtons?: React.ReactNode;
}

const NotFoundPage: React.FC<NotFoundPageProps> = ({
  config: userConfig = {},
  customButtons
}) => {
  // Merge default config with user-provided config
  const config = { ...defaultConfig, ...userConfig };
  
  // Log page visit if logging is enabled
  React.useEffect(() => {
    if (config.enableLogging) {
      console.log('404 page visited:', window.location.pathname);
    }
  }, [config.enableLogging]);
  return (
    <NotFoundContainer config={config}>
      {config.customHeaderContent && (
        <div dangerouslySetInnerHTML={{ __html: config.customHeaderContent }} />
      )}
      
      <NotFoundContent config={config}>
        <NotFoundIcon config={config}>
          <FaExclamationTriangle />
        </NotFoundIcon>
        <NotFoundTitle config={config}>{config.title}</NotFoundTitle>
        <NotFoundMessage config={config}>{config.message}</NotFoundMessage>
        
        <ButtonContainer>
          {config.showBackButton && (
            <Button 
              to="#" 
              onClick={() => window.history.back()} 
              config={config} 
              secondary
            >
              <FaArrowLeft /> {config.backButtonText}
            </Button>
          )}
          
          {/* {config.showHomeButton && (
            <Button to={config.homeRoute} config={config}>
              <FaHome /> {config.homeButtonText}
            </Button>
          )} */}
          
          {customButtons}
        </ButtonContainer>
      </NotFoundContent>
      
      {config.customFooterContent && (
        <div dangerouslySetInnerHTML={{ __html: config.customFooterContent }} />
      )}
    </NotFoundContainer>
  );
};

export default NotFoundPage;
