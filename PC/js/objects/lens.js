function Flare() {
    this.flares = [];
    this.flares[0] = {};
    this.flares[0].color = [1.0, 1.0, 0.3, 1.0];
    this.flares[0].distance = 0.01;
    this.flares[0].size = 900.0;
    this.flares[0].tex  = 7;

    this.flares[1] = {};
    this.flares[1].color = [0.3, 1.0, 1.0, 1.0];
    this.flares[1].distance = 0.07;
    this.flares[1].size = 800.0;
    this.flares[1].tex  = 7;

    this.flares[2] = {};
    this.flares[2].color = [1.0, 0.3, 1.0, 1.0];
    this.flares[2].distance = 0.1;
    this.flares[2].size = 800.0;
    this.flares[2].tex  = 9;

    this.flares[3] = {};
    this.flares[3].color = [0.3, 1.0, 1.0, 1.0];
    this.flares[3].distance = 0.2;
    this.flares[3].size = 500.0;
    this.flares[3].tex  = 7;

    this.flares[4] = {};
    this.flares[4].color = [0.3, 1.0, 1.0, 1.0];
    this.flares[4].distance = 0.3;
    this.flares[4].size = 700.0;
    this.flares[4].tex  = 7;

    this.flares[5] = {};
    this.flares[5].color = [1.0, 1.0, 0.3, 1.0];
    this.flares[5].distance = 0.25;
    this.flares[5].size = 700.0;
    this.flares[5].tex  = 8;

    this.flares[6] = {};
    this.flares[6].color = [1.0, 0.3, 1.0, 1.0];
    this.flares[6].distance = 0.35;
    this.flares[6].size = 500.0;
    this.flares[6].tex  = 9;

    this.flares[7] = {};
    this.flares[7].color = [1.0, 1.0, 1.0, 1.0];
    this.flares[7].distance = 0.25;
    this.flares[7].size = 1000.0;
    this.flares[7].tex  = 10;

    this.flareMaxSize = 0.5;
    this.flareScale = 0.2;
}

Flare.prototype.draw = function() {
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.SRC_ALPHA, gl.ONE);
    gl.disable(gl.DEPTH_TEST); 
    gl.uniform1i(shaderProgram.particleMode, 1);
    gl.uniform1i(shaderProgram.sun, 0);
    gl.uniform1i(shaderProgram.flare, 1);

    var lx = gameManager.sun.positionOnScreen.x, ly = gameManager.sun.positionOnScreen.y;
    var cx = gl.viewportWidth/2, cy = gl.viewportHeight/2;
    var dx, dy, px, py, maxflaredist, flaredist, flaremaxsize, flarescale, distscale, width, height, color = [], i;

    maxflaredist = Math.sqrt(cx*cx + cy*cy);
    flaredist    = Math.sqrt((lx - cx)*(lx - cx) + (ly - cy)*(ly - cy));
    distscale = (maxflaredist - flaredist) / maxflaredist;
    flaremaxsize = gl.viewportWidth * this.flareMaxSize;
    flarescale = gl.viewportWidth * this.flareScale;

    dx = cx + (cx - lx);
    dy = cy + (cy - ly);

    gl.activeTexture(gl.TEXTURE0);

    for(var i = 0; i < 8; i++) {
        gl.bindTexture(gl.TEXTURE_2D, textures[this.flares[i].tex]);
        gl.uniform4fv(gl.getUniformLocation(shaderProgram, "mat.diffuse"), this.flares[i].color);

        px = (1.0 - this.flares[i].distance)*lx + this.flares[i].distance*dx;
        py = (1.0 - this.flares[i].distance)*ly + this.flares[i].distance*dy;

        width = this.flares[i].size * distscale * this.flareScale;
        if (width > this.flaremaxsize)
            width = this.flaremaxsize;
        height = width * (gl.viewportWidth / gl.viewportHeight);

        gameManager.matrices.pushMatrix(modelID);

        mat4.translate(modelMatrix, modelMatrix, [px - width / 2, py - height / 2, 0.0]);
        mat4.scale(modelMatrix, modelMatrix, [width, height, height]);
        quadDraw();

        gameManager.matrices.popMatrix(modelID);
    }

    gl.uniform1i(shaderProgram.particleMode, 0);
    gl.uniform1i(shaderProgram.flare, 0);
    gl.bindTexture(gl.TEXTURE_2D, null);

    gl.disable(gl.BLEND); 
    gl.enable(gl.DEPTH_TEST);
}