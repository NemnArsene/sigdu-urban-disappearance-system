import Dexie, { type Table } from 'dexie';
import { type User, type Incident, type Alert, type Organization, type Service, type Observation, type TimelineEvent, type Watcher, type NewsPost, type Rumor, type SOSAlert, type Notification } from '../types';

export class SigduDatabase extends Dexie {
  users!: Table<User, string>; 
  incidents!: Table<Incident, string>;
  alerts!: Table<Alert, string>;
  organizations!: Table<Organization, string>;
  services!: Table<Service, string>;
  observations!: Table<Observation, string>;
  timelineEvents!: Table<TimelineEvent, string>;
  watchers!: Table<Watcher, string>; // userId is primary key
  newsFeed!: Table<NewsPost, string>;
  rumors!: Table<Rumor, string>;
  sosAlerts!: Table<SOSAlert, string>;
  notifications!: Table<Notification, string>;

  constructor() {
    super('SigduDatabase');
    // Declare tables, primary keys and indexes
    this.version(8).stores({
      users: 'id, email, role, organizationId, serviceId',
      incidents: 'id, type, status, reportedBy, assignedServiceId, assignedTo, createdAt',
      alerts: 'id, level, createdAt',
      organizations: 'id, type',
      services: 'id, organizationId, arrondissement',
      observations: 'id, type, incidentId, reportedBy, status, createdAt',
      timelineEvents: 'id, incidentId, visibility, createdAt',
      watchers: 'userId, active',
      newsFeed: 'id, type, createdAt',
      rumors: 'id, submittedBy, status, createdAt',
      sosAlerts: 'id, userId, status, assignedServiceId, createdAt',
      notifications: 'id, userId, read, createdAt'
    });
  }
}

export const db = new SigduDatabase();
