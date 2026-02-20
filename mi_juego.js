/* ==========================================
   CONFIGURACIÓN INICIAL
   ========================================== */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajuste automático al tamaño de pantalla
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize(); 

/* ==========================================
   VARIABLES (ESTADO DEL JUEGO)
   ========================================== */

// 1. Serenito (Nuestro Héroe)
const serenito = {
    x: 100,
    y: 0, // Se calcula con el suelo
    ancho: 50,
    alto: 80,
    velocidad: 6,
    color: 'salmon' // El color base que usábamos
};

// 2. La Municipalidad (Datos para la rotación)
const muni = {
    ancho: 200, 
    alto: 120,  
    color: '#DDDDDD' // Gris edificio
};

// Controles
const teclas = {};
window.addEventListener('keydown', e => teclas[e.key] = true);
window.addEventListener('keyup', e => teclas[e.key] = false);

/* ==========================================
   BUCLE PRINCIPAL (MOTOR)
   ========================================== */
function gameLoop() {
    // A. LIMPIEZA
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // B. VARIABLES DE ENTORNO
    const sueloY = canvas.height - 100; // Altura del suelo

    // C. LÓGICA DE SERENITO
    if (teclas['ArrowRight'] || teclas['d']) serenito.x += serenito.velocidad;
    if (teclas['ArrowLeft'] || teclas['a']) serenito.x -= serenito.velocidad;

    // Límites (Para no salir de la pantalla)
    if (serenito.x < 0) serenito.x = 0;
    if (serenito.x > canvas.width - serenito.ancho) serenito.x = canvas.width - serenito.ancho;
    
    // Gravedad simple (siempre en el suelo)
    serenito.y = sueloY - serenito.alto;

    // --- DIBUJADO ---

    // 1. DIBUJAR SUELO
    ctx.fillStyle = "#4CAF50"; // Verde pasto
    ctx.fillRect(0, sueloY, canvas.width, 100);

    // 2. DIBUJAR MUNICIPALIDAD (ROTADA 90 GRADOS)
    // Esta es la parte crítica que recuperamos
    ctx.save(); // Guardamos el estado normal
    
    // Definimos dónde va a estar (Esquina derecha)
    let muniX = canvas.width - 250;
    let muniY = sueloY - 50;

    // Movemos el "origen" del dibujo a esa posición
    ctx.translate(muniX, muniY);
    
    // ROTACIÓN: 90 grados a la izquierda (-PI/2)
    ctx.rotate(-Math.PI / 2); 

    // Dibujamos el edificio (Ahora el eje X es vertical hacia arriba)
    ctx.fillStyle = muni.color;
    ctx.fillRect(0, 0, muni.ancho, muni.alto);
    
    // Detalle: Techo Rojo (para confirmar orientación)
    ctx.fillStyle = "#8B0000"; 
    ctx.fillRect(0, 0, 30, muni.alto); // Franja del techo
    
    // Texto para confirmar que no está al revés
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText("MUNI", 40, 60);

    ctx.restore(); // Restauramos para que Serenito no salga chueco

    // 3. DIBUJAR SERENITO
    ctx.fillStyle = serenito.color;
    ctx.fillRect(serenito.x, serenito.y, serenito.ancho, serenito.alto);
    
    // Ojos (Para ver dirección)
    ctx.fillStyle = "black";
    ctx.fillRect(serenito.x + 35, serenito.y + 15, 5, 5);

    requestAnimationFrame(gameLoop);
}

// ARRANQUE
gameLoop();
