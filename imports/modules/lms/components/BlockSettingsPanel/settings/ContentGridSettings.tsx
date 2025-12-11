import React, { useState } from 'react';
import styled from 'styled-components';
import { Plus, Trash2, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import type { ContentGridBlock, GridCardItem } from '../../../types/contentBlocks';
import {
  SettingGroup,
  Label,
  Input,
  Textarea,
  Select,
  CheckboxWrapper,
  Checkbox,
  CheckboxLabel,
  Divider,
} from '../shared/StyledComponents';

// Local styled components
const TabButton = styled.button<{ isActive: boolean }>`
  flex: 1;
  background: ${props => props.isActive ? '#ffffff' : 'transparent'};
  border: none;
  border-bottom: 2px solid ${props => props.isActive ? '#3b82f6' : 'transparent'};
  color: ${props => props.isActive ? '#3b82f6' : '#6b7280'};
  font-weight: ${props => props.isActive ? '600' : '500'};
  cursor: pointer;
  transition: all 0.2s;
  margin-bottom: -2px;
  
  &:hover {
    color: ${props => props.isActive ? '#3b82f6' : '#374151'};
  }
`;

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

const LoadingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 24px;
  color: #6b7280;
  gap: 8px;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
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

interface ContentGridSettingsProps {
  block: ContentGridBlock;
  onUpdate: (settings: any) => void;
}

export const ContentGridSettings: React.FC<ContentGridSettingsProps> = ({ block, onUpdate }) => {
  const [selectedItemIndex, setSelectedItemIndex] = useState<number>(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const items = block.settings.items || [];
  const selectedItem = items[selectedItemIndex];

  const handleAddItem = () => {
    const newItem: GridCardItem = {
      id: `item-${Date.now()}`,
      imageUrl: 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop',
      imageLayout: 'top-image',
      title: `Feature Card ${items.length + 1}`,
      description: 'This is a sample content grid item. You can customize it with your own content.',
      buttonText: 'Learn More',
      buttonUrl: '#',
    };
    onUpdate({ items: [...items, newItem] });
    setSelectedItemIndex(items.length);
  };

  const handleRemoveItem = (index: number) => {
    const newItems = items.filter((_: any, i: number) => i !== index);
    onUpdate({ items: newItems });
    if (selectedItemIndex >= newItems.length) {
      setSelectedItemIndex(Math.max(0, newItems.length - 1));
    }
  };

  const handleUpdateItem = (updates: Partial<GridCardItem>) => {
    const newItems = [...items];
    newItems[selectedItemIndex] = { ...selectedItem, ...updates };
    onUpdate({ items: newItems });
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);
    
    try {
      // Web Worker based compression - non-blocking
      const options = {
        maxSizeMB: 0.5, // Max 500KB for grid items
        maxWidthOrHeight: 800,
        useWebWorker: true,
        onProgress: (progress: number) => {
          setUploadProgress(Math.round(progress));
        },
      };

      const compressedFile = await imageCompression(file, options);
      
      const imageData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target?.result as string);
        reader.onerror = () => reject(new Error('Failed to read file'));
        reader.readAsDataURL(compressedFile);
      });
      
      handleUpdateItem({ imageUrl: imageData });
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  return (
    <>
      <SettingGroup>
        <Label>Grid Items</Label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
          {items.map((item: GridCardItem, index: number) => (
            <div key={item.id} style={{ position: 'relative' }}>
              <TabButton
                isActive={selectedItemIndex === index}
                onClick={() => setSelectedItemIndex(index)}
                style={{ padding: '8px 32px 8px 12px', fontSize: '13px' }}
              >
                Item {index + 1}
              </TabButton>
              {items.length > 1 && (
                <button
                  onClick={() => handleRemoveItem(index)}
                  style={{
                    position: 'absolute',
                    right: '8px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: '#dc2626',
                    cursor: 'pointer',
                    padding: '2px',
                    display: 'flex',
                  }}
                >
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          ))}
          <AddButton onClick={handleAddItem}>
            <Plus size={16} />
            Add Item
          </AddButton>
        </div>
      </SettingGroup>

      {selectedItem && (
        <>
          <SettingGroup>
            <Label>Image</Label>
            <ImageUploadContainer>
              {isUploading ? (
                <LoadingOverlay>
                  <Loader2 size={24} />
                  <span style={{ fontSize: '13px' }}>Compressing... {uploadProgress}%</span>
                </LoadingOverlay>
              ) : (
                <ChangeImageButton onClick={() => fileInputRef.current?.click()}>
                  <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Change Image
                </ChangeImageButton>
              )}
              <HiddenFileInput
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
              />
              {!isUploading && selectedItem.imageUrl && (
                <ImagePreview src={selectedItem.imageUrl} alt="Preview" />
              )}
            </ImageUploadContainer>
          </SettingGroup>

          <SettingGroup>
            <Label>Or enter image URL</Label>
            <Input
              type="url"
              value={selectedItem.imageUrl || ''}
              onChange={(e) => handleUpdateItem({ imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Image Layout</Label>
            <Select
              value={selectedItem.imageLayout || 'top-image'}
              onChange={(e) => handleUpdateItem({ imageLayout: e.target.value as 'no-image' | 'top-image' | 'background-image' | 'title-image' })}
            >
              <option value="no-image">No Image</option>
              <option value="top-image">Top Image → Title → Content</option>
              <option value="background-image">Background Image + Title + Content</option>
              <option value="title-image">Title → Image → Content</option>
            </Select>
          </SettingGroup>

          <Divider />

          <SettingGroup>
            <Label>Title</Label>
            <Input
              type="text"
              value={selectedItem.title}
              onChange={(e) => handleUpdateItem({ title: e.target.value })}
              placeholder="Feature Card Title"
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Description</Label>
            <Textarea
              value={selectedItem.description || ''}
              onChange={(e) => handleUpdateItem({ description: e.target.value })}
              placeholder="Card description text..."
              rows={3}
            />
          </SettingGroup>

          <Divider />

          <SettingGroup>
            <Label>Button Text (Optional)</Label>
            <Input
              type="text"
              value={selectedItem.buttonText || ''}
              onChange={(e) => handleUpdateItem({ buttonText: e.target.value })}
              placeholder="Learn More"
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Button URL</Label>
            <Input
              type="url"
              value={selectedItem.buttonUrl || ''}
              onChange={(e) => handleUpdateItem({ buttonUrl: e.target.value })}
              placeholder="https://example.com"
            />
          </SettingGroup>
        </>
      )}

      <Divider />

      <SettingGroup>
        <Label>Columns</Label>
        <Select
          value={block.settings.columns || 3}
          onChange={(e) => onUpdate({ columns: parseInt(e.target.value) })}
        >
          <option value="2">2 Columns</option>
          <option value="3">3 Columns</option>
          <option value="4">4 Columns</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Gap Size</Label>
        <Select
          value={block.settings.gap || 'medium'}
          onChange={(e) => onUpdate({ gap: e.target.value })}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Card Style</Label>
        <Select
          value={block.settings.cardStyle || 'elevated'}
          onChange={(e) => onUpdate({ cardStyle: e.target.value })}
        >
          <option value="elevated">Elevated (Shadow)</option>
          <option value="bordered">Bordered</option>
          <option value="flat">Flat</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showShadow"
            checked={block.settings.showShadow !== false}
            onChange={(e) => onUpdate({ showShadow: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showShadow">Show shadow on hover</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>
    </>
  );
};

export default ContentGridSettings;
