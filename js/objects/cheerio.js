function Cheerio(position) {
	this.position = position;
    this.direction = [0, 0, 0];
    this.speed = 0;
    this.backwards_friction_factor = 0.006;
    this.backwards_friction = 0;

    this.material = {};
    this.material.ambient   = [0.00, 0.00, 0.00, 1.0];
    this.material.diffuse   = [0.21, 0.11, 0.07, 1.0];
    this.material.specular  = [0.37, 0.22, 0.16, 1.0];
    this.material.emissive  = [0.00, 0.00, 0.00, 1.0];
    this.material.shininess = 76.8;
    this.material.texCount  = 0;

    this.AABBbox = {};
    this.AABBbox.offsetX = 0.3;
    this.AABBbox.offsetZ = 0.3;
    this.updateAABBbox();
}

Cheerio.prototype.update = function(delta_t) {
    this.backwards_friction = -this.speed * this.backwards_friction_factor;
    this.speed = this.speed + this.backwards_friction * delta_t;

    var speedVec3 = [this.direction[0] * this.speed, this.direction[1] * this.speed, this.direction[2] * this.speed];
    this.position = [this.position[0] + speedVec3[0] * delta_t,
                     this.position[1] + speedVec3[1] * delta_t,
                     this.position[2] + speedVec3[2] * delta_t
                    ];
    this.updateAABBbox();
}

Cheerio.prototype.draw = function() {
	gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, this.position);
    mat4.translate(modelMatrix, modelMatrix, [-0.125, 0.0, -0.125]);
    mat4.scale(modelMatrix, modelMatrix, [0.25, 0.25, 0.25]);

    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.ambient"), this.material.ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.diffuse"), this.material.diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.specular"), this.material.specular);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.emissive"), this.material.emissive);
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "mat.shininess"), this.material.shininess);
    torusDraw();
    gl.bindTexture(gl.TEXTURE_2D, null);

    gameManager.matrices.popMatrix(modelID);
}

Cheerio.prototype.updateAABBbox = function() {
    this.AABBbox.XMax = this.position[0] + this.AABBbox.offsetX;
    this.AABBbox.XMin = this.position[0] - this.AABBbox.offsetX;
    this.AABBbox.ZMax = this.position[2] + this.AABBbox.offsetZ;
    this.AABBbox.ZMin = this.position[2] - this.AABBbox.offsetZ;
}

Cheerio.prototype.dealColision = function(obj) {
    if (obj.speed > 0.004 || obj.speed < -0.004) {
        this.speed = obj.speed;
        this.direction = [obj.direction[0], obj.direction[1], obj.direction[2]];
    }
}