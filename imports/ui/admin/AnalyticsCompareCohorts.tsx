import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import styled, { ThemeProvider } from 'styled-components';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import { FaChartBar, FaUsers, FaFileExport } from 'react-icons/fa';
import { useTheme } from '/imports/contexts/ThemeContext';

const StyledButton = styled.button`
  padding: 8px 16px;
  background-color: ${({ theme }) => theme.primaryColor || '#552a47'};
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.2s;
  
  &:hover {
    background-color: ${({ theme }) => theme.secondaryColor || '#46223b'};
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

const GridContainer = styled.div`
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

const ChartPlaceholder = styled.div`
  background-color: ${({ theme }) => theme.backgroundColor || '#f8f9fa'};
  border: 1px solid ${({ theme }) => theme.primaryColor ? `${theme.primaryColor}20` : 'rgba(85, 42, 71, 0.2)'};
  border-radius: 8px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  color: ${({ theme }) => theme.textColor ? `${theme.textColor}80` : 'rgba(46, 46, 46, 0.8)'};
`;

const CardDescription = styled.p`
  color: ${({ theme }) => theme.textColor || '#2e2e2e'};
  margin: 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
`;

const AnalyticsCompareCohorts: React.FC = () => {
  const themeContext = useTheme();
  
  // This would be replaced with actual data from your Meteor collections
  const { isLoading, cohorts } = useTracker(() => {
    // Placeholder for actual subscription and data fetching
    return {
      isLoading: false,
      cohorts: [
        { id: '1', name: 'Department A', responseCount: 45, avgScore: 7.8 },
        { id: '2', name: 'Department B', responseCount: 32, avgScore: 6.5 },
        { id: '3', name: 'Department C', responseCount: 28, avgScore: 8.2 },
        { id: '4', name: 'Department D', responseCount: 37, avgScore: 7.1 }
      ]
    };
  }, []);

  return (
    <AdminLayout>
      <ThemeProvider theme={themeContext}>
        <Container>
          <div>
            <PageTitle>Compare Cohorts</PageTitle>
            <PageDescription>Compare analytics data across different cohorts to identify trends and insights.</PageDescription>
          </div>
          
          <GridContainer>
            <StyledCard>
              <CardHeader>
                <FaChartBar />
                <h3>Cohort Comparison</h3>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder>
                  Cohort Comparison Chart
                </ChartPlaceholder>
                <CardDescription>Compare key metrics across different cohorts to identify performance patterns and outliers.</CardDescription>
              </CardContent>
              <ButtonContainer>
                <StyledButton>View Details</StyledButton>
              </ButtonContainer>
            </StyledCard>
            
            <StyledCard>
              <CardHeader>
                <FaUsers />
                <h3>Response Distribution</h3>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder>
                  Response Distribution Chart
                </ChartPlaceholder>
                <CardDescription>Analyze how responses are distributed across different cohorts and question categories.</CardDescription>
              </CardContent>
              <ButtonContainer>
                <StyledButton>View Details</StyledButton>
              </ButtonContainer>
            </StyledCard>
            
            <StyledCard>
              <CardHeader>
                <FaFileExport />
                <h3>Trend Analysis</h3>
              </CardHeader>
              <CardContent>
                <ChartPlaceholder>
                  Trend Analysis Chart
                </ChartPlaceholder>
                <CardDescription>Track how cohort performance has changed over time to identify improvements or areas of concern.</CardDescription>
              </CardContent>
              <ButtonContainer>
                <StyledButton>View Details</StyledButton>
              </ButtonContainer>
            </StyledCard>
          </GridContainer>
        </Container>
      </ThemeProvider>
    </AdminLayout>
  );
};

export default AnalyticsCompareCohorts;
