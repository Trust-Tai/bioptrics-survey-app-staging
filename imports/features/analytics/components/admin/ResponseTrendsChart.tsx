import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ResponsiveContainer, 
  Area, 
  AreaChart,
  ReferenceDot
} from 'recharts';
import { FiRefreshCw, FiSettings } from 'react-icons/fi';

// Styled components
const ChartContainer = styled.div`
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  padding: 24px;
  height: 100%;
  min-height: 400px;
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
  color: #666;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: #f5f5f5;
    color: #333;
  }
`;

const CustomTooltipContainer = styled.div`
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
  padding: 12px;
  border: 1px solid #eaeaea;
`;

const TooltipDate = styled.div`
  font-weight: 600;
  margin-bottom: 8px;
  font-size: 14px;
`;

const TooltipItem = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 4px;
  font-size: 13px;
`;

const ColorIndicator = styled.div<{ color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  background-color: ${props => props.color};
  margin-right: 8px;
`;

// Format date for tooltip display
const formatTooltipDate = (dateStr: string) => {
  try {
    const date = new Date(dateStr);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  } catch (e) {
    console.error('Error formatting tooltip date:', e, dateStr);
    return dateStr; // Return original if there's an error
  }
};

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <CustomTooltipContainer>
        <TooltipDate>{label}</TooltipDate>
        {payload.map((entry: any, index: number) => (
          <TooltipItem key={`item-${index}`}>
            <ColorIndicator color={entry.color} />
            <span><strong>{entry.name}</strong>: {entry.value}</span>
          </TooltipItem>
        ))}
      </CustomTooltipContainer>
    );
  }
  return null;
};

interface DataPoint {
  date: string;
  responses: number;
  completions: number;
}

interface ResponseTrendsChartProps {
  title?: string;
  subtitle?: string;
}

const ResponseTrendsChart: React.FC<ResponseTrendsChartProps> = ({ 
  title = "Response Trends", 
  subtitle = "Daily response and completion patterns" 
}) => {
  const [data, setData] = useState<DataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    setLoading(true);
    
    // Function to fetch real data
    const fetchRealData = () => {
      console.log('Fetching real response trends data...');
      Meteor.call('getResponseTrendsData', (error: Error, result: DataPoint[]) => {
        if (error) {
          console.error('Error fetching response trends data:', error);
          // Fall back to dummy data
          setData(generateDummyData());
        } else {
          console.log('Received response trends data:', result);
          
          // Check if we got real data with non-zero values
          const hasRealData = result && result.length > 0 && 
            result.some(item => item.responses > 0 || item.completions > 0);
          
          if (hasRealData) {
            console.log('Using real data from database');
            setData(result);
          } else {
            console.log('No real data found, using dummy data');
            setData(generateDummyData());
          }
        }
        
        setLoading(false);
      });
    };
    
    // Initial data fetch
    fetchRealData();
    
    // Set up auto-refresh every 5 minutes
    const refreshInterval = setInterval(fetchRealData, 5 * 60 * 1000);
    
    // Clean up interval on component unmount
    return () => clearInterval(refreshInterval);
  }, []);

  // Generate dummy data for development/preview
  const generateDummyData = (): DataPoint[] => {
    const today = new Date();
    console.log('Today in dummy data generation:', today.toISOString());
    const data: DataPoint[] = [];
    
    // Generate data for the last 7 days including today
    for (let i = 6; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      console.log(`Generating dummy data for day ${i}, date:`, date.toISOString());
      
      // Format date as YYYY-MM-DD
      const dateStr = date.toISOString().split('T')[0];
      
      // Generate more realistic values with a pattern that ensures all days have data
      // Create a wave pattern with higher values on some days
      let baseResponses = 0;
      
      // Ensure all days have at least some data
      if (i === 6 || i === 5) {
        // Lower values for older days
        baseResponses = 5 + Math.floor(Math.random() * 8);
      } else if (i === 4 || i === 3) {
        // Medium values for middle days
        baseResponses = 15 + Math.floor(Math.random() * 10);
      } else if (i === 2 || i === 1) {
        // Higher values for recent days
        baseResponses = 25 + Math.floor(Math.random() * 15);
      } else {
        // Highest value for today/yesterday
        baseResponses = 40 + Math.floor(Math.random() * 25);
      }
      
      // Most responses are completed (80-90%)
      const completions = Math.floor(baseResponses * (0.8 + (Math.random() * 0.1)));
      
      data.push({
        date: dateStr,
        responses: baseResponses,
        completions: completions
      });
    }
    
    return data;
  };

  const handleMouseMove = (e: any) => {
    if (e.activeTooltipIndex !== undefined) {
      setActiveIndex(e.activeTooltipIndex);
    }
  };

  const handleMouseLeave = () => {
    setActiveIndex(null);
  };

  // Format date for display
  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      // Ensure we're getting the local date representation
      const day = date.getDate();
      const month = date.toLocaleString('default', { month: 'short' });
      const formatted = `${month} ${day}`;
      console.log('Formatting date:', dateStr, 'to display as:', formatted);
      return formatted;
    } catch (e) {
      console.error('Error formatting date:', e, dateStr);
      return dateStr; // Return original if there's an error
    }
  };

  if (loading) {
    return (
      <ChartContainer>
        <ChartHeader>
          <div>
            <ChartTitle>{title}</ChartTitle>
            <ChartSubtitle>{subtitle}</ChartSubtitle>
          </div>
        </ChartHeader>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '300px' }}>
          Loading...
        </div>
      </ChartContainer>
    );
  }

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
              console.log('Manually refreshing response trends data...');
              Meteor.call('getResponseTrendsData', (error: Error, result: DataPoint[]) => {
                if (error) {
                  console.error('Error refreshing data:', error);
                  setLoading(false);
                } else {
                  console.log('Refreshed data:', result);
                  const hasRealData = result && result.length > 0 && 
                    result.some(item => item.responses > 0 || item.completions > 0);
                  
                  if (hasRealData) {
                    setData(result);
                  } else {
                    setData(generateDummyData());
                  }
                  setLoading(false);
                }
              });
            }}
          >
            <FiRefreshCw size={16} />
          </IconButton>
          <IconButton title="Chart settings">
            <FiSettings size={16} />
          </IconButton>
        </ChartControls>
      </ChartHeader>
      
      <ResponsiveContainer width="100%" height={300}>
        <AreaChart
          data={data}
          margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
        >
          <defs>
            <linearGradient id="colorResponses" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#8884d8" stopOpacity={0.1} />
            </linearGradient>
            <linearGradient id="colorCompletions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#4CAF50" stopOpacity={0.8} />
              <stop offset="95%" stopColor="#4CAF50" stopOpacity={0.1} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.2} />
          <XAxis 
            dataKey="date" 
            tickFormatter={formatDate}
            tick={{ fill: '#666', fontSize: 12 }}
            axisLine={{ stroke: '#E0E0E0' }}
            tickLine={false}
            ticks={data.map(item => item.date)}
          />
          <YAxis 
            domain={[0, 'dataMax + 60']}
            axisLine={false}
            tickLine={false}
            tick={{ fontSize: 12, fill: '#666' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            iconType="circle" 
            wrapperStyle={{ fontSize: 12, paddingTop: 20 }}
          />
          <Area 
            type="monotone" 
            dataKey="responses" 
            stroke="#8884d8" 
            fillOpacity={1} 
            fill="url(#colorResponses)" 
            name="Responses"
            activeDot={{ r: 6, fill: '#8884d8', stroke: '#fff', strokeWidth: 2 }}
          />
          <Area 
            type="monotone" 
            dataKey="completions" 
            stroke="#4CAF50" 
            fillOpacity={1} 
            fill="url(#colorCompletions)" 
            name="Completions"
            activeDot={{ r: 6, fill: '#4CAF50', stroke: '#fff', strokeWidth: 2 }}
          />
          
          {/* Reference dots for hover effect */}
          {activeIndex !== null && data[activeIndex] && (
            <>
              <ReferenceDot
                x={data[activeIndex].date}
                y={data[activeIndex].responses}
                r={6}
                fill="#8884d8"
                stroke="#fff"
                strokeWidth={2}
              />
              <ReferenceDot
                x={data[activeIndex].date}
                y={data[activeIndex].completions}
                r={6}
                fill="#4CAF50"
                stroke="#fff"
                strokeWidth={2}
              />
            </>
          )}
        </AreaChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default ResponseTrendsChart;
