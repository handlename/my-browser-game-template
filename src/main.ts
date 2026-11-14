import { SCREEN } from './core/types';
import { createGame, stepGame } from './core/game';
import { renderGame } from './shell/renderer';

const canvas = document.querySelector<HTMLCanvasElement>('#game-canvas');
if (!canvas) {
  throw new Error('Canvas element #game-canvas not found');
}

const ctx = canvas.getContext('2d');
if (!ctx) {
  throw new Error('Could not get 2D rendering context');
}

// Fit canvas to display while maintaining 9:16 aspect ratio
function resizeCanvas(): void {
  if (!canvas) return;

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;

  const targetAspect = SCREEN.width / SCREEN.height;
  const windowAspect = windowWidth / windowHeight;

  let displayWidth: number;
  let displayHeight: number;

  if (windowAspect < targetAspect) {
    displayWidth = windowWidth;
    displayHeight = windowWidth / targetAspect;
  } else {
    displayHeight = windowHeight;
    displayWidth = windowHeight * targetAspect;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  canvas.width = SCREEN.width * dpr;
  canvas.height = SCREEN.height * dpr;
  canvas.style.width = `${displayWidth}px`;
  canvas.style.height = `${displayHeight}px`;

  ctx?.scale(dpr, dpr);
}

window.addEventListener('resize', resizeCanvas);
resizeCanvas();

let state = createGame();
let lastTimestamp = performance.now();

function loop(currentTimestamp: number): void {
  const dtSeconds = Math.min((currentTimestamp - lastTimestamp) / 1000, 0.1);
  lastTimestamp = currentTimestamp;

  state = stepGame(state, dtSeconds);

  if (ctx) {
    renderGame(ctx, state, __APP_VERSION__);
  }

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
