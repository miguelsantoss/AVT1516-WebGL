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
	this.steer_angle = 0; 
	this.steer_input = 0;
	this.steer_factor = Math.PI/4;
	this.current_speed = 0;
	this.max_speed = 0.06;
	this.backwards_friction_factor = 0.004;
	this.backwards_friction = 0;
	this.lastPosition = position.slice();
    this.distanceDone = 0;
    this.rotatingTiresAngle = 0;

	this.material = {};
	this.material.body = {};
    this.material.body.ambient            = [0.00, 0.00, 0.00, 1.0];
    this.material.body.diffuse            = [0.50, 0.00, 0.00, 1.0];
    this.material.body.specular           = [0.70, 0.60, 0.60, 1.0];
    this.material.body.emissive           = [0.00, 0.00, 0.00, 1.0];
    this.material.body.shininess          = 0.25;
    this.material.body.texCount           = 0;

    this.material.wheel = {};
    this.material.wheel.ambient           = [0.02, 0.02, 0.02, 1.0];
    this.material.wheel.diffuse           = [0.01, 0.01, 0.01, 1.0];
    this.material.wheel.specular          = [0.40, 0.40, 0.40, 1.0];
    this.material.wheel.emissive          = [0.00, 0.00, 0.00, 1.0];
    this.material.wheel.shininess         = 0.78;
    this.material.wheel.texCount          = 0;

    this.material.windows = {};
    this.material.windows.ambient         = [0.26, 0.25, 1.00, 0.3];
    this.material.windows.diffuse         = [0.52, 1.00, 1.00, 0.3];
    this.material.windows.specular        = [1.00, 1.00, 1.00, 0.3];
    this.material.windows.emissive        = [0.00, 0.00, 0.00, 0.3];
    this.material.windows.shininess       = 128.0;
    this.material.windows.texCount        = 0;

    this.material.car_headlight = {};
    this.material.car_headlight.ambient   = [1.00, 1.00, 0.34, 1.0];
    this.material.car_headlight.diffuse   = [1.00, 1.00, 0.39, 1.0];
    this.material.car_headlight.specular  = [1.00, 1.00, 0.40, 1.0];
    this.material.car_headlight.emissive  = [0.00, 0.00, 0.00, 1.0];
    this.material.car_headlight.shininess = 76.8;
    this.material.car_headlight.texCount  = 0;

    this.material.car_tailight = {};
    this.material.car_tailight.ambient    = [0.60, 0.00, 0.00, 1.0];
    this.material.car_tailight.diffuse    = [0.60, 0.00, 0.00, 1.0];
    this.material.car_tailight.specular   = [0.60, 0.00, 0.00, 1.0];
    this.material.car_tailight.emissive   = [0.00, 0.00, 0.00, 1.0];
    this.material.car_tailight.shininess  = 76.8;
    this.material.car_tailight.texCount   = 0;

	this.AABBbox = {};
	this.AABBbox.offSetX = 0.6;
	this.AABBbox.offSetZ = 0.5;
	this.updateAABBbox();
}

Car.prototype.update = function(delta_t) {
	if (this.speed > -0.0001 && this.speed < 0) this.speed = 0;
	else if (this.speed < 0.0001  && this.speed > 0) this.speed = 0;

	this.acceleration = this.acceleration_input * this.acceleration_factor;

	if (this.speed >= 0) {
		this.steer_angle = this.steer_input * 0.0174532925;
		this.carAngle = this.carAngle - this.steer_input;
        if (this.carAngle < -360)
            this.carAngle += 360;
        if (this.carAngle > 360)
            this.carAngle -= 360;
	}
	else {
		this.steer_angle = -this.steer_input * 0.0174532925;
		this.carAngle = this.carAngle + this.steer_input;
        if (this.carAngle < -360)
            this.carAngle += 360;
        if (this.carAngle > 360)
            this.carAngle -= 360;
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
    this.distanceDone = Math.abs(this.speedVec3[0]) * delta_t + Math.abs(this.speedVec3[1]) * delta_t + Math.abs(this.speedVec3[2]) * delta_t;
	this.updateAABBbox();
}

Car.prototype.draw = function() {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

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
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.ambient"), this.material.body.ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.diffuse"), this.material.body.diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.specular"), this.material.body.specular);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.emissive"), this.material.body.emissive);
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "mat.shininess"), this.material.body.shininess);
    cubeDraw();

    gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, [0.13, 1.55, 0.13]);
    mat4.scale(modelMatrix, modelMatrix, [0.74, 0.05, 0.74]);
    //ROOF
    //no materials, using the same provided before
    cubeDraw();
    gameManager.matrices.popMatrix(modelID);
    gl.bindTexture(gl.TEXTURE_2D, textures[2]);
	//WINDOWS
	//all windows use the same type of material
	gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.ambient"), this.material.windows.ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.diffuse"), this.material.windows.diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.specular"), this.material.windows.specular);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.emissive"), this.material.windows.emissive);
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "mat.shininess"), this.material.windows.shininess);

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
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    //CAR_HEADLIGHTS
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.ambient"), this.material.car_headlight.ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.diffuse"), this.material.car_headlight.diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.specular"), this.material.car_headlight.specular);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.emissive"), this.material.car_headlight.emissive);
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "mat.shininess"), this.material.car_headlight.shininess);
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
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.ambient"), this.material.car_tailight.ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.diffuse"), this.material.car_tailight.diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.specular"), this.material.car_tailight.specular);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.emissive"), this.material.car_tailight.emissive);
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "mat.shininess"), this.material.car_tailight.shininess);
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
    var circumference = 2 * Math.PI * 1;
    var angle = this.rotatingTiresAngle;
    angle += this.distanceDone / circumference * 360;
    if (angle >= 360) angle -= 360;
    else if (angle <= -360) angle += 360;
    this.distanceDone = 0;
    if (angle != 0)
        this.rotatingTiresAngle = angle;
    var norm = normalize(this.speedVec3);
    var rotationAxis = [norm[2], 0, -norm[0]];

    gl.bindTexture(gl.TEXTURE_2D, textures[3]);
	gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.ambient"), this.material.wheel.ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.diffuse"), this.material.wheel.diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.specular"), this.material.wheel.specular);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.emissive"), this.material.wheel.emissive);
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "mat.shininess"), this.material.wheel.shininess);
	gameManager.matrices.pushMatrix(modelID);
	mat4.translate(modelMatrix, modelMatrix, [0.3, 0.15, -0.1]);
    mat4.scale(modelMatrix, modelMatrix, [0.3, 0.3, 0.3]);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(-this.carAngle), [0, 1, 0]);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(angle), rotationAxis);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(this.carAngle), [0, 1, 0]);
	mat4.rotate(modelMatrix, modelMatrix, Math.PI/2, [1, 0, 0]);
    
    
	//TIRE - rear left
	torusDraw();
	gameManager.matrices.popMatrix(modelID);

	gameManager.matrices.pushMatrix(modelID);
	mat4.translate(modelMatrix, modelMatrix, [1.1, 0.15, -0.1]);
    mat4.scale(modelMatrix, modelMatrix, [0.3, 0.3, 0.3]);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(this.wheel_angle), [0, 1, 0]);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(-this.carAngle), [0, 1, 0]);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(angle), rotationAxis);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(this.carAngle), [0, 1, 0]);
    
	mat4.rotate(modelMatrix, modelMatrix, Math.PI/2, [1, 0, 0]);
	//TIRE - front left
	torusDraw();
	gameManager.matrices.popMatrix(modelID);

	gameManager.matrices.pushMatrix(modelID);
	mat4.translate(modelMatrix, modelMatrix, [0.3, 0.15, 1.1]);
    mat4.scale(modelMatrix, modelMatrix, [0.3, 0.3, 0.3]);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(-this.carAngle), [0, 1, 0]);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(angle), rotationAxis);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(this.carAngle), [0, 1, 0]);
	mat4.rotate(modelMatrix, modelMatrix, Math.PI/2, [1, 0, 0]);
	//TIRE - rear right
	torusDraw();
	gameManager.matrices.popMatrix(modelID);

	gameManager.matrices.pushMatrix(modelID);
	mat4.translate(modelMatrix, modelMatrix, [1.1, 0.15, 1.1]);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(this.wheel_angle), [0, 1, 0]);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(-this.carAngle), [0, 1, 0]);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(angle), rotationAxis);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(this.carAngle), [0, 1, 0]);
	
    mat4.scale(modelMatrix, modelMatrix, [0.3, 0.3, 0.3]);
    
	mat4.rotate(modelMatrix, modelMatrix, Math.PI/2, [1, 0, 0]);
	//TIRE - front right
	torusDraw();
	gameManager.matrices.popMatrix(modelID);

    gameManager.matrices.popMatrix(modelID);
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.enable(gl.DEPTH_TEST);
    gl.disable(gl.BLEND);
}

Car.prototype.updateAABBbox = function() {
	var rotated1 = rotateCoordinate([this.position[0] + this.AABBbox.offSetX, this.position[2] + this.AABBbox.offSetZ],
									[this.position[0], this.position[2]],
									this.steer_angle);

	var rotated2 = rotateCoordinate([this.position[0] - this.AABBbox.offSetX, this.position[2] - this.AABBbox.offSetZ],
									[this.position[0], this.position[2]],
									this.steer_angle);

	this.AABBbox.XMax = rotated1[0];
	this.AABBbox.XMin = rotated2[0];

	this.AABBbox.ZMax = rotated1[1];
	this.AABBbox.ZMin = rotated2[1];
}

Car.prototype.checkInside = function(obj) {
    if (this.position[0] > obj.XMax || this.position[0] < obj.XMin || this.position[2] > obj.ZMax || this.position[2] < obj.ZMin)
        return false;
    return true;
}

Car.prototype.checkCollision = function(obj) {
    return ((this.AABBbox.XMax > obj.AABBbox.XMin) && (this.AABBbox.XMin < obj.AABBbox.XMax) && (this.AABBbox.ZMax > obj.AABBbox.ZMin) && (this.AABBbox.ZMin < obj.AABBbox.ZMax));
}

Car.prototype.dealColision = function() {
    this.acceleration = 0;
    this.speed = 0;
    this.position = [this.lastPosition[0], this.lastPosition[1], this.lastPosition[2]];
}