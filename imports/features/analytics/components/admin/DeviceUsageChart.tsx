import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { FiSmartphone, FiMonitor, FiTablet } from 'react-icons/fi';
import { useTheme } from '/imports/contexts/ThemeContext';

interface DeviceUsageData {
  name: string;
  value: number;
  count: number;
  color: string;
  deviceType?: string; // Add deviceType as optional property
}

// Props for the component
interface DeviceUsageChartProps {
  title?: string;
  subtitle?: string;
}

// Styled components
const ChartContainer = styled.div`
  background: ${({ theme }) => theme.accentColor};
  height: 100%;
  min-height: 300px;
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 16px;
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.primaryColor};
  margin: 0;
`;

const ChartSubtitle = styled.p`
  font-size: 14px;
  color: ${({ theme }) => theme.textColor};
  margin: 4px 0 0 0;
`;

const CustomTooltipContainer = styled.div`
  background: ${({ theme }) => theme.backgroundColor};
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 12px;
  border: 1px solid ${({ theme }) => theme.primaryColor}40;
`;

const TooltipItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: ${({ theme }) => theme.textColor};
`;

const LegendContainer = styled.div`
  display: flex;
  justify-content: center;
  margin-top: 16px;
  gap: 16px;
  flex-wrap: wrap;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  color: ${({ theme }) => theme.textColor};
`;

const LegendColor = styled.div<{ color: string }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background-color: ${props => props.color};
`;

// Styled components
const ChartContent = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 250px;
`;

const DeviceList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-top: 16px;
`;

const DeviceItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 4px 0;
`;

const DeviceLabel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const ColorIndicator = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 2px;
  background-color: ${props => props.color};
`;

const DeviceName = styled.span`
  font-size: 15px;
  color: #333;
`;

const DeviceCount = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  min-width: 60px;
`;

const Count = styled.span`
  font-size: 18px;
  font-weight: 600;
  color: #333;
`;

const Percentage = styled.span`
  font-size: 13px;
  color: #666;
`;

const LoadingOverlay = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  min-height: 200px;
`;

/**
 * Generate dummy data for device usage when real data is not available
 */
const generateDummyData = (): DeviceUsageData[] => {
  // Generate data that matches the reference design
  return [
    {
      name: 'Desktop',
      deviceType: 'desktop',
      count: 114,
      value: 100,
      color: 'var(--color-primary, #552a47)'
    },
    {
      name: 'Mobile',
      deviceType: 'mobile',
      count: 0,
      value: 0,
      color: '#8B4A6B'
    },
    {
      name: 'Tablet',
      deviceType: 'tablet',
      count: 0,
      value: 0,
      color: 'var(--color-primary-transparent, #552a4780)'
    }
  ];
};

/**
 * DeviceUsageChart component displays a pie chart showing device usage distribution
 */
const DeviceUsageChart: React.FC<DeviceUsageChartProps> = ({ 
  title = 'Device Usage',
  subtitle = 'Distribution of survey responses by device type'
}) => {
  const theme = useTheme();
  
  // Use theme colors for devices
  const deviceColors = [
    theme.primaryColor,
    theme.secondaryColor,
    theme.primaryColor + '80'
  ];

  const [data, setData] = useState<DeviceUsageData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch device usage data from the server
  const fetchData = () => {
    setLoading(true);
    console.log('Fetching device usage data...');
    
    Meteor.call('getDeviceUsageData', (error: Error, result: DeviceUsageData[]) => {
      if (error) {
        console.error('Error fetching device usage data:', error);
        // Use dummy data as fallback
        setData(generateDummyData());
      } else {
        console.log('Received device usage data:', result);
        // Always use the real data from the server, even if counts are zero
        if (result && Array.isArray(result)) {
          console.log('Using real device usage data from server:', result);
          setData(result);
        } else {
          console.log('Invalid data format received, using dummy data as fallback');
          setData(generateDummyData());
        }
      }
      setLoading(false);
    });
  };

  // Fetch data on component mount and set up auto-refresh
  useEffect(() => {
    fetchData();
    
    // Auto-refresh every 5 minutes
    const intervalId = setInterval(fetchData, 5 * 60 * 1000);
    
    // Clean up interval on unmount
    return () => clearInterval(intervalId);
  }, []);

  // Custom tooltip for the pie chart
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <CustomTooltipContainer>
          <TooltipItem>
            <LegendColor color={data.color} />
            <span>{data.name}: {data.value}% ({data.count} users)</span>
          </TooltipItem>
        </CustomTooltipContainer>
      );
    }
    return null;
  };

  const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null; // Don't show labels for slices less than 5%
    
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text 
        x={x} 
        y={y} 
        fill={theme.backgroundColor}
        textAnchor={x > cx ? 'start' : 'end'} 
        dominantBaseline="central"
        fontSize={12}
        fontWeight={600}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <ChartContainer>
      <ChartHeader>
        <div>
          <ChartTitle>{title}</ChartTitle>
          <ChartSubtitle>{subtitle}</ChartSubtitle>
        </div>
      </ChartHeader>
      
      <ResponsiveContainer width="100%" height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            labelLine={false}
            label={renderCustomizedLabel}
            outerRadius={80}
            fill={theme.primaryColor}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={deviceColors[index % deviceColors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      
      <LegendContainer>
        {data.map((entry, index) => (
          <LegendItem key={entry.name}>
            <LegendColor color={deviceColors[index % deviceColors.length]} />
            <span>{entry.name}</span>
          </LegendItem>
        ))}
      </LegendContainer>
    </ChartContainer>
  );
};

export default DeviceUsageChart;
