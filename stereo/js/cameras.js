function OrthogonalCamera(right, left, bottom, top, near, far) {
	this.right  = right;
	this.left   = left;

	this.bottom = bottom;
	this.top    = top;

	this.near   = near;
	this.far    = far;
}

function PerspectiveCamera(fov, ratio, near, far, position, direction) {
	this.fov       = fov;
	this.ratio     = ratio;

	this.near      = near;
	this.far       = far;

	this.position  = position;
	this.direction = direction;

	this.camX      = 0;
	this.camY      = 0;
	this.camZ      = 0;
}

OrthogonalCamera.prototype.computeProjection = function() {
	mat4.ortho(projectionMatrix, this.right, this.left, this.bottom, this.top, this.near, this.far);
	mat4.lookAt(viewMatrix, [0, 5, 0], [0, 0, 0], [1, 0, 0]);
}

PerspectiveCamera.prototype.computeProjection = function() {
	mat4.perspective(projectionMatrix, this.fov, this.ratio, this.near, this.far);
	mat4.lookAt(viewMatrix, this.position, this.direction, [0, 1, 0]);
}

PerspectiveCamera.prototype.updateLookAt = function(position, direction) {
	this.position  = position.slice();
	this.direction = direction.slice();
}

function StereoCamera(fov, ratio, near, far, position, direction, up, focal, aperture) {
		this.fov       = fov;
		this.ratio     = ratio; //Será mesmo a dividir por 2?

		this.near      = near;
		this.far       = far;

		this.position  = position;
		this.direction = direction;
		this.up = up;

		this.focal = focal; //50
		this.aperture = aperture; //45

		this.eyeSep = 0.2;
		this.delta = 0.5 * this.eyeSep * near / focal;
		this.hdiv2 = near * Math.tan(aperture/2);

		this.top = this.hdiv2;
		this.bottom = - this.hdiv2;

		this.camX      = 0;
		this.camY      = 0;
		this.camZ      = 0;
}

StereoCamera.prototype.computeLeftProjection = function() {
	var left = -this.ratio * this.hdiv2 + this.delta;
	var right = this.ratio * this.hdiv2 + this.delta;

	mat4.frustum(projectionMatrix, left, right, this.bottom, this.top, this.near, this.far);
	mat4.lookAt(viewMatrix, [this.position[0] - this.vEye[0],this.position[1] - this.vEye[1],this.position[2] - this.vEye[2]],
													[this.position[0] - this.vEye[0] + this.direction[0], this.position[1] - this.vEye[1] + this.direction[1], this.position[2] - this.vEye[2] + this.direction[2]],
													this.up);
}

StereoCamera.prototype.computeRightProjection = function() {
	var left = -this.ratio * this.hdiv2 - this.delta;
	var right = this.ratio * this.hdiv2 - this.delta;

	mat4.frustum(projectionMatrix, left, right, this.bottom, this.top, this.near, this.far);
	mat4.lookAt(viewMatrix, [this.position[0] + this.vEye[0],this.position[1] + this.vEye[1],this.position[2] + this.vEye[2]],
													[this.position[0] + this.vEye[0] + this.direction[0], this.position[1] + this.vEye[1] + this.direction[1], this.position[2] +this.vEye[2] +this.direction[2]],
													this.up);
}

StereoCamera.prototype.updateLookAt = function(position, direction) {
	this.position  = position.slice();
	this.direction = direction.slice();
	this.rightVec = crossProduct(this.direction, this.up);
	this.vEye = [this.rightVec[0] * this.eyeSep / 2.0, this.rightVec[1] * this.eyeSep / 2.0, this.rightVec[2] * this.eyeSep / 2.0];

}
