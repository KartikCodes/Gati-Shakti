import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuth, AuthProvider } from './context/AuthContext';
import { 
  defaultProjects, 
  calculateConflicts, 
  getConflictedProjectIds,
  departments
} from './data/projectsData';

// Component Imports
import Login from './components/Login';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import MapView from './components/MapView';
import TimelineView from './components/TimelineView';
import ReportsView from './components/ReportsView';
import CollisionMonitor from './components/CollisionMonitor';

import { 
  Search, 
  Bell, 
  ChevronRight, 
  ChevronLeft,
  Filter,
  User,
  ShieldCheck,
  Building2
} from 'lucide-react';

function DashboardLayout() {
  const { user } = useAuth();
  
  // Tab Navigation State: 'dashboard', 'map', 'timeline', 'reports'
  const [currentTab, setCurrentTab] = useState('dashboard');
  
  // Right Collision Sidebar Open/Close State
  const [showSidebar, setShowSidebar] = useState(true);

  // Department filter for the top bar (only visible to Admin)
  const [deptFilter, setDeptFilter] = useState('ALL');

  // Search input state
  const [searchText, setSearchText] = useState('');

  // Custom projects created in the current session
  const [customProjects, setCustomProjects] = useState(() => {
    try {
      const stored = localStorage.getItem('gs_custom_projects');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  // Custom project ID counter
  const [customIdCounter, setCustomIdCounter] = useState(() => {
    try {
      const stored = localStorage.getItem('gs_custom_id_counter');
      return stored ? parseInt(stored, 10) : 0;
    } catch {
      return 0;
    }
  });

  // Save custom projects and counter changes
  useEffect(() => {
    localStorage.setItem('gs_custom_projects', JSON.stringify(customProjects));
  }, [customProjects]);

  useEffect(() => {
    localStorage.setItem('gs_custom_id_counter', String(customIdCounter));
  }, [customIdCounter]);

  // Combined Projects list
  const allProjects = useMemo(() => {
    return [...defaultProjects, ...customProjects];
  }, [customProjects]);

  // User-scoped projects list (non-admins only see their department)
  const userFilteredProjects = useMemo(() => {
    if (!user || user.isAdmin) return allProjects;
    return allProjects.filter(p => p.department === user.department);
  }, [allProjects, user]);

  // Combined overlaps/conflicts calculations
  const allConflicts = useMemo(() => {
    return calculateConflicts(allProjects);
  }, [allProjects]);

  // User-scoped conflicts list (non-admins only see conflicts involving their department)
  const userFilteredConflicts = useMemo(() => {
    if (!user || user.isAdmin) return allConflicts;
    return allConflicts.filter(c => 
      c.projectA.department === user.department || 
      c.projectB.department === user.department
    );
  }, [allConflicts, user]);

  // Conflicted Project IDs in the scope of current user
  const conflictedProjectIds = useMemo(() => {
    return getConflictedProjectIds(userFilteredConflicts);
  }, [userFilteredConflicts]);

  // Counts of critical level conflicts
  const criticalConflictsCount = useMemo(() => {
    return userFilteredConflicts.filter(c => c.risk.level === 'CRITICAL').length;
  }, [userFilteredConflicts]);

  // Filtering projects based on the top bar department filter and search bar queries
  const processedProjects = useMemo(() => {
    let result = userFilteredProjects;

    // Apply Top Bar Department Filter (if Admin)
    if (user?.isAdmin && deptFilter !== 'ALL') {
      result = result.filter(p => p.department === deptFilter);
    }

    // Apply Search Filter (by title or ward)
    if (searchText.trim() !== '') {
      const query = searchText.toLowerCase().trim();
      result = result.filter(p => 
        p.title.toLowerCase().includes(query) || 
        p.wardName.toLowerCase().includes(query) ||
        p.id.toLowerCase().includes(query)
      );
    }

    return result;
  }, [userFilteredProjects, deptFilter, searchText, user]);

  // Callback to add a new custom circle project
  const handleAddProject = useCallback((projectData) => {
    const nextId = customIdCounter + 1;
    const newProject = {
      ...projectData,
      id: `CUSTOM-${String(nextId).padStart(3, '0')}`
    };
    setCustomProjects(prev => [...prev, newProject]);
    setCustomIdCounter(nextId);
  }, [customIdCounter]);

  // Callback to remove a custom project
  const handleRemoveProject = useCallback((id) => {
    setCustomProjects(prev => prev.filter(p => p.id !== id));
  }, []);

  return (
    <div className="app-container">
      {/* Sidebar Panel */}
      <Sidebar 
        currentTab={currentTab} 
        setCurrentTab={setCurrentTab} 
        criticalConflictsCount={criticalConflictsCount} 
      />

      {/* Main Panel Content Area */}
      <div className="main-content">
        {/* Top Header */}
        <header>
          {/* Left search bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: '1', maxWidth: '360px' }}>
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                placeholder="Search projects, wards, or IDs..."
                value={searchText}
                onChange={(e) => setSearchText(e.target.value)}
                style={{
                  paddingLeft: '36px',
                  backgroundColor: 'var(--bg-app)',
                  border: '1px solid var(--border-color)',
                  height: '38px',
                  fontSize: '0.8rem'
                }}
              />
              <Search 
                size={16} 
                style={{ 
                  position: 'absolute', 
                  left: '12px', 
                  top: '50%', 
                  transform: 'translateY(-50%)', 
                  color: 'var(--text-light)' 
                }} 
              />
            </div>
          </div>

          {/* Department Quick Filter for Admin */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {user?.isAdmin && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ fontSize: '0.75rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                  Filter:
                </span>
                <select 
                  value={deptFilter} 
                  onChange={(e) => setDeptFilter(e.target.value)}
                  style={{
                    padding: '6px 12px',
                    fontSize: '0.75rem',
                    height: '34px',
                    borderColor: 'var(--border-color)',
                    width: '140px'
                  }}
                >
                  <option value="ALL">🏛️ All Ministries</option>
                  {Object.entries(departments).map(([key, value]) => (
                    <option key={key} value={key}>
                      {value.label}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Collision Sidebar toggler */}
            <button
              onClick={() => setShowSidebar(!showSidebar)}
              className="btn btn-secondary"
              style={{
                position: 'relative',
                padding: '8px 12px',
                height: '38px',
                borderColor: 'var(--border-color)',
                fontSize: '0.75rem',
                fontWeight: '600',
                gap: '6px'
              }}
            >
              <Bell size={14} style={{ color: userFilteredConflicts.length > 0 ? 'var(--danger)' : 'var(--text-muted)' }} />
              <span>Collisions</span>
              {userFilteredConflicts.length > 0 && (
                <span className="badge badge-danger" style={{ padding: '2px 6px', fontSize: '9px' }}>
                  {userFilteredConflicts.length}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Dynamic Views Pane */}
        <div className="view-container">
          <main className="content-pane">
            {currentTab === 'dashboard' && (
              <DashboardView 
                projects={processedProjects} 
                conflicts={userFilteredConflicts} 
                customProjects={customProjects}
                setCurrentTab={setCurrentTab}
              />
            )}
            
            {currentTab === 'map' && (
              <MapView 
                projects={processedProjects} 
                conflicts={userFilteredConflicts} 
                conflictedIds={conflictedProjectIds}
                onAddProject={handleAddProject}
                onRemoveProject={handleRemoveProject}
                user={user}
              />
            )}

            {currentTab === 'timeline' && (
              <TimelineView 
                projects={processedProjects} 
                conflicts={userFilteredConflicts} 
                conflictedIds={conflictedProjectIds}
              />
            )}

            {currentTab === 'reports' && (
              <ReportsView 
                projects={processedProjects} 
                conflicts={userFilteredConflicts} 
              />
            )}
          </main>

          {/* Right Collapsible Panel */}
          {showSidebar && (
            <CollisionMonitor 
              conflicts={userFilteredConflicts} 
              onClose={() => setShowSidebar(false)} 
            />
          )}
        </div>

        {/* Footer info bar */}
        <footer style={{
          height: '32px',
          backgroundColor: 'var(--bg-surface)',
          borderTop: '1px solid var(--border-color)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 24px',
          fontSize: '0.7rem',
          color: 'var(--text-light)',
          fontWeight: '500',
          zIndex: 40
        }}>
          <div>
            Showing {processedProjects.length} project{processedProjects.length !== 1 ? 's' : ''} · {userFilteredConflicts.length} active collision{userFilteredConflicts.length !== 1 ? 's' : ''} · {customProjects.length} custom layers
          </div>
          <div>
            Portal Status: Operational · MIS Engine: v2.0 · {new Date().toLocaleDateString('en-IN')}
          </div>
        </footer>
      </div>
    </div>
  );
}

function MainApp() {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <DashboardLayout /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
