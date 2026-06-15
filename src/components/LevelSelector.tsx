import React from 'react';
// Yes, LevelConfig exists in types.ts
import { LevelConfig } from '../types';
import { GAME_LEVELS } from '../utils/gameData';
import { sfx } from '../utils/audio';
import { Trophy, Lock, Play, Star, ChevronLeft } from 'lucide-react';

interface LevelSelectorProps {
  unlockedLevels: number;
  completedLevelStars: Record<number, number>;
  onSelectLevel: (level: LevelConfig) => void;
  onBack: () => void;
}

export default function LevelSelector({
  unlockedLevels,
  completedLevelStars,
  onSelectLevel,
  onBack
}: LevelSelectorProps) {
  
  const handleSelect = (level: LevelConfig) => {
    if (level.levelNumber <= unlockedLevels) {
      sfx.playUpgrade();
      onSelectLevel(level);
    } else {
      // Locked level feedback tone
      sfx.playCrash();
    }
  };

  return (
    <div id="level-selector-screen" className="flex flex-col h-full bg-zinc-950 text-white overflow-y-auto p-6 custom-scrollbar" style={{ backgroundColor: '#09090b' }}>
      
      {/* Decorative background grid pattern from Artistic Flair */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between pb-4 border-b border-zinc-800 mb-6 sticky top-0 bg-zinc-950/95 backdrop-blur-md">
        <button
          id="btn-back-to-menu"
          onClick={() => {
            sfx.playCoin();
            onBack();
          }}
          className="flex items-center gap-2 px-4 py-2 rounded-full bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 transition text-xs font-black uppercase text-zinc-400 hover:text-white"
        >
          <ChevronLeft size={16} />
          <span>Lobby</span>
        </button>
        <div className="text-center">
          <h2 className="text-lg font-black italic tracking-tighter uppercase text-white">Campaign Sectors</h2>
          <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-wider">ROAD RACE MAP</p>
        </div>
        <div className="flex items-center gap-1.5 text-lime-400 bg-lime-500/10 px-3 py-1.5 rounded-full border border-lime-500/20">
          <Trophy size={14} />
          <span className="text-[11px] font-black uppercase tracking-wider">
            {Object.values(completedLevelStars).filter(stars => stars > 0).length} / 20 Cleared
          </span>
        </div>
      </div>

      {/* Grid */}
      <div id="levels-grid" className="relative z-10 grid grid-cols-2 sm:grid-cols-3 gap-3 py-2">
        {GAME_LEVELS.map((level) => {
          const isUnlocked = level.levelNumber <= unlockedLevels;
          const stars = completedLevelStars[level.levelNumber] || 0;

          return (
            <button
              id={`level-card-${level.levelNumber}`}
              key={level.levelNumber}
              onClick={() => handleSelect(level)}
              className={`relative flex flex-col justify-between p-4 rounded-xl text-left border transition-all duration-300 transform active:scale-95 ${
                isUnlocked
                  ? 'bg-zinc-900 hover:bg-zinc-900 hover:border-orange-500 border-zinc-800 shadow-lg cursor-pointer hover:shadow-orange-950/10'
                  : 'bg-zinc-950/40 border-zinc-900/60 opacity-40 cursor-not-allowed'
              }`}
            >
              {/* Badge Number */}
              <div className="flex items-center justify-between mb-2">
                <span className={`text-xl font-black font-mono italic ${isUnlocked ? 'text-orange-500' : 'text-zinc-650'}`}>
                  {level.levelNumber.toString().padStart(2, '0')}
                </span>
                
                {isUnlocked ? (
                  <div className="flex gap-0.5">
                    {[1, 2, 3].map((s) => (
                      <Star
                        key={s}
                        size={10}
                        className={s <= stars ? 'fill-lime-500 text-lime-500' : 'text-zinc-700'}
                      />
                    ))}
                  </div>
                ) : (
                  <Lock size={12} className="text-zinc-700" />
                )}
              </div>

              {/* Title & Stats */}
              <div className="mt-2 min-h-[44px]">
                <h4 className={`text-xs font-black uppercase tracking-wide line-clamp-1 ${isUnlocked ? 'text-white' : 'text-zinc-500'}`}>
                  {level.title}
                </h4>
                <p className="text-[10px] text-zinc-400 mt-1 flex flex-wrap gap-x-2">
                  <span>🏁 {level.targetDistance}m</span>
                  {isUnlocked && <span className="text-lime-500">+{level.rewardPoints}pts</span>}
                </p>
              </div>

              {/* Action Banner */}
              {isUnlocked && (
                <div className="mt-3 flex items-center gap-1 text-[9px] font-black text-white bg-orange-600/10 hover:bg-orange-600/20 px-2 py-1 rounded-lg w-full justify-center tracking-wider uppercase border border-orange-550/20">
                  <Play size={8} className="fill-white text-white" />
                  <span>START RUN</span>
                </div>
              )}
            </button>
          );
        })}
      </div>

      {/* Guide note at bottom */}
      <div className="relative z-10 mt-8 text-center text-[11px] text-zinc-400 bg-zinc-900 p-4 rounded-xl border border-zinc-800">
        💡 <span className="font-extrabold text-orange-500">Campaign Guide:</span> Complete races in the shortest times without accidents. Earn cash rewards upon success to upgrade your bicycle or buy military grade bowgear to target oncoming vehicles!
      </div>
    </div>
  );
}
