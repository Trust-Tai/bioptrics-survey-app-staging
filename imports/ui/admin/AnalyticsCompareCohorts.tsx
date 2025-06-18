import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import styled from 'styled-components';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import { FaChartBar, FaUsers, FaFileExport } from 'react-icons/fa';
// Using specific primary color #552a47

const StyledButton = styled.button`
  padding: 8px 16px;
  background-color: #552a47;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  
  &:hover {
    background-color: #46223b; /* Slightly darker shade for hover */
  }
`;

const Container = styled.div`
  padding: 20px;
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
  margin-top: 20px;
`;

const StyledCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
    color: #552a47;
  }
  
  h3 {
    margin: 0;
    font-size: 1.2rem;
  }
`;

const CardContent = styled.div`
  flex-grow: 1;
`;

const ChartPlaceholder = styled.div`
  background-color: #f5f7ff;
  border-radius: 8px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 15px;
  color: #8a94a6;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
  margin-top: 15px;
`;

const AnalyticsCompareCohorts: React.FC = () => {
  // Using hardcoded primary color #552a47
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
      <Container>
        <div>
          <h1>Compare Cohorts</h1>
          <p>Compare analytics data across different cohorts to identify trends and insights.</p>
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
              <p>Compare key metrics across different cohorts to identify performance patterns and outliers.</p>
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
              <p>Analyze how responses are distributed across different cohorts and question categories.</p>
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
              <p>Track how cohort performance has changed over time to identify improvements or areas of concern.</p>
            </CardContent>
            <ButtonContainer>
              <StyledButton>View Details</StyledButton>
            </ButtonContainer>
          </StyledCard>
        </GridContainer>
      </Container>
    </AdminLayout>
  );
};

export default AnalyticsCompareCohorts;
