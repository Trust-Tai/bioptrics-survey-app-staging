import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Play, Pause, Volume2, VolumeX, Maximize, Music, Video, SkipBack, SkipForward } from 'lucide-react';
import type { MediaBlock as MediaBlockType } from '../../types/contentBlocks';

const MediaContainer = styled.div`
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  background: #111827;
  position: relative;
`;

const VideoPlayer = styled.video`
  width: 100%;
  display: block;
  max-height: 500px;
  object-fit: contain;
  background: #000;
`;

const AudioContainer = styled.div<{ $bgColor: string }>`
  background: ${props => props.$bgColor};
  padding: 32px;
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
`;

const AudioVisual = styled.div<{ $accentColor: string }>`
  width: 120px;
  height: 120px;
  border-radius: 50%;
  background: ${props => props.$accentColor};
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.2);
  animation: pulse 2s ease-in-out infinite;
  
  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.05); }
  }
  
  svg {
    width: 48px;
    height: 48px;
    color: white;
  }
`;

const AudioTitle = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: white;
  text-align: center;
`;

const AudioArtist = styled.div`
  font-size: 14px;
  color: rgba(255, 255, 255, 0.7);
  text-align: center;
  margin-top: -12px;
`;

const Controls = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  background: rgba(0, 0, 0, 0.8);
  backdrop-filter: blur(8px);
`;

const AudioControls = styled(Controls)`
  background: rgba(0, 0, 0, 0.3);
  border-radius: 50px;
  padding: 12px 24px;
  width: fit-content;
`;

const ControlButton = styled.button<{ $size?: 'small' | 'medium' | 'large' }>`
  background: ${props => props.$size === 'large' ? 'white' : 'transparent'};
  border: none;
  border-radius: 50%;
  width: ${props => props.$size === 'large' ? '56px' : props.$size === 'small' ? '32px' : '40px'};
  height: ${props => props.$size === 'large' ? '56px' : props.$size === 'small' ? '32px' : '40px'};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  color: ${props => props.$size === 'large' ? '#111827' : 'white'};
  transition: all 0.2s;
  
  &:hover {
    transform: scale(1.1);
    background: ${props => props.$size === 'large' ? '#f3f4f6' : 'rgba(255, 255, 255, 0.1)'};
  }
  
  svg {
    width: ${props => props.$size === 'large' ? '24px' : '20px'};
    height: ${props => props.$size === 'large' ? '24px' : '20px'};
  }
`;

const ProgressContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 12px;
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;
  position: relative;
  
  &:hover {
    height: 6px;
  }
`;

const Progress = styled.div<{ $percent: number }>`
  width: ${props => props.$percent}%;
  height: 100%;
  background: white;
  border-radius: 2px;
  position: relative;
  
  &::after {
    content: '';
    position: absolute;
    right: -6px;
    top: 50%;
    transform: translateY(-50%);
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    opacity: 0;
    transition: opacity 0.2s;
  }
  
  ${ProgressBar}:hover &::after {
    opacity: 1;
  }
`;

const TimeDisplay = styled.span`
  font-size: 12px;
  color: rgba(255, 255, 255, 0.8);
  min-width: 45px;
  font-family: monospace;
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const VolumeSlider = styled.input`
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  cursor: pointer;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    width: 12px;
    height: 12px;
    background: white;
    border-radius: 50%;
    cursor: pointer;
  }
`;

const EmptyState = styled.div`
  padding: 64px 24px;
  text-align: center;
  background: linear-gradient(135deg, #1e3a5f 0%, #0f172a 100%);
  border-radius: 12px;
  border: 2px dashed #334155;
`;

const EmptyIcon = styled.div`
  display: flex;
  justify-content: center;
  gap: 16px;
  margin-bottom: 16px;
  
  svg {
    width: 48px;
    height: 48px;
    color: #64748b;
  }
`;

const EmptyText = styled.p`
  font-size: 16px;
  color: #94a3b8;
  margin: 0 0 4px 0;
`;

const EmptySubtext = styled.p`
  font-size: 13px;
  color: #64748b;
  margin: 0;
`;

const YouTubeEmbed = styled.div`
  position: relative;
  padding-bottom: 56.25%;
  height: 0;
  overflow: hidden;
  border-radius: 12px;
  
  iframe {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    border: none;
  }
`;

interface MediaBlockProps {
  block: MediaBlockType;
  isEditing?: boolean;
  onUpdate?: (blockId: string, settings: any) => void;
}

const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};

const getYouTubeId = (url: string): string | null => {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
};

export const MediaBlock: React.FC<MediaBlockProps> = ({ block, isEditing }) => {
  const { settings } = block;
  const mediaRef = useRef<HTMLVideoElement | HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);

  const mediaType = settings?.mediaType || 'video';
  const mediaUrl = settings?.mediaUrl || '';
  const title = settings?.title || '';
  const artist = settings?.artist || '';
  const posterUrl = settings?.posterUrl || '';
  const bgColor = settings?.bgColor || '#1e293b';
  const accentColor = settings?.accentColor || '#8b5cf6';
  const autoplay = settings?.autoplay || false;
  const loop = settings?.loop || false;
  const showControls = settings?.showControls !== false;

  // Check for YouTube
  const youtubeId = mediaType === 'video' ? getYouTubeId(mediaUrl) : null;

  useEffect(() => {
    const media = mediaRef.current;
    if (!media) return;

    const handleTimeUpdate = () => setCurrentTime(media.currentTime);
    const handleLoadedMetadata = () => setDuration(media.duration);
    const handleEnded = () => setIsPlaying(false);

    media.addEventListener('timeupdate', handleTimeUpdate);
    media.addEventListener('loadedmetadata', handleLoadedMetadata);
    media.addEventListener('ended', handleEnded);

    return () => {
      media.removeEventListener('timeupdate', handleTimeUpdate);
      media.removeEventListener('loadedmetadata', handleLoadedMetadata);
      media.removeEventListener('ended', handleEnded);
    };
  }, [mediaUrl]);

  const togglePlay = () => {
    const media = mediaRef.current;
    if (!media) return;

    if (isPlaying) {
      media.pause();
    } else {
      media.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const media = mediaRef.current;
    if (!media) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    media.currentTime = percent * duration;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (mediaRef.current) {
      mediaRef.current.volume = newVolume;
    }
    setIsMuted(newVolume === 0);
  };

  const toggleMute = () => {
    if (mediaRef.current) {
      mediaRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const skip = (seconds: number) => {
    if (mediaRef.current) {
      mediaRef.current.currentTime += seconds;
    }
  };

  const toggleFullscreen = () => {
    if (mediaRef.current && 'requestFullscreen' in mediaRef.current) {
      (mediaRef.current as HTMLVideoElement).requestFullscreen();
    }
  };

  // Empty state
  if (!mediaUrl) {
    return (
      <EmptyState>
        <EmptyIcon>
          <Video />
          <Music />
        </EmptyIcon>
        <EmptyText>No media added yet</EmptyText>
        <EmptySubtext>Click edit to add video or audio content</EmptySubtext>
      </EmptyState>
    );
  }

  // YouTube embed
  if (youtubeId) {
    return (
      <YouTubeEmbed>
        <iframe
          src={`https://www.youtube.com/embed/${youtubeId}?rel=0${autoplay ? '&autoplay=1' : ''}${loop ? '&loop=1' : ''}`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          title={title || 'YouTube video'}
        />
      </YouTubeEmbed>
    );
  }

  // Audio player
  if (mediaType === 'audio') {
    return (
      <AudioContainer $bgColor={bgColor}>
        <AudioVisual $accentColor={accentColor}>
          <Music />
        </AudioVisual>
        
        {title && <AudioTitle>{title}</AudioTitle>}
        {artist && <AudioArtist>{artist}</AudioArtist>}
        
        <audio
          ref={mediaRef as React.RefObject<HTMLAudioElement>}
          src={mediaUrl}
          autoPlay={autoplay}
          loop={loop}
          style={{ display: 'none' }}
        />
        
        {showControls && (
          <>
            <ProgressContainer style={{ width: '100%', maxWidth: '400px' }}>
              <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
              <ProgressBar onClick={handleProgressClick}>
                <Progress $percent={duration ? (currentTime / duration) * 100 : 0} />
              </ProgressBar>
              <TimeDisplay>{formatTime(duration)}</TimeDisplay>
            </ProgressContainer>
            
            <AudioControls>
              <ControlButton onClick={() => skip(-10)} $size="small">
                <SkipBack />
              </ControlButton>
              <ControlButton onClick={togglePlay} $size="large">
                {isPlaying ? <Pause /> : <Play style={{ marginLeft: 2 }} />}
              </ControlButton>
              <ControlButton onClick={() => skip(10)} $size="small">
                <SkipForward />
              </ControlButton>
              <ControlButton onClick={toggleMute} $size="small">
                {isMuted ? <VolumeX /> : <Volume2 />}
              </ControlButton>
            </AudioControls>
          </>
        )}
      </AudioContainer>
    );
  }

  // Video player
  return (
    <MediaContainer>
      <VideoPlayer
        ref={mediaRef as React.RefObject<HTMLVideoElement>}
        src={mediaUrl}
        poster={posterUrl}
        autoPlay={autoplay}
        loop={loop}
        onClick={togglePlay}
      />
      
      {showControls && (
        <Controls>
          <ControlButton onClick={togglePlay}>
            {isPlaying ? <Pause /> : <Play />}
          </ControlButton>
          
          <ProgressContainer>
            <TimeDisplay>{formatTime(currentTime)}</TimeDisplay>
            <ProgressBar onClick={handleProgressClick}>
              <Progress $percent={duration ? (currentTime / duration) * 100 : 0} />
            </ProgressBar>
            <TimeDisplay>{formatTime(duration)}</TimeDisplay>
          </ProgressContainer>
          
          <VolumeControl>
            <ControlButton onClick={toggleMute}>
              {isMuted ? <VolumeX /> : <Volume2 />}
            </ControlButton>
            <VolumeSlider
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={isMuted ? 0 : volume}
              onChange={handleVolumeChange}
            />
          </VolumeControl>
          
          <ControlButton onClick={toggleFullscreen}>
            <Maximize />
          </ControlButton>
        </Controls>
      )}
    </MediaContainer>
  );
};

export default MediaBlock;
