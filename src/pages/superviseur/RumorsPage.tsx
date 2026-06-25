import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { MessageSquareWarning, ShieldCheck, ShieldX, Check, X, Clock, ExternalLink } from 'lucide-react';
import { toast } from 'sonner';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { type Rumor } from '../../types';

export const SupervisorRumorsPage = () => {
  const rumors = useLiveQuery(() => db.rumors.orderBy('createdAt').reverse().toArray(), []);
  
  const [filter, setFilter] = useState<'ALL' | 'PENDING' | 'VERIFIED'>('PENDING');

  const filteredRumors = rumors?.filter(r => {
    if (filter === 'PENDING') return r.status === 'PENDING';
    if (filter === 'VERIFIED') return r.status !== 'PENDING';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Gestion des Rumeurs</h1>
          <p className="text-slate-500 text-sm">Modérez et vérifiez les informations rapportées par les citoyens</p>
        </div>
        
        <div className="flex bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm">
          <button
            onClick={() => setFilter('PENDING')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2",
              filter === 'PENDING' ? "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <Clock className="w-4 h-4" /> À vérifier
          </button>
          <button
            onClick={() => setFilter('VERIFIED')}
            className={cn(
              "px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center gap-2",
              filter === 'VERIFIED' ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-400" : "text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800"
            )}
          >
            <ShieldCheck className="w-4 h-4" /> Traitées
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {!filteredRumors || filteredRumors.length === 0 ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <MessageSquareWarning className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucune rumeur dans cette catégorie</p>
          </div>
        ) : (
          filteredRumors.map(rumor => <RumorCard key={rumor.id} rumor={rumor} />)
        )}
      </div>
    </div>
  );
};

function RumorCard({ rumor }: { rumor: Rumor }) {
  const [response, setResponse] = useState(rumor.officialResponse || '');
  const [isAnswering, setIsAnswering] = useState(false);

  const handleVerify = async (status: 'VERIFIED_TRUE' | 'VERIFIED_FALSE') => {
    if (!response.trim()) {
      toast.error('Veuillez fournir une réponse officielle');
      return;
    }

    try {
      await db.rumors.update(rumor.id, {
        status,
        officialResponse: response
      });
      toast.success('Rumeur traitée avec succès');
      setIsAnswering(false);
    } catch (err) {
      toast.error('Erreur lors de la mise à jour');
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col">
      <div className="p-4 flex-1">
        <div className="flex items-start justify-between gap-2 mb-3">
          <span className={cn(
            "text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5",
            rumor.status === 'PENDING' ? "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400" :
            rumor.status === 'VERIFIED_TRUE' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" :
            "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
          )}>
            {rumor.status === 'PENDING' ? <Clock className="w-3.5 h-3.5" /> :
             rumor.status === 'VERIFIED_TRUE' ? <ShieldCheck className="w-3.5 h-3.5" /> :
             <ShieldX className="w-3.5 h-3.5" />}
            {rumor.status === 'PENDING' ? 'À vérifier' :
             rumor.status === 'VERIFIED_TRUE' ? 'Confirmé' : 'Démenti'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            {formatDistanceToNow(new Date(rumor.createdAt), { addSuffix: true, locale: fr })}
          </span>
        </div>

        <p className="text-sm text-slate-700 dark:text-slate-300 italic mb-4 leading-relaxed">
          « {rumor.content} »
        </p>

        {rumor.photo && (
          <div className="mb-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800">
            <img src={rumor.photo} alt="Capture source" className="w-full h-32 object-cover" />
            <a href={rumor.photo} target="_blank" rel="noreferrer" className="flex items-center justify-center gap-2 py-2 bg-slate-50 dark:bg-slate-800 text-xs text-slate-500 hover:text-slate-700 dark:hover:text-slate-300">
              <ExternalLink className="w-3.5 h-3.5" /> Voir en grand
            </a>
          </div>
        )}

        {rumor.status !== 'PENDING' && (
          <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 border border-slate-100 dark:border-slate-800">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Réponse Officielle</p>
            <p className="text-xs text-slate-700 dark:text-slate-300">{rumor.officialResponse}</p>
          </div>
        )}
      </div>

      {rumor.status === 'PENDING' && (
        <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800">
          {isAnswering ? (
            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
              <textarea
                value={response}
                onChange={(e) => setResponse(e.target.value)}
                placeholder="Rédigez la réponse officielle qui sera affichée publiquement..."
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-sm focus:outline-none focus:border-indigo-500 resize-none h-24"
              />
              <div className="flex gap-2">
                <button
                  onClick={() => handleVerify('VERIFIED_FALSE')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-400 dark:hover:bg-red-900/50 rounded-lg text-xs font-bold transition-colors"
                >
                  <ShieldX className="w-4 h-4" /> Démentir (Faux)
                </button>
                <button
                  onClick={() => handleVerify('VERIFIED_TRUE')}
                  className="flex-1 flex items-center justify-center gap-2 py-2 bg-emerald-100 text-emerald-700 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-400 dark:hover:bg-emerald-900/50 rounded-lg text-xs font-bold transition-colors"
                >
                  <ShieldCheck className="w-4 h-4" /> Confirmer (Vrai)
                </button>
              </div>
              <button 
                onClick={() => setIsAnswering(false)}
                className="w-full py-2 text-xs font-semibold text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
              >
                Annuler
              </button>
            </div>
          ) : (
            <button
              onClick={() => setIsAnswering(true)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-bold transition-colors"
            >
              Traiter cette rumeur
            </button>
          )}
        </div>
      )}
    </div>
  );
}
