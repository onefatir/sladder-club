import { GameObjects, Scene } from 'phaser';
import { EventBus } from '../EventBus';

export class MainMenu extends Scene {
    private camera!: Phaser.Cameras.Scene2D.Camera;
    private background!: GameObjects.Image;
    private logo!: GameObjects.Image;
    private instructionsModal?: GameObjects.Container;
    private bgMusic!: Phaser.Sound.BaseSound;

    constructor() {
        super('MainMenu');
    }

    create() {
        this.camera = this.cameras.main;

        // Start background music
        this.bgMusic = this.sound.add('bgm-main-menu', {
            loop: true,
            volume: 1
        });
        this.bgMusic.play();

        // Create and blur background
        this.background = this.add.image(this.camera.width / 2, this.camera.height / 2, 'background');
        this.background.setDisplaySize(this.camera.width, this.camera.height);
        this.background.setOrigin(0.5, 0.5);
        this.background.postFX?.addBlur(24);
        this.background.setDepth(-10);

        // Add logo with proper scaling
        this.logo = this.add.image(this.camera.centerX, this.camera.centerY - 150, 'logo');
        this.logo.setScale(0.4);
        this.logo.setDepth(100);

        // Add game title text
        const titleText = this.add.text(this.camera.centerX, this.camera.centerY + 35, 'Sladder Club', {
            fontFamily: '"Pixelify Sans"',
            fontSize: '48px',
            color: '#000000',
            stroke: '#ffffff',
            strokeThickness: 4
        }).setOrigin(0.5);
        titleText.setDepth(100);

        // Create Play button
        this.createButton(
            this.camera.centerX,
            this.camera.centerY + 100,
            'Play Game',
            () => {
                this.shutdown();
                this.scene.start('Match');
            }
        );

        // Create Instructions button
        this.createButton(
            this.camera.centerX,
            this.camera.centerY + 180,
            'Instructions',
            () => this.showInstructions()
        );

        EventBus.emit('current-scene-ready', this);
    }

    private createButton(x: number, y: number, text: string, onClick: () => void) {
        const padding = { x: 40, y: 20 };
        const buttonWidth = 200;
        const buttonHeight = 60;
        const roundedRadius = 10;

        const button = this.add.container(x, y);
        
        // Button background
        const bg = this.add.graphics();
        bg.fillStyle(0xEAC7A3);
        bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, roundedRadius);

        // Button text
        const buttonText = this.add.text(0, 0, text, {
            fontFamily: '"Pixelify Sans"',
            fontSize: '28px',
            color: '#000000'
        }).setOrigin(0.5);

        button.add([bg, buttonText]);
        button.setSize(buttonWidth, buttonHeight);
        button.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                bg.clear();
                bg.fillStyle(0xd4b38f);
                bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, roundedRadius);
            })
            .on('pointerout', () => {
                bg.clear();
                bg.fillStyle(0xEAC7A3);
                bg.fillRoundedRect(-buttonWidth/2, -buttonHeight/2, buttonWidth, buttonHeight, roundedRadius);
            })
            .on('pointerdown', onClick);

        return button;
    }

    private showInstructions() {
        if (this.instructionsModal) {
            this.instructionsModal.destroy();
            this.instructionsModal = undefined;
            return;
        }

        const modalWidth = 600;
        const modalHeight = 500;
        const padding = 20;

        // Create modal container
        this.instructionsModal = this.add.container(this.camera.centerX, this.camera.centerY);

        // Semi-transparent background overlay
        const overlay = this.add.rectangle(
            0,
            0,
            this.camera.width,
            this.camera.height,
            0x000000,
            0.5
        );
        overlay.setPosition(0, 0);
        this.instructionsModal.add(overlay);

        // Modal background
        const modalBg = this.add.graphics();
        modalBg.fillStyle(0xffffff);
        modalBg.fillRoundedRect(-modalWidth/2, -modalHeight/2, modalWidth, modalHeight, 16);
        this.instructionsModal.add(modalBg);

        // Title
        const title = this.add.text(0, -modalHeight/2 + padding + 10, 'How to Play', {
            fontFamily: '"Pixelify Sans"',
            fontSize: '32px',
            color: '#000000'
        }).setOrigin(0.5, 0);
        this.instructionsModal.add(title);

        // Instructions text
        const instructions = [
            '1. Roll the dice on your turn',
            '2. If you land on a ladder, answer quiz and climb up!',
            '3. If you land on a snake head, answer quiz to avoid sliding down!',
            '4. If you land on a quiz box, answer quiz to earn bonus points!',
            '5. Rolls 6 dice to get extra roll!',
            '6. First player to reach 100 wins!'
        ];

        const instructionsText = this.add.text(
            -modalWidth/2 + padding + 10,
            -modalHeight/2 + padding + 70,
            instructions.join('\n\n'),
            {
                fontFamily: '"Pixelify Sans"',
                fontSize: '24px',
                color: '#000000',
                wordWrap: { width: modalWidth - (padding * 2) - 20 }
            }
        );

        this.instructionsModal.add(instructionsText);

        // Close button
        const closeButton = this.createButton(0, modalHeight/2 - padding - 30, 'Close', () => {
            this.showInstructions();
        });
        this.instructionsModal.add(closeButton);

        // Make the modal interactive
        overlay.setInteractive()
            .on('pointerdown', () => {
                this.showInstructions();
            });

        this.instructionsModal.setDepth(1000);
    }

    shutdown() {
        if (this.bgMusic) {
            this.bgMusic.stop();
        }
    }
}
