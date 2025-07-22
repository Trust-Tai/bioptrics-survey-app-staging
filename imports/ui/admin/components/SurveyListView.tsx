import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaEye, FaCopy, FaExternalLinkAlt, FaChartBar, FaEllipsisV } from 'react-icons/fa';

// Styled components
const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
`;

const TableHeader = styled.thead`
  background-color: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
`;

const TableHeaderCell = styled.th`
  text-align: left;
  padding: 12px 16px;
  font-weight: 600;
  color: #495057;
  font-size: 14px;
`;

const TableBody = styled.tbody``;

const TableRow = styled.tr`
  border-bottom: 1px solid #e9ecef;
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
      case 'draft': return '#f0f0f0';
      default: return '#f0f0f0';
    }
  }};
  color: ${props => {
    switch (props.status.toLowerCase()) {
      case 'active': return '#0a8043';
      case 'scheduled': return '#ff9800';
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
        case 'draft': return '#666666';
        default: return '#666666';
      }
    }};
  }
`;

const ProgressBar = styled.div`
  width: 100%;
  height: 6px;
  background-color: #e9ecef;
  border-radius: 3px;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${props => props.percentage}%;
  background-color: ${props => {
    if (props.percentage >= 70) return '#0a8043';
    if (props.percentage >= 30) return '#ff9800';
    return '#dc3545';
  }};
`;

const CompletionText = styled.div`
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 4px;
  margin: 0 2px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f1f3f5;
    color: #212529;
  }
`;

const DropdownButton = styled.button`
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
  padding: 6px;
  margin: 0;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background-color: #f1f3f5;
    color: #212529;
  }
`;

const DropdownMenu = styled.div<{ position?: 'top' | 'bottom' }>`
  position: absolute;
  ${props => (props.position || 'bottom') === 'bottom' ? 'top: 100%;' : 'bottom: 100%;'}
  right: 0;
  background-color: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  min-width: 160px;
  z-index: 9999;
  overflow: visible;
  /* Ensure the dropdown is not clipped by any parent containers */
  transform: translateZ(0);
  margin-top: ${props => (props.position || 'bottom') === 'bottom' ? '4px' : '0'};
  margin-bottom: ${props => (props.position || 'bottom') === 'top' ? '4px' : '0'};
`;

// Set default props for DropdownMenu
DropdownMenu.defaultProps = {
  position: 'bottom'
};

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 8px 16px;
  background: none;
  border: none;
  cursor: pointer;
  font-size: 14px;
  color: #212529;
  
  svg {
    margin-right: 8px;
    font-size: 14px;
  }
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
`;

interface SurveyListViewProps {
  surveys: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onPreview: (id: string, isPublic?: boolean) => void;
  onViewResponses: (id: string, title: string) => void;
  onCopyLink?: (id: string) => void;
}

const SurveyListView: React.FC<SurveyListViewProps> = ({ 
  surveys, 
  onEdit, 
  onDelete, 
  onPreview,
  onViewResponses,
  onCopyLink
}) => {
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<'bottom' | 'top'>('bottom');
  const dropdownRef = useRef<HTMLDivElement>(null);
  
  // Handle click outside to close dropdown
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
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
    
    // If already open, just close it
    if (openDropdown === surveyId) {
      setOpenDropdown(null);
      return;
    }
    
    // Check position in viewport
    const buttonRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const spaceBelow = viewportHeight - buttonRect.bottom;
    
    // If less than 200px below (typical dropdown height), position above
    setDropdownPosition(spaceBelow < 200 ? 'top' : 'bottom');
    setOpenDropdown(surveyId);
  };
  return (
    <Table>
      <TableHeader>
        <tr>
          <TableHeaderCell>SURVEY</TableHeaderCell>
          <TableHeaderCell>STATUS</TableHeaderCell>
          <TableHeaderCell>STRUCTURE</TableHeaderCell>
          <TableHeaderCell>CREATED BY</TableHeaderCell>
          <TableHeaderCell>UPDATED</TableHeaderCell>
          <TableHeaderCell>ACTIONS</TableHeaderCell>
        </tr>
      </TableHeader>
      <TableBody>
        {surveys.map(survey => {
          // Calculate status
          let status = survey.published ? 'ACTIVE' : 'DRAFT';
          if (survey.scheduledFor && new Date(survey.scheduledFor) > new Date()) {
            status = 'SCHEDULED';
          }
          
          // Calculate completion percentage
          const completionPercentage = survey.responseStats?.completionRate || 0;
          
          // Format date
          const updatedDate = new Date(survey.updatedAt).toLocaleDateString();
          
          return (
            <TableRow key={survey._id} onClick={() => onEdit(survey._id)} style={{ 
                    cursor: 'pointer',
                    textDecoration: 'none'
                  }}>
              <TableCell>
                {survey.title}
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
              <TableCell>{survey.createdByName || 'System'}</TableCell>
              <TableCell>{updatedDate}</TableCell>
              <TableCell onClick={(e) => e.stopPropagation()}>
                <ActionContainer ref={dropdownRef}>
                  <DropdownButton 
                    onClick={(e) => handleDropdownToggle(e, survey._id)}
                    title="Actions"
                  >
                    <FaEllipsisV />
                  </DropdownButton>
                  
                  {openDropdown === survey._id && (
                    <DropdownMenu position={dropdownPosition}>
                      <DropdownItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEdit(survey._id);
                          setOpenDropdown(null);
                        }}
                      >
                        <FaEdit /> Edit
                      </DropdownItem>
                      
                      <DropdownItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onPreview(survey._id);
                          setOpenDropdown(null);
                        }}
                      >
                        <FaEye /> Preview
                      </DropdownItem>
                      
                      {survey.published && (
                        <>
                          <DropdownItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              onPreview(survey._id, true);
                              setOpenDropdown(null);
                            }}
                          >
                            <FaExternalLinkAlt /> Open Public Link
                          </DropdownItem>
                          
                          <DropdownItem 
                            onClick={(e) => {
                              e.stopPropagation();
                              if (onCopyLink) {
                                onCopyLink(survey._id);
                                setOpenDropdown(null);
                              }
                            }}
                          >
                            <FaCopy /> Copy Shareable Link
                          </DropdownItem>
                        </>
                      )}
                      
                      <DropdownItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onViewResponses(survey._id, survey.title);
                          setOpenDropdown(null);
                        }}
                      >
                        <FaChartBar /> Analytics
                      </DropdownItem>
                      
                      <DropdownItem 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDelete(survey._id, survey.title);
                          setOpenDropdown(null);
                        }}
                        style={{ color: '#dc3545' }}
                      >
                        <FaTrash /> Delete
                      </DropdownItem>
                    </DropdownMenu>
                  )}
                </ActionContainer>
              </TableCell>
            </TableRow>
          );
        })}
      </TableBody>
    </Table>
  );
};

export default SurveyListView;
