import React from 'react';
import type { ButtonBlock } from '../../../types/contentBlocks';
import {
  SettingGroup,
  Label,
  Input,
  Select,
  ColorInput,
  CheckboxWrapper,
  Checkbox,
  CheckboxLabel,
  Divider,
} from '../shared/StyledComponents';

interface ButtonSettingsProps {
  block: ButtonBlock;
  onUpdate: (settings: any) => void;
}

export const ButtonSettings: React.FC<ButtonSettingsProps> = ({ block, onUpdate }) => {
  return (
    <>
      <SettingGroup>
        <Label>Button Text</Label>
        <Input
          type="text"
          value={block.settings?.buttonText || ''}
          onChange={(e) => onUpdate({ buttonText: e.target.value })}
          placeholder="Click Here"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Button URL</Label>
        <Input
          type="url"
          value={block.settings?.buttonUrl || ''}
          onChange={(e) => onUpdate({ buttonUrl: e.target.value })}
          placeholder="https://example.com"
        />
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="openInNewTab"
            checked={block.settings?.openInNewTab || false}
            onChange={(e) => onUpdate({ openInNewTab: e.target.checked })}
          />
          <CheckboxLabel htmlFor="openInNewTab">Open in new tab</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Button Style</Label>
        <Select
          value={block.settings?.buttonStyle || 'primary'}
          onChange={(e) => onUpdate({ buttonStyle: e.target.value })}
        >
          <option value="primary">Primary</option>
          <option value="secondary">Secondary</option>
          <option value="outline">Outline</option>
          <option value="ghost">Ghost</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Button Size</Label>
        <Select
          value={block.settings?.buttonSize || 'medium'}
          onChange={(e) => onUpdate({ buttonSize: e.target.value })}
        >
          <option value="small">Small</option>
          <option value="medium">Medium</option>
          <option value="large">Large</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Alignment</Label>
        <Select
          value={block.settings?.alignment || 'left'}
          onChange={(e) => onUpdate({ alignment: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Select>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Icon</Label>
        <Select
          value={block.settings?.icon || 'none'}
          onChange={(e) => onUpdate({ icon: e.target.value })}
        >
          <option value="none">None</option>
          <option value="arrow-right">Arrow Right</option>
          <option value="external">External Link</option>
          <option value="download">Download</option>
          <option value="check">Checkmark</option>
        </Select>
      </SettingGroup>

      {block.settings?.icon && block.settings.icon !== 'none' && (
        <SettingGroup>
          <Label>Icon Position</Label>
          <Select
            value={block.settings?.iconPosition || 'right'}
            onChange={(e) => onUpdate({ iconPosition: e.target.value })}
          >
            <option value="left">Left</option>
            <option value="right">Right</option>
          </Select>
        </SettingGroup>
      )}

      <Divider />

      <SettingGroup>
        <Label>Background Color</Label>
        <ColorInput
          type="color"
          value={block.settings?.backgroundColor || '#3b82f6'}
          onChange={(e) => onUpdate({ backgroundColor: e.target.value })}
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Text Color</Label>
        <ColorInput
          type="color"
          value={block.settings?.textColor || '#ffffff'}
          onChange={(e) => onUpdate({ textColor: e.target.value })}
        />
      </SettingGroup>
    </>
  );
};

export default ButtonSettings;
