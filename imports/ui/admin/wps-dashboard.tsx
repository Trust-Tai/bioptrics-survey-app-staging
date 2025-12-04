import React, { useState } from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import { 
  Plus,
  Users,
  TrendingUp,
  AlertCircle,
  Search
} from 'lucide-react';
import AdminLayout from '../../layouts/AdminLayout/AdminLayout';
import { useDynamicColors } from './home/theme/useDynamicColors';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Surveys } from '../../features/surveys/api/surveys';
import SurveyListView from './components/SurveyListView';
import ViewToggle from './components/ViewToggle';

// ============ STYLED COMPONENTS ============
const PageContainer = styled.div<{ bgColor: string }>`
  min-height: 100vh;
  background: ${props => props.bgColor};
`;

const Header = styled.div<{ primaryColor: string }>`
  background: linear-gradient(135deg, ${props => props.primaryColor} 0%, ${props => props.primaryColor}dd 100%);
  border-radius: 16px;
  padding: 32px 24px;
  margin: 24px;
  position: relative;
  overflow: hidden;
  
  &::before {
    content: '';
    position: absolute;
    top: -20px;
    right: -20px;
    width: 140px;
    height: 140px;
    background: radial-gradient(circle at center, rgba(255, 255, 255, 0.15) 0%, rgba(255, 255, 255, 0) 70%);
    border-radius: 50%;
  }
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  position: relative;
  z-index: 1;
  
  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 20px;
  }
`;

const HeaderText = styled.div`
  color: white;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  color: white;
  margin: 0 0 8px 0;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const Subtitle = styled.p`
  font-size: 16px;
  color: white;
  margin: 0;
  opacity: 0.9;
  font-weight: 400;
`;

const CreateButton = styled.button`
  background: rgba(255, 255, 255, 0.2);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.3);
  border-radius: 8px;
  padding: 12px 20px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  backdrop-filter: blur(10px);
  
  &:hover {
    background: rgba(255, 255, 255, 0.3);
    border-color: rgba(255, 255, 255, 0.5);
  }
`;

const ContentWrapper = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 24px;
  margin-bottom: 40px;
  
  @media (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
  
  @media (max-width: 640px) {
    grid-template-columns: 1fr;
  }
`;

const StatCard = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 24px;
  display: flex;
  align-items: center;
  gap: 16px;
  transition: all 0.2s;
  
  &:hover {
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  }
`;

const StatIconWrapper = styled.div<{ bgColor?: string }>`
  width: 48px;
  height: 48px;
  background: ${props => props.bgColor || '#f5f7f8'};
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const StatContent = styled.div`
  flex: 1;
`;

const StatNumber = styled.div<{ color?: string }>`
  font-size: 28px;
  font-weight: 700;
  color: ${props => props.color || '#2c3e50'};
  line-height: 1;
  margin-bottom: 4px;
`;

const StatLabel = styled.div<{ color: string }>`
  font-size: 13px;
  color: ${props => props.color};
  font-weight: 600;
  margin-bottom: 4px;
`;

const StatSubtext = styled.div<{ color?: string }>`
  font-size: 12px;
  color: ${props => props.color || '#6c757d'};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const Section = styled.div`
  margin-bottom: 40px;
`;

const SectionHeader = styled.div`
  margin-bottom: 24px;
`;

const SectionTitle = styled.h2<{ color: string }>`
  font-size: 20px;
  font-weight: 700;
  color: ${props => props.color};
  margin: 0 0 4px 0;
`;

const SectionSubtitle = styled.p<{ color: string }>`
  font-size: 14px;
  color: ${props => props.color};
  margin: 0;
`;

const EmptyState = styled.div`
  background: white;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  padding: 64px 32px;
  text-align: center;
`;

const EmptyIcon = styled.div<{ bgColor: string; color: string }>`
  width: 64px;
  height: 64px;
  background: ${props => props.bgColor};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 16px;
  color: ${props => props.color};
`;

const EmptyMessage = styled.div<{ color: string }>`
  font-size: 16px;
  font-weight: 600;
  color: ${props => props.color};
  margin-bottom: 24px;
`;

const EmptyButton = styled.button<{ bgColor: string; hoverColor: string }>`
  background: ${props => props.bgColor};
  color: white;
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: ${props => props.hoverColor};
  }
`;

const SearchContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  gap: 16px;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  max-width: 280px;
  flex: 1;
`;

const SearchInput = styled.input`
  height: 44px;
  font-size: 16px;
  padding: 0 16px 0 42px;
  border-radius: 8px;
  border: 1.5px solid #e5e7eb;
  width: 100%;
  outline: none;
  background: white;
  
  &:focus {
    border-color: ${props => props.theme?.primaryColor || '#ff9800'};
    box-shadow: 0 0 0 2px rgba(255, 152, 0, 0.2);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const SearchIcon = styled(Search)`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: #9ca3af;
  opacity: 0.6;
`;

const Notification = styled.div<{ type: 'success' | 'error' }>`
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.type === 'success' ? '#4CAF50' : '#f44336'};
  color: #fff;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  z-index: 2000;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.2);
  display: flex;
  align-items: center;
  gap: 16px;
`;

const NotificationCloseButton = styled.button`
  background: none;
  border: none;
  color: #fff;
  font-weight: 700;
  font-size: 18px;
  cursor: pointer;
  margin-left: auto;
`;

// ============ MAIN COMPONENT ============
const WPSDashboard: React.FC = () => {
  const navigate = useNavigate();
  const colors = useDynamicColors();
  
  // State management for WPS courses
  const [view, setView] = useState<'grid' | 'list'>('list');
  const [search, setSearch] = useState('');
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [confirmDelete, setConfirmDelete] = useState<{ _id: string; title: string } | null>(null);
  const [confirmPermanentDelete, setConfirmPermanentDelete] = useState<{ _id: string; title: string } | null>(null);

  const handleCreateWPSCheck = () => {
    navigate('/admin/marketplace/wps-builder');
  };

  // Fetch imported surveys (WPS courses)
  const { surveys, loading } = useTracker(() => {
    const handle = Meteor.subscribe('surveys.ownedAndCollaborated', {
      limit: 100,
      skip: 0,
      fields: {
        _id: 1,
        title: 1,
        description: 1,
        published: 1,
        status: 1,
        createdBy: 1,
        createdAt: 1,
        updatedAt: 1,
        defaultSettings: 1,
        collaborators: 1,
        scheduledFor: 1,
        selectedTags: 1,
        importedFrom: 1,
        creationSource: 1
      }
    });
    
    // Filter only imported surveys for WPS courses
    const data = Surveys.find(
      { creationSource: "imported" },
      { sort: { updatedAt: -1 } }
    ).fetch();
    
    return {
      loading: !handle.ready(),
      surveys: data
    };
  }, []);

  // Action handlers (reused from AllSurveys)
  const onEdit = (id: string) => {
    navigate(`/admin/surveys/builder/${id}`);
  };

  const onViewResponses = (id: string, title: string) => {
    navigate(`/admin/surveys/builder/${id}?tab=analytics`);
  };

  const onShare = (id: string, title: string) => {
    console.log('Share WPS course:', id, title);
    setNotification({ type: 'success', message: `Sharing options for "${title}" will be available soon` });
  };

  const onDelete = (id: string, title: string) => {
    setConfirmDelete({ _id: id, title });
  };

  const onPermanentDelete = (id: string, title: string) => {
    setConfirmPermanentDelete({ _id: id, title });
  };

  const handleConfirmDelete = async () => {
    if (!confirmDelete) return;
    
    try {
      await Meteor.callAsync('surveys.remove', confirmDelete._id);
      setNotification({ type: 'success', message: `"${confirmDelete.title}" has been deleted successfully` });
    } catch (err: any) {
      setNotification({ type: 'error', message: `Failed to delete "${confirmDelete.title}": ${err.reason || err.message || 'Unknown error'}` });
    }
    setConfirmDelete(null);
  };

  const handleConfirmPermanentDelete = async () => {
    if (!confirmPermanentDelete) return;
    
    try {
      await Meteor.callAsync('surveys.removePermanently', confirmPermanentDelete._id);
      setNotification({ type: 'success', message: `"${confirmPermanentDelete.title}" has been permanently deleted` });
    } catch (err: any) {
      setNotification({ type: 'error', message: `Failed to permanently delete "${confirmPermanentDelete.title}": ${err.reason || err.message || 'Unknown error'}` });
    }
    setConfirmPermanentDelete(null);
  };

  const onCopyLink = (id: string) => {
    Meteor.call('surveys.generateEncryptedToken', id, (err: Meteor.Error | null, token: string) => {
      if (err || !token) {
        setNotification({ type: 'error', message: 'Failed to generate course link' });
        return;
      }
      
      const url = `${window.location.origin}/public/${token}`;
      navigator.clipboard.writeText(url)
        .then(() => {
          setNotification({ type: 'success', message: 'Course link copied to clipboard!' });
        })
        .catch(() => {
          setNotification({ type: 'error', message: 'Failed to copy link' });
        });
    });
  };

  const onPreview = (id: string, isPublic?: boolean) => {
    if (isPublic) {
      Meteor.call('surveys.generateEncryptedToken', id, (err: Meteor.Error | null, token: string) => {
        if (!err && token) {
          window.open(`/public/${token}`, '_blank');
        }
      });
    } else {
      // For preview mode
      Meteor.call('surveys.get', id, (err: Meteor.Error | null, surveyData: any) => {
        if (err) {
          setNotification({ type: 'error', message: 'Failed to prepare course preview' });
          return;
        }
        
        Meteor.call('surveys.generateEncryptedToken', id, (tokenErr: Meteor.Error | null, token: string) => {
          if (tokenErr || !token) {
            setNotification({ type: 'error', message: 'Failed to generate preview URL' });
            return;
          }
          
          try {
            localStorage.setItem(`survey-preview-${token}`, JSON.stringify(surveyData));
            window.open(`/public/${token}?status=preview`, '_blank');
          } catch (saveErr) {
            setNotification({ type: 'error', message: 'Failed to prepare course preview' });
          }
        });
      });
    }
  };

  // Filter surveys based on search
  const filteredSurveys = surveys.filter(survey => 
    search === '' || 
    survey.title.toLowerCase().includes(search.toLowerCase()) ||
    survey.description?.toLowerCase().includes(search.toLowerCase())
  );

  // Calculate light background color for stat icon (15% opacity)
  const lightOrangeBg = `${colors.orange}26`; // 26 = 15% in hex

  return (
    <AdminLayout>
      <PageContainer bgColor={colors.white}>
        <Header primaryColor={colors.orange}>
          <HeaderContent>
            <HeaderText>
              <Title>Whole Person Safety (WPS) Check</Title>
              <Subtitle>Monitor and improve holistic safety across your organization</Subtitle>
            </HeaderText>
            <CreateButton onClick={handleCreateWPSCheck}>
              <Plus size={18} />
              Create WPS Check
            </CreateButton>
          </HeaderContent>
        </Header>

        <ContentWrapper>
          {/* Statistics Cards */}
          <StatsGrid>
            <StatCard>
              <StatIconWrapper bgColor={lightOrangeBg}>
                <Users size={24} color={colors.orange} />
              </StatIconWrapper>
              <StatContent>
                <StatNumber>2,847</StatNumber>
                <StatLabel color={colors.textDark}>Total Participants</StatLabel>
                <StatSubtext>Across all checks</StatSubtext>
              </StatContent>
            </StatCard>

            <StatCard>
              <StatIconWrapper bgColor="#e8f5e9">
                <TrendingUp size={24} color="#4caf50" />
              </StatIconWrapper>
              <StatContent>
                <StatNumber color="#4caf50">78%</StatNumber>
                <StatLabel color={colors.textDark}>Average Safety Score</StatLabel>
                <StatSubtext color="#4caf50">+5% from last quarter</StatSubtext>
              </StatContent>
            </StatCard>

            <StatCard>
              <StatIconWrapper bgColor="#fff3e0">
                <AlertCircle size={24} color="#ff9800" />
              </StatIconWrapper>
              <StatContent>
                <StatNumber color="#ff9800">3</StatNumber>
                <StatLabel color={colors.textDark}>Areas Needing Attention</StatLabel>
                <StatSubtext>Departments flagged</StatSubtext>
              </StatContent>
            </StatCard>
          </StatsGrid>

          {/* WPS Courses Section */}
          <Section>
            <SectionHeader>
              <SectionTitle color={colors.textDark}>Available WPS Courses</SectionTitle>
              <SectionSubtitle color={colors.textMedium}>
                Imported safety training courses and assessments
              </SectionSubtitle>
            </SectionHeader>

            {/* Search and View Toggle */}
            <SearchContainer>
              <SearchInputWrapper>
                <SearchIcon size={16} />
                <SearchInput
                  type="text"
                  placeholder="Search courses..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </SearchInputWrapper>
              {/* <ViewToggle view={view} onViewChange={setView} /> */}
            </SearchContainer>

            {/* Course List */}
            {loading ? (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <div style={{ 
                  width: '40px', 
                  height: '40px', 
                  border: '4px solid #e5e7eb', 
                  borderTopColor: colors.orange, 
                  borderRadius: '50%', 
                  animation: 'spin 1s linear infinite',
                  margin: '0 auto'
                }}></div>
                <style>{`
                  @keyframes spin {
                    0% { transform: rotate(0deg); }
                    100% { transform: rotate(360deg); }
                  }
                `}</style>
              </div>
            ) : surveys.length === 0 ? (
              <EmptyState>
                <EmptyIcon bgColor={colors.grayLight} color={colors.textMedium}>
                  <Users size={32} />
                </EmptyIcon>
              <EmptyMessage color={colors.textDark}>No WPS checks yet</EmptyMessage>
                <EmptyButton 
                  bgColor={colors.orange}
                  hoverColor={colors.hover.orange}
                onClick={handleCreateWPSCheck}
                >
                  <Plus size={18} />
                Create Your First WPS Check
                </EmptyButton>
              </EmptyState>
            ) : (
              <SurveyListView 
                surveys={filteredSurveys}
                loading={loading}
                onEdit={onEdit}
                onDelete={onDelete}
                onPermanentDelete={onPermanentDelete}
                onPreview={onPreview}
                onViewResponses={onViewResponses}
                onCopyLink={onCopyLink}
                onShare={onShare}
              />
            )}
          </Section>
        </ContentWrapper>
      </PageContainer>
      
      {/* Delete Confirmation Modal */}
      {confirmDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#1f2937' }}>Delete WPS Course</h3>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280' }}>
              Are you sure you want to delete "<strong>{confirmDelete.title}</strong>"? This action can be undone later.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmDelete(null)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#ef4444',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Permanent Delete Confirmation Modal */}
      {confirmPermanentDelete && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            background: 'white',
            borderRadius: '12px',
            padding: '24px',
            maxWidth: '400px',
            width: '90%',
            boxShadow: '0 10px 25px rgba(0, 0, 0, 0.2)'
          }}>
            <h3 style={{ margin: '0 0 16px 0', color: '#dc2626' }}>Permanently Delete WPS Course</h3>
            <p style={{ margin: '0 0 24px 0', color: '#6b7280' }}>
              Are you sure you want to <strong>permanently delete</strong> "<strong>{confirmPermanentDelete.title}</strong>"? 
              This action <strong>cannot be undone</strong> and all data will be lost forever.
            </p>
            <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
              <button
                onClick={() => setConfirmPermanentDelete(null)}
                style={{
                  padding: '8px 16px',
                  border: '1px solid #d1d5db',
                  borderRadius: '6px',
                  background: 'white',
                  color: '#374151',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmPermanentDelete}
                style={{
                  padding: '8px 16px',
                  border: 'none',
                  borderRadius: '6px',
                  background: '#dc2626',
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                Permanently Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification */}
      {notification && (
        <Notification type={notification.type}>
          <span>{notification.message}</span>
          <NotificationCloseButton
            onClick={() => setNotification(null)}
          >
            ×
          </NotificationCloseButton>
        </Notification>
      )}
    </AdminLayout>
  );
};

export default WPSDashboard;
