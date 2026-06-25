import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, Legend } from 'recharts';
import { AlertTriangle, CheckCircle2, Clock, TrendingUp, ShieldAlert, FileText, Search, Activity, Star } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';

const evolutionData = [
  { date: '28 mai', count: 12 }, { date: '30 mai', count: 24 },
  { date: '01 juin', count: 28 }, { date: '03 juin', count: 15 },
  { date: '05 juin', count: 32 }, { date: '07 juin', count: 18 },
  { date: '09 juin', count: 22 }, { date: '11 juin', count: 14 },
  { date: '13 juin', count: 30 }, { date: '15 juin', count: 25 },
  { date: '17 juin', count: 10 }, { date: '19 juin', count: 18 },
  { date: '21 juin', count: 34 }, { date: '23 juin', count: 32 },
  { date: '25 juin', count: 36 }
];

const statusData = [
  { name: 'Retrouvés', value: 271, color: '#10b981' },
  { name: 'Recherche active', value: 87, color: '#3b82f6' },
  { name: 'En attente', value: 98, color: '#f59e0b' },
  { name: 'Fausse alerte', value: 44, color: '#8b5cf6' }
];

const weeklyData = [
  { day: 'Lun', signalements: 25, resolus: 18 },
  { day: 'Mar', signalements: 32, resolus: 24 },
  { day: 'Mer', signalements: 28, resolus: 22 },
  { day: 'Jeu', signalements: 20, resolus: 15 },
  { day: 'Ven', signalements: 35, resolus: 28 },
  { day: 'Sam', signalements: 42, resolus: 30 },
  { day: 'Dim', signalements: 15, resolus: 10 }
];

const performanceData = [
  { subject: 'Réactivité', A: 85, fullMark: 100 },
  { subject: 'Résolution', A: 75, fullMark: 100 },
  { subject: 'Satisfaction', A: 88, fullMark: 100 },
  { subject: 'Couverture', A: 92, fullMark: 100 },
  { subject: 'Prévention', A: 65, fullMark: 100 },
  { subject: 'Collaboration', A: 78, fullMark: 100 }
];

const zoneData = [
  { name: 'Bonabéri', value: 85, color: '#10b981' },
  { name: 'Bojongo', value: 98, color: '#3b82f6' },
  { name: 'Mabanda', value: 35, color: '#f59e0b' },
  { name: 'Sodiko', value: 70, color: '#ef4444' },
  { name: 'Nkomba', value: 25, color: '#8b5cf6' },
  { name: 'Grand Hangar', value: 85, color: '#f97316' },
  { name: 'Bonassama', value: 92, color: '#14b8a6' },
  { name: 'Mambanda', value: 25, color: '#ec4899' }
];

const categoryData = [
  { name: 'Enfant mineur', value: 109, color: '#f97316' },
  { name: 'Adulte', value: 56, color: '#10b981' },
  { name: 'Personne âgée', value: 76, color: '#3b82f6' },
  { name: 'Fugue', value: 68, color: '#f59e0b' },
  { name: 'Enlèvement', value: 25, color: '#ef4444' },
  { name: 'Trouble cognitif', value: 49, color: '#8b5cf6' },
  { name: 'Accident suspect', value: 31, color: '#ec4899' },
  { name: 'Autre', value: 25, color: '#64748b' }
];

export const AdminDashboard = () => {
  const { user } = useAuthStore();
  const currentDate = new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-emerald-600 to-teal-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-40 h-40 bg-white opacity-10 rounded-full blur-3xl"></div>
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <p className="text-emerald-100 font-medium">Bon après-midi,</p>
            <h1 className="text-2xl md:text-3xl font-bold mt-1">Système Administrateur</h1>
            <p className="flex items-center gap-2 mt-3 text-sm">
              <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
              23 nouveaux signalements aujourd'hui
            </p>
            <div className="flex flex-wrap gap-3 mt-4">
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"><Activity className="w-3 h-3" /> 17 agents actifs</span>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"><Search className="w-3 h-3" /> 34 interventions</span>
              <span className="bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5"><Star className="w-3 h-3" /> 4.2/5 satisfaction</span>
            </div>
          </div>
          <div className="text-right hidden md:block">
            <p className="font-bold text-lg capitalize">{currentDate}</p>
            <p className="text-emerald-100">Taux de résolution: <span className="font-bold text-white">74.2%</span></p>
          </div>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Total Signalements</p>
              <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">500</h3>
              <p className="text-xs text-gray-500 mt-1">Depuis le début</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center text-orange-500">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-emerald-500 mt-4 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +12% vs mois dernier
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Résolus (Retrouvés)</p>
              <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">271</h3>
              <p className="text-xs text-gray-500 mt-1">74.2% du total</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center text-emerald-500">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-emerald-500 mt-4 flex items-center gap-1">
            <TrendingUp className="w-3 h-3" /> +8% ce mois
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">En Attente</p>
              <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">98</h3>
              <p className="text-xs text-gray-500 mt-1">Recherche active</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center text-blue-500">
              <Search className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-red-500 mt-4 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 rotate-180" /> -5% vs hier
          </p>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Délai Moyen</p>
              <h3 className="text-3xl font-bold mt-2 text-gray-900 dark:text-white">18.5h</h3>
              <p className="text-xs text-gray-500 mt-1">Résolution</p>
            </div>
            <div className="w-10 h-10 rounded-full bg-purple-50 dark:bg-purple-500/10 flex items-center justify-center text-purple-500">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs font-medium text-emerald-500 mt-4 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 rotate-180" /> -15% d'amélioration
          </p>
        </div>
      </div>

      {/* Main Charts Row 1 */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col h-[350px]">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="font-bold text-gray-900 dark:text-white text-lg">Évolution des Signalements</h3>
              <p className="text-xs text-gray-500">Tendance temporelle</p>
            </div>
            <div className="flex gap-2">
              <button className="px-3 py-1 text-xs font-medium rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300">7J</button>
              <button className="px-3 py-1 text-xs font-bold rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 dark:bg-emerald-500/20 dark:text-emerald-400 dark:border-emerald-500/30">30J</button>
            </div>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={evolutionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorCount" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="date" tick={{fontSize: 10}} tickLine={false} axisLine={false} stroke="#6b7280" />
                <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} stroke="#6b7280" />
                <RechartsTooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                <Area type="monotone" dataKey="count" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorCount)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm flex flex-col h-[350px]">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Répartition par Statut</h3>
            <p className="text-xs text-gray-500">Vue globale</p>
          </div>
          <div className="flex-1 w-full flex items-center justify-center min-h-0 mt-4 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={statusData} innerRadius={60} outerRadius={90} paddingAngle={2} dataKey="value" stroke="none">
                  {statusData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <RechartsTooltip />
              </PieChart>
            </ResponsiveContainer>
            {/* Overlay total inside donut */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-bold text-gray-900 dark:text-white">500</span>
              <span className="text-xs text-gray-500">Total</span>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {statusData.map(s => (
              <div key={s.name} className="flex justify-between text-xs">
                <div className="flex items-center gap-1.5 truncate pr-2">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: s.color }} />
                  <span className="text-gray-600 dark:text-gray-400 truncate">{s.name}</span>
                </div>
                <span className="font-bold text-gray-900 dark:text-white">{s.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Charts Row 2 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm h-[350px] flex flex-col">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Distribution Hebdomadaire</h3>
            <p className="text-xs text-gray-500">Signalements par jour de la semaine</p>
          </div>
          <div className="flex-1 w-full min-h-0 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={weeklyData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#374151" opacity={0.2} />
                <XAxis dataKey="day" tick={{fontSize: 10}} tickLine={false} axisLine={false} stroke="#6b7280" />
                <YAxis tick={{fontSize: 10}} tickLine={false} axisLine={false} stroke="#6b7280" />
                <RechartsTooltip cursor={{fill: 'transparent'}} contentStyle={{ borderRadius: '8px' }} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="signalements" name="Signalements" fill="#10b981" radius={[4, 4, 0, 0]} barSize={30} />
                <Bar dataKey="resolus" name="Résolus" fill="#3b82f6" radius={[4, 4, 0, 0]} barSize={30} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm h-[350px] flex flex-col">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Performance Globale</h3>
            <p className="text-xs text-gray-500">Indicateurs multi-dimensionnels</p>
          </div>
          <div className="flex-1 w-full min-h-0">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="70%" data={performanceData}>
                <PolarGrid stroke="#374151" opacity={0.3} />
                <PolarAngleAxis dataKey="subject" tick={{fontSize: 10, fill: '#6b7280'}} />
                <Radar name="Performance" dataKey="A" stroke="#10b981" fill="#10b981" fillOpacity={0.4} />
                <RechartsTooltip />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Main Charts Row 3 */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm h-[350px] flex flex-col">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Performance par Zone</h3>
            <p className="text-xs text-gray-500">Signalements et capacité de traitement</p>
          </div>
          <div className="flex-1 w-full min-h-0 mt-4">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart layout="vertical" data={zoneData} margin={{ top: 10, right: 30, left: 20, bottom: 0 }}>
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" tick={{fontSize: 10}} tickLine={false} axisLine={false} width={80} stroke="#6b7280" />
                <RechartsTooltip cursor={{fill: 'rgba(0,0,0,0.05)'}} contentStyle={{ borderRadius: '8px' }} />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={20}>
                  {zoneData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5 shadow-sm h-[350px] flex flex-col">
          <div>
            <h3 className="font-bold text-gray-900 dark:text-white text-lg">Répartition par Catégorie</h3>
            <p className="text-xs text-gray-500">Types de disparitions signalées</p>
          </div>
          <div className="flex-1 flex flex-col md:flex-row items-center justify-center gap-6 mt-4 min-h-0">
            <div className="w-full md:w-1/2 h-48 md:h-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" outerRadius={80} paddingAngle={2} dataKey="value" stroke="none">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <RechartsTooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full md:w-1/2 flex flex-col justify-center gap-2 overflow-y-auto pr-2" style={{maxHeight: "100%"}}>
              {categoryData.map(cat => (
                <div key={cat.name} className="flex justify-between text-xs items-center">
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: cat.color }} />
                    <span className="text-gray-600 dark:text-gray-400 truncate">{cat.name}</span>
                  </div>
                  <span className="font-bold text-gray-900 dark:text-white shrink-0 ml-2">{cat.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

