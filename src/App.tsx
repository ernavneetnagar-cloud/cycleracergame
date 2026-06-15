import React, { useState, useEffect } from 'react';
import { GameState, PlayerData, LevelConfig } from './types';
import { GAME_LEVELS } from './utils/gameData';
import { sfx } from './utils/audio';
import Dashboard from './components/Dashboard';
import LevelSelector from './components/LevelSelector';
import GameCanvas from './components/GameCanvas';
import ShopModal from './components/ShopModal';
import { 
  Trophy, 
  Coins, 
  Star, 
  RotateCcw, 
  X, 
  Play, 
  Home, 
  ShoppingBag, 
  Sparkles, 
  CheckCircle,
  Smartphone,
  Info
} from 'lucide-react';

const LOCAL_STORAGE_KEY = 'cyclist_road_run_player_v1';

const INITIAL_PLAYER_DATA: PlayerData = {
  points: 150, // Warm welcome points so they can start shopping early!
  currentLevel: 1,
  completedLevelStars: {},
  activeOutfitId: 'outfit_casual',
  activeVehicleId: 'cycle_classic',
  activeBackgroundId: 'bg_sunny',
  ownedItemIds: ['outfit_casual', 'cycle_classic', 'bg_sunny'],
};

export default function App() {
  const [player, setPlayer] = useState<PlayerData>(INITIAL_PLAYER_DATA);
  const [gameState, setGameState] = useState<GameState>(GameState.START_MENU);
  const [activeLevel, setActiveLevel] = useState<LevelConfig>(GAME_LEVELS[0]);
  const [isMuted, setIsMuted] = useState<boolean>(false);

  // States for game overlay parameters
  const [justEarnedPoints, setJustEarnedPoints] = useState<number>(0);
  const [wonStars, setWonStars] = useState<number>(0);

  // Load persistence state on startup
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        // fill matching defaults
        setPlayer({
          ...INITIAL_PLAYER_DATA,
          ...parsed,
        });
      }
    } catch (e) {
      // safe fallback
    }
  }, []);

  // Save persistence when player data updates
  const savePlayerData = (updated: PlayerData) => {
    setPlayer(updated);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {}
  };

  const handleToggleMute = () => {
    const nextMute = !isMuted;
    setIsMuted(nextMute);
    sfx.setMute(nextMute);
    sfx.playCoin();
  };

  // Navigate screens
  const handleNavigate = (state: GameState) => {
    setGameState(state);
  };

  const handleBuyItem = (itemId: string, cost: number) => {
    if (player.points >= cost) {
      const updated: PlayerData = {
        ...player,
        points: player.points - cost,
        ownedItemIds: [...player.ownedItemIds, itemId],
      };
      savePlayerData(updated);
      sfx.playUpgrade();
    }
  };

  const handleEquipItem = (category: 'outfit' | 'vehicle' | 'background' | 'weapon', itemId: string) => {
    let keyToUpdate = '';
    if (category === 'outfit') keyToUpdate = 'activeOutfitId';
    if (category === 'vehicle') keyToUpdate = 'activeVehicleId';
    if (category === 'background') keyToUpdate = 'activeBackgroundId';

    if (keyToUpdate) {
      const updated = {
        ...player,
        [keyToUpdate]: itemId,
      };
      savePlayerData(updated);
      sfx.playUpgrade();
    }
  };

  const handleSelectLevel = (level: LevelConfig) => {
    setActiveLevel(level);
    setGameState(GameState.PLAYING);
  };

  const handleQuickPlay = () => {
    // Play closest unlocked level up to 20
    const levelToPlay = GAME_LEVELS.find(l => l.levelNumber === Math.min(20, player.currentLevel)) || GAME_LEVELS[0];
    setActiveLevel(levelToPlay);
    setGameState(GameState.PLAYING);
  };

  // --- GAME CONTEXT OUTCOME CALLBACKS ---
  const handleGameWin = (stars: number, pointsEarned: number) => {
    setWonStars(stars);
    setJustEarnedPoints(pointsEarned);

    // Calculate progression updates
    const nextLevelNum = activeLevel.levelNumber + 1;
    const isNewMaxUnlocked = nextLevelNum > player.currentLevel && nextLevelNum <= 20;

    const updatedStars = {
      ...player.completedLevelStars,
      [activeLevel.levelNumber]: Math.max(player.completedLevelStars[activeLevel.levelNumber] || 0, stars),
    };

    const updated: PlayerData = {
      ...player,
      points: player.points + pointsEarned,
      currentLevel: isNewMaxUnlocked ? nextLevelNum : player.currentLevel,
      completedLevelStars: updatedStars,
    };

    savePlayerData(updated);
    setGameState(GameState.LEVEL_COMPLETE);
  };

  const handleGameCrash = () => {
    setGameState(GameState.CRASHED);
  };

  const handleResumeGame = () => {
    sfx.playCoin();
    setGameState(GameState.PLAYING);
  };

  const handleQuitGameToMenu = () => {
    sfx.playCoin();
    setGameState(GameState.START_MENU);
  };

  const handleNextLevel = () => {
    sfx.playUpgrade();
    const nextLevelNum = activeLevel.levelNumber + 1;
    const nextLevel = GAME_LEVELS.find(l => l.levelNumber === nextLevelNum);
    
    if (nextLevel && nextLevelNum <= player.currentLevel) {
      setActiveLevel(nextLevel);
      setGameState(GameState.PLAYING);
    } else {
      setGameState(GameState.LEVEL_SELECT);
    }
  };

  // Check if player owns Bow Weapon
  const hasBowAndArrow = player.ownedItemIds.includes('weapon_bow');

  return (
    <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center p-0 sm:p-4 text-white font-sans selection:bg-orange-600 selection:text-white" style={{ backgroundColor: '#09090b' }}>
      
      {/* Decorative desktop outer frames to simulate a gorgeous premium Android Native Game emulator! */}
      <div className="w-full max-w-lg bg-zinc-900 border-none sm:border-8 sm:border-zinc-805 shadow-2xl sm:rounded-[36px] flex flex-col overflow-hidden relative aspect-auto sm:aspect-[9/19] h-screen sm:h-[880px] max-h-full">
        
        {/* Simulated Phone Ear speaker / Camera top notch - Desktop only */}
        <div className="hidden sm:flex absolute top-0 left-1/2 -translate-x-1/2 h-6 w-32 bg-zinc-800 rounded-b-2xl z-50 items-center justify-center">
          <div className="w-12 h-1 bg-zinc-950 rounded-full" />
          <div className="w-2.5 h-2.5 bg-zinc-950 rounded-full ml-3" />
        </div>

        {/* Dynamic screen views routing */}
        <div className="flex-1 overflow-hidden h-full flex flex-col relative pt-0 sm:pt-4">
          
          {gameState === GameState.START_MENU && (
            <Dashboard
              unlockedLevels={player.currentLevel}
              points={player.points}
              activeOutfitId={player.activeOutfitId}
              activeVehicleId={player.activeVehicleId}
              hasBowAndArrow={hasBowAndArrow}
              scoreHistoryCount={Object.keys(player.completedLevelStars).length}
              isMuted={isMuted}
              onToggleMute={handleToggleMute}
              onNavigate={handleNavigate}
              onQuickPlay={handleQuickPlay}
            />
          )}

          {gameState === GameState.LEVEL_SELECT && (
            <LevelSelector
              unlockedLevels={player.currentLevel}
              completedLevelStars={player.completedLevelStars}
              onSelectLevel={handleSelectLevel}
              onBack={() => handleNavigate(GameState.START_MENU)}
            />
          )}

          {(gameState === GameState.PLAYING || gameState === GameState.PAUSED) && (
            <div className="h-full flex flex-col relative">
              <GameCanvas
                level={activeLevel}
                activeOutfitId={player.activeOutfitId}
                activeVehicleId={player.activeVehicleId}
                hasBowAndArrow={hasBowAndArrow}
                onWin={handleGameWin}
                onCrash={handleGameCrash}
                onPauseToggle={(isPaused) => handleNavigate(isPaused ? GameState.PAUSED : GameState.PLAYING)}
                gameState={gameState}
              />

              {/* Pause Menu Modal Overlay */}
              {gameState === GameState.PAUSED && (
                <div className="absolute inset-0 bg-zinc-950/90 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50 animate-fade-in" style={{ backgroundColor: 'rgba(9, 9, 11, 0.9)' }}>
                  <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm text-center shadow-2xl">
                    <h3 className="text-xl font-black italic tracking-tighter text-orange-500 uppercase">GAME PAUSED</h3>
                    <p className="text-[11px] font-bold text-zinc-500 uppercase tracking-widest mt-1">Sector {activeLevel.levelNumber}: {activeLevel.title}</p>

                    <div className="my-6 grid grid-cols-1 gap-2.5">
                      <button
                        id="pause-btn-resume"
                        onClick={handleResumeGame}
                        className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Play size={14} className="fill-white text-white" />
                        <span>Resume Race</span>
                      </button>

                      <button
                        id="pause-btn-restart"
                        onClick={() => {
                          sfx.playUpgrade();
                          setGameState(GameState.PLAYING);
                        }}
                        className="w-full py-3 rounded-lg bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 text-zinc-200 font-black text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <RotateCcw size={14} />
                        <span>Restart Run</span>
                      </button>

                      <button
                        id="pause-btn-menu"
                        onClick={handleQuitGameToMenu}
                        className="w-full py-3 rounded-lg bg-zinc-950 hover:bg-zinc-900 border border-zinc-900 text-zinc-500 font-black text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5"
                      >
                        <Home size={14} />
                        <span>Lobby Menu</span>
                      </button>
                    </div>

                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-wide">Pressing Escape or Back returns you straight to action.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {gameState === GameState.SHOP && (
            <ShopModal
              points={player.points}
              ownedItemIds={player.ownedItemIds}
              activeOutfitId={player.activeOutfitId}
              activeVehicleId={player.activeVehicleId}
              activeBackgroundId={player.activeBackgroundId}
              onBuyItem={handleBuyItem}
              onEquipItem={handleEquipItem}
              onClose={() => handleNavigate(GameState.START_MENU)}
            />
          )}

          {/* Level Complete Win Overlay Screen */}
          {gameState === GameState.LEVEL_COMPLETE && (
            <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50 overflow-y-auto">
              <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 w-full max-w-sm text-center shadow-3xl">
                
                {/* Sparkles effect */}
                <div className="flex justify-center mb-2">
                  <div className="w-16 h-16 rounded-full bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400">
                    <Sparkles size={28} className="animate-spin text-lime-400" style={{ animationDuration: '4s' }} />
                  </div>
                </div>

                <h3 className="text-[10px] uppercase tracking-widest font-black text-lime-500">Sector Completed</h3>
                <h2 className="text-xl font-black text-white mt-1 leading-tight uppercase tracking-tight">
                  {activeLevel.title}
                </h2>

                {/* Stars container */}
                <div className="flex justify-center gap-2 my-4">
                  {[1, 2, 3].map((val) => (
                    <Star 
                      key={val} 
                      size={24} 
                      className={val <= wonStars ? 'fill-lime-500 text-lime-500 animate-bounce text-lime-500' : 'text-zinc-800'} 
                      style={{ animationDelay: `${val * 150}ms` }}
                    />
                  ))}
                </div>

                {/* Score Point banner */}
                <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-850 mb-6">
                  <span className="text-[9px] text-zinc-500 font-extrabold uppercase tracking-widest">Bonus Cashback Looted</span>
                  <div className="flex items-center justify-center gap-1.5 mt-1 text-lime-400">
                    <Coins size={18} className="text-lime-400" />
                    <span className="text-xl font-black font-mono tracking-tight text-white">+{justEarnedPoints}</span>
                    <span className="text-[10px] text-lime-400 font-extrabold">PTS</span>
                  </div>
                  <p className="text-[9px] text-zinc-400 mt-1 uppercase font-bold tracking-wider">Balance: {player.points.toLocaleString()} PTS</p>
                </div>

                {/* Action buttons */}
                <div className="space-y-2.5">
                  <button
                    id="win-btn-next"
                    onClick={handleNextLevel}
                    className="w-full py-3 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <span>Next Sector</span>
                    <Play size={12} className="fill-white" />
                  </button>

                  <button
                    id="win-btn-shop text-orange-500"
                    onClick={() => {
                      sfx.playCoin();
                      setGameState(GameState.SHOP);
                    }}
                    className="w-full py-3 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-orange-500 border border-zinc-800 font-black text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag size={12} />
                    <span>Spend Points</span>
                  </button>

                  <button
                    id="win-btn-lobby"
                    onClick={handleQuitGameToMenu}
                    className="w-full py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-900 text-zinc-500 font-black text-xs uppercase tracking-wider transition active:scale-95"
                  >
                    Lobby Menu
                  </button>
                </div>

              </div>
            </div>
          )}

          {/* Crash Fail Overlay Screen */}
          {gameState === GameState.CRASHED && (
            <div className="absolute inset-0 bg-zinc-950/95 backdrop-blur-md flex flex-col items-center justify-center p-6 z-50">
              <div className="bg-zinc-900 border border-zinc-850 rounded-2xl p-6 w-full max-w-sm text-center shadow-3xl">
                
                <div className="w-14 h-14 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 mx-auto mb-3">
                  <Smartphone size={24} className="animate-pulse" />
                </div>

                <h3 className="text-[9px] uppercase tracking-widest font-black text-orange-500">Accident Triggered</h3>
                <h2 className="text-xl font-black text-white mt-1 leading-tight">WRECKED ON HIGHWAY</h2>
                <p className="text-xs text-zinc-400 mt-2 max-w-[240px] mx-auto leading-relaxed">
                  Avoid oncoming traffic lanes! Upgrade item gear inside the store to protect your cyclist and shield accidents cleanly.
                </p>

                {/* Tips block */}
                <div className="bg-zinc-950 border border-zinc-855 rounded-xl p-3 text-left my-5">
                  <div className="flex items-center gap-1.5 text-lime-400 text-[9.5px] font-black uppercase mb-1">
                    <Info size={11} />
                    <span>Survival Tip</span>
                  </div>
                  <p className="text-[10px] text-zinc-500 font-bold">
                    Equip an Armored Vehicle or unlock the Hunter Bow to blow cars up before they crash into your lanes!
                  </p>
                </div>

                {/* Controls */}
                <div className="space-y-2.5">
                  <button
                    id="fail-btn-retry"
                    onClick={() => {
                      sfx.playUpgrade();
                      setGameState(GameState.PLAYING);
                    }}
                    className="w-full py-3.5 rounded-lg bg-orange-600 hover:bg-orange-500 text-white font-black text-xs uppercase tracking-wider shadow-md transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <RotateCcw size={12} />
                    <span>Retry Run</span>
                  </button>

                  <button
                    id="fail-btn-shop"
                    onClick={() => {
                      sfx.playCoin();
                      setGameState(GameState.SHOP);
                    }}
                    className="w-full py-3 rounded-lg bg-zinc-850 hover:bg-zinc-800 text-orange-500 border border-zinc-800 font-black text-xs uppercase tracking-wider transition active:scale-95 flex items-center justify-center gap-1.5"
                  >
                    <ShoppingBag size={12} />
                    <span>Store Upgrades</span>
                  </button>

                  <button
                    id="fail-btn-menu"
                    onClick={handleQuitGameToMenu}
                    className="w-full py-2.5 rounded-lg bg-zinc-950 hover:bg-zinc-905 text-zinc-650 hover:text-zinc-500 font-black text-xs uppercase transition tracking-wider"
                  >
                    Lobby Menu
                  </button>
                </div>

              </div>
            </div>
          )}

        </div>

        {/* Small simulated phone navigation pill at very bottom */}
        <div className="hidden sm:flex h-6 bg-slate-950 items-center justify-center pb-2 z-20">
          <div className="w-24 h-1 bg-slate-800 rounded-full cursor-pointer hover:bg-slate-700" onClick={handleQuitGameToMenu} title="Return Lobby" />
        </div>

      </div>
    </div>
  );
}
