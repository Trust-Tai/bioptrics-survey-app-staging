import React, { useState, useRef } from 'react';
import styled from 'styled-components';
import { Plus, Trash2, Upload, Star, Heart, Zap, Award, Target, Lightbulb, Rocket, CheckCircle, Gift, Shield, Users, TrendingUp, BookOpen, Settings, Globe, Mail, Phone, Camera, Music, Video, FileText, Folder, Calendar, Clock, MapPin, Search, Bell, Lock, Unlock, Eye, Edit, Trash, Download, Share, Send, MessageCircle, ThumbsUp, Flag } from 'lucide-react';
import type { FlipboxesBlock, FlipboxItem } from '../../../types/contentBlocks';
import {
  SettingGroup,
  Label,
  Input,
  Textarea,
  Select,
  ColorInput,
  Divider,
  HelpText,
  FileListContainer,
  FileItemCard,
  FileItemHeader,
  FileItemTitle,
  DeleteFileButton,
  AddFileButton,
  SmallInput,
} from '../shared/StyledComponents';

// Icon Selector Styles
const IconSelectorContainer = styled.div`
  margin-bottom: 6px;
`;

const IconTypeToggle = styled.div`
  display: flex;
  gap: 4px;
  margin-bottom: 8px;
`;

const ToggleButton = styled.button<{ $active: boolean }>`
  flex: 1;
  padding: 6px 8px;
  font-size: 11px;
  border: 1px solid ${props => props.$active ? '#3b82f6' : '#e5e7eb'};
  background: ${props => props.$active ? '#eff6ff' : 'white'};
  color: ${props => props.$active ? '#3b82f6' : '#6b7280'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;

  &:hover {
    border-color: #3b82f6;
  }
`;

const IconGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(8, 1fr);
  gap: 4px;
  max-height: 120px;
  overflow-y: auto;
  padding: 8px;
  background: #f9fafb;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
`;

const IconButton = styled.button<{ $selected: boolean }>`
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid ${props => props.$selected ? '#3b82f6' : '#e5e7eb'};
  background: ${props => props.$selected ? '#eff6ff' : 'white'};
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s;
  color: ${props => props.$selected ? '#3b82f6' : '#374151'};

  &:hover {
    border-color: #3b82f6;
    background: #eff6ff;
  }
`;

const CustomIconUpload = styled.div`
  display: flex;
  gap: 8px;
  align-items: center;
`;

const UploadButton = styled.label`
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  font-size: 11px;
  border: 1px dashed #d1d5db;
  background: #f9fafb;
  border-radius: 6px;
  cursor: pointer;
  color: #6b7280;
  transition: all 0.15s;
  flex: 1;

  &:hover {
    border-color: #3b82f6;
    color: #3b82f6;
  }
`;

const CustomIconPreview = styled.div`
  width: 36px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;

  img {
    max-width: 100%;
    max-height: 100%;
    object-fit: contain;
  }
`;

const HiddenInput = styled.input`
  display: none;
`;

// Predefined icons list
const predefinedIcons = [
  { name: 'star', icon: Star },
  { name: 'heart', icon: Heart },
  { name: 'zap', icon: Zap },
  { name: 'award', icon: Award },
  { name: 'target', icon: Target },
  { name: 'lightbulb', icon: Lightbulb },
  { name: 'rocket', icon: Rocket },
  { name: 'check-circle', icon: CheckCircle },
  { name: 'gift', icon: Gift },
  { name: 'shield', icon: Shield },
  { name: 'users', icon: Users },
  { name: 'trending-up', icon: TrendingUp },
  { name: 'book-open', icon: BookOpen },
  { name: 'settings', icon: Settings },
  { name: 'globe', icon: Globe },
  { name: 'mail', icon: Mail },
  { name: 'phone', icon: Phone },
  { name: 'camera', icon: Camera },
  { name: 'music', icon: Music },
  { name: 'video', icon: Video },
  { name: 'file-text', icon: FileText },
  { name: 'folder', icon: Folder },
  { name: 'calendar', icon: Calendar },
  { name: 'clock', icon: Clock },
  { name: 'map-pin', icon: MapPin },
  { name: 'search', icon: Search },
  { name: 'bell', icon: Bell },
  { name: 'lock', icon: Lock },
  { name: 'unlock', icon: Unlock },
  { name: 'eye', icon: Eye },
  { name: 'thumbs-up', icon: ThumbsUp },
  { name: 'flag', icon: Flag },
];

// Icon Selector Component
interface IconSelectorProps {
  value: string;
  customIcon?: string;
  onChange: (value: string, customIcon?: string) => void;
  label: string;
}

const IconSelector: React.FC<IconSelectorProps> = ({ value, customIcon, onChange, label }) => {
  const [iconType, setIconType] = useState<'emoji' | 'icon' | 'custom'>(
    customIcon ? 'custom' : (predefinedIcons.some(i => i.name === value) ? 'icon' : 'emoji')
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleIconSelect = (iconName: string) => {
    onChange(iconName, undefined);
  };

  const handleEmojiChange = (emoji: string) => {
    onChange(emoji, undefined);
  };

  const handleCustomIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      onChange('custom', base64);
    };
    reader.readAsDataURL(file);
  };

  return (
    <IconSelectorContainer>
      <Label style={{ fontSize: '11px', marginBottom: '4px' }}>{label}</Label>
      <IconTypeToggle>
        <ToggleButton
          type="button"
          $active={iconType === 'emoji'}
          onClick={() => setIconType('emoji')}
        >
          Emoji
        </ToggleButton>
        <ToggleButton
          type="button"
          $active={iconType === 'icon'}
          onClick={() => setIconType('icon')}
        >
          Icon
        </ToggleButton>
        <ToggleButton
          type="button"
          $active={iconType === 'custom'}
          onClick={() => setIconType('custom')}
        >
          Custom
        </ToggleButton>
      </IconTypeToggle>

      {iconType === 'emoji' && (
        <SmallInput
          type="text"
          value={!predefinedIcons.some(i => i.name === value) && !customIcon ? value : ''}
          onChange={(e) => handleEmojiChange(e.target.value)}
          placeholder="✨ Enter emoji"
        />
      )}

      {iconType === 'icon' && (
        <IconGrid>
          {predefinedIcons.map((iconItem) => {
            const IconComponent = iconItem.icon;
            return (
              <IconButton
                key={iconItem.name}
                type="button"
                $selected={value === iconItem.name}
                onClick={() => handleIconSelect(iconItem.name)}
                title={iconItem.name}
              >
                <IconComponent size={14} />
              </IconButton>
            );
          })}
        </IconGrid>
      )}

      {iconType === 'custom' && (
        <CustomIconUpload>
          <UploadButton>
            <Upload size={14} />
            Upload Icon
            <HiddenInput
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleCustomIconUpload}
            />
          </UploadButton>
          {customIcon && (
            <CustomIconPreview>
              <img src={customIcon} alt="Custom icon" />
            </CustomIconPreview>
          )}
        </CustomIconUpload>
      )}
    </IconSelectorContainer>
  );
};

interface FlipboxesSettingsProps {
  block: FlipboxesBlock;
  onUpdate: (settings: any) => void;
}

export const FlipboxesSettings: React.FC<FlipboxesSettingsProps> = ({ block, onUpdate }) => {
  const flipboxes = block.settings?.flipboxes || [];

  const handleAddFlipbox = () => {
    const newFlipbox: FlipboxItem = {
      id: `flipbox-${Date.now()}`,
      frontTitle: 'Front Title',
      frontDescription: 'Front description',
      frontIcon: '✨',
      backTitle: 'Back Title',
      backDescription: 'Back description',
      backIcon: '💡',
    };
    onUpdate({ flipboxes: [...flipboxes, newFlipbox] });
  };

  const handleRemoveFlipbox = (flipboxId: string) => {
    onUpdate({ flipboxes: flipboxes.filter((f: FlipboxItem) => f.id !== flipboxId) });
  };

  const handleUpdateFlipbox = (flipboxId: string, updates: Partial<FlipboxItem>) => {
    onUpdate({
      flipboxes: flipboxes.map((f: FlipboxItem) => 
        f.id === flipboxId ? { ...f, ...updates } : f
      ),
    });
  };

  return (
    <>
      <SettingGroup>
        <Label>Flipboxes</Label>
        <FileListContainer>
          {flipboxes.map((flipbox: FlipboxItem, index: number) => (
            <FileItemCard key={flipbox.id}>
              <FileItemHeader>
                <FileItemTitle>Flipbox {index + 1}</FileItemTitle>
                <DeleteFileButton
                  onClick={() => handleRemoveFlipbox(flipbox.id)}
                  title="Remove flipbox"
                >
                  <Trash2 size={16} />
                </DeleteFileButton>
              </FileItemHeader>

              <div style={{ marginBottom: '12px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>Front Side</Label>
                
                <IconSelector
                  label="Icon"
                  value={flipbox.frontIcon || ''}
                  customIcon={flipbox.frontCustomIcon}
                  onChange={(value, customIcon) => handleUpdateFlipbox(flipbox.id, { 
                    frontIcon: value, 
                    frontCustomIcon: customIcon 
                  })}
                />

                <div style={{ marginBottom: '6px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Title</Label>
                  <SmallInput
                    type="text"
                    value={flipbox.frontTitle}
                    onChange={(e) => handleUpdateFlipbox(flipbox.id, { frontTitle: e.target.value })}
                    placeholder="Front title"
                  />
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Description</Label>
                  <Textarea
                    value={flipbox.frontDescription || ''}
                    onChange={(e) => handleUpdateFlipbox(flipbox.id, { frontDescription: e.target.value })}
                    placeholder="Front description"
                    rows={2}
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <Label style={{ fontSize: '11px', marginBottom: '2px' }}>BG Color</Label>
                    <ColorInput
                      type="color"
                      value={flipbox.frontBgColor || block.settings?.frontBgColor || '#3b82f6'}
                      onChange={(e) => handleUpdateFlipbox(flipbox.id, { frontBgColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Text Color</Label>
                    <ColorInput
                      type="color"
                      value={flipbox.frontTextColor || block.settings?.frontTextColor || '#ffffff'}
                      onChange={(e) => handleUpdateFlipbox(flipbox.id, { frontTextColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              <Divider />

              <div style={{ marginBottom: '8px' }}>
                <Label style={{ fontSize: '12px', marginBottom: '8px', display: 'block' }}>Back Side</Label>
                
                <IconSelector
                  label="Icon"
                  value={flipbox.backIcon || ''}
                  customIcon={flipbox.backCustomIcon}
                  onChange={(value, customIcon) => handleUpdateFlipbox(flipbox.id, { 
                    backIcon: value, 
                    backCustomIcon: customIcon 
                  })}
                />

                <div style={{ marginBottom: '6px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Title</Label>
                  <SmallInput
                    type="text"
                    value={flipbox.backTitle}
                    onChange={(e) => handleUpdateFlipbox(flipbox.id, { backTitle: e.target.value })}
                    placeholder="Back title"
                  />
                </div>

                <div style={{ marginBottom: '6px' }}>
                  <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Description</Label>
                  <Textarea
                    value={flipbox.backDescription || ''}
                    onChange={(e) => handleUpdateFlipbox(flipbox.id, { backDescription: e.target.value })}
                    placeholder="Back description"
                    rows={2}
                    style={{ fontSize: '12px', padding: '6px 10px' }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px' }}>
                  <div>
                    <Label style={{ fontSize: '11px', marginBottom: '2px' }}>BG Color</Label>
                    <ColorInput
                      type="color"
                      value={flipbox.backBgColor || block.settings?.backBgColor || '#1e40af'}
                      onChange={(e) => handleUpdateFlipbox(flipbox.id, { backBgColor: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label style={{ fontSize: '11px', marginBottom: '2px' }}>Text Color</Label>
                    <ColorInput
                      type="color"
                      value={flipbox.backTextColor || block.settings?.backTextColor || '#ffffff'}
                      onChange={(e) => handleUpdateFlipbox(flipbox.id, { backTextColor: e.target.value })}
                    />
                  </div>
                </div>
              </div>
            </FileItemCard>
          ))}
        </FileListContainer>

        <AddFileButton onClick={handleAddFlipbox}>
          <Plus size={16} />
          Add Flipbox
        </AddFileButton>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Grid Layout</Label>
        <Select
          value={block.settings?.columns || 3}
          onChange={(e) => onUpdate({ columns: parseInt(e.target.value) })}
        >
          <option value="1">1 Column</option>
          <option value="2">2 Columns</option>
          <option value="3">3 Columns</option>
          <option value="4">4 Columns</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Flipbox Height</Label>
        <Input
          type="text"
          value={block.settings?.height || '300px'}
          onChange={(e) => onUpdate({ height: e.target.value })}
          placeholder="300px"
        />
        <HelpText>Enter size with unit (e.g., 300px, 20rem)</HelpText>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Default Colors (Front)</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Background</Label>
            <ColorInput
              type="color"
              value={block.settings?.frontBgColor || '#3b82f6'}
              onChange={(e) => onUpdate({ frontBgColor: e.target.value })}
            />
          </div>
          <div>
            <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Text</Label>
            <ColorInput
              type="color"
              value={block.settings?.frontTextColor || '#ffffff'}
              onChange={(e) => onUpdate({ frontTextColor: e.target.value })}
            />
          </div>
        </div>
        <HelpText>Applied to new flipboxes</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Default Colors (Back)</Label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
          <div>
            <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Background</Label>
            <ColorInput
              type="color"
              value={block.settings?.backBgColor || '#1e40af'}
              onChange={(e) => onUpdate({ backBgColor: e.target.value })}
            />
          </div>
          <div>
            <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Text</Label>
            <ColorInput
              type="color"
              value={block.settings?.backTextColor || '#ffffff'}
              onChange={(e) => onUpdate({ backTextColor: e.target.value })}
            />
          </div>
        </div>
        <HelpText>Applied to new flipboxes</HelpText>
      </SettingGroup>
    </>
  );
};

export default FlipboxesSettings;
