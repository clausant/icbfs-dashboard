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
    setLoading(true);
    cubeApi
      .load(query)
      .then((resultSet) => {
        setData(resultSet.tablePivot());
        setLoading(false);
      })
      .catch((error) => {
        setError(error);
        setLoading(false);
      });
  }, [queryKey, isQueryReady]);

  return { data, loading, error };
};

export const useCubeMonths = () => {
  const [months, setMonths] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    cubeApi.load({
      "dimensions": [
        "detalle_factura.fecha_year_month"
      ],
      "order": {
        "detalle_factura.fecha_year_month": "desc"
      }
    }).then(resultSet => {
      const monthData = resultSet.tablePivot().map(row => row['detalle_factura.fecha_year_month']);
      setMonths(monthData);
      setLoading(false);
    }).catch(error => {
      setError(error);
      setLoading(false);
    });
  }, []);

  return { months, loading, error };
};
