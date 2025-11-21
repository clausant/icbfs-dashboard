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
import RappelToggle from "../../components/ui/RappelToggle/RappelToggle";
import { useComparativo } from "../../hooks/useComparativo";
import { views } from "./dashboardConstants";
import "../../styles/Dashboard.css";

ModuleRegistry.registerModules([AllCommunityModule, AllEnterpriseModule]);

const ComparativoView = () => {
  const gridRef = useRef();
  const {
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
    loading,
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
  } = useComparativo();

  const onGridReady = useCallback((params) => {
    // Auto-size todas las columnas al cargar
    params.api.autoSizeAllColumns();

    // Luego fijar el ancho de la primera columna a 150px
    const firstColumn = params.api.getAllDisplayedColumns()[0];
    if (firstColumn) {
      params.api.setColumnWidth(firstColumn, 150);
    }
  }, []);

  const periodOptions = ['Mes', 'Bimestre', 'Trimestre', 'Semestre'];

  const getRowStyle = params => {
    if (params.node.isRowPinned()) {
      return { 'font-weight': 'bold', 'background-color': '#f0f0f0' };
    }
  };

  return (
    <>
      <Breadcrumb crumbs={[{ label: 'Inicio', path: '/' }, { label: 'Comparativo', path: '/dashboard/comparativo', drilldownLevel: 0 }]} />

      <div className="dashboard-header">
        <div className="dashboard-header-content">
          <div className="dashboard-logo">
            <img src="/logo-icbfs.png" alt="ICB Food Services" className="dashboard-logo" />
          </div>
          <div className="dashboard-controls">
            <div className="control-group">
              <label>Actual:</label>
              <select
                value={actualMonth}
                onChange={(e) => setActualMonth(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '120px' }}
              >
                <option value="">Seleccionar...</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div className="control-group">
              <label>Compara:</label>
              <select
                value={compareMonth}
                onChange={(e) => setCompareMonth(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '120px' }}
              >
                <option value="">Seleccionar...</option>
                {availableMonths.map(month => (
                  <option key={month} value={month}>{month}</option>
                ))}
              </select>
            </div>
            <div className="control-group">
              <label>Período:</label>
              <select
                value={periodType}
                onChange={(e) => setPeriodType(e.target.value)}
                style={{ padding: '8px 12px', borderRadius: '4px', border: '1px solid #ddd', minWidth: '120px' }}
              >
                {periodOptions.map(period => (
                  <option key={period} value={period}>{period}</option>
                ))}
              </select>
            </div>
            <div className="control-group">
              <label>Métrica:</label>
              <MetricSelector
                selectedMetric={selectedMetric}
                setSelectedMetric={setSelectedMetric}
              />
            </div>
            <div className="control-group">
              <label>Vista:</label>
              <ViewSelector
                views={views}
                selectedView={selectedView}
                setSelectedView={handleViewChange}
              />
            </div>
            <RappelToggle onToggle={setIsRappelActive} />
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

export default ComparativoView;
