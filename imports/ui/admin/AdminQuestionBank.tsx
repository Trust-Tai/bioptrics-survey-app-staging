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

import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Questions } from '/imports/api/questions';
import { WPSCategories } from '/imports/api/wpsCategories';
import { SurveyThemes } from '/imports/api/surveyThemes';

const AdminQuestionBank = () => {
  // Fetch all categories and themes
  const wpsCategories = useTracker(() => {
    Meteor.subscribe('wpsCategories.all');
    return WPSCategories.find().fetch();
  }, []);
  const surveyThemes = useTracker(() => {
    Meteor.subscribe('surveyThemes.all');
    return SurveyThemes.find().fetch();
  }, []);
  // Build lookup maps
  const wpsCategoryMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    wpsCategories.forEach((cat: any) => { map[cat._id] = cat.name; });
    return map;
  }, [wpsCategories]);
  const surveyThemeMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    surveyThemes.forEach((theme: any) => { map[theme._id] = theme.name; });
    return map;
  }, [surveyThemes]);
  // Subscribe to Questions collection
  const questions = useTracker(() => {
    Meteor.subscribe('questions.all');
    return Questions.find({}, { sort: { createdAt: -1 } }).fetch();
  }, [surveyThemeMap, wpsCategoryMap]);
  // Aggregate stats
  const questionCount = questions.length;
  const wpsCategoryUsage: Record<string, number> = {};
  const surveyThemeUsage: Record<string, number> = {};
  questions.forEach((doc: any) => {
    const latest = doc.versions && doc.versions.length > 0 ? doc.versions[doc.versions.length - 1] : {};
    if (latest.categoryTags && latest.categoryTags.length > 0) {
      latest.categoryTags.forEach((id: string) => {
        const name = wpsCategoryMap[id] || id;
        wpsCategoryUsage[name] = (wpsCategoryUsage[name] || 0) + 1;
      });
    }
    if (latest.surveyThemes && latest.surveyThemes.length > 0) {
      latest.surveyThemes.forEach((id: string) => {
        const name = surveyThemeMap[id] || id;
        surveyThemeUsage[name] = (surveyThemeUsage[name] || 0) + 1;
      });
    }
  });

  return (
    <AdminLayout>
       <TitleRow>
        <Title>Question Bank</Title>
      </TitleRow>
      <Container>
        {/* Stats and Summary Section */}
        <div style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ background: '#fbe7f6', color: '#a54c8c', borderRadius: 12, padding: '18px 32px', fontWeight: 800, fontSize: 22, boxShadow: '0 2px 8px #f4e6c1' }}>
              Total Questions: {questionCount}
            </div>
            <div style={{ background: '#e4f0fa', color: '#3776a8', borderRadius: 12, padding: '18px 32px', fontWeight: 700, fontSize: 18, boxShadow: '0 2px 8px #f4e6c1' }}>
              WPS Categories Used: {Object.keys(wpsCategoryUsage).length}
            </div>
            <div style={{ background: '#fff5e1', color: '#b0802b', borderRadius: 12, padding: '18px 32px', fontWeight: 700, fontSize: 18, boxShadow: '0 2px 8px #f4e6c1' }}>
              Survey Themes Used: {Object.keys(surveyThemeUsage).length}
            </div>
          </div>
          {/* Category and Theme Usage Tables */}
          <div style={{ display: 'flex', gap: 40, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: '#3776a8' }}>WPS Category Usage</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {Object.entries(wpsCategoryUsage).map(([cat, count]) => (
                  <span key={cat} style={{ background: '#e0f7fa', color: '#3776a8', borderRadius: 8, padding: '4px 14px', fontWeight: 600, fontSize: 15 }}>
                    {cat}: {count}
                  </span>
                ))}
                {Object.keys(wpsCategoryUsage).length === 0 && <span style={{ color: '#b3a08a', fontStyle: 'italic' }}>None</span>}
              </div>
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 6, color: '#a54c8c' }}>Survey Theme Usage</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                {Object.entries(surveyThemeUsage).map(([theme, count]) => (
                  <span key={theme} style={{ background: '#e6e6fa', color: '#a54c8c', borderRadius: 8, padding: '4px 14px', fontWeight: 600, fontSize: 15 }}>
                    {theme}: {count}
                  </span>
                ))}
                {Object.keys(surveyThemeUsage).length === 0 && <span style={{ color: '#b3a08a', fontStyle: 'italic' }}>None</span>}
              </div>
            </div>
          </div>
        </div>
    </Container>
  </AdminLayout>
);
}

export default AdminQuestionBank;