import React from 'react';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import styled from 'styled-components';

// Styled components
const Container = styled.div`
  background: white;
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
  color: #333;
  margin: 0;
`;

const Card = styled.div`
  background: #f8f5f9;
  border-radius: 8px;
  padding: 20px;
  margin-top: 20px;
`;

const CardTitle = styled.h3`
  color: #552a47;
  margin-bottom: 12px;
`;

const CardContent = styled.div`
  color: #6e5a67;
`;

const Setting: React.FC = () => {
  return (
    <AdminLayout>
      <Container>
        <PageHeader>
          <PageTitle>Settings</PageTitle>
        </PageHeader>
        
        <Card>
          <CardTitle>Application Settings</CardTitle>
          <CardContent>
            <p>
              No settings are available at this time. This page will be updated with configuration options soon.
            </p>
            <p style={{ marginTop: '16px' }}>
              Future settings will include:
            </p>
            <ul style={{ marginLeft: '20px', marginTop: '8px' }}>
              <li>User interface preferences</li>
              <li>Notification settings</li>
              <li>Data retention policies</li>
              <li>Integration configurations</li>
              <li>Security settings</li>
            </ul>
          </CardContent>
        </Card>
      </Container>
    </AdminLayout>
  );
};

export default Setting;
