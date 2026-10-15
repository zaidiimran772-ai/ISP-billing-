import React from 'react';
import {
  TrendingUp,
  DollarSign,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Send,
  Printer,
  ShieldCheck,
  Plus,
  Bike,
  Activity,
  CreditCard,
  Building2,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useWasooli } from '../context/WasooliContext';
import { Subscriber } from '../types/wasooli';

interface Props {
  setActiveTab: (tab: string) => void;
  lang: 'en' | 'ur';
}

export const DashboardView: React.FC<Props> = ({ setActiveTab, lang }) => {
  const {
    metrics,
    subscribers,
    transactions,
    riders,
    areas,
    settings,
    setIsQuickWasooliOpen,
    setQuickWasooliSubscriberId,
    setActiveReceipt
  } = useWasooli();

  // Defaulters (top 5 with highest due)
  const topDefaulters = [...subscribers]
    .filter(s => s.balanceDue > 0)
    .sort((a, b) => b.balanceDue - a.balanceDue)
    .slice(0, 5);

  // Recent 5 transactions
  const recentTransactions = transactions.slice(0, 5);

  const handleQuickWasooliForSub = (subId: string) => {
    setQuickWasooliSubscriberId(subId);
    setIsQuickWasooliOpen(true);
  };

  const handleSendWhatsAppReminder = (sub: Subscriber) => {
    const text = `*محترم ${sub.fullName}!*
آپ کا انٹرنیٹ بل برائے *${settings.ispName}* واجب الادا ہے۔
💰 *کل بقایا جات:* ${settings.currency} ${sub.balanceDue.toLocaleString()}
🗓️ *تاریخ بندش / انقطاع:* ${sub.expiryDate}
📲 *JazzCash / EasyPaisa:* ${settings.jazzCashNumber}
برائے مہربانی فوری ادائیگی کر کے منقطع ہونے سے بچیں۔ شکریہ!`;

    const cleanPhone = sub.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Top Welcome & Quick Actions Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 rounded-3xl bg-gradient-to-r from-slate-900 via-slate-900 to-emerald-950/40 border border-slate-800 shadow-xl">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              {lang === 'en' ? 'WasooliPK Overview' : 'وصولی پی کے ڈیش بورڈ'}
            </h1>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
              Live ISP Core
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {settings.ispName} • Daily Recovery, Cash Reconciliation & Defaulter Tracking
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => setIsQuickWasooliOpen(true)}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <DollarSign className="w-4 h-4 stroke-[2.5]" />
            <span>Receive Payment (فوری وصولی)</span>
          </button>

          <button
            onClick={() => setActiveTab('subscribers')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-cyan-400" />
            <span>+ New Subscriber</span>
          </button>

          <button
            onClick={() => setActiveTab('whatsapp')}
            className="px-3 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Send className="w-3.5 h-3.5 text-emerald-400" />
            <span>Send Bills (WA)</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today Wasooli */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-emerald-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Today Wasooli / آج کی وصولی
            </span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">
              {settings.currency} {metrics.collectedToday.toLocaleString()}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-emerald-400 font-medium">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Target: {metrics.collectionRate}% Recovered</span>
            </div>
          </div>
        </div>

        {/* Total Recoverable Dues */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-rose-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Pending Dues / کل بقایا جات
            </span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-rose-400">
              {settings.currency} {metrics.totalDues.toLocaleString()}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-slate-400">
              <span>{metrics.expiredCount} Overdue Subscribers</span>
            </div>
          </div>
        </div>

        {/* Active Subscribers */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-cyan-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Active Network / فعال کنکشن
            </span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">
              {metrics.activeCount} <span className="text-xs font-normal text-slate-400">/ {metrics.totalSubscribers}</span>
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-cyan-400 font-medium">
              <Activity className="w-3.5 h-3.5" />
              <span>GPON & PPPoE Active</span>
            </div>
          </div>
        </div>

        {/* Monthly Billed Volume */}
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 relative overflow-hidden group hover:border-purple-500/40 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Monthly Billing / ماہانہ بلنگ
            </span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-black text-white">
              {settings.currency} {metrics.totalBilledThisMonth.toLocaleString()}
            </span>
            <div className="flex items-center gap-1.5 mt-1 text-xs text-purple-300">
              <span>Target: {settings.currency} {metrics.monthlyTarget.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Payment Channel Breakdown Pills */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <span className="font-semibold text-slate-300">Payment Breakdown (آج کی ریکوری کی تفصیل):</span>
        <div className="flex flex-wrap items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
            💵 Cash: <strong>{settings.currency} {metrics.cashCollectedToday.toLocaleString()}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20 font-medium">
            📱 JazzCash: <strong>{settings.currency} {metrics.jazzCashCollectedToday.toLocaleString()}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-emerald-500/10 text-teal-300 border border-teal-500/20 font-medium">
            🟢 EasyPaisa: <strong>{settings.currency} {metrics.easyPaisaCollectedToday.toLocaleString()}</strong>
          </span>
          <span className="px-3 py-1.5 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-medium">
            🏦 Bank IBFT: <strong>{settings.currency} {metrics.bankCollectedToday.toLocaleString()}</strong>
          </span>
        </div>
      </div>

      {/* Main Grid: Defaulters List & Recent Transactions */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Urgent Defaulters & Arrears */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
              <h3 className="font-bold text-white text-sm">
                Top Defaulters (بقایاجات / ڈیفالٹرز)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('reports')}
              className="text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              View All Defaulters →
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {topDefaulters.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                No defaulters currently! All accounts cleared.
              </p>
            ) : (
              topDefaulters.map((sub) => (
                <div
                  key={sub.id}
                  className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-300">{sub.username}</span>
                      <span className="text-xs font-bold text-white">{sub.fullName}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Ph: {sub.phone} • Expired: <span className="text-rose-400 font-medium">{sub.expiryDate}</span>
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right mr-1">
                      <span className="text-sm font-black text-rose-400 block">
                        {settings.currency} {sub.balanceDue.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-500">Unpaid</span>
                    </div>

                    <button
                      onClick={() => handleSendWhatsAppReminder(sub)}
                      title="Send WhatsApp Bill"
                      className="p-2 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
                    >
                      <Send className="w-3.5 h-3.5" />
                    </button>

                    <button
                      onClick={() => handleQuickWasooliForSub(sub.id)}
                      title="Receive Payment"
                      className="p-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold transition-all cursor-pointer"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Right: Recent Wasooli Collections & Thermal Print */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <h3 className="font-bold text-white text-sm">
                Recent Wasooli (حالیہ وصولیاں)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('wasooli')}
              className="text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              Full Day Book →
            </button>
          </div>

          <div className="space-y-2.5 flex-1">
            {recentTransactions.length === 0 ? (
              <p className="text-xs text-slate-500 text-center py-8">
                No collections recorded today yet.
              </p>
            ) : (
              recentTransactions.map((tx) => (
                <div
                  key={tx.id}
                  className="p-3 rounded-2xl bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-white">{tx.subscriberName}</span>
                      <span className="font-mono text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.2 rounded">
                        {tx.subscriberUsername}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Rcpt #{tx.receiptNo} • Mode: <span className="text-emerald-400">{tx.paymentMethod}</span> • By {tx.collectedByName}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="text-right mr-1">
                      <span className="text-sm font-black text-emerald-400 block">
                        +{settings.currency} {tx.amount.toLocaleString()}
                      </span>
                      <span className="text-[9px] text-slate-500">
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>

                    <button
                      onClick={() => setActiveReceipt(tx)}
                      title="Reprint Thermal Receipt / WhatsApp"
                      className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5 text-cyan-400" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Recovery Riders Leaderboard & Area Stats */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
            <div className="flex items-center gap-2">
              <Bike className="w-5 h-5 text-amber-400" />
              <h3 className="font-bold text-white text-sm">
                Recovery Riders Daily Performance (ریکوری عملہ)
              </h3>
            </div>
            <button
              onClick={() => setActiveTab('riders')}
              className="text-xs text-cyan-400 hover:underline cursor-pointer"
            >
              Manage Riders →
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {riders.map((rider) => (
              <div
                key={rider.id}
                className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-white">{rider.name}</span>
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  </div>
                  <span className="text-[11px] text-slate-400">{rider.phone}</span>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/80">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Collected Today:</span>
                    <span className="font-bold text-emerald-400">
                      {settings.currency} {rider.collectedToday.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-slate-500">Handed Over:</span>
                    <span className="text-slate-300">
                      {settings.currency} {rider.cashHandedOver.toLocaleString()}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Area Coverage */}
        <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800 mb-3">
              <Building2 className="w-5 h-5 text-cyan-400" />
              <h3 className="font-bold text-white text-sm">Operational Zones (شہر کے علاقے)</h3>
            </div>
            <div className="space-y-2">
              {areas.slice(0, 4).map((a) => {
                const count = subscribers.filter(s => s.areaId === a.id).length;
                return (
                  <div key={a.id} className="flex items-center justify-between text-xs py-1">
                    <span className="text-slate-300 truncate max-w-[160px]">{a.name}</span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-400 text-[10px] font-semibold">
                      {count} Users
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-800 text-center">
            <span className="text-[11px] text-slate-400">
              MikroTik PPPoE & GPON OLT Sync Online
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
