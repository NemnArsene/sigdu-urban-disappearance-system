import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { toast } from 'sonner';
import { AlertTriangle, MapPin, Phone, Clock, CheckCircle2, User, Mail, ShieldAlert, Building } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const SOSPage = () => {
  const [assigningId, setAssigningId] = useState<string | null>(null);

  const data = useLiveQuery(async () => {
    const alerts = await db.sosAlerts.where('status').equals('ACTIVE').reverse().toArray();
    
    // Fetch related users
    const userIds = [...new Set(alerts.map(a => a.userId))];
    const users = await db.users.where('id').anyOf(userIds).toArray();
    const usersMap = Object.fromEntries(users.map(u => [u.id, u]));

    // Fetch services for assignment
    const services = await db.services.toArray();
    
    return { alerts, usersMap, services };
  }, []);

  const handleResolveSOS = async (id: string) => {
    try {
      await db.sosAlerts.update(id, { status: 'RESOLVED', resolvedAt: new Date().toISOString() });
      toast.success('Alerte SOS marquée comme traitée et résolue.');
    } catch (err) {
      toast.error('Erreur lors de la résolution de l\'alerte.');
    }
  };

  const handleAssignService = async (sosId: string, serviceId: string) => {
    if (!serviceId) return;
    try {
      await db.sosAlerts.update(sosId, { assignedServiceId: serviceId });
      toast.success('SOS assigné au commissariat avec succès.');
      setAssigningId(null);
    } catch (err) {
      toast.error('Erreur lors de l\'assignation.');
    }
  };

  if (!data) return (
    <div className="flex items-center justify-center h-full">
      <div className="w-8 h-8 border-4 border-red-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const { alerts, usersMap, services } = data;

  return (
    <div className="space-y-6 pb-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-100 dark:bg-red-900/30 flex items-center justify-center">
              <ShieldAlert className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            Urgences SOS
          </h1>
          <p className="text-slate-500 text-sm mt-1">Gestion des alertes de détresse en temps réel</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 px-4 py-2 rounded-xl border border-red-100 dark:border-red-900/30 flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="font-bold text-red-700 dark:text-red-400">{alerts.length} actif(s)</span>
        </div>
      </div>

      {alerts.length === 0 ? (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-12 text-center flex flex-col items-center justify-center shadow-sm">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center mb-4">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Aucune alerte SOS active</h3>
          <p className="text-slate-500">La situation est calme. Toutes les urgences ont été traitées.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {alerts.map(sos => {
            const citizen = usersMap[sos.userId];
            const assignedService = services.find(s => s.id === sos.assignedServiceId);

            return (
              <div key={sos.id} className="bg-white dark:bg-slate-900 rounded-3xl border border-red-200 dark:border-red-900/50 shadow-lg overflow-hidden flex flex-col group hover:shadow-xl transition-shadow">
                {/* Header (Red) */}
                <div className="bg-red-600 p-5 relative overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/3" />
                  <div className="relative z-10 flex justify-between items-start">
                    <div className="flex items-center gap-2 text-white/90 bg-black/20 px-2.5 py-1 rounded-lg text-xs font-bold">
                      <Clock className="w-3.5 h-3.5" />
                      {formatDistanceToNow(new Date(sos.createdAt), { addSuffix: true, locale: fr })}
                    </div>
                    {sos.assignedServiceId && (
                      <span className="bg-white text-red-700 px-2.5 py-1 rounded-lg text-xs font-black shadow-sm">
                        ASSIGNÉ
                      </span>
                    )}
                  </div>
                  <h3 className="font-black text-white text-xl mt-4 flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 animate-pulse" />
                    SOS DÉCLENCHÉ
                  </h3>
                </div>

                {/* Citizen Info */}
                <div className="p-5 flex-1 space-y-4">
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Citoyen en détresse</h4>
                    
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {citizen?.photo ? (
                          <img src={citizen.photo} alt="Profil" className="w-full h-full rounded-full object-cover" />
                        ) : (
                          <User className="w-5 h-5 text-slate-400" />
                        )}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate text-base">{citizen?.name || 'Citoyen Inconnu'}</p>
                        <p className="text-xs text-slate-500 font-medium">ID: {sos.userId.slice(0, 8)}...</p>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-3 space-y-2 border border-slate-100 dark:border-slate-800">
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <Phone className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="font-medium truncate">{citizen?.phone || 'Non renseigné'}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700 dark:text-slate-300">
                        <Mail className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="truncate">{citizen?.email || 'Non renseigné'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest">Localisation</h4>
                    <div className="flex items-start gap-2 bg-red-50 dark:bg-red-900/10 p-3 rounded-xl border border-red-100 dark:border-red-900/30">
                      <MapPin className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-bold text-slate-900 dark:text-white">{sos.location.address || 'Position GPS'}</p>
                        <p className="text-xs font-mono text-red-600 dark:text-red-400 mt-1">
                          {sos.location.lat.toFixed(6)}, {sos.location.lng.toFixed(6)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Assignment Section */}
                  <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
                    {assignedService ? (
                      <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-xl border border-blue-100 dark:border-blue-900/30">
                        <h4 className="text-[10px] font-bold text-blue-500 uppercase tracking-widest mb-1.5">Pris en charge par</h4>
                        <div className="flex items-center gap-2">
                          <Building className="w-4 h-4 text-blue-600" />
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">{assignedService.name}</p>
                        </div>
                        <button 
                          onClick={() => setAssigningId(sos.id)}
                          className="text-xs text-blue-600 font-medium mt-2 hover:underline"
                        >
                          Réassigner
                        </button>
                      </div>
                    ) : (
                      assigningId === sos.id ? (
                        <div className="space-y-2">
                          <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Choisir un commissariat</label>
                          <select 
                            className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none transition-all"
                            onChange={(e) => handleAssignService(sos.id, e.target.value)}
                            defaultValue=""
                          >
                            <option value="" disabled>Sélectionner...</option>
                            {services.map(s => (
                              <option key={s.id} value={s.id}>{s.name} ({s.arrondissement || 'Global'})</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => setAssigningId(null)}
                            className="text-xs text-slate-500 hover:text-slate-700 w-full text-center py-1"
                          >
                            Annuler
                          </button>
                        </div>
                      ) : (
                        <button 
                          onClick={() => setAssigningId(sos.id)}
                          className="w-full py-2.5 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 font-bold text-sm hover:border-slate-300 dark:hover:border-slate-600 hover:text-slate-700 dark:hover:text-slate-300 transition-colors flex items-center justify-center gap-2"
                        >
                          <Building className="w-4 h-4" /> Assigner à un commissariat
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Footer Action */}
                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 shrink-0">
                  <button 
                    onClick={() => handleResolveSOS(sos.id)}
                    className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 font-bold py-3 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    <CheckCircle2 className="w-5 h-5" /> Marquer comme résolu
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
