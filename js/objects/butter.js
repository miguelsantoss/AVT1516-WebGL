function Butter(position) {
	this.position = position;

    this.AABBbox = {};
    this.AABBbox.offsetX = 0.5;
    this.AABBbox.offsetZ = 0.3;
    this.updateAABBbox();

    this.material = {};
    this.material.ambient   = [0.80, 0.80, 0.03, 1.0];
    this.material.diffuse   = [0.50, 0.50, 0.00, 1.0];
    this.material.specular  = [0.84, 0.84, 0.00, 1.0];
    this.material.emissive  = [0.00, 0.00, 0.00, 1.0];
    this.material.shininess = 100.0;
    this.material.texCount  = 0;
}

Butter.prototype.update = function(delta_t) {
    /*this.position = [this.position[0] + this.speed[0] * delta_t,
                     this.position[1] + this.speed[1] * delta_t,
                     this.position[2] + this.speed[2] * delta_t
                    ];*/
}

Butter.prototype.draw = function() {
	gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, this.position);
    mat4.translate(modelMatrix, modelMatrix, [-0.65, 0.0, -0.35]);
    mat4.scale(modelMatrix, modelMatrix, [1.3, 0.5, 0.7]);

    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    gl.uniform1i(shaderProgram.samplerUniform, 0);


    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.ambient"), this.material.ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.diffuse"), this.material.diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.specular"), this.material.specular);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.emissive"), this.material.emissive);
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "mat.shininess"), this.material.shininess);
    cubeDraw();
    gl.bindTexture(gl.TEXTURE_2D, null);

    gameManager.matrices.popMatrix(modelID);
}

Butter.prototype.updateAABBbox = function() {
    this.AABBbox.XMax = this.position[0] + this.AABBbox.offsetX;
    this.AABBbox.XMin = this.position[0] - this.AABBbox.offsetX;
    this.AABBbox.ZMax = this.position[2] + this.AABBbox.offsetZ;
    this.AABBbox.ZMin = this.position[2] - this.AABBbox.offsetZ;
}