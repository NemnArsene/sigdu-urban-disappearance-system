import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Phone, Shield, Siren, Building2, Heart, Flame, AlertTriangle, ExternalLink } from 'lucide-react';
import { cn } from '../../lib/utils';

interface EmergencyContact {
  name: string;
  number: string;
  description: string;
  icon: any;
  color: string;
  bgColor: string;
  priority: 'critical' | 'high' | 'normal';
}

const EMERGENCY_CONTACTS: EmergencyContact[] = [
  {
    name: 'Police / Urgences',
    number: '117',
    description: 'Pour toute urgence nécessitant l\'intervention de la police',
    icon: Shield,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100 dark:bg-blue-900/30',
    priority: 'critical',
  },
  {
    name: 'Gendarmerie Nationale',
    number: '1513',
    description: 'Zones rurales et péri-urbaines',
    icon: Shield,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100 dark:bg-emerald-900/30',
    priority: 'critical',
  },
  {
    name: 'SAMU / Urgences Médicales',
    number: '119',
    description: 'Urgences médicales et secours sanitaires',
    icon: Heart,
    color: 'text-red-600',
    bgColor: 'bg-red-100 dark:bg-red-900/30',
    priority: 'critical',
  },
  {
    name: 'Sapeurs-Pompiers',
    number: '118',
    description: 'Incendies, accidents, sauvetage',
    icon: Flame,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100 dark:bg-orange-900/30',
    priority: 'critical',
  },
  {
    name: 'Protection Civile Douala',
    number: '233 342 84 65',
    description: 'Coordination des secours à Douala',
    icon: Siren,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100 dark:bg-amber-900/30',
    priority: 'high',
  },
  {
    name: 'Mairie de Douala',
    number: '233 342 50 11',
    description: 'Services municipaux et aide communautaire',
    icon: Building2,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100 dark:bg-indigo-900/30',
    priority: 'normal',
  },
  {
    name: 'Ligne Alerte Enlèvement',
    number: '233 690 00 00 00',
    description: 'Signalement d\'enlèvement d\'enfant — Alerte immédiate',
    icon: AlertTriangle,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100 dark:bg-rose-900/30',
    priority: 'high',
  },
];

const PRIORITY_STYLES = {
  critical: 'border-red-200 dark:border-red-800/50',
  high: 'border-amber-200 dark:border-amber-800/50',
  normal: 'border-gray-200 dark:border-gray-800',
};

export const CitizenNumerosUrgencePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-2">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
              <Phone className="w-5 h-5 text-rose-500" />
              Numéros d'Urgence
            </h2>
            <p className="text-xs text-gray-500">Appelez directement en un clic</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto pb-6 space-y-4">
        {/* Critical banner */}
        <div className="bg-gradient-to-r from-red-600 to-rose-600 rounded-2xl p-4 text-white">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
              <Siren className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-bold text-sm">En cas d'urgence immédiate</h3>
              <p className="text-xs text-white/80 mt-0.5">
                Appelez le <strong>117</strong> (Police) ou le <strong>119</strong> (SAMU) avant de signaler sur SIGDU
              </p>
            </div>
          </div>
        </div>

        {/* Contact cards */}
        {EMERGENCY_CONTACTS.map((contact, i) => {
          const Icon = contact.icon;
          return (
            <div
              key={i}
              className={cn(
                'bg-white dark:bg-gray-900 rounded-2xl border p-4 transition-all hover:shadow-md',
                PRIORITY_STYLES[contact.priority]
              )}
            >
              <div className="flex items-center gap-4">
                <div className={cn('w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0', contact.bgColor)}>
                  <Icon className={cn('w-6 h-6', contact.color)} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-bold text-gray-900 dark:text-white">{contact.name}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{contact.description}</p>
                  <p className={cn('text-lg font-black mt-1', contact.color)}>{contact.number}</p>
                </div>
                <a
                  href={`tel:${contact.number.replace(/\s/g, '')}`}
                  className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-all active:scale-95',
                    contact.priority === 'critical'
                      ? 'bg-red-500 hover:bg-red-600 text-white'
                      : 'bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400'
                  )}
                >
                  <Phone className="w-5 h-5" />
                </a>
              </div>
            </div>
          );
        })}

        {/* Reminder */}
        <div className="bg-amber-50 dark:bg-amber-900/20 rounded-2xl border border-amber-200 dark:border-amber-800/50 p-4">
          <h4 className="text-sm font-bold text-amber-700 dark:text-amber-400 mb-1">
            💡 Rappel important
          </h4>
          <p className="text-xs text-amber-600 dark:text-amber-300 leading-relaxed">
            En cas de disparition, signalez immédiatement. Il n'existe <strong>aucun délai légal de 24h</strong> avant de pouvoir signaler une disparition. Plus le signalement est rapide, plus les chances de retrouver la personne sont élevées.
          </p>
        </div>
      </div>
    </div>
  );
};
