import { useState, useEffect } from 'react';
import cubeApi from '../api/cube';

export const useUpdateTimestamp = () => {
  const [timestamp, setTimestamp] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    setLoading(true);
    cubeApi.load({
      "measures": ["detalle_factura.ultimo_update"],
    }).then(resultSet => {
      const rawData = resultSet.tablePivot();
      if (rawData.length > 0) {
        const timestampValue = rawData[0]['detalle_factura.ultimo_update'];
        const date = new Date(timestampValue + 'Z');

        // Convertir a zona horaria de Santiago
        const options = {
          year: 'numeric',
          month: '2-digit',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          timeZone: 'America/Santiago',
          hour12: false,
        };

        const parts = new Intl.DateTimeFormat('es-ES', options).formatToParts(date);
        const day = parts.find(p => p.type === 'day').value;
        const month = parts.find(p => p.type === 'month').value;
        const year = parts.find(p => p.type === 'year').value;
        const hour = parts.find(p => p.type === 'hour').value;
        const minute = parts.find(p => p.type === 'minute').value;

        // Formato: DD/MM/YYYY-HH:MM
        const formattedDate = `${day}/${month}/${year}-${hour}:${minute}`;
        setTimestamp(formattedDate);
      }
      setLoading(false);
    }).catch(error => {
      setError(error);
      setLoading(false);
    });
  }, []);

  return { timestamp, loading, error };
};
