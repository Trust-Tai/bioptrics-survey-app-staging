import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { FaPlus, FaFilter } from 'react-icons/fa';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import DashboardBg from '../../../ui/admin/DashboardBg';
import AdminLayout from '../../../layouts/AdminLayout/AdminLayout';
import QuestionPreviewModal from '../../../ui/admin/QuestionPreviewModal';
import { Questions } from '../../../api/questions';
import { WPSCategories } from '../../../features/wps-framework/api/wpsCategories';
import { SurveyThemes } from '../../../features/survey-themes/api/surveyThemes';

// Styled components
const Container = styled.div`
  padding: 40px;
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



function getLatestVersion(doc: any) {
  if (doc.versions && doc.versions.length > 0) {
    return doc.versions[doc.versions.length - 1];
  }
  return {};
}

const AdminQuestionBank = () => {
  const navigate = useNavigate();
  // Preview modal state
  const [previewQuestion, setPreviewQuestion] = useState<any>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<boolean | null>(null);
  const [filterReusable, setFilterReusable] = useState<boolean | null>(null);
  const [filterTheme, setFilterTheme] = useState<string | null>(null);
  const [filterCategory, setFilterCategory] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);
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
  
  // Apply filters to questions
  const filteredQuestions = questions.filter((doc: any) => {
    const latest = getLatestVersion(doc);
    
    // Search term filter
    if (searchTerm && !latest.questionText?.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    
    // Active status filter
    if (filterActive !== null && latest.isActive !== filterActive) {
      return false;
    }
    
    // Reusable filter
    if (filterReusable !== null && latest.isReusable !== filterReusable) {
      return false;
    }
    
    // Theme filter
    if (filterTheme && (!latest.surveyThemes || !latest.surveyThemes.includes(filterTheme))) {
      return false;
    }
    
    // Category filter
    if (filterCategory && (!latest.categoryTags || !latest.categoryTags.includes(filterCategory))) {
      return false;
    }
    
    // Priority filter
    if (filterPriority !== null && latest.priority !== filterPriority) {
      return false;
    }
    
    return true;
  });
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
      <DashboardBg>
        <TitleRow>
          <Title>Question Bank</Title>
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              onClick={() => navigate('/admin/questions/builder')} 
              style={{ 
                background: '#552a47', 
                color: '#fff', 
                border: 'none', 
                borderRadius: 8, 
                padding: '8px 16px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 6, 
                cursor: 'pointer',
                fontWeight: 600,
                fontSize: 15,
              }}
            >
              <FaPlus size={14} /> New Question
            </button>
          </div>
        </TitleRow>
        
        <SearchFilterRow>
          <SearchInput 
            placeholder="Search questions..." 
            value={searchTerm} 
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <FilterButton onClick={() => setShowFilters(!showFilters)}>
            <FaFilter size={14} /> Filters {showFilters ? '▲' : '▼'}
          </FilterButton>
        </SearchFilterRow>
        
        {showFilters && (
          <div style={{ 
            background: '#f9f4f7', 
            borderRadius: 12, 
            padding: 16, 
            marginBottom: 24,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
            gap: 16
          }}>
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Status</div>
              <select 
                value={filterActive === null ? '' : String(filterActive)}
                onChange={(e) => {
                  if (e.target.value === '') setFilterActive(null);
                  else setFilterActive(e.target.value === 'true');
                }}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
              >
                <option value="">All</option>
                <option value="true">Active</option>
                <option value="false">Inactive</option>
              </select>
            </div>
            
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Reusable</div>
              <select 
                value={filterReusable === null ? '' : String(filterReusable)}
                onChange={(e) => {
                  if (e.target.value === '') setFilterReusable(null);
                  else setFilterReusable(e.target.value === 'true');
                }}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
              >
                <option value="">All</option>
                <option value="true">Reusable</option>
                <option value="false">Not Reusable</option>
              </select>
            </div>
            
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Theme</div>
              <select 
                value={filterTheme || ''}
                onChange={(e) => setFilterTheme(e.target.value || null)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
              >
                <option value="">All Themes</option>
                {surveyThemes.map((theme: any) => (
                  <option key={theme._id} value={theme._id}>{theme.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Category</div>
              <select 
                value={filterCategory || ''}
                onChange={(e) => setFilterCategory(e.target.value || null)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
              >
                <option value="">All Categories</option>
                {wpsCategories.map((category: any) => (
                  <option key={category._id} value={category._id}>{category.name}</option>
                ))}
              </select>
            </div>
            
            <div>
              <div style={{ fontWeight: 600, marginBottom: 8 }}>Priority</div>
              <select 
                value={filterPriority?.toString() || ''}
                onChange={(e) => setFilterPriority(e.target.value ? parseInt(e.target.value) : null)}
                style={{ width: '100%', padding: '8px 12px', borderRadius: 6, border: '1px solid #ddd' }}
              >
                <option value="">All Priorities</option>
                <option value="1">1 (Highest)</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4</option>
                <option value="5">5 (Lowest)</option>
              </select>
            </div>
            
            <div style={{ display: 'flex', alignItems: 'flex-end' }}>
              <button 
                onClick={() => {
                  setFilterActive(null);
                  setFilterReusable(null);
                  setFilterTheme(null);
                  setFilterCategory(null);
                  setFilterPriority(null);
                  setSearchTerm('');
                }}
                style={{ 
                  background: '#f0f0f0', 
                  border: 'none', 
                  borderRadius: 6, 
                  padding: '8px 16px', 
                  cursor: 'pointer',
                  width: '100%'
                }}
              >
                Clear Filters
              </button>
            </div>
          </div>
        )}
        <Container>
        {/* Stats and Summary Section */}
        <div style={{ marginBottom: 32, display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ display: 'flex', gap: 32, flexWrap: 'wrap', alignItems: 'center' }}>
            <div style={{ background: '#fbe7f6', color: '#a54c8c', borderRadius: 12, padding: '18px 32px', fontWeight: 800, fontSize: 22, boxShadow: '0 2px 8px #f4ebf1' }}>
              Total Questions: {questionCount}
            </div>
            <div style={{ background: '#e4f0fa', color: '#3776a8', borderRadius: 12, padding: '18px 32px', fontWeight: 700, fontSize: 18, boxShadow: '0 2px 8px #f4ebf1' }}>
              WPS Categories Used: {Object.keys(wpsCategoryUsage).length}
            </div>
            <div style={{ background: '#fff5e1', color: '#552a47', borderRadius: 12, padding: '18px 32px', fontWeight: 700, fontSize: 18, boxShadow: '0 2px 8px #f4ebf1' }}>
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
                {Object.keys(wpsCategoryUsage).length === 0 && <span style={{ color: '#8a7a85', fontStyle: 'italic' }}>None</span>}
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
                {Object.keys(surveyThemeUsage).length === 0 && <span style={{ color: '#8a7a85', fontStyle: 'italic' }}>None</span>}
              </div>
            </div>
          </div>
        </div>
            {/* --- Question List with Preview --- */}
            <QuestionList>
              {filteredQuestions.length === 0 && <div style={{ color: '#8a7a85', fontStyle: 'italic' }}>No questions found matching your filters.</div>}
              {filteredQuestions.map((doc: any, idx: number) => {
                const latest = getLatestVersion(doc);
                // Compose tags: theme, wps, type
                const tags = [
                  ...(latest.surveyThemes || []).map((id: string) => ({ label: surveyThemeMap[id] || id, color: tagColors.THEME })),
                  ...(latest.categoryTags || []).map((id: string) => ({ label: wpsCategoryMap[id] || id, color: tagColors.WPS })),
                  latest.responseType ? [{ label: latest.responseType.toUpperCase(), color: tagColors.TYPE }] : [],
                ].flat();
                return (
                  <QuestionCard key={doc._id}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ width: '80%' }}>
                        <div style={{ marginBottom: 8, display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                          {tags.map((tag, i) => (
                            <Tag key={tag.label + i} color={tag.color}>{tag.label}</Tag>
                          ))}
                          {latest.isReusable && (
                            <Tag color="#4caf50">Reusable</Tag>
                          )}
                          {latest.isActive === false && (
                            <Tag color="#f44336">Inactive</Tag>
                          )}
                          {latest.priority && (
                            <Tag color="#ff9800">Priority: {latest.priority}</Tag>
                          )}
                        </div>
                        <div style={{ fontWeight: 500, color: '#28211e', fontSize: 17 }}>{latest.questionText || '[No text]'}</div>
                        
                        {/* Additional details */}
                        <div style={{ marginTop: 10, display: 'flex', flexWrap: 'wrap', gap: 16, fontSize: 14, color: '#666' }}>
                          {latest.usageCount !== undefined && (
                            <div>
                              <span style={{ fontWeight: 600 }}>Usage:</span> {latest.usageCount} surveys
                            </div>
                          )}
                          {latest.lastUsedAt && (
                            <div>
                              <span style={{ fontWeight: 600 }}>Last used:</span> {new Date(latest.lastUsedAt).toLocaleDateString()}
                            </div>
                          )}
                          {latest.keywords && latest.keywords.length > 0 && (
                            <div>
                              <span style={{ fontWeight: 600 }}>Keywords:</span> {latest.keywords.join(', ')}
                            </div>
                          )}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <button
                          style={{
                            background: '#552a47',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '7px 18px',
                            fontWeight: 600,
                            fontSize: 15,
                            cursor: 'pointer',
                            boxShadow: '0 1.5px 8px #e5d6e0',
                            transition: 'background 0.18s',
                          }}
                          onMouseOver={e => (e.currentTarget.style.background = '#693658')}
                          onMouseOut={e => (e.currentTarget.style.background = '#552a47')}
                          onClick={() => {
                            setPreviewQuestion(latest);
                            setPreviewOpen(true);
                          }}
                        >
                          Preview
                        </button>
                        <button
                          style={{
                            background: '#3776a8',
                            color: '#fff',
                            border: 'none',
                            borderRadius: 8,
                            padding: '7px 18px',
                            fontWeight: 600,
                            fontSize: 15,
                            cursor: 'pointer',
                            boxShadow: '0 1.5px 8px #e5d6e0',
                            transition: 'background 0.18s',
                          }}
                          onMouseOver={e => (e.currentTarget.style.background = '#4288c0')}
                          onMouseOut={e => (e.currentTarget.style.background = '#3776a8')}
                          onClick={() => navigate(`/admin/questions/builder?edit=${doc._id}`)}
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </QuestionCard>
                );
              })}
            </QuestionList>
            <QuestionPreviewModal
              question={previewQuestion}
              open={previewOpen}
              onClose={() => {
                console.log('Closing preview modal');
                setPreviewOpen(false);
              }}
            />
            {previewOpen && (
              <div style={{ position: 'fixed', bottom: 10, right: 10, background: '#fff0f0', color: '#c00', padding: 12, zIndex: 99999 }}>
                <div>Debug: previewOpen={String(previewOpen)}</div>
                <div>previewQuestion: {JSON.stringify(previewQuestion)}</div>
              </div>
            )}
          </Container>
      </DashboardBg>
    </AdminLayout>
  );
};


export default AdminQuestionBank;