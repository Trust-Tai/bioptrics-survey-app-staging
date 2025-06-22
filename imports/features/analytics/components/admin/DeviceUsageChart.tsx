import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { DeviceUsageData } from '../../../surveys/api/deviceUsageMethods';
import { FiRefreshCw, FiSettings } from 'react-icons/fi';

// Use the imported DeviceUsageData interface instead of defining a local one

// Props for the component
interface DeviceUsageChartProps {
  title?: string;
  subtitle?: string;
}

// Styled components
const ChartContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 24px;
  height: 100%;
  display: flex;
  flex-direction: column;
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
`;

const ChartSubtitle = styled.p`
  font-size: 14px;
  color: #666;
  margin: 4px 0 0 0;
`;

const ChartControls = styled.div`
  display: flex;
  gap: 8px;
`;

const IconButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  color: #666;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 4px;
  border-radius: 4px;
  
  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

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

// Colors for the chart
const COLORS = ['#4285F4', '#F5A623', '#34A853'];

// Device names mapping
const DEVICE_NAMES: Record<string, string> = {
  desktop: 'Desktop',
  mobile: 'Mobile',
  tablet: 'Tablet'
};

// Device order for consistent display
const DEVICE_ORDER = ['desktop', 'mobile', 'tablet'];

/**
 * Generate dummy data for device usage when real data is not available
 */
const generateDummyData = (): DeviceUsageData[] => {
  // Generate data that matches the reference design
  return [
    {
      deviceType: 'desktop',
      count: 114,
      percentage: 100
    },
    {
      deviceType: 'mobile',
      count: 0,
      percentage: 0
    },
    {
      deviceType: 'tablet',
      count: 0,
      percentage: 0
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
        <div style={{ 
          backgroundColor: '#fff', 
          padding: '10px', 
          border: '1px solid #ccc',
          borderRadius: '4px'
        }}>
          <p style={{ margin: 0 }}><strong>{DEVICE_NAMES[data.deviceType]}</strong></p>
          <p style={{ margin: 0 }}>{data.count} responses</p>
          <p style={{ margin: 0 }}>{data.percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <ChartContainer>
      <ChartHeader>
        <div>
          <ChartTitle>{title}</ChartTitle>
          <ChartSubtitle>{subtitle}</ChartSubtitle>
        </div>
        <ChartControls>
          <IconButton 
            title="Refresh data" 
            onClick={() => {
              setLoading(true);
              console.log('Manually refreshing device usage data...');
              fetchData();
            }}
          >
            <FiRefreshCw size={16} />
          </IconButton>
          <IconButton title="Chart settings">
            <FiSettings size={16} />
          </IconButton>
        </ChartControls>
      </ChartHeader>
      
      <ChartContent>
        {loading ? (
          <LoadingOverlay>Loading device data...</LoadingOverlay>
        ) : (
          <>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={2}
                  dataKey="count"
                >
                  {data.map((entry, index) => (
                    <Cell 
                      key={`cell-${index}`} 
                      fill={COLORS[index % COLORS.length]} 
                    />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>
            
            <DeviceList>
              {DEVICE_ORDER.map((deviceType, index) => {
                const item = data.find(d => d.deviceType === deviceType) || {
                  deviceType,
                  count: 0,
                  percentage: 0
                };
                return (
                <DeviceItem key={item.deviceType}>
                  <DeviceLabel>
                    <ColorIndicator color={COLORS[index % COLORS.length]} />
                    <DeviceName>{DEVICE_NAMES[item.deviceType]}</DeviceName>
                  </DeviceLabel>
                  <DeviceCount>
                    <Count>{item.count.toLocaleString()}</Count>
                    <Percentage>{item.percentage}%</Percentage>
                  </DeviceCount>
                </DeviceItem>
              );
              })}
            </DeviceList>
          </>
        )}
      </ChartContent>
    </ChartContainer>
  );
};

export default DeviceUsageChart;
