
import React, { useState } from 'react';
import { cn } from "@/lib/utils";

type TerrainType = 'water' | 'sand';

interface Cell {
  x: number;
  y: number;
  type: TerrainType;
}

const GRID_SIZE = 30;
const WATER_PERCENTAGE = 0.2;

const IsometricGame = () => {
  const [grid, setGrid] = useState<Cell[]>(() => {
    const cells: Cell[] = [];
    const waterRows = Math.floor(GRID_SIZE * WATER_PERCENTAGE);

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        // Si on est dans les 20% inférieurs, c'est de l'eau
        const isWater = y >= GRID_SIZE - waterRows;
        cells.push({
          x,
          y,
          type: isWater ? 'water' : 'sand'
        });
      }
    }
    return cells;
  });

  return (
    <div className="w-full h-full overflow-auto p-4">
      <style>
        {`
          @keyframes waterWave {
            0%, 100% {
              background-color: #0EA5E9;
              transform: translateY(0);
            }
            50% {
              background-color: #33C3F0;
              transform: translateY(-2px);
            }
          }
          .water-cell {
            animation: waterWave 2s ease-in-out infinite;
            animation-delay: calc(var(--animation-delay) * 200ms);
          }
        `}
      </style>
      <div 
        className="relative"
        style={{
          transform: 'rotateX(60deg) rotateZ(-45deg)',
          transformStyle: 'preserve-3d',
          width: `${GRID_SIZE * 32}px`,
          height: `${GRID_SIZE * 32}px`
        }}
      >
        {grid.map((cell) => (
          <div
            key={`${cell.x}-${cell.y}`}
            className={cn(
              "absolute w-8 h-8 border border-gray-300 transition-colors",
              cell.type === 'water' 
                ? 'water-cell bg-sky-500' 
                : 'bg-amber-100'
            )}
            style={{
              left: `${cell.x * 32}px`,
              top: `${cell.y * 32}px`,
              '--animation-delay': (cell.x + cell.y) % 5,
            } as React.CSSProperties}
          />
        ))}
      </div>
    </div>
  );
};

export default IsometricGame;
