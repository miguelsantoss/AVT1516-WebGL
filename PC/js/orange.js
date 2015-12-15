function Orange(position, direction, speed) {
	this.position = position;
	this.direction = direction;
    this.speed = speed;

    this.lastPosition = [position[0], position[1], position[2]];
    this.distanceDone = 0;
    this.angle = 0;

    this.AABBbox = {};
    this.AABBbox.offsetX = 0.4;
    this.AABBbox.offsetZ = 0.4;
    this.updateAABBbox();
}

Orange.prototype.update = function(delta_t) {
    this.lastPosition = [this.position[0], this.position[1], this.position[2]];
    this.position = [this.position[0] + this.speed[0] * delta_t,
                     this.position[1] + this.speed[1] * delta_t,
                     this.position[2] + this.speed[2] * delta_t
                    ];
    this.distanceDone = Math.abs(this.speed[0]) * delta_t + Math.abs(this.speed[1]) * delta_t + Math.abs(this.speed[2]) * delta_t;
    this.updateAABBbox();
}

Orange.prototype.draw = function() {
    var circumference = 2 * Math.PI * 1;
    var angle = this.angle;
    angle += this.distanceDone / circumference * 360;
    this.distanceDone = 0;
    this.angle = angle;
    var norm = normalize(this.speed);
    var rotationAxis = [norm[2], 0, -norm[0]];


	gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, this.position);
    mat4.scale(modelMatrix, modelMatrix, [0.5, 0.5, 0.5]);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(angle), rotationAxis);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    sphereDraw();
    gl.bindTexture(gl.TEXTURE_2D, null);

    gameManager.matrices.popMatrix(modelID);
}

Orange.prototype.updateAABBbox = function() {
    this.AABBbox.XMax = this.position[0] + this.AABBbox.offsetX;
    this.AABBbox.XMin = this.position[0] - this.AABBbox.offsetX;
    this.AABBbox.ZMax = this.position[2] + this.AABBbox.offsetZ;
    this.AABBbox.ZMin = this.position[2] - this.AABBbox.offsetZ;
}