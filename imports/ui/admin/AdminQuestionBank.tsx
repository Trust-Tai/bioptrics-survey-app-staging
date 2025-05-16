import React from 'react';
import styled from 'styled-components';
import { FaPlus, FaFilter } from 'react-icons/fa';


const Container = styled.div`
  padding: 40px;
  background: #fffbea;
  min-height: 100vh;
`;

const TitleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const Title = styled.h2`
  font-size: 1.3rem;
  font-weight: 600;
  margin: 0;
`;

const SearchFilterRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
`;

const SearchInput = styled.input`
  padding: 8px 16px;
  border-radius: 20px;
  border: none;
  background: #f7f2f5;
  font-size: 1rem;
  width: 260px;
`;

const FilterButton = styled.button`
  background: #fff;
  border: 1px solid #eee;
  border-radius: 20px;
  padding: 8px 16px;
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
`;

const AddButton = styled.button`
  background: #6d4b2f;
  color: #fff;
  border: none;
  border-radius: 50%;
  width: 36px;
  height: 36px;
  font-size: 1.3rem;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 16px;
  cursor: pointer;
`;

const QuestionList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

const QuestionCard = styled.div`
  background: #fff8ee;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.02);
  font-size: 1.1rem;
`;

const Tag = styled.span<{ color: string }>`
  background: ${({ color }) => color};
  color: #fff;
  border-radius: 8px;
  padding: 3px 9px;
  font-size: 0.82em;
  margin-right: 8px;
  font-weight: 500;
`;

const TagLegend = styled.div`
  font-size: 0.78em;
  margin-bottom: 8px;
  color: #7a6b5c;
  display: flex;
  gap: 16px;
  margin-left: auto;
  margin-right: 0;
  justify-content: flex-end;
`;

const tagColors: Record<string, string> = {
  THEME: '#e87ad0',
  WPS: '#5ac6e8',
  TYPE: '#f4b04a',
};

// Dummy data for demonstration
const questions = [
  {
    tags: [
      { label: 'ENGAGEMENT', color: tagColors.THEME },
      { label: 'BEHAVIORAL', color: tagColors.WPS },
      { label: 'LIKERT (1-5)', color: tagColors.TYPE },
    ],
    text: 'I feel valued by my team.',
  },
  {
    tags: [
      { label: 'LEADERSHIP', color: tagColors.THEME },
      { label: 'ORGANIZATIONAL', color: tagColors.WPS },
      { label: 'LIKERT (1-5)', color: tagColors.TYPE },
    ],
    text: 'Leadership communicates effectively during changes.',
  },
  {
    tags: [
      { label: 'ENVIRONMENT', color: tagColors.THEME },
      { label: 'PHYSICAL', color: tagColors.WPS },
      { label: 'OPEN-ENDED', color: tagColors.TYPE },
    ],
    text: 'What improvements would you like to see in your work environment?',
  },
  {
    tags: [
      { label: 'COMMUNICATION', color: tagColors.THEME },
      { label: 'BEHAVIORAL', color: tagColors.WPS },
      { label: 'LIKERT', color: tagColors.TYPE },
    ],
    text: 'My manager encourages open discussion.',
  },
  {
    tags: [
      { label: 'SAFETY', color: tagColors.THEME },
      { label: 'PHYSICAL SAFETY', color: tagColors.WPS },
      { label: 'MULTIPLE CHOICE', color: tagColors.TYPE },
    ],
    text: 'Have you experienced safety concerns in the last 30 days?',
  },
];

import AdminLayout from './AdminLayout';

const AdminQuestionBank = () => (
  <AdminLayout>
    <Container>
      <TitleRow>
        <Title>Question Bank</Title>
        <AddButton title="Add New Question">
          <FaPlus />
        </AddButton>
      </TitleRow>
      <SearchFilterRow>
        <SearchInput placeholder="Hinted search text" />
        <FilterButton><FaFilter /> Filter</FilterButton>
      </SearchFilterRow>
      <TagLegend>
        <span style={{ color: tagColors.THEME }}>■ THEME</span>
        <span style={{ color: tagColors.WPS }}>■ WPS CATEGORY</span>
        <span style={{ color: tagColors.TYPE }}>■ QUE TYPE</span>
      </TagLegend>
      <QuestionList>
        {questions.map((q, i) => (
          <QuestionCard key={i}>
            <div style={{ marginBottom: 7 }}>
              {q.tags.map((tag, j) => (
                <Tag key={j} color={tag.color}>{tag.label}</Tag>
              ))}
            </div>
            <div>Q. {q.text}</div>
          </QuestionCard>
        ))}
      </QuestionList>
    </Container>
  </AdminLayout>
);

export default AdminQuestionBank;