/* =========================================
   CONFIGURACIÓN INICIAL (CANVAS)
   ========================================= */
const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Ajustar canvas al tamaño completo de la ventana
function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
}
window.addEventListener('resize', resize);
resize(); // Llamada inicial

/* =========================================
   OBJETOS DEL JUEGO
   ========================================= */

// 1. SERENITO (El Protagonista)
const serenito = {
    x: 100,
    y: 0, // Se ajusta en el bucle según el suelo
    ancho: 50,
    alto: 80,
    velocidad: 6,
    color: 'salmon' // Color temporal hasta que cargues tu sprite
};

// 2. LA MUNICIPALIDAD (El Edificio Rotado)
const muni = {
    x: 0, // Se calcula dinámicamente
    y: 0,
    ancho: 200,
    alto: 120, // Invertido visualmente por la rotación
    color: '#DDDDDD'
};

// CONTROLES DE TECLADO
const teclas = {};
window.addEventListener('keydown', e => teclas[e.key] = true);
window.addEventListener('keyup', e => teclas[e.key] = false);

/* =========================================
   MOTOR DEL JUEGO (GAME LOOP)
   ========================================= */
function gameLoop() {
    // A. Limpiar pantalla
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // B. Calcular posiciones dinámicas (responsive)
    const sueloY = canvas.height - 100;
    
    // Posición de la Muni: Esquina derecha
    muni.x = canvas.width - 250; 
    muni.y = sueloY - 50; 

    // Posición de Serenito (Gravedad simple: siempre en el suelo)
    serenito.y = sueloY - serenito.alto;

    // C. Mover Serenito
    if (teclas['ArrowRight'] || teclas['d']) serenito.x += serenito.velocidad;
    if (teclas['ArrowLeft'] || teclas['a']) serenito.x -= serenito.velocidad;

    // Límites de pantalla para Serenito
    if (serenito.x < 0) serenito.x = 0;
    if (serenito.x > canvas.width - serenito.ancho) serenito.x = canvas.width - serenito.ancho;

    // --- DIBUJAR ---

    // 1. EL SUELO
    ctx.fillStyle = "#4CAF50"; // Verde pasto
    ctx.fillRect(0, sueloY, canvas.width, 100);

    // 2. LA MUNICIPALIDAD ROTADA (Lógica compleja recuperada)
    ctx.save(); // Guardar estado normal
    
    // Trasladamos el punto 0,0 al centro de donde queremos la muni
    let centroMuniX = muni.x + muni.ancho / 2;
    let centroMuniY = muni.y + muni.alto / 2;
    ctx.translate(centroMuniX, centroMuniY);
    
    // ROTACIÓN: 90 grados a la izquierda (Anti-horario)
    ctx.rotate(-90 * Math.PI / 180); 
    
    // Dibujamos el edificio centrado en el nuevo eje rotado
    ctx.fillStyle = muni.color;
    ctx.fillRect(-muni.ancho / 2, -muni.alto / 2, muni.ancho, muni.alto);
    
    // Detalle: Techo (Para ver que está girada)
    ctx.fillStyle = "#8B0000"; // Rojo oscuro
    ctx.fillRect(-muni.ancho / 2, -muni.alto / 2, 30, muni.alto); // Franja lateral que ahora es superior
    
    // Texto rotado
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText("MUNI", -20, 0);
    
    ctx.restore(); // Restaurar estado normal (MUY IMPORTANTE)

    // 3. DIBUJAR A SERENITO
    ctx.fillStyle = serenito.color;
    ctx.fillRect(serenito.x, serenito.y, serenito.ancho, serenito.alto);
    
    // Ojos de Serenito (para ver hacia dónde mira)
    ctx.fillStyle = "black";
    ctx.fillRect(serenito.x + 30, serenito.y + 10, 5, 5);

    // Repetir el ciclo
    requestAnimationFrame(gameLoop);
}

// INICIAR
gameLoop();
