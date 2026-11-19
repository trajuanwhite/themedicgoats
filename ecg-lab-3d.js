/* Medic Goats ECG Lab — hand-modeled cutaway teaching heart.
   No scanned human anatomy: approximate 3D teaching illustration, not physiologic simulation.
   Existing MedicActivation timeline remains the single source of cycle phase. */
(async function(){
"use strict";
const host=document.getElementById("heart-view"), status=document.getElementById("heart-status");
if(!host)return;
const fallback=document.getElementById("heart-fallback");
let THREE;
try { THREE=await import("https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js"); }
catch(e){if(status)status.textContent="Schematic view • 3D renderer unavailable";return;}
if(!host.isConnected)return;
let renderer;
try {renderer=new THREE.WebGLRenderer({alpha:true,antialias:true,powerPreference:"low-power"});}
catch(e){if(status)status.textContent="Schematic view • 3D graphics unavailable";return;}
renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,1.8));
renderer.outputColorSpace=THREE.SRGBColorSpace;
renderer.setClearAlpha(0);
host.appendChild(renderer.domElement);
const scene=new THREE.Scene();
const camera=new THREE.PerspectiveCamera(35,1,.1,100);
camera.position.set(0,.12,7.8);
scene.add(new THREE.HemisphereLight(0xffffff,0x8d4851,2.0));
const key=new THREE.DirectionalLight(0xffe8de,2.7);key.position.set(-3,4,7);scene.add(key);
const fill=new THREE.DirectionalLight(0xcfe1ff,1.1);fill.position.set(3,0,3);scene.add(fill);
const rim=new THREE.DirectionalLight(0xffccb4,1.5);rim.position.set(2,3,-3);scene.add(rim);
const spin=new THREE.Group();scene.add(spin);
const heart=new THREE.Group();spin.add(heart);
// This is the normal slightly oblique anatomical presentation. The apex points
// inferior-left from the viewer's perspective instead of straight down.
heart.rotation.set(.09,-.20,-.30);
spin.rotation.y=-.12;
const mat=(color,roughness=.56,extras={})=>new THREE.MeshPhysicalMaterial({color,roughness,metalness:0,clearcoat:.17,side:THREE.DoubleSide,...extras});
const wall=mat(0xb75d61,.66),wallEdge=mat(0xeaa29b,.62),wallLight=mat(0xf2b1a7,.63);
const blood={ra:mat(0xbb6931,.49),la:mat(0xc88437,.50),rv:mat(0x254a95,.45),lv:mat(0x9f223d,.45)};
const vessels={aorta:mat(0xc9595e,.49),pulmonary:mat(0x667fa1,.51),vein:mat(0x6582a8,.54),coronary:mat(0xcc7667,.58)};
function vector(x,y,z){return new THREE.Vector3(x,y,z);}
function pathTube(points,r,material,div=55){
 const curve=new THREE.CatmullRomCurve3(points.map(p=>Array.isArray(p)?vector(...p):p));
 const mesh=new THREE.Mesh(new THREE.TubeGeometry(curve,div,r,9,false),material);
 mesh.userData.curve=curve;heart.add(mesh);return mesh;
}
function lineTube(points,r,material,closed=false){
 const c=new THREE.CatmullRomCurve3(points,closed);
 const mesh=new THREE.Mesh(new THREE.TubeGeometry(c,Math.max(60,points.length*2),r,8,closed),material);
 heart.add(mesh);return mesh;
}
// Asymmetric loft of the back and side myocardial shell. Its anterior wedge
// is actually open: unlike a transparent sphere it cannot cover the chambers.
const verts=[],normals=[],indices=[],ySteps=48,angleSteps=76;
function outlineAt(y){
 const taper=Math.sqrt(Math.max(.002,1-y*y));
 return {cx:.17*y-.045,rx:(1.08+.11*y)*taper,rz:(.57+.06*y)*taper};
}
for(let i=0;i<=ySteps;i++){
 const y=-.988+1.976*i/ySteps;
 const o=outlineAt(y);
 for(let j=0;j<=angleSteps;j++){
   const theta=.83+(Math.PI*2-1.66)*j/angleSteps;
   const x=o.cx+o.rx*Math.sin(theta),z=-.17+o.rz*Math.cos(theta);
   verts.push(x,y*1.23,z);
 }
}
for(let i=0;i<ySteps;i++)for(let j=0;j<angleSteps;j++){
 const a=i*(angleSteps+1)+j,b=a+angleSteps+1;
 indices.push(a,a+1,b,a+1,b+1,b);
}
const shellGeo=new THREE.BufferGeometry();
shellGeo.setAttribute("position",new THREE.Float32BufferAttribute(verts,3));
shellGeo.setIndex(indices);shellGeo.computeVertexNormals();
const shell=new THREE.Mesh(shellGeo,wall);heart.add(shell);
for(const angle of [.83,Math.PI*2-.83]){
 const pts=[];
 for(let i=2;i<ySteps-1;i++){
  const y=-.988+1.976*i/ySteps,o=outlineAt(y);
  pts.push(vector(o.cx+o.rx*Math.sin(angle),y*1.23,-.17+o.rz*Math.cos(angle)));
 }
 lineTube(pts,.065,wallEdge);
}
// Recessed cavity surfaces, framed by muscular walls. Each chamber can alter
// its internal aperture separately so contraction is visible as narrowing.
const chambers={};
function cavity(id,cx,cy,rx,ry,front,tilt,wallThickness){
 const root=new THREE.Group();root.position.set(cx,cy,front);root.rotation.z=tilt;heart.add(root);
 const contour=[],inner=[],segments=72,radial=12;
 for(let i=0;i<=radial;i++){
  const u=i/radial;
  for(let j=0;j<=segments;j++){
   const a=2*Math.PI*j/segments;
   const pear=(id==="lv"||id==="rv")?1-.18*Math.max(0,-Math.sin(a)):1;
   const x=rx*u*Math.cos(a)*pear, y=ry*u*Math.sin(a);
   const z=-.23*(1-u*u)-.014*Math.cos(a*3)*u;
   inner.push(x,y,z);
  }
 }
 const tris=[];
 for(let i=0;i<radial;i++)for(let j=0;j<segments;j++){
  const a=i*(segments+1)+j,b=a+segments+1;
  tris.push(a,b,a+1,a+1,b,b+1);
 }
 const surfaceGeo=new THREE.BufferGeometry();
 surfaceGeo.setAttribute("position",new THREE.Float32BufferAttribute(inner,3));
 surfaceGeo.setIndex(tris);surfaceGeo.computeVertexNormals();
 const opening=new THREE.Group();root.add(opening);
 const innerMesh=new THREE.Mesh(surfaceGeo,blood[id]);opening.add(innerMesh);
 const boundary=[];
 for(let j=0;j<=segments;j++){
  const a=2*Math.PI*j/segments;
  const pear=(id==="lv"||id==="rv")?1-.18*Math.max(0,-Math.sin(a)):1;
  boundary.push(vector(rx*Math.cos(a)*pear,ry*Math.sin(a),.025));
 }
 const rimMesh=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(boundary,true),100,wallThickness,10,true),wallEdge);
 root.add(rimMesh);
 // A second inner, darker lip gives the cavity its visible depth.
 const darkLip=new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(boundary.map(v=>vector(v.x*.93,v.y*.93,v.z-.058)),true),90,.027,7,true),wall);
 opening.add(darkLip);
 chambers[id]={root,opening,rimMesh,cx,cy,rx,ry};
 return root;
}
// Upper chambers are smaller and slightly posterior; LV is tall with a thick
// muscular edge, while RV wraps anteriorly across the visual left.
cavity("ra",-.52,.54,.34,.27,.39,-.16,.072);
cavity("la",.35,.60,.31,.26,.34,.14,.078);
cavity("rv",-.44,-.30,.40,.65,.53,-.15,.080);
cavity("lv",.39,-.36,.44,.74,.51,.21,.135);
// Interventricular muscular septum rather than a central divider line.
const septum=new THREE.Mesh(new THREE.CapsuleGeometry(.083,1.03,8,16),wallLight);
septum.position.set(.016,-.33,.64);septum.rotation.z=-.045;heart.add(septum);
// Atrioventricular valve planes (schematic) add anatomic landmarks.
for(const [x,y,r] of [[-.43,.19,.22],[.36,.21,.21]]){
 const ring=new THREE.Mesh(new THREE.TorusGeometry(r,.033,10,40),wallEdge);
 ring.position.set(x,y,.61);ring.scale.y=.38;ring.rotation.z=.14;heart.add(ring);
}
// Ascending aorta with arch; blue pulmonary trunk crosses its anterior side.
// Four venous stubs help the anatomy read as an organ rather than a symbol.
pathTube([[.28,.69,-.03],[.30,1.15,.05],[.52,1.44,-.07],[.77,1.43,-.19],[.85,1.16,-.30]],.155,vessels.aorta);
pathTube([[-.15,.52,.14],[-.11,.94,.27],[-.33,1.30,.32],[-.69,1.40,.23]],.145,vessels.pulmonary);
pathTube([[-.65,.71,-.17],[-.76,1.18,-.24],[-.87,1.43,-.35]],.14,vessels.vein);
pathTube([[-.69,.24,-.24],[-.89,-.07,-.26],[-.93,-.42,-.28]],.13,vessels.vein);
pathTube([[.53,.76,-.20],[.88,.87,-.28],[1.10,.95,-.30]],.080,vessels.vein);
pathTube([[.49,.60,-.26],[.80,.59,-.40],[1.03,.55,-.45]],.077,vessels.vein);
// Anterior coronary branches, small enough not to obscure cavity openings.
pathTube([[.03,.36,.62],[.12,.08,.67],[.15,-.23,.68],[.12,-.65,.59]],.022,vessels.coronary);
pathTube([[.02,.31,.60],[-.22,.16,.67],[-.66,-.06,.52]],.018,vessels.coronary);
function smooth(v){v=Math.max(0,Math.min(1,v));return v*v*(3-2*v);}
function envelope(ms,start,on,off,end){
 return smooth((ms-start)/(on-start))*(1-smooth((ms-off)/(end-off)));
}
function animateChambers(phase,enabled){
 const ms=((phase%1)+1)%1*800;
 const atr=enabled?envelope(ms,155,205,245,310):0;
 const ven=enabled?envelope(ms,345,430,515,705):0;
 for(const name of ["ra","la"]){
  const c=chambers[name];
  c.opening.scale.set(1-.17*atr,1-.12*atr,1);
  c.root.scale.set(1-.025*atr,1-.038*atr,1);
 }
 for(const name of ["rv","lv"]){
  const c=chambers[name];
  // Distinct aperture and wall change models inward cavity narrowing,
  // mild longitudinal shortening and opposed torsion.
  c.opening.scale.set(1-.22*ven,1-.17*ven,1);
  c.root.scale.set(1-.018*ven,1-.055*ven,1);
  c.root.rotation.z=(name==="rv"?-.15:.21)+(name==="rv"?-.039:.039)*ven;
  c.root.position.y=c.cy+.042*ven;
  c.rimMesh.scale.set(1+.045*ven,1+.01*ven,1+.03*ven);
 }
 shell.scale.set(1-.018*ven,1-.018*ven,1);
 septum.scale.x=1+.14*ven;
}
// Electrical paths are front-facing so they remain visible against the
// recessed cutaway. The pulse markers move continuously along spline curves.
const conductionMaterial=()=>new THREE.MeshBasicMaterial({color:0xa7a5a2,transparent:true,opacity:.77,depthTest:false});
const tracts=[
 pathTube([[-.62,.80,.72],[-.48,.54,.76],[-.21,.24,.77]],.014,conductionMaterial()),
 pathTube([[-.21,.24,.77],[-.06,-.02,.79],[-.01,-.24,.80]],.014,conductionMaterial()),
 pathTube([[-.01,-.24,.80],[.23,-.58,.79],[.38,-.97,.64]],.015,conductionMaterial()),
 pathTube([[-.01,-.24,.80],[-.26,-.53,.82],[-.45,-.95,.65]],.015,conductionMaterial())
];
const markerGeometry=new THREE.SphereGeometry(.048,16,12);
const haloGeometry=new THREE.SphereGeometry(.096,16,12);
const coreMat=new THREE.MeshBasicMaterial({color:0xffef5c,depthTest:false});
const haloMat=new THREE.MeshBasicMaterial({color:0xffe16b,transparent:true,opacity:.28,depthTest:false});
const sparks=[];
for(let i=0;i<2;i++){
 const pair=new THREE.Group();
 pair.add(new THREE.Mesh(haloGeometry,haloMat),new THREE.Mesh(markerGeometry,coreMat));
 pair.renderOrder=12;heart.add(pair);pair.visible=false;sparks.push(pair);
}
const trails=tracts.map(t=>{
 const points=t.userData.curve.getPoints(100),geometry=new THREE.BufferGeometry().setFromPoints(points);
 const line=new THREE.Line(geometry,new THREE.LineBasicMaterial({color:0xffe373,depthTest:false,transparent:true,opacity:.97}));
 line.renderOrder=12;line.visible=false;heart.add(line);return line;
});
function showTrail(i,p){
 trails[i].visible=p>0;
 trails[i].geometry.setDrawRange(0,Math.max(2,Math.min(101,Math.ceil(p*100)+1)));
}
function positionSpark(i,index,ratio){
 sparks[index].position.copy(tracts[i].userData.curve.getPointAt(Math.max(0,Math.min(1,ratio))));
 sparks[index].visible=true;
}
function showElectrical(phase,enabled){
 const timing=window.MedicActivation?.at(phase);
 const stage=timing?.stage.id||"sa",p=timing?.progress||0;
 sparks.forEach(s=>{s.visible=false;s.scale.setScalar(1);});
 let done=0;
 if(stage==="sa")positionSpark(0,0,0);
 else if(stage==="atria")positionSpark(0,0,p);
 else if(stage==="av"){done=1;positionSpark(0,0,1);}
 else if(stage==="his"){done=1;positionSpark(1,0,p);}
 else if(stage==="bundles"){done=2;positionSpark(2,0,p);positionSpark(3,1,p);}
 else if(stage==="ventricles"){
  done=4;positionSpark(2,0,1);positionSpark(3,1,1);
  for(const obj of sparks)obj.scale.setScalar(1+.75*p);
 }else done=4;
 tracts.forEach((tract,i)=>{
  const partial=(stage==="atria"&&i===0)||(stage==="his"&&i===1)||(stage==="bundles"&&i>=2);
  showTrail(i,i<done?1:partial?p:0);
  tract.visible=enabled;
  trails[i].visible=enabled&&trails[i].visible;
 });
 if(!enabled)sparks.forEach(s=>s.visible=false);
}
const mode=document.getElementById("heart-display-mode");
function resize(){
 const w=Math.max(host.clientWidth,230),h=Math.max(host.clientHeight,290);
 camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h,false);
}
const observer=new ResizeObserver(resize);observer.observe(host);resize();
let drag=false,lastX=0,lastY=0;
renderer.domElement.style.touchAction="none";
renderer.domElement.addEventListener("pointerdown",e=>{
 drag=true;lastX=e.clientX;lastY=e.clientY;
 renderer.domElement.setPointerCapture(e.pointerId);
});
renderer.domElement.addEventListener("pointermove",e=>{
 if(!drag)return;
 spin.rotation.y+=(e.clientX-lastX)*.008;
 spin.rotation.x=Math.max(-.5,Math.min(.5,spin.rotation.x+(e.clientY-lastY)*.006));
 lastX=e.clientX;lastY=e.clientY;
});
renderer.domElement.addEventListener("pointerup",()=>drag=false);
renderer.domElement.addEventListener("pointercancel",()=>drag=false);
if(fallback)fallback.hidden=true;
if(status)status.textContent="Tilted anatomical cutaway • drag to rotate • illustrative chamber motion";
function render(){
 if(!host.isConnected){observer.disconnect();renderer.dispose();return;}
 const phase=window.MedicLabState?.phase||0;
 const setting=mode?.value||"both";
 animateChambers(phase,setting!=="electrical");
 showElectrical(phase,setting!=="mechanical");
 renderer.render(scene,camera);
 requestAnimationFrame(render);
}
render();
})();