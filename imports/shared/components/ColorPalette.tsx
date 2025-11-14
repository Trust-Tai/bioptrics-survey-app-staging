import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';
import { useColorTheme } from '../../contexts/ColorThemeContext';
import { FaPalette, FaCheck } from 'react-icons/fa';

const FloatingContainer = styled.div`
  position: fixed;
  top: 20px;
  right: 20px;
  z-index: 9999;
`;

const PaletteButton = styled.button<{ isMultiColor?: boolean }>`
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: 3px solid #fff;
  background: ${props => props.isMultiColor 
    ? 'conic-gradient(#ed6801 0deg 90deg, #325b9b 90deg 180deg, #d29b0a 180deg 270deg, #a6a6a6 270deg 360deg)' 
    : 'var(--color-primary)'};
  color: white;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.3s ease;
  
  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const DropdownContainer = styled.div<{ isOpen: boolean }>`
  position: absolute;
  top: 60px;
  right: 0;
  background: white;
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
  padding: 16px;
  min-width: 200px;
  opacity: ${props => props.isOpen ? 1 : 0};
  visibility: ${props => props.isOpen ? 'visible' : 'hidden'};
  transform: ${props => props.isOpen ? 'translateY(0)' : 'translateY(-10px)'};
  transition: all 0.3s ease;
`;

const DropdownHeader = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: #333;
  margin-bottom: 12px;
  text-align: center;
`;

const ColorGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 8px;
`;

const ColorOption = styled.div<{ color: string; isActive: boolean }>`
  display: flex;
  align-items: center;
  padding: 10px 12px;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  border: 2px solid ${props => props.isActive ? props.color : '#e5e7eb'};
  background: ${props => props.isActive ? '#f0f6ff' : 'transparent'};
  
  &:hover {
    background: #f8f9fa;
    border-color: ${props => props.color};
    transform: translateX(2px);
  }
`;

const ColorSwatch = styled.div<{ color: string }>`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.color};
  margin-right: 12px;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
`;

const MultiColorSwatch = styled.div`
  width: 24px;
  height: 24px;
  border-radius: 50%;
  margin-right: 12px;
  border: 2px solid #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  position: relative;
  background: conic-gradient(
    #ed6801 0deg 90deg,
    #325b9b 90deg 180deg,
    #d29b0a 180deg 270deg,
    #a6a6a6 270deg 360deg
  );
`;

const ColorName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #333;
  flex: 1;
`;

const CheckIcon = styled.div<{ isVisible: boolean }>`
  opacity: ${props => props.isVisible ? 1 : 0};
  transition: opacity 0.2s ease;
  color: var(--color-primary);
  font-size: 14px;
`;

const Overlay = styled.div<{ isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: transparent;
  z-index: 9998;
  display: ${props => props.isOpen ? 'block' : 'none'};
`;

export const ColorPalette: React.FC = () => {
  // ColorPalette component disabled - using CSS variables only
  return null;
};
