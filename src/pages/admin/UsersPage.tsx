import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Label } from '../../components/ui/Label';
import { toast } from 'sonner';
import { Search, Plus, Edit, Trash2, User, X, Shield, Users } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import type { User as UserType, Role } from '../../types';
import { ARRONDISSEMENTS } from '../../lib/constants';
import { Pagination } from '../../components/ui/Pagination';

const ROLE_COLORS: Record<string, string> = {
  ADMIN: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
  SUPERVISEUR: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
  AGENT: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400',
  CITOYEN: 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400',
};

const PAGE_SIZE = 15;

export const AdminUsersPage = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<Role | 'ALL'>('ALL');
  const [showForm, setShowForm] = useState(false);
  const [editingUser, setEditingUser] = useState<UserType | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const users = useLiveQuery(() => db.users.toArray(), []);
  const organizations = useLiveQuery(() => db.organizations.toArray(), []);
  const services = useLiveQuery(() => db.services.toArray(), []);

  const filtered = users?.filter(u => {
    if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  const totalItems = filtered?.length ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalItems / PAGE_SIZE));
  const pagedUsers = filtered?.slice((currentPage - 1) * PAGE_SIZE, currentPage * PAGE_SIZE);

  const handleRoleFilter = (r: Role | 'ALL') => { setRoleFilter(r); setCurrentPage(1); };
  const handleSearch = (q: string) => { setSearchQuery(q); setCurrentPage(1); };

  const counts = useLiveQuery(async () => {
    const [all, admin, superviseur, agent, citoyen] = await Promise.all([
      db.users.count(),
      db.users.where('role').equals('ADMIN').count(),
      db.users.where('role').equals('SUPERVISEUR').count(),
      db.users.where('role').equals('AGENT').count(),
      db.users.where('role').equals('CITOYEN').count(),
    ]);
    return { all, admin, superviseur, agent, citoyen };
  }, []);

  const handleCreate = async (data: Omit<UserType, 'id' | 'createdAt'>) => {
    try {
      await db.users.add({
        ...data,
        id: `user_${Date.now()}`,
        createdAt: new Date().toISOString()
      });
      toast.success('Utilisateur créé');
      setShowForm(false);
    } catch {
      toast.error('Erreur');
    }
  };

  const handleUpdate = async (id: string, data: Partial<UserType>) => {
    try {
      await db.users.update(id, data);
      toast.success('Utilisateur modifié');
      setEditingUser(null);
    } catch {
      toast.error('Erreur');
    }
  };

  const handleDelete = async (id: string) => {
    setDeletingId(id);
    try {
      await db.users.delete(id);
      toast.success('Utilisateur supprimé');
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
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Gestion des Utilisateurs</h1>
          <p className="text-slate-500 text-sm">{users?.length || 0} utilisateurs au total</p>
        </div>
        <div className="flex gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Rechercher..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-9 pr-4 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-900 dark:text-white"
            />
          </div>
          <Button size="sm" className="bg-indigo-600 hover:bg-indigo-700 text-white" onClick={() => { setEditingUser(null); setShowForm(true); }}>
            <Plus className="w-4 h-4 mr-1" /> Nouveau
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-5 gap-3">
        {([
          { key: 'ALL', label: 'Tous', count: counts?.all || 0 },
          { key: 'ADMIN', label: 'Admins', count: counts?.admin || 0 },
          { key: 'SUPERVISEUR', label: 'Superviseurs', count: counts?.superviseur || 0 },
          { key: 'AGENT', label: 'Agents', count: counts?.agent || 0 },
          { key: 'CITOYEN', label: 'Citoyens', count: counts?.citoyen || 0 },
        ] as const).map(f => (
          <button
            key={f.key}
            onClick={() => handleRoleFilter(f.key)}
            className={`p-3 rounded-xl border-2 transition-all text-center ${
              roleFilter === f.key
                ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                : 'border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300'
            }`}
          >
            <p className="text-2xl font-black text-slate-900 dark:text-white">{f.count}</p>
            <p className="text-[10px] text-slate-500 font-medium">{f.label}</p>
          </button>
        ))}
      </div>

      {(showForm || editingUser) && (
        <UserForm
          user={editingUser}
          organizations={organizations || []}
          services={services || []}
          onSubmit={editingUser ? (data) => handleUpdate(editingUser.id, data) : handleCreate}
          onCancel={() => { setShowForm(false); setEditingUser(null); }}
        />
      )}

      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 dark:bg-slate-800/50 border-b border-slate-200 dark:border-slate-700">
              <tr>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Utilisateur</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Email</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Rôle</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase">Organisation</th>
                <th className="px-6 py-3 text-xs font-bold text-slate-500 uppercase text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {!pagedUsers?.length ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                  <Users className="w-8 h-8 mx-auto mb-2 text-slate-300" />
                  Aucun utilisateur trouvé
                </td></tr>
              ) : (
                pagedUsers.map(u => {
                  const org = organizations?.find(o => o.id === u.organizationId);
                  return (
                    <tr key={u.id} className="hover:bg-slate-50 dark:hover:bg-slate-800/30 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
                            <User className="w-4 h-4 text-slate-500" />
                          </div>
                          <div>
                            <p className="font-medium text-slate-900 dark:text-white">{u.name}</p>
                            <p className="text-[10px] text-slate-400">#{u.id.slice(-8)}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-slate-500 text-xs">{u.email}</td>
                      <td className="px-6 py-4">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ROLE_COLORS[u.role]}`}>{u.role}</span>
                      </td>
                      <td className="px-6 py-4 text-xs text-slate-500">{org?.name || '—'}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex gap-1 justify-end">
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-indigo-600" onClick={() => { setEditingUser(u); setShowForm(false); }}>
                            <Edit className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-400 hover:text-red-600" onClick={() => handleDelete(u.id)} disabled={deletingId === u.id}>
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
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

function UserForm({ user, organizations, services, onSubmit, onCancel }: {
  user: UserType | null;
  organizations: any[];
  services: any[];
  onSubmit: (data: any) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || '');
  const [role, setRole] = useState<Role>(user?.role || 'CITOYEN');
  const [organizationId, setOrganizationId] = useState(user?.organizationId || '');
  const [serviceId, setServiceId] = useState(user?.serviceId || '');

  const filteredServices = services.filter(s => s.organizationId === organizationId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email) { toast.error('Nom et email requis'); return; }
    onSubmit({ name, email, phone, role, organizationId, serviceId });
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-6 shadow-sm">
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white">{user ? 'Modifier l\'utilisateur' : 'Nouvel Utilisateur'}</h2>
        <Button variant="ghost" size="icon" onClick={onCancel}><X className="w-5 h-5" /></Button>
      </div>
      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label>Nom complet</Label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Jean Dupont" required />
        </div>
        <div>
          <Label>Email</Label>
          <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="user@sigdu.cm" required />
        </div>
        <div>
          <Label>Téléphone</Label>
          <Input value={phone} onChange={e => setPhone(e.target.value)} placeholder="699 000 000" />
        </div>
        <div>
          <Label>Rôle</Label>
          <select value={role} onChange={e => setRole(e.target.value as Role)} className="w-full h-10 px-3 text-sm bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
            <option value="CITOYEN">Citoyen</option>
            <option value="AGENT">Agent</option>
            <option value="SUPERVISEUR">Superviseur</option>
            <option value="ADMIN">Admin</option>
          </select>
        </div>
        {(role === 'AGENT' || role === 'SUPERVISEUR') && (
          <>
            <div>
              <Label>Organisation</Label>
              <select value={organizationId} onChange={e => { setOrganizationId(e.target.value); setServiceId(''); }} className="w-full h-10 px-3 text-sm bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500">
                <option value="">Sélectionner</option>
                {organizations.map(o => <option key={o.id} value={o.id}>{o.name}</option>)}
              </select>
            </div>
            <div>
              <Label>Service</Label>
              <select value={serviceId} onChange={e => setServiceId(e.target.value)} className="w-full h-10 px-3 text-sm bg-slate-950 border border-slate-800 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500" disabled={!organizationId}>
                <option value="">Sélectionner</option>
                {filteredServices.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
              </select>
            </div>
          </>
        )}
        <div className="md:col-span-2 flex gap-2 justify-end">
          <Button type="button" variant="outline" onClick={onCancel}>Annuler</Button>
          <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700 text-white">{user ? 'Mettre à jour' : 'Créer'}</Button>
        </div>
      </form>
    </div>
  );
}
