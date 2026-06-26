import React from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { LoginPage } from '../pages/auth/LoginPage';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { useAuthStore } from '../stores/authStore';
import { RoleRoutes } from '../lib/rbac';
import { PublicFlyerPage } from '../pages/public/PublicFlyerPage';

import { CitizenLayout } from '../components/layout/CitizenLayout';
import { AgentLayout } from '../components/layout/AgentLayout';
import { SupervisorLayout } from '../components/layout/SupervisorLayout';
import { AdminLayout } from '../components/layout/AdminLayout';

import { CitizenDashboard } from '../pages/citoyen/Dashboard';
import { CitizenMapPage } from '../pages/citoyen/MapPage';
import { CitizenReportPage } from '../pages/citoyen/ReportPage';
import { CitizenAlertsPage } from '../pages/citoyen/AlertsPage';
import { CitizenMesSignalementsPage } from '../pages/citoyen/MesSignalementsPage';
import { CitizenMorePage } from '../pages/citoyen/MorePage';
import { CitizenProfilePage } from '../pages/citoyen/ProfilePage';
import { CitizenFaqPage } from '../pages/citoyen/FaqPage';
import { CitizenReglesPage } from '../pages/citoyen/ReglesPage';
import { CitizenNumerosUrgencePage } from '../pages/citoyen/NumerosUrgencePage';
import { CitizenNewObservationPage } from '../pages/citoyen/NewObservationPage';
import { CitizenActualitePage } from '../pages/citoyen/ActualitePage';
import { CitizenSubmitRumorPage } from '../pages/citoyen/SubmitRumorPage';
import { CitizenWatcherPage } from '../pages/citoyen/WatcherPage';
import { CitizenSearchPage } from '../pages/citoyen/SearchPage';
import { AgentDashboard } from '../pages/agent/Dashboard';
import { AgentIncidentsPage } from '../pages/agent/IncidentsPage';
import { AgentMapPage } from '../pages/agent/MapPage';
import { AgentAssignmentsPage } from '../pages/agent/AssignmentsPage';
import { AgentInvestigationsPage } from '../pages/agent/InvestigationsPage';
import { SupervisorDashboard } from '../pages/superviseur/Dashboard';
import { SupervisorValidationPage } from '../pages/superviseur/ValidationPage';
import { SupervisorIncidentsPage } from '../pages/superviseur/IncidentsPage';
import { SupervisorMapPage } from '../pages/superviseur/MapPage';
import { SupervisorStatisticsPage } from '../pages/superviseur/StatisticsPage';
import { SupervisorReportsPage } from '../pages/superviseur/ReportsPage';
import { SupervisorRumorsPage } from '../pages/superviseur/RumorsPage';
import { SupervisorObservationsPage } from '../pages/superviseur/ObservationsPage';
import { SupervisorIncidentDetailsPage } from '../pages/superviseur/IncidentDetailsPage';
import { AdminDashboard } from '../pages/admin/Dashboard';
import { AdminUsersPage } from '../pages/admin/UsersPage';
import { AdminIncidentsPage } from '../pages/admin/IncidentsPage';
import { AdminMapPage } from '../pages/admin/MapPage';
import { AdminReportsPage } from '../pages/admin/ReportsPage';
import { AdminAuditPage } from '../pages/admin/AuditPage';
import { AdminConfigurationPage } from '../pages/admin/ConfigurationPage';
import { SOSPage } from '../pages/superviseur/SOSPage';

function RootRedirect() {
  const { isAuthenticated, user } = useAuthStore();
  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }
  return <Navigate to={RoleRoutes[user.role]} replace />;
}

// Placeholder for unbuilt pages
const Placeholder = ({ title }: { title: string }) => (
  <div className="flex items-center justify-center h-full text-slate-400">
    <p>{title} (En construction)</p>
  </div>
);

export const router = createBrowserRouter([
  {
    path: '/',
    element: <RootRedirect />
  },
  {
    path: '/avis/:id',
    element: <PublicFlyerPage />
  },
  {
    path: '/login',
    element: <LoginPage />
  },
  {
    path: '/citoyen',
    element: <ProtectedRoute><CitizenLayout /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <CitizenDashboard /> },
      { path: 'map', element: <CitizenMapPage /> },
      { path: 'signaler', element: <CitizenReportPage /> },
      { path: 'mes-signalements', element: <CitizenMesSignalementsPage /> },
      { path: 'alertes', element: <CitizenAlertsPage /> },
      { path: 'profil', element: <CitizenProfilePage /> },
      { path: 'plus', element: <CitizenMorePage /> },
      { path: 'faq', element: <CitizenFaqPage /> },
      { path: 'regles', element: <CitizenReglesPage /> },
      { path: 'numeros-urgence', element: <CitizenNumerosUrgencePage /> },
      { path: 'observation/nouvelle', element: <CitizenNewObservationPage /> },
      { path: 'actualite', element: <CitizenActualitePage /> },
      { path: 'soumettre-rumeur', element: <CitizenSubmitRumorPage /> },
      { path: 'veilleur', element: <CitizenWatcherPage /> },
      { path: 'recherche', element: <CitizenSearchPage /> },
    ]
  },
  {
    path: '/agent',
    element: <ProtectedRoute><AgentLayout /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <AgentDashboard /> },
      { path: 'incidents', element: <AgentIncidentsPage /> },
      { path: 'map', element: <AgentMapPage /> },
      { path: 'affectations', element: <AgentAssignmentsPage /> },
      { path: 'enquetes', element: <AgentInvestigationsPage /> },
    ]
  },
  {
    path: '/superviseur',
    element: <ProtectedRoute><SupervisorLayout /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <SupervisorDashboard /> },
      { path: 'sos', element: <SOSPage /> },
      { path: 'validation', element: <SupervisorValidationPage /> },
      { path: 'incidents', element: <SupervisorIncidentsPage /> },
      { path: 'map', element: <SupervisorMapPage /> },
      { path: 'statistiques', element: <SupervisorStatisticsPage /> },
      { path: 'rapports', element: <SupervisorReportsPage /> },
      { path: 'rumeurs', element: <SupervisorRumorsPage /> },
      { path: 'observations', element: <SupervisorObservationsPage /> },
      { path: 'incident/:id', element: <SupervisorIncidentDetailsPage /> },
    ]
  },
  {
    path: '/admin',
    element: <ProtectedRoute><AdminLayout /></ProtectedRoute>,
    children: [
      { path: 'dashboard', element: <AdminDashboard /> },
      { path: 'sos', element: <SOSPage /> },
      { path: 'utilisateurs', element: <AdminUsersPage /> },
      { path: 'incidents', element: <AdminIncidentsPage /> },
      { path: 'map', element: <AdminMapPage /> },
      { path: 'validation', element: <SupervisorValidationPage /> },
      { path: 'observations', element: <SupervisorObservationsPage /> },
      { path: 'interventions', element: <Placeholder title="Interventions" /> },
      { path: 'affectations', element: <AgentAssignmentsPage /> },
      { path: 'enquetes', element: <AgentInvestigationsPage /> },
      { path: 'rumeurs', element: <SupervisorRumorsPage /> },
      { path: 'statistiques', element: <SupervisorStatisticsPage /> },
      { path: 'rapports', element: <AdminReportsPage /> },
      { path: 'agents', element: <Placeholder title="Agents" /> },
      { path: 'notifications', element: <Placeholder title="Notifications" /> },
      { path: 'audit', element: <AdminAuditPage /> },
      { path: 'configuration', element: <AdminConfigurationPage /> },
    ]
  }
]);
