'use client';

import { useState, useEffect, useRef } from 'react';
import styles from './SnakeGame.module.css';

type Position = {
  x: number;
  y: number;
};

type Direction = 'UP' | 'DOWN' | 'LEFT' | 'RIGHT';

const GRID_SIZE = 20;
const GAME_SPEED = 100;

export default function SnakeGame() {
  const [snake, setSnake] = useState<Position[]>([{ x: 10, y: 10 }]);
  const [food, setFood] = useState<Position>({ x: 15, y: 15 });
  const [direction, setDirection] = useState<Direction>('RIGHT');
  const [nextDirection, setNextDirection] = useState<Direction>('RIGHT');
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);

  // Browser-safe timer type
  const gameLoopRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Spawn food
  const spawnFood = (snakeBody: Position[]) => {
    while (true) {
      const newFood: Position = {
        x: Math.floor(Math.random() * GRID_SIZE),
        y: Math.floor(Math.random() * GRID_SIZE),
      };

      const occupied = snakeBody.some(
        (segment) =>
          segment.x === newFood.x && segment.y === newFood.y
      );

      if (!occupied) {
        setFood(newFood);
        return;
      }
    }
  };

  // Keyboard controls
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!isPlaying) return;

      switch (e.key) {
        case 'ArrowUp':
        case 'w':
        case 'W':
          if (direction !== 'DOWN') setNextDirection('UP');
          e.preventDefault();
          break;

        case 'ArrowDown':
        case 's':
        case 'S':
          if (direction !== 'UP') setNextDirection('DOWN');
          e.preventDefault();
          break;

        case 'ArrowLeft':
        case 'a':
        case 'A':
          if (direction !== 'RIGHT') setNextDirection('LEFT');
          e.preventDefault();
          break;

        case 'ArrowRight':
        case 'd':
        case 'D':
          if (direction !== 'LEFT') setNextDirection('RIGHT');
          e.preventDefault();
          break;
      }
    };

    window.addEventListener('keydown', handleKeyPress);

    return () => {
      window.removeEventListener('keydown', handleKeyPress);
    };
  }, [direction, isPlaying]);

  // Game loop
  useEffect(() => {
    if (!isPlaying) return;

    gameLoopRef.current = setInterval(() => {
      setSnake((prevSnake) => {
        const newSnake = [...prevSnake];
        const head = { ...newSnake[0] };

        setDirection(nextDirection);

        switch (nextDirection) {
          case 'UP':
            head.y = (head.y - 1 + GRID_SIZE) % GRID_SIZE;
            break;

          case 'DOWN':
            head.y = (head.y + 1) % GRID_SIZE;
            break;

          case 'LEFT':
            head.x = (head.x - 1 + GRID_SIZE) % GRID_SIZE;
            break;

          case 'RIGHT':
            head.x = (head.x + 1) % GRID_SIZE;
            break;
        }

        newSnake.unshift(head);

        // Self collision
        if (
          newSnake
            .slice(1)
            .some(
              (segment) =>
                segment.x === head.x &&
                segment.y === head.y
            )
        ) {
          setGameOver(true);
          setIsPlaying(false);
          return prevSnake;
        }

        // Food collision
        if (head.x === food.x && head.y === food.y) {
          setScore((prev) => prev + 10);
          spawnFood(newSnake);
        } else {
          newSnake.pop();
        }

        return newSnake;
      });
    }, GAME_SPEED);

    return () => {
      if (gameLoopRef.current !== null) {
        clearInterval(gameLoopRef.current);
        gameLoopRef.current = null;
      }
    };
  }, [isPlaying, nextDirection, food]);

  const handleStart = () => {
    setGameOver(false);
    setScore(0);

    const initialSnake = [{ x: 10, y: 10 }];

    setSnake(initialSnake);
    setDirection('RIGHT');
    setNextDirection('RIGHT');
    spawnFood(initialSnake);
    setIsPlaying(true);
  };

  const handlePause = () => {
    setIsPlaying((prev) => !prev);
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Snake Game</h1>

      <div className={styles.info}>
        <div className={styles.score}>Score: {score}</div>

        <div className={styles.status}>
          {gameOver ? (
            <span className={styles.gameOver}>Game Over!</span>
          ) : isPlaying ? (
            <span className={styles.playing}>Playing...</span>
          ) : (
            <span className={styles.paused}>Ready to Play</span>
          )}
        </div>
      </div>

      <div className={styles.gameBoard}>
        {Array.from({ length: GRID_SIZE }).map((_, y) =>
          Array.from({ length: GRID_SIZE }).map((_, x) => {
            const isSnake = snake.some(
              (segment) =>
                segment.x === x &&
                segment.y === y
            );

            const isHead =
              snake[0].x === x &&
              snake[0].y === y;

            const isFood =
              food.x === x &&
              food.y === y;

            return (
              <div
                key={`${x}-${y}`}
                className={`${styles.cell}
                ${isSnake ? styles.snake : ''}
                ${isHead ? styles.head : ''}
                ${isFood ? styles.food : ''}`}
              />
            );
          })
        )}
      </div>

      <div className={styles.controls}>
        <button
          onClick={handleStart}
          disabled={isPlaying}
          className={styles.button}
        >
          {gameOver ? 'Restart' : 'Start'}
        </button>

        <button
          onClick={handlePause}
          disabled={!isPlaying && !gameOver}
          className={styles.button}
        >
          {isPlaying ? 'Pause' : 'Resume'}
        </button>
      </div>

      <div className={styles.instructions}>
        <h2>How to Play</h2>

        <ul>
          <li>Use Arrow Keys or WASD.</li>
          <li>Eat food to increase score.</li>
          <li>Don't hit yourself.</li>
          <li>Click Start to begin.</li>
        </ul>
      </div>
    </div>
  );
}