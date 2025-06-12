// Neural Noise Background Effect
(function() {
    // Create canvas element
    const canvas = document.createElement('canvas');
    canvas.id = 'neuro';
    canvas.style.cssText = `
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        opacity: 0.15;
        z-index: 1;
    `;

    // Vertex shader
    const vertShaderSource = `
        precision mediump float;
        varying vec2 vUv;
        attribute vec2 a_position;

        void main() {
            vUv = .5 * (a_position + 1.);
            gl_Position = vec4(a_position, 0.0, 1.0);
        }
    `;

    // Fragment shader
    const fragShaderSource = `
        precision mediump float;
        varying vec2 vUv;
        uniform float u_time;
        uniform float u_ratio;
        uniform vec2 u_pointer_position;
        uniform float u_scroll_progress;

        vec2 rotate(vec2 uv, float th) {
            return mat2(cos(th), sin(th), -sin(th), cos(th)) * uv;
        }

        float neuro_shape(vec2 uv, float t, float p) {
            vec2 sine_acc = vec2(0.);
            vec2 res = vec2(0.);
            float scale = 8.;

            for (int j = 0; j < 15; j++) {
                uv = rotate(uv, 1.);
                sine_acc = rotate(sine_acc, 1.);
                vec2 layer = uv * scale + float(j) + sine_acc - t;
                sine_acc += sin(layer) + 2.4 * p;
                res += (.5 + .5 * cos(layer)) / scale;
                scale *= (1.2);
            }
            return res.x + res.y;
        }

        void main() {
            vec2 uv = .5 * vUv;
            uv.x *= u_ratio;

            vec2 pointer = vUv - u_pointer_position;
            pointer.x *= u_ratio;
            float p = clamp(length(pointer), 0., 1.);
            p = .5 * pow(1. - p, 2.);

            float t = .001 * u_time;
            vec3 color = vec3(0.);

            float noise = neuro_shape(uv, t, p);

            noise = 1.2 * pow(noise, 3.);
            noise += pow(noise, 10.);
            noise = max(.0, noise - .5);
            noise *= (1. - length(vUv - .5));

            // Subtle blue palette matching site theme
            color = vec3(0.05, 0.1, 0.4); // Darker, more subtle blue
            color += vec3(0.0, 0.05, 0.2) * sin(3.0 * u_scroll_progress + 1.5); // Subtle variation

            color = color * noise;

            gl_FragColor = vec4(color, noise);
        }
    `;

    let gl, uniforms;
    const devicePixelRatio = Math.min(window.devicePixelRatio, 2);
    const pointer = {
        x: 0,
        y: 0,
        tX: 0,
        tY: 0,
    };

    function initShader() {
        const gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");

        if (!gl) {
            console.warn("WebGL is not supported by your browser.");
            return null;
        }

        function createShader(gl, sourceCode, type) {
            const shader = gl.createShader(type);
            gl.shaderSource(shader, sourceCode);
            gl.compileShader(shader);

            if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
                console.error("An error occurred compiling the shaders: " + gl.getShaderInfoLog(shader));
                gl.deleteShader(shader);
                return null;
            }

            return shader;
        }

        const vertexShader = createShader(gl, vertShaderSource, gl.VERTEX_SHADER);
        const fragmentShader = createShader(gl, fragShaderSource, gl.FRAGMENT_SHADER);

        function createShaderProgram(gl, vertexShader, fragmentShader) {
            const program = gl.createProgram();
            gl.attachShader(program, vertexShader);
            gl.attachShader(program, fragmentShader);
            gl.linkProgram(program);

            if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
                console.error("Unable to initialize the shader program: " + gl.getProgramInfoLog(program));
                return null;
            }

            return program;
        }

        const shaderProgram = createShaderProgram(gl, vertexShader, fragmentShader);
        uniforms = getUniforms(shaderProgram);

        function getUniforms(program) {
            let uniforms = [];
            let uniformCount = gl.getProgramParameter(program, gl.ACTIVE_UNIFORMS);
            for (let i = 0; i < uniformCount; i++) {
                let uniformName = gl.getActiveUniform(program, i).name;
                uniforms[uniformName] = gl.getUniformLocation(program, uniformName);
            }
            return uniforms;
        }

        const vertices = new Float32Array([-1., -1., 1., -1., -1., 1., 1., 1.]);

        const vertexBuffer = gl.createBuffer();
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);

        gl.useProgram(shaderProgram);

        const positionLocation = gl.getAttribLocation(shaderProgram, "a_position");
        gl.enableVertexAttribArray(positionLocation);

        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        return gl;
    }

    function render() {
        if (!gl) return;

        const currentTime = performance.now();

        pointer.x += (pointer.tX - pointer.x) * .2;
        pointer.y += (pointer.tY - pointer.y) * .2;

        gl.uniform1f(uniforms.u_time, currentTime);
        gl.uniform2f(uniforms.u_pointer_position, pointer.x / window.innerWidth, 1 - pointer.y / window.innerHeight);
        gl.uniform1f(uniforms.u_scroll_progress, window.pageYOffset / (2 * window.innerHeight));

        gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
        requestAnimationFrame(render);
    }

    function resizeCanvas() {
        if (!gl) return;

        canvas.width = window.innerWidth * devicePixelRatio;
        canvas.height = window.innerHeight * devicePixelRatio;
        gl.uniform1f(uniforms.u_ratio, canvas.width / canvas.height);
        gl.viewport(0, 0, canvas.width, canvas.height);
    }

    function setupEvents() {
        window.addEventListener("pointermove", e => {
            updateMousePosition(e.clientX, e.clientY);
        });
        window.addEventListener("touchmove", e => {
            updateMousePosition(e.targetTouches[0].clientX, e.targetTouches[0].clientY);
        });
        window.addEventListener("click", e => {
            updateMousePosition(e.clientX, e.clientY);
        });

        function updateMousePosition(eX, eY) {
            pointer.tX = eX;
            pointer.tY = eY;
        }
    }

    function init() {
        // Wait for DOM to be ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', init);
            return;
        }

        // Find hero section and add canvas
        const heroSection = document.querySelector('.hero');
        if (!heroSection) {
            console.warn('Hero section not found');
            return;
        }

        // Add canvas to hero section
        heroSection.style.position = 'relative';
        heroSection.appendChild(canvas);

        // Initialize WebGL
        gl = initShader();
        if (!gl) return;

        // Setup
        setupEvents();
        resizeCanvas();
        window.addEventListener("resize", resizeCanvas);

        // Start rendering
        render();
    }

    // Initialize
    init();
})();