import React, { useState } from 'react';
import styled from 'styled-components';
import type { FlipboxesBlock as FlipboxesBlockType } from '../../types/contentBlocks';

const FlipboxesContainer = styled.div`
  width: 100%;
`;

const FlipboxesGrid = styled.div<{ columns: number }>`
  display: grid;
  grid-template-columns: repeat(${props => props.columns}, 1fr);
  gap: 20px;
  
  @media (max-width: 768px) {
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  }
`;

const FlipboxWrapper = styled.div<{ height: string }>`
  perspective: 1000px;
  height: ${props => props.height};
  cursor: pointer;
`;

const FlipboxInner = styled.div<{ isFlipped: boolean }>`
  position: relative;
  width: 100%;
  height: 100%;
  transition: transform 0.6s;
  transform-style: preserve-3d;
  transform: ${props => props.isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'};
`;

const FlipboxFace = styled.div<{ 
  bgColor: string;
  textColor: string;
}>`
  position: absolute;
  width: 100%;
  height: 100%;
  backface-visibility: hidden;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  border-radius: 12px;
  background: ${props => props.bgColor};
  color: ${props => props.textColor};
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  text-align: center;
`;

const FlipboxFront = styled(FlipboxFace)`
  /* Front face is normal */
`;

const FlipboxBack = styled(FlipboxFace)`
  transform: rotateY(180deg);
`;

const FlipboxIcon = styled.div`
  font-size: 48px;
  margin-bottom: 16px;
  
  svg {
    width: 48px;
    height: 48px;
  }
`;

const FlipboxTitle = styled.h3`
  font-size: 20px;
  font-weight: 600;
  margin: 0 0 8px 0;
  line-height: 1.3;
`;

const FlipboxDescription = styled.p`
  font-size: 14px;
  margin: 0;
  line-height: 1.6;
  opacity: 0.9;
`;

const FlipIndicator = styled.div`
  margin-top: 16px;
  font-size: 12px;
  opacity: 0.7;
  display: flex;
  align-items: center;
  gap: 4px;
  
  svg {
    width: 16px;
    height: 16px;
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

interface FlipboxesBlockProps {
  block: FlipboxesBlockType;
  isEditing?: boolean;
  onUpdate?: (blockId: string, settings: any) => void;
}

export const FlipboxesBlock: React.FC<FlipboxesBlockProps> = ({ block }) => {
  const { settings } = block;
  const flipboxes = settings?.flipboxes || [];
  const columns = settings?.columns || 3;
  const height = settings?.height || '300px';
  const frontBgColor = settings?.frontBgColor || '#3b82f6';
  const frontTextColor = settings?.frontTextColor || '#ffffff';
  const backBgColor = settings?.backBgColor || '#1e40af';
  const backTextColor = settings?.backTextColor || '#ffffff';

  const [flippedIndexes, setFlippedIndexes] = useState<Set<number>>(new Set());

  const handleFlip = (index: number) => {
    setFlippedIndexes(prev => {
      const newSet = new Set(prev);
      if (newSet.has(index)) {
        newSet.delete(index);
      } else {
        newSet.add(index);
      }
      return newSet;
    });
  };

  if (flipboxes.length === 0) {
    return (
      <FlipboxesContainer>
        <EmptyState>
          <EmptyIcon fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
            />
          </EmptyIcon>
          <EmptyText>No flipboxes configured</EmptyText>
          <EmptySubtext>Click edit to add interactive flip cards</EmptySubtext>
        </EmptyState>
      </FlipboxesContainer>
    );
  }

  return (
    <FlipboxesContainer>
      <FlipboxesGrid columns={columns}>
        {flipboxes.map((flipbox: any, index: number) => {
          const isFlipped = flippedIndexes.has(index);

          return (
            <FlipboxWrapper
              key={flipbox.id}
              height={height}
              onClick={() => handleFlip(index)}
            >
              <FlipboxInner isFlipped={isFlipped}>
                {/* Front Face */}
                <FlipboxFront
                  bgColor={flipbox.frontBgColor || frontBgColor}
                  textColor={flipbox.frontTextColor || frontTextColor}
                >
                  {flipbox.frontIcon && (
                    <FlipboxIcon dangerouslySetInnerHTML={{ __html: flipbox.frontIcon }} />
                  )}
                  <FlipboxTitle>{flipbox.frontTitle || 'Front Title'}</FlipboxTitle>
                  {flipbox.frontDescription && (
                    <FlipboxDescription>{flipbox.frontDescription}</FlipboxDescription>
                  )}
                  <FlipIndicator>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                      />
                    </svg>
                    Click to flip
                  </FlipIndicator>
                </FlipboxFront>

                {/* Back Face */}
                <FlipboxBack
                  bgColor={flipbox.backBgColor || backBgColor}
                  textColor={flipbox.backTextColor || backTextColor}
                >
                  {flipbox.backIcon && (
                    <FlipboxIcon dangerouslySetInnerHTML={{ __html: flipbox.backIcon }} />
                  )}
                  <FlipboxTitle>{flipbox.backTitle || 'Back Title'}</FlipboxTitle>
                  {flipbox.backDescription && (
                    <FlipboxDescription>{flipbox.backDescription}</FlipboxDescription>
                  )}
                  <FlipIndicator>
                    <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path 
                        strokeLinecap="round" 
                        strokeLinejoin="round" 
                        strokeWidth={2} 
                        d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" 
                      />
                    </svg>
                    Click to flip back
                  </FlipIndicator>
                </FlipboxBack>
              </FlipboxInner>
            </FlipboxWrapper>
          );
        })}
      </FlipboxesGrid>
    </FlipboxesContainer>
  );
};
