import { useState } from 'react';
import { useAuthStore } from '../../stores/authStore';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { MapPin, Calendar, ChevronRight, AlertTriangle, Eye, CheckCircle2, Search, Baby, User, UserCheck, Footprints, Brain, Car, HelpCircle, X, Clock, Activity, Flag } from 'lucide-react';
import { cn } from '../../lib/utils';
import type { Incident, TimelineEvent } from '../../types';

const STATUS_TABS = ['Tous', 'En cours', 'Résolus', 'Rejetés'];

const INCIDENT_TYPE_LABELS: Record<string, { label: string, icon: any, color: string }> = {
  FUGUE: { label: 'Fugue', icon: Footprints, color: 'text-amber-500 bg-amber-500/10' },
  DISPARITION: { label: 'Disparition', icon: HelpCircle, color: 'text-blue-500 bg-blue-500/10' },
  ENLEVEMENT: { label: 'Enlèvement', icon: AlertTriangle, color: 'text-rose-600 bg-rose-500/10' },
  TROUBLE_COGNITIF: { label: 'Trouble cognitif', icon: Brain, color: 'text-purple-500 bg-purple-500/10' },
  ACCIDENT_SUSPECT: { label: 'Accident suspect', icon: Car, color: 'text-orange-500 bg-orange-500/10' },
  AUTRE: { label: 'Autre', icon: HelpCircle, color: 'text-gray-500 bg-gray-500/10' },
};

const STATUS_LABELS: Record<string, { label: string, color: string }> = {
  NOUVEAU: { label: 'Nouveau', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' },
  EN_VERIFICATION: { label: 'En vérification', color: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' },
  FUGUE_PRESUMEE: { label: 'Fugue présumée', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  DISPARITION_CONFIRMEE: { label: 'Disparition confirmée', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400' },
  ENLEVEMENT_CONFIRME: { label: 'Enlèvement confirmé', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  ALERTE_CRITIQUE: { label: 'Alerte critique', color: 'bg-red-200 text-red-800 dark:bg-red-900/40 dark:text-red-300' },
  RECHERCHE: { label: 'Recherche active', color: 'bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-400' },
  ENQUETE_EN_COURS: { label: 'Enquête en cours', color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400' },
  LOCALISE: { label: 'Localisé', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  RETROUVE: { label: 'Retrouvé', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' },
  CLOTURE: { label: 'Clôturé', color: 'bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-400' },
  FAUSSE_ALERTE: { label: 'Fausse alerte', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400' },
  CORRESPONDANCE_EN_ATTENTE: { label: 'Correspondance en attente', color: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-400' },
};

export const CitizenMesSignalementsPage = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('Tous');
  const [selectedIncident, setSelectedIncident] = useState<Incident | null>(null);

  const incidents = useLiveQuery(
    () => db.incidents.where('reportedBy').equals(user?.id || '').reverse().toArray(),
    [user?.id]
  );

  const timelineEvents = useLiveQuery(
    () => selectedIncident 
      ? db.timelineEvents
          .where('incidentId')
          .equals(selectedIncident.id)
          .filter(e => e.visibility === 'PUBLIC')
          .reverse()
          .toArray()
      : [],
    [selectedIncident?.id]
  );

  const filtered = (incidents || []).filter(r => {
    if (activeTab === 'Tous') return true;
    if (activeTab === 'En cours') return !['RETROUVE', 'CLOTURE', 'FAUSSE_ALERTE'].includes(r.status);
    if (activeTab === 'Résolus') return ['RETROUVE', 'CLOTURE'].includes(r.status);
    if (activeTab === 'Rejetés') return r.status === 'FAUSSE_ALERTE';
    return true;
  });

  const getProgressPercent = (report: Incident) => {
    const steps: Record<string, number> = { 
      NOUVEAU: 10, 
      EN_VERIFICATION: 25, 
      FUGUE_PRESUMEE: 40,
      DISPARITION_CONFIRMEE: 50, 
      ENLEVEMENT_CONFIRME: 50,
      ALERTE_CRITIQUE: 60,
      RECHERCHE: 65,
      ENQUETE_EN_COURS: 75,
      CORRESPONDANCE_EN_ATTENTE: 80,
      LOCALISE: 90, 
      RETROUVE: 100, 
      CLOTURE: 100, 
      FAUSSE_ALERTE: 0 
    };
    return steps[report.status] || 0;
  };

  return (
    <div className="px-4 pt-4 pb-6 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Mes Signalements</h2>
        <span className="text-xs text-gray-500 bg-gray-100 dark:bg-gray-800 px-2.5 py-1 rounded-full font-medium">
          {incidents?.length || 0} total
        </span>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              'flex-shrink-0 px-4 py-2 rounded-xl text-sm font-semibold transition-all',
              activeTab === tab
                ? 'bg-blue-600 text-white shadow-sm'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800'
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Reports list */}
      {!filtered || filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-center bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-3xl mt-4">
          <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Search className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun signalement</h3>
          <p className="text-sm text-gray-500">Vous n'avez pas encore de signalements dans cette catégorie.</p>
        </div>
      ) : (
        <div className="space-y-4 mt-4">
          {filtered.map(report => {
            const TypeIcon = INCIDENT_TYPE_LABELS[report.type]?.icon || Eye;
            return (
              <div
                key={report.id}
                onClick={() => setSelectedIncident(report)}
                className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-200/60 dark:border-gray-800 p-5 cursor-pointer hover:shadow-md transition-all group"
              >
                <div className="flex items-start gap-4">
                  <div className={cn("w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0", INCIDENT_TYPE_LABELS[report.type]?.color)}>
                    <TypeIcon className="w-6 h-6" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <h3 className="text-sm font-semibold text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors truncate">
                          {report.title}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1 line-clamp-1">{report.description}</p>
                      </div>
                      <div className="flex-shrink-0">
                         <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider', STATUS_LABELS[report.status]?.color)}>
                          {STATUS_LABELS[report.status]?.label}
                        </span>
                      </div>
                    </div>

                    <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-gray-500">
                      <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" />{report.location.arrondissement || 'Douala'}{report.location.quartier ? ` - ${report.location.quartier}` : ''}</span>
                      <span className="flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" />{format(new Date(report.createdAt), 'dd MMM yyyy', { locale: fr })}</span>
                      {report.personAge && (
                         <span className="flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md font-medium text-gray-600 dark:text-gray-300">
                           {report.personAge === 'ENFANT_MINEUR' ? 'Enfant mineur' : report.personAge === 'PERSONNE_AGEE' ? 'Personne âgée' : 'Adulte'}
                         </span>
                      )}
                    </div>

                    {/* Progress bar */}
                    {!['FAUSSE_ALERTE'].includes(report.status) && (
                      <div className="mt-4">
                        <div className="flex justify-between text-[10px] font-semibold uppercase tracking-wider text-gray-400 mb-1.5">
                          <span>Progression</span>
                          <span>{getProgressPercent(report)}%</span>
                        </div>
                        <div className="h-2 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
                          <div
                            className={cn(
                              'h-full rounded-full transition-all duration-500',
                              ['RETROUVE', 'CLOTURE'].includes(report.status) ? 'bg-emerald-500' : 'bg-blue-600'
                            )}
                            style={{ width: `${getProgressPercent(report)}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Slide-over panel for Incident Details & Timeline */}
      {selectedIncident && (
        <div className="fixed inset-0 z-50 flex justify-end">
          <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setSelectedIncident(null)} />
          <div className="relative w-full max-w-md bg-white dark:bg-slate-900 h-full overflow-y-auto shadow-2xl animate-in slide-in-from-bottom sm:slide-in-from-right duration-300">
            {/* Header */}
            <div className="sticky top-0 z-10 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 py-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <button onClick={() => setSelectedIncident(null)} className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500">
                  <X className="w-4 h-4" />
                </button>
                <h2 className="font-bold text-slate-900 dark:text-white">Détails du dossier</h2>
              </div>
              <span className={cn('px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider', STATUS_LABELS[selectedIncident.status]?.color)}>
                {STATUS_LABELS[selectedIncident.status]?.label}
              </span>
            </div>

            <div className="p-5 space-y-8">
              {/* Info Section */}
              <div>
                <h3 className="text-xl font-black text-slate-900 dark:text-white mb-2">{selectedIncident.title}</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-4">{selectedIncident.description}</p>
                <div className="flex flex-wrap gap-2">
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg">
                    <MapPin className="w-3.5 h-3.5" />
                    {selectedIncident.location.arrondissement || 'Lieu inconnu'}{selectedIncident.location.quartier ? ` - ${selectedIncident.location.quartier}` : ''}
                  </span>
                  <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg">
                    <Calendar className="w-3.5 h-3.5" />
                    {format(new Date(selectedIncident.createdAt), 'dd MMM yyyy à HH:mm', { locale: fr })}
                  </span>
                  {selectedIncident.personAge && (
                     <span className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-slate-100 dark:bg-slate-800 px-2.5 py-1.5 rounded-lg">
                       <User className="w-3.5 h-3.5" />
                       {selectedIncident.personAge === 'ENFANT_MINEUR' ? 'Enfant mineur' : selectedIncident.personAge === 'PERSONNE_AGEE' ? 'Personne âgée' : 'Adulte'}
                     </span>
                  )}
                </div>
              </div>

              {/* Timeline Section */}
              <div>
                <div className="flex items-center gap-2 mb-6">
                  <Activity className="w-5 h-5 text-blue-500" />
                  <h4 className="font-bold text-slate-900 dark:text-white">Ligne de vie du dossier</h4>
                </div>

                <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-700 before:to-transparent">
                  
                  {/* Create Event (Always present at the bottom conceptually, but sorted reverse) */}
                  
                  {timelineEvents && timelineEvents.length > 0 ? (
                    timelineEvents.map((event, index) => (
                      <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-400 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                          {event.actionType === 'OBSERVATION' ? <Eye className="w-4 h-4" /> : <Flag className="w-4 h-4" />}
                        </div>
                        <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 shadow-sm">
                          <div className="flex items-center justify-between mb-1">
                            <h5 className="font-bold text-slate-900 dark:text-white text-sm">{event.actionType}</h5>
                            <time className="text-[10px] font-medium text-slate-400">{format(new Date(event.createdAt), 'HH:mm', { locale: fr })}</time>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{event.description}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center p-4 text-sm text-slate-500 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-dashed border-slate-200 dark:border-slate-700 ml-12 md:ml-0">
                      Aucune mise à jour publique pour le moment.
                    </div>
                  )}

                  {/* Initial Event */}
                  <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 bg-slate-100 dark:bg-slate-800 text-slate-500 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center justify-between mb-1">
                        <h5 className="font-bold text-slate-700 dark:text-slate-300 text-sm">Signalement créé</h5>
                        <time className="text-[10px] font-medium text-slate-400">{format(new Date(selectedIncident.createdAt), 'HH:mm', { locale: fr })}</time>
                      </div>
                      <p className="text-xs text-slate-500 leading-relaxed">Votre signalement a été enregistré dans le système.</p>
                    </div>
                  </div>

                </div>
              </div>

            </div>
          </div>
        </div>
      )}
    </div>
  );
};
