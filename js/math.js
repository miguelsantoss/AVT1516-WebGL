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
		clone = mat4.clone(modelMatrix);
		this.model.push(clone);
	}
	else if (type == viewID) {
		clone = mat4.clone(viewMatrix);
		this.view.push(clone);
	}
	else if (type == projectionID) {
		clone = mat4.clone(projectionMatrix);
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

function normalize(vec) {
	var length = Math.sqrt(vec[0] * vec[0] + vec[1] * vec[1] + vec[2] * vec[2]);
	if (length != 0)
		return [vec[0] / length, vec[1] / length, vec[2] / length];
	else
		return vec;
}

function crossProduct(vec1, vec2) {
	var vec = [];
	vec[0] = vec1[1] * vec2[2] - vec1[2] * vec2[1];
	vec[1] = vec1[2] * vec2[0] - vec1[0] * vec2[2];
	vec[2] = vec1[0] * vec2[1] - vec1[1] * vec2[0];
	return vec;
}

function innerProduct(vec1, vec2) {
	return vec1[0] * vec2[0] + vec1[1] * vec2[1] + vec1[2] * vec2[2];
}

function multMatrixPoint(matrix, point, res) {
	for (var i = 0; i < 4; ++i) {

		res[i] = 0.0;
	
		for (var j = 0; j < 4; j++) {
		
			res[i] += point[j] * matrix[j*4 + i];
		} 
	}

}

function computeNormal3x3() {
	var mMat3x3 = mat3.create();
	
	mMat3x3[0] = modelViewMatrix[0];
	mMat3x3[1] = modelViewMatrix[1];
	mMat3x3[2] = modelViewMatrix[2];

	mMat3x3[3] = modelViewMatrix[4];
	mMat3x3[4] = modelViewMatrix[5];
	mMat3x3[5] = modelViewMatrix[6];

	mMat3x3[6] = modelViewMatrix[8];
	mMat3x3[7] = modelViewMatrix[9];
	mMat3x3[8] = modelViewMatrix[10];

	var det = mMat3x3[0] * (mMat3x3[4] * mMat3x3[8] - mMat3x3[5] * mMat3x3[7]) +
			  mMat3x3[1] * (mMat3x3[5] * mMat3x3[6] - mMat3x3[8] * mMat3x3[3]) +
		  	  mMat3x3[2] * (mMat3x3[3] * mMat3x3[7] - mMat3x3[4] * mMat3x3[6]);

	var invDet = 1.0 / det;

	var mNormal3x3 = mat3.create();

	mNormal3x3[0] = (mMat3x3[4] * mMat3x3[8] - mMat3x3[5] * mMat3x3[7]) * invDet;
	mNormal3x3[1] = (mMat3x3[5] * mMat3x3[6] - mMat3x3[8] * mMat3x3[3]) * invDet;
	mNormal3x3[2] = (mMat3x3[3] * mMat3x3[7] - mMat3x3[4] * mMat3x3[6]) * invDet;
	mNormal3x3[3] = (mMat3x3[2] * mMat3x3[7] - mMat3x3[1] * mMat3x3[8]) * invDet;
	mNormal3x3[4] = (mMat3x3[0] * mMat3x3[8] - mMat3x3[2] * mMat3x3[6]) * invDet;
	mNormal3x3[5] = (mMat3x3[1] * mMat3x3[6] - mMat3x3[7] * mMat3x3[0]) * invDet;
	mNormal3x3[6] = (mMat3x3[1] * mMat3x3[5] - mMat3x3[4] * mMat3x3[2]) * invDet;
	mNormal3x3[7] = (mMat3x3[2] * mMat3x3[3] - mMat3x3[0] * mMat3x3[5]) * invDet;
	mNormal3x3[8] = (mMat3x3[0] * mMat3x3[4] - mMat3x3[3] * mMat3x3[1]) * invDet;

	return mNormal3x3;
}

function generateRandomNumber(min, max) {
	return Math.random() * (max - min) + min;
}