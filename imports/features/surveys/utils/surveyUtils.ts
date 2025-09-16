// Utility functions for survey operations

export interface SurveyData {
  _id?: string;
  title: string;
  description: string;
  status: string;
  surveySections?: any[];
  questions?: any[];
  surveyOrder?: any[];
  sectionQuestions?: any;
  selectedQuestions?: any;
  createdAt?: Date;
  createdBy?: string;
  defaultSettings?: {
    allowRetake?: boolean;
  };
}

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

/**
 * Calculate the total number of questions in a survey
 */
export const getTotalQuestionCount = (survey: SurveyData | null): number => {
  if (!survey) return 0;
  
  let count = 0;
  
  // Count questions in sections
  if (survey.surveySections && Array.isArray(survey.surveySections)) {
    survey.surveySections.forEach((section: any) => {
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

/**
 * Calculate progress percentage based on responses and survey
 */
export const calculateProgress = (responses: any[], survey: SurveyData | null): number => {
  if (!responses || !responses.length || !survey) return 0;
  
  const totalQuestions = getTotalQuestionCount(survey);
  if (totalQuestions === 0) return 0;
  
  const answeredQuestions = responses.length;
  return Math.round((answeredQuestions / totalQuestions) * 100);
};

/**
 * Get question details from survey data
 */
export const getQuestionDetails = (questionId: string, sectionId: string | undefined, surveyData: SurveyData | null) => {
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

/**
 * Extract question text from question object
 */
export const extractQuestionText = (question: any): string => {
  if (!question) return "Unknown Question";
  
  // Try different possible text fields
  if (question.text) return question.text;
  if (question.title) return question.title;
  if (question.questionText) return question.questionText;
  
  // If it's a question with versions, get the latest version text
  if (question.versions && Array.isArray(question.versions) && question.versions.length > 0) {
    const latestVersion = question.versions.find((v: any) => v.version === question.currentVersion) || question.versions[0];
    if (latestVersion && latestVersion.questionText) {
      return latestVersion.questionText;
    }
  }
  
  return "Unknown Question";
};

/**
 * Get the latest version of a question
 */
export const getLatestQuestionVersion = (question: any): any => {
  if (!question || !question.versions || !Array.isArray(question.versions)) {
    return question;
  }
  
  const latestVersion = question.versions.find((v: any) => v.version === question.currentVersion) || question.versions[0];
  return latestVersion || question;
};

/**
 * Format survey data for saving
 */
export const formatSurveyDataForSave = (survey: SurveyData, surveyOrder: any[], sectionQuestions: any): any => {
  return {
    ...survey,
    title: survey?.title || 'Untitled Survey',
    description: survey?.description || '',
    status: survey?.status || 'draft',
    surveyOrder: surveyOrder || [],
    sectionQuestions: sectionQuestions || {},
    updatedAt: new Date(),
    updatedBy: Meteor.userId() || 'anonymous'
  };
};

/**
 * Validate survey data before saving
 */
export const validateSurveyData = (survey: SurveyData): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  if (!survey.title || survey.title.trim() === '') {
    errors.push('Survey title is required');
  }
  
  if (survey.title && survey.title.length > 200) {
    errors.push('Survey title must be less than 200 characters');
  }
  
  if (survey.description && survey.description.length > 1000) {
    errors.push('Survey description must be less than 1000 characters');
  }
  
  return {
    isValid: errors.length === 0,
    errors
  };
};




