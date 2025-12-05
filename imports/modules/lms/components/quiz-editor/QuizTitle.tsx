import React from 'react';
import { Edit2, FileQuestion, Clock, Award, RotateCcw } from 'lucide-react';
import {
  TitleSection,
  TitleDisplay,
  Title,
  EditButton,
  TitleInput,
  DescriptionTextarea,
  TitleActions,
  SaveButton,
  CancelButton,
  MetadataSection,
  MetadataItem,
} from '../../styles/quizEditor.styles';
import type { QuizDoc } from '../../api/quizzes';

interface QuizTitleProps {
  quiz?: QuizDoc;
  isEditing: boolean;
  editTitle: string;
  editDescription: string;
  onEditTitleChange: (value: string) => void;
  onEditDescriptionChange: (value: string) => void;
  onStartEdit: () => void;
  onSave: () => void;
  onCancel: () => void;
}

export const QuizTitle: React.FC<QuizTitleProps> = ({
  quiz,
  isEditing,
  editTitle,
  editDescription,
  onEditTitleChange,
  onEditDescriptionChange,
  onStartEdit,
  onSave,
  onCancel,
}) => {
  const questionCount = quiz?.questions?.length || 0;
  const totalPoints = quiz?.questions?.reduce((sum, q) => sum + (q.points || 0), 0) || 0;
  const timeLimit = quiz?.settings?.timeLimit || 30;
  const passingScore = quiz?.settings?.passingScore || 80;
  const maxAttempts = quiz?.settings?.maxAttempts || 3;

  return (
    <TitleSection>
      {isEditing ? (
        <>
          <TitleInput
            type="text"
            value={editTitle}
            onChange={(e) => onEditTitleChange(e.target.value)}
            placeholder="Quiz Title"
            autoFocus
          />
          <DescriptionTextarea
            value={editDescription}
            onChange={(e) => onEditDescriptionChange(e.target.value)}
            placeholder="Brief description of the quiz (optional)"
          />
          <TitleActions>
            <SaveButton onClick={onSave}>Save</SaveButton>
            <CancelButton onClick={onCancel}>Cancel</CancelButton>
          </TitleActions>
        </>
      ) : (
        <>
          <TitleDisplay>
            <Title>{quiz?.title || 'Untitled Quiz'}</Title>
            <EditButton onClick={onStartEdit} title="Edit title and description">
              <Edit2 size={18} />
            </EditButton>
          </TitleDisplay>
          
          {quiz?.description && (
            <p style={{ 
              margin: '8px 0 0 0', 
              fontSize: '14px', 
              color: '#6b7280',
              lineHeight: '1.6'
            }}>
              {quiz.description}
            </p>
          )}

          <MetadataSection>
            <MetadataItem>
              <FileQuestion size={16} />
              <span>{questionCount} Question{questionCount !== 1 ? 's' : ''}</span>
            </MetadataItem>
            
            <MetadataItem>
              <Clock size={16} />
              <span>{timeLimit} min</span>
            </MetadataItem>
            
            <MetadataItem>
              <Award size={16} />
              <span>{passingScore}% to pass</span>
            </MetadataItem>
            
            <MetadataItem>
              <RotateCcw size={16} />
              <span>{maxAttempts} attempt{maxAttempts !== 1 ? 's' : ''}</span>
            </MetadataItem>
            
            {totalPoints > 0 && (
              <MetadataItem>
                <span style={{ fontWeight: '500' }}>Total: {totalPoints} points</span>
              </MetadataItem>
            )}
          </MetadataSection>
        </>
      )}
    </TitleSection>
  );
};
