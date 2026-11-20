/* ECG Lab teaching tools: focused lead, calipers, and mathematically derived leads.
   All traces remain illustrative. Do not use for clinical ECG interpretation. */
(function(){
 "use strict";
 const model=window.MedicECG;
 const root=document.getElementById("lead-focus-tools");
 if(!model||!root)return;
 const $=id=>document.getElementById(id);
 const select=$("focus-lead");
 const leadNames=model.labels;
 leadNames.forEach(name=>{const opt=document.createElement("option");opt.value=name;opt.textContent="Lead "+name;select.append(opt)});
 select.value="II";
 const svg=$("focus-svg"),NS="http://www.w3.org/2000/svg";
 function el(tag){return document.createElementNS(NS,tag)}
 const path=el("path");path.setAttribute("fill","none");path.setAttribute("stroke","#633b37");path.setAttribute("stroke-width","2.4");path.setAttribute("stroke-linejoin","round");path.setAttribute("stroke-linecap","round");svg.append(path);
 const cursor=el("line");cursor.setAttribute("y1","0");cursor.setAttribute("y2","190");cursor.setAttribute("stroke","#ad7545");cursor.setAttribute("stroke-width","2");svg.append(cursor);
 const c1=el("line"),c2=el("line");
 [c1,c2].forEach(l=>{l.setAttribute("y1","0");l.setAttribute("y2","190");l.setAttribute("stroke","#44728c");l.setAttribute("stroke-width","2");l.setAttribute("stroke-dasharray","5 4");svg.append(l)});
 const labels={I:"LA − RA",II:"LL − RA",III:"LL − LA",aVR:"RA − (LA + LL)/2",aVL:"LA − (RA + LL)/2",aVF:"LL − (RA + LA)/2",V1:"V1 − WCT",V2:"V2 − WCT",V3:"V3 − WCT",V4:"V4 − WCT",V5:"V5 − WCT",V6:"V6 − WCT"};
 const cycles=3,W=960;
 const clamp=x=>Math.max(0,Math.min(1,x));
 let markers=[.3,.46],activeMarker=0;
 function mode(){return document.getElementById("rhythm-mode")?.value||"sinus";}
 function windowSeconds(){return mode()==="sinus"?cycles*60/window.MedicLabAPI.getBpm():10;}
 function valueFor(x){return window.MedicRhythm.sample(x*windowSeconds(),window.MedicLabAPI.getBpm(),mode())[select.value]}
 function draw(){
   window.MedicECGPaperGrid(svg,W,windowSeconds());
   const lines=[];
   for(let i=0;i<=W;i++){
     const v=valueFor(i/W);
     const y=95-v*62;
     lines.push((i===0?"M":"L")+i+" "+Math.max(2,Math.min(188,y)).toFixed(2));
   }
   path.setAttribute("d",lines.join(" "));
   $("lead-formula").textContent=labels[select.value]+"  •  WCT = (RA + LA + LL)/3  •  "+(mode()==="sinus"?"Three illustrative sinus beats":"10-second "+mode().toUpperCase()+" demonstration");
   [c1,c2].forEach((c,i)=>{c.setAttribute("x1",String(markers[i]*W));c.setAttribute("x2",String(markers[i]*W))});
   const seconds=markers.map(p=>p*windowSeconds());
   $("caliper-result").textContent="Δt = "+Math.abs(seconds[1]-seconds[0]).toFixed(3)+" s (illustrative timing)";
 }
 select.addEventListener("change",draw);
 const inputA=$("marker-a"),inputB=$("marker-b");
 function syncInputs(){
  markers=[clamp(Number(inputA.value)),clamp(Number(inputB.value))];
  draw();
 }
 inputA.addEventListener("input",syncInputs);
 inputB.addEventListener("input",syncInputs);
 svg.addEventListener("pointerdown",e=>{
   const rect=svg.getBoundingClientRect();
   const x=clamp((e.clientX-rect.left)/rect.width);
   const a=Math.abs(x-markers[0]),b=Math.abs(x-markers[1]);
   activeMarker=a<=b?0:1;
   svg.setPointerCapture(e.pointerId);
   move(e);
 });
 function move(e){
   if(!svg.hasPointerCapture(e.pointerId))return;
   const rect=svg.getBoundingClientRect();
   markers[activeMarker]=clamp((e.clientX-rect.left)/rect.width);
   inputA.value=String(markers[0]);inputB.value=String(markers[1]);draw();
 }
 svg.addEventListener("pointermove",move);
 window.MedicLabTools={
   update(phase){
     const elapsed=(window.MedicLabState?.rhythm?.seconds||0);
     const x=(mode()==="sinus"?(1+phase)/cycles:((elapsed%10)+10)%10/10)*W;
     cursor.setAttribute("x1",String(x));cursor.setAttribute("x2",String(x));
   },
   redraw:draw
 };
 $("jump-p").onclick=()=>window.MedicLabAPI.seek(.17);
 $("jump-qrs").onclick=()=>window.MedicLabAPI.seek(.382);
 $("jump-t").onclick=()=>window.MedicLabAPI.seek(.66);
 window.addEventListener("medic-bpm-change",draw);
 document.getElementById("rhythm-mode")?.addEventListener("change",()=>{
  const sinus=mode()==="sinus";
  ["jump-p","jump-qrs","jump-t"].forEach(id=>{$(id).disabled=!sinus;$(id).title=sinus?"Jump to example phase":"Phase jump available for sinus rhythm only";});
  draw();
 });
 draw();
})();
