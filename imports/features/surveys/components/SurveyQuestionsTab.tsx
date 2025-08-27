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
  // Define SurveyOrderItem type to fix TypeScript errors
  type SurveyOrderItem = {
    type: 'question' | 'section';
    id: string;
    order: number;
  };
  
  const [surveyOrder, setSurveyOrder] = useState<Array<SurveyOrderItem>>([]);
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

  // Add loading state to track subscription status
  const [isQuestionsLoading, setIsQuestionsLoading] = useState(false);

  // Load existing survey questions and sections when component mounts or survey changes
  useEffect(() => {
    // Load sections
    if (survey && survey.surveySections && Array.isArray(survey.surveySections)) {
      setSections(survey.surveySections);
    }

    // Load questions
    if (survey && ((survey.selectedQuestions) || 
                   (survey.sectionQuestions && Array.isArray(survey.sectionQuestions) && survey.sectionQuestions.length > 0))) {
      
      // Set loading state to true when starting to load questions
      setIsQuestionsLoading(true);
      console.log('Starting to load questions for survey:', survey._id);
      
      // Combine question IDs from both sources
      const allQuestionIds = new Set<string>();
      
      // Add from selectedQuestions (questions without sections)
      if (survey.selectedQuestions) {
        // Handle both array and object formats for selectedQuestions
        if (Array.isArray(survey.selectedQuestions)) {
          survey.selectedQuestions.forEach((id: string) => allQuestionIds.add(id));
        } else if (typeof survey.selectedQuestions === 'object') {
          // If it's an object, use the keys as question IDs
          Object.keys(survey.selectedQuestions).forEach(id => allQuestionIds.add(id));
        }
      }
      
      // Add from sectionQuestions (questions with sections)
      if (survey.sectionQuestions) {
        survey.sectionQuestions.forEach((sq: any) => {
          if (sq.questionId) allQuestionIds.add(sq.questionId);
          // Also add the question ID directly if it exists
          if (sq.id) allQuestionIds.add(sq.id);
        });
      }
      
      const questionIds = Array.from(allQuestionIds);
      console.log(`Found ${questionIds.length} question IDs to load`);
      
      // Subscribe to get question details
      const subscription = Meteor.subscribe('questions.all', surveyId, {
        onReady: () => {
          console.log('Question subscription ready, loading question data');
          const questions = questionIds.map((id: string) => {
            const questionDoc = Questions.findOne(id);
            if (questionDoc) {
              // Check if this question belongs to a section
              // First check in sectionQuestions array
              let sectionId = null;
              let order = 0;
              
              if (survey.sectionQuestions) {
                // Try to find by questionId first (standard format)
                const sectionQuestion = survey.sectionQuestions.find((sq: any) => sq.questionId === id);
                if (sectionQuestion) {
                  sectionId = sectionQuestion.sectionId;
                  order = sectionQuestion.order || 0;
                } else {
                  // Then try to find by id (sometimes used in imports)
                  const altSectionQuestion = survey.sectionQuestions.find((sq: any) => sq.id === id);
                  if (altSectionQuestion) {
                    sectionId = altSectionQuestion.sectionId;
                    order = altSectionQuestion.order || 0;
                  }
                }
              }
              
              return {
                id: id,
                text: extractQuestionText(questionDoc),
                type: getLatestQuestionVersion(questionDoc)?.responseType || 'text',
                status: 'published' as const,
                sectionId: sectionId,
                order: order
              };
            }
            return null;
          }).filter(Boolean) as QuestionItem[];
          
          // Sort questions by their order
          questions.sort((a, b) => (a.order || 0) - (b.order || 0));
          
          console.log(`Loaded ${questions.length} questions, with ${questions.filter(q => q.sectionId).length} assigned to sections`);
          setSurveyQuestions(questions);
          
          // Build unified order array after questions are loaded
          buildSurveyOrder(questions, survey.surveySections || []);
          
          // Set loading state to false when questions are loaded
          setIsQuestionsLoading(false);
        }
      });
      
      // Cleanup function to handle component unmount
      return () => {
        subscription.stop();
      };
    } else {
      // Clear questions if survey has no questions
      setSurveyQuestions([]);
      setSurveyOrder([]);
      setIsQuestionsLoading(false);
    }
  }, [survey?.sectionQuestions, survey?.selectedQuestions, survey?.surveySections, survey?._id]);

  // Build unified order for sections and questions
  const buildSurveyOrder = (questions: QuestionItem[], sections: any[]) => {
    console.log('Building survey order with:', {
      questionsCount: questions.length,
      sectionsCount: sections.length,
      existingSurveyOrder: survey?.surveyOrder ? survey.surveyOrder.length : 0,
      surveyId: survey?._id
    });
    
    // Log section-question relationships for debugging
    console.log('Section-Question relationships:');
    sections.forEach(section => {
      const sectionQuestions = questions.filter(q => q.sectionId === section.id);
      console.log(`Section ${section.id} (${section.name}): ${sectionQuestions.length} questions`);
    });
    
    // Check for questions without sections
    const unassignedQuestions = questions.filter(q => !q.sectionId);
    console.log(`Questions without sections: ${unassignedQuestions.length}`);
    
    if (survey?.surveyOrder) {
      // Filter out invalid items from the saved order
      const validOrder = survey.surveyOrder.filter((item: SurveyOrderItem) => {
        if (item.type === 'question') return questions.some(q => q.id === item.id);
        if (item.type === 'section') return sections.some(s => s.id === item.id);
        return false;
      });
      
      // Add new questions and sections that are not in the saved order
      const existingQuestionIds = validOrder
        .filter((item: SurveyOrderItem) => item.type === 'question')
        .map((item: SurveyOrderItem) => item.id);
      
      const existingSectionIds = validOrder
        .filter((item: SurveyOrderItem) => item.type === 'section')
        .map((item: SurveyOrderItem) => item.id);
      
      // Add new questions
      const newQuestions = questions.filter(q => !existingQuestionIds.includes(q.id));
      let maxOrder = validOrder.length > 0 ? Math.max(...validOrder.map((item: SurveyOrderItem) => item.order)) : 0;
      
      // Log new questions being added to order
      if (newQuestions.length > 0) {
        console.log(`Adding ${newQuestions.length} new questions to survey order`);
      }
      
      newQuestions.forEach(q => {
        validOrder.push({
          id: q.id,
          type: 'question',
          order: ++maxOrder
        });
      });
      
      // Add new sections
      const newSections = sections.filter(s => !existingSectionIds.includes(s.id));
      
      // Log new sections being added to order
      if (newSections.length > 0) {
        console.log(`Adding ${newSections.length} new sections to survey order`);
      }
      
      newSections.forEach(s => {
        validOrder.push({
          id: s.id,
          type: 'section',
          order: ++maxOrder
        });
        
        // For new sections, also add their questions right after them
        const sectionQuestions = questions.filter(q => q.sectionId === s.id);
        sectionQuestions.forEach(q => {
          // Only add if not already in the order
          if (!existingQuestionIds.includes(q.id)) {
            validOrder.push({
              id: q.id,
              type: 'question',
              order: ++maxOrder
            });
          }
        });
      });
      
      // Sort by order
      const sortedOrder = validOrder.sort((a: SurveyOrderItem, b: SurveyOrderItem) => a.order - b.order);
      setSurveyOrder(sortedOrder);
      
      // Check if the order has actually changed before updating
      const hasOrderChanged = !survey.surveyOrder || 
        JSON.stringify(sortedOrder.map(item => ({ id: item.id, type: item.type }))) !== 
        JSON.stringify(survey.surveyOrder.map((item: SurveyOrderItem) => ({ id: item.id, type: item.type })));
      
      if (hasOrderChanged) {
        console.log('Survey order has changed, will update via onSurveyUpdate');
      } else {
        console.log('Survey order unchanged, skipping update');
      }
      
      // We'll update via onSurveyUpdate in the common code path below if needed
      return;
    }
    
    // If no saved order, build a default order
    const order: SurveyOrderItem[] = [];
    let orderIndex = 0;
    
    // First add questions without sections
    const standAloneQuestions = questions.filter(q => !q.sectionId);
    standAloneQuestions.forEach((q: QuestionItem) => {
      order.push({
        id: q.id,
        type: 'question',
        order: orderIndex++
      });
    });
    
    // Then add sections and their questions
    sections.forEach(section => {
      // Add the section
      order.push({
        id: section.id,
        type: 'section',
        order: orderIndex++
      });
      
      // Add questions for this section
      const sectionQuestions = questions.filter(q => q.sectionId === section.id);
      sectionQuestions.sort((a, b) => (a.order || 0) - (b.order || 0));
      
      sectionQuestions.forEach(q => {
        order.push({
          id: q.id,
          type: 'question',
          order: orderIndex++
        });
      });
    });
    
    setSurveyOrder(order);
    console.log(`Built new survey order with ${order.length} items (${standAloneQuestions.length} standalone questions, ${sections.length} sections)`);
    
    // If the order has changed from what's saved in the survey, update it
    // Compare only the id and type fields to avoid false positives from order changes
    const hasOrderChanged = !survey.surveyOrder || 
      JSON.stringify(order.map(item => ({ id: item.id, type: item.type }))) !== 
      JSON.stringify(survey.surveyOrder.map((item: SurveyOrderItem) => ({ id: item.id, type: item.type })));
    
    if (survey && hasOrderChanged) {
      console.log('Survey order changed, updating survey:', {
        oldOrderLength: survey?.surveyOrder?.length || 0,
        newOrderLength: order.length,
        onSurveyUpdateExists: !!onSurveyUpdate
      });
      
      const updatedSurvey = {
        ...survey,
        surveyOrder: order
      };
      
      if (onSurveyUpdate) {
        onSurveyUpdate(updatedSurvey);
        console.log('Called onSurveyUpdate with updated survey order');
        
        // Also save directly to database to ensure survey order is persisted
        if (survey?._id) {
          Meteor.call('surveys.update', survey._id, { surveyOrder: order }, (error: any) => {
            if (error) {
              console.error('Error updating survey order:', error);
            } else {
              console.log('Survey order updated in database');
            }
          });
        }
      } else {
        console.error('onSurveyUpdate callback is not available!');
      }
    } else {
      console.log('Survey order unchanged, skipping update');
    }
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
    
    // Update surveyOrder with new questions
    const updatedSurveyOrder = [...surveyOrder];
    let maxOrder = updatedSurveyOrder.length > 0 ? 
      Math.max(...updatedSurveyOrder.map(item => item.order)) : 0;
    
    // Add new questions to the order
    newQuestions.forEach(question => {
      // If the question is assigned to a section, don't add it to the main order
      // It will be shown within its section
      if (!question.sectionId) {
        updatedSurveyOrder.push({
          id: question.id,
          type: 'question',
          order: ++maxOrder
        });
      }
    });
    
    // Update the state with the new order
    setSurveyOrder(updatedSurveyOrder);
    
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
        surveyOrder: updatedSurveyOrder // Use the updated survey order
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
    console.log('Saving section with data:', sectionData);
    console.log('Document fields in sectionData:', {
      document: sectionData.document ? 'exists (length: ' + sectionData.document.length + ')' : 'missing',
      documentName: sectionData.documentName,
      documentType: sectionData.documentType
    });
    
    // Create a new section object with all necessary fields
    const newSection = {
      id: sectionData.id || `section_${Date.now()}`,
      name: sectionData.name,
      description: sectionData.description || '',
      displayOrder: sections.length,
      createdAt: new Date(),
      isActive: sectionData.isActive !== undefined ? sectionData.isActive : true,
      isRequired: sectionData.isRequired !== undefined ? sectionData.isRequired : false,
      color: sectionData.color || '#552a47',
      priority: sectionData.priority || 0,
      instructions: sectionData.instructions || '',
      // Explicitly include document fields
      image: sectionData.image,
      document: sectionData.document,
      documentName: sectionData.documentName,
      documentType: sectionData.documentType,
    };
    
    console.log('Created newSection with document fields:', {
      document: newSection.document ? 'exists (length: ' + newSection.document.length + ')' : 'missing',
      documentName: newSection.documentName,
      documentType: newSection.documentType
    });

    if (currentSection) {
      // Update existing section
      setSections(prev => prev.map(s => s.id === currentSection.id ? { ...newSection, id: currentSection.id } : s));
    } else {
      // Add new section
      setSections(prev => [...prev, newSection]);
    }

    // Update survey with new sections
    if (survey && onSurveyUpdate) {
      // Create a proper updated sections array that preserves all fields including document data
      let updatedSections;
      
      if (currentSection) {
        // Update existing section
        updatedSections = (survey.surveySections || []).map((s: any) => {
          if (s.id === currentSection.id) {
            // Make sure we preserve all fields from the new section
            return {
              ...newSection,
              id: currentSection.id,
              // Explicitly include document fields to ensure they're not lost
              document: newSection.document,
              documentName: newSection.documentName,
              documentType: newSection.documentType
            };
          }
          return s;
        });
      } else {
        // Add new section
        updatedSections = [...(survey.surveySections || []), newSection];
      }
      
      // Log the document data in the updated sections array
      const updatedSection = updatedSections.find((s: any) => s.id === newSection.id);
      console.log('Updated sections array with document fields for section', newSection.id, ':', {
        document: updatedSection?.document ? 'exists (length: ' + updatedSection.document.length + ')' : 'missing',
        documentName: updatedSection?.documentName,
        documentType: updatedSection?.documentType
      });
      
      // Create the updated survey object
      const updatedSurvey = {
        ...survey,
        surveySections: updatedSections,
        surveyOrder: surveyOrder
      };
      
      // Log the document data in the updated survey object
      const sectionInSurvey = updatedSurvey.surveySections?.find((s: any) => s.id === newSection.id);
      console.log('Updated survey object with document fields for section', newSection.id, ':', {
        document: sectionInSurvey?.document ? 'exists (length: ' + sectionInSurvey.document.length + ')' : 'missing',
        documentName: sectionInSurvey?.documentName,
        documentType: sectionInSurvey?.documentType
      });
      
      // Update the survey
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
    console.log('Editing section with data:', section);
    console.log('Document fields in passed section:', {
      document: section.document ? 'exists' : 'missing',
      documentName: section.documentName,
      documentType: section.documentType
    });
    
    // First try to find the complete section data from the survey.surveySections array
    // This is the most reliable source as it contains data from the database
    let fullSectionData;
    if (survey && survey.surveySections && Array.isArray(survey.surveySections)) {
      fullSectionData = survey.surveySections.find((s: any) => s.id === section.id);
      if (fullSectionData) {
        console.log('Found full section data from survey.surveySections with document fields:', {
          document: fullSectionData.document ? 'exists' : 'missing',
          documentName: fullSectionData.documentName,
          documentType: fullSectionData.documentType
        });
      }
    }
    
    // If not found in survey.surveySections, try the local sections state
    if (!fullSectionData) {
      fullSectionData = sections.find(s => s.id === section.id);
      if (fullSectionData) {
        console.log('Found full section data from local sections with document fields:', {
          document: fullSectionData.document ? 'exists' : 'missing',
          documentName: fullSectionData.documentName,
          documentType: fullSectionData.documentType
        });
      }
    }
    
    // Use the full section data if found, otherwise use the passed section
    if (fullSectionData) {
      setCurrentSection(fullSectionData);
    } else {
      console.log('No full section data found, using passed section');
      setCurrentSection(section);
    }
    
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

      // Close editor
      setShowSectionEditor(false);
      setCurrentSection(undefined);
    }
  };

  // Get questions for a specific section
  const getQuestionsForSection = (sectionId: string) => {
    return surveyQuestions
      .filter(q => q.sectionId === sectionId)
      .sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by order property
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
                              onClick={() => handleEditSection(section)}
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
                              .sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order property
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
