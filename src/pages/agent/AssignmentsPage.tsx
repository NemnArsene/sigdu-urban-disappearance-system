import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';

export const AgentAssignmentsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mes Affectations</h1>
        <p className="text-slate-400 text-sm">Dossiers qui vous sont assignés</p>
      </div>
      <Card>
        <CardContent className="p-6 text-center text-slate-500">
          Aucune nouvelle affectation.
        </CardContent>
      </Card>
    </div>
  );
};
