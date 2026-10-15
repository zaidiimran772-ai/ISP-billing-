import React, { useState } from 'react';
import { AppLockProvider } from './context/AppLockContext';
import { WasooliProvider, useWasooli } from './context/WasooliContext';
import { AppLockOverlay } from './components/AppLockOverlay';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
import { QuickWasooliModal } from './components/QuickWasooliModal';
import { ThermalReceiptModal } from './components/ThermalReceiptModal';

// Views
import { DashboardView } from './views/DashboardView';
import { SubscribersView } from './views/SubscribersView';
import { WasooliLedgerView } from './views/WasooliLedgerView';
import { WhatsAppBillingView } from './views/WhatsAppBillingView';
import { MikrotikView } from './views/MikrotikView';
import { ComplaintsView } from './views/ComplaintsView';
import { RidersView } from './views/RidersView';
import { ExpensesView } from './views/ExpensesView';
import { ReportsView } from './views/ReportsView';
import { SettingsView } from './views/SettingsView';

const WasooliAppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);
  const [lang, setLang] = useState<'en' | 'ur'>('en');

  const { activeReceipt, setActiveReceipt } = useWasooli();

  const renderActiveView = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardView setActiveTab={setActiveTab} lang={lang} />;
      case 'subscribers':
        return <SubscribersView lang={lang} />;
      case 'wasooli':
        return <WasooliLedgerView lang={lang} />;
      case 'whatsapp':
        return <WhatsAppBillingView lang={lang} />;
      case 'mikrotik':
        return <MikrotikView lang={lang} />;
      case 'complaints':
        return <ComplaintsView lang={lang} />;
      case 'riders':
        return <RidersView lang={lang} />;
      case 'expenses':
        return <ExpensesView lang={lang} />;
      case 'reports':
        return <ReportsView lang={lang} />;
      case 'settings':
        return <SettingsView lang={lang} />;
      default:
        return <DashboardView setActiveTab={setActiveTab} lang={lang} />;
    }
  };

  return (
    <div className={`min-h-screen bg-slate-950 text-slate-100 flex flex-col ${lang === 'ur' ? 'font-urdu' : ''}`}>
      {/* AppLock Fullscreen Guard Modal */}
      <AppLockOverlay />

      {/* Top Navigation */}
      <Navbar
        onToggleSidebar={() => setIsSidebarOpen(!isSidebarOpen)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        lang={lang}
        setLang={setLang}
      />

      <div className="flex-1 flex overflow-hidden">
        {/* Navigation Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          lang={lang}
        />

        {/* Main Content Area */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-7xl mx-auto">
            {renderActiveView()}
          </div>
        </main>
      </div>

      {/* Quick Wasooli Modal */}
      <QuickWasooliModal />

      {/* Thermal Receipt Print & WhatsApp Share Modal */}
      <ThermalReceiptModal
        transaction={activeReceipt}
        onClose={() => setActiveReceipt(null)}
      />
    </div>
  );
};

export default function App() {
  return (
    <AppLockProvider>
      <WasooliProvider>
        <WasooliAppContent />
      </WasooliProvider>
    </AppLockProvider>
  );
}
