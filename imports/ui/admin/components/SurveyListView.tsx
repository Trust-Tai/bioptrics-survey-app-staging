import React, { useState, useRef, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { Meteor } from 'meteor/meteor';
import { FaEdit, FaTrash, FaEye, FaCopy, FaExternalLinkAlt, FaChartBar, FaEllipsisV, FaUndo, FaSort, FaSortUp, FaSortDown, FaShare, FaToggleOn, FaToggleOff } from 'react-icons/fa';

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

// Styled components for tags display
const TagsContainer = styled.div`
  display: inline-flex;
  flex-wrap: wrap;
  gap: 4px;
  position: relative;
`;

const Tag = styled.span`
  background-color:#552a4726;
  color: #552a47;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  white-space: nowrap;
`;

const MoreTagsIndicator = styled.span`
  background-color: #552a4726;
  color: #552a47;
  border-radius: 12px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  cursor: pointer;
  white-space: nowrap;
  
  &:hover {
    background-color: #552a4769;
  }
`;

const TagsTooltip = styled.div`
  position: absolute;
  top: 100%;
  left: 0;
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  padding: 8px;
  z-index: 1000;
  min-width: 150px;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 4px;
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
  onShare?: (id: string, title: string) => void;
  onStatusChange?: (id: string, title: string, status: 'active' | 'inactive' | 'draft') => void;
}

// Define type for sort field
type SortField = 'title' | 'status' | 'tags' | 'createdBy' | 'updatedAt' | null;

// Define type for sort direction
type SortDirection = 'asc' | 'desc';

// SurveyTags component to display tags with "more" indicator
interface SurveyTagsProps {
  tagIds?: string[];
}

const SurveyTags: React.FC<SurveyTagsProps> = ({ tagIds }) => {
  const [showAllTags, setShowAllTags] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const [tags, setTags] = useState<Array<{ _id: string; name: string }>>([]);
  
  // Fetch tag names from layers collection using tag IDs
  useEffect(() => {
    if (tagIds && tagIds.length > 0) {
      // Call existing Meteor method to get tag names from layers collection
      Meteor.call('layers.getByIds', tagIds, (error: Meteor.Error | null, result: Array<{ _id: string; name: string }>) => {
        if (error) {
          console.error('Error fetching tag names:', error);
        } else {
          setTags(result || []);
        }
      });
    }
  }, [tagIds]);
  
  // Close tooltip when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowAllTags(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  
  if (!tags || tags.length === 0) {
    return <span style={{ color: '#6c757d', fontSize: '12px' }}>No tags</span>;
  }
  
  const visibleTags = tags.slice(0, 2);
  const hiddenTagsCount = tags.length - visibleTags.length;
  
  return (
    <TagsContainer ref={containerRef} data-no-navigate="true">
      {visibleTags.map((tag, index) => (
        <Tag key={tag._id || index}>{tag.name}</Tag>
      ))}
      
      {hiddenTagsCount > 0 && (
        <MoreTagsIndicator 
          onClick={(e) => {
            e.stopPropagation();
            setShowAllTags(!showAllTags);
          }}
        >
          +{hiddenTagsCount} more
        </MoreTagsIndicator>
      )}
      
      {showAllTags && (
        <TagsTooltip onClick={(e) => e.stopPropagation()}>
          {tags.map((tag, index) => (
            <Tag key={tag._id || index} style={{ margin: '2px 0' }}>{tag.name}</Tag>
          ))}
        </TagsTooltip>
      )}
    </TagsContainer>
  );
};

const SurveyListView: React.FC<SurveyListViewProps> = ({ 
  surveys, 
  loading = false,
  onEdit, 
  onDelete, 
  onPermanentDelete,
  onPreview,
  onViewResponses,
  onCopyLink,
  onShare,
  onStatusChange
}) => {
  const [openDropdownId, setOpenDropdownId] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'top' | 'bottom'>('bottom');
  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const [responseCounts, setResponseCounts] = useState<Record<string, number>>({});
  const [sortField, setSortField] = useState<SortField>(null);
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  
  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Only close if clicking outside all dropdowns
      const clickedOutsideAll = !Object.values(dropdownRefs.current).some(
        ref => ref && ref.contains(event.target as Node)
      );
      
      if (clickedOutsideAll && openDropdownId) {
        setOpenDropdownId(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);

  // Fetch response counts for all surveys
  React.useEffect(() => {
    const fetchResponseCounts = async () => {
      if (!surveys || surveys.length === 0) return;
      
      const counts: Record<string, number> = {};
      
      // Fetch counts for each survey
      for (const survey of surveys) {
        try {
          const count = await Meteor.callAsync('getTotalResponsesCount', survey._id);
          counts[survey._id] = count;
        } catch (error) {
          console.error(`Error fetching response count for survey ${survey._id}:`, error);
          counts[survey._id] = 0;
        }
      }
      
      setResponseCounts(counts);
    };
    
    fetchResponseCounts();
  }, [surveys]);
  
  // Function to determine dropdown position based on available space
  const handleDropdownToggle = (e: React.MouseEvent, surveyId: string) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('Toggle dropdown for survey:', surveyId);
    
    // If already open, just close it
    if (openDropdownId === surveyId) {
      setOpenDropdownId(null);
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
    setOpenDropdownId(surveyId);
  };
  
  // Function to get response limit display
  const getResponseLimit = (survey: any) => {
    try {
      // Check if survey and defaultSettings exist
      if (!survey || !survey.defaultSettings) {
        return { isUnlimited: true, value: '∞' }; // Infinity symbol for unlimited
      }
      
      // Check for the responseLimit directly
      const limit = survey.defaultSettings.responseLimit;
      
      // If we have a valid positive number
      if (limit !== undefined && limit !== null && limit !== -1 && limit > 0) {
        // We have a valid limit, show it regardless of limitResponses flag
        return { isUnlimited: false, value: limit };
      }
      
      // In all other cases, show unlimited
      return { isUnlimited: true, value: '∞' };
    } catch (error) {
      console.error('Error in getResponseLimit:', error);
      // Default to unlimited in case of any errors
      return { isUnlimited: true, value: '∞' };
    }
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
      case 'tags':
        // Sort by tag count first, checking both selectedTags and tags properties
        const tagsA = a.selectedTags?.length || a.tags?.length || 0;
        const tagsB = b.selectedTags?.length || b.tags?.length || 0;
        comparison = tagsB - tagsA; // More tags first
        break;
      case 'createdBy':
        comparison = (a.createdByName || 'System').localeCompare(b.createdByName || 'System');
        break;
      case 'updatedAt':
        const dateA = new Date(a.updatedAt).getTime();
        const dateB = new Date(b.updatedAt).getTime();
        comparison = dateA - dateB;
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
            onClick={() => handleSort('tags')}
          >
            TAGS {renderSortIcon('tags')}
          </TableHeaderCell>

          <TableHeaderCell>
            RESPONSES
          </TableHeaderCell>
          <TableHeaderCell 
            sortable 
            onClick={() => handleSort('status')}
          >
            STATUS {renderSortIcon('status')}
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
        {loading ? (
          <tr>
            <td colSpan={5} style={{ textAlign: 'center', padding: '30px 0' }}>
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
            <td colSpan={5} style={{ textAlign: 'center', padding: '30px 0', color: 'var(--color-text)' }}>
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
                {survey.title}
                {/* <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                  {survey.description ? survey.description.substring(0, 100) + (survey.description.length > 100 ? '...' : '') : ''}
                </div> */}
                <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                  by {survey.createdByName || 'System'}
                </div>
              </TableCell>

              <TableCell data-no-navigate="true">
                {/* Check both selectedTags and tags properties */}
                <SurveyTags tagIds={survey.selectedTags || survey.tags || []} />
              </TableCell>
              
              <TableCell>
                <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <span>{responseCounts[survey._id] || 0}</span>
                  <span style={{ color: '#6c757d', margin: '0px 0px' }}>/</span>
                  {(() => {
                    const responseLimit = getResponseLimit(survey);
                    return responseLimit.isUnlimited ? (
                      <span style={{ 
                        fontSize: '28px', 
                        lineHeight: '18px',
                        fontWeight: '300',
                        display: 'inline-block',
                        width: '20px',
                        textAlign: 'center'
                      }}>∞</span>
                    ) : (
                      <span>{responseLimit.value}</span>
                    );
                  })()}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={status}>{status}</StatusBadge>
              </TableCell>
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
                  
                  {openDropdownId === survey._id && (
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
                      
                      {onShare && (
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
                            console.log('Share button clicked for survey:', survey._id, survey.title);
                            safelyExecuteAction(onShare, 'Share', survey._id, survey.title);
                          }}
                          data-no-navigate="true"
                        >
                          <FaShare style={{ marginRight: '8px' }} /> Share
                        </button>
                      )}
                      
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
                          {/* Set Inactive option - only show for active surveys */}
                          {survey.status === 'active' && onStatusChange && (
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
                                color: '#d32f2f',
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
                                safelyExecuteAction(onStatusChange, 'Set Inactive', survey._id, survey.title, 'inactive');
                              }}
                              data-no-navigate="true"
                            >
                              <FaToggleOff style={{ marginRight: '8px' }} /> Set Inactive
                            </button>
                          )}
                          
                          {/* Set Active option - only show for inactive surveys */}
                          {survey.status === 'inactive' && onStatusChange && (
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
                                color: '#0a8043',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = 'rgba(10, 128, 67, 0.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = 'transparent';
                              }}
                              onClick={(e) => {
                                e.stopPropagation();
                                e.preventDefault();
                                safelyExecuteAction(onStatusChange, 'Set Active', survey._id, survey.title, 'active');
                              }}
                              data-no-navigate="true"
                            >
                              <FaToggleOn style={{ marginRight: '8px' }} /> Set Active
                            </button>
                          )}
                          
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
