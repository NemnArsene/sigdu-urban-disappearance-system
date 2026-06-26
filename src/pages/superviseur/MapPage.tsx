import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { SIGMap } from '../../components/map/SIGMap';
import { MapPin, Filter } from 'lucide-react';
import type { IncidentType, IncidentStatus } from '../../types';

const ALL = '__ALL__';

export const SupervisorMapPage = () => {
  const [typeFilter, setTypeFilter] = useState<string>(ALL);
  const [statusFilter, setStatusFilter] = useState<string>(ALL);

  const data = useLiveQuery(async () => {
    const [incidents, services] = await Promise.all([
      db.incidents.toArray(),
      db.services.toArray(),
    ]);
    return { incidents, services };
  }, []);

  const filtered = data ? data.incidents.filter(inc => {
    if (typeFilter !== ALL && inc.type !== typeFilter) return false;
    if (statusFilter !== ALL && inc.status !== statusFilter) return false;
    return true;
  }) : [];

  const types: IncidentType[] = ['DISPARITION', 'FUGUE', 'ENLEVEMENT', 'TROUBLE_COGNITIF', 'ACCIDENT_SUSPECT', 'AUTRE'];
  const statuses: IncidentStatus[] = ['NOUVEAU', 'EN_VERIFICATION', 'ENQUETE_EN_COURS', 'ALERTE_CRITIQUE', 'LOCALISE', 'RETROUVE', 'CLOTURE'];

  return (
    <div className="h-[calc(100vh-5rem)] flex flex-col gap-4">
      {/* Header + Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <MapPin className="w-5 h-5 text-indigo-500" /> Carte SIG Opérationnelle
          </h1>
          <p className="text-slate-500 text-xs mt-0.5">
            {filtered.length} incident(s) affiché(s) sur {data?.incidents.length || 0}
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0 flex-wrap">
          <Filter className="w-4 h-4 text-slate-400" />
          <select
            value={typeFilter}
            onChange={e => setTypeFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value={ALL}>Tous les types</option>
            {types.map(t => <option key={t} value={t}>{t.replace(/_/g, ' ')}</option>)}
          </select>
          <select
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-white rounded-xl px-3 py-2 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          >
            <option value={ALL}>Tous les statuts</option>
            {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ')}</option>)}
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap gap-3">
        {[
          { label: 'Disparition', color: '#3b82f6' },
          { label: 'Fugue', color: '#f59e0b' },
          { label: 'Enlèvement', color: '#e11d48' },
          { label: 'Trouble cognitif', color: '#a855f7' },
          { label: 'Commissariat', color: '#1e3a8a', shape: 'square' },
        ].map(item => (
          <div key={item.label} className="flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-400">
            <div
              className={item.shape === 'square' ? 'rounded-md' : 'rounded-full'}
              style={{ width: 10, height: 10, background: item.color, border: '2px solid white', boxShadow: '0 1px 3px rgba(0,0,0,0.2)' }}
            />
            {item.label}
          </div>
        ))}
      </div>

      {/* Map */}
      <div className="flex-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm min-h-[400px]">
        {data ? (
          <SIGMap incidents={filtered} services={data.services} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
};
