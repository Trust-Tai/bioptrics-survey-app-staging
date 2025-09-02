import React, { useState } from 'react';
import styled, { ThemeProvider } from 'styled-components';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import { FaFileExport, FaFilePdf, FaFileExcel, FaFileCsv } from 'react-icons/fa';
import { useTheme } from '/imports/contexts/ThemeContext';
import { generateSurveyReportPDF } from './SurveyReportPDF';

const StyledButton = styled.button`
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.primaryColor || '#552a47'};
  color: white !important;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.secondaryColor || '#46223b'};
  }

  /* Ensure all child elements also have white text */
  * {
    color: white !important;
  }
`;

const StyledSelect = styled.select`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.primaryColor ? `${theme.primaryColor}40` : '#ddd'};
  background-color: ${({ theme }) => theme.backgroundColor || 'white'};
  color: ${({ theme }) => theme.textColor || '#333'};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primaryColor || '#552a47'};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.primaryColor || '#552a47'};
  }
`;

const StyledDateInput = styled.input`
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid ${({ theme }) => theme.primaryColor ? `${theme.primaryColor}40` : '#ddd'};
  background-color: ${({ theme }) => theme.backgroundColor || 'white'};
  color: ${({ theme }) => theme.textColor || '#333'};

  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.primaryColor || '#552a47'};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.primaryColor || '#552a47'};
  }
`;

const Container = styled.div`
  padding: 20px;
  background: ${({ theme }) => theme.backgroundColor || '#f8f9fa'};
  min-height: 100vh;
`;

const PageTitle = styled.h1`
  color: ${({ theme }) => theme.primaryColor || '#552a47'};
  margin-bottom: 8px;
`;

const PageDescription = styled.p`
  color: ${({ theme }) => theme.textColor || '#2e2e2e'};
  margin-bottom: 20px;
`;

const ExportOptionsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const StyledCard = styled.div`
  background-color: ${({ theme }) => theme.accentColor || '#A9A59D'};
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 1px solid ${({ theme }) => theme.primaryColor ? `${theme.primaryColor}20` : 'rgba(85, 42, 71, 0.2)'};
  padding: 20px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 15px;
  
  svg {
    margin-right: 10px;
    font-size: 1.5rem;
    color: ${({ theme }) => theme.primaryColor || '#552a47'};
  }
  
  h3 {
    margin: 0;
    font-size: 1.2rem;
    color: ${({ theme }) => theme.primaryColor || '#552a47'};
  }
`;

const CardContent = styled.div`
  flex-grow: 1;
`;

const FormGroup = styled.div`
  margin-bottom: 15px;
  
  label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
    color: ${({ theme }) => theme.textColor || '#333'};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
  
  button {
    margin-left: 10px;
  }
`;

const FormatTitle = styled.h3`
  margin-bottom: 16px;
  font-size: 1.2rem;
  font-weight: 500;
  color: ${({ theme }) => theme.primaryColor || '#552a47'};
`;

const FormatContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 20px;
`;

const FormatOptionContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 20px;
`;

const FormatOption = styled.div<{ selected: boolean; color: string }>`
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border-radius: 8px;
  background-color: ${props => props.selected ? `${props.color}10` : props.theme.backgroundColor || 'white'};
  border: 1px solid ${props => props.selected ? props.color : props.theme.primaryColor ? `${props.theme.primaryColor}40` : '#e0e0e0'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    border-color: ${props => props.color};
    background-color: ${props => `${props.color}05`};
  }
  
  svg {
    font-size: 1.5rem;
    margin-right: 12px;
  }
  
  .format-info {
    display: flex;
    flex-direction: column;
  }
  
  .format-name {
    font-weight: 500;
    margin-bottom: 2px;
    color: ${({ theme }) => theme.textColor || '#333'};
  }
  
  .format-desc {
    font-size: 0.85rem;
    color: ${({ theme }) => theme.textColor ? `${theme.textColor}80` : '#666'};
  }
`;

const AnalyticsExportReports: React.FC = () => {
  const themeContext = useTheme();
  const [reportType, setReportType] = useState('summary');
  const [dateRange, setDateRange] = useState<{ start: Date | null; end: Date | null }>({ start: null, end: null });
  const [format, setFormat] = useState('pdf');
  
  // This would be replaced with actual data from your Meteor collections
  const reportTypes = [
    { value: 'summary', label: 'Summary Report' },
    { value: 'detailed', label: 'Detailed Analysis' },
    { value: 'comparative', label: 'Comparative Report' },
    { value: 'trend', label: 'Trend Analysis' }
  ];
  
  const exportFormats = [
    { value: 'pdf', label: 'PDF', icon: FaFilePdf, color: '#e74c3c' },
    { value: 'excel', label: 'Excel', icon: FaFileExcel, color: '#27ae60' },
    { value: 'csv', label: 'CSV', icon: FaFileCsv, color: '#3498db' }
  ];

  const handleExport = (): void => {
    // Log export parameters
    console.log('Exporting report:', {
      type: reportType,
      dateRange,
      format
    });
    
    // Handle different export formats
    if (format === 'pdf') {
      // Call the PDF generation function
      generateSurveyReportPDF();
    } else {
      // For other formats (to be implemented)
      alert(`${reportType.charAt(0).toUpperCase() + reportType.slice(1)} report is being generated in ${format.toUpperCase()} format. It will be available for download shortly.`);
    }
  };

  return (
    <AdminLayout>
      <ThemeProvider theme={themeContext}>
        <Container>
          <div>
            <PageTitle>Export Reports</PageTitle>
            <PageDescription>Generate and export analytics reports in various formats.</PageDescription>
          </div>
          
          <ExportOptionsContainer>
            <StyledCard>
              <CardHeader>
                <FaFileExport />
                <h3>Report Configuration</h3>
              </CardHeader>
              <CardContent>
                <FormGroup>
                  <label>Report Type</label>
                  <StyledSelect
                    value={reportType}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setReportType(e.target.value)}
                  >
                    {reportTypes.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </StyledSelect>
                </FormGroup>
                
                <FormGroup>
                  <label>Date Range</label>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <StyledDateInput
                      type="date"
                      value={dateRange.start ? dateRange.start.toISOString().split('T')[0] : ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange({ ...dateRange, start: e.target.value ? new Date(e.target.value) : null })}
                    />
                    <StyledDateInput
                      type="date"
                      value={dateRange.end ? dateRange.end.toISOString().split('T')[0] : ''}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDateRange({ ...dateRange, end: e.target.value ? new Date(e.target.value) : null })}
                    />
                  </div>
                </FormGroup>
                
                <FormGroup>
                  <label>Include Filters</label>
                  <StyledSelect defaultValue="all">
                    <option value="all">All Data</option>
                    <option value="department">By Department</option>
                    <option value="role">By Role</option>
                    <option value="location">By Location</option>
                  </StyledSelect>
                </FormGroup>
              </CardContent>
            </StyledCard>
            
            <StyledCard>
              <FormatTitle>Export Format</FormatTitle>
              <FormatContainer>
                <PageDescription>Select the file format for your exported report:</PageDescription>
                <FormatOptionContainer>
                  {exportFormats.map((exportFormat) => (
                    <FormatOption
                      key={exportFormat.value}
                      selected={format === exportFormat.value}
                      color={exportFormat.color}
                      onClick={() => setFormat(exportFormat.value)}
                    >
                      <exportFormat.icon style={{ color: exportFormat.color }} />
                      <div className="format-info">
                        <div className="format-name">{exportFormat.label}</div>
                        <div className="format-desc">Export as {exportFormat.label}</div>
                      </div>
                    </FormatOption>
                  ))}
                </FormatOptionContainer>
                
                <ButtonContainer>
                  <StyledButton onClick={handleExport}>Generate Report</StyledButton>
                </ButtonContainer>
              </FormatContainer>
            </StyledCard>
          </ExportOptionsContainer>
        </Container>
      </ThemeProvider>
    </AdminLayout>
  );
};

export default AnalyticsExportReports;
