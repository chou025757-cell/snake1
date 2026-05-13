export type Point = {
  x: number;
  y: number;
};

export type Velocity = {
  dx: number;
  dy: number;
};

export interface Ball {
  position: Point;
  velocity: Velocity;
  radius: number;
}

export interface Paddle {
  x: number;
  width: number;
  height: number;
}

export interface Brick {
  x: number;
  y: number;
  width: number;
  height: number;
  visible: boolean;
  color: string;
}

export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  WON = 'WON',
  GAMEOVER = 'GAMEOVER',
}
