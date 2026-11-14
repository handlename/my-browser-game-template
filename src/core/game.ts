import type { GameState } from './types';

export function createGame(): GameState {
  return Object.freeze({
    elapsedSeconds: 0,
    tickCount: 0,
    isGameOver: false,
  });
}

export function stepGame(state: GameState, dtSeconds: number): GameState {
  if (state.isGameOver) {
    return state;
  }

  return Object.freeze({
    ...state,
    elapsedSeconds: state.elapsedSeconds + dtSeconds,
    tickCount: state.tickCount + 1,
  });
}
