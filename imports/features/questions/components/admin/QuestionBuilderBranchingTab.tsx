import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { BranchingLogicBuilder } from './BranchingLogicBuilder';
import { FaInfoCircle } from 'react-icons/fa';
import './QuestionBuilderBranchingTab.css';

interface Question {
  _id?: string;
  text: string;
  branchingLogic?: {
    enabled: boolean;
    rules: BranchingRule[];
    defaultDestination?: string;
  };
}

interface BranchingRule {
  condition: {
    type: string;
    value: any;
    operator?: string;
    answerIndex?: number;
  };
  destination: string;
}

interface DestinationQuestion {
  _id: string;
  text: string;
}

interface QuestionBuilderBranchingTabProps {
  question: Question;
  onBranchingLogicChange: (branchingLogic: any) => void;
  surveyId?: string;
}

const QuestionBuilderBranchingTab: React.FC<QuestionBuilderBranchingTabProps> = ({
  question,
  onBranchingLogicChange,
  surveyId
}) => {
  const [destinationQuestions, setDestinationQuestions] = useState<DestinationQuestion[]>([]);
  const [loading, setLoading] = useState(true);
  const [branchingEnabled, setBranchingEnabled] = useState(
    question.branchingLogic?.enabled || false
  );
  
  // Initialize branching logic if not present
  const branchingLogic = question.branchingLogic || {
    enabled: false,
    rules: [],
    defaultDestination: ''
  };

  // Fetch available destination questions
  useEffect(() => {
    const fetchDestinationQuestions = async () => {
      setLoading(true);
      
      try {
        // If we have a surveyId, fetch questions from that survey
        // Otherwise fetch all questions
        let questions;
        
        if (surveyId) {
          const handle = Meteor.subscribe('questions.bySurvey', surveyId);
          if (handle.ready()) {
            const { Questions } = await import('/imports/features/questions/api/questions');
            questions = Questions.find({ 
              surveyId,
              _id: { $ne: question._id } // Exclude current question
            }, { 
              fields: { _id: 1, text: 1 } 
            }).fetch();
          }
        } else {
          const handle = Meteor.subscribe('questions.all');
          if (handle.ready()) {
            const { Questions } = await import('/imports/features/questions/api/questions');
            questions = Questions.find({ 
              _id: { $ne: question._id } // Exclude current question
            }, { 
              fields: { _id: 1, text: 1 } 
            }).fetch();
          }
        }
        
        if (questions) {
          setDestinationQuestions(questions);
        }
        
        setLoading(false);
      } catch (error) {
        console.error('Error fetching destination questions:', error);
        setLoading(false);
      }
    };
    
    fetchDestinationQuestions();
  }, [surveyId, question._id]);

  // Handle toggling branching logic
  const handleToggleBranching = (e: React.ChangeEvent<HTMLInputElement>) => {
    const enabled = e.target.checked;
    setBranchingEnabled(enabled);
    
    const updatedBranchingLogic = {
      ...branchingLogic,
      enabled
    };
    
    onBranchingLogicChange(updatedBranchingLogic);
  };

  // Handle branching rules change
  const handleRulesChange = (rules: BranchingRule[]) => {
    const updatedBranchingLogic = {
      ...branchingLogic,
      rules
    };
    
    onBranchingLogicChange(updatedBranchingLogic);
  };

  // Handle default destination change
  const handleDefaultDestinationChange = (destinationId: string) => {
    const updatedBranchingLogic = {
      ...branchingLogic,
      defaultDestination: destinationId
    };
    
    onBranchingLogicChange(updatedBranchingLogic);
  };

  return (
    <div className="question-builder-branching-tab">
      <div className="branching-header">
        <div className="branching-toggle">
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={branchingEnabled}
              onChange={handleToggleBranching}
            />
            <span className="toggle-slider"></span>
          </label>
          <span className="toggle-label">Enable Branching Logic</span>
        </div>
        
        <div className="branching-info">
          <FaInfoCircle />
          <span>
            Branching logic allows you to direct respondents to different questions based on their answers.
          </span>
        </div>
      </div>
      
      {branchingEnabled && (
        <div className="branching-content">
          <BranchingLogicBuilder
            rules={branchingLogic.rules || []}
            defaultDestination={branchingLogic.defaultDestination || ''}
            destinationQuestions={destinationQuestions}
            answerOptions={question.answers || []}
            questionType={question.answerType}
            onRulesChange={handleRulesChange}
            onDefaultDestinationChange={handleDefaultDestinationChange}
            isLoading={loading}
          />
        </div>
      )}
      
      {!branchingEnabled && (
        <div className="branching-disabled-message">
          <p>
            Branching logic is currently disabled. Enable it to create conditional paths based on answers to this question.
          </p>
        </div>
      )}
    </div>
  );
};

export default QuestionBuilderBranchingTab;
