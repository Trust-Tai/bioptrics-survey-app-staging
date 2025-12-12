import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { ChevronDown, ChevronUp, Upload, Image, X } from 'lucide-react';
import type { ContentBlock, SpacingSettings, BackgroundSettings, BackgroundSize, BackgroundPosition, BackgroundRepeat, BackgroundAttachment } from '../../../types/contentBlocks';
import { getDefaultSpacing, getDefaultBackground } from '../../../utils/blockHelpers';

// Styled Components
const Section = styled.div`
  margin-bottom: 24px;
`;

const SectionHeader = styled.div<{ $isOpen: boolean }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: ${props => props.$isOpen ? '8px 8px 0 0' : '8px'};
  cursor: pointer;
  user-select: none;

  &:hover {
    background: #f1f5f9;
  }
`;

const SectionTitle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #1e293b;
`;

const SectionIcon = styled.span`
  font-size: 16px;
`;

const SectionContent = styled.div<{ $isOpen: boolean }>`
  display: ${props => props.$isOpen ? 'block' : 'none'};
  padding: 16px;
  border: 1px solid #e2e8f0;
  border-top: none;
  border-radius: 0 0 8px 8px;
  background: white;
`;

const SubSection = styled.div`
  margin-bottom: 16px;

  &:last-child {
    margin-bottom: 0;
  }
`;

const SubSectionLabel = styled.div`
  font-size: 12px;
  font-weight: 600;
  color: #64748b;
  text-transform: uppercase;
  margin-bottom: 8px;
`;

const SpacingGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
`;

const SpacingInput = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const InputLabel = styled.label`
  font-size: 11px;
  color: #64748b;
`;

const NumberInput = styled.input`
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  width: 100%;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const ColorInputWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const ColorInput = styled.input`
  width: 40px;
  height: 40px;
  padding: 0;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  
  &::-webkit-color-swatch-wrapper {
    padding: 2px;
  }
  
  &::-webkit-color-swatch {
    border: none;
    border-radius: 4px;
  }
`;

const TextInput = styled.input`
  flex: 1;
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const SelectInput = styled.select`
  width: 100%;
  padding: 8px 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  font-size: 13px;
  background: white;
  cursor: pointer;
  
  &:focus {
    outline: none;
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
`;

const SliderWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const Slider = styled.input`
  flex: 1;
  -webkit-appearance: none;
  height: 6px;
  background: #e2e8f0;
  border-radius: 3px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 16px;
    height: 16px;
    background: #6366f1;
    border-radius: 50%;
    cursor: pointer;
    transition: transform 0.2s;
    
    &:hover {
      transform: scale(1.1);
    }
  }
`;

const SliderValue = styled.span`
  font-size: 12px;
  color: #64748b;
  min-width: 40px;
  text-align: right;
`;

const ImageUploadArea = styled.div`
  border: 2px dashed #e2e8f0;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #6366f1;
    background: #f8fafc;
  }
`;

const ImagePreview = styled.div`
  position: relative;
  border-radius: 8px;
  overflow: hidden;
  margin-bottom: 8px;
`;

const PreviewImage = styled.img`
  width: 100%;
  height: 100px;
  object-fit: cover;
  border-radius: 8px;
`;

const RemoveImageButton = styled.button`
  position: absolute;
  top: 4px;
  right: 4px;
  width: 24px;
  height: 24px;
  background: rgba(0, 0, 0, 0.6);
  border: none;
  border-radius: 4px;
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    background: rgba(0, 0, 0, 0.8);
  }
`;

const UploadText = styled.div`
  font-size: 12px;
  color: #64748b;
  margin-top: 8px;
`;

const Row = styled.div`
  display: flex;
  gap: 12px;
  margin-bottom: 12px;
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const Column = styled.div<{ $flex?: number }>`
  flex: ${props => props.$flex || 1};
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

const HiddenFileInput = styled.input`
  display: none;
`;

interface SpacingBackgroundSettingsProps {
  block: ContentBlock;
  onUpdate: (updates: Partial<ContentBlock>) => void;
}

export const SpacingBackgroundSettings: React.FC<SpacingBackgroundSettingsProps> = ({ block, onUpdate }) => {
  const [spacingOpen, setSpacingOpen] = useState(true);
  const [backgroundOpen, setBackgroundOpen] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Get current values or defaults
  const spacing: SpacingSettings = block.spacing || getDefaultSpacing();
  const background: BackgroundSettings = block.background || getDefaultBackground();

  // Update spacing (use _spacing key for block-level update)
  const updateSpacing = (type: 'padding' | 'margin', side: 'top' | 'right' | 'bottom' | 'left', value: number) => {
    const newSpacing = {
      ...spacing,
      [type]: {
        ...spacing[type],
        [side]: value,
      },
    };
    onUpdate({ _spacing: newSpacing });
  };

  // Update background (use _background key for block-level update)
  const updateBackground = (updates: Partial<BackgroundSettings>) => {
    onUpdate({ _background: { ...background, ...updates } });
  };

  // Handle image upload
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        updateBackground({ image: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  // Remove background image
  const removeBackgroundImage = () => {
    updateBackground({ image: '' });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <>
      {/* Spacing Section */}
      <Section>
        <SectionHeader $isOpen={spacingOpen} onClick={() => setSpacingOpen(!spacingOpen)}>
          <SectionTitle>
            <SectionIcon>📐</SectionIcon>
            Spacing
          </SectionTitle>
          {spacingOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </SectionHeader>
        <SectionContent $isOpen={spacingOpen}>
          {/* Padding */}
          <SubSection>
            <SubSectionLabel>Padding (px)</SubSectionLabel>
            <SpacingGrid>
              <SpacingInput>
                <InputLabel>Top</InputLabel>
                <NumberInput
                  type="number"
                  min="0"
                  value={spacing.padding.top}
                  onChange={(e) => updateSpacing('padding', 'top', parseInt(e.target.value) || 0)}
                />
              </SpacingInput>
              <SpacingInput>
                <InputLabel>Right</InputLabel>
                <NumberInput
                  type="number"
                  min="0"
                  value={spacing.padding.right}
                  onChange={(e) => updateSpacing('padding', 'right', parseInt(e.target.value) || 0)}
                />
              </SpacingInput>
              <SpacingInput>
                <InputLabel>Bottom</InputLabel>
                <NumberInput
                  type="number"
                  min="0"
                  value={spacing.padding.bottom}
                  onChange={(e) => updateSpacing('padding', 'bottom', parseInt(e.target.value) || 0)}
                />
              </SpacingInput>
              <SpacingInput>
                <InputLabel>Left</InputLabel>
                <NumberInput
                  type="number"
                  min="0"
                  value={spacing.padding.left}
                  onChange={(e) => updateSpacing('padding', 'left', parseInt(e.target.value) || 0)}
                />
              </SpacingInput>
            </SpacingGrid>
          </SubSection>

          {/* Margin */}
          <SubSection>
            <SubSectionLabel>Margin (px)</SubSectionLabel>
            <SpacingGrid>
              <SpacingInput>
                <InputLabel>Top</InputLabel>
                <NumberInput
                  type="number"
                  value={spacing.margin.top}
                  onChange={(e) => updateSpacing('margin', 'top', parseInt(e.target.value) || 0)}
                />
              </SpacingInput>
              <SpacingInput>
                <InputLabel>Right</InputLabel>
                <NumberInput
                  type="number"
                  value={spacing.margin.right}
                  onChange={(e) => updateSpacing('margin', 'right', parseInt(e.target.value) || 0)}
                />
              </SpacingInput>
              <SpacingInput>
                <InputLabel>Bottom</InputLabel>
                <NumberInput
                  type="number"
                  value={spacing.margin.bottom}
                  onChange={(e) => updateSpacing('margin', 'bottom', parseInt(e.target.value) || 0)}
                />
              </SpacingInput>
              <SpacingInput>
                <InputLabel>Left</InputLabel>
                <NumberInput
                  type="number"
                  value={spacing.margin.left}
                  onChange={(e) => updateSpacing('margin', 'left', parseInt(e.target.value) || 0)}
                />
              </SpacingInput>
            </SpacingGrid>
          </SubSection>
        </SectionContent>
      </Section>

      {/* Background Section */}
      <Section>
        <SectionHeader $isOpen={backgroundOpen} onClick={() => setBackgroundOpen(!backgroundOpen)}>
          <SectionTitle>
            <SectionIcon>🎨</SectionIcon>
            Background
          </SectionTitle>
          {backgroundOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </SectionHeader>
        <SectionContent $isOpen={backgroundOpen}>
          {/* Background Color */}
          <SubSection>
            <SubSectionLabel>Background Color</SubSectionLabel>
            <Row>
              <Column $flex={1}>
                <ColorInputWrapper>
                  <ColorInput
                    type="color"
                    value={background.color || '#ffffff'}
                    onChange={(e) => updateBackground({ color: e.target.value })}
                  />
                  <TextInput
                    type="text"
                    value={background.color || ''}
                    onChange={(e) => updateBackground({ color: e.target.value })}
                    placeholder="#ffffff or transparent"
                  />
                </ColorInputWrapper>
              </Column>
            </Row>
            <Row>
              <Column>
                <InputLabel>Opacity</InputLabel>
                <SliderWrapper>
                  <Slider
                    type="range"
                    min="0"
                    max="100"
                    value={background.opacity}
                    onChange={(e) => updateBackground({ opacity: parseInt(e.target.value) })}
                  />
                  <SliderValue>{background.opacity}%</SliderValue>
                </SliderWrapper>
              </Column>
            </Row>
          </SubSection>

          {/* Background Image */}
          <SubSection>
            <SubSectionLabel>Background Image</SubSectionLabel>
            {background.image ? (
              <ImagePreview>
                <PreviewImage src={background.image} alt="Background" />
                <RemoveImageButton onClick={removeBackgroundImage}>
                  <X size={14} />
                </RemoveImageButton>
              </ImagePreview>
            ) : (
              <ImageUploadArea onClick={() => fileInputRef.current?.click()}>
                <Upload size={24} color="#6366f1" />
                <UploadText>Click to upload or drag an image</UploadText>
              </ImageUploadArea>
            )}
            <HiddenFileInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
            />
            <Row style={{ marginTop: '8px' }}>
              <Column>
                <InputLabel>Or enter image URL</InputLabel>
                <TextInput
                  type="text"
                  value={background.image || ''}
                  onChange={(e) => updateBackground({ image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </Column>
            </Row>
          </SubSection>

          {/* Image Settings (only show if image is set) */}
          {background.image && (
            <>
              <SubSection>
                <SubSectionLabel>Image Settings</SubSectionLabel>
                <Row>
                  <Column>
                    <InputLabel>Size</InputLabel>
                    <SelectInput
                      value={background.size}
                      onChange={(e) => updateBackground({ size: e.target.value as BackgroundSize })}
                    >
                      <option value="cover">Cover</option>
                      <option value="contain">Contain</option>
                      <option value="auto">Auto</option>
                      <option value="custom">Custom</option>
                    </SelectInput>
                  </Column>
                  <Column>
                    <InputLabel>Position</InputLabel>
                    <SelectInput
                      value={background.position}
                      onChange={(e) => updateBackground({ position: e.target.value as BackgroundPosition })}
                    >
                      <option value="center">Center</option>
                      <option value="top">Top</option>
                      <option value="bottom">Bottom</option>
                      <option value="left">Left</option>
                      <option value="right">Right</option>
                      <option value="top-left">Top Left</option>
                      <option value="top-right">Top Right</option>
                      <option value="bottom-left">Bottom Left</option>
                      <option value="bottom-right">Bottom Right</option>
                    </SelectInput>
                  </Column>
                </Row>
                <Row>
                  <Column>
                    <InputLabel>Repeat</InputLabel>
                    <SelectInput
                      value={background.repeat}
                      onChange={(e) => updateBackground({ repeat: e.target.value as BackgroundRepeat })}
                    >
                      <option value="no-repeat">No Repeat</option>
                      <option value="repeat">Repeat</option>
                      <option value="repeat-x">Repeat X</option>
                      <option value="repeat-y">Repeat Y</option>
                    </SelectInput>
                  </Column>
                  <Column>
                    <InputLabel>Attachment</InputLabel>
                    <SelectInput
                      value={background.attachment}
                      onChange={(e) => updateBackground({ attachment: e.target.value as BackgroundAttachment })}
                    >
                      <option value="scroll">Scroll</option>
                      <option value="fixed">Fixed (Parallax)</option>
                    </SelectInput>
                  </Column>
                </Row>
              </SubSection>

              {/* Overlay */}
              <SubSection>
                <SubSectionLabel>Image Overlay</SubSectionLabel>
                <Row>
                  <Column>
                    <InputLabel>Overlay Color</InputLabel>
                    <ColorInputWrapper>
                      <ColorInput
                        type="color"
                        value={background.overlay.color || '#000000'}
                        onChange={(e) => updateBackground({
                          overlay: { ...background.overlay, color: e.target.value }
                        })}
                      />
                      <TextInput
                        type="text"
                        value={background.overlay.color || ''}
                        onChange={(e) => updateBackground({
                          overlay: { ...background.overlay, color: e.target.value }
                        })}
                        placeholder="#000000"
                      />
                    </ColorInputWrapper>
                  </Column>
                </Row>
                <Row>
                  <Column>
                    <InputLabel>Overlay Opacity</InputLabel>
                    <SliderWrapper>
                      <Slider
                        type="range"
                        min="0"
                        max="100"
                        value={background.overlay.opacity}
                        onChange={(e) => updateBackground({
                          overlay: { ...background.overlay, opacity: parseInt(e.target.value) }
                        })}
                      />
                      <SliderValue>{background.overlay.opacity}%</SliderValue>
                    </SliderWrapper>
                  </Column>
                </Row>
              </SubSection>
            </>
          )}
        </SectionContent>
      </Section>
    </>
  );
};

export default SpacingBackgroundSettings;
