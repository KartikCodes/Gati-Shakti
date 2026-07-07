import React, { useMemo } from 'react';
import { departments, formatBudget } from '../data/projectsData';

const timelineStart = new Date("2026-07-01");
const timelineEnd = new Date("2027-01-01");
const totalTimelineDays = Math.ceil((timelineEnd.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));

function calculateMonthColumns() {
  const columns = [];
  const curr = new Date(timelineStart);

  while (curr < timelineEnd) {
    const label = curr.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
    const colStartDay = Math.ceil((curr.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
    
    // Find number of days in current month
    const year = curr.getFullYear();
    const month = curr.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const widthPercent = (daysInMonth / totalTimelineDays) * 100;

    columns.push({
      label,
      leftPercent: (colStartDay / totalTimelineDays) * 100,
      widthPercent
    });

    curr.setMonth(curr.getMonth() + 1);
  }
  return columns;
}

function getProjectTimelineCoords(project) {
  const pStart = new Date(project.startDate);
  const pEnd = new Date(project.endDate);

  const startClamp = pStart < timelineStart ? timelineStart : pStart;
  const endClamp = pEnd > timelineEnd ? timelineEnd : pEnd;

  const leftDays = Math.ceil((startClamp.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
  const durationDays = Math.ceil((endClamp.getTime() - startClamp.getTime()) / (1000 * 60 * 60 * 24));

  return {
    leftPercent: (leftDays / totalTimelineDays) * 100,
    widthPercent: Math.max((durationDays / totalTimelineDays) * 100, 0.5)
  };
}

export default function TimelineView({ projects, conflicts, conflictedIds }) {
  const monthColumns = useMemo(() => calculateMonthColumns(), []);

  const sortedProjects = useMemo(() => {
    return [...projects].sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [projects]);

  const overlapZones = useMemo(() => {
    return conflicts.map((c) => {
      const oStart = new Date(c.overlapStart);
      const oEnd = new Date(c.overlapEnd);
      
      const leftDays = Math.ceil((oStart.getTime() - timelineStart.getTime()) / (1000 * 60 * 60 * 24));
      const durationDays = Math.ceil((oEnd.getTime() - oStart.getTime()) / (1000 * 60 * 60 * 24));

      return {
        ...c,
        leftPercent: (leftDays / totalTimelineDays) * 100,
        widthPercent: (durationDays / totalTimelineDays) * 100
      };
    });
  }, [conflicts]);

  return (
    <div style={{ width: '100%', height: '100%', backgroundColor: 'var(--bg-app)', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
      
      {/* Timeline view header */}
      <div style={{
        backgroundColor: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-color)',
        padding: '16px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '4px'
      }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: '700', color: 'var(--text-main)' }}>Project Master Schedules</h2>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.8rem' }}>
          July 2026 — December 2026 · {sortedProjects.length} Active project tracks · Vertical red shading highlights schedule overlap collisions.
        </p>
      </div>

      {/* Gantt Grid Container */}
      <div style={{ flex: 1, overflow: 'auto', padding: '24px' }}>
        <div style={{
          position: 'relative',
          border: '1px solid var(--border-color)',
          borderRadius: '12px',
          backgroundColor: 'var(--bg-surface)',
          padding: '20px',
          minWidth: '760px',
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.02)'
        }}>
          
          {/* Timeline Grid Header (Months Columns) */}
          <div style={{
            position: 'relative',
            height: '44px',
            borderBottom: '1px solid var(--border-color)',
            marginBottom: '16px',
            display: 'flex'
          }}>
            {/* Header placeholder for labels column */}
            <div style={{ width: '280px', flexShrink: 0 }} />
            
            {/* Months */}
            <div style={{ flex: 1, position: 'relative', height: '100%' }}>
              {monthColumns.map((col, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: `${col.leftPercent}%`,
                    width: `${col.widthPercent}%`,
                    height: '100%',
                    borderLeft: '1px solid var(--border-color)',
                    paddingLeft: '8px',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  {col.label}
                </div>
              ))}
            </div>
          </div>

          {/* Gantt Rows and Overlaps */}
          <div style={{ position: 'relative' }}>
            
            {/* Overlap background bands */}
            <div style={{ position: 'absolute', top: 0, bottom: 0, left: '280px', right: 0, pointerEvents: 'none', zIndex: 1 }}>
              {overlapZones.map((zone, idx) => (
                <div
                  key={idx}
                  style={{
                    position: 'absolute',
                    left: `${zone.leftPercent}%`,
                    width: `${zone.widthPercent}%`,
                    height: '100%',
                    backgroundColor: 'rgba(239, 68, 68, 0.06)',
                    borderLeft: '1px dashed rgba(239, 68, 68, 0.2)',
                    borderRight: '1px dashed rgba(239, 68, 68, 0.2)'
                  }}
                />
              ))}
            </div>

            {/* Gantt rows */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', position: 'relative', zIndex: 5 }}>
              {sortedProjects.map((proj) => {
                const { leftPercent, widthPercent } = getProjectTimelineCoords(proj);
                const hasConflict = conflictedIds.has(proj.id);
                const indicatorColor = departments[proj.department]?.indicator || '#6b7280';
                const isCustom = proj.id.startsWith('CUSTOM-');

                return (
                  <div key={proj.id} style={{ display: 'flex', alignItems: 'center', height: '48px' }}>
                    {/* Left label column */}
                    <div style={{ width: '280px', display: 'flex', alignItems: 'center', gap: '10px', flexShrink: 0, paddingRight: '16px' }}>
                      <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, flex: 1 }}>
                        <span style={{ fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-main)', truncate: 'true', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {proj.title}
                        </span>
                        <span style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>
                          {proj.id} • {proj.department} • {formatBudget(proj.budget)}
                        </span>
                      </div>
                      {hasConflict && (
                        <span style={{ fontSize: '1.1rem', cursor: 'help' }} title="Schedule collision detected!">
                          ⚠️
                        </span>
                      )}
                    </div>

                    {/* Right schedule column */}
                    <div style={{ flex: 1, position: 'relative', height: '100%', display: 'flex', alignItems: 'center' }}>
                      <div
                        style={{
                          position: 'absolute',
                          left: `${leftPercent}%`,
                          width: `${widthPercent}%`,
                          height: '28px',
                          borderRadius: '6px',
                          backgroundColor: indicatorColor,
                          opacity: hasConflict ? 0.95 : 0.75,
                          border: hasConflict ? '2px solid var(--danger)' : isCustom ? '2.5px dashed #F59E0B' : 'none',
                          boxShadow: hasConflict ? '0 0 8px rgba(239, 68, 68, 0.3)' : 'none',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: '#FFFFFF',
                          fontSize: '0.65rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.15s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.height = '32px';
                          e.currentTarget.style.opacity = '1';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.height = '28px';
                          e.currentTarget.style.opacity = hasConflict ? '0.95' : '0.75';
                        }}
                      >
                        {widthPercent > 6 && proj.id}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      </div>
    </div>
  );
}
