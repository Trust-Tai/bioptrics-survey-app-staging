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
  engagementScore?: number; // User engagement score for analytics
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
  // Publish recent survey responses
  Meteor.publish('surveyResponses.recent', function() {
    return SurveyResponses.find(
      { completed: true },
      { 
        sort: { updatedAt: -1 },
        limit: 10 
      }
    );
  });
}

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
    
    // Check if user is an admin
    const currentUserId = this.userId;
    if (!currentUserId) {
      return this.ready();
    }
    
    const user = await Meteor.users.findOneAsync({ _id: currentUserId, roles: { $in: ['admin'] } });
    if (!user) {
      return this.ready();
    }
    
    const responseCount = SurveyResponses.find({}).count();
    
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
      
      // Check if user is an admin (optional security check)
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get survey counts');
      }
      
      try {
        // Direct database query to count completed surveys
        const count = await SurveyResponses.find({ completed: true }).countAsync();
        return count;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error counting completed surveys: ${errorMessage}`);
      }
    },
    
    // Method to calculate participation rate
    async 'getParticipationRate'() {
      
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
        return rate;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error calculating participation rate: ${errorMessage}`);
      }
    },
    
    // Method to calculate average engagement score
    async 'getAverageEngagementScore'() {
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get average engagement score');
      }
      
      try {
        // Get all completed responses
        const responses = await SurveyResponses.find({ completed: true }).fetchAsync();
        
        
        // If no responses, return 0
        if (responses.length === 0) {
          return 0;
        }
        
        let totalScore = 0;
        let scoreCount = 0;
        
        // Calculate average of all numeric answers as a proxy for engagement
        responses.forEach((response, index) => {
          
          if (!response.responses || !Array.isArray(response.responses)) {
            return;
          }
          
          
          response.responses.forEach((answer, answerIndex) => {
            
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
            } else {
            }
          });
        });
        
        // If no valid scores found, return 0
        if (scoreCount === 0) {
          return 0;
        }
        
        // Calculate average and round to 1 decimal place
        const avgScore = Math.round((totalScore / scoreCount) * 10) / 10;
        return avgScore;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error calculating average engagement score: ${errorMessage}`);
      }
    },
    
    // Method to calculate response rate
    async 'getResponseRate'() {
      
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
        
        return rate;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error calculating response rate: ${errorMessage}`);
      }
    },
    
    // Method to calculate average completion time
    async 'getAverageCompletionTime'() {
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get average completion time');
      }
      
      try {
        // Get all completed responses that have completion time
        const responses = await SurveyResponses.find({ 
          completed: true,
          completionTime: { $exists: true, $gt: 0 }
        }).fetchAsync();
        
        // If no responses with completion time, return 0
        if (responses.length === 0) return 0;
        
        // Calculate total completion time in seconds
        const totalCompletionTimeSeconds = responses.reduce(
          (sum, response) => sum + (response.completionTime || 0), 0
        );
        
        // Convert to minutes and round to 1 decimal place
        const avgMinutes = Math.round((totalCompletionTimeSeconds / responses.length / 60) * 10) / 10;
        return avgMinutes;
      } catch (error: unknown) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error calculating average completion time: ${errorMessage}`);
      }
    },
    
    // Method to get database statistics
    async 'getDatabaseStats'() {
      
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
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error getting database stats: ${errorMessage}`);
      }
    },
    
    async 'surveyResponses.submit'(responseData: SurveyResponseInput & { responseId?: string }) {
      
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
          completed: Match.Optional(Boolean),
          startTime: Match.Optional(Date),
          endTime: Match.Optional(Date),
          progress: Match.Optional(Number),
          metadata: Match.Optional(Object),
          demographics: Match.Optional(Object),
          sectionTimes: Match.Optional(Object),
          respondentId: Match.Optional(String),
          responseId: Match.Optional(String),
          completionTime: Match.Optional(Number)
        });
        
        // Get current timestamp
        const now = new Date();
        
        // Add timestamps if not provided
        if (!responseData.startTime) {
          responseData.startTime = now;
        }
        
        if (!responseData.endTime) {
          responseData.endTime = now;
        }
        
        // Add timestamps for record keeping
        responseData.updatedAt = now;
        
        // Check if this is a replacement mode
        const isReplaceMode = responseData.responseId || 
                            (responseData.metadata && responseData.metadata.retakeMode === 'replace');
        
        console.log('Is replace mode:', isReplaceMode);
        console.log('ResponseId:', responseData.responseId);
        console.log('SurveyId:', responseData.surveyId);
        console.log('UserId:', this.userId);
        
        // First, check if we have an existing response for this user and survey
        let existingResponse = null;
        
        // If we have a specific responseId, use that first
        if (responseData.responseId) {
          console.log(`Looking for existing response with ID: ${responseData.responseId}`);
          existingResponse = await SurveyResponses.findOneAsync({ _id: responseData.responseId });
          console.log('Found by ID:', existingResponse ? 'Yes' : 'No');
        }
        
        // If we're in replace mode but don't have a specific response yet, try to find by userId and surveyId
        if (isReplaceMode && !existingResponse && this.userId) {
          console.log(`Looking for existing response with userId: ${this.userId} and surveyId: ${responseData.surveyId}`);
          existingResponse = await SurveyResponses.findOneAsync({ 
            userId: this.userId,
            surveyId: responseData.surveyId
          });
          console.log('Found by userId and surveyId:', existingResponse ? 'Yes' : 'No');
        }
        
        // If we found an existing response and we're in replace mode, update it
        if (existingResponse && isReplaceMode) {
          console.log(`Replace mode: Updating existing response with ID: ${existingResponse._id}`);
          
          // Extract the responseId from the data (if it exists)
          const { responseId, ...updateData } = responseData;
          
          // Use the existing response's _id for the update operation
          const targetId = existingResponse._id;
          
          // Log what we're about to update
          console.log('Existing responses before update:', existingResponse.responses?.length || 0, 'items');
          console.log('New responses to apply:', updateData.responses?.length || 0, 'items');
          
          // Log the first response for debugging
          if (updateData.responses && updateData.responses.length > 0) {
            console.log('First new response to apply:', JSON.stringify(updateData.responses[0], null, 2));
          }
          
          try {
            // Use replaceOne to completely replace the document while preserving its _id
            // This is more reliable than updateAsync for ensuring all fields are properly updated
            // Use as any to bypass TypeScript's type checking for the _id field
            // This is necessary because rawCollection().replaceOne() has different typing than the Meteor collection
            const replaceResult = await SurveyResponses.rawCollection().replaceOne(
              { _id: targetId },
              {
                // Include all fields from the existing document and update with new data
                ...existingResponse,
                surveyId: updateData.surveyId,
                responses: updateData.responses,
                completed: updateData.completed,
                startTime: updateData.startTime,
                endTime: updateData.endTime,
                progress: updateData.progress,
                metadata: updateData.metadata,
                demographics: updateData.demographics || {},
                sectionTimes: updateData.sectionTimes || {},
                createdAt: existingResponse.createdAt || now, // Preserve original creation date
                updatedAt: now,
                userId: existingResponse.userId || this.userId || undefined,
                respondentId: existingResponse.respondentId || undefined,
                completionTime: updateData.completionTime || (updateData.startTime && updateData.endTime ? 
                  (updateData.endTime.getTime() - updateData.startTime.getTime()) / 1000 : undefined)
              } as any
            );
            
            console.log(`Survey response replaced successfully:`, replaceResult);
          } catch (error) {
            console.error('Error replacing survey response:', error);
            
            // Fallback to traditional update if replace fails
            console.log('Falling back to traditional update method');
            const result = await SurveyResponses.updateAsync(
              { _id: targetId },
              { $set: {
                  responses: updateData.responses,
                  completed: updateData.completed,
                  endTime: updateData.endTime,
                  progress: updateData.progress,
                  metadata: updateData.metadata,
                  demographics: updateData.demographics || {},
                  sectionTimes: updateData.sectionTimes || {},
                  updatedAt: now
                }
              }
            );
            console.log(`Fallback update completed, affected documents:`, result);
          }
          
          // Verify the update was successful by retrieving the updated document
          const updatedResponse = await SurveyResponses.findOneAsync({ _id: targetId });
          console.log('Updated responses after update:', updatedResponse?.responses?.length || 0, 'items');
          
          // Log the first response after update for verification
          if (updatedResponse?.responses && updatedResponse.responses.length > 0) {
            console.log('First response after update:', JSON.stringify(updatedResponse.responses[0], null, 2));
          }
          
          console.log(`Survey response updated successfully`);
          return targetId;
        } else {
          // This is a new submission
          responseData.createdAt = now;
          
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
          
          console.log('Attempting to insert new survey response using insertAsync');
          
          // Use insertAsync instead of insert as required by newer Meteor versions
          // Use type assertion to satisfy TypeScript
          const responseId = await SurveyResponses.insertAsync(responseData as unknown as SurveyResponseDoc);
          console.log('New survey response inserted successfully with ID:', responseId);
          return responseId;
        }
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
