import React, { useState } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Search, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';

// --- React 18 StrictMode + Vite HMR Workaround for React-Leaflet ---
// Leaflet throws "Map container is already initialized" when React 18 double-invokes
// effects or when Vite HMR hot-swaps the component. We patch the Leaflet constructor
// to gracefully clear the lingering ID before re-initializing.
const MapClass = L.Map as any;
const originalInit = MapClass.prototype.initialize;
MapClass.prototype.initialize = function (...args: any[]) {
  const container = args[0];
  if (container && typeof container !== 'string' && (container as any)._leaflet_id) {
    (container as any)._leaflet_id = null;
  }
  return originalInit.apply(this, args as any);
};
// -------------------------------------------------------------------

const stats = [
  { label: 'En Attente', value: 100, color: 'text-orange-500', dot: 'bg-orange-500' },
  { label: 'En Cours', value: 100, color: 'text-purple-500', dot: 'bg-purple-500' },
  { label: 'Résolus', value: 100, color: 'text-emerald-500', dot: 'bg-emerald-500' },
  { label: 'Total', value: 500, color: 'text-blue-500', dot: 'bg-blue-500' },
];

const legend = [
  { label: 'En Attente', color: '#f97316', count: 100 },
  { label: 'Assigné', color: '#3b82f6', count: 100 },
  { label: 'En Cours', color: '#a855f7', count: 100 },
  { label: 'Résolu', color: '#10b981', count: 100 },
  { label: 'Rejeté', color: '#ef4444', count: 100 },
  { label: 'Annulé', color: '#6b7280', count: 0 },
];

const criticalAlerts = [
  { title: "Disparition d'enfant (moins de 10 ans)", location: 'Sodiko' },
  { title: "Enlèvement suspect signalé", location: 'Bonabéri' },
  { title: "Personne atteinte d'Alzheimer perdue", location: 'Grand Hangar' },
  { title: "Alerte enlèvement véhicule suspect", location: 'Mabanda' },
  { title: "Fugue d'adolescent (15 ans)", location: 'Mambanda' },
];

const categories = ['Toutes', 'Disparition', 'Enlèvement', 'Fugue', 'Trouble cognitif', 'Accident suspect', 'Retrouvé'];

// Generate some random points for Douala
const generatePoints = () => {
  const points = [];
  const colors = ['#f97316', '#3b82f6', '#a855f7', '#10b981', '#ef4444'];
  const cats = ['Disparition', 'Enlèvement', 'Fugue', 'Trouble cognitif', 'Accident suspect'];
  
  for (let i = 0; i < 80; i++) {
    const lat = 4.0511 + (Math.random() - 0.5) * 0.1;
    const lng = 9.7079 + (Math.random() - 0.5) * 0.1;
    const typeIdx = Math.floor(Math.random() * colors.length);
    points.push({
      id: i,
      lat,
      lng,
      color: colors[typeIdx],
      category: cats[typeIdx],
      title: `Cas #${1000 + i}`
    });
  }
  return points;
};

const mapPoints = generatePoints();

export const AdminMapPage = () => {
  const [activeTab, setActiveTab] = useState('Toutes');
  
  const filteredPoints = activeTab === 'Toutes' 
    ? mapPoints 
    : mapPoints.filter(p => p.category === activeTab || (activeTab === 'Retrouvé' && p.color === '#10b981'));

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col gap-4">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-white flex items-center gap-2">
          Carte Interactive
        </h1>
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Rechercher une zone, une alerte..." 
            className="w-full pl-9 pr-4 py-2 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none text-sm"
          />
        </div>
      </div>

      {/* Tabs for categories */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-hide">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveTab(cat)}
            className={cn(
              "px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors",
              activeTab === cat 
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-500/20" 
                : "bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-300 border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700"
            )}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {stats.map((stat, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center shadow-sm">
            <div className={cn("w-2 h-2 rounded-full mb-2", stat.dot)}></div>
            <h3 className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</h3>
            <p className="text-xs font-medium text-gray-500 mt-1">{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Main Content (Map + Sidebar) */}
      <div className="flex-1 flex flex-col lg:flex-row gap-4 min-h-0">
        
        {/* Map Container */}
        <div className="flex-1 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden shadow-sm relative z-0">
          <MapContainer 
            center={[4.0511, 9.7079]} 
            zoom={12} 
            className="w-full h-full"
            zoomControl={false}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            {filteredPoints.map(point => (
              <CircleMarker
                key={point.id}
                center={[point.lat, point.lng]}
                radius={8}
                pathOptions={{
                  fillColor: point.color,
                  fillOpacity: 1,
                  color: 'white',
                  weight: 2
                }}
              >
                <Popup className="rounded-xl">
                  <div className="p-1">
                    <p className="font-bold text-sm mb-1">{point.title}</p>
                    <p className="text-xs text-gray-600">{point.category}</p>
                  </div>
                </Popup>
              </CircleMarker>
            ))}
          </MapContainer>
        </div>

        {/* Right Sidebar */}
        <div className="w-full lg:w-80 flex flex-col gap-4 overflow-y-auto">
          {/* Legend */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm shrink-0">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4">Légende</h3>
            <div className="space-y-3">
              {legend.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                    <span className="text-sm text-gray-600 dark:text-gray-300">{item.label}</span>
                  </div>
                  <span className="text-sm font-semibold text-gray-900 dark:text-white">{item.count}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Critical Alerts */}
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex-1">
            <h3 className="font-bold text-gray-900 dark:text-white text-sm mb-4 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-500 fill-red-100 dark:fill-red-900/30" />
              Alertes Critiques
            </h3>
            <div className="space-y-3">
              {criticalAlerts.map((alert, idx) => (
                <div key={idx} className="bg-red-50 dark:bg-red-500/10 border border-red-100 dark:border-red-500/20 rounded-xl p-3">
                  <p className="text-sm font-semibold text-red-700 dark:text-red-400 leading-tight mb-1">{alert.title}</p>
                  <p className="text-xs text-red-600/70 dark:text-red-400/70">{alert.location}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
