import React, { useState } from 'react';
import styled from 'styled-components';
import { Plus, Trash2 } from 'lucide-react';
import type { TimelineBlock, TimelineItem } from '../../../types/contentBlocks';
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

interface TimelineSettingsProps {
  block: TimelineBlock;
  onUpdate: (settings: any) => void;
}

export const TimelineSettings: React.FC<TimelineSettingsProps> = ({ block, onUpdate }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const items = block.settings?.items || [];
  const selectedItem = items[selectedIndex];

  const handleAddItem = () => {
    const newItem: TimelineItem = {
      id: `timeline-${Date.now()}`,
      title: 'New Step',
      date: '',
      content: 'Enter description...',
      icon: 'default',
      iconColor: '#6366f1',
    };
    onUpdate({ items: [...items, newItem] });
    setSelectedIndex(items.length);
  };

  const handleUpdateItem = (field: keyof TimelineItem, value: any) => {
    const updated = items.map((item: TimelineItem, i: number) =>
      i === selectedIndex ? { ...item, [field]: value } : item
    );
    onUpdate({ items: updated });
  };

  const handleDeleteItem = (index: number) => {
    const updated = items.filter((_: any, i: number) => i !== index);
    onUpdate({ items: updated });
    if (selectedIndex >= updated.length) {
      setSelectedIndex(Math.max(0, updated.length - 1));
    }
  };

  return (
    <>
      <SettingGroup>
        <Label>Layout</Label>
        <Select
          value={block.settings?.layout || 'vertical'}
          onChange={(e) => onUpdate({ layout: e.target.value })}
        >
          <option value="vertical">Vertical</option>
          <option value="horizontal">Horizontal</option>
        </Select>
      </SettingGroup>

      {block.settings?.layout === 'vertical' && (
        <SettingGroup>
          <CheckboxWrapper>
            <Checkbox
              type="checkbox"
              id="alternating"
              checked={block.settings?.alternating !== false}
              onChange={(e) => onUpdate({ alternating: e.target.checked })}
            />
            <CheckboxLabel htmlFor="alternating">Alternating layout</CheckboxLabel>
          </CheckboxWrapper>
          <HelpText>Items alternate between left and right</HelpText>
        </SettingGroup>
      )}

      <SettingGroup>
        <Label>Line Color</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ColorInput
            type="color"
            value={block.settings?.lineColor || '#e5e7eb'}
            onChange={(e) => onUpdate({ lineColor: e.target.value })}
          />
          <Input
            type="text"
            value={block.settings?.lineColor || '#e5e7eb'}
            onChange={(e) => onUpdate({ lineColor: e.target.value })}
            placeholder="#e5e7eb"
            style={{ flex: 1 }}
          />
        </div>
      </SettingGroup>

      <SettingGroup>
        <Label>Dot Color</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ColorInput
            type="color"
            value={block.settings?.dotColor || '#6366f1'}
            onChange={(e) => onUpdate({ dotColor: e.target.value })}
          />
          <Input
            type="text"
            value={block.settings?.dotColor || '#6366f1'}
            onChange={(e) => onUpdate({ dotColor: e.target.value })}
            placeholder="#6366f1"
            style={{ flex: 1 }}
          />
        </div>
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showDates"
            checked={block.settings?.showDates !== false}
            onChange={(e) => onUpdate({ showDates: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showDates">Show dates</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showIcons"
            checked={block.settings?.showIcons || false}
            onChange={(e) => onUpdate({ showIcons: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showIcons">Show icons instead of dots</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Label style={{ marginBottom: 0 }}>Timeline Items ({items.length})</Label>
          <AddButton onClick={handleAddItem}>
            <Plus size={14} />
            Add
          </AddButton>
        </div>

        {items.length > 0 && (
          <ItemTabs>
            {items.map((item: TimelineItem, i: number) => (
              <ItemTab key={item.id} $active={selectedIndex === i} onClick={() => setSelectedIndex(i)}>
                {i + 1}
              </ItemTab>
            ))}
          </ItemTabs>
        )}
      </SettingGroup>

      {selectedItem && (
        <>
          <SettingGroup>
            <Label>Title</Label>
            <Input
              type="text"
              value={selectedItem.title}
              onChange={(e) => handleUpdateItem('title', e.target.value)}
              placeholder="Step Title"
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Date/Label</Label>
            <Input
              type="text"
              value={selectedItem.date || ''}
              onChange={(e) => handleUpdateItem('date', e.target.value)}
              placeholder="Week 1, Jan 2024, etc."
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Content</Label>
            <Textarea
              value={selectedItem.content}
              onChange={(e) => handleUpdateItem('content', e.target.value)}
              placeholder="Enter description..."
              rows={3}
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Icon</Label>
            <Select
              value={selectedItem.icon || 'default'}
              onChange={(e) => handleUpdateItem('icon', e.target.value)}
            >
              <option value="default">Clock (Default)</option>
              <option value="check">Checkmark</option>
              <option value="star">Star</option>
              <option value="flag">Flag</option>
              <option value="rocket">Rocket</option>
            </Select>
          </SettingGroup>

          <SettingGroup>
            <Label>Icon Color</Label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <ColorInput
                type="color"
                value={selectedItem.iconColor || '#6366f1'}
                onChange={(e) => handleUpdateItem('iconColor', e.target.value)}
              />
              <Input
                type="text"
                value={selectedItem.iconColor || '#6366f1'}
                onChange={(e) => handleUpdateItem('iconColor', e.target.value)}
                placeholder="#6366f1"
                style={{ flex: 1 }}
              />
            </div>
          </SettingGroup>

          <SettingGroup>
            <DeleteItemButton onClick={() => handleDeleteItem(selectedIndex)}>
              <Trash2 size={14} />
              Delete Item
            </DeleteItemButton>
          </SettingGroup>
        </>
      )}
    </>
  );
};

export default TimelineSettings;
