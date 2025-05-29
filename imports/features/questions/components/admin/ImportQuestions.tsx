import React, { useState, useRef, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { FiUpload, FiCheck, FiAlertTriangle, FiEdit, FiSave } from 'react-icons/fi';
import { QuestionDoc, QuestionVersion } from '../../api/questions';
import { WPSCategories } from '../../../../features/wps-framework/api/wpsCategories';
import { SurveyThemes } from '../../../../features/survey-themes/api/surveyThemes';
import { useTracker } from 'meteor/react-meteor-data';

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
  const [importFormat, setImportFormat] = useState('docx');
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
      
      // Auto-detect file type
      if (selectedFile.name.endsWith('.csv') || selectedFile.name.endsWith('.xls') || selectedFile.name.endsWith('.xlsx')) {
        setImportFormat('spreadsheet');
      } else if (selectedFile.name.endsWith('.json')) {
        setImportFormat('json');
      } else {
        setImportFormat('docx');
      }
    }
  };

  const parseFile = async (file: File): Promise<ParsedQuestion[]> => {
    setIsLoading(true);
    
    try {
      // In a real implementation, we would use appropriate libraries based on file type
      // For now, we'll simulate parsing with sample questions
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Sample questions that would be parsed from the document
      const sampleQuestions: ParsedQuestion[] = [
        {
          questionText: "How satisfied are you with the response time?",
          description: "Rate your satisfaction with how quickly we respond to your requests",
          responseType: "scale",
          category: "Customer Support",
          options: { min: 1, max: 5, step: 1 },
          surveyThemes: ["Customer Satisfaction", "Response Time"],
          categoryTags: ["Support", "Response Time"]
        },
        {
          questionText: "How would you rate the quality of training provided?",
          description: "Evaluate the effectiveness and relevance of training sessions",
          responseType: "scale",
          category: "Training",
          options: { min: 1, max: 5, step: 1 },
          surveyThemes: ["Training", "Employee Development"],
          categoryTags: ["Training", "Knowledge Transfer"]
        },
        {
          questionText: "Which services do you use most frequently?",
          description: "Select all services that you regularly use",
          responseType: "multiSelect",
          category: "Usage Patterns",
          options: ["Email", "Intranet", "VPN", "File Sharing", "Video Conferencing", "Ticketing System", "Other"],
          surveyThemes: ["Service Usage", "User Behavior"],
          categoryTags: ["Usage", "Services"]
        },
        {
          questionText: "What improvements would you suggest for our infrastructure?",
          description: "Provide feedback on how we can enhance our systems and services",
          responseType: "text",
          category: "Improvement",
          surveyThemes: ["Feedback", "Improvement"],
          categoryTags: ["Feedback", "Infrastructure"]
        },
        {
          questionText: "How often do you experience issues that impact your work?",
          description: "Indicate the frequency of problems that affect your productivity",
          responseType: "singleSelect",
          category: "Issues",
          options: ["Daily", "Several times a week", "Once a week", "A few times a month", "Rarely", "Never"],
          surveyThemes: ["Issues", "Productivity"],
          categoryTags: ["Problems", "Productivity"]
        }
      ];
      
      setIsLoading(false);
      return sampleQuestions;
    } catch (err: any) {
      setIsLoading(false);
      throw new Error(`Failed to parse file: ${err.message}`);
    }
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
      <Description>
        Upload a file containing questions to import into the survey application.
        The system supports various file formats including DOCX, CSV, Excel, and JSON.
      </Description>
      
      {!showMapping ? (
        <>
          <InputContainer>
            <HiddenInput 
              type="file" 
              ref={fileInputRef} 
              onChange={handleFileChange} 
              accept=".docx,.doc,.csv,.xls,.xlsx,.json"
            />
            <FileSelectButton onClick={handleBrowseClick}>
              <FiUpload /> Browse Files
            </FileSelectButton>
            {file && (
              <SelectedFile>
                <span>{file.name}</span>
                <FileSize>({(file.size / 1024).toFixed(1)} KB)</FileSize>
              </SelectedFile>
            )}
          </InputContainer>
          
          <ImportButton onClick={handleParseFile} disabled={!file || isLoading}>
            {isLoading ? 'Processing...' : 'Parse File'}
          </ImportButton>
        </>
      ) : (
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
                      onChange={(e) => handleFieldMappingChange(index, 'type', e.target.value)}
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
          
          <PreviewTitle>Preview ({parsedQuestions.length} questions)</PreviewTitle>
          <PreviewContainer>
            {parsedQuestions.slice(0, 3).map((question, index) => (
              <PreviewCard key={index}>
                <PreviewHeader>
                  <span>Question {index + 1}</span>
                  <span>{question.responseType}</span>
                </PreviewHeader>
                <PreviewContent>
                  <PreviewQuestion>{question.questionText}</PreviewQuestion>
                  <PreviewDescription>{question.description}</PreviewDescription>
                  <PreviewMeta>
                    <span>Category: {question.category}</span>
                    {question.surveyThemes && question.surveyThemes.length > 0 && (
                      <span>Themes: {question.surveyThemes.join(', ')}</span>
                    )}
                  </PreviewMeta>
                </PreviewContent>
              </PreviewCard>
            ))}
            {parsedQuestions.length > 3 && (
              <MoreQuestions>+ {parsedQuestions.length - 3} more questions</MoreQuestions>
            )}
          </PreviewContainer>
          
          <ButtonGroup>
            <SecondaryButton onClick={() => setShowMapping(false)}>
              Back
            </SecondaryButton>
            <ImportButton onClick={applyMappings}>
              <FiEdit /> Apply Mappings
            </ImportButton>
            <ImportButton onClick={handleImport} disabled={isLoading}>
              <FiSave /> Save Questions
            </ImportButton>
          </ButtonGroup>
        </>
      )}
      
      {error && (
        <ErrorMessage>
          <FiAlertTriangle /> {error}
        </ErrorMessage>
      )}
      
      {success && (
        <SuccessMessage>
          <FiCheck /> Successfully imported {mappedQuestions.length} questions
        </SuccessMessage>
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

const InputContainer = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 24px;
  flex-wrap: wrap;
  gap: 12px;
`;

const HiddenInput = styled.input`
  display: none;
`;

const FileSelectButton = styled.button`
  background: #f7f2f5;
  border: 1px dashed #d1c1cc;
  border-radius: 4px;
  padding: 12px 24px;
  color: #552a47;
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

const SelectedFile = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  color: #333;
`;

const FileSize = styled.span`
  color: #888;
  font-size: 0.8rem;
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
  gap: 8px;
`;

const SuccessMessage = styled.div`
  background: #e8f5e9;
  color: #2e7d32;
  padding: 12px 16px;
  border-radius: 4px;
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const MappingTitle = styled.h3`
  font-size: 1.2rem;
  color: #552a47;
  margin: 0 0 8px 0;
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

const PreviewTitle = styled.h3`
  font-size: 1.1rem;
  color: #552a47;
  margin: 24px 0 12px 0;
`;

const PreviewContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
  max-height: 400px;
  overflow-y: auto;
`;

const PreviewCard = styled.div`
  border: 1px solid #eee;
  border-radius: 8px;
  overflow: hidden;
`;

const PreviewHeader = styled.div`
  background: #f7f2f5;
  padding: 8px 16px;
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
  color: #666;
  border-bottom: 1px solid #eee;
`;

const PreviewContent = styled.div`
  padding: 16px;
`;

const PreviewQuestion = styled.div`
  font-weight: 500;
  margin-bottom: 8px;
`;

const PreviewDescription = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 12px;
`;

const PreviewMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 0.8rem;
  color: #888;
`;

const MoreQuestions = styled.div`
  text-align: center;
  padding: 12px;
  background: #f7f2f5;
  border-radius: 4px;
  color: #666;
  font-size: 0.9rem;
`;

const ButtonGroup = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

export default ImportQuestions;
