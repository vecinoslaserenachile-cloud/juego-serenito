const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const crearEscena = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.15, 0.15, 0.3); // Cielo nocturno de Coquimbo

    // 1. CONFIGURACIÓN DRACO
    BABYLON.DracoCompression.Configuration = {
        decoder: { fallbackUrl: "https://preview.babylonjs.com/draco_transcoder.js" }
    };

    // 2. CÁMARA MEJORADA
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.lowerRadiusLimit = 5; // Para que no se acerquen demasiado
    camera.upperRadiusLimit = 20;

    // 3. ILUMINACIÓN DOBLE (ADIÓS SOMBRAS OSCURAS)
    // Luz desde arriba (Ambiente)
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.7;

    // LUZ FRONTAL (Para iluminar la cara de Serenito)
    const lightFront = new BABYLON.HemisphericLight("light2", new BABYLON.Vector3(0, 1, -1), scene);
    lightFront.intensity = 0.5;
    lightFront.diffuse = new BABYLON.Color3(1, 1, 0.9); // Un toque cálido de sol

    // 4. SUELO Y CALLE
    const suelo = BABYLON.MeshBuilder.CreateGround("suelo", {width: 100, height: 100}, scene);
    const matSuelo = new BABYLON.StandardMaterial("matSuelo", scene);
    matSuelo.diffuseColor = new BABYLON.Color3(0.8, 0.7, 0.4); 
    suelo.material = matSuelo;

    // 5. CARGAR A SERENITO (CON AJUSTE DE ALTURA)
    BABYLON.SceneLoader.ImportMesh("", "./", "serenito.glb", scene, function (meshes, ps, sk, anims) {
        const personaje = meshes[0];
        
        // AJUSTE CRUCIAL: Subimos al personaje para que no se corte a la mitad
        // Si sigue enterrado, sube el 1.5 a 2.0 o 3.0 según necesites
        personaje.position.y = 1.5; 
        
        personaje.scaling = new BABYLON.Vector3(1.5, 1.5, 1.5);
        camera.lockedTarget = personaje;

        // Activar animación de Mixamo
        if (anims && anims.length > 0) {
            anims[0].play(true);
        }

        // 6. CONTROLES DE CAMINATA
        const inputMap = {};
        scene.actionManager = new BABYLON.ActionManager(scene);
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
            inputMap[evt.sourceEvent.key.toLowerCase()] = true;
        }));
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            inputMap[evt.sourceEvent.key.toLowerCase()] = false;
        }));

        scene.onBeforeRenderObservable.add(() => {
            const velocidad = 0.1;
            if (inputMap["w"] || inputMap["arrowup"]) { personaje.position.z -= velocidad; personaje.rotation.y = Math.PI; }
            if (inputMap["s"] || inputMap["arrowdown"]) { personaje.position.z += velocidad; personaje.rotation.y = 0; }
            if (inputMap["a"] || inputMap["arrowleft"]) { personaje.position.x += velocidad; personaje.rotation.y = Math.PI / 2; }
            if (inputMap["d"] || inputMap["arrowright"]) { personaje.position.x -= velocidad; personaje.rotation.y = -Math.PI / 2; }
        });
    });

    return scene;
};

const scene = crearEscena();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
