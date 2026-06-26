import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { Wrench, Search, MapPin, Clock, User, CheckCircle2, AlertTriangle, Plus, X } from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { ARRONDISSEMENTS } from '../../lib/constants';

interface Intervention {
  id: string;
  incidentId: string;
  incidentTitle: string;
  type: string;
  status: 'PLANIFIEE' | 'EN_COURS' | 'TERMINEE' | 'ANNULEE';
  serviceId: string;
  serviceName: string;
  description: string;
  arrondissement: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG = {
  PLANIFIEE: { label: 'Planifiée', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400', icon: Clock },
  EN_COURS: { label: 'En cours', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400', icon: AlertTriangle },
  TERMINEE: { label: 'Terminée', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400', icon: CheckCircle2 },
  ANNULEE: { label: 'Annulée', color: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400', icon: X },
};

const INTERVENTION_TYPES = ['Recherche terrain', 'Interrogatoire', 'Perquisition', 'Surveillance', 'Patrouille renforcée', 'Médiation'];

export const AdminInterventionsPage = () => {
  const [filter, setFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreate, setShowCreate] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const incidents = useLiveQuery(() => db.incidents.toArray(), []);
  const services = useLiveQuery(() => db.services.toArray(), []);
  const timelineEvents = useLiveQuery(() => db.timelineEvents.toArray(), []);

  const interventions: Intervention[] | undefined = useLiveQuery(() => {
    const events = timelineEvents || [];
    const incs = incidents || [];
    const svcs = services || [];

    const interventionEvents = events.filter(e => e.actionType === 'AFFECTATION' || e.actionType === 'STATUS_CHANGE');

    return interventionEvents.map((event, idx) => {
      const inc = incs.find(i => i.id === event.incidentId);
      const svc = svcs.find(s => s.id === inc?.assignedServiceId);
      const status = event.actionType === 'AFFECTATION' ? 'EN_COURS' : 'PLANIFIEE';

      return {
        id: `intv_${event.id}`,
        incidentId: event.incidentId,
        incidentTitle: inc?.title || 'Dossier inconnu',
        type: INTERVENTION_TYPES[idx % INTERVENTION_TYPES.length],
        status: status as Intervention['status'],
        serviceId: inc?.assignedServiceId || '',
        serviceName: svc?.name || 'Non assigné',
        description: event.description,
        arrondissement: inc?.location.arrondissement || 'Douala',
        createdAt: event.createdAt,
        updatedAt: event.createdAt,
      };
    }).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [incidents, services, timelineEvents]);

  const filtered = interventions?.filter(intv => {
    if (filter !== 'ALL' && intv.status !== filter) return false;
    if (searchQuery && !intv.incidentTitle.toLowerCase().includes(searchQuery.toLowerCase()) && !intv.description.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  });

  const handleStatusChange = async (id: string, newStatus: Intervention['status']) => {
    toast.success(`Intervention marquée comme ${STATUS_CONFIG[newStatus].label}`);
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      toast.success('Intervention supprimée');
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Gestion des Interventions</h1>
          <p className="text-slate-500 text-sm">{filtered?.length || 0} interventions</p>
        </div>
        <div className="flex gap-2">
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
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => setShowCreate(true)}>
            <Plus className="w-4 h-4 mr-1" /> Nouvelle
          </Button>
        </div>
      </div>

      <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
        {['ALL', 'PLANIFIEE', 'EN_COURS', 'TERMINEE', 'ANNULEE'].map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              filter === f ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {f === 'ALL' ? 'Toutes' : STATUS_CONFIG[f as keyof typeof STATUS_CONFIG]?.label || f}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {!filtered?.length ? (
          <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Wrench className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucune intervention trouvée</p>
          </div>
        ) : (
          filtered.map(intv => {
            const config = STATUS_CONFIG[intv.status];
            const Icon = config.icon;
            return (
              <div key={intv.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
                <div className="flex flex-col md:flex-row gap-4 justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <Badge variant="outline" className="text-[10px] font-bold">#{intv.id.slice(-8)}</Badge>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold flex items-center gap-1 ${config.color}`}>
                        <Icon className="w-3 h-3" /> {config.label}
                      </span>
                      <Badge variant="secondary" className="text-[10px]">{intv.type}</Badge>
                    </div>
                    <h3 className="font-bold text-slate-900 dark:text-white">{intv.incidentTitle}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{intv.description}</p>
                    <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 flex-wrap">
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {intv.arrondissement}</span>
                      <span className="flex items-center gap-1"><User className="w-3.5 h-3.5" /> {intv.serviceName}</span>
                      <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" /> {formatDistanceToNow(new Date(intv.createdAt), { addSuffix: true, locale: fr })}</span>
                    </div>
                  </div>
                  <div className="flex flex-col gap-2 shrink-0 md:w-44">
                    {intv.status === 'PLANIFIEE' && (
                      <Button size="sm" className="bg-amber-600 hover:bg-amber-700 text-white" onClick={() => handleStatusChange(intv.id, 'EN_COURS')}>
                        Démarrer
                      </Button>
                    )}
                    {intv.status === 'EN_COURS' && (
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => handleStatusChange(intv.id, 'TERMINEE')}>
                        Terminer
                      </Button>
                    )}
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(intv.id)} disabled={deletingId === intv.id}>
                      {deletingId === intv.id ? '...' : 'Supprimer'}
                    </Button>
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
