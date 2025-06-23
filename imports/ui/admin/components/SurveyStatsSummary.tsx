import React, { useEffect, useState } from 'react';
import { Meteor } from 'meteor/meteor';
import { useTracker } from 'meteor/react-meteor-data';
import styled from 'styled-components';
import { FaFileAlt, FaPlay, FaUsers, FaChartPie } from 'react-icons/fa';

// Styled components
const StatsContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 24px;
  width: 100%;
`;

const StatCard = styled.div`
  background: #fff;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  border: 1px solid #eee;
`;

const IconContainer = styled.div<{ color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 8px;
  background-color: ${props => props.color + '15'};
  color: ${props => props.color};
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  margin-right: 16px;
`;

const StatContent = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.div`
  font-size: 24px;
  font-weight: 700;
  color: #333;
`;

const StatLabel = styled.div`
  font-size: 14px;
  color: #666;
  margin-top: 4px;
`;

interface SurveyStatsProps {
  organizationId?: string;
}

const SurveyStatsSummary: React.FC<SurveyStatsProps> = ({ organizationId }) => {
  // State for stats
  const [stats, setStats] = useState({
    totalSurveys: 0,
    activeSurveys: 0,
    totalResponses: 0,
    avgCompletion: 0
  });
  
  const [loading, setLoading] = useState(true);
  
  // Fetch stats initially and set up refresh interval
  useEffect(() => {
    // Function to fetch stats
    const fetchStats = () => {
      setLoading(true);
      // Call the method with null if organizationId is undefined
      const orgId = organizationId || null;
      console.log('Calling surveys.getStats with organizationId:', orgId);
      
      Meteor.call('surveys.getStats', orgId, (error: Meteor.Error | null, result: any) => {
        setLoading(false);
        if (error) {
          console.error('Error fetching survey stats:', error);
        } else if (result) {
          console.log('Survey stats received:', result);
          setStats(result);
        }
      });
    };
    
    // Initial fetch
    fetchStats();
    
    // Set up interval for refreshing
    const intervalId = setInterval(fetchStats, 30000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, [organizationId]);

  return (
    <StatsContainer>
      <StatCard>
        <IconContainer color="#4285F4">
          <FaFileAlt />
        </IconContainer>
        <StatContent>
          <StatValue>{stats.totalSurveys}</StatValue>
          <StatLabel>Total Surveys</StatLabel>
        </StatContent>
      </StatCard>
      
      <StatCard>
        <IconContainer color="#0F9D58">
          <FaPlay />
        </IconContainer>
        <StatContent>
          <StatValue>{stats.activeSurveys}</StatValue>
          <StatLabel>Active Surveys</StatLabel>
        </StatContent>
      </StatCard>
      
      <StatCard>
        <IconContainer color="#AA47BC">
          <FaUsers />
        </IconContainer>
        <StatContent>
          <StatValue>{stats.totalResponses}</StatValue>
          <StatLabel>Total Responses</StatLabel>
        </StatContent>
      </StatCard>
      
      <StatCard>
        <IconContainer color="#F4B400">
          <FaChartPie />
        </IconContainer>
        <StatContent>
          <StatValue>{stats.avgCompletion}%</StatValue>
          <StatLabel>Avg Completion</StatLabel>
        </StatContent>
      </StatCard>
    </StatsContainer>
  );
};

export default SurveyStatsSummary;
