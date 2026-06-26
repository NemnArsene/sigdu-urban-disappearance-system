import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { Link, Search, MapPin, Clock, User, Plus, Trash2, Edit, CheckCircle2 } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ARRONDISSEMENTS } from '../../lib/constants';

export const AdminAffectationsPage = () => {
  const [filter, setFilter] = useState<'ALL' | 'AFFECTE' | 'NON_AFFECTE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const [selectedService, setSelectedService] = useState<string>('');
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const incidents = useLiveQuery(() => db.incidents.orderBy('createdAt').reverse().toArray(), []);
  const services = useLiveQuery(() => db.services.toArray(), []);
  const users = useLiveQuery(() => db.users.where('role').equals('AGENT').toArray(), []);

  const filtered = incidents?.filter(inc => {
    if (filter === 'AFFECTE' && !inc.assignedServiceId) return false;
    if (filter === 'NON_AFFECTE' && inc.assignedServiceId) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return inc.title.toLowerCase().includes(q) || inc.description.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = {
    total: incidents?.length || 0,
    affecte: incidents?.filter(i => i.assignedServiceId).length || 0,
    nonAffecte: incidents?.filter(i => !i.assignedServiceId).length || 0,
  };

  const handleAssign = async (incidentId: string) => {
    if (!selectedService) {
      toast.error('Sélectionnez un service');
      return;
    }
    setAssigningId(incidentId);
    try {
      const svc = await db.services.get(selectedService);
      await db.incidents.update(incidentId, {
        assignedServiceId: selectedService,
        status: 'EN_VERIFICATION',
        updatedAt: new Date().toISOString()
      });
      await db.timelineEvents.add({
        id: `te_aff_${Date.now()}`,
        incidentId,
        actionType: 'AFFECTATION',
        description: `Dossier affecté au service: ${svc?.name || selectedService} par l'administrateur.`,
        visibility: 'INTERNAL',
        createdBy: 'ADMIN',
        createdAt: new Date().toISOString()
      });
      toast.success('Dossier affecté avec succès');
      setSelectedService('');
      setAssigningId(null);
    } catch {
      toast.error('Erreur lors de l\'affectation');
      setAssigningId(null);
    }
  };

  const handleUnassign = async (incidentId: string) => {
    setDeletingId(incidentId);
    try {
      await db.incidents.update(incidentId, {
        assignedServiceId: undefined,
        assignedTo: undefined,
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
          <p className="text-slate-500 text-sm">Affectez les dossiers aux services et agents</p>
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
            <Link className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucun dossier trouvé</p>
          </div>
        ) : (
          filtered.map(inc => {
            const assignedSvc = services?.find(s => s.id === inc.assignedServiceId);
            const reporter = users?.find(u => u.id === inc.reportedBy);
            return (
              <div key={inc.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] font-bold">#{inc.id.slice(-6)}</Badge>
                      <Badge variant={inc.assignedServiceId ? 'success' : 'warning'}>
                        {inc.assignedServiceId ? 'Affecté' : 'Non affecté'}
                      </Badge>
                      <span className="text-[10px] text-slate-400">{inc.type}</span>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{inc.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-1">{inc.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {inc.location.arrondissement || 'Douala'}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(inc.createdAt), { addSuffix: true, locale: fr })}</span>
                      {assignedSvc && (
                        <span className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="w-3 h-3" /> {assignedSvc.name}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 shrink-0 md:w-72">
                    {inc.assignedServiceId ? (
                      <div className="flex gap-2">
                        <div className="flex-1 px-3 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl text-xs text-emerald-700 dark:text-emerald-400 font-medium truncate">
                          {assignedSvc?.name || inc.assignedServiceId}
                        </div>
                        <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-600" onClick={() => handleUnassign(inc.id)} disabled={deletingId === inc.id}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <select
                          value={selectedService}
                          onChange={(e) => setSelectedService(e.target.value)}
                          className="flex-1 px-3 py-2 text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Choisir un service</option>
                          {services?.map(s => (
                            <option key={s.id} value={s.id}>{s.name}</option>
                          ))}
                        </select>
                        <Button
                          size="sm"
                          className="bg-indigo-600 hover:bg-indigo-700 text-white shrink-0"
                          onClick={() => handleAssign(inc.id)}
                          disabled={assigningId === inc.id || !selectedService}
                        >
                          {assigningId === inc.id ? '...' : 'Affecter'}
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
