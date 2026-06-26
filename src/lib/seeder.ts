import { db } from './database';
import { type User, type Incident, type Alert, type Organization, type Service, type IncidentType, type IncidentStatus, type NewsPost, type Rumor, type Observation, type TimelineEvent, type SOSAlert, type Notification } from '../types';

const DOUALA_CENTER = { lat: 4.0511, lng: 9.7679 };
const DB_SEED_VERSION = 'v9'; // Increment this whenever you want to force a re-seed

const generateRandomOffset = () => (Math.random() - 0.5) * 0.05; // roughly 5km radius

export const seedDatabase = async () => {
  // Check seed version – if stale, clear and re-seed
  const seedVersion = localStorage.getItem('sigdu_seed_version');
  if (seedVersion === DB_SEED_VERSION) {
    console.log("Database already seeded at current version. Skipping.");
    return;
  }

  console.log("Seeding database with demo data (version:", DB_SEED_VERSION, ")...");

  // Clear all tables before re-seeding
  await db.users.clear();
  await db.incidents.clear();
  await db.alerts.clear();
  await db.organizations.clear();
  await db.services.clear();
  await db.observations.clear();
  await db.timelineEvents.clear();
  await db.watchers.clear();
  await db.newsFeed.clear();
  await db.rumors.clear();
  await db.sosAlerts.clear();
  await db.notifications.clear();

  // 1. Create Organizations
  const organizations: Organization[] = [
    { id: 'org_police', name: 'Police Nationale', type: 'Police', createdAt: new Date().toISOString() },
    { id: 'org_gendarmerie', name: 'Gendarmerie Nationale', type: 'Gendarmerie', createdAt: new Date().toISOString() },
    { id: 'org_mairie', name: 'Mairie de Douala', type: 'Mairie', createdAt: new Date().toISOString() },
  ];
  await db.organizations.bulkAdd(organizations);

  // 2. Create Services
  const services: Service[] = [
    { id: 'srv_police_d1', organizationId: 'org_police', name: 'Commissariat Central Douala I', arrondissement: 'Douala I', location: { lat: 4.0411, lng: 9.7079, arrondissement: 'Douala I' }, createdAt: new Date().toISOString() },
    { id: 'srv_police_d2', organizationId: 'org_police', name: 'Commissariat Central Douala II', arrondissement: 'Douala II', location: { lat: 4.0211, lng: 9.7279, arrondissement: 'Douala II' }, createdAt: new Date().toISOString() },
    { id: 'srv_gendarmerie_d3', organizationId: 'org_gendarmerie', name: 'Brigade Territoriale Douala III', arrondissement: 'Douala III', location: { lat: 4.0711, lng: 9.7879, arrondissement: 'Douala III' }, createdAt: new Date().toISOString() },
    { id: 'srv_mairie_center', organizationId: 'org_mairie', name: 'Centre de Supervision Urbain', location: { lat: 4.0511, lng: 9.7679, arrondissement: 'Douala I' }, createdAt: new Date().toISOString() },
  ];
  await db.services.bulkAdd(services);

  // 3. Create Users
  const users: User[] = [
    { id: 'u1', email: 'citoyen@sigdu.cm', name: 'Jean Citoyen', firstName: 'Jean', phone: '699 123 456', nationality: 'Camerounaise', age: 32, role: 'CITOYEN', createdAt: new Date().toISOString() },
    { id: 'u2', email: 'agent@sigdu.cm', name: 'Paul Agent', firstName: 'Paul', phone: '699 987 654', nationality: 'Camerounaise', age: 28, role: 'AGENT', organizationId: 'org_police', serviceId: 'srv_police_d1', createdAt: new Date().toISOString() },
    { id: 'u3', email: 'superviseur@sigdu.cm', name: 'Marie Superviseur', firstName: 'Marie', phone: '698 456 123', nationality: 'Camerounaise', age: 35, role: 'SUPERVISEUR', organizationId: 'org_mairie', serviceId: 'srv_mairie_center', createdAt: new Date().toISOString() },
    { id: 'u4', email: 'admin@sigdu.cm', name: 'Admin Principal', firstName: 'Admin', phone: '697 789 012', nationality: 'Camerounaise', age: 40, role: 'ADMIN', createdAt: new Date().toISOString() },
  ];

  for (let i = 0; i < 99; i++) {
    users.push({ id: `c${i}`, email: `citoyen${i}@sigdu.cm`, name: `Citoyen ${i}`, firstName: `Citoyen${i}`, phone: `699 000 ${String(i).padStart(3, '0')}`, nationality: 'Camerounaise', age: 20 + (i % 40), role: 'CITOYEN', createdAt: new Date().toISOString() });
  }
  for (let i = 0; i < 19; i++) {
    const isPolice = i % 2 === 0;
    users.push({ 
      id: `a${i}`, 
      email: `agent${i}@sigdu.cm`, 
      name: `Agent ${i}`, 
      firstName: `Agent${i}`, 
      phone: `698 000 ${String(i).padStart(3, '0')}`, 
      nationality: 'Camerounaise', 
      age: 25 + (i % 30), 
      role: 'AGENT', 
      organizationId: isPolice ? 'org_police' : 'org_gendarmerie',
      serviceId: isPolice ? 'srv_police_d1' : 'srv_gendarmerie_d3',
      createdAt: new Date().toISOString() 
    });
  }

  await db.users.bulkAdd(users);

  // 4. Create Incidents
  const incidents: Incident[] = [];
  const types: IncidentType[] = ['DISPARITION', 'FUGUE', 'ENLEVEMENT', 'TROUBLE_COGNITIF', 'ACCIDENT_SUSPECT', 'AUTRE'];
  const statuses: IncidentStatus[] = ['NOUVEAU', 'EN_VERIFICATION', 'DISPARITION_CONFIRMEE', 'ENQUETE_EN_COURS', 'LOCALISE', 'RETROUVE', 'CLOTURE'];
  const arrondissements = ['Douala I', 'Douala II', 'Douala III', 'Douala IV', 'Douala V'];
  const ages: Array<'ENFANT_MINEUR' | 'ADULTE' | 'PERSONNE_AGEE'> = ['ENFANT_MINEUR', 'ADULTE', 'PERSONNE_AGEE'];
  const serviceIds = ['srv_police_d1', 'srv_police_d2', 'srv_gendarmerie_d3'];

  for (let i = 0; i < 100; i++) {
    const type = types[i % types.length];
    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const arrondissement = arrondissements[i % 5];
    const assignedServiceId = status !== 'NOUVEAU' && status !== 'EN_VERIFICATION' ? serviceIds[i % 3] : undefined;

    incidents.push({
      id: `inc_${i}`,
      type,
      status,
      title: `${type.replace('_', ' ')} signalé dans ${arrondissement}`,
      description: `Description détaillée pour l'incident ${i}. Signalement important nécessitant une vérification.`,
      personAge: ['DISPARITION', 'FUGUE', 'ENLEVEMENT'].includes(type) ? ages[i % 3] : undefined,
      location: {
        lat: DOUALA_CENTER.lat + generateRandomOffset(),
        lng: DOUALA_CENTER.lng + generateRandomOffset(),
        arrondissement,
        quartier: `Quartier ${i % 10}`
      },
      photos: [],
      reportedBy: 'u1',
      assignedServiceId,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  await db.incidents.bulkAdd(incidents);

  // 4b. Targeted mock incidents for Agent testing (u2 = agent@sigdu.cm, service = srv_police_d1)
  const agentMockIncidents: Incident[] = [
    // === AFFECTATIONS: NOUVEAU + assignedServiceId but NO assignedTo ===
    {
      id: 'inc_agent_affect_1',
      type: 'DISPARITION',
      status: 'NOUVEAU',
      title: 'Disparition d\'enfant — Bonapriso',
      description: 'Un garçon de 8 ans a disparu depuis le terrain de sport de Bonapriso. Dernière vue vers 16h. Les parents sont en état de choc.',
      personAge: 'ENFANT_MINEUR',
      location: { lat: 4.0485, lng: 9.7132, arrondissement: 'Douala I', quartier: 'Bonapriso' },
      photos: [],
      reportedBy: 'u1',
      assignedServiceId: 'srv_police_d1',
      createdAt: new Date(Date.now() - 1800000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'inc_agent_affect_2',
      type: 'FUGUE',
      status: 'NOUVEAU',
      title: 'Fugue adolescente — Akwa',
      description: 'Adolescente de 15 ans partie de chez elle ce matin. Note laissée "je reviendrai pas". Famille alarmée.',
      personAge: 'ENFANT_MINEUR',
      location: { lat: 4.0523, lng: 9.7315, arrondissement: 'Douala I', quartier: 'Akwa' },
      photos: [],
      reportedBy: 'c1',
      assignedServiceId: 'srv_police_d1',
      createdAt: new Date(Date.now() - 3600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'inc_agent_affect_3',
      type: 'ENLEVEMENT',
      status: 'NOUVEAU',
      title: 'Enlèvement suspect — New Bell',
      description: 'Témoin a vu un enfant tiré dans un véhicule blanc non identifié. Plaque partiellement lue : DW-... . Urgence maximale.',
      personAge: 'ENFANT_MINEUR',
      location: { lat: 4.0398, lng: 9.7456, arrondissement: 'Douala II', quartier: 'New Bell' },
      photos: [],
      reportedBy: 'u1',
      assignedServiceId: 'srv_police_d1',
      createdAt: new Date(Date.now() - 900000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'inc_agent_affect_4',
      type: 'TROUBLE_COGNITIF',
      status: 'NOUVEAU',
      title: 'Personne désorientée — Marché Central',
      description: 'Homme d\'environ 70 ans trouvé errant près du marché central. Ne se souvient plus de son nom. Porte un pull bleu marine.',
      personAge: 'PERSONNE_AGEE',
      location: { lat: 4.0511, lng: 9.7679, arrondissement: 'Douala I', quartier: 'Marché Central' },
      photos: [],
      reportedBy: 'c5',
      assignedServiceId: 'srv_police_d1',
      createdAt: new Date(Date.now() - 5400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },

    // === ENQUETES: assignedTo = u2 (agent), active statuses ===
    {
      id: 'inc_agent_enq_1',
      type: 'DISPARITION',
      status: 'ENQUETE_EN_COURS',
      title: 'DisparitionAdulte — Makepe',
      description: 'Femme de 35 ans disparue depuis 3 jours. Dernière localisation connue : carrefour Makepe. Enquête en cours, témoins sollicités.',
      personAge: 'ADULTE',
      location: { lat: 4.0811, lng: 9.7579, arrondissement: 'Douala V', quartier: 'Makepe' },
      photos: [],
      reportedBy: 'u1',
      assignedServiceId: 'srv_police_d1',
      assignedTo: 'u2',
      createdAt: new Date(Date.now() - 259200000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'inc_agent_enq_2',
      type: 'ENLEVEMENT',
      status: 'ENLEVEMENT_CONFIRME',
      title: 'Enlèvement confirmé — Bépanda',
      description: 'Enlèvement confirmé par les caméras de surveillance. Véhicule noir repéré. Recherche active en cours.',
      personAge: 'ENFANT_MINEUR',
      location: { lat: 4.0811, lng: 9.7479, arrondissement: 'Douala V', quartier: 'Bépanda' },
      photos: [],
      reportedBy: 'u1',
      assignedServiceId: 'srv_police_d1',
      assignedTo: 'u2',
      createdAt: new Date(Date.now() - 432000000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'inc_agent_enq_3',
      type: 'FUGUE',
      status: 'FUGUE_PRESUMEE',
      title: 'Fugue présumée — Logbaba',
      description: 'Adolescent retrouvé par une caméra de surveillance dans un taxi. Piste en cours de vérification à Logbaba.',
      personAge: 'ENFANT_MINEUR',
      location: { lat: 4.0711, lng: 9.7879, arrondissement: 'Douala III', quartier: 'Logbaba' },
      photos: [],
      reportedBy: 'c1',
      assignedServiceId: 'srv_police_d1',
      assignedTo: 'u2',
      createdAt: new Date(Date.now() - 172800000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'inc_agent_enq_4',
      type: 'ACCIDENT_SUSPECT',
      status: 'RECHERCHE',
      title: 'Accident suspect — Bonanjo',
      description: 'Véhicule renversant un piéton puis prenant la fuite. Plaque partiellement relevée. Enquête de voisinage en cours.',
      location: { lat: 4.0611, lng: 9.7779, arrondissement: 'Douala I', quartier: 'Bonanjo' },
      photos: [],
      reportedBy: 'u1',
      assignedServiceId: 'srv_police_d1',
      assignedTo: 'u2',
      createdAt: new Date(Date.now() - 86400000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      id: 'inc_agent_enq_5',
      type: 'DISPARITION',
      status: 'DISPARITION_CONFIRMEE',
      title: 'Disparition confirmée — PK8',
      description: 'Disparition confirmée. Dernière trace au carrefour PK8.部署 patrouilles dans le secteur.',
      personAge: 'ADULTE',
      location: { lat: 4.0711, lng: 9.7979, arrondissement: 'Douala III', quartier: 'PK8' },
      photos: [],
      reportedBy: 'u1',
      assignedServiceId: 'srv_police_d1',
      assignedTo: 'u2',
      createdAt: new Date(Date.now() - 345600000).toISOString(),
      updatedAt: new Date().toISOString(),
    },
  ];
  await db.incidents.bulkAdd(agentMockIncidents);

  // Generate auto timeline events for ALL incidents (CREATION + optional STATUS_CHANGE)
  const autoEvents: TimelineEvent[] = [];
  for (const inc of incidents) {
    const base = new Date(inc.createdAt).getTime();
    // CREATION event
    autoEvents.push({
      id: `te_auto_creation_${inc.id}`,
      incidentId: inc.id,
      actionType: 'CREATION',
      description: `Signalement créé via l'application SIGDU. Catégorie : ${inc.type.replace(/_/g, ' ')}.`,
      visibility: 'PUBLIC',
      createdBy: inc.reportedBy,
      createdAt: new Date(base).toISOString(),
    });
    // EN_VERIFICATION event if not NOUVEAU
    if (inc.status !== 'NOUVEAU') {
      autoEvents.push({
        id: `te_auto_verif_${inc.id}`,
        incidentId: inc.id,
        actionType: 'VALIDATION',
        description: 'Le dossier a été pris en charge et mis en vérification par un superviseur.',
        visibility: 'PUBLIC',
        createdBy: 'u3',
        createdAt: new Date(base + 3600000).toISOString(),
      });
    }
    // AFFECTATION event if assigned
    if (inc.assignedServiceId) {
      autoEvents.push({
        id: `te_auto_affect_${inc.id}`,
        incidentId: inc.id,
        actionType: 'AFFECTATION',
        description: `Dossier affecté à un service d'intervention pour prise en charge terrain.`,
        visibility: 'INTERNAL',
        createdBy: 'u3',
        createdAt: new Date(base + 7200000).toISOString(),
      });
    }
    // STATUS_CHANGE if resolved
    if (['LOCALISE', 'RETROUVE', 'CLOTURE'].includes(inc.status)) {
      autoEvents.push({
        id: `te_auto_close_${inc.id}`,
        incidentId: inc.id,
        actionType: 'STATUS_CHANGE',
        description: `Statut du dossier mis à jour : ${inc.status.replace(/_/g, ' ')}.`,
        visibility: 'PUBLIC',
        createdBy: 'u2',
        createdAt: new Date(base + 14400000).toISOString(),
      });
    }
  }
  await db.timelineEvents.bulkAdd(autoEvents);

  // 5. Create Alerts
  const alerts: Alert[] = [
    { id: 'al1', title: 'Alerte Enlèvement', message: 'Enfant signalé disparu à Bonamoussadi.', level: 'CRITICAL', createdAt: new Date().toISOString() },
    { id: 'al2', title: 'Vigilance', message: 'Plusieurs cas signalés autour du marché central.', level: 'WARNING', createdAt: new Date().toISOString() },
  ];

  await db.alerts.bulkAdd(alerts);

  // 6. Create News Feed Posts
  const newsFeedPosts: NewsPost[] = [
    { id: 'nf1', type: 'ALERT', title: '🚨 Alerte Enlèvement — Bonamoussadi', content: 'Un enfant de 7 ans a été signalé disparu dans le quartier de Bonamoussadi ce matin à 8h30. La Police Nationale lance un avis de recherche. Si vous avez des informations, contactez le 117.', authorId: 'u3', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'nf2', type: 'SUCCESS', title: '✅ Personne retrouvée — Douala III', content: 'Grâce à la vigilance citoyenne et au réseau SIGDU, Mme Ndongo (72 ans) signalée désorientée hier soir a été retrouvée saine et sauve ce matin par une patrouille de quartier à Logbaba.', authorId: 'u3', createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'nf3', type: 'INFO', title: '📋 Campagne de sensibilisation — Semaine de la sécurité', content: 'La Mairie de Douala organise la Semaine de la Sécurité Urbaine du 1er au 7 juillet. Des ateliers gratuits sur les réflexes en cas de disparition seront proposés dans les 5 arrondissements. Inscriptions sur le site de la Mairie.', authorId: 'u3', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'nf4', type: 'INFO', title: '📱 Mise à jour SIGDU — Nouvelles fonctionnalités', content: 'L\'application SIGDU se dote de nouvelles fonctionnalités : fil d\'actualité sécuritaire, vérification de rumeurs, et réseau de veilleurs citoyens. Mettez à jour votre profil pour activer les alertes géolocalisées.', authorId: 'u4', createdAt: new Date(Date.now() - 172800000).toISOString() },
    { id: 'nf5', type: 'ALERT', title: '⚠️ Véhicule suspect signalé — Akwa Nord', content: 'Plusieurs témoins ont signalé un véhicule suspect (fourgon blanc sans plaques) circulant lentement à proximité des écoles du quartier Akwa Nord. Soyez vigilants et signalez tout comportement anormal.', authorId: 'u3', createdAt: new Date(Date.now() - 259200000).toISOString() },
    { id: 'nf6', type: 'SUCCESS', title: '🎉 Bilan mensuel positif — Juin 2026', content: 'Grâce au réseau SIGDU, 12 personnes ont été retrouvées en juin 2026. Le temps moyen de résolution est passé de 72h à 18h. Merci à tous les citoyens veilleurs !', authorId: 'u4', createdAt: new Date(Date.now() - 345600000).toISOString() },
  ];
  await db.newsFeed.bulkAdd(newsFeedPosts);

  // 7. Create Rumors
  const rumors: Rumor[] = [
    { id: 'rum1', submittedBy: 'u1', content: 'Message WhatsApp circulant : "Un gang kidnappe des enfants dans les taxis à Douala". Source : capture d\'écran groupe WhatsApp.', photo: '', status: 'VERIFIED_FALSE', officialResponse: 'FAUX — La Police Nationale dément cette information. Aucun cas de ce type n\'a été enregistré. Il s\'agit d\'un message recyclé originaire d\'un autre pays.', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'rum2', submittedBy: 'c1', content: 'On dit que 3 enfants ont disparu à Makepe cette semaine. C\'est vrai ?', status: 'VERIFIED_TRUE', officialResponse: 'PARTIELLEMENT VRAI — Deux cas de fugue d\'adolescents ont été signalés cette semaine à Makepe. Les deux mineurs ont été retrouvés. Un troisième cas est en cours de vérification.', createdAt: new Date(Date.now() - 172800000).toISOString() },
    { id: 'rum3', submittedBy: 'c5', content: 'J\'ai entendu dire qu\'une personne déguisée en agent de sécurité enlève des enfants à Bonaberi.', status: 'PENDING', createdAt: new Date(Date.now() - 43200000).toISOString() },
    { id: 'rum4', submittedBy: 'c12', content: 'Il paraît que la police a retrouvé un réseau organisé de trafic d\'enfants dans le quartier Ndogbong.', status: 'PENDING', createdAt: new Date(Date.now() - 21600000).toISOString() },
    { id: 'rum5', submittedBy: 'c20', content: 'Message Facebook : "Ne laissez pas vos enfants seuls, 5 enlèvements à Douala V ce weekend".', status: 'VERIFIED_FALSE', officialResponse: 'FAUX — Le Commissariat de Douala V n\'a enregistré aucun signalement d\'enlèvement ce weekend. Vérifiez toujours vos sources.', createdAt: new Date(Date.now() - 432000000).toISOString() },
  ];
  await db.rumors.bulkAdd(rumors);

  // 8. Create Observations
  const observations: Observation[] = [
    { id: 'obs_1', type: 'PERSONNE_CORRESPONDANTE', incidentId: 'inc_0', description: 'J\'ai vu une personne correspondant à la description sur le marché central. Elle portait un t-shirt bleu et semblait confuse.', location: { lat: 4.0511, lng: 9.7679, arrondissement: 'Douala I', quartier: 'Akwa' }, photos: [], reportedBy: 'c1', aiSimilarityScore: 78, status: 'NOUVEAU', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'obs_2', type: 'ENFANT_SEUL', incidentId: 'inc_3', description: 'Un enfant seul pleure près de l\'arrêt de bus à Logbaba. Il semble perdu et ne répond pas aux questions.', location: { lat: 4.0711, lng: 9.7879, arrondissement: 'Douala III', quartier: 'Logbaba' }, photos: [], reportedBy: 'c5', aiSimilarityScore: 65, status: 'NOUVEAU', createdAt: new Date(Date.now() - 7200000).toISOString() },
    { id: 'obs_3', type: 'VEHICULE_SUSPECT', incidentId: 'inc_7', description: 'Fourgon blanc sans plaques garé depuis 2h près de l\'école primaire de Makepe. Le conducteur filmait les enfants.', location: { lat: 4.0811, lng: 9.7579, arrondissement: 'Douala V', quartier: 'Makepe' }, photos: [], reportedBy: 'c12', aiSimilarityScore: 42, status: 'NOUVEAU', createdAt: new Date(Date.now() - 14400000).toISOString() },
    { id: 'obs_4', type: 'PERSONNE_DESORIENTEE', incidentId: 'inc_12', description: 'Une femme âgée marche en titubant sur le boulevard de la République. Elle semble ne pas savoir où elle est.', location: { lat: 4.0411, lng: 9.7479, arrondissement: 'Douala II', quartier: 'New Bell' }, photos: [], reportedBy: 'c20', aiSimilarityScore: 88, status: 'PERTINENT', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'obs_5', type: 'COMPORTEMENT_INQUIETANT', description: 'Un homme observe les enfants sortant de l\'école pendant 30 minutes. Il a été remarqué plusieurs fois cette semaine.', location: { lat: 4.0611, lng: 9.7779, arrondissement: 'Douala I', quartier: 'Bonanjo' }, photos: [], reportedBy: 'c33', status: 'REJETE', createdAt: new Date(Date.now() - 172800000).toISOString() },
    { id: 'obs_6', type: 'PERSONNE_CORRESPONDANTE', incidentId: 'inc_15', description: 'Ressemblance frappante avec la photo sur l\'affiche. La personne se trouve au carrefour PK8.', location: { lat: 4.0711, lng: 9.7979, arrondissement: 'Douala III', quartier: 'PK8' }, photos: [], reportedBy: 'c8', aiSimilarityScore: 91, status: 'TRAITE', createdAt: new Date(Date.now() - 259200000).toISOString() },
    { id: 'obs_7', type: 'ENFANT_SEUL', description: 'Un garçon d\'environ 10 ans errait seul près du marché Central. Pas d\'adulte en vue.', location: { lat: 4.0511, lng: 9.7679, arrondissement: 'Douala I', quartier: 'Koumassi' }, photos: [], reportedBy: 'c45', status: 'NOUVEAU', createdAt: new Date(Date.now() - 5400000).toISOString() },
    { id: 'obs_8', type: 'VEHICULE_SUSPECT', incidentId: 'inc_22', description: 'Taxi jaune stationné de façon suspecte près du terrain de sport de Bépanda. Le chauffeur discute avec des enfants.', location: { lat: 4.0811, lng: 9.7479, arrondissement: 'Douala V', quartier: 'Bépanda' }, photos: [], reportedBy: 'c56', aiSimilarityScore: 55, status: 'NOUVEAU', createdAt: new Date(Date.now() - 10800000).toISOString() },
  ];
  await db.observations.bulkAdd(observations);

  // 9. Create Timeline Events
  const timelineEvents: TimelineEvent[] = [
    { id: 'te_1', incidentId: 'inc_0', actionType: 'CREATION', description: 'Signalement créé par un citoyen via l\'application SIGDU.', visibility: 'PUBLIC', createdBy: 'u1', createdAt: new Date(Date.now() - 864000000).toISOString() },
    { id: 'te_2', incidentId: 'inc_0', actionType: 'VALIDATION', description: 'Le dossier a été validé par le superviseur et mis en vérification.', visibility: 'PUBLIC', createdBy: 'u3', createdAt: new Date(Date.now() - 828000000).toISOString() },
    { id: 'te_3', incidentId: 'inc_0', actionType: 'STATUS_CHANGE', description: 'Avis de recherche public émis pour ce dossier.', visibility: 'PUBLIC', createdBy: 'u3', createdAt: new Date(Date.now() - 792000000).toISOString() },
    { id: 'te_4', incidentId: 'inc_0', actionType: 'OBSERVATION', description: 'Une observation citoyenne a été confirmée comme pertinente par nos services.', visibility: 'INTERNAL', createdBy: 'u3', createdAt: new Date(Date.now() - 756000000).toISOString() },
    { id: 'te_5', incidentId: 'inc_3', actionType: 'CREATION', description: 'Signalement créé par un citoyen.', visibility: 'PUBLIC', createdBy: 'u1', createdAt: new Date(Date.now() - 500000000).toISOString() },
    { id: 'te_6', incidentId: 'inc_3', actionType: 'AFFECTATION', description: 'Dossier affecté au Commissariat Central Douala I.', visibility: 'INTERNAL', createdBy: 'u3', createdAt: new Date(Date.now() - 480000000).toISOString() },
    { id: 'te_7', incidentId: 'inc_7', actionType: 'CREATION', description: 'Signalement créé.', visibility: 'PUBLIC', createdBy: 'u1', createdAt: new Date(Date.now() - 300000000).toISOString() },
    { id: 'te_8', incidentId: 'inc_12', actionType: 'VALIDATION', description: 'Dossier validé et en cours d\'enquête.', visibility: 'PUBLIC', createdBy: 'u3', createdAt: new Date(Date.now() - 200000000).toISOString() },
    { id: 'te_9', incidentId: 'inc_12', actionType: 'STATUS_CHANGE', description: 'Personne localisée grâce à une observation citoyenne.', visibility: 'PUBLIC', createdBy: 'u2', createdAt: new Date(Date.now() - 150000000).toISOString() },
    { id: 'te_10', incidentId: 'inc_15', actionType: 'CREATION', description: 'Signalement créé.', visibility: 'PUBLIC', createdBy: 'u1', createdAt: new Date(Date.now() - 400000000).toISOString() },
  ];
  await db.timelineEvents.bulkAdd(timelineEvents);

  // 9b. Timeline events for agent mock incidents
  const agentMockEvents: TimelineEvent[] = [
    // Enquiry 1 timeline
    { id: 'te_agent_enq_1_creation', incidentId: 'inc_agent_enq_1', actionType: 'CREATION', description: 'Signalement créé par un citoyen via l\'application SIGDU.', visibility: 'PUBLIC', createdBy: 'u1', createdAt: new Date(Date.now() - 259200000).toISOString() },
    { id: 'te_agent_enq_1_verif', incidentId: 'inc_agent_enq_1', actionType: 'VALIDATION', description: 'Dossier validé par le superviseur.', visibility: 'PUBLIC', createdBy: 'u3', createdAt: new Date(Date.now() - 255600000).toISOString() },
    { id: 'te_agent_enq_1_affect', incidentId: 'inc_agent_enq_1', actionType: 'AFFECTATION', description: 'Dossier affecté au Commissariat Central Douala I.', visibility: 'INTERNAL', createdBy: 'u3', createdAt: new Date(Date.now() - 252000000).toISOString() },
    { id: 'te_agent_enq_1_note1', incidentId: 'inc_agent_enq_1', actionType: 'OBSERVATION', description: 'Entretien avec le conjoint. Dernière dispute connue il y a 2 semaines. Vérification des comptes bancaires en cours.', visibility: 'INTERNAL', createdBy: 'u2', createdAt: new Date(Date.now() - 200000000).toISOString() },
    { id: 'te_agent_enq_1_note2', incidentId: 'inc_agent_enq_1', actionType: 'OBSERVATION', description: 'Caméra de sécurité du voisin montre une personne sortant à 3h du matin avec une valise. Piste à creuser.', visibility: 'INTERNAL', createdBy: 'u2', createdAt: new Date(Date.now() - 150000000).toISOString() },
    // Enquiry 2 timeline
    { id: 'te_agent_enq_2_creation', incidentId: 'inc_agent_enq_2', actionType: 'CREATION', description: 'Signalement d\'enlèvement créé.', visibility: 'PUBLIC', createdBy: 'u1', createdAt: new Date(Date.now() - 432000000).toISOString() },
    { id: 'te_agent_enq_2_confirm', incidentId: 'inc_agent_enq_2', actionType: 'STATUS_CHANGE', description: 'Enlèvement confirmé par les preuves vidéo.', visibility: 'PUBLIC', createdBy: 'u3', createdAt: new Date(Date.now() - 428400000).toISOString() },
    { id: 'te_agent_enq_2_affect', incidentId: 'inc_agent_enq_2', actionType: 'AFFECTATION', description: 'Enquête confiée à l\'agent terrain.', visibility: 'INTERNAL', createdBy: 'u3', createdAt: new Date(Date.now() - 424800000).toISOString() },
    { id: 'te_agent_enq_2_note1', incidentId: 'inc_agent_enq_2', actionType: 'OBSERVATION', description: 'Véhicule noir repéré par 3 témoins. Immatriculation en cours deidentification via les caméras LAPI.', visibility: 'INTERNAL', createdBy: 'u2', createdAt: new Date(Date.now() - 350000000).toISOString() },
    // Enquiry 3 timeline
    { id: 'te_agent_enq_3_creation', incidentId: 'inc_agent_enq_3', actionType: 'CREATION', description: 'Fugue signalée.', visibility: 'PUBLIC', createdBy: 'c1', createdAt: new Date(Date.now() - 172800000).toISOString() },
    { id: 'te_agent_enq_3_note1', incidentId: 'inc_agent_enq_3', actionType: 'OBSERVATION', description: 'Adolescent filmé montant dans un taxi jaune. Le chauffeur pourrait être identifié via la plateforme de transport.', visibility: 'INTERNAL', createdBy: 'u2', createdAt: new Date(Date.now() - 120000000).toISOString() },
    // Enquiry 4 timeline
    { id: 'te_agent_enq_4_creation', incidentId: 'inc_agent_enq_4', actionType: 'CREATION', description: 'Accident suspect signalé.', visibility: 'PUBLIC', createdBy: 'u1', createdAt: new Date(Date.now() - 86400000).toISOString() },
    { id: 'te_agent_enq_4_note1', incidentId: 'inc_agent_enq_4', actionType: 'OBSERVATION', description: 'Enquête de voisinage : 2 témoins ont vu le véhicule. Couleur foncée, possiblement un SUV.', visibility: 'INTERNAL', createdBy: 'u2', createdAt: new Date(Date.now() - 50000000).toISOString() },
  ];
  await db.timelineEvents.bulkAdd(agentMockEvents);

  // 10. Create SOS Alerts
  const sosAlerts: SOSAlert[] = [
    { id: 'sos_1', userId: 'c1', location: { lat: 4.0511, lng: 9.7679, arrondissement: 'Douala I', quartier: 'Akwa' }, status: 'ACTIVE', createdAt: new Date(Date.now() - 1800000).toISOString() },
    { id: 'sos_2', userId: 'c5', location: { lat: 4.0711, lng: 9.7879, arrondissement: 'Douala III', quartier: 'Logbaba' }, status: 'ACTIVE', assignedServiceId: 'srv_police_d1', createdAt: new Date(Date.now() - 3600000).toISOString() },
    { id: 'sos_3', userId: 'c12', location: { lat: 4.0811, lng: 9.7579, arrondissement: 'Douala V', quartier: 'Makepe' }, status: 'RESOLVED', assignedServiceId: 'srv_gendarmerie_d3', resolvedAt: new Date(Date.now() - 7200000).toISOString(), createdAt: new Date(Date.now() - 10800000).toISOString() },
    { id: 'sos_4', userId: 'c33', location: { lat: 4.0411, lng: 9.7479, arrondissement: 'Douala II', quartier: 'New Bell' }, status: 'ACTIVE', createdAt: new Date(Date.now() - 900000).toISOString() },
    { id: 'sos_5', userId: 'c20', location: { lat: 4.0611, lng: 9.7779, arrondissement: 'Douala I', quartier: 'Bonanjo' }, status: 'RESOLVED', assignedServiceId: 'srv_police_d2', resolvedAt: new Date(Date.now() - 43200000).toISOString(), createdAt: new Date(Date.now() - 86400000).toISOString() },
  ];
  await db.sosAlerts.bulkAdd(sosAlerts);

  // 11. Create Notifications
  const notifications: Notification[] = [];
  users.forEach(u => {
    notifications.push({
      id: `notif_${u.id}_1`,
      userId: u.id,
      title: 'Bienvenue sur SIGDU',
      message: 'Votre compte a été créé avec succès.',
      read: false,
      createdAt: new Date(Date.now() - 86400000).toISOString()
    });
    if (u.role === 'AGENT') {
      notifications.push({
        id: `notif_${u.id}_2`,
        userId: u.id,
        title: 'Nouvelle affectation',
        message: 'Un nouveau dossier vous a été assigné pour enquête.',
        read: false,
        createdAt: new Date().toISOString(),
        link: '/agent/affectations'
      });
    }
  });
  await db.notifications.bulkAdd(notifications);

  // Mark seed as done for this version
  localStorage.setItem('sigdu_seed_version', DB_SEED_VERSION);
  console.log("Database seeded successfully at version:", DB_SEED_VERSION);
};

export const resetDatabase = async () => {
  localStorage.removeItem('sigdu_seed_version');
  await db.users.clear();
  await db.incidents.clear();
  await db.alerts.clear();
  await db.organizations.clear();
  await db.services.clear();
  await db.observations.clear();
  await db.timelineEvents.clear();
  await db.watchers.clear();
  await db.newsFeed.clear();
  await db.rumors.clear();
  await db.sosAlerts.clear();
  await db.notifications.clear();
  await seedDatabase();
};
