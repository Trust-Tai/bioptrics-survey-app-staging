import React, { useState } from 'react';
import styled from 'styled-components';
import { Plus, Trash2 } from 'lucide-react';
import type { BannerBlock, BannerButton } from '../../../types/contentBlocks';
import {
  SettingGroup,
  Label,
  Input,
  Textarea,
  Select,
  ColorInput,
  CheckboxWrapper,
  Checkbox,
  CheckboxLabel,
  Divider,
  HelpText,
  ItemTabs,
  ItemTab,
  DeleteItemButton,
} from '../shared/StyledComponents';

// Local styled components
const ImageUploadContainer = styled.div`
  border: 2px dashed #d1d5db;
  border-radius: 8px;
  padding: 16px;
  text-align: center;
  background: #f9fafb;
`;

const ChangeImageButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #ffffff;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  color: #374151;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: 12px;
  
  &:hover {
    background: #f9fafb;
    border-color: #3b82f6;
    color: #3b82f6;
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const ImagePreview = styled.img`
  width: 100%;
  max-height: 200px;
  object-fit: cover;
  border-radius: 6px;
  margin-top: 8px;
`;

const AddButton = styled.button`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: white;
  border: 1px dashed #d1d5db;
  border-radius: 6px;
  color: #6b7280;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f9fafb;
    border-color: #3b82f6;
    color: #3b82f6;
  }
`;

interface BannerSettingsProps {
  block: BannerBlock;
  onUpdate: (settings: any) => void;
}

export const BannerSettings: React.FC<BannerSettingsProps> = ({ block, onUpdate }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0);
  
  const buttons = block.settings?.buttons || [];
  const selectedButton = buttons[selectedButtonIndex];

  const handleAddButton = () => {
    const newButton: BannerButton = {
      id: `btn-${Date.now()}`,
      enabled: true,
      text: 'New Button',
      url: '#',
      icon: 'arrow',
      openInNewTab: false,
      style: 'solid',
      size: 'medium',
      backgroundColor: '#6366f1',
      textColor: '#ffffff',
      borderRadius: 8,
      hoverEffect: 'lift',
      hoverBackgroundColor: '',
      hoverTextColor: '',
      animation: {
        enabled: true,
        type: 'fade-in',
        delay: buttons.length * 0.1,
        duration: 0.5,
      },
    };
    onUpdate({ buttons: [...buttons, newButton] });
    setSelectedButtonIndex(buttons.length);
  };

  const handleUpdateButton = (field: string, value: any) => {
    const updated = buttons.map((btn: BannerButton, i: number) => {
      if (i === selectedButtonIndex) {
        if (field.startsWith('animation.')) {
          const animField = field.replace('animation.', '');
          return { ...btn, animation: { ...btn.animation, [animField]: value } };
        }
        return { ...btn, [field]: value };
      }
      return btn;
    });
    onUpdate({ buttons: updated });
  };

  const handleDeleteButton = (index: number) => {
    const updated = buttons.filter((_: any, i: number) => i !== index);
    onUpdate({ buttons: updated });
    if (selectedButtonIndex >= updated.length) {
      setSelectedButtonIndex(Math.max(0, updated.length - 1));
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdate({ backgroundImage: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <SettingGroup>
        <Label>Background Image</Label>
        <ImageUploadContainer>
          <ChangeImageButton onClick={() => fileInputRef.current?.click()}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Upload Image
          </ChangeImageButton>
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
          {block.settings?.backgroundImage && (
            <ImagePreview src={block.settings.backgroundImage} alt="Banner preview" />
          )}
        </ImageUploadContainer>
      </SettingGroup>

      <SettingGroup>
        <Label>Or enter image URL</Label>
        <Input
          type="url"
          value={block.settings?.backgroundImage || ''}
          onChange={(e) => onUpdate({ backgroundImage: e.target.value })}
          placeholder="https://example.com/banner.jpg"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Background Color (fallback)</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ColorInput
            type="color"
            value={block.settings?.backgroundColor || '#1f2937'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
          />
          <Input
            type="text"
            value={block.settings?.backgroundColor || '#1f2937'}
            onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
            placeholder="#1f2937"
            style={{ flex: 1 }}
          />
        </div>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Overlay Color</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ColorInput
            type="color"
            value={block.settings?.overlayColor || '#000000'}
            onChange={(e) => onUpdate({ overlayColor: e.target.value })}
          />
          <Input
            type="text"
            value={block.settings?.overlayColor || '#000000'}
            onChange={(e) => onUpdate({ overlayColor: e.target.value })}
            placeholder="#000000"
            style={{ flex: 1 }}
          />
        </div>
      </SettingGroup>

      <SettingGroup>
        <Label>Overlay Opacity: {block.settings?.overlayOpacity ?? 50}%</Label>
        <input
          type="range"
          min="0"
          max="100"
          value={block.settings?.overlayOpacity ?? 50}
          onChange={(e) => onUpdate({ overlayOpacity: parseInt(e.target.value) })}
          style={{ width: '100%' }}
        />
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Title</Label>
        <Input
          type="text"
          value={block.settings?.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Welcome to the Course"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Title Font Size (px)</Label>
        <Input
          type="number"
          min="16"
          max="120"
          value={block.settings?.titleSize || 48}
          onChange={(e) => onUpdate({ titleSize: parseInt(e.target.value) || 48 })}
          placeholder="48"
        />
        <HelpText>Recommended: 28-64px</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Title Color</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ColorInput
            type="color"
            value={block.settings?.titleColor || '#ffffff'}
            onChange={(e) => onUpdate({ titleColor: e.target.value })}
          />
          <Input
            type="text"
            value={block.settings?.titleColor || '#ffffff'}
            onChange={(e) => onUpdate({ titleColor: e.target.value })}
            placeholder="#ffffff"
            style={{ flex: 1 }}
          />
        </div>
      </SettingGroup>

      <SettingGroup>
        <Label>Subtitle</Label>
        <Textarea
          value={block.settings?.subtitle || ''}
          onChange={(e) => onUpdate({ subtitle: e.target.value })}
          placeholder="A brief description of what learners will discover..."
          rows={3}
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Subtitle Color</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ColorInput
            type="color"
            value={block.settings?.subtitleColor || '#ffffff'}
            onChange={(e) => onUpdate({ subtitleColor: e.target.value })}
          />
          <Input
            type="text"
            value={block.settings?.subtitleColor || '#ffffff'}
            onChange={(e) => onUpdate({ subtitleColor: e.target.value })}
            placeholder="#ffffff"
            style={{ flex: 1 }}
          />
        </div>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Label style={{ marginBottom: 0 }}>Buttons ({buttons.length})</Label>
          <AddButton onClick={handleAddButton}>
            <Plus size={14} />
            Add Button
          </AddButton>
        </div>

        {buttons.length > 0 && (
          <ItemTabs>
            {buttons.map((btn: BannerButton, i: number) => (
              <ItemTab key={btn.id} $active={selectedButtonIndex === i} onClick={() => setSelectedButtonIndex(i)}>
                {btn.text || `Button ${i + 1}`}
              </ItemTab>
            ))}
          </ItemTabs>
        )}
      </SettingGroup>

      {selectedButton && (
        <>
          <SettingGroup>
            <CheckboxWrapper>
              <Checkbox
                type="checkbox"
                id="btnEnabled"
                checked={selectedButton.enabled}
                onChange={(e) => handleUpdateButton('enabled', e.target.checked)}
              />
              <CheckboxLabel htmlFor="btnEnabled">Enable this button</CheckboxLabel>
            </CheckboxWrapper>
          </SettingGroup>

          <SettingGroup>
            <Label>Button Text</Label>
            <Input
              type="text"
              value={selectedButton.text}
              onChange={(e) => handleUpdateButton('text', e.target.value)}
              placeholder="Get Started"
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Button URL</Label>
            <Input
              type="url"
              value={selectedButton.url}
              onChange={(e) => handleUpdateButton('url', e.target.value)}
              placeholder="https://example.com"
            />
          </SettingGroup>

          <SettingGroup>
            <CheckboxWrapper>
              <Checkbox
                type="checkbox"
                id="openInNewTab"
                checked={selectedButton.openInNewTab || false}
                onChange={(e) => handleUpdateButton('openInNewTab', e.target.checked)}
              />
              <CheckboxLabel htmlFor="openInNewTab">Open in new tab</CheckboxLabel>
            </CheckboxWrapper>
          </SettingGroup>

          <SettingGroup>
            <Label>Icon</Label>
            <Select
              value={selectedButton.icon}
              onChange={(e) => handleUpdateButton('icon', e.target.value)}
            >
              <option value="none">None</option>
              <option value="arrow">Arrow →</option>
              <option value="chevron">Chevron ›</option>
              <option value="external">External Link ↗</option>
              <option value="download">Download ↓</option>
            </Select>
          </SettingGroup>

          <SettingGroup>
            <DeleteItemButton onClick={() => handleDeleteButton(selectedButtonIndex)}>
              <Trash2 size={14} />
              Delete This Button
            </DeleteItemButton>
          </SettingGroup>
        </>
      )}

      {buttons.length === 0 && (
        <SettingGroup>
          <HelpText style={{ textAlign: 'center', padding: '16px' }}>
            No buttons added yet. Click "Add Button" to create one.
          </HelpText>
        </SettingGroup>
      )}
    </>
  );
};

export default BannerSettings;
