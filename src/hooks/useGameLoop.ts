import React, { useEffect, useRef, useState, useCallback } from 'react';
import { GameStatus, Ball, Paddle, Brick } from '../types';
import {
  CANVAS_WIDTH,
  CANVAS_HEIGHT,
  PADDLE_WIDTH,
  PADDLE_HEIGHT,
  PADDLE_Y,
  BALL_RADIUS,
  BALL_SPEED,
  BRICK_ROWS,
  BRICK_COLS,
  BRICK_HEIGHT,
  BRICK_PADDING,
  BRICK_OFFSET_TOP,
  BRICK_OFFSET_LEFT,
  THEME,
} from '../constants';

export const useGameLoop = (canvasRef: React.RefObject<HTMLCanvasElement | null>) => {
  const [status, setStatus] = useState<GameStatus>(GameStatus.START);
  const [score, setScore] = useState(0);
  const [lives, setLives] = useState(3);

  // Use refs for mutable game state to avoid re-renders during game loop
  const paddleRef = useRef<Paddle>({
    x: (CANVAS_WIDTH - PADDLE_WIDTH) / 2,
    width: PADDLE_WIDTH,
    height: PADDLE_HEIGHT,
  });

  const ballRef = useRef<Ball>({
    position: { x: CANVAS_WIDTH / 2, y: PADDLE_Y - BALL_RADIUS },
    velocity: { dx: BALL_SPEED, dy: -BALL_SPEED },
    radius: BALL_RADIUS,
  });

  const bricksRef = useRef<Brick[]>([]);
  const requestRef = useRef<number>(0);
  const keysPressed = useRef<{ [key: string]: boolean }>({});

  // Initialize Bricks
  const initBricks = useCallback(() => {
    const bricks: Brick[] = [];
    const brickWidth = (CANVAS_WIDTH - BRICK_OFFSET_LEFT * 2 - (BRICK_COLS - 1) * BRICK_PADDING) / BRICK_COLS;
    
    for (let r = 0; r < BRICK_ROWS; r++) {
      for (let c = 0; c < BRICK_COLS; c++) {
        bricks.push({
          x: c * (brickWidth + BRICK_PADDING) + BRICK_OFFSET_LEFT,
          y: r * (BRICK_HEIGHT + BRICK_PADDING) + BRICK_OFFSET_TOP,
          width: brickWidth,
          height: BRICK_HEIGHT,
          visible: true,
          color: THEME.BRICKS[r % THEME.BRICKS.length],
        });
      }
    }
    bricksRef.current = bricks;
  }, []);

  const resetBall = useCallback(() => {
    ballRef.current = {
      position: { x: paddleRef.current.x + PADDLE_WIDTH / 2, y: PADDLE_Y - BALL_RADIUS },
      velocity: { dx: BALL_SPEED * (Math.random() > 0.5 ? 1 : -1), dy: -BALL_SPEED },
      radius: BALL_RADIUS,
    };
  }, []);

  const startGame = () => {
    initBricks();
    resetBall();
    setScore(0);
    setLives(3);
    setStatus(GameStatus.PLAYING);
  };

  const restartGame = () => {
    startGame();
  };

  // Move Paddle
  const movePaddle = () => {
    if (keysPressed.current['ArrowLeft'] || keysPressed.current['a']) {
      paddleRef.current.x = Math.max(0, paddleRef.current.x - 7);
    }
    if (keysPressed.current['ArrowRight'] || keysPressed.current['d']) {
      paddleRef.current.x = Math.min(CANVAS_WIDTH - PADDLE_WIDTH, paddleRef.current.x + 7);
    }
  };

  // Collision Detection
  const updatePhysics = () => {
    const ball = ballRef.current;
    const paddle = paddleRef.current;

    // Wall collision
    if (ball.position.x + ball.radius > CANVAS_WIDTH || ball.position.x - ball.radius < 0) {
      ball.velocity.dx = -ball.velocity.dx;
    }
    if (ball.position.y - ball.radius < 0) {
      ball.velocity.dy = -ball.velocity.dy;
    }

    // Paddle collision
    if (
      ball.position.y + ball.radius > PADDLE_Y &&
      ball.position.x > paddle.x &&
      ball.position.x < paddle.x + paddle.width
    ) {
      ball.velocity.dy = -BALL_SPEED;
      // Add angle variation based on where it hits the paddle
      const hitPoint = (ball.position.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
      ball.velocity.dx = hitPoint * BALL_SPEED;
    }

    // Brick collision
    const bricks = bricksRef.current;
    let allCleared = true;
    for (let i = 0; i < bricks.length; i++) {
      const b = bricks[i];
      if (b.visible) {
        allCleared = false;
        if (
          ball.position.x > b.x &&
          ball.position.x < b.x + b.width &&
          ball.position.y - ball.radius < b.y + b.height &&
          ball.position.y + ball.radius > b.y
        ) {
          ball.velocity.dy = -ball.velocity.dy;
          b.visible = false;
          setScore((s) => s + 10);
        }
      }
    }

    if (allCleared) {
      setStatus(GameStatus.WON);
    }

    // Move ball
    ball.position.x += ball.velocity.dx;
    ball.position.y += ball.velocity.dy;

    // Game over (ball falls bottom)
    if (ball.position.y + ball.radius > CANVAS_HEIGHT) {
      if (lives > 1) {
        setLives((l) => l - 1);
        resetBall();
      } else {
        setLives(0);
        setStatus(GameStatus.GAMEOVER);
      }
    }
  };

  // Rendering logic
  const draw = useCallback((ctx: CanvasRenderingContext2D) => {
    ctx.clearRect(0, 0, CANVAS_WIDTH, CANVAS_HEIGHT);

    // Draw Paddle
    ctx.fillStyle = THEME.PADDLE;
    ctx.fillRect(paddleRef.current.x, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    // Glow effect for paddle
    ctx.shadowBlur = 10;
    ctx.shadowColor = THEME.PADDLE;
    ctx.strokeRect(paddleRef.current.x, PADDLE_Y, PADDLE_WIDTH, PADDLE_HEIGHT);
    ctx.shadowBlur = 0;

    // Draw Ball
    ctx.beginPath();
    ctx.arc(ballRef.current.position.x, ballRef.current.position.y, ballRef.current.radius, 0, Math.PI * 2);
    ctx.fillStyle = THEME.BALL;
    ctx.fill();
    ctx.closePath();

    // Draw Bricks
    bricksRef.current.forEach((b) => {
      if (b.visible) {
        ctx.fillStyle = b.color;
        ctx.fillRect(b.x, b.y, b.width, b.height);
        // Border for bricks
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.strokeRect(b.x, b.y, b.width, b.height);
      }
    });
  }, []);

  const loop = useCallback(() => {
    if (status === GameStatus.PLAYING) {
      movePaddle();
      updatePhysics();
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) draw(ctx);
      }
    }
    requestRef.current = requestAnimationFrame(loop);
  }, [status, draw, canvasRef]);

  useEffect(() => {
    requestRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(requestRef.current);
  }, [loop]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => (keysPressed.current[e.key] = true);
    const handleKeyUp = (e: KeyboardEvent) => (keysPressed.current[e.key] = false);
    
    // Mouse movement
    const handleMouseMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (canvas) {
        const rect = canvas.getBoundingClientRect();
        const relativeX = e.clientX - rect.left;
        if (relativeX > 0 && relativeX < CANVAS_WIDTH) {
          paddleRef.current.x = relativeX - PADDLE_WIDTH / 2;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, [canvasRef]);

  return { status, score, lives, startGame, restartGame };
};
