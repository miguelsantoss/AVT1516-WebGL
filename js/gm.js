function GameManager(width, height) {
	this.width = width;
	this.height = height;

	this.cameras = [];
	this.activeCamera = 1;
	this.cameras.push(new OrthogonalCamera(-5, 65, -5, 65, -10, 10));
	this.cameras.push(new PerspectiveCamera(70, this.width / this.height, 0.1, 100, [0, 1, 0], [1, 1, 1]));

	this.car = new Car([28.7, 1.15, 6.1], [1.0, 0.0, 0.0]);
	this.oranges = [];
	this.createOranges();

	this.world = {};
	this.world.vertexPositionBuffer = null;
	this.world.vertexTextureCoordBuffer = null;

	this.matrices = new MatrixStack();
}

GameManager.prototype.activeCameraProj = function() {
	this.cameras[this.activeCamera].computeProjection();
}

GameManager.prototype.changeActiveCamera = function(newActive) {
	this.activeCamera = newActive;
}

GameManager.prototype.updatePerspectiveCamera = function() {
	var newPosition  = [this.car.position[0] - 2 * this.car.direction[0], this.car.position[1] + 1, this.car.position[2] - 2 * this.car.direction[2]];
	var newDirection = [this.car.position[0] + 5 * this.car.direction[0] - this.cameras[1].camX * this.car.direction[0], this.car.position[1] - this.cameras[1].camY, this.car.position[2] + 5 * this.car.direction[2] - this.cameras[1].camZ * this.car.direction[2]];
	this.cameras[1].updateLookAt(newPosition, newDirection);
}

GameManager.prototype.draw = function() {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    gameManager.updatePerspectiveCamera();
    gameManager.activeCameraProj();

	this.drawWorld();
	this.car.draw();
	for(var i = 0; i < this.oranges.length; i++) {
		this.oranges[i].draw();
	}
}

GameManager.prototype.updateObjs = function(delta_t) {
	this.car.update(delta_t);
	for(var i = 0; i < this.oranges.length; i++) {
		this.oranges[i].update(delta_t);
	}
}

GameManager.prototype.handleLoadedWorldfunc = function(data) {
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

    this.world.vertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.world.vertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexPositions), gl.STATIC_DRAW);
    this.world.vertexPositionBuffer.itemSize = 3;
    this.world.vertexPositionBuffer.numItems = vertexCount;

    this.world.vertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.world.vertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertexTextureCoords), gl.STATIC_DRAW);
    this.world.vertexTextureCoordBuffer.itemSize = 2;
    this.world.vertexTextureCoordBuffer.numItems = vertexCount;
}

GameManager.prototype.loadWorld = function() {
	var request = new XMLHttpRequest();
    request.open("GET", "world.txt");
    request.onreadystatechange = function () {
        if (request.readyState == 4) {
            gameManager.handleLoadedWorldfunc(request.responseText);
        }
    }
    request.send();
}

GameManager.prototype.drawWorld = function() {
	if (this.world.vertexTextureCoordBuffer == null || this.world.vertexPositionBuffer == null) {
        return;
    }
    mat4.identity(modelMatrix);

	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.world.vertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.world.vertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.world.vertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.world.vertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    setMatrixUniforms();
    gl.drawArrays(gl.TRIANGLES, 0, this.world.vertexPositionBuffer.numItems);
}

GameManager.prototype.createOranges = function() {
	this.oranges.push(new Orange([30.7, 1.15, 6.1], [1.0, 0.0, 0.0], [0.0006, 0.0, 0.0]));
	this.oranges.push(new Orange([30.7, 1.15, 6.1], [1.0, 0.0, 1.0], [0.0006, 0.0, 0.0006]));
	this.oranges.push(new Orange([30.7, 1.15, 6.1], [0.0, 0.0, 1.0], [0.0, 0.0, 0.0006]));
}