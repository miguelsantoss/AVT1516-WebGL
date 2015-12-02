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
    this.butters = [];
    this.createButters();
    this.cheerios = [];
    this.createCheerios();

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
    var position = this.car.position.slice();
    var direction = this.car.direction.slice();
	var newPosition  = [position[0] - 2 * direction[0], position[1] + 1, position[2] - 2 * direction[2]];
	var newDirection = [position[0] + 5 * direction[0] - this.cameras[1].camX * direction[0], position[1] - this.cameras[1].camY, position[2] + 5 * direction[2] - this.cameras[1].camZ * direction[2]];
	this.cameras[1].updateLookAt(newPosition, newDirection);
}

GameManager.prototype.draw = function() {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    mat4.identity(modelMatrix);
    mat4.identity(viewMatrix);
    mat4.identity(projectionMatrix);

    gameManager.updatePerspectiveCamera();
    gameManager.activeCameraProj();

	this.drawWorld();
	this.car.draw();
	for(var i = 0; i < this.oranges.length; i++) {
		this.oranges[i].draw();
	}
    for(var i = 0; i < this.butters.length; i++) {
        this.butters[i].draw();
    }
    for(var i = 0; i < this.butters.length; i++) {
        this.cheerios[i].draw();
    }
}

GameManager.prototype.updateObjs = function(delta_t) {
	this.car.update(delta_t);
	for(var i = 0; i < this.oranges.length; i++) {
		this.oranges[i].update(delta_t);
	}
}

GameManager.prototype.loadWorld = function() {
    var worldVertices = [
        -0.5, -0.5, 0.0, 1.0,
         0.5, -0.5, 0.0, 1.0,
         0.5,  0.5, 0.0, 1.0,
        -0.5,  0.5, 0.0, 1.0,
    ];

    var worldNormals = [
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 1.0, 0.0,
        0.0, 0.0, 1.0, 0.0
    ];

    var worldTexCoords = [
        0.0, 0.0, 0.0, 1.0,
        60.0, 0.0, 0.0, 1.0,
        60.0, 60.0, 0.0, 1.0,
        0.0, 60.0, 0.0, 1.0
    ];

    var worldFaceIndex = [
        0,1,2,2,3,0
    ];  

    this.world.VertexPositionBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.world.VertexPositionBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(worldVertices), gl.STATIC_DRAW);
    this.world.VertexPositionBuffer.itemSize = 4;
    this.world.VertexPositionBuffer.numItems = 24;

    this.world.VertexTextureCoordBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.world.VertexTextureCoordBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(worldTexCoords), gl.STATIC_DRAW);
    this.world.VertexTextureCoordBuffer.itemSize = 4;
    this.world.VertexTextureCoordBuffer.numItems = 24;

    this.world.VertexNormalBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, this.world.VertexNormalBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(worldNormals), gl.STATIC_DRAW);
    this.world.VertexNormalBuffer.itemSize = 4;
    this.world.VertexNormalBuffer.numItems = 24;

    this.world.VertexIndexBuffer = gl.createBuffer();
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.world.VertexIndexBuffer);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(worldFaceIndex), gl.STATIC_DRAW);
    this.world.VertexIndexBuffer.itemSize = 1;
    this.world.VertexIndexBuffer.numItems = worldFaceIndex.length;
}

GameManager.prototype.drawWorld = function() {
    gameManager.matrices.pushMatrix(modelID);

    mat4.translate(modelMatrix, modelMatrix, [30,1,30]);
    mat4.scale(modelMatrix, modelMatrix, [60, 60, 60]);
    mat4.rotate(modelMatrix, modelMatrix, Math.PI/2, [1, 0, 0]);

	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.world.VertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.world.VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.world.VertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.world.VertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.world.VertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.world.VertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.world.VertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, this.world.VertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gameManager.matrices.popMatrix(modelID);
}

GameManager.prototype.createOranges = function() {
	this.oranges.push(new Orange([30.7, 2.0, 6.1], [1.0, 0.0, 0.0], [0.0006, 0.0, 0.0]));
	this.oranges.push(new Orange([30.7, 2.0, 6.1], [1.0, 0.0, 1.0], [0.0006, 0.0, 0.0006]));
	this.oranges.push(new Orange([30.7, 2.0, 6.1], [0.0, 0.0, 1.0], [0.0, 0.0, 0.0006]));
}

GameManager.prototype.createButters = function() {
    this.butters.push(new Butter([47.4, 1.0, 17.4]));
    this.butters.push(new Butter([49.3, 1.0, 33.0]));
    this.butters.push(new Butter([37.3, 1.0, 49.8]));
}

GameManager.prototype.createCheerios = function() {
    this.cheerios.push(new Cheerio([29.0, 1.1, 4.0]));
    this.cheerios.push(new Cheerio([29.5, 1.1, 4.0]));
    this.cheerios.push(new Cheerio([30.0, 1.1, 4.0]));
}