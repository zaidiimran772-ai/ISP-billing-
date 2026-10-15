import React, { useState, useMemo } from 'react';
import {
  MessageSquare,
  Send,
  Copy,
  CheckCircle2,
  Users,
  AlertTriangle,
  Building,
  Smartphone,
  Eye,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useWasooli } from '../context/WasooliContext';
import { Subscriber } from '../types/wasooli';

interface Props {
  lang: 'en' | 'ur';
}

export const WhatsAppBillingView: React.FC<Props> = ({ lang }) => {
  const { subscribers, packages, settings } = useWasooli();

  const [selectedTemplate, setSelectedTemplate] = useState<'bill' | 'reminder' | 'disconnect'>('bill');
  const [recipientFilter, setRecipientFilter] = useState<'due' | 'expired' | 'all'>('due');
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter subscribers based on recipient option
  const targetSubscribers = useMemo(() => {
    return subscribers.filter((s) => {
      if (recipientFilter === 'due') return s.balanceDue > 0;
      if (recipientFilter === 'expired') return s.status === 'expired' || s.status === 'suspended';
      return true; // all
    });
  }, [subscribers, recipientFilter]);

  // Generate message text for a specific subscriber
  const getMessageForSubscriber = (sub: Subscriber) => {
    const pkg = packages.find(p => p.id === sub.packageId);
    const packageName = pkg?.name || 'Fiber Broadband';
    const packageSpeed = pkg?.speedMbps || 20;
    const dueAmount = sub.balanceDue > 0 ? sub.balanceDue : (sub.monthlyFee - sub.discount);

    if (selectedTemplate === 'bill') {
      return `*${settings.ispName.toUpperCase()} - MONTHLY INTERNET INVOICE*
━━━━━━━━━━━━━━━━━━━━
محترم صارف: *${sub.fullName}*
صارف آئی ڈی: *${sub.username}*
پیکج پلان: *${packageName} (${packageSpeed} Mbps)*
ماہانہ واجب الادا رقم: *${settings.currency} ${dueAmount.toLocaleString()}*
آخری تاریخ ادائیگی: *${sub.expiryDate}*

📲 *آن لائن ادائیگی کے ذرائع:*
• JazzCash: *${settings.jazzCashNumber}*
• EasyPaisa: *${settings.easyPaisaNumber}*
• Bank: *${settings.bankName}* (${settings.bankIban})
اکاؤنٹ ٹائٹل: *${settings.bankAccountTitle}*

برائے مہربانی رقم ادا کرنے کے بعد ٹرانزیکشن سلپ/TID اس نمبر پر بھیجیں۔
شکریہ!
📞 ہیلپ لائن: ${settings.phone}`;
    }

    if (selectedTemplate === 'reminder') {
      return `*⚠️ بل ادائیگی کی یاددہانی - ${settings.ispName}*
━━━━━━━━━━━━━━━━━━━━
محترم *${sub.fullName}* (${sub.username})،
آپ کے انٹرنیٹ بل کی آخری تاریخ *${sub.expiryDate}* قریب ہے۔
کل واجب الادا رقم: *${settings.currency} ${sub.balanceDue.toLocaleString()}*

سروس میں تسلسل برقرار رکھنے کے لیے آج ہی *JazzCash (${settings.jazzCashNumber})* یا *EasyPaisa (${settings.easyPaisaNumber})* پر ادائیگی فرما دیں۔
شکریہ!`;
    }

    // disconnect
    return `*🚨 اہم نوٹس: سروس منقطع کی اطلاع*
━━━━━━━━━━━━━━━━━━━━
محترم صارف *${sub.fullName}* (${sub.username})،
آپ کے انٹرنیٹ اکاؤنٹ کا بل واجب الادا ہونے کی وجہ سے سسٹم خودکار طور پر سروس بند کرنے جا رہا ہے۔
بقایا رقم: *${settings.currency} ${sub.balanceDue.toLocaleString()}*

انٹرنیٹ بحالی کے لیے فوری ادائیگی کر کے سلپ روانہ کریں۔
رابطہ: ${settings.phone}`;
  };

  const handleSendSingle = (sub: Subscriber) => {
    const text = getMessageForSubscriber(sub);
    const cleanPhone = sub.phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${cleanPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  const handleCopyText = (sub: Subscriber) => {
    const text = getMessageForSubscriber(sub);
    navigator.clipboard.writeText(text);
    setCopiedId(sub.id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Preview subscriber (first in list or sample)
  const previewSub = targetSubscribers[0] || subscribers[0];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {lang === 'en' ? 'Automated WhatsApp Billing (واٹس ایپ بلنگ)' : 'واٹس ایپ بلنگ و میسجز'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold">
              1-Click Direct API
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Send dynamic invoices, due date alerts, and disconnection notices directly to customers on WhatsApp
          </p>
        </div>
      </div>

      {/* Main 2-column Layout: Templates & Configuration on Left, Live Preview & Dispatch on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Config & Template Selection */}
        <div className="lg:col-span-5 space-y-4">
          {/* Template Selector Card */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              1. Select Message Template (میسج ٹیمپلیٹ)
            </span>

            <div className="space-y-2">
              {[
                { id: 'bill', title: 'Monthly Bill Notification (ماہانہ انوائس)', desc: 'Full invoice with JazzCash, EasyPaisa & Bank details' },
                { id: 'reminder', title: 'Due Date Reminder (یاددہانی)', desc: 'Friendly reminder before connection expires' },
                { id: 'disconnect', title: 'Disconnection Alert (سروس کٹ نوٹس)', desc: 'Urgent notice for unpaid defaulters' }
              ].map((tmpl) => (
                <button
                  key={tmpl.id}
                  onClick={() => setSelectedTemplate(tmpl.id as any)}
                  className={`w-full text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    selectedTemplate === tmpl.id
                      ? 'bg-emerald-500/15 border-emerald-500 text-white shadow-sm'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <span className="text-xs font-bold block">{tmpl.title}</span>
                  <span className="text-[11px] text-slate-400 mt-0.5 block">{tmpl.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Recipient Audience Filter */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block">
              2. Target Audience (وصول کنندگان)
            </span>

            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'due', label: 'Overdue Dues', count: subscribers.filter(s => s.balanceDue > 0).length },
                { id: 'expired', label: 'Expired Lines', count: subscribers.filter(s => s.status === 'expired' || s.status === 'suspended').length },
                { id: 'all', label: 'All Users', count: subscribers.length }
              ].map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setRecipientFilter(opt.id as any)}
                  className={`p-2.5 rounded-xl border text-center transition-all cursor-pointer ${
                    recipientFilter === opt.id
                      ? 'bg-emerald-600 text-slate-950 font-bold border-emerald-500'
                      : 'bg-slate-800/40 border-slate-700/60 text-slate-300 hover:bg-slate-800'
                  }`}
                >
                  <span className="text-xs block font-bold">{opt.label}</span>
                  <span className="text-[10px] block opacity-80">{opt.count} Users</span>
                </button>
              ))}
            </div>
          </div>

          {/* Live Preview Box (WhatsApp Chat Bubble style) */}
          <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                <Eye className="w-4 h-4 text-emerald-400" />
                <span>WhatsApp Message Preview</span>
              </span>
              <span className="text-[10px] text-slate-400">Live preview</span>
            </div>

            {/* Bubble */}
            <div className="p-3.5 rounded-2xl bg-[#0b241d] border border-[#144234] text-emerald-100 text-xs font-sans whitespace-pre-wrap leading-relaxed shadow-inner">
              {previewSub ? getMessageForSubscriber(previewSub) : 'No subscriber selected'}
            </div>
          </div>
        </div>

        {/* Right Column: Subscriber Dispatch Queue */}
        <div className="lg:col-span-7 p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl flex flex-col">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
            <div>
              <h3 className="font-bold text-white text-sm">
                Recipients Ready for WhatsApp Dispatch ({targetSubscribers.length})
              </h3>
              <p className="text-[11px] text-slate-400">
                Click "Send" to open verified WhatsApp chat with custom bill details
              </p>
            </div>
          </div>

          <div className="space-y-2 flex-1 max-h-[600px] overflow-y-auto pr-1">
            {targetSubscribers.length === 0 ? (
              <div className="p-12 text-center text-slate-500">
                <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2 opacity-60" />
                <p className="text-sm font-semibold text-slate-300">All accounts in this category are fully paid!</p>
              </div>
            ) : (
              targetSubscribers.map((sub) => {
                const pkg = packages.find(p => p.id === sub.packageId);
                const isCopied = copiedId === sub.id;

                return (
                  <div
                    key={sub.id}
                    className="p-3 rounded-2xl bg-slate-950/70 border border-slate-800/80 hover:border-slate-700 transition-colors flex items-center justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-white text-xs">{sub.fullName}</span>
                        <span className="font-mono text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.2 rounded border border-emerald-500/20">
                          {sub.username}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {sub.phone} • {pkg?.name} • Due: <strong className="text-rose-400">{settings.currency} {sub.balanceDue.toLocaleString()}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleCopyText(sub)}
                        title="Copy Message Text"
                        className="p-2 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 transition-colors cursor-pointer"
                      >
                        {isCopied ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Copy className="w-3.5 h-3.5" />
                        )}
                      </button>

                      <button
                        onClick={() => handleSendSingle(sub)}
                        className="py-1.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all cursor-pointer"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>Send WA</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
