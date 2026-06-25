import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '../../lib/database';
import { Newspaper, ShieldCheck, ShieldAlert, ShieldX, Clock, ChevronRight, MessageSquareWarning, Megaphone, PartyPopper, Info, AlertTriangle, Filter } from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '../../lib/utils';

type FeedTab = 'ALL' | 'NEWS' | 'RUMORS';

const TYPE_CONFIG = {
  ALERT: { icon: AlertTriangle, color: 'text-red-500', bg: 'bg-red-500/10 dark:bg-red-500/20', border: 'border-red-500/20', badge: 'bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400' },
  SUCCESS: { icon: PartyPopper, color: 'text-emerald-500', bg: 'bg-emerald-500/10 dark:bg-emerald-500/20', border: 'border-emerald-500/20', badge: 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400' },
  INFO: { icon: Info, color: 'text-blue-500', bg: 'bg-blue-500/10 dark:bg-blue-500/20', border: 'border-blue-500/20', badge: 'bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400' },
};

const RUMOR_STATUS_CONFIG = {
  VERIFIED_TRUE: { label: 'Confirmé', icon: ShieldCheck, color: 'text-emerald-500', bg: 'bg-emerald-50 dark:bg-emerald-900/20', border: 'border-emerald-200 dark:border-emerald-800/50' },
  VERIFIED_FALSE: { label: 'Démenti', icon: ShieldX, color: 'text-red-500', bg: 'bg-red-50 dark:bg-red-900/20', border: 'border-red-200 dark:border-red-800/50' },
  PENDING: { label: 'En vérification', icon: Clock, color: 'text-amber-500', bg: 'bg-amber-50 dark:bg-amber-900/20', border: 'border-amber-200 dark:border-amber-800/50' },
};

export const CitizenActualitePage = () => {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<FeedTab>('ALL');

  const newsPosts = useLiveQuery(
    () => db.newsFeed.orderBy('createdAt').reverse().toArray(),
    []
  );

  const verifiedRumors = useLiveQuery(
    () => db.rumors.orderBy('createdAt').reverse().toArray(),
    []
  );

  const tabs = [
    { id: 'ALL' as FeedTab, label: 'Tout', icon: Newspaper },
    { id: 'NEWS' as FeedTab, label: 'Officiel', icon: Megaphone },
    { id: 'RUMORS' as FeedTab, label: 'Rumeurs', icon: MessageSquareWarning },
  ];

  // Build a combined, sorted feed
  const feedItems = (() => {
    const items: Array<{ type: 'news' | 'rumor'; data: any; date: string }> = [];

    if (activeTab === 'ALL' || activeTab === 'NEWS') {
      (newsPosts || []).forEach(post => {
        items.push({ type: 'news', data: post, date: post.createdAt });
      });
    }

    if (activeTab === 'ALL' || activeTab === 'RUMORS') {
      (verifiedRumors || []).filter(r => activeTab === 'RUMORS' || r.status !== 'PENDING').forEach(rumor => {
        items.push({ type: 'rumor', data: rumor, date: rumor.createdAt });
      });
    }

    return items.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  })();

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 rounded-3xl p-6 text-white relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-red-500/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/4 pointer-events-none" />

        <div className="relative z-10">
          <div className="flex items-center gap-2 text-blue-400 font-semibold text-xs mb-3">
            <Newspaper className="w-4 h-4" />
            <span>Fil d'actualité sécuritaire</span>
          </div>
          <h2 className="text-2xl font-black tracking-tight mb-2">Actualités & Vérifications</h2>
          <p className="text-white/60 text-sm leading-relaxed max-w-xs">
            Restez informé en temps réel. Bulletins officiels, alertes vérifiées et démentis.
          </p>
        </div>
      </div>

      {/* Tab Switcher */}
      <div className="flex gap-2 bg-white dark:bg-slate-900 rounded-2xl p-1.5 border border-slate-200 dark:border-slate-800">
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all",
              activeTab === tab.id
                ? "bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-lg"
                : "text-slate-500 hover:text-slate-700 dark:hover:text-slate-300"
            )}
          >
            <tab.icon className="w-3.5 h-3.5" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Submit Rumor CTA */}
      <button
        onClick={() => navigate('/citoyen/soumettre-rumeur')}
        className="w-full bg-gradient-to-r from-amber-500/10 to-orange-500/10 dark:from-amber-500/5 dark:to-orange-500/5 border border-amber-200 dark:border-amber-800/40 rounded-2xl p-4 flex items-center gap-3 active:scale-[0.98] transition-transform"
      >
        <div className="w-10 h-10 rounded-xl bg-amber-100 dark:bg-amber-500/20 flex items-center justify-center shrink-0">
          <MessageSquareWarning className="w-5 h-5 text-amber-600 dark:text-amber-400" />
        </div>
        <div className="flex-1 text-left">
          <h4 className="font-bold text-sm text-slate-900 dark:text-white">Vous avez vu une rumeur ?</h4>
          <p className="text-[11px] text-slate-500">Soumettez-la pour vérification officielle</p>
        </div>
        <ChevronRight className="w-4 h-4 text-slate-400 shrink-0" />
      </button>

      {/* Feed Items */}
      <div className="space-y-3">
        {feedItems.length === 0 ? (
          <div className="text-center p-10 bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800">
            <Newspaper className="w-8 h-8 text-slate-300 dark:text-slate-600 mx-auto mb-3" />
            <p className="text-slate-500 text-sm font-medium">Aucune actualité pour le moment</p>
          </div>
        ) : (
          feedItems.map((item, index) => {
            if (item.type === 'news') {
              const post = item.data;
              const config = TYPE_CONFIG[post.type as keyof typeof TYPE_CONFIG] || TYPE_CONFIG.INFO;
              const IconComponent = config.icon;

              return (
                <div
                  key={`news-${post.id}`}
                  className={cn(
                    "bg-white dark:bg-slate-900 rounded-2xl border overflow-hidden transition-all",
                    "border-slate-200 dark:border-slate-800",
                    "hover:shadow-md"
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div className="p-4">
                    <div className="flex items-start gap-3">
                      <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5", config.bg)}>
                        <IconComponent className={cn("w-4.5 h-4.5", config.color)} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <span className={cn("text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md", config.badge)}>
                            {post.type === 'ALERT' ? 'Alerte' : post.type === 'SUCCESS' ? 'Bonne nouvelle' : 'Information'}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-slate-900 dark:text-white leading-snug mb-1.5">
                          {post.title}
                        </h3>
                        <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                          {post.content}
                        </p>
                        <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400 font-medium">
                          <Clock className="w-3 h-3" />
                          <span>{formatDistanceToNow(new Date(post.createdAt), { addSuffix: true, locale: fr })}</span>
                          <span className="text-slate-300 dark:text-slate-600">•</span>
                          <span>Source officielle</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            }

            // Rumor card
            const rumor = item.data;
            const statusConfig = RUMOR_STATUS_CONFIG[rumor.status as keyof typeof RUMOR_STATUS_CONFIG] || RUMOR_STATUS_CONFIG.PENDING;
            const StatusIcon = statusConfig.icon;

            return (
              <div
                key={`rumor-${rumor.id}`}
                className={cn(
                  "rounded-2xl border overflow-hidden transition-all hover:shadow-md",
                  statusConfig.bg,
                  statusConfig.border
                )}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <StatusIcon className={cn("w-4 h-4", statusConfig.color)} />
                    <span className={cn("text-[10px] font-black uppercase tracking-wider", statusConfig.color)}>
                      Rumeur — {statusConfig.label}
                    </span>
                  </div>

                  <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed mb-2 italic">
                    « {rumor.content} »
                  </p>

                  {rumor.officialResponse && (
                    <div className="bg-white/60 dark:bg-slate-800/60 rounded-xl p-3 mt-2 border border-slate-200/50 dark:border-slate-700/50">
                      <div className="flex items-center gap-1.5 mb-1">
                        <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Réponse officielle</span>
                      </div>
                      <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed font-medium">
                        {rumor.officialResponse}
                      </p>
                    </div>
                  )}

                  <div className="flex items-center gap-2 mt-3 text-[10px] text-slate-400 font-medium">
                    <Clock className="w-3 h-3" />
                    <span>{formatDistanceToNow(new Date(rumor.createdAt), { addSuffix: true, locale: fr })}</span>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
