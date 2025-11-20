import React, { useState } from 'react';
import NavMenu from '../../components/ui/NavMenu/NavMenu';
import ProyeccionView from './ProyeccionView';
import Evolucion from './EvolucionView';
import Comparativo from './ComparativoView';
import '../../styles/Dashboard.css';

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
        {renderView()}
      </div>
    </div>
  );
};

export default DashboardPage;