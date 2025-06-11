// Full Ballpit Animation - Vanilla JavaScript (no React needed)
(function(){
  if(!window.THREE){console.warn('Three.js not loaded, ballpit disabled');return;}
  
  const { 
    Clock, PerspectiveCamera, Scene, WebGLRenderer, SRGBColorSpace, MathUtils, Vector2, Vector3,
    MeshPhysicalMaterial, ShaderChunk, Color, Object3D, InstancedMesh, PMREMGenerator,
    SphereGeometry, AmbientLight, PointLight, ACESFilmicToneMapping, Raycaster, Plane
  } = THREE;
  
  // RoomEnvironment might not be available in the CDN version
  const RoomEnvironment = THREE.RoomEnvironment;

  // Three.js wrapper class
  class ThreeWrapper {
    constructor(config) {
      this.config = { ...config };
      this.size = { width: 0, height: 0, wWidth: 0, wHeight: 0, ratio: 0, pixelRatio: 0 };
      this.clock = new Clock();
      this.time = { elapsed: 0, delta: 0 };
      this.isVisible = false;
      this.isAnimating = false;
      this.isDisposed = false;
      
      this.setupCamera();
      this.setupScene();
      this.setupRenderer();
      this.resize();
      this.setupEventListeners();
    }
    
    setupCamera() {
      this.camera = new PerspectiveCamera();
      this.cameraFov = this.camera.fov;
    }
    
    setupScene() {
      this.scene = new Scene();
    }
    
    setupRenderer() {
      if (this.config.canvas) {
        this.canvas = this.config.canvas;
      } else if (this.config.id) {
        this.canvas = document.getElementById(this.config.id);
      }
      
      this.canvas.style.display = "block";
      
      const options = {
        canvas: this.canvas,
        powerPreference: "high-performance",
        ...(this.config.rendererOptions ?? {})
      };
      
      this.renderer = new WebGLRenderer(options);
      this.renderer.outputColorSpace = SRGBColorSpace;
    }
    
    setupEventListeners() {
      window.addEventListener("resize", this.handleResize.bind(this));
      
      this.intersectionObserver = new IntersectionObserver(this.handleIntersection.bind(this), {
        root: null,
        rootMargin: "0px",
        threshold: 0
      });
      this.intersectionObserver.observe(this.canvas);
      
      document.addEventListener("visibilitychange", this.handleVisibility.bind(this));
    }
    
    handleResize() {
      if (this.resizeTimeout) clearTimeout(this.resizeTimeout);
      this.resizeTimeout = setTimeout(this.resize.bind(this), 100);
    }
    
    handleIntersection(entries) {
      this.isVisible = entries[0].isIntersecting;
      this.isVisible ? this.start() : this.stop();
    }
    
    handleVisibility() {
      if (this.isVisible) {
        document.hidden ? this.stop() : this.start();
      }
    }
    
    resize() {
      let width, height;
      
      if (this.config.size instanceof Object) {
        width = this.config.size.width;
        height = this.config.size.height;
      } else if (this.config.size === "parent" && this.canvas.parentNode) {
        width = this.canvas.parentNode.offsetWidth;
        height = this.canvas.parentNode.offsetHeight;
      } else {
        width = window.innerWidth;
        height = window.innerHeight;
      }
      
      this.size.width = width;
      this.size.height = height;
      this.size.ratio = width / height;
      
      this.updateCamera();
      this.updateRenderer();
      
      if (this.onAfterResize) this.onAfterResize(this.size);
    }
    
    updateCamera() {
      this.camera.aspect = this.size.width / this.size.height;
      
      if (this.camera.isPerspectiveCamera && this.cameraFov) {
        if (this.cameraMinAspect && this.camera.aspect < this.cameraMinAspect) {
          this.adjustFov(this.cameraMinAspect);
        } else if (this.cameraMaxAspect && this.camera.aspect > this.cameraMaxAspect) {
          this.adjustFov(this.cameraMaxAspect);
        } else {
          this.camera.fov = this.cameraFov;
        }
      }
      
      this.camera.updateProjectionMatrix();
      this.updateWorldSize();
    }
    
    adjustFov(targetAspect) {
      const vFov = Math.tan(MathUtils.degToRad(this.cameraFov / 2)) / (this.camera.aspect / targetAspect);
      this.camera.fov = 2 * MathUtils.radToDeg(Math.atan(vFov));
    }
    
    updateWorldSize() {
      if (this.camera.isPerspectiveCamera) {
        const vFov = (this.camera.fov * Math.PI) / 180;
        this.size.wHeight = 2 * Math.tan(vFov / 2) * this.camera.position.length();
        this.size.wWidth = this.size.wHeight * this.camera.aspect;
      }
    }
    
    updateRenderer() {
      this.renderer.setSize(this.size.width, this.size.height);
      
      let pixelRatio = window.devicePixelRatio;
      if (this.maxPixelRatio && pixelRatio > this.maxPixelRatio) {
        pixelRatio = this.maxPixelRatio;
      } else if (this.minPixelRatio && pixelRatio < this.minPixelRatio) {
        pixelRatio = this.minPixelRatio;
      }
      
      this.renderer.setPixelRatio(pixelRatio);
      this.size.pixelRatio = pixelRatio;
    }
    
    start() {
      if (this.isAnimating) return;
      
      const animate = () => {
        this.animationFrame = requestAnimationFrame(animate);
        this.time.delta = this.clock.getDelta();
        this.time.elapsed += this.time.delta;
        
        if (this.onBeforeRender) this.onBeforeRender(this.time);
        this.render();
        if (this.onAfterRender) this.onAfterRender(this.time);
      };
      
      this.isAnimating = true;
      this.clock.start();
      animate();
    }
    
    stop() {
      if (this.isAnimating) {
        cancelAnimationFrame(this.animationFrame);
        this.isAnimating = false;
        this.clock.stop();
      }
    }
    
    render() {
      this.renderer.render(this.scene, this.camera);
    }
    
    dispose() {
      window.removeEventListener("resize", this.handleResize.bind(this));
      this.intersectionObserver?.disconnect();
      document.removeEventListener("visibilitychange", this.handleVisibility.bind(this));
      
      this.stop();
      this.renderer.dispose();
      this.isDisposed = true;
    }
  }

  // Mouse tracking
  const mouseTrackers = new Map();
  const mousePos = new Vector2();
  let trackingEnabled = false;

  function createMouseTracker(config) {
    const tracker = {
      position: new Vector2(),
      nPosition: new Vector2(),
      hover: false,
      onEnter() {},
      onMove() {},
      onClick() {},
      onLeave() {},
      ...config
    };
    
    if (!mouseTrackers.has(config.domElement)) {
      mouseTrackers.set(config.domElement, tracker);
      
      if (!trackingEnabled) {
        document.body.addEventListener("pointermove", handleMouseMove);
        document.body.addEventListener("pointerleave", handleMouseLeave);
        document.body.addEventListener("click", handleClick);
        trackingEnabled = true;
      }
    }
    
    tracker.dispose = () => {
      mouseTrackers.delete(config.domElement);
      
      if (mouseTrackers.size === 0) {
        document.body.removeEventListener("pointermove", handleMouseMove);
        document.body.removeEventListener("pointerleave", handleMouseLeave);
        document.body.removeEventListener("click", handleClick);
        trackingEnabled = false;
      }
    };
    
    return tracker;
  }

  function handleMouseMove(e) {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    
    for (const [elem, tracker] of mouseTrackers) {
      const rect = elem.getBoundingClientRect();
      
      if (isInsideRect(rect)) {
        updateTrackerPosition(tracker, rect);
        
        if (!tracker.hover) {
          tracker.hover = true;
          tracker.onEnter(tracker);
        }
        
        tracker.onMove(tracker);
      } else if (tracker.hover) {
        tracker.hover = false;
        tracker.onLeave(tracker);
      }
    }
  }

  function handleClick(e) {
    mousePos.x = e.clientX;
    mousePos.y = e.clientY;
    
    for (const [elem, tracker] of mouseTrackers) {
      const rect = elem.getBoundingClientRect();
      updateTrackerPosition(tracker, rect);
      
      if (isInsideRect(rect)) {
        tracker.onClick(tracker);
      }
    }
  }

  function handleMouseLeave() {
    for (const tracker of mouseTrackers.values()) {
      if (tracker.hover) {
        tracker.hover = false;
        tracker.onLeave(tracker);
      }
    }
  }

  function updateTrackerPosition(tracker, rect) {
    const { position, nPosition } = tracker;
    position.x = mousePos.x - rect.left;
    position.y = mousePos.y - rect.top;
    nPosition.x = (position.x / rect.width) * 2 - 1;
    nPosition.y = (-position.y / rect.height) * 2 + 1;
  }

  function isInsideRect(rect) {
    return mousePos.x >= rect.left && mousePos.x <= rect.left + rect.width &&
           mousePos.y >= rect.top && mousePos.y <= rect.top + rect.height;
  }

  // Physics simulation
  const { randFloat, randFloatSpread } = MathUtils;
  const tempVec1 = new Vector3();
  const tempVec2 = new Vector3();
  const tempVec3 = new Vector3();
  const tempVel1 = new Vector3();
  const tempVel2 = new Vector3();
  const tempDiff = new Vector3();
  const tempForce = new Vector3();
  const tempImpulse1 = new Vector3();
  const tempImpulse2 = new Vector3();

  class Physics {
    constructor(config) {
      this.config = config;
      this.positionData = new Float32Array(3 * config.count).fill(0);
      this.velocityData = new Float32Array(3 * config.count).fill(0);
      this.sizeData = new Float32Array(config.count).fill(1);
      this.center = new Vector3();
      
      this.initializePositions();
      this.setSizes();
    }
    
    initializePositions() {
      const { config, positionData } = this;
      this.center.toArray(positionData, 0);
      
      for (let i = 1; i < config.count; i++) {
        const idx = 3 * i;
        positionData[idx] = randFloatSpread(2 * config.maxX);
        positionData[idx + 1] = randFloatSpread(2 * config.maxY);
        positionData[idx + 2] = randFloatSpread(2 * config.maxZ);
      }
    }
    
    setSizes() {
      const { config, sizeData } = this;
      sizeData[0] = config.size0;
      
      for (let i = 1; i < config.count; i++) {
        sizeData[i] = randFloat(config.minSize, config.maxSize);
      }
    }
    
    update(time) {
      const { config, center, positionData, sizeData, velocityData } = this;
      let startIdx = 0;
      
      // Handle control sphere
      if (config.controlSphere0) {
        startIdx = 1;
        tempVec1.fromArray(positionData, 0);
        tempVec1.lerp(center, 0.1).toArray(positionData, 0);
        tempVel1.set(0, 0, 0).toArray(velocityData, 0);
      }
      
      // Update positions
      for (let i = startIdx; i < config.count; i++) {
        const idx = 3 * i;
        tempVec2.fromArray(positionData, idx);
        tempVel1.fromArray(velocityData, idx);
        
        // Apply gravity
        tempVel1.y -= time.delta * config.gravity * sizeData[i];
        
        // Apply friction
        tempVel1.multiplyScalar(config.friction);
        
        // Clamp velocity
        tempVel1.clampLength(0, config.maxVelocity);
        
        // Update position
        tempVec2.add(tempVel1);
        tempVec2.toArray(positionData, idx);
        tempVel1.toArray(velocityData, idx);
      }
      
      // Handle collisions
      for (let i = startIdx; i < config.count; i++) {
        const idx = 3 * i;
        tempVec2.fromArray(positionData, idx);
        tempVel1.fromArray(velocityData, idx);
        const radius = sizeData[i];
        
        // Sphere-sphere collisions
        for (let j = i + 1; j < config.count; j++) {
          const jdx = 3 * j;
          tempVec3.fromArray(positionData, jdx);
          tempVel2.fromArray(velocityData, jdx);
          const otherRadius = sizeData[j];
          
          tempDiff.copy(tempVec3).sub(tempVec2);
          const dist = tempDiff.length();
          const sumRadius = radius + otherRadius;
          
          if (dist < sumRadius) {
            const overlap = sumRadius - dist;
            tempForce.copy(tempDiff).normalize().multiplyScalar(0.5 * overlap);
            tempImpulse1.copy(tempForce).multiplyScalar(Math.max(tempVel1.length(), 1));
            tempImpulse2.copy(tempForce).multiplyScalar(Math.max(tempVel2.length(), 1));
            
            tempVec2.sub(tempForce);
            tempVel1.sub(tempImpulse1);
            tempVec2.toArray(positionData, idx);
            tempVel1.toArray(velocityData, idx);
            
            tempVec3.add(tempForce);
            tempVel2.add(tempImpulse2);
            tempVec3.toArray(positionData, jdx);
            tempVel2.toArray(velocityData, jdx);
          }
        }
        
        // Control sphere collision
        if (config.controlSphere0) {
          tempDiff.copy(tempVec1).sub(tempVec2);
          const dist = tempDiff.length();
          const sumRadius0 = radius + sizeData[0];
          
          if (dist < sumRadius0) {
            const diff = sumRadius0 - dist;
            tempForce.copy(tempDiff.normalize()).multiplyScalar(diff);
            tempImpulse1.copy(tempForce).multiplyScalar(Math.max(tempVel1.length(), 2));
            tempVec2.sub(tempForce);
            tempVel1.sub(tempImpulse1);
          }
        }
        
        // Wall collisions
        if (Math.abs(tempVec2.x) + radius > config.maxX) {
          tempVec2.x = Math.sign(tempVec2.x) * (config.maxX - radius);
          tempVel1.x = -tempVel1.x * config.wallBounce;
        }
        
        if (config.gravity === 0) {
          if (Math.abs(tempVec2.y) + radius > config.maxY) {
            tempVec2.y = Math.sign(tempVec2.y) * (config.maxY - radius);
            tempVel1.y = -tempVel1.y * config.wallBounce;
          }
        } else if (tempVec2.y - radius < -config.maxY) {
          tempVec2.y = -config.maxY + radius;
          tempVel1.y = -tempVel1.y * config.wallBounce;
        }
        
        const maxBoundary = Math.max(config.maxZ, config.maxSize);
        if (Math.abs(tempVec2.z) + radius > maxBoundary) {
          tempVec2.z = Math.sign(tempVec2.z) * (config.maxZ - radius);
          tempVel1.z = -tempVel1.z * config.wallBounce;
        }
        
        tempVec2.toArray(positionData, idx);
        tempVel1.toArray(velocityData, idx);
      }
    }
  }

  // Custom material with subsurface scattering
  class SubsurfaceMaterial extends MeshPhysicalMaterial {
    constructor(params) {
      super(params);
      
      this.uniforms = {
        thicknessDistortion: { value: 0.1 },
        thicknessAmbient: { value: 0 },
        thicknessAttenuation: { value: 0.1 },
        thicknessPower: { value: 2 },
        thicknessScale: { value: 10 }
      };
      
      this.defines.USE_UV = "";
      
      this.onBeforeCompile = (shader) => {
        Object.assign(shader.uniforms, this.uniforms);
        
        shader.fragmentShader = `
          uniform float thicknessPower;
          uniform float thicknessScale;
          uniform float thicknessDistortion;
          uniform float thicknessAmbient;
          uniform float thicknessAttenuation;
        ` + shader.fragmentShader;
        
        shader.fragmentShader = shader.fragmentShader.replace(
          "void main() {",
          `
          void RE_Direct_Scattering(const in IncidentLight directLight, const in vec2 uv, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, inout ReflectedLight reflectedLight) {
            vec3 scatteringHalf = normalize(directLight.direction + (geometryNormal * thicknessDistortion));
            float scatteringDot = pow(saturate(dot(geometryViewDir, -scatteringHalf)), thicknessPower) * thicknessScale;
            #ifdef USE_COLOR
              vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * vColor;
            #else
              vec3 scatteringIllu = (scatteringDot + thicknessAmbient) * diffuse;
            #endif
            reflectedLight.directDiffuse += scatteringIllu * thicknessAttenuation * directLight.color;
          }
          
          void main() {
        `
        );
        
        const lightsFragment = ShaderChunk.lights_fragment_begin.replaceAll(
          "RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );",
          `
            RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
            RE_Direct_Scattering(directLight, vUv, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, reflectedLight);
          `
        );
        
        shader.fragmentShader = shader.fragmentShader.replace("#include <lights_fragment_begin>", lightsFragment);
      };
    }
  }

  // Default configuration
  const defaultConfig = {
    count: 200,
    colors: [0x4285f4, 0x34a853, 0xfbbc04, 0xea4335],
    ambientColor: 0xffffff,
    ambientIntensity: 1,
    lightIntensity: 200,
    materialParams: {
      metalness: 0.5,
      roughness: 0.5,
      clearcoat: 1,
      clearcoatRoughness: 0.15
    },
    minSize: 0.5,
    maxSize: 1,
    size0: 1,
    gravity: 0.5,
    friction: 0.9975,
    wallBounce: 0.95,
    maxVelocity: 0.15,
    maxX: 5,
    maxY: 5,
    maxZ: 2,
    controlSphere0: false,
    followCursor: true
  };

  // Color gradient helper
  function createColorGradient(colors) {
    const colorObjects = colors.map(c => new Color(c));
    
    return {
      getColorAt: function(ratio, out = new Color()) {
        const scaled = Math.max(0, Math.min(1, ratio)) * (colors.length - 1);
        const idx = Math.floor(scaled);
        const start = colorObjects[idx];
        
        if (idx >= colors.length - 1) return start.clone();
        
        const alpha = scaled - idx;
        const end = colorObjects[idx + 1];
        
        out.r = start.r + alpha * (end.r - start.r);
        out.g = start.g + alpha * (end.g - start.g);
        out.b = start.b + alpha * (end.b - start.b);
        
        return out;
      }
    };
  }

  // Ballpit mesh
  const tempObj = new Object3D();

  class BallpitMesh extends InstancedMesh {
    constructor(renderer, userConfig = {}) {
      const config = { ...defaultConfig, ...userConfig };
      
      // Setup environment
      let envTexture = null;
      if (RoomEnvironment) {
        const pmremGenerator = new PMREMGenerator(renderer, 0.04);
        const roomEnvironment = new RoomEnvironment();
        envTexture = pmremGenerator.fromScene(roomEnvironment).texture;
      }
      
      // Create geometry and material
      const geometry = new SphereGeometry();
      const materialParams = envTexture 
        ? { envMap: envTexture, ...config.materialParams }
        : config.materialParams;
      const material = new SubsurfaceMaterial(materialParams);
      if (envTexture) {
        material.envMapRotation.x = -Math.PI / 2;
      }
      
      super(geometry, material, config.count);
      
      this.config = config;
      this.physics = new Physics(config);
      
      this.setupLights();
      this.setColors(config.colors);
    }
    
    setupLights() {
      this.ambientLight = new AmbientLight(
        this.config.ambientColor,
        this.config.ambientIntensity
      );
      this.add(this.ambientLight);
      
      this.light = new PointLight(
        this.config.colors[0], 
        this.config.lightIntensity
      );
      this.add(this.light);
    }
    
    setColors(colors) {
      if (Array.isArray(colors) && colors.length > 1) {
        const gradient = createColorGradient(colors);
        
        for (let i = 0; i < this.count; i++) {
          this.setColorAt(i, gradient.getColorAt(i / this.count));
          
          if (i === 0) {
            this.light.color.copy(gradient.getColorAt(i / this.count));
          }
        }
        
        this.instanceColor.needsUpdate = true;
      }
    }
    
    update(time) {
      this.physics.update(time);
      
      for (let i = 0; i < this.count; i++) {
        tempObj.position.fromArray(this.physics.positionData, 3 * i);
        
        if (i === 0 && this.config.followCursor === false) {
          tempObj.scale.setScalar(0);
        } else {
          tempObj.scale.setScalar(this.physics.sizeData[i]);
        }
        
        tempObj.updateMatrix();
        this.setMatrixAt(i, tempObj.matrix);
        
        if (i === 0) this.light.position.copy(tempObj.position);
      }
      
      this.instanceMatrix.needsUpdate = true;
    }
  }

  // Main ballpit creation function
  window.createBallpit = function(canvas, userConfig = {}) {
    const three = new ThreeWrapper({
      canvas: canvas,
      size: "parent",
      rendererOptions: { antialias: true, alpha: true }
    });
    
    let spheres;
    
    three.renderer.toneMapping = ACESFilmicToneMapping;
    three.camera.position.set(0, 0, 20);
    three.camera.lookAt(0, 0, 0);
    three.cameraMaxAspect = 1.5;
    three.resize();
    
    initialize(userConfig);
    
    const raycaster = new Raycaster();
    const plane = new Plane(new Vector3(0, 0, 1), 0);
    const intersection = new Vector3();
    let isPaused = false;
    
    const mouse = createMouseTracker({
      domElement: canvas,
      onMove() {
        raycaster.setFromCamera(mouse.nPosition, three.camera);
        three.camera.getWorldDirection(plane.normal);
        raycaster.ray.intersectPlane(plane, intersection);
        spheres.physics.center.copy(intersection);
        spheres.config.controlSphere0 = true;
      },
      onLeave() {
        spheres.config.controlSphere0 = false;
      }
    });
    
    function initialize(config) {
      if (spheres) {
        three.scene.remove(spheres);
      }
      
      spheres = new BallpitMesh(three.renderer, config);
      three.scene.add(spheres);
    }
    
    three.onBeforeRender = (time) => {
      if (!isPaused) spheres.update(time);
    };
    
    three.onAfterResize = (size) => {
      spheres.config.maxX = size.wWidth / 2;
      spheres.config.maxY = size.wHeight / 2;
    };
    
    return {
      three: three,
      get spheres() { return spheres; },
      setCount(count) {
        initialize({ ...spheres.config, count: count });
      },
      togglePause() {
        isPaused = !isPaused;
      },
      dispose() {
        mouse.dispose();
        three.dispose();
      }
    };
  };

  // Initialize the ballpit
  document.addEventListener('DOMContentLoaded', () => {
    const canvas = document.getElementById('hero-canvas');
    console.log('Ballpit init: Canvas found?', !!canvas);
    console.log('Ballpit init: THREE.js loaded?', typeof THREE !== 'undefined');
    
    if (canvas && typeof THREE !== 'undefined') {
      try {
        const ballpit = window.createBallpit(canvas, {
          count: 150,
          colors: [0x2563eb, 0x10b981, 0x8b5cf6, 0xf59e0b],
          gravity: 0.3,
          maxVelocity: 0.2,
          followCursor: true
        });
        
        // Store reference for potential cleanup
        window.ballpitInstance = ballpit;
        
        console.log('Ballpit animation initialized successfully');
      } catch (error) {
        console.error('Failed to initialize ballpit:', error);
        console.error('Error stack:', error.stack);
        
        // Fallback to gradient
        const ctx = canvas.getContext('2d');
        const resize = () => {
          canvas.width = canvas.clientWidth;
          canvas.height = canvas.clientHeight;
          const grd = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
          grd.addColorStop(0, '#2563eb33');
          grd.addColorStop(1, '#10b98133');
          ctx.fillStyle = grd;
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        };
        window.addEventListener('resize', resize);
        resize();
      }
    } else {
      console.error('Ballpit init failed: Canvas or THREE.js not available');
    }
  });
})();