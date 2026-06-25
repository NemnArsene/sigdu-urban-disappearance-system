import React from 'react';

export const AgentDashboard = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold tracking-tight">Tableau de bord Agent</h1>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl border-l-4 border-l-amber-500">
          <p className="text-sm text-slate-400 font-medium">Nouvelles Affectations</p>
          <p className="text-3xl font-bold mt-2">3</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-xl border-l-4 border-l-blue-500">
          <p className="text-sm text-slate-400 font-medium">Enquêtes en cours</p>
          <p className="text-3xl font-bold mt-2">12</p>
        </div>
      </div>
    </div>
  );
};
