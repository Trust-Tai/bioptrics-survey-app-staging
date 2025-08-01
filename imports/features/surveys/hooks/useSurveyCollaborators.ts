import { useState, useEffect, useCallback } from 'react';
import { Meteor } from 'meteor/meteor';

/**
 * Custom hook to manage survey collaborators
 * Handles loading, adding, and removing collaborators
 */
export const useSurveyCollaborators = (surveyId: string | undefined, shouldLoad: boolean = false) => {
  const [collaborators, setCollaborators] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  // Function to load collaborators
  const loadCollaborators = useCallback(() => {
    if (!surveyId || !shouldLoad) return;
    
    setIsLoading(true);
    setError(null);
    
    Meteor.call('surveys.getCollaborators', surveyId, (error: any, result: any) => {
      setIsLoading(false);
      if (error) {
        console.error('Error loading collaborators:', error);
        setError(error instanceof Error ? error : new Error('Failed to load collaborators'));
      } else {
        setCollaborators(result || []);
      }
    });
  }, [surveyId, shouldLoad]);

  // Load collaborators when shouldLoad changes to true
  useEffect(() => {
    if (shouldLoad) {
      loadCollaborators();
    }
  }, [shouldLoad, loadCollaborators]);

  // Function to add a new collaborator
  const addCollaborator = useCallback((email: string, role: string, sendEmail: boolean = true) => {
    if (!surveyId || !email || !role) {
      return Promise.reject(new Error('Missing required parameters'));
    }
    
    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return Promise.reject(new Error('Please enter a valid email address'));
    }
    
    setIsLoading(true);
    
    return new Promise((resolve, reject) => {
      Meteor.call(
        'surveys.addCollaborator', 
        surveyId, 
        email, 
        role,
        sendEmail,
        (error: any) => {
          setIsLoading(false);
          
          if (error) {
            console.error('Error adding collaborator:', error);
            setError(error instanceof Error ? error : new Error('Failed to add collaborator'));
            reject(error);
          } else {
            // Reload collaborators list
            loadCollaborators();
            resolve({ success: true, message: `Successfully added ${email} as a collaborator` });
          }
        }
      );
    });
  }, [surveyId, loadCollaborators]);

  // Function to remove a collaborator
  const removeCollaborator = useCallback((collaboratorId: string, email: string) => {
    if (!surveyId || !collaboratorId) {
      return Promise.reject(new Error('Missing required parameters'));
    }
    
    setIsLoading(true);
    
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.removeCollaborator', surveyId, collaboratorId, (error: any) => {
        setIsLoading(false);
        
        if (error) {
          console.error('Error removing collaborator:', error);
          setError(error instanceof Error ? error : new Error('Failed to remove collaborator'));
          reject(error);
        } else {
          // Reload collaborators list
          loadCollaborators();
          resolve({ success: true, message: `Successfully removed ${email} as a collaborator` });
        }
      });
    });
  }, [surveyId, loadCollaborators]);

  return {
    collaborators,
    isLoading,
    error,
    loadCollaborators,
    addCollaborator,
    removeCollaborator
  };
};
