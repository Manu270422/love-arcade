/**
 * 🎮 Sistema de Navegación Dinámica Pro
 * Carga cualquier juego (Runner, Match-3, etc.) de forma modular.
 */

async function loadGame(game) {
    const container = document.getElementById('main-container');
    
    // 1. Pantalla de carga estética
    container.innerHTML = `
        <div class="loading-screen" style="text-align:center; padding: 100px; color: white;">
            <i class="fas fa-heart fa-beat" style="font-size: 4rem; color: #ffd700; filter: drop-shadow(0 0 10px #ffd700);"></i>
            <p style="margin-top: 25px; font-family: 'Poppins', sans-serif; font-size: 1.2rem; letter-spacing: 2px;">
                PREPARANDO NUESTRA AVENTURA...
            </p>
        </div>
    `;

    // Definimos las rutas según el juego
    const gamePaths = {
        'runner': {
            html: 'games/runner/runner-template.html',
            css: 'games/runner/runner-style.css',
            js: 'games/runner/runner-main.js',
            id: 'runner-style'
        },
        'match3': {
            html: 'games/match3/match3-template.html',
            css: 'games/match3/match3-style.css',
            js: 'games/match3/match3-main.js',
            id: 'match3-style'
        }
    };

    const selectedGame = gamePaths[game];

    if (selectedGame) {
        try {
            // 2. Fetch del HTML dinámico
            const response = await fetch(selectedGame.html);
            if (!response.ok) throw new Error(`No se encontró el archivo del juego: ${game}`);
            const html = await response.text();
            
            // Inyectamos el HTML
            container.innerHTML = html;

            // 3. Gestión del CSS Dinámico (Evita duplicados)
            const oldStyle = document.getElementById(selectedGame.id);
            if (oldStyle) oldStyle.remove();

            const link = document.createElement('link');
            link.id = selectedGame.id;
            link.rel = 'stylesheet';
            link.href = selectedGame.css;
            document.head.appendChild(link);

            // 4. Inyección del Script del Juego
            // Borramos scripts anteriores del mismo juego para evitar conflictos de variables
            const oldScript = document.querySelector(`script[src="${selectedGame.js}"]`);
            if (oldScript) oldScript.remove();

            const script = document.createElement('script');
            script.src = selectedGame.js;
            script.type = 'text/javascript';
            // Importante: No usar defer aquí para que cargue justo después del HTML
            document.body.appendChild(script);

            console.log(`🚀 Juego [${game.toUpperCase()}] cargado con éxito.`);

        } catch (error) {
            console.error("Error crítico de carga:", error);
            container.innerHTML = `
                <div style="text-align:center; padding: 80px; color: white; font-family: sans-serif;">
                    <i class="fas fa-exclamation-triangle" style="font-size: 3rem; color: #ff4d4d;"></i>
                    <h3 style="margin-top:20px;">¡Ups! No pudimos cargar esta parte de nuestra historia. ❤️</h3>
                    <button onclick="location.reload()" style="margin-top:25px; padding: 12px 25px; cursor:pointer; background:#ffd700; border:none; border-radius:20px; font-weight:bold;">
                        Volver al Inicio
                    </button>
                </div>
            `;
        }
    } else {
        // Fallback para juegos no implementados
        container.innerHTML = `
            <div style="text-align:center; padding: 100px; color: white;">
                <h2 style="font-family: 'Poppins';">El juego "${game}" está en el taller de Cupido... 🛠️</h2>
                <p>¡Pronto estará listo para ti!</p>
                <button onclick="location.reload()" style="margin-top:25px; padding: 10px 20px; border-radius: 20px; border:none; background: #ff4d6d; color:white; cursor:pointer;">
                    Volver al Menú
                </button>
            </div>
        `;
    }
}

/**
 * 🎵 Control de Audio Global
 */
let musicOn = false;
let globalBgMusic = new Audio('assets/music/ambient-love.mp3'); // Ruta de tu música de fondo del HUB
globalBgMusic.loop = true;

function toggleMusic() {
    musicOn = !musicOn;
    const icon = document.getElementById('music-icon');
    
    if(musicOn) {
        icon.className = 'fas fa-volume-up';
        globalBgMusic.play().catch(e => console.log("Error al reproducir música:", e));
        console.log("🎵 Música del Hub: ON");
    } else {
        icon.className = 'fas fa-music';
        globalBgMusic.pause();
        console.log("🎵 Música del Hub: OFF");
    }
}