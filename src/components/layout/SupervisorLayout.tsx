import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, CheckSquare, List, Map, BarChart2, FileText, LogOut, Moon, Sun, Bell, Shield, ChevronLeft, ChevronRight, MessageSquareWarning, Eye } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import { useUiStore } from '../../stores/uiStore';
import { cn } from '../../lib/utils';

export const SupervisorLayout = () => {
  const { user, logout } = useAuthStore();
  const { theme, setTheme } = useUiStore();
  const navigate = useNavigate();
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const navItems = [
    { to: '/superviseur/dashboard', icon: LayoutDashboard, label: 'Tableau de bord' },
    { to: '/superviseur/validation', icon: CheckSquare, label: 'Validation' },
    { to: '/superviseur/incidents', icon: List, label: 'Incidents' },
    { to: '/superviseur/observations', icon: Eye, label: 'Observations' },
    { to: '/superviseur/map', icon: Map, label: 'Carte SIG' },
    { to: '/superviseur/rumeurs', icon: MessageSquareWarning, label: 'Rumeurs' },
    { to: '/superviseur/statistiques', icon: BarChart2, label: 'Statistiques' },
    { to: '/superviseur/rapports', icon: FileText, label: 'Rapports' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex">
      {/* Sidebar (Desktop) */}
      <aside className={cn(
        "hidden md:flex flex-col fixed inset-y-0 left-0 z-50 bg-white dark:bg-gray-950 border-r border-gray-200 dark:border-gray-800 transition-all duration-300",
        sidebarCollapsed ? "w-20" : "w-64"
      )}>
        <div className="h-16 flex items-center justify-between px-4 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
              <Shield className="w-4 h-4 text-white" />
            </div>
            {!sidebarCollapsed && (
              <div>
                <h1 className="text-sm font-bold text-gray-900 dark:text-white leading-tight truncate">Superviseur</h1>
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
        
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1 scrollbar-hide">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              title={sidebarCollapsed ? item.label : undefined}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group",
                isActive 
                  ? "bg-indigo-50 dark:bg-indigo-500/10 text-indigo-600 dark:text-indigo-500 font-semibold" 
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-gray-900 dark:hover:text-gray-200 font-medium"
              )}
            >
              <item.icon className={cn("w-5 h-5 shrink-0 transition-colors", sidebarCollapsed && "mx-auto")} />
              {!sidebarCollapsed && <span className="truncate">{item.label}</span>}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-800">
          {!sidebarCollapsed ? (
            <div className="flex items-center gap-3 mb-4 px-2">
               <div className="w-9 h-9 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-500 font-bold shrink-0">
                 {user?.name?.charAt(0) || 'S'}
               </div>
               <div className="min-w-0 flex-1">
                 <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">{user?.name}</p>
                 <p className="text-xs text-gray-500 truncate">Superviseur OP</p>
               </div>
            </div>
          ) : (
            <div className="flex justify-center mb-4">
              <div className="w-10 h-10 rounded-full bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center text-indigo-600 dark:text-indigo-500 font-bold" title={user?.name}>
                 {user?.name?.charAt(0) || 'S'}
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
        "md:ml-64", 
        sidebarCollapsed && "md:ml-20"
      )}>
        {/* Topbar */}
        <header className="sticky top-0 z-40 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md border-b border-gray-200/60 dark:border-gray-800 h-16 px-4 md:px-6 flex items-center justify-between">
           <div className="flex items-center gap-3 md:hidden">
             <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
               <Shield className="w-4 h-4 text-white" />
             </div>
             <span className="font-bold text-gray-900 dark:text-white">Superviseur</span>
           </div>
           
           <div className="hidden md:flex items-center text-sm text-gray-500 dark:text-gray-400">
             {new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
           </div>

           <div className="flex items-center gap-2">
             <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-all"
              >
                {theme === 'dark' ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
             </button>
             <button className="relative p-2 rounded-xl text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 dark:text-gray-400 transition-all">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white dark:border-gray-950" />
             </button>
             <button onClick={logout} className="md:hidden p-2 rounded-xl text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10">
               <LogOut className="w-5 h-5" />
             </button>
           </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-6 overflow-auto pb-24 md:pb-6">
          <Outlet />
        </main>
      </div>

      {/* Mobile Nav */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white/90 dark:bg-gray-950/90 backdrop-blur-md border-t border-gray-200 dark:border-gray-800 safe-bottom">
        <div className="flex items-center justify-around px-2 py-2 overflow-x-auto no-scrollbar">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                "flex flex-col items-center gap-1 p-2 rounded-xl transition-all flex-shrink-0 w-[4.5rem]",
                isActive ? "text-indigo-600 dark:text-indigo-500" : "text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-300"
              )}
            >
              {({ isActive }) => (
                <>
                  <div className={cn("p-1 rounded-lg transition-colors", isActive && "bg-indigo-100 dark:bg-indigo-500/20")}>
                     <item.icon className={cn("w-5 h-5", isActive ? "stroke-[2.5px]" : "stroke-2")} />
                  </div>
                  <span className="text-[10px] font-medium truncate w-full text-center">{item.label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
};
