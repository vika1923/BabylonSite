window.addEventListener('DOMContentLoaded', function () {

    var canvas = document.getElementById('canvas');
    var engine = new BABYLON.Engine(canvas, true);

    var createScene = function () {
        var scene = new BABYLON.Scene(engine);
        scene.clearColor = new BABYLON.Color3.Black();

        // Create a box
        var box = BABYLON.Mesh.CreateBox("Box", 4.0, scene);
        var defaultMaterial = new BABYLON.StandardMaterial("material1", scene);
        defaultMaterial.diffuseTexture = new BABYLON.Texture("MCstoneTexture.jpg", scene);
        defaultMaterial.emissiveColor = new BABYLON.Color3(0.2, 0.2, 0.2);
        box.material = defaultMaterial;


        // Idle animation parameters
        var alpha = 0;
        var radius = 20;
        var speedMultiplier = 0.5; // Adjust this multiplier for faster/slower animation
        var idleAnimationRunning = true;
        // Idle animation function
        scene.registerBeforeRender(function () {
            if (idleAnimationRunning) {
                // Calculate positions
                var x = radius * Math.sin(alpha);
                var z = 0;
                var y = radius * Math.sin(2 * alpha) / 2;

                // Calculate speed based on position
                var speedFactor = 1 / (1 + Math.abs(Math.sin(alpha)) * speedMultiplier);
                alpha += 0.013 * speedFactor;

                box.position = new BABYLON.Vector3(x, y, z);
            }
        });

        var lastPosition = null;

        // Move object smoothly along a curved trajectory with a callback
        function moveSmoothly(object, endPoint, duration, callback) {
            var startPosition = object.position.clone();
            var controlPoint = new BABYLON.Vector3(
                (startPosition.x + endPoint.x) / 2,
                Math.max(startPosition.y, endPoint.y) + 5, // Adjust as needed for desired curve height
                (startPosition.z + endPoint.z) / 2
            );

            var startTime = Date.now();

            var move = function () {
                var currentTime = Date.now();
                var elapsedTime = (currentTime - startTime) / 1000; // elapsed time in seconds

                if (elapsedTime < duration) {
                    var t = elapsedTime / duration;

                    // Quadratic Bézier formula: B(t) = (1-t)^2 * P0 + 2(1-t)t * P1 + t^2 * P2
                    var oneMinusT = 1 - t;
                    var newPosition = startPosition.scale(oneMinusT * oneMinusT)
                        .add(controlPoint.scale(2 * oneMinusT * t))
                        .add(endPoint.scale(t * t));

                    object.position = newPosition;
                    requestAnimationFrame(move); // Continue the animation
                } else {
                    object.position = endPoint; // Ensure it ends at the exact endpoint
                    if (callback) {
                        callback(); // Call the callback function when the animation is complete
                    }
                }
            };

            move();
        }

        // Declare lastPosition outside the function scope
        var lastPosition = null;

        // Event handling for clicking the cube
        box.actionManager = new BABYLON.ActionManager(scene);
        box.actionManager.registerAction(new BABYLON.ExecuteCodeAction(
            BABYLON.ActionManager.OnPickTrigger,
            function () {
                if (idleAnimationRunning) {
                    idleAnimationRunning = false;

                    // Save current position
                    lastPosition = box.position.clone();

                    moveSmoothly(box, new BABYLON.Vector3(0, 0, -43), 0.5); // Smoothly move to the endpoint over 0.5 seconds
                } else {
                    if (lastPosition) {
                        moveSmoothly(box, lastPosition, 0.5, function () {
                            idleAnimationRunning = true; // Set to true only after the animation completes
                        });
                    }
                }
            }
        ));


        // Create camera, lights, etc.
        var camera = new BABYLON.ArcRotateCamera("camera1", BABYLON.Tools.ToRadians(270), BABYLON.Tools.ToRadians(90), 50, box.position, scene);
        // camera.attachControl(canvas, true);

        var light2 = new BABYLON.DirectionalLight("light2", new BABYLON.Vector3(-1, 0, 0.3), scene);
        light2.diffuse = new BABYLON.Color3.Red();
        var light3 = new BABYLON.DirectionalLight("light3", new BABYLON.Vector3(1, 0, 0.3), scene);
        light3.diffuse = new BABYLON.Color3.Blue();

        return scene;
    }

    var scene = createScene();
    engine.runRenderLoop(function () {
        scene.render();
    });
});