// テトリミノの形状定義と色
const TETROMINO_SHAPES = {
  I: {
    shapes: [
      [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0],
        [0, 0, 0, 0]
      ],
      [
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0],
        [0, 0, 1, 0]
      ],
      [
        [0, 0, 0, 0],
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0, 0, 0, 0]
      ],
      [
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]
      ]
    ],
    color: '#00f0f0' // シアン
  },
  O: {
    shapes: [
      [
        [1, 1],
        [1, 1]
      ],
      [
        [1, 1],
        [1, 1]
      ],
      [
        [1, 1],
        [1, 1]
      ],
      [
        [1, 1],
        [1, 1]
      ]
    ],
    color: '#f0f000' // 黄色
  },
  T: {
    shapes: [
      [
        [0, 1, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 1, 0]
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 1, 0]
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [0, 1, 0]
      ]
    ],
    color: '#a000f0' // 紫
  },
  S: {
    shapes: [
      [
        [0, 1, 1],
        [1, 1, 0],
        [0, 0, 0]
      ],
      [
        [0, 1, 0],
        [0, 1, 1],
        [0, 0, 1]
      ],
      [
        [0, 0, 0],
        [0, 1, 1],
        [1, 1, 0]
      ],
      [
        [1, 0, 0],
        [1, 1, 0],
        [0, 1, 0]
      ]
    ],
    color: '#00f000' // 緑
  },
  Z: {
    shapes: [
      [
        [1, 1, 0],
        [0, 1, 1],
        [0, 0, 0]
      ],
      [
        [0, 0, 1],
        [0, 1, 1],
        [0, 1, 0]
      ],
      [
        [0, 0, 0],
        [1, 1, 0],
        [0, 1, 1]
      ],
      [
        [0, 1, 0],
        [1, 1, 0],
        [1, 0, 0]
      ]
    ],
    color: '#f00000' // 赤
  },
  J: {
    shapes: [
      [
        [1, 0, 0],
        [1, 1, 1],
        [0, 0, 0]
      ],
      [
        [0, 1, 1],
        [0, 1, 0],
        [0, 1, 0]
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [0, 0, 1]
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [1, 1, 0]
      ]
    ],
    color: '#0000f0' // 青
  },
  L: {
    shapes: [
      [
        [0, 0, 1],
        [1, 1, 1],
        [0, 0, 0]
      ],
      [
        [0, 1, 0],
        [0, 1, 0],
        [0, 1, 1]
      ],
      [
        [0, 0, 0],
        [1, 1, 1],
        [1, 0, 0]
      ],
      [
        [1, 1, 0],
        [0, 1, 0],
        [0, 1, 0]
      ]
    ],
    color: '#f0a000' // オレンジ
  }
};

/**
 * Tetrominoクラス
 * テトリミノ（ブロック）の形状、色、位置、回転状態を管理
 */
class Tetromino {
  /**
   * @param {string} type - テトリミノの種類 (I, O, T, S, Z, J, L)
   */
  constructor(type) {
    if (!TETROMINO_SHAPES[type]) {
      throw new Error(`Invalid tetromino type: ${type}`);
    }

    this.type = type;
    this.shapes = TETROMINO_SHAPES[type].shapes;
    this.color = TETROMINO_SHAPES[type].color;
    this.rotationIndex = 0;
    this.x = 0;
    this.y = 0;
  }

  /**
   * テトリミノを時計回りに90度回転
   */
  rotate() {
    this.rotationIndex = (this.rotationIndex + 1) % 4;
  }

  /**
   * 回転を1つ前の状態に戻す
   */
  unrotate() {
    this.rotationIndex = (this.rotationIndex + 3) % 4;
  }

  /**
   * 現在の回転状態の形状を取得
   * @returns {number[][]} 2次元配列の形状データ
   */
  getShape() {
    return this.shapes[this.rotationIndex];
  }

  /**
   * テトリミノの複製を作成（ネクスト表示用）
   * @returns {Tetromino} 新しいTetrominoインスタンス
   */
  clone() {
    const cloned = new Tetromino(this.type);
    cloned.rotationIndex = this.rotationIndex;
    cloned.x = this.x;
    cloned.y = this.y;
    return cloned;
  }
}

// エクスポート
export { Tetromino, TETROMINO_SHAPES };
