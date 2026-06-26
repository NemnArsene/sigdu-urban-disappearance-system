import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { useAuthStore } from '../../stores/authStore';
import { Card, CardContent } from '../../components/ui/Card';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { STATUS_DISPLAY, TYPE_DISPLAY } from '../../lib/workflows';
import type { IncidentStatus, IncidentType } from '../../types';
import { ClipboardCheck, Search, CheckCircle2, Layers } from 'lucide-react';

const CHART_COLORS = ['#f59e0b', '#3b82f6', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4', '#ec4899'];

export const AgentDashboard = () => {
  const { user } = useAuthStore();

  const myIncidents = useLiveQuery(
    () => user ? db.incidents.where('assignedTo').equals(user.id).toArray() : [],
    [user]
  );

  const serviceIncidents = useLiveQuery(
    () => user?.serviceId
      ? db.incidents.where('assignedServiceId').equals(user.serviceId).toArray()
      : [],
    [user]
  );

  if (!user) return null;

  const allIncidents = serviceIncidents || [];
  const mine = myIncidents || [];

  const newAssignments = allIncidents.filter(i => i.status === 'NOUVEAU' && !i.assignedTo).length;
  const inProgress = mine.filter(i => !['CLOTURE', 'RETROUVE', 'FAUSSE_ALERTE'].includes(i.status)).length;
  const resolved = mine.filter(i => ['LOCALISE', 'RETROUVE', 'CLOTURE'].includes(i.status)).length;
  const totalAssigned = mine.length;

  const kpis = [
    { label: 'Nouvelles affectations', value: newAssignments, icon: ClipboardCheck, color: 'border-l-amber-500', bg: 'bg-amber-500/10', iconColor: 'text-amber-500' },
    { label: 'Enquêtes en cours', value: inProgress, icon: Search, color: 'border-l-blue-500', bg: 'bg-blue-500/10', iconColor: 'text-blue-500' },
    { label: 'Dossiers résolus', value: resolved, icon: CheckCircle2, color: 'border-l-emerald-500', bg: 'bg-emerald-500/10', iconColor: 'text-emerald-500' },
    { label: 'Total assigné', value: totalAssigned, icon: Layers, color: 'border-l-purple-500', bg: 'bg-purple-500/10', iconColor: 'text-purple-500' },
  ];

  // Pie chart: status distribution of my incidents
  const statusCounts = mine.reduce((acc, inc) => {
    acc[inc.status] = (acc[inc.status] || 0) + 1;
    return acc;
  }, {} as Record<IncidentStatus, number>);

  const statusData = Object.entries(statusCounts)
    .map(([status, count]) => ({
      name: STATUS_DISPLAY[status as IncidentStatus]?.label || status,
      value: count,
    }))
    .filter(d => d.value > 0);

  // Bar chart: incident types across service
  const typeCounts = allIncidents.reduce((acc, inc) => {
    acc[inc.type] = (acc[inc.type] || 0) + 1;
    return acc;
  }, {} as Record<IncidentType, number>);

  const typeData = Object.entries(typeCounts)
    .map(([type, count]) => ({
      name: TYPE_DISPLAY[type as IncidentType]?.label || type,
      count,
    }))
    .sort((a, b) => b.count - a.count);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Tableau de bord</h1>
        <p className="text-slate-400 text-sm">Vue d'ensemble de votre activité</p>
      </div>

      {/* KPI Cards */}
      <div className="grid gap-4 grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <Card key={kpi.label} className={`border-l-4 ${kpi.color}`}>
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm text-slate-400 font-medium">{kpi.label}</p>
                  <p className="text-2xl sm:text-3xl font-bold mt-1">{kpi.value}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${kpi.bg}`}>
                  <kpi.icon className={`w-5 h-5 ${kpi.iconColor}`} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Charts */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* Pie Chart - Status Distribution */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold text-sm mb-4">Répartition par statut</h3>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={90}
                    paddingAngle={3}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {statusData.map((_, index) => (
                      <Cell key={index} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-slate-500 text-sm">
                Aucune donnée
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bar Chart - Types */}
        <Card>
          <CardContent className="p-4 sm:p-6">
            <h3 className="font-semibold text-sm mb-4">Types d'incidents (service)</h3>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={260}>
                <BarChart data={typeData} layout="vertical" margin={{ left: 10 }}>
                  <XAxis type="number" tick={{ fill: '#94a3b8', fontSize: 12 }} />
                  <YAxis type="category" dataKey="name" tick={{ fill: '#94a3b8', fontSize: 12 }} width={100} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px' }}
                    labelStyle={{ color: '#f8fafc' }}
                    itemStyle={{ color: '#f8fafc' }}
                  />
                  <Bar dataKey="count" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-[260px] text-slate-500 text-sm">
                Aucune donnée
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
