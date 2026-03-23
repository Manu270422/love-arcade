// ==========================================================
// 🎵 CONFIGURACIÓN DE AUDIO MATCH-3
// ==========================================================
const match3Music = new Audio('games/match3/musica-match3.mp3');
match3Music.loop = true;
match3Music.volume = 0.4;

const boardSize = 6;
const boardElement = document.getElementById("match3-board");
const scoreElement = document.getElementById("match3-score");

let score = 0;
let board = [];
let firstSelection = null;
let isProcessing = false; // Bloquea clics mientras caen piezas

// 🖼️ Nuestras fotos (Rutas absolutas)
const images = [
    'games/match3/foto1.png',
    'games/match3/foto2.png',
    'games/match3/foto3.png',
    'games/match3/foto4.png',
    'games/match3/foto5.png'
];

// ==========================================================
// 🎮 INICIALIZACIÓN DEL JUEGO
// ==========================================================

function initBoard() {
    // 🎶 Intentar iniciar música (requiere una interacción previa en la web)
    match3Music.play().catch(e => console.log("Esperando interacción para sonar música de fondo:", e));

    score = 0;
    updateHUD();
    board = [];
    boardElement.innerHTML = "";
    
    for (let r = 0; r < boardSize; r++) {
        board[r] = [];
        for (let c = 0; c < boardSize; c++) {
            let randomImg;
            // Evitar que el tablero empiece con matches automáticos
            do {
                randomImg = images[Math.floor(Math.random() * images.length)];
            } while (
                (c >= 2 && board[r][c-1] === randomImg && board[r][c-2] === randomImg) ||
                (r >= 2 && board[r-1][c] === randomImg && board[r-2][c] === randomImg)
            );
            
            board[r][c] = randomImg;
            const cell = document.createElement("div");
            cell.classList.add("match3-cell");
            cell.id = `cell-${r}-${c}`;
            cell.dataset.row = r;
            cell.dataset.col = c;
            
            const imgHtml = document.createElement("img");
            imgHtml.src = randomImg;
            cell.appendChild(imgHtml);
            
            cell.addEventListener("click", () => handleCellClick(r, c));
            boardElement.appendChild(cell);
        }
    }
}

// ==========================================================
// 🕹️ LÓGICA DE INTERACCIÓN
// ==========================================================

async function handleCellClick(r, c) {
    if (isProcessing) return;

    // Si la música no ha empezado por bloqueo del navegador, la activamos al primer clic
    if (match3Music.paused) match3Music.play().catch(() => {});

    const currentCell = document.getElementById(`cell-${r}-${c}`);

    if (!firstSelection) {
        firstSelection = { r, c };
        currentCell.classList.add("selected");
    } else {
        const r1 = firstSelection.r;
        const c1 = firstSelection.c;
        const r2 = r;
        const c2 = c;

        // Quitar selección visual
        document.getElementById(`cell-${r1}-${c1}`).classList.remove("selected");

        // Verificar si son adyacentes
        const isAdjacent = Math.abs(r1 - r2) + Math.abs(c1 - c2) === 1;

        if (isAdjacent) {
            isProcessing = true;
            await swapPieces(r1, c1, r2, c2);
            
            if (!checkAndRemoveMatches()) {
                // Si no hay match, regresan a su sitio (Animación de error)
                await new Promise(res => setTimeout(res, 300));
                await swapPieces(r1, c1, r2, c2);
            } else {
                // Si hay match, procesar cascada de piezas
                await processBoard();
            }
            isProcessing = false;
        }
        firstSelection = null;
    }
}

async function swapPieces(r1, c1, r2, c2) {
    const temp = board[r1][c1];
    board[r1][c1] = board[r2][c2];
    board[r2][c2] = temp;
    
    renderCell(r1, c1);
    renderCell(r2, c2);
}

function renderCell(r, c) {
    const cell = document.getElementById(`cell-${r}-${c}`);
    if (cell && board[r][c]) {
        cell.querySelector("img").src = board[r][c];
        cell.style.opacity = "1";
    } else if (cell) {
        cell.style.opacity = "0"; // Celda vacía temporalmente
    }
}

// ==========================================================
// ✨ SISTEMA DE MATCH Y CASCADA
// ==========================================================

function checkAndRemoveMatches() {
    let toRemove = new Set();

    // Horizontal
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize - 2; c++) {
            if (board[r][c] && board[r][c] === board[r][c+1] && board[r][c] === board[r][c+2]) {
                toRemove.add(`${r},${c}`); 
                toRemove.add(`${r},${c+1}`); 
                toRemove.add(`${r},${c+2}`);
            }
        }
    }

    // Vertical
    for (let c = 0; c < boardSize; c++) {
        for (let r = 0; r < boardSize - 2; r++) {
            if (board[r][c] && board[r][c] === board[r+1][c] && board[r][c] === board[r+2][c]) {
                toRemove.add(`${r},${c}`); 
                toRemove.add(`${r+1},${c}`); 
                toRemove.add(`${r+2},${c}`);
            }
        }
    }

    if (toRemove.size > 0) {
        toRemove.forEach(pos => {
            const [r, c] = pos.split(',').map(Number);
            board[r][c] = null;
            const cell = document.getElementById(`cell-${r}-${c}`);
            if (cell) cell.classList.add("match-pop");
        });
        
        score += toRemove.size * 10;
        updateHUD();
        
        if (score >= 300) {
            setTimeout(endGame, 500); // Pequeña espera para ver el último match
            return true;
        }
        return true;
    }
    return false;
}

async function processBoard() {
    await new Promise(res => setTimeout(res, 400));
    
    // 1. Caída de piezas existentes
    for (let c = 0; c < boardSize; c++) {
        let emptySpaces = 0;
        for (let r = boardSize - 1; r >= 0; r--) {
            if (board[r][c] === null) {
                emptySpaces++;
            } else if (emptySpaces > 0) {
                board[r + emptySpaces][c] = board[r][c];
                board[r][c] = null;
            }
        }
        // 2. Generar nuevas piezas en la parte superior
        for (let r = 0; r < emptySpaces; r++) {
            board[r][c] = images[Math.floor(Math.random() * images.length)];
        }
    }
    
    // Limpiar clases de animación y renderizar tablero actualizado
    const cells = document.querySelectorAll(".match3-cell");
    cells.forEach(cell => cell.classList.remove("match-pop"));
    
    for (let r = 0; r < boardSize; r++) {
        for (let c = 0; c < boardSize; c++) renderCell(r, c);
    }

    // 3. Verificar si la caída generó nuevos combos (recursivo)
    if (checkAndRemoveMatches()) {
        await processBoard();
    }
}

// ==========================================================
// 🏆 FINALIZACIÓN Y HUD
// ==========================================================

function updateHUD() {
    if (scoreElement) scoreElement.textContent = `Puntos: ${score} / 300`;
}

function endGame() {
    // 🎶 Cambio de ambiente musical
    match3Music.pause(); 
    match3Music.currentTime = 0; // Reiniciar por si acaso

    const victorySound = new Audio('/games/match3/victoria.mp3');
    victorySound.volume = 0.6;
    victorySound.play().catch(e => console.log("Error al reproducir sonido de victoria:", e));
    
    desbloquearMensajeEspecial();
}

function desbloquearMensajeEspecial() {
    const container = document.getElementById('match3-game');
    if (!container) return;

    container.innerHTML = `
        <div class="victory-card" style="text-align:center; animation: fadeIn 1.5s; color:white; padding: 20px;">
            <h2 style="color: #ffd700; font-size: 2.2rem; text-shadow: 0 0 10px rgba(255,215,0,0.5);">¡Eres una experta! 🏆</h2>
            <p style="font-size: 1.1rem;">Has completado el tablero de nuestros recuerdos.</p>
            <div style="background: rgba(255,255,255,0.1); padding: 25px; border-radius: 20px; margin: 25px 0; border: 1px solid rgba(255,215,0,0.3);">
                <p style="font-size: 1.5rem; font-style: italic; font-family: 'Pacifico', cursive;">"Cada pieza de mi vida encaja perfecto desde que estás tú."</p>
            </div>
            <button onclick="location.reload()" style="padding:15px 40px; background:linear-gradient(45deg, #ffd700, #ffcc00); border:none; border-radius:30px; font-weight:bold; cursor:pointer; color:black; font-size:1.1rem; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">Volver a jugar</button>
        </div>
    `;
}

// Iniciar tablero por primera vez
initBoard();