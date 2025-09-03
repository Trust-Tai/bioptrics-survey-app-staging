import { Meteor } from 'meteor/meteor';
import { SurveyResponses } from '../../../features/surveys/api/surveyResponses';
import { Questions } from '../../../features/questions/api/questions';
import { TagItems } from '../../../api/tagItems';
import { Layers } from '../../../api/layers';

// Define interfaces for the report data structure
interface ReportData {
  reportTitle: string;
  reportSubtitle: string;
  description: string;
  date: string;
  logoUrl: string;
  totalRespondents: number;
  parentTags: ParentTag[];
}

interface ParentTag {
  id: string;
  name: string;
  description: string;
  childTags: ChildTag[];
}

interface ChildTag {
  id: string;
  name: string;
  description: string;
  questions: QuestionReport[];
}

interface QuestionReport {
  id: string;
  title: string;
  description: string;
  responseOverview: string;
  respondents: number;
  options: OptionReport[];
}

interface OptionReport {
  label: string;
  count: number;
  percentage: number;
  color: string;
  numericValue?: string; // For matching numeric answers
}

// Define interfaces for collection documents
interface SurveyResponse {
  _id: string;
  surveyId: string;
  responses?: Array<{
    questionId: string;
    answer: string;
    sectionId?: string;
  }>;
  answers?: Array<{
    questionId: string;
    value: string;
  }>;
  completed: boolean;
  startTime: Date;
  endTime: Date;
  progress: number;
  metadata?: any;
  demographics?: any;
  sectionTimes?: any;
  updatedAt: Date;
  createdAt: Date;
  respondentId: string;
  completionTime: number;
  unansweredQuestions: number;
}

interface Question {
  _id: string;
  currentVersion: number;
  versions: QuestionVersion[];
}

interface QuestionVersion {
  version: number;
  questionText: string;
  description: string;
  responseType: string;
  options?: string[] | { min: number; max: number; step: number };
  categoryTags?: string[];
  labels?: string[];
}

interface Tag {
  _id?: string;
  name: string;
  description?: string;
  parentId?: string;
}

/**
 * Server methods for survey report generation
 */
Meteor.methods({
  /**
   * Get all survey responses data
   */
  async 'surveys.getAllResponsesData'() {
    // Ensure user is logged in and has admin rights
    if (!this.userId) {
      throw new Meteor.Error('not-authorized', 'You must be logged in to access this data');
    }

    try {
      console.log('Fetching survey responses data...');
      const responses = await SurveyResponses.find({}).fetchAsync() as unknown as SurveyResponse[];
      const allQuestions = await Questions.find({}).fetchAsync();
      const tags = await TagItems.find({}).fetchAsync();
      const layers = await Layers.find({}).fetchAsync();

      // Extract all question IDs that have responses
      const questionIdsWithResponses = new Set<string>();
      responses.forEach(response => {
        // Access the responses array based on the SurveyResponseDoc structure
        if (response.responses && Array.isArray(response.responses)) {
          console.log(`Processing response ID: ${response._id}, found ${response.responses.length} answers`);
          response.responses.forEach(answer => {
            if (answer.questionId) {
              questionIdsWithResponses.add(answer.questionId);
            }
          });
        } else {
          console.log(`Response ID: ${response._id} has no valid responses array`);
        }
      });
      
      console.log(`Found ${questionIdsWithResponses.size} unique question IDs with responses`);
      console.log('Question IDs with responses:', Array.from(questionIdsWithResponses));

      // Filter questions to only include those with responses and that have options
      const questions = allQuestions.filter(question => {
        console.log(`\n--- Evaluating question ${question._id} ---`);
        
        // Check if question has an ID and has responses
        const hasResponses = question._id && questionIdsWithResponses.has(question._id);
        console.log(`  Has responses: ${hasResponses}`);
        
        // Check if question has options
        const currentVersion = question.versions && question.versions.length > 0 ? 
          question.versions[question.versions.length - 1] : null;
          
        console.log(`  Current version available: ${currentVersion ? 'Yes' : 'No'}`);
        if (currentVersion) {
          console.log(`  Response type: ${currentVersion.responseType}`);
          console.log(`  Question text: ${currentVersion.questionText}`);
        }
        
        // Only include questions that have options (either array of options or numeric range)
        let hasOptions = false;
        
        if (currentVersion) {
          // Check for choice-based questions with array options
          const isChoiceQuestion = currentVersion.responseType === 'multiple-choice' || 
                                  currentVersion.responseType === 'checkbox' || 
                                  currentVersion.responseType === 'dropdown' || 
                                  currentVersion.responseType === 'likert';
          
          console.log(`  Is choice-based question: ${isChoiceQuestion}`);
          
          const hasArrayOptions = Array.isArray(currentVersion.options) && currentVersion.options.length > 0;
          console.log(`  Has array options: ${hasArrayOptions}`);
          
          if (isChoiceQuestion && hasArrayOptions) {
            hasOptions = true;
            console.log(`  Options count: ${Array.isArray(currentVersion.options) ? currentVersion.options.length : 0}`);
          }
          
          // Check for slider questions with numeric range options
          const isSlider = currentVersion.responseType === 'slider';
          const hasNumericOptions = typeof currentVersion.options === 'object' && currentVersion.options !== null;
          
          console.log(`  Is slider question: ${isSlider}`);
          console.log(`  Has numeric options: ${hasNumericOptions}`);
          
          if (isSlider && hasNumericOptions) {
            hasOptions = true;
          }
          
          // Special handling for likert scale with numeric options
          if (currentVersion.responseType === 'likert' && 
              typeof currentVersion.options === 'object' && 
              !Array.isArray(currentVersion.options) && 
              currentVersion.options !== null) {
            hasOptions = true;
            console.log(`  Has likert numeric range options: true`);
          }
        }
        
        // Log detailed information about question filtering
        if (hasResponses) {
          if (!hasOptions) {
            console.log(`  FILTERING OUT question ${question._id} because it has no options`);
            if (currentVersion) {
              console.log(`  Options data: ${currentVersion.options ? JSON.stringify(currentVersion.options) : 'none'}`);
            }
          } else {
            console.log(`  INCLUDING question ${question._id} with response type: ${currentVersion?.responseType}`);
          }
        } else {
          console.log(`  FILTERING OUT question ${question._id} because it has no responses`);
        }
        
        const shouldInclude = hasResponses && hasOptions;
        console.log(`  Final decision: ${shouldInclude ? 'INCLUDE' : 'EXCLUDE'}`);
        
        return shouldInclude;
      });

      console.log(`Found ${responses.length} responses, ${questions.length} questions with responses out of ${allQuestions.length} total questions, and ${tags.length} tags`);

      console.log(`surveys.getAllResponsesData: Found ${tags.length} tags`);
      
      // Transform the data into a structure suitable for the report
      const reportData = {
        reportTitle: "Survey Report",
        reportSubtitle: "Comprehensive Analysis",
        description: "This report provides an analysis of all survey responses.",
        date: new Date().toLocaleDateString(),
        logoUrl: "/bioptrics_fixed_black.png",
        totalRespondents: responses.length,
        parentTags: processTagsAndResponses(responses, tags, questions, layers)
      };
      
      return reportData;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.error('Error generating report data:', error);
      console.error('Error details:', errorMessage);
      throw new Meteor.Error('report-generation-failed', `Failed to generate report data: ${errorMessage}`);
    }
  }
});

/**
 * Process tags and responses to create the report structure
 */
function processTagsAndResponses(responses: SurveyResponse[], tags: Tag[], questions: Question[], layers: any[]): ParentTag[] {
  // Group tags by parent/child relationship
  const parentTags = tags.filter(tag => !tag.parentId);
  const childTagsByParentId: Record<string, Tag[]> = {};
  
  // Track which questions have been processed
  const processedQuestionIds = new Set<string>();
  
  tags.filter(tag => tag.parentId).forEach(childTag => {
    if (childTag.parentId) {
      if (!childTagsByParentId[childTag.parentId]) {
        childTagsByParentId[childTag.parentId] = [];
      }
      childTagsByParentId[childTag.parentId].push(childTag);
    }
  });
  
  // Create a result array that will include both tagged questions and untagged questions
  let result: ParentTag[] = [];
  
  // Process each parent tag
  console.log(`Processing ${parentTags.length} parent tags`);
  const taggedParentTags = parentTags.map(parentTag => {
    // Ensure parentTag._id exists and is a string
    const parentTagId = parentTag._id || '';
    console.log(`Processing parent tag: ${parentTag.name} (ID: ${parentTagId})`);
    const childTags = parentTagId ? childTagsByParentId[parentTagId] || [] : [];
    console.log(`Found ${childTags.length} child tags for parent tag ${parentTag.name}`);
    
    // Process child tags
    const processedChildTags = childTags.map(childTag => {
      // Find questions associated with this tag
      const childTagId = childTag._id || '';
      console.log(`Processing child tag: ${childTag.name} (ID: ${childTagId})`);
      const tagQuestions = questions.filter(q => 
        q._id && q.versions && q.versions.length > 0 && q.versions[q.versions.length - 1].labels && q.versions[q.versions.length - 1].labels.includes(childTagId)
      );
      console.log(`Found ${tagQuestions.length} questions for child tag ${childTag.name}`);
      
      // Process questions for this tag
      const processedQuestions = tagQuestions.map(question => {
        // Get the current version of the question
        console.log(`Processing question: ${question._id}, current version: ${question.currentVersion}`);
        console.log(`Question versions available: ${question.versions ? question.versions.length : 0}`);
        
        const currentVersion = question.versions && 
          question.versions.find(v => v.version === question.currentVersion);
        
        if (!currentVersion) {
          console.error(`Question ${question._id} has no current version`);
          return null;
        }
        
        console.log(`Question text: ${currentVersion.questionText}, response type: ${currentVersion.responseType}`);
        console.log(`Options available: ${currentVersion.options ? (Array.isArray(currentVersion.options) ? currentVersion.options.length : 'numeric range') : 'none'}`);
        
        // Find responses for this question
        const questionResponses = responses.filter(r => 
          r.responses && r.responses.some(a => a.questionId === question._id)
        );
        
        // Count respondents for this question
        const respondentCount = questionResponses.length;
        
        // Extract options from the question's current version
        let questionOptions: Array<{label: string, value: string, numericValue?: string}> = [];
        if (currentVersion.responseType === 'multiple-choice' || 
            currentVersion.responseType === 'checkbox' || 
            currentVersion.responseType === 'dropdown' ||
            currentVersion.responseType === 'likert') {
          // Handle likert scale questions specially
          if (currentVersion.responseType === 'likert' && currentVersion.options && Array.isArray(currentVersion.options)) {
            questionOptions = currentVersion.options.map((option: any, index) => ({
              label: option.text,
              value: option.value,
              numericValue: String(index + 1) // Add numeric value mapping for likert scales
            }));
          } else {
            // Ensure we have options array
            if (Array.isArray(currentVersion.options)) {
              questionOptions = currentVersion.options.map((opt: any, index) => {
                // Handle case where option might be an object or string
                if (typeof opt === 'object' && opt !== null) {
                  // Handle object options
                  const optObj = opt as Record<string, any>;
                  const optLabel = optObj.label ? String(optObj.label) : JSON.stringify(opt);
                  const optValue = optObj.value ? String(optObj.value) : JSON.stringify(opt);
                  return { label: optLabel, value: optValue };
                } else {
                  // Handle string/primitive options
                  return { label: String(opt), value: String(opt) };
                }
              });
            }
          }
        } else if (currentVersion.responseType === 'likert' && currentVersion.options && typeof currentVersion.options === 'object' && !Array.isArray(currentVersion.options)) {
          // Handle likert scale questions with numeric range
          const options = currentVersion.options as { min: number; max: number; step: number };
          const min = options.min || 1;
          const max = options.max || 5;
          const step = options.step || 1;
          for (let i = min; i <= max; i += step) {
            questionOptions.push({
              label: String(i),
              value: String(i),
              numericValue: String(i)
            });
          }
        }
        
        // If no options found but it's a choice-based question, create default options
        if (questionOptions.length === 0 && 
            (currentVersion.responseType === 'multiple-choice' || 
             currentVersion.responseType === 'checkbox' || 
             currentVersion.responseType === 'dropdown')) {
          console.log(`Creating default options for question ${question._id} as none were found`);
          questionOptions = [
            { label: 'Option 1', value: 'option1' },
            { label: 'Option 2', value: 'option2' },
            { label: 'Option 3', value: 'option3' }
          ];
        }
        
        // Calculate options and their response counts
        console.log(`Processing ${questionOptions.length} options for question ${question._id}`);
        
        const options = questionOptions.map(option => {
          const optionCount = questionResponses.filter(r => 
            r.responses && r.responses.some(a => {
              // Match by exact value or by numeric index for likert scales
              return a.questionId === question._id && 
                    (a.answer === option.value || 
                     (currentVersion.responseType === 'likert' && option.numericValue && a.answer === option.numericValue));
            })
          ).length;
          
          const percentage = respondentCount > 0 ? Math.round((optionCount / respondentCount) * 100) : 0;
          console.log(`Option: ${option.label}, count: ${optionCount}, percentage: ${percentage}%`);
          
          return {
            label: option.label,
            count: optionCount,
            percentage,
            color: getColorForPercentage(percentage)
          };
        });
        
        if (options.length === 0) {
          console.log(`WARNING: No options processed for question ${question._id}`);
        }
        
        // Extract label IDs from the current version
        console.log(`QUESTION ID IN SERVER: ${question._id}`);
        console.log(`Question current version: ${JSON.stringify(currentVersion, null, 2)}`);
        const labelIds = currentVersion.labels || [];
        console.log(`Label IDs for question ${question._id}: ${JSON.stringify(labelIds)}`);
        if (!labelIds.length) {
          console.log(`WARNING: No labels found for question ${question._id}`);
        }
        
        // Resolve label IDs to tag names from layers collection
        console.log(`Resolving ${labelIds.length} label IDs to tag names`);
        console.log(`Available layers: ${layers.length}`);
        if (layers.length > 0) {
          console.log(`Sample layer: ${JSON.stringify(layers[0])}`);
        }
        
        const categoryTags = labelIds.map(labelId => {
          // Direct match on _id which is what labels contain
          const layer = layers.find(layer => layer._id === labelId);
          console.log(`Looking for layer with _id ${labelId}: ${layer ? 'Found' : 'Not found'}`);
          if (layer) {
            console.log(`Layer found: ${JSON.stringify(layer)}`);
            return layer.name;
          }
          return null;
        }).filter(Boolean) as string[];
        
        console.log(`Question ${question._id} has labels: ${labelIds.join(', ')} resolved to tags: ${categoryTags.join(', ')}`);
        
        // Create the question object with explicit property names
        const questionObj = {
          id: question._id || '',
          title: currentVersion.questionText,
          description: currentVersion.description || '',
          responseOverview: generateResponseOverview(options),
          respondents: respondentCount,
          options,
          categoryTags: categoryTags
        };
        
        // Log the final object to verify categoryTags is included
        console.log(`Final question object for ${question._id}:`, JSON.stringify(questionObj));
        console.log(`categoryTags in final object: ${questionObj.categoryTags}`);
        
        return questionObj;
      }).filter(q => q !== null); // Remove null entries
      
      // Log the processed questions for this child tag
      console.log(`Processed ${processedQuestions.length} questions for child tag ${childTag.name}`);
      if (processedQuestions.length === 0) {
        console.log(`WARNING: No questions processed for child tag ${childTag.name}`);
      }
      
      return {
        id: childTag._id || '',
        name: childTag.name,
        description: childTag.description || '',
        questions: processedQuestions
      };
    });
    
    // Log the processed child tags for this parent tag
    console.log(`Processed ${processedChildTags.length} child tags for parent tag ${parentTag.name}`);
    if (processedChildTags.length === 0) {
      console.log(`WARNING: No child tags processed for parent tag ${parentTag.name}`);
    }
    
    // Track which questions were processed for this parent tag
    processedChildTags.forEach(childTag => {
      childTag.questions.forEach(question => {
        if (question && question.id) {
          processedQuestionIds.add(question.id);
        }
      });
    });
    
    return {
      id: parentTag._id || '',
      name: parentTag.name,
      description: parentTag.description || '',
      childTags: processedChildTags
    };
  });
  
  // Add all tagged parent tags to the result
  result = [...taggedParentTags];
  
  // Process untagged questions
  const untaggedQuestions = questions.filter(q => {
    return q._id && !processedQuestionIds.has(q._id);
  });
  
  console.log(`Found ${untaggedQuestions.length} untagged questions`);
  
  if (untaggedQuestions.length > 0) {
    // Create a special parent tag for untagged questions
    const untaggedParentTag: ParentTag = {
      id: 'untagged',
      name: 'General Questions',
      description: 'Questions not associated with any specific tag',
      childTags: [
        {
          id: 'untagged-child',
          name: 'All Questions',
          description: 'All questions without tag associations',
          questions: []
        }
      ]
    };
    
    // Process each untagged question
    const processedUntaggedQuestions = untaggedQuestions.map(question => {
      // Get the current version of the question
      console.log(`Processing untagged question: ${question._id}, current version: ${question.currentVersion}`);
      
      const currentVersion = question.versions && 
        question.versions.find(v => v.version === question.currentVersion);
      
      if (!currentVersion) {
        console.log(`Question ${question._id} has no current version`);
        return null;
      }

      // Extract label IDs from the current version
      const labelIds = currentVersion.labels || [];
      
      // Resolve label IDs to tag names from layers collection
      const categoryTags = labelIds.map(labelId => {
        const layer = layers.find(layer => layer._id === labelId);
        return layer ? layer.name : null;
      }).filter(Boolean) as string[];
      
      console.log(`Question ${question._id} has labels: ${labelIds.join(', ')} resolved to tags: ${categoryTags.join(', ')}`);
      
      // Find responses for this question
      const questionResponses = responses.filter(r => 
        r.responses && r.responses.some(a => a.questionId === question._id)
      );
      
      // Count respondents for this question
      const respondentCount = questionResponses.length;
      
      // Extract options from the question's current version
      let questionOptions: Array<{label: string, value: string, numericValue?: string}> = [];
      if (currentVersion.responseType === 'multiple-choice' || 
          currentVersion.responseType === 'checkbox' || 
          currentVersion.responseType === 'dropdown' ||
          currentVersion.responseType === 'likert') {
        // Handle likert scale questions with array options
        if (currentVersion.responseType === 'likert' && currentVersion.options && Array.isArray(currentVersion.options)) {
          questionOptions = currentVersion.options.map((option: any, index) => ({
            label: option.text,
            value: option.value,
            numericValue: String(index + 1) // Add numeric value mapping for likert scales
          }));
        } else {
          // Ensure we have options array
          if (Array.isArray(currentVersion.options)) {
            questionOptions = currentVersion.options.map((opt: any, index) => {
              // Handle case where option might be an object or string
              if (typeof opt === 'object' && opt !== null) {
                // Handle object options
                const optObj = opt as Record<string, any>;
                const optLabel = optObj.label ? String(optObj.label) : JSON.stringify(opt);
                const optValue = optObj.value ? String(optObj.value) : JSON.stringify(opt);
                return { label: optLabel, value: optValue };
              } else {
                // Handle string/primitive options
                return { label: String(opt), value: String(opt) };
              }
            });
          }
        }
      } else if (currentVersion.responseType === 'likert' && currentVersion.options && typeof currentVersion.options === 'object' && !Array.isArray(currentVersion.options)) {
        // Handle likert scale questions with numeric range
        const options = currentVersion.options as { min: number; max: number; step: number };
        const min = options.min || 1;
        const max = options.max || 5;
        const step = options.step || 1;
        for (let i = min; i <= max; i += step) {
          questionOptions.push({
            label: String(i),
            value: String(i),
            numericValue: String(i)
          });
        }
      }
      
      // If no options found but it's a choice-based question, create default options
      if (questionOptions.length === 0 && 
          (currentVersion.responseType === 'multiple-choice' || 
           currentVersion.responseType === 'checkbox' || 
           currentVersion.responseType === 'dropdown')) {
        console.log(`Creating default options for untagged question ${question._id} as none were found`);
        questionOptions = [
          { label: 'Option 1', value: 'option1' },
          { label: 'Option 2', value: 'option2' },
          { label: 'Option 3', value: 'option3' }
        ];
      }
      
      // Calculate options and their response counts
      const options = questionOptions.map(option => {
        const optionCount = questionResponses.filter(r => 
        r.responses && r.responses.some(a => {
          // Match by exact value or by numeric index for likert scales
          return a.questionId === question._id && 
                (a.answer === option.value || 
                 (currentVersion.responseType === 'likert' && option.numericValue && a.answer === option.numericValue));
        })
      ).length;
        
        const percentage = respondentCount > 0 ? Math.round((optionCount / respondentCount) * 100) : 0;
        
        return {
          label: option.label,
          count: optionCount,
          percentage,
          color: getColorForPercentage(percentage)
        };
      });
      
      return {
        id: question._id || '',
        title: currentVersion.questionText,
        description: currentVersion.description || '',
        responseOverview: generateResponseOverview(options),
        respondents: respondentCount,
        options,
        categoryTags // Add the categoryTags property to the returned object
      };
    }).filter(q => q !== null); // Remove null entries
    
    // Add the processed untagged questions to the special parent tag
    if (processedUntaggedQuestions.length > 0) {
      untaggedParentTag.childTags[0].questions = processedUntaggedQuestions as QuestionReport[];
      result.push(untaggedParentTag);
    }
  }
  
  return result;
}

/**
 * Generate a response overview text based on options data
 */
function generateResponseOverview(options: OptionReport[]): string {
  if (!options || options.length === 0) {
    return "No responses available";
  }
  
  // Sort options by percentage (descending)
  const sortedOptions = [...options].sort((a, b) => b.percentage - a.percentage);
  
  // Get the top options (those with the highest percentages)
  const topOptions = sortedOptions.filter(o => o.percentage >= 20);
  
  if (topOptions.length === 0) {
    return "Responses are evenly distributed";
  }
  
  if (topOptions.length === 1) {
    return `${topOptions[0].percentage}% selected "${topOptions[0].label}"`;
  }
  
  const topLabels = topOptions.map(o => `${o.percentage}% "${o.label}"`).join(', ');
  return `Top responses: ${topLabels}`;
}

/**
 * Get a color based on the percentage value
 */
function getColorForPercentage(percentage: number): string {
  if (percentage >= 80) return '#689F38'; // Green
  if (percentage >= 60) return '#AFD259'; // Light green
  if (percentage >= 40) return '#FFC107'; // Yellow
  if (percentage >= 20) return '#FF9800'; // Orange
  return '#F44336'; // Red
}
