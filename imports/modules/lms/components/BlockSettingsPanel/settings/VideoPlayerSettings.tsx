import React from 'react';
import type { VideoPlayerBlock } from '../../../types/contentBlocks';
import {
  SettingGroup,
  Label,
  Input,
  Select,
  CheckboxWrapper,
  Checkbox,
  CheckboxLabel,
  Divider,
  HelpText,
} from '../shared/StyledComponents';

interface VideoPlayerSettingsProps {
  block: VideoPlayerBlock;
  onUpdate: (settings: any) => void;
}

export const VideoPlayerSettings: React.FC<VideoPlayerSettingsProps> = ({ block, onUpdate }) => {
  const posterInputRef = React.useRef<HTMLInputElement>(null);

  const handlePosterUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => {
        onUpdate({ posterUrl: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <>
      <SettingGroup>
        <Label>Video Title</Label>
        <Input
          type="text"
          value={block.settings.title || ''}
          onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Video title (optional)"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Poster Image (Thumbnail)</Label>
        {block.settings.posterUrl && (
          <div style={{ marginBottom: '8px' }}>
            <img 
              src={block.settings.posterUrl} 
              alt="Poster" 
              style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }} 
            />
          </div>
        )}
        <button
          onClick={() => posterInputRef.current?.click()}
          style={{
            padding: '8px 16px',
            background: '#6366f1',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
          }}
        >
          {block.settings.posterUrl ? 'Change Poster' : 'Upload Poster'}
        </button>
        <input
          ref={posterInputRef}
          type="file"
          accept="image/*"
          onChange={handlePosterUpload}
          style={{ display: 'none' }}
        />
        <HelpText>Thumbnail shown before video plays</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Aspect Ratio</Label>
        <Select
          value={block.settings.aspectRatio || '16:9'}
          onChange={e => onUpdate({ aspectRatio: e.target.value })}
        >
          <option value="16:9">16:9 (Widescreen)</option>
          <option value="4:3">4:3 (Standard)</option>
          <option value="1:1">1:1 (Square)</option>
          <option value="auto">Auto (Original Size)</option>
        </Select>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Playback Options</Label>
        
        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="controls-player"
            checked={block.settings.controls !== false}
            onChange={e => onUpdate({ controls: e.target.checked })}
          />
          <CheckboxLabel htmlFor="controls-player">Show player controls</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="autoplay-player"
            checked={block.settings.autoplay || false}
            onChange={e => onUpdate({ autoplay: e.target.checked })}
          />
          <CheckboxLabel htmlFor="autoplay-player">Autoplay video</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="muted-player"
            checked={block.settings.muted || false}
            onChange={e => onUpdate({ muted: e.target.checked })}
          />
          <CheckboxLabel htmlFor="muted-player">Muted by default</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="loop-player"
            checked={block.settings.loop || false}
            onChange={e => onUpdate({ loop: e.target.checked })}
          />
          <CheckboxLabel htmlFor="loop-player">Loop video</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <SettingGroup>
        <Label>Preload</Label>
        <Select
          value={block.settings.preload || 'metadata'}
          onChange={e => onUpdate({ preload: e.target.value })}
        >
          <option value="none">None</option>
          <option value="metadata">Metadata Only</option>
          <option value="auto">Auto (Full Video)</option>
        </Select>
        <HelpText>How much video to load before playing</HelpText>
      </SettingGroup>
    </>
  );
};

export default VideoPlayerSettings;
