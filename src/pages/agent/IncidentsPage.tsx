import React, { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { useAuthStore } from '../../stores/authStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { toast } from 'sonner';
import { ChevronDown, ChevronUp, Clock, MapPin, User } from 'lucide-react';
import { cn } from '../../lib/utils';

export const AgentIncidentsPage = () => {
  const { user } = useAuthStore();
  const [filter, setFilter] = useState('ALL');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingId, setProcessingId] = useState<string | null>(null);

  const incidents = useLiveQuery(() => {
    if (filter === 'ALL') return db.incidents.toArray();
    return db.incidents.where('status').equals(filter).toArray();
  }, [filter]);

  const handleTakeCharge = async (id: string) => {
    if (!user) return;
    setProcessingId(id);
    try {
      await db.incidents.update(id, {
        assignedTo: user.id,
        status: 'EN_VERIFICATION',
        updatedAt: new Date().toISOString(),
      });
      toast.success('Signalement pris en charge ✓');
    } catch {
      toast.error('Erreur lors de la prise en charge');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Incidents</h1>
          <p className="text-slate-400 text-sm">Gérez et consultez les incidents signalés</p>
        </div>
        <div className="flex gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
          {['ALL', 'NOUVEAU', 'EN_VERIFICATION'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
                filter === f ? 'bg-amber-600 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              {f === 'ALL' ? 'Tous' : f.replace('_', ' ')}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-4">
        {!incidents?.length ? (
          <Card>
            <CardContent className="p-8 text-center text-slate-500">
              <p>Aucun incident trouvé</p>
            </CardContent>
          </Card>
        ) : (
          incidents?.map(incident => (
            <Card key={incident.id} className="hover:border-slate-700 transition-colors">
              <CardContent className="p-4 sm:p-6">
                <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                  <div className="flex-1 min-w-0 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant={incident.type === 'DISPARITION' ? 'destructive' : incident.type === 'ENLEVEMENT' ? 'warning' : 'success'}>
                        {incident.type}
                      </Badge>
                      <Badge variant="outline">{incident.status}</Badge>
                      <span className="text-xs text-slate-500">
                        {format(new Date(incident.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </span>
                    </div>
                    <h3 className="font-semibold text-lg">{incident.title}</h3>
                    <p className={cn(
                      "text-sm text-slate-400",
                      expandedId !== incident.id && "line-clamp-1"
                    )}>{incident.description}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {incident.location.arrondissement}</span>
                      {incident.assignedTo && (
                        <span className="flex items-center gap-1"><User className="w-3 h-3" /> Pris en charge</span>
                      )}
                      {incident.reportedBy && (
                        <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> Signalé #{incident.reportedBy.slice(0, 6)}</span>
                      )}
                    </div>
                  </div>
                  <div className="flex sm:flex-col gap-2 shrink-0">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setExpandedId(expandedId === incident.id ? null : incident.id)}
                      className="flex items-center gap-1"
                    >
                      {expandedId === incident.id ? <><ChevronUp className="w-3 h-3" /> Résumé</> : <><ChevronDown className="w-3 h-3" /> Détails</>}
                    </Button>
                    {incident.status === 'NOUVEAU' && (
                      <Button
                        size="sm"
                        className="bg-amber-600 hover:bg-amber-700 text-white"
                        onClick={() => handleTakeCharge(incident.id)}
                        disabled={processingId === incident.id}
                      >
                        {processingId === incident.id ? '...' : 'Prendre en charge'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Expanded details */}
                {expandedId === incident.id && (
                  <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Signalé par</p>
                      <p className="text-slate-200 font-medium">{incident.reportedBy}</p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Date</p>
                      <p className="text-slate-200 font-medium">
                        {format(new Date(incident.createdAt), 'dd MMM yyyy HH:mm', { locale: fr })}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Localisation</p>
                      <p className="text-slate-200 font-medium">
                        {incident.location.lat.toFixed(4)}, {incident.location.lng.toFixed(4)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-slate-500 mb-1">Arrondissement</p>
                      <p className="text-slate-200 font-medium">{incident.location.arrondissement || 'Douala'}</p>
                    </div>
                    {incident.assignedTo && (
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500 mb-1">Assigné à</p>
                        <p className="text-slate-200 font-medium">{incident.assignedTo}</p>
                      </div>
                    )}
                    {incident.photos && incident.photos.length > 0 && (
                      <div className="col-span-2">
                        <p className="text-xs text-slate-500 mb-2">Photos ({incident.photos.length})</p>
                        <div className="flex gap-2">
                          {incident.photos.map((photo, i) => (
                            <img key={i} src={photo} alt="" className="w-20 h-20 rounded-lg object-cover border border-slate-700" />
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
