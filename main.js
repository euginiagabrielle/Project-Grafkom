var GL;
//drawLine
var line = [];
var kumisAtas = [];
var kumisKiri = [];
var kumisKanan = [];
var mouthVertical = [];
var test = [];

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
    var persegi_vertex = [3, -0.8, 3, 0.4, 0.5, 0.6, -3,-0.8,3, 0.4, 0.5, 0.6, 3,-0.8,-3, 0.4, 0.5, 0.6, -3, -0.8, -3, 0.4, 0.5, 0.6];
    var persegi_faces = [0, 1, 2, 2, 1, 3];
    var lantai = new MyObject("persegi", persegi_vertex, persegi_faces, shader_vertex_source, shader_fragment_source);
    //...
    //env end

    //Sean start
    
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

    LIBS.translateZ(VIEWMATRIX, -10);

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

            //Sean start
            
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
        lantai.setuniformmatrix4(PROJMATRIX, VIEWMATRIX);
        lantai.draw();
        lantai.setIdentityMove();
        //...
        //env end
        
        //Sean start
        
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
