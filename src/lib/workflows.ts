import type { IncidentType, IncidentStatus } from '../types';

/**
 * SIGDU Workflow Engine
 * 
 * Defines the valid status transitions for each incident type.
 * Each incident type follows a specific lifecycle adapted to its nature.
 */

// ─── Valid transitions per incident type ─────────────────────────────

type WorkflowTransitions = Record<IncidentStatus, IncidentStatus[]>;

/**
 * Default workflow (Enfant mineur, Adulte, Personne âgée, Trouble cognitif, Autre)
 * NOUVEAU → EN_VERIFICATION → DISPARITION_CONFIRMEE → RECHERCHE → ENQUETE_EN_COURS → LOCALISE → RETROUVE → CLOTURE
 *                           → FAUSSE_ALERTE
 */
const DEFAULT_WORKFLOW: WorkflowTransitions = {
  NOUVEAU: ['EN_VERIFICATION'],
  EN_VERIFICATION: ['DISPARITION_CONFIRMEE', 'FAUSSE_ALERTE'],
  FUGUE_PRESUMEE: [],
  DISPARITION_CONFIRMEE: ['RECHERCHE', 'ENQUETE_EN_COURS'],
  ENLEVEMENT_CONFIRME: [],
  ALERTE_CRITIQUE: [],
  RECHERCHE: ['ENQUETE_EN_COURS', 'LOCALISE'],
  ENQUETE_EN_COURS: ['LOCALISE', 'RETROUVE'],
  LOCALISE: ['RETROUVE'],
  RETROUVE: ['CLOTURE'],
  CLOTURE: [],
  FAUSSE_ALERTE: [],
  CORRESPONDANCE_EN_ATTENTE: [],
};

/**
 * Enlèvement workflow — urgency-first
 * NOUVEAU → EN_VERIFICATION → ENLEVEMENT_CONFIRME → ALERTE_CRITIQUE → ENQUETE_EN_COURS → LOCALISE → RETROUVE → CLOTURE
 *                           → FAUSSE_ALERTE
 */
const ENLEVEMENT_WORKFLOW: WorkflowTransitions = {
  NOUVEAU: ['EN_VERIFICATION'],
  EN_VERIFICATION: ['ENLEVEMENT_CONFIRME', 'FAUSSE_ALERTE'],
  FUGUE_PRESUMEE: [],
  DISPARITION_CONFIRMEE: [],
  ENLEVEMENT_CONFIRME: ['ALERTE_CRITIQUE'],
  ALERTE_CRITIQUE: ['ENQUETE_EN_COURS'],
  RECHERCHE: [],
  ENQUETE_EN_COURS: ['LOCALISE', 'RETROUVE'],
  LOCALISE: ['RETROUVE'],
  RETROUVE: ['CLOTURE'],
  CLOTURE: [],
  FAUSSE_ALERTE: [],
  CORRESPONDANCE_EN_ATTENTE: [],
};

/**
 * Fugue workflow
 * NOUVEAU → EN_VERIFICATION → FUGUE_PRESUMEE → RECHERCHE → LOCALISE → RETROUVE → CLOTURE
 *                           → FAUSSE_ALERTE
 */
const FUGUE_WORKFLOW: WorkflowTransitions = {
  NOUVEAU: ['EN_VERIFICATION'],
  EN_VERIFICATION: ['FUGUE_PRESUMEE', 'FAUSSE_ALERTE'],
  FUGUE_PRESUMEE: ['RECHERCHE'],
  DISPARITION_CONFIRMEE: [],
  ENLEVEMENT_CONFIRME: [],
  ALERTE_CRITIQUE: [],
  RECHERCHE: ['LOCALISE', 'RETROUVE'],
  ENQUETE_EN_COURS: [],
  LOCALISE: ['RETROUVE'],
  RETROUVE: ['CLOTURE'],
  CLOTURE: [],
  FAUSSE_ALERTE: [],
  CORRESPONDANCE_EN_ATTENTE: [],
};

/**
 * Personne retrouvée workflow — matching flow
 * NOUVEAU → EN_VERIFICATION → CORRESPONDANCE_EN_ATTENTE → RETROUVE → CLOTURE
 *                           → FAUSSE_ALERTE
 */
const RETROUVE_WORKFLOW: WorkflowTransitions = {
  NOUVEAU: ['EN_VERIFICATION'],
  EN_VERIFICATION: ['CORRESPONDANCE_EN_ATTENTE', 'FAUSSE_ALERTE'],
  FUGUE_PRESUMEE: [],
  DISPARITION_CONFIRMEE: [],
  ENLEVEMENT_CONFIRME: [],
  ALERTE_CRITIQUE: [],
  RECHERCHE: [],
  ENQUETE_EN_COURS: [],
  LOCALISE: [],
  RETROUVE: ['CLOTURE'],
  CLOTURE: [],
  FAUSSE_ALERTE: [],
  CORRESPONDANCE_EN_ATTENTE: ['RETROUVE'],
};

/**
 * Accident suspect workflow — investigation-first
 * NOUVEAU → EN_VERIFICATION → ENQUETE_EN_COURS → LOCALISE → RETROUVE → CLOTURE
 *                           → FAUSSE_ALERTE
 */
const ACCIDENT_WORKFLOW: WorkflowTransitions = {
  NOUVEAU: ['EN_VERIFICATION'],
  EN_VERIFICATION: ['ENQUETE_EN_COURS', 'FAUSSE_ALERTE'],
  FUGUE_PRESUMEE: [],
  DISPARITION_CONFIRMEE: [],
  ENLEVEMENT_CONFIRME: [],
  ALERTE_CRITIQUE: [],
  RECHERCHE: [],
  ENQUETE_EN_COURS: ['LOCALISE', 'RETROUVE'],
  LOCALISE: ['RETROUVE'],
  RETROUVE: ['CLOTURE'],
  CLOTURE: [],
  FAUSSE_ALERTE: [],
  CORRESPONDANCE_EN_ATTENTE: [],
};

// ─── Mapping incident type → workflow ────────────────────────────────

const WORKFLOWS: Record<IncidentType, WorkflowTransitions> = {
  DISPARITION: DEFAULT_WORKFLOW,
  TROUBLE_COGNITIF: DEFAULT_WORKFLOW,
  AUTRE: DEFAULT_WORKFLOW,
  ENLEVEMENT: ENLEVEMENT_WORKFLOW,
  FUGUE: FUGUE_WORKFLOW,
  ACCIDENT_SUSPECT: ACCIDENT_WORKFLOW,
};

// ─── Public API ──────────────────────────────────────────────────────

/**
 * Get valid next statuses for an incident given its type and current status.
 */
export function getNextStatuses(
  incidentType: IncidentType,
  currentStatus: IncidentStatus
): IncidentStatus[] {
  const workflow = WORKFLOWS[incidentType];
  if (!workflow) return [];
  return workflow[currentStatus] || [];
}

/**
 * Check if a transition is valid.
 */
export function isTransitionValid(
  incidentType: IncidentType,
  currentStatus: IncidentStatus,
  nextStatus: IncidentStatus
): boolean {
  return getNextStatuses(incidentType, currentStatus).includes(nextStatus);
}

/**
 * Get the full workflow for a given incident type (for display purposes).
 */
export function getWorkflow(incidentType: IncidentType): WorkflowTransitions {
  return WORKFLOWS[incidentType] || DEFAULT_WORKFLOW;
}

/**
 * Get a human-readable label for a status.
 */
export const STATUS_DISPLAY: Record<IncidentStatus, { label: string; emoji: string; severity: 'info' | 'warning' | 'danger' | 'success' | 'neutral' }> = {
  NOUVEAU: { label: 'Nouveau', emoji: '🆕', severity: 'info' },
  EN_VERIFICATION: { label: 'En vérification', emoji: '🔍', severity: 'info' },
  FUGUE_PRESUMEE: { label: 'Fugue présumée', emoji: '🏃', severity: 'warning' },
  DISPARITION_CONFIRMEE: { label: 'Disparition confirmée', emoji: '⚠️', severity: 'warning' },
  ENLEVEMENT_CONFIRME: { label: 'Enlèvement confirmé', emoji: '🚨', severity: 'danger' },
  ALERTE_CRITIQUE: { label: 'Alerte critique', emoji: '🔴', severity: 'danger' },
  RECHERCHE: { label: 'Recherche active', emoji: '🔎', severity: 'warning' },
  ENQUETE_EN_COURS: { label: 'Enquête en cours', emoji: '🕵️', severity: 'info' },
  LOCALISE: { label: 'Localisé(e)', emoji: '📍', severity: 'success' },
  RETROUVE: { label: 'Retrouvé(e)', emoji: '✅', severity: 'success' },
  CLOTURE: { label: 'Clôturé', emoji: '📋', severity: 'neutral' },
  FAUSSE_ALERTE: { label: 'Fausse alerte', emoji: '❌', severity: 'danger' },
  CORRESPONDANCE_EN_ATTENTE: { label: 'Correspondance en attente', emoji: '🔗', severity: 'info' },
};

/**
 * Get a human-readable label for an incident type.
 */
export const TYPE_DISPLAY: Record<IncidentType, { label: string; emoji: string }> = {
  FUGUE: { label: 'Fugue', emoji: '🏃' },
  DISPARITION: { label: 'Disparition', emoji: '⚠️' },
  ENLEVEMENT: { label: 'Enlèvement', emoji: '🚨' },
  TROUBLE_COGNITIF: { label: 'Trouble cognitif', emoji: '🧠' },
  ACCIDENT_SUSPECT: { label: 'Accident suspect', emoji: '🚑' },
  AUTRE: { label: 'Autre', emoji: '❓' },
};
