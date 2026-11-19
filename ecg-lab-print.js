/* Print-only 12-lead ECG paper rendering. Reference use; NOT diagnostic. */
(function(){
"use strict";
const root=document.getElementById("ecg-print-area");
if(!root)return;
const ns="http://www.w3.org/2000/svg", $=id=>document.getElementById(id),el=t=>document.createElementNS(ns,t);
const order=["I","aVR","V1","V4","II","aVL","V2","V5","III","aVF","V3","V6"];
function attr(node,vals){Object.entries(vals).forEach(([k,v])=>node.setAttribute(k,v));return node}
function label(svg,x,y,value){const t=attr(el("text"),{x,y,fill:"#372d2c","font-size":"12","font-family":"Arial"});t.textContent=value;svg.append(t)}
function trace(svg,record,lead,x,y,start,duration,width,speed,gain){
 const data=record.waveforms[lead],fs=record.hz,from=Math.max(0,Math.round(start*fs)),n=Math.min(data.length-from,Math.ceil(duration*fs));
 let d="";for(let i=0;i<n;i++){const px=x+i/fs*speed*4;if(px>x+width)break;const py=Math.max(y-70,Math.min(y+70,y-data[from+i]*gain*4));d+=(d?"L":"M")+px.toFixed(2)+","+py.toFixed(2)+" "}
 svg.append(attr(el("path"),{d,fill:"none",stroke:"#241e1d","stroke-width":"1.5","stroke-linecap":"round"}));
}
function render(record){
 root.replaceChildren();const speed=Number($("paper-speed").value),gain=Number($("paper-gain").value);
 const svg=attr(el("svg"),{viewBox:"0 0 1000 590",width:"250mm",height:"147.5mm",role:"img","aria-label":"Physically scaled ECG reference printout"});
 const defs=el("defs"),minor=attr(el("pattern"),{id:"mg-grid-minor",width:"4",height:"4",patternUnits:"userSpaceOnUse"});
 minor.append(attr(el("path"),{d:"M4 0 H0 V4",fill:"none",stroke:"#efd5da","stroke-width":"0.6"}));defs.append(minor);
 const major=attr(el("pattern"),{id:"mg-grid-major",width:"20",height:"20",patternUnits:"userSpaceOnUse"});
 major.append(attr(el("rect"),{width:"20",height:"20",fill:"url(#mg-grid-minor)"}));major.append(attr(el("path"),{d:"M20 0 H0 V20",fill:"none",stroke:"#dcaeb9","stroke-width":"0.9"}));defs.append(major);svg.append(defs);
 svg.append(attr(el("rect"),{x:"0",y:"0",width:"1000",height:"590",fill:"#fffafa"}));
 svg.append(attr(el("rect"),{x:"0",y:"28",width:"1000",height:"535",fill:"url(#mg-grid-major)"}));
 label(svg,10,17,record.synthetic?"THE MEDIC GOATS · SYNTHETIC ECG DEMONSTRATION":"THE MEDIC GOATS · ECG REFERENCE VIEWER");
 label(svg,740,17,speed+" mm/s   "+gain+" mm/mV   "+record.hz+" Hz");
 const start=Number($("reference-position").value),segmentDuration=62.5/speed;
 for(let row=0;row<3;row++)for(let col=0;col<4;col++){
  const lead=order[row*4+col],x=250*col,y=104+116*row;
  label(svg,x+8,y-62,lead);
  trace(svg,record,lead,x,y,start+col*segmentDuration,segmentDuration,250,speed,gain);
 }
 const rhythm=$("reference-rhythm-lead").value;
 label(svg,8,426,"Full rhythm strip · "+rhythm);
 trace(svg,record,rhythm,0,493,start,250/speed,1000,speed,gain);
 const w=.2*speed*4,h=gain*4;
 svg.append(attr(el("path"),{d:"M 12 548 V "+(548-h)+" H "+(12+w)+" V 548 H "+(22+w),fill:"none",stroke:"#241e1d","stroke-width":"1.5"}));
 label(svg,12+w+25,544,"1 mV · "+speed+" mm/s");
 label(svg,10,576,record.source.dataset+" / "+record.source.recordId+" · "+start.toFixed(2)+" s · "+(record.synthetic?"SYNTHETIC; NOT PATIENT DATA":"REFERENCE ONLY")+" · Not diagnostic");
 root.append(svg);
 $("paper-summary").textContent=speed+" mm/s · "+gain+" mm/mV · "+segmentDuration.toFixed(2)+" sec/column · "+(250/speed).toFixed(1)+" sec rhythm strip";
}
window.MedicECGPrint={render};
for(const id of ["paper-speed","paper-gain"])$(id).addEventListener("change",()=>{const r=window.MedicECGReference?.getRecording();if(r)render(r)});
$("paper-print").addEventListener("click",()=>{const r=window.MedicECGReference?.getRecording();if(!r)return;render(r);window.print()});
})();
