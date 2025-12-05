import React, { useRef } from 'react';
import styled from 'styled-components';
import { Play, Upload } from 'lucide-react';
import type { VideoPlayerBlock as VideoPlayerBlockType } from '../../types/contentBlocks';

interface VideoPlayerBlockProps {
  block: VideoPlayerBlockType;
  isEditing: boolean;
  onUpdate: (settings: Partial<VideoPlayerBlockType['settings']>) => void;
}

const VideoContainer = styled.div`
  width: 100%;
`;

const VideoTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const VideoWrapper = styled.div<{ aspectRatio: string }>`
  position: relative;
  width: 100%;
  ${props => props.aspectRatio !== 'auto' && `
    padding-bottom: ${
      props.aspectRatio === '16:9' ? '56.25%' :
      props.aspectRatio === '4:3' ? '75%' :
      '100%'
    };
  `}
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const VideoElement = styled.video<{ hasAspectRatio: boolean }>`
  ${props => props.hasAspectRatio ? `
    position: absolute;
    top: 0;
    left: 0;
  ` : ''}
  width: 100%;
  height: ${props => props.hasAspectRatio ? '100%' : 'auto'};
  border-radius: 8px;
  outline: none;
`;

const VideoPlaceholder = styled.div`
  width: 100%;
  min-height: 300px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border: 2px dashed #cbd5e1;
  border-radius: 8px;
  gap: 16px;
  padding: 32px;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
    border-color: #9ca3af;
  }
`;

const PlaceholderIcon = styled.div`
  width: 80px;
  height: 80px;
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
  max-width: 400px;
`;

const UploadButton = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: #6366f1;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  
  &:hover {
    background: #4f46e5;
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const HiddenFileInput = styled.input`
  display: none;
`;

const UrlInput = styled.input`
  width: 100%;
  max-width: 500px;
  padding: 12px 16px;
  font-size: 14px;
  border: 2px solid #e5e7eb;
  border-radius: 6px;
  outline: none;
  transition: all 0.2s;
  
  &:focus {
    border-color: #6366f1;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
  }
  
  &::placeholder {
    color: #9ca3af;
  }
`;

const HelpText = styled.p`
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
`;

const VideoInfo = styled.div`
  margin-top: 12px;
  padding: 12px;
  background: #f9fafb;
  border-radius: 6px;
  font-size: 13px;
  color: #6b7280;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #e5e7eb;
  margin: 16px 0;
`;

export const VideoPlayerBlock: React.FC<VideoPlayerBlockProps> = ({ block, isEditing, onUpdate }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [urlInput, setUrlInput] = React.useState('');

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
      // Convert video to base64 for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdate({
          videoUrl: base64String,
          fileName: file.name,
          title: block.settings.title || file.name.replace(/\.[^/.]+$/, ''),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUpdate({
        videoUrl: urlInput.trim(),
        fileName: 'External Video',
        title: block.settings.title || 'Video Player',
      });
      setUrlInput('');
    }
  };

  const handlePlaceholderClick = () => {
    if (isEditing) {
      fileInputRef.current?.click();
    }
  };

  if (!block.settings.videoUrl) {
    return (
      <VideoContainer>
        <VideoPlaceholder onClick={handlePlaceholderClick}>
          <PlaceholderIcon>
            <Play size={40} />
          </PlaceholderIcon>
          <PlaceholderText>
            {isEditing ? 'Click to upload a video or paste a video URL below' : 'No video uploaded'}
          </PlaceholderText>
          {isEditing && (
            <>
              <UploadButton
                onClick={(e) => {
                  e.stopPropagation();
                  fileInputRef.current?.click();
                }}
              >
                <Upload size={16} />
                Upload Video
              </UploadButton>
              <HiddenFileInput
                ref={fileInputRef}
                type="file"
                accept="video/mp4,video/webm,video/ogg"
                onChange={handleFileUpload}
              />
              
              <Divider />
              
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <UrlInput
                  type="text"
                  placeholder="Or paste video URL (MP4, WebM, OGG)"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleUrlSubmit()}
                  onClick={(e) => e.stopPropagation()}
                />
                <UploadButton onClick={(e) => { e.stopPropagation(); handleUrlSubmit(); }}>
                  Add URL
                </UploadButton>
              </div>
              
              <HelpText>
                Supported formats: MP4, WebM, OGG • Max size: 100MB (for uploads)
              </HelpText>
            </>
          )}
        </VideoPlaceholder>
      </VideoContainer>
    );
  }

  return (
    <VideoContainer>
      {block.settings.title && (
        <VideoTitle>{block.settings.title}</VideoTitle>
      )}
      <VideoWrapper aspectRatio={block.settings.aspectRatio || '16:9'}>
        <VideoElement
          controls={block.settings.controls !== false}
          autoPlay={block.settings.autoplay || false}
          loop={block.settings.loop || false}
          muted={block.settings.muted || false}
          preload={block.settings.preload || 'metadata'}
          poster={block.settings.posterUrl}
          hasAspectRatio={block.settings.aspectRatio !== 'auto'}
        >
          <source src={block.settings.videoUrl} type="video/mp4" />
          <source src={block.settings.videoUrl} type="video/webm" />
          <source src={block.settings.videoUrl} type="video/ogg" />
          {block.settings.captionsUrl && (
            <track
              kind="captions"
              src={block.settings.captionsUrl}
              srcLang="en"
              label="English"
            />
          )}
          Your browser does not support the video tag.
        </VideoElement>
      </VideoWrapper>
      {isEditing && (
        <VideoInfo>
          <strong>File:</strong> {block.settings.fileName || 'Unknown'}
          <br />
          <UploadButton
            onClick={() => fileInputRef.current?.click()}
            style={{ marginTop: '8px', padding: '6px 12px', fontSize: '12px' }}
          >
            <Upload size={14} />
            Replace Video
          </UploadButton>
          <HiddenFileInput
            ref={fileInputRef}
            type="file"
            accept="video/mp4,video/webm,video/ogg"
            onChange={handleFileUpload}
          />
        </VideoInfo>
      )}
    </VideoContainer>
  );
};
