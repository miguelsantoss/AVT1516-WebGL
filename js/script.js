var gl, gameManager;
var cube = {}, torus = {}, quad = {}, sphere = {};

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
    //cube buffers inicialization
    cube.VertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cube.VertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);
    cube.VertexPositionBuffer.itemSize = 4;
    cube.VertexPositionBuffer.numItems = 24;

    cube.VertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cube.VertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeTextureCoords), gl.STATIC_DRAW);
    cube.VertexTextureCoordBuffer.itemSize = 4;
    cube.VertexTextureCoordBuffer.numItems = 24;

    cube.VertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cube.VertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeNormals), gl.STATIC_DRAW);
    cube.VertexNormalBuffer.itemSize = 4;
    cube.VertexNormalBuffer.numItems = 24;

    cube.VertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.VertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cube.VertexIndexBuffer.itemSize = 1;
    cube.VertexIndexBuffer.numItems = cubeVertexIndices.length;

    //quad buffers inicialization
    quad.VertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad.VertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadVertices), gl.STATIC_DRAW);
    quad.VertexPositionBuffer.itemSize = 4;
    quad.VertexPositionBuffer.numItems = 24;

    quad.VertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad.VertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadTexCoords), gl.STATIC_DRAW);
    quad.VertexTextureCoordBuffer.itemSize = 4;
    quad.VertexTextureCoordBuffer.numItems = 24;

    quad.VertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, quad.VertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(quadNormals), gl.STATIC_DRAW);
    quad.VertexNormalBuffer.itemSize = 4;
    quad.VertexNormalBuffer.numItems = 24;

    quad.VertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, quad.VertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(quadFaceIndex), gl.STATIC_DRAW);
    quad.VertexIndexBuffer.itemSize = 1;
    quad.VertexIndexBuffer.numItems = quadFaceIndex.length;

    var latitudeBands = 30;
    var longitudeBands = 30;
    var radius = 2;

    var vertexPositionData = [];
    var normalData = [];
    var textureCoordData = [];
    for (var latNumber=0; latNumber <= latitudeBands; latNumber++) {
        var theta = latNumber * Math.PI / latitudeBands;
        var sinTheta = Math.sin(theta);
        var cosTheta = Math.cos(theta);

        for (var longNumber=0; longNumber <= longitudeBands; longNumber++) {
            var phi = longNumber * 2 * Math.PI / longitudeBands;
            var sinPhi = Math.sin(phi);
            var cosPhi = Math.cos(phi);

            var x = cosPhi * sinTheta;
            var y = cosTheta;
            var z = sinPhi * sinTheta;
            var u = 1 - (longNumber / longitudeBands);
            var v = 1 - (latNumber / latitudeBands);

            normalData.push(x);
            normalData.push(y);
            normalData.push(z);
            normalData.push(1.0);

            textureCoordData.push(u);
            textureCoordData.push(v);
            textureCoordData.push(1.0);
            textureCoordData.push(1.0);

            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
            vertexPositionData.push(1.0);
        }
    }

    var indexData = [];
    for (var latNumber=0; latNumber < latitudeBands; latNumber++) {
        for (var longNumber=0; longNumber < longitudeBands; longNumber++) {
            var first = (latNumber * (longitudeBands + 1)) + longNumber;
            var second = first + longitudeBands + 1;
            indexData.push(first);
            indexData.push(second);
            indexData.push(first + 1);

            indexData.push(second);
            indexData.push(second + 1);
            indexData.push(first + 1);
        }
    }

    //sphere buffers inicialization
    sphere.VertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.VertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    sphere.VertexPositionBuffer.itemSize = 4;
    sphere.VertexPositionBuffer.numItems = vertexPositionData.length / 4;

    sphere.VertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.VertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    sphere.VertexTextureCoordBuffer.itemSize = 4;
    sphere.VertexTextureCoordBuffer.numItems = textureCoordData.length / 4;

    sphere.VertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.VertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    sphere.VertexNormalBuffer.itemSize = 4;
    sphere.VertexNormalBuffer.numItems = normalData.length / 4;

    sphere.VertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.VertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    sphere.VertexIndexBuffer.itemSize = 1;
    sphere.VertexIndexBuffer.numItems = indexData.length;

    //torus buffers inicialization
    torus.VertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, torus.VertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(torusVertexPositions), gl.STATIC_DRAW);
    torus.VertexPositionBuffer.itemSize = 4;

    torus.VertexTextureBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, torus.VertexTextureBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(torusTextureCoords), gl.STATIC_DRAW);
    torus.VertexTextureBuffer.itemSize = 4;

    torus.VertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, torus.VertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(torusNormals), gl.STATIC_DRAW);
    torus.VertexNormalBuffer.itemSize = 4;

    torus.VertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, torus.VertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(torusIndex), gl.STATIC_DRAW);
    torus.VertexIndexBuffer.itemSize = 1;
    torus.VertexIndexBuffer.numItems = torusIndex.length;
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
    gl.uniformMatrix4fv(shaderProgram.pvm_uniformId, false, projModelViewMatrix);
    gl.uniformMatrix4fv(shaderProgram.vm_uniformId, false, modelViewMatrix);
}

function drawScene() {
    gameManager.draw();
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
    gameManager.loadWorld();

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

    if (currentlyPressedKeys[49]) {
        gameManager.activeCamera = 0;
    }
    else if (currentlyPressedKeys[50]) {
        gameManager.activeCamera = 1;
    }
    else if (currentlyPressedKeys[51]) {

    }
    else if (currentlyPressedKeys[52]) {

    }
}