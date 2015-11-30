function Car(position, direction) {
	this.position = position;
	this.direction = direction;
	
	this.acceleration = 0;
	this.speed = 0;
	this.speedVec3 = [0, 0, 0];
	this.acceleration_factor = 0.000035;
	this.acceleration_input = 0;
	this.angle = 0;
	this.weel_angle = 0;
	this.steer_angle = 1; 
	this.steer_input = 0;
	this.steer_factor = Math.PI/4;
	this.current_speed = 0;
	this.max_speed = 0.06;
	this.backwards_friction_factor = 0.004;
	this.backwards_friction = 0;
	this.lastPosition = position.slice();

	this.offSetX = 0.6;
	this.offSetZ = 0.4;

	var rotated1 = rotateCoordinate([this.position[0] + this.offSetX, this.position[2] + this.offSetZ],
									[this.position[0], this.position[2]],
									this.steer_angle);

	var rotated2 = rotateCoordinate([this.position[0] - this.offSetX, this.position[2] - this.offSetZ],
									[this.position[0], this.position[2]],
									this.steer_angle);

	this.Xmax = rotated1[0];
	this.Xmin = rotated2[0];

	this.Zmax = rotated1[1];
	this.Zmin = rotated2[1];
}

Car.prototype.update = function(delta_t) {
	if (this.speed > -0.0001 && this.speed < 0) this.speed = 0;
	else if (this.speed < 0.0001  && this.speed > 0) this.speed = 0;

	this.acceleration = this.acceleration_input * this.acceleration_factor;

	if (this.speed >= 0) {
		this.steer_angle = this.steer_input * 0.0174532925;
		this._angle = this._angle - this.steer_input;
	}
	else {
		this.steer_angle = -this.steer_input * 0.0174532925;
		this.angle = this.angle + this.steer_input;
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

	this.updateBoxLimits();
}

Car.prototype.draw = function() {
	mat4.identity(modelMatrix);

    mat4.translate(modelMatrix, modelMatrix, this.position);
    mat4.scale(modelMatrix, modelMatrix, [0.3, 0.3, 0.3]);

    quadDraw();
}

Car.prototype.updateBoxLimits = function() {
	var rotated1 = rotateCoordinate([this.position[0] + this.offSetX, this.position[2] + this.offSetZ],
									[this.position[0], this.position[2]],
									this.steer_angle);

	var rotated2 = rotateCoordinate([this.position[0] - this.offSetX, this.position[2] - this.offSetZ],
									[this.position[0], this.position[2]],
									this.steer_angle);

	this.Xmax = rotated1[0];
	this.Xmin = rotated2[0];

	this.Zmax = rotated1[1];
	this.Zmin = rotated2[1];
}