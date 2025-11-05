import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        // Set white background
        this.cameras.main.setBackgroundColor('#ffffff');

        // Get the center of the screen
        const centerX = this.cameras.main.centerX;
        const centerY = this.cameras.main.centerY;

        // Create temporary text while logo loads
        const tempText = this.add.text(centerX, centerY - 50, 'Loading...', {
            fontFamily: '"Pixelify Sans"',
            fontSize: '32px',
            color: '#000000'
        }).setOrigin(0.5);

        // Create loading bar background
        const barWidth = 400;
        const barHeight = 20;
        this.add.rectangle(centerX, centerY + 120, barWidth, barHeight)
            .setStrokeStyle(2, 0x000000)
            .setFillStyle(0xf0f0f0);

        // Create progress bar
        const bar = this.add.rectangle(
            centerX - (barWidth/2),
            centerY + 120,
            4,
            barHeight - 4,
            0x2196F3
        ).setOrigin(0, 0.5);

        // Update progress bar
        this.load.on('progress', (progress: number) => {
            bar.width = (barWidth - 4) * progress;
        });

        // When logo is loaded, replace the temp text
        this.load.on('filecomplete-image-logo', () => {
            tempText.destroy();
            const logo = this.add.image(centerX, centerY - 100, 'logo');
            logo.setScale(0.3); // Make the logo smaller
        });
    }

    preload ()
    {
        // Set the assets path and load logo first
        this.load.setPath('assets');
        this.load.image('logo', 'logo.png');

        this.load.image('star', 'star.png');

        // Logo
        this.load.image('sv-logo', 'logo-sv.png')
        
        // Characters
        this.load.image('biru-full', 'characters/biru-full.png');
        this.load.image('biru-head', 'characters/biru-head.png');
        this.load.image('hijau-full', 'characters/hijau-full.png');
        this.load.image('hijau-head', 'characters/hijau-head.png');
        this.load.image('merah-full', 'characters/merah-full.png');
        this.load.image('merah-head', 'characters/merah-head.png');
        this.load.image('kuning-full', 'characters/kuning-full.png');
        this.load.image('kuning-head', 'characters/kuning-head.png');

        this.load.image('board', 'board.png');
        
        // Load individual dice images
        this.load.image('dice-1', 'dices/dice-1.png');
        this.load.image('dice-2', 'dices/dice-2.png');
        this.load.image('dice-3', 'dices/dice-3.png');
        this.load.image('dice-4', 'dices/dice-4.png');
        this.load.image('dice-5', 'dices/dice-5.png');
        this.load.image('dice-6', 'dices/dice-6.png');

        // Load sounds
        this.load.audio('dice-sound', 'sounds/dice.mp3');
        this.load.audio('slot-machine', 'sounds/slot-machine.mp3');
        this.load.audio('walk-1', 'sounds/walk-1.mp3');
        this.load.audio('walk-2', 'sounds/walk-2.mp3');
        this.load.audio('bgm-main-menu', 'sounds/bgm-main-menu.mp3');

        this.load.json('quiz-data', 'quiz.json');
    }

    create ()
    {
        // Create dice fading animations that can be used in other scenes
        this.createDiceAnimations();
        
        //  Wait for fonts to load before proceeding
        this.waitForFonts().then(() => {
            //  When all the assets have loaded, it's often worth creating global objects here that the rest of the game can use.
            //  For example, you can define global animations here, so we can use them in other scenes.

            //  Move to the MainMenu. You could also swap this for a Scene Transition, such as a camera fade.
            this.scene.start('MainMenu');
        });
    }

    private createDiceAnimations() {
        // Create a dice roll animation with fading effect
        // This will be available to all scenes
        const diceKeys = ['dice-1', 'dice-2', 'dice-3', 'dice-4', 'dice-5', 'dice-6'];
        
        // Create rolling animation data (this will be used programmatically)
        this.registry.set('diceKeys', diceKeys);
        this.registry.set('diceAnimationConfig', {
            duration: 5_000, // 5 second roll
            fadeInDuration: 200, // 0.2 seconds fade in
            fadeOutDuration: 200, // 0.2 seconds fade out
            rollInterval: 100 // Change dice every 100ms during roll
        });
    }

    private async waitForFonts(): Promise<void>
    {
        return new Promise((resolve) => {
            // Check if document.fonts is available (modern browsers)
            if (document.fonts && document.fonts.ready) {
                document.fonts.ready.then(() => {
                    console.log('Fonts loaded successfully');
                    resolve();
                });
            } else {
                // Fallback: wait a bit for fonts to load
                setTimeout(() => {
                    console.log('Font loading fallback timeout');
                    resolve();
                }, 1000);
            }
        });
    }
}
