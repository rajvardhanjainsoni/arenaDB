import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Crown, Gamepad2, Users, Flame, Award, Shield, Percent, AlertTriangle, RefreshCw, Trophy, Sparkles } from 'lucide-react';

export default function LeaderboardView({ onOpenTeamModal, onOpenPlayerModal }) {
  const [games, setGames] = useState([]);
  const [selectedGameId, setSelectedGameId] = useState(1);
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);

  // Fetch games list on mount
  useEffect(() => {
    fetch('/api/games')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setGames(data);
        if (data.length > 0) {
          setSelectedGameId(data[0].game_id);
        }
      })
      .catch(err => {
        console.error('Failed to fetch games list:', err);
        setErrorMsg('Unable to connect to backend server. Make sure server is active.');
      });
  }, []);

  // Fetch leaderboard standings when selectedGameId changes
  useEffect(() => {
    if (!selectedGameId) return;
    setLoading(true);
    setErrorMsg(null);
    fetch(`/api/leaderboard/${selectedGameId}`)
      .then(res => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        return res.json();
      })
      .then(data => {
        setLeaderboard(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Failed to fetch leaderboard:', err);
        setErrorMsg('Failed to load leaderboard data from backend API.');
        setLoading(false);
      });
  }, [selectedGameId]);

  const selectedGame = games.find(g => g.game_id === Number(selectedGameId));

  // Top 3 teams for Podium
  const podiumTeams = leaderboard.slice(0, 3);
  const remainingTeams = leaderboard.slice(3, 10);

  const top1 = podiumTeams[0] || null;
  const top2 = podiumTeams[1] || null;
  const top3 = podiumTeams[2] || null;

  const getGameBadgeColor = (title) => {
    switch (title?.toLowerCase()) {
      case 'valorant': return 'from-rose-500 to-red-600 text-white';
      case 'counter-strike 2': return 'from-amber-500 to-yellow-600 text-black';
      case 'league of legends': return 'from-cyan-500 to-blue-600 text-white';
      case 'apex legends': return 'from-red-600 to-orange-600 text-white';
      case 'rocket league': return 'from-blue-500 to-cyan-500 text-white';
      case 'dota 2': return 'from-purple-600 to-pink-600 text-white';
      default: return 'from-violet-500 to-purple-600 text-white';
    }
  };

  return (
    <div className="space-y-8 font-sans">
      {/* Network Error Toast / Banner */}
      {errorMsg && (
        <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-500/50 glow-rose text-rose-200 flex items-center justify-between shadow-2xl">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0" />
            <span className="text-sm font-medium">{errorMsg}</span>
          </div>
          <button 
            onClick={() => {
              setErrorMsg(null);
              if (selectedGameId) setSelectedGameId(selectedGameId);
            }}
            className="px-3 py-1 bg-rose-900/60 hover:bg-rose-800 text-rose-200 rounded-lg text-xs font-semibold border border-rose-500/30 transition flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Retry
          </button>
        </div>
      )}

      {/* Header & Game Selector Bar */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-purple-500/30 shadow-2xl">
        <div className="absolute -left-10 -bottom-10 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-purple-400 font-semibold text-xs uppercase tracking-widest mb-1">
              <Crown className="w-4 h-4 text-amber-400" /> Esports Circuit Standings
            </div>
            <h1 className="text-3xl font-black text-white font-display tracking-tight flex items-center gap-2">
              Esports Championship Leaderboard
            </h1>
            <p className="text-slate-400 text-sm mt-1">Real-time team standings, win ratios, and match victories across global esports circuits.</p>
          </div>

          {/* Dropdown Selector */}
          <div className="flex items-center gap-3 bg-slate-950/90 p-2.5 rounded-2xl border border-slate-800 self-start lg:self-auto shadow-inner">
            <Gamepad2 className="w-5 h-5 text-cyan-400 ml-1 shrink-0" />
            <select
              value={selectedGameId}
              onChange={(e) => setSelectedGameId(Number(e.target.value))}
              className="bg-slate-900 text-white font-bold text-sm py-2 pr-8 pl-3 rounded-xl border border-slate-700/80 focus:border-cyan-500 focus:outline-none cursor-pointer"
            >
              {games.map((g) => (
                <option key={g.game_id} value={g.game_id}>
                  {g.title} ({g.genre})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Colored Badges Bar for Games */}
        <div className="flex items-center gap-2 mt-6 pt-4 border-t border-slate-800/80 overflow-x-auto pb-1">
          <span className="text-xs text-slate-400 font-semibold uppercase tracking-wider mr-2 shrink-0 flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" /> Circuit Filter:
          </span>
          {games.map((g) => {
            const isSelected = g.game_id === Number(selectedGameId);
            return (
              <button
                key={g.game_id}
                onClick={() => setSelectedGameId(g.game_id)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-extrabold whitespace-nowrap transition duration-200 flex items-center gap-1.5 ${
                  isSelected
                    ? `bg-gradient-to-r ${getGameBadgeColor(g.title)} shadow-lg scale-105`
                    : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-white animate-ping' : 'bg-slate-500'}`}></span>
                {g.title}
              </button>
            );
          })}
        </div>
      </div>

      {loading ? (
        <div className="glass-card rounded-2xl p-16 text-center text-slate-400 border border-slate-800">
          <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin mx-auto mb-4"></div>
          <span className="font-semibold text-lg">Computing circuit metrics & match scores...</span>
        </div>
      ) : leaderboard.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center border border-slate-800">
          <Award className="w-16 h-16 text-slate-600 mx-auto mb-3" />
          <h3 className="text-xl font-bold text-white">No Standings Recorded</h3>
          <p className="text-slate-400 text-sm mt-1">No matches recorded for this game circuit yet.</p>
        </div>
      ) : (
        <>
          {/* TOP 3 PODIUM SECTION (GOLD, SILVER, BRONZE GLOWING EFFECTS) */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-extrabold text-white flex items-center gap-2 font-display">
                <Trophy className="w-5 h-5 text-amber-400" /> Top 3 Circuit Champions
              </h2>
              <span className="text-xs text-amber-400 font-semibold bg-amber-950/60 px-3 py-1 rounded-full border border-amber-500/30">
                Click team card to view roster details
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-4 pb-2 items-end">
              {/* 2ND PLACE (SILVER) */}
              {top2 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -12, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.2 }}
                  onClick={() => onOpenTeamModal && onOpenTeamModal(top2.team_id)}
                  className="order-2 md:order-1 cursor-pointer group"
                >
                  <div className="polaroid-card rounded-2xl p-5 border-2 border-slate-300/90 breathing-glow-silver relative overflow-hidden group-hover:border-cyan-400">
                    <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-[#0c101c] p-5 rounded-xl border border-slate-700/80">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-slate-200 text-slate-950 tracking-wider flex items-center gap-1 shadow-md">
                          <Award className="w-4 h-4 text-slate-900" /> #2 SILVER
                        </span>
                        <span className="text-xs text-cyan-400 font-mono font-semibold underline group-hover:text-white">Roster &rarr;</span>
                      </div>

                      <div className="text-center py-3">
                        <div className="w-16 h-16 rounded-full bg-slate-800/90 border-2 border-slate-300 mx-auto flex items-center justify-center mb-2 shadow-inner group-hover:scale-110 transition">
                          <Shield className="w-8 h-8 text-slate-300" />
                        </div>
                        <h3 className="text-2xl font-black text-white font-display truncate group-hover:text-cyan-300">{top2.team_name}</h3>
                        <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1 font-medium">
                          <Users className="w-3.5 h-3.5 text-cyan-400" /> Capt: <span className="text-slate-200 font-bold">{top2.captain_name}</span>
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Wins</span>
                          <span className="text-lg font-extrabold text-emerald-400 font-display">{top2.total_wins}</span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Win %</span>
                          <span className="text-lg font-extrabold text-cyan-400 font-display">
                            {top2.total_matches > 0 ? Math.round((top2.total_wins / top2.total_matches) * 100) : 0}%
                          </span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Score</span>
                          <span className="text-lg font-extrabold text-purple-400 font-display">{top2.total_points}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}

              {/* 1ST PLACE (GOLD - ELEVATED) */}
              {top1 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 60, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -16, scale: 1.04 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.1 }}
                  onClick={() => onOpenTeamModal && onOpenTeamModal(top1.team_id)}
                  className="order-1 md:order-2 transform md:-translate-y-6 cursor-pointer group"
                >
                  <div className="polaroid-card rounded-2xl p-5 border-4 border-amber-400 breathing-glow-gold relative overflow-hidden group-hover:border-yellow-300">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-amber-400/10 rounded-bl-full pointer-events-none"></div>
                    <div className="bg-gradient-to-b from-amber-950/50 via-slate-950 to-[#0c101c] p-6 rounded-xl border border-amber-500/40">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3.5 py-1 rounded-full text-xs font-black bg-gradient-to-r from-amber-400 to-yellow-300 text-black tracking-wider flex items-center gap-1.5 shadow-lg shadow-amber-500/30">
                          <Crown className="w-4 h-4 fill-black" /> #1 CHAMPION
                        </span>
                        <span className="text-xs text-amber-300 font-mono font-semibold underline group-hover:text-white">Roster &rarr;</span>
                      </div>

                      <div className="text-center py-4">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-amber-500 to-yellow-300 p-1 mx-auto mb-3 shadow-xl group-hover:scale-110 transition">
                          <div className="w-full h-full bg-slate-950 rounded-full flex items-center justify-center">
                            <Crown className="w-10 h-10 text-amber-400 fill-amber-400" />
                          </div>
                        </div>
                        <h3 className="text-3xl font-black text-white font-display tracking-wide group-hover:text-amber-300">{top1.team_name}</h3>
                        <p className="text-xs text-amber-300 mt-1 flex items-center justify-center gap-1 font-semibold">
                          <Users className="w-3.5 h-3.5 text-cyan-400" /> Capt: <span className="text-white font-bold">{top1.captain_name}</span>
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-amber-500/20 grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-amber-500/30">
                          <span className="text-[10px] text-amber-400 font-extrabold block uppercase">Victories</span>
                          <span className="text-xl font-black text-emerald-400 font-display">{top1.total_wins}</span>
                        </div>
                        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-amber-500/30">
                          <span className="text-[10px] text-amber-400 font-extrabold block uppercase">Win Rate</span>
                          <span className="text-xl font-black text-cyan-400 font-display">
                            {top1.total_matches > 0 ? Math.round((top1.total_wins / top1.total_matches) * 100) : 0}%
                          </span>
                        </div>
                        <div className="bg-slate-900/90 p-2.5 rounded-xl border border-amber-500/30">
                          <span className="text-[10px] text-amber-400 font-extrabold block uppercase">Points</span>
                          <span className="text-xl font-black text-amber-300 font-display flex items-center justify-center gap-1">
                            <Flame className="w-4 h-4 fill-amber-400" /> {top1.total_points}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}

              {/* 3RD PLACE (BRONZE) */}
              {top3 ? (
                <motion.div 
                  initial={{ opacity: 0, y: 50, scale: 0.9 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  whileHover={{ y: -12, scale: 1.03 }}
                  transition={{ type: "spring", stiffness: 280, damping: 22, delay: 0.3 }}
                  onClick={() => onOpenTeamModal && onOpenTeamModal(top3.team_id)}
                  className="order-3 md:order-3 cursor-pointer group"
                >
                  <div className="polaroid-card rounded-2xl p-5 border-2 border-amber-700/90 breathing-glow-bronze relative overflow-hidden group-hover:border-amber-500">
                    <div className="bg-gradient-to-b from-slate-900 via-slate-950 to-[#0c101c] p-5 rounded-xl border border-slate-700/80">
                      <div className="flex items-center justify-between mb-4">
                        <span className="px-3 py-1 rounded-full text-xs font-black bg-amber-700 text-amber-100 tracking-wider flex items-center gap-1 shadow-md">
                          <Award className="w-4 h-4 text-amber-100" /> #3 BRONZE
                        </span>
                        <span className="text-xs text-cyan-400 font-mono font-semibold underline group-hover:text-white">Roster &rarr;</span>
                      </div>

                      <div className="text-center py-3">
                        <div className="w-16 h-16 rounded-full bg-slate-800/90 border-2 border-amber-700 mx-auto flex items-center justify-center mb-2 shadow-inner group-hover:scale-110 transition">
                          <Shield className="w-8 h-8 text-amber-600" />
                        </div>
                        <h3 className="text-2xl font-black text-white font-display truncate group-hover:text-amber-400">{top3.team_name}</h3>
                        <p className="text-xs text-slate-400 mt-1 flex items-center justify-center gap-1 font-medium">
                          <Users className="w-3.5 h-3.5 text-cyan-400" /> Capt: <span className="text-slate-200 font-bold">{top3.captain_name}</span>
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-3 gap-2 text-center">
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Wins</span>
                          <span className="text-lg font-extrabold text-emerald-400 font-display">{top3.total_wins}</span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Win %</span>
                          <span className="text-lg font-extrabold text-cyan-400 font-display">
                            {top3.total_matches > 0 ? Math.round((top3.total_wins / top3.total_matches) * 100) : 0}%
                          </span>
                        </div>
                        <div className="bg-slate-900/90 p-2 rounded-lg border border-slate-800">
                          <span className="text-[10px] text-slate-400 font-semibold block uppercase">Score</span>
                          <span className="text-lg font-extrabold text-purple-400 font-display">{top3.total_points}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ) : null}
            </div>
          </div>

          {/* RANKS 4 TO 10 REMAINING CONTENDERS LIST */}
          <div className="glass-card rounded-2xl border border-slate-800 overflow-hidden shadow-2xl mt-8">
            <div className="p-5 border-b border-slate-800/80 bg-slate-900/60 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-cyan-400" />
                <h2 className="text-lg font-extrabold text-white font-display">
                  Circuit Contenders (Ranks 4 &ndash; 10)
                </h2>
              </div>
              <span className="text-xs text-cyan-300 font-bold bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/30">
                {remainingTeams.length} Team{remainingTeams.length === 1 ? '' : 's'} Competing
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-300">
                <thead className="bg-slate-950/90 text-xs font-semibold text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="px-6 py-4">Rank</th>
                    <th className="px-6 py-4">Team Name</th>
                    <th className="px-6 py-4">Captain</th>
                    <th className="px-6 py-4 text-center">Matches</th>
                    <th className="px-6 py-4 text-center">Victories</th>
                    <th className="px-6 py-4 text-center">Win Rate</th>
                    <th className="px-6 py-4 text-right">Total Points</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {remainingTeams.length === 0 ? (
                    <tr>
                      <td colSpan="7" className="px-6 py-8 text-center text-slate-500 text-sm font-medium">
                        No additional contenders recorded for this circuit yet.
                      </td>
                    </tr>
                  ) : (
                    remainingTeams.map((row, idx) => {
                      const rank = idx + 4;
                      const winRate = row.total_matches > 0 
                        ? Math.round((row.total_wins / row.total_matches) * 100) 
                        : 0;

                      return (
                        <tr 
                          key={row.team_id}
                          className="transition duration-150 group cursor-pointer hover:bg-slate-800/60 bg-slate-900/40"
                          onClick={() => onOpenTeamModal && onOpenTeamModal(row.team_id)}
                        >
                          <td className="px-6 py-4 font-bold text-base whitespace-nowrap">
                            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-slate-800 text-slate-300 border border-slate-700">
                              #{rank}
                            </span>
                          </td>

                          <td className="px-6 py-4 font-bold text-white group-hover:text-cyan-300 transition">
                            <div className="flex items-center gap-2">
                              <Shield className="w-4 h-4 text-cyan-400" />
                              <span className="underline decoration-cyan-500/30 group-hover:decoration-cyan-400 font-extrabold text-base">{row.team_name}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-slate-300 font-medium">
                            <div className="flex items-center gap-1.5">
                              <Users className="w-3.5 h-3.5 text-purple-400" />
                              <span>{row.captain_name}</span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-center font-bold text-slate-200">
                            {row.total_matches}
                          </td>

                          <td className="px-6 py-4 text-center font-extrabold text-emerald-400">
                            {row.total_wins} W
                          </td>

                          <td className="px-6 py-4 text-center">
                            <div className="flex items-center justify-center gap-2">
                              <div className="w-16 bg-slate-800 rounded-full h-1.5 overflow-hidden hidden sm:block">
                                <div 
                                  className="bg-gradient-to-r from-cyan-500 to-emerald-400 h-full rounded-full" 
                                  style={{ width: `${winRate}%` }}
                                ></div>
                              </div>
                              <span className="inline-flex items-center gap-0.5 px-2.5 py-0.5 rounded-md text-xs font-extrabold bg-slate-950 text-cyan-300 border border-cyan-500/30">
                                <Percent className="w-3 h-3" /> {winRate}%
                              </span>
                            </div>
                          </td>

                          <td className="px-6 py-4 text-right font-black text-white text-base font-display">
                            <span className="flex items-center justify-end gap-1 text-purple-300">
                              <Flame className="w-4 h-4 text-amber-500 fill-amber-500" /> {row.total_points} PTS
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
