import React from 'react';
import './MetricSelector.css';

const MetricSelector = ({ selectedMetric, setSelectedMetric }) => {
  const metrics = [
    { id: 'detalle_factura.valor_neto_sum', name: 'Venta ($)' },
    { id: 'detalle_factura.peso_neto_sum', name: 'Kilos' },
    { id: 'detalle_factura.sku_count', name: 'SKUs' },
    { id: 'detalle_factura.margen_porcentaje', name: 'Margen %' },
    { id: 'detalle_factura.margen_valor', name: 'Margen ($)' },
  ];

  return (
    <select
      value={selectedMetric}
      onChange={(e) => setSelectedMetric(e.target.value)}
      className="metric-selector"
    >
      {metrics.map(metric => (
        <option key={metric.id} value={metric.id}>
          {metric.name}
        </option>
      ))}
    </select>
  );
};

export default MetricSelector;
