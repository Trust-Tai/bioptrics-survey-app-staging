import React from 'react';

// Mock data for static design
const mockData = {
  reportTitle: "Survey Report",
  reportSubtitle: "Comprehensive Analysis",
  description: "This report provides an analysis of survey responses, organized by tags and questions.",
  date: new Date().toLocaleDateString(),
  logoUrl: "/bioptrics_fixed_black.png", // Using existing logo from public folder
  totalRespondents: 324, // Total number of survey respondents
  parentTags: [
    {
      id: "pt1",
      name: "Leadership and Accountability",
      description: "Actions, behaviors, and strategies employed by individuals in leadership roles to actively promote, guide and sustain a safe and inclusive work environment.",
      childTags: [
        {
          id: "ct1",
          name: "Communication Effectiveness",
          description: "Measures how effectively leadership communicates expectations and feedback.",
          questions: [
            {
              id: "q1",
              title: "How frequently do you engage in conversations with your team members to understand their challenges while discussing accountability?",
              description: "This question assesses the frequency and quality of accountability discussions.",
              responseOverview: "100% Positive from HLT Responses, 79% Positive from Workforce Responses",
              respondents: 324,
              options: [
                { label: "Very Frequently", count: 105, percentage: 32, color: "#689F38" },
                { label: "Frequently", count: 72, percentage: 22, color: "#AFD259" },
                { label: "Sometimes", count: 85, percentage: 26, color: "#FFC107" },
                { label: "Rarely", count: 42, percentage: 13, color: "#FF9800" },
                { label: "Never", count: 20, percentage: 7, color: "#F44336" }
              ]
            },
            {
              id: "q2",
              title: "How well do you think your direct supervisor balances holding team members accountable with showing empathy?",
              description: "This question evaluates leadership's ability to balance accountability with empathy.",
              responseOverview: "79% Positive, 12% Neutral, 5% Unfavorable, 4% DNC",
              respondents: 312,
              options: [
                { label: "Very Well", count: 98, percentage: 31, color: "#689F38" },
                { label: "Well", count: 149, percentage: 48, color: "#AFD259" },
                { label: "Neutral", count: 37, percentage: 12, color: "#FFC107" },
                { label: "Poorly", count: 16, percentage: 5, color: "#FF9800" },
                { label: "Very Poorly", count: 12, percentage: 4, color: "#F44336" }
              ]
            }
          ]
        },
        {
          id: "ct2",
          name: "Psychological Safety",
          description: "Measures the level of psychological safety within teams.",
          questions: [
            {
              id: "q3",
              title: "I feel psychologically safe to speak up about workplace concerns.",
              description: "This question assesses the psychological safety climate in the workplace.",
              responseOverview: "56% Agree/Strongly Agree, 27% Neutral, 17% Disagree/Strongly Disagree",
              respondents: 324,
              options: [
                { label: "Strongly Agree", count: 110, percentage: 34, color: "#689F38" },
                { label: "Agree", count: 72, percentage: 22, color: "#AFD259" },
                { label: "Neutral", count: 87, percentage: 27, color: "#FFC107" },
                { label: "Disagree", count: 42, percentage: 13, color: "#FF9800" },
                { label: "Strongly Disagree", count: 13, percentage: 4, color: "#F44336" }
              ]
            }
          ]
        }
      ]
    },
    {
      id: "pt2",
      name: "Workplace Culture",
      description: "The shared values, beliefs, attitudes and behaviors that characterize the workplace environment.",
      childTags: [
        {
          id: "ct3",
          name: "Inclusion",
          description: "Measures how inclusive the workplace is for all employees.",
          questions: [
            {
              id: "q4",
              title: "I feel included and valued as a member of my team.",
              description: "This question evaluates the sense of belonging and value in the team.",
              responseOverview: "68% Agree/Strongly Agree, 22% Neutral, 10% Disagree/Strongly Disagree",
              respondents: 320,
              options: [
                { label: "Strongly Agree", count: 96, percentage: 30, color: "#689F38" },
                { label: "Agree", count: 122, percentage: 38, color: "#AFD259" },
                { label: "Neutral", count: 70, percentage: 22, color: "#FFC107" },
                { label: "Disagree", count: 22, percentage: 7, color: "#FF9800" },
                { label: "Strongly Disagree", count: 10, percentage: 3, color: "#F44336" }
              ]
            }
          ]
        }
      ]
    }
  ]
};

// CSS styles for the PDF preview component
const styles = {
  // General styles
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#FFFFFF',
  },
  section: {
    margin: '10px 0',
    padding: '10px',
  },
  
  // Cover page styles
  coverPage: {
    display: 'flex',
    flexDirection: 'column' as const,
    justifyContent: 'space-between',
    minHeight: '800px',
    position: 'relative' as const,
    padding: '20px',
    marginBottom: '40px',
    border: '1px solid #EEEEEE',
  },
  coverHeader: {
    display: 'flex',
    alignItems: 'center',
  },
  accentBar: {
    height: '60px',
    backgroundColor: '#552a47',
    marginBottom: '40px',
  },
  reportTitle: {
    fontSize: '32px',
    color: '#552a47',
    textAlign: 'center',
    marginBottom: '10px',
  },
  reportSubtitle: {
    fontSize: '20px',
    color: '#46223b',
    textAlign: 'center',
    marginBottom: '20px',
  },
  reportDescription: {
    fontSize: '14px',
    textAlign: 'center',
    maxWidth: '500px',
    margin: '0 auto 40px',
  },
  footer: {
    marginTop: '60px',
    borderTop: '1px solid #eee',
    paddingTop: '20px',
  },
  footerText: {
    fontSize: '12px',
    color: '#666',
    marginBottom: '5px',
  },
  dateDisplay: {
    position: 'absolute',
    top: '20px',
    right: '20px',
    fontSize: '12px',
    color: '#666',
    margin: '0',
    padding: '5px',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
  contentPage: {
    position: 'relative',
    paddingTop: '40px',
    minHeight: '90vh',
    boxSizing: 'border-box',
  },
  parentTagHeader: {
    backgroundColor: '#552a47',
    color: 'white',
    padding: '10px',
    marginBottom: '15px',
  },
  parentTagTitle: {
    fontSize: '18px',
    margin: '0',
  },
  parentTagDescription: {
    fontSize: '12px',
    margin: '5px 0 0',
  },
  childTag: {
    marginLeft: '20px',
    marginBottom: '20px',
    padding: '10px',
    backgroundColor: '#f8f8f8',
    borderLeft: '3px solid #552a47',
  },
  childTagTitle: {
    fontSize: '16px',
    color: '#552a47',
    margin: '0 0 5px',
  },
  childTagDescription: {
    fontSize: '12px',
    margin: '0 0 10px',
  },
  question: {
    marginLeft: '20px',
    marginBottom: '15px',
    padding: '10px',
    border: '1px solid #eee',
    borderRadius: '5px',
  },
  questionTitle: {
    fontSize: '14px',
    fontWeight: 'bold',
    margin: '0 0 5px',
  },
  questionDescription: {
    fontSize: '12px',
    color: '#666',
    margin: '0 0 5px',
  },
  responseOverview: {
    fontSize: '12px',
    fontStyle: 'italic',
    color: '#46223b',
    margin: '0',
  },
  respondentCount: {
    fontSize: '12px',
    color: '#666666',
    marginBottom: '10px',
    fontStyle: 'italic',
  },
  chartContainer: {
    marginTop: '15px',
    marginBottom: '15px',
    display: 'flex',
    justifyContent: 'space-around',
    alignItems: 'flex-end',
    height: '250px',
  },
  barChart: {
    display: 'flex',
    flexDirection: 'row',
    gap: '10px',
    marginBottom: '15px',
    height: '100%',
    alignItems: 'flex-end',
    width: '100%',
    justifyContent: 'center',
  },
  barContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    height: '100%',
    position: 'relative',
    flex: '1',
    maxWidth: '80px',
    minWidth: '50px',
  },
  barLabel: {
    width: '100%',
    fontSize: '11px',
    textAlign: 'center',
    paddingTop: '5px',
    color: '#333333',
    wordWrap: 'break-word',
    overflowWrap: 'break-word',
    height: '40px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  barWrapper: {
    width: '40px',
    height: '80%',
    backgroundColor: 'transparent',
    position: 'relative',
    display: 'flex',
    alignItems: 'flex-end',
  },
  bar: {
    width: '100%',
    position: 'absolute',
    left: '0',
    bottom: '0',
    borderTopLeftRadius: '3px',
    borderTopRightRadius: '3px',
  },
  barValue: {
    fontSize: '10px',
    textAlign: 'center',
    marginTop: '5px',
    marginBottom: '5px',
    color: '#333333',
    width: '100%',
    height: '20px',
  },
  pageNumber: {
    textAlign: 'center',
    fontSize: '12px',
    color: '#666666',
    marginTop: '20px',
  },
  buttonContainer: {
    marginTop: '20px',
    textAlign: 'center' as const,
  },
  button: {
    backgroundColor: '#552a47',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  }
};

// HTML-based Survey Report Preview Component
const SurveyReportPreview: React.FC = () => {
  return (
    <div id="survey-report" style={styles.container}>
      {/* Cover Page */}
      <div style={styles.coverPage}>
        <div style={styles.accentBar}></div>
        
        <div style={styles.coverHeader}>
          <img style={styles.logo} src={mockData.logoUrl} alt="Company Logo" />
        </div>
        
        <div style={styles.coverContent}>
          <h1 style={styles.title}>{mockData.reportTitle}</h1>
          <h2 style={styles.subtitle}>{mockData.reportSubtitle}</h2>
          <p style={styles.description}>{mockData.description}</p>
        </div>
        
        <div style={styles.coverFooter}>
          <p style={styles.footerText}>Generated Date: {mockData.date}</p>
        </div>
        
        <div style={styles.pageNumber}>1</div>
      </div>
      
      {/* Content Pages - Tags & Questions */}
      {mockData.parentTags.map((parentTag, parentIndex) => (
        <div key={parentTag.id} style={styles.contentPage}>
          <div style={styles.header}>
            <h3>Survey Analysis - Tags & Questions</h3>
          </div>
          
          <div style={styles.parentTag}>
            <div style={styles.parentTagHeader}>
              <h3 style={styles.parentTagTitle}>{parentTag.name}</h3>
              <p style={styles.parentTagDescription}>{parentTag.description}</p>
            </div>
            
            {parentTag.childTags.map((childTag) => (
              <div key={childTag.id} style={styles.childTag}>
                <h4 style={styles.childTagTitle}>{childTag.name}</h4>
                <p style={styles.childTagDescription}>{childTag.description}</p>
                
                {childTag.questions.map(question => (
                  <div key={question.id} style={styles.question}>
                    <h5 style={styles.questionTitle}>{question.title}</h5>
                    <p style={styles.questionDescription}>{question.description}</p>
                    <p style={styles.respondentCount}>({question.respondents} of {mockData.totalRespondents} respondents answered this question)</p>
                    <p style={styles.responseOverview}>Response Overview: {question.responseOverview}</p>
                    
                    <div style={styles.chartContainer}>
                      <div style={styles.barChart}>
                        {question.options.map((option, optionIndex) => (
                          <div key={`option-${question.id}-${optionIndex}`} style={styles.barContainer}>
                            <div style={styles.barWrapper}>
                              <div style={{ ...styles.bar, height: `${option.percentage}%`, backgroundColor: option.color }}></div>
                            </div>
                            <div style={styles.barValue}>{option.count} ({option.percentage}%)</div>
                            <div style={styles.barLabel}>{option.label}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ))}
          </div>
          
          <div style={styles.pageNumber}>{parentIndex + 2}</div>
        </div>
      ))}
      
      <div style={styles.buttonContainer}>
        <button 
          style={styles.button} 
          onClick={() => generateSurveyReportPDF()}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

// Function to generate and print the report
export const generateSurveyReportPDF = (reportData?: any) => {
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
          top: 20px;
          right: 20px;
          font-size: 12px;
          color: #666;
          margin: 0;
          padding: 5px;
          background-color: rgba(255, 255, 255, 0.8);
        }
        .content-page {
          position: relative;
          padding-top: 40px;
          min-height: 90vh;
          box-sizing: border-box;
        }
        .parent-tag-header {
          background-color: #552a47;
          color: white;
          padding: 10px;
          margin-bottom: 15px;
        }
        .parent-tag-title {
          font-size: 18px;
          margin: 0;
        }
        .parent-tag-description {
          font-size: 12px;
          margin: 5px 0 0;
        }
        .child-tag {
          margin-left: 20px;
          margin-bottom: 20px;
          padding: 10px;
          background-color: #f8f8f8;
          border-left: 3px solid #552a47;
        }
        .child-tag-title {
          font-size: 16px;
          color: #552a47;
          margin: 0 0 5px;
        }
        .child-tag-description {
          font-size: 12px;
          margin: 0 0 10px;
        }
        .question {
          margin-left: 20px;
          margin-bottom: 15px;
          padding: 10px;
          border: 1px solid #eee;
          border-radius: 5px;
        }
        .question-title {
          font-size: 14px;
          font-weight: bold;
          margin: 0 0 5px;
        }
        .question-description {
          font-size: 12px;
          color: #666;
          margin: 0 0 5px;
        }
        .response-overview {
          font-size: 12px;
          font-style: italic;
          color: #46223b;
          margin: 0;
        }
      }
    `;
    
    // Generate the HTML content for the report
    const reportContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Survey Report</title>
          <style>
            ${printStyles}
            @page {
              margin: 0.5in;
            }
            body {
              margin: 0;
              padding: 0;
            }
            .date-display {
              position: absolute;
              top: 10px;
              right: 10px;
              font-size: 12px;
              color: #666;
            }
            .chart-container {
              margin-top: 15px;
              margin-bottom: 15px;
              display: flex;
              justify-content: space-around;
              align-items: flex-end;
              height: 250px;
            }
            .bar-chart {
              display: flex;
              flex-direction: row;
              gap: 10px;
              margin-bottom: 15px;
              height: 100%;
              align-items: flex-end;
              width: 100%;
              justify-content: center;
            }
            .bar-container {
              display: flex;
              flex-direction: column;
              align-items: center;
              height: 100%;
              position: relative;
              flex: 1;
              max-width: 80px;
              min-width: 50px;
            }
            .bar-label {
              width: 100%;
              font-size: 11px;
              text-align: center;
              padding-top: 5px;
              color: #333333;
              word-wrap: break-word;
              overflow-wrap: break-word;
              height: 40px;
              display: flex;
              align-items: center;
              justify-content: center;
            }
            .bar-wrapper {
              width: 40px;
              height: 80%;
              background-color: transparent;
              position: relative;
              display: flex;
              align-items: flex-end;
            }
            .bar {
              width: 100%;
              position: absolute;
              left: 0;
              bottom: 0;
              border-top-left-radius: 3px;
              border-top-right-radius: 3px;
            }
            .bar-value {
              font-size: 10px;
              text-align: center;
              margin-top: 5px;
              margin-bottom: 5px;
              color: #333333;
              width: 100%;
              height: 20px;
            }
            .respondent-count {
              font-size: 12px;
              color: #666666;
              margin-bottom: 10px;
              font-style: italic;
            }
          </style>
        </head>
        <body>
          <!-- Cover Page -->
          <div class="cover-page">
            <div>
              <div class="accent-bar"></div>
              <div style="text-align: center; margin-bottom: 40px;">
                <img src="${mockData.logoUrl}" alt="Company Logo" style="width: 150px;" />
              </div>
              
              <h1 class="report-title">${mockData.reportTitle}</h1>
              <h2 class="report-subtitle">${mockData.reportSubtitle}</h2>
              <p class="report-description">${mockData.description}</p>
            </div>
            
            <div class="footer">
              <p class="footer-text">Generated Date: ${mockData.date}</p>
            </div>
          </div>
          
          <!-- Content Pages - No blank page -->
          ${mockData.parentTags.map((parentTag, parentIndex) => `
            <div class="page-break"></div>
            <div class="content-page">
              <h3 style="margin-bottom: 20px;">Survey Analysis - Tags & Questions</h3>
              
              <div>
                <div class="parent-tag-header">
                  <h3 class="parent-tag-title">${parentTag.name}</h3>
                  <p class="parent-tag-description">${parentTag.description}</p>
                </div>
                
                ${parentTag.childTags.map(childTag => `
                  <div class="child-tag">
                    <h4 class="child-tag-title">${childTag.name}</h4>
                    <p class="child-tag-description">${childTag.description}</p>
                    
                    ${childTag.questions.map(question => `
                      <div class="question">
                        <h5 class="question-title">${question.title}</h5>
                        <p class="question-description">${question.description}</p>
                        <p class="respondent-count">(${question.respondents} of ${mockData.totalRespondents} respondents answered this question)</p>
                        <p class="response-overview">${question.responseOverview}</p>
                        
                        <div class="chart-container">
                          <div class="bar-chart">
                            ${question.options.map(option => `
                              <div class="bar-container">
                                <div class="bar-wrapper">
                                  <div class="bar" style="height: ${option.percentage}%; background-color: ${option.color};"></div>
                                </div>
                                <div class="bar-value">${option.count} (${option.percentage}%)</div>
                                <div class="bar-label">${option.label}</div>
                              </div>
                            `).join('')}
                          </div>
                        </div>
                      </div>
                    `).join('')}
                  </div>
                `).join('')}
              </div>
            </div>
          `).join('')}
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
    console.error('Error generating report:', error);
    // Log error but don't show alert to user
  }
};

// Export components
export default {
  generateSurveyReportPDF,
  SurveyReportPreview
};

