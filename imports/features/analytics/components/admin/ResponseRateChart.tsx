import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiTrendingUp, FiTrendingDown, FiChevronDown } from 'react-icons/fi';

interface ResponseRateChartProps {
  data: Array<{
    date: string;
    count: number;
  }>;
  title?: string;
}

type DateRangeOption = 'today' | 'current_week' | 'last_7_days' | 'last_week' | 'current_month' | 'last_month' | 'last_3_months';

const ChartContainer = styled.div`
  height: 300px;
  position: relative;
  padding: 10px 40px 20px;
  background-color: #ffffff;
  border-radius: 8px;
`;

const BarContainer = styled.div`
  display: flex;
  height: 200px;
  align-items: flex-end;
  gap: 16px;
  margin-top: 30px;
  padding-left: 10px;
`;

const Bar = styled.div<{ height: string; isHighlighted: boolean; isEmpty?: boolean }>`
  flex: 1;
  height: ${props => props.height};
  background-color: ${props => {
    if (props.isEmpty) return '#e0e0e0';
    return props.isHighlighted ? '#552a47' : '#4a90e2';
  }};
  border-radius: 4px 4px 0 0;
  transition: all 0.4s ease;
  min-width: 30px;
  position: relative;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background-color: ${props => {
      if (props.isEmpty) return '#d0d0d0';
      return props.isHighlighted ? '#7a3e68' : '#2a70c2';
    }};
    transform: translateY(-4px);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
  }
`;

const XAxis = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 12px;
  font-size: 12px;
  color: #666;
  padding-left: 10px;
`;

const YAxis = styled.div`
  position: absolute;
  left: 0;
  top: 30px;
  height: 200px;
  display: flex;
  flex-direction: column-reverse; /* Reversed to show 0 at bottom */
  justify-content: space-between;
  font-size: 12px;
  color: #666;
  border-right: 1px dashed #eee;
  padding-right: 8px;
`;

const DateLabel = styled.div`
  font-size: 12px;
  color: #666;
  text-align: center;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 500;
`;

const Tooltip = styled.div<{ isEmpty?: boolean }>`
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%);
  background-color: ${props => props.isEmpty ? '#666' : '#552a47'};
  color: white;
  padding: 6px 12px;
  border-radius: 6px;
  font-size: 13px;
  pointer-events: none;
  opacity: 0;
  transition: opacity 0.3s;
  white-space: nowrap;
  margin-bottom: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
  z-index: 10;
  
  &:after {
    content: '';
    position: absolute;
    top: 100%;
    left: 50%;
    margin-left: -6px;
    border-width: 6px;
    border-style: solid;
    border-color: ${props => props.isEmpty ? '#666' : '#552a47'} transparent transparent transparent;
  }
  
  ${Bar}:hover & {
    opacity: 1;
  }
`;

const ChartHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  flex-wrap: wrap;
  gap: 10px;
`;

const ChartTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #552a47;
  margin: 0;
  flex: 1;
`;

const ChartSummary = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const TrendIndicator = styled.div<{ isPositive: boolean }>`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 14px;
  font-weight: 500;
  color: ${props => props.isPositive ? '#28a745' : '#dc3545'};
`;

const GridLines = styled.div`
  position: absolute;
  left: 40px;
  right: 0;
  top: 30px;
  height: 200px;
  display: flex;
  flex-direction: column-reverse; /* Reversed to show 0 at bottom */
  justify-content: space-between;
  z-index: 0;
  
  &::before {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background-color: #eee;
  }
`;

const GridLine = styled.div`
  height: 1px;
  background-color: #eee;
  width: 100%;
`;

const NoDataMessage = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #999;
  font-size: 16px;
  font-style: italic;
`;

const EmptyBarLabel = styled.div`
  position: absolute;
  top: -25px;
  left: 0;
  right: 0;
  text-align: center;
  color: #999;
  font-size: 11px;
  font-style: italic;
`;

const FilterContainer = styled.div`
  position: relative;
  min-width: 180px;
`;

const FilterButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 12px;
  background-color: #f5f5f5;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  width: 100%;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #eee;
  }
  
  svg {
    margin-left: 8px;
  }
`;

const DropdownMenu = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background-color: white;
  border: 1px solid #ddd;
  border-radius: 4px;
  margin-top: 4px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  z-index: 100;
  overflow: hidden;
  max-height: ${props => props.isOpen ? '300px' : '0'};
  opacity: ${props => props.isOpen ? '1' : '0'};
  transition: all 0.3s ease;
`;

const DropdownItem = styled.div<{ isActive: boolean }>`
  padding: 8px 12px;
  cursor: pointer;
  font-size: 14px;
  background-color: ${props => props.isActive ? '#f0f0f0' : 'transparent'};
  color: ${props => props.isActive ? '#552a47' : '#333'};
  
  &:hover {
    background-color: ${props => props.isActive ? '#f0f0f0' : '#f9f9f9'};
  }
`;

const ResponseRateChart: React.FC<ResponseRateChartProps> = ({ data, title = 'Daily Survey Response Rate' }) => {
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
  
  return (
    <ChartContainer>
      <ChartHeader>
        <ChartTitle>{title}</ChartTitle>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          {sortedData.length > 0 && (
            <ChartSummary>
              <TrendIndicator isPositive={trend >= 0}>
                {trend >= 0 ? <FiTrendingUp /> : <FiTrendingDown />}
                {Math.abs(trendPercentage)}% {trend >= 0 ? 'increase' : 'decrease'}
              </TrendIndicator>
            </ChartSummary>
          )}
          
          <FilterContainer className="date-filter-dropdown">
            <FilterButton onClick={toggleDropdown}>
              {getDateRangeDisplayName(dateRange)}
              <FiChevronDown />
            </FilterButton>
            <DropdownMenu isOpen={dropdownOpen}>
              <DropdownItem 
                isActive={dateRange === 'today'}
                onClick={() => handleSelectOption('today')}
              >
                Today
              </DropdownItem>
              <DropdownItem 
                isActive={dateRange === 'current_week'}
                onClick={() => handleSelectOption('current_week')}
              >
                Current Week
              </DropdownItem>
              <DropdownItem 
                isActive={dateRange === 'last_7_days'}
                onClick={() => handleSelectOption('last_7_days')}
              >
                Last 7 Days
              </DropdownItem>
              <DropdownItem 
                isActive={dateRange === 'last_week'}
                onClick={() => handleSelectOption('last_week')}
              >
                Last Week
              </DropdownItem>
              <DropdownItem 
                isActive={dateRange === 'current_month'}
                onClick={() => handleSelectOption('current_month')}
              >
                Current Month
              </DropdownItem>
              <DropdownItem 
                isActive={dateRange === 'last_month'}
                onClick={() => handleSelectOption('last_month')}
              >
                Last Month
              </DropdownItem>
              <DropdownItem 
                isActive={dateRange === 'last_3_months'}
                onClick={() => handleSelectOption('last_3_months')}
              >
                Last 3 Months
              </DropdownItem>
            </DropdownMenu>
          </FilterContainer>
        </div>
      </ChartHeader>
      
      <GridLines>
        {yAxisTicks.map((_, index) => (
          <GridLine key={index} />
        ))}
      </GridLines>
      
      {sortedData.length > 0 ? (
        <>
          <BarContainer>
            {sortedData.map((item: {date: string; count: number}, index: number) => {
              const barHeight = item.count > 0 ? `${(item.count / maxCount) * 100}%` : '5%';
              const isLastDay = index === sortedData.length - 1;
              const isEmpty = item.count === 0;
              
              return (
                <Bar 
                  key={index} 
                  height={animateIn ? barHeight : '0%'} 
                  isHighlighted={highlightedIndex === index || isLastDay}
                  isEmpty={isEmpty}
                  onMouseEnter={() => setHighlightedIndex(index)}
                  onMouseLeave={() => setHighlightedIndex(null)}
                >
                  {isEmpty && <EmptyBarLabel>No data</EmptyBarLabel>}
                  <Tooltip isEmpty={isEmpty}>
                    {isEmpty 
                      ? `${formatFullDate(item.date)}: No responses on this date` 
                      : `${formatFullDate(item.date)}: ${item.count} responses`}
                  </Tooltip>
                </Bar>
              );
            })}
          </BarContainer>
          
          <XAxis>
            {sortedData.map((item: {date: string; count: number}, index: number) => (
              <DateLabel key={index}>{formatFullDate(item.date)}</DateLabel>
            ))}
          </XAxis>
          
          <YAxis>
            {yAxisTicks.map((tick, index) => (
              <div key={index}>{tick}</div>
            ))}
          </YAxis>
        </>
      ) : (
        <NoDataMessage>No response data available for this period</NoDataMessage>
      )}
    </ChartContainer>
  );
};

export default ResponseRateChart;
