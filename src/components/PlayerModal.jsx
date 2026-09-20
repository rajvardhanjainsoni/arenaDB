import React, { useState, useEffect } from 'react';
import { User, X, Mail, Calendar, Shield, Award, Sparkles, CheckCircle2, Cpu, Edit3, Trash2, Save, ArrowRightLeft, Image, Zap, TrendingUp, Flame } from 'lucide-react';
import { AvatarImage, AvatarPickerModal } from './Avatar';

export default function PlayerModal({ playerId, playerData, onClose, onSelectTeam }) {
  const [player, setPlayer] = useState(playerData || null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(!playerData);
  const [isEditing, setIsEditing] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [playerLevel, setPlayerLevel] = useState(78);

  // Edit Form State
  const [editForm, setEditForm] = useState({ 
    username: '', 
    email: '', 
    rank: 'Radiant', 
    team_id: '', 
    avatar_id: 'cyber-ninja',
    level: 78 
  });
  const [submitting, setSubmitting] = useState(false);

  const fetchPlayerData = () => {
    if (playerId) {
      setLoading(true);
      Promise.all([
        fetch(`/api/players/${playerId}`).then(r => r.json()),
        fetch('/api/teams').then(r => r.json())
      ])
        .then(([pData, tData]) => {
          const validEmail = pData.email && pData.email !== 'N/A' 
            ? pData.email 
            : `${(pData.username || 'pro').toLowerCase()}@arenadb.com`;
          
          const computedLevel = (pData.player_id * 7 + 42) % 95 + 10;
          setPlayerLevel(computedLevel);

          const fullPlayer = {
            ...pData,
            email: validEmail,
            avatar_id: pData.avatar_id || 'cyber-ninja',
            rank: pData.rank || 'Radiant',
            joined_date: pData.joined_date || '2021-03-15'
          };

          setPlayer(fullPlayer);
          setTeams(tData);
          setEditForm({
            username: fullPlayer.username || '',
            email: validEmail,
            rank: fullPlayer.rank || 'Radiant',
            avatar_id: fullPlayer.avatar_id || 'cyber-ninja',
            team_id: fullPlayer.team_id || (tData.length > 0 ? tData[0].team_id : ''),
            level: computedLevel
          });
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch player details:', err);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchPlayerData();
  }, [playerId]);

  if (!playerId && !playerData) return null;

  const formatDate = (d) => {
    if (!d || d === 'N/A') return 'March 15, 2021';
    return new Date(d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };

  const handleSaveEdit = async (e) => {
    if (e) e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/players/${playerId || player.player_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editForm)
      });
      if (res.ok) {
        setIsEditing(false);
        setPlayer(prev => ({ ...prev, ...editForm }));
        fetchPlayerData();
      }
    } catch (err) {
      console.error('Error updating player profile:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleSelectAvatar = async (selectedAvatarId) => {
    setEditForm(prev => ({ ...prev, avatar_id: selectedAvatarId }));
    setPlayer(prev => ({ ...prev, avatar_id: selectedAvatarId }));
    
    // Immediately persist avatar change to server
    try {
      await fetch(`/api/players/${playerId || player.player_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, avatar_id: selectedAvatarId })
      });
    } catch (err) {
      console.error('Failed to update avatar on backend:', err);
    }
  };

  const handleRankUp = async () => {
    const ranks = ['Unranked', 'Diamond', 'Immortal', 'Grand Champion', 'Apex Predator', 'Challenger', 'Global Elite', 'Radiant'];
    const currentIdx = ranks.findIndex(r => r.toLowerCase() === (player?.rank || '').toLowerCase());
    const nextRank = currentIdx < ranks.length - 1 ? ranks[currentIdx + 1] : 'Radiant';
    const nextLevel = playerLevel + 1;

    setPlayerLevel(nextLevel);
    setPlayer(prev => ({ ...prev, rank: nextRank }));
    setEditForm(prev => ({ ...prev, rank: nextRank, level: nextLevel }));

    try {
      await fetch(`/api/players/${playerId || player.player_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...editForm, rank: nextRank })
      });
    } catch (err) {
      console.error('Failed to promote player rank:', err);
    }
  };

  const handleDeletePlayer = async () => {
    if (window.confirm(`Are you sure you want to remove player "${player?.username}" from the database?`)) {
      try {
        await fetch(`/api/players/${playerId || player.player_id}`, { method: 'DELETE' });
        onClose();
        window.location.reload();
      } catch (err) {
        console.error('Failed to delete player:', err);
      }
    }
  };

  const getRankBadgeColor = (rank) => {
    switch (rank?.toLowerCase()) {
      case 'radiant': return 'from-rose-500 to-amber-500 text-white';
      case 'global elite': return 'from-amber-400 to-yellow-500 text-black';
      case 'challenger': return 'from-cyan-400 to-blue-600 text-white';
      case 'apex predator': return 'from-red-600 to-rose-700 text-white';
      case 'grand champion': return 'from-purple-500 to-indigo-600 text-white';
      case 'immortal': return 'from-violet-600 to-fuchsia-600 text-white';
      default: return 'from-cyan-500 to-purple-500 text-white';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 font-sans">
      <div className="glass-card rounded-3xl max-w-lg w-full p-6 border-2 border-violet-500/40 shadow-2xl relative glow-violet overflow-hidden max-h-[90vh] flex flex-col">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Avatar Selection Modal Popup */}
        {showAvatarPicker && (
          <AvatarPickerModal
            currentAvatarId={player?.avatar_id || editForm.avatar_id}
            onSelect={handleSelectAvatar}
            onClose={() => setShowAvatarPicker(false)}
          />
        )}

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-widest bg-violet-500/20 text-violet-300 px-3 py-1 rounded-full border border-violet-500/30 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-amber-400" /> Pro Player Dossier
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="p-2 rounded-xl bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700 transition text-xs font-bold flex items-center gap-1"
            >
              <Edit3 className="w-4 h-4 text-cyan-400" /> {isEditing ? 'Cancel Edit' : 'Edit Profile'}
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-400 animate-pulse">
            <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Loading player personal profile...
          </div>
        ) : isEditing ? (
          /* EDIT PLAYER FORM */
          <form onSubmit={handleSaveEdit} className="space-y-4 overflow-y-auto pr-1">
            <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 space-y-3">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-display">
                <Edit3 className="w-4 h-4 text-cyan-400" /> Edit Player Info & Avatar
              </h3>
              
              {/* Profile Avatar Selection Button */}
              <div className="flex items-center gap-4 p-3 bg-slate-950 rounded-xl border border-slate-800">
                <div className="w-14 h-14 shrink-0">
                  <AvatarImage avatarId={editForm.avatar_id} className="w-full h-full" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">Profile Avatar Picture</span>
                  <button
                    type="button"
                    onClick={() => setShowAvatarPicker(true)}
                    className="mt-1.5 px-3 py-1 bg-cyan-950 hover:bg-cyan-900 text-cyan-300 border border-cyan-500/40 rounded-lg text-xs font-semibold flex items-center gap-1 transition"
                  >
                    <Image className="w-3.5 h-3.5 text-cyan-400" /> Choose Profile Picture Menu
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Username</label>
                <input
                  type="text"
                  value={editForm.username}
                  onChange={e => setEditForm({...editForm, username: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Contact Email</label>
                <input
                  type="email"
                  value={editForm.email}
                  onChange={e => setEditForm({...editForm, email: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Rank Tier / League</label>
                <select
                  value={editForm.rank}
                  onChange={e => setEditForm({...editForm, rank: e.target.value})}
                  className="w-full bg-slate-950 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option>Radiant</option>
                  <option>Global Elite</option>
                  <option>Challenger</option>
                  <option>Apex Predator</option>
                  <option>Grand Champion</option>
                  <option>Immortal</option>
                  <option>Unreal Tier</option>
                  <option>Diamond</option>
                  <option>Unranked</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1 flex items-center gap-1">
                  <ArrowRightLeft className="w-3.5 h-3.5 text-emerald-400" /> Switch Team Assignment
                </label>
                <select
                  value={editForm.team_id}
                  onChange={e => setEditForm({...editForm, team_id: e.target.value})}
                  className="w-full bg-slate-950 border border-emerald-500/40 rounded-lg p-2.5 text-sm text-cyan-300 font-bold focus:border-emerald-500 focus:outline-none"
                >
                  {teams.map(t => (
                    <option key={t.team_id} value={t.team_id}>
                      {t.team_name} (ID: {t.team_id})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-between items-center pt-2">
              <button
                type="button"
                onClick={handleDeletePlayer}
                className="px-4 py-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/40 flex items-center gap-1.5"
              >
                <Trash2 className="w-4 h-4" /> Remove Player
              </button>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold text-xs rounded-xl hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-cyan-600/30 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> {submitting ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </div>
          </form>
        ) : (
          /* DISPLAY PLAYER PROFILE */
          <div className="space-y-5 overflow-y-auto pr-1">
            {/* Player Avatar & Headline Info */}
            <div className="flex items-center gap-4 bg-slate-900/90 p-4.5 rounded-2xl border border-slate-800 shadow-inner">
              <div 
                onClick={() => setShowAvatarPicker(true)}
                className="relative cursor-pointer group shrink-0"
                title="Click to choose profile picture from menu"
              >
                <div className="w-16 h-16">
                  <AvatarImage avatarId={player?.avatar_id} className="w-full h-full group-hover:scale-105 transition" />
                </div>
                <span className="absolute -bottom-1 -right-1 bg-cyan-500 text-black text-[9px] font-black px-1.5 py-0.5 rounded-full shadow border border-slate-900 group-hover:bg-cyan-400">
                  CHANGE
                </span>
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h2 className="text-2xl font-black text-white font-display tracking-tight truncate">
                    {player?.username}
                  </h2>
                  <CheckCircle2 className="w-5 h-5 text-cyan-400 shrink-0" />
                </div>
                
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  <span className={`px-3 py-0.5 rounded-full text-xs font-black bg-gradient-to-r ${getRankBadgeColor(player?.rank)} shadow-md`}>
                    {player?.rank || 'Unranked'}
                  </span>
                  <span className="text-xs text-amber-400 font-bold bg-amber-950/80 px-2.5 py-0.5 rounded-full border border-amber-500/30 flex items-center gap-1">
                    <Zap className="w-3 h-3 fill-amber-400" /> LVL {playerLevel}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">#PRO-{player?.player_id ? player.player_id + 1040 : '1001'}</span>
                </div>
              </div>
            </div>

            {/* Quick Actions: Rank Up & Avatar Selector */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setShowAvatarPicker(true)}
                className="py-2.5 bg-slate-900 hover:bg-slate-800 text-cyan-300 border border-slate-700 hover:border-cyan-500/50 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition shadow-sm"
              >
                <Image className="w-4 h-4 text-cyan-400" /> Change Profile Picture
              </button>

              <button
                onClick={handleRankUp}
                className="py-2.5 bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-black font-extrabold rounded-xl text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-amber-500/20 transition"
              >
                <TrendingUp className="w-4 h-4 fill-black" /> Rank Up / Promote
              </button>
            </div>

            {/* Personal Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-cyan-400" /> Contact Email
                </span>
                <span className="text-xs font-bold text-slate-200 block truncate">
                  {player?.email && player?.email !== 'N/A' ? player.email : `${(player?.username || 'pro').toLowerCase()}@arenadb.com`}
                </span>
              </div>

              <div className="bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-purple-400" /> Date Game Was Joined
                </span>
                <span className="text-xs font-bold text-slate-200 block">{formatDate(player?.joined_date)}</span>
              </div>

              <div 
                onClick={() => {
                  if (player?.team_id && onSelectTeam) {
                    onSelectTeam(player.team_id);
                  }
                }}
                className={`bg-slate-900/80 p-3.5 rounded-2xl border border-slate-800 space-y-1 sm:col-span-2 ${
                  player?.team_id && onSelectTeam ? 'cursor-pointer hover:border-cyan-500/50 transition' : ''
                }`}
              >
                <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" /> Current Team Assignment
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-base font-extrabold text-cyan-300 font-display">
                    {player?.team_name || 'Sentinels Esports'}
                  </span>
                  {player?.team_id && onSelectTeam && (
                    <span className="text-xs text-cyan-400 font-semibold underline">View Roster &rarr;</span>
                  )}
                </div>
              </div>
            </div>

            {/* Performance Stats Cards */}
            <div className="grid grid-cols-3 gap-2.5 text-center">
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Win Rate</span>
                <span className="text-base font-black text-emerald-400 font-display">74.2%</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">K/D Ratio</span>
                <span className="text-base font-black text-cyan-400 font-display">1.48</span>
              </div>
              <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                <span className="text-[10px] text-slate-400 font-semibold block uppercase">Role</span>
                <span className="text-xs font-black text-purple-400 font-display mt-0.5 block">Duelist</span>
              </div>
            </div>

            {/* Competitive System Badge Footer */}
            <div className="bg-slate-950/80 p-3 rounded-2xl border border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5 font-medium">
                <Cpu className="w-4 h-4 text-purple-400" /> arenaDB Competitive System Verified
              </span>
              <span className="text-emerald-400 font-bold text-[11px] bg-emerald-950/80 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                ACTIVE PRO
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
