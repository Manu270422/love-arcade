// ==========================================================
// 🧩 PUZZLE LOVE: 💛
// ==========================================================

const board = document.getElementById("puzzle-board");
const statusElement = document.getElementById("puzzle-status");
const messageEl = document.getElementById("puzzleMessage");
const finalScreen = document.getElementById("puzzleFinal");
const finalText = document.getElementById("puzzleFinalText");

// Configuración de audio
const sound = new Audio('games/puzzle/assets/music/snap.mp3');
const winSound = new Audio('games/puzzle/assets/music/win.mp3');
sound.volume = 0.5;

const gridSize = 3;
let pieces = [];
let completed = 0;
let pieceSize;

// 💬 Mensajes románticos dinámicos que aparecen al encajar piezas
const loveMessages = [
    "¡Vas muy bien, mi amor! 😍",
    "Cada pieza eres tú en mi vida 💛",
    "Me haces tan feliz 🥺",
    "Estamos armando algo hermoso juntos 🧩",
    "¡Eres perfecta para mí! 💖",
    "¡Casi lo tienes, reina! ✨"
];

// ==========================================================
// 🧠 INICIALIZACIÓN
// ==========================================================

function initPuzzle() {
    // Calculamos el tamaño basado en el ancho actual del tablero (Responsive)
    pieceSize = board.offsetWidth / gridSize;

    pieces = [];
    board.innerHTML = "";
    completed = 0;

    statusElement.textContent = "Arma nuestra historia pieza a pieza… 💛";

    const imgPath = 'games/puzzle/assets/img/nuestra_foto.jpg';

    // Preparar el tablero (Fondo tenue)
    board.style.backgroundImage = `url('${imgPath}')`;
    board.style.backgroundSize = "cover";
    board.style.backgroundPosition = "center";
    board.style.opacity = "0.3";

    for (let r = 0; r < gridSize; r++) {
        for (let c = 0; c < gridSize; c++) {
            const piece = document.createElement("div");
            piece.classList.add("puzzle-piece");

            piece.style.width = `${pieceSize}px`;
            piece.style.height = `${pieceSize}px`;

            // Recorte de la imagen para cada pieza
            piece.style.backgroundImage = `url('${imgPath}')`;
            piece.style.backgroundSize = `${board.offsetWidth}px ${board.offsetHeight}px`;
            piece.style.backgroundPosition = `-${c * pieceSize}px -${r * pieceSize}px`;

            // Dataset para validación magnética
            piece.dataset.correctX = (c * pieceSize).toString();
            piece.dataset.correctY = (r * pieceSize).toString();

            // Posición inicial aleatoria (Desordenado)
            piece.style.left = `${Math.random() * (board.offsetWidth - pieceSize)}px`;
            piece.style.top = `${Math.random() * (board.offsetHeight - pieceSize)}px`;

            board.appendChild(piece);
            pieces.push(piece);

            addDragEvents(piece);
        }
    }
}

// ==========================================================
// 🎮 SISTEMA DE ARRASTRE (POINTER EVENTS)
// ==========================================================

function addDragEvents(piece) {
    let offsetX, offsetY;

    piece.addEventListener("pointerdown", e => {
        if (piece.classList.contains("correct")) return;

        piece.setPointerCapture(e.pointerId);

        // Calcular offset exacto para que la pieza no "salte" al tocarla
        const rect = piece.getBoundingClientRect();
        offsetX = e.clientX - rect.left;
        offsetY = e.clientY - rect.top;

        piece.style.zIndex = "1000";
        piece.style.transform = "scale(1.05)";
    });

    piece.addEventListener("pointermove", e => {
        if (!piece.hasPointerCapture(e.pointerId)) return;

        const rect = board.getBoundingClientRect();

        let x = e.clientX - rect.left - offsetX;
        let y = e.clientY - rect.top - offsetY;

        // 🔒 Límites: No permitir que la pieza salga del tablero
        x = Math.max(0, Math.min(x, board.offsetWidth - pieceSize));
        y = Math.max(0, Math.min(y, board.offsetHeight - pieceSize));

        piece.style.left = `${x}px`;
        piece.style.top = `${y}px`;
    });

    piece.addEventListener("pointerup", e => {
        piece.releasePointerCapture(e.pointerId);
        piece.style.transform = "scale(1)";
        piece.style.zIndex = "10";
        snapPiece(piece);
    });
}

// ==========================================================
// 🧲 SISTEMA MAGNÉTICO (SNAP)
// ==========================================================

function snapPiece(piece) {
    const x = parseFloat(piece.style.left);
    const y = parseFloat(piece.style.top);
    const correctX = parseFloat(piece.dataset.correctX);
    const correctY = parseFloat(piece.dataset.correctY);

    const distance = Math.hypot(x - correctX, y - correctY);

    // Si está a menos de 30px, encaja automáticamente
    if (distance < 30) {
        piece.style.left = `${correctX}px`;
        piece.style.top = `${correctY}px`;

        piece.classList.add("correct");
        piece.style.pointerEvents = "none";
        piece.style.zIndex = "1";

        // Sonido satisfactorio
        sound.currentTime = 0;
        sound.play().catch(() => {});

        completed++;

        // Mostrar mensaje aleatorio
        showMessage(loveMessages[Math.floor(Math.random() * loveMessages.length)]);
        updateProgress();

        if (completed === gridSize * gridSize) {
            victory();
        }
    }
}

// ==========================================================
// 💬 GESTIÓN DE MENSAJES
// ==========================================================

function showMessage(text) {
    if (!messageEl) return;

    messageEl.textContent = text;
    messageEl.classList.add("show");

    // Limpiar mensaje anterior si existe
    if (window.msgTimeout) clearTimeout(window.msgTimeout);

    window.msgTimeout = setTimeout(() => {
        messageEl.classList.remove("show");
    }, 2000);
}

function updateProgress() {
    const total = gridSize * gridSize;
    statusElement.textContent = `Progreso: ${completed}/${total} 💛`;
}

// ==========================================================
// 🏆 VICTORIA PRO (EFECTO FINAL)
// ==========================================================

function victory() {
    statusElement.textContent = "Lo lograste… como lograste enamorarme 💛";

    // 🚀 MEJORA: Ocultar botón de navegación general
    const backBtn = document.querySelector('.btn-back-home');
    if (backBtn) {
        backBtn.style.opacity = '0';
        setTimeout(() => backBtn.style.display = 'none', 500);
    }

    // Efecto visual de fusión de la foto
    board.classList.add("completed");
    board.style.opacity = "1";

    pieces.forEach(p => {
        p.style.borderRadius = "0";
        p.style.border = "none";
        p.style.boxShadow = "none";
        p.style.transition = "all 0.8s ease";
    });

    // Sonido de victoria
    winSound.play().catch(() => {});

    setTimeout(() => {
        showFinalScreen();
    }, 1500);
}

// ==========================================================
// 💛 PANTALLA FINAL
// ==========================================================

function showFinalScreen() {
    if (!finalScreen || !finalText) return;

    finalText.textContent = "Así como armaste este rompecabezas… quiero construir toda una vida contigo. Eres mi pieza favorita. 💛";

    finalScreen.classList.add("show");
}

// ==========================================================
// 🚀 INICIO DE EJECUCIÓN
// ==========================================================

if (document.readyState === "complete" || document.readyState === "interactive") {
    initPuzzle();
} else {
    window.addEventListener("DOMContentLoaded", initPuzzle);
}