# Diagrammes Détaillés par Cas d'Utilisation

Ce document contient les diagrammes (Séquence et Cas d'Utilisation) spécifiques à chaque grande fonctionnalité de l'application SIGDU. Une attention particulière est portée sur la **persistance des données** (comment et où les données sont sauvegardées en base).

---

## 1. Cas d'Utilisation : Signalement d'une Disparition

Ce flux décrit comment un citoyen déclare une disparition et comment le backoffice prend le relais.

### Diagramme de Cas d'Utilisation
```mermaid
graph TD
    C["Citoyen"]
    S["Superviseur"]
    UC1["Remplir le formulaire"]
    UC2["Sauvegarder l'Incident DB"]
    UC3["Valider et Classifier"]
    UC4["Ajouter à la Timeline DB"]

    C --> UC1
    UC1 -.->|include| UC2
    S --> UC3
    UC3 -.->|include| UC4
```

### Diagramme de Séquence avec Persistance
```mermaid
sequenceDiagram
    actor C as Citoyen
    participant App as App Frontend
    participant DB as Base de Données (Mongo/IndexedDB)
    actor S as Superviseur

    C->>App: Soumet le signalement (Photo, GPS, Détails)
    
    rect rgb(200, 220, 240)
        Note over App, DB: PERSISTANCE DES DONNÉES
        App->>DB: INSERT into `incidents` (status="NOUVEAU")
        App->>DB: INSERT into `timelineEvents` (action="CREATION")
    end
    
    DB-->>App: Succès
    App-->>C: Affiche "Signalement transmis"
    
    App->>S: Notification: "Nouveau signalement à valider"
    S->>App: Ouvre le signalement et clique "Valider"
    
    rect rgb(200, 220, 240)
        Note over App, DB: MISE À JOUR EN BASE
        App->>DB: UPDATE `incidents` SET status="DISPARITION_CONFIRMEE"
        App->>DB: INSERT into `timelineEvents` (action="STATUS_CHANGE")
    end
```

---

## 2. Cas d'Utilisation : Soumission et Traitement d'une Observation

Lorsqu'un citoyen signale avoir vu une personne correspondante, l'observation est stockée puis traitée par le superviseur.

### Diagramme de Cas d'Utilisation
```mermaid
usecaseDiagram
    actor "Citoyen" as C
    actor "Superviseur" as S
    
    usecase "Prendre photo / Saisir détails" as UC1
    usecase "Analyse IA (Matching local)" as UC2
    usecase "Enregistrer Observation (DB)" as UC3
    usecase "Lier au dossier Incident (DB)" as UC4

    C --> UC1
    UC1 ..> UC2 : <<include>>
    UC1 ..> UC3 : <<include>> (Persistance)
    
    S --> UC4
```

### Diagramme de Séquence avec Persistance
```mermaid
sequenceDiagram
    actor C as Citoyen
    participant App as App Frontend
    participant DB as Base de Données
    actor S as Superviseur

    C->>App: Prend une photo d'un enfant égaré
    App->>App: IA locale: Calcule le "similarityScore"
    App->>C: Propose une correspondance (Dossier #X)
    C->>App: Valide l'envoi de l'observation
    
    rect rgb(200, 220, 240)
        Note over App, DB: PERSISTANCE DES DONNÉES
        App->>DB: INSERT into `observations` (status="NOUVEAU", incidentId=X)
    end
    
    S->>App: Consulte le tableau de bord des Observations
    S->>App: Clique sur "Valider & Lier au dossier"
    
    rect rgb(200, 220, 240)
        Note over App, DB: MISE À JOUR EN BASE
        App->>DB: UPDATE `observations` SET status="PERTINENT"
        App->>DB: INSERT into `timelineEvents` (incidentId=X, type="OBSERVATION")
    end
```

---

## 3. Cas d'Utilisation : Déclenchement du Réseau de Veilleurs

Ce flux montre comment l'application gère les alertes de proximité (Alerte Enlèvement).

### Diagramme de Cas d'Utilisation
```mermaid
usecaseDiagram
    actor "Superviseur" as S
    actor "Veilleur" as V
    
    usecase "Qualifier un Enlèvement" as UC1
    usecase "Rechercher Veilleurs dans la zone (DB)" as UC2
    usecase "Enregistrer Alerte (DB)" as UC3
    usecase "Recevoir Notification" as UC4

    S --> UC1
    UC1 ..> UC2 : <<include>>
    UC1 ..> UC3 : <<include>> (Persistance)
    V --> UC4
```

### Diagramme de Séquence avec Persistance
```mermaid
sequenceDiagram
    actor S as Superviseur
    participant App as App Backend/Frontend
    participant DB as Base de Données
    actor V as Citoyens Veilleurs (Quartier ciblé)

    S->>App: Change le statut d'un incident en "ALERTE_CRITIQUE"
    
    rect rgb(200, 220, 240)
        Note over App, DB: REQUÊTE ET PERSISTANCE
        App->>DB: UPDATE `incidents` SET status="ALERTE_CRITIQUE"
        App->>DB: INSERT into `alerts` (level="CRITICAL", message="...")
        App->>DB: SELECT * FROM `watchers` WHERE quartiers IN ("Akwa")
    end
    
    DB-->>App: Retourne Liste [Veilleur 1, Veilleur 2]
    
    App-->>V: Envoi SMS / Push Notification
    V->>App: Ouvre l'alerte sur l'application (Détails + Photo)
```

---

## 4. Cas d'Utilisation : Affectation et Résolution sur le Terrain

L'Agent reçoit son ordre de mission, se rend sur place et clôture l'intervention.

### Diagramme de Cas d'Utilisation
```mermaid
usecaseDiagram
    actor "Superviseur" as S
    actor "Agent Terrain" as A
    
    usecase "Affecter Dossier à Agent" as UC1
    usecase "Mettre à jour Enquête (DB)" as UC2
    usecase "Clôturer le Dossier (DB)" as UC3

    S --> UC1
    UC1 ..> UC2 : <<include>> (Persistance via Timeline)
    A --> UC3
```

### Diagramme de Séquence avec Persistance
```mermaid
sequenceDiagram
    actor S as Superviseur
    participant App as App
    participant DB as Base de Données
    actor A as Agent Terrain

    S->>App: Assigne le Dossier #X à l'Agent "Paul"
    
    rect rgb(200, 220, 240)
        Note over App, DB: PERSISTANCE DES DONNÉES
        App->>DB: UPDATE `incidents` SET assignedTo="Paul_ID"
    end
    
    App-->>A: Notification d'affectation
    A->>App: Se rend sur les lieux et clique "Enquête en cours"
    
    rect rgb(200, 220, 240)
        Note over App, DB: PERSISTANCE DES DONNÉES
        App->>DB: UPDATE `incidents` SET status="ENQUETE_EN_COURS"
        App->>DB: INSERT into `timelineEvents` (action="STATUS_CHANGE")
    end
    
    A->>App: Personne retrouvée, clique sur "Clôturer (Retrouvé)"
    
    rect rgb(200, 220, 240)
        Note over App, DB: PERSISTANCE FINALE
        App->>DB: UPDATE `incidents` SET status="RETROUVE"
        App->>DB: INSERT into `timelineEvents` (action="STATUS_CHANGE")
    end
```
