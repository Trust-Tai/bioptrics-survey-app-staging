/**
 * QuestionReportPDF.ts
 * PDF generation for question response data
 * Styled to match existing survey reports
 */

// Define interface for question report data
export interface QuestionReportData {
  reportTitle: string;
  reportSubtitle: string;
  description: string;
  date: string;
  logoUrl: string;
  totalRespondents: number;
  question: {
    id: string;
    title: string;
    questionText?: string;
    description: string;
    responseType: string;
    responseOverview: string;
    respondents: number;
    categoryTags?: string[];
    currentVersion?: number;
    versions?: Array<{
      questionText: string;
      description: string;
      responseType: string;
      options?: Array<{
        text: string;
        value: string;
      }>;
    }>;
    options: Array<{
      label: string;
      count: number;
      percentage: number;
      color: string;
    }>;
    textResponses?: string[];
  };
}

// Function to generate a PDF from question response data
export const generateQuestionReportPDF = (data: QuestionReportData) => {
  // Debug logging for report data structure
  console.log('generateQuestionReportPDF received data:', data);
  
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
        .report-description {
          font-size: 14px;
          text-align: center;
          max-width: 500px;
          margin: 0 auto 40px;
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
        .question-title {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 10px;
          color: #333;
          border-bottom: 1px solid #e0e0e0;
          padding-bottom: 8px;
        }
        .question-description {
          font-size: 14px;
          color: #555;
          margin-bottom: 8px;
        }
        .categories {
          font-size: 13px;
          color: #666;
          margin-bottom: 8px;
        }
        .categories::before {
          content: 'Categories: ';
          font-weight: bold;
        }
        .response-overview {
          font-size: 14px;
          font-weight: bold;
          color: #333;
          margin-top: 10px;
          margin-bottom: 10px;
        }
        .response-overview::before {
          content: 'Response Overview: ';
          font-weight: normal;
          color: #666;
        }
        .respondent-count {
          font-size: 12px;
          color: #777;
          font-style: italic;
          margin-bottom: 5px;
        }
        .chart-container {
          margin-top: 25px;
          margin-bottom: 30px;
          background: #f8f9fa;
          border-radius: 12px;
          padding: 20px;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
        }
        .bar-chart {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 15px;
        }
        .bar-container {
          display: flex;
          width: 100%;
          margin-bottom: 8px;
          border: 1px dotted #999;
          border-radius: 4px;
          padding: 8px;
          background-color: #f9f9f9;
        }
        .bar-label {
          font-size: 12px;
          color: #333;
          width: 25%;
          padding-right: 10px;
          font-weight: bold;
        }
        .bar-wrapper {
          flex-grow: 1;
          height: 25px;
          background-color: #f0f0f0;
          border: 1px solid #ddd;
          position: relative;
          border-radius: 11px;
          overflow: hidden;
          max-width: 70%;
        }
        .bar {
          height: 100%;
          position: absolute;
          left: 0;
          top: 0;
          background-color: #6495ED;
          border-right: 1px solid #5a86d6;
          border-radius: 10px;
        }
        .bar-value {
          position: absolute;
          right: -40px;
          top: 50%;
          transform: translateY(-50%);
          font-size: 12px;
          color: #333;
          z-index: 1;
          width: 40px;
          text-align: left;
        }
        .text-responses-section {
          margin-top: 30px;
        }
        .text-response {
          background-color: #f9f9f9;
          padding: 12px;
          margin-bottom: 10px;
          border-radius: 4px;
          border-left: 3px solid var(--color-primary, #552a47);
        }
      }
    `;
    
    // Generate the HTML content for the report
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Question Report</title>
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
            .date-display {
              position: absolute;
              top: 10px;
              right: 10px;
              font-size: 12px;
              color: #666;
            }
          </style>
        </head>
        <body>
          <!-- Cover Page -->
          <div class="cover-page">
            <div>
              <div class="accent-bar"></div>
              <div style="text-align: center; margin-bottom: 40px;">
                <img src="${data.logoUrl}" alt="Company Logo" style="width: 150px;" />
              </div>
              
              <h1 class="report-title">${data.reportTitle}</h1>
              <h2 class="report-subtitle">${getQuestionText(data.question)}</h2>
              <p class="report-description">${data.description}</p>
            </div>
            
            <div class="footer">
              <p class="footer-text">Generated Date: ${data.date}</p>
            </div>
          </div>
          
          <!-- Content Page -->
          <div class="page-break"></div>
          <div class="content-page">
            <!-- General Questions Section Header -->
            <div class="section-header">
              <h3 class="section-title">Question Response Analysis</h3>
              <p class="section-description">Analysis of responses for the selected question</p>
            </div>
            
            <!-- Question Content -->
            <div style="padding: 15px; background-color: #f9f9f9; border-radius: 4px;">
              <h5 class="question-title">${getQuestionText(data.question)}</h5>
              <p class="question-description">${data.question.description || ''}</p>
              
              ${data.question.categoryTags && data.question.categoryTags.length > 0 ? 
                `<p class="categories" style="font-weight: bold; color: #333; margin-bottom: 10px;">
                  <span style="color:var(--color-primary, #552a47);">${data.question.categoryTags.join(', ')}</span>
                </p>` : 
                ''
              }
              
              <p class="respondent-count">(${data.question.respondents} of ${data.totalRespondents} respondents answered this question)</p>
              <p class="response-overview">${data.question.responseOverview}</p>
              
              <!-- Chart Container -->
              <div class="chart-container">
                <div class="bar-chart">
                  ${(() => {
                    // Sort options by index to maintain original order
                    const sortedOptions = [...data.question.options];
                    
                    return sortedOptions.map((option, index) => {
                      // Color based on option position (from reference image)
                      let color;
                      if (index === 0) {
                        color = '#78b04a'; // Green (Strongly Agree)
                      } else if (index === 1) {
                        color = '#a7d16c'; // Light green (Agree)
                      } else if (index === 2) {
                        color = '#f9c74f'; // Yellow (Neither)
                      } else if (index === 3) {
                        color = '#e07a5f'; // Orange (Disagree)
                      } else if (index === 4) {
                        color = '#e63946'; // Red (Strongly Disagree)
                      } else {
                        // For any additional options
                        color = '#6495ED'; // Blue
                      }
                      
                      // For zero percentage, use light gray
                      if (option.percentage === 0) {
                        color = '#E0E0E0'; // Gray
                      }
                      
                      return `
                      <div class="bar-container" style="${option.percentage === 0 ? 'background-color: #f5f5f5;' : ''}">
                        <div class="bar-label">${option.label}</div>
                        <div class="bar-wrapper">
                          <div class="bar" style="width: ${option.percentage > 0 ? option.percentage : 2}%; ${option.percentage === 0 ? 'background-color: #e0e0e0; border-right: 1px dashed #ccc;' : `background-color: ${color}; border-right: 1px solid ${color};`}">
                            ${option.percentage > 0 ? `<span style="position: absolute; left: 50%; top: 50%; transform: translate(-50%, -50%); color: white; font-size: 11px; font-weight: bold;">${option.percentage}%</span>` : ''}
                          </div>
                          <div class="bar-value" style="${option.percentage === 0 ? 'color: #777;' : ''}">${option.count}</div>
                        </div>
                      </div>
                      `;
                    }).join('');
                  })()}
                </div>
              </div>
              
              <!-- Text Responses Section -->
              ${data.question.textResponses && data.question.textResponses.length > 0 ? `
                <div class="text-responses-section">
                  <h4 style="color: var(--color-primary, #552a47); margin-top: 30px; margin-bottom: 15px;">Text Responses</h4>
                  ${data.question.textResponses.map((response, index) => `
                    <div class="text-response">
                      <strong>${index + 1}.</strong> ${response}
                    </div>
                  `).join('')}
                </div>
              ` : ''}
            </div>
          </div>
        </body>
      </html>
    `;
    
    // Helper function to get question text from versions array if available
    function getQuestionText(question: any): string {
      // First try to get from versions array
      if (question.versions && question.versions.length > 0) {
        const versionIndex = question.currentVersion !== undefined ? question.currentVersion : question.versions.length - 1;
        const version = question.versions[versionIndex];
        if (version && version.questionText) {
          return version.questionText;
        }
      }
      
      // Fall back to direct questionText or title
      return question.questionText || question.title || 'Untitled Question';
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
    console.error('Error generating report:', error);
    return false;
  }
};

