import React, { useState } from 'react';
import {
  BarChart3,
  Printer,
  Download,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  FileSpreadsheet,
  Building,
  DollarSign
} from 'lucide-react';
import { useWasooli } from '../context/WasooliContext';

interface Props {
  lang: 'en' | 'ur';
}

export const ReportsView: React.FC<Props> = ({ lang }) => {
  const { subscribers, transactions, areas, riders, settings } = useWasooli();

  const [activeReportTab, setActiveReportTab] = useState<'defaulters' | 'dailyWasooli' | 'areaWise'>('defaulters');
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // Defaulters list
  const defaulters = subscribers.filter(s => s.balanceDue > 0).sort((a, b) => b.balanceDue - a.balanceDue);
  const totalDefaulterDues = defaulters.reduce((sum, s) => sum + s.balanceDue, 0);

  // Daily Wasooli
  const dayTransactions = transactions.filter(t => t.timestamp.startsWith(selectedDate));
  const dayTotal = dayTransactions.reduce((sum, t) => sum + t.amount, 0);

  const handleExportDefaultersCSV = () => {
    const headers = ['Username', 'Full Name', 'Phone', 'Address', 'Area', 'Monthly Fee', 'Balance Due (PKR)', 'Expiry Date', 'Status'];
    const rows = defaulters.map(d => {
      const area = areas.find(a => a.id === d.areaId);
      return [
        `"${d.username}"`,
        `"${d.fullName}"`,
        `"${d.phone}"`,
        `"${d.address.replace(/"/g, '""')}"`,
        `"${area?.name || ''}"`,
        d.monthlyFee,
        d.balanceDue,
        `"${d.expiryDate}"`,
        `"${d.status}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `WasooliPK_Defaulters_Report_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 no-print">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {lang === 'en' ? 'ISP Financial Reports & Defaulter Audits' : 'رپورٹس اور بقایاجات لسٹ'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-bold">
              Audit Ready
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Export official Excel/CSV sheets and print daily recovery summaries
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <button
            onClick={handleExportDefaultersCSV}
            className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer"
          >
            <Download className="w-4 h-4 text-emerald-400" />
            <span>Export CSV / Excel</span>
          </button>

          <button
            onClick={handlePrint}
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <Printer className="w-4 h-4" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Report Type Selector Pills */}
      <div className="flex items-center gap-2 p-1 bg-slate-900 border border-slate-800 rounded-xl max-w-fit no-print">
        <button
          onClick={() => setActiveReportTab('defaulters')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeReportTab === 'defaulters'
              ? 'bg-emerald-600 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Defaulters List (بقایاجات)
        </button>

        <button
          onClick={() => setActiveReportTab('dailyWasooli')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeReportTab === 'dailyWasooli'
              ? 'bg-emerald-600 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Daily Wasooli Sheet (روزانہ وصولی)
        </button>

        <button
          onClick={() => setActiveReportTab('areaWise')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all cursor-pointer ${
            activeReportTab === 'areaWise'
              ? 'bg-emerald-600 text-slate-950 font-bold'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Area-Wise Recovery (علاقہ وائز)
        </button>
      </div>

      {/* Tab 1: Defaulters List */}
      {activeReportTab === 'defaulters' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-rose-950/20 border border-rose-900/30 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <div>
                <span className="font-bold text-rose-200">Total Unrecovered Arrears (کل بقایا جات):</span>
                <p className="text-[11px] text-rose-300/80">{defaulters.length} Subscribers with outstanding bills</p>
              </div>
            </div>
            <span className="text-xl font-black text-rose-400">
              {settings.currency} {totalDefaulterDues.toLocaleString()}
            </span>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">User ID</th>
                    <th className="py-3 px-4">Subscriber Name</th>
                    <th className="py-3 px-4">Phone / WhatsApp</th>
                    <th className="py-3 px-4">Address & Area</th>
                    <th className="py-3 px-4">Monthly Fee</th>
                    <th className="py-3 px-4">Balance Due</th>
                    <th className="py-3 px-4">Expired On</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {defaulters.map((d) => {
                    const area = areas.find(a => a.id === d.areaId);
                    return (
                      <tr key={d.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">{d.username}</td>
                        <td className="py-3 px-4 font-bold text-white">{d.fullName}</td>
                        <td className="py-3 px-4 text-slate-300">{d.phone}</td>
                        <td className="py-3 px-4 text-slate-400">{d.address} ({area?.name})</td>
                        <td className="py-3 px-4 text-slate-300">{settings.currency} {d.monthlyFee.toLocaleString()}</td>
                        <td className="py-3 px-4 font-black text-rose-400 text-sm">
                          {settings.currency} {d.balanceDue.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-400">{d.expiryDate}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Daily Wasooli Sheet */}
      {activeReportTab === 'dailyWasooli' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs no-print">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-emerald-400" />
              <span className="font-semibold text-slate-300">Select Date for Day Book:</span>
              <input
                type="date"
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white"
              />
            </div>

            <div>
              <span className="text-slate-400">Total Wasooli on {selectedDate}: </span>
              <span className="font-black text-emerald-400 text-base">
                {settings.currency} {dayTotal.toLocaleString()}
              </span>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
                  <tr>
                    <th className="py-3 px-4">Receipt #</th>
                    <th className="py-3 px-4">Subscriber</th>
                    <th className="py-3 px-4">Amount</th>
                    <th className="py-3 px-4">Channel</th>
                    <th className="py-3 px-4">Collector</th>
                    <th className="py-3 px-4">Time</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {dayTransactions.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500">
                        No transactions found for this date.
                      </td>
                    </tr>
                  ) : (
                    dayTransactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-800/40">
                        <td className="py-3 px-4 font-mono font-bold text-emerald-400">{tx.receiptNo}</td>
                        <td className="py-3 px-4 text-white font-medium">{tx.subscriberName}</td>
                        <td className="py-3 px-4 font-black text-emerald-400">
                          {settings.currency} {tx.amount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-slate-300">{tx.paymentMethod}</td>
                        <td className="py-3 px-4 text-slate-300">{tx.collectedByName}</td>
                        <td className="py-3 px-4 text-slate-400">
                          {new Date(tx.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Area-wise recovery breakdown */}
      {activeReportTab === 'areaWise' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {areas.map((area) => {
            const areaSubs = subscribers.filter(s => s.areaId === area.id);
            const areaDues = areaSubs.reduce((sum, s) => sum + s.balanceDue, 0);
            const activeSubs = areaSubs.filter(s => s.status === 'active').length;

            return (
              <div key={area.id} className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <h4 className="font-bold text-white text-sm">{area.name}</h4>
                  <span className="text-xs text-slate-400">{area.city}</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-slate-950/60 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Total Users</span>
                    <span className="font-bold text-white">{areaSubs.length}</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Active</span>
                    <span className="font-bold text-emerald-400">{activeSubs}</span>
                  </div>
                  <div className="p-2 bg-slate-950/60 rounded-xl">
                    <span className="text-[10px] text-slate-400 block">Arrears Due</span>
                    <span className="font-bold text-rose-400">{settings.currency} {areaDues.toLocaleString()}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
