import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { Eye, CheckCircle2, XCircle, BrainCircuit, Search, MapPin, ExternalLink, Clock, Trash2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import type { Observation } from '../../types';

export const AdminObservationsPage = () => {
  const [filter, setFilter] = useState<'ALL' | 'NOUVEAU' | 'PERTINENT' | 'REJETE' | 'TRAITE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const observations = useLiveQuery(() => db.observations.orderBy('createdAt').reverse().toArray(), []);

  const filtered = observations?.filter(obs => {
    if (filter !== 'ALL' && obs.status !== filter) return false;
    if (searchQuery && !obs.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const counts = useLiveQuery(async () => {
    const all = await db.observations.count();
    const nouveau = await db.observations.where('status').equals('NOUVEAU').count();
    const pertinent = await db.observations.where('status').equals('PERTINENT').count();
    const rejete = await db.observations.where('status').equals('REJETE').count();
    const traite = await db.observations.where('status').equals('TRAITE').count();
    return { all, nouveau, pertinent, rejete, traite };
  }, []);

  const handleModerate = async (id: string, action: 'PERTINENT' | 'REJETE') => {
    try {
      const obs = await db.observations.get(id);
      await db.observations.update(id, { status: action });
      if (action === 'PERTINENT' && obs?.incidentId) {
        await db.timelineEvents.add({
          id: `te_obs_${Date.now()}`,
          incidentId: obs.incidentId,
          actionType: 'OBSERVATION',
          description: 'Une observation citoyenne a été confirmée comme pertinente par l\'administrateur.',
          visibility: 'PUBLIC',
          createdBy: 'ADMIN',
          createdAt: new Date().toISOString()
        });
      }
      toast.success(action === 'PERTINENT' ? 'Observation validée' : 'Observation rejetée');
    } catch {
      toast.error('Erreur lors du traitement');
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await db.observations.delete(id);
      toast.success('Observation supprimée');
    } catch {
      toast.error('Erreur');
    } finally {
      setDeletingId(null);
    }
  };

  const statusColor = (s: string) => {
    if (s === 'NOUVEAU') return 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400';
    if (s === 'PERTINENT') return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400';
    if (s === 'REJETE') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400';
    return 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400';
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Gestion des Observations</h1>
          <p className="text-slate-500 text-sm">Modérez et gérez les observations citoyennes</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {([
          { key: 'ALL', label: 'Toutes', count: counts?.all || 0, color: 'indigo' },
          { key: 'NOUVEAU', label: 'À traiter', count: counts?.nouveau || 0, color: 'amber' },
          { key: 'PERTINENT', label: 'Pertinentes', count: counts?.pertinent || 0, color: 'emerald' },
          { key: 'REJETE', label: 'Rejetées', count: counts?.rejete || 0, color: 'red' },
          { key: 'TRAITE', label: 'Traitées', count: counts?.traite || 0, color: 'slate' },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`p-3 rounded-xl border-2 transition-all text-center ${
              filter === f.key
                ? `border-${f.color}-500 bg-${f.color}-50 dark:bg-${f.color}-900/20`
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
            }`}
          >
            <p className="text-2xl font-black text-slate-900 dark:text-white">{f.count}</p>
            <p className="text-[10px] text-slate-500 font-medium">{f.label}</p>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {!filtered?.length ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Eye className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucune observation trouvée</p>
          </div>
        ) : (
          filtered.map(obs => (
            <ObservationCard
              key={obs.id}
              observation={obs}
              onModerate={handleModerate}
              onDelete={handleDelete}
              deleting={deletingId === obs.id}
              statusColor={statusColor}
            />
          ))
        )}
      </div>
    </div>
  );
};

function ObservationCard({ observation: obs, onModerate, onDelete, deleting, statusColor }: {
  observation: Observation;
  onModerate: (id: string, action: 'PERTINENT' | 'REJETE') => void;
  onDelete: (id: string) => void;
  deleting: boolean;
  statusColor: (s: string) => string;
}) {
  const incident = useLiveQuery(
    () => obs.incidentId ? db.incidents.get(obs.incidentId) : undefined,
    [obs.incidentId]
  );

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <Badge variant="outline" className="text-[10px] font-bold">#{obs.id.slice(-6)}</Badge>
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColor(obs.status)}`}>{obs.status}</span>
          <span className="text-[10px] text-slate-400">{obs.type.replace('_', ' ')}</span>
        </div>
        <span className="text-[10px] text-slate-400 flex items-center gap-1 shrink-0">
          <Clock className="w-3 h-3" />
          {formatDistanceToNow(new Date(obs.createdAt), { addSuffix: true, locale: fr })}
        </span>
      </div>

      <div className="p-4 flex-1">
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700 line-clamp-3">
          « {obs.description} »
        </p>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <MapPin className="w-3.5 h-3.5" />
          {obs.location.arrondissement || 'Non spécifié'}
          {obs.location.quartier && ` — ${obs.location.quartier}`}
        </div>
        {obs.aiSimilarityScore && (
          <div className="flex items-center gap-2 mt-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-lg px-3 py-2">
            <BrainCircuit className="w-4 h-4 text-indigo-600" />
            <span className="text-xs font-bold text-indigo-700 dark:text-indigo-400">Score IA: {obs.aiSimilarityScore}%</span>
            {incident && (
              <span className="text-[10px] text-slate-500 truncate ml-auto flex items-center gap-1">
                <ExternalLink className="w-3 h-3" /> {incident.title}
              </span>
            )}
          </div>
        )}
      </div>

      <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex gap-2">
        {obs.status === 'NOUVEAU' && (
          <>
            <Button variant="outline" size="sm" className="flex-1 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20" onClick={() => onModerate(obs.id, 'PERTINENT')}>
              <CheckCircle2 className="w-3 h-3 mr-1" /> Pertinent
            </Button>
            <Button variant="outline" size="sm" className="flex-1 text-red-600 border-red-200 hover:bg-red-50 dark:border-red-800 dark:hover:bg-red-900/20" onClick={() => onModerate(obs.id, 'REJETE')}>
              <XCircle className="w-3 h-3 mr-1" /> Rejeter
            </Button>
          </>
        )}
        <Button variant="ghost" size="sm" className="text-slate-400 hover:text-red-500" onClick={() => onDelete(obs.id)} disabled={deleting}>
          <Trash2 className="w-3.5 h-3.5" />
        </Button>
      </div>
    </div>
  );
}
