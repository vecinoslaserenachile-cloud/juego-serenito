// ====================================================================
// CÓDIGO PRINCIPAL DEL JUEGO (mi_juego.js) - VERSIÓN CON SERENITO
// ====================================================================

// --- 1. CONFIGURACIÓN BÁSICA ---
const canvas = document.getElementById("renderCanvas");
// Iniciamos el motor gráfico con antialias (suavizado de bordes)
const engine = new BABYLON.Engine(canvas, true);

// --- 2. LA FUNCIÓN QUE CREA LA ESCENA ---
const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // --- CÁMARA ---
    // Cámara rotativa. La alejamos un poco (radio 6) para ver mejor.
    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 6, new BABYLON.Vector3(0, 1, 0), scene);
    camera.attachControl(canvas, true);
    camera.wheelPrecision = 50; // Zoom suave
    // Límites para que la cámara no atraviese el suelo
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = (Math.PI / 2) * 0.95;

    // --- LUZ ---
    // Luz hemisférica para iluminar al personaje desde arriba
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // --- CARGAR EL MODELO 3D DE SERENITO ---
    // IMPORTANTE: El archivo "serenito.glb" DEBE estar en la misma lista de archivos en GitHub.
    BABYLON.SceneLoader.ImportMesh(
        "",             // Ruta base (vacía)
        "./",           // Carpeta actual
        "serenito.glb", // NOMBRE EXACTO DEL ARCHIVO
        scene,
        function (meshes) {
            // Esta función se ejecuta cuando el modelo termina de cargar
            console.log("¡Serenito cargado!");
            // El personaje principal suele ser el primer objeto (meshes[0])
            const serenito = meshes[0];

            // AJUSTES OPCIONALES (Si se ve raro, descomenta estas líneas):
            // serenito.scaling = new BABYLON.Vector3(1, 1, 1); // Ajustar tamaño
            // serenito.position.y = 0; // Asegurar que pise el suelo
        },
        null, // No usamos función de progreso
        function (scene, message, exception) {
            // Si algo falla, lo dirá en la consola (F12)
            console.error("Error cargando el modelo. Revisa el nombre del archivo .glb en GitHub.");
        }
    );

    return scene;
};

// --- 3. INICIAMOS LA ESCENA ---
const scene = createScene();

// --- 4. BUCLE PRINCIPAL ---
engine.runRenderLoop(function () {
    scene.render();
});

// --- 5. AJUSTAR PANTALLA ---
window.addEventListener("resize", function () {
    engine.resize();
});
