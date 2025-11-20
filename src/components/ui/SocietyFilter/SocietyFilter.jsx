import React from 'react';
import './SocietyFilter.css';

const SocietyFilter = ({ selectedSociety, onSocietyChange }) => {
  const societies = ['AFOODS SPA', 'FOOD SERVICE'];

  const handleChange = (event) => {
    onSocietyChange(event.target.value);
  };

  return (
    <div className="society-filter-container">
      <label htmlFor="society-select" className="society-filter-label">Sociedad:</label>
      <select id="society-select" value={selectedSociety} onChange={handleChange} className="society-filter-select">
        <option value="all">Seleccionar todo</option>
        {societies.map((society) => (
          <option key={society} value={society}>
            {society}
          </option>
        ))}
      </select>
    </div>
  );
};

export default SocietyFilter;
