import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { Card, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { FileText, MapPin, Search, ExternalLink, Megaphone } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Pagination } from '../../components/ui/Pagination';

const PAGE_SIZE = 8;

export const SupervisorIncidentsPage = () => {
  const [filter, setFilter] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);
  const navigate = useNavigate();

  const incidents = useLiveQuery(() => {
    if (filter === 'ALL') return db.incidents.orderBy('createdAt').reverse().toArray();
    return db.incidents.where('status').equals(filter).reverse().toArray();
  }, [filter]);

  const totalItems = incidents?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const pagedIncidents = incidents?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleFilterChange = (f: string) => { setFilter(f); setCurrentPage(1); };

  const handlePublishAvis = async (incidentId: string, title: string) => {
    try {
      // 1. Add Timeline Event
      await db.timelineEvents.add({
        id: `te_${Date.now()}_1`,
        incidentId,
        actionType: 'STATUS_CHANGE',
        description: `Un avis de recherche public a été officiellement émis pour le dossier: ${title}.`,
        visibility: 'PUBLIC',
        createdBy: 'SUPERVISEUR',
        createdAt: new Date().toISOString()
      });

      // 2. Add NewsPost for the feed
      await db.newsFeed.add({
        id: `news_${Date.now()}`,
        type: 'ALERT',
        title: `Avis de Recherche : ${title}`,
        content: `Un avis de recherche a été publié. Vous pouvez consulter le dossier complet et nous aider dans les recherches en signalant toute observation.`,
        authorId: 'SUPERVISEUR',
        createdAt: new Date().toISOString()
      });

      toast.success('Avis de Recherche publié avec succès !');
    } catch (err) {
      toast.error('Erreur lors de la publication.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dossiers & Avis</h1>
          <p className="text-slate-500 text-sm">Gérez les dossiers et publiez les avis de recherche</p>
        </div>
        <div className="flex gap-2 bg-white dark:bg-slate-900 p-1 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-x-auto no-scrollbar">
          {['ALL', 'EN_VERIFICATION', 'RECHERCHE', 'ENLEVEMENT_CONFIRME', 'LOCALISE', 'RETROUVE'].map((f) => (
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
      </div>

      <div className="grid gap-4">
        {!pagedIncidents?.length ? (
          <div className="py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Search className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucun dossier trouvé pour ce filtre</p>
          </div>
        ) : (
          pagedIncidents!.map(incident => (
            <div key={incident.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-5 shadow-sm">
              <div className="flex flex-col md:flex-row gap-4 justify-between">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline" className="text-[10px] font-bold bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400">
                      #{incident.id.slice(-6)}
                    </Badge>
                    <Badge className={
                      incident.status === 'EN_VERIFICATION' ? 'bg-purple-100 text-purple-700' :
                      incident.status === 'RETROUVE' ? 'bg-emerald-100 text-emerald-700' :
                      'bg-blue-100 text-blue-700'
                    }>
                      {incident.status}
                    </Badge>
                  </div>
                  <h3 className="font-bold text-lg text-slate-900 dark:text-white">{incident.title}</h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mt-1 line-clamp-2">{incident.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-slate-500 font-medium">
                    <span className="flex items-center gap-1.5"><MapPin className="w-3.5 h-3.5" /> {incident.location.arrondissement || 'Douala'}</span>
                    <span className="flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Type: {incident.type}</span>
                  </div>
                </div>
                <div className="flex flex-col gap-2 shrink-0 md:w-56">
                  <Button
                    variant="outline"
                    className="w-full justify-between border-slate-200 dark:border-slate-700"
                    onClick={() => navigate(`/superviseur/incident/${incident.id}`)}
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
