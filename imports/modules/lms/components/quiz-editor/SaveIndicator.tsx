import React from 'react';
import { Check } from 'lucide-react';
import { SaveIndicator as StyledSaveIndicator } from '../../styles/quizEditor.styles';

interface SaveIndicatorProps {
  show: boolean;
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({ show }) => {
  return (
    <StyledSaveIndicator show={show}>
      <Check size={16} />
      Saved
    </StyledSaveIndicator>
  );
};
