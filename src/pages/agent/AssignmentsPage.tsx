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
import { MapPin, Clock, CheckCircle } from 'lucide-react';
import { TYPE_DISPLAY, STATUS_DISPLAY } from '../../lib/workflows';

export const AgentAssignmentsPage = () => {
  const { user } = useAuthStore();
  const [acceptingId, setAcceptingId] = useState<string | null>(null);

  const assignments = useLiveQuery(
    () => user?.serviceId
      ? db.incidents
          .where('assignedServiceId')
          .equals(user.serviceId)
          .filter(inc => inc.status === 'NOUVEAU' && !inc.assignedTo)
          .toArray()
      : [],
    [user]
  );

  const handleAccept = async (incidentId: string) => {
    if (!user) return;
    setAcceptingId(incidentId);
    try {
      await db.incidents.update(incidentId, {
        assignedTo: user.id,
        status: 'EN_VERIFICATION',
        updatedAt: new Date().toISOString(),
      });

      await db.timelineEvents.add({
        id: `te_accept_${incidentId}_${Date.now()}`,
        incidentId,
        actionType: 'AFFECTATION',
        description: `Dossier accepté par l'agent ${user.name}. Prise en charge enquête.`,
        visibility: 'INTERNAL',
        createdBy: user.id,
        createdAt: new Date().toISOString(),
      });

      toast.success('Dossier accepté et affecté à votre enquête');
    } catch {
      toast.error("Erreur lors de l'acceptation du dossier");
    } finally {
      setAcceptingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mes Affectations</h1>
        <p className="text-slate-400 text-sm">Dossiers affectés à votre commissariat en attente de prise en charge</p>
      </div>

      {!assignments || assignments.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center text-slate-500">
            <CheckCircle className="w-10 h-10 mx-auto mb-3 text-emerald-500/40" />
            <p className="font-medium">Aucune nouvelle affectation</p>
            <p className="text-xs text-slate-600 mt-1">Tous les dossiers de votre service ont été traités.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {assignments.map((incident) => (
            <Card key={incident.id} className="hover:border-slate-700 transition-colors border-l-4 border-l-amber-500">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={incident.type === 'ENLEVEMENT' ? 'destructive' : 'warning'}>
                        {TYPE_DISPLAY[incident.type]?.emoji} {TYPE_DISPLAY[incident.type]?.label}
                      </Badge>
                      <Badge variant="outline">NOUVEAU</Badge>
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
                  <Button
                    size="sm"
                    className="bg-amber-600 hover:bg-amber-700 text-white shrink-0"
                    onClick={() => handleAccept(incident.id)}
                    disabled={acceptingId === incident.id}
                  >
                    {acceptingId === incident.id ? (
                      <span className="flex items-center gap-1">
                        <span className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Traitement...
                      </span>
                    ) : (
                      'Accepter le dossier'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};
