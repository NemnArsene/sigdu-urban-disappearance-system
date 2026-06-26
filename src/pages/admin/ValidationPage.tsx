import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { CheckCircle2, XCircle, MapPin, Clock, AlertTriangle, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const AdminValidationPage = () => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'NOUVEAU' | 'EN_VERIFICATION' | 'FAUSSE_ALERTE'>('NOUVEAU');

  const incidents = useLiveQuery(() => {
    if (filter === 'NOUVEAU') return db.incidents.where('status').equals('NOUVEAU').toArray();
    if (filter === 'EN_VERIFICATION') return db.incidents.where('status').equals('EN_VERIFICATION').toArray();
    return db.incidents.where('status').equals('FAUSSE_ALERTE').toArray();
  }, [filter]);

  const counts = useLiveQuery(async () => {
    const [nouveau, enVerification, fausse] = await Promise.all([
      db.incidents.where('status').equals('NOUVEAU').count(),
      db.incidents.where('status').equals('EN_VERIFICATION').count(),
      db.incidents.where('status').equals('FAUSSE_ALERTE').count(),
    ]);
    return { nouveau, enVerification, fausse };
  }, []);

  const handleValidate = async (id: string) => {
    setProcessingId(id);
    try {
      await db.incidents.update(id, { status: 'EN_VERIFICATION', updatedAt: new Date().toISOString() });
      await db.timelineEvents.add({
        id: `te_val_${Date.now()}`,
        incidentId: id,
        actionType: 'VALIDATION',
        description: 'Dossier validé par l\'administrateur et mis en vérification.',
        visibility: 'PUBLIC',
        createdBy: 'ADMIN',
        createdAt: new Date().toISOString()
      });
      toast.success('Signalement validé et mis en vérification');
    } catch {
      toast.error('Erreur lors de la validation');
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (id: string) => {
    setProcessingId(id);
    try {
      await db.incidents.update(id, { status: 'FAUSSE_ALERTE', updatedAt: new Date().toISOString() });
      await db.timelineEvents.add({
        id: `te_rej_${Date.now()}`,
        incidentId: id,
        actionType: 'STATUS_CHANGE',
        description: 'Signalement rejeté par l\'administrateur — fausse alerte.',
        visibility: 'INTERNAL',
        createdBy: 'ADMIN',
        createdAt: new Date().toISOString()
      });
      toast.success('Signalement rejeté');
    } catch {
      toast.error('Erreur lors du rejet');
    } finally {
      setProcessingId(null);
    }
  };

  const handleConfirm = async (id: string) => {
    setProcessingId(id);
    try {
      await db.incidents.update(id, { status: 'ENQUETE_EN_COURS', updatedAt: new Date().toISOString() });
      await db.timelineEvents.add({
        id: `te_conf_${Date.now()}`,
        incidentId: id,
        actionType: 'STATUS_CHANGE',
        description: 'Dossier confirmé par l\'administrateur. Enquête en cours.',
        visibility: 'PUBLIC',
        createdBy: 'ADMIN',
        createdAt: new Date().toISOString()
      });
      toast.success('Dossier confirmé — enquête lancée');
    } catch {
      toast.error('Erreur');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Validation des Dossiers</h1>
        <p className="text-slate-500 text-sm">Examinez et validez les nouveaux signalements</p>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setFilter('NOUVEAU')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            filter === 'NOUVEAU'
              ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className={`w-5 h-5 ${filter === 'NOUVEAU' ? 'text-amber-600' : 'text-slate-400'}`} />
            <span className={`text-sm font-bold ${filter === 'NOUVEAU' ? 'text-amber-700 dark:text-amber-400' : 'text-slate-600 dark:text-slate-400'}`}>En attente</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{counts?.nouveau || 0}</p>
          <p className="text-xs text-slate-500 mt-1">À valider ou rejeter</p>
        </button>
        <button
          onClick={() => setFilter('EN_VERIFICATION')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            filter === 'EN_VERIFICATION'
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <Shield className={`w-5 h-5 ${filter === 'EN_VERIFICATION' ? 'text-purple-600' : 'text-slate-400'}`} />
            <span className={`text-sm font-bold ${filter === 'EN_VERIFICATION' ? 'text-purple-700 dark:text-purple-400' : 'text-slate-600 dark:text-slate-400'}`}>En vérification</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{counts?.enVerification || 0}</p>
          <p className="text-xs text-slate-500 mt-1">En cours de traitement</p>
        </button>
        <button
          onClick={() => setFilter('FAUSSE_ALERTE')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${
            filter === 'FAUSSE_ALERTE'
              ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
              : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
          }`}
        >
          <div className="flex items-center gap-2 mb-1">
            <XCircle className={`w-5 h-5 ${filter === 'FAUSSE_ALERTE' ? 'text-red-600' : 'text-slate-400'}`} />
            <span className={`text-sm font-bold ${filter === 'FAUSSE_ALERTE' ? 'text-red-700 dark:text-red-400' : 'text-slate-600 dark:text-slate-400'}`}>Rejetés</span>
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{counts?.fausse || 0}</p>
          <p className="text-xs text-slate-500 mt-1">Fausse alerte</p>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {!incidents?.length ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <CheckCircle2 className="w-12 h-12 text-emerald-300 dark:text-emerald-600 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucun dossier dans cette catégorie</p>
          </div>
        ) : (
          incidents.map(incident => (
            <div key={incident.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow flex flex-col">
              <div className="p-4 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center gap-2 mb-2 flex-wrap">
                  <Badge variant="outline" className="text-[10px] font-bold">#{incident.id.slice(-6)}</Badge>
                  <Badge variant={incident.type === 'DISPARITION' ? 'destructive' : incident.type === 'ENLEVEMENT' ? 'warning' : 'success'}>
                    {incident.type}
                  </Badge>
                  {incident.personAge && (
                    <Badge variant="secondary" className="text-[10px]">{incident.personAge.replace('_', ' ')}</Badge>
                  )}
                </div>
                <h3 className="font-bold text-sm text-slate-900 dark:text-white line-clamp-2">{incident.title}</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{incident.description}</p>
              </div>

              <div className="p-4 flex-1">
                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {incident.location.arrondissement || 'Douala'}</span>
                  <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true, locale: fr })}</span>
                </div>
                {incident.location.quartier && (
                  <p className="text-[10px] text-slate-400 mt-1 ml-4">{incident.location.quartier}</p>
                )}
              </div>

              {filter === 'NOUVEAU' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 text-green-600 border-green-200 hover:bg-green-50 dark:border-green-800 dark:hover:bg-green-900/20"
                    onClick={() => handleValidate(incident.id)}
                    disabled={processingId === incident.id}
                  >
                    {processingId === incident.id ? '...' : 'Valider'}
                  </Button>
                  <Button
                    variant="destructive"
                    size="sm"
                    className="flex-1"
                    onClick={() => handleReject(incident.id)}
                    disabled={processingId === incident.id}
                  >
                    {processingId === incident.id ? '...' : 'Rejeter'}
                  </Button>
                </div>
              )}
              {filter === 'EN_VERIFICATION' && (
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800">
                  <Button
                    size="sm"
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={() => handleConfirm(incident.id)}
                    disabled={processingId === incident.id}
                  >
                    {processingId === incident.id ? '...' : 'Confirmer & Lancer Enquête'}
                  </Button>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};
