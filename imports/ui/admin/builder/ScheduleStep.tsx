import React, { useState } from 'react';
import styled from 'styled-components';
import { FiCalendar, FiInfo } from 'react-icons/fi';

interface ScheduleStepProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
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
  onStartDateChange,
  onEndDateChange
}) => {
  const [error, setError] = useState<string | null>(null);
  
  // Format date for input
  const formatDateForInput = (date: Date) => {
    return date.toISOString().split('T')[0];
  };
  
  // Handle start date change
  const handleStartDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newStartDate = new Date(e.target.value);
    
    // Validate date is not in the past
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (newStartDate < today) {
      setError('Start date cannot be in the past');
      return;
    }
    
    // Validate end date is after start date
    if (endDate < newStartDate) {
      onEndDateChange(new Date(newStartDate.getTime() + 14 * 24 * 60 * 60 * 1000)); // Set end date to 14 days after start
    }
    
    setError(null);
    onStartDateChange(newStartDate);
  };
  
  // Handle end date change
  const handleEndDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newEndDate = new Date(e.target.value);
    
    // Validate end date is after start date
    if (newEndDate <= startDate) {
      setError('End date must be after start date');
      return;
    }
    
    setError(null);
    onEndDateChange(newEndDate);
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
              onChange={handleStartDateChange}
              min={formatDateForInput(new Date())}
            />
          </FormGroup>
          
          <FormGroup>
            <Label htmlFor="end-date">End Date*</Label>
            <DateInput
              id="end-date"
              type="date"
              value={formatDateForInput(endDate)}
              onChange={handleEndDateChange}
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
