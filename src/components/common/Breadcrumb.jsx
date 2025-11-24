import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const breadcrumbStyles = {
  padding: '0.6rem 1.25rem',
  marginBottom: '1.5rem',
  listStyle: 'none',
  background: 'white',
  borderRadius: '0.75rem',
  display: 'flex',
  flexWrap: 'wrap',
  alignItems: 'center',
  gap: '0.5rem',
  boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
};

const breadcrumbItemStyles = {
  display: 'flex',
  alignItems: 'center',
  gap: '0.5rem',
};

const getBreadcrumbLinkStyles = (isHovering) => ({
  color: '#ef4444',
  textDecoration: 'none',
  cursor: 'pointer',
  fontSize: '0.925rem',
  fontWeight: '500',
  padding: '0.25rem 0.5rem',
  borderRadius: '0.375rem',
  transition: 'all 0.2s ease',
  background: isHovering ? '#f8fafc' : 'transparent',
});

const breadcrumbSeparatorStyles = {
  color: '#cbd5e1',
  fontSize: '1.25rem',
  fontWeight: '300',
};

const activeBreadcrumbItemStyles = {
  color: '#1e293b',
  fontSize: '0.925rem',
  fontWeight: '600',
  padding: '0.25rem 0.5rem',
  background: 'linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%)',
  borderRadius: '0.375rem',
};

const Breadcrumb = ({ crumbs, onDrilldownClick }) => {
  const navigate = useNavigate();
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const handleClick = (crumb) => {
    if (onDrilldownClick && crumb.drilldownLevel !== undefined) {
      onDrilldownClick(crumb.drilldownLevel, crumb.viewId);
    } else if (crumb.path !== '#') {
      navigate(crumb.path);
    }
  };

  return (
    <nav aria-label="breadcrumb">
      <ol style={breadcrumbStyles}>
        {crumbs.map((crumb, index) => (
          <li key={index} style={breadcrumbItemStyles}>
            {index < crumbs.length - 1 ? (
              <>
                <a
                  onClick={() => handleClick(crumb)}
                  onMouseEnter={() => setHoveredIndex(index)}
                  onMouseLeave={() => setHoveredIndex(null)}
                  style={getBreadcrumbLinkStyles(hoveredIndex === index)}
                >
                  {crumb.label}
                </a>
                <span style={breadcrumbSeparatorStyles}>›</span>
              </>
            ) : (
              <span style={activeBreadcrumbItemStyles}>{crumb.label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
};

Breadcrumb.propTypes = {
  crumbs: PropTypes.arrayOf(
    PropTypes.shape({
      label: PropTypes.string.isRequired,
      path: PropTypes.string.isRequired,
      drilldownLevel: PropTypes.number, // Opcional
    })
  ).isRequired,
  onDrilldownClick: PropTypes.func,
};

export default Breadcrumb;
