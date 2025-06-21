import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';

// Define the IncompleteSurveyResponse type
export interface IncompleteSurveyResponse {
  _id?: string;
  surveyId: string;
  respondentId: string;
  startedAt: Date;
  lastUpdatedAt: Date;
  responses?: Array<{
    questionId: string;
    answer: any;
    sectionId?: string;
  }>;
  isCompleted: boolean; // Will be set to true when moved to surveyResponses
  isAbandoned?: boolean; // Will be set to true if the user abandons the survey
}

// Create the collection
export const IncompleteSurveyResponses = new Mongo.Collection<IncompleteSurveyResponse>('incompleteSurveyResponses');

// Define methods
if (Meteor.isServer) {
  Meteor.methods({
    async 'incompleteSurveyResponses.start'(surveyId: string, respondentId: string) {
      console.log('incompleteSurveyResponses.start called with:', { surveyId, respondentId });
      
      try {
        check(surveyId, String);
        check(respondentId, String);

        // Check if there's already an incomplete response for this respondent and survey
        const existingResponse = await IncompleteSurveyResponses.findOneAsync({
          surveyId,
          respondentId,
          isCompleted: false
        });

        if (existingResponse && existingResponse._id) {
          console.log(`Found existing incomplete response: ${existingResponse._id}`);
          // Update the lastUpdatedAt timestamp
          await IncompleteSurveyResponses.updateAsync(existingResponse._id, {
            $set: { lastUpdatedAt: new Date() }
          });
          return existingResponse._id;
        } else {
          // Create a new incomplete response
          const newResponse = {
            surveyId,
            respondentId,
            startedAt: new Date(),
            lastUpdatedAt: new Date(),
            responses: [],
            isCompleted: false
          };
          
          console.log('Creating new incomplete survey response:', newResponse);
          const responseId = await IncompleteSurveyResponses.insertAsync(newResponse);
          
          console.log(`New incomplete survey response created: ${responseId}`);
          return responseId;
        }
      } catch (error: unknown) {
        console.error('Error in incompleteSurveyResponses.start:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('incomplete-survey-error', `Error starting survey tracking: ${errorMessage}`);
      }
    },

    async 'incompleteSurveyResponses.update'(responseId: string, questionId: string, answer: any, sectionId?: string) {
      console.log('incompleteSurveyResponses.update called with:', { responseId, questionId, sectionId });
      
      try {
        check(responseId, String);
        check(questionId, String);
        // We don't check answer type since it can be any valid JSON value
        if (sectionId) check(sectionId, String);

        // Find the response
        const response = await IncompleteSurveyResponses.findOneAsync(responseId);
        if (!response) {
          throw new Meteor.Error('not-found', 'Incomplete survey response not found');
        }

        console.log('Found response:', response);
        
        // Initialize responses array if it doesn't exist
        const currentResponses = response.responses || [];
        console.log('Current responses:', currentResponses);
        
        // Check if the response already has this question answered
        const existingResponseIndex = currentResponses.findIndex(r => r.questionId === questionId);
        
        if (existingResponseIndex !== undefined && existingResponseIndex >= 0) {
          // Update existing answer
          console.log(`Updating existing answer for question ${questionId}`);
          const updatedResponses = [...currentResponses];
          updatedResponses[existingResponseIndex] = {
            questionId,
            answer,
            sectionId
          };
          
          console.log('Updating with responses:', updatedResponses);
          await IncompleteSurveyResponses.updateAsync(responseId, {
            $set: {
              responses: updatedResponses,
              lastUpdatedAt: new Date()
            }
          });
        } else {
          // Add new answer
          console.log(`Adding new answer for question ${questionId}`);
          const newResponse = {
            questionId,
            answer,
            sectionId
          };
          
          const updatedResponses = [...currentResponses, newResponse];
          console.log('Setting responses to:', updatedResponses);
          
          await IncompleteSurveyResponses.updateAsync(responseId, {
            $set: {
              responses: updatedResponses,
              lastUpdatedAt: new Date()
            }
          });
        }
        
        return true;
      } catch (error: unknown) {
        console.error('Error in incompleteSurveyResponses.update:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('incomplete-survey-error', `Error updating survey response: ${errorMessage}`);
      }
    },

    async 'incompleteSurveyResponses.removeBySurveyAndRespondent'(surveyId: string, respondentId: string) {
      console.log('incompleteSurveyResponses.removeBySurveyAndRespondent called with:', { surveyId, respondentId });
      try {
        check(surveyId, String);
        check(respondentId, String);

        // Log all responses in the collection for debugging
        const allResponses = await IncompleteSurveyResponses.find({}).fetchAsync();
        console.log(`Total incomplete responses in collection before removal: ${allResponses.length}`);
        
        // Try to find the response by surveyId and respondentId
        const responses = await IncompleteSurveyResponses.find({ 
          surveyId: surveyId,
          respondentId: respondentId
        }).fetchAsync();
        
        if (responses.length === 0) {
          console.log(`No responses found with surveyId: ${surveyId} and respondentId: ${respondentId}`);
          return false;
        }
        
        console.log(`Found ${responses.length} responses to remove with surveyId: ${surveyId} and respondentId: ${respondentId}`);
        console.log('Responses to remove:', responses.map(r => ({ _id: r._id })));
        
        // Remove all matching responses using multiple approaches to ensure success
        console.log(`Removing documents with surveyId: ${surveyId} and respondentId: ${respondentId}`);
        
        // First try with Meteor's removeAsync
        console.log('Attempting removal with Meteor removeAsync...');
        try {
          const meteorRemoveResult = await IncompleteSurveyResponses.removeAsync({ 
            surveyId: surveyId,
            respondentId: respondentId
          });
          console.log('Meteor removeAsync result:', meteorRemoveResult);
        } catch (err) {
          console.error('Error with Meteor removeAsync:', err);
        }
        
        // Then try with MongoDB driver for more reliable removal
        console.log('Attempting removal with MongoDB driver...');
        try {
          const collection = IncompleteSurveyResponses.rawCollection();
          const removeResult = await collection.deleteMany({ 
            surveyId: surveyId,
            respondentId: respondentId
          });
          console.log('MongoDB deleteMany result:', removeResult);
        } catch (err) {
          console.error('Error with MongoDB deleteMany:', err);
        }
        
        // If documents still exist, try removing them one by one
        const remainingDocs = await IncompleteSurveyResponses.find({
          surveyId: surveyId,
          respondentId: respondentId
        }).fetchAsync();
        
        if (remainingDocs.length > 0) {
          console.log(`Still found ${remainingDocs.length} documents, removing them individually...`);
          for (const doc of remainingDocs) {
            console.log(`Removing individual document with ID: ${doc._id}`);
            try {
              await IncompleteSurveyResponses.removeAsync({ _id: doc._id });
            } catch (err) {
              console.error(`Error removing document ${doc._id}:`, err);
              // Try with MongoDB driver as last resort
              try {
                const collection = IncompleteSurveyResponses.rawCollection();
                await collection.deleteOne({ _id: doc._id });
              } catch (innerErr) {
                console.error(`Failed to remove document ${doc._id} with MongoDB driver:`, innerErr);
              }
            }
          }
        }
        
        // Log the final status
        
        // Verify removal
        const afterResponses = await IncompleteSurveyResponses.find({
          surveyId: surveyId,
          respondentId: respondentId
        }).fetchAsync();
        
        if (afterResponses.length === 0) {
          console.log(`Successfully removed all responses with surveyId: ${surveyId} and respondentId: ${respondentId}`);
          return true;
        } else {
          console.log(`Failed to remove some responses. ${afterResponses.length} responses still exist.`);
          return false;
        }
      } catch (error: unknown) {
        console.error('Error removing by survey and respondent:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('incomplete-survey-error', `Error removing survey response: ${errorMessage}`);
      }
    },
    
    async 'incompleteSurveyResponses.removeCompleted'(responseId: string) {
      console.log('incompleteSurveyResponses.removeCompleted called with:', responseId);
      try {
        check(responseId, String);

        // Log all responses in the collection for debugging
        const allResponses = await IncompleteSurveyResponses.find({}).fetchAsync();
        console.log(`Total incomplete responses in collection before removal: ${allResponses.length}`);
        console.log('All incomplete responses before removal:', allResponses.map(r => ({ 
          _id: r._id, 
          surveyId: r.surveyId,
          respondentId: r.respondentId,
          isCompleted: r.isCompleted
        })));
        
        // Try to find the response by ID
        const response = await IncompleteSurveyResponses.findOneAsync({ _id: responseId });
        
        if (!response) {
          console.log(`Response with ID ${responseId} not found. Trying to find by other criteria...`);
          
          // Try to find any incomplete response that might match
          console.log('Trying to find any incomplete responses...');
          const incompleteResponses = await IncompleteSurveyResponses.find({ isCompleted: false }).fetchAsync();
          
          if (incompleteResponses.length > 0) {
            console.log(`Found ${incompleteResponses.length} incomplete responses. Checking for potential matches.`);
            
            // For debugging purposes, log all incomplete responses
            console.log('All incomplete responses:', incompleteResponses.map(r => ({ 
              _id: r._id, 
              surveyId: r.surveyId,
              respondentId: r.respondentId
            })));
            
            // Since we can't access localStorage on the server, we'll just log that no match was found
            console.log('No exact match found for the provided responseId.');
          }
          
          console.log('Could not find response by any criteria. Nothing to remove.');
          return false;
        }

        // Remove the response from the collection
        console.log(`Removing response with ID: ${responseId}`);
        try {
          // First try with Meteor's removeAsync
          const meteorRemoveResult = await IncompleteSurveyResponses.removeAsync({ _id: responseId });
          console.log('Meteor removeAsync result:', meteorRemoveResult);
          
          // Then try with MongoDB driver for more reliable removal
          const collection = IncompleteSurveyResponses.rawCollection();
          const removeResult = await collection.deleteOne({ _id: responseId });
          console.log('MongoDB deleteOne result:', removeResult);
          
          // Verify removal
          const checkAfterRemove = await IncompleteSurveyResponses.findOneAsync({ _id: responseId });
          if (!checkAfterRemove) {
            console.log(`Successfully removed response with ID ${responseId}`);
            return true;
          } else {
            console.error(`Failed to remove response with ID ${responseId}`);
            return false;
          }
        } catch (err) {
          console.error('Error during removal operation:', err);
          return false;
        }
      } catch (error: unknown) {
        console.error('Error removing completed response:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('incomplete-survey-error', `Error removing completed response: ${errorMessage}`);
      }
    },

    // Keeping the markAsCompleted method for backward compatibility
    async 'incompleteSurveyResponses.markAsCompleted'(responseId: string) {
      console.log('incompleteSurveyResponses.markAsCompleted called with:', responseId);
      try {
        check(responseId, String);

        // First check if the response exists
        const response = await IncompleteSurveyResponses.findOneAsync(responseId);
        if (!response) {
          console.log(`Response ${responseId} not found for marking as completed`);
          return false;
        }

        await IncompleteSurveyResponses.updateAsync(
          { _id: responseId },
          { $set: { isCompleted: true, lastUpdatedAt: new Date() } }
        );
        console.log(`Response ${responseId} marked as completed`);
        return true;
      } catch (error: unknown) {
        console.error('Error marking response as completed:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('incomplete-survey-error', `Error marking response as completed: ${errorMessage}`);
      }
    },

    // Method to mark an incomplete survey as abandoned (optional cleanup)
    async 'incompleteSurveyResponses.markAsAbandoned'(responseId: string) {
      console.log('incompleteSurveyResponses.markAsAbandoned called with:', responseId);
      try {
        check(responseId, String);

        // First check if the response exists
        const response = await IncompleteSurveyResponses.findOneAsync(responseId);
        if (!response) {
          console.log(`Response ${responseId} not found for marking as abandoned`);
          return false;
        }

        await IncompleteSurveyResponses.updateAsync(
          { _id: responseId },
          { $set: { isAbandoned: true, lastUpdatedAt: new Date() } }
        );
        console.log(`Response ${responseId} marked as abandoned`);
        return true;
      } catch (error: unknown) {
        console.error('Error marking response as abandoned:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('incomplete-survey-error', `Error marking response as abandoned: ${errorMessage}`);
      }
    }
  });

  // Set up publication for incomplete survey responses
  Meteor.publish('incompleteSurveyResponses.all', function () {
    if (!this.userId) {
      return this.ready();
    }
    
    return IncompleteSurveyResponses.find();
  });

  Meteor.publish('incompleteSurveyResponses.byRespondent', function (respondentId) {
    check(respondentId, String);
    
    return IncompleteSurveyResponses.find({ respondentId });
  });
  
  // Replace all remaining update calls with updateAsync
  // We'll update the specific instances instead of overriding the method
}
