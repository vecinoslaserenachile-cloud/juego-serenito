const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const crearEscena = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color4(0.1, 0.1, 0.2, 1);

    // 1. CONFIGURACIÓN DRACO (Indispensable para archivos de Vectary)
    BABYLON.DracoCompression.Configuration = {
        decoder: { fallbackUrl: "https://preview.babylonjs.com/draco_transcoder.js" }
    };

    // 2. CÁMARA Y LUCES (Iluminación frontal para la cara)
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.8, 10, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    
    const light = new BABYLON.HemisphericLight("light1", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1.0;

    const lightFront = new BABYLON.PointLight("lightFront", new BABYLON.Vector3(0, 5, -5), scene);
    lightFront.intensity = 0.5;

    // 3. EL ESCENARIO REAL (Mapa de La Serena)
    const suelo = BABYLON.MeshBuilder.CreateGround("suelo", {width: 150, height: 150}, scene);
    const matMapa = new BABYLON.StandardMaterial("matMapa", scene);
    
    // Aquí usamos una captura real de las calles. Puedes cambiar este link por tu propia imagen de satélite
    matMapa.diffuseTexture = new BABYLON.Texture("https://tile.openstreetmap.org/16/21612/38584.png", scene); // Ejemplo Plaza de Armas
    matMapa.diffuseTexture.uScale = 10; // Repetir para que parezca una ciudad grande
    matMapa.diffuseTexture.vScale = 10;
    suelo.material = matMapa;

    // 4. CARGAR A SERENITO (Consolidado)
    BABYLON.SceneLoader.ImportMesh("", "./", "serenito.glb", scene, function (meshes, ps, sk, anims) {
        const personaje = meshes[0];

        // --- FIX DE PIES: Subimos el modelo para que pise el mapa ---
        personaje.position.y = 2.2; 

        // --- FIX DE TEXTO: Escalado negativo en X para que no esté al revés ---
        personaje.scaling = new BABYLON.Vector3(-1.8, 1.8, 1.8); 

        // --- FIX DE TRANSPARENCIA: Corregir caras al espejar ---
        meshes.forEach(m => {
            if (m.material) { m.material.sideOrientation = BABYLON.Orientation.CW; }
        });

        camera.lockedTarget = personaje;

        // Caminata Mixamo automática
        if (anims && anims.length > 0) {
            anims[0].play(true);
        }

        // 5. MOVIMIENTO SUAVE
        const inputMap = {};
        scene.actionManager = new BABYLON.ActionManager(scene);
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (evt) => {
            inputMap[evt.sourceEvent.key.toLowerCase()] = true;
        }));
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (evt) => {
            inputMap[evt.sourceEvent.key.toLowerCase()] = false;
        }));

        scene.onBeforeRenderObservable.add(() => {
            const vel = 0.15;
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
