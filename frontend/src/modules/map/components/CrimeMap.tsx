import { MapContainer, TileLayer, ZoomControl, useMap } from 'react-leaflet';
import { useMemo, useEffect } from 'react';
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

interface MapViewControllerProps {
  center?: [number, number];
  selectedIncident: MapIncident | null;
}

function MapViewController({ center, selectedIncident }: MapViewControllerProps) {
  const map = useMap();

  useEffect(() => {
    if (selectedIncident) {
      map.setView([selectedIncident.lat, selectedIncident.lng], 13, { animate: true, duration: 0.8 });
    } else if (center) {
      map.setView(center, 13, { animate: true, duration: 0.8 });
    }
  }, [selectedIncident, center, map]);

  return null;
}

interface CrimeMapProps {
  incidents: MapIncident[];
  showHeatmap: boolean;
  mapType: 'standard' | 'satellite';
  onSelectIncident: (incident: MapIncident) => void;
  selectedIncident: MapIncident | null;
  initialCenter?: [number, number];
}

export function CrimeMap({
  incidents,
  showHeatmap,
  mapType,
  onSelectIncident,
  selectedIncident,
  initialCenter,
}: CrimeMapProps) {
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
      center={initialCenter || KARNATAKA_CENTER}
      zoom={initialCenter ? 13 : INITIAL_ZOOM}
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

      <MapViewController center={initialCenter} selectedIncident={selectedIncident} />

      {showHeatmap && <HeatmapLayer points={heatmapPoints} />}
      {!showHeatmap && (
        <ClusterLayer incidents={incidents} onSelect={onSelectIncident} />
      )}
    </MapContainer>
  );
}
