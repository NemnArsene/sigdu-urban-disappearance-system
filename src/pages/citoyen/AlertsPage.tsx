import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { Card, CardContent } from '../../components/ui/Card';
import { AlertTriangle, Info } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

export const CitizenAlertsPage = () => {
  const alerts = useLiveQuery(() => db.alerts.orderBy('createdAt').reverse().toArray(), []);

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Alertes</h1>
        <p className="text-slate-400 text-sm">Avis et alertes importantes de sécurité</p>
      </div>

      <div className="space-y-4 mt-6">
        {!alerts?.length ? (
          <p className="text-slate-500">Aucune alerte pour le moment.</p>
        ) : (
          alerts.map(alert => (
            <Card key={alert.id} className={alert.level === 'CRITICAL' ? 'border-red-500/50 bg-red-950/10' : ''}>
              <CardContent className="p-4 flex items-start gap-4">
                {alert.level === 'CRITICAL' ? (
                  <AlertTriangle className="w-6 h-6 text-red-500 shrink-0 mt-1" />
                ) : (
                  <Info className="w-6 h-6 text-blue-500 shrink-0 mt-1" />
                )}
                <div>
                  <h3 className="font-bold text-white">{alert.title}</h3>
                  <p className="text-slate-300 text-sm mt-1">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-2">
                    {formatDistanceToNow(new Date(alert.createdAt), { addSuffix: true, locale: fr })}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
