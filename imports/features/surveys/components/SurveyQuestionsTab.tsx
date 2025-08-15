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
  const [currentSectionId, setCurrentSectionId] = useState<string | undefined>(undefined);
  const [questionSelectorItems, setQuestionSelectorItems] = useState<QuestionItem[]>([]);
  const [draggingQuestionId, setDraggingQuestionId] = useState<string | null>(null);
  const [dragOverQuestionId, setDragOverQuestionId] = useState<string | null>(null);
  const [draggingSectionId, setDraggingSectionId] = useState<string | null>(null);
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<'before' | 'after' | 'inside' | null>(null);
  const [dragType, setDragType] = useState<'question' | 'section' | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  const [surveyOrder, setSurveyOrder] = useState<Array<{type: 'question' | 'section', id: string, order: number}>>([]);
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [currentSection, setCurrentSection] = useState<any>(undefined);

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
          
          // Build unified order array
          buildSurveyOrder(questions, survey.surveySections || []);
        }
      });
    } else if (!survey?.selectedQuestions || !Array.isArray(survey.selectedQuestions) || survey.selectedQuestions.length === 0) {
      // Clear questions if survey has no selected questions
      setSurveyQuestions([]);
      setSurveyOrder([]);
    }
  }, [survey?.selectedQuestions]);

  // Build unified order for sections and questions
  const buildSurveyOrder = (questions: QuestionItem[], sections: any[]) => {
    // Check if survey already has a saved order
    if (survey?.surveyOrder && Array.isArray(survey.surveyOrder)) {
      // Filter existing order to only include items that still exist
      const validOrder = survey.surveyOrder.filter((item: any) => {
        if (item.type === 'question') {
          return questions.some(q => q.id === item.id);
        } else if (item.type === 'section') {
          return sections.some(s => s.id === item.id);
        }
        return false;
      });
      
      // Add any new items that aren't in the saved order
      const existingIds = validOrder.map((item: any) => item.id);
      let maxOrder = validOrder.length > 0 ? Math.max(...validOrder.map((item: any) => item.order)) : -1;
      
      // Add new questions
      questions.forEach(q => {
        if (!existingIds.includes(q.id)) {
          validOrder.push({ type: 'question', id: q.id, order: ++maxOrder });
        }
      });
      
      // Add new sections
      sections.forEach(s => {
        if (!existingIds.includes(s.id)) {
          validOrder.push({ type: 'section', id: s.id, order: ++maxOrder });
        }
      });
      
      setSurveyOrder(validOrder.sort((a: any, b: any) => a.order - b.order));
      return;
    }
    
    // Build default order if no saved order exists
    const order: Array<{type: 'question' | 'section', id: string, order: number}> = [];
    let currentOrder = 0;
    
    // Add questions without sections first
    const noSectionQuestions = questions.filter(q => !q.sectionId);
    noSectionQuestions.forEach(q => {
      order.push({ type: 'question', id: q.id, order: currentOrder++ });
    });
    
    // Add sections with their questions
    sections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)).forEach(section => {
      order.push({ type: 'section', id: section.id, order: currentOrder++ });
      
      const sectionQuestions = questions.filter(q => q.sectionId === section.id);
      sectionQuestions.forEach(q => {
        order.push({ type: 'question', id: q.id, order: currentOrder++ });
      });
    });
    
    setSurveyOrder(order);
  };

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
                selectedQuestions: [...currentQuestions, questionId],
                surveyOrder: surveyOrder
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
        selectedQuestions: currentQuestions.filter((id: string) => id !== questionId),
        surveyOrder: surveyOrder
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
    
    // Get questions that aren't already in the survey
    const questionsToAdd = selectedQuestionIds.filter(id => 
      !surveyQuestions.some(q => q.id === id)
    );
    
    if (questionsToAdd.length === 0) {
      setShowQuestionSelector(false);
      return;
    }
    
    // Create question items for the new questions
    const newQuestions: QuestionItem[] = questionsToAdd.map(id => {
      const questionDoc = Questions.findOne(id);
      if (questionDoc) {
        return {
          id: id,
          text: extractQuestionText(questionDoc),
          type: getLatestQuestionVersion(questionDoc)?.responseType || 'text',
          status: 'published' as const,
          sectionId: currentSectionId || undefined // Assign to section if specified
        };
      }
      return null;
    }).filter(Boolean) as QuestionItem[];
    
    // Add to survey questions
    setSurveyQuestions(prev => [...prev, ...newQuestions]);
    
    // Update survey with new questions and section assignments
    if (survey && onSurveyUpdate) {
      const updatedSurvey = {
        ...survey,
        selectedQuestions: [...(survey.selectedQuestions || []), ...questionsToAdd],
        sectionQuestions: [
          ...(survey.sectionQuestions || []),
          ...questionsToAdd.map(questionId => ({
            questionId,
            sectionId: currentSectionId || null,
            order: (survey.sectionQuestions || []).length + questionsToAdd.indexOf(questionId)
          }))
        ],
        surveyOrder: surveyOrder
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

  // Handle moving items in the unified order
  const handleMoveInOrder = (draggedType: 'question' | 'section', draggedId: string, targetOrder: number, newSectionId?: string) => {
    // Remove dragged item from current position
    const newOrder = surveyOrder.filter(item => !(item.type === draggedType && item.id === draggedId));
    
    // Adjust target order if needed
    const adjustedTargetOrder = Math.min(targetOrder, newOrder.length);
    
    // Insert at new position
    newOrder.splice(adjustedTargetOrder, 0, { type: draggedType, id: draggedId, order: adjustedTargetOrder });
    
    // Reorder all items
    const reorderedItems = newOrder.map((item, index) => ({ ...item, order: index }));
    setSurveyOrder(reorderedItems);
    
    // Update questions if it's a question being moved
    if (draggedType === 'question') {
      const updatedQuestions = surveyQuestions.map(q => 
        q.id === draggedId ? { ...q, sectionId: newSectionId } : q
      );
      setSurveyQuestions(updatedQuestions);
      
      // Update survey data
      if (survey && onSurveyUpdate) {
        const updatedSurvey = {
          ...survey,
          selectedQuestions: updatedQuestions.map(q => q.id),
          sectionQuestions: updatedQuestions.map((q, index) => ({
            questionId: q.id,
            sectionId: q.sectionId || null,
            order: index
          })),
          surveyOrder: surveyOrder
        };
        onSurveyUpdate(updatedSurvey);
      }
    } else {
      // Update section order
      const updatedSections = sections.map(s => {
        const orderItem = reorderedItems.find(item => item.type === 'section' && item.id === s.id);
        return orderItem ? { ...s, displayOrder: orderItem.order } : s;
      });
      setSections(updatedSections);
      
      if (survey && onSurveyUpdate) {
        const updatedSurvey = {
          ...survey,
          surveySections: updatedSections,
          surveyOrder: surveyOrder
        };
        onSurveyUpdate(updatedSurvey);
      }
    }
    
    if (onHasUnsavedChanges) {
      onHasUnsavedChanges(true);
    }
  };

  // Handle moving sections - improved to handle mixed ordering with questions
  const handleMoveSection = (sectionId: string, targetIndex: number, insertAfterQuestion?: string) => {
    const sectionToMove = sections.find(s => s.id === sectionId);
    if (!sectionToMove) return;

    // If inserting after a specific question, calculate the proper position
    if (insertAfterQuestion) {
      const questionIndex = surveyQuestions.findIndex(q => q.id === insertAfterQuestion);
      if (questionIndex !== -1) {
        const question = surveyQuestions[questionIndex];
        if (question.sectionId) {
          // Question is in a section, place after that section
          const sectionIndex = sections.findIndex(s => s.id === question.sectionId);
          targetIndex = sectionIndex + 1;
        } else {
          // Question is in no-section area, place section appropriately
          const noSectionQuestions = surveyQuestions.filter(q => !q.sectionId);
          const questionPositionInNoSection = noSectionQuestions.findIndex(q => q.id === insertAfterQuestion);
          
          // Count how many sections come before this question position
          let sectionsBeforeQuestion = 0;
          for (let i = 0; i <= questionPositionInNoSection; i++) {
            // This is a simplified approach - in a real implementation you'd need
            // to track the exact interleaved order of sections and questions
          }
          targetIndex = sectionsBeforeQuestion;
        }
      }
    }

    const otherSections = sections.filter(s => s.id !== sectionId);
    const newSections = [...otherSections];
    newSections.splice(targetIndex, 0, { ...sectionToMove, displayOrder: targetIndex });

    // Update display orders
    const reorderedSections = newSections.map((section, index) => ({
      ...section,
      displayOrder: index
    }));

    setSections(reorderedSections);

    // Update survey data
    if (survey && onSurveyUpdate) {
      const updatedSurvey = {
        ...survey,
        surveySections: reorderedSections
      };
      onSurveyUpdate(updatedSurvey);
    }

    if (onHasUnsavedChanges) {
      onHasUnsavedChanges(true);
    }
  };

  // Handle drag start
  const handleDragStart = (e: React.DragEvent, type: 'question' | 'section', id: string) => {
    setDragType(type);
    if (type === 'question') {
      setDraggingQuestionId(id);
    } else {
      setDraggingSectionId(id);
    }
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ type, id }));
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDragType(null);
    setDraggingQuestionId(null);
    setDraggingSectionId(null);
    setDragOverQuestionId(null);
    setDragOverSectionId(null);
    setDragOverPosition(null);
  };

  // Handle drag over with position detection
  const handleDragOver = (e: React.DragEvent, targetType: 'question' | 'section', targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    let position: 'before' | 'after' | 'inside';
    
    if (targetType === 'section') {
      // For sections, determine if dropping before, inside, or after
      if (y < height * 0.25) {
        position = 'before';
      } else if (y > height * 0.75) {
        position = 'after';
      } else {
        position = 'inside';
      }
      setDragOverSectionId(targetId);
    } else {
      // For questions, determine if dropping before or after
      position = y < height * 0.5 ? 'before' : 'after';
      setDragOverQuestionId(targetId);
    }
    
    setDragOverPosition(position);
  };

  // Handle drop with unified ordering logic
  const handleDrop = (e: React.DragEvent, targetType: 'question' | 'section', targetId: string) => {
    e.preventDefault();
    
    const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { type: draggedType, id: draggedId } = dragData;

    // Find target position in unified order
    const targetOrderItem = surveyOrder.find(item => item.type === targetType && item.id === targetId);
    if (!targetOrderItem) return;

    let targetOrder = targetOrderItem.order;
    let newSectionId: string | undefined;

    if (draggedType === 'question') {
      if (targetType === 'section') {
        if (dragOverPosition === 'inside') {
          // Move question into section
          newSectionId = targetId;
          // Place after section header
          targetOrder = targetOrderItem.order + 1;
        } else if (dragOverPosition === 'before') {
          // Place before section
          newSectionId = undefined;
          targetOrder = targetOrderItem.order;
        } else {
          // Place after section (and its questions)
          newSectionId = undefined;
          // Find the last item in this section
          const sectionQuestions = surveyOrder.filter(item => 
            item.order > targetOrderItem.order && 
            (surveyOrder.find(nextSection => nextSection.type === 'section' && nextSection.order > item.order)?.order || Infinity) > item.order
          );
          targetOrder = sectionQuestions.length > 0 ? 
            Math.max(...sectionQuestions.map(q => q.order)) + 1 : 
            targetOrderItem.order + 1;
        }
      } else {
        // Dropping question on question
        const targetQuestion = surveyQuestions.find(q => q.id === targetId);
        newSectionId = targetQuestion?.sectionId;
        targetOrder = dragOverPosition === 'before' ? targetOrderItem.order : targetOrderItem.order + 1;
      }
    } else {
      // Dropping section
      targetOrder = dragOverPosition === 'before' ? targetOrderItem.order : targetOrderItem.order + 1;
    }

    handleMoveInOrder(draggedType, draggedId, targetOrder, newSectionId);
    handleDragEnd();
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
          : [...(survey.surveySections || []), newSection],
        surveyOrder: surveyOrder
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
          sectionQuestions: survey.sectionQuestions?.filter((sq: any) => {
            return sq.sectionId !== sectionId;
          }) || [],
          surveyOrder: surveyOrder
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
      console.log('Question created for section with ID:', questionId, 'Section:', sectionId);
      
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
            status: 'published' as 'published',
            sectionId: sectionId
          };
          
          console.log('Adding question to section:', newQuestion);
          
          // Add the question to the survey questions list immediately
          setSurveyQuestions(prev => {
            // Check if question already exists to avoid duplicates
            if (prev.some(q => q.id === questionId)) {
              return prev;
            }
            return [...prev, newQuestion];
          });
          
          // Update survey with the new question
          if (survey && onSurveyUpdate) {
            const currentQuestions = Array.isArray(survey.selectedQuestions) ? survey.selectedQuestions : [];
            // Check if question ID already exists to avoid duplicates
            if (!currentQuestions.includes(questionId)) {
              const updatedSurvey = {
                ...survey,
                selectedQuestions: [...currentQuestions, questionId],
                sectionQuestions: [
                  ...(survey.sectionQuestions || []),
                  {
                    questionId: questionId,
                    sectionId: sectionId,
                    order: (survey.sectionQuestions || []).length
                  }
                ],
                surveyOrder: surveyOrder
              };
              console.log('Updating survey with new question for section:', updatedSurvey.selectedQuestions);
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

    openPanel(undefined, surveyId, onQuestionCreatedCallback);
  };

  // Handle choosing from question bank for a specific section
  const handleChooseFromQuestionBankForSection = (sectionId: string) => {
    setCurrentSectionId(sectionId);
    
    Meteor.subscribe('questions.all', {
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
        setShowQuestionSelector(true);
      },
      onError: (error: any) => {
        console.error('Error subscribing to questions.all:', error);
        setShowQuestionSelector(true);
      }
    });
  };

  // Get drop zone classes for visual feedback
  const getDropZoneClasses = (type: 'question' | 'section', id: string) => {
    const classes = [];
    
    if (type === 'question' && dragOverQuestionId === id) {
      classes.push(`drag-over-${dragOverPosition}`);
    } else if (type === 'section' && dragOverSectionId === id) {
      classes.push(`drag-over-${dragOverPosition}`);
    }
    
    if ((type === 'question' && draggingQuestionId === id) || 
        (type === 'section' && draggingSectionId === id)) {
      classes.push('dragging');
    }
    
    return classes.join(' ');
  };

  return (
    <div className="survey-builder-panel">
      <div className="survey-builder-panel-content">
        <div style={{ padding: '20px' }}>
          {/* Enhanced CSS styles for drag and drop */}
          <style>{`
            .question-item {
              padding: 12px 16px;
              background-color: #fff;
              border-radius: 8px;
              border: 1px solid #e2e8f0;
              margin-bottom: 8px;
              box-shadow: 0 1px 3px rgba(0,0,0,0.1);
              position: relative;
              transition: all 0.2s ease;
              cursor: pointer;
            }
            .question-item:hover {
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
            }
            .question-item .question-actions {
              opacity: 0;
              transition: opacity 0.2s ease;
              margin-left: auto;
            }
            .question-item:hover .question-actions {
              opacity: 1;
            }
            .question-item.dragging {
              opacity: 0.5;
              transform: rotate(2deg);
              z-index: 1000;
            }
            .question-item.drag-over-before {
              border-top: 3px solid #007bff;
              margin-top: 8px;
            }
            .question-item.drag-over-after {
              border-bottom: 3px solid #007bff;
              margin-bottom: 8px;
            }
            .section-container {
              transition: all 0.2s ease;
            }
            .section-container.dragging {
              opacity: 0.5;
              transform: rotate(1deg);
              z-index: 1000;
            }
            .section-container.drag-over-before {
              border-top: 3px solid #28a745;
              margin-top: 8px;
            }
            .section-container.drag-over-after {
              border-bottom: 3px solid #28a745;
              margin-bottom: 8px;
            }
            .section-container.drag-over-inside {
              border: 2px solid #28a745;
              background-color: rgba(40, 167, 69, 0.05);
            }
            .drop-zone {
              height: 4px;
              background-color: transparent;
              transition: all 0.2s ease;
              margin: 2px 0;
            }
            .drop-zone.active {
              height: 8px;
              background-color: #007bff;
              border-radius: 4px;
              margin: 4px 0;
            }
            .drop-zone.section-target {
              background-color: #28a745;
            }
            .drag-handle {
              cursor: grab;
              color: #666;
              display: flex;
              align-items: center;
              padding: 4px;
            }
            .drag-handle:active {
              cursor: grabbing;
            }
          `}</style>

          {/* Questions List */}
          {(surveyQuestions.length > 0 || sections.length > 0) && (
            <div style={{ marginBottom: '20px' }}>
              <div>
                {/* Render items in unified order */}
                {surveyOrder.map((orderItem, index) => {
                  if (orderItem.type === 'question') {
                    const question = surveyQuestions.find(q => q.id === orderItem.id);
                    if (!question || question.sectionId) return null;
                    
                    return (
                      <div 
                        key={question.id}
                        className={`question-item ${getDropZoneClasses('question', question.id)}`}
                        onClick={() => handleEditQuestion(question.id)}
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'question', question.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, 'question', question.id)}
                        onDragLeave={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            setDragOverQuestionId(null);
                            setDragOverPosition(null);
                          }
                        }}
                        onDrop={(e) => handleDrop(e, 'question', question.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                          <div className="drag-handle">
                            <FiMove size={16} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>{question.text}</div>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                              {question.type}
                            </div>
                          </div>
                          <div className="question-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditQuestion(question.id);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#6b7280',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Edit question"
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDeleteQuestion(question.id);
                              }}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#dc2626',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Delete question"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  } else if (orderItem.type === 'section') {
                    const section = sections.find(s => s.id === orderItem.id);
                    if (!section) return null;
                    
                    return (
                      <div 
                        key={section.id} 
                        className={`section-container ${getDropZoneClasses('section', section.id)}`}
                        style={{ marginBottom: '24px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', backgroundColor: '#f8fafc' }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, 'section', section.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, 'section', section.id)}
                        onDragLeave={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            setDragOverSectionId(null);
                            setDragOverPosition(null);
                          }
                        }}
                        onDrop={(e) => handleDrop(e, 'section', section.id)}
                      >
                        {/* Section Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <div className="drag-handle">
                              <FiMove size={16} />
                            </div>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                              {section.name}
                            </h3>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            <button
                              onClick={() => handleEditSection(section.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#6b7280',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Edit section"
                            >
                              <FiEdit2 size={14} />
                            </button>
                            <button
                              onClick={() => handleDeleteSection(section.id)}
                              style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                color: '#dc2626',
                                padding: '4px',
                                display: 'flex',
                                alignItems: 'center'
                              }}
                              title="Delete section"
                            >
                              <FiTrash2 size={14} />
                            </button>
                          </div>
                        </div>

                        {/* Section Questions */}
                        <div style={{ paddingLeft: '24px' }}>
                          {surveyQuestions.filter(q => q.sectionId === section.id).length > 0 ? (
                            surveyQuestions
                              .filter(q => q.sectionId === section.id)
                              .map(question => (
                                <div 
                                  key={question.id}
                                  className={`question-item ${getDropZoneClasses('question', question.id)}`}
                                  onClick={() => handleEditQuestion(question.id)}
                                  draggable
                                  onDragStart={(e) => handleDragStart(e, 'question', question.id)}
                                  onDragEnd={handleDragEnd}
                                  onDragOver={(e) => handleDragOver(e, 'question', question.id)}
                                  onDragLeave={(e) => {
                                    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                      setDragOverQuestionId(null);
                                      setDragOverPosition(null);
                                    }
                                  }}
                                  onDrop={(e) => handleDrop(e, 'question', question.id)}
                                >
                                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                                    <div className="drag-handle">
                                      <FiMove size={16} />
                                    </div>
                                    <div style={{ flex: 1 }}>
                                      <div style={{ fontWeight: 500 }}>{question.text}</div>
                                      <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                                        {question.type}
                                      </div>
                                    </div>
                                    <div className="question-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleEditQuestion(question.id);
                                        }}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          cursor: 'pointer',
                                          color: '#6b7280',
                                          padding: '4px',
                                          display: 'flex',
                                          alignItems: 'center'
                                        }}
                                        title="Edit question"
                                      >
                                        <FiEdit2 size={14} />
                                      </button>
                                      <button
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDeleteQuestion(question.id);
                                        }}
                                        style={{
                                          background: 'none',
                                          border: 'none',
                                          cursor: 'pointer',
                                          color: '#dc2626',
                                          padding: '4px',
                                          display: 'flex',
                                          alignItems: 'center'
                                        }}
                                        title="Delete question"
                                      >
                                        <FiTrash2 size={14} />
                                      </button>
                                    </div>
                                  </div>
                                </div>
                              ))
                          ) : (
                            <div style={{ color: '#666', fontStyle: 'italic', padding: '16px 0' }}>
                              No questions in this section yet
                            </div>
                          )}
                        </div>

                        {/* Section Action Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
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
                    );
                  }
                  return null;
                })}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '20px' }}>
            <div 
              className="survey-section-add-question"
              onClick={handleAddSection}
              style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              <FiLayers size={16} /> Add Section
            </div>
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
        sectionId={currentSectionId || ''}
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
