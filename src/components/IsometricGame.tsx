
import React, { useState } from 'react';
import { cn } from "@/lib/utils";

type TerrainType = 'beach' | 'sand';

interface Cell {
  x: number;
  y: number;
  type: TerrainType;
}

const GRID_SIZE = 30;
const BEACH_PERCENTAGE = 0.2;

const IsometricGame = () => {
  const [grid, setGrid] = useState<Cell[]>(() => {
    const cells: Cell[] = [];
    const beachCells = Math.floor(GRID_SIZE * BEACH_PERCENTAGE);

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        // Si on est dans les 20% inférieurs gauches, c'est de la plage
        const isBeach = y >= GRID_SIZE - beachCells && x < beachCells;
        cells.push({
          x,
          y,
          type: isBeach ? 'beach' : 'sand'
        });
      }
    }
    return cells;
  });

  return (
    <div className="w-full h-full overflow-auto p-4">
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
              cell.type === 'beach' ? 'bg-amber-200' : 'bg-amber-100'
            )}
            style={{
              left: `${cell.x * 32}px`,
              top: `${cell.y * 32}px`,
            }}
          />
        ))}
      </div>
    </div>
  );
};

export default IsometricGame;
