// --- CONFIGURACIÓN DEL MOTOR BABYLON.JS ---
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const crearEscena = function () {
    const scene = new BABYLON.Scene(engine);
    
    // 1. SOPORTE PARA ARCHIVOS LIVIANOS (DRACO)
    // Esto permite que el juego lea a Serenito aunque esté comprimido para pesar poco.
    BABYLON.DracoCompression.Configuration = {
        decoder: { fallbackUrl: "https://preview.babylonjs.com/draco_transcoder.js" }
    };

    // 2. CÁMARA Y LUZ (EL SOL DE LA SERENA)
    const camera = new BABYLON.ArcRotateCamera("camera", Math.PI / 2, Math.PI / 3, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    
    const light = new BABYLON.DirectionalLight("sun", new BABYLON.Vector3(-1, -2, -1), scene);
    light.position = new BABYLON.Vector3(20, 40, 20);
    light.intensity = 1.5;

    // Generador de sombras para realismo colonial
    const shadowGenerator = new BABYLON.ShadowGenerator(1024, light);
    shadowGenerator.useBlurExponentialShadowMap = true;

    // 3. SUELO Y ENTORNO ACELERADO (INSTANCIAS)
    const suelo = BABYLON.MeshBuilder.CreateGround("suelo", {width: 100, height: 100}, scene);
    suelo.receiveShadows = true;
    const materialSuelo = new BABYLON.StandardMaterial("matSuelo", scene);
    materialSuelo.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.5); // Color arena típico
    suelo.material = materialSuelo;

    // "REDUCTOR DE PERFILES": Creamos un muro maestro y lo replicamos
    const muroMaestro = BABYLON.MeshBuilder.CreateBox("muroMaestro", {width: 4, height: 5, depth: 0.5}, scene);
    muroMaestro.isVisible = false; // El molde no se ve

    for (let i = 0; i < 8; i++) {
        // Creamos "instancias" que no consumen memoria extra de video (VRAM)
        let muroCalle = muroMaestro.createInstance("muro_" + i);
        muroCalle.position = new BABYLON.Vector3(i * 4.2 - 15, 2.5, 10);
        shadowGenerator.addShadowCaster(muroCalle);
    }

    // 4. CARGAR A SERENITO (ANIMADO)
    // Usamos el archivo que optimizamos para bajar de los 41.2 MB
    BABYLON.SceneLoader.ImportMesh("", "./", "serenito.glb", scene, function (meshes, particleSystems, skeletons, animationGroups) {
        const personaje = meshes[0];
        personaje.scaling = new BABYLON.Vector3(1, 1, 1);
        personaje.position = new BABYLON.Vector3(0, 0, 0);

        // Activamos la caminata de Mixamo en bucle
        if (animationGroups.length > 0) {
            animationGroups[0].play(true);
        }

        // La cámara sigue a Serenito
        camera.lockedTarget = personaje;
        
        // El personaje proyecta sombras en el suelo colonial
        meshes.forEach(m => shadowGenerator.addShadowCaster(m));
    });

    return scene;
};

const scene = crearEscena();

engine.runRenderLoop(function () {
    scene.render();
});

window.addEventListener("resize", function () {
    engine.resize();
});
