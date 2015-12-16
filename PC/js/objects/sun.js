function Sun(position) {
	this.position = position;
    this.positionOnScreen = {};

    this.material = {};
}

Sun.prototype.draw = function() {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[11]);
    gl.activeTexture(gl.TEXTURE1);
    gl.bindTexture(gl.TEXTURE_2D, textures[12]);
    gl.uniform1i(shaderProgram.texmap1, 0);
    gl.uniform1i(shaderProgram.texmap2, 1);
    gl.uniform1i(shaderProgram.texMode, 2);
    gl.uniform1i(shaderProgram.particleMode, 1);
    gl.uniform1i(shaderProgram.sun, 1);


	gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, this.position);
    mat4.scale(modelMatrix, modelMatrix, [3.0, 3.0, 3.0]);
    this.billboardRotation();

    quadDraw();

    var homogeneous = [this.position[0], this.position[1], this.position[2], 1.0];

    multMatrixPoint(projModelViewMatrix, homogeneous, homogeneous);
    homogeneous[0] = homogeneous[0]/homogeneous[3];
    homogeneous[1] = homogeneous[1]/homogeneous[3];
    homogeneous[2] = homogeneous[2]/homogeneous[3];

    this.positionOnScreen.x = gl.viewportWidth  * (homogeneous[0]+1)/2;
    this.positionOnScreen.y = gl.viewportHeight * (homogeneous[1]+1)/2;

    gameManager.matrices.popMatrix(modelID);

    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, null);
    gl.uniform1i(shaderProgram.texMode, 1);
    gl.uniform1i(shaderProgram.particleMode, 0);
    gl.uniform1i(shaderProgram.sun, 0);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE_MINUS_SRC_ALPHA);
    gl.disable(gl.BLEND); 
}

Sun.prototype.billboardRotation = function() {
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