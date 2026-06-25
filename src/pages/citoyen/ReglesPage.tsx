import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Shield, AlertTriangle, Clock, Phone, Eye, Users, MapPin, BookOpen } from 'lucide-react';
import { cn } from '../../lib/utils';

const PREVENTION_SECTIONS = [
  {
    icon: Clock,
    title: 'Les premiers réflexes',
    color: 'text-blue-500 bg-blue-100 dark:bg-blue-900/30',
    items: [
      'Restez calme et vérifiez les lieux habituels (amis, famille, école, travail)',
      'Contactez les proches et vérifiez les hôpitaux',
      'Notez l\'heure et le lieu de la dernière fois que la personne a été vue',
      'Rassemblez une photo récente et une description détaillée',
      'Signalez immédiatement sur SIGDU — n\'attendez pas 24h',
    ],
  },
  {
    icon: AlertTriangle,
    title: 'Signes d\'alerte',
    color: 'text-amber-500 bg-amber-100 dark:bg-amber-900/30',
    items: [
      'Absence inhabituelle sans prévenir',
      'Changement soudain de comportement avant la disparition',
      'Menaces reçues ou conflits récents',
      'Problèmes de santé mentale ou cognitifs (Alzheimer, etc.)',
      'Enfant n\'ayant pas regagné le domicile après l\'école',
    ],
  },
  {
    icon: Shield,
    title: 'Prévention enfants',
    color: 'text-emerald-500 bg-emerald-100 dark:bg-emerald-900/30',
    items: [
      'Apprenez à votre enfant à mémoriser votre numéro de téléphone',
      'Établissez des règles claires sur les trajets autorisés',
      'Enseignez-lui à ne jamais suivre un inconnu',
      'Définissez un point de rendez-vous en cas de séparation',
      'Prenez des photos récentes régulièrement',
    ],
  },
  {
    icon: Users,
    title: 'Prévention personnes âgées',
    color: 'text-purple-500 bg-purple-100 dark:bg-purple-900/30',
    items: [
      'Assurez un suivi régulier pour les personnes atteintes de troubles cognitifs',
      'Placez une pièce d\'identité avec numéro de contact dans leurs vêtements',
      'Informez les voisins et commerçants du quartier',
      'Envisagez un bracelet GPS pour les personnes à risque',
      'Établissez une routine quotidienne de vérification',
    ],
  },
  {
    icon: Eye,
    title: 'Si vous êtes témoin',
    color: 'text-rose-500 bg-rose-100 dark:bg-rose-900/30',
    items: [
      'Notez un maximum de détails (vêtements, direction, véhicule)',
      'Ne confrontez jamais un suspect, appelez les autorités',
      'Signalez immédiatement sur SIGDU avec la localisation GPS',
      'Si possible, prenez une photo à distance en toute sécurité',
      'Restez disponible pour témoigner auprès des agents',
    ],
  },
];

const LEGAL_INFO = [
  {
    title: 'Fausses alertes',
    text: 'Toute fausse alerte intentionnelle est un délit passible de poursuites judiciaires. En signalant, vous certifiez la véracité des informations.',
    severity: 'danger' as const,
  },
  {
    title: 'Obligation de signalement',
    text: 'Tout citoyen ayant connaissance d\'un enlèvement ou d\'une disparition suspecte a l\'obligation morale et civique de le signaler aux autorités.',
    severity: 'info' as const,
  },
  {
    title: 'Données personnelles',
    text: 'Les informations collectées sont utilisées exclusivement dans le cadre des enquêtes. Elles sont protégées conformément à la loi sur la protection des données personnelles.',
    severity: 'info' as const,
  },
];

export const CitizenReglesPage = () => {
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
              <BookOpen className="w-5 h-5 text-emerald-500" />
              Prévention & Règles
            </h2>
            <p className="text-xs text-gray-500">Guides et bonnes pratiques</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto pb-6 space-y-5">
        {/* Prevention cards */}
        {PREVENTION_SECTIONS.map((section, i) => {
          const Icon = section.icon;
          return (
            <div key={i} className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800 overflow-hidden">
              <div className="flex items-center gap-3 p-4 border-b border-gray-100 dark:border-gray-800">
                <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center', section.color)}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="font-bold text-sm text-gray-900 dark:text-white">{section.title}</h3>
              </div>
              <ul className="p-4 space-y-3">
                {section.items.map((item, j) => (
                  <li key={j} className="flex gap-3 text-sm text-gray-700 dark:text-gray-300">
                    <span className="w-5 h-5 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center text-xs font-bold text-gray-500 flex-shrink-0 mt-0.5">
                      {j + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          );
        })}

        {/* Legal section */}
        <div>
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1 mb-3">
            ⚖️ Informations Légales
          </p>
          <div className="space-y-3">
            {LEGAL_INFO.map((info, i) => (
              <div
                key={i}
                className={cn(
                  'rounded-2xl p-4 border',
                  info.severity === 'danger'
                    ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                    : 'bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800'
                )}
              >
                <h4 className={cn(
                  'text-sm font-bold mb-1',
                  info.severity === 'danger' ? 'text-red-700 dark:text-red-400' : 'text-blue-700 dark:text-blue-400'
                )}>
                  {info.severity === 'danger' ? '⚠️ ' : 'ℹ️ '}{info.title}
                </h4>
                <p className={cn(
                  'text-xs leading-relaxed',
                  info.severity === 'danger' ? 'text-red-600 dark:text-red-300' : 'text-blue-600 dark:text-blue-300'
                )}>
                  {info.text}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
