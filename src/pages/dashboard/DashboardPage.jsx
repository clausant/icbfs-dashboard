import React, { useState, lazy, Suspense } from 'react';
import NavMenu from '../../components/ui/NavMenu/NavMenu';
import '../../styles/Dashboard.css';

// Lazy loading de las vistas para mejorar la carga inicial
const ProyeccionView = lazy(() => import('./ProyeccionView'));
const Evolucion = lazy(() => import('./EvolucionView'));
const Comparativo = lazy(() => import('./ComparativoView'));

const DashboardPage = () => {
  const [activeTab, setActiveTab] = useState('Proyección');

  const renderView = () => {
    switch (activeTab) {
      case 'Proyección':
        return <ProyeccionView />;
      case 'Evolución':
        return <Evolucion />;
      case 'Comparativo':
        return <Comparativo />;
      default:
        return <ProyeccionView />;
    }
  };

  return (
    <div className="dashboard-container">
      <NavMenu activeTab={activeTab} onTabClick={setActiveTab} />
      <div className="dashboard-content">
        <Suspense fallback={
          <div className="loading-container">
            <div className="loading-spinner"></div>
            <p>Cargando vista...</p>
          </div>
        }>
          {renderView()}
        </Suspense>
      </div>
    </div>
  );
};

export default DashboardPage;