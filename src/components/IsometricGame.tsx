import React, { useEffect, useRef } from 'react';
import Phaser from 'phaser';

const TILE_WIDTH = 64;
const TILE_HEIGHT = 32;
const VISIBLE_TILES = 30;
const WATER_PERCENTAGE = 0.2;

class IsometricScene extends Phaser.Scene {
  private cameraDragStart: Phaser.Math.Vector2 | null = null;
  private highlightShape: Phaser.GameObjects.Polygon[] = [];
  private lastHoverPosition: { x: number, y: number } | null = null;

  constructor() {
    super({ key: 'IsometricScene' });
  }

  create() {
    this.generateVisibleTiles();

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

    // Création du highlight 2x3
    for (let i = 0; i < 6; i++) {
      const points = [
        { x: 0, y: -TILE_HEIGHT / 2 },
        { x: TILE_WIDTH / 2, y: 0 },
        { x: 0, y: TILE_HEIGHT / 2 },
        { x: -TILE_WIDTH / 2, y: 0 }
      ];
      
      const highlight = this.add.polygon(0, 0, points, 0x00FF00, 0.3);
      highlight.setStrokeStyle(2, 0x00FF00);
      highlight.setVisible(false);
      this.highlightShape.push(highlight);
    }

    // Mettre à jour les tuiles visibles lors du déplacement de la caméra
    this.cameras.main.setScroll(0, 0);
    this.cameras.main.on('scroll', () => {
      this.generateVisibleTiles();
    });
  }

  private generateVisibleTiles() {
    // Effacer les tuiles existantes
    this.children.list
      .filter(child => child instanceof Phaser.GameObjects.Polygon && !this.highlightShape.includes(child))
      .forEach(child => child.destroy());

    // Calculer les limites visibles
    const camera = this.cameras.main;
    const zoom = camera.zoom;
    const visibleWidth = camera.width / zoom;
    const visibleHeight = camera.height / zoom;

    // Générer de nouvelles tuiles
    for (let y = 0; y < VISIBLE_TILES; y++) {
      for (let x = 0; x < VISIBLE_TILES; x++) {
        const worldX = Math.floor((camera.scrollX - visibleWidth/2) / TILE_WIDTH) + x;
        const worldY = Math.floor((camera.scrollY - visibleHeight/2) / TILE_HEIGHT) + y;
        
        const isWater = worldY > VISIBLE_TILES - Math.floor(VISIBLE_TILES * WATER_PERCENTAGE);
        
        const isoX = (worldX - worldY) * TILE_WIDTH / 2;
        const isoY = (worldX + worldY) * TILE_HEIGHT / 2;

        const points = [
          { x: 0, y: -TILE_HEIGHT / 2 },
          { x: TILE_WIDTH / 2, y: 0 },
          { x: 0, y: TILE_HEIGHT / 2 },
          { x: -TILE_WIDTH / 2, y: 0 }
        ];

        // Variation légère de couleur pour donner de la texture
        const variation = Phaser.Math.Between(-10, 10);
        let baseColor;
        if (isWater) {
          baseColor = 0x0099CC; // Bleu clair uniforme pour l'eau
        } else {
          // Camaïeu de beige pour le sable
          const sandValue = Phaser.Math.Clamp(220 + variation, 210, 230);
          baseColor = Phaser.Display.Color.GetColor(sandValue, sandValue - 30, sandValue - 60);
        }

        const tile = this.add.polygon(
          isoX + camera.width/2,
          isoY + camera.height/2 - VISIBLE_TILES * TILE_HEIGHT/4,
          points,
          baseColor
        );
        tile.setStrokeStyle(1, 0xD1D5DB);

        // Gestion de l'eau
        if (isWater) {
          this.tweens.add({
            targets: tile,
            fillColor: {
              from: baseColor,
              to: 0x00A8DC
            },
            duration: 2000,
            ease: 'Sine.easeInOut',
            yoyo: true,
            repeat: -1,
            delay: (worldX + worldY) * 100 % 1000
          });
        } else {
          // Gestion du hover et du clic sur le sable
          tile.setInteractive();
          tile.setData('gridPos', { x: worldX, y: worldY });
          
          tile.on('pointerover', () => {
            if (this.cameraDragStart) return;
            this.updateHighlight(worldX, worldY);
          });

          tile.on('pointerout', () => {
            if (this.cameraDragStart) return;
            this.hideHighlight();
          });

          tile.on('pointerdown', () => {
            if (this.cameraDragStart || !this.lastHoverPosition) return;
            
            // Placer des cases violettes 2x3
            for (let ty = 0; ty < 3; ty++) {
              for (let tx = 0; tx < 2; tx++) {
                const localX = this.lastHoverPosition.x + tx;
                const localY = this.lastHoverPosition.y + ty;
                const towelIsoX = (localX - localY) * TILE_WIDTH / 2;
                const towelIsoY = (localX + localY) * TILE_HEIGHT / 2;
                
                const towelTile = this.add.polygon(
                  towelIsoX + camera.width/2,
                  towelIsoY + camera.height/2 - VISIBLE_TILES * TILE_HEIGHT/4,
                  points,
                  0x800080
                );
                towelTile.setStrokeStyle(1, 0x600060);
              }
            }
          });
        }
      }
    }
  }

  private updateHighlight(gridX: number, gridY: number) {
    this.lastHoverPosition = { x: gridX, y: gridY };
    
    let index = 0;
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 2; x++) {
        const highlight = this.highlightShape[index];
        const localX = gridX + x;
        const localY = gridY + y;
        
        const isoX = (localX - localY) * TILE_WIDTH / 2;
        const isoY = (localX + localY) * TILE_HEIGHT / 2;
        
        highlight.setPosition(
          isoX + this.cameras.main.width/2,
          isoY + this.cameras.main.height/2 - VISIBLE_TILES * TILE_HEIGHT/4
        );
        highlight.setVisible(true);
        index++;
      }
    }
  }

  private hideHighlight() {
    this.lastHoverPosition = null;
    this.highlightShape.forEach(highlight => highlight.setVisible(false));
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
