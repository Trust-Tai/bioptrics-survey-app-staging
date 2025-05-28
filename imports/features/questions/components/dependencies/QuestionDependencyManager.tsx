import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiTrash2, FiArrowRight, FiCheck, FiX, FiInfo } from 'react-icons/fi';

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

const DependencyRow = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
  margin-bottom: 10px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const DependencyLabel = styled.div`
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

const DependencyCard = styled.div`
  background: #f9f9f9;
  border-radius: 8px;
  padding: 12px;
  margin-bottom: 10px;
  border-left: 3px solid #552a47;
  position: relative;
`;

const RemoveButton = styled.button`
  position: absolute;
  top: 8px;
  right: 8px;
  background: none;
  border: none;
  color: #999;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    color: #e74c3c;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: #f5f0f5;
  color: #552a47;
  border: 1px dashed #552a47;
  border-radius: 6px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  margin-top: 12px;
  
  &:hover {
    background: #e9dfe7;
  }
`;

const InfoBox = styled.div`
  background: #f8f4eb;
  border-left: 3px solid #f39c12;
  padding: 12px;
  margin-bottom: 16px;
  border-radius: 4px;
  
  svg {
    color: #f39c12;
    margin-right: 8px;
  }
`;

interface QuestionDependency {
  dependsOnQuestionId: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
  action: 'show' | 'hide' | 'require' | 'skip';
}

interface Question {
  id: string;
  text: string;
  type: string;
  sectionId?: string;
}

interface QuestionDependencyManagerProps {
  questionId: string;
  questionText: string;
  initialDependencies: QuestionDependency[];
  availableQuestions: Question[];
  onSave: (dependencies: QuestionDependency[]) => void;
  onCancel: () => void;
}

const QuestionDependencyManager: React.FC<QuestionDependencyManagerProps> = ({
  questionId,
  questionText,
  initialDependencies,
  availableQuestions,
  onSave,
  onCancel
}) => {
  const [dependencies, setDependencies] = useState<QuestionDependency[]>(initialDependencies || []);
  
  // Filter out the current question from available questions
  const filteredQuestions = availableQuestions.filter(q => q.id !== questionId);
  
  const handleAddDependency = () => {
    if (filteredQuestions.length === 0) return;
    
    const newDependency: QuestionDependency = {
      dependsOnQuestionId: filteredQuestions[0].id,
      condition: 'equals',
      value: '',
      action: 'show'
    };
    
    setDependencies([...dependencies, newDependency]);
  };
  
  const handleRemoveDependency = (index: number) => {
    const newDependencies = [...dependencies];
    newDependencies.splice(index, 1);
    setDependencies(newDependencies);
  };
  
  const handleDependencyChange = (index: number, field: keyof QuestionDependency, value: any) => {
    const newDependencies = [...dependencies];
    newDependencies[index] = {
      ...newDependencies[index],
      [field]: value
    };
    setDependencies(newDependencies);
  };
  
  const handleSave = () => {
    onSave(dependencies);
  };
  
  // Get question text by ID
  const getQuestionText = (questionId: string) => {
    const question = availableQuestions.find(q => q.id === questionId);
    if (!question) return 'Unknown Question';
    
    return question.text.length > 50 
      ? `${question.text.substring(0, 50)}...` 
      : question.text;
  };
  
  return (
    <Container>
      <Title>Question Dependencies</Title>
      
      <InfoText>
        Configure when this question should be shown, hidden, required, or skipped based on responses to other questions.
      </InfoText>
      
      <InfoBox>
        <div style={{ display: 'flex', alignItems: 'flex-start' }}>
          <FiInfo size={18} style={{ marginTop: '2px' }} />
          <div>
            <strong>Current Question:</strong> {questionText}
          </div>
        </div>
      </InfoBox>
      
      {dependencies.length === 0 ? (
        <InfoText>
          This question has no dependencies. It will always be shown to respondents.
        </InfoText>
      ) : (
        dependencies.map((dependency, index) => (
          <DependencyCard key={index}>
            <RemoveButton onClick={() => handleRemoveDependency(index)}>
              <FiTrash2 size={16} />
            </RemoveButton>
            
            <DependencyRow>
              <DependencyLabel>When question:</DependencyLabel>
              <Select
                value={dependency.dependsOnQuestionId}
                onChange={(e) => handleDependencyChange(index, 'dependsOnQuestionId', e.target.value)}
              >
                {filteredQuestions.map(question => (
                  <option key={question.id} value={question.id}>
                    {getQuestionText(question.id)}
                  </option>
                ))}
              </Select>
            </DependencyRow>
            
            <DependencyRow>
              <DependencyLabel>Condition:</DependencyLabel>
              <Select
                value={dependency.condition}
                onChange={(e) => handleDependencyChange(
                  index, 
                  'condition', 
                  e.target.value as QuestionDependency['condition']
                )}
              >
                <option value="equals">Equals</option>
                <option value="notEquals">Does not equal</option>
                <option value="contains">Contains</option>
                <option value="greaterThan">Greater than</option>
                <option value="lessThan">Less than</option>
              </Select>
            </DependencyRow>
            
            <DependencyRow>
              <DependencyLabel>Value:</DependencyLabel>
              <Input
                type="text"
                value={dependency.value}
                onChange={(e) => handleDependencyChange(index, 'value', e.target.value)}
                placeholder="Enter the value to compare against"
              />
            </DependencyRow>
            
            <DependencyRow>
              <DependencyLabel>Action:</DependencyLabel>
              <Select
                value={dependency.action}
                onChange={(e) => handleDependencyChange(
                  index, 
                  'action', 
                  e.target.value as QuestionDependency['action']
                )}
              >
                <option value="show">Show this question</option>
                <option value="hide">Hide this question</option>
                <option value="require">Make this question required</option>
                <option value="skip">Skip to next section</option>
              </Select>
            </DependencyRow>
          </DependencyCard>
        ))
      )}
      
      <AddButton onClick={handleAddDependency}>
        <FiPlus size={16} />
        Add Dependency Rule
      </AddButton>
      
      <InfoText style={{ marginTop: '16px' }}>
        <strong>Note:</strong> If multiple dependency rules are defined, all conditions must be met for the action to be applied.
        For more complex logic, consider using separate questions with individual dependencies.
      </InfoText>
      
      <ButtonGroup>
        <Button onClick={onCancel}>Cancel</Button>
        <Button primary onClick={handleSave}>
          <FiCheck size={16} />
          Save Dependencies
        </Button>
      </ButtonGroup>
    </Container>
  );
};

export default QuestionDependencyManager;
