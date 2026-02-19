// ====================================================================
// CÓDIGO PRINCIPAL DEL JUEGO (mi_juego.js) - VERSIÓN CON SERENITO
// ====================================================================

// --- 1. CONFIGURACIÓN BÁSICA ---
// Obtenemos el "lienzo" (canvas) del HTML donde vamos a dibujar
const canvas = document.getElementById("renderCanvas");
// Iniciamos el motor gráfico de Babylon.js, activando el suavizado (antialias: true)
const engine = new BABYLON.Engine(canvas, true);


// --- 2. LA FUNCIÓN QUE CREA LA ESCENA ---
// Aquí es donde definimos todo lo que hay en el mundo del juego.
const createScene = function () {
    // Crea el espacio 3D vacío
    const scene = new BABYLON.Scene(engine);

    // --- CÁMARA ---
    // Creamos una cámara que gira alrededor del personaje.
    // Parámetros: Nombre, ángulo horizontal inicial, ángulo vertical inicial, distancia, objetivo, escena.
    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 2.5, 5, new BABYLON.Vector3(0, 1, 0), scene);
    // Conectamos la cámara al lienzo para que el mouse/dedos la controlen.
    camera.attachControl(canvas, true);
    // Ajustamos la velocidad del zoom con la rueda del mouse (más alto = más lento/suave).
    camera.wheelPrecision = 50;
    // Límites para que la cámara no se meta bajo el suelo o gire demasiado alto.
    camera.lowerBetaLimit = 0.1;
    camera.upperBetaLimit = (Math.PI / 2) * 0.95;

    // --- LUZ ---
    // Una luz ambiental básica (hemisférica) para que el personaje se vea bien iluminado.
    // Parámetros: Nombre, dirección de la luz (hacia arriba), escena.
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    // Intensidad de la luz (0.0 es oscuro, 1.0 es brillo normal).
    light.intensity = 0.8;


    // --- AQUÍ OCURRE LA MAGIA: CARGAR EL MODELO 3D DE SERENITO ---

    // Usamos la herramienta 'SceneLoader.ImportMesh' de Babylon.
    BABYLON.SceneLoader.ImportMesh(
        "",             // Ruta raíz (vacía porque el archivo está en la misma carpeta principal)
        "./",           // Ruta relativa (significa "en este mismo directorio")
        "serenito.glb", // ¡NOMBRE EXACTO DEL ARCHIVO! (Debe coincidir con el que subiste a GitHub)
        scene,          // La escena donde lo vamos a poner.
        function (meshes) {
            // --- ESTA FUNCIÓN SE EJECUTA SOLO CUANDO EL MODELO TERMINA DE CARGAR ---

            // 'meshes' es una lista con todas las partes del modelo cargado.
            // El primer elemento (meshes[0]) suele ser el objeto principal o "padre".
            const serenitoMesh = meshes[0];

            console.log("¡Serenito ha sido cargado exitosamente en la escena!");

            // --- AJUSTES OPCIONALES (Por si el modelo sale raro) ---
            // Si Serenito aparece GIGANTE o MINÚSCULO, quita las barras '//' de la siguiente línea y cambia los números:
            // serenitoMesh.scaling = new BABYLON.Vector3(1, 1, 1); // (Escala X, Escala Y, Escala Z)

            // Si Serenito aparece FLOTANDO o HUNDIDO en el piso, ajusta la posición Y:
            // serenitoMesh.position.y = 0; // 0 es el nivel del suelo. Prueba con números positivos o negativos pequeños.
        },
        null, // Función de progreso (no la usamos por ahora)
        function (scene, message, exception) {
            // Función de error: Se ejecuta si algo sale mal al cargar.
            console.error("¡Error al cargar el modelo! Revisa que el nombre 'serenito.glb' sea correcto en GitHub.");
            console.error(message, exception);
        }
    );

    // Devolvemos la escena lista
    return scene;
};


// --- 3. INICIAMOS LA ESCENA ---
// Llamamos a la función que acabamos de definir.
const scene = createScene();


// --- 4. EL BUCLE PRINCIPAL DEL JUEGO ---
// Esto le dice al motor que dibuje la escena constantemente (aprox. 60 veces por segundo).
engine.runRenderLoop(function () {
    scene.render();
});


// --- 5. MANEJO DEL TAMAÑO DE PANTALLA ---
// Si el usuario gira el celular o cambia el tamaño de la ventana del navegador,
// el motor gráfico se ajusta automáticamente para no verse estirado.
window.addEventListener("resize", function () {
    engine.resize();
});
