import React, { useState, useEffect } from 'react';
import { Meteor } from 'meteor/meteor';
import styled from 'styled-components';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useTheme } from '/imports/contexts/ThemeContext';

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

interface ResponseRateChartProps {
  data: Array<{
    date: string;
    count: number;
  }>;
  title?: string;
}

type DateRangeOption = 'today' | 'current_week' | 'last_7_days' | 'last_week' | 'current_month' | 'last_month' | 'last_3_months';

const ResponseRateChart: React.FC<ResponseRateChartProps> = ({ data, title = 'Daily Survey Response Rate' }) => {
  const theme = useTheme();
  const [highlightedIndex, setHighlightedIndex] = useState<number | null>(null);
  const [animateIn, setAnimateIn] = useState(false);
  const [dateRange, setDateRange] = useState<DateRangeOption>('last_7_days');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Filter data based on selected date range
  const filteredData = React.useMemo<Array<{date: string; count: number}>>(() => {
    const now = new Date();
    let startDate: Date;
    
    switch (dateRange) {
      case 'today': {
        // Set start date to beginning of today
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        return data.filter((item: {date: string; count: number}) => {
          const date = new Date(item.date);
          return date.getFullYear() === now.getFullYear() && 
                 date.getMonth() === now.getMonth() && 
                 date.getDate() === now.getDate();
        });
      }
      case 'current_week': {
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek);
        break;
      }
      case 'last_7_days':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
        break;
      case 'last_week': {
        const dayOfWeek = now.getDay();
        startDate = new Date(now);
        startDate.setDate(now.getDate() - dayOfWeek - 7);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        return data.filter((item: {date: string; count: number}) => {
          const date = new Date(item.date);
          return date >= startDate && date <= endDate;
        });
      }
      case 'current_month': {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      }
      case 'last_month': {
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endDate = new Date(now.getFullYear(), now.getMonth(), 0);
        return data.filter((item: {date: string; count: number}) => {
          const date = new Date(item.date);
          return date >= startDate && date <= endDate;
        });
      }
      case 'last_3_months':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 3);
        break;
      default:
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 6);
    }
    
    return data.filter((item: {date: string; count: number}) => new Date(item.date) >= startDate);
  }, [data, dateRange]);
  
  // Sort data by date and ensure complete date range
  const sortedData = React.useMemo<Array<{date: string; count: number}>>(() => {
    const sorted = [...filteredData].sort((a: {date: string; count: number}, b: {date: string; count: number}) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
    
    // Ensure we have data for all days in the selected range
    if (sorted.length === 0) return [];
    
    const result: Array<{date: string; count: number}> = [...sorted];
    const startDate = new Date(sorted[0].date);
    const endDate = new Date(sorted[sorted.length - 1].date);
    
    // Fill in missing dates
    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      const exists = result.some((item: {date: string; count: number}) => {
        return new Date(item.date).toISOString().split('T')[0] === dateStr;
      });
      
      if (!exists) {
        result.push({
          date: dateStr,
          count: 0
        });
      }
      
      // Move to next day
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return result.sort((a: {date: string; count: number}, b: {date: string; count: number}) => 
      new Date(a.date).getTime() - new Date(b.date).getTime()
    );
  }, [filteredData]);
  
  // Find max value for scaling
  const maxCount = Math.max(...sortedData.map((item: {date: string; count: number}) => item.count), 1);
  
  // Calculate trend (positive if last day is higher than average)
  const average = sortedData.reduce((sum: number, item: {date: string; count: number}) => sum + item.count, 0) / (sortedData.length || 1);
  const lastDayCount = sortedData.length > 0 ? sortedData[sortedData.length - 1].count : 0;
  const trend = lastDayCount - average;
  const trendPercentage = average > 0 ? Math.round((trend / average) * 100) : 0;
  
  // Format date for display
  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return `${date.getMonth() + 1}/${date.getDate()}`;
  };
  
  // Format date with month name for display
  const formatFullDate = (dateStr: string) => {
    const date = new Date(dateStr);
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${monthNames[date.getMonth()]} ${date.getDate()}`;
  };
  
  // Get display name for date range options
  const getDateRangeDisplayName = (option: DateRangeOption): string => {
    switch (option) {
      case 'today': return 'Today';
      case 'current_week': return 'Current Week';
      case 'last_7_days': return 'Last 7 Days';
      case 'last_week': return 'Last Week';
      case 'current_month': return 'Current Month';
      case 'last_month': return 'Last Month';
      case 'last_3_months': return 'Last 3 Months';
      default: return 'Last 7 Days';
    }
  };
  
  // Toggle dropdown
  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
  
  // Handle option selection
  const handleSelectOption = (option: DateRangeOption) => {
    setDateRange(option);
    setDropdownOpen(false);
  };
  
  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.date-filter-dropdown')) {
        setDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // Trigger animation on mount
  useEffect(() => {
    setAnimateIn(true);
  }, []);
  
  // Only show a subset of dates on the x-axis to avoid overcrowding
  const displayedDates = sortedData.filter((_: {date: string; count: number}, index: number) => 
    index % Math.ceil(sortedData.length / 10) === 0
  );
  
  // Generate y-axis tick values (0 at bottom, max at top)
  const yAxisTicks = [0, maxCount / 4, maxCount / 2, (3 * maxCount) / 4, maxCount].map(Math.round);
  
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <CustomTooltipContainer>
          <TooltipItem>
            <span>{label}: {payload[0].value}%</span>
          </TooltipItem>
        </CustomTooltipContainer>
      );
    }
    return null;
  };

  return (
    <ChartContainer>
      <ChartHeader>
        <div>
          <ChartTitle>{title}</ChartTitle>
          <ChartSubtitle>Daily response rate percentage</ChartSubtitle>
        </div>
      </ChartHeader>
      
      <ResponsiveContainer width="100%" height={250}>
        <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={theme.primaryColor + '30'} />
          <XAxis 
            dataKey="date" 
            tick={{ fontSize: 12, fill: theme.textColor }}
            axisLine={{ stroke: theme.primaryColor + '60' }}
          />
          <YAxis 
            tick={{ fontSize: 12, fill: theme.textColor }}
            axisLine={{ stroke: theme.primaryColor + '60' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Line 
            type="monotone" 
            dataKey="rate" 
            stroke={theme.primaryColor} 
            strokeWidth={3}
            dot={{ fill: theme.primaryColor, strokeWidth: 2, r: 4 }}
            activeDot={{ r: 6, fill: theme.primaryColor }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartContainer>
  );
};

export default ResponseRateChart;
