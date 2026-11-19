/* Medic Goats ECG Lab: local-only clinical ECG recording preview.
   This viewer NEVER uploads recordings and NEVER claims clinical validation.
   Files must contain de-identified, licensed samples in mV. */
(function(){
"use strict";
const L=["I","II","III","aVR","aVL","aVF","V1","V2","V3","V4","V5","V6"];
const $=id=>document.getElementById(id);
const host=$("reference-ecg");if(!host)return;
const svgNS="http://www.w3.org/2000/svg";
const el=t=>document.createElementNS(svgNS,t);
const grid=$("reference-leads");
const paths={};
const printOrder=["I","aVR","V1","V4","II","aVL","V2","V5","III","aVF","V3","V6"];
printOrder.forEach(lead=>{
 const cell=document.createElement("div");cell.className="reference-cell";
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
const rhythmPath=el("path");rhythmSvg.appendChild(rhythmPath);rhythmCell.appendChild(rhythmSvg);rhythmHost.appendChild(rhythmCell);
let recording=null;
window.MedicECGReference={getRecording:()=>recording};
function fail(message){$("reference-status").textContent="Cannot load recording: "+message;$("reference-status").dataset.state="error";$("reference-metadata").textContent="No clinical recording loaded.";}
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
function render(){
 if(!recording)return;
 const start=Number($("reference-position").value);
 const seconds=Math.min(2,recording.seconds);
 const samples=Math.floor(seconds*recording.hz);
 const index=Math.round(start*recording.hz);
 const W=420;
 for(const lead of L){
  const arr=recording.waveforms[lead];
  const d=[];
  const limit=Math.min(samples,arr.length-index);
  const stride=Math.max(1,Math.ceil(limit/2000));
  for(let i=0;i<limit;i+=stride){
   const x=i/Math.max(1,samples-1)*W;
   const y=Math.max(-1000,Math.min(1000,58-arr[index+i]*25));
   d.push((d.length?"L":"M")+x.toFixed(2)+" "+y.toFixed(2));
  }
  paths[lead].setAttribute("d",d.join(" "));
 }
 const label=rhythmSelect.value;
 const arr=recording.waveforms[label];
 const rhythmSamples=Math.min(Math.floor(10*recording.hz),arr.length-index);
 const d=[],stride=Math.max(1,Math.ceil(rhythmSamples/3000));
 for(let i=0;i<rhythmSamples;i+=stride){
   const x=i/Math.max(1,rhythmSamples-1)*960;
   const y=Math.max(-1000,Math.min(1000,44-arr[index+i]*25));
   d.push((d.length?"L":"M")+x.toFixed(2)+" "+y.toFixed(2));
 }
 rhythmPath.setAttribute("d",d.join(" "));
 rhythmHeading.textContent="Lead "+label;
 rhythmSvg.setAttribute("aria-label","Imported full-width lead "+label+" rhythm strip");
 $("reference-time").textContent=start.toFixed(2)+"–"+Math.min(recording.seconds,start+seconds).toFixed(2)+" s";
 if(window.MedicECGPrint)window.MedicECGPrint.render(recording);
}
function applyRecording(raw,origin){
 const result=validate(raw);
 recording=result;
 const max=Math.max(0,recording.seconds-Math.min(2,recording.seconds));
 $("reference-position").max=String(max);$("reference-position").value="0";
 $("reference-status").dataset.state="ready";
 $("reference-status").textContent=(result.synthetic?"SYNTHETIC EXAMPLE — NOT A PATIENT ECG • ":"")+origin+" • "+(result.synthetic?"Illustrative waveform; not diagnostic or clinical validation.":result.validated?"Source marks record reviewed; independently verify before teaching.":"Source not marked reviewed — verify before teaching.");
 $("reference-metadata").textContent=result.source.dataset+" • Record "+result.source.recordId+" • "+recording.hz+" Hz • "+recording.seconds+" s • mV • License: "+result.source.license+" • Citation: "+result.source.citation;
 render();
}
window.MedicECGReference.loadObject=(raw,origin="Library recording")=>applyRecording(raw,origin);
async function loadFile(file){
 if(!file)return;
 if(file.size>8*1024*1024){fail("File is larger than 8 MB.");return;}
 if(!/\.json$/i.test(file.name)){fail("Select a .json file.");return;}
 $("reference-status").textContent="Reading local file…";$("reference-status").dataset.state="loading";
 try{applyRecording(JSON.parse(await file.text()),"Loaded locally")}
 catch(e){fail(e&&e.message?e.message:"Invalid recording file.")}
}
$("reference-file").addEventListener("change",e=>loadFile(e.target.files&&e.target.files[0]));
$("reference-position").addEventListener("input",render);
rhythmSelect.addEventListener("change",()=>{if(recording)render();else rhythmHeading.textContent="Lead "+rhythmSelect.value});
$("reference-reset").addEventListener("click",()=>{
 recording=null;$("ecg-print-area").replaceChildren();$("paper-summary").textContent="Load a clinical recording to enable paper preview";$("reference-file").value="";$("reference-position").value="0";
 $("reference-time").textContent="No recording";
 $("reference-status").textContent="No clinical recording loaded. Illustrative simulator remains available above.";
 $("reference-status").dataset.state="idle";$("reference-metadata").textContent="Use only de-identified, appropriately licensed waveform data.";
 Object.values(paths).forEach(path=>path.setAttribute("d",""));
 rhythmPath.setAttribute("d","");
});
})();
