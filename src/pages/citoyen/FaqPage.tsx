import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronDown, HelpCircle, Search } from 'lucide-react';
import { cn } from '../../lib/utils';

const FAQ_ITEMS = [
  {
    category: '📋 Signalement',
    questions: [
      {
        q: 'Comment signaler une disparition ?',
        a: 'Depuis l\'onglet "Signaler", suivez les 4 étapes : ajoutez une photo (optionnel), localisez l\'incident via GPS, remplissez les détails (type, description, arrondissement) et confirmez. Votre signalement sera immédiatement transmis au centre de supervision.',
      },
      {
        q: 'Quels types de disparitions puis-je signaler ?',
        a: 'Vous pouvez signaler : Enfant mineur, Adulte, Personne âgée, Fugue, Enlèvement, Trouble cognitif (Alzheimer, etc.), Accident suspect, ou Autre. Chaque catégorie déclenche un workflow de traitement adapté.',
      },
      {
        q: 'Puis-je signaler de manière anonyme ?',
        a: 'Non. L\'identification est obligatoire pour éviter les fausses alertes et permettre un suivi. Vos données personnelles sont toutefois protégées et ne sont accessibles qu\'aux agents habilités.',
      },
      {
        q: 'Que se passe-t-il après mon signalement ?',
        a: 'Votre signalement est reçu par le Centre de Supervision SIGDU. Un superviseur vérifie les informations, élimine les doublons, puis affecte le dossier au service compétent (Commissariat, Brigade, etc.). Vous recevez des notifications à chaque changement de statut.',
      },
    ],
  },
  {
    category: '🔍 Suivi',
    questions: [
      {
        q: 'Comment suivre l\'avancement de mon signalement ?',
        a: 'Rendez-vous dans "Mes Signalements". Chaque dossier affiche une barre de progression et un statut détaillé : Nouveau → En vérification → Enquête en cours → Localisé → Retrouvé.',
      },
      {
        q: 'Puis-je ajouter des informations après le signalement ?',
        a: 'Actuellement, vous ne pouvez pas modifier un signalement envoyé. Si vous avez de nouvelles informations cruciales, contactez directement le numéro d\'urgence indiqué dans la section "Numéros d\'urgence".',
      },
      {
        q: 'Que signifie le statut "Fausse alerte" ?',
        a: 'Ce statut indique que le superviseur a déterminé, après vérification, que le signalement ne correspond pas à une disparition réelle (erreur, doublon, personne déjà retrouvée). Toute fausse alerte intentionnelle est punissable par la loi.',
      },
    ],
  },
  {
    category: '🔒 Sécurité & Données',
    questions: [
      {
        q: 'Mes données sont-elles protégées ?',
        a: 'Oui. SIGDU est conforme aux normes de protection des données personnelles. Seuls les agents habilités ont accès à vos informations. Les photos et localisations sont stockées de manière sécurisée.',
      },
      {
        q: 'Qui a accès à mes signalements ?',
        a: 'Vos signalements sont accessibles uniquement par : le Centre de Supervision, les agents de traitement affectés au dossier, et les administrateurs système. Aucune donnée n\'est partagée publiquement.',
      },
    ],
  },
  {
    category: '📱 Application',
    questions: [
      {
        q: 'L\'application fonctionne-t-elle hors ligne ?',
        a: 'Partiellement. Vous pouvez consulter vos signalements enregistrés hors ligne, mais l\'envoi d\'un nouveau signalement nécessite une connexion internet.',
      },
      {
        q: 'Pourquoi la carte ne s\'affiche-t-elle pas ?',
        a: 'Vérifiez votre connexion internet. La carte nécessite le téléchargement des tuiles cartographiques. Si le problème persiste, rechargez l\'application.',
      },
    ],
  },
];

export const CitizenFaqPage = () => {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredFaq = FAQ_ITEMS.map(cat => ({
    ...cat,
    questions: cat.questions.filter(
      q => q.q.toLowerCase().includes(search.toLowerCase()) || q.a.toLowerCase().includes(search.toLowerCase())
    ),
  })).filter(cat => cat.questions.length > 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-3 mb-4">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
          >
            <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div className="flex-1">
            <h2 className="font-bold text-gray-900 dark:text-white text-base flex items-center gap-2">
              <HelpCircle className="w-5 h-5 text-blue-500" />
              Aide & FAQ
            </h2>
            <p className="text-xs text-gray-500">Questions fréquemment posées</p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher une question..."
            className="w-full bg-gray-100 dark:bg-gray-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-gray-900 dark:text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 px-4 overflow-y-auto pb-6 space-y-5">
        {filteredFaq.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-8 text-center">
            <div className="w-16 h-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Aucun résultat</h3>
            <p className="text-sm text-gray-500">Essayez avec d'autres mots-clés.</p>
          </div>
        ) : (
          filteredFaq.map((cat, ci) => (
            <div key={ci}>
              <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide px-1 mb-2">
                {cat.category}
              </p>
              <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200/60 dark:border-gray-800 overflow-hidden divide-y divide-gray-100 dark:divide-gray-800">
                {cat.questions.map((item, qi) => {
                  const key = `${ci}-${qi}`;
                  const isOpen = openIndex === key;
                  return (
                    <div key={key}>
                      <button
                        onClick={() => setOpenIndex(isOpen ? null : key)}
                        className="w-full flex items-center gap-3 p-4 text-left hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-all"
                      >
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">{item.q}</p>
                        </div>
                        <ChevronDown
                          className={cn(
                            'w-4 h-4 text-gray-400 transition-transform duration-300 flex-shrink-0',
                            isOpen && 'rotate-180'
                          )}
                        />
                      </button>
                      <div
                        className={cn(
                          'overflow-hidden transition-all duration-300 ease-in-out',
                          isOpen ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        )}
                      >
                        <div className="px-4 pb-4 text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                          {item.a}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
