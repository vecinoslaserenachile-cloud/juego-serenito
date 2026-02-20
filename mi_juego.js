const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const crearEscena = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.1, 0.1, 0.2); // Fondo mejorado

    // 1. CONFIGURACIÓN DRACO (INDISPENSABLE)
    BABYLON.DracoCompression.Configuration = {
        decoder: { fallbackUrl: "https://preview.babylonjs.com/draco_transcoder.js" }
    };

    // 2. LUCES Y CÁMARA
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 3, 15, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 0.8;

    // 3. ENTORNO (SUELO Y MUROS)
    const suelo = BABYLON.MeshBuilder.CreateGround("suelo", {width: 100, height: 100}, scene);
    const matSuelo = new BABYLON.StandardMaterial("matSuelo", scene);
    matSuelo.diffuseColor = new BABYLON.Color3(0.9, 0.8, 0.4); 
    suelo.material = matSuelo;

    // Muros de La Serena (Instancias para velocidad)
    const muroM = BABYLON.MeshBuilder.CreateBox("muroM", {width: 4, height: 5, depth: 0.5}, scene);
    muroM.isVisible = false;
    for (let i = 0; i < 10; i++) {
        let muro = muroM.createInstance("muro" + i);
        muro.position = new BABYLON.Vector3(i * 5 - 20, 2.5, 10);
    }

    // 4. CARGAR A SERENITO
    // IMPORTANTE: El archivo en GitHub debe llamarse exactamente 'serenito.glb'
    BABYLON.SceneLoader.ImportMesh("", "./", "serenito.glb", scene, function (meshes, ps, sk, anims) {
        const personaje = meshes[0];
        personaje.scaling = new BABYLON.Vector3(2, 2, 2); // Ajuste de tamaño
        camera.lockedTarget = personaje;

        // Iniciar caminata de Mixamo
        if (anims && anims.length > 0) {
            anims[0].play(true);
        }

        // 5. CONTROLES DE MOVIMIENTO
        const inputMap = {};
        scene.actionManager = new BABYLON.ActionManager(scene);
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, function (evt) {
            inputMap[evt.sourceEvent.key.toLowerCase()] = true;
        }));
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, function (evt) {
            inputMap[evt.sourceEvent.key.toLowerCase()] = false;
        }));

        scene.onBeforeRenderObservable.add(() => {
            let moviendo = false;
            if (inputMap["w"] || inputMap["arrowup"]) { personaje.position.z -= 0.1; personaje.rotation.y = Math.PI; moviendo = true; }
            if (inputMap["s"] || inputMap["arrowdown"]) { personaje.position.z += 0.1; personaje.rotation.y = 0; moviendo = true; }
            if (inputMap["a"] || inputMap["arrowleft"]) { personaje.position.x += 0.1; personaje.rotation.y = Math.PI / 2; moviendo = true; }
            if (inputMap["d"] || inputMap["arrowright"]) { personaje.position.x -= 0.1; personaje.rotation.y = -Math.PI / 2; moviendo = true; }
        });
    });

    return scene;
};

const scene = crearEscena();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
