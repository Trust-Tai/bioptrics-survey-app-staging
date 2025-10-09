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
  allowRetake?: boolean;
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
  color,
  allowRetake = true // Default to true for backward compatibility
}: ThankYouWrapperProps) => {
  const DefaultLogo = "/TeamsynerG.png";
  const mainLogo = logo || DefaultLogo;
  // Use stable references for all props to prevent re-renders
  return (
    <ThankYouScreen
      logo={mainLogo}
      totalResponses={totalResponses}
      unansweredQuestions={unansweredQuestions}
      completionPercentage={completionPercentage}
      timeTaken={timeTaken}
      onTakeAgain={onTakeAgain}
      color={color}
      allowRetake={allowRetake}
    />
  );
});

export default ThankYouWrapper;
