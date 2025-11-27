'use client';
import React, { useRef, useCallback, useState, useEffect } from "react"; // Importar useState y useEffect
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { themeCostum } from "../../styles/theme";
import Breadcrumb from "../../components/common/Breadcrumb";
import customLoadingOverlay from "../../components/ui/customLoadingOverlay";
import ViewSelector from "../../components/ui/ViewSelector/ViewSelector";
// import RappelToggle from "../../components/ui/RappelToggle/RappelToggle"; // TEMPORALMENTE OCULTO
import MonthFilter from "../../components/ui/MonthFilter/MonthFilter";
import SocietyFilter from "../../components/ui/SocietyFilter/SocietyFilter";
import DateRangeFilter from "../../components/ui/DateRangeFilter/DateRangeFilter";
import EERRToggle from "../../components/ui/EERRToggle/EERRToggle";
import QuickFilter from "../../components/ui/QuickFilter/QuickFilter";
import Toast from "../../components/ui/Toast/Toast";
import DrillDownSelector from "../../components/ui/DrillDownSelector/DrillDownSelector";
import { useProyeccion } from "../../hooks/useProyeccion";
import { views } from "./dashboardConstants";
import "../../styles/Dashboard.css";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const ProyeccionView = () => {
  const gridRef = useRef();

  // Estado local para el filtro de sociedad
  const [selectedSociety, setSelectedSociety] = useState('all');

  // Estado para mostrar/ocultar header (persistir en localStorage)
  const [isHeaderVisible, setIsHeaderVisible] = useState(() => {
    const saved = localStorage.getItem('headerVisible');
    return saved !== null ? JSON.parse(saved) : true;
  });

  // Estado para el Quick Filter
  const [quickFilterText, setQuickFilterText] = useState('');

  // Guardar preferencia en localStorage
  useEffect(() => {
    localStorage.setItem('headerVisible', JSON.stringify(isHeaderVisible));
  }, [isHeaderVisible]);

  const {
    drilldownLevel,
    filters,
    selectedView,
    selectedMonth,
    setIsRappelActive,
    selectedDateRange,
    setSelectedDateRange,
    isEERRExcluded,
    setIsEERRExcluded,
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
  } = useProyeccion(selectedSociety); // Pasar selectedSociety al hook

  const handleSocietyChange = (newSociety) => {
    setSelectedSociety(newSociety);
  };

  const handleQuickFilter = (filterText) => {
    setQuickFilterText(filterText);
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setGridOption('quickFilterText', filterText);
    }
  };

  // Limpiar Quick Filter cuando cambia la vista o el nivel de drilldown
  useEffect(() => {
    setQuickFilterText('');
    if (gridRef.current && gridRef.current.api) {
      gridRef.current.api.setGridOption('quickFilterText', '');
    }
  }, [selectedView, drilldownLevel]);

  const onColumnPivotModeChanged = useCallback(() => {
    if (gridRef.current && gridRef.current.api && currentLevelDef) {
      const isPivotMode = gridRef.current.api.isPivotMode();
      if (!isPivotMode) {
        gridRef.current.api.setRowData(rowData);
        gridRef.current.api.setColumnDefs(currentLevelDef.columnDefs);
      }
    }
  }, [rowData, currentLevelDef]);

  const onGridReady = useCallback((params) => {
    // Optimización: No usar autoSizeAllColumns (muy costoso)
    // Las columnas ya tienen width definido en columnDefs
    // Solo ajustar primera columna si es necesario
    const firstColumn = params.api.getAllDisplayedColumns()[0];
    if (firstColumn) {
      params.api.setColumnWidths([{key: firstColumn.getColId(), newWidth: 200}]);
    }
  }, []);

  const getRowStyle = params => {
    if (params.node.isRowPinned()) {
      return { 'font-weight': 'bold', 'background-color': '#f0f0f0' };
    }
  };

  return (
    <>
      {/* Botón flotante para toggle header */}
      <button
        className="header-toggle-btn"
        onClick={() => setIsHeaderVisible(!isHeaderVisible)}
        title={isHeaderVisible ? "Ocultar controles" : "Mostrar controles"}
      >
        {isHeaderVisible ? '▲' : '▼'}
      </button>

      {isHeaderVisible && (
        <>
          <div className="section-header">Filtros</div>
          <div className="dashboard-header">
            <div className="dashboard-header-content">
              <div className="dashboard-controls">
                <div className="control-group">
                  <label>Mes:</label>
                  <MonthFilter selectedMonth={selectedMonth} setSelectedMonth={setSelectedMonth} />
                </div>
                <div className="control-group">
                  <label>Sociedad:</label>
                  <SocietyFilter
                    selectedSociety={selectedSociety}
                    onSocietyChange={handleSocietyChange}
                  />
                </div>
                <div className="control-group">
                  <label>Rango:</label>
                  <DateRangeFilter
                    selectedRange={selectedDateRange}
                    onRangeChange={setSelectedDateRange}
                  />
                </div>
                <div className="control-group">
                  <label>Excluir EERR:</label>
                  <EERRToggle onToggle={setIsEERRExcluded} />
                </div>
                <div className="control-group">
                  <label>Vista:</label>
                  <ViewSelector views={views} selectedView={selectedView} setSelectedView={handleViewChange} />
                </div>
                {/* TEMPORALMENTE OCULTO - Toggle Rappel
                <div className="control-group">
                  <label>Restar Rappel:</label>
                  <RappelToggle onToggle={setIsRappelActive} />
                </div>
                */}
              </div>
            </div>
          </div>
        </>
      )}

      <div className="section-header">Ruta de navegación</div>
      <Breadcrumb crumbs={crumbs} onDrilldownClick={handleBreadcrumbClick} />

      <div className="section-header" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <span>Vista: {views.find(v => v.id === selectedView)?.name || selectedView}</span>
        <QuickFilter onFilterChange={handleQuickFilter} value={quickFilterText} />
      </div>
      <div className="grid-container">
        <div className="grid-wrapper">
          <AgGridReact
            ref={gridRef}
            theme={themeCostum}
            rowData={rowData}
            loading={loading}
            columnDefs={dynamicColumnDefs}
            defaultColDef={defaultColDef}
            onRowClicked={handleRowClicked}
            onCellClicked={handleRowClicked}
            pivotPanelShow="always"
            loadingOverlayComponent={customLoadingOverlay}
            loadingOverlayComponentParams={loadingOverlayComponentParams}
            onColumnPivotModeChanged={onColumnPivotModeChanged}
            onColumnVisible={handleColumnVisible}
            statusBar={statusBar}
            pinnedTopRowData={pinnedTopRowData}
            getRowStyle={getRowStyle}
            onGridReady={onGridReady}
          />
        </div>
      </div>

      {showToast && (
        <Toast
          message="Has llegado al nivel más detallado"
          type="info"
          onClose={() => setShowToast(false)}
        />
      )}

      <DrillDownSelector
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSelectView={handleDrillDownToView}
        views={views}
        selectedValue={clickedRowData && currentLevelDef ? (() => {
          const value = clickedRowData[currentLevelDef.drillDownField];
          // Formatear fechas para display
          if (currentLevelDef.drillDownField === 'detalle_factura.fecha_factura' && typeof value === 'string' && value.includes('T')) {
            const datePart = value.split('T')[0];
            const [year, month, day] = datePart.split('-');
            return `${day}-${month}-${year}`;
          }
          return value;
        })() : ''}
        currentView={selectedView}
      />
    </>
  );
};
export default ProyeccionView;
