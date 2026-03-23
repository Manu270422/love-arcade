// ==========================================================
// 🎵 CONFIGURACIÓN DE AUDIO INICIAL
// ==========================================================
const bgMusic = new Audio('/games/runner/musica-romantica.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.4; 

const canvas = document.getElementById("runnerCanvas");
const ctx = canvas.getContext("2d");

// Configuración fija del canvas para lógica interna
canvas.width = 900;
canvas.height = 450;

// Variables de estado
let score = 0;
let lives = 3;
let gameOver = false;
let gameStarted = false;
let bgX = 0;

// --- 🛡️ Variables Modo Novia ---
let obstacleTimer = 0; 
let invencible = false; 

// Definición del Jugador
const player = {
    x: 100,
    y: 340, 
    width: 60, 
    height: 60, 
    dy: 0,
    gravity: 0.6, // Gravedad más suave (antes 0.8) para saltos más "flotantes"
    jump: -15,    // Salto ajustado a la nueva gravedad
    grounded: true,
    rotation: 0
};

// Arrays de objetos
let obstacles = [];
let hearts = [];
let particles = [];

// ==========================================================
// 🖼️ SISTEMA DE PRE-CARGA DE IMÁGENES PROFESIONAL
// ==========================================================
const imgPlayer = new Image();
const imgHeart = new Image();
const imgObs = new Image();
const imgBg = new Image();

const cargarImagenes = () => {
    const imagenes = [
        { img: imgPlayer, src: 'games/runner/player.png' },
        { img: imgHeart,  src: 'games/runner/heart.png' },
        { img: imgObs,    src: 'games/runner/obstacle.png' },
        { img: imgBg,     src: 'games/runner/background.jpg' }
    ];

    const promesas = imagenes.map(item => {
        return new Promise((resolve, reject) => {
            item.img.onload = () => resolve();
            item.img.onerror = () => {
                console.error(`❌ Error fatal: No se pudo cargar la imagen en: ${item.src}`);
                reject();
            };
            item.img.src = item.src; 
        });
    });

    return Promise.all(promesas);
};

// Control del botón de inicio
const startBtn = document.getElementById("startBtn");
if (startBtn) {
    startBtn.innerText = "Cargando aventura...";
    startBtn.disabled = true;

    cargarImagenes().then(() => {
        console.log("✅ Todo listo para la sorpresa.");
        startBtn.innerText = "¡Empezar!";
        startBtn.disabled = false;
        startBtn.onclick = startGame;
    }).catch(() => {
        startBtn.innerText = "Error de carga";
        startBtn.style.background = "#ff4d4d";
    });
}

// ==========================================================
// 🎮 LÓGICA DE INICIO Y CONTROLES
// ==========================================================
function startGame() {
    if(gameOver) {
        location.reload();
        return;
    }
    
    const startScreen = document.getElementById("startScreen");
    if(startScreen) startScreen.style.display = "none";
    
    bgMusic.play().catch(error => {
        console.log("El navegador requiere interacción previa para el audio:", error);
    });
    
    gameStarted = true;
    requestAnimationFrame(update);
}

function jump() {
    if (player.grounded && !gameOver && gameStarted) {
        player.dy = player.jump;
        player.grounded = false;
    }
}

window.addEventListener("keydown", e => { if(e.code === "Space") jump(); });
canvas.addEventListener("touchstart", (e) => { e.preventDefault(); jump(); }, { passive: false });

// ==========================================================
// 🔄 BUCLE PRINCIPAL (UPDATE)
// ==========================================================
function update() {
    if (!gameStarted || gameOver) return;

    // 1. DIBUJAR FONDO INFINITO (PARALLAX)
    bgX -= 2; 
    if (bgX <= -canvas.width) bgX = 0;
    ctx.drawImage(imgBg, bgX, 0, canvas.width, canvas.height);
    ctx.drawImage(imgBg, bgX + canvas.width, 0, canvas.width, canvas.height);

    // 2. FÍSICA JUGADOR
    player.y += player.dy;
    player.dy += player.gravity;

    if (player.y + player.height >= 400) {
        player.y = 400 - player.height;
        player.dy = 0;
        player.grounded = true;
        player.rotation = 0;
    } else {
        player.rotation = player.dy * 0.02; 
    }

    // 🧍 DIBUJAR PLAYER (Con efecto de parpadeo si es invencible)
    if (!invencible || Math.floor(Date.now() / 100) % 2) { 
        ctx.save();
        ctx.translate(player.x + player.width/2, player.y + player.height/2);
        ctx.rotate(player.rotation);
        ctx.shadowBlur = 15;
        ctx.shadowColor = "rgba(255,215,0,0.5)";
        ctx.drawImage(imgPlayer, -player.width/2, -player.height/2, player.width, player.height);
        ctx.restore();
    }

    // 3. GENERAR OBJETOS (Con Cooldown de Obstáculos)
    obstacleTimer++;
    if (obstacleTimer > 100) { // Espera mínima de ~1.5 seg
        if (Math.random() < 0.02) {
            spawnObstacle();
            obstacleTimer = 0; 
        }
    }

    if (Math.random() < 0.015) spawnHeart();

    // 4. LÓGICA DE OBSTÁCULOS (Velocidad reducida e Invencibilidad)
    for (let i = obstacles.length - 1; i >= 0; i--) {
        let o = obstacles[i];
        o.x -= 6; // Velocidad más tranquila (antes 7)
        ctx.drawImage(imgObs, o.x, o.y, o.size, o.size);

        if (checkCollision(player, o) && !invencible) {
            obstacles.splice(i, 1);
            lives--;
            invencible = true; 
            createParticles(player.x + player.width/2, player.y + player.height/2, "#ff4d6d");
            updateHUD();
            
            if (lives <= 0) {
                endGame(false);
            } else {
                // Timer de paz: 2 segundos de inmunidad
                setTimeout(() => { invencible = false; }, 2000);
            }
        }
        if (o.x + o.size < 0) obstacles.splice(i, 1);
    }

    // 5. LÓGICA DE CORAZONES
    for (let i = hearts.length - 1; i >= 0; i--) {
        let h = hearts[i];
        h.x -= 5;
        let floatingY = h.y + Math.sin(Date.now() / 200) * 10;
        ctx.drawImage(imgHeart, h.x, floatingY, h.size, h.size);

        if (checkCollision(player, { ...h, y: floatingY })) {
            hearts.splice(i, 1);
            score += 10;
            createParticles(h.x + h.size/2, h.y + h.size/2, "#ffd700");
            updateHUD();
            if (score >= 100) endGame(true);
        }
        if (h.x + h.size < 0) hearts.splice(i, 1);
    }

    // 6. PARTÍCULAS
    drawParticles();

    requestAnimationFrame(update);
}

// ==========================================================
// 🛠️ FUNCIONES AUXILIARES
// ==========================================================
function spawnObstacle() {
    obstacles.push({ x: canvas.width, y: 355, size: 45 });
}

function spawnHeart() {
    hearts.push({ x: canvas.width, y: 150 + Math.random() * 150, size: 35 });
}

function checkCollision(p, obj) {
    const margin = 22; // Hitbox MUY generosa. El juego le perdona casi todo.
    return p.x + margin < obj.x + obj.size &&
           p.x + p.width - margin > obj.x &&
           p.y + margin < obj.y + obj.size &&
           p.y + p.height - margin > obj.y;
}

function updateHUD() {
    const scoreEl = document.getElementById("score");
    const livesEl = document.getElementById("lives");
    if (scoreEl) scoreEl.textContent = score;
    if (livesEl) livesEl.textContent = lives;
}

function createParticles(x, y, color) {
    for (let i = 0; i < 10; i++) {
        particles.push({
            x, y,
            dx: (Math.random() - 0.5) * 8,
            dy: (Math.random() - 0.5) * 8,
            life: 40,
            color: color
        });
    }
}

function drawParticles() {
    for (let i = particles.length - 1; i >= 0; i--) {
        let p = particles[i];
        p.x += p.dx; p.y += p.dy; p.life--;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.life / 40;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 3, 0, Math.PI * 2);
        ctx.fill();
        ctx.globalAlpha = 1;
        if (p.life <= 0) particles.splice(i, 1);
    }
}

function endGame(win) {
    gameOver = true;
    if (win) {
        desbloquearRecuerdo();
    } else {
        bgMusic.pause(); 
        alert("¡Casi, mi amor! Inténtalo de nuevo 💖");
        location.reload();
    }
}

function desbloquearRecuerdo() {
    const container = document.getElementById('runner-game');
    if (!container) return;
    
    container.innerHTML = `
        <div class="victory-card" style="text-align:center; animation: fadeIn 1.5s; padding: 20px; color: white;">
            <h2 style="color: #ffd700; font-size: 2.5rem; text-shadow: 0 0 10px rgba(255,215,0,0.5);">¡Lo lograste, mi amor! 💛</h2>
            <p style="font-size: 1.2rem; margin-bottom: 10px;">Has ganado nuestro recuerdo especial:</p>
            <div style="position: relative; display: inline-block;">
                <img src="/games/runner/tu-y-yo.jpg" style="width:100%; max-width: 400px; border: 5px solid #ffd700; border-radius:15px; margin: 10px 0; box-shadow: 0 0 30px #ffd700;">
            </div>
            <p style="font-size: 1.6rem; font-style: italic; margin-top: 15px;">"Eres el mejor gol de mi vida"</p>
            <button onclick="location.reload()" style="margin-top:25px; padding:15px 40px; font-size:1.2rem; cursor:pointer; background:linear-gradient(45deg, #ffd700, #ffcc00); border:none; border-radius:30px; font-weight:bold; color:black; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">Volver al menú</button>
        </div>
    `;
}