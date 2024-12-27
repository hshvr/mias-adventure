window.addEventListener('load', function() { 
    // Set up the canvas and 2D rendering context
    const canvas = this.document.getElementById('canvas1');
    const ctx = canvas.getContext('2d');
    canvas.width = 1300; // Set canvas width
    canvas.height = 720; // Set canvas height

    // Initialize game variables
    let enemies = []; // Array to store enemies
    let score = 0; // Player's score
    let gameOver = false; // Game over flag

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
    

    // Class representing the player character
    // Class representing the player character
    class Player {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth;
            this.gameHeight = gameHeight;
            this.width = 200;
            this.height = 200;
            this.x = 100;
            this.y = this.gameHeight - this.height;
            this.image = document.getElementById('PlayerImage');
            this.frameX = 0;
            this.frameY = 0;
            this.fps = 20;
            this.frameTimer = 0;
            this.frameInterval = 1000 / this.fps;
            this.maxFrame = 8;
            this.speed = 0;
            this.vy = 0;
            this.weight = 1;
        }

        restart() {
            this.x = 100;
            this.y = this.gameHeight - this.height;
            this.maxFrame = 8;
            this.frameY = 0;
        }

        draw(context) {
            context.strokeStyle = 'white';
            context.strokeRect(this.x, this.y, this.width, this.height);

            context.beginPath();
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            context.stroke();

            context.drawImage(
                this.image,
                this.frameX * this.width, this.frameY * this.height, this.width, this.height,
                this.x, this.y, this.width, this.height
            );
        }

        update(input, deltaTime, enemies) {
            enemies.forEach(enemy => {
                const dx = (enemy.x + enemy.width / 2) - (this.x + this.width / 2);
                const dy = (enemy.y + enemy.height / 2) - (this.y + this.height / 2);
                const distance = Math.sqrt(dx * dx + dy * dy);
                const collisionRadius = (enemy.width / 2 + this.width / 2) * 0.8;
                if (distance < collisionRadius) {
                    gameOver = true;
                }
            });

            //sprite animation
            if (this.frameTimer > this.frameInterval) {
                this.frameX = (this.frameX >= this.maxFrame) ? 0 : this.frameX + 1;
                this.frameTimer = 0;
            } else {
                this.frameTimer += deltaTime;
            }

            // controls
            if (input.keys.indexOf('ArrowUp') > -1 || input.keys.indexOf('up') > -1 && this.onGround()) {
                this.vy = -30; // Apply jump force
            }

            this.y += this.vy;

            if (!this.onGround()) {
                this.vy += this.weight;
                this.frameY = 1;
                this.maxFrame = 5;
            } else {
                this.vy = 0;
                this.frameY = 0;
                this.maxFrame = 8;
            }

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
            this.gameWidth = gameWidth; // Width of the game area
            this.gameHeight = gameHeight; // Height of the game area
            this.image = image; // Background image for this layer
            this.width = 2400; // Width of the background image
            this.height = 720; // Height of the background image
            this.speedModifier = speedModifier; // Speed multiplier for parallax effect
            this.x = 0; // Initial horizontal position
            this.y = 0; // Initial vertical position
            this.speed = 10 * this.speedModifier; // Layer-specific speed
        }
    
        // Draw the background layer
        draw(context) {
            context.drawImage(this.image, this.x, this.y, this.width, this.height); // Main image
            context.drawImage(this.image, this.x + this.width - 1, this.y, this.width, this.height); // Looping image
        }
    
        // Update the position of the background for parallax effect
        update() {
            this.x -= this.speed; // Move background to the left
            if (this.x < 0 - this.width) this.x = 0; // Reset position for seamless looping
        }
        restart(){
            this.x = 0;
        }
    }
    

    // Class representing an enemy
    class Enemy {
        constructor(gameWidth, gameHeight) {
            this.gameWidth = gameWidth; // Width of the game area
            this.gameHeight = gameHeight; // Height of the game area
            this.width = 160; // Enemy width
            this.height = 119; // Enemy height
            this.image = document.getElementById('Enemy_Image'); // Enemy sprite
            this.x = this.gameWidth - 100; // Initial horizontal position
            this.y = this.gameHeight - this.height; // Vertical position (ground level)
            this.frameX = 0; // Animation frame index
            this.maxFrame = 5; // Maximum animation frames
            this.fps = 20; // Animation speed (frames per second)
            this.frameTimer = 0; // Timer for animation updates
            this.frameInterval = 1000 / this.fps; // Time between frames
            this.speed = 8; // Horizontal movement speed
            this.markedForDeletion = false; // Flag to indicate removal
        }

        // Draw the enemy
        draw(context) {
            context.strokeStyle = 'white'; // Debug rectangle
            context.strokeRect(this.x, this.y, this.width, this.height);
            context.beginPath(); // Debug circle
            context.arc(this.x + this.width / 2, this.y + this.height / 2, this.width / 2, 0, Math.PI * 2);
            context.stroke();
            context.drawImage(this.image, this.frameX * this.width, 0, this.width, this.height, this.x, this.y, this.width, this.height); // Draw enemy sprite
        }

        // Update enemy position and animation
        update(deltaTime) {
            if (this.frameTimer >= this.frameInterval) {
                this.frameX = (this.frameX >= this.maxFrame) ? 0 : this.frameX + 1; // Cycle animation frames
                this.frameTimer = 0; // Reset frame timer
            } else {
                this.frameTimer += deltaTime; // Increment frame timer
            }
            this.x -= this.speed; // Move enemy left
            if (this.x < 0 - this.width) {
                this.markedForDeletion = true; // Mark for removal when off-screen
                score++; // Increment score
            }
        }
    }

    // Function to manage enemies
    function handleEnemies(deltaTime) {
        if (enemyTimer > enemyInterval + randomEnemyInterval) {
            enemies.push(new Enemy(canvas.width, canvas.height)); // Add new enemy
            randomEnemyInterval = Math.random() * 1000 + 500; // Randomize next spawn
            enemyTimer = 0; // Reset timer
        } else {
            enemyTimer += deltaTime; // Increment timer
        }
        enemies.forEach(enemy => {
            enemy.draw(ctx); // Draw each enemy
            enemy.update(deltaTime); // Update each enemy
        });
        enemies = enemies.filter(enemy => !enemy.markedForDeletion); // Remove off-screen enemies
    }

    // Function to display score and game over message
    function displayStatusText(context) {
        // Reset text alignment to avoid misalignment issues
        context.textAlign = 'left'; 
        context.fillStyle = 'white';
        context.font = '40px Helvetica';
        context.fillText('Score: ' + score, 20, 50); // Display score
    
        if (gameOver) {
            context.textAlign = 'center'; // Center alignment for "Game Over" text
            context.fillStyle = 'white';
            context.font = '40px Helvetica';
            context.fillText('Game Over: ' + score, canvas.width / 2, 200); // Display game over message

        }
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

    // Create background objects with varying speeds
    const layer1 = new Background(canvas.width, canvas.height, backgroundLayer1, 0.2); // Slowest
    const layer2 = new Background(canvas.width, canvas.height, backgroundLayer2, 0.5); // Medium
    const layer3 = new Background(canvas.width, canvas.height, backgroundLayer3, 1);   // Fastest

    // Store layers in an array for easy management
    const backgroundLayers = [layer1, layer2, layer3];

    // Initialize game objects
    const input = new InputHandler(); // Input handler
    const player = new Player(canvas.width, canvas.height); // Player object
    const background = new Background(canvas.width, canvas.height); // Background object

    // Timer variables for enemy spawning
    let enemyTimer = 0; // Timer to track enemy spawning
    let enemyInterval = 1000; // Base interval between spawns
    let lastTime = 0; // Timestamp of the last animation frame
    let randomEnemyInterval = Math.random() * 1000 + 500; // Randomize initial spawn interval

    // Main animation loop
    function animate(timeStamp) {
        const deltaTime = timeStamp - lastTime || 0;
        lastTime = timeStamp;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
    
        // Update and draw each background layer
        backgroundLayers.forEach(layer => {
            layer.update();
            layer.draw(ctx);
        });
    
        // Draw and update player and other game elements
        player.draw(ctx);
        player.update(input, deltaTime, enemies);
        handleEnemies(deltaTime);
        displayStatusText(ctx);
    
        if (!gameOver) requestAnimationFrame(animate); // Request next frame
    }
    
    animate(); // Start the animation loop
});
