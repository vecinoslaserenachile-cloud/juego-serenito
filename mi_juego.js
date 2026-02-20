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

    // 1. CÁMARA ARC ROTATE
    camera = new BABYLON.ArcRotateCamera("camera", -Math.PI/2, Math.PI/3, 14, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    camera.checkCollisions = true;

    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 2.0;

    // 2. EL MAPA (Suelo)
    const suelo = BABYLON.MeshBuilder.CreateGround("suelo", {width: 600, height: 600}, scene);
    const matSuelo = new BABYLON.StandardMaterial("matSuelo", scene);
    matSuelo.diffuseTexture = new BABYLON.Texture("mapa.jpg", scene);
    matSuelo.specularColor = new BABYLON.Color3(0, 0, 0);
    suelo.material = matSuelo;
    suelo.checkCollisions = true;
    suelo.position.y = -0.05;

    // 3. CARGA DE SERENITO (Prioridad Absoluta)
    BABYLON.SceneLoader.ImportMesh("", "./", "serenito.glb?v=" + Date.now(), scene, function (meshes, ps, sk, anims) {
        personaje = meshes[0];
        
        // ESCALA POSITIVA: Así se lee bien LA❤️SERENA y serenito en el sombrero
        personaje.scaling = new BABYLON.Vector3(1.7, 1.7, 1.7); 
        personaje.position = new BABYLON.Vector3(0, 0.9, 0); 
        personaje.checkCollisions = true;
        personaje.ellipsoid = new BABYLON.Vector3(0.5, 0.9, 0.5);
        
        camera.lockedTarget = personaje;
        document.getElementById("estado").innerHTML = "✅ PROTAGONISTA EN POSICIÓN";
        
        animCaminar = anims[0];
        if (animCaminar) animCaminar.stop();

        // DOBLE CLIC PARA CAMINAR
        scene.onPointerObservable.add((pointerInfo) => {
            if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOUBLETAP) {
                const pick = scene.pick(scene.pointerX, scene.pointerY, (m) => m === suelo);
                if (pick.hit) { destinoFinal = pick.pickedPoint; moviendoPorClick = true; }
            }
        });

        const inputMap = {};
        scene.actionManager = new BABYLON.ActionManager(scene);
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (e) => inputMap[e.sourceEvent.key.toLowerCase()] = true));
        scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (e) => inputMap[e.sourceEvent.key.toLowerCase()] = false));

        scene.onBeforeRenderObservable.add(() => {
            const vel = 0.42;
            let moviendo = false;
            let rot = personaje.rotation.y;

            // PERSPECTIVA FIJA: El mouse NO mueve la cámara mientras caminas
            const keys = ["w", "s", "a", "d", "arrowup", "arrowdown", "arrowleft", "arrowright"];
            if (keys.some(k => inputMap[k])) {
                camera.detachControl(canvas);
                moviendoPorClick = false;
                moviendo = true;
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
                    moviendo = true;
                } else { moviendoPorClick = false; }
            }

            personaje.rotation.y = BABYLON.Scalar.LerpAngle(personaje.rotation.y, rot, 0.18);
            if (animCaminar) {
                if (moviendo) { if (!animCaminar.isPlaying) animCaminar.play(true); } 
                else { animCaminar.stop(); }
            }
        });
    }, (evt) => {
        if (evt.lengthComputable) {
            let p = (evt.loaded * 100 / evt.total).toFixed();
            document.getElementById("estado").innerHTML = "📥 CARGANDO SERENITO: " + p + "%";
        }
    });

    return scene;
};

// 5 CÁMARAS PROFESIONALES FIJAS
function setCam(t) {
    if (!camera) return;
    switch(t) {
        case 1: camera.alpha = -Math.PI/2; camera.beta = Math.PI/3; camera.radius = 12; break; 
        case 2: camera.alpha = Math.PI/2; camera.beta = Math.PI/2.5; camera.radius = 10; break;
        case 3: camera.alpha = -Math.PI/2; camera.beta = 0.01; camera.radius = 42; break;
        case 4: camera.alpha = -Math.PI/2.8; camera.beta = Math.PI/3.5; camera.radius = 55; break;
        case 5: camera.alpha = 0; camera.beta = Math.PI/3; camera.radius = 18; break;
    }
}

const scene = crearEscena();
engine.runRenderLoop(() => scene.render());
window.addEventListener("resize", () => engine.resize());
