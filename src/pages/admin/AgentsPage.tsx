import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { toast } from 'sonner';
import { Search, Plus, Edit, Trash2, User, Building2, Phone, X, Shield } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { User as UserType, Role } from '../../types';
import { ARRONDISSEMENTS } from '../../lib/constants';

export const AdminAgentsPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingAgent, setEditingAgent] = useState<UserType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const agents = useLiveQuery(() => db.users.where('role').equals('AGENT').toArray(), []);
  const organizations = useLiveQuery(() => db.organizations.toArray(), []);
  const services = useLiveQuery(() => db.services.toArray(), []);

  const filtered = agents?.filter(a => {
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return a.name.toLowerCase().includes(q) || a.email.toLowerCase().includes(q);
    }
    return true;
  });

  const handleCreate = async (data: Omit<UserType, 'id' | 'createdAt'>) => {
    try {
      await db.users.add({
        ...data,
        id: `agent_${Date.now()}`,
        createdAt: new Date().toISOString()
      });
      toast.success('Agent créé avec succès');
      setShowForm(false);
    } catch {
      toast.error('Erreur lors de la création');
    }
  };

  const handleUpdate = async (id: string, data: Partial<UserType>) => {
    try {
      await db.users.update(id, data);
      toast.success('Agent modifié');
      setEditingAgent(null);
    } catch {
      toast.error('Erreur lors de la modification');
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await db.users.delete(id);
      toast.success('Agent supprimé');
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Gestion des Agents</h1>
          <p className="text-slate-500 text-sm">{agents?.length || 0} agents enregistrés</p>
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
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => { setEditingAgent(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Nouvel Agent
          </Button>
        </div>
      </div>

      {(showForm || editingAgent) && (
        <AgentForm
          agent={editingAgent}
          organizations={organizations || []}
          services={services || []}
          onSubmit={editingAgent ? (data) => handleUpdate(editingAgent.id, data) : handleCreate}
          onCancel={() => { setShowForm(false); setEditingAgent(null); }}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {!filtered?.length ? (
          <div className="col-span-full py-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800">
            <Shield className="w-12 h-12 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 font-medium">Aucun agent trouvé</p>
          </div>
        ) : (
          filtered.map(agent => {
            const org = organizations?.find(o => o.id === agent.organizationId);
            const svc = services?.find(s => s.id === agent.serviceId);
            return (
              <div key={agent.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex justify-between items-start">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center">
                      <User className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <h3 className="font-bold text-sm text-slate-900 dark:text-white">{agent.name}</h3>
                      <p className="text-[10px] text-slate-500">{agent.email}</p>
                    </div>
                  </div>
                  <Badge variant="secondary" className="text-[10px]">AGENT</Badge>
                </div>
                <div className="p-4 space-y-2">
                  {agent.phone && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Phone className="w-3.5 h-3.5" /> {agent.phone}
                    </div>
                  )}
                  {org && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Building2 className="w-3.5 h-3.5" /> {org.name}
                    </div>
                  )}
                  {svc && (
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <Shield className="w-3.5 h-3.5" /> {svc.name}
                    </div>
                  )}
                  <p className="text-[10px] text-slate-400">
                    Créé {formatDistanceToNow(new Date(agent.createdAt), { addSuffix: true, locale: fr })}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 dark:bg-slate-800/30 border-t border-slate-100 dark:border-slate-800 flex gap-2">
                  <Button variant="outline" size="sm" className="flex-1" onClick={() => { setEditingAgent(agent); setShowForm(false); }}>
                    <Edit className="w-3.5 h-3.5 mr-1" /> Modifier
                  </Button>
                  <Button variant="destructive" size="sm" className="flex-1" onClick={() => handleDelete(agent.id)} disabled={deletingId === agent.id}>
                    <Trash2 className="w-3.5 h-3.5 mr-1" /> {deletingId === agent.id ? '...' : 'Supprimer'}
                  </Button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

function AgentForm({ agent, organizations, services, onSubmit, onCancel }: {
  agent: UserType | null;
  organizations: any[];
  services: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(agent?.name || '');
  const [email, setEmail] = useState(agent?.email || '');
  const [phone, setPhone] = useState(agent?.phone || '');
  const [organizationId, setOrganizationId] = useState(agent?.organizationId || '');
  const [serviceId, setServiceId] = useState(agent?.serviceId || '');

  const filteredServices = services.filter(s => s.organizationId === organizationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) { toast.error('Nom et email requis'); return; }
    onSubmit({ name, email, phone, organizationId, serviceId, role: 'AGENT' as Role });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white">{agent ? 'Modifier l\'agent' : 'Nouvel Agent'}</h2>
        <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-5 h-5" /></Button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Nom complet</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Jean Dupont" required />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="agent@sigdu.cm" required />
        </div>
        <div>
          <Label>Téléphone</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="699 000 000" />
        </div>
        <div>
          <Label>Organisation</Label>
          <select value={organizationId} onChange={e => { setOrganizationId(e.target.value); setServiceId(''); }} className="w-full h-10 px-3 text-sm bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="">Sélectionner</option>
            {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
          </select>
        </div>
        <div>
          <Label>Service / Commissariat</Label>
          <select value={serviceId} onChange={e => setServiceId(e.target.value)} className="w-full h-10 px-3 text-sm bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={!organizationId}>
            <option value="">Sélectionner</option>
            {filteredServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </div>
        <div className="md:col-span-2 flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">{agent ? 'Mettre à jour' : 'Créer l\'agent'}</Button>
        </div>
      </form>
    </div>
  );
}
