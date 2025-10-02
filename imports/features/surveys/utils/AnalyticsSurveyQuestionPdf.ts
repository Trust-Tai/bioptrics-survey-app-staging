import { generateSurveyReportPDF, SurveyReportData as BaseSurveyReportData } from '/imports/ui/admin/SurveyReportPDF';
import { rankQuestionsBySection, RankedQuestion, AnalyticsQuestion } from './RankedPdfHelpers';

// Extended interface for SurveyReportData that includes latestResponses
interface SurveyReportData extends BaseSurveyReportData {
  parentTags: Array<{
    id: string;
    name: string;
    description: string;
    childTags: Array<{
      id: string;
      name: string;
      description: string;
      questions: Array<{
        id: string;
        title: string;
        description: string;
        responseOverview: string;
        respondents: number;
        categoryTags?: string[];
        options: Array<{
          label: string;
          count: number;
          percentage: number;
          color: string;
        }>;
        // Add latestResponses for text questions
        latestResponses?: Array<{
          answer: string;
          date: Date | string;
        }>;
      }>;
    }>;
  }>;
}

// Interface for processed question in PDF report - different from AnalyticsQuestion
interface ProcessedQuestion {
  id: string;
  title: string;
  description: string;
  responseOverview: string;
  respondents: number;
  categoryTags?: string[];
  options: Array<{
    label: string;
    count: number;
    percentage: number;
    color: string;
  }>;
  latestResponses?: Array<{
    answer: string;
    date: Date | string;
  }>;
}

// Function to get color for option
const getColorForOption = (optionName: string): string => {
  // Base color mapping for common response categories
  const baseColorMap: Record<string, string> = {
    // Colors matching the screenshot exactly
    'Strongly Disagree': '#F05454', // Red
    'Disagree': '#F9C89B', // Light Orange/Peach
    'Neither Agree nor Disagree': '#C7CDD8', // Gray
    'Neutral': '#C7CDD8', // Gray (same as Neither Agree nor Disagree)
    'Agree': '#A8F0C6', // Light Green
    'Strongly Agree': '#27D67B', // Green
  };

  // First check if we have a predefined color
  if (baseColorMap[optionName]) {
    return baseColorMap[optionName];
  }
  
  // For custom options, hash the name to get a consistent color
  const hashCode = (str: string): number => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash |= 0; // Convert to 32bit integer
    }
    return Math.abs(hash);
  };
  
  // Predefined colors for dynamic options
  const predefinedColors = [
    '#ef4444', // Red
    '#f97316', // Orange
    '#f59e0b', // Amber
    '#6b7280', // Gray
    '#3b82f6', // Blue
    '#10b981', // Green
    '#059669', // Dark Green
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#0891b2', // Cyan
  ];
  
  // Use the hash to select a color from our predefined list
  const colorIndex = hashCode(optionName) % predefinedColors.length;
  return predefinedColors[colorIndex];
};

// Function to export questions data as PDF
// Custom CSS styles to match the Question tab design
const customPdfStyles = `
  /* Page break styling */
  @page {
    margin: 0.5in;
  }
  
  body {
    font-family: Arial, sans-serif;
    line-height: 1.5;
    color: #333;
  }
  
  .page-break {
    page-break-before: always;
  }
  
  .cover-page {
    page-break-after: always;
  }
  
  /* Question card styling */
  .question {
    background-color: white;
    border-radius: 8px;
    border: 1px solid #e2e8f0;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    padding: 24px;
    margin-bottom: 24px;
  }
  
  /* Question title styling */
  .question-title {
    font-size: 16px;
    font-weight: 500;
    color: #1e293b;
    margin-bottom: 16px;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
  }
  
  /* Question type badge styling */
  .question-type-badge {
    display: inline-block;
    margin-left: 10px;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 12px;
    font-weight: 500;
    background-color: #552a47;
    color: white;
  }
  
  /* Bar chart container styling */
  .chart-container {
    margin-top: 15px;
    margin-bottom: 15px;
    width: 100%;
  }
  
  /* Bar styling to exactly match the horizontal bar in Question tab */
  .bar-chart {
    display: flex;
    height: 40px;
    width: 100%;
    border-radius: 20px;
    overflow: hidden;
    margin-bottom: 16px;
    background-color: #f1f5f9;
  }
  
  .bar {
    height: 100%;
    background-color: var(--bar-color);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    min-width: 20px;
  }
  
  .percentage-label {
    font-size: 12px;
    color: white;
    font-weight: 500;
    text-shadow: 0 0 2px rgba(0,0,0,0.2);
    position: absolute;
  }
  
  .percentage-label.dark {
    color: #333;
  }
  
  /* Legend styling */
  .legend-container {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    margin-top: 8px;
  }
  
  .legend-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    color: #64748b;
  }
  
  .legend-color {
    width: 12px;
    height: 12px;
    border-radius: 50%;
    background-color: var(--legend-color);
  }
`;

export interface ExportQuestionsToPDFOptions {
  surveyTitle?: string;
  surveyDescription?: string;
  surveyId?: string; // Add surveyId to fetch complete survey data
  exportType?: 'standard' | 'ranked'; // Add export type option
}

export const exportQuestionsToPDF = (
  analyticsQuestions: AnalyticsQuestion[], 
  options?: ExportQuestionsToPDFOptions
): void => {
  try {
    // Debug logging for input data
    console.log('PDF Export - Input questions:', analyticsQuestions);
    console.log('PDF Export - Options:', options);
    
    const exportType = options?.exportType || 'standard';
    console.log('PDF Export Type:', exportType);
    
    // If surveyId is provided, fetch the complete survey data
    if (options?.surveyId) {
      // We'll use a Promise to handle the async Meteor call
      new Promise<void>((resolve) => {
        Meteor.call('surveys.getSurvey', options.surveyId, (error: any, surveyData: any) => {
          if (error) {
            console.error('Error fetching survey data:', error);
            // If there's an error, fall back to the original implementation
            generatePDFWithoutSections(analyticsQuestions, options);
            resolve();
          } else {
            console.log('Fetched survey data:', surveyData);
            // Generate PDF with sections based on export type
            if (exportType === 'ranked') {
              generatePDFWithRankedSections(analyticsQuestions, surveyData, options);
            } else {
              generatePDFWithSections(analyticsQuestions, surveyData, options);
            }
            resolve();
          }
        });
      });
    } else {
      // If no surveyId is provided, fall back to the original implementation
      generatePDFWithoutSections(analyticsQuestions, options);
    }
  } catch (error) {
    console.error('Error in exportQuestionsToPDF:', error);
  }
};

// Function to generate PDF with ranked sections
const generatePDFWithRankedSections = (
  analyticsQuestions: AnalyticsQuestion[],
  surveyData: any,
  options?: ExportQuestionsToPDFOptions
): void => {
  try {
    console.log('Generating PDF with ranked sections');
    
    // Extract sections from survey data
    const surveySections = surveyData.surveySections || [];
    
    console.log('Survey sections:', surveySections);
    
    // Rank questions by section
    const rankedQuestionsBySection = rankQuestionsBySection(analyticsQuestions, surveyData);
    console.log('Ranked questions by section:', rankedQuestionsBySection);
    
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
        const allSectionQuestions = [
          ...sectionRankedQuestions.likert,
          ...sectionRankedQuestions.radio,
          ...sectionRankedQuestions.text
        ];
        
        // Skip empty sections
        if (allSectionQuestions.length === 0) return;
        
        // Process all questions to calculate stats
        const processedQuestions = processQuestions(allSectionQuestions, reportData);
        
        // Create section tag
        let sectionName = '';
        if(section.name){sectionName = "Standard : "+section.name}else{sectionName = 'Section'};
        
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
        
        reportData.parentTags.push({
          id: section.id,
          name: sectionName,
          description: section.description || 'Survey section',
          childTags: childTags
        });
      }
    });
    
    // Add a section for questions not assigned to any section
    if (rankedQuestionsBySection['unsectioned']) {
      const unsectionedRankedQuestions = rankedQuestionsBySection['unsectioned'];
      const allUnsectionedQuestions = [
        ...unsectionedRankedQuestions.likert,
        ...unsectionedRankedQuestions.radio,
        ...unsectionedRankedQuestions.text
      ];
      
      // Skip if no unsectioned questions
      if (allUnsectionedQuestions.length > 0) {
        // Create child tags for each question type
        const childTags = [];
        
        // Add Likert questions if any
        if (unsectionedRankedQuestions.likert.length > 0) {
          const likertProcessed = processQuestions(unsectionedRankedQuestions.likert, reportData);
          childTags.push({
            id: 'unsectioned-likert',
            name: 'Likert Scale Questions',
            description: 'Ranked by positive response rate (Agree % + Strongly Agree %)',
            questions: likertProcessed
          });
        }
        
        // Add Radio questions if any
        if (unsectionedRankedQuestions.radio.length > 0) {
          const radioProcessed = processQuestions(unsectionedRankedQuestions.radio, reportData);
          childTags.push({
            id: 'unsectioned-radio',
            name: 'Radio/Choice Questions',
            description: 'Ranked by highest selected option percentage',
            questions: radioProcessed
          });
        }
        
        // Add Text questions if any
        if (unsectionedRankedQuestions.text.length > 0) {
          const textProcessed = processQuestions(unsectionedRankedQuestions.text, reportData);
          childTags.push({
            id: 'unsectioned-text',
            name: 'Text/Freeform Questions',
            description: 'Latest responses from participants',
            questions: textProcessed
          });
        }
        
        reportData.parentTags.push({
          id: 'unsectioned',
          name: 'General Questions',
          description: 'Questions not assigned to any specific section',
          childTags: childTags
        });
      }
    }
    
    // If no sections were created (empty survey or error), create a default section
    if (reportData.parentTags.length === 0) {
      const { likertQuestions, radioQuestions, textQuestions } = 
        analyticsQuestions.reduce<{likertQuestions: AnalyticsQuestion[], radioQuestions: AnalyticsQuestion[], textQuestions: AnalyticsQuestion[]}>(
          (acc, question) => {
            if (['text', 'textarea', 'date'].includes(question.questionType)) {
              acc.textQuestions.push(question);
            } else if (question.questionType === 'likert') {
              acc.likertQuestions.push(question);
            } else {
              acc.radioQuestions.push(question);
            }
            return acc;
          }, 
          { likertQuestions: [], radioQuestions: [], textQuestions: [] }
        );
      
      const childTags = [];
      
      // Add Likert questions if any
      if (likertQuestions.length > 0) {
        const likertProcessed = processQuestions(likertQuestions, reportData);
        childTags.push({
          id: 'default-likert',
          name: 'Likert Scale Questions',
          description: 'Response visualization for likert scale questions',
          questions: likertProcessed
        });
      }
      
      // Add Radio questions if any
      if (radioQuestions.length > 0) {
        const radioProcessed = processQuestions(radioQuestions, reportData);
        childTags.push({
          id: 'default-radio',
          name: 'Radio/Choice Questions',
          description: 'Response visualization for radio/choice questions',
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
        name: 'Survey Questions',
        description: 'Comprehensive analysis of all question responses',
        childTags: childTags
      });
    }
    
    // Generate the PDF with the structured data
    generatePDF(reportData);
  } catch (error) {
    console.error('Error in generatePDFWithRankedSections:', error);
    // Fall back to the original implementation
    generatePDFWithSections(analyticsQuestions, surveyData, options);
  }
};

// Function to generate PDF with sections (new implementation)
const generatePDFWithSections = (
  analyticsQuestions: AnalyticsQuestion[],
  surveyData: any,
  options?: ExportQuestionsToPDFOptions
): void => {
  try {
    console.log('Generating PDF with sections');
    
    // Extract sections from survey data
    const surveySections = surveyData.surveySections || [];
    const sectionQuestions = surveyData.sectionQuestions || [];
    
    console.log('Survey sections:', surveySections);
    console.log('Section questions:', sectionQuestions);
    
    // Create a map of questionId to sectionId
    const questionSectionMap: Record<string, string> = {};
    sectionQuestions.forEach((question: any) => {
      if (question.id && question.sectionId) {
        questionSectionMap[question.id] = question.sectionId;
      }
    });
    
    // Group analytics questions by section
    const questionsBySection: Record<string, AnalyticsQuestion[]> = {};
    const questionsWithoutSection: AnalyticsQuestion[] = [];
    
    analyticsQuestions.forEach(question => {
      const sectionId = questionSectionMap[question.questionId];
      if (sectionId) {
        if (!questionsBySection[sectionId]) {
          questionsBySection[sectionId] = [];
        }
        questionsBySection[sectionId].push(question);
      } else {
        questionsWithoutSection.push(question);
      }
    });
    
    console.log('Questions by section:', questionsBySection);
    console.log('Questions without section:', questionsWithoutSection);
    
    // Create the report data structure with dynamic sections
    const reportData: SurveyReportData = {
      reportTitle: 'Survey Questions Analysis',
      reportSubtitle: options?.surveyTitle || 'Response Data Visualization',
      description: options?.surveyDescription || 'Visual representation of survey question responses with detailed analytics',
      date: new Date().toLocaleDateString(),
      logoUrl: '/bioptrics_fixed_black.png',
      totalRespondents: 0, // Will be calculated below
      parentTags: []
    };
    
    // Create parent tags for each section
    surveySections.forEach((section: any) => {
      if (section.id && questionsBySection[section.id] && questionsBySection[section.id].length > 0) {
        const sectionQuestions = questionsBySection[section.id];
        const processedQuestions = processQuestions(sectionQuestions, reportData);
        let sectionName = '';
        if(section.name){sectionName = "Standard : "+section.name}else{sectionName = 'Section'}
        reportData.parentTags.push({
          id: section.id,
          name: sectionName,
          description: section.description || 'Survey section',
          childTags: [
            {
              id: `${section.id}-responses`,
              name: 'Question Responses',
              description: 'Detailed visualization of response data for each question',
              questions: processedQuestions
            }
          ]
        });
      }
    });
    
    // Add a default section for questions without a section
    if (questionsWithoutSection.length > 0) {
      const processedQuestions = processQuestions(questionsWithoutSection, reportData);
      
      reportData.parentTags.push({
        id: 'general-questions',
        name: 'General Questions',
        description: 'Questions not assigned to any specific section',
        childTags: [
          {
            id: 'general-responses',
            name: 'Question Responses',
            description: 'Detailed visualization of response data for each question',
            questions: processedQuestions
          }
        ]
      });
    }
    
    // If no sections were created (empty survey or error), create a default section
    if (reportData.parentTags.length === 0) {
      const processedQuestions = processQuestions(analyticsQuestions, reportData);
      
      reportData.parentTags.push({
        id: 'survey-questions',
        name: 'Survey Questions',
        description: 'Comprehensive analysis of all question responses',
        childTags: [
          {
            id: 'question-responses',
            name: 'Question Responses',
            description: 'Detailed visualization of response data for each question',
            questions: processedQuestions
          }
        ]
      });
    }
    
    // Generate the PDF with the structured data
    generatePDF(reportData);
  } catch (error) {
    console.error('Error in generatePDFWithSections:', error);
    // Fall back to the original implementation
    generatePDFWithoutSections(analyticsQuestions, options);
  }
};

// Function to process questions and calculate statistics
const processQuestions = (questions: AnalyticsQuestion[], reportData: SurveyReportData) => {
  return questions.map(question => {
    // Calculate total respondents (sum all percentages to match QuestionsTab.tsx)
    const respondents = Object.values(question.progress).reduce((sum, count) => sum + count, 0);
    
    // Update the total respondents count
    if (respondents > reportData.totalRespondents) {
      reportData.totalRespondents = respondents;
    }
    
    // Check if this is a text question type
    const isTextQuestion = ['text', 'textarea', 'date'].includes(question.questionType);
    
    // Get entries from progress data
    const entries = Object.entries(question.progress);
    
    // For text questions, use a different response overview
    let responseOverview = '';
    
    if (isTextQuestion) {
      // For text questions, show the number of responses
      const responseCount = question.latestResponses?.length || 0;
      responseOverview = responseCount > 0 
        ? `${responseCount} text ${responseCount === 1 ? 'response' : 'responses'} received` 
        : 'No responses yet';
    } else {
      // For other question types, use the highest percentage option
      const highestEntry = entries.reduce(
        (highest, current) => current[1] > highest[1] ? current : highest,
        ['', 0]
      );
      
      // Only show percentage if there are actual responses with non-zero values
      if (entries.length > 0 && highestEntry[1] > 0) {
        responseOverview = `${highestEntry[1]}% ${highestEntry[0]}`;
      } else {
        responseOverview = '';
      }
    }
    
    // Format options for the chart
    const options = entries.map(([label, percentage], index) => ({
      label,
      count: Math.round(percentage * respondents / 100), // Estimate count from percentage
      percentage,
      color: getColorForOption(label) // Use our custom color function for consistent styling
    }));
    
    // Debug logging for each question
    console.log(`Processing question: ${question.questionText} (${question.questionType})`);
    console.log(`Has latestResponses: ${!!question.latestResponses}, Count: ${question.latestResponses?.length || 0}`);
    if (question.latestResponses && question.latestResponses.length > 0) {
      console.log('First response:', question.latestResponses[0]);
    }
    
    // Create the processed question with latestResponses if available
    const processedQuestion: ProcessedQuestion = {
      id: question.questionId,
      title: question.questionText,
      description: `Question Type: ${question.questionType}`,
      responseOverview,
      respondents,
      categoryTags: [question.questionType],
      options,
      // Include latestResponses for text, textarea, and date questions
      latestResponses: question.latestResponses && question.latestResponses.length > 0 ? 
        question.latestResponses.map(resp => ({
          answer: resp.answer,
          date: resp.date
        })) : undefined
    };
    
    return processedQuestion;
  });
};

// Function to generate the actual PDF
const generatePDF = (reportData: SurveyReportData) => {
  // Create a hidden iframe in the same page
  let printFrame = document.getElementById('pdf-print-frame') as HTMLIFrameElement;
  
  if (!printFrame) {
    printFrame = document.createElement('iframe');
    printFrame.id = 'pdf-print-frame';
    printFrame.style.position = 'absolute';
    printFrame.style.top = '-9999px';
    printFrame.style.left = '-9999px';
    document.body.appendChild(printFrame);
  }
  
  // Generate the HTML content for the PDF
  const reportContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <title>${reportData.reportTitle}</title>
        <style>
          ${customPdfStyles}
        </style>
      </head>
      <body>
        <div class="report-container">
          <!-- Cover Page -->
          <div class="cover-page">
            <div style="height: 100%; display: flex; flex-direction: column; justify-content: space-between;">
              <div>
                <div style="text-align: center; margin-bottom: 40px;">
                  <img src="${reportData.logoUrl}" alt="Company Logo" style="width: 150px;" />
                </div>
                
                <h1 style="font-size: 24px; color: #333; text-align: center; margin-bottom: 10px;">${reportData.reportTitle}</h1>
                <h2 style="font-size: 18px; color: #555; text-align: center; margin-bottom: 20px;">${reportData.reportSubtitle}</h2>
                
                <div style="text-align: center; margin: 30px 0;">
                  <p style="font-size: 14px; color: #333; max-width: 600px; margin: 0 auto;">${reportData.description}</p>
                </div>
              </div>
              
              <div style="margin-top: 60px; text-align: center;">
                <p style="font-size: 12px; color: #666;">Generated Date: ${reportData.date}</p>
              </div>
            </div>
          </div>
          
          <div class="page-break"></div>
          
          <!-- Content Pages -->
          ${reportData.parentTags.map((parentTag, index) => `
            ${index > 0 ? '<div class="page-break"></div>' : ''}
            <div class="content-page">
              <div class="section" style="background-color: #552a47; padding: 15px; margin: 0 -24px 20px -10px; width: calc(100% + 48px);">
                <h2 class="section-title" style="color: white; margin: 0; font-size: 18px;">${parentTag.name}</h2>
                <p class="section-description" style="color: white; margin: 5px 0 0 0; font-size: 14px;">${parentTag.description}</p>
              </div>
              
              ${parentTag.childTags.map(childTag => `
                <div class="subsection">
                  <h3 class="subsection-title" style="display: none;">${childTag.name}</h3>
                  <p class="subsection-description" style="display: none;">${childTag.description}</p>
                  
                  ${childTag.questions.map((question, questionIndex) => `
                      <div style="background-color: white; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); padding: 24px; margin-bottom: 24px; page-break-inside: avoid;">
                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                          <div style="font-size: 16px; font-weight: 500; color: #1e293b; max-width: 80%;"><span style="font-weight: 700;">Question ${questionIndex + 1}:</span> ${question.title.replace(/\n/g, ' ').replace(/<br\s*\/?>/gi, ' ')}</div>
                          <span style="display: inline-block; margin-left: 10px; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; background-color: #552a47; color: white;">${question.categoryTags && question.categoryTags.length > 0 ? question.categoryTags[0] : 'Unknown'}</span>
                        </div>
                        
                        <p style="display:none; font-size: 14px; font-weight: 500; color: #46223b; margin-bottom: 15px;">
                          ${question.responseOverview}
                        </p>
                        
                        <!-- Response count display -->
                        <div style="display: none; align-items: center; margin-bottom: 16px; background-color: #f8fafc; padding: 8px 12px; border-radius: 4px;">
                          <span style="color: #64748b; font-size: 14px; font-weight: 500;">${question.respondents} responses</span>
                        </div>
                        
                        <div style="margin-top: 15px; margin-bottom: 15px;">
                          ${(() => {
                            // For text, textarea, and date questions, show latest responses
                            // Extract the question type from the description
                            const questionType = question.description?.replace('Question Type: ', '') || '';
                            
                            // Debug the question type and responses
                            console.log(`Rendering question: ${question.title}`);
                            console.log(`Question type: ${questionType}`);
                            console.log(`Has latestResponses: ${!!question.latestResponses}, Count: ${question.latestResponses?.length || 0}`);
                            
                            // Check if this is a text-type question with responses
                            if (['text', 'textarea', 'date'].includes(questionType) && question.latestResponses && question.latestResponses.length > 0) {
                              return `
                                <div style="margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #4b5563;">
                                  Latest Responses (${question.latestResponses.length})
                                </div>
                                <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                                  ${question.latestResponses.map((response: {answer: string; date: Date | string}, index: number) => `
                                    <div style="padding: 12px; ${index !== question.latestResponses!.length - 1 ? 'border-bottom: 1px solid #e5e7eb;' : ''} background-color: ${index % 2 === 0 ? '#f9fafb' : '#ffffff'};">
                                      <div style="font-size: 14px; color: #1e293b; margin-bottom: 4px;">${response.answer}</div>
                                      <div style="font-size: 12px; color: #64748b; font-style: italic;">
                                        ${new Date(response.date).toLocaleDateString()} ${new Date(response.date).toLocaleTimeString()}
                                      </div>
                                    </div>
                                  `).join('')}
                                </div>
                              `;
                            } else if (question.options && question.options.length > 0) {
                              // For option-type questions (rating, likert, radio, checkbox), always show the options
                              // If there are responses, show the bar chart with percentages
                              // If no responses, show the options with 0%
                              const hasResponses = question.options.some(option => option.percentage > 0);
                              
                              return `
                                ${hasResponses ? `
                                  <div style="display: flex; height: 40px; width: 100%; border-radius: 20px; overflow: hidden; margin-bottom: 16px; background-color: #f1f5f9;">
                                    ${question.options
                                      .sort((a, b) => {
                                        // Sort options in a logical order to match the screenshot
                                        const order = {
                                          'Strongly Agree': 1,
                                          'Agree': 2,
                                          'Neutral': 3,
                                          'Neither Agree nor Disagree': 3, // Same level as Neutral
                                          'Disagree': 4,
                                          'Strongly Disagree': 5
                                        };
                                        
                                        // Get the order value, default to 99 for unknown options
                                        const orderA = order[a.label as keyof typeof order] || 99;
                                        const orderB = order[b.label as keyof typeof order] || 99;
                                        
                                        return orderB - orderA; // Reverse the order to match the screenshot
                                      })
                                      .map(option => `
                                        <div style="height: 100%; width: ${option.percentage}%; background-color: ${option.color}; position: relative; display: flex; align-items: center; justify-content: center;">
                                          ${option.percentage > 5 ? `
                                            <span style="position: absolute; font-size: 12px; color: ${option.label === 'Agree' || option.label === 'Neutral' || option.label === 'Neither Agree nor Disagree' ? '#333' : 'white'}; font-weight: 500; text-shadow: 0 0 2px rgba(0,0,0,0.2);">
                                              ${option.percentage}%
                                            </span>
                                          ` : ''}
                                        </div>
                                      `).join('')}
                                  </div>
                                ` : `
                                  <div style="padding: 20px; text-align: center; background-color: #f9fafb; border-radius: 4px; border: 1px solid #e5e7eb; margin-bottom: 16px;">
                                    <p style="margin: 0; color: #666; font-size: 14px;">No responses yet</p>
                                  </div>
                                `}
                                
                                <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px;">
                                  ${question.options
                                    .sort((a, b) => {
                                      // Sort options in a logical order to match the screenshot
                                      const order = {
                                        'Strongly Agree': 1,
                                        'Agree': 2,
                                        'Neutral': 3,
                                        'Neither Agree nor Disagree': 3, // Same level as Neutral
                                        'Disagree': 4,
                                        'Strongly Disagree': 5
                                      };
                                      
                                      // Get the order value, default to 99 for unknown options
                                      const orderA = order[a.label as keyof typeof order] || 99;
                                      const orderB = order[b.label as keyof typeof order] || 99;
                                      
                                      return orderB - orderA; // Reverse the order to match the screenshot
                                    })
                                    .map(option => `
                                      <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b;">
                                        <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${option.color};"></div>
                                        ${option.label}: ${option.percentage}%
                                      </div>
                                    `).join('')}
                                </div>
                              `;
                            } else {
                              // No responses - match the design from Question tab exactly
                              return `
                                <div style="padding: 20px; text-align: center; background-color: #f9fafb; border-radius: 4px; border: 1px solid #e5e7eb;">
                                  <p style="margin: 0; color: #666; font-size: 14px;">No responses yet</p>
                                </div>
                              `;
                            }
                          })()} 
                        </div>
                      </div>
                    `).join('')}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
        </div>
      </body>
    </html>
  `;
  
  // Get the iframe's document
  const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
  
  if (frameDoc) {
    // Write the content to the iframe
    frameDoc.open();
    frameDoc.write(reportContent);
    frameDoc.close();
    
    // Wait for content to load before printing
    printFrame.onload = () => {
      // Print immediately without waiting
      try {
        printFrame.contentWindow?.print();
      } catch (error) {
        console.error('Error printing:', error);
      }
    };
  }
};

// Function to generate PDF without sections (original implementation)
const generatePDFWithoutSections = (
  analyticsQuestions: AnalyticsQuestion[], 
  options?: ExportQuestionsToPDFOptions
): void => {
  try {
    // Check if any questions have latestResponses
    const textQuestions = analyticsQuestions.filter(q => 
      ['text', 'textarea', 'date'].includes(q.questionType) && 
      q.latestResponses && 
      q.latestResponses.length > 0
    );
    console.log('PDF Export - Text questions with responses:', textQuestions);
    // Create the report data structure first
    const reportData: SurveyReportData = {
      reportTitle: 'Survey Questions Analysis',
      reportSubtitle: options?.surveyTitle || 'Response Data Visualization',
      description: options?.surveyDescription || 'Visual representation of survey question responses with detailed analytics',
      date: new Date().toLocaleDateString(),
      logoUrl: '/bioptrics_fixed_black.png',
      totalRespondents: 0, // Will be calculated below
      parentTags: [
        {
          id: 'survey-questions',
          name: 'Survey Questions',
          description: 'Comprehensive analysis of all question responses',
          childTags: [
            {
              id: 'question-responses',
              name: 'Question Responses',
              description: 'Detailed visualization of response data for each question',
              questions: []
            }
          ]
        }
      ]
    };
    
    // Process each question and add to the report
    const processedQuestions = analyticsQuestions.map(question => {
      // Calculate total respondents (sum all percentages to match QuestionsTab.tsx)
      const respondents = Object.values(question.progress).reduce((sum, count) => sum + count, 0);
      
      // Update the total respondents count
      if (respondents > reportData.totalRespondents) {
        reportData.totalRespondents = respondents;
      }
      
      // Check if this is a text question type
      const isTextQuestion = ['text', 'textarea', 'date'].includes(question.questionType);
      
      // Get entries from progress data
      const entries = Object.entries(question.progress);
      
      // For text questions, use a different response overview
      let responseOverview = '';
      
      if (isTextQuestion) {
        // For text questions, show the number of responses
        // const responseCount = question.latestResponses?.length || 0;
        // responseOverview = responseCount > 0 
        //   ? `${responseCount} text ${responseCount === 1 ? 'response' : 'responses'} received` 
        //   : 'No responses yet';
      } else {
        // For other question types, use the highest percentage option
        const highestEntry = entries.reduce(
          (highest, current) => current[1] > highest[1] ? current : highest,
          ['', 0]
        );
        
        // Only show percentage if there are actual responses with non-zero values
        if (entries.length > 0 && highestEntry[1] > 0) {
          responseOverview = `${highestEntry[1]}% ${highestEntry[0]}`;
        } else {
          responseOverview = '';
        }
      }
      
      // Format options for the chart
      const options = entries.map(([label, percentage], index) => ({
        label,
        count: Math.round(percentage * respondents / 100), // Estimate count from percentage
        percentage,
        color: getColorForOption(label) // Use our custom color function for consistent styling
      }));
      
      // Debug logging for each question
      console.log(`Processing question: ${question.questionText} (${question.questionType})`);
      console.log(`Has latestResponses: ${!!question.latestResponses}, Count: ${question.latestResponses?.length || 0}`);
      if (question.latestResponses && question.latestResponses.length > 0) {
        console.log('First response:', question.latestResponses[0]);
      }
      
      // Create the processed question with latestResponses if available
      const processedQuestion: ProcessedQuestion = {
        id: question.questionId,
        title: question.questionText,
        description: `Question Type: ${question.questionType}`,
        responseOverview,
        respondents,
        categoryTags: [question.questionType],
        options,
        // Include latestResponses for text, textarea, and date questions
        latestResponses: question.latestResponses && question.latestResponses.length > 0 ? 
          question.latestResponses.map(resp => ({
            answer: resp.answer,
            date: resp.date
          })) : undefined
      };
      
      return processedQuestion;
    });
    
    // Add the processed questions to the report data
    reportData.parentTags[0].childTags[0].questions = processedQuestions;
    
    // Create a custom implementation of generateSurveyReportPDF that includes our styles
    // We'll use the iframe approach similar to the original function
    try {
      // Create a hidden iframe in the same page
      let printFrame = document.getElementById('pdf-print-frame') as HTMLIFrameElement;
      
      // If iframe doesn't exist, create it
      if (!printFrame) {
        printFrame = document.createElement('iframe');
        printFrame.id = 'pdf-print-frame';
        printFrame.style.position = 'fixed';
        printFrame.style.right = '0';
        printFrame.style.bottom = '0';
        printFrame.style.width = '0';
        printFrame.style.height = '0';
        printFrame.style.border = '0';
        document.body.appendChild(printFrame);
      }
      
      // Generate the HTML content for the report with our custom styles
      const reportContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Survey Questions Analysis</title>
            <style>
              @page {
                margin: 0.5in;
              }
              body {
                font-family: Arial, sans-serif;
                color: #333;
                line-height: 1.5;
                margin: 0;
                padding: 0;
              }
              .page-break {
                page-break-before: always;
                height: auto;
                display: block;
              }
              .cover-page {
                height: 100vh;
                display: flex;
                flex-direction: column;
                justify-content: space-between;
                position: relative;
              }
              .accent-bar {
                height: 60px;
                background-color: #552a47;
                margin-bottom: 40px;
              }
              .report-title {
                font-size: 32px;
                color: #552a47;
                text-align: center;
                margin-bottom: 10px;
              }
              .report-subtitle {
                font-size: 20px;
                color: #46223b;
                text-align: center;
                margin-bottom: 20px;
              }
              .report-description {
                font-size: 14px;
                text-align: center;
                max-width: 600px;
                margin: 0 auto 40px;
                display: block;
                width: 100%;
              }
              .footer {
                margin-top: 60px;
                border-top: 1px solid #eee;
                padding-top: 20px;
              }
              .footer-text {
                font-size: 12px;
                color: #666;
                margin-bottom: 5px;
                text-align: center;
              }
              
              /* Our custom styles */
              ${customPdfStyles}
            </style>
          </head>
          <body>
            <!-- Cover Page -->
            <div class="cover-page">
              <div>
                <div class="accent-bar"></div>
                <div style="text-align: center; margin-bottom: 40px;">
                  <img src="${reportData.logoUrl}" alt="Company Logo" style="width: 150px;" />
                </div>
                
                <h1 class="report-title">${reportData.reportTitle}</h1>
                <h2 class="report-subtitle">${reportData.reportSubtitle}</h2>
                <table width="100%" border="0" cellspacing="0" cellpadding="0" style="margin: 20px 0 40px 0;">
                  <tr>
                    <td align="center">
                      <p style="font-size: 14px; color: #333; max-width: 600px;">${reportData.description}</p>
                    </td>
                  </tr>
                </table>
              </div>
              
              <div class="footer">
                <p class="footer-text">Generated Date: ${reportData.date}</p>
              </div>
            </div>
            
            <!-- Content Pages -->
            <div class="page-break"></div>
            <div class="content-page">
              <div>
                <div class="parent-tag-header" style="background-color: #552a47; color: white; padding: 10px; margin-bottom: 15px;">
                  <h3 style="font-size: 18px; margin: 0;">${reportData.parentTags[0].name}</h3>
                  <p style="font-size: 12px; margin: 5px 0 0;">${reportData.parentTags[0].description}</p>
                </div>
                
                <div class="child-tag" style="margin-left: 0; margin-bottom: 20px; padding: 10px;">
                  <h4 style="font-size: 16px; color: #552a47; margin: 0 0 5px;">${reportData.parentTags[0].childTags[0].name}</h4>
                  <p style="font-size: 12px; margin: 0 0 10px;">${reportData.parentTags[0].childTags[0].description}</p>
                  
                  ${reportData.parentTags[0].childTags[0].questions.map(question => `
                    <div class="question">
                      <div style="display: flex; justify-content: space-between; align-items: center;">
                        <h5 class="question-title" style="flex: 1;">${question.title}</h5>
                        <span class="question-type-badge">${question.categoryTags && question.categoryTags.length > 0 ? question.categoryTags[0] : 'Unknown'}</span>
                      </div>
                      
                      <p class="respondent-count" style="font-size: 12px; display:none; color: #666; font-style: italic; margin-bottom: 10px;">
                        (${question.respondents} of ${reportData.totalRespondents} respondents answered this question)
                      </p>
                      
                      <p class="response-overview" style="font-size: 14px; font-weight: 500; color: #46223b; margin-bottom: 15px;">
                        ${question.responseOverview}
                      </p>
                      
                      <!-- Response count display that matches the tab implementation -->
                      <div style="display: none; align-items: center; margin-bottom: 16px; background-color: #f8fafc; padding: 8px 12px; border-radius: 4px;">
                        <span style="color: #64748b; font-size: 14px; font-weight: 500;">${question.respondents} responses</span>
                      </div>
                      
                      <div class="chart-container">
                        ${(() => {
                          // For text, textarea, and date questions, show latest responses
                          // Extract the question type from the description
                          const questionType = question.description?.replace('Question Type: ', '') || '';
                          
                          // Debug the question type and responses
                          console.log(`Rendering question: ${question.title}`);
                          console.log(`Question type: ${questionType}`);
                          console.log(`Has latestResponses: ${!!question.latestResponses}, Count: ${question.latestResponses?.length || 0}`);
                          
                          // Check if this is a text-type question
                          if (['text', 'textarea', 'date'].includes(questionType) && question.latestResponses && question.latestResponses.length > 0) {
                            return `
                              <div style="margin-bottom: 8px; font-size: 14px; font-weight: 500; color: #4b5563;">
                                Latest Responses (${question.latestResponses.length})
                              </div>
                              <div style="border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                                ${question.latestResponses.map((response: {answer: string; date: Date | string}, index: number) => `
                                  <div style="padding: 12px; ${index !== question.latestResponses!.length - 1 ? 'border-bottom: 1px solid #e5e7eb;' : ''} background-color: ${index % 2 === 0 ? '#f9fafb' : '#ffffff'};">
                                    <div style="font-size: 14px; color: #1e293b; margin-bottom: 4px;">${response.answer}</div>
                                    <div style="font-size: 12px; color: #64748b; font-style: italic;">
                                      ${new Date(response.date).toLocaleDateString()} ${new Date(response.date).toLocaleTimeString()}
                                    </div>
                                  </div>
                                `).join('')}
                              </div>
                            `;
                          } else if (question.options && question.options.length > 0) {
                            // For other question types with options, show bar chart
                            return `
                              <!-- Bar chart that matches the QuestionsTab.tsx exactly -->
                              <div class="bar-chart" style="height: 40px; border-radius: 20px; background-color: #f1f5f9;">
                                ${question.options
                                  .sort((a, b) => {
                                    // Sort options in a logical order (Strongly Agree to Strongly Disagree)
                                    const order = {
                                        'Strongly Agree': 1,
                                        'Agree': 2,
                                        'Neutral': 3,
                                        'Neither Agree nor Disagree': 3, // Same level as Neutral
                                        'Disagree': 4,
                                        'Strongly Disagree': 5
                                    };
                                    
                                    // Get the order value, default to 99 for unknown options
                                    const orderA = order[a.label as keyof typeof order] || 99;
                                    const orderB = order[b.label as keyof typeof order] || 99;
                                    
                                    return orderB - orderA; // Reverse the order to match the screenshot
                                  })
                                  .map(option => {
                                    return `
                                      <div style="width: ${option.percentage}%; min-width: ${option.percentage > 0 ? '20px' : '0'}; display: flex; align-items: center;">
                                        <div style="display: flex; align-items: center; font-size: 12px; color: #64748b;">
                                          <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${option.color}; margin-right: 4px;"></div>
                                          ${option.percentage}%
                                        </div>
                                      </div>
                                    `;
                                  }).join('')}
                              </div>
                              
                              <!-- Legend that matches the screenshot -->
                              <div class="legend-container" style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 8px;">
                                ${question.options
                                  .sort((a, b) => {
                                    // Sort options in a logical order (Strongly Disagree to Strongly Agree)
                                    const order = {
                                        'Strongly Agree': 1,
                                        'Agree': 2,
                                        'Neutral': 3,
                                        'Neither Agree nor Disagree': 3, // Same level as Neutral
                                        'Disagree': 4,
                                        'Strongly Disagree': 5
                                    };
                                    
                                    // Get the order value, default to 99 for unknown options
                                    const orderA = order[a.label as keyof typeof order] || 99;
                                    const orderB = order[b.label as keyof typeof order] || 99;
                                    
                                    return orderB - orderA; // Reverse the order to match the screenshot
                                  })
                                  .map(option => `
                                    <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b;">
                                      <div style="width: 8px; height: 8px; border-radius: 50%; background-color: ${option.color};"></div>
                                      ${option.label}: ${option.percentage}%
                                    </div>
                                  `).join('')}
                              </div>
                            `;
                          } else {
                            // No responses
                            return `
                              <div style="padding: 20px 0; text-align: center; color: #666; background-color: #f9fafb; border-radius: 4px; border: 1px dashed #d1d5db;">
                                <p style="margin: 0;">No responses yet</p>
                              </div>
                            `;
                          }
                        })()} 
                      </div>
                    </div>
                  `).join('')}
                </div>
              </div>
            </div>
          </body>
        </html>
      `;
      
      // Get the iframe's document
      const frameDoc = printFrame.contentDocument || printFrame.contentWindow?.document;
      
      if (frameDoc) {
        // Write the content to the iframe
        frameDoc.open();
        frameDoc.write(reportContent);
        frameDoc.close();
        
        // Wait for content to load before printing
        printFrame.onload = () => {
          // Print immediately without waiting
          printFrame.contentWindow?.print();
        };
      }
    } catch (error) {
      console.error('Error generating custom PDF report:', error);
      // Fall back to the original PDF generation if our custom one fails
      generateSurveyReportPDF(reportData);
    }
  } catch (error) {
    console.error('Error generating PDF:', error);
    throw error;
  }
};
