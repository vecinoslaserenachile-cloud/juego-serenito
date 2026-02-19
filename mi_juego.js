// ====================================================================
// CÓDIGO PRINCIPAL DEL JUEGO (mi_juego.js) - VERSIÓN CON ESCENARIO BÁSICO
// ====================================================================

// --- 1. CONFIGURACIÓN BÁSICA ---
const canvas = document.getElementById("renderCanvas");
// Iniciamos el motor gráfico con antialias para bordes suaves
const engine = new BABYLON.Engine(canvas, true);

// Esta es la función principal donde creamos todo el mundo
const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    // Color de fondo del cielo (un celeste claro)
    scene.clearColor = new BABYLON.Color3(0.5, 0.8, 1);

    // --- 2. CÁMARA ---
    // Cámara rotativa que mira al centro (0,1,0)
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 8, new BABYLON.Vector3(0, 1, 0), scene);
    camera.attachControl(canvas, true);
    camera.wheelPrecision = 50; // Velocidad del zoom
    camera.lowerRadiusLimit = 3; // No acercarse mucho
    camera.upperRadiusLimit = 15; // No alejarse mucho
    camera.lowerBetaLimit = 0.1; // No bajar del suelo

    // --- 3. LUCES Y SOMBRAS (El Sol) ---
    // Luz ambiental suave para que las sombras no sean negras
    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.4;

    // Luz direccional fuerte (el sol) que genera sombras
    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.position = new BABYLON.Vector3(20, 40, 20);
    dirLight.intensity = 1.2;

    // El generador de sombras
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true; // Sombras suaves
    shadowGenerator.blurKernel = 32;

    // --- 4. EL SUELO ---
    // Creamos un plano grande de 50x50 metros
    const ground = BABYLON.MeshBuilder.CreateGround("suelo", {width: 50, height: 50}, scene);
    // Material para el suelo (color arena/tierra)
    const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.8, 0.7, 0.5); // Color arena
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // Que no brille como plástico
    ground.material = groundMaterial;
    // ¡IMPORTANTE! Decimos que el suelo debe recibir las sombras de otros objetos
    ground.receiveShadows = true;


    // --- 5. CARGAR A SERENITO ---
    BABYLON.SceneLoader.ImportMesh(
        "",             // Ruta base
        "./",           // Carpeta actual
        "serenito.glb", // NOMBRE EXACTO DE TU ARCHIVO EN GITHUB
        scene,
        function (meshes) {
            // Esta función se ejecuta cuando el modelo termina de cargar
            console.log("¡Serenito cargado en el escenario!");

            const serenitoRoot = meshes[0];

            // AJUSTES DE POSICIÓN (Si flota, ajusta el valor Y)
            // serenitoRoot.position.y = 0;

            // AJUSTES DE TAMAÑO (Si es muy grande o chico, descomenta y ajusta)
            // serenitoRoot.scaling = new BABYLON.Vector3(1, 1, 1);

            // --- SOMBRAS PARA SERENITO ---
            // Recorremos todas las partes del modelo de Serenito
            meshes.forEach(function(mesh) {
                // Hacemos que cada parte proyecte sombra en el suelo
                shadowGenerator.addShadowCaster(mesh);
                // Hacemos que cada parte se haga sombra a sí misma (realismo)
                mesh.receiveShadows = true;
            });
        },
        null, // Progreso
        function (scene, message, exception) {
             console.error("Error cargando el modelo. Revisa que 'serenito.glb' exista en GitHub.");
        }
    );

    return scene;
};

// --- INICIAR TODO ---
const scene = createScene();

// Bucle principal de dibujado
engine.runRenderLoop(function () {
    scene.render();
});

// Ajustar si cambia el tamaño de la ventana
window.addEventListener("resize", function () {
    engine.resize();
});
