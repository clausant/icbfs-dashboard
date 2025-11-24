import React from 'react';
import './DrillDownSelector.css';

const DrillDownSelector = ({ isOpen, onClose, onSelectView, views, selectedValue, currentView }) => {
  if (!isOpen) return null;

  const handleSelectView = (viewId) => {
    onSelectView(viewId);
    onClose();
  };

  // Filtrar la vista actual para no mostrarla en la lista
  const availableViews = views.filter(view => view.id !== currentView);

  return (
    <div className="drill-down-overlay" onClick={onClose}>
      <div className="drill-down-modal" onClick={(e) => e.stopPropagation()}>
        <div className="drill-down-header">
          <h3 className="drill-down-title">Profundizar en: <span className="drill-down-value">{selectedValue}</span></h3>
          <button className="drill-down-close" onClick={onClose}>×</button>
        </div>

        <p className="drill-down-subtitle">¿A qué dimensión deseas profundizar?</p>

        <div className="drill-down-list">
          {availableViews.map((view) => (
            <button
              key={view.id}
              className="drill-down-item"
              onClick={() => handleSelectView(view.id)}
            >
              <span className="drill-down-item-icon">📊</span>
              <span className="drill-down-item-name">{view.name}</span>
              <span className="drill-down-item-arrow">→</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default DrillDownSelector;
