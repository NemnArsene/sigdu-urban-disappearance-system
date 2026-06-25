# SIGDU — Système d'Information Géographique des Disparitions Urbaines

Plateforme de signalement participatif pour la sécurité urbaine à Douala, Cameroun.

## Installation

```bash
# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Build production
npm run build

# Vérifier TypeScript
npm run typecheck
```

L'application est accessible sur `http://localhost:5173` après le lancement.

## Identifiants de démonstration

Les comptes sont créés automatiquement au premier chargement (via le seeder IndexedDB).

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| **Citoyen** | `citoyen@sigdu.cm` | `password123` |
| **Agent** | `agent@sigdu.cm` | `password123` |
| **Superviseur** | `superviseur@sigdu.cm` | `password123` |
| **Admin** | `admin@sigdu.cm` | `password123` |

> Sur la page de connexion, utilisez les boutons "Accès rapide (Jury)" pour remplir automatiquement les identifiants.

## Rôles et permissions

| Rôle | Accès |
|------|-------|
| **CITOYEN** | Signaler des incidents, consulter la carte, gérer ses alertes |
| **AGENT** | Voir les incidents assignés, mettre à jour les enquêtes |
| **SUPERVISEUR** | Valider les signalements, voir les statistiques, gérer les rapports |
| **ADMIN** | Gestion complète : utilisateurs, configuration, audit |

## Stack technique

- **Frontend** : React 19, TypeScript, Tailwind CSS, Vite
- **Cartographie** : Leaflet + OpenStreetMap (CartoDB tiles)
- **State** : Zustand
- **Persistence** : DexieJS (IndexedDB) — mode offline-first
- **PWA** : vite-plugin-pwa + Workbox
- **Formulaires** : React Hook Form + Zod
- **Charts** : Recharts (page superviseur)
- **Icônes** : Lucide React

## Structure du projet

```
src/
├── components/
│   ├── auth/         # ProtectedRoute (garde RBAC)
│   ├── layout/       # CitizenLayout, AgentLayout, SupervisorLayout, AdminLayout
│   ├── map/          # SIGMap (Leaflet)
│   └── ui/           # Button, Card, Badge, Input, Label
├── lib/
│   ├── database.ts   # DexieJS IndexedDB
│   ├── rbac.ts       # Config des rôles et routes
│   ├── seeder.ts     # Données démo (users, incidents, alerts)
│   └── utils.ts      # cn() utility
├── pages/
│   ├── auth/         # LoginPage
│   ├── citoyen/      # Dashboard, MapPage, ReportPage, AlertsPage, MesSignalementsPage, ProfilePage, MorePage
│   ├── agent/        # Dashboard, IncidentsPage, MapPage, AssignmentsPage, InvestigationsPage
│   ├── superviseur/  # Dashboard, ValidationPage, IncidentsPage, MapPage, StatisticsPage, ReportsPage
│   └── admin/        # Dashboard, UsersPage, IncidentsPage, MapPage, ReportsPage, AuditPage, ConfigurationPage
├── router/           # React Router (createBrowserRouter)
├── schemas/          # Zod validation schemas
├── stores/           # Zustand (authStore, uiStore)
├── styles/           # globals.css (design tokens)
└── types/            # TypeScript domain types
```

## Fonctionnalités principales

- **Signalement** : Formulaire multi-étapes (photo, GPS, détails, confirmation)
- **Carte interactive** : Visualisation des incidents sur OpenStreetMap
- **Alertes** : Système d'alertes critique/avertissement
- **Suivi** : Progression du signalement en temps réel
- **Menu flottant** : Navigation laterale avec bordures arrondies
- **Dark mode** : Thème sombre/clair avec toggle
- **PWA** : Fonctionne hors ligne, installable sur mobile

## Données démo

Le seeder crée automatiquement :
- 135 utilisateurs (100 citoyens, 20 agents, 10+ superviseurs, 5+ admin)
- 100 incidents (50 disparitions, 30 enlèvements, 20 retrouvés)
- 2 alertes (1 critique, 1 avertissement)

Les données sont stockées dans IndexedDB et persistent entre les sessions.

## Notes techniques

- La carte utilise les tiles **CartoDB Voyager** (clair) par défaut
- Le menu latéral est un panel flottant avec bordures arrondies
- Le header affiche dynamiquement le titre de la page courante
- Le bouton "Signaler" est un FAB (Floating Action Button) rouge au centre de la nav
