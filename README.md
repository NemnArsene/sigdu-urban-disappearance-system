# SIGDU — Système Intelligent de Gestion des Disparitions Urbaines

Plateforme de sécurité citoyenne participative pour la ville de Douala, Cameroun.

> PWA (Progressive Web App) — fonctionne hors ligne, installable sur mobile.

---

## Démarrage

### Prérequis

- [Node.js](https://nodejs.org/) ≥ 18
- [Docker](https://www.docker.com/) (optionnel, pour la conteneurisation)

### Développement local

```bash
# Cloner le projet
git clone <url-du-depot>
cd sigdu-urban-disappearance-system

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

L'application est accessible sur `http://localhost:5173`.

### Avec Docker

```bash
# Build de l'image
docker build -t sigdu .

# Lancer le conteneur
docker run -d -p 8080:80 --name sigdu-app sigdu
```

L'application est accessible sur `http://localhost:8080`.

> L'image Docker utilise un build multi-étapes : compilation Vite puis service via Nginx (compression gzip, cache statique, fallback SPA).

### Commandes utiles

```bash
npm run dev          # Serveur de développement (Vite)
npm run build        # Build production (tsc + vite build)
npm run preview      # Prévisualisation du build
npm run typecheck    # Vérification TypeScript sans émission
```

---

## Identifiants de démonstration

Les comptes sont créés automatiquement au premier chargement (via le seeder IndexedDB). Utilisez les boutons **"Accès rapide (Jury)"** sur la page de connexion.

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Citoyen** | `citoyen@sigdu.cm` | `password123` |
| **Agent** | `agent@sigdu.cm` | `password123` |
| **Superviseur** | `superviseur@sigdu.cm` | `password123` |
| **Admin** | `admin@sigdu.cm` | `password123` |

---

## Stack technique

| Couche | Technologie |
|--------|-------------|
| Frontend | React 19, TypeScript 5.6, Tailwind CSS 3 |
| Build | Vite 6, vite-plugin-pwa (Workbox) |
| Cartographie | Leaflet + OpenStreetMap (CartoDB tiles) |
| State management | Zustand 5 (persisté) |
| Base de données locale | DexieJS 4 (IndexedDB) — offline-first |
| Formulaires | React Hook Form + Zod |
| Graphiques | Recharts |
| Animations | Framer Motion |
| Icônes | Lucide React |
| Notifications toast | Sonner |
| Conteneurisation | Docker (Node 22 + Nginx 1.27) |

---

## Base de données

12 tables IndexedDB gérées par Dexie :

| Table | Description |
|-------|-------------|
| `users` | Utilisateurs (4 rôles : CITOYEN, AGENT, SUPERVISEUR, ADMIN) |
| `incidents` | Dossiers de disparition/fugue/enlèvement |
| `observations` | Témoignages citoyens (personne vue, véhicule suspect...) |
| `timelineEvents` | Chronologie de chaque dossier (création, validation, notes...) |
| `alerts` | Alertes système (critique, avertissement) |
| `organizations` | Organisations (Police, Gendarmerie, Mairie) |
| `services` | Services/Commissariats rattachés à une organisation |
| `watchers` | Réseau de veilleurs citoyens |
| `newsFeed` | Fil d'actualité sécurité |
| `rumors` | Rumeurs soumises et vérifiées |
| `sosAlerts` | Alertes SOS déclenchées par les citoyens |
| `notifications` | Notifications push internes par utilisateur |

---

## Fonctionnalités par profil

### Citoyen

| Fonctionnalité | Description |
|----------------|-------------|
| **Tableau de bord** | Vue d'ensemble : nombre de signalements, alertes actives, actualités récentes |
| **Signaler un incident** | Formulaire multi-étapes : type (disparition, fugue, enlèvement...), photo, géolocalisation, description, confirmation |
| **Carte interactive** | Visualisation des incidents et observations sur OpenStreetMap avec filtres |
| **Mes signalements** | Liste des signalements de l'utilisateur avec leur chronologie (ligne de vie) |
| **Alertes** | Consultation des alertes système (critiques et avertissements) |
| **Soumettre une observation** | Témoignage rapide : type (personne correspondante, enfant seul, véhicule suspect...), photo, localisation. Mock IA de similarité |
| **Soumettre une rumeur** | Signaler un message viral (WhatsApp, Facebook) pour vérification officielle |
| **Actualité** | Fil d'actualité sécurité : alertes, succès, informations officielles |
| **Veilleur citoyen** | Paramétrer ses zones de vigilance (arrondissements, quartiers) pour recevoir des alertes ciblées |
| **Recherche intelligente** | Barre de recherche par nom, quartier, type d'incident |
| **Profil** | Gestion des informations personnelles |
| **Numéros d'urgence** | Annuaire des numéros utiles (Police, SAMU, Pompiers...) |
| **FAQ / Règles** | Aide et règles d'utilisation de la plateforme |
| **Bouton SOS** | Alerte d'urgence géolocalisée avec délai d'annulation de 3 secondes |

### Agent Terrain

| Fonctionnalité | Description |
|----------------|-------------|
| **Tableau de bord** | 4 KPI dynamiques (nouvelles affectations, enquêtes en cours, dossiers résolus, total assigné) + graphique circulaire des statuts + graphique en barres des types d'incidents |
| **Affectations** | Liste des dossiers affectés à son commissariat en attente de prise en charge. Bouton "Accepter le dossier" qui affecte l'agent et passe le statut à EN_VERIFICATION |
| **Enquêtes** | Dossiers assignés à l'agent avec statuts actifs. Actions : ajouter une note d'enquête (stockée dans la chronologie), changer le statut selon le workflow, marquer comme "Localisé" |
| **Incidents** | Liste complète des incidents avec filtres (Tous, Nouveaux, En vérification). Bouton "Prendre en charge" pour les nouveaux dossiers |
| **Carte** | Visualisation des incidents sur la carte |
| **Notifications** | Cloche de notifications en temps réel avec badge animé. Marquer lu, tout marquer lu, vider. Redirection vers le dossier concerné |

### Superviseur

| Fonctionnalité | Description |
|----------------|-------------|
| **Tableau de bord** | Statistiques globales, graphiques de répartition des incidents |
| **Validation** | File des signalements en attente de validation. Valider ou rejeter un dossier |
| **Incidents** | Liste complète de tous les incidents du système avec détail |
| **Détail d'un incident** | Vue complète : informations, chronologie (ligne de vie publique + interne), changement de statut, affectation à un agent |
| **Carte** | Carte avec tous les incidents et observations |
| **Statistiques** | Tableaux et graphiques d'analyse (par type, statut, arrondissement, période) |
| **Rapports** | Génération et consultation des rapports d'activité |
| **Rumeurs** | File de vérification des rumeurs : statuer (Vrai/Faux) avec réponse officielle |
| **Observations** | Modération des témoignages citoyens. Valider, rejeter, ou lier une observation à un dossier existant |
| **Alertes SOS** | Réception des SOS géolocalisés avec localisation sur carte |
| **Notifications** | Système de notifications intégré dans la topbar |

### Administrateur

| Fonctionnalité | Description |
|----------------|-------------|
| **Tableau de bord** | Vue d'ensemble complète du système |
| **Gestion des utilisateurs** | CRUD complet : créer, modifier, désactiver les comptes. Filtrage par rôle, service |
| **Gestion des agents** | Vue dédiée aux agents : affectation aux services, suivi de l'activité |
| **Incidents** | Accès complet à tous les incidents |
| **Validation** | Validation des signalements (fallback superviseur) |
| **Carte** | Carte globale avec tous les marqueurs |
| **Observations** | Gestion complète des observations citoyennes |
| **Interventions** | Suivi des interventions terrain |
| **Affectations** | Gestion des affectations dossiers → services → agents |
| **Enquêtes** | Vue d'ensemble de toutes les enquêtes en cours |
| **Rapports** | Génération de rapports et statistiques avancées |
| **Audit** | Journal d'audit des actions système |
| **Configuration** | Paramétrage de l'application |
| **Rumeurs** | Accès à la vérification des rumeurs |
| **Notifications** | Système de notifications intégré |

---

## Système de notifications

Composant `NotificationBell` partagé par les 4 profils :

- Badge avec animation rouge pulsée pour les notifications non lues
- Popover avec liste scrollable des notifications
- Actions : marquer une notification comme lue, tout marquer lu, vider la liste
- Clic sur une notification → marquer lu + navigation vers la page concernée
- Horodatage relatif en français (via date-fns)
- Données de test : notifications de bienvenue + notifications d'affectation pour les agents

---

## Workflows des incidents

Chaque type d'incident suit un cycle de vie spécifique :

```
NOUVEAU → EN_VERIFICATION → [DISPARITION_CONFIRMEE | FAUSSE_ALERTE]
                          → RECHERCHE → ENQUETE_EN_COURS → LOCALISE → RETROUVE → CLOTURE
```

Types supportés : Disparition, Fugue, Enlèvement, Trouble cognitif, Accident suspect, Autre.

---

## Structure du projet

```
src/
├── components/
│   ├── auth/           # ProtectedRoute (garde RBAC)
│   ├── layout/         # CitizenLayout, AgentLayout, SupervisorLayout, AdminLayout
│   ├── map/            # SIGMap (Leaflet)
│   └── ui/             # Button, Card, Badge, Input, Label, NotificationBell, Pagination
├── lib/
│   ├── constants.ts    # Arrondissements et quartiers de Douala
│   ├── database.ts     # DexieJS — schema IndexedDB (12 tables)
│   ├── rbac.ts         # Configuration des rôles et routes
│   ├── seeder.ts       # Données démo (123 users, 100+ incidents, notifications)
│   ├── utils.ts        # cn() utility (clsx + tailwind-merge)
│   └── workflows.ts    # Machine à états des incidents (transitions valides par type)
├── pages/
│   ├── auth/           # LoginPage
│   ├── public/         # PublicFlyerPage (affiche de recherche, accessible sans compte)
│   ├── citoyen/        # 15 pages (Dashboard, Map, Report, Observations, Rumeurs, Veilleur...)
│   ├── agent/          # 5 pages (Dashboard, Incidents, Affectations, Enquêtes, Carte)
│   ├── superviseur/    # 10 pages (Dashboard, Validation, Incidents, Stats, Rumeurs, SOS...)
│   └── admin/          # 13 pages (Dashboard, Users, Agents, Incidents, Audit, Config...)
├── router/             # React Router (createBrowserRouter)
├── schemas/            # Zod validation schemas
├── stores/             # Zustand (authStore, uiStore)
├── styles/             # globals.css
└── types/              # TypeScript domain types (12 interfaces)
```

---

## Données démo

Le seeder crée automatiquement au premier chargement :

- **123 utilisateurs** : 100 citoyens, 20 agents, 1 superviseur, 1 admin
- **100+ incidents** : tous types et statuts, répartis sur les 5 arrondissements de Douala
- **4 organisations** : Police Nationale, Gendarmerie Nationale, Mairie de Douala
- **4 services** : Commissariats et Brigades rattachés
- **8 observations** : témoignages variés (personne correspondante, enfant seul, véhicule suspect...)
- **5 rumeurs** : avec statuts variés (en attente, vérifié vrai, vérifié faux)
- **6 actualités** : alertes, succès, informations
- **5 alertes SOS** : actives et résolues
- **Notifications** : bienvenue pour tous + affectations pour les agents
- **Chronologie** : événements de timeline pour chaque incident (création, validation, notes d'enquête)

Les données sont stockées dans IndexedDB et persistent entre les sessions. La version du seed (`v9`) est contrôlée via localStorage — un changement de version force un re-seed complet.

---

## Notes techniques

- **Offline-first** : l'application fonctionne sans connexion grâce à IndexedDB et au service worker (Workbox)
- **PWA installable** : ajoutable à l'écran d'accueil sur mobile et desktop
- **Dark mode** : thème sombre/clair avec toggle dans la topbar
- **Responsive** : mobile-first pour le citoyen, desktop sidebar pour agent/superviseur/admin
- **RBAC** : garde de routes basée sur les rôles via `ProtectedRoute`
- **Carte** : tiles CartoDB Voyager (clair) par défaut, clustering des marqueurs
- **Docker** : build multi-étapes (Node 22 → Nginx 1.27), compression gzip, headers de sécurité, cache immuable pour les assets statiques
