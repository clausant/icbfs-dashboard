import { useMemo } from 'react';
import { useCubeData } from './useCubeData';

export const useCubeClientes = () => {
  const query = useMemo(() => ({
    dimensions: ["detalle_factura.id_cliente", "detalle_factura.nombre_cliente"],
    measures: [],
    order: {
      "detalle_factura.nombre_cliente": "asc"
    },
    limit: 5000 // Limitar a 5000 clientes �nicos
  }), []);

  const { data, loading } = useCubeData(query, true);

  const clientes = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data
      .map(row => ({
        id: row["detalle_factura.id_cliente"],
        nombre: row["detalle_factura.nombre_cliente"]
      }))
      .filter(cliente => cliente.nombre && cliente.nombre.trim() !== '')
      .sort((a, b) => a.nombre.localeCompare(b.nombre));
  }, [data]);

  return { clientes, loading };
};
