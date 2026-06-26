import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { FileText, MapPin, Search, ExternalLink, Megaphone, Trash2, Edit } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Pagination } from '../../components/ui/Pagination';

const STATUS_COLORS: Record<string, string> = {
  NOUVEAU: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300',
  EN_VERIFICATION: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  RECHERCHE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
  ENLEVEMENT_CONFIRME: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
  DISPARITION_CONFIRMEE: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
  LOCALISE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  RETROUVE: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
  CLOTURE: 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400',
  FAUSSE_ALERTE: 'bg-red-50 text-red-500 dark:bg-red-900/20 dark:text-red-400',
  ENQUETE_EN_COURS: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  FUGUE_PRESUMEE: 'bg-pink-100 text-pink-700 dark:bg-pink-900/30 dark:text-pink-400',
  ALERTE_CRITIQUE: 'bg-red-600 text-white dark:bg-red-700',
  CORRESPONDANCE_EN_ATTENTE: 'bg-cyan-100 text-cyan-700 dark:bg-cyan-900/30 dark:text-cyan-400',
};

const ALL_STATUSES: string[] = [
  'ALL', 'NOUVEAU', 'EN_VERIFICATION', 'RECHERCHE', 'ENLEVEMENT_CONFIRME',
  'DISPARITION_CONFIRMEE', 'LOCALISE', 'RETROUVE', 'CLOTURE', 'FAUSSE_ALERTE'
];

const PAGE_SIZE = 10;

export const AdminIncidentsPage = () => {
  const [filter, setFilter] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const incidents = useLiveQuery(() => {
    let query = filter === 'ALL'
      ? db.incidents.orderBy('createdAt').reverse().toArray()
      : db.incidents.where('status').equals(filter).toArray();
    return query;
  }, [filter]);

  const filteredIncidents = incidents?.filter(inc =>
    searchQuery === '' ||
    inc.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inc.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    inc.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const totalItems = filteredIncidents?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const pagedIncidents = filteredIncidents?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (f: string) => { setFilter(f); setCurrentPage(1); };
  const handleSearchChange = (q: string) => { setSearchQuery(q); setCurrentPage(1); };

  const handlePublishAvis = async (incidentId: string, title: string) => {
    try {
      await db.timelineEvents.add({
        id: `te_${Date.now()}_1`,
        incidentId,
        actionType: 'STATUS_CHANGE',
        description: `Un avis de recherche public a été officiellement émis pour le dossier: ${title}.`,
        visibility: 'PUBLIC',
        createdBy: 'ADMIN',
        createdAt: new Date().toISOString()
      });
      await db.newsFeed.add({
        id: `news_${Date.now()}`,
        type: 'ALERT',
        title: `Avis de Recherche : ${title}`,
        content: `Un avis de recherche a été publié. Vous pouvez consulter le dossier complet et nous aider dans les recherches en signalant toute observation.`,
        authorId: 'ADMIN',
        createdAt: new Date().toISOString()
      });
      toast.success('Avis de Recherche publié avec succès !');
    } catch {
      toast.error('Erreur lors de la publication.');
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await db.incidents.delete(id);
      await db.timelineEvents.where('incidentId').equals(id).delete();
      toast.success('Dossier supprimé définitivement');
    } catch {
      toast.error('Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Gestion des Signalements</h1>
          <p className="text-slate-500 text-sm">{filteredIncidents?.length || 0} dossiers au total</p>
        </div>
        <div className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Rechercher un dossier..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
          />
        </div>
      </div>

      <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
        {ALL_STATUSES.map((f) => (
          <button
            key={f}
            onClick={() => handleFilterChange(f)}
            className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-colors whitespace-nowrap ${
              filter === f ? 'bg-indigo-600 text-white' : 'text-slate-500 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {f === 'ALL' ? 'Tous' : f.replace('_', ' ')}
          </button>
        ))}
      </div>

      <div className="grid gap-4">
        {!pagedIncidents?.length ? (
          <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucun dossier trouvé</p>
          </div>
        ) : (
          pagedIncidents!.map(incident => (
            <div key={incident.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm hover:shadow-md transition-shadow">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant="outline" className="text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      #{incident.id.slice(-6)}
                    </Badge>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${STATUS_COLORS[incident.status] || 'bg-slate-100 text-slate-600'}`}>
                      {incident.status.replace('_', ' ')}
                    </span>
                    <Badge variant="outline" className="text-[10px]">{incident.type}</Badge>
                    <span className="text-[10px] text-slate-400">
                      {formatDistanceToNow(new Date(incident.createdAt), { addSuffix: true, locale: fr })}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{incident.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{incident.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 font-medium flex-wrap">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {incident.location.arrondissement || 'Douala'}</span>
                    <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> {incident.type}</span>
                    {incident.assignedTo && <span className="text-emerald-600">Assigné</span>}
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0 md:w-56">
                  <Button
                    variant="outline"
                    className="w-full justify-between border-slate-200 dark:border-slate-700"
                    onClick={() => navigate(`/admin/incident/${incident.id}`)}
                  >
                    Voir le Dossier <ExternalLink className="w-4 h-4 ml-2" />
                  </Button>
                  {['EN_VERIFICATION', 'RECHERCHE', 'ENLEVEMENT_CONFIRME', 'DISPARITION_CONFIRMEE'].includes(incident.status) && (
                    <Button
                      className="w-full justify-between bg-amber-600 hover:bg-amber-700 text-white border-none"
                      onClick={() => handlePublishAvis(incident.id, incident.title)}
                    >
                      Publier Avis Public <Megaphone className="w-4 h-4 ml-2" />
                    </Button>
                  )}
                  <Button
                    variant="destructive"
                    className="w-full justify-between"
                    onClick={() => handleDelete(incident.id)}
                    disabled={deletingId === incident.id}
                  >
                    {deletingId === incident.id ? '...' : 'Supprimer'} <Trash2 className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
        totalItems={totalItems}
        pageSize={PAGE_SIZE}
      />
    </div>
  );
};
