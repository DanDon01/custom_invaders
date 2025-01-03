class Game {
    constructor() {
        this.canvas = document.getElementById('gameCanvas');
        this.ctx = this.canvas.getContext('2d');
        this.width = this.canvas.width;
        this.height = this.canvas.height;
        
        // Player properties
        this.player = {
            x: this.width / 2,
            y: this.height - 50,
            width: 40,
            height: 30,
            speed: 5
        };
        
        // Bullet properties
        this.bullets = [];
        this.bulletSpeed = 7;
        this.maxBullets = 2;  // Maximum bullets allowed on screen
        
        // Alien properties
        this.aliens = [];
        this.alienRows = 4;
        this.aliensPerRow = 8;
        this.alienDirection = 1;
        this.alienStepDown = 20;
        this.alienMoveSpeed = 1;
        
        // Game state
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.victory = false;  // New victory state
        
        // Controls
        this.keys = {};
        this.setupControls();
        this.loadAliens();
    }
    
    async loadAliens() {
        try {
            const response = await fetch('/get_aliens');
            const data = await response.json();
            this.alienDesigns = data.aliens;
            this.initializeAliens();
            this.startGame();
        } catch (error) {
            console.error('Failed to load alien designs:', error);
        }
    }
    
    initializeAliens() {
        for (let row = 0; row < this.alienRows; row++) {
            for (let col = 0; col < this.aliensPerRow; col++) {
                this.aliens.push({
                    x: col * 60 + 50,
                    y: row * 50 + 50,
                    width: 40,
                    height: 40,
                    design: this.alienDesigns[row],
                    alive: true
                });
            }
        }
    }
    
    setupControls() {
        window.addEventListener('keydown', (e) => {
            this.keys[e.key] = true;
            // Handle shooting on spacebar press
            if (e.code === 'Space' && !this.gameOver) {
                this.shoot();
                // Prevent page scrolling
                e.preventDefault();
            }
        });
        window.addEventListener('keyup', (e) => this.keys[e.key] = false);
    }
    
    shoot() {
        // Only shoot if we haven't reached max bullets
        if (this.bullets.length < this.maxBullets) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y,
                width: 3,
                height: 15
            });
        }
    }
    
    update() {
        if (this.gameOver || this.victory) return;
        
        // Check for victory condition
        const remainingAliens = this.aliens.filter(alien => alien.alive).length;
        if (remainingAliens === 0) {
            this.victory = true;
            return;
        }
        
        // Player movement
        if (this.keys['ArrowLeft']) {
            this.player.x = Math.max(0, this.player.x - this.player.speed);
        }
        if (this.keys['ArrowRight']) {
            this.player.x = Math.min(this.width - this.player.width, this.player.x + this.player.speed);
        }
        
        // Update bullets
        this.bullets.forEach((bullet, index) => {
            bullet.y -= this.bulletSpeed;
            if (bullet.y < 0) {
                this.bullets.splice(index, 1);
            }
        });
        
        // Move aliens
        let touchedEdge = false;
        this.aliens.forEach(alien => {
            if (!alien.alive) return;
            
            alien.x += this.alienMoveSpeed * this.alienDirection;
            if (alien.x <= 0 || alien.x + alien.width >= this.width) {
                touchedEdge = true;
            }
        });
        
        if (touchedEdge) {
            this.alienDirection *= -1;
            this.aliens.forEach(alien => {
                alien.y += this.alienStepDown;
                if (alien.y + alien.height > this.player.y) {
                    this.lives--;
                    if (this.lives <= 0) {
                        this.gameOver = true;
                    }
                    this.resetAliens();
                }
            });
        }
        
        // Check collisions
        this.checkCollisions();
    }
    
    checkCollisions() {
        this.bullets.forEach((bullet, bulletIndex) => {
            this.aliens.forEach(alien => {
                if (!alien.alive) return;
                
                if (this.checkCollision(bullet, alien)) {
                    alien.alive = false;
                    this.bullets.splice(bulletIndex, 1);
                    this.score += 100;
                }
            });
        });
    }
    
    checkCollision(rect1, rect2) {
        return rect1.x < rect2.x + rect2.width &&
               rect1.x + rect1.width > rect2.x &&
               rect1.y < rect2.y + rect2.height &&
               rect1.y + rect1.height > rect2.y;
    }
    
    drawPlayer() {
        // Draw the ship body
        this.ctx.fillStyle = '#00ff00';
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y); // Top point
        this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height); // Bottom right
        this.ctx.lineTo(this.player.x, this.player.y + this.player.height); // Bottom left
        this.ctx.closePath();
        this.ctx.fill();

        // Draw cockpit
        this.ctx.fillStyle = '#80ff80';
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y + 10);
        this.ctx.lineTo(this.player.x + this.player.width / 2 + 8, this.player.y + 20);
        this.ctx.lineTo(this.player.x + this.player.width / 2 - 8, this.player.y + 20);
        this.ctx.closePath();
        this.ctx.fill();

        // Draw engine glow
        this.ctx.fillStyle = '#ff4400';
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2 - 10, this.player.y + this.player.height);
        this.ctx.lineTo(this.player.x + this.player.width / 2 + 10, this.player.y + this.player.height);
        this.ctx.lineTo(this.player.x + this.player.width / 2, this.player.y + this.player.height + 5);
        this.ctx.closePath();
        this.ctx.fill();
    }
    
    draw() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        // Draw player using new method
        this.drawPlayer();
        
        // Draw bullets
        this.ctx.fillStyle = '#ff9933';
        this.bullets.forEach(bullet => {
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
        
        // Draw aliens
        this.aliens.forEach(alien => {
            if (alien.alive) {
                this.drawAlien(alien);
            }
        });
        
        // Draw score and lives
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        this.ctx.fillText(`Lives: ${this.lives}`, this.width - 100, 30);
        
        // Draw game over or victory message
        if (this.gameOver) {
            this.ctx.fillStyle = 'red';
            this.ctx.font = '48px Arial';
            this.ctx.fillText('GAME OVER', this.width/2 - 120, this.height/2);
        } else if (this.victory) {
            this.ctx.fillStyle = '#00ff00';
            this.ctx.font = '48px Arial';
            this.ctx.fillText('VICTORY!', this.width/2 - 100, this.height/2);
            this.ctx.font = '24px Arial';
            this.ctx.fillText(`Final Score: ${this.score}`, this.width/2 - 70, this.height/2 + 50);
        }
    }
    
    drawAlien(alien) {
        // Draw alien using its design data
        const pixelSize = alien.width / 8;
        Object.entries(alien.design).forEach(([index, color]) => {
            const i = parseInt(index);
            const x = alien.x + (i % 8) * pixelSize;
            const y = alien.y + Math.floor(i / 8) * pixelSize;
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, pixelSize, pixelSize);
        });
    }
    
    gameLoop() {
        this.update();
        this.draw();
        requestAnimationFrame(() => this.gameLoop());
    }
    
    startGame() {
        this.gameLoop();
    }
    
    resetAliens() {
        this.aliens.forEach(alien => {
            alien.y -= this.alienStepDown * 3;
        });
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
}); 