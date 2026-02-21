/* ==========================================
   CONFIGURACIÓN FIREBASE & 2D ENGINE
   ========================================== */
const firebaseConfig = {
    apiKey: "AIzaSyCDUhik-oYwJ-yBkBYAohw6DJct5FQ78w4",
    projectId: "laserena-d1263",
    appId: "1:283725387947:web:898aa22c80c2fadbe8bfee"
};
// Nota: En JS externo, asegúrate de haber cargado Firebase en el HTML que llama a este script.

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

function resize() { canvas.width = window.innerWidth; canvas.height = window.innerHeight; }
window.addEventListener('resize', resize);
resize(); 

const serenito = { x: 100, y: 0, ancho: 50, alto: 80, velocidad: 6, color: 'salmon' };
const muni = { ancho: 200, alto: 120, color: '#DDDDDD' };
const teclas = {};
window.addEventListener('keydown', e => teclas[e.key] = true);
window.addEventListener('keyup', e => teclas[e.key] = false);

function gameLoop() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const sueloY = canvas.height - 100;

    if (teclas['ArrowRight'] || teclas['d']) serenito.x += serenito.velocidad;
    if (teclas['ArrowLeft'] || teclas['a']) serenito.x -= serenito.velocidad;
    if (serenito.x < 0) serenito.x = 0;
    if (serenito.x > canvas.width - serenito.ancho) serenito.x = canvas.width - serenito.ancho;
    serenito.y = sueloY - serenito.alto;

    // SUELO
    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(0, sueloY, canvas.width, 100);

    // MUNICIPALIDAD (Respetando tu rotación de 90° Canvas)
    ctx.save();
    let muniX = canvas.width - 250;
    let muniY = sueloY - 50;
    ctx.translate(muniX, muniY);
    ctx.rotate(-Math.PI / 2); 
    ctx.fillStyle = muni.color;
    ctx.fillRect(0, 0, muni.ancho, muni.alto);
    ctx.fillStyle = "#8B0000"; 
    ctx.fillRect(0, 0, 30, muni.alto); 
    ctx.fillStyle = "black";
    ctx.font = "16px Arial";
    ctx.fillText("MUNI-LS", 40, 60);
    ctx.restore();

    // SERENITO
    ctx.fillStyle = serenito.color;
    ctx.fillRect(serenito.x, serenito.y, serenito.ancho, serenito.alto);
    ctx.fillStyle = "black";
    ctx.fillRect(serenito.x + 35, serenito.y + 15, 5, 5);

    requestAnimationFrame(gameLoop);
}
gameLoop();
