import React from 'react';
import styled from 'styled-components';
import { FiClock } from 'react-icons/fi';
import { useTimer } from '../contexts/TimerContext';

interface HeaderBarProps {
  surveyTitle?: string;
  averageTime?: string;
  logo?: string;
  progress?: number; // Add progress prop
  color?: string; // Add color prop for consistent styling
}

const HeaderBar: React.FC<HeaderBarProps> = ({ surveyTitle, averageTime, logo, progress = 0, color = '#552A47' }) => {
  // Get timer state from context
  const { isRunning, elapsedTime } = useTimer();
  
  // Log props for debugging
  console.log('[HeaderBar] Rendering with props:', { surveyTitle, averageTime, logo, progress, color, isRunning, elapsedTime });
  // Use the logo from the public folder
  const DefaultLogo = "/TeamsynerG.png"; // This logo already exists in your public folder
  // Use memo for stable rendering
  const timerDisplay = React.useMemo(() => {
    if (isRunning || elapsedTime !== '00:00') {
      return (
        <TimerRunningTag>
          <ClockIcon />
          <span>{elapsedTime}</span>
        </TimerRunningTag>
      );
    }
    return null;
  }, [isRunning, elapsedTime]);
  
  const averageTimeDisplay = React.useMemo(() => {
    if (averageTime) {
      // Format the time for display
      let displayTime = averageTime;
      
      // If it's in MM:SS format, convert to "X min" format
      if (averageTime.includes(':')) {
        const [minutes, seconds] = averageTime.split(':');
        const mins = parseInt(minutes, 10);
        const secs = parseInt(seconds, 10);
        
        if (mins === 0) {
          // Less than a minute
          displayTime = `${secs} sec`;
        } else if (secs === 0) {
          // Exact minutes
          displayTime = `${mins} min`;
        } else {
          // Minutes and seconds
          displayTime = `${mins}:${seconds} min`;
        }
      }
      
      console.log('[HeaderBar] Displaying average time:', { original: averageTime, formatted: displayTime });
      
      return (
        <AverageTimeTag>
          <ClockIcon />
          <span>{displayTime}</span>
        </AverageTimeTag>
      );
    }
    return null;
  }, [averageTime]);
  
  return (
    <HeaderContainer>
      <LeftSection>
        {logo ? (
          <LogoImage src={logo} alt="Logo" />
        ) : DefaultLogo ? (
          <LogoImage src={DefaultLogo} alt="Logo" />
        ):(
          <LogoText>TeamsynerG</LogoText>
        )}
      </LeftSection>
      <CenterSection>
        <SurveyTitleContainer>
          <SurveyTitleText as="h1">{surveyTitle || 'Survey'}</SurveyTitleText>
          {timerDisplay}
          {averageTimeDisplay}
        </SurveyTitleContainer>
      </CenterSection>
      <RightSection>
        {/* Right section can remain empty or be used for other elements in the future */}
      </RightSection>
      
      {/* Progress bar */}
      <HeaderProgressContainer>
        <HeaderProgressBar>
          <HeaderProgressIndicator width={progress} color={color} />
        </HeaderProgressBar>
        <HeaderProgressText>{progress}% Completed</HeaderProgressText>
      </HeaderProgressContainer>
    </HeaderContainer>
  );
};

const HeaderContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px;
  background-color: #ffffff;
  border-bottom: 1px solid #e5e7eb;
  width: 100%;
  position: fixed;
  top: 0;
  right: 0;
  left: 0;
  z-index: 100;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  gap: 21px;
  height: 80px; /* Fixed height for header */
`;

const LeftSection = styled.div`
  display: flex;
  align-items: center;
  min-width: 180px;
`;

const CenterSection = styled.div`
  flex-grow: 1;
  display: flex;
  justify-content: center; /* Center the title */
  padding: 0;
`;

const RightSection = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-end;
  min-width: 100px;
`;

const LogoImage = styled.img`
  max-height: 36px;
  max-width: 140px;
  object-fit: contain;
`;

const LogoText = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: var(--primary-color, #552A47);
  font-family: var(--heading-font, 'Inter, sans-serif');
`;

const SurveyTitleContainer = styled.div`
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
`;

const SurveyTitleText = styled.h1`
  font-size: 28px;
  font-weight: 600;
  color: var(--primary-color, #552A47);
  margin: 0;
  padding: 0;
  font-family: var(--heading-font, 'Inter, sans-serif');
  text-align: left;
  line-height: 1.2;
  width: 100%;
`;

const AverageTimeTag = styled.div`
  background-color: var(--primary-color, #552A47);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 18px;
  color: #fff;
  margin-left: 55px;
  display: none;
  align-items: center;
  gap: 8px;
  font-weight: 700;
`;
const TimerRunningTag = styled.div`
  background-color: var(--primary-color, #552A47);
  border-radius: 20px;
  padding: 6px 14px;
  font-size: 18px;
  color: #fff;
  margin-left: 55px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 700;
`;

const ClockIcon = styled(FiClock)`
  font-size: 18px;
  color: #fff;
  font-weight: 700;
`;

const HeaderProgressContainer = styled.div`
  position: absolute;
  bottom: -2px; /* Position it at the bottom of the header */
  left: 0;
  width: 100%;
  padding: 0;
  z-index: 101; /* Ensure it's above other elements */
`;

const HeaderProgressBar = styled.div`
  height: 4px;
  background-color: rgba(0, 0, 0, 0.1);
  width: 100%;
  position: relative;
`;

const HeaderProgressIndicator = styled.div<{ width: number; color: string }>`
  height: 100%;
  width: ${props => props.width}%;
  background-color: ${props => props.color};
  transition: width 0.5s cubic-bezier(0.4, 0, 0.2, 1);
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(
      90deg,
      transparent,
      rgba(255, 255, 255, 0.3),
      transparent
    );
    animation: shimmer 2s infinite;
  }
  
  /* Add a visual indicator at the end of the progress bar */
  &::before {
    content: '';
    position: absolute;
    right: 0;
    top: 50%;
    transform: translate(50%, -50%);
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background-color: ${props => props.color};
    box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.7);
    display: ${props => (props.width > 0 && props.width < 100) ? 'block' : 'none'};
  }
  
  @keyframes shimmer {
    0% { transform: translateX(-100%); }
    100% { transform: translateX(100%); }
  }
`;

const HeaderProgressText = styled.div`
  position: absolute;
  right: 20px;
  bottom: -18px; /* Position it below the progress bar */
  font-size: 11px;
  color: #6b7280;
  background-color: rgba(255, 255, 255, 0.9);
  padding: 2px 6px;
  border-radius: 4px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
`;

export default HeaderBar;
