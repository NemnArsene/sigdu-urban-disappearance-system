import { useState, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { db } from '../../lib/database';
import { Camera, MapPin, AlertTriangle, ShieldCheck, ChevronLeft, Loader2, Info } from 'lucide-react';
import { toast } from 'sonner';

const OBS_TYPES = [
  { id: 'PERSONNE_CORRESPONDANTE', label: 'Personne ressemblant à un avis', icon: '👤' },
  { id: 'ENFANT_SEUL', label: 'Enfant seul / égaré', icon: '👶' },
  { id: 'PERSONNE_DESORIENTEE', label: 'Personne âgée désorientée', icon: '👴' },
  { id: 'VEHICULE_SUSPECT', label: 'Véhicule suspect', icon: '🚗' },
  { id: 'COMPORTEMENT_INQUIETANT', label: 'Comportement inquiétant', icon: '⚠️' },
];

export const CitizenNewObservationPage = () => {
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const prefilledIncidentId = searchParams.get('incidentId');

  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [step, setStep] = useState(1);
  const [type, setType] = useState<string>(prefilledIncidentId ? 'PERSONNE_CORRESPONDANTE' : '');
  const [photo, setPhoto] = useState<string>('');
  const [description, setDescription] = useState('');
  
  // Fake AI Loading State
  const [aiAnalyzing, setAiAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<{ match: boolean; score?: number; incidentId?: string } | null>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setPhoto(base64);
      
      // Trigger Fake AI Analysis
      setAiAnalyzing(true);
      setTimeout(() => {
        setAiAnalyzing(false);
        // Simulate an 85% match randomly or always if prefilled
        setAiResult({
          match: true,
          score: 85,
          incidentId: prefilledIncidentId || 'INC_10293'
        });
      }, 2500);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async () => {
    if (!user) return;
    
    try {
      const newObs = {
        id: `obs_${Date.now()}`,
        type: type as any,
        incidentId: aiResult?.match ? aiResult.incidentId : prefilledIncidentId || undefined,
        description,
        location: { lat: 4.05, lng: 9.7, arrondissement: 'Douala I' }, // Hardcoded for demo
        photos: photo ? [photo] : [],
        reportedBy: user.id,
        aiSimilarityScore: aiResult?.score,
        status: 'NOUVEAU' as const,
        createdAt: new Date().toISOString(),
      };
      
      await db.observations.add(newObs);
      
      // Add to timeline if linked
      if (newObs.incidentId) {
        await db.timelineEvents.add({
          id: `te_${Date.now()}`,
          incidentId: newObs.incidentId,
          actionType: 'OBSERVATION',
          description: 'Une nouvelle observation citoyenne a été ajoutée.',
          visibility: 'INTERNAL',
          createdBy: user.id,
          createdAt: new Date().toISOString()
        });
      }

      toast.success('Observation transmise !', {
        description: 'Les autorités ont été alertées. Merci pour votre vigilance.'
      });
      navigate('/citoyen/dashboard');
    } catch (err) {
      toast.error('Erreur lors de la soumission.');
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-slate-50">
      <header className="bg-white p-4 flex items-center gap-3 border-b border-slate-200 sticky top-0 z-20">
        <button onClick={() => navigate(-1)} className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-black text-slate-900">Signaler une observation</h1>
      </header>

      <div className="flex-1 p-5 overflow-y-auto pb-24">
        
        {step === 1 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 mb-2">Que souhaitez-vous signaler ?</h2>
              <p className="text-sm text-slate-500">Sélectionnez la catégorie qui correspond le mieux à ce que vous avez vu.</p>
            </div>
            
            <div className="grid gap-3">
              {OBS_TYPES.map((t) => (
                <button
                  key={t.id}
                  onClick={() => { setType(t.id); setStep(2); }}
                  className={`p-4 rounded-2xl border-2 flex items-center gap-4 transition-all text-left ${type === t.id ? 'border-red-600 bg-red-50' : 'border-slate-200 bg-white hover:border-red-200'}`}
                >
                  <span className="text-2xl">{t.icon}</span>
                  <span className="font-bold text-slate-700">{t.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {step === 2 && (
          <div className="space-y-6 animate-in slide-in-from-right-4">
            <div className="bg-red-50 p-4 rounded-xl flex gap-3 border border-red-100">
              <Info className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
              <p className="text-xs font-medium text-red-800 leading-relaxed">
                Prenez une photo si possible (sans vous mettre en danger). Notre IA analysera l'image pour vérifier si elle correspond à un dossier actif.
              </p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Preuve photo (Recommandé)</label>
              
              {!photo ? (
                <button 
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full aspect-[4/3] bg-white border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center gap-2 text-slate-500 hover:border-red-400 hover:bg-red-50 transition-colors"
                >
                  <Camera className="w-8 h-8" />
                  <span className="text-sm font-bold">Appuyez pour prendre une photo</span>
                </button>
              ) : (
                <div className="relative aspect-[4/3] rounded-2xl overflow-hidden border-2 border-slate-200">
                  <img src={photo} alt="Observation" className="w-full h-full object-cover" />
                  
                  {/* AI Scanner Overlay */}
                  {aiAnalyzing && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white">
                      <Loader2 className="w-8 h-8 animate-spin mb-3 text-red-500" />
                      <p className="font-bold text-sm tracking-wide">Analyse IA en cours...</p>
                      <p className="text-xs text-slate-300 mt-1">Recherche de correspondances</p>
                      
                      {/* Scanning line animation */}
                      <div className="absolute top-0 left-0 w-full h-1 bg-red-500 animate-[scan_2s_ease-in-out_infinite]" />
                    </div>
                  )}

                  {/* AI Result Overlay */}
                  {!aiAnalyzing && aiResult && (
                    <div className="absolute bottom-0 left-0 right-0 bg-emerald-600/90 backdrop-blur-md p-3 text-white flex items-center gap-3">
                      <ShieldCheck className="w-6 h-6 shrink-0" />
                      <div>
                        <p className="text-xs font-bold">CORRESPONDANCE DÉTECTÉE ({aiResult.score}%)</p>
                        <p className="text-[10px]">Cette personne ressemble au dossier #{aiResult.incidentId}</p>
                      </div>
                    </div>
                  )}
                  
                  <button 
                    onClick={() => { setPhoto(''); setAiResult(null); }}
                    className="absolute top-2 right-2 w-8 h-8 bg-slate-900/60 rounded-full flex items-center justify-center text-white"
                  >
                    ✕
                  </button>
                </div>
              )}
              <input type="file" accept="image/*" capture="environment" className="hidden" ref={fileInputRef} onChange={handlePhotoUpload} />
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Détails de l'observation</label>
              <textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Ex: J'ai vu cette personne marcher seule près de l'école primaire..."
                className="w-full bg-white border border-slate-200 rounded-xl p-4 text-sm min-h-[120px] outline-none focus:border-red-500 focus:ring-4 focus:ring-red-500/10 transition-all"
              />
            </div>
            
            <div className="space-y-3 pb-8">
              <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Position (Automatique)</label>
              <div className="bg-slate-100 p-3 rounded-xl flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center text-slate-500">
                  <MapPin className="w-4 h-4" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-slate-900 truncate">Douala I, Cameroun</p>
                  <p className="text-[10px] text-slate-500">Précision: 12 mètres</p>
                </div>
              </div>
            </div>

            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white/90 backdrop-blur-md border-t border-slate-200">
              <button
                onClick={handleSubmit}
                disabled={!description || aiAnalyzing}
                className="w-full bg-red-600 disabled:opacity-50 text-white font-black py-4 rounded-xl shadow-lg shadow-red-600/30 flex items-center justify-center gap-2"
              >
                <AlertTriangle className="w-5 h-5" />
                TRANSMETTRE AUX AUTORITÉS
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
