import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { SIGMap } from '../../components/map/SIGMap';
import { Card, CardContent } from '../../components/ui/Card';

export const AgentMapPage = () => {
  const incidents = useLiveQuery(() => db.incidents.toArray(), []);

  return (
    <div className="h-full flex flex-col space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Carte SIG</h1>
        <p className="text-slate-400 text-sm">Vue globale des incidents pour les agents terrain</p>
      </div>
      
      <Card className="flex-1 overflow-hidden min-h-[500px]">
        <CardContent className="p-0 h-full relative">
          {incidents ? (
            <SIGMap incidents={incidents} />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-500"></div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
