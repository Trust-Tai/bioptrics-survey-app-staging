import React, { useState, useRef, useEffect } from 'react';
import styled from 'styled-components';

export interface MenuItem {
  label: string;
  onClick: () => void;
  icon?: React.ReactNode;
  disabled?: boolean;
}

export interface EllipsisMenuProps {
  items?: MenuItem[];
  onDuplicate?: () => void;
  className?: string;
}

const MenuContainer = styled.div`
  position: relative;
  display: inline-block;
`;

const MenuButton = styled.button`
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  cursor: pointer;
  font-size: 22px;
  color: #552a47;
  display: flex;
  align-items: center;
`;

const MenuDropdown = styled.div<{ isOpen: boolean }>`
  position: absolute;
  right: 0;
  top: 100%;
  background: white;
  border-radius: 4px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 10;
  min-width: 150px;
  display: ${props => (props.isOpen ? 'block' : 'none')};
  overflow: hidden;
`;

const MenuItem = styled.button<{ disabled?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: 8px 12px;
  border: none;
  background: none;
  text-align: left;
  cursor: ${props => (props.disabled ? 'not-allowed' : 'pointer')};
  opacity: ${props => (props.disabled ? 0.5 : 1)};
  
  &:hover {
    background-color: ${props => (props.disabled ? 'transparent' : '#f5f5f5')};
  }
`;

const EllipsisMenu: React.FC<EllipsisMenuProps> = ({ items, onDuplicate, className }) => {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Default items if none provided
  const menuItems = items || [
    { label: 'Duplicate', onClick: onDuplicate || (() => {}) }
  ];

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    } else {
      document.removeEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <MenuContainer ref={menuRef} className={className}>
      <MenuButton
        onClick={() => setOpen(o => !o)}
        title="More options"
      >
        ⋮
      </MenuButton>
      <MenuDropdown isOpen={open}>
        {menuItems.map((item, index) => (
          <MenuItem
            key={index}
            onClick={() => {
              if (!item.disabled) {
                item.onClick();
                setOpen(false);
              }
            }}
            disabled={item.disabled}
          >
            {item.icon && <span style={{ marginRight: '8px' }}>{item.icon}</span>}
            {item.label}
          </MenuItem>
        ))}
      </MenuDropdown>
    </MenuContainer>
  );
};

export default EllipsisMenu;
