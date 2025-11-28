import React, { useState } from 'react';
import './ClienteFilter.css';

const ClienteFilter = ({ onClienteChange, value }) => {
  const [inputText, setInputText] = useState('');

  const handleChange = (event) => {
    const text = event.target.value;
    setInputText(text);
    onClienteChange(text);
  };

  const handleClear = () => {
    setInputText('');
    onClienteChange('');
  };

  const displayValue = value || inputText;

  return (
    <div className="cliente-filter-container">
      <div className="cliente-filter-wrapper">
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          placeholder="Filtrar por cliente..."
          className="cliente-filter-input"
          title={displayValue ? `Filtrando por: ${displayValue}` : ''}
        />
        {displayValue && (
          <button
            onClick={handleClear}
            className="cliente-filter-clear"
            title="Limpiar filtro"
          >
            ✕
          </button>
        )}
      </div>
      {displayValue && (
        <div className="cliente-filter-hint">
          Filtrando por: "{displayValue}"
        </div>
      )}
    </div>
  );
};

export default ClienteFilter;
