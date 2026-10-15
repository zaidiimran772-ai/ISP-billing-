import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Search, DollarSign, UserCheck, Smartphone, Building, ShieldCheck, Tag, FileText } from 'lucide-react';
import { useWasooli } from '../context/WasooliContext';
import { PaymentMethod, Subscriber } from '../types/wasooli';

export const QuickWasooliModal: React.FC = () => {
  const {
    isQuickWasooliOpen,
    setIsQuickWasooliOpen,
    quickWasooliSubscriberId,
    setQuickWasooliSubscriberId,
    subscribers,
    packages,
    riders,
    settings,
    recordWasooli
  } = useWasooli();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSubId, setSelectedSubId] = useState<string>('');
  const [amountPaid, setAmountPaid] = useState<number>(0);
  const [discount, setDiscount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('Cash');
  const [selectedCollector, setSelectedCollector] = useState<string>('Counter Cashier (Admin)');
  const [selectedRiderId, setSelectedRiderId] = useState<string>('');
  const [notes, setNotes] = useState<string>('');
  const [extendExpiryMonths, setExtendExpiryMonths] = useState<number>(1);

  // When opened with a preselected subscriber ID
  useEffect(() => {
    if (quickWasooliSubscriberId) {
      setSelectedSubId(quickWasooliSubscriberId);
      const sub = subscribers.find(s => s.id === quickWasooliSubscriberId);
      if (sub) {
        // Pre-fill bill amount
        const due = sub.balanceDue > 0 ? sub.balanceDue : (sub.monthlyFee - sub.discount);
        setAmountPaid(due);
        setDiscount(0);
      }
    }
  }, [quickWasooliSubscriberId, subscribers]);

  const selectedSub = useMemo(() => {
    return subscribers.find(s => s.id === selectedSubId);
  }, [subscribers, selectedSubId]);

  const selectedPkg = useMemo(() => {
    return packages.find(p => p.id === selectedSub?.packageId);
  }, [packages, selectedSub]);

  // Filter subscribers for search
  const filteredSubscribers = useMemo(() => {
    if (!searchQuery.trim()) return subscribers.slice(0, 5);
    const q = searchQuery.toLowerCase();
    return subscribers.filter(s =>
      s.username.toLowerCase().includes(q) ||
      s.fullName.toLowerCase().includes(q) ||
      s.phone.includes(q) ||
      s.address.toLowerCase().includes(q)
    );
  }, [subscribers, searchQuery]);

  const handleSelectSub = (sub: Subscriber) => {
    setSelectedSubId(sub.id);
    const defaultAmount = sub.balanceDue > 0 ? sub.balanceDue : (sub.monthlyFee - sub.discount);
    setAmountPaid(defaultAmount);
    setDiscount(0);
    setSearchQuery('');
  };

  const handleCollectorChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val.startsWith('rider:')) {
      const riderId = val.replace('rider:', '');
      const rider = riders.find(r => r.id === riderId);
      setSelectedRiderId(riderId);
      setSelectedCollector(rider ? rider.name : val);
    } else {
      setSelectedRiderId('');
      setSelectedCollector(val);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSubId || amountPaid <= 0) return;

    recordWasooli({
      subscriberId: selectedSubId,
      amount: Number(amountPaid),
      discount: Number(discount),
      paymentMethod,
      collectedByRiderId: selectedRiderId || undefined,
      collectedByName: selectedCollector,
      notes: notes.trim() || undefined,
      extendExpiryMonths
    });

    // Close this modal
    setIsQuickWasooliOpen(false);
    setQuickWasooliSubscriberId(null);
  };

  if (!isQuickWasooliOpen) return null;

  const currentDues = selectedSub ? selectedSub.balanceDue : 0;
  const remainingPreview = selectedSub ? Math.max(0, currentDues - (amountPaid + discount)) : 0;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto no-print">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/90">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <DollarSign className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-base">Quick Wasooli Entry (وصولی انٹری)</h3>
                <p className="text-xs text-slate-400">Receive cash, JazzCash, EasyPaisa & generate receipt</p>
              </div>
            </div>
            <button
              onClick={() => {
                setIsQuickWasooliOpen(false);
                setQuickWasooliSubscriberId(null);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto">
            {/* Subscriber Selection / Search */}
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1.5 flex items-center justify-between">
                <span>Select Subscriber / صارف منتخب کریں:</span>
                {selectedSub && (
                  <button
                    type="button"
                    onClick={() => setSelectedSubId('')}
                    className="text-cyan-400 hover:underline text-[11px] font-normal cursor-pointer"
                  >
                    Change Subscriber
                  </button>
                )}
              </label>

              {!selectedSub ? (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search username (PPPoE), name, phone..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div className="space-y-1.5 max-h-40 overflow-y-auto pr-1">
                    {filteredSubscribers.map((s) => (
                      <div
                        key={s.id}
                        onClick={() => handleSelectSub(s)}
                        className="p-2.5 rounded-xl bg-slate-800/60 hover:bg-slate-750 border border-slate-700/60 flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-emerald-400">{s.username}</span>
                            <span className="text-xs text-white font-medium">{s.fullName}</span>
                          </div>
                          <span className="text-[11px] text-slate-400">{s.phone} • {s.address.slice(0, 30)}...</span>
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-bold text-amber-400 block">
                            {settings.currency} {s.balanceDue.toLocaleString()}
                          </span>
                          <span className="text-[10px] text-slate-400">Due</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                /* Selected Subscriber Card */
                <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                        {selectedSub.username}
                      </span>
                      <span className="text-sm font-bold text-white">{selectedSub.fullName}</span>
                    </div>
                    <p className="text-xs text-slate-300 mt-1">{selectedSub.phone} • {selectedSub.address}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Pkg: <span className="text-cyan-400 font-semibold">{selectedPkg?.name} ({selectedPkg?.speedMbps} Mbps)</span> | Expiry: {selectedSub.expiryDate}
                    </p>
                  </div>
                  <div className="text-right bg-slate-900/60 p-2 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase font-medium">Baqaya / Due</span>
                    <span className={`text-base font-black ${selectedSub.balanceDue > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                      {settings.currency} {selectedSub.balanceDue.toLocaleString()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {selectedSub && (
              <>
                {/* Amount Paid & Discount Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Amount Received (روپے موصول) *
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
                        {settings.currency}
                      </span>
                      <input
                        type="number"
                        min={1}
                        value={amountPaid}
                        onChange={(e) => setAmountPaid(Number(e.target.value))}
                        className="w-full pl-10 pr-3 py-2 text-sm font-bold text-white bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500"
                        required
                      />
                    </div>
                    {/* Quick amount presets */}
                    <div className="flex items-center gap-1.5 mt-1.5">
                      <button
                        type="button"
                        onClick={() => setAmountPaid(selectedSub.balanceDue > 0 ? selectedSub.balanceDue : (selectedSub.monthlyFee - selectedSub.discount))}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-400 cursor-pointer"
                      >
                        Full Due ({settings.currency} {selectedSub.balanceDue > 0 ? selectedSub.balanceDue : (selectedSub.monthlyFee - selectedSub.discount)})
                      </button>
                      <button
                        type="button"
                        onClick={() => setAmountPaid(selectedSub.monthlyFee)}
                        className="text-[10px] px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 cursor-pointer"
                      >
                        1 Month ({settings.currency} {selectedSub.monthlyFee})
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1 flex items-center gap-1">
                      <Tag className="w-3.5 h-3.5 text-amber-400" />
                      <span>Discount / رعایت (if any)</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-xs text-slate-400 font-bold">
                        {settings.currency}
                      </span>
                      <input
                        type="number"
                        min={0}
                        value={discount}
                        onChange={(e) => setDiscount(Number(e.target.value))}
                        className="w-full pl-10 pr-3 py-2 text-sm text-white bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Payment Method Selector */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Payment Channel / ادائیگی کا ذریعہ:
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                    {(['Cash', 'JazzCash', 'EasyPaisa', 'BankTransfer', 'Nayapay'] as PaymentMethod[]).map((method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() => setPaymentMethod(method)}
                        className={`py-2 px-2 text-xs font-semibold rounded-xl border transition-all text-center cursor-pointer ${
                          paymentMethod === method
                            ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400 shadow-sm'
                            : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        {method}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Collected By (Rider or Office Counter) */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Received By / وصول کنندہ:
                    </label>
                    <select
                      onChange={handleCollectorChange}
                      className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value="Counter Cashier (Admin)">🏢 Head Office Counter</option>
                      {riders.map((r) => (
                        <option key={r.id} value={`rider:${r.id}`}>
                          🛵 {r.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Extend Expiry Cycle:
                    </label>
                    <select
                      value={extendExpiryMonths}
                      onChange={(e) => setExtendExpiryMonths(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500 cursor-pointer"
                    >
                      <option value={1}>+1 Month (Standard)</option>
                      <option value={2}>+2 Months</option>
                      <option value={3}>+3 Months (Quarterly)</option>
                      <option value={0}>Do Not Extend Expiry</option>
                    </select>
                  </div>
                </div>

                {/* Notes or TID */}
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Transaction Note / JazzCash TID:
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. JazzCash TID 998012 or collected at doorstep"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                  />
                </div>

                {/* Live Summary Calculation */}
                <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400">Remaining Balance after Wasooli:</span>
                    <span className="block font-bold text-white text-sm">
                      {settings.currency} {remainingPreview.toLocaleString()}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-emerald-400 font-semibold block flex items-center gap-1 justify-end">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      MikroTik Auto Unblock
                    </span>
                    <span className="text-[10px] text-slate-500">Auto SMS & WhatsApp Receipt</span>
                  </div>
                </div>
              </>
            )}

            {/* Actions */}
            <div className="pt-2 flex items-center gap-3">
              <button
                type="button"
                onClick={() => {
                  setIsQuickWasooliOpen(false);
                  setQuickWasooliSubscriberId(null);
                }}
                className="flex-1 py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={!selectedSubId || amountPaid <= 0}
                className="flex-1 py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg shadow-emerald-600/20 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
              >
                <CheckCircle2Icon className="w-4 h-4" />
                <span>Save Wasooli & Print Slip</span>
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const CheckCircle2Icon = ({ className }: { className?: string }) => (
  <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
  </svg>
);
