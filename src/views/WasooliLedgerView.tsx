import React, { useState, useMemo } from 'react';
import {
  DollarSign,
  Printer,
  Share2,
  Search,
  Filter,
  Calendar,
  CreditCard,
  Building,
  CheckCircle2,
  FileSpreadsheet
} from 'lucide-react';
import { useWasooli } from '../context/WasooliContext';
import { PaymentMethod, Transaction } from '../types/wasooli';

interface Props {
  lang: 'en' | 'ur';
}

export const WasooliLedgerView: React.FC<Props> = ({ lang }) => {
  const { transactions, settings, setActiveReceipt, setIsQuickWasooliOpen } = useWasooli();

  const [searchQuery, setSearchQuery] = useState('');
  const [methodFilter, setMethodFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<string>('');

  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      if (methodFilter !== 'all' && tx.paymentMethod !== methodFilter) return false;
      if (dateFilter && !tx.timestamp.startsWith(dateFilter)) return false;

      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        return (
          tx.receiptNo.toLowerCase().includes(q) ||
          tx.subscriberName.toLowerCase().includes(q) ||
          tx.subscriberUsername.toLowerCase().includes(q) ||
          tx.collectedByName.toLowerCase().includes(q)
        );
      }
      return true;
    });
  }, [transactions, methodFilter, dateFilter, searchQuery]);

  const totalFilteredAmount = useMemo(() => {
    return filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
  }, [filteredTransactions]);

  const handlePrintThermal = (tx: Transaction) => {
    setActiveReceipt(tx);
  };

  const handleShareWhatsApp = (tx: Transaction) => {
    const text = `*${settings.ispName.toUpperCase()} - PAYMENT RECEIPT*
Receipt #: *${tx.receiptNo}*
Subscriber: *${tx.subscriberName}* (${tx.subscriberUsername})
Amount Received: *${settings.currency} ${tx.amount.toLocaleString()}*
Payment Method: *${tx.paymentMethod}*
Collector: *${tx.collectedByName}*
Remaining Dues: *${settings.currency} ${tx.remainingBalance.toLocaleString()}*
شکریہ! رابطہ: ${settings.phone}`;

    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {lang === 'en' ? 'Wasooli Day Book & Receipts (رسیدات کھاتہ)' : 'وصولی کی تمام رسیدیں اور کھاتہ'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-bold">
              {filteredTransactions.length} Receipts
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time ISP collection audit log, thermal invoice reprinting, and WhatsApp dispatch history
          </p>
        </div>

        <button
          onClick={() => setIsQuickWasooliOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer self-start sm:self-auto"
        >
          <DollarSign className="w-4 h-4 stroke-[3]" />
          <span>New Collection Entry</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
            <input
              type="text"
              placeholder="Search by receipt #, subscriber name, username, or collector..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Method filter */}
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="px-3 py-2.5 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
            >
              <option value="all">All Channels (تمام ذرائع)</option>
              <option value="Cash">💵 Cash</option>
              <option value="JazzCash">📱 JazzCash</option>
              <option value="EasyPaisa">🟢 EasyPaisa</option>
              <option value="BankTransfer">🏦 Bank IBFT</option>
              <option value="Nayapay">💳 Nayapay</option>
            </select>

            {/* Date filter */}
            <input
              type="date"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="px-3 py-2 text-xs bg-slate-950/80 border border-slate-700/80 rounded-xl text-slate-200 focus:outline-none focus:border-emerald-500"
            />

            {dateFilter && (
              <button
                onClick={() => setDateFilter('')}
                className="px-2 py-1 text-[11px] text-rose-400 hover:underline cursor-pointer"
              >
                Clear Date
              </button>
            )}
          </div>
        </div>

        {/* Total volume indicator */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-800/80 text-xs">
          <span className="text-slate-400">Total Wasooli in Filtered View:</span>
          <span className="font-extrabold text-emerald-400 text-sm">
            {settings.currency} {totalFilteredAmount.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Table of Transactions */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 font-semibold uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Receipt #</th>
                <th className="py-3 px-4">Subscriber</th>
                <th className="py-3 px-4">Amount Received</th>
                <th className="py-3 px-4">Remaining Dues</th>
                <th className="py-3 px-4">Channel</th>
                <th className="py-3 px-4">Received By</th>
                <th className="py-3 px-4">Date & Time</th>
                <th className="py-3 px-4 text-right">Receipt Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-500">
                    No transactions match the selected filters.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4 font-mono font-bold text-emerald-400">
                      {tx.receiptNo}
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white">{tx.subscriberName}</div>
                      <div className="font-mono text-[11px] text-slate-400">{tx.subscriberUsername}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-black text-emerald-400 text-sm">
                        {settings.currency} {tx.amount.toLocaleString()}
                      </span>
                      {tx.discount > 0 && (
                        <div className="text-[10px] text-amber-400">
                          Disc: {settings.currency} {tx.discount.toLocaleString()}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`font-semibold ${tx.remainingBalance > 0 ? 'text-rose-400' : 'text-emerald-400'}`}>
                        {settings.currency} {tx.remainingBalance.toLocaleString()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2 py-0.5 rounded-lg text-[11px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">
                        {tx.paymentMethod}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300 font-medium">
                      {tx.collectedByName}
                    </td>
                    <td className="py-3 px-4 text-slate-400">
                      <div>{new Date(tx.timestamp).toLocaleDateString()}</div>
                      <div className="text-[10px] text-slate-500">
                        {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handlePrintThermal(tx)}
                          title="Print Thermal 58/80mm POS Slip"
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-slate-700 transition-colors cursor-pointer"
                        >
                          <Printer className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleShareWhatsApp(tx)}
                          title="Send to WhatsApp"
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/20 transition-colors cursor-pointer"
                        >
                          <Share2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
