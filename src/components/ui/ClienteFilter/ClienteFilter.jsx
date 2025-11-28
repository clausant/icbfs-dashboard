import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCubeClientes } from '../../../hooks/useCubeClientes';
import './ClienteFilter.css';

const ClienteFilter = ({ onClienteChange, value }) => {
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { clientes, loading } = useCubeClientes();

  // Filtrar clientes según el texto de búsqueda
  const filteredClientes = useMemo(() => {
    if (!inputText || inputText.length < 2) return [];
    const searchLower = inputText.toLowerCase();
    return clientes
      .filter(cliente => cliente.toLowerCase().includes(searchLower))
      .slice(0, 50); // Mostrar máximo 50 resultados
  }, [inputText, clientes]);

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleChange = (event) => {
    const text = event.target.value;
    setInputText(text);
    setIsOpen(text.length >= 2); // Abrir dropdown si hay al menos 2 caracteres
  };

  const handleSelect = (cliente) => {
    setInputText(cliente);
    onClienteChange(cliente);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputText('');
    onClienteChange('');
    setIsOpen(false);
  };

  const displayValue = value || inputText;

  return (
    <div className="cliente-filter-container" ref={dropdownRef}>
      <div className="cliente-filter-wrapper">
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onFocus={() => displayValue.length >= 2 && setIsOpen(true)}
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

      {isOpen && filteredClientes.length > 0 && (
        <div className="cliente-filter-dropdown">
          <div className="cliente-filter-dropdown-header">
            {filteredClientes.length} cliente{filteredClientes.length !== 1 ? 's' : ''} encontrado{filteredClientes.length !== 1 ? 's' : ''}
          </div>
          <div className="cliente-filter-options">
            {filteredClientes.map((cliente, index) => (
              <div
                key={index}
                className="cliente-filter-option"
                onClick={() => handleSelect(cliente)}
              >
                {cliente}
              </div>
            ))}
          </div>
        </div>
      )}

      {displayValue && (
        <div className="cliente-filter-hint">
          Filtrando por: "{displayValue}"
        </div>
      )}
    </div>
  );
};

export default ClienteFilter;
