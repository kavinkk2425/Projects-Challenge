// =============================================
//  HOLI EXPRESS - ENHANCED SCRIPT
// =============================================

// --- State ---
let currentColor = '#ff006e';
let isRainbow = false;
let isPlaying = false;
let musicLoaded = false;
let gameActive = false;
let score = 0;
let gameTimer = null;
let countdown = 10;
let mouseTrailActive = false;
let lastMouseX = 0, lastMouseY = 0;
let trailInterval = null;

// --- Canvas Setup ---
const canvas = document.getElementById('particleCanvas');
const ctx = canvas.getContext('2d');
let particles = [];
let splats = [];

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
resizeCanvas();
window.addEventListener('resize', resizeCanvas);

// =============================================
//  PARTICLE SYSTEM (Enhanced)
// =============================================

const GRAVITY = 0.18;
const FRICTION = 0.97;

const HOLI_COLORS = ['#ff006e', '#ffbe0b', '#3a86ff', '#06ffa5', '#8338ec', '#fb5607', '#ff4d6d', '#48cae4'];

function getRainbowColor() {
    return HOLI_COLORS[Math.floor(Math.random() * HOLI_COLORS.length)];
}

function getActiveColor() {
    return isRainbow ? getRainbowColor() : currentColor;
}

class Particle {
    constructor(x, y, color, speedX, speedY, size) {
        this.x = x;
        this.y = y;
        this.size = size || Math.random() * 6 + 2;
        this.speedX = speedX !== undefined ? speedX : (Math.random() - 0.5) * 14;
        this.speedY = speedY !== undefined ? speedY : (Math.random() - 0.5) * 14 - 6;
        this.color = color;
        this.life = 1;
        this.decay = Math.random() * 0.018 + 0.008;
        this.rotation = Math.random() * Math.PI * 2;
        this.rotSpeed = (Math.random() - 0.5) * 0.2;
        this.shape = Math.random() > 0.5 ? 'circle' : 'drop'; // varied shapes
    }

    update() {
        this.speedY += GRAVITY;
        this.speedX *= FRICTION;
        this.speedY *= FRICTION;
        this.x += this.speedX;
        this.y += this.speedY;
        this.life -= this.decay;
        this.rotation += this.rotSpeed;

        if (this.life <= 0.12 && Math.random() > 0.75) {
            this.createSplat();
        }
    }

    createSplat() {
        if (splats.length > 700) splats.shift();
        const numDrops = Math.floor(Math.random() * 4) + 1;
        for (let i = 0; i < numDrops; i++) {
            splats.push({
                x: this.x + (Math.random() - 0.5) * 10,
                y: this.y + (Math.random() - 0.5) * 10,
                size: this.size * (3 + Math.random() * 4),
                color: this.color,
                alpha: Math.random() * 0.45 + 0.2,
                // elongation for a "splatter" look
                scaleX: 0.4 + Math.random() * 1.2,
                scaleY: 0.4 + Math.random() * 1.2,
                angle: Math.random() * Math.PI * 2
            });
        }
    }

    draw() {
        ctx.save();
        ctx.globalAlpha = this.life;
        ctx.fillStyle = this.color;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);

        if (this.shape === 'drop') {
            // Teardrop
            ctx.beginPath();
            ctx.moveTo(0, -this.size);
            ctx.bezierCurveTo(this.size, -this.size * 0.5, this.size, this.size, 0, this.size * 1.5);
            ctx.bezierCurveTo(-this.size, this.size, -this.size, -this.size * 0.5, 0, -this.size);
            ctx.fill();
        } else {
            ctx.beginPath();
            ctx.arc(0, 0, this.size, 0, Math.PI * 2);
            ctx.fill();
        }

        ctx.restore();
    }
}

function createExplosion(x, y, count = 40) {
    const color = getActiveColor();
    for (let i = 0; i < count; i++) {
        particles.push(new Particle(x, y, isRainbow ? getRainbowColor() : color));
    }
    createRipple(x, y, color);
}

function createMiniSplash(x, y) {
    const color = getActiveColor();
    for (let i = 0; i < 6; i++) {
        const p = new Particle(x, y, isRainbow ? getRainbowColor() : color,
            (Math.random() - 0.5) * 5,
            (Math.random() - 0.5) * 5 - 2,
            Math.random() * 3 + 1);
        particles.push(p);
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw splats
    splats.forEach(splat => {
        ctx.save();
        ctx.globalAlpha = splat.alpha;
        ctx.fillStyle = splat.color;
        ctx.translate(splat.x, splat.y);
        ctx.rotate(splat.angle || 0);
        ctx.scale(splat.scaleX || 1, splat.scaleY || 1);
        ctx.beginPath();
        ctx.arc(0, 0, splat.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    });

    // Update & draw particles
    particles = particles.filter(p => {
        p.update();
        p.draw();
        return p.life > 0;
    });

    requestAnimationFrame(animate);
}
animate();

// =============================================
//  RIPPLE EFFECT
// =============================================

function createRipple(x, y, color) {
    const container = document.getElementById('rippleContainer');
    const ripple = document.createElement('div');
    ripple.classList.add('ripple-circle');
    ripple.style.left = x + 'px';
    ripple.style.top = y + 'px';
    ripple.style.width = '60px';
    ripple.style.height = '60px';
    ripple.style.marginLeft = '-30px';
    ripple.style.marginTop = '-30px';
    ripple.style.borderColor = color;
    container.appendChild(ripple);
    setTimeout(() => ripple.remove(), 1000);
}

// =============================================
//  MOUSE / TOUCH INTERACTIONS
// =============================================

// Custom cursor following
const cursorTrail = document.getElementById('cursorTrail');
document.addEventListener('mousemove', (e) => {
    cursorTrail.style.left = e.clientX + 'px';
    cursorTrail.style.top = e.clientY + 'px';
    cursorTrail.style.background = `radial-gradient(circle, ${currentColor}, transparent)`;
    lastMouseX = e.clientX;
    lastMouseY = e.clientY;
});

// Mouse trail (paint as you drag)
document.addEventListener('mousemove', (e) => {
    if (e.buttons === 1) {
        if (!e.target.closest('.nav-item, .swatch, button, input, .music-widget, .bottom-nav')) {
            createMiniSplash(e.clientX, e.clientY);
        }
    }
});

// Click/tap to explode
document.addEventListener('mousedown', (e) => {
    if (e.target.closest('.nav-item, .swatch, button, input, .music-widget, .bottom-nav, .target')) return;
    createExplosion(e.clientX, e.clientY);
});

// Mobile touch
document.addEventListener('touchstart', (e) => {
    if (e.target.closest('.nav-item, .swatch, button, input, .music-widget, .bottom-nav, .target')) return;
    const t = e.touches[0];
    createExplosion(t.clientX, t.clientY);
}, { passive: true });

document.addEventListener('touchmove', (e) => {
    if (e.target.closest('.nav-item, .swatch, button, input, .music-widget, .bottom-nav, .target')) return;
    const t = e.touches[0];
    createMiniSplash(t.clientX, t.clientY);
}, { passive: true });

// =============================================
//  BUTTON RIPPLE EFFECT
// =============================================

document.querySelectorAll('.ripple-btn').forEach(btn => {
    btn.addEventListener('click', function (e) {
        const rect = this.getBoundingClientRect();
        const ripple = document.createElement('span');
        ripple.classList.add('ripple-effect');
        const size = Math.max(rect.width, rect.height);
        ripple.style.width = ripple.style.height = size + 'px';
        ripple.style.left = (e.clientX - rect.left - size / 2) + 'px';
        ripple.style.top = (e.clientY - rect.top - size / 2) + 'px';
        this.appendChild(ripple);
        setTimeout(() => ripple.remove(), 700);
    });
});

// =============================================
//  3D TILT CARD EFFECT
// =============================================

document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => {
        const rect = card.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        const rotateX = ((e.clientY - centerY) / rect.height) * -14;
        const rotateY = ((e.clientX - centerX) / rect.width) * 14;
        card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale(1.02)`;
        card.style.boxShadow = `0 30px 80px rgba(0,0,0,0.6), ${-rotateY * 0.5}px ${rotateX * 0.5}px 40px rgba(255,0,110,0.2)`;
    });

    card.addEventListener('mouseleave', () => {
        card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
        card.style.boxShadow = '';
    });
});

// =============================================
//  NAVIGATION
// =============================================

const navItems = document.querySelectorAll('.nav-item');
const sections = document.querySelectorAll('section');
const container = document.querySelector('.app-container');

container.addEventListener('scroll', () => {
    let current = '';
    sections.forEach(section => {
        const sectionTop = section.offsetTop;
        if (container.scrollTop >= sectionTop - section.clientHeight / 3) {
            current = section.getAttribute('id');
            section.classList.add('visible');
        }
    });

    navItems.forEach(item => {
        item.classList.remove('active');
        if (item.getAttribute('data-tab') === current) {
            item.classList.add('active');
        }
    });
});

navItems.forEach(item => {
    item.addEventListener('click', (e) => {
        e.preventDefault();
        const tabId = item.getAttribute('data-tab');
        const target = document.getElementById(tabId);
        target.scrollIntoView({ behavior: 'smooth' });
        navItems.forEach(n => n.classList.remove('active'));
        item.classList.add('active');
    });
});

// =============================================
//  COLOR PICKER
// =============================================

document.querySelectorAll('.swatch').forEach(swatch => {
    swatch.addEventListener('click', () => {
        document.querySelectorAll('.swatch').forEach(s => s.classList.remove('active'));
        swatch.classList.add('active');
        currentColor = swatch.dataset.color;
        isRainbow = currentColor === 'rainbow';

        const activeText = document.getElementById('activeColorText');
        activeText.style.color = isRainbow ? '#ff006e' : currentColor;
        activeText.innerText = swatch.dataset.name || currentColor;

        // Update cursor glow
        cursorTrail.style.background = `radial-gradient(circle, ${isRainbow ? '#ff006e' : currentColor}, transparent)`;

        // Swatch burst
        const rect = swatch.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        for (let i = 0; i < 15; i++) {
            particles.push(new Particle(cx, cy, isRainbow ? getRainbowColor() : currentColor,
                (Math.random() - 0.5) * 8,
                (Math.random() - 0.5) * 8 - 2,
                Math.random() * 3 + 1));
        }
    });
});

// Fire-burst button
function fireCurrentColor() {
    const count = 5;
    for (let i = 0; i < count; i++) {
        setTimeout(() => {
            createExplosion(
                window.innerWidth * 0.1 + Math.random() * window.innerWidth * 0.8,
                window.innerHeight * 0.1 + Math.random() * window.innerHeight * 0.5
            );
        }, i * 150);
    }
    showToast('🎇 Color burst fired!');
}

// =============================================
//  WISH GENERATION
// =============================================

const wishes = [
    "May the colors of Holi fill your life with joy and your heart with peace. Have a blessed Holi",
    "Wishing you a Holi filled with sweet moments and colorful memories to cherish forever",
    "May this Holi bring laughter, togetherness, and a rainbow of happiness to your doorstep",
    "Let the festival of colors paint your world with love, laughter, and endless fun",
    "May you be drenched in the most vibrant colors this Holi and every day that follows"
];

function generateWish() {
    const name = document.getElementById('nameInput').value.trim();
    if (!name) {
        showToast('✍️ Please enter a name first!');
        return;
    }
    const wish = wishes[Math.floor(Math.random() * wishes.length)];
    const wishResult = document.getElementById('wishResult');
    const wishText = document.getElementById('wishText');
    wishText.innerText = `${wish}, ${name}! 🌈✨`;

    wishResult.classList.remove('hidden');

    // Celebration burst
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            createExplosion(
                window.innerWidth * Math.random(),
                window.innerHeight * Math.random(),
                25
            );
        }, i * 200);
    }
    showToast('💌 Wish generated!');
}

function copyWish() {
    const text = document.getElementById('wishText').innerText;
    navigator.clipboard.writeText(text).then(() => {
        showToast('✅ Wish copied to clipboard!');
    }).catch(() => {
        showToast('Could not copy. Please copy manually.');
    });
}

// =============================================
//  🎮 COLOR CANNON GAME
// =============================================

let gameRunning = false;
let gameCountdown = 15;
let gameTimerInterval = null;

function startGame() {
    if (gameRunning) return;
    gameRunning = true;
    score = 0;
    gameCountdown = 15;
    document.getElementById('scoreDisplay').textContent = 0;
    document.getElementById('targetHint').textContent = `Time left: ${gameCountdown}s`;
    document.getElementById('startGameBtn').style.display = 'none';

    moveTarget();

    gameTimerInterval = setInterval(() => {
        gameCountdown--;
        document.getElementById('targetHint').textContent = `Time left: ${gameCountdown}s`;
        if (gameCountdown <= 0) endGame();
    }, 1000);
}

function moveTarget() {
    const target = document.getElementById('gameTarget');
    const zone = document.getElementById('targetZone');
    const zoneRect = zone.getBoundingClientRect();
    const maxX = Math.max(0, zoneRect.width - 70);
    const maxY = 80;
    const x = Math.random() * maxX;
    const y = Math.random() * maxY;
    target.style.left = x + 'px';
    target.style.top = y + 'px';
}

document.getElementById('gameTarget').addEventListener('click', (e) => {
    if (!gameRunning) return;
    score++;
    document.getElementById('scoreDisplay').textContent = score;
    const rect = e.target.getBoundingClientRect();
    createExplosion(rect.left + 30, rect.top + 30, 20);
    moveTarget();
});

document.getElementById('gameTarget').addEventListener('touchstart', (e) => {
    if (!gameRunning) return;
    e.stopPropagation();
    score++;
    document.getElementById('scoreDisplay').textContent = score;
    const t = e.touches[0];
    createExplosion(t.clientX, t.clientY, 20);
    moveTarget();
}, { passive: true });

function endGame() {
    clearInterval(gameTimerInterval);
    gameRunning = false;
    const target = document.getElementById('gameTarget');
    target.style.left = '50%';
    target.style.top = '30px';
    target.style.transform = 'translateX(-50%)';
    document.getElementById('startGameBtn').style.display = '';
    document.getElementById('targetHint').textContent = `Game over! Score: ${score} 🎉`;
    showToast(`🏆 Final Score: ${score}!`);

    // Victory burst
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            createExplosion(Math.random() * window.innerWidth, Math.random() * window.innerHeight, 30);
        }, i * 180);
    }
}

// =============================================
//  🎵 MUSIC SYSTEM
// =============================================

const bgMusic = document.getElementById('bgMusic');
const musicLabelEl = document.getElementById('musicLabel');
const musicBtn = document.getElementById('musicToggleBtn');
const musicSource = document.getElementById('musicSource');

// Auto-detect and load Ambikapathy.mp3 on startup
window.addEventListener('load', () => {

    // Attempt to autoplay immediately
    const attemptAutoplay = () => {
        if (!isPlaying) {
            const playPromise = bgMusic.play();
            if (playPromise !== undefined) {
                playPromise.then(() => {
                    isPlaying = true;
                    musicLoaded = true;
                    musicBtn.classList.remove('paused');
                    musicBtn.classList.add('playing');
                    musicLabelEl.textContent = 'Playing ♪';
                }).catch((err) => {
                    console.warn("Autoplay prevented by browser:", err);
                });
            }
        }
    };

    // Instead of a separate testAudio, we use the main bgMusic's events
    bgMusic.addEventListener('canplaythrough', () => {
        musicLoaded = true;
        if (!isPlaying) musicLabelEl.textContent = 'Click ▶ to Play';
        const nameEl = document.getElementById('musicFileName');
        if (nameEl) nameEl.textContent = 'Ambikapathy.mp3 ✅ Ready!';
        attemptAutoplay();
    }, { once: true });

    // Handle initial error
    bgMusic.addEventListener('error', () => {
        console.warn("Initial music load failed or dismissed.");
        if (!isPlaying) musicLabelEl.textContent = 'Add Music';
    }, { once: true });

    // Initial setup for the audio element
    bgMusic.load();

    // Try on load
    attemptAutoplay();

    // Try on any user interaction as a fallback
    const interactionEvents = ['click', 'touchstart', 'scroll', 'keydown'];
    const onInteract = () => {
        attemptAutoplay();
        interactionEvents.forEach(e => document.removeEventListener(e, onInteract));
    };
    interactionEvents.forEach(e => document.addEventListener(e, onInteract, { once: true }));
});

function toggleMusic() {
    if (!musicLoaded) {
        showToast('📂 No music found in /music folder. Choose a file!');
        document.getElementById('musicFileInput').click();
        return;
    }

    const visualizer = document.getElementById('musicVisualizer');
    const musicIcon = document.getElementById('musicIcon');

    if (isPlaying) {
        bgMusic.pause();
        isPlaying = false;
        musicBtn.classList.add('paused');
        musicBtn.classList.remove('playing');
        musicLabelEl.textContent = 'Paused';
        if (visualizer) visualizer.style.display = 'none';
        if (musicIcon) musicIcon.style.display = 'block';
        showToast('⏸ Music paused');
    } else {
        // Ensure volume is up before playing
        bgMusic.volume = 1;

        bgMusic.play().then(() => {
            isPlaying = true;
            musicBtn.classList.remove('paused');
            musicBtn.classList.add('playing');
            musicLabelEl.textContent = 'Playing ♪';
            if (visualizer) visualizer.style.display = 'flex';
            if (musicIcon) musicIcon.style.display = 'none';
            showToast('▶ Playing...');
        }).catch((err) => {
            console.error("Playback failed:", err);
            showToast('❌ Failed: Tap again or choose file');
            document.getElementById('musicFileInput').click();
        });
    }
}

function loadMusicFile(event) {
    const file = event.target.files[0];
    if (!file) return;

    const url = URL.createObjectURL(file);
    bgMusic.src = url;
    musicLoaded = true;

    // Update file label in About section
    const nameEl = document.getElementById('musicFileName');
    if (nameEl) nameEl.textContent = file.name;

    musicLabelEl.textContent = 'Loading...';

    bgMusic.load();
    bgMusic.oncanplaythrough = () => {
        bgMusic.play().then(() => {
            isPlaying = true;
            musicBtn.classList.add('playing');
            musicLabelEl.textContent = 'Playing ♪';
            showToast(`🎵 Now playing: ${file.name}`);
        }).catch(() => {
            showToast('❌ Playback error. Try clicking the music button.');
        });
    };
}

// =============================================
//  TOAST NOTIFICATIONS
// =============================================

function showToast(msg, duration = 2000) {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.classList.add('toast');
    toast.textContent = msg;
    container.appendChild(toast);
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transition = 'opacity 0.3s';
        setTimeout(() => toast.remove(), 300);
    }, duration);
}

// =============================================
//  INITIAL LOAD ANIMATIONS
// =============================================

window.addEventListener('load', () => {
    // Show first section
    setTimeout(() => {
        document.getElementById('home').classList.add('visible');
    }, 100);

    // Auto-launch subtle burst after a moment
    setTimeout(() => {
        for (let i = 0; i < 4; i++) {
            setTimeout(() => {
                createExplosion(
                    Math.random() * window.innerWidth,
                    Math.random() * (window.innerHeight * 0.6),
                    20
                );
            }, i * 350);
        }
    }, 600);

    // Init icons (if not already done inline)
    if (typeof lucide !== 'undefined') {
        lucide.createIcons();
    }
});


// =============================================
//  AMBIENT HOLI EFFECT (random bursts over time)
// =============================================

setInterval(() => {
    if (Math.random() > 0.7) {
        const edge = Math.random();
        let x, y;
        if (edge < 0.5) {
            x = Math.random() * window.innerWidth;
            y = -10;
        } else {
            x = Math.random() < 0.5 ? -10 : window.innerWidth + 10;
            y = Math.random() * window.innerHeight;
        }
        const color = HOLI_COLORS[Math.floor(Math.random() * HOLI_COLORS.length)];
        for (let i = 0; i < 5; i++) {
            particles.push(new Particle(x, y, color,
                (Math.random() - 0.5) * 6,
                Math.random() * 4 + 1,
                Math.random() * 3 + 1));
        }
    }
}, 800);

// =============================================
//  WELCOME OVERLAY + MUSIC AUTOPLAY
// =============================================

const welcomeOverlay = document.getElementById('welcomeOverlay');

function dismissOverlayAndPlay(e) {
    if (!welcomeOverlay) return;

    // Prevent multiple triggers
    if (welcomeOverlay.dataset.triggered) return;
    welcomeOverlay.dataset.triggered = 'true';

    // Unhide music widget
    const musicWidget = document.getElementById('musicWidget');
    if (musicWidget) musicWidget.style.opacity = '1';

    // Animate overlay out
    welcomeOverlay.classList.add('hidden');
    setTimeout(() => welcomeOverlay.remove(), 700);

    // CRITICAL for Mobile: Unlocking audio element
    // 🔓 Unlocking audio silently...

    // 1. Ensure volume is up
    bgMusic.volume = 1;

    // 2. Play immediately in the gesture callstack
    const playPromise = bgMusic.play();

    if (playPromise !== undefined) {
        playPromise.then(() => {
            isPlaying = true;
            musicLoaded = true;
            musicBtn.classList.remove('paused');
            musicBtn.classList.add('playing');
            musicLabelEl.textContent = 'Playing ♪';
        }).catch(error => {
            console.error("Mobile Unlock Failed:", error);
            musicLoaded = true;
            musicLabelEl.textContent = 'Tap to Play';
        });
    }

    // Celebration burst
    for (let i = 0; i < 6; i++) {
        setTimeout(() => {
            createExplosion(
                Math.random() * window.innerWidth,
                Math.random() * (window.innerHeight * 0.7),
                30
            );
        }, i * 120);
    }
}

// User-Interaction Binding
if (welcomeOverlay) {
    welcomeOverlay.addEventListener('click', dismissOverlayAndPlay);
    welcomeOverlay.addEventListener('touchstart', dismissOverlayAndPlay);
}
