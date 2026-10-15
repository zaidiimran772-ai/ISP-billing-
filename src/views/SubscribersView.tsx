import React, { useState, useMemo } from 'react';
import {
  Users,
  Search,
  Filter,
  Plus,
  DollarSign,
  Send,
  Router,
  Edit,
  Trash2,
  Phone,
  MapPin,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Activity,
  Tag,
  X,
  CreditCard
} from 'lucide-react';
import { useWasooli } from '../context/WasooliContext';
import { ConnectionStatus, ConnectionType, Subscriber } from '../types/wasooli';

interface Props {
  lang: 'en' | 'ur';
}

export const SubscribersView: React.FC<Props> = ({ lang }) => {
  const {
    subscribers,
    packages,
    areas,
    riders,
    settings,
    setIsQuickWasooliOpen,
    setQuickWasooliSubscriberId,
    addSubscriber,
    updateSubscriber,
    deleteSubscriber,
    toggleMikroTikSession
  } = useWasooli();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingSub, setEditingSub] = useState<Subscriber | null>(null);

  // Form State for Add / Edit
  const [formData, setFormData] = useState({
    username: '',
    fullName: '',
    phone: '',
    cnic: '',
    address: '',
    areaId: areas[0]?.id || '',
    packageId: packages[0]?.id || '',
    monthlyFee: packages[0]?.price || 1800,
    discount: 0,
    balanceDue: 0,
    expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    billingCycleDay: 1,
    status: 'active' as ConnectionStatus,
    connectionType: 'PPPoE' as ConnectionType,
    ipAddress: '172.16.20.120',
    onuSerial: '',
    opticalSignalDbm: -19.5,
    splitterPort: 'Port 1 (Splitter A-01)',
    assignedRiderId: riders[0]?.id || '',
    notes: ''
  });

  // Filter subscribers
  const filteredSubscribers = useMemo(() => {
    return subscribers.filter((sub) => {
      // Status filter
      if (statusFilter === 'active' && sub.status !== 'active') return false;
      if (statusFilter === 'expired' && sub.status !== 'expired') return false;
      if (statusFilter === 'suspended' && sub.status !== 'suspended' && sub.status !== 'disconnected') return false;
      if (statusFilter === 'defaulters' && sub.balanceDue <= 0) return false;

      // Area filter
      if (areaFilter !== 'all' && sub.areaId !== areaFilter) return false;

      // Text search
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          sub.username.toLowerCase().includes(q) ||
          sub.fullName.toLowerCase().includes(q) ||
          sub.phone.includes(q) ||
          (sub.cnic && sub.cnic.includes(q)) ||
          sub.address.toLowerCase().includes(q) ||
          (sub.onuSerial && sub.onuSerial.toLowerCase().includes(q))
        );
      }

      return true;
    });
  }, [subscribers, statusFilter, areaFilter, searchQuery]);

  const handleOpenAddModal = () => {
    setEditingSub(null);
    setFormData({
      username: `fn-khi-${1000 + subscribers.length + 1}`,
      fullName: '',
      phone: '92300',
      cnic: '',
      address: '',
      areaId: areas[0]?.id || '',
      packageId: packages[0]?.id || '',
      monthlyFee: packages[0]?.price || 1800,
      discount: 0,
      balanceDue: 0,
      expiryDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      billingCycleDay: 1,
      status: 'active',
      connectionType: 'PPPoE',
      ipAddress: `172.16.20.${100 + subscribers.length + 1}`,
      onuSerial: `HWTC-${Math.floor(10000000 + Math.random() * 90000000)}`,
      opticalSignalDbm: -19.5,
      splitterPort: 'Port 1 (Main Splitter)',
      assignedRiderId: riders[0]?.id || '',
      notes: ''
    });
    setIsAddModalOpen(true);
  };

  const handleOpenEditModal = (sub: Subscriber) => {
    setEditingSub(sub);
    setFormData({
      username: sub.username,
      fullName: sub.fullName,
      phone: sub.phone,
      cnic: sub.cnic || '',
      address: sub.address,
      areaId: sub.areaId,
      packageId: sub.packageId,
      monthlyFee: sub.monthlyFee,
      discount: sub.discount,
      balanceDue: sub.balanceDue,
      expiryDate: sub.expiryDate,
      billingCycleDay: sub.billingCycleDay,
      status: sub.status,
      connectionType: sub.connectionType,
      ipAddress: sub.ipAddress || '',
      onuSerial: sub.onuSerial || '',
      opticalSignalDbm: sub.opticalSignalDbm || -20,
      splitterPort: sub.splitterPort || '',
      assignedRiderId: sub.assignedRiderId || '',
      notes: sub.notes || ''
    });
    setIsAddModalOpen(true);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSub) {
      updateSubscriber(editingSub.id, formData);
    } else {
      addSubscriber({
        ...formData,
        isMikroTikActive: true
      });
    }
    setIsAddModalOpen(false);
  };

  const handleQuickWasooli = (subId: string) => {
    setQuickWasooliSubscriberId(subId);
    setIsQuickWasooliOpen(true);
  };

  const handleSendWhatsApp = (sub: Subscriber) => {
    const pkg = packages.find(p => p.id === sub.packageId);
    const text = `*محترم ${sub.fullName}!*
*${settings.ispName}* کی طرف سے ماہانہ بل کی تفصیل:
🆔 صارف آئی ڈی: *${sub.username}*
📦 پیکج: ${pkg?.name} (${pkg?.speedMbps} Mbps)
💰 واجب الادا رقم: *${settings.currency} ${sub.balanceDue.toLocaleString()}*
🗓️ آخری تاریخ: *${sub.expiryDate}*
💳 آن لائن ادائیگی (JazzCash/EasyPaisa):
${settings.jazzCashNumber}
شکریہ! برائے رابطہ: ${settings.phone}`;

    const cleanPhone = sub.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {lang === 'en' ? 'Subscribers Directory (صارفین کھاتہ)' : 'صارفین کی فہرست اور کھاتہ'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-semibold">
              {filteredSubscribers.length} / {subscribers.length}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Manage PPPoE accounts, assign fiber splitters, track arrears, and issue WhatsApp reminders
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all active:scale-95 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add New Subscriber (نیا صارف)</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search box */}
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by username, full name, phone number, CNIC, or address..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Area dropdown */}
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="px-3 py-2.5 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Operational Areas (تمام علاقے)</option>
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex flex-wrap items-center gap-2 pt-1 border-t border-slate-800/80">
          <span className="text-xs text-slate-400 font-medium mr-1">Filter Status:</span>
          {[
            { id: 'all', label: 'All Subscribers', count: subscribers.length },
            { id: 'active', label: 'Active (فعال)', count: subscribers.filter(s => s.status === 'active').length },
            { id: 'defaulters', label: 'Defaulters / بقایا', count: subscribers.filter(s => s.balanceDue > 0).length },
            { id: 'expired', label: 'Expired (معطل)', count: subscribers.filter(s => s.status === 'expired').length },
            { id: 'suspended', label: 'Disconnected / کٹ', count: subscribers.filter(s => s.status === 'suspended' || s.status === 'disconnected').length }
          ].map((pill) => (
            <button
              key={pill.id}
              onClick={() => setStatusFilter(pill.id)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                statusFilter === pill.id
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800/50 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {pill.label} ({pill.count})
            </button>
          ))}
        </div>
      </div>

      {/* Subscribers Grid / List */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
        {filteredSubscribers.length === 0 ? (
          <div className="col-span-full p-12 text-center rounded-2xl bg-slate-900 border border-slate-800">
            <Users className="w-10 h-10 text-slate-600 mx-auto mb-2" />
            <p className="text-sm font-semibold text-slate-300">No subscribers match your search criteria</p>
            <p className="text-xs text-slate-500 mt-1">Try resetting the status filter or clearing your search query.</p>
          </div>
        ) : (
          filteredSubscribers.map((sub) => {
            const pkg = packages.find(p => p.id === sub.packageId);
            const area = areas.find(a => a.id === sub.areaId);

            return (
              <div
                key={sub.id}
                className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col justify-between group shadow-sm hover:shadow-md"
              >
                <div>
                  {/* Top Bar: Username & Status Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        {sub.username}
                      </span>
                      <span className="text-[10px] font-semibold text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded">
                        {sub.connectionType}
                      </span>
                    </div>

                    <div className="flex items-center gap-1.5">
                      {sub.status === 'active' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" />
                          <span>Active</span>
                        </span>
                      )}
                      {sub.status === 'expired' && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-400 border border-amber-500/20">
                          <AlertTriangle className="w-3 h-3" />
                          <span>Expired</span>
                        </span>
                      )}
                      {(sub.status === 'suspended' || sub.status === 'disconnected') && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/20">
                          <XCircle className="w-3 h-3" />
                          <span>Cut Off</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Name & Phone */}
                  <h3 className="font-bold text-white text-sm group-hover:text-emerald-400 transition-colors">
                    {sub.fullName}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    <span>{sub.phone}</span>
                    {sub.cnic && <span className="text-[10px] text-slate-500">| {sub.cnic}</span>}
                  </div>

                  {/* Address & Area */}
                  <p className="text-[11px] text-slate-400 mt-2 line-clamp-1">
                    📍 {sub.address}
                  </p>
                  <p className="text-[10px] text-slate-500 mt-0.5">
                    Area: <span className="text-slate-300 font-medium">{area?.name}</span>
                  </p>

                  {/* Package & Optical Info */}
                  <div className="mt-3 p-2.5 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-slate-400 block text-[10px]">Package / Speed:</span>
                      <span className="font-semibold text-white">
                        {pkg?.name} <span className="text-cyan-400">({pkg?.speedMbps} Mbps)</span>
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-400 block text-[10px]">Optical Signal:</span>
                      <span className={`font-mono font-bold ${
                        (sub.opticalSignalDbm || -20) < -25 ? 'text-rose-400' : 'text-emerald-400'
                      }`}>
                        {sub.opticalSignalDbm || -19.5} dBm
                      </span>
                    </div>
                  </div>

                  {/* Expiry & Dues Row */}
                  <div className="mt-2.5 flex items-center justify-between text-xs">
                    <div>
                      <span className="text-[10px] text-slate-500">Expiry Date:</span>
                      <span className="font-semibold text-slate-300 block">{sub.expiryDate}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] text-slate-500">Baqaya / Balance:</span>
                      <span className={`font-black text-sm block ${sub.balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {settings.currency} {sub.balanceDue.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Card Action Buttons */}
                <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between gap-1.5">
                  <button
                    onClick={() => handleQuickWasooli(sub.id)}
                    className="flex-1 py-1.5 px-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center justify-center gap-1 transition-all cursor-pointer shadow-sm"
                  >
                    <DollarSign className="w-3.5 h-3.5 stroke-[2.5]" />
                    <span>Wasooli</span>
                  </button>

                  <button
                    onClick={() => handleSendWhatsApp(sub)}
                    title="Send WhatsApp Bill"
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 border border-slate-700 hover:border-emerald-500/30 transition-colors cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => toggleMikroTikSession(sub.id)}
                    title={sub.isMikroTikActive ? 'Kick / Disable MikroTik Session' : 'Enable MikroTik PPPoE'}
                    className={`p-1.5 rounded-xl border transition-colors cursor-pointer ${
                      sub.isMikroTikActive
                        ? 'bg-slate-800 hover:bg-rose-500/20 text-cyan-400 hover:text-rose-400 border-slate-700 hover:border-rose-500/30'
                        : 'bg-rose-500/20 text-rose-300 border-rose-500/30 hover:bg-emerald-500/20 hover:text-emerald-300'
                    }`}
                  >
                    <Router className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => handleOpenEditModal(sub)}
                    title="Edit Profile"
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 hover:text-white border border-slate-700 transition-colors cursor-pointer"
                  >
                    <Edit className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`Are you sure you want to delete subscriber ${sub.fullName}?`)) {
                        deleteSubscriber(sub.id);
                      }
                    }}
                    title="Delete Account"
                    className="p-1.5 rounded-xl bg-slate-800 hover:bg-rose-500/20 text-slate-400 hover:text-rose-400 border border-slate-700 hover:border-rose-500/30 transition-colors cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Add / Edit Subscriber Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto no-print">
          <div className="w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden my-8">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Users className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">
                    {editingSub ? 'Edit Subscriber Profile' : 'Register New Subscriber (صارف نیا اندراج)'}
                  </h3>
                  <p className="text-xs text-slate-400">Configure PPPoE credentials, GPON fiber drop, and billing cycle</p>
                </div>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleFormSubmit} className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
              {/* Basic Info */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    PPPoE Username / Client ID *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-mono bg-slate-800 border border-slate-700 rounded-xl text-emerald-400 font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Subscriber Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mian Tariq Mahmood"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Mobile / WhatsApp No (923XXXXXXXXX) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="923001234567"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    CNIC No (National Identity Card)
                  </label>
                  <input
                    type="text"
                    placeholder="42101-1234567-1"
                    value={formData.cnic}
                    onChange={(e) => setFormData({ ...formData, cnic: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Address & Area */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Installation Address *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="House #, Street, Block, Building"
                    value={formData.address}
                    onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Area / Zone *
                  </label>
                  <select
                    value={formData.areaId}
                    onChange={(e) => setFormData({ ...formData, areaId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {areas.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Package, Monthly Fee & Dues */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Internet Package *
                  </label>
                  <select
                    value={formData.packageId}
                    onChange={(e) => {
                      const pId = e.target.value;
                      const selected = packages.find(p => p.id === pId);
                      setFormData({
                        ...formData,
                        packageId: pId,
                        monthlyFee: selected?.price || 1800
                      });
                    }}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {packages.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.speedMbps}M) - {settings.currency} {p.price}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Monthly Fee ({settings.currency}) *
                  </label>
                  <input
                    type="number"
                    value={formData.monthlyFee}
                    onChange={(e) => setFormData({ ...formData, monthlyFee: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs font-bold text-white bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Initial Balance Due / بقایا
                  </label>
                  <input
                    type="number"
                    value={formData.balanceDue}
                    onChange={(e) => setFormData({ ...formData, balanceDue: Number(e.target.value) })}
                    className="w-full px-3 py-2 text-xs text-rose-400 font-bold bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              {/* Expiry Date & Rider */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Expiry Date / تاریخ انقضاء *
                  </label>
                  <input
                    type="date"
                    required
                    value={formData.expiryDate}
                    onChange={(e) => setFormData({ ...formData, expiryDate: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Assigned Recovery Rider (ریکوری عملہ)
                  </label>
                  <select
                    value={formData.assignedRiderId}
                    onChange={(e) => setFormData({ ...formData, assignedRiderId: e.target.value })}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                  >
                    {riders.map((r) => (
                      <option key={r.id} value={r.id}>
                        {r.name} ({r.phone})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Fiber & Hardware Details */}
              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 space-y-3">
                <span className="text-[11px] font-bold text-slate-300 uppercase tracking-wider block">
                  GPON Fiber & Modem Hardware Details (او این یو و سپلٹر)
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">ONU Serial (GPON Modem)</label>
                    <input
                      type="text"
                      placeholder="e.g. HWTC-19482012"
                      value={formData.onuSerial}
                      onChange={(e) => setFormData({ ...formData, onuSerial: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Optical Signal (dBm)</label>
                    <input
                      type="number"
                      step="0.1"
                      placeholder="-19.5"
                      value={formData.opticalSignalDbm}
                      onChange={(e) => setFormData({ ...formData, opticalSignalDbm: Number(e.target.value) })}
                      className="w-full px-2.5 py-1.5 text-xs font-mono bg-slate-800 border border-slate-700 rounded-lg text-emerald-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] text-slate-400 mb-1">Splitter / Drop Box Port</label>
                    <input
                      type="text"
                      placeholder="Port 3 (Splitter G-1)"
                      value={formData.splitterPort}
                      onChange={(e) => setFormData({ ...formData, splitterPort: e.target.value })}
                      className="w-full px-2.5 py-1.5 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white"
                    />
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  {editingSub ? 'Update Subscriber' : 'Save Subscriber & Activate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
