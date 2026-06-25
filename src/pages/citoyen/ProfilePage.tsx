import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { db } from '../../lib/database';
import {
  User, Phone, Mail, ChevronLeft, Save, Shield,
  HelpCircle, BookOpen, PhoneCall, CheckCircle2, ChevronDown, ChevronUp,
  Lock, Bell, Moon, Sun, Camera, UserCircle, Calendar, Globe
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

const EMERGENCY_NUMBERS = [
  { name: 'Police Nationale', number: '117', icon: '🚔', description: 'Urgences policières' },
  { name: 'Gendarmerie Nationale', number: '118', icon: '💂', description: 'Gendarmerie mobile' },
  { name: 'SAMU (Ambulance)', number: '119', icon: '🚑', description: 'Urgences médicales' },
  { name: 'Sapeurs-Pompiers', number: '118', icon: '🚒', description: 'Incendies et sauvetage' },
  { name: 'Protection Civile', number: '116', icon: '🆘', description: 'Catastrophes naturelles' },
  { name: 'Numéro Unifié', number: '112', icon: '📞', description: "Numéro d'urgence européen" },
];

const FAQ_ITEMS = [
  {
    q: 'Comment signaler une disparition ?',
    a: 'Appuyez sur le bouton "Signaler" (le bouton rouge +), choisissez le type de signalement (Disparition, Enlèvement ou Retrouvé), puis suivez les étapes : photo, localisation GPS, détails. Votre signalement sera transmis aux forces de l\'ordre.'
  },
  {
    q: 'Mon signalement est-il anonyme ?',
    a: 'Non, votre identité est connue des services de sécurité pour pouvoir vous recontacter. Cependant, vos informations personnelles ne sont jamais rendues publiques.'
  },
  {
    q: 'Combien de temps prend une enquête ?',
    a: 'Le délai varie selon la complexité de l\'enquête. En général, les premières 48h sont cruciales. Vous pouvez suivre l\'avancement dans "Mes Signalements".'
  },
  {
    q: 'Comment modifier mes informations personnelles ?',
    a: 'Rendez-vous dans "Mon Profil" (section ci-dessous) pour mettre à jour votre nom, email ou numéro de téléphone.'
  },
  {
    q: 'Puis-je signaler plusieurs personnes ?',
    a: 'Oui, vous pouvez effectuer autant de signalements que nécessaire. Chaque signalement est traité individuellement.'
  },
];

const PREVENTION_GUIDES = [
  {
    title: 'Que faire en cas de disparition ?',
    icon: '🔍',
    color: 'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800',
    steps: [
      'Restez calme et rassemblez les informations (dernière tenue, heure, lieu)',
      'Signalez immédiatement via SIGDU ou le 117',
      'Préparez une photo récente de la personne',
      'Interrogez l\'entourage et les voisins',
      'Ne quittez pas votre domicile — laissez les forces de l\'ordre agir'
    ]
  },
  {
    title: 'Prévenir les enlèvements',
    icon: '🛡️',
    color: 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800',
    steps: [
      'Évitez de marcher seul(e) la nuit, surtout dans les zones mal éclairées',
      'Partagez toujours votre position avec un proche',
      'Méfiez-vous des personnes inconnues qui proposent des trajets',
      'Enseignez les bons réflexes aux enfants',
      'En cas de menace, appelez le 117 immédiatement'
    ]
  },
  {
    title: 'Sécurité des enfants',
    icon: '👶',
    color: 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800',
    steps: [
      'Apprenez-leur leur nom complet et votre numéro de téléphone',
      'Ne les laissez jamais partir seul(e) dans un lieu public',
      'Identifiez-les avec un bracelet ou un papier dans leur poche',
      'Expliquez-leur de ne jamais suivre un inconnu',
      'Enseignez-leur à crier et fuir en cas de danger'
    ]
  },
  {
    title: 'Bons réflexes au quotidien',
    icon: '✅',
    color: 'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800',
    steps: [
      'Inscrivez vos proches vulnérables sur SIGDU par précaution',
      'Gardez des photos récentes de tous les membres de la famille',
      'Notez les plaques d\'immatriculation des véhicules suspects',
      'Rejoignez les groupes de vigilance de votre quartier',
      'Signalez toute activité suspecte aux autorités'
    ]
  },
];

export const CitizenProfilePage = () => {
  const { user, updateUser, logout } = useAuthStore();
  const { theme, setTheme } = useUiStore();
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [editing, setEditing] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [openGuide, setOpenGuide] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: user?.name || '',
    firstName: user?.firstName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    nationality: user?.nationality || '',
    age: user?.age?.toString() || '',
    photo: user?.photo || '',
  });

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      toast.error('La photo ne doit pas dépasser 2 Mo');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setForm(f => ({ ...f, photo: base64 }));
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const updates = {
        name: form.name,
        firstName: form.firstName || undefined,
        email: form.email,
        phone: form.phone || undefined,
        nationality: form.nationality || undefined,
        age: form.age ? parseInt(form.age, 10) : undefined,
        photo: form.photo || undefined,
      };
      
      // Update local storage session
      updateUser(updates);
      
      // Update IndexedDB database to persist changes permanently
      if (user?.id) {
        await db.users.update(user.id, updates);
      }

      setEditing(false);
      toast.success('Profil mis à jour avec succès');
    } catch {
      toast.error('Erreur lors de la mise à jour du profil');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    // Reset form to current user data
    setForm({
      name: user?.name || '',
      firstName: user?.firstName || '',
      email: user?.email || '',
      phone: user?.phone || '',
      nationality: user?.nationality || '',
      age: user?.age?.toString() || '',
      photo: user?.photo || '',
    });
    setEditing(false);
  };

  if (!user) return null;

  return (
    <div className="px-4 pt-4 pb-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
          <ChevronLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
        </button>
        <h1 className="text-xl font-bold text-slate-900 dark:text-white">Mon Profil</h1>
      </div>

      {/* Profile Card with Photo */}
      <div className="bg-gradient-to-br from-red-500 to-red-700 rounded-3xl p-6 text-white shadow-xl shadow-red-600/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-400/20 rounded-full blur-3xl translate-x-1/4 -translate-y-1/4 pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-4">
            {/* Photo */}
            <div className="relative group">
              <div className="w-20 h-20 rounded-2xl bg-white/20 flex items-center justify-center text-3xl font-black backdrop-blur-sm overflow-hidden ring-2 ring-white/30">
                {form.photo ? (
                  <img src={form.photo} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  form.firstName?.charAt(0)?.toUpperCase() || form.name.charAt(0)
                )}
              </div>
              {editing && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full bg-white text-red-600 flex items-center justify-center shadow-lg hover:scale-110 transition-transform"
                >
                  <Camera className="w-4 h-4" />
                </button>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handlePhotoUpload}
              />
            </div>
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-lg">{form.firstName ? `${form.firstName} ${form.name}` : form.name}</h2>
              <p className="text-white/80 text-sm truncate">{form.email}</p>
              {form.phone && <p className="text-white/60 text-xs mt-1">+237 {form.phone}</p>}
              <span className="inline-flex items-center gap-1 mt-2 bg-white/20 text-white text-xs px-2.5 py-1 rounded-full font-medium backdrop-blur-sm">
                <Shield className="w-3 h-3" /> Citoyen Engagé
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Personal Info - Editable */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Informations personnelles</h3>
          <div className="flex gap-2">
            {editing ? (
              <>
                <button
                  onClick={handleCancel}
                  className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-emerald-500 text-white hover:bg-emerald-600 transition-all disabled:opacity-50"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </>
            ) : (
              <button
                onClick={() => setEditing(true)}
                className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
              >
                Modifier
              </button>
            )}
          </div>
        </div>
        <div className="p-4 space-y-4">
          {/* Prénom */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Prénom</label>
            {editing ? (
              <input
                value={form.firstName}
                onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                placeholder="Votre prénom"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none placeholder:text-slate-400"
              />
            ) : (
              <div className="flex items-center gap-2">
                <UserCircle className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">{form.firstName || 'Non renseigné'}</p>
              </div>
            )}
          </div>

          {/* Nom */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Nom</label>
            {editing ? (
              <input
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                placeholder="Votre nom"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none placeholder:text-slate-400"
              />
            ) : (
              <div className="flex items-center gap-2">
                <User className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">{form.name}</p>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Email</label>
            {editing ? (
              <input
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                placeholder="Votre email"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none placeholder:text-slate-400"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Mail className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">{form.email}</p>
              </div>
            )}
          </div>

          {/* Téléphone */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Téléphone</label>
            {editing ? (
              <input
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                placeholder="Ex: 699 123 456"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none placeholder:text-slate-400"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">+237 {form.phone || 'Non renseigné'}</p>
              </div>
            )}
          </div>

          {/* Nationalité */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Nationalité</label>
            {editing ? (
              <select
                value={form.nationality}
                onChange={e => setForm(f => ({ ...f, nationality: e.target.value }))}
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none"
              >
                <option value="">Sélectionnez...</option>
                <option value="Camerounaise">Camerounaise</option>
                <option value="Nigériane">Nigériane</option>
                <option value="Gabonaise">Gabonaise</option>
                <option value="Tchadienne">Tchadienne</option>
                <option value="Centrafricaine">Centrafricaine</option>
                <option value="Guinéenne">Guinéenne</option>
                <option value="Autre Africaine">Autre Africaine</option>
                <option value="Européenne">Européenne</option>
                <option value="Asiatique">Asiatique</option>
                <option value="Américaine">Américaine</option>
                <option value="Autre">Autre</option>
              </select>
            ) : (
              <div className="flex items-center gap-2">
                <Globe className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">{form.nationality || 'Non renseignée'}</p>
              </div>
            )}
          </div>

          {/* Âge */}
          <div>
            <label className="text-xs font-medium text-slate-500 dark:text-slate-400 mb-1 block">Âge</label>
            {editing ? (
              <input
                type="number"
                min={1}
                max={150}
                value={form.age}
                onChange={e => setForm(f => ({ ...f, age: e.target.value }))}
                placeholder="Votre âge"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:ring-2 focus:ring-red-500 outline-none placeholder:text-slate-400"
              />
            ) : (
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-slate-400" />
                <p className="text-sm font-medium text-slate-900 dark:text-white">
                  {form.age ? `${form.age} ans` : 'Non renseigné'}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Info badges */}
      <div className="grid grid-cols-3 gap-3">
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-center">
          <Globe className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <p className="text-[10px] font-bold text-slate-900 dark:text-white uppercase">{form.nationality || 'N/A'}</p>
          <p className="text-[9px] text-slate-400">Nationalité</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-center">
          <Calendar className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <p className="text-[10px] font-bold text-slate-900 dark:text-white">{form.age ? `${form.age} ans` : 'N/A'}</p>
          <p className="text-[9px] text-slate-400">Âge</p>
        </div>
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-center">
          <Phone className="w-5 h-5 text-red-500 mx-auto mb-1" />
          <p className="text-[10px] font-bold text-slate-900 dark:text-white truncate">{form.phone || 'N/A'}</p>
          <p className="text-[9px] text-slate-400">Téléphone</p>
        </div>
      </div>

      {/* Emergency Numbers */}
      <div>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <PhoneCall className="w-4 h-4 text-red-500" />
          Numéros d'Urgence — Cameroun
        </h3>
        <div className="grid grid-cols-2 gap-3">
          {EMERGENCY_NUMBERS.map((em) => (
            <a
              key={em.name}
              href={`tel:${em.number}`}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 flex flex-col items-center gap-2 hover:shadow-md transition-all active:scale-95"
            >
              <span className="text-2xl">{em.icon}</span>
              <div className="text-center">
                <p className="font-bold text-sm text-slate-900 dark:text-white">{em.number}</p>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">{em.name}</p>
                <p className="text-[9px] text-slate-400 dark:text-slate-500 mt-0.5">{em.description}</p>
              </div>
            </a>
          ))}
        </div>
      </div>

      {/* Prevention Guides */}
      <div>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-red-500" />
          Prévention & Guides
        </h3>
        <div className="space-y-3">
          {PREVENTION_GUIDES.map((guide, i) => (
            <div key={i} className={cn("rounded-2xl border overflow-hidden", guide.color)}>
              <button
                onClick={() => setOpenGuide(openGuide === i ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <span className="text-xl">{guide.icon}</span>
                <span className="flex-1 font-bold text-sm text-slate-900 dark:text-white">{guide.title}</span>
                {openGuide === i ? <ChevronUp className="w-4 h-4 text-slate-500" /> : <ChevronDown className="w-4 h-4 text-slate-500" />}
              </button>
              {openGuide === i && (
                <div className="px-4 pb-4">
                  <ol className="space-y-2 ml-4">
                    {guide.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500 mt-0.5 shrink-0" />
                        {step}
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* FAQ */}
      <div>
        <h3 className="font-bold text-sm text-slate-900 dark:text-white mb-3 flex items-center gap-2">
          <HelpCircle className="w-4 h-4 text-red-500" />
          Questions Fréquentes (FAQ)
        </h3>
        <div className="space-y-2">
          {FAQ_ITEMS.map((item, i) => (
            <div key={i} className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center gap-3 px-4 py-3 text-left"
              >
                <div className="w-8 h-8 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center shrink-0">
                  <HelpCircle className="w-4 h-4 text-red-500" />
                </div>
                <span className="flex-1 font-semibold text-sm text-slate-900 dark:text-white">{item.q}</span>
                {openFaq === i ? <ChevronUp className="w-4 h-4 text-slate-500 shrink-0" /> : <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />}
              </button>
              {openFaq === i && (
                <div className="px-4 pb-4 text-xs text-slate-600 dark:text-slate-400 leading-relaxed ml-11">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Settings Quick Access */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-3">
        <h3 className="font-bold text-sm text-slate-900 dark:text-white">Préférences</h3>
        <button
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
        >
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </div>
          <span className="text-sm font-medium text-slate-900 dark:text-white flex-1 text-left">Mode {theme === 'dark' ? 'Clair' : 'Sombre'}</span>
        </button>
        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-slate-900 dark:text-white flex-1 text-left">Notifications</span>
        </button>
        <button className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
          <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
            <Lock className="w-4 h-4" />
          </div>
          <span className="text-sm font-medium text-slate-900 dark:text-white flex-1 text-left">Sécurité & Confidentialité</span>
        </button>
      </div>

      {/* Logout */}
      <button
        onClick={() => { logout(); navigate('/'); toast.success('À bientôt !'); }}
        className="w-full py-3.5 rounded-2xl bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 text-red-600 dark:text-red-400 font-bold text-sm hover:bg-red-100 dark:hover:bg-red-900/20 transition-colors"
      >
        Se Déconnecter
      </button>

      {/* App Info */}
      <div className="text-center pb-4">
        <p className="text-xs font-bold text-slate-900 dark:text-white">SIGDU v1.0.0</p>
        <p className="text-[10px] text-slate-400">© 2026 — Mairie de Douala</p>
      </div>
    </div>
  );
};
