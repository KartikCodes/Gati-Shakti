import React from 'react';
import { useAuth } from '../context/AuthContext';
import { departments } from '../data/projectsData';
import { 
  LayoutDashboard, 
  Map, 
  CalendarRange, 
  BarChart3, 
  LogOut,
  ShieldCheck,
  Building2
} from 'lucide-react';

export default function Sidebar({ currentTab, setCurrentTab, criticalConflictsCount }) {
  const { user, logout } = useAuth();

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'map', label: 'Map View', icon: Map },
    { id: 'timeline', label: 'Timeline View', icon: CalendarRange },
    { id: 'reports', label: 'Reports & Audit', icon: BarChart3 }
  ];

  const getDeptColor = (deptName) => {
    return departments[deptName]?.indicator || 'var(--primary)';
  };

  const getDeptLabel = (deptName) => {
    return departments[deptName]?.label || deptName;
  };

  return (
    <aside className="sidebar">
      {/* Brand Logo */}
      <div style={{
        padding: '24px 20px',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '36px',
          height: '36px',
          background: 'linear-gradient(135deg, var(--primary) 0%, #3B82F6 100%)',
          color: 'var(--text-white)',
          fontWeight: '700',
          fontSize: '1rem',
          borderRadius: '8px'
        }}>
          GS
        </div>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontWeight: '700', fontSize: '0.95rem', letterSpacing: '0.01em', lineHeight: '1.2' }}>GatiShakti Local</span>
          <span style={{ fontSize: '0.7rem', color: '#94A3B8', fontWeight: '500' }}>Bhopal Edition</span>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav style={{ flex: 1, padding: '20px 0' }}>
        {menuItems.map((item) => {
          const IconComponent = item.icon;
          const isActive = currentTab === item.id;
          return (
            <div
              key={item.id}
              onClick={() => setCurrentTab(item.id)}
              className={`nav-link ${isActive ? 'active' : ''}`}
            >
              <IconComponent size={18} />
              <span style={{ flex: 1 }}>{item.label}</span>
              {item.id === 'map' && criticalConflictsCount > 0 && (
                <span className="badge badge-danger" style={{ 
                  padding: '2px 6px', 
                  fontSize: '10px',
                  animation: 'pulse 1.5s infinite' 
                }}>
                  {criticalConflictsCount}
                </span>
              )}
            </div>
          );
        })}
      </nav>

      {/* Profile Section */}
      {user && (
        <div style={{
          padding: '16px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          backgroundColor: 'rgba(0, 0, 0, 0.15)',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: user.isAdmin ? 'var(--primary)' : getDeptColor(user.department)
            }}>
              {user.isAdmin ? <ShieldCheck size={18} /> : <Building2 size={18} />}
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
              <span style={{ 
                fontWeight: '600', 
                fontSize: '0.8rem', 
                color: 'var(--text-white)',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}>
                {user.isAdmin ? 'Administrator' : getDeptLabel(user.department)}
              </span>
              <span style={{ fontSize: '0.65rem', color: '#94A3B8' }}>
                {user.isAdmin ? 'Full System Access' : 'Dept. Planner'}
              </span>
            </div>
          </div>

          <button 
            onClick={logout} 
            className="btn btn-secondary" 
            style={{ 
              width: '100%', 
              padding: '6px 12px', 
              fontSize: '0.75rem',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              color: '#94A3B8',
              gap: '6px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = '#FFFFFF';
              e.currentTarget.style.backgroundColor = 'rgba(239, 68, 68, 0.15)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = '#94A3B8';
              e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)';
            }}
          >
            <LogOut size={13} />
            Logout Session
          </button>
        </div>
      )}
    </aside>
  );
}
