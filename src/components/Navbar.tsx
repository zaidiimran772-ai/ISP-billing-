import React from 'react';
import { ShieldCheck, Lock, DollarSign, Wifi, Globe, Menu, Sparkles, MessageSquare } from 'lucide-react';
import { useWasooli } from '../context/WasooliContext';
import { useAppLock } from '../context/AppLockContext';

interface Props {
  onToggleSidebar: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lang: 'en' | 'ur';
  setLang: (lang: 'en' | 'ur') => void;
}

export const Navbar: React.FC<Props> = ({ onToggleSidebar, activeTab, setActiveTab, lang, setLang }) => {
  const { metrics, setIsQuickWasooliOpen, settings } = useWasooli();
  const { lockApp, appLockEnabled } = useAppLock();

  return (
    <header className="sticky top-0 z-30 h-16 bg-slate-900/90 backdrop-blur-md border-b border-slate-800 px-4 flex items-center justify-between no-print">
      {/* Left: Mobile hamburger & Logo */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="lg:hidden p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div
          onClick={() => setActiveTab('dashboard')}
          className="flex items-center gap-2.5 cursor-pointer group"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Wifi className="w-5 h-5 text-slate-950 font-black" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-base tracking-tight text-white group-hover:text-emerald-400 transition-colors">
                Wasooli<span className="text-emerald-400">PK</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                ISP Edition
              </span>
            </div>
            <p className="text-[10px] text-slate-400 truncate max-w-[140px] sm:max-w-[200px]">
              {settings.ispName}
            </p>
          </div>
        </div>
      </div>

      {/* Middle: Live Wasooli Ticker */}
      <div className="hidden md:flex items-center gap-6 px-4 py-1.5 rounded-2xl bg-slate-950/60 border border-slate-800/80 text-xs">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          <span className="text-slate-400">Today Wasooli:</span>
          <span className="font-bold text-emerald-400">
            {settings.currency} {metrics.collectedToday.toLocaleString()}
          </span>
        </div>
        <div className="h-3.5 w-px bg-slate-800" />
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Subscribers:</span>
          <span className="font-bold text-white">{metrics.totalSubscribers}</span>
          <span className="text-[10px] text-emerald-400 bg-emerald-950/50 px-1.5 py-0.2 rounded border border-emerald-800/40">
            {metrics.activeCount} Active
          </span>
        </div>
      </div>

      {/* Right Actions */}
      <div className="flex items-center gap-2">
        {/* Language Toggle */}
        <button
          onClick={() => setLang(lang === 'en' ? 'ur' : 'en')}
          className="p-2 rounded-xl text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/60 hover:bg-slate-800 border border-slate-700/60 flex items-center gap-1.5 cursor-pointer transition-colors"
          title="Toggle Urdu / English"
        >
          <Globe className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px]">{lang === 'en' ? 'اردو' : 'EN'}</span>
        </button>

        {/* WhatsApp Billing shortcut */}
        <button
          onClick={() => setActiveTab('whatsapp')}
          className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-200 border border-slate-700 text-xs font-medium transition-colors cursor-pointer"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
          <span>WA Bills</span>
        </button>

        {/* Quick Wasooli CTA */}
        <button
          onClick={() => setIsQuickWasooliOpen(true)}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-slate-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all active:scale-95 cursor-pointer"
        >
          <DollarSign className="w-4 h-4 stroke-[2.5]" />
          <span>+ Quick Wasooli</span>
        </button>

        {/* Instant AppLock Button */}
        {appLockEnabled && (
          <button
            onClick={lockApp}
            title="Lock WasooliPK Now (AppLock)"
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 hover:text-rose-300 border border-rose-500/30 transition-all cursor-pointer flex items-center gap-1"
          >
            <Lock className="w-4 h-4" />
            <span className="hidden xl:inline text-[11px] font-semibold">Lock App</span>
          </button>
        )}
      </div>
    </header>
  );
};
