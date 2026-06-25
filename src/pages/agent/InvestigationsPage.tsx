import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';

export const AgentInvestigationsPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Mes Enquêtes</h1>
        <p className="text-slate-400 text-sm">Suivi des enquêtes en cours</p>
      </div>
      <Card>
        <CardContent className="p-6 text-center text-slate-500">
          Vous n'avez aucune enquête en cours.
        </CardContent>
      </Card>
    </div>
  );
};
