import React, { useRef, useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { FaTimes, FaUpload, FaFileImport, FaExclamationTriangle, FaSpinner, FaCheck } from 'react-icons/fa';
import { notificationManager } from '/imports/shared/components/GlobalNotification';
import LoadingButton from '/imports/shared/components/LoadingButton';

// Side panel styles
const sidePanelStyles = {
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    zIndex: 2000,
    transition: 'opacity 0.3s ease-in-out',
  },
  panel: {
    position: 'fixed',
    top: 0,
    right: 0,
    width: '90%',
    maxWidth: '800px',
    height: '100%',
    backgroundColor: '#fff',
    boxShadow: '-2px 0 10px rgba(0, 0, 0, 0.2)',
    zIndex: 2001,
    overflowY: 'auto',
    transition: 'transform 0.3s ease-in-out',
    padding: '20px',
  },
  closeButton: {
    position: 'absolute',
    top: '25px',
    right: '15px',
    background: 'rgba(0,0,0,0.05)',
    border: 'none',
    borderRadius: '50%',
    width: '36px',
    height: '36px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: '18px',
    cursor: 'pointer',
    zIndex: 1002,
    transition: 'background 0.2s ease',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '20px',
    paddingRight: '40px',
  }
};

// Define styled components
const Container = styled.div`
  position: relative;
  width: 100%;
  height: 100%;
  overflow-y: auto;
`;

const Title = styled.h2`
  font-size: 24px;
  font-weight: 700;
  color: var(--color-text);
  margin-bottom: 16px;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  margin-bottom: 16px;
  overflow: hidden;
`;

const CardMain = styled.div`
  padding: 16px;
`;

const CardActions = styled.div`
  display: flex;
  justify-content: flex-end;
  padding: 8px 16px;
  border-top: 1px solid #eee;
`;

const UploadArea = styled.div<{ isDragging: boolean }>`
  border: 2px dashed ${props => props.isDragging ? 'var(--color-primary)' : 'var(--color-accent)'};
  border-radius: 8px;
  padding: 32px;
  text-align: center;
  background-color: ${props => props.isDragging ? 'rgba(85, 42, 71, 0.05)' : 'transparent'};
  transition: all 0.2s ease;
  cursor: pointer;
  margin-bottom: 24px;
  
  &:hover {
    border-color: var(--color-primary);
    background-color: rgba(85, 42, 71, 0.05);
  }
`;

const UploadIcon = styled(FaUpload)`
  font-size: 48px;
  color: var(--color-primary);
  margin-bottom: 16px;
  opacity: 0.7;
`;

const UploadText = styled.p`
  font-size: 16px;
  color: var(--color-text);
  margin-bottom: 8px;
`;

const UploadSubtext = styled.p`
  font-size: 14px;
  color: var(--color-accent);
`;

const FileInput = styled.input`
  display: none;
`;

const Alert = styled.div<{ type: 'success' | 'error' | 'progress' }>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  margin-bottom: 16px;
  background-color: ${props => {
    switch (props.type) {
      case 'success': return 'rgba(76, 175, 80, 0.1)';
      case 'error': return 'rgba(244, 67, 54, 0.1)';
      case 'progress': return 'rgba(33, 150, 243, 0.1)';
      default: return 'rgba(33, 150, 243, 0.1)';
    }
  }};
  color: ${props => {
    switch (props.type) {
      case 'success': return '#4CAF50';
      case 'error': return '#F44336';
      case 'progress': return '#2196F3';
      default: return '#2196F3';
    }
  }};
`;

const AlertIcon = styled.div`
  margin-right: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const AlertText = styled.div`
  flex: 1;
`;

const ProgressBar = styled.div<{ progress: number }>`
  height: 4px;
  background-color: #e0e0e0;
  border-radius: 2px;
  margin-top: 8px;
  position: relative;
  overflow: hidden;
  
  &::after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    height: 100%;
    width: ${props => props.progress}%;
    background-color: #2196F3;
    transition: width 0.3s ease;
  }
`;

const Button = styled.button`
  background: var(--color-primary);
  color: white;
  border: none;
  padding: 10px 16px;
  border-radius: 4px;
  font-weight: 600;
  cursor: pointer;
  transition: background 0.2s ease;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &:hover {
    background: var(--color-secondary);
  }
  
  &:disabled {
    background: #cccccc;
    cursor: not-allowed;
  }
`;

const SecondaryButton = styled(Button)`
  background: transparent;
  color: var(--color-primary);
  border: 1px solid var(--color-primary);
  
  &:hover {
    background: rgba(85, 42, 71, 0.05);
  }
`;

const MappingContainer = styled.div`
  margin-top: 24px;
`;

const MappingRow = styled.div`
  display: flex;
  margin-bottom: 12px;
  align-items: center;
`;

const MappingLabel = styled.div`
  width: 150px;
  font-weight: 600;
  color: var(--color-text);
`;

const MappingValue = styled.div`
  flex: 1;
`;

const Select = styled.select`
  width: 100%;
  padding: 8px;
  border: 1px solid var(--color-accent);
  border-radius: 4px;
  background-color: white;
  color: var(--color-text);
`;

const JsonPreview = styled.pre`
  background-color: #f5f5f5;
  padding: 16px;
  border-radius: 4px;
  overflow: auto;
  max-height: 200px;
  font-size: 12px;
  margin-top: 16px;
`;

interface SurveyImportSidePanelProps {
  isOpen: boolean;
  onClose: () => void;
  onImportComplete?: (surveyId: string) => void;
}

interface SurveyImportData {
  title?: string;
  description?: string;
  sections?: any[];
  questions?: any[];
  [key: string]: any;
}

const SurveyImportSidePanel: React.FC<SurveyImportSidePanelProps> = ({
  isOpen,
  onClose,
  onImportComplete
}) => {
  const panelRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isDragging, setIsDragging] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [importData, setImportData] = useState<SurveyImportData | null>(null);
  const [alert, setAlert] = useState<{ type: 'success' | 'error' | 'progress'; message: string; progress?: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<'upload' | 'mapping' | 'importing'>('upload');
  const [fieldMapping, setFieldMapping] = useState<Record<string, string>>({});
  
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
      if (panelRef.current && 
          !panelRef.current.contains(event.target as Node) && 
          isOpen) {
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
      setFile(null);
      setImportData(null);
      setAlert(null);
      setStep('upload');
      setFieldMapping({});
    }
  }, [isOpen]);

  // Show success alert
  const showSuccessAlert = (message: string) => {
    setAlert({ type: 'success', message });
    setTimeout(() => setAlert(null), 3000);
  };
  
  // Show error alert
  const showErrorAlert = (message: string) => {
    setAlert({ type: 'error', message });
    setTimeout(() => setAlert(null), 4000);
  };
  
  // Show progress alert
  const showProgressAlert = (message: string, progress: number) => {
    setAlert({ type: 'progress', message, progress });
  };

  // Handle file selection
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/json') {
        showErrorAlert('Please select a JSON file');
        return;
      }
      setFile(selectedFile);
      readFile(selectedFile);
    }
  };

  // Handle drag events
  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(true);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
    
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      if (droppedFile.type !== 'application/json') {
        showErrorAlert('Please drop a JSON file');
        return;
      }
      setFile(droppedFile);
      readFile(droppedFile);
    }
  };

  // Read the file contents
  const readFile = (file: File) => {
    const reader = new FileReader();
    
    reader.onprogress = (event) => {
      if (event.lengthComputable) {
        const progress = Math.round((event.loaded / event.total) * 100);
        showProgressAlert(`Reading file: ${file.name}`, progress);
      }
    };
    
    reader.onload = (event) => {
      try {
        const content = event.target?.result as string;
        const parsedData = JSON.parse(content);
        
        // Validate the JSON structure
        if (!parsedData || typeof parsedData !== 'object') {
          showErrorAlert('Invalid JSON format');
          return;
        }
        
        setImportData(parsedData);
        showSuccessAlert('File loaded successfully');
        
        // Create initial field mapping
        const initialMapping: Record<string, string> = {};
        
        // Map fields based on common field names
        if (parsedData.title) initialMapping.title = 'title';
        if (parsedData.description) initialMapping.description = 'description';
        if (parsedData.sections) initialMapping.sections = 'sections';
        if (parsedData.questions) initialMapping.questions = 'questions';
        
        setFieldMapping(initialMapping);
        setStep('mapping');
      } catch (error) {
        console.error('Error parsing JSON:', error);
        showErrorAlert('Error parsing JSON file');
      }
    };
    
    reader.onerror = () => {
      showErrorAlert('Error reading file');
    };
    
    reader.readAsText(file);
  };

  // Handle field mapping change
  const handleMappingChange = (field: string, value: string) => {
    setFieldMapping(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Handle import submission
  const handleImport = async () => {
    try {
      setIsSubmitting(true);
      showProgressAlert('Importing survey...', 0);
      
      // Validate required mappings
      if (!fieldMapping.title) {
        showErrorAlert('Title mapping is required');
        setIsSubmitting(false);
        return;
      }
      
      // Map the imported data to the application's survey structure
      const mappedData: Record<string, any> = {};
      
      // Map each field based on the user's mapping
      Object.entries(fieldMapping).forEach(([appField, importField]) => {
        if (importField && importData && importData[importField] !== undefined) {
          mappedData[appField] = importData[importField];
        }
      });
      
      // Ensure required fields are present
      if (!mappedData.title) {
        showErrorAlert('Title field is missing in the mapped data');
        setIsSubmitting(false);
        return;
      }
      
      // Preserve defaultSettings if present in the import data
      if (importData && importData.defaultSettings) {
        mappedData.defaultSettings = importData.defaultSettings;
        
        // Ensure retake settings are properly included
        if (importData.defaultSettings.retakeSettings) {
          if (!mappedData.defaultSettings.retakeSettings) {
            mappedData.defaultSettings.retakeSettings = {};
          }
          mappedData.defaultSettings.retakeSettings = {
            ...mappedData.defaultSettings.retakeSettings,
            ...importData.defaultSettings.retakeSettings
          };
        }
        
        console.log('Including survey retake settings:', {
          allowRetake: mappedData.defaultSettings.allowRetake,
          retakeSettings: mappedData.defaultSettings.retakeSettings
        });
      }
      
      // Call the server method to import the survey
      showProgressAlert('Processing survey data...', 50);
      
      const result = await Meteor.callAsync('surveys.import', mappedData);
      
      showProgressAlert('Survey imported successfully!', 100);
      
      // Show success notification
      notificationManager.success('Survey imported successfully!');
      
      // Call the onImportComplete callback with the new survey ID
      if (onImportComplete && result) {
        console.log('Import completed successfully, triggering refresh with ID:', result);
        
        // Force a refresh of the survey data by calling the Meteor method to get the latest survey
        Meteor.call('surveys.getById', result, (error: any, refreshedSurvey: any) => {
          if (error) {
            console.error('Error refreshing survey data after import:', error);
          } else {
            console.log('Successfully refreshed survey data after import');
          }
          
          // Call the callback with the survey ID regardless of refresh result
          // This ensures the parent component can handle the navigation/UI update
          onImportComplete(result);
        });
      } else if (result) {
        console.log('Import completed but no callback provided, survey ID:', result);
      }
      
      // Close the panel after a short delay
      setTimeout(() => {
        onClose();
      }, 1500);
      
    } catch (error: any) {
      console.error('Error importing survey:', error);
      showErrorAlert(`Error importing survey: ${error.message || 'Unknown error'}`);
      setIsSubmitting(false);
    }
  };

  // Render the upload step
  const renderUploadStep = () => (
    <>
      <Title>Import Survey</Title>
      <UploadArea 
        isDragging={isDragging}
        onClick={() => fileInputRef.current?.click()}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
      >
        <UploadIcon />
        <UploadText>Drag and drop your survey JSON file here</UploadText>
        <UploadSubtext>or click to browse files</UploadSubtext>
        <FileInput 
          type="file" 
          ref={fileInputRef} 
          accept=".json" 
          onChange={handleFileSelect} 
        />
      </UploadArea>
      <div>
        <h3>Import Instructions</h3>
        <p>
          Upload a JSON file containing your survey data. The file should include:
        </p>
        <ul>
          <li>Survey title and description</li>
          <li>Sections with questions</li>
          <li>Question types and answer options</li>
        </ul>
        <p>
          After uploading, you'll be able to map the fields from your JSON file to the application's survey structure.
        </p>
      </div>
    </>
  );

  // Render the mapping step
  const renderMappingStep = () => (
    <>
      <Title>Map Survey Fields</Title>
      <p>Map the fields from your JSON file to the application's survey structure.</p>
      
      <MappingContainer>
        <MappingRow>
          <MappingLabel>Title*</MappingLabel>
          <MappingValue>
            <Select 
              value={fieldMapping.title || ''} 
              onChange={(e) => handleMappingChange('title', e.target.value)}
              required
            >
              <option value="">Select field</option>
              {importData && Object.keys(importData).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </Select>
          </MappingValue>
        </MappingRow>
        
        <MappingRow>
          <MappingLabel>Description</MappingLabel>
          <MappingValue>
            <Select 
              value={fieldMapping.description || ''} 
              onChange={(e) => handleMappingChange('description', e.target.value)}
            >
              <option value="">Select field</option>
              {importData && Object.keys(importData).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </Select>
          </MappingValue>
        </MappingRow>
        
        <MappingRow>
          <MappingLabel>Sections</MappingLabel>
          <MappingValue>
            <Select 
              value={fieldMapping.sections || ''} 
              onChange={(e) => handleMappingChange('sections', e.target.value)}
            >
              <option value="">Select field</option>
              {importData && Object.keys(importData).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </Select>
          </MappingValue>
        </MappingRow>
        
        <MappingRow>
          <MappingLabel>Questions</MappingLabel>
          <MappingValue>
            <Select 
              value={fieldMapping.questions || ''} 
              onChange={(e) => handleMappingChange('questions', e.target.value)}
            >
              <option value="">Select field</option>
              {importData && Object.keys(importData).map(key => (
                <option key={key} value={key}>{key}</option>
              ))}
            </Select>
          </MappingValue>
        </MappingRow>
      </MappingContainer>
      
      <JsonPreview>
        {JSON.stringify(importData, null, 2).substring(0, 500)}
        {importData && JSON.stringify(importData, null, 2).length > 500 ? '...' : ''}
      </JsonPreview>
      
      <CardActions>
        <SecondaryButton onClick={() => setStep('upload')} disabled={isSubmitting}>
          Back
        </SecondaryButton>
        <Button 
          onClick={handleImport} 
          disabled={isSubmitting || !fieldMapping.title}
          style={{ marginLeft: '12px' }}
        >
          {isSubmitting ? (
            <>
              <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />
              Importing...
            </>
          ) : (
            <>
              <FaFileImport />
              Import Survey
            </>
          )}
        </Button>
      </CardActions>
    </>
  );

  // If the panel is not open, don't render anything
  if (!isOpen) return null;

  return (
    <div style={sidePanelStyles.overlay as React.CSSProperties}>
      <div 
        ref={panelRef}
        style={sidePanelStyles.panel as React.CSSProperties}
      >
        <button 
          style={sidePanelStyles.closeButton as React.CSSProperties}
          onClick={onClose}
          aria-label="Close"
        >
          <FaTimes />
        </button>
        
        <Container>
          {alert && (
            <Alert type={alert.type}>
              <AlertIcon>
                {alert.type === 'success' && <FaCheck />}
                {alert.type === 'error' && <FaExclamationTriangle />}
                {alert.type === 'progress' && <FaSpinner style={{ animation: 'spin 1s linear infinite' }} />}
              </AlertIcon>
              <AlertText>
                {alert.message}
                {alert.type === 'progress' && alert.progress !== undefined && (
                  <ProgressBar progress={alert.progress} />
                )}
              </AlertText>
            </Alert>
          )}
          
          <Card>
            <CardMain>
              {step === 'upload' && renderUploadStep()}
              {step === 'mapping' && renderMappingStep()}
            </CardMain>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default SurveyImportSidePanel;
