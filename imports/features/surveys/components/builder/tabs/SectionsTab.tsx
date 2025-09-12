import React from 'react';
import { FiPlus, FiMove, FiEdit2, FiTrash2 } from 'react-icons/fi';
import EnhancedSurveySection from '../../sections/EnhancedSurveySection';
import { SurveySectionItem } from '../../types';

// Define QuestionItem interface locally to ensure TypeScript recognizes all properties
interface QuestionItem {
  id: string;
  text: string;
  type: string;
  status: 'draft' | 'published';
  sectionId?: string;
  order?: number;
  _id?: string;
  versions?: any[];
  currentVersion?: number;
  questionText?: string;
  responseType?: string;
}

interface SectionsTabProps {
  // Data props
  sections: SurveySectionItem[];
  surveyQuestions: QuestionItem[];
  noSectionQuestions: QuestionItem[];
  
  // Drag and drop state
  draggingSectionIndex: number | null;
  dragOverSectionIndex: number | null;
  draggingQuestionId: string | null;
  draggingQuestionSectionId: string | null;
  dragOverQuestionId: string | null;
  dragOverSectionId: string | null;
  dragOverNoSection: boolean;
  
  // Drag and drop setters
  setDraggingSectionIndex: (index: number | null) => void;
  setDragOverSectionIndex: (index: number | null) => void;
  setDraggingQuestionId: (id: string | null) => void;
  setDraggingQuestionSectionId: (id: string | null) => void;
  setDragOverQuestionId: (id: string | null) => void;
  setDragOverSectionId: (id: string | null) => void;
  setDragOverNoSection: (value: boolean) => void;
  
  // Event handlers
  handleAddSection: () => void;
  handleAddQuestion: (sectionId: string | null) => void;
  handleCreateQuestion: (sectionId: string | null) => void;
  handleEditQuestion: (questionId: string, sectionId: string | null) => void;
  handleRemoveQuestion: (questionId: string, sectionId: string | null) => void;
  handleEditSection: (sectionId: string) => void;
  handleDeleteSection: (sectionId: string) => void;
  handleReorderSection: (sourceIndex: number, targetIndex: number) => void;
  handleReorderQuestion: (questionId: string, sourceIndex: number, targetIndex: number, sectionId: string | null) => void;
  handleMoveQuestionToSection: (questionId: string, targetSectionId: string, targetIndex: number) => void;
  handleMoveQuestionBetweenSections: (questionId: string, sourceSectionId: string, targetSectionId: string, targetIndex: number) => void;
  handleMoveQuestionToNoSection: (questionId: string, sourceSectionId: string) => void;
  handleReorderNoSectionQuestion: (sourceIndex: number, targetIndex: number) => void;
}

const SectionsTab: React.FC<SectionsTabProps> = ({
  sections,
  surveyQuestions,
  noSectionQuestions,
  draggingSectionIndex,
  dragOverSectionIndex,
  draggingQuestionId,
  draggingQuestionSectionId,
  dragOverQuestionId,
  dragOverSectionId,
  dragOverNoSection,
  setDraggingSectionIndex,
  setDragOverSectionIndex,
  setDraggingQuestionId,
  setDraggingQuestionSectionId,
  setDragOverQuestionId,
  setDragOverSectionId,
  setDragOverNoSection,
  handleAddSection,
  handleAddQuestion,
  handleCreateQuestion,
  handleEditQuestion,
  handleRemoveQuestion,
  handleEditSection,
  handleDeleteSection,
  handleReorderSection,
  handleReorderQuestion,
  handleMoveQuestionToSection,
  handleMoveQuestionBetweenSections,
  handleMoveQuestionToNoSection,
  handleReorderNoSectionQuestion,
}) => {
  return (
    <div className="survey-builder-panel">
      <div className="survey-builder-panel-header">
        <div>
          {/* Header content can be added here if needed */}
        </div>
      </div>
      
      <div className="survey-sections-container">
        <style dangerouslySetInnerHTML={{ __html: `
          .survey-section-wrapper {
            margin-bottom: 16px;
            transition: all 0.2s ease;
          }
          .survey-section-wrapper.dragging {
            opacity: 0.5;
          }
          .survey-section-wrapper.drag-over {
            position: relative;
          }
          .survey-section-wrapper.drag-over::before {
            content: '';
            position: absolute;
            top: -8px;
            left: 0;
            right: 0;
            height: 4px;
            background-color: #552a47;
            border-radius: 2px;
            z-index: 10;
          }
          .survey-section-add-question {
            padding: 12px 16px;
            background-color: #f9fafb;
            border-radius: 8px;
            cursor: pointer;
            transition: all 0.2s ease;
            border: 1px dashed #cbd5e1;
          }
          .survey-section-add-question:hover {
            background-color: rgba(85, 42, 71, 0.05);
            color: #552a47;
          }
          .question-item {
            padding: 12px 16px;
            background-color: #fff;
            border-radius: 8px;
            box-shadow: 0 2px 4px rgba(0,0,0,0.05);
            margin-bottom: 12px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            transition: all 0.2s ease;
          }
          .question-item.dragging {
            opacity: 0.5;
          }
          .question-item.drag-over {
            position: relative;
            box-shadow: 0 0 0 2px #552a47;
          }
          .survey-section-question {
            transition: all 0.2s ease;
          }
          .survey-section-question.dragging {
            opacity: 0.5;
          }
          .survey-section-question.drag-over {
            position: relative;
            box-shadow: 0 0 0 2px #552a47;
          }
          .no-section-questions {
            transition: all 0.2s ease;
          }
          .no-section-questions.drag-over {
            background-color: rgba(85, 42, 71, 0.05);
            border-radius: 8px;
            padding: 8px;
          }
          .survey-section.drag-over-section {
            background-color: rgba(85, 42, 71, 0.05);
            border-radius: 8px;
            box-shadow: 0 0 0 2px #552a47;
          }
        `}} />
        
        {/* Display questions that don't belong to any section */}
        <div 
          className={`no-section-questions ${dragOverNoSection ? 'drag-over' : ''}`} 
          style={{ marginBottom: '30px', padding: '8px' }}
          onDragOver={(e) => {
            e.preventDefault();
            if (!draggingSectionIndex && draggingQuestionSectionId !== null) {
              setDragOverNoSection(true);
            }
          }}
          onDragLeave={() => {
            setDragOverNoSection(false);
          }}
          onDrop={(e) => {
            e.preventDefault();
            // Handle drop of question from section to no-section area
            if (draggingQuestionId && draggingQuestionSectionId) {
              handleMoveQuestionToNoSection(draggingQuestionId, draggingQuestionSectionId);
            }
            setDragOverNoSection(false);
            setDraggingQuestionId(null);
            setDraggingQuestionSectionId(null);
          }}
        >
          {noSectionQuestions.length > 0 ? (
            noSectionQuestions.map((question, index) => (
              <div
                key={question.id}
                className={`question-item ${draggingQuestionId === question.id ? 'dragging' : ''} ${dragOverQuestionId === question.id ? 'drag-over' : ''}`}
                draggable
                onClick={() => handleEditQuestion(question.id, null)}
                style={{ cursor: 'pointer' }}
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', JSON.stringify({
                    questionId: question.id,
                    sectionId: null,
                    index
                  }));
                  setDraggingQuestionId(question.id);
                  setDraggingQuestionSectionId(null);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggingQuestionId !== question.id) {
                    setDragOverQuestionId(question.id);
                    setDragOverNoSection(false);
                  }
                }}
                onDragLeave={() => {
                  setDragOverQuestionId(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const data = JSON.parse(e.dataTransfer.getData('text/plain'));
                  
                  // If dropping from no-section to no-section
                  if (data.sectionId === null && draggingQuestionId !== question.id) {
                    handleReorderNoSectionQuestion(data.index, index);
                  }
                  // If dropping from section to no-section
                  else if (data.sectionId !== null) {
                    handleMoveQuestionToNoSection(data.questionId, index);
                  }
                  
                  setDragOverQuestionId(null);
                  setDraggingQuestionId(null);
                  setDraggingQuestionSectionId(null);
                  setDragOverNoSection(false);
                }}
                onDragEnd={() => {
                  setDraggingQuestionId(null);
                  setDraggingQuestionSectionId(null);
                  setDragOverQuestionId(null);
                  setDragOverNoSection(false);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <div 
                    style={{ paddingRight: '8px', cursor: 'grab' }}
                    onClick={(e) => e.stopPropagation()} // Prevent triggering edit when clicking drag handle
                  >
                    <FiMove size={16} />
                  </div>
                  <div>
                    <div style={{ fontWeight: 500 }}>{question.text}</div>
                    <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                      {question.type}
                    </div>
                  </div>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the container's onClick
                      handleEditQuestion(question.id, null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      padding: '4px'
                    }}
                  >
                    <FiEdit2 />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation(); // Prevent triggering the container's onClick
                      handleRemoveQuestion(question.id, null);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#666',
                      padding: '4px'
                    }}
                  >
                    <FiTrash2 />
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div style={{ 
              padding: '20px', 
              textAlign: 'center', 
              color: '#666',
              backgroundColor: '#f9f9f9',
              borderRadius: '8px',
              marginBottom: '20px'
            }}>
              <p>No questions added yet. Use the buttons below to add questions.</p>
            </div>
          )}
        </div>

        {/* Display sections */}
        {sections.length > 0 ? (
          <div>
            <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Sections</h3>
            {sections.map((section, index) => (
              <div 
                key={section.id}
                className={`survey-section-wrapper ${draggingSectionIndex === index ? 'dragging' : ''} ${dragOverSectionIndex === index ? 'drag-over' : ''}`}
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData('text/plain', index.toString());
                  setDraggingSectionIndex(index);
                }}
                onDragOver={(e) => {
                  e.preventDefault();
                  if (draggingSectionIndex !== index) {
                    setDragOverSectionIndex(index);
                  }
                }}
                onDragLeave={() => {
                  setDragOverSectionIndex(null);
                }}
                onDrop={(e) => {
                  e.preventDefault();
                  const sourceIndex = parseInt(e.dataTransfer.getData('text/plain'));
                  if (sourceIndex !== index) {
                    handleReorderSection(sourceIndex, index);
                  }
                  setDraggingSectionIndex(null);
                  setDragOverSectionIndex(null);
                }}
                onDragEnd={() => {
                  setDraggingSectionIndex(null);
                  setDragOverSectionIndex(null);
                }}
              >
                <EnhancedSurveySection
                  section={section}
                  questions={surveyQuestions.filter(q => q.sectionId === section.id)}
                  onEditSection={handleEditSection}
                  onDeleteSection={handleDeleteSection}
                  onAddQuestion={handleAddQuestion}
                  onCreateQuestion={handleCreateQuestion}
                  onRemoveQuestion={handleRemoveQuestion}
                  onEditQuestion={handleEditQuestion}
                  onReorderQuestion={handleReorderQuestion}
                  onMoveQuestionToSection={handleMoveQuestionToSection}
                  onMoveQuestionBetweenSections={handleMoveQuestionBetweenSections}
                  draggingQuestionId={draggingQuestionId}
                  draggingQuestionSectionId={draggingQuestionSectionId}
                  setDraggingQuestionId={setDraggingQuestionId}
                  setDraggingQuestionSectionId={setDraggingQuestionSectionId}
                  dragOverSectionId={dragOverSectionId}
                  setDragOverSectionId={setDragOverSectionId}
                  dragOverQuestionId={dragOverQuestionId}
                  setDragOverQuestionId={setDragOverQuestionId}
                />
              </div>
            ))}
          </div>
        ) : (
          <div style={{ padding: 20, textAlign: 'center', color: '#666', backgroundColor: '#f9f9f9', borderRadius: '8px', display: 'none'}}>
            <p>No sections added yet. Use the 'Add Section' button to create sections.</p>
          </div>
        )}

        {/* Action buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', marginBottom: '16px' }}>
          <div 
            className="survey-section-add-question"
            onClick={handleAddSection}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiPlus size={16} /> Add Section
          </div>
          <div 
            className="survey-section-add-question"
            onClick={() => handleAddQuestion(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiPlus size={16} /> Choose from Question Bank
          </div>
          <div 
            className="survey-section-add-question"
            onClick={() => handleCreateQuestion(null)}
            style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <FiPlus size={16} /> Create Question
          </div>
        </div>
      </div>
    </div>
  );
};

export default SectionsTab;
