import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { MapPin, Clock, MessageSquarePlus, ChevronDown, ChevronUp, Send } from 'lucide-react';
import { TYPE_DISPLAY, STATUS_DISPLAY, getNextStatuses } from '../../lib/workflows';
import type { IncidentStatus } from '../../types';

export const AgentInvestigationsPage = () => {
  const { user } = useAuthStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');
  const [noteTargetId, setNoteTargetId] = useState<string | null>(null);
  const [statusTargetId, setStatusTargetId] = useState<string | null>(null);

  const investigations = useLiveQuery(
    () => user
      ? db.incidents
          .where('assignedTo')
          .equals(user.id)
          .filter(inc => !['CLOTURE', 'RETROUVE', 'FAUSSE_ALERTE'].includes(inc.status))
          .toArray()
      : [],
    [user]
  );

  const handleAddNote = async (incidentId: string) => {
    if (!user || !noteText.trim()) return;
    setNoteTargetId(incidentId);
    try {
      await db.timelineEvents.add({
        id: `te_note_${incidentId}_${Date.now()}`,
        incidentId,
        actionType: 'OBSERVATION',
        description: noteText.trim(),
        visibility: 'INTERNAL',
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      });
      setNoteText('');
      toast.success('Note ajoutée au dossier');
    } catch {
      toast.error("Erreur lors de l'ajout de la note");
    } finally {
      setNoteTargetId(null);
    }
  };

  const handleMarkLocated = async (incidentId: string) => {
    if (!user) return;
    setStatusTargetId(incidentId);
    try {
      await db.incidents.update(incidentId, {
        status: 'LOCALISE',
        updatedAt: new Date().toISOString(),
      });

      await db.timelineEvents.add({
        id: `te_located_${incidentId}_${Date.now()}`,
        incidentId,
        actionType: 'STATUS_CHANGE',
        description: `Personne localisée par l'agent ${user.name}. En attente de confirmation.`,
        visibility: 'PUBLIC',
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      });

      toast.success('Statut mis à jour : Localisé');
    } catch {
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setStatusTargetId(null);
    }
  };

  const getAvailableTransitions = (incident: { type: any; status: IncidentStatus }) => {
    return getNextStatuses(incident.type, incident.status).filter(
      s => !['CLOTURE', 'FAUSSE_ALERTE', 'RETROUVE'].includes(s)
    );
  };

  const handleStatusChange = async (incidentId: string, newStatus: IncidentStatus) => {
    if (!user) return;
    setStatusTargetId(incidentId);
    try {
      await db.incidents.update(incidentId, {
        status: newStatus,
        updatedAt: new Date().toISOString(),
      });

      await db.timelineEvents.add({
        id: `te_status_${incidentId}_${Date.now()}`,
        incidentId,
        actionType: 'STATUS_CHANGE',
        description: `Statut mis à jour vers "${STATUS_DISPLAY[newStatus]?.label}" par l'agent ${user.name}.`,
        visibility: 'INTERNAL',
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      });

      toast.success(`Statut mis à jour : ${STATUS_DISPLAY[newStatus]?.label}`);
    } catch {
      toast.error('Erreur lors de la mise à jour du statut');
    } finally {
      setStatusTargetId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mes Enquêtes</h1>
        <p className="text-slate-400 text-sm">Suivi des dossiers qui vous sont assignés</p>
      </div>

      {!investigations || investigations.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-slate-500">
            <MessageSquarePlus className="w-10 h-10 mx-auto mb-3 text-blue-500/40" />
            <p className="font-medium">Aucune enquête en cours</p>
            <p className="text-xs text-slate-600 mt-1">Acceptez un dossier depuis la page Affectations pour commencer.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {investigations.map((incident) => {
            const isExpanded = expandedId === incident.id;
            const transitions = getAvailableTransitions(incident);

            return (
              <Card key={incident.id} className="hover:border-slate-700 transition-colors">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                    <div className="flex-1 min-w-0 space-y-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={incident.type === 'ENLEVEMENT' ? 'destructive' : 'warning'}>
                          {TYPE_DISPLAY[incident.type]?.emoji} {TYPE_DISPLAY[incident.type]?.label}
                        </Badge>
                        <Badge variant="outline">
                          {STATUS_DISPLAY[incident.status]?.emoji} {STATUS_DISPLAY[incident.status]?.label}
                        </Badge>
                      </div>
                      <h3 className="font-semibold text-lg">{incident.title}</h3>
                      <p className="text-sm text-slate-400 line-clamp-2">{incident.description}</p>
                      <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3" />
                          {incident.location.arrondissement}, {incident.location.quartier}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(incident.createdAt), "dd MMM yyyy 'à' HH:mm", { locale: fr })}
                        </span>
                      </div>
                    </div>
                    <div className="flex sm:flex-col gap-2 shrink-0">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setExpandedId(isExpanded ? null : incident.id);
                          setNoteText('');
                        }}
                        className="flex items-center gap-1"
                      >
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {isExpanded ? 'Résumé' : 'Détails'}
                      </Button>
                      <Button
                        size="sm"
                        className="bg-emerald-600 hover:bg-emerald-700 text-white"
                        onClick={() => handleMarkLocated(incident.id)}
                        disabled={statusTargetId === incident.id}
                      >
                        {statusTargetId === incident.id ? '...' : '📍 Localisé'}
                      </Button>
                    </div>
                  </div>

                  {isExpanded && (
                    <div className="mt-4 pt-4 border-t border-slate-800 space-y-4">
                      {/* Quick status transitions */}
                      {transitions.length > 0 && (
                        <div>
                          <p className="text-xs text-slate-500 mb-2 font-medium">Changer le statut</p>
                          <div className="flex flex-wrap gap-2">
                            {transitions.map((s) => (
                              <Button
                                key={s}
                                variant="outline"
                                size="sm"
                                onClick={() => handleStatusChange(incident.id, s)}
                                disabled={statusTargetId === incident.id}
                                className="text-xs"
                              >
                                {STATUS_DISPLAY[s]?.emoji} {STATUS_DISPLAY[s]?.label}
                              </Button>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Add note */}
                      <div>
                        <p className="text-xs text-slate-500 mb-2 font-medium">Ajouter une note d'enquête</p>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' && noteText.trim()) {
                                handleAddNote(incident.id);
                              }
                            }}
                            placeholder="Décrivez votre avancement..."
                            className="flex-1 bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
                          />
                          <Button
                            size="sm"
                            className="bg-amber-600 hover:bg-amber-700 text-white"
                            onClick={() => handleAddNote(incident.id)}
                            disabled={!noteText.trim() || noteTargetId === incident.id}
                          >
                            <Send className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
