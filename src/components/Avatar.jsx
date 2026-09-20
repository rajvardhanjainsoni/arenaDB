import React from 'react';

export const AVATAR_PRESETS = [
  {
    id: 'cyber-ninja',
    name: 'Cyber Ninja',
    badge: 'Teal Visor',
    bgGradient: 'from-cyan-500 to-teal-700',
    borderColor: 'border-cyan-400',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="#0b1329" />
        {/* Head Outline */}
        <path d="M30 45 C30 25, 70 25, 70 45 L70 70 C70 82, 30 82, 30 70 Z" fill="#1e293b" />
        {/* Sleek Cyber Visor */}
        <rect x="25" y="42" width="50" height="14" rx="7" fill="#06b6d4" />
        <rect x="30" y="46" width="20" height="4" rx="2" fill="#a5f3fc" opacity="0.8" />
        {/* Ninja Mouth Guard */}
        <path d="M32 60 L68 60 L62 76 L38 76 Z" fill="#0f172a" />
        <path d="M42 66 L58 66" stroke="#06b6d4" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'pro-headset',
    name: 'Pro Streamer',
    badge: 'Neon Headset',
    bgGradient: 'from-fuchsia-600 to-purple-800',
    borderColor: 'border-fuchsia-400',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="#180b29" />
        {/* Hair / Cap */}
        <path d="M28 42 C28 20, 72 20, 72 42 C72 48, 28 48, 28 42 Z" fill="#d946ef" />
        {/* Face */}
        <path d="M34 44 L66 44 L66 68 C66 78, 34 78, 34 68 Z" fill="#f8fafc" opacity="0.9" />
        {/* Eyes / Sunglasses */}
        <path d="M38 52 L62 52 L60 59 L40 59 Z" fill="#0f172a" />
        {/* Pro Gaming Headset */}
        <path d="M22 45 C22 18, 78 18, 78 45" fill="none" stroke="#e879f9" strokeWidth="6" strokeLinecap="round" />
        <rect x="18" y="42" width="12" height="22" rx="4" fill="#a855f7" />
        <rect x="70" y="42" width="12" height="22" rx="4" fill="#a855f7" />
        {/* Mic Boom */}
        <path d="M24 60 L36 68" stroke="#e879f9" strokeWidth="3" strokeLinecap="round" />
        <circle cx="37" cy="69" r="3" fill="#f0abfc" />
      </svg>
    )
  },
  {
    id: 'pulse-ace',
    name: 'Pulse Ace',
    badge: 'Cyan Gamer',
    bgGradient: 'from-blue-600 to-cyan-700',
    borderColor: 'border-cyan-400',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="#081e36" />
        {/* Hoodie */}
        <path d="M20 90 C20 62, 80 62, 80 90 Z" fill="#0284c7" />
        {/* Face */}
        <path d="M33 40 C33 28, 67 28, 67 40 L67 66 C67 76, 33 76, 33 66 Z" fill="#fed7aa" />
        {/* Cool Hair */}
        <path d="M30 38 C30 22, 70 22, 70 38 L65 30 L50 25 L35 30 Z" fill="#1e293b" />
        {/* Sleek Glasses */}
        <rect x="36" y="46" width="11" height="8" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
        <rect x="53" y="46" width="11" height="8" rx="2" fill="#0f172a" stroke="#38bdf8" strokeWidth="2" />
        <line x1="47" y1="50" x2="53" y2="50" stroke="#38bdf8" strokeWidth="2" />
        {/* Smile */}
        <path d="M44 65 Q50 70 56 65" fill="none" stroke="#9a3412" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'stealth-hoodie',
    name: 'Stealth Assassin',
    badge: 'Dark Hood',
    bgGradient: 'from-slate-700 to-slate-900',
    borderColor: 'border-slate-400',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="#020617" />
        {/* Deep Hood */}
        <path d="M22 80 C18 35, 82 35, 78 80 C78 92, 22 92, 22 80 Z" fill="#1e293b" stroke="#475569" strokeWidth="2" />
        {/* Shadowed Face Inner */}
        <path d="M32 46 C32 32, 68 32, 68 46 L68 70 C68 78, 32 78, 32 70 Z" fill="#090d16" />
        {/* Glowing Crimson Eyes */}
        <ellipse cx="41" cy="50" rx="5" ry="3" fill="#ef4444" />
        <ellipse cx="59" cy="50" rx="5" ry="3" fill="#ef4444" />
        <circle cx="41" cy="50" r="1.5" fill="#ffffff" />
        <circle cx="59" cy="50" r="1.5" fill="#ffffff" />
      </svg>
    )
  },
  {
    id: 'vanguard-cap',
    name: 'Vanguard Ace',
    badge: 'Pro Cap & Visor',
    bgGradient: 'from-emerald-600 to-teal-800',
    borderColor: 'border-emerald-400',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="#042018" />
        {/* Face */}
        <path d="M33 42 C33 30, 67 30, 67 42 L67 68 C67 78, 33 78, 33 68 Z" fill="#ffedd5" />
        {/* Backward Esports Cap */}
        <path d="M25 36 C25 22, 75 22, 75 36 Z" fill="#10b981" />
        <rect x="20" y="34" width="60" height="7" rx="3.5" fill="#047857" />
        {/* VR / Tech Glasses */}
        <rect x="34" y="45" width="32" height="10" rx="4" fill="#064e3b" stroke="#34d399" strokeWidth="2" />
        <circle cx="42" cy="50" r="2.5" fill="#6ee7b7" />
        <circle cx="58" cy="50" r="2.5" fill="#6ee7b7" />
        {/* Confident Smile */}
        <path d="M43 64 Q50 69 57 64" fill="none" stroke="#c2410c" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'royal-champ',
    name: 'Royal Champ',
    badge: 'Gold Headband',
    bgGradient: 'from-amber-500 to-yellow-700',
    borderColor: 'border-amber-400',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="#201503" />
        {/* Crown Headband */}
        <path d="M25 36 L32 25 L41 33 L50 22 L59 33 L68 25 L75 36 Z" fill="#fbbf24" stroke="#f59e0b" strokeWidth="2" />
        {/* Face */}
        <path d="M33 42 C33 30, 67 30, 67 42 L67 68 C67 78, 33 78, 33 68 Z" fill="#fef3c7" />
        {/* Champion Headset */}
        <path d="M22 45 C22 24, 78 24, 78 45" fill="none" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" />
        <rect x="19" y="44" width="10" height="20" rx="4" fill="#d97706" />
        <rect x="71" y="44" width="10" height="20" rx="4" fill="#d97706" />
        {/* Glasses */}
        <rect x="36" y="47" width="12" height="8" rx="2" fill="#78350f" stroke="#fbbf24" strokeWidth="1.5" />
        <rect x="52" y="47" width="12" height="8" rx="2" fill="#78350f" stroke="#fbbf24" strokeWidth="1.5" />
      </svg>
    )
  },
  {
    id: 'crimson-shades',
    name: 'Crimson Striker',
    badge: 'Ruby Headset',
    bgGradient: 'from-rose-600 to-red-800',
    borderColor: 'border-rose-400',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="#24050b" />
        {/* Hair */}
        <path d="M26 38 C26 18, 74 18, 74 38 L72 32 L50 20 L28 32 Z" fill="#e11d48" />
        {/* Face */}
        <path d="M33 42 C33 30, 67 30, 67 42 L67 68 C67 78, 33 78, 33 68 Z" fill="#ffe4e6" />
        {/* Red Tech Visor */}
        <path d="M28 46 L72 46 L66 57 L34 57 Z" fill="#9f1239" stroke="#fb7185" strokeWidth="2" />
        <line x1="36" y1="51.5" x2="64" y2="51.5" stroke="#fecdd3" strokeWidth="2" strokeDasharray="4 2" />
        {/* Beard / Jaw Line */}
        <path d="M34 66 Q50 78 66 66" fill="none" stroke="#be123c" strokeWidth="2" strokeLinecap="round" />
      </svg>
    )
  },
  {
    id: 'arcane-master',
    name: 'Arcane Master',
    badge: 'Violet Visor',
    bgGradient: 'from-violet-600 to-indigo-800',
    borderColor: 'border-violet-400',
    svg: (
      <svg viewBox="0 0 100 100" className="w-full h-full">
        <circle cx="50" cy="50" r="48" fill="#130b2b" />
        {/* Mysterious Hood / Crown */}
        <path d="M25 40 C25 20, 75 20, 75 40 L70 30 L50 22 L30 30 Z" fill="#7c3aed" />
        {/* Face */}
        <path d="M33 42 C33 30, 67 30, 67 42 L67 68 C67 78, 33 78, 33 68 Z" fill="#ede9fe" />
        {/* Violet Tech Goggles */}
        <circle cx="42" cy="50" r="8" fill="#4c1d95" stroke="#a78bfa" strokeWidth="2" />
        <circle cx="58" cy="50" r="8" fill="#4c1d95" stroke="#a78bfa" strokeWidth="2" />
        <circle cx="42" cy="50" r="3" fill="#c4b5fd" />
        <circle cx="58" cy="50" r="3" fill="#c4b5fd" />
      </svg>
    )
  }
];

export function AvatarImage({ avatarId, className = "w-12 h-12" }) {
  const matched = AVATAR_PRESETS.find(a => a.id === avatarId) || AVATAR_PRESETS[0];
  
  return (
    <div className={`rounded-2xl overflow-hidden shadow-lg border-2 ${matched.borderColor} bg-slate-950 p-0.5 relative group ${className}`}>
      <div className={`w-full h-full rounded-[14px] bg-gradient-to-br ${matched.bgGradient} p-1 flex items-center justify-center`}>
        {matched.svg}
      </div>
    </div>
  );
}

export function AvatarPickerModal({ currentAvatarId, onSelect, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
      <div className="glass-card rounded-3xl max-w-md w-full p-6 border-2 border-cyan-500/40 shadow-2xl relative glow-cyan overflow-hidden max-h-[85vh] flex flex-col">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
          <div>
            <h3 className="text-lg font-black text-white font-display">Choose Profile Avatar</h3>
            <p className="text-xs text-slate-400">Select a clean pro gaming face avatar</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-2 gap-3 overflow-y-auto pr-1">
          {AVATAR_PRESETS.map((avatar) => {
            const isSelected = currentAvatarId === avatar.id;
            return (
              <button
                key={avatar.id}
                onClick={() => {
                  onSelect(avatar.id);
                  onClose();
                }}
                className={`p-3 rounded-2xl border-2 transition-all flex flex-col items-center gap-2 ${
                  isSelected
                    ? 'border-cyan-400 bg-cyan-950/60 glow-cyan scale-105'
                    : 'border-slate-800 bg-slate-900/60 hover:border-slate-600 hover:scale-102'
                }`}
              >
                <div className="w-16 h-16">
                  <AvatarImage avatarId={avatar.id} className="w-full h-full" />
                </div>
                <div className="text-center">
                  <div className="text-xs font-bold text-white">{avatar.name}</div>
                  <span className="text-[10px] font-semibold text-cyan-400 bg-cyan-950/80 px-2 py-0.5 rounded-full border border-cyan-500/30">
                    {avatar.badge}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
