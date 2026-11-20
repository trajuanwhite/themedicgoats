(function(){
"use strict";
const L=["I","II","III","aVR","aVL","aVF","V1","V2","V3","V4","V5","V6"];
const $=id=>document.getElementById(id);
const host=$("reference-ecg");if(!host)return;
const svgNS="http://www.w3.org/2000/svg";
const el=t=>document.createElementNS(svgNS,t);
const grid=$("reference-leads");
const paths={},leadButtons={};
const printOrder=["I","aVR","V1","V4","II","aVL","V2","V5","III","aVF","V3","V6"];
printOrder.forEach(lead=>{
 const cell=document.createElement("button");cell.className="reference-cell";
 cell.type="button";
 cell.setAttribute("aria-label","Show lead "+lead+" in the full-width rhythm strip");
 cell.setAttribute("aria-pressed",String(lead==="II"));
 cell.addEventListener("click",()=>{
  rhythmSelect.value=lead;
  updateRhythmLead();
 });
 leadButtons[lead]=cell;
 const heading=document.createElement("strong");heading.textContent="Lead "+lead;cell.appendChild(heading);
 const svg=el("svg");svg.setAttribute("viewBox","0 0 420 116");svg.setAttribute("role","img");svg.setAttribute("aria-label","Loaded lead "+lead+" waveform");
 const baseline=el("line");baseline.setAttribute("x1","0");baseline.setAttribute("x2","420");baseline.setAttribute("y1","58");baseline.setAttribute("y2","58");baseline.setAttribute("stroke","#dfbcb9");baseline.setAttribute("stroke-width","1");svg.appendChild(baseline);
 const path=el("path");path.setAttribute("fill","none");path.setAttribute("stroke","#6b3630");path.setAttribute("stroke-width","1.6");path.setAttribute("stroke-linejoin","round");svg.appendChild(path);
 paths[lead]=path;cell.appendChild(svg);grid.appendChild(cell);
});
const rhythmSelect=$("reference-rhythm-lead"),rhythmHost=$("reference-rhythm-strips");
L.forEach(lead=>{const option=document.createElement("option");option.value=lead;option.textContent="Lead "+lead;rhythmSelect.appendChild(option)});
rhythmSelect.value="II";
const rhythmCell=document.createElement("div");rhythmCell.className="rhythm-strip";
const rhythmHeading=document.createElement("strong");rhythmHeading.textContent="Lead II";rhythmCell.appendChild(rhythmHeading);
const rhythmSvg=el("svg");rhythmSvg.setAttribute("viewBox","0 0 960 88");rhythmSvg.setAttribute("role","img");rhythmSvg.setAttribute("aria-label","Imported full-width lead II rhythm strip");
const rhythmPath=el("path");
const cursor=el("line");
cursor.setAttribute("y1","0");cursor.setAttribute("y2","88");
cursor.setAttribute("visibility","hidden");
rhythmSvg.append(rhythmPath,cursor);
rhythmCell.appendChild(rhythmSvg);rhythmHost.appendChild(rhythmCell);
let recording=null;
window.MedicECGReference={getRecording:()=>recording};
function validate(obj){
 if(!obj||typeof obj!=="object"||obj.schemaVersion!=="1.0"||!["clinical-recording","synthetic-demo"].includes(obj.kind))throw Error("Expected version 1.0 clinical recording or explicitly labeled synthetic demo.");
 const meta=obj.recording||{},source=obj.source||{};
 const hz=meta.samplingHz,seconds=meta.durationSeconds;
 if(!Number.isInteger(hz)||hz<100||hz>1000)throw Error("Sampling rate must be an integer between 100 and 1,000 Hz.");
 if(!Number.isFinite(seconds)||seconds<1||seconds>30)throw Error("Duration must be between 1 and 30 seconds.");
 if(meta.amplitudeUnit!=="mV")throw Error("Amplitude must explicitly be in mV.");
 if(!Array.isArray(meta.leads)||meta.leads.length!==12||new Set(meta.leads).size!==12||L.some(l=>!meta.leads.includes(l)))throw Error("All 12 canonical lead labels are required.");
 if(typeof source.dataset!=="string"||!source.dataset.trim()||typeof source.recordId!=="string"||!source.recordId.trim())throw Error("De-identified dataset and record identifiers are required.");
 if(typeof source.citation!=="string"||!source.citation.trim()||typeof source.license!=="string"||!source.license.trim())throw Error("Source citation and license fields are required.");
 if(!obj.waveforms||typeof obj.waveforms!=="object")throw Error("Missing waveform arrays.");
 const count=Math.round(hz*seconds);
 if(Math.abs(hz*seconds-count)>1e-7)throw Error("Duration must represent a whole number of samples.");
 const waveforms={};
 for(const label of L){
   const arr=obj.waveforms[label];
   if(!Array.isArray(arr)||arr.length!==count)throw Error("Lead "+label+" must have exactly "+count+" samples.");
   if(!arr.every(v=>typeof v==="number"&&Number.isFinite(v)&&Math.abs(v)<=30))throw Error("Lead "+label+" contains invalid or implausibly extreme mV values.");
   waveforms[label]=arr;
 }
 return {source, hz,seconds,waveforms,validated:source.validatedForTeaching===true,synthetic:obj.kind==="synthetic-demo"};
}
const position=$("reference-position"), play=$("reference-play"), restart=$("reference-restart");
let frame=0, startedAt=0, lastWindow=-1;
function renderPosition(updatePrint=false){
 if(!recording)return;
 const elapsed=Number(position.value);
 const seconds=Math.min(2,recording.seconds);
 const samples=Math.floor(seconds*recording.hz);
 const interval=Math.min(Math.floor(elapsed/seconds)*seconds,recording.seconds-seconds);
 const index=Math.round(interval*recording.hz);
 if(index!==lastWindow){
  for(const lead of L){
   const arr=recording.waveforms[lead];
   const points=[];
   for(let i=0;i<samples;i++){
    const x=i/Math.max(1,samples-1)*420;
    const y=58-arr[index+i]*25;
    points.push((i?"L":"M")+x.toFixed(2)+" "+y.toFixed(2));
   }
   paths[lead].setAttribute("d",points.join(" "));
  }
  lastWindow=index;
 }
 const x=String(elapsed/recording.seconds*960);
 cursor.setAttribute("x1",x);cursor.setAttribute("x2",x);
 $("reference-time").textContent=elapsed.toFixed(1)+" / "+recording.seconds.toFixed(1)+" s";
 if(updatePrint)window.MedicECGPrint?.render(recording);
}
function renderRhythm(){
 const label=rhythmSelect.value;
 rhythmHeading.textContent="Lead "+label;
 if(!recording)return;
 const arr=recording.waveforms[label];
 const points=[],stride=Math.max(1,Math.ceil(arr.length/3000));
 for(let i=0;i<arr.length;i+=stride){
  const x=i/Math.max(1,arr.length-1)*960;
  const y=44-arr[i]*25;
  points.push((i?"L":"M")+x.toFixed(2)+" "+y.toFixed(2));
 }
 rhythmPath.setAttribute("d",points.join(" "));
 rhythmSvg.setAttribute("aria-label","Lead "+label+" recording with playback cursor");
}
function pause(){
 cancelAnimationFrame(frame);
 frame=0;
 play.textContent="Play";
}
function tick(now){
 const elapsed=Math.min(recording.seconds,(now-startedAt)/1000);
 position.value=String(elapsed);
 if(elapsed>=recording.seconds){
  pause();
  renderPosition(true);
  return;
 }
 renderPosition();
 frame=requestAnimationFrame(tick);
}
function applyRecording(raw){
 const result=validate(raw);
 pause();
 recording=result;
 lastWindow=-1;
 position.max=String(recording.seconds);
 position.value="0";
 position.disabled=play.disabled=restart.disabled=false;
 cursor.removeAttribute("visibility");
 renderRhythm();
 renderPosition(true);
}
window.MedicECGReference.loadObject=applyRecording;
play.addEventListener("click",()=>{
 if(frame){
  pause();
  renderPosition(true);
  return;
 }
 if(Number(position.value)>=recording.seconds)position.value="0";
 startedAt=performance.now()-Number(position.value)*1000;
 play.textContent="Pause";
 frame=requestAnimationFrame(tick);
});
restart.addEventListener("click",()=>{
 position.value="0";
 if(frame)startedAt=performance.now();
 renderPosition(true);
});
position.addEventListener("input",()=>{
 if(frame)startedAt=performance.now()-Number(position.value)*1000;
 renderPosition(true);
});
function updateRhythmLead(){
 for(const lead of L){
  leadButtons[lead].setAttribute("aria-pressed",String(lead===rhythmSelect.value));
 }
 renderRhythm();
 if(recording)window.MedicECGPrint?.render(recording);
}
rhythmSelect.addEventListener("change",updateRhythmLead);
})();
