export class PlayerController {
    public name: string;
    public scores: number;
    public position: number; // Square unit (1-100)
    public actualPosition: { x: number; y: number }; // Pixel position
    public sprite: Phaser.GameObjects.Image;
    
    private boardSize: number = 1000;
    private gridSize: number = 10; // 10x10 grid
    private squareSize: number = 100; // 100x100 pixels per square
    private boardX: number;
    private boardY: number;

    public constructor(
        private scene: Phaser.Scene, 
        name: string, 
        spriteKey: string,
        boardX: number, 
        boardY: number,
        initialPosition: number = 1
    ) {
        this.name = name;
        this.scores = 0;
        this.position = initialPosition;
        this.boardX = boardX;
        this.boardY = boardY;
        
        // Create player sprite
        this.sprite = scene.add.image(0, 0, spriteKey);
        this.sprite.setDisplaySize(40, 40);
        this.sprite.setDepth(200); // Above board
        
        // Calculate initial actual position
        this.updateActualPosition();
    }

    /**
     * Convert square position (1-100) to pixel coordinates
     * Follows snakes and ladders board layout (bottom-left start, alternating direction)
     */
    private squareToPixel(square: number): { x: number; y: number } {
        if (square < 1 || square > 100) {
            throw new Error(`Invalid square position: ${square}. Must be between 1 and 100.`);
        }

        // Convert to 0-based index
        const index = square - 1;
        
        // Calculate row and column (0-based)
        const row = Math.floor(index / this.gridSize);
        const col = index % this.gridSize;
        
        // Snakes and ladders board starts from bottom-left
        // Even rows (0, 2, 4...) go left to right
        // Odd rows (1, 3, 5...) go right to left
        let actualCol: number;
        if (row % 2 === 0) {
            actualCol = col; // Left to right
        } else {
            actualCol = this.gridSize - 1 - col; // Right to left
        }
        
        // Calculate pixel position (center of square)
        // Board coordinates are relative to board center
        const pixelX = this.boardX - this.boardSize/2 + (actualCol * this.squareSize) + (this.squareSize / 2);
        const pixelY = this.boardY + this.boardSize/2 - ((row + 1) * this.squareSize) + (this.squareSize / 2);
        
        return { x: pixelX, y: pixelY };
    }

    /**
     * Update the actual pixel position based on current square position
     */
    private updateActualPosition(): void {
        this.actualPosition = this.squareToPixel(this.position);
        this.sprite.setPosition(this.actualPosition.x, this.actualPosition.y);
    }

    /**
     * Move player to a new position with smooth animation
     * @param newPosition Target square (1-100)
     * @param onComplete Callback when animation completes
     */
    public moveToPosition(newPosition: number, onComplete?: () => void): void {
        if (newPosition < 1 || newPosition > 100) {
            console.error(`Invalid target position: ${newPosition}`);
            return;
        }

        const startPos = this.position;
        const endPos = newPosition;
        const steps = Math.abs(endPos - startPos);
        
        if (steps === 0) {
            if (onComplete) onComplete();
            return;
        }

        let currentStep = 0;
        const direction = endPos > startPos ? 1 : -1;
        
        // Animate through each square
        const animateStep = () => {
            if (currentStep >= steps) {
                this.position = newPosition;
                this.updateActualPosition();
                if (onComplete) onComplete();
                return;
            }
            
            currentStep++;
            const intermediatePosition = startPos + (currentStep * direction);
            const targetPixel = this.squareToPixel(intermediatePosition);
            
            // Smooth tween to next square
            this.scene.tweens.add({
                targets: this.sprite,
                x: targetPixel.x,
                y: targetPixel.y,
                duration: 200, // 200ms per square
                ease: 'Power2.easeInOut',
                onComplete: () => {
                    this.position = intermediatePosition;
                    this.actualPosition = targetPixel;
                    animateStep(); // Continue to next square
                }
            });
        };
        
        animateStep();
    }

    /**
     * Adjust player position within a square when multiple players occupy the same square
     * @param playersInSquare Array of players in the same square
     * @param playerIndex This player's index in the array
     */
    public adjustPositionInSquare(playersInSquare: PlayerController[], playerIndex: number): void {
        const basePosition = this.squareToPixel(this.position);
        const playerCount = playersInSquare.length;
        
        // Scale players down when there are multiple in same square to maintain 1:1 ratio
        let playerSize = 40; // Default size
        let spacing = 40; // Increased base spacing
        
        if (playerCount > 1) {
            // Scale down players but increase spacing for better separation
            playerSize = Math.max(28, 40 - (playerCount - 1) * 2); // Min size 28px, less aggressive scaling
            spacing = Math.max(35, 40 + (playerCount - 1) * 5); // Increase spacing with more players
            
            // Update sprite size to maintain 1:1 ratio
            this.sprite.setDisplaySize(playerSize, playerSize);
        } else {
            // Reset to original size for single player
            this.sprite.setDisplaySize(40, 40);
        }
        
        // Layout positions with proper spacing
        const layouts = [
            { x: 0, y: 0 },                    // Center (single player)
            { x: -spacing/2, y: -spacing/2 },  // Top-left (1st of 2+)
            { x: spacing/2, y: -spacing/2 },   // Top-right (2nd)
            { x: -spacing/2, y: spacing/2 },   // Bottom-left (3rd)
            { x: spacing/2, y: spacing/2 }     // Bottom-right (4th+)
        ];
        
        let layoutIndex = 0;
        if (playerCount === 1) {
            layoutIndex = 0; // Center
        } else if (playerCount === 2) {
            layoutIndex = playerIndex === 0 ? 1 : 2; // Top-left, Top-right
        } else if (playerCount === 3) {
            layoutIndex = playerIndex === 0 ? 1 : (playerIndex === 1 ? 2 : 4); // Top-left, Top-right, Bottom-right
        } else {
            layoutIndex = Math.min(playerIndex + 1, layouts.length - 1); // All positions
        }
        
        const layout = layouts[layoutIndex];
        
        this.actualPosition = {
            x: basePosition.x + layout.x,
            y: basePosition.y + layout.y
        };
        
        // Smooth transition to new position
        this.scene.tweens.add({
            targets: this.sprite,
            x: this.actualPosition.x,
            y: this.actualPosition.y,
            duration: 300,
            ease: 'Power2.easeOut'
        });
    }

    /**
     * Move player diagonally to a new position (for ladders and snakes)
     * @param newPosition Target square (1-100)
     * @param onComplete Callback when animation completes
     */
    public moveToPositionDiagonal(newPosition: number, onComplete?: () => void): void {
        if (newPosition < 1 || newPosition > 100) {
            console.error(`Invalid target position: ${newPosition}`);
            return;
        }

        const targetPixel = this.squareToPixel(newPosition);
        
        // Direct diagonal movement - faster than step-by-step
        this.scene.tweens.add({
            targets: this.sprite,
            x: targetPixel.x,
            y: targetPixel.y,
            duration: 800, // Slightly slower than normal step for visual effect
            ease: 'Power2.easeInOut',
            onComplete: () => {
                this.position = newPosition;
                this.actualPosition = targetPixel;
                if (onComplete) onComplete();
            }
        });
    }

    /**
     * Update player's score
     */
    public updateScore(points: number): void {
        this.scores += points;
        console.log(`${this.name} earned ${points} points! Total: ${this.scores}`);
    }

    /**
     * Get current position info
     */
    public getPositionInfo(): { square: number; pixel: { x: number; y: number } } {
        return {
            square: this.position,
            pixel: { ...this.actualPosition }
        };
    }

    /**
     * Destroy player sprite
     */
    public destroy(): void {
        if (this.sprite) {
            this.sprite.destroy();
        }
    }
}