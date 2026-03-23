// ==========================================================
// 🎵 CONFIGURACIÓN DE AUDIO NOVELA VISUAL
// ==========================================================
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
        text: "Es una tarde tranquila... el sol se oculta y piensas en todo lo que han vivido juntos.",
        background: "games/romance_story/assets/img/atardecer.jpg",
        options: [
            { text: "Recordar el primer encuentro", next: "encuentro" },
            { text: "Pensar en el futuro juntos", next: "futuro" }
        ]
    },
    encuentro: {
        text: "Recuerdas aquel día en que sus miradas se cruzaron por primera vez. El mundo se detuvo.",
        background: "games/romance_story/assets/img/primer_encuentro.jpg",
        options: [
            { text: "Sonreír al recuerdo", next: "recuerdoEspecial1" },
            { text: "Volver al presente", next: "start" }
        ]
    },
    futuro: {
        text: "Imaginan un futuro lleno de viajes, risas y momentos inolvidables. El corazón late más fuerte.",
        background: "games/romance_story/assets/img/futuro.jpg",
        options: [
            { text: "Prometer estar siempre juntos", next: "recuerdoEspecial2" },
            { text: "Volver al presente", next: "start" }
        ]
    },
    recuerdoEspecial1: {
        text: "Ese recuerdo desbloquea una foto especial que guardaste solo para ella. ¡Eres lo mejor que me ha pasado!",
        background: "games/romance_story/assets/img/recuerdo1.jpg",
        options: [] // Se dejan vacías porque el overlay tomará el control
    },
    recuerdoEspecial2: {
        text: "Tu promesa desbloquea un video único que simboliza su historia de amor. Gracias por soñar conmigo.",
        background: "games/romance_story/assets/img/recuerdo2.jpg",
        options: [] // Se dejan vacías porque el overlay tomará el control
    }
};

// ==========================================================
// ⚙️ MOTOR DE JUEGO
// ==========================================================

let typingInterval; 

function showScene(sceneKey) {
    const scene = scenes[sceneKey];
    if (!scene) return;

    if (romanceMusic.paused) {
        romanceMusic.play().catch(e => console.log("Audio esperando interacción..."));
    }

    backgroundElement.style.backgroundImage = `url(${scene.background})`;
    optionsElement.innerHTML = "";

    typeWriter(scene.text, () => {
        // Generar botones solo si existen opciones
        if (scene.options && scene.options.length > 0) {
            scene.options.forEach(option => {
                const btn = document.createElement("button");
                btn.textContent = option.text;
                btn.onclick = () => showScene(option.next);
                optionsElement.appendChild(btn);
            });
        }

        // Si es un recuerdo especial, disparamos la "Obra de Arte"
        if (sceneKey.startsWith("recuerdoEspecial")) {
            setTimeout(() => {
                desbloquearRecuerdoEspecial(sceneKey);
            }, 1000); // Pequeña pausa para que termine de leer el texto
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
    
    // 1. Creamos el overlay oscuro (Asegúrate de tener el CSS para .special-overlay)
    const overlay = document.createElement('div');
    overlay.className = 'special-overlay';
    
    // 2. Creamos el corazón gigante latiendo
    const heart = document.createElement('i');
    heart.className = 'fas fa-heart floating-heart';
    heart.style.cursor = 'pointer';
    overlay.appendChild(heart);
    
    // 3. Contenido de las cartas
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

    // 4. Interacción: Al hacer clic en el corazón, aparece la carta
    heart.onclick = () => {
        heart.style.transition = "transform 0.5s ease, opacity 0.5s ease";
        heart.style.transform = "scale(5)";
        heart.style.opacity = "0";
        
        setTimeout(() => {
            heart.style.display = 'none';
            
            const letter = document.createElement('div');
            letter.className = 'love-letter';
            letter.innerHTML = `
                <h2 style="color: #ff4d6d; margin-bottom: 15px; font-family: 'Pacifico', cursive;">${data.titulo}</h2>
                <p style="color: #444; line-height: 1.6; font-size: 1.1rem;">${data.mensaje}</p>
                <button onclick="location.reload()" style="margin-top:20px; padding:12px 25px; background:linear-gradient(45deg, #ff4d6d, #ff85a2); color:white; border:none; border-radius:25px; cursor:pointer; width:100%; font-weight:bold; box-shadow: 0 4px 10px rgba(255, 77, 109, 0.3);">
                    Volver al Menú ❤️
                </button>
            `;
            overlay.appendChild(letter);
        }, 500);
    };

    gameContainer.appendChild(overlay);
}

// Iniciar juego
showScene("start");