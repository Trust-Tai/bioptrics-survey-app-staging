import React from 'react';
import AdminLayout from './AdminLayout';
import { useOrganization } from '/imports/features/organization/contexts/OrganizationContext';
import TermLabel from '../components/TermLabel';
import styled from 'styled-components';
import { FaUserPlus, FaFileImport, FaUsers, FaChartBar } from 'react-icons/fa';

// Styled components
const Container = styled.div`
  background: ${({ theme }) => theme.backgroundColor};
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
  height: 100%;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 24px;
  color: ${({ theme }) => theme.textColor};
  margin: 0;
`;

const Card = styled.div`
  background: ${({ theme }) => theme.accentColor};
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const CardTitle = styled.h3`
  color: ${({ theme }) => theme.primaryColor};
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  gap: 8px;
`;

const CardContent = styled.div`
  color: ${({ theme }) => theme.secondaryColor};
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 16px;
  margin-top: 24px;
`;

const FeatureCard = styled.div`
  background: ${({ theme }) => theme.backgroundColor};
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const FeatureIcon = styled.div`
  font-size: 24px;
  color: ${({ theme }) => theme.primaryColor};
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FeatureTitle = styled.h4`
  margin: 0;
  color: ${({ theme }) => theme.textColor};
`;

const FeatureDescription = styled.p`
  margin: 0;
  color: ${({ theme }) => theme.secondaryColor};
  font-size: 14px;
`;

const Participants: React.FC = () => {
  const { settings } = useOrganization();
  
  return (
    <AdminLayout>
      <Container>
        <PageHeader>
          <PageTitle>
            <TermLabel term="participantLabel" plural /> Management
          </PageTitle>
        </PageHeader>
        
        <p>
          This page allows you to manage all <TermLabel term="participantLabel" plural /> for your <TermLabel term="surveyLabel" plural />.
        </p>
        
        <Card>
          <CardTitle>
            <FaUsers /> Coming Soon
          </CardTitle>
          <CardContent>
            <p>
              The <TermLabel term="participantLabel" /> management features are currently under development.
              Soon you'll be able to manage all aspects of <TermLabel term="participantLabel" /> engagement.
            </p>
            
            <FeatureGrid>
              <FeatureCard>
                <FeatureIcon>
                  <FaFileImport />
                  <FeatureTitle>Import <TermLabel term="participantLabel" plural /></FeatureTitle>
                </FeatureIcon>
                <FeatureDescription>
                  Easily import <TermLabel term="participantLabel" plural /> from CSV files or connect to your HR system.
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard>
                <FeatureIcon>
                  <FaUserPlus />
                  <FeatureTitle>Manage Groups</FeatureTitle>
                </FeatureIcon>
                <FeatureDescription>
                  Create and manage <TermLabel term="participantLabel" /> groups for targeted <TermLabel term="surveyLabel" plural />.
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard>
                <FeatureIcon>
                  <FaUsers />
                  <FeatureTitle>Track Engagement</FeatureTitle>
                </FeatureIcon>
                <FeatureDescription>
                  Monitor <TermLabel term="participantLabel" /> engagement and send automated reminders.
                </FeatureDescription>
              </FeatureCard>
              
              <FeatureCard>
                <FeatureIcon>
                  <FaChartBar />
                  <FeatureTitle>Detailed Analytics</FeatureTitle>
                </FeatureIcon>
                <FeatureDescription>
                  View comprehensive analytics on <TermLabel term="participantLabel" /> participation and engagement.
                </FeatureDescription>
              </FeatureCard>
            </FeatureGrid>
          </CardContent>
        </Card>
      </Container>
    </AdminLayout>
  );
};

export default Participants;
