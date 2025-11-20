import React, { useState, useRef, useEffect } from 'react';
import './MultiSelectMonthDropdown.css';

const MultiSelectMonthDropdown = ({ options, selectedValues, onChange }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
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

  const handleHeaderClick = () => {
    setIsOpen((prev) => !prev);
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const handleCheckboxChange = (e) => {
    const { value, checked } = e.target;
    if (checked) {
      onChange([...selectedValues, value]);
    } else {
      onChange(selectedValues.filter((val) => val !== value));
    }
  };

  const filteredOptions = options.filter((option) =>
    option.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const displayValue = selectedValues.length > 0
    ? selectedValues.join(', ')
    : 'Seleccionar mes(es)';

  return (
    <div className="multi-select-month-dropdown-container" ref={dropdownRef}>
      <div className="multi-select-month-dropdown-header" onClick={handleHeaderClick}>
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
          {filteredOptions.map((option) => (
            <label key={option} className="multi-select-month-dropdown-checkbox-item">
              <input
                type="checkbox"
                value={option}
                checked={selectedValues.includes(option)}
                onChange={handleCheckboxChange}
                className="multi-select-month-dropdown-checkbox-input"
              />
              {option}
            </label>
          ))}
        </div>
      )}
    </div>
  );
};

export default MultiSelectMonthDropdown;
