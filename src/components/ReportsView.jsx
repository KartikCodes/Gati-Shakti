import React from 'react';
import { departments, formatBudget } from '../data/projectsData';
import { ShieldAlert, CheckCircle, BarChart3, TrendingUp } from 'lucide-react';

export default function ReportsView({ projects, conflicts }) {
  // Budget calculations
  const totalOutlay = projects.reduce((sum, p) => sum + p.budget, 0);

  // Group budgets and counts by department
  const deptStats = Object.entries(departments).map(([key, dept]) => {
    const list = projects.filter(p => p.department === key);
    const count = list.length;
    const budget = list.reduce((sum, p) => sum + p.budget, 0);
    return {
      key,
      label: dept.label,
      indicator: dept.indicator,
      count,
      budget
    };
  }).sort((a, b) => b.budget - a.budget);

  // Group projects by Ward
  const wardStats = projects.reduce((acc, p) => {
    acc[p.wardName] = (acc[p.wardName] || 0) + 1;
    return acc;
  }, {});

  const sortedWards = Object.entries(wardStats)
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Title */}
      <div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: '700', color: 'var(--text-main)' }}>Reports & Audit Logs</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '2px' }}>
          Infrastructure resource distribution, spatial project density analysis, and compliance audit reporting.
        </p>
      </div>

      {/* Grid of Report Visualizations */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
        gap: '24px'
      }}>
        
        {/* Budget Allocation Report */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BarChart3 size={18} style={{ color: 'var(--primary)' }} />
            Financial Outlay by Department
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {deptStats.map((stat) => {
              const percentage = totalOutlay > 0 ? (stat.budget / totalOutlay) * 100 : 0;
              return (
                <div key={stat.key} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: '500' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div style={{ width: '10px', height: '10px', borderRadius: '2px', backgroundColor: stat.indicator }} />
                      {stat.label}
                    </span>
                    <strong style={{ color: 'var(--text-main)' }}>{formatBudget(stat.budget)}</strong>
                  </div>
                  {/* Custom SVG Bar Chart */}
                  <div style={{ width: '100%', height: '18px', backgroundColor: 'var(--bg-app)', borderRadius: '4px', overflow: 'hidden', position: 'relative' }}>
                    <div style={{
                      width: `${percentage}%`,
                      height: '100%',
                      backgroundColor: stat.indicator,
                      borderRadius: '4px',
                      transition: 'width 0.5s ease',
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: '6px',
                      color: '#FFFFFF',
                      fontSize: '9px',
                      fontWeight: '700'
                    }}>
                      {percentage > 12 && `${percentage.toFixed(0)}%`}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Spatial Density Report (Wards) */}
        <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <TrendingUp size={18} style={{ color: 'var(--success)' }} />
            Spatial Project Density by Ward
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '280px', overflowY: 'auto', paddingRight: '4px' }}>
            {sortedWards.map((ward, idx) => {
              const maxCount = sortedWards[0]?.count || 1;
              const barPercent = (ward.count / maxCount) * 100;
              return (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: '12px', fontSize: '0.85rem' }}>
                  <span style={{ width: '120px', fontWeight: '600', color: 'var(--text-main)', truncate: 'true', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {ward.name}
                  </span>
                  <div style={{ flex: 1, height: '10px', backgroundColor: 'var(--bg-app)', borderRadius: '5px', overflow: 'hidden' }}>
                    <div style={{
                      width: `${barPercent}%`,
                      height: '100%',
                      backgroundColor: 'var(--primary)',
                      borderRadius: '5px',
                      transition: 'width 0.4s ease'
                    }} />
                  </div>
                  <span style={{ width: '24px', textAlign: 'right', fontWeight: '700', color: 'var(--text-muted)' }}>
                    {ward.count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* Compliance / GatiShakti Protocol Audit Card */}
      <div className="card" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: '700', color: 'var(--text-main)', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px' }}>
          GatiShakti System Compliance Log
        </h3>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
          
          <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: conflicts.length > 0 ? 'var(--warning-bg)' : 'var(--success-bg)',
            display: 'flex',
            gap: '12px'
          }}>
            <div style={{ color: conflicts.length > 0 ? 'var(--warning-text)' : 'var(--success-text)' }}>
              <ShieldAlert size={24} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: conflicts.length > 0 ? 'var(--warning-text)' : 'var(--success-text)' }}>
                {conflicts.length > 0 ? 'Active Overlaps Detected' : 'Clear System Authorization'}
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                {conflicts.length > 0 
                  ? `There are currently ${conflicts.length} unresolved scheduling conflicts. Proceeding without realignment will log GatiShakti Bypass events.`
                  : 'All current project layers satisfy the Ward-level space-time separation criteria.'
                }
              </p>
            </div>
          </div>

          <div style={{
            border: '1px solid var(--border-color)',
            borderRadius: '8px',
            padding: '16px',
            backgroundColor: 'var(--primary-light)',
            display: 'flex',
            gap: '12px'
          }}>
            <div style={{ color: 'var(--primary)' }}>
              <CheckCircle size={24} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <h4 style={{ fontSize: '0.85rem', fontWeight: '700', color: 'var(--primary)' }}>
                Geospatial Accuracy (MIS)
              </h4>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', lineHeight: '1.4' }}>
                100% of buffer zones are mapped as vector polygon layers (Circular Wards) satisfying the PM NMP standard (BISAG-N §2.4).
              </p>
            </div>
          </div>

        </div>
      </div>

    </div>
  );
}
