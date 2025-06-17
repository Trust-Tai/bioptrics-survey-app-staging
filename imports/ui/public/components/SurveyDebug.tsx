import React from 'react';
import styled from 'styled-components';

interface DebugProps {
  sections: any[];
  questions: any[];
  currentStep: {
    type: string;
    sectionId?: string;
    questionId?: string;
  };
}

const DebugContainer = styled.div`
  position: fixed;
  bottom: 10px;
  right: 10px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 10px;
  border-radius: 5px;
  font-size: 12px;
  max-width: 300px;
  max-height: 200px;
  overflow: auto;
  z-index: 9999;
`;

const SurveyDebug: React.FC<DebugProps> = ({ sections, questions, currentStep }) => {
  // Only show in development
  if (process.env.NODE_ENV !== 'development') return null;

  // Group questions by section
  const questionsBySection = sections.map(section => {
    const sectionQuestions = questions.filter(q => 
      q.sectionId === section.id || 
      (q.sectionId && section.id && 
        (q.sectionId.includes(section.id) || section.id.includes(q.sectionId)))
    );
    
    return {
      sectionId: section.id,
      sectionName: section.name,
      questionCount: sectionQuestions.length,
      questions: sectionQuestions.map(q => ({ id: q._id || q.id, text: q.text?.substring(0, 20) }))
    };
  });

  return (
    <DebugContainer>
      <h4>Survey Debug</h4>
      <div>Current step: {currentStep.type}</div>
      {currentStep.sectionId && <div>Section ID: {currentStep.sectionId}</div>}
      {currentStep.questionId && <div>Question ID: {currentStep.questionId}</div>}
      <div>Sections: {sections.length}</div>
      <div>Questions: {questions.length}</div>
      <h5>Questions by Section:</h5>
      <pre>{JSON.stringify(questionsBySection, null, 2)}</pre>
    </DebugContainer>
  );
};

export default SurveyDebug;
