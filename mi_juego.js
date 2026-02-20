const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

let scene, camera, personaje, animCaminar;
let destinoClick = null; // Para guardar dónde hiciste clic

const crearEscena = function () {
    const scene = new BABYLON.Scene(engine);
    scene.clearColor = new BABYLON.Color3(0.4, 0.5, 0.8); // Cielo azulado
    scene.collisionsEnabled = true;

    // --- 1. CÁMARA Y LUZ (INMEDIATO) ---
    camera = new BABYLON.ArcRotateCamera("Camara", -Math.PI/2, Math.PI/3, 15, BABYLON.Vector3.Zero(), scene);
    camera.attachControl(canvas, true);
    
    const light = new BABYLON.HemisphericLight("Luz", new BABYLON.Vector3(0, 1, 0), scene);
    light.intensity = 1.5;

    // --- 2. EL MAPA (INMEDIATO - NO ESPERA A SERENITO) ---
    const suelo = BABYLON.MeshBuilder.CreateGround("Suelo", {width: 600, height: 600}, scene);
    const matSuelo = new BABYLON.StandardMaterial("MatSuelo", scene);
    matSuelo.diffuseTexture = new BABYLON.Texture("mapa.jpg", scene); // Tu mapa
    matSuelo.specularColor = new BABYLON.Color3(0, 0, 0);
    suelo.material = matSuelo;
    suelo.checkCollisions = true;
    suelo.position.y = -0.05; // Un pelito abajo para que no parpadee

    // --- 3. CARGA DE SERENITO (ASÍNCRONA) ---
    // Usamos timestamp para obligar a descargar la versión nueva si o si
    const urlModelo = "serenito.glb?v=" + new Date().getTime();
    
    document.getElementById("estado").innerHTML = "📥 DESCARGANDO A SERENITO...";

    BABYLON.SceneLoader.ImportMesh("", "./", "serenito.glb", scene, function (meshes, ps, sk, anims) {
        // ESTO SE EJECUTA CUANDO SERENITO TERMINA DE BAJAR (PUEDE TARDAR UNOS SEGUNDOS)
        personaje = meshes[0];
        
        // CORRECCIONES VITALES
        personaje.scaling = new BABYLON.Vector3(1.7, 1.7, 1.7); // Escala positiva (No espejo)
        personaje.position = new BABYLON.Vector3(0, 0.9, 0); // Pies sobre la calle
        personaje.checkCollisions = true;
        personaje.ellipsoid = new BABYLON.Vector3(0.5, 1.0, 0.5); // Cuerpo físico

        // La cámara ahora sí tiene a quién seguir
        camera.lockedTarget = personaje;
        
        // Animaciones
        if (anims && anims.length > 0) {
            animCaminar = anims[0];
            animCaminar.stop();
        }

        document.getElementById("estado").innerHTML = "✅ ¡SERENITO LISTO!";

    }, function (evt) {
        // Barra de progreso
        if (evt.lengthComputable) {
            let porc = (evt.loaded * 100 / evt.total).toFixed(0);
            document.getElementById("estado").innerHTML = "📥 CARGANDO: " + porc + "%";
        }
    });

    // --- 4. CONTROLES (TECLADO Y MOUSE) ---
    const inputMap = {};
    scene.actionManager = new BABYLON.ActionManager(scene);
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyDownTrigger, (e) => inputMap[e.sourceEvent.key.toLowerCase()] = true));
    scene.actionManager.registerAction(new BABYLON.ExecuteCodeAction(BABYLON.ActionManager.OnKeyUpTrigger, (e) => inputMap[e.sourceEvent.key.toLowerCase()] = false));

    // Doble Clic en el suelo
    scene.onPointerObservable.add((pointerInfo) => {
        if (pointerInfo.type === BABYLON.PointerEventTypes.POINTERDOUBLETAP) {
            const pick = scene.pick(scene.pointerX, scene.pointerY, (m) => m === suelo);
            if (pick.hit) {
                destinoClick = pick.pickedPoint;
            }
        }
    });

    // --- 5. BUCLE DE JUEGO (FRAME POR FRAME) ---
    scene.registerBeforeRender(() => {
        if (!personaje) return; // Si Serenito aún no baja, no hacemos nada de esto

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
            dir.y = 0; // Ignorar altura
            if (dir.length() > 0.5) {
                dir.normalize();
                personaje.moveWithCollisions(dir.scale(velocidad));
                rotacion = Math.atan2(dir.x, dir.z) + Math.PI;
                moviendo = true;
            } else {
                destinoClick = null; // Llegó
            }
        }

        // Aplicar giro suave
        personaje.rotation.y = BABYLON.Scalar.LerpAngle(personaje.rotation.y, rotacion, 0.15);

        // Animar si se mueve
        if (animCaminar) {
            if (moviendo) {
                if (!animCaminar.isPlaying) animCaminar.play(true);
            } else {
                animCaminar.stop();
            }
        }
    });

    // EDIFICIOS DE REFERENCIA (Cajas simples)
    function crearEdificio(x, z, w, h, d) {
        const box = BABYLON.MeshBuilder.CreateBox("edif", {width: w, height: h, depth: d}, scene);
        box.position = new BABYLON.Vector3(x, h/2, z);
        box.checkCollisions = true;
        const mat = new BABYLON.StandardMaterial("matEdif", scene);
        mat.diffuseColor = new BABYLON.Color3(0.8, 0.7, 0.6);
        box.material = mat;
    }
    crearEdificio(-45, -30, 24, 12, 34); // Gore
    crearEdificio(0, -60, 30, 22, 45);   // Catedral

    return scene;
};

// FUNCIÓN DE CÁMARAS (Global)
window.setCam = function(tipo) {
    if (!camera) return;
    if (tipo === 1) { camera.alpha = -Math.PI/2; camera.beta = Math.PI/3; camera.radius = 12; } // Seguimiento
    if (tipo === 2) { camera.alpha = Math.PI/2; camera.beta = Math.PI/2.5; camera.radius = 10; } // Frontal
    if (tipo === 3) { camera.alpha = -Math.PI/2; camera.beta = 0.01; camera.radius = 45; } // Cenital
    if (tipo === 4) { camera.alpha = -Math.PI/3; camera.beta = Math.PI/3; camera.radius = 60; } // General
    if (tipo === 5) { camera.alpha = 0; camera.beta = Math.PI/2.2; camera.radius = 15; } // Lateral
};

const scene = crearEscena();
engine.runRenderLoop(() => { scene.render(); });
window.addEventListener("resize", () => { engine.resize(); });
