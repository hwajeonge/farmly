import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Play, RotateCcw, Pause, LogOut } from 'lucide-react';

interface CatchAppleGameProps {
  onClose: () => void;
  onFinish: (points: number, isGameOver: boolean) => void;
  onRestart?: () => boolean;
}

export const CatchAppleGame: React.FC<CatchAppleGameProps> = ({ onClose, onFinish, onRestart }) => {
  const [gameState, setGameState] = useState<'playing' | 'result' | 'paused'>('playing');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(30);
  const [basketPos, setBasketPos] = useState(50); // 0 to 100
  const [apples, setApples] = useState<{ id: number; x: number; y: number; type: 'red' | 'golden' | 'worm' }[]>([]);
  const [isRewardClaimed, setIsRewardClaimed] = useState(false);
  
  const gameRef = useRef<HTMLDivElement>(null);
  const requestRef = useRef<number>(null);
  const lastAppleTime = useRef<number>(0);
  const appleIdCounter = useRef(0);
  const rewardClaimedRef = useRef(false);

  const basketPosRef = useRef(50);
  const gameStateRef = useRef<'ready' | 'playing' | 'result' | 'paused'>('ready');

  useEffect(() => {
    gameStateRef.current = gameState;
    if (gameState === 'playing') {
      const now = performance.now();
      lastAppleTime.current = now;
      lastFrameTime.current = now;
    }
  }, [gameState]);

  const lastFrameTime = useRef<number>(0);

  const startGame = () => {
    if (onRestart && !onRestart()) return;
    setGameState('playing');
    setScore(0);
    setTimeLeft(30);
    setApples([]);
    setIsRewardClaimed(false);
    rewardClaimedRef.current = false;
    const now = performance.now();
    lastAppleTime.current = now;
    lastFrameTime.current = now;
  };

  const handleClaimReward = () => {
    if (rewardClaimedRef.current) return;
    rewardClaimedRef.current = true;
    setIsRewardClaimed(true);
    onFinish(Math.floor(score / 2), score === 0);
  };

  const updateGame = (time: number) => {
    if (gameStateRef.current !== 'playing') return;

    const deltaTime = time - lastFrameTime.current;
    lastFrameTime.current = time;

    // Spawn apples
    if (time - lastAppleTime.current > 800) {
      const typeRand = Math.random();
      let type: 'red' | 'golden' | 'worm' = 'red';
      if (typeRand > 0.9) type = 'golden';
      else if (typeRand > 0.75) type = 'worm';

      const newApple = {
        id: appleIdCounter.current++,
        x: Math.random() * 90 + 5,
        y: -10,
        type
      };
      setApples(prev => [...prev, newApple]);
      lastAppleTime.current = time;
    }

    // Move apples
    setApples(prev => {
      const speed = 0.15; // units per ms
      const nextApples = prev.map(a => ({ ...a, y: a.y + speed * deltaTime }));
      
      // Collision detection
      const caught: number[] = [];
      nextApples.forEach(a => {
        // Basket is at y=90 approx (bottom-10)
        // Basket width is approx 20%
        const isCaught = a.y > 75 && a.y < 88 && Math.abs(a.x - basketPosRef.current) < 12;
        if (isCaught) {
          caught.push(a.id);
          if (a.type === 'red') setScore(s => s + 10);
          else if (a.type === 'golden') setScore(s => s + 50);
          else if (a.type === 'worm') setScore(s => Math.max(0, s - 20));
        }
      });

      return nextApples.filter(a => a.y < 100 && !caught.includes(a.id));
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

  const handleTouchMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (gameState !== 'playing' || !gameRef.current) return;
    const rect = gameRef.current.getBoundingClientRect();
    const clientX = 'touches' in e ? e.touches[0].clientX : (e as React.MouseEvent).clientX;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const newPos = Math.max(10, Math.min(90, x));
    setBasketPos(newPos);
    basketPosRef.current = newPos;
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md aspect-[3/4] bg-sky-100 rounded-[3rem] border-8 border-white shadow-2xl overflow-hidden flex flex-col"
        ref={gameRef}
        onMouseMove={handleTouchMove}
        onTouchMove={handleTouchMove}
      >
        {/* Header */}
        <div className="p-6 flex justify-between items-center relative z-10">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border-2 border-sky-200 shadow-sm">
            <p className="text-[10px] font-black text-sky-400 uppercase">Score</p>
            <p className="text-xl font-black text-apple-red">{score}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border-2 border-sky-200 shadow-sm text-center">
            <p className="text-[10px] font-black text-sky-400 uppercase">Time</p>
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
        <div className="flex-1 relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute bottom-0 left-0 right-0 h-32 bg-apple-green/20" />
          <div className="absolute top-20 left-10 text-6xl opacity-20">☁️</div>
          <div className="absolute top-40 right-10 text-4xl opacity-20">☁️</div>

          {/* Apples */}
          {apples.map(apple => (
            <div 
              key={apple.id}
              className="absolute text-4xl"
              style={{ left: `${apple.x}%`, top: `${apple.y}%`, transform: 'translateX(-50%)' }}
            >
              {apple.type === 'red' ? '🍎' : apple.type === 'golden' ? '🌟' : '🐛'}
            </div>
          ))}

          {/* Basket */}
          <div 
            className="absolute bottom-10 text-6xl pointer-events-none"
            style={{ left: `${basketPos}%`, transform: 'translateX(-50%)' }}
          >
            🧺
          </div>
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
                <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-stone-400">
                  <Pause size={32} />
                </div>
                <h3 className="text-xl font-black text-stone-800 mb-2">잠시 쉴까요?</h3>
                <p className="text-sm font-bold text-stone-400 mb-8 leading-relaxed">
                  게임을 중단하면 지금까지<br />획득한 점수가 사라질 수 있습니다.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => setGameState('playing')}
                    className="w-full py-4 bg-apple-green text-white rounded-2xl font-black shadow-[0_4px_0_0_#2e7d32] active:shadow-none active:translate-y-1 transition-all"
                  >
                    계속하기
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
              <h2 className="text-3xl font-black mb-2">게임 종료!</h2>
              <p className="text-stone-400 font-bold mb-8">수확한 사과 점수</p>
              <div className="text-6xl font-black text-apple-red mb-10">{score}</div>
              
              <div className="w-full space-y-4">
                <button 
                  onClick={handleClaimReward}
                  disabled={isRewardClaimed}
                  className="w-full py-5 bg-apple-green text-white rounded-3xl font-black text-xl shadow-[0_8px_0_0_#2e7d32] active:shadow-none active:translate-y-2 transition-all disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none disabled:translate-y-0"
                >
                  {isRewardClaimed ? '보상 수령 완료' : `${Math.floor(score / 2)}P 받기`}
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
