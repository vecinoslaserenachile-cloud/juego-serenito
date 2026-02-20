const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let scene, camera, personaje, animCaminar;
let destinoClick = null; 

const crearEscena = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.4, 0.5, 0.8); // Cielo azulado
    scene.collisionsEnabled = true;

    // --- 1. CÁMARA Y LUZ (ESTO SE CREA INMEDIATAMENTE) ---
    camera = new BABYLON.ArcRotateCamera("Camara", -Math.PI/2, Math.PI/3, 15, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    
    const light = new BABYLON.HemisphericLight("Luz", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1.5;

    // --- 2. EL MAPA (SE CREA INMEDIATAMENTE, NO ESPERA A NADIE) ---
    const suelo = BABYLON.MeshBuilder.CreateGround("Suelo", {width: 600, height: 600}, scene);
    const matSuelo = new BABYLON.StandardMaterial("MatSuelo", scene);
    matSuelo.diffuseTexture = new BABYLON.Texture("mapa.jpg", scene);
    matSuelo.specularColor = new BABYLON.Color3(0, 0, 0);
    suelo.material = matSuelo;
    suelo.checkCollisions = true;
    suelo.position.y = -0.05; 

    // --- 3. CARGA DE SERENITO (ESTO OCURRE EN PARALELO) ---
    // Agrego timestamp para evitar caché viejo
    document.getElementById("estado").innerHTML = "📥 DESCARGANDO A SERENITO...";

    BABYLON.SceneLoader.ImportMesh("", "./", "serenito.glb", scene, function (meshes, ps, sk, anims) {
        // --- ESTO SE EJECUTA SOLO CUANDO SERENITO TERMINA DE BAJAR ---
        personaje = meshes[0];
        
        // CONFIGURACIÓN DEL PERSONAJE
        personaje.scaling = new BABYLON.Vector3(1.7, 1.7, 1.7); // Escala positiva
        personaje.position = new BABYLON.Vector3(0, 0.9, 0); // Pies sobre la calle
        personaje.checkCollisions = true;
        personaje.ellipsoid = new BABYLON.Vector3(0.5, 1.0, 0.5); 

        // Enganchar cámara
        camera.lockedTarget = personaje;
        
        // Animaciones
        if (anims && anims.length > 0) {
            animCaminar = anims[0];
            animCaminar.stop();
        }

        document.getElementById("estado").innerHTML = "✅ ¡SERENITO LISTO!";

    }, function (evt) {
        // Barra de progreso visual
        if (evt.lengthComputable) {
            let porc = (evt.loaded * 100 / evt.total).toFixed(0);
            document.getElementById("estado").innerHTML = "📥 CARGANDO PJ: " + porc + "%";
        }
    });

    // --- 4. CONTROLES ---
    const inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (e) => inputMap[e.sourceEvent.key.toLowerCase()] = true));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (e) => inputMap[e.sourceEvent.key.toLowerCase()] = false));

    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOUBLETAP) {
            const pick = scene.pick(scene.pointerX, scene.pointerY, (m) => m === suelo);
            if (pick.hit) {
                destinoClick = pick.pickedPoint;
            }
        }
    });

    // --- 5. BUCLE DE JUEGO ---
    scene.registerBeforeRender(() => {
        if (!personaje) return; // Si Serenito no ha bajado, solo mostramos el mapa

        let velocidad = 0.4;
        let moviendo = false;
        let rotacion = personaje.rotation.y;

        // Teclado
        if (inputMap["w"] || inputMap["arrowup"]) { personaje.moveWithCollisions(new BABYLON.Vector3(0, 0, -velocidad)); rotacion = Math.PI; moviendo = true; destinoClick = null; }
        if (inputMap["s"] || inputMap["arrowdown"]) { personaje.moveWithCollisions(new BABYLON.Vector3(0, 0, velocidad)); rotacion = 0; moviendo = true; destinoClick = null; }
        if (inputMap["a"] || inputMap["arrowleft"]) { personaje.moveWithCollisions(new BABYLON.Vector3(-velocidad, 0, 0)); rotacion = -Math.PI/2; moviendo = true; destinoClick = null; }
        if (inputMap["d"] || inputMap["arrowright"]) { personaje.moveWithCollisions(new BABYLON.Vector3(velocidad, 0, 0)); rotacion = Math.PI/2; moviendo = true; destinoClick = null; }

        // Mouse (Doble Clic)
        if (destinoClick) {
            let dir = destinoClick.subtract(personaje.position);
            dir.y = 0; 
            if (dir.length() > 0.5) {
                dir.normalize();
                personaje.moveWithCollisions(dir.scale(velocidad));
                rotacion = Math.atan2(dir.x, dir.z) + Math.PI;
                moviendo = true;
            } else {
                destinoClick = null; 
            }
        }

        personaje.rotation.y = BABYLON.Scalar.LerpAngle(personaje.rotation.y, rotacion, 0.15);

        if (animCaminar) {
            if (moviendo) {
                if (!animCaminar.isPlaying) animCaminar.play(true);
            } else {
                animCaminar.stop();
            }
        }
    });

    return scene;
};

// CÁMARAS
window.setCam = function(tipo) {
    if (!camera) return;
    if (tipo === 1) { camera.alpha = -Math.PI/2; camera.beta = Math.PI/3; camera.radius = 12; }
    if (tipo === 2) { camera.alpha = Math.PI/2; camera.beta = Math.PI/2.5; camera.radius = 10; }
    if (tipo === 3) { camera.alpha = -Math.PI/2; camera.beta = 0.01; camera.radius = 45; }
    if (tipo === 4) { camera.alpha = -Math.PI/3; camera.beta = Math.PI/3; camera.radius = 60; }
    if (tipo === 5) { camera.alpha = 0; camera.beta = Math.PI/2.2; camera.radius = 15; }
};

const scene = crearEscena();
engine.runRenderLoop(() => { scene.render(); });
window.addEventListener("resize", () => { engine.resize(); });
