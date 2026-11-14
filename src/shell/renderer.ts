import { SCREEN, type GameState } from '../core/types';

export function renderGame(
  ctx: CanvasRenderingContext2D,
  state: GameState,
  version: string,
): void {
  // Clear background
  ctx.fillStyle = '#0f172a';
  ctx.fillRect(0, 0, SCREEN.width, SCREEN.height);

  // Version overlay (top-left HUD)
  ctx.fillStyle = '#94a3b8';
  ctx.font = '12px monospace';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText(`v${version}`, 12, 12);

  // Center template placeholder text
  ctx.fillStyle = '#f8fafc';
  ctx.font = 'bold 20px system-ui, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('Browser Game Template', SCREEN.width / 2, SCREEN.height / 2 - 20);

  ctx.fillStyle = '#64748b';
  ctx.font = '14px system-ui, sans-serif';
  ctx.fillText(
    `Elapsed: ${state.elapsedSeconds.toFixed(1)}s (Ticks: ${state.tickCount})`,
    SCREEN.width / 2,
    SCREEN.height / 2 + 16,
  );
}
