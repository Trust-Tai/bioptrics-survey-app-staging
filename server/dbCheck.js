import { Meteor } from 'meteor/meteor';
import { SurveyResponses } from '/imports/features/surveys/api/surveyResponses';
import { Surveys } from '/imports/features/surveys/api/surveys';
import { Random } from 'meteor/random';

Meteor.methods({
  async 'checkDatabase'() {
    console.log('checkDatabase method called');
    
    // Temporarily disable user role check for testing
    // if (!Roles.userIsInRole(this.userId, ['admin'])) {
    //   throw new Meteor.Error('not-authorized', 'You must be an admin to check the database');
    // }
    
    try {
      // Get counts from different collections
      const totalSurveys = await Surveys.find().countAsync();
      const totalResponses = await SurveyResponses.find().countAsync();
      const completedResponses = await SurveyResponses.find({ completed: true }).countAsync();
      
      // Get a sample of recent responses
      const recentResponses = await SurveyResponses.find({}, { 
        sort: { createdAt: -1 },
        limit: 5 
      }).fetchAsync();
      
      return {
        totalSurveys,
        totalResponses,
        completedResponses,
        recentResponses: recentResponses.map(r => ({
          _id: r._id,
          surveyId: r.surveyId,
          completed: r.completed,
          createdAt: r.createdAt,
          responseCount: r.responses ? r.responses.length : 0
        }))
      };
    } catch (error) {
      console.error('Error checking database:', error);
      throw new Meteor.Error('db-error', `Error checking database: ${error.message}`);
    }
  },
  
  // Test method to verify database write capability
  async 'testDatabaseWrite'() {
    console.log('testDatabaseWrite method called');
    
    try {
      // Create a test survey response
      const testResponse = {
        surveyId: 'test-survey-id',
        responses: [
          {
            questionId: 'test-question-1',
            answer: 'Test Answer 1',
            sectionId: 'test-section'
          },
          {
            questionId: 'test-question-2',
            answer: 'Test Answer 2',
            sectionId: 'test-section'
          }
        ],
        completed: true,
        startTime: new Date(Date.now() - 60000), // 1 minute ago
        endTime: new Date(),
        progress: 100,
        metadata: {
          userAgent: 'Test User Agent',
          isPublic: true,
          testData: true
        },
        demographics: {},
        sectionTimes: {},
        createdAt: new Date(),
        updatedAt: new Date(),
        respondentId: Random.id()
      };
      
      // Try to insert the test response
      const responseId = await SurveyResponses.insertAsync(testResponse);
      console.log('Test response inserted successfully with ID:', responseId);
      
      return {
        success: true,
        responseId,
        message: 'Test survey response created successfully'
      };
    } catch (error) {
      console.error('Error writing test data to database:', error);
      throw new Meteor.Error('db-write-error', `Error writing to database: ${error.message}`);
    }
  }
});
