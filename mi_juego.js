// ====================================================================
// CÓDIGO PRINCIPAL DEL JUEGO (mi_juego.js)
// Versión: Escenario Básico + Serenito + Primeros Muros Coloniales
// ====================================================================

// --- 1. CONFIGURACIÓN BÁSICA DEL MOTOR ---
const canvas = document.getElementById("renderCanvas");
// Iniciamos el motor gráfico con 'antialias: true' para que los bordes se vean suaves.
const engine = new BABYLON.Engine(canvas, true);

// --- FUNCIÓN PRINCIPAL: Aquí creamos el mundo ---
const createScene = function () {
    // Creamos la escena vacía
    const scene = new BABYLON.Scene(engine);
    // Color de fondo del cielo (un celeste claro estilo Serena)
    scene.clearColor = new BABYLON.Color3(0.6, 0.8, 1);

    // --- 2. CÁMARA (Nuestros ojos) ---
    // Cámara que gira alrededor del centro.
    // Parámetros: Nombre, ángulo horizontal, ángulo vertical, distancia, objetivo, escena.
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, new BABYLON.Vector3(0, 1, 0), scene);
    camera.attachControl(canvas, true); // Permitimos control con mouse/tactil
    camera.wheelPrecision = 50; // Velocidad del zoom con la rueda
    camera.lowerRadiusLimit = 4; // No acercarse demasiado
    camera.upperRadiusLimit = 20; // No alejarse demasiado
    camera.lowerBetaLimit = 0.1; // No meterse debajo del suelo

    // --- 3. LUCES Y SOMBRAS (El Sol de Coquimbo) ---
    // Luz ambiental suave (hemisférica) para que nada se vea completamente negro.
    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.5;

    // Luz direccional fuerte que simula el SOL.
    // La dirección (-1, -2, -1) hace que venga de arriba y un lado.
    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.position = new BABYLON.Vector3(20, 40, 20); // Ponemos el sol alto
    dirLight.intensity = 1.3; // Sol brillante

    // CREO EL GENERADOR DE SOMBRAS (Usando la luz del sol)
    const shadowGenerator = new BABYLON.ShadowGenerator(2048, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true; // Sombras con bordes suaves
    shadowGenerator.blurKernel = 32; // Nivel de suavizado

    // --- 4. EL ENTORNO (Suelo y Edificios) ---

    // A) EL SUELO (Tierra/Arena)
    // Creamos un plano grande de 60x60 metros.
    const ground = BABYLON.MeshBuilder.CreateGround("suelo", {width: 60, height: 60}, scene);
    // Material para el suelo
    const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.85, 0.75, 0.55); // Color arena claro
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // Que no brille (mate)
    ground.material = groundMaterial;
    // ¡IMPORTANTE! El suelo debe RECIBIR las sombras.
    ground.receiveShadows = true;

    // B) LOS MUROS COLONIALES (Técnica de Instanciación Rápida)
    // 1. Creamos el "Molde Maestro": Una pared blanca simple.
    // (Ancho 4m, Alto 3.5m, Profundidad 0.5m)
    const muroMaestro = BABYLON.MeshBuilder.CreateBox("muroMaestro", {width: 4, height: 3.5, depth: 0.5}, scene);
    // Material blanco hueso para la pared
    const materialMuro = new BABYLON.StandardMaterial("matMuroBlanco", scene);
    materialMuro.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.9); // Blanco colonial
    muroMaestro.material = materialMuro;
    
    // ESCONDEMOS EL MAESTRO. No queremos verlo, solo usarlo para clonar.
    muroMaestro.isVisible = false;

    // 2. La "Fotocopiadora": Creamos una fila de 8 muros.
    for (let i = 0; i < 8; i++) {
        // ¡MAGIA! 'createInstance' clona el objeto casi sin costo de rendimiento.
        let clonMuro = muroMaestro.createInstance("muro_clon_" + i);
        
        // Posicionamos cada clon:
        // Los separamos 4 metros entre sí en el eje X, empezando desde atrás (-14).
        // Los subimos la mitad de su altura (1.75) en Y para que pisen el suelo.
        // Los alejamos 6 metros del centro en el eje Z.
        clonMuro.position = new BABYLON.Vector3((i * 4) - 14, 1.75, 6);
        
        // Hacemos que el clon proyecte y reciba sombras para darle realismo.
        clonMuro.receiveShadows = true;
        shadowGenerator.addShadowCaster(clonMuro);
    }

    // --- 5. CARGAR AL PROTAGONISTA (Serenito) ---
    BABYLON.SceneLoader.ImportMesh(
        "",             // Ruta base (vacía)
        "./",           // Carpeta actual
        "serenito.glb", // NOMBRE EXACTO DE TU ARCHIVO EN GITHUB
        scene,
        function (meshes) {
            // Esta función se ejecuta cuando el modelo termina de cargar
            console.log("¡Serenito cargado en La Serena!");

            const serenitoRoot = meshes[0];

            // AJUSTES DE POSICIÓN (Si flota un poco, ajusta este valor Y)
            // serenitoRoot.position.y = 0.1;

            // AJUSTES DE TAMAÑO (Si es muy grande o chico, descomenta y ajusta los 1)
            // serenitoRoot.scaling = new BABYLON.Vector3(1, 1, 1);

            // --- SOMBRAS PARA SERENITO ---
            // Recorremos todas las partes del modelo
            meshes.forEach(function(mesh) {
                // Cada parte proyecta sombra en el suelo
                shadowGenerator.addShadowCaster(mesh);
                // Cada parte se hace sombra a sí misma (auto-sombreado)
                mesh.receiveShadows = true;
            });
        },
        null, // Función de progreso (no usada)
        function (scene, message, exception) {
             // Si falla, avisa en la consola (F12)
             console.error("Error fatal: No se pudo cargar 'serenito.glb'. Verifique el nombre en GitHub.");
        }
    );

    // Devolvemos la escena terminada
    return scene;
};


// --- INICIAR EL MOTOR ---
const scene = createScene();

// Bucle principal: Dibuja la escena constantemente
engine.runRenderLoop(function () {
    scene.render();
});

// Ajustar si cambia el tamaño de la ventana del navegador
window.addEventListener("resize", function () {
    engine.resize();
});
