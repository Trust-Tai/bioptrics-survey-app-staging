// CompletionTimeChart.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiTrendingUp, FiTrendingDown, FiChevronDown, FiClock } from 'react-icons/fi';

interface CompletionTimeChartProps {
  data: Array<{
    date: string;
    minutes: number;  // Average completion time in minutes for this date
  }>;
  title?: string;
}

type DateRangeOption = 'today' | 'current_week' | 'last_7_days' | 'last_week' | 'current_month' | 'last_month' | 'last_3_months';

const ChartContainer = styled.div`
  height: 400px;
  position: relative;
  padding: 20px 20px 10px 20px;
  background-color: #ffffff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
  transition: all 0.3s ease;
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  
  @media (max-width: 768px) {
    padding: 15px 15px 10px 15px;
    height: 360px;
  }
`;

const BarContainer = styled.div`
  display: flex;
  align-items: flex-end;
  height: 220px;
  margin-top: 40px;
  position: relative;
  padding-left: 60px;
  flex-grow: 1;
  margin-bottom: 30px;
  
  &:after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background-color: #e0e0e0;
  }
`;

const Bar = styled.div<{ height: string; isHighlighted: boolean; isEmpty: boolean }>`
  flex: 1;
  margin: 0 4px;
  height: ${props => props.height};
  min-height: ${props => props.isEmpty ? '5px' : '0'};
  background: ${props => props.isEmpty ? '#e0e0e0' : props.isHighlighted ? 'linear-gradient(180deg, #4a90e2 0%, #357ABD 100%)' : 'linear-gradient(180deg, #5a9de4 0%, #4a90e2 100%)'};
  border-radius: 6px 6px 0 0;
  position: relative;
  transition: all 0.3s ease;
  transform-origin: bottom;
  animation: ${props => props.isEmpty ? 'none' : 'growUp 0.5s ease-out'};
  cursor: pointer;
  
  &:hover {
    background: ${props => props.isEmpty ? '#e0e0e0' : 'linear-gradient(180deg, #4a90e2 0%, #2a70c2 100%)'};
    box-shadow: ${props => props.isEmpty ? 'none' : '0 0 10px rgba(74, 144, 226, 0.3)'};
  }
  
  @keyframes growUp {
    from { height: 0; }
    to { height: ${props => props.height}; }
  }
`;

const Tooltip = styled.div<{ visible: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(33, 33, 33, 0.9);
  color: white;
  padding: 8px 12px;
  border-radius: 6px;
  font-size: 13px;
  opacity: ${props => (props.visible ? 1 : 0)};
  transition: all 0.3s ease;
  pointer-events: none;
  white-space: nowrap;
  z-index: 10;
  margin-bottom: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  
  &:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -5px;
    border-width: 5px;
    border-style: solid;
    border-color: #333 transparent transparent transparent;
  }
`;

const XAxisLabels = styled.div`
  display: flex;
  justify-content: space-between;
  padding-top: 5px;
  margin-left: 60px;
  font-size: 12px;
  color: #666;
  margin-bottom: 5px;
`;

const XAxisLabel = styled.div`
  flex: 1;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 0 2px;
`;

const YAxisLabels = styled.div`
  position: absolute;
  left: 20px;
  top: 80px;
  height: 220px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  font-size: 12px;
  color: #555;
  font-weight: 500;
  width: 35px;
  text-align: right;
`;

const YAxisLabel = styled.div`
  position: relative;
  padding-right: 5px;
  font-size: 11px;
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  white-space: nowrap;
  letter-spacing: 0.3px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 10px;
  margin-left: 15px;
  border-bottom: 1px solid #f0f0f0;
  padding-bottom: 10px;
`;

const TrendIndicator = styled.div<{ isPositive: boolean }>`
  display: flex;
  align-items: center;
  color: ${props => (props.isPositive ? '#4caf50' : '#f44336')};
  font-size: 14px;
  font-weight: 600;
  margin-left: 10px;
  padding: 4px 8px;
  border-radius: 16px;
  background-color: ${props => (props.isPositive ? 'rgba(76, 175, 80, 0.1)' : 'rgba(244, 67, 54, 0.1)')};
  transition: all 0.3s ease;
  
  &:hover {
    background-color: ${props => (props.isPositive ? 'rgba(76, 175, 80, 0.2)' : 'rgba(244, 67, 54, 0.2)')};
  }
`;

const TrendIcon = styled.div`
  margin-right: 5px;
  display: flex;
  align-items: center;
  animation: pulse 1.5s infinite;
  
  @keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.2); }
    100% { transform: scale(1); }
  }
`;

const DateRangeSelector = styled.div`
  position: relative;
  display: inline-block;
`;

const DateRangeButton = styled.button`
  background: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 20px;
  padding: 8px 16px;
  font-size: 14px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 5px;
  transition: all 0.2s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
  
  &:hover {
    background: #f0f0f0;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }
  
  &:focus {
    outline: none;
    box-shadow: 0 0 0 2px rgba(74, 144, 226, 0.3);
  }
`;

const DateRangeDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
  display: ${props => (props.isOpen ? 'block' : 'none')};
  z-index: 100;
  width: 180px;
  margin-top: 8px;
  overflow: hidden;
  animation: ${props => (props.isOpen ? 'fadeIn 0.2s ease' : 'none')};
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const DateRangeOption = styled.div<{ isActive: boolean }>`
  padding: 10px 16px;
  cursor: pointer;
  background: ${props => (props.isActive ? '#f0f7ff' : 'transparent')};
  color: ${props => (props.isActive ? '#2a70c2' : '#333')};  
  font-weight: ${props => (props.isActive ? '500' : 'normal')};
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => (props.isActive ? '#e0f0ff' : '#f5f5f5')};
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
`;

const BarLabel = styled.div`
  position: absolute;
  bottom: -25px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  font-weight: 500;
  color: #555;
  white-space: nowrap;
  padding: 0 2px;
  transition: all 0.2s ease;
`;

const NoDataMessage = styled.div`
  color: #555;
  font-style: italic;
  text-align: center;
  width: 100%;
  padding: 40px 20px;
  margin: 40px auto;
  background-color: rgba(245, 245, 245, 0.9);
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 200px;
`;

const CompletionTimeChart: React.FC<CompletionTimeChartProps> = ({ data, title = 'Survey Completion Time' }) => {
  console.log('CompletionTimeChart received data:', data);
  const [tooltipVisible, setTooltipVisible] = useState<{ [key: number]: boolean }>({});
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeOption>('last_7_days');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Filter data based on selected date range
  const filteredData = React.useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const startDate = new Date(today);
    
    switch (dateRange) {
      case 'today':
        // Just today
        break;
      case 'current_week':
        // Start of current week (Sunday)
        startDate.setDate(today.getDate() - today.getDay());
        break;
      case 'last_7_days':
        // Last 7 days
        startDate.setDate(today.getDate() - 6);
        break;
      case 'last_week':
        // Last week (Sunday to Saturday)
        startDate.setDate(today.getDate() - today.getDay() - 7);
        const endOfLastWeek = new Date(startDate);
        endOfLastWeek.setDate(startDate.getDate() + 6);
        return data.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= startDate && itemDate <= endOfLastWeek;
        });
      case 'current_month':
        // Start of current month
        startDate.setDate(1);
        break;
      case 'last_month':
        // Last month
        startDate.setMonth(today.getMonth() - 1);
        startDate.setDate(1);
        const endOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
        return data.filter(item => {
          const itemDate = new Date(item.date);
          return itemDate >= startDate && itemDate <= endOfLastMonth;
        });
      case 'last_3_months':
        // Last 3 months
        startDate.setMonth(today.getMonth() - 3);
        break;
    }
    
    // For most options, filter from start date to today
    return data.filter(item => {
      const itemDate = new Date(item.date);
      return itemDate >= startDate && itemDate <= today;
    });
  }, [data, dateRange]);
  
  // Ensure we have data for every day in the range
  const sortedData = React.useMemo(() => {
    console.log('Filtering data for chart:', filteredData);
    if (!filteredData || !filteredData.length) {
      console.log('No filtered data available');
      return [];
    }
    
    // Sort by date
    const sorted = [...filteredData].sort((a, b) => {
      return new Date(a.date).getTime() - new Date(b.date).getTime();
    });
    console.log('Sorted data:', sorted);
    
    // Find the date range
    const startDate = new Date(sorted[0].date);
    const endDate = new Date(sorted[sorted.length - 1].date);
    
    // Create a map of existing dates
    const dateMap = new Map();
    sorted.forEach(item => {
      dateMap.set(item.date, item);
    });
    
    // Fill in missing dates
    const result = [];
    const currentDate = new Date(startDate);
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      if (dateMap.has(dateStr)) {
        result.push(dateMap.get(dateStr));
      } else {
        // Add a zero entry for this date - but only if it's not the last day in the range
        // This prevents empty bars at the end of the chart
        if (currentDate.getTime() !== endDate.getTime()) {
          result.push({
            date: dateStr,
            minutes: 0
          });
        }
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return result.filter(item => item.minutes > 0); // Only show days with data
  }, [filteredData]);
  
  // Calculate trend (negative trend is good - completion time decreasing)
  const average = sortedData.reduce((sum, item) => sum + item.minutes, 0) / (sortedData.length || 1);
  const lastDayMinutes = sortedData.length > 0 ? sortedData[sortedData.length - 1].minutes : 0;
  const trend = average - lastDayMinutes; // Positive if getting faster (time decreasing)
  const trendPercentage = average > 0 ? Math.round((trend / average) * 100) : 0;
  const isPositiveTrend = trend > 0; // Positive trend means completion time is decreasing (good)
  
  // Calculate the maximum value for scaling the bars
  const maxValue = React.useMemo(() => {
    if (!sortedData || !sortedData.length) {
      console.log('No sorted data available for max calculation');
      return 1; // Default to 1 for empty data
    }
    const max = Math.max(...sortedData.map(item => item.minutes || 0));
    console.log('Max value calculated:', max || 1);
    return max || 1;
  }, [sortedData]);
  
  // Animation effect
  useEffect(() => {
    setAnimateIn(true);
    return () => setAnimateIn(false);
  }, []);
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('[data-dropdown]')) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Get Y-axis labels
  const getYAxisLabels = () => {
    const labels = [];
    // Use a fixed scale if maxValue is very small
    const effectiveMax = Math.max(maxValue, 1.0);
    const step = effectiveMax / 4;
    
    for (let i = 0; i <= 4; i++) {
      // Round to 1 decimal place and ensure we have some variation
      const value = Math.max(Math.round(step * i * 10) / 10, i * 0.25);
      labels.unshift(value);
    }
    return labels;
  };
  
  // Get date range display text
  const getDateRangeText = () => {
    switch (dateRange) {
      case 'today':
        return 'Today';
      case 'current_week':
        return 'Current Week';
      case 'last_7_days':
        return 'Last 7 Days';
      case 'last_week':
        return 'Last Week';
      case 'current_month':
        return 'Current Month';
      case 'last_month':
        return 'Last Month';
      case 'last_3_months':
        return 'Last 3 Months';
      default:
        return 'Custom Range';
    }
  };
  
  return (
    <ChartContainer className="completion-time-chart">
      <ChartHeader>
        <ChartTitle>
          <div>
            <FiClock style={{ marginRight: '8px', verticalAlign: 'middle' }} />
            {title}
          </div>
          {sortedData.length > 0 && (
            <TrendIndicator isPositive={isPositiveTrend}>
              <TrendIcon>
                {isPositiveTrend ? <FiTrendingUp /> : <FiTrendingDown />}
              </TrendIcon>
              {Math.abs(trendPercentage)}% {isPositiveTrend ? 'faster' : 'slower'}
            </TrendIndicator>
          )}
        </ChartTitle>
        
        <DateRangeSelector data-dropdown>
          <DateRangeButton onClick={() => setDropdownOpen(!dropdownOpen)}>
            {getDateRangeText()}
            <FiChevronDown />
          </DateRangeButton>
          <DateRangeDropdown isOpen={dropdownOpen}>
            <DateRangeOption 
              isActive={dateRange === 'today'}
              onClick={() => { setDateRange('today'); setDropdownOpen(false); }}
            >
              Today
            </DateRangeOption>
            <DateRangeOption 
              isActive={dateRange === 'current_week'}
              onClick={() => { setDateRange('current_week'); setDropdownOpen(false); }}
            >
              Current Week
            </DateRangeOption>
            <DateRangeOption 
              isActive={dateRange === 'last_7_days'}
              onClick={() => { setDateRange('last_7_days'); setDropdownOpen(false); }}
            >
              Last 7 Days
            </DateRangeOption>
            <DateRangeOption 
              isActive={dateRange === 'last_week'}
              onClick={() => { setDateRange('last_week'); setDropdownOpen(false); }}
            >
              Last Week
            </DateRangeOption>
            <DateRangeOption 
              isActive={dateRange === 'current_month'}
              onClick={() => { setDateRange('current_month'); setDropdownOpen(false); }}
            >
              Current Month
            </DateRangeOption>
            <DateRangeOption 
              isActive={dateRange === 'last_month'}
              onClick={() => { setDateRange('last_month'); setDropdownOpen(false); }}
            >
              Last Month
            </DateRangeOption>
            <DateRangeOption 
              isActive={dateRange === 'last_3_months'}
              onClick={() => { setDateRange('last_3_months'); setDropdownOpen(false); }}
            >
              Last 3 Months
            </DateRangeOption>
          </DateRangeDropdown>
        </DateRangeSelector>
      </ChartHeader>
      
      {sortedData.length > 0 ? (
        <>
          <YAxisLabels>
            {getYAxisLabels().map((label, index) => (
              <YAxisLabel key={index}>{label.toFixed(1)} min</YAxisLabel>
            ))}
          </YAxisLabels>
          
          <BarContainer>
            {sortedData.map((item, index) => {
              const height = item.minutes > 0 ? `${(item.minutes / maxValue) * 100}%` : '5px';
              const isHighlighted = index === highlightedIndex;
              const isEmpty = item.minutes === 0;
              
              return (
                <Bar 
                  key={item.date} 
                  height={height} 
                  isHighlighted={isHighlighted}
                  isEmpty={isEmpty}
                  onMouseEnter={() => {
                    setHighlightedIndex(index);
                    setTooltipVisible(prev => ({ ...prev, [index]: true }));
                  }}
                  onMouseLeave={() => {
                    setHighlightedIndex(null);
                    setTooltipVisible(prev => ({ ...prev, [index]: false }));
                  }}
                >
                  <Tooltip visible={tooltipVisible[index] || false}>
                    {formatDate(item.date)}: {item.minutes} min
                    {isEmpty && ' (No data)'}
                  </Tooltip>
                </Bar>
              );
            })}
          </BarContainer>
          
          <XAxisLabels>
            {sortedData.map((item, index) => {
              // Only show some labels to avoid overcrowding
              const showLabel = sortedData.length <= 10 || index % Math.ceil(sortedData.length / 10) === 0;
              return (
                <XAxisLabel key={item.date}>
                  {showLabel ? formatDate(item.date) : ''}
                </XAxisLabel>
              );
            })}
          </XAxisLabels>
        </>
      ) : (
        <NoDataMessage>
          <div style={{ fontSize: '18px', marginBottom: '8px' }}>No data available</div>
          <div>Try selecting a different date range</div>
        </NoDataMessage>
      )}
    </ChartContainer>
  );
};

export default CompletionTimeChart;