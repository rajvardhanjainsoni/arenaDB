import React, { useState, useEffect } from 'react';
import { Shield, X, Users, Mail, Calendar, Crown, Award, ChevronRight, User, Trash2, ArrowUpDown, UserPlus, Plus } from 'lucide-react';
import { AvatarImage } from './Avatar';

export default function TeamModal({ teamId, teamData, onClose, onSelectPlayer }) {
  const [details, setDetails] = useState(teamData || null);
  const [loading, setLoading] = useState(!teamData || !teamData.members);
  const [sortMode, setSortMode] = useState('alphabetical'); // 'alphabetical', 'date_joined'
  
  const [allPlayers, setAllPlayers] = useState([]);
  const [selectedPlayerToAdd, setSelectedPlayerToAdd] = useState('');
  const [addingPlayer, setAddingPlayer] = useState(false);

  const fetchTeamDetails = () => {
    if (teamId) {
      setLoading(true);
      Promise.all([
        fetch(`/api/teams/${teamId}`).then(res => res.json()),
        fetch('/api/players').then(res => res.json())
      ])
        .then(([tData, pData]) => {
          setDetails(tData);
          setAllPlayers(pData);
          setLoading(false);
        })
        .catch(err => {
          console.error('Failed to fetch team details:', err);
          setLoading(false);
        });
    }
  };

  useEffect(() => {
    fetchTeamDetails();
  }, [teamId]);

  if (!teamId && !teamData) return null;

  const formatDate = (d) => {
    if (!d || d === 'N/A') return 'March 15, 2021';
    return new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const handleDisbandTeam = async () => {
    if (window.confirm(`Are you sure you want to disband & delete team "${details?.team_name}"?`)) {
      try {
        await fetch(`/api/teams/${teamId || details.team_id}`, { method: 'DELETE' });
        onClose();
        window.location.reload();
      } catch (err) {
        console.error('Failed to disband team:', err);
      }
    }
  };

  const handleAddMember = async (e) => {
    e.preventDefault();
    if (!selectedPlayerToAdd) return;
    setAddingPlayer(true);
    try {
      await fetch(`/api/teams/${teamId || details.team_id}/members`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: selectedPlayerToAdd })
      });
      // Also update player's team_id
      await fetch(`/api/players/${selectedPlayerToAdd}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ team_id: teamId || details.team_id })
      });
      setSelectedPlayerToAdd('');
      fetchTeamDetails();
    } catch (err) {
      console.error('Failed to add player to team:', err);
    } finally {
      setAddingPlayer(false);
    }
  };

  // Sort member roster either Alphabetically or by Date Joined
  const sortedMembers = [...(details?.members || [])].sort((a, b) => {
    if (sortMode === 'alphabetical') {
      return (a.username || '').localeCompare(b.username || '');
    } else {
      return new Date(b.joined_date || 0) - new Date(a.joined_date || 0);
    }
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in duration-200 font-sans">
      <div className="glass-card rounded-3xl max-w-xl w-full p-7 border-2 border-cyan-500/40 shadow-2xl relative glow-cyan overflow-hidden max-h-[90vh] flex flex-col">
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-48 h-48 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>

        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-slate-900 border-2 border-cyan-500/50 flex items-center justify-center shadow-lg shadow-cyan-500/20 shrink-0">
              <Shield className="w-6 h-6 text-cyan-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-widest bg-cyan-500/20 text-cyan-300 px-2.5 py-0.5 rounded-full border border-cyan-500/30">
                  Esports Roster Profile
                </span>
              </div>
              <h2 className="text-2xl font-black text-white font-display tracking-tight mt-0.5">
                {details?.team_name || 'Team Roster'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleDisbandTeam}
              className="p-2 rounded-xl bg-rose-950/80 text-rose-300 hover:bg-rose-900 border border-rose-500/40 transition text-xs font-bold flex items-center gap-1"
              title="Disband & Delete Team"
            >
              <Trash2 className="w-4 h-4 text-rose-400" /> Disband Team
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
            <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
            Fetching full team roster details...
          </div>
        ) : (
          <div className="overflow-y-auto space-y-5 pr-1">
            {/* Team Meta Badges */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
                <Crown className="w-5 h-5 text-amber-400 shrink-0" />
                <div className="min-w-0">
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Team Captain</span>
                  <span className="text-sm font-bold text-white truncate block">{details?.captain_name || 'Team Captain'}</span>
                </div>
              </div>

              <div className="bg-slate-900/90 p-3.5 rounded-2xl border border-slate-800 flex items-center gap-3">
                <Calendar className="w-5 h-5 text-purple-400 shrink-0" />
                <div>
                  <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider block">Date Founded</span>
                  <span className="text-sm font-bold text-white">{formatDate(details?.created_date)}</span>
                </div>
              </div>
            </div>

            {/* Quick Add Player to Roster Bar */}
            <form onSubmit={handleAddMember} className="bg-slate-950 p-3 rounded-2xl border border-slate-800 flex items-center gap-3">
              <UserPlus className="w-4 h-4 text-cyan-400 shrink-0" />
              <select
                value={selectedPlayerToAdd}
                onChange={e => setSelectedPlayerToAdd(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-white text-xs font-semibold rounded-xl p-2 flex-1 focus:outline-none focus:border-cyan-500 cursor-pointer"
              >
                <option value="">+ Add Existing Player to Team Roster...</option>
                {allPlayers.map(p => (
                  <option key={p.player_id} value={p.player_id}>
                    {p.username} ({p.rank || 'Pro Tier'})
                  </option>
                ))}
              </select>
              <button
                type="submit"
                disabled={!selectedPlayerToAdd || addingPlayer}
                className="px-3.5 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl flex items-center gap-1 transition shadow-md shadow-cyan-600/30"
              >
                <Plus className="w-3.5 h-3.5" /> Add
              </button>
            </form>

            {/* Roster Members List Header & Sorting */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2 font-display">
                  <Users className="w-4 h-4 text-cyan-400" /> Active Roster ({sortedMembers.length} Pros)
                </h3>

                {/* Member Sort Toggle */}
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-2.5 py-1 rounded-lg">
                  <ArrowUpDown className="w-3 h-3 text-cyan-400" />
                  <select
                    value={sortMode}
                    onChange={e => setSortMode(e.target.value)}
                    className="bg-transparent text-[11px] font-bold text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="alphabetical">Sort: Alphabetical (A-Z)</option>
                    <option value="date_joined">Sort: Last Joined Date</option>
                  </select>
                </div>
              </div>

              {/* Roster Members Cards */}
              <div className="space-y-3">
                {sortedMembers.map((member) => (
                  <div
                    key={member.player_id || member.username}
                    onClick={() => {
                      if (onSelectPlayer) {
                        onSelectPlayer(member);
                      }
                    }}
                    className="group bg-slate-900/80 hover:bg-slate-800/80 p-3.5 rounded-2xl border border-slate-800 hover:border-cyan-500/50 transition cursor-pointer flex items-center justify-between shadow-md"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 shrink-0">
                        <AvatarImage avatarId={member.avatar_id} className="w-full h-full group-hover:scale-105 transition" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-white text-base group-hover:text-cyan-300 transition">
                            {member.username}
                          </span>
                          {member.player_id === details.captain_id && (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                              CAPTAIN
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                          <span className="flex items-center gap-1">
                            <Award className="w-3 h-3 text-purple-400" /> {member.rank || 'Pro Tier'}
                          </span>
                          <span>&bull;</span>
                          <span className="flex items-center gap-1 text-slate-300">
                            <Mail className="w-3 h-3 text-cyan-400" /> {member.email && member.email !== 'N/A' ? member.email : `${member.username.toLowerCase()}@arenadb.com`}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-slate-500 group-hover:text-cyan-400 group-hover:translate-x-1 transition" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
