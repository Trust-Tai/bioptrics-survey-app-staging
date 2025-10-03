import { AnalyticsQuestion } from './RankedPdfHelpers';
import { rankQuestionsBySection, rankQuestionsBySurvey } from './RankedPdfHelpers';
import { SurveyReportData } from '/imports/ui/admin/SurveyReportPDF';
import { ExportQuestionsToPDFOptions } from './AllAnalyticsSurveyQuestionPdf';

// Function to generate ranked PDF for a single survey
export const generateRankedPDF = (
  analyticsQuestions: AnalyticsQuestion[],
  surveyData: any,
  options?: ExportQuestionsToPDFOptions,
  processQuestions: (questions: AnalyticsQuestion[], reportData: SurveyReportData) => any[],
  generatePDF: (reportData: SurveyReportData) => void,
  generatePDFWithSections: (analyticsQuestions: AnalyticsQuestion[], surveyData: any, options?: ExportQuestionsToPDFOptions) => void
): void => {
  try {
    console.log('Generating ranked PDF for single survey');
    
    // Extract sections from survey data
    const surveySections = surveyData.surveySections || [];
    const sectionQuestions = surveyData.sectionQuestions || [];
    
    // Use the ranking helper to rank questions by section
    const rankedQuestionsBySection = rankQuestionsBySection(analyticsQuestions, surveyData);
    
    // Create the report data structure with dynamic sections
    const reportData: SurveyReportData = {
      reportTitle: 'Survey Questions Analysis (Ranked)',
      reportSubtitle: options?.surveyTitle || 'Response Data Visualization',
      description: options?.surveyDescription || 'Questions are ranked by positive response rates within each section',
      date: new Date().toLocaleDateString(),
      logoUrl: '/bioptrics_fixed_black.png',
      totalRespondents: 0, // Will be calculated below
      parentTags: []
    };
    
    // Create parent tags for each section
    surveySections.forEach((section: any) => {
      if (section.id && rankedQuestionsBySection[section.id]) {
        const sectionRankedQuestions = rankedQuestionsBySection[section.id];
        
        // Skip empty sections
        if (!sectionRankedQuestions.likert.length && 
            !sectionRankedQuestions.radio.length && 
            !sectionRankedQuestions.text.length) {
          return;
        }
        
        // Create child tags for each question type
        const childTags = [];
        
        // Add Likert questions if any
        if (sectionRankedQuestions.likert.length > 0) {
          const likertProcessed = processQuestions(sectionRankedQuestions.likert, reportData);
          childTags.push({
            id: `${section.id}-likert`,
            name: 'Likert Scale Questions',
            description: 'Ranked by positive response rate (Agree % + Strongly Agree %)',
            questions: likertProcessed
          });
        }
        
        // Add Radio questions if any
        if (sectionRankedQuestions.radio.length > 0) {
          const radioProcessed = processQuestions(sectionRankedQuestions.radio, reportData);
          childTags.push({
            id: `${section.id}-radio`,
            name: 'Radio/Choice Questions',
            description: 'Ranked by highest selected option percentage',
            questions: radioProcessed
          });
        }
        
        // Add Text questions if any
        if (sectionRankedQuestions.text.length > 0) {
          const textProcessed = processQuestions(sectionRankedQuestions.text, reportData);
          childTags.push({
            id: `${section.id}-text`,
            name: 'Text/Freeform Questions',
            description: 'Latest responses from participants',
            questions: textProcessed
          });
        }
        
        // Format section name
        let sectionName = section.name ? "Ranked : "+section.name : 'Section';
        
        reportData.parentTags.push({
          id: section.id,
          name: sectionName,
          description: section.description || 'Survey section with ranked questions',
          childTags: childTags
        });
      }
    });
    
    // If no sections were created, create a default section
    if (reportData.parentTags.length === 0) {
      // Categorize all questions
      const { likertQuestions, radioQuestions, textQuestions } = 
        categorizeAndScoreQuestions(analyticsQuestions);
      
      const childTags = [];
      
      // Add Likert questions if any
      if (likertQuestions.length > 0) {
        const likertProcessed = processQuestions(likertQuestions, reportData);
        childTags.push({
          id: 'default-likert',
          name: 'Likert Scale Questions',
          description: 'Ranked by positive response rate (Agree % + Strongly Agree %)',
          questions: likertProcessed
        });
      }
      
      // Add Radio questions if any
      if (radioQuestions.length > 0) {
        const radioProcessed = processQuestions(radioQuestions, reportData);
        childTags.push({
          id: 'default-radio',
          name: 'Radio/Choice Questions',
          description: 'Ranked by highest selected option percentage',
          questions: radioProcessed
        });
      }
      
      // Add Text questions if any
      if (textQuestions.length > 0) {
        const textProcessed = processQuestions(textQuestions, reportData);
        childTags.push({
          id: 'default-text',
          name: 'Text/Freeform Questions',
          description: 'Latest responses from participants',
          questions: textProcessed
        });
      }
      
      reportData.parentTags.push({
        id: 'survey-questions',
        name: 'Ranked Survey Questions',
        description: 'Questions ranked by response rates',
        childTags: childTags
      });
    }
    
    // Generate the PDF with the structured data
    generatePDF(reportData);
  } catch (error) {
    console.error('Error in generateRankedPDF:', error);
    // Fall back to the standard implementation
    generatePDFWithSections(analyticsQuestions, surveyData, options);
  }
};

// Function to generate ranked PDF for multiple surveys
export const generateRankedPDFMultipleSurveys = (
  analyticsQuestions: AnalyticsQuestion[],
  combinedSurveyData: any,
  options?: ExportQuestionsToPDFOptions,
  processQuestions: (questions: AnalyticsQuestion[], reportData: SurveyReportData) => any[],
  generatePDF: (reportData: SurveyReportData) => void,
  generatePDFWithSections: (analyticsQuestions: AnalyticsQuestion[], surveyData: any, options?: ExportQuestionsToPDFOptions) => void
): void => {
  try {
    console.log('Generating ranked PDF for multiple surveys');
    
    // Group questions by survey ID
    const questionsBySurvey: Record<string, AnalyticsQuestion[]> = {};
    
    analyticsQuestions.forEach(question => {
      const surveyId = (question as any).surveyId || 'unknown';
      if (!questionsBySurvey[surveyId]) {
        questionsBySurvey[surveyId] = [];
      }
      questionsBySurvey[surveyId].push(question);
    });
    
    // Create the report data structure
    const reportData: SurveyReportData = {
      reportTitle: 'Multiple Surveys Analysis (Ranked)',
      reportSubtitle: options?.surveyTitle || 'Response Data Visualization',
      description: options?.surveyDescription || `Export of ${Object.keys(questionsBySurvey).length} surveys with questions ranked by response rates`,
      date: new Date().toLocaleDateString(),
      logoUrl: '/bioptrics_fixed_black.png',
      totalRespondents: 0, // Will be calculated below
      parentTags: []
    };
    
    // Process each survey as a parent tag
    Object.entries(questionsBySurvey).forEach(([surveyId, surveyQuestions]) => {
      // Find the survey section in combinedSurveyData
      const surveySection = combinedSurveyData.surveySections.find(
        (s: any) => s.id === `survey-${surveyId}` || s.id === surveyId
      );
      
      if (surveySection) {
        // Categorize and score questions for this survey
        const { likertQuestions, radioQuestions, textQuestions } = 
          categorizeAndScoreQuestions(surveyQuestions);
        
        const childTags = [];
        
        // Add Likert questions if any
        if (likertQuestions.length > 0) {
          const likertProcessed = processQuestions(likertQuestions, reportData);
          childTags.push({
            id: `${surveyId}-likert`,
            name: 'Likert Scale Questions',
            description: 'Ranked by positive response rate (Agree % + Strongly Agree %)',
            questions: likertProcessed
          });
        }
        
        // Add Radio questions if any
        if (radioQuestions.length > 0) {
          const radioProcessed = processQuestions(radioQuestions, reportData);
          childTags.push({
            id: `${surveyId}-radio`,
            name: 'Radio/Choice Questions',
            description: 'Ranked by highest selected option percentage',
            questions: radioProcessed
          });
        }
        
        // Add Text questions if any
        if (textQuestions.length > 0) {
          const textProcessed = processQuestions(textQuestions, reportData);
          childTags.push({
            id: `${surveyId}-text`,
            name: 'Text/Freeform Questions',
            description: 'Latest responses from participants',
            questions: textProcessed
          });
        }
        
        // Add the survey as a parent tag
        reportData.parentTags.push({
          id: surveyId,
          name: `Ranked: ${surveySection.name || `Survey ${surveyId}`}`,
          description: surveySection.description || 'Survey with ranked questions',
          childTags: childTags
        });
      }
    });
    
    // If no surveys were processed, create a default section
    if (reportData.parentTags.length === 0) {
      // Categorize all questions
      const { likertQuestions, radioQuestions, textQuestions } = 
        categorizeAndScoreQuestions(analyticsQuestions);
      
      const childTags = [];
      
      // Add Likert questions if any
      if (likertQuestions.length > 0) {
        const likertProcessed = processQuestions(likertQuestions, reportData);
        childTags.push({
          id: 'default-likert',
          name: 'Likert Scale Questions',
          description: 'Ranked by positive response rate (Agree % + Strongly Agree %)',
          questions: likertProcessed
        });
      }
      
      // Add Radio questions if any
      if (radioQuestions.length > 0) {
        const radioProcessed = processQuestions(radioQuestions, reportData);
        childTags.push({
          id: 'default-radio',
          name: 'Radio/Choice Questions',
          description: 'Ranked by highest selected option percentage',
          questions: radioProcessed
        });
      }
      
      // Add Text questions if any
      if (textQuestions.length > 0) {
        const textProcessed = processQuestions(textQuestions, reportData);
        childTags.push({
          id: 'default-text',
          name: 'Text/Freeform Questions',
          description: 'Latest responses from participants',
          questions: textProcessed
        });
      }
      
      reportData.parentTags.push({
        id: 'all-surveys',
        name: 'All Surveys (Ranked)',
        description: 'Combined questions from all surveys, ranked by response rates',
        childTags: childTags
      });
    }
    
    // Generate the PDF with the structured data
    generatePDF(reportData);
  } catch (error) {
    console.error('Error in generateRankedPDFMultipleSurveys:', error);
    // Fall back to the standard implementation
    generatePDFWithSections(analyticsQuestions, combinedSurveyData, options);
  }
};

// Helper function to categorize and score questions
export const categorizeAndScoreQuestions = (questions: AnalyticsQuestion[]) => {
  const likertQuestions: AnalyticsQuestion[] = [];
  const radioQuestions: AnalyticsQuestion[] = [];
  const textQuestions: AnalyticsQuestion[] = [];

  questions.forEach(question => {
    if (['text', 'textarea', 'date'].includes(question.questionType)) {
      textQuestions.push(question);
    } else if (question.questionType === 'likert') {
      likertQuestions.push(question);
    } else {
      radioQuestions.push(question);
    }
  });

  // Sort likert questions by positive score (Agree + Strongly Agree)
  likertQuestions.sort((a, b) => {
    const aScore = (a.progress['Agree'] || 0) + (a.progress['Strongly Agree'] || 0);
    const bScore = (b.progress['Agree'] || 0) + (b.progress['Strongly Agree'] || 0);
    return bScore - aScore;
  });

  // Sort radio questions by highest option percentage
  radioQuestions.sort((a, b) => {
    const aMax = Math.max(...Object.values(a.progress).map(val => typeof val === 'number' ? val : 0));
    const bMax = Math.max(...Object.values(b.progress).map(val => typeof val === 'number' ? val : 0));
    return bMax - aMax;
  });

  return { likertQuestions, radioQuestions, textQuestions };
};
