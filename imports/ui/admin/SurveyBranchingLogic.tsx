import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { FiPlus, FiTrash2, FiArrowRight, FiCheck, FiX } from 'react-icons/fi';

// Styled components
const Container = styled.div`
  padding: 24px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const ToggleSwitch = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ToggleLabel = styled.span`
  font-size: 14px;
  color: #666;
`;

const Switch = styled.label`
  position: relative;
  display: inline-block;
  width: 48px;
  height: 24px;
`;

const SwitchInput = styled.input`
  opacity: 0;
  width: 0;
  height: 0;
  
  &:checked + span {
    background-color: #552a47;
  }
  
  &:checked + span:before {
    transform: translateX(24px);
  }
`;

const Slider = styled.span`
  position: absolute;
  cursor: pointer;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: #ccc;
  transition: .4s;
  border-radius: 24px;
  
  &:before {
    position: absolute;
    content: "";
    height: 18px;
    width: 18px;
    left: 3px;
    bottom: 3px;
    background-color: white;
    transition: .4s;
    border-radius: 50%;
  }
`;

const RulesList = styled.div`
  margin-top: 16px;
`;

const RuleItem = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  background: #f9f9f9;
  border-radius: 8px;
  margin-bottom: 12px;
  flex-wrap: wrap;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
  }
`;

const Select = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-width: 180px;
  background: white;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-size: 14px;
  min-width: 150px;
`;

const ArrowIcon = styled(FiArrowRight)`
  color: #666;
  flex-shrink: 0;
`;

const DeleteButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  width: 36px;
  height: 36px;
  cursor: pointer;
  transition: all 0.2s;
  margin-left: auto;
  
  &:hover {
    background: #ffebee;
    border-color: #ffcdd2;
    color: #e53935;
  }
`;

const AddRuleButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 16px;
  
  &:hover {
    background: #eee;
  }
`;

const SaveButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: #552a47;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-top: 24px;
  
  &:hover {
    background: #6b3659;
  }
`;

const NoQuestionsMessage = styled.div`
  padding: 24px;
  text-align: center;
  color: #666;
  background: #f9f9f9;
  border-radius: 8px;
`;

const StatusMessage = styled.div<{ type: 'success' | 'error' }>`
  padding: 12px 16px;
  background: ${props => props.type === 'success' ? '#e8f5e9' : '#ffebee'};
  color: ${props => props.type === 'success' ? '#2e7d32' : '#c62828'};
  border-radius: 6px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

// Types
interface Question {
  id: string;
  text: string;
  type: string;
}

interface BranchingRule {
  questionId: string;
  condition: 'equals' | 'notEquals' | 'contains' | 'greaterThan' | 'lessThan';
  value: any;
  jumpToQuestionId: string;
}

interface BranchingLogic {
  rules: BranchingRule[];
  enabled: boolean;
}

interface SurveyBranchingLogicProps {
  surveyId: string;
  questions: Question[];
  existingLogic?: BranchingLogic;
  onSave?: (logic: BranchingLogic) => void;
}

const SurveyBranchingLogic: React.FC<SurveyBranchingLogicProps> = ({ 
  surveyId, 
  questions, 
  existingLogic,
  onSave
}) => {
  const [branchingEnabled, setBranchingEnabled] = useState(existingLogic?.enabled || false);
  const [rules, setRules] = useState<BranchingRule[]>(existingLogic?.rules || []);
  const [status, setStatus] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [saving, setSaving] = useState(false);

  // Reset rules when questions change
  useEffect(() => {
    if (existingLogic) {
      setBranchingEnabled(existingLogic.enabled);
      setRules(existingLogic.rules);
    }
  }, [existingLogic]);

  const addRule = () => {
    if (questions.length < 2) return;
    
    const newRule: BranchingRule = {
      questionId: questions[0].id,
      condition: 'equals',
      value: '',
      jumpToQuestionId: questions[1].id,
    };
    
    setRules([...rules, newRule]);
  };

  const updateRule = (index: number, field: keyof BranchingRule, value: any) => {
    const updatedRules = [...rules];
    updatedRules[index] = {
      ...updatedRules[index],
      [field]: value
    };
    setRules(updatedRules);
  };

  const removeRule = (index: number) => {
    const updatedRules = [...rules];
    updatedRules.splice(index, 1);
    setRules(updatedRules);
  };

  const saveLogic = () => {
    if (!surveyId) return;
    
    setSaving(true);
    setStatus(null);
    
    const branchingLogic: BranchingLogic = {
      rules,
      enabled: branchingEnabled
    };
    
    Meteor.call('surveys.updateBranchingLogic', surveyId, branchingLogic, (error: any) => {
      setSaving(false);
      
      if (error) {
        console.error('Error saving branching logic:', error);
        setStatus({
          message: `Failed to save: ${error.message}`,
          type: 'error'
        });
      } else {
        setStatus({
          message: 'Branching logic saved successfully!',
          type: 'success'
        });
        
        if (onSave) {
          onSave(branchingLogic);
        }
        
        // Clear status after 3 seconds
        setTimeout(() => {
          setStatus(null);
        }, 3000);
      }
    });
  };

  const getConditionOptions = (questionType: string) => {
    const commonOptions = [
      { value: 'equals', label: 'Equals' },
      { value: 'notEquals', label: 'Does not equal' },
    ];
    
    const textOptions = [
      { value: 'contains', label: 'Contains' },
    ];
    
    const numberOptions = [
      { value: 'greaterThan', label: 'Greater than' },
      { value: 'lessThan', label: 'Less than' },
    ];
    
    switch (questionType) {
      case 'text':
      case 'textarea':
        return [...commonOptions, ...textOptions];
      case 'number':
      case 'rating':
        return [...commonOptions, ...numberOptions];
      default:
        return commonOptions;
    }
  };

  return (
    <Container>
      <Header>
        <Title>Question Branching Logic</Title>
        <ToggleSwitch>
          <ToggleLabel>Enable Branching</ToggleLabel>
          <Switch>
            <SwitchInput 
              type="checkbox" 
              checked={branchingEnabled} 
              onChange={() => setBranchingEnabled(!branchingEnabled)} 
            />
            <Slider />
          </Switch>
        </ToggleSwitch>
      </Header>
      
      {questions.length < 2 ? (
        <NoQuestionsMessage>
          You need at least two questions to set up branching logic.
        </NoQuestionsMessage>
      ) : (
        <>
          <div style={{ fontSize: '14px', color: '#666', marginBottom: '16px' }}>
            Create rules to determine which question to show next based on the respondent's answers.
          </div>
          
          <RulesList>
            {rules.map((rule, index) => {
              const sourceQuestion = questions.find(q => q.id === rule.questionId);
              const questionType = sourceQuestion?.type || 'text';
              
              return (
                <RuleItem key={index}>
                  <Select 
                    value={rule.questionId}
                    onChange={(e) => updateRule(index, 'questionId', e.target.value)}
                  >
                    {questions.map(q => (
                      <option key={q.id} value={q.id}>{q.text}</option>
                    ))}
                  </Select>
                  
                  <Select 
                    value={rule.condition}
                    onChange={(e) => updateRule(index, 'condition', e.target.value as any)}
                  >
                    {getConditionOptions(questionType).map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </Select>
                  
                  <Input 
                    type={questionType === 'number' || questionType === 'rating' ? 'number' : 'text'}
                    value={rule.value}
                    onChange={(e) => updateRule(index, 'value', e.target.value)}
                    placeholder="Value"
                  />
                  
                  <ArrowIcon size={20} />
                  
                  <Select 
                    value={rule.jumpToQuestionId}
                    onChange={(e) => updateRule(index, 'jumpToQuestionId', e.target.value)}
                  >
                    {questions.map(q => (
                      <option key={q.id} value={q.id}>{q.text}</option>
                    ))}
                  </Select>
                  
                  <DeleteButton onClick={() => removeRule(index)}>
                    <FiTrash2 size={18} />
                  </DeleteButton>
                </RuleItem>
              );
            })}
          </RulesList>
          
          <AddRuleButton onClick={addRule}>
            <FiPlus size={18} />
            Add Rule
          </AddRuleButton>
          
          <SaveButton onClick={saveLogic} disabled={saving}>
            {saving ? 'Saving...' : 'Save Branching Logic'}
          </SaveButton>
          
          {status && (
            <StatusMessage type={status.type}>
              {status.type === 'success' ? <FiCheck size={18} /> : <FiX size={18} />}
              {status.message}
            </StatusMessage>
          )}
        </>
      )}
    </Container>
  );
};

export default SurveyBranchingLogic;
