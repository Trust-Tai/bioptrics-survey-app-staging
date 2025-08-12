import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaEye, FaEllipsisV, FaChartLine, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import AdminRichTextRenderer from './AdminRichTextRenderer';

// Styled components
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: visible; /* To prevent dropdown clipping */
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.thead`
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const TableHeaderCell = styled.th<{ sortable?: boolean }>`
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
  cursor: ${props => props.sortable ? 'pointer' : 'default'};
  user-select: none;
  position: relative;
  
  &:hover {
    background-color: ${props => props.sortable ? '#f1f3f5' : 'transparent'};
  }
  
  .sort-icon {
    margin-left: 5px;
    vertical-align: middle;
    display: inline-block;
  }
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #e9ecef;
  cursor: pointer;
  &:hover {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: #212529;
  vertical-align: middle;
`;

const StatusBadge = styled.span<{ active: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => props.active ? '#e6f7ed' : '#ffebee'};
  color: ${props => props.active ? '#0a8043' : '#d32f2f'};
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    background-color: ${props => props.active ? '#0a8043' : '#d32f2f'};
  }
`;

const TypeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  background-color: var(--color-primary, #542A46);
  color: #ffffff;
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
`;

const Tag = styled.span`
  background: var(--color-primary, #542A46);
  color: #ffffff;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  border: 1px solid #eeeeee;
`;

const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

const DropdownButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #6c757d;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #f1f3f5;
  }
`;

const DropdownMenu = styled.div<{ position: 'top' | 'bottom' }>`
  position: absolute;
  ${props => props.position === 'bottom' ? 'top: 100%;' : 'bottom: 100%;'}
  right: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  width: 180px;
  z-index: 1000;
  overflow: hidden;
  transform: translateZ(0); /* Ensures the dropdown renders above other elements */
`;

const DropdownItem = styled.div`
  padding: 10px 16px;
  font-size: 14px;
  color: #212529;
  cursor: pointer;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

// Define type for sort field
type SortField = 'questionText' | 'responseType' | 'tags' | 'isActive' | 'updatedAt' | null;

// Define type for sort direction
type SortDirection = 'asc' | 'desc';

interface QuestionTableViewProps {
  questions: any[];
  onPreview: (question: any) => void;
  onAnalytics: (question: any) => void;
  onEdit: (questionId: string) => void;
  onDelete: (questionId: string) => void;
  layerMap?: Record<string, string>; // Map of layer IDs to layer names
}

const QuestionTableView: React.FC<QuestionTableViewProps> = ({ 
  questions, 
  onPreview, 
  onAnalytics,
  onEdit, 
  onDelete,
  layerMap = {}
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  
  // Add state for sorting
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Click outside handler to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // If clicking outside any dropdown, close the open dropdown
      if (openDropdown && !(event.target as Element).closest('.dropdown-container')) {
        setOpenDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Function to determine dropdown position based on available space
  const handleDropdownToggle = (e: React.MouseEvent, questionId: string) => {
    e.stopPropagation();
    
    // If already open, just close it
    if (openDropdown === questionId) {
      setOpenDropdown(null);
      return;
    }
    
    // Check position in viewport
    const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    
    // Calculate percentage of viewport height available below the button
    const spaceBelowPercentage = (spaceBelow / viewportHeight) * 100;
    
    // If less than 30% of viewport height is available below, position dropdown above
    setDropdownPosition(spaceBelowPercentage < 30 ? 'top' : 'bottom');
    setOpenDropdown(questionId);
  };
  
  // Function to handle column sorting
  const handleSort = (field: SortField) => {
    // If clicking the same field, toggle direction
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // If clicking a new field, set it as the sort field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Function to render sort icon
  const renderSortIcon = (field: SortField) => {
    if (sortField !== field) {
      return <FaSort className="sort-icon" size={12} opacity={0.5} />;
    }
    
    return sortDirection === 'asc' 
      ? <FaSortUp className="sort-icon" size={12} /> 
      : <FaSortDown className="sort-icon" size={12} />;
  };
  
  // Helper function to get tag name from ID
  const getTagName = (tagId: string) => {
    if (!tagId) return '';
    return layerMap[tagId] || tagId;
  };
  
  // Helper function to strip HTML tags and decode HTML entities
  const stripHtml = (html: string) => {
    if (!html) return '';
    // First remove HTML tags
    const textWithoutTags = html.replace(/<[^>]*>/g, '');
    // Then decode HTML entities using a temporary DOM element
    const textarea = document.createElement('textarea');
    textarea.innerHTML = textWithoutTags;
    return textarea.value;
  };
  
  // Helper function to get latest version of a question
  const getLatestVersion = (question: any) => {
    if (!question.versions || !question.versions.length) return null;
    return question.versions.reduce((latest: any, current: any) => {
      return (!latest || current.version > latest.version) ? current : latest;
    }, null);
  };
  
  // Helper function to get answer type label
  const getAnswerTypeLabel = (type: string) => {
    switch (type.toLowerCase()) {
      case 'checkbox':
        return 'Checkbox';
      case 'radio':
        return 'Multiple Choice';
      case 'select':
        return 'Dropdown';
      case 'text':
        return 'Text';
      case 'textarea':
        return 'Long Text';
      case 'slider':
        return 'Slider';
      default:
        return type.charAt(0).toUpperCase() + type.slice(1);
    }
  };
  
  // Sort the questions based on current sort field and direction
  const sortedQuestions = [...questions].sort((a, b) => {
    if (!sortField) return 0;
    
    const versionA = getLatestVersion(a);
    const versionB = getLatestVersion(b);
    
    if (!versionA || !versionB) return 0;
    
    let comparison = 0;
    
    switch (sortField) {
      case 'questionText':
        comparison = stripHtml(versionA.questionText).localeCompare(stripHtml(versionB.questionText));
        break;
      case 'responseType':
        comparison = (versionA.responseType || '').localeCompare(versionB.responseType || '');
        break;
      case 'tags':
        // Compare by number of tags first
        const tagsA = (versionA.labels || []).length + (versionA.categoryTags || []).length;
        const tagsB = (versionB.labels || []).length + (versionB.categoryTags || []).length;
        comparison = tagsA - tagsB;
        break;
      case 'isActive':
        // Active questions first
        const activeA = versionA.isActive !== false;
        const activeB = versionB.isActive !== false;
        comparison = activeA === activeB ? 0 : activeA ? -1 : 1;
        break;
      case 'updatedAt':
        const dateA = new Date(versionA.updatedAt || a.updatedAt).getTime();
        const dateB = new Date(versionB.updatedAt || b.updatedAt).getTime();
        comparison = dateA - dateB;
        break;
      default:
        return 0;
    }
    
    // Reverse the comparison if sorting in descending order
    return sortDirection === 'asc' ? comparison : -comparison;
  });
  
  return (
    <Table>
      <TableHeader>
        <tr>
          <TableHeaderCell 
            sortable 
            onClick={() => handleSort('questionText')}
          >
            QUESTION {renderSortIcon('questionText')}
          </TableHeaderCell>
          <TableHeaderCell 
            sortable 
            onClick={() => handleSort('responseType')}
          >
            TYPE {renderSortIcon('responseType')}
          </TableHeaderCell>
          <TableHeaderCell 
            sortable 
            onClick={() => handleSort('tags')}
          >
            TAGS {renderSortIcon('tags')}
          </TableHeaderCell>
          <TableHeaderCell 
            sortable 
            onClick={() => handleSort('isActive')}
          >
            STATUS {renderSortIcon('isActive')}
          </TableHeaderCell>
          <TableHeaderCell 
            sortable 
            onClick={() => handleSort('updatedAt')}
          >
            UPDATED {renderSortIcon('updatedAt')}
          </TableHeaderCell>
          <TableHeaderCell>ACTIONS</TableHeaderCell>
        </tr>
      </TableHeader>
      <TableBody>
        {sortedQuestions.map(question => {
          const latestVersion = getLatestVersion(question);
          if (!latestVersion) return null;
          
          const questionText = stripHtml(latestVersion.questionText);
          const isActive = latestVersion.isActive !== false;
          const updatedDate = new Date(latestVersion.updatedAt || question.updatedAt).toLocaleDateString();
          
          // Get tags from either labels or categoryTags
          const tags = [
            ...(latestVersion.labels || []),
            ...(latestVersion.categoryTags || [])
          ].filter(Boolean).slice(0, 3);
          
          return (
            <TableRow 
              key={question._id} 
              data-no-navigate="true"
              onClick={() => onEdit(question._id)}
            >
              <TableCell>
                {questionText.length > 100 ? `${questionText.substring(0, 100)}...` : questionText}
              </TableCell>
              <TableCell>
                <TypeBadge>
                  {getAnswerTypeLabel(latestVersion.responseType || 'text')}
                </TypeBadge>
              </TableCell>
              <TableCell>
                <TagsContainer>
                  {tags.map((tag, index) => (
                    <Tag key={index}>{getTagName(tag)}</Tag>
                  ))}
                  {tags.length > 3 && (
                    <Tag>+{(latestVersion.labels || []).length + (latestVersion.categoryTags || []).length - 3}</Tag>
                  )}
                </TagsContainer>
              </TableCell>
              <TableCell>
                <StatusBadge active={isActive}>
                  {isActive ? 'Active' : 'Inactive'}
                </StatusBadge>
              </TableCell>
              <TableCell>{updatedDate}</TableCell>
              <TableCell data-no-navigate="true">
                <ActionContainer className="dropdown-container" data-no-navigate="true">
                  <DropdownButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDropdownToggle(e, question._id);
                    }}
                    title="Actions"
                    data-no-navigate="true"
                  >
                    <FaEllipsisV />
                  </DropdownButton>
                  
                  {openDropdown === question._id && (
                    <DropdownMenu position={dropdownPosition} data-no-navigate="true" onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                    }}>
                      {/* <DropdownItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onPreview(question);
                          setOpenDropdown(null);
                        }}
                        data-no-navigate="true"
                      >
                        Preview
                      </DropdownItem> */}
                      
                      <DropdownItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onAnalytics(question);
                          setOpenDropdown(null);
                        }}
                        data-no-navigate="true"
                      >
                        Analytics
                      </DropdownItem>
                      
                      <DropdownItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onEdit(question._id);
                          setOpenDropdown(null);
                        }}
                        data-no-navigate="true"
                      >
                        Edit
                      </DropdownItem>
                      
                      <DropdownItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          onDelete(question._id);
                          setOpenDropdown(null);
                        }}
                        style={{ color: '#dc3545' }}
                        data-no-navigate="true"
                      >
                        Delete
                      </DropdownItem>
                    </DropdownMenu>
                  )}
                </ActionContainer>
              </TableCell>
            </TableRow>
          );
        })}
        
        {sortedQuestions.length === 0 && (
          <TableRow>
            <TableCell colSpan={6} style={{ textAlign: 'center', padding: '32px 0', color: '#666' }}>
              No questions found matching your criteria.
            </TableCell>
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
};

export default QuestionTableView;
