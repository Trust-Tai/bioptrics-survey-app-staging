import React from 'react';
import './ToggleSwitch.css';

interface ToggleSwitchProps {
  checked: boolean | undefined;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
}

const ToggleSwitch: React.FC<ToggleSwitchProps> = ({ 
  checked, 
  onChange, 
  label,
  disabled = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.checked);
  };

  // Default to true if checked is undefined
  const isChecked = checked === undefined ? true : checked;

  return (
    <div className="toggle-switch-container">
      <label className="toggle-switch">
        <input
          type="checkbox"
          checked={isChecked}
          onChange={handleChange}
          disabled={disabled}
        />
        <span className="slider round"></span>
      </label>
      {label && <span className="toggle-label">{label}</span>}
    </div>
  );
};

export default ToggleSwitch;
