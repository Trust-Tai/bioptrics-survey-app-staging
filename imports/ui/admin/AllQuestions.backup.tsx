import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaFilter, FaFileImport, FaEdit, FaTrash, FaEye, FaFileAlt, FaCheckCircle, FaThLarge, FaList } from 'react-icons/fa';
import { ImportQuestions } from '../../features/questions/components/admin';
import DashboardBg from './DashboardBg';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Questions } from '../../features/questions/api/questions';
import { WPSCategories } from '../../features/wps-framework/api/wpsCategories';
import { SurveyThemes } from '../../features/survey-themes/api/surveyThemes';
import DOMPurify from 'dompurify';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import QuestionPreviewModal from './QuestionPreviewModal';
import AdminRichTextRenderer from './components/AdminRichTextRenderer';
import QuestionStatsSummary from './components/QuestionStatsSummary';

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
  gap: 12px;
  margin-bottom: 24px;
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

// View toggle button styles
const ViewToggleContainer = styled.div`
  display: flex;
  align-items: center;
  margin-left: 16px;
`;

const ViewToggleButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? '#552a47' : '#f5f5f5'};
  color: ${props => props.active ? 'white' : '#666'};
  border: none;
  border-radius: 4px;
  padding: 6px 10px;
  margin-right: 8px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.active ? '#552a47' : '#e0e0e0'};
  }
  
  svg {
    margin-right: 4px;
  }
`;

// Grid view styles
const QuestionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

// List view styles
const QuestionTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  margin-top: 16px;
  background: white;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 1px 6px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.thead`
  background-color: #f8f9fa;
  
  th {
    padding: 12px 16px;
    text-align: left;
    font-weight: 600;
    color: #444;
    border-bottom: 1px solid #eee;
  }
`;

const TableBody = styled.tbody`
  tr {
    &:hover {
      background-color: #f9f9f9;
    }
    
    &:not(:last-child) {
      border-bottom: 1px solid #eee;
    }
  }
  
  td {
    padding: 12px 16px;
    vertical-align: middle;
  }
`;

const TableActions = styled.div`
  display: flex;
  gap: 8px;
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
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [filterReusable, setFilterReusable] = useState<boolean | null>(null);
  const [filterTheme, setFilterTheme] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [questionToDelete, setQuestionToDelete] = useState<string | null>(null);
  const [alert, setAlert] = useState<{type: 'success' | 'error', message: string} | null>(null);
  // View state (list or grid)
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list'); // Default to list view
  
  // Fetch all categories and themes
  const wpsCategories = useTracker(() => {
    Meteor.subscribe('wpsCategories.all');
    return WPSCategories.find().fetch();
  }, []);
  
  const surveyThemes = useTracker(() => {
    Meteor.subscribe('surveyThemes.all');
    return SurveyThemes.find().fetch();
  }, []);
  
  // Build lookup maps
  const wpsCategoryMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    wpsCategories.forEach((cat: any) => { map[cat._id] = cat.name; });
    return map;
  }, [wpsCategories]);
  
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
      
      // Apply category filter
      if (filterCategory && latestVersion.category !== filterCategory) {
        return false;
      }
      
      // Apply priority filter
      if (filterPriority !== null && latestVersion.priority !== filterPriority) {
        return false;
      }
      
      return true;
    });
  }, [questions, searchTerm, filterActive, filterReusable, filterTheme, filterCategory, filterPriority]);
  
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
  
  // Handle preview question
  const handlePreviewQuestion = (question: any) => {
    const latestVersion = getLatestVersion(question);
    if (!latestVersion) return;
    
    // Get theme names for display
    const themeNames = latestVersion.surveyThemes
      ? latestVersion.surveyThemes.map((themeId: string) => surveyThemeMap[themeId] || themeId)
      : [];
      
    // Set preview question with enhanced data
    setPreviewQuestion({
      ...latestVersion,
      themeNames: themeNames,
      surveyThemeNames: themeNames,
      // Include version info
      version: question.currentVersion,
      currentVersion: question.currentVersion
    });
    setPreviewOpen(true);
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
          {/* Show alert if it exists */}
          {alert && (
            <Alert 
              type={alert.type} 
              message={alert.message} 
              onClose={() => setAlert(null)} 
            />
          )}
          <TitleRow>
            <Title>All Questions</Title>
            <div style={{ display: 'flex', gap: '12px' }}>
              <ViewToggleContainer>
                <ViewToggleButton 
                  active={viewMode === 'list'} 
                  onClick={() => setViewMode('list')}
                >
                  <FaList size={14} /> List
                </ViewToggleButton>
                <ViewToggleButton 
                  active={viewMode === 'grid'} 
                  onClick={() => setViewMode('grid')}
                >
                  <FaThLarge size={14} /> Grid
                </ViewToggleButton>
              </ViewToggleContainer>
              <button 
                onClick={() => setShowFilters(!showFilters)}
                style={{ 
                  background: '#fff', 
                  color: '#552a47', 
                  border: '1px solid #552a47', 
                  borderRadius: 8, 
                  padding: '8px 16px', 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 6, 
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                <FaFilter size={14} style={{ marginRight: 6 }} /> Filters {showFilters ? '(Hide)' : '(Show)'}
              </button>
              <button 
                onClick={() => setShowImportModal(true)} 
                style={{ 
                  borderRadius: '0 4px 4px 0', 
                  background: viewMode === 'grid' ? '#552a47' : '#fff',
                  color: viewMode === 'grid' ? '#fff' : '#333'
                }} 
                onClick={() => setViewMode('grid')}
              >
                <FaThLarge />
              </Button>
                  gap: 6, 
                  cursor: 'pointer',
                  fontWeight: 600,
                  fontSize: 15,
                }}
              >
                <FaPlus size={14} style={{ marginRight: 6 }} /> New Question
              </button>
            </div>
          </TitleRow>
          
          <SearchFilterRow>
            <SearchInput 
              type="text" 
              placeholder="Search questions..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FilterButton onClick={() => setShowFilters(!showFilters)}>
              <FaFilter size={12} /> Filters {showFilters ? '(Hide)' : '(Show)'}
            </FilterButton>
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
                <FilterLabel>Category</FilterLabel>
                <FilterSelect 
                  value={filterCategory || ''}
                  onChange={(e) => setFilterCategory(e.target.value || null)}
                >
                  <option value="">All Categories</option>
                  {wpsCategories.map((cat: any) => (
                    <option key={cat._id} value={cat._id}>{cat.name}</option>
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
              
              <FilterGroup>
                <FilterLabel>Priority</FilterLabel>
                <FilterSelect 
                  value={filterPriority === null ? '' : String(filterPriority)}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilterPriority(val === '' ? null : Number(val));
                  }}
                >
                  <option value="">All Priorities</option>
                  <option value="1">Low (1)</option>
                  <option value="2">Medium (2)</option>
                  <option value="3">High (3)</option>
                </FilterSelect>
              </FilterGroup>
            </FiltersPanel>
          )}
          
          {/* Stats Summary */}
          <QuestionStatsSummary />
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              Showing {filteredQuestions.length} questions {searchTerm ? `matching "${searchTerm}"` : ''}
            </div>
          </div>
          
          {/* Grid View */}
          {viewMode === 'grid' && (
            <QuestionGrid>
              {filteredQuestions.map((doc: any) => {
                const latestVersion = getLatestVersion(doc);
                if (!latestVersion) return null;
                
                return (
                  <QuestionCard key={doc._id}>
                    <QuestionHeader>
                      <div>
                        {latestVersion.categoryTags && latestVersion.categoryTags.length > 0 
                          ? latestVersion.categoryTags.map((catId: string) => wpsCategoryMap[catId] || catId).join(', ')
                          : (latestVersion.category 
                              ? wpsCategoryMap[latestVersion.category] || latestVersion.category 
                              : 'Uncategorized')
                        }
                      </div>
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
                          onClick={() => handlePreviewQuestion(doc)}
                        >
                          <FaEye size={12} style={{ marginRight: 4 }} /> Preview
                        </ActionButton>
                        <ActionButton 
                          className="edit"
                          onClick={() => navigate(`/admin/questions/builder/${doc._id}`)}
                        >
                          <FaEdit size={12} style={{ marginRight: 4 }} /> Edit
                        </ActionButton>
                        <ActionButton 
                          className="delete"
                          onClick={() => handleDeleteQuestion(doc._id)}
                        >
                          <FaTrash size={12} style={{ marginRight: 4 }} /> Delete
                        </ActionButton>
                      </QuestionActions>
                    </QuestionContent>
                  </QuestionCard>
                );
              })}
            </QuestionGrid>
          )}
          
          {/* List View */}
          {viewMode === 'list' && (
            <QuestionTable>
              <TableHeader>
                <tr>
                  <th>Question</th>
                  <th>Type</th>
                  <th>Category</th>
                  <th>Tags</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </TableHeader>
              <TableBody>
                {filteredQuestions.map((doc: any) => {
                  const latestVersion = getLatestVersion(doc);
                  if (!latestVersion) return null;
                  
                  const category = latestVersion.categoryTags && latestVersion.categoryTags.length > 0 
                    ? latestVersion.categoryTags.map((catId: string) => wpsCategoryMap[catId] || catId).join(', ')
                    : (latestVersion.category 
                        ? wpsCategoryMap[latestVersion.category] || latestVersion.category 
                        : 'Uncategorized');
                  
                  return (
                    <tr key={doc._id}>
                      <td style={{ maxWidth: '300px' }}>
                        <AdminRichTextRenderer content={latestVersion.questionText} truncate={80} />
                      </td>
                      <td>
                        {QUE_TYPE_LABELS[latestVersion.responseType] || latestVersion.responseType}
                      </td>
                      <td>{category}</td>
                      <td>
                        {latestVersion.surveyThemes && latestVersion.surveyThemes.map((themeId: string) => (
                          <MetaTag key={themeId} style={{ marginRight: '4px' }}>
                            {surveyThemeMap[themeId] || themeId}
                          </MetaTag>
                        ))}
                      </td>
                      <td>
                        {latestVersion.status === 'published' ? (
                          <StatusTag published style={{ display: 'inline-flex' }}>
                            <FaCheckCircle size={12} />
                          </StatusTag>
                        ) : (
                          <StatusTag style={{ display: 'inline-flex' }}>
                            <FaFileAlt size={12} />
                          </StatusTag>
                        )}
                      </td>
                      <td>
                        <TableActions>
                          <ActionButton 
                            className="preview"
                            onClick={() => handlePreviewQuestion(doc)}
                          >
                            <FaEye size={12} /> 
                          </ActionButton>
                          <ActionButton 
                            className="edit"
                            onClick={() => navigate(`/admin/questions/builder/${doc._id}`)}
                          >
                            <FaEdit size={12} /> 
                          </ActionButton>
                          <ActionButton 
                            className="delete"
                            onClick={() => handleDeleteQuestion(doc._id)}
                          >
                            <FaTrash size={12} /> 
                          </ActionButton>
                        </TableActions>
                      </td>
                    </tr>
                  );
                })}
              </TableBody>
            </QuestionTable>
          )}
                              themeNames: themeNames,
                              surveyThemeNames: themeNames,
                              // Include version info
                              version: doc.currentVersion,
                              currentVersion: doc.currentVersion
                            });
                            setPreviewOpen(true);
                          }
                        }}
                      >
                        <FaEye size={12} style={{ marginRight: 4 }} /> Preview
                      </ActionButton>
                      <ActionButton 
                        className="edit"
                        onClick={() => navigate(`/admin/questions/builder/${doc._id}`)}
                      >
                        <FaEdit size={12} style={{ marginRight: 4 }} /> Edit
                      </ActionButton>
                      <ActionButton 
                        className="delete"
                        onClick={() => handleDeleteQuestion(doc._id)}
                      >
                        <FaTrash size={12} style={{ marginRight: 4 }} /> Delete
                      </ActionButton>
                    </QuestionActions>
                  </QuestionContent>
                </QuestionCard>
              );
            })}
          </QuestionList>
          
          {previewOpen && previewQuestion && (
            <QuestionPreviewModal
              question={previewQuestion}
              open={previewOpen}
              onClose={() => setPreviewOpen(false)}
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
