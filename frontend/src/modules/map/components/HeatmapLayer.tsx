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
      radius: 25,
      blur: 18,
      maxZoom: 15,
      max: 1.0,
      gradient: {
        0.2: 'rgba(59, 130, 246, 0.5)',   // Blue glow for low severity
        0.4: 'rgba(234, 179, 8, 0.7)',    // Yellow warning
        0.7: 'rgba(249, 115, 22, 0.85)',  // Orange high alert
        0.9: 'rgba(239, 68, 68, 0.95)',   // Crimson red severe
        1.0: 'rgba(220, 38, 38, 1.0)',    // Deep critical red core
      },
      minOpacity: 0.5,
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
