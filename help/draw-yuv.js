/*
 * @Author: xiuquanxu
 * @Company: kaochong
 * @Date: 2021-03-17 23:09:55
 * @LastEditors: xiuquanxu
 * @LastEditTime: 2021-06-01 18:08:11
*/
// 返回null则不支持webgl
const getGL = (canvas, contextOptions) => {
    let gl = null;

    const validContextNames = ['webgl', 'experimental-webgl', 'moz-webgl', 'webkit-3d'];
    let nameIndex = 0;

    while (!gl && nameIndex < validContextNames.length) {
        const contextName = validContextNames[nameIndex];
        try {
            if (contextOptions) {
                gl = canvas.getContext(contextName, contextOptions);
            } else {
                gl = canvas.getContext(contextName);
            }
        } catch (e) {
            gl = null;
        }

        if (!gl || typeof gl.getParameter !== 'function') {
            gl = null;
        }
        nameIndex += 1;
    }
    return gl;
};

const compileShader = (gl, vertexSource, fragmentSource) => {
    // 1. 创建着色器对象(gl.createShader())
    // 2. 着色器对象中填充着色器程序源代码(gl.shaderSource())
    // 3. 编译器着色器(gl.compileShader())
    // 4. 创建程序对象(gl.createProgram())
    // 5. 为程序对象分配着色器(gl.attachShader())
    // 6. 连接程序对象(gl.linkProgram())
    // 7. 使用程序对象(gl.useProgram())
    const vertexShader = gl.createShader(gl.VERTEX_SHADER);
    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
    if (vertexShader ==null || fragmentShader == null) {
        throw new Error(`createShader error vertexShader:${!!vertexShader} fragmentShader:${!!fragmentShader}`);
    }
    gl.shaderSource(vertexShader, vertexSource);
    gl.shaderSource(fragmentShader, fragmentSource);
    gl.compileShader(vertexShader);
    gl.compileShader(fragmentShader);
    // attachShader
    const vertexCompiled = gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS);
    const fragmentCompiled = gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS);
    if (!vertexCompiled || !fragmentCompiled) {
        const vertexError = gl.getShaderInfoLog(vertexShader);
        const fragmentError = gl.getShaderInfoLog(fragmentShader);
        throw new Error(`compile shader error vertexError:${vertexError} fragmentError:${fragmentError}`);
    }
    // shader创建成功开始关联程序对象
    const program = gl.createProgram();
    if (!program) {
        throw new Error(`createProgram error:${program}`);
    }
    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);

    // 连接程序对象
    gl.linkProgram(program);
    gl.useProgram(program);
    const linked = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (!linked) {
        const error = gl.getProgramInfoLog(program);
        gl.deleteProgram(program);
        gl.deleteShader(fragmentShader);
        gl.deleteShader(vertexShader);
        throw new Error(`link error:${linked}`);
    }
    gl.program = program;
    return program;
}

// 支持YUV420
class DrawYuv {
    constructor(canvas) {
        this.canvas = canvas;
        // this.context = this.canvas.getContext('2d');
        this.gl = getGL(this.canvas);
        this.width = 0;
        this.attribute = {
            a_Position: '',
            a_Texture: '',
            v_Texture: ''
        };
        this.uniform = {
            ySampler: '',
            uSampler: '',
            vSampler: '',
            yuv2rgb: '',
            
        };
        this.mat4 = [
            1.16438,  0.00000,  1.79274, -0.97295,
            1.16438, -0.21325, -0.53291,  0.30148,
            1.16438,  2.11240,  0.00000, -1.13340,
            0, 0, 0, 1,
        ];
        this._init();
    }

    /**
     * @param {*} opt 
     * opt: {
     *  width: xx,
     *  height: xx,
     *  yData: xx,
     *  uData: xx,
     *  vData: xx,
     * }
     */
     play(opt) {
        const { width, height, yData, uData, vData } = opt;

        this.gl.viewport(0, 0, width, height);
        this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, 1);

        const buffer = this._createBuffer();
        const n = this._configVertex(buffer)
        // const n1 = this._configVertex(buffer, new Float32Array(point), this.attribute.a_Texture, 2, 0, 4);
        const texture0 = this._createTexture();
        this.gl.uniform1i(this.uniform.ySampler, 0);
        const texture1 = this._createTexture();
        this.gl.uniform1i(this.uniform.uSampler, 1);
        const texture2 = this._createTexture();
        this.gl.uniform1i(this.uniform.vSampler, 2);

        this.gl.uniformMatrix4fv(this.uniform.yuv2rgb, false, new Float32Array(this.mat4));

        this.gl.activeTexture(this.gl.TEXTURE0);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture0);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.LUMINANCE, width, height, 0, this.gl.LUMINANCE, this.gl.UNSIGNED_BYTE, yData);

        this.gl.activeTexture(this.gl.TEXTURE1);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture1);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.LUMINANCE, width >> 1, height >> 1, 0, this.gl.LUMINANCE, this.gl.UNSIGNED_BYTE, uData);

        this.gl.activeTexture(this.gl.TEXTURE2);
        this.gl.bindTexture(this.gl.TEXTURE_2D, texture2);
        this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.gl.LUMINANCE, width >> 1, height >> 1, 0, this.gl.LUMINANCE, this.gl.UNSIGNED_BYTE, vData);

        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, 0, 4);

    }

    _init() {
        this.width = this.canvas.width;
        this.heigith = this.canvas.height;
        if (!compileShader(this.gl, this._getVetexShader(), this._getFragmentShader())) {
            console.error('init shader error');
            return;
        }
        this.gl.clearColor(0.0, 0.0, 0.0, 1.0);
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
        this.attribute.a_Position = this.gl.getAttribLocation(this.gl.program, 'a_Position');
        this.attribute.a_Texture = this.gl.getAttribLocation(this.gl.program, 'a_Texture');
        this.attribute.v_Texture = this.gl.getAttribLocation(this.gl.program, 'v_Texture');
        this.uniform.ySampler = this.gl.getUniformLocation(this.gl.program, 'ySampler');
        this.uniform.uSampler = this.gl.getUniformLocation(this.gl.program, 'uSampler');
        this.uniform.vSampler = this.gl.getUniformLocation(this.gl.program, 'vSampler');
        this.uniform.yuv2rgb = this.gl.getUniformLocation(this.gl.program, 'YUV2RGB');
        if (!this.uniform.ySampler || !this.uniform.uSampler || !this.uniform.vSampler || !this.uniform.yuv2rgb) {
            console.error('u_FragColor error');
        }
    }
    
    _createTexture() {
        // 创建配置纹理
        const gl = this.gl;
        const textureRef = gl.createTexture();
        gl.bindTexture(gl.TEXTURE_2D, textureRef);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.bindTexture(gl.TEXTURE_2D, null);
    
        return textureRef;
    }

    _createBuffer() {
        const buffer = this.gl.createBuffer();
        return buffer;
    }

    _configVertex(buffer) {
        // 画矩形时候是有顺序的
        // 必须是这个迅速
        const point = [ 
            0, 1, -1, 1,
            0, 0, -1, -1,
            1, 1, 1, 1,
            1, 0, 1, -1
        ];
        const bytes = new Float32Array(point);
        const fsize = bytes.BYTES_PER_ELEMENT;
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, bytes, this.gl.STATIC_DRAW);
        this.gl.vertexAttribPointer(this.attribute.a_Texture, 2, this.gl.FLOAT, false, 4 * fsize, 0 * fsize, 0);
        this.gl.enableVertexAttribArray(this.attribute.a_Texture);
        this.gl.vertexAttribPointer(this.attribute.a_Position, 2, this.gl.FLOAT, false, 4 * fsize, 2 * fsize, 0);
        this.gl.enableVertexAttribArray(this.attribute.a_Position);
        return bytes.length / 2;
    }

    _getVetexShader() {
        const VetexShader = `
            attribute vec4 a_Position;
            attribute vec2 a_Texture;
            varying vec2 v_Texture;
            void main() {
                gl_Position = a_Position;
                v_Texture = a_Texture;
            }
        `;
        return VetexShader;
    }

    _getFragmentShader() {
        const FragmentShader = `
            precision mediump float;
            uniform sampler2D ySampler;
            uniform sampler2D uSampler;
            uniform sampler2D vSampler;
            uniform mat4 YUV2RGB;
            varying vec2 v_Texture;
            void main(void) {
                 float y = texture2D(ySampler, v_Texture).r;
                 float u = texture2D(uSampler, v_Texture).r;
                 float v = texture2D(vSampler, v_Texture).r;
                gl_FragColor = vec4(y, u, v, 1.0) * YUV2RGB;

            }
        `;
        return FragmentShader;
    }
}

export { DrawYuv }