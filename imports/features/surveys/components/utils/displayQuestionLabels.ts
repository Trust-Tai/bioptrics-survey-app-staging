import { Meteor } from 'meteor/meteor';
import { Layers } from '../../../../api/layers';

/**
 * Fetches and returns the label names for a given question ID
 * @param questionId - The ID of the question to fetch labels for
 * @returns An array of label names
 */
export const getQuestionLabelNames = (labelIds: string[]): Promise<string[]> => {
  return new Promise((resolve, reject) => {
    try {
      // Find all layers that match the given IDs
      const labels = Layers.find({ _id: { $in: labelIds } }).fetch();
      
      // Map the labels to their names
      const labelNames = labels.map(label => label.name);
      
      resolve(labelNames);
    } catch (error) {
      console.error('Error fetching label names:', error);
      reject(error);
    }
  });
};

/**
 * Displays the label names for a given question in the console
 * @param questionId - The ID of the question to display labels for
 */
export const displayQuestionLabels = async (questionId: string): Promise<void> => {
  try {
    // Fetch the question from the database
    const question = await Meteor.callAsync('questions.getById', questionId);
    
    if (!question) {
      console.error(`Question with ID ${questionId} not found`);
      return;
    }
    
    // Extract the label IDs from the question
    const labelIds = question.labels || [];
    
    if (labelIds.length === 0) {
      console.log(`Question "${question.questionText || 'Untitled'}" has no labels`);
      return;
    }
    
    // Get the label names
    const labelNames = await getQuestionLabelNames(labelIds);
    
    // Display the results
    console.log(`Labels for question "${question.questionText || 'Untitled'}" (ID: ${questionId}):`);
    labelNames.forEach((name, index) => {
      console.log(`${index + 1}. ${name} (ID: ${labelIds[index]})`);
    });
  } catch (error) {
    console.error('Error displaying question labels:', error);
  }
};

/**
 * Utility function to display labels for multiple questions
 * @param questionIds - Array of question IDs to display labels for
 */
export const displayLabelsForMultipleQuestions = async (questionIds: string[]): Promise<void> => {
  for (const questionId of questionIds) {
    await displayQuestionLabels(questionId);
    console.log('-------------------');
  }
};
