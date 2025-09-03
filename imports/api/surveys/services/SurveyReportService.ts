import { Meteor } from 'meteor/meteor';

/**
 * Service for handling survey report operations
 */
export class SurveyReportService {
  /**
   * Get all survey responses data for reporting
   */
  static async getAllResponsesData() {
    try {
      console.log('SurveyReportService: Calling surveys.getAllResponsesData method');
      return new Promise((resolve, reject) => {
        Meteor.call('surveys.getAllResponsesData', (error: Meteor.Error | undefined, result: any) => {
          if (error) {
            console.error('Error fetching survey report data:', error);
            reject(error);
          } else {
            console.log('SurveyReportService: Received response from surveys.getAllResponsesData');
            console.log('Report data structure:', {
              reportTitle: result.reportTitle,
              totalRespondents: result.totalRespondents,
              parentTagsCount: result.parentTags ? result.parentTags.length : 0
            });
            
            // Check if we have parent tags
            if (result.parentTags && result.parentTags.length > 0) {
              console.log('First parent tag:', result.parentTags[0].name);
              console.log('Child tags count:', result.parentTags[0].childTags ? result.parentTags[0].childTags.length : 0);
              
              // Check if we have child tags
              if (result.parentTags[0].childTags && result.parentTags[0].childTags.length > 0) {
                console.log('First child tag:', result.parentTags[0].childTags[0].name);
                console.log('Questions count:', result.parentTags[0].childTags[0].questions ? result.parentTags[0].childTags[0].questions.length : 0);
                
                // Check if we have questions
                if (result.parentTags[0].childTags[0].questions && result.parentTags[0].childTags[0].questions.length > 0) {
                  const firstQuestion = result.parentTags[0].childTags[0].questions[0];
                  console.log('First question title:', firstQuestion.title);
                  console.log('First question options:', firstQuestion.options ? firstQuestion.options.length : 0);
                  console.log('First question option details:', firstQuestion.options ? JSON.stringify(firstQuestion.options[0]) : 'No options');
                  console.log('First question categoryTags:', firstQuestion.categoryTags ? JSON.stringify(firstQuestion.categoryTags) : 'No category tags');
                } else {
                  console.log('WARNING: No questions found in the first child tag');
                }
              } else {
                console.log('WARNING: No child tags found in the first parent tag');
              }
              
              // Log all parent tags structure
              result.parentTags.forEach((parentTag: any, i: number) => {
                console.log(`Parent tag ${i+1}: ${parentTag.name}, child tags: ${parentTag.childTags?.length || 0}`);
                
                if (parentTag.childTags?.length > 0) {
                  parentTag.childTags.forEach((childTag: any, j: number) => {
                    console.log(`  Child tag ${j+1}: ${childTag.name}, questions: ${childTag.questions?.length || 0}`);
                  });
                }
              });
            } else {
              console.log('WARNING: No parent tags found in the report data');
            }
            
            // Always use the real data from the server
            console.log('Using real data from the server');
            resolve(result);
          }
        });
      });
    } catch (error: unknown) {
      console.error('Error in getAllResponsesData:', error);
      throw error;
    }
  }
}
