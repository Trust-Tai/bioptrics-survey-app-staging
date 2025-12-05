import React from 'react';
import styled from 'styled-components';
import { ExternalLink } from 'lucide-react';
import type { ContentGridBlock as ContentGridBlockType } from '../../types/contentBlocks';

interface ContentGridBlockProps {
  block: ContentGridBlockType;
  isEditing: boolean;
  onUpdate: (settings: Partial<ContentGridBlockType['settings']>) => void;
}

const GridContainer = styled.div<{ columns: number; gap: string }>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns || 3}, 1fr);
  gap: ${props => 
    props.gap === 'small' ? '16px' :
    props.gap === 'large' ? '32px' :
    '24px'
  };
  
  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
  
  @media (min-width: 769px) and (max-width: 1024px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const GridCard = styled.div<{ 
  cardStyle: string; 
  showShadow: boolean;
  imageLayout: string;
  hasBackgroundImage: boolean;
}>`
  background: ${props => props.hasBackgroundImage ? 'transparent' : 'white'};
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;
  position: relative;
  
  ${props => props.cardStyle === 'elevated' && !props.hasBackgroundImage && `
    box-shadow: ${props.showShadow !== false ? '0 2px 8px rgba(0, 0, 0, 0.1)' : 'none'};
    
    &:hover {
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
      transform: translateY(-2px);
    }
  `}
  
  ${props => props.cardStyle === 'bordered' && !props.hasBackgroundImage && `
    border: 1px solid #e5e7eb;
  `}
  
  ${props => props.cardStyle === 'flat' && !props.hasBackgroundImage && `
    background: #f9fafb;
  `}
`;

const CardImage = styled.img<{ aspectRatio: string }>`
  width: 100%;
  height: 200px;
  object-fit: cover;
  flex-shrink: 0;
`;

const BackgroundImageCard = styled.div<{ imageUrl: string }>`
  background-image: linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.6)), url(${props => props.imageUrl});
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  justify-content: flex-end;
  padding: 24px;
  color: white;
  border-radius: 8px;
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
  }
`;

const CardContent = styled.div<{ hasBackground?: boolean }>`
  padding: ${props => props.hasBackground ? '0' : '20px'};
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

const CardTitle = styled.h3<{ isOverlay?: boolean }>`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: ${props => props.isOverlay ? 'white' : '#111827'};
  line-height: 1.4;
`;

const CardDescription = styled.p<{ isOverlay?: boolean }>`
  margin: 0;
  font-size: 14px;
  color: ${props => props.isOverlay ? 'rgba(255, 255, 255, 0.9)' : '#6b7280'};
  line-height: 1.6;
  flex: 1;
`;

const CardButton = styled.a<{ isOverlay?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: ${props => props.isOverlay ? 'rgba(255, 255, 255, 0.2)' : '#3b82f6'};
  color: white;
  text-decoration: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s;
  align-self: flex-start;
  border: ${props => props.isOverlay ? '1px solid rgba(255, 255, 255, 0.3)' : 'none'};
  backdrop-filter: ${props => props.isOverlay ? 'blur(10px)' : 'none'};
  
  &:hover {
    background: ${props => props.isOverlay ? 'rgba(255, 255, 255, 0.3)' : '#2563eb'};
    transform: translateX(2px);
  }
  
  svg {
    width: 16px;
    height: 16px;
  }
`;

const EmptyState = styled.div`
  padding: 40px;
  text-align: center;
  color: #6b7280;
  background: #f9fafb;
  border: 2px dashed #e5e7eb;
  border-radius: 8px;
`;

export const ContentGridBlock: React.FC<ContentGridBlockProps> = ({
  block,
  isEditing,
  onUpdate,
}) => {
  const items = block.settings.items || [];
  const columns = block.settings.columns || 3;
  const gap = block.settings.gap || 'medium';
  const cardStyle = block.settings.cardStyle || 'elevated';
  const showShadow = block.settings.showShadow !== false;
  const imageAspectRatio = block.settings.imageAspectRatio || '16:9';

  if (items.length === 0) {
    return (
      <EmptyState>
        <p style={{ margin: 0, fontSize: '14px' }}>
          {isEditing ? 'No grid items configured. Use the settings panel to add items.' : 'No content available'}
        </p>
      </EmptyState>
    );
  }

  return (
    <GridContainer columns={columns} gap={gap}>
      {items.map((item) => {
        const imageLayout = item.imageLayout || 'top-image';
        
        // Background Image Layout
        if (imageLayout === 'background-image' && item.imageUrl) {
          return (
            <BackgroundImageCard key={item.id} imageUrl={item.imageUrl}>
              <CardTitle isOverlay>{item.title}</CardTitle>
              {item.description && (
                <CardDescription isOverlay>{item.description}</CardDescription>
              )}
              {item.buttonText && item.buttonUrl && (
                <CardButton
                  isOverlay
                  href={item.buttonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.buttonText}
                  <ExternalLink />
                </CardButton>
              )}
            </BackgroundImageCard>
          );
        }
        
        // Standard Card Layouts
        return (
          <GridCard
            key={item.id}
            cardStyle={cardStyle}
            showShadow={showShadow}
            imageLayout={imageLayout}
            hasBackgroundImage={false}
          >
            {/* Top Image Layout */}
            {imageLayout === 'top-image' && item.imageUrl && (
              <CardImage
                src={item.imageUrl}
                alt={item.title}
                aspectRatio={imageAspectRatio}
              />
            )}
            
            {/* Title Image Layout - Title first */}
            {imageLayout === 'title-image' && (
              <CardContent>
                <CardTitle>{item.title}</CardTitle>
              </CardContent>
            )}
            
            {/* Title Image Layout - Image after title */}
            {imageLayout === 'title-image' && item.imageUrl && (
              <CardImage
                src={item.imageUrl}
                alt={item.title}
                aspectRatio={imageAspectRatio}
              />
            )}
            
            <CardContent>
              {/* Title for non title-image layouts */}
              {imageLayout !== 'title-image' && (
                <CardTitle>{item.title}</CardTitle>
              )}
              
              {item.description && (
                <CardDescription>{item.description}</CardDescription>
              )}
              
              {item.buttonText && item.buttonUrl && (
                <CardButton
                  href={item.buttonUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {item.buttonText}
                  <ExternalLink />
                </CardButton>
              )}
            </CardContent>
          </GridCard>
        );
      })}
    </GridContainer>
  );
};
