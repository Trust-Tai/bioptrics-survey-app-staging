import { useState, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { SurveySectionItem } from './useSurveyData';

// Hook for managing section operations
export const useSectionManagement = (
  surveyId?: string,
  sections: SurveySectionItem[] = [],
  setSections: (sections: SurveySectionItem[]) => void,
  surveyQuestions: any[] = [],
  setSurveyQuestions: (questions: any[]) => void,
  refreshSurveyData: () => void,
  trackContentChange: () => void
) => {
  // State for section editing
  const [showSectionEditor, setShowSectionEditor] = useState<boolean>(false);
  const [currentSection, setCurrentSection] = useState<SurveySectionItem | undefined>(undefined);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false);

  // Track section saving state with a ref to avoid race conditions
  const isSavingSectionRef = useRef(false);

  // Handle adding a new section
  const handleAddSection = () => {
    setCurrentSection(undefined);
    setShowSectionEditor(true);
  };

  // Handle editing a section
  const handleEditSection = (section: SurveySectionItem) => {
    setCurrentSection(section);
    setShowSectionEditor(true);
  };

  // Handle saving a section
  const handleSaveSection = async (sectionData: SurveySectionItem) => {
    // Prevent multiple simultaneous save operations
    if (isSavingSectionRef.current) {
      console.log('Already saving a section, ignoring duplicate request');
      return;
    }

    isSavingSectionRef.current = true;

    try {
      if (sectionData._id) {
        // Update existing section
        const updatedSections = sections.map(s => 
          s._id === sectionData._id ? sectionData : s
        );
        setSections(updatedSections);
      } else {
        // Add new section
        const newSection: SurveySectionItem = {
          ...sectionData,
          _id: `temp_${Date.now()}`, // Temporary ID for new sections
          order: sections.length
        };
        setSections([...sections, newSection]);
      }

      // Close the editor
      setShowSectionEditor(false);
      setCurrentSection(undefined);

      // Track content change
      trackContentChange();

      // If we have a surveyId, save to the server
      if (surveyId) {
        // Prepare survey data with updated sections
        const surveyData = {
          surveySections: sections.map(s => 
            s._id === sectionData._id ? sectionData : s
          )
        };

        // Call the server method to update the survey
        await Meteor.callAsync('surveys.update', surveyId, surveyData);
        
        // Reset unsaved changes flag
        setHasUnsavedChanges(false);
      }
    } catch (error) {
      console.error('Error saving section:', error);
    } finally {
      isSavingSectionRef.current = false;
    }
  };

  // Handle deleting a section
  const handleDeleteSection = (sectionId: string) => {
    if (window.confirm('Are you sure you want to delete this section? This will remove all questions assigned to this section.')) {
      // Remove section
      setSections(prev => prev.filter(s => s._id !== sectionId));
      
      // Completely remove questions associated with this section
      setSurveyQuestions(prev => prev.filter(q => q.sectionId !== sectionId));

      // Track content change
      trackContentChange();
    }
  };

  // Handle reordering sections
  const handleReorderSection = async (oldIndex: number, newIndex: number) => {
    // Reorder the sections
    const reorderedSections = [...sections];
    const [movedSection] = reorderedSections.splice(oldIndex, 1);
    reorderedSections.splice(newIndex, 0, movedSection);
    
    // Update the order property for each section
    const updatedSections = reorderedSections.map((section, index) => ({
      ...section,
      order: index
    }));
    
    setSections(updatedSections);

    // Track content change
    trackContentChange();

    // If we have a surveyId, save to the server
    if (surveyId) {
      try {
        // Prepare survey data with updated sections
        const surveyData = {
          surveySections: updatedSections
        };

        // Call the server method to update the survey
        await Meteor.callAsync('surveys.update', surveyId, surveyData);
        
        // Reset unsaved changes flag
        setHasUnsavedChanges(false);
      } catch (error) {
        console.error('Error reordering sections:', error);
      }
    }
  };

  // Get questions for a specific section
  const getQuestionsForSection = (sectionId: string) => {
    return surveyQuestions.filter(q => q.sectionId === sectionId);
  };

  // Get selected question IDs for a section
  const getSelectedQuestionIds = (sectionId: string) => {
    return surveyQuestions
      .filter(q => q.sectionId === sectionId)
      .map(q => q.id);
  };

  return {
    // State
    showSectionEditor,
    setShowSectionEditor,
    currentSection,
    setCurrentSection,
    hasUnsavedChanges,
    setHasUnsavedChanges,

    // Section management functions
    handleAddSection,
    handleEditSection,
    handleSaveSection,
    handleDeleteSection,
    handleReorderSection,
    getQuestionsForSection,
    getSelectedQuestionIds,
  };
};




