import { Meteor } from 'meteor/meteor';
import { Surveys } from './surveys';
import { SurveyResponses } from './surveyResponses';
import { IncompleteSurveyResponses } from './incompleteSurveyResponses';
import { check } from 'meteor/check';
import { Mongo } from 'meteor/mongo';

// Interface for survey statistics
interface SurveyStats {
  totalSurveys: number;
  activeSurveys: number;
  totalResponses: number;
  avgCompletion: number;
}

// Create a publication for survey stats
if (Meteor.isServer) {
  Meteor.publish('surveys.stats', function(organizationId) {
    if (!this.userId) {
      return this.ready();
    }
    
    // This is a dummy publication that doesn't actually return documents
    // It's just used as a trigger for the client to call the method
    this.ready();
  });
}

Meteor.methods({
  /**
   * Get survey statistics for the dashboard
   * @param organizationId Optional organization ID to filter by
   * @returns Object containing survey statistics
   */
  async 'surveys.getStats'(organizationId) {
    console.log('surveys.getStats method called with organizationId:', organizationId);
    
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to access survey statistics');
    }
    
    try {
      // First, let's check what surveys exist in the database
      const allSurveysInDb = await Surveys.find({}).fetchAsync();
      console.log(`DEBUG: Total surveys in database: ${allSurveysInDb.length}`);
      if (allSurveysInDb.length > 0) {
        // Log the first survey to see its structure
        console.log('DEBUG: First survey structure:', JSON.stringify(allSurveysInDb[0], null, 2));
      }
      
      // Build a more inclusive query - start with empty query to see all surveys
      const query: any = {};
      
      // Only apply organization filter if explicitly provided
      if (organizationId) {
        query.organizationId = organizationId;
      }
      
      // Don't filter by user for now to see all surveys
      // We'll add user filtering back once we confirm surveys are visible
      
      console.log('Survey query:', JSON.stringify(query));
      
      // Get all matching surveys
      const allSurveys = await Surveys.find(query).fetchAsync();
      const totalSurveys = allSurveys.length;
      console.log(`Total surveys: ${totalSurveys}`);
      
      // Count active surveys (published and not expired)
      const now = new Date();
      let activeSurveys = 0;
      
      // Use a simple loop to count active surveys
      for (const survey of allSurveys) {
        if (survey.published) {
          // Check if survey is not expired - use any to bypass type checking
          const surveyAny = survey as any;
          const expiresAt = surveyAny.expiresAt ? new Date(surveyAny.expiresAt) : null;
          if (!expiresAt || expiresAt > now) {
            activeSurveys++;
          }
        }
      }
      console.log(`Active surveys: ${activeSurveys}`);
      
      // Get all survey IDs - filter out any undefined values
      const surveyIds = allSurveys.map(s => s._id).filter(id => id !== undefined) as string[];
      
      // Get responses for these surveys
      let totalResponses = 0;
      let completedResponses = 0;
      
      if (surveyIds.length > 0) {
        const responses = await SurveyResponses.find({
          surveyId: { $in: surveyIds }
        }).fetchAsync();
        
        totalResponses = responses.length;
        completedResponses = responses.filter(r => r.completed).length;
      }
      
      console.log(`Total responses: ${totalResponses} (${completedResponses} completed)`);
      
      // Calculate completion rate
      let avgCompletion = 0;
      if (totalResponses > 0) {
        avgCompletion = Math.round((completedResponses / totalResponses) * 100);
      }
      console.log(`Average completion rate: ${avgCompletion}%`);
      
      return {
        totalSurveys,
        activeSurveys,
        totalResponses,
        avgCompletion
      };
    } catch (error) {
      console.error('Error calculating survey statistics:', error);
      
      // Return zeros if there's an error
      return {
        totalSurveys: 0,
        activeSurveys: 0,
        totalResponses: 0,
        avgCompletion: 0
      };
    }
  }
});
