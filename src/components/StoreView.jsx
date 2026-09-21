import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingCart, Coins, Shield, Crosshair, Sparkles, CheckCircle2, AlertCircle, Zap, RotateCcw } from 'lucide-react';

export default function StoreView() {
  const [items, setItems] = useState([]);
  const [players, setPlayers] = useState([]);
  const [selectedPlayerId, setSelectedPlayerId] = useState('');
  const [playerCredits, setPlayerCredits] = useState(0);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [purchaseStatus, setPurchaseStatus] = useState(null);

  // Animation & Error trigger states
  const [shakeItemId, setShakeItemId] = useState(null);
  const [justPurchasedItemId, setJustPurchasedItemId] = useState(null);
  const [justRefundedItemId, setJustRefundedItemId] = useState(null);
  const [imageErrors, setImageErrors] = useState({});

  useEffect(() => {
    Promise.all([
      fetch('/api/players').then(res => res.json()),
      fetch('/api/store').then(res => res.json())
    ])
      .then(([playersData, storeData]) => {
        setPlayers(playersData);
        setItems(storeData);
        setLoading(false);
      })
      .catch(err => {
        console.error("Error fetching store data:", err);
        setLoading(false);
      });
  }, []);

  const selectedPlayer = players.find(p => p.player_id.toString() === selectedPlayerId.toString());

  useEffect(() => {
    if (selectedPlayer) {
      setPlayerCredits(selectedPlayer.credits ?? 2500);

      fetch(`/api/players/${selectedPlayerId}/inventory`)
        .then(res => res.json())
        .then(data => {
          setInventory(Array.isArray(data) ? data : []);
        })
        .catch(console.error);
    } else {
      setInventory([]);
      setPlayerCredits(0);
    }
  }, [selectedPlayerId, selectedPlayer]);

  const handleImageError = (id) => {
    setImageErrors(prev => ({ ...prev, [id]: true }));
  };

  const handleBuyItem = async (item) => {
    if (!selectedPlayerId || !selectedPlayer) {
      setShakeItemId(item.item_id);
      setTimeout(() => setShakeItemId(null), 500);
      setPurchaseStatus({ type: 'error', message: '⚠️ Please select an active player wallet first.' });
      setTimeout(() => setPurchaseStatus(null), 3500);
      return;
    }

    const isOwned = inventory.some(inv => inv.name === item.name);
    if (isOwned) return;

    if (playerCredits < item.price_credits) {
      // Trigger Red Shake Animation
      setShakeItemId(item.item_id);
      setTimeout(() => setShakeItemId(null), 500);
      setPurchaseStatus({ type: 'error', message: '❌ Insufficient Funds! Win more matches to earn Arena Credits.' });
      setTimeout(() => setPurchaseStatus(null), 4000);
      return;
    }

    try {
      const response = await fetch('/api/store/buy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: parseInt(selectedPlayerId), item_id: item.item_id })
      });

      const data = await response.json();

      if (!response.ok) {
        setShakeItemId(item.item_id);
        setTimeout(() => setShakeItemId(null), 500);
        throw new Error(data.error || '❌ Transaction Failed.');
      }

      const newCredits = data.remaining_credits ?? (playerCredits - item.price_credits);

      // Trigger Green Unlock Pulse Animation
      setJustPurchasedItemId(item.item_id);
      setTimeout(() => setJustPurchasedItemId(null), 1200);

      // Real-time frontend credits state update
      setPlayerCredits(newCredits);
      setPlayers(prevPlayers => prevPlayers.map(p =>
        p.player_id.toString() === selectedPlayerId.toString()
          ? { ...p, credits: newCredits }
          : p
      ));

      setPurchaseStatus({ 
        type: 'success', 
        message: `🎉 Item Unlocked! "${item.name}" added to inventory. Remaining: ${newCredits.toLocaleString()} CR` 
      });

      // Update inventory
      fetch(`/api/players/${selectedPlayerId}/inventory`)
        .then(res => res.json())
        .then(invData => setInventory(Array.isArray(invData) ? invData : []));

      setTimeout(() => setPurchaseStatus(null), 4500);

    } catch (err) {
      setShakeItemId(item.item_id);
      setTimeout(() => setShakeItemId(null), 500);
      setPurchaseStatus({ type: 'error', message: err.message });
      setTimeout(() => setPurchaseStatus(null), 4000);
    }
  };

  const handleRefundItem = async (item) => {
    if (!selectedPlayerId || !selectedPlayer) return;

    try {
      const response = await fetch('/api/store/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ player_id: parseInt(selectedPlayerId), item_id: item.item_id })
      });

      const data = await response.json();

      if (!response.ok) {
        setShakeItemId(item.item_id);
        setTimeout(() => setShakeItemId(null), 500);
        throw new Error(data.error || '❌ Refund Failed.');
      }

      const newCredits = data.remaining_credits ?? (playerCredits + item.price_credits);

      // Trigger Shrink / Revert Animation
      setJustRefundedItemId(item.item_id);
      setTimeout(() => setJustRefundedItemId(null), 1200);

      // Real-time frontend credits state update
      setPlayerCredits(newCredits);
      setPlayers(prevPlayers => prevPlayers.map(p =>
        p.player_id.toString() === selectedPlayerId.toString()
          ? { ...p, credits: newCredits }
          : p
      ));

      setPurchaseStatus({ 
        type: 'success', 
        message: `↩️ Item Refunded! "${item.name}" returned for ${item.price_credits.toLocaleString()} CR. New Balance: ${newCredits.toLocaleString()} CR` 
      });

      // Refresh inventory
      fetch(`/api/players/${selectedPlayerId}/inventory`)
        .then(res => res.json())
        .then(invData => setInventory(Array.isArray(invData) ? invData : []));

      setTimeout(() => setPurchaseStatus(null), 4500);

    } catch (err) {
      setShakeItemId(item.item_id);
      setTimeout(() => setShakeItemId(null), 500);
      setPurchaseStatus({ type: 'error', message: err.message });
      setTimeout(() => setPurchaseStatus(null), 4000);
    }
  };

  const getRarityBadgeStyle = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary': 
        return 'text-amber-300 border-amber-400/40 bg-gradient-to-r from-amber-500/20 to-yellow-600/20 shadow-[0_0_15px_rgba(251,191,36,0.25)]';
      case 'epic': 
        return 'text-purple-300 border-purple-400/40 bg-gradient-to-r from-purple-500/20 to-pink-600/20 shadow-[0_0_15px_rgba(192,132,252,0.25)]';
      default: 
        return 'text-cyan-300 border-cyan-400/40 bg-gradient-to-r from-cyan-500/20 to-blue-600/20 shadow-[0_0_15px_rgba(34,211,238,0.2)]';
    }
  };

  const getRarityFallbackGradient = (rarity) => {
    switch (rarity?.toLowerCase()) {
      case 'legendary':
        return 'from-amber-950 via-yellow-900/60 to-slate-950 border-amber-500/40 text-amber-400';
      case 'epic':
        return 'from-purple-950 via-pink-900/60 to-slate-950 border-purple-500/40 text-purple-400';
      default:
        return 'from-cyan-950 via-blue-900/60 to-slate-950 border-cyan-500/40 text-cyan-400';
    }
  };

  const getIcon = (type) => {
    if (type?.includes('Weapon')) return <Crosshair className="w-4 h-4 text-cyan-400" />;
    if (type?.includes('Melee')) return <Shield className="w-4 h-4 text-amber-400" />;
    return <Sparkles className="w-4 h-4 text-purple-400" />;
  };

  if (loading) {
    return (
      <div className="p-16 text-center text-cyan-400 flex flex-col items-center justify-center space-y-3">
        <div className="w-12 h-12 rounded-full border-4 border-cyan-500 border-t-transparent animate-spin"></div>
        <span className="font-bold text-lg tracking-wide">Loading Armory & Cosmetics Catalog...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans">
      {/* Wallet Header Banner */}
      <div className="glass-card rounded-2xl p-6 relative overflow-hidden border border-slate-800 shadow-2xl">
        <div className="absolute -right-12 -top-12 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-xs uppercase tracking-widest mb-1">
              <Zap className="w-4 h-4 text-amber-400" /> Virtual Armory Marketplace
            </div>
            <h1 className="text-3xl font-black text-white font-display tracking-tight">
              In-Game Store & Cosmetics
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Acquire exclusive weapon skins, melee heirlooms, and champion attire using virtual credits.
            </p>
          </div>

          {/* Wallet Balance & Shopper Selection */}
          <div className="flex flex-col gap-3 min-w-[280px]">
            <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800 shadow-inner">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                {selectedPlayer ? `💳 ${selectedPlayer.username}'s Wallet` : '💳 Active Wallet'}
              </span>
              <div className="flex items-center gap-1.5 text-emerald-400 font-extrabold bg-emerald-400/10 px-3 py-1 rounded-lg text-sm border border-emerald-500/30">
                <Coins className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>{playerCredits.toLocaleString()} CR</span>
              </div>
            </div>

            <select
              className="bg-slate-900 border border-slate-700 text-white font-semibold text-sm rounded-xl focus:ring-emerald-500 focus:border-emerald-500 block w-full p-2.5 outline-none cursor-pointer"
              value={selectedPlayerId}
              onChange={(e) => setSelectedPlayerId(e.target.value)}
            >
              <option value="">Select a Player Wallet...</option>
              {players.map(player => (
                <option key={player.player_id} value={player.player_id}>
                  {player.username} ({player.rank}) — {player.credits ?? 2500} CR
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Framer Motion Toast Notifications */}
      <AnimatePresence>
        {purchaseStatus && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.3 }}
            className={`p-4 rounded-xl border flex items-center gap-3 backdrop-blur-md shadow-2xl ${
              purchaseStatus.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/60 text-emerald-200 glow-emerald'
                : 'bg-rose-950/90 border-rose-500/60 text-rose-200 glow-rose'
            }`}
          >
            {purchaseStatus.type === 'success' ? (
              <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-6 h-6 text-rose-400 shrink-0" />
            )}
            <span className="font-semibold text-sm">{purchaseStatus.message}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Grid: Store Items + Inventory Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Available Items */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl font-bold text-white flex items-center gap-2 font-display">
              <ShoppingCart className="w-5 h-5 text-cyan-400" /> Featured Store Catalog
            </h2>
            <span className="text-xs text-slate-400 font-semibold">{items.length} Items Available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            {items.map((item, idx) => {
              const isOwned = inventory.some(inv => inv.name === item.name);
              const canAfford = playerCredits >= item.price_credits;
              const isJustUnlocked = justPurchasedItemId === item.item_id;
              const isJustRefunded = justRefundedItemId === item.item_id;
              const isShaking = shakeItemId === item.item_id;
              const hasImageError = imageErrors[item.item_id] || !item.image_url;

              // Button Style & State Mapping
              let buttonContent;
              let buttonAction;
              let buttonStyle;

              if (!selectedPlayerId) {
                buttonContent = <span>Select Player</span>;
                buttonAction = null;
                buttonStyle = 'bg-slate-800 text-slate-400 border border-slate-700/80 cursor-not-allowed';
              } else if (isOwned) {
                buttonContent = (
                  <span className="flex items-center justify-center gap-1.5">
                    <RotateCcw className="w-3.5 h-3.5 text-rose-300" /> Undo / Refund
                  </span>
                );
                buttonAction = () => handleRefundItem(item);
                buttonStyle = 'bg-rose-950/80 text-rose-300 border border-rose-500/60 hover:bg-rose-900 hover:text-white shadow-lg shadow-rose-900/30 font-extrabold cursor-pointer active:scale-95';
              } else if (!canAfford) {
                buttonContent = <span>Insufficient Funds</span>;
                buttonAction = () => handleBuyItem(item);
                buttonStyle = 'bg-rose-950/40 text-rose-400 border border-rose-500/40 cursor-pointer hover:bg-rose-900/60 font-bold';
              } else {
                buttonContent = <span>Buy for {item.price_credits.toLocaleString()} CR</span>;
                buttonAction = () => handleBuyItem(item);
                buttonStyle = 'bg-gradient-to-r from-emerald-500 to-teal-400 text-black hover:from-emerald-400 hover:to-teal-300 shadow-lg shadow-emerald-500/25 cursor-pointer font-extrabold active:scale-95';
              }

              return (
                <motion.div
                  key={item.item_id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ 
                    opacity: 1, 
                    y: 0,
                    scale: isJustRefunded ? [1, 0.92, 1] : 1
                  }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`group relative bg-slate-900/50 rounded-2xl border border-slate-800/90 transition-all duration-300 hover:border-slate-700 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden flex flex-col ${
                    isOwned ? 'border-purple-500/30 bg-purple-950/10' : ''
                  }`}
                >
                  {/* High Resolution Item Image / Fallback Gradient */}
                  <div className="relative w-full h-48 bg-slate-950 overflow-hidden">
                    {hasImageError ? (
                      <div className={`w-full h-full bg-gradient-to-br ${getRarityFallbackGradient(item.rarity)} flex flex-col items-center justify-center p-4 text-center border-b`}>
                        <div className="p-3 rounded-full bg-slate-900/80 border border-slate-700/80 shadow-inner mb-2">
                          {getIcon(item.item_type)}
                        </div>
                        <span className="text-xs font-black uppercase tracking-widest">{item.rarity}</span>
                        <span className="text-[11px] text-slate-300 font-bold mt-0.5">{item.name}</span>
                      </div>
                    ) : (
                      <img
                        src={item.image_url}
                        alt={item.name}
                        onError={() => handleImageError(item.item_id)}
                        className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                      />
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-transparent to-transparent opacity-80"></div>
                    
                    {/* Rarity Tag */}
                    <div className={`absolute top-3 right-3 px-3 py-1 text-[11px] font-black uppercase rounded-lg border backdrop-blur-md ${getRarityBadgeStyle(item.rarity)}`}>
                      {item.rarity}
                    </div>

                    <div className="absolute bottom-3 left-3 flex items-center gap-1.5 text-xs font-bold text-slate-200 bg-slate-950/80 px-2.5 py-1 rounded-md border border-slate-800">
                      {getIcon(item.item_type)}
                      <span>{item.game_title}</span>
                    </div>
                  </div>

                  {/* Item Description & Interactive Action */}
                  <div className="p-4 flex flex-col flex-1 justify-between bg-gradient-to-b from-slate-900/60 to-slate-950/90">
                    <div>
                      <h3 className="text-lg font-black text-white group-hover:text-cyan-300 transition-colors font-display">
                        {item.name}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">{item.item_type}</p>
                    </div>

                    <div className="flex items-center justify-between pt-4 border-t border-slate-800/80 mt-4">
                      <div className="flex items-center gap-1.5 font-black text-emerald-400 text-base font-display">
                        <Coins className="w-4 h-4 text-emerald-400" />
                        <span>{item.price_credits.toLocaleString()} CR</span>
                      </div>

                      {/* Animated Framer Motion Purchase / Refund Button */}
                      <motion.button
                        onClick={buttonAction}
                        disabled={!selectedPlayerId}
                        animate={
                          isShaking
                            ? { x: [0, -12, 12, -12, 12, 0] }
                            : isJustUnlocked
                            ? { scale: [1, 1.15, 1] }
                            : isJustRefunded
                            ? { scale: [1, 0.85, 1] }
                            : {}
                        }
                        transition={{ duration: 0.4 }}
                        className={`px-4 py-2 text-xs rounded-xl transition-all ${buttonStyle}`}
                      >
                        {buttonContent}
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>

        {/* Player Inventory Sidebar */}
        <div className="bg-slate-900/70 p-5 rounded-2xl border border-slate-800/90 backdrop-blur-md self-start sticky top-28 shadow-2xl">
          <h2 className="text-xl font-extrabold text-white mb-4 flex items-center gap-2 font-display">
            <Shield className="w-5 h-5 text-purple-400" />
            {selectedPlayer ? `${selectedPlayer.username}'s Inventory` : 'Player Inventory'}
          </h2>

          {!selectedPlayerId ? (
            <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl p-4">
              Select a player wallet above to view unlocked items and skins.
            </div>
          ) : inventory.length === 0 ? (
            <div className="text-center py-12 text-slate-500 text-sm border border-dashed border-slate-800 rounded-xl p-4">
              No items purchased yet. Purchase skins from the catalog to populate your inventory.
            </div>
          ) : (
            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1">
              <AnimatePresence>
                {inventory.map(inv => {
                  const hasInvImgError = imageErrors[`inv_${inv.inventory_id}`] || !inv.image_url;
                  return (
                    <motion.div
                      key={inv.inventory_id}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, scale: 0.85 }}
                      className="bg-slate-950 p-3 rounded-xl border border-slate-800 flex items-center justify-between gap-3 group hover:border-purple-500/40 transition"
                    >
                      <div className="flex items-center gap-3 overflow-hidden">
                        {!hasInvImgError ? (
                          <img 
                            src={inv.image_url} 
                            alt={inv.name} 
                            onError={() => handleImageError(`inv_${inv.inventory_id}`)}
                            className="w-12 h-12 rounded-lg object-cover border border-slate-800 shrink-0 group-hover:scale-105 transition" 
                          />
                        ) : (
                          <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${getRarityFallbackGradient(inv.rarity)} border flex items-center justify-center shrink-0`}>
                            {getIcon(inv.item_type)}
                          </div>
                        )}
                        <div className="overflow-hidden">
                          <h4 className="text-sm font-bold text-white truncate group-hover:text-purple-300 transition">{inv.name}</h4>
                          <span className="text-[11px] text-slate-400 block truncate">{inv.game_title} • {inv.item_type}</span>
                        </div>
                      </div>

                      {/* Quick Refund Action from Inventory */}
                      <button
                        onClick={() => {
                          const storeItem = items.find(i => i.name === inv.name);
                          if (storeItem) handleRefundItem(storeItem);
                        }}
                        title="Refund Item"
                        className="p-1.5 rounded-lg bg-rose-950/50 hover:bg-rose-900/80 text-rose-400 hover:text-rose-200 border border-rose-500/30 transition shrink-0"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
