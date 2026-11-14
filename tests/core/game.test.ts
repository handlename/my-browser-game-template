import { describe, expect, it } from 'vitest';
import { createGame, setPaused, stepGame } from '../../src/core/game';

describe('core/game', () => {
  it('creates initial game state with zero elapsed time', () => {
    const state = createGame();
    expect(state.elapsedSeconds).toBe(0);
    expect(state.tickCount).toBe(0);
    expect(state.isGameOver).toBe(false);
    expect(state.isPaused).toBe(false);
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
      isPaused: false,
    };
    const next = stepGame(gameOverState, 1 / 60);
    expect(next).toBe(gameOverState);
    expect(next.elapsedSeconds).toBe(10);
    expect(next.tickCount).toBe(600);
  });

  it('does not advance elapsed time or ticks while paused and resumes when unpaused', () => {
    const initial = createGame();
    const paused = setPaused(initial, true);

    expect(paused).not.toBe(initial);
    expect(paused.isPaused).toBe(true);
    expect(setPaused(paused, true)).toBe(paused);

    const duringPause = stepGame(paused, 1 / 60);
    expect(duringPause).toBe(paused);
    expect(duringPause.elapsedSeconds).toBe(0);
    expect(duringPause.tickCount).toBe(0);

    const resumed = setPaused(duringPause, false);
    expect(resumed.isPaused).toBe(false);

    const afterResume = stepGame(resumed, 1 / 60);
    expect(afterResume.elapsedSeconds).toBeCloseTo(1 / 60);
    expect(afterResume.tickCount).toBe(1);
  });
});
