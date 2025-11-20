import React, { useState } from 'react';
import './RappelToggle.css';

const RappelToggle = ({ onToggle }) => {
  const [isActive, setIsActive] = useState(false);

  const handleToggle = () => {
    const newIsActive = !isActive;
    setIsActive(newIsActive);
    onToggle(newIsActive);
  };

  return (
    <div className="rappel-toggle-container" onClick={handleToggle}>
      <span className="rappel-toggle-label">Restar Rappel:</span>
      <div className="rappel-toggle-wrapper">
        <input
          type="checkbox"
          checked={isActive}
          onChange={() => { }} // The div handles the click
          className="rappel-toggle-input"
        />
        <span className="rappel-toggle-slider"></span>
      </div>
      <span className={`rappel-toggle-status ${isActive ? 'active' : 'inactive'}`}>
        {isActive ? 'SI' : 'NO'}
      </span>
    </div>
  );
};

export default RappelToggle;
