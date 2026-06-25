import { db } from './database';
import { type User, type Incident, type Alert, type Organization, type Service, type IncidentType, type IncidentStatus, type NewsPost, type Rumor } from '../types';

const DOUALA_CENTER = { lat: 4.0511, lng: 9.7679 };

const generateRandomOffset = () => (Math.random() - 0.5) * 0.05; // roughly 5km radius

export const seedDatabase = async () => {
  // Check if DB is already seeded
  const userCount = await db.users.count();
  if (userCount > 0) {
    console.log("Database already seeded. Skipping.");
    return;
  }

  console.log("Seeding database with demo data...");

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
  const types: IncidentType[] = ['ENFANT_MINEUR', 'ADULTE', 'PERSONNE_AGEE', 'FUGUE', 'ENLEVEMENT', 'TROUBLE_COGNITIF', 'ACCIDENT_SUSPECT', 'RETROUVE', 'AUTRE'];
  const statuses: IncidentStatus[] = ['NOUVEAU', 'EN_VERIFICATION', 'DISPARITION_CONFIRMEE', 'ENQUETE_EN_COURS', 'LOCALISE', 'RETROUVE', 'CLOTURE'];
  const arrondissements = ['Douala I', 'Douala II', 'Douala III', 'Douala IV', 'Douala V'];
  const serviceIds = ['srv_police_d1', 'srv_police_d2', 'srv_gendarmerie_d3'];

  for (let i = 0; i < 100; i++) {
    let type: IncidentType = types[0];
    if (i >= 20 && i < 40) type = types[1];
    if (i >= 40 && i < 60) type = types[3]; // FUGUE
    if (i >= 60 && i < 80) type = types[4]; // ENLEVEMENT
    if (i >= 80) type = types[7]; // RETROUVE

    const status = statuses[Math.floor(Math.random() * statuses.length)];
    const arrondissement = arrondissements[i % 5];
    const assignedServiceId = status !== 'NOUVEAU' && status !== 'EN_VERIFICATION' ? serviceIds[i % 3] : undefined;

    incidents.push({
      id: `inc_${i}`,
      type,
      status,
      title: `${type.replace('_', ' ')} signalé dans ${arrondissement}`,
      description: `Description détaillée pour l'incident ${i}. Signalement important nécessitant une vérification.`,
      location: {
        lat: DOUALA_CENTER.lat + generateRandomOffset(),
        lng: DOUALA_CENTER.lng + generateRandomOffset(),
        arrondissement,
      },
      photos: [],
      reportedBy: 'u1',
      assignedServiceId,
      createdAt: new Date(Date.now() - Math.random() * 10000000000).toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  await db.incidents.bulkAdd(incidents);

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

  console.log("Database seeded successfully.");
};

export const resetDatabase = async () => {
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
  await seedDatabase();
};
