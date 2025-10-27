import { PlayerController } from './Player';
import { ObstaclesController } from './ObstaclesController';
import { QuizHandler } from './QuizHandler';

export class BoardController {
    private players: PlayerController[] = [];
    private currentPlayerIndex: number = 0;
    private boardSize: number = 1000;
    private boardX: number;
    private boardY: number;
    private diceKeys: string[];
    private isRolling: boolean = false;
    private obstaclesController: ObstaclesController;
    private quizHandler: QuizHandler;

    constructor(private scene: Phaser.Scene, boardX: number, boardY: number) {
        this.boardX = boardX;
        this.boardY = boardY;
        
        // Get dice configuration from registry (set in Preloader)
        this.diceKeys = scene.registry.get('diceKeys') || ['dice-1', 'dice-2', 'dice-3', 'dice-4', 'dice-5', 'dice-6'];
        
        // Initialize obstacles and quiz handlers
        this.obstaclesController = new ObstaclesController();
        this.quizHandler = new QuizHandler(scene);

        // this.quizHandler.showQuiz("ladder", () => {});
    }

    /**
     * Add a player to the game
     */
    public addPlayer(name: string, spriteKey: string): PlayerController {
        const player = new PlayerController(
            this.scene,
            name,
            spriteKey,
            this.boardX,
            this.boardY,
            1 // Start at position 1
        );
        
        this.players.push(player);
        this.updatePlayersPositions(); // Arrange players who might be at same position
        
        return player;
    }

    /**
     * Get all players
     */
    public getPlayers(): PlayerController[] {
        return [...this.players];
    }

    /**
     * Get current player
     */
    public getCurrentPlayer(): PlayerController | null {
        if (this.players.length === 0) return null;
        return this.players[this.currentPlayerIndex];
    }

    /**
     * Get next player
     */
    public getNextPlayer(): PlayerController | null {
        if (this.players.length === 0) return null;
        const nextIndex = (this.currentPlayerIndex + 1) % this.players.length;
        return this.players[nextIndex];
    }

    /**
     * Switch to next player's turn
     */
    public nextTurn(): void {
        this.currentPlayerIndex = (this.currentPlayerIndex + 1) % this.players.length;
    }

    /**
     * Roll dice with animation and move current player
     */
    public rollDice(diceSprite: Phaser.GameObjects.Image, onRollComplete?: (diceValue: number) => void): void {
        if (this.isRolling) return;
        
        const currentPlayer = this.getCurrentPlayer();
        if (!currentPlayer) return;

        this.isRolling = true;
        const config = this.scene.registry.get('diceAnimationConfig') || {
            duration: 1000,
            fadeInDuration: 200,
            fadeOutDuration: 200,
            rollInterval: 100
        };

        // Generate random dice value (1-6)
        const finalValue = Math.floor(Math.random() * 6) + 1;
        // const finalValue = 7

        // Play dice sound effect
        this.scene.sound.play('dice-sound');

        // Dice rolling animation
        diceSprite.setAlpha(0);
        
        // Fade in
        this.scene.tweens.add({
            targets: diceSprite,
            alpha: 1,
            duration: config.fadeInDuration,
            onComplete: () => {
                let rollCount = 0;
                const maxRolls = config.duration / config.rollInterval;
                
                const rollTimer = this.scene.time.addEvent({
                    delay: config.rollInterval,
                    callback: () => {
                        const randomDice = this.diceKeys[Math.floor(Math.random() * 6)];
                        diceSprite.setTexture(randomDice);
                        rollCount++;
                        
                        if (rollCount >= maxRolls) {
                            rollTimer.remove();
                            diceSprite.setTexture(`dice-${finalValue}`);
                            
                            // Move player after showing final dice value
                            this.scene.time.delayedCall(500, () => {
                                this.moveCurrentPlayer(finalValue, () => {
                                    this.isRolling = false;
                                    if (onRollComplete) onRollComplete(finalValue);
                                });
                            });
                        }
                    },
                    loop: true
                });
            }
        });
    }

    /**
 * Move current player by dice value
 */
private moveCurrentPlayer(diceValue: number, onComplete?: () => void): void {
    const currentPlayer = this.getCurrentPlayer();
    if (!currentPlayer) return;

    const targetPosition = currentPlayer.position + diceValue;
    
    // If target position exceeds 100, implement bounce-back
    if (targetPosition > 100) {
        const overshoot = targetPosition - 100;
        const finalPosition = Math.max(100 - overshoot, 1); // Ensure position doesn't go below 1
        
        // First move to position 100
        currentPlayer.moveToPosition(100, () => {
            // Then bounce back to the final position
            this.scene.time.delayedCall(300, () => { // Small delay to show the bounce
                currentPlayer.moveToPosition(finalPosition, () => {
                    // Check for obstacles at final position
                    this.handleObstaclesAtPosition(currentPlayer, finalPosition, onComplete);
                });
            });
        });
    } else {
        // Normal movement - move directly to new position
        currentPlayer.moveToPosition(targetPosition, () => {
            // Check for win condition (only when exactly at 100)
            if (targetPosition === 100) {
                this.handlePlayerWin(currentPlayer);
                this.updatePlayersPositions();
                if (onComplete) onComplete();
                return;
            }
            
            // Check for obstacles at target position
            this.handleObstaclesAtPosition(currentPlayer, targetPosition, onComplete);
        });
    }
}

/**
 * Handle obstacles at a specific position
 */
private handleObstaclesAtPosition(player: PlayerController, position: number, onComplete?: () => void): void {
    const obstacle = this.obstaclesController.getObstacleAtPosition(position);
    
    if (obstacle.type === null) {
        // No obstacle, just update positions and complete
        this.updatePlayersPositions();
        if (onComplete) onComplete();
        return;
    }

    // Handle different types of obstacles
    switch (obstacle.type) {
        case 'ladder':
            this.handleLadderObstacle(player, obstacle.data, onComplete);
            break;
        case 'snake':
            this.handleSnakeObstacle(player, obstacle.data, onComplete);
            break;
        case 'quiz':
            this.handleQuizObstacle(player, position, onComplete);
            break;
    }
}

/**
 * Handle ladder obstacle
 */
private handleLadderObstacle(player: PlayerController, ladderData: any, onComplete?: () => void): void {
    this.quizHandler.showQuiz('ladder', (correct: boolean, quizPoints: number) => {
        const effect = this.obstaclesController.handleLadder(ladderData, correct);
        
        // Award quiz points
        if (quizPoints > 0) {
            player.updateScore(quizPoints);
        }
        
        // Award ladder effect points
        if (effect.points > 0) {
            player.updateScore(effect.points);
        }
        
        // Move player to new position if needed
        if (effect.newPosition && effect.newPosition !== player.position) {
            console.log(`${player.name} ${correct ? 'climbed the ladder' : 'stayed at the bottom'}!`);
            player.moveToPositionDiagonal(effect.newPosition, () => {
                this.updatePlayersPositions();
                if (onComplete) onComplete();
            });
        } else {
            this.updatePlayersPositions();
            if (onComplete) onComplete();
        }
    });
}

/**
 * Handle snake obstacle
 */
private handleSnakeObstacle(player: PlayerController, snakeData: any, onComplete?: () => void): void {
    this.quizHandler.showQuiz('snake', (correct: boolean, quizPoints: number) => {
        const effect = this.obstaclesController.handleSnake(snakeData, correct);
        
        // Award quiz points
        if (quizPoints > 0) {
            player.updateScore(quizPoints);
        }
        
        // Award snake effect points
        if (effect.points > 0) {
            player.updateScore(effect.points);
        }
        
        // Move player to new position if needed
        if (effect.newPosition && effect.newPosition !== player.position) {
            console.log(`${player.name} ${correct ? 'avoided the snake' : 'fell down the snake'}!`);
            player.moveToPositionDiagonal(effect.newPosition, () => {
                this.updatePlayersPositions();
                if (onComplete) onComplete();
            });
        } else {
            this.updatePlayersPositions();
            if (onComplete) onComplete();
        }
    });
}

/**
 * Handle quiz box obstacle
 */
private handleQuizObstacle(player: PlayerController, position: number, onComplete?: () => void): void {
    this.quizHandler.showQuiz('quiz', (correct: boolean, quizPoints: number) => {
        const effect = this.obstaclesController.handleQuizBox(correct, position);
        
        // Award quiz points
        if (quizPoints > 0) {
            player.updateScore(quizPoints);
        }
        
        // Award quiz box effect points
        if (effect.points > 0) {
            player.updateScore(effect.points);
        }
        
        console.log(`${player.name} ${correct ? 'answered correctly' : 'answered incorrectly'} in the quiz box!`);
        
        this.updatePlayersPositions();
        if (onComplete) onComplete();
    });
}

    /**
     * Handle player winning the game
     */
    private handlePlayerWin(player: PlayerController): void {
        console.log(`🎉 ${player.name} wins the game!`);
        player.updateScore(100); // Bonus points for winning
        
        // Emit win event or handle win logic here
        // You can add celebration animation, sound effects, etc.
    }

    /**
     * Update all players' positions to handle overlapping
     */
    public updatePlayersPositions(): void {
        // Group players by their square position
        const playersBySquare = new Map<number, PlayerController[]>();
        
        this.players.forEach(player => {
            const square = player.position;
            if (!playersBySquare.has(square)) {
                playersBySquare.set(square, []);
            }
            playersBySquare.get(square)!.push(player);
        });

        // Adjust positions for players in the same square
        playersBySquare.forEach((playersInSquare, square) => {
            playersInSquare.forEach((player, index) => {
                player.adjustPositionInSquare(playersInSquare, index);
            });
        });
    }

    /**
     * Get player at specific square
     */
    public getPlayersAtSquare(square: number): PlayerController[] {
        return this.players.filter(player => player.position === square);
    }

    /**
     * Reset game - move all players to start
     */
    public resetGame(): void {
        this.currentPlayerIndex = 0;
        this.isRolling = false;
        
        this.players.forEach(player => {
            player.position = 1;
            player.scores = 0;
            player.moveToPosition(1);
        });
        
        this.updatePlayersPositions();
    }

    /**
     * Get game state
     */
    public getGameState(): {
        currentPlayer: string | null;
        nextPlayer: string | null;
        players: Array<{ name: string; position: number; scores: number }>;
        isRolling: boolean;
    } {
        return {
            currentPlayer: this.getCurrentPlayer()?.name || null,
            nextPlayer: this.getNextPlayer()?.name || null,
            players: this.players.map(p => ({
                name: p.name,
                position: p.position,
                scores: p.scores
            })),
            isRolling: this.isRolling
        };
    }

    /**
     * Destroy all players and clean up
     */
    public destroy(): void {
        this.players.forEach(player => player.destroy());
        this.players = [];
    }
}