import React from 'react';
import {
  DeleteConfirmation as DeleteConfirmationStyled,
  DeleteDialog,
  DeleteTitle,
  DeleteText,
  DeleteActions,
  DeleteButton,
  CancelButton,
} from '../../styles/topicEditor.styles';

interface DeleteConfirmationProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export const DeleteConfirmation: React.FC<DeleteConfirmationProps> = ({
  isOpen,
  onConfirm,
  onCancel,
}) => {
  if (!isOpen) return null;

  return (
    <DeleteConfirmationStyled onClick={onCancel}>
      <DeleteDialog onClick={e => e.stopPropagation()}>
        <DeleteTitle>Delete Content Block?</DeleteTitle>
        <DeleteText>
          This action cannot be undone. The block and all its content will be permanently removed.
        </DeleteText>
        <DeleteActions>
          <CancelButton onClick={onCancel}>
            Cancel
          </CancelButton>
          <DeleteButton onClick={onConfirm}>
            Delete Block
          </DeleteButton>
        </DeleteActions>
      </DeleteDialog>
    </DeleteConfirmationStyled>
  );
};
