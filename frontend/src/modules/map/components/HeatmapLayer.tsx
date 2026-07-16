import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.heat';

// Augment Leaflet types for leaflet.heat
declare module 'leaflet' {
  function heatLayer(
    latlngs: [number, number, number][],
    options?: Record<string, unknown>
  ): L.Layer;
}

interface HeatmapLayerProps {
  points: [number, number, number][];
}

export function HeatmapLayer({ points }: HeatmapLayerProps) {
  const map = useMap();
  const heatRef = useRef<L.Layer | null>(null);

  useEffect(() => {
    if (!map) return;

    // Remove existing heatmap layer
    if (heatRef.current) {
      map.removeLayer(heatRef.current);
      heatRef.current = null;
    }

    const layer = L.heatLayer(points, {
      radius: 30,
      blur: 22,
      maxZoom: 15,
      gradient: {
        0.0: '#0ea5e9',
        0.3: '#6366f1',
        0.6: '#f59e0b',
        0.8: '#ef4444',
        1.0: '#dc2626',
      },
      minOpacity: 0.4,
    });

    layer.addTo(map);
    heatRef.current = layer;

    return () => {
      map.removeLayer(layer);
      heatRef.current = null;
    };
  }, [map, points]);

  return null;
}
