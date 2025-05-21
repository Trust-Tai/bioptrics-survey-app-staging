import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiArrowRight, FiPlus, FiTrash2, FiInfo } from 'react-icons/fi';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';

import { Questions } from '../../../api/questions';
import { BranchingRule } from '../types/surveyTypes';

interface BranchingLogicStepProps {
  questions: string[];
  branching: BranchingRule[];
  onBranchingChange: (branching: BranchingRule[]) => void;
}

// Styled components
const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const InfoBox = styled.div`
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  margin-bottom: 24px;
  display: flex;
  gap: 12px;
  align-items: flex-start;
`;

const InfoIcon = styled.div`
  color: #b7a36a;
  font-size: 20px;
  margin-top: 2px;
`;

const InfoContent = styled.div`
  flex: 1;
`;

const InfoTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0 0 8px 0;
`;

const InfoText = styled.p`
  font-size: 14px;
  color: #4a5568;
  margin: 0;
`;

const BranchingRulesContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const BranchingRule = styled.div`
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  gap: 16px;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const RuleSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #1c1c1c;
  font-size: 14px;
  min-width: 200px;
  
  &:focus {
    outline: none;
    border-color: #b7a36a;
  }
`;

const RuleInput = styled.input`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #1c1c1c;
  font-size: 14px;
  width: 100px;
  
  &:focus {
    outline: none;
    border-color: #b7a36a;
  }
`;

const ConditionSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  color: #1c1c1c;
  font-size: 14px;
  width: 150px;
  
  &:focus {
    outline: none;
    border-color: #b7a36a;
  }
`;

const ArrowIcon = styled.div`
  color: #b7a36a;
  font-size: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const DeleteButton = styled.button`
  background: none;
  border: none;
  color: #e53e3e;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px;
  margin-left: auto;
  
  &:hover {
    color: #c53030;
  }
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: white;
  border: 1px dashed #b7a36a;
  color: #b7a36a;
  border-radius: 8px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  margin-top: 8px;
  width: 100%;
  justify-content: center;
  
  &:hover {
    background: #f8fafc;
  }
`;

const Label = styled.label`
  font-size: 14px;
  font-weight: 500;
  color: #4a5568;
  min-width: 80px;
`;

const BranchingLogicStep: React.FC<BranchingLogicStepProps> = ({ questions, branching, onBranchingChange }) => {
  // Use a local state for branching rules
  const [branchingRules, setBranchingRules] = useState<BranchingRule[]>(branching || []);
  
  // Fetch question data to get their text
  const questionData = useTracker(() => {
    const subscription = Meteor.subscribe('questions.all');
    if (!subscription.ready()) {
      return [];
    }
    
    return Questions.find({
      _id: { $in: questions }
    }).fetch();
  }, [questions]);
  
  // When branching rules change, propagate to parent
  useEffect(() => {
    onBranchingChange(branchingRules);
  }, [branchingRules, onBranchingChange]);
  
  // Get question text by ID
  const getQuestionText = (id: string) => {
    const question = questionData.find(q => q._id === id);
    if (!question || !question.versions || question.versions.length === 0) {
      return 'Unknown Question';
    }
    return question.versions[question.versions.length - 1].questionText;
  };
  
  // Add a new branching rule
  const addBranchingRule = () => {
    if (questions.length < 2) {
      alert('You need at least 2 questions to create branching logic.');
      return;
    }
    
    setBranchingRules([
      ...branchingRules,
      {
        questionId: questions[0],
        condition: 'equals',
        value: '',
        nextQuestionId: questions[1]
      }
    ]);
  };
  
  // Update a branching rule
  const updateBranchingRule = (index: number, field: keyof BranchingRule, value: any) => {
    const updatedRules = [...branchingRules];
    updatedRules[index] = {
      ...updatedRules[index],
      [field]: value
    };
    setBranchingRules(updatedRules);
  };
  
  // Delete a branching rule
  const deleteBranchingRule = (index: number) => {
    const updatedRules = branchingRules.filter((_, i) => i !== index);
    setBranchingRules(updatedRules);
  };
  
  return (
    <Container>
      <InfoBox>
        <InfoIcon>
          <FiInfo />
        </InfoIcon>
        <InfoContent>
          <InfoTitle>About Branching Logic</InfoTitle>
          <InfoText>
            Branching logic allows you to customize the survey flow based on participants' responses. 
            Create conditions that determine which question comes next based on the answer to a question.
          </InfoText>
        </InfoContent>
      </InfoBox>
      
      <BranchingRulesContainer>
        {branchingRules.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#718096', padding: '24px' }}>
            No branching rules defined yet. Click 'Add Branching Rule' to create one.
          </div>
        ) : (
          branchingRules.map((rule, index) => (
            <BranchingRule key={`rule-${index}`}>
              <Label>If Question:</Label>
              <RuleSelect 
                value={rule.questionId}
                onChange={(e) => updateBranchingRule(index, 'questionId', e.target.value)}
              >
                {questions.map((q) => (
                  <option key={q} value={q}>
                    {getQuestionText(q).substring(0, 40)}
                    {getQuestionText(q).length > 40 ? '...' : ''}
                  </option>
                ))}
              </RuleSelect>
              
              <Label>Condition:</Label>
              <ConditionSelect
                value={rule.condition}
                onChange={(e) => updateBranchingRule(index, 'condition', e.target.value)}
              >
                <option value="equals">Equals</option>
                <option value="greaterThan">Greater Than</option>
                <option value="lessThan">Less Than</option>
                <option value="contains">Contains</option>
              </ConditionSelect>
              
              <Label>Value:</Label>
              <RuleInput 
                type="text" 
                value={rule.value}
                onChange={(e) => updateBranchingRule(index, 'value', e.target.value)}
                placeholder="Input value"
              />
              
              <ArrowIcon>
                <FiArrowRight />
              </ArrowIcon>
              
              <Label>Then Go To:</Label>
              <RuleSelect 
                value={rule.nextQuestionId}
                onChange={(e) => updateBranchingRule(index, 'nextQuestionId', e.target.value)}
              >
                {questions.map((q) => (
                  <option key={q} value={q}>
                    {getQuestionText(q).substring(0, 40)}
                    {getQuestionText(q).length > 40 ? '...' : ''}
                  </option>
                ))}
              </RuleSelect>
              
              <DeleteButton onClick={() => deleteBranchingRule(index)}>
                <FiTrash2 />
              </DeleteButton>
            </BranchingRule>
          ))
        )}
        
        <AddButton onClick={addBranchingRule}>
          <FiPlus />
          Add Branching Rule
        </AddButton>
      </BranchingRulesContainer>
    </Container>
  );
};

export default BranchingLogicStep;
