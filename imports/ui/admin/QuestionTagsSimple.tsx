import React, { useState } from 'react';
import styled from 'styled-components';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import DashboardBg from './DashboardBg';

// Styled components
const Container = styled.div`
  padding: 0;
`;

const Title = styled.h1`
  font-size: 26px;
  font-weight: 800;
  margin-bottom: 24px;
  color: #28211e;
`;

const ActionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 24px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #552a47;
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  padding: 0 22px;
  font-size: 16px;
  height: 44px;
  cursor: pointer;
`;

const SearchInput = styled.input`
  height: 44px;
  font-size: 16px;
  padding: 0 16px;
  border-radius: 8px;
  border: 1.5px solid #e5d6c7;
  min-width: 220px;
  color: #28211e;
  font-weight: 500;
  outline: none;
  background: #fff;
`;

const TagGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
`;

const TagCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  border: 1px solid #f0e6d9;
`;

const TagHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 12px;
`;

const TagColor = styled.div<{ color: string }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: ${props => props.color};
`;

const TagName = styled.h3`
  margin: 0;
  font-weight: 700;
  font-size: 18px;
`;

const TagDescription = styled.p`
  margin: 0 0 16px;
  font-size: 15px;
  line-height: 1.5;
  color: #555;
`;

const ActionButtons = styled.div`
  display: flex;
  gap: 8px;
  justify-content: flex-end;
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'default' }>`
  padding: 6px 12px;
  background: ${props => {
    if (props.variant === 'primary') return '#552a47';
    if (props.variant === 'danger') return '#e74c3c';
    return '#f5f5f5';
  }};
  color: ${props => (props.variant === 'default' ? '#333' : '#fff')};
  border: none;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
`;

interface Tag {
  id: string;
  name: string;
  color: string;
  description: string;
}

const sampleTags: Tag[] = [
  {
    id: '1',
    name: 'Important',
    color: '#e74c3c',
    description: 'Questions that are critical for the survey.'
  },
  {
    id: '2',
    name: 'Technical',
    color: '#3498db',
    description: 'Questions related to technical aspects.'
  },
  {
    id: '3',
    name: 'Management',
    color: '#2ecc71',
    description: 'Questions targeting management roles.'
  },
  {
    id: '4',
    name: 'Entry Level',
    color: '#f39c12',
    description: 'Questions suitable for entry-level employees.'
  },
  {
    id: '5',
    name: 'Advanced',
    color: '#9b59b6',
    description: 'Advanced questions for experienced employees.'
  },
  {
    id: '6',
    name: 'Optional',
    color: '#95a5a6',
    description: 'Questions that can be skipped.'
  }
];

const QuestionTagsSimple: React.FC = () => {
  const [searchTerm, setSearchTerm] = React.useState('');
  
  // Filter tags based on search term
  const filteredTags = sampleTags.filter(tag =>
    tag.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <AdminLayout>
      <DashboardBg>
        <Container>
          <Title>Question Tags</Title>
        
        <ActionBar>
          <AddButton>
            <span style={{ fontSize: 20, marginRight: 2 }}>+</span>
            Add
          </AddButton>
          <SearchInput
            type="text"
            placeholder="Search tags..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </ActionBar>
        
        <TagGrid>
          {filteredTags.map(tag => (
            <TagCard key={tag.id}>
              <TagHeader>
                <TagColor color={tag.color} />
                <TagName>{tag.name}</TagName>
              </TagHeader>
              <TagDescription>{tag.description}</TagDescription>
              <ActionButtons>
                <Button variant="default">View</Button>
                <Button variant="primary">Edit</Button>
                <Button variant="danger">Delete</Button>
              </ActionButtons>
            </TagCard>
          ))}
        </TagGrid>
        </Container>
      </DashboardBg>
    </AdminLayout>
  );
};

export default QuestionTagsSimple;
