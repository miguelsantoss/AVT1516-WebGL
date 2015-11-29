var gl, gameManager;
var cube, torus, square, sphere;

function initGL(canvas) {
    try {
        gl = canvas.getContext("experimental-webgl");
        gl.viewportWidth = canvas.width;
        gl.viewportHeight = canvas.height;
    } catch (e) {
    }
    if (!gl) {
        alert("Could not initialise WebGL, sorry :-(");
    }
}


function initBuffers() {
    cube = {};
    cube.cubeVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cube.cubeVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);
    cube.cubeVertexPositionBuffer.itemSize = 3;
    cube.cubeVertexPositionBuffer.numItems = 24;

    cube.cubeTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cube.cubeTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoords), gl.STATIC_DRAW);
    cube.cubeTextureCoordBuffer.itemSize = 2;
    cube.cubeTextureCoordBuffer.numItems = 24;

    cube.cubeVertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.cubeVertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cube.cubeVertexIndexBuffer.itemSize = 1;
    cube.cubeVertexIndexBuffer.numItems = 36;
}
var textures = [];

function loadImage(url, callback) {
  var image = new Image();
  image.src = url;
  image.onload = callback;
  return image;
}

function loadImages(urls, callback) {
  var images = [];
  var imagesToLoad = urls.length;
 
  // Called each time an image finished
  // loading.
  var onImageLoad = function() {
    --imagesToLoad;
    // If all the images are loaded call the callback.
    if (imagesToLoad == 0) {
      callback(images);
    }
  };
 
  for (var i = 0; i < imagesToLoad; ++i) {
    var image = loadImage(urls[i], onImageLoad);
    images.push(image);
  }
}

function createTextures(images) {
    for (var i = 0; i < 2; ++i) {
        var texture = gl.createTexture();
        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, images[i]);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
        // add the texture to the array of textures.
        textures.push(texture);
    }
    document.getElementById("loadingtext").textContent = "";
}

function setMatrixUniforms() {
	computeMatrices();
    gl.uniformMatrix4fv(shaderProgram.pMatrixUniform, false, projectionMatrix);
    gl.uniformMatrix4fv(shaderProgram.mvMatrixUniform, false, modelViewMatrix);
}

var worldVertexPositionBuffer = null;
var worldVertexTextureCoordBuffer = null;

function handleLoadedWorld(data) {
    var lines = data.split("\n");
    var vertexCount = 0;
    var vertexPositions = [];
    var vertexTextureCoords = [];
    for (var i in lines) {
        var vals = lines[i].replace(/^\s+/, "").split(/\s+/);
        if (vals.length == 5 && vals[0] != "//") {
            // It is a line describing a vertex; get X, Y and Z first
            vertexPositions.push(parseFloat(vals[0]));
            vertexPositions.push(parseFloat(vals[1]));
            vertexPositions.push(parseFloat(vals[2]));

            // And then the texture coords
            vertexTextureCoords.push(parseFloat(vals[3]));
            vertexTextureCoords.push(parseFloat(vals[4]));

            vertexCount += 1;
        }
    }

    worldVertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
    worldVertexPositionBuffer.itemSize = 3;
    worldVertexPositionBuffer.numItems = vertexCount;

    worldVertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);
    worldVertexTextureCoordBuffer.itemSize = 2;
    worldVertexTextureCoordBuffer.numItems = vertexCount;
}


function loadWorld() {
    var request = new XMLHttpRequest();
    request.open("GET", "world.txt");
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            handleLoadedWorld(request.responseText);
        }
    }
    request.send();
}



function drawScene() {
    gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    if (worldVertexTextureCoordBuffer == null || worldVertexPositionBuffer == null) {
        return;
    }

    // mat4.perspective(projectionMatrix, 70, gl.viewportWidth / gl.viewportHeight, 0.1, 100.0);
    // mat4.ortho(projectionMatrix, -5, 65, -5, 65, -10, 10);
    // mat4.lookAt(viewMatrix, [0, 5, 0], [0, 0, 0], [1, 0, 0]);
    gameManager.updatePerspectiveCamera();
    gameManager.activeCameraProj();
    mat4.identity(modelMatrix);
    // mat4.identity(viewMatrix);

    // mat4.rotate(viewMatrix, viewMatrix, degToRad(-pitch), [1, 0, 0]);
    // mat4.rotate(viewMatrix, viewMatrix, degToRad(-yaw), [0, 1, 0]);
    // mat4.translate(viewMatrix, viewMatrix, [-xPos, -yPos, -zPos]);
   
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, worldVertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, worldVertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, worldVertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, worldVertexPositionBuffer.numItems);
    gameManager.drawObjects();
}


var lastTime = 0;
// Used to make us "jog" up and down as we move forward.
var joggingAngle = 0;

function animate() {
    var timeNow = new Date().getTime();
    if (lastTime != 0) {
        var elapsed = timeNow - lastTime;
        gameManager.updateObjs(elapsed);
        }
    lastTime = timeNow;
}


function tick() {
    requestAnimFrame(tick);
    handleKeys();
    drawScene();
    animate();
}



function webGLStart() {

    var canvas = document.getElementById("micromachines-canvas");
    initGL(canvas);
  	gameManager = new GameManager(gl.viewportWidth, gl.viewportHeight);
    loadImages(["resources/tiled.gif", "resources/lightwood.gif"], createTextures);
    initBuffers();
    initShaders();
    loadWorld();

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.enable(gl.DEPTH_TEST);

    document.onkeydown = handleKeyDown;
    document.onkeyup   = handleKeyUp;

    tick();
}

var currentlyPressedKeys = {};

function handleKeyDown(event) {
    currentlyPressedKeys[event.keyCode] = true;
}


function handleKeyUp(event) {
    currentlyPressedKeys[event.keyCode] = false;
}

function handleKeys() {
    if (currentlyPressedKeys[81] || currentlyPressedKeys[38]) { //Q or up arrow
        gameManager.car.acceleration_input =  1;
    } 
    else if (currentlyPressedKeys[65] || currentlyPressedKeys[40]) { //A or down arrow
        gameManager.car.acceleration_input = -1;
    }
    else {
        gameManager.car.acceleration_input =  0;
    }


    if (currentlyPressedKeys[79] || currentlyPressedKeys[37]) { //O or left arrow
        gameManager.car.steer_input =  -3;
        gameManager.car.weel_angle  =  25;
    } 
    else if (currentlyPressedKeys[80] || currentlyPressedKeys[39]) { //P or right arrow
        gameManager.car.steer_input =   3;
        gameManager.car.weel_angle  = -25;
    }
    else {
        gameManager.car.steer_input =   0;
        gameManager.car.weel_angle  =   0;
    }

}