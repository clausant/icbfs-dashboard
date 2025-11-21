import React from 'react';
import './ViewSelector.css';

const ViewSelector = ({ views, selectedView, setSelectedView }) => {
  const handleViewChange = (e) => {
    setSelectedView(e.target.value);
  };

  return (
    <div className="view-selector-container">
      <select
        id="view-select"
        value={selectedView}
        onChange={handleViewChange}
        className="view-selector-select"
      >
        {views.map(view => (
          <option key={view.id} value={view.id}>
            {view.name}
          </option>
        ))}
      </select>
    </div>
  );
};

export default ViewSelector;