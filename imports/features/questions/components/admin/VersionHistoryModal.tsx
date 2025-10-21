import React, { useState, useEffect, useRef } from 'react';
import { Meteor } from 'meteor/meteor';
import { FaEye, FaHistory, FaTimes, FaExchangeAlt, FaPencilAlt, FaSave, FaBan, FaUndo } from 'react-icons/fa';
import { notificationManager } from '/imports/shared/components/GlobalNotification';
import { useQuestionBuilderPanel } from '../../contexts/QuestionBuilderPanelContext';
import VersionCompareModal from './VersionCompareModal';

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
  versionName?: string;
  [key: string]: any;
}

interface VersionHistoryModalProps {
  versions: QuestionVersion[];
  currentVersion: number;
  onClose: () => void;
  onRevert: (versionNumber: number) => Promise<void>;
  onUpdateVersionName?: (versionNumber: number, versionName: string) => Promise<void>;
  onViewVersion?: (version: QuestionVersion) => void; // New prop for handling view version action
  keepOpenOnView?: boolean; // New prop to control whether modal stays open when viewing a version
  questionId?: string; // Question ID to attach to version data
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
  zIndex: 3000,
};

const modalContentStyle: React.CSSProperties = {
  backgroundColor: 'white',
  borderRadius: '8px',
  width: '90%',
  maxWidth: '900px',
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

const versionTableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  marginTop: '15px',
};

const tableHeaderStyle: React.CSSProperties = {
  backgroundColor: '#f5f5f5',
  textAlign: 'left',
  padding: '10px',
  borderBottom: '2px solid #ddd',
};

const tableCellStyle: React.CSSProperties = {
  padding: '10px',
  borderBottom: '1px solid #ddd',
};

const currentVersionRowStyle: React.CSSProperties = {
  backgroundColor: '#f0f7ff',
};

const actionButtonStyle: React.CSSProperties = {
  background: 'none',
  border: '1px solid #ddd',
  borderRadius: '4px',
  padding: '5px 10px',
  marginRight: '5px',
  cursor: 'pointer',
  display: 'inline-flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '12px',
  marginBottom: '5px',
};

const compareButtonStyle: React.CSSProperties = {
  backgroundColor: '#552a47',
  color: 'white',
  border: 'none',
  borderRadius: '4px',
  padding: '8px 15px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  gap: '5px',
  fontSize: '14px',
  marginTop: '15px',
};

const VersionHistoryModal: React.FC<VersionHistoryModalProps> = ({
  versions,
  currentVersion,
  onClose,
  onRevert,
  onUpdateVersionName,
  onViewVersion,
  keepOpenOnView = true, // Default to keeping the modal open when viewing a version
  questionId // Question ID to attach to version data
}) => {
  // Helper function to prevent event propagation
  const preventPropagation = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };
  const [selectedVersions, setSelectedVersions] = useState<number[]>([]);
  const [isComparing, setIsComparing] = useState(false);
  const [isLoading, setIsLoading] = useState<number | null>(null);
  // Error state is no longer needed as we'll use global notifications
  const [editingVersion, setEditingVersion] = useState<number | null>(null);
  const [versionNameInput, setVersionNameInput] = useState<string>('');
  
  // Get user information for display
  const [userMap, setUserMap] = useState<Record<string, string>>({});
  
  useEffect(() => {
    // Collect all unique user IDs
    const userIds = [...new Set(versions.map(v => v.updatedBy))];
    
    // Fetch user information for all IDs
    if (userIds.length > 0) {
      Meteor.call('users.getBasicInfo', userIds, (err: Error, result: Record<string, string>) => {
        if (err) {
          console.error('Error fetching user information:', err);
        } else if (result) {
          setUserMap(result);
        }
      });
    }
  }, [versions]);
  
  const handleVersionSelect = (version: number) => {
    if (selectedVersions.includes(version)) {
      setSelectedVersions(selectedVersions.filter(v => v !== version));
    } else {
      // Limit to 2 selections for comparison
      if (selectedVersions.length >= 2) {
        setSelectedVersions([selectedVersions[1], version]);
      } else {
        setSelectedVersions([...selectedVersions, version]);
      }
    }
  };
  
  // Access the QuestionBuilderPanel context at the top level of the component
  const questionBuilderPanel = useQuestionBuilderPanel();
  
  const handleViewVersion = (version: QuestionVersion) => {
    // Add the current version number to the version data for comparison in the side panel
    const versionWithCurrentVersion = {
      ...version,
      currentVersion: currentVersion,
      questionId: questionId || versions[0]?.questionId || '' // Use provided questionId first, then fallback to version's questionId
    };
    
    // Debug the version data being passed
    console.log('View version with data:', {
      questionId: versionWithCurrentVersion.questionId,
      version: versionWithCurrentVersion.version
    });
    
    // If onViewVersion prop is provided, use it to open the side panel
    if (onViewVersion) {
      onViewVersion(versionWithCurrentVersion);
      return;
    }
    
    // Use the context's openVersionPanel method to show the version in read-only mode
    questionBuilderPanel.openVersionPanel(versionWithCurrentVersion);
    
    // Only close the modal if keepOpenOnView is false
    if (!keepOpenOnView) {
      onClose();
    }
  };
  
  const handleRevertVersion = async (versionNumber: number) => {
    try {
      setIsLoading(versionNumber);
      await onRevert(versionNumber);
      onClose(); // Close modal after successful revert
      notificationManager.success(`Successfully reverted to version ${versionNumber}`);
    } catch (error: any) {
      notificationManager.error(`Error reverting to version ${versionNumber}: ${error.message || 'Unknown error'}`);
    } finally {
      setIsLoading(null);
    }
  };
  
  const formatDate = (date: Date) => {
    if (!date) return 'Unknown';
    return new Date(date).toLocaleString();
  };
  
  const getUserName = (userId: string) => {
    return userMap[userId] || userId;
  };
  
  // Handle modal events to prevent propagation
  const handleModalEvent = (e: React.MouseEvent | React.KeyboardEvent) => {
    e.preventDefault();
    e.stopPropagation();
    return false;
  };

  return (
    <div 
      style={modalOverlayStyle}
      onClick={handleModalEvent}
      onMouseDown={handleModalEvent}
      onMouseUp={handleModalEvent}
      onKeyDown={handleModalEvent}
      className="version-history-modal-overlay"
      data-modal-container="true"
    >
      <div 
        style={modalContentStyle}
        onClick={(e) => e.stopPropagation()} // Prevent clicks inside the modal from closing the parent panel
        className="version-history-modal-content"
      >
        <div style={modalHeaderStyle}>
          <h2>Question History</h2>
          <button 
            style={closeButtonStyle} 
            onClick={(e) => {
              preventPropagation(e);
              onClose();
            }}>
            <FaTimes />
          </button>
        </div>
        
        <div>
          <p>This question has {versions.length} versions. The current version is {(() => {
            // Find the current version object
            const currentVersionObj = versions.find(v => v.version === currentVersion);
            // Display version name if available, otherwise just the version number
            return currentVersionObj?.versionName || `v${currentVersion}`;
          })()}.</p>
          
          {selectedVersions.length === 2 && (
            <button 
              style={compareButtonStyle}
              onClick={(e) => {
                preventPropagation(e);
                setIsComparing(true);
              }}
            >
              <FaExchangeAlt /> Compare Selected Versions
            </button>
          )}
          
          <table style={versionTableStyle}>
            <thead>
              <tr>
                <th style={tableHeaderStyle}>Select</th>
                <th style={tableHeaderStyle}>Version</th>
                <th style={tableHeaderStyle}>Last Updated</th>
                <th style={tableHeaderStyle}>Updated By</th>
                <th style={tableHeaderStyle}>Notes</th>
                <th style={tableHeaderStyle}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {versions.map((version) => (
                <tr 
                  key={version.version} 
                  style={version.version === currentVersion ? currentVersionRowStyle : {}}
                >
                  <td style={tableCellStyle}>
                    <input 
                      type="checkbox" 
                      checked={selectedVersions.includes(version.version)}
                      onChange={() => handleVersionSelect(version.version)} 
                    />
                  </td>
                  <td style={tableCellStyle}>
                    {editingVersion === version.version ? (
                      <div style={{ display: 'flex', gap: '5px', alignItems: 'center' }}>
                        <input
                          type="text"
                          value={versionNameInput}
                          onChange={(e) => setVersionNameInput(e.target.value)}
                          onClick={(e) => preventPropagation(e)}
                          onMouseDown={(e) => preventPropagation(e)}
                          onKeyDown={(e) => e.stopPropagation()}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '4px',
                            border: '1px solid #ccc',
                            fontSize: '14px',
                            width: '150px',
                            zIndex: 3100
                          }}
                          placeholder={`v${version.version}`}
                          data-version={version.version}
                          autoFocus
                        />
                        <button
                          onClick={async (e) => {
                            preventPropagation(e);
                            if (onUpdateVersionName) {
                              try {
                                await onUpdateVersionName(version.version, versionNameInput);
                                setEditingVersion(null);
                                notificationManager.success(`Successfully updated version name to ${versionNameInput}`);
                              } catch (err: any) {
                                notificationManager.error(`Error updating version name: ${err.message || 'Unknown error'}`);
                              }
                            }
                          }}
                          style={{
                            ...actionButtonStyle,
                            backgroundColor: '#4caf50',
                            padding: '6px',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'inline-flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                          title="Save"
                        >
                          <FaSave size={12} />
                        </button>
                        <button
                          onClick={(e) => {
                            preventPropagation(e);
                            setEditingVersion(null);
                          }}
                          style={{
                            ...actionButtonStyle,
                            backgroundColor: '#f44336',
                            padding: '6px',
                            borderRadius: '50%',
                            width: '28px',
                            height: '28px',
                            display: 'inline-flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                          }}
                          title="Cancel"
                        >
                          <FaBan size={12} />
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <span>{version.versionName ? version.versionName : `v${version.version}`}</span>
                        {onUpdateVersionName && (
                          <button
                            onClick={(e) => {
                              preventPropagation(e);
                              // Initialize with current version name or the default v{number} format
                              setVersionNameInput(version.versionName || `v${version.version}`);
                              setEditingVersion(version.version);
                              // Use setTimeout to ensure the input field is rendered before trying to focus it
                              setTimeout(() => {
                                const inputElement = document.querySelector(`input[data-version="${version.version}"]`) as HTMLInputElement;
                                if (inputElement) {
                                  inputElement.focus();
                                }
                              }, 50);
                            }}
                            style={{
                              ...actionButtonStyle,
                              backgroundColor: 'var(--color-primary, #542A46)',
                              padding: '6px',
                              marginLeft: '5px',
                              fontSize: '12px',
                              borderRadius: '50%',
                              width: '28px',
                              height: '28px',
                              display: 'inline-flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              color: '#fff'
                            }}
                            title="Edit Version Name"
                          >
                            <FaPencilAlt size={12} />
                          </button>
                        )}
                      </div>
                    )}
                  </td>
                  <td style={tableCellStyle}>{formatDate(version.updatedAt)}</td>
                  <td style={tableCellStyle}>{getUserName(version.updatedBy)}</td>
                  <td style={tableCellStyle}>{version.adminNotes || '-'}</td>
                  <td style={tableCellStyle}>
                    <button 
                      style={actionButtonStyle}
                      onClick={(e) => {
                        preventPropagation(e);
                        handleViewVersion(version);
                      }}
                    >
                      <FaEye /> View
                    </button>
                    
                    {version.version !== currentVersion && (
                      <button 
                        style={{
                          ...actionButtonStyle,
                          opacity: isLoading === version.version ? 0.7 : 1,
                        }}
                        onClick={(e) => {
                          preventPropagation(e);
                          handleRevertVersion(version.version);
                        }}
                        disabled={isLoading !== null}
                      >
                        <FaHistory /> {isLoading === version.version ? 'Reverting...' : 'Revert'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {isComparing && selectedVersions.length === 2 && (
          <VersionCompareModal 
            versions={versions.filter(v => selectedVersions.includes(v.version))}
            onClose={() => setIsComparing(false)}
          />
        )}
      </div>
    </div>
  );
};

export default VersionHistoryModal;
