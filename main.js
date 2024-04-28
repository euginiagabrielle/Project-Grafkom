var GL;
//drawLine
var line = [];
var kumisAtas = [];
var kumisKiri = [];
var kumisKanan = [];
var mouthVertical = [];
var test = [];

class MyObject {
    object_vertex = [];
    OBJECT_VERTEX = GL.createBuffer();

    object_faces = [];
    OBJECT_FACES = GL.createBuffer();

    shader_vertex_source;
    shader_fragment_source;

    child = [];

    compile_shader = function (source, type, typeString) {
        var shader = GL.createShader(type);
        GL.shaderSource(shader, source);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
            alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
            return false;
        }
        return shader;
    }

    nama;
    shader_vertex;
    shader_fragment;
    SHADER_PROGRAM;
    _Pmatrix;
    _Vmatrix;
    _Mmatrix;
    _color;
    _position;
    MOVEMATRIX = LIBS.get_I4();

    rotate = [0, 0, 0];
    translate = [0, 0, 0];
    scale = [1, 1, 1];


    constructor(name, object_vertex, object_faces, shader_vertex_source, shader_fragment_source) {
        this.nama = name;
        this.object_vertex = object_vertex;
        this.object_faces = object_faces;
        this.shader_vertex_source = shader_vertex_source;
        this.shader_fragment_source = shader_fragment_source;

        this.shader_vertex = this.compile_shader(this.shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
        this.shader_fragment = this.compile_shader(this.shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");

        this.SHADER_PROGRAM = GL.createProgram();
        GL.attachShader(this.SHADER_PROGRAM, this.shader_vertex);
        GL.attachShader(this.SHADER_PROGRAM, this.shader_fragment);

        GL.linkProgram(this.SHADER_PROGRAM);

        this._Pmatrix = GL.getUniformLocation(this.SHADER_PROGRAM, "Pmatrix");
        this._Vmatrix = GL.getUniformLocation(this.SHADER_PROGRAM, "Vmatrix");
        this._Mmatrix = GL.getUniformLocation(this.SHADER_PROGRAM, "Mmatrix");

        this._color = GL.getAttribLocation(this.SHADER_PROGRAM, "color");
        this._position = GL.getAttribLocation(this.SHADER_PROGRAM, "position");

        GL.enableVertexAttribArray(this._color);
        GL.enableVertexAttribArray(this._position);

        GL.useProgram(this.SHADER_PROGRAM);

        this.initializeBuffer();
    }

    initializeBuffer() {
        GL.bindBuffer(GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.object_vertex), GL.STATIC_DRAW);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.object_faces), GL.STATIC_DRAW);
    }
    setuniformmatrix4(PROJMATRIX, VIEWMATRIX) {
        GL.useProgram(this.SHADER_PROGRAM);
        GL.uniformMatrix4fv(this._Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(this._Vmatrix, false, VIEWMATRIX);
        GL.uniformMatrix4fv(this._Mmatrix, false, this.MOVEMATRIX);
        this.child.forEach(obj => {
            obj.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        });
    }
    draw() {
        GL.useProgram(this.SHADER_PROGRAM);
        GL.bindBuffer(GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        GL.vertexAttribPointer(this._position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(this._color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        GL.drawElements(GL.TRIANGLES, this.object_faces.length, GL.UNSIGNED_SHORT, 0);
        this.child.forEach(obj => {
            if (line.includes(obj) | kumisAtas.includes(obj) | kumisKiri.includes(obj) | kumisKanan.includes(obj) | mouthVertical.includes(obj)) {
                obj.drawLine();
            } else {
                obj.draw();
            }
        })
    }
    drawLine() {
        GL.useProgram(this.SHADER_PROGRAM);
        GL.bindBuffer(GL.ARRAY_BUFFER, this.OBJECT_VERTEX);
        GL.vertexAttribPointer(this._position, 3, GL.FLOAT, false, 4 * (3 + 3), 0);
        GL.vertexAttribPointer(this._color, 3, GL.FLOAT, false, 4 * (3 + 3), 3 * 4);
        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.OBJECT_FACES);
        GL.drawElements(GL.LINE_STRIP, this.object_faces.length, GL.UNSIGNED_SHORT, 0);
        this.child.forEach(obj => {
            if (line.includes(obj) | kumisAtas.includes(obj) | kumisKiri.includes(obj) | kumisKanan.includes(obj) | mouthVertical.includes(obj)) {
                obj.drawLine();
            } else {
                obj.draw();
            }
        })
    }
    setRotateMove(PHI, THETA, r) {
        let rot = glMatrix.quat.fromEuler(glMatrix.quat.create(), this.rotate[0] + PHI, this.rotate[1] + THETA, this.rotate[2] + r);
        let trans = glMatrix.vec3.fromValues(this.translate[0], this.translate[1], this.translate[2]);
        let scale = glMatrix.vec3.fromValues(this.scale[0], this.scale[1], this.scale[2]);
        let ori = glMatrix.vec3.fromValues(-this.translate[0], -this.translate[1], -this.translate[2]); 
        glMatrix.mat4.fromRotationTranslationScaleOrigin(this.MOVEMATRIX, rot, trans, scale, ori);
        this.child.forEach(obj => {
            obj.setRotateMove(PHI, THETA, r);
        });
    }
    setRotate(PHI, THETA, r) {
        this.rotate[0] += PHI;
        this.rotate[1] += THETA;
        this.rotate[2] += r;
        this.child.forEach(obj => {
            obj.setRotate(PHI, THETA, r);
        });
    }
    setTranslateMove(x, y, z) {
        this.translate[0] += x;
        this.translate[1] += y;
        this.translate[2] += z;
        // glMatrix.mat4.translate(this.MOVEMATRIX, this.MOVEMATRIX, [x,y,z]);
        // console.log(this.nama);

        this.child.forEach(obj => {
            obj.setTranslateMove(x, y, z);
        });

    }
    setScale(s) {
        let x = this.scale[0] * s;
        let y = this.scale[1] * s;
        let z = this.scale[2] * s;
        this.scale = [x, y, z];
        this.child.forEach(obj => {
            obj.setScale(s);
        });
    }
    addScale(s) {
        let x = this.scale[0] + s;
        this.scale = [x, x,x];
        this.child.forEach(obj => {
            obj.addScale(s);
        });
    }
    fixScale(s) {
        this.scale = [s,s,s];
        this.child.forEach(obj => {
            obj.fixScale(s);
        });
    }
    setIdentityMove() {
        LIBS.set_I4(this.MOVEMATRIX);
        this.child.forEach(obj => {
            obj.setIdentityMove();
        });
    }
    addChild(child) {
        this.child.push(child);
    }
    addChilds(child) {
        child.forEach(obj => {
            this.child.push(obj);
        });
    }
}

class objectTexture {
    CANVAS = document.getElementById("your_canvas");
    cube_vertex = [];
    CUBE_VERTEX;
    cube_faces = [];
    CUBE_FACES;
    shader_vertex_source = null;
    shader_fragment_source = null;

    MOVEMATRIX = LIBS.get_I4();

    child = [];

    compile_shader = function (source, type, typeString) {
        var shader = GL.createShader(type);
        GL.shaderSource(shader, source);
        GL.compileShader(shader);
        if (!GL.getShaderParameter(shader, GL.COMPILE_STATUS)) {
            alert("ERROR IN " + typeString + " SHADER: " + GL.getShaderInfoLog(shader));
            return false;
        }
        return shader;
    };

    shader_vertex;
    shader_fragment;

    _Pmatrix;
    _Vmatrix;
    _Mmatrix;
    _sampler;
    cube_texture;


    _color;
    _position;

    SHADER_PROGRAM = GL.createProgram();

    constructor(cube_vertex, cube_faces, shader_vertex, shader_fragment, texture) {
        this.cube_vertex = cube_vertex;
        this.cube_faces = cube_faces;
        this.shader_vertex_source = shader_vertex;
        this.shader_fragment_source = shader_fragment;

        this.shader_vertex = this.compile_shader(this.shader_vertex_source, GL.VERTEX_SHADER, "VERTEX");
        this.shader_fragment = this.compile_shader(this.shader_fragment_source, GL.FRAGMENT_SHADER, "FRAGMENT");

        this.SHADER_PROGRAM = GL.createProgram();

        GL.attachShader(this.SHADER_PROGRAM, this.shader_vertex);
        GL.attachShader(this.SHADER_PROGRAM, this.shader_fragment);

        GL.linkProgram(this.SHADER_PROGRAM);

        this._Pmatrix = GL.getUniformLocation(this.SHADER_PROGRAM, "Pmatrix");
        this._Vmatrix = GL.getUniformLocation(this.SHADER_PROGRAM, "Vmatrix");
        this._Mmatrix = GL.getUniformLocation(this.SHADER_PROGRAM, "Mmatrix");

        this._sampler = GL.getUniformLocation(this.SHADER_PROGRAM, "sampler");

        this._color = GL.getAttribLocation(this.SHADER_PROGRAM, "uv");
        this._position = GL.getAttribLocation(this.SHADER_PROGRAM, "position");

        GL.enableVertexAttribArray(this._color);
        GL.enableVertexAttribArray(this._position);

        GL.useProgram(this.SHADER_PROGRAM);
        GL.uniform1i(this._sampler, 0);

        this.CUBE_VERTEX = GL.createBuffer();
        this.CUBE_FACES = GL.createBuffer();

        GL.bindBuffer(GL.ARRAY_BUFFER, this.CUBE_VERTEX);
        GL.bufferData(GL.ARRAY_BUFFER, new Float32Array(this.cube_vertex), GL.STATIC_DRAW);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.CUBE_FACES);
        GL.bufferData(GL.ELEMENT_ARRAY_BUFFER,
            new Uint16Array(this.cube_faces),
            GL.STATIC_DRAW);

        this.cube_texture = LIBS.loadTexture(texture); 
    }
    setuniformmatrix4(PROJMATRIX, VIEWMATRIX) {
        GL.useProgram(this.SHADER_PROGRAM);
        GL.uniformMatrix4fv(this._Pmatrix, false, PROJMATRIX);
        GL.uniformMatrix4fv(this._Vmatrix, false, VIEWMATRIX);
        GL.uniformMatrix4fv(this._Mmatrix, false, this.MOVEMATRIX);

    }
    draw() {
        GL.useProgram(this.SHADER_PROGRAM);
        GL.activeTexture(GL.TEXTURE0);
        GL.bindTexture(GL.TEXTURE_2D, this.cube_texture);

        GL.bindBuffer(GL.ARRAY_BUFFER, this.CUBE_VERTEX);
        GL.vertexAttribPointer(this._position, 3, GL.FLOAT, false, 4 * (3 + 2), 0);
        GL.vertexAttribPointer(this._color, 2, GL.FLOAT, false, 4 * (3 + 2), 3 * 4);

        GL.bindBuffer(GL.ELEMENT_ARRAY_BUFFER, this.CUBE_FACES);
        GL.drawElements(GL.TRIANGLE_STRIP, this.cube_faces.length, GL.UNSIGNED_SHORT, 0);
        //GL.drawArrays(GL.TRIANGLES, 0, this.cube_vertex.length/6);
        for (let i = 0; i < this.child.length; i++) {
            this.child[i].draw();
        }
    }
    getMoveMatrix() {
        return this.MOVEMATRIX;
    }
    setRotateMove(phi, theta, r) {
        LIBS.rotateZ(this.MOVEMATRIX, r);
        LIBS.rotateY(this.MOVEMATRIX, theta);
        LIBS.rotateX(this.MOVEMATRIX, phi);
    }
    setTranslateMove(x, y, z) {
        LIBS.translateX(this.MOVEMATRIX, z);
        LIBS.translateX(this.MOVEMATRIX, y);
        LIBS.translateX(this.MOVEMATRIX, x);
    }
    setIdentityMove() {
        LIBS.set_I4(this.MOVEMATRIX);
    }
    addChild(child) {
        this.child.push(child);
    }
}

function main() {
    var CANVAS = document.getElementById('mycanvas');

    CANVAS.width = window.innerWidth;
    CANVAS.height = window.innerHeight;

    var drag = false;
    var x_prev, y_prev;
    var dX = 0, dY = 0;
    var THETA = 0, PHI = 0;
    var AMORTIZATION = 0.8;

    var keyDown = function (e) {
        drag = true;
        if (e.key == "a" | e.key == "A" | e.key == "ArrowLeft") {
            dX = -0.02;
            dY = 0;
            THETA += dX;
            x_prev = e.pageX;
        }
        if (e.key == "d" | e.key == "D" | e.key == "ArrowRight") {
            dX = 0.02;
            dY = 0;
            THETA += dX;
            x_prev = e.pageX;
        }
        if (e.key == "w" | e.key == "W" | e.key == "ArrowUp") {
            dY = -0.02;
            dX = 0;
            PHI += dY;
            y_prev = e.pageY;
        }
        if (e.key == "s" | e.key == "S" | e.key == "ArrowDown") {
            dY = 0.02;
            dX = 0;
            PHI += dY;
            y_prev = e.pageY;
        }
        return false;
    };
    var keyPress = function (e) {
        drag = true;
        if (e.key == "ArrowLeft") {
            dX = -0.02;
            dY = 0;
            THETA += dX;
            x_prev = e.pageX;
        }
        if (e.key == "ArrowRight") {
            dX = 0.02;
            dY = 0;
            THETA += dX;
            x_prev = e.pageX;
        }
        if (e.key == "ArrowDown") {
            dY = -0.02;
            dX = 0;
            PHI += dY;
            y_prev = e.pageY;
        }
        if (e.key == "ArrowUp") {
            dY = 0.02;
            dX = 0;
            PHI += dY;
            y_prev = e.pageY;
        }
        return false;

    };
    var keyUp = function (e) {
        drag = false;
        return false;

    };

    window.addEventListener("keydown", keyDown, false);
    window.addEventListener("keyup", keyUp, false);
    window.addEventListener("keypress", keyPress, false);

    var mouseDown = function (e) {
        drag = true;
        x_prev = e.pageX;
        y_prev = e.pageY;
        e.preventDefault();
        return false;
    };
    var mouseUp = function (e) {
        drag = false;
    };
    var mouseMove = function (e) {
        if (!drag) {
            return false;
        }
        dX = (e.pageX - x_prev) * 2 * Math.PI / CANVAS.width;
        dY = (e.pageY - y_prev) * 2 * Math.PI / CANVAS.height;
        THETA += dX;
        PHI += dY;
        x_prev = e.pageX;
        y_prev = e.pageY;
        e.preventDefault();
    }

    CANVAS.addEventListener("mousedown", mouseDown, false);
    CANVAS.addEventListener("mouseup", mouseUp, false);
    CANVAS.addEventListener("mouseout", mouseUp, false);
    CANVAS.addEventListener("mousemove", mouseMove, false);

    //INISIALISASI
    try {
        GL = CANVAS.getContext("webgl", { antialias: true });
    } catch {
        alert("WebGL context cannot be initialized");
        return false;
    }

    //SHADERS
    var shader_vertex_source = `
    attribute vec3 position;
    attribute vec3 color;

    uniform mat4 Pmatrix;
    uniform mat4 Vmatrix;
    uniform mat4 Mmatrix;

    varying vec3 vColor;
    void main(void){
        gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.0);
        gl_PointSize = 20.0;
        vColor = color;
    }
    `

    var shader_fragment_source = `
    precision mediump float;
    varying vec3 vColor;
    void main(void){
        gl_FragColor = vec4(vColor,1.0);
    }
    `

    var shader_vertex_sourceTex = "\n\
  attribute vec3 position;\n\
  uniform mat4 Pmatrix, Vmatrix, Mmatrix;\n\
  attribute vec2 uv;\n\
  varying vec2 vUV;\n\
  \n\
  void main(void) {\n\
  gl_Position = Pmatrix * Vmatrix * Mmatrix * vec4(position, 1.);\n\
  vUV=uv;\n\
  }";

    var shader_fragment_sourceTex = "\n\
  precision mediump float;\n\
  uniform sampler2D sampler;\n\
  varying vec2 vUV;\n\
  \n\
  \n\
  void main(void) {\n\
  gl_FragColor = texture2D(sampler, vUV);\n\
  //gl_FragColor = vec4(1.,1.,1.,1.);\n\
  }";

    function addXYZ(vertex, newX, newY, newZ) {
        console.log(vertex);
        for (let index = 0; index < vertex.length; index += 6) {
            vertex[index] += newX;
            vertex[index + 1] += newY;
            vertex[index + 2] += newZ;
        }
    }
    function createElips(radius, sectorCount, stackCount, factorX, factorY, factorZ, moveX, moveY, moveZ, c1, c2, c3) {
        elipsHead_vertex = [];
        elipsHead_faces = [];
        var sectorStep = 2 * Math.PI / sectorCount;
        var stackStep = Math.PI / stackCount;
        var sectorAngle, stackAngle;
        for (let i = 0; i <= stackCount; ++i) {
            let titik_x, titik_y, titik_z, xy;

            stackAngle = Math.PI / 2 - i * stackStep;
            xy = radius * Math.cos(stackAngle);
            titik_z = factorZ * radius * Math.sin(stackAngle);

            for (let j = 0; j <= sectorCount; ++j) {
                sectorAngle = j * sectorStep;

                // vertex position (x, y, z)
                titik_x = factorX * xy * Math.cos(sectorAngle);   // r * cos(u) * cos(v)
                titik_y = factorY * xy * Math.sin(sectorAngle);   // r * cos(u) * sin(v)
                elipsHead_vertex.push(titik_x + moveX);
                elipsHead_vertex.push(titik_y + moveY);
                elipsHead_vertex.push(titik_z + moveZ);
                elipsHead_vertex.push(c1);
                elipsHead_vertex.push(c2);
                elipsHead_vertex.push(c3);
            }
        }

        var k1, k2;
        for (let i = 0; i < stackCount; ++i) {
            k1 = i * (sectorCount + 1);     // beginning of current stack
            k2 = k1 + sectorCount + 1;      // beginning of next stack

            for (let j = 0; j < sectorCount; ++j, ++k1, ++k2) {
                // 2 triangles per sector excluding first and last stacks
                // k1 => k2 => k1+1
                if (i != 0) {
                    elipsHead_faces.push(k1);
                    elipsHead_faces.push(k2);
                    elipsHead_faces.push(k1 + 1);
                }                    // k1+1 => k2 => k2+1
                if (i != (stackCount - 1)) {
                    elipsHead_faces.push(k1 + 1);
                    elipsHead_faces.push(k2);
                    elipsHead_faces.push(k2 + 1);
                }
            }
        }
        return [elipsHead_vertex, elipsHead_faces];
    };
    function createElipPara(radius, sectorCount, stackCount, factorX, factorY, factorZ, moveX, moveY, moveZ, c1, c2, c3) {
        var elipPara_vertex = [];
        var elipPara_faces = [];
        var x, y, z, xy;                              // vertex position
        var sectorStep = 2 * Math.PI / sectorCount;
        var stackStep = Math.PI / stackCount;
        var sectorAngle, stackAngle;
        for (let i = 0; i <= stackCount / 2; ++i) {

            stackAngle = Math.PI / 2 - i * stackStep;        // starting from pi/2 to -pi/2
            xy = radius * Math.cos(stackAngle);             // r * cos(u)
            z = factorZ * radius * Math.sin(stackAngle);              // r * sin(u)

            // add (sectorCount+1) vertices per stack
            // first and last vertices have same position and normal, but different tex coords
            for (let j = 0; j <= sectorCount; ++j) {

                sectorAngle = j * sectorStep;           // starting from 0 to 2pi

                // vertex position (x, y, z)
                x = factorX * xy * Math.cos(sectorAngle);             // r * cos(u) * cos(v)
                y = factorY * xy * Math.sin(sectorAngle);             // r * cos(u) * sin(v)   
                elipPara_vertex.push(x);
                elipPara_vertex.push(y);
                elipPara_vertex.push(z);
                elipPara_vertex.push(c1, c2, c3);
            }
        }
        for (let index = 0; index < elipsHead_vertex.length; index += 6) {
            elipPara_vertex[index] += moveX;
            elipPara_vertex[index + 1] += moveY;
            elipPara_vertex[index + 2] += moveZ;
        }
        var k1, k2;
        for (let i = 0; i < stackCount; ++i) {
            k1 = i * (sectorCount + 1);     // beginning of current stack
            k2 = k1 + sectorCount + 1;      // beginning of next stack

            for (let j = 0; j < sectorCount; ++j, ++k1, ++k2) {
                // 2 triangles per sector excluding first and last stacks
                // k1 => k2 => k1+1
                if (i != 0) {
                    elipPara_faces.push(k1);
                    elipPara_faces.push(k2);
                    elipPara_faces.push(k1 + 1);
                }

                // k1+1 => k2 => k2+1
                if (i != (stackCount - 1)) {
                    elipPara_faces.push(k1 + 1);
                    elipPara_faces.push(k2);
                    elipPara_faces.push(k2 + 1);
                }
            }
        }
        return [elipPara_vertex, elipPara_faces];
    };

    function createTabung(r, xUp, yUp, zOrigin, zUp, c1, c2, c3, vertex, faces) {
        for (let index = 0; index <= 360; index++) {
            var x = r * Math.cos(LIBS.degToRad(index));
            var y = r * Math.sin(LIBS.degToRad(index));
            vertex.push(x);
            vertex.push(y);
            vertex.push(0);
            vertex.push(c1, c2, c3);
        }
        vertex.push(0, 0, zUp, c1, c2, c3);
        for (let index = 0; index <= 360; index++) {
            var x = r * Math.cos(LIBS.degToRad(index));
            var y = r * Math.sin(LIBS.degToRad(index));
            vertex.push(x);
            vertex.push(y);
            vertex.push(zUp);
            vertex.push(c1, c2, c3);
        }

        var faces = [];
        for (let index = 0; index <= 360; index++) {
            faces.push(0, index, index + 1);
        }
        for (let index = 362; index <= 722; index++) {
            faces.push(362, index, index + 1);
        }
        for (let index = 0; index <= 360; index++) {
            faces.push(index + 361, index, index + 362);
        }
        for (let index = 0; index <= 360; index++) {
            faces.push(index + 362, index + 1, index);
        }
        return [vertex, faces];
    };
    function createTabungH(r, depth, c1, c2, c3) {
        let vertex = [];
        for (let index = 0; index <= 360; index++) {
            var y = r * Math.cos(LIBS.degToRad(index));
            var z = r * Math.sin(LIBS.degToRad(index));
            vertex.push(0);
            vertex.push(y);
            vertex.push(z);
            vertex.push(c1, c2, c3);
        }
        vertex.push(depth, 0, 0, c1, c2, c3);
        for (let index = 0; index <= 360; index++) {
            var y = r * Math.cos(LIBS.degToRad(index));
            var z = r * Math.sin(LIBS.degToRad(index));
            vertex.push(depth);
            vertex.push(y);
            vertex.push(z);
            vertex.push(c1, c2, c3);
        }

        var faces = [];
        for (let index = 0; index <= 360; index++) {
            faces.push(0, index, index + 1);
        }
        for (let index = 362; index <= 722; index++) {
            faces.push(362, index, index + 1);
        }
        for (let index = 0; index <= 360; index++) {
            faces.push(index + 361, index, index + 362);
        }
        for (let index = 0; index <= 360; index++) {
            faces.push(index + 362, index + 1, index);
        }
        return [vertex, faces];
    };
    function generateTabung(name, initX, initY, initZ, incX, incY, incZ, depth, r, c1, c2, c3, count) {
        var objects = [];
        for (let index = 0; index < count; index++) {
            var pangkalKiri_vertex = [];
            var pangkalKiri_faces = [];
            var temp = createTabung(r, 0, 0, 0, depth, c1, c2, c3, pangkalKiri_vertex, pangkalKiri_faces);
            pangkalKiri_vertex = temp[0];
            pangkalKiri_faces = temp[1];
            var object1 = new MyObject(name, pangkalKiri_vertex, pangkalKiri_faces, shader_vertex_source, shader_fragment_source);
            object1.translate = [initX, initY, initZ];
            objects.push(object1);
            initX += incX;
            initY += incY;
            initZ += depth;
        }
        return objects;
    };
    function generateBiggerStraight(name, initX, initY, initZ, depth, r, incR, c1, c2, c3, count) {
        var objects = [];
        for (let index = 0; index < count; index++) {
            var pangkalKiri_vertex = [];
            var pangkalKiri_faces = [];
            var temp = createTabung(r, initX, initY, initZ, depth, c1, c2, c3, pangkalKiri_vertex, pangkalKiri_faces);
            r += incR;
            initZ += depth * 0.5;
            pangkalKiri_vertex = temp[0];
            pangkalKiri_faces = temp[1];
            var object1 = new MyObject(name, pangkalKiri_vertex, pangkalKiri_faces, shader_vertex_source, shader_fragment_source);
            object1.translate = [initX, initY, initZ];
            objects.push(object1);
        }
        return objects;
    };
    function customTabung(r, xUp, yUp, zOrigin, zUp, c1, c2, c3, vertex, faces, factorX, factorY) {
        for (let index = 0; index <= 360; index++) {
            var x = factorX * r * Math.cos(LIBS.degToRad(index));
            var y = factorY * r * Math.sin(LIBS.degToRad(index));
            vertex.push(x + xUp);
            vertex.push(y + yUp);
            vertex.push(zOrigin);
            vertex.push(c1, c2, c3);
        }
        vertex.push(xUp, yUp, zOrigin + zUp, c1, c2, c3);
        for (let index = 0; index <= 360; index++) {
            var x = factorX * r * Math.cos(LIBS.degToRad(index));
            var y = factorY * r * Math.sin(LIBS.degToRad(index));
            vertex.push(x + xUp);
            vertex.push(y + yUp);
            vertex.push(zOrigin + zUp);
            vertex.push(c1, c2, c3);
        }

        var faces = [];
        for (let index = 0; index <= 360; index++) {
            faces.push(0, index, index + 1);
        }
        for (let index = 362; index <= 722; index++) {
            faces.push(362, index, index + 1);
        }
        for (let index = 0; index <= 360; index++) {
            faces.push(index + 361, index, index + 362);
        }
        for (let index = 0; index <= 360; index++) {
            faces.push(index + 362, index + 1, index);
        }
        return [vertex, faces];
    };

    //env start
    var envSean = new MyObject("env", [],[], shader_vertex_source, shader_fragment_source);

    var persegi_vertex = [
        12, -0.8, 6,    0,0,
        -12,-0.8,6,     1,0,
        12,-0.8,-6,     0,1,
        -12,-0.8,-6,    1,1,
      ];

    persegi_faces = [
        0, 1, 2, 2, 1, 3
    ];
    var lantai = new objectTexture(persegi_vertex, persegi_faces, shader_vertex_sourceTex, shader_fragment_sourceTex, "ressources/floor2.jpeg");
    envSean.addChild(lantai);
    var persegi_vertex = [
        12, -0.81, 6,    0,0,0,
        -12,-0.81,6,     0,0,0,
        12,-0.81,-6,     0,0,0,
        -12,-0.81,-6,    0,0,0,

        12, -1.5, 6,    0,0,0,
        -12,-1.5,6,     0,0,0,
        12,-1.5,-6,     0,0,0,
        -12,-1.5,-6,    0,0,0
      ];
      persegi_faces = [
        0, 1, 2, 2, 1, 3,
        4,5,6, 6,5,7,
        7,6,2, 7,2,3,
        5,6,2, 5,2,1,
        4,7,3, 4,3,0,
        4,5,1, 4,1,0
    ];
    var dasar = new MyObject("persegi", persegi_vertex, persegi_faces, shader_vertex_source, shader_fragment_source);
    envSean.addChild(dasar);
    
    var persegi_vertex = [
        -6,-0.8,-6,    0,0,
        6,-0.8,-6,     1,0,
        6,5,-6,     1,1,
        -6,5,-6,    0,1,
      ];

    persegi_faces = [
        0, 1, 2, 0,2,3
    ];
    var tembokTengah = new objectTexture(persegi_vertex, persegi_faces, shader_vertex_sourceTex, shader_fragment_sourceTex, "ressources/stageWallMid.jpg");
    envSean.addChild(tembokTengah);

    var persegi_vertex = [
        -12,-0.8,-5,    0,0,
        -6,-0.8,-5,     1,0,
        -6,5,-5,     1,1,
        -12,5,-5,    0,1,
      ];

    persegi_faces = [
        0, 1, 2, 0,2,3
    ];
    var tembokKanan = new objectTexture(persegi_vertex, persegi_faces, shader_vertex_sourceTex, shader_fragment_sourceTex, "ressources/stageWall.jpg");
    envSean.addChild(tembokKanan);

    var persegi_vertex = [
        12,-0.8,-5,    0,0,
        6,-0.8,-5,     1,0,
        6,5,-5,     1,1,
        12,5,-5,    0,1,
      ];

    persegi_faces = [
        0, 1, 2, 0,2,3
    ];
    var tembokKiri = new objectTexture(persegi_vertex, persegi_faces, shader_vertex_sourceTex, shader_fragment_sourceTex, "ressources/stageWall.jpg");
    envSean.addChild(tembokKiri);
    //...
    //env end

    //Sean start
    
    //...
    //Sean end

    //Euginia start
    
    //...
    //Euginia end

    //Willy start
    
    //...
    //Willy end
    
    //MATRIX
    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    var VIEWMATRIX = LIBS.get_I4();


    //DRAWING
    GL.clearColor(0.0, 0.0, 0.0, 0.0);

    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);

    GL.clearDepth(1.0);


    var time_prev = 0;
    var animate = function (time) {
        if (time > 0) {
            var dt = time - time_prev;
            if (!drag) {
                dX *= AMORTIZATION;
                dY *= AMORTIZATION;
                THETA += dX;
                PHI += dY;
            }
            //cam rotate
            LIBS.set_I4(VIEWMATRIX);
            LIBS.rotateY(VIEWMATRIX, THETA);
            LIBS.rotateX(VIEWMATRIX, PHI);
            LIBS.translateZ(VIEWMATRIX, -15);
            LIBS.translateY(VIEWMATRIX, -1);

            //Sean start
            //...
            //Sean end
        
            //Euginia start
            
            //...
            //Euginia end
        
            //Willy start
            
            //...
            //Willy end
            
            time_prev = time;
        }
        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);

        //env start
        envSean.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        envSean.draw();
        envSean.setIdentityMove();
        //...
        //env end
        
        //Sean start
        
        //...
        //Sean end
        
        //Euginia start
            
        //...
        //Euginia end
        
        //Willy start
            
        //...
        //Willy end
        
        
        GL.flush();
        window.requestAnimationFrame(animate);
    }

    animate();
}
window.addEventListener('load', main);
