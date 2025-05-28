import React, { useState } from 'react';
import styled from 'styled-components';
import { FiInfo, FiEdit2, FiCheck, FiX } from 'react-icons/fi';

// Styled components consistent with the existing UI
const Container = styled.div`
  margin-bottom: 20px;
  background: #f9f4f8;
  border: 1px solid #e5d6c7;
  border-radius: 10px;
  padding: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Title = styled.h4`
  margin: 0;
  font-weight: 600;
  font-size: 16px;
  color: #552a47;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const InstructionsContent = styled.div`
  font-size: 15px;
  line-height: 1.5;
  color: #333;
  white-space: pre-wrap;
`;

const InstructionsEditor = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 15px;
  line-height: 1.5;
  resize: vertical;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  justify-content: flex-end;
`;

const Button = styled.button<{ primary?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: ${props => props.primary ? '#552a47' : '#fff'};
  color: ${props => props.primary ? '#fff' : '#333'};
  border: 1px solid ${props => props.primary ? '#552a47' : '#ddd'};
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.primary ? '#3e1f34' : '#f5f5f5'};
  }
`;

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  color: #666;
`;

const Placeholder = styled.div`
  font-style: italic;
  color: #888;
  margin-bottom: 12px;
`;

interface SectionInstructionsProps {
  instructions?: string;
  isEditable: boolean;
  onSave: (instructions: string) => void;
}

const SectionInstructions: React.FC<SectionInstructionsProps> = ({
  instructions,
  isEditable,
  onSave
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedInstructions, setEditedInstructions] = useState(instructions || '');
  
  const handleEdit = () => {
    setEditedInstructions(instructions || '');
    setIsEditing(true);
  };
  
  const handleSave = () => {
    onSave(editedInstructions);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };
  
  return (
    <Container>
      <Header>
        <Title>
          <FiInfo size={18} />
          Section Instructions
        </Title>
        {isEditable && !isEditing && (
          <Button onClick={handleEdit}>
            <FiEdit2 size={14} />
            Edit
          </Button>
        )}
      </Header>
      
      {isEditing ? (
        <>
          <InstructionsEditor
            value={editedInstructions}
            onChange={(e) => setEditedInstructions(e.target.value)}
            placeholder="Enter instructions for this section. These will be displayed to respondents at the beginning of the section."
          />
          <ButtonGroup>
            <Button onClick={handleCancel}>
              <FiX size={14} />
              Cancel
            </Button>
            <Button primary onClick={handleSave}>
              <FiCheck size={14} />
              Save
            </Button>
          </ButtonGroup>
        </>
      ) : instructions ? (
        <InstructionsContent>
          {instructions}
        </InstructionsContent>
      ) : (
        <EmptyState>
          <Placeholder>No instructions have been added for this section.</Placeholder>
          {isEditable && (
            <Button onClick={handleEdit}>
              <FiEdit2 size={14} />
              Add Instructions
            </Button>
          )}
        </EmptyState>
      )}
    </Container>
  );
};

export default SectionInstructions;
