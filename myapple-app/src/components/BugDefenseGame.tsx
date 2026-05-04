import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Play, RotateCcw, Heart, ShieldAlert, Pause, LogOut } from 'lucide-react';

interface BugDefenseGameProps {
  onClose: () => void;
  onFinish: (points: number, isGameOver: boolean) => void;
  onRestart?: () => boolean;
}

interface Bug {
  id: number;
  x: number;
  y: number;
  angle: number;
  speed: number;
  type: 'normal' | 'fast' | 'tank';
  hp: number;
}

export const BugDefenseGame: React.FC<BugDefenseGameProps> = ({ onClose, onFinish, onRestart }) => {
  const [gameState, setGameState] = useState<'playing' | 'result' | 'paused'>('playing');
  const [score, setScore] = useState(0);
  const [appleHp, setAppleHp] = useState(5);
  const [timeLeft, setTimeLeft] = useState(30);
  const [bugs, setBugs] = useState<Bug[]>([]);
  const [isRewardClaimed, setIsRewardClaimed] = useState(false);
  
  const gameRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(null);
  const lastBugTime = useRef<number>(0);
  const lastFrameTime = useRef<number>(0);
  const bugIdCounter = useRef(0);
  const gameStateRef = useRef(gameState);
  const rewardClaimedRef = useRef(false);
  const healthBonus = appleHp * 10;
  const rewardPoints = Math.min(250, score + healthBonus);

  useEffect(() => {
    gameStateRef.current = gameState;
    if (gameState === 'playing') {
      const now = performance.now();
      lastBugTime.current = now;
      lastFrameTime.current = now;
    }
  }, [gameState]);

  const startGame = () => {
    if (onRestart && !onRestart()) return;
    setGameState('playing');
    setScore(0);
    setAppleHp(5);
    setTimeLeft(30);
    setBugs([]);
    setIsRewardClaimed(false);
    rewardClaimedRef.current = false;
    const now = performance.now();
    lastBugTime.current = now;
    lastFrameTime.current = now;
  };

  const handleClaimReward = () => {
    if (rewardClaimedRef.current) return;
    rewardClaimedRef.current = true;
    setIsRewardClaimed(true);
    onFinish(rewardPoints, appleHp === 0 || rewardPoints === 0);
  };

  const updateGame = (time: number) => {
    if (gameStateRef.current !== 'playing') return;

    const deltaTime = time - lastFrameTime.current;
    lastFrameTime.current = time;

    // Spawn bugs
    const spawnInterval = Math.max(400, 1000 - (30 - timeLeft) * 20); // Get faster over time
    if (time - lastBugTime.current > spawnInterval) {
      const side = Math.floor(Math.random() * 4); // 0: top, 1: right, 2: bottom, 3: left
      let x = 0, y = 0;
      if (side === 0) { x = Math.random() * 100; y = -10; }
      else if (side === 1) { x = 110; y = Math.random() * 100; }
      else if (side === 2) { x = Math.random() * 100; y = 110; }
      else { x = -10; y = Math.random() * 100; }

      const angle = Math.atan2(50 - y, 50 - x);
      const typeRand = Math.random();
      let type: 'normal' | 'fast' | 'tank' = 'normal';
      let hp = 1;
      let speed = 0.05;

      if (typeRand > 0.9) { type = 'tank'; hp = 3; speed = 0.03; }
      else if (typeRand > 0.7) { type = 'fast'; hp = 1; speed = 0.1; }

      const newBug: Bug = {
        id: bugIdCounter.current++,
        x, y, angle, speed, type, hp
      };
      setBugs(prev => [...prev, newBug]);
      lastBugTime.current = time;
    }

    // Move bugs
    setBugs(prev => {
      const nextBugs = prev.map(b => ({
        ...b,
        x: b.x + Math.cos(b.angle) * b.speed * deltaTime,
        y: b.y + Math.sin(b.angle) * b.speed * deltaTime
      }));

      // Check collision with apple (center 50, 50)
      const reachingApple = nextBugs.filter(b => {
        const dist = Math.sqrt(Math.pow(50 - b.x, 2) + Math.pow(50 - b.y, 2));
        return dist < 10;
      });

      if (reachingApple.length > 0) {
        setAppleHp(hp => {
          const newHp = Math.max(0, hp - reachingApple.length);
          if (newHp === 0) setGameState('result');
          return newHp;
        });
      }

      return nextBugs.filter(b => {
        const dist = Math.sqrt(Math.pow(50 - b.x, 2) + Math.pow(50 - b.y, 2));
        return dist >= 10;
      });
    });

    requestRef.current = requestAnimationFrame(updateGame);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      requestRef.current = requestAnimationFrame(updateGame);
      const timer = setInterval(() => {
        setTimeLeft(t => {
          if (t <= 1) {
            setGameState('result');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => {
        if (requestRef.current) cancelAnimationFrame(requestRef.current);
        clearInterval(timer);
      };
    }
  }, [gameState]);

  const handleWhack = (id: number) => {
    if (gameState !== 'playing') return;
    setBugs(prev => {
      const bug = prev.find(b => b.id === id);
      if (!bug) return prev;
      
      if (bug.hp <= 1) {
        setScore(s => s + (bug.type === 'tank' ? 50 : bug.type === 'fast' ? 30 : 10));
        return prev.filter(b => b.id !== id);
      } else {
        return prev.map(b => b.id === id ? { ...b, hp: b.hp - 1 } : b);
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md aspect-[3/4] bg-green-50 rounded-[3rem] border-8 border-white shadow-2xl overflow-hidden flex flex-col"
        ref={gameRef}
      >
        {/* Header */}
        <div className="p-6 flex justify-between items-center relative z-10">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border-2 border-green-200 shadow-sm">
            <p className="text-[10px] font-black text-green-400 uppercase">Score</p>
            <p className="text-xl font-black text-apple-red">{score}</p>
          </div>
          <div className="flex flex-col items-center gap-1">
            <div className="flex gap-1">
              {Array.from({ length: 5 }).map((_, i) => (
                <Heart 
                  key={i} 
                  size={16} 
                  fill={i < appleHp ? "#ef4444" : "transparent"} 
                  className={i < appleHp ? "text-apple-red" : "text-stone-300"} 
                />
              ))}
            </div>
            <p className="text-[10px] font-black text-stone-400 uppercase">Apple HP</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border-2 border-green-200 shadow-sm text-center">
            <p className="text-[10px] font-black text-green-400 uppercase">Time</p>
            <p className="text-xl font-black text-stone-700">{timeLeft}s</p>
          </div>
          <button 
            onClick={() => setGameState('paused')} 
            className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-stone-400 shadow-sm hover:bg-stone-50 active:scale-95 transition-all"
          >
            <Pause size={20} />
          </button>
        </div>

        {/* Game Area */}
        <div className="flex-1 relative overflow-hidden bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]">
          {/* Central Apple */}
          <motion.div 
            animate={{ 
              scale: appleHp < 3 ? [1, 1.1, 1] : 1,
              rotate: appleHp < 3 ? [-2, 2, -2] : 0
            }}
            transition={{ repeat: Infinity, duration: 0.5 }}
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-8xl z-0"
          >
            🍎
            {appleHp < 3 && (
              <div className="absolute -top-4 -right-4">
                <ShieldAlert className="text-apple-red animate-pulse" size={32} />
              </div>
            )}
          </motion.div>

          {/* Bugs */}
          {bugs.map(bug => (
            <motion.button
              key={bug.id}
              onClick={() => handleWhack(bug.id)}
              className="absolute text-4xl z-10 select-none touch-none"
              style={{ 
                left: `${bug.x}%`, 
                top: `${bug.y}%`, 
                transform: `translate(-50%, -50%) rotate(${bug.angle + Math.PI/2}rad)` 
              }}
              whileTap={{ scale: 0.8 }}
            >
              {bug.type === 'tank' ? '🪲' : bug.type === 'fast' ? '🦟' : '🐛'}
              {bug.type === 'tank' && (
                <div className="absolute -top-2 left-1/2 -translate-x-1/2 flex gap-0.5">
                  {Array.from({ length: bug.hp }).map((_, i) => (
                    <div key={i} className="w-1.5 h-1.5 bg-red-500 rounded-full" />
                  ))}
                </div>
              )}
            </motion.button>
          ))}
        </div>

        {/* Overlays */}
        <AnimatePresence>
          {gameState === 'paused' && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center p-8 text-center"
            >
              <motion.div 
                initial={{ scale: 0.9, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="bg-white rounded-[2.5rem] p-8 w-full shadow-2xl"
              >
                <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-green-500">
                   <Pause size={32} />
                </div>
                <h3 className="text-xl font-black text-stone-800 mb-2">방어를 멈출까요?</h3>
                <p className="text-sm font-bold text-stone-400 mb-8 leading-relaxed">
                  게임을 중단하면 사과나무를 지키기 위한<br />모든 노력이 초기화됩니다.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => setGameState('playing')}
                    className="w-full py-4 bg-apple-green text-white rounded-2xl font-black shadow-[0_4px_0_0_#2e7d32] active:shadow-none active:translate-y-1 transition-all"
                  >
                    방어 재개하기
                  </button>
                  <button 
                    onClick={onClose}
                    className="w-full py-4 bg-stone-100 text-stone-500 rounded-2xl font-black flex items-center justify-center gap-2 hover:bg-stone-200 transition-colors"
                  >
                    <LogOut size={18} /> 게임 나가기
                  </button>
                </div>
              </motion.div>
            </motion.div>
          )}

          {gameState === 'result' && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-30 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center"
            >
              <Trophy size={80} className="text-yeoju-gold mb-6" />
              <h2 className="text-3xl font-black mb-2">방어 성공!</h2>
              <p className="text-stone-400 font-bold mb-8">퇴치한 벌레 점수</p>
              <div className="text-6xl font-black text-apple-red mb-4">{score}</div>
              <div className="mb-10 space-y-1 rounded-2xl bg-green-50 px-4 py-3">
                <p className="text-xs font-black text-apple-green">남은 체력 보너스: +{healthBonus}P</p>
                <p className="text-[10px] font-bold text-stone-400">체력 1칸당 +10P, 총 보상은 최대 250P</p>
              </div>
              
              <div className="w-full space-y-4">
                <button 
                  onClick={handleClaimReward}
                  disabled={isRewardClaimed}
                  className="w-full py-5 bg-apple-green text-white rounded-3xl font-black text-xl shadow-[0_8px_0_0_#2e7d32] active:shadow-none active:translate-y-2 transition-all disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none disabled:translate-y-0"
                >
                  {isRewardClaimed ? '보상 수령 완료' : `${rewardPoints}P 받기`}
                </button>
                <button 
                  onClick={startGame}
                  className="w-full py-4 bg-stone-100 text-stone-500 rounded-2xl font-black flex items-center justify-center gap-2"
                >
                  <RotateCcw size={20} /> 다시 하기
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};
