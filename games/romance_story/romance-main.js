// ==========================================================
// 🎵 CONFIGURACIÓN DE AUDIO NOVELA VISUAL
// ==========================================
const romanceMusic = new Audio('games/romance_story/assets/music/historia-amor.mp3');
romanceMusic.loop = true;
romanceMusic.volume = 0.5;

// ==========================================================
// 📝 CONFIGURACIÓN DE ELEMENTOS Y ESCENAS
// ==========================================================
const textElement = document.getElementById("romance-text");
const optionsElement = document.getElementById("romance-options");
const backgroundElement = document.getElementById("romance-background");

const scenes = {
    start: {
        text: "Es una tarde tranquila... el sol se oculta y piensas en todo lo que hemos vivido juntos.",
        background: "games/romance_story/assets/img/atardecer.jpg",
        options: [
            { text: "Recordar el primer encuentro", next: "encuentro" },
            { text: "Pensar en el futuro juntos", next: "futuro" }
        ]
    },
    encuentro: {
        text: "Recuerdas aquel día en que nuestras miradas se cruzaron por primera vez. El mundo se detuvo.",
        background: "games/romance_story/assets/img/primer_encuentro.jpg",
        options: [
            { text: "Sonreír al recuerdo", next: "recuerdoEspecial1" },
            { text: "Volver al presente", next: "start" }
        ]
    },
    futuro: {
        text: "Imaginemos un futuro lleno de viajes, risas y momentos inolvidables. El corazón late más fuerte.",
        background: "games/romance_story/assets/img/futuro.jpg",
        options: [
            { text: "Prometer estar siempre juntos", next: "recuerdoEspecial2" },
            { text: "Volver al presente", next: "start" }
        ]
    },
    recuerdoEspecial1: {
        text: "Este recuerdo desbloquea una foto especial que guardé solo para ti. ¡Eres lo mejor que me ha pasado!",
        background: "games/romance_story/assets/img/recuerdo1.jpg",
        options: [] 
    },
    recuerdoEspecial2: {
        text: "Tu promesa desbloquea un video único que simboliza nuestra historia de amor. Gracias por soñar conmigo.",
        background: "games/romance_story/assets/img/recuerdo2.jpg",
        options: [] 
    }
};

// ==========================================================
// ⚙️ MOTOR DE JUEGO (CORREGIDO Y REFORZADO)
// ==========================================================

let typingInterval; 

function showScene(sceneKey) {
    const scene = scenes[sceneKey];
    if (!scene) return;

    // 🔥 FIX: Forzamos la carga de música tras la interacción
    if (romanceMusic.paused) {
        romanceMusic.play().catch(e => console.log("Esperando clic para audio..."));
    }

    // 🖼️ FIX MAESTRO: URL limpia con comillas para evitar errores de ruta
    backgroundElement.style.backgroundImage = `url('${scene.background}')`;

    optionsElement.innerHTML = "";

    typeWriter(scene.text, () => {
        // Mostrar opciones solo si la escena las tiene
        if (scene.options && scene.options.length > 0) {
            scene.options.forEach(option => {
                const btn = document.createElement("button");
                btn.textContent = option.text;
                btn.onclick = () => showScene(option.next);
                optionsElement.appendChild(btn);
            });
        }

        // Si es un final/recuerdo especial, activar el overlay
        if (sceneKey.startsWith("recuerdoEspecial")) {
            setTimeout(() => {
                desbloquearRecuerdoEspecial(sceneKey);
            }, 1200); // Pausa dramática para lectura
        }
    });
}

function typeWriter(text, callback) {
    let i = 0;
    textElement.textContent = "";
    clearInterval(typingInterval);

    typingInterval = setInterval(() => {
        textElement.textContent += text.charAt(i);
        i++;
        if (i >= text.length) {
            clearInterval(typingInterval);
            if (callback) callback();
        }
    }, 45);
}

// ==========================================================
// 🏆 SISTEMA DE RECOMPENSAS: LA CARTA DE AMOR
// ==========================================================

function desbloquearRecuerdoEspecial(key) {
    const gameContainer = document.getElementById('romance-game');
    if (!gameContainer) return;
    
    const overlay = document.createElement('div');
    overlay.className = 'special-overlay';
    
    const heart = document.createElement('i');
    heart.className = 'fas fa-heart floating-heart';
    heart.style.cursor = 'pointer';
    overlay.appendChild(heart);
    
    const cartaContenido = {
        'recuerdoEspecial1': {
            titulo: "Mi primer pensamiento...",
            mensaje: "Desde aquel día en que nuestras miradas se cruzaron, supe que mi vida no volvería a ser la misma. Gracias por ser mi aventura favorita. Te amo con todo mi corazón."
        },
        'recuerdoEspecial2': {
            titulo: "Nuestra Promesa",
            mensaje: "No importa hacia dónde nos lleve el futuro, mi única certeza es que quiero ir de tu mano. Eres mi hogar, mi paz y mi mayor alegría. ¡Por mil años más juntos!"
        }
    };

    const data = cartaContenido[key] || cartaContenido['recuerdoEspecial1'];

    heart.onclick = () => {
        // Efecto de explosión del corazón
        heart.style.transition = "transform 0.5s ease, opacity 0.5s ease";
        heart.style.transform = "scale(8)";
        heart.style.opacity = "0";
        
        setTimeout(() => {
            heart.style.display = 'none';
            
            const letter = document.createElement('div');
            letter.className = 'love-letter';
            letter.innerHTML = `
                <h2 style="color: #ff4d6d; margin-bottom: 15px; font-family: 'Pacifico', cursive;">${data.titulo}</h2>
                <p style="color: #444; line-height: 1.6; font-size: 1.1rem; font-style: italic;">${data.mensaje}</p>
                <button onclick="location.reload()" style="margin-top:20px; padding:12px 25px; background:linear-gradient(45deg, #ff4d6d, #ff85a2); color:white; border:none; border-radius:25px; cursor:pointer; width:100%; font-weight:bold; box-shadow: 0 4px 10px rgba(255, 77, 109, 0.3);">
                    Volver al Menú ❤️
                </button>
            `;
            overlay.appendChild(letter);
        }, 500);
    };

    gameContainer.appendChild(overlay);
}

// Iniciar el motor
showScene("start");