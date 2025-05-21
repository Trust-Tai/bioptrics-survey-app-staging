import React, { useState } from 'react';
import styled from 'styled-components';
import { FiCalendar, FiInfo } from 'react-icons/fi';

interface ScheduleStepProps {
  startDate: Date;
  endDate: Date;
  onScheduleChange: (data: Record<string, any>) => void;
}

const Container = styled.div`
  max-width: 700px;
  margin: 0 auto;
`;

const CalendarContainer = styled.div`
  background: #f8f9fa;
  border-radius: 8px;
  padding: 24px;
  margin-bottom: 24px;
`;

const DateFieldsContainer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
`;

const Label = styled.label`
  display: block;
  margin-bottom: 8px;
  font-weight: 500;
  color: #1c1c1c;
`;

const DateInput = styled.input`
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 14px;
  
  &:focus {
    outline: none;
    border-color: #b7a36a;
    box-shadow: 0 0 0 1px #b7a36a;
  }
`;

const InfoBox = styled.div`
  background: #f8f9fa;
  border-left: 4px solid #b7a36a;
  padding: 16px;
  margin-top: 24px;
  border-radius: 0 4px 4px 0;
`;

const InfoHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  margin-bottom: 8px;
  color: #1c1c1c;
`;

const InfoText = styled.p`
  margin: 0;
  font-size: 14px;
  color: #4a5568;
  line-height: 1.5;
`;

const ErrorMessage = styled.div`
  color: #e53e3e;
  font-size: 13px;
  margin-top: 4px;
`;

const ScheduleStep: React.FC<ScheduleStepProps> = ({
  startDate,
  endDate,
  onScheduleChange
}) => {
  const [error, setError] = useState<string | null>(null);
  
  // Format date for input
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (startDate >= endDate) {
      setError('End date must be after start date');
      return;
    }
    
    setError(null);
  };
  
  // Handle date validation
  const validateDates = () => {
    if (startDate >= endDate) {
      setError('End date must be after start date');
      return false;
    }
    setError(null);
    return true;
  };
  
  // Calculate survey duration in days
  const surveyDuration = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
  
  return (
    <Container>
      <CalendarContainer>
        <DateFieldsContainer>
          <FormGroup>
            <Label htmlFor="start-date">Start Date*</Label>
            <DateInput
              id="start-date"
              type="date"
              value={formatDateForInput(startDate)}
              onChange={(e) => {
                const date = new Date(e.target.value);
                onScheduleChange({ startDate: date });
              }}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="end-date">End Date*</Label>
            <DateInput
              id="end-date"
              type="date"
              value={formatDateForInput(endDate)}
              onChange={(e) => {
                const date = new Date(e.target.value);
                onScheduleChange({ endDate: date });
              }}
              min={formatDateForInput(new Date(startDate.getTime() + 24 * 60 * 60 * 1000))} // Min: 1 day after start
            />
          </FormGroup>
        </DateFieldsContainer>
        
        {error && <ErrorMessage>{error}</ErrorMessage>}
        
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <div style={{ fontSize: '14px', color: '#718096' }}>Survey Duration</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#1c1c1c' }}>{surveyDuration} days</div>
        </div>
      </CalendarContainer>
      
      <InfoBox>
        <InfoHeader>
          <FiInfo />
          Schedule Recommendations
        </InfoHeader>
        <InfoText>
          The ideal survey duration is 7-14 days. This provides enough time for participants to respond without
          creating survey fatigue. Shorter surveys tend to get higher response rates. Consider sending reminders
          halfway through the survey window to boost participation.
        </InfoText>
      </InfoBox>
    </Container>
  );
};

export default ScheduleStep;
