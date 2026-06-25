import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { ChevronLeft, Search as SearchIcon, Eye, AlertTriangle, CheckCircle2, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { type Incident } from '../../types';

export const CitizenSearchPage = () => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  
  const incidents = useLiveQuery(() => db.incidents.toArray(), []);

  const results = useMemo(() => {
    if (!query.trim() || !incidents) return [];
    
    const searchTerms = query.toLowerCase().split(' ');
    
    return incidents.filter(inc => {
      const searchString = `
        ${inc.title} 
        ${inc.description} 
        ${inc.location.arrondissement || ''} 
        ${inc.type.replace('_', ' ')}
      `.toLowerCase();
      
      // All terms must match somewhere in the search string
      return searchTerms.every(term => searchString.includes(term));
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [query, incidents]);

  return (
    <div className="space-y-4 pb-6">
      {/* Header & Search Input */}
      <div className="bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 -mx-4 px-4 py-4 pt-2 sticky top-0 z-10">
        <div className="flex items-center gap-3 mb-4">
          <button onClick={() => navigate(-1)} className="p-1.5 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
            <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
          </button>
          <h1 className="text-lg font-bold text-slate-900 dark:text-white">Recherche</h1>
        </div>

        <div className="relative">
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Rechercher (ex: Enfant, Akwa, Bonamoussadi...)"
            className="w-full bg-slate-50 dark:bg-slate-800 border-2 border-slate-200 dark:border-slate-700 rounded-2xl pl-11 pr-4 py-3.5 text-sm text-slate-900 dark:text-white focus:outline-none focus:border-red-500 dark:focus:border-red-500 transition-colors"
          />
          <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
        </div>
      </div>

      {/* Results */}
      <div className="pt-2">
        {!query.trim() ? (
          <div className="text-center p-8 mt-10">
            <div className="w-16 h-16 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-4">
              <SearchIcon className="w-6 h-6 text-slate-400" />
            </div>
            <p className="text-slate-500 font-medium">Recherchez parmi tous les dossiers publics</p>
          </div>
        ) : results.length === 0 ? (
          <div className="text-center p-8 bg-slate-50 dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 mt-4">
            <p className="text-slate-500 font-medium">Aucun résultat trouvé pour "{query}"</p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-4 px-1">
              {results.length} résultat{results.length > 1 ? 's' : ''}
            </p>
            {results.map(incident => (
              <IncidentCard key={incident.id} incident={incident} onClick={() => navigate(`/avis/${incident.id}`)} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const STATUS_LABELS: Record<string, { label: string, color: string }> = {
  NOUVEAU: { label: 'Signalé', color: 'bg-slate-800 text-slate-100' },
  EN_VERIFICATION: { label: 'Vérification', color: 'bg-purple-900/50 text-purple-400 border border-purple-500/20' },
  DISPARITION_CONFIRMEE: { label: 'Disparition', color: 'bg-amber-900/50 text-amber-500 border border-amber-500/20' },
  ENLEVEMENT_CONFIRME: { label: 'Enlèvement', color: 'bg-red-900/50 text-red-500 border border-red-500/20' },
  ENQUETE_EN_COURS: { label: 'Enquête', color: 'bg-blue-900/50 text-blue-400 border border-blue-500/20' },
  LOCALISE: { label: 'Localisé', color: 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/20' },
  RETROUVE: { label: 'Retrouvé', color: 'bg-emerald-900/50 text-emerald-500 border border-emerald-500/20' },
};

function IncidentCard({ incident, onClick }: { incident: Incident, onClick: () => void }) {
  const isDanger = incident.type === 'ENLEVEMENT';
  const isWarning = incident.type === 'DISPARITION';
  const isSuccess = incident.status === 'RETROUVE';

  return (
    <div 
      onClick={onClick}
      className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex gap-4 active:scale-95 transition-transform cursor-pointer"
    >
      <div className={cn(
        "w-12 h-12 rounded-full flex items-center justify-center shrink-0",
        isSuccess ? 'bg-emerald-100 dark:bg-emerald-900/30' :
        isDanger ? 'bg-red-100 dark:bg-red-900/30' : 
        isWarning ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-blue-100 dark:bg-blue-900/30'
      )}>
        {isSuccess ? <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-500" /> :
         isDanger ? <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-500" /> :
         <Eye className="w-6 h-6 text-blue-600 dark:text-blue-500" />}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 className="font-bold text-sm text-slate-900 dark:text-white mb-1 leading-snug">
          {incident.title}
        </h4>
        <div className="flex flex-wrap items-center gap-2 mt-2">
          <span className={cn(
            "px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shrink-0",
            STATUS_LABELS[incident.status]?.color || 'bg-slate-100 text-slate-500'
          )}>
            {STATUS_LABELS[incident.status]?.label || 'En cours'}
          </span>
          <span className="text-[10px] text-slate-500 font-medium truncate">
            {incident.location.arrondissement || 'Douala'}
          </span>
        </div>
        <div className="flex items-center gap-1.5 mt-2 text-[10px] text-slate-400">
          <Clock className="w-3 h-3" />
          <span>{formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true, locale: fr })}</span>
        </div>
      </div>
    </div>
  );
}
