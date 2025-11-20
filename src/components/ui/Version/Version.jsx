import React, { useState } from 'react';
import './Version.css';

const Version = () => {
  const [isExpanded, setIsExpanded] = useState(false);

  const version = import.meta.env.VITE_APP_VERSION || 'dev';
  const buildDate = import.meta.env.VITE_BUILD_DATE || new Date().toISOString();
  const commitHash = import.meta.env.VITE_COMMIT_HASH || 'unknown';

  const formattedDate = new Date(buildDate).toLocaleString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div
      className="version-container"
      onClick={() => setIsExpanded(!isExpanded)}
      title="Click para ver detalles"
    >
      {isExpanded ? (
        <div className="version-expanded">
          <div className="version-row">
            <span className="version-label">Versión:</span>
            <span className="version-value">{version}</span>
          </div>
          <div className="version-row">
            <span className="version-label">Build:</span>
            <span className="version-value">{formattedDate}</span>
          </div>
          <div className="version-row">
            <span className="version-label">Commit:</span>
            <span className="version-value version-commit">{commitHash.substring(0, 7)}</span>
          </div>
        </div>
      ) : (
        <div className="version-compact">
          v{version} • {commitHash.substring(0, 7)}
        </div>
      )}
    </div>
  );
};

export default Version;
