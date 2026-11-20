/* Medic Goats ECG Lab — electrode-placement educational reference.
 * Schematic coordinates are not anatomically scaled. Physical placements
 * follow standardized 12-lead guidance (AHA/ACCF/HRS 2007; GE Healthcare).
 */
(function(){
"use strict";
const mount=document.getElementById("electrode-guide");
if(!mount)return;
const positions=[
 {id:"RA",x:65,y:64,desc:"Right arm electrode. For a standard diagnostic 12-lead ECG, place on the right arm distal to the shoulder (not on the torso).",family:"limb"},
 {id:"LA",x:350,y:64,desc:"Left arm electrode. For a standard diagnostic 12-lead ECG, place on the left arm distal to the shoulder (not on the torso).",family:"limb"},
 {id:"RL",x:85,y:366,desc:"Right leg electrode. Used as a reference/ground; it does not form one of the 12 displayed leads.",family:"limb"},
 {id:"LL",x:331,y:366,desc:"Left leg electrode. Contributes to limb lead derivations.",family:"limb"},
 {id:"V1",x:184,y:179,desc:"Fourth intercostal space, right sternal border (patient's right; diagram's left).",family:"chest"},
 {id:"V2",x:225,y:179,desc:"Fourth intercostal space, left sternal border (patient's left; diagram's right).",family:"chest"},
 {id:"V3",x:249,y:210,desc:"Midway between V2 and V4.",family:"chest"},
 {id:"V4",x:279,y:241,desc:"Fifth intercostal space, left midclavicular line.",family:"chest"},
 {id:"V5",x:309,y:241,desc:"Same horizontal plane as V4, left anterior axillary line.",family:"chest"},
 {id:"V6",x:338,y:241,desc:"Same horizontal plane as V4, left midaxillary line.",family:"chest"}
];
const formulas={
 I:{description:"Lead I records left arm minus right arm.",formula:"I = LA − RA",highlight:["LA","RA"]},
 II:{description:"Lead II records left leg minus right arm.",formula:"II = LL − RA",highlight:["LL","RA"]},
 III:{description:"Lead III records left leg minus left arm.",formula:"III = LL − LA",highlight:["LL","LA"]},
 aVR:{description:"Augmented right arm lead.",formula:"aVR = RA − (LA + LL)/2",highlight:["RA","LA","LL"]},
 aVL:{description:"Augmented left arm lead.",formula:"aVL = LA − (RA + LL)/2",highlight:["LA","RA","LL"]},
 aVF:{description:"Augmented foot lead.",formula:"aVF = LL − (RA + LA)/2",highlight:["LL","RA","LA"]}
};
for(let i=1;i<=6;i++)formulas["V"+i]={
 description:"Precordial lead V"+i+" is referenced to Wilson's central terminal.",
 formula:"V"+i+" = V"+i+" electrode − (RA + LA + LL)/3",
 highlight:["V"+i,"RA","LA","LL"]
};
// Standard frontal-plane lead axes. Patient's left is diagram-right.
const limbAxes={I:0,II:60,III:120,aVR:-150,aVL:-30,aVF:90};
const svg=document.getElementById("electrode-map");
const NS="http://www.w3.org/2000/svg";
const el=(tag)=>document.createElementNS(NS,tag);
const markerElements=new Map();
// A dedicated frontal-plane viewing vector, independent of electrode placement.
const axesLayer=el("g");
axesLayer.setAttribute("id","limb-axis-overlay");
axesLayer.setAttribute("aria-label","Frontal-plane direction of selected limb lead");
axesLayer.setAttribute("pointer-events","none");
const axesRing=el("circle");
for(const [key,value] of Object.entries({cx:207,cy:302,r:49,fill:"#fff9ed","fill-opacity":".88",stroke:"#bda28c","stroke-width":1.4}))axesRing.setAttribute(key,value);
const axisGuide=el("line");
for(const [key,value] of Object.entries({x1:159,y1:302,x2:255,y2:302,stroke:"#d7c1a9","stroke-width":1.1,"stroke-dasharray":"3 4"}))axisGuide.setAttribute(key,value);
const verticalGuide=el("line");
for(const [key,value] of Object.entries({x1:207,y1:254,x2:207,y2:350,stroke:"#d7c1a9","stroke-width":1.1,"stroke-dasharray":"3 4"}))verticalGuide.setAttribute(key,value);
// Two parallel, opposing arrows distinguish positive polarity from the direction
// a lead views the heart from. The blue arrow travels from the positive electrode
// toward the heart; the orange arrow points toward increasing positive voltage.
function makeArrow(color,width){
 const shaft=el("line");
 shaft.setAttribute("stroke",color);shaft.setAttribute("stroke-width",String(width));shaft.setAttribute("stroke-linecap","round");
 const head=el("path");
 head.setAttribute("fill","none");head.setAttribute("stroke",color);
 head.setAttribute("stroke-width",String(width));head.setAttribute("stroke-linejoin","round");head.setAttribute("stroke-linecap","round");
 return {shaft,head};
}
const positiveArrow=makeArrow("#a45e30",3.8);
const viewingArrow=makeArrow("#237eae",3.8);
const origin=el("circle");origin.setAttribute("cx",207);origin.setAttribute("cy",302);origin.setAttribute("r",3);origin.setAttribute("fill","#725746");
const axisCaption=el("text");axisCaption.setAttribute("x",207);axisCaption.setAttribute("y",247);axisCaption.setAttribute("text-anchor","middle");axisCaption.setAttribute("font-size","11");axisCaption.setAttribute("font-weight","750");axisCaption.setAttribute("fill","#785039");
axesLayer.append(axesRing,axisGuide,verticalGuide,positiveArrow.shaft,positiveArrow.head,viewingArrow.shaft,viewingArrow.head,origin,axisCaption);
svg.append(axesLayer);
const legend=document.createElement("div");
legend.className="lead-direction-legend";
legend.style.cssText="display:flex;flex-wrap:wrap;gap:8px 16px;padding:8px 13px;background:#fffaf4;color:#624a37;font-size:12px;line-height:1.4";
legend.innerHTML='<span><span style="color:#a45e30;font-weight:850">↓</span> <strong style="color:#a45e30">Orange:</strong> positive electrical axis</span><span><span style="color:#237eae;font-weight:850">↑</span> <strong style="color:#237eae">Blue:</strong> view from electrode toward heart</span>';
svg.insertAdjacentElement("afterend",legend);
function drawVector(arrow,from,to,vx,vy,offset){
 const px=-vy,py=vx;
 const startX=207+from*vx+offset*px,startY=302+from*vy+offset*py;
 const endX=207+to*vx+offset*px,endY=302+to*vy+offset*py;
 arrow.shaft.setAttribute("x1",startX.toFixed(1));arrow.shaft.setAttribute("y1",startY.toFixed(1));
 arrow.shaft.setAttribute("x2",endX.toFixed(1));arrow.shaft.setAttribute("y2",endY.toFixed(1));
 const dx=endX-startX,dy=endY-startY,len=Math.hypot(dx,dy),ux=dx/len,uy=dy/len;
 const bx=endX-9*ux,by=endY-9*uy;
 arrow.head.setAttribute("d",`M ${(bx-5*uy).toFixed(1)} ${(by+5*ux).toFixed(1)} L ${endX.toFixed(1)} ${endY.toFixed(1)} L ${(bx+5*uy).toFixed(1)} ${(by-5*ux).toFixed(1)}`);
}
function showLeadAxis(lead){
 if(!(lead in limbAxes)){axesLayer.setAttribute("display","none");legend.hidden=true;return;}
 axesLayer.removeAttribute("display");legend.hidden=false;
 const degrees=limbAxes[lead],radians=degrees*Math.PI/180;
 const vx=Math.cos(radians),vy=Math.sin(radians);
 drawVector(positiveArrow,5,43,vx,vy,-9);
 drawVector(viewingArrow,43,5,vx,vy,9);
 axisCaption.textContent="Lead "+lead+" · "+(degrees>0?"+":"")+degrees+"°";
}
positions.forEach(p=>{
 const g=el("g");g.setAttribute("class","electrode-point");g.setAttribute("role","button");g.setAttribute("tabindex","0");g.setAttribute("aria-label","Select "+p.id+" electrode");
 const halo=el("circle");halo.setAttribute("cx",p.x);halo.setAttribute("cy",p.y);halo.setAttribute("r",20);halo.setAttribute("class","electrode-halo");g.append(halo);
 const c=el("circle");c.setAttribute("cx",p.x);c.setAttribute("cy",p.y);c.setAttribute("r",14);c.setAttribute("class","electrode-dot");g.append(c);
 const label=el("text");label.setAttribute("x",p.x);label.setAttribute("y",p.y+4);label.setAttribute("text-anchor","middle");label.textContent=p.id;g.append(label);
 const activate=()=>selectElectrode(p.id);
 g.addEventListener("click",activate);g.addEventListener("keydown",e=>{if(e.key==="Enter"||e.key===" "){e.preventDefault();activate()}});
 svg.append(g);markerElements.set(p.id,g);
});
const select=document.getElementById("electrode-lead");
window.MedicECG.labels.forEach(lead=>{const opt=document.createElement("option");opt.value=lead;opt.textContent="Lead "+lead;select.append(opt)});
select.value="II";
const $=id=>document.getElementById(id);
function mark(ids){markerElements.forEach((g,id)=>g.classList.toggle("selected",ids.includes(id)))}
function selectLead(name){
 const entry=formulas[name];if(!entry)return;
 select.value=name;mark(entry.highlight);showLeadAxis(name);
 $("electrode-selection").textContent="Lead "+name+" • "+entry.description;
 $("electrode-formula").textContent=entry.formula;
 $("electrode-detail").textContent="Blue electrode markers identify the electrodes used in the lead equation. "+(name in limbAxes?"Orange arrow: positive electrical axis at "+(limbAxes[name]>0?"+":"")+limbAxes[name]+"°, toward the positive electrode. Blue arrow: viewing direction from that electrode back toward the heart. Depolarization toward the positive electrode produces a positive deflection. ":"")+"RL is the reference/ground electrode.";
}
function selectElectrode(name){
 const p=positions.find(x=>x.id===name);if(!p)return;
 mark([name]);showLeadAxis(null);$("electrode-selection").textContent=name+" electrode";
 $("electrode-formula").textContent=p.family==="chest"?"Precordial exploring electrode":name==="RL"?"Reference/ground electrode":"Limb electrode";
 $("electrode-detail").textContent=p.desc;
}
select.onchange=()=>selectLead(select.value);
selectLead("II");
})();
