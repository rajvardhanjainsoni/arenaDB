import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, Play, Sparkles, Terminal, Clock, CheckCircle2, AlertCircle, Copy, Check, Filter, Layers, Zap, Table, Code2 } from 'lucide-react';

export default function SqlLabView() {
  const [queries, setQueries] = useState([]);
  const [selectedQuery, setSelectedQuery] = useState(null);
  const [activeCategory, setActiveCategory] = useState('All');
  const [customSql, setCustomSql] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/queries')
      .then(res => res.json())
      .then(data => {
        setQueries(data);
        if (data.length > 0) {
          setSelectedQuery(data[0]);
          setCustomSql(data[0].sql);
          // Automatically run the first query on load
          runQuery({ query_id: data[0].id });
        }
      })
      .catch(err => {
        console.error('Failed to load queries:', err);
        setError('Failed to fetch queries list from backend');
      });
  }, []);

  const runQuery = async (payload) => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch('/api/queries/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const data = await res.json();
      if (res.ok) {
        setResults(data);
      } else {
        setError(data.error || 'Query execution error');
        setResults(null);
      }
    } catch (err) {
      setError('Network communication failed with backend API');
      setResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectQuery = (q) => {
    setSelectedQuery(q);
    setCustomSql(q.sql);
    runQuery({ query_id: q.id });
  };

  const handleRunCustom = (e) => {
    e.preventDefault();
    if (!customSql.trim()) return;
    runQuery({ sql: customSql });
  };

  const handleCopySql = () => {
    navigator.clipboard.writeText(customSql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const categories = ['All', 'INNER JOIN', 'GROUP BY', 'Subquery', 'Window Function', 'CTE', 'Set / Case'];

  const filteredQueries = queries.filter(q => {
    if (activeCategory === 'All') return true;
    return q.category.toLowerCase().includes(activeCategory.toLowerCase());
  });

  return (
    <div className="space-y-6 font-sans">
      {/* Top Banner */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-cyan-500/30 shadow-2xl">
        <div className="absolute -right-10 -top-10 w-72 h-72 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-widest mb-1.5 font-tech">
              <Database className="w-4 h-4 text-cyan-400" /> PostgreSQL 16 Live Coursework Inspector
            </div>
            <h1 className="text-3xl font-black text-white font-display tracking-tight">
              SQL Lab & Relational Engine
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl font-normal">
              Execute all 15 coursework SQL queries directly against the PostgreSQL <code className="text-cyan-300 font-code bg-slate-900 px-1.5 py-0.5 rounded border border-cyan-900">arenadb</code> schema with live execution telemetry, row counters, and execution metrics.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start lg:self-auto">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900/90 border border-slate-700/80 text-xs font-tech">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="text-slate-300 font-semibold">PostgreSQL Driver: Active</span>
            </div>
            <div className="px-3 py-1.5 rounded-xl bg-cyan-950/60 border border-cyan-500/40 text-cyan-300 text-xs font-tech font-bold">
              15 Predefined Queries
            </div>
          </div>
        </div>
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        <span className="text-xs uppercase font-semibold text-slate-400 flex items-center gap-1 font-tech mr-1">
          <Filter className="w-3.5 h-3.5 text-cyan-400" /> Filter:
        </span>
        {categories.map(cat => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeCategory === cat
                ? 'bg-cyan-500 text-black font-bold shadow-lg shadow-cyan-500/20'
                : 'bg-slate-900/80 text-slate-400 hover:text-white border border-slate-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Main Grid: Query Selector List vs Code Runner */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Coursework Query Selector (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider font-tech flex items-center justify-between px-1">
            <span>Coursework Queries ({filteredQueries.length})</span>
            <span className="text-cyan-400">Click to run live</span>
          </div>

          <div className="space-y-2.5 max-h-[640px] overflow-y-auto pr-1">
            {filteredQueries.map((q) => {
              const isSelected = selectedQuery?.id === q.id;
              return (
                <div
                  key={q.id}
                  onClick={() => handleSelectQuery(q)}
                  className={`p-3.5 rounded-xl cursor-pointer border transition-all text-left relative overflow-hidden ${
                    isSelected
                      ? 'bg-cyan-950/30 border-cyan-500/70 shadow-lg shadow-cyan-500/10'
                      : 'bg-slate-900/70 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md bg-slate-800/90 text-cyan-400 border border-slate-700/80 font-code shrink-0">
                      Q{q.id}
                    </span>
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 font-tech">
                      {q.category}
                    </span>
                  </div>

                  <h3 className="text-sm font-bold text-white mt-2 font-display tracking-tight">
                    {q.title}
                  </h3>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2">
                    {q.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Column: SQL Editor & Results Table (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* SQL Editor Card */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-300 font-tech">
                  SQL Statement (PostgreSQL Dialect)
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopySql}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-tech transition"
                  title="Copy SQL to Clipboard"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button
                  onClick={handleRunCustom}
                  disabled={loading}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black font-bold text-xs transition shadow-lg shadow-cyan-500/25 font-tech disabled:opacity-50"
                >
                  <Play className={`w-3.5 h-3.5 fill-black ${loading ? 'animate-spin' : ''}`} />
                  {loading ? 'Running...' : 'Execute Query'}
                </button>
              </div>
            </div>

            <textarea
              value={customSql}
              onChange={(e) => setCustomSql(e.target.value)}
              rows={6}
              className="w-full bg-[#070a12] border border-slate-800 rounded-xl p-3.5 font-code text-xs text-cyan-300 focus:outline-none focus:border-cyan-500/60 selection:bg-cyan-600/40 leading-relaxed resize-y"
              placeholder="SELECT ... FROM ..."
            />

            {selectedQuery && (
              <div className="text-xs text-slate-400 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80 flex items-center justify-between">
                <span><strong className="text-slate-300">Target Concept:</strong> {selectedQuery.category}</span>
                <span className="text-[11px] text-cyan-400 font-mono">read-only SELECT</span>
              </div>
            )}
          </div>

          {/* Results Panel */}
          <div className="glass-card rounded-2xl p-5 border border-slate-800 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Table className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold uppercase tracking-wider text-white font-tech">
                  Query Execution Results
                </span>
              </div>

              {results && (
                <div className="flex items-center gap-3 text-xs font-tech font-semibold">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5" /> {results.rowCount} Row{results.rowCount !== 1 ? 's' : ''} returned
                  </span>
                  <span className="flex items-center gap-1 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" /> {results.duration_ms} ms
                  </span>
                </div>
              )}
            </div>

            {/* Error Message */}
            {error && (
              <div className="p-3.5 rounded-xl bg-rose-950/70 border border-rose-500/40 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Table or Empty State */}
            {loading && (
              <div className="py-12 flex flex-col items-center justify-center space-y-3">
                <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                <p className="text-xs text-slate-400 font-tech">Executing relational query on PostgreSQL 16...</p>
              </div>
            )}

            {!loading && results && results.rows && results.rows.length > 0 && (
              <div className="overflow-x-auto max-h-[380px] rounded-xl border border-slate-800/80">
                <table className="w-full text-left text-xs font-sans">
                  <thead className="bg-[#090d16] border-b border-slate-800 sticky top-0 z-10">
                    <tr>
                      {results.fields.map((field, idx) => (
                        <th key={idx} className="px-3.5 py-2.5 font-bold text-cyan-300 font-code tracking-wide">
                          {field}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-[#070a12]/60 font-code">
                    {results.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-cyan-950/20 transition-colors">
                        {results.fields.map((field, cIdx) => (
                          <td key={cIdx} className="px-3.5 py-2 text-slate-300 whitespace-nowrap">
                            {row[field] !== null && row[field] !== undefined ? String(row[field]) : <span className="text-slate-600 italic">null</span>}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {!loading && results && results.rows && results.rows.length === 0 && (
              <div className="py-10 text-center text-xs text-slate-400 font-tech">
                Query executed successfully. 0 rows returned matching criteria.
              </div>
            )}

            {!loading && !results && !error && (
              <div className="py-10 text-center text-xs text-slate-500 font-tech">
                Select a query from the left or type SQL above to execute against PostgreSQL.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
