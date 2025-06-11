// Elegant Ballpit Animation
(function() {
  function initElegantBallpit() {
    const canvas = document.getElementById('hero-canvas');
    
    if (!canvas || typeof THREE === 'undefined') {
      console.error('[Ballpit] Missing requirements');
      if (canvas) showFallback(canvas);
      return;
    }

    try {
      // Setup
      const scene = new THREE.Scene();
      const camera = new THREE.PerspectiveCamera(50, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);
      const renderer = new THREE.WebGLRenderer({ 
        canvas: canvas, 
        antialias: true, 
        alpha: true 
      });
      
      renderer.setSize(canvas.clientWidth, canvas.clientHeight);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      
      // Create elegant spheres with better distribution
      const sphereCount = 40; // Fewer, larger spheres for elegance
      const spheres = [];
      const velocities = [];
      const baseGeometry = new THREE.SphereGeometry(1, 32, 32);
      
      // Professional color palette
      const colors = [
        { color: 0x2563eb, emissive: 0x1e40af }, // Blue
        { color: 0x7c3aed, emissive: 0x6d28d9 }, // Purple
        { color: 0x06b6d4, emissive: 0x0891b2 }, // Cyan
        { color: 0x10b981, emissive: 0x059669 }, // Emerald
      ];
      
      // Create spheres with varied sizes
      for (let i = 0; i < sphereCount; i++) {
        const scale = 0.3 + Math.random() * 0.4; // Varied sizes
        const colorData = colors[i % colors.length];
        
        const material = new THREE.MeshPhysicalMaterial({ 
          color: colorData.color,
          emissive: colorData.emissive,
          emissiveIntensity: 0.1,
          metalness: 0.2,
          roughness: 0.3,
          clearcoat: 1.0,
          clearcoatRoughness: 0.0,
          reflectivity: 0.9,
          transparent: true,
          opacity: 0.9,
          envMapIntensity: 1
        });
        
        const sphere = new THREE.Mesh(baseGeometry, material);
        sphere.scale.setScalar(scale);
        sphere.castShadow = true;
        sphere.receiveShadow = true;
        
        // Better initial distribution
        const angle = (i / sphereCount) * Math.PI * 2;
        const radius = 5 + Math.random() * 3;
        sphere.position.x = Math.cos(angle) * radius;
        sphere.position.y = (Math.random() - 0.5) * 4;
        sphere.position.z = Math.sin(angle) * radius * 0.3;
        
        // Gentle initial velocities
        velocities.push({
          x: (Math.random() - 0.5) * 0.01,
          y: (Math.random() - 0.5) * 0.01,
          z: (Math.random() - 0.5) * 0.005
        });
        
        spheres.push(sphere);
        scene.add(sphere);
      }
      
      // Professional lighting setup
      const ambientLight = new THREE.AmbientLight(0xffffff, 0.4);
      scene.add(ambientLight);
      
      // Key light
      const keyLight = new THREE.DirectionalLight(0xffffff, 0.6);
      keyLight.position.set(5, 10, 5);
      keyLight.castShadow = true;
      keyLight.shadow.camera.near = 0.1;
      keyLight.shadow.camera.far = 50;
      keyLight.shadow.camera.left = -15;
      keyLight.shadow.camera.right = 15;
      keyLight.shadow.camera.top = 15;
      keyLight.shadow.camera.bottom = -15;
      keyLight.shadow.mapSize.width = 2048;
      keyLight.shadow.mapSize.height = 2048;
      scene.add(keyLight);
      
      // Fill light
      const fillLight = new THREE.DirectionalLight(0x4a90e2, 0.3);
      fillLight.position.set(-5, 5, -5);
      scene.add(fillLight);
      
      // Rim light
      const rimLight = new THREE.DirectionalLight(0xffffff, 0.2);
      rimLight.position.set(0, -10, -10);
      scene.add(rimLight);
      
      camera.position.z = 20;
      camera.position.y = 2;
      
      // Mouse interaction
      const mouse = new THREE.Vector2();
      const raycaster = new THREE.Raycaster();
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
      
      // Smooth camera movement
      let cameraTarget = new THREE.Vector3(0, 2, 20);
      
      // Animation
      const clock = new THREE.Clock();
      
      function animate() {
        requestAnimationFrame(animate);
        const deltaTime = clock.getDelta();
        const elapsedTime = clock.getElapsedTime();
        
        // Smooth camera follow mouse
        if (mouseInCanvas) {
          cameraTarget.x = mouse.x * 2;
          cameraTarget.y = 2 + mouse.y * 1;
        } else {
          cameraTarget.x = 0;
          cameraTarget.y = 2;
        }
        
        camera.position.lerp(cameraTarget, 0.05);
        camera.lookAt(0, 0, 0);
        
        // Update spheres with elegant physics
        spheres.forEach((sphere, i) => {
          const vel = velocities[i];
          
          // Gentle floating motion
          vel.y += Math.sin(elapsedTime * 0.5 + i) * 0.0001;
          
          // Very subtle gravity
          vel.y -= 0.00005;
          
          // Apply velocity with damping
          sphere.position.x += vel.x;
          sphere.position.y += vel.y;
          sphere.position.z += vel.z;
          
          // Soft boundaries
          const boundaryForce = 0.0002;
          if (Math.abs(sphere.position.x) > 8) {
            vel.x -= Math.sign(sphere.position.x) * boundaryForce;
          }
          if (sphere.position.y < -3 || sphere.position.y > 5) {
            vel.y -= Math.sign(sphere.position.y - 1) * boundaryForce;
          }
          if (Math.abs(sphere.position.z) > 3) {
            vel.z -= Math.sign(sphere.position.z) * boundaryForce;
          }
          
          // Mouse attraction with raycaster
          if (mouseInCanvas) {
            raycaster.setFromCamera(mouse, camera);
            const intersects = raycaster.intersectObject(sphere);
            
            if (intersects.length > 0) {
              // Repel from mouse when close
              const dir = sphere.position.clone().sub(intersects[0].point).normalize();
              vel.x += dir.x * 0.002;
              vel.y += dir.y * 0.002;
              vel.z += dir.z * 0.002;
              
              // Glow effect on hover
              sphere.material.emissiveIntensity = 0.3;
            } else {
              sphere.material.emissiveIntensity = 0.1;
            }
          }
          
          // Strong damping for smooth motion
          vel.x *= 0.98;
          vel.y *= 0.98;
          vel.z *= 0.98;
          
          // Gentle rotation
          sphere.rotation.x += 0.002;
          sphere.rotation.y += 0.003;
          
          // Subtle breathing effect
          const breathe = 1 + Math.sin(elapsedTime + i) * 0.02;
          sphere.scale.setScalar(sphere.scale.x * breathe);
        });
        
        // Sphere-sphere collision with soft response
        for (let i = 0; i < spheres.length; i++) {
          for (let j = i + 1; j < spheres.length; j++) {
            const sphere1 = spheres[i];
            const sphere2 = spheres[j];
            const vel1 = velocities[i];
            const vel2 = velocities[j];
            
            const distance = sphere1.position.distanceTo(sphere2.position);
            const minDistance = (sphere1.scale.x + sphere2.scale.x) * 1.2;
            
            if (distance < minDistance) {
              const normal = sphere2.position.clone().sub(sphere1.position).normalize();
              const overlap = minDistance - distance;
              const force = normal.multiplyScalar(overlap * 0.01);
              
              vel1.x -= force.x;
              vel1.y -= force.y;
              vel1.z -= force.z;
              vel2.x += force.x;
              vel2.y += force.y;
              vel2.z += force.z;
            }
          }
        }
        
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
      console.log('[Ballpit] Elegant animation started successfully');
      
    } catch (error) {
      console.error('[Ballpit] Error:', error);
      showFallback(canvas);
    }
  }
  
  function showFallback(canvas) {
    const ctx = canvas.getContext('2d');
    function draw() {
      canvas.width = canvas.clientWidth;
      canvas.height = canvas.clientHeight;
      
      // Create subtle animated gradient
      const time = Date.now() * 0.0001;
      const gradient = ctx.createRadialGradient(
        canvas.width / 2 + Math.sin(time) * 50,
        canvas.height / 2 + Math.cos(time) * 30,
        0,
        canvas.width / 2,
        canvas.height / 2,
        canvas.width * 0.7
      );
      
      gradient.addColorStop(0, 'rgba(37, 99, 235, 0.1)');
      gradient.addColorStop(0.5, 'rgba(124, 58, 237, 0.05)');
      gradient.addColorStop(1, 'rgba(16, 185, 129, 0.02)');
      
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      requestAnimationFrame(draw);
    }
    draw();
  }
  
  // Initialize when ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initElegantBallpit);
  } else {
    initElegantBallpit();
  }
})();