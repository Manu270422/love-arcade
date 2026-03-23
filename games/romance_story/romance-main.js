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
    options: [
        { text: "Volver a empezar", next: "start" }
    ]
  },
  recuerdoEspecial2: {
    text: "Tu promesa desbloquea un video único que simboliza su historia de amor. Gracias por soñar conmigo.",
    background: "games/romance_story/assets/img/recuerdo2.jpg",
    options: [
        { text: "Volver a empezar", next: "start" }
    ]
  }
};

// ==========================================================
// ⚙️ MOTOR DE JUEGO (Actualizado con Audio)
// ==========================================================

let typingInterval; // Variable para controlar el intervalo y evitar bugs de superposición

function showScene(sceneKey) {
  const scene = scenes[sceneKey];
  if (!scene) return;

  // ✨ TRUCO: Iniciar música al primer clic/interacción
  if (romanceMusic.paused) {
    romanceMusic.play().catch(e => console.log("Esperando interacción para audio de novela:", e));
  }

  // Cambio de fondo con transición (definida en el CSS)
  backgroundElement.style.backgroundImage = `url(${scene.background})`;

  // Limpiar opciones antes de escribir
  optionsElement.innerHTML = "";

  // Ejecutar efecto máquina de escribir
  typeWriter(scene.text, () => {
    // Al terminar de escribir, mostrar opciones
    scene.options.forEach(option => {
      const btn = document.createElement("button");
      btn.textContent = option.text;
      btn.onclick = () => {
        // Sonido de clic opcional aquí si quieres
        showScene(option.next);
      };
      optionsElement.appendChild(btn);
    });

    // Si es un recuerdo especial, ejecutar lógica extra
    if (sceneKey.startsWith("recuerdoEspecial")) {
      desbloquearRecuerdoEspecial(sceneKey);
    }
  });
}

// Efecto máquina de escribir mejorado
function typeWriter(text, callback) {
  let i = 0;
  textElement.textContent = "";
  
  // Limpiar cualquier intervalo previo si el usuario hace clic rápido
  clearInterval(typingInterval);

  typingInterval = setInterval(() => {
    textElement.textContent += text.charAt(i);
    i++;
    if (i >= text.length) {
      clearInterval(typingInterval);
      if (callback) callback();
    }
  }, 45); // Velocidad de lectura cómoda
}

// ==========================================================
// 🏆 SISTEMA DE RECOMPENSAS
// ==========================================================

function desbloquearRecuerdoEspecial(key) {
  console.log("💖 Recuerdo especial desbloqueado:", key);
  
  // Aquí puedes añadir un efecto de confeti o lanzar un modal con una foto real
  // Ejemplo: canvasConfetti(); (si usas una librería externa)
}

// Iniciar la historia
// Nota: Algunos navegadores bloquearán el audio hasta que ella haga el primer clic en el menú
showScene("start");