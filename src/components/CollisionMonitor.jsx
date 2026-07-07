import React, { useState, useMemo } from 'react';
import { departments } from '../data/projectsData';
import { X, SortAsc, SortDesc, Filter, AlertOctagon, HelpCircle } from 'lucide-react';

const riskClasses = {
  CRITICAL: 'badge-danger',
  HIGH: 'badge-warning',
  MODERATE: 'badge-info'
};

export default function CollisionMonitor({ conflicts, onClose }) {
  const [filterLevel, setFilterLevel] = useState('ALL');
  const [sortBy, setSortBy] = useState('severity'); // 'severity' or 'days'

  // Summary counts
  const summary = useMemo(() => {
    const critical = conflicts.filter(c => c.risk.level === 'CRITICAL').length;
    const high = conflicts.filter(c => c.risk.level === 'HIGH').length;
    const moderate = conflicts.filter(c => c.risk.level === 'MODERATE').length;
    const totalDays = conflicts.reduce((sum, c) => sum + c.overlapDays, 0);

    return { critical, high, moderate, totalDays };
  }, [conflicts]);

  // Filtered and Sorted conflicts list
  const processedConflicts = useMemo(() => {
    let result = conflicts;
    
    // Filter
    if (filterLevel !== 'ALL') {
      result = conflicts.filter(c => c.risk.level === filterLevel);
    }

    // Sort
    return [...result].sort((a, b) => {
      if (sortBy === 'severity') {
        const severityRank = { CRITICAL: 0, HIGH: 1, MODERATE: 2 };
        const diff = (severityRank[a.risk.level] ?? 3) - (severityRank[b.risk.level] ?? 3);
        if (diff !== 0) return diff;
        return b.overlapDays - a.overlapDays; // Tie-breaker: longer overlap first
      } else {
        return b.overlapDays - a.overlapDays; // Sort by days descending
      }
    });
  }, [conflicts, filterLevel, sortBy]);

  const filterTabs = [
    { key: 'ALL', label: 'All', color: 'var(--text-muted)' },
    { key: 'CRITICAL', label: `Critical (${summary.critical})`, color: 'var(--danger)' },
    { key: 'HIGH', label: `High (${summary.high})`, color: 'var(--warning)' },
    { key: 'MODERATE', label: `Mod. (${summary.moderate})`, color: 'var(--info)' }
  ];

  return (
    <aside className="collision-panel">
      {/* Panel Header */}
      <div className="collision-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertOctagon size={18} style={{ color: conflicts.length > 0 ? 'var(--danger)' : 'var(--success)' }} />
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)' }}>Planning Collisions</h3>
        </div>
        <button 
          onClick={onClose} 
          style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}
          title="Close Panel"
        >
          <X size={18} />
        </button>
      </div>

      {/* Overview stats */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: 'var(--bg-app)',
        borderBottom: '1px solid var(--border-color)',
        display: 'flex',
        flexDirection: 'column',
        gap: '12px'
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600' }}>
          <span style={{ color: 'var(--text-muted)' }}>Active Collisions:</span>
          <span style={{ color: conflicts.length > 0 ? 'var(--danger)' : 'var(--success)' }}>
            {conflicts.length} Overlaps
          </span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', fontWeight: '600' }}>
          <span style={{ color: 'var(--text-muted)' }}>Cumulative Delay Risk:</span>
          <span style={{ color: 'var(--text-main)' }}>{summary.totalDays} Days</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div style={{
        display: 'flex',
        padding: '10px 16px',
        borderBottom: '1px solid var(--border-color)',
        gap: '6px',
        overflowX: 'auto'
      }}>
        {filterTabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setFilterLevel(tab.key)}
            style={{
              padding: '6px 10px',
              borderRadius: '6px',
              fontSize: '0.7rem',
              fontWeight: '700',
              cursor: 'pointer',
              border: '1px solid',
              backgroundColor: filterLevel === tab.key ? 'var(--primary-light)' : 'var(--bg-surface)',
              borderColor: filterLevel === tab.key ? 'var(--primary)' : 'var(--border-color)',
              color: filterLevel === tab.key ? 'var(--primary)' : tab.color,
              whiteSpace: 'nowrap'
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Sorting Control */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '8px 20px',
        borderBottom: '1px solid var(--border-color)',
        fontSize: '0.75rem',
        color: 'var(--text-muted)'
      }}>
        <span>Showing {processedConflicts.length} item{processedConflicts.length !== 1 ? 's' : ''}</span>
        <button
          onClick={() => setSortBy(sortBy === 'severity' ? 'days' : 'severity')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            background: 'none',
            border: 'none',
            color: 'var(--primary)',
            fontWeight: '600',
            cursor: 'pointer'
          }}
        >
          {sortBy === 'severity' ? <SortAsc size={12} /> : <SortDesc size={12} />}
          Sort: {sortBy === 'severity' ? 'Severity' : 'Overlap Days'}
        </button>
      </div>

      {/* Conflicts List */}
      <div className="conflict-list">
        {processedConflicts.length === 0 ? (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            height: '200px',
            textAlign: 'center',
            padding: '20px'
          }}>
            <span style={{ fontSize: '2rem', marginBottom: '8px' }}>✅</span>
            <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--text-main)' }}>
              {filterLevel === 'ALL' ? 'No planning collisions detected.' : `No ${filterLevel.toLowerCase()} conflicts.`}
            </h4>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
              All projects are scheduled without ward-level space/time conflicts.
            </p>
          </div>
        ) : (
          processedConflicts.map((c) => {
            const deptA = departments[c.projectA.department]?.label || c.projectA.department;
            const deptB = departments[c.projectB.department]?.label || c.projectB.department;

            return (
              <div key={c.conflictId} className="conflict-card">
                {/* Severity pill */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <span className={`badge ${riskClasses[c.risk.level]}`}>
                    {c.risk.level}
                  </span>
                  <span style={{ fontSize: '0.7rem', color: 'var(--text-light)', fontWeight: '600' }}>
                    {c.conflictId}
                  </span>
                </div>

                {/* Overlapping Projects */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '0.8rem' }}>
                  <div>
                    <span style={{ fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{deptA}:</span>
                    <div style={{ color: 'var(--text-main)', fontWeight: '600', marginTop: '1px' }}>{c.projectA.title}</div>
                  </div>
                  <div style={{ height: '1px', backgroundColor: 'var(--border-color)', margin: '2px 0' }} />
                  <div>
                    <span style={{ fontWeight: '500', color: 'var(--text-muted)', fontSize: '0.75rem' }}>{deptB}:</span>
                    <div style={{ color: 'var(--text-main)', fontWeight: '600', marginTop: '1px' }}>{c.projectB.title}</div>
                  </div>
                </div>

                {/* Overlap parameters */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '8px',
                  marginTop: '10px',
                  fontSize: '0.75rem',
                  color: 'var(--text-muted)',
                  backgroundColor: 'var(--bg-app)',
                  padding: '6px 8px',
                  borderRadius: '6px'
                }}>
                  <div>
                    <span>Ward: </span>
                    <strong style={{ color: 'var(--text-main)' }}>{c.wardName}</strong>
                  </div>
                  <div>
                    <span>Overlap: </span>
                    <strong style={{ color: 'var(--danger-text)' }}>{c.overlapDays} Days</strong>
                  </div>
                </div>

                {/* Bypass disclaimer */}
                <div style={{
                  marginTop: '10px',
                  fontSize: '0.65rem',
                  color: 'var(--text-muted)',
                  borderLeft: '2px solid var(--text-light)',
                  paddingLeft: '6px',
                  lineHeight: '1.3'
                }}>
                  {c.auditNote}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}
