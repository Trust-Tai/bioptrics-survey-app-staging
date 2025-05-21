import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { 
  FiEye, 
  FiLink, 
  FiEdit, 
  FiStopCircle, 
  FiCopy, 
  FiTrash2, 
  FiMoreHorizontal,
  FiAlertTriangle
} from 'react-icons/fi';

import { Survey } from '../types/surveyTypes';

interface SurveyTableProps {
  surveys: Survey[];
  isLoading: boolean;
  onCopyLink: (publicSlug: string) => void;
}

// Styled Components
const TableContainer = styled.div`
  width: 100%;
  overflow-x: auto;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  
  @media (max-width: 768px) {
    border-radius: 0;
    box-shadow: none;
  }
`;

const StyledTable = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  @media (max-width: 768px) {
    display: none;
  }
`;

const TableHead = styled.thead`
  background-color: #f8f9fa;
  position: sticky;
  top: 0;
  z-index: 10;
`;

const TableHeaderCell = styled.th<{ sortable?: boolean }>`
  padding: 16px;
  text-align: left;
  font-weight: 600;
  color: #4a5568;
  font-size: 14px;
  cursor: ${props => props.sortable ? 'pointer' : 'default'};
  
  &:hover {
    color: ${props => props.sortable ? '#b7a36a' : '#4a5568'};
  }
`;

const TableRow = styled.tr`
  border-bottom: 1px solid #e2e8f0;
  transition: background-color 0.2s;
  
  &:hover {
    background-color: #f8f9fa;
  }
`;

const TableCell = styled.td`
  padding: 16px;
  font-size: 14px;
  color: #1c1c1c;
  min-height: 56px;
`;

const StatusBadge = styled.span<{ status: 'Draft' | 'Active' | 'Closed' }>`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 16px;
  font-size: 12px;
  font-weight: 600;
  
  ${props => {
    switch (props.status) {
      case 'Draft':
        return `
          background-color: #e2e8f0;
          color: #4a5568;
        `;
      case 'Active':
        return `
          background-color: #c6f6d5;
          color: #2f855a;
        `;
      case 'Closed':
        return `
          background-color: #fed7d7;
          color: #c53030;
        `;
      default:
        return '';
    }
  }}
`;

const CompletionRate = styled.div`
  display: flex;
  flex-direction: column;
`;

const RateValue = styled.div`
  font-weight: 600;
`;

const ProgressBar = styled.div`
  height: 6px;
  background-color: #e2e8f0;
  border-radius: 3px;
  margin-top: 4px;
  overflow: hidden;
  width: 100%;
  max-width: 120px;
`;

const ProgressFill = styled.div<{ percentage: number }>`
  height: 100%;
  width: ${props => `${props.percentage}%`};
  background-color: #b7a36a;
  border-radius: 3px;
`;

const ActionsButton = styled.button`
  background: none;
  border: none;
  color: #4a5568;
  cursor: pointer;
  padding: 8px;
  border-radius: 4px;
  
  &:hover {
    background-color: #f1f5f9;
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  right: 0;
  top: 100%;
  width: 180px;
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 100;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

const DropdownItem = styled.button`
  display: flex;
  align-items: center;
  width: 100%;
  text-align: left;
  padding: 10px 16px;
  background: none;
  border: none;
  font-size: 14px;
  color: #1c1c1c;
  cursor: pointer;
  gap: 8px;
  
  &:hover {
    background-color: #f8f9fa;
  }
  
  &:first-child {
    border-top-left-radius: 4px;
    border-top-right-radius: 4px;
  }
  
  &:last-child {
    border-bottom-left-radius: 4px;
    border-bottom-right-radius: 4px;
  }
  
  svg {
    color: #718096;
  }
`;

const DangerItem = styled(DropdownItem)`
  color: #e53e3e;
  
  svg {
    color: #e53e3e;
  }
`;

const ActionsContainer = styled.div`
  position: relative;
`;

const CardView = styled.div`
  display: none;
  
  @media (max-width: 768px) {
    display: block;
  }
`;

const Card = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  padding: 16px;
  margin-bottom: 16px;
`;

const CardTitle = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #1c1c1c;
  margin-bottom: 8px;
  cursor: pointer;
  
  &:hover {
    color: #b7a36a;
  }
`;

const CardRow = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 8px;
  font-size: 14px;
`;

const CardLabel = styled.div`
  color: #718096;
`;

const CardValue = styled.div`
  color: #1c1c1c;
  font-weight: 500;
`;

const CardActions = styled.div`
  display: flex;
  gap: 8px;
  margin-top: 12px;
  flex-wrap: wrap;
`;

const CardActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  background-color: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 12px;
  color: #4a5568;
  cursor: pointer;
  
  &:hover {
    background-color: #edf2f7;
  }
  
  svg {
    font-size: 14px;
  }
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 64px 0;
  text-align: center;
  color: #718096;
`;

const EmptyStateTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #4a5568;
`;

const EmptyStateDescription = styled.p`
  font-size: 14px;
  margin-bottom: 24px;
  max-width: 400px;
`;

const EmptyStateIcon = styled.div`
  font-size: 48px;
  color: #e2e8f0;
  margin-bottom: 16px;
`;

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 200px;
`;

const SurveyTable: React.FC<SurveyTableProps> = ({ surveys, isLoading, onCopyLink }) => {
  const navigate = useNavigate();
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [sortField, setSortField] = useState<keyof Survey>('title');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  
  // Handle sort change
  const handleSort = (field: keyof Survey) => {
    if (sortField === field) {
      // Toggle direction if clicking the same field
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new field and default to ascending
      setSortField(field);
      setSortDirection('asc');
    }
  };
  
  // Sort surveys
  const sortedSurveys = [...surveys].sort((a, b) => {
    if (sortField === 'title') {
      return sortDirection === 'asc' 
        ? a.title.localeCompare(b.title)
        : b.title.localeCompare(a.title);
    }
    
    if (sortField === 'status') {
      return sortDirection === 'asc'
        ? a.status.localeCompare(b.status)
        : b.status.localeCompare(a.status);
    }
    
    if (sortField === 'endDate') {
      return sortDirection === 'asc'
        ? a.endDate.getTime() - b.endDate.getTime()
        : b.endDate.getTime() - a.endDate.getTime();
    }
    
    return 0;
  });
  
  // Toggle dropdown menu
  const toggleDropdown = (id: string) => {
    setActiveDropdown(activeDropdown === id ? null : id);
  };
  
  // Close dropdown when clicking outside
  const closeDropdown = () => {
    setActiveDropdown(null);
  };
  
  // Format date range
  const formatDateRange = (startDate: Date, endDate: Date) => {
    const options: Intl.DateTimeFormatOptions = { 
      month: 'short', 
      day: 'numeric'
    };
    return `${startDate.toLocaleDateString('en-US', options)} → ${endDate.toLocaleDateString('en-US', options)}`;
  };
  
  // Format completion rate
  const getCompletionRate = (survey: Survey) => {
    if (survey.invitedCount === 0) return 0;
    return Math.round((survey.responseCount / survey.invitedCount) * 100);
  };
  
  // Handle survey navigation
  const navigateToSurvey = (id: string) => {
    navigate(`/admin/surveys/${id}/overview`);
  };
  
  // Handle preview survey
  const handlePreviewSurvey = (publicSlug: string) => {
    window.open(`/survey/${publicSlug}`, '_blank');
  };
  
  // Handle edit survey
  const handleEditSurvey = (id: string) => {
    navigate(`/admin/surveys/${id}/edit`);
  };
  
  // Handle close survey
  const handleCloseSurvey = (id: string) => {
    // Here you would call a Meteor method to update the survey status
    Meteor.call('surveys.close', id, (error: any) => {
      if (error) {
        console.error('Error closing survey:', error);
      }
    });
  };
  
  // Handle duplicate survey
  const handleDuplicateSurvey = (id: string) => {
    Meteor.call('surveys.duplicate', id, (error: any, result: string) => {
      if (error) {
        console.error('Error duplicating survey:', error);
      } else if (result) {
        navigate(`/admin/surveys/${result}/edit`);
      }
    });
  };
  
  // Handle delete survey
  const handleDeleteSurvey = (id: string) => {
    if (window.confirm('Are you sure you want to delete this survey? This action cannot be undone.')) {
      Meteor.call('surveys.remove', id, (error: any) => {
        if (error) {
          console.error('Error deleting survey:', error);
        }
      });
    }
  };
  
  // Show empty state if no surveys
  if (!isLoading && surveys.length === 0) {
    return (
      <EmptyStateContainer>
        <EmptyStateIcon>
          <FiAlertTriangle />
        </EmptyStateIcon>
        <EmptyStateTitle>No surveys yet</EmptyStateTitle>
        <EmptyStateDescription>
          Create your first survey to start collecting feedback from your teams.
        </EmptyStateDescription>
      </EmptyStateContainer>
    );
  }
  
  // Show loading state
  if (isLoading) {
    return (
      <LoadingContainer>
        <div>Loading surveys...</div>
      </LoadingContainer>
    );
  }
  
  return (
    <>
      {/* Desktop Table View */}
      <TableContainer>
        <StyledTable>
          <TableHead>
            <tr>
              <TableHeaderCell 
                sortable 
                onClick={() => handleSort('title')}
              >
                Name
              </TableHeaderCell>
              <TableHeaderCell 
                sortable 
                onClick={() => handleSort('status')}
              >
                Status
              </TableHeaderCell>
              <TableHeaderCell 
                sortable 
                onClick={() => handleSort('endDate')}
              >
                Window
              </TableHeaderCell>
              <TableHeaderCell>
                Participants
              </TableHeaderCell>
              <TableHeaderCell>
                Responses
              </TableHeaderCell>
              <TableHeaderCell>
                Actions
              </TableHeaderCell>
            </tr>
          </TableHead>
          <tbody>
            {sortedSurveys.map(survey => (
              <TableRow key={survey._id}>
                <TableCell 
                  onClick={() => navigateToSurvey(survey._id)}
                  style={{ cursor: 'pointer', fontWeight: 500 }}
                >
                  {survey.title}
                </TableCell>
                <TableCell>
                  <StatusBadge status={survey.status}>
                    {survey.status}
                  </StatusBadge>
                </TableCell>
                <TableCell>
                  {formatDateRange(survey.startDate, survey.endDate)}
                </TableCell>
                <TableCell>
                  {survey.invitedCount}
                </TableCell>
                <TableCell>
                  <CompletionRate>
                    <RateValue>
                      {survey.responseCount} ({getCompletionRate(survey)}%)
                    </RateValue>
                    <ProgressBar>
                      <ProgressFill percentage={getCompletionRate(survey)} />
                    </ProgressBar>
                  </CompletionRate>
                </TableCell>
                <TableCell>
                  <ActionsContainer>
                    <ActionsButton onClick={() => toggleDropdown(survey._id)}>
                      <FiMoreHorizontal />
                    </ActionsButton>
                    <DropdownMenu isOpen={activeDropdown === survey._id}>
                      <DropdownItem onClick={() => handlePreviewSurvey(survey.publicSlug)}>
                        <FiEye />
                        Preview Survey
                      </DropdownItem>
                      <DropdownItem onClick={() => onCopyLink(survey.publicSlug)}>
                        <FiLink />
                        Copy Public Link
                      </DropdownItem>
                      {survey.status === 'Draft' && (
                        <DropdownItem onClick={() => handleEditSurvey(survey._id)}>
                          <FiEdit />
                          Edit Details
                        </DropdownItem>
                      )}
                      {survey.status === 'Active' && (
                        <DropdownItem onClick={() => handleCloseSurvey(survey._id)}>
                          <FiStopCircle />
                          Close Survey
                        </DropdownItem>
                      )}
                      <DropdownItem onClick={() => handleDuplicateSurvey(survey._id)}>
                        <FiCopy />
                        Duplicate
                      </DropdownItem>
                      {survey.status === 'Draft' && (
                        <DangerItem onClick={() => handleDeleteSurvey(survey._id)}>
                          <FiTrash2 />
                          Delete
                        </DangerItem>
                      )}
                    </DropdownMenu>
                  </ActionsContainer>
                </TableCell>
              </TableRow>
            ))}
          </tbody>
        </StyledTable>
        
        {/* Mobile Card View */}
        <CardView>
          {sortedSurveys.map(survey => (
            <Card key={survey._id}>
              <CardTitle onClick={() => navigateToSurvey(survey._id)}>
                {survey.title}
              </CardTitle>
              <CardRow>
                <CardLabel>Status</CardLabel>
                <CardValue>
                  <StatusBadge status={survey.status}>
                    {survey.status}
                  </StatusBadge>
                </CardValue>
              </CardRow>
              <CardRow>
                <CardLabel>Window</CardLabel>
                <CardValue>{formatDateRange(survey.startDate, survey.endDate)}</CardValue>
              </CardRow>
              <CardRow>
                <CardLabel>Participants</CardLabel>
                <CardValue>{survey.invitedCount}</CardValue>
              </CardRow>
              <CardRow>
                <CardLabel>Responses</CardLabel>
                <CardValue>
                  {survey.responseCount} ({getCompletionRate(survey)}%)
                  <ProgressBar style={{ marginTop: '8px' }}>
                    <ProgressFill percentage={getCompletionRate(survey)} />
                  </ProgressBar>
                </CardValue>
              </CardRow>
              <CardActions>
                <CardActionButton onClick={() => handlePreviewSurvey(survey.publicSlug)}>
                  <FiEye />
                  Preview
                </CardActionButton>
                <CardActionButton onClick={() => onCopyLink(survey.publicSlug)}>
                  <FiLink />
                  Copy Link
                </CardActionButton>
                {survey.status === 'Draft' && (
                  <CardActionButton onClick={() => handleEditSurvey(survey._id)}>
                    <FiEdit />
                    Edit
                  </CardActionButton>
                )}
                {survey.status === 'Active' && (
                  <CardActionButton onClick={() => handleCloseSurvey(survey._id)}>
                    <FiStopCircle />
                    Close
                  </CardActionButton>
                )}
                <CardActionButton onClick={() => handleDuplicateSurvey(survey._id)}>
                  <FiCopy />
                  Duplicate
                </CardActionButton>
                {survey.status === 'Draft' && (
                  <CardActionButton 
                    onClick={() => handleDeleteSurvey(survey._id)}
                    style={{ color: '#e53e3e' }}
                  >
                    <FiTrash2 />
                    Delete
                  </CardActionButton>
                )}
              </CardActions>
            </Card>
          ))}
        </CardView>
      </TableContainer>
    </>
  );
};

export default SurveyTable;
