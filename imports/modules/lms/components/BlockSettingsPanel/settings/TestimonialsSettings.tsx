import React, { useState } from 'react';
import styled from 'styled-components';
import { Plus, Trash2 } from 'lucide-react';
import type { TestimonialsBlock, TestimonialItem } from '../../../types/contentBlocks';
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

interface TestimonialsSettingsProps {
  block: TestimonialsBlock;
  onUpdate: (settings: any) => void;
}

export const TestimonialsSettings: React.FC<TestimonialsSettingsProps> = ({ block, onUpdate }) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  const testimonials = block.settings?.testimonials || [];
  const selectedTestimonial = testimonials[selectedIndex];

  const handleAddTestimonial = () => {
    const newTestimonial: TestimonialItem = {
      id: `testimonial-${Date.now()}`,
      name: 'New Person',
      role: 'Role',
      company: 'Company',
      avatar: '',
      content: 'Enter testimonial content here...',
      rating: 5,
    };
    onUpdate({ testimonials: [...testimonials, newTestimonial] });
    setSelectedIndex(testimonials.length);
  };

  const handleUpdateTestimonial = (field: keyof TestimonialItem, value: any) => {
    const updated = testimonials.map((t: TestimonialItem, i: number) =>
      i === selectedIndex ? { ...t, [field]: value } : t
    );
    onUpdate({ testimonials: updated });
  };

  const handleDeleteTestimonial = (index: number) => {
    const updated = testimonials.filter((_: any, i: number) => i !== index);
    onUpdate({ testimonials: updated });
    if (selectedIndex >= updated.length) {
      setSelectedIndex(Math.max(0, updated.length - 1));
    }
  };

  return (
    <>
      <SettingGroup>
        <Label>Layout</Label>
        <Select
          value={block.settings?.layout || 'grid'}
          onChange={(e) => onUpdate({ layout: e.target.value })}
        >
          <option value="grid">Grid</option>
          <option value="carousel">Carousel</option>
          <option value="list">List</option>
        </Select>
      </SettingGroup>

      {block.settings?.layout === 'grid' && (
        <SettingGroup>
          <Label>Columns</Label>
          <Select
            value={block.settings?.columns || 3}
            onChange={(e) => onUpdate({ columns: parseInt(e.target.value) })}
          >
            <option value={1}>1 Column</option>
            <option value={2}>2 Columns</option>
            <option value={3}>3 Columns</option>
          </Select>
        </SettingGroup>
      )}

      <SettingGroup>
        <Label>Card Style</Label>
        <Select
          value={block.settings?.cardStyle || 'elevated'}
          onChange={(e) => onUpdate({ cardStyle: e.target.value })}
        >
          <option value="elevated">Elevated (Shadow)</option>
          <option value="bordered">Bordered</option>
          <option value="flat">Flat</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Accent Color</Label>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ColorInput
            type="color"
            value={block.settings?.accentColor || '#6366f1'}
            onChange={(e) => onUpdate({ accentColor: e.target.value })}
          />
          <Input
            type="text"
            value={block.settings?.accentColor || '#6366f1'}
            onChange={(e) => onUpdate({ accentColor: e.target.value })}
            placeholder="#6366f1"
            style={{ flex: 1 }}
          />
        </div>
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showRating"
            checked={block.settings?.showRating !== false}
            onChange={(e) => onUpdate({ showRating: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showRating">Show star ratings</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showAvatar"
            checked={block.settings?.showAvatar !== false}
            onChange={(e) => onUpdate({ showAvatar: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showAvatar">Show avatars</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      {block.settings?.layout === 'carousel' && (
        <>
          <SettingGroup>
            <CheckboxWrapper>
              <Checkbox
                type="checkbox"
                id="autoplay"
                checked={block.settings?.autoplay || false}
                onChange={(e) => onUpdate({ autoplay: e.target.checked })}
              />
              <CheckboxLabel htmlFor="autoplay">Autoplay carousel</CheckboxLabel>
            </CheckboxWrapper>
          </SettingGroup>

          {block.settings?.autoplay && (
            <SettingGroup>
              <Label>Autoplay Speed (seconds)</Label>
              <Input
                type="number"
                min="1"
                max="20"
                value={block.settings?.autoplaySpeed || 5}
                onChange={(e) => onUpdate({ autoplaySpeed: parseInt(e.target.value) || 5 })}
              />
            </SettingGroup>
          )}
        </>
      )}

      <Divider />

      <SettingGroup>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <Label style={{ marginBottom: 0 }}>Testimonials ({testimonials.length})</Label>
          <AddButton onClick={handleAddTestimonial}>
            <Plus size={14} />
            Add
          </AddButton>
        </div>

        {testimonials.length > 0 && (
          <ItemTabs>
            {testimonials.map((t: TestimonialItem, i: number) => (
              <ItemTab key={t.id} $active={selectedIndex === i} onClick={() => setSelectedIndex(i)}>
                {t.name.split(' ')[0] || `#${i + 1}`}
              </ItemTab>
            ))}
          </ItemTabs>
        )}
      </SettingGroup>

      {selectedTestimonial && (
        <>
          <SettingGroup>
            <Label>Name</Label>
            <Input
              type="text"
              value={selectedTestimonial.name}
              onChange={(e) => handleUpdateTestimonial('name', e.target.value)}
              placeholder="John Doe"
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Role</Label>
            <Input
              type="text"
              value={selectedTestimonial.role || ''}
              onChange={(e) => handleUpdateTestimonial('role', e.target.value)}
              placeholder="Marketing Manager"
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Company</Label>
            <Input
              type="text"
              value={selectedTestimonial.company || ''}
              onChange={(e) => handleUpdateTestimonial('company', e.target.value)}
              placeholder="Acme Inc."
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Avatar URL</Label>
            <Input
              type="url"
              value={selectedTestimonial.avatar || ''}
              onChange={(e) => handleUpdateTestimonial('avatar', e.target.value)}
              placeholder="https://example.com/avatar.jpg"
            />
            <HelpText>Leave empty to show initials</HelpText>
          </SettingGroup>

          <SettingGroup>
            <Label>Testimonial Content</Label>
            <Textarea
              value={selectedTestimonial.content}
              onChange={(e) => handleUpdateTestimonial('content', e.target.value)}
              placeholder="Enter testimonial..."
              rows={4}
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Rating (1-5 stars)</Label>
            <Select
              value={selectedTestimonial.rating || 5}
              onChange={(e) => handleUpdateTestimonial('rating', parseInt(e.target.value))}
            >
              <option value={5}>5 Stars</option>
              <option value={4}>4 Stars</option>
              <option value={3}>3 Stars</option>
              <option value={2}>2 Stars</option>
              <option value={1}>1 Star</option>
            </Select>
          </SettingGroup>

          <SettingGroup>
            <DeleteItemButton onClick={() => handleDeleteTestimonial(selectedIndex)}>
              <Trash2 size={14} />
              Delete Testimonial
            </DeleteItemButton>
          </SettingGroup>
        </>
      )}
    </>
  );
};

export default TestimonialsSettings;
