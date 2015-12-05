function GameManager(width, height) {
	this.width          = width;
	this.height         = height;
    this.lives          = 5;
    this.gameOver       = false;
    this.pause          = false;

    this.fog            = {};
    this.fog.dayColor   = [0.46, 0.82, 0.97, 1.00];
    this.fog.nightColor = [0.00, 0.06, 0.16, 1.00];
    this.fog.color      = [];
    this.fog.state      = false;
    this.fog.density    = 0.077;
    this.fog.mode       = 1;
    this.day            = true;


    this.createCameras();
    this.createObjects();
    this.createLights();

	this.matrices = new MatrixStack();
    // gl.depthFunc(gl.LESS);
}

GameManager.prototype.activeCameraProj = function() {
	this.cameras[this.activeCamera].computeProjection();
}

GameManager.prototype.changeActiveCamera = function(newActive) {
	this.activeCamera = newActive;
}

GameManager.prototype.updatePerspectiveCamera = function() {
    var position     = this.car.position.slice();
    var direction    = this.car.direction.slice();
	var newPosition  = [position[0] - 2 * direction[0], position[1] + 1, position[2] - 2 * direction[2]];
	var newDirection = [position[0] + 5 * direction[0] - this.cameras[1].camX * direction[0], position[1] - this.cameras[1].camY, position[2] + 5 * direction[2] - this.cameras[1].camZ * direction[2]];
	this.cameras[1].updateLookAt(newPosition, newDirection);
}

GameManager.prototype.draw = function() {
	gl.viewport(0, 0, gl.viewportWidth, gl.viewportHeight);
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    this.setUpFog();

    mat4.identity(modelMatrix);
    mat4.identity(viewMatrix);
    mat4.identity(projectionMatrix);

    gameManager.updatePerspectiveCamera();
    gameManager.activeCameraProj();
    gameManager.setUpLightsUniforms();

    gl.uniform1i(shaderProgram.particleMode, 0);
    gl.uniform1i(shaderProgram.texMode, 1);
    gl.uniform1i(shaderProgram.tex_loc_1, 0);
    gl.uniform1i(shaderProgram.texUse, 1);
    gl.uniform3fv(shaderProgram.uniColor, [1.0, 1.0, 1.0]);


	this.drawWorld();

	for(var i = 0; i < this.oranges.length; i++) {
		this.oranges[i].draw();
	}
    for(var i = 0; i < this.butters.length; i++) {
        this.butters[i].draw();
    }
    for(var i = 0; i < this.cheerios.length; i++) {
        this.cheerios[i].draw();
    }
    for(var i = 0; i < this.trees.length; i++) {
        this.trees[i].draw();
    }
    this.car.draw();
}

GameManager.prototype.update = function(delta_t) {
    if (this.pause || this.gameOver) return;
    this.car.update(delta_t);
    this.updateHeadLights();
    if (!this.car.checkInside(this.world)) {
        this.lives--;
        if (this.lives <= 0)
            this.gameOver = true;
        else
            this.restartCar();
    }

    for(var i = 0; i < this.oranges.length; i++) {
        if (this.car.checkCollision(this.oranges[i])) {
            this.lives--;
            if (this.lives <= 0)
                this.gameOver = true;
            else
                this.restartCar();
        }
        this.oranges[i].update(delta_t);
        if (!this.oranges[i].checkInside(this.world)) {
            this.oranges[i].resetOrangeInside(this.world);
        }
    }
    for(var i = 0; i < this.butters.length; i++) {
        if (this.car.checkCollision(this.butters[i])) {
            this.butters[i].dealColision(this.car);
            this.car.dealColision();
        }
        this.butters[i].update(delta_t);
    }
    for(var i = 0; i < this.cheerios.length; i++) {
        if (this.car.checkCollision(this.cheerios[i])) {
            this.cheerios[i].dealColision(this.car);
            this.car.dealColision();
        }
        this.cheerios[i].update(delta_t);
    }


}

GameManager.prototype.loadWorld = function() {
    this.world = {};
    this.world.vertexPositionBuffer = null;
    this.world.vertexTextureCoordBuffer = null;
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


    this.world.material = {};
    this.world.material.ambient    = [0.94, 0.94, 0.94, 1.00];
    this.world.material.diffuse    = [0.94, 0.94, 0.94, 1.00];
    this.world.material.specular   = [0.94, 0.94, 0.94, 1.00];
    this.world.material.emissive   = [0.00, 0.00, 0.00, 1.00];
    this.world.material.shininess  = 100.0;
    this.world.material.texCount   = 0;

    this.world.XMin = 0.00;
    this.world.XMax = 60.0;
    this.world.ZMin = 0.00;
    this.world.ZMax = 60.0;

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

    mat4.translate(modelMatrix, modelMatrix, [30, 1, 30]);
    mat4.scale(modelMatrix, modelMatrix, [60, 60, 60]);
    mat4.rotate(modelMatrix, modelMatrix, Math.PI/2, [1, 0, 0]);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[0]);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    gl.uniform1i(shaderProgram.texmap1, 0);
    gl.uniform1i(shaderProgram.texmap2, 1);
    gl.uniform1i(shaderProgram.texMode, 2);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.world.VertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, this.world.VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.world.VertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, this.world.VertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, this.world.VertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, this.world.VertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.ambient"),  this.world.material.ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.diffuse"),  this.world.material.diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.specular"), this.world.material.specular);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.emissive"), this.world.material.emissive);
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "mat.shininess"), this.world.material.shininess);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.world.VertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, this.world.VertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.uniform1i(shaderProgram.texMode, 1);

    gameManager.matrices.popMatrix(modelID);
}

GameManager.prototype.createObjects = function() {
    this.loadWorld();
    this.car = new Car([28.7, 1.15, 6.1], [1.0, 0.0, 0.0]);
    this.oranges = [];
    this.createOranges();
    this.butters = [];
    this.createButters();
    this.cheerios = [];
    this.createCheerios();
    this.trees = [];
    this.createTreeBillboards();
}

GameManager.prototype.createCameras = function() {
    this.cameras = [];
    this.activeCamera = 1;
    this.cameras.push(new OrthogonalCamera(-5, 65, -5, 65, -10, 10));
    this.cameras.push(new PerspectiveCamera(degToRad(75), this.width / this.height, 0.1, 100, [0, 1, 0], [1, 1, 1]));
}

GameManager.prototype.createOranges = function() {
	this.oranges.push(new Orange([50.7, 2.0, 6.1], [1.0, 0.0, 0.0], [0.00125, 0.0, 0.0]));
	this.oranges.push(new Orange([30.7, 2.0, 6.1], [1.0, 0.0, 1.0], [0.00125, 0.0, 0.00125]));
	this.oranges.push(new Orange([30.7, 2.0, 6.1], [0.0, 0.0, 1.0], [0.0, 0.0, 0.00125]));
    this.oranges.push(new Orange(this.world));
    this.oranges.push(new Orange(this.world));
    this.oranges.push(new Orange(this.world));
    this.oranges.push(new Orange(this.world));
    this.oranges.push(new Orange(this.world));
}

GameManager.prototype.createButters = function() {
    this.butters.push(new Butter([47.4, 1.0, 17.4]));
    this.butters.push(new Butter([49.3, 1.0, 33.0]));
    this.butters.push(new Butter([37.3, 1.0, 49.8]));
}

GameManager.prototype.createCheerios = function() {
	//29.0f, 29.5f, 30.0f, 29.0f, 29.5f, 30.0f, 33.0f, 36.0f, 39.0f, 42.0f, 45.0f, 48.0f, 51.0f, 53.0f, 54.0f, 54.4f, 53.8f, 33.0f, 36.0f, 39.0f,
	//4.0f, 4.0f, 4.0f, 9.0f, 9.0f, 9.0f, 3.8f, 3.6f, 3.4f, 3.2f, 3.0f, 3.4f, 4.6f, 5.8f, 8.0f, 11.0f, 14.0f, 8.8f, 8.6f, 8.4f,

		this.cheerios.push(new Cheerio([29.0, 1.1, 4.0]));
    this.cheerios.push(new Cheerio([29.5, 1.1, 4.0]));
    this.cheerios.push(new Cheerio([30.0, 1.1, 4.0]));
		this.cheerios.push(new Cheerio([29.0, 1.1, 9.0]));
		this.cheerios.push(new Cheerio([29.5, 1.1, 9.0]));
		this.cheerios.push(new Cheerio([30.0, 1.1, 9.0]));
		this.cheerios.push(new Cheerio([33.0, 1.1, 3.8]));
		this.cheerios.push(new Cheerio([36.0, 1.1, 3.6]));
		this.cheerios.push(new Cheerio([39.0, 1.1, 3.4]));
		this.cheerios.push(new Cheerio([42.0, 1.1, 3.2]));
		this.cheerios.push(new Cheerio([45.0, 1.1, 3.0]));
		this.cheerios.push(new Cheerio([48.0, 1.1, 3.4]));
		this.cheerios.push(new Cheerio([51.0, 1.1, 4.6]));
		this.cheerios.push(new Cheerio([53.0, 1.1, 5.8]));
		this.cheerios.push(new Cheerio([54.0, 1.1, 8.0]));
		this.cheerios.push(new Cheerio([54.4, 1.1, 11.0]));
		this.cheerios.push(new Cheerio([53.8, 1.1, 14.0]));
		this.cheerios.push(new Cheerio([33.0, 1.1, 8.8]));
		this.cheerios.push(new Cheerio([36.0, 1.1, 8.6]));
		this.cheerios.push(new Cheerio([39.0, 1.1, 8.4]));
//		 42.0f, 45.0f, 47.0f, 47.0f,  52.8f, 45.6f, 42.0f, 50.6f, 48.4f, 45.0f, 42.9f, 42.7f, 39.1f, 37.1f, 36.1f, 36.1f, 38.3f, 40.4f, 42.9f,
// 8.2f, 8.0f, 9.4f, 12.0f, 15.0f, 13.7f, 13.8f, 17.3f, 17.9f, 18.6f, 19.6f, 21.9f, 14.9f, 17.6f, 20.8f, 23.9f, 26.8f, 28.9f, 30.4f,
		this.cheerios.push(new Cheerio([42.0, 1.1, 8.2]));
		this.cheerios.push(new Cheerio([45.0, 1.1, 8.0]));
		this.cheerios.push(new Cheerio([47.0, 1.1, 9.4]));
		this.cheerios.push(new Cheerio([47.0, 1.1, 12.0]));
		this.cheerios.push(new Cheerio([52.8, 1.1, 15.0]));
		this.cheerios.push(new Cheerio([45.6, 1.1, 13.7]));
		this.cheerios.push(new Cheerio([42.0, 1.1, 13.8]));
		this.cheerios.push(new Cheerio([50.6, 1.1, 17.3]));
		this.cheerios.push(new Cheerio([48.4, 1.1, 17.9]));
		this.cheerios.push(new Cheerio([45.0, 1.1, 18.6]));
		this.cheerios.push(new Cheerio([42.9, 1.1, 19.6]));
		this.cheerios.push(new Cheerio([42.7, 1.1, 21.9]));
		this.cheerios.push(new Cheerio([39.1, 1.1, 14.9]));
		this.cheerios.push(new Cheerio([37.1, 1.1, 17.6]));
		this.cheerios.push(new Cheerio([36.1, 1.1, 20.8]));
		this.cheerios.push(new Cheerio([36.1, 1.1, 23.9]));
		this.cheerios.push(new Cheerio([38.3, 1.1, 26.8]));
		this.cheerios.push(new Cheerio([40.4, 1.1, 28.9]));
		this.cheerios.push(new Cheerio([42.9, 1.1, 30.4]));
//		44.0f, 45.6f, 47.7f, 49.6f, 51.4f, 51.9f, 44.7f, 44.0f, 51.4f, 51.8f, 51.0f, 49.6f, 44.0f, 43.0f, 39.3f, 45.8f, 42.7f, 39.8f, 35.5f,
//  33.6f, 24.3f, 27.3f, 30.7f, 33.3f, 36.7f, 37.2f, 39.0f, 39.4f, 42.3f, 45.0f, 47.8f, 41.7f, 44.8f, 45.5f, 49.6f, 50.5f, 50.8f, 44.8f,
		this.cheerios.push(new Cheerio([44.0, 1.1, 33.6]));
		this.cheerios.push(new Cheerio([45.6, 1.1, 24.3]));
		this.cheerios.push(new Cheerio([47.7, 1.1, 27.3]));
		this.cheerios.push(new Cheerio([49.6, 1.1, 30.7]));
		this.cheerios.push(new Cheerio([51.4, 1.1, 33.3]));
		this.cheerios.push(new Cheerio([51.9, 1.1, 36.7]));
		this.cheerios.push(new Cheerio([44.7, 1.1, 37.2]));
		this.cheerios.push(new Cheerio([44.0, 1.1, 39.0]));
		this.cheerios.push(new Cheerio([51.4, 1.1, 39.4]));
		this.cheerios.push(new Cheerio([51.8, 1.1, 42.3]));
		this.cheerios.push(new Cheerio([51.0, 1.1, 45.0]));
		this.cheerios.push(new Cheerio([49.6, 1.1, 47.8]));
		this.cheerios.push(new Cheerio([44.0, 1.1, 41.7]));
		this.cheerios.push(new Cheerio([43.0, 1.1, 44.8]));
		this.cheerios.push(new Cheerio([39.3, 1.1, 45.5]));
		this.cheerios.push(new Cheerio([45.8, 1.1, 49.6]));
		this.cheerios.push(new Cheerio([42.7, 1.1, 50.5]));
		this.cheerios.push(new Cheerio([39.8, 1.1, 50.8]));
		this.cheerios.push(new Cheerio([35.5, 1.1, 44.8]));
//		 33.5f, 30.6f, 37.5f, 36.9f, 29.9f, 30.0f, 27.0f, 35.8f, 33.6f, 31.6f, 28.1f, 23.6f,
//44.8f, 47.1f, 52.0f, 54.9f, 50.2f, 53.7f, 55.2f, 57.9f, 59.3f, 61.6f, 61.9f, 54.9f,
		this.cheerios.push(new Cheerio([33.5, 1.1, 44.8]));
		this.cheerios.push(new Cheerio([30.6, 1.1, 47.1]));
		this.cheerios.push(new Cheerio([37.5, 1.1, 52.0]));
		this.cheerios.push(new Cheerio([36.9, 1.1, 54.9]));
		this.cheerios.push(new Cheerio([29.9, 1.1, 50.2]));
		this.cheerios.push(new Cheerio([30.0, 1.1, 53.7]));
		this.cheerios.push(new Cheerio([27.0, 1.1, 55.2]));
		this.cheerios.push(new Cheerio([35.8, 1.1, 57.9]));
		this.cheerios.push(new Cheerio([33.6, 1.1, 59.3]));
		this.cheerios.push(new Cheerio([31.6, 1.1, 61.6]));
		this.cheerios.push(new Cheerio([28.1, 1.1, 61.9]));
		this.cheerios.push(new Cheerio([23.6, 1.1, 54.9]));
//20.6f, 18.2f, 24.1f, 20.5f, 17.5f, 14.7f, 11.4f, 8.7f, 15.9f, 16.3f, 18.3f, 8.5f,
//54.8f, 54.4f, 61.1f, 60.4f, 60.3f, 59.9f, 58.7f, 55.8f, 52.6f, 50.0f, 48.6f,
		this.cheerios.push(new Cheerio([20.6, 1.1, 54.8]));
		this.cheerios.push(new Cheerio([18.2, 1.1, 54.4]));
		this.cheerios.push(new Cheerio([24.1, 1.1, 61.1]));
		this.cheerios.push(new Cheerio([20.5, 1.1, 60.4]));
		this.cheerios.push(new Cheerio([17.5, 1.1, 60.3]));
		this.cheerios.push(new Cheerio([14.7, 1.1, 59.9]));
		this.cheerios.push(new Cheerio([11.4, 1.1, 58.7]));
		this.cheerios.push(new Cheerio([8.7, 1.1, 55.8]));
		this.cheerios.push(new Cheerio([15.9, 1.1, 52.6]));
		this.cheerios.push(new Cheerio([16.3, 1.1, 50.0]));
		this.cheerios.push(new Cheerio([8.5, 1.1, 48.6]));
//9.2f, 11.3f, 13.5f, 16.7f, 21.9f, 25.6f, 28.3f, 29.2f, 19.0f, 20.8f, 20.4f, 18.4f, 28.5f, 26.4f, 15.2f, 12.0f, 8.9f, 24.9f, 22.7f, 19.3f,
// 52.3f, 49.2f, 45.7f, 44.1f, 42.6f, 47.2f, 45.3f, 42.9f, 40.7f, 41.0f, 39.3f, 35.8f, 33.6f, 37.4f, 34.4f, 32.0f, 31.9f, 31.9f, 31.3f, 29.4f,
		this.cheerios.push(new Cheerio([9.2, 1.1, 52.3]));
		this.cheerios.push(new Cheerio([11.3, 1.1, 49.2]));
		this.cheerios.push(new Cheerio([13.5, 1.1, 45.7]));
		this.cheerios.push(new Cheerio([16.7, 1.1, 44.1]));
		this.cheerios.push(new Cheerio([21.9, 1.1, 42.6]));
		this.cheerios.push(new Cheerio([25.6, 1.1, 47.2]));
		this.cheerios.push(new Cheerio([28.3, 1.1, 45.3]));
		this.cheerios.push(new Cheerio([29.2, 1.1, 42.9]));
		this.cheerios.push(new Cheerio([19.0, 1.1, 40.7]));
		this.cheerios.push(new Cheerio([20.8, 1.1, 41.0]));
		this.cheerios.push(new Cheerio([20.4, 1.1, 39.3]));
		this.cheerios.push(new Cheerio([18.4, 1.1, 35.8]));
		this.cheerios.push(new Cheerio([28.5, 1.1, 33.6]));
		this.cheerios.push(new Cheerio([26.4, 1.1, 37.4]));
		this.cheerios.push(new Cheerio([15.2, 1.1, 34.4]));
		this.cheerios.push(new Cheerio([12.0, 1.1, 32.0]));
		this.cheerios.push(new Cheerio([8.9, 1.1, 31.9]));
		this.cheerios.push(new Cheerio([24.9, 1.1, 31.9]));
		this.cheerios.push(new Cheerio([22.7, 1.1, 31.3]));
		this.cheerios.push(new Cheerio([19.3, 1.1, 29.4]));
//	16.0f, 13.4f, 11.3f, 5.3f, 3.3f, 1.8f, 1.6f, 1.1f, 9.3f, 8.6f, 7.8f, 7.9f, 0.9f, 1.4f, 1.7f, 8.9f, 10.7f, 12.2f, 14.3f, 17.5f, 19.9f,
//28.5f, 27.2f, 26.6f, 26.5f, 31.4f, 29.7f, 27.9f, 25.2f, 22.9f, 25.3f, 23.5f, 21.0f, 18.9f, 20.2f, 18.5f, 16.9f, 16.6f, 14.6f, 13.2f, 11.7f, 10.5f,
		this.cheerios.push(new Cheerio([16.0, 1.1, 28.5]));
		this.cheerios.push(new Cheerio([13.4, 1.1, 27.2]));
		this.cheerios.push(new Cheerio([11.3, 1.1, 26.6]));
		this.cheerios.push(new Cheerio([5.3, 1.1, 26.5]));
		this.cheerios.push(new Cheerio([3.3, 1.1, 31.4]));
		this.cheerios.push(new Cheerio([1.8, 1.1, 29.7]));
		this.cheerios.push(new Cheerio([1.6, 1.1, 27.9]));
		this.cheerios.push(new Cheerio([1.1, 1.1, 25.2]));
		this.cheerios.push(new Cheerio([9.3, 1.1, 22.9]));
		this.cheerios.push(new Cheerio([8.6, 1.1, 25.3]));
		this.cheerios.push(new Cheerio([7.8, 1.1, 23.5]));
		this.cheerios.push(new Cheerio([7.9, 1.1, 21.0]));
		this.cheerios.push(new Cheerio([0.9, 1.1, 18.9]));
		this.cheerios.push(new Cheerio([1.4, 1.1, 20.2]));
		this.cheerios.push(new Cheerio([1.7, 1.1, 18.5]));
		this.cheerios.push(new Cheerio([8.9, 1.1, 16.9]));
		this.cheerios.push(new Cheerio([10.7, 1.1, 16.6]));
		this.cheerios.push(new Cheerio([12.2, 1.1, 14.6]));
		this.cheerios.push(new Cheerio([14.3, 1.1, 13.2]));
		this.cheerios.push(new Cheerio([17.5, 1.1, 11.7]));
		this.cheerios.push(new Cheerio([19.9, 1.1, 10.5]));
// 22.6f, 26.2f, 25.8f, 22.9f, 19.3f, 16.8f, 13.5f, 10.7f, 8.1f, 6.2f, 4.4f, 2.9f};
//9.6f, 9.4f, 8.9f, 3.7f, 4.0f, 3.9f, 4.6f, 5.2f, 6.8f, 8.5f, 10.5f, 12.6f, 14.9f};
		this.cheerios.push(new Cheerio([22.6, 1.1, 9.6]));
		this.cheerios.push(new Cheerio([26.2, 1.1, 9.4]));
		this.cheerios.push(new Cheerio([25.8, 1.1, 8.9]));
		this.cheerios.push(new Cheerio([22.9, 1.1, 3.7]));
		this.cheerios.push(new Cheerio([19.3, 1.1, 4.0]));
		this.cheerios.push(new Cheerio([16.8, 1.1, 3.9]));
		this.cheerios.push(new Cheerio([13.5, 1.1, 4.6]));
		this.cheerios.push(new Cheerio([10.7, 1.1, 5.2]));
		this.cheerios.push(new Cheerio([8.1, 1.1, 6.8]));
		this.cheerios.push(new Cheerio([6.2, 1.1, 8.5]));
		this.cheerios.push(new Cheerio([4.4, 1.1, 10.5]));
		this.cheerios.push(new Cheerio([2.9, 1.1, 12.6]));
}

GameManager.prototype.createTreeBillboards = function() {
    this.trees.push(new TreeBillboard([35, 2.5, 6.1], textures[1]));
}

GameManager.prototype.createLights = function() {
    var candleAmbientComp     = [1.00, 0.57, 0.16, 1.00];
    var candleDiffuseComp     = [1.00, 1.00, 1.00, 1.00];
    var candleSpecularComp    = [1.00, 1.00, 1.00, 1.00];

    var headLightAmbientComp  = [0.78, 0.88, 1.00, 1.00];
    var headLightDiffuseComp  = [1.00, 1.00, 1.00, 1.00];
    var headLightSpecularComp = [1.00, 1.00, 1.00, 1.00];


    var candleConstantAttenuation     = 0.05;
    var candleLinearAttenuation       = 0;
    var candleQuadraticAttenuation    = 0.17;

    var headLightConstantAttenuation  = 0.01;
    var headLightLinearAttenuation    = 0;
    var headLightQuadraticAttenuation = 0.10;

    var headLightCutOff               = 70.0;
    var headLightExponent             = 4.00;

    var headLightsBasePosition = this.car.position.slice();
    var headLightLEFT          = [headLightsBasePosition[0] + 0.55, headLightsBasePosition[1], headLightsBasePosition[2] - 0.15, 0];
    var headLightRIGHT         = [headLightsBasePosition[0] + 0.55, headLightsBasePosition[1], headLightsBasePosition[2] + 0.15, 0];
    var headLightDirection     = [2.00, -0.7, 0.00, 0.00];

    this.lights = {};
    this.lights.directional    = [];
    this.lights.pointLights    = [];
    this.lights.spotLights     = [];
    this.lights.directional.push(new DirectionalLight([1.0, -1.0, 0.0, 0.0], [0.4, 0.4, 0.4, 1.0], [0.3, 0.3, 0.3, 1.0], [0.3, 0.3, 0.3, 1.0], ON));

    this.lights.pointLights.push(new PointLight([44.2, 2.0, 10.9, 1.0], candleAmbientComp, candleDiffuseComp, candleSpecularComp, candleConstantAttenuation, candleLinearAttenuation, candleQuadraticAttenuation, OFF));
    this.lights.pointLights.push(new PointLight([42.0, 2.0, 33.8, 1.0], candleAmbientComp, candleDiffuseComp, candleSpecularComp, candleConstantAttenuation, candleLinearAttenuation, candleQuadraticAttenuation, OFF));
    this.lights.pointLights.push(new PointLight([27.4, 2.0, 52.2, 1.0], candleAmbientComp, candleDiffuseComp, candleSpecularComp, candleConstantAttenuation, candleLinearAttenuation, candleQuadraticAttenuation, OFF));
    this.lights.pointLights.push(new PointLight([19.0, 2.0, 38.7, 1.0], candleAmbientComp, candleDiffuseComp, candleSpecularComp, candleConstantAttenuation, candleLinearAttenuation, candleQuadraticAttenuation, OFF));
    this.lights.pointLights.push(new PointLight([9.3 , 2.0, 22.2, 1.0], candleAmbientComp, candleDiffuseComp, candleSpecularComp, candleConstantAttenuation, candleLinearAttenuation, candleQuadraticAttenuation, OFF));
    this.lights.pointLights.push(new PointLight([25.2, 2.0, 9.9,  1.0], candleAmbientComp, candleDiffuseComp, candleSpecularComp, candleConstantAttenuation, candleLinearAttenuation, candleQuadraticAttenuation, OFF));

    this.lights.spotLights.push(new SpotLight(headLightLEFT,  headLightDirection, headLightAmbientComp, headLightDiffuseComp, headLightSpecularComp, headLightConstantAttenuation, headLightLinearAttenuation, headLightQuadraticAttenuation, headLightCutOff, headLightExponent, ON));
    this.lights.spotLights.push(new SpotLight(headLightRIGHT, headLightDirection, headLightAmbientComp, headLightDiffuseComp, headLightSpecularComp, headLightConstantAttenuation, headLightLinearAttenuation, headLightQuadraticAttenuation, headLightCutOff, headLightExponent, ON));
}

GameManager.prototype.setUpLightsUniforms = function() {
    var aux4 = [], aux3 = [];
    multMatrixPoint(viewMatrix, this.lights.directional[0].direction, aux4);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[0].direction"),            aux4);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[0].ambient"),              this.lights.directional[0].ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[0].diffuse"),              this.lights.directional[0].diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[0].specular"),             this.lights.directional[0].specular);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[0].isEnabled"),            this.lights.directional[0].isEnabled);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[0].isLocal"),              this.lights.directional[0].isLocal);

    multMatrixPoint(viewMatrix, this.lights.pointLights[0].position, aux4);
    aux3 = [aux4[0], aux4[1], aux4[2]];
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[1].position_point"),       aux3);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[1].ambient"),              this.lights.pointLights[0].ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[1].diffuse"),              this.lights.pointLights[0].diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[1].specular"),             this.lights.pointLights[0].specular);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[1].isLocal"),              this.lights.pointLights[0].isLocal);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[1].isSpot"),               this.lights.pointLights[0].isSpot);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[1].isEnabled"),            this.lights.pointLights[0].isEnabled);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[1].constantAttenuation"),  this.lights.pointLights[0].constantAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[1].linearAttenuation"),    this.lights.pointLights[0].linearAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[1].quadraticAttenuation"), this.lights.pointLights[0].quadraticAttenuation);

    multMatrixPoint(viewMatrix, this.lights.pointLights[1].position, aux4);
    aux3 = [aux4[0], aux4[1], aux4[2]];
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[2].position_point"),       aux3);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[2].ambient"),              this.lights.pointLights[1].ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[2].diffuse"),              this.lights.pointLights[1].diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[2].specular"),             this.lights.pointLights[1].specular);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[2].isLocal"),              this.lights.pointLights[1].isLocal);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[2].isSpot"),               this.lights.pointLights[1].isSpot);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[2].isEnabled"),            this.lights.pointLights[1].isEnabled);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[2].constantAttenuation"),  this.lights.pointLights[1].constantAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[2].linearAttenuation"),    this.lights.pointLights[1].linearAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[2].quadraticAttenuation"), this.lights.pointLights[1].quadraticAttenuation);

    multMatrixPoint(viewMatrix, this.lights.pointLights[2].position, aux4);
    aux3 = [aux4[0], aux4[1], aux4[2]];
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[3].position_point"),       aux3);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[3].ambient"),              this.lights.pointLights[2].ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[3].diffuse"),              this.lights.pointLights[2].diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[3].specular"),             this.lights.pointLights[2].specular);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[3].isLocal"),              this.lights.pointLights[2].isLocal);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[3].isSpot"),               this.lights.pointLights[2].isSpot);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[3].isEnabled"),            this.lights.pointLights[2].isEnabled);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[3].constantAttenuation"),  this.lights.pointLights[2].constantAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[3].linearAttenuation"),    this.lights.pointLights[2].linearAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[3].quadraticAttenuation"), this.lights.pointLights[2].quadraticAttenuation);

    multMatrixPoint(viewMatrix, this.lights.pointLights[3].position, aux4);
    aux3 = [aux4[0], aux4[1], aux4[2]];
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[4].position_point"),       aux3);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[4].ambient"),              this.lights.pointLights[3].ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[4].diffuse"),              this.lights.pointLights[3].diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[4].specular"),             this.lights.pointLights[3].specular);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[4].isLocal"),              this.lights.pointLights[3].isLocal);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[4].isSpot"),               this.lights.pointLights[3].isSpot);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[4].isEnabled"),            this.lights.pointLights[3].isEnabled);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[4].constantAttenuation"),  this.lights.pointLights[3].constantAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[4].linearAttenuation"),    this.lights.pointLights[3].linearAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[4].quadraticAttenuation"), this.lights.pointLights[3].quadraticAttenuation);

    multMatrixPoint(viewMatrix, this.lights.pointLights[4].position, aux4);
    aux3 = [aux4[0], aux4[1], aux4[2]];
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[5].position_point"),       aux3);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[5].ambient"),              this.lights.pointLights[4].ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[5].diffuse"),              this.lights.pointLights[4].diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[5].specular"),             this.lights.pointLights[4].specular);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[5].isLocal"),              this.lights.pointLights[4].isLocal);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[5].isSpot"),               this.lights.pointLights[4].isSpot);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[5].isEnabled"),            this.lights.pointLights[4].isEnabled);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[5].constantAttenuation"),  this.lights.pointLights[4].constantAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[5].linearAttenuation"),    this.lights.pointLights[4].linearAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[5].quadraticAttenuation"), this.lights.pointLights[4].quadraticAttenuation);

    multMatrixPoint(viewMatrix, this.lights.pointLights[5].position, aux4);
    aux3 = [aux4[0], aux4[1], aux4[2]];
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[6].position_point"),       aux3);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[6].ambient"),              this.lights.pointLights[5].ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[6].diffuse"),              this.lights.pointLights[5].diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[6].specular"),             this.lights.pointLights[5].specular);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[6].isLocal"),              this.lights.pointLights[5].isLocal);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[6].isSpot"),               this.lights.pointLights[5].isSpot);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[6].isEnabled"),            this.lights.pointLights[5].isEnabled);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[6].constantAttenuation"),  this.lights.pointLights[5].constantAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[6].linearAttenuation"),    this.lights.pointLights[5].linearAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[6].quadraticAttenuation"), this.lights.pointLights[5].quadraticAttenuation);

    multMatrixPoint(viewMatrix, this.lights.spotLights[0].position, aux4);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[7].position"),             aux4);

    multMatrixPoint(viewMatrix, this.lights.spotLights[0].direction, aux4);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[7].direction"),            aux4);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[7].ambient"),              this.lights.spotLights[0].ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[7].diffuse"),              this.lights.spotLights[0].diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[7].specular"),             this.lights.spotLights[0].specular);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[7].isLocal"),              this.lights.spotLights[0].isLocal);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[7].isSpot"),               this.lights.spotLights[0].isSpot);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[7].isEnabled"),            this.lights.spotLights[0].isEnabled);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[7].constantAttenuation"),  this.lights.spotLights[0].constantAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[7].linearAttenuation"),    this.lights.spotLights[0].linearAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[7].quadraticAttenuation"), this.lights.spotLights[0].quadraticAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[7].spotCosCutoff"),        this.lights.spotLights[0].cutOff);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[7].spotExponent"),         this.lights.spotLights[0].exponent);

    multMatrixPoint(viewMatrix, this.lights.spotLights[1].position, aux4);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[8].position"),             aux4);
    multMatrixPoint(viewMatrix, this.lights.spotLights[1].direction, aux4);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[8].direction"),            aux4);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[8].ambient"),              this.lights.spotLights[1].ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[8].diffuse"),              this.lights.spotLights[1].diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[8].specular"),             this.lights.spotLights[1].specular);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[8].isLocal"),              this.lights.spotLights[1].isLocal);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[8].isSpot"),               this.lights.spotLights[1].isSpot);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[8].isEnabled"),            this.lights.spotLights[1].isEnabled);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[8].constantAttenuation"),  this.lights.spotLights[1].constantAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[8].linearAttenuation"),    this.lights.spotLights[1].linearAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[8].quadraticAttenuation"), this.lights.spotLights[1].quadraticAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[8].spotCosCutoff"),        this.lights.spotLights[1].cutOff);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[8].spotExponent"),         this.lights.spotLights[1].exponent);
}

GameManager.prototype.updateHeadLights = function() {
    var carPosition  = this.car.position.slice();
    var carDirection = this.car.direction.slice();
    var angle        = this.car.carAngle;

    var newXleft  = 0.55 * Math.cos(angle * Math.PI / 180.0) + Math.sin(angle * Math.PI / 180.0) * (-0.15) + carPosition[0];
    var newZleft  = -Math.sin(angle * Math.PI / 180.0) * 0.55 + Math.cos(angle * Math.PI / 180.0) * (-0.15) + carPosition[2];

    var newXright = 0.55 * Math.cos(angle * Math.PI / 180.0) + Math.sin(angle * Math.PI / 180.0) * 0.15 + carPosition[0];
    var newZright = -Math.sin(angle * Math.PI / 180.0) * 0.55 + Math.cos(angle * Math.PI / 180.0) * 0.15 + carPosition[2];

    this.lights.spotLights[0].position  = [newXleft, carPosition[1], newZleft, 1.0];
    this.lights.spotLights[0].direction = [carDirection[0], carDirection[1], carDirection[2], 0.0];
    this.lights.spotLights[1].position  = [newXright, carPosition[1], newZright, 1.0];
    this.lights.spotLights[1].direction = [carDirection[0], carDirection[1], carDirection[2], 0.0];
}

GameManager.prototype.restartGame = function() {
    this.gameOver = false;
    this.lives = 5;
    this.restartCar();
    this.lights.directional[0].isEnabled = ON;
    this.lights.pointLights[0].isEnabled = OFF;
    this.lights.pointLights[1].isEnabled = OFF;
    this.lights.pointLights[2].isEnabled = OFF;
    this.lights.pointLights[3].isEnabled = OFF;
    this.lights.pointLights[4].isEnabled = OFF;
    this.lights.pointLights[5].isEnabled = OFF;
    this.lights.spotLights[0].isEnabled  = ON;
    this.lights.spotLights[1].isEnabled  = ON;
    for(var i = 0; i < this.oranges.length; i++) {
        this.oranges[i].generateRandomOrange(this.world);
    }
}

GameManager.prototype.restartCar = function () {
    this.car.position = [28.7, 1.15, 6.1];
    this.car.direction = [1.0, 0.0, 0.0];

    this.car.acceleration = 0;
    this.car.speed = 0;
    this.car.speedVec3 = [0, 0, 0];
    this.acceleration_input = 0;
    this.car.carAngle = 0;
    this.car.wheel_angle = 0;
    this.car.steer_angle = 0;
    this.car.steer_input = 0;
    this.car.current_speed = 0;
    this.car.backwards_friction_factor = 0.004;
    this.car.backwards_friction = 0;
    this.car.lastPosition = this.car.position.slice();
    for(var i = 0; i < this.oranges.length; i++) {
        this.oranges[i].generateRandomOrange(this.world);
    }
}

GameManager.prototype.setUpFog = function() {
    if(this.day)
        this.fog.color = this.fog.dayColor;
    else
        this.fog.color = this.fog.nightColor;
    gl.clearColor(this.fog.color[0], this.fog.color[1], this.fog.color[2], this.fog.color[3]);

    gl.uniform1i(shaderProgram.fogIsEnabled, this.fog.state);
    gl.uniform1f(shaderProgram.fogDensity,   this.fog.density);
    gl.uniform1i(shaderProgram.fogMode,      this.fog.mode);
    gl.uniform3fv(shaderProgram.fogColor,    [this.fog.color[0], this.fog.color[1], this.fog.color[2]]);
}
