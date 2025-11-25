import React from 'react';
import './DateRangeFilter.css';

const DateRangeFilter = ({ selectedRange, onRangeChange }) => {
  const options = [
    { value: 'today', label: 'Hasta hoy' },
    { value: 'yesterday', label: 'Hasta ayer' }
  ];

  return (
    <select
      value={selectedRange}
      onChange={(e) => onRangeChange(e.target.value)}
      className="date-range-filter"
    >
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default DateRangeFilter;
