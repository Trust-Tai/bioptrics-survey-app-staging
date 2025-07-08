import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { SurveyResponses } from './surveyResponses';
import { Surveys } from './surveys';
import { IncompleteSurveyResponses } from './incompleteSurveyResponses';
import { QuestionTags } from '../../question-tags/api/questionTags';
import { Questions } from '../../questions/api/questions';

interface ResponseTrendDataPoint {
  date: string;
  responses: number;
  completions: number;
}

if (Meteor.isServer) {
  Meteor.methods({
    // Get total responses count for a survey
    'getTotalResponsesCount'(surveyId) {
      try {
        check(surveyId, String);
        console.log('Getting total responses count for survey ID:', surveyId);
        
        // Get the total count of all responses for this survey
        const totalCount = SurveyResponses.find({ surveyId: surveyId }).countAsync();
        console.log(`Found ${totalCount} total survey responses for survey ID: ${surveyId}`);
        
        return totalCount; // Return the actual count (0 if none found)
      } catch (error) {
        console.error('Error in getTotalResponsesCount method:', error);
        throw new Meteor.Error('count-error', 'Failed to get response count');
      }
    },
    
    // Get completion time for a survey
    async 'getSurveyCompletionTime'(surveyId) {
      try {
        check(surveyId, String);
        console.log('Getting completion time for survey ID:', surveyId);
        
        // Get the most recent completed response for this survey
        const mostRecent = await SurveyResponses.findOneAsync(
          { 
            surveyId: surveyId,
            completed: true 
          },
          { sort: { updatedAt: -1 } }
        );
        
        if (mostRecent && mostRecent.completionTime) {
          console.log(`Found completion time: ${mostRecent.completionTime} seconds`);
          return mostRecent.completionTime;
        }
        
        // No completion time found
        console.log('No completion time found, returning 0');
        return 0;
      } catch (error) {
        console.error('Error in getSurveyCompletionTime method:', error);
        throw new Meteor.Error('completion-time-error', 'Failed to get completion time');
      }
    },
    
    // Method to get unanswered questions count for a survey
    async 'getUnansweredQuestionsCount'(surveyId: string) {
      check(surveyId, String);
      
      console.log('Getting unanswered questions count for survey:', surveyId);
      
      try {
        // First, get the survey to determine total question count
        const survey = await Surveys.findOneAsync({ _id: surveyId });
        if (!survey) {
          console.log('Survey not found:', surveyId);
          return 0;
        }
        
        // Get all questions from the survey
        let allQuestions: any[] = [];
        
        // Check if survey has sectionQuestions
        if (survey.sectionQuestions && Array.isArray(survey.sectionQuestions)) {
          allQuestions = survey.sectionQuestions;
        } 
        // Check if survey has selectedQuestions
        else if (survey.selectedQuestions) {
          // Flatten the selectedQuestions object into an array
          Object.values(survey.selectedQuestions).forEach(sectionQuestions => {
            if (Array.isArray(sectionQuestions)) {
              allQuestions = allQuestions.concat(sectionQuestions);
            }
          });
        }
        
        const totalQuestions = allQuestions.length;
        console.log('Total questions in survey:', totalQuestions);
        
        // Get the most recent response for this survey
        const response = await SurveyResponses.findOneAsync(
          { surveyId, completed: true },
          { sort: { updatedAt: -1 } }
        );
        
        if (!response) {
          console.log('No completed response found for survey:', surveyId);
          return totalQuestions; // All questions are unanswered if no response
        }
        
        // If we have responses, count how many have valid answers
        const answeredCount = response.responses?.filter(
          resp => resp.answer !== null && resp.answer !== '' && resp.answer !== undefined
        ).length || 0;
        
        // Calculate unanswered by subtracting answered from total
        const unansweredCount = totalQuestions - answeredCount;
        
        console.log(`Survey has ${totalQuestions} questions, ${answeredCount} answered, ${unansweredCount} unanswered`);
        return unansweredCount;
      } catch (error) {
        console.error('Error getting unanswered questions count:', error);
        throw new Meteor.Error('get-unanswered-count-failed', 'Failed to get unanswered questions count');
      }
    },
    
    // Combined method to get all survey response data in a single call
    async 'getSurveyResponseData'(surveyId: string) {
      check(surveyId, String);
      
      console.log('Getting combined response data for survey:', surveyId);
      
      try {
        // Get total responses count
        const responseCount = await Meteor.call('getTotalResponsesCount', surveyId);
        
        // Get completion time
        const completionTime = await Meteor.call('getSurveyCompletionTime', surveyId);
        
        // Get unanswered questions count
        const unansweredQuestions = await Meteor.call('getUnansweredQuestionsCount', surveyId);
        
        console.log('Combined survey response data:', { responseCount, completionTime, unansweredQuestions });
        
        return {
          responseCount: responseCount || 0,
          completionTime: completionTime || 0,
          unansweredQuestions: unansweredQuestions || 0
        };
      } catch (error) {
        console.error('Error getting combined survey response data:', error);
        // Return default values instead of throwing an error
        return { 
          responseCount: 0, 
          completionTime: 0, 
          unansweredQuestions: 0 
        };
      }
    },
    
    // Filtered response rate calculation that considers both completed and incomplete surveys
    async 'getFilteredResponseRate'(filterParams?: { 
      surveyIds?: string[], 
      tagIds?: string[], 
      questionIds?: string[],
      startDate?: string,
      endDate?: string
    }) {
      console.log('getFilteredResponseRate method called with filters:', filterParams);
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get response rate');
      }
      
      try {
        // Default date range: last 30 days (consistent with other metrics)
        let startDateFilter = new Date();
        startDateFilter.setDate(startDateFilter.getDate() - 30);
        
        // Build the query with filters for completed surveys
        const completedQuery: any = { completed: true };
        
        // Apply date range filter if provided
        if (filterParams?.startDate || filterParams?.endDate) {
          completedQuery.createdAt = {};
          if (filterParams.startDate) {
            completedQuery.createdAt.$gte = new Date(filterParams.startDate);
          } else {
            completedQuery.createdAt.$gte = startDateFilter;
          }
          
          if (filterParams.endDate) {
            completedQuery.createdAt.$lte = new Date(filterParams.endDate);
          }
        } else {
          // Default date range if not provided
          completedQuery.createdAt = { $gte: startDateFilter };
        }
        
        // Apply survey ID filter if provided
        if (filterParams?.surveyIds && filterParams.surveyIds.length > 0) {
          completedQuery.surveyId = { $in: filterParams.surveyIds };
        }
        
        // Apply tag filter if provided
        if (filterParams?.tagIds && filterParams.tagIds.length > 0) {
          completedQuery.tags = { $in: filterParams.tagIds };
        }
        
        // Apply question filter if provided (this is more complex and might need adjustment)
        if (filterParams?.questionIds && filterParams.questionIds.length > 0) {
          completedQuery['responses.questionId'] = { $in: filterParams.questionIds };
        }
        
        // Build similar query for incomplete surveys
        const incompleteQuery: any = { 
          isCompleted: false,
          isAbandoned: { $ne: true }
        };
        
        // Apply date filters to incomplete surveys
        if (filterParams?.startDate || filterParams?.endDate) {
          incompleteQuery.startedAt = {};
          if (filterParams.startDate) {
            incompleteQuery.startedAt.$gte = new Date(filterParams.startDate);
          } else {
            incompleteQuery.startedAt.$gte = startDateFilter;
          }
          
          if (filterParams.endDate) {
            incompleteQuery.startedAt.$lte = new Date(filterParams.endDate);
          }
        } else {
          incompleteQuery.startedAt = { $gte: startDateFilter };
        }
        
        // Apply survey ID filter to incomplete surveys if provided
        if (filterParams?.surveyIds && filterParams.surveyIds.length > 0) {
          incompleteQuery.surveyId = { $in: filterParams.surveyIds };
        }
        
        // Count completed and incomplete surveys
        const completedCount = await SurveyResponses.find(completedQuery).countAsync();
        const incompleteCount = await IncompleteSurveyResponses.find(incompleteQuery).countAsync();
        
        console.log(`Found ${completedCount} completed and ${incompleteCount} incomplete responses with applied filters`);
        
        // Calculate response rate
        let responseRate = 0;
        if (completedCount > 0 || incompleteCount > 0) {
          responseRate = Math.round((completedCount / (completedCount + incompleteCount)) * 100);
        }
        
        console.log(`Filtered response rate: ${responseRate}%`);
        return responseRate;
      } catch (error: unknown) {
        console.error('Error calculating filtered response rate:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('calculation-failed', `Failed to calculate response rate: ${errorMessage}`);
      }
    },
    
    // Get completion time data by date for the chart
    
    async 'getCompletionTimeByDate'() {
      console.log('getCompletionTimeByDate method called');
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get completion time data');
      }
      
      try {
        // Get the date 30 days ago
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        thirtyDaysAgo.setHours(0, 0, 0, 0);
        
        // Get completed surveys in the last 30 days with both startTime and endTime timestamps
        const completedSurveys = await SurveyResponses.find({
          completed: true,
          endTime: { $gte: thirtyDaysAgo },
          startTime: { $exists: true }
        }).fetchAsync();
        
        console.log(`Found ${completedSurveys.length} completed surveys with timing data in the last 30 days`);
        
        // Group by date and calculate average completion time in minutes
        const completionTimeByDate: Record<string, { totalMinutes: number; count: number }> = {};
        
        // Process completed surveys
        completedSurveys.forEach(survey => {
          if (survey.startTime && survey.endTime) {
            // Get the date string from the start time
            const dateStr = new Date(survey.startTime).toISOString().split('T')[0];
            
            // Calculate completion time in minutes
            const startTime = new Date(survey.startTime).getTime();
            const endTime = new Date(survey.endTime).getTime();
            const completionTimeMinutes = (endTime - startTime) / (1000 * 60);
            
            // Filter out unreasonable completion times (negative or > 2 hours)
            if (completionTimeMinutes > 0 && completionTimeMinutes < 120) {
              if (!completionTimeByDate[dateStr]) {
                completionTimeByDate[dateStr] = { totalMinutes: 0, count: 0 };
              }
              completionTimeByDate[dateStr].totalMinutes += completionTimeMinutes;
              completionTimeByDate[dateStr].count += 1;
            }
          }
        });
        
        // Also check incomplete responses that have been marked as completed
        const completedIncompleteResponses = await IncompleteSurveyResponses.find({
          isCompleted: true,
          lastUpdatedAt: { $gte: thirtyDaysAgo },
          startedAt: { $exists: true }
        }).fetchAsync();
        
        console.log(`Found ${completedIncompleteResponses.length} completed incomplete responses with timing data`);
        
        // Process completed incomplete responses
        completedIncompleteResponses.forEach(survey => {
          if (survey.startedAt && survey.lastUpdatedAt) {
            // Get the date string from the start time
            const dateStr = survey.startedAt.toISOString().split('T')[0];
            
            // Calculate completion time in minutes
            const completionTimeMinutes = (survey.lastUpdatedAt.getTime() - survey.startedAt.getTime()) / (1000 * 60);
            
            // Filter out unreasonable completion times (negative or > 2 hours)
            if (completionTimeMinutes > 0 && completionTimeMinutes < 120) {
              if (!completionTimeByDate[dateStr]) {
                completionTimeByDate[dateStr] = { totalMinutes: 0, count: 0 };
              }
              completionTimeByDate[dateStr].totalMinutes += completionTimeMinutes;
              completionTimeByDate[dateStr].count += 1;
            }
          }
        });
        
        // Convert to array and calculate average completion time
        const result = Object.keys(completionTimeByDate).map(date => {
          const { totalMinutes, count } = completionTimeByDate[date];
          const averageMinutes = count > 0 ? totalMinutes / count : 0;
          
          return {
            date,
            minutes: parseFloat(averageMinutes.toFixed(1)) // Round to 1 decimal place
          };
        });
        
        // Sort by date
        result.sort((a, b) => a.date.localeCompare(b.date));
        
        console.log('Completion time data:', result);
        return result;
      } catch (error: unknown) {
        console.error('Error calculating completion time data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error calculating completion time data: ${errorMessage}`);
      }
    },
    
    // Note: getCompletedSurveysCount and getAverageEngagementScore methods are already defined in surveyResponses.ts
    
    // Get surveys count with optional filters
    async 'getFilteredSurveysCount'(filterParams?: { 
      surveyIds?: string[], 
      tagIds?: string[], 
      questionIds?: string[],
      startDate?: string,
      endDate?: string,
      includeIncomplete?: boolean
    }) {
      console.log('getFilteredSurveysCount method called with filters:', filterParams);
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get surveys count');
      }
      
      try {
        // Default date range: last 30 days
        let startDateFilter = new Date();
        startDateFilter.setDate(startDateFilter.getDate() - 30);
        
        // Build the query with filters for completed surveys
        const completedQuery: any = { completed: true };
        
        // Apply date range filter if provided
        if (filterParams?.startDate || filterParams?.endDate) {
          completedQuery.createdAt = {};
          if (filterParams.startDate) {
            completedQuery.createdAt.$gte = new Date(filterParams.startDate);
          } else {
            completedQuery.createdAt.$gte = startDateFilter;
          }
          
          if (filterParams.endDate) {
            completedQuery.createdAt.$lte = new Date(filterParams.endDate);
          }
        } else {
          // Default date range if not provided
          completedQuery.createdAt = { $gte: startDateFilter };
        }
        
        // Apply survey ID filter if provided
        if (filterParams?.surveyIds && filterParams.surveyIds.length > 0) {
          completedQuery.surveyId = { $in: filterParams.surveyIds };
        }
        
        // Apply tag filter if provided
        if (filterParams?.tagIds && filterParams.tagIds.length > 0) {
          completedQuery.tags = { $in: filterParams.tagIds };
        }
        
        // Apply question filter if provided
        if (filterParams?.questionIds && filterParams.questionIds.length > 0) {
          completedQuery['responses.questionId'] = { $in: filterParams.questionIds };
        }
        
        // Count completed surveys
        const completedCount = await SurveyResponses.find(completedQuery).countAsync();
        
        // If we don't need to include incomplete surveys, return just the completed count
        if (!filterParams?.includeIncomplete) {
          console.log(`Filtered completed surveys count: ${completedCount}`);
          return completedCount;
        }
        
        // Build similar query for incomplete surveys
        const incompleteQuery: any = { 
          isCompleted: false,
          isAbandoned: { $exists: false }
        };
        
        // Apply date filters to incomplete surveys
        if (filterParams?.startDate || filterParams?.endDate) {
          incompleteQuery.startedAt = {};
          if (filterParams.startDate) {
            incompleteQuery.startedAt.$gte = new Date(filterParams.startDate);
          } else {
            incompleteQuery.startedAt.$gte = startDateFilter;
          }
          
          if (filterParams.endDate) {
            incompleteQuery.startedAt.$lte = new Date(filterParams.endDate);
          }
        } else {
          incompleteQuery.startedAt = { $gte: startDateFilter };
        }
        
        // Apply survey ID filter to incomplete surveys if provided
        if (filterParams?.surveyIds && filterParams.surveyIds.length > 0) {
          incompleteQuery.surveyId = { $in: filterParams.surveyIds };
        }
        
        // Count incomplete surveys
        const incompleteCount = await IncompleteSurveyResponses.find(incompleteQuery).countAsync();
        
        // Calculate total surveys
        const totalCount = completedCount + incompleteCount;
        
        console.log(`Filtered surveys count: ${totalCount} (${completedCount} completed + ${incompleteCount} incomplete)`);
        
        return totalCount;
      } catch (error) {
        console.error('Error calculating filtered surveys count:', error);
        return 0;
      }
    },
    
    // Get question completion rate (answered questions vs total questions)
    async 'getQuestionCompletionRate'(filterParams: any = {}) {
      console.log('getQuestionCompletionRate method called with filters:', JSON.stringify(filterParams));
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get completion rate');
      }
      
      try {
        // Apply date range filter with default of last 30 days if not specified
        const endDate = filterParams.endDate ? new Date(filterParams.endDate) : new Date();
        const startDate = filterParams.startDate ? new Date(filterParams.startDate) : new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        // Build the query for completed surveys
        const query: any = {
          completed: true,
          createdAt: { $gte: startDate, $lte: endDate }
        };
        
        // Apply survey ID filter if provided
        if (filterParams.surveyIds && filterParams.surveyIds.length > 0) {
          query.surveyId = { $in: filterParams.surveyIds };
        }
        
        // Apply tag filter if provided
        if (filterParams.tagIds && filterParams.tagIds.length > 0) {
          // Get surveys with the specified tags
          const surveysWithTags = await Surveys.find({
            'tags.tagId': { $in: filterParams.tagIds }
          }).fetchAsync();
          
          const surveyIdsWithTags = surveysWithTags.map(survey => survey._id);
          
          // Add to the query - if survey IDs are already filtered, use the intersection
          if (query.surveyId) {
            const existingIds = query.surveyId.$in;
            query.surveyId.$in = existingIds.filter((id: string) => surveyIdsWithTags.includes(id));
          } else {
            query.surveyId = { $in: surveyIdsWithTags };
          }
        }
        
        // Apply question filter if provided
        if (filterParams.questionIds && filterParams.questionIds.length > 0) {
          // We need to find responses that contain these questions
          query['responses.questionId'] = { $in: filterParams.questionIds };
        }
        
        console.log('Final query for completion rate:', JSON.stringify(query));
        
        // Get all completed survey responses that match the filters
        const completedResponses = await SurveyResponses.find(query).fetchAsync();
        console.log(`Found ${completedResponses.length} completed responses for completion rate calculation`);
        
        if (completedResponses.length === 0) {
          return 0; // No responses, so completion rate is 0%
        }
        
        let totalQuestions = 0;
        let answeredQuestions = 0;
        
        // Count total questions and answered questions across all responses
        completedResponses.forEach(response => {
          if (response.responses && Array.isArray(response.responses)) {
            // If we're filtering by specific questions, only count those
            const relevantResponses = filterParams.questionIds && filterParams.questionIds.length > 0
              ? response.responses.filter(r => filterParams.questionIds.includes(r.questionId))
              : response.responses;
            
            totalQuestions += relevantResponses.length;
            
            // Count questions with non-empty answers
            answeredQuestions += relevantResponses.filter(r => {
              const answer = r.answer;
              return answer !== undefined && answer !== null && answer !== '' && 
                    !(Array.isArray(answer) && answer.length === 0);
            }).length;
          }
        });
        
        console.log(`Completion rate calculation: ${answeredQuestions} answered questions out of ${totalQuestions} total questions`);
        
        // Calculate completion rate as percentage
        const completionRate = totalQuestions > 0 ? Math.round((answeredQuestions / totalQuestions) * 100) : 0;
        
        console.log(`Final completion rate: ${completionRate}%`);
        return completionRate;
      } catch (error: unknown) {
        console.error('Error calculating question completion rate:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error calculating question completion rate: ${errorMessage}`);
      }
    },
    
    async 'getFilteredCompletionRate'(filterParams?: { 
      surveyIds?: string[], 
      tagIds?: string[], 
      questionIds?: string[],
      startDate?: string,
      endDate?: string
    }) {
      console.log('getFilteredCompletionRate method called with filters:', filterParams);
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get completion rate');
      }
      
      try {
        // Default date range: last 30 days
        let startDateFilter = new Date();
        startDateFilter.setDate(startDateFilter.getDate() - 30);
        
        // Build the query with filters for completed surveys
        const completedQuery: any = { completed: true };
        
        // Apply date range filter if provided
        if (filterParams?.startDate || filterParams?.endDate) {
          completedQuery.createdAt = {};
          if (filterParams.startDate) {
            completedQuery.createdAt.$gte = new Date(filterParams.startDate);
          } else {
            completedQuery.createdAt.$gte = startDateFilter;
          }
          
          if (filterParams.endDate) {
            completedQuery.createdAt.$lte = new Date(filterParams.endDate);
          }
        } else {
          // Default date range if not provided
          completedQuery.createdAt = { $gte: startDateFilter };
        }
        
        // Apply survey ID filter if provided
        if (filterParams?.surveyIds && filterParams.surveyIds.length > 0) {
          completedQuery.surveyId = { $in: filterParams.surveyIds };
        }
        
        // Apply tag filter if provided
        if (filterParams?.tagIds && filterParams.tagIds.length > 0) {
          completedQuery.tags = { $in: filterParams.tagIds };
        }
        
        // Apply question filter if provided
        if (filterParams?.questionIds && filterParams.questionIds.length > 0) {
          completedQuery['responses.questionId'] = { $in: filterParams.questionIds };
        }
        
        // Build similar query for incomplete surveys
        const incompleteQuery: any = { 
          isCompleted: false,
          isAbandoned: { $exists: false }
        };
        
        // Apply date filters to incomplete surveys
        if (filterParams?.startDate || filterParams?.endDate) {
          incompleteQuery.startedAt = {};
          if (filterParams.startDate) {
            incompleteQuery.startedAt.$gte = new Date(filterParams.startDate);
          } else {
            incompleteQuery.startedAt.$gte = startDateFilter;
          }
          
          if (filterParams.endDate) {
            incompleteQuery.startedAt.$lte = new Date(filterParams.endDate);
          }
        } else {
          incompleteQuery.startedAt = { $gte: startDateFilter };
        }
        
        // Apply survey ID filter to incomplete surveys if provided
        if (filterParams?.surveyIds && filterParams.surveyIds.length > 0) {
          incompleteQuery.surveyId = { $in: filterParams.surveyIds };
        }
        
        // Count completed and incomplete surveys
        const completedCount = await SurveyResponses.find(completedQuery).countAsync();
        const incompleteCount = await IncompleteSurveyResponses.find(incompleteQuery).countAsync();
        
        // Calculate total responses
        const totalResponses = completedCount + incompleteCount;
        
        // Calculate completion rate as the percentage of completed surveys out of all surveys
        const completionRate = totalResponses > 0 ? Math.round((completedCount / totalResponses) * 100) : 0;
        
        console.log(`Filtered completion rate: ${completionRate}% (${completedCount} completed / ${totalResponses} total)`);
        
        return completionRate;
      } catch (error) {
        console.error('Error calculating filtered completion rate:', error);
        return 0;
      }
    },
    
    async 'getFilteredParticipationRate'(filterParams?: { 
      surveyIds?: string[], 
      tagIds?: string[], 
      questionIds?: string[],
      startDate?: string,
      endDate?: string
    }) {
      console.log('getFilteredParticipationRate method called with filters:', filterParams);
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get participation rate');
      }
      
      try {
        // Default date range: last 30 days
        let startDateFilter = new Date();
        startDateFilter.setDate(startDateFilter.getDate() - 30);
        
        // Build the query with filters for completed surveys
        const completedQuery: any = { completed: true };
        
        // Apply date range filter if provided
        if (filterParams?.startDate || filterParams?.endDate) {
          completedQuery.createdAt = {};
          if (filterParams.startDate) {
            completedQuery.createdAt.$gte = new Date(filterParams.startDate);
          } else {
            completedQuery.createdAt.$gte = startDateFilter;
          }
          
          if (filterParams.endDate) {
            completedQuery.createdAt.$lte = new Date(filterParams.endDate);
          }
        } else {
          // Default date range if not provided
          completedQuery.createdAt = { $gte: startDateFilter };
        }
        
        // Apply survey ID filter if provided
        if (filterParams?.surveyIds && filterParams.surveyIds.length > 0) {
          completedQuery.surveyId = { $in: filterParams.surveyIds };
        }
        
        // Apply tag filter if provided
        if (filterParams?.tagIds && filterParams.tagIds.length > 0) {
          completedQuery.tags = { $in: filterParams.tagIds };
        }
        
        // Apply question filter if provided (this is more complex and might need adjustment)
        if (filterParams?.questionIds && filterParams.questionIds.length > 0) {
          completedQuery['responses.questionId'] = { $in: filterParams.questionIds };
        }
        
        // Build similar query for incomplete surveys
        const incompleteQuery: any = { 
          isCompleted: false,
          isAbandoned: { $exists: false }
        };
        
        // Apply date filters to incomplete surveys
        if (filterParams?.startDate || filterParams?.endDate) {
          incompleteQuery.createdAt = {};
          if (filterParams.startDate) {
            incompleteQuery.createdAt.$gte = new Date(filterParams.startDate);
          } else {
            incompleteQuery.createdAt.$gte = startDateFilter;
          }
          
          if (filterParams.endDate) {
            incompleteQuery.createdAt.$lte = new Date(filterParams.endDate);
          }
        } else {
          incompleteQuery.createdAt = { $gte: startDateFilter };
        }
        
        // Apply survey ID filter to incomplete surveys if provided
        if (filterParams?.surveyIds && filterParams.surveyIds.length > 0) {
          incompleteQuery.surveyId = { $in: filterParams.surveyIds };
        }
        
        // Count completed and incomplete surveys
        const completedCount = await SurveyResponses.find(completedQuery).countAsync();
        const incompleteCount = await IncompleteSurveyResponses.find(incompleteQuery).countAsync();
        
        // Calculate total responses
        const totalResponses = completedCount + incompleteCount;
        
        // Calculate participation rate - currently fixed at 100% since we're using responses/responses
        // This can be enhanced in the future with proper invitation tracking
        const participationRate = totalResponses > 0 ? 100 : 0;
        
        console.log(`Filtered participation rate: ${participationRate}% (${completedCount} completed + ${incompleteCount} incomplete / ${totalResponses} total)`);
        
        return participationRate;
      } catch (error) {
        console.error('Error calculating filtered participation rate:', error);
        return 0;
      }
    },
    
    async 'getFilteredSurveysCount'(filterParams?: { 
      surveyIds?: string[], 
      tagIds?: string[], 
      questionIds?: string[],
      startDate?: string,
      endDate?: string
    }) {
      console.log('getFilteredSurveysCount method called with filters:', filterParams);
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get survey counts');
      }
      
      try {
        // Default date range: last 30 days
        let startDateFilter = new Date();
        startDateFilter.setDate(startDateFilter.getDate() - 30);
        
        // Build the query with filters
        const query: any = { completed: true };
        
        // Apply date range filter if provided
        if (filterParams?.startDate || filterParams?.endDate) {
          query.createdAt = {};
          if (filterParams.startDate) {
            query.createdAt.$gte = new Date(filterParams.startDate);
          } else {
            query.createdAt.$gte = startDateFilter;
          }
          
          if (filterParams.endDate) {
            query.createdAt.$lte = new Date(filterParams.endDate);
          }
        } else {
          // Default date range if not provided
          query.createdAt = { $gte: startDateFilter };
        }
        
        // Apply survey ID filter if provided
        if (filterParams?.surveyIds && filterParams.surveyIds.length > 0) {
          query.surveyId = { $in: filterParams.surveyIds };
        }
        
        // Apply tag filter if provided
        if (filterParams?.tagIds && filterParams.tagIds.length > 0) {
          query.tags = { $in: filterParams.tagIds };
        }
        
        // Apply question filter if provided (this is more complex and might need adjustment)
        if (filterParams?.questionIds && filterParams.questionIds.length > 0) {
          query['responses.questionId'] = { $in: filterParams.questionIds };
        }
        
        // Build similar query for incomplete surveys
        const incompleteQuery: any = { 
          isCompleted: false,
          isAbandoned: { $exists: false }
        };
        
        // Apply date filters to incomplete surveys
        if (filterParams?.startDate || filterParams?.endDate) {
          incompleteQuery.startedAt = {};
          if (filterParams.startDate) {
            incompleteQuery.startedAt.$gte = new Date(filterParams.startDate);
          } else {
            incompleteQuery.startedAt.$gte = startDateFilter;
          }
          
          if (filterParams.endDate) {
            incompleteQuery.startedAt.$lte = new Date(filterParams.endDate);
          }
        } else {
          incompleteQuery.startedAt = { $gte: startDateFilter };
        }
        
        // Apply survey ID filter to incomplete surveys if provided
        if (filterParams?.surveyIds && filterParams.surveyIds.length > 0) {
          incompleteQuery.surveyId = { $in: filterParams.surveyIds };
        }
        
        // Count both completed and incomplete surveys
        const completedCount = await SurveyResponses.find(query).countAsync();
        const incompleteCount = await IncompleteSurveyResponses.find(incompleteQuery).countAsync();
        
        // Calculate total count
        const totalCount = completedCount + incompleteCount;
        
        console.log(`Filtered surveys count: ${completedCount} completed + ${incompleteCount} incomplete = ${totalCount} total`);
        return totalCount;
      } catch (error) {
        console.error('Error getting filtered survey count:', error);
        return 0;
      }
    },
    
    // Get dynamic engagement score based on multiple factors
    async 'getFilteredEngagementScore'(filterParams?: { 
      surveyIds?: string[], 
      tagIds?: string[], 
      questionIds?: string[],
      startDate?: string,
      endDate?: string
    }) {
      console.log('getFilteredEngagementScore method called with filters:', JSON.stringify(filterParams));
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get engagement score');
      }
      
      try {
        // Apply date range filter with default of last 30 days if not specified
        const endDate = filterParams?.endDate ? new Date(filterParams.endDate) : new Date();
        const startDate = filterParams?.startDate ? new Date(filterParams.startDate) : new Date(endDate.getTime() - (30 * 24 * 60 * 60 * 1000));
        
        // Build the query for completed surveys
        const query: any = {
          completed: true,
          createdAt: { $gte: startDate, $lte: endDate }
        };
        
        // Apply survey ID filter if provided
        if (filterParams?.surveyIds && filterParams.surveyIds.length > 0) {
          query.surveyId = { $in: filterParams.surveyIds };
        }
        
        // Apply tag filter if provided
        if (filterParams?.tagIds && filterParams.tagIds.length > 0) {
          // Get surveys with the specified tags
          const surveysWithTags = await Surveys.find({
            'tags.tagId': { $in: filterParams.tagIds }
          }).fetchAsync();
          
          const surveyIdsWithTags = surveysWithTags.map(survey => survey._id);
          
          // Add to the query - if survey IDs are already filtered, use the intersection
          if (query.surveyId) {
            const existingIds = query.surveyId.$in;
            query.surveyId.$in = existingIds.filter((id: string) => surveyIdsWithTags.includes(id));
          } else {
            query.surveyId = { $in: surveyIdsWithTags };
          }
        }
        
        // Apply question filter if provided
        if (filterParams?.questionIds && filterParams.questionIds.length > 0) {
          // We need to find responses that contain these questions
          query['responses.questionId'] = { $in: filterParams.questionIds };
        }
        
        console.log('Final query for engagement score:', JSON.stringify(query));
        
        // Get all completed survey responses that match the filters
        const completedResponses = await SurveyResponses.find(query).fetchAsync();
        console.log(`Found ${completedResponses.length} completed responses for engagement score calculation`);
        
        if (completedResponses.length === 0) {
          return 0; // No responses, so engagement score is 0
        }
        
        // Calculate engagement score based on multiple factors
        let totalEngagementScore = 0;
        
        for (const response of completedResponses) {
          // Initialize factors for this response
          let questionCompletionFactor = 0;
          let timeEngagementFactor = 0;
          let responseQualityFactor = 0;
          
          // 1. Question Completion Factor (40%)
          if (response.responses && Array.isArray(response.responses)) {
            // If we're filtering by specific questions, only count those
            const relevantResponses = filterParams?.questionIds && filterParams.questionIds.length > 0
              ? response.responses.filter(r => filterParams.questionIds.includes(r.questionId))
              : response.responses;
            
            const totalQuestions = relevantResponses.length;
            
            // Count questions with non-empty answers
            const answeredQuestions = relevantResponses.filter(r => {
              const answer = r.answer;
              return answer !== undefined && answer !== null && answer !== '' && 
                    !(Array.isArray(answer) && answer.length === 0);
            }).length;
            
            questionCompletionFactor = totalQuestions > 0 ? (answeredQuestions / totalQuestions) * 2 : 0;
          }
          
          // 2. Time Engagement Factor (30%)
          // Higher score for responses that took reasonable time (not too quick, not too slow)
          if (response.completionTime) {
            // Convert seconds to minutes for easier calculation
            const completionTimeMinutes = response.completionTime / 60;
            
            // Ideal time range: 2-10 minutes (adjust based on your survey complexity)
            if (completionTimeMinutes < 0.5) {
              // Too quick, likely not engaged
              timeEngagementFactor = 0.5;
            } else if (completionTimeMinutes < 2) {
              // Quick but possibly valid
              timeEngagementFactor = 1.0;
            } else if (completionTimeMinutes <= 10) {
              // Ideal range - fully engaged
              timeEngagementFactor = 1.5;
            } else {
              // Took too long, might indicate distractions
              timeEngagementFactor = 1.0;
            }
          } else {
            // No completion time data
            timeEngagementFactor = 0.75; // Default to medium engagement
          }
          
          // 3. Response Quality Factor (30%)
          // Analyze text responses for length and detail
          if (response.responses && Array.isArray(response.responses)) {
            let textResponseQuality = 0;
            let textResponseCount = 0;
            
            // Analyze text responses
            response.responses.forEach(r => {
              if (r.answer && typeof r.answer === 'string' && r.answer.trim() !== '') {
                const wordCount = r.answer.split(/\s+/).length;
                
                // Score based on word count
                if (wordCount >= 20) {
                  textResponseQuality += 1.5; // Detailed response
                } else if (wordCount >= 10) {
                  textResponseQuality += 1.0; // Average response
                } else if (wordCount >= 3) {
                  textResponseQuality += 0.5; // Brief response
                } else {
                  textResponseQuality += 0.25; // Very brief response
                }
                
                textResponseCount++;
              }
            });
            
            // Calculate average quality for text responses
            responseQualityFactor = textResponseCount > 0 ? 
              (textResponseQuality / textResponseCount) : 1.0;
          } else {
            responseQualityFactor = 1.0; // Default quality
          }
          
          // Calculate weighted engagement score for this response (out of 5)
          const responseEngagement = (
            (questionCompletionFactor * 0.4) + 
            (timeEngagementFactor * 0.3) + 
            (responseQualityFactor * 0.3)
          ) * 2.5; // Scale to 0-5 range
          
          totalEngagementScore += responseEngagement;
        }
        
        // Calculate average engagement score across all responses
        const averageEngagementScore = completedResponses.length > 0 ? 
          totalEngagementScore / completedResponses.length : 0;
        
        // Round to one decimal place
        const roundedScore = Math.round(averageEngagementScore * 10) / 10;
        
        console.log(`Final engagement score: ${roundedScore} (out of 5.0)`);
        return roundedScore;
      } catch (error: unknown) {
        console.error('Error calculating engagement score:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error calculating engagement score: ${errorMessage}`);
      }
    },
    
    // Get filtered completion time with optional filters
    async 'getFilteredCompletionTime'(filterParams?: { 
      surveyIds?: string[], 
      tagIds?: string[], 
      questionIds?: string[],
      startDate?: string,
      endDate?: string
    }) {
      console.log('getFilteredCompletionTime method called with filters:', filterParams);
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get completion time');
      }
      
      try {
        // Default date range: last 30 days
        let startDateFilter = new Date();
        startDateFilter.setDate(startDateFilter.getDate() - 30);
        
        let endDateFilter = new Date();
        
        // Use provided date range if available
        if (filterParams?.startDate) {
          startDateFilter = new Date(filterParams.startDate);
        }
        
        if (filterParams?.endDate) {
          endDateFilter = new Date(filterParams.endDate);
        }
        
        // Build query for completed responses
        const query: any = {
          createdAt: { $gte: startDateFilter, $lte: endDateFilter },
          completed: true,
          completionTime: { $exists: true, $ne: null }
        };
        
        // Add survey filter if provided
        if (filterParams?.surveyIds && filterParams.surveyIds.length > 0) {
          query.surveyId = { $in: filterParams.surveyIds };
          console.log('Filtering completion time by surveyIds:', filterParams.surveyIds);
        }
        
        // Find all completed responses with filters
        const responses = await SurveyResponses.find(query).fetchAsync();
        
        if (responses.length === 0) {
          return 0;
        }
        
        // Calculate average completion time in minutes
        let totalCompletionTime = 0;
        let validResponseCount = 0;
        
        responses.forEach(response => {
          if (response.completionTime && response.completionTime > 0) {
            totalCompletionTime += response.completionTime;
            validResponseCount++;
          }
        });
        
        if (validResponseCount === 0) {
          return 0;
        }
        
        // Calculate average completion time in seconds first
        const avgCompletionTimeSeconds = totalCompletionTime / validResponseCount;
        
        // Convert to minutes with 1 decimal place precision
        const avgCompletionTimeMinutes = parseFloat((avgCompletionTimeSeconds / 60).toFixed(1));
        
        console.log(`Enhanced average completion time with filters: ${avgCompletionTimeSeconds.toFixed(1)} seconds (${avgCompletionTimeMinutes} minutes)`);
        
        return avgCompletionTimeMinutes;
      } catch (error: unknown) {
        console.error('Error calculating enhanced completion time:', error);
      }
    },
    
    // Get enhanced completion time with optional filters
    async 'getResponseTrendsData'(filterParams?: { 
      surveyIds?: string[], 
      tagIds?: string[], 
      questionIds?: string[],
      startDate?: string,
      endDate?: string
    }) {
      console.log('getResponseTrendsData method called with filters:', filterParams);
      
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
        
        // Build query for completed responses
        const completedQuery: any = {
          createdAt: { $gte: sixDaysAgo },
        };
        
        // Build query for incomplete responses
        const incompleteQuery: any = {
          startedAt: { $gte: sixDaysAgo },
        };
        
        // Add survey filter if provided
        if (filterParams?.surveyIds && filterParams.surveyIds.length > 0) {
          completedQuery.surveyId = { $in: filterParams.surveyIds };
          incompleteQuery.surveyId = { $in: filterParams.surveyIds };
          console.log('Filtering response trends by surveyIds:', filterParams.surveyIds);
        }
        
        // Get all completed responses with filters
        const completedResponses = await SurveyResponses.find(completedQuery).fetchAsync();
        
        // Get all incomplete responses with filters
        const incompleteResponses = await IncompleteSurveyResponses.find(incompleteQuery).fetchAsync();
        
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
    },
    
    // Get the most frequently used tags
    async 'getUniqueParticipantCount'() {
      console.log('getUniqueParticipantCount method called');
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get participant count');
      }
      
      try {
        // Get total count of survey responses
        const totalCount = await SurveyResponses.find({}).countAsync();
        console.log(`Found ${totalCount} total survey responses`);
        return totalCount;
      } catch (error: unknown) {
        console.error('Error calculating total survey responses count:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error calculating total survey responses count: ${errorMessage}`);
      }
    },
    
    async 'getSurveyMetadata'(surveyId: string) {
      console.log(`getSurveyMetadata method called for survey ${surveyId}`);
      
      try {
        // Find the survey
        const survey = await Surveys.findOneAsync({ _id: surveyId });
        if (!survey) {
          throw new Meteor.Error('not-found', 'Survey not found');
        }
        
        // Count unique questions in the survey (avoid counting duplicates)
        const uniqueQuestionIds = new Set(Object.keys(survey.selectedQuestions || {}));
        const questionCount = uniqueQuestionIds.size + (survey.siteTextQuestions?.length || 0);
        
        // Get categories as sections
        let sections: Array<{title: string; description: string; questionCount?: number}> = [];
        if (survey.selectedCategories && survey.selectedCategories.length > 0) {
          // Get questions by category
          const questionsByCategory: Record<string, Array<any>> = {};
          
          // Group selected questions by category
          if (survey.selectedQuestions) {
            for (const questionId of Object.keys(survey.selectedQuestions)) {
              const question = await Questions.findOneAsync({ _id: questionId });
              if (question && question.versions && question.versions.length > 0) {
                // Get the current version of the question
                const currentVersion = question.versions.find(v => v.version === question.currentVersion) || question.versions[0];
                
                if (currentVersion && currentVersion.category) {
                  const category = currentVersion.category;
                  if (!questionsByCategory[category]) {
                    questionsByCategory[category] = [];
                  }
                  questionsByCategory[category].push(question);
                }
              }
            }
          }
          
          // Create sections from categories
          sections = Object.keys(questionsByCategory).map(category => ({
            title: category,
            description: `${questionsByCategory[category].length} questions about ${category.toLowerCase()}`,
            questionCount: questionsByCategory[category].length
          }));
        } else {
          // Default section if no categories
          sections = [{
            title: 'Survey Questions',
            description: `${questionCount} questions to gather your feedback`,
            questionCount
          }];
        }
        
        // Calculate estimated time based on question count with a more accurate formula
        // For very short surveys, use a fixed range that makes sense
        if (questionCount <= 2) {
          return {
            questionCount,
            sectionCount: sections.length,
            sections,
            estimatedTime: "1-2" // Fixed range for very short surveys
          };
        }
        
        // Base time: 1 minute + 30 seconds per question
        const baseMinutes = Math.max(1, Math.round(1 + (questionCount * 0.5)));
        
        // For surveys with many questions, the per-question time tends to decrease
        // as respondents get into a rhythm
        let estimatedMinutes;
        if (questionCount <= 5) {
          estimatedMinutes = baseMinutes;
        } else if (questionCount <= 15) {
          estimatedMinutes = Math.round(baseMinutes * 0.9); // 10% efficiency for medium surveys
        } else {
          estimatedMinutes = Math.round(baseMinutes * 0.8); // 20% efficiency for longer surveys
        }
        
        // Ensure the range is always at least 2 minutes difference
        const upperBound = Math.max(estimatedMinutes + 2, estimatedMinutes + Math.ceil(questionCount / 10));
        const estimatedTimeRange = `${estimatedMinutes}-${upperBound}`;
        
        return {
          questionCount,
          sectionCount: sections.length,
          sections,
          estimatedTime: estimatedTimeRange
        };
      } catch (error: unknown) {
        console.error('Error getting survey metadata:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error getting survey metadata: ${errorMessage}`);
      }
    },
    
    async 'getSectionMetadata'(surveyId: string, sectionId: string) {
      console.log(`getSectionMetadata method called for section ${sectionId} of survey ${surveyId}`);
      
      try {
        // Find the survey
        const survey = await Surveys.findOneAsync({ _id: surveyId });
        if (!survey) {
          throw new Meteor.Error('not-found', 'Survey not found');
        }
        
        // Get all questions for this survey
        const allQuestions: Array<any> = [];
        let sectionTitle = '';
        
        if (survey.selectedQuestions) {
          for (const questionId of Object.keys(survey.selectedQuestions)) {
            const question = await Questions.findOneAsync({ _id: questionId });
            if (question && question.versions && question.versions.length > 0) {
              // Get the current version of the question
              const currentVersion = question.versions.find(v => v.version === question.currentVersion) || question.versions[0];
              allQuestions.push({ ...question, currentVersion });
            }
          }
        }
        
        // If sectionId is a category name, filter questions by that category
        const sectionQuestions = allQuestions.filter(question => {
          const category = question.currentVersion?.category;
          if (category === sectionId) {
            sectionTitle = category;
            return true;
          }
          return false;
        });
        
        const questionCount = sectionQuestions.length;
        
        // Count required questions
        const requiredQuestionCount = sectionQuestions.filter(question => {
          return question.currentVersion?.required === true || question.currentVersion?.required === 'true';
        }).length;
        
        // Calculate estimated time (roughly 30 seconds per question)
        const estimatedMinutes = Math.max(1, Math.round(questionCount * 0.5));
        
        return {
          questionCount,
          requiredQuestionCount,
          estimatedTime: `~${estimatedMinutes}`,
          title: sectionTitle || sectionId
        };
      } catch (error: unknown) {
        console.error('Error getting section metadata:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error getting section metadata: ${errorMessage}`);
      }
    },
    
    async 'getMostUsedTags'(limit = 4) {
      console.log('getMostUsedTags method called with limit:', limit);
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get tag data');
      }
      
      try {
        // Get all questions to calculate tag usage
        const questions = await Questions.find({}).fetchAsync();
        
        // Get all surveys to calculate tag usage
        const surveys = await Surveys.find({}).fetchAsync();
        
        // Count tag usage in questions and surveys
        const tagUsage = new Map();
        
        // Count question usage
        questions.forEach(question => {
          const currentVersion = question.versions?.[question.currentVersion - 1] || 
                               question.versions?.[question.versions?.length - 1];
          if (currentVersion) {
            // Check categoryTags
            if (currentVersion.categoryTags && Array.isArray(currentVersion.categoryTags)) {
              currentVersion.categoryTags.forEach((tagId: string) => {
                if (!tagUsage.has(tagId)) {
                  tagUsage.set(tagId, { questions: 0, surveys: 0 });
                }
                tagUsage.get(tagId).questions += 1;
              });
            }
            
            // Check for custom labels field that might exist in some versions
            // Note: We're using any here because labels isn't in the type definition
            // but may exist in the actual data
            const anyVersion = currentVersion as any;
            if (anyVersion.labels && Array.isArray(anyVersion.labels)) {
              anyVersion.labels.forEach((tagId: string) => {
                if (!tagUsage.has(tagId)) {
                  tagUsage.set(tagId, { questions: 0, surveys: 0 });
                }
                tagUsage.get(tagId).questions += 1;
              });
            }
          }
        });
        
        // Count survey usage
        surveys.forEach((survey: any) => {
          // Check selectedTags array
          if (survey.selectedTags && Array.isArray(survey.selectedTags)) {
            survey.selectedTags.forEach((tagId: string) => {
              if (!tagUsage.has(tagId)) {
                tagUsage.set(tagId, { questions: 0, surveys: 0 });
              }
              tagUsage.get(tagId).surveys += 1;
            });
          }
          
          // Check templateTags if present
          if (survey.templateTags && Array.isArray(survey.templateTags)) {
            survey.templateTags.forEach((tagId: string) => {
              if (!tagUsage.has(tagId)) {
                tagUsage.set(tagId, { questions: 0, surveys: 0 });
              }
              tagUsage.get(tagId).surveys += 1;
            });
          }
        });
        
        // Calculate total usage for each tag (questions + surveys)
        const tagTotalUsage = new Map();
        tagUsage.forEach((usage, tagId) => {
          tagTotalUsage.set(tagId, usage.questions + usage.surveys);
        });
        
        // Sort tags by total usage and get the top ones
        const topTagIds = Array.from(tagTotalUsage.entries())
          .sort((a, b) => b[1] - a[1])
          .slice(0, limit)
          .map(entry => entry[0]);
        
        // Get the tag details from Layers collection
        const layers = await Meteor.callAsync('layers.getByIds', topTagIds);
        
        // Format the result with tag name and count
        const result = topTagIds.map(tagId => {
          const layer = layers.find((l: any) => l._id === tagId);
          return {
            id: tagId,
            tag: layer?.name || 'Unknown Tag',
            count: tagTotalUsage.get(tagId) || 0,
            color: layer?.color || '#552a47'
          };
        }).filter(item => item.tag !== 'Unknown Tag');
        
        console.log('Most used tags:', result);
        return result;
      } catch (error: unknown) {
        console.error('Error getting most used tags:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error getting most used tags: ${errorMessage}`);
      }
    }
  });
}
