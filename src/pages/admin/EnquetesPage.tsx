import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { Search, MapPin, Clock, User, FileText, CheckCircle2, AlertTriangle, Plus, Eye } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const AdminEnquetesPage = () => {
  const [filter, setFilter] = useState<'ALL' | 'ENQUETE_EN_COURS' | 'EN_VERIFICATION' | 'RECHERCHE' | 'CLOTURE'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const incidents = useLiveQuery(() => {
    if (filter === 'ALL') return db.incidents.orderBy('createdAt').reverse().toArray();
    return db.incidents.where('status').equals(filter).toArray();
  }, [filter]);

  const services = useLiveQuery(() => db.services.toArray(), []);
  const users = useLiveQuery(() => db.users.toArray(), []);

  const filtered = incidents?.filter(inc => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return inc.title.toLowerCase().includes(q) || inc.description.toLowerCase().includes(q);
    }
    return true;
  });

  const counts = useLiveQuery(async () => {
    const [all, enCours, verification, recherche, cloture] = await Promise.all([
      db.incidents.count(),
      db.incidents.where('status').equals('ENQUETE_EN_COURS').count(),
      db.incidents.where('status').equals('EN_VERIFICATION').count(),
      db.incidents.where('status').equals('RECHERCHE').count(),
      db.incidents.where('status').equals('CLOTURE').count(),
    ]);
    return { all, enCours, verification, recherche, cloture };
  }, []);

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await db.incidents.update(id, { status: newStatus as any, updatedAt: new Date().toISOString() });
      await db.timelineEvents.add({
        id: `te_enq_${Date.now()}`,
        incidentId: id,
        actionType: 'STATUS_CHANGE',
        description: `Statut modifié par l'administrateur: ${newStatus.replace('_', ' ')}`,
        visibility: 'INTERNAL',
        createdBy: 'ADMIN',
        createdAt: new Date().toISOString()
      });
      toast.success('Statut mis à jour');
    } catch {
      toast.error('Erreur');
    }
  };

  const handleClose = async (id: string) => {
    try {
      await db.incidents.update(id, { status: 'CLOTURE', updatedAt: new Date().toISOString() });
      await db.timelineEvents.add({
        id: `te_close_${Date.now()}`,
        incidentId: id,
        actionType: 'STATUS_CHANGE',
        description: 'Enquête clôturée par l\'administrateur.',
        visibility: 'PUBLIC',
        createdBy: 'ADMIN',
        createdAt: new Date().toISOString()
      });
      toast.success('Enquête clôturée');
    } catch {
      toast.error('Erreur');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Gestion des Enquêtes</h1>
          <p className="text-slate-500 text-sm">Suivez et gérez les enquêtes en cours</p>
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

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {([
          { key: 'ALL', label: 'Total', count: counts?.all || 0 },
          { key: 'ENQUETE_EN_COURS', label: 'En cours', count: counts?.enCours || 0 },
          { key: 'EN_VERIFICATION', label: 'Vérification', count: counts?.verification || 0 },
          { key: 'RECHERCHE', label: 'Recherche', count: counts?.recherche || 0 },
          { key: 'CLOTURE', label: 'Clôturées', count: counts?.cloture || 0 },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`p-3 rounded-xl border-2 transition-all text-center ${
              filter === f.key
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
            }`}
          >
            <p className="text-2xl font-black text-slate-900 dark:text-white">{f.count}</p>
            <p className="text-[10px] text-slate-500 font-medium">{f.label}</p>
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {!filtered?.length ? (
          <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <FileText className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucune enquête trouvée</p>
          </div>
        ) : (
          filtered.map(inc => {
            const assignedSvc = services?.find(s => s.id === inc.assignedServiceId);
            const assignedUser = users?.find(u => u.id === inc.assignedTo);
            return (
              <div key={inc.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] font-bold">#{inc.id.slice(-6)}</Badge>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        inc.status === 'ENQUETE_EN_COURS' ? 'bg-amber-100 text-amber-700' :
                        inc.status === 'RECHERCHE' ? 'bg-blue-100 text-blue-700' :
                        inc.status === 'CLOTURE' ? 'bg-slate-100 text-slate-600' :
                        'bg-purple-100 text-purple-700'
                      }`}>
                        {inc.status.replace('_', ' ')}
                      </span>
                      <Badge variant="outline" className="text-[10px]">{inc.type}</Badge>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{inc.title}</h3>
                    <p className="text-sm text-slate-500 mt-1 line-clamp-2">{inc.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {inc.location.arrondissement || 'Douala'}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDistanceToNow(new Date(inc.createdAt), { addSuffix: true, locale: fr })}</span>
                      {assignedSvc && <span className="flex items-center gap-1 text-emerald-600"><User className="w-3 h-3" /> {assignedSvc.name}</span>}
                      {assignedUser && <span className="flex items-center gap-1 text-indigo-600"><Eye className="w-3 h-3" /> {assignedUser.name}</span>}
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 md:w-44">
                    {inc.status !== 'CLOTURE' && (
                      <>
                        <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleClose(inc.id)}>
                          <CheckCircle2 className="w-4 h-4 mr-1" /> Clôturer
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => handleStatusUpdate(inc.id, 'ENQUETE_EN_COURS')}>
                          En cours
                        </Button>
                      </>
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
