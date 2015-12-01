function Orange(position, direction, speed) {
	this.position = position;
	this.direction = direction;
    this.speed = speed;

    this.lastPosition = [position[0], position[1], position[2]];
    this.distanceDone = 0;
    this.angle = 0;

    this.AABBbox = {};
    this.updateAABBbox();
}

Orange.prototype.update = function(delta_t) {
    this.lastPosition = [this.position[0], this.position[1], this.position[2]];
    this.position = [this.position[0] + this.speed[0] * delta_t,
                     this.position[1] + this.speed[1] * delta_t,
                     this.position[2] + this.speed[2] * delta_t
                    ];
    this.distanceDone = Math.abs(this.speed[0]) * delta_t + Math.abs(this.speed[1]) * delta_t + Math.abs(this.speed[2]) * delta_t;
}

Orange.prototype.draw = function() {
    var circumference = 2 * Math.PI * 10;
    var angle = this.angle;
    angle += this.distanceDone / circumference * 360;
    this.distanceDone = 0;
    this.angle = angle;
    var norm = normalize(this.speed);
    var rotationAxis = [norm[2], 0, -norm[0]];

	mat4.identity(modelMatrix);

    mat4.translate(modelMatrix, modelMatrix, this.position);
    mat4.scale(modelMatrix, modelMatrix, [0.3, 0.3, 0.3]);
    mat4.rotate(modelMatrix, modelMatrix, angle, rotationAxis);
    //TODO fix rotation -- too fast

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.VertexPositionBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexPositionAttribute, sphere.VertexPositionBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.VertexTextureCoordBuffer);
    gl.vertexAttribPointer(shaderProgram.textureCoordAttribute, sphere.VertexTextureCoordBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ARRAY_BUFFER, sphere.VertexNormalBuffer);
    gl.vertexAttribPointer(shaderProgram.vertexNormalAttribute, sphere.VertexNormalBuffer.itemSize, gl.FLOAT, false, 0, 0);

    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, sphere.VertexIndexBuffer);
    setMatrixUniforms();
    gl.drawElements(gl.TRIANGLES, sphere.VertexIndexBuffer.numItems, gl.UNSIGNED_SHORT, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);
}

Orange.prototype.updateAABBbox = function() {
    this.AABBbox.offsetX = 0.4;
    this.AABBbox.offsetZ = 0.4;
    this.AABBbox.XMax = this.position[0] + this.AABBbox.offsetX;
    this.AABBbox.XMin = this.position[0] - this.AABBbox.offsetX;
    this.AABBbox.ZMax = this.position[2] + this.AABBbox.offsetZ;
    this.AABBbox.ZMin = this.position[2] - this.AABBbox.offsetZ;
}