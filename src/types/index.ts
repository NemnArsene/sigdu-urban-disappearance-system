export type Role = 'CITOYEN' | 'AGENT' | 'SUPERVISEUR' | 'ADMIN';

export interface Organization {
  id: string;
  name: string; // 'Police', 'Gendarmerie', 'Mairie', 'Protection Civile', etc.
  type: string;
  createdAt: string;
}

export interface Service {
  id: string;
  organizationId: string;
  name: string; // 'Commissariat Central Douala I'
  arrondissement?: string; // Zone de couverture
  location?: Location;
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  firstName?: string;
  phone?: string;
  nationality?: string;
  age?: number;
  photo?: string;
  role: Role;
  organizationId?: string; // Pour les Agents et Superviseurs
  serviceId?: string; // Pour les Agents et Superviseurs
  createdAt: string;
}

export type IncidentType = 
  | 'ENFANT_MINEUR' 
  | 'ADULTE' 
  | 'PERSONNE_AGEE' 
  | 'FUGUE' 
  | 'DISPARITION'
  | 'ENLEVEMENT' 
  | 'TROUBLE_COGNITIF' 
  | 'ACCIDENT_SUSPECT' 
  | 'RETROUVE'
  | 'AUTRE';

export type IncidentStatus = 
  | 'NOUVEAU'
  | 'EN_VERIFICATION' // ou Vérification urgente
  | 'FUGUE_PRESUMEE' // Nouveau workflow Fugue
  | 'DISPARITION_CONFIRMEE'
  | 'ENLEVEMENT_CONFIRME'
  | 'ALERTE_CRITIQUE' // Nouveau workflow Enlèvement
  | 'RECHERCHE' // Workflow général
  | 'ENQUETE_EN_COURS'
  | 'LOCALISE'
  | 'RETROUVE'
  | 'CLOTURE'
  | 'FAUSSE_ALERTE'
  | 'CORRESPONDANCE_EN_ATTENTE'; // Nouveau workflow Personne Retrouvée

export interface Location {
  lat: number;
  lng: number;
  address?: string;
  arrondissement?: string; // Douala I, Douala II, Douala III, Douala IV, Douala V
}

export interface Incident {
  id: string;
  type: IncidentType;
  status: IncidentStatus;
  title: string;
  description: string;
  location: Location;
  photos: string[]; // Base64 data URIs
  reportedBy: string; // User ID (Citoyen)
  assignedServiceId?: string; // Affectation au Commissariat / Brigade
  assignedTo?: string; // Agent User ID responsable
  createdAt: string;
  updatedAt: string;
}

export interface Alert {
  id: string;
  title: string;
  message: string;
  level: 'INFO' | 'WARNING' | 'CRITICAL';
  createdAt: string;
}

export interface Observation {
  id: string;
  type: 'PERSONNE_CORRESPONDANTE' | 'ENFANT_SEUL' | 'PERSONNE_DESORIENTEE' | 'VEHICULE_SUSPECT' | 'COMPORTEMENT_INQUIETANT';
  incidentId?: string; // S'il est lié à un dossier connu (après vérification)
  description: string;
  location: Location;
  photos: string[];
  reportedBy: string; // User ID
  aiSimilarityScore?: number; // Pour le mock
  status: 'NOUVEAU' | 'TRAITE' | 'REJETE' | 'PERTINENT';
  createdAt: string;
}

export interface TimelineEvent {
  id: string;
  incidentId: string;
  actionType: string; // Ex: 'CREATION', 'VALIDATION', 'OBSERVATION', 'STATUT_CHANGE'
  description: string;
  visibility: 'PUBLIC' | 'INTERNAL';
  createdBy?: string; // ID de l'agent ou citoyen (si observation)
  createdAt: string;
}

export interface Watcher {
  userId: string;
  arrondissements: string[];
  favoriteQuartiers: string[];
  active: boolean;
}

export interface NewsPost {
  id: string;
  type: 'INFO' | 'ALERT' | 'SUCCESS';
  title: string;
  content: string;
  authorId: string;
  createdAt: string;
}

export interface Rumor {
  id: string;
  submittedBy: string;
  content: string;
  photo?: string;
  status: 'PENDING' | 'VERIFIED_TRUE' | 'VERIFIED_FALSE';
  officialResponse?: string;
  createdAt: string;
}

export interface SOSAlert {
  id: string;
  userId: string;
  location: Location;
  status: 'ACTIVE' | 'RESOLVED';
  resolvedAt?: string;
  createdAt: string;
}
