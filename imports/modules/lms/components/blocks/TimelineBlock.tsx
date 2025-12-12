import React from 'react';
import styled from 'styled-components';
import type { TimelineBlock as TimelineBlockType, TimelineItem } from '../../types/contentBlocks';

interface TimelineBlockProps {
  block: TimelineBlockType;
  isEditing: boolean;
  onUpdate?: (settings: any) => void;
}

const Container = styled.div`
  width: 100%;
  padding: 16px 0;
`;

// Vertical Timeline Styles
const VerticalTimeline = styled.div<{ $alternating: boolean }>`
  position: relative;
  padding: 20px 0;
  
  ${props => props.$alternating ? `
    &::before {
      content: '';
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      top: 0;
      bottom: 0;
      width: 2px;
      background: ${props => props.theme.lineColor || '#e5e7eb'};
    }
  ` : `
    &::before {
      content: '';
      position: absolute;
      left: 20px;
      top: 0;
      bottom: 0;
      width: 2px;
      background: ${props => props.theme.lineColor || '#e5e7eb'};
    }
  `}
  
  @media (max-width: 768px) {
    &::before {
      left: 20px !important;
      transform: none !important;
    }
  }
`;

const VerticalTimelineItem = styled.div<{ $alternating: boolean; $index: number; $lineColor: string }>`
  position: relative;
  margin-bottom: 32px;
  
  ${props => props.$alternating ? `
    display: flex;
    justify-content: ${props.$index % 2 === 0 ? 'flex-start' : 'flex-end'};
    padding-${props.$index % 2 === 0 ? 'right' : 'left'}: calc(50% + 30px);
    
    @media (max-width: 768px) {
      padding-left: 50px;
      padding-right: 0;
      justify-content: flex-start;
    }
  ` : `
    padding-left: 50px;
  `}
  
  &::before {
    content: '';
    position: absolute;
    left: ${props => props.$alternating ? '50%' : '20px'};
    transform: translateX(-50%);
    top: 8px;
    width: 2px;
    height: calc(100% + 32px);
    background: ${props => props.$lineColor};
    
    @media (max-width: 768px) {
      left: 20px;
    }
  }
  
  &:last-child::before {
    display: none;
  }
`;

const TimelineDot = styled.div<{ $color: string; $alternating: boolean; $index: number }>`
  position: absolute;
  left: ${props => props.$alternating ? '50%' : '20px'};
  transform: translateX(-50%);
  top: 4px;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.$color};
  border: 3px solid white;
  box-shadow: 0 0 0 2px ${props => props.$color};
  z-index: 1;
  
  @media (max-width: 768px) {
    left: 20px;
  }
`;

const TimelineIcon = styled.div<{ $color: string; $alternating: boolean }>`
  position: absolute;
  left: ${props => props.$alternating ? '50%' : '20px'};
  transform: translateX(-50%);
  top: 0;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 1;
  
  @media (max-width: 768px) {
    left: 20px;
  }
`;

const TimelineCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
  width: 100%;
  max-width: 400px;
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const TimelineDate = styled.div<{ $color: string }>`
  font-size: 13px;
  font-weight: 600;
  color: ${props => props.$color};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const TimelineTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const TimelineContent = styled.p`
  margin: 0;
  font-size: 14px;
  line-height: 1.6;
  color: #6b7280;
`;

// Horizontal Timeline Styles
const HorizontalTimeline = styled.div<{ $lineColor: string; $showIcons: boolean }>`
  position: relative;
  padding: 40px 0 20px;
  overflow-x: auto;
  
  &::before {
    content: '';
    position: absolute;
    top: ${props => props.$showIcons ? '60px' : '50px'};
    left: 0;
    right: 0;
    height: 2px;
    background: ${props => props.$lineColor};
  }
`;

const HorizontalTrack = styled.div`
  display: flex;
  gap: 32px;
  min-width: max-content;
  padding: 0 20px;
`;

const HorizontalItem = styled.div`
  position: relative;
  min-width: 220px;
  max-width: 280px;
`;

const HorizontalDot = styled.div<{ $color: string }>`
  position: absolute;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  width: 16px;
  height: 16px;
  border-radius: 50%;
  background: ${props => props.$color};
  border: 3px solid white;
  box-shadow: 0 0 0 2px ${props => props.$color};
  z-index: 1;
`;

const HorizontalIcon = styled.div<{ $color: string }>`
  position: absolute;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${props => props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  z-index: 1;
`;

const HorizontalCard = styled.div<{ $showIcons?: boolean }>`
  margin-top: ${props => props.$showIcons ? '50px' : '40px'};
  background: white;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
  border: 1px solid #e5e7eb;
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;
`;

const defaultIcons: { [key: string]: JSX.Element } = {
  check: (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
    </svg>
  ),
  star: (
    <svg width="20" height="20" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  ),
  flag: (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 21v-4m0 0V5a2 2 0 012-2h6.5l1 1H21l-3 6 3 6h-8.5l-1-1H5a2 2 0 00-2 2zm9-13.5V9" />
    </svg>
  ),
  rocket: (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.59 14.37a6 6 0 01-5.84 7.38v-4.8m5.84-2.58a14.98 14.98 0 006.16-12.12A14.98 14.98 0 009.631 8.41m5.96 5.96a14.926 14.926 0 01-5.841 2.58m-.119-8.54a6 6 0 00-7.381 5.84h4.8m2.581-5.84a14.927 14.927 0 00-2.58 5.84m2.699 2.7c-.103.021-.207.041-.311.06a15.09 15.09 0 01-2.448-2.448 14.9 14.9 0 01.06-.312m-2.24 2.39a4.493 4.493 0 00-1.757 4.306 4.493 4.493 0 004.306-1.758M16.5 9a1.5 1.5 0 11-3 0 1.5 1.5 0 013 0z" />
    </svg>
  ),
  default: (
    <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  ),
};

export const TimelineBlock: React.FC<TimelineBlockProps> = ({ block, isEditing }) => {
  const {
    items = [],
    layout = 'vertical',
    lineColor = '#e5e7eb',
    dotColor = '#6366f1',
    alternating = true,
    showDates = true,
    showIcons = false,
  } = block.settings || {};

  if (items.length === 0) {
    return (
      <Container>
        <EmptyState>
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto 12px', opacity: 0.5 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>No timeline items added yet</div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>Add timeline items in the settings panel</div>
        </EmptyState>
      </Container>
    );
  }

  if (layout === 'horizontal') {
    return (
      <Container>
        <HorizontalTimeline $lineColor={lineColor} $showIcons={showIcons}>
          <HorizontalTrack>
            {items.map((item) => (
              <HorizontalItem key={item.id}>
                {showIcons ? (
                  <HorizontalIcon $color={item.iconColor || dotColor}>
                    {defaultIcons[item.icon || 'default']}
                  </HorizontalIcon>
                ) : (
                  <HorizontalDot $color={item.iconColor || dotColor} />
                )}
                <HorizontalCard $showIcons={showIcons}>
                  {showDates && item.date && (
                    <TimelineDate $color={item.iconColor || dotColor}>
                      <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      {item.date}
                    </TimelineDate>
                  )}
                  <TimelineTitle>{item.title}</TimelineTitle>
                  <TimelineContent>{item.content}</TimelineContent>
                </HorizontalCard>
              </HorizontalItem>
            ))}
          </HorizontalTrack>
        </HorizontalTimeline>
      </Container>
    );
  }

  // Vertical layout (default)
  return (
    <Container>
      <VerticalTimeline $alternating={alternating} theme={{ lineColor }}>
        {items.map((item, index) => (
          <VerticalTimelineItem
            key={item.id}
            $alternating={alternating}
            $index={index}
            $lineColor={lineColor}
          >
            {showIcons ? (
              <TimelineIcon $color={item.iconColor || dotColor} $alternating={alternating}>
                {defaultIcons[item.icon || 'default']}
              </TimelineIcon>
            ) : (
              <TimelineDot
                $color={item.iconColor || dotColor}
                $alternating={alternating}
                $index={index}
              />
            )}
            <TimelineCard>
              {showDates && item.date && (
                <TimelineDate $color={item.iconColor || dotColor}>
                  <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  {item.date}
                </TimelineDate>
              )}
              <TimelineTitle>{item.title}</TimelineTitle>
              <TimelineContent>{item.content}</TimelineContent>
            </TimelineCard>
          </VerticalTimelineItem>
        ))}
      </VerticalTimeline>
    </Container>
  );
};

export default TimelineBlock;
