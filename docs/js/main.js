import { Board } from './board.js';
import { Game, GAME_STATES } from './game.js';

// DOM要素
const startScreen = document.getElementById('start-screen');
const gameContainer = document.getElementById('game-container');
const gameoverScreen = document.getElementById('gameover-screen');
const pauseOverlay = document.getElementById('pause-overlay');

const startButton = document.getElementById('start-button');
const restartButton = document.getElementById('restart-button');

const mainCanvas = document.getElementById('main-canvas');
const mainCtx = mainCanvas.getContext('2d');

const nextCanvas = document.getElementById('next-canvas');
const nextCtx = nextCanvas.getContext('2d');

const scoreElement = document.getElementById('score');
const levelElement = document.getElementById('level');
const linesElement = document.getElementById('lines');
const finalScoreElement = document.getElementById('final-score');

// ゲームインスタンス
const board = new Board();
const game = new Game(board);

// ゲームループの変数
let lastTime = 0;
let animationId = null;

/**
 * ゲームを初期化して開始
 */
function initGame() {
  hideAllScreens();
  gameContainer.classList.remove('hidden');
  game.start();
  updateUI();
  startGameLoop();
}

/**
 * ゲームをリスタート
 */
function restartGame() {
  hideAllScreens();
  gameContainer.classList.remove('hidden');
  game.start();
  updateUI();
  startGameLoop();
}

/**
 * すべての画面を非表示
 */
function hideAllScreens() {
  startScreen.classList.add('hidden');
  gameContainer.classList.add('hidden');
  gameoverScreen.classList.add('hidden');
  pauseOverlay.classList.add('hidden');
}

/**
 * スタート画面を表示
 */
function showStartScreen() {
  hideAllScreens();
  startScreen.classList.remove('hidden');
}

/**
 * ゲームオーバー画面を表示
 */
function showGameOverScreen() {
  gameoverScreen.classList.remove('hidden');
  finalScoreElement.textContent = game.score;
}

/**
 * ゲームループを開始
 */
function startGameLoop() {
  lastTime = 0;
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  gameLoop(0);
}

/**
 * ゲームループ
 * @param {number} currentTime - 現在のタイムスタンプ
 */
function gameLoop(currentTime) {
  animationId = requestAnimationFrame(gameLoop);

  const deltaTime = currentTime - lastTime;
  lastTime = currentTime;

  // ゲーム状態を更新
  game.update(deltaTime);

  // ゲームオーバーチェック
  if (game.gameState === GAME_STATES.GAMEOVER) {
    cancelAnimationFrame(animationId);
    showGameOverScreen();
    return;
  }

  // 描画
  render();

  // UIを更新
  updateUI();
}

/**
 * 描画処理
 */
function render() {
  // メインキャンバスをクリア
  mainCtx.fillStyle = '#000';
  mainCtx.fillRect(0, 0, mainCanvas.width, mainCanvas.height);

  // ボードを描画
  board.draw(mainCtx);

  // 現在のテトリミノを描画
  if (game.currentTetromino && game.gameState === GAME_STATES.PLAYING) {
    drawTetromino(mainCtx, game.currentTetromino);
  }

  // ネクストブロックを描画
  if (game.nextTetromino) {
    drawNextTetromino();
  }

  // 一時停止オーバーレイの表示/非表示
  if (game.gameState === GAME_STATES.PAUSED) {
    pauseOverlay.classList.remove('hidden');
  } else {
    pauseOverlay.classList.add('hidden');
  }
}

/**
 * テトリミノを描画
 * @param {CanvasRenderingContext2D} ctx - 描画コンテキスト
 * @param {Tetromino} tetromino - 描画するテトリミノ
 */
function drawTetromino(ctx, tetromino) {
  const shape = tetromino.getShape();

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const boardX = tetromino.x + x;
        const boardY = tetromino.y + y;

        // ボード範囲内のみ描画
        if (boardY >= 0) {
          board.drawCell(ctx, boardX, boardY, tetromino.color);
        }
      }
    }
  }
}

/**
 * ネクストブロックを描画
 */
function drawNextTetromino() {
  // キャンバスをクリア
  nextCtx.fillStyle = '#000';
  nextCtx.fillRect(0, 0, nextCanvas.width, nextCanvas.height);

  if (!game.nextTetromino) return;

  const shape = game.nextTetromino.getShape();
  const cellSize = 25;

  // 中央に配置するためのオフセット計算
  const offsetX = (nextCanvas.width - shape[0].length * cellSize) / 2;
  const offsetY = (nextCanvas.height - shape.length * cellSize) / 2;

  for (let y = 0; y < shape.length; y++) {
    for (let x = 0; x < shape[y].length; x++) {
      if (shape[y][x]) {
        const pixelX = offsetX + x * cellSize;
        const pixelY = offsetY + y * cellSize;

        // メインのブロック
        nextCtx.fillStyle = game.nextTetromino.color;
        nextCtx.fillRect(pixelX, pixelY, cellSize, cellSize);

        // ハイライト
        nextCtx.fillStyle = 'rgba(255, 255, 255, 0.3)';
        nextCtx.fillRect(pixelX + 1, pixelY + 1, cellSize - 2, 2);
        nextCtx.fillRect(pixelX + 1, pixelY + 1, 2, cellSize - 2);

        // シャドウ
        nextCtx.fillStyle = 'rgba(0, 0, 0, 0.3)';
        nextCtx.fillRect(pixelX + cellSize - 3, pixelY + 1, 2, cellSize - 1);
        nextCtx.fillRect(pixelX + 1, pixelY + cellSize - 3, cellSize - 1, 2);

        // ボーダー
        nextCtx.strokeStyle = '#000';
        nextCtx.lineWidth = 1;
        nextCtx.strokeRect(pixelX, pixelY, cellSize, cellSize);
      }
    }
  }
}

/**
 * UIを更新（スコア、レベル、ライン数）
 */
function updateUI() {
  scoreElement.textContent = game.score;
  levelElement.textContent = game.level;
  linesElement.textContent = game.lines;
}

/**
 * キーボード入力処理
 * @param {KeyboardEvent} event - キーボードイベント
 */
function handleKeyDown(event) {
  if (game.gameState !== GAME_STATES.PLAYING &&
      game.gameState !== GAME_STATES.PAUSED) {
    return;
  }

  switch (event.key) {
    case 'ArrowLeft':
      event.preventDefault();
      game.moveLeft();
      render();
      break;

    case 'ArrowRight':
      event.preventDefault();
      game.moveRight();
      render();
      break;

    case 'ArrowDown':
      event.preventDefault();
      game.drop();
      game.dropCounter = 0; // ドロップカウンターをリセット
      render();
      break;

    case 'ArrowUp':
      event.preventDefault();
      game.rotate();
      render();
      break;

    case ' ':
      event.preventDefault();
      game.hardDrop();
      render();
      break;

    case 'p':
    case 'P':
      event.preventDefault();
      game.pause();
      render();
      break;
  }
}

/**
 * タッチコントロールのイベントハンドラーを設定
 */
function setupTouchControls() {
  const leftBtn = document.getElementById('left-btn');
  const rightBtn = document.getElementById('right-btn');
  const rotateBtn = document.getElementById('rotate-btn');
  const downBtn = document.getElementById('down-btn');
  const dropBtn = document.getElementById('drop-btn');
  const pauseBtn = document.getElementById('pause-btn');

  // タッチイベントとクリックイベント両方に対応
  const addButtonHandler = (button, handler) => {
    if (!button) return;

    // タッチイベント
    button.addEventListener('touchstart', (e) => {
      e.preventDefault();
      if (game.gameState === GAME_STATES.PLAYING ||
          (game.gameState === GAME_STATES.PAUSED && button === pauseBtn)) {
        handler();
      }
    });

    // クリックイベント（フォールバック）
    button.addEventListener('click', (e) => {
      e.preventDefault();
      if (game.gameState === GAME_STATES.PLAYING ||
          (game.gameState === GAME_STATES.PAUSED && button === pauseBtn)) {
        handler();
      }
    });
  };

  // 各ボタンにハンドラーを設定
  addButtonHandler(leftBtn, () => {
    game.moveLeft();
    render();
  });

  addButtonHandler(rightBtn, () => {
    game.moveRight();
    render();
  });

  addButtonHandler(rotateBtn, () => {
    game.rotate();
    render();
  });

  addButtonHandler(downBtn, () => {
    game.drop();
    game.dropCounter = 0;
    render();
  });

  addButtonHandler(dropBtn, () => {
    game.hardDrop();
    render();
  });

  addButtonHandler(pauseBtn, () => {
    game.pause();
    render();
  });
}

// イベントリスナーの設定
startButton.addEventListener('click', initGame);
restartButton.addEventListener('click', restartGame);
document.addEventListener('keydown', handleKeyDown);

// タッチコントロールを設定
setupTouchControls();

// 初期画面を表示
showStartScreen();
