import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Marker } from 'react-leaflet';
import type { MapIncident, CrimeCategory } from '../types';
import { IncidentPopup } from './IncidentPopup';

// ─── Crime marker configuration ──────────────────────────────────────────────
// ─── Crime marker configuration with SVG Icons ──────────────────────────────
const CRIME_MARKER_CONFIG: Record<CrimeCategory, { color: string; glow: string; svg: string }> = {
  'Murder': {
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.6)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>`,
  },
  'Robbery': {
    color: '#f97316',
    glow: 'rgba(249,115,22,0.6)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`,
  },
  'Burglary': {
    color: '#f59e0b',
    glow: 'rgba(245,158,11,0.6)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>`,
  },
  'Cyber Crime': {
    color: '#a855f7',
    glow: 'rgba(168,85,247,0.6)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>`,
  },
  'Drug Crime': {
    color: '#06b6d4',
    glow: 'rgba(6,182,212,0.6)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`,
  },
  'Kidnapping': {
    color: '#ec4899',
    glow: 'rgba(236,72,153,0.6)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
  },
  'Fraud': {
    color: '#3b82f6',
    glow: 'rgba(59,130,246,0.6)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z"/><polyline points="14 2 14 8 20 8"/></svg>`,
  },
  'Violence': {
    color: '#dc2626',
    glow: 'rgba(220,38,38,0.6)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>`,
  },
  'Traffic Crime': {
    color: '#10b981',
    glow: 'rgba(16,185,129,0.6)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="1" y="3" width="15" height="13"/><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/></svg>`,
  },
  'Theft': {
    color: '#eab308',
    glow: 'rgba(234,179,8,0.6)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
  },
  'Extortion': {
    color: '#8b5cf6',
    glow: 'rgba(139,92,246,0.6)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>`,
  },
  'Assault': {
    color: '#ef4444',
    glow: 'rgba(239,68,68,0.6)',
    svg: `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><path d="m4.93 4.93 14.14 14.14"/></svg>`,
  },
};

function createCrimeIcon(category: CrimeCategory): L.DivIcon {
  const config = CRIME_MARKER_CONFIG[category] ?? CRIME_MARKER_CONFIG['Assault'];
  const html = `
    <div style="
      position: relative;
      width: 34px;
      height: 34px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        inset: -2px;
        border-radius: 50%;
        background: ${config.glow};
        filter: blur(4px);
        opacity: 0.8;
      "></div>
      <div style="
        position: relative;
        z-index: 1;
        width: 30px;
        height: 30px;
        border-radius: 50%;
        background: #0f172a;
        border: 2px solid ${config.color};
        color: ${config.color};
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 0 12px ${config.glow};
      ">
        ${config.svg}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'crime-marker-custom',
    iconSize: [34, 34],
    iconAnchor: [17, 17],
    popupAnchor: [0, -18],
  });
}

function createCustomClusterIcon(cluster: any): L.DivIcon {
  const count = cluster.getChildCount();
  let size = 36;
  let bgGradient = 'linear-gradient(135deg, #1e3a8a 0%, #3b82f6 100%)';
  let border = '#60a5fa';
  let glow = 'rgba(59, 130, 246, 0.5)';

  if (count > 10) {
    size = 42;
    bgGradient = 'linear-gradient(135deg, #7c2d12 0%, #ea580c 100%)';
    border = '#fb923c';
    glow = 'rgba(234, 88, 12, 0.6)';
  }
  if (count > 25) {
    size = 48;
    bgGradient = 'linear-gradient(135deg, #881337 0%, #e11d48 100%)';
    border = '#fda4af';
    glow = 'rgba(225, 29, 72, 0.7)';
  }

  const html = `
    <div style="
      width: ${size}px;
      height: ${size}px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
      background: ${bgGradient};
      border: 2px solid ${border};
      color: #ffffff;
      font-weight: 700;
      font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
      font-size: ${size > 40 ? 14 : 12}px;
      box-shadow: 0 0 15px ${glow}, 0 4px 6px rgba(0, 0, 0, 0.4);
      letter-spacing: -0.5px;
    ">
      ${count}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'crime-cluster-custom',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
  });
}

interface ClusterLayerProps {
  incidents: MapIncident[];
  onSelect: (incident: MapIncident) => void;
}

export function ClusterLayer({ incidents, onSelect }: ClusterLayerProps) {
  return (
    <MarkerClusterGroup
      chunkedLoading
      showCoverageOnHover={false}
      maxClusterRadius={60}
      spiderfyOnMaxZoom
      iconCreateFunction={createCustomClusterIcon}
    >
      {incidents.map((incident) => (
        <Marker
          key={incident.id}
          position={[incident.lat, incident.lng]}
          icon={createCrimeIcon(incident.category)}
          eventHandlers={{
            click: () => onSelect(incident),
          }}
        >
          <IncidentPopup incident={incident} />
        </Marker>
      ))}
    </MarkerClusterGroup>
  );
}
