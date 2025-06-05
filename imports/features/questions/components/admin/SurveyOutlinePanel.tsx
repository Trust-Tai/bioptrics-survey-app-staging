import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { FaGripVertical, FaEye, FaEdit, FaTrash, FaCopy, FaPlus } from 'react-icons/fa';
import './SurveyOutlinePanel.css';

interface Question {
  id: string;
  text: string;
  type: string;
  required: boolean;
  section?: string;
}

interface Section {
  id: string;
  title: string;
}

interface SurveyOutlinePanelProps {
  questions: Question[];
  sections: Section[];
  onQuestionReorder: (questions: Question[]) => void;
  onQuestionSelect: (questionId: string) => void;
  onQuestionEdit: (questionId: string) => void;
  onQuestionDelete: (questionId: string) => void;
  onQuestionDuplicate: (questionId: string) => void;
  onAddQuestion: (sectionId?: string) => void;
  onAddSection: () => void;
  onSectionReorder: (sections: Section[]) => void;
  onSectionEdit: (sectionId: string) => void;
  onSectionDelete: (sectionId: string) => void;
}

const SurveyOutlinePanel: React.FC<SurveyOutlinePanelProps> = ({
  questions,
  sections,
  onQuestionReorder,
  onQuestionSelect,
  onQuestionEdit,
  onQuestionDelete,
  onQuestionDuplicate,
  onAddQuestion,
  onAddSection,
  onSectionReorder,
  onSectionEdit,
  onSectionDelete
}) => {
  const [expandedSections, setExpandedSections] = useState<string[]>(sections.map(s => s.id));

  // Toggle section expansion
  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  // Handle drag end for questions and sections
  const handleDragEnd = (result: any) => {
    const { source, destination, type } = result;

    // Dropped outside the list
    if (!destination) {
      return;
    }

    // If position didn't change
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Handle section reordering
    if (type === 'section') {
      const reorderedSections = [...sections];
      const [removed] = reorderedSections.splice(source.index, 1);
      reorderedSections.splice(destination.index, 0, removed);
      onSectionReorder(reorderedSections);
      return;
    }

    // Handle question reordering
    const sourceSection = source.droppableId;
    const destSection = destination.droppableId;
    
    // Create a copy of questions
    const reorderedQuestions = [...questions];
    
    // Find questions in source and destination sections
    const sourceQuestions = questions.filter(q => q.section === sourceSection);
    const destQuestions = sourceSection === destSection 
      ? sourceQuestions 
      : questions.filter(q => q.section === destSection);
    
    // Get the question being moved
    const [movedQuestion] = sourceQuestions.splice(source.index, 1);
    
    // Update the section if moving between sections
    if (sourceSection !== destSection) {
      movedQuestion.section = destSection;
    }
    
    // Insert at new position
    destQuestions.splice(destination.index, 0, movedQuestion);
    
    // Update the full questions array
    const updatedQuestions = questions.map(q => {
      // If question is in source section, replace with updated source questions
      if (q.section === sourceSection) {
        return sourceQuestions.shift() || q;
      }
      // If question is in destination section, replace with updated dest questions
      if (q.section === destSection) {
        return destQuestions.shift() || q;
      }
      // Otherwise keep the question as is
      return q;
    });
    
    onQuestionReorder(updatedQuestions);
  };

  // Group questions by section
  const questionsBySection: Record<string, Question[]> = {};
  
  // Initialize with empty arrays for all sections
  sections.forEach(section => {
    questionsBySection[section.id] = [];
  });
  
  // Add unsectioned questions group
  questionsBySection['unsectioned'] = [];
  
  // Group questions
  questions.forEach(question => {
    const sectionId = question.section || 'unsectioned';
    if (!questionsBySection[sectionId]) {
      questionsBySection[sectionId] = [];
    }
    questionsBySection[sectionId].push(question);
  });

  return (
    <div className="survey-outline-panel">
      <div className="outline-header">
        <h2>Survey Outline</h2>
        <div className="outline-actions">
          <button 
            className="outline-action-btn add-section" 
            onClick={onAddSection}
            title="Add new section"
          >
            <FaPlus /> Section
          </button>
          <button 
            className="outline-action-btn add-question" 
            onClick={() => onAddQuestion()}
            title="Add new question"
          >
            <FaPlus /> Question
          </button>
        </div>
      </div>
      
      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections" type="section">
          {(provided) => (
            <div
              className="sections-list"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              {sections.map((section, index) => (
                <Draggable 
                  key={section.id} 
                  draggableId={`section-${section.id}`} 
                  index={index}
                >
                  {(provided) => (
                    <div
                      className="section-item"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                    >
                      <div className="section-header">
                        <div className="section-drag-handle" {...provided.dragHandleProps}>
                          <FaGripVertical />
                        </div>
                        <div 
                          className="section-title"
                          onClick={() => toggleSection(section.id)}
                        >
                          {section.title}
                        </div>
                        <div className="section-actions">
                          <button 
                            className="section-action-btn"
                            onClick={() => onSectionEdit(section.id)}
                            title="Edit section"
                          >
                            <FaEdit />
                          </button>
                          <button 
                            className="section-action-btn"
                            onClick={() => onSectionDelete(section.id)}
                            title="Delete section"
                          >
                            <FaTrash />
                          </button>
                          <button 
                            className="section-action-btn"
                            onClick={() => onAddQuestion(section.id)}
                            title="Add question to this section"
                          >
                            <FaPlus />
                          </button>
                        </div>
                      </div>
                      
                      {expandedSections.includes(section.id) && (
                        <Droppable 
                          droppableId={section.id} 
                          type="question"
                        >
                          {(provided) => (
                            <div
                              className="section-questions"
                              {...provided.droppableProps}
                              ref={provided.innerRef}
                            >
                              {questionsBySection[section.id]?.map((question, qIndex) => (
                                <Draggable
                                  key={question.id}
                                  draggableId={question.id}
                                  index={qIndex}
                                >
                                  {(provided) => (
                                    <div
                                      className="question-item"
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      onClick={() => onQuestionSelect(question.id)}
                                    >
                                      <div className="question-drag-handle" {...provided.dragHandleProps}>
                                        <FaGripVertical />
                                      </div>
                                      <div className="question-content">
                                        <div 
                                          className="question-text"
                                          dangerouslySetInnerHTML={{ 
                                            __html: question.text.replace(/<[^>]*>/g, '') 
                                          }}
                                        />
                                        <div className="question-meta">
                                          <span className="question-type">{question.type}</span>
                                          {question.required && (
                                            <span className="question-required">Required</span>
                                          )}
                                        </div>
                                      </div>
                                      <div className="question-actions">
                                        <button 
                                          className="question-action-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onQuestionEdit(question.id);
                                          }}
                                          title="Edit question"
                                        >
                                          <FaEdit />
                                        </button>
                                        <button 
                                          className="question-action-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onQuestionDuplicate(question.id);
                                          }}
                                          title="Duplicate question"
                                        >
                                          <FaCopy />
                                        </button>
                                        <button 
                                          className="question-action-btn"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            onQuestionDelete(question.id);
                                          }}
                                          title="Delete question"
                                        >
                                          <FaTrash />
                                        </button>
                                      </div>
                                    </div>
                                  )}
                                </Draggable>
                              ))}
                              {provided.placeholder}
                              
                              {(!questionsBySection[section.id] || questionsBySection[section.id].length === 0) && (
                                <div className="empty-section-message">
                                  No questions in this section.
                                  <button 
                                    className="add-question-btn"
                                    onClick={() => onAddQuestion(section.id)}
                                  >
                                    <FaPlus /> Add Question
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </Droppable>
                      )}
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
        
        {/* Unsectioned questions */}
        <Droppable droppableId="unsectioned" type="question">
          {(provided) => (
            <div
              className="unsectioned-questions"
              {...provided.droppableProps}
              ref={provided.innerRef}
            >
              <div className="unsectioned-header">
                <h3>Unsectioned Questions</h3>
              </div>
              
              {questionsBySection['unsectioned']?.map((question, index) => (
                <Draggable
                  key={question.id}
                  draggableId={question.id}
                  index={index}
                >
                  {(provided) => (
                    <div
                      className="question-item"
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      onClick={() => onQuestionSelect(question.id)}
                    >
                      <div className="question-drag-handle" {...provided.dragHandleProps}>
                        <FaGripVertical />
                      </div>
                      <div className="question-content">
                        <div 
                          className="question-text"
                          dangerouslySetInnerHTML={{ 
                            __html: question.text.replace(/<[^>]*>/g, '') 
                          }}
                        />
                        <div className="question-meta">
                          <span className="question-type">{question.type}</span>
                          {question.required && (
                            <span className="question-required">Required</span>
                          )}
                        </div>
                      </div>
                      <div className="question-actions">
                        <button 
                          className="question-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuestionEdit(question.id);
                          }}
                          title="Edit question"
                        >
                          <FaEdit />
                        </button>
                        <button 
                          className="question-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuestionDuplicate(question.id);
                          }}
                          title="Duplicate question"
                        >
                          <FaCopy />
                        </button>
                        <button 
                          className="question-action-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            onQuestionDelete(question.id);
                          }}
                          title="Delete question"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </div>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
              
              {(!questionsBySection['unsectioned'] || questionsBySection['unsectioned'].length === 0) && (
                <div className="empty-section-message">
                  No unsectioned questions.
                </div>
              )}
            </div>
          )}
        </Droppable>
      </DragDropContext>
    </div>
  );
};

export default SurveyOutlinePanel;
