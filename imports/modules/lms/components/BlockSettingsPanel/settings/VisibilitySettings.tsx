import React from 'react';
import styled from 'styled-components';
import { Monitor, Tablet, Smartphone } from 'lucide-react';
import type { VisibilitySettings as VisibilitySettingsType } from '../../../types/contentBlocks';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
`;

const Description = styled.p`
  font-size: 12px;
  color: #6b7280;
  margin: 0 0 8px 0;
`;

const DeviceRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px;
  background: #f9fafb;
  border-radius: 8px;
  transition: all 0.2s;
  
  &:hover {
    background: #f3f4f6;
  }
`;

const DeviceInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const DeviceIcon = styled.div<{ $active: boolean }>`
  width: 36px;
  height: 36px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: ${props => props.$active ? '#fff7ed' : '#e5e7eb'};
  color: ${props => props.$active ? '#f97316' : '#9ca3af'};
  transition: all 0.2s;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const DeviceLabel = styled.div`
  display: flex;
  flex-direction: column;
  gap: 2px;
`;

const DeviceName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #374151;
`;

const DeviceSize = styled.span`
  font-size: 11px;
  color: #9ca3af;
`;

const Toggle = styled.button<{ $active: boolean }>`
  position: relative;
  width: 44px;
  height: 24px;
  border-radius: 12px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
  background: ${props => props.$active ? '#f97316' : '#d1d5db'};
  
  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${props => props.$active ? '22px' : '2px'};
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    transition: all 0.2s;
  }
  
  &:hover {
    background: ${props => props.$active ? '#ea580c' : '#c1c5cb'};
  }
`;

interface VisibilitySettingsProps {
  visibility?: VisibilitySettingsType;
  onUpdate: (visibility: VisibilitySettingsType) => void;
}

const defaultVisibility: VisibilitySettingsType = {
  desktop: true,
  tablet: true,
  mobile: true,
};

export const VisibilitySettings: React.FC<VisibilitySettingsProps> = ({
  visibility = defaultVisibility,
  onUpdate,
}) => {
  const currentVisibility = { ...defaultVisibility, ...visibility };

  const handleToggle = (device: keyof VisibilitySettingsType) => {
    onUpdate({
      ...currentVisibility,
      [device]: !currentVisibility[device],
    });
  };

  return (
    <Container>
      <Description>
        Control which devices this block will be visible on.
      </Description>

      <DeviceRow>
        <DeviceInfo>
          <DeviceIcon $active={currentVisibility.desktop}>
            <Monitor />
          </DeviceIcon>
          <DeviceLabel>
            <DeviceName>Desktop</DeviceName>
            <DeviceSize>992px and above</DeviceSize>
          </DeviceLabel>
        </DeviceInfo>
        <Toggle
          $active={currentVisibility.desktop}
          onClick={() => handleToggle('desktop')}
          aria-label="Toggle desktop visibility"
        />
      </DeviceRow>

      <DeviceRow>
        <DeviceInfo>
          <DeviceIcon $active={currentVisibility.tablet}>
            <Tablet />
          </DeviceIcon>
          <DeviceLabel>
            <DeviceName>Tablet</DeviceName>
            <DeviceSize>768px - 991px</DeviceSize>
          </DeviceLabel>
        </DeviceInfo>
        <Toggle
          $active={currentVisibility.tablet}
          onClick={() => handleToggle('tablet')}
          aria-label="Toggle tablet visibility"
        />
      </DeviceRow>

      <DeviceRow>
        <DeviceInfo>
          <DeviceIcon $active={currentVisibility.mobile}>
            <Smartphone />
          </DeviceIcon>
          <DeviceLabel>
            <DeviceName>Mobile</DeviceName>
            <DeviceSize>Below 768px</DeviceSize>
          </DeviceLabel>
        </DeviceInfo>
        <Toggle
          $active={currentVisibility.mobile}
          onClick={() => handleToggle('mobile')}
          aria-label="Toggle mobile visibility"
        />
      </DeviceRow>
    </Container>
  );
};
