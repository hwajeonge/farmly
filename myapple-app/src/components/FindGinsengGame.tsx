import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Trophy, Play, RotateCcw, Search, Pause, LogOut } from 'lucide-react';

interface FindGinsengGameProps {
  onClose: () => void;
  onFinish: (points: number, isGameOver: boolean) => void;
  onRestart?: () => boolean;
}

export const FindGinsengGame: React.FC<FindGinsengGameProps> = ({ onClose, onFinish, onRestart }) => {
  const [gameState, setGameState] = useState<'playing' | 'result' | 'gameover' | 'paused'>('playing');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [isRewardClaimed, setIsRewardClaimed] = useState(false);
  const [grid, setGrid] = useState<{ 
    id: number; 
    isStone: boolean; 
    isRevealed: boolean; 
    isFlagged: boolean;
    adjacentStones: number;
    hasGinseng: boolean;
  }[]>([]);

  const GRID_SIZE = 6;
  const STONE_COUNT = 6;
  const rewardClaimedRef = useRef(false);

  const generateGrid = () => {
    const totalCells = GRID_SIZE * GRID_SIZE;
    const newGrid = Array.from({ length: totalCells }).map((_, i) => ({
      id: i,
      isStone: false,
      isRevealed: false,
      isFlagged: false,
      adjacentStones: 0,
      hasGinseng: Math.random() > 0.8, // 20% chance for bonus ginseng in safe cells
    }));

    // Place stones
    let placedStones = 0;
    while (placedStones < STONE_COUNT) {
      const idx = Math.floor(Math.random() * totalCells);
      if (!newGrid[idx].isStone) {
        newGrid[idx].isStone = true;
        placedStones++;
      }
    }

    // Calculate adjacent stones
    for (let i = 0; i < totalCells; i++) {
      if (newGrid[i].isStone) continue;
      
      const row = Math.floor(i / GRID_SIZE);
      const col = i % GRID_SIZE;
      let count = 0;

      for (let dr = -1; dr <= 1; dr++) {
        for (let dc = -1; dc <= 1; dc++) {
          const nr = row + dr;
          const nc = col + dc;
          if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
            if (newGrid[nr * GRID_SIZE + nc].isStone) count++;
          }
        }
      }
      newGrid[i].adjacentStones = count;
    }

    setGrid(newGrid);
  };

  const startGame = () => {
    if (onRestart && !onRestart()) return;
    setGameState('playing');
    setScore(0);
    setTimeLeft(60);
    setIsRewardClaimed(false);
    rewardClaimedRef.current = false;
    generateGrid();
  };

  const handleClaimReward = () => {
    if (rewardClaimedRef.current) return;
    rewardClaimedRef.current = true;
    setIsRewardClaimed(true);
    onFinish(score, gameState === 'gameover' || score === 0);
  };

  useEffect(() => {
    if (gameState === 'playing') {
      generateGrid();
      const timer = setInterval(() => {
        setTimeLeft((t) => {
          if (t <= 1) {
            setGameState('result');
            return 0;
          }
          return t - 1;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [gameState]);

  const revealCell = (id: number) => {
    if (gameState !== 'playing' || grid[id].isRevealed || grid[id].isFlagged) return;

    if (grid[id].isStone) {
      // Game Over
      const revealedGrid = grid.map(c => ({ ...c, isRevealed: true }));
      setGrid(revealedGrid);
      setGameState('gameover');
      return;
    }

    const newGrid = [...grid];
    
    const floodFill = (idx: number) => {
      if (newGrid[idx].isRevealed || newGrid[idx].isStone) return;
      
      newGrid[idx].isRevealed = true;
      if (newGrid[idx].hasGinseng) setScore(s => s + 50);
      else setScore(s => s + 10);

      if (newGrid[idx].adjacentStones === 0) {
        const row = Math.floor(idx / GRID_SIZE);
        const col = idx % GRID_SIZE;
        for (let dr = -1; dr <= 1; dr++) {
          for (let dc = -1; dc <= 1; dc++) {
            const nr = row + dr;
            const nc = col + dc;
            if (nr >= 0 && nr < GRID_SIZE && nc >= 0 && nc < GRID_SIZE) {
              floodFill(nr * GRID_SIZE + nc);
            }
          }
        }
      }
    };

    floodFill(id);
    setGrid(newGrid);

    // Check Victory
    const unrevealedSafe = newGrid.filter(c => !c.isStone && !c.isRevealed);
    if (unrevealedSafe.length === 0) {
      setScore(s => s + 200); // Victory bonus
      setGameState('result');
    }
  };

  const toggleFlag = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    if (gameState !== 'playing' || grid[id].isRevealed) return;
    setGrid(prev => prev.map(c => c.id === id ? { ...c, isFlagged: !c.isFlagged } : c));
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative w-full max-w-md aspect-[3/4] bg-orange-50 rounded-[3rem] border-8 border-white shadow-2xl overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="p-6 flex justify-between items-center relative z-10">
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border-2 border-orange-200 shadow-sm">
            <p className="text-[10px] font-black text-orange-400 uppercase">Score</p>
            <p className="text-xl font-black text-orange-600">{score}</p>
          </div>
          <div className="bg-white/80 backdrop-blur-sm px-4 py-2 rounded-2xl border-2 border-orange-200 shadow-sm text-center">
            <p className="text-[10px] font-black text-orange-400 uppercase">Time</p>
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
        <div className="flex-1 p-4 flex flex-col">
          <div className="mb-4 text-center">
            <h3 className="font-black text-orange-800">풍기 인삼 지뢰찾기</h3>
            <p className="text-[10px] text-orange-400 font-bold">돌(🪨)을 피해서 모든 인삼을 찾으세요!</p>
          </div>
          
          <div className="flex-1 grid grid-cols-6 gap-1.5">
            {grid.map((cell) => (
              <motion.button
                key={cell.id}
                whileTap={{ scale: 0.9 }}
                onClick={() => revealCell(cell.id)}
                onContextMenu={(e) => toggleFlag(e, cell.id)}
                className={`relative rounded-lg border-2 transition-all flex items-center justify-center text-sm font-black ${
                  cell.isRevealed 
                    ? cell.isStone ? 'bg-red-100 border-red-200' : 'bg-white border-stone-100' 
                    : 'bg-stone-200 border-stone-300 shadow-[0_2px_0_0_#a8a29e]'
                }`}
              >
                {cell.isRevealed ? (
                  <span>
                    {cell.isStone ? '🪨' : (
                      cell.adjacentStones > 0 ? (
                        <span className={
                          cell.adjacentStones === 1 ? 'text-blue-500' :
                          cell.adjacentStones === 2 ? 'text-green-500' :
                          'text-red-500'
                        }>
                          {cell.adjacentStones}
                        </span>
                      ) : cell.hasGinseng ? '✨' : ''
                    )}
                  </span>
                ) : cell.isFlagged ? (
                  <span className="text-red-500">🚩</span>
                ) : null}
              </motion.button>
            ))}
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
                <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-orange-400">
                   <Pause size={32} />
                </div>
                <h3 className="text-xl font-black text-stone-800 mb-2">잠시 멈출까요?</h3>
                <p className="text-sm font-bold text-stone-400 mb-8 leading-relaxed">
                  인삼 찾기를 중단하면 지금까지<br />진행한 내용이 초기화됩니다.
                </p>
                <div className="space-y-3">
                  <button 
                    onClick={() => setGameState('playing')}
                    className="w-full py-4 bg-orange-500 text-white rounded-2xl font-black shadow-[0_4px_0_0_#c2410c] active:shadow-none active:translate-y-1 transition-all"
                  >
                    계속 찾기
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

          {(gameState === 'result' || gameState === 'gameover') && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="absolute inset-0 z-30 bg-white/95 backdrop-blur-md flex flex-col items-center justify-center p-10 text-center"
            >
              {gameState === 'result' ? (
                <Trophy size={80} className="text-yeoju-gold mb-6" />
              ) : (
                <div className="text-8xl mb-6">💥</div>
              )}
              <h2 className="text-3xl font-black mb-2">
                {gameState === 'result' ? '심봤다! 성공!' : '돌을 밟았어요!'}
              </h2>
              <p className="text-stone-400 font-bold mb-8">최종 점수</p>
              <div className="text-6xl font-black text-orange-600 mb-10">{score}</div>
              
              <div className="w-full space-y-4">
                <button 
                  onClick={handleClaimReward}
                  disabled={isRewardClaimed}
                  className="w-full py-5 bg-apple-green text-white rounded-3xl font-black text-xl shadow-[0_8px_0_0_#2e7d32] active:shadow-none active:translate-y-2 transition-all disabled:bg-stone-200 disabled:text-stone-400 disabled:shadow-none disabled:translate-y-0"
                >
                  {isRewardClaimed ? '보상 수령 완료' : `${score}P 받기`}
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
