import React, { useState } from 'react';
import {
  Router,
  Wifi,
  Power,
  RotateCcw,
  Zap,
  Activity,
  CheckCircle,
  AlertTriangle,
  Server,
  Layers,
  ArrowDownUp,
  Cpu,
  Clock
} from 'lucide-react';
import { useWasooli } from '../context/WasooliContext';

interface Props {
  lang: 'en' | 'ur';
}

export const MikrotikView: React.FC<Props> = ({ lang }) => {
  const { subscribers, toggleMikroTikSession, packages } = useWasooli();

  const [routerIp] = useState('192.168.88.1');
  const [routerModel] = useState('MikroTik CCR2004-16G-2S+');
  const [testingPingId, setTestingPingId] = useState<string | null>(null);
  const [pingResults, setPingResults] = useState<{ [id: string]: string }>({});

  const handleTestPing = (id: string) => {
    setTestingPingId(id);
    setTimeout(() => {
      const ms = Math.floor(4 + Math.random() * 12);
      setPingResults(prev => ({ ...prev, [id]: `${ms} ms (0% loss)` }));
      setTestingPingId(null);
    }, 600);
  };

  const activeSessions = subscribers.filter(s => s.isMikroTikActive);

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-white tracking-tight">
              {lang === 'en' ? 'MikroTik RouterOS & GPON OLT' : 'مائکروٹک راؤٹر و آپٹیکل فائبر کنٹرول'}
            </h1>
            <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              API Connected
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Monitor PPPoE Secrets, kick inactive sessions, view live bandwidth & fiber optical signal (dBm)
          </p>
        </div>
      </div>

      {/* Router Status Hardware Card */}
      <div className="p-5 rounded-3xl bg-slate-900 border border-slate-800 shadow-xl grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Server className="w-3.5 h-3.5 text-cyan-400" />
            Core Gateway Router
          </span>
          <p className="font-bold text-white text-sm truncate">{routerModel}</p>
          <span className="text-[11px] font-mono text-emerald-400">{routerIp}</span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            CPU & RAM Load
          </span>
          <p className="font-bold text-white text-sm">14% Load • 42°C</p>
          <span className="text-[11px] text-slate-400">Memory: 3.2 GB Free</span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <ArrowDownUp className="w-3.5 h-3.5 text-emerald-400" />
            Throughput Traffic
          </span>
          <p className="font-bold text-emerald-400 text-sm">842 Mbps / 1.2 Gbps</p>
          <span className="text-[11px] text-slate-400">Total Packets: 42.1M</span>
        </div>

        <div className="space-y-1">
          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
            <Clock className="w-3.5 h-3.5 text-purple-400" />
            System Uptime
          </span>
          <p className="font-bold text-white text-sm">48 days, 14 hours</p>
          <span className="text-[11px] text-slate-400">RouterOS v7.14.2</span>
        </div>
      </div>

      {/* Active PPPoE Sessions & Optical Power Table */}
      <div className="rounded-3xl bg-slate-900 border border-slate-800 shadow-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/80">
          <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="font-bold text-white text-sm">
              Live PPPoE Sessions & Optical Power Monitor ({activeSessions.length} Online)
            </h3>
          </div>
          <span className="text-xs text-slate-400">Auto-refresh: 5s</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-950/80 border-b border-slate-800 text-slate-400 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">User / Secret</th>
                <th className="py-3 px-4">IP & MAC Address</th>
                <th className="py-3 px-4">Package Profile</th>
                <th className="py-3 px-4">Optical Rx (dBm)</th>
                <th className="py-3 px-4">ONU Hardware</th>
                <th className="py-3 px-4">Session Status</th>
                <th className="py-3 px-4 text-right">MikroTik Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {subscribers.map((sub) => {
                const pkg = packages.find(p => p.id === sub.packageId);
                const signal = sub.opticalSignalDbm || -20;
                const isPing = pingResults[sub.id];

                return (
                  <tr key={sub.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-mono font-bold text-emerald-400">{sub.username}</div>
                      <div className="text-white text-xs">{sub.fullName}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-[11px]">
                      <div className="text-slate-200">{sub.ipAddress || '172.16.20.100'}</div>
                      <div className="text-slate-500">{sub.macAddress || 'DC:EF:09:A1:33:C2'}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-200">{pkg?.name}</span>
                      <div className="text-cyan-400 text-[10px] font-mono">{pkg?.speedMbps} Mbps Down / Up</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`font-mono font-bold text-xs px-2 py-0.5 rounded ${
                            signal >= -23
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                              : signal >= -26
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}
                        >
                          {signal} dBm
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-500">
                        {signal >= -23 ? 'Optimum Fiber' : signal >= -26 ? 'Acceptable' : 'High Loss! Check Splicing'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-mono text-slate-300 text-[11px]">{sub.onuSerial || 'HWTC-MODEM'}</div>
                      <div className="text-slate-500 text-[10px]">{sub.splitterPort || 'Splitter Port 1'}</div>
                    </td>
                    <td className="py-3 px-4">
                      {sub.isMikroTikActive ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                          <CheckCircle className="w-3 h-3" />
                          <span>Connected</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/15 text-rose-400 border border-rose-500/20">
                          <Power className="w-3 h-3" />
                          <span>Disabled</span>
                        </span>
                      )}
                      {isPing && (
                        <div className="text-[10px] text-cyan-400 font-mono mt-0.5">
                          Ping: {isPing}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => handleTestPing(sub.id)}
                          disabled={testingPingId === sub.id}
                          className="px-2 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold border border-slate-700 transition-colors cursor-pointer"
                        >
                          {testingPingId === sub.id ? 'Pinging...' : 'Ping'}
                        </button>

                        <button
                          onClick={() => toggleMikroTikSession(sub.id)}
                          className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border transition-colors cursor-pointer ${
                            sub.isMikroTikActive
                              ? 'bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border-rose-500/30'
                              : 'bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {sub.isMikroTikActive ? 'Kick Session' : 'Re-Enable Secret'}
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
