import React, { useState, useEffect } from 'react';
import './EERRToggle.css';

const EERRToggle = ({ onToggle }) => {
  const [isActive, setIsActive] = useState(true); // Default: SÍ excluir EERR

  // Notificar el estado inicial al montar el componente
  useEffect(() => {
    onToggle(true);
  }, []);

  const handleToggle = () => {
    const newState = !isActive;
    setIsActive(newState);
    onToggle(newState);
  };

  return (
    <div className="eerr-toggle-container">
      <button
        className={`eerr-toggle-button ${isActive ? 'active' : 'inactive'}`}
        onClick={handleToggle}
      >
        {isActive ? 'SÍ' : 'NO'}
      </button>
    </div>
  );
};

export default EERRToggle;
