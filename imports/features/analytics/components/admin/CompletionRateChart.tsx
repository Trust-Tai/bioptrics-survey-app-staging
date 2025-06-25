// CompletionRateChart.tsx
import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { FiPieChart, FiChevronDown } from 'react-icons/fi';

interface CompletionRateChartProps {
  data: {
    completed: number;
    incomplete: number;
  };
  title?: string;
  onDateRangeChange?: (dateRange: DateRangeOption) => void;
  initialDateRange?: DateRangeOption;
}

interface PieSegment {
  value: number;
  color: string;
  label: string;
}

type DateRangeOption = 'today' | 'current_week' | 'last_7_days' | 'last_week' | 'current_month' | 'last_month' | 'last_3_months';

const ChartContainer = styled.div`
  height: 450px;
  position: relative;
  padding: 24px 24px 16px 24px;
  background-color: #ffffff;
  border-radius: 16px;
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
  margin: 10px 0;
  display: flex;
  flex-direction: column;
  text-align: center;
  width: 100%;
  
  @media (max-width: 768px) {
    padding: 16px;
    height: 400px;
  }
`;

const ChartHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
`;

const ChartTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  color: #333;
  margin: 0;
  display: flex;
  align-items: center;
  gap: 12px;
  
  svg {
    color: #4285F4;
    font-size: 22px;
  }
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const DateRangeSelector = styled.div`
  position: relative;
  z-index: 10;
  min-width: 150px;
`;

const DateRangeButton = styled.button`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 16px;
  font-size: 14px;
  font-weight: 500;
  color: #333;
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
  width: 100%;
  justify-content: space-between;
  
  &:hover {
    background-color: #f0f0f0;
    border-color: #d0d0d0;
  }
  
  svg {
    font-size: 18px;
    color: #4285F4;
  }
`;

const DateRangeDropdown = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: 100%;
  right: 0;
  background: white;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
  display: ${props => (props.$isOpen ? 'block' : 'none')};
  z-index: 100;
  width: 200px;
  margin-top: 8px;
  overflow: hidden;
  animation: ${props => (props.$isOpen ? 'fadeIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none')};
  
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const DateRangeOption = styled.div<{ $isActive: boolean }>`
  padding: 12px 18px;
  cursor: pointer;
  background: ${props => (props.$isActive ? '#EBF2FE' : 'transparent')};
  color: ${props => (props.$isActive ? '#1967D2' : '#333')};  
  font-weight: ${props => (props.$isActive ? '500' : 'normal')};
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &:hover {
    background: ${props => (props.$isActive ? '#D9E7FD' : '#f8f9fa')};
  }
  
  &:not(:last-child) {
    border-bottom: 1px solid #f0f0f0;
  }
  
  &:after {
    content: ${props => (props.$isActive ? '"✓"' : '""')};
    color: #1967D2;
    font-weight: bold;
  }
`;

const PieChartContainer = styled.div`
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-between;
  flex-grow: 1;
  position: relative;
  padding: 20px 0;
  
  @media (max-width: 768px) {
    flex-direction: column;
  }
`;

const PieChart = styled.div`
  width: 260px;
  height: 260px;
  position: relative;
  border-radius: 50%;
  overflow: visible;
  transition: transform 0.3s ease;
  background-color: transparent;
  
  &:hover {
    transform: scale(1.02);
  }
`;

const DonutSlice = styled.div<{ percentage: number; color: string; rotation: number }>`
  position: absolute;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: conic-gradient(
    ${props => props.color} 0deg,
    ${props => props.color} ${props => props.percentage * 3.6}deg,
    transparent ${props => props.percentage * 3.6}deg,
    transparent 360deg
  );
  transform: rotate(${props => props.rotation}deg);
  transform-origin: center;
  transition: all 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
  filter: drop-shadow(0px 2px 4px rgba(0, 0, 0, 0.1));
  
  &:hover {
    filter: brightness(1.05) drop-shadow(0px 3px 5px rgba(0, 0, 0, 0.15));
  }
`;

const Legend = styled.div`
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 12px;
  padding: 16px 20px;
  background-color: #f8f9fa;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
  width: 200px;
  margin-left: 30px;
  
  @media (max-width: 768px) {
    margin-left: auto;
    margin-right: auto;
    margin-top: 20px;
    width: 260px;
  }
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 14px;
  color: #333;
  font-weight: 500;
  padding: 6px 10px;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  width: 100%;
  
  &:hover {
    background-color: rgba(0, 0, 0, 0.04);
  }
`;

const LegendColor = styled.div<{ color: string }>`
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background-color: ${props => props.color};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const PercentageLabel = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  font-size: 36px;
  font-weight: 700;
  color: #333;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: white;
  width: 120px;
  height: 120px;
  border-radius: 50%;
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  z-index: 2;
`;

const NoDataMessage = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: #777;
  font-style: italic;
  text-align: center;
  width: 100%;
`;

const CompletionRateChart: React.FC<CompletionRateChartProps> = ({ 
  data, 
  title = 'Survey Completion Rate',
  onDateRangeChange,
  initialDateRange = 'last_7_days'
}) => {
  const [dateRange, setDateRange] = useState<DateRangeOption>(initialDateRange);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  
  // Calculate the total and completion percentage
  const total = data.completed + data.incomplete;
  const completionPercentage = total > 0 ? Math.round((data.completed / total) * 100) : 0;
  
  // Create segments for the two-color pie chart
  const segments: PieSegment[] = [
    {
      value: data.completed,
      color: '#4CAF50', // Green
      label: 'Completed'
    },
    {
      value: data.incomplete,
      color: '#E53935', // Red
      label: 'Incomplete'
    }
  ];
  
  // Yellow background for the donut chart
  const donutBackgroundColor = '#FFEB3B';
  
  // Ensure we have non-zero values for visual display
  const hasData = total > 0;
  const visualSegments = [...segments];
  
  if (!hasData) {
    visualSegments[0].value = 1;
    visualSegments[1].value = 1;
  }
  
  const totalSegments = visualSegments.reduce((sum, segment) => sum + segment.value, 0);
  
  // Animation effect
  useEffect(() => {
    // Animation setup could be done here if needed
    return () => {
      // Cleanup function if needed
    };
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
  
  // Get date range text for display
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
    <ChartContainer className="completion-rate-chart">
      <ChartHeader>
        <ChartTitle>
          <FiPieChart style={{ marginRight: '8px', verticalAlign: 'middle' }} />
          {title}
        </ChartTitle>
        
        <DateRangeSelector data-dropdown>
          <DateRangeButton onClick={() => setDropdownOpen(!dropdownOpen)}>
            <span>{getDateRangeText()}</span>
            <FiChevronDown style={{ transform: dropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s ease' }} />
          </DateRangeButton>
          <DateRangeDropdown $isOpen={dropdownOpen}>
            <DateRangeOption 
              $isActive={dateRange === 'today'}
              onClick={() => { 
                setDateRange('today'); 
                setDropdownOpen(false);
                onDateRangeChange && onDateRangeChange('today');
              }}
            >
              Today
            </DateRangeOption>
            <DateRangeOption 
              $isActive={dateRange === 'current_week'}
              onClick={() => { 
                setDateRange('current_week'); 
                setDropdownOpen(false);
                onDateRangeChange && onDateRangeChange('current_week');
              }}
            >
              Current Week
            </DateRangeOption>
            <DateRangeOption 
              $isActive={dateRange === 'last_7_days'}
              onClick={() => { 
                setDateRange('last_7_days'); 
                setDropdownOpen(false);
                onDateRangeChange && onDateRangeChange('last_7_days');
              }}
            >
              Last 7 Days
            </DateRangeOption>
            <DateRangeOption 
              $isActive={dateRange === 'last_week'}
              onClick={() => { 
                setDateRange('last_week'); 
                setDropdownOpen(false);
                onDateRangeChange && onDateRangeChange('last_week');
              }}
            >
              Last Week
            </DateRangeOption>
            <DateRangeOption 
              $isActive={dateRange === 'current_month'}
              onClick={() => { 
                setDateRange('current_month'); 
                setDropdownOpen(false);
                onDateRangeChange && onDateRangeChange('current_month');
              }}
            >
              Current Month
            </DateRangeOption>
            <DateRangeOption 
              $isActive={dateRange === 'last_month'}
              onClick={() => { 
                setDateRange('last_month'); 
                setDropdownOpen(false);
                onDateRangeChange && onDateRangeChange('last_month');
              }}
            >
              Last Month
            </DateRangeOption>
            <DateRangeOption 
              $isActive={dateRange === 'last_3_months'}
              onClick={() => { 
                setDateRange('last_3_months'); 
                setDropdownOpen(false);
                onDateRangeChange && onDateRangeChange('last_3_months');
              }}
            >
              Last 3 Months
            </DateRangeOption>
          </DateRangeDropdown>
        </DateRangeSelector>
      </ChartHeader>
      
      {!hasData ? (
        <div style={{ position: 'relative', height: '250px', width: '100%' }}>
          <NoDataMessage>
            <div style={{ fontSize: '18px', marginBottom: '10px' }}>No Data Available</div>
            <div style={{ fontSize: '14px', color: '#999' }}>No survey responses found for the selected date range</div>
          </NoDataMessage>
        </div>
      ) : (
        <PieChartContainer>
          <PieChart>
            {/* Yellow background donut */}
            <div style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              borderRadius: '50%',
              background: donutBackgroundColor,
              zIndex: 0
            }} />
            
            {/* Inner white circle to create donut effect */}
            <div style={{
              position: 'absolute',
              width: '70%',
              height: '70%',
              borderRadius: '50%',
              background: 'white',
              top: '15%',
              left: '15%',
              zIndex: 1
            }} />
            
            {/* Render the colored segments */}
            {visualSegments.map((segment, index) => {
              // Calculate percentage and rotation for each segment
              const percentage = totalSegments > 0 ? (segment.value / totalSegments) * 100 : 0;
              const previousSegmentsSum = visualSegments
                .slice(0, index)
                .reduce((sum, seg) => sum + (seg.value / totalSegments) * 100, 0);
              const rotation = previousSegmentsSum * 3.6; // 3.6 = 360 / 100
              
              return (
                <div key={index} style={{
                  position: 'absolute',
                  width: '100%',
                  height: '100%',
                  zIndex: 2
                }}>
                  <svg width="100%" height="100%" viewBox="0 0 100 100">
                    <defs>
                      <clipPath id={`segment-clip-${index}`}>
                        <path d={`M 50 50 L 50 0 A 50 50 0 ${percentage > 50 ? 1 : 0} 1 ${50 + 50 * Math.sin(2 * Math.PI * percentage / 100)} ${50 - 50 * Math.cos(2 * Math.PI * percentage / 100)} Z`} 
                          transform={`rotate(${rotation}, 50, 50)`} />
                      </clipPath>
                    </defs>
                    <circle cx="50" cy="50" r="50" fill={segment.color} clipPath={`url(#segment-clip-${index})`} />
                  </svg>
                </div>
              );
            })}
            <PercentageLabel>
              <span>{completionPercentage}%</span>
              <span style={{ fontSize: '14px', fontWeight: 500, marginTop: '5px', opacity: 0.7 }}>Completion</span>
            </PercentageLabel>
          </PieChart>
          
          <Legend>
            {segments.map((segment, index) => (
              <LegendItem key={index}>
                <LegendColor color={segment.color} />
                <span>{segment.label} ({data[index === 0 ? 'completed' : 'incomplete']})</span>
              </LegendItem>
            ))}
          </Legend>
        </PieChartContainer>
      )}
    </ChartContainer>
  );
};

export default CompletionRateChart;
