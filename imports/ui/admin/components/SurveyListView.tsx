import React from 'react';
import styled from 'styled-components';
import { FaEdit, FaTrash, FaEye, FaCopy, FaExternalLinkAlt } from 'react-icons/fa';

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

const ActionContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: flex-start;
`;

interface SurveyListViewProps {
  surveys: any[];
  onEdit: (id: string) => void;
  onDelete: (id: string, title: string) => void;
  onPreview: (id: string, isPublic?: boolean) => void;
}

const SurveyListView: React.FC<SurveyListViewProps> = ({ 
  surveys, 
  onEdit, 
  onDelete, 
  onPreview
}) => {
  return (
    <Table>
      <TableHeader>
        <tr>
          <TableHeaderCell>SURVEY</TableHeaderCell>
          <TableHeaderCell>STATUS</TableHeaderCell>
          <TableHeaderCell>STRUCTURE</TableHeaderCell>
          <TableHeaderCell>UPDATED</TableHeaderCell>
          <TableHeaderCell>CREATOR</TableHeaderCell>
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
            <TableRow key={survey._id}>
              <TableCell>
                <div style={{ fontWeight: 600 }}>{survey.title}</div>
                <div style={{ fontSize: '12px', color: '#6c757d', marginTop: '4px' }}>
                  {survey.description ? survey.description.substring(0, 100) + (survey.description.length > 100 ? '...' : '') : ''}
                </div>
              </TableCell>
              <TableCell>
                <StatusBadge status={status}>{status}</StatusBadge>
              </TableCell>

              <TableCell>
                <div>{survey.sections?.length || 0} sections</div>
                <div style={{ fontSize: '12px', color: '#6c757d' }}>
                  {(() => {
                    // Calculate total questions dynamically from sections
                    let totalQuestions = 0;
                    if (survey.sections && Array.isArray(survey.sections)) {
                      survey.sections.forEach((section: { questions?: any[] }) => {
                        if (section.questions && Array.isArray(section.questions)) {
                          totalQuestions += section.questions.length;
                        }
                      });
                    }
                    return totalQuestions;
                  })()} questions
                </div>
              </TableCell>
              <TableCell>{updatedDate}</TableCell>
              <TableCell>{survey.createdByName || 'System'}</TableCell>
              <TableCell>
                <ActionContainer>
                  <ActionButton onClick={() => onEdit(survey._id)} title="Edit">
                    <FaEdit />
                  </ActionButton>
                  <ActionButton onClick={() => onPreview(survey._id)} title="Preview">
                    <FaEye />
                  </ActionButton>
                  {survey.published && (
                    <ActionButton onClick={() => onPreview(survey._id, true)} title="Open Public Link">
                      <FaExternalLinkAlt />
                    </ActionButton>
                  )}
                  <ActionButton onClick={() => onDelete(survey._id, survey.title)} title="Delete">
                    <FaTrash />
                  </ActionButton>
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
