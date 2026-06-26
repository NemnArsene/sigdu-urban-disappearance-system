import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { db } from '../../lib/database';
import { toast } from 'sonner';
import {
  Home, AlertCircle, MapPin, User, Menu, X, ShieldAlert, ChevronRight,
  Sun, Moon, LogOut, Plus, Settings, HelpCircle, Bell, BookOpen, Phone, Newspaper,
  Search, ShieldCheck, MessageSquareWarning, AlertTriangle
} from 'lucide-react';
import { cn } from '../../lib/utils';
import { useState, useEffect } from 'react';

const BOTTOM_NAV = [
  { path: '/citoyen/dashboard', label: 'Accueil', icon: Home },
  { path: '/citoyen/map', label: 'Carte', icon: MapPin },
  { path: '/citoyen/signaler', label: 'Signaler', icon: Plus, isFAB: true },
  { path: '/citoyen/mes-signalements', label: 'Signalements', icon: AlertCircle },
  { path: '/citoyen/plus', label: 'Autre', icon: User },
];

const PAGE_TITLES: Record<string, string> = {
  '/citoyen/dashboard': 'Accueil',
  '/citoyen/map': 'Carte',
  '/citoyen/signaler': 'Signaler',
  '/citoyen/mes-signalements': 'Mes Signalements',
  '/citoyen/alertes': 'Alertes',
  '/citoyen/profil': 'Mon Profil',
  '/citoyen/plus': 'Autre',
  '/citoyen/actualite': 'Actualités',
  '/citoyen/soumettre-rumeur': 'Vérifier une Rumeur',
  '/citoyen/veilleur': 'Citoyen Veilleur',
};

const OTHER_MENU_ITEMS = [
  { icon: User, label: 'Mon Profil', subtitle: 'Informations personnelles', path: '/citoyen/plus' },
  { icon: Search, label: 'Recherche Intelligente', subtitle: 'Trouver un dossier public', path: '/citoyen/recherche' },
  { icon: ShieldCheck, label: 'Réseau de Veille', subtitle: 'Gérer vos zones d\'alerte', path: '/citoyen/veilleur' },
  { icon: MessageSquareWarning, label: 'Vérifier une Rumeur', subtitle: 'Signaler une fausse information', path: '/citoyen/soumettre-rumeur' },
  { icon: Bell, label: 'Mes Signalements', subtitle: 'Gérer mes alertes SIGDU', path: '/citoyen/mes-signalements' },
  { icon: Phone, label: "Numéros d'Urgence", subtitle: 'Police, Gendarmerie', path: '/citoyen/plus' },
  { icon: BookOpen, label: 'Sensibilisation', subtitle: 'Guides et bonnes pratiques', path: '/citoyen/plus' },
  { icon: Settings, label: 'Paramètres', subtitle: 'Thème et préférences', path: '/citoyen/plus' },
];

export const CitizenLayout = () => {
  const { user } = useAuthStore();
  const { theme, setTheme } = useUiStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [isSubmittingSos, setIsSubmittingSos] = useState(false);
  const [userLocation, setUserLocation] = useState({ lat: 4.0511, lng: 9.7679, address: 'Recherche en cours...' });

  const pageTitle = PAGE_TITLES[location.pathname] || 'SIGDU';

  useEffect(() => {
    if (isSosModalOpen) {
      if ('geolocation' in navigator) {
        navigator.geolocation.getCurrentPosition(
          (pos) => {
            setUserLocation({
              lat: pos.coords.latitude,
              lng: pos.coords.longitude,
              address: 'Position GPS actuelle'
            });
          },
          (err) => {
            setUserLocation({ lat: 4.0511, lng: 9.7679, address: 'Douala (Position par défaut)' });
          },
          { enableHighAccuracy: true, timeout: 5000 }
        );
      } else {
        setUserLocation({ lat: 4.0511, lng: 9.7679, address: 'Douala (Position par défaut)' });
      }
    }
  }, [isSosModalOpen]);

  const handleConfirmSOS = async () => {
    setIsSubmittingSos(true);
    try {
      await db.sosAlerts.add({
        id: crypto.randomUUID(),
        userId: user?.id || 'unknown',
        location: userLocation,
        status: 'ACTIVE',
        createdAt: new Date().toISOString()
      });
      setIsSosModalOpen(false);
      toast.success("Alerte SOS transmise aux autorités !", {
        description: "Restez en sécurité, les secours ont reçu votre position."
      });
    } catch (error) {
      console.error(error);
      toast.error("Erreur lors de l'envoi de l'alerte SOS.");
    } finally {
      setIsSubmittingSos(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col max-w-md mx-auto relative overflow-hidden font-sans">
      {/* Top Header */}
      <header className="absolute top-0 w-full z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/60 dark:border-slate-800/60 px-5 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center shadow-lg shadow-red-600/30">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-[10px] uppercase tracking-widest text-red-600 dark:text-red-400 font-bold">Sécurité Urbaine</span>
              <h1 className="text-lg font-black text-slate-900 dark:text-white leading-none tracking-tight">{pageTitle}</h1>
            </div>
          </div>

          <button
            onClick={() => navigate('/citoyen/profil')}
            className="w-10 h-10 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 transition-all hover:bg-slate-200 dark:hover:bg-slate-700 overflow-hidden ring-2 ring-white dark:ring-slate-900 shadow-sm"
          >
            {user?.photo ? (
              <img src={user.photo} alt="Profil" className="w-full h-full object-cover" />
            ) : (
              <span className="font-bold text-sm">{user?.name?.charAt(0)?.toUpperCase() || 'U'}</span>
            )}
          </button>
        </div>
      </header>

      {/* Overlay backdrop Menu */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300",
          menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setMenuOpen(false)}
      />

      {/* Floating slide-in menu */}
      <div className={cn(
        "fixed top-4 bottom-4 z-50 w-[82%] max-w-sm bg-white dark:bg-slate-900 rounded-2xl shadow-2xl transition-transform duration-300 ease-out flex flex-col overflow-hidden border border-slate-200 dark:border-slate-700",
        menuOpen ? "right-4 translate-x-0" : "right-4 translate-x-[calc(100%+2rem)]"
      )}>
        {/* Menu header */}
        <div className="px-5 pt-5 pb-4 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center justify-between mb-4">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Menu</p>
            <button
              onClick={() => setMenuOpen(false)}
              className="w-8 h-8 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-500 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-gradient-to-br from-red-500 to-red-700 flex items-center justify-center text-white font-bold text-sm shadow-md">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-slate-900 dark:text-white text-sm truncate">{user?.name || 'Citoyen'}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400 truncate">{user?.email || 'citoyen@sigdu.cm'}</p>
            </div>
          </div>
        </div>

        {/* Quick actions */}
        <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800">
          <button
            onClick={() => { navigate('/citoyen/signaler'); setMenuOpen(false); }}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-red-500 to-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/20 active:scale-95 transition-transform"
          >
            <Plus className="w-5 h-5" />
            Nouveau Signalement
          </button>
        </div>

        {/* Nav items */}
        <div className="flex-1 overflow-y-auto px-3 py-3 space-y-0.5">
          {OTHER_MENU_ITEMS.map((item) => {
            const isActive = item.path ? location.pathname === item.path : false;
            return (
              <button
                key={item.label}
                onClick={() => {
                  if (item.path) navigate(item.path);
                  setMenuOpen(false);
                }}
                className={cn(
                  "w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left",
                  isActive
                    ? "bg-red-50 dark:bg-red-500/10 text-red-600 dark:text-red-400"
                    : "text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
                )}
              >
                <div className={cn(
                  "w-9 h-9 rounded-lg flex items-center justify-center shrink-0",
                  isActive ? "bg-red-100 dark:bg-red-500/20" : "bg-slate-100 dark:bg-slate-800"
                )}>
                  <item.icon className={cn("w-4 h-4", isActive ? "text-red-600 dark:text-red-400" : "text-slate-500 dark:text-slate-400")} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-sm block">{item.label}</span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500 block truncate">{item.subtitle}</span>
                </div>
                <ChevronRight className={cn("w-4 h-4 shrink-0", isActive ? "text-red-400" : "text-slate-300 dark:text-slate-600")} />
              </button>
            );
          })}
        </div>

        {/* Footer */}
        <div className="px-3 pb-4 pt-2 space-y-1 border-t border-slate-100 dark:border-slate-800">
          <button
            onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-sm font-medium"
          >
            <div className="w-9 h-9 rounded-lg bg-slate-100 dark:bg-slate-800 flex items-center justify-center">
              {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </div>
            Mode {theme === 'dark' ? 'Clair' : 'Sombre'}
          </button>
          <button
            onClick={() => { navigate('/login'); setMenuOpen(false); }}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors text-sm font-medium"
          >
            <div className="w-9 h-9 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
              <LogOut className="w-4 h-4" />
            </div>
            Se Déconnecter
          </button>
        </div>
      </div>

      {/* Main content */}
      <main className="flex-1 overflow-auto pt-20 pb-24 px-4 relative z-10">
        <Outlet />
      </main>

      {/* SOS Modal */}
      {isSosModalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => !isSubmittingSos && setIsSosModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-900 w-full max-w-sm rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Red pulsing header */}
            <div className="bg-red-600 p-6 flex flex-col items-center justify-center text-white relative">
              <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/black-scales.png')] opacity-20 mix-blend-overlay"></div>
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3 animate-pulse ring-4 ring-white/10">
                <AlertTriangle className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-xl font-black text-center tracking-tight">DÉCLENCHER SOS</h2>
              <p className="text-red-100 text-sm mt-1 text-center font-medium">Pour toute situation d'urgence vitale.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-4 border border-slate-100 dark:border-slate-800">
                <h3 className="text-[11px] font-bold text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-3">Données transmises</h3>
                
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <User className="w-4 h-4 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">{user?.phone || 'Non renseigné'}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <MapPin className="w-4 h-4 text-slate-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-slate-900 dark:text-white line-clamp-2 leading-tight">{userLocation.address}</p>
                    </div>
                  </div>
                </div>
              </div>

              <p className="text-xs text-slate-500 dark:text-slate-400 text-center font-medium">
                Toute fausse alerte peut faire l'objet de poursuites pénales.
              </p>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setIsSosModalOpen(false)}
                  disabled={isSubmittingSos}
                  className="py-3 rounded-xl font-bold text-slate-600 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleConfirmSOS}
                  disabled={isSubmittingSos}
                  className="py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-700 transition-colors shadow-lg shadow-red-600/30 active:scale-95 flex items-center justify-center"
                >
                  {isSubmittingSos ? (
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  ) : (
                    "Confirmer"
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Floating SOS Button */}
      <button
        onClick={() => setIsSosModalOpen(true)}
        className="fixed bottom-24 right-4 z-40 w-14 h-14 bg-red-600 rounded-full shadow-[0_0_20px_rgba(220,38,38,0.6)] flex items-center justify-center text-white font-black text-sm active:scale-90 transition-transform animate-pulse"
      >
        <div className="absolute inset-0 rounded-full bg-red-500 animate-ping opacity-20" />
        SOS
      </button>

      {/* Floating Bottom Navigation */}
      <nav className="fixed bottom-3 left-4 right-4 z-30 bg-white/95 dark:bg-[#0A0F1C]/95 backdrop-blur-xl rounded-2xl border border-slate-200/60 dark:border-slate-700/60 shadow-2xl shadow-black/10 dark:shadow-black/30 pb-safe">
        <div className="flex items-center justify-around h-16 max-w-md mx-auto px-1">
          {BOTTOM_NAV.map((item) => {
            const isActive = location.pathname === item.path;
            const isFAB = (item as any).isFAB;

            if (isFAB) {
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className="relative -mt-5"
                >
                  <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center shadow-lg transition-all active:scale-90",
                    "bg-gradient-to-br from-red-500 to-red-700 shadow-red-600/30 hover:shadow-red-600/50"
                  )}>
                    <item.icon className="w-6 h-6 text-white" />
                  </div>
                </button>
              );
            }

            return (
              <button
                key={item.path}
                onClick={() => navigate(item.path)}
                className={cn(
                  "flex flex-col items-center justify-center w-full h-full gap-0.5 transition-all",
                  isActive ? "text-red-600 dark:text-red-500" : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300"
                )}
              >
                <div className={cn(
                  "p-1.5 rounded-xl transition-all",
                  isActive && "bg-red-50 dark:bg-red-500/10"
                )}>
                  <item.icon className={cn("w-5 h-5", isActive && "stroke-[2.5px]")} />
                </div>
                <span className="text-[10px] font-bold tracking-wide">{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
    </div>
  );
};
