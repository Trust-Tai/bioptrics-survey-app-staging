import React, { useState, useRef, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { FiUpload, FiCheck, FiAlertTriangle, FiEdit, FiSave, FiDownload } from 'react-icons/fi';
import { QuestionDoc, QuestionVersion } from '../../api/questions';
import { WPSCategories } from '../../../../features/wps-framework/api/wpsCategories';
import { SurveyThemes } from '../../../../features/survey-themes/api/surveyThemes';
import { useTracker } from 'meteor/react-meteor-data';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

interface ImportQuestionsProps {
  onImportComplete: (questions: Partial<QuestionDoc>[]) => void;
  organizationId?: string;
}

interface ParsedQuestion {
  questionText: string;
  description: string;
  responseType: string;
  category: string;
  options?: string[] | { min: number; max: number; step: number };
  surveyThemes?: string[];
  categoryTags?: string[];
  isReusable?: boolean;
  isActive?: boolean;
  priority?: number;
}

interface MappedField {
  sourceField: string;
  targetField: string;
  required: boolean;
  type: 'text' | 'select' | 'multiSelect' | 'boolean' | 'number';
  options?: string[];
  defaultValue?: any;
}

const RESPONSE_TYPES = [
  'text',
  'long_text',
  'singleSelect',
  'multiSelect',
  'scale',
  'likert',
  'dropdown',
  'checkbox',
  'date',
  'number'
];

const ImportQuestions: React.FC<ImportQuestionsProps> = ({ onImportComplete, organizationId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const [mappedQuestions, setMappedQuestions] = useState<ParsedQuestion[]>([]);
  const [showMapping, setShowMapping] = useState(false);
  const [fieldMappings, setFieldMappings] = useState<MappedField[]>([
    { sourceField: 'question', targetField: 'questionText', required: true, type: 'text' },
    { sourceField: 'description', targetField: 'description', required: false, type: 'text' },
    { sourceField: 'type', targetField: 'responseType', required: true, type: 'select', options: RESPONSE_TYPES },
    { sourceField: 'category', targetField: 'category', required: true, type: 'text' },
    { sourceField: 'options', targetField: 'options', required: false, type: 'text' },
    { sourceField: 'themes', targetField: 'surveyThemes', required: false, type: 'multiSelect', options: [] },
    { sourceField: 'tags', targetField: 'categoryTags', required: false, type: 'multiSelect', options: [] },
    { sourceField: 'reusable', targetField: 'isReusable', required: false, type: 'boolean', defaultValue: true },
    { sourceField: 'active', targetField: 'isActive', required: false, type: 'boolean', defaultValue: true },
    { sourceField: 'priority', targetField: 'priority', required: false, type: 'number', defaultValue: 1 }
  ]);
  const [importFormat, setImportFormat] = useState('xlsx');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch categories and themes for mapping
  const wpsCategories = useTracker(() => {
    Meteor.subscribe('wpsCategories.all');
    return WPSCategories.find().fetch();
  }, []);
  
  const surveyThemes = useTracker(() => {
    Meteor.subscribe('surveyThemes.all');
    return SurveyThemes.find().fetch();
  }, []);

  // Update field mappings with available categories and themes
  useEffect(() => {
    if (wpsCategories.length > 0 || surveyThemes.length > 0) {
      setFieldMappings(prevMappings => {
        return prevMappings.map(mapping => {
          if (mapping.targetField === 'category') {
            return {
              ...mapping,
              type: 'select',
              options: wpsCategories.map((cat: any) => cat.name)
            };
          } else if (mapping.targetField === 'surveyThemes') {
            return {
              ...mapping,
              options: surveyThemes.map((theme: any) => theme.name)
            };
          }
          return mapping;
        });
      });
    }
  }, [wpsCategories, surveyThemes]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
      setShowMapping(false);
      setParsedQuestions([]);
      setMappedQuestions([]);
      
      // Check if file is Excel format
      if (selectedFile.name.endsWith('.xlsx')) {
        setImportFormat('xlsx');
      } else {
        setError('Please upload an Excel (.xlsx) file');
        setFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = '';
        }
      }
    }
  };

  const parseFile = async (file: File): Promise<ParsedQuestion[]> => {
    setIsLoading(true);
    
    try {
      // Read Excel file using xlsx library
      const reader = new FileReader();
      
      const parseExcel = (data: ArrayBuffer) => {
        const workbook = XLSX.read(data, { type: 'array' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet);
        
        // Map the Excel data to our question format
        const parsedQuestions: ParsedQuestion[] = jsonData.map((row: any) => {
          // Parse options based on the response type
          let options: string[] | { min: number; max: number; step: number } | undefined;
          
          if (row.options) {
            if (['scale', 'likert'].includes(row.responseType)) {
              // Parse min:max:step format for scale questions
              const [min, max, step] = row.options.split(':').map(Number);
              options = { min, max, step: step || 1 };
            } else if (['singleSelect', 'multiSelect', 'dropdown', 'checkbox'].includes(row.responseType)) {
              // Parse comma-separated options for select questions
              options = row.options.split(',').map((opt: string) => opt.trim());
            }
          }
          
          // Parse themes and tags as arrays
          const surveyThemes = row.surveyThemes ? 
            row.surveyThemes.split(',').map((theme: string) => theme.trim()) : 
            [];
            
          const categoryTags = row.categoryTags ? 
            row.categoryTags.split(',').map((tag: string) => tag.trim()) : 
            [];
          
          return {
            questionText: row.questionText || '',
            description: row.description || '',
            responseType: row.responseType || 'text',
            category: row.category || 'General',
            options,
            surveyThemes,
            categoryTags,
            isReusable: row.isReusable === 'FALSE' ? false : true,
            isActive: row.isActive === 'FALSE' ? false : true,
            priority: Number(row.priority) || 1
          };
        });
        
        return parsedQuestions;
      };
      
      return new Promise((resolve, reject) => {
        reader.onload = (e) => {
          try {
            if (e.target?.result) {
              const parsedQuestions = parseExcel(e.target.result as ArrayBuffer);
              setIsLoading(false);
              resolve(parsedQuestions);
            } else {
              throw new Error('Failed to read file');
            }
          } catch (err: any) {
            reject(err);
          }
        };
        
        reader.onerror = () => {
          reject(new Error('Error reading file'));
        };
        
        reader.readAsArrayBuffer(file);
      });
    } catch (err: any) {
      setIsLoading(false);
      throw new Error(`Failed to parse file: ${err.message}`);
    }
  };
  
  // Function to generate and download a sample Excel template
  const downloadSampleTemplate = () => {
    // Create sample data
    const sampleData = [
      {
        questionText: "How satisfied are you with our service?",
        description: "Rate your overall satisfaction with our services",
        responseType: "scale",
        category: "Customer Satisfaction",
        options: "1:5:1",  // min:max:step format for scale
        surveyThemes: "Customer Experience, Satisfaction",
        categoryTags: "Feedback, Service Quality",
        isReusable: "TRUE",
        isActive: "TRUE",
        priority: "1"
      },
      {
        questionText: "Which products do you use regularly?",
        description: "Select all products that you use at least once a week",
        responseType: "multiSelect",
        category: "Product Usage",
        options: "Product A, Product B, Product C, Product D, Other",  // comma-separated options
        surveyThemes: "Product Adoption, Usage Patterns",
        categoryTags: "Products, Usage",
        isReusable: "TRUE",
        isActive: "TRUE",
        priority: "2"
      },
      {
        questionText: "What improvements would you suggest for our product?",
        description: "Please provide your feedback on how we can improve",
        responseType: "text",
        category: "Feedback",
        options: "",  // No options for text questions
        surveyThemes: "Product Improvement, Feedback",
        categoryTags: "Suggestions, Improvement",
        isReusable: "TRUE",
        isActive: "TRUE",
        priority: "3"
      }
    ];
    
    // Create worksheet
    const worksheet = XLSX.utils.json_to_sheet(sampleData);
    
    // Create workbook
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Questions");
    
    // Generate Excel file
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    
    // Save file
    saveAs(data, 'question_import_template.xlsx');
  };

  const handleFieldMappingChange = (index: number, field: string, value: any) => {
    const updatedMappings = [...fieldMappings];
    updatedMappings[index] = { ...updatedMappings[index], [field]: value };
    setFieldMappings(updatedMappings);
  };

  const applyMappings = () => {
    const mapped = parsedQuestions.map(question => {
      const mappedQuestion: any = {};
      
      fieldMappings.forEach(mapping => {
        // Apply the mapping from source field to target field
        if (question[mapping.sourceField as keyof ParsedQuestion] !== undefined) {
          mappedQuestion[mapping.targetField] = question[mapping.sourceField as keyof ParsedQuestion];
        } else if (mapping.required && mapping.defaultValue !== undefined) {
          // Use default value for required fields if source field doesn't exist
          mappedQuestion[mapping.targetField] = mapping.defaultValue;
        }
      });
      
      return mappedQuestion as ParsedQuestion;
    });
    
    setMappedQuestions(mapped);
  };

  const handleParseFile = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      const parsed = await parseFile(file);
      setParsedQuestions(parsed);
      setShowMapping(true);
    } catch (err: any) {
      console.error('Error parsing file:', err);
      setError(`Failed to parse file: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const convertToQuestionDocs = (questions: ParsedQuestion[]): Partial<QuestionDoc>[] => {
    return questions.map(question => {
      const now = new Date();
      const questionVersion: QuestionVersion = {
        version: 1,
        questionText: question.questionText,
        description: question.description || '',
        responseType: question.responseType,
        category: question.category,
        options: question.options,
        updatedAt: now,
        updatedBy: Meteor.userId() || 'system',
        surveyThemes: question.surveyThemes,
        categoryTags: question.categoryTags,
        organizationId: organizationId,
        isReusable: question.isReusable !== undefined ? question.isReusable : true,
        usageCount: 0,
        isActive: question.isActive !== undefined ? question.isActive : true,
        priority: question.priority || 1,
        keywords: [
          ...(question.categoryTags || []), 
          ...(question.surveyThemes || [])
        ]
      };
      
      return {
        currentVersion: 1,
        versions: [questionVersion],
        createdAt: now,
        createdBy: Meteor.userId() || 'system'
      };
    });
  };

  const handleImport = () => {
    if (mappedQuestions.length === 0) {
      // If no mapping was done, apply default mappings
      applyMappings();
      setError('Please review and confirm the field mappings before importing');
      return;
    }
    
    try {
      // Convert mapped questions to QuestionDoc format
      const questionDocs = convertToQuestionDocs(mappedQuestions);
      
      // Call the callback with the imported questions
      onImportComplete(questionDocs);
      
      setSuccess(true);
      setShowMapping(false);
    } catch (err: any) {
      console.error('Error importing questions:', err);
      setError(`Failed to import questions: ${err.message || 'Unknown error'}`);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Container>
      <Title>Import Questions</Title>
      <Description>
        Upload an Excel (.xlsx) file containing questions to import into the survey application.
      </Description>
      <UploadSection>
        <UploadButton onClick={handleBrowseClick} disabled={isLoading}>
          <FiUpload style={{ marginRight: '8px' }} />
          Browse Files
        </UploadButton>
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileChange}
          style={{ display: 'none' }}
          accept=".xlsx"
        />
        <TemplateButton onClick={downloadSampleTemplate} type="button">
          <FiDownload style={{ marginRight: '8px' }} />
          Download Template
        </TemplateButton>
      </UploadSection>
      
      <FileInfo>
        {file ? (
          <>
            <strong>Selected file:</strong> {file.name} ({(file.size / 1024).toFixed(2)} KB)
          </>
        ) : (
          <>
            <span>No file selected. Please upload an Excel (.xlsx) file.</span>
            <FileFormatInfo>
              <strong>Required format:</strong> Excel (.xlsx) file with columns for questionText, description, responseType, category, options, etc.
              <br />
              Download the template for the correct format.
            </FileFormatInfo>
          </>
        )}
      </FileInfo>
      
      <ImportButton onClick={handleParseFile} disabled={!file || isLoading}>
        {isLoading ? 'Processing...' : 'Parse File'}
      </ImportButton>
      
      {error && (
        <ErrorMessage>
          <FiAlertTriangle style={{ marginRight: '8px' }} /> {error}
        </ErrorMessage>
      )}
      
      {success && (
        <SuccessMessage>
          <FiCheck style={{ marginRight: '8px' }} /> Successfully imported {mappedQuestions.length} questions
        </SuccessMessage>
      )}
      
      {showMapping && (
        <>
          <MappingTitle>Field Mapping</MappingTitle>
          <MappingDescription>
            Review and adjust how fields from your file will be mapped to question fields in the system.
          </MappingDescription>
          
          <MappingTable>
            <thead>
              <tr>
                <th>Source Field</th>
                <th>Target Field</th>
                <th>Required</th>
                <th>Type</th>
              </tr>
            </thead>
            <tbody>
              {fieldMappings.map((mapping, index) => (
                <tr key={index}>
                  <td>
                    <input 
                      type="text" 
                      value={mapping.sourceField} 
                      onChange={(e) => handleFieldMappingChange(index, 'sourceField', e.target.value)}
                    />
                  </td>
                  <td>
                    <select 
                      value={mapping.targetField} 
                      onChange={(e) => handleFieldMappingChange(index, 'targetField', e.target.value)}
                    >
                      <option value="questionText">Question Text</option>
                      <option value="description">Description</option>
                      <option value="responseType">Response Type</option>
                      <option value="category">Category</option>
                      <option value="options">Options</option>
                      <option value="surveyThemes">Survey Themes</option>
                      <option value="categoryTags">Category Tags</option>
                      <option value="isReusable">Is Reusable</option>
                      <option value="isActive">Is Active</option>
                      <option value="priority">Priority</option>
                    </select>
                  </td>
                  <td>
                    <input 
                      type="checkbox" 
                      checked={mapping.required} 
                      onChange={(e) => handleFieldMappingChange(index, 'required', e.target.checked)}
                    />
                  </td>
                  <td>
                    <select 
                      value={mapping.type} 
                      onChange={(e) => handleFieldMappingChange(index, 'type', e.target.value as any)}
                    >
                      <option value="text">Text</option>
                      <option value="select">Select</option>
                      <option value="multiSelect">Multi Select</option>
                      <option value="boolean">Boolean</option>
                      <option value="number">Number</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </MappingTable>
          
          <ButtonGroup>
            <SecondaryButton onClick={() => setShowMapping(false)}>
              Back
            </SecondaryButton>
            <ImportButton onClick={applyMappings}>
              <FiEdit style={{ marginRight: '8px' }} /> Apply Mappings
            </ImportButton>
            <ImportButton onClick={handleImport} disabled={isLoading}>
              <FiSave style={{ marginRight: '8px' }} /> Save Questions
            </ImportButton>
          </ButtonGroup>
        </>
      )}
    </Container>
  );
};

// Styled components
const Container = styled.div`
  background: white;
  border-radius: 8px;
  padding: 24px;
`;

const Title = styled.h2`
  font-size: 1.5rem;
  color: #552a47;
  margin: 0 0 16px 0;
`;

const Description = styled.p`
  color: #666;
  margin-bottom: 24px;
  line-height: 1.5;
`;

const UploadSection = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const UploadButton = styled.button`
  background-color: #552a47;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background-color 0.2s;
  margin-right: 10px;
  
  &:hover {
    background-color: #3d1f33;
  }
  
  &:disabled {
    background-color: #cccccc;
    cursor: not-allowed;
  }
`;

const TemplateButton = styled.button`
  background-color: #ffffff;
  color: #552a47;
  border: 1px solid #552a47;
  border-radius: 4px;
  padding: 10px 16px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s;
  
  &:hover {
    background-color: #f8f5f7;
    border-color: #3d1f33;
  }
`;

const FileInfo = styled.div`
  margin-top: 16px;
  padding: 12px;
  background-color: #f5f5f5;
  border-radius: 4px;
  font-size: 14px;
  margin-bottom: 16px;
`;

const FileFormatInfo = styled.div`
  margin-top: 8px;
  padding: 10px;
  background-color: #f8f5f7;
  border-left: 3px solid #552a47;
  font-size: 13px;
  line-height: 1.5;
`;

const ImportButton = styled.button`
  background: #552a47;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #441e38;
  }
  
  &:disabled {
    background: #d1c1cc;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled.button`
  background: #f7f2f5;
  color: #552a47;
  border: 1px solid #d1c1cc;
  border-radius: 4px;
  padding: 12px 24px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f0e8ee;
  }
`;

const ErrorMessage = styled.div`
  background: #ffebee;
  color: #c62828;
  padding: 12px 16px;
  border-radius: 4px;
  margin-top: 16px;
  display: flex;
  align-items: center;
`;

const SuccessMessage = styled.div`
  background: #e8f5e9;
  color: #2e7d32;
  padding: 12px 16px;
  border-radius: 4px;
  margin-top: 16px;
  display: flex;
  align-items: center;
`;

const MappingTitle = styled.h3`
  font-size: 1.2rem;
  color: #552a47;
  margin: 24px 0 8px 0;
`;

const MappingDescription = styled.p`
  color: #666;
  margin-bottom: 16px;
  font-size: 0.9rem;
`;

const MappingTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 24px;
  
  th, td {
    padding: 8px 12px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    font-weight: 500;
    color: #666;
    font-size: 0.9rem;
  }
  
  input, select {
    width: 100%;
    padding: 6px 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
  }
  
  input[type="checkbox"] {
    width: auto;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

export default ImportQuestions;
