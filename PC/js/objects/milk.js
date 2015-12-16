function Milk(position) {
	this.position = position

	this.material = {};
	this.material.ambient   = [1.00, 1.00, 1.00, 1.00];
	this.material.diffuse   = [1.00, 1.00, 1.00, 1.00];
	this.material.specular  = [1.00, 1.00, 1.00, 1.00];
	this.material.emissive  = [0.00, 0.00, 0.00, 1.00];
	this.material.shininess = 0.0;
}

Milk.prototype.draw = function() {
	gl.enable(gl.BLEND);
	gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);

	gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, this.position);
    mat4.scale(modelMatrix, modelMatrix, [3.00, 3.00, 3.00]);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(90), [1, 0, 0]);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[6]);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.ambient"), this.material.ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.diffuse"), this.material.diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.specular"), this.material.specular);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.emissive"), this.material.emissive);
    gl.uniform1f(gl.getUniformLocation(shaderProgram,  "mat.shininess"), this.material.shininess);
    quadDraw();
    gl.bindTexture(gl.TEXTURE_2D, null);

    gameManager.matrices.popMatrix(modelID);

    //gl.enable(gl.DEPTH_TEST);
	gl.disable(gl.BLEND);
}
