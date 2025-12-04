import { Meteor } from 'meteor/meteor';
import { Surveys } from '/imports/features/surveys/api/surveys';
import { ModuleEventBus, ModuleEvents } from '/imports/core/communication/ModuleEventBus';

// Survey API for the Survey module
export const SurveyAPI = {
  // Create a new survey
  createSurvey: async (surveyData: any) => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.insert', surveyData, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          // Publish event for other modules
          ModuleEventBus.getInstance().publish(
            'survey.created',
            { surveyId: result, ...surveyData },
            'survey',
            Meteor.userId()
          );
          resolve(result);
        }
      });
    });
  },

  // Get survey by ID
  getSurvey: async (surveyId: string) => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.getSurvey', surveyId, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  },

  // Update survey
  updateSurvey: async (surveyId: string, updates: any) => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.update', surveyId, updates, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          // Publish event for other modules
          ModuleEventBus.getInstance().publish(
            'survey.updated',
            { surveyId, updates },
            'survey',
            Meteor.userId()
          );
          resolve(result);
        }
      });
    });
  },

  // Delete survey
  deleteSurvey: async (surveyId: string) => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.remove', surveyId, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          // Publish event for other modules
          ModuleEventBus.getInstance().publish(
            'survey.deleted',
            { surveyId },
            'survey',
            Meteor.userId()
          );
          resolve(result);
        }
      });
    });
  },

  // Publish survey
  publishSurvey: async (surveyId: string) => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.makePublic', surveyId, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          // Publish event for other modules
          ModuleEventBus.getInstance().publish(
            ModuleEvents.SURVEY_PUBLISHED,
            { surveyId, shareToken: result },
            'survey',
            Meteor.userId()
          );
          resolve(result);
        }
      });
    });
  },

  // Get all surveys for current user
  getAllSurveys: () => {
    // Use existing reactive data source
    return Surveys.find({}).fetch();
  },

  // Get survey analytics
  getSurveyAnalytics: async (surveyId: string) => {
    return new Promise((resolve, reject) => {
      Meteor.call('surveys.getAnalytics', surveyId, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  }
};

export default SurveyAPI;
