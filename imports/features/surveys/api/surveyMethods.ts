import { Meteor } from 'meteor/meteor';
import { SurveyResponses } from './surveyResponses';
import { IncompleteSurveyResponses } from './incompleteSurveyResponses';

interface ResponseTrendDataPoint {
  date: string;
  responses: number;
  completions: number;
}

if (Meteor.isServer) {
  Meteor.methods({
    // Enhanced response rate calculation that considers both completed and incomplete surveys
    async 'getEnhancedResponseRate'() {
      console.log('getEnhancedResponseRate method called');
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get response rate');
      }
      
      try {
        // Get the date for 7 days ago
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        // Count completed responses in the last 7 days
        const completedCount = await SurveyResponses.find({
          createdAt: { $gte: sevenDaysAgo },
          completed: true
        }).countAsync();
        
        // Count incomplete responses in the last 7 days
        const incompleteCount = await IncompleteSurveyResponses.find({
          startedAt: { $gte: sevenDaysAgo },
          isCompleted: false,
          isAbandoned: { $ne: true }
        }).countAsync();
        
        console.log(`Found ${completedCount} completed and ${incompleteCount} incomplete responses in the last 7 days`);
        
        // Calculate response rate
        let responseRate = 0;
        if (completedCount > 0 || incompleteCount > 0) {
          responseRate = Math.round((completedCount / (completedCount + incompleteCount)) * 100);
        }
        
        console.log(`Enhanced response rate: ${responseRate}%`);
        return responseRate;
      } catch (error: unknown) {
        console.error('Error calculating enhanced response rate:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error calculating enhanced response rate: ${errorMessage}`);
      }
    },
    
    // Get daily response and completion data for the last 7 days
    async 'getResponseTrendsData'() {
      console.log('getResponseTrendsData method called');
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get response trends data');
      }
      
      try {
        // Get the date for 6 days ago (to include today in the 7-day window)
        const now = new Date();
        // Create a date object for the start of today (midnight)
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        // Calculate 6 days ago from today
        const sixDaysAgo = new Date(today);
        sixDaysAgo.setDate(today.getDate() - 6);
        
        // Initialize result array with dates for the last 7 days including today
        const result: ResponseTrendDataPoint[] = [];
        
        // Log the current date for debugging
        console.log('Current server date:', new Date().toISOString());
        
        // Generate dates for the last 7 days including today
        for (let i = 0; i < 7; i++) {
          const date = new Date(sixDaysAgo);
          date.setDate(sixDaysAgo.getDate() + i);
          
          // Format date as YYYY-MM-DD
          const dateStr = date.toISOString().split('T')[0];
          
          // Log each date being processed
          console.log(`Processing date for index ${i}:`, dateStr);
          
          result.push({
            date: dateStr,
            responses: 0,
            completions: 0
          });
        }
        
        // Log the date range we're querying
        console.log(`Fetching responses from ${sixDaysAgo.toISOString()} to present`);
        
        // Get all completed responses in the last 7 days
        const completedResponses = await SurveyResponses.find({
          createdAt: { $gte: sixDaysAgo },
        }).fetchAsync();
        
        // Get all incomplete responses in the last 7 days
        const incompleteResponses = await IncompleteSurveyResponses.find({
          startedAt: { $gte: sixDaysAgo },
        }).fetchAsync();
        
        console.log(`Found ${completedResponses.length} completed responses:`, completedResponses.map(r => ({ 
          id: r._id, 
          createdAt: r.createdAt, 
          completed: r.completed 
        })));
        console.log(`Found ${incompleteResponses.length} incomplete responses:`, incompleteResponses.map(r => ({ 
          id: r._id, 
          startedAt: r.startedAt, 
          isCompleted: r.isCompleted 
        })));
        
        // Process completed responses from SurveyResponses collection
        completedResponses.forEach(response => {
          if (!response.createdAt) {
            console.log(`Response ${response._id} has no createdAt date, skipping`);
            return;
          }
          
          const date = new Date(response.createdAt);
          const dateStr = date.toISOString().split('T')[0];
          
          // Find matching date in result array
          const dataPoint = result.find(item => item.date === dateStr);
          if (dataPoint) {
            dataPoint.responses++;
            if (response.completed) {
              dataPoint.completions++;
            }
          } else {
            console.log(`No matching date found for ${dateStr}`);
          }
        });
        
        // Process incomplete responses from IncompleteSurveyResponses collection
        incompleteResponses.forEach(response => {
          if (!response.startedAt) {
            console.log(`Incomplete response ${response._id} has no startedAt date, skipping`);
            return;
          }
          
          const date = new Date(response.startedAt);
          const dateStr = date.toISOString().split('T')[0];
          
          // Find matching date in result array
          const dataPoint = result.find(item => item.date === dateStr);
          if (dataPoint) {
            dataPoint.responses++;
            if (response.isCompleted) {
              dataPoint.completions++;
            }
          } else {
            console.log(`No matching date found for ${dateStr}`);
          }
        });
        
        // Log the final result for debugging
        console.log('Final response trends data:', JSON.stringify(result, null, 2));
        
        console.log('Response trends data:', result);
        return result;
      } catch (error: unknown) {
        console.error('Error getting response trends data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error getting response trends data: ${errorMessage}`);
      }
    }
  });
}
