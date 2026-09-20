import React, { useState, useEffect } from 'react';
import { Trophy, Calendar, Gamepad2, Building2, Search, DollarSign, Tag, RefreshCw, Plus, X, CheckCircle, AlertTriangle, Edit3, Trash2, ArrowUpDown, Save, Shield } from 'lucide-react';

export default function TournamentHub() {
  const [tournaments, setTournaments] = useState([]);
  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedGenre, setSelectedGenre] = useState('All');
  const [sortBy, setSortBy] = useState('newest'); // 'newest', 'chronological_asc', 'chronological_desc', 'prize_desc'

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingTournament, setEditingTournament] = useState(null); // null or tournament object
  
  const [form, setForm] = useState({ 
    name: '', 
    prize_pool: '', 
    start_date: new Date().toISOString().split('T')[0], 
    end_date: new Date().toISOString().split('T')[0], 
    game_id: '',
    tier: 'Tier 1 Premier Major'
  });
  
  const [toast, setToast] = useState(null);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const [tRes, gRes] = await Promise.all([fetch('/api/tournaments'), fetch('/api/games')]);
      const tData = await tRes.json();
      const gData = await gRes.json();
      setTournaments(tData);
      setGames(gData);
      if (gData.length > 0 && !form.game_id) setForm(prev => ({ ...prev, game_id: gData[0].game_id }));
    } catch (err) {
      console.error('Failed to load tournaments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTournaments();
  }, []);

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/tournaments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        const newTournament = await res.json();
        setToast({ type: 'success', text: 'Tournament Created Successfully!' });
        setShowCreateModal(false);
        setTournaments(prev => [newTournament, ...prev]);
        fetchTournaments();
      } else {
        const errJson = await res.json().catch(() => ({}));
        setToast({ type: 'error', text: errJson.error || 'Failed to create tournament.' });
      }
    } catch (err) { setToast({ type: 'error', text: 'Network Error' }); }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!editingTournament) return;
    try {
      const res = await fetch(`/api/tournaments/${editingTournament.tournament_id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingTournament)
      });
      if (res.ok) {
        const updatedData = await res.json();
        setToast({ type: 'success', text: 'Tournament Details Updated Successfully!' });
        setEditingTournament(null);
        setTournaments(prev => prev.map(t => String(t.tournament_id) === String(updatedData.tournament_id) ? { ...t, ...updatedData } : t));
        fetchTournaments();
      } else {
        const errJson = await res.json().catch(() => ({}));
        setToast({ type: 'error', text: errJson.error || 'Failed to update tournament details.' });
      }
    } catch (err) {
      console.error('Error updating tournament:', err);
      setToast({ type: 'error', text: 'Network Error' });
    }
  };

  const handleDeleteTournament = async (tournamentId, tournamentName) => {
    if (window.confirm(`Are you sure you want to cancel & delete tournament "${tournamentName}"?`)) {
      try {
        const res = await fetch(`/api/tournaments/${tournamentId}`, { method: 'DELETE' });
        if (res.ok) {
          setToast({ type: 'success', text: `Tournament "${tournamentName}" removed.` });
          fetchTournaments();
        }
      } catch (err) {
        console.error('Failed to delete tournament:', err);
      }
    }
  };

  const openEditModal = (t) => {
    setEditingTournament({
      tournament_id: t.tournament_id,
      name: t.name || '',
      prize_pool: t.prize_pool || '',
      start_date: t.start_date || '',
      end_date: t.end_date || '',
      game_id: t.game_id || (games.length > 0 ? games[0].game_id : ''),
      tier: t.tier || 'Tier 1 Premier Major'
    });
  };

  const genres = ['All', ...new Set(tournaments.map(t => t.genre).filter(Boolean))];

  // Filtering & Sorting logic according to registration/start dates
  const filteredAndSortedTournaments = tournaments
    .filter(t => {
      const matchesSearch = (t.name || '').toLowerCase().includes(search.toLowerCase()) || 
                            (t.game_title || '').toLowerCase().includes(search.toLowerCase());
      const matchesGenre = selectedGenre === 'All' || t.genre === selectedGenre;
      return matchesSearch && matchesGenre;
    })
    .sort((a, b) => {
      if (sortBy === 'newest') {
        return (b.tournament_id || 0) - (a.tournament_id || 0);
      } else if (sortBy === 'chronological_asc') {
        return new Date(a.start_date) - new Date(b.start_date);
      } else if (sortBy === 'chronological_desc') {
        return new Date(b.start_date) - new Date(a.start_date);
      } else if (sortBy === 'prize_desc') {
        return parseFloat(b.prize_pool || 0) - parseFloat(a.prize_pool || 0);
      }
      return 0;
    });

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  return (
    <div className="space-y-6 font-sans">
      {toast && (
        <div className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-xl ${
          toast.type === 'success' ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-500/40 glow-emerald' : 'bg-rose-950/80 text-rose-300 border border-rose-500/40 glow-rose'
        }`}>
          <span className="flex items-center gap-2">
            {toast.type === 'success' ? <CheckCircle className="w-5 h-5" /> : <AlertTriangle className="w-5 h-5" />}
            {toast.text}
          </span>
          <button onClick={() => setToast(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-cyan-500/20">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm uppercase tracking-wider mb-1">
              <Trophy className="w-4 h-4" /> Live & Upcoming Championship Calendar
            </div>
            <h1 className="text-3xl font-extrabold text-white font-display">Tournament Hub</h1>
            <p className="text-slate-400 text-sm mt-1">
              Explore and manage official eSports circuits sorted chronologically by registration & schedule date.
            </p>
          </div>
          <div className="flex gap-3 self-start md:self-auto">
            <button 
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white border border-cyan-500/30 rounded-xl text-sm font-bold transition duration-200 shadow-lg shadow-cyan-600/30"
            >
              <Plus className="w-4 h-4" /> Create Tournament
            </button>
            <button 
              onClick={fetchTournaments}
              className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-cyan-400 border border-cyan-500/30 rounded-xl text-sm font-medium transition duration-200"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} /> Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Filter, Search & Chronological Sorting Toolbar */}
      <div className="glass-card p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center">
        <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-3 text-slate-400" />
            <input 
              type="text"
              placeholder="Search tournament or game..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/80 border border-slate-700/60 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition"
            />
          </div>

          {/* Chronological Sorting Selector */}
          <div className="flex items-center gap-2 w-full sm:w-auto bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5">
            <ArrowUpDown className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-xs font-semibold text-slate-400 uppercase">Sort:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-transparent text-xs font-bold text-white focus:outline-none cursor-pointer"
            >
              <option value="newest">Newest First (ID)</option>
              <option value="chronological_asc">Date: Sept &rarr; Oct &rarr; 2027 (Earliest First)</option>
              <option value="chronological_desc">Date: Latest First</option>
              <option value="prize_desc">Prize Pool: High to Low</option>
            </select>
          </div>
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto pb-1 md:pb-0">
          <span className="text-xs text-slate-400 uppercase font-semibold mr-1 flex items-center gap-1">
            <Tag className="w-3 h-3" /> Genre:
          </span>
          {genres.map(genre => (
            <button
              key={genre}
              onClick={() => setSelectedGenre(genre)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition ${
                selectedGenre === genre 
                  ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/20' 
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              {genre}
            </button>
          ))}
        </div>
      </div>

      {/* Tournaments Grid */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="glass-card h-64 rounded-2xl animate-pulse p-6"></div>
          ))}
        </div>
      ) : filteredAndSortedTournaments.length === 0 ? (
        <div className="glass-card p-12 text-center rounded-2xl border border-slate-800">
          <Trophy className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-slate-300">No tournaments found</h3>
          <p className="text-slate-500 text-sm mt-1">Try clearing your search query or selecting a different genre.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredAndSortedTournaments.map((t) => (
            <div 
              key={t.tournament_id} 
              className="glass-card glass-card-hover rounded-2xl p-6 flex flex-col justify-between relative overflow-hidden border border-slate-800/80 group"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/5 rounded-bl-full pointer-events-none group-hover:bg-cyan-500/10 transition"></div>
              
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className="px-2.5 py-1 rounded-md text-[11px] font-bold tracking-wide uppercase bg-slate-900 text-cyan-400 border border-cyan-500/30">
                    {t.genre || 'Esports'}
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    {t.tier || 'Tier 1 Premier Major'}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white group-hover:text-cyan-300 transition duration-200 leading-snug">
                  {t.name}
                </h3>

                <div className="flex items-center justify-between text-sm font-semibold text-slate-300 mt-2">
                  <div className="flex items-center gap-2">
                    <Gamepad2 className="w-4 h-4 text-cyan-400" />
                    <span>{t.game_title}</span>
                    {t.release_year && <span className="text-xs text-slate-500">({t.release_year})</span>}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-slate-400 bg-slate-900/60 px-2 py-1 rounded-md">
                    <Building2 className="w-3 h-3 text-purple-400" /> {t.publisher_name || 'Esports Pub'}
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400 font-medium flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Prize Pool
                  </span>
                  <span className="text-lg font-extrabold text-emerald-400 font-display">
                    {formatCurrency(t.prize_pool)}
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-900/90 px-3 py-2 rounded-lg border border-slate-800">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" /> Dates
                  </span>
                  <span className="font-semibold text-slate-200">
                    {formatDate(t.start_date)} - {formatDate(t.end_date)}
                  </span>
                </div>

                {/* Edit & Delete Action Toolbar */}
                <div className="flex items-center justify-between gap-2 pt-2">
                  <button
                    onClick={() => openEditModal(t)}
                    className="flex-1 py-2 bg-slate-800/90 hover:bg-slate-700 text-cyan-300 border border-cyan-500/30 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition"
                  >
                    <Edit3 className="w-3.5 h-3.5 text-cyan-400" /> Edit Details
                  </button>

                  <button
                    onClick={() => handleDeleteTournament(t.tournament_id, t.name)}
                    className="p-2 bg-rose-950/80 hover:bg-rose-900 text-rose-300 border border-rose-500/30 rounded-xl text-xs font-bold transition"
                    title="Cancel & Remove Tournament"
                  >
                    <Trash2 className="w-3.5 h-3.5 text-rose-400" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CREATE TOURNAMENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 border border-cyan-500/30 shadow-2xl relative glow-cyan">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Trophy className="w-5 h-5 text-cyan-400" /> Create New Tournament</h3>
              <button onClick={() => setShowCreateModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleCreateSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tournament Name</label>
                <input required type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Prize Pool ($)</label>
                <input required type="number" step="0.01" value={form.prize_pool} onChange={e => setForm({...form, prize_pool: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" />
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Start Date</label>
                  <input required type="date" value={form.start_date} onChange={e => setForm({...form, start_date: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">End Date</label>
                  <input required type="date" value={form.end_date} onChange={e => setForm({...form, end_date: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" />
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tournament Tier</label>
                <select value={form.tier} onChange={e => setForm({...form, tier: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none">
                  <option>Tier 1 Premier Major</option>
                  <option>Tier 2 Challenger Circuit</option>
                  <option>Collegiate Regional Cup</option>
                  <option>Invitational Showcase</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Game</label>
                <select required value={form.game_id} onChange={e => setForm({...form, game_id: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none">
                  {games.map(g => <option key={g.game_id} value={g.game_id}>{g.title}</option>)}
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowCreateModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold text-sm rounded-lg hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-sm rounded-lg shadow-lg shadow-cyan-600/30">Submit</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* EDIT TOURNAMENT MODAL */}
      {editingTournament && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 border-2 border-cyan-500/40 shadow-2xl relative glow-cyan">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                <Edit3 className="w-5 h-5 text-cyan-400" /> Edit Tournament Details
              </h3>
              <button onClick={() => setEditingTournament(null)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tournament Name</label>
                <input 
                  required 
                  type="text" 
                  value={editingTournament.name} 
                  onChange={e => setEditingTournament({...editingTournament, name: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" 
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Prize Pool ($)</label>
                <input 
                  required 
                  type="number" 
                  step="0.01" 
                  value={editingTournament.prize_pool} 
                  onChange={e => setEditingTournament({...editingTournament, prize_pool: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" 
                />
              </div>

              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Start Date</label>
                  <input 
                    required 
                    type="date" 
                    value={editingTournament.start_date ? editingTournament.start_date.split('T')[0] : ''} 
                    onChange={e => setEditingTournament({...editingTournament, start_date: e.target.value})} 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" 
                  />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">End Date</label>
                  <input 
                    required 
                    type="date" 
                    value={editingTournament.end_date ? editingTournament.end_date.split('T')[0] : ''} 
                    onChange={e => setEditingTournament({...editingTournament, end_date: e.target.value})} 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none" 
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tournament Tier</label>
                <select 
                  value={editingTournament.tier} 
                  onChange={e => setEditingTournament({...editingTournament, tier: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  <option>Tier 1 Premier Major</option>
                  <option>Tier 2 Challenger Circuit</option>
                  <option>Collegiate Regional Cup</option>
                  <option>Invitational Showcase</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Game</label>
                <select 
                  required 
                  value={editingTournament.game_id} 
                  onChange={e => setEditingTournament({...editingTournament, game_id: e.target.value})} 
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-cyan-500 focus:outline-none"
                >
                  {games.map(g => <option key={g.game_id} value={g.game_id}>{g.title}</option>)}
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button 
                  type="button" 
                  onClick={() => setEditingTournament(null)} 
                  className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold text-xs rounded-lg hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button 
                  type="submit" 
                  className="px-5 py-2 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs rounded-lg shadow-lg shadow-cyan-600/30 flex items-center gap-1.5"
                >
                  <Save className="w-4 h-4" /> Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
