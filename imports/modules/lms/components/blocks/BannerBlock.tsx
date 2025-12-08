import React from 'react';
import styled from 'styled-components';
import type { BannerBlock as BannerBlockType } from '../../types/contentBlocks';

interface BannerBlockProps {
  block: BannerBlockType;
  isEditing: boolean;
}

const BannerContainer = styled.div<{
  $backgroundImage?: string;
  $backgroundColor?: string;
  $height: number;
  $fullHeight?: boolean;
  $parallax?: boolean;
}>`
  position: relative;
  width: 100%;
  min-height: ${props => props.$fullHeight ? '100vh' : `${props.$height || 450}px`};
  background-color: ${props => props.$backgroundColor || '#1f2937'};
  ${props => props.$backgroundImage && `
    background-image: url(${props.$backgroundImage});
    background-size: cover;
    background-position: center;
    ${props.$parallax ? 'background-attachment: fixed;' : ''}
  `}
  display: flex;
  overflow: hidden;
  border-radius: 8px;
`;

const Overlay = styled.div<{ $color?: string; $opacity?: number }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: ${props => props.$color || '#000000'};
  opacity: ${props => (props.$opacity ?? 50) / 100};
`;

const ContentWrapper = styled.div<{
  $alignment: string;
  $verticalAlignment: string;
}>`
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 48px 32px;
  display: flex;
  flex-direction: column;
  justify-content: ${props => {
    switch (props.$verticalAlignment) {
      case 'top': return 'flex-start';
      case 'bottom': return 'flex-end';
      default: return 'center';
    }
  }};
  align-items: ${props => {
    switch (props.$alignment) {
      case 'left': return 'flex-start';
      case 'right': return 'flex-end';
      default: return 'center';
    }
  }};
  text-align: ${props => props.$alignment || 'center'};
  height: 100%;
  min-height: inherit;
`;

const Title = styled.h1<{ $size: number; $color?: string }>`
  margin: 0 0 16px 0;
  font-weight: 700;
  color: ${props => props.$color || '#ffffff'};
  font-size: ${props => props.$size || 48}px;
  line-height: 1.1;
  max-width: 900px;
  
  @media (max-width: 768px) {
    font-size: ${props => Math.max((props.$size || 48) * 0.7, 24)}px;
  }
`;

const Subtitle = styled.p<{ $color?: string }>`
  margin: 0 0 32px 0;
  font-size: 18px;
  line-height: 1.6;
  color: ${props => props.$color || 'rgba(255, 255, 255, 0.9)'};
  max-width: 700px;
  
  @media (max-width: 768px) {
    font-size: 16px;
  }
`;

const CTAButton = styled.a<{ $bgColor?: string; $textColor?: string }>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 14px 32px;
  font-size: 16px;
  font-weight: 600;
  text-decoration: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${props => props.$bgColor || '#6366f1'};
  color: ${props => props.$textColor || '#ffffff'};
  border: 2px solid ${props => props.$bgColor || '#6366f1'};
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
  }
`;

const EditingOverlay = styled.div`
  position: absolute;
  top: 12px;
  right: 12px;
  background: rgba(0, 0, 0, 0.6);
  color: white;
  padding: 6px 12px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  z-index: 2;
`;

const EmptyState = styled.div<{ $color?: string }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  color: ${props => props.$color || 'rgba(255, 255, 255, 0.7)'};
  
  svg {
    opacity: 0.5;
  }
`;

export const BannerBlock: React.FC<BannerBlockProps> = ({ block, isEditing }) => {
  const {
    backgroundImage,
    backgroundColor = '#1f2937',
    overlayColor = '#000000',
    overlayOpacity = 50,
    title,
    titleSize = 48,
    titleColor = '#ffffff',
    subtitle,
    subtitleColor = 'rgba(255, 255, 255, 0.9)',
    buttonText,
    buttonUrl,
    buttonColor = '#6366f1',
    buttonTextColor = '#ffffff',
    contentAlignment = 'center',
    verticalAlignment = 'center',
    height = 450,
    fullHeight = false,
    parallax = false,
  } = block.settings || {};

  const hasContent = title || subtitle || buttonText;

  return (
    <BannerContainer
      $backgroundImage={backgroundImage}
      $backgroundColor={backgroundColor}
      $height={height}
      $fullHeight={fullHeight}
      $parallax={parallax}
    >
      {backgroundImage && (
        <Overlay $color={overlayColor} $opacity={overlayOpacity} />
      )}
      
      {isEditing && (
        <EditingOverlay>Banner Block</EditingOverlay>
      )}
      
      <ContentWrapper
        $alignment={contentAlignment}
        $verticalAlignment={verticalAlignment}
      >
        {hasContent ? (
          <>
            {title && (
              <Title $size={titleSize} $color={titleColor}>
                {title}
              </Title>
            )}
            
            {subtitle && (
              <Subtitle $color={subtitleColor}>
                {subtitle}
              </Subtitle>
            )}
            
            {buttonText && (
              <CTAButton
                href={isEditing ? undefined : buttonUrl || '#'}
                $bgColor={buttonColor}
                $textColor={buttonTextColor}
                onClick={isEditing ? (e) => e.preventDefault() : undefined}
              >
                {buttonText}
                <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                </svg>
              </CTAButton>
            )}
          </>
        ) : (
          <EmptyState $color={titleColor}>
            <svg width="48" height="48" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span>Configure banner in settings panel</span>
          </EmptyState>
        )}
      </ContentWrapper>
    </BannerContainer>
  );
};

export default BannerBlock;
