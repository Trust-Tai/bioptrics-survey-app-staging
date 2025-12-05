import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '../../../../ui/admin/dashboard/components/shared/Button';
import {
  EmptyState,
  EmptyStateTitle,
  EmptyStateText,
} from '../../styles/topicEditor.styles';

interface EmptyStateViewProps {
  onAddFirstBlock: () => void;
}

export const EmptyStateView: React.FC<EmptyStateViewProps> = ({ onAddFirstBlock }) => {
  return (
    <EmptyState>
      <EmptyStateTitle>Start Building Your Topic</EmptyStateTitle>
      <EmptyStateText>
        Add content blocks to create rich, engaging learning materials
      </EmptyStateText>
      <Button variant="primary" onClick={onAddFirstBlock}>
        <Plus size={18} /> Add Your First Block
      </Button>
    </EmptyState>
  );
};
