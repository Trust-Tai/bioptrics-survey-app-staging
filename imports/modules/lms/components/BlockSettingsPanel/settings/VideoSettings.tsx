import React from 'react';
import type { VideoBlock } from '../../../types/contentBlocks';
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

interface VideoSettingsProps {
  block: VideoBlock;
  onUpdate: (settings: any) => void;
}

export const VideoSettings: React.FC<VideoSettingsProps> = ({ block, onUpdate }) => {
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
        <Label>Aspect Ratio</Label>
        <Select
          value={block.settings.aspectRatio || '16:9'}
          onChange={e => onUpdate({ aspectRatio: e.target.value })}
        >
          <option value="16:9">16:9 (Widescreen)</option>
          <option value="4:3">4:3 (Standard)</option>
          <option value="1:1">1:1 (Square)</option>
        </Select>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Playback Options</Label>
        
        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="showControls"
            checked={block.settings.showControls !== false}
            onChange={e => onUpdate({ showControls: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showControls">Show player controls</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="autoplay"
            checked={block.settings.autoplay || false}
            onChange={e => onUpdate({ autoplay: e.target.checked })}
          />
          <CheckboxLabel htmlFor="autoplay">Autoplay video</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper style={{ marginBottom: '8px' }}>
          <Checkbox
            type="checkbox"
            id="muted"
            checked={block.settings.muted || false}
            onChange={e => onUpdate({ muted: e.target.checked })}
          />
          <CheckboxLabel htmlFor="muted">Muted by default</CheckboxLabel>
        </CheckboxWrapper>

        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="loop"
            checked={block.settings.loop || false}
            onChange={e => onUpdate({ loop: e.target.checked })}
          />
          <CheckboxLabel htmlFor="loop">Loop video</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <SettingGroup>
        <Label>Start Time (seconds)</Label>
        <Input
          type="number"
          min="0"
          value={block.settings.startTime || 0}
          onChange={e => onUpdate({ startTime: parseInt(e.target.value) || 0 })}
          placeholder="0"
        />
        <HelpText>Start video at specific timestamp</HelpText>
      </SettingGroup>
    </>
  );
};

export default VideoSettings;
