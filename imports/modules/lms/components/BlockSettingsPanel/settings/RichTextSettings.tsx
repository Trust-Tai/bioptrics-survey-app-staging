import React from 'react';
import type { RichTextBlock } from '../../../types/contentBlocks';
import {
  SettingGroup,
  Label,
  Input,
  Select,
  ColorInput,
  HelpText,
} from '../shared/StyledComponents';

interface RichTextSettingsProps {
  block: RichTextBlock;
  onUpdate: (settings: any) => void;
}

export const RichTextSettings: React.FC<RichTextSettingsProps> = ({ block, onUpdate }) => {
  return (
    <>
      <SettingGroup>
        <Label>Font Size</Label>
        <Input
          type="text"
          value={block.settings.fontSize || '16px'}
          onChange={e => onUpdate({ fontSize: e.target.value })}
          placeholder="16px"
        />
        <HelpText>Enter size with unit (e.g., 16px, 1rem)</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Text Alignment</Label>
        <Select
          value={block.settings.textAlign || 'left'}
          onChange={e => onUpdate({ textAlign: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
          <option value="justify">Justify</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Text Color</Label>
        <ColorInput
          type="color"
          value={block.settings.textColor || '#374151'}
          onChange={e => onUpdate({ textColor: e.target.value })}
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Background Color</Label>
        <ColorInput
          type="color"
          value={block.settings.backgroundColor || '#ffffff'}
          onChange={e => onUpdate({ backgroundColor: e.target.value })}
        />
        <HelpText>Use #ffffff for transparent</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Padding</Label>
        <Input
          type="text"
          value={block.settings.padding || '16px'}
          onChange={e => onUpdate({ padding: e.target.value })}
          placeholder="16px"
        />
      </SettingGroup>
    </>
  );
};

export default RichTextSettings;
