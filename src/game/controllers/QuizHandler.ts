export interface QuizQuestion {
    question: string;
    answers: {
        text: string;
        isCorrect: boolean;
    }[];
    points: number;
}

export class QuizHandler {
    private scene: Phaser.Scene;
    private modal: Phaser.GameObjects.Container | null = null;
    private isShowingQuiz: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    private getRandomQuiz(type: 'ladder' | 'snake' | 'quiz'): QuizQuestion {
        const quizzes: { [key: string]: QuizQuestion[] } = {
            ladder: [
                { question: "Are you ready to climb up?", answers: [{
                    text: "Lorem ipsum dolor sit amet",
                    isCorrect: false
                }, {
                    text: "Consectetur adipiscing elit",
                    isCorrect: true
                }, {
                    text: "Sed do eiusmod tempor",
                    isCorrect: false
                }, {
                    text: "Incididunt ut labore et dolore",
                    isCorrect: false
                }], points: 20 },
                { 
                    question: "Do you want to take the ladder?", 
                    answers: [
                        { text: "Yes, it will help me advance", isCorrect: true },
                        { text: "No, it looks risky", isCorrect: false },
                        { text: "I prefer staying here", isCorrect: false },
                        { text: "I'll find another way", isCorrect: false }
                    ],
                    points: 15 
                },
                { 
                    question: "Is climbing a ladder safe?",
                    answers: [
                        { text: "Yes, if used properly", isCorrect: true },
                        { text: "Never safe at all", isCorrect: false },
                        { text: "Only for experts", isCorrect: false },
                        { text: "Depends on luck", isCorrect: false }
                    ],
                    points: 25 
                },
                { 
                    question: "Should you avoid ladders?",
                    answers: [
                        { text: "Always avoid them", isCorrect: false },
                        { text: "Use them wisely", isCorrect: true },
                        { text: "Ignore them completely", isCorrect: false },
                        { text: "Fear them always", isCorrect: false }
                    ],
                    points: 18 
                }
            ],
            snake: [
                { 
                    question: "Are snakes dangerous?",
                    answers: [
                        { text: "All snakes are safe", isCorrect: false },
                        { text: "Some can be dangerous", isCorrect: true },
                        { text: "They're just ropes", isCorrect: false },
                        { text: "Never dangerous", isCorrect: false }
                    ],
                    points: 10 
                },
                { 
                    question: "Should you stay away from snakes?",
                    answers: [
                        { text: "Keep a safe distance", isCorrect: true },
                        { text: "Try to pet them", isCorrect: false },
                        { text: "Play with them", isCorrect: false },
                        { text: "Feed them treats", isCorrect: false }
                    ],
                    points: 12 
                },
                { 
                    question: "Are all snakes friendly?",
                    answers: [
                        { text: "Yes, always", isCorrect: false },
                        { text: "No, be cautious", isCorrect: true },
                        { text: "They're all pets", isCorrect: false },
                        { text: "Only if you feed them", isCorrect: false }
                    ],
                    points: 15 
                },
                { 
                    question: "Can snakes help you climb?",
                    answers: [
                        { text: "Yes, they're helpful", isCorrect: false },
                        { text: "No, that's not safe", isCorrect: true },
                        { text: "Only trained snakes", isCorrect: false },
                        { text: "If they're friendly", isCorrect: false }
                    ],
                    points: 8 
                }
            ],
            quiz: [
                { 
                    question: "Is learning fun?",
                    answers: [
                        { text: "Yes, it's an adventure", isCorrect: true },
                        { text: "No, it's boring", isCorrect: false },
                        { text: "Only when forced", isCorrect: false },
                        { text: "Sometimes maybe", isCorrect: false }
                    ],
                    points: 30 
                },
                { 
                    question: "Do you enjoy games?",
                    answers: [
                        { text: "Yes, they're fun", isCorrect: true },
                        { text: "No, waste of time", isCorrect: false },
                        { text: "Only when winning", isCorrect: false },
                        { text: "Prefer working", isCorrect: false }
                    ],
                    points: 25 
                },
                { 
                    question: "Are quizzes boring?",
                    answers: [
                        { text: "Always boring", isCorrect: false },
                        { text: "No, they're engaging", isCorrect: true },
                        { text: "Yes, no fun", isCorrect: false },
                        { text: "Pure torture", isCorrect: false }
                    ],
                    points: 20 
                },
                { 
                    question: "Should you give up easily?",
                    answers: [
                        { text: "Yes, why try", isCorrect: false },
                        { text: "Never give up", isCorrect: true },
                        { text: "When it's hard", isCorrect: false },
                        { text: "If others do", isCorrect: false }
                    ],
                    points: 35 
                }
            ]
        };

        const typeQuizzes = quizzes[type];
        const randomIndex = Math.floor(Math.random() * typeQuizzes.length);
        return typeQuizzes[randomIndex];
    }

    public showQuiz(type: 'ladder' | 'snake' | 'quiz', onResult: (correct: boolean, points: number) => void): void {
        if (this.isShowingQuiz) return;

        this.isShowingQuiz = true;
        const quiz = this.getRandomQuiz(type);

        const width = 1920;  // Default game width
        const height = 1080; // Default game height

        // Create modal container
        const modal = this.scene.add.container(width / 2, height / 2);
        modal.setDepth(1000);

        // Background overlay
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(-width / 2, -height / 2, width, height);

        // Modal background
        const modalWidth = 640;
        const modalHeight = 400;
        const modalBg = this.scene.add.graphics();
        modalBg.fillStyle(0xffffff);
        modalBg.lineStyle(4, 0x333333);
        modalBg.fillRoundedRect(-modalWidth / 2, -modalHeight / 2, modalWidth, modalHeight, 24);
        modalBg.strokeRoundedRect(-modalWidth / 2, -modalHeight / 2, modalWidth, modalHeight, 24);

        const image = this.scene.add.image(-modalWidth / 2 + 56, -modalHeight / 2 + 52, type === 'ladder' ? 'biru-full' : type === 'snake' ? 'merah-full' : 'kuning-full');
        image.setDisplaySize(60, 60);

        const headerText = this.scene.add.text(image.x + 48, -modalHeight / 2 + 40, 'You encounter a quiz!', {
            fontFamily: '"Pixelify Sans"',
            fontSize: '28px',
            color: '#000000',
            align: 'center'
        });

        headerText.setOrigin(0);

        const pointText = this.scene.add.text(modalWidth / 2 - 150, -modalHeight / 2 + 45, `Points: +${quiz.points}`, {
            fontFamily: '"Pixelify Sans"',
            fontSize: '24px',
            color: '#0000004c',
            align: 'center'
        });

        pointText.setOrigin(0);

        // Question text
        const questionText = this.scene.add.text(-modalWidth / 2 + 38, image.y + 50, quiz.question, {
            fontFamily: '"Pixelify Sans"',
            fontSize: '28px',
            color: '#000000',
            align: 'center',
            wordWrap: { width: 520 }
        });

        questionText.setOrigin(0);


        const answers = ["Lorem ipsum dolor sit amet", "Consectetur adipiscing elit", "Sed do eiusmod tempor", "Incididunt ut labore et dolore"];
        let answerElements = [];

        for (let i = 0; i < answers.length; i++) {
            const answerText = this.scene.add.text(-modalWidth / 2 + 38, questionText.y + 40 + i * 40, `${String.fromCharCode(97 + i)}. ${answers[i]}`, {
                fontFamily: '"Pixelify Sans"',
                fontSize: '24px',
                color: '#000000',
                align: 'left',
                wordWrap: { width: 520 }
            });
            answerText.setOrigin(0);
            answerElements.push(answerText);
        }

        let answerButtons = [];
        // A-D Buttons
        for (let i = 0; i < 4; i++) {
            const button = this.createButton(-modalWidth / 2 + 100 + i * 148, modalHeight / 2 - 55, String.fromCharCode(65 + i), 0x2196F3, () => {
                this.handleQuizAnswer(i, quiz, onResult);
            });

            answerButtons.push(button);
        }

        modal.add([overlay, modalBg, image, headerText, pointText, questionText, ...answerElements, ...answerButtons]);
        this.modal = modal;
    }

    private createButton(x: number, y: number, text: string, color: number, callback: () => void): Phaser.GameObjects.Container {
        const button = this.scene.add.container(x, y);
        const buttonWidth = 135;
        const buttonHeight = 50;

        const buttonBg = this.scene.add.graphics();
        buttonBg.fillStyle(color);
        buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 10);

        const buttonText = this.scene.add.text(0, 0, text, {
            fontFamily: '"Pixelify Sans"',
            fontSize: '20px',
            color: '#ffffff'
        });
        buttonText.setOrigin(0.5);

        button.add([buttonBg, buttonText]);
        
        // Set interactive with explicit hit area
        button.setInteractive(
            new Phaser.Geom.Rectangle(-60, -25, 120, 50),
            Phaser.Geom.Rectangle.Contains
        );
        
        if (button.input) {
            button.input.cursor = 'pointer';
        }
        
        button.on('pointerdown', callback);
        
        // Hover effects
        button.on('pointerover', () => {
            buttonBg.clear();
            buttonBg.fillStyle(color);
            buttonBg.fillRoundedRect(-60, -25, 120, 50, 10);
            buttonBg.setAlpha(0.8);
        });

        button.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(color);
            buttonBg.fillRoundedRect(-60, -25, 120, 50, 10);
            buttonBg.setAlpha(1);
        });

        return button;
    }

    private handleQuizAnswer(selectedAnswerIndex: number, quiz: QuizQuestion, onResult: (correct: boolean, points: number) => void): void {
        const isCorrect = quiz.answers[selectedAnswerIndex].isCorrect;
        const points = isCorrect ? quiz.points : 0;

        // Show result briefly
        this.showResult(isCorrect, points, () => {
            onResult(isCorrect, points);
            this.closeModal();
        });
    }

    private showResult(correct: boolean, points: number, onComplete: () => void): void {
        if (!this.modal) return;

        // Clear all existing content
        this.modal.removeAll(true);

        // Recreate overlay
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(-this.scene.sys.game.config.width as number / 2, -this.scene.sys.game.config.height as number / 2, 
            this.scene.sys.game.config.width as number, this.scene.sys.game.config.height as number);
        this.modal.add(overlay);

        // Result background
        const resultBg = this.scene.add.graphics();
        resultBg.fillStyle(correct ? 0x4CAF50 : 0xF44336);
        resultBg.lineStyle(4, 0x333333);
        resultBg.fillRoundedRect(-200, -100, 400, 200, 20);
        resultBg.strokeRoundedRect(-200, -100, 400, 200, 20);

        // Result text
        const resultText = this.scene.add.text(0, -30, correct ? '✓ Correct!' : '✗ Wrong!', {
            fontFamily: '"Pixelify Sans"',
            fontSize: '32px',
            color: '#ffffff',
            align: 'center'
        });
        resultText.setOrigin(0.5);

        // Points text
        const pointsText = this.scene.add.text(0, 20, `Points: +${points}`, {
            fontFamily: '"Pixelify Sans"',
            fontSize: '24px',
            color: '#ffffff',
            align: 'center'
        });
        pointsText.setOrigin(0.5);

        this.modal.add([resultBg, resultText, pointsText]);

        // Auto close after 2 seconds
        this.scene.time.delayedCall(2000, onComplete);
    }

    private closeModal(): void {
        if (this.modal) {
            this.modal.destroy();
            this.modal = null;
        }
        this.isShowingQuiz = false;
    }

    public isActive(): boolean {
        return this.isShowingQuiz;
    }
}