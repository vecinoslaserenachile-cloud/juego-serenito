const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);
let camera, personaje, animCaminar, destinoFinal;
let moviendoPorClick = false;

const crearEscena = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.4, 0.5, 0.8);
    scene.collisionsEnabled = true;

    BABYLON.DracoCompression.Configuration = {
        decoder: { fallbackUrl: "https://preview.babylonjs.com/draco_transcoder.js" }
    };

    // 1. CÁMARA INICIAL (Se queda fija mientras caminas)
    camera = new BABYLON.ArcRotateCamera("camera", -Math.PI/2, Math.PI/3, 15, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.checkCollisions = true;

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1.8;

    // 2. EL MAPA (Se carga siempre primero para no ver pantalla negra)
    const suelo = BABYLON.MeshBuilder.CreateGround("suelo", {width: 600, height: 600}, scene);
    const matSuelo = new BABYLON.StandardMaterial("matSuelo", scene);
    matSuelo.diffuseTexture = new BABYLON.Texture("mapa.jpg", scene);
    matSuelo.specularColor = new BABYLON.Color3(0, 0, 0);
    suelo.material = matSuelo;
    suelo.checkCollisions = true;
    suelo.position.y = -0.05;

    // 3. CARGA DE SERENITO (Archivo de 15MB)
    document.getElementById("estado").innerHTML = "📥 CARGANDO PROTAGONISTA...";
    
    BABYLON.SceneLoader.ImportMesh("", "./", "serenito.glb?v=" + Date.now(), scene, function (meshes, ps, sk, anims) {
        personaje = meshes[0];
        
        // ESCALA POSITIVA PARA EVITAR ESPEJO
        personaje.scaling = new BABYLON.Vector3(1.7, 1.7, 1.7); 
        personaje.position = new BABYLON.Vector3(0, 0.9, 0); // Pies sobre el asfalto
        personaje.checkCollisions = true;
        personaje.ellipsoid = new BABYLON.Vector3(0.5, 1, 0.5);
        
        camera.lockedTarget = personaje;
        document.getElementById("estado").innerHTML = "✅ PROTAGONISTA LISTO";
        
        // Animación articulada (Brazos y piernas)
        animCaminar = anims[0];
        if (animCaminar) animCaminar.stop();

        // Movimiento por doble clic
        scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOUBLETAP) {
                const pick = scene.pick(scene.pointerX, scene.pointerY, (m) => m === suelo);
                if (pick.hit) { destinoFinal = pick.pickedPoint; moviendoPorClick = true; }
            }
        });

        // Lógica de Movimiento y Cámaras Fijas
        const inputMap = {};
        scene.actionManager = new BABYLON.ActionManager(scene);
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (e) => inputMap[e.sourceEvent.key.toLowerCase()] = true));
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (e) => inputMap[e.sourceEvent.key.toLowerCase()] = false));

        scene.onBeforeRenderObservable.add(() => {
            const vel = 0.4;
            let mov = false;
            let rot = personaje.rotation.y;

            // PERSPECTIVA FIJA: El mouse no mueve la cámara sola mientras caminas
            const keys = ["w", "s", "a", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"];
            if (keys.some(k => inputMap[k])) {
                camera.detachControl(canvas);
                moviendoPorClick = false;
                mov = true;
            } else if (!moviendoPorClick) {
                camera.attachControl(canvas, true);
            }

            // Teclado
            if (inputMap["w"] || inputMap["arrowup"]) { personaje.moveWithCollisions(new BABYLON.Vector3(0, 0, -vel)); rot = Math.PI; }
            if (inputMap["s"] || inputMap["arrowdown"]) { personaje.moveWithCollisions(new BABYLON.Vector3(0, 0, vel)); rot = 0; }
            if (inputMap["a"] || inputMap["arrowleft"]) { personaje.moveWithCollisions(new BABYLON.Vector3(-vel, 0, 0)); rot = -Math.PI / 2; }
            if (inputMap["d"] || inputMap["arrowright"]) { personaje.moveWithCollisions(new BABYLON.Vector3(vel, 0, 0)); rot = Math.PI / 2; }

            // Doble clic
            if (moviendoPorClick && destinoFinal) {
                const d = destinoFinal.subtract(personaje.position);
                d.y = 0;
                if (d.length() > 0.6) {
                    d.normalize();
                    personaje.moveWithCollisions(d.scale(vel));
                    rot = Math.atan2(d.x, d.z) + Math.PI;
                    mov = true;
                } else { moviendoPorClick = false; }
            }

            personaje.rotation.y = BABYLON.Scalar.LerpAngle(personaje.rotation.y, rot, 0.18);
            if (animCaminar) {
                if (mov) { if (!animCaminar.isPlaying) animCaminar.play(true); } 
                else { animCaminar.stop(); }
            }
        });
    }, (evt) => {
        if (evt.lengthComputable) {
            let p = (evt.loaded * 100 / evt.total).toFixed();
            document.getElementById("estado").innerHTML = "📥 RECUPERANDO PROTAGONISTA: " + p + "%";
        }
    });

    return scene;
};

// 5 CÁMARAS PROFESIONALES FIJAS
window.setCam = function(t) {
    if (!camera) return;
    switch(t) {
        case 1: camera.alpha = -Math.PI/2; camera.beta = Math.PI/3; camera.radius = 12; break; // Seguimiento
        case 2: camera.alpha = Math.PI/2; camera.beta = Math.PI/2.5; camera.radius = 10; break; // Frontal
        case 3: camera.alpha = -Math.PI/2; camera.beta = 0.01; camera.radius = 42; break; // Cenital
        case 4: camera.alpha = -Math.PI/3; camera.beta = Math.PI/3.5; camera.radius = 55; break; // General
        case 5: camera.alpha = 0; camera.beta = Math.PI/3; camera.radius = 18; break; // Lateral
    }
}

const scene = crearEscena();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
window.addEventListener("click", () => canvas.focus());
