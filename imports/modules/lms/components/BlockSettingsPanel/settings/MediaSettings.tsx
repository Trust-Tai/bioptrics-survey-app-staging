import React, { useRef, useState } from 'react';
import styled from 'styled-components';
import { Upload, Video, Music, Link, Loader2 } from 'lucide-react';
import imageCompression from 'browser-image-compression';
import type { MediaBlock } from '../../../types/contentBlocks';
import {
  SettingGroup,
  Label,
  Input,
  Select,
  ColorInput,
  Divider,
  HelpText,
} from '../shared/StyledComponents';

const MediaTypeSelector = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
`;

const MediaTypeButton = styled.button<{ $active: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px;
  border: 2px solid ${props => props.$active ? '#3b82f6' : '#e5e7eb'};
  background: ${props => props.$active ? '#eff6ff' : 'white'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    border-color: #3b82f6;
  }
  
  svg {
    width: 24px;
    height: 24px;
    color: ${props => props.$active ? '#3b82f6' : '#6b7280'};
  }
  
  span {
    font-size: 13px;
    font-weight: 500;
    color: ${props => props.$active ? '#3b82f6' : '#374151'};
  }
`;

const UploadArea = styled.label<{ $isDragging?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px;
  border: 2px dashed ${props => props.$isDragging ? '#3b82f6' : '#d1d5db'};
  background: ${props => props.$isDragging ? '#eff6ff' : '#f9fafb'};
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s;
  text-align: center;
  
  &:hover {
    border-color: #3b82f6;
    background: #f8fafc;
  }
  
  svg {
    width: 32px;
    height: 32px;
    color: #9ca3af;
  }
`;

const UploadText = styled.div`
  font-size: 14px;
  color: #374151;
  
  span {
    color: #3b82f6;
    font-weight: 500;
  }
`;

const UploadHint = styled.div`
  font-size: 12px;
  color: #9ca3af;
`;

const HiddenInput = styled.input`
  display: none;
`;

const PreviewContainer = styled.div`
  margin-top: 12px;
  border-radius: 8px;
  overflow: hidden;
  background: #111827;
  
  video, audio {
    width: 100%;
    display: block;
  }
`;

const LoadingOverlay = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 32px;
  background: #f9fafb;
  border-radius: 8px;
  
  svg {
    animation: spin 1s linear infinite;
  }
  
  @keyframes spin {
    from { transform: rotate(0deg); }
    to { transform: rotate(360deg); }
  }
`;

const ProgressText = styled.div`
  font-size: 13px;
  color: #6b7280;
`;

const OrDivider = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin: 16px 0;
  
  &::before, &::after {
    content: '';
    flex: 1;
    height: 1px;
    background: #e5e7eb;
  }
  
  span {
    font-size: 12px;
    color: #9ca3af;
    text-transform: uppercase;
  }
`;

const CheckboxLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: #374151;
  cursor: pointer;
  
  input {
    width: 16px;
    height: 16px;
    accent-color: #3b82f6;
  }
`;

interface MediaSettingsProps {
  block: MediaBlock;
  onUpdate: (settings: any) => void;
}

export const MediaSettings: React.FC<MediaSettingsProps> = ({ block, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const mediaType = block.settings?.mediaType || 'video';
  const mediaUrl = block.settings?.mediaUrl || '';

  const handleMediaTypeChange = (type: 'video' | 'audio') => {
    onUpdate({ mediaType: type, mediaUrl: '' });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // For video/audio, we'll convert to base64 (for smaller files)
      // In production, you'd upload to a server/CDN
      const reader = new FileReader();
      
      reader.onprogress = (event) => {
        if (event.lengthComputable) {
          setUploadProgress(Math.round((event.loaded / event.total) * 100));
        }
      };

      reader.onload = (event) => {
        const result = event.target?.result as string;
        
        // Detect media type from file
        const isVideo = file.type.startsWith('video/');
        const isAudio = file.type.startsWith('audio/');
        
        onUpdate({
          mediaUrl: result,
          mediaType: isVideo ? 'video' : isAudio ? 'audio' : mediaType,
          title: block.settings?.title || file.name.replace(/\.[^/.]+$/, ''),
        });
        
        setIsUploading(false);
      };

      reader.onerror = () => {
        console.error('Error reading file');
        setIsUploading(false);
      };

      reader.readAsDataURL(file);
    } catch (error) {
      console.error('Upload error:', error);
      setIsUploading(false);
    }

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const acceptedFormats = mediaType === 'video' 
    ? 'video/mp4,video/webm,video/ogg' 
    : 'audio/mpeg,audio/wav,audio/ogg,audio/mp3';

  return (
    <>
      <SettingGroup>
        <Label>Media Type</Label>
        <MediaTypeSelector>
          <MediaTypeButton
            type="button"
            $active={mediaType === 'video'}
            onClick={() => handleMediaTypeChange('video')}
          >
            <Video />
            <span>Video</span>
          </MediaTypeButton>
          <MediaTypeButton
            type="button"
            $active={mediaType === 'audio'}
            onClick={() => handleMediaTypeChange('audio')}
          >
            <Music />
            <span>Audio</span>
          </MediaTypeButton>
        </MediaTypeSelector>
      </SettingGroup>

      <SettingGroup>
        <Label>Upload {mediaType === 'video' ? 'Video' : 'Audio'}</Label>
        {isUploading ? (
          <LoadingOverlay>
            <Loader2 size={24} />
            <ProgressText>Uploading... {uploadProgress}%</ProgressText>
          </LoadingOverlay>
        ) : (
          <UploadArea>
            <Upload />
            <UploadText>
              <span>Click to upload</span> or drag and drop
            </UploadText>
            <UploadHint>
              {mediaType === 'video' ? 'MP4, WebM, OGG (max 50MB)' : 'MP3, WAV, OGG (max 20MB)'}
            </UploadHint>
            <HiddenInput
              ref={fileInputRef}
              type="file"
              accept={acceptedFormats}
              onChange={handleFileUpload}
            />
          </UploadArea>
        )}

        {mediaUrl && !mediaUrl.startsWith('data:') && (
          <PreviewContainer style={{ marginTop: 12 }}>
            {mediaType === 'video' ? (
              <video src={mediaUrl} controls style={{ maxHeight: 200 }} />
            ) : (
              <audio src={mediaUrl} controls style={{ width: '100%' }} />
            )}
          </PreviewContainer>
        )}
      </SettingGroup>

      <OrDivider><span>or</span></OrDivider>

      <SettingGroup>
        <Label>
          <Link size={14} style={{ marginRight: 6, verticalAlign: 'middle' }} />
          {mediaType === 'video' ? 'Video URL / YouTube Link' : 'Audio URL'}
        </Label>
        <Input
          type="url"
          value={mediaUrl?.startsWith('data:') ? '' : mediaUrl}
          onChange={(e) => onUpdate({ mediaUrl: e.target.value })}
          placeholder={mediaType === 'video' 
            ? 'https://youtube.com/watch?v=... or video URL' 
            : 'https://example.com/audio.mp3'
          }
        />
        <HelpText>
          {mediaType === 'video' 
            ? 'Supports YouTube, Vimeo, or direct video URLs' 
            : 'Direct link to MP3, WAV, or OGG file'
          }
        </HelpText>
      </SettingGroup>

      <Divider />

      {mediaType === 'audio' && (
        <>
          <SettingGroup>
            <Label>Track Title</Label>
            <Input
              type="text"
              value={block.settings?.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Song or podcast title"
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Artist / Author</Label>
            <Input
              type="text"
              value={block.settings?.artist || ''}
              onChange={(e) => onUpdate({ artist: e.target.value })}
              placeholder="Artist name"
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Player Colors</Label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <div>
                <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Background</Label>
                <ColorInput
                  type="color"
                  value={block.settings?.bgColor || '#1e293b'}
                  onChange={(e) => onUpdate({ bgColor: e.target.value })}
                />
              </div>
              <div>
                <Label style={{ fontSize: '11px', marginBottom: '4px' }}>Accent</Label>
                <ColorInput
                  type="color"
                  value={block.settings?.accentColor || '#8b5cf6'}
                  onChange={(e) => onUpdate({ accentColor: e.target.value })}
                />
              </div>
            </div>
          </SettingGroup>

          <Divider />
        </>
      )}

      {mediaType === 'video' && (
        <>
          <SettingGroup>
            <Label>Video Title</Label>
            <Input
              type="text"
              value={block.settings?.title || ''}
              onChange={(e) => onUpdate({ title: e.target.value })}
              placeholder="Video title"
            />
          </SettingGroup>

          <SettingGroup>
            <Label>Poster Image URL</Label>
            <Input
              type="url"
              value={block.settings?.posterUrl || ''}
              onChange={(e) => onUpdate({ posterUrl: e.target.value })}
              placeholder="https://example.com/thumbnail.jpg"
            />
            <HelpText>Thumbnail shown before video plays</HelpText>
          </SettingGroup>

          <Divider />
        </>
      )}

      <SettingGroup>
        <Label>Playback Options</Label>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={block.settings?.autoplay || false}
              onChange={(e) => onUpdate({ autoplay: e.target.checked })}
            />
            Autoplay (muted for videos)
          </CheckboxLabel>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={block.settings?.loop || false}
              onChange={(e) => onUpdate({ loop: e.target.checked })}
            />
            Loop playback
          </CheckboxLabel>
          <CheckboxLabel>
            <input
              type="checkbox"
              checked={block.settings?.showControls !== false}
              onChange={(e) => onUpdate({ showControls: e.target.checked })}
            />
            Show player controls
          </CheckboxLabel>
        </div>
      </SettingGroup>
    </>
  );
};

export default MediaSettings;
