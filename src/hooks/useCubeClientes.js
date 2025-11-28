import { useMemo } from 'react';
import { useCubeData } from './useCubeData';

export const useCubeClientes = () => {
  const query = useMemo(() => ({
    dimensions: ["detalle_factura.nombre_cliente"],
    measures: [],
    order: {
      "detalle_factura.nombre_cliente": "asc"
    },
    limit: 5000 // Limitar a 5000 clientes únicos
  }), []);

  const { data, loading } = useCubeData(query, true);

  const clientes = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data
      .map(row => row["detalle_factura.nombre_cliente"])
      .filter(cliente => cliente && cliente.trim() !== '')
      .sort();
  }, [data]);

  return { clientes, loading };
};
