import React from 'react';
import { FaTimes } from 'react-icons/fa';

// Define interfaces
interface QuestionVersion {
  version: number;
  questionText: string;
  description: string;
  responseType: string;
  options?: any[];
  required?: boolean;
  image?: string;
  leftLabel?: string;
  rightLabel?: string;
  categoryTags?: string[];
  surveyThemes?: string[];
  questionTag?: string;
  customFields?: any[];
  collectFeedback?: boolean;
  feedbackType?: string;
  feedbackPrompt?: string;
  estimatedTimeSeconds?: number;
  labels?: string[];
  categoryId?: string;
  categoryDetails?: string;
  isAssessment?: boolean;
  correctAnswers?: any[];
  points?: number;
  reusable?: boolean;
  active?: boolean;
  priority?: number;
  updatedAt: Date;
  updatedBy: string;
  adminNotes?: string;
  [key: string]: any;
}

interface VersionCompareModalProps {
  versions: QuestionVersion[];
  onClose: () => void;
}

const modalOverlayStyle: React.CSSProperties = {
  position: 'fixed',
  top: 0,
  left: 0,
  right: 0,
  bottom: 0,
  backgroundColor: 'rgba(0, 0, 0, 0.5)',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  zIndex: 3500, // Higher than the version history modal
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '8px',
  width: '95%',
  maxWidth: '1200px',
  maxHeight: '90vh',
  overflow: 'auto',
  padding: '20px',
  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
};

const modalHeaderStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  borderBottom: '1px solid #eee',
  paddingBottom: '15px',
  marginBottom: '20px',
};

const closeButtonStyle: React.CSSProperties = {
  background: 'none',
  border: 'none',
  fontSize: '24px',
  cursor: 'pointer',
  color: '#666',
};

const compareContainerStyle: React.CSSProperties = {
  display: 'flex',
  gap: '20px',
};

const versionColumnStyle: React.CSSProperties = {
  flex: 1,
  border: '1px solid #eee',
  borderRadius: '8px',
  padding: '15px',
};

const versionHeaderStyle: React.CSSProperties = {
  backgroundColor: '#f5f5f5',
  padding: '10px',
  borderRadius: '4px',
  marginBottom: '15px',
};

const fieldContainerStyle: React.CSSProperties = {
  marginBottom: '15px',
  padding: '10px',
  borderRadius: '4px',
};

const fieldLabelStyle: React.CSSProperties = {
  fontWeight: 'bold',
  marginBottom: '5px',
};

const changedFieldStyle: React.CSSProperties = {
  backgroundColor: '#fff8e1',
};

const VersionCompareModal: React.FC<VersionCompareModalProps> = ({
  versions,
  onClose,
}) => {
  if (versions.length !== 2) {
    return (
      <div style={modalOverlayStyle}>
        <div style={modalContentStyle}>
          <div style={modalHeaderStyle}>
            <h2>Error</h2>
            <button style={closeButtonStyle} onClick={onClose}>
              <FaTimes />
            </button>
          </div>
          <p>Exactly two versions must be selected for comparison.</p>
        </div>
      </div>
    );
  }

  // Sort versions by version number (ascending)
  const sortedVersions = [...versions].sort((a, b) => a.version - b.version);
  const olderVersion = sortedVersions[0];
  const newerVersion = sortedVersions[1];

  // Fields to compare
  const fieldsToCompare = [
    { key: 'questionText', label: 'Question Text' },
    { key: 'description', label: 'Description' },
    { key: 'responseType', label: 'Response Type' },
    { key: 'required', label: 'Required', format: (val: boolean) => val ? 'Yes' : 'No' },
    { key: 'options', label: 'Options', format: (options: any[]) => {
      if (!options || options.length === 0) return 'None';
      return options.map(o => o.text).join(', ');
    }},
    { key: 'image', label: 'Image', format: (val: string) => val ? 'Yes' : 'No' },
    { key: 'leftLabel', label: 'Left Label' },
    { key: 'rightLabel', label: 'Right Label' },
    { key: 'categoryTags', label: 'Category Tags', format: (tags: string[]) => {
      if (!tags || tags.length === 0) return 'None';
      return tags.join(', ');
    }},
    { key: 'surveyThemes', label: 'Survey Themes', format: (themes: string[]) => {
      if (!themes || themes.length === 0) return 'None';
      return themes.join(', ');
    }},
    { key: 'questionTag', label: 'Question Tag' },
    { key: 'collectFeedback', label: 'Collect Feedback', format: (val: boolean) => val ? 'Yes' : 'No' },
    { key: 'feedbackType', label: 'Feedback Type' },
    { key: 'feedbackPrompt', label: 'Feedback Prompt' },
    { key: 'estimatedTimeSeconds', label: 'Estimated Time', format: (seconds: number) => {
      if (!seconds) return 'Not set';
      const mins = Math.floor(seconds / 60);
      const secs = seconds % 60;
      return `${mins} min ${secs} sec`;
    }},
    { key: 'labels', label: 'Labels', format: (labels: string[]) => {
      if (!labels || labels.length === 0) return 'None';
      return labels.join(', ');
    }},
    { key: 'categoryId', label: 'Category ID' },
    { key: 'categoryDetails', label: 'Category Details' },
    { key: 'isAssessment', label: 'Is Assessment', format: (val: boolean) => val ? 'Yes' : 'No' },
    { key: 'points', label: 'Points' },
    { key: 'reusable', label: 'Reusable', format: (val: boolean) => val ? 'Yes' : 'No' },
    { key: 'active', label: 'Active', format: (val: boolean) => val ? 'Yes' : 'No' },
    { key: 'priority', label: 'Priority', format: (val: number) => {
      switch(val) {
        case 0: return 'Normal';
        case 1: return 'High';
        case 2: return 'Critical';
        default: return val?.toString() || 'Not set';
      }
    }},
    { key: 'adminNotes', label: 'Admin Notes' },
  ];

  // Check if a field has changed between versions
  const hasFieldChanged = (key: string) => {
    // Handle special cases for arrays and objects
    if (Array.isArray(olderVersion[key]) && Array.isArray(newerVersion[key])) {
      if (olderVersion[key].length !== newerVersion[key].length) return true;
      
      // For simple arrays of primitives
      if (typeof olderVersion[key][0] !== 'object') {
        return JSON.stringify(olderVersion[key]) !== JSON.stringify(newerVersion[key]);
      }
      
      // For arrays of objects (like options), do a more complex comparison
      return JSON.stringify(olderVersion[key]) !== JSON.stringify(newerVersion[key]);
    }
    
    // For objects
    if (typeof olderVersion[key] === 'object' && olderVersion[key] !== null &&
        typeof newerVersion[key] === 'object' && newerVersion[key] !== null) {
      return JSON.stringify(olderVersion[key]) !== JSON.stringify(newerVersion[key]);
    }
    
    // For primitives
    return olderVersion[key] !== newerVersion[key];
  };

  // Format field value for display
  const formatFieldValue = (field: any, version: QuestionVersion) => {
    if (version[field.key] === undefined || version[field.key] === null) {
      return 'Not set';
    }
    
    if (field.format) {
      return field.format(version[field.key]);
    }
    
    return version[field.key].toString();
  };

  return (
    <div style={modalOverlayStyle}>
      <div style={modalContentStyle}>
        <div style={modalHeaderStyle}>
          <h2>Compare Question Versions</h2>
          <button style={closeButtonStyle} onClick={onClose}>
            <FaTimes />
          </button>
        </div>
        
        <div style={compareContainerStyle}>
          <div style={versionColumnStyle}>
            <div style={versionHeaderStyle}>
              <h3>Version {olderVersion.version}</h3>
              <p>Updated: {new Date(olderVersion.updatedAt).toLocaleString()}</p>
            </div>
            
            {fieldsToCompare.map((field) => (
              <div 
                key={field.key}
                style={{
                  ...fieldContainerStyle,
                  ...(hasFieldChanged(field.key) ? changedFieldStyle : {})
                }}
              >
                <div style={fieldLabelStyle}>{field.label}</div>
                <div>{formatFieldValue(field, olderVersion)}</div>
              </div>
            ))}
          </div>
          
          <div style={versionColumnStyle}>
            <div style={versionHeaderStyle}>
              <h3>Version {newerVersion.version}</h3>
              <p>Updated: {new Date(newerVersion.updatedAt).toLocaleString()}</p>
            </div>
            
            {fieldsToCompare.map((field) => (
              <div 
                key={field.key}
                style={{
                  ...fieldContainerStyle,
                  ...(hasFieldChanged(field.key) ? changedFieldStyle : {})
                }}
              >
                <div style={fieldLabelStyle}>{field.label}</div>
                <div>{formatFieldValue(field, newerVersion)}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VersionCompareModal;
