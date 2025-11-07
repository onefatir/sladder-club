export interface QuizQuestion {
    question: string;
    answers: {
        text: string;
        isCorrect: boolean;
    }[];
    points: number;
    audio: string
}

export class QuizHandler {
    private scene: Phaser.Scene;
    private modal: Phaser.GameObjects.Container | null = null;
    private isShowingQuiz: boolean = false;

    constructor(scene: Phaser.Scene) {
        this.scene = scene;
    }

    private getRandomQuiz(): QuizQuestion {
        const quizzes: QuizQuestion[] = this.scene.cache.json.get("quiz-data");
        const randomIndex = Math.floor(Math.random() * quizzes.length);
        return quizzes[randomIndex];
    }

    public showQuiz(type: 'ladder' | 'snake' | 'quiz', onResult: (correct: boolean, points: number) => void): void {
        if (this.isShowingQuiz) return;

        this.isShowingQuiz = true;
        const quiz = this.getRandomQuiz();

        // For quiz box type, show teacher instruction modal
        if (type === 'quiz') {
            this.showTeacherInstructionModal(onResult);
            return;
        }

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
        const modalWidth = 960;  // Increased from 640
        const modalHeight = 600; // Increased from 400
        const modalBg = this.scene.add.graphics();
        modalBg.fillStyle(0xffffff);
        modalBg.lineStyle(6, 0x333333); // Increased border thickness
        modalBg.fillRoundedRect(-modalWidth / 2, -modalHeight / 2, modalWidth, modalHeight, 32);
        modalBg.strokeRoundedRect(-modalWidth / 2, -modalHeight / 2, modalWidth, modalHeight, 32);

        const image = this.scene.add.image(-modalWidth / 2 + 84, -modalHeight / 2 + 78, type === 'ladder' ? 'biru-full' : type === 'snake' ? 'merah-full' : 'kuning-full');
        image.setDisplaySize(90, 90); // Increased from 60x60

        const headerText = this.scene.add.text(image.x + 72, -modalHeight / 2 + 60, 'You encounter a quiz!', {
            fontFamily: '"Pixelify Sans"',
            fontSize: '42px', // Increased from 28px
            color: '#000000',
            align: 'center'
        });

        headerText.setOrigin(0);

        const pointText = this.scene.add.text(modalWidth / 2 - 250, -modalHeight / 2 + 67, `Points: +${quiz.points}`, {
            fontFamily: '"Pixelify Sans"',
            fontSize: '36px', // Increased from 24px
            color: '#0000004c',
            align: 'center'
        });

        pointText.setOrigin(0);

        // Question text
        const questionText = this.scene.add.text(-modalWidth / 2 + 57, image.y + 75, quiz.question, {
            fontFamily: '"Pixelify Sans"',
            fontSize: '36px', // Increased from 28px
            color: '#000000',
            align: 'left',
            wordWrap: { width: modalWidth - 114 } // Adjusted for larger modal
        });

        questionText.setOrigin(0);

        let answerElements = [];

        for (let i = 0; i < quiz.answers.length; i++) {
            const answerText = this.scene.add.text(-modalWidth / 2 + 57, questionText.y + 60 + i * 60, `${String.fromCharCode(97 + i)}. ${quiz.answers[i].text}`, {
                fontFamily: '"Pixelify Sans"',
                fontSize: '32px', // Increased from 24px
                color: '#000000',
                align: 'left',
                wordWrap: { width: modalWidth - 114 } // Adjusted for larger modal
            });

            answerText.setOrigin(0);
            answerElements.push(answerText);
        }

        let answerButtons = [];
        // A-D Buttons
        for (let i = 0; i < 4; i++) {
            const button = this.createButton(-modalWidth / 2 + 150 + i * 222, modalHeight / 2 - 82, String.fromCharCode(65 + i), 0x2196F3, () => {
                this.handleQuizAnswer(i, quiz, onResult);
            });

            answerButtons.push(button);
        }

        modal.add([overlay, modalBg, image, headerText, pointText, questionText, ...answerElements, ...answerButtons]);
        this.modal = modal;

        // Play quiz audio for ladder and snake questions
        this.scene.sound.play(quiz.audio);
    }

    private createButton(x: number, y: number, text: string, color: number, callback: () => void): Phaser.GameObjects.Container {
        const button = this.scene.add.container(x, y);
        const buttonWidth = 200; // Increased from 135
        const buttonHeight = 75; // Increased from 50

        const buttonBg = this.scene.add.graphics();
        buttonBg.fillStyle(color);
        buttonBg.fillRoundedRect(-buttonWidth / 2, -buttonHeight / 2, buttonWidth, buttonHeight, 15);

        const buttonText = this.scene.add.text(0, 0, text, {
            fontFamily: '"Pixelify Sans"',
            fontSize: '32px', // Increased from 20px
            color: '#ffffff'
        });
        buttonText.setOrigin(0.5);

        button.add([buttonBg, buttonText]);
        
        // Set interactive with explicit hit area
        button.setInteractive(
            new Phaser.Geom.Rectangle(-100, -37.5, 200, 75), // Adjusted for new button size
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
            buttonBg.fillRoundedRect(-100, -37.5, 200, 75, 15);
            buttonBg.setAlpha(0.8);
        });

        button.on('pointerout', () => {
            buttonBg.clear();
            buttonBg.fillStyle(color);
            buttonBg.fillRoundedRect(-100, -37.5, 200, 75, 15);
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

    private showTeacherInstructionModal(onResult: (correct: boolean, points: number) => void): void {
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
        const modalWidth = 960;
        const modalHeight = 400; // Smaller height for simpler content
        const modalBg = this.scene.add.graphics();
        modalBg.fillStyle(0xffffff);
        modalBg.lineStyle(6, 0x333333);
        modalBg.fillRoundedRect(-modalWidth / 2, -modalHeight / 2, modalWidth, modalHeight, 32);
        modalBg.strokeRoundedRect(-modalWidth / 2, -modalHeight / 2, modalWidth, modalHeight, 32);

        // Character image
        const image = this.scene.add.image(-modalWidth / 2 + 84, -modalHeight / 2 + 78, 'kuning-full');
        image.setDisplaySize(90, 90);

        // Header text
        const headerText = this.scene.add.text(image.x + 72, -modalHeight / 2 + 60, 'Quiz Box!', {
            fontFamily: '"Pixelify Sans"',
            fontSize: '42px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0);

        // Instruction text
        const instructionText = this.scene.add.text(0, 0, 'Follow the teacher instructions\nto gain points!', {
            fontFamily: '"Pixelify Sans"',
            fontSize: '36px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);

        // Continue button
        const button = this.createButton(0, modalHeight/2 - 82, 'Continue', 0x2196F3, () => {
            // Always return as correct with 0 points - actual points will be awarded by teacher
            onResult(true, 0);
            this.closeModal();
        });

        modal.add([overlay, modalBg, image, headerText, instructionText, button]);
        this.modal = modal;
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

    public closeModal(): void {
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