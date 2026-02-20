/* =========================================
   VARIABLES GLOBALES EXISTENTES (Mantener)
   ========================================= */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

// Variables de Serenito (Mantenemos tu lógica actual)
let serenito = { x: 100, y: 300, velocidad: 5, ancho: 40, alto: 60 };

/* =========================================
   NUEVAS VARIABLES: SISTEMA DE MINIJUEGOS
   ========================================= */
let enMinijuego = false; // "Interruptor" maestro

// Zona de Activación (La esquina tipo Mario Party)
// Digamos que está en la esquina inferior derecha cerca de la Muni
const zonaPong = { x: canvas.width - 150, y: canvas.height - 150, ancho: 100, alto: 100 };

/* =========================================
   LÓGICA DEL BUCLE PRINCIPAL (Game Loop)
   ========================================= */
function gameLoop() {
    if (!enMinijuego) {
        // 1. Limpiar pantalla principal
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // 2. Dibujar Fondo, Suelo y la Municipalidad (CON LA ROTACIÓN QUE HICIMOS)
        dibujarEscenario(); 

        // 3. Mover y Dibujar a Serenito
        moverSerenito(); // Tu función de movimiento existente
        dibujarSerenito(); // Tu función de dibujo existente

        // 4. NUEVO: Dibujar la zona del minijuego (para saber dónde pisar)
        dibujarZonaActivacion();

        // 5. NUEVO: Verificar si Serenito pisó la zona
        verificarEntradaMinijuego();

        requestAnimationFrame(gameLoop);
    } else {
        // Si estamos en minijuego, el loop principal se "congela" visualmente
        // y el loop del Pong toma el control dentro del canvas pequeño.
    }
}

/* =========================================
   NUEVAS FUNCIONES PARA INTEGRAR
   ========================================= */

function dibujarZonaActivacion() {
    // Dibujamos un cuadrado brillante en el suelo
    ctx.fillStyle = "rgba(255, 215, 0, 0.5)"; // Dorado semitransparente
    ctx.fillRect(zonaPong.x, zonaPong.y, zonaPong.ancho, zonaPong.alto);
    
    // Texto flotante
    ctx.fillStyle = "white";
    ctx.font = "14px Arial";
    ctx.fillText("Zona de Juegos", zonaPong.x + 5, zonaPong.y - 10);
}

function verificarEntradaMinijuego() {
    // Detección de colisión simple (Rectángulo contra Rectángulo)
    if (serenito.x < zonaPong.x + zonaPong.ancho &&
        serenito.x + serenito.ancho > zonaPong.x &&
        serenito.y < zonaPong.y + zonaPong.alto &&
        serenito.y + serenito.alto > zonaPong.y) {
        
        activarMinijuego();
    }
}

function activarMinijuego() {
    enMinijuego = true;
    document.getElementById('minigame-overlay').style.display = 'block';
    
    // Iniciar el loop del Pong (función definida abajo)
    iniciarPong();
    
    // Opcional: Mover a Serenito un poco atrás para que no reactive el juego al salir
    serenito.x -= 50; 
    serenito.y -= 50;
}

function cerrarMinijuego() {
    enMinijuego = false;
    document.getElementById('minigame-overlay').style.display = 'none';
    detenerPong(); // Detener el loop del pong para ahorrar recursos
    gameLoop(); // Reactivar el loop principal
}

/* =========================================
   LÓGICA DEL MINIJUEGO PONG (Módulo Aislado)
   ========================================= */
let pongLoopId;
const pCanvas = document.getElementById('pongCanvas');
const pCtx = pCanvas.getContext('2d');

// Variables del Pong
let pelota = { x: 250, y: 150, dx: 4, dy: 4, radio: 10 };
let paleta = { x: 200, y: 280, ancho: 100, alto: 10 };

function iniciarPong() {
    actualizarPong();
}

function detenerPong() {
    cancelAnimationFrame(pongLoopId);
}

// Control del mouse para el Pong
pCanvas.addEventListener('mousemove', function(evt) {
    let rect = pCanvas.getBoundingClientRect();
    let mouseX = evt.clientX - rect.left;
    paleta.x = mouseX - paleta.ancho / 2;
});

function actualizarPong() {
    if (!enMinijuego) return;

    // 1. Limpiar canvas del Pong
    pCtx.fillStyle = 'black';
    pCtx.fillRect(0, 0, pCanvas.width, pCanvas.height);

    // 2. Dibujar Pelota
    pCtx.beginPath();
    pCtx.arc(pelota.x, pelota.y, pelota.radio, 0, Math.PI*2);
    pCtx.fillStyle = 'white';
    pCtx.fill();
    pCtx.closePath();

    // 3. Dibujar Paleta
    pCtx.fillStyle = '#00FF00'; // Verde retro
    pCtx.fillRect(paleta.x, paleta.y, paleta.ancho, paleta.alto);

    // 4. Mover Pelota
    pelota.x += pelota.dx;
    pelota.y += pelota.dy;

    // Rebote Paredes Laterales
    if (pelota.x + pelota.radio > pCanvas.width || pelota.x - pelota.radio < 0) {
        pelota.dx = -pelota.dx;
    }

    // Rebote Techo
    if (pelota.y - pelota.radio < 0) {
        pelota.dy = -pelota.dy;
    }

    // Rebote Paleta
    if (pelota.y + pelota.radio > paleta.y &&
        pelota.x > paleta.x &&
        pelota.x < paleta.x + paleta.ancho) {
        pelota.dy = -pelota.dy;
    }

    // Perder (Suelo) -> Reiniciar pelota
    if (pelota.y - pelota.radio > pCanvas.height) {
        pelota.x = pCanvas.width / 2;
        pelota.y = pCanvas.height / 2;
        // Aquí podrías restar vidas
    }

    pongLoopId = requestAnimationFrame(actualizarPong);
}

// INICIAR EL JUEGO AL CARGAR
gameLoop();
