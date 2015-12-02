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

