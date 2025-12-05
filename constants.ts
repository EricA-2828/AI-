import { ITetromino, TetrominoType } from './types';

// ステージのサイズ
export const STAGE_WIDTH = 10;
export const STAGE_HEIGHT = 20;

// テトリミノの定義
// 各キーはブロックの種類を表し、shapeは回転行列、colorはTailwindの色クラスまたはCSS色
export const TETROMINOS: Record<string, ITetromino> = {
  0: { shape: [[0]], color: '0, 0, 0' },
  I: {
    shape: [
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
      [0, 'I', 0, 0],
    ],
    color: '80, 227, 194', // Cyan
  },
  J: {
    shape: [
      [0, 'J', 0],
      [0, 'J', 0],
      ['J', 'J', 0],
    ],
    color: '59, 130, 246', // Blue
  },
  L: {
    shape: [
      [0, 'L', 0],
      [0, 'L', 0],
      [0, 'L', 'L'],
    ],
    color: '249, 115, 22', // Orange
  },
  O: {
    shape: [
      ['O', 'O'],
      ['O', 'O'],
    ],
    color: '250, 204, 21', // Yellow
  },
  S: {
    shape: [
      [0, 'S', 'S'],
      ['S', 'S', 0],
      [0, 0, 0],
    ],
    color: '74, 222, 128', // Green
  },
  T: {
    shape: [
      [0, 0, 0],
      ['T', 'T', 'T'],
      [0, 'T', 0],
    ],
    color: '168, 85, 247', // Purple
  },
  Z: {
    shape: [
      ['Z', 'Z', 0],
      [0, 'Z', 'Z'],
      [0, 0, 0],
    ],
    color: '239, 68, 68', // Red
  },
};

// ランダムなテトリミノを生成する関数
export const randomTetromino = (): { type: TetrominoType; shape: (TetrominoType | 0)[][] } => {
  const tetrominos = 'IJLOSTZ';
  const randTetromino = tetrominos[Math.floor(Math.random() * tetrominos.length)] as TetrominoType;
  return {
    type: randTetromino,
    shape: TETROMINOS[randTetromino].shape,
  };
};
