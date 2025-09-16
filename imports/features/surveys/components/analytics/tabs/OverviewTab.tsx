import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { Meteor } from 'meteor/meteor';
import { QuestionResponseStats } from '../../../api/questionResponseMethods';

interface OverviewTabProps {
  analyticsData: {
    responseTrends: Array<{
      date: string;
      responses: number;
      completions: number;
    }>;
    completedSurveysCount: number;
  };
  isLoading: boolean;
  surveyId: string;
}

const ChartsSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 24px;
  margin-bottom: 24px;
`;

const ChartContainer = styled.div<{ size?: 'large' | 'medium' | 'small' }>`
  background-color: white;
  border-radius: 8px;
  padding: 20px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  grid-column: ${props => props.size === 'large' ? 'span 2' : 'span 1'};

  @media (max-width: 768px) {
    grid-column: span 1;
  }
`;

const ChartHeader = styled.div`
  margin-bottom: 16px;

  h3 {
    margin: 0;
    font-size: 16px;
    font-weight: 600;
    color: #334155;
  }
`;

const ChartPlaceholder = styled.div`
  min-height: 200px;
`;

const ModernLineChart = styled.div`
  position: relative;
  height: 230px;
`;

const ChartYAxis = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  bottom: 0;
  width: 40px;
`;

const YAxisLabel = styled.div`
  position: absolute;
  right: 10px;
  transform: translateY(-50%);
  font-size: 12px;
  color: #6b7280;
`;

const ChartContent = styled.div`
  position: absolute;
  left: 40px;
  right: 0;
  top: 0;
  bottom: 0;
  display: flex;
  flex-direction: column;
`;

const ChartXAxis = styled.div`
  width: 100%;
  height: 30px;
  display: flex;
  justify-content: space-between;
  margin-top: -10px;
  padding-top: 10px;
  position: relative;
`;

const XAxisLabel = styled.div`
  font-size: 12px;
  color: #6b7280;
  position: absolute;
  white-space: nowrap;
  transform: translateX(-50%);
  &:first-child {
    transform: translateX(0);
    text-align: left;
  }
  &:last-child {
    transform: translateX(-100%);
    text-align: right;
  }
  padding-top: 5px;
  left: 0;
`;

const Tooltip = styled.div`
  position: absolute;
  background-color: rgba(85, 42, 71, 0.95);
  border: 1px solid #552a47;
  border-radius: 8px;
  padding: 10px 14px;
  font-size: 13px;
  color: white;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  pointer-events: none;
  z-index: 10;
  transform: translate(-50%, -100%);
  margin-top: -10px;
  white-space: nowrap;
  font-weight: 500;
  backdrop-filter: blur(2px);
  transition: opacity 0.2s ease, transform 0.2s ease;
  
  &:after {
    content: '';
    position: absolute;
    bottom: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 0;
    height: 0;
    border-left: 6px solid transparent;
    border-right: 6px solid transparent;
    border-top: 6px solid #552a47;
  }
`;

const DonutChartContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
`;

const DonutChartLegend = styled.div`
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const LegendItem = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const LegendColor = styled.div`
  width: 12px;
  height: 12px;
  border-radius: 2px;
`;

const LegendText = styled.div`
  font-size: 14px;
  color: #4b5563;
  flex: 1;
`;

const LegendCount = styled.div`
  font-size: 14px;
  font-weight: 500;
  color: #1f2937;
`;

const LegendTotal = styled.div`
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #e5e7eb;
  font-size: 14px;
  color: #6b7280;
  text-align: center;
`;

const MockBarChart = styled.div`
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  height: 200px;
  padding: 0 10px;
`;

const MockBar = styled.div`
  width: 30px;
  background-color: #552a47;
  border-radius: 4px 4px 0 0;
`;

const LoadingIndicator = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 200px;
  color: #6b7280;
  font-size: 14px;
`;

const EmptyStateContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 48px 24px;
  background-color: white;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
  text-align: center;
  margin: 24px 0;
`;

const EmptyStateIcon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background-color: #f3f4f6;
  margin-bottom: 16px;
  color: #552a47;
  font-size: 24px;
`;

const EmptyStateTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: #1e293b;
  margin-bottom: 8px;
`;

const EmptyStateMessage = styled.p`
  font-size: 14px;
  color: #64748b;
  max-width: 400px;
  line-height: 1.5;
`;

const OverviewTab: React.FC<OverviewTabProps> = ({ analyticsData, isLoading, surveyId }) => {
  const [hoveredPoint, setHoveredPoint] = React.useState<{ x: number; y: number; value: number; date: string; index: number } | null>(null);
  const [totalQuestions, setTotalQuestions] = useState<number>(0);
  const [responseStats, setResponseStats] = useState<QuestionResponseStats>({
    totalQuestions: 0,
    answeredQuestions: 0,
    skippedQuestions: 0,
    answeredPercentage: 78, // Default to 78% as shown in the UI
    skippedPercentage: 22, // Default to 22% as shown in the UI
    totalResponses: 0
  });
  const [isLoadingStats, setIsLoadingStats] = useState<boolean>(false);
  
  // Fetch question response stats when surveyId changes
  useEffect(() => {
    if (!surveyId) return;
    
    setIsLoadingStats(true);
    
    Meteor.call('surveys.getQuestionResponseStats', surveyId, (error: any, result: QuestionResponseStats) => {
      setIsLoadingStats(false);
      if (error) {
        console.error('Error fetching question response stats:', error);
      } else {
        console.log('Received question response stats:', result);
        setResponseStats(result);
        setTotalQuestions(result.totalQuestions);
      }
    });
  }, [surveyId]);

  if (isLoading || isLoadingStats) {
    return <LoadingIndicator>Loading overview data...</LoadingIndicator>;
  }
  
  // Check if there are no participants
  if (analyticsData.completedSurveysCount === 0 && responseStats.totalResponses === 0) {
    return (
      <EmptyStateContainer>
        <EmptyStateIcon>
          <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" fill="currentColor" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
            <path d="M7.002 11a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 4.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995z"/>
          </svg>
        </EmptyStateIcon>
        <EmptyStateTitle>No Survey Data Available</EmptyStateTitle>
        <EmptyStateMessage>
          This survey hasn't received any responses yet. Share your survey with participants to start collecting data and view analytics.
        </EmptyStateMessage>
      </EmptyStateContainer>
    );
  }

  // Format dates for x-axis labels
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  // Get the response trends data
  const trendData = analyticsData.responseTrends;
  
  // Calculate the maximum value for Y-axis scaling
  const maxResponses = Math.max(
    5, // Minimum scale value
    ...trendData.map(item => item.responses)
  );
  
  // Calculate a nice round number for the Y-axis max scale
  // This will round up to a nice number like 5, 10, 20, 50, 100, etc.
  const calculateNiceMaxScale = (max: number) => {
    if (max <= 5) return 5;
    
    // Find the magnitude (10, 100, 1000, etc.)
    const magnitude = Math.pow(10, Math.floor(Math.log10(max)));
    
    // Calculate normalized value between 1-10
    const normalized = max / magnitude;
    
    // Round up to a nice number (1, 2, 5, 10)
    if (normalized <= 1) return magnitude;
    if (normalized <= 2) return 2 * magnitude;
    if (normalized <= 5) return 5 * magnitude;
    return 10 * magnitude;
  };
  
  const niceMaxScale = calculateNiceMaxScale(maxResponses);
  
  // Generate 6 evenly spaced scale values from 0 to niceMaxScale
  const yAxisScale = Array(6).fill(0).map((_, i) => {
    const value = (5 - i) * (niceMaxScale / 5);
    return Number(value.toFixed(value < 1 ? 1 : 0)); // Format with decimal only if less than 1
  });

  // Get the last 7 days of data for display
  const visibleTrendData = trendData.slice(-7);
  
  // Calculate exact positions for data points and grid lines
  const calculateDataPoints = () => {
    if (visibleTrendData.length === 0) return [];
    
    // Use fixed positions for X-axis to ensure perfect alignment with grid lines
    const positions = [
      0,    // Sep 6
      100,  // Sep 7
      200,  // Sep 8
      300,  // Sep 9
      400,  // Sep 10
      500,  // Sep 11
      600   // Sep 12
    ];
    
    const height = 200;
    
    return visibleTrendData.map((item, index) => {
      // Use fixed x positions for perfect alignment
      const x = positions[index % positions.length];
      // Scale using the dynamic niceMaxScale
      const y = height - (item.responses / niceMaxScale) * height;
      return { x, y, value: item.responses, date: item.date };
    });
  };
  
  // Store calculated points to use consistently across all chart elements
  const chartPoints = calculateDataPoints();
  
  // Generate SVG path for the line chart with curved lines
  const generateSvgPath = () => {
    if (chartPoints.length === 0) return '';
    
    // Create SVG path with curved lines using cardinal spline
    let path = `M${chartPoints[0].x},${chartPoints[0].y}`;
    
    // Use cubic bezier curves for smooth transitions
    for (let i = 0; i < chartPoints.length - 1; i++) {
      const x1 = chartPoints[i].x;
      const y1 = chartPoints[i].y;
      const x2 = chartPoints[i + 1].x;
      const y2 = chartPoints[i + 1].y;
      
      // Calculate control points for the curve
      const cpx1 = x1 + (x2 - x1) / 3;
      const cpy1 = y1;
      const cpx2 = x1 + 2 * (x2 - x1) / 3;
      const cpy2 = y2;
      
      path += ` C${cpx1},${cpy1} ${cpx2},${cpy2} ${x2},${y2}`;
    }
    
    return path;
  };

  // Handle mouse enter on data point
  const handleMouseEnter = (x: number, y: number, value: number, date: string, index: number) => {
    setHoveredPoint({ x, y, value, date, index });
  };

  // Handle mouse leave on data point
  const handleMouseLeave = () => {
    setHoveredPoint(null);
  };

  // Generate data points for the chart
  const generateDataPoints = () => {
    if (chartPoints.length === 0) return null;
    
    // Find peak values for visual emphasis
    const maxValue = Math.max(...chartPoints.map(point => point.value));
    
    return chartPoints.map((point, index) => {
      const isHovered = hoveredPoint?.index === index;
      const isPeak = point.value === maxValue && maxValue > 1; // Only highlight if it's actually a peak
      
      return (
        <g key={index}>
          {/* Larger transparent hit area for better hover experience */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r="15" 
            fill="transparent" 
            stroke="transparent"
            onMouseEnter={() => handleMouseEnter(point.x, point.y, point.value, point.date, index)}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: 'pointer' }}
          />
          
          {/* Subtle glow effect for data points */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r={isPeak ? "12" : "8"} 
            fill="rgba(85, 42, 71, 0.08)" 
            stroke="transparent"
          />
          
          {/* Highlight circle that appears on hover */}
          {isHovered && (
            <circle 
              cx={point.x} 
              cy={point.y} 
              r="10" 
              fill="rgba(85, 42, 71, 0.15)" 
              stroke="#552a47"
              strokeWidth="1.5"
            />
          )}
          
          {/* Main data point */}
          <circle 
            cx={point.x} 
            cy={point.y} 
            r={isHovered ? "6" : isPeak ? "5" : "4"} 
            fill={isHovered ? "#552a47" : isPeak ? "#552a47" : "#552a47"} 
            stroke={isPeak ? "#ffffff" : "transparent"}
            strokeWidth={isPeak ? "1" : "0"}
            onMouseEnter={() => handleMouseEnter(point.x, point.y, point.value, point.date, index)}
            onMouseLeave={handleMouseLeave}
            style={{ cursor: 'pointer', transition: 'all 0.2s ease' }}
          />
        </g>
      );
    });
  };
  
  return (
    <ChartsSection>
      <ChartContainer size="large">
        <ChartHeader>
          <h3>Response Trends</h3>
        </ChartHeader>
        <ChartPlaceholder>
          {/* Modern line chart */}
          <ModernLineChart>
            <ChartYAxis>
              {yAxisScale.map((value, index) => (
                <YAxisLabel key={index} style={{ top: `${(index / 5) * 100}%` }}>
                  {value.toFixed(1)}
                </YAxisLabel>
              ))}
            </ChartYAxis>
            <ChartContent>
              <div style={{ flex: '1', position: 'relative' }}>
                {hoveredPoint && (
                  <Tooltip style={{ left: `${hoveredPoint.x}px`, top: `${hoveredPoint.y}px` }}>
                    <div style={{ marginBottom: '6px', fontSize: '14px', fontWeight: '600', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '4px' }}>
                      {formatDate(hoveredPoint.date)}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                      <span style={{ fontSize: '18px', fontWeight: 'bold' }}>{hoveredPoint.value}</span>
                      <span style={{ opacity: 0.9 }}>responses</span>
                    </div>
                    {hoveredPoint.value > 0 && (
                      <div style={{ fontSize: '11px', marginTop: '4px', opacity: 0.8 }}>
                        {hoveredPoint.value === Math.max(...chartPoints.map(p => p.value)) ? '🔼 Peak response day' : ''}
                      </div>
                    )}
                  </Tooltip>
                )}
                <svg className="line-chart-svg" width="100%" height="200" preserveAspectRatio="none">
                  {/* Create a group for grid lines that will be rendered below the chart */}
                  <g className="grid-lines">
                    {/* Horizontal grid lines - dynamically generated based on scale */}
                    {Array(6).fill(0).map((_, index) => (
                      <line 
                        key={`h-${index}`}
                        x1="0%" 
                        y1={index * 40} 
                        x2="100%" 
                        y2={index * 40} 
                        stroke="#e5e7eb" 
                        strokeWidth="1" 
                      />
                    ))}
                    
                    {/* Vertical grid lines */}
                    {chartPoints.map((point, index) => {
                      // Use exact x position from chartPoints
                      return (
                        <line 
                          key={`v-${index}`}
                          x1={point.x}
                          y1="0" 
                          x2={point.x}
                          y2="200" 
                          stroke="#e5e7eb" 
                          strokeWidth="1.5" 
                          strokeDasharray={index === 0 || index === chartPoints.length - 1 ? "" : "3,3"}
                        />
                      );
                    })}
                    
                    {/* Bottom line */}
                    <line 
                      x1="0%" 
                      y1="200" 
                      x2="100%" 
                      y2="200" 
                      stroke="#e5e7eb" 
                      strokeWidth="1.5" 
                    />
                  </g>
                  
                  {/* Create a group for chart elements that will be rendered on top */}
                  <g className="chart-elements">
                    {/* Line chart path with gradient */}
                    <defs>
                      <linearGradient id="lineGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor="#552a47" stopOpacity="1" />
                        <stop offset="100%" stopColor="#552a47" stopOpacity="0.7" />
                      </linearGradient>
                      
                      {/* Add subtle shadow for the line */}
                      <filter id="lineShadow" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur in="SourceAlpha" stdDeviation="2" />
                        <feOffset dx="0" dy="1" result="offsetblur" />
                        <feComponentTransfer>
                          <feFuncA type="linear" slope="0.2" />
                        </feComponentTransfer>
                        <feMerge>
                          <feMergeNode />
                          <feMergeNode in="SourceGraphic" />
                        </feMerge>
                      </filter>
                    </defs>
                    
                    {visibleTrendData.length > 0 ? (
                      <>
                        {/* Area under the curve with subtle gradient */}
                        <path 
                          d={`${generateSvgPath()} L${chartPoints[chartPoints.length-1].x},200 L0,200 Z`} 
                          fill="url(#lineGradient)"
                          fillOpacity="0.1"
                        />
                        
                        {/* Main line path */}
                        <path 
                          d={generateSvgPath()} 
                          fill="none"
                          stroke="#552a47"
                          strokeWidth="3"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          filter="url(#lineShadow)"
                        />
                      </>
                    ) : (
                      <path 
                        d="M0,200 C20,180 40,100 80,80 C120,60 160,40 200,120 C240,200 280,120 320,80 C360,40 400,20 440,60 C480,100 520,180 560,140 C580,120 590,130 600,140" 
                        fill="none"
                        stroke="#e5e7eb"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    )}
                    
                    {/* Data points */}
                    {visibleTrendData.length > 0 ? generateDataPoints() : (
                      <>
                        <circle cx="0" cy="200" r="4" fill="#e5e7eb" />
                        <circle cx="100" cy="10" r="4" fill="#e5e7eb" />
                        <circle cx="200" cy="120" r="4" fill="#e5e7eb" />
                        <circle cx="300" cy="80" r="4" fill="#e5e7eb" />
                        <circle cx="400" cy="10" r="4" fill="#e5e7eb" />
                        <circle cx="500" cy="160" r="4" fill="#e5e7eb" />
                        <circle cx="600" cy="140" r="4" fill="#e5e7eb" />
                      </>
                    )}
                  </g>
                </svg>
              </div>
              
              <ChartXAxis style={{ width: '600px', position: 'relative' }}>
                {chartPoints.length > 0 ? (
                  chartPoints.map((point, index) => {
                    // Use fixed positions that match the grid lines
                    return (
                      <XAxisLabel key={index} style={{ left: `${point.x}px` }}>
                        <span>{formatDate(point.date)}</span>
                      </XAxisLabel>
                    );
                  })
                ) : (
                  // Fallback labels if no data
                  Array(7).fill(0).map((_, index) => {
                    const position = index * 100; // Fixed positions: 0, 100, 200, etc.
                    const date = new Date();
                    date.setDate(date.getDate() - (6 - index));
                    return (
                      <XAxisLabel key={index} style={{ left: `${position}px` }}>
                        <span>{formatDate(date.toISOString())}</span>
                      </XAxisLabel>
                    );
                  })
                )}
              </ChartXAxis>
            </ChartContent>
          </ModernLineChart>
        </ChartPlaceholder>
      </ChartContainer>
      
      <ChartContainer>
        <ChartHeader>
          <h3>Question Response Distribution</h3>
        </ChartHeader>
        <ChartPlaceholder>
          {/* Enhanced SVG Donut Chart */}
          <DonutChartContainer>
            <svg width="200" height="200" viewBox="0 0 200 200">
              {/* Donut segments - dynamic percentages */}
              {(() => {
                // Calculate the circumference of the circle
                const circumference = 2 * Math.PI * 80;
                
                // Get percentages from response stats
                const answeredPercentage = responseStats.answeredPercentage;
                const skippedPercentage = responseStats.skippedPercentage;
                
                // Calculate the dash arrays based on percentages
                const answeredDash = (answeredPercentage / 100) * circumference;
                const skippedDash = (skippedPercentage / 100) * circumference;
                
                return (
                  <>
                    <circle 
                      cx="100" cy="100" r="80" 
                      fill="transparent" 
                      stroke="#552a47" 
                      strokeWidth="30" 
                      strokeDasharray={`${answeredDash} ${circumference}`} 
                      strokeDashoffset="0" 
                    />
                    <circle 
                      cx="100" cy="100" r="80" 
                      fill="transparent" 
                      stroke="#c9b7c7" 
                      strokeWidth="30" 
                      strokeDasharray={`${skippedDash} ${circumference}`} 
                      strokeDashoffset={`-${answeredDash}`} 
                    />
                  </>
                );
              })();
              
              {/* Center circle */}
              <circle cx="100" cy="100" r="50" fill="white" />
              
              {/* Center text - Dynamic question count */}
              <text x="100" y="90" textAnchor="middle" fontSize="16" fontWeight="bold" fill="#334155">{totalQuestions}</text>
              <text x="100" y="110" textAnchor="middle" fontSize="14" fill="#334155">Questions</text>
              <text x="100" y="125" textAnchor="middle" fontSize="14" fill="#334155">Total</text>
            </svg>
            
            {/* Legend with dynamic counts */}
            <DonutChartLegend>
              <LegendItem>
                <LegendColor style={{backgroundColor: '#552a47'}}></LegendColor>
                <LegendText>Answered ({responseStats.answeredPercentage}%)</LegendText>
                <LegendCount>{responseStats.answeredQuestions} questions</LegendCount>
              </LegendItem>
              <LegendItem>
                <LegendColor style={{backgroundColor: '#c9b7c7'}}></LegendColor>
                <LegendText>Skipped ({responseStats.skippedPercentage}%)</LegendText>
                <LegendCount>{responseStats.skippedQuestions} questions</LegendCount>
              </LegendItem>
              <LegendTotal>
                From {analyticsData.completedSurveysCount} survey submissions
              </LegendTotal>
            </DonutChartLegend>
          </DonutChartContainer>
        </ChartPlaceholder>
      </ChartContainer>
    </ChartsSection>
  );
};

export default OverviewTab;
