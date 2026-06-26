// Script d'insertion MongoDB pour SIGDU
// A exécuter dans mongosh (MongoDB Shell) ou via un script Node.js (mongoose/mongodb driver)
// Commande d'exemple: mongosh "mongodb://localhost:27017/sigdu" mongo_seeder.js

// 1. Définition de la base de données
db = db.getSiblingDB('sigdu');

print("Nettoyage de la base de données existante...");
db.dropDatabase();

print("Création des collections et insertion des données...");

// 2. Utilisateurs (Users)
const adminId = ObjectId();
const superviseurId = ObjectId();
const agentId = ObjectId();
const citoyenId = ObjectId();
const veilleurId = ObjectId();

db.users.insertMany([
  {
    _id: adminId,
    email: "admin@sigdu.cm",
    name: "Admin SIGDU",
    firstName: "Jean",
    phone: "699000001",
    nationality: "Camerounaise",
    age: 45,
    role: "ADMIN",
    createdAt: new Date()
  },
  {
    _id: superviseurId,
    email: "superviseur.douala@sigdu.cm",
    name: "Superviseur OP",
    firstName: "Marie",
    phone: "699000002",
    nationality: "Camerounaise",
    age: 38,
    role: "SUPERVISEUR",
    createdAt: new Date()
  },
  {
    _id: agentId,
    email: "agent.terrain@sigdu.cm",
    name: "Agent Terrain",
    firstName: "Paul",
    phone: "699000003",
    nationality: "Camerounaise",
    age: 30,
    role: "AGENT",
    createdAt: new Date()
  },
  {
    _id: citoyenId,
    email: "citoyen@example.com",
    name: "Citoyen Lambda",
    firstName: "Marc",
    phone: "699000004",
    nationality: "Camerounaise",
    age: 28,
    role: "CITOYEN",
    createdAt: new Date()
  },
  {
    _id: veilleurId,
    email: "veilleur@example.com",
    name: "Citoyen Veilleur",
    firstName: "Sophie",
    phone: "699000005",
    nationality: "Camerounaise",
    age: 34,
    role: "CITOYEN",
    createdAt: new Date()
  }
]);

// 3. Citoyens Veilleurs (Watchers) - Liés aux utilisateurs
db.watchers.insertOne({
  userId: veilleurId,
  arrondissements: ["Douala I", "Douala II"],
  favoriteQuartiers: ["Akwa", "Bonanjo"],
  active: true,
  createdAt: new Date()
});

// 4. Organisations & Services
const orgaPoliceId = ObjectId();
const orgaGendarmerieId = ObjectId();

db.organizations.insertMany([
  { _id: orgaPoliceId, name: "Police Nationale", type: "POLICE", createdAt: new Date() },
  { _id: orgaGendarmerieId, name: "Gendarmerie Nationale", type: "GENDARMERIE", createdAt: new Date() }
]);

const serviceCommissariat1 = ObjectId();

db.services.insertOne({
  _id: serviceCommissariat1,
  organizationId: orgaPoliceId,
  name: "Commissariat Central N°1",
  arrondissement: "Douala I",
  location: { lat: 4.0456, lng: 9.6978, address: "Bonanjo", arrondissement: "Douala I" },
  createdAt: new Date()
});

// Mettre à jour l'agent et le superviseur avec le serviceId
db.users.updateMany(
  { _id: { $in: [superviseurId, agentId] } },
  { $set: { organizationId: orgaPoliceId, serviceId: serviceCommissariat1 } }
);

// 5. Incidents
const incident1Id = ObjectId();
const incident2Id = ObjectId();

db.incidents.insertMany([
  {
    _id: incident1Id,
    type: "DISPARITION",
    personAge: "ADULTE",
    status: "DISPARITION_CONFIRMEE",
    title: "Disparition Inquiétante - Adulte",
    description: "Parti hier matin pour le marché et n'est jamais revenu.",
    location: {
      lat: 4.0511,
      lng: 9.7679,
      address: "Marché Central",
      arrondissement: "Douala II",
      quartier: "New Bell"
    },
    photos: ["https://placehold.co/400x500/red/white?text=Disparu"],
    reportedBy: citoyenId,
    assignedServiceId: serviceCommissariat1,
    assignedTo: agentId,
    createdAt: new Date(Date.now() - 86400000), // Hier
    updatedAt: new Date()
  },
  {
    _id: incident2Id,
    type: "ENLEVEMENT",
    personAge: "ENFANT_MINEUR",
    status: "ALERTE_CRITIQUE",
    title: "Alerte Enlèvement - Enfant 8 ans",
    description: "Vu pour la dernière fois entrant dans un véhicule gris non identifié près de l'école.",
    location: {
      lat: 4.0622,
      lng: 9.7214,
      address: "École Primaire d'Akwa",
      arrondissement: "Douala I",
      quartier: "Akwa"
    },
    photos: ["https://placehold.co/400x500/purple/white?text=Enfant"],
    reportedBy: citoyenId,
    assignedServiceId: serviceCommissariat1,
    createdAt: new Date(),
    updatedAt: new Date()
  }
]);

// 6. Timeline Events
db.timelineEvents.insertMany([
  {
    incidentId: incident1Id,
    actionType: "STATUS_CHANGE",
    description: "Le statut est passé de NOUVEAU à DISPARITION_CONFIRMEE.",
    visibility: "PUBLIC",
    createdBy: superviseurId,
    createdAt: new Date(Date.now() - 80000000)
  },
  {
    incidentId: incident1Id,
    actionType: "COMMENT",
    description: "L'équipe s'est rendue sur place, des recherches sont en cours au marché.",
    visibility: "INTERNAL",
    createdBy: agentId,
    createdAt: new Date(Date.now() - 40000000)
  }
]);

// 7. Observations
const observationId = ObjectId();

db.observations.insertOne({
  _id: observationId,
  type: "PERSONNE_CORRESPONDANTE",
  incidentId: incident1Id,
  description: "J'ai vu quelqu'un ressemblant fortement à l'avis de recherche au carrefour Ndokoti.",
  location: {
    lat: 4.0489,
    lng: 9.7421,
    address: "Carrefour Ndokoti",
    arrondissement: "Douala III",
    quartier: "Ndokoti"
  },
  photos: [],
  reportedBy: veilleurId,
  aiSimilarityScore: 85,
  status: "NOUVEAU",
  createdAt: new Date()
});

// 8. Alerts
db.alerts.insertOne({
  title: "Alerte Critique : Enlèvement",
  message: "Un enlèvement a été signalé à Douala I. Restez vigilants.",
  level: "CRITICAL",
  createdAt: new Date()
});

// 9. Création des Index pour optimiser les requêtes
print("Création des index MongoDB...");
db.users.createIndex({ email: 1 }, { unique: true });
db.users.createIndex({ role: 1 });
db.incidents.createIndex({ reportedBy: 1 });
db.incidents.createIndex({ status: 1 });
db.incidents.createIndex({ "location.arrondissement": 1 });
db.observations.createIndex({ incidentId: 1 });
db.timelineEvents.createIndex({ incidentId: 1 });
db.watchers.createIndex({ userId: 1 }, { unique: true });
db.watchers.createIndex({ arrondissements: 1 });

print("Données insérées avec succès !");
