import { Scene } from 'phaser';
import { PlayerController } from './Player';

export class GameModal {
    private scene: Scene;
    private modal: Phaser.GameObjects.Container | null = null;

    constructor(scene: Scene) {
        this.scene = scene;
    }

    public showPlayerFinished(player: PlayerController, position: number): void {
        this.closeModal();
        
        // Create modal container centered on screen
        const modal = this.scene.add.container(this.scene.sys.game.config.width as number / 2, this.scene.sys.game.config.height as number / 2);
        modal.setDepth(1000);

        // Background overlay
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(-this.scene.sys.game.config.width as number / 2, -this.scene.sys.game.config.height as number / 2, 
            this.scene.sys.game.config.width as number, this.scene.sys.game.config.height as number);

        // Modal background
        const modalBg = this.scene.add.graphics();
        modalBg.fillStyle(0xffffff);
        modalBg.lineStyle(4, 0x333333);
        const width = 600;
        const height = 400;
        modalBg.fillRoundedRect(-width/2, -height/2, width, height, 24);
        modalBg.strokeRoundedRect(-width/2, -height/2, width, height, 24);

        // Title and info
        const title = this.scene.add.text(0, -height/2 + 40, `🎉 ${player.name} Finished! 🎉`, {
            fontFamily: '"Pixelify Sans"',
            fontSize: '32px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);

        const info = this.scene.add.text(0, 0, [
            `Position: #${position}`,
            `Total Points: ${player.scores}`,
            '',
            'Keep playing until all players finish!'
        ].join('\n'), {
            fontFamily: '"Pixelify Sans"',
            fontSize: '24px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);

        // Continue button
        const button = this.createButton(0, height/2 - 60, 'Continue', 200, 50, () => {
            this.closeModal();
        });

        modal.add([overlay, modalBg, title, info, button]);
        this.modal = modal;
    }

    public showGameFinished(finishedPlayers: PlayerController[], pointRanking: PlayerController[], onBackToMenu: () => void): void {
        this.closeModal();
        
        // Create modal container
        const modal = this.scene.add.container(this.scene.sys.game.config.width as number / 2, this.scene.sys.game.config.height as number / 2);
        modal.setDepth(1000);

        // Background overlay
        const overlay = this.scene.add.graphics();
        overlay.fillStyle(0x000000, 0.7);
        overlay.fillRect(-this.scene.sys.game.config.width as number / 2, -this.scene.sys.game.config.height as number / 2, 
            this.scene.sys.game.config.width as number, this.scene.sys.game.config.height as number);

        // Modal background
        const modalBg = this.scene.add.graphics();
        modalBg.fillStyle(0xffffff);
        modalBg.lineStyle(4, 0x333333);
        const width = 800;
        const height = 600;
        modalBg.fillRoundedRect(-width/2, -height/2, width, height, 24);
        modalBg.strokeRoundedRect(-width/2, -height/2, width, height, 24);

        // Title
        const title = this.scene.add.text(0, -height/2 + 40, '🎉 Game Finished! 🎉', {
            fontFamily: '"Pixelify Sans"',
            fontSize: '36px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);

        // Finish order
        const finishOrderTitle = this.scene.add.text(0, -height/3, 'Finish Order:', {
            fontFamily: '"Pixelify Sans"',
            fontSize: '28px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);

        const finishOrderText = this.scene.add.text(0, -height/3 + 70, 
            finishedPlayers.map((p, i) => `${i + 1}. ${p.name}`).join('\n'), {
            fontFamily: '"Pixelify Sans"',
            fontSize: '24px',
            color: '#666666',
            align: 'center'
        }).setOrigin(0.5);

        // Points ranking
        const pointsTitle = this.scene.add.text(0, 0, 'Points Ranking:', {
            fontFamily: '"Pixelify Sans"',
            fontSize: '28px',
            color: '#000000',
            align: 'center'
        }).setOrigin(0.5);

        const pointsText = this.scene.add.text(0, 70,
            pointRanking.map((p, i) => `${i + 1}. ${p.name} (${p.scores} points)`).join('\n'), {
            fontFamily: '"Pixelify Sans"',
            fontSize: '24px',
            color: '#666666',
            align: 'center'
        }).setOrigin(0.5);

        // Back to menu button
        const button = this.createButton(0, height/2 - 60, 'Back to Menu', 200, 50, onBackToMenu);

        modal.add([overlay, modalBg, title, finishOrderTitle, finishOrderText, pointsTitle, pointsText, button]);
        this.modal = modal;
    }

    private createButton(x: number, y: number, text: string, width: number, height: number, callback: () => void): Phaser.GameObjects.Container {
        const button = this.scene.add.container(x, y);
        
        // Button background
        const buttonBg = this.scene.add.graphics();
        buttonBg.fillStyle(0x2196F3);
        buttonBg.fillRoundedRect(-width/2, -height/2, width, height, 10);

        // Button text
        const buttonText = this.scene.add.text(0, 0, text, {
            fontFamily: '"Pixelify Sans"',
            fontSize: '24px',
            color: '#ffffff'
        }).setOrigin(0.5);

        button.add([buttonBg, buttonText]);
        button.setSize(width, height);
        
        button.setInteractive({ useHandCursor: true })
            .on('pointerover', () => {
                buttonBg.clear();
                buttonBg.fillStyle(0x1976D2);
                buttonBg.fillRoundedRect(-width/2, -height/2, width, height, 10);
            })
            .on('pointerout', () => {
                buttonBg.clear();
                buttonBg.fillStyle(0x2196F3);
                buttonBg.fillRoundedRect(-width/2, -height/2, width, height, 10);
            })
            .on('pointerdown', callback);

        return button;
    }

    public closeModal(): void {
        if (this.modal) {
            this.modal.destroy();
            this.modal = null;
        }
    }
}