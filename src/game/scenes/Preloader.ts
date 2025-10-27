import { Scene } from 'phaser';

export class Preloader extends Scene
{
    constructor ()
    {
        super('Preloader');
    }

    init ()
    {
        //  A simple progress bar. This is the outline of the bar.
        this.add.rectangle(512, 384, 468, 32).setStrokeStyle(1, 0xffffff);

        //  This is the progress bar itself. It will increase in size from the left based on the % of progress.
        const bar = this.add.rectangle(512-230, 384, 4, 28, 0xffffff);

        //  Use the 'progress' event emitted by the LoaderPlugin to update the loading bar
        this.load.on('progress', (progress: number) => {

            //  Update the progress bar (our bar is 464px wide, so 100% = 464px)
            bar.width = 4 + (460 * progress);

        });
    }

    preload ()
    {
        //  Load the assets for the game - Replace with your own assets
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
            this.scene.start('Match');
        });
    }

    private createDiceAnimations() {
        // Create a dice roll animation with fading effect
        // This will be available to all scenes
        const diceKeys = ['dice-1', 'dice-2', 'dice-3', 'dice-4', 'dice-5', 'dice-6'];
        
        // Create rolling animation data (this will be used programmatically)
        this.registry.set('diceKeys', diceKeys);
        this.registry.set('diceAnimationConfig', {
            duration: 1000, // 1 second roll
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
