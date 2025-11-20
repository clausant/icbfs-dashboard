import React from 'react';
import { useUpdateTimestamp } from '../../../hooks/useUpdateTimestamp';
import './NavMenu.css';

const NavMenu = ({ activeTab, onTabClick }) => {
  const { timestamp, loading, error } = useUpdateTimestamp();

  return (
    <>
      <div className='nav-container'>
        <div className="nav-menu">
          <button
            className={`nav-menu-item ${activeTab === 'Proyección' ? 'active' : ''}`}
            onClick={() => onTabClick('Proyección')}
          >
            Proyección
          </button>
          <button
            className={`nav-menu-item ${activeTab === 'Evolución' ? 'active' : ''}`}
            onClick={() => onTabClick('Evolución')}
          >
            Evolución
          </button>
          <button
            className={`nav-menu-item ${activeTab === 'Comparativo' ? 'active' : ''}`}
            onClick={() => onTabClick('Comparativo')}
          >
            Comparativo
          </button>
        </div>
        <div className='date-update'>
          Última actualización: {loading ? 'Cargando...' : error ? 'Error' : timestamp}
        </div>
      </div>
    </>
  );
};

export default NavMenu;
