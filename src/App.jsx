import React, { useState, useEffect } from 'react';
import TournamentHub from './components/TournamentHub';
import LeaderboardView from './components/LeaderboardView';
import PublicityView from './components/PublicityView';
import TelemetryWidget from './components/TelemetryWidget';
import RosterManagement from './components/RosterManagement';
import TeamModal from './components/TeamModal';
import PlayerModal from './components/PlayerModal';
import StoreView from './components/StoreView';
import SqlLabView from './components/SqlLabView';
import { Trophy, Crown, Megaphone, Activity, Database, ShieldAlert, CheckCircle2, Terminal, Users, ShoppingCart, Code2, Server, Coins, Zap } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('tournaments');
  const [stats, setStats] = useState({
    postgres_status: 'Connecting...',
    database_name: 'arenadb',
    tournaments_count: 10,
    players_count: 38,
    teams_count: 18,
    games_count: 10,
    matches_count: 43,
    items_count: 20,
    sponsors_count: 12,
    total_prize_pool: 29075000,
    high_ping_alerts: 1
  });

  // Modal State for Pop-ups
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [selectedPlayerId, setSelectedPlayerId] = useState(null);

  useEffect(() => {
    fetch('/api/stats')
      .then(res => res.json())
      .then(data => setStats(prev => ({ ...prev, ...data })))
      .catch(() => {
        setStats(prev => ({ ...prev, postgres_status: 'Dev API Active' }));
      });
  }, [activeTab]);

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val || 0);
  };

  return (
    <div className="min-h-screen bg-[#06080d] cyber-grid text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-black font-sans relative">
      <div className="absolute inset-0 cyber-radial-bg pointer-events-none"></div>

      {/* Top System Status Bar */}
      <div className="border-b border-slate-800/80 bg-[#070a12]/95 backdrop-blur-md px-4 py-1.5 text-[11px] text-slate-400 font-tech flex flex-wrap items-center justify-between gap-2 z-50">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-emerald-400 font-bold uppercase tracking-wider">DATABASE LIVE:</span>
            <span className="text-white font-code">PostgreSQL 16 @ arenadb:5432</span>
          </div>
          <div className="hidden sm:flex items-center gap-1.5 text-slate-400">
            <Server className="w-3 h-3 text-cyan-400" />
            <span>API Server:</span>
            <span className="text-cyan-300 font-code font-bold">http://localhost:5001</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1 text-slate-300">
            <Coins className="w-3 h-3 text-amber-400" />
            <span>Total Circuit Prize:</span>
            <span className="text-amber-300 font-bold font-code">{formatCurrency(stats.total_prize_pool)}</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-slate-400">
            <span>Schema Tables:</span>
            <span className="text-white font-bold font-code">15 Tables</span>
          </div>
        </div>
      </div>

      {/* Main Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#090d16]/90 backdrop-blur-xl border-b border-slate-800 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Brand Logo */}
          <div className="flex items-center gap-3 cursor-pointer group" onClick={() => setActiveTab('tournaments')}>
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-cyan-500 via-indigo-500 to-emerald-400 p-0.5 shadow-lg shadow-cyan-500/20 group-hover:scale-105 transition-transform duration-200">
              <div className="w-full h-full bg-[#070a12] rounded-[14px] flex items-center justify-center">
                <Database className="w-5 h-5 text-cyan-400 group-hover:rotate-12 transition-transform duration-300" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-2xl font-black font-display tracking-tight text-white">
                  arena<span className="text-cyan-400">DB</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 font-tech">
                  v2.0 PRO
                </span>
              </div>
              <span className="text-[11px] text-slate-400 block -mt-0.5 font-medium font-tech">
                Relational Esports Tournament Engine
              </span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden xl:flex items-center gap-1 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800 shadow-inner">
            <button
              onClick={() => setActiveTab('tournaments')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'tournaments'
                  ? 'bg-cyan-500 text-black shadow-lg shadow-cyan-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Trophy className="w-4 h-4" /> Tournament Hub
            </button>

            <button
              onClick={() => setActiveTab('roster')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'roster'
                  ? 'bg-violet-600 text-white shadow-lg shadow-violet-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Users className="w-4 h-4" /> Roster & Teams
            </button>

            <button
              onClick={() => setActiveTab('leaderboard')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'leaderboard'
                  ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Crown className="w-4 h-4" /> Leaderboard
            </button>

            <button
              onClick={() => setActiveTab('store')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'store'
                  ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <ShoppingCart className="w-4 h-4" /> Armory & Store
            </button>

            <button
              onClick={() => setActiveTab('publicity')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'publicity'
                  ? 'bg-amber-500 text-black shadow-lg shadow-amber-500/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Megaphone className="w-4 h-4" /> Publicity & Sponsors
            </button>

            <button
              onClick={() => setActiveTab('telemetry')}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all relative ${
                activeTab === 'telemetry'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" /> OS Telemetry
              {stats.high_ping_alerts > 0 && (
                <span className="w-2 h-2 rounded-full bg-red-400 animate-ping absolute top-1.5 right-1.5"></span>
              )}
            </button>

            {/* NEW COURSEWORK SQL LAB TAB */}
            <button
              onClick={() => setActiveTab('sqllab')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                activeTab === 'sqllab'
                  ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/30'
                  : 'text-cyan-400 border-cyan-500/40 bg-cyan-950/40 hover:bg-cyan-900/60 hover:text-white'
              }`}
            >
              <Code2 className="w-4 h-4 text-cyan-300" /> SQL Lab & Engine
            </button>
          </nav>

          {/* Quick Metrics & Alert Badges */}
          <div className="flex items-center gap-2 text-xs font-semibold font-tech">
            <button
              onClick={() => setActiveTab('sqllab')}
              className="hidden lg:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 hover:border-cyan-500/60 text-slate-200 transition"
            >
              <Terminal className="w-3.5 h-3.5 text-cyan-400" />
              <span>15 SQL Queries</span>
            </button>

            {stats.high_ping_alerts > 0 && (
              <span 
                onClick={() => setActiveTab('telemetry')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/80 border border-red-500/50 text-red-300 cursor-pointer animate-pulse hover:bg-red-900"
              >
                <ShieldAlert className="w-3.5 h-3.5 text-red-400" />
                <span>{stats.high_ping_alerts} Ping Alert</span>
              </span>
            )}
          </div>
        </div>

        {/* Medium and Mobile Navigation Tabs */}
        <div className="xl:hidden flex items-center justify-start gap-1 border-t border-slate-800 bg-[#070a12] px-3 py-2 text-xs overflow-x-auto scrollbar-none">
          <button
            onClick={() => setActiveTab('tournaments')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${activeTab === 'tournaments' ? 'bg-cyan-500 text-black' : 'text-slate-400'}`}
          >
            Tournaments
          </button>
          <button
            onClick={() => setActiveTab('roster')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${activeTab === 'roster' ? 'bg-violet-600 text-white' : 'text-slate-400'}`}
          >
            Rosters
          </button>
          <button
            onClick={() => setActiveTab('leaderboard')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${activeTab === 'leaderboard' ? 'bg-rose-600 text-white' : 'text-slate-400'}`}
          >
            Leaderboard
          </button>
          <button
            onClick={() => setActiveTab('store')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${activeTab === 'store' ? 'bg-emerald-500 text-black' : 'text-slate-400'}`}
          >
            Armory
          </button>
          <button
            onClick={() => setActiveTab('publicity')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${activeTab === 'publicity' ? 'bg-amber-500 text-black' : 'text-slate-400'}`}
          >
            Publicity
          </button>
          <button
            onClick={() => setActiveTab('telemetry')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${activeTab === 'telemetry' ? 'bg-red-600 text-white' : 'text-slate-400'}`}
          >
            Telemetry
          </button>
          <button
            onClick={() => setActiveTab('sqllab')}
            className={`px-3 py-1.5 rounded-lg whitespace-nowrap font-bold ${activeTab === 'sqllab' ? 'bg-indigo-600 text-white' : 'text-cyan-400 border border-cyan-500/40'}`}
          >
            SQL Lab
          </button>
        </div>
      </header>

      {/* Main Content View */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
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
        {activeTab === 'store' && (
          <StoreView />
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
        {activeTab === 'sqllab' && (
          <SqlLabView />
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
