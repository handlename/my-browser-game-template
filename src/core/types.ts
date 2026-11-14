export interface LogicalScreen {
  readonly width: number;
  readonly height: number;
}

export const SCREEN: LogicalScreen = Object.freeze({
  width: 360,
  height: 640,
});

export interface GameState {
  readonly elapsedSeconds: number;
  readonly tickCount: number;
  readonly isGameOver: boolean;
  readonly isPaused: boolean;
}
