# Plan d'implémentation - SIGDU V2 (Extension Majeure)

L'application SIGDU ne se contente plus d'être un formulaire de signalement, elle devient un **hub complet de sécurité citoyenne**. 
Voici l'analyse approfondie et le plan d'action pour intégrer les 10 fonctionnalités majeures demandées.

---

## 1. Modélisation des Nouvelles Données (Base Dexie)

L'extension des fonctionnalités nécessite une évolution de l'architecture de la base de données existante.

### Nouvelles Tables à intégrer :
- **`observations` (Témoignages spontanés)** :
  - *Champs* : `id`, `type` (SIGHTING, WANDERING_CHILD, SUSPECT_VEHICLE, etc.), `incidentId` (optionnel), `location`, `photos`, `reportedBy`, `aiSimilarityScore` (mock IA), `status`, `createdAt`.
- **`timelineEvents` (Ligne de vie des dossiers)** :
  - *Champs* : `id`, `incidentId`, `actionType`, `description`, `visibility` (PUBLIC / INTERNAL), `createdBy`, `createdAt`.
- **`watchers` (Réseau des Veilleurs Citoyens)** :
  - *Champs* : `userId`, `arrondissements` (array), `favoriteQuartiers` (array), `active` (boolean).
- **`newsFeed` (Fil d'actualité)** :
  - *Champs* : `id`, `type` (INFO, ALERT, SUCCESS), `title`, `content`, `createdAt`.
- **`rumors` (Vérification de rumeurs)** :
  - *Champs* : `id`, `submittedBy`, `content`, `status` (PENDING, TRUE, FALSE), `officialResponse`, `createdAt`.
- **`sosAlerts` (Bouton SOS)** :
  - *Champs* : `id`, `userId`, `location`, `status` (ACTIVE, RESOLVED), `createdAt`.

---

## 2. Plan d'Action par Fonctionnalité

### Phase 1 : Cœur du Réseau Participatif (MVP Prioritaire)
1. **Dossier Public d'Avis de Recherche** :
   - Création d'une route publique `/avis/:id` (accessible sans compte pour le partage, ou avec un compte restreint).
   - Génération d'une vue "Affiche de recherche" (photo, description masquée selon la confidentialité).
   - Intégration d'un bouton "J'ai vu cette personne" (raccourci vers l'Observation).
   - Génération dynamique de QR Code (librairie `qrcode.react`).
2. **Signaler une Observation (ex-Témoignage)** :
   - Ajout d'un bouton flottant (FAB) ou d'une section sur la page d'accueil citoyen.
   - Formulaire rapide : type d'observation, photo, géolocalisation.
   - **Mock IA** : Après soumission d'une photo, simulation d'un chargement et affichage "Cette personne ressemble au dossier #254 (85% de similarité)".
3. **Ligne de vie du dossier (Timeline)** :
   - Côté Citoyen : Dans "Mes Signalements", ajout d'un onglet "Historique" n'affichant que les événements de visibilité `PUBLIC`.
   - Côté Backoffice (Agent/Superviseur) : Affichage complet avec les affectations, changements de statuts et notes internes.

### Phase 2 : Communauté & Information
4. **Réseau des Veilleurs Citoyens** :
   - Dans le profil, ajout de l'onglet "Devenir Veilleur".
   - Formulaire de configuration des zones (Arrondissement, Domicile).
5. **Fil d'actualité sécurité & Vérification des rumeurs** :
   - Remplacement partiel de la page "Dashboard" du citoyen par un fil d'actualité (Posts officiels + Rumeurs vérifiées).
   - Formulaire "Soumettre une rumeur (ex: capture WhatsApp)" au Centre de Supervision.
6. **Carte communautaire avancée** :
   - Mise à jour de `SIGMap.tsx` pour supporter des calques (Layers).
   - Boutons de filtre : Afficher/Cacher les observations, les commissariats, les hôpitaux (Mock data), et les dossiers actifs.

### Phase 3 : Sécurité Active & Recherche
7. **Bouton SOS** :
   - Bouton d'urgence (rouge, avec délai d'annulation de 3 secondes pour éviter les fausses manipulations).
   - Envoi silencieux aux agents (table `sosAlerts`).
8. **Recherche Intelligente** :
   - Ajout d'une barre de recherche globale pour les citoyens (recherche par nom partiel, quartier, type).

---

## 3. Interactions avec le Backoffice (Superviseur & Agent)

La magie de ces fonctionnalités réside dans leur traitement en coulisses :
- **Superviseur** : 
  - Gère les "Rumeurs" : il a une file d'attente de rumeurs à statuer (Vrai/Faux) avec possibilité d'écrire un démenti public.
  - Modère les "Observations" : si une observation est liée à un dossier existant (via l'IA ou manuellement), il l'attache au dossier. La Timeline du dossier est mise à jour et le citoyen ayant signalé reçoit une notification.
  - Publie les "Avis de recherche" : un signalement `DISPARITION_CONFIRMEE` permet au Superviseur de cliquer sur "Générer Avis Public".
- **Agent** :
  - Reçoit les SOS géolocalisés (Alerte sonore sur le dashboard Agent).
  - Traite les dossiers avec accès à la Timeline complète.

---

> [!IMPORTANT]  
> **Approbation Requise**
> L'ampleur des modifications de la base de données (ajout de 6 tables Dexie) nécessite une remise à zéro (`clear`) de votre base de développement locale pour éviter les conflits. 
> 
> **Question de design :** Voulez-vous que le **Bouton SOS** soit présent sur TOUTES les pages de l'application (par exemple en haut à droite, flottant) ou uniquement sur le Dashboard principal ?
> 
> Si le plan correspond à votre vision, cliquez sur **Proceed** pour que je commence par la modélisation de la base de données et l'Avis de Recherche !
