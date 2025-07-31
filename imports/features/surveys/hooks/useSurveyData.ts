import { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Surveys } from '../api/surveys';
import { Questions } from '../../../features/questions/api/questions';
import { SurveyThemes } from '../../../features/survey-themes/api/surveyThemes';
import { WPSCategories } from '../../../features/wps-framework/api/wpsCategories';

// Define QuestionItem interface
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

// Define SurveySectionItem interface
interface SurveySectionItem {
  _id: string;
  title: string;
  description?: string;
  order: number;
  questions: QuestionItem[];
  isVisible?: boolean;
  visibilityCondition?: any;
  timeLimit?: number;
}

/**
 * Custom hook to fetch and manage survey data
 * Consolidates multiple data fetching operations into a single hook
 */
export const useSurveyData = (surveyId: string | undefined) => {
  const [survey, setSurvey] = useState<any>(null);
  const [sections, setSections] = useState<SurveySectionItem[]>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<QuestionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Helper function to extract question text from the current version
  const getQuestionText = (question: any): string => {
    if (!question) return 'Untitled Question';
    if (!question.versions || !Array.isArray(question.versions) || question.versions.length === 0) {
      return 'Untitled Question';
    }
    
    // Get the latest version
    const currentVersion = question.currentVersion;
    const latestVersion = question.versions.find((v: any) => v.version === currentVersion) || 
                          question.versions[question.versions.length - 1];
    
    // Strip HTML tags from question text for cleaner display
    const questionText = latestVersion && latestVersion.questionText ? latestVersion.questionText : 'Untitled Question';
    return questionText.replace(/<\/?p>/g, '').replace(/<\/?[^>]+(>|$)/g, '');
  };

  // Use Meteor's reactive data system to load questions and survey data
  const { allQuestions, surveyThemes, wpsCategories, subscriptionsReady } = useTracker(() => {
    // Only subscribe if we have a surveyId
    if (!surveyId) {
      return { 
        allQuestions: [], 
        surveyThemes: [], 
        wpsCategories: [], 
        subscriptionsReady: true 
      };
    }

    // Subscribe to necessary collections with field filtering for better performance
    const questionsSub = Meteor.subscribe('questions.all', { 
      fields: { 
        _id: 1, 
        currentVersion: 1, 
        versions: 1, 
        createdAt: 1 
      } 
    });
    
    const themesSub = Meteor.subscribe('surveyThemes.all', { 
      fields: { 
        _id: 1, 
        name: 1 
      } 
    });
    
    const categoriesSub = Meteor.subscribe('wpsCategories.all', { 
      fields: { 
        _id: 1, 
        name: 1 
      } 
    });
    
    const surveysSub = Meteor.subscribe('surveys.single', surveyId);
    
    const subscriptionsReady = 
      questionsSub.ready() && 
      surveysSub.ready() && 
      themesSub.ready() && 
      categoriesSub.ready();

    // Fetch data only when subscriptions are ready
    const allQuestions = subscriptionsReady ? Questions.find({}, { 
      sort: { createdAt: -1 },
      fields: { _id: 1, currentVersion: 1, versions: 1 }
    }).fetch().map(q => {
      // Get the latest version to extract the response type
      const currentVersion = q.currentVersion;
      const latestVersion = q.versions && Array.isArray(q.versions) ?
        (q.versions.find((v: any) => v.version === currentVersion) || 
        (q.versions.length > 0 ? q.versions[q.versions.length - 1] : null)) : null;
      
      // Create a properly typed QuestionItem
      const questionItem: QuestionItem = {
        id: q._id || '',
        text: getQuestionText(q),
        type: latestVersion?.responseType || 'text',
        status: 'published'
      };
      
      return questionItem;
    }) : [];
    
    const surveyThemes = subscriptionsReady ? SurveyThemes.find({}, { 
      sort: { name: 1 },
      fields: { _id: 1, name: 1 }
    }).fetch() : [];
    
    const wpsCategories = subscriptionsReady ? WPSCategories.find({}, { 
      sort: { name: 1 },
      fields: { _id: 1, name: 1 }
    }).fetch() : [];

    return { allQuestions, surveyThemes, wpsCategories, subscriptionsReady };
  }, [surveyId]);

  // Load survey data when surveyId changes
  useEffect(() => {
    if (!surveyId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    // Use a single method call to get survey data with questions
    Meteor.call('surveys.getSurveyWithQuestions', surveyId, (error: any, result: any) => {
      if (error) {
        console.error('Error loading survey data:', error);
        setError(error);
        setIsLoading(false);
      } else if (result) {
        // Process survey data
        const surveyData = result.survey;
        
        // Clean up the description by removing paragraph tags if they exist
        if (surveyData.description) {
          surveyData.description = surveyData.description.replace(/<p>/g, '').replace(/<\/p>/g, '');
        }
        
        // Ensure defaultSettings exists to prevent null reference errors
        if (!surveyData.defaultSettings) {
          surveyData.defaultSettings = { allowRetake: true };
        }
        
        setSurvey(surveyData);
        
        // Initialize sections if they exist in the survey
        if (surveyData.surveySections && Array.isArray(surveyData.surveySections)) {
          setSections(surveyData.surveySections);
        } else if (surveyData.sections && Array.isArray(surveyData.sections)) {
          setSections(surveyData.sections);
        }
        
        // Initialize questions if they exist in the survey
        if (result.questions && Array.isArray(result.questions)) {
          setSurveyQuestions(result.questions);
        }
        
        setIsLoading(false);
      }
    });
  }, [surveyId]);

  return {
    survey,
    sections,
    surveyQuestions,
    allQuestions,
    surveyThemes,
    wpsCategories,
    isLoading: isLoading || !subscriptionsReady,
    error
  };
};
