import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, Trash2, ExternalLink } from 'lucide-react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { useAuthStore } from '../../stores/authStore';
import { cn } from '../../lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useNavigate } from 'react-router-dom';

export const NotificationBell = () => {
  const { user } = useAuthStore();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const notifications = useLiveQuery(
    () => user ? db.notifications.where('userId').equals(user.id).reverse().sortBy('createdAt') : [],
    [user]
  );

  const unreadCount = notifications?.filter(n => !n.read).length || 0;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const markAsRead = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await db.notifications.update(id, { read: true });
  };

  const markAllAsRead = async () => {
    if (!notifications) return;
    const unreadIds = notifications.filter(n => !n.read).map(n => n.id);
    await Promise.all(unreadIds.map(id => db.notifications.update(id, { read: true })));
  };

  const clearAll = async () => {
    if (!notifications) return;
    const ids = notifications.map(n => n.id);
    await Promise.all(ids.map(id => db.notifications.delete(id)));
  };

  const handleNotificationClick = async (notif: any) => {
    if (!notif.read) {
      await db.notifications.update(notif.id, { read: true });
    }
    setIsOpen(false);
    if (notif.link) {
      navigate(notif.link);
    }
  };

  if (!user) return null;

  return (
    <div className="relative" ref={popoverRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 dark:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-indigo-500"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-500 border-2 border-white dark:border-slate-950"></span>
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800 z-50 overflow-hidden flex flex-col max-h-[80vh]">
          <div className="flex items-center justify-between p-4 border-b border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/20">
            <h3 className="font-semibold text-slate-900 dark:text-white">Notifications</h3>
            <div className="flex gap-2">
              {unreadCount > 0 && (
                <button
                  onClick={markAllAsRead}
                  className="p-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 rounded-md transition-colors"
                  title="Tout marquer comme lu"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
              {notifications && notifications.length > 0 && (
                <button
                  onClick={clearAll}
                  className="p-1.5 text-xs font-medium text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-md transition-colors"
                  title="Tout effacer"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          <div className="overflow-y-auto p-2">
            {!notifications || notifications.length === 0 ? (
              <div className="p-8 text-center text-slate-500">
                <Bell className="w-8 h-8 mx-auto mb-2 text-slate-300 dark:text-slate-700" />
                <p className="text-sm">Aucune notification</p>
              </div>
            ) : (
              <div className="space-y-1">
                {notifications.map((notif) => (
                  <div
                    key={notif.id}
                    onClick={() => handleNotificationClick(notif)}
                    className={cn(
                      "p-3 rounded-xl transition-all cursor-pointer group flex gap-3",
                      notif.read
                        ? "hover:bg-slate-50 dark:hover:bg-slate-800/50"
                        : "bg-indigo-50/50 dark:bg-indigo-900/10 hover:bg-indigo-50 dark:hover:bg-indigo-900/20"
                    )}
                  >
                    <div className="mt-1 shrink-0">
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        notif.read ? "bg-transparent" : "bg-indigo-600 dark:bg-indigo-400"
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start gap-2">
                        <p className={cn(
                          "text-sm font-semibold truncate",
                          notif.read ? "text-slate-700 dark:text-slate-300" : "text-slate-900 dark:text-white"
                        )}>
                          {notif.title}
                        </p>
                        <span className="text-[10px] text-slate-400 whitespace-nowrap shrink-0">
                          {formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true, locale: fr })}
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 leading-relaxed">
                        {notif.message}
                      </p>
                      {notif.link && (
                        <div className="mt-2 flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400">
                          <span>Voir les détails</span>
                          <ExternalLink className="w-3 h-3" />
                        </div>
                      )}
                    </div>
                    {!notif.read && (
                      <button
                        onClick={(e) => markAsRead(notif.id, e)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 hover:bg-white dark:hover:bg-slate-800 transition-all shrink-0 self-start"
                        title="Marquer comme lu"
                      >
                        <Check className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
