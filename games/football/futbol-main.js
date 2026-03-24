// ==========================================================
// ⚽ PENALTY LOVE:🧤❤️
// ==========================================================

// --- Recursos ---
const goalSound = new Audio('games/football/assets/music/gol.mp3');
goalSound.volume = 0.6; // ✅ Volumen equilibrado

const shootSound = new Audio('games/football/assets/music/disparo.mp3'); 
shootSound.volume = 0.4; // Sonido suave al patear

const winSound = new Audio('games/football/assets/music/victoria.mp3'); 
winSound.volume = 0.5; // Música romántica/triunfal al final

const imgPortero = new Image();
imgPortero.src = 'games/football/assets/img/portero_yo.png'; 

// --- 💖 1. SISTEMA DE MENSAJES ROMÁNTICOS ---
const loveMessages = [
    "Eres mi felicidad 💛",
    "Cada gol es por ti 😍",
    "Me encantas demasiado 💖",
    "Quiero un futuro contigo 🏡",
    "Eres mi mejor jugada ✨",
    "Mi corazón es tu arco 💘"
];

function showLoveMessage(text) {
    const el = document.getElementById("loveMessage");
    if (!el) return;

    el.textContent = text;
    el.classList.add("show");

    setTimeout(() => {
        el.classList.remove("show");
    }, 2500); // Un poco más de tiempo para leer
}

class PenaltyGame {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext("2d");
        this.state = "apuntado"; 
        
        this.ball = { x: this.canvas.width/2, y: this.canvas.height-50, radius: 15, vx: 0, vy: 0, inMotion: false };
        this.goals = 0;
        this.attempts = 5;
        this.pointerStart = null;
        
        this.goalkeeper = { 
            x: this.canvas.width/2 - 45, 
            y: 80, 
            width: 90, 
            height: 90, 
            vx: 0, 
            vy: 0, 
            diving: false 
        };
        
        this.loop = this.loop.bind(this);
        this.initControls();
        this.animationId = requestAnimationFrame(this.loop);
    }

    initControls() {
        this.canvas.addEventListener("pointerdown", e => {
            // Desbloqueo de audio para móviles
            goalSound.play().then(() => {
                goalSound.pause();
                goalSound.currentTime = 0;
            }).catch(() => {});

            const rect = this.canvas.getBoundingClientRect();
            this.pointerStart = { 
                x: (e.clientX - rect.left) * (this.canvas.width / rect.width), 
                y: (e.clientY - rect.top) * (this.canvas.height / rect.height) 
            };
        });

        this.canvas.addEventListener("pointerup", e => {
            if ((this.state === "apuntado" || this.state === "carga") && this.pointerStart) {
                const rect = this.canvas.getBoundingClientRect();
                const currentX = (e.clientX - rect.left) * (this.canvas.width / rect.width);
                const currentY = (e.clientY - rect.top) * (this.canvas.height / rect.height);
                
                const dx = currentX - this.pointerStart.x;
                const dy = currentY - this.pointerStart.y;
                this.shoot(dx, dy);
            }
        });
    }

    shoot(dx, dy) {
        if (this.ball.inMotion) return;
        
        // 🔊 Sonido al disparar
        shootSound.currentTime = 0;
        shootSound.play().catch(() => {});

        this.state = "disparo";
        this.ball.vx = dx * 0.15;
        this.ball.vy = dy * 0.15; 
        this.ball.inMotion = true;
        this.goalkeeperAI();
    }

    goalkeeperAI() {
        const prediction = this.ball.x + (this.ball.vx * 15);
        
        // 🧠 5. MEJORA DE IA (Entre más goles, más difícil)
        const difficulty = Math.max(20, 85 - (this.goals * 20)); 
        const error = (Math.random() - 0.5) * difficulty;
        
        const targetX = prediction + error;
        this.goalkeeper.vx = (targetX - (this.goalkeeper.x + this.goalkeeper.width/2)) * 0.12;
        this.goalkeeper.diving = true;
    }

    update() {
        if (this.ball.inMotion) {
            this.ball.x += this.ball.vx;
            this.ball.y += this.ball.vy;
            this.ball.vx *= 0.99;
            this.ball.vy *= 0.99;

            // Vibración en postes
            if ((this.ball.x < 205 || this.ball.x > 595) && this.ball.y < 200 && this.ball.y > 50) {
                 this.ball.vx *= -0.7;
                 if (navigator.vibrate) navigator.vibrate(100);
            }

            if (this.collision(this.ball, this.goalkeeper)) {
                this.result(false);
            }

            // GOL
            if (this.ball.y < 150 && this.ball.y > 50) {
                if (this.ball.x > 210 && this.ball.x < 590) {
                    this.result(true);
                }
            }

            if (this.ball.y < 0 || this.ball.y > this.canvas.height) {
                this.result(false);
            }
        }

        if (this.goalkeeper.diving) {
            this.goalkeeper.x += this.goalkeeper.vx;
            if (this.goalkeeper.x < 150) this.goalkeeper.x = 150;
            if (this.goalkeeper.x > 560) this.goalkeeper.x = 560;
        }
    }

    collision(ball, keeper) {
        return (
            ball.x + ball.radius > keeper.x + 15 &&
            ball.x - ball.radius < keeper.x + keeper.width - 15 &&
            ball.y + ball.radius > keeper.y + 15 &&
            ball.y - ball.radius < keeper.y + keeper.height - 15
        );
    }

    result(scored) {
        if (!this.ball.inMotion) return;
        this.ball.inMotion = false;
        this.goalkeeper.diving = false;
        this.attempts--;

        // ✨ 6. FEEDBACK VISUAL (Efecto de impacto)
        this.canvas.style.transform = "scale(1.03)";
        setTimeout(() => this.canvas.style.transform = "scale(1)", 150);

        if (scored) {
            this.goals++;
            this.state = "celebracion";
            
            // 🎙️ ¡Cántalo!
            goalSound.currentTime = 0; 
            goalSound.play().catch(() => {});

            // 💖 MENSAJE ROMÁNTICO ALEATORIO
            if (this.goals < 3) {
                showLoveMessage(loveMessages[Math.floor(Math.random() * loveMessages.length)]);
            }

            if (this.goals >= 3) {
                // 💣 DETALLE ÚNICO FINAL
                showLoveMessage("Ganaste… pero yo ya era tuyo 💛");
                
                setTimeout(() => {
                    winSound.play().catch(() => {});
                    cancelAnimationFrame(this.animationId);
                    desbloquearRecuerdoEspecial();
                }, 3000);
                return;
            }
        } else {
            this.state = "resultado";
            if (navigator.vibrate) navigator.vibrate([50, 50, 50]);
        }

        this.updateHUD();
        
        if (this.attempts > 0) {
            setTimeout(() => this.resetPosition(), 1200);
        } else {
            this.state = "fin";
        }
    }

    resetPosition() {
        this.ball.x = this.canvas.width/2;
        this.ball.y = this.canvas.height-50;
        this.ball.vx = 0;
        this.ball.vy = 0;
        this.goalkeeper.x = this.canvas.width/2 - 45;
        this.state = "apuntado";
    }

    updateHUD() {
        const goalsEl = document.getElementById("goals");
        const attemptsEl = document.getElementById("attempts");
        if(goalsEl) goalsEl.textContent = "Goles: " + this.goals;
        if(attemptsEl) attemptsEl.textContent = "Intentos: " + this.attempts;
    }

    draw() {
        this.ctx.clearRect(0,0,this.canvas.width,this.canvas.height);

        // 🌿 PASTO
        this.ctx.fillStyle = "#2e7d32";
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        this.ctx.strokeStyle = "rgba(255,255,255,0.15)";
        this.ctx.lineWidth = 2;
        for(let i=0; i < this.canvas.height; i += 60) {
            this.ctx.strokeRect(0, i, this.canvas.width, 30);
        }

        // 🥅 EL ARCO
        this.ctx.strokeStyle = "#ffffff";
        this.ctx.lineWidth = 8;
        this.ctx.strokeRect(200, 50, 400, 150); 
        
        // 🧤 PORTERO (FOTO)
        if(imgPortero.complete && imgPortero.naturalWidth !== 0) {
            this.ctx.drawImage(imgPortero, this.goalkeeper.x, this.goalkeeper.y, this.goalkeeper.width, this.goalkeeper.height);
        } else {
            this.ctx.font = "60px serif";
            this.ctx.textAlign = "center";
            this.ctx.fillText("🧤", this.goalkeeper.x + this.goalkeeper.width/2, this.goalkeeper.y + 60);
        }

        // ⚽ BALÓN
        this.ctx.font = "40px serif";
        this.ctx.textAlign = "center";
        this.ctx.fillText("⚽", this.ball.x, this.ball.y + 15);

        // Feedback si pierde
        if (this.state === "fin" && this.goals < 3) {
            this.ctx.fillStyle = "rgba(0,0,0,0.8)";
            this.ctx.fillRect(0,0,this.canvas.width, this.canvas.height);
            this.ctx.fillStyle = "#fff";
            this.ctx.font = "bold 40px Poppins";
            this.ctx.fillText("¡Casi!", this.canvas.width/2, this.canvas.height/2);
            this.ctx.font = "20px Poppins";
            this.ctx.fillText(`Te faltaron ${3 - this.goals} goles. ¡Inténtalo de nuevo!`, this.canvas.width/2, this.canvas.height/2 + 50);
        }
    }

    loop() {
        this.update();
        this.draw();
        this.animationId = requestAnimationFrame(this.loop);
    }
}

// ==========================================================
// 💛
// ==========================================================
function desbloquearRecuerdoEspecial() {
    const finalScreen = document.getElementById("finalScreen");
    const finalText = document.getElementById("finalText");

    if (!finalScreen || !finalText) {
        // Fallback por si no existen los IDs en el HTML aún
        alert("¡Ganaste mi corazón! 😍");
        return;
    }

    finalText.textContent = "No solo ganaste el juego… ganaste mi corazón para siempre 💛";
    finalScreen.classList.add("show");
}

// Iniciar
const fCanvas = document.getElementById("futbolCanvas");
if (fCanvas) new PenaltyGame("futbolCanvas");