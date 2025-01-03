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
        this.maxBullets = 2;
        this.bulletTrailParticles = [];  // Add bullet trail effect
        
        // Alien properties
        this.aliens = [];
        this.alienRows = 4;
        this.aliensPerRow = 10;
        this.alienDirection = 1;
        this.alienStepDown = 20;
        this.alienMoveSpeed = 0.5;
        this.alienSpeedIncrease = 0.4;
        this.alienSpacing = {
            x: 70,
            y: 60
        };
        
        // Game state
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.victory = false;  // New victory state
        
        // Controls
        this.keys = {};
        this.setupControls();
        this.loadAliens();
        
        // Add star field properties
        this.stars = this.initStars(100);  // Create 100 stars
        
        // Add explosion properties
        this.explosions = [];
        this.explosionParticles = 15;  // Particles per explosion
        
        // Add invulnerability timer for ship after hit
        this.invulnerableTime = 0;
        this.invulnerableDuration = 6; // 0.1 seconds at 60fps
        
        // Add mobile controls
        this.setupMobileControls();
        
        // Add fireworks array
        this.fireworks = [];
        
        // Setup restart dialog
        this.setupRestartDialog();

        // Add flame animation properties
        this.flameSize = 0;
        this.flameTime = 0;

        // Add victory animation properties
        this.victoryAnimation = {
            active: false,
            speed: 0,
            maxSpeed: 15,
            acceleration: 0.5,
            trail: []
        };
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
        // Clear existing aliens first
        this.aliens = [];
        
        const startX = 10;
        const startY = 30;
        
        for (let row = 0; row < this.alienRows; row++) {
            for (let col = 0; col < this.aliensPerRow; col++) {
                this.aliens.push({
                    x: startX + col * this.alienSpacing.x,
                    y: startY + row * this.alienSpacing.y,
                    width: 55,
                    height: 55,
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
        if (this.bullets.length < this.maxBullets) {
            this.bullets.push({
                x: this.player.x + this.player.width / 2,
                y: this.player.y,
                width: 5,  // Slightly wider bullet
                height: 20, // Longer bullet
                color: '#ff9933'
            });
        }
    }
    
    update() {
        if (this.gameOver) {
            this.restartButton.style.display = 'block';
            return;
        }

        if (this.victory) {
            this.updateVictoryAnimation();
            this.updateFireworks();
            return;
        }

        this.updateStars();
        this.updateExplosions();
        
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
        
        // Update bullets and their trails
        this.updateBullets();

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
            this.alienMoveSpeed += this.alienSpeedIncrease;
            
            this.aliens.forEach(alien => {
                alien.y += this.alienStepDown;
            });
        }
        
        // Check collisions
        this.checkCollisions();
        this.checkShipCollision();

        // Check if aliens reach bottom
        this.aliens.forEach(alien => {
            if (alien.alive && alien.y + alien.height >= this.height) {
                alien.alive = false;  // Destroy the alien
                this.createExplosion(
                    alien.x + alien.width / 2,
                    alien.y + alien.height / 2,
                    this.getMainColor(alien.design)
                );
            }
        });
    }
    
    checkCollisions() {
        this.bullets.forEach((bullet, bulletIndex) => {
            this.aliens.forEach(alien => {
                if (!alien.alive) return;
                
                if (this.checkCollision(bullet, alien)) {
                    alien.alive = false;
                    this.bullets.splice(bulletIndex, 1);
                    this.score += 100;

                    // Create explosion using alien's colors
                    const mainColor = this.getMainColor(alien.design);
                    this.createExplosion(
                        alien.x + alien.width / 2,
                        alien.y + alien.height / 2,
                        mainColor
                    );
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
        // Make ship flash when invulnerable
        if (this.invulnerableTime > 0 && Math.floor(this.invulnerableTime / 4) % 2 === 0) {
            return;
        }

        // Determine tilt based on movement
        let tilt = 0;
        if (this.keys['ArrowLeft']) {
            tilt = -10;
        } else if (this.keys['ArrowRight']) {
            tilt = 10;
        }

        this.ctx.save();
        this.ctx.translate(this.player.x + this.player.width / 2, this.player.y + this.player.height / 2);
        this.ctx.rotate(tilt * Math.PI / 180);
        this.ctx.translate(-this.player.x - this.player.width / 2, -this.player.y - this.player.height / 2);

        // Draw engine flames (behind ship)
        this.drawEngineFlames();

        // Main body - metallic silver with gradient
        const bodyGradient = this.ctx.createLinearGradient(
            this.player.x, this.player.y, 
            this.player.x + this.player.width, this.player.y + this.player.height
        );
        bodyGradient.addColorStop(0, '#A0A0A0');
        bodyGradient.addColorStop(0.5, '#E0E0E0');
        bodyGradient.addColorStop(1, '#A0A0A0');
        
        this.ctx.fillStyle = bodyGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2, this.player.y); // Top point
        this.ctx.lineTo(this.player.x + this.player.width, this.player.y + this.player.height); // Bottom right
        this.ctx.lineTo(this.player.x, this.player.y + this.player.height); // Bottom left
        this.ctx.closePath();
        this.ctx.fill();

        // Wing details
        this.ctx.strokeStyle = '#666666';
        this.ctx.lineWidth = 2;
        // Left wing detail
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + 5, this.player.y + this.player.height - 5);
        this.ctx.lineTo(this.player.x + this.player.width * 0.3, this.player.y + this.player.height * 0.3);
        this.ctx.stroke();
        // Right wing detail
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width - 5, this.player.y + this.player.height - 5);
        this.ctx.lineTo(this.player.x + this.player.width * 0.7, this.player.y + this.player.height * 0.3);
        this.ctx.stroke();

        // Cockpit - glass effect with gradient
        const cockpitGradient = this.ctx.createLinearGradient(
            this.player.x + this.player.width * 0.3, this.player.y + 10,
            this.player.x + this.player.width * 0.7, this.player.y + 25
        );
        cockpitGradient.addColorStop(0, '#84D9FF');
        cockpitGradient.addColorStop(0.5, '#C4E9FF');
        cockpitGradient.addColorStop(1, '#84D9FF');
        
        this.ctx.fillStyle = cockpitGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width * 0.5, this.player.y + 8);
        this.ctx.lineTo(this.player.x + this.player.width * 0.7, this.player.y + 25);
        this.ctx.lineTo(this.player.x + this.player.width * 0.3, this.player.y + 25);
        this.ctx.closePath();
        this.ctx.fill();
        this.ctx.strokeStyle = '#4DA4CC';
        this.ctx.stroke();

        this.ctx.restore();
    }
    
    drawEngineFlames() {
        // Update flame animation
        this.flameTime += 0.1;
        this.flameSize = Math.sin(this.flameTime) * 3;

        // Main flame
        const flameGradient = this.ctx.createLinearGradient(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height,
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height + 20 + this.flameSize
        );
        flameGradient.addColorStop(0, '#FF4400');
        flameGradient.addColorStop(0.4, '#FF7700');
        flameGradient.addColorStop(0.7, '#FFAA00');
        flameGradient.addColorStop(1, 'rgba(255, 170, 0, 0)');

        this.ctx.fillStyle = flameGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2 - 8, this.player.y + this.player.height);
        this.ctx.quadraticCurveTo(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height + 25 + this.flameSize,
            this.player.x + this.player.width / 2 + 8,
            this.player.y + this.player.height
        );
        this.ctx.fill();

        // Inner flame (brighter)
        const innerFlameGradient = this.ctx.createLinearGradient(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height,
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height + 15 + this.flameSize
        );
        innerFlameGradient.addColorStop(0, '#FFFF00');
        innerFlameGradient.addColorStop(0.5, '#FFAA00');
        innerFlameGradient.addColorStop(1, 'rgba(255, 170, 0, 0)');

        this.ctx.fillStyle = innerFlameGradient;
        this.ctx.beginPath();
        this.ctx.moveTo(this.player.x + this.player.width / 2 - 4, this.player.y + this.player.height);
        this.ctx.quadraticCurveTo(
            this.player.x + this.player.width / 2,
            this.player.y + this.player.height + 15 + this.flameSize,
            this.player.x + this.player.width / 2 + 4,
            this.player.y + this.player.height
        );
        this.ctx.fill();
    }
    
    draw() {
        this.ctx.fillStyle = 'black';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.drawStars();
        
        // Draw victory trail
        if (this.victory && this.victoryAnimation.active) {
            this.victoryAnimation.trail.forEach(particle => {
                this.ctx.fillStyle = `rgba(${this.hexToRgb(particle.color)}, ${particle.life})`;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
        }

        // Draw player if still on screen
        if (this.player.y > -this.player.height) {
            this.drawPlayer();
        }

        // Draw bullets
        this.drawBullets();
        
        // Draw aliens
        this.aliens.forEach(alien => {
            if (alien.alive) {
                this.drawAlien(alien);
            }
        });

        // Draw explosions
        this.drawExplosions();
        
        // Draw score and lives
        this.ctx.fillStyle = 'white';
        this.ctx.font = '20px Arial';
        this.ctx.fillText(`Score: ${this.score}`, 10, 30);
        this.ctx.fillText(`Lives: ${this.lives}`, this.width - 100, 30);
        
        // Draw fireworks on victory
        if (this.victory) {
            this.drawFireworks();
        }

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
    
    initStars(count) {
        const stars = [];
        for (let i = 0; i < count; i++) {
            stars.push({
                x: Math.random() * this.width,
                y: Math.random() * this.height,
                speed: 0.5 + Math.random() * 2,
                size: Math.random() * 2
            });
        }
        return stars;
    }
    
    createExplosion(x, y, color) {
        const particles = [];
        // More particles for bigger explosion
        for (let i = 0; i < 30; i++) {
            const angle = (Math.PI * 2 / 30) * i;
            const speed = 2 + Math.random() * 4;
            const size = 2 + Math.random() * 3;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                color: color,
                size: size,
                spin: Math.random() * Math.PI * 2,
                spinSpeed: (Math.random() - 0.5) * 0.2
            });
        }
        // Add some sparkles
        for (let i = 0; i < 20; i++) {
            const angle = Math.random() * Math.PI * 2;
            const speed = 1 + Math.random() * 3;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 0.8,
                color: '#ffffff',
                size: 1,
                isSparkle: true
            });
        }
        this.explosions.push(particles);
    }
    
    updateStars() {
        this.stars.forEach(star => {
            star.y += star.speed;
            if (star.y > this.height) {
                star.y = 0;
                star.x = Math.random() * this.width;
            }
        });
    }
    
    updateExplosions() {
        this.explosions.forEach((particles, explosionIndex) => {
            particles.forEach(particle => {
                particle.x += particle.vx;
                particle.y += particle.vy;
                particle.life -= 0.02;
            });

            // Remove dead explosions
            if (particles[0].life <= 0) {
                this.explosions.splice(explosionIndex, 1);
            }
        });
    }
    
    drawStars() {
        this.ctx.fillStyle = 'white';
        this.stars.forEach(star => {
            this.ctx.fillRect(star.x, star.y, star.size, star.size);
        });
    }
    
    drawExplosions() {
        this.explosions.forEach(particles => {
            particles.forEach(particle => {
                this.ctx.save();
                if (particle.isSparkle) {
                    // Draw sparkles
                    this.ctx.fillStyle = `rgba(255, 255, 255, ${particle.life})`;
                    this.ctx.beginPath();
                    this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                    this.ctx.fill();
                } else {
                    // Draw main explosion particles
                    this.ctx.translate(particle.x, particle.y);
                    this.ctx.rotate(particle.spin);
                    this.ctx.fillStyle = `rgba(${particle.color}, ${particle.life})`;
                    this.ctx.fillRect(-particle.size/2, -particle.size/2, 
                                    particle.size, particle.size);
                    particle.spin += particle.spinSpeed;
                }
                this.ctx.restore();
            });
        });
    }
    
    getMainColor(design) {
        // Get the most used color in the alien design
        const colorCounts = {};
        Object.values(design).forEach(color => {
            colorCounts[color] = (colorCounts[color] || 0) + 1;
        });
        
        let mainColor = Object.entries(design)[0]?.[1] || '255,255,255';
        let maxCount = 0;
        
        Object.entries(colorCounts).forEach(([color, count]) => {
            if (count > maxCount) {
                maxCount = count;
                mainColor = color;
            }
        });
        
        // Convert hex to RGB if necessary
        if (mainColor.startsWith('#')) {
            const r = parseInt(mainColor.slice(1, 3), 16);
            const g = parseInt(mainColor.slice(3, 5), 16);
            const b = parseInt(mainColor.slice(5, 7), 16);
            return `${r},${g},${b}`;
        }
        
        return mainColor;
    }
    
    checkShipCollision() {
        // Skip if ship is invulnerable
        if (this.invulnerableTime > 0) {
            this.invulnerableTime--;
            return;
        }

        this.aliens.forEach(alien => {
            if (!alien.alive) return;

            if (this.checkCollision(this.player, alien)) {
                // Create explosion for the alien
                const mainColor = this.getMainColor(alien.design);
                this.createExplosion(
                    alien.x + alien.width / 2,
                    alien.y + alien.height / 2,
                    mainColor
                );

                // Kill the alien
                alien.alive = false;

                // Reduce lives and set invulnerability
                this.lives--;
                this.invulnerableTime = this.invulnerableDuration;

                if (this.lives <= 0) {
                    this.gameOver = true;
                }
            }
        });
    }
    
    setupMobileControls() {
        const leftButton = document.getElementById('leftButton');
        const rightButton = document.getElementById('rightButton');
        const fireButton = document.getElementById('fireButton');

        // Handle both mouse and touch events for movement
        // Left button
        const handleLeftDown = (e) => {
            e.preventDefault();
            this.keys['ArrowLeft'] = true;
        };
        const handleLeftUp = (e) => {
            e.preventDefault();
            this.keys['ArrowLeft'] = false;
        };
        leftButton.addEventListener('mousedown', handleLeftDown);
        leftButton.addEventListener('mouseup', handleLeftUp);
        leftButton.addEventListener('mouseleave', handleLeftUp);
        leftButton.addEventListener('touchstart', handleLeftDown);
        leftButton.addEventListener('touchend', handleLeftUp);

        // Right button
        const handleRightDown = (e) => {
            e.preventDefault();
            this.keys['ArrowRight'] = true;
        };
        const handleRightUp = (e) => {
            e.preventDefault();
            this.keys['ArrowRight'] = false;
        };
        rightButton.addEventListener('mousedown', handleRightDown);
        rightButton.addEventListener('mouseup', handleRightUp);
        rightButton.addEventListener('mouseleave', handleRightUp);
        rightButton.addEventListener('touchstart', handleRightDown);
        rightButton.addEventListener('touchend', handleRightUp);

        // Fire button
        const handleFire = (e) => {
            e.preventDefault();
            if (!this.gameOver) {
                this.shoot();
            }
        };
        fireButton.addEventListener('mousedown', handleFire);
        fireButton.addEventListener('touchstart', handleFire);

        // Prevent default touch behaviors
        document.addEventListener('touchmove', (e) => {
            if (e.target.classList.contains('control-button')) {
                e.preventDefault();
            }
        }, { passive: false });

        // Prevent context menu on long press
        document.addEventListener('contextmenu', (e) => {
            if (e.target.classList.contains('control-button')) {
                e.preventDefault();
            }
        });
    }

    setupRestartDialog() {
        this.restartButton = document.getElementById('restartButton');
        this.restartDialog = document.getElementById('restartDialog');
        const continueButton = document.getElementById('continueButton');
        const redesignButton = document.getElementById('redesignButton');

        this.restartButton.addEventListener('click', () => {
            this.restartDialog.style.display = 'block';
            this.restartButton.style.display = 'none';
        });

        continueButton.addEventListener('click', () => {
            this.restartDialog.style.display = 'none';
            this.resetGame();
        });

        redesignButton.addEventListener('click', () => {
            window.location.href = '/';
        });
    }

    resetGame() {
        // Reset game state
        this.score = 0;
        this.lives = 3;
        this.gameOver = false;
        this.victory = false;
        this.alienMoveSpeed = 0.5;  // Reset alien speed
        this.alienDirection = 1;     // Reset direction
        this.bullets = [];
        this.explosions = [];
        this.fireworks = [];
        
        // Clear and reset aliens to original positions
        this.initializeAliens();
        
        // Hide restart button and dialog
        this.restartButton.style.display = 'none';
        this.restartDialog.style.display = 'none';
    }

    createFirework() {
        const colors = ['#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff'];
        const x = Math.random() * this.width;
        const y = this.height;
        const particles = [];
        
        // Create particles for this firework
        for (let i = 0; i < 50; i++) {
            const angle = (Math.PI * 2 / 50) * i;
            const speed = 2 + Math.random() * 3;
            particles.push({
                x: x,
                y: y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed - 5, // Initial upward velocity
                color: colors[Math.floor(Math.random() * colors.length)],
                life: 1.0,
                size: 2 + Math.random() * 2
            });
        }
        
        this.fireworks.push(particles);
    }

    updateFireworks() {
        // Add new fireworks randomly when victory
        if (this.victory && Math.random() < 0.1) {
            this.createFirework();
        }

        this.fireworks.forEach((particles, fireworkIndex) => {
            particles.forEach(particle => {
                // Apply gravity
                particle.vy += 0.1;
                
                // Update position
                particle.x += particle.vx;
                particle.y += particle.vy;
                
                // Decrease life
                particle.life -= 0.02;
            });

            // Remove dead fireworks
            if (particles[0].life <= 0) {
                this.fireworks.splice(fireworkIndex, 1);
            }
        });
    }

    drawFireworks() {
        this.fireworks.forEach(particles => {
            particles.forEach(particle => {
                this.ctx.fillStyle = `rgba(${particle.color}, ${particle.life})`;
                this.ctx.beginPath();
                this.ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
                this.ctx.fill();
            });
        });
    }

    updateBullets() {
        // Update bullet positions
        this.bullets.forEach((bullet, index) => {
            bullet.y -= this.bulletSpeed;
            
            // Add trail particles
            if (Math.random() < 0.5) {
                this.bulletTrailParticles.push({
                    x: bullet.x + bullet.width / 2,
                    y: bullet.y + bullet.height,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: Math.random() * 2,
                    life: 1.0,
                    color: bullet.color
                });
            }
            
            if (bullet.y < 0) {
                this.bullets.splice(index, 1);
            }
        });

        // Update trail particles
        this.bulletTrailParticles.forEach((particle, index) => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            particle.life -= 0.05;
            if (particle.life <= 0) {
                this.bulletTrailParticles.splice(index, 1);
            }
        });
    }

    drawBullets() {
        // Draw bullet trails
        this.bulletTrailParticles.forEach(particle => {
            this.ctx.fillStyle = `rgba(255, 153, 51, ${particle.life * 0.5})`;
            this.ctx.beginPath();
            this.ctx.arc(particle.x, particle.y, 2, 0, Math.PI * 2);
            this.ctx.fill();
        });

        // Draw bullets
        this.bullets.forEach(bullet => {
            // Bullet glow effect
            const gradient = this.ctx.createRadialGradient(
                bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 0,
                bullet.x + bullet.width / 2, bullet.y + bullet.height / 2, 10
            );
            gradient.addColorStop(0, '#ff9933');
            gradient.addColorStop(1, 'rgba(255, 153, 51, 0)');
            
            this.ctx.fillStyle = gradient;
            this.ctx.fillRect(bullet.x - 5, bullet.y - 5, bullet.width + 10, bullet.height + 10);
            
            // Bullet core
            this.ctx.fillStyle = '#ffffff';
            this.ctx.fillRect(bullet.x, bullet.y, bullet.width, bullet.height);
        });
    }

    updateVictoryAnimation() {
        if (!this.victoryAnimation.active) {
            this.victoryAnimation.active = true;
            this.victoryAnimation.speed = 1;
        }

        // Accelerate ship upward
        this.victoryAnimation.speed = Math.min(
            this.victoryAnimation.speed + this.victoryAnimation.acceleration,
            this.victoryAnimation.maxSpeed
        );
        this.player.y -= this.victoryAnimation.speed;

        // Add trail particles
        for (let i = 0; i < 3; i++) {
            this.victoryAnimation.trail.push({
                x: this.player.x + this.player.width / 2 + (Math.random() - 0.5) * 20,
                y: this.player.y + this.player.height,
                size: 3 + Math.random() * 3,
                color: ['#FF4400', '#FF7700', '#FFAA00'][Math.floor(Math.random() * 3)],
                life: 1.0,
                vy: Math.random() * 2
            });
        }

        // Update trail particles
        this.victoryAnimation.trail.forEach((particle, index) => {
            particle.y += particle.vy;
            particle.life -= 0.02;
            if (particle.life <= 0) {
                this.victoryAnimation.trail.splice(index, 1);
            }
        });

        // Show restart button when ship is off screen
        if (this.player.y < -this.player.height) {
            this.restartButton.style.display = 'block';
        }
    }

    hexToRgb(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return `${r}, ${g}, ${b}`;
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    new Game();
}); 