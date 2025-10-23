import React from 'react';
import { ReportData, ParentTag, ChildTag, QuestionReport, OptionReport } from './SurveyReportPDFTypes';

// No mock data needed - using real data from server

// CSS styles for the PDF preview component
const styles = {
  // General styles
  container: {
    fontFamily: 'Arial, sans-serif',
    maxWidth: '800px',
    margin: '0 auto',
    padding: '20px',
    backgroundColor: '#ffffff',
  },
  logo: {
    width: '150px',
    marginBottom: '20px',
  },
  coverContent: {
    textAlign: 'center' as const,
    marginBottom: '40px',
  },
  coverFooter: {
    marginTop: '40px',
    textAlign: 'center' as const,
  },
  header: {
    marginBottom: '20px',
    borderBottom: '1px solid #eee',
    paddingBottom: '10px',
  },
  parentTag: {
    marginBottom: '30px',
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
    backgroundColor: 'var(--color-primary, #552a47)',
    marginBottom: '40px',
  },
  reportTitle: {
    fontSize: '32px',
    color: 'var(--color-primary, #552a47)',
    textAlign: 'center' as const,
    marginBottom: '10px',
  },
  reportSubtitle: {
    fontSize: '20px',
    color: '#46223b',
    textAlign: 'center' as const,
    marginBottom: '20px',
  },
  reportDescription: {
    fontSize: '14px',
    textAlign: 'center' as const,
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
    backgroundColor: 'var(--color-primary, #552a47)',
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
    borderLeft: '3px solid var(--color-primary, #552a47)',
  },
  childTagTitle: {
    fontSize: '16px',
    color: 'var(--color-primary, #552a47)',
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
  categories: {
    fontSize: '13px',
    color: '#666',
    marginBottom: '8px',
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
    textAlign: 'center' as const,
    paddingTop: '5px',
    color: '#333333',
    wordWrap: 'break-word' as const,
    overflowWrap: 'break-word' as const,
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
    textAlign: 'center' as const,
    marginTop: '5px',
    marginBottom: '5px',
    color: '#333333',
    width: '100%',
    height: '20px',
  },
  pageNumber: {
    textAlign: 'center' as const,
    fontSize: '12px',
    color: '#666666',
    marginTop: '20px',
  },
  buttonContainer: {
    marginTop: '20px',
    textAlign: 'center' as const,
  },
  button: {
    backgroundColor: 'var(--color-primary, #552a47)',
    color: 'white',
    padding: '10px 20px',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '14px',
  }
};

// Define interface for report data
export interface SurveyReportData {
  reportTitle: string;
  reportSubtitle: string;
  description: string;
  date: string;
  logoUrl: string;
  totalRespondents: number;
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
      }>;
    }>;
  }>;
}

interface SurveyReportPreviewProps {
  reportData?: SurveyReportData;
}

export const SurveyReportPDFPreview: React.FC<SurveyReportPreviewProps> = ({ reportData }) => {
  // Debug logging for report data structure
  console.log('SurveyReportPDF received data:', reportData);
  console.log('Parent tags count:', reportData?.parentTags?.length || 0);
  
  if (reportData?.parentTags && reportData.parentTags.length > 0) {
    reportData.parentTags.forEach((parentTag: any, i: number) => {
      console.log(`Parent tag ${i+1}: ${parentTag.name}, child tags: ${parentTag.childTags?.length || 0}`);
      
      if (parentTag.childTags?.length > 0) {
        parentTag.childTags.forEach((childTag: any, j: number) => {
          console.log(`  Child tag ${j+1}: ${childTag.name}, questions: ${childTag.questions?.length || 0}`);
          
          if (childTag.questions?.length > 0) {
            console.log(`    First question: ${childTag.questions[0].title}, options: ${childTag.questions[0].options?.length || 0}`);
          } else {
            console.log('    No questions in this child tag');
          }
        });
      }
    });
  }
  // Use provided data
  const data = reportData as ReportData;
  return (
    <div id="survey-report" style={styles.container}>
      {/* Cover Page */}
      <div style={styles.coverPage}>
        <div style={styles.accentBar}></div>
        
        <div>
          <img style={{width: '150px', marginBottom: '20px'}} src={data.logoUrl} alt="Company Logo" />
        </div>
        
        <div style={{textAlign: 'center', marginBottom: '40px'}}>
          <h1 style={styles.reportTitle}>{data.reportTitle}</h1>
          <h2 style={styles.reportSubtitle}>{data.reportSubtitle}</h2>
          <p style={styles.reportDescription}>{data.description}</p>
        </div>
        
        <div style={{marginTop: '40px', textAlign: 'center'}}>
          <p style={styles.footerText}>Generated Date: {data.date}</p>
        </div>
        
        <div style={styles.pageNumber}>1</div>
      </div>
      
      {/* Content Pages - Tags & Questions */}
      {data.parentTags.map((parentTag: ParentTag, parentIndex: number) => (
        <div key={parentTag.id} style={styles.contentPage}>
          <div style={{marginBottom: '20px', borderBottom: '1px solid #eee', paddingBottom: '10px'}}>
          </div>
          
          <div style={{marginBottom: '30px'}}>
            <div style={styles.parentTagHeader}>
              <h3 style={styles.parentTagTitle}>{parentTag.name}</h3>
              <p style={styles.parentTagDescription}>{parentTag.description}</p>
            </div>
            
            {parentTag.childTags.map((childTag: any) => (
              <div key={childTag.id} style={styles.childTag}>
                <h4 style={styles.childTagTitle}>{childTag.name}</h4>
                <p style={styles.childTagDescription}>{childTag.description}</p>
                
                {childTag.questions.map((question: any) => {
                  console.log(`QUESTION ID IN PDF: ${question.id}`);
                  console.log(`FULL QUESTION OBJECT:`, JSON.stringify(question, null, 2));
                  console.log(`categoryTags type: ${typeof question.categoryTags}`);
                  console.log(`categoryTags value:`, question.categoryTags);
                  console.log(`options type: ${typeof question.options}`);
                  console.log(`options value:`, question.options);
                  return (
                  <div key={question.id} style={styles.question}>
                    <h5 style={styles.questionTitle}>{question.title}</h5>
                    <p style={styles.questionDescription}>{question.description}</p>
                    {/* Debug categoryTags */}
                    <>{console.log(`Rendering question ${question.id} with categoryTags:`, question.categoryTags)}</>
                    
                    {/* Force display of categories */}
                    <p style={{...styles.categories, fontWeight: 'bold', color: '#333', marginBottom: '10px'}}>
                      Categories: <span style={{color: '#0066cc'}}>
                        {Array.isArray(question.categoryTags) && question.categoryTags.length > 0 
                          ? question.categoryTags.join(', ') 
                          : 'None'}
                      </span>
                    </p>
                    <p style={styles.respondentCount}>({question.respondents} of {data.totalRespondents} respondents answered this question)</p>
                    <p style={styles.responseOverview}>Response Overview: {question.responseOverview}</p>
                    
                    <div style={styles.chartContainer}>
                      <div style={styles.barChart}>
                        {question.options.map((option: any, optionIndex: number) => (
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
                );})}
              </div>
            ))}
          </div>
          
          <div style={styles.pageNumber}>{parentIndex + 2}</div>
        </div>
      ))}
      
      <div style={styles.buttonContainer}>
        <button 
          style={styles.button} 
          onClick={() => generateSurveyReportPDF(data)}
        >
          Download PDF
        </button>
      </div>
    </div>
  );
};

// Function to generate and print the report
export const generateSurveyReportPDF = (reportData: SurveyReportData) => {
  // Debug logging for report data structure
  console.log('generateSurveyReportPDF received data:', reportData);
  console.log('Parent tags count:', reportData?.parentTags?.length || 0);
  
  if (reportData?.parentTags && reportData.parentTags.length > 0) {
    reportData.parentTags.forEach((parentTag: any, i: number) => {
      console.log(`Parent tag ${i+1}: ${parentTag.name}, child tags: ${parentTag.childTags?.length || 0}`);
      
      if (parentTag.childTags?.length > 0) {
        parentTag.childTags.forEach((childTag: any, j: number) => {
          console.log(`  Child tag ${j+1}: ${childTag.name}, questions: ${childTag.questions?.length || 0}`);
          
          if (childTag.questions?.length > 0) {
            console.log(`    First question: ${childTag.questions[0].title}, options: ${childTag.questions[0].options?.length || 0}`);
          } else {
            console.log('    No questions in this child tag');
          }
        });
      }
    });
  }
  
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
        .parent-tag-header {
          background-color: var(--color-primary, #552a47);
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
          border-left: 3px solid var(--color-primary, #552a47);
        }
        .child-tag-title {
          font-size: 16px;
          color: var(--color-primary, #552a47);
          margin: 0 0 5px;
        }
        .child-tag-description {
          font-size: 12px;
          margin: 0 0 10px;
        }
        .question {
          margin-left: 20px;
          margin-bottom: 25px;
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
              <p class="report-description">${reportData.description}</p>
            </div>
            
            <div class="footer">
              <p class="footer-text">Generated Date: ${reportData.date}</p>
            </div>
          </div>
          
          <!-- Content Pages - No blank page -->
          ${reportData.parentTags.map((parentTag, parentIndex) => `
            <div class="page-break"></div>
            <div class="content-page">
              
              <div>
                <div class="parent-tag-header">
                  <h3 class="parent-tag-title">${parentTag.name}</h3>
                  <p class="parent-tag-description">${parentTag.description}</p>
                </div>
                
                ${parentTag.childTags && parentTag.childTags.length > 0 ? parentTag.childTags.map(childTag => `
                  <div class="child-tag">
                    <h4 class="child-tag-title">${childTag.name}</h4>
                    <p class="child-tag-description">${childTag.description}</p>
                    
                    ${childTag.questions && childTag.questions.length > 0 ? childTag.questions.map(question => `
                      <div class="question">
                        <h5 class="question-title">${question.title}</h5>
                        <p class="question-description">${question.description}</p>
                        <p class="categories" style="font-weight: bold; color: #333; margin-bottom: 10px;"><span style="color:var(--color-primary, #552a47);">${Array.isArray(question.categoryTags) && question.categoryTags.length > 0 ? question.categoryTags.join(', ') : 'None'}</span></p>
                        <p class="respondent-count">(${question.respondents} of ${reportData.totalRespondents} respondents answered this question)</p>
                        <p class="response-overview">${question.responseOverview}</p>
                        
                        <div class="chart-container">
                          <div class="bar-chart">
                            ${(() => {
                              // Find the highest percentage to determine which option gets the green color
                              const highestPercentage = Math.max(...question.options.map(opt => opt.percentage));
                              
                              return question.options.map((option, index) => {
                                // Color based on option position (from reference image)
                                let color;
                                if (index === 0) {
                                  color = '#78b04a'; // Green (Very Frequently)
                                } else if (index === 1) {
                                  color = '#a7d16c'; // Light green (Frequently)
                                } else if (index === 2) {
                                  color = '#f9c74f'; // Yellow (Sometimes)
                                } else if (index === 3) {
                                  color = '#e07a5f'; // Orange (Rarely)
                                } else if (index === 4) {
                                  color = '#e63946'; // Red (Never)
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
                      </div>
                    `).join('') : '<p>No questions available for this tag.</p>'}
                  </div>
                `).join('') : '<p>No child tags available for this parent tag.</p>'}
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
export default SurveyReportPDFPreview;

