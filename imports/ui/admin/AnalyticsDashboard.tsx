import React from 'react';
import { useTracker } from 'meteor/react-meteor-data';
import styled from 'styled-components';
import AdminLayout from '/imports/layouts/AdminLayout/AdminLayout';
import { FaChartLine, FaChartBar, FaChartPie, FaUsers } from 'react-icons/fa';
import Analytics from './Analytics'; // Import the original Analytics component

const Container = styled.div`
  padding: 20px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 20px;
  margin-bottom: 20px;
`;

const StatCard = styled.div`
  background-color: white;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  padding: 20px;
  display: flex;
  flex-direction: column;
  
  h3 {
    margin: 0;
    font-size: 1rem;
    color: #718096;
  }
  
  .value {
    font-size: 2rem;
    font-weight: 700;
    margin: 10px 0;
    color: #2d3748;
  }
  
  .trend {
    display: flex;
    align-items: center;
    font-size: 0.875rem;
    
    &.positive {
      color: #48bb78;
    }
    
    &.negative {
      color: #e53e3e;
    }
  }
  
  .icon {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 48px;
    height: 48px;
    border-radius: 50%;
    margin-bottom: 10px;
    
    svg {
      font-size: 1.5rem;
      color: white;
    }
  }
`;

const AnalyticsDashboard: React.FC = () => {
  // This would be replaced with actual data from your Meteor collections
  const { stats } = useTracker(() => {
    return {
      stats: [
        { 
          id: 1, 
          title: 'Total Surveys', 
          value: '24', 
          trend: '+12%', 
          trendPositive: true,
          icon: FaChartBar,
          iconBg: '#552a47' 
        },
        { 
          id: 2, 
          title: 'Total Responses', 
          value: '1,284', 
          trend: '+18%', 
          trendPositive: true,
          icon: FaUsers,
          iconBg: '#552a47' 
        },
        { 
          id: 3, 
          title: 'Avg. Completion Rate', 
          value: '87%', 
          trend: '+5%', 
          trendPositive: true,
          icon: FaChartPie,
          iconBg: '#552a47' 
        },
        { 
          id: 4, 
          title: 'Avg. Response Time', 
          value: '8.2 min', 
          trend: '-1.5 min', 
          trendPositive: true,
          icon: FaChartLine,
          iconBg: '#552a47' 
        }
      ]
    };
  }, []);

  return (
    <Analytics />
  );
};

export default AnalyticsDashboard;
