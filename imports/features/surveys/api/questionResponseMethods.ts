import { Meteor } from 'meteor/meteor';
import { check } from 'meteor/check';
import { SurveyResponses } from './surveyResponses';
import { Questions } from '../../questions/api/questions';

// Helper function to get colors for chart
function getColorForIndex(index: number) {
  const colors = [
    '#78b04a', // Green
    '#a7d16c', // Light green
    '#f9c74f', // Yellow
    '#e07a5f', // Orange
    '#e63946'  // Red
  ];
  
  return index < colors.length ? colors[index] : '#6495ED'; // Default to blue for additional options
}

if (Meteor.isServer) {
  Meteor.methods({
    // Method to get response data for a specific question for export
    async 'questions.exportResponseData'(questionId: string) {
      check(questionId, String);
      
      // Check if user is logged in
      if (!this.userId) {
        throw new Meteor.Error('not-authorized', 'You must be logged in to access question response data');
      }
      
      try {
        console.log(`[SERVER] Exporting data for question ID: ${questionId}`);
        
        // Get the question data
        const question = await Questions.findOneAsync({ _id: questionId });
        console.log(`[SERVER] Question found:`, question ? 'Yes' : 'No');
        
        if (!question) {
          throw new Meteor.Error('not-found', 'Question not found');
        }
        
        // Find all survey responses that include this question
        const responses = await SurveyResponses.find({
          'responses.questionId': questionId,
          completed: true
        }).fetchAsync();
        
        console.log(`[SERVER] Found ${responses.length} responses for question ${questionId}`);
        
        // Extract basic question information
        let questionText = 'Untitled Question';
        let questionDescription = '';
        let responseType = 'unknown';
        let versionOptions: any[] = [];
        
        // Try to get question text from various possible locations
        if (question.versions && question.versions.length > 0) {
          const versionIndex = question.currentVersion !== undefined ? question.currentVersion - 1 : question.versions.length - 1;
          const version = question.versions[versionIndex];
          
          console.log(`[SERVER] Using version index: ${versionIndex}, version found:`, version ? 'Yes' : 'No');
          console.log(`[SERVER] Full question document:`, JSON.stringify(question, null, 2));
          
          if (version) {
            questionText = version.questionText || questionText;
            questionDescription = version.description || questionDescription;
            responseType = version.responseType || responseType;
            
            // Store the options from the version for later use
            if (version.options && Array.isArray(version.options)) {
              versionOptions = version.options;
              console.log(`[SERVER] Found ${versionOptions.length} options in version:`, 
                versionOptions.map(o => `${o.text}:${o.value}`).join(', '));
            }
          }
        } else if ((question as any).text) {
          questionText = (question as any).text;
        }
        
        // Log the extracted question information
        console.log(`[SERVER] Extracted question info - Text: "${questionText}", Type: ${responseType}, Options: ${versionOptions.length}`);
        
        // Collect all answers
        const allAnswers: any[] = [];
        const answerCounts: Record<string, number> = {};
        
        responses.forEach(response => {
          const questionResponse = response.responses.find(r => r.questionId === questionId);
          if (questionResponse && questionResponse.answer !== undefined) {
            // Store the raw answer
            allAnswers.push({
              responseId: response._id,
              answer: questionResponse.answer,
              timestamp: response.updatedAt || response.createdAt
            });
            
            // Count the answers
            if (typeof questionResponse.answer === 'string' || typeof questionResponse.answer === 'number') {
              const answerStr = String(questionResponse.answer);
              answerCounts[answerStr] = (answerCounts[answerStr] || 0) + 1;
            } else if (Array.isArray(questionResponse.answer)) {
              questionResponse.answer.forEach(option => {
                const optionStr = String(option);
                answerCounts[optionStr] = (answerCounts[optionStr] || 0) + 1;
              });
            }
          }
        });
        
        // Create a simplified report format that works with any question type
        const totalResponses = responses.length;
        
        // Create a map to store processed options
        const processedOptions: Record<string, any> = {};
        
        // First, process all answer counts into the map
        Object.entries(answerCounts).forEach(([value, count]) => {
          const percentage = totalResponses > 0 ? Math.round((count / totalResponses) * 100) : 0;
          
          // Try to find a matching option in the version options to get the proper label
          const matchingOption = versionOptions.find(opt => opt.value === value || opt.text === value);
          const label = matchingOption ? matchingOption.text : value;
          
          processedOptions[value] = {
            label: label,
            value: value,
            count: count,
            percentage: percentage,
            // Color will be assigned later
          };
        });
        
        // Now ensure ALL version options are included, even if they have no responses
        if (versionOptions.length > 0) {
          versionOptions.forEach((opt) => {
            if (!processedOptions[opt.value]) {
              processedOptions[opt.value] = {
                label: opt.text,
                value: opt.value,
                count: 0,
                percentage: 0,
              };
            }
          });
        }
        
        // Convert the map back to an array and assign colors
        const options = Object.values(processedOptions).map((option, index) => {
          return {
            ...option,
            color: getColorForIndex(index)
          };
        });
        
        // Always sort options to match the order in the version options if possible
        // This ensures options appear in the same order as in the question definition
        if (versionOptions.length > 0) {
          options.sort((a, b) => {
            const aIndex = versionOptions.findIndex(opt => opt.value === a.value || opt.text === a.label);
            const bIndex = versionOptions.findIndex(opt => opt.value === b.value || opt.text === b.label);
            
            if (aIndex >= 0 && bIndex >= 0) {
              return aIndex - bIndex; // Sort by original order
            } else if (aIndex >= 0) {
              return -1; // a is in version options, b is not
            } else if (bIndex >= 0) {
              return 1;  // b is in version options, a is not
            }
            
            return b.count - a.count; // Fall back to count-based sorting
          });
        } else {
          options.sort((a, b) => b.count - a.count);
        }
        
        // Debug log the final options
        console.log(`[SERVER] Final options for PDF (${options.length}):`, 
          options.map(o => `${o.label}:${o.count}:${o.percentage}%`).join(', '));
        
        // Generate response overview
        let responseOverview = '';
        // if (options.length > 0) {
        //   responseOverview = `${options[0].percentage}% selected "${options[0].label}"`;
        // }
        
        // Create text responses array for text questions
        const textResponses = responseType === 'text' || responseType === 'textarea' 
          ? allAnswers.map(a => String(a.answer)).filter(Boolean)
          : [];
        
        // Create a simplified report that works with any question structure
        return {
          reportTitle: 'Question Response Report',
          reportSubtitle: questionText,
          description: 'Analysis of responses for the selected question',
          date: new Date().toLocaleDateString(),
          logoUrl: '/bioptrics_fixed_black.png',
          totalRespondents: totalResponses,
          question: {
            id: questionId,
            title: questionText,
            questionText: questionText,
            description: questionDescription,
            responseType: responseType,
            respondents: totalResponses,
            responseOverview: responseOverview,
            options: options,
            textResponses: textResponses,
            // Include the versions array and currentVersion from the original question
            currentVersion: question.currentVersion,
            versions: question.versions
          }
        };
      } catch (error: any) {
        console.error('[SERVER] Error exporting question response data:', error);
        console.error('[SERVER] Error stack:', error.stack);
        
        // Create a more descriptive error message
        const errorMessage = error.message || 'Unknown error occurred';
        throw new Meteor.Error(
          'server-error', 
          `Failed to export question data: ${errorMessage}`
        );
      }
    }
  });
}
