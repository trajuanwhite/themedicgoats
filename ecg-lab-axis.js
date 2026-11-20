/* Medic Goats — interactive adult frontal-plane QRS axis teaching diagram. */
(function(){
"use strict";
const svg=document.getElementById("qrs-axis-svg");
const angleInput=document.getElementById("qrs-axis-angle");
if(!svg||!angleInput)return;
const ns="http://www.w3.org/2000/svg";
const make=(tag,attrs,parent)=>{
 const node=document.createElementNS(ns,tag);
 Object.entries(attrs).forEach(([key,value])=>node.setAttribute(key,String(value)));
 parent.appendChild(node);return node;
};
const group=document.getElementById("qrs-axis-leads");
const leads=[["I",0],["II",60],["III",120],["aVR",-150],["aVL",-30],["aVF",90]];
const cx=205,cy=143;
function point(deg,r){
 const rad=deg*Math.PI/180;
 return [cx+r*Math.cos(rad),cy+r*Math.sin(rad)];
}
// The hexaxial plane is split into the four conventional adult axis regions.
// Colored arcs follow the same orientation as the lead axes and degree labels.
const regions=[
 {key:"normal",from:-30,to:90,color:"#398574"},
 {key:"right",from:90,to:180,color:"#ba7049"},
 {key:"extreme",from:-180,to:-90,color:"#7968a5"},
 {key:"left",from:-90,to:-30,color:"#b48a32"}
];
const regionArcs=new Map();
regions.forEach(region=>{
 const [x1,y1]=point(region.from,104);
 const [x2,y2]=point(region.to,104);
 const span=region.to-region.from;
 const d="M "+x1.toFixed(2)+" "+y1.toFixed(2)+" A 104 104 0 "+(span>180?1:0)+" 1 "+x2.toFixed(2)+" "+y2.toFixed(2);
 const band=make("path",{d,fill:"none",stroke:region.color,"stroke-width":9,opacity:.53,"stroke-linecap":"butt"},group);
 regionArcs.set(region.key,band);
});
for(const [name,deg] of leads){
 const [x1,y1]=point(deg,12),[x2,y2]=point(deg,70);
 make("line",{x1:x1.toFixed(1),y1:y1.toFixed(1),x2:x2.toFixed(1),y2:y2.toFixed(1),stroke:"#c1aa91","stroke-width":1.5},group);
 const [tx,ty]=point(deg,126);
 const label=make("text",{x:tx.toFixed(1),y:(ty+5).toFixed(1),"text-anchor":"middle","font-size":12,"font-weight":750,fill:"#604b3a"},group);
 label.textContent=name;
}
// Mark every 30 degrees along the circumference of the hexaxial diagram.
// Positive angles point clockwise/downward, negative angles counterclockwise/upward.
for(let deg=-150;deg<=180;deg+=30){
 const [tickX1,tickY1]=point(deg,105),[tickX2,tickY2]=point(deg,111);
 make("line",{x1:tickX1.toFixed(1),y1:tickY1.toFixed(1),x2:tickX2.toFixed(1),y2:tickY2.toFixed(1),stroke:"#8f765f","stroke-width":1.5},group);
 const [tx,ty]=point(deg,92);
 const label=make("text",{
  x:tx.toFixed(1),y:(ty+3.5).toFixed(1),
  "text-anchor":"middle","font-size":11,"font-weight":750,
  fill:"#684b36",stroke:"#fbf5eb","stroke-width":2.4,
  "paint-order":"stroke"
 },group);
 label.textContent=deg===180?"±180°":(deg>0?"+":"")+deg+"°";
}
const vector=document.getElementById("qrs-axis-vector");
const arrow=document.getElementById("qrs-axis-arrow");
const output=document.getElementById("qrs-axis-value");
const result=document.getElementById("qrs-axis-result");
const polarities=document.getElementById("qrs-axis-polarities");
const exampleSelect=document.getElementById("qrs-axis-example");
const exampleDescription=document.getElementById("qrs-axis-example-description");
const examples={
 sinus:{angle:60,description:"Normal sinus rhythm example: +60° is a common adult mean QRS axis. Sinus rhythm itself does not require a particular QRS axis."},
 lafb:{angle:-60,description:"Left anterior fascicular block can shift the QRS axis superiorly and leftward (often about −45° to −90°). Diagnose with QRS morphology and the rest of the ECG—not the axis alone."},
 lpfb:{angle:120,description:"Left posterior fascicular block can produce right axis deviation (example +120°). It is uncommon; first exclude right ventricular hypertrophy and other causes of rightward axis."},
 rvh:{angle:110,description:"Right ventricular hypertrophy or chronic right-heart strain may shift the electrical forces to the right (example +110°). Axis alone does not establish RVH."},
 bifascicular:{angle:-60,description:"Right bundle branch block with left anterior fascicular block may produce marked left axis deviation (example −60°). The QRS shape and width are also needed to identify this pattern."},
 vt:{angle:-135,description:"A ventricular tachycardia may have an extreme or 'northwest' axis (example −135°) when activation starts outside the normal conduction pathway. Many VT rhythms have other axes; this is not required for VT."},
 custom:{angle:null,description:"Move the slider or use the axis presets to explore how mean QRS direction changes projected polarity. Axis is not enough to diagnose a rhythm or condition."}
};
if(!exampleSelect||!exampleDescription)return;
function categoryKey(angle){
 if(angle>=-30&&angle<=90)return "normal";
 if(angle>-90&&angle< -30)return "left";
 if(angle>90&&angle<=180)return "right";
 return "extreme";
}
const categoryLabels={
 normal:"Normal adult QRS axis",
 left:"Left axis deviation (LAD)",
 right:"Right axis deviation (RAD)",
 extreme:"Extreme axis deviation"
};
function polarity(angle,leadAngle){
 const projection=Math.cos((angle-leadAngle)*Math.PI/180);
 return Math.abs(projection)<0.035?"Nearly isoelectric":projection>0?"Positive (+)":"Negative (−)";
}
function draw(){
 const angle=Number(angleInput.value);
 const [x,y]=point(angle,77);
 vector.setAttribute("x2",x.toFixed(1));vector.setAttribute("y2",y.toFixed(1));
 const rad=angle*Math.PI/180,ux=Math.cos(rad),uy=Math.sin(rad);
 const bx=x-12*ux,by=y-12*uy;
 arrow.setAttribute("d",`M ${(bx-7*uy).toFixed(1)} ${(by+7*ux).toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)} L ${(bx+7*uy).toFixed(1)} ${(by-7*ux).toFixed(1)}`);
 output.textContent=(angle>0?"+":"")+angle+"°";
 const activeRegion=categoryKey(angle);
 result.textContent=categoryLabels[activeRegion];
 regionArcs.forEach((band,key)=>{
  band.setAttribute("opacity",key===activeRegion?"1":".42");
  band.setAttribute("stroke-width",key===activeRegion?"12":"9");
 });
 document.querySelectorAll("#qrs-axis-ranges .axis-range-item").forEach(item=>{
  item.classList.toggle("active",item.dataset.range===activeRegion);
 });
 polarities.replaceChildren();
 for(const [name,leadAngle] of [["I",0],["aVF",90],["II",60]]){
  const item=document.createElement("div");item.className="axis-polarity";
  const lead=document.createElement("strong");lead.textContent="Lead "+name;
  const sign=document.createElement("small");sign.textContent=polarity(angle,leadAngle);
  item.append(lead,sign);polarities.appendChild(item);
 }
}
function chooseExample(key){
 const example=examples[key]||examples.custom;
 if(example.angle!==null)angleInput.value=String(example.angle);
 exampleDescription.textContent=example.description;
 draw();
}
exampleSelect.addEventListener("change",()=>chooseExample(exampleSelect.value));
angleInput.addEventListener("input",()=>{
 exampleSelect.value="custom";
 exampleDescription.textContent=examples.custom.description;
 draw();
});
document.querySelectorAll(".axis-presets button[data-axis]").forEach(button=>{
 button.addEventListener("click",()=>{
  exampleSelect.value="custom";
  exampleDescription.textContent=examples.custom.description;
  angleInput.value=button.dataset.axis;
  draw();
 });
});
chooseExample(exampleSelect.value);
})();