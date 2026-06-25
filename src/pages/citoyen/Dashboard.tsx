import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { ShieldAlert, AlertTriangle, ChevronRight, Eye, CheckCircle2, Shield, ArrowRight, ShieldCheck, Newspaper } from 'lucide-react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { SIGMap } from '../../components/map/SIGMap';

const STATUS_LABELS: Record<string, { label: string, color: string }> = {
  NOUVEAU: { label: 'Signalé', color: 'bg-slate-800 text-slate-100' },
  EN_VERIFICATION: { label: 'Vérification', color: 'bg-purple-900/50 text-purple-400 border border-purple-500/20' },
  DISPARITION_CONFIRMEE: { label: 'Disparition', color: 'bg-amber-900/50 text-amber-500 border border-amber-500/20' },
  ENLEVEMENT_CONFIRME: { label: 'Enlèvement', color: 'bg-red-900/50 text-red-500 border border-red-500/20' },
  ENQUETE_EN_COURS: { label: 'Enquête', color: 'bg-blue-900/50 text-blue-400 border border-blue-500/20' },
  LOCALISE: { label: 'Localisé', color: 'bg-emerald-900/50 text-emerald-400 border border-emerald-500/20' },
  RETROUVE: { label: 'Retrouvé', color: 'bg-emerald-900/50 text-emerald-500 border border-emerald-500/20' },
};

import { Search } from 'lucide-react';

export const CitizenDashboard = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();

  // Get active alerts (critical warnings)
  const activeAlerts = useLiveQuery(
    () => db.alerts.where('level').equals('CRITICAL').reverse().limit(1).toArray(),
    []
  );

  // Get recent incidents
  const recentIncidents = useLiveQuery(
    () => db.incidents.orderBy('createdAt').reverse().limit(5).toArray(),
    []
  );

  return (
    <div className="space-y-6 pb-6">
      {/* Smart Search Bar */}
      <div 
        onClick={() => navigate('/citoyen/recherche')}
        className="bg-white dark:bg-slate-900 rounded-2xl flex items-center gap-3 px-4 py-3.5 border border-slate-200 dark:border-slate-800 shadow-sm cursor-text group transition-colors hover:border-red-300 dark:hover:border-red-900/50"
      >
        <Search className="w-5 h-5 text-slate-400 group-hover:text-red-500 transition-colors" />
        <span className="text-slate-400 text-sm font-medium">Rechercher un dossier, un quartier...</span>
      </div>

      {/* Red Hero Card (from screenshot) */}
      <div className="bg-[#C82323] rounded-3xl p-6 sm:p-8 shadow-xl shadow-red-900/20 text-white relative overflow-hidden">
        {/* Decorative background shapes */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-red-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-black/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-yellow-400 font-semibold text-sm mb-4">
            <Shield className="w-4 h-4" />
            <span>Espace citoyen sécurisé</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl font-black mb-4 tracking-tight">
            Bienvenue, {user?.name.split(' ')[0]} 👋
          </h2>
          
          <p className="text-white/90 text-sm sm:text-base mb-8 max-w-sm leading-relaxed font-medium">
            Votre plateforme de signalement participatif pour la sécurité urbaine à Douala. Ensemble, protégeons nos proches.
          </p>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <button 
              onClick={() => navigate('/citoyen/signaler')}
              className="bg-white text-slate-900 font-bold px-6 py-3.5 rounded-xl flex items-center justify-between gap-3 w-full sm:w-auto hover:bg-slate-50 transition-colors active:scale-95 shadow-lg shadow-black/10"
            >
              Faire un signalement
              <ArrowRight className="w-5 h-5" />
            </button>
            <button 
              onClick={() => navigate('/citoyen/map')}
              className="text-white font-bold px-4 py-2 hover:bg-white/10 rounded-lg transition-colors"
            >
              Voir la carte
            </button>
          </div>
        </div>
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button 
          onClick={() => navigate('/citoyen/observation/nouvelle')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-start gap-3 active:scale-95 transition-transform text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-orange-100 dark:bg-orange-500/20 flex items-center justify-center">
            <Eye className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">J'ai vu une personne</h3>
            <p className="text-[10px] text-slate-500 font-medium">Signaler une observation spontanée</p>
          </div>
        </button>
        <button 
          onClick={() => navigate('/citoyen/actualite')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-start gap-3 active:scale-95 transition-transform text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center">
            <Newspaper className="w-5 h-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">Actualités</h3>
            <p className="text-[10px] text-slate-500 font-medium">Infos, alertes & vérification de rumeurs</p>
          </div>
        </button>
        <button 
          onClick={() => navigate('/citoyen/veilleur')}
          className="bg-white dark:bg-slate-900 rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-start gap-3 active:scale-95 transition-transform text-left"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-500/20 flex items-center justify-center">
            <ShieldCheck className="w-5 h-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 dark:text-white text-sm mb-0.5">Citoyen Veilleur</h3>
            <p className="text-[10px] text-slate-500 font-medium">Paramétrer vos alertes ciblées</p>
          </div>
        </button>
      </div>

      {/* Critical Alert Marquee */}
      {activeAlerts && activeAlerts.length > 0 && (
        <div className="bg-slate-900 rounded-2xl p-4 flex items-start gap-3 shadow-lg text-white animate-in slide-in-from-top-4">
          <AlertTriangle className="w-6 h-6 shrink-0 text-red-500 animate-pulse" />
          <div className="flex-1">
            <h3 className="font-bold text-sm leading-tight text-red-400">{activeAlerts[0].title}</h3>
            <p className="text-slate-300 text-xs mt-1 leading-relaxed">{activeAlerts[0].message}</p>
          </div>
        </div>
      )}

      {/* Mini Map View */}
      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Aperçu de la carte</h3>
          <button 
            onClick={() => navigate('/citoyen/map')}
            className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors flex items-center"
          >
            Plein écran <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>
        <div className="h-[200px] w-full rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm relative">
           {recentIncidents ? (
             <SIGMap incidents={recentIncidents} interactive={false} zoom={11} />
           ) : (
             <div className="absolute inset-0 bg-slate-100 dark:bg-slate-800 animate-pulse" />
           )}
           {/* Fade overlay so it looks like a preview */}
           <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent dark:from-slate-950/40 pointer-events-none" />
           <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10">
              <button 
                onClick={() => navigate('/citoyen/map')}
                className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md text-slate-900 dark:text-white text-xs font-bold px-4 py-2 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 hover:scale-105 transition-transform"
              >
                Explorer la zone
              </button>
           </div>
        </div>
      </div>

      {/* Recent Incidents Feed */}
      <div className="pt-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900 dark:text-white">Derniers signalements</h3>
          <button 
            onClick={() => navigate('/citoyen/mes-signalements')}
            className="text-xs font-semibold text-slate-500 hover:text-red-600 transition-colors flex items-center"
          >
            Voir tout <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>

        <div className="space-y-3">
          {(!recentIncidents || recentIncidents.length === 0) ? (
            <div className="text-center p-6 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
              <p className="text-slate-500 text-sm">Aucun signalement récent</p>
            </div>
          ) : (
            recentIncidents.slice(0,3).map(incident => (
              <div 
                key={incident.id}
                className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl p-4 flex items-center gap-4"
              >
                <div className={cn(
                  "w-10 h-10 rounded-full flex items-center justify-center shrink-0",
                  incident.type === 'FUGUE' ? 'bg-amber-100 dark:bg-amber-900/30' : 
                  incident.type === 'ENLEVEMENT' ? 'bg-red-100 dark:bg-red-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'
                )}>
                  {incident.type === 'FUGUE' ? <Eye className="w-5 h-5 text-amber-600 dark:text-amber-500" /> : 
                   incident.type === 'ENLEVEMENT' ? <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-500" /> :
                   <CheckCircle2 className="w-5 h-5 text-emerald-600 dark:text-emerald-500" />}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white truncate">
                    {incident.title}
                  </h4>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">
                    {incident.location.arrondissement || 'Douala'} • {format(new Date(incident.createdAt), 'dd MMM', { locale: fr })}
                  </p>
                </div>
                
                <span className={cn(
                  "px-2 py-1 rounded-md text-[10px] font-bold uppercase tracking-wider shrink-0",
                  STATUS_LABELS[incident.status]?.color || 'bg-slate-100 text-slate-500'
                )}>
                  {STATUS_LABELS[incident.status]?.label || 'En cours'}
                </span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
