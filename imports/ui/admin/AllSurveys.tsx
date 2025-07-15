import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styled from 'styled-components';
import DashboardBg from './DashboardBg';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import { useTracker } from 'meteor/react-meteor-data';
import { Meteor } from 'meteor/meteor';
import { Surveys } from '../../features/surveys/api/surveys';
import { FaEdit, FaTrash, FaEye, FaTasks, FaSearch, FaPlus, FaCopy, FaExternalLinkAlt, FaClock, FaChartBar } from 'react-icons/fa';
import { useOrganization } from '/imports/features/organization/contexts/OrganizationContext';
import TermLabel from '../components/TermLabel';

// Import our new components
import SurveyStatsSummary from './components/SurveyStatsSummary';
import SurveyListView from './components/SurveyListView';
import ViewToggle from './components/ViewToggle';
import SurveyResponsesModal from './components/SurveyResponsesModal';

// Import the survey stats method
import '../../features/surveys/api/surveyStats';

// Styled components for theme support
const Container = styled.div`
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  border-radius: 18px;
  padding: 24px 24px 40px 24px;
  background: transparent;
  box-sizing: border-box;
  overflow: hidden;
`;

const Title = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--color-text);
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 32px;
  margin-bottom: 24px;
  flex-wrap: wrap;
  justify-content: space-between;
`;

const SearchInputWrapper = styled.div`
  position: relative;
  min-width: 280px;
`;

const SearchInput = styled.input`
  height: 44px;
  font-size: 16px;
  padding: 0 16px 0 42px;
  border-radius: 8px;
  border: 1.5px solid var(--color-accent);
  width: 100%;
  color: var(--color-text);
  font-weight: 500;
  outline: none;
  background: var(--color-background);
  
  &:focus {
    border-color: var(--color-primary);
    box-shadow: 0 0 0 2px color-mix(in srgb, var(--color-primary) 20%, transparent);
  }
  
  &::placeholder {
    color: var(--color-accent);
  }
`;

const SearchIcon = styled(FaSearch)`
  position: absolute;
  left: 16px;
  top: 50%;
  transform: translateY(-50%);
  color: var(--color-primary);
  opacity: 0.6;
`;

const ActionsContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  background: var(--color-primary);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  padding: 0 22px;
  font-size: 16px;
  height: 44px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: var(--color-secondary);
  }
`;

const Modal = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background: rgba(0, 0, 0, 0.18);
  z-index: 3000;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const ModalContent = styled.div`
  background: var(--color-background);
  border-radius: 14px;
  box-shadow: 0 2px 18px color-mix(in srgb, var(--color-primary) 20%, transparent);
  padding: 38px 40px 32px 40px;
  min-width: 340px;
  max-width: 90vw;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  position: relative;
`;

const ModalTitle = styled.h1`
  font-size: 28px;
  font-weight: 700;
  margin-bottom: 24px;
  color: var(--color-text);
`;

const ModalText = styled.div`
  font-size: 16px;
  color: var(--color-text);
  margin-bottom: 12px;
  text-align: center;
`;

const ModalButtons = styled.div`
  display: flex;
  gap: 18px;
  margin-top: 18px;
`;

const DeleteButton = styled.button`
  background: var(--color-error);
  color: #fff;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  padding: 8px 28px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: color-mix(in srgb, var(--color-error) 85%, black);
  }
`;

const CancelButton = styled.button`
  background: var(--color-background);
  color: var(--color-primary);
  border: 2px solid var(--color-primary);
  border-radius: 8px;
  font-weight: 700;
  padding: 8px 28px;
  font-size: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
  }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 65px 24px;
  width: 100%;
  max-width: 100%;
  overflow: hidden;
`;

const SurveyCard = styled.div`
  background: var(--color-background);
  border-radius: 16px;
  box-shadow: 0 4px 16px color-mix(in srgb, var(--color-primary) 8%, transparent);
  padding: 22px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  position: relative;
  transition: transform 0.2s, box-shadow 0.2s, border-color 0.2s;
  height: 100%;
  margin: 0;
  border: 1px solid var(--color-accent);
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
  overflow: hidden;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px color-mix(in srgb, var(--color-primary) 12%, transparent);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
  margin-top: 12px;
  margin-bottom: 8px;
`;

const StatusBadge = styled.div<{ published: boolean }>`
  background: ${props => props.published 
    ? 'linear-gradient(135deg, color-mix(in srgb, var(--color-success) 20%, transparent), color-mix(in srgb, var(--color-success) 15%, transparent))' 
    : 'linear-gradient(135deg, color-mix(in srgb, var(--color-error) 20%, transparent), color-mix(in srgb, var(--color-error) 15%, transparent))'};
  color: ${props => props.published ? 'var(--color-success)' : 'var(--color-error)'};
  border-radius: 30px;
  padding: 6px 14px;
  font-size: 13px;
  font-weight: 700;
  letter-spacing: 0.3px;
  display: flex;
  align-items: center;
  gap: 6px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
`;

const StatusDot = styled.div<{ published: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${props => props.published ? 'var(--color-success)' : 'var(--color-error)'};
  margin-right: 2px;
`;

const LastUpdated = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  color: var(--color-accent);
  font-size: 12px;
  font-weight: 500;
`;

const SurveyTitle = styled.h3`
  color: var(--color-text);
  font-weight: 700;
  font-size: 20px;
  letter-spacing: 0.2px;
  cursor: pointer;
  transition: all 0.2s;
  margin: 0 0 14px 0;
  padding-right: 20px;
  border-left: 3px solid var(--color-primary);
  padding-left: 12px;
  line-height: 1.3;
  word-break: break-word;
  overflow-wrap: break-word;
  width: 100%;
  box-sizing: border-box;
  
  &:hover {
    color: var(--color-primary);
  }
`;

const PublicUrlSection = styled.div`
  margin-top: auto;
  padding: 14px 16px;
  border-top: 1px solid var(--color-accent);
  background-color: color-mix(in srgb, var(--color-primary) 5%, transparent);
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  box-sizing: border-box;
  max-width: 100%;
`;

const PublicUrlLabel = styled.span`
  font-weight: 600;
  color: var(--color-primary);
  font-size: 14px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const CopyUrlButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  background: var(--color-primary);
  color: white;
  border: none;
  border-radius: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  cursor: pointer;
  box-shadow: 0 2px 4px color-mix(in srgb, var(--color-primary) 15%, transparent);
  transition: all 0.2s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px color-mix(in srgb, var(--color-primary) 20%, transparent);
    background: var(--color-secondary);
  }
`;

const ActionsRow = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-top: auto;
  padding-top: 16px;
  border-top: 1px solid var(--color-accent);
`;

const ActionButton = styled.button`
  background: color-mix(in srgb, var(--color-primary) 5%, transparent);
  border: none;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  box-shadow: 0 2px 4px color-mix(in srgb, var(--color-primary) 10%, transparent);
  transition: all 0.2s ease;
  
  &:hover {
    background: color-mix(in srgb, var(--color-primary) 10%, transparent);
    transform: translateY(-2px);
    box-shadow: 0 4px 8px color-mix(in srgb, var(--color-primary) 15%, transparent);
  }
  
  &.delete:hover {
    background: color-mix(in srgb, var(--color-error) 10%, transparent);
    box-shadow: 0 4px 8px color-mix(in srgb, var(--color-error) 15%, transparent);
  }
`;

const NoResultsText = styled.div`
  text-align: center;
  padding: 40px 0;
  color: var(--color-accent);
`;

const Notification = styled.div<{ type: 'success' | 'error' }>`
  position: fixed;
  top: 24px;
  left: 50%;
  transform: translateX(-50%);
  background: ${props => props.type === 'success' ? 'var(--color-success)' : 'var(--color-error)'};
  color: #fff;
  padding: 12px 28px;
  border-radius: 8px;
  font-weight: 600;
  font-size: 16px;
  z-index: 2000;
  box-shadow: 0 2px 12px color-mix(in srgb, var(--color-primary) 20%, transparent);
  min-width: 280px;
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
  flex: 1;
`;

const PaginationContainer = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 32px;
`;

const PaginationButton = styled.button<{ active: boolean }>`
  background: ${props => props.active ? 'var(--color-primary)' : 'color-mix(in srgb, var(--color-primary) 10%, transparent)'};
  color: ${props => props.active ? '#fff' : 'var(--color-primary)'};
  border: none;
  border-radius: 6px;
  padding: 6px 16px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  box-shadow: ${props => props.active ? '0 2px 8px color-mix(in srgb, var(--color-primary) 20%, transparent)' : 'none'};
  transition: background 0.2s, color 0.2s;
  
  &:hover {
    background: ${props => props.active ? 'var(--color-secondary)' : 'color-mix(in srgb, var(--color-primary) 15%, transparent)'};
  }
`;

interface SurveyDisplay {
  _id: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  published: boolean;
  createdBy?: string;
  createdByName?: string;
  shareToken?: string;
  sections?: any[];
  questionCount?: number;
  responseStats?: {
    totalResponses: number;
    completedResponses: number;
    completionRate: number;
  };
  scheduledFor?: string;
  potentialRespondents?: number;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]+>/g, '');
}

function truncate(str: string, maxLen: number): string {
  if (str.length <= maxLen) return str;
  return str.slice(0, maxLen) + '...';
}

const SurveyLink: React.FC<{ surveyId: string }> = ({ surveyId }) => {
  const [token, setToken] = useState('');

  useEffect(() => {
    Meteor.call('surveys.generateEncryptedToken', surveyId, (err: Meteor.Error | null, res: string) => {
      if (err) {
        console.error(err);
      } else {
        setToken(res);
      }
    });
  }, [surveyId]);

  return (
    <div style={{ marginTop: 6, wordBreak: 'break-all', fontWeight: 700 }}>
      <a href={`${window.location.origin}/public/${token}`} target="_blank" rel="noopener noreferrer">{`${window.location.origin}/public/${token}`}</a>
    </div>
  );
};

const AllSurveys: React.FC = () => {
  const navigate = useNavigate();
  const { getTerminology } = useOrganization();
  
  // Get the customized survey label
  const surveyLabel = getTerminology('surveyLabel');
  const surveyLabelPlural = `${surveyLabel}s`;
  const [confirmDelete, setConfirmDelete] = useState<{ _id: string; title: string } | null>(null);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  
  // Add view state (grid or list) - default to list view as requested
  const [view, setView] = useState<'grid' | 'list'>('list');

  // State for responses modal
  const [responsesModal, setResponsesModal] = useState<{ isOpen: boolean; surveyId: string; surveyTitle: string }>({ 
    isOpen: false, 
    surveyId: '', 
    surveyTitle: '' 
  });

  const surveys = useTracker(() => {
    Meteor.subscribe('surveys.all');
    return Surveys.find({}, { sort: { updatedAt: -1 } }).fetch().map((s: any) => {
      // Calculate additional fields needed for list view
      const sections = s.sections || [];
      const questionCount = sections.reduce((total: number, section: any) => {
        return total + (section.questions?.length || 0);
      }, 0);
      
      // Calculate response stats
      const responseStats = s.responseStats || {
        totalResponses: 0,
        completedResponses: 0,
        completionRate: 0
      };
      
      return {
        ...s,
        createdAt: s.createdAt instanceof Date ? s.createdAt.toISOString() : String(s.createdAt),
        updatedAt: s.updatedAt instanceof Date ? s.updatedAt.toISOString() : String(s.updatedAt),
        sections,
        questionCount,
        responseStats
      };
    }) as SurveyDisplay[];
  }, []);

  const pageSize = 10;
  const filtered = surveys.filter(s =>
    s.title.toLowerCase().includes(search.toLowerCase()) ||
    s.description.toLowerCase().includes(search.toLowerCase())
  );
  const pageCount = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  useEffect(() => {
    setPage(1);
  }, [search]);

  return (
    <AdminLayout>
      <DashboardBg>
        {/* Delete Confirmation Modal */}
        {confirmDelete && (
          <Modal>
            <ModalContent>
              <ModalTitle>Delete {surveyLabel}</ModalTitle>
              <ModalText>
                Are you sure you want to delete <span style={{ fontWeight: 700 }}>'{confirmDelete.title}'</span>? This action cannot be undone.
              </ModalText>
              <ModalButtons>
                <DeleteButton
                  onClick={async () => {
                    try {
                      await Meteor.callAsync('surveys.remove', confirmDelete._id);
                      setNotification({ type: 'success', message: `${surveyLabel} deleted successfully.` });
                    } catch (err: any) {
                      setNotification({ type: 'error', message: `Error deleting ${surveyLabel.toLowerCase()}: ${err.reason || err.message || 'Unknown error'}` });
                    }
                    setConfirmDelete(null);
                  }}
                >
                  Delete
                </DeleteButton>
                <CancelButton
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </CancelButton>
              </ModalButtons>
            </ModalContent>
          </Modal>
        )}
        <Container>
          <Title>All {surveyLabelPlural}</Title>
          {/* Survey Statistics Summary */}
          <SurveyStatsSummary />
          
          <SearchContainer>
            <SearchInputWrapper>
              <SearchIcon />
              <SearchInput
                type="text"
                placeholder={`Search ${surveyLabelPlural.toLowerCase()}...`}
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </SearchInputWrapper>
            <ActionsContainer>
              {/* View Toggle */}
              <ViewToggle view={view} onViewChange={setView} />
              
              <AddButton
                onClick={() => {
                  window.location.href = '/admin/surveys/builder';
                }}
              >
                <FaPlus style={{ fontSize: 14 }} />
                <span style={{ marginLeft: 6 }}>Add Survey</span>
              </AddButton>
            </ActionsContainer>
          </SearchContainer>
          {/* Notification Bar */}
          {notification && (
            <Notification type={notification.type}>
              <span style={{ flex: 1 }}>{notification.message}</span>
              <NotificationCloseButton
                onClick={() => setNotification(null)}
              >
                ×
              </NotificationCloseButton>
            </Notification>
          )}
          {/* Survey List */}
          {filtered.length === 0 && <NoResultsText>No {surveyLabelPlural.toLowerCase()} found.</NoResultsText>}
          {paginated.length > 0 && (
            view === 'grid' ? (
              <GridContainer>
                {paginated.map((s) => (
                  <SurveyCard
                    key={s._id}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.transform = 'translateY(-4px)';
                      e.currentTarget.style.boxShadow = '0 8px 24px rgba(85, 42, 71, 0.12)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.transform = 'translateY(0)';
                      e.currentTarget.style.boxShadow = '0 3px 12px rgba(85, 42, 71, 0.08)';
                    }}
                  >
                    <CardHeader>
                      <StatusBadge published={s.published}>
                        <StatusDot published={s.published} />
                        {s.published ? 'Published' : 'Draft'}
                      </StatusBadge>
                      <LastUpdated>
                        <FaClock style={{ fontSize: 11 }} />
                        {new Date(s.updatedAt).toLocaleDateString()} at {new Date(s.updatedAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </LastUpdated>
                    </CardHeader>
                    <SurveyTitle 
                      onClick={() => navigate(`/admin/surveys/manage/${s._id}`)}
                      title="Click to manage this survey"
                    >
                      {s.title}
                    </SurveyTitle>
                    {s.shareToken && s.published && (
                      <PublicUrlSection>
                        <PublicUrlLabel>
                          <FaExternalLinkAlt style={{ fontSize: 12 }} /> Public URL
                        </PublicUrlLabel>
                        <CopyUrlButton 
                          onClick={() => {
                            // Use the same server-side token generation as the survey edit page
                            Meteor.call('surveys.generateEncryptedToken', s._id, (err: Meteor.Error | null, token: string) => {
                              if (err) {
                                console.error('Error generating token:', err);
                                setNotification({ type: 'error', message: 'Failed to generate survey URL' });
                              } else {
                                navigator.clipboard.writeText(`${window.location.origin}/public/${token}`);
                                setNotification({ type: 'success', message: 'Survey URL copied to clipboard!' });
                              }
                            });
                          }}
                        >
                          <FaCopy style={{ fontSize: 12 }} /> Copy URL
                        </CopyUrlButton>
                      </PublicUrlSection>
                    )}
                    <ActionsRow>
                      <ActionButton
                        onClick={() => {
                          window.open(`/preview/survey/${s._id}?status=preview`, '_blank');
                        }}
                        title="Preview"
                      >
                        <FaEye style={{ color: 'var(--color-primary)', fontSize: 16 }} />
                      </ActionButton>
                      <ActionButton
                        onClick={() => navigate(`/admin/surveys/manage/${s._id}`)}
                        title="Manage"
                      >
                        <FaTasks style={{ color: 'var(--color-primary)', fontSize: 16 }} />
                      </ActionButton>
                      <ActionButton
                        onClick={() => navigate(`/admin/surveys/builder/${s._id}`)}
                        title="Edit"
                      >
                        <FaEdit style={{ color: 'var(--color-primary)', fontSize: 16 }} />
                      </ActionButton>
                      <ActionButton
                        onClick={() => setConfirmDelete({ _id: s._id, title: s.title })}
                        title="Delete"
                        className="delete"
                      >
                        <FaTrash style={{ color: 'var(--color-error)', fontSize: 16 }} />
                      </ActionButton>
                    </ActionsRow>
                  </SurveyCard>
                ))}
              </GridContainer>
            ) : (
              <SurveyListView 
                surveys={paginated} 
                onEdit={(id) => navigate(`/admin/surveys/builder/${id}`)}
                onDelete={(id, title) => setConfirmDelete({ _id: id, title })}
                onViewResponses={(id, title) => setResponsesModal({ isOpen: true, surveyId: id, surveyTitle: title })}
                onPreview={(id, isPublic) => {
                  Meteor.call('surveys.generateEncryptedToken', id, (err: Meteor.Error | null, token: string) => {
                    if (!err && token) {
                      if (isPublic) {
                        window.open(`/public/${token}`, '_blank');
                      } else {
                        window.open(`/preview/survey/${id}?status=preview`, '_blank');
                      }
                    }
                  });
                }}
              />
            )
          )}
          {/* Pagination */}
          <PaginationContainer>
            {Array.from({ length: pageCount }, (_, i) => (
              <PaginationButton
                key={i}
                onClick={() => setPage(i + 1)}
                active={page === i + 1}
              >
                {i + 1}
              </PaginationButton>
            ))}
          </PaginationContainer>
        </Container>
      </DashboardBg>
      
      {/* Survey Responses Modal */}
      <SurveyResponsesModal
        isOpen={responsesModal.isOpen}
        onClose={() => setResponsesModal({ ...responsesModal, isOpen: false })}
        surveyId={responsesModal.surveyId}
        surveyTitle={responsesModal.surveyTitle}
      />
    </AdminLayout>
  );
};

export default AllSurveys;