import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, List, Map, Briefcase, FileSearch, LogOut, Menu, Moon, Sun, Bell, Shield, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';
import { NotificationBell } from '../ui/NotificationBell';

export const AgentLayout = () => {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useUiStore();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navCategories = [
    {
      title: "Principal",
      items: [
        { to: '/agent/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
        { to: '/agent/map', icon: Map, label: 'Carte SIG' },
      ]
    },
    {
      title: "Gestion des Cas",
      items: [
        { to: '/agent/incidents', icon: List, label: 'Incidents' },
      ]
    },
    {
      title: "Opérations",
      items: [
        { to: '/agent/affectations', icon: Briefcase, label: 'Affectations' },
        { to: '/agent/enquetes', icon: FileSearch, label: 'Enquêtes' },
      ]
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar */}
      <aside className={cn(
        "flex flex-col fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300",
        sidebarCollapsed ? "w-20" : "w-64"
      )}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">SIGDU Agent</h1>
                <p className="text-xs text-gray-500 leading-tight">Douala</p>
              </div>
            )}
          </div>
          <button 
            onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {sidebarCollapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-4 scrollbar-hide">
          {navCategories.map((category, idx) => (
            <div key={idx} className="space-y-1">
              {!sidebarCollapsed && (
                <p className="px-3 text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
                  {category.title}
                </p>
              )}
              {category.items.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  title={sidebarCollapsed ? item.label : undefined}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                    isActive 
                      ? "bg-amber-50 dark:bg-amber-500/10 text-amber-600 dark:text-amber-500 font-semibold" 
                      : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200 font-medium"
                  )}
                >
                  <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", sidebarCollapsed && "mx-auto")} />
                  {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 mb-4 px-2">
               <div className="w-9 h-9 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-500 font-bold shrink-0">
                 {user?.name?.charAt(0) || 'A'}
               </div>
               <div className="min-w-0 flex-1">
                 <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                 <p className="text-xs text-gray-500 truncate">Agent Terrain</p>
               </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-900/50 flex items-center justify-center text-amber-600 dark:text-amber-500 font-bold" title={user?.name}>
                 {user?.name?.charAt(0) || 'A'}
              </div>
            </div>
          )}
          <button 
            onClick={logout} 
            className={cn(
              "flex items-center justify-center gap-2 w-full py-2.5 rounded-xl text-red-600 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors font-medium",
              sidebarCollapsed ? "px-0" : "px-4"
            )}
            title={sidebarCollapsed ? "Déconnexion" : undefined}
          >
            <LogOut className="w-5 h-5" />
            {!sidebarCollapsed && <span>Déconnexion</span>}
          </button>
        </div>
      </aside>

      {/* Main Content wrapper */}
      <div className={cn(
        "flex-1 flex flex-col min-w-0 transition-all duration-300",
        sidebarCollapsed ? "ml-20" : "ml-64"
      )}>
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800 h-16 px-6 flex items-center justify-between">
           <div className="flex items-center gap-3">
             <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center">
               <Shield className="w-4 h-4 text-white" />
             </div>
             <span className="font-bold text-gray-900 dark:text-white">Agent</span>
           </div>
           
           <div className="flex items-center text-sm text-gray-500 dark:text-gray-400">
             {/* Optional: breadcrumbs or current date */}
             {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </div>

           <div className="flex items-center gap-2">
             <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-all"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             <NotificationBell />
             <button onClick={logout} className="p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
               <LogOut className="w-5 h-5" />
             </button>
           </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-6 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
