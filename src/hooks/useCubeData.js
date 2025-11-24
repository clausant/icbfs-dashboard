import { useState, useEffect, useMemo } from 'react';
import cubeApi from '../api/cube';

export const useCubeData = (query, isQueryReady = true) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const queryKey = useMemo(() => JSON.stringify(query), [query]);

  useEffect(() => {
    if (!isQueryReady) {
      setData([]);
      setLoading(false);
      return;
    }

    // ✅ Limpiar datos inmediatamente al cambiar la query
    // Esto evita mostrar datos viejos con columnas nuevas
    setData([]);
    setLoading(true);

    console.log('🔵 Ejecutando query en Cube.js:', query);

    cubeApi
      .load(query)
      .then((resultSet) => {
        const tableData = resultSet.tablePivot();
        console.log('🟢 Respuesta de Cube.js:', {
          rowCount: tableData.length,
          firstRow: tableData[0],
          query: query
        });
        setData(tableData);
        setLoading(false);
      })
      .catch((error) => {
        console.error('🔴 Error en Cube.js:', error);
        setError(error);
        setLoading(false);
      });
  }, [queryKey, isQueryReady]);

  return { data, loading, error };
};

// Caché para los meses para evitar múltiples llamadas
let monthsCache = null;
let monthsCachePromise = null;

export const useCubeMonths = () => {
  const [months, setMonths] = useState(monthsCache || []);
  const [loading, setLoading] = useState(!monthsCache);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Si ya tenemos los meses en caché, no hacer nada
    if (monthsCache) {
      setMonths(monthsCache);
      setLoading(false);
      return;
    }

    // Si ya hay una petición en curso, esperarla
    if (monthsCachePromise) {
      monthsCachePromise
        .then(monthData => {
          setMonths(monthData);
          setLoading(false);
        })
        .catch(error => {
          setError(error);
          setLoading(false);
        });
      return;
    }

    // Iniciar nueva petición
    setLoading(true);
    monthsCachePromise = cubeApi.load({
      "dimensions": [
        "detalle_factura.fecha_year_month"
      ],
      "order": {
        "detalle_factura.fecha_year_month": "desc"
      }
    }).then(resultSet => {
      const monthData = resultSet.tablePivot().map(row => row['detalle_factura.fecha_year_month']);
      monthsCache = monthData; // Guardar en caché
      monthsCachePromise = null;
      return monthData;
    });

    monthsCachePromise
      .then(monthData => {
        setMonths(monthData);
        setLoading(false);
      })
      .catch(error => {
        setError(error);
        setLoading(false);
        monthsCachePromise = null;
      });
  }, []);

  return { months, loading, error };
};
