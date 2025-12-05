import { Meteor } from 'meteor/meteor';
import { SurveyResponses } from '/imports/features/surveys/api/surveyResponses';
import { ModuleEventBus, ModuleEvents } from '/imports/core/communication/ModuleEventBus';

// Responses API for the Survey module
export const ResponsesAPI = {
  // Submit a survey response
  submitResponse: async (surveyId: string, responses: any, respondentData?: any) => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.submitResponse', surveyId, responses, respondentData, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          // Publish event for other modules
          ModuleEventBus.getInstance().publish(
            ModuleEvents.SURVEY_RESPONSE_SUBMITTED,
            { 
              surveyId, 
              responseId: result, 
              responses,
              respondentData,
              submittedAt: new Date()
            },
            'survey',
            respondentData?.userId
          );
          resolve(result);
        }
      });
    });
  },

  // Get responses for a survey
  getSurveyResponses: async (surveyId: string, filters?: any) => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.getResponses', surveyId, filters, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  },

  // Get response by ID
  getResponse: async (responseId: string) => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.getResponse', responseId, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  },

  // Get response statistics
  getResponseStats: async (surveyId: string) => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.getResponseStats', surveyId, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  },

  // Get all responses (reactive)
  getAllResponses: (surveyId?: string) => {
    if (surveyId) {
      return SurveyResponses.find({ surveyId }).fetch();
    }
    return SurveyResponses.find({}).fetch();
  },

  // Calculate completion rate
  getCompletionRate: async (surveyId: string) => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.getCompletionRate', surveyId, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  },

  // Export responses
  exportResponses: async (surveyId: string, format: 'csv' | 'excel' | 'json' = 'csv') => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.exportResponses', surveyId, format, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
};

export default ResponsesAPI;
