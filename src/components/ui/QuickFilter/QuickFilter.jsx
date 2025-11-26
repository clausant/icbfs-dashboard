import React from 'react';
import './QuickFilter.css';

const QuickFilter = ({ onFilterChange }) => {
  const handleChange = (e) => {
    onFilterChange(e.target.value);
  };

  return (
    <div className="quick-filter-container">
      <input
        type="text"
        className="quick-filter-input"
        placeholder="🔍 Buscar en tabla..."
        onChange={handleChange}
      />
    </div>
  );
};

export default QuickFilter;
