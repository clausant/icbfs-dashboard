import React, { useEffect } from 'react';
import { useCubeMonths } from '../../../hooks/useCubeData';
import MultiSelectMonthDropdown from '../MultiSelectMonthDropdown/MultiSelectMonthDropdown';
import './MonthFilter.css';

const MonthFilter = ({ selectedMonth, setSelectedMonth }) => {
  const { months, loading, error } = useCubeMonths();

  useEffect(() => {
    if (months.length > 0 && (!selectedMonth || selectedMonth.length === 0)) {
      setSelectedMonth([months[0]]);
    }
  }, [months, selectedMonth, setSelectedMonth]);

  if (loading) return (
    <div className="month-filter-loading">
      <span>⏳</span>
      <span>Cargando meses...</span>
    </div>
  );

  if (error) return (
    <div className="month-filter-error">
      <span>⚠️</span>
      <span>Error al cargar meses</span>
    </div>
  );

  return (
    <div className="month-filter-container">
      <label className="month-filter-label">Mes:</label>
      <MultiSelectMonthDropdown
        options={months}
        selectedValues={selectedMonth}
        onChange={setSelectedMonth}
      />
    </div>
  );
};

export default MonthFilter;