import React, { useState } from 'react';
import styled from 'styled-components';
import { FiDownload, FiFileText, FiTable, FiBarChart2, FiSettings } from 'react-icons/fi';

// Styled components for the export UI
const Container = styled.div`
  margin-bottom: 24px;
`;

const Header = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin-bottom: 16px;
`;

const ExportGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
`;

const ExportCard = styled.div<{ selected?: boolean }>`
  background: ${props => props.selected ? '#f9f4f8' : '#fff'};
  border: 1px solid ${props => props.selected ? '#552a47' : '#e5d6c7'};
  border-radius: 10px;
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #552a47;
    box-shadow: 0 2px 8px rgba(85, 42, 71, 0.1);
  }
`;

const ExportCardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const ExportIcon = styled.div`
  width: 40px;
  height: 40px;
  border-radius: 20px;
  background: #f9f4f8;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #552a47;
`;

const ExportTitle = styled.h4`
  font-size: 16px;
  font-weight: 600;
  color: #28211e;
  margin: 0;
`;

const ExportDescription = styled.p`
  font-size: 14px;
  color: #666;
  margin: 0 0 12px 0;
`;

const OptionsContainer = styled.div`
  background: #fff;
  border: 1px solid #e5d6c7;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 24px;
`;

const OptionGroup = styled.div`
  margin-bottom: 16px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const OptionLabel = styled.h5`
  font-size: 15px;
  font-weight: 600;
  color: #552a47;
  margin: 0 0 8px 0;
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const Checkbox = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  
  input {
    cursor: pointer;
  }
`;

const RadioGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Radio = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  
  input {
    cursor: pointer;
  }
`;

const Button = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 16px;
  background: #552a47;
  color: #fff;
  border: none;
  border-radius: 6px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #441e38;
  }
  
  &:disabled {
    background: #ccc;
    cursor: not-allowed;
  }
`;

// Export format types
type ExportFormat = 'csv' | 'excel' | 'pdf' | 'json';

interface ExportOptions {
  includeMetadata: boolean;
  includeDemographics: boolean;
  includeOpenResponses: boolean;
  includeTimestamps: boolean;
  dateRange: {
    start: string;
    end: string;
  };
  groupBy: 'none' | 'section' | 'question' | 'date';
  anonymize: boolean;
}

interface SurveyExportProps {
  surveyId: string;
  onExport?: (format: ExportFormat, options: ExportOptions) => void;
}

const SurveyExport: React.FC<SurveyExportProps> = ({
  surveyId,
  onExport
}) => {
  const [selectedFormat, setSelectedFormat] = useState<ExportFormat>('csv');
  const [options, setOptions] = useState<ExportOptions>({
    includeMetadata: true,
    includeDemographics: true,
    includeOpenResponses: true,
    includeTimestamps: true,
    dateRange: {
      start: '',
      end: ''
    },
    groupBy: 'none',
    anonymize: false
  });
  
  const handleOptionChange = (key: keyof ExportOptions, value: any) => {
    setOptions(prev => ({
      ...prev,
      [key]: value
    }));
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    handleOptionChange(name as keyof ExportOptions, checked);
  };
  
  const handleRadioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    handleOptionChange(name as keyof ExportOptions, value);
  };
  
  const handleDateChange = (key: 'start' | 'end', value: string) => {
    setOptions(prev => ({
      ...prev,
      dateRange: {
        ...prev.dateRange,
        [key]: value
      }
    }));
  };
  
  const handleExport = () => {
    if (onExport) {
      onExport(selectedFormat, options);
    } else {
      console.log('Export triggered:', { format: selectedFormat, options });
      // Mock export functionality
      alert(`Survey data would be exported in ${selectedFormat.toUpperCase()} format with the selected options.`);
    }
  };
  
  return (
    <Container>
      <Header>Export Survey Data</Header>
      
      <ExportGrid>
        <ExportCard 
          selected={selectedFormat === 'csv'}
          onClick={() => setSelectedFormat('csv')}
        >
          <ExportCardHeader>
            <ExportIcon>
              <FiFileText size={20} />
            </ExportIcon>
            <ExportTitle>CSV</ExportTitle>
          </ExportCardHeader>
          <ExportDescription>
            Export as CSV for easy import into spreadsheet applications.
          </ExportDescription>
        </ExportCard>
        
        <ExportCard 
          selected={selectedFormat === 'excel'}
          onClick={() => setSelectedFormat('excel')}
        >
          <ExportCardHeader>
            <ExportIcon>
              <FiTable size={20} />
            </ExportIcon>
            <ExportTitle>Excel</ExportTitle>
          </ExportCardHeader>
          <ExportDescription>
            Export as Excel workbook with formatted data and multiple sheets.
          </ExportDescription>
        </ExportCard>
        
        <ExportCard 
          selected={selectedFormat === 'pdf'}
          onClick={() => setSelectedFormat('pdf')}
        >
          <ExportCardHeader>
            <ExportIcon>
              <FiFileText size={20} />
            </ExportIcon>
            <ExportTitle>PDF Report</ExportTitle>
          </ExportCardHeader>
          <ExportDescription>
            Export as a formatted PDF report with visualizations.
          </ExportDescription>
        </ExportCard>
        
        <ExportCard 
          selected={selectedFormat === 'json'}
          onClick={() => setSelectedFormat('json')}
        >
          <ExportCardHeader>
            <ExportIcon>
              <FiBarChart2 size={20} />
            </ExportIcon>
            <ExportTitle>JSON</ExportTitle>
          </ExportCardHeader>
          <ExportDescription>
            Export as JSON for developers or data analysis tools.
          </ExportDescription>
        </ExportCard>
      </ExportGrid>
      
      <OptionsContainer>
        <OptionGroup>
          <OptionLabel>Include Data</OptionLabel>
          <CheckboxGroup>
            <Checkbox>
              <input 
                type="checkbox" 
                name="includeMetadata" 
                checked={options.includeMetadata} 
                onChange={handleCheckboxChange} 
              />
              Survey Metadata
            </Checkbox>
            <Checkbox>
              <input 
                type="checkbox" 
                name="includeDemographics" 
                checked={options.includeDemographics} 
                onChange={handleCheckboxChange} 
              />
              Demographics
            </Checkbox>
            <Checkbox>
              <input 
                type="checkbox" 
                name="includeOpenResponses" 
                checked={options.includeOpenResponses} 
                onChange={handleCheckboxChange} 
              />
              Open-Ended Responses
            </Checkbox>
            <Checkbox>
              <input 
                type="checkbox" 
                name="includeTimestamps" 
                checked={options.includeTimestamps} 
                onChange={handleCheckboxChange} 
              />
              Timestamps
            </Checkbox>
          </CheckboxGroup>
        </OptionGroup>
        
        <OptionGroup>
          <OptionLabel>Date Range</OptionLabel>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <div>
              <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>Start Date</label>
              <input 
                type="date" 
                value={options.dateRange.start}
                onChange={(e) => handleDateChange('start', e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
              />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: 14, marginBottom: 4 }}>End Date</label>
              <input 
                type="date" 
                value={options.dateRange.end}
                onChange={(e) => handleDateChange('end', e.target.value)}
                style={{ padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
              />
            </div>
          </div>
        </OptionGroup>
        
        <OptionGroup>
          <OptionLabel>Group By</OptionLabel>
          <RadioGroup>
            <Radio>
              <input 
                type="radio" 
                name="groupBy" 
                value="none" 
                checked={options.groupBy === 'none'} 
                onChange={handleRadioChange} 
              />
              No Grouping (Flat Data)
            </Radio>
            <Radio>
              <input 
                type="radio" 
                name="groupBy" 
                value="section" 
                checked={options.groupBy === 'section'} 
                onChange={handleRadioChange} 
              />
              Group by Section
            </Radio>
            <Radio>
              <input 
                type="radio" 
                name="groupBy" 
                value="question" 
                checked={options.groupBy === 'question'} 
                onChange={handleRadioChange} 
              />
              Group by Question
            </Radio>
            <Radio>
              <input 
                type="radio" 
                name="groupBy" 
                value="date" 
                checked={options.groupBy === 'date'} 
                onChange={handleRadioChange} 
              />
              Group by Date
            </Radio>
          </RadioGroup>
        </OptionGroup>
        
        <OptionGroup>
          <OptionLabel>Privacy Options</OptionLabel>
          <Checkbox>
            <input 
              type="checkbox" 
              name="anonymize" 
              checked={options.anonymize} 
              onChange={handleCheckboxChange} 
            />
            Anonymize Respondent Data
          </Checkbox>
        </OptionGroup>
      </OptionsContainer>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <Button onClick={handleExport}>
          <FiDownload size={16} />
          Export {selectedFormat.toUpperCase()}
        </Button>
      </div>
    </Container>
  );
};

export default SurveyExport;
