import React, { useState } from 'react';
import {
  LifeBuoy,
  Plus,
  CheckCircle2,
  Clock,
  AlertTriangle,
  UserCheck,
  Phone,
  MapPin,
  MessageSquare,
  X,
  Send
} from 'lucide-react';
import { useWasooli } from '../context/WasooliContext';
import { Complaint, ComplaintPriority, ComplaintStatus } from '../types/wasooli';

interface Props {
  lang: 'en' | 'ur';
}

export const ComplaintsView: React.FC<Props> = ({ lang }) => {
  const { complaints, subscribers, addComplaint, updateComplaintStatus, settings } = useWasooli();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [resolvingId, setResolvingId] = useState<string | null>(null);
  const [resolutionText, setResolutionText] = useState('');

  // Form State
  const [selectedSubId, setSelectedSubId] = useState('');
  const [category, setCategory] = useState<Complaint['category']>('Fiber Cut / No Signal');
  const [priority, setPriority] = useState<ComplaintPriority>('High');
  const [assignedTechnician, setAssignedTechnician] = useState('Rashid Splicer');
  const [description, setDescription] = useState('');

  const filteredComplaints = complaints.filter((c) => {
    if (statusFilter !== 'all' && c.status !== statusFilter) return false;
    return true;
  });

  const handleOpenAddModal = () => {
    setSelectedSubId(subscribers[0]?.id || '');
    setDescription('');
    setIsAddModalOpen(true);
  };

  const handleCreateComplaint = (e: React.FormEvent) => {
    e.preventDefault();
    const sub = subscribers.find(s => s.id === selectedSubId);
    if (!sub) return;

    addComplaint({
      subscriberId: sub.id,
      subscriberName: sub.fullName,
      subscriberPhone: sub.phone,
      areaName: sub.address,
      category,
      priority,
      status: 'Assigned',
      description,
      assignedTechnician
    });

    setIsAddModalOpen(false);
  };

  const handleResolveSubmit = (id: string) => {
    updateComplaintStatus(id, 'Resolved', resolutionText.trim() || 'Issue inspected and optical fiber signal restored to normal.');
    setResolvingId(null);
    setResolutionText('');
  };

  const handleSendWhatsAppUpdate = (c: Complaint) => {
    const text = `*محترم ${c.subscriberName}!*
آپ کی انٹرنیٹ شکایت برائے *ٹکٹ #${c.ticketNo}* پر ہماری ٹیم کام کر رہی ہے۔
نوعیت: *${c.category}*
مقرر کردہ ٹیکنیشن: *${c.assignedTechnician}*
حالت: *${c.status}*
شکریہ! ${settings.ispName} - فون: ${settings.phone}`;

    const cleanPhone = c.subscriberPhone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {lang === 'en' ? 'Customer Complaints & NOC Ticketing' : 'صارفین کی شکایات اور ٹکٹ سسٹم'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-rose-500/15 text-rose-300 border border-rose-500/20 text-xs font-bold">
              {complaints.filter(c => c.status !== 'Resolved').length} Pending
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Log fiber cuts, optical red lights, WiFi speed issues, and dispatch field splicers
          </p>
        </div>

        <button
          onClick={handleOpenAddModal}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>New Complaint (نئی شکایت)</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl max-w-fit">
        {['all', 'Open', 'In Progress', 'Resolved'].map((st) => (
          <button
            key={st}
            onClick={() => setStatusFilter(st)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
              statusFilter === st
                ? 'bg-emerald-600 text-slate-950 font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            {st === 'all' ? 'All Tickets' : st}
          </button>
        ))}
      </div>

      {/* Tickets List */}
      <div className="space-y-3">
        {filteredComplaints.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900 border border-slate-800 text-slate-500">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
            <p className="text-sm font-semibold text-slate-300">No complaints in this category!</p>
          </div>
        ) : (
          filteredComplaints.map((c) => (
            <div
              key={c.id}
              className="p-4 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
            >
              <div className="space-y-1.5 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                    {c.ticketNo}
                  </span>
                  <span className="text-xs font-bold text-white">{c.subscriberName}</span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.priority === 'Critical'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                        : c.priority === 'High'
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                        : 'bg-slate-800 text-slate-300'
                    }`}
                  >
                    {c.priority} Priority
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      c.status === 'Resolved'
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-amber-500/20 text-amber-300'
                    }`}
                  >
                    {c.status}
                  </span>
                </div>

                <p className="text-xs text-slate-300 font-medium">
                  Issue: <span className="text-white">{c.category}</span> — {c.description}
                </p>

                <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  <span className="flex items-center gap-1">
                    <Phone className="w-3 h-3 text-emerald-400" />
                    {c.subscriberPhone}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserCheck className="w-3 h-3 text-cyan-400" />
                    Tech: <strong className="text-slate-200">{c.assignedTechnician}</strong>
                  </span>
                  <span className="text-slate-500">
                    Logged: {new Date(c.createdAt).toLocaleDateString()}
                  </span>
                </div>

                {c.resolutionNote && (
                  <div className="p-2 rounded-lg bg-emerald-950/30 border border-emerald-800/30 text-[11px] text-emerald-300">
                    <strong>Resolution:</strong> {c.resolutionNote}
                  </div>
                )}
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 self-start sm:self-auto">
                <button
                  onClick={() => handleSendWhatsAppUpdate(c)}
                  title="Send WhatsApp update to customer"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-emerald-500/20 text-emerald-400 border border-slate-700 transition-colors cursor-pointer"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>

                {c.status !== 'Resolved' ? (
                  resolvingId === c.id ? (
                    <div className="flex items-center gap-1">
                      <input
                        type="text"
                        placeholder="Resolution note..."
                        value={resolutionText}
                        onChange={(e) => setResolutionText(e.target.value)}
                        className="px-2 py-1 text-xs bg-slate-800 border border-slate-700 rounded-lg text-white"
                      />
                      <button
                        onClick={() => handleResolveSubmit(c.id)}
                        className="px-2.5 py-1 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg cursor-pointer"
                      >
                        Confirm
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => setResolvingId(c.id)}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 border border-emerald-500/30 text-xs font-semibold cursor-pointer"
                    >
                      Mark Resolved
                    </button>
                  )
                ) : (
                  <span className="text-xs text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Closed
                  </span>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* New Complaint Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto no-print">
          <div className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LifeBuoy className="w-5 h-5 text-rose-400" />
                <h3 className="font-bold text-white text-base">File Customer Complaint (شکایت درج کریں)</h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateComplaint} className="p-5 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Select Subscriber:
                </label>
                <select
                  value={selectedSubId}
                  onChange={(e) => setSelectedSubId(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                >
                  {subscribers.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.username} - {s.fullName} ({s.phone})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Problem Category:
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white cursor-pointer"
                  >
                    <option value="Fiber Cut / No Signal">Fiber Cut / No Signal</option>
                    <option value="ONU Red Light">ONU Red Light (LOS)</option>
                    <option value="Slow Speed / High Ping">Slow Speed / High Ping</option>
                    <option value="Router Config / WiFi">Router Config / WiFi</option>
                    <option value="Billing Dispute">Billing Dispute</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">
                    Priority Level:
                  </label>
                  <select
                    value={priority}
                    onChange={(e) => setPriority(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white cursor-pointer"
                  >
                    <option value="Critical">Critical (Immediate NOC)</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Assign Splicer / Technician:
                </label>
                <select
                  value={assignedTechnician}
                  onChange={(e) => setAssignedTechnician(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white cursor-pointer"
                >
                  <option value="Rashid Splicer (GPON Team)">Rashid Splicer (GPON Team)</option>
                  <option value="NOC Engineer Salman">NOC Engineer Salman</option>
                  <option value="Field Lineman Tariq">Field Lineman Tariq</option>
                  <option value="Zubair Technician">Zubair Technician</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Issue Description:
                </label>
                <textarea
                  required
                  rows={3}
                  placeholder="Describe fault details, street landmark, or optical light status..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2.5 text-xs font-semibold bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl shadow-lg shadow-emerald-600/20 cursor-pointer"
                >
                  Create Ticket & Alert Tech
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
