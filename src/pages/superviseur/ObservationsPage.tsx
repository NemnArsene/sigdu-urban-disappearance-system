import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { Eye, CheckCircle2, XCircle, BrainCircuit, Search, MapPin, ExternalLink, Clock } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { type Observation } from '../../types';
import { Pagination } from '../../components/ui/Pagination';

const PAGE_SIZE = 6;

export const SupervisorObservationsPage = () => {
  const observations = useLiveQuery(() => db.observations.orderBy('createdAt').reverse().toArray(), []);
  
  const [filter, setFilter] = useState<'NOUVEAU' | 'TRAITE'>('NOUVEAU');
  const [currentPage, setCurrentPage] = useState(1);

  const filteredObservations = observations?.filter(obs => {
    if (filter === 'NOUVEAU') return obs.status === 'NOUVEAU';
    return obs.status !== 'NOUVEAU';
  });

  const totalItems = filteredObservations?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const pagedObservations = filteredObservations?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (f: 'NOUVEAU' | 'TRAITE') => { setFilter(f); setCurrentPage(1); };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Modération des Observations</h1>
          <p className="text-slate-500 text-sm">Analysez les signalements citoyens et reliez-les aux dossiers</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => handleFilterChange('NOUVEAU')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2",
              filter === 'NOUVEAU' ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <Clock className="w-4 h-4" /> À traiter
          </button>
          <button
            onClick={() => handleFilterChange('TRAITE')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2",
              filter === 'TRAITE' ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <CheckCircle2 className="w-4 h-4" /> Traitées
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {!pagedObservations || pagedObservations.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Eye className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucune observation dans cette catégorie</p>
          </div>
        ) : (
          pagedObservations!.map(obs => <ObservationCard key={obs.id} observation={obs} />)
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
};

function ObservationCard({ observation }: { observation: Observation }) {
  const [processing, setProcessing] = useState(false);
  
  // Get incident if linked
  const incident = useLiveQuery(
    () => observation.incidentId ? db.incidents.get(observation.incidentId) : undefined,
    [observation.incidentId]
  );

  const handleAction = async (action: 'PERTINENT' | 'REJETE') => {
    setProcessing(true);
    try {
      await db.observations.update(observation.id, { status: action });
      
      if (action === 'PERTINENT' && observation.incidentId) {
        // Add public timeline event
        await db.timelineEvents.add({
          id: `te_${Date.now()}`,
          incidentId: observation.incidentId,
          actionType: 'OBSERVATION',
          description: 'Une observation citoyenne a été confirmée comme pertinente par nos services.',
          visibility: 'PUBLIC',
          createdBy: 'SUPERVISEUR',
          createdAt: new Date().toISOString()
        });
      }
      
      toast.success(action === 'PERTINENT' ? 'Observation validée et reliée !' : 'Observation rejetée');
    } catch (err) {
      toast.error('Erreur lors du traitement');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
      <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
              #{observation.id.slice(-6)}
            </span>
            <span className="text-[10px] text-slate-400 flex items-center gap-1">
              <Clock className="w-3 h-3" />
              {formatDistanceToNow(new Date(observation.createdAt), { addSuffix: true, locale: fr })}
            </span>
          </div>
          <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
            <Eye className="w-4 h-4 text-orange-500" />
            Signalement: {observation.type.replace('_', ' ')}
          </h3>
        </div>
        <div className={cn(
          "px-2.5 py-1 rounded-full text-xs font-bold shrink-0",
          observation.status === 'NOUVEAU' ? "bg-amber-100 text-amber-700" :
          observation.status === 'PERTINENT' ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
        )}>
          {observation.status}
        </div>
      </div>

      <div className="p-4 flex-1">
        <p className="text-sm text-slate-700 dark:text-slate-300 mb-4 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-700">
          « {observation.description} »
        </p>

        {observation.photos && observation.photos.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2 mb-2 no-scrollbar">
            {observation.photos.map((photo, i) => (
              <img key={i} src={photo} alt="Observation" className="h-24 w-auto rounded-lg object-cover border border-slate-200" />
            ))}
          </div>
        )}

        <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-2">
          <MapPin className="w-3.5 h-3.5" />
          {observation.location.arrondissement || 'Non spécifié'} (Lat: {observation.location.lat.toFixed(3)}, Lng: {observation.location.lng.toFixed(3)})
        </div>
      </div>

      {observation.status === 'NOUVEAU' && (
        <div className="bg-slate-50 dark:bg-slate-800/30 p-4 border-t border-slate-100 dark:border-slate-800">
          {/* AI Match Section */}
          {observation.aiSimilarityScore ? (
            <div className="bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-100 dark:border-indigo-800/50 rounded-xl p-3 mb-4">
              <div className="flex items-center gap-2 text-indigo-700 dark:text-indigo-400 mb-2">
                <BrainCircuit className="w-4 h-4" />
                <span className="font-bold text-xs uppercase tracking-wide">Analyse IA (Score: {observation.aiSimilarityScore}%)</span>
              </div>
              {incident ? (
                <div className="bg-white dark:bg-slate-900 rounded-lg p-2 text-xs border border-indigo-100 dark:border-indigo-800/50 flex items-center justify-between">
                  <span className="font-medium text-slate-700 dark:text-slate-300 truncate mr-2">{incident.title}</span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                </div>
              ) : (
                <p className="text-xs text-slate-500">Dossier lié introuvable ({observation.incidentId})</p>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2 mb-4 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2">
              <Search className="w-4 h-4 text-slate-400" />
              <input type="text" placeholder="Rechercher un dossier à lier..." className="bg-transparent border-none focus:outline-none text-xs w-full text-slate-700 dark:text-slate-300" />
            </div>
          )}

          <div className="flex gap-2">
            <button
              disabled={processing}
              onClick={() => handleAction('REJETE')}
              className="flex-1 py-2.5 bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-red-600 rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2"
            >
              <XCircle className="w-4 h-4" /> Ignorer
            </button>
            <button
              disabled={processing || (!observation.incidentId && !observation.aiSimilarityScore)}
              onClick={() => handleAction('PERTINENT')}
              className="flex-[2] py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <CheckCircle2 className="w-4 h-4" /> Valider & Lier au dossier
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
