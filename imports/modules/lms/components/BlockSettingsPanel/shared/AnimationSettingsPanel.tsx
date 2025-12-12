import React from 'react';
import { Sparkles } from 'lucide-react';
import type { ContentBlock, AnimationType, AnimationSettings, AnimationTrigger } from '../../../types/contentBlocks';
import {
  SettingGroup,
  Label,
  Select,
  CheckboxWrapper,
  Checkbox,
  CheckboxLabel,
  HelpText,
  RangeWrapper,
  RangeInput,
  RangeValue,
  RadioGroup,
  RadioOption,
  RadioInput,
  SectionHeader,
  SectionTitle,
} from './StyledComponents';

interface AnimationSettingsPanelProps {
  block: ContentBlock;
  onUpdate: (settings: any) => void;
}

export const AnimationSettingsPanel: React.FC<AnimationSettingsPanelProps> = ({ block, onUpdate }) => {
  const animation = block.animation || {
    enabled: false,
    type: 'fade-in' as AnimationType,
    duration: 0.5,
    delay: 0,
    trigger: 'on-scroll' as AnimationTrigger,
    easing: 'ease',
  };

  const handleAnimationUpdate = (updates: Partial<AnimationSettings>) => {
    // We need to update the animation property on the block, not in settings
    // This requires a special update mechanism
    const newAnimation = { ...animation, ...updates };
    onUpdate({ _animation: newAnimation });
  };

  const animationTypes: { value: AnimationType; label: string }[] = [
    { value: 'none', label: 'None' },
    { value: 'fade-in', label: 'Fade In' },
    { value: 'fade-in-up', label: 'Fade In Up' },
    { value: 'fade-in-down', label: 'Fade In Down' },
    { value: 'fade-in-left', label: 'Fade In Left' },
    { value: 'fade-in-right', label: 'Fade In Right' },
    { value: 'zoom-in', label: 'Zoom In' },
    { value: 'zoom-out', label: 'Zoom Out' },
    { value: 'slide-up', label: 'Slide Up' },
    { value: 'slide-down', label: 'Slide Down' },
    { value: 'slide-left', label: 'Slide Left' },
    { value: 'slide-right', label: 'Slide Right' },
    { value: 'bounce', label: 'Bounce' },
    { value: 'flip', label: 'Flip' },
    { value: 'rotate', label: 'Rotate' },
  ];

  return (
    <>
      <SectionHeader>
        <Sparkles size={16} color="#8b5cf6" />
        <SectionTitle>Animation</SectionTitle>
      </SectionHeader>
      <HelpText style={{ marginTop: '-8px', marginBottom: '16px' }}>
        Add entrance animations to this block when viewers scroll or load the page.
      </HelpText>

      <SettingGroup>
        <CheckboxWrapper>
          <Checkbox
            type="checkbox"
            id="enableAnimation"
            checked={animation.enabled}
            onChange={(e) => handleAnimationUpdate({ enabled: e.target.checked })}
          />
          <CheckboxLabel htmlFor="enableAnimation">Enable Animation</CheckboxLabel>
        </CheckboxWrapper>
      </SettingGroup>

      {animation.enabled && (
        <>
          <SettingGroup>
            <Label>Animation Type</Label>
            <Select
              value={animation.type}
              onChange={(e) => handleAnimationUpdate({ type: e.target.value as AnimationType })}
            >
              {animationTypes.map(type => (
                <option key={type.value} value={type.value}>{type.label}</option>
              ))}
            </Select>
          </SettingGroup>

          <SettingGroup>
            <Label>Duration ({animation.duration}s)</Label>
            <RangeWrapper>
              <RangeInput
                type="range"
                min="0.1"
                max="2"
                step="0.1"
                value={animation.duration}
                onChange={(e) => handleAnimationUpdate({ duration: parseFloat(e.target.value) })}
              />
              <RangeValue>{animation.duration}s</RangeValue>
            </RangeWrapper>
          </SettingGroup>

          <SettingGroup>
            <Label>Delay ({animation.delay}s)</Label>
            <RangeWrapper>
              <RangeInput
                type="range"
                min="0"
                max="2"
                step="0.1"
                value={animation.delay}
                onChange={(e) => handleAnimationUpdate({ delay: parseFloat(e.target.value) })}
              />
              <RangeValue>{animation.delay}s</RangeValue>
            </RangeWrapper>
          </SettingGroup>

          <SettingGroup>
            <Label>Trigger</Label>
            <RadioGroup>
              <RadioOption>
                <RadioInput
                  type="radio"
                  name="animationTrigger"
                  value="on-load"
                  checked={animation.trigger === 'on-load'}
                  onChange={() => handleAnimationUpdate({ trigger: 'on-load' })}
                />
                On Page Load
              </RadioOption>
              <RadioOption>
                <RadioInput
                  type="radio"
                  name="animationTrigger"
                  value="on-scroll"
                  checked={animation.trigger === 'on-scroll'}
                  onChange={() => handleAnimationUpdate({ trigger: 'on-scroll' })}
                />
                On Scroll (Into View)
              </RadioOption>
              <RadioOption>
                <RadioInput
                  type="radio"
                  name="animationTrigger"
                  value="on-hover"
                  checked={animation.trigger === 'on-hover'}
                  onChange={() => handleAnimationUpdate({ trigger: 'on-hover' })}
                />
                On Hover
              </RadioOption>
            </RadioGroup>
          </SettingGroup>

          {/* Easing option hidden per user request */}
        </>
      )}
    </>
  );
};

export default AnimationSettingsPanel;
