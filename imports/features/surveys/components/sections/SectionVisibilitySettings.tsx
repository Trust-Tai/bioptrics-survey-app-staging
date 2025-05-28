import React, { useState } from 'react';
import styled from 'styled-components';
import { FiEye, FiEyeOff, FiArrowRight, FiCheck, FiX } from 'react-icons/fi';

// Styled components
const Container = styled.div`
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  margin-bottom: 20px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin: 0 0 16px 0;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const Label = styled.label`
  display: block;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  background-color: #fff;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
  margin-top: 20px;
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' | 'danger' }>`
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  background-color: ${props => {
    switch (props.variant) {
      case 'primary': return '#552a47';
      case 'secondary': return '#f5f5f5';
      case 'danger': return '#f8f8f8';
      default: return '#f5f5f5';
    }
  }};
  
  color: ${props => props.variant === 'primary' ? '#fff' : props.variant === 'danger' ? '#e53935' : '#333'};
  border: 1px solid ${props => props.variant === 'primary' ? '#552a47' : props.variant === 'danger' ? '#ffcdd2' : '#ddd'};
  
  &:hover {
    background-color: ${props => {
      switch (props.variant) {
        case 'primary': return '#3e1f34';
        case 'secondary': return '#e9e9e9';
        case 'danger': return '#ffebee';
        default: return '#e9e9e9';
      }
    }};
  }
`;

const ConditionalDisplay = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 10px;
  padding: 15px;
  background-color: #f9f9f9;
  border-radius: 6px;
  border-left: 4px solid #552a47;
`;

const IconWrapper = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background-color: #f0e6eb;
  color: #552a47;
`;

const ConditionalText = styled.div`
  flex: 1;
  font-size: 14px;
  color: #333;
`;

// Types
interface SectionVisibilityCondition {
  dependsOnSectionId?: string;
  dependsOnQuestionId?: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}

interface SectionVisibilitySettingsProps {
  sectionId: string;
  initialCondition?: SectionVisibilityCondition;
  availableSections: Array<{ id: string; name: string }>;
  availableQuestions: Array<{ id: string; text: string; sectionId?: string }>;
  onSave: (condition: SectionVisibilityCondition | null) => void;
  onCancel: () => void;
}

const SectionVisibilitySettings: React.FC<SectionVisibilitySettingsProps> = ({
  sectionId,
  initialCondition,
  availableSections,
  availableQuestions,
  onSave,
  onCancel
}) => {
  const [hasCondition, setHasCondition] = useState<boolean>(!!initialCondition);
  const [dependsOnSectionId, setDependsOnSectionId] = useState<string>(
    initialCondition?.dependsOnSectionId || ''
  );
  const [dependsOnQuestionId, setDependsOnQuestionId] = useState<string>(
    initialCondition?.dependsOnQuestionId || ''
  );
  const [condition, setCondition] = useState<SectionVisibilityCondition['condition']>(
    initialCondition?.condition || 'equals'
  );
  const [value, setValue] = useState<any>(initialCondition?.value || '');
  
  // Filter questions based on selected section
  const filteredQuestions = dependsOnSectionId 
    ? availableQuestions.filter(q => q.sectionId === dependsOnSectionId)
    : availableQuestions;
  
  // Get section and question names for display
  const getSelectedSectionName = () => {
    const section = availableSections.find(s => s.id === dependsOnSectionId);
    return section ? section.name : 'Unknown Section';
  };
  
  const getSelectedQuestionText = () => {
    const question = availableQuestions.find(q => q.id === dependsOnQuestionId);
    return question ? question.text : 'Unknown Question';
  };
  
  // Handle form submission
  const handleSave = () => {
    if (!hasCondition) {
      onSave(null);
      return;
    }
    
    if (!dependsOnSectionId || !dependsOnQuestionId || !condition || value === '') {
      // Show validation error
      alert('Please complete all fields');
      return;
    }
    
    const newCondition: SectionVisibilityCondition = {
      dependsOnSectionId,
      dependsOnQuestionId,
      condition,
      value
    };
    
    onSave(newCondition);
  };
  
  // Format condition for display
  const getConditionText = () => {
    const conditionMap: Record<SectionVisibilityCondition['condition'], string> = {
      equals: 'equals',
      notEquals: 'does not equal',
      contains: 'contains',
      greaterThan: 'is greater than',
      lessThan: 'is less than'
    };
    
    return `Show this section when the answer to "${getSelectedQuestionText()}" 
      in section "${getSelectedSectionName()}" ${conditionMap[condition]} "${value}"`;
  };
  
  return (
    <Container>
      <Title>Section Visibility Settings</Title>
      
      <FormGroup>
        <Label>Does this section have visibility conditions?</Label>
        <Select 
          value={hasCondition ? 'yes' : 'no'}
          onChange={e => setHasCondition(e.target.value === 'yes')}
        >
          <option value="no">No, always show this section</option>
          <option value="yes">Yes, show this section conditionally</option>
        </Select>
      </FormGroup>
      
      {hasCondition && (
        <>
          <FormGroup>
            <Label>Depends on section</Label>
            <Select 
              value={dependsOnSectionId}
              onChange={e => setDependsOnSectionId(e.target.value)}
            >
              <option value="">Select a section</option>
              {availableSections
                .filter(s => s.id !== sectionId) // Can't depend on itself
                .map(section => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))
              }
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Depends on question</Label>
            <Select 
              value={dependsOnQuestionId}
              onChange={e => setDependsOnQuestionId(e.target.value)}
              disabled={!dependsOnSectionId}
            >
              <option value="">Select a question</option>
              {filteredQuestions.map(question => (
                <option key={question.id} value={question.id}>
                  {question.text}
                </option>
              ))}
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Condition</Label>
            <Select 
              value={condition}
              onChange={e => setCondition(e.target.value as SectionVisibilityCondition['condition'])}
            >
              <option value="equals">Equals</option>
              <option value="notEquals">Does not equal</option>
              <option value="contains">Contains</option>
              <option value="greaterThan">Greater than</option>
              <option value="lessThan">Less than</option>
            </Select>
          </FormGroup>
          
          <FormGroup>
            <Label>Value</Label>
            <Input 
              type="text"
              value={value}
              onChange={e => setValue(e.target.value)}
              placeholder="Enter value"
            />
          </FormGroup>
          
          <ConditionalDisplay>
            <IconWrapper>
              <FiEye />
            </IconWrapper>
            <ConditionalText>
              {getConditionText()}
            </ConditionalText>
          </ConditionalDisplay>
        </>
      )}
      
      <ButtonGroup>
        <Button onClick={onCancel}>
          <FiX /> Cancel
        </Button>
        <Button variant="primary" onClick={handleSave}>
          <FiCheck /> Save Settings
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default SectionVisibilitySettings;
