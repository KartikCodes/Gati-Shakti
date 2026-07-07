import React, { useState, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Circle, Popup, useMapEvents } from 'react-leaflet';
import { centerBhopal, zoomLevel, departments, formatBudget } from '../data/projectsData';
import { Plus, X, Pencil, Trash2 } from 'lucide-react';

// Custom hook to catch map clicks in edit mode
function MapClickEvents({ onMapClick, editMode }) {
  useMapEvents({
    click(e) {
      if (editMode && onMapClick) {
        onMapClick(e.latlng);
      }
    }
  });
  return null;
}

// Legend Component
function MapLegend() {
  return (
    <div style={{
      position: 'absolute',
      bottom: '24px',
      left: '24px',
      zIndex: 1000,
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: '8px',
      padding: '12px 16px',
      boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
      fontSize: '0.75rem',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    }}>
      <h4 style={{ fontWeight: '700', color: 'var(--text-main)', marginBottom: '4px', fontSize: '0.8rem' }}>Legend</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
        {Object.entries(departments).map(([key, dept]) => (
          <div key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: dept.indicator }} />
            <span style={{ color: 'var(--text-muted)' }}>{dept.label}</span>
          </div>
        ))}
        <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '4px 0' }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            border: '2px dashed #EF4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)'
          }} />
          <span style={{ color: 'var(--danger-text)', fontWeight: '600' }}>Conflict Zone</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '14px',
            height: '14px',
            borderRadius: '50%',
            border: '2px dashed #F59E0B',
            backgroundColor: 'rgba(245, 158, 11, 0.05)'
          }} />
          <span style={{ color: 'var(--warning-text)', fontWeight: '600' }}>Custom Area</span>
        </div>
      </div>
    </div>
  );
}

// Add Circle Form Component
function AddCircleForm({ latlng, onSubmit, onCancel, user }) {
  const isAdmin = user?.isAdmin;
  const userDept = user?.department;

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(isAdmin ? 'PWD' : userDept);
  const [wardName, setWardName] = useState('');
  const [radiusMeters, setRadiusMeters] = useState(300);
  const [startDate, setStartDate] = useState('2026-07-01');
  const [endDate, setEndDate] = useState('2026-12-31');
  const [budget, setBudget] = useState(5000000);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      title,
      department,
      wardName,
      radiusMeters: Number(radiusMeters),
      coordinates: { lat: latlng.lat, lng: latlng.lng },
      startDate,
      endDate,
      budget: Number(budget)
    });
  };

  return (
    <div style={{
      position: 'absolute',
      top: '16px',
      right: '16px',
      zIndex: 1000,
      backgroundColor: 'var(--bg-surface)',
      border: '1px solid var(--border-color)',
      borderRadius: '12px',
      padding: '20px',
      boxShadow: '0 8px 30px rgba(0, 0, 0, 0.12)',
      width: '320px',
      maxHeight: 'calc(100% - 32px)',
      overflowY: 'auto',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>Add Infrastructure Circle</h3>
        <button 
          onClick={onCancel} 
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
        >
          <X size={18} />
        </button>
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {/* Title */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Project Title</label>
          <input 
            type="text" 
            placeholder="e.g. Ward 23 Sewer Trenching" 
            value={title} 
            onChange={(e) => setTitle(e.target.value)} 
            required 
          />
        </div>

        {/* Department Selection */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Department</label>
          {isAdmin ? (
            <select value={department} onChange={(e) => setDepartment(e.target.value)}>
              {Object.entries(departments).map(([key, dept]) => (
                <option key={key} value={key}>{dept.label}</option>
              ))}
            </select>
          ) : (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 12px',
              backgroundColor: 'var(--bg-app)',
              border: '1px solid var(--border-color)',
              borderRadius: '8px',
              fontSize: '0.85rem',
              fontWeight: '500'
            }}>
              <div style={{
                width: '10px',
                height: '10px',
                borderRadius: '50%',
                backgroundColor: departments[userDept]?.indicator
              }} />
              {departments[userDept]?.label}
            </div>
          )}
        </div>

        {/* Ward Name */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Ward Name</label>
          <input 
            type="text" 
            placeholder="e.g. MP Nagar" 
            value={wardName} 
            onChange={(e) => setWardName(e.target.value)} 
            required 
          />
        </div>

        {/* Radius and Budget */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Radius (m)</label>
            <input 
              type="number" 
              value={radiusMeters} 
              onChange={(e) => setRadiusMeters(e.target.value)} 
              min={50} 
              max={2000} 
              required 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Budget (₹)</label>
            <input 
              type="number" 
              value={budget} 
              onChange={(e) => setBudget(e.target.value)} 
              min={10000} 
              required 
            />
          </div>
        </div>

        {/* Dates */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>Start Date</label>
            <input 
              type="date" 
              value={startDate} 
              onChange={(e) => setStartDate(e.target.value)} 
              required 
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <label style={{ fontSize: '0.65rem', color: 'var(--text-muted)', fontWeight: '600', textTransform: 'uppercase' }}>End Date</label>
            <input 
              type="date" 
              value={endDate} 
              onChange={(e) => setEndDate(e.target.value)} 
              required 
            />
          </div>
        </div>

        {/* Form Actions */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
          <button type="button" className="btn btn-secondary" onClick={onCancel} style={{ flex: 1, padding: '8px' }}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" style={{ flex: 1, padding: '8px' }}>
            Add Layer
          </button>
        </div>
      </form>
    </div>
  );
}

// MapView Container Component
export default function MapView({ projects, conflicts, conflictedIds, onAddProject, onRemoveProject, user }) {
  const [editMode, setEditMode] = useState(false);
  const [clickedLatLng, setClickedLatLng] = useState(null);
  const hasUser = !!user;

  const conflictsMap = useMemo(() => {
    const map = new Map();
    for (const c of conflicts) {
      const a = c.projectA.id;
      const b = c.projectB.id;
      if (!map.has(a)) map.set(a, []);
      if (!map.has(b)) map.set(b, []);
      map.get(a).push(c);
      map.get(b).push(c);
    }
    return map;
  }, [conflicts]);

  const handleMapClick = useCallback((latlng) => {
    setClickedLatLng(latlng);
  }, []);

  const handleFormSubmit = useCallback((newProject) => {
    onAddProject(newProject);
    setClickedLatLng(null);
  }, [onAddProject]);

  const handleFormCancel = useCallback(() => {
    setClickedLatLng(null);
  }, []);

  const getPathOptions = (proj, isConflicted, isCustom) => {
    const indicatorColor = departments[proj.department]?.indicator || '#6b7280';
    if (isConflicted) {
      return {
        color: '#EF4444',
        fillColor: indicatorColor,
        fillOpacity: 0.35,
        weight: 3,
        dashArray: '6 4',
        className: 'conflict-pulse-circle'
      };
    } else {
      return {
        color: isCustom ? '#fbbf24' : indicatorColor,
        fillColor: indicatorColor,
        fillOpacity: 0.2,
        weight: isCustom ? 3 : 2,
        dashArray: isCustom ? '4 3' : null
      };
    }
  };

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      {/* Editing Toolbar */}
      <div style={{
        position: 'absolute',
        top: '16px',
        left: '60px',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        {hasUser && (
          <button
            onClick={() => {
              setEditMode(!editMode);
              setClickedLatLng(null);
            }}
            className="btn"
            style={{
              backgroundColor: editMode ? 'var(--warning-bg)' : 'var(--bg-surface)',
              color: editMode ? 'var(--warning-text)' : 'var(--text-main)',
              border: `1px solid ${editMode ? 'var(--warning)' : 'var(--border-color)'}`,
              padding: '8px 14px',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.08)',
              gap: '8px',
              fontSize: '0.8rem'
            }}
          >
            <Pencil size={14} />
            {editMode ? '✏️ Draw Mode Active' : '✏️ Edit Map Layers'}
          </button>
        )}
        {editMode && (
          <span style={{
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'var(--warning-text)',
            backgroundColor: 'var(--warning-bg)',
            padding: '4px 10px',
            borderRadius: '4px',
            border: '1px solid var(--warning)'
          }}>
            Click anywhere on the map to add project buffer circle
          </span>
        )}
      </div>

      {/* Leaflet Map */}
      <MapContainer
        center={centerBhopal}
        zoom={zoomLevel}
        style={{ width: '100%', height: '100%' }}
        zoomControl={true}
      >
        <TileLayer
          attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
        />

        <MapClickEvents onMapClick={handleMapClick} editMode={editMode} />

        {projects.map((proj) => {
          const isConflicted = conflictedIds.has(proj.id);
          const isCustom = proj.id.startsWith('CUSTOM-');
          const conflictDetails = conflictsMap.get(proj.id) || [];
          const pathOptions = getPathOptions(proj, isConflicted, isCustom);
          
          // User permissions to delete custom layers
          const canDelete = user?.isAdmin || (isCustom && proj.department === user?.department);

          return (
            <Circle
              key={proj.id}
              center={[proj.coordinates.lat, proj.coordinates.lng]}
              radius={proj.radiusMeters}
              pathOptions={pathOptions}
            >
              <Popup maxWidth={360} className="custom-popup">
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {/* Title & Badge */}
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'start', 
                    borderBottom: '1px solid var(--border-color)', 
                    paddingBottom: '8px' 
                  }}>
                    <div>
                      <h4 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>{proj.title}</h4>
                      <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                        {proj.id} • {proj.wardName} {isCustom && <strong style={{ color: 'var(--warning)' }}>(Custom)</strong>}
                      </span>
                    </div>
                    <span 
                      className="badge" 
                      style={{ 
                        backgroundColor: departments[proj.department]?.bg || 'var(--bg-app)', 
                        color: departments[proj.department]?.text || 'var(--text-muted)'
                      }}
                    >
                      {departments[proj.department]?.label || proj.department}
                    </span>
                  </div>

                  {/* Metadata fields */}
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.8rem' }}>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Start: </span>
                      <strong style={{ color: 'var(--text-main)' }}>
                        {new Date(proj.startDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>End: </span>
                      <strong style={{ color: 'var(--text-main)' }}>
                        {new Date(proj.endDate).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                      </strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Budget: </span>
                      <strong style={{ color: 'var(--text-main)' }}>{formatBudget(proj.budget)}</strong>
                    </div>
                    <div>
                      <span style={{ color: 'var(--text-muted)' }}>Radius: </span>
                      <strong style={{ color: 'var(--text-main)' }}>{proj.radiusMeters}m</strong>
                    </div>
                  </div>

                  {/* Conflict Notice inside popup */}
                  {isConflicted && (
                    <div style={{
                      backgroundColor: 'var(--danger-bg)',
                      border: '1px solid var(--danger)',
                      borderRadius: '6px',
                      padding: '8px',
                      marginTop: '6px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '4px'
                    }}>
                      <div style={{ color: 'var(--danger-text)', fontWeight: '700', fontSize: '0.75rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ⚠️ Collision Warning
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        {conflictDetails.map((c) => (
                          <div key={c.conflictId} style={{ fontSize: '0.7rem', color: 'var(--text-main)', lineHeight: '1.3' }}>
                            • Overlaps with <strong>{c.projectA.id === proj.id ? c.projectB.title : c.projectA.title}</strong> in {c.wardName} ({c.overlapDays} days, {c.risk.level} level)
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Remove buttons inside popup */}
                  {editMode && canDelete && (
                    <button
                      onClick={() => onRemoveProject && onRemoveProject(proj.id)}
                      className="btn btn-danger"
                      style={{
                        padding: '6px 12px',
                        fontSize: '0.75rem',
                        marginTop: '8px',
                        width: '100%',
                        gap: '6px'
                      }}
                    >
                      <Trash2 size={13} />
                      Remove Layer Circle
                    </button>
                  )}
                </div>
              </Popup>
            </Circle>
          );
        })}
      </MapContainer>

      {/* Overlay Legend */}
      <MapLegend />

      {/* Click Form Overlay */}
      {clickedLatLng && (
        <AddCircleForm
          latlng={clickedLatLng}
          onSubmit={handleFormSubmit}
          onCancel={handleFormCancel}
          user={user}
        />
      )}
    </div>
  );
}
