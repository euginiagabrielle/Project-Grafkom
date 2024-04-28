var GL;
//drawLine
var lineSean = [];
var kumisAtasSean = [];
var kumisKiriSean = [];
var kumisKananSean = [];
var mouthVerticalSean = [];

var alis = [];
var kumis_Atas = [];
var kumis_Bawah = [];
var arrmulut = [];


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
            if (lineSean.includes(obj) | kumisAtasSean.includes(obj) | kumisKiriSean.includes(obj) | kumisKananSean.includes(obj) | mouthVerticalSean.includes(obj)) {
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
            if (lineSean.includes(obj) | kumisAtasSean.includes(obj) | kumisKiriSean.includes(obj) | kumisKananSean.includes(obj) | mouthVerticalSean.includes(obj)) {
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
    function generateBSpline(controlPoint, m, degree, xUp, yUp, zUp){
        var curves = [];
        var knotVector = []
       
        var n = controlPoint.length/2;
       
       
        // Calculate the knot values based on the degree and number of control points
        for (var i = 0; i < n + degree+1; i++) {
          if (i < degree + 1) {
            knotVector.push(0);
          } else if (i >= n) {
            knotVector.push(n - degree);
          } else {
            knotVector.push(i - degree);
          }
        }
       
    
       
        var basisFunc = function(i,j,t){
            if (j == 0){
              if(knotVector[i] <= t && t<(knotVector[(i+1)])){ 
                return 1;
              }else{
                return 0;
              }
            }
       
            var den1 = knotVector[i + j] - knotVector[i];
            var den2 = knotVector[i + j + 1] - knotVector[i + 1];
       
            var term1 = 0;
            var term2 = 0;
       
       
            if (den1 != 0 && !isNaN(den1)) {
              term1 = ((t - knotVector[i]) / den1) * basisFunc(i,j-1,t);
            }
       
            if (den2 != 0 && !isNaN(den2)) {
              term2 = ((knotVector[i + j + 1] - t) / den2) * basisFunc(i+1,j-1,t);
            }
       
            return term1 + term2;
        }
       
       
        for(var t=0;t<m;t++){
          var x=0;
          var y=0;
       
          var u = (t/m * (knotVector[controlPoint.length/2] - knotVector[degree]) ) + knotVector[degree] ;
       
          //C(t)
          for(var key =0;key<n;key++){
       
            var C = basisFunc(key,degree,u);
            // console.log(C);
            x+=(controlPoint[key*2] * C);
            y+=(controlPoint[key*2+1] * C);
            // console.log(t+" "+degree+" "+x+" "+y+" "+C);
          }
          curves.push(x+xUp);
          curves.push(y+yUp);
          curves.push(zUp);
          curves.push(0,0,0);
       
        }
        // console.log(curves)
        return curves;
    }

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
    var pot1 = generateBiggerStraight("pot1", 0, 0, 0, 0.3, 0.3, 0.1, 233/255,220/255,201/255, 4);
    pot1.forEach(obj => {
        obj.translate[0] += 10;
        obj.translate[1] += 4;
        obj.translate[2] += -0.95;
        obj.rotate[0] = -90;
        envSean.addChild(obj);
    });
    var pot2 = generateBiggerStraight("pot1", 0, 0, 0, 0.3, 0.3, 0.1, 233/255,220/255,201/255, 4);
    pot2.forEach(obj => {
        obj.translate[0] += 8;
        obj.translate[1] += 4;
        obj.translate[2] += -0.95;
        obj.rotate[0] = -90;
        envSean.addChild(obj);
    });
    var pot3 = generateBiggerStraight("pot1", 0, 0, 0, 0.3, 0.3, 0.1, 233/255,220/255,201/255, 4);
    pot3.forEach(obj => {
        obj.translate[0] += -10;
        obj.translate[1] += 4;
        obj.translate[2] += -0.95;
        obj.rotate[0] = -90;
        envSean.addChild(obj);
    });
    var pot4 = generateBiggerStraight("pot1", 0, 0, 0, 0.3, 0.3, 0.1, 233/255,220/255,201/255, 4);
    pot4.forEach(obj => {
        obj.translate[0] += -8;
        obj.translate[1] += 4;
        obj.translate[2] += -0.95;
        obj.rotate[0] = -90;
        envSean.addChild(obj);
    });
    var pot5 = generateBiggerStraight("pot1", 0, 0, 0, 0.3, 0.3, 0.1, 233/255,220/255,201/255, 4);
    pot5.forEach(obj => {
        obj.translate[0] += 10;
        obj.translate[1] += -5;
        obj.translate[2] += -0.95;
        obj.rotate[0] = -90;
        envSean.addChild(obj);
    });
    var pot6 = generateBiggerStraight("pot1", 0, 0, 0, 0.3, 0.3, 0.1, 233/255,220/255,201/255, 4);
    pot6.forEach(obj => {
        obj.translate[0] += -10;
        obj.translate[1] += -5;
        obj.translate[2] += -0.95;
        obj.rotate[0] = -90;
        envSean.addChild(obj);
    });
    var pot7 = generateBiggerStraight("pot1", 0, 0, 0, 0.3, 0.3, 0.1, 233/255,220/255,201/255, 4);
    pot7.forEach(obj => {
        obj.translate[0] += 2;
        obj.translate[1] += -6.6;
        obj.translate[2] += -1.65;
        obj.rotate[0] = -90;
        envSean.addChild(obj);
    });
    var pot8 = generateBiggerStraight("pot1", 0, 0, 0, 0.3, 0.3, 0.1, 233/255,220/255,201/255, 4);
    pot8.forEach(obj => {
        obj.translate[0] += -2;
        obj.translate[1] += -6.6;
        obj.translate[2] += -1.65;
        obj.rotate[0] = -90;
        envSean.addChild(obj);
    });
    var pot9 = generateBiggerStraight("pot1", 0, 0, 0, 0.3, 0.3, 0.1, 233/255,220/255,201/255, 4);
    pot9.forEach(obj => {
        obj.translate[0] += 0.65;
        obj.translate[1] += -6.6;
        obj.translate[2] += -1.65;
        obj.rotate[0] = -90;
        envSean.addChild(obj);
    });
    var pot10 = generateBiggerStraight("pot1", 0, 0, 0, 0.3, 0.3, 0.1, 233/255,220/255,201/255, 4);
    pot10.forEach(obj => {
        obj.translate[0] += -0.65;
        obj.translate[1] += -6.6;
        obj.translate[2] += -1.65;
        obj.rotate[0] = -90;
        envSean.addChild(obj);
    });

    var kaktus = new MyObject("kaktus", [], [], shader_vertex_source, shader_fragment_source);
    var create_env = createElips(1, 36, 18, 0.3, 1, 0.3, 10, 0.5, -4, 0.2, 0.3, 0.1);
    var kaktus1_vertex = create_env[0];
    var kaktus1_faces = create_env[1];
    var kaktus1 = new MyObject("kaktus1", kaktus1_vertex, kaktus1_faces, shader_vertex_source, shader_fragment_source);
    kaktus.addChild(kaktus1);

    create_env = createElips(1, 36, 18, 0.3, 1, 0.3, 8, 0.5, -4, 0.2, 0.3, 0.1);
    var kaktus2_vertex = create_env[0];
    var kaktus2_faces = create_env[1];
    var kaktus2 = new MyObject("kaktus2", kaktus2_vertex, kaktus2_faces, shader_vertex_source, shader_fragment_source);
    kaktus.addChild(kaktus2);

    create_env = createElips(1, 36, 18, 0.3, 1, 0.3, -10, 0.5, -4, 0.2, 0.3, 0.1);
    var kaktus3_vertex = create_env[0];
    var kaktus3_faces = create_env[1];
    var kaktus3 = new MyObject("kaktus3", kaktus3_vertex, kaktus3_faces, shader_vertex_source, shader_fragment_source);
    kaktus.addChild(kaktus3);

    create_env = createElips(1, 36, 18, 0.3, 1, 0.3, -8, 0.5, -4, 0.2, 0.3, 0.1);
    var kaktus4_vertex = create_env[0];
    var kaktus4_faces = create_env[1];
    var kaktus4 = new MyObject("kaktus4", kaktus4_vertex, kaktus4_faces, shader_vertex_source, shader_fragment_source);
    kaktus.addChild(kaktus4);
    
    var create_env = createElips(1, 36, 18, 0.3, 1, 0.3, 10, 0.5, 5, 0.2, 0.3, 0.1);
    var kaktus5_vertex = create_env[0];
    var kaktus5_faces = create_env[1];
    var kaktus5 = new MyObject("kaktus5", kaktus5_vertex, kaktus5_faces, shader_vertex_source, shader_fragment_source);
    kaktus.addChild(kaktus5);

    create_env = createElips(1, 36, 18, 0.3, 1, 0.3, -10, 0.5, 5, 0.2, 0.3, 0.1);
    var kaktus6_vertex = create_env[0];
    var kaktus6_faces = create_env[1];
    var kaktus6 = new MyObject("kaktus6", kaktus6_vertex, kaktus6_faces, shader_vertex_source, shader_fragment_source);
    kaktus.addChild(kaktus6);

    create_env = createElips(1, 36, 18, 0.3, 1, 0.3, -0.65, -0.3, 6.55, 0.2, 0.3, 0.1);
    var kaktus7_vertex = create_env[0];
    var kaktus7_faces = create_env[1];
    var kaktus7 = new MyObject("kaktus7", kaktus7_vertex, kaktus7_faces, shader_vertex_source, shader_fragment_source);
    kaktus.addChild(kaktus7);

    create_env = createElips(1, 36, 18, 0.3, 1, 0.3, 0.65, -0.3, 6.55, 0.2, 0.3, 0.1);
    var kaktus8_vertex = create_env[0];
    var kaktus8_faces = create_env[1];
    var kaktus8 = new MyObject("kaktus8", kaktus8_vertex, kaktus8_faces, shader_vertex_source, shader_fragment_source);
    kaktus.addChild(kaktus8);

    create_env = createElips(1, 36, 18, 0.3, 1, 0.3, 2, -0.3, 6.55, 0.2, 0.3, 0.1);
    var kaktus9_vertex = create_env[0];
    var kaktus9_faces = create_env[1];
    var kaktus9 = new MyObject("kaktus9", kaktus9_vertex, kaktus9_faces, shader_vertex_source, shader_fragment_source);
    kaktus.addChild(kaktus9);

    create_env = createElips(1, 36, 18, 0.3, 1, 0.3, -2, -0.3, 6.55, 0.2, 0.3, 0.1);
    var kaktus10_vertex = create_env[0];
    var kaktus10_faces = create_env[1];
    var kaktus10 = new MyObject("kaktus10", kaktus10_vertex, kaktus10_faces, shader_vertex_source, shader_fragment_source);
    kaktus.addChild(kaktus10);

    // SPOTLIGHT //
    var spotlight1 = new MyObject("spotlight1", [], [], shader_vertex_source, shader_fragment_source);
    var stand1_vertex = [ 
        4, -0.8, 6,     0.1, 0.1, 0.1,
        5, -0.8, 6,     0.1, 0.1, 0.1,
        5, -0.5, 6,     0.1, 0.1, 0.1,
        4, -0.5, 6,     0.1, 0.1, 0.1,
 
        5, -0.8, 5,     0.1, 0.1, 0.1,
        4, -0.8, 5,     0.1, 0.1, 0.1,
        5, -0.5, 5,     0.1, 0.1, 0.1,
        4, -0.5, 5,     0.1, 0.1, 0.1,
 
        4, -0.8, 6,     0.1, 0.1, 0.1,
        4, -0.5, 6,     0.1, 0.1, 0.1,
        4, -0.5, 5,     0.1, 0.1, 0.1,
        4, -0.8, 5,     0.1, 0.1, 0.1,
 
        5, -0.8, 6,     0.1, 0.1, 0.1,
        5, -0.5, 6,     0.1, 0.1, 0.1,
        5, -0.5, 5,     0.1, 0.1, 0.1,
        5, -0.8, 5,     0.1, 0.1, 0.1,
 
        4, -0.8, 6,     0.1, 0.1, 0.1,
        4, -0.8, 5,     0.1, 0.1, 0.1,
        5, -0.8, 5,     0.1, 0.1, 0.1,
        5, -0.8, 6,     0.1, 0.1, 0.1,
 
        4, -0.5, 6,     0.2, 0.2, 0.2,
        4, -0.5, 5,     0.2, 0.2, 0.2,
        5, -0.5, 5,     0.2, 0.2, 0.2,
        5, -0.5, 6,     0.2, 0.2, 0.2
    ];
    var stand1_faces = [
        0, 1, 2,
        0, 2, 3,
   
        4, 5, 6,
        4, 6, 7,
   
        8, 9, 10,
        8, 10, 11,
   
        12, 13, 14,
        12, 14, 15,
   
        16, 17, 18,
        16, 18, 19,
   
        20, 21, 22,
        20, 22, 23
    ];
    var stand1 = new MyObject("stand1", stand1_vertex, stand1_faces, shader_vertex_source, shader_fragment_source);
    spotlight1.addChild(stand1);

    var light1_vertex = [];
    var light1_faces = []
    create_env = createTabung(0.5, 0, 0, 0, 1, 0, 0, 0, light1_vertex, light1_faces);
    light1_vertex = create_env[0];
    light1_faces = create_env[1];
    var light1 = new MyObject("light1", light1_vertex, light1_faces, shader_vertex_source, shader_fragment_source);
    light1.translate = [4.5,0,5];
    spotlight1.addChild(light1);

    var circle1_vertex = [];
    circle1_vertex.push(0.5,0,1.46);
    circle1_vertex.push(1,1,1);
    for (let i = 0; i <= 360; i++) {
        circle1_vertex.push(0.5 * Math.cos(i/Math.PI));
        circle1_vertex.push(0.5 * Math.sin(i/Math.PI));
        circle1_vertex.push(1.46);
        circle1_vertex.push(1);
        circle1_vertex.push(1);
        circle1_vertex.push(0);
    }
    var circle1_faces = [];
    for (let i = 0; i < 360; i++) {
        circle1_faces.push(0,i,i+1);
    }
    var light2 = new MyObject("light2", circle1_vertex, circle1_faces, shader_vertex_source, shader_fragment_source);
    light2.translate = [4.5,0,3.5];
    spotlight1.addChild(light2);

    var spotlight2 = new MyObject("spotlight2", [], [], shader_vertex_source, shader_fragment_source);
    var stand2_vertex = [ 
        -4, -0.8, 6,     0.1, 0.1, 0.1,
        -5, -0.8, 6,     0.1, 0.1, 0.1,
        -5, -0.5, 6,     0.1, 0.1, 0.1,
        -4, -0.5, 6,     0.1, 0.1, 0.1,
 
        -5, -0.8, 5,     0.1, 0.1, 0.1,
        -4, -0.8, 5,     0.1, 0.1, 0.1,
        -5, -0.5, 5,     0.1, 0.1, 0.1,
        -4, -0.5, 5,     0.1, 0.1, 0.1,
 
        -4, -0.8, 6,     0.1, 0.1, 0.1,
        -4, -0.5, 6,     0.1, 0.1, 0.1,
        -4, -0.5, 5,     0.1, 0.1, 0.1,
        -4, -0.8, 5,     0.1, 0.1, 0.1,
 
        -5, -0.8, 6,     0.1, 0.1, 0.1,
        -5, -0.5, 6,     0.1, 0.1, 0.1,
        -5, -0.5, 5,     0.1, 0.1, 0.1,
        -5, -0.8, 5,     0.1, 0.1, 0.1,
 
        -4, -0.8, 6,     0.1, 0.1, 0.1,
        -4, -0.8, 5,     0.1, 0.1, 0.1,
        -5, -0.8, 5,     0.1, 0.1, 0.1,
        -5, -0.8, 6,     0.1, 0.1, 0.1,
 
        -4, -0.5, 6,     0.2, 0.2, 0.2,
        -4, -0.5, 5,     0.2, 0.2, 0.2,
        -5, -0.5, 5,     0.2, 0.2, 0.2,
        -5, -0.5, 6,     0.2, 0.2, 0.2
    ];
    var stand2_faces = [
        0, 1, 2,
        0, 2, 3,
   
        4, 5, 6,
        4, 6, 7,
   
        8, 9, 10,
        8, 10, 11,
   
        12, 13, 14,
        12, 14, 15,
   
        16, 17, 18,
        16, 18, 19,
   
        20, 21, 22,
        20, 22, 23
    ];
    var stand2 = new MyObject("stand2", stand2_vertex, stand2_faces, shader_vertex_source, shader_fragment_source);
    spotlight2.addChild(stand2);

    var light3_vertex = [];
    var light3_faces = []
    create_env = createTabung(0.5, 0, 0, 0, 1, 0, 0, 0, light3_vertex, light3_faces);
    light3_vertex = create_env[0];
    light3_faces = create_env[1];
    var light3 = new MyObject("light3", light3_vertex, light3_faces, shader_vertex_source, shader_fragment_source);
    light3.translate = [-4.5,0,5];
    spotlight2.addChild(light3);

    var circle2_vertex = [];
    circle2_vertex.push(-0.5,0,1.46);
    circle2_vertex.push(1,1,1);
    for (let i = 0; i <= 360; i++) {
        circle2_vertex.push(-0.5 * Math.cos(i/Math.PI));
        circle2_vertex.push(0.5 * Math.sin(i/Math.PI));
        circle2_vertex.push(1.46);
        circle2_vertex.push(1);
        circle2_vertex.push(1);
        circle2_vertex.push(0);
    }
    var circle2_faces = [];
    for (let i = 0; i < 360; i++) {
        circle2_faces.push(0,i,i+1);
    }
    var light4 = new MyObject("light4", circle2_vertex, circle2_faces, shader_vertex_source, shader_fragment_source);
    light4.translate = [-4.5,0,3.5];
    spotlight2.addChild(light4);

        // MIC 1 //
    var mic1 = new MyObject("mic1", [], [], shader_vertex_source, shader_fragment_source);
    var stand1_mic1_vertex = [];
    var stand1_mic1_faces = [];
    create_env = createTabung(0.1, 0, 0, 0, 1.5, 0, 0, 0, stand1_mic1_vertex, stand1_mic1_faces);
    stand1_mic1_vertex = create_env[0];
    stand1_mic1_faces = create_env[1];
    var stand1_mic1 = new MyObject("stand1_mic1", stand1_mic1_vertex, stand1_mic1_faces, shader_vertex_source, shader_fragment_source);
    stand1_mic1.translate = [5,0.1,2];
    stand1_mic1.rotate = [15,0,0];
    mic1.addChild(stand1_mic1);

    var stand2_mic1_vertex = [];
    var stand2_mic1_faces = [];
    create_env = createTabung(0.1, 0, 0, 0, 1.5, 0, 0, 0, stand2_mic1_vertex, stand2_mic1_faces);
    stand2_mic1_vertex = create_env[0];
    stand2_mic1_faces = create_env[1];
    var stand2_mic1 = new MyObject("stand2_mic1", stand2_mic1_vertex, stand2_mic1_faces, shader_vertex_source, shader_fragment_source);
    stand2_mic1.translate = [-2,0.9,5];
    stand2_mic1.rotate = [15,90,0];
    mic1.addChild(stand2_mic1);

    var stand3_mic1_vertex = [];
    var stand3_mic1_faces = [];
    create_env = createTabung(0.1, 0, 0, 0, 1.5, 0, 0, 0, stand3_mic1_vertex, stand3_mic1_faces);
    stand3_mic1_vertex = create_env[0];
    stand3_mic1_faces = create_env[1];
    var stand3_mic1 = new MyObject("stand3_mic1", stand3_mic1_vertex, stand3_mic1_faces, shader_vertex_source, shader_fragment_source);
    stand3_mic1.translate = [2,-1.8,-4.9];
    stand3_mic1.rotate = [15,-90,0];
    mic1.addChild(stand3_mic1);

    var stand4_mic1_vertex = [];
    var stand4_mic1_faces = [];
    create_env = createTabung(0.1, 0, 0, 0, 1.5, 0, 0, 0, stand4_mic1_vertex, stand4_mic1_faces);
    stand4_mic1_vertex = create_env[0];
    stand4_mic1_faces = create_env[1];
    var stand4_mic1 = new MyObject("stand4_mic1", stand4_mic1_vertex, stand4_mic1_faces, shader_vertex_source, shader_fragment_source);
    stand4_mic1.translate = [5,2,-1];
    stand4_mic1.rotate = [90,0,0];
    mic1.addChild(stand4_mic1);

    var stand5_mic1_vertex = [];
    var stand5_mic1_faces = [];
    create_env = createTabung(0.1, 0, 0, 0, 2, 0, 0, 0, stand5_mic1_vertex, stand5_mic1_faces);
    stand5_mic1_vertex = create_env[0];
    stand5_mic1_faces = create_env[1];
    var stand5_mic1 = new MyObject("stand5_mic1", stand5_mic1_vertex, stand5_mic1_faces, shader_vertex_source, shader_fragment_source);
    stand5_mic1.translate = [5,1.5,0.2];
    stand5_mic1.rotate = [15,0,0];
    mic1.addChild(stand5_mic1);

    var circle_mic1_vertex = [];
    var circle_mic1_faces = [];
    create_env = createElips(0.2, 36, 18, 1, 1, 1, 0, 0, 0, 0.3, 0.3, 0.3);
    circle_mic1_vertex = create_env[0];
    circle_mic1_faces = create_env[1];
    var circle_mic1 = new MyObject("circle_mic1", circle_mic1_vertex, circle_mic1_faces, shader_vertex_source, shader_fragment_source);
    circle_mic1.translate = [5,1.45,0.5];
    mic1.addChild(circle_mic1);

    // MIC 2 //
    var mic2 = new MyObject("mic2", [], [], shader_vertex_source, shader_fragment_source);
    var stand1_mic2_vertex = [];
    var stand1_mic2_faces = [];
    create_env = createTabung(0.1, 0, 0, 0, 1.5, 0, 0, 0, stand1_mic2_vertex, stand1_mic2_faces);
    stand1_mic2_vertex = create_env[0];
    stand1_mic2_faces = create_env[1];
    var stand1_mic2 = new MyObject("stand1_mic2", stand1_mic2_vertex, stand1_mic2_faces, shader_vertex_source, shader_fragment_source);
    stand1_mic2.translate = [-5,0.1,2];
    stand1_mic2.rotate = [15,0,0];
    mic2.addChild(stand1_mic2);

    var stand2_mic2_vertex = [];
    var stand2_mic2_faces = [];
    create_env = createTabung(0.1, 0, 0, 0, -1.5, 0, 0, 0, stand2_mic2_vertex, stand2_mic2_faces);
    stand2_mic2_vertex = create_env[0];
    stand2_mic2_faces = create_env[1];
    var stand2_mic2 = new MyObject("stand2_mic2", stand2_mic2_vertex, stand2_mic2_faces, shader_vertex_source, shader_fragment_source);
    stand2_mic2.translate = [-2,-1.6,-3.3];
    stand2_mic2.rotate = [15,90,0];
    mic1.addChild(stand2_mic2);

    var stand3_mic2_vertex = [];
    var stand3_mic2_faces = [];
    create_env = createTabung(0.1, 0, 0, 0, -1.5, 0, 0, 0, stand3_mic2_vertex, stand3_mic2_faces);
    stand3_mic2_vertex = create_env[0];
    stand3_mic2_faces = create_env[1];
    var stand3_mic2 = new MyObject("stand3_mic2", stand3_mic2_vertex, stand3_mic2_faces, shader_vertex_source, shader_fragment_source);
    stand3_mic2.translate = [2,1,6.5];
    stand3_mic2.rotate = [15,-90,0];
    mic2.addChild(stand3_mic2);

    var stand4_mic2_vertex = [];
    var stand4_mic2_faces = [];
    create_env = createTabung(0.1, 0, 0, 0, 1.5, 0, 0, 0, stand4_mic2_vertex, stand4_mic2_faces);
    stand4_mic2_vertex = create_env[0];
    stand4_mic2_faces = create_env[1];
    var stand4_mic2 = new MyObject("stand4_mic2", stand4_mic2_vertex, stand4_mic2_faces, shader_vertex_source, shader_fragment_source);
    stand4_mic2.translate = [-5,2,-1];
    stand4_mic2.rotate = [90,0,0];
    mic2.addChild(stand4_mic2);

    var stand5_mic2_vertex = [];
    var stand5_mic2_faces = [];
    create_env = createTabung(0.1, 0, 0, 0, 2, 0, 0, 0, stand5_mic2_vertex, stand5_mic2_faces);
    stand5_mic2_vertex = create_env[0];
    stand5_mic2_faces = create_env[1];
    var stand5_mic2 = new MyObject("stand5_mic2", stand5_mic2_vertex, stand5_mic2_faces, shader_vertex_source, shader_fragment_source);
    stand5_mic2.translate = [-5,1.5,0.2];
    stand5_mic2.rotate = [15,0,0];
    mic2.addChild(stand5_mic2);

    var circle_mic2_vertex = [];
    var circle_mic2_faces = [];
    create_env = createElips(0.2, 36, 18, 1, 1, 1, 0, 0, 0, 0.3, 0.3, 0.3);
    circle_mic2_vertex = create_env[0];
    circle_mic2_faces = create_env[1];
    var circle_mic2 = new MyObject("circle_mic2", circle_mic2_vertex, circle_mic2_faces, shader_vertex_source, shader_fragment_source);
    circle_mic2.translate = [-5,1.45,0.5];
    mic2.addChild(circle_mic2);

    //...
    //env end

    //Sean start
    var yeDee = new MyObject("yeDee", [], [], shader_vertex_source, shader_fragment_source);

    var calculate = createElips(1.0, 36, 18, 1.8, 1.2, 1.0, 0, 0, 0, 68.0 / 255, 194.0 / 255, 196.0 / 255);
    var elipsHead_vertex = calculate[0];
    var elipsHead_faces = calculate[1];
    var headluarSean = new MyObject("head", elipsHead_vertex, elipsHead_faces, shader_vertex_source, shader_fragment_source);
    yeDee.addChild(headluarSean);

    calculate = createElips(1.15, 36, 18, 1.0, 0.68, 1.0, 0, 0, 0, 1, 254.0 / 225, 207.0 / 255);
    var elipsFace_vertex = calculate[0];
    var elipsFace_faces = calculate[1];
    var faceDalamSean = new MyObject("face", elipsFace_vertex, elipsFace_faces, shader_vertex_source, shader_fragment_source);
    faceDalamSean.translate = [0, -0.1, 0.5];
    headluarSean.addChild(faceDalamSean);

    var telingaSean = new MyObject("telinga", [], [], shader_vertex_source, shader_fragment_source);
    faceDalamSean.addChild(telingaSean);

    var pangkalKananSean = generateTabung("pangkalKanan", 0, 0, 0, 0, 0, 0.0625, 0.115, 0.225, 69.0 / 255, 196.0 / 255, 202.0 / 255, 15);
    var deg = 0;
    var transl = 0.8;
    var counter = 0;
    pangkalKananSean.forEach(obj => {
        obj.translate[0] += -0.04 - transl;
        obj.translate[1] += 0.9 + deg;
        obj.translate[2] += -2.2;
        obj.rotate = [90, 0, 0];
        telingaSean.addChild(obj);
        if (counter <= 3) {
            transl -= 0.1;
            deg -= 0.1;
        } else if (counter <= 6) {
            transl -= 0.05;
            deg -= 0.08;
        } else if (counter <= 9) {
            transl -= 0.05;
            deg -= 0.05;
        } else if (counter <= 12) {
            transl -= 0.05;
            deg -= 0.03;
        }
        counter += 1;
    });

    var pangkalKiriSean = generateTabung("pangkalKiri", 0, 0, 0, 0, 0, 0.0625, 0.115, 0.22, 69.0 / 255, 196.0 / 255, 202.0 / 255, 15);
    var counter = 0;
    var deg = 0.0;
    var transl = 1.2;
    var down = 1;
    pangkalKiriSean.forEach(obj => {
        obj.translate[0] += -0.5+transl;
        obj.translate[1] += 0.9 + deg;
        obj.translate[2] += -2.8 + down;
        obj.rotate = [90, 0, 0];
        telingaSean.addChild(obj);
        if (counter <= 4) {
            transl -= 0.08;
            down -= 0.05;
            deg -= 0.1;
        } else if (counter <= 4) {
            transl -= 0.05;
            down -= 0.05;
            deg -= 0.09;
        } else if (counter <= 12) {
            transl -= 0.03;
            deg -= 0.1;
            down -= 0.005;
        } else if (counter <= 15) {
            transl -= 0.01;
            down -= 0.1;
            deg -= 0.05;
        }
        counter += 1;
    });

    var penyambungKananSean = generateBiggerStraight("penyambungKanan", 0, 0, 0, 0.1, 0.2, 0.05, 69.0 / 255, 196.0 / 255, 202.0 / 255, 7);
    penyambungKananSean.forEach(obj => {
        obj.translate[0] += -0.75;
        obj.translate[1] += 2.3;
        obj.translate[2] += 0.75;
        telingaSean.addChild(obj);
    });

    var penyambungKiriSean = generateBiggerStraight("penyambungKiri", 0, 0, 0, 0.1, 0.2, 0.05, 69.0 / 255, 196.0 / 255, 202.0 / 255, 7);
    penyambungKiriSean.forEach(obj => {
        obj.translate[0] += 0.9;
        obj.translate[1] += 1.9;
        obj.translate[2] += 0.8;
        telingaSean.addChild(obj);
    });

    calculate = createElipPara(0.5, 36, 18, 1, 1, 1.7, 0, 0, 0, 1, 246.0 / 255, 125.0 / 255);
    var telorKanan_vertex = calculate[0];
    var telorKanan_faces = calculate[1];
    var telorKananSean = new MyObject("telorKanan", telorKanan_vertex, telorKanan_faces, shader_vertex_source, shader_fragment_source);
    telorKananSean.translate = [-0.75, 2.3, 1.2];
    telingaSean.addChild(telorKananSean);

    calculate = createElipPara(0.5, 36, 18, 1, 1, 1.7, 0, 0, 0, 1, 246.0 / 255, 125.0 / 255);
    var telorKiri_vertex = calculate[0];
    var telorKiri_faces = calculate[1];
    var telorKiriSean = new MyObject("telorKiri", telorKiri_vertex, telorKiri_faces, shader_vertex_source, shader_fragment_source);
    telorKiriSean.translate = [0.9, 1.9, 1.25];
    telingaSean.addChild(telorKiriSean);

    var mainBody_vertex = [];
    var mainBody_faces = [];
    var calculate = customTabung(0.8, 0, 0, 0, 0.8, 69.0 / 255, 196.0 / 255, 202.0 / 255, mainBody_vertex, mainBody_faces, 1, 0.65);
    mainBody_vertex = calculate[0];
    mainBody_faces = calculate[1];
    var mainBodySean = new MyObject("body", mainBody_vertex, mainBody_faces, shader_vertex_source, shader_fragment_source);
    mainBodySean.translate = [0, 0, 1.];
    mainBodySean.rotate = [90, 0, 0];
    yeDee.addChild(mainBodySean);

    calculate = createElipPara(0.7, 36, 18, 0.55, 0.55, 1.5, 0, 0, 0, 69.0 / 255, 196.0 / 255, 202.0 / 255);
    var kakiKanan_vertex = calculate[0];
    var kakiKanan_faces = calculate[1];
    var kakiKananSean = new MyObject("kakiKanan", kakiKanan_vertex, kakiKanan_faces, shader_vertex_source, shader_fragment_source);
    kakiKananSean.translate = [-0.4, 0, 1.5];
    kakiKananSean.rotate = [90, 0, 0];
    mainBodySean.addChild(kakiKananSean);

    calculate = createElipPara(0.7, 36, 18, 0.55, 0.55, 1.5, 0, 0, 0, 69.0 / 255, 196.0 / 255, 202.0 / 255);
    var kakiKiri_vertex = calculate[0];
    var kakiKiri_faces = calculate[1];
    var kakiKiriSean = new MyObject("kakiKiri", kakiKiri_vertex, kakiKiri_faces, shader_vertex_source, shader_fragment_source);
    kakiKiriSean.translate = [0.4, 0, 1.5];
    kakiKiriSean.rotate = [90, 0, 0];
    mainBodySean.addChild(kakiKiriSean);

    var lenganKiri_vertex = [];
    var lenganKiri_faces = [];
    var calculate = createTabung(0.2, 0, 0, 0, 0.8, 69.0 / 255, 196.0 / 255, 202.0 / 255, lenganKiri_vertex, lenganKiri_faces);
    lenganKiri_vertex = calculate[0];
    lenganKiri_faces = calculate[1];
    var lenganKiriSean = new MyObject("lenganKiri", lenganKiri_vertex, lenganKiri_faces, shader_vertex_source, shader_fragment_source);
    lenganKiriSean.translate = [1, 0, 0.7];
    lenganKiriSean.rotate = [90, 0, 0];
    mainBodySean.addChild(lenganKiriSean);

    var lenganKanan_vertex = [];
    var lenganKanan_faces = [];
    var calculate = createTabung(0.2, 0, 0, 0, 0.8, 69.0 / 255, 196.0 / 255, 202.0 / 255, lenganKanan_vertex, lenganKanan_faces);
    lenganKanan_vertex = calculate[0];
    lenganKanan_faces = calculate[1];
    var lenganKananSean = new MyObject("lenganKanan", lenganKanan_vertex, lenganKanan_faces, shader_vertex_source, shader_fragment_source);
    lenganKananSean.translate = [-1, 0, 0.7];
    lenganKananSean.rotate = [90, 0, 0];
    mainBodySean.addChild(lenganKananSean);

    calculate = createElipPara(0.2, 36, 18, 1, 1, 2, 0, 0, 0, 69.0 / 255, 196.0 / 255, 202.0 / 255);
    var tanganKiri_vertex = calculate[0];
    var tanganKiri_faces = calculate[1];
    var tanganKiriSean = new MyObject("tanganKiri", tanganKiri_vertex, tanganKiri_faces, shader_vertex_source, shader_fragment_source);
    tanganKiriSean.translate = [1, 0, 1.4];
    tanganKiriSean.rotate = [90, 0, 0];
    lenganKiriSean.addChild(tanganKiriSean);

    calculate = createElipPara(0.2, 36, 18, 1, 1, 2, 0, 0, 0, 69.0 / 255, 196.0 / 255, 202.0 / 255);
    var tanganKanan_vertex = calculate[0];
    var tanganKanan_faces = calculate[1];
    var tanganKananSean = new MyObject("tanganKanan", tanganKanan_vertex, tanganKanan_faces, shader_vertex_source, shader_fragment_source);
    tanganKananSean.translate = [-1, 0, 1.4];
    tanganKananSean.rotate = [90, 0, 0];
    lenganKananSean.addChild(tanganKananSean);

    var headband1_vertex = [];
    var headband1_faces = [];
    var calculate = createTabung(0.55, 0, 0, 0, 0.2, 1, 1, 1, headband1_vertex, headband1_faces);
    headband1_vertex = calculate[0];
    headband1_faces = calculate[1];
    var headband1Sean = new MyObject("headband1", headband1_vertex, headband1_faces, shader_vertex_source, shader_fragment_source);
    headband1Sean.translate = [0, 0, -1.25];
    headband1Sean.rotate = [90, 0, 0];
    headluarSean.addChild(headband1Sean);

    var headband2_vertex = [];
    var headband2_faces = [];
    var calculate = createTabung(0.6, 0, 0, 0, 0.05, 1, 142.0 / 255, 121.0 / 255, headband2_vertex, headband2_faces);
    headband2_vertex = calculate[0];
    headband2_faces = calculate[1];
    var headband2Sean = new MyObject("headband2", headband2_vertex, headband2_faces, shader_vertex_source, shader_fragment_source);
    headband2Sean.translate = [0, 0, -1.2];
    headband2Sean.rotate = [90, 0, 0];
    headluarSean.addChild(headband2Sean);

    var calculate = createElips(0.37, 36, 18, 1, 1, 1, 0, 0, 0, 1, 120.0 / 255, 145.0 / 255);
    var ronaKiri_vertex = calculate[0];
    var ronaKiri_faces = calculate[1];
    var ronaKiriSean = new MyObject("ronaKiri", ronaKiri_vertex, ronaKiri_faces, shader_vertex_source, shader_fragment_source);
    ronaKiriSean.translate = [0.8, -0.4, 1.1];
    headluarSean.addChild(ronaKiriSean);

    var calculate = createElips(0.37, 36, 18, 1, 1, 1, 0, 0, 0, 1, 120.0 / 255, 145.0 / 255);
    var ronaKanan_vertex = calculate[0];
    var ronaKanan_faces = calculate[1];
    var ronaKananSean = new MyObject("ronaKanan", ronaKanan_vertex, ronaKanan_faces, shader_vertex_source, shader_fragment_source);
    ronaKananSean.translate = [-0.8, -0.4, 1.1];
    headluarSean.addChild(ronaKananSean);

    var yStart = 0.2;
    for (let index = 0; index < 4; index++) {
        var line_vertex = [-0.5, yStart, 1.58, 0, 0, 0, -0.2, yStart, 1.58, 0, 0, 0];
        var line_faces = [0, 1];
        var eyebrowLSean = new MyObject("alisKanan", line_vertex, line_faces, shader_vertex_source, shader_fragment_source);
        yStart += 0.005;
        lineSean.push(eyebrowLSean);
    }

    yStart = 0.2;
    for (let index = 0; index < 4; index++) {
        var line_vertex = [0.2, yStart, 1.58, 0, 0, 0, 0.5, yStart, 1.58, 0, 0, 0];
        var line_faces = [0, 1];
        var eyebrowRSean = new MyObject("alisKiri", line_vertex, line_faces, shader_vertex_source, shader_fragment_source);
        yStart += 0.005;
        lineSean.push(eyebrowRSean);
    }

    var eyesSean = [];
    var eyeLeft_vertex = [];
    var eyeLeft_faces = [];
    r = 0.1;
    for (let index = 0; index <= 360; index++) {
        var x = r * Math.cos(LIBS.degToRad(index));
        var y = r * Math.sin(LIBS.degToRad(index));
        eyeLeft_vertex.push(x - 0.33);
        eyeLeft_vertex.push(y);
        eyeLeft_vertex.push(1.65);
        eyeLeft_vertex.push(0, 0, 0);
    }
    for (let index = 0; index <= 360; index++) {
        eyeLeft_faces.push(0, index, index + 1);
    }
    var eyeSeanSean = new MyObject("mataKanan", eyeLeft_vertex, eyeLeft_faces, shader_vertex_source, shader_fragment_source);
    eyesSean.push(eyeSeanSean);
    var eyeRight_vertex = [];
    var eyeRight_faces = [];
    r = 0.1;
    for (let index = 0; index <= 360; index++) {
        var x = r * Math.cos(LIBS.degToRad(index));
        var y = r * Math.sin(LIBS.degToRad(index));
        eyeRight_vertex.push(x + 0.33);
        eyeRight_vertex.push(y);
        eyeRight_vertex.push(1.65);
        eyeRight_vertex.push(0, 0, 0);
    }
    for (let index = 0; index <= 360; index++) {
        eyeRight_faces.push(0, index, index + 1);
    }
    eyeSeanSean = new MyObject("mataKiri", eyeRight_vertex, eyeRight_faces, shader_vertex_source, shader_fragment_source);
    eyesSean.push(eyeSeanSean);

    var eyeMid_vertex = [];
    var eyeMid_faces = [];
    r = 0.1;
    for (let index = 0; index <= 360; index++) {
        var x = r * Math.cos(LIBS.degToRad(index));
        var y = r * Math.sin(LIBS.degToRad(index));
        eyeMid_vertex.push(x + 0);
        eyeMid_vertex.push(y - 1.2);
        eyeMid_vertex.push(0.53);
        eyeMid_vertex.push(0, 0, 0);
    }
    for (let index = 0; index <= 360; index++) {
        eyeMid_faces.push(0, index, index + 1);
    }
    eyeMidSean = new MyObject("mataBadan", eyeMid_vertex, eyeMid_faces, shader_vertex_source, shader_fragment_source);
    mainBodySean.addChild(eyeMidSean);

    var curve = [0.0, 0.0, 0.1, -0.1, 0.2, 0];
    yStart = -0.4;
    for (let index = 0; index < 4; index++) {
        var line_vertex = bezier.generateBSpline(curve, 100, 2, -0.1, yStart, 1.58);
        var line_faces = [];
        for (let index = 0; index < line_vertex.length / 6; index++) {
            line_faces.push(index);
        }
        var mouthSean = new MyObject("mulutCurve", line_vertex, line_faces, shader_vertex_source, shader_fragment_source);
        yStart += 0.005;
        lineSean.push(mouthSean);
    }
    var xStart = 0.1;
    for (let index = 0; index < 4; index++) {
        var line_vertex = [xStart, -0.34, 1.6, 0, 0, 0, xStart, -0.44, 1.6, 0, 0, 0];
        var line_faces = [0, 1];
        var eyebrowLSean = new MyObject("mulutVertikal", line_vertex, line_faces, shader_vertex_source, shader_fragment_source);
        xStart += 0.005;
        mouthVerticalSean.push(eyebrowLSean);
    }

    //Kumis atas
    var yStart = 0;
    for (let index = 0; index < 4; index++) {
        var line_vertex = [-2, yStart, 0.7, 0, 0, 0, -1, yStart, 0.7, 0, 0, 0];
        var line_faces = [0, 1];
        var eyebrowLSean = new MyObject("kumisAtasKanan", line_vertex, line_faces, shader_vertex_source, shader_fragment_source);
        yStart += 0.005;
        kumisAtasSean.push(eyebrowLSean);
    }
    yStart = 0;
    for (let index = 0; index < 4; index++) {
        var line_vertex = [2, yStart, 0.7, 0, 0, 0, 1, yStart, 0.7, 0, 0, 0];
        var line_faces = [0, 1];
        var eyebrowLSean = new MyObject("kumisAtasKiri", line_vertex, line_faces, shader_vertex_source, shader_fragment_source);
        yStart += 0.005;
        kumisAtasSean.push(eyebrowLSean);
    }

    var yStart = -0.2;
    for (let index = 0; index < 4; index++) {
        var line_vertex = [-2, yStart - 0.2, 0.7, 0, 0, 0, -1, yStart, 0.7, 0, 0, 0];
        var line_faces = [0, 1];
        var eyebrowLSean = new MyObject("kumisKanan", line_vertex, line_faces, shader_vertex_source, shader_fragment_source);
        yStart += 0.005;
        kumisKiriSean.push(eyebrowLSean);
    }
    yStart = -0.2;
    for (let index = 0; index < 4; index++) {
        var line_vertex = [2, yStart - 0.2, 0.7, 0, 0, 0, 1, yStart, 0.7, 0, 0, 0];
        var line_faces = [0, 1];
        var eyebrowLSean = new MyObject("kumisKiri", line_vertex, line_faces, shader_vertex_source, shader_fragment_source);
        yStart += 0.005;
        kumisKananSean.push(eyebrowLSean);
    }

    lineSean.forEach(obj => {
        headluarSean.addChild(obj);
    });

    mouthVerticalSean.forEach(obj => {
        headluarSean.addChild(obj);
    });

    kumisAtasSean.forEach(obj => {
        headluarSean.addChild(obj);
    });

    kumisKiriSean.forEach(obj => {
        headluarSean.addChild(obj);
    });

    kumisKananSean.forEach(obj => {
        headluarSean.addChild(obj);
    });

    eyesSean.forEach(obj => {
        headluarSean.addChild(obj);
    });

    var persegi_vertex = [0.05, -1.5, 0.53, 0, 0, 0, 0.05, -1.25, 0.53, 0, 0, 0, -0.05, -1.5, 0.53, 0, 0, 0, -0.05, -1.25, 0.53, 0, 0, 0];
    var persegi_faces = [0, 1, 2, 2, 1, 3];
    var persegiMidSean = new MyObject("persegi", persegi_vertex, persegi_faces, shader_vertex_source, shader_fragment_source);
    mainBodySean.addChild(persegiMidSean);
    
    yeDee.setScale(0.3);
    yeDee.setTranslateMove(-6.2,0,0);
    
    var membesarSean = true;
    var nextTimeSean = 0;
    var ganjilSean = false;
    var genapSean = true;
    var majuSean = true;
    var mundurSean = false;
    var nextTimeSean = 0;
    //...
    //Sean end

    //Euginia start
    var chilli = new MyObject("chilli", [], [], shader_vertex_source, shader_fragment_source);
    // [KEPALA]
    // ---------- MUKA ---------- //
    var create = createElips(1.0, 36, 18, 1.8, 1.2, 1.0, 0, 0, 0, 0.5, 0.2, 0.8);
    var elipsoid_vertex = create[0];
    var elipsoid_faces = create[1];
    var muka_luar = new MyObject("mukaLuar", elipsoid_vertex, elipsoid_faces, shader_vertex_source, shader_fragment_source);
    chilli.addChild(muka_luar);

    create = createElips(1.15, 36, 18, 1.0, 0.68, 1.0, 0, 0, 0, 1.0, 0.8, 0.8)
    var elipsoid1_vertex = create[0];
    var elipsoid1_faces = create[1];
    var muka_dalam = new MyObject("mukaDalam", elipsoid1_vertex, elipsoid1_faces, shader_vertex_source, shader_fragment_source);
    muka_dalam.translate = [0, -0.08, 0.3];
    muka_luar.addChild(muka_dalam);

    // ---------- MATA ---------- //
    var mata = [];
    var circle1_vertex = [];
    circle1_vertex.push(0.33,0,1.42);
    circle1_vertex.push(0,0,0);
    for (let i = 0; i <= 360; i++) {
        circle1_vertex.push(0.33 + 0.1 * Math.cos(i/Math.PI));
        circle1_vertex.push(0.1 * Math.sin(i/Math.PI));
        circle1_vertex.push(1.42);
        circle1_vertex.push(0);
        circle1_vertex.push(0);
        circle1_vertex.push(0);
    }
    var circle1_faces = [];
    for (let i = 0; i < 360; i++) {
        circle1_faces.push(0,i,i+1);
    }
    var mata_kiri = new MyObject("mata_Kiri", circle1_vertex, circle1_faces, shader_vertex_source, shader_fragment_source);
    mata.push(mata_kiri);

    var circle2_vertex = [];
    circle2_vertex.push(-0.33,0,1.42);
    circle2_vertex.push(0,0,0);
    for (let i = 0; i <= 360; i++) {
        circle2_vertex.push(-0.33 + 0.1 * Math.cos(i/Math.PI));
        circle2_vertex.push(0.1 * Math.sin(i/Math.PI));
        circle2_vertex.push(1.42);
        circle2_vertex.push(0);
        circle2_vertex.push(0);
        circle2_vertex.push(0);
    }
    var circle2_faces = [];
    for (let i = 0; i < 360; i++) {
        circle2_faces.push(0,i,i+1);
    }
    var mata_kanan = new MyObject("mata_Kanan", circle2_vertex, circle2_faces, shader_vertex_source, shader_fragment_source);
    mata.push(mata_kanan);

    // ---------- BLUSH ---------- //
    create = createElips(0.5, 36, 18, 1, 0.8, 1, 0, 0, 0, 1.0, 0.5, 0.7);
    var blush_kiri_vertex = create[0];
    var blush_kiri_faces = create[1];
    var blush_kiri = new MyObject("blush_Kiri", blush_kiri_vertex, blush_kiri_faces, shader_vertex_source, shader_fragment_source);
    blush_kiri.translate = [0.53, -0.25, 0.75];
    muka_luar.addChild(blush_kiri);
    create = createElips(0.5, 36, 18, 1, 0.8, 1, 0, 0, 0, 1.0, 0.5, 0.7);
    var blush_kanan_vertex = create[0];
    var blush_kanan_faces = create[1];
    var blush_kanan = new MyObject("blush_Kanan", blush_kanan_vertex, blush_kanan_faces, shader_vertex_source, shader_fragment_source);
    blush_kanan.translate = [-0.53, -0.25, 0.75];
    muka_luar.addChild(blush_kanan);

    // ---------- TELINGA LUAR ---------- //
    create = createElips(0.6, 36, 18, 0.9, 2.5, 0.8, 0, 0, 0, 0.5, 0.2, 0.8);
    var telinga_luar_kiri = new MyObject("telinga_LuarKiri", create[0], create[1], shader_vertex_source, shader_fragment_source);
    telinga_luar_kiri.translate = [0.8, 0.4, 0];
    telinga_luar_kiri.rotate = [0, 0, 0];
    muka_luar.addChild(telinga_luar_kiri);

    create = createElips(0.6, 36, 18, 0.9, 2.5, 0.8, 0, 0, 0, 0.5, 0.2, 0.8);
    var telinga_luar_kanan = new MyObject("telinga_LuarKanan", create[0], create[1], shader_vertex_source, shader_fragment_source);
    telinga_luar_kanan.translate = [-0.8, 0.4, 0];
    telinga_luar_kanan.rotate = [0, 0, 0];
    muka_luar.addChild(telinga_luar_kanan);

    // ---------- TELINGA DALAM ---------- //
    create = createElips(0.53, 36, 18, 0.7, 2, 0.5, 0, 0, 0, 0.4, 0.2, 0.7);
    var telinga_dalam_kiri = new MyObject("telinga_DalamKiri", create[0], create[1], shader_vertex_source, shader_fragment_source);
    telinga_dalam_kiri.translate = [0.8, 0.7, 0.2];
    telinga_dalam_kiri.rotate = [0, 0, 0];
    muka_luar.addChild(telinga_dalam_kiri);

    create = createElips(0.53, 36, 18, 0.7, 2, 0.5, 0, 0, 0, 0.4, 0.2, 0.7);
    var telinga_dalam_kanan = new MyObject("telinga_DalamKanan", create[0], create[1], shader_vertex_source, shader_fragment_source);
    telinga_dalam_kanan.translate = [-0.8, 0.7, 0.2];
    telinga_dalam_kanan.rotate = [0, 0, 0];
    muka_luar.addChild(telinga_dalam_kanan);
    
    // ---------- ALIS ---------- //
    var curve1 = [-0.1, 0.05, -0.15, 0.12, -0.3, 0.16];
    var yAwal = 0.05;
    for (let index = 0; index < 10; index++) {
      var vertex = generateBSpline(curve1,100,2, -0.08,yAwal,1.4);
      var faces = [];
      for (let index = 0; index < vertex.length/6; index++) {
        faces.push(index);
      }
      var alisKiri = new MyObject("alis_Kiri", vertex, faces, shader_vertex_source, shader_fragment_source);
      yAwal += 0.003;
      alis.push(alisKiri);
    }

    curve1 = [0.1,0.05, 0.15,0.12, 0.3,0.16];
    yAwal = 0.05;
    for (let index = 0; index < 10; index++) {
      var vertex = generateBSpline(curve1,100,2, 0.08,yAwal,1.4);
      var faces = [];
      for (let index = 0; index < vertex.length/6; index++) {
        faces.push(index);
      }
      var alisKanan = new MyObject("alis_Kanan", vertex, faces, shader_vertex_source, shader_fragment_source);
      yAwal += 0.003;
      alis.push(alisKanan);
    }

    // ---------- MULUT ---------- //
    curve1 = [-0.25,-0.24, -0.33,-0.27, -0.3,-0.35,
            -0.25,-0.4, -0.1,-0.35, 0.3,-0.25];
    yAwal = 0;
    for (let index = 0; index < 10; index++) {
      var vertex = generateBSpline(curve1,100,2, 0,yAwal,1.42);
      var faces = [];
      for (let index = 0; index < vertex.length/6; index++) {
        faces.push(index);
      }
      var mulut = new MyObject("mulut", vertex, faces, shader_vertex_source, shader_fragment_source);
      yAwal += 0.003;
      arrmulut.push(mulut);
    }

    // ---------- KUMIS ---------- //
    curve1 = [0.75,-0.32, 0.95,-0.28, 1.1,-0.38];
    yAwal = 0.1;
    for (let index = 0; index < 6; index++) {
      var vertex = generateBSpline(curve1,100,2, 0,yAwal,1.2);
      var faces = [];
      for (let index = 0; index < vertex.length/6; index++) {
        faces.push(index);
      }
      var kumis_AtasKiri = new MyObject("kumis_AtasKiri", vertex, faces, shader_vertex_source, shader_fragment_source);
      yAwal += 0.003;
      kumis_Atas.push(kumis_AtasKiri);
    }

    curve1 = [-0.75,-0.32, -0.95,-0.28, -1.1,-0.38];
    yAwal = 0.1;
    for (let index = 0; index < 6; index++) {
      var vertex = generateBSpline(curve1,100,2, 0,yAwal,1.2);
      var faces = [];
      for (let index = 0; index < vertex.length/6; index++) {
        faces.push(index);
      }
      var kumis_AtasKanan = new MyObject("kumis_AtasKanan", vertex, faces, shader_vertex_source, shader_fragment_source);
      yAwal += 0.003;
      kumis_Atas.push(kumis_AtasKanan);
    }

    curve1 = [0.75,-0.4, 0.9,-0.43, 1.0,-0.53];
    yAwal = 0.1;
    for (let index = 0; index < 6; index++) {
      var vertex = generateBSpline(curve1,100,2, 0,yAwal,1.2);
      var faces = [];
      for (let index = 0; index < vertex.length/6; index++) {
        faces.push(index);
      }
      var kumis_BawahKiri = new MyObject("kumis_BawahKiri", vertex, faces, shader_vertex_source, shader_fragment_source);
      yAwal += 0.003;
      kumis_Bawah.push(kumis_BawahKiri);
    }

    curve1 = [-0.75,-0.4, -0.9,-0.43, -1.0,-0.53];
    yAwal = 0.1;
    for (let index = 0; index < 6; index++) {
      var vertex = generateBSpline(curve1,100,2, 0,yAwal,1.2);
      var faces = [];
      for (let index = 0; index < vertex.length/6; index++) {
        faces.push(index);
      }
      var kumis_BawahKanan = new MyObject("kumis_BawahKanan", vertex, faces, shader_vertex_source, shader_fragment_source);
      yAwal += 0.003;
      kumis_Bawah.push(kumis_BawahKanan);
    }

    // [BADAN FULL]
    var badan_vertex = [];
    var badan_faces = [];
    // ---------- BADAN ---------- //
    var create = customTabung(0.7, 0, 0, 0, 0.7, 0.5, 0.2, 0.8, badan_vertex, badan_faces, 1, 0.65);
    var badan_vertex = create[0];
    var badan_faces = create[1];
    var badan = new MyObject("badan", badan_vertex, badan_faces, shader_vertex_source, shader_fragment_source);
    badan.translate = [0, 0, 1];
    badan.rotate = [90, 0, 0];
    chilli.addChild(badan);

    // ---------- KAKI ---------- //
    create = createElipPara(0.4, 36, 18, 1, 1, 2, 0, 0, 0, 0.5, 0.2, 0.8);
    var kaki_kiri_vertex = create[0];
    var kaki_kiri_faces = create[1];
    var kaki_kiri = new MyObject("kaki_Kiri", kaki_kiri_vertex, kaki_kiri_faces, shader_vertex_source, shader_fragment_source);
    kaki_kiri.translate = [0.3, 0, 1.5];
    kaki_kiri.rotate = [90, 0, 0];
    badan.addChild(kaki_kiri);

    create = createElipPara(0.4, 36, 18, 1, 1, 2, 0, 0, 0, 0.5, 0.2, 0.8);
    var kaki_kanan_vertex = create[0];
    var kaki_kanan_faces = create[1];
    var kaki_kanan = new MyObject("kaki_Kanan", kaki_kanan_vertex, kaki_kanan_faces, shader_vertex_source, shader_fragment_source);
    kaki_kanan.translate = [-0.3, 0, 1.5];
    kaki_kanan.rotate = [90, 0, 0];
    badan.addChild(kaki_kanan);

    // ---------- LENGAN ---------- //
    var lengan_kiri_vertex = [];
    var lengan_kiri_faces = [];
    create = createTabung(0.25, 0, 0, 0, 0.3, 0.5, 0.2, 0.8, lengan_kiri_vertex, lengan_kiri_faces);
    lengan_kiri_vertex = create[0];
    lengan_kiri_faces = create[1];
    var lengan_kiri = new MyObject("lengan_Kiri", lengan_kiri_vertex, lengan_kiri_faces, shader_vertex_source, shader_fragment_source);
    lengan_kiri.translate = [0.9, 0, 0.9];
    lengan_kiri.rotate = [90, 0, 0];
    badan.addChild(lengan_kiri);

    var lengan_kanan_vertex = [];
    var lengan_kanan_faces = [];
    create = createTabung(0.25, 0, 0, 0, 0.3, 0.5, 0.2, 0.8, lengan_kanan_vertex, lengan_kanan_faces);
    lengan_kanan_vertex = create[0];
    lengan_kanan_faces = create[1];
    var lengan_kanan = new MyObject("lengan_Kanan", lengan_kanan_vertex, lengan_kanan_faces, shader_vertex_source, shader_fragment_source);
    lengan_kanan.translate = [-0.9, 0, 0.9];
    lengan_kanan.rotate = [90, 0, 0];
    badan.addChild(lengan_kanan);

    // ---------- TANGAN ---------- //
    create = createElipPara(0.25, 36, 18, 1, 1, 2, 0, 0, 0, 0.5, 0.2, 0.8);
    var tangan_kiri_vertex = create[0];
    var tangan_kiri_faces = create[1];
    var tangan_kiri = new MyObject("tangan_Kiri", tangan_kiri_vertex, tangan_kiri_faces, shader_vertex_source, shader_fragment_source);
    tangan_kiri.translate = [0.9, 0, 1.2];
    tangan_kiri.rotate = [90, 0, 0];
    chilli.addChild(tangan_kiri);

    create = createElipPara(0.25, 36, 18, 1, 1, 2, 0, 0, 0, 0.5, 0.2, 0.8);
    var tangan_kanan_vertex = create[0];
    var tangan_kanan_faces = create[1];
    var tangan_kanan = new MyObject("tangan_Kanan", tangan_kanan_vertex, tangan_kanan_faces, shader_vertex_source, shader_fragment_source);
    tangan_kanan.translate = [-0.9, 0, 1.2];
    tangan_kanan.rotate = [90, 0, 0];
    chilli.addChild(tangan_kanan);

    // ---------- KALUNG ---------- //
    var kalung_vertex = [];
    var kalung_faces = [];
    create = customTabung(0.5, 0, 0, 0, 0.05, 0, 0, 0, kalung_vertex, kalung_faces, 1.4, 1.1);
    kalung_vertex = create[0];
    kalung_faces = create[1];
    var kalung = new MyObject("kalung", kalung_vertex, kalung_faces, shader_vertex_source, shader_fragment_source);
    kalung.translate = [0, 0, 1.05];
    kalung.rotate = [90, 0, 0];
    badan.addChild(kalung);

    // ---------- DIAMOND ---------- //
    var triangle1_vertex = [-0.2, -1.2, 0.55, 0, 0.4, 0.8,
                            0, -1.4, 0.55, 0, 0.4, 0.8,
                            0.2, -1.2, 0.55, 0, 0.4, 0.8];
    var triangle1_faces = [0,1,2];
    var diamond_bawah = new MyObject("diamond_Bawah", triangle1_vertex, triangle1_faces, shader_vertex_source, shader_fragment_source);
    badan.addChild(diamond_bawah);

    var triangle2_vertex = [-0.2, -1.2, 0.55, 0, 0.4, 0.8,
                            0, -1, 0.55, 0, 0.4, 0.8,
                            0.2, -1.2, 0.55, 0, 0.4, 0.8];
    var triangle2_faces = [0,1,2];
    var diamond_atas = new MyObject("diamond_Atas", triangle2_vertex, triangle2_faces, shader_vertex_source, shader_fragment_source);
    badan.addChild(diamond_atas);

    alis.forEach(obj => {
      muka_luar.addChild(obj);
    });

    arrmulut.forEach(obj => {
      muka_luar.addChild(obj);
    });

    kumis_Atas.forEach(obj => {
      muka_luar.addChild(obj);
    });

    kumis_Bawah.forEach(obj => {
      muka_luar.addChild(obj);
    });

    mata.forEach(obj => {
      muka_luar.addChild(obj);
    });

    chilli.setScale(0.3);

    var euginia_membesar = true;
    var euginia_nextTime = 0;
    var euginia_ganjil = false;
    var euginia_genap = true;
    var euginia_maju = true;
    var euginia_mundur = false;
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
            LIBS.rotateX(VIEWMATRIX, LIBS.degToRad(10));
            LIBS.translateZ(VIEWMATRIX, -17);
            LIBS.translateY(VIEWMATRIX, -2);

            //Sean start
            var sean_second = time / 1000;
            yeDee.setRotateMove(0,0, 0);
            if (membesarSean) {
                yeDee.addScale(0.001);
                if (yeDee.scale[0] >= 0.33) {
                    membesarSean = false;
                }
            } else {
                yeDee.addScale(-0.001);
                if (yeDee.scale[0] <= 0.3) {
                    membesarSean = true;
                }
            }
            //...
            //Sean end
        
            //Euginia start
            var euginia_second = time / 1000;
            chilli.setRotateMove(LIBS.radToDeg(PHI), LIBS.radToDeg(THETA), 0);
            if (euginia_membesar) {
              chilli.addScale(0.001);
              if (chilli.scale[0] >= 0.35) {
                euginia_membesar = false;
              }
            } else {
              chilli.addScale(-0.001);
              if (chilli.scale[0] <= 0.35) {
                euginia_membesar = true;
              }
            }
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
        envSean.setRotateMove(0,0,0);

        kaktus.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        kaktus.draw();
        kaktus.setIdentityMove();

        spotlight1.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        spotlight1.draw();
        spotlight1.setIdentityMove();
        spotlight1.setRotateMove(0,0,0);

        spotlight2.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        spotlight2.draw();
        spotlight2.setIdentityMove();
        spotlight2.setRotateMove(0,0,0);

        mic1.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        mic1.draw();
        mic1.setIdentityMove();
        mic1.setRotateMove(0,0,0);

        mic2.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        mic2.draw();
        mic2.setIdentityMove();
        mic2.setRotateMove(0,0,0);
        //...
        //env end
        
        //Sean start
        yeDee.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        yeDee.draw();
        yeDee.setIdentityMove();
        if (sean_second >= nextTimeSean) {
            if (genapSean) {
                if (majuSean) {
                    kakiKananSean.setRotate(10,0,0);
                    kakiKananSean.setTranslateMove(0,0.3,0);
                    lenganKiriSean.setRotate(10,0,0);
                } else if (mundurSean){
                    kakiKananSean.setRotate(-10,0,0);
                    kakiKananSean.setTranslateMove(0,-0.3,0);
                    lenganKiriSean.setRotate(-10,0,0);
                }
                if (mundurSean) {
                    kakiKiriSean.setRotate(10,0,0);
                    kakiKiriSean.setTranslateMove(0,0.3,0);
                    lenganKananSean.setRotate(10,0,0);
                } else if (majuSean){
                    kakiKiriSean.setRotate(-10,0,0);
                    kakiKiriSean.setTranslateMove(0,-0.3,0);
                    lenganKananSean.setRotate(-10,0,0);
                }
                genapSean = false;
                ganjilSean = true;
            } else if (ganjilSean) {
                if (majuSean) {
                    kakiKananSean.setRotate(-10,0,0);
                    kakiKananSean.setTranslateMove(0,-0.3,0);
                    lenganKiriSean.setRotate(-10,0,0);
                    majuSean = false;
                    mundurSean = true;
                } else if (mundurSean) {
                    kakiKananSean.setRotate(10,0,0);
                    kakiKananSean.setTranslateMove(0,0.3,0);
                    lenganKiriSean.setRotate(10,0,0);
                    majuSean = true;
                    mundurSean = false;
                }
                if (mundurSean) {
                    kakiKiriSean.setRotate(-10,0,0);
                    kakiKiriSean.setTranslateMove(0,-0.3,0);
                    lenganKananSean.setRotate(-10,0,0);
                    majuSean = false;
                    mundurSean = true;
                } else if (majuSean) {
                    kakiKiriSean.setRotate(10,0,0);
                    kakiKiriSean.setTranslateMove(0,0.3,0);
                    lenganKananSean.setRotate(10,0,0);
                    majuSean = true;
                    mundurSean = false;
                }
                genapSean = true;
                ganjilSean = false;
            }
            nextTimeSean += 0.2;
        }

        if (sean_second >= 12) { //for looping animation
            sean_second = sean_second % 12;
        }
        // //Rotate at arbitrary axis...APPROVE
        // // bisa tanpa translasi, lgsg pakai entrance movement
        if (sean_second >= 4 & sean_second <= 5) {
            yeDee.setTranslateMove(-0.1, 0, 0);
        }
        if (sean_second >= 5 & sean_second <= 11) {
            yeDee.setRotate(0,2,0);
        }
        if (sean_second >= 11 & sean_second <= 12) {
            yeDee.setTranslateMove(0.1,0,0);
        }
        
        //...
        //Sean end
        
        //Euginia start
        chilli.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        chilli.draw();
        chilli.setIdentityMove();
        if (euginia_second >= euginia_nextTime) {
          if (euginia_genap) {
            if (euginia_maju) {
                kaki_kanan.setRotate(10,0,0);
                kaki_kanan.setTranslateMove(0,0.3,0);
                lengan_kiri.setRotate(10,0,0);
                tangan_kiri.setRotate(10,0,0);
                
            } else if (euginia_mundur){
                kaki_kanan.setRotate(-10,0,0);
                kaki_kanan.setTranslateMove(0,-0.3,0);
                lengan_kiri.setRotate(-10,0,0);
                tangan_kiri.setRotate(-10,0,0);
            }
            if (euginia_mundur) {
                kaki_kiri.setRotate(10,0,0);
                kaki_kiri.setTranslateMove(0,0.3,0);
                lengan_kanan.setRotate(10,0,0);
                tangan_kanan.setRotate(10,0,0);
            } else if (euginia_maju){
                kaki_kiri.setRotate(-10,0,0);
                kaki_kiri.setTranslateMove(0,-0.3,0);
                lengan_kanan.setRotate(-10,0,0);
                tangan_kanan.setRotate(-10,0,0);
            }
            euginia_genap = false;
            euginia_ganjil = true;
        } else if (euginia_ganjil) {
            if (euginia_maju) {
                kaki_kanan.setRotate(-10,0,0);
                kaki_kanan.setTranslateMove(0,-0.3,0);
                lengan_kiri.setRotate(-10,0,0);
                tangan_kiri.setRotate(-10,0,0);
                euginia_maju = false;
                euginia_mundur = true;
            } else if (euginia_mundur) {
                kaki_kanan.setRotate(10,0,0);
                kaki_kanan.setTranslateMove(0,0.3,0);
                lengan_kiri.setRotate(10,0,0);
                tangan_kiri.setRotate(10,0,0);
                euginia_maju = true;
                euginia_mundur = false;
            }
            if (euginia_mundur) {
                kaki_kiri.setRotate(-10,0,0);
                kaki_kiri.setTranslateMove(0,-0.3,0);
                lengan_kanan.setRotate(-10,0,0);
                tangan_kanan.setRotate(-10,0,0);
                euginia_maju = false;
                euginia_mundur = true;
            } else if (euginia_maju) {
                kaki_kiri.setRotate(10,0,0);
                kaki_kiri.setTranslateMove(0,0.3,0);
                lengan_kanan.setRotate(10,0,0);
                tangan_kanan.setRotate(10,0,0);
                euginia_maju = true;
                euginia_mundur = false;
            }
            euginia_genap = true;
            euginia_ganjil = false;
          } 
          euginia_nextTime += 0.3;
        }

        if (euginia_second >= 15) { //for looping animation
          euginia_second = euginia_second % 15;
        }
        if (euginia_second >= 3 && euginia_second <= 4) {
          chilli.setTranslateMove(-0.1, 0, 0);
        }
        if (euginia_second >= 4 && euginia_second <= 8) {
          chilli.setRotate(0,1,0);
        }
        if (euginia_second >= 8 && euginia_second <= 9) {
          chilli.setTranslateMove(0.1,0,0);
        }
        if (euginia_second >= 9 && euginia_second <= 12) {
          chilli.setRotate(2,0,0);
        }
        if (euginia_second >= 12 && euginia_second <= 13) {
          chilli.setTranslateMove(0,0,0);
        }
        if (euginia_second >= 13 && euginia_second <= 15) {
          chilli.setRotate(0,1,0);
        }
        if (euginia_second >= 15 && euginia_second <= 15) {
          chilli.setTranslateMove(0,0,0);
        }
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
