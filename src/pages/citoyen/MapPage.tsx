import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { SIGMap } from '../../components/map/SIGMap';
import { Filter, ShieldAlert, CheckCircle2, ShieldCheck } from 'lucide-react';
import { cn } from '../../lib/utils';

export const CitizenMapPage = () => {
  const [filter, setFilter] = useState<'ALL' | 'ACTIVE' | 'RESOLVED'>('ALL');
  const [showServices, setShowServices] = useState(true);

  const incidents = useLiveQuery(() => db.incidents.toArray(), []);
  const services = useLiveQuery(() => db.services.toArray(), []);

  const filteredIncidents = incidents?.filter(inc => {
    if (filter === 'ACTIVE') return inc.status !== 'RETROUVE' && inc.status !== 'CLOTURE' && inc.status !== 'FAUSSE_ALERTE';
    if (filter === 'RESOLVED') return inc.status === 'RETROUVE' || inc.status === 'CLOTURE';
    return true;
  });

  return (
    <div className="h-full flex flex-col space-y-3 pb-6">
      {/* Header & Filters */}
      <div className="space-y-3">
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
              Tous
            </button>
            <button
              onClick={() => setFilter('ACTIVE')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                filter === 'ACTIVE' ? "bg-red-500 text-white" : "text-slate-500 hover:text-red-500"
              )}
            >
              <ShieldAlert className="w-3.5 h-3.5" /> En cours
            </button>
            <button
              onClick={() => setFilter('RESOLVED')}
              className={cn(
                "px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5",
                filter === 'RESOLVED' ? "bg-emerald-500 text-white" : "text-slate-500 hover:text-emerald-500"
              )}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Résolus
            </button>
          </div>

          {/* Layer Toggles */}
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
      <div className="flex-1 min-h-[500px] rounded-3xl overflow-hidden border-2 border-slate-200 dark:border-slate-800 shadow-sm relative">
        {filteredIncidents ? (
          <SIGMap 
            incidents={filteredIncidents} 
            services={showServices ? services : undefined}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
          </div>
        )}
      </div>
    </div>
  );
};
