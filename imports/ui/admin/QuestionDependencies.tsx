import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPlus, FiTrash2, FiLink, FiInfo } from 'react-icons/fi';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Questions } from '/imports/api/questions';

// Styled components consistent with the existing UI
const Container = styled.div`
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
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

const DependencyCard = styled.div`
  background: #f9f4f8;
  border: 1px solid #e5d6c7;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 16px;
  position: relative;
`;

const FormGroup = styled.div`
  margin-bottom: 16px;
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

const DeleteButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  background: transparent;
  border: none;
  color: #666;
  cursor: pointer;
  padding: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 4px;
  
  &:hover {
    background: #f0f0f0;
    color: #d32f2f;
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

const EmptyState = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  text-align: center;
  color: #666;
  background: #f9f9f9;
  border-radius: 8px;
  border: 1px dashed #ddd;
`;

interface Question {
  _id: string;
  text: string;
  type: string;
}

interface QuestionDependency {
  questionId: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
}

interface QuestionDependenciesProps {
  currentQuestionId: string;
  sectionId?: string;
  dependencies: QuestionDependency[];
  onChange: (dependencies: QuestionDependency[]) => void;
}

const QuestionDependencies: React.FC<QuestionDependenciesProps> = ({
  currentQuestionId,
  sectionId,
  dependencies,
  onChange
}) => {
  const [localDependencies, setLocalDependencies] = useState<QuestionDependency[]>(dependencies || []);
  
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
    
    // Filter out the current question to prevent circular dependencies
    return { 
      questions: questions.filter(q => q._id !== currentQuestionId), 
      isLoading 
    };
  }, [currentQuestionId]);
  
  // Update parent component when dependencies change
  useEffect(() => {
    onChange(localDependencies);
  }, [localDependencies, onChange]);
  
  // Add a new dependency
  const handleAddDependency = () => {
    const newDependency: QuestionDependency = {
      questionId: '',
      condition: 'equals',
      value: ''
    };
    setLocalDependencies([...localDependencies, newDependency]);
  };
  
  // Remove a dependency
  const handleRemoveDependency = (index: number) => {
    const newDependencies = [...localDependencies];
    newDependencies.splice(index, 1);
    setLocalDependencies(newDependencies);
  };
  
  // Update a dependency
  const handleUpdateDependency = (index: number, field: keyof QuestionDependency, value: any) => {
    const newDependencies = [...localDependencies];
    newDependencies[index] = {
      ...newDependencies[index],
      [field]: value
    };
    setLocalDependencies(newDependencies);
  };
  
  return (
    <Container>
      <Header>
        <Title>
          <FiLink size={18} />
          Question Dependencies
        </Title>
        <Button onClick={handleAddDependency}>
          <FiPlus size={14} />
          Add Dependency
        </Button>
      </Header>
      
      <InfoBox>
        <FiInfo size={18} />
        <div>
          Dependencies determine when this question will be shown based on answers to other questions. 
          If multiple dependencies are set, all conditions must be met for the question to be displayed.
        </div>
      </InfoBox>
      
      {localDependencies.length === 0 ? (
        <EmptyState>
          <p>No dependencies have been added for this question.</p>
          <Button onClick={handleAddDependency}>
            <FiPlus size={14} />
            Add Dependency
          </Button>
        </EmptyState>
      ) : (
        localDependencies.map((dependency, index) => (
          <DependencyCard key={index}>
            <DeleteButton onClick={() => handleRemoveDependency(index)}>
              <FiTrash2 size={16} />
            </DeleteButton>
            
            <FormGroup>
              <Label>Depends on Question</Label>
              <Select
                value={dependency.questionId}
                onChange={(e) => handleUpdateDependency(index, 'questionId', e.target.value)}
              >
                <option value="">Select a question</option>
                {questions.map((question: Question) => (
                  <option key={question._id} value={question._id}>
                    {question.text}
                  </option>
                ))}
              </Select>
            </FormGroup>
            
            {dependency.questionId && (
              <>
                <FormGroup>
                  <Label>Condition</Label>
                  <Select
                    value={dependency.condition}
                    onChange={(e) => handleUpdateDependency(
                      index, 
                      'condition', 
                      e.target.value as 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan'
                    )}
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
                    value={dependency.value || ''}
                    onChange={(e) => handleUpdateDependency(index, 'value', e.target.value)}
                    placeholder="Enter the value to compare against"
                  />
                </FormGroup>
              </>
            )}
          </DependencyCard>
        ))
      )}
    </Container>
  );
};

export default QuestionDependencies;
