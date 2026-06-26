import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { UserPlus } from 'lucide-react';

export const SupervisorValidationPage = () => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const incidents = useLiveQuery(() => db.incidents.where('status').equals('NOUVEAU').toArray(), []);
  const agents = useLiveQuery(() => db.users.where('role').equals('AGENT').toArray(), []);
  const services = useLiveQuery(() => db.services.toArray(), []);

  const handleValidate = async (id: string) => {
    setProcessingId(id);
    try {
      await db.incidents.update(id, { status: 'EN_VERIFICATION', updatedAt: new Date().toISOString() });
      toast.success('Signalement mis en vérification ✓');
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
      toast.success('Signalement rejeté');
    } catch {
      toast.error('Erreur lors du rejet');
    } finally {
      setProcessingId(null);
    }
  };

  const handleAssign = async (incidentId: string) => {
    if (!selectedAgent) {
      toast.error('Sélectionnez un agent');
      return;
    }
    setAssigningId(incidentId);
    try {
      const agent = agents?.find(a => a.id === selectedAgent);
      await db.incidents.update(incidentId, {
        assignedTo: selectedAgent,
        assignedServiceId: agent?.serviceId,
        status: 'EN_VERIFICATION',
        updatedAt: new Date().toISOString()
      });
      await db.timelineEvents.add({
        id: `te_assign_${Date.now()}`,
        incidentId,
        actionType: 'ASSIGNMENT',
        description: `Dossier assigné à l'agent: ${agent?.name || selectedAgent} par le superviseur.`,
        visibility: 'INTERNAL',
        createdBy: 'SUPERVISEUR',
        createdAt: new Date().toISOString()
      });
      toast.success('Dossier assigné avec succès');
      setSelectedAgent('');
      setAssigningId(null);
    } catch {
      toast.error("Erreur lors de l'assignation");
      setAssigningId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Validation des Dossiers</h1>
        <p className="text-slate-400 text-sm">Nouveaux signalements en attente de vérification</p>
      </div>
      
      <div className="grid gap-4">
        {!incidents?.length ? (
          <Card><CardContent className="p-6 text-center text-slate-500">Aucun dossier en attente de validation.</CardContent></Card>
        ) : (
          incidents.map(incident => (
            <Card key={incident.id} className="border-l-4 border-l-purple-500">
              <CardContent className="p-6 flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex gap-2 mb-2 flex-wrap">
                    <Badge variant={incident.type === 'DISPARITION' ? 'destructive' : 'warning'}>{incident.type}</Badge>
                    <Badge variant="outline">NOUVEAU</Badge>
                    <span className="text-xs text-slate-500 ml-auto">
                      Signalé par: {incident.reportedBy}
                    </span>
                  </div>
                  <h3 className="font-semibold text-lg">{incident.title}</h3>
                  <p className="text-sm text-slate-400 mt-1 line-clamp-2">{incident.description}</p>
                  <div className="flex gap-3 mt-2 text-xs text-slate-500">
                    <span>📍 {incident.location.arrondissement || 'Douala'}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0 md:w-64">
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      className="flex-1 text-green-500 border-green-500/20 hover:bg-green-500/10"
                      onClick={() => handleValidate(incident.id)}
                      disabled={processingId === incident.id}
                    >
                      {processingId === incident.id ? '...' : '✓ Valider'}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 text-red-500 border-red-500/20 hover:bg-red-500/10"
                      onClick={() => handleReject(incident.id)}
                      disabled={processingId === incident.id}
                    >
                      {processingId === incident.id ? '...' : '✕ Rejeter'}
                    </Button>
                  </div>
                  <div className="flex gap-2">
                    <select
                      value={selectedAgent}
                      onChange={(e) => setSelectedAgent(e.target.value)}
                      className="flex-1 px-2 py-1.5 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="">Agent...</option>
                      {agents?.map(a => {
                        const svc = services?.find(s => s.id === a.serviceId);
                        return (
                          <option key={a.id} value={a.id}>
                            {a.name} {svc ? `(${svc.name})` : ''}
                          </option>
                        );
                      })}
                    </select>
                    <Button
                      size="sm"
                      className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                      onClick={() => handleAssign(incident.id)}
                      disabled={!selectedAgent || assigningId === incident.id}
                    >
                      <UserPlus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
