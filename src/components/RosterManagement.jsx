import React, { useState, useEffect } from 'react';
import { Users, UserPlus, ShieldPlus, RefreshCw, CheckCircle, X, AlertTriangle, Calendar, ArrowUpDown } from 'lucide-react';
import { AvatarImage } from './Avatar';

export default function RosterManagement({ onOpenTeamModal, onOpenPlayerModal }) {
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [playerSortOrder, setPlayerSortOrder] = useState('newest'); // 'newest', 'oldest', 'alpha'
  const [teamSortOrder, setTeamSortOrder] = useState('oldest'); // 'oldest', 'newest', 'alpha'

  // Form states
  const [showPlayerModal, setShowPlayerModal] = useState(false);
  const [playerForm, setPlayerForm] = useState({ username: '', email: '', rank: 'Radiant', joined_date: new Date().toISOString().split('T')[0] });
  
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [teamForm, setTeamForm] = useState({ team_name: '', created_date: new Date().toISOString().split('T')[0], captain_id: '' });

  const [toastMessage, setToastMessage] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [pRes, tRes] = await Promise.all([
        fetch('/api/players'),
        fetch('/api/teams')
      ]);
      const pData = await pRes.json();
      const tData = await tRes.json();
      setPlayers(pData);
      setTeams(tData);
      if (pData.length > 0) setTeamForm(prev => ({ ...prev, captain_id: pData[0].player_id }));
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handlePlayerSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/players', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(playerForm)
      });
      const data = await res.json();
      if (res.ok) {
        setToastMessage({ type: 'success', text: 'Player Registered!' });
        setShowPlayerModal(false);
        setPlayerForm({ username: '', email: '', rank: 'Radiant', joined_date: new Date().toISOString().split('T')[0] });
        setPlayers(prev => [...prev, data]);
      } else {
        console.error('Server returned error:', data);
        setToastMessage({ type: 'error', text: data.error || 'Failed to register player.' });
      }
    } catch (err) { 
      console.error('Network error during player registration:', err);
      setToastMessage({ type: 'error', text: 'Network Error' }); 
    }
  };

  const handleTeamSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/teams', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(teamForm)
      });
      if (res.ok) {
        setToastMessage({ type: 'success', text: 'Team Created!' });
        setShowTeamModal(false);
        fetchData();
      } else {
        setToastMessage({ type: 'error', text: 'Failed to create team.' });
      }
    } catch (err) { setToastMessage({ type: 'error', text: 'Network Error' }); }
  };

  // Sort players chronologically according to joined_date
  const sortedPlayers = [...players].sort((a, b) => {
    if (playerSortOrder === 'newest') {
      return new Date(b.joined_date || 0) - new Date(a.joined_date || 0);
    } else if (playerSortOrder === 'oldest') {
      return new Date(a.joined_date || 0) - new Date(b.joined_date || 0);
    } else {
      return (a.username || '').localeCompare(b.username || '');
    }
  });

  // Sort teams chronologically according to created_date
  const sortedTeams = [...teams].sort((a, b) => {
    if (teamSortOrder === 'oldest') {
      return new Date(a.created_date || 0) - new Date(b.created_date || 0);
    } else if (teamSortOrder === 'newest') {
      return new Date(b.created_date || 0) - new Date(a.created_date || 0);
    } else {
      return (a.team_name || '').localeCompare(b.team_name || '');
    }
  });

  const formatDate = (d) => {
    if (!d) return 'N/A';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 font-sans">
      {toastMessage && (
        <div className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-xl ${
          toastMessage.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 glow-emerald' : 'bg-rose-950/80 text-rose-300 border border-rose-500/40 glow-rose'
        }`}>
          <span className="flex items-center gap-2">
            {toastMessage.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
            {toastMessage.text}
          </span>
          <button onClick={() => setToastMessage(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-violet-500/20">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-violet-400 font-semibold text-sm uppercase tracking-wider mb-1">
              <Users className="w-4 h-4" /> Roster Management
            </div>
            <h1 className="text-3xl font-extrabold text-white font-display">Players & Teams</h1>
            <p className="text-slate-400 text-sm mt-1">
              Manage eSports rosters, register new pros, and view teams sorted chronologically by registration date.
            </p>
          </div>
          <div className="flex gap-3">
            <button onClick={() => setShowPlayerModal(true)} className="flex items-center gap-2 px-4 py-2 bg-violet-600 hover:bg-violet-500 text-white border border-violet-500/30 rounded-xl text-sm font-bold transition duration-200 shadow-lg shadow-violet-600/30">
              <UserPlus className="w-4 h-4" /> Register Player
            </button>
            <button onClick={() => setShowTeamModal(true)} className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-500/30 rounded-xl text-sm font-bold transition duration-200 shadow-lg shadow-cyan-600/30">
              <ShieldPlus className="w-4 h-4" /> Create Team
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Players List */}
        <div className="glass-card rounded-2xl border border-slate-800 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-violet-400" /> Active Players ({players.length})
            </h2>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              <ArrowUpDown className="w-3 h-3 text-violet-400" />
              <select
                value={playerSortOrder}
                onChange={e => setPlayerSortOrder(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="newest">Registration: Newest First</option>
                <option value="oldest">Registration: Oldest First</option>
                <option value="alpha">Username (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {sortedPlayers.map(p => (
              <div 
                key={p.player_id} 
                onClick={() => onOpenPlayerModal && onOpenPlayerModal(p.player_id)}
                className="bg-slate-900/60 hover:bg-slate-800/80 p-3.5 rounded-xl border border-slate-800 hover:border-violet-500/40 transition cursor-pointer flex justify-between items-center group"
              >
                <div className="flex items-center gap-3">
                  <AvatarImage avatarId={p.avatar_id} className="w-10 h-10 shrink-0 group-hover:scale-105 transition" />
                  <div>
                    <div className="font-bold text-white text-sm group-hover:text-violet-300 transition flex items-center gap-1.5">
                      {p.username}
                    </div>
                    <div className="text-xs text-slate-400 flex items-center gap-2">
                      <span>{p.rank || 'Pro Tier'}</span>
                      <span>&bull;</span>
                      <span className="text-[11px] text-slate-500 font-mono flex items-center gap-1">
                        <Calendar className="w-3 h-3 text-violet-400" /> Joined {formatDate(p.joined_date)}
                      </span>
                    </div>
                  </div>
                </div>

                <span className="text-xs text-cyan-400 font-semibold underline group-hover:text-white">Profile &rarr;</span>
              </div>
            ))}
          </div>
        </div>

        {/* Teams List */}
        <div className="glass-card rounded-2xl border border-slate-800 p-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-800 pb-3 mb-4 gap-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <ShieldPlus className="w-5 h-5 text-cyan-400" /> Active Teams ({teams.length})
            </h2>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
              <ArrowUpDown className="w-3 h-3 text-cyan-400" />
              <select
                value={teamSortOrder}
                onChange={e => setTeamSortOrder(e.target.value)}
                className="bg-transparent text-[11px] font-bold text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="oldest">Founded: Oldest First</option>
                <option value="newest">Founded: Newest First</option>
                <option value="alpha">Team Name (A-Z)</option>
              </select>
            </div>
          </div>

          <div className="space-y-3 max-h-[500px] overflow-y-auto pr-2">
            {sortedTeams.map(t => (
              <div 
                key={t.team_id} 
                onClick={() => onOpenTeamModal && onOpenTeamModal(t.team_id)}
                className="bg-slate-900/60 hover:bg-slate-800/80 p-3.5 rounded-xl border border-slate-800 hover:border-cyan-500/40 transition cursor-pointer flex justify-between items-center group"
              >
                <div>
                  <div className="font-bold text-white text-sm text-cyan-300 group-hover:text-cyan-200 transition">{t.team_name}</div>
                  <div className="text-xs text-slate-400 flex items-center gap-1.5 mt-0.5 font-mono">
                    <Calendar className="w-3 h-3 text-purple-400" /> Registered: {formatDate(t.created_date)}
                  </div>
                </div>
                <span className="text-xs text-cyan-400 font-semibold underline group-hover:text-white">Roster &rarr;</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Modals */}
      {showPlayerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 border border-violet-500/30 shadow-2xl relative glow-violet">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><UserPlus className="w-5 h-5 text-violet-400" /> Register Player</h3>
              <button onClick={() => setShowPlayerModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handlePlayerSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Username</label>
                <input required type="text" value={playerForm.username} onChange={e => setPlayerForm({...playerForm, username: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-violet-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Email</label>
                <input required type="email" value={playerForm.email} onChange={e => setPlayerForm({...playerForm, email: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-violet-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Rank Tier</label>
                <select value={playerForm.rank} onChange={e => setPlayerForm({...playerForm, rank: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-violet-500 focus:outline-none">
                  <option>Radiant</option><option>Global Elite</option><option>Challenger</option><option>Diamond</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowPlayerModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold text-sm rounded-lg hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-violet-600 hover:bg-violet-500 text-white font-bold text-sm rounded-lg shadow-lg shadow-violet-600/30">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showTeamModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 border border-cyan-500/30 shadow-2xl relative glow-cyan">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><ShieldPlus className="w-5 h-5 text-cyan-400" /> Create Team</h3>
              <button onClick={() => setShowTeamModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleTeamSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Team Name</label>
                <input required type="text" value={teamForm.team_name} onChange={e => setTeamForm({...teamForm, team_name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Captain</label>
                <select required value={teamForm.captain_id} onChange={e => setTeamForm({...teamForm, captain_id: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none">
                  <option value="">Select a Player</option>
                  {players.map(p => <option key={p.player_id} value={p.player_id}>{p.username}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowTeamModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold text-sm rounded-lg hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm rounded-lg shadow-lg shadow-cyan-600/30">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
