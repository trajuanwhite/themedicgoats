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
for(const [name,deg] of leads){
 const [x1,y1]=point(deg,12),[x2,y2]=point(deg,99);
 make("line",{x1:x1.toFixed(1),y1:y1.toFixed(1),x2:x2.toFixed(1),y2:y2.toFixed(1),stroke:"#c1aa91","stroke-width":1.5},group);
 const [tx,ty]=point(deg,126);
 const label=make("text",{x:tx.toFixed(1),y:(ty+5).toFixed(1),"text-anchor":"middle","font-size":12,"font-weight":750,fill:"#604b3a"},group);
 label.textContent=name;
}
const vector=document.getElementById("qrs-axis-vector");
const arrow=document.getElementById("qrs-axis-arrow");
const output=document.getElementById("qrs-axis-value");
const result=document.getElementById("qrs-axis-result");
const polarities=document.getElementById("qrs-axis-polarities");
function category(angle){
 if(angle>=-30&&angle<=90)return "Normal adult QRS axis";
 if(angle>-90&&angle< -30)return "Left axis deviation (LAD)";
 if(angle>90&&angle<=180)return "Right axis deviation (RAD)";
 return "Extreme axis deviation";
}
function polarity(angle,leadAngle){
 const projection=Math.cos((angle-leadAngle)*Math.PI/180);
 return Math.abs(projection)<0.035?"Nearly isoelectric":projection>0?"Positive (+)":"Negative (−)";
}
function draw(){
 const angle=Number(angleInput.value);
 const [x,y]=point(angle,91);
 vector.setAttribute("x2",x.toFixed(1));vector.setAttribute("y2",y.toFixed(1));
 const rad=angle*Math.PI/180,ux=Math.cos(rad),uy=Math.sin(rad);
 const bx=x-12*ux,by=y-12*uy;
 arrow.setAttribute("d",`M ${(bx-7*uy).toFixed(1)} ${(by+7*ux).toFixed(1)} L ${x.toFixed(1)} ${y.toFixed(1)} L ${(bx+7*uy).toFixed(1)} ${(by-7*ux).toFixed(1)}`);
 output.textContent=(angle>0?"+":"")+angle+"°";
 result.textContent=category(angle);
 polarities.replaceChildren();
 for(const [name,leadAngle] of [["I",0],["aVF",90],["II",60]]){
  const item=document.createElement("div");item.className="axis-polarity";
  const lead=document.createElement("strong");lead.textContent="Lead "+name;
  const sign=document.createElement("small");sign.textContent=polarity(angle,leadAngle);
  item.append(lead,sign);polarities.appendChild(item);
 }
}
angleInput.addEventListener("input",draw);
document.querySelectorAll(".axis-presets button[data-axis]").forEach(button=>{
 button.addEventListener("click",()=>{angleInput.value=button.dataset.axis;draw()});
});
draw();
})();