import React from 'react';
import './SocietyPills.css';

const SocietyPills = ({ selectedSociety, onSocietyChange }) => {
  const societies = [
    { value: 'all', label: 'Todas' },
    { value: 'AFOODS SPA', label: 'AFOODS SPA' },
    { value: 'FOOD SERVICE', label: 'FOOD SERVICE' }
  ];

  return (
    <div className="society-list-container">
      {societies.map((society) => (
        <button
          key={society.value}
          className={`society-list-item ${selectedSociety === society.value ? 'active' : ''}`}
          onClick={() => onSocietyChange(society.value)}
        >
          <span className="society-label">{society.label}</span>
          {selectedSociety === society.value && (
            <span className="society-check">✓</span>
          )}
        </button>
      ))}
    </div>
  );
};

export default SocietyPills;
