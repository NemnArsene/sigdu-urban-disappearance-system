import { useState, useEffect, useRef } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldAlert, CheckCircle2, ShieldCheck, MapPin } from 'lucide-react';
import { cn } from '../../lib/utils';

// Fix default Leaflet icon paths
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const DOUALA_CENTER: [number, number] = [4.0511, 9.7679];

const TYPE_COLORS: Record<string, string> = {
  FUGUE: '#f59e0b',
  DISPARITION: '#3b82f6',
  ENLEVEMENT: '#e11d48',
  TROUBLE_COGNITIF: '#a855f7',
  ACCIDENT_SUSPECT: '#f97316',
  AUTRE: '#6b7280',
};

const TYPE_LABELS: Record<string, string> = {
  FUGUE: 'Fugue',
  DISPARITION: 'Disparition',
  ENLEVEMENT: 'Enlèvement',
  TROUBLE_COGNITIF: 'Trouble cognitif',
  ACCIDENT_SUSPECT: 'Accident suspect',
  AUTRE: 'Autre',
};

export const CitizenMapPage = () => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);

  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [showServices, setShowServices] = useState(true);

  const incidents = useLiveQuery(() => db.incidents.toArray(), []);
  const services = useLiveQuery(() => db.services.toArray(), []);

  const filteredIncidents = incidents?.filter(inc => {
    if (filter === 'ACTIVE') return inc.status !== 'RETROUVE' && inc.status !== 'CLOTURE' && inc.status !== 'FAUSSE_ALERTE';
    if (filter === 'RESOLVED') return inc.status === 'RETROUVE' || inc.status === 'CLOTURE';
    return true;
  });

  // Initialize map
  useEffect(() => {
    if (!mapContainerRef.current || mapInstanceRef.current) return;

    const map = L.map(mapContainerRef.current, {
      center: DOUALA_CENTER,
      zoom: 12,
      zoomControl: false,
      attributionControl: false,
    });

    // Add OpenStreetMap tiles
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // Add zoom control to bottom-right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    // Create a layer group for markers
    const markersLayer = L.layerGroup().addTo(map);
    markersLayerRef.current = markersLayer;

    mapInstanceRef.current = map;

    // Fix map size on next tick (important for mobile flex layouts)
    setTimeout(() => map.invalidateSize(), 150);

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      markersLayerRef.current = null;
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    const markersLayer = markersLayerRef.current;
    const map = mapInstanceRef.current;
    if (!markersLayer || !map) return;

    // Clear existing markers
    markersLayer.clearLayers();

    // Add incident markers
    if (filteredIncidents) {
      filteredIncidents.forEach(inc => {
        const color = TYPE_COLORS[inc.type] || '#6b7280';
        const typeLabel = TYPE_LABELS[inc.type] || inc.type;

        const icon = L.divIcon({
          className: 'sigdu-marker',
          html: `<div style="width:28px;height:28px;border-radius:50%;background:${color};border:3px solid white;box-shadow:0 2px 8px rgba(0,0,0,0.3);cursor:pointer;"></div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 14],
        });

        const marker = L.marker([inc.location.lat, inc.location.lng], { icon }).addTo(markersLayer);

        marker.bindPopup(`
          <div style="font-family:system-ui;min-width:180px;padding:4px">
            <h3 style="font-weight:800;font-size:13px;margin:0 0 6px;color:#0f172a">${inc.title}</h3>
            <div style="display:flex;gap:4px;margin-bottom:6px;flex-wrap:wrap">
              <span style="font-size:10px;padding:2px 8px;border-radius:9999px;color:#fff;background:${color};font-weight:700">${typeLabel}</span>
              <span style="font-size:10px;padding:2px 8px;border-radius:9999px;color:#475569;background:#f1f5f9;font-weight:600">${inc.status.replace(/_/g, ' ')}</span>
            </div>
            <p style="font-size:11px;color:#64748b;margin:0;overflow:hidden;text-overflow:ellipsis;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical">${inc.description}</p>
            <p style="font-size:10px;color:#94a3b8;margin-top:6px">📍 ${inc.location.arrondissement}${inc.location.quartier ? ' — ' + inc.location.quartier : ''}</p>
          </div>
        `, { maxWidth: 250 });
      });
    }

    // Add service markers
    if (showServices && services) {
      services.forEach(srv => {
        if (!srv.location) return;

        const icon = L.divIcon({
          className: 'sigdu-service-marker',
          html: `<div style="width:32px;height:32px;border-radius:10px;background:#1e3a8a;border:3px solid white;box-shadow:0 3px 10px rgba(0,0,0,0.3);display:flex;align-items:center;justify-content:center;font-size:16px;cursor:pointer;">🛡️</div>`,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        const marker = L.marker([srv.location.lat, srv.location.lng], { icon }).addTo(markersLayer);
        marker.bindPopup(`
          <div style="font-family:system-ui;min-width:160px;padding:4px">
            <h3 style="font-weight:800;font-size:13px;margin:0 0 4px;color:#0f172a">${srv.name}</h3>
            <p style="font-size:11px;color:#64748b;margin:0">${srv.arrondissement || 'Service Central'}</p>
          </div>
        `);
      });
    }

    // Fit bounds if there are points
    const allPoints: [number, number][] = [];
    filteredIncidents?.forEach(inc => allPoints.push([inc.location.lat, inc.location.lng]));
    if (showServices && services) {
      services.forEach(srv => {
        if (srv.location) allPoints.push([srv.location.lat, srv.location.lng]);
      });
    }
    if (allPoints.length > 0) {
      map.fitBounds(L.latLngBounds(allPoints), { padding: [40, 40] });
    }
  }, [filteredIncidents, services, showServices]);

  const activeCount = incidents?.filter(i => !['RETROUVE', 'CLOTURE', 'FAUSSE_ALERTE'].includes(i.status)).length || 0;
  const resolvedCount = incidents?.filter(i => ['RETROUVE', 'CLOTURE'].includes(i.status)).length || 0;

  return (
    <div className="flex flex-col" style={{ height: 'calc(100vh - 11rem)' }}>

      {/* Header & Filters — always visible above the map */}
      <div className="space-y-3 mb-3">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">Carte Communautaire</h1>
          <p className="text-slate-500 text-sm">Visualisez les signalements et les services d'urgence</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-2">
          {/* Incident Filters */}
          <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
            <button
              onClick={() => setFilter('ALL')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all",
                filter === 'ALL' ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900" : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              )}
            >
              Tous ({incidents?.length || 0})
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                filter === 'ACTIVE' ? "bg-red-500 text-white" : "text-slate-500 hover:text-red-500"
              )}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> En cours ({activeCount})
            </button>
            <button
              onClick={() => setFilter('RESOLVED')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                filter === 'RESOLVED' ? "bg-emerald-500 text-white" : "text-slate-500 hover:text-emerald-500"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Résolus ({resolvedCount})
            </button>
          </div>

          {/* Layer Toggle */}
          <button
            onClick={() => setShowServices(!showServices)}
            className={cn(
              "px-3 py-1.5 rounded-xl text-xs font-bold border transition-all flex items-center gap-1.5 justify-center",
              showServices
                ? "bg-blue-50 dark:bg-blue-500/10 border-blue-200 dark:border-blue-800/40 text-blue-600 dark:text-blue-400"
                : "bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 text-slate-500"
            )}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            Commissariats
          </button>
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative rounded-2xl overflow-hidden border-2 border-slate-200 dark:border-slate-700 shadow-sm">
        
        {/* The actual Leaflet map container */}
        <div 
          ref={mapContainerRef} 
          className="absolute inset-0"
          style={{ zIndex: 1 }}
        />

        {/* Floating stats pill (bottom of map) */}
        <div 
          className="absolute bottom-3 left-3 right-3 flex items-center justify-center"
          style={{ zIndex: 10 }}
        >
          <div className="bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/80 dark:border-slate-700 px-4 py-2.5 flex items-center gap-4">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{activeCount} actifs</span>
            </div>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{resolvedCount} résolus</span>
            </div>
            <div className="w-px h-5 bg-slate-200 dark:bg-slate-700" />
            <div className="flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{incidents?.length || 0} total</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
