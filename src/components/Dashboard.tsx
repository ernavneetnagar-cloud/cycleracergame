import React from 'react';
import { GameState, LevelConfig } from '../types';
import { sfx } from '../utils/audio';
import { INITIAL_SHOP_ITEMS } from '../utils/gameData';
import { 
  Play, 
  ShoppingBag, 
  Trophy, 
  Volume2, 
  VolumeX, 
  Bike, 
  Shirt, 
  Flame, 
  Info, 
  Sparkles,
  Gamepad2,
  Coins
} from 'lucide-react';

interface DashboardProps {
  unlockedLevels: number;
  points: number;
  activeOutfitId: string;
  activeVehicleId: string;
  hasBowAndArrow: boolean;
  scoreHistoryCount: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onNavigate: (state: GameState) => void;
  onQuickPlay: () => void;
}

export default function Dashboard({
  unlockedLevels,
  points,
  activeOutfitId,
  activeVehicleId,
  hasBowAndArrow,
  scoreHistoryCount,
  isMuted,
  onToggleMute,
  onNavigate,
  onQuickPlay,
}: DashboardProps) {

  // Fetch the human name of the equipped items
  const equippedVehicle = INITIAL_SHOP_ITEMS.find(i => i.id === activeVehicleId)?.name || 'Classic Bicycle';
  const equippedOutfit = INITIAL_SHOP_ITEMS.find(i => i.id === activeOutfitId)?.name || 'Casual Streetwear';

  const handleStartGame = () => {
    sfx.playUpgrade();
    onQuickPlay();
  };

  return (
    <div id="game-dashboard" className="flex flex-col h-full bg-zinc-950 text-white p-6 relative overflow-y-auto custom-scrollbar" style={{ backgroundColor: '#09090b' }}>
      
      {/* Decorative background grid pattern from Artistic Flair */}
      <div className="absolute inset-0 opacity-15 pointer-events-none overflow-hidden" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      {/* Main Core Container */}
      <div className="relative z-10 flex-1 flex flex-col justify-between max-w-xl mx-auto w-full py-2">
        
        {/* Top bar header style from Artistic Flair */}
        <div className="flex items-center justify-between pb-6 border-b border-zinc-805">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center rotate-3 shadow-lg shadow-orange-900/20">
              <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-white">
                <circle cx="18.5" cy="17.5" r="3.5"/>
                <circle cx="5.5" cy="17.5" r="3.5"/>
                <circle cx="15" cy="5" r="1"/>
                <path d="M12 17.5V14l-3-3 4-3 2 3h2"/>
              </svg>
            </div>
            <div>
              <h1 className="text-2xl font-black italic tracking-tighter uppercase leading-none text-white">
                VELO STRIKE
              </h1>
              <p className="text-[10px] text-zinc-500 font-bold tracking-[0.2em] uppercase">
                High-Speed Road Combat
              </p>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="flex flex-col items-end">
              <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest">Lvl Max</span>
              <span className="text-lg font-black tabular-nums italic text-orange-500">
                {String(unlockedLevels).padStart(2, '0')} <span className="text-zinc-600 text-xs">/ 20</span>
              </span>
            </div>
          </div>
        </div>

        {/* Level & Star progression banner */}
        <div className="mt-5 bg-zinc-900/90 border border-zinc-800 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-orange-500/10 border border-orange-500/20 flex items-center justify-center text-orange-500">
              <Trophy size={18} />
            </div>
            <div className="text-left w-2/3">
              <span className="text-[9px] text-zinc-400 font-extrabold uppercase tracking-widest">Active Progression</span>
              <h3 className="text-xs font-black text-white truncate">Sectors Conquered: {scoreHistoryCount}/20</h3>
            </div>
          </div>

          <button
            id="btn-level-select-dash"
            onClick={() => {
              sfx.playCoin();
              onNavigate(GameState.LEVEL_SELECT);
            }}
            className="px-4 py-1.5 rounded-full bg-white text-black font-black uppercase text-[10px] tracking-wider transition hover:bg-orange-500 hover:text-white"
          >
            Sectors Grid
          </button>
        </div>

        {/* Stored Points Banner using Lime layout item */}
        <div className="mt-3 bg-zinc-900/50 border border-zinc-800/60 rounded-2xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-lime-500/10 flex items-center justify-center text-lime-400">
              <Coins size={16} />
            </div>
            <span className="text-xs font-black text-zinc-300">STORED CASHBACK BALANCE</span>
          </div>
          <span className="text-xl font-black tabular-nums italic text-lime-500">
            {points.toLocaleString()} <span className="text-zinc-500 text-xs font-normal">PTS</span>
          </span>
        </div>

        {/* Interactive garage / equipment spotlight screen in space-gray zinc theme */}
        <div className="my-5 bg-zinc-900 border border-zinc-800 rounded-3xl p-5 text-center shadow-inner relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-orange-600/5 blur-3xl rounded-full pointer-events-none" />

          <span className="text-[9px] text-zinc-500 font-black uppercase tracking-widest block mb-2">Equipped Combat Gear</span>
          
          <div className="flex justify-center items-center gap-4 mt-3">
            {/* Vehicle Card Icon */}
            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800/80 relative flex flex-col items-center w-24">
              <Bike className="w-8 h-8 text-orange-500 animate-pulse" />
              <div className="text-[9px] text-zinc-400 font-bold mt-1 max-w-[80px] truncate uppercase">{equippedVehicle}</div>
            </div>

            {/* Rider Avatar frame */}
            <div className="w-16 h-16 rounded-full bg-zinc-950 border-2 border-orange-500 flex items-center justify-center shadow-lg relative">
              <Shirt className="w-8 h-8 text-white fill-orange-500/10" />
              
              {hasBowAndArrow && (
                <div className="absolute -bottom-1 -right-1 bg-lime-500 text-black p-1 rounded-full border border-zinc-950">
                  <Flame size={10} className="fill-black text-black" />
                </div>
              )}
            </div>

            {/* Outfit Box */}
            <div className="p-3 bg-zinc-950 rounded-2xl border border-zinc-800/80 relative flex flex-col items-center w-24">
              <Shirt className="w-8 h-8 text-lime-400" />
              <div className="text-[9px] text-zinc-400 font-bold mt-1 max-w-[80px] truncate uppercase">{equippedOutfit}</div>
            </div>
          </div>

          <div className="mt-4 text-xs text-slate-400 flex flex-wrap gap-2 justify-center">
            {hasBowAndArrow && (
              <span className="bg-lime-500/10 text-lime-500 px-2.5 py-0.5 rounded-full border border-lime-500/20 font-black tracking-wider text-[9px] uppercase">
                🏹 Ranged Arrow Launcher Active
              </span>
            )}
            <span className="bg-zinc-950 text-zinc-400 px-2.5 py-0.5 rounded-full font-bold text-[9px] uppercase border border-zinc-800">
              {activeVehicleId === 'car_supercar' ? '🛡️ Supercar Armor Grid On' : '🚲 Carbon fiber base'}
            </span>
          </div>
        </div>

        {/* Primary Play Button Panel from Artistic Flair */}
        <div className="flex flex-col gap-3">
          <button
            id="btn-play-run-primary"
            onClick={handleStartGame}
            className="w-full py-4 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-black text-sm uppercase tracking-wider transition-all shadow-lg active:scale-95 flex items-center justify-center gap-2"
          >
            <Play size={18} className="fill-white" />
            <span>Start Sector {unlockedLevels}</span>
          </button>

          {/* Secondary buttons - Shop, options */}
          <div className="grid grid-cols-2 gap-3">
            <button
              id="btn-open-shop-dash"
              onClick={() => {
                sfx.playCoin();
                onNavigate(GameState.SHOP);
              }}
              className="py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95"
            >
              <ShoppingBag size={14} className="text-orange-500" />
              <span>Upgrade Shop</span>
            </button>

            <button
              id="btn-mute-toggle"
              onClick={onToggleMute}
              className="py-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition active:scale-95"
            >
              {isMuted ? (
                <>
                  <VolumeX size={14} className="text-zinc-500" />
                  <span>Unmute Synth</span>
                </>
              ) : (
                <>
                  <Volume2 size={14} className="text-lime-500" />
                  <span>Synth is On</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Simple visual controls tutorial overlay block */}
        <div className="mt-4 p-4 rounded-2xl bg-zinc-900/40 border border-zinc-800 text-left">
          <div className="flex items-center gap-2 text-orange-500 mb-1.5">
            <Gamepad2 size={14} />
            <h4 className="text-[10px] font-black uppercase tracking-wider">How to play</h4>
          </div>
          <p className="text-[11px] text-zinc-400 leading-relaxed font-semibold">
            Avoid oncoming traffic. Press <span className="text-white font-bold bg-zinc-800 px-1 py-0.5 rounded text-[10px]">A / D</span> or <span className="text-white font-bold bg-zinc-800 px-1 py-0.5 rounded text-[10px]">Left / Right</span> keys to change lanes. Spawn bow & arrows using <span className="text-orange-500 font-bold bg-zinc-800 px-1.5 py-0.5 rounded text-[10px]">SPACE / Tap HUD</span> to destroy obstacle cars!
          </p>
        </div>

        {/* Free to Play label badge */}
        <div className="mt-4 text-center text-[9px] text-zinc-600 font-black tracking-[0.2em] uppercase py-1 bg-zinc-900/20 rounded">
          ⭐️ FREE UNLIMITED RACING &bull; PRO SERIES
        </div>

      </div>
    </div>
  );
}
