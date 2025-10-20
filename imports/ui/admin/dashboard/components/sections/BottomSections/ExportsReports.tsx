import React from 'react';
import styled from 'styled-components';
import { Button } from '../../shared/Button';
import { FaFilePdf, FaEnvelope } from 'react-icons/fa';

const SectionContainer = styled.div`
  background: white;
  border-radius: 12px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid rgba(0, 0, 0, 0.05);
  flex: 1;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 20px 0;
  display: flex;
  align-items: center;
  gap: 8px;
  
  &::before {
    content: '📊';
    font-size: 16px;
  }
`;

const ActionsList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const ActionItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 8px;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  transition: all 0.2s ease;
  
  &:hover {
    background: #f1f3f4;
    border-color: #dee2e6;
  }
`;

const ActionInfo = styled.div`
  flex: 1;
`;

const ActionTitle = styled.h4`
  font-size: 14px;
  font-weight: 600;
  color: #1a1a1a;
  margin: 0 0 4px 0;
`;

const ActionDescription = styled.p`
  font-size: 13px;
  color: #666;
  margin: 0;
  line-height: 1.4;
`;

const ActionButton = styled.div`
  margin-left: 16px;
`;

interface ExportsReportsProps {
  className?: string;
}

export const ExportsReports: React.FC<ExportsReportsProps> = ({ className }) => {
  const handleExportPDF = () => {
    console.log('Export PDF clicked');
    // Add PDF export logic here
  };

  const handleScheduleEmail = () => {
    console.log('Schedule Email Report clicked');
    // Add email scheduling logic here
  };

  return (
    <SectionContainer className={className}>
      <SectionTitle>Exports & Reports</SectionTitle>
      
      <ActionsList>
        <ActionItem>
          <ActionInfo>
            <ActionTitle>Export PDF</ActionTitle>
            <ActionDescription>Download current dashboard as PDF report</ActionDescription>
          </ActionInfo>
          <ActionButton>
            <Button 
              variant="primary" 
              size="small" 
              icon={<FaFilePdf />}
              onClick={handleExportPDF}
            >
              Export PDF
            </Button>
          </ActionButton>
        </ActionItem>

        <ActionItem>
          <ActionInfo>
            <ActionTitle>Schedule Email Report</ActionTitle>
            <ActionDescription>Set up automated email reports</ActionDescription>
          </ActionInfo>
          <ActionButton>
            <Button 
              variant="outline" 
              size="small" 
              icon={<FaEnvelope />}
              onClick={handleScheduleEmail}
            >
              Schedule Email Report
            </Button>
          </ActionButton>
        </ActionItem>
      </ActionsList>
    </SectionContainer>
  );
};
