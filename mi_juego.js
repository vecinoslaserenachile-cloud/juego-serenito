// ====================================================================
// CÓDIGO PRINCIPAL DEL JUEGO (mi_juego.js)
// Versión: Escenario Básico + Serenito + MOVIMIENTO DEL JUGADOR
// ====================================================================

const canvas = document.getElementById("renderCanvas");
// Activamos 'preserveDrawingBuffer' por si necesitamos tomar capturas de pantalla luego
const engine = new BABYLON.Engine(canvas, true, { preserveDrawingBuffer: true, stencil: true });

// --- VARIABLES GLOBALES (Para que todo el código pueda acceder a ellas) ---
let serenitoMesh = null; // Aquí guardaremos al personaje cuando cargue
let inputMap = {}; // Aquí guardaremos qué teclas están presionadas


// --- FUNCIÓN PRINCIPAL: CREATE SCENE ---
const createScene = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.6, 0.8, 1); // Cielo celeste

    // --- 1. CÁMARA DE SEGUIMIENTO ---
    // Usamos una 'FollowCamera' que está diseñada para perseguir objetivos.
    // Parámetros: Nombre, posición inicial, escena, objetivo (se define luego).
    const camera = new BABYLON.FollowCamera("FollowCam", new BABYLON.Vector3(0, 10, -10), scene);
    camera.radius = 8; // Distancia al personaje
    camera.heightOffset = 3; // Altura de la cámara sobre el personaje
    camera.rotationOffset = 180; // Para que mire desde atrás
    camera.cameraAcceleration = 0.05; // Qué tan rápido acelera para seguirlo
    camera.maxCameraSpeed = 10; // Velocidad máxima

    // --- 2. LUCES Y SOMBRAS ---
    const hemiLight = new BABYLON.HemisphericLight("hemiLight", new BABYLON.Vector3(0, 1, 0), scene);
    hemiLight.intensity = 0.5;

    const dirLight = new BABYLON.DirectionalLight("dirLight", new BABYLON.Vector3(-1, -2, -1), scene);
    dirLight.position = new BABYLON.Vector3(20, 40, 20);
    dirLight.intensity = 1.3;

    // Sombras suaves
    const shadowGenerator = new BABYLON.ShadowGenerator(2048, dirLight);
    shadowGenerator.useBlurExponentialShadowMap = true;
    shadowGenerator.blurKernel = 32;

    // --- 3. EL ENTORNO (Suelo y Muros) ---
    // Suelo
    const ground = BABYLON.MeshBuilder.CreateGround("suelo", {width: 100, height: 100}, scene);
    const groundMaterial = new BABYLON.StandardMaterial("groundMat", scene);
    groundMaterial.diffuseColor = new BABYLON.Color3(0.85, 0.75, 0.55); // Arena
    groundMaterial.specularColor = new BABYLON.Color3(0, 0, 0); // Mate
    ground.material = groundMaterial;
    ground.receiveShadows = true;

    // Muros Coloniales (Instanciación)
    const muroMaestro = BABYLON.MeshBuilder.CreateBox("muroMaestro", {width: 4, height: 3.5, depth: 0.5}, scene);
    const materialMuro = new BABYLON.StandardMaterial("matMuroBlanco", scene);
    materialMuro.diffuseColor = new BABYLON.Color3(0.95, 0.95, 0.9);
    muroMaestro.material = materialMuro;
    muroMaestro.isVisible = false; // Escondemos el original

    // Creamos 10 muros en fila
    for (let i = 0; i < 10; i++) {
        let clonMuro = muroMaestro.createInstance("muro_clon_" + i);
        clonMuro.position = new BABYLON.Vector3((i * 4) - 20, 1.75, 8);
        clonMuro.receiveShadows = true;
        shadowGenerator.addShadowCaster(clonMuro);
    }

    // --- 4. SISTEMA DE CONTROL (TECLADO) ---
    // Esto "escucha" cuando presionas una tecla
    scene.actionManager = new BABYLON.ActionManager(scene);
    // Cuando se presiona una tecla (OnKeyDown), guardamos que es 'true' en el mapa
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
        inputMap[evt.sourceEvent.key.toLowerCase()] = true;
    }));
    // Cuando se suelta una tecla (OnKeyUp), guardamos que es 'false'
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
        inputMap[evt.sourceEvent.key.toLowerCase()] = false;
    }));


    // --- 5. CARGAR A SERENITO ---
    BABYLON.SceneLoader.ImportMesh("", "./", "serenito.glb", scene, function (meshes) {
        console.log("¡Serenito listo para moverse!");
        serenitoMesh = meshes[0]; // Guardamos al personaje en la variable global

        // Ajustes iniciales
        // serenitoMesh.position.y = 0;
        // serenitoMesh.scaling = new BABYLON.Vector3(1, 1, 1);

        // Sombras
        meshes.forEach(function(mesh) {
            shadowGenerator.addShadowCaster(mesh);
            mesh.receiveShadows = true;
        });

        // ¡IMPORTANTE! Le decimos a la cámara que persiga a Serenito
        camera.lockedTarget = serenitoMesh;
    });

    return scene;
};


// --- INICIAR EL MOTOR ---
const scene = createScene();


// --- BUCLE PRINCIPAL DE JUEGO (Se ejecuta antes de dibujar cada imagen) ---
scene.onBeforeRenderObservable.add(() => {
    // Si Serenito aún no ha cargado, no hacemos nada
    if (!serenitoMesh) return;

    // Velocidad de movimiento y rotación
    const moveSpeed = 0.15;
    const rotateSpeed = 0.05;

    // --- LÓGICA DE MOVIMIENTO ---
    // Si presiona 'w' o Flecha Arriba -> Mover hacia adelante
    if (inputMap["w"] || inputMap["arrowup"]) {
        serenitoMesh.moveWithCollisions(serenitoMesh.forward.scale(moveSpeed));
    }
    // Si presiona 's' o Flecha Abajo -> Mover hacia atrás
    if (inputMap["s"] || inputMap["arrowdown"]) {
        serenitoMesh.moveWithCollisions(serenitoMesh.forward.scale(-moveSpeed));
    }
    // Si presiona 'a' o Flecha Izquierda -> Girar a la izquierda
    if (inputMap["a"] || inputMap["arrowleft"]) {
        serenitoMesh.rotate(BABYLON.Axis.Y, -rotateSpeed, BABYLON.Space.LOCAL);
    }
    // Si presiona 'd' o Flecha Derecha -> Girar a la derecha
    if (inputMap["d"] || inputMap["arrowright"]) {
        serenitoMesh.rotate(BABYLON.Axis.Y, rotateSpeed, BABYLON.Space.LOCAL);
    }
});


// --- BUCLE DE RENDERIZADO ---
engine.runRenderLoop(function () {
    scene.render();
});

// Ajustar pantalla
window.addEventListener("resize", function () {
    engine.resize();
});
