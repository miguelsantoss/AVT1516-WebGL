function GameManager(width, height) {
	this.width          = width;
	this.height         = height;
    this.lives          = 5;
    this.gameOver       = false;
    this.pause          = false;

    this.carDefaultPosition = [1.0, 1.15, 1.0];

    this.fog            = {};
    this.fog.dayColor   = [0.46, 0.82, 0.97, 1.00];
    this.fog.nightColor = [0.00, 0.06, 0.16, 1.00];
    this.fog.color      = [];
    this.fog.state      = false;
    this.fog.density    = 0.077;
    this.fog.mode       = 1;
    this.day            = true;
    this.score          = 0;

    this.createCameras();
    this.createObjects();
    this.createLights();

	this.matrices = new MatrixStack();
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

GameManager.prototype.updateParticles = function(delta_t) {
    for(var i = 0; i < this.particles.length; i++) {
        this.particles[i].update(delta_t);
    }
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
		for(var i = 0; i < this.milks.length; i++) {
				this.milks[i].draw();
		}
    this.car.draw();
}

GameManager.prototype.update = function(delta_t) {
    if (this.pause || this.gameOver) return;
    this.car.update(delta_t);
    this.score += this.car.distanceDone*100;
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
    this.world.XMax = 20.0;
    this.world.ZMin = 0.00;
    this.world.ZMax = 20.0;

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

    mat4.translate(modelMatrix, modelMatrix, [10, 1, 10]);
    mat4.scale(modelMatrix, modelMatrix, [20, 20, 20]);
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
    this.car = new Car(this.carDefaultPosition, [1.0, 0.0, 0.0]);
    this.oranges = [];
    this.createOranges();
    this.butters = [];
    this.createButters();
    this.cheerios = [];
    this.createCheerios();
    this.trees = [];
		this.milks = [];
    this.createTreeBillboards();
		this.createMilk();
    this.particles = [];
    this.createParticles(400);
}

GameManager.prototype.createCameras = function() {
    this.cameras = [];
    this.activeCamera = 1;
    this.cameras.push(new OrthogonalCamera(-5, 65, -5, 65, -10, 10));
    this.cameras.push(new PerspectiveCamera(degToRad(75), this.width / this.height, 0.1, 100, [0, 1, 0], [1, 1, 1]));

    this.projection = new OrthogonalCamera(0.0, gl.viewportWidth, 0.0, gl.viewportHeight, -1.0, 1.0);
}

GameManager.prototype.createOranges = function() {
    this.oranges.push(new Orange(this.world));
    this.oranges.push(new Orange(this.world));
}

GameManager.prototype.createButters = function() {
    this.butters.push(new Butter([11.8, 1.0, 4.26]));
    this.butters.push(new Butter([5.54, 1.0, 12.5]));
}

GameManager.prototype.createCheerios = function() {
    this.cheerios.push(new Cheerio([3.10, 1.1, 3.26]));
    this.cheerios.push(new Cheerio([5.59, 1.1, 3.26]));
    this.cheerios.push(new Cheerio([8.34, 1.1, 3.26]));
    this.cheerios.push(new Cheerio([11.65, 1.1, 2.93]));
    this.cheerios.push(new Cheerio([14.35, 1.1, 2.69]));
    this.cheerios.push(new Cheerio([15.95, 1.1, 6.02]));
    this.cheerios.push(new Cheerio([15.95, 1.1, 9.02]));

    this.cheerios.push(new Cheerio([15.94, 1.1, 11.25]));
    this.cheerios.push(new Cheerio([16.35, 1.1, 15.15]));
    this.cheerios.push(new Cheerio([13.97, 1.1, 16.58]));
    this.cheerios.push(new Cheerio([11.22, 1.1, 16.58]));
    this.cheerios.push(new Cheerio([9.22, 1.1, 16.58]));
    this.cheerios.push(new Cheerio([6.10, 1.1, 16.58]));
    this.cheerios.push(new Cheerio([3.64, 1.1, 16.57]));
    this.cheerios.push(new Cheerio([3.48, 1.1, 13.47]));
    this.cheerios.push(new Cheerio([3.32, 1.1, 10.44]));
    this.cheerios.push(new Cheerio([3.09, 1.1, 6.11]));
}

GameManager.prototype.createTreeBillboards = function() {
    this.trees.push(new TreeBillboard([14.08, 2.5, 11.56], textures[1]));
    this.trees.push(new TreeBillboard([4.41, 2.5, 5.52], textures[1]));
}

GameManager.prototype.createMilk = function() {
    this.milks.push(new Milk([14.08, 1.01, 5.52]));
    this.milks.push(new Milk([4.41, 1.01, 11.56]));
}

GameManager.prototype.createParticles = function(num) {
    for(var i = 0; i < num; i++) {
        this.particles.push(new Particle([5.0, 5.0, 5.0], [0.1, -0.15, 0.0], [0.88, 0.55, 0.21], 1.0, 0.005));
    }
}

GameManager.prototype.createLights = function() {
    var candleColor      = [1.00, 0.57, 0.16];
    var headLightColor   = [0.78, 0.88, 1.00];


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
    this.lights.directional.push(new DirectionalLight([1.0, -1.0, 0.0, 0.0], [0.4, 0.4, 0.4], ON));

    this.lights.pointLights.push(new PointLight([19.50, 2.0, 17.68, 1.0], candleColor, candleConstantAttenuation, candleLinearAttenuation, candleQuadraticAttenuation, OFF));
    this.lights.pointLights.push(new PointLight([8.46, 2.0, 5.10, 1.0], candleColor, candleConstantAttenuation, candleLinearAttenuation, candleQuadraticAttenuation, OFF));
    this.lights.pointLights.push(new PointLight([15.03, 2.0, 11.20, 1.0], candleColor, candleConstantAttenuation, candleLinearAttenuation, candleQuadraticAttenuation, OFF));
    this.lights.pointLights.push(new PointLight([6.99, 2.0, 16.87, 1.0], candleColor, candleConstantAttenuation, candleLinearAttenuation, candleQuadraticAttenuation, OFF));
    this.lights.pointLights.push(new PointLight([46.55 , 2.0, 16.81, 1.0], candleColor, candleConstantAttenuation, candleLinearAttenuation, candleQuadraticAttenuation, OFF));
    this.lights.pointLights.push(new PointLight([0.66, 2.0, 11.89,  1.0], candleColor, candleConstantAttenuation, candleLinearAttenuation, candleQuadraticAttenuation, OFF));

    this.lights.spotLights.push(new SpotLight(headLightLEFT,  headLightDirection, headLightColor, headLightConstantAttenuation, headLightLinearAttenuation, headLightQuadraticAttenuation, headLightCutOff, headLightExponent, ON));
    this.lights.spotLights.push(new SpotLight(headLightRIGHT, headLightDirection, headLightColor, headLightConstantAttenuation, headLightLinearAttenuation, headLightQuadraticAttenuation, headLightCutOff, headLightExponent, ON));
}

GameManager.prototype.setUpLightsUniforms = function() {
    var aux4 = [], aux3 = [];
    multMatrixPoint(viewMatrix, this.lights.directional[0].direction, aux4);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "lights[0].direction"),            aux4);
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[0].color"),                this.lights.directional[0].color);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[0].isEnabled"),            this.lights.directional[0].isEnabled);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[0].isLocal"),              this.lights.directional[0].isLocal);

    multMatrixPoint(viewMatrix, this.lights.pointLights[0].position, aux4);
    aux3 = [aux4[0], aux4[1], aux4[2]];
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[1].position_point"),       aux3);
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[1].color"),                this.lights.pointLights[0].color);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[1].isLocal"),              this.lights.pointLights[0].isLocal);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[1].isSpot"),               this.lights.pointLights[0].isSpot);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[1].isEnabled"),            this.lights.pointLights[0].isEnabled);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[1].constantAttenuation"),  this.lights.pointLights[0].constantAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[1].linearAttenuation"),    this.lights.pointLights[0].linearAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[1].quadraticAttenuation"), this.lights.pointLights[0].quadraticAttenuation);

    multMatrixPoint(viewMatrix, this.lights.pointLights[1].position, aux4);
    aux3 = [aux4[0], aux4[1], aux4[2]];
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[2].position_point"),       aux3);
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[2].color"),                this.lights.pointLights[1].color);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[2].isLocal"),              this.lights.pointLights[1].isLocal);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[2].isSpot"),               this.lights.pointLights[1].isSpot);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[2].isEnabled"),            this.lights.pointLights[1].isEnabled);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[2].constantAttenuation"),  this.lights.pointLights[1].constantAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[2].linearAttenuation"),    this.lights.pointLights[1].linearAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[2].quadraticAttenuation"), this.lights.pointLights[1].quadraticAttenuation);

    multMatrixPoint(viewMatrix, this.lights.pointLights[2].position, aux4);
    aux3 = [aux4[0], aux4[1], aux4[2]];
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[3].position_point"),       aux3);
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[3].color"),                this.lights.pointLights[2].color);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[3].isLocal"),              this.lights.pointLights[2].isLocal);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[3].isSpot"),               this.lights.pointLights[2].isSpot);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[3].isEnabled"),            this.lights.pointLights[2].isEnabled);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[3].constantAttenuation"),  this.lights.pointLights[2].constantAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[3].linearAttenuation"),    this.lights.pointLights[2].linearAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[3].quadraticAttenuation"), this.lights.pointLights[2].quadraticAttenuation);

    multMatrixPoint(viewMatrix, this.lights.pointLights[3].position, aux4);
    aux3 = [aux4[0], aux4[1], aux4[2]];
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[4].position_point"),       aux3);
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[4].color"),                this.lights.pointLights[3].color);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[4].isLocal"),              this.lights.pointLights[3].isLocal);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[4].isSpot"),               this.lights.pointLights[3].isSpot);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[4].isEnabled"),            this.lights.pointLights[3].isEnabled);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[4].constantAttenuation"),  this.lights.pointLights[3].constantAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[4].linearAttenuation"),    this.lights.pointLights[3].linearAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[4].quadraticAttenuation"), this.lights.pointLights[3].quadraticAttenuation);

    multMatrixPoint(viewMatrix, this.lights.pointLights[4].position, aux4);
    aux3 = [aux4[0], aux4[1], aux4[2]];
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[5].position_point"),       aux3);
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[5].color"),                this.lights.pointLights[4].color);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[5].isLocal"),              this.lights.pointLights[4].isLocal);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[5].isSpot"),               this.lights.pointLights[4].isSpot);
    gl.uniform1i(gl.getUniformLocation(shaderProgram,  "lights[5].isEnabled"),            this.lights.pointLights[4].isEnabled);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[5].constantAttenuation"),  this.lights.pointLights[4].constantAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[5].linearAttenuation"),    this.lights.pointLights[4].linearAttenuation);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "lights[5].quadraticAttenuation"), this.lights.pointLights[4].quadraticAttenuation);

    multMatrixPoint(viewMatrix, this.lights.pointLights[5].position, aux4);
    aux3 = [aux4[0], aux4[1], aux4[2]];
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[6].position_point"),       aux3);
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[6].color"),                this.lights.pointLights[5].color);
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
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[7].color"),                this.lights.spotLights[0].color);
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
    gl.uniform3fv(gl.getUniformLocation(shaderProgram, "lights[8].color"),                this.lights.spotLights[1].color);
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
    this.score = 0;
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
    this.car.position = this.carDefaultPosition;
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
