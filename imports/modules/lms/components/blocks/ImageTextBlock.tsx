import React from 'react';
import styled from 'styled-components';
import type { ImageTextBlock as ImageTextBlockType } from '../../types/contentBlocks';

const ImageTextContainer = styled.div<{ layout: string }>`
  display: flex;
  gap: 32px;
  align-items: center;
  flex-direction: ${props => {
    switch (props.layout) {
      case 'image-right':
        return 'row-reverse';
      case 'image-top':
        return 'column';
      case 'image-bottom':
        return 'column-reverse';
      default: // image-left
        return 'row';
    }
  }};
  
  @media (max-width: 768px) {
    flex-direction: column;
    gap: 20px;
  }
`;

const ImageSection = styled.div<{ layout: string }>`
  flex: ${props => (props.layout === 'image-top' || props.layout === 'image-bottom') ? '0 0 auto' : '1'};
  max-width: ${props => (props.layout === 'image-top' || props.layout === 'image-bottom') ? '100%' : '50%'};
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const ImageWrapper = styled.div`
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
`;

const Image = styled.img`
  width: 100%;
  height: auto;
  display: block;
`;

const TextSection = styled.div<{ layout: string }>`
  flex: ${props => (props.layout === 'image-top' || props.layout === 'image-bottom') ? '0 0 auto' : '1'};
  max-width: ${props => (props.layout === 'image-top' || props.layout === 'image-bottom') ? '100%' : '50%'};
  
  @media (max-width: 768px) {
    max-width: 100%;
  }
`;

const Heading = styled.h2<{ level: string; $color: string }>`
  font-size: ${props => {
    switch (props.level) {
      case 'h1': return '32px';
      case 'h2': return '28px';
      case 'h3': return '24px';
      case 'h4': return '20px';
      case 'h5': return '18px';
      case 'h6': return '16px';
      default: return '28px';
    }
  }};
  font-weight: 600;
  color: ${props => props.$color};
  margin: 0 0 16px 0;
  line-height: 1.3;
`;

const Content = styled.div<{ $color: string }>`
  color: ${props => props.$color};
  font-size: 16px;
  line-height: 1.6;
  
  p {
    margin: 0 0 12px 0;
    
    &:last-child {
      margin-bottom: 0;
    }
  }
  
  ul, ol {
    margin: 0 0 12px 0;
    padding-left: 24px;
  }
  
  strong {
    font-weight: 600;
  }
  
  em {
    font-style: italic;
  }
  
  a {
    color: #3b82f6;
    text-decoration: underline;
    
    &:hover {
      color: #2563eb;
    }
  }
`;

const ButtonWrapper = styled.div<{ alignment: string }>`
  margin-top: 20px;
  display: flex;
  justify-content: ${props => {
    switch (props.alignment) {
      case 'center': return 'center';
      case 'right': return 'flex-end';
      default: return 'flex-start';
    }
  }};
`;

const CTAButton = styled.a<{ $buttonColor: string; $textColor: string }>`
  display: inline-block;
  padding: 12px 24px;
  font-size: 16px;
  font-weight: 600;
  border-radius: 6px;
  text-decoration: none !important;
  transition: all 0.2s;
  cursor: pointer;
  background: ${props => props.$buttonColor} !important;
  color: ${props => props.$textColor} !important;
  border: 2px solid ${props => props.$buttonColor} !important;
  
  &:hover {
    filter: brightness(0.9);
  }
`;

const EmptyState = styled.div`
  padding: 48px 24px;
  text-align: center;
  background: #f9fafb;
  border: 2px dashed #d1d5db;
  border-radius: 8px;
`;

const EmptyIcon = styled.svg`
  width: 48px;
  height: 48px;
  color: #9ca3af;
  margin: 0 auto 16px;
`;

const EmptyText = styled.p`
  font-size: 14px;
  color: #6b7280;
  margin: 0 0 4px 0;
`;

const EmptySubtext = styled.p`
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
`;

interface ImageTextBlockProps {
  block: ImageTextBlockType;
  isEditing?: boolean;
  onUpdate?: (blockId: string, settings: any) => void;
}

export const ImageTextBlock: React.FC<ImageTextBlockProps> = ({ block }) => {
  const { settings } = block;
  const layout = settings?.layout || 'image-left';
  // Default placeholder image if no image is set
  const defaultImage = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop';
  const imageUrl = settings?.imageUrl || defaultImage;
  const imageAlt = settings?.imageAlt || 'Image';
  const heading = settings?.heading || '';
  const headingLevel = settings?.headingLevel || 'h2';
  const content = settings?.content || '';
  const buttonText = settings?.buttonText || '';
  const buttonUrl = settings?.buttonUrl || '';
  const buttonColor = settings?.buttonColor || '#3b82f6';
  const buttonTextColor = settings?.buttonTextColor || '#ffffff';
  const buttonAlignment = settings?.buttonAlignment || 'left';
  const headingColor = settings?.headingColor || '#1f2937';
  const contentColor = settings?.contentColor || '#4b5563';

  if (!content) {
    return (
      <EmptyState>
        <EmptyIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" 
          />
        </EmptyIcon>
        <EmptyText>No content configured</EmptyText>
        <EmptySubtext>Click edit to add image and text</EmptySubtext>
      </EmptyState>
    );
  }

  return (
    <ImageTextContainer layout={layout}>
      <ImageSection layout={layout}>
        <ImageWrapper>
          <Image src={imageUrl} alt={imageAlt} />
        </ImageWrapper>
      </ImageSection>

      <TextSection layout={layout}>
        {heading && (
          <Heading as={headingLevel} level={headingLevel} $color={headingColor}>
            {heading}
          </Heading>
        )}
        
        <Content $color={contentColor} dangerouslySetInnerHTML={{ __html: content }} />
        
        {buttonText && buttonUrl && (
          <ButtonWrapper alignment={buttonAlignment}>
            <CTAButton
              href={buttonUrl}
              $buttonColor={buttonColor}
              $textColor={buttonTextColor}
              target="_blank"
              rel="noopener noreferrer"
            >
              {buttonText}
            </CTAButton>
          </ButtonWrapper>
        )}
      </TextSection>
    </ImageTextContainer>
  );
};
