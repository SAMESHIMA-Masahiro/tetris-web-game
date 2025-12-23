/**
 * Boardクラス
 * ゲームフィールドの状態管理、衝突検出、ライン消去を担当
 */
class Board {
  /**
   * @param {number} width - ボードの幅（デフォルト: 10）
   * @param {number} height - ボードの高さ（デフォルト: 20）
   */
  constructor(width = 10, height = 20) {
    this.width = width;
    this.height = height;
    this.cellSize = 30; // 各セルの描画サイズ（ピクセル）
    this.grid = this.createEmptyGrid();
  }

  /**
   * 空のグリッドを作成
   * @returns {number[][]} 空の2次元配列
   */
  createEmptyGrid() {
    return Array.from({ length: this.height }, () =>
      Array(this.width).fill(0)
    );
  }

  /**
   * ボードをリセット
   */
  reset() {
    this.grid = this.createEmptyGrid();
  }

  /**
   * テトリミノが指定位置に移動可能かチェック
   * @param {Tetromino} tetromino - チェックするテトリミノ
   * @param {number} newX - 新しいX座標
   * @param {number} newY - 新しいY座標
   * @returns {boolean} 移動可能ならtrue
   */
  isValidMove(tetromino, newX, newY) {
    const shape = tetromino.getShape();

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = newX + x;
          const boardY = newY + y;

          // 左右の境界チェック
          if (boardX < 0 || boardX >= this.width) {
            return false;
          }

          // 下の境界チェック
          if (boardY >= this.height) {
            return false;
          }

          // 上部のはみ出しは許可（スポーン時）
          if (boardY < 0) {
            continue;
          }

          // 既存ブロックとの衝突チェック
          if (this.grid[boardY][boardX] !== 0) {
            return false;
          }
        }
      }
    }

    return true;
  }

  /**
   * テトリミノをボードに固定
   * @param {Tetromino} tetromino - 固定するテトリミノ
   */
  merge(tetromino) {
    const shape = tetromino.getShape();

    for (let y = 0; y < shape.length; y++) {
      for (let x = 0; x < shape[y].length; x++) {
        if (shape[y][x]) {
          const boardX = tetromino.x + x;
          const boardY = tetromino.y + y;

          // ボード範囲内のみ固定
          if (boardY >= 0 && boardY < this.height &&
              boardX >= 0 && boardX < this.width) {
            this.grid[boardY][boardX] = tetromino.color;
          }
        }
      }
    }
  }

  /**
   * 完成したラインを消去
   * @returns {number} 消去したライン数
   */
  clearLines() {
    let linesCleared = 0;

    // 下から上に走査
    for (let y = this.height - 1; y >= 0; y--) {
      // ラインが完成しているかチェック
      if (this.grid[y].every(cell => cell !== 0)) {
        // ラインを削除
        this.grid.splice(y, 1);
        // 新しい空のラインを上部に追加
        this.grid.unshift(Array(this.width).fill(0));
        linesCleared++;
        y++; // 同じ行を再チェック（複数行同時消去対応）
      }
    }

    return linesCleared;
  }

  /**
   * ゲームオーバー判定
   * @returns {boolean} ゲームオーバーならtrue
   */
  isGameOver() {
    // 最上段2行にブロックがあるかチェック
    for (let y = 0; y < 2; y++) {
      for (let x = 0; x < this.width; x++) {
        if (this.grid[y][x] !== 0) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * ボードを描画
   * @param {CanvasRenderingContext2D} ctx - Canvas描画コンテキスト
   */
  draw(ctx) {
    // グリッドの描画
    for (let y = 0; y < this.height; y++) {
      for (let x = 0; x < this.width; x++) {
        const cellValue = this.grid[y][x];

        if (cellValue !== 0) {
          // ブロックを描画
          this.drawCell(ctx, x, y, cellValue);
        } else {
          // 空のセルにグリッドラインを描画
          ctx.strokeStyle = '#222';
          ctx.strokeRect(
            x * this.cellSize,
            y * this.cellSize,
            this.cellSize,
            this.cellSize
          );
        }
      }
    }
  }

  /**
   * 個別のセル（ブロック）を描画
   * @param {CanvasRenderingContext2D} ctx - Canvas描画コンテキスト
   * @param {number} x - X座標（グリッド）
   * @param {number} y - Y座標（グリッド）
   * @param {string} color - ブロックの色
   */
  drawCell(ctx, x, y, color) {
    const pixelX = x * this.cellSize;
    const pixelY = y * this.cellSize;

    // メインのブロック
    ctx.fillStyle = color;
    ctx.fillRect(pixelX, pixelY, this.cellSize, this.cellSize);

    // ハイライト（左上）
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.fillRect(pixelX + 1, pixelY + 1, this.cellSize - 2, 3);
    ctx.fillRect(pixelX + 1, pixelY + 1, 3, this.cellSize - 2);

    // シャドウ（右下）
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(pixelX + this.cellSize - 4, pixelY + 1, 3, this.cellSize - 1);
    ctx.fillRect(pixelX + 1, pixelY + this.cellSize - 4, this.cellSize - 1, 3);

    // ボーダー
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 1;
    ctx.strokeRect(pixelX, pixelY, this.cellSize, this.cellSize);
  }
}

// エクスポート
export { Board };
