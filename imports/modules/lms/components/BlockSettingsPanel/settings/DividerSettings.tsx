import React from 'react';
import type { DividerBlock } from '../../../types/contentBlocks';
import {
  SettingGroup,
  Label,
  Input,
  Select,
  ColorInput,
} from '../shared/StyledComponents';

interface DividerSettingsProps {
  block: DividerBlock;
  onUpdate: (settings: any) => void;
}

export const DividerSettings: React.FC<DividerSettingsProps> = ({ block, onUpdate }) => {
  return (
    <>
      <SettingGroup>
        <Label>Divider Style</Label>
        <Select
          value={block.settings?.style || 'solid'}
          onChange={(e) => onUpdate({ style: e.target.value })}
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="double">Double</option>
          <option value="gradient">Gradient</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Width</Label>
        <Select
          value={block.settings?.width || '100%'}
          onChange={(e) => onUpdate({ width: e.target.value })}
        >
          <option value="25%">25%</option>
          <option value="50%">50%</option>
          <option value="75%">75%</option>
          <option value="100%">100%</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Thickness</Label>
        <Input
          type="number"
          min="1"
          max="10"
          value={block.settings?.thickness || 1}
          onChange={(e) => onUpdate({ thickness: parseInt(e.target.value) })}
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Color</Label>
        <ColorInput
          type="color"
          value={block.settings?.color || '#e5e7eb'}
          onChange={(e) => onUpdate({ color: e.target.value })}
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Alignment</Label>
        <Select
          value={block.settings?.alignment || 'center'}
          onChange={(e) => onUpdate({ alignment: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Spacing (Top & Bottom)</Label>
        <Select
          value={block.settings?.spacing || 'medium'}
          onChange={(e) => onUpdate({ spacing: e.target.value })}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </Select>
      </SettingGroup>
    </>
  );
};

export default DividerSettings;
