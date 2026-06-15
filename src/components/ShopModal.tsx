import React, { useState } from 'react';
import { ShopItem, ShopCategory } from '../types';
import { INITIAL_SHOP_ITEMS } from '../utils/gameData';
import { sfx } from '../utils/audio';
import { 
  Coins, 
  ChevronLeft, 
  Shirt, 
  Bike, 
  Flame, 
  Sparkles,
  Sun,
  Shield,
  Gauge,
  CheckCircle2,
  Lock,
  User,
  Eye,
  Crown,
  Activity,
  BatteryCharging,
  Zap,
  Sunset,
  CloudSnow,
  Car
} from 'lucide-react';

interface ShopModalProps {
  points: number;
  ownedItemIds: string[];
  activeOutfitId: string;
  activeVehicleId: string;
  activeBackgroundId: string;
  onBuyItem: (itemId: string, cost: number) => void;
  onEquipItem: (category: ShopCategory, itemId: string) => void;
  onClose: () => void;
}

export default function ShopModal({
  points,
  ownedItemIds,
  activeOutfitId,
  activeVehicleId,
  activeBackgroundId,
  onBuyItem,
  onEquipItem,
  onClose
}: ShopModalProps) {
  const [activeTab, setActiveTab] = useState<ShopCategory>('vehicle');

  const categories: { key: ShopCategory; label: string; icon: any }[] = [
    { key: 'vehicle', label: 'Rides & Mounts', icon: Bike },
    { key: 'outfit', label: 'Rider Outfits', icon: Shirt },
    { key: 'weapon', label: 'Weaponry / Bows', icon: Flame },
    { key: 'background', label: 'Backgrounds', icon: Sun },
  ];

  const filteredItems = INITIAL_SHOP_ITEMS.filter(item => item.category === activeTab);

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bike': return <Bike className="w-8 h-8 text-cyan-400" />;
      case 'ZapColor': return <Zap className="w-8 h-8 text-yellow-400 fill-yellow-400" />;
      case 'BatteryCharging': return <BatteryCharging className="w-8 h-8 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-8 h-8 text-purple-400" />;
      case 'Activity': return <Activity className="w-8 h-8 text-rose-500 animate-pulse" />;
      case 'Car': return <Car className="w-8 h-8 text-amber-500" />;
      
      case 'User': return <User className="w-8 h-8 text-sky-400" />;
      case 'Shirt': return <Shirt className="w-8 h-8 text-lime-400" />;
      case 'Eye': return <Eye className="w-8 h-8 text-violet-400" />;
      case 'Crown': return <Crown className="w-8 h-8 text-amber-400 fill-amber-500/10" />;
      
      case 'Flame': return <Flame className="w-8 h-8 text-orange-500 animate-bounce" />;
      
      case 'Sun': return <Sun className="w-8 h-8 text-amber-400" />;
      case 'Zap': return <Zap className="w-8 h-8 text-fuchsia-400" />;
      case 'Sunset': return <Sunset className="w-8 h-8 text-orange-400" />;
      case 'CloudSnow': return <CloudSnow className="w-8 h-8 text-sky-200" />;
      
      default: return <Bike className="w-8 h-8 text-slate-400" />;
    }
  };

  const handleAction = (item: ShopItem) => {
    const isOwned = ownedItemIds.includes(item.id);
    
    if (isOwned) {
      // Equip Item
      sfx.playUpgrade();
      onEquipItem(item.category, item.id);
    } else {
      // Try to Buy
      if (points >= item.cost) {
        sfx.playUpgrade();
        onBuyItem(item.id, item.cost);
      } else {
        sfx.playCrash(); // buzz tone
      }
    }
  };

  const isActive = (item: ShopItem) => {
    if (item.category === 'outfit') return activeOutfitId === item.id;
    if (item.category === 'vehicle') return activeVehicleId === item.id;
    if (item.category === 'background') return activeBackgroundId === item.id;
    if (item.category === 'weapon') return ownedItemIds.includes(item.id); // weapons enabled if owned
    return false;
  };

  return (
    <div id="shop-modal-panel" className="flex flex-col h-full bg-zinc-950 text-white overflow-hidden" style={{ backgroundColor: '#09090b' }}>
      
      {/* Decorative background grid pattern from Artistic Flair */}
      <div className="absolute inset-0 opacity-10 pointer-events-none overflow-hidden" style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px' }}>
      </div>

      {/* Header */}
      <div className="relative z-10 flex items-center justify-between p-4 border-b border-zinc-800 bg-zinc-950">
        <button
          id="shop-back-menu"
          onClick={() => {
            sfx.playCoin();
            onClose();
          }}
          className="flex items-center gap-1 text-zinc-400 hover:text-white transition py-1.5 px-3 bg-zinc-900 border border-zinc-800 rounded-lg text-xs font-black uppercase"
        >
          <ChevronLeft size={14} />
          <span>Lobby</span>
        </button>

        <h2 className="text-sm font-black tracking-[0.2em] text-orange-500 uppercase flex items-center gap-1.5">
          🛒 GEAR UPGRADES
        </h2>

        {/* Wealth point box */}
        <div className="flex items-center gap-1.5 bg-lime-500/10 text-lime-400 px-3 py-1.5 rounded-full border border-lime-500/20">
          <Coins size={14} className="text-lime-400" />
          <span className="font-mono text-xs font-black text-white">
            {points.toLocaleString()} <span className="text-lime-500 text-[10px]">PTS</span>
          </span>
        </div>
      </div>

      {/* Categories Bar */}
      <div className="relative z-10 flex border-b border-zinc-800 bg-zinc-900/40 p-1.5 gap-1.5">
        {categories.map((cat) => {
          const Icon = cat.icon;
          const isSelected = activeTab === cat.key;
          return (
            <button
              id={`shop-tab-${cat.key}`}
              key={cat.key}
              onClick={() => {
                sfx.playCoin();
                setActiveTab(cat.key);
               }}
              className={`flex-1 flex flex-col sm:flex-row items-center justify-center gap-1.5 py-2 px-1.5 rounded-xl text-[10px] font-black tracking-wide uppercase transition-all ${
                isSelected
                  ? 'bg-orange-600 text-white shadow-md font-black'
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/40'
              }`}
            >
              <Icon size={14} />
              <span className="hidden sm:inline">{cat.label}</span>
              <span className="inline sm:hidden">{cat.label.split(' ')[0]}</span>
            </button>
          );
        })}
      </div>

      {/* Catalog Grid */}
      <div className="relative z-10 flex-1 overflow-y-auto p-4 custom-scrollbar">
        <div className="grid grid-cols-1 gap-3">
          {filteredItems.map((item) => {
            const isOwned = ownedItemIds.includes(item.id);
            const isEquipped = isActive(item);
            const canAfford = points >= item.cost;

            return (
              <div
                id={`shop-item-${item.id}`}
                key={item.id}
                className={`flex gap-4 p-4 rounded-xl border transition-all duration-300 relative ${
                  isEquipped
                    ? 'bg-zinc-900 border-orange-500 shadow-md shadow-orange-950/20'
                    : isOwned
                    ? 'bg-zinc-900/60 border-zinc-800 hover:bg-zinc-900 hover:border-zinc-700'
                    : 'bg-zinc-950 border-zinc-900'
                }`}
              >
                {/* Visual Icon Box */}
                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg bg-zinc-950 flex items-center justify-center border border-zinc-800 relative self-center shrink-0">
                  {getIcon(item.iconName)}
                  
                  {/* Owned overlay tag */}
                  {isOwned && !isEquipped && (
                    <span className="absolute -top-1.5 -right-1.5 bg-zinc-800 border border-zinc-700 text-[8px] px-1.5 py-0.5 rounded-full text-zinc-300 font-extrabold uppercase tracking-wider">
                      Owned
                    </span>
                  )}
                  {isEquipped && (
                    <span className="absolute -top-1.5 -right-1.5 bg-lime-500 border border-zinc-950 text-[8px] px-1.5 py-0.5 rounded-full text-black font-black uppercase tracking-wider">
                      ACTIVE
                    </span>
                  )}
                </div>

                {/* Details Column */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <h3 className="font-black text-sm text-white flex items-center gap-1 uppercase tracking-wide">
                      {item.name}
                    </h3>
                    <p className="text-[11px] text-zinc-400 leading-relaxed mt-1">
                      {item.description}
                    </p>
                  </div>

                  {/* Spec lines */}
                  <div className="mt-2 flex flex-wrap gap-1.5 items-center">
                    {item.specs.label && (
                      <span className="text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-zinc-950 text-orange-500 flex items-center gap-1 border border-zinc-850">
                        {item.specs.speedBoost ? (
                          <>
                            <Gauge size={10} className="text-orange-500" />
                            <span>{item.specs.label}</span>
                          </>
                        ) : (
                          <span>{item.specs.label}</span>
                        )}
                      </span>
                    )}

                    {item.specs.armored && (
                      <span className="text-[9px] font-black tracking-wider uppercase px-1.5 py-0.5 rounded bg-lime-500/10 text-lime-400 border border-lime-500/20 flex items-center gap-1">
                        <Shield size={10} />
                        Armored Frame
                      </span>
                    )}
                  </div>

                  {/* Button Action */}
                  <div className="mt-3 pt-2 border-t border-zinc-800/40 flex items-center justify-between">
                    <div>
                      {!isOwned && (
                        <div className="flex items-center gap-1 font-mono text-xs font-black text-lime-500">
                          <Coins size={12} />
                          <span>{item.cost.toLocaleString()} PTS</span>
                        </div>
                      )}
                    </div>

                    <button
                      id={`shop-btn-action-${item.id}`}
                      onClick={() => handleAction(item)}
                      className={`px-3 py-1.5 rounded-full text-[10px] font-black tracking-wider transition uppercase flex items-center gap-1 ${
                        isEquipped
                          ? 'bg-lime-550/10 text-lime-400 border border-lime-400/20 cursor-default'
                          : isOwned
                          ? 'bg-zinc-800 hover:bg-zinc-700 text-white'
                          : canAfford
                          ? 'bg-orange-600 hover:bg-orange-500 active:scale-95 text-white shadow-sm shadow-orange-900/30'
                          : 'bg-zinc-900 text-zinc-650 border border-zinc-950 cursor-pointer hover:bg-zinc-850 hover:text-orange-500'
                      }`}
                    >
                      {isEquipped ? (
                        <>
                          <CheckCircle2 size={11} />
                          <span>Active</span>
                        </>
                      ) : isOwned ? (
                        <span>Equip</span>
                      ) : (
                        <>
                          {!canAfford && <Lock size={10} className="mr-0.5 inline" />}
                          <span>Unlock Gear</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Footer warning */}
      <div className="p-4 bg-zinc-950 text-center text-[9px] text-zinc-600 border-t border-zinc-900 tracking-wider uppercase">
        🛡️ Campaign rewards are non-commercial. Earn point tokens inside races cleanly to expand your equipment!
      </div>
    </div>
  );
}
