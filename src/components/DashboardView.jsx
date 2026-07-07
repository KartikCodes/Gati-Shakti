import React from 'react';
import { departments, formatBudget } from '../data/projectsData';
import { 
  Briefcase, 
  AlertTriangle, 
  Coins, 
  MapPin, 
  Calendar,
  Layers,
  ArrowRight
} from 'lucide-react';

export default function DashboardView({ projects, conflicts, customProjects, setCurrentTab }) {
  // Stat calculations
  const totalProjects = projects.length;
  const activeConflicts = conflicts.length;
  
  const totalBudget = projects.reduce((sum, p) => sum + p.budget, 0);
  const customCount = customProjects.length;

  // Group by department
  const deptSummary = Object.keys(departments).reduce((acc, key) => {
    acc[key] = {
      count: projects.filter(p => p.department === key).length,
      budget: projects.filter(p => p.department === key).reduce((sum, p) => sum + p.budget, 0)
    };
    return acc;
  }, {});

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      
      {/* Title Header */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>Overview Dashboard</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2px' }}>
          Real-time GIS integration and infrastructure overlap tracking system for Bhopal Ward Zones.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
        gap: '16px'
      }}>
        {/* Total Projects */}
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--primary-light)', color: 'var(--primary)' }}>
            <Briefcase size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{totalProjects}</span>
            <span className="stat-label">Active Projects</span>
          </div>
        </div>

        {/* Conflicts */}
        <div className="card stat-card" onClick={() => setCurrentTab('map')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ 
            backgroundColor: activeConflicts > 0 ? 'var(--danger-bg)' : 'var(--success-bg)', 
            color: activeConflicts > 0 ? 'var(--danger)' : 'var(--success)' 
          }}>
            <AlertTriangle size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{activeConflicts}</span>
            <span className="stat-label">Active Collisions</span>
          </div>
        </div>

        {/* Budget */}
        <div className="card stat-card">
          <div className="stat-icon" style={{ backgroundColor: 'var(--success-bg)', color: 'var(--success)' }}>
            <Coins size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{formatBudget(totalBudget)}</span>
            <span className="stat-label">Total Outlay</span>
          </div>
        </div>

        {/* Custom areas */}
        <div className="card stat-card" onClick={() => setCurrentTab('map')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon" style={{ backgroundColor: 'var(--purple-bg)', color: 'var(--purple)' }}>
            <Layers size={22} />
          </div>
          <div className="stat-info">
            <span className="stat-value">{customCount}</span>
            <span className="stat-label">Custom Layers</span>
          </div>
        </div>
      </div>

      {/* Main Grid Content */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Department distribution */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            Ministry & Department Allotments
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {Object.entries(departments).map(([key, dept]) => {
              const summary = deptSummary[key] || { count: 0, budget: 0 };
              const percent = totalProjects > 0 ? (summary.count / totalProjects) * 100 : 0;
              return (
                <div key={key} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.85rem' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: '600' }}>
                      <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dept.indicator }} />
                      {dept.label}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {summary.count} Project{summary.count !== 1 ? 's' : ''} ({formatBudget(summary.budget)})
                    </span>
                  </div>
                  {/* Progress bar */}
                  <div style={{ width: '100%', height: '6px', backgroundColor: 'var(--bg-app)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${percent}%`,
                      height: '100%',
                      backgroundColor: dept.indicator,
                      borderRadius: '3px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Project Quick List */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: '700', color: 'var(--text-main)' }}>
              Projects Master Directory
            </h3>
            <button 
              onClick={() => setCurrentTab('timeline')} 
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '4px',
                fontSize: '0.75rem',
                fontWeight: '600',
                color: 'var(--primary)',
                background: 'none',
                border: 'none',
                cursor: 'pointer'
              }}
            >
              Timeline Gantt <ArrowRight size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}>
            {projects.map((proj) => {
              const dept = departments[proj.department] || { bg: '#E2E8F0', text: '#475569', label: proj.department };
              const isCustom = proj.id.startsWith('CUSTOM-');
              return (
                <div 
                  key={proj.id} 
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '10px 12px',
                    borderRadius: '8px',
                    backgroundColor: 'var(--bg-app)',
                    border: '1px solid var(--border-color)'
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, flex: 1, marginRight: '12px' }}>
                    <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {proj.title}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <MapPin size={12} /> {proj.wardName}
                      </span>
                      <span>•</span>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                        <Calendar size={12} /> {proj.startDate}
                      </span>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'end', gap: '4px' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: '700', color: 'var(--text-main)' }}>
                      {formatBudget(proj.budget)}
                    </span>
                    <span 
                      className="badge" 
                      style={{ 
                        backgroundColor: isCustom ? '#FEF3C7' : dept.bg, 
                        color: isCustom ? '#D97706' : dept.text,
                        fontSize: '9px',
                        padding: '2px 6px'
                      }}
                    >
                      {isCustom ? 'Custom' : dept.label}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
