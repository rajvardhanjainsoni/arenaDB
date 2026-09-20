import React, { useState, useEffect } from 'react';
import { Megaphone, Building, DollarSign, Eye, Share2, Mail, Award, TrendingUp, Layers, Plus, X, CheckCircle, AlertTriangle } from 'lucide-react';

export default function PublicityView() {
  const [campaigns, setCampaigns] = useState([]);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
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
    } catch (err) { console.error('Failed to fetch data:', err); }
    finally { setLoading(false); }
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
        setToast({ type: 'success', text: 'Campaign Launched!' });
        setShowModal(false);
        fetchData();
      } else { setToast({ type: 'error', text: 'Failed to launch campaign.' }); }
    } catch (err) { setToast({ type: 'error', text: 'Network Error' }); }
  };

  const totalBudget = campaigns.reduce((acc, c) => acc + Number(c.budget || 0), 0);
  const totalReach = campaigns.reduce((acc, c) => acc + Number(c.reach_metrics || 0), 0);
  const studentClubsCount = campaigns.filter(c => c.org_type === 'Student Club').length;
  const brandsCount = campaigns.filter(c => c.org_type !== 'Student Club').length;

  const formatCurrency = (val) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const formatNumber = (num) => {
    return new Intl.NumberFormat('en-US', { notation: 'compact', compactDisplay: 'short' }).format(num);
  };

  const getPlatformBadgeColor = (platform) => {
    switch (platform?.toLowerCase()) {
      case 'twitch': return 'bg-purple-900/60 text-purple-300 border-purple-500/30';
      case 'youtube': return 'bg-red-900/60 text-red-300 border-red-500/30';
      case 'instagram': return 'bg-pink-900/60 text-pink-300 border-pink-500/30';
      case 'x/twitter': return 'bg-sky-900/60 text-sky-300 border-sky-500/30';
      default: return 'bg-slate-800 text-slate-300 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
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
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-emerald-500/20">
        <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm uppercase tracking-wider mb-1">
              <Megaphone className="w-4 h-4" /> Novelty Module #1
            </div>
            <h1 className="text-3xl font-extrabold text-white font-display">Organization & Publicity</h1>
            <p className="text-slate-400 text-sm mt-1">Manage tournament brand partnerships, student club budgets, and platform reach metrics.</p>
          </div>
          <button 
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-black border border-emerald-500/30 rounded-xl text-sm font-bold transition duration-200 shadow-lg shadow-emerald-600/30"
          >
            <Plus className="w-4 h-4" /> Launch Campaign
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total Campaign Capital</span>
            <div className="text-2xl font-extrabold text-white font-display mt-0.5">{formatCurrency(totalBudget)}</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Total Audience Impressions</span>
            <div className="text-2xl font-extrabold text-white font-display mt-0.5">{formatNumber(totalReach)}</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3.5 bg-purple-500/10 border border-purple-500/30 rounded-xl text-purple-400">
            <Building className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Brand Sponsors</span>
            <div className="text-2xl font-extrabold text-white font-display mt-0.5">{brandsCount} External Partners</div>
          </div>
        </div>

        <div className="glass-card p-5 rounded-2xl border border-slate-800 flex items-center gap-4">
          <div className="p-3.5 bg-pink-500/10 border border-pink-500/30 rounded-xl text-pink-400">
            <Layers className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium uppercase tracking-wide">Campus Clubs</span>
            <div className="text-2xl font-extrabold text-white font-display mt-0.5">{studentClubsCount} Student Orgs</div>
          </div>
        </div>
      </div>

      {/* Campaigns Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <Share2 className="w-5 h-5 text-cyan-400" /> Active Marketing Campaigns & Sponsors
        </h2>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="glass-card h-56 rounded-2xl animate-pulse"></div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {campaigns.map((c) => (
              <div 
                key={c.campaign_id}
                className="glass-card glass-card-hover rounded-2xl p-6 border border-slate-800 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span className={`px-2.5 py-1 rounded-md text-[11px] font-bold uppercase border ${getPlatformBadgeColor(c.platform)}`}>
                      {c.platform}
                    </span>
                    <span className="px-2.5 py-1 rounded-md text-[11px] font-semibold bg-slate-900 text-slate-300 border border-slate-800">
                      {c.org_type}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building className="w-4 h-4 text-emerald-400" /> {c.org_name}
                  </h3>

                  <p className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
                    <Award className="w-3.5 h-3.5 text-purple-400" />
                    <span>Tournament: <strong className="text-slate-200">{c.tournament_name}</strong></span>
                  </p>

                  <p className="text-xs text-slate-400 mt-1 flex items-center gap-1.5">
                    <Mail className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{c.contact_email}</span>
                  </p>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 grid grid-cols-2 gap-4">
                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium block">Allocated Budget</span>
                    <span className="text-base font-extrabold text-emerald-400 font-display">
                      {formatCurrency(c.budget)}
                    </span>
                  </div>

                  <div className="bg-slate-900/80 p-3 rounded-xl border border-slate-800">
                    <span className="text-[11px] text-slate-400 font-medium block">Estimated Reach</span>
                    <span className="text-base font-extrabold text-cyan-400 font-display flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5" /> {formatNumber(c.reach_metrics)}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="glass-card rounded-2xl max-w-md w-full p-6 border border-emerald-500/30 shadow-2xl relative glow-emerald">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <h3 className="text-xl font-bold text-white flex items-center gap-2"><Megaphone className="w-5 h-5 text-emerald-400" /> Launch Campaign</h3>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Sponsor Org Name</label>
                <input required type="text" value={form.org_name} onChange={e => setForm({...form, org_name: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Tournament</label>
                <select required value={form.tournament_id} onChange={e => setForm({...form, tournament_id: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none">
                  {tournaments.map(t => <option key={t.tournament_id} value={t.tournament_id}>{t.name}</option>)}
                </select>
              </div>
              <div className="flex gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Budget ($)</label>
                  <input required type="number" step="0.01" value={form.budget} onChange={e => setForm({...form, budget: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Target Platform</label>
                  <select required value={form.platform} onChange={e => setForm({...form, platform: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none">
                    <option>Twitch</option><option>YouTube</option><option>Instagram</option><option>X/Twitter</option><option>TikTok</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase mb-1">Expected Reach (Impressions)</label>
                <input required type="number" value={form.reach_metrics} onChange={e => setForm({...form, reach_metrics: e.target.value})} className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-sm text-white focus:border-emerald-500 focus:outline-none" />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                <button type="button" onClick={() => setShowModal(false)} className="px-4 py-2 bg-slate-800 text-slate-300 font-semibold text-sm rounded-lg hover:bg-slate-700">Cancel</button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-black font-bold text-sm rounded-lg shadow-lg shadow-emerald-600/30">Launch</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
