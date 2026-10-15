import React, { useState } from 'react';
import {
  Settings as SettingsIcon,
  Lock,
  ShieldCheck,
  Building,
  CreditCard,
  Printer,
  Database,
  KeyRound,
  CheckCircle2,
  AlertCircle,
  Download,
  RotateCcw,
  Fingerprint
} from 'lucide-react';
import { useWasooli } from '../context/WasooliContext';
import { useAppLock } from '../context/AppLockContext';

interface Props {
  lang: 'en' | 'ur';
}

export const SettingsView: React.FC<Props> = ({ lang }) => {
  const { settings, updateCompanySettings, resetAllToDemoData } = useWasooli();
  const {
    currentPin,
    changePin,
    appLockEnabled,
    setAppLockEnabled,
    autoLockMinutes,
    setAutoLockMinutes,
    lockApp,
    securityQuestion
  } = useAppLock();

  // App Lock PIN change form
  const [oldPin, setOldPin] = useState('');
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [pinChangeMsg, setPinChangeMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Company Profile form
  const [profileData, setProfileData] = useState({ ...settings });
  const [profileSaved, setProfileSaved] = useState(false);

  const handlePinChangeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPinChangeMsg(null);

    if (newPin.length < 4) {
      setPinChangeMsg({ type: 'error', text: 'New PIN must be at least 4 digits' });
      return;
    }

    if (newPin !== confirmPin) {
      setPinChangeMsg({ type: 'error', text: 'New PIN and Confirm PIN do not match' });
      return;
    }

    const success = changePin(oldPin, newPin);
    if (success) {
      setPinChangeMsg({ type: 'success', text: 'Master PIN changed successfully!' });
      setOldPin('');
      setNewPin('');
      setConfirmPin('');
      setTimeout(() => setPinChangeMsg(null), 3000);
    } else {
      setPinChangeMsg({ type: 'error', text: 'Current PIN is incorrect' });
    }
  };

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateCompanySettings(profileData);
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 2500);
  };

  const handleBackupJson = () => {
    const data = {
      settings,
      timestamp: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `WasooliPK_Backup_${new Date().toISOString().split('T')[0]}.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {lang === 'en' ? 'System Settings & Security (سیٹنگز)' : 'سیٹنگز اور ایپ سیکیورٹی'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              Admin Protected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Configure WasooliPK AppLock PIN, ISP mobile wallets (JazzCash/EasyPaisa), and receipt templates
          </p>
        </div>
      </div>

      {/* SECTION 1: APPLOCK SECURITY (Featured / High Priority) */}
      <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-900 via-slate-900 to-emerald-950/30 border border-emerald-500/30 shadow-2xl relative overflow-hidden">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
              <Lock className="w-6 h-6 text-slate-950" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-base">WasooliPK AppLock Security Shield</h3>
                <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-bold">
                  Active Protection
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Prevents unauthorized staff from seeing billing dues, changing balances, or opening cash drawer
              </p>
            </div>
          </div>

          <button
            onClick={lockApp}
            className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-600/20 transition-all cursor-pointer"
          >
            <Lock className="w-4 h-4" />
            <span>Lock App Now</span>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left: Toggles & Timeout */}
          <div className="space-y-4">
            {/* Enable / Disable Toggle */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Master AppLock Protection</span>
                <span className="text-[11px] text-slate-400">Require 4-digit PIN upon app launch</span>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={appLockEnabled}
                  onChange={(e) => setAppLockEnabled(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
              </label>
            </div>

            {/* Inactivity Auto-Lock Timeout */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
              <div>
                <span className="text-xs font-bold text-white block">Inactivity Auto-Lock Timeout</span>
                <span className="text-[11px] text-slate-400">Lock automatically if user is idle</span>
              </div>
              <select
                value={autoLockMinutes}
                onChange={(e) => setAutoLockMinutes(Number(e.target.value))}
                className="px-3 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-bold focus:outline-none focus:border-emerald-500 cursor-pointer"
              >
                <option value={1}>1 Minute</option>
                <option value={5}>5 Minutes (Recommended)</option>
                <option value={15}>15 Minutes</option>
                <option value={30}>30 Minutes</option>
                <option value={0}>Disabled (Never)</option>
              </select>
            </div>

            {/* Recovery Question info */}
            <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-xs space-y-1">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Security Recovery Question:
              </span>
              <p className="text-slate-200 font-medium">"{securityQuestion}"</p>
              <p className="text-[10px] text-slate-500">Default Recovery Answer: fibernet</p>
            </div>
          </div>

          {/* Right: Change Master PIN Form */}
          <form onSubmit={handlePinChangeSubmit} className="p-5 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <KeyRound className="w-4 h-4 text-emerald-400" />
              <h4 className="text-xs font-bold text-white uppercase tracking-wider">Change Master PIN</h4>
            </div>

            <div>
              <label className="block text-[11px] text-slate-400 mb-1">Current PIN *</label>
              <input
                type="password"
                maxLength={6}
                required
                placeholder="Enter current PIN"
                value={oldPin}
                onChange={(e) => setOldPin(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">New PIN (4+ digits) *</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="e.g. 5678"
                  value={newPin}
                  onChange={(e) => setNewPin(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>

              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Confirm New PIN *</label>
                <input
                  type="password"
                  maxLength={6}
                  required
                  placeholder="Repeat new PIN"
                  value={confirmPin}
                  onChange={(e) => setConfirmPin(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white font-mono"
                />
              </div>
            </div>

            {pinChangeMsg && (
              <p className={`text-xs flex items-center gap-1 ${pinChangeMsg.type === 'success' ? 'text-emerald-400' : 'text-rose-400'}`}>
                {pinChangeMsg.type === 'success' ? <CheckCircle2 className="w-3.5 h-3.5" /> : <AlertCircle className="w-3.5 h-3.5" />}
                {pinChangeMsg.text}
              </p>
            )}

            <button
              type="submit"
              className="w-full py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all cursor-pointer mt-1"
            >
              Update Master PIN
            </button>
          </form>
        </div>
      </div>

      {/* SECTION 2: ISP Company Profile & Payment Gateways */}
      <form onSubmit={handleProfileSubmit} className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Building className="w-5 h-5 text-cyan-400" />
            <h3 className="font-bold text-white text-base">ISP Business & Payment Gateway Settings</h3>
          </div>
          {profileSaved && (
            <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" />
              Settings Saved!
            </span>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">ISP Business Name *</label>
            <input
              type="text"
              required
              value={profileData.ispName}
              onChange={(e) => setProfileData({ ...profileData, ispName: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white font-bold"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Tagline / Slogan</label>
            <input
              type="text"
              value={profileData.tagline}
              onChange={(e) => setProfileData({ ...profileData, tagline: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Helpline Phone *</label>
            <input
              type="text"
              required
              value={profileData.phone}
              onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">WhatsApp Official Number *</label>
            <input
              type="text"
              required
              value={profileData.whatsappNumber}
              onChange={(e) => setProfileData({ ...profileData, whatsappNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">JazzCash Account Details</label>
            <input
              type="text"
              value={profileData.jazzCashNumber}
              onChange={(e) => setProfileData({ ...profileData, jazzCashNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-rose-300 font-medium"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">EasyPaisa Account Details</label>
            <input
              type="text"
              value={profileData.easyPaisaNumber}
              onChange={(e) => setProfileData({ ...profileData, easyPaisaNumber: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-emerald-300 font-medium"
            />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-xs font-semibold text-slate-300 mb-1">Bank IBFT Account Details</label>
            <input
              type="text"
              value={`${profileData.bankName} - ${profileData.bankIban} (${profileData.bankAccountTitle})`}
              onChange={(e) => setProfileData({ ...profileData, bankAccountTitle: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-cyan-300 font-medium"
            />
          </div>
        </div>

        {/* Thermal Print Slip Template */}
        <div className="pt-3 border-t border-slate-800 space-y-3">
          <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
            Thermal POS Receipt Slip Notice (رسید نوٹس)
          </span>
          <div>
            <label className="block text-[11px] text-slate-400 mb-1">Footer Disclaimer</label>
            <textarea
              rows={2}
              value={profileData.thermalReceiptFooter}
              onChange={(e) => setProfileData({ ...profileData, thermalReceiptFooter: e.target.value })}
              className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white"
            />
          </div>
        </div>

        <button
          type="submit"
          className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs transition-all cursor-pointer shadow-lg shadow-emerald-600/20"
        >
          Save ISP Profile Changes
        </button>
      </form>

      {/* SECTION 3: Database Backup & Reset */}
      <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h4 className="font-bold text-white text-sm">Data Backup & Demo Reset</h4>
          <p className="text-xs text-slate-400 mt-0.5">
            Download JSON snapshot of subscribers, transactions, and settings or reset to demo data
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleBackupJson}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-cyan-400" />
            <span>Download Backup</span>
          </button>

          <button
            onClick={() => {
              if (confirm('Are you sure you want to reset all data to default Pakistani ISP demo data?')) {
                resetAllToDemoData();
              }
            }}
            className="px-3.5 py-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reset Demo Data</span>
          </button>
        </div>
      </div>
    </div>
  );
};
