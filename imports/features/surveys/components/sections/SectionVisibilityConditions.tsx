import React, { useState } from 'react';
import styled from 'styled-components';
import { FiInfo, FiPlus, FiTrash2 } from 'react-icons/fi';
import { SurveySectionItem, VisibilityCondition } from '/imports/features/surveys/types/index';

const Container = styled.div`
  margin-bottom: 24px;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
`;

const FormLabel = styled.label`
  display: block;
  font-weight: 500;
  margin-bottom: 8px;
  color: #333;
`;

const FormSelect = styled.select`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const FormInput = styled.input`
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const InfoBox = styled.div`
  background: #f9f4f8;
  border: 1px solid #e5d6c7;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #666;
  display: flex;
  align-items: flex-start;
  gap: 12px;
`;

const Button = styled.button<{ primary?: boolean }>`
  padding: 10px 16px;
  background: ${props => props.primary ? '#552a47' : '#f5f5f5'};
  color: ${props => props.primary ? '#fff' : '#333'};
  border: 1px solid ${props => props.primary ? '#552a47' : '#ddd'};
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: ${props => props.primary ? '#6b3659' : '#eee'};
  }
`;

// Using the VisibilityCondition interface from shared types

interface SectionVisibilityConditionsProps {
  sections: SurveySectionItem[];
  condition?: VisibilityCondition;
  onChange: (condition: VisibilityCondition | undefined) => void;
}

export const SectionVisibilityConditions: React.FC<SectionVisibilityConditionsProps> = ({
  sections,
  condition,
  onChange
}) => {
  const [hasCondition, setHasCondition] = useState(!!condition);
  
  const handleToggleCondition = () => {
    if (hasCondition) {
      setHasCondition(false);
      onChange(undefined);
    } else {
      setHasCondition(true);
      onChange({
        dependsOnSectionId: '',
        condition: 'equals',
        value: ''
      });
    }
  };
  
  const handleConditionChange = (field: keyof VisibilityCondition, value: any) => {
    if (!condition) return;
    
    const updatedCondition = { ...condition, [field]: value };
    onChange(updatedCondition);
  };
  
  return (
    <Container>
      <InfoBox>
        <FiInfo size={18} style={{ marginTop: 2 }} />
        <div>
          <p>Visibility conditions determine when this section will be shown to respondents.</p>
          <p style={{ marginTop: 8 }}>If no conditions are set, the section will always be visible.</p>
        </div>
      </InfoBox>
      
      <Button 
        onClick={handleToggleCondition}
        style={{ marginBottom: 16 }}
      >
        {hasCondition ? (
          <>
            <FiTrash2 size={16} />
            Remove Condition
          </>
        ) : (
          <>
            <FiPlus size={16} />
            Add Visibility Condition
          </>
        )}
      </Button>
      
      {hasCondition && condition && (
        <>
          <FormGroup>
            <FormLabel>Depends on Section</FormLabel>
            <FormSelect
              value={condition.dependsOnSectionId || ''}
              onChange={e => handleConditionChange('dependsOnSectionId', e.target.value)}
            >
              <option value="">Select a section</option>
              {sections
                .filter(s => s.isActive)
                .map(section => (
                  <option key={section.id} value={section.id}>
                    {section.name}
                  </option>
                ))
              }
            </FormSelect>
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Condition</FormLabel>
            <FormSelect
              value={condition.condition}
              onChange={e => handleConditionChange('condition', e.target.value)}
            >
              <option value="equals">Equals</option>
              <option value="notEquals">Not Equals</option>
              <option value="contains">Contains</option>
              <option value="greaterThan">Greater Than</option>
              <option value="lessThan">Less Than</option>
            </FormSelect>
          </FormGroup>
          
          <FormGroup>
            <FormLabel>Value</FormLabel>
            <FormInput
              type="text"
              value={condition.value || ''}
              onChange={e => handleConditionChange('value', e.target.value)}
              placeholder="Enter value to compare against"
            />
          </FormGroup>
        </>
      )}
    </Container>
  );
};

export default SectionVisibilityConditions;
