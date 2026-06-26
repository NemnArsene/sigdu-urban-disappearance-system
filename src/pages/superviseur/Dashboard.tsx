import { useState } from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import {
  AlertTriangle, MapPin, Phone, Clock, CheckCircle2, ShieldAlert, Eye,
  MessageSquareWarning, Activity, Users, FileText, TrendingUp,
  ArrowRight, User, Mail, Building, Zap, Target, Timer
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { SIGMap } from '../../components/map/SIGMap';

// ───────── Mini bar chart (pure SVG, no deps) ─────────
const MiniBarChart = ({ data, color = '#3b82f6' }: { data: { label: string; value: number }[]; color?: string }) => {
  const max = Math.max(...data.map(d => d.value), 1);
  return (
    <div className="flex items-end gap-1.5 h-16">
      {data.map((d, i) => (
        <div key={i} className="flex flex-col items-center gap-1 flex-1 min-w-0">
          <div
            className="w-full rounded-t-md transition-all"
            style={{ height: `${(d.value / max) * 52}px`, background: color, opacity: 0.8 + (i === data.length - 1 ? 0.2 : 0) }}
          />
          <span className="text-[9px] text-slate-500 truncate w-full text-center">{d.label}</span>
        </div>
      ))}
    </div>
  );
};

// ───────── Donut chart (pure SVG) ─────────
const DonutChart = ({ segments }: { segments: { value: number; color: string; label: string }[] }) => {
  const total = segments.reduce((acc, s) => acc + s.value, 0) || 1;
  let offset = 0;
  const R = 42;
  const CIRCUMFERENCE = 2 * Math.PI * R;
  return (
    <div className="flex items-center gap-4">
      <svg width="100" height="100" viewBox="0 0 100 100" className="shrink-0">
        <circle cx="50" cy="50" r={R} fill="none" strokeWidth="12" stroke="#f1f5f9" className="dark:stroke-slate-800" />
        {segments.map((seg, i) => {
          const pct = seg.value / total;
          const dash = pct * CIRCUMFERENCE;
          const gap = CIRCUMFERENCE - dash;
          const circle = (
            <circle
              key={i} cx="50" cy="50" r={R} fill="none" strokeWidth="12"
              stroke={seg.color}
              strokeDasharray={`${dash} ${gap}`}
              strokeDashoffset={-offset * CIRCUMFERENCE / total * CIRCUMFERENCE / CIRCUMFERENCE}
              style={{ strokeDashoffset: `-${offset * CIRCUMFERENCE / total}` }}
              strokeLinecap="round"
              transform="rotate(-90 50 50)"
            />
          );
          offset += seg.value;
          return circle;
        })}
        <text x="50" y="54" textAnchor="middle" fontSize="14" fontWeight="800" fill="currentColor" className="fill-slate-900 dark:fill-white">{total}</text>
      </svg>
      <div className="space-y-1.5 min-w-0">
        {segments.map((seg, i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <div className="w-2.5 h-2.5 rounded-sm shrink-0" style={{ background: seg.color }} />
            <span className="text-slate-600 dark:text-slate-400 truncate">{seg.label}</span>
            <span className="font-bold text-slate-900 dark:text-white ml-auto pl-2">{seg.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ───────── KPI Card ─────────
const KpiCard = ({ icon: Icon, label, value, sub, color, onClick }: {
  icon: React.ElementType; label: string; value: number | string; sub?: string; color: string; onClick?: () => void;
}) => (
  <button onClick={onClick} className={`bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-5 rounded-2xl shadow-sm flex items-center gap-4 hover:shadow-md hover:border-slate-300 dark:hover:border-slate-700 transition-all text-left w-full group ${onClick ? 'cursor-pointer' : 'cursor-default'}`}>
    <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
      <Icon className="w-6 h-6" />
    </div>
    <div className="min-w-0">
      <p className="text-xs text-slate-500 font-medium truncate">{label}</p>
      <p className="text-2xl font-black text-slate-900 dark:text-white leading-tight">{value}</p>
      {sub && <p className="text-xs text-slate-400 mt-0.5">{sub}</p>}
    </div>
    {onClick && <ArrowRight className="w-4 h-4 text-slate-400 ml-auto shrink-0 group-hover:translate-x-1 transition-transform" />}
  </button>
);

export const SupervisorDashboard = () => {
  const [assigningId, setAssigningId] = useState<string | null>(null);
  const navigate = useNavigate();

  const data = useLiveQuery(async () => {
    const [incidents, observations, sosActive, rumors, users, services, allSOS] = await Promise.all([
      db.incidents.toArray(),
      db.observations.toArray(),
      db.sosAlerts.where('status').equals('ACTIVE').reverse().toArray(),
      db.rumors.toArray(),
      db.users.toArray(),
      db.services.toArray(),
      db.sosAlerts.toArray(),
    ]);

    // Fetch user info for SOS alerts
    const sosUserIds = [...new Set(sosActive.map(s => s.userId))];
    const sosUsers = await db.users.where('id').anyOf(sosUserIds).toArray();
    const sosUsersMap = Object.fromEntries(sosUsers.map(u => [u.id, u]));

    // Recent activity = last 5 incidents created
    const recentActivity = [...incidents]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);

    // Pending assignments = incidents with status NOUVEAU without assigned service
    const pendingAssignments = incidents.filter(i => i.status === 'NOUVEAU' && !i.assignedServiceId).length;

    // Critical alerts
    const criticalAlerts = incidents.filter(i => i.status === 'ALERTE_CRITIQUE' || i.status === 'ENLEVEMENT_CONFIRME').length;

    // Chart data by arrondissement (last 7 days, grouped)
    const arrondissements = ['Douala I', 'Douala II', 'Douala III', 'Douala IV', 'Douala V'];
    const byArrondissement = arrondissements.map(arr => ({
      label: arr.replace('Douala ', 'D'),
      value: incidents.filter(i => i.location.arrondissement === arr).length
    }));

    // Donut: incidents by status category
    const donutData = [
      { label: 'Nouveaux', value: incidents.filter(i => i.status === 'NOUVEAU').length, color: '#3b82f6' },
      { label: 'En cours', value: incidents.filter(i => ['EN_VERIFICATION', 'ENQUETE_EN_COURS', 'RECHERCHE'].includes(i.status)).length, color: '#f59e0b' },
      { label: 'Critiques', value: incidents.filter(i => ['ALERTE_CRITIQUE', 'ENLEVEMENT_CONFIRME'].includes(i.status)).length, color: '#ef4444' },
      { label: 'Résolus', value: incidents.filter(i => ['RETROUVE', 'CLOTURE'].includes(i.status)).length, color: '#22c55e' },
    ];

    return {
      incidents,
      observations,
      sosActive,
      rumors,
      services,
      sosUsersMap,
      recentActivity,
      pendingIncidents: incidents.filter(i => i.status === 'NOUVEAU').length,
      pendingObservations: observations.filter(o => o.status === 'NOUVEAU').length,
      pendingRumors: rumors.filter(r => r.status === 'PENDING').length,
      pendingAssignments,
      criticalAlerts,
      byArrondissement,
      donutData,
      totalResolved: incidents.filter(i => ['RETROUVE', 'CLOTURE'].includes(i.status)).length,
      totalIncidents: incidents.length,
      totalUsers: users.filter(u => u.role === 'CITOYEN').length,
    };
  }, []);

  const handleResolveSOS = async (id: string) => {
    await db.sosAlerts.update(id, { status: 'RESOLVED', resolvedAt: new Date().toISOString() });
    toast.success('Alerte SOS résolue');
  };

  const handleAssignService = async (sosId: string, serviceId: string) => {
    if (!serviceId) return;
    await db.sosAlerts.update(sosId, { assignedServiceId: serviceId });
    toast.success('SOS assigné au commissariat.');
    setAssigningId(null);
  };

  if (!data) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const resolutionRate = data.totalIncidents > 0
    ? Math.round((data.totalResolved / data.totalIncidents) * 100)
    : 0;

  return (
    <div className="space-y-6 pb-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">Centre de Supervision</h1>
          <p className="text-slate-500 text-sm mt-0.5">Temps réel — {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
        </div>
        {data.sosActive.length > 0 && (
          <div className="flex items-center gap-2 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 px-4 py-2 rounded-xl border border-red-200 dark:border-red-900/40 font-bold text-sm">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500" />
            </span>
            {data.sosActive.length} Urgence(s) SOS Active(s)
          </div>
        )}
      </div>

      {/* ── SECTION 1 : SOS ACTIFS (priorité maximale) ── */}
      {data.sosActive.length > 0 && (
        <section className="space-y-3">
          <h2 className="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-2">
            <AlertTriangle className="w-3.5 h-3.5 animate-pulse" /> Alertes SOS en cours ({data.sosActive.length})
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.sosActive.map(sos => {
              const citizen = data.sosUsersMap[sos.userId];
              const assigned = data.services.find(s => s.id === sos.assignedServiceId);
              return (
                <div key={sos.id} className="bg-white dark:bg-slate-900 rounded-2xl border border-red-200 dark:border-red-800/60 shadow-lg overflow-hidden flex flex-col">
                  <div className="bg-gradient-to-r from-red-600 to-rose-700 px-5 py-4 relative overflow-hidden">
                    <div className="absolute inset-0 bg-white/10 rounded-full w-32 h-32 blur-2xl top-0 right-0 -translate-y-1/2 translate-x-1/4" />
                    <div className="relative flex items-center justify-between">
                      <span className="text-white/80 text-xs font-bold flex items-center gap-1.5 bg-black/20 px-2 py-0.5 rounded-md">
                        <Clock className="w-3 h-3" />
                        {formatDistanceToNow(new Date(sos.createdAt), { addSuffix: true, locale: fr })}
                      </span>
                      {assigned && <span className="text-[10px] font-black bg-white text-red-700 px-2 py-0.5 rounded-md">ASSIGNÉ</span>}
                    </div>
                    <p className="text-white font-black text-lg mt-3 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 animate-pulse" /> SOS DÉCLENCHÉ
                    </p>
                  </div>
                  <div className="p-4 flex-1 space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center shrink-0">
                        {citizen?.photo ? <img src={citizen.photo} className="w-full h-full rounded-full object-cover" alt="" /> : <User className="w-4 h-4 text-slate-400" />}
                      </div>
                      <div className="min-w-0">
                        <p className="font-bold text-slate-900 dark:text-white truncate">{citizen?.name || 'Citoyen'}</p>
                        <p className="text-xs text-slate-400">ID: {sos.userId.slice(0, 8)}…</p>
                      </div>
                    </div>
                    <div className="bg-slate-50 dark:bg-slate-800/50 rounded-xl p-2.5 space-y-1.5 text-xs">
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Phone className="w-3.5 h-3.5 text-slate-400" /> {citizen?.phone || 'N/A'}
                      </div>
                      <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                        <Mail className="w-3.5 h-3.5 text-slate-400" /> <span className="truncate">{citizen?.email || 'N/A'}</span>
                      </div>
                      <div className="flex items-start gap-2 text-red-600 dark:text-red-400">
                        <MapPin className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                        <span className="font-mono text-[10px]">{sos.location.lat.toFixed(5)}, {sos.location.lng.toFixed(5)}</span>
                      </div>
                    </div>
                    {/* Assignment */}
                    {assigned ? (
                      <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-2.5 flex items-center gap-2 text-xs">
                        <Building className="w-3.5 h-3.5 text-blue-600" />
                        <span className="font-bold text-blue-800 dark:text-blue-300 truncate">{assigned.name}</span>
                      </div>
                    ) : assigningId === sos.id ? (
                      <select className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs text-slate-900 dark:text-white outline-none focus:ring-2 focus:ring-red-500"
                        onChange={e => handleAssignService(sos.id, e.target.value)} defaultValue="">
                        <option value="" disabled>Choisir un commissariat…</option>
                        {data.services.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
                      </select>
                    ) : (
                      <button onClick={() => setAssigningId(sos.id)}
                        className="w-full py-2 rounded-xl border-2 border-dashed border-slate-200 dark:border-slate-700 text-slate-500 text-xs font-bold hover:border-red-300 hover:text-red-600 transition-colors flex items-center justify-center gap-1.5">
                        <Building className="w-3.5 h-3.5" /> Assigner à un commissariat
                      </button>
                    )}
                  </div>
                  <div className="px-4 pb-4">
                    <button onClick={() => handleResolveSOS(sos.id)}
                      className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Marquer comme résolu
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* ── SECTION 2 : KPIs opérationnels ── */}
      <section>
        <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-2">
          <Zap className="w-3.5 h-3.5" /> Indicateurs Opérationnels
        </h2>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <KpiCard icon={ShieldAlert} label="À valider" value={data.pendingIncidents} color="bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400" onClick={() => navigate('/superviseur/validation')} />
          <KpiCard icon={Eye} label="Observations" value={data.pendingObservations} color="bg-orange-100 dark:bg-orange-900/30 text-orange-600 dark:text-orange-400" onClick={() => navigate('/superviseur/observations')} />
          <KpiCard icon={Target} label="Affectations" value={data.pendingAssignments} sub="sans commissariat" color="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400" />
          <KpiCard icon={AlertTriangle} label="Alertes Critiques" value={data.criticalAlerts} color="bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-3">
          <KpiCard icon={MessageSquareWarning} label="Rumeurs" value={data.pendingRumors} sub="à vérifier" color="bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400" onClick={() => navigate('/superviseur/rumeurs')} />
          <KpiCard icon={FileText} label="Total Signalements" value={data.totalIncidents} color="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400" onClick={() => navigate('/superviseur/incidents')} />
          <KpiCard icon={CheckCircle2} label="Résolus" value={data.totalResolved} color="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400" />
          <KpiCard icon={TrendingUp} label="Taux résolution" value={`${resolutionRate}%`} sub="sur total incidents" color="bg-teal-100 dark:bg-teal-900/30 text-teal-600 dark:text-teal-400" />
        </div>
      </section>

      {/* ── SECTION 3 : Carte SIG + Graphiques ── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Map */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
          <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
            <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
              <MapPin className="w-4 h-4 text-indigo-500" /> Carte SIG Opérationnelle
            </h2>
            <button onClick={() => navigate('/superviseur/map')} className="text-xs text-indigo-500 font-bold hover:underline flex items-center gap-1">
              Plein écran <ArrowRight className="w-3 h-3" />
            </button>
          </div>
          <div style={{ height: '360px' }}>
            {data.incidents.length > 0 ? (
              <SIGMap incidents={data.incidents.slice(0, 50)} services={data.services} />
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-sm">Chargement de la carte…</div>
            )}
          </div>
        </div>

        {/* Charts column */}
        <div className="space-y-4">
          {/* Donut */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-500" /> Répartition des dossiers
            </h3>
            <DonutChart segments={data.donutData} />
          </div>
          {/* Bar chart */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-500" /> Par arrondissement
            </h3>
            <MiniBarChart data={data.byArrondissement} color="#6366f1" />
          </div>
        </div>
      </div>

      {/* ── SECTION 4 : Activité récente ── */}
      <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl overflow-hidden shadow-sm">
        <div className="px-5 py-4 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <h2 className="font-bold text-slate-900 dark:text-white flex items-center gap-2 text-sm">
            <Timer className="w-4 h-4 text-purple-500" /> Activité Récente
          </h2>
          <button onClick={() => navigate('/superviseur/incidents')} className="text-xs text-indigo-500 font-bold hover:underline flex items-center gap-1">
            Voir tout <ArrowRight className="w-3 h-3" />
          </button>
        </div>
        <div className="divide-y divide-slate-100 dark:divide-slate-800">
          {data.recentActivity.length === 0 ? (
            <p className="text-center py-8 text-slate-400 text-sm">Aucune activité récente</p>
          ) : (
            data.recentActivity.map(inc => {
              const STATUS_COLORS: Record<string, string> = {
                NOUVEAU: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
                EN_VERIFICATION: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
                ALERTE_CRITIQUE: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
                ENQUETE_EN_COURS: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400',
                RETROUVE: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400',
              };
              const TYPE_EMOJIS: Record<string, string> = {
                DISPARITION: '🔵', FUGUE: '🟡', ENLEVEMENT: '🔴', TROUBLE_COGNITIF: '🟣', ACCIDENT_SUSPECT: '🟠', AUTRE: '⚪'
              };
              return (
                <div key={inc.id} className="px-5 py-3.5 flex items-center gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors cursor-default">
                  <span className="text-lg shrink-0">{TYPE_EMOJIS[inc.type] || '⚪'}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{inc.title}</p>
                    <p className="text-xs text-slate-500 mt-0.5">{inc.location.arrondissement} • {formatDistanceToNow(new Date(inc.createdAt), { addSuffix: true, locale: fr })}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shrink-0 ${STATUS_COLORS[inc.status] || 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'}`}>
                    {inc.status.replace(/_/g, ' ')}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};
