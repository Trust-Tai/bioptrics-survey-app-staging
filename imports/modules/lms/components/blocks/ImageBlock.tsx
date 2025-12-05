import React from 'react';
import styled from 'styled-components';
import { Upload } from 'lucide-react';
import type { ImageBlock as ImageBlockType } from '../../types/contentBlocks';

interface ImageBlockProps {
  block: ImageBlockType;
  isEditing: boolean;
  onUpdate: (settings: Partial<ImageBlockType['settings']>) => void;
}

const ImageContainer = styled.div<{ alignment: string }>`
  display: flex;
  flex-direction: column;
  align-items: ${props => 
    props.alignment === 'left' ? 'flex-start' :
    props.alignment === 'right' ? 'flex-end' :
    'center'
  };
  gap: 12px;
`;

const ImageWrapper = styled.div<{ maxWidth: string }>`
  max-width: ${props => props.maxWidth || '100%'};
  width: 100%;
`;

const StyledImage = styled.img<{ borderRadius: string }>`
  width: 100%;
  height: auto;
  display: block;
  border-radius: ${props => props.borderRadius || '8px'};
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
`;

const ImagePlaceholder = styled.div`
  width: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  gap: 12px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    border-color: #6366f1;
  }
`;

const PlaceholderIcon = styled.div`
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #e5e7eb;
  border-radius: 50%;
  color: #9ca3af;
`;

const PlaceholderText = styled.p`
  margin: 0;
  color: #6b7280;
  font-size: 14px;
  text-align: center;
`;

const Caption = styled.p<{ alignment: string }>`
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  font-style: italic;
  text-align: ${props => props.alignment};
  max-width: 100%;
`;

const HiddenInput = styled.input`
  display: none;
`;

const EditOverlay = styled.div`
  position: relative;
  
  &:hover .edit-button {
    opacity: 1;
  }
`;

const EditButton = styled.button`
  position: absolute;
  top: 12px;
  right: 12px;
  padding: 8px 16px;
  background: rgba(255, 255, 255, 0.95);
  color: #374151;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  font-weight: 500;
  cursor: pointer;
  opacity: 0;
  transition: all 0.2s;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  
  &:hover {
    background: white;
    border-color: #6366f1;
    color: #6366f1;
  }
`;

export const ImageBlock: React.FC<ImageBlockProps> = ({ block, isEditing, onUpdate }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [imageError, setImageError] = React.useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      // Convert image to base64 for persistent storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setImageError(false); // Reset error state on new upload
        onUpdate({
          imageUrl: base64String,
          fileName: file.name,
          altText: block.settings.altText || file.name.replace(/\.[^/.]+$/, ''),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  const handleImageError = () => {
    setImageError(true);
  };

  return (
    <ImageContainer alignment={block.settings.alignment || 'center'}>
      <HiddenInput
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileUpload}
      />
      
      <ImageWrapper maxWidth={block.settings.maxWidth || '100%'}>
        {block.settings.imageUrl && !imageError ? (
          <EditOverlay>
            <StyledImage
              src={block.settings.imageUrl}
              alt={block.settings.altText || 'Image'}
              borderRadius={block.settings.borderRadius || '8px'}
              onError={handleImageError}
            />
            {isEditing && (
              <EditButton className="edit-button" onClick={handleClick}>
                Change Image
              </EditButton>
            )}
          </EditOverlay>
        ) : (
          <ImagePlaceholder onClick={handleClick}>
            <PlaceholderIcon>
              <Upload size={32} />
            </PlaceholderIcon>
            <PlaceholderText>
              {imageError ? (
                <>
                  Image failed to load
                  <br />
                  <span style={{ fontSize: '12px' }}>
                    {isEditing ? 'Click to upload a new image' : ''}
                  </span>
                </>
              ) : isEditing ? (
                'Click to upload an image'
              ) : (
                'No image uploaded'
              )}
            </PlaceholderText>
            {isEditing && !imageError && (
              <PlaceholderText style={{ fontSize: '12px', color: '#9ca3af' }}>
                Supports: JPG, PNG, GIF, SVG
              </PlaceholderText>
            )}
          </ImagePlaceholder>
        )}
      </ImageWrapper>
      
      {block.settings.showCaption && block.settings.caption && (
        <Caption alignment={block.settings.alignment || 'center'}>
          {block.settings.caption}
        </Caption>
      )}
    </ImageContainer>
  );
};
