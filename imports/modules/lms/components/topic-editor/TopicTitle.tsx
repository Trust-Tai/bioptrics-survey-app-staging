import React from 'react';
import { Edit2, Check, X } from 'lucide-react';
import {
  TitleSection,
  TitleDisplay,
  Title,
  EditButton,
  TitleInput,
  TitleActions,
  SaveButton,
  CancelButton,
} from '../../styles/topicEditor.styles';

interface TopicTitleProps {
  title: string;
  isEditing: boolean;
  editValue: string;
  onEditValueChange: (value: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const TopicTitle: React.FC<TopicTitleProps> = ({
  title,
  isEditing,
  editValue,
  onEditValueChange,
  onStartEdit,
  onSave,
  onCancel,
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onSave();
    } else if (e.key === 'Escape') {
      onCancel();
    }
  };

  return (
    <TitleSection>
      {isEditing ? (
        <div>
          <TitleInput
            type="text"
            value={editValue}
            onChange={e => onEditValueChange(e.target.value)}
            onKeyDown={handleKeyDown}
            autoFocus
          />
          <TitleActions>
            <SaveButton onClick={onSave}>
              <Check size={16} /> Save
            </SaveButton>
            <CancelButton onClick={onCancel}>
              <X size={16} /> Cancel
            </CancelButton>
          </TitleActions>
        </div>
      ) : (
        <TitleDisplay>
          <Title>{title}</Title>
          <EditButton onClick={onStartEdit} title="Edit title">
            <Edit2 size={20} />
          </EditButton>
        </TitleDisplay>
      )}
    </TitleSection>
  );
};
