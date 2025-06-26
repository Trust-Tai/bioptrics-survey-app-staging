import React from 'react';
import styled from 'styled-components';

const ButtonContainer = styled.div`
  display: flex;
  justify-content: center;
  margin: 20px 0;
`;

const StyledButton = styled.button`
  background-color: #a0cf4e;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #8bba3d;
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(160, 207, 78, 0.4);
  }
`;

interface ViewAllButtonProps {
  onClick: () => void;
}

const ViewAllButton: React.FC<ViewAllButtonProps> = ({ onClick }) => {
  return (
    <ButtonContainer>
      <StyledButton onClick={onClick}>
        View All Questions
      </StyledButton>
    </ButtonContainer>
  );
};

export default ViewAllButton;
