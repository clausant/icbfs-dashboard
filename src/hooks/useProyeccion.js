import { useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { levelDefs } from '../pages/dashboard/levelDefs';
import { useCubeData } from './useCubeData';
import { breadcrumbNameMap } from '../pages/dashboard/dashboardConstants';

// Función helper para obtener el mes actual por defecto
const getDefaultMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Mes actual (getMonth es 0-indexed)
  return `${year}-${month}`;
};

export const useProyeccion = (selectedSociety) => {
  const [drilldownLevel, setDrilldownLevel] = useState(0);
  const [filters, setFilters] = useState([]);
  const [selectedView, setSelectedView] = useState('categoria');
  const [dynamicDimensions, setDynamicDimensions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState([getDefaultMonth()]); // Mes por defecto
  const [isRappelActive, setIsRappelActive] = useState(false);

  const location = useLocation();

  const currentLevelDef = useMemo(() => levelDefs[selectedView][drilldownLevel], [selectedView, drilldownLevel]);

  const handleViewChange = (viewId) => {
    setSelectedView(viewId);
    setDrilldownLevel(0);
    setFilters([]);
    setDynamicDimensions([]);
  };

  const query = useMemo(() => {
    const monthFilter = selectedMonth.length > 0 ? [{
      member: "detalle_factura.fecha_year_month",
      operator: "in",
      values: selectedMonth
    }] : [];

    const societyFilter = selectedSociety && selectedSociety !== 'all' ? [{
      member: "detalle_factura.sociedad",
      operator: "equals",
      values: [selectedSociety]
    }] : [];

    const measures = isRappelActive
      ? currentLevelDef.measures.map(m => m === "detalle_factura.valor_neto_sum" ? "detalle_factura.valor_resta_rappel" : m)
      : currentLevelDef.measures;

    return {
      dimensions: [...currentLevelDef.dimensions, ...dynamicDimensions],
      measures: measures,
      filters: [...filters, ...monthFilter, ...societyFilter], // Incluir societyFilter aquí
    };
  }, [currentLevelDef, filters, dynamicDimensions, selectedMonth, isRappelActive, selectedSociety]); // Añadir selectedSociety a las dependencias

  const dynamicColumnDefs = useMemo(() => {
    if (!currentLevelDef) return [];
    return currentLevelDef.columnDefs.map(colDef => {
      if (colDef.field === "detalle_factura.valor_neto_sum") {
        if (isRappelActive) {
          return {
            ...colDef,
            headerName: "Venta (Rappel)",
            field: "detalle_factura.valor_resta_rappel",
            valueGetter: p => p.data ? Number(p.data["detalle_factura.valor_resta_rappel"]) : 0,
          };
        }
        return {
          ...colDef,
          headerName: "Venta",
          field: "detalle_factura.valor_neto_sum",
          valueGetter: p => p.data ? Number(p.data["detalle_factura.valor_neto_sum"]) : 0,
        };
      }
      return colDef;
    });
  }, [currentLevelDef, isRappelActive]);

  const { data: rowData, loading } = useCubeData(query, true); // Siempre cargar datos

  const pinnedTopRowData = useMemo(() => {
    if (!rowData || rowData.length === 0) {
      return [];
    }

    const totals = {};
    dynamicColumnDefs.forEach(colDef => {
      const field = colDef.field;

      // Detectar si es columna numérica basándose en el filter
      const isNumeric = colDef.filter === 'agNumberColumnFilter' || colDef.aggFunc;

      if (isNumeric && field) {
        const values = rowData.map(row => {
          if (colDef.valueGetter) {
            return colDef.valueGetter({ data: row });
          } else {
            return row[field] ? Number(row[field]) : 0;
          }
        }).filter(v => !Number.isNaN(v));

        // Aplicar el tipo de agregación correcto
        if (colDef.aggFunc === 'avg') {
          totals[field] = values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : 0;
        } else {
          // Por defecto suma (aggFunc: 'sum')
          totals[field] = values.reduce((sum, val) => sum + val, 0);
        }
      }
    });

    const firstColumnField = dynamicColumnDefs[0]?.field;
    if (firstColumnField) {
      totals[firstColumnField] = 'TOTAL';
    }

    return [totals];
  }, [rowData, dynamicColumnDefs]);

  const crumbs = useMemo(() => {
    const pathnames = location.pathname.split('/').filter((x) => x);
    const breadcrumbs = [{ label: 'Inicio', path: '/' }];
    let currentPath = '';
    pathnames.forEach(name => {
      currentPath += `/${name}`;
      if (breadcrumbNameMap[currentPath]) {
        breadcrumbs.push({ label: breadcrumbNameMap[currentPath], path: currentPath, drilldownLevel: 0 });
      }
    });
    filters.forEach((filter, index) => {
      breadcrumbs.push({
        label: filter.values[0],
        path: `#`,
        isDrilldown: true,
        drilldownLevel: index + 1
      });
    });
    return breadcrumbs;
  }, [location.pathname, filters]);

  const handleBreadcrumbClick = (level) => {
    setDrilldownLevel(level);
    setFilters(filters.slice(0, level));
  };

  const handleColumnVisible = useCallback((event) => {
    const { column, visible } = event;
    if (!column) return;

    const colDef = column.getColDef();
    if (colDef.isDynamic) {
      const dimension = colDef.dimension;
      setDynamicDimensions(prev => {
        const newDimensions = new Set(prev);
        if (visible) {
          newDimensions.add(dimension);
        } else {
          newDimensions.delete(dimension);
        }
        return [...newDimensions];
      });
    }
  }, []);

  const handleRowClicked = useCallback((event) => {
    const { drillDownField } = currentLevelDef;
    if (drillDownField && levelDefs[selectedView][drilldownLevel + 1]) {
      const clickedValue = event.data[drillDownField];
      const newFilter = {
        member: drillDownField,
        operator: 'equals',
        values: [clickedValue],
      };
      setFilters([...filters, newFilter]);
      setDrilldownLevel(drilldownLevel + 1);
    } else {
      alert("No hay mas niveles");
    }
  }, [currentLevelDef, drilldownLevel, filters, selectedView]);

  const defaultColDef = useMemo(
    () => ({
      sortable: true,
      resizable: true,
      enablePivot: true,
      minWidth: 100,
      cellClassRules: {
        'numeric-cell': (params) => {
          // Aplicar clase a celdas numéricas (que tienen aggFunc)
          const colDef = params.colDef;
          return colDef.aggFunc !== undefined;
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

  return {
    drilldownLevel,
    filters,
    selectedView,
    selectedMonth,
    isRappelActive,
    setIsRappelActive,
    handleViewChange,
    setSelectedMonth,
    rowData,
    loading,
    dynamicColumnDefs,
    defaultColDef,
    handleRowClicked,
    handleColumnVisible,
    statusBar,
    loadingOverlayComponentParams,
    crumbs,
    handleBreadcrumbClick,
    currentLevelDef,
    pinnedTopRowData,
  };
};
