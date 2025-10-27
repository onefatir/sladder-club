export interface Ladder {
    bottom: number;
    top: number;
}

export interface Snake {
    head: number;
    tail: number;
}

export interface ObstacleEffect {
    type: 'ladder' | 'snake' | 'quiz';
    newPosition?: number;
    points: number;
}

export class ObstaclesController {
    private ladders: Ladder[] = [
        { bottom: 8, top: 27 },
        { bottom: 16, top: 47 },
        { bottom: 22, top: 59 },
        { bottom: 50, top: 91 },
        { bottom: 79, top: 98 }
    ];

    private snakes: Snake[] = [
        { head: 60, tail: 38 },
        { head: 97, tail: 37 },
        { head: 86, tail: 65 },
        { head: 89, tail: 67 },
        { head: 68, tail: 49 }
    ];

    private quizBoxes: number[] = [24, 56, 33, 83, 94];

    constructor() {}

    /**
     * Check if a position has any obstacles
     */
    public getObstacleAtPosition(position: number): { type: 'ladder' | 'snake' | 'quiz' | null, data?: any } {
        // Check for ladder
        const ladder = this.ladders.find(l => l.bottom === position);
        if (ladder) {
            return { type: 'ladder', data: ladder };
        }

        // Check for snake head
        const snake = this.snakes.find(s => s.head === position);
        if (snake) {
            return { type: 'snake', data: snake };
        }

        // Check for quiz box
        if (this.quizBoxes.includes(position)) {
            return { type: 'quiz', data: { position } };
        }

        return { type: null };
    }

    /**
     * Handle ladder obstacle
     */
    public handleLadder(ladder: Ladder, quizCorrect: boolean): ObstacleEffect {
        if (quizCorrect) {
            return {
                type: 'ladder',
                newPosition: ladder.top,
                points: 20 + (ladder.top - ladder.bottom) // Base points + bonus for height
            };
        } else {
            return {
                type: 'ladder',
                newPosition: ladder.bottom, // Stay at bottom
                points: 0
            };
        }
    }

    /**
     * Handle snake obstacle
     */
    public handleSnake(snake: Snake, quizCorrect: boolean): ObstacleEffect {
        if (quizCorrect) {
            return {
                type: 'snake',
                newPosition: snake.head, // Stay safe at head
                points: 15 + Math.abs(snake.head - snake.tail) * 2 // Bonus for avoiding fall
            };
        } else {
            return {
                type: 'snake',
                newPosition: snake.tail, // Fall to tail
                points: 0
            };
        }
    }

    /**
     * Handle quiz box obstacle
     */
    public handleQuizBox(quizCorrect: boolean, currentPosition: number): ObstacleEffect {
        return {
            type: 'quiz',
            newPosition: currentPosition, // Stay at same position
            points: quizCorrect ? 25 : 0 // Fixed points for quiz boxes
        };
    }

    /**
     * Get all ladder positions (for visual indicators)
     */
    public getLadderPositions(): { bottom: number, top: number }[] {
        return [...this.ladders];
    }

    /**
     * Get all snake positions (for visual indicators)
     */
    public getSnakePositions(): { head: number, tail: number }[] {
        return [...this.snakes];
    }

    /**
     * Get all quiz box positions (for visual indicators)
     */
    public getQuizBoxPositions(): number[] {
        return [...this.quizBoxes];
    }

    /**
     * Check if position is a special obstacle (for UI highlighting)
     */
    public isSpecialPosition(position: number): boolean {
        return this.ladders.some(l => l.bottom === position || l.top === position) ||
               this.snakes.some(s => s.head === position || s.tail === position) ||
               this.quizBoxes.includes(position);
    }
}