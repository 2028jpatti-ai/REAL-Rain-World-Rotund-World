const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');

// Set canvas to full window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 120; // Account for header/footer
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game state
const game = {
    creatures: [],
    particles: [],
    shelterY: 0,
    borderThickness: 8,
    borderColor: '#f39c12'
};

// Creature class
class Creature {
    constructor(x, y, size, type = 'normal') {
        this.x = x;
        this.y = y;
        this.size = size;
        this.type = type; // 'rotund' for bloated, 'normal' for regular
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotationSpeed = (Math.random() - 0.5) * 0.02;
        this.bodySize = type === 'rotund' ? size * 2.5 : size;
        this.wobbleAmount = type === 'rotund' ? 0.02 : 0;
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.color = this.getColor();
    }

    getColor() {
        if (this.type === 'rotund') return '#1abc9c'; // Bright green for rotund
        const colors = ['#f39c12', '#e74c3c']; // Orange and red for normal
        return colors[Math.floor(Math.random() * colors.length)];
    }

    update() {
        // Apply gravity towards shelter area
        const gravity = 0.15;
        this.vy += gravity;

        // Update position
        this.x += this.vx;
        this.y += this.vy;

        // Update rotation
        this.rotation += this.rotationSpeed;
        this.wobblePhase += this.wobbleAmount;

        // Bounce off walls
        const padding = this.bodySize / 2 + game.borderThickness;
        if (this.x - this.bodySize / 2 < game.borderThickness) {
            this.x = game.borderThickness + this.bodySize / 2;
            this.vx = Math.abs(this.vx) * 0.7;
        }
        if (this.x + this.bodySize / 2 > canvas.width - game.borderThickness) {
            this.x = canvas.width - game.borderThickness - this.bodySize / 2;
            this.vx = -Math.abs(this.vx) * 0.7;
        }

        // Bounce off top
        if (this.y - this.bodySize / 2 < game.borderThickness) {
            this.y = game.borderThickness + this.bodySize / 2;
            this.vy = Math.abs(this.vy) * 0.7;
        }

        // Stop at shelter area
        game.shelterY = canvas.height - 60;
        if (this.y + this.bodySize / 2 >= game.shelterY) {
            this.y = game.shelterY - this.bodySize / 2;
            this.vy = 0;
            this.vx *= 0.95;
        }
    }

    draw() {
        ctx.save();
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        // Draw body (much larger if rotund)
        if (this.type === 'rotund') {
            // Bloated body with wobble
            const wobble = Math.sin(this.wobblePhase) * 0.15;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.ellipse(0, 0, this.bodySize / 2 * (1 + wobble), this.bodySize / 2, 0, 0, Math.PI * 2);
            ctx.fill();

            // Add shine effect
            ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
            ctx.beginPath();
            ctx.ellipse(-this.bodySize / 6, -this.bodySize / 6, this.bodySize / 5, this.bodySize / 8, 0, 0, Math.PI * 2);
            ctx.fill();
        } else {
            // Normal creature body
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(0, 0, this.bodySize / 2, 0, Math.PI * 2);
            ctx.fill();
        }

        // Draw eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-this.bodySize / 6, -this.bodySize / 8, this.bodySize / 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(this.bodySize / 6, -this.bodySize / 8, this.bodySize / 12, 0, Math.PI * 2);
        ctx.fill();

        // Draw pupils (looking down for rotund creatures)
        ctx.fillStyle = '#fff';
        if (this.type === 'rotund') {
            ctx.beginPath();
            ctx.arc(-this.bodySize / 6, -this.bodySize / 12, this.bodySize / 20, 0, Math.PI * 2);
            ctx.fill();
            ctx.beginPath();
            ctx.arc(this.bodySize / 6, -this.bodySize / 12, this.bodySize / 20, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

// Particle class
class Particle {
    constructor(x, y, vx, vy, color, life) {
        this.x = x;
        this.y = y;
        this.vx = vx;
        this.vy = vy;
        this.color = color;
        this.life = life;
        this.maxLife = life;
        this.size = 3;
    }

    update() {
        this.x += this.vx;
        this.y += this.vy;
        this.vy += 0.1; // gravity
        this.life--;
    }

    draw() {
        const opacity = this.life / this.maxLife;
        ctx.fillStyle = this.color.replace(')', `, ${opacity})`).replace('rgb', 'rgba');
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Initialize creatures
function initializeCreatures() {
    game.creatures = [];
    game.particles = [];

    // Add some rotund creatures at various positions
    for (let i = 0; i < 3; i++) {
        const x = Math.random() * (canvas.width - 200) + 100;
        const y = Math.random() * (canvas.height / 2 - 150) + 50;
        game.creatures.push(new Creature(x, y, 25, 'rotund'));
    }

    // Add some normal creatures
    for (let i = 0; i < 2; i++) {
        const x = Math.random() * (canvas.width - 200) + 100;
        const y = Math.random() * (canvas.height / 2 - 150) + 50;
        game.creatures.push(new Creature(x, y, 15, 'normal'));
    }
}

initializeCreatures();

// Draw background border
function drawBorder() {
    ctx.strokeStyle = game.borderColor;
    ctx.lineWidth = game.borderThickness;
    ctx.strokeRect(
        game.borderThickness / 2,
        game.borderThickness / 2,
        canvas.width - game.borderThickness,
        canvas.height - game.borderThickness
    );
}

// Draw shelter area
function drawShelter() {
    game.shelterY = canvas.height - 60;
    ctx.fillStyle = '#34495e';
    ctx.fillRect(0, game.shelterY, canvas.width, canvas.height);
    
    // Shelter border
    ctx.strokeStyle = game.borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, game.shelterY, canvas.width, canvas.height);
}

// Draw rain particles
function drawRain() {
    for (let i = 0; i < 5; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height - game.shelterY) + 50;
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Update game state
function update() {
    game.creatures.forEach(creature => {
        creature.update();
    });

    game.particles = game.particles.filter(p => p.life > 0);
    game.particles.forEach(particle => {
        particle.update();
    });
}

// Draw game
function draw() {
    // Clear canvas
    ctx.fillStyle = '#2c3e50';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw border
    drawBorder();

    // Draw rain particles
    drawRain();

    // Draw creatures
    game.creatures.forEach(creature => {
        creature.draw();
    });

    // Draw particles
    game.particles.forEach(particle => {
        particle.draw();
    });

    // Draw shelter area
    drawShelter();
}

// Clear button functionality
clearBtn.addEventListener('click', () => {
    initializeCreatures();
});

// Game loop
function gameLoop() {
    update();
    draw();
    requestAnimationFrame(gameLoop);
}

gameLoop();