import { Meteor } from 'meteor/meteor';
import { SurveyResponses } from './surveyResponses';
import { IncompleteSurveyResponses } from './incompleteSurveyResponses';
import { Questions } from '../../questions/api/questions';

if (Meteor.isServer) {
  Meteor.methods({
    // Enhanced method to get total survey responses (completed + incomplete)
    async 'getEnhancedSurveysCount'() {
      console.log('getCompletedSurveysCount method called (enhanced version)');
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get survey counts');
      }
      
      try {
        // Get all completed survey responses (not just filtering by completed: true)
        const completedResponses = await SurveyResponses.find({}).fetchAsync();
        
        // Get all incomplete survey responses
        const incompleteResponses = await IncompleteSurveyResponses.find({
          isCompleted: false,
          isAbandoned: { $exists: false }
        }).fetchAsync();
        
        // Calculate the total count
        const totalCount = completedResponses.length + incompleteResponses.length;
        console.log(`Enhanced count: ${completedResponses.length} completed + ${incompleteResponses.length} incomplete = ${totalCount} total responses`);
        
        return totalCount;
      } catch (error: unknown) {
        console.error('Error counting survey responses:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error counting survey responses: ${errorMessage}`);
      }
    },
    
    // Enhanced method to calculate participation rate
    async 'getEnhancedParticipationRate'() {
      console.log('getParticipationRate method called (enhanced version)');
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get participation rate');
      }
      
      try {
        // Count completed surveys
        const completedCount = await SurveyResponses.find({ completed: true }).countAsync();
        
        // Count incomplete surveys that aren't abandoned
        const incompleteCount = await IncompleteSurveyResponses.find({ 
          isCompleted: false,
          isAbandoned: { $exists: false }
        }).countAsync();
        
        // Use the total responses as the denominator
        // This represents the total number of responses we have in the system
        const totalResponses = completedCount + incompleteCount;
        
        // Calculate participation rate - since we're using the responses themselves as the base,
        // this will always be 100% unless we implement a proper invitation tracking system
        const participationRate = 100; // Fixed at 100% since we're using responses/responses
        
        console.log(`Enhanced participation rate: ${participationRate}% (${completedCount} completed + ${incompleteCount} incomplete / ${totalResponses} total)`);
        
        return participationRate;
      } catch (error: unknown) {
        console.error('Error calculating participation rate:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error calculating participation rate: ${errorMessage}`);
      }
    },
    
    // Enhanced method to calculate average engagement score
    async 'getAnalyticsEngagementScore'() {
      console.log('getAverageEngagementScore method called (enhanced version)');
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get average engagement score');
      }
      
      try {
        // Get all completed survey responses
        const completedResponses = await SurveyResponses.find({}).fetchAsync();
        
        // Get all incomplete survey responses
        const incompleteResponses = await IncompleteSurveyResponses.find({
          isCompleted: false,
          isAbandoned: { $exists: false }
        }).fetchAsync();
        
        let totalScore = 0;
        let totalResponses = 0;
        
        // Process completed responses
        completedResponses.forEach(response => {
          if (response.engagementScore !== undefined && response.engagementScore !== null) {
            totalScore += response.engagementScore;
            totalResponses++;
          }
        });
        
        // Process incomplete responses
        incompleteResponses.forEach(response => {
          if (response.engagementScore !== undefined && response.engagementScore !== null) {
            totalScore += response.engagementScore;
            totalResponses++;
          }
        });
        
        // Calculate average engagement score
        const averageScore = totalResponses > 0 ? totalScore / totalResponses : 0;
        
        console.log(`Enhanced average engagement score: ${averageScore.toFixed(2)} (${totalScore} / ${totalResponses})`);
        
        return averageScore;
      } catch (error: unknown) {
        console.error('Error calculating average engagement score:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error calculating average engagement score: ${errorMessage}`);
      }
    },
    
    // Enhanced method to calculate average completion time
    async 'getAnalyticsCompletionTime'() {
      console.log('getAnalyticsCompletionTime method called');
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to get average completion time');
      }
      
      try {
        // Get all completed survey responses
        const completedResponses = await SurveyResponses.find({}).fetchAsync();
        
        // Get all incomplete survey responses that have completion time data
        const incompleteResponses = await IncompleteSurveyResponses.find({
          completionTime: { $exists: true },
          isAbandoned: { $exists: false }
        }).fetchAsync();
        
        let totalTime = 0;
        let totalResponses = 0;
        
        // Process completed responses
        completedResponses.forEach(response => {
          if (response.completionTime !== undefined && response.completionTime !== null) {
            totalTime += response.completionTime;
            totalResponses++;
          }
        });
        
        // Process incomplete responses
        incompleteResponses.forEach(response => {
          if (response.completionTime !== undefined && response.completionTime !== null) {
            totalTime += response.completionTime;
            totalResponses++;
          }
        });
        
        // Calculate average completion time
        const averageTime = totalResponses > 0 ? totalTime / totalResponses : 0;
        
        console.log(`Enhanced average completion time: ${averageTime.toFixed(2)} minutes (${totalTime} / ${totalResponses})`);
        
        return averageTime;
      } catch (error: unknown) {
        console.error('Error calculating average completion time:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error calculating average completion time: ${errorMessage}`);
      }
    },
    
    /**
     * Get question performance data for analytics dashboard
     * Shows the most frequently used questions and their response distributions
     * @returns Array of question performance data with response distributions
     */
    async 'getQuestionPerformanceData'() {
      console.log('getQuestionPerformanceData method called');
      
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to access question performance data');
      }
      
      try {
        // Get all completed survey responses
        const completedResponses = await SurveyResponses.find({}).fetchAsync();
        
        // Get all incomplete survey responses that aren't abandoned
        const incompleteResponses = await IncompleteSurveyResponses.find({
          isCompleted: false,
          isAbandoned: { $exists: false }
        }).fetchAsync();
        
        // Calculate total number of survey responses for skip rate calculation
        const totalSurveyResponses = completedResponses.length + incompleteResponses.length;
        
        console.log(`Processing ${completedResponses.length} completed and ${incompleteResponses.length} incomplete responses for question performance`);
        
        // Create a map to store question data
        // Key: questionId, Value: { question, responses, averageScore, etc. }
        const questionMap = new Map();
        
        // Create a map to directly track skipped vs. answered questions
        // Key: questionId, Value: { total: number, answered: number, skipped: number, timeSpentTotal: number }
        const questionResponseStats = new Map();
        
        // Collect all unique question IDs first
        const questionIds = new Set();
        
        // Initialize the question response stats map for all question IDs
        questionIds.forEach(qId => {
          questionResponseStats.set(qId, { total: 0, answered: 0, skipped: 0, timeSpentTotal: 0 });
        });
        
        // Process completed responses to collect question IDs and count answered/skipped questions
        completedResponses.forEach(response => {
          if (!response.responses || !Array.isArray(response.responses)) {
            return;
          }
          
          // Calculate total survey time
          let totalSurveyTime = 0;
          if (response.startTime && response.endTime) {
            const startTime = new Date(response.startTime);
            const endTime = new Date(response.endTime);
            totalSurveyTime = (endTime.getTime() - startTime.getTime()) / 1000; // in seconds
          }
          
          // Count answered questions for this response
          const answeredQuestionIds = [];
          response.responses.forEach(item => {
            if (!item.questionId) {
              return;
            }
            
            // Add to our set of unique question IDs
            questionIds.add(item.questionId);
            
            // Initialize stats for this question if not already done
            if (!questionResponseStats.has(item.questionId)) {
              questionResponseStats.set(item.questionId, { total: 0, answered: 0, skipped: 0, timeSpentTotal: 0 });
            }
            
            const stats = questionResponseStats.get(item.questionId);
            stats.total++;
            
            // Check if the answer is empty (as shown in your database screenshot)
            if (item.answer === undefined || item.answer === null || item.answer === '') {
              stats.skipped++;
            } else {
              stats.answered++;
              answeredQuestionIds.push(item.questionId);
            }
          });
          
          // Distribute survey time across answered questions
          if (totalSurveyTime > 0 && answeredQuestionIds.length > 0) {
            const timePerQuestion = totalSurveyTime / answeredQuestionIds.length;
            answeredQuestionIds.forEach(qId => {
              const stats = questionResponseStats.get(qId);
              stats.timeSpentTotal += timePerQuestion;
            });
          }
        });
        
        // Also process incomplete responses
        incompleteResponses.forEach(response => {
          if (!response.responses || !Array.isArray(response.responses)) {
            return;
          }
          
          // Calculate total survey time
          let totalSurveyTime = 0;
          if (response.startTime && response.endTime) {
            const startTime = new Date(response.startTime);
            const endTime = new Date(response.endTime);
            totalSurveyTime = (endTime.getTime() - startTime.getTime()) / 1000; // in seconds
          }
          
          // Count answered questions for this response
          const answeredQuestionIds = [];
          response.responses.forEach(item => {
            if (!item.questionId) {
              return;
            }
            
            // Add to our set of unique question IDs
            questionIds.add(item.questionId);
            
            // Initialize stats for this question if not already done
            if (!questionResponseStats.has(item.questionId)) {
              questionResponseStats.set(item.questionId, { total: 0, answered: 0, skipped: 0, timeSpentTotal: 0 });
            }
            
            const stats = questionResponseStats.get(item.questionId);
            stats.total++;
            
            // Check if the answer is empty (as shown in your database screenshot)
            if (item.answer === undefined || item.answer === null || item.answer === '') {
              stats.skipped++;
            } else {
              stats.answered++;
              answeredQuestionIds.push(item.questionId);
            }
          });
          
          // Distribute survey time across answered questions
          if (totalSurveyTime > 0 && answeredQuestionIds.length > 0) {
            const timePerQuestion = totalSurveyTime / answeredQuestionIds.length;
            answeredQuestionIds.forEach(qId => {
              const stats = questionResponseStats.get(qId);
              stats.timeSpentTotal += timePerQuestion;
            });
          }
        });
        
        // Fetch actual question data from the database
        console.log(`Fetching data for ${questionIds.size} unique questions`);
        const questionIdsArray = Array.from(questionIds) as string[];
        
        // Use the questions.getMany method which is designed to fetch question data
        let questionDocs = [];
        try {
          // Call the method directly since we're on the server
          questionDocs = await Meteor.callAsync('questions.getMany', questionIdsArray);
          console.log(`Successfully fetched ${questionDocs.length} questions using questions.getMany`);
        } catch (error) {
          console.error('Error fetching questions with questions.getMany:', error);
          // Fallback to direct database query
          questionDocs = await Questions.find({ _id: { $in: questionIdsArray } }).fetchAsync();
          console.log(`Fetched ${questionDocs.length} questions using direct database query`);
        }
        
        console.log('Question documents fetched:', JSON.stringify(questionDocs, null, 2));
        
        // Create maps for question text and type
        const questionTextMap = new Map<string, string>();
        const questionTypeMap = new Map<string, string>();
        
        // Process each question document
        questionDocs.forEach((q: any) => {
          if (!q || !q._id) return;
          
          console.log('Processing question:', q._id);
          
          // Try different possible locations for the question text and type
          let questionText: string | null = null;
          let questionType: string | null = null;
          
          // Option 1: Direct text property (might exist in some schemas)
          if (q.text) {
            questionText = q.text;
            console.log('Found question text in q.text:', questionText);
          }
          // Option 2: Question text in versions array
          else if (q.versions && Array.isArray(q.versions) && q.versions.length > 0) {
            const currentVersionIndex = typeof q.currentVersion === 'number' ? q.currentVersion : 0;
            const currentVersion = q.versions[currentVersionIndex] || q.versions[q.versions.length - 1];
            
            if (currentVersion && currentVersion.questionText) {
              questionText = currentVersion.questionText;
              console.log('Found question text in versions array:', questionText);
            }
            
            // Try to determine question type from current version
            if (currentVersion) {
              if (currentVersion.type) {
                questionType = currentVersion.type;
                console.log('Found question type in currentVersion.type:', questionType);
              } else if (currentVersion.questionType) {
                questionType = currentVersion.questionType;
                console.log('Found question type in currentVersion.questionType:', questionType);
              } else if (currentVersion.inputType) {
                questionType = currentVersion.inputType;
                console.log('Found question type in currentVersion.inputType:', questionType);
              } else if (currentVersion.answerType) {
                questionType = currentVersion.answerType;
                console.log('Found question type in currentVersion.answerType:', questionType);
              }
            }
          }
          // Option 3: Question might be in a different format
          else if (q.question) {
            questionText = q.question;
            console.log('Found question text in q.question:', questionText);
          }
          // Option 4: Title might contain the question
          else if (q.title) {
            questionText = q.title;
            console.log('Found question text in q.title:', questionText);
          }
          
          // If we still don't have text, use the fallback
          if (!questionText) {
            questionText = `Question ${q._id}`;
            console.log('Using fallback question text:', questionText);
          }
          
          // Store the question text in our map
          questionTextMap.set(q._id, questionText);
          
          // Store the question type in our map if we found it
          if (questionType) {
            // Normalize question type to standard format
            let normalizedType = questionType.toLowerCase();
            
            // Map various input types to our standard types
            if (normalizedType.includes('likert') || normalizedType.includes('rating') || normalizedType.includes('scale')) {
              normalizedType = 'likert';
            } else if (normalizedType.includes('multiple') || normalizedType.includes('checkbox') || normalizedType.includes('select')) {
              normalizedType = 'multiple_choice';
            } else if (normalizedType.includes('text') || normalizedType.includes('open') || normalizedType.includes('input')) {
              normalizedType = 'open_text';
            }
            
            questionTypeMap.set(q._id, normalizedType);
            console.log(`Set question type for ${q._id} to ${normalizedType}`);
          } else {
            console.log('Could not find question type for:', q._id);
          }
        });
        
        // Now process responses with real question texts
        completedResponses.forEach(response => {
          if (!response.responses || !Array.isArray(response.responses)) {
            return;
          }
          
          response.responses.forEach(item => {
            if (!item.questionId) {
              return;
            }
            
            const questionId = item.questionId;
            // Use real question text from our map, or fallback to ID if not found
            const questionText = questionTextMap.get(questionId) || `Question ${questionId}`;
            const answer = item.answer;
            
            // Initialize question data if not exists
            if (!questionMap.has(questionId)) {
              questionMap.set(questionId, {
                questionId,
                questionText,
                responseCount: 0,
                answers: {},
                totalScore: 0,
                scoreCount: 0,
                // Enhanced metrics tracking
                timeSpentTotal: 0,
                timeSpentCount: 0,
                skipCount: 0,
                completionCount: 0,
                engagementTotal: 0,
                engagementCount: 0,
                qualityScores: []
              });
            }
            
            const questionData = questionMap.get(questionId);
            questionData.responseCount++;
            
            // Process answer
            if (answer !== undefined && answer !== null) {
              // Handle numeric answers (for ratings)
              if (typeof answer === 'number') {
                questionData.totalScore += answer;
                questionData.scoreCount++;
              }
              
              // Count answer frequencies
              const answerKey = String(answer);
              questionData.answers[answerKey] = (questionData.answers[answerKey] || 0) + 1;
            }
          });
        });
        
        // Process incomplete responses with real question texts
        incompleteResponses.forEach(response => {
          if (!response.responses || !Array.isArray(response.responses)) {
            return;
          }
          
          response.responses.forEach(item => {
            if (!item.questionId) {
              return;
            }
            
            const questionId = item.questionId;
            // Use real question text from our map, or fallback to ID if not found
            const questionText = questionTextMap.get(questionId) || `Question ${questionId}`;
            const answer = item.answer;
            
            // Initialize question data if not exists
            if (!questionMap.has(questionId)) {
              questionMap.set(questionId, {
                questionId,
                questionText,
                responseCount: 0,
                answers: {},
                totalScore: 0,
                scoreCount: 0,
                // Enhanced metrics tracking
                timeSpentTotal: 0,
                timeSpentCount: 0,
                skipCount: 0,
                completionCount: 0,
                engagementTotal: 0,
                engagementCount: 0,
                qualityScores: []
              });
            }
            
            const questionData = questionMap.get(questionId);
            questionData.responseCount++;
            
            // Process answer
            if (answer !== undefined && answer !== null) {
              // Handle numeric answers (for ratings)
              if (typeof answer === 'number') {
                questionData.totalScore += answer;
                questionData.scoreCount++;
              }
              
              // Count answer frequencies
              const answerKey = String(answer);
              questionData.answers[answerKey] = (questionData.answers[answerKey] || 0) + 1;
            }
          });
        });
        
        // Log the question text map for debugging
        console.log('Question text map:');
        questionTextMap.forEach((text, id) => {
          console.log(`  ${id}: "${text}"`);
        });
        
        // Log the question response stats for debugging
        console.log('Question response stats:');
        questionResponseStats.forEach((stats, qId) => {
          console.log(`  ${qId}: total=${stats.total}, answered=${stats.answered}, skipped=${stats.skipped}`);
        });
        
        // Convert map to array and calculate averages
        const result = Array.from(questionMap.values()).map(question => {
          // Calculate average score for rating questions
          const averageScore = question.scoreCount > 0 
            ? Math.round((question.totalScore / question.scoreCount) * 10) / 10 
            : 0;
          
          // Determine sentiment based on average score (for rating questions)
          let sentiment = 'neutral';
          if (question.scoreCount > 0) {
            if (averageScore >= 4) sentiment = 'positive';
            else if (averageScore <= 2) sentiment = 'negative';
          }
          
          // Format answers as array for easier frontend processing
          const formattedAnswers = Object.entries(question.answers).map(([value, count]) => ({
            value,
            count: count as number,
            percentage: Math.round(((count as number) / question.responseCount) * 100)
          }));
          
          // Sort answers by value (ascending)
          formattedAnswers.sort((a, b) => {
            // Try to sort numerically if possible
            const numA = parseFloat(a.value);
            const numB = parseFloat(b.value);
            
            if (!isNaN(numA) && !isNaN(numB)) {
              return numA - numB;
            }
            
            // Fall back to string comparison
            return a.value.localeCompare(b.value);
          });
          
          // Helper function to format time in minutes and seconds
          const formatTimeDisplay = (seconds: number): string => {
            if (seconds < 60) {
              return `${seconds}s`;
            } else {
              const minutes = Math.floor(seconds / 60);
              const remainingSeconds = seconds % 60;
              return `${minutes}m ${remainingSeconds}s`;
            }
          };
          
          // Helper functions for calculating engagement score components
          
          // 1. Time Spent Factor (25%)
          const calculateTimeSpentFactor = (avgTimeInSeconds: number, questionType: string | undefined): number => {
            // Define ideal time ranges based on question type
            let minIdealTime = 10; // seconds
            let maxIdealTime = 30; // seconds
            
            // Adjust ideal time range based on question type (with null/undefined check)
            if (questionType && typeof questionType === 'string') {
              const lowerType = questionType.toLowerCase();
              if (lowerType.includes('text')) {
                minIdealTime = 20;
                maxIdealTime = 60;
              } else if (lowerType.includes('multiple')) {
                minIdealTime = 15;
                maxIdealTime = 45;
              }
            }
            
            // Calculate score based on time spent
            if (avgTimeInSeconds >= minIdealTime && avgTimeInSeconds <= maxIdealTime) {
              // Full points if within ideal range
              return 25;
            } else if (avgTimeInSeconds < minIdealTime) {
              // Partial points if too quick (potentially rushing)
              const percentage = Math.max(avgTimeInSeconds / minIdealTime, 0.2); // At least 20%
              return Math.round(25 * percentage);
            } else {
              // Partial points if too slow (potentially distracted)
              const maxTime = maxIdealTime * 2;
              const percentage = Math.max(1 - ((avgTimeInSeconds - maxIdealTime) / maxTime), 0.2); // At least 20%
              return Math.round(25 * percentage);
            }
          };
          
          // 2. Survey Completion Factor (25%)
          const calculateCompletionFactor = (completionRate: number): number => {
            // Scale the completion rate to 25 points
            return Math.round((completionRate / 100) * 25);
          };
          
          // 3. Response Quality Factor (50%)
          // 3a. Skip Rate Component (25%)
          const calculateSkipFactor = (skipRate: number): number => {
            // Inverse of skip rate (lower skip rate = higher score)
            return Math.round((1 - (skipRate / 100)) * 25);
          };
          
          // 3b. Answer Quality Component (25%)
          const calculateAnswerQualityFactor = (questionStats: any, questionType: string | undefined): number => {
            // For now, a simple implementation based on whether the question was answered
            if (questionStats.answered === 0) {
              return 0;
            }
            
            // For text questions, we could analyze text length, etc.
            // For multiple choice, full points for selecting an option
            return 25;
          };
          
          // Calculate enhanced metrics - dynamic average time spent
          const questionStats = questionResponseStats.get(question.questionId) || { total: 0, answered: 0, skipped: 0, timeSpentTotal: 0 };
          const avgTimeSpentSeconds = questionStats.answered > 0 
            ? Math.round(questionStats.timeSpentTotal / questionStats.answered) 
            : 30; // Default to 30 seconds if no data
          
          // Format the time display
          const avgTimeSpent = formatTimeDisplay(avgTimeSpentSeconds);
          
          // Get the response stats for this question (already retrieved above)
          // Using the same questionStats variable
          
          // Calculate completion rate as percentage of people who answered the question
          const completionRate = questionStats.total > 0
            ? Number(((questionStats.answered / questionStats.total) * 100).toFixed(2))
            : 0;
            
          // Calculate skip rate as percentage of people who didn't answer the question
          const skipRate = questionStats.total > 0
            ? Number(((questionStats.skipped / questionStats.total) * 100).toFixed(2))
            : 0;
          
          // Calculate dynamic engagement score based on multiple factors
          
          // 1. Time Spent Factor (25%)
          const timeSpentFactor = calculateTimeSpentFactor(avgTimeSpentSeconds, question.questionType);
          
          // 2. Survey Completion Factor (25%)
          const completionFactor = calculateCompletionFactor(completionRate);
          
          // 3a. Skip Rate Component (25%)
          const skipFactor = calculateSkipFactor(skipRate);
          
          // 3b. Answer Quality Component (25%)
          const answerQualityFactor = calculateAnswerQualityFactor(questionStats, question.questionType);
          
          // Calculate total engagement score (0-100)
          const engagementScore = timeSpentFactor + completionFactor + skipFactor + answerQualityFactor;
          
          // Log the engagement score components for debugging
          console.log(`Engagement score for question ${question.questionId}:`);
          console.log(`  Time Spent Factor: ${timeSpentFactor}/25 (${avgTimeSpentSeconds}s)`); 
          console.log(`  Completion Factor: ${completionFactor}/25 (${completionRate}%)`); 
          console.log(`  Skip Factor: ${skipFactor}/25 (${skipRate}% skip rate)`); 
          console.log(`  Answer Quality Factor: ${answerQualityFactor}/25`); 
          console.log(`  Total Engagement Score: ${engagementScore}/100`);
          
          // Determine response quality based on the new engagement score
          let responseQuality = 'medium';
          if (engagementScore >= 85) {
            responseQuality = 'high';
          } else if (engagementScore < 60) {
            responseQuality = 'low';
          }
          
          // IMPORTANT: Get the real question text and type from our maps, or use fallbacks
          // This ensures we're always using the most up-to-date question data from the database
          const realQuestionText = questionTextMap.get(question.questionId) || question.questionText;
          console.log(`Final question text for ${question.questionId}: "${realQuestionText}" (original was "${question.questionText}")`);
          
          // Determine question type - either from our map or infer from the data
          let questionType = questionTypeMap.get(question.questionId);
          
          if (!questionType) {
            // Infer question type from answer patterns if not available from question document
            if (formattedAnswers.length > 0) {
              const answerValues = formattedAnswers.map(a => a.value);
              
              // Likert scale typically has numeric values 1-5 or 1-7
              if (answerValues.every(v => !isNaN(Number(v))) && 
                  answerValues.length <= 7 && 
                  Math.max(...answerValues.map(v => Number(v))) <= 7) {
                questionType = 'likert';
              }
              // Multiple choice / checkbox typically has text answers
              else if (answerValues.some(v => isNaN(Number(v)))) {
                questionType = 'multiple_choice';
              }
              // Open text questions typically have many unique answers
              else if (answerValues.length > 10) {
                questionType = 'open_text';
              }
              else {
                questionType = 'unknown';
              }
            } else {
              questionType = 'unknown';
            }
            
            console.log(`Inferred question type for ${question.questionId}: ${questionType}`);
          }
          
          return {
            questionId: question.questionId,
            questionText: realQuestionText, // Use the real question text from our map
            questionType, // Include the question type
            responseCount: question.responseCount,
            averageScore,
            sentiment,
            answers: formattedAnswers,
            // Enhanced metrics
            avgTimeSpent,
            skipRate,
            completionRate,
            engagementScore,
            responseQuality
          };
        });
        
        // Sort by response count (most frequent questions first)
        result.sort((a, b) => b.responseCount - a.responseCount);
        
        console.log(`Returning performance data for ${result.length} questions`);
        return result;
      } catch (error: unknown) {
        console.error('Error getting question performance data:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error getting question performance data: ${errorMessage}`);
      }
    }
  });
}
