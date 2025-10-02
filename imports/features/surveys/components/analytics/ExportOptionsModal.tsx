import React, { useState } from 'react';
import styled from 'styled-components';
import { FiX } from 'react-icons/fi';

interface ExportOptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExport: (type: 'standard' | 'ranked') => void;
}

const ModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  width: 500px;
  max-width: 90%;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 20px;
  border-bottom: 1px solid #e2e8f0;
`;

const ModalTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #334155;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #64748b;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f1f5f9;
  }
`;

const ModalBody = styled.div`
  padding: 20px;
`;

const OptionGroup = styled.div`
  margin-bottom: 24px;
`;

const RadioOption = styled.div`
  display: flex;
  margin-bottom: 16px;
  align-items: flex-start;
`;

const RadioInput = styled.input`
  margin-top: 4px;
  margin-right: 12px;
`;

const OptionLabel = styled.label`
  display: flex;
  flex-direction: column;
`;

const OptionTitle = styled.span`
  font-weight: 500;
  font-size: 16px;
  color: #1e293b;
  margin-bottom: 4px;
`;

const OptionDescription = styled.span`
  font-size: 14px;
  color: #64748b;
`;

const ModalFooter = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 20px;
  border-top: 1px solid #e2e8f0;
`;

const CancelButton = styled.button`
  background-color: white;
  color: #64748b;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #f8fafc;
  }
`;

const ExportButton = styled.button`
  background-color: #552a47;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  
  &:hover {
    background-color: #46223b;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const ExportOptionsModal: React.FC<ExportOptionsModalProps> = ({ isOpen, onClose, onExport }) => {
  const [selectedType, setSelectedType] = useState<'standard' | 'ranked'>('standard');
  
  if (!isOpen) return null;
  
  return (
    <ModalOverlay onClick={onClose}>
      <ModalContent onClick={(e) => e.stopPropagation()}>
        <ModalHeader>
          <ModalTitle>Export Survey Analytics</ModalTitle>
          <CloseButton onClick={onClose}>
            <FiX size={20} />
          </CloseButton>
        </ModalHeader>
        
        <ModalBody>
          <OptionGroup>
            <RadioOption>
              <RadioInput 
                type="radio" 
                id="standard-report" 
                name="export-type" 
                value="standard"
                checked={selectedType === 'standard'}
                onChange={() => setSelectedType('standard')}
              />
              <OptionLabel htmlFor="standard-report">
                <OptionTitle>Standard Report</OptionTitle>
                <OptionDescription>
                  Questions in original order within survey sections
                </OptionDescription>
              </OptionLabel>
            </RadioOption>
            
            <RadioOption>
              <RadioInput 
                type="radio" 
                id="ranked-report" 
                name="export-type" 
                value="ranked"
                checked={selectedType === 'ranked'}
                onChange={() => setSelectedType('ranked')}
              />
              <OptionLabel htmlFor="ranked-report">
                <OptionTitle>Ranked Report</OptionTitle>
                <OptionDescription>
                  Questions sorted by response rates within each section (highest first)
                </OptionDescription>
              </OptionLabel>
            </RadioOption>
          </OptionGroup>
          
          {selectedType === 'ranked' && (
            <div style={{ backgroundColor: '#f8fafc', padding: '12px', borderRadius: '6px', marginBottom: '16px' }}>
              <p style={{ margin: '0 0 8px 0', fontWeight: '500', color: '#334155' }}>Ranking Criteria:</p>
              <ul style={{ margin: '0', paddingLeft: '20px', color: '#475569', fontSize: '14px' }}>
                <li>For Likert Scale questions: Positive Score = Agree % + Strongly Agree %</li>
                <li>For Radio questions: Positive Score = Highest Selected Option %</li>
                <li>Text/Freeform questions will appear at the bottom of each section</li>
              </ul>
            </div>
          )}
        </ModalBody>
        
        <ModalFooter>
          <CancelButton onClick={onClose}>Cancel</CancelButton>
          <ExportButton onClick={() => onExport(selectedType)}>Export PDF</ExportButton>
        </ModalFooter>
      </ModalContent>
    </ModalOverlay>
  );
};

export default ExportOptionsModal;
