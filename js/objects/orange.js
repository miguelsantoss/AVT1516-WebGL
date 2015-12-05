function Orange(position, direction, speed) {
    this.interval = 5;
    if (direction !== undefined && speed !== undefined) {
    	this.position = position;
    	this.direction = direction;
        this.speed = speed;
    }
    else {
        this.generateRandomOrange(position);
    }

    this.lastPosition = [this.position[0], this.position[1], this.position[2]];
    this.distanceDone = 0;
    this.angle = 0;

    this.material = {};
    this.material.ambient   = [0.42, 0.20, 0.00, 1.0];
    this.material.diffuse   = [0.98, 0.48, 0.00, 1.0];
    this.material.specular  = [1.00, 0.55, 0.01, 1.0];
    this.material.emissive  = [0.00, 0.00, 0.00, 1.0];
    this.material.shininess = 104.0;
    this.material.texCount  = 0;

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
    if (angle >= 360) angle -= 360;
    else if (angle <= -360) angle += 360;
    this.distanceDone = 0;
    this.angle = angle;
    var norm = normalize(this.speed);
    var rotationAxis = [norm[2], 0, -norm[0]];


	gameManager.matrices.pushMatrix(modelID);
    mat4.translate(modelMatrix, modelMatrix, this.position);
    mat4.scale(modelMatrix, modelMatrix, [0.4, 0.4, 0.4]);
    mat4.rotate(modelMatrix, modelMatrix, degToRad(angle), rotationAxis);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, textures[1]);
    gl.uniform1i(shaderProgram.samplerUniform, 0);

    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.ambient"), this.material.ambient);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.diffuse"), this.material.diffuse);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.specular"), this.material.specular);
    gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.emissive"), this.material.emissive);
    gl.uniform1f(gl.getUniformLocation(shaderProgram, "mat.shininess"), this.material.shininess);
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

Orange.prototype.checkInside = function(obj) {
    if (this.position[0] > obj.XMax || this.position[0] < obj.XMin || this.position[2] > obj.ZMax || this.position[2] < obj.ZMin)
        return false;
    return true;
}

Orange.prototype.resetOrangeInside = function(obj) {
    var position = [generateRandomNumber(obj.XMin - 5, obj.XMax - 5), 2.0, generateRandomNumber(obj.ZMin - 5, obj.ZMax - 5)];
    var speed =    [generateRandomNumber(-this.interval, this.interval)/2000, 0.0, generateRandomNumber(-this.interval, this.interval)/2000];
    while(Math.abs(speed[0]) < (this.interval/5000) && Math.abs(speed[2]) < (this.interval/5000)) {
        speed = [generateRandomNumber(-this.interval, this.interval)/2000, 0.0, generateRandomNumber(-this.interval, this.interval)/2000];
    }
    var direction = [];
    if (speed[0] > 0) {
        direction[0] = 1;
    }
    else if (speed[0] < 0) {
        direction[0] = -1;
    }
    else
        direction[0] = 0;

    if (speed[1] > 0) {
        direction[1] = 1;
    }
    else if (speed[1] < 0) {
        direction[1] = -1;
    }
    else
        direction[1] = 0;

    if (speed[2] > 0) {
        direction[2] = 1;
    }
    else if (speed[2] < 0) {
        direction[2] = -1;
    }
    else
        direction[2] = 0;  

    var randomAppearTime = Math.floor((Math.random() * 3000) + 500);
    this.position = [20, 2000, 20];
    (function(obj, position, direction, speed) {
        setTimeout(function() {
            obj.position  = position;
            obj.direction = direction;
            obj.speed     = speed;
    }, randomAppearTime);
    })(this, position, direction, speed);
}

Orange.prototype.generateRandomOrange = function(obj) {
    var position = [generateRandomNumber(obj.XMin - 5, obj.XMax - 5), 2.0, generateRandomNumber(obj.ZMin - 5, obj.ZMax - 5)];
    var speed    = [generateRandomNumber(-this.interval, this.interval)/2000, 0.0, generateRandomNumber(-this.interval, this.interval)/2000];
    while(Math.abs(speed[0]) < (this.interval/5000) && Math.abs(speed[2]) < (this.interval/5000)) {
        speed = [generateRandomNumber(-this.interval, this.interval)/2000, 0.0, generateRandomNumber(-this.interval, this.interval)/2000];
    }
    var direction = [];
    if (speed[0] > 0) {
        direction[0] = 1;
    }
    else if (speed[0] < 0) {
        direction[0] = -1;
    }
    else
        direction[0] = 0;

    if (speed[1] > 0) {
        direction[1] = 1;
    }
    else if (speed[1] < 0) {
        direction[1] = -1;
    }
    else
        direction[1] = 0;

    if (speed[2] > 0) {
        direction[2] = 1;
    }
    else if (speed[2] < 0) {
        direction[2] = -1;
    }
    else
        direction[2] = 0;  

    this.position  = position;
    this.direction = direction;
    this.speed     = speed;
}