window.addEventListener('load', function () {
    const canvas = document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    
    const minecraftiaFont = new FontFace('Minecraftia', 'url(./assets/Minecraftia-Regular.ttf)');

    minecraftiaFont.load().then(function (loadedFont) {
        document.fonts.add(loadedFont); // Add the font to the document
        console.log('Minecraftia font loaded!');
        
        // Call your initialization functions after the font is ready
        drawStartScreen();
    });

    canvas.width = 1600;
    canvas.height = 800;
    ctx.imageSmoothingEnabled = false;
    ctx.font = '50px Minecraftia';

    let gameStarted = false; // Flag to track if the game has started
    let gameOver = false; // Flag to track if the game is over
    let score = 0; // Player's score
    let startTextTimer = 0; // Timer to track the start text duration
    const startTextDuration = 5000; // Text appears for 3 seconds
    
    // Start screen background image
    const startScreenImage = document.getElementById('StartScreenImage');


    const boneCollectSound = new Audio('./assets/chomp.mp3'); // Adjust path as needed
    boneCollectSound.load();

    
    const jumpSound = new Audio('./assets/jump.mp3'); // Adjust path as needed
    boneCollectSound.load();

    // Draw the start screen
    function drawStartScreen() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(startScreenImage, 0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.font = '50px Minecraftia';

        if (score > 0) {
            // Display the score if the game has been played
            ctx.fillText(`Last Score: ${score}`, canvas.width / 2, canvas.height / 2 - 50);
        }
    }

    // Event listener to start the game
    function startGame() {
        if (!gameStarted) {
            gameStarted = true;
            gameOver = false;
    
            // Reset the score and player
            score = 0;
            player.restart();
    
            // Clear enemies
            enemies = [];
    
            // Restart the animation loop
            animate(0);
        }
    }
    

    // Add key and touch event listeners
    window.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowUp') {
            if (gameOver) {
                // Reset game and show start screen
                restartGame();
            } else if (!gameStarted) {
                startGame();
            }
        }
    });
    
    canvas.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (gameOver) {
            // Reset game and show start screen
            restartGame();
        } else if (!gameStarted) {
            startGame();
        }
    });

    // Function to handle game over
    function handleGameOver() {
        // Semi-transparent overlay
        ctx.fillStyle = 'rgba(0, 0, 0, 0.5)'; // Semi-transparent black
        ctx.fillRect(0, 0, canvas.width, canvas.height); // Overlay entire canvas
    
        // Draw "Game Over" text
        ctx.font = '50px Minecraftia';
        ctx.fillStyle = 'white';
        ctx.textAlign = 'center';
        ctx.fillText('Game Over', canvas.width / 2, canvas.height / 2 - 50);
    
        // Draw score
        ctx.font = '50px Minecraftia';
        ctx.fillText(`Score: ${score}`, canvas.width / 2, canvas.height / 2 + 50);
    
        // Restart instructions
        ctx.font = '50px Minecraftia';
        ctx.fillText('Touch to Restart', canvas.width / 2, canvas.height / 2 + 150);
    
        // Set gameOver flag
        gameOver = true;
    }
    
    
    

    // Class to handle keyboard input for player movement
    // Modify InputHandler class to include touch controls
    class InputHandler {
        constructor() {
            this.keys = []; // Tracks pressed keys
    
            // Keyboard controls
            window.addEventListener('keydown', e => {
                if ((e.key === 'ArrowUp' || e.key === 'ArrowDown' || e.key === 'ArrowLeft' || e.key === 'ArrowRight') && 
                    !this.keys.includes(e.key)) {
                    this.keys.push(e.key);
                }
            });
    
            window.addEventListener('keyup', e => {
                this.keys = this.keys.filter(key => key !== e.key);
            });
    
            // Touch controls
            canvas.addEventListener('touchstart', e => {
                e.preventDefault(); // Prevent default touch behavior
                if (!input.keys.includes('ArrowUp')) input.keys.push('ArrowUp');
            });
            
            canvas.addEventListener('touchend', e => {
                e.preventDefault(); // Prevent default touch behavior
                input.keys = input.keys.filter(key => key !== 'ArrowUp');
            });            
        }
    }
    
    class Bone {
        constructor(gameWidth, gameHeight, spriteId, scaleFactor) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
    
            this.image = document.getElementById(spriteId); // ID of the bone sprite
            this.scaleFactor = scaleFactor;
    
            // Dimensions
            this.originalWidth = 64; // Adjust based on the bone sprite size
            this.originalHeight = 64;
            this.width = this.originalWidth * this.scaleFactor;
            this.height = this.originalHeight * this.scaleFactor;
    
            // Position
            this.x = this.gameWidth; // Spawn at the right edge
            const minY = 100; // Minimum vertical position
            const maxY = this.gameHeight - this.height - 100; // Maximum vertical position
            this.y = Math.random() * (maxY - minY) + minY;

            // Speed
            this.speed = 10; // Random speed for variety
            this.markedForDeletion = false; // Mark for removal after leaving screen
        }
    
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height);
        }
    
        update(deltaTime) {
            this.x -= this.speed; // Move left
            if (this.x < 0 - this.width) this.markedForDeletion = true; // Remove off-screen
        }
    }
    

    let bones = []; // Array to store bone objects
    let boneTimer = 0; // Timer for bone spawning
    let boneInterval = 2000; // Base interval between bone spawns (in milliseconds)

    function handleBones(deltaTime) {
        if (boneTimer > boneInterval) {
            // Spawn a new bone
            bones.push(new Bone(canvas.width, canvas.height, 'BoneSprite', 1.5)); // Adjust scale as needed
            boneTimer = 0;

            // Set a random interval for the next spawn
            boneInterval = Math.random() * 2000 + 1000; // Between 1 and 3 seconds
        } else {
            boneTimer += deltaTime;
        }

        // Update and draw bones
        bones.forEach(bone => {
            bone.draw(ctx);
            bone.update(deltaTime);
        });

        // Remove bones that are marked for deletion
        bones = bones.filter(bone => !bone.markedForDeletion);
    }


    // Class representing the player character
    // Class representing the player character
    class Player {
        constructor(gameWidth, gameHeight, scaleFactor = 1) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            
            // Scale factor for the player size
            this.scaleFactor = scaleFactor;
            
            // Original sprite dimensions
            this.originalWidth = 64; // Replace with the correct width of your player sprite
            this.originalHeight = 64; // Replace with the correct height of your player sprite
            
            // Scaled dimensions
            this.width = this.originalWidth * this.scaleFactor;
            this.height = this.originalHeight * this.scaleFactor;
            
            this.x = 100;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('PlayerImage');
            this.frameX = 0;
            this.frameY = 0;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.maxFrame = 4;
            this.speed = 0;
            this.vy = 0;
            this.weight = 1;
            this.jumpCount = 0; // Track jumps
    
            // Hitbox dimensions
            this.hitboxWidth = this.width * 0.8; // 80% of sprite width
            this.hitboxHeight = this.height * 0.8; // 80% of sprite height
            this.hitboxX = this.x + (this.width - this.hitboxWidth) / 2; // Initial hitbox X
            this.hitboxY = this.y + (this.height - this.hitboxHeight); // Initial hitbox Y
        }
    
        restart() {
            this.x = 100;
            this.y = this.gameHeight - this.height;
            this.maxFrame = 4;
            this.frameY = 0;
            this.jumpCount = 0; // Reset jump count
        }
    
        draw(context) {
            // Draw player sprite
            context.drawImage(
                this.image,
                this.frameX * this.originalWidth, this.frameY * this.originalHeight,
                this.originalWidth, this.originalHeight,
                this.x, this.y - 100,
                this.width, this.height
            );

        }
    
        update(input, deltaTime, enemies, bones) {
            // Update hitbox position dynamically
            this.hitboxX = this.x + (this.width - this.hitboxWidth) / 2;
            this.hitboxY = this.y + (this.height - this.hitboxHeight) - 100;
    
            // Collision detection for enemies
            enemies.forEach(enemy => {
                const dx = (enemy.hitboxX + enemy.hitboxWidth / 2) - (this.hitboxX + this.hitboxWidth / 2);
                const dy = (enemy.hitboxY + enemy.hitboxHeight / 2) - (this.hitboxY + this.hitboxHeight / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                const collisionRadius = ((enemy.hitboxWidth + this.hitboxWidth) / 2) *1;
                if (distance < collisionRadius) {
                    gameOver = true;
                }
            });


            
            bones.forEach((bone, index) => {
                const dx = (bone.x + bone.width / 2) - (this.hitboxX + this.hitboxWidth / 2);
                const dy = (bone.y + bone.height / 2) - (this.hitboxY + this.hitboxHeight / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
    
                if (distance < bone.width / 2 + this.hitboxWidth / 2) {
                    score++; // Increment score
                    boneCollectSound.currentTime = 0; // Reset sound to the start
                    boneCollectSound.play(); // Play the sound effect
                    bones.splice(index, 1); // Remove the bone from the array
                }
            });
            
    
            // Sprite animation
            if (this.frameTimer > this.frameInterval) {
                this.frameX = (this.frameX >= this.maxFrame) ? 0 : this.frameX + 1;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }
    
            // Controls for double jump
            if (input.keys.includes('ArrowUp') && this.jumpCount < 2) { // For double jump logic
                this.vy = -22; // Jump force
                this.jumpCount++; // Increment jump count
                input.keys = input.keys.filter(key => key !== 'ArrowUp'); // Prevent holding jump
            
                jumpSound.currentTime = 0; // Reset sound to the start
                jumpSound.play(); // Play the jump sound
            }
            
    
            this.y += this.vy;
    
            // Apply gravity if not on the ground
            if (!this.onGround()) {
                this.vy += this.weight;
                this.frameX = 4;
                this.maxFrame = 0;
            } else {
                this.vy = 0;
                this.frameY = 0;
                this.maxFrame = 3;
                this.jumpCount = 0; // Reset jump count on landing
            }
    
            // Prevent the player from going out of bounds
            if (this.x < 0) this.x = 0;
            if (this.x > this.gameWidth - this.width) this.x = this.gameWidth - this.width;
            if (this.y > this.gameHeight - this.height) this.y = this.gameHeight - this.height;
        }
    
        onGround() {
            return this.y >= this.gameHeight - this.height;
        }
    }
    
    



    // Class representing the background
    class Background {
        constructor(gameWidth, gameHeight, image, speedModifier) {
            this.gameWidth = gameWidth; // Canvas width
            this.gameHeight = gameHeight; // Canvas height
            this.image = image; // Background image
            this.speedModifier = speedModifier; // Parallax effect speed
            this.x = 0; // Horizontal position
            this.y = 0; // Vertical position
            this.speed = 10 * this.speedModifier; // Speed of scrolling
        }
    
        draw(context) {
            const imageAspectRatio = this.image.width / this.image.height;
            const canvasAspectRatio = this.gameWidth / this.gameHeight;
    
            // Calculate target dimensions
            let targetWidth, targetHeight;
    
            if (canvasAspectRatio > imageAspectRatio) {
                targetWidth = this.gameWidth;
                targetHeight = this.gameWidth / imageAspectRatio;
            } else {
                targetWidth = this.gameHeight * imageAspectRatio;
                targetHeight = this.gameHeight;
            }
    
            const offsetY = (this.gameHeight - targetHeight) / 2; // Center vertically
    
            // Draw the background image twice for seamless scrolling
            context.drawImage(this.image, this.x, offsetY, targetWidth, targetHeight);
            context.drawImage(this.image, this.x + targetWidth, offsetY, targetWidth, targetHeight);
    
            // Fix any gaps when the second image is partially drawn
            if (this.x + targetWidth < this.gameWidth) {
                context.drawImage(this.image, this.x + targetWidth * 2, offsetY, targetWidth, targetHeight);
            }
        }
    
        update() {
            const imageAspectRatio = this.image.width / this.image.height;
            let targetWidth;
    
            // Calculate the scaled width of the image
            if (this.gameWidth / this.gameHeight > imageAspectRatio) {
                targetWidth = this.gameWidth;
            } else {
                targetWidth = this.gameHeight * imageAspectRatio;
            }
    
            // Scroll the background
            this.x -= this.speed;
    
            // Reset position when the image scrolls out of view
            if (this.x <= -targetWidth) {
                this.x += targetWidth;
            }
        }
    
        restart() {
            this.x = 0;
        }
    }
    
    
    

    // Class representing an enemy
    class Enemy {
        constructor(gameWidth, gameHeight, spriteId, scaleFactor, hitboxWidthFactor, hitboxHeightFactor) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
    
            this.image = document.getElementById(spriteId); // Dynamic sprite selection
    
            // Scale factor for enemy size
            this.scaleFactor = scaleFactor;
    
            // Original sprite dimensions
            this.originalWidth = 128; // Replace with the correct width for your sprites
            this.originalHeight = 128; // Replace with the correct height for your sprites
    
            // Scaled dimensions
            this.width = this.originalWidth * this.scaleFactor;
            this.height = this.originalHeight * this.scaleFactor;
    
            this.x = this.gameWidth - 100; // Start position (right edge of canvas)
            this.y = this.gameHeight - this.height; // Position at ground level
            this.speed = 10; // Movement speed
            this.markedForDeletion = false; // Flag for removal
    
            // Hitbox dimensions customized per enemy type
            this.hitboxWidth = this.width * hitboxWidthFactor; // Width factor for hitbox
            this.hitboxHeight = this.height * hitboxHeightFactor; // Height factor for hitbox
            this.hitboxX = this.x + (this.width - this.hitboxWidth) / 2; // Center horizontally
            this.hitboxY = this.y + (this.height - this.hitboxHeight) - 50; // Adjust vertically
        }
    
        draw(context) {
            // Draw the enemy sprite
            context.drawImage(this.image, this.x, this.y - 115, this.width, this.height);
            
            // Visualize the hitbox (for debugging)
            //context.strokeStyle = 'red';
            //context.lineWidth = 2;
            //context.strokeRect(this.hitboxX, this.hitboxY - 100, this.hitboxWidth, this.hitboxHeight);
        }
    
        update(deltaTime) {
            this.x -= this.speed;
    
            // Update hitbox position
            this.hitboxX = this.x + (this.width - this.hitboxWidth) / 2;
            this.hitboxY = this.y + (this.height - this.hitboxHeight) - 50;
    
            if (this.x < 0 - this.width) {
                this.markedForDeletion = true;
                score++;
            }
        }
    }
    
    
    
    
    

    // Function to manage enemies
    function handleEnemies(deltaTime) {
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            // Define Enemy 2 sprite options
            const enemy2Sprites = ['Enemy2_Sprite1', 'Enemy2_Sprite2', 'Enemy2_Sprite3']; // Add sprite IDs here
    
            // Weighted randomization (Enemy 2 spawns more frequently)
            const totalWeight = 4; // 1 for Enemy 1, 3 for Enemy 2
            const randomValue = Math.random() * totalWeight;
    
            const isTypeOne = randomValue < 1; // Enemy 1 spawns if randomValue < 1
            const spriteId = isTypeOne
                ? 'Enemy1_Sprite' // Single sprite for Enemy 1
                : enemy2Sprites[Math.floor(Math.random() * enemy2Sprites.length)]; // Random sprite for Enemy 2
            const scaleFactor = isTypeOne ? 2.5 : 2; // Scale factor for size
            const hitboxWidthFactor = isTypeOne ? 0.4 : 0.4; // Hitbox width
            const hitboxHeightFactor = isTypeOne ? 1.5 : 0.4; // Hitbox height
    
            // Spawn the enemy
            enemies.push(
                new Enemy(canvas.width, canvas.height, spriteId, scaleFactor, hitboxWidthFactor, hitboxHeightFactor)
            );
    
            // Adjust intervals
            if (isTypeOne) {
                randomEnemyInterval = Math.random() * 1000 + 1500; // Longer spawn interval for Enemy 1
            } else {
                // Random interval logic for Enemy 2
                const randomFactor = Math.random();
                if (randomFactor < 0.3) {
                    randomEnemyInterval = Math.random() * 50 + 100; // Very short intervals
                } else if (randomFactor < 0.6) {
                    randomEnemyInterval = Math.random() * 500 + 200; // Moderate intervals
                } else {
                    randomEnemyInterval = Math.random() * 1500 + 500; // Long intervals
                }
            }
    
            enemyTimer = 0; // Reset timer
        } else {
            enemyTimer += deltaTime; // Increment timer
        }
    
        enemies.forEach(enemy => {
            enemy.draw(ctx);
            enemy.update(deltaTime);
        });
    
        enemies = enemies.filter(enemy => !enemy.markedForDeletion); // Remove off-screen enemies
    }
    
    
    
    
    function displayStartText(context) {
        context.fillStyle = 'white';
        context.textAlign = 'center';
        context.font = '40px Minecraftia, monospace'; // Use your preferred font
        context.fillText('Tap once to jump', canvas.width / 2, canvas.height / 2 - 20);
        context.font = '40px Minecraftia, monospace';
        context.fillText('Tap twice to double jump', canvas.width / 2, canvas.height / 2 + 50);
    }
    
    

    // Function to display score and game over message
    function displayStatusText(context) {
        // Reset text alignment to avoid misalignment issues
        context.textAlign = 'left'; 
        context.fillStyle = 'white';
        context.font = '40px Minecraftia';
        context.fillText('Score: ' + score, 20, 80); // Display score
    }
    
    function restartGame(){
        player.restart();
        background.restart();
        enemies = []; // Array to store enemies
        score = 0; // Player's score
        gameOver = false; // Game over flag
        animate(0);
    }

    // Load background images
    const backgroundLayer1 = document.getElementById('BGImage1'); // Farthest layer
    const backgroundLayer2 = document.getElementById('BGImage2'); // Middle layer
    const backgroundLayer3 = document.getElementById('BGImage3'); // Closest layer
    const backgroundLayer4 = document.getElementById('BGImage4'); // Closest layer

    // Create background objects with varying speeds
    const layer1 = new Background(canvas.width, canvas.height, backgroundLayer1, 0.2); // Slowest
    const layer2 = new Background(canvas.width, canvas.height, backgroundLayer2, 0.5); // Medium
    const layer3 = new Background(canvas.width, canvas.height, backgroundLayer3, 0.8);   // Fastest
    const layer4 = new Background(canvas.width, canvas.height, backgroundLayer4, 1);   // Fastest

    // Store layers in an array for easy management
    const backgroundLayers = [layer1, layer2, layer3, layer4];

    // Initialize game objects
    const input = new InputHandler(); // Input handler
    const playerScaleFactor = 4; // Adjust the scale factor as needed
    const player = new Player(canvas.width, canvas.height, playerScaleFactor);

    const background = new Background(canvas.width, canvas.height); // Background object

    // Timer variables for enemy spawning
    let enemyTimer = 0; // Timer to track enemy spawning
    let enemyInterval = 750; // Base interval between spawns
    let lastTime = 0; // Timestamp of the last animation frame
    let randomEnemyInterval = Math.random() * 750 + 500; // Randomize initial spawn interval

    // Main animation loop
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime || 0;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // Update and draw background layers
        backgroundLayers.forEach((layer) => {
            layer.update();
            layer.draw(ctx);
        });
    
        // Update and draw player
        player.draw(ctx);
        player.update(input, deltaTime, enemies, bones);
    
        // Handle enemies and bones
        handleEnemies(deltaTime);
        handleBones(deltaTime);
    
        // Display start text for the first few seconds
        if (startTextTimer < startTextDuration) {
            displayStartText(ctx);
            startTextTimer += deltaTime; // Increment the timer
        }
    
        // Display score
        displayStatusText(ctx);
    
        if (!gameOver) {
            requestAnimationFrame(animate);
        } else {
            handleGameOver();
        }
    }
    

    // Draw the start screen initially
    drawStartScreen();
});