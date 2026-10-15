import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Printer, Share2, CheckCircle2, X, Phone, Building2, Calendar, FileText } from 'lucide-react';
import { useWasooli } from '../context/WasooliContext';
import { Transaction } from '../types/wasooli';

interface Props {
  transaction: Transaction | null;
  onClose: () => void;
}

export const ThermalReceiptModal: React.FC<Props> = ({ transaction, onClose }) => {
  const { settings, subscribers, packages } = useWasooli();

  if (!transaction) return null;

  const subscriber = subscribers.find(s => s.id === transaction.subscriberId);
  const pkg = packages.find(p => p.id === subscriber?.packageId);

  const formattedDate = new Date(transaction.timestamp).toLocaleDateString('en-PK', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

  const handlePrint = () => {
    window.print();
  };

  // Pre-formatted Urdu & English WhatsApp message
  const whatsappReceiptText = `*${settings.ispName.toUpperCase()} - PAYMENT RECEIPT*
───────────────────────
🧾 *Receipt #:* ${transaction.receiptNo}
👤 *Subscriber:* ${transaction.subscriberName}
🆔 *User ID:* ${transaction.subscriberUsername}
📦 *Package:* ${pkg?.name || 'Broadband'} (${pkg?.speedMbps || 20} Mbps)
📅 *Payment Date:* ${formattedDate}
💰 *Amount Received:* ${settings.currency} ${transaction.amount.toLocaleString()}
${transaction.discount > 0 ? `🏷️ *Discount Given:* ${settings.currency} ${transaction.discount.toLocaleString()}\n` : ''}
💳 *Payment Mode:* ${transaction.paymentMethod}
🛡️ *Remaining Dues:* ${settings.currency} ${transaction.remainingBalance.toLocaleString()}
🗓️ *Next Expiry:* ${subscriber?.expiryDate || 'Next Cycle'}
───────────────────────
*محترم صارف!* آپ کی انٹرنیٹ فیس موصول ہو گئی ہے۔ شکریہ!
📞 ہیلپ لائن: ${settings.phone}
🌐 ${settings.tagline}`;

  const handleSendWhatsApp = () => {
    const phone = subscriber?.phone || settings.whatsappNumber;
    const cleanPhone = phone.replace(/[^0-9]/g, '');
    const url = `https://wa.me/${cleanPhone}?text=${encodeURIComponent(whatsappReceiptText)}`;
    window.open(url, '_blank');
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 overflow-y-auto no-print">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
        >
          {/* Header Action Bar */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
            <div className="flex items-center gap-2">
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-white text-sm">Payment Received (وصولی موصول)</h3>
                <p className="text-xs text-slate-400">Receipt #{transaction.receiptNo}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Receipt Preview Area (Designed like a 58mm/80mm Thermal Slip) */}
          <div className="p-4 bg-slate-950 flex justify-center">
            <div
              id="thermal-receipt"
              className="w-full max-w-[320px] bg-amber-50/95 text-slate-900 p-4 rounded-xl shadow-inner border border-amber-200/60 font-mono text-xs leading-relaxed thermal-receipt-container"
            >
              {/* ISP Brand Header */}
              <div className="text-center pb-2 border-b border-dashed border-slate-400">
                <p className="font-black text-sm uppercase tracking-wide">{settings.ispName}</p>
                <p className="text-[10px] text-slate-600 mt-0.5">{settings.tagline}</p>
                <p className="text-[10px] text-slate-600">Ph: {settings.phone} | NTN: {settings.ntn}</p>
                <div className="inline-block mt-1 px-2 py-0.5 bg-slate-900 text-amber-50 text-[10px] font-bold rounded">
                  OFFICIAL WASOOLI RECEIPT
                </div>
              </div>

              {/* Transaction Meta */}
              <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Receipt No:</span>
                  <span className="font-bold">{transaction.receiptNo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Date & Time:</span>
                  <span>{formattedDate}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Cashier / Rider:</span>
                  <span>{transaction.collectedByName}</span>
                </div>
              </div>

              {/* Subscriber Details */}
              <div className="py-2 border-b border-dashed border-slate-400 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">User ID / PPPoE:</span>
                  <span className="font-bold">{transaction.subscriberUsername}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Subscriber:</span>
                  <span className="font-semibold">{transaction.subscriberName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Mobile / WhatsApp:</span>
                  <span>{subscriber?.phone || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Package:</span>
                  <span>{pkg?.name} ({pkg?.speedMbps}M)</span>
                </div>
              </div>

              {/* Amount Breakdown */}
              <div className="py-2.5 border-b-2 border-dashed border-slate-800 space-y-1 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-600">Previous Dues:</span>
                  <span>{settings.currency} {transaction.previousBalance.toLocaleString()}</span>
                </div>
                {transaction.discount > 0 && (
                  <div className="flex justify-between text-emerald-700">
                    <span>Discount / رعایت:</span>
                    <span>-{settings.currency} {transaction.discount.toLocaleString()}</span>
                  </div>
                )}
                <div className="flex justify-between font-black text-sm pt-1 border-t border-slate-300">
                  <span>AMOUNT PAID:</span>
                  <span className="text-base">{settings.currency} {transaction.amount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[11px] text-slate-700">
                  <span>Payment Mode:</span>
                  <span className="font-semibold">{transaction.paymentMethod}</span>
                </div>
                <div className="flex justify-between font-bold pt-1 text-slate-800">
                  <span>Remaining Balance:</span>
                  <span>{settings.currency} {transaction.remainingBalance.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-[10px] text-slate-600">
                  <span>Valid Till / Expiry:</span>
                  <span className="font-semibold">{subscriber?.expiryDate}</span>
                </div>
              </div>

              {/* Thermal Receipt Barcode / Footer */}
              <div className="text-center pt-2 space-y-1">
                <div className="font-barcode text-xl tracking-widest text-slate-800 select-none">
                  ||| | |||| || ||| |||| || |||
                </div>
                <p className="text-[9px] text-slate-600 leading-tight whitespace-pre-line">
                  {settings.thermalReceiptFooter}
                </p>
                <p className="text-[8px] text-slate-500 font-sans mt-1">
                  Powered by WasooliPK • 100% ISP Cloud Accounting
                </p>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col sm:flex-row items-center gap-2">
            <button
              onClick={handleSendWhatsApp}
              className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <Share2 className="w-4 h-4" />
              <span>Send WhatsApp Receipt</span>
            </button>

            <button
              onClick={handlePrint}
              className="w-full sm:flex-1 py-2.5 px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold text-xs flex items-center justify-center gap-2 border border-slate-700 transition-all cursor-pointer"
            >
              <Printer className="w-4 h-4 text-cyan-400" />
              <span>Thermal Print (POS)</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
