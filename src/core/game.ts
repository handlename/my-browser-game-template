import type { GameState } from './types';

export function createGame(): GameState {
  return Object.freeze({
    elapsedSeconds: 0,
    tickCount: 0,
    isGameOver: false,
    isPaused: false,
  });
}

export function setPaused(state: GameState, isPaused: boolean): GameState {
  if (state.isPaused === isPaused) {
    return state;
  }

  return Object.freeze({
    ...state,
    isPaused,
  });
}

export function stepGame(state: GameState, dtSeconds: number): GameState {
  if (state.isGameOver || state.isPaused) {
    return state;
  }

  return Object.freeze({
    ...state,
    elapsedSeconds: state.elapsedSeconds + dtSeconds,
    tickCount: state.tickCount + 1,
  });
}
