var gl, gameManager;
var cube = {}, torus = {}, square = {}, sphere = {};

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

function revSmoothNormal2(p, nx, ny, smoothCos, beginEnd) {

    var v1x,v1y,v2x,v2y,x,y,norm;
    var auxX, auxY, angle;

    auxX = p[0] - p[2];
    auxY = p[1] - p[3];
    v1x = -auxY;
    v1y = auxX;
    norm=Math.sqrt((v1x*v1x) + (v1y*v1y));
    v1x /= norm;
    v1y /= norm;

    auxX = p[2] - p[4];
    auxY = p[3] - p[5];
    v2x = -auxY;
    v2y = auxX;
    norm=Math.sqrt((v2x*v2x) + (v2y*v2y));
    v2x /= norm;
    v2y /= norm;

    angle = v1x * v2x + v1y * v2y;

    if (angle > smoothCos) {
        x = v1x + v2x;
        y = v1y + v2y;
    }
    else if (beginEnd == 0) {
        x = v2x;
        y = v2y;
    }
    else  {
        x = v1x;
        y = v1y;
    
    }

    norm=Math.sqrt(x*x+ y*y);
    x /= norm;
    y /= norm;

    nx = x;
    ny = y;
    if (angle > smoothCos)
        return 1;
    else
        return 0;
}

function VAO(numP, p, points, sides, smoothCos, object) {
    var numSides = sides, numPoints = numP + 2;
    var vertex = [];
    var normal = [];
    var textco = [];
    var inc = 2 * Math.PI / sides, nx, ny, delta, smooth, k = 0, smoothness = [];

    for(var i=0; i < numP; i++) {
        revSmoothNormal2(points.slice(i*2),nx,ny, smoothCos, 0);
        for(var j=0; j<=numSides;j++) {

            if ((i == 0 && p[0] == 0.0) || ( i == numP-1 && p[(i+1)*2] == 0.0))
                delta = inc * 0.5;
            else
                delta = 0.0;

            normal[((k)*(numSides+1) + j)*4]   = nx * Math.cos(j*inc+delta);
            normal[((k)*(numSides+1) + j)*4+1] = ny;
            normal[((k)*(numSides+1) + j)*4+2] = nx * Math.sin(-j*inc+delta);
            normal[((k)*(numSides+1) + j)*4+3] = 0.0;

            vertex[((k)*(numSides+1) + j)*4]   = p[i*2] * Math.cos(j*inc);
            vertex[((k)*(numSides+1) + j)*4+1] = p[(i*2)+1];
            vertex[((k)*(numSides+1) + j)*4+2] = p[i*2] * Math.sin(-j*inc);
            vertex[((k)*(numSides+1) + j)*4+3] = 1.0;

            textco[((k)*(numSides+1) + j)*4]   = ((j+0.0)/numSides);
            textco[((k)*(numSides+1) + j)*4+1] = (i+0.0)/(numP-1);
            textco[((k)*(numSides+1) + j)*4+2] = 0;
            textco[((k)*(numSides+1) + j)*4+3] = 1.0;
        }
        k++;
        if (i < numP-1) {
            smooth = revSmoothNormal2(points.slice((i+1)*2),nx,ny, smoothCos, 1);

            if (!smooth) {
                smoothness.push_back(1);
                for(var j=0; j<=numSides;j++) {

                normal[((k)*(numSides+1) + j)*4]   = nx * Math.cos(j*inc);
                normal[((k)*(numSides+1) + j)*4+1] = ny;
                normal[((k)*(numSides+1) + j)*4+2] = nx * Math.sin(-j*inc);
                normal[((k)*(numSides+1) + j)*4+3] = 0.0;

                vertex[((k)*(numSides+1) + j)*4]   = p[(i+1)*2] * Math.cos(j*inc);
                vertex[((k)*(numSides+1) + j)*4+1] = p[((i+1)*2)+1];
                vertex[((k)*(numSides+1) + j)*4+2] = p[(i+1)*2] * Math.sin(-j*inc);
                vertex[((k)*(numSides+1) + j)*4+3] = 1.0;

                textco[((k)*(numSides+1) + j)*4]   = ((j+0.0)/numSides);
                textco[((k)*(numSides+1) + j)*4+1] = (i+1+0.0)/(numP-1);
                textco[((k)*(numSides+1) + j)*4+2] = 0;
                textco[((k)*(numSides+1) + j)*4+3] = 1.0;
                }
                k++;
            }
            else
                smoothness.push(0);
        }
    }
    var faceIndex = [], count = 0;
    k = 0;
    for (var i = 0; i < numP-1; ++i) {
        for (var j = 0; j < numSides; ++j) {
        
            /*if (i != 0 || p[0] != 0.0)*/ {
                faceIndex[count++] = k * (numSides+1) + j;
                faceIndex[count++] = (k+1) * (numSides+1) + j + 1;
                faceIndex[count++] = (k+1) * (numSides+1) + j;
            }
            /*if (i != numP-2 || p[(numP-1)*2] != 0.0)*/ {
                faceIndex[count++] = k * (numSides+1) + j;
                faceIndex[count++] = k * (numSides+1) + j + 1;
                faceIndex[count++] = (k+1) * (numSides+1) + j + 1;
            }

        }
        k++;
        k += smoothness[i]; 
    }

    var numVertices = numP*2 * (numSides+1);
    object.VertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, object.VertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertex), gl.STATIC_DRAW);
    object.VertexPositionBuffer.numItems = vertex.length / 3;
    object.VertexPositionBuffer.itemSize  = 3;

    object.TextureCoordBuffer   = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, object.TextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textco), gl.STATIC_DRAW);
    object.TextureCoordBuffer.numItems = textco.length / 2;
    object.TextureCoordBuffer.itemSize  = 2;

    object.VertexIndexBuffer   = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, object.VertexIndexBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Uint16Array(faceIndex), gl.STATIC_DRAW);
    object.VertexIndexBuffer.numItems = count;
    object.VertexIndexBuffer.itemSize  = 1;

    console.log(torus);
}


function initBuffers() {
    //cube buffers inicialization
    cube.VertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cube.VertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeVertices), gl.STATIC_DRAW);
    cube.VertexPositionBuffer.itemSize = 3;
    cube.VertexPositionBuffer.numItems = 24;

    cube.TextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, cube.TextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(cubeTextureCoords), gl.STATIC_DRAW);
    cube.TextureCoordBuffer.itemSize = 2;
    cube.TextureCoordBuffer.numItems = 24;

    cube.VertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, cube.VertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(cubeVertexIndices), gl.STATIC_DRAW);
    cube.VertexIndexBuffer.itemSize = 1;
    cube.VertexIndexBuffer.numItems = 36;

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
            textureCoordData.push(u);
            textureCoordData.push(v);
            vertexPositionData.push(radius * x);
            vertexPositionData.push(radius * y);
            vertexPositionData.push(radius * z);
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

    sphere.VertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.VertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normalData), gl.STATIC_DRAW);
    sphere.VertexNormalBuffer.itemSize = 3;
    sphere.VertexNormalBuffer.numItems = normalData.length / 3;

    sphere.VertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.VertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(textureCoordData), gl.STATIC_DRAW);
    sphere.VertexTextureCoordBuffer.itemSize = 2;
    sphere.VertexTextureCoordBuffer.numItems = textureCoordData.length / 2;

    sphere.VertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.VertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositionData), gl.STATIC_DRAW);
    sphere.VertexPositionBuffer.itemSize = 3;
    sphere.VertexPositionBuffer.numItems = vertexPositionData.length / 3;

    sphere.VertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.VertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(indexData), gl.STATIC_DRAW);
    sphere.VertexIndexBuffer.itemSize = 1;
    sphere.VertexIndexBuffer.numItems = indexData.length;
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