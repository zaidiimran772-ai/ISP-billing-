import React from 'react';
import {
  LayoutDashboard,
  Users,
  DollarSign,
  MessageSquare,
  Router,
  LifeBuoy,
  Bike,
  ReceiptText,
  BarChart3,
  Settings,
  Lock,
  X,
  FileSpreadsheet
} from 'lucide-react';
import { useWasooli } from '../context/WasooliContext';
import { useAppLock } from '../context/AppLockContext';

interface Props {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isOpen: boolean;
  onClose: () => void;
  lang: 'en' | 'ur';
}

export const Sidebar: React.FC<Props> = ({ activeTab, setActiveTab, isOpen, onClose, lang }) => {
  const { metrics } = useWasooli();
  const { lockApp, appLockEnabled } = useAppLock();

  const navItems = [
    {
      id: 'dashboard',
      labelEn: 'Dashboard',
      labelUr: 'ڈیش بورڈ',
      icon: LayoutDashboard,
      badge: null
    },
    {
      id: 'subscribers',
      labelEn: 'Subscribers / Khata',
      labelUr: 'صارفین اور کھاتہ',
      icon: Users,
      badge: metrics.totalSubscribers
    },
    {
      id: 'wasooli',
      labelEn: 'Wasooli & Receipts',
      labelUr: 'وصولی اور رسیدیں',
      icon: DollarSign,
      badge: null
    },
    {
      id: 'whatsapp',
      labelEn: 'WhatsApp Billing',
      labelUr: 'واٹس ایپ بلنگ',
      icon: MessageSquare,
      badge: metrics.expiredCount > 0 ? `${metrics.expiredCount} Due` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
    },
    {
      id: 'mikrotik',
      labelEn: 'MikroTik & Fiber',
      labelUr: 'مائکروٹک کنٹرول',
      icon: Router,
      badge: null
    },
    {
      id: 'complaints',
      labelEn: 'Complaints / Tickets',
      labelUr: 'شکایات اور حل',
      icon: LifeBuoy,
      badge: metrics.activeComplaintsCount > 0 ? metrics.activeComplaintsCount : null,
      badgeColor: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
    },
    {
      id: 'riders',
      labelEn: 'Recovery Riders',
      labelUr: 'ریکوری رائیڈرز',
      icon: Bike,
      badge: null
    },
    {
      id: 'expenses',
      labelEn: 'Expenses / Roznamcha',
      labelUr: 'روزنامچہ و اخراجات',
      icon: ReceiptText,
      badge: null
    },
    {
      id: 'reports',
      labelEn: 'Reports & Defaulters',
      labelUr: 'رپورٹس اور بقایاجات',
      icon: BarChart3,
      badge: null
    },
    {
      id: 'settings',
      labelEn: 'Settings & AppLock',
      labelUr: 'سیٹنگز اور ایپ لاک',
      icon: Settings,
      badge: null
    }
  ];

  const handleSelect = (id: string) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm lg:hidden no-print"
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static no-print ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile Header */}
        <div className="h-16 px-4 border-b border-slate-800 flex items-center justify-between lg:hidden">
          <span className="font-bold text-white text-base">WasooliPK Menu</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500">
            {lang === 'en' ? 'Core Management' : 'انتظامی امور'}
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleSelect(item.id)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
                  <span className={lang === 'ur' ? 'font-urdu text-sm' : ''}>
                    {lang === 'en' ? item.labelEn : item.labelUr}
                  </span>
                </div>

                {item.badge !== null && item.badge !== undefined && (
                  <span
                    className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border ${
                      item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Bottom Section: App Lock status & quick button */}
        <div className="p-3 border-t border-slate-800 bg-slate-950/40 space-y-2">
          {appLockEnabled ? (
            <div className="p-2.5 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <div>
                  <span className="text-[11px] font-semibold text-slate-200 block">AppLock Protected</span>
                  <span className="text-[10px] text-slate-400">PIN & Biometrics active</span>
                </div>
              </div>
              <button
                onClick={lockApp}
                className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 transition-colors cursor-pointer"
                title="Lock Immediately"
              >
                <Lock className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            <div className="p-2 text-center text-[10px] text-amber-400 bg-amber-500/10 rounded-lg border border-amber-500/20">
              AppLock is disabled. Enable in Settings.
            </div>
          )}

          <div className="text-center text-[10px] text-slate-500 pt-1">
            WasooliPK Cloud v3.4 • Pakistan ISP OS
          </div>
        </div>
      </aside>
    </>
  );
};
