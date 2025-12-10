import React from 'react';
import type { AudioPlayerBlock } from '../../../types/contentBlocks';
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

interface AudioPlayerSettingsProps {
  block: AudioPlayerBlock;
  onUpdate: (settings: any) => void;
}

export const AudioPlayerSettings: React.FC<AudioPlayerSettingsProps> = ({ block, onUpdate }) => {
  const coverInputRef = React.useRef<HTMLInputElement>(null);

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

  return (
    <>
      <SettingGroup>
        <Label>Track Title</Label>
        <Input
          type="text"
          value={block.settings.title || ''}
          onChange={e => onUpdate({ title: e.target.value })}
          placeholder="Enter track title"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Artist Name</Label>
        <Input
          type="text"
          value={block.settings.artist || ''}
          onChange={e => onUpdate({ artist: e.target.value })}
          placeholder="Enter artist name (optional)"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Cover Image (Album Art)</Label>
        {block.settings.coverImageUrl && (
          <div style={{ marginBottom: '8px' }}>
            <img 
              src={block.settings.coverImageUrl} 
              alt="Cover" 
              style={{ width: '100%', maxHeight: '150px', objectFit: 'cover', borderRadius: '4px' }} 
            />
          </div>
        )}
        <button
          onClick={() => coverInputRef.current?.click()}
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
          {block.settings.coverImageUrl ? 'Change Cover' : 'Upload Cover'}
        </button>
        <input
          ref={coverInputRef}
          type="file"
          accept="image/*"
          onChange={handleCoverUpload}
          style={{ display: 'none' }}
        />
        <HelpText>Album art or thumbnail image</HelpText>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Player Type</Label>
        <Select
          value={block.settings.playerType || 'static'}
          onChange={e => onUpdate({ playerType: e.target.value })}
        >
          <option value="static">Static (Inline)</option>
          <option value="sticky">Sticky (Fixed Bottom)</option>
        </Select>
        <HelpText>Static: Inline player • Sticky: Fixed at bottom of screen</HelpText>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Playback Options</Label>
        
        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="controls-audio"
            checked={block.settings.controls !== false}
            onChange={e => onUpdate({ controls: e.target.checked })}
          />
          <CheckboxLabel htmlFor="controls-audio">Show player controls</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="autoplay-audio"
            checked={block.settings.autoplay || false}
            onChange={e => onUpdate({ autoplay: e.target.checked })}
          />
          <CheckboxLabel htmlFor="autoplay-audio">Autoplay audio</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="loop-audio"
            checked={block.settings.loop || false}
            onChange={e => onUpdate({ loop: e.target.checked })}
          />
          <CheckboxLabel htmlFor="loop-audio">Loop audio</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="download-audio"
            checked={block.settings.showDownload !== false}
            onChange={e => onUpdate({ showDownload: e.target.checked })}
          />
          <CheckboxLabel htmlFor="download-audio">Show download button</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <SettingGroup>
        <Label>Default Volume</Label>
        <Input
          type="range"
          min="0"
          max="1"
          step="0.1"
          value={block.settings.volume || 0.8}
          onChange={e => onUpdate({ volume: parseFloat(e.target.value) })}
        />
        <HelpText>Volume: {Math.round((block.settings.volume || 0.8) * 100)}%</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Preload</Label>
        <Select
          value={block.settings.preload || 'metadata'}
          onChange={e => onUpdate({ preload: e.target.value })}
        >
          <option value="none">None</option>
          <option value="metadata">Metadata Only</option>
          <option value="auto">Auto (Full Audio)</option>
        </Select>
        <HelpText>How much audio to load before playing</HelpText>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Background Color</Label>
        <Input
          type="color"
          value={block.settings.backgroundColor || '#ffffff'}
          onChange={e => onUpdate({ backgroundColor: e.target.value })}
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Accent Color</Label>
        <Input
          type="color"
          value={block.settings.accentColor || '#6366f1'}
          onChange={e => onUpdate({ accentColor: e.target.value })}
        />
        <HelpText>Color for play button and progress bar</HelpText>
      </SettingGroup>
    </>
  );
};

export default AudioPlayerSettings;
