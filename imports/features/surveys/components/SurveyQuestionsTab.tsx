import React, { useState, useEffect } from 'react';
import { FiPlus, FiEdit2, FiTrash2, FiMove, FiLayers, FiLock, FiChevronUp, FiChevronDown } from 'react-icons/fi';
import { useQuestionBuilderPanel } from '../../../features/questions/contexts/QuestionBuilderPanelContext';
import { useTracker } from 'meteor/react-meteor-data';
import { Questions } from '../../../features/questions/api/questions';
import QuestionSelector from './sections/QuestionSelector';
import SectionEditor from './sections/SectionEditor';
import { Meteor } from 'meteor/meteor';
import EditWarningModal from '../../../features/questions/components/admin/EditWarningModal';
import { QuestionItem } from '../types';

interface SurveyQuestionsTabProps {
  surveyId?: string;
  survey?: any;
  onSurveyUpdate?: (survey: any) => void;
  onHasUnsavedChanges?: (hasChanges: boolean) => void;
  onValidationCheck?: React.MutableRefObject<(() => { isValid: boolean; errors: string[] }) | null>;
}

const SurveyQuestionsTab: React.FC<SurveyQuestionsTabProps> = ({
  surveyId,
  survey,
  onSurveyUpdate,
  onHasUnsavedChanges,
  onValidationCheck,
}) => {
  const { openPanel } = useQuestionBuilderPanel();
  const [surveyQuestions, setSurveyQuestions] = useState<QuestionItem[]>([]);
  const [showQuestionSelector, setShowQuestionSelector] = useState(false);
  const [currentSectionId, setCurrentSectionId] = useState<string | undefined>(undefined);
  const [questionSelectorItems, setQuestionSelectorItems] = useState<QuestionItem[]>([]);
  const [draggingQuestionId, setDraggingQuestionId] = useState<string | null>(null);
  const [dragOverQuestionId, setDragOverQuestionId] = useState<string | null>(null);
  // Section drop zone for empty sections
  const [dragOverSectionId, setDragOverSectionId] = useState<string | null>(null);
  const [dragOverPosition, setDragOverPosition] = useState<'before' | 'after' | 'inside' | null>(null);
  const [dragType, setDragType] = useState<'question' | null>(null);
  const [sections, setSections] = useState<any[]>([]);
  // Define SurveyOrderItem type to fix TypeScript errors
  type SurveyOrderItem = {
    type: 'question' | 'section';
    id: string;
    order: number;
    sectionId?: string; // For questions: which section they belong to. For sections: their own ID
  };
  
  const [surveyOrder, setSurveyOrder] = useState<Array<SurveyOrderItem>>([]);

  // Helper function to get all items (section + questions) that belong to a section group
  const getSectionGroup = (sectionId: string): SurveyOrderItem[] => {
    // Find the section first
    const sectionItem = surveyOrder.find(item => 
      item.type === 'section' && item.id === sectionId
    );
    
    if (!sectionItem) {
      console.warn(`Section ${sectionId} not found in surveyOrder`);
      return [];
    }
    
    // Get all questions that belong to this section
    const sectionQuestions = surveyOrder.filter(item => 
      item.type === 'question' && item.sectionId === sectionId
    );
    
    // Return section + its questions, sorted by order
    const group = [sectionItem, ...sectionQuestions].sort((a, b) => a.order - b.order);
    
    console.log(`📋 Section group for ${sectionId}:`, group.map(item => `${item.type}:${item.id}:${item.order}`));
    return group;
  };

  // Helper function to get the next available order number
  const getNextOrderNumber = (): number => {
    return surveyOrder.length > 0 ? Math.max(...surveyOrder.map(item => item.order)) + 1 : 0;
  };

  // Helper function to recalculate all order values sequentially
  const recalculateAllOrders = (items: SurveyOrderItem[]): SurveyOrderItem[] => {
    return items.map((item, index) => ({
      ...item,
      order: index
    }));
  };

  // Helper function to validate section-question order consistency
  const validateSectionQuestionOrder = () => {
    const sections = surveyOrder.filter(item => item.type === 'section');
    
    sections.forEach(section => {
      const sectionQuestions = surveyOrder.filter(item => 
        item.type === 'question' && item.sectionId === section.id
      );
      
      // Check that questions immediately follow their parent section
      const sectionIndex = surveyOrder.findIndex(item => item.id === section.id);
      sectionQuestions.forEach((question, index) => {
        const expectedOrder = sectionIndex + index + 1;
        if (question.order !== expectedOrder) {
          console.warn(`❌ Question ${question.id} order mismatch: expected ${expectedOrder}, got ${question.order}`);
        }
      });
    });
    
    console.log('✅ Section-question order validation completed');
  };

  // Validation function to check for empty sections
  const validateSectionsHaveQuestions = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];
    
    // Check each section to see if it has questions
    sections.forEach(section => {
      const sectionQuestions = surveyQuestions.filter(q => q.sectionId === section.id);
      if (sectionQuestions.length === 0) {
        errors.push(`Section "${section.name}" has no questions`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };
  const [showSectionEditor, setShowSectionEditor] = useState(false);
  const [deleteConfirmation, setDeleteConfirmation] = useState<{
    questionId: string;
    position: { x: number; y: number };
  } | null>(null);
  const [deleteSectionConfirmation, setDeleteSectionConfirmation] = useState<{
    sectionId: string;
    position: { x: number; y: number };
  } | null>(null);
  const [currentSection, setCurrentSection] = useState<any>(undefined);
  
  // State for the edit warning modal
  const [showEditWarningModal, setShowEditWarningModal] = useState(false);
  const [selectedQuestionId, setSelectedQuestionId] = useState<string | undefined>(undefined);
  const [questionResponseCount, setQuestionResponseCount] = useState(0);

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

  // Add this state to store question documents with import status
const [questionDocsMap, setQuestionDocsMap] = useState<Record<string, any>>({});

// Expose validation function to parent component
useEffect(() => {
  if (onValidationCheck) {
    onValidationCheck.current = () => {
      return validateSectionsHaveQuestions();
    };
  }
}, [sections, surveyQuestions, onValidationCheck]);

// Load existing survey questions and sections when component mounts or survey changes
useEffect(() => {
  // Load sections
  if (survey && survey.surveySections && Array.isArray(survey.surveySections)) {
    if (survey.surveySections.length === 0) {
      // Create a default section if no sections exist
      const defaultSection = {
        id: `section_default_${Date.now()}`,
        name: 'Default Section',
        description: '',
        displayOrder: 0,
        createdAt: new Date(),
        isActive: true,
        isRequired: false,
        color: '#552a47',
        priority: 0,
        instructions: ''
      };
      
      // Update local state with default section
      setSections([defaultSection]);
      
      // Update survey with default section
      if (onSurveyUpdate) {
        const updatedSurveyOrder = [...(survey.surveyOrder || [])];
        const newOrderItem = {
          id: defaultSection.id,
          type: 'section' as const,
          order: updatedSurveyOrder.length
        };
        updatedSurveyOrder.push(newOrderItem);
        
        const updatedSurvey = {
          ...survey,
          surveySections: [defaultSection],
          surveyOrder: updatedSurveyOrder
        };
        
        onSurveyUpdate(updatedSurvey);
      }
    } else {
      setSections(survey.surveySections);
    }
  } else if (survey) {
    // If survey exists but has no sections array, create a default section
    const defaultSection = {
      id: `section_default_${Date.now()}`,
      name: 'Default Section',
      description: '',
      displayOrder: 0,
      createdAt: new Date(),
      isActive: true,
      isRequired: false,
      color: '#552a47',
      priority: 0,
      instructions: ''
    };
    
    // Update local state with default section
    setSections([defaultSection]);
    
    // Update survey with default section
    if (onSurveyUpdate) {
      const updatedSurveyOrder = [...(survey.surveyOrder || [])];
      const newOrderItem = {
        id: defaultSection.id,
        type: 'section' as const,
        order: updatedSurveyOrder.length
      };
      updatedSurveyOrder.push(newOrderItem);
      
      const updatedSurvey = {
        ...survey,
        surveySections: [defaultSection],
        surveyOrder: updatedSurveyOrder
      };
      
      onSurveyUpdate(updatedSurvey);
    }
  }

  // Load surveyOrder - this is now the single source of truth
  if (survey && survey.surveyOrder && Array.isArray(survey.surveyOrder)) {
    setSurveyOrder(survey.surveyOrder);
    
    // Extract question IDs from surveyOrder
    const questionIds = survey.surveyOrder
      .filter((item: any) => item.type === 'question')
      .map((item: any) => item.id);
    
    if (questionIds.length > 0) {
      setIsQuestionsLoading(true);
      
      // FIRST: Fetch all question documents with import status
      Meteor.call('questions.getImportStatus', questionIds, (error, result) => {
        if (error) {
          console.error('Error fetching questions:', error);
        } else if (result) {
          // Create a map for quick lookup
          const docsMap: Record<string, any> = {};
          result.forEach((doc: any) => {
            if (doc && doc._id) {
              docsMap[doc._id] = doc;
            }
          });
          
          console.log(`Loaded ${Object.keys(docsMap).length} question documents with import status`);
          setQuestionDocsMap(docsMap);
          
          // THEN: Create questions array from sectionQuestions
          const questions = questionIds.map((id: string) => {
            // Use our fetched question doc from the map
            const questionDoc = docsMap[id];
            
            // Get section assignment and data from sectionQuestions
            let sectionId = null;
            let order = 0;
            let text = '';
            let type = 'text';
            
            // Find in sectionQuestions array
            const sectionQuestion = survey.sectionQuestions?.find((sq: any) => 
              sq.id === id || sq.questionId === id
            );
            
            if (sectionQuestion) {
              sectionId = sectionQuestion.sectionId;
              order = sectionQuestion.order || 0;
              text = sectionQuestion.text || '';
              type = sectionQuestion.type || 'text';
            }
            
            // Get order and sectionId from surveyOrder if available
            const orderItem = survey.surveyOrder.find((item: any) => 
              item.type === 'question' && item.id === id
            );
            
            if (orderItem) {
              order = orderItem.order || order;
              // If sectionId is in the orderItem, use it
              if (orderItem.sectionId) {
                sectionId = orderItem.sectionId;
              }
            }
            
            // If question found in our map, use that data
            if (questionDoc) {
              const questionItem = {
                id: id,
                text: extractQuestionText(questionDoc),
                type: getLatestQuestionVersion(questionDoc)?.responseType || type,
                status: 'published' as const,
                sectionId: sectionId,
                order: order
              };
              return questionItem;
            } 
            // If not found in database but found in sectionQuestions, create from sectionQuestions
            else if (sectionQuestion) {
              const questionItem = {
                id: id,
                text: text || 'Question text not available',
                type: type,
                status: 'published' as const,
                sectionId: sectionId,
                order: order
              };
              return questionItem;
            }
            // If not found anywhere, create a minimal placeholder
            else {
              return {
                id: id,
                text: `Question ${id}`,
                type: 'text',
                status: 'published' as const,
                sectionId: sectionId,
                order: order
              };
            }
          }).filter(Boolean) as QuestionItem[];
          
          // Sort questions by their order in surveyOrder
          questions.sort((a, b) => (a.order || 0) - (b.order || 0));
          setSurveyQuestions(questions);
          setIsQuestionsLoading(false);
        }
      });
      
      return () => {
        // No subscription to clean up
      };
    } else {
      setSurveyQuestions([]);
      setIsQuestionsLoading(false);
    }
  } else {
    // Clear questions if survey has no surveyOrder
    setSurveyQuestions([]);
    setSurveyOrder([]);
    setIsQuestionsLoading(false);
  }
}, [
  surveyId,
  JSON.stringify(survey?.surveyOrder || []),
  JSON.stringify(survey?.surveySections || []),
  JSON.stringify(survey?.sectionQuestions || []),
  survey?._id
]);

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
          
          // Update surveyOrder - this is the single source of truth
          const updatedSurveyOrder = [...surveyOrder];
          const maxOrder = updatedSurveyOrder.length > 0 ? 
            Math.max(...updatedSurveyOrder.map(item => item.order)) : 0;
          
          updatedSurveyOrder.push({
            id: questionId,
            type: 'question',
            order: maxOrder + 1
          });
          
          setSurveyOrder(updatedSurveyOrder);
          
          // Update the survey with the new question
          if (survey && onSurveyUpdate) {
            const currentSectionQuestions = Array.isArray(survey.sectionQuestions) ? survey.sectionQuestions : [];
            // Check if question ID already exists to avoid duplicates
            if (!currentSectionQuestions.some((q: any) => q.questionId === questionId || q.id === questionId)) {
              // Create new section question with all necessary data
              const newSectionQuestion = {
                id: questionId,
                text: newQuestion.text,
                type: newQuestion.type,
                sectionId: null, // null for unsectioned questions
                order: currentSectionQuestions.length,
                status: 'published'
              };
              
              const updatedSurvey = {
                ...survey,
                sectionQuestions: [...currentSectionQuestions, newSectionQuestion],
                surveyOrder: updatedSurveyOrder // Make sure we're using the updated order array
              };
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
    // Open selector; it will handle its own paginated subscription
    setShowQuestionSelector(true);
  };

  const handleEditQuestion = async (questionId: string) => {
    console.log('Edit question:', questionId);
    
    // Find the question to edit
    const questionToEdit = surveyQuestions.find(q => q.id === questionId);
    if (!questionToEdit) {
      console.error('Question not found:', questionId);
      return;
    }
    
    // Check if the question is imported (should not be editable)
    const isQuestionImported = (questionId: string) => {
      const questionDoc = questionDocsMap[questionId];
      if (!questionDoc) return false;
      
      const latestVersion = getLatestQuestionVersion(questionDoc);
      return latestVersion?.creationSource === 'imported';
    };
    
    // Then use it like this:
    const isImported = isQuestionImported(questionId);
    if (isImported) {
      return; // Don't open the editor for imported questions
    }
    
    // Check if the question has responses before editing
    try {
      // Get the response data for this question - this will include the response count
      const data = await Meteor.callAsync('questions.exportResponseData', questionId);
      
      // Extract response count from the data
      const responseCount = data.totalRespondents || 0;
      
      // Check if we should show the warning
      const dontShowWarning = localStorage.getItem('dontShowQuestionEditWarning') === 'true';
      
      if (responseCount > 0 && !dontShowWarning) {
        // If there are responses, show the warning modal
        setSelectedQuestionId(questionId);
        setQuestionResponseCount(responseCount);
        setShowEditWarningModal(true);
      } else {
        // If no responses or user opted out of warnings, proceed directly to edit
        proceedToEditQuestion(questionId);
      }
    } catch (error) {
      console.error('Error checking question responses:', error);
      // If there's an error, proceed with editing anyway
      proceedToEditQuestion(questionId);
    }
  };
  
  // Function to proceed with editing after warning or if no warning needed
  const proceedToEditQuestion = (questionId: string) => {
    // Find the question to edit
    const questionToEdit = surveyQuestions.find(q => q.id === questionId);
    if (!questionToEdit) {
      console.error('Question not found:', questionId);
      return;
    }
    
    // Create callback for when question is updated
    const onQuestionUpdatedCallback = (updatedQuestionId: string) => {
      console.log('Question updated:', updatedQuestionId);
      
      // Refresh the question data from the database
      const questionDoc = Questions.findOne(updatedQuestionId);
      if (questionDoc) {
        const updatedQuestion: QuestionItem = {
          id: updatedQuestionId,
          text: extractQuestionText(questionDoc),
          type: getLatestQuestionVersion(questionDoc)?.responseType || 'text',
          status: 'published' as const,
          sectionId: questionToEdit.sectionId,
          order: questionToEdit.order
        };
        
        // Update the question in local state
        setSurveyQuestions(prev => 
          prev.map(q => q.id === updatedQuestionId ? updatedQuestion : q)
        );
        
        // Update survey with updated sectionQuestions
        if (survey && onSurveyUpdate) {
          const currentSectionQuestions = Array.isArray(survey.sectionQuestions) ? survey.sectionQuestions : [];
          const updatedSectionQuestions = currentSectionQuestions.map((q: any) => 
            q.id === updatedQuestionId ? {
              ...q,
              text: updatedQuestion.text,
              type: updatedQuestion.type
            } : q
          );
          
          const updatedSurvey = {
            ...survey,
            sectionQuestions: updatedSectionQuestions,
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
    
    // Open the question builder panel for editing
    openPanel(questionId, surveyId, onQuestionUpdatedCallback);
  };

  const handleDeleteQuestion = (questionId: string, event?: React.MouseEvent) => {
    // Check if the question is imported
    const questionDoc = questionDocsMap[questionId];
    if (questionDoc) {
      const latestVersion = getLatestQuestionVersion(questionDoc);
      if (latestVersion?.creationSource === 'imported') {
        console.log('Cannot delete imported question');
        return;
      }
    }
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      setDeleteConfirmation({
        questionId,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top
        }
      });
    }
  };

  const confirmDeleteQuestion = (questionId: string) => {
    // Double-check if the question is imported
    const questionDoc = questionDocsMap[questionId];
    if (questionDoc) {
      const latestVersion = getLatestQuestionVersion(questionDoc);
      if (latestVersion?.creationSource === 'imported') {
        console.log('Cannot delete imported question');
        setDeleteConfirmation(null);
        return;
      }
    }
    try {
      // Remove question from local state
      setSurveyQuestions(prev => prev.filter(q => q.id !== questionId));
      
      // Remove question from surveyOrder array (single source of truth)
      const updatedSurveyOrder = surveyOrder.filter(item => 
        !(item.type === 'question' && item.id === questionId)
      );
      setSurveyOrder(updatedSurveyOrder);
      
      // Update the survey to remove the question
      if (survey && onSurveyUpdate) {
        const currentSectionQuestions = Array.isArray(survey.sectionQuestions) ? survey.sectionQuestions : [];
        const updatedSurvey = {
          ...survey,
          sectionQuestions: currentSectionQuestions.filter((q: any) => q.id !== questionId),
          surveyOrder: updatedSurveyOrder
        };
        onSurveyUpdate(updatedSurvey);
      }
      
      // Trigger unsaved changes
      if (onHasUnsavedChanges) {
        onHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error('Error deleting question:', error);
    } finally {
      // Always close confirmation popup, even if there's an error
      setDeleteConfirmation(null);
    }
  };

  // Handle real-time question removal from sections
  const handleRemoveQuestionsFromSection = (questionIds: string[], targetSectionId: string) => {
    console.log('Real-time removing questions:', questionIds, 'from section:', targetSectionId);
    
    // Remove questions from local state immediately
    setSurveyQuestions(prev => prev.filter(q => 
      !(questionIds.includes(q.id) && q.sectionId === targetSectionId)
    ));
    
    // Update surveyOrder
    const updatedSurveyOrder = surveyOrder.filter(item => 
      !(item.type === 'question' && questionIds.includes(item.id) && item.sectionId === targetSectionId)
    );
    setSurveyOrder(updatedSurveyOrder);
    
    // Update survey data
    if (survey && onSurveyUpdate) {
      const updatedSurvey = {
        ...survey,
        sectionQuestions: survey.sectionQuestions?.filter((sq: any) => 
          !(questionIds.includes(sq.id) && sq.sectionId === targetSectionId)
        ) || [],
        surveyOrder: updatedSurveyOrder
      };
      onSurveyUpdate(updatedSurvey);
    }
    
    // Trigger unsaved changes
    if (onHasUnsavedChanges) {
      onHasUnsavedChanges(true);
    }
  };

  // Handle selecting questions from the Question Selector modal
  const handleSelectQuestions = (selectedQuestionIds: string[], sectionId: string) => {
    
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
          sectionId: sectionId || undefined
        };
      }
      return null;
    }).filter(Boolean) as QuestionItem[];
    
    // Add to survey questions
    setSurveyQuestions(prev => [...prev, ...newQuestions]);
    
    // Update surveyOrder with new questions - this is the single source of truth
    const updatedSurveyOrder = [...surveyOrder];
    
    if (sectionId) {
      // If adding to a specific section, find the section's position and insert questions after it
      const sectionIndex = updatedSurveyOrder.findIndex(item => item.type === 'section' && item.id === sectionId);
      if (sectionIndex !== -1) {
        // Find the last question in this section or the section itself
        let insertIndex = sectionIndex + 1;
        while (insertIndex < updatedSurveyOrder.length && 
               updatedSurveyOrder[insertIndex].type === 'question') {
          // Check if this question belongs to our section
          const questionInSection = surveyQuestions.find(q => q.id === updatedSurveyOrder[insertIndex].id);
          if (questionInSection && questionInSection.sectionId === sectionId) {
            insertIndex++;
          } else {
            break;
          }
        }
        
        // Insert new questions at the calculated position
        newQuestions.forEach((question, index) => {
          updatedSurveyOrder.splice(insertIndex + index, 0, {
            id: question.id,
            type: 'question',
            order: insertIndex + index,
            sectionId: sectionId // Add sectionId to track which section this question belongs to
          });
        });
        
        // Reorder all items after insertion
        updatedSurveyOrder.forEach((item, index) => {
          item.order = index;
        });
      } else {
        // Fallback: add at the end if section not found
        let maxOrder = updatedSurveyOrder.length > 0 ? 
          Math.max(...updatedSurveyOrder.map(item => item.order)) : 0;
        newQuestions.forEach(question => {
          updatedSurveyOrder.push({
            id: question.id,
            type: 'question',
            order: ++maxOrder,
            sectionId: sectionId // Add sectionId even for fallback case
          });
        });
      }
    } else {
      // If no specific section, add at the end
      let maxOrder = updatedSurveyOrder.length > 0 ? 
        Math.max(...updatedSurveyOrder.map(item => item.order)) : 0;
      newQuestions.forEach(question => {
        updatedSurveyOrder.push({
          id: question.id,
          type: 'question',
          order: ++maxOrder,
          sectionId: sectionId || undefined // Add sectionId (null for no-section questions)
        });
      });
    }
    
    // Update the state with the new order
    setSurveyOrder(updatedSurveyOrder);
    
    // Update survey with new questions and surveyOrder
    if (survey && onSurveyUpdate) {
      // Create new section questions with all necessary data
      const newSectionQuestions = questionsToAdd.map(questionId => {
        const questionDoc = Questions.findOne(questionId);
        const questionText = questionDoc ? extractQuestionText(questionDoc) : '';
        const questionType = questionDoc ? (getLatestQuestionVersion(questionDoc)?.responseType || 'text') : 'text';
        
        
        return {
          id: questionId,
          text: questionText,
          type: questionType,
          sectionId: sectionId || null,
          order: (survey.sectionQuestions || []).length + questionsToAdd.indexOf(questionId),
          status: 'published'
        };
      });
      
      const updatedSurvey = {
        ...survey,
        sectionQuestions: [
          ...(survey.sectionQuestions || []),
          ...newSectionQuestions
        ],
        surveyOrder: updatedSurveyOrder // Make sure we're using the updated order array
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
    
    // Insert at new position with proper sectionId
    const insertItem: SurveyOrderItem = {
      type: draggedType,
      id: draggedId,
      order: adjustedTargetOrder,
      sectionId: draggedType === 'question' ? newSectionId : draggedId // For questions: use newSectionId, for sections: use their own ID
    };
    newOrder.splice(adjustedTargetOrder, 0, insertItem);
    
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
          surveyOrder: reorderedItems // IMPORTANT: Use reorderedItems instead of surveyOrder
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
          surveyOrder: reorderedItems // IMPORTANT: Use reorderedItems instead of surveyOrder
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

  // Handle drag start (questions only)
  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDragType('question');
    setDraggingQuestionId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', JSON.stringify({ type: 'question', id }));
  };

  // Handle drag end
  const handleDragEnd = () => {
    setDragType(null);
    setDraggingQuestionId(null);
    setDragOverQuestionId(null);
    setDragOverSectionId(null);
    setDragOverPosition(null);
  };

  // Handle drag over with position detection (questions only)
  const handleDragOver = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';

    const rect = e.currentTarget.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const height = rect.height;
    
    // For questions, determine if dropping before or after
    const position = y < height * 0.5 ? 'before' : 'after';
    setDragOverQuestionId(targetId);
    setDragOverPosition(position);
  };

  // Handle drop (questions only)
  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    
    const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { id: draggedId } = dragData;

    // Find target question
    const targetQuestion = surveyQuestions.find(q => q.id === targetId);
    const targetOrderItem = surveyOrder.find(item => 
      item.type === 'question' && item.id === targetId
    );
    
    if (!targetOrderItem || !targetQuestion) return;
    
    const targetOrder = dragOverPosition === 'before' ? 
      targetOrderItem.order : targetOrderItem.order + 1;
    
    // Move question and assign to same section as target
    handleMoveInOrder('question', draggedId, targetOrder, targetQuestion.sectionId);
    handleDragEnd();
  };

  // Handle section drop zone events for empty sections
  const handleSectionDragOver = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverSectionId(sectionId);
  };

  const handleSectionDrop = (e: React.DragEvent, sectionId: string) => {
    e.preventDefault();
    
    const dragData = JSON.parse(e.dataTransfer.getData('text/plain'));
    const { id: draggedId } = dragData;
    
    // Update question's section assignment
    const updatedQuestions = surveyQuestions.map(q => 
      q.id === draggedId ? { ...q, sectionId: sectionId } : q
    );
    setSurveyQuestions(updatedQuestions);
    
    // Find the section in surveyOrder to place question after it
    const sectionOrderItem = surveyOrder.find(item => 
      item.type === 'section' && item.id === sectionId
    );
    
    if (sectionOrderItem) {
      // Place question right after the section
      const targetOrder = sectionOrderItem.order + 1;
      handleMoveInOrder('question', draggedId, targetOrder, sectionId);
    }
    
    // Update survey with new section assignment
    if (survey && onSurveyUpdate) {
      const updatedSectionQuestions = (survey.sectionQuestions || []).map((sq: any) => 
        sq.id === draggedId ? { ...sq, sectionId: sectionId } : sq
      );
      
      const updatedSurvey = {
        ...survey,
        sectionQuestions: updatedSectionQuestions,
        surveyOrder: surveyOrder
      };
      onSurveyUpdate(updatedSurvey);
    }
    
    // Trigger unsaved changes
    if (onHasUnsavedChanges) {
      onHasUnsavedChanges(true);
    }
    
    setDragOverSectionId(null);
    handleDragEnd();
  };

  const handleSectionDragLeave = (e: React.DragEvent, sectionId: string) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverSectionId(null);
    }
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

    // Update surveyOrder array (single source of truth) for new sections
    let updatedSurveyOrder = [...surveyOrder];
    
    if (currentSection) {
      // Update existing section
      setSections(prev => prev.map(s => s.id === currentSection.id ? { ...newSection, id: currentSection.id } : s));
    } else {
      // Add new section
      setSections(prev => [...prev, newSection]);
      
      // Add new section to surveyOrder array
      const newOrderItem = {
        id: newSection.id,
        type: 'section' as const,
        order: surveyOrder.length,
        sectionId: newSection.id // For sections, sectionId is their own ID
      };
      updatedSurveyOrder = [...surveyOrder, newOrderItem];
      setSurveyOrder(updatedSurveyOrder);
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
      
      // Create the updated survey object with updated surveyOrder
      const updatedSurvey = {
        ...survey,
        surveySections: updatedSections,
        surveyOrder: updatedSurveyOrder
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
  // Helper function to check if the survey is imported
  const isSurveyImported = () => {
    return survey?.creationSource === 'imported';
  };

  const handleEditSection = (section: any) => {
    // Check if survey is imported - don't allow editing sections in imported surveys
    if (isSurveyImported()) {
      console.log('Cannot edit section in imported survey');
      return;
    }
    
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
  const handleDeleteSection = (sectionId: string, event?: React.MouseEvent) => {
    // Don't allow deleting sections in imported surveys
    if (isSurveyImported()) {
      console.log('Cannot delete section in imported survey');
      return;
    }
    if (event) {
      const rect = event.currentTarget.getBoundingClientRect();
      setDeleteSectionConfirmation({
        sectionId,
        position: {
          x: rect.left + rect.width / 2,
          y: rect.top
        }
      });
    }
  };

  const confirmDeleteSection = (sectionId: string) => {
    // Double-check we're not deleting sections in imported surveys
    if (isSurveyImported()) {
      console.log('Cannot delete section in imported survey');
      setDeleteSectionConfirmation(null);
      return;
    }
    try {
      // Remove section from local state
      setSections(prev => prev.filter(s => s.id !== sectionId));
      
      // Remove questions associated with this section
      setSurveyQuestions(prev => prev.filter(q => q.sectionId !== sectionId));
      
      // Remove section from surveyOrder array (single source of truth)
      const updatedSurveyOrder = surveyOrder.filter(item => 
        !(item.type === 'section' && item.id === sectionId)
      );
      setSurveyOrder(updatedSurveyOrder);
      
      // Update survey
      if (survey && onSurveyUpdate) {
        const updatedSurvey = {
          ...survey,
          surveySections: survey.surveySections?.filter((s: any) => s.id !== sectionId) || [],
          sectionQuestions: survey.sectionQuestions?.filter((sq: any) => {
            return sq.sectionId !== sectionId;
          }) || [],
          surveyOrder: updatedSurveyOrder
        };
        onSurveyUpdate(updatedSurvey);
      }

      // Trigger unsaved changes
      if (onHasUnsavedChanges) {
        onHasUnsavedChanges(true);
      }
    } catch (error) {
      console.error('Error deleting section:', error);
    } finally {
      // Always close editor and confirmation popup, even if there's an error
      setShowSectionEditor(false);
      setCurrentSection(undefined);
      setDeleteSectionConfirmation(null);
    }
  };

  // Get questions for a specific section
  const getQuestionsForSection = (sectionId: string) => {
    return surveyQuestions
      .filter(q => q.sectionId === sectionId)
      .sort((a, b) => (a.order || 0) - (b.order || 0)); // Sort by order property
  };

  // Helper functions for section position checking
  const isFirstSection = (sectionId: string): boolean => {
    const sectionItems = surveyOrder.filter(item => item.type === 'section');
    return sectionItems.length > 0 && sectionItems[0].id === sectionId;
  };

  const isLastSection = (sectionId: string): boolean => {
    const sectionItems = surveyOrder.filter(item => item.type === 'section');
    return sectionItems.length > 0 && sectionItems[sectionItems.length - 1].id === sectionId;
  };

  // Update survey with new order - Enhanced to sync all related data including surveySections
  const updateSurveyWithNewOrder = (reorderedItems: SurveyOrderItem[]) => {
    if (survey && onSurveyUpdate) {
      // Update section displayOrder to match surveyOrder
      const updatedSections = sections.map(s => {
        const orderItem = reorderedItems.find(item => item.type === 'section' && item.id === s.id);
        return orderItem ? { ...s, displayOrder: orderItem.order } : s;
      });
      
      // Update question orders to match surveyOrder
      const updatedSectionQuestions = surveyQuestions.map(q => {
        const orderItem = reorderedItems.find(item => 
          item.type === 'question' && item.id === q.id
        );
        return {
          id: q.id,
          sectionId: q.sectionId,
          type: q.type,
          order: orderItem ? orderItem.order : q.order || 0,
          status: q.status,
          text: q.text
        };
      });
      
      // 🆕 REORDER surveySections ARRAY to match the new section order
      const reorderedSurveySections = [];
      const sectionOrderItems = reorderedItems.filter(item => item.type === 'section');
      
      // Build the new surveySections array in the correct order
      for (const orderItem of sectionOrderItems) {
        const sectionData = (survey.surveySections || []).find((s: any) => s.id === orderItem.id);
        if (sectionData) {
          // Update the section with new displayOrder
          reorderedSurveySections.push({
            ...sectionData,
            displayOrder: orderItem.order
          });
        }
      }
      
      const updatedSurvey = {
        ...survey,
        surveySections: reorderedSurveySections, // 🆕 Use reordered array
        sectionQuestions: updatedSectionQuestions,
        surveyOrder: reorderedItems
      };
      
      console.log('=== ENHANCED ORDER UPDATE WITH SURVEYSECTIONS ===');
      console.log('Updated surveyOrder:', reorderedItems.map(item => `${item.type}:${item.id}:${item.order}:${item.sectionId || 'none'}`));
      console.log('Updated sectionQuestions orders:', updatedSectionQuestions.map(sq => `${sq.id}:${sq.order}`));
      console.log('🆕 Reordered surveySections:', reorderedSurveySections.map(s => `${s.name}:${s.id}:${s.displayOrder}`));
      
      // Validate the order consistency
      const orderValues = reorderedItems.map(item => item.order);
      const isSequential = orderValues.every((order, index) => order === index);
      console.log(`🔍 Order validation: ${isSequential ? '✅ Sequential' : '❌ Non-sequential'}`);
      
      if (!isSequential) {
        console.error('❌ Order values are not sequential:', orderValues);
      }
      
      // Update local sections state to match the new order
      setSections(updatedSections.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0)));
      
      onSurveyUpdate(updatedSurvey);
    }
    
    if (onHasUnsavedChanges) {
      onHasUnsavedChanges(true);
    }
  };

  // Arrow control handlers for sections - Enhanced to move sections WITH their questions
  const handleMoveSectionUp = (sectionId: string) => {
    console.log(`🔼 Moving section ${sectionId} UP`);
    
    const sectionGroup = getSectionGroup(sectionId);
    if (sectionGroup.length === 0) {
      console.warn(`No section group found for ${sectionId}`);
      return;
    }
    
    // Find the current position of the section group in surveyOrder
    const sectionIndex = surveyOrder.findIndex(item => 
      item.type === 'section' && item.id === sectionId
    );
    
    if (sectionIndex <= 0) {
      console.log('Section is already at the top');
      return; // Already at top
    }
    
    // Find the previous section to move before
    let previousSectionIndex = -1;
    for (let i = sectionIndex - 1; i >= 0; i--) {
      if (surveyOrder[i].type === 'section') {
        previousSectionIndex = i;
        break;
      }
    }
    
    if (previousSectionIndex === -1) {
      console.log('No previous section found, moving to top');
      // Move to the very beginning
      const newOrder = [...surveyOrder];
      
      // Remove the section group from current position
      const groupToMove = sectionGroup.map(item => ({ ...item }));
      newOrder.splice(sectionIndex, sectionGroup.length);
      
      // Insert at the beginning
      newOrder.splice(0, 0, ...groupToMove);
      
      // Recalculate all orders
      const reorderedItems = recalculateAllOrders(newOrder);
      
      console.log('🔄 Reordered items:', reorderedItems.map(item => `${item.type}:${item.id}:${item.order}`));
      
      setSurveyOrder(reorderedItems);
      updateSurveyWithNewOrder(reorderedItems);
    } else {
      // Move before the previous section
      const newOrder = [...surveyOrder];
      
      // Remove the section group from current position
      const groupToMove = sectionGroup.map(item => ({ ...item }));
      newOrder.splice(sectionIndex, sectionGroup.length);
      
      // Insert before the previous section (adjust index after removal)
      const adjustedInsertIndex = previousSectionIndex < sectionIndex ? previousSectionIndex : previousSectionIndex - sectionGroup.length;
      newOrder.splice(adjustedInsertIndex, 0, ...groupToMove);
      
      // Recalculate all orders
      const reorderedItems = recalculateAllOrders(newOrder);
      
      console.log('🔄 Reordered items:', reorderedItems.map(item => `${item.type}:${item.id}:${item.order}`));
      
      setSurveyOrder(reorderedItems);
      updateSurveyWithNewOrder(reorderedItems);
    }
  };

  const handleMoveSectionDown = (sectionId: string) => {
    console.log(`🔽 Moving section ${sectionId} DOWN`);
    
    const sectionGroup = getSectionGroup(sectionId);
    if (sectionGroup.length === 0) {
      console.warn(`No section group found for ${sectionId}`);
      return;
    }
    
    // Find the current position of the section in surveyOrder
    const sectionIndex = surveyOrder.findIndex(item => 
      item.type === 'section' && item.id === sectionId
    );
    
    if (sectionIndex === -1) {
      console.warn(`Section ${sectionId} not found in surveyOrder`);
      return;
    }
    
    // Find the next section to move after
    let nextSectionIndex = -1;
    for (let i = sectionIndex + 1; i < surveyOrder.length; i++) {
      if (surveyOrder[i].type === 'section') {
        nextSectionIndex = i;
        break;
      }
    }
    
    if (nextSectionIndex === -1) {
      console.log('Section is already at the bottom');
      return; // Already at bottom
    }
    
    // Get the next section's group
    const nextSectionId = surveyOrder[nextSectionIndex].id;
    const nextSectionGroup = getSectionGroup(nextSectionId);
    
    const newOrder = [...surveyOrder];
    
    // Remove the current section group
    const groupToMove = sectionGroup.map(item => ({ ...item }));
    newOrder.splice(sectionIndex, sectionGroup.length);
    
    // Find where to insert after the next section group
    // Since we removed items, we need to adjust the index
    const adjustedNextSectionIndex = nextSectionIndex > sectionIndex ? 
      nextSectionIndex - sectionGroup.length : nextSectionIndex;
    
    const insertIndex = adjustedNextSectionIndex + nextSectionGroup.length;
    newOrder.splice(insertIndex, 0, ...groupToMove);
    
    // Recalculate all orders
    const reorderedItems = recalculateAllOrders(newOrder);
    
    console.log('🔄 Reordered items:', reorderedItems.map(item => `${item.type}:${item.id}:${item.order}`));
    
    setSurveyOrder(reorderedItems);
    updateSurveyWithNewOrder(reorderedItems);
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
          
          // Update surveyOrder array (single source of truth)
          const updatedSurveyOrder = [...surveyOrder];
          const newOrderItem = {
            id: questionId,
            type: 'question' as const,
            order: surveyOrder.length,
            sectionId: sectionId // Add sectionId to track which section this question belongs to
          };
          updatedSurveyOrder.push(newOrderItem);
          setSurveyOrder(updatedSurveyOrder);
          
          // Update survey with the new question
          if (survey && onSurveyUpdate) {
            // Create new section question with all necessary data
            const newSectionQuestion = {
              id: questionId,
              text: newQuestion.text,
              type: newQuestion.type,
              sectionId: sectionId,
              order: (survey.sectionQuestions || []).length,
              status: 'published'
            };
            const updatedSurvey = {
              ...survey,
              sectionQuestions: [
                ...(survey.sectionQuestions || []),
                newSectionQuestion
              ],
              surveyOrder: updatedSurveyOrder // This is the updated order with the new question
            };
            
            onSurveyUpdate(updatedSurvey);
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
    console.log('Opening question selector for section:', sectionId);
    
    // Set the current section ID for the selector
    setCurrentSectionId(sectionId);
    
    // Open selector; it will handle its own paginated subscription
    setShowQuestionSelector(true);
  };

  // Get drop zone classes for visual feedback (questions only)
  const getDropZoneClasses = (id: string) => {
    const classes = [];
    
    if (dragOverQuestionId === id) {
      classes.push(`drag-over-${dragOverPosition}`);
    }
    
    if (draggingQuestionId === id) {
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
            .arrow-button {
              background: none;
              border: 1px solid #d1d5db;
              border-radius: 4px;
              cursor: pointer;
              color: #6b7280;
              padding: 4px;
              display: flex;
              align-items: center;
              transition: all 0.2s ease;
            }
            .arrow-button:hover:not(:disabled) {
              background-color: #f3f4f6;
              border-color: #9ca3af;
            }
            .arrow-button:disabled {
              cursor: not-allowed;
              opacity: 0.5;
              color: #9ca3af;
            }
            .section-drop-zone {
              min-height: 60px;
              border: 2px dashed #d1d5db;
              border-radius: 8px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #9ca3af;
              font-size: 14px;
              margin: 12px 0;
              transition: all 0.2s ease;
              background-color: transparent;
            }
            .section-drop-zone.drag-over {
              border-color: #3b82f6;
              background-color: rgba(59, 130, 246, 0.05);
              color: #3b82f6;
            }
            .section-drop-zone:not(.drag-over):hover {
              border-color: #9ca3af;
              background-color: rgba(156, 163, 175, 0.05);
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
                    
                    // Check if the question is imported (should not be editable)
                      const isQuestionImported = (questionId: string) => {
                        const questionDoc = questionDocsMap[questionId];
                        if (!questionDoc) return false;
                        
                        const latestVersion = getLatestQuestionVersion(questionDoc);
                        return latestVersion?.creationSource === 'imported';
                      };

                    // Then use it like this:
                    const isImported = isQuestionImported(question.id);
                    
                    return (
                      <div 
                        key={question.id}
                        className={`question-item ${getDropZoneClasses(question.id)}`}
                        onClick={isImported ? undefined : () => handleEditQuestion(question.id)}
                        style={{ cursor: isImported ? 'not-allowed' : 'pointer' }}
                        draggable
                        onDragStart={(e) => handleDragStart(e, question.id)}
                        onDragEnd={handleDragEnd}
                        onDragOver={(e) => handleDragOver(e, question.id)}
                        onDragLeave={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                            setDragOverQuestionId(null);
                            setDragOverPosition(null);
                          }
                        }}
                        onDrop={(e) => handleDrop(e, question.id)}
                      >
                        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', width: '100%' }}>
                          <div className="drag-handle">
                            <FiMove size={16} />
                          </div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontWeight: 500 }}>{question.text}</div>
                            <div style={{ fontSize: '12px', color: '#666', marginTop: '4px' }}>
                              {question.type} {isImported}
                            </div>
                          </div>
                          <div className="question-actions" style={{ display: 'flex', gap: '8px', alignItems: 'center', marginLeft: 'auto' }}>
                            {!isImported ? (
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
                            ) : (
                              <button
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'not-allowed',
                                  color: '#6b7280',
                                  opacity: 0.5,
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Cannot edit imported question"
                                disabled
                              >
                                <FiLock size={14} />
                              </button>
                            )}
                            {!isImported ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteQuestion(question.id, e);
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
                            ) : (
                              <button
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'not-allowed',
                                  color: '#dc2626',
                                  opacity: 0.5,
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Cannot delete imported question"
                                disabled
                              >
                                <FiTrash2 size={14} />
                              </button>
                            )}
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
                        className="section-container"
                        style={{ marginBottom: '24px', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '16px', backgroundColor: '#f8fafc' }}
                      >
                        {/* Section Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flex: 1 }}>
                            <h3 style={{ margin: 0, fontSize: '16px', fontWeight: 600 }}>
                              {section.name}
                            </h3>
                          </div>
                          <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                            {/* Section Movement Controls */}
                            {!isSurveyImported() && (
                              <div style={{ display: 'flex', gap: '4px', marginRight: '8px' }}>
                                <button
                                  onClick={() => handleMoveSectionUp(section.id)}
                                  disabled={isFirstSection(section.id)}
                                  className="arrow-button"
                                  title="Move section up"
                                >
                                  <FiChevronUp size={14} />
                                </button>
                                <button
                                  onClick={() => handleMoveSectionDown(section.id)}
                                  disabled={isLastSection(section.id)}
                                  className="arrow-button"
                                  title="Move section down"
                                >
                                  <FiChevronDown size={14} />
                                </button>
                              </div>
                            )}
                            {!isSurveyImported() ? (
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
                            ) : (
                              <button
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'not-allowed',
                                  color: '#6b7280',
                                  opacity: 0.5,
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Cannot edit section in imported survey"
                                disabled
                              >
                                <FiLock size={14} />
                              </button>
                            )}
                            {!isSurveyImported() ? (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleDeleteSection(section.id, e);
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
                                title="Delete section"
                              >
                                <FiTrash2 size={14} />
                              </button>
                            ) : (
                              <button
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  cursor: 'not-allowed',
                                  color: '#dc2626',
                                  opacity: 0.5,
                                  padding: '4px',
                                  display: 'flex',
                                  alignItems: 'center'
                                }}
                                title="Cannot delete section in imported survey"
                                disabled
                              >
                                <FiTrash2 size={14} />
                              </button>
                            )}
                          </div>
                        </div>

                        {/* Section Questions */}
                        <div style={{ paddingLeft: '24px' }}>
                          {surveyQuestions.filter(q => q.sectionId === section.id).length > 0 ? (
                            surveyQuestions
                              .filter(q => q.sectionId === section.id)
                              .sort((a, b) => (a.order || 0) - (b.order || 0)) // Sort by order property
                              .map(question => {
                                // Check if the question is imported (should not be editable)
                                const isQuestionImported = (questionId: string) => {
                                  const questionDoc = questionDocsMap[questionId];
                                  if (!questionDoc) return false;
                                  
                                  const latestVersion = getLatestQuestionVersion(questionDoc);
                                  return latestVersion?.creationSource === 'imported';
                                };

                                // Then use it like this:
                                const isImported = isQuestionImported(question.id);
                                return (
                                  <div 
                                    key={question.id}
                                    className={`question-item ${getDropZoneClasses(question.id)}`}
                                    onClick={isImported ? undefined : () => handleEditQuestion(question.id)}
                                    style={{ cursor: isImported ? 'not-allowed' : 'pointer' }}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, question.id)}
                                    onDragEnd={handleDragEnd}
                                    onDragOver={(e) => handleDragOver(e, question.id)}
                                    onDragLeave={(e) => {
                                      if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                                        setDragOverQuestionId(null);
                                        setDragOverPosition(null);
                                      }
                                    }}
                                    onDrop={(e) => handleDrop(e, question.id)}
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
                                        {!isImported ? (
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
                                        ) : (
                                          <button
                                            style={{
                                              background: 'none',
                                              border: 'none',
                                              cursor: 'not-allowed',
                                              color: '#6b7280',
                                              opacity: 0.5,
                                              padding: '4px',
                                              display: 'flex',
                                              alignItems: 'center'
                                            }}
                                            title="Cannot edit imported question"
                                            disabled
                                          >
                                            <FiLock size={14} />
                                          </button>
                                        )}
                                        {!isImported ? (
                                          <button
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              handleDeleteQuestion(question.id, e);
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
                                        ) : (
                                          <button
                                            style={{
                                              background: 'none',
                                              border: 'none',
                                              cursor: 'not-allowed',
                                              color: '#dc2626',
                                              opacity: 0.5,
                                              padding: '4px',
                                              display: 'flex',
                                              alignItems: 'center'
                                            }}
                                            title="Cannot delete imported question"
                                            disabled
                                          >
                                            <FiTrash2 size={14} />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })
                          ) : (
                            <div 
                              className={`section-drop-zone ${dragOverSectionId === section.id ? 'drag-over' : ''}`}
                              onDragOver={(e) => handleSectionDragOver(e, section.id)}
                              onDrop={(e) => handleSectionDrop(e, section.id)}
                              onDragLeave={(e) => handleSectionDragLeave(e, section.id)}
                            >
                              {dragOverSectionId === section.id ? 'Drop question here' : 'Drag questions here'}
                            </div>
                          )}
                        </div>

                        {/* Section Action Buttons */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '16px' }}>
                          {!isSurveyImported() ? (
                            <div 
                              className="survey-section-add-question"
                              onClick={() => handleChooseFromQuestionBankForSection(section.id)}
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                padding: '8px 12px'
                              }}
                            >
                              <FiPlus size={14} /> Choose from Question Bank
                            </div>
                          ) : (
                            <div 
                              className="survey-section-add-question"
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                padding: '8px 12px',
                                opacity: 0.5,
                                cursor: 'not-allowed'
                              }}
                              title="Cannot add questions to imported survey"
                            >
                              <FiLock size={14} /> <span style={{ marginLeft: '8px' }}>Choose from Question Bank</span>
                            </div>
                          )}
                          {!isSurveyImported() ? (
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
                          ) : (
                            <div 
                              className="survey-section-add-question"
                              style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '6px',
                                fontSize: '14px',
                                padding: '8px 12px',
                                opacity: 0.5,
                                cursor: 'not-allowed'
                              }}
                              title="Cannot create questions in imported survey"
                            >
                              <FiLock size={14} /> Create Question
                            </div>
                          )}
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
          <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '12px', marginBottom: '20px' }}>
            {!isSurveyImported() ? (
              <div 
                className="survey-section-add-question"
                onClick={handleAddSection}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FiLayers size={16} /> Add Section
              </div>
            ) : (
              <div 
                className="survey-section-add-question"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  opacity: 0.5,
                  cursor: 'not-allowed'
                }}
                title="Cannot add sections to imported survey"
              >
                <FiLock size={16} /> Add Section
              </div>
            )}
            {/* {!isSurveyImported() ? (
              <div 
                className="survey-section-add-question"
                onClick={handleChooseFromQuestionBank}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FiPlus size={16} /> Choose from Question Bank
              </div>
            ) : (
              <div 
                className="survey-section-add-question"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  opacity: 0.5,
                  cursor: 'not-allowed'
                }}
                title="Cannot add questions to imported survey"
              >
                <FiLock size={16} /> Choose from Question Bank
              </div>
            )} */}
            {/* {!isSurveyImported() ? (
              <div 
                className="survey-section-add-question"
                onClick={handleCreateQuestion}
                style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <FiPlus size={16} /> Create Question
              </div>
            ) : (
              <div 
                className="survey-section-add-question"
                style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '6px',
                  opacity: 0.5,
                  cursor: 'not-allowed'
                }}
                title="Cannot create questions in imported survey"
              >
                <FiLock size={16} /> Create Question
              </div>
            )} */}
            
          </div>
        </div>
      </div>

      {/* Question Selector Modal */}
      <QuestionSelector
        isOpen={showQuestionSelector}
        onClose={() => setShowQuestionSelector(false)}
        questions={questionSelectorItems}
        selectedQuestionIds={currentSectionId ? getQuestionsForSection(currentSectionId).map(q => q.id) : []}
        onSelectQuestions={handleSelectQuestions}
        onRemoveQuestions={handleRemoveQuestionsFromSection}
        allSurveyQuestions={surveyQuestions}
        sections={sections}
        sectionId={currentSectionId || ''}
        surveyId={surveyId}
      />

      {/* Section Editor Modal */}
      <SectionEditor
        isOpen={showSectionEditor}
        onClose={() => setShowSectionEditor(false)}
        section={currentSection}
        onSave={handleSaveSection}
      />
      
      {/* Edit Warning Modal */}
      {showEditWarningModal && selectedQuestionId && (
        <EditWarningModal
          isOpen={showEditWarningModal}
          onClose={() => setShowEditWarningModal(false)}
          onContinue={() => {
            setShowEditWarningModal(false);
            proceedToEditQuestion(selectedQuestionId);
          }}
          onDoNotRemindAgain={() => {
            // Save user preference not to show warning again
            localStorage.setItem('dontShowQuestionEditWarning', 'true');
            setShowEditWarningModal(false);
            proceedToEditQuestion(selectedQuestionId);
          }}
          responseCount={questionResponseCount}
          questionId={selectedQuestionId}
        />
      )}

      {/* Delete Question Confirmation Popup */}
      {deleteConfirmation && (
        <>
          {/* Backdrop */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'transparent',
              zIndex: 999
            }}
            onClick={() => setDeleteConfirmation(null)}
          />
          {/* Confirmation Popup */}
          <div
            style={{
              position: 'fixed',
              left: deleteConfirmation.position.x - 100,
              top: deleteConfirmation.position.y - 80,
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              padding: '12px',
              zIndex: 1000,
              minWidth: '200px'
            }}
          >
            <div style={{ marginBottom: '12px', fontSize: '14px', fontWeight: 500 }}>
              Delete this question?
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteConfirmation(null)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDeleteQuestion(deleteConfirmation.questionId)}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}

      {/* Delete Section Confirmation Popup */}
      {deleteSectionConfirmation && (
        <>
          {/* Backdrop */}
          <div 
            style={{
              position: 'fixed',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: 'transparent',
              zIndex: 999
            }}
            onClick={() => setDeleteSectionConfirmation(null)}
          />
          {/* Confirmation Popup */}
          <div
            style={{
              position: 'fixed',
              left: deleteSectionConfirmation.position.x - 125,
              top: deleteSectionConfirmation.position.y - 100,
              backgroundColor: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '8px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              padding: '12px',
              zIndex: 1000,
              minWidth: '250px'
            }}
          >
            <div style={{ marginBottom: '8px', fontSize: '14px', fontWeight: 500 }}>
              Delete this section?
            </div>
            <div style={{ marginBottom: '12px', fontSize: '12px', color: '#666' }}>
              This will also remove all questions in this section.
            </div>
            <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setDeleteSectionConfirmation(null)}
                style={{
                  padding: '6px 12px',
                  border: '1px solid #d1d5db',
                  borderRadius: '4px',
                  backgroundColor: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => confirmDeleteSection(deleteSectionConfirmation.sectionId)}
                style={{
                  padding: '6px 12px',
                  border: 'none',
                  borderRadius: '4px',
                  backgroundColor: '#dc2626',
                  color: 'white',
                  cursor: 'pointer',
                  fontSize: '12px'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SurveyQuestionsTab;
