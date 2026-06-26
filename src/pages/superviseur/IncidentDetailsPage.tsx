import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { ChevronLeft, Clock, User, MapPin, FileText, AlertTriangle, Eye, ShieldAlert, Badge as BadgeIcon, CheckSquare, Users } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../../lib/utils';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const SupervisorIncidentDetailsPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const incident = useLiveQuery(() => id ? db.incidents.get(id) : undefined, [id]);
  const timelineEvents = useLiveQuery(async () => {
    if (!id) return [];
    const events = await db.timelineEvents.where('incidentId').equals(id).toArray();
    return events.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [id]);

  if (!incident) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(-1)}
          className="p-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-slate-600 dark:text-slate-400"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Dossier #{incident.id.slice(-6)}</span>
            <Badge className={
              incident.status === 'EN_VERIFICATION' ? 'bg-purple-100 text-purple-700' :
              incident.status === 'RETROUVE' ? 'bg-emerald-100 text-emerald-700' :
              'bg-blue-100 text-blue-700'
            }>
              {incident.status}
            </Badge>
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">{incident.title}</h1>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Details */}
        <div className="lg:col-span-1 space-y-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-500" />
              Informations Générales
            </h3>
            
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1">Type de Signalement</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{incident.type}</p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1">Localisation Initiale</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {incident.location.arrondissement || 'Non spécifié'}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1">Description</p>
                <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl">
                  {incident.description}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium text-slate-400 mb-1">Date d'ouverture</p>
                <p className="text-sm font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {format(new Date(incident.createdAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
            <h3 className="font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-indigo-500" />
              Impliqués
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-3 bg-slate-50 dark:bg-slate-800/50 p-3 rounded-xl border border-slate-100 dark:border-slate-800">
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center shrink-0">
                  <User className="w-4 h-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-400">Signalant</p>
                  <p className="text-sm font-bold text-slate-700 dark:text-slate-300">{incident.reportedBy}</p>
                </div>
              </div>
              
              {incident.assignedTo && (
                <div className="flex items-center gap-3 bg-indigo-50 dark:bg-indigo-900/20 p-3 rounded-xl border border-indigo-100 dark:border-indigo-800/30">
                  <div className="w-8 h-8 rounded-full bg-indigo-200 dark:bg-indigo-800/50 flex items-center justify-center shrink-0">
                    <BadgeIcon className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-indigo-400">Agent en charge</p>
                    <p className="text-sm font-bold text-indigo-700 dark:text-indigo-300">{incident.assignedTo}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Timeline */}
        <div className="lg:col-span-2">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm h-full">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-500" />
                Chronologie Complète
              </h3>
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1.5 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md">
                  <div className="w-2 h-2 rounded-full bg-emerald-500" /> Public
                </span>
                <span className="flex items-center gap-1.5 text-xs font-medium text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-2 py-1 rounded-md">
                  <div className="w-2 h-2 rounded-full bg-amber-500" /> Interne
                </span>
              </div>
            </div>

            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-slate-200 dark:before:via-slate-800 before:to-transparent">
              {!timelineEvents?.length ? (
                <p className="text-sm text-slate-500 text-center relative z-10 py-8">Aucun événement enregistré.</p>
              ) : (
                timelineEvents.map((event) => (
                  <div key={event.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-white dark:border-slate-900 shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 shadow-sm z-10 bg-white dark:bg-slate-800">
                      {event.actionType === 'STATUS_CHANGE' && <ShieldAlert className="w-4 h-4 text-indigo-500" />}
                      {event.actionType === 'OBSERVATION' && <Eye className="w-4 h-4 text-orange-500" />}
                      {event.actionType === 'AFFECTATION' && <Users className="w-4 h-4 text-blue-500" />}
                      {event.actionType === 'ASSIGNMENT' && <User className="w-4 h-4 text-blue-500" />}
                      {event.actionType === 'VALIDATION' && <CheckSquare className="w-4 h-4 text-emerald-500" />}
                      {event.actionType === 'CREATION' && <AlertTriangle className="w-4 h-4 text-red-500" />}
                    </div>
                    
                    <div className="w-[calc(100%-3rem)] md:w-[calc(50%-2.5rem)] bg-slate-50 dark:bg-slate-800/50 p-4 rounded-xl border border-slate-100 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm">
                      <div className="flex items-center justify-between mb-2 gap-2">
                        <div className="flex flex-wrap items-center gap-2">
                          <span className={cn(
                            "text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider",
                            event.visibility === 'PUBLIC' ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
                          )}>
                            {event.visibility}
                          </span>
                          <span className="text-[10px] text-slate-500 font-medium bg-white dark:bg-slate-900 px-2 py-0.5 rounded border border-slate-200 dark:border-slate-700">
                            {event.actionType}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap">
                          {format(new Date(event.createdAt), 'HH:mm')}
                        </span>
                      </div>
                      <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {event.description}
                      </p>
                      <p className="text-[10px] text-slate-400 mt-2 text-right">
                        Par: {event.createdBy}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
