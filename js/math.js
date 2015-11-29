var modelID      = 0;
var viewID       = 1;
var projectionID = 2;

var modelMatrix         = mat4.create();
var viewMatrix          = mat4.create();
var projectionMatrix    = mat4.create();
var modelViewMatrix     = mat4.create();
var projModelViewMatrix = mat4.create();

function MatrixStack() {
	this.model = [];
	this.view = [];
	this.projection = [];
}

MatrixStack.prototype.pushMatrix = function(type) {
	var clone = mat4.create();
	if (type == modelID) {
		mat4.set(modelMatrix, clone);
		this.model.push(clone);
	}
	else if (type == viewID) {
		mat4.set(viewMatrix, clone);
		this.view.push(clone);
	}
	else if (type == projectionID) {
		mat4.set(projectionMatrix, clone);
		this.projection.push(clone);
	}
}

MatrixStack.prototype.popMatrix = function(type) {
	if (type == modelID) {
		if (this.model.length >= 1)
			modelMatrix = this.model.pop();
	}
	else if (type == viewID) {
		if (this.view.length >= 1)
			viewMatrix = this.view.pop();
	}
	else if (type == projectionID) {
		if (this.projection.length >= 1)
			projectionMatrix = this.projection.pop();
	}
}

function degToRad(degrees) {
    return degrees * Math.PI / 180;
}

function computeMatrices() {
	mat4.multiply(modelViewMatrix, viewMatrix, modelMatrix);
	mat4.multiply(projModelViewMatrix, projectionMatrix, modelViewMatrix);
}

function rotateCoordinate(point, center, angle) {
	var rotated = [center[0] + (point[0] - center[0])*Math.cos(angle) + (point[1] - center[1])*Math.sin(angle),
				   center[1] - (point[0] - center[0])*Math.cos(angle) + (point[1] - center[1])*Math.cos(angle)];
	return rotated;
}