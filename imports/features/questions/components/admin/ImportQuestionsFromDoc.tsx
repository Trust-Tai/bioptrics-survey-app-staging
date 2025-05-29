import React, { useState, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { FiUpload, FiCheck, FiAlertTriangle } from 'react-icons/fi';
import { QuestionDoc, QuestionVersion } from '../../api/questions';

interface ImportQuestionsFromDocProps {
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
}

const ImportQuestionsFromDoc: React.FC<ImportQuestionsFromDocProps> = ({ onImportComplete, organizationId }) => {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [parsedQuestions, setParsedQuestions] = useState<ParsedQuestion[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError(null);
      setSuccess(false);
    }
  };

  const parseDocxContent = async (file: File): Promise<ParsedQuestion[]> => {
    // This is a placeholder for actual DOCX parsing logic
    // In a real implementation, you would use a library like mammoth.js to parse DOCX
    // For now, we'll simulate parsing with sample questions
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Sample IT questions that would be parsed from the document
    const sampleITQuestions: ParsedQuestion[] = [
      {
        questionText: "How satisfied are you with the IT support response time?",
        description: "Rate your satisfaction with how quickly IT support responds to your tickets",
        responseType: "scale",
        category: "IT Support",
        options: { min: 1, max: 5, step: 1 },
        surveyThemes: ["IT Services", "Employee Satisfaction"],
        categoryTags: ["Support", "Response Time"]
      },
      {
        questionText: "How would you rate the quality of IT training provided?",
        description: "Evaluate the effectiveness and relevance of IT training sessions",
        responseType: "scale",
        category: "IT Training",
        options: { min: 1, max: 5, step: 1 },
        surveyThemes: ["IT Services", "Training"],
        categoryTags: ["Training", "Knowledge Transfer"]
      },
      {
        questionText: "Which IT services do you use most frequently?",
        description: "Select all IT services that you regularly use",
        responseType: "multiSelect",
        category: "IT Usage",
        options: ["Email", "Intranet", "VPN", "File Sharing", "Video Conferencing", "Ticketing System", "Other"],
        surveyThemes: ["IT Services", "Usage Patterns"],
        categoryTags: ["Usage", "Services"]
      },
      {
        questionText: "What improvements would you suggest for our IT infrastructure?",
        description: "Provide feedback on how we can enhance our IT systems and services",
        responseType: "text",
        category: "IT Improvement",
        surveyThemes: ["IT Services", "Improvement"],
        categoryTags: ["Feedback", "Infrastructure"]
      },
      {
        questionText: "How often do you experience IT-related issues that impact your work?",
        description: "Indicate the frequency of IT problems that affect your productivity",
        responseType: "singleSelect",
        category: "IT Issues",
        options: ["Daily", "Several times a week", "Once a week", "A few times a month", "Rarely", "Never"],
        surveyThemes: ["IT Services", "Issues"],
        categoryTags: ["Problems", "Productivity"]
      }
    ];
    
    return sampleITQuestions;
  };

  const convertToQuestionDocs = (parsedQuestions: ParsedQuestion[]): Partial<QuestionDoc>[] => {
    return parsedQuestions.map(question => {
      const now = new Date();
      const questionVersion: QuestionVersion = {
        version: 1,
        questionText: question.questionText,
        description: question.description,
        responseType: question.responseType,
        category: question.category,
        options: question.options,
        updatedAt: now,
        updatedBy: Meteor.userId() || 'system',
        surveyThemes: question.surveyThemes,
        categoryTags: question.categoryTags,
        organizationId: organizationId,
        isReusable: true,
        usageCount: 0,
        isActive: true,
        priority: 1,
        keywords: [...(question.categoryTags || []), ...(question.surveyThemes || [])]
      };
      
      return {
        currentVersion: 1,
        versions: [questionVersion],
        createdAt: now,
        createdBy: Meteor.userId() || 'system'
      };
    });
  };

  const handleImport = async () => {
    if (!file) {
      setError('Please select a file to import');
      return;
    }
    
    setIsLoading(true);
    setError(null);
    
    try {
      // Parse the DOCX file
      const parsed = await parseDocxContent(file);
      setParsedQuestions(parsed);
      
      // Convert parsed questions to QuestionDoc format
      const questionDocs = convertToQuestionDocs(parsed);
      
      // Call the callback with the imported questions
      onImportComplete(questionDocs);
      
      setSuccess(true);
    } catch (err: any) {
      console.error('Error importing questions:', err);
      setError(`Failed to import questions: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Container>
      <Title>Import Questions from Document</Title>
      <Description>
        Upload the IT Sample Questions document to import questions into the survey application.
        The system will parse the document and extract questions, categories, and response types.
      </Description>
      
      <InputContainer>
        <HiddenInput 
          type="file" 
          ref={fileInputRef} 
          onChange={handleFileChange} 
          accept=".docx,.doc"
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
      
      <ImportButton onClick={handleImport} disabled={!file || isLoading}>
        {isLoading ? 'Processing...' : 'Import Questions'}
      </ImportButton>
      
      {error && (
        <ErrorMessage>
          <FiAlertTriangle /> {error}
        </ErrorMessage>
      )}
      
      {success && (
        <SuccessMessage>
          <FiCheck /> Successfully imported {parsedQuestions.length} questions
        </SuccessMessage>
      )}
      
      {success && parsedQuestions.length > 0 && (
        <PreviewContainer>
          <PreviewTitle>Imported Questions</PreviewTitle>
          <QuestionList>
            {parsedQuestions.map((question, index) => (
              <QuestionItem key={index}>
                <QuestionText>{question.questionText}</QuestionText>
                <QuestionMeta>
                  <MetaItem>Category: {question.category}</MetaItem>
                  <MetaItem>Type: {question.responseType}</MetaItem>
                </QuestionMeta>
              </QuestionItem>
            ))}
          </QuestionList>
        </PreviewContainer>
      )}
    </Container>
  );
};

const Container = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  padding: 24px;
  max-width: 800px;
  margin: 0 auto;
`;

const Title = styled.h2`
  font-size: 20px;
  font-weight: 600;
  color: #552a47;
  margin: 0 0 16px 0;
`;

const Description = styled.p`
  font-size: 14px;
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
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background-color: #f0f0f0;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #e0e0e0;
  }
  
  svg {
    font-size: 16px;
  }
`;

const SelectedFile = styled.div`
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #333;
  background: #f9f9f9;
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #eee;
`;

const FileSize = styled.span`
  color: #888;
  margin-left: 8px;
`;

const ImportButton = styled.button`
  background-color: #552a47;
  color: white;
  border: none;
  border-radius: 4px;
  padding: 12px 24px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #6d3a5d;
  }
  
  &:disabled {
    background-color: #ccc;
    cursor: not-allowed;
  }
`;

const ErrorMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #d32f2f;
  background-color: #ffebee;
  padding: 12px 16px;
  border-radius: 4px;
  margin-top: 16px;
  font-size: 14px;
  
  svg {
    font-size: 16px;
  }
`;

const SuccessMessage = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  color: #388e3c;
  background-color: #e8f5e9;
  padding: 12px 16px;
  border-radius: 4px;
  margin-top: 16px;
  font-size: 14px;
  
  svg {
    font-size: 16px;
  }
`;

const PreviewContainer = styled.div`
  margin-top: 24px;
  border-top: 1px solid #eee;
  padding-top: 24px;
`;

const PreviewTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 0 0 16px 0;
`;

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-height: 400px;
  overflow-y: auto;
  padding-right: 8px;
`;

const QuestionItem = styled.div`
  background-color: #f9f9f9;
  border-left: 3px solid #552a47;
  padding: 12px 16px;
  border-radius: 0 4px 4px 0;
`;

const QuestionText = styled.div`
  font-weight: 500;
  color: #333;
  margin-bottom: 8px;
`;

const QuestionMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  font-size: 12px;
  color: #666;
`;

const MetaItem = styled.div`
  background-color: #eee;
  padding: 4px 8px;
  border-radius: 4px;
`;

export default ImportQuestionsFromDoc;
