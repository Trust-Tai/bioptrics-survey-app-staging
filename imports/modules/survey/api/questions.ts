import { Meteor } from 'meteor/meteor';
import { Questions } from '/imports/features/questions/api/questions';
import { ModuleEventBus } from '/imports/core/communication/ModuleEventBus';

// Questions API for the Survey module
export const QuestionsAPI = {
  // Create a new question
  createQuestion: async (questionData: any) => {
    return new Promise((resolve, reject) => {
      Meteor.call('questions.insert', questionData, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          // Publish event for other modules
          ModuleEventBus.getInstance().publish(
            'question.created',
            { questionId: result, ...questionData },
            'survey',
            Meteor.userId() || undefined
          );
          resolve(result);
        }
      });
    });
  },

  // Get question by ID
  getQuestion: async (questionId: string) => {
    return new Promise((resolve, reject) => {
      Meteor.call('questions.getQuestion', questionId, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          resolve(result);
        }
      });
    });
  },

  // Update question
  updateQuestion: async (questionId: string, updates: any) => {
    return new Promise((resolve, reject) => {
      Meteor.call('questions.update', questionId, updates, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          // Publish event for other modules
          ModuleEventBus.getInstance().publish(
            'question.updated',
            { questionId, updates },
            'survey',
            Meteor.userId() || undefined
          );
          resolve(result);
        }
      });
    });
  },

  // Delete question
  deleteQuestion: async (questionId: string) => {
    return new Promise((resolve, reject) => {
      Meteor.call('questions.remove', questionId, (error: any, result: any) => {
        if (error) {
          reject(error);
        } else {
          // Publish event for other modules
          ModuleEventBus.getInstance().publish(
            'question.deleted',
            { questionId },
            'survey',
            Meteor.userId() || undefined
          );
          resolve(result);
        }
      });
    });
  },

  // Get all questions
  getAllQuestions: () => {
    // Use existing reactive data source
    return Questions.find({}).fetch();
  },

  // Get questions by type
  getQuestionsByType: (type: string) => {
    return Questions.find({ 'versions.0.responseType': type }).fetch();
  }
};

export default QuestionsAPI;
