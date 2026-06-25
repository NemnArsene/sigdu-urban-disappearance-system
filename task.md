# Checklist d'Implémentation - SIGDU Hub Participatif

## 1. Modélisation & Base de données
- `[x]` Créer les nouvelles interfaces (Observation, TimelineEvent, Watcher, NewsPost, Rumor, SOSAlert) dans `types/index.ts`
- `[x]` Mettre à jour `database.ts` et `seeder.ts`

## 2. Interface Citoyen
- `[x]` **Bouton SOS Flottant** (Visible partout sur mobile)
- `[x]` **Dossier Public d'Avis de Recherche** (Route `/avis/:id`, QR Code)
- `[x]` **Signaler une Observation** (Formulaire avec Mock IA)
- `[x]` **Ligne de vie du dossier** (Timeline publique dans "Mes Signalements")
- `[x]` **Fil d'actualité sécurité** (Page dédiée ou Dashboard)
- `[x]` **Vérification des rumeurs** (Formulaire de soumission)
- `[x]` **Réseau des Veilleurs** (Paramètres Profil)
- `[x]` **Carte communautaire avancée** (Filtres et nouveaux calques)
- `[x]` **Recherche Intelligente** (Barre de recherche)

## 3. Interactions Backoffice (Superviseur)
- `[x]` Gérer les Rumeurs (File d'attente Vrai/Faux)
- `[x]` Modérer les Observations (Matching manuel/automatique avec dossiers existants)
- `[x]` Publier des Avis de Recherche Publics
- `[x]` Voir la Timeline complète (Privée + Publique)
- `[x]` Recevoir les alertes SOS géolocalisées
