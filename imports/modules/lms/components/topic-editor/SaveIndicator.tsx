import React from 'react';
import { Check } from 'lucide-react';
import { SaveIndicator as SaveIndicatorStyled } from '../../styles/topicEditor.styles';

interface SaveIndicatorProps {
  show: boolean;
}

export const SaveIndicator: React.FC<SaveIndicatorProps> = ({ show }) => {
  return (
    <SaveIndicatorStyled show={show}>
      <Check size={18} />
      Saved
    </SaveIndicatorStyled>
  );
};
