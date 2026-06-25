import React from 'react';
import { Card, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { FileText, Download } from 'lucide-react';
import { toast } from 'sonner';

export const SupervisorReportsPage = () => {
  const handleDownload = () => {
    toast.success('Génération du rapport en cours...');
    setTimeout(() => {
      toast.success('Rapport téléchargé avec succès');
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Rapports</h1>
        <p className="text-slate-400 text-sm">Génération et export des rapports officiels</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-red-500/10 rounded-lg">
                <FileText className="w-6 h-6 text-red-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Rapport Mensuel (PDF)</h3>
                <p className="text-sm text-slate-400">Juin 2026</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6 flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-500/10 rounded-lg">
                <FileText className="w-6 h-6 text-green-500" />
              </div>
              <div>
                <h3 className="font-semibold text-white">Export de données (Excel)</h3>
                <p className="text-sm text-slate-400">Tous les incidents</p>
              </div>
            </div>
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="w-4 h-4 mr-2" />
              Exporter
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
