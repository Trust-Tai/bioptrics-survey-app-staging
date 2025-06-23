import { Meteor } from 'meteor/meteor';
import { SurveyResponses } from './surveyResponses';
import { IncompleteSurveyResponses } from './incompleteSurveyResponses';

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
        
        // Get total number of surveys sent
        const totalSent = 100; // This should be replaced with actual logic to count total surveys sent
        
        // Calculate participation rate
        const participationRate = totalSent > 0 
          ? Math.round(((completedCount + incompleteCount) / totalSent) * 100) 
          : 0;
        
        console.log(`Enhanced participation rate: ${participationRate}% (${completedCount} completed + ${incompleteCount} incomplete / ${totalSent} total)`);
        
        return participationRate;
      } catch (error: unknown) {
        console.error('Error calculating participation rate:', error);
        const errorMessage = error instanceof Error ? error.message : 'Unknown error';
        throw new Meteor.Error('db-error', `Error calculating participation rate: ${errorMessage}`);
      }
    },
    
    // Enhanced method to calculate average engagement score
    async 'getEnhancedEngagementScore'() {
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
    async 'getEnhancedCompletionTime'() {
      console.log('getAverageCompletionTime method called (enhanced version)');
      
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
        
        console.log(`Processing ${completedResponses.length} completed and ${incompleteResponses.length} incomplete responses for question performance`);
        
        // Create a map to store question data
        // Key: questionId, Value: { question, responses, averageScore, etc. }
        const questionMap = new Map();
        
        // Process completed responses
        completedResponses.forEach(response => {
          if (!response.responses || !Array.isArray(response.responses)) {
            return;
          }
          
          response.responses.forEach(item => {
            if (!item.questionId) {
              return;
            }
            
            const questionId = item.questionId;
            // Use questionId as the question text since we don't have direct access to question text
            const questionText = `Question ${questionId}`;
            const answer = item.answer;
            
            // Initialize question data if not exists
            if (!questionMap.has(questionId)) {
              questionMap.set(questionId, {
                questionId,
                questionText,
                responseCount: 0,
                answers: {},
                totalScore: 0,
                scoreCount: 0
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
        
        // Process incomplete responses
        incompleteResponses.forEach(response => {
          if (!response.responses || !Array.isArray(response.responses)) {
            return;
          }
          
          response.responses.forEach(item => {
            if (!item.questionId) {
              return;
            }
            
            const questionId = item.questionId;
            // Use questionId as the question text since we don't have direct access to question text
            const questionText = `Question ${questionId}`;
            const answer = item.answer;
            
            // Initialize question data if not exists
            if (!questionMap.has(questionId)) {
              questionMap.set(questionId, {
                questionId,
                questionText,
                responseCount: 0,
                answers: {},
                totalScore: 0,
                scoreCount: 0
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
          
          return {
            questionId: question.questionId,
            questionText: question.questionText,
            responseCount: question.responseCount,
            averageScore,
            sentiment,
            answers: formattedAnswers
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
