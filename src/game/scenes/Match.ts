import { BoardController } from '../controllers/Board';
import { PlayerController } from '../controllers/Player';
import { EventBus } from '../EventBus';
import { Scene } from 'phaser';

export class Match extends Scene
{
    camera: Phaser.Cameras.Scene2D.Camera;
    background: Phaser.GameObjects.Image;
    gameText: Phaser.GameObjects.Text;

    private boardController!: BoardController;
    private playerInfoTexts: Phaser.GameObjects.Text[] = [];

    constructor ()
    {
        super('Match');
    }

    create ()
    {
        this.camera = this.cameras.main;
        
        // Center the background and scale it to cover the entire screen
        this.background = this.add.image(this.camera.width / 2, this.camera.height / 2, 'background');
        this.background.setDisplaySize(this.camera.width, this.camera.height);
        this.background.setOrigin(0.5, 0.5);
        
        this.background.postFX?.addBlur(24);
        
        this.background.setDepth(-10);

        this.createSVLogo();
        this.createPlayerInfo();
        this.createPlayerTurnInfo();
        this.createGameBoard();

        // Calculate board center position (same as in createGameBoard)
        const { x, y } = this.getRelativePercentagePos(470, 40);
        const width = 1000;
        const height = 1000;
        const boardX = x + width / 2;
        const boardY = y + height / 2;
        
        this.boardController = new BoardController(this, boardX, boardY);
        
        this.boardController.addPlayer('Player 1', 'hijau-head');
        this.boardController.addPlayer('Player 2', 'biru-head');
        this.boardController.addPlayer('Player 3', 'merah-head');
        this.boardController.addPlayer('Player 4', 'kuning-head');
        
        const players = this.boardController.getPlayers();
        console.log('Players:', players);
        console.log('Current Player:', this.boardController.getCurrentPlayer());
        console.log('Next Player:', this.boardController.getNextPlayer());

        EventBus.emit('current-scene-ready', this);
    }

    createSVLogo() {
        const width = 254;
        const height = 107;
        
        // Responsive positioning: 8.4% from left, 5.6% from top (based on 1920x1080)
        const { x, y } = this.getRelativePercentagePos(100, 60);
        const posX = x + width / 2;
        const posY = y + height / 2;

        const container = this.add.container(posX, posY);
         
        // Create container background - positioned relative to container center
        const containerBg = this.add.graphics();
        containerBg.fillStyle(0xffffff);
        containerBg.fillRoundedRect(-width/2, -height/2, width, height, height / 2);

        container.add(containerBg);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });
        container.setDepth(100);

        const image = this.add.image(0, 0, 'sv-logo').setDisplaySize(194, 77);
        container.add(image);
        // container.add([containerBg, image]);
    }

    createPlayerTurnInfo() {
        const width = 295;
        const height = 375.02;
        
        
        const { x, y } = this.getRelativePercentagePos(1520, 352.49);
        const posX = x + width / 2;
        const posY = y + height / 2;
        const roundedRadius = 24;

        const container = this.add.container(posX, posY);
        
        // Create container background - positioned relative to container center
        const containerBg = this.add.graphics();
        containerBg.fillStyle(0xEAC7A3);
        containerBg.fillRoundedRect(-width/2, -height/2, width, height, roundedRadius);

        container.add(containerBg);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });
        container.setDepth(100);


        const headerImage = this.add.image(0, 0, 'hijau-full');
        const headerImageSizeX = 70;
        const headerImageSizeY = 70;
        const headerImageOffset = 24;

        headerImage.setDisplaySize(headerImageSizeX, headerImageSizeY);
        const imagePos = this.getRelativePosition(width, height, headerImageOffset - 12, headerImageOffset, headerImageSizeX, headerImageSizeY);
        headerImage.setPosition(imagePos.x, imagePos.y);
        
        const headerTextOffset = 0;
        const textPos = this.getRelativePosition(width, height, headerImageOffset - 12 + headerImageSizeX + headerTextOffset, headerImageOffset + headerImageSizeY/2);
        
        const headerText = this.createCrispText(textPos.x, textPos.y, 'Player 3\nTurn', {
            fontFamily: '"Pixelify Sans"',
            fontSize: '32px',
            color: '#000000'
        });

        headerText.setOrigin(0, 0.5);

        const rollTheDiceTextOffset = 32;
        const rollTheDicePos = this.getRelativePosition(width, height, width/2, headerImageOffset + headerImageSizeY + rollTheDiceTextOffset);
        
        const rollTheDiceText = this.createCrispText(rollTheDicePos.x, rollTheDicePos.y, 'Roll the Dice!', {
            fontFamily: '"Pixelify Sans"',
            fontSize: '32px',
            color: '#000000'
        });

        rollTheDiceText.setOrigin(0.5, 0.5);

        const diceImage = this.add.image(0, 0, 'dice-1');
        const diceOffset = 14;
        const diceImagePos = this.getRelativePosition(width, height, width/2, headerImageOffset + headerImage.height + rollTheDiceTextOffset + rollTheDiceText.height + diceOffset);
        diceImage.setPosition(diceImagePos.x, diceImagePos.y);
        diceImage.setDisplaySize(100, 100);
        
        // Make dice interactive for rolling
        diceImage.setInteractive({ useHandCursor: true });
        diceImage.on('pointerdown', () => {
            this.rollDice(diceImage, headerText, headerImage, nextPlayerText, nextPlayerImage);
        });

        // Next Player text and image - 24px below dice
        const nextPlayerTextPos = this.getRelativePosition(width, height, width / 2.5, headerImageOffset + headerImage.height + rollTheDiceTextOffset + rollTheDiceText.height + diceOffset + diceImage.displayHeight);
        
        const nextPlayerText = this.createCrispText(nextPlayerTextPos.x, nextPlayerTextPos.y, 'Next Player: ', {
            fontFamily: '"Pixelify Sans"',
            fontSize: '24px',
            color: '#000000'
        });
        nextPlayerText.setOrigin(0.5, 0.5);

        // Next player image - positioned next to the text
        const nextPlayerImage = this.add.image(0, 0, 'biru-head');
        const imageSpacing = 8;
        const nextPlayerImagePos = this.getRelativePosition(width, height, width/2 + nextPlayerText.width/2 + imageSpacing, headerImageOffset + headerImage.height + rollTheDiceTextOffset + rollTheDiceText.height + diceOffset + diceImage.displayHeight);
        nextPlayerImage.setPosition(nextPlayerImagePos.x, nextPlayerImagePos.y);
        nextPlayerImage.setDisplaySize(40, 40);

        
        container.add([headerImage, headerText, rollTheDiceText, diceImage, nextPlayerText, nextPlayerImage]);
    }


    createPlayerInfo() {
        const width = 369;
        const height = 338;
        
        const { x, y } = this.getRelativePercentagePos(40, 379);
        const posX = x + width / 2;
        const posY = y + height / 2;
        const roundedRadius = 25;

        const container = this.add.container(posX, posY);
        
        // Create container background - positioned relative to container center
        const containerBg = this.add.graphics();
        containerBg.fillStyle(0xEAC7A3);
        containerBg.fillRoundedRect(-width/2, -height/2, width, height, roundedRadius);

        container.add(containerBg);
        container.setSize(width, height);
        container.setInteractive({ useHandCursor: true });
        container.setDepth(100);


        const headerImage = this.add.image(0, 0, 'hijau-full');
        const headerImageSizeX = 70;
        const headerImageSizeY = 70;
        const headerImageOffset = 24;

        headerImage.setDisplaySize(headerImageSizeX, headerImageSizeY);
        const imagePos = this.getRelativePosition(width, height, headerImageOffset - 12, headerImageOffset, headerImageSizeX, headerImageSizeY);
        headerImage.setPosition(imagePos.x, imagePos.y);
        

        const headerTextOffset = 0;
        const textPos = this.getRelativePosition(width, height, headerImageOffset - 12 + headerImageSizeX + headerTextOffset, headerImageOffset + headerImageSizeY/2);
        
        const headerText = this.createCrispText(textPos.x, textPos.y, 'Player Information', {
            fontFamily: '"Pixelify Sans"',
            fontSize: '28px',
            color: '#000000'
        });

        headerText.setOrigin(0, 0.5);

        // Get dynamic player data from board controller
        const dynamicPlayers = this.boardController ? this.boardController.getPlayers().map(player => ({
            key: player.sprite.texture.key,
            name: player.name,
            points: player.scores
        })) : [
            { key: 'hijau-head', name: 'Player 1', points: 0 },
            { key: 'biru-head', name: 'Player 2', points: 0 },
            { key: 'merah-head', name: 'Player 3', points: 0 },
            { key: 'kuning-head', name: 'Player 4', points: 0 }
        ];

        const playerImageSize = 40;
        const playerRowHeight = 50; // Height between each row
        const playerStartY = headerImageOffset + headerImageSizeY + 24; // 24px below header
        const containerPadding = 24; // 24px padding from edges
        const imageToTextSpacing = 12; // 12px space between image and text
        
        // Calculate available width for text content (container width minus left and right padding)
        const availableWidth = width - (containerPadding * 2) - playerImageSize - imageToTextSpacing;
        const nameWidth = Math.floor(availableWidth * 0.5); // percentage

        for (let i = 0; i < dynamicPlayers.length; i++) {
            const player = dynamicPlayers[i];
            const rowY = playerStartY + (i * playerRowHeight);

            // Player image - 24px from left edge
            const playerImage = this.add.image(0, 0, player.key);
            playerImage.setDisplaySize(playerImageSize, playerImageSize);
            const imagePos = this.getRelativePosition(width, height, containerPadding, rowY, playerImageSize, playerImageSize);
            playerImage.setPosition(imagePos.x, imagePos.y);

            // Player name (dynamic width) - 12px from image, aligned with image center
            const namePos = this.getRelativePosition(width, height, containerPadding + playerImageSize + imageToTextSpacing, rowY + playerImageSize/2);
            const playerName = this.createCrispText(namePos.x, namePos.y, player.name, {
                fontFamily: '"Pixelify Sans"',
                fontSize: '24px',
                color: '#000000',
                fixedWidth: nameWidth,
                align: 'left'
            });
            playerName.setOrigin(0, 0.5);

            // Colon (aligned) - horizontally aligned with image center
            const colonPos = this.getRelativePosition(width, height, containerPadding + playerImageSize + imageToTextSpacing + nameWidth, rowY + playerImageSize/2);
            const colon = this.createCrispText(colonPos.x, colonPos.y, ':', {
                fontFamily: '"Pixelify Sans"',
                fontSize: '24px',
                color: '#000000'
            });
            colon.setOrigin(0, 0.5);

            // Points - horizontally aligned with image center, fits within right padding
            const pointsPos = this.getRelativePosition(width, height, containerPadding + playerImageSize + imageToTextSpacing + nameWidth + 16, rowY + playerImageSize/2);
            const points = this.createCrispText(pointsPos.x, pointsPos.y, `${player.points} points`, {
                fontFamily: '"Pixelify Sans"',
                fontSize: '24px',
                color: '#000000'
            });
            points.setOrigin(0, 0.5);

            // Store reference to points text for updates
            this.playerInfoTexts[i] = points;

            // Add all elements to container
            container.add([playerImage, playerName, colon, points]);
        }

        container.add([headerImage, headerText]);
    }

    createGameBoard() {
        const width = 1000;
        const height = 1000;
        const borderRadius = 14;
        
        const { x, y } = this.getRelativePercentagePos(470, 40);
        const posX = x + width / 2;
        const posY = y + height / 2;
        
        // Create the image first
        const img = this.add.image(posX, posY, 'board');
        img.setDisplaySize(width, height);
        
        // Create rounded mask at the same position as the image
        const mask = this.add.graphics();
        mask.fillStyle(0xffffff);
        mask.fillRoundedRect(posX - width/2, posY - height/2, width, height, borderRadius);
        
        // Apply mask to image
        img.setMask(mask.createGeometryMask());
        
        img.setDepth(50);
    }

    private createCrispText(x: number, y: number, text: string, style: Phaser.Types.GameObjects.Text.TextStyle): Phaser.GameObjects.Text {
        const textObj = this.add.text(x, y, text, {
            ...style,
            resolution: window.devicePixelRatio || 1 // Use device pixel ratio for crisp rendering
        });
        
        // Ensure pixel-perfect positioning
        textObj.setPosition(Math.round(textObj.x), Math.round(textObj.y));
        
        return textObj;
    }

    // Reusable function to calculate relative position within a container
    private getRelativePosition(containerWidth: number, containerHeight: number, fromLeft: number, fromTop: number, childWidth?: number, childHeight?: number) {
        // Calculate position relative to container's top-left corner
        // Container center is at (0, 0), so:
        // - Left edge is at -containerWidth/2
        // - Top edge is at -containerHeight/2
        
        const x = -containerWidth/2 + fromLeft + (childWidth ? childWidth/2 : 0);
        const y = -containerHeight/2 + fromTop + (childHeight ? childHeight/2 : 0);
        
        return { x, y };
    }

    private getRelativePercentagePos(x: number, y: number) {
        return {
            x: (x / 1920) * this.camera.width,
            y: (y / 1080) * this.camera.height
        }
    }

    private rollDice(
        diceImage: Phaser.GameObjects.Image, 
        headerText: Phaser.GameObjects.Text,
        headerImage: Phaser.GameObjects.Image,
        nextPlayerText: Phaser.GameObjects.Text,
        nextPlayerImage: Phaser.GameObjects.Image
    ): void {
        if (!this.boardController) return;

        const currentPlayer = this.boardController.getCurrentPlayer();
        const nextPlayer = this.boardController.getNextPlayer();
        
        if (!currentPlayer || !nextPlayer) return;

        // Roll dice with animation and player movement
        this.boardController.rollDice(diceImage, (diceValue: number) => {
            console.log(`${currentPlayer.name} rolled ${diceValue}!`);
            
            // Switch to next player's turn
            this.boardController.nextTurn();
            
            // Update UI to show next player's turn
            this.updatePlayerTurnUI(headerText, headerImage, nextPlayerText, nextPlayerImage);
            
            // Update player information display with latest scores
            this.updatePlayerInfoDisplay();
        });
    }

    private updatePlayerTurnUI(
        headerText: Phaser.GameObjects.Text,
        headerImage: Phaser.GameObjects.Image,
        nextPlayerText: Phaser.GameObjects.Text,
        nextPlayerImage: Phaser.GameObjects.Image
    ): void {
        const currentPlayer = this.boardController.getCurrentPlayer();
        const nextPlayer = this.boardController.getNextPlayer();
        
        if (!currentPlayer || !nextPlayer) return;

        // Update current player display
        headerText.setText(`${currentPlayer.name}\nTurn`);
        
        // Map player names to their sprite keys
        const playerSpriteMap: { [key: string]: string } = {
            'Player 1': 'hijau-head',
            'Player 2': 'biru-head', 
            'Player 3': 'merah-head',
            'Player 4': 'kuning-head'
        };

        const playerFullSpriteMap: { [key: string]: string } = {
            'Player 1': 'hijau-full',
            'Player 2': 'biru-full',
            'Player 3': 'merah-full', 
            'Player 4': 'kuning-full'
        };

        // Update header image to current player
        const currentPlayerFullSprite = playerFullSpriteMap[currentPlayer.name];
        if (currentPlayerFullSprite) {
            headerImage.setTexture(currentPlayerFullSprite);
        }

        // Update next player display
        const nextPlayerSprite = playerSpriteMap[nextPlayer.name];
        if (nextPlayerSprite) {
            nextPlayerImage.setTexture(nextPlayerSprite);
        }
    }

    private updatePlayerInfoDisplay(): void {
        if (!this.boardController) return;

        const players = this.boardController.getPlayers();
        
        for (let i = 0; i < players.length && i < this.playerInfoTexts.length; i++) {
            const player = players[i];
            const pointsText = this.playerInfoTexts[i];
            
            if (pointsText) {
                pointsText.setText(`${player.scores} points`);
            }
        }
    }

    changeScene ()
    {
        this.scene.start('GameOver');
    }
}
