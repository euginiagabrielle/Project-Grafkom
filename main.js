var GL;
//drawLine
var line = [];
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
            if (line.includes(obj) | mouthVertical.includes(obj)) {
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
            if (line.includes(obj) | kumisAtas.includes(obj)| mouthVertical.includes(obj)) {
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
        let y = this.scale[1] + s;
        let z = this.scale[2] + s;
        this.scale = [x, y, z];
        this.child.forEach(obj => {
            obj.setScale(s);
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

    var woopy = new MyObject("woopy", [], [], shader_vertex_source, shader_fragment_source);

    var calculate = createElips(1.0, 36, 18, 1.8, 1.2, 1.0, 0, 0, 0,  0, 0, 128);
    var elipsHead_vertex = calculate[0];
    var elipsHead_faces = calculate[1];
    var headluar = new MyObject("head", elipsHead_vertex, elipsHead_faces, shader_vertex_source, shader_fragment_source);
    woopy.addChild(headluar);
    test.push(headluar);

    calculate = createElips(1.15, 36, 18, 1.0, 0.8, 1.0, 0, 0, 0, 255, 255 , 255);
    var elipsFace_vertex = calculate[0];
    var elipsFace_faces = calculate[1];
    var faceDalam = new MyObject("face", elipsFace_vertex, elipsFace_faces, shader_vertex_source, shader_fragment_source);
    faceDalam.translate = [0, -0.1, 0.5];
    headluar.addChild(faceDalam);
    test.push(faceDalam);

    
    calculate = createElipPara(0.5, 36, 18, 0.55, 0.55, 1.5, 0, 0, 0, 255,0,0);
    var ekor_vertex = calculate[0];
    var ekor_faces = calculate[1];
    var ekor = new MyObject("ekor", ekor_vertex, ekor_faces, shader_vertex_source, shader_fragment_source);
    //rotate y +10, trans y +0.4
    //rotate y -10, trans y -0.4
    ekor.translate = [0, 0, 1];
    ekor.rotate = [150, 0, 0];
    headluar.addChild(ekor);
    test.push(ekor);

    var telinga = new MyObject("telinga", [], [], shader_vertex_source, shader_fragment_source);
    faceDalam.addChild(telinga);

    calculate = createElipPara(0.5, 36, 18, 0.55, 0.55, 1.5, 0, 0, 0,  255, 0, 0 );
    var telingaKanan_vertex = calculate[0];
    var telingaKanan_faces = calculate[1];
    var telingaKanan = new MyObject("telingaKanan", telingaKanan_vertex, telingaKanan_faces, shader_vertex_source, shader_fragment_source);
    //rotate y +10, trans y +0.4
    //rotate y -10, trans y -0.4
    telingaKanan.translate = [-0.75, 0, 1];
    telingaKanan.rotate = [270, 0, 0];
    headluar.addChild(telingaKanan);
    test.push(telingaKanan);

    calculate = createElipPara(0.5, 36, 18, 0.55, 0.55, 1.5, 0, 0, 0, 255, 0, 0);
    var telingaKiri_vertex = calculate[0];
    var telingaKiri_faces = calculate[1];
    var telingaKiri = new MyObject("telingaKiri", telingaKiri_vertex, telingaKiri_faces, shader_vertex_source, shader_fragment_source);
    telingaKiri.translate = [0.75, 0, 1];
    //rotate y +10, trans y +0.4
    //rotate y -10, trans y -0.4
    telingaKiri.rotate = [270, 0, 0];
    headluar.addChild(telingaKiri);
    test.push(telingaKiri);

    var lenganKiri_vertex = [];
    var lenganKiri_faces = [];
    var calculate = createTabung(0.2, 0, 0, 0, 0.8,0,0,1, lenganKiri_vertex, lenganKiri_faces);
    lenganKiri_vertex = calculate[0];
    lenganKiri_faces = calculate[1];
    var lenganKiri = new MyObject("lenganKiri", lenganKiri_vertex, lenganKiri_faces, shader_vertex_source, shader_fragment_source);
    lenganKiri.translate = [1.5, 0, -0.7];
    lenganKiri.rotate = [180, 0,0];
    //tangan maju mundur aman
    // lenganKiri.rotate[0] += 10;
    //putar samping
    //menjauh, rY + 10,  
    // lenganKiri.rotate[2]+=30;
    // lenganKiri.translate[0]+= -2;
    // lenganKiri.translate[2] += 1;
    headluar.addChild(lenganKiri);
    test.push(lenganKiri);

    var lenganKanan_vertex = [];
    var lenganKanan_faces = [];
    var calculate = createTabung(0.2, 0, 0, 0, 0.8,0,0,1, lenganKanan_vertex, lenganKanan_faces);
    lenganKanan_vertex = calculate[0];
    lenganKanan_faces = calculate[1];
    var lenganKanan = new MyObject("lenganKanan", lenganKanan_vertex, lenganKanan_faces, shader_vertex_source, shader_fragment_source);
    lenganKanan.translate = [-1.5, 0,-0.7];
    lenganKanan.rotate = [180, 0, 0];
    headluar.addChild(lenganKanan);
    test.push(lenganKanan);

    calculate = createElipPara(0.2, 36, 18, 1, 1, 2, 0, 0, 0,  255, 255, 255);
    var tanganKiri_vertex = calculate[0];
    var tanganKiri_faces = calculate[1];
    var tanganKiri = new MyObject("tanganKiri", tanganKiri_vertex, tanganKiri_faces, shader_vertex_source, shader_fragment_source);
    tanganKiri.translate = [1.5, 0, 0.7];
    tanganKiri.rotate = [360, 0, 0];
    woopy.addChild(tanganKiri);
    test.push(tanganKiri);

    calculate = createElipPara(0.2, 36, 18, 1, 1, 2, 0, 0, 0, 255, 255, 255);
    var tanganKanan_vertex = calculate[0];
    var tanganKanan_faces = calculate[1];
    var tanganKanan = new MyObject("tanganKanan", tanganKanan_vertex, tanganKanan_faces, shader_vertex_source, shader_fragment_source);
    tanganKanan.translate = [-1.5, 0,0.7];
    tanganKanan.rotate = [360, 0, 0];
    woopy.addChild(tanganKanan);
    test.push(tanganKanan);

    var pahaKanan_vertex = [];
    var pahaKanan_faces = [];
    var calculate = createTabung(0.2, 0, 0, 0, 0.8, 0, 0, 1,lenganKanan_vertex, lenganKanan_faces);
    pahaKanan_vertex = calculate[0];
    pahaKanan_faces = calculate[1];
    var pahaKanan = new MyObject("pahaKanan", pahaKanan_vertex, pahaKanan_faces, shader_vertex_source, shader_fragment_source);
    pahaKanan.translate = [-0.5, 0,0.5];
    pahaKanan.rotate = [90, 0, 0];
    headluar.addChild(pahaKanan);
    test.push(pahaKanan);
    
    calculate = createElipPara(0.2, 36, 18, 1, 1, 2, 0, 0, 0, 255, 255, 255);
    var kakiKanan_vertex = calculate[0];
    var kakiKanan_faces = calculate[1];
    var kakiKanan = new MyObject("kakiKanan", kakiKanan_vertex, kakiKanan_faces, shader_vertex_source, shader_fragment_source);
    kakiKanan.translate = [-0.5, 0,1.2];
    kakiKanan.rotate = [90, 0, 0];
    woopy.addChild(kakiKanan);
    test.push(kakiKanan);

    var pahaKiri_vertex = [];
    var pahaKiri_faces = [];
    var calculate = createTabung(0.2, 0, 0, 0, 0.8, 0,0,1, lenganKanan_vertex, lenganKanan_faces);
    pahaKiri_vertex = calculate[0];
    pahaKiri_faces = calculate[1];
    var pahaKiri = new MyObject("pahaKiri", pahaKiri_vertex, pahaKiri_faces, shader_vertex_source, shader_fragment_source);
    pahaKiri.translate = [0.2, 0,0.5];
    pahaKiri.rotate = [90, 0, 0];
    headluar.addChild(pahaKiri);
    test.push(pahaKiri);
    
    calculate = createElipPara(0.2, 36, 18, 1, 1, 2, 0, 0, 0, 255, 255, 255);
    var kakiKiri_vertex = calculate[0];
    var kakiKiri_faces = calculate[1];
    var kakiKiri = new MyObject("kakiKiri", kakiKiri_vertex, kakiKiri_faces, shader_vertex_source, shader_fragment_source);
    kakiKiri.translate = [0.2, 0,1.2];
    kakiKiri.rotate = [90, 0, 0];
    woopy.addChild(kakiKiri);
    test.push(kakiKiri);




    var calculate = createElips(0.37, 36, 18, 1, 1, 1, 0, 0, 0, 255,  255, 0);
    var ronaKiri_vertex = calculate[0];
    var ronaKiri_faces = calculate[1];
    var ronaKiri = new MyObject("ronaKiri", ronaKiri_vertex, ronaKiri_faces, shader_vertex_source, shader_fragment_source);
    ronaKiri.translate = [0.6, -0.4, 1.1];
    headluar.addChild(ronaKiri);
    test.push(ronaKiri);

    var calculate = createElips(0.37, 36, 18, 1, 1, 1, 0, 0, 0, 255,  255, 0);
    var ronaKanan_vertex = calculate[0];
    var ronaKanan_faces = calculate[1];
    var ronaKanan = new MyObject("ronaKanan", ronaKanan_vertex, ronaKanan_faces, shader_vertex_source, shader_fragment_source);
    ronaKanan.translate = [-0.6, -0.4, 1.1];
    headluar.addChild(ronaKanan);
    test.push(ronaKanan);

  
    var eyes = [];
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
    var eye = new MyObject("mataKanan", eyeLeft_vertex, eyeLeft_faces, shader_vertex_source, shader_fragment_source);
    eyes.push(eye);
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
    eye = new MyObject("mataKiri", eyeRight_vertex, eyeRight_faces, shader_vertex_source, shader_fragment_source);
    eyes.push(eye);

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


    var curve = [0.0, 0.0, 0.2, -0.1, 0.2, 0];
    yStart = -0.4;
    for (let index = 0; index < 4; index++) {
        var line_vertex = bezier.generateBSpline(curve, 100, 2, -0.1, yStart, 1.58);
        var line_faces = [];
        for (let index = 0; index < line_vertex.length / 6; index++) {
            line_faces.push(index);
        }
        var mouth1 = new MyObject("mulutCurve", line_vertex, line_faces, shader_vertex_source, shader_fragment_source);
        yStart += 0.005;
        line.push(mouth1);
    }
    
    var curve = [0.0, 0.0, 0.2, -0.1, 0.2, 0];
    yStart = -0.4;
    for (let index = 0; index < 4; index++) {
        var line_vertex = bezier.generateBSpline(curve, 100, 2, 0.1, yStart, 1.58);
        var line_faces = [];
        for (let index = 0; index < line_vertex.length / 6; index++) {
            line_faces.push(index);
        }
        var mouth2 = new MyObject("mulutCurve", line_vertex, line_faces, shader_vertex_source, shader_fragment_source);
        yStart += 0.005;
        line.push(mouth2);
    }

    curve = [0.0, 0.0, 0.1, 0.1, 0.2, 0];
    yStart = 0.2;
    for (let index = 0; index < 4; index++) {
        var line_vertex = bezier.generateBSpline(curve, 100, 2, -0.45, yStart, 1.58);
        var line_faces = [];
        for (let index = 0; index < line_vertex.length / 6; index++) {
            line_faces.push(index);
        }
        var alisKanan = new MyObject("alisKanan", line_vertex, line_faces, shader_vertex_source, shader_fragment_source);
        yStart += 0.005;
        line.push(alisKanan);
    }
    curve = [0.0, 0.0, 0.1, 0.1, 0.2, 0];
    yStart = 0.2;
    for (let index = 0; index < 4; index++) {
        var line_vertex = bezier.generateBSpline(curve, 100, 2, 0.25, yStart, 1.58);
        var line_faces = [];
        for (let index = 0; index < line_vertex.length / 6; index++) {
            line_faces.push(index);
        }
        var alisKiri = new MyObject("alisKiri", line_vertex, line_faces, shader_vertex_source, shader_fragment_source);
        yStart += 0.005;
        line.push(alisKiri);
    }


    

   
   

    line.forEach(obj => {
        headluar.addChild(obj);
        test.push(obj);
    });

    mouthVertical.forEach(obj => {
        headluar.addChild(obj);
        test.push(obj);
    });


    eyes.forEach(obj => {
        headluar.addChild(obj);
        test.push(obj);
    });

    woopy.setScale(0.1);
    // telinga.addScale(1);

    //MATRIX
    var PROJMATRIX = LIBS.get_projection(40, CANVAS.width / CANVAS.height, 1, 100);
    var VIEWMATRIX = LIBS.get_I4();

    LIBS.translateZ(VIEWMATRIX, -2);

    //DRAWING
    GL.clearColor(0.0, 0.0, 0.0, 0.0);

    GL.enable(GL.DEPTH_TEST);
    GL.depthFunc(GL.LEQUAL);

    GL.clearDepth(1.0);

    
    var membesar = true;
    var nextTime = 0;
    var ganjil = false;
    var genap = true;
    var maju = true;
    var mundur = false;
    
    var time_prev = 0;
    
    var animate = function (time) {
        if (time > 0) {
            var dt = time - time_prev;
            if (!drag) {
                dX *= AMORTIZATION;
                dY *= AMORTIZATION;
                THETA += dX * 0.05; // Mengurangi dampak perubahan sudut
                PHI += dY * 0.05;
            }
            var second = time / 1000; // Konversi milidetik ke detik
    
            // Memperbarui transformasi rotasi dan translasi berdasarkan input
            woopy.setRotateMove(LIBS.radToDeg(PHI), LIBS.radToDeg(THETA), 0);
    
            // Animasi telinga membesar secara lebih halus
            if (time - nextTime > 1000 && telinga.scale[0] < 4) {
                if (membesar) {
                    telinga.addScale(1.001); // Meningkatkan skala lebih halus
                    membesar = false;
                    nextTime = time;
                } else {
                    telinga.setScale(1); // Reset skala
                    membesar = true;
                }
            }
    
            time_prev = time;
        }
        GL.viewport(0, 0, CANVAS.width, CANVAS.height);
        GL.clear(GL.COLOR_BUFFER_BIT | GL.DEPTH_BUFFER_BIT);
    
        woopy.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        woopy.draw();
        woopy.setIdentityMove();
    
        // Animasi kaki dengan pergerakan yang lebih kecil dan lebih detail
        var rotationAmount = 5; // Mengurangi jumlah rotasi
        var moveAmount = 0.1; // Mengurangi jarak translasi
    
        if (second >= nextTime) {
            if (genap) {
              if (maju) {
                  kakiKanan.setRotate(10,0,0);
                  kakiKanan.setTranslateMove(0,0.3,0);
                  lenganKiri.setRotate(10,0,0);
                  tanganKiri.setRotate(10,0,0);
                  
              } else if (mundur){
                  kakiKanan.setRotate(-10,0,0);
                  kakiKanan.setTranslateMove(0,-0.3,0);
                  lenganKiri.setRotate(-10,0,0);
                  tanganKiri.setRotate(-10,0,0);
              }
              if (mundur) {
                  kakiKiri.setRotate(10,0,0);
                  kakiKiri.setTranslateMove(0,0.3,0);
                  lenganKanan.setRotate(10,0,0);
                  tanganKanan.setRotate(10,0,0);
              } else if (maju){
                  kakiKiri.setRotate(-10,0,0);
                  kakiKiri.setTranslateMove(0,-0.3,0);
                  lenganKanan.setRotate(-10,0,0);
                  tanganKanan.setRotate(-10,0,0);
              }
                genap = false;
                ganjil = true;
          } else if (ganjil) {
              if (maju) {
                  kakiKanan.setRotate(-10,0,0);
                  kakiKanan.setTranslateMove(0,-0.3,0);
                  lenganKiri.setRotate(-10,0,0);
                  tanganKiri.setRotate(-10,0,0);
                  maju = false;
                  mundur = true;
              } else if (mundur) {
                  kakiKanan.setRotate(10,0,0);
                  kakiKanan.setTranslateMove(0,0.3,0);
                  lenganKiri.setRotate(10,0,0);
                  tanganKiri.setRotate(10,0,0);
                  maju = true;
                  mundur = false;
              }
              if (mundur) {
                  kakiKiri.setRotate(-10,0,0);
                  kakiKiri.setTranslateMove(0,-0.3,0);
                  lenganKanan.setRotate(-10,0,0);
                  tanganKanan.setRotate(-10,0,0);
                  maju = false;
                  mundur = true;
              } else if (maju) {
                  kakiKiri.setRotate(10,0,0);
                  kakiKiri.setTranslateMove(0,0.3,0);
                  lenganKanan.setRotate(10,0,0);
                  tanganKanan.setRotate(10,0,0);
                  maju = true;
                  mundur = false;
              }
              genap = true;
              ganjil = false;
            } 
            nextTime += 0.3;
          }
        if (second >= 3 && second <= 4) {
            woopy.setTranslateMove(-0.1, 0, 0);
          }
          if (second >= 4 && second <= 8) {
            woopy.setRotate(0,1,0);
          }
          if (second>= 8 && second <= 9) {
            woopy.setTranslateMove(0.1,0,0);
          }
          if (second >= 9 && second <= 12) {
            woopy.setRotate(2,0,0);
          }
          if (second >= 12 && second <= 13) {
            woopy.setTranslateMove(0,0,0);
          }
          if (second >= 13 && second <= 15) {
            woopy.setRotate(0,1,0);
          }
          if (second >= 15 && second <= 15) {
            woopy.setTranslateMove(0,0,0);
          }

        GL.flush();
        window.requestAnimationFrame(animate);
    }
    
    animate();
    
    
}
window.addEventListener('load', main);
