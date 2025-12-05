import React, { useRef, useState, useEffect } from 'react';
import styled from 'styled-components';
import { Play, Pause, Volume2, VolumeX, Upload, Download, Music } from 'lucide-react';
import type { AudioPlayerBlock as AudioPlayerBlockType } from '../../types/contentBlocks';

interface AudioPlayerBlockProps {
  block: AudioPlayerBlockType;
  isEditing: boolean;
  onUpdate: (settings: Partial<AudioPlayerBlockType['settings']>) => void;
}

const AudioContainer = styled.div<{ playerType?: string }>`
  width: 100%;
  ${props => props.playerType === 'sticky' && `
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 1000;
    box-shadow: 0 -4px 12px rgba(0, 0, 0, 0.15);
  `}
`;

const PlayerWrapper = styled.div<{ bgColor?: string; isSticky?: boolean }>`
  background: ${props => props.bgColor || '#ffffff'};
  border-radius: ${props => props.isSticky ? '0' : '12px'};
  padding: ${props => props.isSticky ? '16px 24px' : '20px'};
  box-shadow: ${props => props.isSticky ? 'none' : '0 2px 8px rgba(0, 0, 0, 0.1)'};
  display: flex;
  align-items: center;
  gap: 16px;
  max-width: ${props => props.isSticky ? 'none' : '600px'};
  margin: 0 auto;
`;

const CoverImage = styled.div<{ url?: string; size?: string }>`
  width: ${props => props.size || '80px'};
  height: ${props => props.size || '80px'};
  border-radius: 8px;
  background: ${props => props.url ? `url(${props.url})` : '#e5e7eb'};
  background-size: cover;
  background-position: center;
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
`;

const PlayerContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const TrackInfo = styled.div`
  margin-bottom: 12px;
`;

const TrackTitle = styled.h3`
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #111827;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ArtistName = styled.p`
  margin: 0;
  font-size: 14px;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const ControlsRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const PlayButton = styled.button<{ accentColor?: string }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: none;
  background: ${props => props.accentColor || '#6366f1'};
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
  }
  
  &:active {
    transform: scale(0.95);
  }
`;

const ProgressBar = styled.div`
  flex: 1;
  height: 6px;
  background: #e5e7eb;
  border-radius: 3px;
  position: relative;
  cursor: pointer;
  overflow: hidden;
`;

const ProgressFill = styled.div<{ progress: number; accentColor?: string }>`
  height: 100%;
  width: ${props => props.progress}%;
  background: ${props => props.accentColor || '#6366f1'};
  border-radius: 3px;
  transition: width 0.1s;
`;

const TimeDisplay = styled.span`
  font-size: 12px;
  color: #6b7280;
  min-width: 85px;
  text-align: center;
  flex-shrink: 0;
`;

const VolumeControl = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

const VolumeButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #111827;
  }
`;

const VolumeSlider = styled.input`
  width: 80px;
  height: 4px;
  -webkit-appearance: none;
  appearance: none;
  background: #e5e7eb;
  border-radius: 2px;
  outline: none;
  
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #6366f1;
    cursor: pointer;
  }
  
  &::-moz-range-thumb {
    width: 14px;
    height: 14px;
    border-radius: 50%;
    background: #6366f1;
    cursor: pointer;
    border: none;
  }
`;

const DownloadButton = styled.button`
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: #6b7280;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: color 0.2s;
  
  &:hover {
    color: #111827;
  }
`;

const AudioPlaceholder = styled.div`
  width: 100%;
  min-height: 200px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: #f9fafb;
  border: 2px dashed #cbd5e1;
  border-radius: 12px;
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

const HiddenAudioElement = styled.audio`
  display: none;
`;

const Divider = styled.div`
  width: 100%;
  height: 1px;
  background: #e5e7eb;
  margin: 16px 0;
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

export const AudioPlayerBlock: React.FC<AudioPlayerBlockProps> = ({ block, isEditing, onUpdate }) => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const coverInputRef = useRef<HTMLInputElement>(null);
  
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(block.settings.volume || 0.8);
  const [isMuted, setIsMuted] = useState(false);
  const [urlInput, setUrlInput] = useState('');

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleDurationChange = () => setDuration(audio.duration);
    const handleEnded = () => setIsPlaying(false);

    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('durationchange', handleDurationChange);
    audio.addEventListener('ended', handleEnded);

    return () => {
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('durationchange', handleDurationChange);
      audio.removeEventListener('ended', handleEnded);
    };
  }, []);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('audio/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        onUpdate({
          audioUrl: base64String,
          fileName: file.name,
          title: block.settings.title || file.name.replace(/\.[^/.]+$/, ''),
        });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCoverUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ coverImageUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUrlSubmit = () => {
    if (urlInput.trim()) {
      onUpdate({
        audioUrl: urlInput.trim(),
        fileName: 'External Audio',
        title: block.settings.title || 'Audio Track',
      });
      setUrlInput('');
    }
  };

  const handlePlayPause = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
    }
    setIsPlaying(!isPlaying);
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const audio = audioRef.current;
    if (!audio) return;

    const bounds = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - bounds.left;
    const percentage = x / bounds.width;
    audio.currentTime = percentage * duration;
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = parseFloat(e.target.value);
    setVolume(newVolume);
    if (audioRef.current) {
      audioRef.current.volume = newVolume;
    }
  };

  const toggleMute = () => {
    if (audioRef.current) {
      audioRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };

  const handleDownload = () => {
    if (block.settings.audioUrl) {
      const link = document.createElement('a');
      link.href = block.settings.audioUrl;
      link.download = block.settings.fileName || 'audio.mp3';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  const formatTime = (time: number): string => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (!block.settings.audioUrl) {
    return (
      <AudioContainer>
        <AudioPlaceholder onClick={() => isEditing && fileInputRef.current?.click()}>
          <PlaceholderIcon>
            <Music size={40} />
          </PlaceholderIcon>
          <PlaceholderText>
            {isEditing ? 'Click to upload audio or paste a URL below' : 'No audio file uploaded'}
          </PlaceholderText>
          {isEditing && (
            <>
              <UploadButton onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                <Upload size={16} />
                Upload Audio
              </UploadButton>
              <HiddenFileInput
                ref={fileInputRef}
                type="file"
                accept="audio/mp3,audio/wav,audio/ogg,audio/aac,audio/mpeg"
                onChange={handleFileUpload}
              />
              
              <Divider />
              
              <div style={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
                <UrlInput
                  type="text"
                  placeholder="Or paste audio URL (MP3, WAV, OGG)"
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
                Supported formats: MP3, WAV, OGG, AAC • Max size: 50MB
              </HelpText>
            </>
          )}
        </AudioPlaceholder>
      </AudioContainer>
    );
  }

  return (
    <AudioContainer playerType={block.settings.playerType}>
      <PlayerWrapper 
        bgColor={block.settings.backgroundColor}
        isSticky={block.settings.playerType === 'sticky'}
      >
        <CoverImage 
          url={block.settings.coverImageUrl}
          size={block.settings.playerType === 'sticky' ? '60px' : '80px'}
          onClick={() => isEditing && coverInputRef.current?.click()}
          style={{ cursor: isEditing ? 'pointer' : 'default' }}
        >
          {!block.settings.coverImageUrl && <Music size={32} />}
        </CoverImage>
        
        <PlayerContent>
          <TrackInfo>
            <TrackTitle>{block.settings.title || 'Audio Track'}</TrackTitle>
            {block.settings.artist && (
              <ArtistName>{block.settings.artist}</ArtistName>
            )}
          </TrackInfo>
          
          <ControlsRow>
            <PlayButton 
              onClick={handlePlayPause}
              accentColor={block.settings.accentColor}
            >
              {isPlaying ? <Pause size={20} /> : <Play size={20} style={{ marginLeft: '2px' }} />}
            </PlayButton>
            
            <ProgressBar onClick={handleProgressClick}>
              <ProgressFill progress={progress} accentColor={block.settings.accentColor} />
            </ProgressBar>
            
            <TimeDisplay>
              {formatTime(currentTime)} / {formatTime(duration)}
            </TimeDisplay>
            
            <VolumeControl>
              <VolumeButton onClick={toggleMute}>
                {isMuted || volume === 0 ? <VolumeX size={18} /> : <Volume2 size={18} />}
              </VolumeButton>
              <VolumeSlider
                type="range"
                min="0"
                max="1"
                step="0.01"
                value={volume}
                onChange={handleVolumeChange}
              />
            </VolumeControl>
            
            {block.settings.showDownload !== false && (
              <DownloadButton onClick={handleDownload} title="Download audio">
                <Download size={18} />
              </DownloadButton>
            )}
          </ControlsRow>
        </PlayerContent>
        
        <HiddenAudioElement
          ref={audioRef}
          src={block.settings.audioUrl}
          loop={block.settings.loop}
          autoPlay={block.settings.autoplay}
          preload={block.settings.preload || 'metadata'}
        />
        
        {isEditing && (
          <HiddenFileInput
            ref={coverInputRef}
            type="file"
            accept="image/*"
            onChange={handleCoverUpload}
          />
        )}
      </PlayerWrapper>
    </AudioContainer>
  );
};
