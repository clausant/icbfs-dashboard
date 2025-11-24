import { useState, useMemo, useCallback } from 'react';
import { useLocation } from 'react-router-dom';
import { levelDefs } from '../pages/dashboard/levelDefs';
import { useCubeData } from './useCubeData';
import { breadcrumbNameMap, views } from '../pages/dashboard/dashboardConstants';

// Función helper para obtener el mes actual por defecto
const getDefaultMonth = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); // Mes actual (getMonth es 0-indexed)
  return `${year}-${month}`;
};

// Función helper para obtener el nombre amigable de una vista por su id
const getViewName = (viewId) => {
  const view = views.find(v => v.id === viewId);
  return view ? view.name : viewId;
};

export const useProyeccion = (selectedSociety) => {
  const [drilldownLevel, setDrilldownLevel] = useState(0);
  const [filters, setFilters] = useState([]);
  const [filterMetadata, setFilterMetadata] = useState([]); // Metadata separada para breadcrumb
  const [selectedView, setSelectedView] = useState('categoria');
  const [dynamicDimensions, setDynamicDimensions] = useState([]);
  const [selectedMonth, setSelectedMonth] = useState([getDefaultMonth()]); // Mes por defecto
  const [isRappelActive, setIsRappelActive] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [clickedRowData, setClickedRowData] = useState(null);

  const location = useLocation();

  const currentLevelDef = useMemo(() => levelDefs[selectedView][drilldownLevel], [selectedView, drilldownLevel]);

  const handleViewChange = (viewId) => {
    setSelectedView(viewId);
    setDrilldownLevel(0);
    setFilters([]);
    setFilterMetadata([]);
    setDynamicDimensions([]);
  };

  const query = useMemo(() => {
    if (!currentLevelDef) return null;

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

    // Extraer las dimensiones de los filtros aplicados para incluirlas en la consulta
    // Esto asegura que los datos contengan los valores de todos los niveles de drill down
    const filterDimensions = filters.map(f => f.member);

    // Combinar todas las dimensiones y eliminar duplicados
    const allDimensions = [
      ...currentLevelDef.dimensions,
      ...dynamicDimensions,
      ...filterDimensions  // ✅ Incluir dimensiones filtradas para mantener valores en datos
    ];

    // Eliminar dimensiones duplicadas (puede causar problemas en Cube.js)
    const finalDimensions = [...new Set(allDimensions)];

    console.log('📊 Query construida:', {
      view: selectedView,
      level: drilldownLevel,
      dimensions: finalDimensions,
      filters: filters,
      filterDimensions
    });

    return {
      dimensions: finalDimensions,
      measures: measures,
      filters: [...filters, ...monthFilter, ...societyFilter], // Incluir societyFilter aquí
    };
  }, [currentLevelDef, filters, dynamicDimensions, selectedMonth, isRappelActive, selectedSociety, selectedView, drilldownLevel]); // Añadir selectedSociety a las dependencias

  const dynamicColumnDefs = useMemo(() => {
    if (!currentLevelDef) return [];
    return currentLevelDef.columnDefs.map(colDef => {
      if (colDef.field === "detalle_factura.valor_neto_sum") {
        if (isRappelActive) {
          return {
            ...colDef,
            headerName: "Venta(Rappel)$",
            field: "detalle_factura.valor_resta_rappel",
            valueGetter: p => p.data ? Number(p.data["detalle_factura.valor_resta_rappel"]) : 0,
          };
        }
        return {
          ...colDef,
          headerName: "Venta$",
          field: "detalle_factura.valor_neto_sum",
          valueGetter: p => p.data ? Number(p.data["detalle_factura.valor_neto_sum"]) : 0,
        };
      }
      return colDef;
    });
  }, [currentLevelDef, isRappelActive]);

  const { data: rowData, loading } = useCubeData(query, true); // Siempre cargar datos

  // Debug: Log de datos recibidos
  console.log('📦 Datos recibidos de Cube.js:', {
    view: selectedView,
    level: drilldownLevel,
    rowCount: rowData?.length || 0,
    firstRow: rowData?.[0],
    loading
  });

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
    const breadcrumbs = [];

    // Solo mostrar breadcrumbs si hay filtros aplicados
    if (filters.length > 0) {
      // Agregar vista inicial al principio para poder volver
      const initialViewName = getViewName(selectedView);
      breadcrumbs.push({
        label: initialViewName,
        path: '#',
        isDrilldown: true,
        drilldownLevel: 0,
        viewId: selectedView, // Vista actual para volver
        isHome: true, // Marcar como inicio para limpiar filtros
      });

      // Incluir los filtros aplicados
      filters.forEach((filter, index) => {
        // Construir label con formato "Dimensión: Valor" usando metadata
        const metadata = filterMetadata[index];
        const label = metadata?.viewName
          ? `${metadata.viewName}: ${filter.values[0]}`
          : filter.values[0];

        breadcrumbs.push({
          label,
          path: `#`,
          isDrilldown: true,
          drilldownLevel: index + 1,
          viewId: metadata?.viewId, // Vista guardada para este nivel
        });
      });
    }

    return breadcrumbs;
  }, [filters, filterMetadata, selectedView]);

  const handleBreadcrumbClick = (level, viewId) => {
    setDrilldownLevel(level);
    setFilters(filters.slice(0, level));
    setFilterMetadata(filterMetadata.slice(0, level));

    // Restaurar la vista guardada en este nivel
    if (viewId && viewId !== selectedView) {
      console.log('Restaurando vista:', viewId);
      setSelectedView(viewId);
    }
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

  const handleDrillDownToView = useCallback((targetViewId) => {
    if (!clickedRowData || !currentLevelDef) return;

    const { drillDownField } = currentLevelDef;
    const clickedValue = clickedRowData[drillDownField];

    if (!clickedValue) {
      console.warn('Valor clickeado está vacío');
      return;
    }

    console.log('Drill down dinámico:', {
      from: selectedView,
      to: targetViewId,
      filter: { field: drillDownField, value: clickedValue }
    });

    // Crear el nuevo filtro SIN metadata (limpio para Cube.js)
    const newFilter = {
      member: drillDownField,
      operator: 'equals',
      values: [clickedValue],
    };

    // Crear metadata SEPARADA para el breadcrumb
    const newMetadata = {
      viewName: getViewName(selectedView), // Nombre amigable de la vista de origen
      viewId: selectedView, // ID de la vista para poder restaurarla
    };

    // Cambiar a la nueva vista ACUMULANDO el filtro aplicado
    setSelectedView(targetViewId);
    setDrilldownLevel(0);
    setFilters([...filters, newFilter]); // ✅ Acumular en lugar de reemplazar
    setFilterMetadata([...filterMetadata, newMetadata]); // ✅ Acumular metadata separada
    setDynamicDimensions([]);
    setIsModalOpen(false);
    setClickedRowData(null);
  }, [clickedRowData, currentLevelDef, selectedView, filters, filterMetadata]);

  const handleRowClicked = useCallback((event) => {
    // Ignorar clicks en fila pinned (TOTAL)
    if (event.node.isRowPinned()) {
      console.log('Click en fila TOTAL - ignorado');
      return;
    }

    if (!currentLevelDef) return;

    const { drillDownField } = currentLevelDef;
    const clickedValue = event.data[drillDownField];

    // Validar que el valor no sea vacío
    if (!clickedValue) {
      console.warn('Valor clickeado está vacío');
      return;
    }

    console.log('🖱️ Row clicked:', {
      drillDownField,
      clickedValue,
      currentLevel: drilldownLevel,
      allRowData: event.data
    });

    // Siempre abrir modal para permitir navegación libre entre vistas
    console.log('Abriendo modal para seleccionar vista...');
    setClickedRowData(event.data);
    setIsModalOpen(true);
  }, [currentLevelDef, drilldownLevel]);

  const defaultColDef = useMemo(
    () => ({
      sortable: false,
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
    showToast,
    setShowToast,
    isModalOpen,
    setIsModalOpen,
    clickedRowData,
    handleDrillDownToView,
  };
};
