import React, { useState, useEffect } from 'react';
import styled, { keyframes, css } from 'styled-components';
import type { BannerBlock as BannerBlockType, BannerButton, BannerButtonHoverEffect, BannerButtonAnimation } from '../../types/contentBlocks';

interface BannerBlockProps {
  block: BannerBlockType;
  isEditing: boolean;
}

// Animation keyframes
const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideUp = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const slideLeft = keyframes`
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const slideRight = keyframes`
  from { opacity: 0; transform: translateX(-20px); }
  to { opacity: 1; transform: translateX(0); }
`;

const bounce = keyframes`
  0%, 20%, 50%, 80%, 100% { transform: translateY(0); }
  40% { transform: translateY(-10px); }
  60% { transform: translateY(-5px); }
`;

const pulse = keyframes`
  0% { transform: scale(1); }
  50% { transform: scale(1.05); }
  100% { transform: scale(1); }
`;

const getAnimation = (type: BannerButtonAnimation) => {
  switch (type) {
    case 'fade-in': return fadeIn;
    case 'slide-up': return slideUp;
    case 'slide-left': return slideLeft;
    case 'slide-right': return slideRight;
    case 'bounce': return bounce;
    case 'pulse': return pulse;
    default: return null;
  }
};

const getHoverStyles = (effect: BannerButtonHoverEffect, hoverBg?: string, hoverText?: string) => {
  const baseStyles = css`
    ${hoverBg ? `background-color: ${hoverBg};` : ''}
    ${hoverText ? `color: ${hoverText};` : ''}
  `;
  
  switch (effect) {
    case 'lift':
      return css`
        transform: translateY(-3px);
        box-shadow: 0 6px 20px rgba(0, 0, 0, 0.25);
        ${baseStyles}
      `;
    case 'glow':
      return css`
        box-shadow: 0 0 20px currentColor;
        ${baseStyles}
      `;
    case 'scale':
      return css`
        transform: scale(1.05);
        ${baseStyles}
      `;
    case 'darken':
      return css`
        filter: brightness(0.85);
        ${baseStyles}
      `;
    case 'lighten':
      return css`
        filter: brightness(1.15);
        ${baseStyles}
      `;
    default:
      return baseStyles;
  }
};

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

const ButtonsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
`;

const CTAButton = styled.a<{
  $bgColor: string;
  $textColor: string;
  $style: 'solid' | 'outline' | 'ghost';
  $size: 'small' | 'medium' | 'large';
  $borderRadius: number;
  $hoverEffect: BannerButtonHoverEffect;
  $hoverBgColor?: string;
  $hoverTextColor?: string;
  $animationType?: BannerButtonAnimation;
  $animationDuration?: number;
  $animationDelay?: number;
  $animationEnabled?: boolean;
  $animationKey?: number;
}>`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  border-radius: ${props => props.$borderRadius || 8}px;
  
  /* Size */
  ${props => {
    switch (props.$size) {
      case 'small':
        return css`padding: 8px 16px; font-size: 14px;`;
      case 'large':
        return css`padding: 18px 40px; font-size: 18px;`;
      default:
        return css`padding: 14px 32px; font-size: 16px;`;
    }
  }}
  
  /* Style variants */
  ${props => {
    switch (props.$style) {
      case 'outline':
        return css`
          background: transparent;
          color: ${props.$textColor};
          border: 2px solid ${props.$bgColor};
        `;
      case 'ghost':
        return css`
          background: transparent;
          color: ${props.$textColor};
          border: 2px solid transparent;
        `;
      default: // solid
        return css`
          background: ${props.$bgColor};
          color: ${props.$textColor};
          border: 2px solid ${props.$bgColor};
        `;
    }
  }}
  
  /* Animation */
  ${props => props.$animationEnabled && props.$animationType && props.$animationType !== 'none' && css`
    animation: ${getAnimation(props.$animationType)} ${props.$animationDuration || 0.5}s ease ${props.$animationDelay || 0}s both;
  `}
  
  /* Hover effect */
  &:hover {
    ${props => getHoverStyles(props.$hoverEffect, props.$hoverBgColor, props.$hoverTextColor)}
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

// Button Icons
const ArrowIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
  </svg>
);

const ChevronIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
  </svg>
);

const ExternalIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
  </svg>
);

const DownloadIcon = () => (
  <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
  </svg>
);

const getButtonIcon = (icon: string) => {
  switch (icon) {
    case 'arrow': return <ArrowIcon />;
    case 'chevron': return <ChevronIcon />;
    case 'external': return <ExternalIcon />;
    case 'download': return <DownloadIcon />;
    default: return null;
  }
};

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
    // Legacy single button fields
    buttonText,
    buttonUrl,
    buttonColor = '#6366f1',
    buttonTextColor = '#ffffff',
    // New buttons array
    buttons = [],
    contentAlignment = 'center',
    verticalAlignment = 'center',
    height = 450,
    fullHeight = false,
    parallax = false,
  } = block.settings || {};

  // Animation key for replaying animations when settings change
  const [animationKey, setAnimationKey] = useState(0);
  
  // Retrigger animations when buttons change
  useEffect(() => {
    setAnimationKey(prev => prev + 1);
  }, [JSON.stringify(buttons)]);

  // Get enabled buttons from the array, or use legacy single button
  const activeButtons: BannerButton[] = buttons.length > 0 
    ? buttons.filter(btn => btn.enabled)
    : buttonText 
      ? [{
          id: 'legacy-btn',
          enabled: true,
          text: buttonText,
          url: buttonUrl || '#',
          icon: 'arrow' as const,
          style: 'solid' as const,
          size: 'medium' as const,
          backgroundColor: buttonColor,
          textColor: buttonTextColor,
          borderRadius: 8,
          hoverEffect: 'lift' as const,
          animation: { enabled: false, type: 'none' as const, delay: 0, duration: 0.5 },
        }]
      : [];

  const hasContent = title || subtitle || activeButtons.length > 0;

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
            
            {activeButtons.length > 0 && (
              <ButtonsContainer>
                {activeButtons.map((btn, index) => (
                  <CTAButton
                    key={`${btn.id}-${animationKey}`}
                    href={isEditing ? undefined : btn.url || '#'}
                    target={btn.openInNewTab ? '_blank' : undefined}
                    rel={btn.openInNewTab ? 'noopener noreferrer' : undefined}
                    $bgColor={btn.backgroundColor}
                    $textColor={btn.textColor}
                    $style={btn.style}
                    $size={btn.size}
                    $borderRadius={btn.borderRadius}
                    $hoverEffect={btn.hoverEffect}
                    $hoverBgColor={btn.hoverBackgroundColor}
                    $hoverTextColor={btn.hoverTextColor}
                    $animationEnabled={btn.animation?.enabled}
                    $animationType={btn.animation?.type}
                    $animationDuration={btn.animation?.duration}
                    $animationDelay={btn.animation?.delay}
                    onClick={isEditing ? (e) => e.preventDefault() : undefined}
                  >
                    {btn.text}
                    {getButtonIcon(btn.icon)}
                  </CTAButton>
                ))}
              </ButtonsContainer>
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
