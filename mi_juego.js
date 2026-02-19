// Configuración inicial del motor 3D
const canvas = document.getElementById("renderCanvas");
const engine = new BABYLON.Engine(canvas, true);

const createScene = function () {
    const scene = new BABYLON.Scene(engine);

    // Cámara: Para rotar con el mouse/dedo
    const camera = new BABYLON.ArcRotateCamera("camera", -Math.PI / 2, Math.PI / 2.5, 10, new BABYLON.Vector3(0, 0, 0), scene);
    camera.attachControl(canvas, true);

    // Luz: Para ver los objetos
    const light = new BABYLON.HemisphericLight("light", new BABYLON.Vector3(1, 1, 0), scene);

    // --- OBJETO DE PRUEBA ---
    // Por ahora es un cubo. Luego lo cambiaremos por la micro Foton.
    const box = BABYLON.MeshBuilder.CreateBox("caja_prueba", {size: 2}, scene);

    return scene;
};

const scene = createScene();

// Bucle que dibuja el juego constantemente
engine.runRenderLoop(function () {
    scene.render();
});

// Ajustar pantalla si cambia el tamaño
window.addEventListener("resize", function () {
    engine.resize();
});