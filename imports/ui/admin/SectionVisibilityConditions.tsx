import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiTrash2, FiInfo } from 'react-icons/fi';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Questions } from '/imports/api/questions';
import { SurveySectionItem } from './SurveySections';

// Styled components consistent with the existing UI
const Container = styled.div`
  margin-bottom: 16px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
`;

const Title = styled.h4`
  margin: 0;
  font-weight: 500;
  font-size: 16px;
  color: #552a47;
`;

const ConditionCard = styled.div`
  background: #f9f4f8;
  border: 1px solid #e5d6c7;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 12px;
`;

const FormGroup = styled.div`
  margin-bottom: 12px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
`;

const Select = styled.select`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  background-color: white;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #552a47;
  }
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
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;

const InfoBox = styled.div`
  background: #f0f9ff;
  border: 1px solid #d0e8ff;
  border-radius: 6px;
  padding: 12px;
  margin-bottom: 16px;
  font-size: 14px;
  color: #0066cc;
  display: flex;
  align-items: flex-start;
  gap: 8px;
`;

interface Question {
  _id: string;
  text: string;
  type: string;
}

interface VisibilityCondition {
  dependsOnSectionId?: string;
  dependsOnQuestionId?: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}

interface SectionVisibilityConditionsProps {
  sections: SurveySectionItem[];
  currentSectionId: string;
  visibilityCondition?: VisibilityCondition;
  onChange: (condition: VisibilityCondition | undefined) => void;
}

const SectionVisibilityConditions: React.FC<SectionVisibilityConditionsProps> = ({
  sections,
  currentSectionId,
  visibilityCondition,
  onChange
}) => {
  const [condition, setCondition] = useState<VisibilityCondition>(
    visibilityCondition || {
      condition: 'equals',
      value: ''
    }
  );
  
  const [hasCondition, setHasCondition] = useState<boolean>(!!visibilityCondition);
  
  // Get all questions from the database
  const { questions, isLoading } = useTracker(() => {
    const questionsSub = Meteor.subscribe('questions.all');
    const isLoading = !questionsSub.ready();
    
    if (isLoading) {
      return { questions: [], isLoading };
    }
    
    // Fetch questions and format them for the dropdown
    const questionsRaw = Questions.find({}).fetch();
    const questions = questionsRaw.map((q: any) => {
      const currentVersionIndex = q.versions.findIndex((v: any) => v.version === q.currentVersion);
      const currentVersion = q.versions[currentVersionIndex] || q.versions[q.versions.length - 1];
      
      return {
        _id: q._id,
        text: currentVersion.questionText,
        type: currentVersion.responseType
      };
    });
    
    return { questions, isLoading };
  }, []);
  
  // Filter out the current section from the sections list
  const availableSections = sections.filter(s => s.id !== currentSectionId);
  
  // Get questions that belong to the selected section
  const sectionQuestions = condition.dependsOnSectionId 
    ? questions.filter((q: Question) => {
        // In a real implementation, you would check if the question is assigned to the selected section
        // This is a placeholder - you'll need to implement the actual logic based on your data structure
        return true;
      })
    : [];
  
  // Handle toggling the condition on/off
  const handleToggleCondition = (enabled: boolean) => {
    setHasCondition(enabled);
    if (!enabled) {
      onChange(undefined);
    } else {
      onChange(condition);
    }
  };
  
  // Handle changes to the condition
  const handleConditionChange = (updatedCondition: Partial<VisibilityCondition>) => {
    const newCondition = { ...condition, ...updatedCondition };
    setCondition(newCondition);
    if (hasCondition) {
      onChange(newCondition);
    }
  };
  
  return (
    <Container>
      <Header>
        <Title>Visibility Conditions</Title>
      </Header>
      
      <InfoBox>
        <FiInfo size={18} />
        <div>
          Visibility conditions determine when this section will be shown to respondents based on their answers to previous questions.
        </div>
      </InfoBox>
      
      <FormGroup>
        <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          <input 
            type="checkbox" 
            checked={hasCondition} 
            onChange={(e) => handleToggleCondition(e.target.checked)}
            style={{ width: 18, height: 18 }}
          />
          <span>Enable visibility condition for this section</span>
        </label>
      </FormGroup>
      
      {hasCondition && (
        <ConditionCard>
          <FormGroup>
            <Label>Depends on Section</Label>
            <Select
              value={condition.dependsOnSectionId || ''}
              onChange={(e) => handleConditionChange({ dependsOnSectionId: e.target.value || undefined })}
            >
              <option value="">Select a section</option>
              {availableSections.map(section => (
                <option key={section.id} value={section.id}>
                  {section.name}
                </option>
              ))}
            </Select>
          </FormGroup>
          
          {condition.dependsOnSectionId && (
            <FormGroup>
              <Label>Depends on Question</Label>
              <Select
                value={condition.dependsOnQuestionId || ''}
                onChange={(e) => handleConditionChange({ dependsOnQuestionId: e.target.value || undefined })}
              >
                <option value="">Select a question</option>
                {sectionQuestions.map(question => (
                  <option key={question._id} value={question._id}>
                    {question.text}
                  </option>
                ))}
              </Select>
            </FormGroup>
          )}
          
          {condition.dependsOnQuestionId && (
            <>
              <FormGroup>
                <Label>Condition</Label>
                <Select
                  value={condition.condition}
                  onChange={(e) => handleConditionChange({ 
                    condition: e.target.value as 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan' 
                  })}
                >
                  <option value="equals">Equals</option>
                  <option value="notEquals">Not Equals</option>
                  <option value="contains">Contains</option>
                  <option value="greaterThan">Greater Than</option>
                  <option value="lessThan">Less Than</option>
                </Select>
              </FormGroup>
              
              <FormGroup>
                <Label>Value</Label>
                <Input
                  type="text"
                  value={condition.value || ''}
                  onChange={(e) => handleConditionChange({ value: e.target.value })}
                  placeholder="Enter the value to compare against"
                />
              </FormGroup>
            </>
          )}
        </ConditionCard>
      )}
    </Container>
  );
};

export default SectionVisibilityConditions;
