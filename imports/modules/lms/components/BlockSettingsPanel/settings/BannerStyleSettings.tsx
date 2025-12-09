import React, { useState } from 'react';
import { Palette, Sparkles } from 'lucide-react';
import type { BannerBlock, BannerButton } from '../../../types/contentBlocks';
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
  HelpText,
  ItemTabs,
  ItemTab,
  SectionHeader,
} from '../shared/StyledComponents';

interface BannerStyleSettingsProps {
  block: BannerBlock;
  onUpdate: (settings: any) => void;
}

export const BannerStyleSettings: React.FC<BannerStyleSettingsProps> = ({ block, onUpdate }) => {
  const [selectedButtonIndex, setSelectedButtonIndex] = useState(0);
  const buttons = block.settings?.buttons || [];
  const selectedButton = buttons[selectedButtonIndex];

  const handleUpdateButton = (field: string, value: any) => {
    const updated = buttons.map((btn: BannerButton, i: number) => {
      if (i === selectedButtonIndex) {
        if (field.startsWith('animation.')) {
          const animField = field.replace('animation.', '');
          return { ...btn, animation: { ...btn.animation, [animField]: value } };
        }
        return { ...btn, [field]: value };
      }
      return btn;
    });
    onUpdate({ buttons: updated });
  };

  return (
    <>
      <SectionHeader>
        <Palette size={16} />
        Layout Settings
      </SectionHeader>

      <SettingGroup>
        <Label>Content Alignment</Label>
        <Select
          value={block.settings?.contentAlignment || 'center'}
          onChange={(e) => onUpdate({ contentAlignment: e.target.value })}
        >
          <option value="left">Left</option>
          <option value="center">Center</option>
          <option value="right">Right</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Vertical Alignment</Label>
        <Select
          value={block.settings?.verticalAlignment || 'center'}
          onChange={(e) => onUpdate({ verticalAlignment: e.target.value })}
        >
          <option value="top">Top</option>
          <option value="center">Center</option>
          <option value="bottom">Bottom</option>
        </Select>
      </SettingGroup>

      <SettingGroup>
        <Label>Banner Height (px)</Label>
        <Input
          type="number"
          min="200"
          max="1200"
          value={block.settings?.height || 450}
          onChange={(e) => onUpdate({ height: parseInt(e.target.value) || 450 })}
          placeholder="450"
        />
        <HelpText>Recommended: 300-600px</HelpText>
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="fullHeight"
            checked={block.settings?.fullHeight || false}
            onChange={(e) => onUpdate({ fullHeight: e.target.checked })}
          />
          <CheckboxLabel htmlFor="fullHeight">Full screen height (100vh)</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="parallax"
            checked={block.settings?.parallax || false}
            onChange={(e) => onUpdate({ parallax: e.target.checked })}
          />
          <CheckboxLabel htmlFor="parallax">Enable parallax effect</CheckboxLabel>
        </CheckboxWrapper>
        <HelpText>Background scrolls slower than content</HelpText>
      </SettingGroup>

      <Divider />

      {buttons.length > 0 && (
        <>
          <SectionHeader>
            <Sparkles size={16} />
            Button Style & Animation
          </SectionHeader>

          <SettingGroup>
            <Label>Select Button to Style</Label>
            <ItemTabs>
              {buttons.map((btn: BannerButton, i: number) => (
                <ItemTab key={btn.id} $active={selectedButtonIndex === i} onClick={() => setSelectedButtonIndex(i)}>
                  {btn.text || `Button ${i + 1}`}
                </ItemTab>
              ))}
            </ItemTabs>
          </SettingGroup>

          {selectedButton && (
            <>
              <SettingGroup>
                <Label>Button Style</Label>
                <Select
                  value={selectedButton.style}
                  onChange={(e) => handleUpdateButton('style', e.target.value)}
                >
                  <option value="solid">Solid (Filled)</option>
                  <option value="outline">Outline</option>
                  <option value="ghost">Ghost (No Border)</option>
                </Select>
              </SettingGroup>

              <SettingGroup>
                <Label>Button Size</Label>
                <Select
                  value={selectedButton.size}
                  onChange={(e) => handleUpdateButton('size', e.target.value)}
                >
                  <option value="small">Small</option>
                  <option value="medium">Medium</option>
                  <option value="large">Large</option>
                </Select>
              </SettingGroup>

              <SettingGroup>
                <Label>Background Color</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ColorInput
                    type="color"
                    value={selectedButton.backgroundColor}
                    onChange={(e) => handleUpdateButton('backgroundColor', e.target.value)}
                  />
                  <Input
                    type="text"
                    value={selectedButton.backgroundColor}
                    onChange={(e) => handleUpdateButton('backgroundColor', e.target.value)}
                    placeholder="#6366f1"
                    style={{ flex: 1 }}
                  />
                </div>
              </SettingGroup>

              <SettingGroup>
                <Label>Text Color</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ColorInput
                    type="color"
                    value={selectedButton.textColor}
                    onChange={(e) => handleUpdateButton('textColor', e.target.value)}
                  />
                  <Input
                    type="text"
                    value={selectedButton.textColor}
                    onChange={(e) => handleUpdateButton('textColor', e.target.value)}
                    placeholder="#ffffff"
                    style={{ flex: 1 }}
                  />
                </div>
              </SettingGroup>

              <SettingGroup>
                <Label>Border Radius (px)</Label>
                <Input
                  type="number"
                  min="0"
                  max="50"
                  value={selectedButton.borderRadius}
                  onChange={(e) => handleUpdateButton('borderRadius', parseInt(e.target.value) || 0)}
                  placeholder="8"
                />
              </SettingGroup>

              <Divider />

              <SettingGroup>
                <Label>Hover Effect</Label>
                <Select
                  value={selectedButton.hoverEffect}
                  onChange={(e) => handleUpdateButton('hoverEffect', e.target.value)}
                >
                  <option value="none">None</option>
                  <option value="lift">Lift (Move Up + Shadow)</option>
                  <option value="glow">Glow</option>
                  <option value="scale">Scale (Grow)</option>
                  <option value="darken">Darken</option>
                  <option value="lighten">Lighten</option>
                </Select>
              </SettingGroup>

              <SettingGroup>
                <Label>Hover Background Color (optional)</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ColorInput
                    type="color"
                    value={selectedButton.hoverBackgroundColor || selectedButton.backgroundColor}
                    onChange={(e) => handleUpdateButton('hoverBackgroundColor', e.target.value)}
                  />
                  <Input
                    type="text"
                    value={selectedButton.hoverBackgroundColor || ''}
                    onChange={(e) => handleUpdateButton('hoverBackgroundColor', e.target.value)}
                    placeholder="Leave empty to keep same"
                    style={{ flex: 1 }}
                  />
                </div>
              </SettingGroup>

              <SettingGroup>
                <Label>Hover Text Color (optional)</Label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <ColorInput
                    type="color"
                    value={selectedButton.hoverTextColor || selectedButton.textColor}
                    onChange={(e) => handleUpdateButton('hoverTextColor', e.target.value)}
                  />
                  <Input
                    type="text"
                    value={selectedButton.hoverTextColor || ''}
                    onChange={(e) => handleUpdateButton('hoverTextColor', e.target.value)}
                    placeholder="Leave empty to keep same"
                    style={{ flex: 1 }}
                  />
                </div>
              </SettingGroup>

              <Divider />

              <SettingGroup>
                <CheckboxWrapper>
                  <Checkbox
                    type="checkbox"
                    id="btnAnimEnabled"
                    checked={selectedButton.animation?.enabled || false}
                    onChange={(e) => handleUpdateButton('animation.enabled', e.target.checked)}
                  />
                  <CheckboxLabel htmlFor="btnAnimEnabled">Enable Button Animation</CheckboxLabel>
                </CheckboxWrapper>
              </SettingGroup>

              {selectedButton.animation?.enabled && (
                <>
                  <SettingGroup>
                    <Label>Animation Type</Label>
                    <Select
                      value={selectedButton.animation?.type || 'fade-in'}
                      onChange={(e) => handleUpdateButton('animation.type', e.target.value)}
                    >
                      <option value="none">None</option>
                      <option value="fade-in">Fade In</option>
                      <option value="slide-up">Slide Up</option>
                      <option value="slide-left">Slide from Right</option>
                      <option value="slide-right">Slide from Left</option>
                      <option value="bounce">Bounce</option>
                      <option value="pulse">Pulse</option>
                    </Select>
                  </SettingGroup>

                  <SettingGroup>
                    <Label>Duration (seconds)</Label>
                    <Input
                      type="number"
                      min="0.1"
                      max="3"
                      step="0.1"
                      value={selectedButton.animation?.duration || 0.5}
                      onChange={(e) => handleUpdateButton('animation.duration', parseFloat(e.target.value) || 0.5)}
                      placeholder="0.5"
                    />
                  </SettingGroup>

                  <SettingGroup>
                    <Label>Delay (seconds)</Label>
                    <Input
                      type="number"
                      min="0"
                      max="5"
                      step="0.1"
                      value={selectedButton.animation?.delay || 0}
                      onChange={(e) => handleUpdateButton('animation.delay', parseFloat(e.target.value) || 0)}
                      placeholder="0"
                    />
                    <HelpText>Use delay for stagger effect with multiple buttons</HelpText>
                  </SettingGroup>
                </>
              )}
            </>
          )}

          <Divider />
        </>
      )}
    </>
  );
};

export default BannerStyleSettings;
