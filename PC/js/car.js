function Car(position, direction) {
	this.position = position;
	this.direction = direction;

	this.acceleration = 0;
	this.speed = 0;
	this.speedVec3 = [0, 0, 0];
	this.acceleration_factor = 0.000035;
	this.acceleration_input = 0;
	this.carAngle = 0;
	this.wheel_angle = 0;
	this.steer_angle = 1;
	this.steer_input = 0;
	this.steer_factor = Math.PI/4;
	this.current_speed = 0;
	this.max_speed = 0.06;
	this.backwards_friction_factor = 0.004;
	this.backwards_friction = 0;
	this.lastPosition = position.slice();

	this.AABBbox = {};
	this.AABBbox.offSetX = 0.6;
	this.AABBbox.offSetZ = 0.4;
	this.updateAABBbox();
}

Car.prototype.update = function(delta_t) {
	if (this.speed > -0.0001 && this.speed < 0) this.speed = 0;
	else if (this.speed < 0.0001  && this.speed > 0) this.speed = 0;

	this.acceleration = this.acceleration_input * this.acceleration_factor;

	if (this.speed >= 0) {
		this.steer_angle = this.steer_input * 0.0174532925;
		this.carAngle = this.carAngle - this.steer_input;
	}
	else {
		this.steer_angle = -this.steer_input * 0.0174532925;
		this.carAngle = this.carAngle + this.steer_input;
	}

	this.direction = [this.direction[0] * Math.cos(this.steer_angle) - this.direction[2] * Math.sin(this.steer_angle),
					  0,
					  this.direction[0] * Math.sin(this.steer_angle) + this.direction[2] * Math.cos(this.steer_angle)];

	this.backwards_friction = -this.speed * this.backwards_friction_factor;

	this.speed = this.speed + this.backwards_friction * delta_t;
	this.speed = this.speed + this.acceleration * delta_t;

	this.lastPosition = this.position.slice();

	this.speedVec3 = [this.speed * this.direction[0], 0, this.speed * this.direction[2]];

	this.position = [this.position[0] + delta_t * this.speedVec3[0],
					 this.position[1] + delta_t * this.speedVec3[1],
					 this.position[2] + delta_t * this.speedVec3[2]];

	this.updateAABBbox();
}

Car.prototype.draw = function() {
	//this.draw();
	gameManager.matrices.pushMatrix(modelID);
	mat4.scale(modelMatrix, modelMatrix, [1, -1, 1]);
	this.drawCar();
	gameManager.matrices.popMatrix(modelID);
}

Car.prototype.drawReflection = function() {
	gameManager.matrices.pushMatrix(modelID);
	mat4.scale(modelMatrix, modelMatrix, [0, -1.0, 0]);
	this.drawCar();
	gameManager.matrices.popMatrix(modelID);
}
Car.prototype.drawCar = function() {
	gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

	gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, this.position);
    mat4.scale(modelMatrix, modelMatrix, [0.5, 0.5, 0.5]);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(this.carAngle), [0, 1, 0]);
    mat4.translate(modelMatrix, modelMatrix, [-0.7, 0.0, -0.5]);

    gameManager.matrices.pushMatrix(modelID);
    mat4.scale(modelMatrix, modelMatrix, [1.4, 0.5, 1.0]);
    //BODY
    cubeDraw();

    gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, [0.13, 1.55, 0.13]);
    mat4.scale(modelMatrix, modelMatrix, [0.74, 0.05, 0.74]);
    //ROOF
    cubeDraw();
    gameManager.matrices.popMatrix(modelID);
	//WINDOWS
    gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, [0.15, 1.1, 0.15]);
    mat4.rotate(modelMatrix, modelMatrix, -Math.PI/2, [1, 0, 0]);
    mat4.scale(modelMatrix, modelMatrix, [0.7, 0.02, 0.45]);
    //WINDOW nr1 - left
    cubeDraw();
    gameManager.matrices.popMatrix(modelID);

    gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, [0.15, 1.55, 0.85]);
    mat4.rotate(modelMatrix, modelMatrix, Math.PI/2, [1, 0, 0]);
    mat4.scale(modelMatrix, modelMatrix, [0.7, 0.02, 0.45]);
    //WINDOW nr2 - right
    cubeDraw();
    gameManager.matrices.popMatrix(modelID);

    gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, [0.15, 1.55, 0.13]);
    mat4.rotate(modelMatrix, modelMatrix, Math.PI/2, [1, 0, 0]);
    mat4.rotate(modelMatrix, modelMatrix, Math.PI/2, [0, 0, 1]);
    mat4.scale(modelMatrix, modelMatrix, [0.74, 0.02, 0.45]);
    //WINDOW nr3 - back
    cubeDraw();
    gameManager.matrices.popMatrix(modelID);

    gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, [0.87, 1.55, 0.13]);
    mat4.rotate(modelMatrix, modelMatrix, Math.PI/2, [1, 0, 0]);
    mat4.rotate(modelMatrix, modelMatrix, Math.PI/2, [0, 0, 1]);
    mat4.scale(modelMatrix, modelMatrix, [0.74, 0.02, 0.45]);
    //WINDOW nr4 - front
    cubeDraw();
    gameManager.matrices.popMatrix(modelID);

    //CAR_HEADLIGHTS
    gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, [1.0, 0.7, 0.2]);
    mat4.rotate(modelMatrix, modelMatrix, Math.PI/2, [0, 0, 1]);
    mat4.scale(modelMatrix, modelMatrix, [0.3, 0.3, 0.3]);
    mat4.scale(modelMatrix, modelMatrix, [0.6, 0.6, 0.6]);
    //CAR_HEADLIGHT nr1 - front left
    torusDraw();
    gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, 3.3]);
    //CAR_HEADLIGHT nr1 - front right
    torusDraw();
    gameManager.matrices.popMatrix(modelID);
    //CAR_TAILIGHTS
    gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, [0.0, 5.6, 0.0]);
    //CAR_TAILIGHT nr1 - rear left
    torusDraw();
    gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, [0.0, 0.0, 3.3]);
    //CAR_HEADLIGHT nr1 - rear right
    torusDraw();
    gameManager.matrices.popMatrix(modelID);
    gameManager.matrices.popMatrix(modelID);
    gameManager.matrices.popMatrix(modelID);

	gameManager.matrices.popMatrix(modelID);

	//TIRES
	gameManager.matrices.pushMatrix(modelID);
	mat4.translate(modelMatrix, modelMatrix, [0.3, 0.15, -0.1]);
    mat4.scale(modelMatrix, modelMatrix, [0.3, 0.3, 0.3]);
	mat4.rotate(modelMatrix, modelMatrix, Math.PI/2, [1, 0, 0]);
	//TIRE - rear left
	torusDraw();
	gameManager.matrices.popMatrix(modelID);

	gameManager.matrices.pushMatrix(modelID);
	mat4.translate(modelMatrix, modelMatrix, [1.1, 0.15, -0.1]);
	mat4.rotate(modelMatrix, modelMatrix, degToRad(this.wheel_angle), [0, 1, 0]);
    mat4.scale(modelMatrix, modelMatrix, [0.3, 0.3, 0.3]);
	mat4.rotate(modelMatrix, modelMatrix, Math.PI/2, [1, 0, 0]);
	//TIRE - front left
	torusDraw();
	gameManager.matrices.popMatrix(modelID);

	gameManager.matrices.pushMatrix(modelID);
	mat4.translate(modelMatrix, modelMatrix, [0.3, 0.15, 1.1]);
    mat4.scale(modelMatrix, modelMatrix, [0.3, 0.3, 0.3]);
	mat4.rotate(modelMatrix, modelMatrix, Math.PI/2, [1, 0, 0]);
	//TIRE - rear right
	torusDraw();
	gameManager.matrices.popMatrix(modelID);

	gameManager.matrices.pushMatrix(modelID);
	mat4.translate(modelMatrix, modelMatrix, [1.1, 0.15, 1.1]);
	mat4.rotate(modelMatrix, modelMatrix, degToRad(this.wheel_angle), [0, 1, 0]);
    mat4.scale(modelMatrix, modelMatrix, [0.3, 0.3, 0.3]);
	mat4.rotate(modelMatrix, modelMatrix, Math.PI/2, [1, 0, 0]);
	//TIRE - front right
	torusDraw();
	gameManager.matrices.popMatrix(modelID);

    gameManager.matrices.popMatrix(modelID);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

Car.prototype.updateAABBbox = function() {
	var rotated1 = rotateCoordinate([this.position[0] + this.AABBbox.offSetX, this.position[2] + this.AABBbox.offSetZ],
									[this.position[0], this.position[2]],
									this.steer_angle);

	var rotated2 = rotateCoordinate([this.position[0] - this.AABBbox.offSetX, this.position[2] - this.AABBbox.offSetZ],
									[this.position[0], this.position[2]],
									this.steer_angle);

	this.AABBbox.Xmax = rotated1[0];
	this.AABBbox.Xmin = rotated2[0];

	this.AABBbox.Zmax = rotated1[1];
	this.AABBbox.Zmin = rotated2[1];
}
