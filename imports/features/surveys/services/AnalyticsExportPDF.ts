/**
 * AnalyticsExportPDF.ts
 * PDF generation for survey analytics export
 * Styled to match existing question reports
 */

// Define interfaces for survey analytics export data
export interface SurveyQuestionData {
  questionId: string;
  questionText: string;
  questionType: string;
  progress: Record<string, number>;
  latestResponses?: Array<{
    answer: string;
    date: Date;
  }>;
  sectionId?: string; // Added to track which section a question belongs to
}

export interface SurveySection {
  id: string;
  name: string;
  description?: string;
}

export interface SectionQuestion {
  id: string;
  sectionId: string;
}

export interface SurveyAnalyticsData {
  surveyId: string;
  surveyTitle: string;
  questions: SurveyQuestionData[];
  surveySections?: SurveySection[];
  sectionQuestions?: SectionQuestion[];
}

export interface AnalyticsExportData {
  reportTitle: string;
  date: string;
  logoUrl: string;
  surveys: SurveyAnalyticsData[];
}

// Function to generate a PDF from survey analytics data
export const generateAnalyticsExportPDF = (data: AnalyticsExportData) => {
  // Debug logging for report data structure
  console.log('generateAnalyticsExportPDF received data:', data);
  
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
    
    // Add print-specific styles
    const printStyles = `
      @media print {
        @page {
          size: A4;
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
          background-color: var(--color-primary, #552a47);
          margin-bottom: 40px;
        }
        .report-title {
          font-size: 32px;
          color: var(--color-primary, #552a47);
          text-align: center;
          margin-bottom: 10px;
        }
        .report-subtitle {
          font-size: 20px;
          color: #46223b;
          text-align: center;
          margin-bottom: 20px;
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
        }
        .date-display {
          position: absolute;
          top: 10px;
          right: 10px;
          font-size: 12px;
          color: #666;
        }
        .content-page {
          position: relative;
          min-height: 90vh;
          box-sizing: border-box;
        }
        .section-header {
          background-color: var(--color-primary, #552a47);
          color: white;
          padding: 10px;
          margin-bottom: 15px;
        }
        .section-title {
          font-size: 18px;
          margin: 0;
        }
        .section-description {
          font-size: 12px;
          margin: 5px 0 0;
        }
        .survey-title {
          font-size: 24px;
          font-weight: bold;
          color: var(--color-primary, #552a47);
          margin: 30px 0 15px;
          padding-bottom: 8px;
          border-bottom: 1px solid #e0e0e0;
        }
        .question-card {
          background-color: #f9f9f9;
          border-radius: 8px;
          padding: 20px;
          margin-bottom: 25px;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
        }
        .question-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }
        .question-type {
          display: inline-flex;
          margin-left: 10px;
          padding: 2px 8px;
          border-radius: 4px;
          font-size: 12px;
          font-weight: 500;
          background-color: var(--color-primary, #552a47);
          color: white;
        }
        .chart-container {
          margin-top: 15px;
          margin-bottom: 20px;
        }
        .bar-container {
          display: flex;
          height: 32px;
          width: 100%;
          border-radius: 4px;
          overflow: hidden;
          margin-bottom: 15px;
        }
        .bar {
          height: 100%;
          position: relative;
        }
        .bar-label {
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
          color: white;
          font-size: 12px;
          font-weight: bold;
          text-shadow: 0 0 2px rgba(0, 0, 0, 0.5);
        }
        .legend-container {
          display: flex;
          flex-wrap: wrap;
          gap: 16px;
          margin-top: 10px;
        }
        .legend-item {
          display: flex;
          align-items: center;
          gap: 6px;
          font-size: 12px;
          color: #555;
        }
        .legend-color {
          width: 12px;
          height: 12px;
          border-radius: 50%;
        }
        .responses-container {
          margin-top: 20px;
        }
        .responses-title {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          margin-bottom: 10px;
        }
        .response-item {
          background-color: white;
          border: 1px solid #e2e8f0;
          border-radius: 6px;
          padding: 12px;
          margin-bottom: 10px;
        }
        .response-text {
          font-size: 14px;
          color: #333;
          margin-bottom: 4px;
        }
        .response-date {
          font-size: 12px;
          color: #666;
          font-style: italic;
        }
        .no-responses {
          padding: 15px;
          text-align: center;
          color: #666;
          background-color: #f5f5f5;
          border-radius: 4px;
          border: 1px dashed #ccc;
        }
      }
    `;
    
    // Generate the HTML content for the report
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Survey Analytics Export</title>
          <style>
            ${printStyles}
            @page {
              margin: 0.5in;
            }
            body {
              margin: 0;
              padding: 0;
              font-family: Arial, sans-serif;
            }
          </style>
        </head>
        <body>
          <!-- Cover Page -->
          <div class="cover-page">
            <div>
              <div class="accent-bar"></div>
              <div style="text-align: center; margin-bottom: 40px;">
                <img src="${data.logoUrl || '/bioptrics_fixed_black.png'}" alt="Company Logo" style="width: 150px;" />
              </div>
              
              <h1 class="report-title">${data.reportTitle || 'Survey Analytics Report'}</h1>
              <h2 class="report-subtitle">Survey Results Analysis</h2>
              
              ${data.surveys.length === 1 ? `
                <div style="margin-top: 30px; text-align: center;">
                  <h3 style="font-size: 24px; color: var(--color-primary, #552a47); margin-bottom: 10px;">${data.surveys[0].surveyTitle}</h3>
                </div>
              ` : `
                <div style="margin-top: 30px; text-align: center;">
                  <h3 style="font-size: 20px; color: var(--color-primary, #552a47); margin-bottom: 10px;">Selected Surveys:</h3>
                  <ul style="list-style: none; padding: 0; margin: 0;">
                    ${data.surveys.map(survey => `<li style="font-size: 18px; margin-bottom: 8px; color: #333;">${survey.surveyTitle}</li>`).join('')}
                  </ul>
                </div>
              `}
            </div>
            
            <div class="footer">
              <p class="footer-text">Generated Date: ${data.date || new Date().toLocaleDateString()}</p>
              <p class="footer-text">Number of Surveys: ${data.surveys.length}</p>
            </div>
          </div>
          
          <!-- Content Pages -->
          ${data.surveys.map((survey, surveyIndex) => {
            // Create a map of questionId to sectionId
            const questionSectionMap: Record<string, string> = {};
            if (survey.sectionQuestions && survey.sectionQuestions.length > 0) {
              survey.sectionQuestions.forEach(sq => {
                questionSectionMap[sq.id] = sq.sectionId;
              });
            }
            
            // Group questions by section
            const questionsBySection: Record<string, SurveyQuestionData[]> = {};
            const questionsWithoutSection: SurveyQuestionData[] = [];
            
            survey.questions.forEach(question => {
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
            
            return `
            <div class="page-break"></div>
            <div class="content-page">
              <!-- Survey Title Header -->
              <div class="section" style="background-color: var(--color-primary, #552a47); padding: 15px; margin: 0 -24px 20px -10px; width: calc(100% + 48px);">
                <h2 class="section-title" style="color: white; margin: 0; font-size: 18px;">${survey.surveyTitle}</h2>
                <p class="section-description" style="color: white; margin: 5px 0 0 0; font-size: 14px;">Analysis of responses for the selected surveys</p>
              </div>
              
              ${(() => {
                // If we have sections, render each section with its questions
                if (survey.surveySections && survey.surveySections.length > 0) {
                  return survey.surveySections.map(section => {
                    const sectionQuestions = questionsBySection[section.id] || [];
                    if (sectionQuestions.length === 0) return ''; // Skip empty sections
                    
                    return `
                      <!-- Section: ${section.name} -->
                      <div class="section" style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; margin-bottom: 24px;">
                        <h3 style="font-size: 18px; color: #334155; margin-top: 0; margin-bottom: 8px;">Standard : ${section.name || 'Section'}</h3>
                        <p style="font-size: 14px; color: #64748b; margin-top: 0; margin-bottom: 16px;">${section.description || 'Questions in this section'}</p>
                        
                        <!-- Questions for this section -->
                        ${sectionQuestions.map((question, questionIndex) => `
                <div style="background-color: white; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); padding: 24px; margin-bottom: 24px; page-break-inside: avoid;">
                  <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                    <div style="font-size: 16px; font-weight: 500; color: #1e293b; max-width: 80%;"><span style="font-weight: 700;">Question ${questionIndex + 1}:</span> ${question.questionText}</div>
                    <span style="display: inline-block; margin-left: 10px; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; background-color: var(--color-primary, #552a47); color: white;">${question.questionType}</span>
                  </div>
                  
                  ${isTextQuestion(question.questionType) && question.latestResponses && question.latestResponses.length > 0 ? `
                    <!-- Text Responses -->
                    <div style="margin-top: 20px;">
                      <div style="font-size: 14px; font-weight: 500; color: #4b5563; margin-bottom: 8px;">
                        Latest Responses (${question.latestResponses.length})
                      </div>
                      
                      ${question.latestResponses.length > 0 ? `
                        <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 12px;">
                          ${question.latestResponses.map((response, responseIndex) => `
                            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 4px;">
                              <div style="font-size: 14px; color: #334155; margin-bottom: 4px;">${response.answer}</div>
                              <div style="font-size: 12px; color: #64748b; font-style: italic;">
                                ${new Date(response.date).toLocaleDateString()} ${new Date(response.date).toLocaleTimeString()}
                              </div>
                            </div>
                          `).join('')}
                        </div>
                      ` : `
                        <div style="padding: 20px 0; text-align: center; color: #666; background-color: #f9fafb; border-radius: 4px; border: 1px dashed #d1d5db;">
                          <p style="margin: 0;">No responses yet</p>
                        </div>
                      `}
                    </div>
                  ` : `
                    <!-- Bar Chart -->
                    <div style="margin-top: 15px; margin-bottom: 20px;">
                      ${hasResponses(question.progress) ? `
                        <div style="display: flex; height: 32px; width: 100%; border-radius: 4px; overflow: hidden; margin-bottom: 16px;">
                          ${Object.entries(question.progress).map(([label, percentage]) => `
                            <div style="height: 100%; width: ${percentage}%; background-color: ${getColorForOption(label)}; position: relative;">
                              ${percentage > 5 ? `<div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); color: white; font-size: 12px; font-weight: 500; text-shadow: 0 0 2px rgba(0,0,0,0.5);">${percentage}%</div>` : ''}
                            </div>
                          `).join('')}
                        </div>
                        
                        <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 16px; padding: 4px 0;">
                          ${Object.entries(question.progress).map(([label, percentage]) => `
                            <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b;">
                              <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${getColorForOption(label)};"></div>
                              ${label}: ${percentage}%
                            </div>
                          `).join('')}
                        </div>
                      ` : `
                        <div style="padding: 20px 0; text-align: center; color: #666; background-color: #f9fafb; border-radius: 4px; border: 1px dashed #d1d5db; margin-bottom: 10px;">
                          <p style="margin: 0;">No responses yet</p>
                        </div>
                      `}
                    </div>
                  `}
                </div>
              `).join('')}
                      </div>
                    `;
                  }).join('');
                } else {
                  // If no sections, just render all questions
                  return `
                    <!-- All Questions -->
                    ${questionsWithoutSection.map((question, questionIndex) => `
                      <div style="background-color: white; border-radius: 8px; border: 1px solid #e2e8f0; box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05); padding: 24px; margin-bottom: 24px; page-break-inside: avoid;">
                        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px;">
                          <div style="font-size: 16px; font-weight: 500; color: #1e293b; max-width: 80%;"><span style="font-weight: 700;">Question ${questionIndex + 1}:</span> ${question.questionText}</div>
                          <span style="display: inline-block; margin-left: 10px; padding: 2px 8px; border-radius: 4px; font-size: 12px; font-weight: 500; background-color: var(--color-primary, #552a47); color: white;">${question.questionType}</span>
                        </div>
                        
                        ${isTextQuestion(question.questionType) && question.latestResponses && question.latestResponses.length > 0 ? `
                          <!-- Text Responses -->
                          <div style="margin-top: 20px;">
                            <div style="font-size: 14px; font-weight: 500; color: #4b5563; margin-bottom: 8px;">
                              Latest Responses (${question.latestResponses.length})
                            </div>
                            
                            ${question.latestResponses.length > 0 ? `
                              <div style="display: flex; flex-direction: column; gap: 16px; margin-top: 12px;">
                                ${question.latestResponses.map((response, responseIndex) => `
                                  <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 16px; margin-bottom: 4px;">
                                    <div style="font-size: 14px; color: #334155; margin-bottom: 4px;">${response.answer}</div>
                                    <div style="font-size: 12px; color: #64748b; font-style: italic;">
                                      ${new Date(response.date).toLocaleDateString()} ${new Date(response.date).toLocaleTimeString()}
                                    </div>
                                  </div>
                                `).join('')}
                              </div>
                            ` : `
                              <div style="padding: 20px 0; text-align: center; color: #666; background-color: #f9fafb; border-radius: 4px; border: 1px dashed #d1d5db;">
                                <p style="margin: 0;">No responses yet</p>
                              </div>
                            `}
                          </div>
                        ` : `
                          <!-- Bar Chart -->
                          <div style="margin-top: 15px; margin-bottom: 20px;">
                            ${hasResponses(question.progress) ? `
                              <div style="display: flex; height: 32px; width: 100%; border-radius: 4px; overflow: hidden; margin-bottom: 16px;">
                                ${Object.entries(question.progress).map(([label, percentage]) => `
                                  <div style="height: 100%; width: ${percentage}%; background-color: ${getColorForOption(label)}; position: relative;">
                                    ${percentage > 5 ? `<div style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); color: white; font-size: 12px; font-weight: 500; text-shadow: 0 0 2px rgba(0,0,0,0.5);">${percentage}%</div>` : ''}
                                  </div>
                                `).join('')}
                              </div>
                              
                              <div style="display: flex; flex-wrap: wrap; gap: 16px; margin-top: 16px; padding: 4px 0;">
                                ${Object.entries(question.progress).map(([label, percentage]) => `
                                  <div style="display: flex; align-items: center; gap: 6px; font-size: 12px; color: #64748b;">
                                    <div style="width: 12px; height: 12px; border-radius: 50%; background-color: ${getColorForOption(label)};"></div>
                                    ${label}: ${percentage}%
                                  </div>
                                `).join('')}
                              </div>
                            ` : `
                              <div style="padding: 20px 0; text-align: center; color: #666; background-color: #f9fafb; border-radius: 4px; border: 1px dashed #d1d5db; margin-bottom: 10px;">
                                <p style="margin: 0;">No responses yet</p>
                              </div>
                            `}
                          </div>
                        `}
                      </div>
                    `).join('')}
                  `;
                }
              })()}
            </div>
          `;
          }).join('')}
        </body>
      </html>
    `;
    
    // Helper function to check if question type is text-based
    function isTextQuestion(questionType: string): boolean {
      return ['text', 'textarea', 'date'].includes(questionType);
    }
    
    // Helper function to check if there are any responses
    function hasResponses(progress: Record<string, number>): boolean {
      return Object.values(progress).some(value => value > 0);
    }
    
    // Helper function to get color for option
    function getColorForOption(optionName: string): string {
      // Base color mapping for common response categories
      const baseColorMap: Record<string, string> = {
        'Strongly Disagree': '#ef4444', // Red
        'Disagree': '#f97316', // Orange
        'Neutral': '#6b7280', // Gray
        'Neither Agree nor Disagree': '#6b7280', // Gray (same as Neutral)
        'Agree': '#10b981', // Green
        'Strongly Agree': '#059669', // Dark Green
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
      
      // Use the hash to select a color from our predefined list
      const colorIndex = hashCode(optionName) % predefinedColors.length;
      return predefinedColors[colorIndex];
    }
    
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
    
    return true;
  } catch (error) {
    console.error('Error generating analytics export:', error);
    return false;
  }
};
