import React from 'react';
import styled from 'styled-components';
import { Video } from 'lucide-react';
import type { VideoBlock as VideoBlockType } from '../../types/contentBlocks';
import { extractYouTubeVideoId } from '../../utils/blockHelpers';

interface VideoBlockProps {
  block: VideoBlockType;
  isEditing: boolean;
  onUpdate: (settings: Partial<VideoBlockType['settings']>) => void;
}

const VideoContainer = styled.div`
  width: 100%;
`;

const VideoWrapper = styled.div<{ aspectRatio: string }>`
  position: relative;
  width: 100%;
  padding-bottom: ${props => 
    props.aspectRatio === '16:9' ? '56.25%' :
    props.aspectRatio === '4:3' ? '75%' :
    '100%'
  };
  background: #000;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
`;

const VideoIframe = styled.iframe`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border: none;
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

const VideoTitle = styled.h3`
  margin: 0 0 12px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
`;

const HelpText = styled.p`
  margin: 8px 0 0 0;
  font-size: 12px;
  color: #9ca3af;
  text-align: center;
`;

export const VideoBlock: React.FC<VideoBlockProps> = ({ block, isEditing, onUpdate }) => {
  const [urlInput, setUrlInput] = React.useState(block.settings.youtubeUrl || '');

  const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const url = e.target.value;
    setUrlInput(url);
    
    const videoId = extractYouTubeVideoId(url);
    if (videoId) {
      onUpdate({
        youtubeUrl: url,
        videoId: videoId,
        title: block.settings.title || 'YouTube Video',
      });
    }
  };

  const buildYouTubeUrl = (): string => {
    if (!block.settings.videoId) return '';
    
    const params = new URLSearchParams();
    
    if (block.settings.startTime) {
      params.append('start', block.settings.startTime.toString());
    }
    if (block.settings.autoplay) {
      params.append('autoplay', '1');
    }
    if (!block.settings.showControls) {
      params.append('controls', '0');
    }
    if (block.settings.muted) {
      params.append('mute', '1');
    }
    if (block.settings.loop) {
      params.append('loop', '1');
      params.append('playlist', block.settings.videoId);
    }
    
    const queryString = params.toString();
    return `https://www.youtube.com/embed/${block.settings.videoId}${queryString ? '?' + queryString : ''}`;
  };

  if (!block.settings.videoId) {
    return (
      <VideoContainer>
        <VideoPlaceholder>
          <PlaceholderIcon>
            <Video size={40} />
          </PlaceholderIcon>
          <PlaceholderText>
            {isEditing ? 'Enter a YouTube URL to embed a video' : 'No video configured'}
          </PlaceholderText>
          {isEditing && (
            <>
              <UrlInput
                type="text"
                placeholder="https://www.youtube.com/watch?v=..."
                value={urlInput}
                onChange={handleUrlChange}
              />
              <HelpText>
                Paste a YouTube video URL (supports youtube.com and youtu.be links)
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
        <VideoIframe
          src={buildYouTubeUrl()}
          title={block.settings.title || 'YouTube Video'}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </VideoWrapper>
      {isEditing && (
        <div style={{ marginTop: '12px' }}>
          <UrlInput
            type="text"
            placeholder="https://www.youtube.com/watch?v=..."
            value={urlInput}
            onChange={handleUrlChange}
          />
          <HelpText>
            Current video ID: {block.settings.videoId}
          </HelpText>
        </div>
      )}
    </VideoContainer>
  );
};
