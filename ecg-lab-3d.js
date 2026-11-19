/* Optional Three.js anatomical teaching visualization; fall back to schematic when offline. */
(async function(){
  "use strict";
  const host=document.getElementById("heart-view");
  const status=document.getElementById("heart-status");
  if(!host)return;
  const fallback=document.getElementById("heart-fallback");
  let THREE;
  try { THREE=await import("https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js"); }
  catch(e){ if(status)status.textContent="Schematic mode — 3D renderer unavailable";return; }
  if(!host.isConnected)return;
  const scene=new THREE.Scene();
  const camera=new THREE.PerspectiveCamera(35,1,.1,100);
  camera.position.set(0,.15,7.2);
  let renderer;try{renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});}catch(e){if(status)status.textContent="Schematic mode — WebGL is unavailable";return;}
  renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));
  renderer.outputColorSpace=THREE.SRGBColorSpace;
  host.appendChild(renderer.domElement);
  scene.add(new THREE.AmbientLight(0xffffff,2.1));
  const key=new THREE.DirectionalLight(0xffffff,2.3);key.position.set(-3,4,6);scene.add(key);
  const rim=new THREE.DirectionalLight(0xe5a688,1.5);rim.position.set(3,0,-2);scene.add(rim);
  const group=new THREE.Group();scene.add(group);
  const heartMat=new THREE.MeshPhysicalMaterial({color:0x9f3b3b,roughness:.56,metalness:0,clearcoat:.15,transparent:true,opacity:.9,side:THREE.DoubleSide});
  // Educational organ silhouette, NOT a segmented anatomical heart mesh.
  const shape=new THREE.SphereGeometry(1.15,48,32);
  const p=shape.attributes.position;
  for(let i=0;i<p.count;i++){
    let x=p.getX(i),y=p.getY(i),z=p.getZ(i);
    const taper=.63+.37*(y+1.15)/2.3;
    x*=taper; z*=taper*.75;
    if(y<-.15){x-=.12*(-y);y*=1.2;}
    p.setXYZ(i,x,y,z);
  }
  shape.computeVertexNormals();
  const main=new THREE.Mesh(shape,heartMat);main.rotation.z=-.18;group.add(main);
  const arteryMat=new THREE.MeshStandardMaterial({color:0xb45b50,roughness:.6});
  const veinMat=new THREE.MeshStandardMaterial({color:0x6b7d9f,roughness:.6});
  function tube(coords,r,material){
    const path=new THREE.CatmullRomCurve3(coords.map(v=>new THREE.Vector3(...v)));
    const mesh=new THREE.Mesh(new THREE.TubeGeometry(path,36,r,9,false),material);
    group.add(mesh);return mesh;
  }
  tube([[.25,.85,.05],[.27,1.35,.02],[.45,1.6,-.03],[.73,1.52,-.08]],.19,arteryMat);
  tube([[-.44,.88,.15],[-.65,1.36,.15],[-.75,1.56,.1]],.17,veinMat);
  const tractMat=new THREE.MeshBasicMaterial({color:0xf0c59d,transparent:true,opacity:.85});
  const tracts=[
    tube([[-.52,.71,.67],[-.40,.35,.83],[-.22,.11,.92]],.018,tractMat),
    tube([[-.22,.11,.92],[-.03,-.26,.85]],.018,tractMat),
    tube([[-.03,-.26,.85],[.34,-.77,.62]],.015,tractMat),
    tube([[-.03,-.26,.85],[-.46,-.78,.56]],.015,tractMat)
  ];
  const sparks=[];
  for(const pt of [[-.52,.71,.67],[-.22,.11,.92],[-.03,-.26,.85],[.34,-.77,.62],[-.46,-.78,.56]]){
    const ball=new THREE.Mesh(new THREE.SphereGeometry(.06,18,12),new THREE.MeshBasicMaterial({color:0xffb659}));
    ball.position.set(...pt);group.add(ball);sparks.push(ball);
  }
  function resize(){
    const w=Math.max(host.clientWidth,230),h=Math.max(host.clientHeight,290);
    camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
  }
  const observer=new ResizeObserver(resize);observer.observe(host);resize();
  let drag=false,lastX=0,lastY=0;group.rotation.y=-.25;
  renderer.domElement.style.touchAction="none";
  renderer.domElement.addEventListener("pointerdown",e=>{drag=true;lastX=e.clientX;lastY=e.clientY;renderer.domElement.setPointerCapture(e.pointerId)});
  renderer.domElement.addEventListener("pointermove",e=>{if(!drag)return;group.rotation.y+=(e.clientX-lastX)*.009;group.rotation.x=Math.max(-.6,Math.min(.6,group.rotation.x+(e.clientY-lastY)*.006));lastX=e.clientX;lastY=e.clientY});
  renderer.domElement.addEventListener("pointerup",()=>drag=false);
  renderer.domElement.addEventListener("pointercancel",()=>drag=false);
  if(fallback)fallback.hidden=true;
  if(status)status.textContent="Drag to rotate • illustrative 3D geometry";
  let alive=true;
  function render(){
    if(!host.isConnected){alive=false;observer.disconnect();renderer.dispose();return;}
    const phase=(window.MedicLabState&&window.MedicLabState.phase)||0;
    const idx=phase<.27?0:phase<.35?1:phase<.37?2:phase<.46?3:4;
    sparks.forEach((obj,i)=>{obj.material.color.setHex((idx===3&&i>=3)||i===idx?0xffe37b:0x9f6244);obj.scale.setScalar((idx===3&&i>=3)||i===idx?1.6:1)});
    tracts.forEach((tr,i)=>tr.material.color.setHex(i<idx?0xffd68d:0xbca18e));
    renderer.render(scene,camera);if(alive)requestAnimationFrame(render);
  }
  render();
})();
