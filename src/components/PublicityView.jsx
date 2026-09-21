import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Megaphone, Building, DollarSign, Eye, Share2, Mail, Award, TrendingUp, Layers, Plus, X, CheckCircle, AlertTriangle, ExternalLink, Shield, Zap, Sparkles } from 'lucide-react';

export default function PublicityView() {
  const [campaigns, setCampaigns] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals state
  const [showLaunchModal, setShowLaunchModal] = useState(false);
  const [selectedSponsor, setSelectedSponsor] = useState(null);
  const [form, setForm] = useState({ org_name: '', tournament_id: '', budget: '', platform: 'Twitch', reach_metrics: '' });
  const [toast, setToast] = useState(null);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [cRes, tRes] = await Promise.all([fetch('/api/campaigns'), fetch('/api/tournaments')]);
      const cData = await cRes.json();
      const tData = await tRes.json();
      setCampaigns(cData);
      setTournaments(tData);
      if (tData.length > 0) setForm(prev => ({ ...prev, tournament_id: tData[0].tournament_id }));
    } catch (err) { 
      console.error('Failed to fetch publicity data:', err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/campaigns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form)
      });
      if (res.ok) {
        setToast({ type: 'success', text: 'Campaign Launched Successfully!' });
        setShowLaunchModal(false);
        fetchData();
      } else { 
        setToast({ type: 'error', text: 'Failed to launch campaign.' }); 
      }
    } catch (err) { 
      setToast({ type: 'error', text: 'Network Error connecting to API.' }); 
    }
  };

  const totalBudget = campaigns.reduce((acc, c) => acc + Number(c.budget || 0), 0);
  const totalReach = campaigns.reduce((acc, c) => acc + Number(c.reach_metrics || 0), 0);
  const studentClubsCount = campaigns.filter(c => c.org_type === 'Campus Orgs' || c.org_type === 'Student Club').length;
  const brandsCount = campaigns.filter(c => c.org_type !== 'Campus Orgs' && c.org_type !== 'Student Club').length;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(num);
  };

  const getPlatformBadgeColor = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'twitch': return 'bg-purple-900/80 text-purple-300 border-purple-500/40 shadow-[0_0_10px_rgba(168,85,247,0.2)]';
      case 'youtube': return 'bg-rose-900/80 text-rose-300 border-rose-500/40 shadow-[0_0_10px_rgba(244,63,94,0.2)]';
      case 'instagram': return 'bg-pink-900/80 text-pink-300 border-pink-500/40 shadow-[0_0_10px_rgba(236,72,153,0.2)]';
      case 'x/twitter': return 'bg-sky-900/80 text-sky-300 border-sky-500/40 shadow-[0_0_10px_rgba(56,189,248,0.2)]';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  // Group campaigns by sponsor org name for detail popups
  const sponsorGroups = campaigns.reduce((acc, c) => {
    if (!acc[c.org_name]) {
      acc[c.org_name] = {
        org_name: c.org_name,
        org_type: c.org_type,
        contact_email: c.contact_email,
        total_investment: 0,
        total_reach: 0,
        campaigns: []
      };
    }
    acc[c.org_name].total_investment += Number(c.budget || 0);
    acc[c.org_name].total_reach += Number(c.reach_metrics || 0);
    acc[c.org_name].campaigns.push(c);
    return acc;
  }, {});

  const sponsorList = Object.values(sponsorGroups);

  return (
    <div className="space-y-6 font-sans">
      {/* Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className={`p-4 rounded-xl text-sm font-semibold flex items-center justify-between shadow-2xl backdrop-blur-md ${
              toast.type === 'success' ? 'bg-emerald-950/90 text-emerald-300 border border-emerald-500/50 glow-emerald' : 'bg-rose-950/90 text-rose-300 border border-rose-500/50 glow-rose'
            }`}
          >
            <span className="flex items-center gap-2">
              {toast.type === 'success' ? <CheckCircle className="w-5 h-5 text-emerald-400" /> : <AlertTriangle className="w-5 h-5 text-rose-400" />}
              {toast.text}
            </span>
            <button onClick={() => setToast(null)}><X className="w-4 h-4 text-slate-400 hover:text-white" /></button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Header Banner */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-emerald-500/30 shadow-2xl">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-xs uppercase tracking-widest mb-1">
              <Megaphone className="w-4 h-4 text-emerald-400" /> Organization & Publicity Hub
            </div>
            <h1 className="text-3xl font-black text-white font-display tracking-tight">Sponsorship & Campaign Intelligence</h1>
            <p className="text-slate-400 text-sm mt-1">Track esports brand investments, campaign reaches, platform metrics, and student club partnerships.</p>
          </div>
          <button 
            onClick={() => setShowLaunchModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-black border border-emerald-400/50 rounded-xl text-sm font-black transition duration-200 shadow-lg shadow-emerald-500/25 cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Launch Campaign
          </button>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800/90 flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Total Campaign Capital</span>
            <div className="text-2xl font-black text-white font-display mt-0.5">{formatCurrency(totalBudget)}</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800/90 flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Audience Impressions</span>
            <div className="text-2xl font-black text-white font-display mt-0.5">{formatNumber(totalReach)}</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800/90 flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Brand Partners</span>
            <div className="text-2xl font-black text-white font-display mt-0.5">{brandsCount} Tech Brands</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800/90 flex items-center gap-4 shadow-xl">
          <div className="p-3.5 bg-pink-500/10 border border-pink-500/30 rounded-xl text-pink-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Campus Guilds</span>
            <div className="text-2xl font-black text-white font-display mt-0.5">{studentClubsCount} Student Orgs</div>
          </div>
        </div>
      </div>

      {/* Interactive Sponsor Cards Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-extrabold text-white flex items-center gap-2 font-display">
            <Share2 className="w-5 h-5 text-cyan-400" /> Active Sponsor Organizations
          </h2>
          <span className="text-xs text-cyan-400 font-semibold bg-cyan-950/80 px-3 py-1 rounded-full border border-cyan-500/30">
            Click sponsor card for full analytics modal
          </span>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <div key={i} className="glass-card h-52 rounded-2xl animate-pulse border border-slate-800"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {sponsorList.map((sponsor, idx) => (
              <motion.div
                key={sponsor.org_name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: idx * 0.04 }}
                onClick={() => setSelectedSponsor(sponsor)}
                className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800/90 flex flex-col justify-between cursor-pointer group hover:border-emerald-500/40 relative overflow-hidden shadow-xl"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-slate-950 text-emerald-400 border border-emerald-500/30">
                      {sponsor.org_type}
                    </span>
                    <span className="text-xs text-cyan-400 font-mono font-semibold flex items-center gap-1 group-hover:text-white">
                      Details <ExternalLink className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <h3 className="text-xl font-black text-white group-hover:text-emerald-300 transition-colors font-display flex items-center gap-2">
                    <Building className="w-5 h-5 text-emerald-400" /> {sponsor.org_name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                    <span className="truncate">{sponsor.contact_email}</span>
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-3">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Capital</span>
                    <span className="text-base font-black text-emerald-400 font-display">
                      {formatCurrency(sponsor.total_investment)}
                    </span>
                  </div>

                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800">
                    <span className="text-[10px] text-slate-400 font-bold uppercase block">Total Impressions</span>
                    <span className="text-base font-black text-cyan-400 font-display flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-cyan-400" /> {formatNumber(sponsor.total_reach)}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>

      {/* Framer Motion Modal 1: Sponsor Deep-Dive Modal */}
      <AnimatePresence>
        {selectedSponsor && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-card rounded-2xl max-w-xl w-full p-6 border border-emerald-500/40 shadow-2xl relative glow-emerald overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-400">
                    <Building className="w-6 h-6" />
                  </div>
                  <div>
                    <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-500/30">
                      {selectedSponsor.org_type}
                    </span>
                    <h3 className="text-2xl font-black text-white font-display mt-0.5">{selectedSponsor.org_name}</h3>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedSponsor(null)}
                  className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Content Details */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 font-semibold uppercase block">Total Sponsor Investment</span>
                    <span className="text-2xl font-black text-emerald-400 font-display">{formatCurrency(selectedSponsor.total_investment)}</span>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                    <span className="text-xs text-slate-400 font-semibold uppercase block">Total Audience Reach</span>
                    <span className="text-2xl font-black text-cyan-400 font-display flex items-center gap-1.5">
                      <TrendingUp className="w-5 h-5 text-cyan-400" /> {formatNumber(selectedSponsor.total_reach)}
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Mail className="w-4 h-4 text-cyan-400" /> Sponsor Contact Info
                  </h4>
                  <p className="text-sm font-semibold text-slate-200">{selectedSponsor.contact_email}</p>
                </div>

                {/* Active Campaigns Breakdown */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Zap className="w-4 h-4 text-amber-400" /> Active Sponsored Campaigns ({selectedSponsor.campaigns.length})
                  </h4>
                  <div className="space-y-2.5 max-h-56 overflow-y-auto pr-1">
                    {selectedSponsor.campaigns.map((c) => (
                      <div key={c.campaign_id} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                        <div>
                          <div className="text-sm font-bold text-white">{c.tournament_name}</div>
                          <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getPlatformBadgeColor(c.platform)}`}>
                              {c.platform}
                            </span>
                            <span>Reach: <strong className="text-slate-200">{formatNumber(c.reach_metrics)}</strong></span>
                          </div>
                        </div>
                        <span className="text-sm font-extrabold text-emerald-400 font-display">
                          {formatCurrency(c.budget)}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800 flex justify-end">
                <button
                  onClick={() => setSelectedSponsor(null)}
                  className="px-5 py-2 bg-slate-800 hover:bg-slate-700 text-white font-bold text-sm rounded-xl transition"
                >
                  Close Analytics
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Framer Motion Modal 2: Launch Campaign Modal */}
      <AnimatePresence>
        {showLaunchModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: "spring", damping: 25, stiffness: 300 }}
              className="glass-card rounded-2xl max-w-md w-full p-6 border border-emerald-500/30 shadow-2xl relative glow-emerald"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                <h3 className="text-xl font-bold text-white flex items-center gap-2 font-display">
                  <Megaphone className="w-5 h-5 text-emerald-400" /> Launch Brand Campaign
                </h3>
                <button onClick={() => setShowLaunchModal(false)} className="text-slate-400 hover:text-white">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Sponsor Org Name</label>
                  <input
                    required
                    type="text"
                    placeholder="e.g., Red Bull Esports, Logitech G"
                    value={form.org_name}
                    onChange={e => setForm({...form, org_name: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Target Tournament</label>
                  <select
                    required
                    value={form.tournament_id}
                    onChange={e => setForm({...form, tournament_id: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  >
                    {tournaments.map(t => (
                      <option key={t.tournament_id} value={t.tournament_id}>{t.name}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Budget ($)</label>
                    <input
                      required
                      type="number"
                      step="0.01"
                      placeholder="50000"
                      value={form.budget}
                      onChange={e => setForm({...form, budget: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    />
                  </div>

                  <div className="flex-1">
                    <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Platform</label>
                    <select
                      required
                      value={form.platform}
                      onChange={e => setForm({...form, platform: e.target.value})}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                    >
                      <option>Twitch</option>
                      <option>YouTube</option>
                      <option>Instagram</option>
                      <option>X/Twitter</option>
                      <option>Campus Posters</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 uppercase mb-1">Estimated Impressions</label>
                  <input
                    required
                    type="number"
                    placeholder="2500000"
                    value={form.reach_metrics}
                    onChange={e => setForm({...form, reach_metrics: e.target.value})}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none"
                  />
                </div>

                <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setShowLaunchModal(false)}
                    className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold text-sm rounded-xl hover:bg-slate-700"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-black font-extrabold text-sm rounded-xl shadow-lg shadow-emerald-500/25"
                  >
                    Launch Campaign
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
