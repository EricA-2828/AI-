import React, { useEffect, useRef } from 'react';
import { useTetris } from './hooks/useTetris';
import { useInterval } from './hooks/useInterval';
import { checkCollision } from './utils/gameUtils';
import Cell from './components/Cell';
import NextBlock from './components/NextBlock';
import { RotateCw, ArrowDown, ArrowLeft, ArrowRight, RefreshCw, Crown, Download } from 'lucide-react';

const App: React.FC = () => {
  const {
    stage,
    setStage,
    player,
    resetGame,
    drop,
    dropTime,
    setDropTime,
    gameOver,
    isGameStarted,
    score,
    level,
    rowsCleared,
    playerRotate,
    updatePlayerPos,
    resetPlayer,
    flushRows,
    clearingRows,
    setClearingRows,
    nextTetromino,
    highScores,
    holdTetromino,
    hold,
    canHold
  } = useTetris();

  const gameAreaRef = useRef<HTMLDivElement>(null);

  // --- ゲームロジック: ステージ更新と衝突判定 ---
  useEffect(() => {
    // アニメーション中はステージ更新を停止（表示を固定）
    if (clearingRows.length > 0) return;

    const updateStage = (prevStage: any[]) => {
      // 1. まずステージをクリア（'clear'のセルは空にする）
      const newStage = prevStage.map((row) =>
        row.map((cell: any[]) => (cell[1] === 'clear' ? [0, 'clear'] : cell))
      );

      // 2. 現在のプレイヤーのブロックを描画
      player.tetromino.forEach((row, y) => {
        row.forEach((value, x) => {
          if (value !== 0) {
            const stageY = y + player.pos.y;
            const stageX = x + player.pos.x;
            if (stageY >= 0 && stageY < newStage.length && stageX >= 0 && stageX < newStage[0].length) {
              newStage[stageY][stageX] = [
                value,
                `${player.collided ? 'merged' : 'clear'}`,
              ];
            }
          }
        });
      });

      // 3. 衝突（接地）時の処理
      if (player.collided) {
        // 行が揃っているかチェック
        const fullRowIndices: number[] = [];
        newStage.forEach((row: any[], index: number) => {
          // すべてのセルが0(空)でない行を探す
          if (row.every(cell => cell[0] !== 0)) {
            fullRowIndices.push(index);
          }
        });

        if (fullRowIndices.length > 0) {
          // 行が揃った場合: アニメーション開始
          setClearingRows(fullRowIndices);
          setDropTime(null); // ゲームループ一時停止
          // ここでは resetPlayer を呼ばずに、merged状態のステージを返す（表示用）
          return newStage;
        }

        // 行が揃っていない場合: 即座に次のブロックへ
        resetPlayer();
        return newStage;
      }

      return newStage;
    };

    setStage((prev) => updateStage(prev));
  }, [player, resetPlayer, setClearingRows, setDropTime, setStage, clearingRows.length]);


  // --- アニメーション制御 ---
  // clearingRows がセットされたら、遅延後に行を削除してゲーム再開
  useEffect(() => {
    if (clearingRows.length > 0) {
      const timer = setTimeout(() => {
        // アニメーション終了: 行を削除してスコア更新
        flushRows(stage);
        // 次のブロックへ
        resetPlayer();
        // ゲーム再開
        setDropTime(Math.max(100, 1000 - (level + 1) * 100));
      }, 400); // 0.4秒間点滅

      return () => clearTimeout(timer);
    }
  }, [clearingRows, flushRows, stage, resetPlayer, setDropTime, level]);


  // --- キーボード操作 ---
  const move = ({ keyCode }: { keyCode: number }) => {
    // Space Key (Start / Restart)
    if (keyCode === 32) {
       if (gameOver || !isGameStarted) {
         resetGame();
         return;
       }
    }

    if (!gameOver && isGameStarted && clearingRows.length === 0) {
      if (keyCode === 37) { // Left
        movePlayer(-1);
      } else if (keyCode === 39) { // Right
        movePlayer(1);
      } else if (keyCode === 40) { // Down
        dropPlayer();
      } else if (keyCode === 38) { // Up
        playerRotate(stage, 1);
      } else if (keyCode === 16) { // Shift (Hold)
        hold();
      }
    }
  };

  const movePlayer = (dir: number) => {
    if (!checkCollision(player, stage, { x: dir, y: 0 })) {
      updatePlayerPos({ x: dir, y: 0, collided: false });
    }
  };

  const dropPlayer = () => {
    setDropTime(null);
    drop();
  };

  const keyUp = ({ keyCode }: { keyCode: number }) => {
    if (!gameOver && isGameStarted && clearingRows.length === 0) {
      if (keyCode === 40) {
        setDropTime(Math.max(100, 1000 - (level + 1) * 100));
      }
    }
  };

  useInterval(() => {
    drop();
  }, dropTime);

  // コンポーネントマウント時にフォーカスを当てる（キー操作を受け付けるため）
  useEffect(() => {
    gameAreaRef.current?.focus();
  }, []);

  const focusGame = () => {
    gameAreaRef.current?.focus();
  };

  return (
    <div
      className="min-h-screen bg-gray-900 flex flex-col items-center justify-center p-4 outline-none touch-none"
      role="button"
      tabIndex={0}
      onKeyDown={move}
      onKeyUp={keyUp}
      ref={gameAreaRef}
      onClick={focusGame}
    >
      <div className="w-full flex flex-col lg:flex-row gap-8 items-start justify-center">
        
        {/* Left Column: High Scores & Hold (Desktop) */}
        <div className="hidden lg:flex flex-col gap-4 w-64 order-2 lg:order-1">
           {/* Hold Block */}
           <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-lg mb-2">
             <NextBlock type={holdTetromino} label="HOLD" disabled={!canHold} />
             <p className="text-gray-500 text-[10px] text-center mt-2">SHIFT KEY</p>
           </div>

           <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-lg">
             <h2 className="text-xl font-bold text-center text-yellow-500 mb-4 font-pixel flex items-center justify-center gap-2">
               <Crown size={20} />
               RANKING
             </h2>
             <div className="space-y-2">
               {highScores.length === 0 ? (
                 <p className="text-gray-500 text-center text-xs py-4">NO RECORDS</p>
               ) : (
                 highScores.map((s, i) => (
                   <div key={i} className="flex items-center justify-between bg-gray-900 p-2 rounded border border-gray-700">
                     <div className="flex items-center gap-2">
                       {i === 0 && <Crown size={16} className="text-yellow-400" fill="currentColor" />}
                       {i === 1 && <Crown size={16} className="text-gray-300" fill="currentColor" />}
                       {i === 2 && <Crown size={16} className="text-orange-400" fill="currentColor" />}
                       <span className={`font-pixel text-xs ${i < 3 ? 'text-white' : 'text-gray-400'}`}>
                         {i + 1}.
                       </span>
                     </div>
                     <span className="text-white font-mono">{s}</span>
                   </div>
                 ))
               )}
             </div>
           </div>
        </div>

        {/* Center Column: Game Board */}
        <div className="relative border-4 border-gray-700 rounded-lg p-1 bg-gray-800 shadow-2xl mx-auto lg:mx-0 order-1 lg:order-2">
          <div 
            className="grid grid-cols-10 gap-px bg-gray-900"
            style={{ width: '250px', height: '500px' }}
          >
            {stage.map((row, y) =>
              row.map((cell, x) => (
                <Cell 
                  key={`${y}-${x}`} 
                  type={cell[0]} 
                  isFlashing={clearingRows.includes(y)}
                />
              ))
            )}
          </div>

          {/* Game Over Overlay */}
          {gameOver && (
            <div className="absolute inset-0 bg-black/80 flex flex-col items-center justify-center z-10 text-white font-pixel">
              <p className="text-red-500 text-xl mb-4">GAME OVER</p>
              <div className="text-center mb-6">
                 <p className="text-gray-400 text-xs">YOUR SCORE</p>
                 <p className="text-2xl text-yellow-400">{score}</p>
              </div>
              <button 
                onClick={resetGame}
                className="px-4 py-2 bg-white text-black text-xs hover:bg-gray-200 transition"
              >
                TRY AGAIN
              </button>
              <p className="text-gray-500 text-[10px] mt-4 animate-pulse">PRESS SPACE TO RETRY</p>
            </div>
          )}

           {/* Start Overlay */}
           {!isGameStarted && !gameOver && (
             <div className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center z-10">
                <button 
                  onClick={resetGame}
                  className="px-6 py-3 bg-green-500 text-white font-bold font-pixel rounded hover:bg-green-600 animate-pulse"
                >
                  START
                </button>
                <p className="text-gray-300 text-xs mt-4 font-pixel">PRESS SPACE TO START</p>
             </div>
           )}
        </div>

        {/* Right Column: Stats & Controls */}
        <div className="flex flex-col gap-6 w-full md:w-64 order-3">
          <div className="bg-gray-800 p-4 rounded-lg border border-gray-700 shadow-lg">
             <h1 className="text-3xl font-bold text-center bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-600 mb-6 font-pixel">
              TETRIS
            </h1>
            
            {/* Mobile Layout: Next and Hold side by side */}
            <div className="flex lg:block gap-2 mb-6 justify-center">
                <div className="flex-1 lg:w-full">
                    <NextBlock type={nextTetromino} label="NEXT" />
                </div>
                <div className="flex-1 lg:hidden">
                    <NextBlock type={holdTetromino} label="HOLD" disabled={!canHold} />
                </div>
            </div>

            <div className="space-y-4">
              <div className="bg-gray-900 p-3 rounded border border-gray-700">
                <p className="text-gray-400 text-xs mb-1 font-pixel">SCORE</p>
                <p className="text-white text-xl font-mono">{score}</p>
              </div>
              <div className="bg-gray-900 p-3 rounded border border-gray-700">
                <p className="text-gray-400 text-xs mb-1 font-pixel">LEVEL</p>
                <p className="text-white text-xl font-mono">{level}</p>
              </div>
              <div className="bg-gray-900 p-3 rounded border border-gray-700">
                <p className="text-gray-400 text-xs mb-1 font-pixel">ROWS</p>
                <p className="text-white text-xl font-mono">{rowsCleared}</p>
              </div>
            </div>
          </div>

          <div className="hidden md:block text-gray-400 text-sm space-y-2 bg-gray-800 p-4 rounded-lg border border-gray-700">
            <p className="flex items-center gap-2"><span className="border p-1 rounded min-w-[24px] text-center">←</span> Move Left</p>
            <p className="flex items-center gap-2"><span className="border p-1 rounded min-w-[24px] text-center">→</span> Move Right</p>
            <p className="flex items-center gap-2"><span className="border p-1 rounded min-w-[24px] text-center">↑</span> Rotate</p>
            <p className="flex items-center gap-2"><span className="border p-1 rounded min-w-[24px] text-center">↓</span> Drop</p>
            <p className="flex items-center gap-2"><span className="border p-1 rounded min-w-[60px] text-center text-xs">SHIFT</span> Hold</p>
            <p className="flex items-center gap-2"><span className="border p-1 rounded min-w-[60px] text-center text-xs">SPACE</span> Start</p>
          </div>

          {/* Mobile Controls */}
          <div className="md:hidden grid grid-cols-3 gap-2 w-full max-w-[250px] mx-auto mt-4">
             {/* Hold Button Top Left */}
             <div className="col-start-1">
                 <button 
                  className={`w-full h-14 bg-gray-700 rounded-lg flex items-center justify-center active:bg-gray-600 shadow-lg ${!canHold ? 'opacity-50' : ''}`}
                  onClick={hold}
                  disabled={!canHold}
                >
                  <Download size={24} className="rotate-180" /> {/* Simulating a 'put in pocket' icon */}
                </button>
             </div>
             
             <div className="col-start-2">
                <button 
                  className="w-full h-14 bg-gray-700 rounded-lg flex items-center justify-center active:bg-gray-600 shadow-lg"
                  onClick={() => playerRotate(stage, 1)}
                >
                  <RotateCw size={24} />
                </button>
             </div>
             <div className="col-start-1 row-start-2">
                <button 
                  className="w-full h-14 bg-gray-700 rounded-lg flex items-center justify-center active:bg-gray-600 shadow-lg"
                  onClick={() => movePlayer(-1)}
                >
                  <ArrowLeft size={24} />
                </button>
             </div>
             <div className="col-start-2 row-start-2">
                <button 
                  className="w-full h-14 bg-gray-700 rounded-lg flex items-center justify-center active:bg-gray-600 shadow-lg"
                  onTouchStart={dropPlayer}
                  onMouseDown={dropPlayer}
                  onTouchEnd={() => setDropTime(Math.max(100, 1000 - (level + 1) * 100))}
                  onMouseUp={() => setDropTime(Math.max(100, 1000 - (level + 1) * 100))}
                >
                  <ArrowDown size={24} />
                </button>
             </div>
             <div className="col-start-3 row-start-2">
                <button 
                  className="w-full h-14 bg-gray-700 rounded-lg flex items-center justify-center active:bg-gray-600 shadow-lg"
                  onClick={() => movePlayer(1)}
                >
                  <ArrowRight size={24} />
                </button>
             </div>
          </div>
          
           <button 
              onClick={resetGame}
              className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 rounded-lg font-bold text-white shadow-lg flex items-center justify-center gap-2 transition"
            >
              <RefreshCw size={18} />
              RESTART
            </button>
        </div>
      </div>
    </div>
  );
};

export default App;