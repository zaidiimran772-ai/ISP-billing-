import React, { useState } from 'react';
import {
  Bike,
  DollarSign,
  CheckCircle2,
  Phone,
  MapPin,
  Calendar,
  Layers,
  ArrowRightLeft,
  X
} from 'lucide-react';
import { useWasooli } from '../context/WasooliContext';
import { RecoveryRider } from '../types/wasooli';

interface Props {
  lang: 'en' | 'ur';
}

export const RidersView: React.FC<Props> = ({ lang }) => {
  const { riders, areas, subscribers, updateRiderHandover, settings } = useWasooli();

  const [handoverModalRider, setHandoverModalRider] = useState<RecoveryRider | null>(null);
  const [handoverAmount, setHandoverAmount] = useState<number>(0);

  const handleOpenHandover = (rider: RecoveryRider) => {
    setHandoverModalRider(rider);
    const unhanded = Math.max(0, rider.collectedToday - rider.cashHandedOver);
    setHandoverAmount(unhanded);
  };

  const handleConfirmHandover = (e: React.FormEvent) => {
    e.preventDefault();
    if (!handoverModalRider || handoverAmount <= 0) return;
    updateRiderHandover(handoverModalRider.id, Number(handoverAmount));
    setHandoverModalRider(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {lang === 'en' ? 'Field Recovery Officers (ریکوری عملہ)' : 'فیلڈ ریکوری عملہ اور کیش جمع'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              {riders.length} Active Riders
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Track daily doorstep collections, cash reconciliation, and office cash drawer handovers
          </p>
        </div>
      </div>

      {/* Riders Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {riders.map((rider) => {
          const assignedAreas = areas.filter(a => rider.areaIds.includes(a.id));
          const riderSubscribers = subscribers.filter(s => s.assignedRiderId === rider.id);
          const totalArrearsInArea = riderSubscribers.reduce((sum, s) => sum + s.balanceDue, 0);
          const cashInPocket = Math.max(0, rider.collectedToday - rider.cashHandedOver);

          return (
            <div
              key={rider.id}
              className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col justify-between space-y-4"
            >
              <div>
                {/* Rider Top */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2.5">
                    <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-400 border border-amber-500/20 flex items-center justify-center font-bold">
                      <Bike className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-bold text-white text-sm">{rider.name}</h3>
                      <span className="text-[11px] text-slate-400">{rider.phone}</span>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                    Active
                  </span>
                </div>

                {/* Assigned Areas */}
                <div className="mt-3 space-y-1">
                  <span className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
                    Assigned Zones ({assignedAreas.length}):
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {assignedAreas.map(a => (
                      <span key={a.id} className="text-[11px] px-2 py-0.5 rounded-lg bg-slate-800 text-slate-300">
                        {a.name}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="mt-4 p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Total Collected Today:</span>
                    <span className="font-bold text-emerald-400">
                      {settings.currency} {rider.collectedToday.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Cash Handed Over:</span>
                    <span className="text-slate-200">
                      {settings.currency} {rider.cashHandedOver.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between pt-1 border-t border-slate-800 font-bold">
                    <span className="text-amber-400">Cash in Pocket:</span>
                    <span className="text-amber-300">
                      {settings.currency} {cashInPocket.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[11px] text-slate-500 pt-1">
                    <span>Subscribers in Route:</span>
                    <span>{riderSubscribers.length} (Due: {settings.currency} {totalArrearsInArea.toLocaleString()})</span>
                  </div>
                </div>
              </div>

              {/* Handover Button */}
              <button
                onClick={() => handleOpenHandover(rider)}
                className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs border border-slate-700 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" />
                <span>Receive Cash Handover (کیش وصولی)</span>
              </button>
            </div>
          );
        })}
      </div>

      {/* Cash Handover Settlement Modal */}
      {handoverModalRider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto no-print">
          <div className="w-full max-w-sm bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                <div>
                  <h3 className="font-bold text-white text-sm">Rider Cash Settlement</h3>
                  <p className="text-xs text-slate-400">{handoverModalRider.name}</p>
                </div>
              </div>
              <button
                onClick={() => setHandoverModalRider(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleConfirmHandover} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Cash Handover Amount ({settings.currency}):
                </label>
                <input
                  type="number"
                  min={1}
                  required
                  value={handoverAmount}
                  onChange={(e) => setHandoverAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold text-white bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500"
                />
              </div>

              <p className="text-[11px] text-slate-400">
                This will officially credit the Head Office cash drawer and reconcile the rider's daily collection sheet.
              </p>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setHandoverModalRider(null)}
                  className="flex-1 py-2 text-xs bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl cursor-pointer"
                >
                  Confirm Cash Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
