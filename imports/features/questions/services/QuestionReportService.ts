import { Meteor } from 'meteor/meteor';

/**
 * Service for handling question report operations
 */
export class QuestionReportService {
  /**
   * Get response data for a specific question
   * @param questionId Question ID to fetch response data for
   */
  static async getQuestionResponseData(questionId: string) {
    try {
      console.log('QuestionReportService: Calling questions.getResponseData method for question ID:', questionId);
      return new Promise((resolve, reject) => {
        Meteor.call('questions.getResponseData', questionId, (error: Meteor.Error | undefined, result: any) => {
          if (error) {
            console.error('Error fetching question response data:', error);
            reject(error);
          } else {
            console.log('QuestionReportService: Received response from questions.getResponseData');
            resolve(result);
          }
        });
      });
    } catch (error: unknown) {
      console.error('Error in getQuestionResponseData:', error);
      throw error;
    }
  }
}
