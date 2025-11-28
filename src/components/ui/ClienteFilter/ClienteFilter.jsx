import React, { useState, useEffect, useRef } from 'react';
import { useCubeData } from '../../../hooks/useCubeData';
import './ClienteFilter.css';

const ClienteFilter = ({ onClienteChange, value }) => {
  const [inputText, setInputText] = useState('');
  const [searchText, setSearchText] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Query solo cuando searchText tiene valor
  const query = searchText && searchText.length >= 2 ? {
    dimensions: ["detalle_factura.id_cliente", "detalle_factura.nombre_cliente"],
    measures: [],
    filters: [{
      member: "detalle_factura.nombre_cliente",
      operator: "contains",
      values: [searchText]
    }],
    order: {
      "detalle_factura.nombre_cliente": "asc"
    },
    limit: 50
  } : null;

  const { data, loading } = useCubeData(query || {}, !!query);

  const clientes = data && data.length > 0
    ? data.map(row => ({
        id: row["detalle_factura.id_cliente"],
        nombre: row["detalle_factura.nombre_cliente"]
      }))
    : [];

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

  // Mostrar dropdown cuando llegan resultados
  useEffect(() => {
    if (clientes.length > 0 && !loading) {
      setIsOpen(true);
    }
  }, [clientes, loading]);

  const handleChange = (event) => {
    setInputText(event.target.value);
  };

  const handleSearch = () => {
    if (inputText && inputText.length >= 2) {
      setSearchText(inputText);
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      handleSearch();
    }
  };

  const handleSelect = (cliente) => {
    setInputText(cliente.nombre);
    onClienteChange(cliente.nombre);
    setIsOpen(false);
    setSearchText(''); // Limpiar búsqueda
  };

  const handleClear = () => {
    setInputText('');
    onClienteChange('');
    setIsOpen(false);
    setSearchText('');
  };

  const displayValue = value || inputText;

  return (
    <div className="cliente-filter-container" ref={dropdownRef}>
      <div className="cliente-filter-wrapper">
        <input
          type="text"
          value={displayValue}
          onChange={handleChange}
          onKeyPress={handleKeyPress}
          placeholder="Buscar cliente..."
          className="cliente-filter-input"
          title={displayValue ? `Filtrando por: ${displayValue}` : 'Escribe al menos 2 caracteres y presiona Buscar'}
        />
        <button
          onClick={handleSearch}
          className="cliente-filter-search-btn"
          disabled={!inputText || inputText.length < 2}
          title="Buscar clientes"
        >
          🔍
        </button>
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

      {isOpen && clientes.length > 0 && (
        <div className="cliente-filter-dropdown">
          <div className="cliente-filter-dropdown-header">
            {clientes.length} cliente{clientes.length !== 1 ? 's' : ''} encontrado{clientes.length !== 1 ? 's' : ''}
          </div>
          <div className="cliente-filter-options">
            {clientes.map((cliente, index) => (
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

      {loading && (
        <div className="cliente-filter-hint" style={{color: '#64748b'}}>
          Buscando clientes...
        </div>
      )}

      {!loading && searchText && clientes.length === 0 && (
        <div className="cliente-filter-hint" style={{color: '#dc2626'}}>
          No se encontraron clientes con "{searchText}"
        </div>
      )}
    </div>
  );
};

export default ClienteFilter;
