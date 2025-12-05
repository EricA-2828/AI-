// テトリミノの形状定義 (0 is empty)
export type TetrominoType = 0 | 'I' | 'J' | 'L' | 'O' | 'S' | 'T' | 'Z';

// テトリミノの設定データ構造
export interface ITetromino {
  shape: (TetrominoType | 0)[][];
  color: string;
}

// プレイヤー（操作中のブロック）の状態
export interface Player {
  pos: { x: number; y: number }; // 位置
  tetromino: (TetrominoType | 0)[][]; // 現在の形状配列
  collided: boolean; // 接地したかどうか
  type: TetrominoType; // 現在のテトリミノの種類
}

// ステージ（盤面）のセルデータ: [タイプ, 状態(clear/merged)]
export type CellData = [TetrominoType, string];

// ステージ全体の2次元配列
export type StageData = CellData[][];