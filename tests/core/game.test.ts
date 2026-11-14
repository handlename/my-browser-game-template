import { describe, expect, it } from 'vitest';
import { createGame, stepGame } from '../../src/core/game';

describe('core/game', () => {
  it('creates initial game state with zero elapsed time', () => {
    const state = createGame();
    expect(state.elapsedSeconds).toBe(0);
    expect(state.tickCount).toBe(0);
    expect(state.isGameOver).toBe(false);
  });

  it('steps game state forward immutably', () => {
    const initial = createGame();
    const dt = 1 / 60;
    const next = stepGame(initial, dt);

    expect(next).not.toBe(initial);
    expect(next.elapsedSeconds).toBeCloseTo(1 / 60);
    expect(next.tickCount).toBe(1);
    expect(initial.tickCount).toBe(0);
  });

  it('does not advance elapsed time or ticks when game is over', () => {
    const gameOverState = {
      elapsedSeconds: 10,
      tickCount: 600,
      isGameOver: true,
    };
    const next = stepGame(gameOverState, 1 / 60);
    expect(next).toBe(gameOverState);
    expect(next.elapsedSeconds).toBe(10);
    expect(next.tickCount).toBe(600);
  });
});
