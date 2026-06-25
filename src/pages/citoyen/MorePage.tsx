import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { 
  User, Bell, Settings, HelpCircle, Phone, LogOut,
  Moon, Sun, ChevronRight, Shield, BookOpen, AlertTriangle 
} from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '../../lib/utils';

interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  subtitle?: string;
  onClick?: () => void;
  badge?: string | number;
  danger?: boolean;
  rightElement?: React.ReactNode;
}

function MenuItem({ icon, label, subtitle, onClick, badge, danger, rightElement }: MenuItemProps) {
  return (
    <div
      role="button"
      tabIndex={0}
      onClick={onClick}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') onClick?.(); }}
      className={cn(
        'w-full flex items-center gap-3 p-3.5 rounded-2xl transition-all text-left cursor-pointer',
        danger ? 'hover:bg-red-50 dark:hover:bg-red-900/20' : 'hover:bg-gray-50 dark:hover:bg-gray-800'
      )}
    >
      <div className={cn(
        'w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0',
        danger ? 'bg-red-100 dark:bg-red-900/30 text-red-500' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400'
      )}>
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className={cn('text-sm font-medium', danger ? 'text-red-500' : 'text-gray-900 dark:text-white')}>
          {label}
        </p>
        {subtitle && <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{subtitle}</p>}
      </div>
      {badge !== undefined && (
        <span className="bg-red-500 text-white text-xs font-bold px-1.5 py-0.5 rounded-full">{badge}</span>
      )}
      {rightElement}
      {!rightElement && !badge && (
        <ChevronRight className={cn('w-4 h-4 flex-shrink-0', danger ? 'text-red-300' : 'text-gray-300')} />
      )}
    </div>
  );
}

export const CitizenMorePage = () => {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useUiStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
    toast.success('À bientôt!');
  };

  if (!user) return null;

  return (
    <div className="px-4 pt-4 pb-6 space-y-5">
      {/* Profile card */}
      <div
        className="bg-gradient-to-r from-blue-600 to-indigo-700 rounded-2xl p-4 text-white cursor-pointer hover:shadow-lg transition-all"
      >
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center text-2xl font-bold">
            {user.name.charAt(0)}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="font-bold text-white text-base">{user.name}</h3>
            <p className="text-white/80 text-sm">{user.email}</p>
            <div className="flex items-center gap-2 mt-2">
              <span className="bg-white/20 text-white text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                <Shield className="w-3 h-3" /> Citoyen Engagé
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Account section */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1 mb-2">Mon Compte</p>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800 p-1 divide-y divide-gray-100 dark:divide-gray-800">
          <MenuItem
            icon={<User className="w-4 h-4" />}
            label="Mon Profil"
            subtitle="Informations personnelles"
            onClick={() => navigate('/citoyen/profil')}
          />
          <MenuItem
            icon={<Bell className="w-4 h-4" />}
            label="Alertes"
            subtitle="Gérer mes alertes SIGDU"
            onClick={() => navigate('/citoyen/alertes')}
          />
          <MenuItem
            icon={<Shield className="w-4 h-4" />}
            label="Sécurité & Confidentialité"
            subtitle="Mot de passe, données"
            onClick={() => navigate('/citoyen/profil')}
          />
        </div>
      </div>

      {/* App section */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1 mb-2">Application</p>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800 p-1 divide-y divide-gray-100 dark:divide-gray-800">
          <MenuItem
            icon={theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            label={theme === 'dark' ? 'Mode Clair' : 'Mode Sombre'}
            subtitle={`Thème actuel: ${theme === 'dark' ? 'Sombre' : 'Clair'}`}
            rightElement={
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className={cn(
                  'w-11 h-6 rounded-full transition-all relative',
                  theme === 'dark' ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                )}
              >
                <span className={cn(
                  'absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-sm transition-all',
                  theme === 'dark' ? 'left-5.5 translate-x-0.5' : 'left-0.5'
                )} />
              </button>
            }
          />
          <MenuItem
            icon={<Settings className="w-4 h-4" />}
            label="Paramètres"
            subtitle="Langue, notifications, zone"
            onClick={() => navigate('/citoyen/profil')}
          />
        </div>
      </div>

      {/* Civic section */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1 mb-2">Prévention</p>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800 p-1 divide-y divide-gray-100 dark:divide-gray-800">
          <MenuItem
            icon={<BookOpen className="w-4 h-4" />}
            label="Sensibilisation"
            subtitle="Guides et bonnes pratiques"
            onClick={() => navigate('/citoyen/regles')}
          />
          <MenuItem
            icon={<AlertTriangle className="w-4 h-4 text-amber-500" />}
            label="Que faire en cas de disparition ?"
            subtitle="Les premiers réflexes"
            onClick={() => navigate('/citoyen/regles')}
          />
        </div>
      </div>

      {/* Help section */}
      <div>
        <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1 mb-2">Support</p>
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800 p-1 divide-y divide-gray-100 dark:divide-gray-800">
          <MenuItem
            icon={<HelpCircle className="w-4 h-4" />}
            label="Aide & FAQ"
            subtitle="Questions fréquentes"
            onClick={() => navigate('/citoyen/faq')}
          />
          <MenuItem
            icon={<Phone className="w-4 h-4" />}
            label="Numéros d'Urgence"
            subtitle="Police, Gendarmerie"
            onClick={() => navigate('/citoyen/numeros-urgence')}
          />
        </div>
      </div>

      {/* App info */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800 p-4 text-center space-y-2">
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
            <Shield className="w-5 h-5 text-blue-600" />
          </div>
        </div>
        <p className="text-xs font-bold text-gray-900 dark:text-white">SIGDU</p>
        <p className="text-xs text-gray-500">Version 1.0.0 • Mairie de Douala</p>
        <p className="text-xs text-gray-400">© 2026 — Plateforme GovTech Smart City</p>
      </div>

      {/* Logout */}
      <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800 p-1">
        <MenuItem
          icon={<LogOut className="w-4 h-4" />}
          label="Se Déconnecter"
          subtitle="Fermer la session"
          onClick={handleLogout}
          danger
        />
      </div>
    </div>
  );
};
