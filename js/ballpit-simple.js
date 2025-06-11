// Simplified Ballpit Animation - No dependencies on Three.js addons
(function() {
  // Wait for DOM and Three.js
  function initBallpit() {
    const canvas = document.getElementById('hero-canvas');
    console.log('[Ballpit] Canvas found:', !!canvas);
    console.log('[Ballpit] THREE.js loaded:', typeof THREE !== 'undefined');
    
    if (!canvas || typeof THREE === 'undefined') {
      console.error('[Ballpit] Missing requirements. Canvas:', !!canvas, 'THREE:', typeof THREE !== 'undefined');
      if (canvas) showFallback(canvas);
      return;
    }

    try {
      // Basic Three.js setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(75, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true, 
        alpha: true 
      });
      
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      
      // Simple spheres
      const sphereCount = 100;
      const spheres = [];
      const velocities = [];
      const geometry = new THREE.SphereGeometry(0.3, 16, 16);
      
      // Colors
      const colors = [0x2563eb, 0x10b981, 0x8b5cf6, 0xf59e0b];
      
      for (let i = 0; i < sphereCount; i++) {
        const material = new THREE.MeshPhongMaterial({ 
          color: colors[Math.floor(Math.random() * colors.length)],
          shininess: 100
        });
        const sphere = new THREE.Mesh(geometry, material);
        
        // Random positions
        sphere.position.x = (Math.random() - 0.5) * 20;
        sphere.position.y = (Math.random() - 0.5) * 10;
        sphere.position.z = (Math.random() - 0.5) * 5;
        
        // Random velocities
        velocities.push({
          x: (Math.random() - 0.5) * 0.02,
          y: (Math.random() - 0.5) * 0.02,
          z: (Math.random() - 0.5) * 0.01
        });
        
        spheres.push(sphere);
        scene.add(sphere);
      }
      
      // Lighting
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
      scene.add(ambientLight);
      
      const pointLight = new THREE.PointLight(0xffffff, 0.8);
      pointLight.position.set(10, 10, 10);
      scene.add(pointLight);
      
      camera.position.z = 15;
      
      // Mouse interaction
      const mouse = new THREE.Vector2();
      let mouseInCanvas = false;
      
      canvas.addEventListener('mousemove', (event) => {
        const rect = canvas.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;
        mouseInCanvas = true;
      });
      
      canvas.addEventListener('mouseleave', () => {
        mouseInCanvas = false;
      });
      
      // Animation
      function animate() {
        requestAnimationFrame(animate);
        
        // Update spheres
        spheres.forEach((sphere, i) => {
          const vel = velocities[i];
          
          // Gravity
          vel.y -= 0.0005;
          
          // Apply velocity
          sphere.position.x += vel.x;
          sphere.position.y += vel.y;
          sphere.position.z += vel.z;
          
          // Boundaries
          if (Math.abs(sphere.position.x) > 10) {
            vel.x *= -0.8;
            sphere.position.x = Math.sign(sphere.position.x) * 10;
          }
          if (sphere.position.y < -5) {
            vel.y *= -0.8;
            sphere.position.y = -5;
          }
          if (Math.abs(sphere.position.z) > 3) {
            vel.z *= -0.8;
            sphere.position.z = Math.sign(sphere.position.z) * 3;
          }
          
          // Mouse attraction
          if (mouseInCanvas) {
            const mousePos3D = new THREE.Vector3(mouse.x * 10, mouse.y * 5, 0);
            const dir = mousePos3D.sub(sphere.position).normalize();
            vel.x += dir.x * 0.001;
            vel.y += dir.y * 0.001;
          }
          
          // Damping
          vel.x *= 0.99;
          vel.y *= 0.99;
          vel.z *= 0.99;
          
          // Rotation
          sphere.rotation.x += 0.01;
          sphere.rotation.y += 0.01;
        });
        
        renderer.render(scene, camera);
      }
      
      // Handle resize
      function handleResize() {
        camera.aspect = canvas.clientWidth / canvas.clientHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      }
      
      window.addEventListener('resize', handleResize);
      
      animate();
      console.log('[Ballpit] Animation started successfully');
      
    } catch (error) {
      console.error('[Ballpit] Error:', error);
      console.error('[Ballpit] Stack:', error.stack);
      showFallback(canvas);
    }
  }
  
  function showFallback(canvas) {
    console.log('[Ballpit] Showing fallback gradient');
    const ctx = canvas.getContext('2d');
    function draw() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      gradient.addColorStop(0, 'rgba(37, 99, 235, 0.2)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.2)');
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
    draw();
    window.addEventListener('resize', draw);
  }
  
  // Try multiple initialization strategies
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initBallpit);
  } else {
    initBallpit();
  }
  
  // Also try on window load as backup
  window.addEventListener('load', () => {
    if (!window.ballpitInitialized) {
      window.ballpitInitialized = true;
      initBallpit();
    }
  });
})();