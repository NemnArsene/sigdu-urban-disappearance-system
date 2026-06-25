import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { resetDatabase } from '../../lib/seeder';
import { toast } from 'sonner';

export const AdminConfigurationPage = () => {
  const handleReset = async () => {
    if (confirm("Attention: Cette action effacera toutes les données et recréera les données de démonstration. Voulez-vous continuer ?")) {
      try {
        await resetDatabase();
        toast.success('Données réinitialisées avec succès');
        setTimeout(() => {
          window.location.reload();
        }, 1500);
      } catch (err) {
        toast.error('Erreur lors de la réinitialisation');
      }
    }
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Configuration Système</h1>
        <p className="text-slate-400 text-sm">Paramètres et actions de maintenance</p>
      </div>

      <Card className="border-red-500/50">
        <CardHeader>
          <CardTitle className="text-red-500">Zone de Danger</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-slate-300">
            Utilisez ce bouton pour réinitialiser la base de données locale (DexieJS) et générer de nouvelles données de démonstration pour le jury.
          </p>
          <Button variant="destructive" onClick={handleReset}>
            Réinitialiser les données de démonstration
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
