import React, { useState } from 'react';
import {
  ReceiptText,
  Plus,
  Trash2,
  DollarSign,
  TrendingDown,
  Building,
  Fuel,
  Wrench,
  Users,
  X
} from 'lucide-react';
import { useWasooli } from '../context/WasooliContext';
import { ExpenseRecord, PaymentMethod } from '../types/wasooli';

interface Props {
  lang: 'en' | 'ur';
}

export const ExpensesView: React.FC<Props> = ({ lang }) => {
  const { expenses, addExpense, deleteExpense, metrics, settings } = useWasooli();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseRecord['category']>('Upstream Bandwidth');
  const [amount, setAmount] = useState<number>(0);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [paidTo, setPaidTo] = useState('');
  const [paymentMode, setPaymentMode] = useState<PaymentMethod>('BankTransfer');
  const [notes, setNotes] = useState('');

  const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
  const netEstimatedProfit = (metrics.collectedToday + 95000) - totalExpenses;

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) return;

    addExpense({
      title,
      category,
      amount: Number(amount),
      date,
      paidTo,
      paymentMode,
      notes
    });

    setIsAddModalOpen(false);
    setTitle('');
    setAmount(0);
    setNotes('');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {lang === 'en' ? 'Accounts & Roznamcha (روزنامچہ و اخراجات)' : 'روزنامچہ و ماہانہ اخراجات'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 text-xs font-bold">
              {expenses.length} Records
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Log upstream bandwidth transit, generator fuel, lineman salaries, and optical fiber hardware
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg shadow-emerald-600/20 cursor-pointer self-start sm:self-auto"
        >
          <Plus className="w-4 h-4 stroke-[3]" />
          <span>Add Expense (خرچہ درج کریں)</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Total Expenses / کل اخراجات</span>
          <div className="mt-2 text-2xl font-black text-rose-400">
            {settings.currency} {totalExpenses.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">Upstream, Ops & Hardware</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Estimated Month Recovery</span>
          <div className="mt-2 text-2xl font-black text-emerald-400">
            {settings.currency} {(metrics.collectedToday + 95000).toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500">Subscribers billing collected</span>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 uppercase">Net ISP Gross Margin</span>
          <div className="mt-2 text-2xl font-black text-white">
            {settings.currency} {netEstimatedProfit.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-400 font-medium">Positive Cash Flow</span>
        </div>
      </div>

      {/* Expenses Table */}
      <div className="rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">Title / Description</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Paid To</th>
                <th className="py-3 px-4">Date</th>
                <th className="py-3 px-4">Method</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {expenses.map((exp) => (
                <tr key={exp.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="py-3 px-4 font-semibold text-white">
                    {exp.title}
                    {exp.notes && <div className="text-[10px] text-slate-400 font-normal">{exp.notes}</div>}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-slate-800 text-slate-300 border border-slate-700">
                      {exp.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 font-bold text-rose-400">
                    {settings.currency} {exp.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-4 text-slate-300">
                    {exp.paidTo}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {exp.date}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {exp.paymentMode}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => deleteExpense(exp.id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 cursor-pointer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Expense Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto no-print">
          <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <h3 className="font-bold text-white text-base">Add ISP Expense (خرچہ درج کریں)</h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateExpense} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Expense Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Splicing Machine Electrodes & Fiber Tools"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white cursor-pointer"
                  >
                    <option value="Upstream Bandwidth">Upstream Bandwidth</option>
                    <option value="Staff Salaries">Staff Salaries</option>
                    <option value="Fuel / Generator">Fuel / Generator</option>
                    <option value="Fiber Tools & Hardware">Fiber Tools & Hardware</option>
                    <option value="Office Rent">Office Rent</option>
                    <option value="Other">Other Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Amount ({settings.currency}) *</label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs font-bold text-white bg-slate-800 border border-slate-700 rounded-xl focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Paid To *</label>
                  <input
                    type="text"
                    required
                    placeholder="Vendor / Staff name"
                    value={paidTo}
                    onChange={(e) => setPaidTo(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Payment Mode</label>
                  <select
                    value={paymentMode}
                    onChange={(e) => setPaymentMode(e.target.value as any)}
                    className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white cursor-pointer"
                  >
                    <option value="Cash">Cash</option>
                    <option value="BankTransfer">Bank Transfer</option>
                    <option value="JazzCash">JazzCash</option>
                    <option value="EasyPaisa">EasyPaisa</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs bg-slate-800 border border-slate-700 rounded-xl text-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="flex-1 py-2 text-xs bg-slate-800 text-slate-300 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-xl cursor-pointer"
                >
                  Record Expense
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
