// =====================================================
// SIGDU - Script de seeding MongoDB complet
// Toutes les collections : users, incidents, observations,
// sos, alerts, news, rumors, watchers, notifications, timeline
// =====================================================
// Commande : mongosh "mongodb://localhost:27017/sigdu" mongo_seeder.js
// =====================================================

db = db.getSiblingDB('sigdu');

print("=== SIGDU SEEDER ===");
print("Nettoyage de la base de données...");
db.dropDatabase();
db = db.getSiblingDB('sigdu');

const now = Date.now();
const DAY = 86400000;
const HOUR = 3600000;
const MIN = 60000;

// =====================================================
// 1. ORGANIZATIONS
// =====================================================
print("1/12 Insertion des organisations...");

const orgPolice = ObjectId();
const orgGendarmerie = ObjectId();
const orgMairie = ObjectId();

db.organizations.insertMany([
  { _id: orgPolice, name: "Police Nationale", type: "POLICE", createdAt: new Date(now - 90 * DAY) },
  { _id: orgGendarmerie, name: "Gendarmerie Nationale", type: "GENDARMERIE", createdAt: new Date(now - 90 * DAY) },
  { _id: orgMairie, name: "Mairie de Douala", type: "MAIRIE", createdAt: new Date(now - 90 * DAY) }
]);

// =====================================================
// 2. SERVICES
// =====================================================
print("2/12 Insertion des services...");

const srvCD1 = ObjectId();
const srvCD2 = ObjectId();
const srvCD3 = ObjectId();
const srvCD4 = ObjectId();
const srvCD5 = ObjectId();
const srvGend3 = ObjectId();
const srvGend4 = ObjectId();
const srvMairie = ObjectId();

db.services.insertMany([
  { _id: srvCD1, organizationId: orgPolice, name: "Commissariat Central Douala I", arrondissement: "Douala I", location: { lat: 4.0411, lng: 9.7079, address: "Bonanjo", arrondissement: "Douala I" }, createdAt: new Date(now - 90 * DAY) },
  { _id: srvCD2, organizationId: orgPolice, name: "Commissariat Central Douala II", arrondissement: "Douala II", location: { lat: 4.0211, lng: 9.7279, address: "New Bell", arrondissement: "Douala II" }, createdAt: new Date(now - 90 * DAY) },
  { _id: srvCD3, organizationId: orgPolice, name: "Commissariat Central Douala III", arrondissement: "Douala III", location: { lat: 4.0711, lng: 9.7879, address: "Logbaba", arrondissement: "Douala III" }, createdAt: new Date(now - 90 * DAY) },
  { _id: srvCD4, organizationId: orgPolice, name: "Commissariat Central Douala IV", arrondissement: "Douala IV", location: { lat: 4.0611, lng: 9.7479, address: "Bonaberi", arrondissement: "Douala IV" }, createdAt: new Date(now - 90 * DAY) },
  { _id: srvCD5, organizationId: orgPolice, name: "Commissariat Central Douala V", arrondissement: "Douala V", location: { lat: 4.0811, lng: 9.7579, address: "Makepe", arrondissement: "Douala V" }, createdAt: new Date(now - 90 * DAY) },
  { _id: srvGend3, organizationId: orgGendarmerie, name: "Brigade Territoriale Douala III", arrondissement: "Douala III", location: { lat: 4.0750, lng: 9.7900, address: "Logbaba Centre", arrondissement: "Douala III" }, createdAt: new Date(now - 90 * DAY) },
  { _id: srvGend4, organizationId: orgGendarmerie, name: "Brigade Territoriale Douala IV", arrondissement: "Douala IV", location: { lat: 4.0650, lng: 9.7500, address: "Bonaberi Nord", arrondissement: "Douala IV" }, createdAt: new Date(now - 90 * DAY) },
  { _id: srvMairie, organizationId: orgMairie, name: "Centre de Supervision Urbain", arrondissement: "Douala I", location: { lat: 4.0511, lng: 9.7679, address: "Bonanjo", arrondissement: "Douala I" }, createdAt: new Date(now - 90 * DAY) }
]);

// =====================================================
// 3. UTILISATEURS
// =====================================================
print("3/12 Insertion des utilisateurs...");

const adminId = ObjectId();
const supD1 = ObjectId();
const supD2 = ObjectId();
const supD3 = ObjectId();
const agent1 = ObjectId();
const agent2 = ObjectId();
const agent3 = ObjectId();
const agent4 = ObjectId();
const agent5 = ObjectId();
const agent6 = ObjectId();
const cit1 = ObjectId();
const cit2 = ObjectId();
const cit3 = ObjectId();
const cit4 = ObjectId();
const cit5 = ObjectId();
const cit6 = ObjectId();
const cit7 = ObjectId();
const cit8 = ObjectId();

db.users.insertMany([
  // --- ADMIN ---
  { _id: adminId, email: "admin@sigdu.cm", name: "Admin Principal", firstName: "Admin", phone: "699 000 001", nationality: "Camerounaise", age: 42, role: "ADMIN", createdAt: new Date(now - 90 * DAY) },
  // --- SUPERVISEURS ---
  { _id: supD1, email: "superviseur@sigdu.cm", name: "Marie Superviseur", firstName: "Marie", phone: "699 000 010", nationality: "Camerounaise", age: 38, role: "SUPERVISEUR", organizationId: orgPolice, serviceId: srvCD1, createdAt: new Date(now - 85 * DAY) },
  { _id: supD2, email: "sup.douala2@sigdu.cm", name: "Pierre Ndjock", firstName: "Pierre", phone: "699 000 011", nationality: "Camerounaise", age: 41, role: "SUPERVISEUR", organizationId: orgPolice, serviceId: srvCD2, createdAt: new Date(now - 80 * DAY) },
  { _id: supD3, email: "sup.douala3@sigdu.cm", name: "Aimée Bella", firstName: "Aimée", phone: "699 000 012", nationality: "Camerounaise", age: 35, role: "SUPERVISEUR", organizationId: orgGendarmerie, serviceId: srvGend3, createdAt: new Date(now - 75 * DAY) },
  // --- AGENTS ---
  { _id: agent1, email: "agent@sigdu.cm", name: "Paul Agent", firstName: "Paul", phone: "698 000 001", nationality: "Camerounaise", age: 30, role: "AGENT", organizationId: orgPolice, serviceId: srvCD1, createdAt: new Date(now - 80 * DAY) },
  { _id: agent2, email: "agent2@sigdu.cm", name: "Luc Mbarga", firstName: "Luc", phone: "698 000 002", nationality: "Camerounaise", age: 27, role: "AGENT", organizationId: orgPolice, serviceId: srvCD1, createdAt: new Date(now - 78 * DAY) },
  { _id: agent3, email: "agent3@sigdu.cm", name: "Carine Fouda", firstName: "Carine", phone: "698 000 003", nationality: "Camerounaise", age: 29, role: "AGENT", organizationId: orgPolice, serviceId: srvCD2, createdAt: new Date(now - 75 * DAY) },
  { _id: agent4, email: "agent4@sigdu.cm", name: "Jacques Kamga", firstName: "Jacques", phone: "698 000 004", nationality: "Camerounaise", age: 33, role: "AGENT", organizationId: orgGendarmerie, serviceId: srvGend3, createdAt: new Date(now - 70 * DAY) },
  { _id: agent5, email: "agent5@sigdu.cm", name: "Sandrine Ngono", firstName: "Sandrine", phone: "698 000 005", nationality: "Camerounaise", age: 26, role: "AGENT", organizationId: orgPolice, serviceId: srvCD3, createdAt: new Date(now - 65 * DAY) },
  { _id: agent6, email: "agent6@sigdu.cm", name: "Emmanuel Tchinda", firstName: "Emmanuel", phone: "698 000 006", nationality: "Camerounaise", age: 31, role: "AGENT", organizationId: orgPolice, serviceId: srvCD5, createdAt: new Date(now - 60 * DAY) },
  // --- CITOYENS ---
  { _id: cit1, email: "citoyen@sigdu.cm", name: "Jean Citoyen", firstName: "Jean", phone: "699 123 456", nationality: "Camerounaise", age: 32, role: "CITOYEN", createdAt: new Date(now - 70 * DAY) },
  { _id: cit2, email: "fatima@sigdu.cm", name: "Fatima Bello", firstName: "Fatima", phone: "699 234 567", nationality: "Camerounaise", age: 28, role: "CITOYEN", createdAt: new Date(now - 65 * DAY) },
  { _id: cit3, email: "georges@sigdu.cm", name: "Georges Kamga", firstName: "Georges", phone: "699 345 678", nationality: "Camerounaise", age: 45, role: "CITOYEN", createdAt: new Date(now - 60 * DAY) },
  { _id: cit4, email: "christelle@sigdu.cm", name: "Christelle Bella", firstName: "Christelle", phone: "699 456 789", nationality: "Camerounaise", age: 24, role: "CITOYEN", createdAt: new Date(now - 55 * DAY) },
  { _id: cit5, email: "patrick@sigdu.cm", name: "Patrick Ndongo", firstName: "Patrick", phone: "699 567 890", nationality: "Camerounaise", age: 37, role: "CITOYEN", createdAt: new Date(now - 50 * DAY) },
  { _id: cit6, email: "sylvie@sigdu.cm", name: "Sylvie Mvondo", firstName: "Sylvie", phone: "699 678 901", nationality: "Camerounaise", age: 31, role: "CITOYEN", createdAt: new Date(now - 45 * DAY) },
  { _id: cit7, email: "blaise@sigdu.cm", name: "Blaise Essomba", firstName: "Blaise", phone: "699 789 012", nationality: "Camerounaise", age: 52, role: "CITOYEN", createdAt: new Date(now - 40 * DAY) },
  { _id: cit8, email: "helene@sigdu.cm", name: "Hélène Atangana", firstName: "Hélène", phone: "699 890 123", nationality: "Camerounaise", age: 29, role: "CITOYEN", createdAt: new Date(now - 35 * DAY) }
]);

// =====================================================
// 4. WATCHERS (Citoyens veilleurs)
// =====================================================
print("4/12 Insertion des veilleurs...");

db.watchers.insertMany([
  { userId: cit3.valueOf(), arrondissements: ["Douala I", "Douala II"], favoriteQuartiers: ["Akwa", "Bonanjo", "New Bell"], active: true },
  { userId: cit5.valueOf(), arrondissements: ["Douala III", "Douala IV"], favoriteQuartiers: ["Logbaba", "PK8", "Bonaberi"], active: true },
  { userId: cit7.valueOf(), arrondissements: ["Douala V"], favoriteQuartiers: ["Makepe", "Bépanda"], active: false }
]);

// =====================================================
// 5. INCIDENTS (Signalements)
// =====================================================
print("5/12 Insertion des incidents...");

const inc1 = ObjectId();
const inc2 = ObjectId();
const inc3 = ObjectId();
const inc4 = ObjectId();
const inc5 = ObjectId();
const inc6 = ObjectId();
const inc7 = ObjectId();
const inc8 = ObjectId();
const inc9 = ObjectId();
const inc10 = ObjectId();
const inc11 = ObjectId();
const inc12 = ObjectId();
const inc13 = ObjectId();
const inc14 = ObjectId();
const inc15 = ObjectId();

db.incidents.insertMany([
  // --- NOUVEAU (en attente de validation) ---
  {
    _id: inc1, type: "DISPARITION", personAge: "ADULTE", status: "NOUVEAU",
    title: "Disparition adulte - Marché Central",
    description: "Homme de 35 ans parti au marché central hier matin et jamais revenu. Famille en état de panique. Dernière tenue : chemise blanche, pantalon jean.",
    location: { lat: 4.0511, lng: 9.7679, address: "Marché Central", arrondissement: "Douala I", quartier: "Akwa" },
    photos: [], reportedBy: cit1.valueOf(), createdAt: new Date(now - 2 * HOUR), updatedAt: new Date(now - 2 * HOUR)
  },
  {
    _id: inc2, type: "FUGUE", personAge: "ENFANT_MINEUR", status: "NOUVEAU",
    title: "Fugue adolescent - Akwa",
    description: "Adolescente de 14 ans partie de chez elle ce matin sans prévenir. Note laissée : 'Ne me cherchez pas'. Uniforme scolaire bleu.",
    location: { lat: 4.0523, lng: 9.7315, address: "Rue de la Joie", arrondissement: "Douala I", quartier: "Akwa" },
    photos: [], reportedBy: cit2.valueOf(), createdAt: new Date(now - 3 * HOUR), updatedAt: new Date(now - 3 * HOUR)
  },
  {
    _id: inc3, type: "ENLEVEMENT", personAge: "ENFANT_MINEUR", status: "NOUVEAU",
    title: "Enlèvement suspect - New Bell",
    description: "Témoin a vu un enfant de 7 ans tiré dans un véhicule blanc non identifié près de l'école primaire. Plaque partiellement lue : DW-4521.",
    location: { lat: 4.0398, lng: 9.7456, address: "École Primaire New Bell", arrondissement: "Douala II", quartier: "New Bell" },
    photos: [], reportedBy: cit4.valueOf(), createdAt: new Date(now - 45 * MIN), updatedAt: new Date(now - 45 * MIN)
  },
  {
    _id: inc4, type: "TROUBLE_COGNITIF", personAge: "PERSONNE_AGEE", status: "NOUVEAU",
    title: "Personne désorientée - Bonanjo",
    description: "Homme d'environ 70 ans trouvé errant près de la mairie. Ne se souvient plus de son nom. Porte un pull bleu marine et un chapeau gris.",
    location: { lat: 4.0456, lng: 9.6978, address: "Face à la Mairie", arrondissement: "Douala I", quartier: "Bonanjo" },
    photos: [], reportedBy: cit6.valueOf(), createdAt: new Date(now - 5 * HOUR), updatedAt: new Date(now - 5 * HOUR)
  },

  // --- EN_VERIFICATION (validé par superviseur) ---
  {
    _id: inc5, type: "DISPARITION", personAge: "ADULTE", status: "EN_VERIFICATION",
    title: "Disparition inquiétante - Makepe",
    description: "Femme de 28 ans disparue depuis 2 jours. Dernière localisation connue : carrefour Makepe. Son téléphone est éteint.",
    location: { lat: 4.0811, lng: 9.7579, address: "Carrefour Makepe", arrondissement: "Douala V", quartier: "Makepe" },
    photos: [], reportedBy: cit1.valueOf(),
    assignedServiceId: srvCD5.valueOf(),
    createdAt: new Date(now - 2 * DAY), updatedAt: new Date(now - 1 * DAY)
  },
  {
    _id: inc6, type: "ENLEVEMENT", personAge: "ENFANT_MINEUR", status: "EN_VERIFICATION",
    title: "Enlèvement confirmé - Bépanda",
    description: "Enlèvement confirmé par les caméras de surveillance. Véhicule noir repéré. Recherche active en cours.",
    location: { lat: 4.0811, lng: 9.7479, address: "Terrain de sport Bépanda", arrondissement: "Douala V", quartier: "Bépanda" },
    photos: [], reportedBy: cit2.valueOf(),
    assignedServiceId: srvCD5.valueOf(),
    createdAt: new Date(now - 3 * DAY), updatedAt: new Date(now - 2 * DAY)
  },

  // --- DISPARITION_CONFIRMEE ---
  {
    _id: inc7, type: "DISPARITION", personAge: "ADULTE", status: "DISPARITION_CONFIRMEE",
    title: "Disparition confirmée - PK8",
    description: "Disparition confirmée. Dernière trace au carrefour PK8. Patrouilles déployées dans le secteur.",
    location: { lat: 4.0711, lng: 9.7979, address: "Carrefour PK8", arrondissement: "Douala III", quartier: "PK8" },
    photos: [], reportedBy: cit3.valueOf(),
    assignedServiceId: srvCD3.valueOf(), assignedTo: agent1.valueOf(),
    createdAt: new Date(now - 5 * DAY), updatedAt: new Date(now - 3 * DAY)
  },

  // --- ENQUETE_EN_COURS ---
  {
    _id: inc8, type: "ENLEVEMENT", personAge: "ENFANT_MINEUR", status: "ENQUETE_EN_COURS",
    title: "Enquête en cours - Douan",
    description: "Enlèvement avéré. Plusieurs témoins interrogés. Le véhicule suspect a été repéré vers Douan.",
    location: { lat: 4.0450, lng: 9.7100, address: "Carrefour Douan", arrondissement: "Douala I", quartier: "Douan" },
    photos: [], reportedBy: cit4.valueOf(),
    assignedServiceId: srvCD1.valueOf(), assignedTo: agent1.valueOf(),
    createdAt: new Date(now - 7 * DAY), updatedAt: new Date(now - 1 * DAY)
  },
  {
    _id: inc9, type: "ACCIDENT_SUSPECT", status: "ENQUETE_EN_COURS",
    title: "Accident suspect - Bonanjo",
    description: "Véhicule renversant un piéton puis prenant la fuite. Plaque partiellement relevée : DK-... . Enquête de voisinage en cours.",
    location: { lat: 4.0611, lng: 9.7779, address: "Boulevard de la République", arrondissement: "Douala I", quartier: "Bonanjo" },
    photos: [], reportedBy: cit5.valueOf(),
    assignedServiceId: srvCD1.valueOf(), assignedTo: agent2.valueOf(),
    createdAt: new Date(now - 4 * DAY), updatedAt: new Date(now - 2 * DAY)
  },

  // --- RECHERCHE ---
  {
    _id: inc10, type: "FUGUE", personAge: "ENFANT_MINEUR", status: "RECHERCHE",
    title: "Recherche en cours - Logbaba",
    description: "Adolescent de 16 ans en fuite depuis 5 jours. Dernière trace chez un ami à Logbaba.",
    location: { lat: 4.0711, lng: 9.7879, address: "Quartier Logbaba", arrondissement: "Douala III", quartier: "Logbaba" },
    photos: [], reportedBy: cit6.valueOf(),
    assignedServiceId: srvCD3.valueOf(), assignedTo: agent4.valueOf(),
    createdAt: new Date(now - 5 * DAY), updatedAt: new Date(now - 1 * DAY)
  },

  // --- LOCALISE ---
  {
    _id: inc11, type: "TROUBLE_COGNITIF", personAge: "PERSONNE_AGEE", status: "LOCALISE",
    title: "Personne localisée - Douala II",
    description: "Personne désorientée localisée grâce à une observation citoyenne. En attente de récupération par la famille.",
    location: { lat: 4.0411, lng: 9.7479, address: "Boulevard de la République", arrondissement: "Douala II", quartier: "New Bell" },
    photos: [], reportedBy: cit7.valueOf(),
    assignedServiceId: srvCD2.valueOf(), assignedTo: agent3.valueOf(),
    createdAt: new Date(now - 6 * DAY), updatedAt: new Date(now - 12 * HOUR)
  },

  // --- RETROUVE ---
  {
    _id: inc12, type: "DISPARITION", personAge: "ENFANT_MINEUR", status: "RETROUVE",
    title: "Enfant retrouvé sain et sauf - Akwa",
    description: "Enfant de 9 ans retrouvé chez un voisin à Akwa. Il s'était caché par jeu. Remis à ses parents.",
    location: { lat: 4.0523, lng: 9.7315, address: "Quartier Akwa", arrondissement: "Douala I", quartier: "Akwa" },
    photos: [], reportedBy: cit2.valueOf(),
    assignedServiceId: srvCD1.valueOf(), assignedTo: agent1.valueOf(),
    createdAt: new Date(now - 8 * DAY), updatedAt: new Date(now - 1 * DAY)
  },

  // --- CLOTURE ---
  {
    _id: inc13, type: "ENLEVEMENT", personAge: "ENFANT_MINEUR", status: "CLOTURE",
    title: "Dossier clos - Enlèvement classé",
    description: "Enquête terminée. Preuves insuffantes. Classé sans suite par le procureur.",
    location: { lat: 4.0611, lng: 9.7479, address: "Bonaberi", arrondissement: "Douala IV", quartier: "Bonaberi" },
    photos: [], reportedBy: cit8.valueOf(),
    assignedServiceId: srvCD4.valueOf(), assignedTo: agent3.valueOf(),
    createdAt: new Date(now - 15 * DAY), updatedAt: new Date(now - 5 * DAY)
  },

  // --- FAUSSE_ALERTE ---
  {
    _id: inc14, type: "AUTRE", status: "FAUSSE_ALERTE",
    title: "Fausse alerte - Canular",
    description: "Signalement jugé infondé après vérification. Il s'agissait d'un canular.",
    location: { lat: 4.0511, lng: 9.7679, address: "Centre-ville", arrondissement: "Douala I", quartier: "Akwa" },
    photos: [], reportedBy: cit1.valueOf(),
    createdAt: new Date(now - 10 * DAY), updatedAt: new Date(now - 9 * DAY)
  },

  // --- ALERTE_CRITIQUE ---
  {
    _id: inc15, type: "ENLEVEMENT", personAge: "ENFANT_MINEUR", status: "ALERTE_CRITIQUE",
    title: "ALERTE CRITIQUE - Enlèvement multiple",
    description: "Plusieurs enfants enlevés dans la même zone. Possible réseau organisé. Vigilance maximale demandée.",
    location: { lat: 4.0398, lng: 9.7456, address: "Zone New Bell - Akwa", arrondissement: "Douala II", quartier: "New Bell" },
    photos: [], reportedBy: cit4.valueOf(),
    assignedServiceId: srvCD2.valueOf(), assignedTo: agent3.valueOf(),
    createdAt: new Date(now - 6 * HOUR), updatedAt: new Date(now - 1 * HOUR)
  }
]);

// =====================================================
// 6. TIMELINE EVENTS
// =====================================================
print("6/12 Insertion des événements de chronologie...");

db.timelineEvents.insertMany([
  // --- inc1 (NOUVEAU) ---
  { incidentId: inc1.valueOf(), actionType: "CREATION", description: "Signalement créé par Jean Citoyen via l'application SIGDU.", visibility: "PUBLIC", createdBy: cit1.valueOf(), createdAt: new Date(now - 2 * HOUR) },

  // --- inc2 (NOUVEAU) ---
  { incidentId: inc2.valueOf(), actionType: "CREATION", description: "Fugue signalée par Fatima Bello.", visibility: "PUBLIC", createdBy: cit2.valueOf(), createdAt: new Date(now - 3 * HOUR) },

  // --- inc3 (NOUVEAU) ---
  { incidentId: inc3.valueOf(), actionType: "CREATION", description: "Signalement d'enlèvement suspect créé.", visibility: "PUBLIC", createdBy: cit4.valueOf(), createdAt: new Date(now - 45 * MIN) },

  // --- inc5 (EN_VERIFICATION) ---
  { incidentId: inc5.valueOf(), actionType: "CREATION", description: "Signalement créé.", visibility: "PUBLIC", createdBy: cit1.valueOf(), createdAt: new Date(now - 2 * DAY) },
  { incidentId: inc5.valueOf(), actionType: "VALIDATION", description: "Dossier validé par le superviseur Marie.", visibility: "PUBLIC", createdBy: supD1.valueOf(), createdAt: new Date(now - 1.5 * DAY) },
  { incidentId: inc5.valueOf(), actionType: "AFFECTATION", description: "Dossier affecté au Commissariat Central Douala V.", visibility: "INTERNAL", createdBy: supD1.valueOf(), createdAt: new Date(now - 1.5 * DAY) },

  // --- inc7 (DISPARITION_CONFIRMEE) ---
  { incidentId: inc7.valueOf(), actionType: "CREATION", description: "Signalement créé.", visibility: "PUBLIC", createdBy: cit3.valueOf(), createdAt: new Date(now - 5 * DAY) },
  { incidentId: inc7.valueOf(), actionType: "VALIDATION", description: "Dossier validé et mis en vérification.", visibility: "PUBLIC", createdBy: supD1.valueOf(), createdAt: new Date(now - 4.5 * DAY) },
  { incidentId: inc7.valueOf(), actionType: "AFFECTATION", description: "Dossier affecté au Commissariat Central Douala III.", visibility: "INTERNAL", createdBy: supD3.valueOf(), createdAt: new Date(now - 4 * DAY) },
  { incidentId: inc7.valueOf(), actionType: "ASSIGNMENT", description: "Dossier assigné à l'agent Paul.", visibility: "INTERNAL", createdBy: supD1.valueOf(), createdAt: new Date(now - 4 * DAY) },
  { incidentId: inc7.valueOf(), actionType: "STATUS_CHANGE", description: "Disparition confirmée par les enquêteurs.", visibility: "PUBLIC", createdBy: agent1.valueOf(), createdAt: new Date(now - 3 * DAY) },
  { incidentId: inc7.valueOf(), actionType: "OBSERVATION", description: "Enquête de voisinage : 3 témoins interrogés. Dernière vue vers 18h.", visibility: "INTERNAL", createdBy: agent1.valueOf(), createdAt: new Date(now - 3 * DAY) },

  // --- inc8 (ENQUETE_EN_COURS) ---
  { incidentId: inc8.valueOf(), actionType: "CREATION", description: "Signalement créé.", visibility: "PUBLIC", createdBy: cit4.valueOf(), createdAt: new Date(now - 7 * DAY) },
  { incidentId: inc8.valueOf(), actionType: "VALIDATION", description: "Dossier validé.", visibility: "PUBLIC", createdBy: supD1.valueOf(), createdAt: new Date(now - 6.5 * DAY) },
  { incidentId: inc8.valueOf(), actionType: "AFFECTATION", description: "Affecté au Commissariat Central Douala I.", visibility: "INTERNAL", createdBy: supD1.valueOf(), createdAt: new Date(now - 6 * DAY) },
  { incidentId: inc8.valueOf(), actionType: "ASSIGNMENT", description: "Assigné à l'agent Paul.", visibility: "INTERNAL", createdBy: supD1.valueOf(), createdAt: new Date(now - 6 * DAY) },
  { incidentId: inc8.valueOf(), actionType: "STATUS_CHANGE", description: "Enlèvement confirmé. Enquête en cours.", visibility: "PUBLIC", createdBy: agent1.valueOf(), createdAt: new Date(now - 5 * DAY) },
  { incidentId: inc8.valueOf(), actionType: "OBSERVATION", description: "Caméras de surveillance analysées. Véhicule suspect filmé.", visibility: "INTERNAL", createdBy: agent1.valueOf(), createdAt: new Date(now - 4 * DAY) },
  { incidentId: inc8.valueOf(), actionType: "OBSERVATION", description: "2 nouveaux témoins auditionnés. Piste vers Douan.", visibility: "INTERNAL", createdBy: agent2.valueOf(), createdAt: new Date(now - 1 * DAY) },

  // --- inc9 (ENQUETE_EN_COURS) ---
  { incidentId: inc9.valueOf(), actionType: "CREATION", description: "Accident suspect signalé.", visibility: "PUBLIC", createdBy: cit5.valueOf(), createdAt: new Date(now - 4 * DAY) },
  { incidentId: inc9.valueOf(), actionType: "VALIDATION", description: "Dossier validé.", visibility: "PUBLIC", createdBy: supD1.valueOf(), createdAt: new Date(now - 3.5 * DAY) },
  { incidentId: inc9.valueOf(), actionType: "OBSERVATION", description: "Enquête de voisinage : 2 témoins ont vu le véhicule. Couleur foncée, SUV.", visibility: "INTERNAL", createdBy: agent2.valueOf(), createdAt: new Date(now - 2 * DAY) },

  // --- inc11 (LOCALISE) ---
  { incidentId: inc11.valueOf(), actionType: "CREATION", description: "Signalement créé.", visibility: "PUBLIC", createdBy: cit7.valueOf(), createdAt: new Date(now - 6 * DAY) },
  { incidentId: inc11.valueOf(), actionType: "VALIDATION", description: "Dossier validé.", visibility: "PUBLIC", createdBy: supD2.valueOf(), createdAt: new Date(now - 5.5 * DAY) },
  { incidentId: inc11.valueOf(), actionType: "OBSERVATION", description: "Observation citoyenne reçue : personne correspondante vue au boulevard.", visibility: "PUBLIC", createdBy: cit3.valueOf(), createdAt: new Date(now - 2 * DAY) },
  { incidentId: inc11.valueOf(), actionType: "STATUS_CHANGE", description: "Personne localisée grâce à l'observation citoyenne.", visibility: "PUBLIC", createdBy: agent3.valueOf(), createdAt: new Date(now - 12 * HOUR) },

  // --- inc12 (RETROUVE) ---
  { incidentId: inc12.valueOf(), actionType: "CREATION", description: "Signalement créé.", visibility: "PUBLIC", createdBy: cit2.valueOf(), createdAt: new Date(now - 8 * DAY) },
  { incidentId: inc12.valueOf(), actionType: "VALIDATION", description: "Dossier validé.", visibility: "PUBLIC", createdBy: supD1.valueOf(), createdAt: new Date(now - 7.5 * DAY) },
  { incidentId: inc12.valueOf(), actionType: "STATUS_CHANGE", description: "Enfant retrouvé sain et sauf.", visibility: "PUBLIC", createdBy: agent1.valueOf(), createdAt: new Date(now - 1 * DAY) },

  // --- inc15 (ALERTE_CRITIQUE) ---
  { incidentId: inc15.valueOf(), actionType: "CREATION", description: "Signalement d'enlèvement multiple créé.", visibility: "PUBLIC", createdBy: cit4.valueOf(), createdAt: new Date(now - 6 * HOUR) },
  { incidentId: inc15.valueOf(), actionType: "VALIDATION", description: "ALERTÉE CRITIQUE validée en urgence.", visibility: "PUBLIC", createdBy: supD2.valueOf(), createdAt: new Date(now - 5 * HOUR) },
  { incidentId: inc15.valueOf(), actionType: "STATUS_CHANGE", description: "ALERTE CRITIQUE activée. Toutes les unités mobilisées.", visibility: "PUBLIC", createdBy: supD2.valueOf(), createdAt: new Date(now - 5 * HOUR) },
  { incidentId: inc15.valueOf(), actionType: "OBSERVATION", description: "Premier témoignage : 2 véhicules suspects repérés dans la zone.", visibility: "INTERNAL", createdBy: agent3.valueOf(), createdAt: new Date(now - 3 * HOUR) }
]);

// =====================================================
// 7. OBSERVATIONS
// =====================================================
print("7/12 Insertion des observations...");

db.observations.insertMany([
  {
    type: "PERSONNE_CORRESPONDANTE", incidentId: inc1.valueOf(),
    description: "J'ai vu une personne correspondant à la description sur le marché central. Elle portait un t-shirt bleu et semblait confuse.",
    location: { lat: 4.0511, lng: 9.7679, arrondissement: "Douala I", quartier: "Akwa" },
    photos: [], reportedBy: cit2.valueOf(), aiSimilarityScore: 78, status: "NOUVEAU", createdAt: new Date(now - 1 * HOUR)
  },
  {
    type: "ENFANT_SEUL",
    description: "Un enfant seul pleure près de l'arrêt de bus à Logbaba. Il semble perdu et ne répond pas aux questions.",
    location: { lat: 4.0711, lng: 9.7879, arrondissement: "Douala III", quartier: "Logbaba" },
    photos: [], reportedBy: cit5.valueOf(), aiSimilarityScore: 65, status: "NOUVEAU", createdAt: new Date(now - 3 * HOUR)
  },
  {
    type: "VEHICULE_SUSPECT", incidentId: inc3.valueOf(),
    description: "Fourgon blanc sans plaques garé depuis 2h près de l'école primaire de Makepe. Le conducteur filmait les enfants.",
    location: { lat: 4.0811, lng: 9.7579, arrondissement: "Douala V", quartier: "Makepe" },
    photos: [], reportedBy: cit3.valueOf(), aiSimilarityScore: 42, status: "NOUVEAU", createdAt: new Date(now - 4 * HOUR)
  },
  {
    type: "PERSONNE_DESORIENTEE", incidentId: inc4.valueOf(),
    description: "Une femme âgée marche en titubant sur le boulevard. Elle semble ne pas savoir où elle est.",
    location: { lat: 4.0411, lng: 9.7479, arrondissement: "Douala II", quartier: "New Bell" },
    photos: [], reportedBy: cit6.valueOf(), aiSimilarityScore: 88, status: "PERTINENT", createdAt: new Date(now - 8 * HOUR)
  },
  {
    type: "COMPORTEMENT_INQUIETANT",
    description: "Un homme observe les enfants sortant de l'école pendant 30 minutes. Il a été remarqué plusieurs fois cette semaine.",
    location: { lat: 4.0611, lng: 9.7779, arrondissement: "Douala I", quartier: "Bonanjo" },
    photos: [], reportedBy: cit8.valueOf(), status: "REJETE", createdAt: new Date(now - 2 * DAY)
  },
  {
    type: "PERSONNE_CORRESPONDANTE", incidentId: inc11.valueOf(),
    description: "Ressemblance frappante avec la photo sur l'affiche. La personne se trouve au carrefour PK8.",
    location: { lat: 4.0711, lng: 9.7979, arrondissement: "Douala III", quartier: "PK8" },
    photos: [], reportedBy: cit7.valueOf(), aiSimilarityScore: 91, status: "TRAITE", createdAt: new Date(now - 3 * DAY)
  },
  {
    type: "ENFANT_SEUL",
    description: "Un garçon d'environ 10 ans errait seul près du marché Central. Pas d'adulte en vue.",
    location: { lat: 4.0511, lng: 9.7679, arrondissement: "Douala I", quartier: "Koumassi" },
    photos: [], reportedBy: cit1.valueOf(), status: "NOUVEAU", createdAt: new Date(now - 2 * HOUR)
  },
  {
    type: "VEHICULE_SUSPECT", incidentId: inc15.valueOf(),
    description: "Taxi jaune stationné de façon suspecte près du terrain de sport de Bépanda. Le chauffeur discute avec des enfants.",
    location: { lat: 4.0811, lng: 9.7479, arrondissement: "Douala V", quartier: "Bépanda" },
    photos: [], reportedBy: cit5.valueOf(), aiSimilarityScore: 55, status: "NOUVEAU", createdAt: new Date(now - 1 * HOUR)
  }
]);

// =====================================================
// 8. ALERTS
// =====================================================
print("8/12 Insertion des alertes...");

db.alerts.insertMany([
  { title: "Alerte Critique : Enlèvement multiple", message: "Plusieurs enfants enlevés dans la zone New Bell - Akwa. Vigilance maximale requise.", level: "CRITICAL", createdAt: new Date(now - 5 * HOUR) },
  { title: "Enlèvement confirmé - Bépanda", message: "Un enlèvement a été confirmé à Bépanda. Recherche active en cours.", level: "CRITICAL", createdAt: new Date(now - 3 * DAY) },
  { title: "Vigilance - Marché Central", message: "Plusieurs cas de disparition signalés autour du marché central cette semaine.", level: "WARNING", createdAt: new Date(now - 2 * DAY) },
  { title: "Personne désorientée localisée", message: "Une personne âgée désorientée a été localisée à New Bell. En attente de récupération.", level: "INFO", createdAt: new Date(now - 12 * HOUR) },
  { title: "Mise à jour SIGDU", message: "Nouvelles fonctionnalités disponibles : fil d'actualité, réseau de veilleurs.", level: "INFO", createdAt: new Date(now - 7 * DAY) }
]);

// =====================================================
// 9. NEWS FEED
// =====================================================
print("9/12 Insertion du fil d'actualité...");

db.newsFeed.insertMany([
  {
    type: "ALERT", title: "🚨 Alerte Enlèvement — New Bell",
    content: "Un enfant de 7 ans a été signalé disparu dans le quartier de New Bell ce matin. La Police Nationale lance un avis de recherche. Si vous avez des informations, contactez le 117.",
    authorId: supD2.valueOf(), createdAt: new Date(now - 5 * HOUR)
  },
  {
    type: "SUCCESS", title: "✅ Personne retrouvée — Douala II",
    content: "Grâce à la vigilance citoyenne et au réseau SIGDU, Mme Ndongo (72 ans) signalée désorientée hier soir a été retrouvée saine et sauve ce matin à New Bell.",
    authorId: supD1.valueOf(), createdAt: new Date(now - 12 * HOUR)
  },
  {
    type: "INFO", title: "📋 Campagne de sensibilisation",
    content: "La Mairie de Douala organise la Semaine de la Sécurité Urbaine du 1er au 7 juillet. Des ateliers gratuits sur les réflexes en cas de disparition seront proposés.",
    authorId: adminId.valueOf(), createdAt: new Date(now - 2 * DAY)
  },
  {
    type: "ALERT", title: "⚠️ Véhicule suspect signalé — Akwa",
    content: "Plusieurs témoins ont signalé un véhicule suspect (fourgon blanc sans plaques) circulant lentement à proximité des écoles du quartier Akwa Nord.",
    authorId: supD1.valueOf(), createdAt: new Date(now - 3 * DAY)
  },
  {
    type: "SUCCESS", title: "🎉 Bilan mensuel positif — Mai 2026",
    content: "Grâce au réseau SIGDU, 15 personnes ont été retrouvées en mai 2026. Le temps moyen de résolution est passé de 72h à 18h. Merci à tous les citoyens veilleurs !",
    authorId: adminId.valueOf(), createdAt: new Date(now - 7 * DAY)
  },
  {
    type: "INFO", title: "📱 Mise à jour SIGDU — Nouvelles fonctionnalités",
    content: "L'application SIGDU se dote de nouvelles fonctionnalités : fil d'actualité sécuritaire, vérification de rumeurs, et réseau de veilleurs citoyens.",
    authorId: adminId.valueOf(), createdAt: new Date(now - 10 * DAY)
  }
]);

// =====================================================
// 10. RUMORS (Rumeurs)
// =====================================================
print("10/12 Insertion des rumeurs...");

db.rumors.insertMany([
  {
    submittedBy: cit1.valueOf(),
    content: "Message WhatsApp circulant : 'Un gang kidnappe des enfants dans les taxis à Douala'. Source : capture d'écran groupe WhatsApp.",
    status: "VERIFIED_FALSE",
    officialResponse: "FAUX — La Police Nationale dément cette information. Aucun cas de ce type n'a été enregistré. Il s'agit d'un message recyclé.",
    createdAt: new Date(now - 2 * DAY)
  },
  {
    submittedBy: cit2.valueOf(),
    content: "On dit que 3 enfants ont disparu à Makepe cette semaine. C'est vrai ?",
    status: "VERIFIED_TRUE",
    officialResponse: "PARTIELLEMENT VRAI — Deux cas de fugue d'adolescents ont été signalés cette semaine à Makepe. Les deux mineurs ont été retrouvés.",
    createdAt: new Date(now - 3 * DAY)
  },
  {
    submittedBy: cit5.valueOf(),
    content: "J'ai entendu dire qu'une personne déguisée en agent de sécurité enlève des enfants à Bonaberi.",
    status: "PENDING", createdAt: new Date(now - 1 * DAY)
  },
  {
    submittedBy: cit3.valueOf(),
    content: "Il paraît que la police a retrouvé un réseau organisé de trafic d'enfants dans le quartier Ndogbong.",
    status: "PENDING", createdAt: new Date(now - 6 * HOUR)
  },
  {
    submittedBy: cit4.valueOf(),
    content: "Message Facebook : 'Ne laissez pas vos enfants seuls, 5 enlèvements à Douala V ce weekend'.",
    status: "VERIFIED_FALSE",
    officialResponse: "FAUX — Le Commissariat de Douala V n'a enregistré aucun signalement d'enlèvement ce weekend. Vérifiez toujours vos sources.",
    createdAt: new Date(now - 5 * DAY)
  },
  {
    submittedBy: cit6.valueOf(),
    content: "Un taxi a enlevé un enfant à Logbaba ce matin. Tout le monde en parle.",
    status: "PENDING", createdAt: new Date(now - 3 * HOUR)
  }
]);

// =====================================================
// 11. SOS ALERTS
// =====================================================
print("11/12 Insertion des alertes SOS...");

db.sosAlerts.insertMany([
  {
    userId: cit1.valueOf(),
    location: { lat: 4.0511, lng: 9.7679, arrondissement: "Douala I", quartier: "Akwa" },
    status: "ACTIVE", createdAt: new Date(now - 30 * MIN)
  },
  {
    userId: cit4.valueOf(),
    location: { lat: 4.0398, lng: 9.7456, arrondissement: "Douala II", quartier: "New Bell" },
    status: "ACTIVE", assignedServiceId: srvCD2.valueOf(),
    createdAt: new Date(now - 1 * HOUR)
  },
  {
    userId: cit5.valueOf(),
    location: { lat: 4.0811, lng: 9.7579, arrondissement: "Douala V", quartier: "Makepe" },
    status: "RESOLVED", assignedServiceId: srvCD5.valueOf(),
    resolvedAt: new Date(now - 2 * HOUR), createdAt: new Date(now - 3 * HOUR)
  },
  {
    userId: cit7.valueOf(),
    location: { lat: 4.0711, lng: 9.7879, arrondissement: "Douala III", quartier: "Logbaba" },
    status: "ACTIVE", createdAt: new Date(now - 15 * MIN)
  },
  {
    userId: cit8.valueOf(),
    location: { lat: 4.0611, lng: 9.7779, arrondissement: "Douala I", quartier: "Bonanjo" },
    status: "RESOLVED", assignedServiceId: srvCD1.valueOf(),
    resolvedAt: new Date(now - 8 * HOUR), createdAt: new Date(now - 10 * HOUR)
  }
]);

// =====================================================
// 12. NOTIFICATIONS
// =====================================================
print("12/12 Insertion des notifications...");

const allUsers = [adminId, supD1, supD2, supD3, agent1, agent2, agent3, agent4, agent5, agent6, cit1, cit2, cit3, cit4, cit5, cit6, cit7, cit8];
const notifications = [];

allUsers.forEach(u => {
  notifications.push({
    userId: u.valueOf(), title: "Bienvenue sur SIGDU",
    message: "Votre compte a été créé avec succès. Bienvenue dans le réseau de sécurité urbaine.",
    read: false, createdAt: new Date(now - 30 * DAY)
  });
});

// Notifications agents
[agent1, agent2, agent3, agent4, agent5, agent6].forEach(a => {
  notifications.push({
    userId: a.valueOf(), title: "Nouvelle affectation",
    message: "Un nouveau dossier vous a été assigné pour enquête. Consultez vos affectations.",
    read: false, createdAt: new Date(now - 1 * HOUR), link: "/agent/affectations"
  });
});

// Notifications superviseurs
[supD1, supD2, supD3].forEach(s => {
  notifications.push({
    userId: s.valueOf(), title: "Nouveaux signalements",
    message: "De nouveaux signalements sont en attente de validation.",
    read: false, createdAt: new Date(now - 30 * MIN), link: "/superviseur/validation"
  });
  notifications.push({
    userId: s.valueOf(), title: "Alerte SOS active",
    message: "Une alerte SOS est active dans votre zone. Intervention requise.",
    read: false, createdAt: new Date(now - 15 * MIN), link: "/superviseur/sos"
  });
});

// Notifications citoyens
[cit1, cit2, cit3, cit4, cit5, cit6, cit7, cit8].forEach(c => {
  notifications.push({
    userId: c.valueOf(), title: "Rappel veilleur",
    message: "Merci de votre vigilance ! N'hésitez pas à signaler toute observation suspecte.",
    read: true, createdAt: new Date(now - 5 * DAY)
  });
});

db.notifications.insertMany(notifications);

// =====================================================
// INDEX
// =====================================================
print("Création des index...");

db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.users.createIndex({ serviceId: 1 });
db.users.createIndex({ organizationId: 1 });

db.incidents.createIndex({ status: 1 });
db.incidents.createIndex({ reportedBy: 1 });
db.incidents.createIndex({ assignedTo: 1 });
db.incidents.createIndex({ assignedServiceId: 1 });
db.incidents.createIndex({ type: 1 });
db.incidents.createIndex({ "location.arrondissement": 1 });
db.incidents.createIndex({ createdAt: -1 });

db.timelineEvents.createIndex({ incidentId: 1 });
db.timelineEvents.createIndex({ createdAt: -1 });

db.observations.createIndex({ incidentId: 1 });
db.observations.createIndex({ status: 1 });

db.watchers.createIndex({ userId: 1 }, { unique: true });
db.watchers.createIndex({ arrondissements: 1 });

db.notifications.createIndex({ userId: 1, read: 1 });

db.sosAlerts.createIndex({ status: 1 });
db.sosAlerts.createIndex({ userId: 1 });

db.rumors.createIndex({ status: 1 });

// =====================================================
// RÉSUMÉ
// =====================================================
print("");
print("=== SEED TERMINÉ AVEC SUCCÈS ===");
print("Organisations : " + db.organizations.countDocuments());
print("Services     : " + db.services.countDocuments());
print("Utilisateurs : " + db.users.countDocuments());
print("Incidents    : " + db.incidents.countDocuments());
print("Timeline     : " + db.timelineEvents.countDocuments());
print("Observations : " + db.observations.countDocuments());
print("Alertes      : " + db.alerts.countDocuments());
print("News Feed    : " + db.newsFeed.countDocuments());
print("Rumeurs      : " + db.rumors.countDocuments());
print("SOS Alerts   : " + db.sosAlerts.countDocuments());
print("Notifications: " + db.notifications.countDocuments());
print("Veilleurs    : " + db.watchers.countDocuments());
print("=================================");
