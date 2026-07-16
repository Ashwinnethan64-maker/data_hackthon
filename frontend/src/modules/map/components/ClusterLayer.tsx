import 'react-leaflet-cluster/dist/assets/MarkerCluster.css';
import 'react-leaflet-cluster/dist/assets/MarkerCluster.Default.css';
import L from 'leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import { Marker } from 'react-leaflet';
import type { MapIncident, CrimeCategory } from '../types';
import { IncidentPopup } from './IncidentPopup';

// ─── Crime marker configuration ──────────────────────────────────────────────
const CRIME_MARKER_CONFIG: Record<CrimeCategory, { color: string; glow: string; symbol: string }> = {
  'Murder':       { color: '#dc2626', glow: 'rgba(220,38,38,0.6)',   symbol: '💀' },
  'Robbery':      { color: '#ea580c', glow: 'rgba(234,88,12,0.6)',   symbol: '🔫' },
  'Burglary':     { color: '#d97706', glow: 'rgba(217,119,6,0.6)',   symbol: '🏚️' },
  'Cyber Crime':  { color: '#7c3aed', glow: 'rgba(124,58,237,0.6)',  symbol: '💻' },
  'Drug Crime':   { color: '#0891b2', glow: 'rgba(8,145,178,0.6)',   symbol: '💊' },
  'Kidnapping':   { color: '#be185d', glow: 'rgba(190,24,93,0.6)',   symbol: '⛓️' },
  'Fraud':        { color: '#1d4ed8', glow: 'rgba(29,78,216,0.6)',   symbol: '📄' },
  'Violence':     { color: '#b91c1c', glow: 'rgba(185,28,28,0.6)',   symbol: '⚠️' },
  'Traffic Crime':{ color: '#15803d', glow: 'rgba(21,128,61,0.6)',   symbol: '🚗' },
  'Theft':        { color: '#ca8a04', glow: 'rgba(202,138,4,0.6)',   symbol: '🎭' },
  'Extortion':    { color: '#9333ea', glow: 'rgba(147,51,234,0.6)',  symbol: '💰' },
  'Assault':      { color: '#ef4444', glow: 'rgba(239,68,68,0.6)',   symbol: '👊' },
};

function createCrimeIcon(category: CrimeCategory): L.DivIcon {
  const config = CRIME_MARKER_CONFIG[category] ?? CRIME_MARKER_CONFIG['Assault'];
  const html = `
    <div style="
      position: relative;
      width: 36px;
      height: 36px;
      display: flex;
      align-items: center;
      justify-content: center;
    ">
      <div style="
        position: absolute;
        inset: 0;
        border-radius: 50%;
        background: ${config.glow};
        animation: pulse 2.5s ease-in-out infinite;
      "></div>
      <div style="
        position: relative;
        z-index: 1;
        width: 28px;
        height: 28px;
        border-radius: 50%;
        background: ${config.color};
        border: 2px solid rgba(255,255,255,0.3);
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 14px;
        box-shadow: 0 4px 12px ${config.glow}, 0 0 0 1px ${config.color};
      ">
        ${config.symbol}
      </div>
    </div>
  `;

  return L.divIcon({
    html,
    className: 'crime-marker',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
    popupAnchor: [0, -20],
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
