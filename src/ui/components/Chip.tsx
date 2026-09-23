import React from 'react';
import { ChipOption } from '../../core/types';

interface ChipProps {
  option: ChipOption;
  selected?: boolean;
  onClick: (option: ChipOption) => void;
}

export const Chip: React.FC<ChipProps> = ({ option, selected = false, onClick }) => {
  return (
    <button
      type="button"
      id={`chip-${option.value}`}
      className={`chip-btn ${selected ? 'selected' : ''}`}
      onClick={() => onClick(option)}
    >
      <span style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
        {option.icon && <span className="chip-icon">{option.icon}</span>}
        <span>{option.label}</span>
      </span>
      {selected && <span style={{ fontSize: '1.1rem' }}>✓</span>}
    </button>
  );
};
