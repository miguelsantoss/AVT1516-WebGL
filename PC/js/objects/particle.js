function Particle(acc, color, life, fade) {
	this.position = [5.0, 5.0, 5.0];
	// this.position = [generateRandomNumber(4.0, 6.0), generateRandomNumber(4.0, 6.0), generateRandomNumber(4.0, 6.0)];
	this.acc = acc;
	this.color = color;
	this.life = life;
	this.fade = fade;

	var v = generateRandomNumber(0.2, 1);
	var phi = Math.random() * Math.PI;
	var theta = Math.random() * Math.PI * 2;
	this.speed = [v*Math.cos(theta)*Math.sin(phi), v*Math.cos(phi), v*Math.sin(theta)*Math.sin(phi)];

	this.initialSpeed = [v*Math.cos(theta)*Math.sin(phi), v*Math.cos(phi), v*Math.sin(theta)*Math.sin(phi)];
}

Particle.prototype.resetPos = function() {
	this.position = [5.0, 5.0, 5.0];
	this.life = 1.0;
	this.speed = [this.initialSpeed[0], this.initialSpeed[1], this.initialSpeed[2],];
}

Particle.prototype.update = function(delta_t) {
	this.position[0] = this.position[0] + this.speed[0]*delta_t;
	this.position[1] = this.position[1] + this.speed[1]*delta_t;
	this.position[2] = this.position[2] + this.speed[2]*delta_t;

	this.speed[0] = this.speed[0] + this.acc[0]*delta_t;
	this.speed[1] = this.speed[1] + this.acc[1]*delta_t;
	this.speed[2] = this.speed[2] + this.acc[2]*delta_t;

	this.life -= this.fade;
}

Particle.prototype.draw = function() {
	gl.disable(gl.DEPTH_TEST);
	gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[5]);
    gl.uniform1i(shaderProgram.samplerUniform, 0);
    gl.uniform1i(shaderProgram.particleMode, 1);

    gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, this.position);
    mat4.scale(modelMatrix, modelMatrix, [0.2, 0.2, 0.2]);
    this.billboardRotation();
    gl.uniform1f(shaderProgram.alpha, 1.0);
	quadDraw();
	gameManager.matrices.popMatrix(modelID);
	gl.bindTexture(gl.TEXTURE_2D, null);
	gl.uniform1i(shaderProgram.particleMode, 0);
	gl.enable(gl.DEPTH_TEST);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
	gl.disable(gl.BLEND); 
}

Particle.prototype.billboardRotation = function() {
	var xcamX, xcamZ;
	if (gameManager.activeCamera == 0) {
		xcamX = 0;
		xcamZ = 0;
	} else if (gameManager.activeCamera == 1) {
		xcamX = gameManager.cameras[1].position[0];
		xcamZ = gameManager.cameras[1].position[2];
	}

	var objToCam = [];
	objToCam[0] = xcamX - this.position[0];
	objToCam[1] = 0;
	objToCam[2] = xcamZ - this.position[2];

	var lookAt = [0, 0, 1];

	var objToCam   = normalize(objToCam);
	var rotateAxis = crossProduct(lookAt, objToCam);
	var angleCos   = innerProduct(lookAt, objToCam);

	mat4.rotate(modelMatrix, modelMatrix, Math.acos(angleCos), rotateAxis);
}