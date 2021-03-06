function getShader(gl, id) {
    var shaderScript = document.getElementById(id);
    if (!shaderScript) {
        return null;
    }

    var str = "";
    var k = shaderScript.firstChild;
    while (k) {
        if (k.nodeType == 3) {
            str += k.textContent;
        }
        k = k.nextSibling;
    }

    var shader;
    if (shaderScript.type == "x-shader/x-fragment") {
        shader = gl.createShader(gl.FRAGMENT_SHADER);
    } else if (shaderScript.type == "x-shader/x-vertex") {
        shader = gl.createShader(gl.VERTEX_SHADER);
    } else {
        return null;
    }

    gl.shaderSource(shader, str);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
        alert(gl.getShaderInfoLog(shader));
        return null;
    }

    return shader;
}


var shaderProgram;

function initShaders() {
    var fragmentShader = getShader(gl, "shader-fs");
    var vertexShader = getShader(gl, "shader-vs");

    shaderProgram = gl.createProgram();
    gl.attachShader(shaderProgram, vertexShader);
    gl.attachShader(shaderProgram, fragmentShader);
    gl.linkProgram(shaderProgram);

    if (!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
        alert("Could not initialise shaders");
    }

    gl.useProgram(shaderProgram);

    shaderProgram.vertexPositionAttribute = gl.getAttribLocation(shaderProgram, "VertexPosition");
    gl.enableVertexAttribArray(shaderProgram.vertexPositionAttribute);

    shaderProgram.vertexNormalAttribute = gl.getAttribLocation(shaderProgram, "VertexNormal");
    gl.enableVertexAttribArray(shaderProgram.vertexNormalAttribute);

    shaderProgram.textureCoordAttribute = gl.getAttribLocation(shaderProgram, "texCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.vertexPositionAttribute2 = gl.getAttribLocation(shaderProgram, "vVertex");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.textureCoordAttribute2 = gl.getAttribLocation(shaderProgram, "vtexCoord");
    gl.enableVertexAttribArray(shaderProgram.textureCoordAttribute);

    shaderProgram.pvm_uniformId = gl.getUniformLocation(shaderProgram, "m_pvm");
    shaderProgram.vm_uniformId = gl.getUniformLocation(shaderProgram, "m_viewModel");
    shaderProgram.normal_uniformId = gl.getUniformLocation(shaderProgram, "m_normal");
    shaderProgram.texmap1 = gl.getUniformLocation(shaderProgram, "texmap1");
    shaderProgram.texmap2 = gl.getUniformLocation(shaderProgram, "texmap2");
    shaderProgram.texUse = gl.getUniformLocation(shaderProgram, "useTextures");
    shaderProgram.useLights = gl.getUniformLocation(shaderProgram, "useLights");
    shaderProgram.writeMode = gl.getUniformLocation(shaderProgram, "writingMode");
    shaderProgram.vWriteMode = gl.getUniformLocation(shaderProgram, "vWritingMode");
    shaderProgram.texMode = gl.getUniformLocation(shaderProgram, "texMode");
    shaderProgram.fogIsEnabled = gl.getUniformLocation(shaderProgram, "fogIsEnabled");
    shaderProgram.fogMode = gl.getUniformLocation(shaderProgram, "fogMode");
    shaderProgram.fogColor = gl.getUniformLocation(shaderProgram, "fogColor");
    shaderProgram.fogDensity = gl.getUniformLocation(shaderProgram, "fogDensity");
    shaderProgram.particleMode = gl.getUniformLocation(shaderProgram, "particle");
    shaderProgram.sun = gl.getUniformLocation(shaderProgram, "sun");
    shaderProgram.flare = gl.getUniformLocation(shaderProgram, "flare");
    shaderProgram.uniColor = gl.getUniformLocation(shaderProgram, "overrideColor");
    shaderProgram.alpha    = gl.getUniformLocation(shaderProgram, "alpha");
}

