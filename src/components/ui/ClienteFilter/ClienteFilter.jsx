import React, { useState } from 'react';
import './ClienteFilter.css';

const ClienteFilter = ({ onClienteChange }) => {
  const [clienteText, setClienteText] = useState('');

  const handleChange = (event) => {
    const value = event.target.value;
    setClienteText(value);
    onClienteChange(value);
  };

  const handleClear = () => {
    setClienteText('');
    onClienteChange('');
  };

  return (
    <div className="cliente-filter-container">
      <input
        type="text"
        value={clienteText}
        onChange={handleChange}
        placeholder="Buscar cliente..."
        className="cliente-filter-input"
      />
      {clienteText && (
        <button onClick={handleClear} className="cliente-filter-clear">
          ✕
        </button>
      )}
    </div>
  );
};

export default ClienteFilter;
