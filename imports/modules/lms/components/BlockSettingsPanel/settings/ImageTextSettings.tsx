import React from 'react';
import styled from 'styled-components';
import type { ImageTextBlock } from '../../../types/contentBlocks';
import { MiniRichTextEditor } from '../shared/MiniRichTextEditor';
import {
  SettingGroup,
  Label,
  Input,
  Select,
  Divider,
  HelpText,
} from '../shared/StyledComponents';

// Local styled components for ImageText
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
  
  svg {
    width: 20px;
    height: 20px;
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

interface ImageTextSettingsProps {
  block: ImageTextBlock;
  onUpdate: (settings: any) => void;
}

export const ImageTextSettings: React.FC<ImageTextSettingsProps> = ({ block, onUpdate }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const defaultImage = 'https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=800&h=600&fit=crop';
  const currentImage = block.settings?.imageUrl || defaultImage;

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        onUpdate({ imageUrl: event.target?.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleChangeImage = () => {
    fileInputRef.current?.click();
  };

  return (
    <>
      <SettingGroup>
        <Label>Image Source</Label>
        <ImageUploadContainer>
          <ChangeImageButton onClick={handleChangeImage}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Change Image
          </ChangeImageButton>
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
          />
          <ImagePreview src={currentImage} alt="Preview" />
        </ImageUploadContainer>
        <HelpText>Click "Change Image" to upload from your computer</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Or enter image URL</Label>
        <Input
          type="url"
          value={block.settings?.imageUrl || ''}
          onChange={(e) => onUpdate({ imageUrl: e.target.value })}
          placeholder="https://example.com/image.jpg"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Alt Text</Label>
        <Input
          type="text"
          value={block.settings?.imageAlt || ''}
          onChange={(e) => onUpdate({ imageAlt: e.target.value })}
          placeholder="Sample image"
        />
        <HelpText>Describe the image for accessibility</HelpText>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Add Heading</Label>
        <Input
          type="text"
          value={block.settings?.heading || ''}
          onChange={(e) => onUpdate({ heading: e.target.value })}
          placeholder="Sample Heading"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Heading Level</Label>
        <Select
          value={block.settings?.headingLevel || 'h2'}
          onChange={(e) => onUpdate({ headingLevel: e.target.value })}
        >
          <option value="h1">H1 - Main Heading</option>
          <option value="h2">H2 - Section Heading</option>
          <option value="h3">H3 - Subsection Heading</option>
          <option value="h4">H4 - Minor Heading</option>
          <option value="h5">H5 - Small Heading</option>
          <option value="h6">H6 - Smallest Heading</option>
        </Select>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Content</Label>
        <MiniRichTextEditor
          value={block.settings?.content || ''}
          onChange={(content) => onUpdate({ content })}
          placeholder="Add your text content here..."
        />
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Call-to-Action Button (Optional)</Label>
        <Input
          type="text"
          value={block.settings?.buttonText || ''}
          onChange={(e) => onUpdate({ buttonText: e.target.value })}
          placeholder="Learn More"
          style={{ marginBottom: '8px' }}
        />
        <Input
          type="url"
          value={block.settings?.buttonUrl || ''}
          onChange={(e) => onUpdate({ buttonUrl: e.target.value })}
          placeholder="https://example.com"
        />
        <HelpText>Add button text and URL</HelpText>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Layout Style</Label>
        <Select
          value={block.settings?.layout || 'image-left'}
          onChange={(e) => onUpdate({ layout: e.target.value })}
        >
          <option value="image-left">Image Left, Text Right</option>
          <option value="image-right">Image Right, Text Left</option>
          <option value="image-top">Image Top, Text Bottom</option>
          <option value="image-bottom">Image Bottom, Text Top</option>
        </Select>
        <HelpText>Choose how to arrange image and text</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Button Style</Label>
        <Select
          value={block.settings?.buttonVariant || 'primary'}
          onChange={(e) => onUpdate({ buttonVariant: e.target.value })}
        >
          <option value="primary">Primary (Blue)</option>
          <option value="secondary">Secondary (Outline)</option>
          <option value="success">Success (Green)</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Button Alignment</Label>
        <Select
          value={block.settings?.buttonAlignment || 'left'}
          onChange={(e) => onUpdate({ buttonAlignment: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Select>
      </SettingGroup>
    </>
  );
};

export default ImageTextSettings;
