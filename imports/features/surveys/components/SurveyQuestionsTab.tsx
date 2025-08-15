import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMove, FiLayers } from 'react-icons/fi';
import { useQuestionBuilderPanel } from '../../../features/questions/contexts/QuestionBuilderPanelContext';
import { useTracker } from 'meteor/react-meteor-data';
import { Questions } from '../../../features/questions/api/questions';
import QuestionSelector from './sections/QuestionSelector';
import SectionEditor from './sections/SectionEditor';
import { Meteor } from 'meteor/meteor';
import { QuestionItem } from '../types';

interface SurveyQuestionsTabProps {
  surveyId?: string;
  survey?: any;
  onSurveyUpdate?: (survey: any) => void;
  onHasUnsavedChanges?: (hasChanges: boolean) => void;
}

const SurveyQuestionsTab: React.FC<SurveyQuestionsTabProps> = ({
  surveyId,
  survey,
  onSurveyUpdate,
  onHasUnsavedChanges,
}) => {
  const { openPanel } = useQuestionBuilderPanel();
  const [surveyQuestions, setSurveyQuestions] = useState<QuestionItem[]>([]);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [questionSelectorItems, setQuestionSelectorItems] = useState<QuestionItem[]>([]);
  const [draggingQuestionId, setDraggingQuestionId] = useState<string | null>(null);
  const [dragOverQuestionId, setDragOverQuestionId] = useState<string | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [currentSection, setCurrentSection] = useState<any>(undefined);
  const [currentSectionId, setCurrentSectionId] = useState<string>('');

  // Helper function to extract clean question text
  const extractQuestionText = (question: any): string => {
    if (!question) return '';
    
    // Get the latest version
    const latestVersion = question.versions && question.versions.length > 0 
      ? question.versions[question.versions.length - 1]
      : question;
    
    const questionText = latestVersion?.questionText || question.questionText || '';
    
    // Remove HTML tags and decode HTML entities
    return questionText
      .replace(/<[^>]*>/g, '') // Remove HTML tags
      .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
      .replace(/&amp;/g, '&')  // Replace &amp; with &
      .replace(/&lt;/g, '<')   // Replace &lt; with <
      .replace(/&gt;/g, '>')   // Replace &gt; with >
      .trim();
  };

  // Load existing survey questions and sections when component mounts or survey changes
  useEffect(() => {
    // Load sections
    if (survey && survey.surveySections && Array.isArray(survey.surveySections)) {
      setSections(survey.surveySections);
    }

    // Load questions
    if (survey && survey.selectedQuestions && Array.isArray(survey.selectedQuestions)) {
      const questionIds = survey.selectedQuestions;
      
      // Subscribe to get question details
      Meteor.subscribe('questions.all', surveyId, {
        onReady: () => {
          const questions = questionIds.map((id: string) => {
            const questionDoc = Questions.findOne(id);
            if (questionDoc) {
              // Check if this question belongs to a section
              const sectionQuestion = survey.sectionQuestions?.find((sq: any) => sq.questionId === id);
              
              return {
                id: id,
                text: extractQuestionText(questionDoc),
                type: getLatestQuestionVersion(questionDoc)?.responseType || 'text',
                status: 'published' as const,
                sectionId: sectionQuestion?.sectionId
              };
            }
            return null;
          }).filter(Boolean) as QuestionItem[];
          
          setSurveyQuestions(questions);
        }
      });
    } else if (!survey?.selectedQuestions || !Array.isArray(survey.selectedQuestions) || survey.selectedQuestions.length === 0) {
      // Clear questions if survey has no selected questions
      setSurveyQuestions([]);
    }
  }, [survey?.selectedQuestions]);

  const handleCreateQuestion = () => {
    const onQuestionCreatedCallback = (questionId: string) => {
      console.log('Question created with ID:', questionId);
      
      // Add a small delay to ensure the question is saved to the database
      setTimeout(() => {
        const questionDoc = Questions.findOne(questionId);
        if (questionDoc) {
          const latestVersion = questionDoc.versions && questionDoc.versions.length > 0 
            ? questionDoc.versions[questionDoc.versions.length - 1]
            : questionDoc;
          
          const newQuestion: QuestionItem = {
            id: questionId,
            text: extractQuestionText(questionDoc),
            type: (latestVersion as any)?.responseType || (questionDoc as any)?.responseType || 'text',
            status: 'published' as 'published'
          };
          
          console.log('Adding question to UI:', newQuestion);
          
          // Add the question to the survey questions list immediately
          setSurveyQuestions(prev => {
            // Check if question already exists to avoid duplicates
            if (prev.some(q => q.id === questionId)) {
              return prev;
            }
            return [...prev, newQuestion];
          });
          
          // Update the survey with the new question
          if (survey && onSurveyUpdate) {
            const currentQuestions = Array.isArray(survey.selectedQuestions) ? survey.selectedQuestions : [];
            // Check if question ID already exists to avoid duplicates
            if (!currentQuestions.includes(questionId)) {
              const updatedSurvey = {
                ...survey,
                selectedQuestions: [...currentQuestions, questionId]
              };
              console.log('Updating survey with new question:', updatedSurvey.selectedQuestions);
              onSurveyUpdate(updatedSurvey);
            }
          }
          
          // Trigger unsaved changes
          if (onHasUnsavedChanges) {
            onHasUnsavedChanges(true);
          }
        } else {
          console.error('Question not found in database:', questionId);
        }
      }, 100); // Small delay to ensure database write is complete
    };
    
    // Open the question builder panel
    openPanel(undefined, surveyId, onQuestionCreatedCallback);
  };

  // Helper function to get the latest version of a question
  const getLatestQuestionVersion = (question: any): any => {
    if (!question.versions || question.versions.length === 0) {
      return question;
    }
    
    // Try to find a version that matches the current survey
    const versionMatch = question.versions.find((v: any) => v.surveyId === surveyId);
    if (versionMatch) return versionMatch;
    
    // Fall back to the last version in the array
    return question.versions[question.versions.length - 1];
  };

  const handleChooseFromQuestionBank = () => {
    console.log('Choose from Question Bank clicked');
    
    // Subscribe to questions and open the selector
    Meteor.subscribe('questions.all', surveyId, {
      onReady: () => {
        // Fetch the questions
        const refreshedQuestions = Questions.find({}, { sort: { createdAt: -1 } }).fetch().map(q => {
          // Get the latest version to extract the response type and text
          const latestVersion = getLatestQuestionVersion(q);
          
          // Create a properly typed QuestionItem
          const questionItem: QuestionItem = {
            id: q._id || '',
            text: extractQuestionText(q),
            type: latestVersion?.responseType || 'text',
            status: 'published' as 'published'
          };
          
          return questionItem;
        });
        
        // Update the question selector items
        setQuestionSelectorItems(refreshedQuestions);
        setShowQuestionSelector(true);
      },
      onError: (error: any) => {
        console.error('Error subscribing to questions.all:', error);
        // Still show the selector with whatever questions we have
        setShowQuestionSelector(true);
      }
    });
  };

  const handleEditQuestion = (questionId: string) => {
    console.log('Edit question:', questionId);
    // TODO: Implement edit question functionality
  };

  const handleDeleteQuestion = (questionId: string) => {
    setSurveyQuestions(prev => prev.filter(q => q.id !== questionId));
    
    // Update the survey to remove the question
    if (survey && onSurveyUpdate) {
      const currentQuestions = Array.isArray(survey.selectedQuestions) ? survey.selectedQuestions : [];
      const updatedSurvey = {
        ...survey,
        selectedQuestions: currentQuestions.filter((id: string) => id !== questionId)
      };
      onSurveyUpdate(updatedSurvey);
    }
    
    // Trigger unsaved changes
    if (onHasUnsavedChanges) {
      onHasUnsavedChanges(true);
    }
  };

  // Handle selecting questions from the Question Selector modal
  const handleSelectQuestions = (selectedQuestionIds: string[]) => {
    console.log('Selected question IDs:', selectedQuestionIds);
    
    // Add selected questions to the survey
    const newQuestions: QuestionItem[] = [];
    const currentQuestionIds = Array.isArray(survey?.selectedQuestions) ? survey.selectedQuestions : [];
    const questionsToAdd: string[] = [];
    
    selectedQuestionIds.forEach(questionId => {
      // Skip if question is already in the survey
      if (currentQuestionIds.includes(questionId)) {
        return;
      }
      
      const questionDoc = Questions.findOne(questionId);
      if (questionDoc) {
        const latestVersion = getLatestQuestionVersion(questionDoc);
        
        const questionItem: QuestionItem = {
          id: questionId,
          text: extractQuestionText(questionDoc),
          type: latestVersion?.responseType || 'text',
          status: 'published' as 'published'
        };
        
        newQuestions.push(questionItem);
        questionsToAdd.push(questionId);
      }
    });
    
    // Update the survey questions list
    setSurveyQuestions(prev => [...prev, ...newQuestions]);
    
    // Update the survey with the new questions
    if (survey && onSurveyUpdate && questionsToAdd.length > 0) {
      const updatedSurvey = {
        ...survey,
        selectedQuestions: [...currentQuestionIds, ...questionsToAdd]
      };
      onSurveyUpdate(updatedSurvey);
    }
    
    // Trigger unsaved changes
    if (onHasUnsavedChanges && questionsToAdd.length > 0) {
      onHasUnsavedChanges(true);
    }
    
    // Close the question selector modal
    setShowQuestionSelector(false);
  };

  // Handle reordering questions via drag and drop
  const handleReorderQuestions = (fromIndex: number, toIndex: number) => {
    const reorderedQuestions = [...surveyQuestions];
    const [movedQuestion] = reorderedQuestions.splice(fromIndex, 1);
    reorderedQuestions.splice(toIndex, 0, movedQuestion);
    
    // Update local state
    setSurveyQuestions(reorderedQuestions);
    
    // Update survey with new question order
    if (survey && onSurveyUpdate) {
      const reorderedQuestionIds = reorderedQuestions.map(q => q.id);
      const updatedSurvey = {
        ...survey,
        selectedQuestions: reorderedQuestionIds
      };
      onSurveyUpdate(updatedSurvey);
    }
    
    // Trigger unsaved changes
    if (onHasUnsavedChanges) {
      onHasUnsavedChanges(true);
    }
  };

  // Handle adding a new section
  const handleAddSection = () => {
    setCurrentSection(undefined);
    setShowSectionEditor(true);
  };

  // Handle saving a section
  const handleSaveSection = (sectionData: any) => {
    const newSection = {
      id: sectionData.id || `section_${Date.now()}`,
      name: sectionData.name,
      description: sectionData.description || '',
      displayOrder: sections.length,
      createdAt: new Date(),
    };

    if (currentSection) {
      // Update existing section
      setSections(prev => prev.map(s => s.id === currentSection.id ? { ...newSection, id: currentSection.id } : s));
    } else {
      // Add new section
      setSections(prev => [...prev, newSection]);
    }

    // Update survey with new sections
    if (survey && onSurveyUpdate) {
      const updatedSurvey = {
        ...survey,
        surveySections: currentSection 
          ? survey.surveySections?.map((s: any) => s.id === currentSection.id ? newSection : s) || [newSection]
          : [...(survey.surveySections || []), newSection]
      };
      onSurveyUpdate(updatedSurvey);
    }

    // Trigger unsaved changes
    if (onHasUnsavedChanges) {
      onHasUnsavedChanges(true);
    }

    // Close editor
    setShowSectionEditor(false);
    setCurrentSection(undefined);
  };

  // Handle editing a section
  const handleEditSection = (section: any) => {
    setCurrentSection(section);
    setShowSectionEditor(true);
  };

  // Handle deleting a section
  const handleDeleteSection = (sectionId: string) => {
    if (window.confirm('Are you sure you want to delete this section? This will remove all questions assigned to this section.')) {
      // Remove section
      setSections(prev => prev.filter(s => s.id !== sectionId));
      
      // Remove questions associated with this section
      setSurveyQuestions(prev => prev.filter(q => q.sectionId !== sectionId));
      
      // Update survey
      if (survey && onSurveyUpdate) {
        const updatedSurvey = {
          ...survey,
          surveySections: survey.surveySections?.filter((s: any) => s.id !== sectionId) || [],
          selectedQuestions: survey.selectedQuestions?.filter((qId: string) => {
            const question = surveyQuestions.find(q => q.id === qId);
            return question?.sectionId !== sectionId;
          }) || []
        };
        onSurveyUpdate(updatedSurvey);
      }

      // Trigger unsaved changes
      if (onHasUnsavedChanges) {
        onHasUnsavedChanges(true);
      }
    }
  };

  // Get questions for a specific section
  const getQuestionsForSection = (sectionId: string) => {
    return surveyQuestions.filter(q => q.sectionId === sectionId);
  };

  // Handle creating a question for a specific section
  const handleCreateQuestionForSection = (sectionId: string) => {
    const onQuestionCreatedCallback = (questionId: string) => {
      // Add question to the section
      const questionDoc = Questions.findOne(questionId);
      if (questionDoc) {
        const newQuestion: QuestionItem = {
          id: questionId,
          text: extractQuestionText(questionDoc),
          type: getLatestQuestionVersion(questionDoc)?.responseType || 'text',
          status: 'published',
          sectionId: sectionId
        };

        setSurveyQuestions(prev => [...prev, newQuestion]);

        // Update survey
        if (survey && onSurveyUpdate) {
          const updatedSurvey = {
            ...survey,
            selectedQuestions: [...(survey.selectedQuestions || []), questionId],
            sectionQuestions: [...(survey.sectionQuestions || []), {
              questionId: questionId,
              sectionId: sectionId,
              type: newQuestion.type,
              order: getQuestionsForSection(sectionId).length
            }]
          };
          onSurveyUpdate(updatedSurvey);
        }

        // Trigger unsaved changes
        if (onHasUnsavedChanges) {
          onHasUnsavedChanges(true);
        }
      }
    };

    openPanel(undefined, surveyId, onQuestionCreatedCallback);
  };

  // Handle choosing from question bank for a specific section
  const handleChooseFromQuestionBankForSection = (sectionId: string) => {
    Meteor.subscribe('questions.all', surveyId, {
      onReady: () => {
        const refreshedQuestions = Questions.find({}, { sort: { createdAt: -1 } }).fetch().map(q => {
          const latestVersion = getLatestQuestionVersion(q);
          return {
            id: q._id || '',
            text: extractQuestionText(q),
            type: latestVersion?.responseType || 'text',
            status: 'published' as const
          };
        });
        setQuestionSelectorItems(refreshedQuestions);
        setCurrentSectionId(sectionId);
        setShowQuestionSelector(true);
      },
      onError: (error: any) => {
        console.error('Error subscribing to questions.all:', error);
        setShowQuestionSelector(true);
      }
    });
  };

  return (
    <div className="survey-builder-panel">
      <div className="survey-builder-panel-content">
        <div style={{ padding: '20px' }}>
          {/* Add the same CSS styles as Questions tab */}
          <style>{`
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
              cursor: pointer;
            }
            .question-item:hover {
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            .question-item.dragging {
              opacity: 0.5;
              transform: rotate(2deg);
            }
            .question-item.drag-over {
              border-top: 2px solid #007bff;
            }
          `}</style>

          {/* Questions List */}
          {(surveyQuestions.length > 0 || sections.length > 0) && (
            <div style={{ marginBottom: '20px' }}>
              <div>
                {/* Render questions without sections first */}
                {surveyQuestions.filter(q => !q.sectionId).map((question, index) => (
                  <div 
                    key={question.id}
                    className={`question-item ${draggingQuestionId === question.id ? 'dragging' : ''} ${dragOverQuestionId === question.id ? 'drag-over' : ''}`}
                    onClick={() => handleEditQuestion(question.id)}
                    draggable
                    onDragStart={(e) => {
                      setDraggingQuestionId(question.id);
                      e.dataTransfer.effectAllowed = 'move';
                      e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
                      e.dataTransfer.setData('text/plain', question.id);
                    }}
                    onDragEnd={() => {
                      setDraggingQuestionId(null);
                      setDragOverQuestionId(null);
                    }}
                    onDragOver={(e) => {
                      e.preventDefault();
                      e.dataTransfer.dropEffect = 'move';
                      if (draggingQuestionId !== question.id) {
                        setDragOverQuestionId(question.id);
                      }
                    }}
                    onDragLeave={(e) => {
                      // Only clear drag over if we're leaving the element entirely
                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                        setDragOverQuestionId(null);
                      }
                    }}
                    onDrop={(e) => {
                      e.preventDefault();
                      const draggedQuestionId = e.dataTransfer.getData('text/plain');
                      
                      if (draggedQuestionId && draggedQuestionId !== question.id) {
                        const fromIndex = surveyQuestions.findIndex(q => q.id === draggedQuestionId);
                        const toIndex = surveyQuestions.findIndex(q => q.id === question.id);
                        
                        if (fromIndex !== -1 && toIndex !== -1) {
                          handleReorderQuestions(fromIndex, toIndex);
                        }
                      }
                      
                      setDragOverQuestionId(null);
                      setDraggingQuestionId(null);
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div 
                        style={{
                          cursor: 'grab',
                          color: '#666',
                          display: 'flex',
                          alignItems: 'center',
                          padding: '4px'
                        }}
                        onMouseDown={(e) => {
                          e.currentTarget.style.cursor = 'grabbing';
                        }}
                        onMouseUp={(e) => {
                          e.currentTarget.style.cursor = 'grab';
                        }}
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
                  </div>
                ))}

                {/* Render sections with their questions */}
                {sections.map((section) => (
                  <div key={section.id} style={{ marginBottom: '24px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', backgroundColor: '#f8fafc' }}>
                    {/* Section Header */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                      <div>
                        <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600, color: '#1f2937' }}>{section.name}</h3>
                        {section.description && (
                          <p style={{ margin: '4px 0 0 0', fontSize: '14px', color: '#6b7280' }}>{section.description}</p>
                        )}
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button
                          onClick={() => handleEditSection(section)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: '4px'
                          }}
                          title="Edit section"
                        >
                          <FiEdit2 />
                        </button>
                        <button
                          onClick={() => handleDeleteSection(section.id)}
                          style={{
                            background: 'none',
                            border: 'none',
                            cursor: 'pointer',
                            color: '#6b7280',
                            padding: '4px'
                          }}
                          title="Delete section"
                        >
                          <FiTrash2 />
                        </button>
                      </div>
                    </div>

                    {/* Section Questions */}
                    <div style={{ marginBottom: '16px' }}>
                      {getQuestionsForSection(section.id).map((question, index) => (
                        <div 
                          key={question.id}
                          className={`question-item ${draggingQuestionId === question.id ? 'dragging' : ''} ${dragOverQuestionId === question.id ? 'drag-over' : ''}`}
                          onClick={() => handleEditQuestion(question.id)}
                          draggable
                          onDragStart={(e) => {
                            setDraggingQuestionId(question.id);
                            e.dataTransfer.effectAllowed = 'move';
                            e.dataTransfer.setData('text/html', e.currentTarget.outerHTML);
                            e.dataTransfer.setData('text/plain', question.id);
                          }}
                          onDragEnd={() => {
                            setDraggingQuestionId(null);
                            setDragOverQuestionId(null);
                          }}
                          onDragOver={(e) => {
                            e.preventDefault();
                            e.dataTransfer.dropEffect = 'move';
                            if (draggingQuestionId !== question.id) {
                              setDragOverQuestionId(question.id);
                            }
                          }}
                          onDragLeave={(e) => {
                            if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                              setDragOverQuestionId(null);
                            }
                          }}
                          onDrop={(e) => {
                            e.preventDefault();
                            const draggedQuestionId = e.dataTransfer.getData('text/plain');
                            
                            if (draggedQuestionId && draggedQuestionId !== question.id) {
                              const fromIndex = surveyQuestions.findIndex(q => q.id === draggedQuestionId);
                              const toIndex = surveyQuestions.findIndex(q => q.id === question.id);
                              
                              if (fromIndex !== -1 && toIndex !== -1) {
                                handleReorderQuestions(fromIndex, toIndex);
                              }
                            }
                            
                            setDragOverQuestionId(null);
                            setDraggingQuestionId(null);
                          }}
                          style={{ marginBottom: '8px' }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                            <div 
                              style={{
                                cursor: 'grab',
                                color: '#666',
                                display: 'flex',
                                alignItems: 'center',
                                padding: '4px'
                              }}
                              onMouseDown={(e) => {
                                e.currentTarget.style.cursor = 'grabbing';
                              }}
                              onMouseUp={(e) => {
                                e.currentTarget.style.cursor = 'grab';
                              }}
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
                        </div>
                      ))}
                      
                      {getQuestionsForSection(section.id).length === 0 && (
                        <div style={{ 
                          padding: '20px', 
                          textAlign: 'center', 
                          color: '#9ca3af', 
                          fontSize: '14px',
                          fontStyle: 'italic'
                        }}>
                          No questions in this section yet
                        </div>
                      )}
                    </div>

                    {/* Section Action Buttons */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <div 
                        className="survey-section-add-question"
                        onClick={() => handleChooseFromQuestionBankForSection(section.id)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          fontSize: '14px',
                          padding: '8px 12px'
                        }}
                      >
                        <FiPlus size={14} /> Choose from Question Bank
                      </div>
                      <div 
                        className="survey-section-add-question"
                        onClick={() => handleCreateQuestionForSection(section.id)}
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: '6px',
                          fontSize: '14px',
                          padding: '8px 12px'
                        }}
                      >
                        <FiPlus size={14} /> Create Question
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div 
              className="survey-section-add-question"
              onClick={handleChooseFromQuestionBank}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FiPlus size={16} /> Choose from Question Bank
            </div>
            <div 
              className="survey-section-add-question"
              onClick={handleCreateQuestion}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FiPlus size={16} /> Create Question
            </div>
            <div 
              className="survey-section-add-question"
              onClick={handleAddSection}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FiLayers size={16} /> Add Section
            </div>
          </div>
        </div>
      </div>

      {/* Question Selector Modal */}
      <QuestionSelector
        isOpen={showQuestionSelector}
        onClose={() => setShowQuestionSelector(false)}
        questions={questionSelectorItems}
        selectedQuestionIds={surveyQuestions.map(q => q.id)}
        onSelectQuestions={handleSelectQuestions}
        sectionId={currentSectionId}
      />

      {/* Section Editor Modal */}
      <SectionEditor
        isOpen={showSectionEditor}
        onClose={() => setShowSectionEditor(false)}
        section={currentSection}
        onSave={handleSaveSection}
      />
    </div>
  );
};

export default SurveyQuestionsTab;
