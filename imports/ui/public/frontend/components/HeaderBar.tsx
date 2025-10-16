import React from 'react';
import styled from 'styled-components';
import { FiClock } from 'react-icons/fi';
import { useTimer } from '../contexts/TimerContext';

// Helper function to generate encouraging progress messages
const getProgressMessage = (
  progress: number,
  completedQuestions?: number,
  totalQuestions?: number,
  completedSections?: number,
  totalSections?: number
): string => {
  // Mixed approach: Use encouraging percentage messages at key milestones
  if (completedQuestions !== undefined && totalQuestions !== undefined && totalQuestions > 0) {
    const remaining = totalQuestions - completedQuestions;
    
    // Completion messages
    if (remaining === 0) return "All done! 🎉";
    
    // Near completion - use encouraging messages
    if (progress >= 90) return "Almost there! 🏁";
    if (progress >= 75) return "You're nearly done!";
    
    // Specific question count messages for small remaining counts
    if (remaining === 1) return "Just 1 question left!";
    if (remaining <= 3) return `Only ${remaining} questions to go!`;
    
    // Mid-progress encouraging messages
    if (progress >= 60) return "Getting close to the end!";
    if (progress >= 50) return "More than halfway there!";
    if (progress >= 40) return "Halfway there!";
    if (progress >= 25) return "You're making great progress!";
    
    // Early progress - show question count for context
    if (progress > 0) return `You've completed ${completedQuestions} of ${totalQuestions} questions`;
  }
  
  // Section-based messages (fallback when no question data)
  if (completedSections !== undefined && totalSections !== undefined && totalSections > 0) {
    const remaining = totalSections - completedSections;
    if (remaining === 0) return "Survey complete! 🎉";
    if (remaining === 1) return "Final section!";
    return `${completedSections} of ${totalSections} sections done`;
  }
  
  // Pure percentage-based messages (final fallback)
  if (progress >= 90) return "Almost there! 🏁";
  if (progress >= 75) return "You're nearly done!";
  if (progress >= 60) return "Getting close to the end!";
  if (progress >= 50) return "More than halfway there!";
  if (progress >= 40) return "Halfway there!";
  if (progress >= 25) return "You're making great progress!";
  if (progress > 0) return "Great start! Keep going!";
  
  return "Let's get started!";
};

interface HeaderBarProps {
  surveyTitle?: string;
  averageTime?: string;
  logo?: string;
  progress?: number; // Progress percentage (0-100)
  color?: string; // Progress bar color
  // New props for enhanced progress display
  totalQuestions?: number;
  completedQuestions?: number;
  totalSections?: number;
  completedSections?: number;
  showProgressText?: boolean; // Allow hiding text entirely
  progressStyle?: 'percentage' | 'encouraging' | 'question-count' | 'visual-only';
}

const HeaderBar: React.FC<HeaderBarProps> = ({ 
  surveyTitle, 
  averageTime, 
  logo, 
  progress = 0, 
  color = '#552A47',
  totalQuestions,
  completedQuestions,
  totalSections,
  completedSections,
  showProgressText = true,
  progressStyle = 'encouraging'
}) => {
  // Get timer state from context
  const { isRunning, elapsedTime } = useTimer();
  
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
  
  // Generate progress message based on style and available data
  const progressMessage = React.useMemo(() => {
    if (!showProgressText || progressStyle === 'visual-only') return null;
    
    switch (progressStyle) {
      case 'percentage':
        return `${progress}% Completed`;
      case 'question-count':
        if (completedQuestions !== undefined && totalQuestions !== undefined && totalQuestions > 0) {
          return `${completedQuestions} of ${totalQuestions} questions`;
        }
        return `${progress}% Completed`;
      case 'encouraging':
      default:
        return getProgressMessage(progress, completedQuestions, totalQuestions, completedSections, totalSections);
    }
  }, [progress, completedQuestions, totalQuestions, completedSections, totalSections, showProgressText, progressStyle]);
  
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
        {progressMessage && (
          <HeaderProgressText progressStyle={progressStyle}>
            {progressMessage}
          </HeaderProgressText>
        )}
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

const HeaderProgressText = styled.div<{ progressStyle?: string }>`
  position: absolute;
  right: 20px;
  bottom: -18px; /* Position it below the progress bar */
  font-size: ${props => props.progressStyle === 'encouraging' ? '12px' : '11px'};
  font-weight: ${props => props.progressStyle === 'encouraging' ? '600' : '400'};
  color: ${props => {
    switch (props.progressStyle) {
      case 'encouraging':
        return '#059669'; /* Green for encouraging messages */
      case 'question-count':
        return '#3b82f6'; /* Blue for question count */
      default:
        return '#6b7280'; /* Gray for percentage */
    }
  }};
  background-color: rgba(255, 255, 255, 0.95);
  padding: ${props => props.progressStyle === 'encouraging' ? '4px 8px' : '2px 6px'};
  border-radius: 6px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  max-width: 250px;
  text-align: right;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  
  /* Add subtle animation for encouraging messages */
  ${props => props.progressStyle === 'encouraging' && `
    animation: subtle-pulse 3s ease-in-out infinite;
    
    @keyframes subtle-pulse {
      0%, 100% { transform: scale(1); }
      50% { transform: scale(1.02); }
    }
  `}
`;

export default HeaderBar;
