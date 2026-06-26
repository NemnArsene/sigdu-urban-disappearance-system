import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { Search, MapPin, Clock, User, Trash2, CheckCircle2, UserPlus } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const SupervisorAffectationsPage = () => {
  const [filter, setFilter] = useState<'ALL' | 'AFFECTE' | 'NON_AFFECTE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedAgent, setSelectedAgent] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const incidents = useLiveQuery(() => db.incidents.orderBy('createdAt').reverse().toArray(), []);
  const agents = useLiveQuery(() => db.users.where('role').equals('AGENT').toArray(), []);
  const services = useLiveQuery(() => db.services.toArray(), []);

  const filtered = incidents?.filter(inc => {
    if (filter === 'AFFECTE' && !inc.assignedTo) return false;
    if (filter === 'NON_AFFECTE' && inc.assignedTo) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return inc.title.toLowerCase().includes(q) || inc.description.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    total: incidents?.length || 0,
    affecte: incidents?.filter(i => i.assignedTo).length || 0,
    nonAffecte: incidents?.filter(i => !i.assignedTo).length || 0,
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

  const handleUnassign = async (incidentId: string) => {
    setDeletingId(incidentId);
    try {
      await db.incidents.update(incidentId, {
        assignedTo: undefined,
        assignedServiceId: undefined,
        updatedAt: new Date().toISOString()
      });
      toast.success('Affectation retirée');
    } catch {
      toast.error('Erreur');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Gestion des Affectations</h1>
          <p className="text-slate-500 text-sm">Affectez les dossiers aux agents</p>
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <button
          onClick={() => setFilter('ALL')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${filter === 'ALL' ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}
        >
          <p className="text-xs font-bold text-slate-500">Total</p>
          <p className="text-3xl font-black text-slate-900 dark:text-white">{counts.total}</p>
        </button>
        <button
          onClick={() => setFilter('AFFECTE')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${filter === 'AFFECTE' ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}
        >
          <p className="text-xs font-bold text-slate-500">Affectés</p>
          <p className="text-3xl font-black text-emerald-600">{counts.affecte}</p>
        </button>
        <button
          onClick={() => setFilter('NON_AFFECTE')}
          className={`p-4 rounded-xl border-2 transition-all text-left ${filter === 'NON_AFFECTE' ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20' : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900'}`}
        >
          <p className="text-xs font-bold text-slate-500">Non affectés</p>
          <p className="text-3xl font-black text-amber-600">{counts.nonAffecte}</p>
        </button>
      </div>

      <div className="grid gap-4">
        {!filtered?.length ? (
          <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucun dossier trouvé</p>
          </div>
        ) : (
          filtered.map(inc => {
            const assignedAgent = agents?.find(a => a.id === inc.assignedTo);
            return (
              <div key={inc.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] font-bold">#{inc.id.slice(-6)}</Badge>
                      <Badge variant={inc.assignedTo ? 'success' : 'warning'}>
                        {inc.assignedTo ? 'Affecté' : 'Non affecté'}
                      </Badge>
                      <span className="text-[10px] text-slate-400">{inc.type}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{inc.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{inc.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {inc.location.arrondissement || 'Douala'}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(inc.createdAt), { addSuffix: true, locale: fr })}</span>
                      {assignedAgent && (
                        <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3 h-3" /> {assignedAgent.name}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 md:w-72">
                    {inc.assignedTo ? (
                      <div className="flex gap-2">
                        <div className="flex-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 font-medium truncate">
                          {assignedAgent?.name || inc.assignedTo}
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleUnassign(inc.id)} disabled={deletingId === inc.id}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <select
                          value={selectedAgent}
                          onChange={(e) => setSelectedAgent(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Choisir un agent</option>
                          {agents?.map(a => {
                            const svc = services?.find(s => s.id === a.serviceId);
                            return (
                              <option key={a.id} value={a.id}>{a.name} {svc ? `(${svc.name})` : ''}</option>
                            );
                          })}
                        </select>
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                          onClick={() => handleAssign(inc.id)}
                          disabled={assigningId === inc.id || !selectedAgent}
                        >
                          <UserPlus className="w-4 h-4" />
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
