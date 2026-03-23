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
// ⚙️ MOTOR DE JUEGO (OPTIMIZADO PARA MÓVIL)
// ==========================================================

let typingInterval; 

function showScene(sceneKey) {
    const scene = scenes[sceneKey];
    if (!scene) return;

    // 🔥 Inicio de música por interacción
    if (romanceMusic.paused) {
        romanceMusic.play().catch(e => console.log("Esperando clic para audio..."));
    }

    // 🖼️ AJUSTE DE SEGURIDAD: Imagen perfecta en cualquier pantalla
    backgroundElement.style.backgroundImage = `url('${scene.background}')`;
    backgroundElement.style.backgroundSize = "cover";             // ✅ Llena la pantalla
    backgroundElement.style.backgroundPosition = "center center"; // ✅ Centra la acción
    backgroundElement.style.backgroundRepeat = "no-repeat";

    optionsElement.innerHTML = "";

    typeWriter(scene.text, () => {
        // Mostrar opciones con diseño amigable para pulgares
        if (scene.options && scene.options.length > 0) {
            scene.options.forEach(option => {
                const btn = document.createElement("button");
                btn.textContent = option.text;
                // Estilo extra para asegurar que en móvil sean fáciles de tocar
                btn.style.width = "100%"; 
                btn.style.marginBottom = "10px";
                
                btn.onclick = () => showScene(option.next);
                optionsElement.appendChild(btn);
            });
        }

        // Si es un final/recuerdo especial, activar el overlay
        if (sceneKey.startsWith("recuerdoEspecial")) {
            setTimeout(() => {
                desbloquearRecuerdoEspecial(sceneKey);
            }, 1200);
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
// 🏆 SISTEMA DE RECOMPENSAS: INGENIERO ROMÁNTICO
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
    
    const cartas = {
        'recuerdoEspecial1': {
            titulo: "Mi primer pensamiento",
            mensaje: "Desde el momento en que entraste en mi vida, supe que quería coleccionar cada atardecer a tu lado. Gracias por ser mi lugar seguro. ❤️"
        },
        'recuerdoEspecial2': {
            titulo: "Nuestra Eterna Promesa",
            mensaje: "Prometo cuidarte, escucharte y amarte en cada fase de nuestra historia. Eres mi mayor tesoro y mi sueño hecho realidad. ¡Te amo! ♾️"
        }
    };

    const data = cartas[key] || cartas['recuerdoEspecial1'];

    heart.onclick = () => {
        heart.style.display = 'none';
        
        const letter = document.createElement('div');
        letter.className = 'love-letter';
        letter.innerHTML = `
            <h2 style="font-family: 'Pacifico', cursive;">${data.titulo}</h2>
            <p style="font-size: 1.1rem; line-height: 1.6;">${data.mensaje}</p>
            <button onclick="location.reload()" style="margin-top:25px; padding:15px 30px; background:#ff4d6d; color:white; border:none; border-radius:30px; cursor:pointer; font-weight:bold; font-family: 'Poppins'; width: 100%; box-shadow: 0 4px 15px rgba(255, 77, 109, 0.4);">
                Volver a nuestro mundo ❤️
            </button>
        `;
        overlay.appendChild(letter);
    };

    gameContainer.appendChild(overlay);
}

// Iniciar el motor
showScene("start");