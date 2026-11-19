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
const svg=document.getElementById("electrode-map");
const NS="http://www.w3.org/2000/svg";
const el=(tag)=>document.createElementNS(NS,tag);
const markerElements=new Map();
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
 select.value=name;mark(entry.highlight);
 $("electrode-selection").textContent="Lead "+name+" • "+entry.description;
 $("electrode-formula").textContent=entry.formula;
 $("electrode-detail").textContent="Blue markers show the electrodes used in this derived lead. The RL electrode is not part of the displayed voltage equation.";
}
function selectElectrode(name){
 const p=positions.find(x=>x.id===name);if(!p)return;
 mark([name]);$("electrode-selection").textContent=name+" electrode";
 $("electrode-formula").textContent=p.family==="chest"?"Precordial exploring electrode":name==="RL"?"Reference/ground electrode":"Limb electrode";
 $("electrode-detail").textContent=p.desc;
}
select.onchange=()=>selectLead(select.value);
$("verify-leads").onclick=()=>{
 const tests=Array.from({length:101},(_,i)=>window.MedicECG.checkIdentities(i/100));
 const passed=tests.every(Boolean);
 const result=$("lead-test-result");result.textContent=passed?"PASS — Einthoven's law and augmented-lead sum held across 101 sample points.":"CHECK FAILED — Limb-lead identities did not hold.";
 result.dataset.passed=String(passed);
};
selectLead("II");
})();
