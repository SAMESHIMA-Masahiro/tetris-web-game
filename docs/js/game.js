import { Tetromino } from './tetromino.js';

// ゲーム状態定数
const GAME_STATES = {
  START: 'start',
  PLAYING: 'playing',
  PAUSED: 'paused',
  GAMEOVER: 'gameover'
};

// スコアテーブル
const SCORE_TABLE = {
  1: 100,   // 1ライン
  2: 300,   // 2ライン
  3: 500,   // 3ライン
  4: 800    // 4ライン（テトリス）
};

// レベルごとの落下速度（ミリ秒）
const DROP_SPEEDS = [
  1000, // Level 1
  900,  // Level 2
  800,  // Level 3
  700,  // Level 4
  600,  // Level 5
  500,  // Level 6
  400,  // Level 7
  300,  // Level 8
  200,  // Level 9
  100   // Level 10+
];

const LINES_PER_LEVEL = 10; // 10ライン消去ごとにレベルアップ

/**
 * Gameクラス
 * ゲームロジック全体の管理、状態更新、スコアリング
 */
class Game {
  /**
   * @param {Board} board - ゲームボードインスタンス
   */
  constructor(board) {
    this.board = board;
    this.currentTetromino = null;
    this.nextTetromino = null;
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.gameState = GAME_STATES.START;
    this.dropCounter = 0;
    this.dropInterval = DROP_SPEEDS[0];
  }

  /**
   * ゲームを開始
   */
  start() {
    this.reset();
    this.gameState = GAME_STATES.PLAYING;
    this.nextTetromino = this.createRandomTetromino();
    this.spawnTetromino();
  }

  /**
   * ゲームをリセット
   */
  reset() {
    this.board.reset();
    this.score = 0;
    this.level = 1;
    this.lines = 0;
    this.dropCounter = 0;
    this.dropInterval = DROP_SPEEDS[0];
    this.currentTetromino = null;
    this.nextTetromino = null;
  }

  /**
   * 一時停止/再開
   */
  pause() {
    if (this.gameState === GAME_STATES.PLAYING) {
      this.gameState = GAME_STATES.PAUSED;
    } else if (this.gameState === GAME_STATES.PAUSED) {
      this.gameState = GAME_STATES.PLAYING;
    }
  }

  /**
   * ゲーム状態を更新
   * @param {number} deltaTime - 前フレームからの経過時間（ミリ秒）
   */
  update(deltaTime) {
    if (this.gameState !== GAME_STATES.PLAYING) {
      return;
    }

    // 自動落下処理
    this.dropCounter += deltaTime;
    if (this.dropCounter > this.dropInterval) {
      this.drop();
      this.dropCounter = 0;
    }
  }

  /**
   * テトリミノを1マス下に移動
   */
  drop() {
    if (!this.currentTetromino) return;

    if (this.board.isValidMove(this.currentTetromino,
        this.currentTetromino.x, this.currentTetromino.y + 1)) {
      this.currentTetromino.y++;
    } else {
      this.lockTetromino();
    }
  }

  /**
   * テトリミノを左に移動
   */
  moveLeft() {
    if (!this.currentTetromino || this.gameState !== GAME_STATES.PLAYING) return;

    if (this.board.isValidMove(this.currentTetromino,
        this.currentTetromino.x - 1, this.currentTetromino.y)) {
      this.currentTetromino.x--;
    }
  }

  /**
   * テトリミノを右に移動
   */
  moveRight() {
    if (!this.currentTetromino || this.gameState !== GAME_STATES.PLAYING) return;

    if (this.board.isValidMove(this.currentTetromino,
        this.currentTetromino.x + 1, this.currentTetromino.y)) {
      this.currentTetromino.x++;
    }
  }

  /**
   * テトリミノを回転（Wall Kick対応）
   */
  rotate() {
    if (!this.currentTetromino || this.gameState !== GAME_STATES.PLAYING) return;

    const originalRotation = this.currentTetromino.rotationIndex;
    this.currentTetromino.rotate();

    // 基本的な回転が可能かチェック
    if (this.board.isValidMove(this.currentTetromino,
        this.currentTetromino.x, this.currentTetromino.y)) {
      return; // 成功
    }

    // Wall Kickを試行
    const wallKickOffsets = this.getWallKickOffsets(
      this.currentTetromino.type,
      originalRotation
    );

    for (const [offsetX, offsetY] of wallKickOffsets) {
      if (this.board.isValidMove(this.currentTetromino,
          this.currentTetromino.x + offsetX,
          this.currentTetromino.y + offsetY)) {
        this.currentTetromino.x += offsetX;
        this.currentTetromino.y += offsetY;
        return; // Wall Kick成功
      }
    }

    // すべて失敗したら回転を戻す
    this.currentTetromino.rotationIndex = originalRotation;
  }

  /**
   * Wall Kickオフセットを取得
   * @param {string} type - テトリミノの種類
   * @param {number} fromRotation - 回転前のインデックス
   * @returns {number[][]} オフセット配列 [[x, y], ...]
   */
  getWallKickOffsets(type, fromRotation) {
    // 簡易版Wall Kick（I型は特別扱い）
    if (type === 'I') {
      return [[1, 0], [-1, 0], [2, 0], [-2, 0], [0, -1]];
    }
    return [[1, 0], [-1, 0], [0, -1]];
  }

  /**
   * ハードドロップ（一気に落下）
   */
  hardDrop() {
    if (!this.currentTetromino || this.gameState !== GAME_STATES.PLAYING) return;

    while (this.board.isValidMove(this.currentTetromino,
        this.currentTetromino.x, this.currentTetromino.y + 1)) {
      this.currentTetromino.y++;
    }

    this.lockTetromino();
  }

  /**
   * テトリミノを固定してライン消去チェック
   */
  lockTetromino() {
    if (!this.currentTetromino) return;

    // テトリミノをボードに固定
    this.board.merge(this.currentTetromino);

    // ライン消去
    const linesCleared = this.board.clearLines();

    if (linesCleared > 0) {
      this.updateScore(linesCleared);
      this.lines += linesCleared;
      this.updateLevel();
    }

    // 次のテトリミノを生成
    this.spawnTetromino();

    // ゲームオーバーチェック
    if (this.board.isGameOver()) {
      this.gameOver();
    }
  }

  /**
   * 新しいテトリミノを生成
   */
  spawnTetromino() {
    this.currentTetromino = this.nextTetromino || this.createRandomTetromino();
    this.nextTetromino = this.createRandomTetromino();

    // スポーン位置（中央上部）
    const shape = this.currentTetromino.getShape();
    this.currentTetromino.x = Math.floor((this.board.width - shape[0].length) / 2);
    this.currentTetromino.y = 0;

    // スポーン直後に衝突する場合はゲームオーバー
    if (!this.board.isValidMove(this.currentTetromino,
        this.currentTetromino.x, this.currentTetromino.y)) {
      this.gameOver();
    }
  }

  /**
   * ランダムなテトリミノを作成
   * @returns {Tetromino}
   */
  createRandomTetromino() {
    const types = ['I', 'O', 'T', 'S', 'Z', 'J', 'L'];
    const randomType = types[Math.floor(Math.random() * types.length)];
    return new Tetromino(randomType);
  }

  /**
   * スコアを更新
   * @param {number} linesCleared - 消去したライン数
   */
  updateScore(linesCleared) {
    if (SCORE_TABLE[linesCleared]) {
      this.score += SCORE_TABLE[linesCleared] * this.level;
    }
  }

  /**
   * レベルを更新
   */
  updateLevel() {
    const newLevel = Math.floor(this.lines / LINES_PER_LEVEL) + 1;
    if (newLevel !== this.level) {
      this.level = newLevel;
      // 落下速度を更新
      const speedIndex = Math.min(newLevel - 1, DROP_SPEEDS.length - 1);
      this.dropInterval = DROP_SPEEDS[speedIndex];
    }
  }

  /**
   * ゲームオーバー処理
   */
  gameOver() {
    this.gameState = GAME_STATES.GAMEOVER;
  }
}

// エクスポート
export { Game, GAME_STATES };
