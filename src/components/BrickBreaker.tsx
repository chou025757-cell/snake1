import React, { useRef } from 'react';
import { useGameLoop } from '../hooks/useGameLoop';
import { CANVAS_WIDTH, CANVAS_HEIGHT, THEME } from '../constants';
import { GameStatus } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Trophy, RotateCcw, Play, Heart } from 'lucide-react';

export const BrickBreaker: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { status, score, lives, startGame, restartGame } = useGameLoop(canvasRef);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-[#0a0a0a] text-white font-sans p-4">
      {/* Header Info */}
      <div className="w-full max-w-[800px] flex justify-between items-end mb-4 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase italic text-[#00FF00]">
            打磚塊<span className="text-white">.PRO</span>
          </h1>
          <p className="text-xs font-mono text-white/50 uppercase tracking-widest mt-1">
            Standard Arcade Protocol v1.0
          </p>
        </div>
        
        <div className="flex gap-8 items-center h-full">
          <div className="hidden sm:flex flex-col items-end">
            <span className="text-[10px] font-mono text-white/40 uppercase">剩餘生命</span>
            <div className="flex gap-1 mt-1">
              {Array.from({ length: 3 }).map((_, i) => (
                <Heart
                  key={i}
                  size={16}
                  className={i < lives ? "fill-[#FF0000] text-[#FF0000]" : "text-white/10"}
                />
              ))}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-[10px] font-mono text-white/40 uppercase">目前得分</span>
            <span className="text-3xl font-mono leading-none tracking-tighter">{score.toString().padStart(5, '0')}</span>
          </div>
        </div>
      </div>

      {/* Game Canvas Container */}
      <div className="relative group">
        <canvas
          ref={canvasRef}
          width={CANVAS_WIDTH}
          height={CANVAS_HEIGHT}
          className="bg-[#111] border-[4px] border-[#222] shadow-[0_0_50px_rgba(0,0,0,0.5)] rounded-sm cursor-none"
        />

        {/* UI Overlays */}
        <AnimatePresence>
          {status !== GameStatus.PLAYING && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 flex items-center justify-center bg-black/80 backdrop-blur-sm z-10"
            >
              <div className="text-center p-8 border border-white/10 bg-[#111] rounded-lg shadow-2xl max-w-sm w-full mx-4">
                {status === GameStatus.START && (
                  <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                  >
                    <h2 className="text-5xl font-black italic uppercase mb-2 tracking-tighter">準備好了嗎？</h2>
                    <p className="text-white/60 mb-8 text-sm">使用方向鍵或滑鼠移動平台。破壞所有磚塊以獲得勝利。</p>
                    <button
                      onClick={startGame}
                      className="group relative inline-flex items-center gap-3 bg-[#00FF00] text-black px-8 py-4 font-black uppercase italic tracking-tighter transition-transform hover:scale-105 active:scale-95"
                    >
                      <Play size={20} className="fill-black" />
                      開始遊戲
                    </button>
                  </motion.div>
                )}

                {status === GameStatus.WON && (
                  <motion.div
                    initial={{ scale: 0.9 }}
                    animate={{ scale: 1 }}
                  >
                    <Trophy className="mx-auto text-[#FFFF00] mb-4" size={64} />
                    <h2 className="text-5xl font-black italic uppercase mb-2 tracking-tighter text-[#FFFF00]">勝利！</h2>
                    <p className="text-white/60 mb-8">你已清除所有區域。最終得分：{score}</p>
                    <button
                      onClick={restartGame}
                      className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-black uppercase italic tracking-tighter transition-all hover:bg-[#00FF00]"
                    >
                      <RotateCcw size={20} />
                      再玩一次
                    </button>
                  </motion.div>
                )}

                {status === GameStatus.GAMEOVER && (
                  <motion.div
                    initial={{ y: 20 }}
                    animate={{ y: 0 }}
                  >
                    <h2 className="text-5xl font-black italic uppercase mb-2 tracking-tighter text-[#FF0000]">遊戲結束</h2>
                    <p className="text-white/60 mb-8">系統核心防護失效。最終得分：{score}</p>
                    <button
                      onClick={restartGame}
                      className="inline-flex items-center gap-3 bg-white text-black px-8 py-4 font-black uppercase italic tracking-tighter transition-transform hover:scale-105"
                    >
                      <RotateCcw size={20} />
                      重試一次
                    </button>
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Footer Instructions */}
      <div className="mt-8 grid grid-cols-2 gap-12 w-full max-w-[800px]">
        <div className="flex items-center gap-4">
          <div className="grid grid-cols-2 gap-1">
            <div className="w-8 h-8 flex items-center justify-center border border-white/20 rounded bg-white/5 text-[10px] font-mono">←</div>
            <div className="w-8 h-8 flex items-center justify-center border border-white/20 rounded bg-white/5 text-[10px] font-mono">→</div>
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-white/40 tracking-wider">鍵盤控制</p>
            <p className="text-sm">使用方向鍵或 A/D 移動</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="w-8 h-8 flex items-center justify-center border border-white/20 rounded bg-white/5">
            <div className="w-1 h-1 rounded-full bg-[#00FF00] animate-ping" />
          </div>
          <div>
            <p className="text-[10px] font-mono uppercase text-white/40 tracking-wider">滑鼠追蹤</p>
            <p className="text-sm">精準追隨指標</p>
          </div>
        </div>
      </div>
    </div>
  );
};
