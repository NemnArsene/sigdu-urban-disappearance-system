import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { db } from '../../lib/database';
import { ChevronLeft, MessageSquareWarning, Camera, Send, Loader2, CheckCircle2, Info, ShieldAlert } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const SOURCES = [
  { id: 'whatsapp', label: 'WhatsApp', emoji: '💬' },
  { id: 'facebook', label: 'Facebook', emoji: '📘' },
  { id: 'tiktok', label: 'TikTok', emoji: '🎵' },
  { id: 'bouche', label: 'Bouche à oreille', emoji: '🗣️' },
  { id: 'autre', label: 'Autre source', emoji: '📰' },
];

export const CitizenSubmitRumorPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [content, setContent] = useState('');
  const [source, setSource] = useState('');
  const [photo, setPhoto] = useState<string>('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setPhoto(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!content.trim()) {
      toast.error('Veuillez décrire la rumeur');
      return;
    }
    if (!source) {
      toast.error('Veuillez sélectionner la source');
      return;
    }

    setSubmitting(true);

    // Simulate submission delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      await db.rumors.add({
        id: `rum_${Date.now()}`,
        submittedBy: user?.id || 'anonymous',
        content: `[Source: ${source}] ${content}`,
        photo: photo || undefined,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
      });

      setSuccess(true);
      toast.success('Rumeur soumise pour vérification !');
    } catch (err) {
      toast.error('Erreur lors de la soumission');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-20 h-20 rounded-full bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-10 h-10 text-emerald-500" />
        </div>
        <h2 className="text-2xl font-black text-slate-900 dark:text-white mb-2">Merci pour votre vigilance !</h2>
        <p className="text-slate-500 text-sm max-w-xs mb-8 leading-relaxed">
          Votre signalement de rumeur a été transmis au Centre de Supervision. Notre équipe va vérifier cette information et publier une réponse officielle.
        </p>
        <div className="space-y-3 w-full max-w-xs">
          <button
            onClick={() => navigate('/citoyen/actualite')}
            className="w-full py-3.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-xl font-bold text-sm active:scale-95 transition-transform"
          >
            Voir le fil d'actualité
          </button>
          <button
            onClick={() => navigate('/citoyen/dashboard')}
            className="w-full py-3 text-slate-500 rounded-xl font-medium text-sm hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            Retour à l'accueil
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300 transition-colors text-sm font-medium"
      >
        <ChevronLeft className="w-4 h-4" />
        Retour
      </button>

      {/* Header */}
      <div className="bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-amber-200 font-semibold text-xs mb-3">
            <MessageSquareWarning className="w-4 h-4" />
            <span>Vérification des rumeurs</span>
          </div>
          <h2 className="text-xl font-black tracking-tight mb-1">Soumettre une rumeur</h2>
          <p className="text-white/70 text-xs leading-relaxed max-w-xs">
            Vous avez vu un message suspect sur les réseaux sociaux ? Soumettez-le à notre équipe de vérification.
          </p>
        </div>
      </div>

      {/* Info notice */}
      <div className="flex items-start gap-3 bg-blue-50 dark:bg-blue-500/5 border border-blue-100 dark:border-blue-800/30 rounded-2xl p-4">
        <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
          Ne partagez <strong>pas</strong> la rumeur avec d'autres personnes avant qu'elle ait été vérifiée. Cela pourrait causer de la panique inutile.
        </p>
      </div>

      {/* Form */}
      <div className="space-y-5">
        {/* Source selection */}
        <div>
          <label className="block text-sm font-bold text-slate-900 dark:text-white mb-3">
            D'où provient cette rumeur ?
          </label>
          <div className="grid grid-cols-3 gap-2">
            {SOURCES.map(s => (
              <button
                key={s.id}
                onClick={() => setSource(s.id)}
                className={cn(
                  "flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center active:scale-95",
                  source === s.id
                    ? "border-amber-500 bg-amber-50 dark:bg-amber-500/10"
                    : "border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-slate-300 dark:hover:border-slate-600"
                )}
              >
                <span className="text-xl">{s.emoji}</span>
                <span className={cn(
                  "text-[10px] font-bold",
                  source === s.id ? "text-amber-700 dark:text-amber-400" : "text-slate-500"
                )}>{s.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div>
          <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
            Décrivez la rumeur
          </label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder='Ex: "On dit que des enfants sont enlevés dans les taxis à Douala..."'
            rows={4}
            className="w-full bg-white dark:bg-slate-900 border-2 border-slate-200 dark:border-slate-700 rounded-2xl px-4 py-3 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:border-amber-500 dark:focus:border-amber-500 resize-none transition-colors"
          />
          <p className="text-[10px] text-slate-400 mt-1 font-medium">Recopiez le message tel quel si possible</p>
        </div>

        {/* Photo / Screenshot */}
        <div>
          <label className="block text-sm font-bold text-slate-900 dark:text-white mb-2">
            Capture d'écran (optionnel)
          </label>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoUpload}
            className="hidden"
          />
          {photo ? (
            <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-700">
              <img src={photo} alt="Capture" className="w-full h-40 object-cover" />
              <button
                onClick={() => setPhoto('')}
                className="absolute top-2 right-2 w-8 h-8 rounded-full bg-black/60 text-white flex items-center justify-center text-xs font-bold hover:bg-black/80"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full flex items-center justify-center gap-2 py-4 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 hover:border-slate-400 dark:hover:border-slate-500 transition-colors"
            >
              <Camera className="w-5 h-5" />
              <span className="text-sm font-medium">Ajouter une capture d'écran</span>
            </button>
          )}
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting || !content.trim() || !source}
          className={cn(
            "w-full flex items-center justify-center gap-2 py-4 rounded-2xl font-bold text-sm transition-all active:scale-95",
            (content.trim() && source)
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-lg shadow-amber-500/20"
              : "bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed"
          )}
        >
          {submitting ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Envoi en cours...
            </>
          ) : (
            <>
              <Send className="w-5 h-5" />
              Soumettre pour vérification
            </>
          )}
        </button>
      </div>
    </div>
  );
};
