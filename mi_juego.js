const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const crearEscena = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.2); // Fondo azul oscuro colonial

    // 1. CONFIGURACIÓN DRACO (Indispensable para archivos optimizados)
    BABYLON.DracoCompression.Configuration = {
        decoder: { fallbackUrl: "https://preview.babylonjs.com/draco_transcoder.js" }
    };

    // 2. CÁMARA Y LUCES MEJORADAS
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 8, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);

    // Luz Ambiente (Luz del cielo)
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1.0; 

    // Luz Frontal (Para que los textos se vean claros)
    const lightFront = new BABYLON.HemisphericLight("lightFront", new BABYLON.Vector3(0, 1, -1), scene);
    lightFront.intensity = 0.6;
    lightFront.diffuse = new BABYLON.Color3(1, 1, 0.9);

    // 3. EL ESCENARIO
    const suelo = BABYLON.MeshBuilder.CreateGround("suelo", {width: 100, height: 100}, scene);
    const matSuelo = new BABYLON.StandardMaterial("matSuelo", scene);
    matSuelo.diffuseColor = new BABYLON.Color3(0.8, 0.7, 0.4); // Color arena/tierra
    suelo.material = matSuelo;

    // 4. CARGA Y ARREGLO DE SERENITO
    BABYLON.SceneLoader.ImportMesh("", "./", "serenito.glb", scene, function (meshes, ps, sk, anims) {
        const personaje = meshes[0];

        // --- ARREGLO DE TEXTOS AL REVÉS (ESPEJO) ---
        // Usamos -1.5 en el eje X para voltear el modelo.
        personaje.scaling = new BABYLON.Vector3(-1.5, 1.5, 1.5); 
        
        // --- ARREGLO DE POSICIÓN (ZONA FANTASMA) ---
        // Lo subimos para que pise el suelo y no se corte a la mitad.
        personaje.position.y = 1.2; 
        
        // Corrección de caras: al espejar, el modelo puede verse transparente. Esto lo arregla.
        meshes.forEach(m => {
            if (m.material) { m.material.sideOrientation = BABYLON.Orientation.CW; }
        });

        camera.lockedTarget = personaje;

        // Reproducir caminata de Mixamo
        if (anims && anims.length > 0) {
            anims[0].play(true);
        }

        // 5. SISTEMA DE MOVIMIENTO
        const inputMap = {};
        scene.actionManager = new BABYLON.ActionManager(scene);
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
            inputMap[evt.sourceEvent.key.toLowerCase()] = true;
        }));
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            inputMap[evt.sourceEvent.key.toLowerCase()] = false;
        }));

        scene.onBeforeRenderObservable.add(() => {
            const vel = 0.12;
            // Ejes ajustados para coincidir con el modelo espejado
            if (inputMap["w"] || inputMap["arrowup"]) { personaje.position.z -= vel; personaje.rotation.y = Math.PI; }
            if (inputMap["s"] || inputMap["arrowdown"]) { personaje.position.z += vel; personaje.rotation.y = 0; }
            if (inputMap["a"] || inputMap["arrowleft"]) { personaje.position.x -= vel; personaje.rotation.y = -Math.PI / 2; }
            if (inputMap["d"] || inputMap["arrowright"]) { personaje.position.x += vel; personaje.rotation.y = Math.PI / 2; }
        });
    });

    return scene;
};

const scene = crearEscena();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
