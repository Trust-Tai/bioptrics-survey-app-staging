import { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { Questions } from '../../../features/questions/api/questions';
import { Surveys } from '../../../features/surveys/api/surveys';

// Types
export interface QuestionItem {
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

export interface SurveySectionItem {
  _id: string;
  title: string;
  description?: string;
  order: number;
  questions?: QuestionItem[];
}

export interface SurveyData {
  _id?: string;
  title: string;
  description: string;
  status: string;
  surveySections?: SurveySectionItem[];
  questions?: QuestionItem[];
  surveyOrder?: any[];
  sectionQuestions?: any;
  selectedQuestions?: any;
  createdAt?: Date;
  createdBy?: string;
  defaultSettings?: {
    allowRetake?: boolean;
  };
}

// Hook for managing survey data
export const useSurveyData = (surveyId?: string) => {
  // State
  const [surveyData, setSurveyData] = useState<SurveyData | null>(null);
  const [survey, setSurvey] = useState<SurveyData>({ 
    defaultSettings: { allowRetake: true },
    title: '',
    description: '',
    status: 'draft'
  });
  const [sections, setSections] = useState<SurveySectionItem[]>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<QuestionItem[]>([]);
  const [surveyOrder, setSurveyOrder] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Subscribe to questions for the survey
  useEffect(() => {
    if (surveyId) {
      const subscription = Meteor.subscribe('questions.all', surveyId);
      
      return () => {
        if (subscription) {
          subscription.stop();
        }
      };
    }
  }, [surveyId]);

  // Load survey data when surveyId changes
  useEffect(() => {
    if (surveyId) {
      setIsLoading(true);
      Meteor.call('surveys.getSurvey', surveyId, (error: any, result: any) => {
        setIsLoading(false);
        if (error) {
          console.error('Error loading survey:', error);
        } else {
          setSurvey(result);
          setSections(result.surveySections || []);
          
          // Set surveyOrder state from the loaded survey data
          console.log('Loading surveyOrder from survey data:', result.surveyOrder);
          if (result.surveyOrder && Array.isArray(result.surveyOrder)) {
            setSurveyOrder(result.surveyOrder);
          } else {
            console.warn('No surveyOrder found in loaded survey data, initializing empty array');
            setSurveyOrder([]);
          }
        }
      });
    }
  }, [surveyId]);

  // Load questions from the database
  useTracker(() => {
    if (surveyId) {
      const questionsSub = Meteor.subscribe('questions.bySurvey', surveyId);
      if (questionsSub.ready()) {
        // Fetch questions from the collection directly
        const questionsFromDB = Questions.find({}).fetch();
        
        // Map QuestionDoc objects to QuestionItem objects
        const mappedQuestions = questionsFromDB.map(question => {
          // Find the latest version of the question
          const latestVersion = question.versions.find(v => v.version === question.currentVersion) || question.versions[0];

          // Determine status - explicitly use 'published' or 'draft' to match the union type
          const status: 'published' | 'draft' = latestVersion?.isActive !== false ? 'published' : 'draft';
          
          return {
            id: question._id || '',
            _id: question._id,
            text: latestVersion?.questionText || '',
            type: latestVersion?.responseType || '',
            status,
            versions: question.versions,
            currentVersion: question.currentVersion,
            questionText: latestVersion?.questionText
          };
        });
        
        setSurveyQuestions(mappedQuestions);
      }
    }
  }, [surveyId]);

  // Helper function to get total question count in a survey
  const getTotalQuestionCount = (survey: SurveyData | null): number => {
    if (!survey) return 0;
    
    let count = 0;
    
    // Count questions in sections
    if (survey.surveySections && Array.isArray(survey.surveySections)) {
      survey.surveySections.forEach((section: SurveySectionItem) => {
        if (section.questions && Array.isArray(section.questions)) {
          count += section.questions.length;
        }
      });
    }
    
    // Count direct questions (non-sectioned surveys)
    if (survey.questions && Array.isArray(survey.questions)) {
      count += survey.questions.length;
    }
    
    return count;
  };

  // Helper function to get question details
  const getQuestionDetails = (questionId: string, sectionId: string | undefined, surveyData: SurveyData | null) => {
    if (!surveyData) return { questionText: "Unknown Question", sectionName: "" };
    
    let questionText = "Unknown Question";
    let sectionName = "";
    
    // Try to find question in direct questions array
    if (surveyData.questions && Array.isArray(surveyData.questions)) {
      const question = surveyData.questions.find((q: any) => q._id === questionId);
      if (question) {
        questionText = question.text || question.title || "Unknown Question";
        return { questionText, sectionName };
      }
    }
    
    // Try to find question in sections
    if (surveyData.surveySections && Array.isArray(surveyData.surveySections)) {
      for (const section of surveyData.surveySections) {
        if (sectionId && section._id !== sectionId) continue;
        
        if (section.questions && Array.isArray(section.questions)) {
          const question = section.questions.find((q: any) => q._id === questionId);
          if (question) {
            questionText = question.text || question.title || "Unknown Question";
            sectionName = section.title || section.name || "";
            return { questionText, sectionName };
          }
        }
      }
    }
    
    // Try to find in selectedQuestions object
    if (surveyData.selectedQuestions && typeof surveyData.selectedQuestions === 'object') {
      for (const key in surveyData.selectedQuestions) {
        if (key === questionId) {
          const question = surveyData.selectedQuestions[key];
          questionText = question.text || question.title || "Unknown Question";
          return { questionText, sectionName };
        }
      }
    }
    
    // Deep search in the entire survey data structure
    const deepSearch = (obj: any, targetId: string): any => {
      if (!obj || typeof obj !== 'object') return null;
      
      if (obj._id === targetId) return obj;
      
      for (const key in obj) {
        if (Array.isArray(obj[key])) {
          for (const item of obj[key]) {
            const found = deepSearch(item, targetId);
            if (found) return found;
          }
        } else if (typeof obj[key] === 'object') {
          const found = deepSearch(obj[key], targetId);
          if (found) return found;
        }
      }
      return null;
    };
    
    const foundQuestion = deepSearch(surveyData, questionId);
    if (foundQuestion) {
      questionText = foundQuestion.text || foundQuestion.title || "Unknown Question";
    }
    
    return { questionText, sectionName };
  };

  // Refresh survey data
  const refreshSurveyData = () => {
    if (surveyId) {
      Meteor.subscribe('questions.all', surveyId);
      Meteor.call('surveys.getSurvey', surveyId, (error: any, result: any) => {
        if (error) {
          console.error('Error refreshing survey:', error);
        } else {
          setSurvey(result);
          setSections(result.surveySections || []);
          setSurveyOrder(result.surveyOrder || []);
        }
      });
    }
  };

  // Load survey data for question lookup
  const loadSurveyDataForLookup = () => {
    if (!surveyData && surveyId) {
      Meteor.call('getSurveyById', surveyId, (err: Meteor.Error, survey: any) => {
        if (err) {
          console.error('Error fetching survey data:', err);
          return;
        }
        setSurveyData(survey);
      });
    }
  };

  return {
    // State
    surveyData,
    setSurveyData,
    survey,
    setSurvey,
    sections,
    setSections,
    surveyQuestions,
    setSurveyQuestions,
    surveyOrder,
    setSurveyOrder,
    isLoading,
    
    // Helper functions
    getTotalQuestionCount,
    getQuestionDetails,
    refreshSurveyData,
    loadSurveyDataForLookup,
  };
};