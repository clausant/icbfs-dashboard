import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useCubeClientes } from '../../../hooks/useCubeClientes';
import './ClienteFilter.css';

const ClienteFilter = ({ onClienteChange, value }) => {
  const [inputText, setInputText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const { clientes, loading } = useCubeClientes();

  // Debug: Ver cuántos clientes se cargaron
  useEffect(() => {
    console.log('🎯 useCubeClientes result:', {
      clientesLength: clientes.length,
      loading,
      primeros5: clientes.slice(0, 5),
      tipoCliente: clientes[0] ? typeof clientes[0] : 'undefined',
      estructuraCliente: clientes[0]
    });
  }, [clientes, loading]);

  // Filtrar clientes según el texto de búsqueda
  const filteredClientes = useMemo(() => {
    if (!inputText || inputText.length < 2) return [];
    const searchLower = inputText.toLowerCase().trim();

    const filtered = clientes.filter(cliente => {
      if (!cliente || !cliente.nombre) return false;

      const nombreLower = cliente.nombre.toLowerCase();
      const idLower = String(cliente.id).toLowerCase();

      // Buscar coincidencia en nombre o ID
      const matchNombre = nombreLower.includes(searchLower);
      const matchId = idLower.includes(searchLower);

      return matchNombre || matchId;
    }).slice(0, 50);

    console.log('🔍 ClienteFilter debug:', {
      inputText: searchLower,
      clientesLength: clientes.length,
      clientesLoaded: clientes.length > 0,
      filteredLength: filtered.length,
      sample: filtered.slice(0, 5),
      firstCliente: clientes[0]
    });

    return filtered;
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
    console.log('📝 Input changed:', text, 'length:', text.length);
    setInputText(text);
    setIsOpen(text.length >= 2); // Abrir dropdown si hay al menos 2 caracteres
    console.log('🔓 isOpen set to:', text.length >= 2);
  };

  const handleSelect = (cliente) => {
    setInputText(cliente.nombre);
    onClienteChange(cliente.nombre);
    setIsOpen(false);
  };

  const handleClear = () => {
    setInputText('');
    onClienteChange('');
    setIsOpen(false);
  };

  const displayValue = value || inputText;

  console.log('🎨 Rendering ClienteFilter:', {
    isOpen,
    displayValue,
    filteredClientesLength: filteredClientes.length,
    shouldShowDropdown: isOpen && filteredClientes.length > 0
  });

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
                <div className="cliente-filter-option-id">{cliente.id}</div>
                <div className="cliente-filter-option-nombre">{cliente.nombre}</div>
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
