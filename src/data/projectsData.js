export const departments = {
  PWD: {
    bg: '#FFEDD5',
    text: '#9A3412',
    border: '#FDBA74',
    indicator: '#F97316',
    label: 'PWD'
  },
  'BMC/AMRUT': {
    bg: '#D1EAE0',
    text: '#0F5132',
    border: '#A3E635',
    indicator: '#10B981',
    label: 'BMC/AMRUT'
  },
  Metro: {
    bg: '#DBEAFE',
    text: '#1E40AF',
    border: '#93C5FD',
    indicator: '#3B82F6',
    label: 'Metro Rail'
  },
  'Smart City/NCAP': {
    bg: '#F3E8FF',
    text: '#6B21A8',
    border: '#D8B4FE',
    indicator: '#A855F7',
    label: 'Smart City'
  }
};

export const defaultProjects = [
  {
    id: "P-001",
    title: "MP Nagar Zone-I Flyover Widening",
    department: "PWD",
    wardName: "MP Nagar",
    radiusMeters: 450,
    coordinates: { lat: 23.2332, lng: 77.4272 },
    startDate: "2026-07-15",
    endDate: "2026-11-30",
    budget: 18500000
  },
  {
    id: "P-002",
    title: "Arera Colony Sewage Network Upgrade",
    department: "BMC/AMRUT",
    wardName: "Arera Colony",
    radiusMeters: 350,
    coordinates: { lat: 23.2401, lng: 77.4355 },
    startDate: "2026-08-01",
    endDate: "2026-12-15",
    budget: 7200000
  },
  {
    id: "P-003",
    title: "Metro Purple Line — MP Nagar Station Works",
    department: "Metro",
    wardName: "MP Nagar",
    radiusMeters: 600,
    coordinates: { lat: 23.231, lng: 77.4305 },
    startDate: "2026-08-20",
    endDate: "2026-10-31",
    budget: 42000000
  },
  {
    id: "P-004",
    title: "Indrapuri Main Road Resurfacing",
    department: "PWD",
    wardName: "Indrapuri",
    radiusMeters: 300,
    coordinates: { lat: 23.2685, lng: 77.4082 },
    startDate: "2026-07-01",
    endDate: "2026-09-30",
    budget: 5600000
  },
  {
    id: "P-005",
    title: "AMRUT Water Pipeline — Hoshangabad Road Sector",
    department: "BMC/AMRUT",
    wardName: "Hoshangabad Road",
    radiusMeters: 500,
    coordinates: { lat: 23.2103, lng: 77.442 },
    startDate: "2026-09-01",
    endDate: "2026-12-31",
    budget: 15800000
  },
  {
    id: "P-006",
    title: "Smart City NCAP Air Quality Monitoring Stations",
    department: "Smart City/NCAP",
    wardName: "TT Nagar",
    radiusMeters: 200,
    coordinates: { lat: 23.2456, lng: 77.412 },
    startDate: "2026-10-01",
    endDate: "2026-11-15",
    budget: 3200000
  },
  {
    id: "P-007",
    title: "Smart Road & EV Charging Hub — Hoshangabad Rd",
    department: "Smart City/NCAP",
    wardName: "Hoshangabad Road",
    radiusMeters: 400,
    coordinates: { lat: 23.2088, lng: 77.445 },
    startDate: "2026-09-15",
    endDate: "2026-11-30",
    budget: 9500000
  },
  {
    id: "P-008",
    title: "Indrapuri Stormwater Drain Construction",
    department: "BMC/AMRUT",
    wardName: "Indrapuri",
    radiusMeters: 350,
    coordinates: { lat: 23.27, lng: 77.406 },
    startDate: "2026-08-10",
    endDate: "2026-10-20",
    budget: 6100000
  }
];

export const centerBhopal = [23.2599, 77.4126];
export const zoomLevel = 13;

export function formatBudget(value) {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(1)} Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(1)} L`;
  }
  return `₹${value.toLocaleString('en-IN')}`;
}

export function checkOverlap(startA, endA, startB, endB) {
  const sA = new Date(startA);
  const eA = new Date(endA);
  const sB = new Date(startB);
  const eB = new Date(endB);

  if (sA >= eB || sB >= eA) {
    return { overlaps: false };
  }

  const overlapStart = sA > sB ? sA : sB;
  const overlapEnd = eA < eB ? eA : eB;

  return {
    overlaps: true,
    overlapStart,
    overlapEnd
  };
}

export function getOverlapDays(start, end) {
  const diffTime = end.getTime() - start.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

export function getRiskDetails(days) {
  if (days >= 60) {
    return {
      level: 'CRITICAL',
      label: '🔴 Red Flag — Critical Overlap',
      color: '#ef4444',
      bgClass: 'badge-danger'
    };
  } else if (days >= 30) {
    return {
      level: 'HIGH',
      label: '🟠 High Risk — Significant Overlap',
      color: '#f97316',
      bgClass: 'badge-warning'
    };
  } else {
    return {
      level: 'MODERATE',
      label: '🟡 Moderate Risk — Short Overlap',
      color: '#f59e0b',
      bgClass: 'badge-info'
    };
  }
}

export function calculateConflicts(projects) {
  const conflicts = [];
  let conflictCounter = 0;

  for (let i = 0; i < projects.length; i++) {
    for (let j = i + 1; j < projects.length; j++) {
      const pA = projects[i];
      const pB = projects[j];

      // Conflicts are calculated at the ward level
      if (pA.wardName.toLowerCase().trim() !== pB.wardName.toLowerCase().trim()) {
        continue;
      }

      const { overlaps, overlapStart, overlapEnd } = checkOverlap(
        pA.startDate,
        pA.endDate,
        pB.startDate,
        pB.endDate
      );

      if (!overlaps) {
        continue;
      }

      conflictCounter++;
      const overlapDays = getOverlapDays(overlapStart, overlapEnd);
      const risk = getRiskDetails(overlapDays);

      conflicts.push({
        conflictId: `CONFLICT-${String(conflictCounter).padStart(3, '0')}`,
        projectA: { id: pA.id, title: pA.title, department: pA.department },
        projectB: { id: pB.id, title: pB.title, department: pB.department },
        wardName: pA.wardName,
        overlapStart: overlapStart.toISOString().split('T')[0],
        overlapEnd: overlapEnd.toISOString().split('T')[0],
        overlapDays,
        risk,
        auditNote: "Warning: Overlap detected. Proceeding without resolution logs a digital bypass event under GatiShakti Accountability Protocol §4.2."
      });
    }
  }

  return conflicts;
}

export function getConflictedProjectIds(conflicts) {
  const ids = new Set();
  for (const c of conflicts) {
    ids.add(c.projectA.id);
    ids.add(c.projectB.id);
  }
  return ids;
}
