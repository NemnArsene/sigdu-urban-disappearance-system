import { useEffect, useRef, useId } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { type Incident, type Service } from '../../types';

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface SIGMapProps {
  incidents: Incident[];
  services?: Service[];
  center?: [number, number];
  zoom?: number;
  interactive?: boolean;
  dark?: boolean;
}

const TILE_URL_LIGHT = 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png';
const TILE_URL_DARK = 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png';
const ATTRIBUTION = '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/">CARTO</a>';

export const SIGMap: React.FC<SIGMapProps> = ({
  incidents,
  services,
  center = [4.0511, 9.7679],
  zoom = 12,
  interactive = true,
  dark = false,
}) => {
  const uniqueId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersRef = useRef<L.Layer[]>([]);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    // Destroy any existing map on this container
    if (mapRef.current) {
      mapRef.current.remove();
      mapRef.current = null;
    }

    // Force clean stale Leaflet reference
    try { delete (el as any)._leaflet_id; } catch {}

    const map = L.map(el, {
      center,
      zoom,
      scrollWheelZoom: interactive,
      dragging: interactive,
      zoomControl: interactive,
      attributionControl: true,
    });

    const tileUrl = dark ? TILE_URL_DARK : TILE_URL_LIGHT;
    L.tileLayer(tileUrl, { attribution: ATTRIBUTION }).addTo(map);

    mapRef.current = map;

    // Use ResizeObserver to reliably fix the "grey box" / partial load issue on mobile flex layouts
    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    });
    resizeObserver.observe(el);

    return () => {
      resizeObserver.disconnect();
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
      markersRef.current = [];
    };
  }, [dark, center, zoom, interactive]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    markersRef.current.forEach((layer) => map.removeLayer(layer));
    markersRef.current = [];

    const allPoints: [number, number][] = [];

    // Add Services
    if (services) {
      services.forEach((srv) => {
        if (!srv.location) return; // Some services might not have a location in the mock
        const icon = L.divIcon({
          className: 'custom-service-marker',
          html: `<div style="width:28px;height:28px;border-radius:8px;background:#1e3a8a;border:2px solid white;box-shadow:0 4px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:14px;">🛡️</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([srv.location.lat, srv.location.lng], { icon }).addTo(map);
        marker.bindPopup(`
          <div style="font-family:sans-serif;color:#1e293b;min-width:180px">
            <h3 style="font-weight:700;font-size:14px;margin:0 0 4px">${srv.name}</h3>
            <p style="font-size:12px;color:#64748b;margin:0">${srv.arrondissement || 'Service Central'}</p>
          </div>
        `);
        markersRef.current.push(marker);
        allPoints.push([srv.location.lat, srv.location.lng]);
      });
    }

    incidents.forEach((inc) => {
      const MARKER_COLORS: Record<string, string> = {
        ENFANT_MINEUR: '#ef4444',
        ADULTE: '#3b82f6',
        PERSONNE_AGEE: '#6366f1',
        FUGUE: '#f59e0b',
        ENLEVEMENT: '#e11d48',
        TROUBLE_COGNITIF: '#a855f7',
        ACCIDENT_SUSPECT: '#f97316',
        RETROUVE: '#10b981',
        AUTRE: '#6b7280',
      };
      const TYPE_LABELS: Record<string, string> = {
        ENFANT_MINEUR: 'Enfant mineur',
        ADULTE: 'Adulte',
        PERSONNE_AGEE: 'Personne âgée',
        FUGUE: 'Fugue',
        ENLEVEMENT: 'Enlèvement',
        TROUBLE_COGNITIF: 'Trouble cognitif',
        ACCIDENT_SUSPECT: 'Accident suspect',
        RETROUVE: 'Personne retrouvée',
        AUTRE: 'Autre',
      };
      const markerColor = MARKER_COLORS[inc.type] || '#6b7280';
      const typeLabel = TYPE_LABELS[inc.type] || inc.type;

      const icon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="width:24px;height:24px;border-radius:50%;background:${markerColor};border:3px solid white;box-shadow:0 2px 6px rgba(0,0,0,0.3)"></div>`,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
      });

      const marker = L.marker([inc.location.lat, inc.location.lng], { icon }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:sans-serif;color:#1e293b;min-width:200px">
          <h3 style="font-weight:700;font-size:14px;margin:0 0 4px">${inc.title}</h3>
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:8px">
            <span style="font-size:10px;padding:2px 8px;border-radius:9999px;color:#fff;background:${markerColor}">${typeLabel}</span>
            <span style="font-size:10px;color:#64748b;background:#f1f5f9;padding:2px 8px;border-radius:9999px">${inc.status}</span>
          </div>
          <p style="font-size:12px;color:#64748b;margin:0;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden">${inc.description}</p>
          <p style="font-size:10px;color:#94a3b8;margin-top:8px">📍 ${inc.location.arrondissement}</p>
        </div>
      `);
      markersRef.current.push(marker);
      allPoints.push([inc.location.lat, inc.location.lng]);
    });

    if (allPoints.length > 0) {
      const bounds = L.latLngBounds(allPoints);
      map.fitBounds(bounds, { padding: [30, 30] });
    }
  }, [incidents, services]);

  return (
    <div className="h-full w-full relative rounded-xl overflow-hidden">
      <div
        ref={containerRef}
        id={`sigdu-map-${uniqueId}`}
        style={{ height: '100%', width: '100%', background: '#e5e7eb' }}
      />
    </div>
  );
};
