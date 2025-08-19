import React, { useRef, useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { FaTimes, FaUpload, FaExclamationTriangle, FaSpinner, FaCheck } from 'react-icons/fa';

// Styled components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  transition: opacity 0.3s ease-in-out;
`;

const Panel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 90%;
  max-width: 600px;
  height: 100%;
  background-color: var(--color-background);
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.2);
  z-index: 2001;
  overflow-y: auto;
  transition: transform 0.3s ease-in-out;
  padding: 30px;
`;

const CloseButton = styled.button`
  position: absolute;
  top: 25px;
  right: 25px;
  background: rgba(0, 0, 0, 0.05);
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  cursor: pointer;
  z-index: 1002;
  transition: background 0.2s ease;
  
  &:hover {
    background: rgba(0, 0, 0, 0.1);
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 30px;
  padding-right: 40px;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin: 0;
`;

const Content = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const ImportSection = styled.div`
  background: var(--color-background);
  border: 1px solid var(--color-accent);
  border-radius: 8px;
  padding: 20px;
`;

const ImportTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: var(--color-text);
  margin: 0 0 15px 0;
`;

const ImportDescription = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0 0 20px 0;
  line-height: 1.5;
`;

const DropZone = styled.div<{ isDragActive: boolean }>`
  border: 2px dashed ${props => props.isDragActive ? 'var(--color-primary)' : 'var(--color-accent)'};
  border-radius: 8px;
  padding: 30px;
  text-align: center;
  background: ${props => props.isDragActive ? 'rgba(85, 42, 71, 0.05)' : 'transparent'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: var(--color-primary);
    background: rgba(85, 42, 71, 0.05);
  }
`;

const UploadIcon = styled(FaUpload)`
  font-size: 32px;
  color: var(--color-primary);
  margin-bottom: 15px;
`;

const DropText = styled.p`
  font-size: 16px;
  color: var(--color-text);
  margin: 0 0 10px 0;
`;

const DropSubText = styled.p`
  font-size: 14px;
  color: var(--color-text-secondary);
  margin: 0;
`;

const FileInput = styled.input`
  display: none;
`;

const Button = styled.button`
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  &:hover {
    background: var(--color-secondary);
  }
  
  &:disabled {
    background: var(--color-accent);
    cursor: not-allowed;
  }
`;

const Alert = styled.div<{ type: 'success' | 'error' | 'warning' }>`
  background: ${props => {
    switch (props.type) {
      case 'success': return 'rgba(76, 175, 80, 0.1)';
      case 'error': return 'rgba(244, 67, 54, 0.1)';
      case 'warning': return 'rgba(255, 152, 0, 0.1)';
      default: return 'rgba(76, 175, 80, 0.1)';
    }
  }};
  border-left: 4px solid ${props => {
    switch (props.type) {
      case 'success': return 'var(--color-success, #4CAF50)';
      case 'error': return 'var(--color-error, #f44336)';
      case 'warning': return '#FF9800';
      default: return 'var(--color-success, #4CAF50)';
    }
  }};
  color: var(--color-text);
  padding: 15px;
  border-radius: 4px;
  margin-top: 20px;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const AlertIcon = styled.div`
  font-size: 20px;
  color: ${props => props.color || 'inherit'};
`;

const AlertText = styled.div`
  flex: 1;
  font-size: 14px;
`;

const FilePreview = styled.div`
  background: rgba(0, 0, 0, 0.03);
  border-radius: 8px;
  padding: 15px;
  margin-top: 20px;
  max-height: 300px;
  overflow-y: auto;
`;

const PreviewTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  margin: 0 0 10px 0;
`;

const PreviewContent = styled.pre`
  font-family: monospace;
  font-size: 13px;
  white-space: pre-wrap;
  word-break: break-all;
  margin: 0;
  padding: 10px;
  background: rgba(0, 0, 0, 0.02);
  border-radius: 4px;
  max-height: 200px;
  overflow-y: auto;
`;

interface SurveyImportSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess?: (surveyId: string) => void;
}

const SurveyImportSidePanel: React.FC<SurveyImportSidePanelProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragActive, setIsDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [isImporting, setIsImporting] = useState(false);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'warning'; message: string } | null>(null);

  // Handle escape key to close panel
  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscapeKey);
    
    // Prevent body scrolling when panel is open
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = '';
    };
  }, [isOpen, onClose]);

  // Handle clicks outside the panel to close it
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (panelRef.current && !panelRef.current.contains(event.target as Node) && isOpen) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  // Reset state when panel is closed
  useEffect(() => {
    if (!isOpen) {
      setSelectedFile(null);
      setFileContent(null);
      setAlert(null);
      setIsImporting(false);
    }
  }, [isOpen]);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleFileSelect = (file: File) => {
    if (file.type !== 'application/json') {
      setAlert({
        type: 'error',
        message: 'Please select a valid JSON file.'
      });
      return;
    }

    setSelectedFile(file);
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        // Try to parse JSON to validate it
        JSON.parse(content);
        setFileContent(content);
        setAlert(null);
      } catch (error) {
        setAlert({
          type: 'error',
          message: 'Invalid JSON format. Please check your file and try again.'
        });
        setFileContent(null);
      }
    };
    reader.readAsText(file);
  };

  const handleImport = () => {
    if (!fileContent) return;
    
    setIsImporting(true);
    setAlert(null);
    
    try {
      const importData = JSON.parse(fileContent);
      
      // Ensure retake settings are properly handled
      if (importData.defaultSettings) {
        console.log('Including survey retake settings:', {
          allowRetake: importData.defaultSettings.allowRetake,
          retakeSettings: importData.defaultSettings.retakeSettings
        });
      }
      
      Meteor.call('surveys.import', importData, (error: Meteor.Error | null, result: { _id: string } | null) => {
        setIsImporting(false);
        
        if (error) {
          console.error('Error importing survey:', error);
          setAlert({
            type: 'error',
            message: `Import failed: ${error.message || 'Unknown error'}`
          });
        } else if (result && result._id) {
          setAlert({
            type: 'success',
            message: 'Survey imported successfully!'
          });
          
          // Call the success callback if provided
          if (onImportSuccess) {
            console.log('Admin import completed successfully, triggering refresh with ID:', result._id);
            
            // Force a refresh of the survey data by calling the Meteor method to get the latest survey
            Meteor.call('surveys.getById', result._id, (error: any, refreshedSurvey: any) => {
              if (error) {
                console.error('Error refreshing survey data after admin import:', error);
              } else {
                console.log('Successfully refreshed survey data after admin import');
              }
              
              // Call the callback with the survey ID regardless of refresh result
              // This ensures the parent component can handle the navigation/UI update
              onImportSuccess(result._id);
            });
          } else if (result._id) {
            console.log('Admin import completed but no callback provided, survey ID:', result._id);
          }
        } else {
          setAlert({
            type: 'error',
            message: 'Import failed: No survey ID returned'
          });
        }
      });
    } catch (error: any) {
      setIsImporting(false);
      setAlert({
        type: 'error',
        message: `Error processing import data: ${error.message || 'Unknown error'}`
      });
    }
  };

  const openFileSelector = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <Overlay />
      <Panel ref={panelRef}>
        <CloseButton onClick={onClose}>
          <FaTimes />
        </CloseButton>
        
        <Header>
          <Title>Import Survey</Title>
        </Header>
        
        <Content>
          <ImportSection>
            <ImportTitle>Upload Survey JSON</ImportTitle>
            <ImportDescription>
              Import a survey by uploading a JSON file. The file should contain the survey structure, 
              questions, and settings in the correct format.
            </ImportDescription>
            
            <DropZone 
              isDragActive={isDragActive}
              onDragEnter={handleDragEnter}
              onDragLeave={handleDragLeave}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
              onClick={openFileSelector}
            >
              <UploadIcon />
              <DropText>Drag and drop your JSON file here</DropText>
              <DropSubText>or click to browse files</DropSubText>
              <FileInput 
                type="file" 
                ref={fileInputRef}
                accept=".json,application/json"
                onChange={handleFileInputChange}
              />
            </DropZone>
            
            {selectedFile && (
              <FilePreview>
                <PreviewTitle>Selected File: {selectedFile.name}</PreviewTitle>
                {fileContent && (
                  <>
                    <PreviewContent>
                      {fileContent.length > 500 
                        ? `${fileContent.substring(0, 500)}...` 
                        : fileContent}
                    </PreviewContent>
                  </>
                )}
              </FilePreview>
            )}
            
            {alert && (
              <Alert type={alert.type}>
                <AlertIcon color={
                  alert.type === 'success' ? 'var(--color-success, #4CAF50)' : 
                  alert.type === 'error' ? 'var(--color-error, #f44336)' : 
                  '#FF9800'
                }>
                  {alert.type === 'success' && <FaCheck />}
                  {alert.type === 'error' && <FaExclamationTriangle />}
                  {alert.type === 'warning' && <FaExclamationTriangle />}
                </AlertIcon>
                <AlertText>{alert.message}</AlertText>
              </Alert>
            )}
            
            <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'flex-end' }}>
              <Button 
                onClick={handleImport} 
                disabled={!fileContent || isImporting}
              >
                {isImporting ? (
                  <>
                    <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
                    Importing...
                  </>
                ) : (
                  <>
                    <FaUpload />
                    Import Survey
                  </>
                )}
              </Button>
            </div>
          </ImportSection>
        </Content>
      </Panel>
    </>
  );
};

export default SurveyImportSidePanel;
