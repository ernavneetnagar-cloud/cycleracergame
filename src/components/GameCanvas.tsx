import React, { useEffect, useRef, useState } from 'react';
import { GameState, LevelConfig, Entity } from '../types';
import { LEVEL_THEMES } from '../utils/gameData';
import { sfx } from '../utils/audio';
import { 
  Zap, 
  ArrowUp, 
  RotateCcw, 
  Pause, 
  Play, 
  Flame, 
  Sparkles, 
  Coins, 
  Shield, 
  Skull, 
  ArrowBigLeft, 
  ArrowBigRight,
  Target
} from 'lucide-react';

interface GameCanvasProps {
  level: LevelConfig;
  activeOutfitId: string;
  activeVehicleId: string;
  hasBowAndArrow: boolean;
  onWin: (stars: number, pointsEarned: number) => void;
  onCrash: () => void;
  onPauseToggle: (isPaused: boolean) => void;
  gameState: GameState;
}

export default function GameCanvas({
  level,
  activeOutfitId,
  activeVehicleId,
  hasBowAndArrow,
  onWin,
  onCrash,
  onPauseToggle,
  gameState,
}: GameCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Core Game variables stored in refs to avoid React state lag at 60fps
  const gameLoopRef = useRef<number | null>(null);
  const playerRef = useRef<{
    x: number;
    y: number;
    width: number;
    height: number;
    prevX: number;
    lane: number;
    shieldCount: number;
    coinsCollected: number;
  }>({
    x: 200,
    y: 480,
    width: 32,
    height: 64,
    prevX: 200,
    lane: 2,
    shieldCount: activeVehicleId === 'car_supercar' ? 1 : 0,
    coinsCollected: 0,
  });

  const vehiclesRef = useRef<Entity[]>([]);
  const arrowsRef = useRef<Entity[]>([]);
  const coinsRef = useRef<{ x: number; y: number; width: number; height: number; value: number; size: number }[]>([]);
  const particlesRef = useRef<{ x: number; y: number; vx: number; vy: number; color: string; size: number; alpha: number; life: number }[]>([]);
  const backgroundScrollOffsetRef = useRef<number>(0);
  const distanceRef = useRef<number>(0); // how many meters traveled
  const lastSpawnTimeRef = useRef<number>(0);
  const isCrashedRef = useRef<boolean>(false);
  const keysPressedRef = useRef<Record<string, boolean>>({});

  // Local React states for overlays
  const [speed, setSpeed] = useState<number>(0);
  const [shieldActive, setShieldActive] = useState<boolean>(activeVehicleId === 'car_supercar');
  const [scoreCoins, setScoreCoins] = useState<number>(0);
  const [metersTraveled, setMetersTraveled] = useState<number>(0);

  // Settings
  const CANVAS_WIDTH = 400;
  const CANVAS_HEIGHT = 600;
  const LANES_COUNT = 4;
  const ROAD_LEFT_BOUNDARY = 60;
  const ROAD_RIGHT_BOUNDARY = 340;
  const LANE_WIDTH = (ROAD_RIGHT_BOUNDARY - ROAD_LEFT_BOUNDARY) / LANES_COUNT; // 70px per lane

  // Setup Key listeners
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = true;
      
      if (e.key === ' ' || e.key.toLowerCase() === 'spacebar') {
        e.preventDefault();
        shootArrow();
      }
      if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'a') {
        moveLane(-1);
      }
      if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'd') {
        moveLane(1);
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      keysPressedRef.current[e.key.toLowerCase()] = false;
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [hasBowAndArrow, activeVehicleId]);

  // Restart canvas context
  useEffect(() => {
    if (gameState === GameState.PLAYING) {
      startLevelEngine();
    } else {
      stopLevelEngine();
    }
    return () => stopLevelEngine();
  }, [gameState, level, activeVehicleId, activeOutfitId]);

  const startLevelEngine = () => {
    stopLevelEngine();
    isCrashedRef.current = false;
    distanceRef.current = 0;
    lastSpawnTimeRef.current = 0;
    vehiclesRef.current = [];
    arrowsRef.current = [];
    coinsRef.current = [];
    particlesRef.current = [];
    backgroundScrollOffsetRef.current = 0;

    playerRef.current = {
      x: getLaneX(2),
      y: 490,
      width: 32,
      height: 64,
      prevX: getLaneX(2),
      lane: 2,
      shieldCount: activeVehicleId === 'car_supercar' ? 1 : 0,
      coinsCollected: 0,
    };

    setSpeed(getInitialSpeed());
    setShieldActive(activeVehicleId === 'car_supercar');
    setScoreCoins(0);
    setMetersTraveled(0);

    // Initial game animation frame loop
    gameLoopRef.current = requestAnimationFrame(updateFrame);
  };

  const stopLevelEngine = () => {
    if (gameLoopRef.current) {
      cancelAnimationFrame(gameLoopRef.current);
      gameLoopRef.current = null;
    }
  };

  const getLaneX = (laneIndex: number) => {
    return ROAD_LEFT_BOUNDARY + (laneIndex * LANE_WIDTH) + LANE_WIDTH / 2;
  };

  const moveLane = (dir: number) => {
    if (isCrashedRef.current || gameState !== GameState.PLAYING) return;
    const nextLane = playerRef.current.lane + dir;
    if (nextLane >= 0 && nextLane < LANES_COUNT) {
      playerRef.current.lane = nextLane;
    }
  };

  const shootArrow = () => {
    if (isCrashedRef.current || !hasBowAndArrow || gameState !== GameState.PLAYING) return;
    
    // Play shooting sound
    sfx.playShoot();
    
    // Spawn arrow Entity
    const arrowY = playerRef.current.y - 12;
    const arrowX = playerRef.current.x;

    arrowsRef.current.push({
      id: Math.random().toString(),
      x: arrowX,
      y: arrowY,
      width: 6,
      height: 20,
      speed: 15,
      type: 'arrow',
      lane: playerRef.current.lane,
      direction: 'forward',
      color: '#facc15'
    });

    // Arrow muzzle particles
    spawnMuzzleParticles(arrowX, arrowY);
  };

  const getInitialSpeed = () => {
    // scale with level difficulty
    let baseSpeed = 5 * level.baseSpeedMultiplier;
    
    // Add vehicle speed multipliers
    if (activeVehicleId === 'cycle_bmx') baseSpeed *= 1.15;
    if (activeVehicleId === 'cycle_electric') baseSpeed *= 1.30;
    if (activeVehicleId === 'horse_stallion') baseSpeed *= 1.45;
    if (activeVehicleId === 'motorbike_retro') baseSpeed *= 1.60;
    if (activeVehicleId === 'car_supercar') baseSpeed *= 1.80;

    return Math.floor(baseSpeed);
  };

  const spawnMuzzleParticles = (x: number, y: number) => {
    for (let i = 0; i < 8; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 5 - 2,
        color: '#facc15',
        size: Math.random() * 3 + 1,
        alpha: 1,
        life: 20 + Math.random() * 15
      });
    }
  };

  const spawnExplosionParticles = (x: number, y: number, color: string) => {
    for (let i = 0; i < 20; i++) {
      particlesRef.current.push({
        x,
        y,
        vx: (Math.random() - 0.5) * 8,
        vy: (Math.random() - 0.5) * 8,
        color: color || '#f97316',
        size: Math.random() * 5 + 2,
        alpha: 1,
        life: 30 + Math.random() * 20
      });
    }
  };

  // The Game update step (runs 60fps)
  const updateFrame = (nowTime: number) => {
    if (gameState !== GameState.PLAYING || isCrashedRef.current) return;

    const currentSpeed = getInitialSpeed();
    
    // 1. Advance distance
    // 1 frame = speed * 0.1 meters approx
    distanceRef.current += currentSpeed * 0.05;
    setMetersTraveled(Math.floor(distanceRef.current));

    // Check Win condition
    if (distanceRef.current >= level.targetDistance) {
      handleWin();
      return;
    }

    // 2. Animate player horizontal lerp
    const targetX = getLaneX(playerRef.current.lane);
    const diffX = targetX - playerRef.current.x;
    playerRef.current.x += diffX * 0.22; // very smooth responsive ease

    // 3. Scroll background
    backgroundScrollOffsetRef.current = (backgroundScrollOffsetRef.current + currentSpeed) % CANVAS_HEIGHT;

    // 4. Update arrows
    arrowsRef.current.forEach((arrow) => {
      arrow.y -= arrow.speed;
    });
    // Filter out off-screen arrows
    arrowsRef.current = arrowsRef.current.filter(arrow => arrow.y > -20);

    // 5. Spawn Logic (Opponets & Coins)
    if (nowTime - lastSpawnTimeRef.current > (1500 / level.spawnRateMultiplier)) {
      spawnRoadEntities();
      lastSpawnTimeRef.current = nowTime;
    }

    // 6. Update obstacles / vehicles
    vehiclesRef.current.forEach((veh) => {
      if (veh.direction === 'opposite') {
        // opposite vehicles rush towards you from opposite side (lane 0 and 1)
        veh.y += currentSpeed + veh.speed;
      } else {
        // vehicles heading same way in lane 2 and 3, player moves past them
        veh.y += (currentSpeed - veh.speed);
      }
    });

    // Remove offscreen vehicles
    vehiclesRef.current = vehiclesRef.current.filter(veh => veh.y < CANVAS_HEIGHT + 100 && veh.y > -200);

    // 7. Update coins
    coinsRef.current.forEach((coin) => {
      coin.y += currentSpeed; // ground moves relative to playerspeed
    });
    coinsRef.current = coinsRef.current.filter(coin => coin.y < CANVAS_HEIGHT + 100);

    // 8. Update Particles
    particlesRef.current.forEach((p) => {
      p.x += p.vx;
      p.y += p.vy;
      p.life--;
      p.alpha = Math.max(0, p.life / 50);
    });
    particlesRef.current = particlesRef.current.filter(p => p.life > 0);

    // 9. Handle Collisions
    checkAllCollisions();

    // 10. Draw Canvas
    drawGameScene();

    // Loop
    gameLoopRef.current = requestAnimationFrame(updateFrame);
  };

  const spawnRoadEntities = () => {
    // pick random lanes 0-3
    const lanes = [0, 1, 2, 3];
    const chosenLane = lanes[Math.floor(Math.random() * lanes.length)];
    const isOpposite = chosenLane < 2; // lanes 0,1 are against traffic code flow

    // Avoid duplicate spawns in exactly same lane if too close
    const alreadySpawningInLane = vehiclesRef.current.some(v => v.lane === chosenLane && v.y < 120);
    if (alreadySpawningInLane) return;

    // Decide if spawning vehicle or coin
    const rand = Math.random();
    if (rand < 0.65) {
      // Spawn obstacle vehicle!
      const isMotorbike = Math.random() < 0.35;
      const type = isMotorbike ? 'motorbike' : 'car';
      
      // Determine color schemes
      const colors = ['#f43f5e', '#a855f7', '#3b82f6', '#10b981', '#ffffff', '#eab308'];
      const finalColor = colors[Math.floor(Math.random() * colors.length)];
      
      vehiclesRef.current.push({
        id: Math.random().toString(),
        x: getLaneX(chosenLane),
        y: -100,
        width: isMotorbike ? 24 : 36,
        height: isMotorbike ? 44 : 70,
        speed: isOpposite ? (3 + Math.random() * 4) : (2 + Math.random() * 2), // random speeds
        type,
        lane: chosenLane,
        direction: isOpposite ? 'opposite' : 'forward',
        color: finalColor,
        spriteIndex: Math.floor(Math.random() * 3)
      });
    } else {
      // Spawn standard highway coin bonus
      coinsRef.current.push({
        x: getLaneX(chosenLane),
        y: -50,
        width: 18,
        height: 18,
        value: 10,
        size: 10
      });
    }
  };

  const checkAllCollisions = () => {
    const player = playerRef.current;

    // --- Arrow vs Vehicles ---
    arrowsRef.current.forEach((arrow) => {
      vehiclesRef.current.forEach((veh) => {
        if (!veh.isDead && isColliding(arrow, veh)) {
          arrow.y = -100; // destroy arrow
          veh.isDead = true;
          
          // Sound effect
          sfx.playExplosion();

          // Explosion bursts
          spawnExplosionParticles(veh.x, veh.y, veh.color);
          
          // Earn points!
          const ptsAwarded = 25;
          player.coinsCollected += ptsAwarded;
          setScoreCoins(player.coinsCollected);
        }
      });
    });

    // --- Player vs Coins ---
    coinsRef.current.forEach((coin, idx) => {
      // treat coin as custom rect node
      const coinRect = { x: coin.x, y: coin.y, width: coin.width, height: coin.height };
      if (isColliding(player, coinRect)) {
        // Collect coin
        sfx.playCoin();
        player.coinsCollected += 15; // sweet pickup bonus!
        setScoreCoins(player.coinsCollected);
        
        // Pick sparkling light
        for (let i = 0; i < 5; i++) {
          particlesRef.current.push({
            x: coin.x,
            y: coin.y,
            vx: (Math.random() - 0.5) * 4,
            vy: (Math.random() - 0.5) * 4,
            color: '#fbbf24',
            size: Math.random() * 4 + 1,
            alpha: 1,
            life: 15
          });
        }
        
        // Remove coin
        coinsRef.current.splice(idx, 1);
      }
    });

    // --- Player vs Vehicles (Crucial Accident Check!) ---
    vehiclesRef.current.forEach((veh) => {
      if (!veh.isDead && isColliding(player, veh)) {
        // we crashed ! Check shield
        if (player.shieldCount > 0) {
          // Survived due to super car armor layer! Let's detonate the obstacle vehicle
          player.shieldCount--;
          setShieldActive(false);
          veh.isDead = true;
          sfx.playExplosion();
          spawnExplosionParticles(veh.x, veh.y, '#eab308');
        } else {
          // Crash explosion
          handleCrash();
        }
      }
    });
  };

  const isColliding = (r1: any, r2: any) => {
    const paddingX = 4;
    const paddingY = 8;
    return (
      r1.x - r1.width / 2 + paddingX < r2.x + r2.width / 2 - paddingX &&
      r1.x + r1.width / 2 - paddingX > r2.x - r2.width / 2 + paddingX &&
      r1.y - r1.height / 2 + paddingY < r2.y + r2.height / 2 - paddingY &&
      r1.y + r1.height / 2 - paddingY > r2.y - r2.height / 2 + paddingY
    );
  };

  const handleCrash = () => {
    isCrashedRef.current = true;
    stopLevelEngine();
    sfx.playCrash();
    
    // Spawn deep crash explosion particles
    spawnExplosionParticles(playerRef.current.x, playerRef.current.y, '#ef4444');
    
    // Draw crashed final screen once
    drawGameScene();

    // Trigger parent crash callback
    setTimeout(() => {
      onCrash();
    }, 1200);
  };

  const handleWin = () => {
    stopLevelEngine();
    sfx.playWin();
    
    // Calculate stars: 3 stars if 0 collisions, 2 if used car shield, etc.
    const stars = 3;
    const finalBonus = level.rewardPoints + playerRef.current.coinsCollected;
    onWin(stars, finalBonus);
  };

  // --- HTML5 CANVAS RENDERING CORE ---
  const drawGameScene = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Fetch theme color values
    const myTheme = LEVEL_THEMES[level.backgroundId] || LEVEL_THEMES.sunny_highway;

    // 1. Draw outer grass landscape / fields
    // Clear whole canvas with green theme
    ctx.fillStyle = myTheme.sideColor;
    ctx.fillRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw parallax side details (e.g. Trees, Snow patches, Neon grids)
    drawSideParallaxScenery(ctx, myTheme);

    // 2. Draw tarmac road bed
    ctx.fillStyle = myTheme.roadColor;
    ctx.fillRect(ROAD_LEFT_BOUNDARY, 0, ROAD_RIGHT_BOUNDARY - ROAD_LEFT_BOUNDARY, CANVAS_HEIGHT);

    // Side white guard lines
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(ROAD_LEFT_BOUNDARY - 4, 0, 4, CANVAS_HEIGHT);
    ctx.fillRect(ROAD_RIGHT_BOUNDARY, 0, 4, CANVAS_HEIGHT);

    // 3. Draw lane separators with scrolling dashes
    const offset = backgroundScrollOffsetRef.current;
    ctx.strokeStyle = myTheme.laneColor;
    ctx.lineWidth = 2.5;

    // Draw dashed lane markings for 3 separation lines (lanes 0|1, 1|2, 2|3)
    for (let l = 1; l < LANES_COUNT; l++) {
      const lineX = ROAD_LEFT_BOUNDARY + l * LANE_WIDTH;
      
      // Middle boundary (lane 2 is yellow line indicating divide, lane 1 and 3 are white dash)
      if (l === 2) {
        ctx.strokeStyle = myTheme.laneColor;
        ctx.lineWidth = 3;
      } else {
        ctx.strokeStyle = '#ffffff80';
        ctx.lineWidth = 1.5;
      }

      ctx.save();
      ctx.setLineDash([25, 30]);
      ctx.lineDashOffset = -offset;
      ctx.beginPath();
      ctx.moveTo(lineX, 0);
      ctx.lineTo(lineX, CANVAS_HEIGHT);
      ctx.stroke();
      ctx.restore();
    }

    // 4. Draw Coins
    coinsRef.current.forEach((coin) => {
      ctx.save();
      ctx.beginPath();
      ctx.arc(coin.x, coin.y, coin.width / 2, 0, Math.PI * 2);
      ctx.fillStyle = '#fbbf24';// Amber Gold
      ctx.fill();
      
      // Gold emboss ring
      ctx.strokeStyle = '#d97706';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      // Inner 'C' marker
      ctx.fillStyle = '#ffffff';
      ctx.font = '9px monospace';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('$', coin.x, coin.y);
      ctx.restore();
    });

    // 5. Draw Arrows
    arrowsRef.current.forEach((arrow) => {
      ctx.fillStyle = arrow.color;
      ctx.shadowBlur = 10;
      ctx.shadowColor = '#fbbf24';
      ctx.fillRect(arrow.x - arrow.width / 2, arrow.y - arrow.height / 2, arrow.width, arrow.height);
      
      // Arrow tip triangle
      ctx.beginPath();
      ctx.moveTo(arrow.x - 6, arrow.y - arrow.height / 2);
      ctx.lineTo(arrow.x + 6, arrow.y - arrow.height / 2);
      ctx.lineTo(arrow.x, arrow.y - arrow.height / 2 - 8);
      ctx.closePath();
      ctx.fill();
      ctx.shadowBlur = 0; // reset
    });

    // 6. Draw opposing/back Traffic vehicles
    vehiclesRef.current.forEach((veh) => {
      if (veh.isDead) return; // blast out!

      ctx.save();
      ctx.translate(veh.x, veh.y);

      // Rotate 180 degrees if oncoming facing opposite!
      if (veh.direction === 'opposite') {
        ctx.rotate(Math.PI);
      }

      if (veh.type === 'motorbike') {
        drawMotorbikeSprite(ctx, veh.color);
      } else {
        drawCarSprite(ctx, veh.color);
      }
      ctx.restore();
    });

    // 7. Draw Explosion Particles
    particlesRef.current.forEach((p) => {
      ctx.fillStyle = p.color;
      ctx.globalAlpha = p.alpha;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1.0;
    });

    // 8. Draw Player character (Cyclist, Horse, motorbike, or supercar depending on choice)
    if (!isCrashedRef.current) {
      ctx.save();
      const player = playerRef.current;
      ctx.translate(player.x, player.y);
      
      // Draw actual vehicle based on equipping choice
      drawPlayerVehicle(ctx);

      // Draw active shield circle around player if supercar armor active
      if (player.shieldCount > 0) {
        ctx.strokeStyle = '#22d3ee';
        ctx.lineWidth = 3;
        ctx.shadowBlur = 15;
        ctx.shadowColor = '#06b6d4';
        ctx.beginPath();
        ctx.arc(0, 0, 42, 0, Math.PI * 2);
        ctx.stroke();
        ctx.shadowBlur = 0;
      }

      ctx.restore();
    }
  };

  const drawSideParallaxScenery = (ctx: CanvasRenderingContext2D, theme: any) => {
    // Generate side decoration points procedurally using scrolling frame offset
    const offset = backgroundScrollOffsetRef.current;
    
    // Draw side items (e.g., green shrubs, grey boulders, snowy pine triangles)
    // We scroll them relative to height to simulate movement
    for (let py = -100; py < CANVAS_HEIGHT + 100; py += 120) {
      const actualY = py + (offset % 120);

      if (level.backgroundId === 'bg_nordic') {
        // Draw Snowy Fir trees in snowy forest theme
        drawPineTree(ctx, 25, actualY);
        drawPineTree(ctx, 375, actualY - 50);
      } else if (level.backgroundId === 'bg_sunset') {
        // Draw dry red canyon rocks
        drawRock(ctx, 28, actualY, '#9a3412');
        drawRock(ctx, 372, actualY - 60, '#7c2d12');
      } else if (level.backgroundId === 'bg_cyber') {
        // Draw cyber blue/cyan glowing grids lines along borders
        ctx.strokeStyle = '#06b6d440';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(0, actualY);
        ctx.lineTo(50, actualY + 40);
        ctx.stroke();

        ctx.beginPath();
        ctx.moveTo(400, actualY);
        ctx.lineTo(350, actualY + 40);
        ctx.stroke();
      } else {
        // Draw sunny trees
        drawSunnyTree(ctx, 22, actualY);
        drawSunnyTree(ctx, 378, actualY - 45);
      }
    }
  };

  // Scenery drawing components
  const drawPineTree = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    ctx.fillStyle = '#0f172a'; // dark pine silhouette
    ctx.fillRect(x - 3, y + 10, 6, 12);
    
    // snowy green leaves
    ctx.fillStyle = '#064e3b';
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x - 14, y + 4);
    ctx.lineTo(x + 14, y + 4);
    ctx.closePath();
    ctx.fill();

    // Snow tips
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x - 6, y - 10);
    ctx.lineTo(x + 6, y - 10);
    ctx.closePath();
    ctx.fill();
  };

  const drawRock = (ctx: CanvasRenderingContext2D, x: number, y: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x - 12, y + 12);
    ctx.lineTo(x - 8, y - 8);
    ctx.lineTo(x + 10, y - 5);
    ctx.lineTo(x + 14, y + 10);
    ctx.closePath();
    ctx.fill();
  };

  const drawSunnyTree = (ctx: CanvasRenderingContext2D, x: number, y: number) => {
    // Trunk
    ctx.fillStyle = '#78350f';
    ctx.fillRect(x - 2, y + 8, 4, 10);
    // Green canopy circle
    ctx.fillStyle = '#166534';
    ctx.beginPath();
    ctx.arc(x, y, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#15803d';
    ctx.beginPath();
    ctx.arc(x - 3, y - 3, 8, 0, Math.PI * 2);
    ctx.fill();
  };

  // Traffic Car Sprite details
  const drawCarSprite = (ctx: CanvasRenderingContext2D, color: string) => {
    // Centered at 0, 0
    const w = 34;
    const h = 64;

    // Wheels
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-w/2 - 2, -h/2 + 8, 3, 12);
    ctx.fillRect(w/2 - 1, -h/2 + 8, 3, 12);
    ctx.fillRect(-w/2 - 2, h/2 - 20, 3, 12);
    ctx.fillRect(w/2 - 1, h/2 - 20, 3, 12);

    // Main Chassis
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 8);
    ctx.fill();

    // Windshield mirror glasses
    ctx.fillStyle = '#38bdf8'; // light blue
    ctx.fillRect(-w/2 + 4, -h/2 + 12, w - 8, 10); // front wind
    ctx.fillRect(-w/2 + 4, h/2 - 20, w - 8, 8); // rear wind

    // Side windows
    ctx.fillRect(-w/2 + 2, -h/2 + 26, 2, 14);
    ctx.fillRect(w/2 - 4, -h/2 + 26, 2, 14);

    // Front headlights (oncoming signals)
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-w/2 + 4, -h/2 + 1, 6, 3);
    ctx.fillRect(w/2 - 10, -h/2 + 1, 6, 3);

    // Brake Taillights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-w/2 + 4, h/2 - 4, 5, 3);
    ctx.fillRect(w/2 - 9, h/2 - 4, 5, 3);
  };

  // Motorbike Traffic sprite
  const drawMotorbikeSprite = (ctx: CanvasRenderingContext2D, color: string) => {
    const w = 20;
    const h = 42;

    // Body
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(-w/2, -h/2, w, h, 6);
    ctx.fill();

    // Black wheels on center lines
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-4, -h/2 - 4, 8, 10); // front tire
    ctx.fillRect(-4, h/2 - 12, 8, 14); // rear tire

    // Seat
    ctx.fillStyle = '#334155';
    ctx.fillRect(-3, -2, 6, 12);

    // Handlebars
    ctx.fillStyle = '#94a3b8';
    ctx.fillRect(-12, -h/2 + 12, 24, 3);

    // Headlight glowing neon cyan
    ctx.fillStyle = '#00ffff';
    ctx.fillRect(-2, -h/2 + 1, 4, 3);
  };

  // Draw player according to equipped items
  const drawPlayerVehicle = (ctx: CanvasRenderingContext2D) => {
    const h = 64;
    const w = 32;

    // Resolve jersey color
    let jerseyColor = '#facc15'; // Default Casual yellow
    if (activeOutfitId === 'outfit_retro') jerseyColor = '#ef4444'; // Aero Red
    if (activeOutfitId === 'outfit_neon') jerseyColor = '#06b6d4'; // Cyber Cyan
    if (activeOutfitId === 'outfit_royal') jerseyColor = '#fbbf24'; // Royal Gold

    // A. supercar vehicle type
    if (activeVehicleId === 'car_supercar') {
      // Draw Super Exotic player car!
      const carColor = '#10b981'; // Cyber Emerald Racer
      
      // Tires
      ctx.fillStyle = '#020617';
      ctx.fillRect(-w/2 - 3, -h/2 + 6, 3, 14);
      ctx.fillRect(w/2, -h/2 + 6, 3, 14);
      ctx.fillRect(-w/2 - 3, h/2 - 20, 3, 14);
      ctx.fillRect(w/2, h/2 - 20, 3, 14);

      // Chassis body
      ctx.fillStyle = carColor;
      ctx.beginPath();
      ctx.roundRect(-w/2, -h/2, w + 2, h + 4, 10);
      ctx.fill();

      // Carbon stripes
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-4, -h/2, 8, h);

      // Windshield
      ctx.fillStyle = '#00ffff';
      ctx.fillRect(-w/2 + 4, -h/2 + 14, w - 6, 12);

      // Neon flame exhaust at bottom
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(-8, h/2 + 2, 4, 6);
      ctx.fillRect(4, h/2 + 2, 4, 6);
      return;
    }

    // B. Motorbike vehicle type
    if (activeVehicleId === 'motorbike_retro') {
      // Draw massive high speed sports motorbike
      ctx.fillStyle = '#f43f5e'; // Flame Red bike
      // Wheels
      ctx.fillStyle = '#000000';
      ctx.fillRect(-4, -h/2 - 6, 8, 12);
      ctx.fillRect(-5, h/2 - 14, 10, 16);

      // Chassis body
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.roundRect(-8, -18, 16, 36, 4);
      ctx.fill();

      // Engine block chrome Details
      ctx.fillStyle = '#94a3b8';
      ctx.fillRect(-6, -2, 12, 10);

      // Handlebars
      ctx.fillStyle = '#334155';
      ctx.fillRect(-15, -16, 30, 4);

      // Rider seated on motorbike
      drawHumanRider(ctx, jerseyColor);
      return;
    }

    // C. Majestic Stallion (Horse)
    if (activeVehicleId === 'horse_stallion') {
      // Draw sweet galloping brown/golden stallion!
      ctx.fillStyle = '#92400e'; // Brown horse body
      
      // Main Horse torso of stallion
      ctx.beginPath();
      ctx.roundRect(-10, -22, 20, 44, 8);
      ctx.fill();

      // Golden mane tail
      ctx.fillStyle = '#fbbf24';
      ctx.beginPath();
      ctx.moveTo(-3, 20);
      ctx.lineTo(0, 34);
      ctx.lineTo(3, 20);
      ctx.closePath();
      ctx.fill();

      // Horse Head stretching forward
      ctx.fillStyle = '#78350f';
      ctx.beginPath();
      ctx.roundRect(-6, -32, 12, 14, 4);
      ctx.fill();

      // Snout
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-3, -34, 6, 4);

      // Human rider on horse back
      drawHumanRider(ctx, jerseyColor);
      return;
    }

    // D. Default Bicycles (Standard Classic, Turbo BMX, Electric Hyper)
    // 1. Draw frame bicycle centerline
    ctx.strokeStyle = '#e2e8f0';
    if (activeVehicleId === 'cycle_bmx') ctx.strokeStyle = '#eab308'; // BMX gold metallic
    if (activeVehicleId === 'cycle_electric') ctx.strokeStyle = '#10b981'; // Cyber electric battery
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -h/2 + 10);
    ctx.lineTo(0, h/2 - 10);
    ctx.stroke();

    // 2. Wheels
    ctx.fillStyle = '#1e293b';
    ctx.fillRect(-3, -h/2 + 2, 6, 12); // Front tire
    ctx.fillRect(-3, h/2 - 14, 6, 12);  // Rear tire

    // 3. Handlebars
    ctx.fillStyle = '#64748b';
    ctx.fillRect(-12, -h/2 + 12, 24, 3);

    // 4. Seated rider
    drawHumanRider(ctx, jerseyColor);
  };

  const drawHumanRider = (ctx: CanvasRenderingContext2D, jerseyColor: string) => {
    // Head helmet
    ctx.fillStyle = '#0f172a'; // dark helmet
    ctx.beginPath();
    ctx.arc(0, -8, 7, 0, Math.PI * 2);
    ctx.fill();
    // Shiny visor streak
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-3, -10, 6, 3);

    // Shoulders / Torso in Custom equipped outfit Jersey color
    ctx.fillStyle = jerseyColor;
    ctx.beginPath();
    ctx.roundRect(-8, -2, 16, 18, 4);
    ctx.fill();

    // Glow effects for Neon Cyber Outfit item
    if (activeOutfitId === 'outfit_neon') {
      ctx.strokeStyle = '#22d3ee';
      ctx.lineWidth = 1.5;
      ctx.strokeRect(-8, -2, 16, 18);
    }
  };

  return (
    <div id="game-racer-viewport" className="flex flex-col flex-1 bg-zinc-950 text-white select-none relative overflow-hidden" style={{ backgroundColor: '#09090b' }}>
      {/* HUD Bar Overlay */}
      <div className="absolute top-0 left-0 right-0 p-3 bg-gradient-to-b from-black/95 to-transparent flex items-center justify-between z-10 font-sans">
        <div className="flex flex-col">
          <span className="text-[9px] text-zinc-400 font-black uppercase tracking-widest">{level.title}</span>
          <span className="text-lg font-black text-orange-500 flex items-center gap-1">
            <Target size={14} className="text-orange-500 animate-pulse" />
            <span className="font-mono">{metersTraveled}</span> 
            <span className="text-xs text-zinc-500">/ {level.targetDistance}m</span>
          </span>
        </div>

        {/* HUD Shields / Stats row */}
        <div className="flex items-center gap-2">
          {shieldActive && (
            <span className="hidden xs:flex items-center gap-1 text-[9px] font-black text-lime-400 bg-lime-500/10 border border-lime-500/20 px-2.5 py-1 rounded-full uppercase tracking-wider">
              <Shield size={10} className="fill-lime-400 animate-pulse" />
              <span>Shield Active</span>
            </span>
          )}

          <div className="flex items-center gap-1 px-3 py-1 bg-zinc-900 rounded-full border border-zinc-800">
            <Coins size={12} className="text-lime-400" />
            <span className="text-xs font-black text-lime-300 font-mono">{scoreCoins} <span className="text-[9px] font-bold">PTS</span></span>
          </div>

          <button
            id="btn-pause-canvas"
            onClick={() => {
              sfx.playCoin();
              onPauseToggle(true);
            }}
            className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 hover:bg-zinc-800 text-zinc-300 hover:text-white transition"
          >
            <Pause size={12} />
          </button>
        </div>
      </div>

      {/* Progress Line */}
      <div className="absolute top-14 left-4 right-4 h-1.5 bg-zinc-900 rounded-full overflow-hidden z-10 border border-zinc-800">
        <div 
          className="h-full bg-gradient-to-r from-orange-600 to-lime-500 transition-all duration-100 rounded-full"
          style={{ width: `${Math.min(100, (metersTraveled / level.targetDistance) * 100)}%` }}
        />
      </div>

      {/* Central Canvas Element */}
      <div className="flex-1 flex items-center justify-center p-2 relative bg-zinc-950">
        <canvas
          id="highway-arcade-canvas"
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="max-w-full max-h-[85vh] rounded-2xl border-4 border-zinc-800 shadow-2xl bg-zinc-900 overflow-hidden aspect-[4/6]"
        />

        {/* Bow Shoot Indicator crosshair widget if equipped */}
        {hasBowAndArrow && (
          <div className="absolute top-[48%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none opacity-20">
            <div className="w-16 h-16 border-2 border-dashed border-orange-500 rounded-full flex items-center justify-center animate-spin" style={{ animationDuration: '20s' }}>
              <div className="w-2 h-2 bg-orange-500 rounded-full" />
            </div>
          </div>
        )}
      </div>

      {/* Mobile Virtual Controller Rails (Extremely critical for high on-screen responsive play!) */}
      <div id="virtual-controls-pad" className="p-4 bg-zinc-950 border-t border-zinc-900 flex items-center justify-between gap-4">
        {/* Steering layout */}
        <div className="flex gap-3">
          <button
            id="vbtn-left"
            onTouchStart={() => moveLane(-1)}
            onMouseDown={() => moveLane(-1)}
            className="w-14 h-14 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-orange-600 flex items-center justify-center text-white border border-zinc-800 transition transform active:scale-90"
          >
            <ArrowBigLeft size={24} className="fill-white" />
          </button>
          
          <button
            id="vbtn-right"
            onTouchStart={() => moveLane(1)}
            onMouseDown={() => moveLane(1)}
            className="w-14 h-14 rounded-xl bg-zinc-900 hover:bg-zinc-800 active:bg-orange-600 flex items-center justify-center text-white border border-zinc-800 transition transform active:scale-90"
          >
            <ArrowBigRight size={24} className="fill-white" />
          </button>
        </div>

        {/* Target distance indicator */}
        <div className="hidden sm:flex flex-col text-center">
          <span className="text-[9px] text-zinc-500 font-extrabold uppercase">RIDE CONTROLS</span>
          <span className="text-[11px] text-zinc-400 mt-0.5 font-sans font-bold">A/D Keys or Left/Right</span>
        </div>

        {/* Weapons Trigger bow block */}
        <div className="flex-1 flex justify-end">
          {hasBowAndArrow ? (
            <button
               id="vbtn-shoot"
              onTouchStart={shootArrow}
              onMouseDown={shootArrow}
              className="w-full max-w-[140px] h-14 rounded-xl bg-orange-600 active:bg-orange-700 flex items-center justify-center gap-1.5 text-white font-black tracking-wider text-xs border border-orange-500 shadow-md transform active:scale-95 uppercase"
            >
              <Flame size={16} className="fill-white animate-pulse" />
              <span>SHOOT BOW</span>
            </button>
          ) : (
            <div className="h-14 flex items-center px-4 bg-zinc-900 rounded-xl border border-zinc-800 text-zinc-500 text-[10px] uppercase font-bold text-right max-w-[170px]">
              🏹 Equip bow to auto shoot cars!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
