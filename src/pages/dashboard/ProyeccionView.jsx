'use client';
import React, { useRef, useCallback, useState } from "react"; // Importar useState
import { ModuleRegistry, AllCommunityModule } from "ag-grid-community";
import { AllEnterpriseModule } from "ag-grid-enterprise";
import { AgGridReact } from "ag-grid-react";
import { themeCostum } from "../../styles/theme";
import Breadcrumb from "../../components/common/Breadcrumb";
import customLoadingOverlay from "../../components/ui/customLoadingOverlay";
import ViewSelector from "../../components/ui/ViewSelector/ViewSelector";
import RappelToggle from "../../components/ui/RappelToggle/RappelToggle";
import MonthFilter from "../../components/ui/MonthFilter/MonthFilter";
import SocietyFilter from "../../components/ui/SocietyFilter/SocietyFilter"; // Importar SocietyFilter
import Toast from "../../components/ui/Toast/Toast";
import { useProyeccion } from "../../hooks/useProyeccion";
import { views } from "./dashboardConstants";
import "../../styles/Dashboard.css";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const ProyeccionView = () => {
  const gridRef = useRef();

  // Estado local para el filtro de sociedad
  const [selectedSociety, setSelectedSociety] = useState('all');

  const {
    drilldownLevel,
    filters,
    selectedView,
    selectedMonth,
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
  } = useProyeccion(selectedSociety); // Pasar selectedSociety al hook

  const handleSocietyChange = (newSociety) => {
    setSelectedSociety(newSociety);
    // Aquí puedes añadir la lógica para filtrar los datos de ProyeccionView
    // o para pasar este valor a useProyeccion si maneja los filtros
    console.log('Sociedad seleccionada en ProyeccionView:', newSociety);
  };

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
              <label>Vista:</label>
              <ViewSelector views={views} selectedView={selectedView} setSelectedView={handleViewChange} />
            </div>
            <RappelToggle onToggle={setIsRappelActive} />
          </div>
        </div>
      </div>

      <Breadcrumb crumbs={crumbs} onDrilldownClick={handleBreadcrumbClick} />

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
    </>
  );
};
export default ProyeccionView;
