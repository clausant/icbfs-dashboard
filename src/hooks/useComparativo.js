import { useState, useMemo } from 'react';
import { useCubeData, useCubeMonths } from './useCubeData';
import { levelDefs } from '../pages/dashboard/levelDefs';

export const useComparativo = () => {
  const [selectedView, setSelectedView] = useState('categoria');
  const [selectedMetric, setSelectedMetric] = useState('detalle_factura.valor_neto_sum');
  const [actualMonth, setActualMonth] = useState('');
  const [compareMonth, setCompareMonth] = useState('');
  const [periodType, setPeriodType] = useState('Mes');
  const [isRappelActive, setIsRappelActive] = useState(true);
  const { months, loading: monthsLoading } = useCubeMonths();

  // Inicializar meses si están disponibles
  const availableMonths = useMemo(() => {
    return months.map(m => m);
  }, [months]);

  // Inicializar meses por defecto (último y penúltimo)
  useMemo(() => {
    if (months.length > 0 && !actualMonth) {
      setActualMonth(months[0]); // Último mes
    }
    if (months.length > 1 && !compareMonth) {
      setCompareMonth(months[1]); // Penúltimo mes
    }
  }, [months]);

  // Configuración de la vista actual
  const currentLevelDef = useMemo(() => {
    return levelDefs[selectedView]?.[0] || levelDefs.categoria[0];
  }, [selectedView]);

  // Queries para obtener datos del mes actual y mes a comparar
  const queryActual = useMemo(() => {
    if (!actualMonth) return null;

    const metricToUse = isRappelActive && selectedMetric === 'detalle_factura.valor_neto_sum'
      ? 'detalle_factura.valor_resta_rappel'
      : selectedMetric;

    return {
      dimensions: [currentLevelDef.dimensions[0]],
      measures: [metricToUse],
      filters: [{
        member: "detalle_factura.fecha_year_month",
        operator: "equals",
        values: [actualMonth]
      }],
      order: {
        [currentLevelDef.dimensions[0]]: 'asc',
      }
    };
  }, [actualMonth, currentLevelDef, selectedMetric, isRappelActive]);

  const queryCompare = useMemo(() => {
    if (!compareMonth) return null;

    const metricToUse = isRappelActive && selectedMetric === 'detalle_factura.valor_neto_sum'
      ? 'detalle_factura.valor_resta_rappel'
      : selectedMetric;

    return {
      dimensions: [currentLevelDef.dimensions[0]],
      measures: [metricToUse],
      filters: [{
        member: "detalle_factura.fecha_year_month",
        operator: "equals",
        values: [compareMonth]
      }],
      order: {
        [currentLevelDef.dimensions[0]]: 'asc',
      }
    };
  }, [compareMonth, currentLevelDef, selectedMetric, isRappelActive]);

  const { data: actualData, loading: loadingActual } = useCubeData(queryActual, !!actualMonth);
  const { data: compareData, loading: loadingCompare } = useCubeData(queryCompare, !!compareMonth);

  // Transformar datos para mostrar la comparación
  const { rowData, columnDefs } = useMemo(() => {
    if (!actualData && !compareData) {
      return { rowData: [], columnDefs: [] };
    }

    const mainDimensionField = currentLevelDef.dimensions[0];
    const metricToUse = isRappelActive && selectedMetric === 'detalle_factura.valor_neto_sum'
      ? 'detalle_factura.valor_resta_rappel'
      : selectedMetric;

    // Crear mapa de datos por dimensión
    const dataMap = {};

    // Agregar datos actuales
    if (actualData && actualData.length > 0) {
      actualData.forEach(row => {
        const key = row[mainDimensionField];
        if (!dataMap[key]) {
          dataMap[key] = { [mainDimensionField]: key };
        }
        dataMap[key].actual = Number(row[metricToUse]) || 0;
      });
    }

    // Agregar datos a comparar
    if (compareData && compareData.length > 0) {
      compareData.forEach(row => {
        const key = row[mainDimensionField];
        if (!dataMap[key]) {
          dataMap[key] = { [mainDimensionField]: key };
        }
        dataMap[key].compare = Number(row[metricToUse]) || 0;
      });
    }

    // Convertir a array
    const finalRowData = Object.values(dataMap).map(row => {
      const actual = row.actual || 0;
      const compare = row.compare || 0;
      const variation = compare !== 0 ? ((actual - compare) / compare) * 100 : 0;

      return {
        ...row,
        variation,
      };
    });

    // Crear definición de columnas
    const metricFormatter = currentLevelDef.columnDefs.find(
      col => col.field === selectedMetric
    )?.valueFormatter;

    const cols = [
      {
        headerName: currentLevelDef.columnDefs[0].headerName,
        field: mainDimensionField,
        valueGetter: params => params.data ? params.data[mainDimensionField] : '',
        minWidth: 150,
        sortable: true,
        filter: 'agSetColumnFilter',
      },
      {
        headerName: `Actual`,
        field: 'actual',
        valueGetter: params => params.data ? params.data.actual || 0 : 0,
        valueFormatter: metricFormatter || (p => p.value),
        sortable: true,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
      },
      {
        headerName: `ActualProyectado`,
        field: 'actualProjected',
        valueGetter: params => params.data ? params.data.actual || 0 : 0,
        valueFormatter: metricFormatter || (p => p.value),
        sortable: true,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
      },
      {
        headerName: `Compara`,
        field: 'compare',
        valueGetter: params => params.data ? params.data.compare || 0 : 0,
        valueFormatter: metricFormatter || (p => p.value),
        sortable: true,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
      },
      {
        headerName: `Variación%`,
        field: 'variation',
        valueGetter: params => params.data ? params.data.variation : 0,
        valueFormatter: p => Number(p.value).toFixed(1),
        sortable: true,
        filter: 'agNumberColumnFilter',
        type: 'numericColumn',
      },
    ];

    return { rowData: finalRowData, columnDefs: cols };
  }, [actualData, compareData, currentLevelDef, selectedMetric, isRappelActive]);

  // Generar fila de totales
  const pinnedTopRowData = useMemo(() => {
    if (rowData.length === 0) return [];

    const totalActual = rowData.reduce((sum, row) => sum + (row.actual || 0), 0);
    const totalCompare = rowData.reduce((sum, row) => sum + (row.compare || 0), 0);
    const totalVariation = totalCompare !== 0 ? ((totalActual - totalCompare) / totalCompare) * 100 : 0;

    return [{
      [currentLevelDef.dimensions[0]]: 'TOTAL',
      actual: totalActual,
      compare: totalCompare,
      variation: totalVariation,
    }];
  }, [rowData, currentLevelDef]);

  const defaultColDef = useMemo(
    () => ({
      sortable: false,
      minWidth: 100,
      resizable: true,
      cellClassRules: {
        'numeric-cell': (params) => {
          // Aplicar clase a celdas numéricas (que tienen type: 'numericColumn')
          const colDef = params.colDef;
          return colDef.type === 'numericColumn';
        }
      }
    }),
    []
  );

  const loadingOverlayComponentParams = useMemo(() => {
    return { loadingMessage: "Un momento por favor..." };
  }, []);

  const statusBar = useMemo(() => {
    return null; // Status bar oculto
  }, []);

  const handleViewChange = (viewId) => {
    setSelectedView(viewId);
  };

  return {
    selectedView,
    selectedMetric,
    actualMonth,
    compareMonth,
    periodType,
    availableMonths,
    currentLevelDef,
    rowData,
    columnDefs,
    pinnedTopRowData,
    loading: loadingActual || loadingCompare || monthsLoading,
    defaultColDef,
    loadingOverlayComponentParams,
    statusBar,
    isRappelActive,
    setIsRappelActive,
    handleViewChange,
    setSelectedMetric,
    setActualMonth,
    setCompareMonth,
    setPeriodType,
  };
};
