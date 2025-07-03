import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { useTracker } from 'meteor/react-meteor-data';
import { Layers, Layer } from '../../../api/layers';

// Styled components for the labels display
const LabelContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
`;

const LabelBadge = styled.span<{ color?: string }>`
  background-color: ${props => props.color || '#e2e8f0'};
  color: ${props => props.color ? '#ffffff' : '#4a5568'};
  font-size: 12px;
  padding: 2px 8px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
`;

interface QuestionLabelDisplayProps {
  labelIds: string[];
  showIds?: boolean;
}

/**
 * Component to display question labels by their names instead of IDs
 */
const QuestionLabelDisplay: React.FC<QuestionLabelDisplayProps> = ({ labelIds, showIds = false }) => {
  // Use Meteor's useTracker to reactively fetch labels
  const labels = useTracker(() => {
    if (!labelIds || !labelIds.length) return [];
    return Layers.find({ _id: { $in: labelIds } }).fetch();
  }, [labelIds]);

  if (!labels || labels.length === 0) {
    return null;
  }

  return (
    <LabelContainer>
      {labels.map((label) => (
        <LabelBadge 
          key={label._id} 
          color={label.color}
          title={showIds ? `${label.name} (${label._id})` : label.name}
        >
          {label.name}
        </LabelBadge>
      ))}
    </LabelContainer>
  );
};

export default QuestionLabelDisplay;
