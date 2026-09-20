import React, { useState, useEffect } from 'react';
import TournamentHub from './components/TournamentHub';
import LeaderboardView from './components/LeaderboardView';
import PublicityView from './components/PublicityView';
import TelemetryWidget from './components/TelemetryWidget';
import RosterManagement from './components/RosterManagement';
import TeamModal from './components/TeamModal';
import PlayerModal from './components/PlayerModal';
import { Trophy, Crown, Megaphone, Activity, Database, ShieldAlert, CheckCircle2, Terminal, Users } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [stats, setStats] = useState({
    postgres_status: 'Connecting...',
    tournaments_count: 6,
    sponsors_count: 6,
    high_ping_alerts: 2
  });

  // Modal State for Pop-ups
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(data))
      .catch(() => {
        setStats(prev => ({ ...prev, postgres_status: 'Dev API Active' }));
      });
  }, [activeTab]);

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black font-sans">
      {/* Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#0a0d14]/90 backdrop-blur-md border-b border-slate-800/80 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => setActiveTab('tournaments')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-purple-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20">
              <div className="w-full h-full bg-[#07090e] rounded-[10px] flex items-center justify-center">
                <Database className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black font-display tracking-tight text-white">
                  arena<span className="text-cyan-400">DB</span>
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-1 font-medium">
                Relational Esports Tournament Engine
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800">
            <button
              onClick={() => setActiveTab('tournaments')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'tournaments'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/25 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4" /> Tournament Hub
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'roster'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/25 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" /> Roster & Teams
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'leaderboard'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/25 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Crown className="w-4 h-4" /> Leaderboard
            </button>

            <button
              onClick={() => setActiveTab('publicity')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition ${
                activeTab === 'publicity'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/25 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Megaphone className="w-4 h-4" /> Publicity & Sponsors
            </button>

            <button
              onClick={() => setActiveTab('telemetry')}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition relative ${
                activeTab === 'telemetry'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/25 font-bold'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" /> OS Telemetry
              {stats.high_ping_alerts > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping absolute top-1.5 right-1.5"></span>
              )}
            </button>
          </nav>

          {/* System Status Pills */}
          <div className="flex items-center gap-2 text-xs font-semibold">
            <span className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              <span>{stats.postgres_status}</span>
            </span>

            {stats.high_ping_alerts > 0 && (
              <span 
                onClick={() => setActiveTab('telemetry')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-red-950/80 border border-red-500/40 text-red-300 cursor-pointer animate-pulse"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>{stats.high_ping_alerts} Alert{stats.high_ping_alerts > 1 ? 's' : ''}</span>
              </span>
            )}
          </div>
        </div>

        {/* Mobile Navigation Tabs */}
        <div className="md:hidden flex items-center justify-around border-t border-slate-800 bg-[#07090e] px-2 py-2 text-xs overflow-x-auto">
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`px-3 py-1.5 rounded-md ${activeTab === 'tournaments' ? 'bg-cyan-500 text-black font-bold' : 'text-slate-400'}`}
          >
            Tournaments
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3 py-1.5 rounded-md ${activeTab === 'roster' ? 'bg-violet-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Roster
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-1.5 rounded-md ${activeTab === 'leaderboard' ? 'bg-rose-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('publicity')}
            className={`px-3 py-1.5 rounded-md ${activeTab === 'publicity' ? 'bg-emerald-500 text-black font-bold' : 'text-slate-400'}`}
          >
            Publicity
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 rounded-md ${activeTab === 'telemetry' ? 'bg-red-600 text-white font-bold' : 'text-slate-400'}`}
          >
            Telemetry
          </button>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'tournaments' && (
          <TournamentHub 
            onOpenTeamModal={(id) => setSelectedTeamId(id)}
            onOpenPlayerModal={(id) => setSelectedPlayerId(id)}
          />
        )}
        {activeTab === 'roster' && (
          <RosterManagement 
            onOpenTeamModal={(id) => setSelectedTeamId(id)}
            onOpenPlayerModal={(id) => setSelectedPlayerId(id)}
          />
        )}
        {activeTab === 'leaderboard' && (
          <LeaderboardView 
            onOpenTeamModal={(id) => setSelectedTeamId(id)}
            onOpenPlayerModal={(id) => setSelectedPlayerId(id)}
          />
        )}
        {activeTab === 'publicity' && (
          <PublicityView 
            onOpenTeamModal={(id) => setSelectedTeamId(id)}
            onOpenPlayerModal={(id) => setSelectedPlayerId(id)}
          />
        )}
        {activeTab === 'telemetry' && (
          <TelemetryWidget 
            onOpenTeamModal={(id) => setSelectedTeamId(id)}
            onOpenPlayerModal={(id) => setSelectedPlayerId(id)}
          />
        )}
      </main>

      {/* Pop-up Modals for Teams and Players */}
      {selectedTeamId && (
        <TeamModal 
          teamId={selectedTeamId}
          onClose={() => setSelectedTeamId(null)}
          onSelectPlayer={(player) => {
            setSelectedTeamId(null);
            setSelectedPlayerId(player.player_id || player);
          }}
        />
      )}

      {selectedPlayerId && (
        <PlayerModal 
          playerId={selectedPlayerId}
          onClose={() => setSelectedPlayerId(null)}
          onSelectTeam={(tId) => {
            setSelectedPlayerId(null);
            setSelectedTeamId(tId);
          }}
        />
      )}

      {/* Centralized Clean Footer */}
      <footer className="border-t border-slate-800/80 bg-[#05070a] py-10 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center justify-center space-y-3">
          <div className="flex items-center justify-center gap-2">
            <span className="text-2xl font-black tracking-wider text-white font-display">
              arena<span className="text-cyan-400">DB</span>
            </span>
          </div>
          <p className="text-slate-400 text-sm font-medium">
            Forging the future of competitive esports data.
          </p>
          <div className="text-slate-600 text-xs font-semibold tracking-wide">
            &copy; 2026 | Built for scale.
          </div>
        </div>
      </footer>
    </div>
  );
}
