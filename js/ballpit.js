// Ballpit stub – replace the TODO section with full physics code when ready
(function(){
  if(!window.THREE){console.warn('Three.js not loaded, ballpit disabled');return;}
  console.log('Ballpit stub loaded – TODO: paste full createBallpit code here.');
  const canvas=document.getElementById('hero-canvas');
  if(!canvas)return;
  // temporary fallback: draw simple gradient
  const ctx=canvas.getContext('2d');
  const resize=()=>{canvas.width=canvas.clientWidth;canvas.height=canvas.clientHeight;draw();};
  const draw=()=>{
    const grd=ctx.createLinearGradient(0,0,canvas.width,canvas.height);
    grd.addColorStop(0,'#2563eb33');
    grd.addColorStop(1,'#10b98133');
    ctx.fillStyle=grd;ctx.fillRect(0,0,canvas.width,canvas.height);
  };
  window.addEventListener('resize',resize);
  resize();
})(); 