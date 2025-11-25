'use client';
import React, { useRef, useCallback } from "react";
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { themeCostum } from "../../styles/theme";
import Breadcrumb from "../../components/common/Breadcrumb";
import customLoadingOverlay from "../../components/ui/customLoadingOverlay";
import ViewSelector from "../../components/ui/ViewSelector/ViewSelector";
import MetricSelector from "../../components/ui/MetricSelector/MetricSelector";
// import RappelToggle from "../../components/ui/RappelToggle/RappelToggle"; // TEMPORALMENTE OCULTO
import DateRangeFilter from "../../components/ui/DateRangeFilter/DateRangeFilter";
import EERRToggle from "../../components/ui/EERRToggle/EERRToggle";
import { useEvolucion } from "../../hooks/useEvolucion";
import { views } from "./dashboardConstants";
import "../../styles/Dashboard.css";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const EvolucionView = () => {
  const gridRef = useRef();
  const {
    selectedView,
    selectedMetric,
    numMonths,
    months,
    currentLevelDef,
    rowData,
    columnDefs,
    pinnedTopRowData,
    loading,
    defaultColDef,
    loadingOverlayComponentParams,
    statusBar,
    isRappelActive,
    setIsRappelActive,
    selectedDateRange,
    setSelectedDateRange,
    isEERRExcluded,
    setIsEERRExcluded,
    handleViewChange,
    setSelectedMetric,
    setNumMonths,
  } = useEvolucion();

  const onGridReady = useCallback((params) => {
    // Auto-size todas las columnas al cargar
    params.api.autoSizeAllColumns();

    // Luego fijar el ancho de la primera columna a 150px
    const firstColumn = params.api.getAllDisplayedColumns()[0];
    if (firstColumn) {
      params.api.setColumnWidths([{key: firstColumn.getColId(), newWidth: 150}]);
    }
  }, []);

  const getRowStyle = params => {
    if (params.node.isRowPinned()) {
      return { 'font-weight': 'bold', 'background-color': '#f0f0f0' };
    }
  };

  return (
    <>
      <Breadcrumb crumbs={[{ label: 'Inicio', path: '/' }, { label: 'Evolución', path: '/dashboard/evolucion', drilldownLevel: 0 }]} />

      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-controls">
            <div className="control-group">
              <label>Períodos:</label>
              <input
                type="number"
                value={numMonths}
                onChange={(e) => setNumMonths(Math.max(1, parseInt(e.target.value) || 6))}
                min="1"
                max={months.length}
                style={{ width: '60px', padding: '5px' }}
              />
            </div>
            <div className="control-group">
              <label>Métrica:</label>
              <MetricSelector
                selectedMetric={selectedMetric}
                setSelectedMetric={setSelectedMetric}
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
              <ViewSelector
                views={views}
                selectedView={selectedView}
                setSelectedView={handleViewChange}
              />
            </div>
            {/* TEMPORALMENTE OCULTO - Toggle Rappel
            <RappelToggle onToggle={setIsRappelActive} />
            */}
          </div>
        </div>
      </div>

      <div className="grid-container">
        <div className="grid-wrapper">
          <AgGridReact
            ref={gridRef}
            theme={themeCostum}
            rowData={rowData}
            loading={loading}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            loadingOverlayComponent={customLoadingOverlay}
            loadingOverlayComponentParams={loadingOverlayComponentParams}
            statusBar={statusBar}
            pinnedTopRowData={pinnedTopRowData}
            getRowStyle={getRowStyle}
            onGridReady={onGridReady}
          />
        </div>
      </div>
    </>
  );
};

export default EvolucionView;
