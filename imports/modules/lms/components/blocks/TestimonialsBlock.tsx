import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { TestimonialsBlock as TestimonialsBlockType, TestimonialItem } from '../../types/contentBlocks';

interface TestimonialsBlockProps {
  block: TestimonialsBlockType;
  isEditing: boolean;
  onUpdate?: (settings: any) => void;
}

const Container = styled.div`
  width: 100%;
  padding: 16px 0;
`;

const GridLayout = styled.div<{ $columns: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.$columns}, 1fr);
  gap: 24px;
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ListLayout = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
`;

const CarouselContainer = styled.div`
  position: relative;
  overflow: hidden;
`;

const CarouselTrack = styled.div<{ $offset: number }>`
  display: flex;
  transition: transform 0.5s ease;
  transform: translateX(${props => props.$offset}%);
`;

const CarouselSlide = styled.div`
  min-width: 100%;
  padding: 0 12px;
  box-sizing: border-box;
`;

const CarouselNav = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
`;

const CarouselDot = styled.button<{ $active: boolean; $color: string }>`
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: ${props => props.$active ? props.$color : '#d1d5db'};
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background: ${props => props.$color};
  }
`;

const CarouselArrow = styled.button<{ $direction: 'left' | 'right' }>`
  position: absolute;
  top: 50%;
  ${props => props.$direction}: 0;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const TestimonialCard = styled.div<{ $style: string }>`
  padding: 24px;
  border-radius: 12px;
  background: white;
  
  ${props => {
    switch (props.$style) {
      case 'elevated':
        return `box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);`;
      case 'bordered':
        return `border: 1px solid #e5e7eb;`;
      case 'flat':
      default:
        return `background: #f9fafb;`;
    }
  }}
`;

const QuoteIcon = styled.div<{ $color: string }>`
  color: ${props => props.$color};
  margin-bottom: 12px;
  opacity: 0.3;
`;

const TestimonialContent = styled.p`
  font-size: 16px;
  line-height: 1.6;
  color: #374151;
  margin: 0 0 20px 0;
  font-style: italic;
`;

const TestimonialFooter = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Avatar = styled.div<{ $image?: string; $color: string }>`
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: ${props => props.$image ? `url(${props.$image}) center/cover` : props.$color};
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-weight: 600;
  font-size: 18px;
`;

const AuthorInfo = styled.div`
  flex: 1;
`;

const AuthorName = styled.div`
  font-weight: 600;
  color: #111827;
  font-size: 15px;
`;

const AuthorRole = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const RatingStars = styled.div`
  display: flex;
  gap: 2px;
  margin-bottom: 12px;
`;

const Star = styled.span<{ $filled: boolean; $color: string }>`
  color: ${props => props.$filled ? props.$color : '#d1d5db'};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 48px;
  color: #6b7280;
  background: #f9fafb;
  border-radius: 8px;
  border: 2px dashed #e5e7eb;
`;

const getInitials = (name: string) => {
  return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
};

const StarIcon: React.FC<{ filled: boolean; color: string }> = ({ filled, color }) => (
  <Star $filled={filled} $color={color}>
    <svg width="16" height="16" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  </Star>
);

const TestimonialItemCard: React.FC<{
  item: TestimonialItem;
  showRating: boolean;
  showAvatar: boolean;
  cardStyle: string;
  accentColor: string;
}> = ({ item, showRating, showAvatar, cardStyle, accentColor }) => (
  <TestimonialCard $style={cardStyle}>
    <QuoteIcon $color={accentColor}>
      <svg width="32" height="32" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
      </svg>
    </QuoteIcon>
    
    {showRating && item.rating && (
      <RatingStars>
        {[1, 2, 3, 4, 5].map(star => (
          <StarIcon key={star} filled={star <= item.rating!} color={accentColor} />
        ))}
      </RatingStars>
    )}
    
    <TestimonialContent>"{item.content}"</TestimonialContent>
    
    <TestimonialFooter>
      {showAvatar && (
        <Avatar $image={item.avatar} $color={accentColor}>
          {!item.avatar && getInitials(item.name)}
        </Avatar>
      )}
      <AuthorInfo>
        <AuthorName>{item.name}</AuthorName>
        {(item.role || item.company) && (
          <AuthorRole>
            {item.role}{item.role && item.company && ' at '}{item.company}
          </AuthorRole>
        )}
      </AuthorInfo>
    </TestimonialFooter>
  </TestimonialCard>
);

export const TestimonialsBlock: React.FC<TestimonialsBlockProps> = ({ block, isEditing }) => {
  const {
    testimonials = [],
    layout = 'grid',
    columns = 2,
    showRating = true,
    showAvatar = true,
    cardStyle = 'elevated',
    accentColor = '#6366f1',
    autoplay = false,
    autoplaySpeed = 5,
  } = block.settings || {};

  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (layout === 'carousel' && autoplay && !isEditing && testimonials.length > 1) {
      const interval = setInterval(() => {
        setCurrentSlide(prev => (prev + 1) % testimonials.length);
      }, autoplaySpeed * 1000);
      return () => clearInterval(interval);
    }
  }, [layout, autoplay, autoplaySpeed, isEditing, testimonials.length]);

  if (testimonials.length === 0) {
    return (
      <Container>
        <EmptyState>
          <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24" style={{ margin: '0 auto 12px', opacity: 0.5 }}>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
          <div>No testimonials added yet</div>
          <div style={{ fontSize: '14px', marginTop: '4px' }}>Add testimonials in the settings panel</div>
        </EmptyState>
      </Container>
    );
  }

  if (layout === 'carousel') {
    return (
      <Container>
        <CarouselContainer>
          <CarouselTrack $offset={-currentSlide * 100}>
            {testimonials.map(item => (
              <CarouselSlide key={item.id}>
                <TestimonialItemCard
                  item={item}
                  showRating={showRating}
                  showAvatar={showAvatar}
                  cardStyle={cardStyle}
                  accentColor={accentColor}
                />
              </CarouselSlide>
            ))}
          </CarouselTrack>
          
          {testimonials.length > 1 && (
            <>
              <CarouselArrow
                $direction="left"
                onClick={() => setCurrentSlide(prev => (prev - 1 + testimonials.length) % testimonials.length)}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </CarouselArrow>
              <CarouselArrow
                $direction="right"
                onClick={() => setCurrentSlide(prev => (prev + 1) % testimonials.length)}
              >
                <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </CarouselArrow>
            </>
          )}
        </CarouselContainer>
        
        {testimonials.length > 1 && (
          <CarouselNav>
            {testimonials.map((_, index) => (
              <CarouselDot
                key={index}
                $active={index === currentSlide}
                $color={accentColor}
                onClick={() => setCurrentSlide(index)}
              />
            ))}
          </CarouselNav>
        )}
      </Container>
    );
  }

  if (layout === 'list') {
    return (
      <Container>
        <ListLayout>
          {testimonials.map(item => (
            <TestimonialItemCard
              key={item.id}
              item={item}
              showRating={showRating}
              showAvatar={showAvatar}
              cardStyle={cardStyle}
              accentColor={accentColor}
            />
          ))}
        </ListLayout>
      </Container>
    );
  }

  // Grid layout (default)
  return (
    <Container>
      <GridLayout $columns={columns}>
        {testimonials.map(item => (
          <TestimonialItemCard
            key={item.id}
            item={item}
            showRating={showRating}
            showAvatar={showAvatar}
            cardStyle={cardStyle}
            accentColor={accentColor}
          />
        ))}
      </GridLayout>
    </Container>
  );
};

export default TestimonialsBlock;
