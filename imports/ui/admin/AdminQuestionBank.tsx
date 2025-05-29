import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { FaChartBar, FaTable, FaFilter, FaTag, FaListAlt, FaThLarge, FaExclamationTriangle } from 'react-icons/fa';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line } from 'recharts';
import DashboardBg from './DashboardBg';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import { Questions } from '../../features/questions/api/questions';
import { WPSCategories } from '../../features/wps-framework/api/wpsCategories';
import { SurveyThemes } from '../../features/survey-themes/api/surveyThemes';

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

const FilterBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-bottom: 24px;
  background: white;
  padding: 16px;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
`;

const FilterSelect = styled.select`
  padding: 8px 12px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 0.9rem;
  min-width: 150px;
`;

const FilterLabel = styled.span`
  font-size: 0.9rem;
  color: #666;
  margin-right: 4px;
`;

const FilterGroup = styled.div`
  display: flex;
  align-items: center;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-gap: 24px;
  margin-bottom: 24px;
`;

const KPICard = styled.div`
  grid-column: span 3;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  
  @media (max-width: 1200px) {
    grid-column: span 6;
  }
  
  @media (max-width: 768px) {
    grid-column: span 12;
  }
`;

const KPIValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #552a47;
  margin: 12px 0;
`;

const KPILabel = styled.div`
  font-size: 0.9rem;
  color: #666;
  margin-bottom: 8px;
`;

const KPITrend = styled.div`
  font-size: 0.8rem;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &.positive {
    color: #4caf50;
  }
  
  &.negative {
    color: #f44336;
  }
  
  &.neutral {
    color: #9e9e9e;
  }
`;

const ChartCard = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 24px;
  
  &.half {
    grid-column: span 6;
  }
  
  &.full {
    grid-column: span 12;
  }
  
  @media (max-width: 768px) {
    grid-column: span 12 !important;
  }
`;

const ChartTitle = styled.h3`
  font-size: 1.1rem;
  font-weight: 500;
  margin: 0 0 16px 0;
  color: #333;
`;

const TableCard = styled.div`
  grid-column: span 12;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  padding: 24px;
  overflow: hidden;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  
  th, td {
    padding: 12px 16px;
    text-align: left;
    border-bottom: 1px solid #eee;
  }
  
  th {
    font-weight: 500;
    color: #666;
    font-size: 0.9rem;
  }
  
  td {
    font-size: 0.9rem;
  }
  
  tbody tr:hover {
    background: #f9f9f9;
  }
`;

const Tag = styled.span`
  display: inline-block;
  padding: 4px 8px;
  border-radius: 12px;
  font-size: 0.8rem;
  margin-right: 4px;
  background: #f0f0f0;
  color: #666;
`;

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
`;

const ToggleButton = styled.button<{ active?: boolean }>`
  padding: 8px 16px;
  border: none;
  background: ${props => props.active ? '#552a47' : 'white'};
  color: ${props => props.active ? 'white' : '#333'};
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.9rem;
  
  &:hover {
    background: ${props => props.active ? '#552a47' : '#f5f5f5'};
  }
`;

const AlertBadge = styled.span`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: #f44336;
  color: white;
  border-radius: 50%;
  width: 20px;
  height: 20px;
  font-size: 0.7rem;
  margin-left: 6px;
`;

// Helper function to get the latest version of a question
const getLatestVersion = (doc: any) => {
  if (!doc || !doc.versions || !doc.versions.length) return null;
  const version = doc.versions.find((v: any) => v.version === doc.currentVersion);
  return version || doc.versions[doc.versions.length - 1];
};

// COLORS for charts
const COLORS = [
  '#552a47', '#8e44ad', '#9b59b6', '#3498db', '#2980b9', 
  '#1abc9c', '#16a085', '#27ae60', '#2ecc71', '#f1c40f',
  '#f39c12', '#e67e22', '#d35400', '#e74c3c', '#c0392b'
];

const AdminQuestionBank: React.FC = () => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [themeFilter, setThemeFilter] = useState('all');
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'table'
  
  // Fetch categories and themes
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
  
  // Fetch questions
  const { questions, loading } = useTracker(() => {
    const handle = Meteor.subscribe('questions.all');
    return {
      loading: !handle.ready(),
      questions: Questions.find({}).fetch()
    };
  }, []);
  
  // Prepare data for charts
  const questionsByCategory = React.useMemo(() => {
    if (!questions || !wpsCategories) return [];
    
    const categoryCounts: Record<string, number> = {};
    
    // Initialize with 0 for all categories
    wpsCategories.forEach((cat: any) => {
      categoryCounts[cat._id] = 0;
    });
    
    // Count questions by category
    questions.forEach((q: any) => {
      const latestVersion = getLatestVersion(q);
      if (!latestVersion) return;
      
      const categoryId = latestVersion.category;
      if (categoryId) {
        categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
      }
    });
    
    // Convert to chart data format
    return Object.entries(categoryCounts).map(([id, count]) => ({
      name: wpsCategoryMap[id] || id,
      value: count,
      id
    }));
  }, [questions, wpsCategories, wpsCategoryMap]);
  
  const questionsByTheme = React.useMemo(() => {
    if (!questions || !surveyThemes) return [];
    
    const themeCounts: Record<string, number> = {};
    let unassignedCount = 0;
    
    // Count questions by theme
    questions.forEach((q: any) => {
      const latestVersion = getLatestVersion(q);
      if (!latestVersion) return;
      
      if (latestVersion.surveyThemes && latestVersion.surveyThemes.length > 0) {
        latestVersion.surveyThemes.forEach((themeId: string) => {
          themeCounts[themeId] = (themeCounts[themeId] || 0) + 1;
        });
      } else {
        unassignedCount++;
      }
    });
    
    // Convert to chart data format
    const result = Object.entries(themeCounts).map(([id, count]) => ({
      name: surveyThemeMap[id] || id,
      value: count,
      id
    }));
    
    // Add unassigned if there are any
    if (unassignedCount > 0) {
      result.push({
        name: 'Unassigned',
        value: unassignedCount,
        id: 'unassigned'
      });
    }
    
    return result;
  }, [questions, surveyThemes, surveyThemeMap]);
  
  const questionsByType = React.useMemo(() => {
    if (!questions) return [];
    
    const typeCounts: Record<string, number> = {};
    
    // Count questions by response type
    questions.forEach((q: any) => {
      const latestVersion = getLatestVersion(q);
      if (!latestVersion) return;
      
      const responseType = latestVersion.responseType || 'unknown';
      typeCounts[responseType] = (typeCounts[responseType] || 0) + 1;
    });
    
    // Convert to chart data format
    return Object.entries(typeCounts).map(([type, count]) => ({
      name: type.replace('_', ' ').replace(/\b\w/g, (l) => l.toUpperCase()),
      value: count,
      id: type
    }));
  }, [questions]);
  
  const questionTrends = React.useMemo(() => {
    if (!questions) return [];
    
    // Group questions by month
    const monthlyData: Record<string, number> = {};
    
    questions.forEach((q: any) => {
      if (!q.createdAt) return;
      
      const date = new Date(q.createdAt);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1;
    });
    
    // Sort by month and convert to chart data
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, count]) => {
        const [year, monthNum] = month.split('-');
        return {
          name: `${monthNum}/${year.slice(2)}`,
          count
        };
      });
  }, [questions]);
  
  // Calculate KPI metrics
  const totalQuestions = questions ? questions.length : 0;
  
  const activeQuestions = React.useMemo(() => {
    if (!questions) return 0;
    
    return questions.filter((q: any) => {
      const latestVersion = getLatestVersion(q);
      return latestVersion && latestVersion.isActive !== false;
    }).length;
  }, [questions]);
  
  const reusableQuestions = React.useMemo(() => {
    if (!questions) return 0;
    
    return questions.filter((q: any) => {
      const latestVersion = getLatestVersion(q);
      return latestVersion && latestVersion.isReusable === true;
    }).length;
  }, [questions]);
  
  const incompleteQuestions = React.useMemo(() => {
    if (!questions) return 0;
    
    return questions.filter((q: any) => {
      const latestVersion = getLatestVersion(q);
      if (!latestVersion) return false;
      
      // Check for missing required fields
      return !latestVersion.questionText || 
             !latestVersion.responseType || 
             !latestVersion.category;
    }).length;
  }, [questions]);
  
  // Table data
  const tableData = React.useMemo(() => {
    if (!questions) return [];
    
    return questions.map((q: any) => {
      const latestVersion = getLatestVersion(q);
      if (!latestVersion) return null;
      
      return {
        id: q._id,
        text: latestVersion.questionText || 'No text',
        type: latestVersion.responseType || 'unknown',
        category: wpsCategoryMap[latestVersion.category] || 'Uncategorized',
        themes: latestVersion.surveyThemes ? 
          latestVersion.surveyThemes.map((id: string) => surveyThemeMap[id] || id) : 
          [],
        isActive: latestVersion.isActive !== false,
        isReusable: latestVersion.isReusable === true,
        createdAt: q.createdAt ? new Date(q.createdAt).toLocaleDateString() : 'Unknown'
      };
    }).filter(Boolean);
  }, [questions, wpsCategoryMap, surveyThemeMap]);
  
  return (
    <AdminLayout>
      <DashboardBg>
        <Container>
          <TitleRow>
            <Title>Question Bank Dashboard</Title>
            <ViewToggle>
              <ToggleButton 
                active={view === 'dashboard'} 
                onClick={() => setView('dashboard')}
              >
                <FaChartBar size={14} /> Dashboard
              </ToggleButton>
              <ToggleButton 
                active={view === 'table'} 
                onClick={() => setView('table')}
              >
                <FaTable size={14} /> Table View
                {incompleteQuestions > 0 && (
                  <AlertBadge>{incompleteQuestions}</AlertBadge>
                )}
              </ToggleButton>
            </ViewToggle>
          </TitleRow>
          
          <FilterBar>
            <FilterGroup>
              <FilterLabel>Time Period:</FilterLabel>
              <FilterSelect 
                value={timeFilter}
                onChange={(e) => setTimeFilter(e.target.value)}
              >
                <option value="all">All Time</option>
                <option value="month">Last Month</option>
                <option value="quarter">Last Quarter</option>
                <option value="year">Last Year</option>
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup style={{ marginLeft: 16 }}>
              <FilterLabel>Category:</FilterLabel>
              <FilterSelect 
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
              >
                <option value="all">All Categories</option>
                {wpsCategories.map((cat: any) => (
                  <option key={cat._id} value={cat._id}>{cat.name}</option>
                ))}
              </FilterSelect>
            </FilterGroup>
            
            <FilterGroup style={{ marginLeft: 16 }}>
              <FilterLabel>Theme:</FilterLabel>
              <FilterSelect 
                value={themeFilter}
                onChange={(e) => setThemeFilter(e.target.value)}
              >
                <option value="all">All Themes</option>
                {surveyThemes.map((theme: any) => (
                  <option key={theme._id} value={theme._id}>{theme.name}</option>
                ))}
              </FilterSelect>
            </FilterGroup>
          </FilterBar>
          
          {view === 'dashboard' && (
            <>
              <DashboardGrid>
                <KPICard>
                  <FaListAlt size={24} color="#552a47" />
                  <KPIValue>{totalQuestions}</KPIValue>
                  <KPILabel>Total Questions</KPILabel>
                  <KPITrend className="neutral">
                    {questionTrends.length > 1 && (
                      <>
                        {questionTrends[questionTrends.length - 1].count - 
                         questionTrends[questionTrends.length - 2].count > 0 ? '+' : ''}
                        {questionTrends.length > 1 ? 
                          questionTrends[questionTrends.length - 1].count - 
                          questionTrends[questionTrends.length - 2].count : 0} from last month
                      </>
                    )}
                  </KPITrend>
                </KPICard>
                
                <KPICard>
                  <FaThLarge size={24} color="#552a47" />
                  <KPIValue>{wpsCategories.length}</KPIValue>
                  <KPILabel>WPS Categories</KPILabel>
                  <KPITrend className="neutral">
                    Used in {questionsByCategory.filter(c => c.value > 0).length} categories
                  </KPITrend>
                </KPICard>
                
                <KPICard>
                  <FaTag size={24} color="#552a47" />
                  <KPIValue>{surveyThemes.length}</KPIValue>
                  <KPILabel>Survey Themes</KPILabel>
                  <KPITrend className="neutral">
                    Used in {questionsByTheme.filter(t => t.value > 0 && t.id !== 'unassigned').length} themes
                  </KPITrend>
                </KPICard>
                
                <KPICard>
                  <FaExclamationTriangle size={24} color="#f44336" />
                  <KPIValue>{incompleteQuestions}</KPIValue>
                  <KPILabel>Incomplete Questions</KPILabel>
                  <KPITrend className={incompleteQuestions > 0 ? 'negative' : 'positive'}>
                    {incompleteQuestions > 0 ? 'Needs attention' : 'All questions complete'}
                  </KPITrend>
                </KPICard>
              </DashboardGrid>
              
              <DashboardGrid>
                <ChartCard className="half">
                  <ChartTitle>Questions by WPS Category</ChartTitle>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={questionsByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {questionsByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
                
                <ChartCard className="half">
                  <ChartTitle>Questions by Survey Theme</ChartTitle>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={questionsByTheme}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {questionsByTheme.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
              </DashboardGrid>
              
              <DashboardGrid>
                <ChartCard className="half">
                  <ChartTitle>Questions by Answer Type</ChartTitle>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={questionsByType}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="value" fill="#552a47">
                        {questionsByType.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
                
                <ChartCard className="half">
                  <ChartTitle>Question Creation Trend</ChartTitle>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={questionTrends}>
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Line type="monotone" dataKey="count" stroke="#552a47" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </ChartCard>
              </DashboardGrid>
            </>
          )}
          
          {view === 'table' && (
            <TableCard>
              <ChartTitle>All Questions</ChartTitle>
              <Table>
                <thead>
                  <tr>
                    <th>Question Text</th>
                    <th>Type</th>
                    <th>Category</th>
                    <th>Themes</th>
                    <th>Status</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row: any) => (
                    <tr key={row.id}>
                      <td>{row.text.length > 50 ? `${row.text.substring(0, 50)}...` : row.text}</td>
                      <td>{row.type}</td>
                      <td>{row.category}</td>
                      <td>
                        {row.themes.length > 0 ? (
                          row.themes.map((theme: string, i: number) => (
                            <Tag key={i}>{theme}</Tag>
                          ))
                        ) : (
                          <span style={{ color: '#999', fontStyle: 'italic' }}>None</span>
                        )}
                      </td>
                      <td>
                        {row.isActive ? (
                          <Tag style={{ background: '#e8f5e9', color: '#2e7d32' }}>Active</Tag>
                        ) : (
                          <Tag style={{ background: '#ffebee', color: '#c62828' }}>Inactive</Tag>
                        )}
                        {row.isReusable && (
                          <Tag style={{ background: '#e3f2fd', color: '#1565c0' }}>Reusable</Tag>
                        )}
                      </td>
                      <td>{row.createdAt}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/admin/questions/builder/${row.id}`)}
                          style={{
                            background: '#552a47',
                            color: 'white',
                            border: 'none',
                            borderRadius: 4,
                            padding: '4px 8px',
                            cursor: 'pointer',
                            fontSize: '0.8rem'
                          }}
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </TableCard>
          )}
        </Container>
      </DashboardBg>
    </AdminLayout>
  );
};

export default AdminQuestionBank;
