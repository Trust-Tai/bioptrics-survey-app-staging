import React, { useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import { FaEdit, FaTrash, FaEye, FaCopy, FaExternalLinkAlt, FaChartBar, FaEllipsisV, FaUndo, FaSort, FaSortUp, FaSortDown } from 'react-icons/fa';
import { Layers } from '/imports/api/layers';

// Styled components
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: visible; /* Changed from hidden to visible to prevent dropdown clipping */
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

// Define pulse animation for newly created surveys
const pulse = keyframes`
  0% { background-color: rgba(108, 71, 182, 0.08); }
  50% { background-color: rgba(108, 71, 182, 0.15); }
  100% { background-color: rgba(108, 71, 182, 0.08); }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e9ecef;
  &:hover {
    background-color: #f8f9fa;
  }
`;

const NewSurveyRow = styled(TableRow)`
  background-color: rgba(108, 71, 182, 0.08);
  animation: ${pulse} 2s infinite;
  
  &:hover {
    background-color: rgba(108, 71, 182, 0.12);
  }
`;


const TableCell = styled.td`
  padding: 12px 16px;
  font-size: 14px;
  color: #212529;
  vertical-align: middle;
`;

const StatusBadge = styled.span<{ status: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  background-color: ${props => {
    switch (props.status.toLowerCase()) {
      case 'active': return '#e6f7ed';
      case 'scheduled': return '#fff4e5';
      case 'inactive': return '#ffebee';
      case 'draft': return '#f0f0f0';
      default: return '#f0f0f0';
    }
  }};
  color: ${props => {
    switch (props.status.toLowerCase()) {
      case 'active': return '#0a8043';
      case 'scheduled': return '#ff9800';
      case 'inactive': return '#d32f2f';
      case 'draft': return '#666666';
      default: return '#666666';
    }
  }};
  
  &::before {
    content: '';
    display: inline-block;
    width: 8px;
    height: 8px;
    border-radius: 50%;
    margin-right: 6px;
    background-color: ${props => {
      switch (props.status.toLowerCase()) {
        case 'active': return '#0a8043';
        case 'scheduled': return '#ff9800';
        case 'inactive': return '#d32f2f';
        case 'draft': return '#666666';
        default: return '#666666';
      }
    }};
  }
`;

const TagBadge = styled.span<{ color?: string }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background-color: ${props => props.color || '#e3f2fd'};
  color: ${props => props.color ? '#ffffff' : '#1976d2'};
  margin-right: 4px;
  margin-bottom: 2px;
  border: 1px solid ${props => props.color ? 'transparent' : 'rgba(25, 118, 210, 0.2)'};
  
  &:last-child {
    margin-right: 0;
  }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px;
  max-width: 200px;
`;

const MoreTagsIndicator = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
  background-color: #f5f5f5;
  color: #666666;
  border: 1px solid #e0e0e0;
`;

const DropdownButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  border: none;
  background-color: transparent;
  color: #6c757d;
  cursor: pointer;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.05);
  }
  
  &:focus {
    outline: none;
  }
`;

const DropdownMenu = styled.div<{ position: 'top' | 'bottom' }>`
  position: absolute;
  ${props => props.position === 'top' ? 'bottom: 100%;' : 'top: 100%;'}
  right: 0;
  width: 180px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1000;
  overflow: hidden;
  margin-top: ${props => props.position === 'top' ? '0' : '8px'};
  margin-bottom: ${props => props.position === 'top' ? '8px' : '0'};
`;

const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

interface SurveyListViewProps {
  surveys: any[];
  loading?: boolean;
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onPermanentDelete: (id: string, title: string) => void;
  onPreview: (id: string, isPublic?: boolean) => void;
  onViewResponses: (id: string, title: string) => void;
  onCopyLink?: (id: string) => void;
}

// Define type for sort field
type SortField = 'title' | 'status' | 'structure' | 'createdBy' | 'updatedAt' | 'tags' | 'responses' | null;

// Define type for sort direction
type SortDirection = 'asc' | 'desc';

const SurveyListView: React.FC<SurveyListViewProps> = ({ 
  surveys, 
  loading = false,
  onEdit, 
  onDelete, 
  onPermanentDelete,
  onPreview,
  onViewResponses,
  onCopyLink
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  
  // Create a ref for each dropdown menu
  const dropdownRefs = useRef<{[key: string]: HTMLDivElement | null}>({});
  
  // Add state for sorting
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Fetch all layers (tags) for display
  const { layers } = useTracker(() => {
    const subscription = Meteor.subscribe('layers.all');
    return {
      layers: Layers.find({}).fetch(),
      loading: !subscription.ready()
    };
  }, []);
  
  console.log("Surveys", surveys)

  // Component to render survey tags
  const renderSurveyTags = (selectedTags: string[] = []) => {
    if (!selectedTags || selectedTags.length === 0) {
      return <span style={{ color: '#999', fontSize: '12px' }}>No tags</span>;
    }

    // Get tag details from layers
    const tagDetails = selectedTags
      .map(tagId => layers.find(layer => layer._id === tagId))
      .filter(Boolean);

    // Show only first 2 tags, then "+" indicator if more
    const displayTags = tagDetails.slice(0, 2);
    const remainingCount = tagDetails.length - 2;

    return (
      <TagsContainer>
        {displayTags.map((tag, index) => {
          if (!tag) return null;
          return (
            <TagBadge key={tag._id || index} color={tag.color}>
              {tag.name}
            </TagBadge>
          );
        })}
        {remainingCount > 0 && (
          <MoreTagsIndicator>
            +{remainingCount}
          </MoreTagsIndicator>
        )}
      </TagsContainer>
    );
  };

  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if clicking outside all dropdowns
      const clickedOutsideAll = !Object.values(dropdownRefs.current).some(
        ref => ref && ref.contains(event.target as Node)
      );
      
      if (clickedOutsideAll) {
        setOpenDropdown(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Function to determine dropdown position based on available space
  const handleDropdownToggle = (e: React.MouseEvent, surveyId: string) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Toggle dropdown for survey:', surveyId);
    
    // If already open, just close it
    if (openDropdown === surveyId) {
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
    setOpenDropdown(surveyId);
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
  
  // Sort the surveys based on current sort field and direction
  const sortedSurveys = [...surveys].sort((a, b) => {
    if (!sortField) return 0;
    
    let comparison = 0;
    
    switch (sortField) {
      case 'title':
        comparison = a.title.localeCompare(b.title);
        break;
      case 'status':
        const statusA = a.status ? a.status.toUpperCase() : (a.published ? 'ACTIVE' : 'DRAFT');
        const statusB = b.status ? b.status.toUpperCase() : (b.published ? 'ACTIVE' : 'DRAFT');
        comparison = statusA.localeCompare(statusB);
        break;
      case 'structure':
        // Sort by section count, then by question count
        const sectionsA = a.surveySections?.length || 0;
        const sectionsB = b.surveySections?.length || 0;
        comparison = sectionsA - sectionsB;
        if (comparison === 0) {
          const questionsA = a.sectionQuestions?.length || 0;
          const questionsB = b.sectionQuestions?.length || 0;
          comparison = questionsA - questionsB;
        }
        break;
      case 'createdBy':
        comparison = (a.createdByName || 'System').localeCompare(b.createdByName || 'System');
        break;
      case 'updatedAt':
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        comparison = dateA - dateB;
        break;
      case 'tags':
        const tagsA = a.selectedTags?.length || 0;
        const tagsB = b.selectedTags?.length || 0;
        comparison = tagsA - tagsB;
        break;
      case 'responses':
        const responsesA = a.responseStats?.total || 0;
        const responsesB = b.responseStats?.total || 0;
        comparison = responsesA - responsesB;
        break;
      default:
        return 0;
    }
    
    // Reverse the comparison if sorting in descending order
    return sortDirection === 'asc' ? comparison : -comparison;
  });

  // Helper function to safely execute action handlers
  const safelyExecuteAction = (callback: Function, actionName: string, ...args: any[]) => {
    console.log(`[${actionName}] Button clicked - Before setTimeout`);
    console.log('Action arguments:', ...args);
    
    // Use setTimeout to ensure the event is fully processed before executing the action
    window.setTimeout(() => {
      console.log(`[${actionName}] Inside setTimeout - About to execute action`);
      try {
        // Directly call the function with arguments
        callback(...args);
        console.log(`[${actionName}] Action executed successfully`);
      } catch (error) {
        console.error(`[${actionName}] Error executing action:`, error);
      }
    }, 0);
    console.log(`[${actionName}] After setTimeout - Event handling complete`);
  };
  
  return (
    <Table>
      <TableHeader>
        <tr>
          <TableHeaderCell 
            sortable 
            onClick={() => handleSort('title')}
          >
            SURVEY {renderSortIcon('title')}
            
          </TableHeaderCell>
          <TableHeaderCell 
            sortable 
            onClick={() => handleSort('status')}
          >
            STATUS {renderSortIcon('status')}
          </TableHeaderCell>
          <TableHeaderCell 
            sortable 
            onClick={() => handleSort('structure')}
          >
            STRUCTURE {renderSortIcon('structure')}
          </TableHeaderCell>
          <TableHeaderCell 
            sortable 
            onClick={() => handleSort('tags')}
          >
            TAGS {renderSortIcon('tags')}
          </TableHeaderCell>
          <TableHeaderCell 
            sortable 
            onClick={() => handleSort('responses')}
          >
            RESPONSES {renderSortIcon('responses')}
          </TableHeaderCell>
          {/* <TableHeaderCell 
            sortable 
            onClick={() => handleSort('createdBy')}
          >
            AUDIENCE {renderSortIcon('createdBy')}
          </TableHeaderCell> */}
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
        {loading ? (
          <tr>
            <td colSpan={8} style={{ textAlign: 'center', padding: '30px 0' }}>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', gap: '10px' }}>
                <div style={{ width: '20px', height: '20px', border: '4px solid var(--color-accent)', borderTopColor: 'var(--color-primary)', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              </div>
              <style>{`
                @keyframes spin {
                  0% { transform: rotate(0deg); }
                  100% { transform: rotate(360deg); }
                }
              `}</style>
            </td>
          </tr>
        ) : sortedSurveys && sortedSurveys.length === 0 ? (
          <tr>
            <td colSpan={8} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-text)' }}>
              No surveys found matching your filters.
            </td>
          </tr>
        ) : sortedSurveys && 
          sortedSurveys.map(survey => {
            // Calculate status
            let status = survey.status ? survey.status.toUpperCase() : (survey.published ? 'ACTIVE' : 'DRAFT');
            if (survey.scheduledFor && new Date(survey.scheduledFor) > new Date()) {
              status = 'SCHEDULED';
            }
            
            // Format date
            const updatedDate = new Date(survey.updatedAt).toLocaleDateString();
            
            // Check if survey was created in the last 45 seconds
            const isNewSurvey = survey.createdAt && 
              (new Date().getTime() - new Date(survey.createdAt).getTime()) < 45000;
            
            // Use either NewSurveyRow or TableRow based on whether the survey is new
            const RowComponent = isNewSurvey ? NewSurveyRow : TableRow;
            
            return (
              <RowComponent 
                key={survey._id}
                onClick={(e) => {
                  // Only navigate if the click is directly on the row and not on a child element with its own click handler
                  if (e.target === e.currentTarget || 
                      (e.target as HTMLElement).tagName === 'TD' || 
                      (e.target as HTMLElement).closest('[data-no-navigate]') === null) {
                    console.log('Row clicked - triggering Edit action');
                    safelyExecuteAction(onEdit, 'Row Click → Edit', survey._id);
                  }
                }}
                style={{ 
                  cursor: 'pointer',
                  textDecoration: 'none'
                }}>
              <TableCell>
                <div>{survey.title}</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>{survey.createdByName || 'System'}</div>
                
                {/* <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                  {survey.description ? survey.description.substring(0, 100) + (survey.description.length > 100 ? '...' : '') : ''}
                </div> */}
              </TableCell>
              <TableCell>
                <StatusBadge status={status}>{status}</StatusBadge>
              </TableCell>

              <TableCell>
                <div>
                  {survey.surveySections?.length || 0} {(survey.surveySections?.length || 0) === 1 ? 'Section' : 'Sections'}
                </div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  {survey.sectionQuestions?.length || 0} {(survey.sectionQuestions?.length || 0) === 1 ? 'Question' : 'Questions'}
                </div>
              </TableCell>
              <TableCell>
                {renderSurveyTags(survey.selectedTags)}
              </TableCell>
              <TableCell>
                <div style={{ fontSize: '14px', fontWeight: '500' }}>
                  {survey.responseStats?.completed || 0}/{survey.responseStats?.total || 0}
                </div>
                {survey.responseStats?.completion !== undefined && (
                  <div style={{ fontSize: '12px', color: '#6c757d' }}>
                    {Math.round(survey.responseStats.completion)}% complete
                  </div>
                )}
              </TableCell>
              {/* <TableCell>{survey.createdByName || 'System'}</TableCell> */}
              <TableCell>
                {updatedDate}
                {isNewSurvey && (
                  <span style={{ 
                    marginLeft: '8px', 
                    fontSize: '11px', 
                    fontWeight: 'bold',
                    color: 'var(--color-primary)',
                    backgroundColor: 'rgba(108, 71, 182, 0.1)',
                    padding: '2px 6px',
                    borderRadius: '10px'
                  }}>
                    NEW
                  </span>
                )}
              </TableCell>
              <TableCell data-no-navigate="true">
                <ActionContainer 
                  ref={(el) => { dropdownRefs.current[survey._id] = el; }} 
                  data-no-navigate="true"
                >
                  <DropdownButton 
                    onClick={(e) => {
                      e.stopPropagation();
                      e.preventDefault();
                      handleDropdownToggle(e, survey._id);
                    }}
                    title="Actions"
                    data-no-navigate="true"
                  >
                    <FaEllipsisV />
                  </DropdownButton>
                  
                  {openDropdown === survey._id && (
                    <DropdownMenu position={dropdownPosition} data-no-navigate="true">
                      <button
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px 16px',
                          textAlign: 'left',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'background-color 0.2s',
                          color: 'var(--color-text)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          console.log('Edit button clicked for survey:', survey._id);
                          safelyExecuteAction(onEdit, 'Edit', survey._id);
                        }}
                        data-no-navigate="true"
                      >
                        <FaEdit style={{ marginRight: '8px' }} /> Edit
                      </button>
                      
                      <button
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px 16px',
                          textAlign: 'left',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'background-color 0.2s',
                          color: 'var(--color-text)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          console.log('Preview button clicked for survey:', survey._id);
                          safelyExecuteAction(onPreview, 'Preview', survey._id);
                        }}
                        data-no-navigate="true"
                      >
                        <FaEye style={{ marginRight: '8px' }} /> Preview
                      </button>
                      
                      <button
                        style={{
                          display: 'block',
                          width: '100%',
                          padding: '10px 16px',
                          textAlign: 'left',
                          border: 'none',
                          background: 'none',
                          cursor: 'pointer',
                          fontSize: '14px',
                          transition: 'background-color 0.2s',
                          color: 'var(--color-text)',
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = 'transparent';
                        }}
                        onClick={(e) => {
                          e.stopPropagation();
                          e.preventDefault();
                          console.log('Analytics button clicked for survey:', survey._id, survey.title);
                          safelyExecuteAction(onViewResponses, 'Analytics', survey._id, survey.title);
                        }}
                        data-no-navigate="true"
                      >
                        <FaChartBar style={{ marginRight: '8px' }} /> Analytics
                      </button>
                      
                      {survey.published && (
                        <>
                          <button
                            style={{
                              display: 'block',
                              width: '100%',
                              padding: '10px 16px',
                              textAlign: 'left',
                              border: 'none',
                              background: 'none',
                              cursor: 'pointer',
                              fontSize: '14px',
                              transition: 'background-color 0.2s',
                              color: 'var(--color-text)',
                            }}
                            onMouseEnter={(e) => {
                              e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                            }}
                            onMouseLeave={(e) => {
                              e.currentTarget.style.backgroundColor = 'transparent';
                            }}
                            onClick={(e) => {
                              e.stopPropagation();
                              e.preventDefault();
                              console.log('Preview public survey:', survey._id);
                              safelyExecuteAction(onPreview, 'View Public', survey._id, true);
                            }}
                            data-no-navigate="true"
                          >
                            <FaExternalLinkAlt style={{ marginRight: '8px' }} /> View Public
                          </button>
                          
                          {onCopyLink && (
                            <button
                              style={{
                                display: 'block',
                                width: '100%',
                                padding: '10px 16px',
                                textAlign: 'left',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                transition: 'background-color 0.2s',
                                color: 'var(--color-text)',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                console.log('Copy public link for survey:', survey._id);
                                safelyExecuteAction(onCopyLink, 'Copy Public Link', survey._id);
                              }}
                              data-no-navigate="true"
                            >
                              <FaCopy style={{ marginRight: '8px' }} /> Copy Public Link
                            </button>
                          )}
                        </>
                      )}
                      
                      {survey.deleted && (
                        <button
                          style={{
                            display: 'block',
                            width: '100%',
                            padding: '10px 16px',
                            textAlign: 'left',
                            border: 'none',
                            background: 'none',
                            cursor: 'pointer',
                            fontSize: '14px',
                            transition: 'background-color 0.2s',
                            color: '#28a745',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = 'rgba(0, 0, 0, 0.05)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = 'transparent';
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            e.preventDefault();
                            console.log('Restore survey:', survey._id);
                            Meteor.call('surveys.restore', survey._id, (err: Meteor.Error | null) => {
                              if (err) {
                                console.error('Error restoring survey:', err);
                              }
                            });
                          }}
                          data-no-navigate="true"
                        >
                          <FaUndo style={{ marginRight: '8px' }} /> Restore
                        </button>
                      )}
                      
                      {!survey.deleted && (
                        <>
                          {survey.status !== 'inactive' && (
                            <button
                              style={{
                                display: 'block',
                                width: '100%',
                                padding: '10px 16px',
                                textAlign: 'left',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                transition: 'background-color 0.2s',
                                color: '#dc3545',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                safelyExecuteAction(onDelete, 'Delete', survey._id, survey.title);
                              }}
                              data-no-navigate="true"
                            >
                              <FaTrash style={{ marginRight: '8px' }} /> Delete
                            </button>
                          )}
                          {survey.status === 'inactive' && (
                            <button
                              style={{
                                display: 'block',
                                width: '100%',
                                padding: '10px 16px',
                                textAlign: 'left',
                                border: 'none',
                                background: 'none',
                                cursor: 'pointer',
                                fontSize: '14px',
                                transition: 'background-color 0.2s',
                                color: '#dc3545',
                                fontWeight: 'bold',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(220, 53, 69, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                console.log('Permanently delete button clicked for survey:', survey._id, survey.title);
                                safelyExecuteAction(onPermanentDelete, 'Delete Permanently', survey._id, survey.title);
                              }}
                              data-no-navigate="true"
                            >
                              <FaTrash style={{ marginRight: '8px' }} /> Delete Permanently
                            </button>
                          )}
                        </>
                      )}
                    </DropdownMenu>
                  )}
                </ActionContainer>
            </TableCell>
          </RowComponent>
            );
          })
        }
      </TableBody>
    </Table>
  );
};

export default SurveyListView;
