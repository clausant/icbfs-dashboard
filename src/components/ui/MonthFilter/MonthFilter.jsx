import React, { useEffect } from 'react';
import { useCubeMonths } from '../../../hooks/useCubeData';
import MultiSelectMonthDropdown from '../MultiSelectMonthDropdown/MultiSelectMonthDropdown';
import './MonthFilter.css';

const MonthFilter = ({ selectedMonth, setSelectedMonth }) => {
  const { months, loading, error } = useCubeMonths();

  // Actualizar al mes más reciente cuando los meses se carguen
  // Solo si el mes seleccionado no está en la lista de meses disponibles
  useEffect(() => {
    if (months.length > 0 && selectedMonth.length > 0) {
      const currentMonth = selectedMonth[0];
      // Si el mes por defecto no existe en la lista, usar el primero disponible
      if (!months.includes(currentMonth)) {
        setSelectedMonth([months[0]]);
      }
    }
  }, [months, selectedMonth, setSelectedMonth]);

  if (error) return (
    <div className="month-filter-error">
      <span>⚠️</span>
      <span>Error al cargar meses</span>
    </div>
  );

  // Mostrar el componente incluso mientras carga (con el mes por defecto)
  return (
    <div className="month-filter-container">
      <MultiSelectMonthDropdown
        options={loading ? selectedMonth : months}
        selectedValues={selectedMonth}
        onChange={setSelectedMonth}
        disabled={loading}
      />
      {loading && <span className="month-filter-loading-icon">⏳</span>}
    </div>
  );
};

export default MonthFilter;