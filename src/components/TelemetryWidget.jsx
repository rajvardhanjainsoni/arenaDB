import React, { useState, useEffect } from 'react';
import { Activity, AlertTriangle, Monitor, Wifi, PlusCircle, CheckCircle, RefreshCw, X, ShieldAlert, Cpu } from 'lucide-react';

export default function TelemetryWidget({ onOpenTeamModal, onOpenPlayerModal }) {
  const [telemetryLogs, setTelemetryLogs] = useState([]);
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [pingThreshold, setPingThreshold] = useState(80); // Default alert threshold: 80ms

  // Form State
  const initialFormState = {
    match_id: '',
    player_id: '1',
    avg_ping_ms: '',
    os_version: '',
    disconnect_count: ''
  };
  const [formData, setFormData] = useState(initialFormState);
  const [submitting, setSubmitting] = useState(false);
  const [toastMessage, setToastMessage] = useState(null);

  const fetchTelemetry = async () => {
    setLoading(true);
    try {
      const [telRes, playerRes] = await Promise.all([
        fetch('/api/telemetry'),
        fetch('/api/players')
      ]);
      const telData = await telRes.json();
      const playerData = await playerRes.json();
      setTelemetryLogs(telData);
      setPlayers(playerData);
      if (playerData && playerData.length > 0 && !formData.player_id) {
        setFormData(prev => ({ ...prev, player_id: String(playerData[0].player_id) }));
      }
    } catch (err) {
      console.error('Failed to load telemetry data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTelemetry();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch('/api/telemetry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const result = await res.json();
      if (res.ok) {
        setToastMessage({ type: 'success', text: 'Telemetry log registered successfully!' });
        setShowModal(false);
        // Reset form fields back to empty default state after successful POST
        setFormData({
          match_id: '',
          player_id: players.length > 0 ? String(players[0].player_id) : '1',
          avg_ping_ms: '',
          os_version: '',
          disconnect_count: ''
        });
        fetchTelemetry();
      } else {
        setToastMessage({ type: 'error', text: result.error || 'Failed to submit telemetry' });
      }
    } catch (err) {
      setToastMessage({ type: 'error', text: 'Network error submitting telemetry' });
    } finally {
      setSubmitting(false);
      setTimeout(() => setToastMessage(null), 4000);
    }
  };

  const highPingAlertsCount = telemetryLogs.filter(t => Number(t.avg_ping_ms) > pingThreshold).length;

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Alert */}
      {toastMessage && (
        <div className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-xl ${
          toastMessage.type === 'success' ? 'bg-emerald-950 text-emerald-300 border border-emerald-500/40' : 'bg-rose-950 text-rose-300 border border-rose-500/40'
        }`}>
          <span className="flex items-center gap-2">
            {toastMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
            {toastMessage.text}
          </span>
          <button onClick={() => setToastMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-rose-500/20">
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-rose-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm uppercase tracking-wider mb-1">
              <Activity className="w-4 h-4" /> Novelty Module #2
            </div>
            <h1 className="text-3xl font-extrabold text-white font-display">OS-Level Match Telemetry</h1>
            <p className="text-slate-400 text-sm mt-1">Real-time hardware monitoring, latency threshold alerting, and network drop detection.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-rose-600/25"
            >
              <PlusCircle className="w-4 h-4" /> Log Match Telemetry
            </button>
            <button
              onClick={fetchTelemetry}
              className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
              title="Refresh Telemetry"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Threshold Alert & Statistics Bar */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Threshold Alert Card */}
        <div className={`glass-card p-5 rounded-2xl border ${
          highPingAlertsCount > 0 ? 'border-rose-500/50 glow-rose bg-rose-950/20' : 'border-slate-800'
        }`}>
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase text-rose-400 tracking-wider flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4" /> High-Latency Violations
            </span>
            <span className="px-2 py-0.5 bg-rose-900/60 text-rose-300 text-[11px] font-bold rounded-full border border-rose-500/30">
              &gt; {pingThreshold} ms
            </span>
          </div>
          <div className="text-3xl font-extrabold text-white font-display flex items-baseline gap-2">
            <span>{highPingAlertsCount}</span>
            <span className="text-sm font-medium text-slate-400">Players Exceeding Limit</span>
          </div>
          <p className="text-xs text-slate-400 mt-2">
            {highPingAlertsCount > 0 
              ? '⚠️ Organizer Alert: High ping detected! Hardware/network inspection recommended.' 
              : '✅ All connected players are operating below latency thresholds.'}
          </p>
        </div>

        {/* Adjust Threshold Selector */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <Wifi className="w-4 h-4 text-cyan-400" /> Alert Threshold Config
            </span>
            <span className="text-xs font-semibold text-cyan-400">{pingThreshold} ms</span>
          </div>
          <div className="my-2">
            <input 
              type="range" 
              min="30" 
              max="150" 
              step="5" 
              value={pingThreshold}
              onChange={(e) => setPingThreshold(Number(e.target.value))}
              className="w-full accent-cyan-400 bg-slate-800 rounded-lg h-2 cursor-pointer"
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-500">
            <span>Strict (30ms)</span>
            <span>Standard (80ms)</span>
            <span>Lenient (150ms)</span>
          </div>
        </div>

        {/* OS Platform Diversity */}
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex flex-col justify-between">
          <span className="text-xs font-bold uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-purple-400" /> Environment Diversity
          </span>
          <div className="grid grid-cols-3 gap-2 mt-2 text-center">
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block">Windows</span>
              <span className="text-lg font-bold text-white">
                {telemetryLogs.filter(t => t.os_version?.toLowerCase().includes('windows')).length}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block">macOS</span>
              <span className="text-lg font-bold text-white">
                {telemetryLogs.filter(t => t.os_version?.toLowerCase().includes('mac')).length}
              </span>
            </div>
            <div className="bg-slate-900/80 p-2 rounded-lg border border-slate-800">
              <span className="text-xs text-slate-400 block">Linux</span>
              <span className="text-lg font-bold text-white">
                {telemetryLogs.filter(t => t.os_version?.toLowerCase().includes('linux') || t.os_version?.toLowerCase().includes('ubuntu')).length}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Telemetry Logs Table */}
      <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden">
        <div className="p-5 border-b border-slate-800/80 bg-slate-900/40 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Monitor className="w-5 h-5 text-cyan-400" />
            <h2 className="text-lg font-bold text-white">Live Match Telemetry Feed</h2>
          </div>
          <span className="text-xs text-slate-400 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            {telemetryLogs.length} Logged Entries
          </span>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">Loading telemetry logs...</div>
        ) : telemetryLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-500">No telemetry data logged yet. Click "Log Match Telemetry" to insert mock hardware data.</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-300">
              <thead className="bg-slate-950/80 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                <tr>
                  <th className="px-6 py-4">Player</th>
                  <th className="px-6 py-4">Match Stage</th>
                  <th className="px-6 py-4 text-center">Avg Ping</th>
                  <th className="px-6 py-4">OS Version</th>
                  <th className="px-6 py-4 text-center">Disconnects</th>
                  <th className="px-6 py-4 text-right">Status Alert</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {telemetryLogs.map((log) => {
                  const ping = Number(log.avg_ping_ms);
                  const isHighPing = ping > pingThreshold;
                  const hasDisconnects = log.disconnect_count > 0;

                  return (
                    <tr 
                      key={log.telemetry_id}
                      className={`hover:bg-slate-800/40 transition duration-150 ${
                        isHighPing ? 'bg-rose-950/10' : ''
                      }`}
                    >
                      <td 
                        className="px-6 py-4 font-bold text-white cursor-pointer group"
                        onClick={() => onOpenPlayerModal && onOpenPlayerModal(log.player_id)}
                      >
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${isHighPing ? 'bg-rose-500 animate-ping' : 'bg-emerald-400'}`}></div>
                          <span className="group-hover:text-cyan-300 underline decoration-cyan-500/30">
                            {log.username || `Player #${log.player_id}`}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-slate-400">
                        {log.match_stage || `Match #${log.match_id}`}
                      </td>

                      <td className="px-6 py-4 text-center font-extrabold font-display">
                        <span className={`px-3 py-1 rounded-lg text-sm ${
                          isHighPing ? 'bg-rose-900/80 text-rose-200 border border-rose-500/50' : 'bg-slate-900 text-emerald-400 border border-emerald-500/20'
                        }`}>
                          {ping.toFixed(1)} ms
                        </span>
                      </td>

                      <td className="px-6 py-4 text-slate-300 font-mono text-xs">
                        {log.os_version}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${
                          hasDisconnects ? 'bg-amber-900/50 text-amber-300 border border-amber-500/30' : 'bg-slate-900 text-slate-400'
                        }`}>
                          {log.disconnect_count} drop{log.disconnect_count !== 1 ? 's' : ''}
                        </span>
                      </td>

                      <td className="px-6 py-4 text-right">
                        {isHighPing ? (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-rose-400 bg-rose-950/80 px-2.5 py-1 rounded-md border border-rose-500/40 animate-pulse">
                            <AlertTriangle className="w-3.5 h-3.5" /> High Ping Alert
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded-md border border-emerald-500/30">
                            <CheckCircle className="w-3.5 h-3.5" /> Optimal
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal Dialog for POST /api/telemetry */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 border border-slate-700 shadow-2xl relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2">
                <Activity className="w-5 h-5 text-rose-400" /> Log Match Telemetry Data
              </h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Select Player</label>
                <select
                  value={formData.player_id}
                  onChange={(e) => setFormData({ ...formData, player_id: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                >
                  {players.map(p => (
                    <option key={p.player_id} value={p.player_id}>
                      {p.username} ({p.rank})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Match ID</label>
                  <input
                    type="number"
                    placeholder="e.g. 1"
                    value={formData.match_id}
                    onChange={(e) => setFormData({ ...formData, match_id: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Avg Ping (ms)</label>
                  <input
                    type="number"
                    step="0.1"
                    placeholder="e.g. 24.5"
                    value={formData.avg_ping_ms}
                    onChange={(e) => setFormData({ ...formData, avg_ping_ms: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">OS & Hardware Version</label>
                <input
                  type="text"
                  placeholder="e.g. Windows 11 23H2 / macOS Sonoma"
                  value={formData.os_version}
                  onChange={(e) => setFormData({ ...formData, os_version: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Disconnect Count</label>
                <input
                  type="number"
                  placeholder="e.g. 0"
                  value={formData.disconnect_count}
                  onChange={(e) => setFormData({ ...formData, disconnect_count: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-rose-500 focus:outline-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold text-sm rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-sm rounded-lg shadow-lg shadow-rose-600/30 flex items-center gap-2"
                >
                  {submitting ? 'Logging...' : 'Submit Telemetry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
