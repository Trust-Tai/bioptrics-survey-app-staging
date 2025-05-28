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
  margin-bottom: 6px;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: #fff;
`;

const Input = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
`;

const ToggleButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#552a47' : '#f5f5f5'};
  color: ${props => props.active ? '#fff' : '#333'};
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.active ? '#693658' : '#e5e5e5'};
  }
`;

const ConditionRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
`;

const ConditionLabel = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  min-width: 100px;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 20px;
  justify-content: flex-end;
`;

const Button = styled.button<{ primary?: boolean }>`
  background: ${props => props.primary ? '#552a47' : 'transparent'};
  color: ${props => props.primary ? 'white' : '#552a47'};
  border: ${props => props.primary ? 'none' : '1px solid #552a47'};
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.primary ? '#693658' : 'rgba(85, 42, 71, 0.1)'};
  }
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 16px 0;
  line-height: 1.5;
`;

const ConditionCard = styled.div`
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  border-left: 3px solid #552a47;
`;

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
  const [condition, setCondition] = useState<SectionVisibilityCondition>(
    initialCondition || {
      condition: 'equals',
      value: ''
    }
  );
  
  // Filter out the current section from available sections
  const filteredSections = availableSections.filter(section => section.id !== sectionId);
  
  // Get questions for the selected section
  const sectionQuestions = condition.dependsOnSectionId 
    ? availableQuestions.filter(q => q.sectionId === condition.dependsOnSectionId)
    : [];
  
  const handleSave = () => {
    if (hasCondition) {
      onSave(condition);
    } else {
      onSave(null);
    }
  };
  
  const handleConditionChange = (field: keyof SectionVisibilityCondition, value: any) => {
    setCondition(prev => {
      const updated = { ...prev, [field]: value };
      
      // If section changes, reset question
      if (field === 'dependsOnSectionId') {
        updated.dependsOnQuestionId = undefined;
      }
      
      return updated;
    });
  };
  
  return (
    <Container>
      <Title>Section Visibility Settings</Title>
      
      <InfoText>
        Configure when this section should be visible to respondents. You can make this section
        conditional on responses to questions in previous sections.
      </InfoText>
      
      <FormGroup>
        <ToggleButton 
          active={hasCondition} 
          onClick={() => setHasCondition(!hasCondition)}
        >
          {hasCondition ? (
            <>
              <FiEyeOff size={16} />
              Conditional Visibility
            </>
          ) : (
            <>
              <FiEye size={16} />
              Always Visible
            </>
          )}
        </ToggleButton>
      </FormGroup>
      
      {hasCondition && (
        <>
          <FormGroup>
            <Label>This section is visible when:</Label>
            
            <ConditionCard>
              <ConditionRow>
                <ConditionLabel>Depends on:</ConditionLabel>
                <Select
                  value={condition.dependsOnSectionId || ''}
                  onChange={(e) => handleConditionChange('dependsOnSectionId', e.target.value)}
                >
                  <option value="">Select a section</option>
                  {filteredSections.map(section => (
                    <option key={section.id} value={section.id}>
                      {section.name}
                    </option>
                  ))}
                </Select>
              </ConditionRow>
              
              {condition.dependsOnSectionId && (
                <ConditionRow>
                  <ConditionLabel>Question:</ConditionLabel>
                  <Select
                    value={condition.dependsOnQuestionId || ''}
                    onChange={(e) => handleConditionChange('dependsOnQuestionId', e.target.value)}
                  >
                    <option value="">Select a question</option>
                    {sectionQuestions.map(question => (
                      <option key={question.id} value={question.id}>
                        {question.text.length > 50 
                          ? `${question.text.substring(0, 50)}...` 
                          : question.text}
                      </option>
                    ))}
                  </Select>
                </ConditionRow>
              )}
              
              {condition.dependsOnQuestionId && (
                <>
                  <ConditionRow>
                    <ConditionLabel>Condition:</ConditionLabel>
                    <Select
                      value={condition.condition}
                      onChange={(e) => handleConditionChange(
                        'condition', 
                        e.target.value as SectionVisibilityCondition['condition']
                      )}
                    >
                      <option value="equals">Equals</option>
                      <option value="notEquals">Does not equal</option>
                      <option value="contains">Contains</option>
                      <option value="greaterThan">Greater than</option>
                      <option value="lessThan">Less than</option>
                    </Select>
                  </ConditionRow>
                  
                  <ConditionRow>
                    <ConditionLabel>Value:</ConditionLabel>
                    <Input
                      type="text"
                      value={condition.value}
                      onChange={(e) => handleConditionChange('value', e.target.value)}
                      placeholder="Enter the value to compare against"
                    />
                  </ConditionRow>
                </>
              )}
            </ConditionCard>
          </FormGroup>
          
          <InfoText>
            <strong>Note:</strong> If the condition is met, this section will be shown to the respondent.
            Otherwise, it will be hidden and skipped in the survey flow.
          </InfoText>
        </>
      )}
      
      <ButtonGroup>
        <Button onClick={onCancel}>Cancel</Button>
        <Button primary onClick={handleSave}>
          <FiCheck size={16} />
          Save Settings
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default SectionVisibilitySettings;
