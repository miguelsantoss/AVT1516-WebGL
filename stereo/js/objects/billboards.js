function TreeBillboard(position) {
	this.position = position

	this.material = {};
	this.material.ambient   = [1.00, 1.00, 1.00, 1.00];
	this.material.diffuse   = [1.00, 1.00, 1.00, 1.00];
	this.material.specular  = [1.00, 1.00, 1.00, 1.00];
	this.material.emissive  = [0.00, 0.00, 0.00, 1.00];
	this.material.shininess = 0.0;
}

TreeBillboard.prototype.draw = function() {
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, this.position);
    mat4.scale(modelMatrix, modelMatrix, [3.00, 3.00, 3.00]);
    this.billboardRotation();
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[4]);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.ambient"), this.material.ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.diffuse"), this.material.diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.specular"), this.material.specular);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.emissive"), this.material.emissive);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "mat.shininess"), this.material.shininess);
    quadDraw();
    gl.bindTexture(gl.TEXTURE_2D, null);

    gameManager.matrices.popMatrix(modelID);

    gl.enable(gl.DEPTH_TEST);
	gl.disable(gl.BLEND);
}

TreeBillboard.prototype.billboardRotation = function() {
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