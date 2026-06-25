import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { db } from '../../lib/database';
import { useLiveQuery } from 'dexie-react-hooks';
import {
  ChevronLeft, ShieldCheck, MapPin, Bell, BellOff, CheckCircle2,
  Loader2, Eye, Users, Zap, ToggleLeft, ToggleRight
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const ARRONDISSEMENTS = [
  { id: 'Douala I', name: 'Douala I — Bonanjo', emoji: '🏛️', quartiers: ['Bonanjo', 'Akwa', 'Bonapriso', 'Bali'] },
  { id: 'Douala II', name: 'Douala II — New Bell', emoji: '🏪', quartiers: ['New Bell', 'Nkongmondo', 'Mboppi', 'Kassalafam'] },
  { id: 'Douala III', name: 'Douala III — Logbaba', emoji: '🏭', quartiers: ['Logbaba', 'Logpom', 'Makepe', 'Bonamoussadi'] },
  { id: 'Douala IV', name: 'Douala IV — Bonassama', emoji: '🌊', quartiers: ['Bonassama', 'Bonaberi', 'Sodiko', 'Village'] },
  { id: 'Douala V', name: 'Douala V — Kotto', emoji: '🏘️', quartiers: ['Kotto', 'Ndogbong', 'Beedi', 'Logbessou'] },
];

export const CitizenWatcherPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [saving, setSaving] = useState(false);
  const [selectedArrondissements, setSelectedArrondissements] = useState<string[]>([]);
  const [selectedQuartiers, setSelectedQuartiers] = useState<string[]>([]);
  const [active, setActive] = useState(false);
  const [registered, setRegistered] = useState(false);

  // Load existing watcher config
  const existingWatcher = useLiveQuery(
    () => user?.id ? db.watchers.get(user.id) : undefined,
    [user?.id]
  );

  useEffect(() => {
    if (existingWatcher) {
      setSelectedArrondissements(existingWatcher.arrondissements);
      setSelectedQuartiers(existingWatcher.favoriteQuartiers);
      setActive(existingWatcher.active);
      setRegistered(true);
    }
  }, [existingWatcher]);

  const toggleArrondissement = (id: string) => {
    setSelectedArrondissements(prev =>
      prev.includes(id) ? prev.filter(a => a !== id) : [...prev, id]
    );
  };

  const toggleQuartier = (quartier: string) => {
    setSelectedQuartiers(prev =>
      prev.includes(quartier) ? prev.filter(q => q !== quartier) : [...prev, quartier]
    );
  };

  const handleSave = async () => {
    if (!user?.id) return;
    if (selectedArrondissements.length === 0) {
      toast.error('Sélectionnez au moins un arrondissement');
      return;
    }

    setSaving(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 800));

      const watcherData = {
        userId: user.id,
        arrondissements: selectedArrondissements,
        favoriteQuartiers: selectedQuartiers,
        active: true,
      };

      if (registered) {
        await db.watchers.update(user.id, watcherData);
      } else {
        await db.watchers.add(watcherData);
      }

      setActive(true);
      setRegistered(true);
      toast.success(registered ? 'Préférences mises à jour !' : '🎉 Vous êtes maintenant Citoyen Veilleur !');
    } catch (err) {
      toast.error('Erreur lors de l\'enregistrement');
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async () => {
    if (!user?.id) return;
    const newActive = !active;
    setActive(newActive);
    await db.watchers.update(user.id, { active: newActive });
    toast.success(newActive ? 'Alertes veilleur activées' : 'Alertes veilleur désactivées');
  };

  // Get all available quartiers for selected arrondissements
  const availableQuartiers = ARRONDISSEMENTS
    .filter(a => selectedArrondissements.includes(a.id))
    .flatMap(a => a.quartiers);

  return (
    <div className="space-y-5 pb-6">
      {/* Back */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour
      </button>

      {/* Header */}
      <div className="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-700 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-blue-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-200 font-semibold text-xs mb-3">
            <ShieldCheck className="w-4 h-4" />
            <span>Réseau de Vigilance</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2">Citoyen Veilleur</h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Rejoignez le réseau de veille citoyenne. Recevez des alertes géolocalisées pour les zones que vous surveillez.
          </p>
        </div>
      </div>

      {/* Active Status (if registered) */}
      {registered && (
        <div className={cn(
          "rounded-2xl p-4 flex items-center justify-between border transition-all",
          active
            ? "bg-emerald-50 dark:bg-emerald-500/5 border-emerald-200 dark:border-emerald-800/40"
            : "bg-slate-100 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700"
        )}>
          <div className="flex items-center gap-3">
            {active ? (
              <Bell className="w-5 h-5 text-emerald-500" />
            ) : (
              <BellOff className="w-5 h-5 text-slate-400" />
            )}
            <div>
              <p className={cn("text-sm font-bold", active ? "text-emerald-700 dark:text-emerald-400" : "text-slate-500")}>
                {active ? 'Alertes actives' : 'Alertes désactivées'}
              </p>
              <p className="text-[10px] text-slate-400">
                {active ? 'Vous recevez les alertes de vos zones' : 'Réactivez pour recevoir les alertes'}
              </p>
            </div>
          </div>
          <button onClick={toggleActive} className="shrink-0">
            {active ? (
              <ToggleRight className="w-8 h-8 text-emerald-500" />
            ) : (
              <ToggleLeft className="w-8 h-8 text-slate-400" />
            )}
          </button>
        </div>
      )}

      {/* How it works */}
      {!registered && (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3">Comment ça fonctionne ?</h3>
          <div className="space-y-3">
            {[
              { icon: MapPin, text: 'Choisissez vos zones de surveillance (arrondissements et quartiers)' },
              { icon: Bell, text: 'Recevez des alertes instantanées pour les incidents dans vos zones' },
              { icon: Eye, text: 'Signalez vos observations pour aider la communauté' },
              { icon: Users, text: 'Rejoignez un réseau de citoyens vigilants' },
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center shrink-0">
                  <step.icon className="w-4 h-4 text-blue-500" />
                </div>
                <p className="text-xs text-slate-600 dark:text-slate-400 pt-1.5 leading-relaxed">{step.text}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Zone Selection */}
      <div>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <MapPin className="w-4 h-4 text-blue-500" />
          Mes zones de surveillance
        </h3>
        <div className="space-y-2">
          {ARRONDISSEMENTS.map(arr => {
            const isSelected = selectedArrondissements.includes(arr.id);
            return (
              <button
                key={arr.id}
                onClick={() => toggleArrondissement(arr.id)}
                className={cn(
                  "w-full flex items-center gap-3 p-3.5 rounded-2xl border-2 transition-all text-left active:scale-[0.98]",
                  isSelected
                    ? "border-blue-500 bg-blue-50 dark:bg-blue-500/10"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900"
                )}
              >
                <span className="text-xl">{arr.emoji}</span>
                <div className="flex-1">
                  <p className={cn("text-sm font-bold", isSelected ? "text-blue-700 dark:text-blue-400" : "text-slate-900 dark:text-white")}>
                    {arr.name}
                  </p>
                  <p className="text-[10px] text-slate-400">{arr.quartiers.length} quartiers couverts</p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="w-5 h-5 text-blue-500 shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Quartier fine-tuning */}
      {availableQuartiers.length > 0 && (
        <div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-500" />
            Quartiers favoris (optionnel)
          </h3>
          <p className="text-[11px] text-slate-400 mb-3">Recevez des alertes prioritaires pour ces quartiers</p>
          <div className="flex flex-wrap gap-2">
            {availableQuartiers.map(quartier => {
              const isSelected = selectedQuartiers.includes(quartier);
              return (
                <button
                  key={quartier}
                  onClick={() => toggleQuartier(quartier)}
                  className={cn(
                    "px-3.5 py-2 rounded-xl text-xs font-bold border-2 transition-all active:scale-95",
                    isSelected
                      ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-400"
                      : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400"
                  )}
                >
                  {quartier}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Save Button */}
      <button
        onClick={handleSave}
        disabled={saving || selectedArrondissements.length === 0}
        className={cn(
          "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95",
          selectedArrondissements.length > 0
            ? "bg-gradient-to-r from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/20"
            : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
        )}
      >
        {saving ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Enregistrement...
          </>
        ) : (
          <>
            <ShieldCheck className="w-5 h-5" />
            {registered ? 'Mettre à jour mes zones' : 'Devenir Citoyen Veilleur'}
          </>
        )}
      </button>
    </div>
  );
};
