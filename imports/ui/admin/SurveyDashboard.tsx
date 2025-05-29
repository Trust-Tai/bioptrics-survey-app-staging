import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { FaChartBar, FaTable, FaFilter, FaClipboardList, FaUsers, FaFileAlt, FaExclamationTriangle, FaChartPie, FaChartLine, FaPlus, FaEdit, FaTrash, FaEye, FaExternalLinkAlt } from 'react-icons/fa';
import { FiDownload, FiUsers, FiBarChart2 } from 'react-icons/fi';
import { BarChart, Bar, PieChart, Pie, Cell, ResponsiveContainer, XAxis, YAxis, Tooltip, Legend, LineChart, Line, AreaChart, Area } from 'recharts';
import DashboardBg from './DashboardBg';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import { Surveys, SurveyResponses } from '../../features/surveys/api/surveys';
import { SurveyThemes } from '../../features/survey-themes/api/surveyThemes';
import { WPSCategories } from '../../features/wps-framework/api/wpsCategories';

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
  font-size: 0.9rem;
  
  &:hover {
    background: #f9f9f9;
  }
`;

const FiltersPanel = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  padding: 16px;
  margin-bottom: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
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
  padding: 8px;
  border-radius: 4px;
  border: 1px solid #ddd;
  font-size: 0.9rem;
`;

const FilterLabel = styled.div`
  font-size: 0.9rem;
  font-weight: 500;
  color: #666;
`;

const FilterGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const DashboardGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(12, 1fr);
  grid-gap: 24px;
  margin-bottom: 24px;
`;

const SurveyList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 16px;
`;

const SurveyCard = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.05);
  overflow: hidden;
`;

const SurveyHeader = styled.div`
  padding: 12px 16px;
  background: #f7f2f5;
  border-bottom: 1px solid #eee;
  font-weight: 500;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const SurveyType = styled.div`
  font-size: 0.8rem;
  color: #666;
  background: #fff;
  padding: 4px 8px;
  border-radius: 12px;
`;

const SurveyContent = styled.div`
  padding: 16px;
`;

const SurveyTitle = styled.div`
  font-size: 0.95rem;
  margin-bottom: 12px;
  line-height: 1.4;
  font-weight: 500;
`;

const SurveyDescription = styled.div`
  font-size: 0.85rem;
  margin-bottom: 12px;
  line-height: 1.4;
  color: #666;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

const SurveyMeta = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-bottom: 16px;
`;

const MetaTag = styled.div`
  background: #f0f0f0;
  color: #666;
  font-size: 0.8rem;
  padding: 4px 8px;
  border-radius: 12px;
`;

const SurveyStats = styled.div`
  display: flex;
  justify-content: space-between;
  margin-bottom: 16px;
  font-size: 0.85rem;
`;

const StatItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const StatValue = styled.div`
  font-weight: 600;
  color: #552a47;
`;

const StatLabel = styled.div`
  font-size: 0.75rem;
  color: #666;
`;

const SurveyActions = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 8px;
`;

const ActionButton = styled.button`
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 0.8rem;
  cursor: pointer;
  border: none;
  display: flex;
  align-items: center;
  gap: 4px;
  
  &.preview {
    background: #f0f0f0;
    color: #333;
  }
  
  &.edit {
    background: #552a47;
    color: #fff;
  }
  
  &.delete {
    background: #f44336;
    color: #fff;
  }
  
  &.responses {
    background: #4caf50;
    color: #fff;
  }
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

const ToggleButton = styled.button`
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

// COLORS for charts
const COLORS = [
  '#552a47', '#8e44ad', '#9b59b6', '#3498db', '#2980b9', 
  '#1abc9c', '#16a085', '#27ae60', '#2ecc71', '#f1c40f',
  '#f39c12', '#e67e22', '#d35400', '#e74c3c', '#c0392b'
];

// Analytics section styled components
const AnalyticsSection = styled.div`
  margin-bottom: 32px;
  background: #fff;
  border-radius: 12px;
  padding: 24px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const AnalyticsHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
`;

const AnalyticsTitle = styled.h3`
  font-weight: 700;
  font-size: 20px;
  color: #552a47;
  margin: 0;
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  gap: 20px;
  margin-bottom: 24px;
`;

const AnalyticsCard = styled.div<{ bgColor?: string }>`
  background: ${props => props.bgColor || '#f9f4f7'};
  padding: 20px;
  border-radius: 10px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.05);
`;

const ExportButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  background: #552a47;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: #9a7025;
  }
`;

const SurveyDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [timeFilter, setTimeFilter] = useState('all');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [themeFilter, setThemeFilter] = useState('all');
  const [view, setView] = useState('dashboard'); // 'dashboard' or 'table'
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string | null>(null);
  const [filterTemplate, setFilterTemplate] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [surveyToDelete, setSurveyToDelete] = useState<string | null>(null);
  
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
  
  // Fetch surveys
  const { surveys, loading } = useTracker(() => {
    const handle = Meteor.subscribe('surveys.all');
    return {
      loading: !handle.ready(),
      surveys: Surveys.find({}).fetch()
    };
  }, []);
  
  // Fetch survey responses
  const { responses, responsesLoading } = useTracker(() => {
    const handle = Meteor.subscribe('survey_responses.all');
    return {
      responsesLoading: !handle.ready(),
      responses: SurveyResponses.find({}).fetch()
    };
  }, []);
  
  // Calculate KPI metrics
  const totalSurveys = surveys ? surveys.length : 0;
  
  const publishedSurveys = React.useMemo(() => {
    if (!surveys) return 0;
    return surveys.filter((s: any) => s.published).length;
  }, [surveys]);
  
  const templateSurveys = React.useMemo(() => {
    if (!surveys) return 0;
    return surveys.filter((s: any) => s.isTemplate).length;
  }, [surveys]);
  
  const totalResponses = responses ? responses.length : 0;
  
  const completedResponses = React.useMemo(() => {
    if (!responses) return 0;
    return responses.filter((r: any) => r.completed).length;
  }, [responses]);
  
  const completionRate = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;
  
  // Prepare data for charts
  const surveysByCategory = React.useMemo(() => {
    if (!surveys || !wpsCategories) return [];
    
    const categoryCounts: Record<string, number> = {};
    
    // Count surveys by category
    surveys.forEach((s: any) => {
      if (s.defaultSettings?.categories) {
        s.defaultSettings.categories.forEach((categoryId: string) => {
          categoryCounts[categoryId] = (categoryCounts[categoryId] || 0) + 1;
        });
      }
    });
    
    // Convert to chart data format
    return Object.entries(categoryCounts).map(([id, count]) => ({
      name: wpsCategoryMap[id] || id,
      value: count,
      id
    }));
  }, [surveys, wpsCategories, wpsCategoryMap]);
  
  const surveysByTheme = React.useMemo(() => {
    if (!surveys || !surveyThemes) return [];
    
    const themeCounts: Record<string, number> = {};
    let unassignedCount = 0;
    
    // Count surveys by theme
    surveys.forEach((s: any) => {
      if (s.defaultSettings?.themes && s.defaultSettings.themes.length > 0) {
        s.defaultSettings.themes.forEach((themeId: string) => {
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
  }, [surveys, surveyThemes, surveyThemeMap]);
  
  const responsesByMonth = React.useMemo(() => {
    if (!responses) return [];
    
    // Group responses by month
    const monthlyData: Record<string, number> = {};
    
    responses.forEach((r: any) => {
      if (!r.createdAt) return;
      
      const date = new Date(r.createdAt);
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
  }, [responses]);
  
  const responsesBySurvey = React.useMemo(() => {
    if (!responses || !surveys) return [];
    
    // Count responses by survey
    const surveyCounts: Record<string, number> = {};
    
    responses.forEach((r: any) => {
      if (r.surveyId) {
        surveyCounts[r.surveyId] = (surveyCounts[r.surveyId] || 0) + 1;
      }
    });
    
    // Get survey titles and convert to chart data
    return Object.entries(surveyCounts)
      .map(([surveyId, count]) => {
        const survey = surveys.find((s: any) => s._id === surveyId);
        return {
          name: survey ? survey.title : 'Unknown Survey',
          value: count,
          id: surveyId
        };
      })
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10 surveys by response count
  }, [responses, surveys]);
  
  // Filtered surveys based on search and filters
  const filteredSurveys = React.useMemo(() => {
    if (!surveys) return [];
    
    return surveys.filter((s: any) => {
      // Apply search term filter
      if (searchTerm && !s.title.toLowerCase().includes(searchTerm.toLowerCase())) {
        return false;
      }
      
      // Apply status filter
      if (filterStatus === 'published' && !s.published) {
        return false;
      } else if (filterStatus === 'draft' && s.published) {
        return false;
      }
      
      // Apply template filter
      if (filterTemplate === 'template' && !s.isTemplate) {
        return false;
      } else if (filterTemplate === 'regular' && s.isTemplate) {
        return false;
      }
      
      // Apply category filter
      if (categoryFilter !== 'all' && (!s.defaultSettings?.categories || !s.defaultSettings.categories.includes(categoryFilter))) {
        return false;
      }
      
      // Apply theme filter
      if (themeFilter !== 'all' && (!s.defaultSettings?.themes || !s.defaultSettings.themes.includes(themeFilter))) {
        return false;
      }
      
      return true;
    });
  }, [surveys, searchTerm, filterStatus, filterTemplate, categoryFilter, themeFilter]);
  
  // Handle deleting a survey
  const handleDeleteSurvey = (surveyId: string) => {
    setSurveyToDelete(surveyId);
    setShowDeleteConfirm(true);
  };
  
  const confirmDeleteSurvey = () => {
    if (surveyToDelete) {
      Meteor.call('surveys.delete', surveyToDelete, (error: any) => {
        if (error) {
          console.error('Error deleting survey:', error);
        }
      });
      setShowDeleteConfirm(false);
      setSurveyToDelete(null);
    }
  };
  
  // Table data
  const tableData = React.useMemo(() => {
    if (!surveys) return [];
    
    return filteredSurveys.map((s: any) => {
      const surveyResponses = responses ? responses.filter((r: any) => r.surveyId === s._id) : [];
      const completedSurveyResponses = surveyResponses.filter((r: any) => r.completed);
      const responseRate = surveyResponses.length > 0 ? 
        Math.round((completedSurveyResponses.length / surveyResponses.length) * 100) : 0;
      
      return {
        id: s._id,
        title: s.title || 'Untitled Survey',
        published: s.published,
        isTemplate: s.isTemplate,
        responseCount: surveyResponses.length,
        completionRate: responseRate,
        createdAt: s.createdAt ? new Date(s.createdAt).toLocaleDateString() : 'Unknown',
        themes: s.defaultSettings?.themes ? 
          s.defaultSettings.themes.map((id: string) => surveyThemeMap[id] || id) : 
          [],
        categories: s.defaultSettings?.categories ? 
          s.defaultSettings.categories.map((id: string) => wpsCategoryMap[id] || id) : 
          []
      };
    });
  }, [surveys, responses, surveyThemeMap, wpsCategoryMap]);
  
  return (
    <AdminLayout>
      <DashboardBg>
        <Container>
          <TitleRow>
            <Title>All Surveys</Title>
            <div style={{ display: 'flex', gap: 12 }}>
              <button 
                onClick={() => navigate('/admin/surveys/builder')} 
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
                <FaPlus size={14} /> New Survey
              </button>
              <ViewToggle>
                <button 
                  style={{
                    padding: '8px 16px',
                    background: view === 'dashboard' ? '#552a47' : '#f5f5f5',
                    color: view === 'dashboard' ? '#fff' : '#333',
                    border: 'none',
                    borderRadius: '4px 0 0 4px',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  onClick={() => setView('dashboard')}
                >
                  <FaChartBar size={14} /> Dashboard
                </button>
                <button 
                  style={{
                    padding: '8px 16px',
                    background: view === 'table' ? '#552a47' : '#f5f5f5',
                    color: view === 'table' ? '#fff' : '#333',
                    border: 'none',
                    borderRadius: '0 4px 4px 0',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 4
                  }}
                  onClick={() => setView('table')}
                >
                  <FaTable size={14} /> Table View
                </button>
              </ViewToggle>
            </div>
          </TitleRow>
          
          <SearchFilterRow>
            <SearchInput 
              type="text" 
              placeholder="Search surveys..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <FilterButton onClick={() => setShowFilters(!showFilters)}>
              <FaFilter size={12} /> Filters {showFilters ? '(Hide)' : '(Show)'}
            </FilterButton>
          </SearchFilterRow>
          
          {showFilters && (
            <FiltersPanel>
              <FilterGroup>
                <FilterLabel>Status</FilterLabel>
                <FilterSelect 
                  value={filterStatus || ''}
                  onChange={(e) => setFilterStatus(e.target.value || null)}
                >
                  <option value="">All</option>
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                </FilterSelect>
              </FilterGroup>
              
              <FilterGroup>
                <FilterLabel>Type</FilterLabel>
                <FilterSelect 
                  value={filterTemplate || ''}
                  onChange={(e) => setFilterTemplate(e.target.value || null)}
                >
                  <option value="">All</option>
                  <option value="template">Template</option>
                  <option value="regular">Regular</option>
                </FilterSelect>
              </FilterGroup>
              
              <FilterGroup>
                <FilterLabel>Category</FilterLabel>
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
              
              <FilterGroup>
                <FilterLabel>Theme</FilterLabel>
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
            </FiltersPanel>
          )}
          
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: '0.9rem', color: '#666' }}>
              Showing {filteredSurveys.length} surveys {searchTerm ? `matching "${searchTerm}"` : ''}
            </div>
          </div>
          
          {view === 'dashboard' && (
            <>
              {/* Analytics Overview Section */}
              <AnalyticsSection>
                <AnalyticsHeader>
                  <AnalyticsTitle>Analytics Overview</AnalyticsTitle>
                  <div>
                    <select 
                      style={{ 
                        padding: '6px 12px', 
                        borderRadius: 6, 
                        border: '1px solid #ddd', 
                        fontSize: 14,
                        background: '#f9f9f9'
                      }}
                      onChange={(e) => {
                        // Future implementation: Period selection for analytics
                      }}
                    >
                      <option value="all">All Time</option>
                      <option value="30days">Last 30 Days</option>
                      <option value="90days">Last 90 Days</option>
                      <option value="year">Last Year</option>
                    </select>
                  </div>
                </AnalyticsHeader>
                
                <AnalyticsGrid>
                  {/* Total Surveys Card */}
                  <AnalyticsCard bgColor="#f9f4f7">
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 6 }}>Total Surveys</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#552a47' }}>{surveys.length}</div>
                    <div style={{ fontSize: 13, color: '#777', marginTop: 8 }}>
                      {surveys.filter(s => s.published).length} published
                    </div>
                  </AnalyticsCard>
                  
                  {/* Total Responses Card */}
                  <AnalyticsCard bgColor="#f0f7fa">
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 6 }}>Total Responses</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#3776a8' }}>{responses.length}</div>
                    <div style={{ fontSize: 13, color: '#777', marginTop: 8 }}>
                      {surveys.length > 0 ? (responses.length / surveys.length).toFixed(1) : 0} avg per survey
                    </div>
                  </AnalyticsCard>
                  
                  {/* Response Rate Card */}
                  <AnalyticsCard bgColor="#f7f9f0">
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 6 }}>Response Rate</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#6a994e' }}>
                      {surveys.some(s => s.published) ? 
                        Math.round((responses.length / surveys.filter(s => s.published).length) * 100) + '%' : 
                        'N/A'}
                    </div>
                    <div style={{ fontSize: 13, color: '#777', marginTop: 8 }}>
                      Based on published surveys
                    </div>
                  </AnalyticsCard>
                  
                  {/* Recent Activity Card */}
                  <AnalyticsCard bgColor="#fff5f0">
                    <div style={{ fontSize: 14, color: '#666', marginBottom: 6 }}>Recent Activity</div>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#e67e22' }}>
                      {responses.filter(r => {
                        const today = new Date();
                        const responseDate = new Date(r.createdAt || r.startTime);
                        const diffTime = Math.abs(today.getTime() - responseDate.getTime());
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        return diffDays <= 7;
                      }).length}
                    </div>
                    <div style={{ fontSize: 13, color: '#777', marginTop: 8 }}>
                      Responses in last 7 days
                    </div>
                  </AnalyticsCard>
                </AnalyticsGrid>
                
                {/* Response Trend Chart */}
                <div style={{ marginTop: 20 }}>
                  <h4 style={{ fontWeight: 600, fontSize: 16, marginBottom: 12 }}>Response Trend</h4>
                  <div style={{ height: 200, background: '#f9f9f9', borderRadius: 8, padding: 16 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={responsesByMonth}>
                        <defs>
                          <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#552a47" stopOpacity={0.8}/>
                            <stop offset="95%" stopColor="#552a47" stopOpacity={0.1}/>
                          </linearGradient>
                        </defs>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Area type="monotone" dataKey="count" stroke="#552a47" fillOpacity={1} fill="url(#colorCount)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </AnalyticsSection>
              
              <DashboardGrid>
                <KPICard>
                  <FaClipboardList size={24} color="#552a47" />
                  <KPIValue>{totalSurveys}</KPIValue>
                  <KPILabel>Total Surveys</KPILabel>
                  <KPITrend className="neutral">
                    {publishedSurveys} published
                  </KPITrend>
                </KPICard>
                
                <KPICard>
                  <FaFileAlt size={24} color="#552a47" />
                  <KPIValue>{templateSurveys}</KPIValue>
                  <KPILabel>Survey Templates</KPILabel>
                  <KPITrend className="neutral">
                    {Math.round((templateSurveys / totalSurveys) * 100) || 0}% of all surveys
                  </KPITrend>
                </KPICard>
                
                <KPICard>
                  <FaUsers size={24} color="#552a47" />
                  <KPIValue>{totalResponses}</KPIValue>
                  <KPILabel>Total Responses</KPILabel>
                  <KPITrend className="neutral">
                    {responsesByMonth.length > 1 && (
                      <>
                        {responsesByMonth[responsesByMonth.length - 1].count - 
                         responsesByMonth[responsesByMonth.length - 2].count > 0 ? '+' : ''}
                        {responsesByMonth.length > 1 ? 
                          responsesByMonth[responsesByMonth.length - 1].count - 
                          responsesByMonth[responsesByMonth.length - 2].count : 0} from last month
                      </>
                    )}
                  </KPITrend>
                </KPICard>
                
                <KPICard>
                  <FaExclamationTriangle size={24} color="#552a47" />
                  <KPIValue>{completionRate}%</KPIValue>
                  <KPILabel>Completion Rate</KPILabel>
                  <KPITrend className={completionRate > 75 ? 'positive' : completionRate > 50 ? 'neutral' : 'negative'}>
                    {completionRate > 75 ? 'Excellent' : completionRate > 50 ? 'Good' : 'Needs improvement'}
                  </KPITrend>
                </KPICard>
              </DashboardGrid>
              
              <DashboardGrid>
                <ChartCard className="half">
                  <ChartTitle>Surveys by WPS Category</ChartTitle>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={surveysByCategory}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {surveysByCategory.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </ChartCard>
                
                <ChartCard className="half">
                  <ChartTitle>Surveys by Theme</ChartTitle>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={surveysByTheme}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        nameKey="name"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {surveysByTheme.map((entry, index) => (
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
                  <ChartTitle>Top 10 Surveys by Response Count</ChartTitle>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={responsesBySurvey} layout="vertical">
                      <XAxis type="number" />
                      <YAxis type="category" dataKey="name" width={150} tick={{ fontSize: 12 }} />
                      <Tooltip />
                      <Bar dataKey="value" fill="#552a47">
                        {responsesBySurvey.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Bar>
                    </BarChart>
                  </ResponsiveContainer>
                </ChartCard>
                
                <ChartCard className="half">
                  <ChartTitle>Response Trend Over Time</ChartTitle>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={responsesByMonth}>
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
              <ChartTitle>All Surveys</ChartTitle>
              <Table>
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Status</th>
                    <th>Responses</th>
                    <th>Completion Rate</th>
                    <th>Categories</th>
                    <th>Themes</th>
                    <th>Created</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.map((row: any) => (
                    <tr key={row.id}>
                      <td>{row.title.length > 30 ? `${row.title.substring(0, 30)}...` : row.title}</td>
                      <td>
                        {row.published ? (
                          <Tag style={{ background: '#e8f5e9', color: '#2e7d32' }}>Published</Tag>
                        ) : (
                          <Tag style={{ background: '#ffebee', color: '#c62828' }}>Draft</Tag>
                        )}
                        {row.isTemplate && (
                          <Tag style={{ background: '#e3f2fd', color: '#1565c0' }}>Template</Tag>
                        )}
                      </td>
                      <td>{row.responseCount}</td>
                      <td>
                        <div style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          gap: 8 
                        }}>
                          <div style={{ 
                            width: 50, 
                            height: 8, 
                            background: '#eee', 
                            borderRadius: 4, 
                            overflow: 'hidden' 
                          }}>
                            <div style={{ 
                              width: `${row.completionRate}%`, 
                              height: '100%', 
                              background: row.completionRate > 75 ? '#4caf50' : row.completionRate > 50 ? '#ff9800' : '#f44336',
                              borderRadius: 4
                            }} />
                          </div>
                          <span>{row.completionRate}%</span>
                        </div>
                      </td>
                      <td>
                        {row.categories.length > 0 ? (
                          row.categories.map((cat: string, i: number) => (
                            <Tag key={i}>{cat}</Tag>
                          ))
                        ) : (
                          <span style={{ color: '#999', fontStyle: 'italic' }}>None</span>
                        )}
                      </td>
                      <td>
                        {row.themes.length > 0 ? (
                          row.themes.map((theme: string, i: number) => (
                            <Tag key={i}>{theme}</Tag>
                          ))
                        ) : (
                          <span style={{ color: '#999', fontStyle: 'italic' }}>None</span>
                        )}
                      </td>
                      <td>{row.createdAt}</td>
                      <td>
                        <button
                          onClick={() => navigate(`/admin/surveys/${row.id}`)}
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
                          View
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

// Format time in seconds to mm:ss format
const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

export default SurveyDashboard;
