
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const GRID_SIZE = 30;
const TILE_WIDTH = 64;  // Augmenté pour mieux voir les losanges
const TILE_HEIGHT = 32; // La moitié de la largeur pour un vrai rendu isométrique
const WATER_PERCENTAGE = 0.2;

class IsometricScene extends Phaser.Scene {
  private cameraDragStart: Phaser.Math.Vector2 | null = null;

  constructor() {
    super({ key: 'IsometricScene' });
  }

  create() {
    // Création de la grille
    const waterColumns = Math.floor(GRID_SIZE * WATER_PERCENTAGE);

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        // L'eau est maintenant en bas à gauche (y > GRID_SIZE - waterColumns)
        const isWater = y > GRID_SIZE - waterColumns;
        
        // Conversion des coordonnées cartésiennes en coordonnées isométriques
        const isoX = (x - y) * TILE_WIDTH / 2;
        const isoY = (x + y) * TILE_HEIGHT / 2;

        // Création du tile en forme de losange
        const points = [
          { x: 0, y: -TILE_HEIGHT / 2 },          // Haut
          { x: TILE_WIDTH / 2, y: 0 },            // Droite
          { x: 0, y: TILE_HEIGHT / 2 },           // Bas
          { x: -TILE_WIDTH / 2, y: 0 }            // Gauche
        ];

        const tile = this.add.polygon(
          isoX + this.cameras.main.centerX,
          isoY + this.cameras.main.centerY - GRID_SIZE * TILE_HEIGHT / 4,
          points,
          isWater ? 0x0EA5E9 : 0xFEF3C7
        );
        tile.setStrokeStyle(1, 0xD1D5DB);

        if (isWater) {
          // Animation pour l'eau
          this.tweens.add({
            targets: tile,
            y: isoY + this.cameras.main.centerY - GRID_SIZE * TILE_HEIGHT / 4 - 2,
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            delay: (x + y) * 200 % 1000
          });
        }
      }
    }

    // Configuration de la caméra
    this.cameras.main.setZoom(0.8);

    // Gestion du zoom avec la molette
    this.input.on('wheel', (pointer: any, gameObjects: any, deltaX: number, deltaY: number) => {
      const zoom = this.cameras.main.zoom;
      const newZoom = zoom - deltaY * 0.001;
      this.cameras.main.setZoom(Phaser.Math.Clamp(newZoom, 0.5, 2));
    });

    // Gestion du drag pour déplacer la vue
    this.input.on('pointerdown', (pointer: Phaser.Input.Pointer) => {
      this.cameraDragStart = pointer.position.clone();
      this.input.on('pointermove', this.handleCameraDrag, this);
    });

    this.input.on('pointerup', () => {
      this.cameraDragStart = null;
      this.input.off('pointermove', this.handleCameraDrag, this);
    });
  }

  private handleCameraDrag(pointer: Phaser.Input.Pointer) {
    if (!this.cameraDragStart) return;

    const deltaX = pointer.x - this.cameraDragStart.x;
    const deltaY = pointer.y - this.cameraDragStart.y;

    this.cameras.main.scrollX -= deltaX;
    this.cameras.main.scrollY -= deltaY;

    this.cameraDragStart = pointer.position.clone();
  }
}

const IsometricGame = () => {
  const gameRef = useRef<Phaser.Game | null>(null);

  useEffect(() => {
    if (gameRef.current) return;

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      parent: 'phaser-container',
      width: window.innerWidth,
      height: window.innerHeight,
      backgroundColor: '#ffffff',
      scene: IsometricScene,
      scale: {
        mode: Phaser.Scale.RESIZE,
        autoCenter: Phaser.Scale.CENTER_BOTH
      }
    };

    gameRef.current = new Phaser.Game(config);

    return () => {
      if (gameRef.current) {
        gameRef.current.destroy(true);
        gameRef.current = null;
      }
    };
  }, []);

  return <div id="phaser-container" className="w-full h-full" />;
};

export default IsometricGame;
