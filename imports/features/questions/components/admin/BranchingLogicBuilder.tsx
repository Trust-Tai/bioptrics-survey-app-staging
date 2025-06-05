import React, { useState, useEffect } from 'react';
import { FaPlus, FaTrash, FaArrowRight } from 'react-icons/fa';
import Select from 'react-select';

interface BranchingRule {
  id: string;
  questionId?: string;
  condition: 'equals' | 'not_equals' | 'contains' | 'not_contains' | 'greater_than' | 'less_than';
  value: string;
  nextQuestionId?: string;
}

interface BranchingLogicBuilderProps {
  availableQuestions: Array<{ _id: string; text: string }>;
  initialRules?: BranchingRule[];
  onChange: (rules: BranchingRule[]) => void;
}

const BranchingLogicBuilder: React.FC<BranchingLogicBuilderProps> = ({
  availableQuestions,
  initialRules = [],
  onChange,
}) => {
  const [rules, setRules] = useState<BranchingRule[]>(initialRules);

  useEffect(() => {
    if (initialRules.length > 0) {
      setRules(initialRules);
    }
  }, [initialRules]);

  const addRule = () => {
    const newRule: BranchingRule = {
      id: `rule_${Date.now()}`,
      condition: 'equals',
      value: '',
    };
    
    const updatedRules = [...rules, newRule];
    setRules(updatedRules);
    onChange(updatedRules);
  };

  const removeRule = (ruleId: string) => {
    const updatedRules = rules.filter(rule => rule.id !== ruleId);
    setRules(updatedRules);
    onChange(updatedRules);
  };

  const updateRule = (ruleId: string, field: keyof BranchingRule, value: string) => {
    const updatedRules = rules.map(rule => {
      if (rule.id === ruleId) {
        return { ...rule, [field]: value };
      }
      return rule;
    });
    
    setRules(updatedRules);
    onChange(updatedRules);
  };

  const conditionOptions = [
    { value: 'equals', label: 'Equals' },
    { value: 'not_equals', label: 'Not Equals' },
    { value: 'contains', label: 'Contains' },
    { value: 'not_contains', label: 'Does Not Contain' },
    { value: 'greater_than', label: 'Greater Than' },
    { value: 'less_than', label: 'Less Than' },
  ];

  const questionOptions = availableQuestions.map(q => ({
    value: q._id,
    label: q.text.replace(/<[^>]*>/g, '').substring(0, 50) + (q.text.length > 50 ? '...' : '')
  }));

  return (
    <div className="branching-logic-builder">
      <div className="branching-header">
        <h3>Branching Logic Rules</h3>
        <button 
          className="add-rule-btn" 
          onClick={addRule}
        >
          <FaPlus /> Add Rule
        </button>
      </div>
      
      {rules.length === 0 ? (
        <div className="no-rules-message">
          No branching rules defined. Add a rule to create conditional logic.
        </div>
      ) : (
        <div className="branching-rules-list">
          {rules.map((rule) => (
            <div key={rule.id} className="branching-rule">
              <div className="rule-row">
                <div className="rule-field">
                  <label>If answer</label>
                  <Select
                    options={conditionOptions}
                    value={conditionOptions.find(option => option.value === rule.condition)}
                    onChange={(selected) => updateRule(rule.id, 'condition', selected?.value || 'equals')}
                    className="condition-select"
                  />
                </div>
                
                <div className="rule-field">
                  <label>Value</label>
                  <input
                    type="text"
                    value={rule.value}
                    onChange={(e) => updateRule(rule.id, 'value', e.target.value)}
                    placeholder="Enter value"
                  />
                </div>
                
                <div className="rule-field rule-destination">
                  <label>Then go to</label>
                  <div className="destination-selector">
                    <FaArrowRight className="arrow-icon" />
                    <Select
                      options={questionOptions}
                      value={questionOptions.find(option => option.value === rule.nextQuestionId)}
                      onChange={(selected) => updateRule(rule.id, 'nextQuestionId', selected?.value || '')}
                      placeholder="Select destination question"
                      className="question-select"
                    />
                  </div>
                </div>
                
                <button 
                  className="remove-rule-btn" 
                  onClick={() => removeRule(rule.id)}
                  aria-label="Remove rule"
                >
                  <FaTrash />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      <div className="branching-help">
        <p>
          <strong>How branching works:</strong> If a respondent's answer matches a rule, they will be directed to the specified question. 
          If multiple rules match, the first matching rule will be applied. If no rules match, the respondent will continue to the next question in sequence.
        </p>
      </div>
    </div>
  );
};

export default BranchingLogicBuilder;
