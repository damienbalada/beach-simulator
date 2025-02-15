
import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const GRID_SIZE = 30;
const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const WATER_PERCENTAGE = 0.2;

class IsometricScene extends Phaser.Scene {
  private cameraDragStart: Phaser.Math.Vector2 | null = null;

  constructor() {
    super({ key: 'IsometricScene' });
  }

  preload() {
    this.load.image('towel', '/lovable-uploads/09d3e246-d032-43f6-96ad-0af0aaf2722b.png');
  }

  create() {
    // Création de la grille
    const waterColumns = Math.floor(GRID_SIZE * WATER_PERCENTAGE);

    for (let y = 0; y < GRID_SIZE; y++) {
      for (let x = 0; x < GRID_SIZE; x++) {
        const isWater = y > GRID_SIZE - waterColumns;
        
        // Conversion des coordonnées cartésiennes en coordonnées isométriques
        const isoX = (x - y) * TILE_WIDTH / 2;
        const isoY = (x + y) * TILE_HEIGHT / 2;

        // Points pour le losange
        const points = [
          { x: 0, y: -TILE_HEIGHT / 2 },
          { x: TILE_WIDTH / 2, y: 0 },
          { x: 0, y: TILE_HEIGHT / 2 },
          { x: -TILE_WIDTH / 2, y: 0 }
        ];

        // Variation de couleur pour la texture
        const randomBrightness = isWater ? 0 : Phaser.Math.Between(-20, 20);
        const baseColor = isWater ? 0x0EA5E9 : 0xFEF3C7;
        const color = Phaser.Display.Color.ValueToColor(baseColor);
        const adjustedColor = Phaser.Display.Color.GetColor(
          Phaser.Math.Clamp(color.red + randomBrightness, 0, 255),
          Phaser.Math.Clamp(color.green + randomBrightness, 0, 255),
          Phaser.Math.Clamp(color.blue + randomBrightness, 0, 255)
        );

        const tile = this.add.polygon(
          isoX + this.cameras.main.centerX,
          isoY + this.cameras.main.centerY - GRID_SIZE * TILE_HEIGHT / 4,
          points,
          adjustedColor
        );
        tile.setStrokeStyle(1, 0xD1D5DB);

        if (isWater) {
          // Animation plus complexe pour l'eau
          const startingBrightness = Phaser.Math.Between(-30, 30);
          this.tweens.add({
            targets: tile,
            y: isoY + this.cameras.main.centerY - GRID_SIZE * TILE_HEIGHT / 4 - 2,
            fillColor: {
              from: adjustedColor,
              to: Phaser.Display.Color.GetColor(
                Phaser.Math.Clamp(color.red + startingBrightness, 0, 255),
                Phaser.Math.Clamp(color.green + startingBrightness, 0, 255),
                Phaser.Math.Clamp(color.blue + startingBrightness, 0, 255)
              )
            },
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            delay: (x + y) * 200 % 1000
          });
        } else {
          // Pour le sable, on ajoute un événement de clic pour placer la serviette
          tile.setInteractive();
          tile.on('pointerdown', () => {
            // On vérifie qu'on n'est pas en train de déplacer la vue
            if (!this.cameraDragStart) {
              const towel = this.add.image(tile.x, tile.y - 5, 'towel');
              towel.setScale(0.5);
              // Rotation pour aligner avec la grille isométrique
              towel.setRotation(-Math.PI / 4);
            }
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
