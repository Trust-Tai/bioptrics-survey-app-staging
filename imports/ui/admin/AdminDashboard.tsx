import React from 'react';
import AdminLayout from './AdminLayout';
import { FaUsers, FaQuestionCircle, FaClipboardList, FaChartBar } from 'react-icons/fa';
import Countdown from './Countdown';

import { useTracker } from 'meteor/react-meteor-data';
import { useResponses } from '../useResponses';

import styled from 'styled-components';

const DashboardBg = styled.div`
  background: #f9f7f2;
  min-height: 100vh;
  padding: 2.5rem 0 4rem 0;
`;

const GoldHeaderCard = styled.div`
  background: linear-gradient(90deg, #b8a06c 80%, #ffe082 100%);
  border-radius: 18px;
  box-shadow: 0 2px 24px rgba(184,160,108,0.11);
  padding: 2.2rem 2rem 2rem 2.2rem;
  margin: 0 auto 2.5rem auto;
  max-width: 1000px;
  color: #fff;
`;

const HeaderLabel = styled.div`
  font-size: 15px;
  font-weight: 700;
  letter-spacing: 1px;
  margin-bottom: 6px;
  opacity: 0.9;
`;
const HeaderTitle = styled.div`
  font-size: 2.1rem;
  font-weight: 800;
  margin-bottom: 10px;
  letter-spacing: 0.5px;
`;

const HeaderEnds = styled.div`
  font-size: 1.15rem;
  font-weight: 600;
  letter-spacing: 1px;
  margin-top: 8px;
  color: #fff;
  display: flex;
  align-items: center;
  gap: 0.6rem;
`;

const GoldIcon = styled.div`
  margin-left: 2.5rem;
`;

const MainGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(320px, 1fr));
  gap: 2.2rem;
  max-width: 1000px;
  margin: 0 auto;
`;
const SurveyStatsCard = styled.div`
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 10px #e3d6c6;
  padding: 2rem 1.6rem 1.2rem 1.6rem;
`;
const SectionTitle = styled.div`
  font-size: 1.15rem;
  font-weight: 700;
  color: #552a47;
  margin-bottom: 1.1rem;
`;
const DonutChart = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 0.6rem;
`;
const DonutLegend = styled.div`
  margin-top: 0.6rem;
  font-size: 1.1rem;
`;
const DonutSub = styled.div`
  text-align: center;
  font-size: 1.13rem;
  margin-top: 0.6rem;
`;
const SiteResponsesCard = styled.div`
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 10px #e3d6c6;
  padding: 2rem 1.6rem 1.2rem 1.6rem;
`;
const BarChart = styled.div`
  margin: 0.7rem 0 1.1rem 0;
`;
const BarBar = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.7rem;
`;
const BarLabel = styled.div`
  width: 115px;
  font-size: 1.08rem;
  color: #552a47;
  font-weight: 600;
`;

const SiteLegend = styled.div`
  font-size: 1.04rem;
  margin-top: 0.5rem;
`;
const FlaggedIssuesCard = styled.div`
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 10px #e3d6c6;
  padding: 2rem 1.6rem 1.2rem 1.6rem;
`;
const FlaggedList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;
const FlaggedItem = styled.li<{ color: string }>`
  margin-bottom: 0.7rem;
  font-size: 1.08rem;
  font-weight: 600;
  color: ${({ color }) => color};
`;
const EngagementTrendCard = styled.div`
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 10px #e3d6c6;
  padding: 2rem 1.6rem 1.2rem 1.6rem;
`;
const TrendBar = styled.div`
  margin-top: 1.1rem;
`;
const TrendRow = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 0.7rem;
`;
const TrendLabel = styled.div`
  width: 70px;
  font-size: 1.08rem;
  color: #552a47;
  font-weight: 600;
`;
const TrendFill = styled.div<{ width: number; color: string }>`
  height: 14px;
  background: ${({ color }) => color};
  border-radius: 8px;
  margin: 0 12px 0 0;
  width: ${({ width }) => width}%;
`;
const TrendValue = styled.div`
  width: 60px;
  font-weight: 700;
  color: #444;
`;

const AdminDashboard: React.FC = () => {
  // Dynamically import the Questions collection for client-side use
  const [QuestionsCollection, setQuestionsCollection] = React.useState<any>(null);
  React.useEffect(() => {
    import('../../api/questions').then(mod => {
      setQuestionsCollection(mod.Questions);
    });
  }, []);

  // Fetch questions from MongoDB (if available)
  const questions = useTracker(() => {
    if (!QuestionsCollection) return [];
    Meteor.subscribe('questions.all');
    return QuestionsCollection.find().fetch();
  }, [QuestionsCollection]);

  // Count total questions and unique participants/responses
  const totalQuestions = questions.length;
  const responses = useResponses();

  // Dynamic stats
  const totalResponses = responses.length;
  const completedResponses = responses.filter(r => r.completed).length;
  const pendingResponses = totalResponses - completedResponses;
  const uniqueParticipants = new Set(responses.map(r => r.userId)).size;

  const stats = [
    { label: 'Total Surveys', value: totalQuestions, icon: <FaClipboardList />, color: 'linear-gradient(90deg, #b8a06c 60%, #ffe082 100%)', link: '/admin/surveys/all' },
    { label: 'Questions', value: totalQuestions, icon: <FaQuestionCircle />, color: 'linear-gradient(90deg, #6e395e 60%, #ffd6e0 100%)', link: '/admin/questions/all' },
    { label: 'Participants', value: uniqueParticipants, icon: <FaUsers />, color: 'linear-gradient(90deg, #f6d365 60%, #fda085 100%)', link: '/admin/analytics' },
    { label: 'Responses', value: totalResponses, icon: <FaChartBar />, color: 'linear-gradient(90deg, #b8a06c 60%, #e1cfa6 100%)', link: '/admin/analytics' },
  ];

  // Participation percentage
  const participationPct = totalResponses > 0 ? Math.round((completedResponses / totalResponses) * 100) : 0;

  const quickActions = [
    { label: 'Create New Survey', icon: <FaClipboardList />, link: '/admin/surveys/all' },
    { label: 'Add Question', icon: <FaQuestionCircle />, link: '/admin/questions/builder' },
    { label: 'Export Results', icon: <FaChartBar />, link: '/admin/analytics' },
  ];

  return (
    <AdminLayout>
      <DashboardBg>
        <GoldHeaderCard>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <HeaderLabel>JAN '25</HeaderLabel>
              <HeaderTitle>New Gold Employee Survey</HeaderTitle>
              <HeaderEnds>
                ENDS IN:
                <Countdown end={new Date('2025-01-25T23:59:59')} />
              </HeaderEnds>
            </div>
            <GoldIcon>
              <svg width="90" height="64" viewBox="0 0 90 64" fill="none"><rect width="90" height="64" rx="14" fill="#FFD700"/><rect x="12" y="16" width="66" height="32" rx="8" fill="#F6E27A"/><rect x="28" y="28" width="34" height="12" rx="6" fill="#FFD700"/></svg>
            </GoldIcon>
          </div>
        </GoldHeaderCard>

        {/* Pill Stat Cards */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem', justifyContent: 'center', marginBottom: '2.2rem' }}>
          {stats.map((stat, idx) => (
            <a
              key={stat.label}
              href={stat.link}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 18,
                background: stat.color,
                borderRadius: 40,
                boxShadow: '0 2px 12px #e3d6c6',
                padding: '1.2rem 2.2rem',
                color: '#fff',
                fontWeight: 700,
                fontSize: 19,
                textDecoration: 'none',
                minWidth: 210,
                transition: 'transform 0.13s, box-shadow 0.13s',
                cursor: 'pointer',
                outline: 'none',
                border: 'none',
                position: 'relative',
                boxSizing: 'border-box',
                zIndex: 1,
              }}
              tabIndex={0}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 24px #b8a06c55'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 12px #e3d6c6'; }}
            >
              <span style={{ fontSize: 28 }}>{stat.icon}</span>
              <span>
                <div style={{ fontSize: 21 }}>{stat.value}</div>
                <div style={{ fontSize: 15, fontWeight: 500, opacity: 0.94 }}>{stat.label}</div>
              </span>
            </a>
          ))}
        </div>

        {/* Quick Actions Pills */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.2rem', justifyContent: 'center', marginBottom: '2.2rem' }}>
          {quickActions.map(action => (
            <a
              key={action.label}
              href={action.link}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 12,
                background: 'linear-gradient(90deg, #fff8e1 60%, #ffe082 100%)',
                borderRadius: 30,
                boxShadow: '0 2px 8px #e3d6c6',
                padding: '0.8rem 1.7rem',
                color: '#b8a06c',
                fontWeight: 700,
                fontSize: 16,
                textDecoration: 'none',
                minWidth: 170,
                transition: 'transform 0.13s, box-shadow 0.13s',
                cursor: 'pointer',
                outline: 'none',
                border: 'none',
                position: 'relative',
                boxSizing: 'border-box',
                zIndex: 1,
              }}
              tabIndex={0}
              onMouseOver={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1.04)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 4px 18px #b8a06c33'; }}
              onMouseOut={e => { (e.currentTarget as HTMLElement).style.transform = 'scale(1)'; (e.currentTarget as HTMLElement).style.boxShadow = '0 2px 8px #e3d6c6'; }}
            >
              <span style={{ fontSize: 22 }}>{action.icon}</span>
              <span>{action.label}</span>
            </a>
          ))}
        </div>

        <MainGrid>
          <SurveyStatsCard style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'linear-gradient(120deg, #fff8e1 80%, #ffe082 100%)', boxShadow: '0 2px 18px #e3d6c6' }}>
            <SectionTitle style={{ marginBottom: 18, fontSize: 19 }}>Survey Participation</SectionTitle>
            {/* Modern segmented ring chart */}
            <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 18 }}>
              <svg width="120" height="120" viewBox="0 0 120 120">
                {/* Background ring */}
                <circle cx="60" cy="60" r="52" fill="none" stroke="#f5e6c7" strokeWidth="12" />
                {/* Completed segment */}
                <circle
                  cx="60" cy="60" r="52"
                  fill="none"
                  stroke="#b8a06c"
                  strokeWidth="12"
                  strokeDasharray={`${Math.PI * 2 * 52}`}
                  strokeDashoffset={`${Math.PI * 2 * 52 * (1 - participationPct / 100)}`}
                  strokeLinecap="round"
                  style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.6,.3,0,1)' }}
                />
                {/* Pending segment (if any) */}
                {pendingResponses > 0 && (
                  <circle
                    cx="60" cy="60" r="52"
                    fill="none"
                    stroke="#e1cfa6"
                    strokeWidth="12"
                    strokeDasharray={`${Math.PI * 2 * 52}`}
                    strokeDashoffset={`${Math.PI * 2 * 52 * (completedResponses / totalResponses)}`}
                    strokeLinecap="round"
                    style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.6,.3,0,1)' }}
                  />
                )}
                {/* Center % */}
                <text x="50%" y="54%" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#552a47">{participationPct}%</text>
              </svg>
            </div>
            {/* Pills for Completed and Pending */}
            <div style={{ display: 'flex', gap: 18, marginBottom: 10 }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(90deg, #b8a06c 60%, #ffe082 100%)',
                color: '#fff', borderRadius: 30, padding: '7px 22px', fontWeight: 700, fontSize: 17, boxShadow: '0 1px 7px #e3d6c6',
              }}>
                <span style={{ fontSize: 20 }}>✔️</span> {completedResponses} Completed
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: 'linear-gradient(90deg, #e1cfa6 60%, #fff8e1 100%)',
                color: '#b8a06c', borderRadius: 30, padding: '7px 22px', fontWeight: 700, fontSize: 17, boxShadow: '0 1px 7px #e3d6c6',
              }}>
                <span style={{ fontSize: 20 }}>⏳</span> {pendingResponses} Pending
              </div>
            </div>
            {/* Legend */}
            <div style={{ marginTop: 8, color: '#6e395e', fontSize: 15, textAlign: 'center' }}>
              <span style={{ fontWeight: 600, color: '#b8a06c' }}>{completedResponses}</span> out of <span style={{ fontWeight: 600 }}>{totalResponses}</span> responses completed
            </div>
          </SurveyStatsCard>
          <SiteResponsesCard style={{ background: 'linear-gradient(120deg, #fff8e1 80%, #ffe082 100%)', boxShadow: '0 2px 18px #e3d6c6', borderRadius: 18, padding: '2.2rem 2rem 1.6rem 2rem', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <SectionTitle style={{ marginBottom: 18, fontSize: 19 }}>Responses by Site</SectionTitle>
            {/* Modern horizontal segmented bar/pill visualization */}
            <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 22 }}>
              {['Rainy River', 'New Afton', 'Corporate', 'Other'].map((site, idx) => {
                const colors = [
                  'linear-gradient(90deg, #b8a06c 60%, #ffe082 100%)',
                  'linear-gradient(90deg, #f6d365 60%, #fda085 100%)',
                  'linear-gradient(90deg, #e1cfa6 60%, #fff8e1 100%)',
                  'linear-gradient(90deg, #eee 60%, #fff 100%)',
                ];
                const textColors = ['#fff', '#fff', '#b8a06c', '#888'];
                const icons = ['🏞️', '⛏️', '🏢', '🌐'];
                const count = responses.filter(r => r.site === site).length;
                const max = Math.max(1, ...['Rainy River', 'New Afton', 'Corporate', 'Other'].map(s => responses.filter(r => r.site === s).length));
                return (
                  <div key={site} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span style={{ fontSize: 22 }}>{icons[idx]}</span>
                    <div style={{
                      flex: 1,
                      background: colors[idx],
                      borderRadius: 30,
                      height: 24,
                      position: 'relative',
                      boxShadow: '0 1px 7px #e3d6c6',
                      overflow: 'hidden',
                      display: 'flex',
                      alignItems: 'center',
                      minWidth: 50,
                    }}>
                      <div style={{
                        width: `${Math.max(10, (count / max) * 100)}%`,
                        background: 'rgba(255,255,255,0.08)',
                        height: '100%',
                        position: 'absolute',
                        left: 0,
                        top: 0,
                        borderRadius: 30,
                        transition: 'width 0.7s cubic-bezier(.6,.3,0,1)',
                      }} />
                      <span style={{
                        position: 'relative',
                        zIndex: 1,
                        color: textColors[idx],
                        fontWeight: 700,
                        fontSize: 16,
                        marginLeft: 20,
                      }}>{site}</span>
                    </div>
                    <div style={{
                      background: colors[idx],
                      color: textColors[idx],
                      borderRadius: 30,
                      padding: '4px 18px',
                      fontWeight: 700,
                      fontSize: 15,
                      boxShadow: '0 1px 7px #e3d6c6',
                      minWidth: 56,
                      textAlign: 'center',
                    }}>{count}</div>
                  </div>
                );
              })}
            </div>
            {/* Modern legend/pointers below the section */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 8 }}>
              <div style={{ background: 'linear-gradient(90deg, #b8a06c 60%, #ffe082 100%)', color: '#fff', borderRadius: 20, padding: '4px 16px', fontWeight: 600, fontSize: 15 }}>🏞️ Rainy River – {responses.filter(r => r.site === 'Rainy River').length}</div>
              <div style={{ background: 'linear-gradient(90deg, #f6d365 60%, #fda085 100%)', color: '#fff', borderRadius: 20, padding: '4px 16px', fontWeight: 600, fontSize: 15 }}>⛏️ New Afton – {responses.filter(r => r.site === 'New Afton').length}</div>
              <div style={{ background: 'linear-gradient(90deg, #e1cfa6 60%, #fff8e1 100%)', color: '#b8a06c', borderRadius: 20, padding: '4px 16px', fontWeight: 600, fontSize: 15 }}>🏢 Corporate – {responses.filter(r => r.site === 'Corporate').length}</div>
              <div style={{ background: 'linear-gradient(90deg, #eee 60%, #fff 100%)', color: '#888', borderRadius: 20, padding: '4px 16px', fontWeight: 600, fontSize: 15 }}>🌐 Other – {responses.filter(r => r.site === 'Other').length}</div>
            </div>
            <div style={{ marginTop: 10, color: '#6e395e', fontSize: 15, textAlign: 'center' }}>
              <b>TOTAL RESPONSES: {totalResponses}</b>
            </div>
          </SiteResponsesCard>
          <FlaggedIssuesCard>
            <SectionTitle>Flagged Issues</SectionTitle>
            <FlaggedList>
              <FlaggedItem color="#2196f3"><span>🟦</span> Communication score dropped from 4.1 → 3.5</FlaggedItem>
              <FlaggedItem color="#fbc02d"><span>⚠️</span> Leadership Trust fell below threshold 2.9</FlaggedItem>
              <FlaggedItem color="#e57373"><span>❌</span> Team Collaboration declined by 12% last survey</FlaggedItem>
              <FlaggedItem color="#f06292"><span>❗</span> Work-Life Balance flagged in multiple sites</FlaggedItem>
              <FlaggedItem color="#ff9800"><span>⚠️</span> Manager Feedback score critically low at 2.5</FlaggedItem>
            </FlaggedList>
          </FlaggedIssuesCard>
          <EngagementTrendCard>
            <SectionTitle>Engagement Score Trend <span style={{ float: 'right', color: '#4caf50', fontWeight: 700, fontSize: 15 }}>AVERAGE: 4/5</span></SectionTitle>
            <TrendBar>
              {(() => {
                // Group by month (YYYY-MM)
                const grouped: { [key: string]: number[] } = {};
                responses.forEach(r => {
                  const d = new Date(r.createdAt);
                  const label = d.toLocaleString('default', { month: 'short' }) + ' ' + d.getFullYear().toString().slice(-2);
                  if (!grouped[label]) grouped[label] = [];
                  grouped[label].push(r.engagementScore);
                });
                const months = Object.keys(grouped).sort();
                return months.map(label => {
                  const scores = grouped[label];
                  const avg = scores.length ? (scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
                  return (
                    <TrendRow key={label}>
                      <TrendLabel>{label}</TrendLabel>
                      <TrendFill width={Math.round((avg / 5) * 100)} color={avg >= 4 ? '#4caf50' : avg >= 3 ? '#fbc02d' : '#e57373'} />
                      <TrendValue>{avg.toFixed(1)}/5</TrendValue>
                    </TrendRow>
                  );
                });
              })()}
            </TrendBar>
          </EngagementTrendCard>
        </MainGrid>
      </DashboardBg>
    </AdminLayout>
  );
}

const Bar = styled.div<{ value: number; color: string }>`
  height: 14px;
  width: ${p => p.value * 2}px;
  background: ${p => p.color};
  border-radius: 7px;
  transition: width 0.5s;
`;
const BarValue = styled.div`
  font-size: 1rem;
  font-weight: 600;
  color: #888;
  margin-left: 8px;
`;

export default AdminDashboard;
