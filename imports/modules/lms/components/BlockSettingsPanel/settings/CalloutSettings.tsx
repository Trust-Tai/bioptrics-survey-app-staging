import React from 'react';
import type { CalloutBlock } from '../../../types/contentBlocks';
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

interface CalloutSettingsProps {
  block: CalloutBlock;
  onUpdate: (settings: any) => void;
}

export const CalloutSettings: React.FC<CalloutSettingsProps> = ({ block, onUpdate }) => {
  return (
    <>
      <SettingGroup>
        <Label>Callout Type</Label>
        <Select
          value={block.settings?.calloutType || 'info'}
          onChange={(e) => onUpdate({ calloutType: e.target.value })}
        >
          <option value="info">Info</option>
          <option value="success">Success</option>
          <option value="warning">Warning</option>
          <option value="error">Error</option>
        </Select>
        <HelpText>Choose the callout message type</HelpText>
      </SettingGroup>

      <SettingGroup>
        <Label>Style Variant</Label>
        <Select
          value={block.settings?.variant || 'bordered'}
          onChange={(e) => onUpdate({ variant: e.target.value })}
        >
          <option value="bordered">Bordered (Left accent)</option>
          <option value="filled">Filled (Solid background)</option>
          <option value="outlined">Outlined (Border only)</option>
        </Select>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Title</Label>
        <Input
          type="text"
          value={block.settings?.title || ''}
          onChange={(e) => onUpdate({ title: e.target.value })}
          placeholder="Optional title"
        />
      </SettingGroup>

      <SettingGroup>
        <Label>Content</Label>
        <Textarea
          value={block.settings?.content || ''}
          onChange={(e) => onUpdate({ content: e.target.value })}
          placeholder="Add your message here..."
          rows={6}
        />
        <HelpText>Supports HTML formatting</HelpText>
      </SettingGroup>

      <Divider />

      <SettingGroup>
        <Label>Display Options</Label>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="showIcon"
            checked={block.settings?.showIcon !== false}
            onChange={(e) => onUpdate({ showIcon: e.target.checked })}
          />
          <CheckboxLabel htmlFor="showIcon">Show icon</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>
    </>
  );
};

export default CalloutSettings;
