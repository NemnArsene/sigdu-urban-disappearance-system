import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { db } from '../../lib/database';
import { toast } from 'sonner';
import { ChevronLeft, Camera, X, MapPin, Navigation, Send, AlertTriangle } from 'lucide-react';
import { cn } from '../../lib/utils';
import { type IncidentType, type PersonAge } from '../../types';
import { ARRONDISSEMENTS, QUARTIERS_PAR_ARRONDISSEMENT } from '../../lib/constants';

const STEPS = ['Photo', 'Localisation', 'Détails', 'Confirmation'];

const PERSON_AGES: { value: PersonAge; label: string; color: string }[] = [
  { value: 'ENFANT_MINEUR', label: '👶 Enfant mineur', color: 'border-red-500 bg-red-50 text-red-700' },
  { value: 'ADULTE', label: '👤 Adulte', color: 'border-blue-500 bg-blue-50 text-blue-700' },
  { value: 'PERSONNE_AGEE', label: '👴 Personne âgée', color: 'border-indigo-500 bg-indigo-50 text-indigo-700' },
];

const INCIDENT_TYPES: { value: IncidentType; label: string; color: string }[] = [
  { value: 'FUGUE', label: '🏃 Fugue', color: 'border-amber-500 bg-amber-50 text-amber-700' },
  { value: 'DISPARITION', label: '❓ Disparition', color: 'border-gray-500 bg-gray-50 text-gray-700' },
  { value: 'ENLEVEMENT', label: '⚠️ Enlèvement', color: 'border-rose-600 bg-rose-50 text-rose-800' },
  { value: 'TROUBLE_COGNITIF', label: '🧠 Trouble cognitif', color: 'border-purple-500 bg-purple-50 text-purple-700' },
  { value: 'ACCIDENT_SUSPECT', label: '🚨 Accident suspect', color: 'border-orange-500 bg-orange-50 text-orange-700' },
  { value: 'AUTRE', label: '➕ Autre', color: 'border-slate-500 bg-slate-50 text-slate-700' },
];

export const CitizenReportPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const [step, setStep] = useState(0);
  const [photos, setPhotos] = useState<string[]>([]);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [form, setForm] = useState({
    personAge: '' as PersonAge | '',
    type: '' as IncidentType | '',
    otherTypeDetail: '',
    title: '',
    description: '',
    arrondissement: '',
    quartier: '',
    address: '',
  });
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoAdd = (e: React.ChangeEvent<HTMLInputElement>) => {    const files = e.target.files;
    if (!files) return;
    Array.from(files).slice(0, 5 - photos.length).forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        if (ev.target?.result) {
          setPhotos(prev => [...prev, ev.target!.result as string]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const handleGeolocate = () => {
    if (!navigator.geolocation) { toast.error('Géolocalisation non supportée'); return; }
    navigator.geolocation.getCurrentPosition(
      pos => {
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        toast.success('Position GPS détectée !');
      },
      () => {
        toast.error('Impossible de récupérer la position GPS');
      }
    );
  };

  const handleSubmit = async () => {
    if (!user || !location || !form.type) return;
    setIsSubmitting(true);
    await new Promise(r => setTimeout(r, 1000));

    await db.incidents.add({
      id: `inc_${Date.now()}`,
      type: form.type as any,
      personAge: form.personAge as any,
      status: 'NOUVEAU',
      title: form.title,
      description: form.description,
      location: {
        lat: location.lat,
        lng: location.lng,
        address: form.address,
        arrondissement: form.arrondissement,
        quartier: form.quartier,
      },
      photos,
      reportedBy: user.id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });

    setIsSubmitting(false);
    toast.success('🎉 Signalement envoyé avec succès !');
    navigate('/citoyen/mes-signalements');
  };

  const canProceed = () => {
    if (step === 0) return true; // Photos optionnelles
    if (step === 1) return location !== null;
    if (step === 2) return form.title && form.type && form.personAge && form.description && form.arrondissement && form.quartier;
    return true;
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => step === 0 ? navigate(-1) : setStep(s => s - 1)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 dark:text-white text-base">Nouveau Signalement</h2>
            <p className="text-xs text-gray-500">Étape {step + 1} sur {STEPS.length}: {STEPS[step]}</p>
          </div>
        </div>

        {/* Progress */}
        <div className="flex gap-1.5">
          {STEPS.map((s, i) => (
            <div
              key={s}
              className={cn(
                'flex-1 h-1.5 rounded-full transition-all',
                i < step ? 'bg-blue-600' :
                  i === step ? 'bg-blue-300' : 'bg-gray-200 dark:bg-gray-700'
              )}
            />
          ))}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto pb-4">
        {/* Step 0: Photos */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="text-center py-4">
              <div className="text-5xl mb-2">📸</div>
              <h3 className="font-bold text-gray-900 dark:text-white">Photographiez la personne</h3>
              <p className="text-sm text-gray-500 mt-1">Ajoutez jusqu'à 5 photos (optionnel mais recommandé)</p>
            </div>

            <div className="grid grid-cols-3 gap-3">
              {photos.map((photo, i) => (
                <div key={i} className="relative aspect-square rounded-2xl overflow-hidden">
                  <img src={photo} alt={`Photo ${i + 1}`} className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhotos(prev => prev.filter((_, j) => j !== i))}
                    className="absolute top-1 right-1 w-6 h-6 rounded-full bg-red-500 text-white flex items-center justify-center"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="aspect-square rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-blue-400 hover:text-blue-500 transition-all"
                >
                  <Camera className="w-6 h-6" />
                  <span className="text-xs font-medium">Ajouter</span>
                </button>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoAdd}
              style={{ display: 'none' }}
            />

            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 text-xs text-blue-700 dark:text-blue-300">
              💡 Une bonne photo aide les autorités à identifier rapidement la personne concernée.
            </div>
          </div>
        )}

        {/* Step 1: Location */}
        {step === 1 && (
          <div className="space-y-4">
            <div className="text-center py-2">
              <div className="text-4xl mb-2">📍</div>
              <h3 className="font-bold text-gray-900 dark:text-white">Localisez l'incident</h3>
              <p className="text-sm text-gray-500 mt-1">Utilisez votre position GPS réelle</p>
            </div>

            <button
              onClick={handleGeolocate}
              className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border-2 border-dashed border-blue-300 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all font-medium text-sm"
            >
              <Navigation className="w-4 h-4" />
              Utiliser ma position actuelle
            </button>

            {location && (
              <div className="flex items-center gap-2 p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl">
                <MapPin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <div className="text-xs text-emerald-700 dark:text-emerald-300">
                  <p className="font-semibold">Position détectée ✓</p>
                  <p>{location.lat.toFixed(6)}, {location.lng.toFixed(6)}</p>
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">Adresse précise (optionnel)</label>
              <input
                value={form.address}
                onChange={e => setForm(f => ({ ...f, address: e.target.value }))}
                placeholder="Ex: Rue de la Liberté, Face au marché"
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>
          </div>
        )}

        {/* Step 2: Details */}
        {step === 2 && (
          <div className="space-y-4 pt-2">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Qui est concerné ? <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-3 gap-2">
                {PERSON_AGES.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, personAge: opt.value }))}
                    className={cn(
                      'p-2 rounded-xl border-2 text-center text-xs font-medium transition-all flex flex-col items-center gap-1',
                      form.personAge === opt.value
                        ? opt.color
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                    )}
                  >
                    <span className="text-xl">{opt.label.split(' ')[0]}</span>
                    <span>{opt.label.split(' ').slice(1).join(' ')}</span>
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Nature de l'incident <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-2">
                {INCIDENT_TYPES.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setForm(f => ({ ...f, type: opt.value }))}
                    className={cn(
                      'p-2.5 rounded-xl border-2 text-left text-sm font-medium transition-all flex items-center gap-2',
                      form.type === opt.value
                        ? opt.color
                        : 'border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300'
                    )}
                  >
                    <span>{opt.label}</span>
                  </button>
                ))}
              </div>
              {form.type === 'AUTRE' && (
                <div className="mt-3 animate-in fade-in slide-in-from-top-2">
                  <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    Veuillez préciser la nature <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.otherTypeDetail}
                    onChange={e => setForm(f => ({ ...f, otherTypeDetail: e.target.value }))}
                    placeholder="Ex: Disparition en mer..."
                    className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                  />
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Arrondissement <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.arrondissement}
                  onChange={e => setForm(f => ({ ...f, arrondissement: e.target.value, quartier: '' }))}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                >
                  <option value="">Sélectionner</option>
                  {ARRONDISSEMENTS.map(a => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                  Quartier <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.quartier}
                  onChange={e => setForm(f => ({ ...f, quartier: e.target.value }))}
                  disabled={!form.arrondissement}
                  className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 outline-none transition-all disabled:opacity-50"
                >
                  <option value="">Sélectionner</option>
                  {form.arrondissement && QUARTIERS_PAR_ARRONDISSEMENT[form.arrondissement]?.map(q => (
                    <option key={q} value={q}>{q}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Titre <span className="text-red-500">*</span>
              </label>
              <input
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="Ex: Enfant de 8 ans disparu à Bonabéri"
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                Description détaillée <span className="text-red-500">*</span>
              </label>
              <textarea
                value={form.description}
                onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Décrivez la personne, les vêtements, les circonstances, l'heure de la dernière vue..."
                className="w-full bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px]"
              />
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="space-y-4 pt-2">
            <div className="text-center pb-2">
              <div className="text-4xl mb-2">✅</div>
              <h3 className="font-bold text-gray-900 dark:text-white">Vérifiez votre signalement</h3>
              <p className="text-sm text-gray-500 mt-1">Confirmez avant d'envoyer</p>
            </div>

            <div className="bg-gray-50 dark:bg-gray-800 rounded-2xl p-4 space-y-3">
              {photos.length > 0 && (
                <div>
                  <p className="text-xs text-gray-500 mb-2">Photos ({photos.length})</p>
                  <div className="flex gap-2">
                    {photos.map((p, i) => (
                      <img key={i} src={p} alt="" className="w-16 h-16 rounded-xl object-cover" />
                    ))}
                  </div>
                </div>
              )}
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Personne</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {PERSON_AGES.find(t => t.value === form.personAge)?.label.split(' ').slice(1).join(' ') || '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Type</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {INCIDENT_TYPES.find(t => t.value === form.type)?.label.split(' ').slice(1).join(' ') || '—'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Lieu</span>
                <span className="font-medium text-gray-900 dark:text-white">{form.arrondissement || '—'}, {form.quartier || '—'}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Titre</span>
                <span className="font-medium text-gray-900 dark:text-white text-right max-w-[200px] truncate">{form.title}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Localisation</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {location ? `${location.lat.toFixed(4)}, ${location.lng.toFixed(4)}` : 'Non défini'}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Signalé par</span>
                <span className="font-medium text-gray-900 dark:text-white">{user?.name}</span>
              </div>
            </div>

            <div className="bg-amber-50 dark:bg-amber-900/20 rounded-xl p-3 text-xs text-amber-700 dark:text-amber-300">
              <AlertTriangle className="w-3.5 h-3.5 inline mr-1" />
              En soumettant ce signalement, vous certifiez que les informations fournies sont exactes. Toute fausse alerte est punie par la loi.
            </div>
          </div>
        )}
      </div>

      {/* Bottom navigation */}
      <div className="px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950">
        <div className="flex gap-3">
          {step > 0 && (
            <button
              onClick={() => setStep(s => s - 1)}
              className="flex-1 py-2.5 px-4 rounded-xl border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 font-medium text-sm hover:bg-gray-50 dark:hover:bg-gray-800 transition-all"
            >
              Retour
            </button>
          )}
          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(s => s + 1)}
              disabled={!canProceed()}
              className="flex-1 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Continuer
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-blue-600 text-white font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {isSubmitting ? 'Envoi...' : 'Envoyer le Signalement'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
