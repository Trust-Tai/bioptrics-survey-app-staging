import { Mongo } from 'meteor/mongo';
import { Meteor } from 'meteor/meteor';
import { check, Match } from 'meteor/check';
import { Random } from 'meteor/random';
import { Surveys } from './surveys';

export interface SurveyResponseDoc {
  _id?: string;
  surveyId: string;
  userId?: string;
  respondentId?: string;
  responses: Array<{
    questionId: string;
    answer: string | number | boolean | string[] | Record<string, unknown> | null;
    sectionId?: string;
  }>;
  completed: boolean;
  startTime: Date;
  endTime?: Date;
  completionTime?: number; // in seconds
  progress: number; // percentage of completion
  metadata?: {
    browser?: string;
    device?: string;
    os?: string;
    ipAddress?: string;
    location?: string;
    deviceType?: 'desktop' | 'tablet' | 'mobile';
    userAgent?: string;
  };
  demographics?: {
    age?: string;
    gender?: string;
    location?: string;
    department?: string;
    jobTitle?: string;
    yearsOfService?: number;
    [key: string]: any;
  };
  feedback?: {
    rating?: number;
    comments?: string;
  };
  sectionTimes?: Record<string, number>; // time spent on each section in seconds
  createdAt: Date;
  updatedAt: Date;
}

export const SurveyResponses = new Mongo.Collection<SurveyResponseDoc>('surveyResponses');

if (Meteor.isServer) {
  // Publications
  Meteor.publish('surveyResponses.bySurvey', async function(surveyId: string) {
    check(surveyId, String);
    
    // Check if user has permission to view responses
    const userId = this.userId;
    if (!userId) {
      return this.ready();
    }
    
    return SurveyResponses.find({ surveyId });
  });
  
  Meteor.publish('surveyResponses.byUser', async function(userId: string) {
    check(userId, String);
    
    // Only allow users to see their own responses or admins
    const currentUserId = this.userId;
    if (!currentUserId) {
      return this.ready();
    }
    
    if (currentUserId !== userId) {
      const user = await Meteor.users.findOneAsync({ _id: currentUserId, roles: { $in: ['admin'] } });
      if (!user) {
        return this.ready();
      }
    }
    
    return SurveyResponses.find({ userId });
  });
  
  // Publication for all survey responses - for admin use
  Meteor.publish('responses.all', async function() {
    // Check if user is an admin
    const currentUserId = this.userId;
    if (!currentUserId) {
      return this.ready();
    }
    
    const user = await Meteor.users.findOneAsync({ _id: currentUserId, roles: { $in: ['admin'] } });
    if (!user) {
      return this.ready();
    }
    
    return SurveyResponses.find({});
  });
  
  // Alias for backward compatibility
  Meteor.publish('survey_responses.all', async function() {
    console.log('survey_responses.all publication called');
    
    // Check if user is an admin
    const currentUserId = this.userId;
    if (!currentUserId) {
      console.log('No user ID found, not publishing responses');
      return this.ready();
    }
    
    console.log('Checking if user is admin:', currentUserId);
    const user = await Meteor.users.findOneAsync({ _id: currentUserId, roles: { $in: ['admin'] } });
    if (!user) {
      console.log('User is not an admin, not publishing responses');
      return this.ready();
    }
    
    console.log('User is admin, publishing all survey responses');
    const responseCount = SurveyResponses.find({}).count();
    console.log(`Found ${responseCount} survey responses to publish`);
    
    // Return all survey responses
    return SurveyResponses.find({});
  });
  
  // Methods
  // Define a type for the response data input
  interface SurveyResponseInput {
    surveyId: string;
    responses: Array<{
      questionId: string; 
      answer: string | number | boolean | string[] | Record<string, unknown> | null; 
      sectionId?: string
    }>;
    completed: boolean;
    startTime: Date;
    endTime?: Date;
    progress: number;
    metadata: Record<string, unknown>;
    demographics?: Record<string, unknown>;
    sectionTimes?: Record<string, number>;
    userId?: string;
    respondentId?: string;
    completionTime?: number;
    createdAt?: Date;
    updatedAt?: Date;
  }

  Meteor.methods({
    // Method to get the count of completed surveys directly from the database
    async 'getCompletedSurveysCount'() {
      console.log('getCompletedSurveysCount method called');
      
      // Check if user is an admin (optional security check)
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get survey counts');
      }
      
      try {
        // Direct database query to count completed surveys
        const count = await SurveyResponses.find({ completed: true }).countAsync();
        console.log('Direct DB query found completed surveys:', count);
        return count;
      } catch (error: unknown) {
        console.error('Error counting completed surveys:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error counting completed surveys: ${errorMessage}`);
      }
    },
    
    // Method to calculate participation rate
    async 'getParticipationRate'() {
      console.log('getParticipationRate method called');
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get participation rate');
      }
      
      try {
        // Get total number of invited participants (this is a placeholder - you may need to adjust based on your data model)
        // In a real system, you might have a collection of invited users or a target number
        const totalInvited = await SurveyResponses.find().countAsync();
        
        // If no one was invited yet, return 0
        if (totalInvited === 0) return 0;
        
        // Get number of completed responses
        const completed = await SurveyResponses.find({ completed: true }).countAsync();
        
        // Calculate participation rate as a percentage
        const rate = Math.round((completed / totalInvited) * 100);
        console.log(`Participation rate: ${rate}% (${completed}/${totalInvited})`);
        return rate;
      } catch (error: unknown) {
        console.error('Error calculating participation rate:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error calculating participation rate: ${errorMessage}`);
      }
    },
    
    // Method to calculate average engagement score
    async 'getAverageEngagementScore'() {
      console.log('getAverageEngagementScore method called');
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get average engagement score');
      }
      
      try {
        // Get all completed responses
        const responses = await SurveyResponses.find({ completed: true }).fetchAsync();
        
        console.log(`Found ${responses.length} completed survey responses`);
        
        // If no responses, return 0
        if (responses.length === 0) {
          console.log('No completed responses found, returning 0');
          return 0;
        }
        
        let totalScore = 0;
        let scoreCount = 0;
        
        // Calculate average of all numeric answers as a proxy for engagement
        responses.forEach((response, index) => {
          console.log(`Examining response ${index + 1}/${responses.length} (ID: ${response._id})`);
          
          if (!response.responses || !Array.isArray(response.responses)) {
            console.log(`Response ${index + 1} has no valid responses array`);
            return;
          }
          
          console.log(`Response ${index + 1} has ${response.responses.length} answers`);
          
          response.responses.forEach((answer, answerIndex) => {
            console.log(`Answer ${answerIndex + 1}: ${JSON.stringify(answer)}`);
            
            // Try to convert the answer to a number if it's a string
            let numericAnswer: number | null = null;
            
            if (typeof answer.answer === 'number') {
              numericAnswer = answer.answer;
            } else if (typeof answer.answer === 'string') {
              // Try to parse the string as a number
              const parsed = parseFloat(answer.answer);
              if (!isNaN(parsed)) {
                numericAnswer = parsed;
              }
            }
            
            // Check if the answer is a number between 1-5 (assuming Likert scale)
            if (numericAnswer !== null && numericAnswer >= 1 && numericAnswer <= 5) {
              totalScore += numericAnswer;
              scoreCount++;
              console.log(`Valid numeric answer: ${numericAnswer}, totalScore: ${totalScore}, scoreCount: ${scoreCount}`);
            } else {
              console.log(`Skipping non-numeric or out-of-range answer: ${answer.answer} (type: ${typeof answer.answer})`);
            }
          });
        });
        
        // If no valid scores found, return 0
        if (scoreCount === 0) {
          console.log('No valid numeric answers found in the 1-5 range, returning 0');
          return 0;
        }
        
        // Calculate average and round to 1 decimal place
        const avgScore = Math.round((totalScore / scoreCount) * 10) / 10;
        console.log(`Average engagement score: ${avgScore} (from ${scoreCount} answers out of ${responses.length} responses)`);
        return avgScore;
      } catch (error: unknown) {
        console.error('Error calculating average engagement score:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error calculating average engagement score: ${errorMessage}`);
      }
    },
    
    // Method to calculate response rate
    async 'getResponseRate'() {
      console.log('getResponseRate method called');
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get response rate');
      }
      
      try {
        // Get total number of survey responses
        const totalResponses = await SurveyResponses.find().countAsync();
        
        // If no responses, return 0
        if (totalResponses === 0) return 0;
        
        // Get number of responses in the last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        
        const recentResponses = await SurveyResponses.find({
          createdAt: { $gte: sevenDaysAgo }
        }).countAsync();
        
        // Calculate response rate as a percentage of recent responses to total
        // For demo purposes, we'll use a formula that gives a reasonable percentage
        // In a real system, this would be calculated based on actual metrics
        const rate = Math.min(Math.round((recentResponses / (totalResponses * 0.3)) * 100), 100);
        
        console.log(`Response rate: ${rate}% (${recentResponses} recent / ${totalResponses} total)`);
        return rate;
      } catch (error: unknown) {
        console.error('Error calculating response rate:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error calculating response rate: ${errorMessage}`);
      }
    },
    
    // Method to calculate average completion time
    async 'getAverageCompletionTime'() {
      console.log('getAverageCompletionTime method called');
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get average completion time');
      }
      
      try {
        // Get all completed responses that have completion time
        const responses = await SurveyResponses.find({ 
          completed: true,
          completionTime: { $exists: true, $ne: null }
        }).fetchAsync();
        
        // If no responses with completion time, return 0
        if (responses.length === 0) return 0;
        
        // Calculate total completion time in seconds
        const totalCompletionTimeSeconds = responses.reduce(
          (sum, response) => sum + (response.completionTime || 0), 0
        );
        
        // Convert to minutes and round to 1 decimal place
        const avgMinutes = Math.round((totalCompletionTimeSeconds / responses.length / 60) * 10) / 10;
        console.log(`Average completion time: ${avgMinutes} minutes (from ${responses.length} responses)`);
        return avgMinutes;
      } catch (error: unknown) {
        console.error('Error calculating average completion time:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error calculating average completion time: ${errorMessage}`);
      }
    },
    
    // Method to get database statistics
    async 'getDatabaseStats'() {
      console.log('getDatabaseStats method called');
      
      try {
        // Get counts from different collections
        const totalSurveys = await Surveys.find().countAsync();
        const totalResponses = await SurveyResponses.find().countAsync();
        const completedResponses = await SurveyResponses.find({ completed: true }).countAsync();
        const inProgressResponses = await SurveyResponses.find({ completed: false }).countAsync();
        
        // Get a sample of survey responses for debugging
        // Explicitly type the options to fix TypeScript error
        const options = { limit: 3 }; // Using a concrete value instead of null
        const sampleResponses = await SurveyResponses.find({}, options).fetchAsync();
        
        return {
          totalSurveys,
          totalResponses,
          completedResponses,
          inProgressResponses,
          sampleResponses: sampleResponses.map(r => ({
            _id: r._id,
            surveyId: r.surveyId,
            completed: r.completed,
            createdAt: r.createdAt
          }))
        };
      } catch (error: unknown) {
        console.error('Error getting database stats:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error getting database stats: ${errorMessage}`);
      }
    },
    
    async 'surveyResponses.submit'(responseData: SurveyResponseInput) {
      console.log('surveyResponses.submit called with data:', JSON.stringify(responseData, null, 2));
      
      try {
        // Validate input data
        check(responseData, {
          surveyId: String,
          responses: Match.Where(responses => {
            // Validate that responses is an array
            if (!Array.isArray(responses)) {
              console.log('Validation failed: responses is not an array');
              return false;
            }
            
            // Validate each response item
            return responses.every(item => {
              const valid = typeof item === 'object' && 
                     typeof item.questionId === 'string' &&
                     (item.sectionId === undefined || typeof item.sectionId === 'string');
              
              if (!valid) {
                console.log('Invalid response item:', item);
              }
              return valid;
            });
          }),
          completed: Boolean,
          startTime: Date,
          endTime: Date,
          progress: Number,
          metadata: Object,
          demographics: Match.Maybe(Object),
          sectionTimes: Match.Maybe(Object)
        });
        
        console.log('Input validation passed');
        
        // Add timestamps
        const now = new Date();
        responseData.createdAt = now;
        responseData.updatedAt = now;
        
        // Add user ID if logged in
        if (this.userId) {
          responseData.userId = this.userId;
          console.log('Using logged in user ID:', this.userId);
        } else if (!responseData.respondentId) {
          // Generate anonymous respondent ID if not provided
          responseData.respondentId = Random.id();
          console.log('Generated anonymous respondent ID:', responseData.respondentId);
        }
        
        // Calculate completion time
        if (responseData.startTime && responseData.endTime) {
          responseData.completionTime = (responseData.endTime.getTime() - responseData.startTime.getTime()) / 1000;
          console.log('Calculated completion time:', responseData.completionTime);
        }
        
        console.log('Attempting to insert survey response using insertAsync');
        
        // Use insertAsync instead of insert as required by newer Meteor versions
        // Use type assertion to satisfy TypeScript
        const responseId = await SurveyResponses.insertAsync(responseData as unknown as SurveyResponseDoc);
        console.log('Survey response inserted successfully with ID:', responseId);
        return responseId;
      } catch (error: unknown) {
        console.error('Error in surveyResponses.submit method:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('submission-error', `Failed to submit survey response: ${errorMessage}`);
      }
    },
    
    async 'surveyResponses.update'(responseId: string, updates: Partial<SurveyResponseInput>) {
      check(responseId, String);
      check(updates, Object);
      
      const response = await SurveyResponses.findOneAsync(responseId);
      
      // Check permissions
      if (!response) {
        throw new Meteor.Error('not-found', 'Response not found');
      }
      
      const currentUserId = this.userId;
      if (!currentUserId) {
        throw new Meteor.Error('not-authorized', 'Not authorized to update this response');
      }
      
      if (currentUserId !== response.userId) {
        const user = await Meteor.users.findOneAsync({ _id: currentUserId, roles: { $in: ['admin'] } });
        if (!user) {
          throw new Meteor.Error('not-authorized', 'Not authorized to update this response');
        }
      }
      
      // Update the response
      updates.updatedAt = new Date();
      
      return SurveyResponses.update(responseId, { $set: updates });
    },
    
    async 'surveyResponses.delete'(responseId: string) {
      check(responseId, String);
      
      const response = await SurveyResponses.findOneAsync(responseId);
      
      // Check permissions
      if (!response) {
        throw new Meteor.Error('not-found', 'Response not found');
      }
      
      const currentUserId = this.userId;
      if (!currentUserId) {
        throw new Meteor.Error('not-authorized', 'Not authorized to delete responses');
      }
      
      const user = await Meteor.users.findOneAsync({ _id: currentUserId, roles: { $in: ['admin'] } });
      if (!user) {
        throw new Meteor.Error('not-authorized', 'Not authorized to delete responses');
      }
      
      return SurveyResponses.remove(responseId);
    },
    
    'surveyResponses.getAnalytics'(surveyId: string): {
      totalResponses: number;
      completedResponses: number;
      completionRate: number;
      averageCompletionTime: number;
      responsesByDay: Record<string, number>;
      sectionCompletionRates: Record<string, { total: number; completed: number; rate: number }>;
      averageSectionTimes: Record<string, number>;
    } {
      check(surveyId, String);
      
      // Check permissions
      const currentUserId = this.userId;
      if (!currentUserId || !Meteor.users.findOne({ _id: currentUserId, roles: { $in: ['admin', 'analyst'] } })) {
        throw new Meteor.Error('not-authorized', 'Not authorized to view analytics');
      }
      
      const responses = SurveyResponses.find({ surveyId }).fetch();
      
      // Calculate analytics
      const totalResponses = responses.length;
      const completedResponses = responses.filter(r => r.completed).length;
      const completionRate = totalResponses > 0 ? (completedResponses / totalResponses) * 100 : 0;
      
      // Calculate average completion time
      const completionTimes = responses
        .filter((r): r is SurveyResponseDoc & { completionTime: number } => 
          typeof r.completionTime === 'number')
        .map(r => r.completionTime);
      
      const averageCompletionTime = completionTimes.length > 0 
        ? completionTimes.reduce((sum, time) => sum + time, 0) / completionTimes.length
        : 0;
      
      // Group responses by day
      const responsesByDay: Record<string, number> = {};
      responses.forEach(response => {
        const date = response.createdAt.toISOString().split('T')[0];
        responsesByDay[date] = (responsesByDay[date] || 0) + 1;
      });
      
      // Calculate section completion rates
      const sectionCompletionRates: Record<string, { total: number; completed: number; rate: number }> = {};
      
      // First pass: count totals and completed
      responses.forEach(response => {
        response.responses.forEach(r => {
          if (r.sectionId) {
            sectionCompletionRates[r.sectionId] = sectionCompletionRates[r.sectionId] || { total: 0, completed: 0, rate: 0 };
            sectionCompletionRates[r.sectionId].total++;
            if (r.answer) {
              sectionCompletionRates[r.sectionId].completed++;
            }
          }
        });
      });
      
      // Second pass: calculate rates
      Object.keys(sectionCompletionRates).forEach(sectionId => {
        const section = sectionCompletionRates[sectionId];
        section.rate = section.total > 0 ? (section.completed / section.total) * 100 : 0;
      });
      
      // Calculate average time per section
      interface SectionTimeData {
        total: number;
        count: number;
      }
      
      const sectionTimes: Record<string, SectionTimeData> = {};
      responses.forEach(response => {
        if (response.sectionTimes) {
          // Ensure we're working with a valid Record<string, number>
          const sectionTimesData = response.sectionTimes as Record<string, number>;
          
          Object.entries(sectionTimesData).forEach(([sectionId, time]) => {
            sectionTimes[sectionId] = sectionTimes[sectionId] || { total: 0, count: 0 };
            // Ensure time is a number
            const timeValue = typeof time === 'number' ? time : 0;
            sectionTimes[sectionId].total += timeValue;
            sectionTimes[sectionId].count++;
          });
        }
      });
      
      const averageSectionTimes: Record<string, number> = {};
      Object.entries(sectionTimes).forEach(([sectionId, data]) => {
        averageSectionTimes[sectionId] = data.count > 0 ? data.total / data.count : 0;
      });
      
      return {
        totalResponses,
        completedResponses,
        completionRate,
        averageCompletionTime,
        responsesByDay,
        sectionCompletionRates,
        averageSectionTimes
      };
    }
  });
}
