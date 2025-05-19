import React from 'react';
import AdminLayout from './AdminLayout';
import { FaUsers, FaQuestionCircle, FaClipboardList, FaChartBar } from 'react-icons/fa';
import Countdown from './Countdown';

import { useTracker } from 'meteor/react-meteor-data';
import { useResponses } from '../useResponses';

import styled from 'styled-components';

const DashboardBg = styled.div`
  background: #fff;
  min-height: 100vh;
  padding: 2.5rem 0 4rem 0;
`;

const GoldHeaderCard = styled.div`
  background: #b7a36a;
  border-radius: 18px;
  box-shadow: 0 2px 18px #e6d6b933;
  padding: 2.2rem 2rem 2rem 2.2rem;
  margin: 0 auto 2.5rem auto;
  max-width: 1000px;
  color: #fff;
  display: none;
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
  box-shadow: 0 1px 8px #e6d6b9;
  padding: 2rem 1.6rem 1.2rem 1.6rem;
`;
const SectionTitle = styled.div`
  font-size: 1.15rem;
  font-weight: 700;
  color: #b7a36a;
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
  box-shadow: 0 1px 8px #e6d6b9;
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
  color: #b7a36a;
  font-weight: 600;
`;

const SiteLegend = styled.div`
  font-size: 1.04rem;
  margin-top: 0.5rem;
`;
const FlaggedIssuesCard = styled.div`
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 8px #e6d6b9;
  padding: 2rem 1.6rem 1.2rem 1.6rem;
`;
const FlaggedList = styled.ul`
  margin: 0;
  padding: 0;
  list-style: none;
`;
const FlaggedItem = styled.li<{ color?: string }>`
  margin-bottom: 0.7rem;
  font-size: 1.08rem;
  font-weight: 600;
  color: #b7a36a;
`;
const EngagementTrendCard = styled.div`
  background: #fff;
  border-radius: 14px;
  box-shadow: 0 1px 8px #e6d6b9;
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
  color: #b7a36a;
  font-weight: 600;
`;
const TrendFill = styled.div<{ width: number; color?: string }>`
  height: 14px;
  background: #b7a36a;
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
    { label: 'Total Surveys', value: totalQuestions, icon: <FaClipboardList color="#b7a36a" size={28} />, link: '/admin/surveys/all' },
    { label: 'Questions', value: totalQuestions, icon: <FaQuestionCircle color="#b7a36a" size={28} />, link: '/admin/questions/all' },
    { label: 'Participants', value: uniqueParticipants, icon: <FaUsers color="#b7a36a" size={28} />, link: '/admin/analytics' },
    { label: 'Responses', value: totalResponses, icon: <FaChartBar color="#b7a36a" size={28} />, link: '/admin/analytics' },
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
                background: '#fff',
                border: '2px solid #b7a36a',
                borderRadius: 20,
                boxShadow: '0 2px 8px #e6d6b9',
                padding: '1.2rem 2.2rem',
                color: '#b7a36a',
                fontWeight: 700,
                minWidth: 220,
                textDecoration: 'none',
                fontSize: 18,
                transition: 'box-shadow 0.15s',
              }}
            >
              {stat.icon}
              <div>
                <div style={{ fontSize: 28, fontWeight: 800, color: '#b7a36a' }}>{stat.value}</div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>{stat.label}</div>
              </div>
            </a>
          ))}
        </div>

        {/* Quick Actions */}
        <div style={{ display: 'flex', gap: '1.2rem', justifyContent: 'center', marginBottom: '2.5rem' }}>
          {quickActions.map((action, idx) => (
            <a
              key={action.label}
              href={action.link}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                border: '2px solid #b7a36a',
                borderRadius: 8,
                background: '#fff',
                color: '#b7a36a',
                fontWeight: 700,
                padding: '0.7rem 1.5rem',
                fontSize: 15,
                textDecoration: 'none',
                transition: 'background 0.15s, color 0.15s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.background = '#b7a36a';
                e.currentTarget.style.color = '#fff';
              }}
              onMouseOut={e => {
                e.currentTarget.style.background = '#fff';
                e.currentTarget.style.color = '#b7a36a';
              }}
            >
              {React.cloneElement(action.icon, { color: '#b7a36a', size: 20 })}
              {action.label}
            </a>
          ))}
        </div>

        <MainGrid>
          <SurveyStatsCard style={{
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  background: '#fff',
  border: '2px solid #b7a36a',
  boxShadow: 'none',
}}>
            <SectionTitle style={{ marginBottom: 18, fontSize: 19, color: '#b7a36a' }}>Survey Participation</SectionTitle>
            {/* Modern segmented ring chart */}
            <div style={{ position: 'relative', width: 120, height: 120, marginBottom: 18 }}>
  <svg width="120" height="120" viewBox="0 0 120 120">
    {/* Background ring (white) */}
    <circle cx="60" cy="60" r="52" fill="none" stroke="#fff" strokeWidth="12" />
    {/* Completed segment (gold) */}
    <circle
      cx="60" cy="60" r="52"
      fill="none"
      stroke="#b7a36a"
      strokeWidth="12"
      strokeDasharray={`${Math.PI * 2 * 52}`}
      strokeDashoffset={`${Math.PI * 2 * 52 * (1 - participationPct / 100)}`}
      strokeLinecap="round"
      style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.6,.3,0,1)' }}
    />
    {/* Pending segment (white, overlays gold if not 100%) */}
    {pendingResponses > 0 && (
      <circle
        cx="60" cy="60" r="52"
        fill="none"
        stroke="#fff"
        strokeWidth="12"
        strokeDasharray={`${Math.PI * 2 * 52}`}
        strokeDashoffset={`${Math.PI * 2 * 52 * (completedResponses / totalResponses)}`}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 1s cubic-bezier(.6,.3,0,1)' }}
      />
    )}
    {/* Center % */}
    <text x="50%" y="54%" textAnchor="middle" fontSize="32" fontWeight="bold" fill="#b7a36a">{participationPct}%</text>
  </svg>
</div>
            {/* Pills for Completed and Pending */}
            <div style={{ display: 'flex', gap: 18, marginBottom: 10 }}>
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#b7a36a',
    color: '#fff', borderRadius: 30, padding: '7px 22px', fontWeight: 700, fontSize: 17, border: '1.5px solid #b7a36a',
  }}>
    <span style={{ fontSize: 20 }}>✔️</span> {completedResponses} Completed
  </div>
  <div style={{
    display: 'flex', alignItems: 'center', gap: 8,
    background: '#fff',
    color: '#b7a36a', borderRadius: 30, padding: '7px 22px', fontWeight: 700, fontSize: 17, border: '1.5px solid #b7a36a',
  }}>
    <span style={{ fontSize: 20 }}>⏳</span> {pendingResponses} Pending
  </div>
</div>
            {/* Legend */}
            <div style={{ marginTop: 8, color: '#b7a36a', fontSize: 15, textAlign: 'center', fontWeight: 600 }}>
  {completedResponses} out of {totalResponses} responses completed
</div>
          </SurveyStatsCard>
          <SiteResponsesCard style={{
  background: '#fff',
  border: '2px solid #b7a36a',
  borderRadius: 18,
  boxShadow: 'none',
  padding: '2.2rem 2rem 1.6rem 2rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
}}>
            <SectionTitle style={{ marginBottom: 18, fontSize: 19, color: '#b7a36a' }}>Responses by Site</SectionTitle>
            {/* Modern horizontal segmented bar/pill visualization */}
            <div style={{ width: '100%', maxWidth: 420, display: 'flex', flexDirection: 'column', gap: 18, marginBottom: 22 }}>
              {['Rainy River', 'New Afton', 'Corporate', 'Other'].map((site, idx) => {
  // Use only gold and white for bars and text
  const barColors = ['#b7a36a', '#fff', '#b7a36a', '#fff'];
  const textColors = ['#fff', '#b7a36a', '#fff', '#b7a36a'];
  const borderStyles = ['2px solid #b7a36a', '2px solid #b7a36a', '2px solid #b7a36a', '2px solid #b7a36a'];
  const icons = ['🏞️', '⛏️', '🏢', '🌐'];
  const count = responses.filter(r => r.site === site).length;
  const max = Math.max(1, ...['Rainy River', 'New Afton', 'Corporate', 'Other'].map(s => responses.filter(r => r.site === s).length));
  return (
    <div key={site} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <span style={{ fontSize: 22, color: '#b7a36a' }}>{icons[idx]}</span>
      <div style={{
        flex: 1,
        background: barColors[idx],
        border: borderStyles[idx],
        borderRadius: 30,
        height: 24,
        position: 'relative',
        boxShadow: 'none',
        overflow: 'hidden',
        display: 'flex',
        alignItems: 'center',
        minWidth: 50,
      }}>
        <div style={{
          width: `${Math.max(10, (count / max) * 100)}%`,
          background: barColors[idx] === '#b7a36a' ? '#b7a36a' : '#fff',
          height: '100%',
          position: 'absolute',
          left: 0,
          top: 0,
          borderRadius: 30,
          transition: 'width 0.7s cubic-bezier(.6,.3,0,1)',
          opacity: 0.3,
        }} />
        <span style={{
          position: 'relative',
          zIndex: 2,
          color: barColors[idx] === '#b7a36a' ? '#fff' : '#b7a36a',
          fontWeight: 700,
          fontSize: 16,
          marginLeft: 18,
        }}>
          {count}
        </span>
      </div>
      <span style={{ color: '#b7a36a', fontWeight: 600, fontSize: 16 }}>{site}</span>
    </div>
  );
})}
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, justifyContent: 'center', marginTop: 8 }}>
              {['Rainy River', 'New Afton', 'Corporate', 'Other'].map((site, idx) => (
                <div key={site} style={{
                  background: '#fff',
                  color: '#b7a36a',
                  border: '1.5px solid #b7a36a',
                  borderRadius: 20,
                  padding: '4px 16px',
                  fontWeight: 600,
                  fontSize: 15,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 7,
                }}>
                  <span style={{ fontSize: 18 }}>{['🏞️', '⛏️', '🏢', '🌐'][idx]}</span> {site} – {responses.filter(r => r.site === site).length}
                </div>
              ))}
            </div>
            <div style={{ marginTop: 10, color: '#b7a36a', fontSize: 15, textAlign: 'center', fontWeight: 700 }}>
              TOTAL RESPONSES: {totalResponses}
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
