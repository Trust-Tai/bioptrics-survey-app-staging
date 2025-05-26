import React from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaList, FaUserPlus, FaUsers } from 'react-icons/fa';
import AdminLayout from './AdminLayout';

// Styled components

const Container = styled.div`
  background: white;
  border-radius: 12px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 24px;
  margin-bottom: 24px;
`;

const PageHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
`;

const PageTitle = styled.h1`
  font-size: 28px;
  color: #333;
  margin: 0;
`;

const Button = styled.button`
  background: #552a47;
  color: white;
  border: none;
  border-radius: 6px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: background 0.2s;
  
  &:hover {
    background: #7a3e68;
  }
`;

const CardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 24px;
  margin-top: 24px;
`;

const Card = styled.div`
  background: #f9f9fb;
  border-radius: 10px;
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  transition: transform 0.2s, box-shadow 0.2s;
  cursor: pointer;
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.1);
  }
`;

const IconContainer = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #552a47;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  color: white;
  font-size: 24px;
`;

const CardTitle = styled.h3`
  margin: 0 0 8px 0;
  font-size: 18px;
  color: #333;
`;

const CardDescription = styled.p`
  margin: 0;
  color: #666;
  font-size: 14px;
`;

const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 32px;
`;

const StatCard = styled.div`
  background: #f5f5f7;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
`;

const StatValue = styled.div`
  font-size: 28px;
  font-weight: 600;
  color: #552a47;
  margin-bottom: 8px;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
`;



const Users = () => {
  const navigate = useNavigate();

  return (
    <AdminLayout>
      <Container>
        <PageHeader>
          <PageTitle>User Management</PageTitle>
        </PageHeader>
        
        <StatsContainer>
          <StatCard>
            <StatValue>0</StatValue>
            <StatLabel>Total Users</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>0</StatValue>
            <StatLabel>Admins</StatLabel>
          </StatCard>
          <StatCard>
            <StatValue>0</StatValue>
            <StatLabel>Active Users</StatLabel>
          </StatCard>
        </StatsContainer>

        <CardGrid>
          <Card onClick={() => navigate('/admin/users/all')}>
            <IconContainer>
              <FaList />
            </IconContainer>
            <CardTitle>All Users</CardTitle>
            <CardDescription>View and manage existing users</CardDescription>
          </Card>
          
          <Card onClick={() => navigate('/admin/users/add')}>
            <IconContainer>
              <FaUserPlus />
            </IconContainer>
            <CardTitle>Add New User</CardTitle>
            <CardDescription>Create a new user account</CardDescription>
          </Card>
        </CardGrid>
      </Container>
    </AdminLayout>
  );
};

export default Users;
