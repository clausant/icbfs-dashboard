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
  const [isRappelActive, setIsRappelActive] = useState(true);
  const [selectedDateRange, setSelectedDateRange] = useState('today'); // 'today' o 'yesterday'
  const [isEERRExcluded, setIsEERRExcluded] = useState(true); // Por defecto SÍ excluir EERR
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

    // Filtro de fecha: "Hasta ayer" excluye el día actual
    const dateRangeFilter = selectedDateRange === 'yesterday' ? [{
      member: "detalle_factura.fecha_factura",
      operator: "beforeDate",
      values: [new Date().toISOString().split('T')[0]] // Solo fecha YYYY-MM-DD
    }] : [];

    // Filtro EERR: excluir empresas relacionadas (id_grupo_cliente = '99')
    const eerrFilter = isEERRExcluded ? [{
      member: "detalle_factura.id_grupo_cliente",
      operator: "notEquals",
      values: ["99"]
    }] : [];

    // Usar solo valor_neto_puro (sin rappel, con EERR incluidas)
    const measures = currentLevelDef.measures.map(m =>
      m === "detalle_factura.valor_neto_sum" ? "detalle_factura.valor_neto_puro" : m
    );

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


    return {
      dimensions: finalDimensions,
      measures: measures,
      filters: [...filters, ...monthFilter, ...societyFilter, ...dateRangeFilter, ...eerrFilter],
    };
  }, [currentLevelDef, filters, dynamicDimensions, selectedMonth, isRappelActive, selectedSociety, selectedDateRange, isEERRExcluded, selectedView, drilldownLevel]);

  // Query adicional para obtener totales globales (COUNT DISTINCT real)
  const totalsQuery = useMemo(() => {
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

    const dateRangeFilter = selectedDateRange === 'yesterday' ? [{
      member: "detalle_factura.fecha_factura",
      operator: "beforeDate",
      values: [new Date().toISOString().split('T')[0]]
    }] : [];

    const eerrFilter = isEERRExcluded ? [{
      member: "detalle_factura.id_grupo_cliente",
      operator: "notEquals",
      values: ["99"]
    }] : [];

    return {
      dimensions: [], // SIN dimensiones para obtener el total global
      measures: [
        "detalle_factura.cliente_count",
        "detalle_factura.sku_count",
        "detalle_factura.ratio_sku_cliente"
        // NO incluir combinacion_sku_cliente porque no es un COUNT DISTINCT puro
      ],
      filters: [...filters, ...monthFilter, ...societyFilter, ...dateRangeFilter, ...eerrFilter],
    };
  }, [currentLevelDef, filters, selectedMonth, selectedSociety, selectedDateRange, isEERRExcluded]);

  const dynamicColumnDefs = useMemo(() => {
    if (!currentLevelDef) return [];
    return currentLevelDef.columnDefs.map(colDef => {
      // Manejar columna Venta$ - usar valor_neto_puro
      if (colDef.field === "detalle_factura.valor_neto_sum") {
        return {
          ...colDef,
          headerName: "Venta$",
          field: "detalle_factura.valor_neto_puro",
          valueGetter: p => p.data ? Number(p.data["detalle_factura.valor_neto_puro"]) : 0,
        };
      }

      // Manejar columna PrecioUnit$ - calcular en base a valor_neto_puro
      if (colDef.field === "detalle_factura.precio_unitario") {
        return {
          ...colDef,
          headerName: "PrecioUnit$",
          field: "precio_unitario_calculado",
          valueGetter: p => {
            if (!p.data) return 0;
            const venta = Number(p.data["detalle_factura.valor_neto_puro"]) || 0;
            const kilos = Number(p.data["detalle_factura.peso_neto_sum"]) || 0;
            return kilos > 0 ? Math.round(venta / kilos) : 0;
          },
        };
      }

      return colDef;
    });
  }, [currentLevelDef]);

  const { data: rowData, loading } = useCubeData(query, true); // Siempre cargar datos

  // Query para totales globales (COUNT DISTINCT real)
  const { data: totalsData, loading: loadingTotals } = useCubeData(totalsQuery, true);


  const pinnedTopRowData = useMemo(() => {
    if (!rowData || rowData.length === 0) {
      return [];
    }

    // Extraer totales globales de la query de totales
    const globalTotals = totalsData && totalsData.length > 0 ? totalsData[0] : {};

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
        } else if (field === 'detalle_factura.cliente_count' ||
                   field === 'detalle_factura.sku_count' ||
                   field === 'detalle_factura.ratio_sku_cliente') {
          // Para COUNT DISTINCT: usar valores globales de la query de totales
          totals[field] = globalTotals[field] ? Number(globalTotals[field]) : 0;
        } else if (field === 'detalle_factura.combinacion_sku_cliente') {
          // Para #CombSKU/Cliente: SUMAR los valores de las filas (no es COUNT DISTINCT puro)
          totals[field] = values.reduce((sum, val) => sum + val, 0);
        } else {
          // Por defecto suma (aggFunc: 'sum')
          totals[field] = values.reduce((sum, val) => sum + val, 0);
        }
      }
    });


    // Calcular campos derivados correctamente
    // PrecioUnit$ = Venta$ / Kilos
    if (totals['detalle_factura.precio_unitario'] !== undefined &&
        totals['detalle_factura.peso_neto_sum'] > 0) {
      totals['detalle_factura.precio_unitario'] =
        totals['detalle_factura.valor_neto_sum'] / totals['detalle_factura.peso_neto_sum'];
    }

    // MargenUnit$ = Margen$ / Kilos
    if (totals['detalle_factura.margen_unitario'] !== undefined &&
        totals['detalle_factura.peso_neto_sum'] > 0) {
      totals['detalle_factura.margen_unitario'] =
        totals['detalle_factura.margen_valor'] / totals['detalle_factura.peso_neto_sum'];
    }

    // #SKU/Cliente ya viene calculado de la query de totales (COUNT DISTINCT)
    // No necesitamos calcularlo manualmente

    // Margen% = (Total Margen$ / Total Venta$) × 100 (promedio ponderado)
    const totalVenta = totals['detalle_factura.valor_neto_puro'] || totals['detalle_factura.valor_neto_sum'];
    if (totalVenta > 0 && totals['detalle_factura.margen_valor']) {
      totals['detalle_factura.margen_porcentaje'] =
        (totals['detalle_factura.margen_valor'] / totalVenta) * 100;
    }

    const firstColumnField = dynamicColumnDefs[0]?.field;
    if (firstColumnField) {
      totals[firstColumnField] = 'TOTAL';
    }

    return [totals];
  }, [rowData, dynamicColumnDefs, totalsData]);

  const crumbs = useMemo(() => {
    const breadcrumbs = [];

    // Solo mostrar breadcrumbs si hay filtros aplicados
    if (filters.length > 0) {
      // Agregar vista de ORIGEN del primer filtro (no la vista actual)
      // Si el primer filtro tiene metadata, usa esa vista (hubo cambio de vista)
      // Si no, usa la vista actual (drill down jerárquico sin cambio de vista)
      const firstFilterMetadata = filterMetadata[0];
      const initialViewId = firstFilterMetadata?.viewId || selectedView;
      const initialViewName = getViewName(initialViewId);

      breadcrumbs.push({
        label: initialViewName,
        path: '#',
        isDrilldown: true,
        drilldownLevel: 0,
        viewId: initialViewId, // Vista de origen del primer filtro
        isHome: true, // Marcar como inicio para limpiar filtros
      });

      // Incluir los filtros aplicados
      filters.forEach((filter, index) => {
        // Construir label con formato "Dimensión: Valor" usando metadata
        const metadata = filterMetadata[index];
        // Usar displayValue de metadata si existe, sino usar el valor raw del filtro
        const displayValue = metadata?.displayValue || filter.values[0];
        const label = metadata?.viewName
          ? `${metadata.viewName}: ${displayValue}`
          : displayValue;

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
    console.log('🔙 Navegación reversa:', { level, viewId, currentView: selectedView });

    // Restaurar la vista PRIMERO si es necesario
    if (viewId && viewId !== selectedView) {
      console.log('Restaurando vista:', viewId);
      setSelectedView(viewId);
    }

    // Siempre usar drilldownLevel 0 cuando navegamos (nivel base de cada vista)
    setDrilldownLevel(0);

    // Cortar los filtros hasta el nivel anterior al clickeado
    // Si clickeas en breadcrumb[0] "Inicio" -> level=0 -> slice(0,0) = sin filtros
    // Si clickeas en breadcrumb[1] "Fecha: 01-11" -> level=1 -> slice(0,1) = mantener 1 filtro
    setFilters(filters.slice(0, level));
    setFilterMetadata(filterMetadata.slice(0, level));
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

    console.log('🔍 Drill down dinámico:', {
      from: selectedView,
      to: targetViewId,
      drillDownField,
      clickedValue,
      clickedValueType: typeof clickedValue,
      allClickedData: clickedRowData
    });

    // Formatear el valor para display en breadcrumb
    let displayValue = clickedValue;
    let newFilter;

    // Para fechas, usar inDateRange que soporta timestamps
    if (drillDownField === 'detalle_factura.fecha_factura' && typeof clickedValue === 'string' && clickedValue.includes('T')) {
      const datePart = clickedValue.split('T')[0]; // Extraer YYYY-MM-DD
      const [year, month, day] = datePart.split('-');
      displayValue = `${day}-${month}-${year}`;

      // inDateRange usa formato YYYY-MM-DD y captura todo el día
      // Para un día específico, usamos el mismo día como inicio y fin
      newFilter = {
        member: drillDownField,
        operator: 'inDateRange',
        values: [datePart, datePart],
      };

      console.log('📅 Filtro de fecha creado:', newFilter);
    } else {
      // Para otros campos usar equals con el valor exacto
      newFilter = {
        member: drillDownField,
        operator: 'equals',
        values: [clickedValue],
      };
    }

    // Crear metadata SEPARADA para el breadcrumb
    const newMetadata = {
      viewName: getViewName(selectedView), // Nombre amigable de la vista de origen
      viewId: selectedView, // ID de la vista para poder restaurarla
      displayValue: displayValue, // Valor formateado para mostrar
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
    selectedDateRange,
    setSelectedDateRange,
    isEERRExcluded,
    setIsEERRExcluded,
    handleViewChange,
    setSelectedMonth,
    rowData,
    loading: loading || loadingTotals,
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
