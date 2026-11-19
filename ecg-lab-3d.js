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
    mesh.userData.curve=path;group.add(mesh);return mesh;
  }
  tube([[.25,.85,.05],[.27,1.35,.02],[.45,1.6,-.03],[.73,1.52,-.08]],.19,arteryMat);
  tube([[-.44,.88,.15],[-.65,1.36,.15],[-.75,1.56,.1]],.17,veinMat);
  const tractMat=()=>new THREE.MeshBasicMaterial({color:0xbca18e,transparent:true,opacity:.95});
  const tracts=[
    tube([[-.52,.71,.67],[-.40,.35,.83],[-.22,.11,.92]],.018,tractMat()),
    tube([[-.22,.11,.92],[-.03,-.26,.85]],.018,tractMat()),
    tube([[-.03,-.26,.85],[.34,-.77,.62]],.015,tractMat()),
    tube([[-.03,-.26,.85],[-.46,-.78,.56]],.015,tractMat())
  ];
  // A moving impulse follows the SAME continuous centerlines as the visible tracts.
  // Both bundle branches receive an independent marker simultaneously.
  const impulseMat=new THREE.MeshBasicMaterial({color:0xfff3a6,depthTest:false,transparent:true,opacity:1});
  const glowMat=new THREE.MeshBasicMaterial({color:0xffbb4a,depthTest:false,transparent:true,opacity:.28});
  const pulseGeometry=new THREE.SphereGeometry(.044,16,12);
  const haloGeometry=new THREE.SphereGeometry(.09,16,12);
  const moving=[];
  for(let i=0;i<2;i++){
    const marker=new THREE.Group();
    const halo=new THREE.Mesh(haloGeometry,glowMat);
    const core=new THREE.Mesh(pulseGeometry,impulseMat);
    marker.add(halo,core);marker.visible=false;group.add(marker);moving.push(marker);
  }
  // Bright trail progressively draws across each conduction branch.
  const trails=tracts.map(tr=>{
    const positions=tr.userData.curve.getPoints(100);
    const geo=new THREE.BufferGeometry().setFromPoints(positions);
    const line=new THREE.Line(geo,new THREE.LineBasicMaterial({color:0xffdc75,transparent:true,opacity:.98,depthTest:false}));
    line.renderOrder=5;line.visible=false;group.add(line);return line;
  });
  function positionOn(tractIndex,t,marker){
    const point=tracts[tractIndex].userData.curve.getPointAt(Math.max(0,Math.min(1,t)));
    moving[marker].position.copy(point);moving[marker].visible=true;
  }
  function progressTrail(i,fraction){
    trails[i].visible=fraction>0;
    trails[i].geometry.setDrawRange(0,Math.max(2,Math.min(101,Math.ceil(fraction*100)+1)));
  }
  const originalHeartColor=heartMat.color.clone();
  function showConduction(phase){
    const a=window.MedicActivation?.at(phase);
    const stage=a?.stage.id||"sa",t=a?.progress||0;
    moving.forEach(m=>m.visible=false);
    let completed=0;
    if(stage==="sa"){positionOn(0,0,0);}
    else if(stage==="atria"){positionOn(0,t,0);progressTrail(0,t);completed=0;}
    else if(stage==="av"){positionOn(0,1,0);completed=1;}
    else if(stage==="his"){positionOn(1,t,0);completed=1;progressTrail(1,t);}
    else if(stage==="bundles"){
      positionOn(2,t,0);positionOn(3,t,1);completed=2;
      progressTrail(2,t);progressTrail(3,t);
    }else if(stage==="ventricles"){
      // Pedagogical wavefront spreads away from the two bundle endings.
      completed=4;
      const spread=.10+.54*t;
      moving[0].position.copy(tracts[2].userData.curve.getPoint(1)).add(new THREE.Vector3(.17*t,-.17*t,.04*t));
      moving[1].position.copy(tracts[3].userData.curve.getPoint(1)).add(new THREE.Vector3(-.17*t,-.17*t,.04*t));
      moving[0].scale.setScalar(1+spread);moving[1].scale.setScalar(1+spread);
      moving[0].visible=true;moving[1].visible=true;
    }else{completed=4;}
    for(let i=0;i<4;i++){
      const partial=stage==="atria"&&i===0||stage==="his"&&i===1||stage==="bundles"&&i>=2;
      progressTrail(i,i<completed?1:partial?t:0);
      tracts[i].material.color.setHex(i<completed?0xd7a463:0xbca18e);
    }
    if(stage!=="ventricles")moving.forEach(m=>m.scale.setScalar(1));
    // Repolarization is a recovery stage, not a second conduction pulse.
    if(stage==="recovery")heartMat.color.setRGB(.68,.32,.32);
    else heartMat.color.copy(originalHeartColor);
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
  if(status)status.textContent="Drag to rotate • follow the glowing impulse • illustrative conduction";
  let alive=true;
  function render(){
    if(!host.isConnected){alive=false;observer.disconnect();renderer.dispose();return;}
    const phase=(window.MedicLabState&&window.MedicLabState.phase)||0;
    showConduction(phase);
    renderer.render(scene,camera);if(alive)requestAnimationFrame(render);
  }
  render();
})();
