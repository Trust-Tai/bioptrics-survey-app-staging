import React from 'react';
import type { ImageBlock } from '../../../types/contentBlocks';
import {
  SettingGroup,
  Label,
  Input,
  Textarea,
  Select,
  CheckboxWrapper,
  Checkbox,
  CheckboxLabel,
  Divider,
  HelpText,
} from '../shared/StyledComponents';

interface ImageSettingsProps {
  block: ImageBlock;
  onUpdate: (settings: any) => void;
}

export const ImageSettings: React.FC<ImageSettingsProps> = ({ block, onUpdate }) => {
  return (
    <>
      <SettingGroup>
        <Label>Alt Text</Label>
        <Input
          type="text"
          value={block.settings.altText || ''}
          onChange={e => onUpdate({ altText: e.target.value })}
          placeholder="Describe the image"
        />
        <HelpText>Important for accessibility and SEO</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Caption</Label>
        <Textarea
          value={block.settings.caption || ''}
          onChange={e => onUpdate({ caption: e.target.value })}
          placeholder="Optional image caption"
        />
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showCaption"
            checked={block.settings.showCaption !== false}
            onChange={e => onUpdate({ showCaption: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showCaption">Show caption</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Alignment</Label>
        <Select
          value={block.settings.alignment || 'center'}
          onChange={e => onUpdate({ alignment: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Max Width</Label>
        <Input
          type="text"
          value={block.settings.maxWidth || '100%'}
          onChange={e => onUpdate({ maxWidth: e.target.value })}
          placeholder="100%"
        />
        <HelpText>E.g., 100%, 600px, 50%</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Border Radius</Label>
        <Input
          type="text"
          value={block.settings.borderRadius || '8px'}
          onChange={e => onUpdate({ borderRadius: e.target.value })}
          placeholder="8px"
        />
      </SettingGroup>
    </>
  );
};

export default ImageSettings;
