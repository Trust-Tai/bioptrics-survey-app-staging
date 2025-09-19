import React, { memo } from 'react';
import ThankYouScreen from './ThankYouScreen';

interface ThankYouWrapperProps {
  logo?: string;
  totalResponses: number;
  unansweredQuestions: number;
  completionPercentage: number;
  timeTaken: string;
  onTakeAgain: () => void;
  color?: string;
}

/**
 * A stable wrapper component for ThankYouScreen that doesn't depend on survey state
 * This helps maintain consistent hook calls across renders
 */
const ThankYouWrapper = memo(({ 
  logo, 
  totalResponses, 
  unansweredQuestions, 
  completionPercentage, 
  timeTaken, 
  onTakeAgain, 
  color 
}: ThankYouWrapperProps) => {
  // Use stable references for all props to prevent re-renders
  return (
    <ThankYouScreen
      logo={logo}
      totalResponses={totalResponses}
      unansweredQuestions={unansweredQuestions}
      completionPercentage={completionPercentage}
      timeTaken={timeTaken}
      onTakeAgain={onTakeAgain}
      color={color}
    />
  );
});

export default ThankYouWrapper;
