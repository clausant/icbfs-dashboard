import React, { useState, useRef, useEffect } from 'react';
import './MultiSelectMonthDropdown.css';

const MultiSelectMonthDropdown = ({ options, selectedValues, onChange, disabled = false }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [tempSelectedValues, setTempSelectedValues] = useState(selectedValues);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Sincronizar estado temporal cuando se abre el dropdown
  useEffect(() => {
    if (isOpen) {
      setTempSelectedValues(selectedValues);
    }
  }, [isOpen, selectedValues]);

  const handleHeaderClick = () => {
    if (!disabled) {
      setIsOpen((prev) => !prev);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      setTempSelectedValues([...tempSelectedValues, value]);
    } else {
      setTempSelectedValues(tempSelectedValues.filter((val) => val !== value));
    }
  };

  const handleApply = () => {
    onChange(tempSelectedValues);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleCancel = () => {
    setTempSelectedValues(selectedValues);
    setIsOpen(false);
    setSearchTerm('');
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayValue = selectedValues.length > 0
    ? selectedValues.join(', ')
    : 'Seleccionar mes(es)';

  return (
    <div className="multi-select-month-dropdown-container" ref={dropdownRef}>
      <div
        className={`multi-select-month-dropdown-header ${disabled ? 'disabled' : ''}`}
        onClick={handleHeaderClick}
      >
        <span>{displayValue}</span>
      </div>

      {isOpen && (
        <div className="multi-select-month-dropdown-list">
          <input
            type="text"
            placeholder="Buscar valor"
            className="multi-select-month-dropdown-search-input"
            value={searchTerm}
            onChange={handleSearchChange}
          />
          <div className="multi-select-month-dropdown-options">
            {filteredOptions.map((option) => (
              <label key={option} className="multi-select-month-dropdown-checkbox-item">
                <input
                  type="checkbox"
                  value={option}
                  checked={tempSelectedValues.includes(option)}
                  onChange={handleCheckboxChange}
                  className="multi-select-month-dropdown-checkbox-input"
                />
                {option}
              </label>
            ))}
          </div>
          <div className="multi-select-month-dropdown-actions">
            <button
              className="multi-select-month-dropdown-btn-apply"
              onClick={handleApply}
            >
              Aplicar
            </button>
            <button
              className="multi-select-month-dropdown-btn-cancel"
              onClick={handleCancel}
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MultiSelectMonthDropdown;
