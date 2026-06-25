import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';

export const AdminAuditPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Logs d'Audit</h1>
        <p className="text-slate-400 text-sm">Traçabilité des actions sensibles</p>
      </div>
      <Card>
        <CardContent className="p-6">
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4 border-b border-slate-800 pb-4">
                <div className="text-sm text-slate-500 w-32 shrink-0">Il y a {i} heure(s)</div>
                <div>
                  <p className="text-sm font-medium">Connexion réussie</p>
                  <p className="text-xs text-slate-400">admin@sigdu.cm - IP: 192.168.1.{100 + i}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
