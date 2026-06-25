import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { AlertTriangle, MapPin, Phone, Clock, CheckCircle2, ShieldAlert, Eye, MessageSquareWarning } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';

export const SupervisorDashboard = () => {
  // Stats
  const activeSOS = useLiveQuery(() => db.sosAlerts.where('status').equals('ACTIVE').reverse().toArray(), []);
  const pendingIncidents = useLiveQuery(() => db.incidents.where('status').equals('NOUVEAU').count(), []);
  const pendingObservations = useLiveQuery(() => db.observations.where('status').equals('NOUVEAU').count(), []);
  const pendingRumors = useLiveQuery(() => db.rumors.where('status').equals('PENDING').count(), []);

  const handleResolveSOS = async (id: string) => {
    try {
      await db.sosAlerts.update(id, { status: 'RESOLVED', resolvedAt: new Date().toISOString() });
      toast.success('Alerte SOS résolue');
    } catch (err) {
      toast.error('Erreur lors de la résolution');
    }
  };

  return (
    <div className="space-y-6 pb-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Tableau de Bord Superviseur</h1>
        <p className="text-slate-500 text-sm">Aperçu en temps réel de l'activité du Centre de Supervision Urbain</p>
      </div>

      {/* SOS Alerts Section (Highest Priority) */}
      {activeSOS && activeSOS.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-bold text-red-600 flex items-center gap-2 uppercase tracking-wide">
            <AlertTriangle className="w-4 h-4 animate-pulse" />
            Alertes SOS Critiques ({activeSOS.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activeSOS.map(sos => (
              <div key={sos.id} className="bg-red-500 text-white rounded-2xl p-5 shadow-lg shadow-red-500/20 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
                <div className="relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <span className="bg-white/20 px-2 py-1 rounded text-xs font-bold flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(sos.createdAt), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  <h3 className="font-black text-xl mb-1">Alerte Déclenchée</h3>
                  <div className="space-y-2 mt-4 text-sm font-medium text-red-50">
                    <p className="flex items-center gap-2 bg-red-600/50 p-2 rounded-lg">
                      <MapPin className="w-4 h-4" /> Lat: {sos.location.lat.toFixed(4)}, Lng: {sos.location.lng.toFixed(4)}
                    </p>
                    <p className="flex items-center gap-2 bg-red-600/50 p-2 rounded-lg">
                      <Phone className="w-4 h-4" /> Citoyen ID: {sos.userId}
                    </p>
                  </div>
                  <button 
                    onClick={() => handleResolveSOS(sos.id)}
                    className="w-full mt-4 bg-white text-red-600 hover:bg-red-50 font-bold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-4 h-4" /> Marquer comme traité
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Grid */}
      <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 pt-2">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center shrink-0">
            <ShieldAlert className="w-6 h-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Dossiers à valider</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{pendingIncidents || 0}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-orange-100 dark:bg-orange-900/30 flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Observations à traiter</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{pendingObservations || 0}</p>
          </div>
        </div>
        
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-6 rounded-3xl shadow-sm flex items-center gap-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center shrink-0">
            <MessageSquareWarning className="w-6 h-6 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 font-medium">Rumeurs à vérifier</p>
            <p className="text-3xl font-black text-slate-900 dark:text-white">{pendingRumors || 0}</p>
          </div>
        </div>
      </div>
    </div>
  );
};
