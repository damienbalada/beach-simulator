
import React, { useState, useEffect, useRef } from 'react';
import { cn } from "@/lib/utils";

type TerrainType = 'water' | 'sand';

interface Cell {
  x: number;
  y: number;
  type: TerrainType;
}

const GRID_SIZE = 30;
const WATER_PERCENTAGE = 0.2;
const MIN_ZOOM = 0.5;
const MAX_ZOOM = 2;

const IsometricGame = () => {
  const [grid, setGrid] = useState<Cell[]>(() => {
    const cells: Cell[] = [];
    const waterColumns = Math.floor(GRID_SIZE * WATER_PERCENTAGE);

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        // Si on est dans les 20% de gauche, c'est de l'eau
        const isWater = x < waterColumns;
        cells.push({
          x,
          y,
          type: isWater ? 'water' : 'sand'
        });
      }
    }
    return cells;
  });

  const [zoom, setZoom] = useState(0.8);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);

  const handleWheel = (e: WheelEvent) => {
    e.preventDefault();
    setZoom(currentZoom => {
      const newZoom = currentZoom - (e.deltaY * 0.001);
      return Math.min(Math.max(newZoom, MIN_ZOOM), MAX_ZOOM);
    });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging) return;
    
    setPosition({
      x: e.clientX - dragStart.x,
      y: e.clientY - dragStart.y
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.addEventListener('wheel', handleWheel, { passive: false });
    return () => {
      container.removeEventListener('wheel', handleWheel);
    };
  }, []);

  return (
    <div 
      ref={containerRef}
      className="w-full h-full overflow-hidden p-4 cursor-grab active:cursor-grabbing"
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
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
        className="relative left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2"
        style={{
          transform: `translate(${position.x}px, ${position.y}px) rotateX(60deg) rotateZ(-45deg) scale(${zoom})`,
          transformStyle: 'preserve-3d',
          width: `${GRID_SIZE * 32}px`,
          height: `${GRID_SIZE * 32}px`,
          transition: isDragging ? 'none' : 'transform 0.1s ease-out'
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
