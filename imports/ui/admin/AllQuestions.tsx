import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaFilter, FaFileImport, FaEdit, FaTrash, FaEye, FaFileAlt, FaCheckCircle, FaThLarge, FaList } from 'react-icons/fa';
import { ImportQuestions } from '../../features/questions/components/admin';
import DashboardBg from './DashboardBg';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Questions } from '../../features/questions/api/questions';
import { WPSCategories } from '../../features/wps-framework/api/wpsCategories';
import { Layers } from '../../api/layers';
import { SurveyThemes } from '../../features/survey-themes/api/surveyThemes';
import DOMPurify from 'dompurify';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import QuestionPreviewModal from './QuestionPreviewModal';
import AdminRichTextRenderer from './components/AdminRichTextRenderer';
import QuestionStats from './components/QuestionStats';
import QuestionListView from './components/QuestionListView';

// Alert component for success and error messages
interface AlertProps {
  type: 'success' | 'error';
  message: string;
  onClose: () => void;
}

const Alert: React.FC<AlertProps> = ({ type, message, onClose }) => {
  useEffect(() => {
    // Auto-close the alert after 5 seconds
    const timer = setTimeout(() => {
      onClose();
    }, 5000);
    
    return () => clearTimeout(timer);
  }, [onClose]);
  
  return (
    <div className={`alert alert-${type}`} style={{
      position: 'fixed',
      top: '20px',
      right: '20px',
      zIndex: 1000,
      padding: '12px 20px',
      borderRadius: '4px',
      backgroundColor: type === 'success' ? '#d4edda' : '#f8d7da',
      color: type === 'success' ? '#155724' : '#721c24',
      border: `1px solid ${type === 'success' ? '#c3e6cb' : '#f5c6cb'}`,
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      minWidth: '300px'
    }}>
      <span>{message}</span>
      <button 
        onClick={onClose} 
        style={{
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          fontSize: '16px',
          marginLeft: '10px',
          color: type === 'success' ? '#155724' : '#721c24',
        }}
      >
        &times;
      </button>
    </div>
  );
};

// Tag color definitions
const QUE_TYPE_LABELS: Record<string, string> = {
  short_text: 'Short Text',
  long_text: 'Long Text',
  free_text: 'Free Text',
  multiple_choice: 'Multiple Choice',
  checkbox: 'Checkbox',
  dropdown: 'Dropdown',
  likert: 'Likert Scale',
  quick_tabs: 'Quick Tabs',
  scale: 'Scale',
  singleSelect: 'Single Select',
  multiSelect: 'Multi Select',
  text: 'Text',
  number: 'Number',
  date: 'Date'
};

const Container = styled.div`
  padding: 40px;
  min-height: 100vh;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
`;

const SearchFilterRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 24px;
`;

const ViewToggleContainer = styled.div`
  display: flex;
  border-radius: 6px;
  overflow: hidden;
  border: 1px solid #e0e0e0;
`;

const ViewToggleButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#552a47' : '#ffffff'};
  color: ${props => props.active ? '#ffffff' : '#555555'};
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#552a47' : '#f0f0f0'};
  }
  
  &:first-child {
    border-right: 1px solid #e0e0e0;
  }
`;

const SearchInput = styled.input`
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background: #f7f2f5;
  font-size: 1rem;
  width: 260px;
`;

const FilterButton = styled.button`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 20px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: #f9f9f9;
  }
`;

const FilterToggle = styled.button`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 20px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  
  &:hover {
    background: #f9f9f9;
  }
`;

const Button = styled.button`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 4px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  font-size: 0.9rem;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f9f9f9;
  }
  
  &.primary {
    background: #552a47;
    color: #fff;
    border: none;
    
    &:hover {
      background: #6a3559;
    }
  }
`;

const FiltersPanel = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 16px;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const FilterLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
`;

const FilterSelect = styled.select`
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 0.9rem;
`;

const QuestionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const QuestionList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const QuestionCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow: hidden;
`;

const QuestionHeader = styled.div`
  padding: 12px 16px;
  background: #f7f2f5;
  border-bottom: 1px solid #eee;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const QuestionType = styled.div`
  font-size: 0.8rem;
  color: #666;
  background: #fff;
  padding: 4px 8px;
  border-radius: 12px;
`;

const QuestionContent = styled.div`
  padding: 16px;
`;

const QuestionText = styled.div`
  font-size: 0.95rem;
  margin-bottom: 12px;
  line-height: 1.4;
`;

const QuestionMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const MetaTag = styled.div`
  background: #f0f0f0;
  color: #666;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 12px;
`;

const StatusTag = styled.div<{ published?: boolean }>`
  display: flex;
  align-items: center;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${props => props.published ? '#e6f7e6' : '#ffebee'};
  color: ${props => props.published ? '#2e7d32' : '#c62828'};
  font-weight: 500;
`;

const QuestionActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  border: none;
  
  &.preview {
    background: #f0f0f0;
    color: #333;
  }
  
  &.edit {
    background: #552a47;
    color: #fff;
  }
  
  &.delete {
    background: #f44336;
    color: #fff;
  }
`;

// Modal components for the import functionality
const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
`;

const ModalContent = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 90%;
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
`;

const ModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 24px;
  border-bottom: 1px solid #eee;
  
  h3 {
    margin: 0;
    font-size: 18px;
    color: #552a47;
  }
`;

const ModalBody = styled.div`
  padding: 24px;
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #666;
  
  &:hover {
    color: #333;
  }
`;

// Helper function to get the latest version of a question
const getLatestVersion = (question: any) => {
  if (!question) return null;
  if (!question.versions || !Array.isArray(question.versions) || question.versions.length === 0) return null;
  
  const currentVersion = question.currentVersion;
  const latestVersion = question.versions.find((v: any) => v.version === currentVersion);
  return latestVersion || question.versions[question.versions.length - 1];
};

// Helper function to strip HTML tags and sanitize text
const stripHtml = (html: string): string => {
  if (!html) return '';
  // Create a temporary div to hold the sanitized HTML
  const tempDiv = document.createElement('div');
  // Sanitize the HTML to prevent XSS attacks
  tempDiv.innerHTML = DOMPurify.sanitize(html);
  // Return the text content only (no HTML tags)
  return tempDiv.textContent || tempDiv.innerText || '';
};

// Helper function to truncate text to a specific length
const truncateText = (text: string, maxLength: number = 100): string => {
  if (!text) return '';
  const cleanText = stripHtml(text);
  if (cleanText.length <= maxLength) return cleanText;
  return cleanText.substring(0, maxLength) + '...';
};

const AllQuestions: React.FC = () => {
  const navigate = useNavigate();
  // Preview modal state
  const [previewQuestion, setPreviewQuestion] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [filterReusable, setFilterReusable] = useState<boolean | null>(null);
  const [filterTheme, setFilterTheme] = useState<string | null>(null);
  const [filterTag, setFilterTag] = useState<string | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);
  // View toggle state - default to list view
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('list');
  
  // Get categories and themes for filtering
  const wpsCategories = useTracker(() => {
    Meteor.subscribe('wpsCategories.all');
    return WPSCategories.find().fetch();
  }, []);
  
  // Get layers (tags) for statistics
  const layers = useTracker(() => {
    Meteor.subscribe('layers.all');
    return Layers.find().fetch();
  }, []);
  
  const surveyThemes = useTracker(() => {
    Meteor.subscribe('surveyThemes.all');
    return SurveyThemes.find().fetch();
  }, []);
  
  // Create a map of category IDs to names for easier lookup
  const wpsCategoryMap = useMemo(() => {
    const map: Record<string, string> = {};
    wpsCategories.forEach((cat: any) => {
      if (cat._id) map[cat._id] = cat.name;
    });
    return map;
  }, [wpsCategories]);
  
  // Create a map of layer IDs to names for tag display
  const layerMap = useMemo(() => {
    const map: Record<string, string> = {};
    layers.forEach((layer: any) => {
      if (layer._id) map[layer._id] = layer.name;
      if (layer.id) map[layer.id] = layer.name; // Some layers might use 'id' instead of '_id'
    });
    return map;
  }, [layers]);
  
  const surveyThemeMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    surveyThemes.forEach((theme: any) => { map[theme._id] = theme.name; });
    return map;
  }, [surveyThemes]);
  
  // Subscribe to Questions collection
  const { questions, loading } = useTracker(() => {
    const handle = Meteor.subscribe('questions.all');
    return {
      loading: !handle.ready(),
      questions: Questions.find({}).fetch()
    };
  }, []);
  
  // Calculate question statistics
  const questionStats = useMemo(() => {
    if (!questions || questions.length === 0) {
      return {
        totalQuestions: 0,
        avgQualityScore: 0,
        totalTags: 0
      };
    }
    
    const totalQuestions = questions.length;
    let totalScore = 0;
    let scoredQuestions = 0;
    
    questions.forEach((q: any) => {
      const latestVersion = getLatestVersion(q);
      if (!latestVersion) return;
      
      // Add quality score if available
      if (latestVersion.qualityScore) {
        totalScore += latestVersion.qualityScore;
        scoredQuestions++;
      }
    });
    
    // Get total tags count from Layers collection
    // This matches the "Categories" count shown in the UI screenshot
    const totalTags = layers ? layers.length : 0;
    
    // Calculate average score (default to 4.5 if no scores available)
    const avgQualityScore = scoredQuestions > 0 ? totalScore / scoredQuestions : 4.5;
    
    return {
      totalQuestions,
      avgQualityScore,
      totalTags
    };
  }, [questions, layers]);

  // Filter questions based on search and filters
  const filteredQuestions = React.useMemo(() => {
    if (!questions) return [];
    
    return questions.filter((q: any) => {
      const latestVersion = getLatestVersion(q);
      if (!latestVersion) return false;
      
      // Apply search term filter
      if (searchTerm && !latestVersion.questionText.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply active filter
      if (filterActive !== null && latestVersion.isActive !== filterActive) {
        return false;
      }
      
      // Apply reusable filter
      if (filterReusable !== null && latestVersion.isReusable !== filterReusable) {
        return false;
      }
      
      // Apply theme filter
      if (filterTheme && (!latestVersion.surveyThemes || !latestVersion.surveyThemes.includes(filterTheme))) {
        return false;
      }
      
      // Apply tag filter
      if (filterTag) {
        // Check in labels array which is where tags are actually stored
        if (latestVersion.labels && Array.isArray(latestVersion.labels)) {
          // Check if any label matches the selected tag
          for (const label of latestVersion.labels) {
            if (typeof label === 'string' && label === filterTag) {
              return true;
            }
            // Handle case where label might be an object with an id property
            if (typeof label === 'object' && label && label.id === filterTag) {
              return true;
            }
          }
        }
        // Also check in categoryTags array as a fallback
        if (latestVersion.categoryTags && Array.isArray(latestVersion.categoryTags) && latestVersion.categoryTags.includes(filterTag)) {
          return true;
        }
        // Also check in category field for backward compatibility
        if (latestVersion.category === filterTag) {
          return true;
        }
        // If we get here and filterTag is set, this question doesn't match
        return false;
      }
      
      return true;
    });
  }, [questions, searchTerm, filterActive, filterReusable, filterTheme, filterTag]);
  
  // Handle importing questions
  const handleImportQuestions = (importedQuestions: any[]) => {
    importedQuestions.forEach(question => {
      Meteor.call('questions.insert', question, (error: any) => {
        if (error) {
          console.error('Error importing question:', error);
        }
      });
    });
  };
  
  // Handle deleting a question
  const handleDeleteQuestion = (questionId: string) => {
    setQuestionToDelete(questionId);
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteQuestion = () => {
    if (questionToDelete) {
      Meteor.call('questions.delete', questionToDelete, (error: any) => {
        if (error) {
          console.error('Error deleting question:', error);
          setAlert({
            type: 'error',
            message: `Error deleting question: ${error.reason || error.message || 'Unknown error'}`
          });
        } else {
          // Show success message
          setAlert({
            type: 'success',
            message: 'Question deleted successfully!'
          });
        }
      });
      setShowDeleteConfirm(false);
      setQuestionToDelete(null);
    }
  };
  
  return (
    <AdminLayout>
      <DashboardBg>
        <Container>
          {alert && (
            <Alert 
              type={alert.type} 
              message={alert.message} 
              onClose={() => setAlert(null)} 
            />
          )}
        
        <TitleRow>
          <Title>All Questions</Title>
          <div style={{ display: 'flex', gap: 12 }}>
            <Button 
              className="primary" 
              onClick={() => navigate('/admin/questions/builder')}
            >
              <FaPlus size={14} />
              New Question
            </Button>
            <Button 
              onClick={() => setShowImportModal(true)}
            >
              <FaFileImport size={14} />
              Import
            </Button>
          </div>
        </TitleRow>
        
        {/* Question Statistics */}
        <QuestionStats 
          totalQuestions={questionStats?.totalQuestions || 0}
          avgQualityScore={questionStats?.avgQualityScore || 0}
          totalTags={questionStats?.totalTags || 0}
          isLoading={loading}
        />
        
        <SearchFilterRow>
          <SearchInput 
            type="text" 
            placeholder="Search questions..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            {/* View Toggle Buttons */}
            <div style={{ display: 'flex', borderRadius: '4px', overflow: 'hidden', border: '1px solid #e0e0e0' }}>
              <ViewToggleButton 
                active={viewMode === 'list'} 
                onClick={() => setViewMode('list')}
                title="List View"
              >
                <FaList size={14} />
              </ViewToggleButton>
              <ViewToggleButton 
                active={viewMode === 'grid'} 
                onClick={() => setViewMode('grid')}
                title="Grid View"
              >
                <FaThLarge size={14} />
              </ViewToggleButton>
            </div>
            
            <FilterToggle onClick={() => setShowFilters(!showFilters)}>
              <FaFilter size={14} />
              Filters {showFilters ? '(on)' : ''}
            </FilterToggle>
          </div>
        </SearchFilterRow>
        
        {showFilters && (
          <FiltersPanel>
            <FilterGroup>
              <FilterLabel>Active Status</FilterLabel>
              <FilterSelect 
                value={filterActive === null ? '' : String(filterActive)}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterActive(val === '' ? null : val === 'true');
                }}
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Reusable</FilterLabel>
              <FilterSelect 
                value={filterReusable === null ? '' : String(filterReusable)}
                onChange={(e) => {
                  const val = e.target.value;
                  setFilterReusable(val === '' ? null : val === 'true');
                }}
              >
                <option value="">All</option>
                <option value="true">Reusable</option>
                <option value="false">Not Reusable</option>
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Tag</FilterLabel>
              <FilterSelect 
                value={filterTag || ''}
                onChange={(e) => setFilterTag(e.target.value || null)}
              >
                <option value="">All Tags</option>
                {layers.map((layer: any) => (
                  <option key={layer._id || layer.id} value={layer._id || layer.id}>{layer.name}</option>
                ))}
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup>
              <FilterLabel>Theme</FilterLabel>
              <FilterSelect 
                value={filterTheme || ''}
                onChange={(e) => setFilterTheme(e.target.value || null)}
              >
                <option value="">All Themes</option>
                {surveyThemes.map((theme: any) => (
                  <option key={theme._id} value={theme._id}>{theme.name}</option>
                ))}
              </FilterSelect>
            </FilterGroup>
          </FiltersPanel>
        )}
        
        <div style={{ marginBottom: 16 }}>
          <div style={{ fontSize: '0.9rem', color: '#666' }}>
            Showing {filteredQuestions.length} questions {searchTerm ? `matching "${searchTerm}"` : ''}
          </div>
        </div>
        
        {/* Questions View - Grid or List based on viewMode */}
        {viewMode === 'grid' ? (
          <QuestionsGrid>
            {filteredQuestions.map((doc: any) => {
              const latestVersion = getLatestVersion(doc);
              if (!latestVersion) return null;
            
              return (
                <QuestionCard key={doc._id}>
                  <QuestionHeader>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      {(QUE_TYPE_LABELS[latestVersion.responseType] || latestVersion.responseType) && (
                        <QuestionType>
                          {QUE_TYPE_LABELS[latestVersion.responseType] || latestVersion.responseType}
                        </QuestionType>
                      )}
                      {latestVersion.status === 'published' ? (
                        <StatusTag published>
                          <FaCheckCircle size={12} />
                        </StatusTag>
                      ) : (
                        <StatusTag>
                          <FaFileAlt size={12} />
                        </StatusTag>
                      )}
                    </div>
                    <div>
                      {latestVersion.categoryTags && latestVersion.categoryTags.length > 0 
                        ? latestVersion.categoryTags.slice(0, 3).map((catId: string, index: number) => (
                            <MetaTag key={index}>{layerMap[catId] || catId}</MetaTag>
                          )).concat(latestVersion.categoryTags.length > 3 ? [<MetaTag key="more">+{latestVersion.categoryTags.length - 3}</MetaTag>] : [])
                        : (latestVersion.category 
                            ? <MetaTag>{layerMap[latestVersion.category] || latestVersion.category}</MetaTag>
                            : null)
                      }
                    </div>
                  </QuestionHeader>
                  <QuestionContent>
                    <QuestionText>
                      <AdminRichTextRenderer content={latestVersion.questionText} truncate={120} />
                    </QuestionText>
                    <QuestionMeta>
                      {latestVersion.surveyThemes && latestVersion.surveyThemes.map((themeId: string) => (
                        <MetaTag key={themeId}>{surveyThemeMap[themeId] || themeId}</MetaTag>
                      ))}
                      {latestVersion.isReusable && <MetaTag>Reusable</MetaTag>}
                      {latestVersion.isActive === false && <MetaTag>Inactive</MetaTag>}
                    </QuestionMeta>
                    <QuestionActions>
                      <ActionButton 
                        className="preview"
                        onClick={() => {
                          setPreviewQuestion(doc);
                          setPreviewOpen(true);
                        }}
                        title="Preview"
                      >
                        <FaEye size={16} />
                      </ActionButton>
                      <ActionButton 
                        className="edit"
                        onClick={() => navigate(`/admin/questions/builder/${doc._id}`)}
                        title="Edit"
                      >
                        <FaEdit size={16} />
                      </ActionButton>
                      <ActionButton 
                        className="delete"
                        onClick={() => {
                          setQuestionToDelete(doc._id);
                          setShowDeleteConfirm(true);
                        }}
                        title="Delete"
                      >
                        <FaTrash size={16} />
                      </ActionButton>
                    </QuestionActions>
                  </QuestionContent>
                </QuestionCard>
              );
            })}
            
            {filteredQuestions.length === 0 && (
              <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '32px 0', color: '#666' }}>
                No questions found matching your criteria.
              </div>
            )}
          </QuestionsGrid>
        ) : (
          /* List View */
          <QuestionListView 
            questions={filteredQuestions}
            onPreview={(question) => {
              setPreviewQuestion(question);
              setPreviewOpen(true);
            }}
            onEdit={(questionId) => navigate(`/admin/questions/builder/${questionId}`)}
            onDelete={(questionId) => {
              setQuestionToDelete(questionId);
              setShowDeleteConfirm(true);
            }}
            layerMap={layerMap}
          />
        )}
          
        {/* Import Questions Modal */}
        {showImportModal && (
            <Modal>
              <ModalContent>
                <ModalHeader>
                  <h3>Import Questions</h3>
                  <CloseButton onClick={() => setShowImportModal(false)}>&times;</CloseButton>
                </ModalHeader>
                <ModalBody>
                  <ImportQuestions
                    onImportComplete={(questions) => {
                      handleImportQuestions(questions);
                      
                      // Close the modal after import is complete
                      setTimeout(() => {
                        setShowImportModal(false);
                      }, 2000);
                    }}
                  />
                </ModalBody>
              </ModalContent>
            </Modal>
          )}
          
          {/* Delete Confirmation Modal */}
          {showDeleteConfirm && (
            <Modal>
              <ModalContent style={{ maxWidth: 400 }}>
                <ModalHeader>
                  <h3>Confirm Delete</h3>
                  <CloseButton onClick={() => {
                    setShowDeleteConfirm(false);
                    setQuestionToDelete(null);
                  }}>&times;</CloseButton>
                </ModalHeader>
                <ModalBody>
                  <p>Are you sure you want to delete this question? This action cannot be undone.</p>
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, marginTop: 24 }}>
                    <button
                      onClick={() => {
                        setShowDeleteConfirm(false);
                        setQuestionToDelete(null);
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 4,
                        border: '1px solid #ddd',
                        background: '#f5f5f5',
                        cursor: 'pointer'
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      onClick={confirmDeleteQuestion}
                      style={{
                        padding: '8px 16px',
                        borderRadius: 4,
                        border: 'none',
                        background: '#f44336',
                        color: 'white',
                        cursor: 'pointer'
                      }}
                    >
                      Delete
                    </button>
                  </div>
                </ModalBody>
              </ModalContent>
            </Modal>
          )}
        </Container>
      </DashboardBg>
    </AdminLayout>
  );
};

export default AllQuestions;
