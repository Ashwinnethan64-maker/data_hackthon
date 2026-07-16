import { MapContainer, TileLayer, ZoomControl } from 'react-leaflet';
import { useMemo } from 'react';
import type { MapIncident } from '../types';
import { ClusterLayer } from './ClusterLayer';
import { HeatmapLayer } from './HeatmapLayer';
import 'leaflet/dist/leaflet.css';

// Karnataka center
const KARNATAKA_CENTER: [number, number] = [15.3173, 75.7139];
const INITIAL_ZOOM = 7;

const TILE_LAYERS = {
  standard: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://carto.com/attributions">CARTO</a>',
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; <a href="https://www.esri.com/">Esri</a>',
  },
};

interface CrimeMapProps {
  incidents: MapIncident[];
  showHeatmap: boolean;
  mapType: 'standard' | 'satellite';
  onSelectIncident: (incident: MapIncident) => void;
}

export function CrimeMap({ incidents, showHeatmap, mapType, onSelectIncident }: CrimeMapProps) {
  const tileLayer = TILE_LAYERS[mapType];

  const heatmapPoints = useMemo<[number, number, number][]>(
    () => incidents.map((inc) => {
      const intensity = inc.riskLevel === 'Critical' ? 1 : inc.riskLevel === 'High' ? 0.7 : inc.riskLevel === 'Medium' ? 0.4 : 0.2;
      return [inc.lat, inc.lng, intensity];
    }),
    [incidents],
  );

  return (
    <MapContainer
      center={KARNATAKA_CENTER}
      zoom={INITIAL_ZOOM}
      zoomControl={false}
      style={{ width: '100%', height: '100%', background: '#060f1e' }}
      className="crime-map"
    >
      <TileLayer
        key={mapType}
        url={tileLayer.url}
        attribution={tileLayer.attribution}
        maxZoom={19}
      />
      <ZoomControl position="bottomright" />

      {showHeatmap && <HeatmapLayer points={heatmapPoints} />}
      {!showHeatmap && (
        <ClusterLayer incidents={incidents} onSelect={onSelectIncident} />
      )}
    </MapContainer>
  );
}
