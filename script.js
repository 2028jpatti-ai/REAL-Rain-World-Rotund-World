const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
const clearBtn = document.getElementById('clearBtn');

// Set canvas to full window size
function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight - 120;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// Game state
const game = {
    creatures: [],
    particles: [],
    shelterY: 0,
    borderThickness: 8,
    borderColor: '#f39c12',
    selectedCreature: null,
    keys: {}
};

// Pixel drawing utility
function drawPixel(x, y, size, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x, y, size, size);
}

// Creature class
class Creature {
    constructor(x, y, size, type = 'slugcat') {
        this.x = x;
        this.y = y;
        this.size = size;
        this.type = type; // 'slugcat', 'lizard', 'rotund_slugcat', 'rotund_lizard'
        this.vx = (Math.random() - 0.5) * 2;
        this.vy = (Math.random() - 0.5) * 2;
        this.rotation = 0;
        this.bodyScale = this.type.includes('rotund') ? 2.2 : 1;
        this.wobblePhase = Math.random() * Math.PI * 2;
        this.wobbleAmount = this.type.includes('rotund') ? 0.04 : 0;
        this.isSelected = false;
        this.animationFrame = 0;
    }

    update(isControlled = false) {
        const gravity = 0.15;
        this.vy += gravity;

        if (isControlled) {
            const moveForce = this.type.includes('rotund') ? 0.25 : 0.4;
            
            if (game.keys['ArrowUp'] || game.keys['w'] || game.keys['W']) {
                this.vy -= moveForce;
            }
            if (game.keys['ArrowDown'] || game.keys['s'] || game.keys['S']) {
                this.vy += moveForce * 0.4;
            }
            if (game.keys['ArrowLeft'] || game.keys['a'] || game.keys['A']) {
                this.vx -= moveForce;
            }
            if (game.keys['ArrowRight'] || game.keys['d'] || game.keys['D']) {
                this.vx += moveForce;
            }

            if (this.type.includes('rotund')) {
                this.vx *= 0.92;
                this.vy *= 0.92;
            }
        }

        this.x += this.vx;
        this.y += this.vy;
        this.wobblePhase += this.wobbleAmount;
        this.animationFrame = (this.animationFrame + 1) % 8;

        const bodySize = this.size * this.bodyScale;
        const padding = bodySize / 2 + game.borderThickness;

        if (this.x - bodySize / 2 < game.borderThickness) {
            this.x = game.borderThickness + bodySize / 2;
            this.vx = Math.abs(this.vx) * 0.7;
        }
        if (this.x + bodySize / 2 > canvas.width - game.borderThickness) {
            this.x = canvas.width - game.borderThickness - bodySize / 2;
            this.vx = -Math.abs(this.vx) * 0.7;
        }

        if (this.y - bodySize / 2 < game.borderThickness) {
            this.y = game.borderThickness + bodySize / 2;
            this.vy = Math.abs(this.vy) * 0.7;
        }

        game.shelterY = canvas.height - 60;
        if (this.y + bodySize / 2 >= game.shelterY) {
            this.y = game.shelterY - bodySize / 2;
            this.vy = 0;
            this.vx *= 0.95;
        }
    }

    drawSlugcat() {
        const scale = this.bodyScale;
        const wobble = Math.sin(this.wobblePhase) * 0.3 * scale;
        const baseSize = this.size;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Body - wide and round for rotund effect
        const bodyWidth = baseSize * 1.4 * scale + wobble;
        const bodyHeight = baseSize * 1.2 * scale;

        // Main body (orange-yellow)
        ctx.fillStyle = '#E8A54D';
        ctx.beginPath();
        ctx.ellipse(0, 0, bodyWidth / 2, bodyHeight / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Belly (lighter)
        ctx.fillStyle = '#F5D076';
        ctx.beginPath();
        ctx.ellipse(0, bodyHeight / 6, bodyWidth / 2.5, bodyHeight / 2.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head
        const headSize = baseSize * 0.7 * scale;
        ctx.fillStyle = '#E8A54D';
        ctx.beginPath();
        ctx.ellipse(0, -bodyHeight / 2 - headSize / 3, headSize, headSize, 0, 0, Math.PI * 2);
        ctx.fill();

        // Ears
        ctx.fillStyle = '#D48A3D';
        ctx.beginPath();
        ctx.ellipse(-headSize / 3, -bodyHeight / 2 - headSize, headSize / 3, headSize / 2, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(headSize / 3, -bodyHeight / 2 - headSize, headSize / 3, headSize / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eyes
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-headSize / 4, -bodyHeight / 2 - headSize / 3, headSize / 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(headSize / 4, -bodyHeight / 2 - headSize / 3, headSize / 8, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-headSize / 4 + 2, -bodyHeight / 2 - headSize / 3 - 2, headSize / 16, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(headSize / 4 + 2, -bodyHeight / 2 - headSize / 3 - 2, headSize / 16, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = '#D48A3D';
        ctx.beginPath();
        ctx.ellipse(0, -bodyHeight / 2, headSize / 3.5, headSize / 4, 0, 0, Math.PI * 2);
        ctx.fill();

        // Front paws
        ctx.fillStyle = '#D48A3D';
        ctx.beginPath();
        ctx.ellipse(-bodyWidth / 3, bodyHeight / 3, baseSize * 0.3 * scale, baseSize * 0.25 * scale, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(bodyWidth / 3, bodyHeight / 3, baseSize * 0.3 * scale, baseSize * 0.25 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Selection highlight
        if (this.isSelected) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(0, 0, bodyWidth / 2 + 10, bodyHeight / 2 + 10, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    drawLizard() {
        const scale = this.bodyScale;
        const wobble = Math.sin(this.wobblePhase) * 0.25 * scale;
        const baseSize = this.size;

        ctx.save();
        ctx.translate(this.x, this.y);

        // Body - long and round for rotund effect
        const bodyWidth = baseSize * 1.6 * scale + wobble;
        const bodyHeight = baseSize * 0.9 * scale;

        // Main body (green/teal)
        ctx.fillStyle = '#4DB8A8';
        ctx.beginPath();
        ctx.ellipse(0, 0, bodyWidth / 2, bodyHeight / 2, 0, 0, Math.PI * 2);
        ctx.fill();

        // Body stripes
        ctx.fillStyle = '#3A9B90';
        ctx.beginPath();
        ctx.ellipse(0, -bodyHeight / 4, bodyWidth / 2, bodyHeight / 6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.beginPath();
        ctx.ellipse(0, bodyHeight / 4, bodyWidth / 2, bodyHeight / 6, 0, 0, Math.PI * 2);
        ctx.fill();

        // Head (pointed)
        const headSize = baseSize * 0.6 * scale;
        ctx.fillStyle = '#4DB8A8';
        ctx.beginPath();
        ctx.ellipse(-bodyWidth / 2.5, 0, headSize * 0.7, headSize * 0.8, 0, 0, Math.PI * 2);
        ctx.fill();

        // Snout
        ctx.fillStyle = '#3A9B90';
        ctx.beginPath();
        ctx.ellipse(-bodyWidth / 2.8, 0, headSize * 0.4, headSize * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        // Eye
        ctx.fillStyle = '#000';
        ctx.beginPath();
        ctx.arc(-bodyWidth / 2.2, -headSize / 4, headSize / 6, 0, Math.PI * 2);
        ctx.fill();

        // Eye shine
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(-bodyWidth / 2.2 + 2, -headSize / 4 - 2, headSize / 12, 0, Math.PI * 2);
        ctx.fill();

        // Tail
        ctx.strokeStyle = '#4DB8A8';
        ctx.lineWidth = baseSize * 0.25 * scale;
        ctx.beginPath();
        ctx.moveTo(bodyWidth / 2, 0);
        ctx.quadraticCurveTo(bodyWidth / 2 + 20, bodyHeight / 3, bodyWidth / 2 + 30, bodyHeight / 2);
        ctx.stroke();

        // Front legs
        ctx.fillStyle = '#3A9B90';
        ctx.beginPath();
        ctx.ellipse(-bodyWidth / 4, bodyHeight / 2.5, baseSize * 0.25 * scale, baseSize * 0.2 * scale, 0, 0, Math.PI * 2);
        ctx.fill();

        // Selection highlight
        if (this.isSelected) {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.ellipse(0, 0, bodyWidth / 2 + 10, bodyHeight / 2 + 10, 0, 0, Math.PI * 2);
            ctx.stroke();
        }

        ctx.restore();
    }

    draw() {
        if (this.type.includes('slugcat')) {
            this.drawSlugcat();
        } else if (this.type.includes('lizard')) {
            this.drawLizard();
        }
    }
}

// Initialize creatures
function initializeCreatures() {
    game.creatures = [];
    game.selectedCreature = null;

    // Add rotund slugcats
    for (let i = 0; i < 2; i++) {
        const x = Math.random() * (canvas.width - 200) + 100;
        const y = Math.random() * (canvas.height / 2 - 150) + 50;
        game.creatures.push(new Creature(x, y, 30, 'rotund_slugcat'));
    }

    // Add rotund lizards
    for (let i = 0; i < 2; i++) {
        const x = Math.random() * (canvas.width - 200) + 100;
        const y = Math.random() * (canvas.height / 2 - 150) + 50;
        game.creatures.push(new Creature(x, y, 28, 'rotund_lizard'));
    }

    // Add normal slugcat for comparison
    const x = Math.random() * (canvas.width - 200) + 100;
    const y = Math.random() * (canvas.height / 2 - 150) + 50;
    game.creatures.push(new Creature(x, y, 20, 'slugcat'));

    // Select the first rotund creature
    if (game.creatures.length > 0) {
        game.selectedCreature = game.creatures[0];
        game.selectedCreature.isSelected = true;
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
    ctx.fillStyle = '#2C5F4F';
    ctx.fillRect(0, game.shelterY, canvas.width, canvas.height);
    
    ctx.strokeStyle = game.borderColor;
    ctx.lineWidth = 2;
    ctx.strokeRect(0, game.shelterY, canvas.width, canvas.height);
}

// Draw rain particles
function drawRain() {
    for (let i = 0; i < 8; i++) {
        const x = Math.random() * canvas.width;
        const y = Math.random() * (canvas.height - game.shelterY) + 50;
        ctx.fillStyle = '#f39c12';
        ctx.beginPath();
        ctx.arc(x, y, 3, 0, Math.PI * 2);
        ctx.fill();
    }
}

// Draw UI text
function drawUI() {
    ctx.fillStyle = '#95a5a6';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('ARROW KEYS/WASD to move | Click to select', 10, 25);
    ctx.fillText('Try controlling the bloated creatures!', 10, 45);
}

// Update game state
function update() {
    game.creatures.forEach((creature) => {
        const isControlled = creature === game.selectedCreature;
        creature.update(isControlled);
    });
}

// Draw game
function draw() {
    ctx.fillStyle = '#1a2332';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    drawBorder();
    drawRain();

    game.creatures.forEach(creature => {
        creature.draw();
    });

    drawShelter();
    drawUI();
}

// Keyboard input
document.addEventListener('keydown', (e) => {
    game.keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    game.keys[e.key] = false;
});

// Mouse click to select
canvas.addEventListener('click', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    for (let creature of game.creatures) {
        const dist = Math.hypot(creature.x - mouseX, creature.y - mouseY);
        const bodySize = creature.size * creature.bodyScale;
        if (dist < bodySize / 2 + 20) {
            if (game.selectedCreature) {
                game.selectedCreature.isSelected = false;
            }
            game.selectedCreature = creature;
            creature.isSelected = true;
            break;
        }
    }
});

// Clear button
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
